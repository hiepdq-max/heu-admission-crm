import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const failures = [];

const componentPath = "components/data-confirmation/department-task-inbox.tsx";
const panelSourcePath = "lib/task-center-gate-evidence-panel-source.ts";
const enablementGatePath = "lib/task-center-readonly-adapter-enablement-gate.ts";
const docPath =
  "docs/HEU_CONTROL/HEU_DATA_025_TASK_CENTER_ADAPTER_DRY_RUN_STATIC_NEGATIVE_ACCESS_PACKET_20260710.md";
const readinessReviewDocPath =
  "docs/HEU_CONTROL/HEU_DATA_024_TASK_CENTER_ADAPTER_DRY_RUN_READINESS_REVIEW_20260710.md";
const manifestPath =
  "docs/HEU_CONTROL/HEU_APP_SHELL_001_STAGE_FILE_MANIFEST_20260709.md";
const readinessReviewCheckerPath =
  "scripts/check-heu-task-center-adapter-dry-run-readiness-review.mjs";
const checkerPath =
  "scripts/check-heu-task-center-adapter-dry-run-static-negative-access-packet.mjs";
const packagePath = "package.json";
const checkerAlias =
  "check:heu-task-center-adapter-dry-run-static-negative-access-packet";
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
  componentPath,
  panelSourcePath,
  enablementGatePath,
  docPath,
  readinessReviewDocPath,
  manifestPath,
  readinessReviewCheckerPath,
  checkerPath,
  packagePath,
]) {
  requireFile(file);
}

if (failures.length === 0) {
  const component = read(componentPath);
  const panelSource = read(panelSourcePath);
  const enablementGate = read(enablementGatePath);
  const doc = read(docPath);
  const readinessReviewDoc = read(readinessReviewDocPath);
  const manifest = read(manifestPath);
  const readinessReviewChecker = read(readinessReviewCheckerPath);
  const checkerScript = read(checkerPath);
  const packageJson = JSON.parse(read(packagePath));

  requireTokens(
    enablementGate,
    [
      "TASK_CENTER_ADAPTER_ENABLEMENT_OWNER_REVIEW_REQUIRED",
      "TASK_CENTER_ADAPTER_ENABLEMENT_DEFAULT_NO_GO",
      "IT_DATA_SCOPE_FIRST_FILTER_SIGNOFF",
      "AUDIT_NEGATIVE_ACCESS_EVIDENCE",
      "PHAP_CHE_RESTRICTED_DATA_BOUNDARY_SIGNOFF",
      "DEPARTMENT_OWNER_TASK_LABEL_ACCEPTANCE",
      "BGH_PRODUCTION_NO_GO_ACKNOWLEDGEMENT",
      "BACKUP_ROLLBACK_UAT_EVIDENCE_BEFORE_DB_READ",
    ],
    "enablement gate prerequisite token",
    enablementGatePath,
  );

  requireTokens(
    panelSource,
    [
      "TASK_CENTER_ADAPTER_DRY_RUN_STATIC_NEGATIVE_ACCESS_PACKET_ONLY",
      "TASK_CENTER_ADAPTER_DRY_RUN_STATIC_NEGATIVE_ACCESS_PACKET_READONLY",
      "TASK_CENTER_ADAPTER_DRY_RUN_STATIC_NEGATIVE_ACCESS_PACKET_DRAFT_ONLY",
      "TASK_CENTER_ADAPTER_DRY_RUN_STATIC_NEGATIVE_ACCESS_PACKET_NO_APPROVAL",
      "TASK_CENTER_ADAPTER_DRY_RUN_STATIC_NEGATIVE_ACCESS_PACKET_NO_DATABASE_READ",
      "TASK_CENTER_ADAPTER_DRY_RUN_STATIC_NEGATIVE_ACCESS_PACKET_NO_DATABASE_CLIENT",
      "TASK_CENTER_ADAPTER_DRY_RUN_STATIC_NEGATIVE_ACCESS_PACKET_NO_ENV_ENABLEMENT",
      "TASK_CENTER_ADAPTER_DRY_RUN_STATIC_NEGATIVE_ACCESS_PACKET_NO_TASK_MUTATION",
      "TASK_CENTER_ADAPTER_DRY_RUN_STATIC_NEGATIVE_ACCESS_PACKET_NO_REAL_DATA",
      "TASK_CENTER_ADAPTER_DRY_RUN_STATIC_NEGATIVE_ACCESS_PACKET_NO_AI_OR_AUTOMATION",
      "TaskCenterAdapterDryRunStaticNegativeAccessPacketItem",
      "adapterDryRunStaticNegativeAccessPacketItems",
      "NEGATIVE_ACCESS_PACKET_READY: PASS_LOCAL_PACKET_ONLY",
      "TASK_CENTER_DATABASE_READY: NO_GO_STATIC_NEGATIVE_ACCESS_PACKET_ONLY",
      "NEG_ACCESS_NO_WORKSPACE_SCOPE",
      "NEG_ACCESS_WRONG_DEPARTMENT",
      "NEG_ACCESS_NO_READ_PERMISSION",
      "NEG_ACCESS_RESTRICTED_DATA_ALLOWLIST",
      "NEG_ACCESS_GLOBAL_CONFIRM_BYPASS",
      "IT_DATA_WORKSPACE_SCOPE_DENIAL_PROOF",
      "DEPARTMENT_OWNER_WRONG_DEPARTMENT_DENIAL_PROOF",
      "IT_DATA_PERMISSION_DENIAL_PROOF",
      "PHAP_CHE_RESTRICTED_DATA_ALLOWLIST_PROOF",
      "AUDIT_GLOBAL_BYPASS_DENIAL_PROOF",
      "BLOCKED_NO_VISIBLE_ROWS",
      "BLOCKED_DEPARTMENT_SCOPE_MISMATCH",
      "BLOCKED_DATA_CONFIRMATION_READ_REQUIRED",
      "BLOCKED_NO_RAW_PII_NO_PAYMENT_DATA",
      "BLOCKED_NO_GLOBAL_CONFIRM_PERMISSION_BYPASS",
      "NO_DATABASE_READ_EXECUTED",
      "NO_TASK_MUTATION_ROUTE_CREATED",
      "NO_RAW_PII_NO_PAYMENT_DATA",
      "NO_BROAD_ACCESS_PROOF_MISSING",
    ],
    "static negative-access packet source token",
    panelSourcePath,
  );

  requireTokens(
    component,
    [
      "TASK_CENTER_ADAPTER_DRY_RUN_STATIC_NEGATIVE_ACCESS_PACKET_ONLY",
      "TASK_CENTER_ADAPTER_DRY_RUN_STATIC_NEGATIVE_ACCESS_PACKET_READONLY",
      "TASK_CENTER_ADAPTER_DRY_RUN_STATIC_NEGATIVE_ACCESS_PACKET_DRAFT_ONLY",
      "TASK_CENTER_ADAPTER_DRY_RUN_STATIC_NEGATIVE_ACCESS_PACKET_NO_APPROVAL",
      "TASK_CENTER_ADAPTER_DRY_RUN_STATIC_NEGATIVE_ACCESS_PACKET_NO_DATABASE_READ",
      "TASK_CENTER_ADAPTER_DRY_RUN_STATIC_NEGATIVE_ACCESS_PACKET_NO_DATABASE_CLIENT",
      "TASK_CENTER_ADAPTER_DRY_RUN_STATIC_NEGATIVE_ACCESS_PACKET_NO_ENV_ENABLEMENT",
      "TASK_CENTER_ADAPTER_DRY_RUN_STATIC_NEGATIVE_ACCESS_PACKET_NO_TASK_MUTATION",
      "TASK_CENTER_ADAPTER_DRY_RUN_STATIC_NEGATIVE_ACCESS_PACKET_NO_REAL_DATA",
      "TASK_CENTER_ADAPTER_DRY_RUN_STATIC_NEGATIVE_ACCESS_PACKET_NO_AI_OR_AUTOMATION",
      "data-heu-task-center-adapter-dry-run-static-negative-access-packet",
      "data-heu-task-center-adapter-dry-run-static-negative-access-packet-readonly",
      "data-heu-task-center-adapter-dry-run-static-negative-access-packet-draft-only",
      "data-heu-task-center-adapter-dry-run-static-negative-access-packet-no-approval",
      "data-heu-task-center-adapter-dry-run-static-negative-access-packet-no-database-read",
      "data-heu-task-center-adapter-dry-run-static-negative-access-packet-no-database-client",
      "data-heu-task-center-adapter-dry-run-static-negative-access-packet-no-env-enablement",
      "data-heu-task-center-adapter-dry-run-static-negative-access-packet-no-task-mutation",
      "data-heu-task-center-adapter-dry-run-static-negative-access-packet-no-real-data",
      "data-heu-task-center-adapter-dry-run-static-negative-access-packet-no-ai-or-automation",
      "data-heu-task-center-adapter-dry-run-static-negative-access-packet-item",
      "data-heu-task-center-adapter-dry-run-static-negative-access-packet-reviewer",
      "data-heu-task-center-adapter-dry-run-static-negative-access-packet-required",
      "data-heu-task-center-adapter-dry-run-static-negative-access-packet-expected",
      "data-heu-task-center-adapter-dry-run-static-negative-access-packet-stop-rule",
      "HEU-Data-025 - Static negative-access packet",
      "Cac case chan truy cap truoc dry-run adapter",
      "gateEvidence.adapterDryRunStaticNegativeAccessPacket.items.map",
      "gateEvidence.adapterDryRunStaticNegativeAccessPacket.result",
    ],
    "component static negative-access packet token",
    componentPath,
  );

  requireTokens(
    doc,
    [
      "HEU-DATA-025-TASK-CENTER-ADAPTER-DRY-RUN-STATIC-NEGATIVE-ACCESS-PACKET",
      "Status: PASS_LOCAL_PACKET_ONLY",
      "Production status: NO-GO",
      "Runtime status: NEGATIVE_ACCESS_PACKET_READY: PASS_LOCAL_PACKET_ONLY",
      "Database status: TASK_CENTER_DATABASE_READY: NO_GO_STATIC_NEGATIVE_ACCESS_PACKET_ONLY",
      "TASK_CENTER_ADAPTER_DRY_RUN_STATIC_NEGATIVE_ACCESS_PACKET_ONLY",
      "TASK_CENTER_ADAPTER_DRY_RUN_STATIC_NEGATIVE_ACCESS_PACKET_READONLY",
      "TASK_CENTER_ADAPTER_DRY_RUN_STATIC_NEGATIVE_ACCESS_PACKET_DRAFT_ONLY",
      "TASK_CENTER_ADAPTER_DRY_RUN_STATIC_NEGATIVE_ACCESS_PACKET_NO_APPROVAL",
      "TASK_CENTER_ADAPTER_DRY_RUN_STATIC_NEGATIVE_ACCESS_PACKET_NO_DATABASE_READ",
      "TASK_CENTER_ADAPTER_DRY_RUN_STATIC_NEGATIVE_ACCESS_PACKET_NO_DATABASE_CLIENT",
      "TASK_CENTER_ADAPTER_DRY_RUN_STATIC_NEGATIVE_ACCESS_PACKET_NO_ENV_ENABLEMENT",
      "TASK_CENTER_ADAPTER_DRY_RUN_STATIC_NEGATIVE_ACCESS_PACKET_NO_TASK_MUTATION",
      "TASK_CENTER_ADAPTER_DRY_RUN_STATIC_NEGATIVE_ACCESS_PACKET_NO_REAL_DATA",
      "TASK_CENTER_ADAPTER_DRY_RUN_STATIC_NEGATIVE_ACCESS_PACKET_NO_AI_OR_AUTOMATION",
      "NO_DATABASE_CLIENT_CREATED",
      "NO_DATABASE_READ_EXECUTED",
      "NO_ENV_ENABLEMENT",
      "NO_TASK_MUTATION_ROUTE_CREATED",
      "NO_REAL_USER_DATA",
      "NO_AI_CALL_NO_AUTOMATION_STEP",
      "NEG_ACCESS_NO_WORKSPACE_SCOPE",
      "NEG_ACCESS_WRONG_DEPARTMENT",
      "NEG_ACCESS_NO_READ_PERMISSION",
      "NEG_ACCESS_RESTRICTED_DATA_ALLOWLIST",
      "NEG_ACCESS_GLOBAL_CONFIRM_BYPASS",
      "HEU-DATA-026-TASK-CENTER-ADAPTER-DRY-RUN-READONLY-TEST-HARNESS-DESIGN",
      "check:heu-task-center-adapter-dry-run-static-negative-access-packet",
    ],
    "static negative-access packet doc token",
    docPath,
  );

  requireTokens(
    readinessReviewDoc,
    [
      "HEU-DATA-025-TASK-CENTER-ADAPTER-DRY-RUN-STATIC-NEGATIVE-ACCESS-PACKET",
      "static negative-access packet",
      "NEGATIVE_ACCESS_PACKET_READY: PASS_LOCAL_PACKET_ONLY",
      "check:heu-task-center-adapter-dry-run-static-negative-access-packet",
    ],
    "readiness review next-slice token",
    readinessReviewDocPath,
  );

  requireTokens(
    manifest,
    [
      componentPath,
      panelSourcePath,
      enablementGatePath,
      docPath,
      readinessReviewDocPath,
      checkerPath,
      readinessReviewCheckerPath,
      "check:heu-task-center-adapter-dry-run-static-negative-access-packet",
      "node --check scripts/check-heu-task-center-adapter-dry-run-static-negative-access-packet.mjs",
      "npm.cmd run check:heu-task-center-adapter-dry-run-static-negative-access-packet",
    ],
    "manifest static negative-access packet token",
    manifestPath,
  );

  requireTokens(
    readinessReviewChecker,
    [
      "HEU-DATA-025-TASK-CENTER-ADAPTER-DRY-RUN-STATIC-NEGATIVE-ACCESS-PACKET",
      "check:heu-task-center-adapter-dry-run-static-negative-access-packet",
      docPath,
      checkerPath,
    ],
    "readiness review checker next-slice token",
    readinessReviewCheckerPath,
  );

  if (packageJson.scripts?.[checkerAlias] !== checkerCommand) {
    fail(`${packagePath}: missing or mismatched ${checkerAlias}`);
  }

  requireTokens(
    checkerScript,
    [
      "existsSync",
      "readFileSync",
      "HEU_TASK_CENTER_ADAPTER_DRY_RUN_STATIC_NEGATIVE_ACCESS_PACKET_READY: PASS_LOCAL",
      "TASK_CENTER_DATABASE_READY: NO_GO_STATIC_NEGATIVE_ACCESS_PACKET_ONLY",
      "NO_RUNTIME_MUTATION: task center adapter dry-run static negative-access packet checker only; no owner approval, database client, database read, env enablement, table creation, SQL migration, task write, file upload, storage write, real-data fixture, AI call, paid automation, deploy, finance action or production GO",
    ],
    "checker-script read-only token",
    checkerPath,
  );

  forbidPatterns(
    `${enablementGate}\n${panelSource}\n${component}\n${doc}`,
    [
      { label: "Supabase client import", pattern: /@\/lib\/supabase/ },
      { label: "createClient", pattern: /\bcreateClient\s*\(/ },
      { label: "supabase.from", pattern: /supabase\s*\.\s*from\s*\(/ },
      { label: "database select call", pattern: /\.select\s*\(/ },
      { label: "insert", pattern: /\.insert\s*\(/ },
      { label: "update", pattern: /\.update\s*\(/ },
      { label: "upsert", pattern: /\.upsert\s*\(/ },
      { label: "delete", pattern: /\.delete\s*\(/ },
      { label: "fetch call", pattern: /\bfetch\s*\(/ },
      { label: "file input", pattern: /type=["']file["']/ },
      { label: "upload wording as action", pattern: /\bupload\s*\(/i },
      { label: "storage write", pattern: /\bstorage\s*\.\s*from\b/i },
      { label: "server action marker", pattern: /["']use server["']/ },
      { label: "SQL create table statement", pattern: /\bcreate\s+table\b/i },
      { label: "SQL alter table statement", pattern: /\balter\s+table\b/i },
      { label: "SQL migration folder", pattern: /\bmigrations?\//i },
      { label: "approved owner lane", pattern: /:\s*["']DAT_CHINH_THUC["']/ },
      { label: "enabled true gate", pattern: /\benabled\s*:\s*true\b/ },
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
    "runtime DB, SQL, upload, storage, secret, approval or mutation API",
    "task-center adapter dry-run static negative-access packet scope",
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
  console.error(
    "HEU Task Center adapter dry-run static negative-access packet check failed:",
  );
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("HEU Task Center adapter dry-run static negative-access packet check");
console.log(
  "HEU_TASK_CENTER_ADAPTER_DRY_RUN_STATIC_NEGATIVE_ACCESS_PACKET_READY: PASS_LOCAL",
);
console.log(
  "TASK_CENTER_DATABASE_READY: NO_GO_STATIC_NEGATIVE_ACCESS_PACKET_ONLY",
);
console.log(
  "NO_RUNTIME_MUTATION: task center adapter dry-run static negative-access packet checker only; no owner approval, database client, database read, env enablement, table creation, SQL migration, task write, file upload, storage write, real-data fixture, AI call, paid automation, deploy, finance action or production GO",
);
