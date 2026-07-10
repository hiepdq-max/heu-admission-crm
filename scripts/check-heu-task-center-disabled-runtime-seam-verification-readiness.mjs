import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const failures = [];

const componentPath = "components/data-confirmation/department-task-inbox.tsx";
const panelSourcePath = "lib/task-center-gate-evidence-panel-source.ts";
const adapterSkeletonPath = "lib/task-center-readonly-adapter-skeleton.ts";
const uiFallbackSourcePath = "lib/task-center-ui-fallback-source.ts";
const docPath =
  "docs/HEU_CONTROL/HEU_DATA_019_TASK_CENTER_DISABLED_RUNTIME_SEAM_VERIFICATION_20260710.md";
const ownerGateEvidenceMatrixDocPath =
  "docs/HEU_CONTROL/HEU_DATA_020_TASK_CENTER_OWNER_GATE_EVIDENCE_MATRIX_20260710.md";
const adapterTestFixtureContractDocPath =
  "docs/HEU_CONTROL/HEU_DATA_018_TASK_CENTER_ADAPTER_TEST_FIXTURE_CONTRACT_20260710.md";
const manifestPath =
  "docs/HEU_CONTROL/HEU_APP_SHELL_001_STAGE_FILE_MANIFEST_20260709.md";
const adapterTestFixtureContractCheckerPath =
  "scripts/check-heu-task-center-adapter-test-fixture-contract-readiness.mjs";
const ownerGateEvidenceMatrixCheckerPath =
  "scripts/check-heu-task-center-owner-gate-evidence-matrix-readiness.mjs";
const checkerPath =
  "scripts/check-heu-task-center-disabled-runtime-seam-verification-readiness.mjs";
const packagePath = "package.json";
const checkerAlias =
  "check:heu-task-center-disabled-runtime-seam-verification-readiness";
const checkerCommand = `node ${checkerPath}`;
const ownerGateEvidenceMatrixCheckerAlias =
  "check:heu-task-center-owner-gate-evidence-matrix-readiness";
const ownerGateEvidenceMatrixCheckerCommand =
  `node ${ownerGateEvidenceMatrixCheckerPath}`;

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
  adapterSkeletonPath,
  uiFallbackSourcePath,
  docPath,
  ownerGateEvidenceMatrixDocPath,
  adapterTestFixtureContractDocPath,
  manifestPath,
  adapterTestFixtureContractCheckerPath,
  ownerGateEvidenceMatrixCheckerPath,
  checkerPath,
  packagePath,
]) {
  requireFile(file);
}

if (failures.length === 0) {
  const component = read(componentPath);
  const panelSource = read(panelSourcePath);
  const adapterSkeleton = read(adapterSkeletonPath);
  const uiFallbackSource = read(uiFallbackSourcePath);
  const doc = read(docPath);
  const ownerGateEvidenceMatrixDoc = read(ownerGateEvidenceMatrixDocPath);
  const adapterTestFixtureContractDoc = read(adapterTestFixtureContractDocPath);
  const manifest = read(manifestPath);
  const adapterTestFixtureContractChecker = read(
    adapterTestFixtureContractCheckerPath,
  );
  const checkerScript = read(checkerPath);
  const packageJson = JSON.parse(read(packagePath));

  requireTokens(
    adapterSkeleton,
    [
      "TASK_CENTER_READONLY_ADAPTER_DISABLED_BY_DEFAULT",
      "TASK_CENTER_READONLY_ADAPTER_FEATURE_FLAG_REQUIRED",
      "TASK_CENTER_READONLY_ADAPTER_NO_DATABASE_CLIENT",
      "TASK_CENTER_READONLY_ADAPTER_NO_DATABASE_READ",
      "TASK_CENTER_READONLY_ADAPTER_NO_SQL_MIGRATION",
      "TASK_CENTER_READONLY_ADAPTER_NO_TASK_MUTATION",
      "TASK_CENTER_READONLY_ADAPTER_NO_AI_OR_AUTOMATION",
      "rows: readonly []",
      "rows: []",
      "status: TASK_CENTER_READONLY_ADAPTER_DISABLED_BY_DEFAULT",
      "featureFlag: TASK_CENTER_READONLY_ADAPTER_FEATURE_FLAG_REQUIRED",
    ],
    "adapter skeleton disabled seam token",
    adapterSkeletonPath,
  );

  requireTokens(
    uiFallbackSource,
    [
      "TASK_CENTER_MOCK_READONLY_FALLBACK_ACTIVE",
      "TASK_CENTER_DISABLED_ADAPTER_OUTPUT_ONLY",
      "TASK_CENTER_UI_FALLBACK_NO_DATABASE_CLIENT",
      "TASK_CENTER_UI_FALLBACK_NO_DATABASE_READ",
      "TASK_CENTER_UI_FALLBACK_NO_TASK_MUTATION",
      "TASK_CENTER_UI_FALLBACK_NO_AI_OR_AUTOMATION",
      "adapterStatus: TASK_CENTER_READONLY_ADAPTER_DISABLED_BY_DEFAULT",
      "adapterRows: adapter.rows",
      "displayTasks: getMockTaskCenterTasksForLanes(lanes)",
    ],
    "ui fallback disabled seam token",
    uiFallbackSourcePath,
  );

  requireTokens(
    panelSource,
    [
      "TASK_CENTER_DISABLED_RUNTIME_SEAM_VERIFICATION_ONLY",
      "TASK_CENTER_DISABLED_RUNTIME_SEAM_VERIFICATION_READONLY",
      "TASK_CENTER_DISABLED_RUNTIME_SEAM_VERIFICATION_DRAFT_ONLY",
      "TASK_CENTER_DISABLED_RUNTIME_SEAM_VERIFICATION_NO_DATABASE_READ",
      "TASK_CENTER_DISABLED_RUNTIME_SEAM_VERIFICATION_NO_DATABASE_CLIENT",
      "TASK_CENTER_DISABLED_RUNTIME_SEAM_VERIFICATION_NO_TASK_MUTATION",
      "TASK_CENTER_DISABLED_RUNTIME_SEAM_VERIFICATION_NO_REAL_DATA",
      "TASK_CENTER_DISABLED_RUNTIME_SEAM_VERIFICATION_NO_ENV_ENABLEMENT",
      "TASK_CENTER_DISABLED_RUNTIME_SEAM_VERIFICATION_NO_AI_OR_AUTOMATION",
      "TaskCenterDisabledRuntimeSeamVerificationItem",
      "disabledRuntimeSeamVerificationItems",
      "RUNTIME_SEAM_ADAPTER_DISABLED_DEFAULT",
      "RUNTIME_SEAM_FALLBACK_SOURCE_ACTIVE",
      "RUNTIME_SEAM_EMPTY_ADAPTER_ROWS",
      "RUNTIME_SEAM_NO_ENV_ENABLEMENT",
      "RUNTIME_SEAM_PRODUCTION_NO_GO",
      "seamState: \"DISABLED_RUNTIME_SEAM\"",
      "requiredBeforeEnablement: \"FEATURE_FLAG_REQUIRED_AND_OWNER_GATES\"",
      "requiredBeforeEnablement: \"MOCK_FALLBACK_CONFIRMED\"",
      "requiredBeforeEnablement: \"AUDIT_NEGATIVE_ACCESS_EVIDENCE\"",
      "requiredBeforeEnablement: \"IT_DATA_RUNTIME_FLAG_SIGNOFF\"",
      "requiredBeforeEnablement: \"BGH_PRODUCTION_NO_GO_ACKNOWLEDGEMENT\"",
      "forbiddenInThisSlice: \"NO_ENV_ENABLEMENT\"",
    ],
    "disabled runtime seam verification source token",
    panelSourcePath,
  );

  requireTokens(
    component,
    [
      "TASK_CENTER_DISABLED_RUNTIME_SEAM_VERIFICATION_ONLY",
      "TASK_CENTER_DISABLED_RUNTIME_SEAM_VERIFICATION_READONLY",
      "TASK_CENTER_DISABLED_RUNTIME_SEAM_VERIFICATION_DRAFT_ONLY",
      "TASK_CENTER_DISABLED_RUNTIME_SEAM_VERIFICATION_NO_DATABASE_READ",
      "TASK_CENTER_DISABLED_RUNTIME_SEAM_VERIFICATION_NO_DATABASE_CLIENT",
      "TASK_CENTER_DISABLED_RUNTIME_SEAM_VERIFICATION_NO_TASK_MUTATION",
      "TASK_CENTER_DISABLED_RUNTIME_SEAM_VERIFICATION_NO_REAL_DATA",
      "TASK_CENTER_DISABLED_RUNTIME_SEAM_VERIFICATION_NO_ENV_ENABLEMENT",
      "TASK_CENTER_DISABLED_RUNTIME_SEAM_VERIFICATION_NO_AI_OR_AUTOMATION",
      "data-heu-task-center-disabled-runtime-seam-verification",
      "data-heu-task-center-disabled-runtime-seam-verification-readonly",
      "data-heu-task-center-disabled-runtime-seam-verification-draft-only",
      "data-heu-task-center-disabled-runtime-seam-verification-no-database-read",
      "data-heu-task-center-disabled-runtime-seam-verification-no-database-client",
      "data-heu-task-center-disabled-runtime-seam-verification-no-task-mutation",
      "data-heu-task-center-disabled-runtime-seam-verification-no-real-data",
      "data-heu-task-center-disabled-runtime-seam-verification-no-env-enablement",
      "data-heu-task-center-disabled-runtime-seam-verification-no-ai-or-automation",
      "data-heu-task-center-disabled-runtime-seam-item",
      "data-heu-task-center-disabled-runtime-seam-state",
      "data-heu-task-center-disabled-runtime-seam-required",
      "data-heu-task-center-disabled-runtime-seam-forbidden",
      "HEU-Data-019 - Disabled runtime seam verification",
      "Bang chung seam runtime van khoa truoc DB read",
      "gateEvidence.disabledRuntimeSeamVerification.items.map",
    ],
    "component disabled runtime seam verification token",
    componentPath,
  );

  requireTokens(
    doc,
    [
      "HEU-DATA-019-TASK-CENTER-DISABLED-RUNTIME-SEAM-VERIFICATION",
      "Status: PASS_LOCAL_DISABLED_RUNTIME_SEAM_VERIFICATION",
      "Production status: NO-GO",
      "TASK_CENTER_DISABLED_RUNTIME_SEAM_VERIFICATION_ONLY",
      "TASK_CENTER_DISABLED_RUNTIME_SEAM_VERIFICATION_READONLY",
      "TASK_CENTER_DISABLED_RUNTIME_SEAM_VERIFICATION_DRAFT_ONLY",
      "TASK_CENTER_DISABLED_RUNTIME_SEAM_VERIFICATION_NO_DATABASE_READ",
      "TASK_CENTER_DISABLED_RUNTIME_SEAM_VERIFICATION_NO_DATABASE_CLIENT",
      "TASK_CENTER_DISABLED_RUNTIME_SEAM_VERIFICATION_NO_TASK_MUTATION",
      "TASK_CENTER_DISABLED_RUNTIME_SEAM_VERIFICATION_NO_REAL_DATA",
      "TASK_CENTER_DISABLED_RUNTIME_SEAM_VERIFICATION_NO_ENV_ENABLEMENT",
      "TASK_CENTER_DISABLED_RUNTIME_SEAM_VERIFICATION_NO_AI_OR_AUTOMATION",
      "TASK_CENTER_READONLY_ADAPTER_DISABLED_BY_DEFAULT",
      "TASK_CENTER_MOCK_READONLY_FALLBACK_ACTIVE",
      "NO_DATABASE_CLIENT_CREATED",
      "NO_DATABASE_READ_EXECUTED",
      "NO_SQL_MIGRATION_CREATED",
      "NO_TASK_MUTATION_ROUTE_CREATED",
      "NO_REAL_USER_DATA",
      "NO_ENV_ENABLEMENT",
      "NO_AI_CALL_NO_AUTOMATION_STEP",
      "RUNTIME_SEAM_ADAPTER_DISABLED_DEFAULT",
      "RUNTIME_SEAM_FALLBACK_SOURCE_ACTIVE",
      "RUNTIME_SEAM_EMPTY_ADAPTER_ROWS",
      "RUNTIME_SEAM_NO_ENV_ENABLEMENT",
      "RUNTIME_SEAM_PRODUCTION_NO_GO",
      "TASK_CENTER_DATABASE_READY: NO_GO",
      "CAN_SUA_IT_DATA_AUDIT_PHAP_CHE_OWNER_BGH",
      "Task Center read-only adapter owner gate evidence matrix",
      "HEU-DATA-020-TASK-CENTER-OWNER-GATE-EVIDENCE-MATRIX",
      "check:heu-task-center-owner-gate-evidence-matrix-readiness",
      "still no DB read and no migration",
    ],
    "disabled runtime seam verification doc token",
    docPath,
  );

  requireTokens(
    ownerGateEvidenceMatrixDoc,
    [
      "HEU-DATA-020-TASK-CENTER-OWNER-GATE-EVIDENCE-MATRIX",
      "PASS_LOCAL_OWNER_GATE_EVIDENCE_MATRIX",
      "TASK_CENTER_OWNER_GATE_EVIDENCE_MATRIX_NO_DATABASE_READ",
      "TASK_CENTER_OWNER_GATE_EVIDENCE_MATRIX_NO_APPROVAL",
      "TASK_CENTER_OWNER_GATE_EVIDENCE_MATRIX_NO_REAL_DATA",
      "TASK_CENTER_DATABASE_READY: NO_GO",
      "OWNER_GATE_EVIDENCE_IT_DATA_SCOPE",
      "OWNER_GATE_EVIDENCE_AUDIT_NEGATIVE_ACCESS",
      "still no DB read and no migration",
    ],
    "owner gate evidence matrix doc token",
    ownerGateEvidenceMatrixDocPath,
  );

  requireTokens(
    adapterTestFixtureContractDoc,
    [
      "HEU-DATA-019-TASK-CENTER-DISABLED-RUNTIME-SEAM-VERIFICATION",
      "Task Center adapter disabled runtime seam verification",
      "still no DB read and no migration",
      "check:heu-task-center-disabled-runtime-seam-verification-readiness",
    ],
    "adapter test fixture contract next-slice token",
    adapterTestFixtureContractDocPath,
  );

  requireTokens(
    manifest,
    [
      componentPath,
      panelSourcePath,
      adapterSkeletonPath,
      uiFallbackSourcePath,
      docPath,
      ownerGateEvidenceMatrixDocPath,
      adapterTestFixtureContractDocPath,
      checkerPath,
      ownerGateEvidenceMatrixCheckerPath,
      adapterTestFixtureContractCheckerPath,
      "check:heu-task-center-disabled-runtime-seam-verification-readiness",
      "check:heu-task-center-owner-gate-evidence-matrix-readiness",
      "node --check scripts/check-heu-task-center-disabled-runtime-seam-verification-readiness.mjs",
      "node --check scripts/check-heu-task-center-owner-gate-evidence-matrix-readiness.mjs",
      "npm.cmd run check:heu-task-center-disabled-runtime-seam-verification-readiness",
      "npm.cmd run check:heu-task-center-owner-gate-evidence-matrix-readiness",
    ],
    "manifest disabled runtime seam verification token",
    manifestPath,
  );

  requireTokens(
    adapterTestFixtureContractChecker,
    [
      "HEU-DATA-019-TASK-CENTER-DISABLED-RUNTIME-SEAM-VERIFICATION",
      "check:heu-task-center-disabled-runtime-seam-verification-readiness",
      docPath,
      checkerPath,
    ],
    "adapter test fixture checker next-slice token",
    adapterTestFixtureContractCheckerPath,
  );

  if (packageJson.scripts?.[checkerAlias] !== checkerCommand) {
    fail(`${packagePath}: missing or mismatched ${checkerAlias}`);
  }

  if (
    packageJson.scripts?.[ownerGateEvidenceMatrixCheckerAlias] !==
    ownerGateEvidenceMatrixCheckerCommand
  ) {
    fail(
      `${packagePath}: missing or mismatched ${ownerGateEvidenceMatrixCheckerAlias}`,
    );
  }

  requireTokens(
    checkerScript,
    [
      "existsSync",
      "readFileSync",
      "HEU_TASK_CENTER_DISABLED_RUNTIME_SEAM_VERIFICATION_READY: PASS_LOCAL",
      "TASK_CENTER_DATABASE_READY: NO_GO_DISABLED_RUNTIME_SEAM_ONLY",
      "NO_RUNTIME_MUTATION: task center disabled runtime seam verification checker only; no database client, database read, env enablement, table creation, SQL migration, task write, file upload, storage write, real-data fixture, AI call, paid automation, deploy, finance action or production GO",
    ],
    "checker-script read-only token",
    checkerPath,
  );

  forbidPatterns(
    `${adapterSkeleton}\n${uiFallbackSource}\n${panelSource}\n${component}\n${doc}`,
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
    "task-center disabled runtime seam verification scope",
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
    "HEU Task Center disabled runtime seam verification readiness check failed:",
  );
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("HEU Task Center disabled runtime seam verification readiness check");
console.log("HEU_TASK_CENTER_DISABLED_RUNTIME_SEAM_VERIFICATION_READY: PASS_LOCAL");
console.log("TASK_CENTER_DATABASE_READY: NO_GO_DISABLED_RUNTIME_SEAM_ONLY");
console.log(
  "NO_RUNTIME_MUTATION: task center disabled runtime seam verification checker only; no database client, database read, env enablement, table creation, SQL migration, task write, file upload, storage write, real-data fixture, AI call, paid automation, deploy, finance action or production GO",
);
