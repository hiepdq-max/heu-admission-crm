import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const failures = [];

const componentPath = "components/data-confirmation/department-task-inbox.tsx";
const panelSourcePath = "lib/task-center-gate-evidence-panel-source.ts";
const enablementGatePath = "lib/task-center-readonly-adapter-enablement-gate.ts";
const docPath =
  "docs/HEU_CONTROL/HEU_DATA_020_TASK_CENTER_OWNER_GATE_EVIDENCE_MATRIX_20260710.md";
const adapterPreflightChecklistDocPath =
  "docs/HEU_CONTROL/HEU_DATA_021_TASK_CENTER_ADAPTER_PREFLIGHT_CHECKLIST_20260710.md";
const disabledRuntimeSeamVerificationDocPath =
  "docs/HEU_CONTROL/HEU_DATA_019_TASK_CENTER_DISABLED_RUNTIME_SEAM_VERIFICATION_20260710.md";
const manifestPath =
  "docs/HEU_CONTROL/HEU_APP_SHELL_001_STAGE_FILE_MANIFEST_20260709.md";
const disabledRuntimeSeamVerificationCheckerPath =
  "scripts/check-heu-task-center-disabled-runtime-seam-verification-readiness.mjs";
const adapterPreflightChecklistCheckerPath =
  "scripts/check-heu-task-center-adapter-preflight-checklist-readiness.mjs";
const checkerPath =
  "scripts/check-heu-task-center-owner-gate-evidence-matrix-readiness.mjs";
const packagePath = "package.json";
const checkerAlias =
  "check:heu-task-center-owner-gate-evidence-matrix-readiness";
const checkerCommand = `node ${checkerPath}`;
const adapterPreflightChecklistCheckerAlias =
  "check:heu-task-center-adapter-preflight-checklist-readiness";
const adapterPreflightChecklistCheckerCommand =
  `node ${adapterPreflightChecklistCheckerPath}`;

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
  adapterPreflightChecklistDocPath,
  disabledRuntimeSeamVerificationDocPath,
  manifestPath,
  disabledRuntimeSeamVerificationCheckerPath,
  adapterPreflightChecklistCheckerPath,
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
  const adapterPreflightChecklistDoc = read(adapterPreflightChecklistDocPath);
  const disabledRuntimeSeamVerificationDoc = read(
    disabledRuntimeSeamVerificationDocPath,
  );
  const manifest = read(manifestPath);
  const disabledRuntimeSeamVerificationChecker = read(
    disabledRuntimeSeamVerificationCheckerPath,
  );
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
      "TASK_CENTER_OWNER_GATE_EVIDENCE_MATRIX_ONLY",
      "TASK_CENTER_OWNER_GATE_EVIDENCE_MATRIX_READONLY",
      "TASK_CENTER_OWNER_GATE_EVIDENCE_MATRIX_DRAFT_ONLY",
      "TASK_CENTER_OWNER_GATE_EVIDENCE_MATRIX_NO_APPROVAL",
      "TASK_CENTER_OWNER_GATE_EVIDENCE_MATRIX_NO_DATABASE_READ",
      "TASK_CENTER_OWNER_GATE_EVIDENCE_MATRIX_NO_DATABASE_CLIENT",
      "TASK_CENTER_OWNER_GATE_EVIDENCE_MATRIX_NO_TASK_MUTATION",
      "TASK_CENTER_OWNER_GATE_EVIDENCE_MATRIX_NO_REAL_DATA",
      "TASK_CENTER_OWNER_GATE_EVIDENCE_MATRIX_NO_AI_OR_AUTOMATION",
      "TaskCenterOwnerGateEvidenceMatrixItem",
      "ownerGateEvidenceMatrixItems",
      "OWNER_GATE_EVIDENCE_IT_DATA_SCOPE",
      "OWNER_GATE_EVIDENCE_AUDIT_NEGATIVE_ACCESS",
      "OWNER_GATE_EVIDENCE_PHAP_CHE_RESTRICTED_DATA",
      "OWNER_GATE_EVIDENCE_DEPARTMENT_LABEL_ACCEPTANCE",
      "OWNER_GATE_EVIDENCE_BGH_NO_GO_ACK",
      "evidenceState: \"OWNER_EVIDENCE_REQUIRED\"",
      "requiredEvidenceCode: \"IT_DATA_SCOPE_FIRST_FILTER_SIGNOFF\"",
      "requiredEvidenceCode: \"AUDIT_NEGATIVE_ACCESS_EVIDENCE\"",
      "requiredEvidenceCode: \"PHAP_CHE_RESTRICTED_DATA_BOUNDARY_SIGNOFF\"",
      "requiredEvidenceCode: \"DEPARTMENT_OWNER_TASK_LABEL_ACCEPTANCE\"",
      "requiredEvidenceCode: \"BGH_PRODUCTION_NO_GO_ACKNOWLEDGEMENT\"",
      "blocksDbReadUntil: \"DB_READ_BLOCKED_UNTIL_IT_DATA_SCOPE_EVIDENCE\"",
      "blocksDbReadUntil: \"DB_READ_BLOCKED_UNTIL_AUDIT_NEGATIVE_ACCESS_EVIDENCE\"",
      "blocksDbReadUntil: \"DB_READ_BLOCKED_UNTIL_PHAP_CHE_EVIDENCE\"",
      "blocksDbReadUntil: \"DB_READ_BLOCKED_UNTIL_DEPARTMENT_OWNER_EVIDENCE\"",
      "blocksDbReadUntil: \"DB_READ_BLOCKED_UNTIL_BGH_NO_GO_EVIDENCE\"",
    ],
    "owner gate evidence matrix source token",
    panelSourcePath,
  );

  requireTokens(
    component,
    [
      "TASK_CENTER_OWNER_GATE_EVIDENCE_MATRIX_ONLY",
      "TASK_CENTER_OWNER_GATE_EVIDENCE_MATRIX_READONLY",
      "TASK_CENTER_OWNER_GATE_EVIDENCE_MATRIX_DRAFT_ONLY",
      "TASK_CENTER_OWNER_GATE_EVIDENCE_MATRIX_NO_APPROVAL",
      "TASK_CENTER_OWNER_GATE_EVIDENCE_MATRIX_NO_DATABASE_READ",
      "TASK_CENTER_OWNER_GATE_EVIDENCE_MATRIX_NO_DATABASE_CLIENT",
      "TASK_CENTER_OWNER_GATE_EVIDENCE_MATRIX_NO_TASK_MUTATION",
      "TASK_CENTER_OWNER_GATE_EVIDENCE_MATRIX_NO_REAL_DATA",
      "TASK_CENTER_OWNER_GATE_EVIDENCE_MATRIX_NO_AI_OR_AUTOMATION",
      "data-heu-task-center-owner-gate-evidence-matrix",
      "data-heu-task-center-owner-gate-evidence-matrix-readonly",
      "data-heu-task-center-owner-gate-evidence-matrix-draft-only",
      "data-heu-task-center-owner-gate-evidence-matrix-no-approval",
      "data-heu-task-center-owner-gate-evidence-matrix-no-database-read",
      "data-heu-task-center-owner-gate-evidence-matrix-no-database-client",
      "data-heu-task-center-owner-gate-evidence-matrix-no-task-mutation",
      "data-heu-task-center-owner-gate-evidence-matrix-no-real-data",
      "data-heu-task-center-owner-gate-evidence-matrix-no-ai-or-automation",
      "data-heu-task-center-owner-gate-evidence-item",
      "data-heu-task-center-owner-gate-evidence-lane",
      "data-heu-task-center-owner-gate-evidence-state",
      "data-heu-task-center-owner-gate-evidence-required",
      "data-heu-task-center-owner-gate-evidence-blocker",
      "data-heu-task-center-owner-gate-evidence-forbidden",
      "HEU-Data-020 - Owner gate evidence matrix",
      "Ma tran evidence owner truoc khi mo DB read",
      "gateEvidence.ownerGateEvidenceMatrix.items.map",
    ],
    "component owner gate evidence matrix token",
    componentPath,
  );

  requireTokens(
    doc,
    [
      "HEU-DATA-020-TASK-CENTER-OWNER-GATE-EVIDENCE-MATRIX",
      "Status: PASS_LOCAL_OWNER_GATE_EVIDENCE_MATRIX",
      "Production status: NO-GO",
      "TASK_CENTER_OWNER_GATE_EVIDENCE_MATRIX_ONLY",
      "TASK_CENTER_OWNER_GATE_EVIDENCE_MATRIX_READONLY",
      "TASK_CENTER_OWNER_GATE_EVIDENCE_MATRIX_DRAFT_ONLY",
      "TASK_CENTER_OWNER_GATE_EVIDENCE_MATRIX_NO_APPROVAL",
      "TASK_CENTER_OWNER_GATE_EVIDENCE_MATRIX_NO_DATABASE_READ",
      "TASK_CENTER_OWNER_GATE_EVIDENCE_MATRIX_NO_DATABASE_CLIENT",
      "TASK_CENTER_OWNER_GATE_EVIDENCE_MATRIX_NO_TASK_MUTATION",
      "TASK_CENTER_OWNER_GATE_EVIDENCE_MATRIX_NO_REAL_DATA",
      "TASK_CENTER_OWNER_GATE_EVIDENCE_MATRIX_NO_AI_OR_AUTOMATION",
      "OWNER_EVIDENCE_REQUIRED",
      "NO_DATABASE_CLIENT_CREATED",
      "NO_DATABASE_READ_EXECUTED",
      "NO_SQL_MIGRATION_CREATED",
      "NO_TASK_MUTATION_ROUTE_CREATED",
      "NO_REAL_USER_DATA",
      "NO_AI_CALL_NO_AUTOMATION_STEP",
      "OWNER_GATE_EVIDENCE_IT_DATA_SCOPE",
      "OWNER_GATE_EVIDENCE_AUDIT_NEGATIVE_ACCESS",
      "OWNER_GATE_EVIDENCE_PHAP_CHE_RESTRICTED_DATA",
      "OWNER_GATE_EVIDENCE_DEPARTMENT_LABEL_ACCEPTANCE",
      "OWNER_GATE_EVIDENCE_BGH_NO_GO_ACK",
      "TASK_CENTER_DATABASE_READY: NO_GO",
      "CAN_SUA_IT_DATA_AUDIT_PHAP_CHE_OWNER_BGH",
      "HEU-DATA-021-TASK-CENTER-ADAPTER-PREFLIGHT-CHECKLIST",
      "Task Center adapter preflight checklist",
      "still no DB read and no migration",
      "check:heu-task-center-adapter-preflight-checklist-readiness",
    ],
    "owner gate evidence matrix doc token",
    docPath,
  );

  requireTokens(
    adapterPreflightChecklistDoc,
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
      "PREFLIGHT_SCOPE_FILTER_SIGNOFF",
      "PREFLIGHT_NEGATIVE_ACCESS_EVIDENCE",
      "PREFLIGHT_RESTRICTED_FIELD_ALLOWLIST",
      "PREFLIGHT_OWNER_LABEL_ACCEPTANCE",
      "PREFLIGHT_BGH_NO_GO_ACK",
      "TASK_CENTER_DATABASE_READY: NO_GO",
      "CAN_SUA_IT_DATA_AUDIT_PHAP_CHE_OWNER_BGH",
      "HEU-DATA-022-TASK-CENTER-READONLY-ADAPTER-DRY-RUN-SWITCH-CONTRACT",
      "check:heu-task-center-readonly-adapter-dry-run-switch-contract-readiness",
    ],
    "adapter preflight checklist doc token",
    adapterPreflightChecklistDocPath,
  );

  requireTokens(
    disabledRuntimeSeamVerificationDoc,
    [
      "HEU-DATA-020-TASK-CENTER-OWNER-GATE-EVIDENCE-MATRIX",
      "Task Center read-only adapter owner gate evidence matrix",
      "still no DB read and no migration",
      "check:heu-task-center-owner-gate-evidence-matrix-readiness",
    ],
    "disabled runtime seam verification next-slice token",
    disabledRuntimeSeamVerificationDocPath,
  );

  requireTokens(
    manifest,
    [
      componentPath,
      panelSourcePath,
      enablementGatePath,
      docPath,
      adapterPreflightChecklistDocPath,
      disabledRuntimeSeamVerificationDocPath,
      checkerPath,
      adapterPreflightChecklistCheckerPath,
      disabledRuntimeSeamVerificationCheckerPath,
      "check:heu-task-center-owner-gate-evidence-matrix-readiness",
      "check:heu-task-center-adapter-preflight-checklist-readiness",
      "node --check scripts/check-heu-task-center-owner-gate-evidence-matrix-readiness.mjs",
      "node --check scripts/check-heu-task-center-adapter-preflight-checklist-readiness.mjs",
      "npm.cmd run check:heu-task-center-owner-gate-evidence-matrix-readiness",
      "npm.cmd run check:heu-task-center-adapter-preflight-checklist-readiness",
    ],
    "manifest owner gate evidence matrix token",
    manifestPath,
  );

  requireTokens(
    disabledRuntimeSeamVerificationChecker,
    [
      "HEU-DATA-020-TASK-CENTER-OWNER-GATE-EVIDENCE-MATRIX",
      "check:heu-task-center-owner-gate-evidence-matrix-readiness",
      docPath,
      checkerPath,
    ],
    "disabled runtime seam checker next-slice token",
    disabledRuntimeSeamVerificationCheckerPath,
  );

  if (packageJson.scripts?.[checkerAlias] !== checkerCommand) {
    fail(`${packagePath}: missing or mismatched ${checkerAlias}`);
  }

  if (
    packageJson.scripts?.[adapterPreflightChecklistCheckerAlias] !==
    adapterPreflightChecklistCheckerCommand
  ) {
    fail(`${packagePath}: missing or mismatched ${adapterPreflightChecklistCheckerAlias}`);
  }

  requireTokens(
    checkerScript,
    [
      "existsSync",
      "readFileSync",
      "HEU_TASK_CENTER_OWNER_GATE_EVIDENCE_MATRIX_READY: PASS_LOCAL",
      "TASK_CENTER_DATABASE_READY: NO_GO_OWNER_GATE_EVIDENCE_MATRIX_ONLY",
      "NO_RUNTIME_MUTATION: task center owner gate evidence matrix checker only; no owner approval, database client, database read, env enablement, table creation, SQL migration, task write, file upload, storage write, real-data fixture, AI call, paid automation, deploy, finance action or production GO",
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
    "task-center owner gate evidence matrix scope",
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
    "HEU Task Center owner gate evidence matrix readiness check failed:",
  );
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("HEU Task Center owner gate evidence matrix readiness check");
console.log("HEU_TASK_CENTER_OWNER_GATE_EVIDENCE_MATRIX_READY: PASS_LOCAL");
console.log("TASK_CENTER_DATABASE_READY: NO_GO_OWNER_GATE_EVIDENCE_MATRIX_ONLY");
console.log(
  "NO_RUNTIME_MUTATION: task center owner gate evidence matrix checker only; no owner approval, database client, database read, env enablement, table creation, SQL migration, task write, file upload, storage write, real-data fixture, AI call, paid automation, deploy, finance action or production GO",
);
