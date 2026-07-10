import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const failures = [];

const componentPath = "components/data-confirmation/department-task-inbox.tsx";
const panelSourcePath = "lib/task-center-gate-evidence-panel-source.ts";
const enablementGatePath = "lib/task-center-readonly-adapter-enablement-gate.ts";
const docPath =
  "docs/HEU_CONTROL/HEU_DATA_021_TASK_CENTER_ADAPTER_PREFLIGHT_CHECKLIST_20260710.md";
const dryRunSwitchContractDocPath =
  "docs/HEU_CONTROL/HEU_DATA_022_TASK_CENTER_READONLY_ADAPTER_DRY_RUN_SWITCH_CONTRACT_20260710.md";
const ownerGateEvidenceMatrixDocPath =
  "docs/HEU_CONTROL/HEU_DATA_020_TASK_CENTER_OWNER_GATE_EVIDENCE_MATRIX_20260710.md";
const manifestPath =
  "docs/HEU_CONTROL/HEU_APP_SHELL_001_STAGE_FILE_MANIFEST_20260709.md";
const ownerGateEvidenceMatrixCheckerPath =
  "scripts/check-heu-task-center-owner-gate-evidence-matrix-readiness.mjs";
const dryRunSwitchContractCheckerPath =
  "scripts/check-heu-task-center-readonly-adapter-dry-run-switch-contract-readiness.mjs";
const checkerPath =
  "scripts/check-heu-task-center-adapter-preflight-checklist-readiness.mjs";
const packagePath = "package.json";
const checkerAlias =
  "check:heu-task-center-adapter-preflight-checklist-readiness";
const checkerCommand = `node ${checkerPath}`;
const dryRunSwitchContractCheckerAlias =
  "check:heu-task-center-readonly-adapter-dry-run-switch-contract-readiness";
const dryRunSwitchContractCheckerCommand =
  `node ${dryRunSwitchContractCheckerPath}`;

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
  ownerGateEvidenceMatrixDocPath,
  manifestPath,
  ownerGateEvidenceMatrixCheckerPath,
  dryRunSwitchContractCheckerPath,
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
  const dryRunSwitchContractDoc = read(dryRunSwitchContractDocPath);
  const ownerGateEvidenceMatrixDoc = read(ownerGateEvidenceMatrixDocPath);
  const manifest = read(manifestPath);
  const ownerGateEvidenceMatrixChecker = read(ownerGateEvidenceMatrixCheckerPath);
  const checkerScript = read(checkerPath);
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
      "TASK_CENTER_ADAPTER_PREFLIGHT_CHECKLIST_ONLY",
      "TASK_CENTER_ADAPTER_PREFLIGHT_CHECKLIST_READONLY",
      "TASK_CENTER_ADAPTER_PREFLIGHT_CHECKLIST_DRAFT_ONLY",
      "TASK_CENTER_ADAPTER_PREFLIGHT_CHECKLIST_NO_APPROVAL",
      "TASK_CENTER_ADAPTER_PREFLIGHT_CHECKLIST_NO_DATABASE_READ",
      "TASK_CENTER_ADAPTER_PREFLIGHT_CHECKLIST_NO_DATABASE_CLIENT",
      "TASK_CENTER_ADAPTER_PREFLIGHT_CHECKLIST_NO_TASK_MUTATION",
      "TASK_CENTER_ADAPTER_PREFLIGHT_CHECKLIST_NO_REAL_DATA",
      "TASK_CENTER_ADAPTER_PREFLIGHT_CHECKLIST_NO_ENV_ENABLEMENT",
      "TASK_CENTER_ADAPTER_PREFLIGHT_CHECKLIST_NO_AI_OR_AUTOMATION",
      "TaskCenterAdapterPreflightChecklistItem",
      "adapterPreflightChecklistItems",
      "PREFLIGHT_SCOPE_FILTER_SIGNOFF",
      "PREFLIGHT_NEGATIVE_ACCESS_EVIDENCE",
      "PREFLIGHT_RESTRICTED_FIELD_ALLOWLIST",
      "PREFLIGHT_OWNER_LABEL_ACCEPTANCE",
      "PREFLIGHT_BGH_NO_GO_ACK",
      "preflightState: \"PREFLIGHT_REQUIRED\"",
      "requiredBeforeAdapterRead: \"IT_DATA_SCOPE_FIRST_FILTER_SIGNOFF\"",
      "requiredBeforeAdapterRead: \"AUDIT_NEGATIVE_ACCESS_EVIDENCE\"",
      "requiredBeforeAdapterRead:",
      "\"PHAP_CHE_RESTRICTED_DATA_BOUNDARY_SIGNOFF\"",
      "requiredBeforeAdapterRead: \"DEPARTMENT_OWNER_TASK_LABEL_ACCEPTANCE\"",
      "requiredBeforeAdapterRead: \"BGH_PRODUCTION_NO_GO_ACKNOWLEDGEMENT\"",
      "forbiddenInThisSlice: \"NO_DATABASE_CLIENT_CREATED\"",
      "forbiddenInThisSlice: \"NO_DATABASE_READ_EXECUTED\"",
      "forbiddenInThisSlice: \"NO_RAW_PII_NO_PAYMENT_DATA\"",
      "forbiddenInThisSlice: \"NO_TASK_MUTATION_ROUTE_CREATED\"",
      "forbiddenInThisSlice: \"NO_PRODUCTION_GO_NO_DEPLOY\"",
    ],
    "adapter preflight checklist source token",
    panelSourcePath,
  );

  requireTokens(
    component,
    [
      "TASK_CENTER_ADAPTER_PREFLIGHT_CHECKLIST_ONLY",
      "TASK_CENTER_ADAPTER_PREFLIGHT_CHECKLIST_READONLY",
      "TASK_CENTER_ADAPTER_PREFLIGHT_CHECKLIST_DRAFT_ONLY",
      "TASK_CENTER_ADAPTER_PREFLIGHT_CHECKLIST_NO_APPROVAL",
      "TASK_CENTER_ADAPTER_PREFLIGHT_CHECKLIST_NO_DATABASE_READ",
      "TASK_CENTER_ADAPTER_PREFLIGHT_CHECKLIST_NO_DATABASE_CLIENT",
      "TASK_CENTER_ADAPTER_PREFLIGHT_CHECKLIST_NO_TASK_MUTATION",
      "TASK_CENTER_ADAPTER_PREFLIGHT_CHECKLIST_NO_REAL_DATA",
      "TASK_CENTER_ADAPTER_PREFLIGHT_CHECKLIST_NO_ENV_ENABLEMENT",
      "TASK_CENTER_ADAPTER_PREFLIGHT_CHECKLIST_NO_AI_OR_AUTOMATION",
      "data-heu-task-center-adapter-preflight-checklist",
      "data-heu-task-center-adapter-preflight-checklist-readonly",
      "data-heu-task-center-adapter-preflight-checklist-draft-only",
      "data-heu-task-center-adapter-preflight-checklist-no-approval",
      "data-heu-task-center-adapter-preflight-checklist-no-database-read",
      "data-heu-task-center-adapter-preflight-checklist-no-database-client",
      "data-heu-task-center-adapter-preflight-checklist-no-task-mutation",
      "data-heu-task-center-adapter-preflight-checklist-no-real-data",
      "data-heu-task-center-adapter-preflight-checklist-no-env-enablement",
      "data-heu-task-center-adapter-preflight-checklist-no-ai-or-automation",
      "data-heu-task-center-adapter-preflight-item",
      "data-heu-task-center-adapter-preflight-owner",
      "data-heu-task-center-adapter-preflight-state",
      "data-heu-task-center-adapter-preflight-required",
      "data-heu-task-center-adapter-preflight-forbidden",
      "HEU-Data-021 - Adapter preflight checklist",
      "Checklist truoc khi mo adapter doc DB",
      "gateEvidence.adapterPreflightChecklist.items.map",
    ],
    "component adapter preflight checklist token",
    componentPath,
  );

  requireTokens(
    doc,
    [
      "HEU-DATA-021-TASK-CENTER-ADAPTER-PREFLIGHT-CHECKLIST",
      "Status: PASS_LOCAL_ADAPTER_PREFLIGHT_CHECKLIST",
      "Production status: NO-GO",
      "TASK_CENTER_ADAPTER_PREFLIGHT_CHECKLIST_ONLY",
      "TASK_CENTER_ADAPTER_PREFLIGHT_CHECKLIST_READONLY",
      "TASK_CENTER_ADAPTER_PREFLIGHT_CHECKLIST_DRAFT_ONLY",
      "TASK_CENTER_ADAPTER_PREFLIGHT_CHECKLIST_NO_APPROVAL",
      "TASK_CENTER_ADAPTER_PREFLIGHT_CHECKLIST_NO_DATABASE_READ",
      "TASK_CENTER_ADAPTER_PREFLIGHT_CHECKLIST_NO_DATABASE_CLIENT",
      "TASK_CENTER_ADAPTER_PREFLIGHT_CHECKLIST_NO_TASK_MUTATION",
      "TASK_CENTER_ADAPTER_PREFLIGHT_CHECKLIST_NO_REAL_DATA",
      "TASK_CENTER_ADAPTER_PREFLIGHT_CHECKLIST_NO_ENV_ENABLEMENT",
      "TASK_CENTER_ADAPTER_PREFLIGHT_CHECKLIST_NO_AI_OR_AUTOMATION",
      "PREFLIGHT_REQUIRED",
      "TASK_CENTER_GATE_EVIDENCE_PANEL_DATABASE_NO_GO",
      "NO_DATABASE_CLIENT_CREATED",
      "NO_DATABASE_READ_EXECUTED",
      "NO_SQL_MIGRATION_CREATED",
      "NO_TASK_MUTATION_ROUTE_CREATED",
      "NO_REAL_USER_DATA",
      "NO_AI_CALL_NO_AUTOMATION_STEP",
      "PREFLIGHT_SCOPE_FILTER_SIGNOFF",
      "PREFLIGHT_NEGATIVE_ACCESS_EVIDENCE",
      "PREFLIGHT_RESTRICTED_FIELD_ALLOWLIST",
      "PREFLIGHT_OWNER_LABEL_ACCEPTANCE",
      "PREFLIGHT_BGH_NO_GO_ACK",
      "TASK_CENTER_DATABASE_READY: NO_GO",
      "CAN_SUA_IT_DATA_AUDIT_PHAP_CHE_OWNER_BGH",
      "HEU-DATA-022-TASK-CENTER-READONLY-ADAPTER-DRY-RUN-SWITCH-CONTRACT",
      "DRY_RUN_SWITCH_DEFAULT_OFF",
      "check:heu-task-center-readonly-adapter-dry-run-switch-contract-readiness",
    ],
    "adapter preflight checklist doc token",
    docPath,
  );

  requireTokens(
    dryRunSwitchContractDoc,
    [
      "HEU-DATA-022-TASK-CENTER-READONLY-ADAPTER-DRY-RUN-SWITCH-CONTRACT",
      "Status: PASS_LOCAL_DRY_RUN_SWITCH_CONTRACT",
      "Production status: NO-GO",
      "TASK_CENTER_READONLY_ADAPTER_DRY_RUN_SWITCH_CONTRACT_ONLY",
      "TASK_CENTER_READONLY_ADAPTER_DRY_RUN_SWITCH_CONTRACT_READONLY",
      "TASK_CENTER_READONLY_ADAPTER_DRY_RUN_SWITCH_CONTRACT_DRAFT_ONLY",
      "TASK_CENTER_READONLY_ADAPTER_DRY_RUN_SWITCH_CONTRACT_NO_APPROVAL",
      "TASK_CENTER_READONLY_ADAPTER_DRY_RUN_SWITCH_CONTRACT_NO_DATABASE_READ",
      "TASK_CENTER_READONLY_ADAPTER_DRY_RUN_SWITCH_CONTRACT_NO_DATABASE_CLIENT",
      "TASK_CENTER_READONLY_ADAPTER_DRY_RUN_SWITCH_CONTRACT_NO_TASK_MUTATION",
      "TASK_CENTER_READONLY_ADAPTER_DRY_RUN_SWITCH_CONTRACT_NO_REAL_DATA",
      "TASK_CENTER_READONLY_ADAPTER_DRY_RUN_SWITCH_CONTRACT_NO_ENV_ENABLEMENT",
      "TASK_CENTER_READONLY_ADAPTER_DRY_RUN_SWITCH_CONTRACT_NO_AI_OR_AUTOMATION",
      "DRY_RUN_SWITCH_CONTRACT",
      "DRY_RUN_SWITCH_DEFAULT_OFF",
      "DRY_RUN_SWITCH_SCOPE_FILTER_ONLY",
      "DRY_RUN_SWITCH_NEGATIVE_ACCESS_GUARD",
      "DRY_RUN_SWITCH_FIELD_ALLOWLIST_GUARD",
      "DRY_RUN_SWITCH_READONLY_STATUS",
      "DRY_RUN_SWITCH_PRODUCTION_NO_GO",
      "TASK_CENTER_DATABASE_READY: NO_GO",
      "CAN_SUA_IT_DATA_AUDIT_PHAP_CHE_OWNER_BGH",
      "HEU-DATA-023-TASK-CENTER-DRY-RUN-ENV-GATE-LEDGER",
      "check:heu-task-center-dry-run-env-gate-ledger-readiness",
    ],
    "dry-run switch contract doc token",
    dryRunSwitchContractDocPath,
  );

  requireTokens(
    ownerGateEvidenceMatrixDoc,
    [
      "HEU-DATA-021-TASK-CENTER-ADAPTER-PREFLIGHT-CHECKLIST",
      "Task Center adapter preflight checklist",
      "still no DB read and no migration",
      "check:heu-task-center-adapter-preflight-checklist-readiness",
    ],
    "owner gate evidence matrix next-slice token",
    ownerGateEvidenceMatrixDocPath,
  );

  requireTokens(
    manifest,
    [
      componentPath,
      panelSourcePath,
      enablementGatePath,
      docPath,
      dryRunSwitchContractDocPath,
      ownerGateEvidenceMatrixDocPath,
      checkerPath,
      dryRunSwitchContractCheckerPath,
      ownerGateEvidenceMatrixCheckerPath,
      "check:heu-task-center-adapter-preflight-checklist-readiness",
      "check:heu-task-center-readonly-adapter-dry-run-switch-contract-readiness",
      "node --check scripts/check-heu-task-center-adapter-preflight-checklist-readiness.mjs",
      "node --check scripts/check-heu-task-center-readonly-adapter-dry-run-switch-contract-readiness.mjs",
      "npm.cmd run check:heu-task-center-adapter-preflight-checklist-readiness",
      "npm.cmd run check:heu-task-center-readonly-adapter-dry-run-switch-contract-readiness",
    ],
    "manifest adapter preflight checklist token",
    manifestPath,
  );

  requireTokens(
    ownerGateEvidenceMatrixChecker,
    [
      "HEU-DATA-021-TASK-CENTER-ADAPTER-PREFLIGHT-CHECKLIST",
      "check:heu-task-center-adapter-preflight-checklist-readiness",
      docPath,
      checkerPath,
    ],
    "owner gate evidence matrix checker next-slice token",
    ownerGateEvidenceMatrixCheckerPath,
  );

  if (packageJson.scripts?.[checkerAlias] !== checkerCommand) {
    fail(`${packagePath}: missing or mismatched ${checkerAlias}`);
  }

  if (
    packageJson.scripts?.[dryRunSwitchContractCheckerAlias] !==
    dryRunSwitchContractCheckerCommand
  ) {
    fail(`${packagePath}: missing or mismatched ${dryRunSwitchContractCheckerAlias}`);
  }

  requireTokens(
    checkerScript,
    [
      "existsSync",
      "readFileSync",
      "HEU_TASK_CENTER_ADAPTER_PREFLIGHT_CHECKLIST_READY: PASS_LOCAL",
      "TASK_CENTER_DATABASE_READY: NO_GO_PREFLIGHT_CHECKLIST_ONLY",
      "NO_RUNTIME_MUTATION: task center adapter preflight checklist checker only; no owner approval, database client, database read, env enablement, table creation, SQL migration, task write, file upload, storage write, real-data fixture, AI call, paid automation, deploy, finance action or production GO",
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
    "task-center adapter preflight checklist scope",
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
    "HEU Task Center adapter preflight checklist readiness check failed:",
  );
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("HEU Task Center adapter preflight checklist readiness check");
console.log("HEU_TASK_CENTER_ADAPTER_PREFLIGHT_CHECKLIST_READY: PASS_LOCAL");
console.log("TASK_CENTER_DATABASE_READY: NO_GO_PREFLIGHT_CHECKLIST_ONLY");
console.log(
  "NO_RUNTIME_MUTATION: task center adapter preflight checklist checker only; no owner approval, database client, database read, env enablement, table creation, SQL migration, task write, file upload, storage write, real-data fixture, AI call, paid automation, deploy, finance action or production GO",
);
