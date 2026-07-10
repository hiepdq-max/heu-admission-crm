import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const failures = [];

const componentPath = "components/data-confirmation/department-task-inbox.tsx";
const panelSourcePath = "lib/task-center-gate-evidence-panel-source.ts";
const enablementGatePath = "lib/task-center-readonly-adapter-enablement-gate.ts";
const docPath =
  "docs/HEU_CONTROL/HEU_DATA_029_TASK_CENTER_ADAPTER_DRY_RUN_RUNNER_STATIC_CHECK_DESIGN_20260710.md";
const runnerPlanDocPath =
  "docs/HEU_CONTROL/HEU_DATA_028_TASK_CENTER_ADAPTER_DRY_RUN_SYNTHETIC_FIXTURE_RUNNER_PLAN_20260710.md";
const manifestPath =
  "docs/HEU_CONTROL/HEU_APP_SHELL_001_STAGE_FILE_MANIFEST_20260709.md";
const runnerPlanCheckerPath =
  "scripts/check-heu-task-center-adapter-dry-run-synthetic-fixture-runner-plan.mjs";
const checkerPath =
  "scripts/check-heu-task-center-adapter-dry-run-runner-static-check-design.mjs";
const packagePath = "package.json";
const checkerAlias =
  "check:heu-task-center-adapter-dry-run-runner-static-check-design";
const checkerCommand = `node ${checkerPath}`;

const runtimeRunnerCandidatePaths = [
  "scripts/run-heu-task-center-adapter-dry-run-runner.mjs",
  "scripts/runner-heu-task-center-adapter-dry-run.mjs",
  "lib/task-center-adapter-dry-run-runner.ts",
  "lib/task-center-adapter-dry-run-fixtures.ts",
];

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

function requireAbsentFile(relativePath) {
  if (existsSync(absolute(relativePath))) {
    fail(`Runtime runner/fixture file must not exist in this design slice: ${relativePath}`);
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
  runnerPlanDocPath,
  manifestPath,
  runnerPlanCheckerPath,
  checkerPath,
  packagePath,
]) {
  requireFile(file);
}

for (const file of runtimeRunnerCandidatePaths) {
  requireAbsentFile(file);
}

if (failures.length === 0) {
  const component = read(componentPath);
  const panelSource = read(panelSourcePath);
  const enablementGate = read(enablementGatePath);
  const doc = read(docPath);
  const runnerPlanDoc = read(runnerPlanDocPath);
  const manifest = read(manifestPath);
  const runnerPlanChecker = read(runnerPlanCheckerPath);
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
      "TASK_CENTER_ADAPTER_DRY_RUN_RUNNER_STATIC_CHECK_DESIGN_ONLY",
      "TASK_CENTER_ADAPTER_DRY_RUN_RUNNER_STATIC_CHECK_DESIGN_READONLY",
      "TASK_CENTER_ADAPTER_DRY_RUN_RUNNER_STATIC_CHECK_DESIGN_DRAFT_ONLY",
      "TASK_CENTER_ADAPTER_DRY_RUN_RUNNER_STATIC_CHECK_DESIGN_NO_APPROVAL",
      "TASK_CENTER_ADAPTER_DRY_RUN_RUNNER_STATIC_CHECK_DESIGN_NO_DATABASE_READ",
      "TASK_CENTER_ADAPTER_DRY_RUN_RUNNER_STATIC_CHECK_DESIGN_NO_DATABASE_CLIENT",
      "TASK_CENTER_ADAPTER_DRY_RUN_RUNNER_STATIC_CHECK_DESIGN_NO_ENV_ENABLEMENT",
      "TASK_CENTER_ADAPTER_DRY_RUN_RUNNER_STATIC_CHECK_DESIGN_NO_TASK_MUTATION",
      "TASK_CENTER_ADAPTER_DRY_RUN_RUNNER_STATIC_CHECK_DESIGN_NO_REAL_DATA",
      "TASK_CENTER_ADAPTER_DRY_RUN_RUNNER_STATIC_CHECK_DESIGN_NO_AI_OR_AUTOMATION",
      "TaskCenterAdapterDryRunRunnerStaticCheckDesignItem",
      "adapterDryRunRunnerStaticCheckDesignItems",
      "RUNNER_STATIC_CHECK_DESIGN_READY: PASS_LOCAL_DESIGN_ONLY",
      "TASK_CENTER_DATABASE_READY: NO_GO_RUNNER_STATIC_CHECK_DESIGN_ONLY",
      "STATIC_CHECK_RUNNER_FILE_ABSENT",
      "STATIC_CHECK_NO_DB_CLIENT",
      "STATIC_CHECK_NO_RESTRICTED_DATA",
      "STATIC_CHECK_NO_TASK_MUTATION",
      "STATIC_CHECK_NO_PRODUCTION_SIGNAL",
      "ASSERT_NO_RUNTIME_RUNNER_FILE",
      "ASSERT_NO_DATABASE_CLIENT_OR_READ",
      "ASSERT_NO_RAW_PII_PAYMENT_BANK_FIXTURE",
      "ASSERT_NO_TASK_WRITE_OR_STATUS_CHANGE",
      "ASSERT_NO_DEPLOY_OR_PRODUCTION_GO",
      "SOURCE_TREE_ONLY",
      "DOC_AND_SOURCE_TOKENS_ONLY",
      "RUNNER_FILE_ABSENT_CONFIRMED",
      "NO_DATABASE_CLIENT_CREATED",
      "NO_RAW_PII_NO_PAYMENT_DATA",
      "NO_TASK_MUTATION_ROUTE_CREATED",
      "NO_PRODUCTION_GO_NO_DEPLOY",
    ],
    "runner static-check design source token",
    panelSourcePath,
  );

  requireTokens(
    component,
    [
      "TASK_CENTER_ADAPTER_DRY_RUN_RUNNER_STATIC_CHECK_DESIGN_ONLY",
      "TASK_CENTER_ADAPTER_DRY_RUN_RUNNER_STATIC_CHECK_DESIGN_READONLY",
      "TASK_CENTER_ADAPTER_DRY_RUN_RUNNER_STATIC_CHECK_DESIGN_DRAFT_ONLY",
      "TASK_CENTER_ADAPTER_DRY_RUN_RUNNER_STATIC_CHECK_DESIGN_NO_APPROVAL",
      "TASK_CENTER_ADAPTER_DRY_RUN_RUNNER_STATIC_CHECK_DESIGN_NO_DATABASE_READ",
      "TASK_CENTER_ADAPTER_DRY_RUN_RUNNER_STATIC_CHECK_DESIGN_NO_DATABASE_CLIENT",
      "TASK_CENTER_ADAPTER_DRY_RUN_RUNNER_STATIC_CHECK_DESIGN_NO_ENV_ENABLEMENT",
      "TASK_CENTER_ADAPTER_DRY_RUN_RUNNER_STATIC_CHECK_DESIGN_NO_TASK_MUTATION",
      "TASK_CENTER_ADAPTER_DRY_RUN_RUNNER_STATIC_CHECK_DESIGN_NO_REAL_DATA",
      "TASK_CENTER_ADAPTER_DRY_RUN_RUNNER_STATIC_CHECK_DESIGN_NO_AI_OR_AUTOMATION",
      "data-heu-task-center-adapter-dry-run-runner-static-check-design",
      "data-heu-task-center-adapter-dry-run-runner-static-check-design-readonly",
      "data-heu-task-center-adapter-dry-run-runner-static-check-design-draft-only",
      "data-heu-task-center-adapter-dry-run-runner-static-check-design-no-approval",
      "data-heu-task-center-adapter-dry-run-runner-static-check-design-no-database-read",
      "data-heu-task-center-adapter-dry-run-runner-static-check-design-no-database-client",
      "data-heu-task-center-adapter-dry-run-runner-static-check-design-no-env-enablement",
      "data-heu-task-center-adapter-dry-run-runner-static-check-design-no-task-mutation",
      "data-heu-task-center-adapter-dry-run-runner-static-check-design-no-real-data",
      "data-heu-task-center-adapter-dry-run-runner-static-check-design-no-ai-or-automation",
      "data-heu-task-center-adapter-dry-run-runner-static-check-design-item",
      "data-heu-task-center-adapter-dry-run-runner-static-check-design-reviewer",
      "data-heu-task-center-adapter-dry-run-runner-static-check-design-check",
      "data-heu-task-center-adapter-dry-run-runner-static-check-design-input",
      "data-heu-task-center-adapter-dry-run-runner-static-check-design-output",
      "data-heu-task-center-adapter-dry-run-runner-static-check-design-stop-rule",
      "HEU-Data-029 - Runner static-check design",
      "Thiet ke static-check cho runner dry-run",
      "gateEvidence.adapterDryRunRunnerStaticCheckDesign.items.map",
      "gateEvidence.adapterDryRunRunnerStaticCheckDesign.result",
    ],
    "component runner static-check design token",
    componentPath,
  );

  requireTokens(
    doc,
    [
      "HEU-DATA-029-TASK-CENTER-ADAPTER-DRY-RUN-RUNNER-STATIC-CHECK-DESIGN",
      "Status: PASS_LOCAL_DESIGN_ONLY",
      "Production status: NO-GO",
      "Runtime status: RUNNER_STATIC_CHECK_DESIGN_READY: PASS_LOCAL_DESIGN_ONLY",
      "Database status: TASK_CENTER_DATABASE_READY: NO_GO_RUNNER_STATIC_CHECK_DESIGN_ONLY",
      "TASK_CENTER_ADAPTER_DRY_RUN_RUNNER_STATIC_CHECK_DESIGN_ONLY",
      "TASK_CENTER_ADAPTER_DRY_RUN_RUNNER_STATIC_CHECK_DESIGN_READONLY",
      "TASK_CENTER_ADAPTER_DRY_RUN_RUNNER_STATIC_CHECK_DESIGN_DRAFT_ONLY",
      "TASK_CENTER_ADAPTER_DRY_RUN_RUNNER_STATIC_CHECK_DESIGN_NO_APPROVAL",
      "TASK_CENTER_ADAPTER_DRY_RUN_RUNNER_STATIC_CHECK_DESIGN_NO_DATABASE_READ",
      "TASK_CENTER_ADAPTER_DRY_RUN_RUNNER_STATIC_CHECK_DESIGN_NO_DATABASE_CLIENT",
      "TASK_CENTER_ADAPTER_DRY_RUN_RUNNER_STATIC_CHECK_DESIGN_NO_ENV_ENABLEMENT",
      "TASK_CENTER_ADAPTER_DRY_RUN_RUNNER_STATIC_CHECK_DESIGN_NO_TASK_MUTATION",
      "TASK_CENTER_ADAPTER_DRY_RUN_RUNNER_STATIC_CHECK_DESIGN_NO_REAL_DATA",
      "TASK_CENTER_ADAPTER_DRY_RUN_RUNNER_STATIC_CHECK_DESIGN_NO_AI_OR_AUTOMATION",
      "NO_DATABASE_CLIENT_CREATED",
      "NO_DATABASE_READ_EXECUTED",
      "NO_ENV_ENABLEMENT",
      "NO_TASK_MUTATION_ROUTE_CREATED",
      "NO_REAL_USER_DATA",
      "NO_AI_CALL_NO_AUTOMATION_STEP",
      "NO_RUNTIME_FIXTURE_FILE_CREATED",
      "NO_RUNTIME_RUNNER_FILE_CREATED",
      "STATIC_CHECK_RUNNER_FILE_ABSENT",
      "STATIC_CHECK_NO_DB_CLIENT",
      "STATIC_CHECK_NO_RESTRICTED_DATA",
      "STATIC_CHECK_NO_TASK_MUTATION",
      "STATIC_CHECK_NO_PRODUCTION_SIGNAL",
      "HEU-DATA-030-TASK-CENTER-ADAPTER-DRY-RUN-LOCAL-RUNNER-CANDIDATE-READINESS",
      "check:heu-task-center-adapter-dry-run-runner-static-check-design",
    ],
    "runner static-check design doc token",
    docPath,
  );

  requireTokens(
    runnerPlanDoc,
    [
      "HEU-DATA-029-TASK-CENTER-ADAPTER-DRY-RUN-RUNNER-STATIC-CHECK-DESIGN",
      "RUNNER_STATIC_CHECK_DESIGN_READY: PASS_LOCAL_DESIGN_ONLY",
      "check:heu-task-center-adapter-dry-run-runner-static-check-design",
    ],
    "synthetic fixture runner plan next-slice token",
    runnerPlanDocPath,
  );

  requireTokens(
    manifest,
    [
      componentPath,
      panelSourcePath,
      enablementGatePath,
      docPath,
      runnerPlanDocPath,
      checkerPath,
      runnerPlanCheckerPath,
      "check:heu-task-center-adapter-dry-run-runner-static-check-design",
      "node --check scripts/check-heu-task-center-adapter-dry-run-runner-static-check-design.mjs",
      "npm.cmd run check:heu-task-center-adapter-dry-run-runner-static-check-design",
    ],
    "manifest runner static-check design token",
    manifestPath,
  );

  requireTokens(
    runnerPlanChecker,
    [
      "HEU-DATA-029-TASK-CENTER-ADAPTER-DRY-RUN-RUNNER-STATIC-CHECK-DESIGN",
      "check:heu-task-center-adapter-dry-run-runner-static-check-design",
      docPath,
      checkerPath,
    ],
    "synthetic fixture runner plan checker next-slice token",
    runnerPlanCheckerPath,
  );

  if (packageJson.scripts?.[checkerAlias] !== checkerCommand) {
    fail(`${packagePath}: missing or mismatched ${checkerAlias}`);
  }

  requireTokens(
    checkerScript,
    [
      "existsSync",
      "readFileSync",
      "requireAbsentFile",
      "HEU_TASK_CENTER_ADAPTER_DRY_RUN_RUNNER_STATIC_CHECK_DESIGN_READY: PASS_LOCAL",
      "TASK_CENTER_DATABASE_READY: NO_GO_RUNNER_STATIC_CHECK_DESIGN_ONLY",
      "NO_RUNTIME_MUTATION: task center adapter dry-run runner static-check design checker only; no owner approval, database client, database read, env enablement, runtime fixture file, runtime runner file, table creation, SQL migration, task write, file upload, storage write, real-data fixture, AI call, paid automation, deploy, finance action or production GO",
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
    "task-center adapter dry-run runner static-check design scope",
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
    "HEU Task Center adapter dry-run runner static-check design check failed:",
  );
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("HEU Task Center adapter dry-run runner static-check design check");
console.log(
  "HEU_TASK_CENTER_ADAPTER_DRY_RUN_RUNNER_STATIC_CHECK_DESIGN_READY: PASS_LOCAL",
);
console.log(
  "TASK_CENTER_DATABASE_READY: NO_GO_RUNNER_STATIC_CHECK_DESIGN_ONLY",
);
console.log(
  "NO_RUNTIME_MUTATION: task center adapter dry-run runner static-check design checker only; no owner approval, database client, database read, env enablement, runtime fixture file, runtime runner file, table creation, SQL migration, task write, file upload, storage write, real-data fixture, AI call, paid automation, deploy, finance action or production GO",
);
