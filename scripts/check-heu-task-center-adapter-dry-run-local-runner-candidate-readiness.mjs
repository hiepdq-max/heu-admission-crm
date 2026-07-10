import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const failures = [];

const componentPath = "components/data-confirmation/department-task-inbox.tsx";
const panelSourcePath = "lib/task-center-gate-evidence-panel-source.ts";
const enablementGatePath = "lib/task-center-readonly-adapter-enablement-gate.ts";
const docPath =
  "docs/HEU_CONTROL/HEU_DATA_030_TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_CANDIDATE_READINESS_20260710.md";
const localRunnerScriptDraftDocPath =
  "docs/HEU_CONTROL/HEU_DATA_031_TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_SCRIPT_DRAFT_20260710.md";
const staticCheckDesignDocPath =
  "docs/HEU_CONTROL/HEU_DATA_029_TASK_CENTER_ADAPTER_DRY_RUN_RUNNER_STATIC_CHECK_DESIGN_20260710.md";
const runnerPlanDocPath =
  "docs/HEU_CONTROL/HEU_DATA_028_TASK_CENTER_ADAPTER_DRY_RUN_SYNTHETIC_FIXTURE_RUNNER_PLAN_20260710.md";
const syntheticFixtureContractDocPath =
  "docs/HEU_CONTROL/HEU_DATA_027_TASK_CENTER_ADAPTER_DRY_RUN_SYNTHETIC_FIXTURE_CONTRACT_20260710.md";
const manifestPath =
  "docs/HEU_CONTROL/HEU_APP_SHELL_001_STAGE_FILE_MANIFEST_20260709.md";
const localRunnerScriptPath =
  "scripts/dry-run-heu-task-center-adapter-local-runner.mjs";
const localRunnerScriptDraftCheckerPath =
  "scripts/check-heu-task-center-adapter-dry-run-local-runner-script-draft.mjs";
const staticCheckDesignCheckerPath =
  "scripts/check-heu-task-center-adapter-dry-run-runner-static-check-design.mjs";
const runnerPlanCheckerPath =
  "scripts/check-heu-task-center-adapter-dry-run-synthetic-fixture-runner-plan.mjs";
const syntheticFixtureContractCheckerPath =
  "scripts/check-heu-task-center-adapter-dry-run-synthetic-fixture-contract.mjs";
const checkerPath =
  "scripts/check-heu-task-center-adapter-dry-run-local-runner-candidate-readiness.mjs";
const packagePath = "package.json";
const checkerAlias =
  "check:heu-task-center-adapter-dry-run-local-runner-candidate-readiness";
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
    fail(`Runtime runner/fixture file must not exist in this readiness slice: ${relativePath}`);
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
  localRunnerScriptDraftDocPath,
  staticCheckDesignDocPath,
  runnerPlanDocPath,
  syntheticFixtureContractDocPath,
  manifestPath,
  localRunnerScriptPath,
  localRunnerScriptDraftCheckerPath,
  staticCheckDesignCheckerPath,
  runnerPlanCheckerPath,
  syntheticFixtureContractCheckerPath,
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
  const localRunnerScriptDraftDoc = read(localRunnerScriptDraftDocPath);
  const staticCheckDesignDoc = read(staticCheckDesignDocPath);
  const runnerPlanDoc = read(runnerPlanDocPath);
  const syntheticFixtureContractDoc = read(syntheticFixtureContractDocPath);
  const manifest = read(manifestPath);
  const localRunnerScript = read(localRunnerScriptPath);
  const localRunnerScriptDraftChecker = read(localRunnerScriptDraftCheckerPath);
  const staticCheckDesignChecker = read(staticCheckDesignCheckerPath);
  const runnerPlanChecker = read(runnerPlanCheckerPath);
  const syntheticFixtureContractChecker = read(
    syntheticFixtureContractCheckerPath,
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
      "TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_CANDIDATE_READINESS_ONLY",
      "TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_CANDIDATE_READINESS_READONLY",
      "TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_CANDIDATE_READINESS_DRAFT_ONLY",
      "TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_CANDIDATE_READINESS_NO_APPROVAL",
      "TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_CANDIDATE_READINESS_NO_DATABASE_READ",
      "TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_CANDIDATE_READINESS_NO_DATABASE_CLIENT",
      "TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_CANDIDATE_READINESS_NO_ENV_ENABLEMENT",
      "TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_CANDIDATE_READINESS_NO_TASK_MUTATION",
      "TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_CANDIDATE_READINESS_NO_REAL_DATA",
      "TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_CANDIDATE_READINESS_NO_AI_OR_AUTOMATION",
      "TaskCenterAdapterDryRunLocalRunnerCandidateReadinessItem",
      "adapterDryRunLocalRunnerCandidateReadinessItems",
      "LOCAL_RUNNER_CANDIDATE_READINESS_READY: PASS_LOCAL_READINESS_ONLY",
      "TASK_CENTER_DATABASE_READY: NO_GO_LOCAL_RUNNER_CANDIDATE_READINESS_ONLY",
      "LOCAL_RUNNER_CANDIDATE_STATIC_CHECK_GREEN",
      "LOCAL_RUNNER_CANDIDATE_FIXTURE_CHAIN_GREEN",
      "LOCAL_RUNNER_CANDIDATE_RESTRICTED_DATA_BOUNDARY",
      "LOCAL_RUNNER_CANDIDATE_TASK_MUTATION_ABSENT",
      "LOCAL_RUNNER_CANDIDATE_PRODUCTION_SIGNAL_ABSENT",
      "ASSERT_STATIC_CHECK_DESIGN_PASS",
      "ASSERT_FIXTURE_CONTRACT_AND_RUNNER_PLAN_LINKED",
      "ASSERT_RESTRICTED_DATA_EXCLUSION_READY",
      "ASSERT_NO_TASK_WRITE_OR_STATUS_CHANGE",
      "ASSERT_NO_DEPLOY_OR_PRODUCTION_GO",
      "RUNNER_STATIC_CHECK_DESIGN_READY",
      "SYNTHETIC_FIXTURE_CONTRACT_AND_RUNNER_PLAN_READY",
      "NO_RAW_PII_NO_PAYMENT_DATA",
      "STATIC_CHECK_NO_TASK_MUTATION",
      "STATIC_CHECK_NO_PRODUCTION_SIGNAL",
    ],
    "local runner candidate readiness source token",
    panelSourcePath,
  );

  requireTokens(
    component,
    [
      "TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_CANDIDATE_READINESS_ONLY",
      "TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_CANDIDATE_READINESS_READONLY",
      "TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_CANDIDATE_READINESS_DRAFT_ONLY",
      "TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_CANDIDATE_READINESS_NO_APPROVAL",
      "TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_CANDIDATE_READINESS_NO_DATABASE_READ",
      "TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_CANDIDATE_READINESS_NO_DATABASE_CLIENT",
      "TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_CANDIDATE_READINESS_NO_ENV_ENABLEMENT",
      "TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_CANDIDATE_READINESS_NO_TASK_MUTATION",
      "TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_CANDIDATE_READINESS_NO_REAL_DATA",
      "TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_CANDIDATE_READINESS_NO_AI_OR_AUTOMATION",
      "data-heu-task-center-adapter-dry-run-local-runner-candidate-readiness",
      "data-heu-task-center-adapter-dry-run-local-runner-candidate-readiness-readonly",
      "data-heu-task-center-adapter-dry-run-local-runner-candidate-readiness-draft-only",
      "data-heu-task-center-adapter-dry-run-local-runner-candidate-readiness-no-approval",
      "data-heu-task-center-adapter-dry-run-local-runner-candidate-readiness-no-database-read",
      "data-heu-task-center-adapter-dry-run-local-runner-candidate-readiness-no-database-client",
      "data-heu-task-center-adapter-dry-run-local-runner-candidate-readiness-no-env-enablement",
      "data-heu-task-center-adapter-dry-run-local-runner-candidate-readiness-no-task-mutation",
      "data-heu-task-center-adapter-dry-run-local-runner-candidate-readiness-no-real-data",
      "data-heu-task-center-adapter-dry-run-local-runner-candidate-readiness-no-ai-or-automation",
      "data-heu-task-center-adapter-dry-run-local-runner-candidate-readiness-item",
      "data-heu-task-center-adapter-dry-run-local-runner-candidate-readiness-reviewer",
      "data-heu-task-center-adapter-dry-run-local-runner-candidate-readiness-gate",
      "data-heu-task-center-adapter-dry-run-local-runner-candidate-readiness-prerequisite",
      "data-heu-task-center-adapter-dry-run-local-runner-candidate-readiness-evidence",
      "data-heu-task-center-adapter-dry-run-local-runner-candidate-readiness-stop-rule",
      "HEU-Data-030 - Local runner candidate readiness",
      "Khoa dieu kien truoc khi tao runner local",
      "gateEvidence.adapterDryRunLocalRunnerCandidateReadiness.items.map",
      "gateEvidence.adapterDryRunLocalRunnerCandidateReadiness.result",
    ],
    "component local runner candidate readiness token",
    componentPath,
  );

  requireTokens(
    doc,
    [
      "HEU-DATA-030-TASK-CENTER-ADAPTER-DRY-RUN-LOCAL-RUNNER-CANDIDATE-READINESS",
      "Status: PASS_LOCAL_READINESS_ONLY",
      "Production status: NO-GO",
      "Runtime status: LOCAL_RUNNER_CANDIDATE_READINESS_READY: PASS_LOCAL_READINESS_ONLY",
      "Database status: TASK_CENTER_DATABASE_READY: NO_GO_LOCAL_RUNNER_CANDIDATE_READINESS_ONLY",
      "TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_CANDIDATE_READINESS_ONLY",
      "TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_CANDIDATE_READINESS_READONLY",
      "TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_CANDIDATE_READINESS_DRAFT_ONLY",
      "TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_CANDIDATE_READINESS_NO_APPROVAL",
      "TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_CANDIDATE_READINESS_NO_DATABASE_READ",
      "TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_CANDIDATE_READINESS_NO_DATABASE_CLIENT",
      "TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_CANDIDATE_READINESS_NO_ENV_ENABLEMENT",
      "TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_CANDIDATE_READINESS_NO_TASK_MUTATION",
      "TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_CANDIDATE_READINESS_NO_REAL_DATA",
      "TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_CANDIDATE_READINESS_NO_AI_OR_AUTOMATION",
      "NO_DATABASE_CLIENT_CREATED",
      "NO_DATABASE_READ_EXECUTED",
      "NO_ENV_ENABLEMENT",
      "NO_TASK_MUTATION_ROUTE_CREATED",
      "NO_REAL_USER_DATA",
      "NO_AI_CALL_NO_AUTOMATION_STEP",
      "NO_RUNTIME_FIXTURE_FILE_CREATED",
      "NO_RUNTIME_RUNNER_FILE_CREATED",
      "LOCAL_RUNNER_CANDIDATE_STATIC_CHECK_GREEN",
      "LOCAL_RUNNER_CANDIDATE_FIXTURE_CHAIN_GREEN",
      "LOCAL_RUNNER_CANDIDATE_RESTRICTED_DATA_BOUNDARY",
      "LOCAL_RUNNER_CANDIDATE_TASK_MUTATION_ABSENT",
      "LOCAL_RUNNER_CANDIDATE_PRODUCTION_SIGNAL_ABSENT",
      "HEU-DATA-031-TASK-CENTER-ADAPTER-DRY-RUN-LOCAL-RUNNER-SCRIPT-DRAFT",
      "check:heu-task-center-adapter-dry-run-local-runner-candidate-readiness",
      "dry-run:heu-task-center-adapter-local-runner",
      "check:heu-task-center-adapter-dry-run-local-runner-script-draft",
      "LOCAL_RUNNER_SCRIPT_DRAFT_READY: PASS_LOCAL_SCRIPT_ONLY",
    ],
    "local runner candidate readiness doc token",
    docPath,
  );

  requireTokens(
    localRunnerScriptDraftDoc,
    [
      "HEU-DATA-031-TASK-CENTER-ADAPTER-DRY-RUN-LOCAL-RUNNER-SCRIPT-DRAFT",
      "LOCAL_RUNNER_SCRIPT_DRAFT_READY: PASS_LOCAL_SCRIPT_ONLY",
      "TASK_CENTER_DATABASE_READY: NO_GO_LOCAL_RUNNER_SCRIPT_DRAFT_ONLY",
      "HEU-DATA-032-TASK-CENTER-ADAPTER-DRY-RUN-RUNNER-OUTPUT-LEDGER",
      "dry-run:heu-task-center-adapter-local-runner",
      "check:heu-task-center-adapter-dry-run-local-runner-script-draft",
    ],
    "local runner script draft next-slice token",
    localRunnerScriptDraftDocPath,
  );

  requireTokens(
    staticCheckDesignDoc,
    [
      "HEU-DATA-030-TASK-CENTER-ADAPTER-DRY-RUN-LOCAL-RUNNER-CANDIDATE-READINESS",
      "LOCAL_RUNNER_CANDIDATE_READINESS_READY: PASS_LOCAL_READINESS_ONLY",
      "check:heu-task-center-adapter-dry-run-local-runner-candidate-readiness",
    ],
    "runner static-check design next-slice token",
    staticCheckDesignDocPath,
  );

  requireTokens(
    runnerPlanDoc,
    [
      "HEU-DATA-029-TASK-CENTER-ADAPTER-DRY-RUN-RUNNER-STATIC-CHECK-DESIGN",
      "RUNNER_STATIC_CHECK_DESIGN_READY: PASS_LOCAL_DESIGN_ONLY",
    ],
    "synthetic fixture runner plan prior-slice token",
    runnerPlanDocPath,
  );

  requireTokens(
    syntheticFixtureContractDoc,
    [
      "HEU-DATA-028-TASK-CENTER-ADAPTER-DRY-RUN-SYNTHETIC-FIXTURE-RUNNER-PLAN",
      "SYNTHETIC_FIXTURE_RUNNER_PLAN_READY: PASS_LOCAL_PLAN_ONLY",
    ],
    "synthetic fixture contract prior-slice token",
    syntheticFixtureContractDocPath,
  );

  requireTokens(
    manifest,
    [
      componentPath,
      panelSourcePath,
      enablementGatePath,
      docPath,
      localRunnerScriptDraftDocPath,
      staticCheckDesignDocPath,
      runnerPlanDocPath,
      syntheticFixtureContractDocPath,
      localRunnerScriptPath,
      localRunnerScriptDraftCheckerPath,
      checkerPath,
      staticCheckDesignCheckerPath,
      runnerPlanCheckerPath,
      syntheticFixtureContractCheckerPath,
      "check:heu-task-center-adapter-dry-run-local-runner-candidate-readiness",
      "dry-run:heu-task-center-adapter-local-runner",
      "check:heu-task-center-adapter-dry-run-local-runner-script-draft",
      "node --check scripts/dry-run-heu-task-center-adapter-local-runner.mjs",
      "node --check scripts/check-heu-task-center-adapter-dry-run-local-runner-script-draft.mjs",
      "node --check scripts/check-heu-task-center-adapter-dry-run-local-runner-candidate-readiness.mjs",
      "npm.cmd run dry-run:heu-task-center-adapter-local-runner",
      "npm.cmd run check:heu-task-center-adapter-dry-run-local-runner-script-draft",
      "npm.cmd run check:heu-task-center-adapter-dry-run-local-runner-candidate-readiness",
    ],
    "manifest local runner candidate readiness token",
    manifestPath,
  );

  requireTokens(
    localRunnerScript,
    [
      "TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_SCRIPT_DRAFT_ONLY",
      "HEU_TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_SCRIPT_DRAFT_READY: PASS_LOCAL",
      "TASK_CENTER_DATABASE_READY: NO_GO_LOCAL_RUNNER_SCRIPT_DRAFT_ONLY",
      "LOCAL_RUNNER_REPORT_ONLY: PASS_LOCAL_SYNTHETIC_IN_MEMORY",
    ],
    "local runner script token",
    localRunnerScriptPath,
  );

  requireTokens(
    localRunnerScriptDraftChecker,
    [
      "HEU-DATA-031-TASK-CENTER-ADAPTER-DRY-RUN-LOCAL-RUNNER-SCRIPT-DRAFT",
      "HEU_TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_SCRIPT_DRAFT_READY: PASS_LOCAL",
      docPath,
      checkerPath,
      localRunnerScriptPath,
    ],
    "local runner script draft checker reverse-link token",
    localRunnerScriptDraftCheckerPath,
  );

  requireTokens(
    staticCheckDesignChecker,
    [
      "HEU-DATA-030-TASK-CENTER-ADAPTER-DRY-RUN-LOCAL-RUNNER-CANDIDATE-READINESS",
      "check:heu-task-center-adapter-dry-run-local-runner-candidate-readiness",
      docPath,
      checkerPath,
    ],
    "runner static-check design checker next-slice token",
    staticCheckDesignCheckerPath,
  );

  requireTokens(
    runnerPlanChecker,
    [
      "HEU-DATA-029-TASK-CENTER-ADAPTER-DRY-RUN-RUNNER-STATIC-CHECK-DESIGN",
      "check:heu-task-center-adapter-dry-run-runner-static-check-design",
    ],
    "runner plan checker prior-slice token",
    runnerPlanCheckerPath,
  );

  requireTokens(
    syntheticFixtureContractChecker,
    [
      "HEU-DATA-028-TASK-CENTER-ADAPTER-DRY-RUN-SYNTHETIC-FIXTURE-RUNNER-PLAN",
      "check:heu-task-center-adapter-dry-run-synthetic-fixture-runner-plan",
    ],
    "synthetic fixture contract checker prior-slice token",
    syntheticFixtureContractCheckerPath,
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
      "HEU_TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_CANDIDATE_READINESS_READY: PASS_LOCAL",
      "TASK_CENTER_DATABASE_READY: NO_GO_LOCAL_RUNNER_CANDIDATE_READINESS_ONLY",
      "NO_RUNTIME_MUTATION: task center adapter dry-run local runner candidate readiness checker only; no owner approval, database client, database read, env enablement, runtime fixture file, runtime runner file, table creation, SQL migration, task write, file upload, storage write, real-data fixture, AI call, paid automation, deploy, finance action or production GO",
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
    "task-center adapter dry-run local runner candidate readiness scope",
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
    "HEU Task Center adapter dry-run local runner candidate readiness check failed:",
  );
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("HEU Task Center adapter dry-run local runner candidate readiness check");
console.log(
  "HEU_TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_CANDIDATE_READINESS_READY: PASS_LOCAL",
);
console.log(
  "TASK_CENTER_DATABASE_READY: NO_GO_LOCAL_RUNNER_CANDIDATE_READINESS_ONLY",
);
console.log(
  "NO_RUNTIME_MUTATION: task center adapter dry-run local runner candidate readiness checker only; no owner approval, database client, database read, env enablement, runtime fixture file, runtime runner file, table creation, SQL migration, task write, file upload, storage write, real-data fixture, AI call, paid automation, deploy, finance action or production GO",
);
