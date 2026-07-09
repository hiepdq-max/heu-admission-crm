import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const failures = [];

const contractTsPath = "lib/task-center-contract.ts";
const componentPath = "components/data-confirmation/department-task-inbox.tsx";
const docPath =
  "docs/HEU_CONTROL/HEU_DATA_005_TASK_CENTER_READ_MODEL_INTERFACE_20260710.md";
const dataContractPath =
  "docs/HEU_CONTROL/HEU_DATA_004_TASK_CENTER_DATA_CONTRACT_20260710.md";
const manifestPath =
  "docs/HEU_CONTROL/HEU_APP_SHELL_001_STAGE_FILE_MANIFEST_20260709.md";
const dataContractCheckerPath =
  "scripts/check-heu-task-center-data-contract-readiness.mjs";
const checkerPath =
  "scripts/check-heu-task-center-read-model-interface-readiness.mjs";
const packagePath = "package.json";
const checkerAlias = "check:heu-task-center-read-model-interface-readiness";
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
  contractTsPath,
  componentPath,
  docPath,
  dataContractPath,
  manifestPath,
  dataContractCheckerPath,
  checkerPath,
  packagePath,
]) {
  requireFile(file);
}

if (failures.length === 0) {
  const contractTs = read(contractTsPath);
  const component = read(componentPath);
  const doc = read(docPath);
  const dataContract = read(dataContractPath);
  const manifest = read(manifestPath);
  const dataContractChecker = read(dataContractCheckerPath);
  const checkerScript = read(checkerPath);
  const packageJson = JSON.parse(read(packagePath));

  requireTokens(
    contractTs,
    [
      "TASK_CENTER_READ_MODEL_INTERFACE_CONTRACT_ONLY",
      "NO_TASK_TABLE_CREATED",
      "NO_TASK_MUTATION_ROUTE_CREATED",
      "NO_AI_CALL_NO_AUTOMATION_STEP",
      "TASK_CENTER_STATUSES",
      "TASK_CENTER_STATUS_TRANSITIONS",
      "TASK_CENTER_DEPARTMENT_CODES",
      "TASK_CENTER_SOURCE_REF_ALLOWLIST",
      "TASK_CENTER_REQUIRED_COLUMNS",
      "TASK_CENTER_ROLE_GROUPS",
      "TASK_CENTER_DEPARTMENT_LANES",
      "TaskCenterActionGateSnapshot",
      "getVisibleTaskCenterLanes",
      "getTaskCenterFallbackLane",
      "resolveTaskCenterLaneStatus",
      "DRAFT",
      "CHO_XAC_NHAN",
      "DUNG",
      "CAN_SUA",
      "KHONG_THUOC_TOI",
      "DA_KHOA",
      "DA_HUY",
      "admission_segment_id",
      "controlled_evidence_id",
      "metadata_ref",
      "hou_student_ref",
      "workspace_ref",
    ],
    "TypeScript read-model contract token",
    contractTsPath,
  );

  requireTokens(
    component,
    [
      "@/lib/task-center-contract",
      "getVisibleTaskCenterLanes",
      "getTaskCenterFallbackLane",
      "resolveTaskCenterLaneStatus",
      "TaskCenterVisibleLane",
      "HEU_TASK_CENTER_READ_MODEL_INTERFACE",
      "HEU_DEPARTMENT_TASK_INBOX_MVP",
    ],
    "component read-model wiring token",
    componentPath,
  );

  requireTokens(
    doc,
    [
      "HEU-DATA-005-TASK-CENTER-READ-MODEL-INTERFACE",
      "Status: PASS_LOCAL_READ_MODEL_INTERFACE",
      "Production status: NO-GO",
      "TASK_CENTER_READ_MODEL_INTERFACE_CONTRACT_ONLY",
      "NO_TASK_TABLE_CREATED",
      "NO_TASK_MUTATION_ROUTE_CREATED",
      "NO_AI_CALL_NO_AUTOMATION_STEP",
      "CAN_SUA_IT_DATA_AUDIT_PHAP_CHE_OWNER",
      "NO_GO` for Task Center database",
    ],
    "read-model doc token",
    docPath,
  );

  requireTokens(
    dataContract,
    [
      "HEU-DATA-005-TASK-CENTER-READ-MODEL-INTERFACE",
      "TypeScript read model interface",
      "NO_GO` for Task Center database",
    ],
    "data contract read-model link",
    dataContractPath,
  );

  requireTokens(
    manifest,
    [
      contractTsPath,
      docPath,
      checkerPath,
      "check:heu-task-center-read-model-interface-readiness",
    ],
    "manifest read-model token",
    manifestPath,
  );

  requireTokens(
    dataContractChecker,
    [
      "HEU-DATA-005-TASK-CENTER-READ-MODEL-INTERFACE",
      "check:heu-task-center-read-model-interface-readiness",
    ],
    "data contract checker read-model token",
    dataContractCheckerPath,
  );

  if (packageJson.scripts?.[checkerAlias] !== checkerCommand) {
    fail(`${packagePath}: missing or mismatched ${checkerAlias}`);
  }

  requireTokens(
    checkerScript,
    [
      "existsSync",
      "readFileSync",
      "HEU_TASK_CENTER_READ_MODEL_INTERFACE_READY: PASS_LOCAL",
      "TASK_CENTER_DATABASE_READY: NO_GO_INTERFACE_ONLY",
      "NO_RUNTIME_MUTATION: task center read-model interface checker only; no database table, SQL migration, task write, AI call, paid automation, deploy, finance action or production GO",
    ],
    "checker-script read-only token",
    checkerPath,
  );

  forbidPatterns(
    `${contractTs}\n${component}\n${doc}`,
    [
      { label: "Supabase client import", pattern: /@\/lib\/supabase/ },
      { label: "createClient", pattern: /\bcreateClient\s*\(/ },
      { label: "supabase.from", pattern: /supabase\s*\.\s*from\s*\(/ },
      { label: "insert", pattern: /\.insert\s*\(/ },
      { label: "update", pattern: /\.update\s*\(/ },
      { label: "upsert", pattern: /\.upsert\s*\(/ },
      { label: "delete", pattern: /\.delete\s*\(/ },
      { label: "fetch call", pattern: /\bfetch\s*\(/ },
      { label: "server action marker", pattern: /["']use server["']/ },
      { label: "SQL create table statement", pattern: /\bcreate\s+table\b/i },
      { label: "SQL alter table statement", pattern: /\balter\s+table\b/i },
      {
        label: "actual Supabase URL assignment",
        pattern: /NEXT_PUBLIC_SUPABASE_URL\s*=\s*\S+/,
      },
      {
        label: "actual service-role key assignment",
        pattern: /SUPABASE_SERVICE_ROLE_KEY\s*=\s*\S+/,
      },
      {
        label: "JWT-like token",
        pattern: /eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{10,}/,
      },
    ],
    "runtime data, SQL, secret or mutation API",
    "task-center read-model interface scope",
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
  console.error("HEU Task Center read-model interface readiness check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("HEU Task Center read-model interface readiness check");
console.log("HEU_TASK_CENTER_READ_MODEL_INTERFACE_READY: PASS_LOCAL");
console.log("TASK_CENTER_DATABASE_READY: NO_GO_INTERFACE_ONLY");
console.log(
  "NO_RUNTIME_MUTATION: task center read-model interface checker only; no database table, SQL migration, task write, AI call, paid automation, deploy, finance action or production GO",
);
