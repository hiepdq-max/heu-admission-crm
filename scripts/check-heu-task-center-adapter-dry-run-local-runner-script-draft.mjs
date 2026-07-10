import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const failures = [];

const componentPath = "components/data-confirmation/department-task-inbox.tsx";
const panelSourcePath = "lib/task-center-gate-evidence-panel-source.ts";
const enablementGatePath = "lib/task-center-readonly-adapter-enablement-gate.ts";
const docPath =
  "docs/HEU_CONTROL/HEU_DATA_031_TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_SCRIPT_DRAFT_20260710.md";
const outputLedgerDocPath =
  "docs/HEU_CONTROL/HEU_DATA_032_TASK_CENTER_ADAPTER_DRY_RUN_RUNNER_OUTPUT_LEDGER_20260710.md";
const readinessDocPath =
  "docs/HEU_CONTROL/HEU_DATA_030_TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_CANDIDATE_READINESS_20260710.md";
const staticCheckDesignDocPath =
  "docs/HEU_CONTROL/HEU_DATA_029_TASK_CENTER_ADAPTER_DRY_RUN_RUNNER_STATIC_CHECK_DESIGN_20260710.md";
const manifestPath =
  "docs/HEU_CONTROL/HEU_APP_SHELL_001_STAGE_FILE_MANIFEST_20260709.md";
const runnerScriptPath =
  "scripts/dry-run-heu-task-center-adapter-local-runner.mjs";
const readinessCheckerPath =
  "scripts/check-heu-task-center-adapter-dry-run-local-runner-candidate-readiness.mjs";
const checkerPath =
  "scripts/check-heu-task-center-adapter-dry-run-local-runner-script-draft.mjs";
const outputLedgerCheckerPath =
  "scripts/check-heu-task-center-adapter-dry-run-runner-output-ledger.mjs";
const packagePath = "package.json";
const runnerAlias = "dry-run:heu-task-center-adapter-local-runner";
const runnerCommand = `node ${runnerScriptPath}`;
const checkerAlias =
  "check:heu-task-center-adapter-dry-run-local-runner-script-draft";
const checkerCommand = `node ${checkerPath}`;
const outputLedgerCheckerAlias =
  "check:heu-task-center-adapter-dry-run-runner-output-ledger";
const outputLedgerCheckerCommand = `node ${outputLedgerCheckerPath}`;

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
  outputLedgerDocPath,
  readinessDocPath,
  staticCheckDesignDocPath,
  manifestPath,
  runnerScriptPath,
  readinessCheckerPath,
  checkerPath,
  outputLedgerCheckerPath,
  packagePath,
]) {
  requireFile(file);
}

if (failures.length === 0) {
  const component = read(componentPath);
  const panelSource = read(panelSourcePath);
  const enablementGate = read(enablementGatePath);
  const doc = read(docPath);
  const outputLedgerDoc = read(outputLedgerDocPath);
  const readinessDoc = read(readinessDocPath);
  const staticCheckDesignDoc = read(staticCheckDesignDocPath);
  const manifest = read(manifestPath);
  const runnerScript = read(runnerScriptPath);
  const readinessChecker = read(readinessCheckerPath);
  const outputLedgerChecker = read(outputLedgerCheckerPath);
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
      "TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_SCRIPT_DRAFT_ONLY",
      "TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_SCRIPT_DRAFT_READONLY",
      "TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_SCRIPT_DRAFT_DRAFT_ONLY",
      "TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_SCRIPT_DRAFT_NO_APPROVAL",
      "TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_SCRIPT_DRAFT_NO_DATABASE_READ",
      "TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_SCRIPT_DRAFT_NO_DATABASE_CLIENT",
      "TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_SCRIPT_DRAFT_NO_ENV_ENABLEMENT",
      "TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_SCRIPT_DRAFT_NO_TASK_MUTATION",
      "TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_SCRIPT_DRAFT_NO_REAL_DATA",
      "TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_SCRIPT_DRAFT_NO_AI_OR_AUTOMATION",
      "TaskCenterAdapterDryRunLocalRunnerScriptDraftItem",
      "adapterDryRunLocalRunnerScriptDraftItems",
      "LOCAL_RUNNER_SCRIPT_DRAFT_READY: PASS_LOCAL_SCRIPT_ONLY",
      "TASK_CENTER_DATABASE_READY: NO_GO_LOCAL_RUNNER_SCRIPT_DRAFT_ONLY",
      "LOCAL_RUNNER_SCRIPT_SCOPE_MATCH_REPORT",
      "LOCAL_RUNNER_SCRIPT_NO_SCOPE_BLOCK",
      "LOCAL_RUNNER_SCRIPT_RESTRICTED_FIELDS_ABSENT",
      "LOCAL_RUNNER_SCRIPT_DEPARTMENT_MISMATCH_BLOCK",
      "LOCAL_RUNNER_SCRIPT_PRODUCTION_NO_GO_REPORT",
      "ASSERT_SYN_SCOPE_MATCH_VISIBLE",
      "ASSERT_SYN_NO_SCOPE_BLOCKED",
      "ASSERT_SYN_RESTRICTED_FIELDS_ABSENT",
      "ASSERT_SYN_DEPARTMENT_MISMATCH_BLOCKED",
      "ASSERT_SYN_REPORT_ONLY_NO_APPROVAL",
    ],
    "local runner script draft source token",
    panelSourcePath,
  );

  requireTokens(
    component,
    [
      "TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_SCRIPT_DRAFT_ONLY",
      "TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_SCRIPT_DRAFT_READONLY",
      "TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_SCRIPT_DRAFT_DRAFT_ONLY",
      "TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_SCRIPT_DRAFT_NO_APPROVAL",
      "TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_SCRIPT_DRAFT_NO_DATABASE_READ",
      "TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_SCRIPT_DRAFT_NO_DATABASE_CLIENT",
      "TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_SCRIPT_DRAFT_NO_ENV_ENABLEMENT",
      "TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_SCRIPT_DRAFT_NO_TASK_MUTATION",
      "TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_SCRIPT_DRAFT_NO_REAL_DATA",
      "TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_SCRIPT_DRAFT_NO_AI_OR_AUTOMATION",
      "data-heu-task-center-adapter-dry-run-local-runner-script-draft",
      "data-heu-task-center-adapter-dry-run-local-runner-script-draft-readonly",
      "data-heu-task-center-adapter-dry-run-local-runner-script-draft-draft-only",
      "data-heu-task-center-adapter-dry-run-local-runner-script-draft-no-approval",
      "data-heu-task-center-adapter-dry-run-local-runner-script-draft-no-database-read",
      "data-heu-task-center-adapter-dry-run-local-runner-script-draft-no-database-client",
      "data-heu-task-center-adapter-dry-run-local-runner-script-draft-no-env-enablement",
      "data-heu-task-center-adapter-dry-run-local-runner-script-draft-no-task-mutation",
      "data-heu-task-center-adapter-dry-run-local-runner-script-draft-no-real-data",
      "data-heu-task-center-adapter-dry-run-local-runner-script-draft-no-ai-or-automation",
      "data-heu-task-center-adapter-dry-run-local-runner-script-draft-item",
      "data-heu-task-center-adapter-dry-run-local-runner-script-draft-reviewer",
      "data-heu-task-center-adapter-dry-run-local-runner-script-draft-assertion",
      "data-heu-task-center-adapter-dry-run-local-runner-script-draft-input",
      "data-heu-task-center-adapter-dry-run-local-runner-script-draft-report",
      "data-heu-task-center-adapter-dry-run-local-runner-script-draft-stop-rule",
      "HEU-Data-031 - Local runner script draft",
      "Runner local synthetic, chi in report",
      "gateEvidence.adapterDryRunLocalRunnerScriptDraft.items.map",
      "gateEvidence.adapterDryRunLocalRunnerScriptDraft.result",
    ],
    "component local runner script draft token",
    componentPath,
  );

  requireTokens(
    doc,
    [
      "HEU-DATA-031-TASK-CENTER-ADAPTER-DRY-RUN-LOCAL-RUNNER-SCRIPT-DRAFT",
      "Status: PASS_LOCAL_SCRIPT_ONLY",
      "Production status: NO-GO",
      "Runtime status: LOCAL_RUNNER_SCRIPT_DRAFT_READY: PASS_LOCAL_SCRIPT_ONLY",
      "Database status: TASK_CENTER_DATABASE_READY: NO_GO_LOCAL_RUNNER_SCRIPT_DRAFT_ONLY",
      "TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_SCRIPT_DRAFT_ONLY",
      "TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_SCRIPT_DRAFT_READONLY",
      "TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_SCRIPT_DRAFT_DRAFT_ONLY",
      "TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_SCRIPT_DRAFT_NO_APPROVAL",
      "TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_SCRIPT_DRAFT_NO_DATABASE_READ",
      "TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_SCRIPT_DRAFT_NO_DATABASE_CLIENT",
      "TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_SCRIPT_DRAFT_NO_ENV_ENABLEMENT",
      "TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_SCRIPT_DRAFT_NO_TASK_MUTATION",
      "TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_SCRIPT_DRAFT_NO_REAL_DATA",
      "TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_SCRIPT_DRAFT_NO_AI_OR_AUTOMATION",
      "LOCAL_RUNNER_SCRIPT_SCOPE_MATCH_REPORT",
      "LOCAL_RUNNER_SCRIPT_NO_SCOPE_BLOCK",
      "LOCAL_RUNNER_SCRIPT_RESTRICTED_FIELDS_ABSENT",
      "LOCAL_RUNNER_SCRIPT_DEPARTMENT_MISMATCH_BLOCK",
      "LOCAL_RUNNER_SCRIPT_PRODUCTION_NO_GO_REPORT",
      "HEU-DATA-032-TASK-CENTER-ADAPTER-DRY-RUN-RUNNER-OUTPUT-LEDGER",
      "dry-run:heu-task-center-adapter-local-runner",
      "check:heu-task-center-adapter-dry-run-local-runner-script-draft",
      "check:heu-task-center-adapter-dry-run-runner-output-ledger",
      "RUNNER_OUTPUT_LEDGER_READY: PASS_LOCAL_LEDGER_ONLY",
      "TASK_CENTER_DATABASE_READY: NO_GO_RUNNER_OUTPUT_LEDGER_ONLY",
    ],
    "local runner script draft doc token",
    docPath,
  );

  requireTokens(
    outputLedgerDoc,
    [
      "HEU-DATA-032-TASK-CENTER-ADAPTER-DRY-RUN-RUNNER-OUTPUT-LEDGER",
      "Status: PASS_LOCAL_LEDGER_ONLY",
      "Runtime status: RUNNER_OUTPUT_LEDGER_READY: PASS_LOCAL_LEDGER_ONLY",
      "Database status: TASK_CENTER_DATABASE_READY: NO_GO_RUNNER_OUTPUT_LEDGER_ONLY",
      "check:heu-task-center-adapter-dry-run-runner-output-ledger",
    ],
    "runner output ledger doc token",
    outputLedgerDocPath,
  );

  requireTokens(
    readinessDoc,
    [
      "HEU-DATA-031-TASK-CENTER-ADAPTER-DRY-RUN-LOCAL-RUNNER-SCRIPT-DRAFT",
      "LOCAL_RUNNER_SCRIPT_DRAFT_READY: PASS_LOCAL_SCRIPT_ONLY",
      "dry-run:heu-task-center-adapter-local-runner",
      "check:heu-task-center-adapter-dry-run-local-runner-script-draft",
    ],
    "local runner candidate readiness next-slice token",
    readinessDocPath,
  );

  requireTokens(
    staticCheckDesignDoc,
    [
      "HEU-DATA-030-TASK-CENTER-ADAPTER-DRY-RUN-LOCAL-RUNNER-CANDIDATE-READINESS",
      "LOCAL_RUNNER_CANDIDATE_READINESS_READY: PASS_LOCAL_READINESS_ONLY",
    ],
    "runner static-check design prior-slice token",
    staticCheckDesignDocPath,
  );

  requireTokens(
    runnerScript,
    [
      "TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_SCRIPT_DRAFT_ONLY",
      "TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_SCRIPT_DRAFT_NO_DATABASE_READ",
      "TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_SCRIPT_DRAFT_NO_DATABASE_CLIENT",
      "TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_SCRIPT_DRAFT_NO_ENV_ENABLEMENT",
      "TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_SCRIPT_DRAFT_NO_TASK_MUTATION",
      "TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_SCRIPT_DRAFT_NO_REAL_DATA",
      "TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_SCRIPT_DRAFT_NO_AI_OR_AUTOMATION",
      "LOCAL_RUNNER_SCRIPT_SCOPE_MATCH_REPORT",
      "LOCAL_RUNNER_SCRIPT_NO_SCOPE_BLOCK",
      "LOCAL_RUNNER_SCRIPT_RESTRICTED_FIELDS_ABSENT",
      "LOCAL_RUNNER_SCRIPT_DEPARTMENT_MISMATCH_BLOCK",
      "LOCAL_RUNNER_SCRIPT_PRODUCTION_NO_GO_REPORT",
      "ASSERT_SYN_SCOPE_MATCH_VISIBLE",
      "ASSERT_SYN_NO_SCOPE_BLOCKED",
      "ASSERT_SYN_RESTRICTED_FIELDS_ABSENT",
      "ASSERT_SYN_DEPARTMENT_MISMATCH_BLOCKED",
      "ASSERT_SYN_REPORT_ONLY_NO_APPROVAL",
      "HEU_TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_SCRIPT_DRAFT_READY: PASS_LOCAL",
      "TASK_CENTER_DATABASE_READY: NO_GO_LOCAL_RUNNER_SCRIPT_DRAFT_ONLY",
      "LOCAL_RUNNER_REPORT_ONLY: PASS_LOCAL_SYNTHETIC_IN_MEMORY",
    ],
    "runner script token",
    runnerScriptPath,
  );

  requireTokens(
    manifest,
    [
      componentPath,
      panelSourcePath,
      enablementGatePath,
      docPath,
      outputLedgerDocPath,
      readinessDocPath,
      staticCheckDesignDocPath,
      runnerScriptPath,
      checkerPath,
      outputLedgerCheckerPath,
      readinessCheckerPath,
      "dry-run:heu-task-center-adapter-local-runner",
      "check:heu-task-center-adapter-dry-run-local-runner-script-draft",
      "check:heu-task-center-adapter-dry-run-runner-output-ledger",
      "node --check scripts/dry-run-heu-task-center-adapter-local-runner.mjs",
      "node --check scripts/check-heu-task-center-adapter-dry-run-local-runner-script-draft.mjs",
      "node --check scripts/check-heu-task-center-adapter-dry-run-runner-output-ledger.mjs",
      "npm.cmd run dry-run:heu-task-center-adapter-local-runner",
      "npm.cmd run check:heu-task-center-adapter-dry-run-local-runner-script-draft",
      "npm.cmd run check:heu-task-center-adapter-dry-run-runner-output-ledger",
    ],
    "manifest local runner script draft token",
    manifestPath,
  );

  requireTokens(
    readinessChecker,
    [
      "HEU-DATA-031-TASK-CENTER-ADAPTER-DRY-RUN-LOCAL-RUNNER-SCRIPT-DRAFT",
      "check:heu-task-center-adapter-dry-run-local-runner-script-draft",
      docPath,
      checkerPath,
      runnerScriptPath,
    ],
    "readiness checker next-slice token",
    readinessCheckerPath,
  );

  if (packageJson.scripts?.[runnerAlias] !== runnerCommand) {
    fail(`${packagePath}: missing or mismatched ${runnerAlias}`);
  }

  if (packageJson.scripts?.[checkerAlias] !== checkerCommand) {
    fail(`${packagePath}: missing or mismatched ${checkerAlias}`);
  }

  if (packageJson.scripts?.[outputLedgerCheckerAlias] !== outputLedgerCheckerCommand) {
    fail(`${packagePath}: missing or mismatched ${outputLedgerCheckerAlias}`);
  }

  requireTokens(
    checkerScript,
    [
      "existsSync",
      "readFileSync",
      "HEU_TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_SCRIPT_DRAFT_READY: PASS_LOCAL",
      "TASK_CENTER_DATABASE_READY: NO_GO_LOCAL_RUNNER_SCRIPT_DRAFT_ONLY",
      "HEU-DATA-032-TASK-CENTER-ADAPTER-DRY-RUN-RUNNER-OUTPUT-LEDGER",
      "check:heu-task-center-adapter-dry-run-runner-output-ledger",
      "RUNNER_OUTPUT_LEDGER_READY: PASS_LOCAL_LEDGER_ONLY",
      "NO_RUNTIME_MUTATION: task center adapter dry-run local runner script draft checker only; no owner approval, database client, database read, env enablement, runtime fixture file, table creation, SQL migration, task write, file upload, storage write, real-data fixture, AI call, paid automation, deploy, finance action or production GO",
    ],
    "checker-script read-only token",
    checkerPath,
  );

  requireTokens(
    outputLedgerChecker,
    [
      "HEU_TASK_CENTER_ADAPTER_DRY_RUN_RUNNER_OUTPUT_LEDGER_READY: PASS_LOCAL",
      "TASK_CENTER_DATABASE_READY: NO_GO_RUNNER_OUTPUT_LEDGER_ONLY",
      "NO_RUNTIME_MUTATION: task center adapter dry-run runner output ledger checker only",
    ],
    "runner output ledger checker token",
    outputLedgerCheckerPath,
  );

  const runtimeScopeText = [
    enablementGate,
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
    "task-center adapter dry-run local runner script draft scope",
  );

  forbidPatterns(
    runnerScript,
    [
      { label: "node fs import", pattern: /from\s+["']node:fs["']/ },
      { label: "fs import", pattern: /from\s+["']fs["']/ },
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
    "file mutation, filesystem read/write or command-execution API",
    runnerScriptPath,
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
    "HEU Task Center adapter dry-run local runner script draft check failed:",
  );
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("HEU Task Center adapter dry-run local runner script draft check");
console.log(
  "HEU_TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_SCRIPT_DRAFT_READY: PASS_LOCAL",
);
console.log("TASK_CENTER_DATABASE_READY: NO_GO_LOCAL_RUNNER_SCRIPT_DRAFT_ONLY");
console.log(
  "NO_RUNTIME_MUTATION: task center adapter dry-run local runner script draft checker only; no owner approval, database client, database read, env enablement, runtime fixture file, table creation, SQL migration, task write, file upload, storage write, real-data fixture, AI call, paid automation, deploy, finance action or production GO",
);
