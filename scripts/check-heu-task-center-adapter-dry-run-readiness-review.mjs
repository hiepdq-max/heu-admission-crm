import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const failures = [];

const componentPath = "components/data-confirmation/department-task-inbox.tsx";
const panelSourcePath = "lib/task-center-gate-evidence-panel-source.ts";
const enablementGatePath = "lib/task-center-readonly-adapter-enablement-gate.ts";
const docPath =
  "docs/HEU_CONTROL/HEU_DATA_024_TASK_CENTER_ADAPTER_DRY_RUN_READINESS_REVIEW_20260710.md";
const envGateLedgerDocPath =
  "docs/HEU_CONTROL/HEU_DATA_023_TASK_CENTER_DRY_RUN_ENV_GATE_LEDGER_20260710.md";
const manifestPath =
  "docs/HEU_CONTROL/HEU_APP_SHELL_001_STAGE_FILE_MANIFEST_20260709.md";
const envGateLedgerCheckerPath =
  "scripts/check-heu-task-center-dry-run-env-gate-ledger-readiness.mjs";
const checkerPath =
  "scripts/check-heu-task-center-adapter-dry-run-readiness-review.mjs";
const staticNegativeAccessPacketDocPath =
  "docs/HEU_CONTROL/HEU_DATA_025_TASK_CENTER_ADAPTER_DRY_RUN_STATIC_NEGATIVE_ACCESS_PACKET_20260710.md";
const staticNegativeAccessPacketCheckerPath =
  "scripts/check-heu-task-center-adapter-dry-run-static-negative-access-packet.mjs";
const packagePath = "package.json";
const checkerAlias =
  "check:heu-task-center-adapter-dry-run-readiness-review";
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
  envGateLedgerDocPath,
  manifestPath,
  envGateLedgerCheckerPath,
  checkerPath,
  staticNegativeAccessPacketDocPath,
  staticNegativeAccessPacketCheckerPath,
  packagePath,
]) {
  requireFile(file);
}

if (failures.length === 0) {
  const component = read(componentPath);
  const panelSource = read(panelSourcePath);
  const enablementGate = read(enablementGatePath);
  const doc = read(docPath);
  const envGateLedgerDoc = read(envGateLedgerDocPath);
  const manifest = read(manifestPath);
  const envGateLedgerChecker = read(envGateLedgerCheckerPath);
  const checkerScript = read(checkerPath);
  const staticNegativeAccessPacketDoc = read(staticNegativeAccessPacketDocPath);
  const staticNegativeAccessPacketChecker = read(
    staticNegativeAccessPacketCheckerPath,
  );
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
      "TASK_CENTER_ADAPTER_DRY_RUN_READINESS_REVIEW_ONLY",
      "TASK_CENTER_ADAPTER_DRY_RUN_READINESS_REVIEW_READONLY",
      "TASK_CENTER_ADAPTER_DRY_RUN_READINESS_REVIEW_DRAFT_ONLY",
      "TASK_CENTER_ADAPTER_DRY_RUN_READINESS_REVIEW_NO_APPROVAL",
      "TASK_CENTER_ADAPTER_DRY_RUN_READINESS_REVIEW_NO_DATABASE_READ",
      "TASK_CENTER_ADAPTER_DRY_RUN_READINESS_REVIEW_NO_DATABASE_CLIENT",
      "TASK_CENTER_ADAPTER_DRY_RUN_READINESS_REVIEW_NO_ENV_ENABLEMENT",
      "TASK_CENTER_ADAPTER_DRY_RUN_READINESS_REVIEW_NO_TASK_MUTATION",
      "TASK_CENTER_ADAPTER_DRY_RUN_READINESS_REVIEW_NO_REAL_DATA",
      "TASK_CENTER_ADAPTER_DRY_RUN_READINESS_REVIEW_NO_AI_OR_AUTOMATION",
      "TaskCenterAdapterDryRunReadinessReviewItem",
      "adapterDryRunReadinessReviewItems",
      "DRY_RUN_ADAPTER_READY: NO_GO_REVIEW_ONLY",
      "TASK_CENTER_DATABASE_READY: NO_GO_DRY_RUN_READINESS_REVIEW_ONLY",
      "DRY_RUN_READINESS_SCOPE_FIRST_FILTER",
      "DRY_RUN_READINESS_NEGATIVE_ACCESS",
      "DRY_RUN_READINESS_RESTRICTED_DATA_BOUNDARY",
      "DRY_RUN_READINESS_DEPARTMENT_LABEL_ACCEPTANCE",
      "DRY_RUN_READINESS_PRODUCTION_NO_GO",
      "readinessState: \"BLOCKED_REQUIRES_OWNER_SIGNOFF\"",
      "requiredEvidenceCode: \"IT_DATA_SCOPE_FIRST_FILTER_SIGNOFF\"",
      "requiredEvidenceCode: \"AUDIT_NEGATIVE_ACCESS_EVIDENCE\"",
      "requiredEvidenceCode: \"PHAP_CHE_RESTRICTED_DATA_BOUNDARY_SIGNOFF\"",
      "requiredEvidenceCode: \"DEPARTMENT_OWNER_TASK_LABEL_ACCEPTANCE\"",
      "requiredEvidenceCode: \"BGH_PRODUCTION_NO_GO_ACKNOWLEDGEMENT\"",
      "stopRule: \"NO_DATABASE_READ_EXECUTED\"",
      "stopRule: \"NO_BROAD_ACCESS_PROOF_MISSING\"",
      "stopRule: \"NO_RAW_PII_NO_PAYMENT_DATA\"",
      "stopRule: \"NO_TASK_MUTATION_ROUTE_CREATED\"",
      "stopRule: \"NO_PRODUCTION_GO_NO_DEPLOY\"",
    ],
    "adapter dry-run readiness source token",
    panelSourcePath,
  );

  requireTokens(
    component,
    [
      "TASK_CENTER_ADAPTER_DRY_RUN_READINESS_REVIEW_ONLY",
      "TASK_CENTER_ADAPTER_DRY_RUN_READINESS_REVIEW_READONLY",
      "TASK_CENTER_ADAPTER_DRY_RUN_READINESS_REVIEW_DRAFT_ONLY",
      "TASK_CENTER_ADAPTER_DRY_RUN_READINESS_REVIEW_NO_APPROVAL",
      "TASK_CENTER_ADAPTER_DRY_RUN_READINESS_REVIEW_NO_DATABASE_READ",
      "TASK_CENTER_ADAPTER_DRY_RUN_READINESS_REVIEW_NO_DATABASE_CLIENT",
      "TASK_CENTER_ADAPTER_DRY_RUN_READINESS_REVIEW_NO_ENV_ENABLEMENT",
      "TASK_CENTER_ADAPTER_DRY_RUN_READINESS_REVIEW_NO_TASK_MUTATION",
      "TASK_CENTER_ADAPTER_DRY_RUN_READINESS_REVIEW_NO_REAL_DATA",
      "TASK_CENTER_ADAPTER_DRY_RUN_READINESS_REVIEW_NO_AI_OR_AUTOMATION",
      "data-heu-task-center-adapter-dry-run-readiness-review",
      "data-heu-task-center-adapter-dry-run-readiness-review-readonly",
      "data-heu-task-center-adapter-dry-run-readiness-review-draft-only",
      "data-heu-task-center-adapter-dry-run-readiness-review-no-approval",
      "data-heu-task-center-adapter-dry-run-readiness-review-no-database-read",
      "data-heu-task-center-adapter-dry-run-readiness-review-no-database-client",
      "data-heu-task-center-adapter-dry-run-readiness-review-no-env-enablement",
      "data-heu-task-center-adapter-dry-run-readiness-review-no-task-mutation",
      "data-heu-task-center-adapter-dry-run-readiness-review-no-real-data",
      "data-heu-task-center-adapter-dry-run-readiness-review-no-ai-or-automation",
      "data-heu-task-center-adapter-dry-run-readiness-review-item",
      "data-heu-task-center-adapter-dry-run-readiness-review-reviewer",
      "data-heu-task-center-adapter-dry-run-readiness-review-state",
      "data-heu-task-center-adapter-dry-run-readiness-review-required",
      "data-heu-task-center-adapter-dry-run-readiness-review-stop-rule",
      "HEU-Data-024 - Adapter dry-run readiness review",
      "Review dieu kien truoc khi bat dry-run adapter",
      "gateEvidence.adapterDryRunReadinessReview.items.map",
      "gateEvidence.adapterDryRunReadinessReview.readiness",
    ],
    "component adapter dry-run readiness token",
    componentPath,
  );

  requireTokens(
    doc,
    [
      "HEU-DATA-024-TASK-CENTER-ADAPTER-DRY-RUN-READINESS-REVIEW",
      "Status: PASS_LOCAL_REVIEW_PACKET",
      "Production status: NO-GO",
      "Runtime status: DRY_RUN_ADAPTER_READY: NO_GO_REVIEW_ONLY",
      "Database status: TASK_CENTER_DATABASE_READY: NO_GO_DRY_RUN_READINESS_REVIEW_ONLY",
      "TASK_CENTER_ADAPTER_DRY_RUN_READINESS_REVIEW_ONLY",
      "TASK_CENTER_ADAPTER_DRY_RUN_READINESS_REVIEW_READONLY",
      "TASK_CENTER_ADAPTER_DRY_RUN_READINESS_REVIEW_DRAFT_ONLY",
      "TASK_CENTER_ADAPTER_DRY_RUN_READINESS_REVIEW_NO_APPROVAL",
      "TASK_CENTER_ADAPTER_DRY_RUN_READINESS_REVIEW_NO_DATABASE_READ",
      "TASK_CENTER_ADAPTER_DRY_RUN_READINESS_REVIEW_NO_DATABASE_CLIENT",
      "TASK_CENTER_ADAPTER_DRY_RUN_READINESS_REVIEW_NO_ENV_ENABLEMENT",
      "TASK_CENTER_ADAPTER_DRY_RUN_READINESS_REVIEW_NO_TASK_MUTATION",
      "TASK_CENTER_ADAPTER_DRY_RUN_READINESS_REVIEW_NO_REAL_DATA",
      "TASK_CENTER_ADAPTER_DRY_RUN_READINESS_REVIEW_NO_AI_OR_AUTOMATION",
      "TASK_CENTER_DRY_RUN_ENV_GATE_DISABLED_BY_DEFAULT",
      "NO_DATABASE_CLIENT_CREATED",
      "NO_DATABASE_READ_EXECUTED",
      "NO_ENV_ENABLEMENT",
      "NO_TASK_MUTATION_ROUTE_CREATED",
      "NO_REAL_USER_DATA",
      "NO_AI_CALL_NO_AUTOMATION_STEP",
      "DRY_RUN_READINESS_SCOPE_FIRST_FILTER",
      "DRY_RUN_READINESS_NEGATIVE_ACCESS",
      "DRY_RUN_READINESS_RESTRICTED_DATA_BOUNDARY",
      "DRY_RUN_READINESS_DEPARTMENT_LABEL_ACCEPTANCE",
      "DRY_RUN_READINESS_PRODUCTION_NO_GO",
      "BLOCKED_REQUIRES_OWNER_SIGNOFF",
      "HEU-DATA-025-TASK-CENTER-ADAPTER-DRY-RUN-STATIC-NEGATIVE-ACCESS-PACKET",
      "static negative-access packet",
      "NEGATIVE_ACCESS_PACKET_READY: PASS_LOCAL_PACKET_ONLY",
      "check:heu-task-center-adapter-dry-run-static-negative-access-packet",
      "check:heu-task-center-adapter-dry-run-readiness-review",
    ],
    "adapter dry-run readiness doc token",
    docPath,
  );

  requireTokens(
    envGateLedgerDoc,
    [
      "HEU-DATA-024-TASK-CENTER-ADAPTER-DRY-RUN-READINESS-REVIEW",
      "adapter dry-run readiness review",
      "DRY_RUN_ADAPTER_READY: NO_GO_REVIEW_ONLY",
      "check:heu-task-center-adapter-dry-run-readiness-review",
    ],
    "env gate ledger next-slice token",
    envGateLedgerDocPath,
  );

  requireTokens(
    manifest,
    [
      componentPath,
      panelSourcePath,
      enablementGatePath,
      docPath,
      staticNegativeAccessPacketDocPath,
      envGateLedgerDocPath,
      checkerPath,
      staticNegativeAccessPacketCheckerPath,
      envGateLedgerCheckerPath,
      "check:heu-task-center-adapter-dry-run-readiness-review",
      "check:heu-task-center-adapter-dry-run-static-negative-access-packet",
      "node --check scripts/check-heu-task-center-adapter-dry-run-readiness-review.mjs",
      "node --check scripts/check-heu-task-center-adapter-dry-run-static-negative-access-packet.mjs",
      "npm.cmd run check:heu-task-center-adapter-dry-run-readiness-review",
      "npm.cmd run check:heu-task-center-adapter-dry-run-static-negative-access-packet",
    ],
    "manifest adapter dry-run readiness token",
    manifestPath,
  );

  requireTokens(
    envGateLedgerChecker,
    [
      "HEU-DATA-024-TASK-CENTER-ADAPTER-DRY-RUN-READINESS-REVIEW",
      "check:heu-task-center-adapter-dry-run-readiness-review",
      docPath,
      checkerPath,
    ],
    "env gate ledger checker next-slice token",
    envGateLedgerCheckerPath,
  );

  requireTokens(
    staticNegativeAccessPacketDoc,
    [
      "HEU-DATA-025-TASK-CENTER-ADAPTER-DRY-RUN-STATIC-NEGATIVE-ACCESS-PACKET",
      "NEGATIVE_ACCESS_PACKET_READY: PASS_LOCAL_PACKET_ONLY",
      "TASK_CENTER_DATABASE_READY: NO_GO_STATIC_NEGATIVE_ACCESS_PACKET_ONLY",
      "TASK_CENTER_ADAPTER_DRY_RUN_STATIC_NEGATIVE_ACCESS_PACKET_ONLY",
      "check:heu-task-center-adapter-dry-run-static-negative-access-packet",
    ],
    "static negative-access packet doc token",
    staticNegativeAccessPacketDocPath,
  );

  requireTokens(
    staticNegativeAccessPacketChecker,
    [
      "HEU_TASK_CENTER_ADAPTER_DRY_RUN_STATIC_NEGATIVE_ACCESS_PACKET_READY: PASS_LOCAL",
      "TASK_CENTER_DATABASE_READY: NO_GO_STATIC_NEGATIVE_ACCESS_PACKET_ONLY",
      staticNegativeAccessPacketDocPath,
    ],
    "static negative-access packet checker token",
    staticNegativeAccessPacketCheckerPath,
  );

  if (packageJson.scripts?.[checkerAlias] !== checkerCommand) {
    fail(`${packagePath}: missing or mismatched ${checkerAlias}`);
  }

  requireTokens(
    checkerScript,
    [
      "existsSync",
      "readFileSync",
      "HEU_TASK_CENTER_ADAPTER_DRY_RUN_READINESS_REVIEW_READY: PASS_LOCAL",
      "TASK_CENTER_DATABASE_READY: NO_GO_DRY_RUN_READINESS_REVIEW_ONLY",
      "NO_RUNTIME_MUTATION: task center adapter dry-run readiness review checker only; no owner approval, database client, database read, env enablement, table creation, SQL migration, task write, file upload, storage write, real-data fixture, AI call, paid automation, deploy, finance action or production GO",
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
    "task-center adapter dry-run readiness review scope",
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
  console.error("HEU Task Center adapter dry-run readiness review check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("HEU Task Center adapter dry-run readiness review check");
console.log(
  "HEU_TASK_CENTER_ADAPTER_DRY_RUN_READINESS_REVIEW_READY: PASS_LOCAL",
);
console.log(
  "TASK_CENTER_DATABASE_READY: NO_GO_DRY_RUN_READINESS_REVIEW_ONLY",
);
console.log(
  "NO_RUNTIME_MUTATION: task center adapter dry-run readiness review checker only; no owner approval, database client, database read, env enablement, table creation, SQL migration, task write, file upload, storage write, real-data fixture, AI call, paid automation, deploy, finance action or production GO",
);
