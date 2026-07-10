import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const failures = [];

const componentPath = "components/data-confirmation/department-task-inbox.tsx";
const panelSourcePath = "lib/task-center-gate-evidence-panel-source.ts";
const docPath =
  "docs/HEU_CONTROL/HEU_DATA_032_TASK_CENTER_ADAPTER_DRY_RUN_RUNNER_OUTPUT_LEDGER_20260710.md";
const priorDocPath =
  "docs/HEU_CONTROL/HEU_DATA_031_TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_SCRIPT_DRAFT_20260710.md";
const manifestPath =
  "docs/HEU_CONTROL/HEU_APP_SHELL_001_STAGE_FILE_MANIFEST_20260709.md";
const runnerScriptPath =
  "scripts/dry-run-heu-task-center-adapter-local-runner.mjs";
const priorCheckerPath =
  "scripts/check-heu-task-center-adapter-dry-run-local-runner-script-draft.mjs";
const checkerPath =
  "scripts/check-heu-task-center-adapter-dry-run-runner-output-ledger.mjs";
const packagePath = "package.json";
const checkerAlias =
  "check:heu-task-center-adapter-dry-run-runner-output-ledger";
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
  docPath,
  priorDocPath,
  manifestPath,
  runnerScriptPath,
  priorCheckerPath,
  checkerPath,
  packagePath,
]) {
  requireFile(file);
}

if (failures.length === 0) {
  const component = read(componentPath);
  const panelSource = read(panelSourcePath);
  const doc = read(docPath);
  const priorDoc = read(priorDocPath);
  const manifest = read(manifestPath);
  const runnerScript = read(runnerScriptPath);
  const priorChecker = read(priorCheckerPath);
  const checkerScript = read(checkerPath);
  const packageJson = JSON.parse(read(packagePath));

  const boundaryTokens = [
    "TASK_CENTER_ADAPTER_DRY_RUN_RUNNER_OUTPUT_LEDGER_ONLY",
    "TASK_CENTER_ADAPTER_DRY_RUN_RUNNER_OUTPUT_LEDGER_READONLY",
    "TASK_CENTER_ADAPTER_DRY_RUN_RUNNER_OUTPUT_LEDGER_DRAFT_ONLY",
    "TASK_CENTER_ADAPTER_DRY_RUN_RUNNER_OUTPUT_LEDGER_NO_APPROVAL",
    "TASK_CENTER_ADAPTER_DRY_RUN_RUNNER_OUTPUT_LEDGER_NO_DATABASE_READ",
    "TASK_CENTER_ADAPTER_DRY_RUN_RUNNER_OUTPUT_LEDGER_NO_DATABASE_CLIENT",
    "TASK_CENTER_ADAPTER_DRY_RUN_RUNNER_OUTPUT_LEDGER_NO_ENV_ENABLEMENT",
    "TASK_CENTER_ADAPTER_DRY_RUN_RUNNER_OUTPUT_LEDGER_NO_TASK_MUTATION",
    "TASK_CENTER_ADAPTER_DRY_RUN_RUNNER_OUTPUT_LEDGER_NO_REAL_DATA",
    "TASK_CENTER_ADAPTER_DRY_RUN_RUNNER_OUTPUT_LEDGER_NO_AI_OR_AUTOMATION",
  ];

  const ledgerRows = [
    "RUNNER_OUTPUT_LEDGER_BOUNDARY_CAPTURE",
    "RUNNER_OUTPUT_LEDGER_CASE_COUNT",
    "RUNNER_OUTPUT_LEDGER_RESTRICTED_DATA_ABSENT",
    "RUNNER_OUTPUT_LEDGER_DEPARTMENT_MISMATCH_BLOCKED",
    "RUNNER_OUTPUT_LEDGER_PRODUCTION_NO_GO",
  ];

  const ledgerTokens = [
    "TaskCenterAdapterDryRunRunnerOutputLedgerItem",
    "adapterDryRunRunnerOutputLedgerItems",
    "RUNNER_OUTPUT_LEDGER_READY: PASS_LOCAL_LEDGER_ONLY",
    "TASK_CENTER_DATABASE_READY: NO_GO_RUNNER_OUTPUT_LEDGER_ONLY",
    "FIVE_SYNTHETIC_CASES_REPORTED",
    "LOCAL_RUNNER_REPORT_ONLY",
    "LOCAL_RUNNER_CASE_PASS_SCOPE_MATCH",
    "LOCAL_RUNNER_CASE_PASS_RESTRICTED_FIELDS_ABSENT",
    "LOCAL_RUNNER_CASE_PASS_DEPARTMENT_MISMATCH_BLOCKED",
    "LOCAL_RUNNER_CASE_PASS_PRODUCTION_NO_GO",
    ...ledgerRows,
  ];

  requireTokens(
    panelSource,
    [...boundaryTokens, ...ledgerTokens],
    "runner output ledger source token",
    panelSourcePath,
  );

  requireTokens(
    component,
    [
      ...boundaryTokens,
      "data-heu-task-center-adapter-dry-run-runner-output-ledger",
      "data-heu-task-center-adapter-dry-run-runner-output-ledger-readonly",
      "data-heu-task-center-adapter-dry-run-runner-output-ledger-draft-only",
      "data-heu-task-center-adapter-dry-run-runner-output-ledger-no-approval",
      "data-heu-task-center-adapter-dry-run-runner-output-ledger-no-database-read",
      "data-heu-task-center-adapter-dry-run-runner-output-ledger-no-database-client",
      "data-heu-task-center-adapter-dry-run-runner-output-ledger-no-env-enablement",
      "data-heu-task-center-adapter-dry-run-runner-output-ledger-no-task-mutation",
      "data-heu-task-center-adapter-dry-run-runner-output-ledger-no-real-data",
      "data-heu-task-center-adapter-dry-run-runner-output-ledger-no-ai-or-automation",
      "data-heu-task-center-adapter-dry-run-runner-output-ledger-item",
      "data-heu-task-center-adapter-dry-run-runner-output-ledger-reviewer",
      "data-heu-task-center-adapter-dry-run-runner-output-ledger-field",
      "data-heu-task-center-adapter-dry-run-runner-output-ledger-token",
      "data-heu-task-center-adapter-dry-run-runner-output-ledger-report",
      "data-heu-task-center-adapter-dry-run-runner-output-ledger-stop-rule",
      "HEU-Data-032 - Runner output ledger",
      "Ledger chi doc output runner local",
      "gateEvidence.adapterDryRunRunnerOutputLedger.items.map",
      "gateEvidence.adapterDryRunRunnerOutputLedger.result",
      ...ledgerRows,
    ],
    "component runner output ledger token",
    componentPath,
  );

  requireTokens(
    doc,
    [
      "HEU-DATA-032-TASK-CENTER-ADAPTER-DRY-RUN-RUNNER-OUTPUT-LEDGER",
      "Status: PASS_LOCAL_LEDGER_ONLY",
      "Production status: NO-GO",
      "Runtime status: RUNNER_OUTPUT_LEDGER_READY: PASS_LOCAL_LEDGER_ONLY",
      "Database status: TASK_CENTER_DATABASE_READY: NO_GO_RUNNER_OUTPUT_LEDGER_ONLY",
      ...boundaryTokens,
      ...ledgerRows,
      "check:heu-task-center-adapter-dry-run-runner-output-ledger",
      "HEU-DATA-033-TASK-CENTER-ADAPTER-DRY-RUN-OUTPUT-LEDGER-STATIC-SNAPSHOT",
    ],
    "runner output ledger doc token",
    docPath,
  );

  requireTokens(
    priorDoc,
    [
      "HEU-DATA-032-TASK-CENTER-ADAPTER-DRY-RUN-RUNNER-OUTPUT-LEDGER",
      "check:heu-task-center-adapter-dry-run-runner-output-ledger",
      "RUNNER_OUTPUT_LEDGER_READY: PASS_LOCAL_LEDGER_ONLY",
      "TASK_CENTER_DATABASE_READY: NO_GO_RUNNER_OUTPUT_LEDGER_ONLY",
    ],
    "prior local runner script draft next-slice token",
    priorDocPath,
  );

  requireTokens(
    runnerScript,
    [
      "LOCAL_RUNNER_CASE_PASS_SCOPE_MATCH",
      "LOCAL_RUNNER_CASE_PASS_NO_SCOPE_BLOCKED",
      "LOCAL_RUNNER_CASE_PASS_RESTRICTED_FIELDS_ABSENT",
      "LOCAL_RUNNER_CASE_PASS_DEPARTMENT_MISMATCH_BLOCKED",
      "LOCAL_RUNNER_CASE_PASS_PRODUCTION_NO_GO",
      "LOCAL_RUNNER_REPORT_ONLY: PASS_LOCAL_SYNTHETIC_IN_MEMORY",
      "TASK_CENTER_DATABASE_READY: NO_GO_LOCAL_RUNNER_SCRIPT_DRAFT_ONLY",
    ],
    "runner output token source",
    runnerScriptPath,
  );

  requireTokens(
    manifest,
    [
      docPath,
      checkerPath,
      "node --check scripts/check-heu-task-center-adapter-dry-run-runner-output-ledger.mjs",
      "npm.cmd run check:heu-task-center-adapter-dry-run-runner-output-ledger",
    ],
    "manifest runner output ledger token",
    manifestPath,
  );

  requireTokens(
    priorChecker,
    [
      "HEU-DATA-032-TASK-CENTER-ADAPTER-DRY-RUN-RUNNER-OUTPUT-LEDGER",
      "check:heu-task-center-adapter-dry-run-runner-output-ledger",
      "RUNNER_OUTPUT_LEDGER_READY: PASS_LOCAL_LEDGER_ONLY",
    ],
    "prior checker next-slice token",
    priorCheckerPath,
  );

  if (packageJson.scripts?.[checkerAlias] !== checkerCommand) {
    fail(`${packagePath}: missing or mismatched ${checkerAlias}`);
  }

  requireTokens(
    checkerScript,
    [
      "existsSync",
      "readFileSync",
      "HEU_TASK_CENTER_ADAPTER_DRY_RUN_RUNNER_OUTPUT_LEDGER_READY: PASS_LOCAL",
      "TASK_CENTER_DATABASE_READY: NO_GO_RUNNER_OUTPUT_LEDGER_ONLY",
      "NO_RUNTIME_MUTATION: task center adapter dry-run runner output ledger checker only; no owner approval, database client, database read, env enablement, file output write, table creation, SQL migration, task write, file upload, storage write, real-data fixture, AI call, paid automation, deploy, finance action or production GO",
    ],
    "checker-script read-only token",
    checkerPath,
  );

  const runtimeScopeText = [
    panelSource,
    component,
    runnerScript,
  ].join("\n");

  forbidPatterns(
    runtimeScopeText,
    [
      { label: "Supabase import", pattern: /supabase/i },
      { label: "createClient", pattern: /\bcreateClient\s*\(/ },
      { label: "database select call", pattern: /\.select\s*\(/ },
      { label: "insert", pattern: /\.insert\s*\(/ },
      { label: "update", pattern: /\.update\s*\(/ },
      { label: "upsert", pattern: /\.upsert\s*\(/ },
      { label: "delete", pattern: /\.delete\s*\(/ },
      { label: "fetch call", pattern: /\bfetch\s*\(/ },
      { label: "process env", pattern: /process\s*\.\s*env/ },
      { label: "file input", pattern: /type=["']file["']/ },
      { label: "storage write", pattern: /\bstorage\s*\.\s*from\b/i },
      { label: "server action marker", pattern: /["']use server["']/ },
      { label: "SQL create table statement", pattern: /\bcreate\s+table\b/i },
      { label: "SQL alter table statement", pattern: /\balter\s+table\b/i },
      { label: "SQL migration folder", pattern: /\bmigrations?\//i },
      { label: "approved owner lane", pattern: /:\s*["']DAT_CHINH_THUC["']/ },
      { label: "enabled true gate", pattern: /\benabled\s*:\s*true\b/ },
      {
        label: "JWT-like token",
        pattern: /eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{10,}/,
      },
    ],
    "runtime DB, env, SQL, upload, storage, secret, approval or mutation API",
    "task-center adapter dry-run runner output ledger scope",
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
  console.error("HEU Task Center adapter dry-run runner output ledger check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("HEU Task Center adapter dry-run runner output ledger check");
console.log(
  "HEU_TASK_CENTER_ADAPTER_DRY_RUN_RUNNER_OUTPUT_LEDGER_READY: PASS_LOCAL",
);
console.log("TASK_CENTER_DATABASE_READY: NO_GO_RUNNER_OUTPUT_LEDGER_ONLY");
console.log(
  "NO_RUNTIME_MUTATION: task center adapter dry-run runner output ledger checker only; no owner approval, database client, database read, env enablement, file output write, table creation, SQL migration, task write, file upload, storage write, real-data fixture, AI call, paid automation, deploy, finance action or production GO",
);
