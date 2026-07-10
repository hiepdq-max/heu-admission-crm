import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const failures = [];

const componentPath = "components/data-confirmation/department-task-inbox.tsx";
const panelSourcePath = "lib/task-center-gate-evidence-panel-source.ts";
const enablementGatePath = "lib/task-center-readonly-adapter-enablement-gate.ts";
const docPath =
  "docs/HEU_CONTROL/HEU_DATA_023_TASK_CENTER_DRY_RUN_ENV_GATE_LEDGER_20260710.md";
const dryRunSwitchContractDocPath =
  "docs/HEU_CONTROL/HEU_DATA_022_TASK_CENTER_READONLY_ADAPTER_DRY_RUN_SWITCH_CONTRACT_20260710.md";
const manifestPath =
  "docs/HEU_CONTROL/HEU_APP_SHELL_001_STAGE_FILE_MANIFEST_20260709.md";
const dryRunSwitchContractCheckerPath =
  "scripts/check-heu-task-center-readonly-adapter-dry-run-switch-contract-readiness.mjs";
const checkerPath =
  "scripts/check-heu-task-center-dry-run-env-gate-ledger-readiness.mjs";
const adapterDryRunReadinessReviewDocPath =
  "docs/HEU_CONTROL/HEU_DATA_024_TASK_CENTER_ADAPTER_DRY_RUN_READINESS_REVIEW_20260710.md";
const adapterDryRunReadinessReviewCheckerPath =
  "scripts/check-heu-task-center-adapter-dry-run-readiness-review.mjs";
const packagePath = "package.json";
const checkerAlias = "check:heu-task-center-dry-run-env-gate-ledger-readiness";
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
  dryRunSwitchContractDocPath,
  manifestPath,
  dryRunSwitchContractCheckerPath,
  checkerPath,
  adapterDryRunReadinessReviewDocPath,
  adapterDryRunReadinessReviewCheckerPath,
  packagePath,
]) {
  requireFile(file);
}

if (failures.length === 0) {
  const component = read(componentPath);
  const panelSource = read(panelSourcePath);
  const enablementGate = read(enablementGatePath);
  const doc = read(docPath);
  const dryRunSwitchContractDoc = read(dryRunSwitchContractDocPath);
  const manifest = read(manifestPath);
  const dryRunSwitchContractChecker = read(dryRunSwitchContractCheckerPath);
  const checkerScript = read(checkerPath);
  const adapterDryRunReadinessReviewDoc = read(adapterDryRunReadinessReviewDocPath);
  const adapterDryRunReadinessReviewChecker = read(
    adapterDryRunReadinessReviewCheckerPath,
  );
  const packageJson = JSON.parse(read(packagePath));

  requireTokens(
    enablementGate,
    [
      "TASK_CENTER_ADAPTER_ENABLEMENT_OWNER_REVIEW_REQUIRED",
      "TASK_CENTER_ADAPTER_ENABLEMENT_DEFAULT_NO_GO",
      "TASK_CENTER_READONLY_ADAPTER_FEATURE_FLAG_REQUIRED",
      "ownerReview: {",
      "IT_DATA: \"NO_GO\"",
      "AUDIT: \"NO_GO\"",
      "PHAP_CHE: \"NO_GO\"",
      "DEPARTMENT_OWNER: \"NO_GO\"",
      "BGH: \"NO_GO\"",
      "IT_DATA_SCOPE_FIRST_FILTER_SIGNOFF",
      "AUDIT_NEGATIVE_ACCESS_EVIDENCE",
      "PHAP_CHE_RESTRICTED_DATA_BOUNDARY_SIGNOFF",
      "DEPARTMENT_OWNER_TASK_LABEL_ACCEPTANCE",
      "BGH_PRODUCTION_NO_GO_ACKNOWLEDGEMENT",
      "BACKUP_ROLLBACK_UAT_EVIDENCE_BEFORE_DB_READ",
    ],
    "enablement gate owner proof token",
    enablementGatePath,
  );

  requireTokens(
    panelSource,
    [
      "TASK_CENTER_DRY_RUN_ENV_GATE_LEDGER_ONLY",
      "TASK_CENTER_DRY_RUN_ENV_GATE_LEDGER_READONLY",
      "TASK_CENTER_DRY_RUN_ENV_GATE_LEDGER_DRAFT_ONLY",
      "TASK_CENTER_DRY_RUN_ENV_GATE_LEDGER_NO_APPROVAL",
      "TASK_CENTER_DRY_RUN_ENV_GATE_LEDGER_NO_DATABASE_READ",
      "TASK_CENTER_DRY_RUN_ENV_GATE_LEDGER_NO_DATABASE_CLIENT",
      "TASK_CENTER_DRY_RUN_ENV_GATE_LEDGER_NO_TASK_MUTATION",
      "TASK_CENTER_DRY_RUN_ENV_GATE_LEDGER_NO_REAL_DATA",
      "TASK_CENTER_DRY_RUN_ENV_GATE_LEDGER_NO_ENV_ENABLEMENT",
      "TASK_CENTER_DRY_RUN_ENV_GATE_LEDGER_NO_AI_OR_AUTOMATION",
      "TaskCenterDryRunEnvGateLedgerItem",
      "dryRunEnvGateLedgerItems",
      "ENV_GATE_LEDGER_FLAG_NAME_RESERVED",
      "ENV_GATE_LEDGER_NEGATIVE_ACCESS_LOCK",
      "ENV_GATE_LEDGER_RESTRICTED_DATA_BOUNDARY",
      "ENV_GATE_LEDGER_READONLY_TASK_COPY",
      "ENV_GATE_LEDGER_PRODUCTION_NO_GO",
      "gateState: \"ENV_GATE_RECORDED_DISABLED\"",
      "requiredBeforeEnvEnablement: \"IT_DATA_RUNTIME_FLAG_SIGNOFF\"",
      "requiredBeforeEnvEnablement: \"AUDIT_NEGATIVE_ACCESS_EVIDENCE\"",
      "requiredBeforeEnvEnablement:",
      "\"PHAP_CHE_RESTRICTED_DATA_BOUNDARY_SIGNOFF\"",
      "requiredBeforeEnvEnablement: \"DEPARTMENT_OWNER_TASK_LABEL_ACCEPTANCE\"",
      "requiredBeforeEnvEnablement: \"BGH_PRODUCTION_NO_GO_ACKNOWLEDGEMENT\"",
      "forbiddenInThisSlice: \"NO_ENV_ENABLEMENT\"",
      "forbiddenInThisSlice: \"NO_DATABASE_READ_EXECUTED\"",
      "forbiddenInThisSlice: \"NO_RAW_PII_NO_PAYMENT_DATA\"",
      "forbiddenInThisSlice: \"NO_TASK_MUTATION_ROUTE_CREATED\"",
      "forbiddenInThisSlice: \"NO_PRODUCTION_GO_NO_DEPLOY\"",
    ],
    "dry-run env gate ledger source token",
    panelSourcePath,
  );

  requireTokens(
    component,
    [
      "TASK_CENTER_DRY_RUN_ENV_GATE_LEDGER_ONLY",
      "TASK_CENTER_DRY_RUN_ENV_GATE_LEDGER_READONLY",
      "TASK_CENTER_DRY_RUN_ENV_GATE_LEDGER_DRAFT_ONLY",
      "TASK_CENTER_DRY_RUN_ENV_GATE_LEDGER_NO_APPROVAL",
      "TASK_CENTER_DRY_RUN_ENV_GATE_LEDGER_NO_DATABASE_READ",
      "TASK_CENTER_DRY_RUN_ENV_GATE_LEDGER_NO_DATABASE_CLIENT",
      "TASK_CENTER_DRY_RUN_ENV_GATE_LEDGER_NO_TASK_MUTATION",
      "TASK_CENTER_DRY_RUN_ENV_GATE_LEDGER_NO_REAL_DATA",
      "TASK_CENTER_DRY_RUN_ENV_GATE_LEDGER_NO_ENV_ENABLEMENT",
      "TASK_CENTER_DRY_RUN_ENV_GATE_LEDGER_NO_AI_OR_AUTOMATION",
      "data-heu-task-center-dry-run-env-gate-ledger",
      "data-heu-task-center-dry-run-env-gate-ledger-readonly",
      "data-heu-task-center-dry-run-env-gate-ledger-draft-only",
      "data-heu-task-center-dry-run-env-gate-ledger-no-approval",
      "data-heu-task-center-dry-run-env-gate-ledger-no-database-read",
      "data-heu-task-center-dry-run-env-gate-ledger-no-database-client",
      "data-heu-task-center-dry-run-env-gate-ledger-no-task-mutation",
      "data-heu-task-center-dry-run-env-gate-ledger-no-real-data",
      "data-heu-task-center-dry-run-env-gate-ledger-no-env-enablement",
      "data-heu-task-center-dry-run-env-gate-ledger-no-ai-or-automation",
      "data-heu-task-center-dry-run-env-gate-ledger-item",
      "data-heu-task-center-dry-run-env-gate-ledger-owner",
      "data-heu-task-center-dry-run-env-gate-ledger-state",
      "data-heu-task-center-dry-run-env-gate-ledger-required",
      "data-heu-task-center-dry-run-env-gate-ledger-forbidden",
      "HEU-Data-023 - Dry-run env gate ledger",
      "So gate env dry-run mac dinh DISABLED",
      "gateEvidence.dryRunEnvGateLedger.items.map",
    ],
    "component dry-run env gate ledger token",
    componentPath,
  );

  requireTokens(
    doc,
    [
      "HEU-DATA-023-TASK-CENTER-DRY-RUN-ENV-GATE-LEDGER",
      "Status: PASS_LOCAL_DRY_RUN_ENV_GATE_LEDGER",
      "Production status: NO-GO",
      "TASK_CENTER_DRY_RUN_ENV_GATE_LEDGER_ONLY",
      "TASK_CENTER_DRY_RUN_ENV_GATE_LEDGER_READONLY",
      "TASK_CENTER_DRY_RUN_ENV_GATE_LEDGER_DRAFT_ONLY",
      "TASK_CENTER_DRY_RUN_ENV_GATE_LEDGER_NO_APPROVAL",
      "TASK_CENTER_DRY_RUN_ENV_GATE_LEDGER_NO_DATABASE_READ",
      "TASK_CENTER_DRY_RUN_ENV_GATE_LEDGER_NO_DATABASE_CLIENT",
      "TASK_CENTER_DRY_RUN_ENV_GATE_LEDGER_NO_TASK_MUTATION",
      "TASK_CENTER_DRY_RUN_ENV_GATE_LEDGER_NO_REAL_DATA",
      "TASK_CENTER_DRY_RUN_ENV_GATE_LEDGER_NO_ENV_ENABLEMENT",
      "TASK_CENTER_DRY_RUN_ENV_GATE_LEDGER_NO_AI_OR_AUTOMATION",
      "ENV_GATE_RECORDED_DISABLED",
      "DRY_RUN_ENV_GATE_DISABLED_BY_DEFAULT",
      "TASK_CENTER_GATE_EVIDENCE_PANEL_DATABASE_NO_GO",
      "NO_DATABASE_CLIENT_CREATED",
      "NO_DATABASE_READ_EXECUTED",
      "NO_SQL_MIGRATION_CREATED",
      "NO_TASK_MUTATION_ROUTE_CREATED",
      "NO_REAL_USER_DATA",
      "NO_ENV_ENABLEMENT",
      "NO_AI_CALL_NO_AUTOMATION_STEP",
      "ENV_GATE_LEDGER_FLAG_NAME_RESERVED",
      "ENV_GATE_LEDGER_NEGATIVE_ACCESS_LOCK",
      "ENV_GATE_LEDGER_RESTRICTED_DATA_BOUNDARY",
      "ENV_GATE_LEDGER_READONLY_TASK_COPY",
      "ENV_GATE_LEDGER_PRODUCTION_NO_GO",
      "TASK_CENTER_DATABASE_READY: NO_GO",
      "CAN_SUA_IT_DATA_AUDIT_PHAP_CHE_OWNER_BGH",
      "HEU-DATA-024-TASK-CENTER-ADAPTER-DRY-RUN-READINESS-REVIEW",
      "adapter dry-run readiness review",
      "DRY_RUN_ADAPTER_READY: NO_GO_REVIEW_ONLY",
      "check:heu-task-center-adapter-dry-run-readiness-review",
    ],
    "dry-run env gate ledger doc token",
    docPath,
  );

  requireTokens(
    dryRunSwitchContractDoc,
    [
      "HEU-DATA-023-TASK-CENTER-DRY-RUN-ENV-GATE-LEDGER",
      "dry-run env gate ledger",
      "DRY_RUN_ENV_GATE_DISABLED_BY_DEFAULT",
      "still no DB read and no migration",
      "check:heu-task-center-dry-run-env-gate-ledger-readiness",
    ],
    "dry-run switch contract next-slice token",
    dryRunSwitchContractDocPath,
  );

  requireTokens(
    manifest,
    [
      componentPath,
      panelSourcePath,
      enablementGatePath,
      docPath,
      dryRunSwitchContractDocPath,
      checkerPath,
      adapterDryRunReadinessReviewDocPath,
      adapterDryRunReadinessReviewCheckerPath,
      dryRunSwitchContractCheckerPath,
      "check:heu-task-center-dry-run-env-gate-ledger-readiness",
      "check:heu-task-center-adapter-dry-run-readiness-review",
      "node --check scripts/check-heu-task-center-dry-run-env-gate-ledger-readiness.mjs",
      "node --check scripts/check-heu-task-center-adapter-dry-run-readiness-review.mjs",
      "npm.cmd run check:heu-task-center-dry-run-env-gate-ledger-readiness",
      "npm.cmd run check:heu-task-center-adapter-dry-run-readiness-review",
    ],
    "manifest dry-run env gate ledger token",
    manifestPath,
  );

  requireTokens(
    dryRunSwitchContractChecker,
    [
      "HEU-DATA-023-TASK-CENTER-DRY-RUN-ENV-GATE-LEDGER",
      "check:heu-task-center-dry-run-env-gate-ledger-readiness",
      docPath,
      checkerPath,
    ],
    "dry-run switch checker next-slice token",
    dryRunSwitchContractCheckerPath,
  );

  requireTokens(
    adapterDryRunReadinessReviewDoc,
    [
      "HEU-DATA-024-TASK-CENTER-ADAPTER-DRY-RUN-READINESS-REVIEW",
      "DRY_RUN_ADAPTER_READY: NO_GO_REVIEW_ONLY",
      "TASK_CENTER_DATABASE_READY: NO_GO_DRY_RUN_READINESS_REVIEW_ONLY",
      "TASK_CENTER_ADAPTER_DRY_RUN_READINESS_REVIEW_ONLY",
      "check:heu-task-center-adapter-dry-run-readiness-review",
    ],
    "adapter dry-run readiness review doc token",
    adapterDryRunReadinessReviewDocPath,
  );

  requireTokens(
    adapterDryRunReadinessReviewChecker,
    [
      "HEU_TASK_CENTER_ADAPTER_DRY_RUN_READINESS_REVIEW_READY: PASS_LOCAL",
      "TASK_CENTER_DATABASE_READY: NO_GO_DRY_RUN_READINESS_REVIEW_ONLY",
      adapterDryRunReadinessReviewDocPath,
    ],
    "adapter dry-run readiness review checker token",
    adapterDryRunReadinessReviewCheckerPath,
  );

  if (packageJson.scripts?.[checkerAlias] !== checkerCommand) {
    fail(`${packagePath}: missing or mismatched ${checkerAlias}`);
  }

  requireTokens(
    checkerScript,
    [
      "existsSync",
      "readFileSync",
      "HEU_TASK_CENTER_DRY_RUN_ENV_GATE_LEDGER_READY: PASS_LOCAL",
      "TASK_CENTER_DATABASE_READY: NO_GO_DRY_RUN_ENV_GATE_LEDGER_ONLY",
      "NO_RUNTIME_MUTATION: task center dry-run env gate ledger checker only; no owner approval, database client, database read, env enablement, table creation, SQL migration, task write, file upload, storage write, real-data fixture, AI call, paid automation, deploy, finance action or production GO",
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
    "task-center dry-run env gate ledger scope",
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
  console.error("HEU Task Center dry-run env gate ledger readiness check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("HEU Task Center dry-run env gate ledger readiness check");
console.log("HEU_TASK_CENTER_DRY_RUN_ENV_GATE_LEDGER_READY: PASS_LOCAL");
console.log("TASK_CENTER_DATABASE_READY: NO_GO_DRY_RUN_ENV_GATE_LEDGER_ONLY");
console.log(
  "NO_RUNTIME_MUTATION: task center dry-run env gate ledger checker only; no owner approval, database client, database read, env enablement, table creation, SQL migration, task write, file upload, storage write, real-data fixture, AI call, paid automation, deploy, finance action or production GO",
);
