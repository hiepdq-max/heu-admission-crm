import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const failures = [];

const componentPath = "components/data-confirmation/department-task-inbox.tsx";
const panelSourcePath = "lib/task-center-gate-evidence-panel-source.ts";
const enablementGatePath = "lib/task-center-readonly-adapter-enablement-gate.ts";
const docPath =
  "docs/HEU_CONTROL/HEU_DATA_027_TASK_CENTER_ADAPTER_DRY_RUN_SYNTHETIC_FIXTURE_CONTRACT_20260710.md";
const readonlyTestHarnessDocPath =
  "docs/HEU_CONTROL/HEU_DATA_026_TASK_CENTER_ADAPTER_DRY_RUN_READONLY_TEST_HARNESS_DESIGN_20260710.md";
const syntheticFixtureRunnerPlanDocPath =
  "docs/HEU_CONTROL/HEU_DATA_028_TASK_CENTER_ADAPTER_DRY_RUN_SYNTHETIC_FIXTURE_RUNNER_PLAN_20260710.md";
const manifestPath =
  "docs/HEU_CONTROL/HEU_APP_SHELL_001_STAGE_FILE_MANIFEST_20260709.md";
const readonlyTestHarnessCheckerPath =
  "scripts/check-heu-task-center-adapter-dry-run-readonly-test-harness-design.mjs";
const syntheticFixtureRunnerPlanCheckerPath =
  "scripts/check-heu-task-center-adapter-dry-run-synthetic-fixture-runner-plan.mjs";
const checkerPath =
  "scripts/check-heu-task-center-adapter-dry-run-synthetic-fixture-contract.mjs";
const packagePath = "package.json";
const checkerAlias =
  "check:heu-task-center-adapter-dry-run-synthetic-fixture-contract";
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
  readonlyTestHarnessDocPath,
  syntheticFixtureRunnerPlanDocPath,
  manifestPath,
  readonlyTestHarnessCheckerPath,
  syntheticFixtureRunnerPlanCheckerPath,
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
  const readonlyTestHarnessDoc = read(readonlyTestHarnessDocPath);
  const syntheticFixtureRunnerPlanDoc = read(syntheticFixtureRunnerPlanDocPath);
  const manifest = read(manifestPath);
  const readonlyTestHarnessChecker = read(readonlyTestHarnessCheckerPath);
  const syntheticFixtureRunnerPlanChecker = read(
    syntheticFixtureRunnerPlanCheckerPath,
  );
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
      "TASK_CENTER_ADAPTER_DRY_RUN_SYNTHETIC_FIXTURE_CONTRACT_ONLY",
      "TASK_CENTER_ADAPTER_DRY_RUN_SYNTHETIC_FIXTURE_CONTRACT_READONLY",
      "TASK_CENTER_ADAPTER_DRY_RUN_SYNTHETIC_FIXTURE_CONTRACT_DRAFT_ONLY",
      "TASK_CENTER_ADAPTER_DRY_RUN_SYNTHETIC_FIXTURE_CONTRACT_NO_APPROVAL",
      "TASK_CENTER_ADAPTER_DRY_RUN_SYNTHETIC_FIXTURE_CONTRACT_NO_DATABASE_READ",
      "TASK_CENTER_ADAPTER_DRY_RUN_SYNTHETIC_FIXTURE_CONTRACT_NO_DATABASE_CLIENT",
      "TASK_CENTER_ADAPTER_DRY_RUN_SYNTHETIC_FIXTURE_CONTRACT_NO_ENV_ENABLEMENT",
      "TASK_CENTER_ADAPTER_DRY_RUN_SYNTHETIC_FIXTURE_CONTRACT_NO_TASK_MUTATION",
      "TASK_CENTER_ADAPTER_DRY_RUN_SYNTHETIC_FIXTURE_CONTRACT_NO_REAL_DATA",
      "TASK_CENTER_ADAPTER_DRY_RUN_SYNTHETIC_FIXTURE_CONTRACT_NO_AI_OR_AUTOMATION",
      "TaskCenterAdapterDryRunSyntheticFixtureContractItem",
      "adapterDryRunSyntheticFixtureContractItems",
      "SYNTHETIC_FIXTURE_CONTRACT_READY: PASS_LOCAL_CONTRACT_ONLY",
      "TASK_CENTER_DATABASE_READY: NO_GO_SYNTHETIC_FIXTURE_CONTRACT_ONLY",
      "SYN_FIXTURE_IT_DATA_OWNER_SCOPE",
      "SYN_FIXTURE_AUDIT_NEGATIVE_NO_SCOPE",
      "SYN_FIXTURE_PHAP_CHE_RESTRICTED_ALLOWLIST",
      "SYN_FIXTURE_DEPARTMENT_MISMATCH",
      "SYN_FIXTURE_BGH_READONLY_OVERVIEW",
      "SYN_ACTOR_IT_DATA_SCOPED_READER",
      "SYN_ACTOR_AUDIT_NO_SCOPE",
      "SYN_ACTOR_LEGAL_REVIEWER_METADATA_ONLY",
      "SYN_ACTOR_DEPARTMENT_A",
      "SYN_ACTOR_BGH_READONLY",
      "SYN_TASK_DEPT_MATCHED_METADATA_ONLY",
      "SYN_TASK_ANY_DEPARTMENT_METADATA_ONLY",
      "SYN_TASK_RESTRICTED_FIELDS_MASKED",
      "SYN_TASK_DEPARTMENT_B_METADATA_ONLY",
      "SYN_TASK_AGGREGATE_STATUS_METADATA_ONLY",
      "ASSERT_VISIBLE_ROWS_REQUIRE_WORKSPACE_SCOPE",
      "ASSERT_NO_SCOPE_BLOCKED",
      "ASSERT_RAW_PII_PAYMENT_BANK_FIELDS_ABSENT",
      "ASSERT_WRONG_DEPARTMENT_BLOCKED",
      "ASSERT_NO_APPROVAL_NO_DATA_ENTRY",
      "NO_DATABASE_READ_EXECUTED",
      "NO_BROAD_ACCESS_PROOF_MISSING",
      "NO_RAW_PII_NO_PAYMENT_DATA",
      "NO_TASK_MUTATION_ROUTE_CREATED",
      "NO_PRODUCTION_GO_NO_DEPLOY",
    ],
    "synthetic fixture contract source token",
    panelSourcePath,
  );

  requireTokens(
    component,
    [
      "TASK_CENTER_ADAPTER_DRY_RUN_SYNTHETIC_FIXTURE_CONTRACT_ONLY",
      "TASK_CENTER_ADAPTER_DRY_RUN_SYNTHETIC_FIXTURE_CONTRACT_READONLY",
      "TASK_CENTER_ADAPTER_DRY_RUN_SYNTHETIC_FIXTURE_CONTRACT_DRAFT_ONLY",
      "TASK_CENTER_ADAPTER_DRY_RUN_SYNTHETIC_FIXTURE_CONTRACT_NO_APPROVAL",
      "TASK_CENTER_ADAPTER_DRY_RUN_SYNTHETIC_FIXTURE_CONTRACT_NO_DATABASE_READ",
      "TASK_CENTER_ADAPTER_DRY_RUN_SYNTHETIC_FIXTURE_CONTRACT_NO_DATABASE_CLIENT",
      "TASK_CENTER_ADAPTER_DRY_RUN_SYNTHETIC_FIXTURE_CONTRACT_NO_ENV_ENABLEMENT",
      "TASK_CENTER_ADAPTER_DRY_RUN_SYNTHETIC_FIXTURE_CONTRACT_NO_TASK_MUTATION",
      "TASK_CENTER_ADAPTER_DRY_RUN_SYNTHETIC_FIXTURE_CONTRACT_NO_REAL_DATA",
      "TASK_CENTER_ADAPTER_DRY_RUN_SYNTHETIC_FIXTURE_CONTRACT_NO_AI_OR_AUTOMATION",
      "data-heu-task-center-adapter-dry-run-synthetic-fixture-contract",
      "data-heu-task-center-adapter-dry-run-synthetic-fixture-contract-readonly",
      "data-heu-task-center-adapter-dry-run-synthetic-fixture-contract-draft-only",
      "data-heu-task-center-adapter-dry-run-synthetic-fixture-contract-no-approval",
      "data-heu-task-center-adapter-dry-run-synthetic-fixture-contract-no-database-read",
      "data-heu-task-center-adapter-dry-run-synthetic-fixture-contract-no-database-client",
      "data-heu-task-center-adapter-dry-run-synthetic-fixture-contract-no-env-enablement",
      "data-heu-task-center-adapter-dry-run-synthetic-fixture-contract-no-task-mutation",
      "data-heu-task-center-adapter-dry-run-synthetic-fixture-contract-no-real-data",
      "data-heu-task-center-adapter-dry-run-synthetic-fixture-contract-no-ai-or-automation",
      "data-heu-task-center-adapter-dry-run-synthetic-fixture-contract-item",
      "data-heu-task-center-adapter-dry-run-synthetic-fixture-contract-reviewer",
      "data-heu-task-center-adapter-dry-run-synthetic-fixture-contract-actor",
      "data-heu-task-center-adapter-dry-run-synthetic-fixture-contract-task",
      "data-heu-task-center-adapter-dry-run-synthetic-fixture-contract-assertion",
      "data-heu-task-center-adapter-dry-run-synthetic-fixture-contract-stop-rule",
      "HEU-Data-027 - Synthetic fixture contract",
      "Hop dong fixture gia lap cho dry-run harness",
      "gateEvidence.adapterDryRunSyntheticFixtureContract.items.map",
      "gateEvidence.adapterDryRunSyntheticFixtureContract.result",
    ],
    "component synthetic fixture contract token",
    componentPath,
  );

  requireTokens(
    doc,
    [
      "HEU-DATA-027-TASK-CENTER-ADAPTER-DRY-RUN-SYNTHETIC-FIXTURE-CONTRACT",
      "Status: PASS_LOCAL_CONTRACT_ONLY",
      "Production status: NO-GO",
      "Runtime status: SYNTHETIC_FIXTURE_CONTRACT_READY: PASS_LOCAL_CONTRACT_ONLY",
      "Database status: TASK_CENTER_DATABASE_READY: NO_GO_SYNTHETIC_FIXTURE_CONTRACT_ONLY",
      "TASK_CENTER_ADAPTER_DRY_RUN_SYNTHETIC_FIXTURE_CONTRACT_ONLY",
      "TASK_CENTER_ADAPTER_DRY_RUN_SYNTHETIC_FIXTURE_CONTRACT_READONLY",
      "TASK_CENTER_ADAPTER_DRY_RUN_SYNTHETIC_FIXTURE_CONTRACT_DRAFT_ONLY",
      "TASK_CENTER_ADAPTER_DRY_RUN_SYNTHETIC_FIXTURE_CONTRACT_NO_APPROVAL",
      "TASK_CENTER_ADAPTER_DRY_RUN_SYNTHETIC_FIXTURE_CONTRACT_NO_DATABASE_READ",
      "TASK_CENTER_ADAPTER_DRY_RUN_SYNTHETIC_FIXTURE_CONTRACT_NO_DATABASE_CLIENT",
      "TASK_CENTER_ADAPTER_DRY_RUN_SYNTHETIC_FIXTURE_CONTRACT_NO_ENV_ENABLEMENT",
      "TASK_CENTER_ADAPTER_DRY_RUN_SYNTHETIC_FIXTURE_CONTRACT_NO_TASK_MUTATION",
      "TASK_CENTER_ADAPTER_DRY_RUN_SYNTHETIC_FIXTURE_CONTRACT_NO_REAL_DATA",
      "TASK_CENTER_ADAPTER_DRY_RUN_SYNTHETIC_FIXTURE_CONTRACT_NO_AI_OR_AUTOMATION",
      "NO_DATABASE_CLIENT_CREATED",
      "NO_DATABASE_READ_EXECUTED",
      "NO_ENV_ENABLEMENT",
      "NO_TASK_MUTATION_ROUTE_CREATED",
      "NO_REAL_USER_DATA",
      "NO_AI_CALL_NO_AUTOMATION_STEP",
      "NO_RUNTIME_FIXTURE_FILE_CREATED",
      "SYN_FIXTURE_IT_DATA_OWNER_SCOPE",
      "SYN_FIXTURE_AUDIT_NEGATIVE_NO_SCOPE",
      "SYN_FIXTURE_PHAP_CHE_RESTRICTED_ALLOWLIST",
      "SYN_FIXTURE_DEPARTMENT_MISMATCH",
      "SYN_FIXTURE_BGH_READONLY_OVERVIEW",
      "HEU-DATA-028-TASK-CENTER-ADAPTER-DRY-RUN-SYNTHETIC-FIXTURE-RUNNER-PLAN",
      "SYNTHETIC_FIXTURE_RUNNER_PLAN_READY: PASS_LOCAL_PLAN_ONLY",
      "check:heu-task-center-adapter-dry-run-synthetic-fixture-runner-plan",
      "check:heu-task-center-adapter-dry-run-synthetic-fixture-contract",
    ],
    "synthetic fixture contract doc token",
    docPath,
  );

  requireTokens(
    readonlyTestHarnessDoc,
    [
      "HEU-DATA-027-TASK-CENTER-ADAPTER-DRY-RUN-SYNTHETIC-FIXTURE-CONTRACT",
      "SYNTHETIC_FIXTURE_CONTRACT_READY: PASS_LOCAL_CONTRACT_ONLY",
      "check:heu-task-center-adapter-dry-run-synthetic-fixture-contract",
    ],
    "readonly test-harness design next-slice token",
    readonlyTestHarnessDocPath,
  );

  requireTokens(
    manifest,
    [
      componentPath,
      panelSourcePath,
      enablementGatePath,
      docPath,
      readonlyTestHarnessDocPath,
      syntheticFixtureRunnerPlanDocPath,
      checkerPath,
      readonlyTestHarnessCheckerPath,
      syntheticFixtureRunnerPlanCheckerPath,
      "check:heu-task-center-adapter-dry-run-synthetic-fixture-contract",
      "check:heu-task-center-adapter-dry-run-synthetic-fixture-runner-plan",
      "node --check scripts/check-heu-task-center-adapter-dry-run-synthetic-fixture-contract.mjs",
      "node --check scripts/check-heu-task-center-adapter-dry-run-synthetic-fixture-runner-plan.mjs",
      "npm.cmd run check:heu-task-center-adapter-dry-run-synthetic-fixture-contract",
      "npm.cmd run check:heu-task-center-adapter-dry-run-synthetic-fixture-runner-plan",
    ],
    "manifest synthetic fixture contract token",
    manifestPath,
  );

  requireTokens(
    syntheticFixtureRunnerPlanDoc,
    [
      "HEU-DATA-028-TASK-CENTER-ADAPTER-DRY-RUN-SYNTHETIC-FIXTURE-RUNNER-PLAN",
      "SYNTHETIC_FIXTURE_RUNNER_PLAN_READY: PASS_LOCAL_PLAN_ONLY",
      "TASK_CENTER_DATABASE_READY: NO_GO_SYNTHETIC_FIXTURE_RUNNER_PLAN_ONLY",
      "HEU-DATA-029-TASK-CENTER-ADAPTER-DRY-RUN-RUNNER-STATIC-CHECK-DESIGN",
    ],
    "synthetic fixture runner plan next-slice doc token",
    syntheticFixtureRunnerPlanDocPath,
  );

  requireTokens(
    readonlyTestHarnessChecker,
    [
      "HEU-DATA-027-TASK-CENTER-ADAPTER-DRY-RUN-SYNTHETIC-FIXTURE-CONTRACT",
      "check:heu-task-center-adapter-dry-run-synthetic-fixture-contract",
      docPath,
      checkerPath,
    ],
    "readonly test-harness checker next-slice token",
    readonlyTestHarnessCheckerPath,
  );

  requireTokens(
    syntheticFixtureRunnerPlanChecker,
    [
      "HEU_TASK_CENTER_ADAPTER_DRY_RUN_SYNTHETIC_FIXTURE_RUNNER_PLAN_READY: PASS_LOCAL",
      "TASK_CENTER_DATABASE_READY: NO_GO_SYNTHETIC_FIXTURE_RUNNER_PLAN_ONLY",
      docPath,
      checkerPath,
    ],
    "synthetic fixture runner plan checker reverse-link token",
    syntheticFixtureRunnerPlanCheckerPath,
  );

  if (packageJson.scripts?.[checkerAlias] !== checkerCommand) {
    fail(`${packagePath}: missing or mismatched ${checkerAlias}`);
  }

  requireTokens(
    checkerScript,
    [
      "existsSync",
      "readFileSync",
      "HEU_TASK_CENTER_ADAPTER_DRY_RUN_SYNTHETIC_FIXTURE_CONTRACT_READY: PASS_LOCAL",
      "TASK_CENTER_DATABASE_READY: NO_GO_SYNTHETIC_FIXTURE_CONTRACT_ONLY",
      "NO_RUNTIME_MUTATION: task center adapter dry-run synthetic fixture contract checker only; no owner approval, database client, database read, env enablement, runtime fixture file, table creation, SQL migration, task write, file upload, storage write, real-data fixture, AI call, paid automation, deploy, finance action or production GO",
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
    "task-center adapter dry-run synthetic fixture contract scope",
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
    "HEU Task Center adapter dry-run synthetic fixture contract check failed:",
  );
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("HEU Task Center adapter dry-run synthetic fixture contract check");
console.log(
  "HEU_TASK_CENTER_ADAPTER_DRY_RUN_SYNTHETIC_FIXTURE_CONTRACT_READY: PASS_LOCAL",
);
console.log(
  "TASK_CENTER_DATABASE_READY: NO_GO_SYNTHETIC_FIXTURE_CONTRACT_ONLY",
);
console.log(
  "NO_RUNTIME_MUTATION: task center adapter dry-run synthetic fixture contract checker only; no owner approval, database client, database read, env enablement, runtime fixture file, table creation, SQL migration, task write, file upload, storage write, real-data fixture, AI call, paid automation, deploy, finance action or production GO",
);
