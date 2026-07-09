import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const failures = [];

const contractPath =
  "docs/HEU_CONTROL/HEU_DATA_004_TASK_CENTER_DATA_CONTRACT_20260710.md";
const inboxDocPath =
  "docs/HEU_CONTROL/HEU_DATA_003_DEPARTMENT_TASK_INBOX_MVP_20260710.md";
const manifestPath =
  "docs/HEU_CONTROL/HEU_APP_SHELL_001_STAGE_FILE_MANIFEST_20260709.md";
const inboxCheckerPath =
  "scripts/check-heu-department-task-inbox-mvp-readiness.mjs";
const checkerPath = "scripts/check-heu-task-center-data-contract-readiness.mjs";
const packagePath = "package.json";
const checkerAlias = "check:heu-task-center-data-contract-readiness";
const checkerCommand = `node ${checkerPath}`;

function absolute(relativePath) {
  return path.join(repoRoot, relativePath);
}

function fail(message) {
  failures.push(message);
}

function requireFile(relativePath) {
  if (!existsSync(absolute(relativePath))) {
    fail(`Missing required file: ${relativePath}`);
  }
}

function read(relativePath) {
  return readFileSync(absolute(relativePath), "utf8");
}

function requireTokens(contents, tokens, label, file) {
  for (const token of tokens) {
    if (!contents.includes(token)) {
      fail(`${file}: missing ${label}: ${token}`);
    }
  }
}

function forbidPatterns(contents, patterns, label, file) {
  for (const item of patterns) {
    if (item.pattern.test(contents)) {
      fail(`${file}: forbidden ${label}: ${item.label}`);
    }
  }
}

for (const file of [
  contractPath,
  inboxDocPath,
  manifestPath,
  inboxCheckerPath,
  checkerPath,
  packagePath,
]) {
  requireFile(file);
}

if (failures.length === 0) {
  const contract = read(contractPath);
  const inboxDoc = read(inboxDocPath);
  const manifest = read(manifestPath);
  const inboxChecker = read(inboxCheckerPath);
  const checkerScript = read(checkerPath);
  const packageJson = JSON.parse(read(packagePath));

  requireTokens(
    contract,
    [
      "HEU-DATA-004-TASK-CENTER-DATA-CONTRACT",
      "Status: PASS_LOCAL_DATA_CONTRACT",
      "Production status: NO-GO",
      "NO_EXECUTABLE_MIGRATION_CREATED",
      "NO_TASK_TABLE_CREATED",
      "NO_TASK_MUTATION_ROUTE_CREATED",
      "NO_AI_CALL_NO_AUTOMATION_STEP",
      "TASK_CENTER",
      "TASK_CENTER_EVENT_LOG",
      "TASK_CENTER_ASSIGNMENT",
      "`task_id`",
      "`department_code`",
      "`owner_role_code`",
      "`source_module`",
      "`source_ref_type`",
      "`source_ref_id`",
      "`controlled_evidence_id`",
      "`metadata_ref`",
      "DRAFT",
      "CHO_XAC_NHAN",
      "DUNG",
      "CAN_SUA",
      "KHONG_THUOC_TOI",
      "DA_KHOA",
      "DA_HUY",
      "Hard delete is not allowed",
      "HEUWorkspaceContext resolves role/workspace/scope first.",
      "No broad fallback when scope is missing.",
      "Source Ref Allowlist",
      "Forbidden in task rows",
      "AI/Codex must not",
      "No paid automation.",
      "TC-DB-01",
      "TC-DB-07",
      "TASK_CENTER_DATABASE_READY: NO_GO",
      "TASK_CENTER_PRODUCTION_READY: NO_GO",
      "CAN_SUA_IT_DATA_AUDIT_PHAP_CHE_OWNER",
    ],
    "task-center data contract token",
    contractPath,
  );

  forbidPatterns(
    contract,
    [
      {
        label: "actual Supabase URL assignment",
        pattern: /NEXT_PUBLIC_SUPABASE_URL\s*=\s*\S+/,
      },
      {
        label: "actual publishable key assignment",
        pattern: /NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY\s*=\s*\S+/,
      },
      {
        label: "actual service-role key assignment",
        pattern: /SUPABASE_SERVICE_ROLE_KEY\s*=\s*\S+/,
      },
      {
        label: "SQL create table statement",
        pattern: /\bcreate\s+table\b/i,
      },
      {
        label: "SQL alter table statement",
        pattern: /\balter\s+table\b/i,
      },
      {
        label: "SQL create policy statement",
        pattern: /\bcreate\s+policy\b/i,
      },
      {
        label: "JWT-like token",
        pattern: /eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{10,}/,
      },
    ],
    "secret or executable SQL material",
    contractPath,
  );

  requireTokens(
    inboxDoc,
    [
      "HEU-DATA-004-TASK-CENTER-DATA-CONTRACT",
      "Task Center data contract before any task mutation",
      "NO_GO` for production Task Center",
    ],
    "inbox doc data-contract link",
    inboxDocPath,
  );

  requireTokens(
    manifest,
    [
      contractPath,
      checkerPath,
      "check:heu-task-center-data-contract-readiness",
    ],
    "manifest data-contract token",
    manifestPath,
  );

  requireTokens(
    inboxChecker,
    [
      "HEU-DATA-004-TASK-CENTER-DATA-CONTRACT",
      "check:heu-task-center-data-contract-readiness",
    ],
    "inbox checker data-contract token",
    inboxCheckerPath,
  );

  if (packageJson.scripts?.[checkerAlias] !== checkerCommand) {
    fail(`${packagePath}: missing or mismatched ${checkerAlias}`);
  }

  requireTokens(
    checkerScript,
    [
      "existsSync",
      "readFileSync",
      "HEU_TASK_CENTER_DATA_CONTRACT_READY: PASS_LOCAL",
      "TASK_CENTER_DATABASE_READY: NO_GO_CONTRACT_ONLY",
      "NO_RUNTIME_CHANGE: task center data contract checker only; no table creation, SQL migration, task mutation, AI call, paid automation, deploy, finance action or production GO",
    ],
    "checker-script read-only token",
    checkerPath,
  );

  forbidPatterns(
    checkerScript,
    [
      { label: "node child_process import", pattern: /from\s+["']node:child_process["']/ },
      { label: "child_process import", pattern: /from\s+["']child_process["']/ },
      { label: "execSync call", pattern: /\bexecSync\s*\(/ },
      { label: "spawn call", pattern: /\bspawn\s*\(/ },
      { label: "writeFileSync call", pattern: /\bwriteFileSync\s*\(/ },
      { label: "appendFileSync call", pattern: /\bappendFileSync\s*\(/ },
      { label: "unlinkSync call", pattern: /\bunlinkSync\s*\(/ },
      { label: "rmSync call", pattern: /\brmSync\s*\(/ },
      { label: "renameSync call", pattern: /\brenameSync\s*\(/ },
      { label: "mkdirSync call", pattern: /\bmkdirSync\s*\(/ },
    ],
    "mutation or command-execution API",
    checkerPath,
  );
}

if (failures.length > 0) {
  console.error("HEU Task Center data contract readiness check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("HEU Task Center data contract readiness check");
console.log("HEU_TASK_CENTER_DATA_CONTRACT_READY: PASS_LOCAL");
console.log("TASK_CENTER_DATABASE_READY: NO_GO_CONTRACT_ONLY");
console.log(
  "NO_RUNTIME_CHANGE: task center data contract checker only; no table creation, SQL migration, task mutation, AI call, paid automation, deploy, finance action or production GO",
);
