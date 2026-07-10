import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const failures = [];

const componentPath = "components/data-confirmation/department-task-inbox.tsx";
const panelSourcePath = "lib/task-center-gate-evidence-panel-source.ts";
const docPath =
  "docs/HEU_CONTROL/HEU_DATA_033_TASK_CENTER_ADAPTER_DRY_RUN_OUTPUT_LEDGER_STATIC_SNAPSHOT_20260710.md";
const reviewDecisionDocPath =
  "docs/HEU_CONTROL/HEU_DATA_034_TASK_CENTER_ADAPTER_DRY_RUN_REVIEW_DECISION_PACKET_20260710.md";
const priorDocPath =
  "docs/HEU_CONTROL/HEU_DATA_032_TASK_CENTER_ADAPTER_DRY_RUN_RUNNER_OUTPUT_LEDGER_20260710.md";
const manifestPath =
  "docs/HEU_CONTROL/HEU_APP_SHELL_001_STAGE_FILE_MANIFEST_20260709.md";
const runnerScriptPath =
  "scripts/dry-run-heu-task-center-adapter-local-runner.mjs";
const priorCheckerPath =
  "scripts/check-heu-task-center-adapter-dry-run-runner-output-ledger.mjs";
const checkerPath =
  "scripts/check-heu-task-center-adapter-dry-run-output-ledger-static-snapshot.mjs";
const reviewDecisionCheckerPath =
  "scripts/check-heu-task-center-adapter-dry-run-review-decision-packet.mjs";
const packagePath = "package.json";
const checkerAlias =
  "check:heu-task-center-adapter-dry-run-output-ledger-static-snapshot";
const checkerCommand = `node ${checkerPath}`;
const reviewDecisionCheckerAlias =
  "check:heu-task-center-adapter-dry-run-review-decision-packet";
const reviewDecisionCheckerCommand = `node ${reviewDecisionCheckerPath}`;

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
  reviewDecisionDocPath,
  priorDocPath,
  manifestPath,
  runnerScriptPath,
  priorCheckerPath,
  checkerPath,
  reviewDecisionCheckerPath,
  packagePath,
]) {
  requireFile(file);
}

if (failures.length === 0) {
  const component = read(componentPath);
  const panelSource = read(panelSourcePath);
  const doc = read(docPath);
  const reviewDecisionDoc = read(reviewDecisionDocPath);
  const priorDoc = read(priorDocPath);
  const manifest = read(manifestPath);
  const runnerScript = read(runnerScriptPath);
  const priorChecker = read(priorCheckerPath);
  const checkerScript = read(checkerPath);
  const reviewDecisionChecker = read(reviewDecisionCheckerPath);
  const packageJson = JSON.parse(read(packagePath));

  const boundaryTokens = [
    "TASK_CENTER_ADAPTER_DRY_RUN_OUTPUT_LEDGER_STATIC_SNAPSHOT_ONLY",
    "TASK_CENTER_ADAPTER_DRY_RUN_OUTPUT_LEDGER_STATIC_SNAPSHOT_READONLY",
    "TASK_CENTER_ADAPTER_DRY_RUN_OUTPUT_LEDGER_STATIC_SNAPSHOT_DRAFT_ONLY",
    "TASK_CENTER_ADAPTER_DRY_RUN_OUTPUT_LEDGER_STATIC_SNAPSHOT_NO_APPROVAL",
    "TASK_CENTER_ADAPTER_DRY_RUN_OUTPUT_LEDGER_STATIC_SNAPSHOT_NO_DATABASE_READ",
    "TASK_CENTER_ADAPTER_DRY_RUN_OUTPUT_LEDGER_STATIC_SNAPSHOT_NO_DATABASE_CLIENT",
    "TASK_CENTER_ADAPTER_DRY_RUN_OUTPUT_LEDGER_STATIC_SNAPSHOT_NO_ENV_ENABLEMENT",
    "TASK_CENTER_ADAPTER_DRY_RUN_OUTPUT_LEDGER_STATIC_SNAPSHOT_NO_FILE_WRITE",
    "TASK_CENTER_ADAPTER_DRY_RUN_OUTPUT_LEDGER_STATIC_SNAPSHOT_NO_TASK_MUTATION",
    "TASK_CENTER_ADAPTER_DRY_RUN_OUTPUT_LEDGER_STATIC_SNAPSHOT_NO_REAL_DATA",
    "TASK_CENTER_ADAPTER_DRY_RUN_OUTPUT_LEDGER_STATIC_SNAPSHOT_NO_AI_OR_AUTOMATION",
  ];

  const snapshotRows = [
    "OUTPUT_LEDGER_STATIC_SNAPSHOT_BOUNDARY_MODE",
    "OUTPUT_LEDGER_STATIC_SNAPSHOT_CASE_COUNT",
    "OUTPUT_LEDGER_STATIC_SNAPSHOT_RESTRICTED_DATA_ABSENT",
    "OUTPUT_LEDGER_STATIC_SNAPSHOT_DEPARTMENT_MISMATCH_BLOCKED",
    "OUTPUT_LEDGER_STATIC_SNAPSHOT_PRODUCTION_NO_GO",
  ];

  const sourceTokens = [
    "TaskCenterAdapterDryRunOutputLedgerStaticSnapshotItem",
    "adapterDryRunOutputLedgerStaticSnapshotItems",
    "adapterDryRunOutputLedgerStaticSnapshot",
    "OUTPUT_LEDGER_STATIC_SNAPSHOT_READY: PASS_LOCAL_SNAPSHOT_ONLY",
    "TASK_CENTER_DATABASE_READY: NO_GO_OUTPUT_LEDGER_STATIC_SNAPSHOT_ONLY",
    "NO_FILE_WRITE_NO_DATABASE_READ",
    "STATIC_SNAPSHOT_CHECKER_ONLY",
    ...snapshotRows,
  ];

  requireTokens(
    panelSource,
    [...boundaryTokens, ...sourceTokens],
    "output ledger static snapshot source token",
    panelSourcePath,
  );

  requireTokens(
    component,
    [
      ...boundaryTokens,
      "outputLedgerStaticSnapshotCodes",
      "data-heu-task-center-adapter-dry-run-output-ledger-static-snapshot",
      "data-heu-task-center-adapter-dry-run-output-ledger-static-snapshot-readonly",
      "data-heu-task-center-adapter-dry-run-output-ledger-static-snapshot-draft-only",
      "data-heu-task-center-adapter-dry-run-output-ledger-static-snapshot-no-approval",
      "data-heu-task-center-adapter-dry-run-output-ledger-static-snapshot-no-database-read",
      "data-heu-task-center-adapter-dry-run-output-ledger-static-snapshot-no-database-client",
      "data-heu-task-center-adapter-dry-run-output-ledger-static-snapshot-no-env-enablement",
      "data-heu-task-center-adapter-dry-run-output-ledger-static-snapshot-no-file-write",
      "data-heu-task-center-adapter-dry-run-output-ledger-static-snapshot-no-task-mutation",
      "data-heu-task-center-adapter-dry-run-output-ledger-static-snapshot-no-real-data",
      "data-heu-task-center-adapter-dry-run-output-ledger-static-snapshot-no-ai-or-automation",
      "data-heu-task-center-adapter-dry-run-output-ledger-static-snapshot-codes",
      "data-heu-task-center-adapter-dry-run-output-ledger-static-snapshot-item",
      "data-heu-task-center-adapter-dry-run-output-ledger-static-snapshot-reviewer",
      "data-heu-task-center-adapter-dry-run-output-ledger-static-snapshot-field",
      "data-heu-task-center-adapter-dry-run-output-ledger-static-snapshot-value",
      "data-heu-task-center-adapter-dry-run-output-ledger-static-snapshot-source-row",
      "data-heu-task-center-adapter-dry-run-output-ledger-static-snapshot-stop-rule",
      "HEU-Data-033 - Output ledger static snapshot",
      "Snapshot tinh de doi chieu output ledger",
      "gateEvidence.adapterDryRunOutputLedgerStaticSnapshot.items.map",
      "gateEvidence.adapterDryRunOutputLedgerStaticSnapshot.result",
      ...snapshotRows,
    ],
    "component output ledger static snapshot token",
    componentPath,
  );

  requireTokens(
    doc,
    [
      "HEU-DATA-033-TASK-CENTER-ADAPTER-DRY-RUN-OUTPUT-LEDGER-STATIC-SNAPSHOT",
      "Status: PASS_LOCAL_SNAPSHOT_ONLY",
      "Production status: NO-GO",
      "Runtime status: OUTPUT_LEDGER_STATIC_SNAPSHOT_READY: PASS_LOCAL_SNAPSHOT_ONLY",
      "Database status: TASK_CENTER_DATABASE_READY: NO_GO_OUTPUT_LEDGER_STATIC_SNAPSHOT_ONLY",
      ...boundaryTokens,
      ...snapshotRows,
      "check:heu-task-center-adapter-dry-run-output-ledger-static-snapshot",
      "HEU-DATA-034-TASK-CENTER-ADAPTER-DRY-RUN-REVIEW-DECISION-PACKET",
      "check:heu-task-center-adapter-dry-run-review-decision-packet",
      "REVIEW_DECISION_PACKET_READY: PASS_LOCAL_DECISION_PACKET_ONLY",
      "TASK_CENTER_DATABASE_READY: NO_GO_REVIEW_DECISION_PACKET_ONLY",
    ],
    "output ledger static snapshot doc token",
    docPath,
  );

  requireTokens(
    reviewDecisionDoc,
    [
      "HEU-DATA-034-TASK-CENTER-ADAPTER-DRY-RUN-REVIEW-DECISION-PACKET",
      "Status: PASS_LOCAL_DECISION_PACKET_ONLY",
      "Runtime status: REVIEW_DECISION_PACKET_READY: PASS_LOCAL_DECISION_PACKET_ONLY",
      "Database status: TASK_CENTER_DATABASE_READY: NO_GO_REVIEW_DECISION_PACKET_ONLY",
      "check:heu-task-center-adapter-dry-run-review-decision-packet",
      "REVIEW_REQUIRED_NO_GO",
    ],
    "review decision packet doc token",
    reviewDecisionDocPath,
  );

  requireTokens(
    priorDoc,
    [
      "HEU-DATA-033-TASK-CENTER-ADAPTER-DRY-RUN-OUTPUT-LEDGER-STATIC-SNAPSHOT",
      "check:heu-task-center-adapter-dry-run-output-ledger-static-snapshot",
      "OUTPUT_LEDGER_STATIC_SNAPSHOT_READY: PASS_LOCAL_SNAPSHOT_ONLY",
      "TASK_CENTER_DATABASE_READY: NO_GO_OUTPUT_LEDGER_STATIC_SNAPSHOT_ONLY",
    ],
    "prior output ledger next-slice token",
    priorDocPath,
  );

  requireTokens(
    runnerScript,
    [
      "LOCAL_RUNNER_REPORT_ONLY: PASS_LOCAL_SYNTHETIC_IN_MEMORY",
      "LOCAL_RUNNER_CASE_PASS_SCOPE_MATCH",
      "LOCAL_RUNNER_CASE_PASS_RESTRICTED_FIELDS_ABSENT",
      "LOCAL_RUNNER_CASE_PASS_DEPARTMENT_MISMATCH_BLOCKED",
      "LOCAL_RUNNER_CASE_PASS_PRODUCTION_NO_GO",
      "TASK_CENTER_DATABASE_READY: NO_GO_LOCAL_RUNNER_SCRIPT_DRAFT_ONLY",
    ],
    "runner output token source",
    runnerScriptPath,
  );

  requireTokens(
    manifest,
    [
      docPath,
      reviewDecisionDocPath,
      checkerPath,
      reviewDecisionCheckerPath,
      "node --check scripts/check-heu-task-center-adapter-dry-run-output-ledger-static-snapshot.mjs",
      "node --check scripts/check-heu-task-center-adapter-dry-run-review-decision-packet.mjs",
      "npm.cmd run check:heu-task-center-adapter-dry-run-output-ledger-static-snapshot",
      "npm.cmd run check:heu-task-center-adapter-dry-run-review-decision-packet",
    ],
    "manifest output ledger static snapshot token",
    manifestPath,
  );

  requireTokens(
    priorChecker,
    [
      "HEU-DATA-033-TASK-CENTER-ADAPTER-DRY-RUN-OUTPUT-LEDGER-STATIC-SNAPSHOT",
      "check:heu-task-center-adapter-dry-run-output-ledger-static-snapshot",
      "OUTPUT_LEDGER_STATIC_SNAPSHOT_READY: PASS_LOCAL_SNAPSHOT_ONLY",
    ],
    "prior checker next-slice token",
    priorCheckerPath,
  );

  if (packageJson.scripts?.[checkerAlias] !== checkerCommand) {
    fail(`${packagePath}: missing or mismatched ${checkerAlias}`);
  }

  if (packageJson.scripts?.[reviewDecisionCheckerAlias] !== reviewDecisionCheckerCommand) {
    fail(`${packagePath}: missing or mismatched ${reviewDecisionCheckerAlias}`);
  }

  requireTokens(
    checkerScript,
    [
      "existsSync",
      "readFileSync",
      "HEU_TASK_CENTER_ADAPTER_DRY_RUN_OUTPUT_LEDGER_STATIC_SNAPSHOT_READY: PASS_LOCAL",
      "TASK_CENTER_DATABASE_READY: NO_GO_OUTPUT_LEDGER_STATIC_SNAPSHOT_ONLY",
      "HEU-DATA-034-TASK-CENTER-ADAPTER-DRY-RUN-REVIEW-DECISION-PACKET",
      "check:heu-task-center-adapter-dry-run-review-decision-packet",
      "REVIEW_DECISION_PACKET_READY: PASS_LOCAL_DECISION_PACKET_ONLY",
      "NO_RUNTIME_MUTATION: task center adapter dry-run output ledger static snapshot checker only; no owner approval, database client, database read, env enablement, file output write, table creation, SQL migration, task write, file upload, storage write, real-data fixture, AI call, paid automation, deploy, finance action or production GO",
    ],
    "checker-script read-only token",
    checkerPath,
  );

  requireTokens(
    reviewDecisionChecker,
    [
      "HEU_TASK_CENTER_ADAPTER_DRY_RUN_REVIEW_DECISION_PACKET_READY: PASS_LOCAL",
      "TASK_CENTER_DATABASE_READY: NO_GO_REVIEW_DECISION_PACKET_ONLY",
      "NO_RUNTIME_MUTATION: task center adapter dry-run review decision packet checker only",
    ],
    "review decision packet checker token",
    reviewDecisionCheckerPath,
  );

  const runtimeScopeText = [panelSource, component, runnerScript].join("\n");

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
      { label: "node fs import", pattern: /from\s+["']node:fs["']/ },
      { label: "fs import", pattern: /from\s+["']fs["']/ },
      { label: "file output write", pattern: /\bwriteFileSync\s*\(/ },
      { label: "append file write", pattern: /\bappendFileSync\s*\(/ },
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
    "runtime DB, env, SQL, file, upload, storage, secret, approval or mutation API",
    "task-center adapter dry-run output ledger static snapshot scope",
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
    "HEU Task Center adapter dry-run output ledger static snapshot check failed:",
  );
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("HEU Task Center adapter dry-run output ledger static snapshot check");
console.log(
  "HEU_TASK_CENTER_ADAPTER_DRY_RUN_OUTPUT_LEDGER_STATIC_SNAPSHOT_READY: PASS_LOCAL",
);
console.log("TASK_CENTER_DATABASE_READY: NO_GO_OUTPUT_LEDGER_STATIC_SNAPSHOT_ONLY");
console.log(
  "NO_RUNTIME_MUTATION: task center adapter dry-run output ledger static snapshot checker only; no owner approval, database client, database read, env enablement, file output write, table creation, SQL migration, task write, file upload, storage write, real-data fixture, AI call, paid automation, deploy, finance action or production GO",
);
