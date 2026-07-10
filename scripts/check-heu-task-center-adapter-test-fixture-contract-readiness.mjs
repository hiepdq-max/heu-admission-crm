import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const failures = [];

const componentPath = "components/data-confirmation/department-task-inbox.tsx";
const panelSourcePath = "lib/task-center-gate-evidence-panel-source.ts";
const docPath =
  "docs/HEU_CONTROL/HEU_DATA_018_TASK_CENTER_ADAPTER_TEST_FIXTURE_CONTRACT_20260710.md";
const disabledRuntimeSeamVerificationDocPath =
  "docs/HEU_CONTROL/HEU_DATA_019_TASK_CENTER_DISABLED_RUNTIME_SEAM_VERIFICATION_20260710.md";
const dbReadAdapterImplementationPlanDocPath =
  "docs/HEU_CONTROL/HEU_DATA_017_TASK_CENTER_DB_READ_ADAPTER_IMPLEMENTATION_PLAN_20260710.md";
const manifestPath =
  "docs/HEU_CONTROL/HEU_APP_SHELL_001_STAGE_FILE_MANIFEST_20260709.md";
const dbReadAdapterImplementationPlanCheckerPath =
  "scripts/check-heu-task-center-db-read-adapter-implementation-plan-readiness.mjs";
const disabledRuntimeSeamVerificationCheckerPath =
  "scripts/check-heu-task-center-disabled-runtime-seam-verification-readiness.mjs";
const checkerPath =
  "scripts/check-heu-task-center-adapter-test-fixture-contract-readiness.mjs";
const packagePath = "package.json";
const checkerAlias =
  "check:heu-task-center-adapter-test-fixture-contract-readiness";
const checkerCommand = `node ${checkerPath}`;
const disabledRuntimeSeamVerificationCheckerAlias =
  "check:heu-task-center-disabled-runtime-seam-verification-readiness";
const disabledRuntimeSeamVerificationCheckerCommand =
  `node ${disabledRuntimeSeamVerificationCheckerPath}`;

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
  docPath,
  disabledRuntimeSeamVerificationDocPath,
  dbReadAdapterImplementationPlanDocPath,
  manifestPath,
  dbReadAdapterImplementationPlanCheckerPath,
  disabledRuntimeSeamVerificationCheckerPath,
  checkerPath,
  packagePath,
]) {
  requireFile(file);
}

if (failures.length === 0) {
  const component = read(componentPath);
  const panelSource = read(panelSourcePath);
  const doc = read(docPath);
  const disabledRuntimeSeamVerificationDoc = read(
    disabledRuntimeSeamVerificationDocPath,
  );
  const dbReadAdapterImplementationPlanDoc = read(
    dbReadAdapterImplementationPlanDocPath,
  );
  const manifest = read(manifestPath);
  const dbReadAdapterImplementationPlanChecker = read(
    dbReadAdapterImplementationPlanCheckerPath,
  );
  const checkerScript = read(checkerPath);
  const packageJson = JSON.parse(read(packagePath));

  requireTokens(
    panelSource,
    [
      "TASK_CENTER_ADAPTER_TEST_FIXTURE_CONTRACT_ONLY",
      "TASK_CENTER_ADAPTER_TEST_FIXTURE_CONTRACT_READONLY",
      "TASK_CENTER_ADAPTER_TEST_FIXTURE_CONTRACT_DRAFT_ONLY",
      "TASK_CENTER_ADAPTER_TEST_FIXTURE_CONTRACT_NO_DATABASE_READ",
      "TASK_CENTER_ADAPTER_TEST_FIXTURE_CONTRACT_NO_DATABASE_CLIENT",
      "TASK_CENTER_ADAPTER_TEST_FIXTURE_CONTRACT_NO_TASK_MUTATION",
      "TASK_CENTER_ADAPTER_TEST_FIXTURE_CONTRACT_NO_REAL_DATA",
      "TASK_CENTER_ADAPTER_TEST_FIXTURE_CONTRACT_NO_AI_OR_AUTOMATION",
      "TaskCenterAdapterTestFixtureContractItem",
      "adapterTestFixtureContractItems",
      "FIXTURE_CONTRACT_SCOPE_INCLUDED",
      "FIXTURE_CONTRACT_SCOPE_EXCLUDED",
      "FIXTURE_CONTRACT_RESTRICTED_FIELD_MASK",
      "FIXTURE_CONTRACT_STATUS_READONLY",
      "FIXTURE_CONTRACT_OWNER_GATE_NO_GO",
      "fixtureMode: \"SYNTHETIC_CONTRACT\"",
      "workspaceLane: \"ADMISSION_SYNTHETIC_LANE\"",
      "workspaceLane: \"CTHSSV_NEGATIVE_ACCESS_LANE\"",
      "workspaceLane: \"PHAP_CHE_METADATA_ONLY_LANE\"",
      "workspaceLane: \"READONLY_TASK_STATUS_LANE\"",
      "workspaceLane: \"BGH_PRODUCTION_NO_GO_LANE\"",
      "requiredBeforeDbRead: \"IT_DATA_SCOPE_FIRST_FILTER_SIGNOFF\"",
      "requiredBeforeDbRead: \"AUDIT_NEGATIVE_ACCESS_EVIDENCE\"",
      "requiredBeforeDbRead: \"PHAP_CHE_RESTRICTED_DATA_BOUNDARY_SIGNOFF\"",
      "requiredBeforeDbRead: \"DEPARTMENT_OWNER_TASK_LABEL_ACCEPTANCE\"",
      "requiredBeforeDbRead: \"BGH_PRODUCTION_NO_GO_ACKNOWLEDGEMENT\"",
      "forbiddenInThisSlice: \"NO_REAL_USER_DATA\"",
      "forbiddenInThisSlice: \"NO_DATABASE_READ_EXECUTED\"",
      "forbiddenInThisSlice: \"NO_RAW_PII_NO_PAYMENT_DATA\"",
      "forbiddenInThisSlice: \"NO_TASK_MUTATION_ROUTE_CREATED\"",
      "forbiddenInThisSlice: \"NO_PRODUCTION_GO_NO_DEPLOY\"",
    ],
    "adapter test fixture contract source token",
    panelSourcePath,
  );

  requireTokens(
    component,
    [
      "TASK_CENTER_ADAPTER_TEST_FIXTURE_CONTRACT_ONLY",
      "TASK_CENTER_ADAPTER_TEST_FIXTURE_CONTRACT_READONLY",
      "TASK_CENTER_ADAPTER_TEST_FIXTURE_CONTRACT_DRAFT_ONLY",
      "TASK_CENTER_ADAPTER_TEST_FIXTURE_CONTRACT_NO_DATABASE_READ",
      "TASK_CENTER_ADAPTER_TEST_FIXTURE_CONTRACT_NO_DATABASE_CLIENT",
      "TASK_CENTER_ADAPTER_TEST_FIXTURE_CONTRACT_NO_TASK_MUTATION",
      "TASK_CENTER_ADAPTER_TEST_FIXTURE_CONTRACT_NO_REAL_DATA",
      "TASK_CENTER_ADAPTER_TEST_FIXTURE_CONTRACT_NO_AI_OR_AUTOMATION",
      "data-heu-task-center-adapter-test-fixture-contract",
      "data-heu-task-center-adapter-test-fixture-contract-readonly",
      "data-heu-task-center-adapter-test-fixture-contract-draft-only",
      "data-heu-task-center-adapter-test-fixture-contract-no-database-read",
      "data-heu-task-center-adapter-test-fixture-contract-no-database-client",
      "data-heu-task-center-adapter-test-fixture-contract-no-task-mutation",
      "data-heu-task-center-adapter-test-fixture-contract-no-real-data",
      "data-heu-task-center-adapter-test-fixture-contract-no-ai-or-automation",
      "data-heu-task-center-adapter-test-fixture-item",
      "data-heu-task-center-adapter-test-fixture-mode",
      "data-heu-task-center-adapter-test-fixture-lane",
      "data-heu-task-center-adapter-test-fixture-required",
      "data-heu-task-center-adapter-test-fixture-forbidden",
      "HEU-Data-018 - Adapter test fixture contract",
      "Hop dong fixture synthetic truoc khi mo DB read",
      "gateEvidence.adapterTestFixtureContract.items.map",
    ],
    "component adapter test fixture contract token",
    componentPath,
  );

  requireTokens(
    doc,
    [
      "HEU-DATA-018-TASK-CENTER-ADAPTER-TEST-FIXTURE-CONTRACT",
      "Status: PASS_LOCAL_ADAPTER_TEST_FIXTURE_CONTRACT",
      "Production status: NO-GO",
      "TASK_CENTER_ADAPTER_TEST_FIXTURE_CONTRACT_ONLY",
      "TASK_CENTER_ADAPTER_TEST_FIXTURE_CONTRACT_READONLY",
      "TASK_CENTER_ADAPTER_TEST_FIXTURE_CONTRACT_DRAFT_ONLY",
      "TASK_CENTER_ADAPTER_TEST_FIXTURE_CONTRACT_NO_DATABASE_READ",
      "TASK_CENTER_ADAPTER_TEST_FIXTURE_CONTRACT_NO_DATABASE_CLIENT",
      "TASK_CENTER_ADAPTER_TEST_FIXTURE_CONTRACT_NO_TASK_MUTATION",
      "TASK_CENTER_ADAPTER_TEST_FIXTURE_CONTRACT_NO_REAL_DATA",
      "TASK_CENTER_ADAPTER_TEST_FIXTURE_CONTRACT_NO_AI_OR_AUTOMATION",
      "TASK_CENTER_GATE_EVIDENCE_PANEL_DATABASE_NO_GO",
      "NO_DATABASE_CLIENT_CREATED",
      "NO_DATABASE_READ_EXECUTED",
      "NO_SQL_MIGRATION_CREATED",
      "NO_TASK_MUTATION_ROUTE_CREATED",
      "NO_REAL_USER_DATA",
      "NO_AI_CALL_NO_AUTOMATION_STEP",
      "FIXTURE_CONTRACT_SCOPE_INCLUDED",
      "FIXTURE_CONTRACT_SCOPE_EXCLUDED",
      "FIXTURE_CONTRACT_RESTRICTED_FIELD_MASK",
      "FIXTURE_CONTRACT_STATUS_READONLY",
      "FIXTURE_CONTRACT_OWNER_GATE_NO_GO",
      "TASK_CENTER_DATABASE_READY: NO_GO",
      "CAN_SUA_IT_DATA_AUDIT_PHAP_CHE_OWNER_BGH",
      "Task Center adapter disabled runtime seam verification",
      "HEU-DATA-019-TASK-CENTER-DISABLED-RUNTIME-SEAM-VERIFICATION",
      "check:heu-task-center-disabled-runtime-seam-verification-readiness",
      "still no DB read and no migration",
    ],
    "adapter test fixture contract doc token",
    docPath,
  );

  requireTokens(
    disabledRuntimeSeamVerificationDoc,
    [
      "HEU-DATA-019-TASK-CENTER-DISABLED-RUNTIME-SEAM-VERIFICATION",
      "PASS_LOCAL_DISABLED_RUNTIME_SEAM_VERIFICATION",
      "TASK_CENTER_DISABLED_RUNTIME_SEAM_VERIFICATION_NO_DATABASE_READ",
      "TASK_CENTER_DISABLED_RUNTIME_SEAM_VERIFICATION_NO_ENV_ENABLEMENT",
      "TASK_CENTER_DISABLED_RUNTIME_SEAM_VERIFICATION_NO_REAL_DATA",
      "TASK_CENTER_DATABASE_READY: NO_GO",
      "RUNTIME_SEAM_ADAPTER_DISABLED_DEFAULT",
      "RUNTIME_SEAM_FALLBACK_SOURCE_ACTIVE",
      "still no DB read and no migration",
    ],
    "disabled runtime seam verification doc token",
    disabledRuntimeSeamVerificationDocPath,
  );

  requireTokens(
    dbReadAdapterImplementationPlanDoc,
    [
      "HEU-DATA-018-TASK-CENTER-ADAPTER-TEST-FIXTURE-CONTRACT",
      "Task Center adapter test fixture contract",
      "still no DB read and no migration",
      "check:heu-task-center-adapter-test-fixture-contract-readiness",
    ],
    "db-read adapter implementation plan next-slice token",
    dbReadAdapterImplementationPlanDocPath,
  );

  requireTokens(
    manifest,
    [
      componentPath,
      panelSourcePath,
      docPath,
      disabledRuntimeSeamVerificationDocPath,
      dbReadAdapterImplementationPlanDocPath,
      checkerPath,
      disabledRuntimeSeamVerificationCheckerPath,
      dbReadAdapterImplementationPlanCheckerPath,
      "check:heu-task-center-adapter-test-fixture-contract-readiness",
      "check:heu-task-center-disabled-runtime-seam-verification-readiness",
      "node --check scripts/check-heu-task-center-adapter-test-fixture-contract-readiness.mjs",
      "node --check scripts/check-heu-task-center-disabled-runtime-seam-verification-readiness.mjs",
      "npm.cmd run check:heu-task-center-adapter-test-fixture-contract-readiness",
      "npm.cmd run check:heu-task-center-disabled-runtime-seam-verification-readiness",
    ],
    "manifest adapter test fixture contract token",
    manifestPath,
  );

  requireTokens(
    dbReadAdapterImplementationPlanChecker,
    [
      "HEU-DATA-018-TASK-CENTER-ADAPTER-TEST-FIXTURE-CONTRACT",
      "check:heu-task-center-adapter-test-fixture-contract-readiness",
      docPath,
      checkerPath,
    ],
    "db-read adapter implementation checker next-slice token",
    dbReadAdapterImplementationPlanCheckerPath,
  );

  if (packageJson.scripts?.[checkerAlias] !== checkerCommand) {
    fail(`${packagePath}: missing or mismatched ${checkerAlias}`);
  }

  if (
    packageJson.scripts?.[disabledRuntimeSeamVerificationCheckerAlias] !==
    disabledRuntimeSeamVerificationCheckerCommand
  ) {
    fail(
      `${packagePath}: missing or mismatched ${disabledRuntimeSeamVerificationCheckerAlias}`,
    );
  }

  requireTokens(
    checkerScript,
    [
      "existsSync",
      "readFileSync",
      "HEU_TASK_CENTER_ADAPTER_TEST_FIXTURE_CONTRACT_READY: PASS_LOCAL",
      "TASK_CENTER_DATABASE_READY: NO_GO_TEST_FIXTURE_CONTRACT_ONLY",
      "NO_RUNTIME_MUTATION: task center adapter test fixture contract checker only; no database client, database read, table creation, SQL migration, task write, file upload, storage write, real-data fixture, AI call, paid automation, deploy, finance action or production GO",
    ],
    "checker-script read-only token",
    checkerPath,
  );

  forbidPatterns(
    `${panelSource}\n${component}\n${doc}`,
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
    "task-center adapter test fixture contract scope",
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
    "HEU Task Center adapter test fixture contract readiness check failed:",
  );
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("HEU Task Center adapter test fixture contract readiness check");
console.log("HEU_TASK_CENTER_ADAPTER_TEST_FIXTURE_CONTRACT_READY: PASS_LOCAL");
console.log("TASK_CENTER_DATABASE_READY: NO_GO_TEST_FIXTURE_CONTRACT_ONLY");
console.log(
  "NO_RUNTIME_MUTATION: task center adapter test fixture contract checker only; no database client, database read, table creation, SQL migration, task write, file upload, storage write, real-data fixture, AI call, paid automation, deploy, finance action or production GO",
);
