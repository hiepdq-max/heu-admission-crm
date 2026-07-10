import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const failures = [];

const componentPath = "components/data-confirmation/department-task-inbox.tsx";
const panelSourcePath = "lib/task-center-gate-evidence-panel-source.ts";
const docPath =
  "docs/HEU_CONTROL/HEU_DATA_034_TASK_CENTER_ADAPTER_DRY_RUN_REVIEW_DECISION_PACKET_20260710.md";
const priorDocPath =
  "docs/HEU_CONTROL/HEU_DATA_033_TASK_CENTER_ADAPTER_DRY_RUN_OUTPUT_LEDGER_STATIC_SNAPSHOT_20260710.md";
const manifestPath =
  "docs/HEU_CONTROL/HEU_APP_SHELL_001_STAGE_FILE_MANIFEST_20260709.md";
const priorCheckerPath =
  "scripts/check-heu-task-center-adapter-dry-run-output-ledger-static-snapshot.mjs";
const checkerPath =
  "scripts/check-heu-task-center-adapter-dry-run-review-decision-packet.mjs";
const runnerScriptPath =
  "scripts/dry-run-heu-task-center-adapter-local-runner.mjs";
const packagePath = "package.json";
const checkerAlias =
  "check:heu-task-center-adapter-dry-run-review-decision-packet";
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
  priorCheckerPath,
  checkerPath,
  runnerScriptPath,
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
  const priorChecker = read(priorCheckerPath);
  const checkerScript = read(checkerPath);
  const runnerScript = read(runnerScriptPath);
  const packageJson = JSON.parse(read(packagePath));

  const boundaryTokens = [
    "TASK_CENTER_ADAPTER_DRY_RUN_REVIEW_DECISION_PACKET_ONLY",
    "TASK_CENTER_ADAPTER_DRY_RUN_REVIEW_DECISION_PACKET_READONLY",
    "TASK_CENTER_ADAPTER_DRY_RUN_REVIEW_DECISION_PACKET_DRAFT_ONLY",
    "TASK_CENTER_ADAPTER_DRY_RUN_REVIEW_DECISION_PACKET_NO_APPROVAL",
    "TASK_CENTER_ADAPTER_DRY_RUN_REVIEW_DECISION_PACKET_NO_DATABASE_READ",
    "TASK_CENTER_ADAPTER_DRY_RUN_REVIEW_DECISION_PACKET_NO_DATABASE_CLIENT",
    "TASK_CENTER_ADAPTER_DRY_RUN_REVIEW_DECISION_PACKET_NO_ENV_ENABLEMENT",
    "TASK_CENTER_ADAPTER_DRY_RUN_REVIEW_DECISION_PACKET_NO_FILE_WRITE",
    "TASK_CENTER_ADAPTER_DRY_RUN_REVIEW_DECISION_PACKET_NO_TASK_MUTATION",
    "TASK_CENTER_ADAPTER_DRY_RUN_REVIEW_DECISION_PACKET_NO_REAL_DATA",
    "TASK_CENTER_ADAPTER_DRY_RUN_REVIEW_DECISION_PACKET_NO_AI_OR_AUTOMATION",
  ];

  const packetRows = [
    "REVIEW_DECISION_PACKET_IT_DATA_SCOPE_FIRST",
    "REVIEW_DECISION_PACKET_AUDIT_NEGATIVE_ACCESS",
    "REVIEW_DECISION_PACKET_PHAP_CHE_RESTRICTED_DATA",
    "REVIEW_DECISION_PACKET_DEPARTMENT_OWNER_TASK_BOUNDARY",
    "REVIEW_DECISION_PACKET_BGH_PRODUCTION_NO_GO",
  ];

  const sourceTokens = [
    "TaskCenterAdapterDryRunReviewDecisionPacketItem",
    "adapterDryRunReviewDecisionPacketItems",
    "adapterDryRunReviewDecisionPacket",
    "REVIEW_REQUIRED_NO_GO",
    "REVIEW_DECISION_PACKET_READY: PASS_LOCAL_DECISION_PACKET_ONLY",
    "TASK_CENTER_DATABASE_READY: NO_GO_REVIEW_DECISION_PACKET_ONLY",
    "NO_DATABASE_READ_BEFORE_IT_DATA_SIGNOFF",
    "STATIC_SNAPSHOT_CHECKER_ONLY",
    "NO_RAW_PII_NO_PAYMENT_DATA",
    "NO_TASK_MUTATION_ROUTE_CREATED",
    "NO_PRODUCTION_GO_NO_DEPLOY",
    ...packetRows,
  ];

  requireTokens(
    panelSource,
    [...boundaryTokens, ...sourceTokens],
    "review decision packet source token",
    panelSourcePath,
  );

  requireTokens(
    component,
    [
      ...boundaryTokens,
      "reviewDecisionPacketCodes",
      "data-heu-task-center-adapter-dry-run-review-decision-packet",
      "data-heu-task-center-adapter-dry-run-review-decision-packet-readonly",
      "data-heu-task-center-adapter-dry-run-review-decision-packet-draft-only",
      "data-heu-task-center-adapter-dry-run-review-decision-packet-no-approval",
      "data-heu-task-center-adapter-dry-run-review-decision-packet-no-database-read",
      "data-heu-task-center-adapter-dry-run-review-decision-packet-no-database-client",
      "data-heu-task-center-adapter-dry-run-review-decision-packet-no-env-enablement",
      "data-heu-task-center-adapter-dry-run-review-decision-packet-no-file-write",
      "data-heu-task-center-adapter-dry-run-review-decision-packet-no-task-mutation",
      "data-heu-task-center-adapter-dry-run-review-decision-packet-no-real-data",
      "data-heu-task-center-adapter-dry-run-review-decision-packet-no-ai-or-automation",
      "data-heu-task-center-adapter-dry-run-review-decision-packet-codes",
      "data-heu-task-center-adapter-dry-run-review-decision-packet-item",
      "data-heu-task-center-adapter-dry-run-review-decision-packet-reviewer",
      "data-heu-task-center-adapter-dry-run-review-decision-packet-decision-state",
      "data-heu-task-center-adapter-dry-run-review-decision-packet-question",
      "data-heu-task-center-adapter-dry-run-review-decision-packet-required-before-db-read",
      "data-heu-task-center-adapter-dry-run-review-decision-packet-stop-rule",
      "HEU-Data-034 - Review decision packet",
      "Goi cau hoi review truoc khi xet DB read",
      "gateEvidence.adapterDryRunReviewDecisionPacket.items.map",
      "gateEvidence.adapterDryRunReviewDecisionPacket.result",
      ...packetRows,
    ],
    "component review decision packet token",
    componentPath,
  );

  requireTokens(
    doc,
    [
      "HEU-DATA-034-TASK-CENTER-ADAPTER-DRY-RUN-REVIEW-DECISION-PACKET",
      "Status: PASS_LOCAL_DECISION_PACKET_ONLY",
      "Production status: NO-GO",
      "Runtime status: REVIEW_DECISION_PACKET_READY: PASS_LOCAL_DECISION_PACKET_ONLY",
      "Database status: TASK_CENTER_DATABASE_READY: NO_GO_REVIEW_DECISION_PACKET_ONLY",
      ...boundaryTokens,
      ...packetRows,
      "REVIEW_REQUIRED_NO_GO",
      "check:heu-task-center-adapter-dry-run-review-decision-packet",
      "HEU-DATA-035-TASK-CENTER-ADAPTER-DRY-RUN-DB-READ-GO-NO-GO-PRECHECK",
    ],
    "review decision packet doc token",
    docPath,
  );

  requireTokens(
    priorDoc,
    [
      "HEU-DATA-034-TASK-CENTER-ADAPTER-DRY-RUN-REVIEW-DECISION-PACKET",
      "check:heu-task-center-adapter-dry-run-review-decision-packet",
      "REVIEW_DECISION_PACKET_READY: PASS_LOCAL_DECISION_PACKET_ONLY",
      "TASK_CENTER_DATABASE_READY: NO_GO_REVIEW_DECISION_PACKET_ONLY",
    ],
    "prior static snapshot next-slice token",
    priorDocPath,
  );

  requireTokens(
    manifest,
    [
      docPath,
      checkerPath,
      "node --check scripts/check-heu-task-center-adapter-dry-run-review-decision-packet.mjs",
      "npm.cmd run check:heu-task-center-adapter-dry-run-review-decision-packet",
    ],
    "manifest review decision packet token",
    manifestPath,
  );

  requireTokens(
    priorChecker,
    [
      "HEU-DATA-034-TASK-CENTER-ADAPTER-DRY-RUN-REVIEW-DECISION-PACKET",
      "check:heu-task-center-adapter-dry-run-review-decision-packet",
      "REVIEW_DECISION_PACKET_READY: PASS_LOCAL_DECISION_PACKET_ONLY",
    ],
    "prior checker next-slice token",
    priorCheckerPath,
  );

  requireTokens(
    runnerScript,
    [
      "LOCAL_RUNNER_REPORT_ONLY: PASS_LOCAL_SYNTHETIC_IN_MEMORY",
      "LOCAL_RUNNER_CASE_PASS_RESTRICTED_FIELDS_ABSENT",
      "LOCAL_RUNNER_CASE_PASS_DEPARTMENT_MISMATCH_BLOCKED",
      "LOCAL_RUNNER_CASE_PASS_PRODUCTION_NO_GO",
      "TASK_CENTER_DATABASE_READY: NO_GO_LOCAL_RUNNER_SCRIPT_DRAFT_ONLY",
    ],
    "runner output token source",
    runnerScriptPath,
  );

  if (packageJson.scripts?.[checkerAlias] !== checkerCommand) {
    fail(`${packagePath}: missing or mismatched ${checkerAlias}`);
  }

  requireTokens(
    checkerScript,
    [
      "existsSync",
      "readFileSync",
      "HEU_TASK_CENTER_ADAPTER_DRY_RUN_REVIEW_DECISION_PACKET_READY: PASS_LOCAL",
      "TASK_CENTER_DATABASE_READY: NO_GO_REVIEW_DECISION_PACKET_ONLY",
      "NO_RUNTIME_MUTATION: task center adapter dry-run review decision packet checker only; no owner approval, database client, database read, env enablement, file output write, table creation, SQL migration, task write, file upload, storage write, real-data fixture, AI call, paid automation, deploy, finance action or production GO",
    ],
    "checker-script read-only token",
    checkerPath,
  );

  const decisionRowMatches = panelSource.match(/code:\s*"REVIEW_DECISION_PACKET_[A-Z_]+"/g) ?? [];
  if (decisionRowMatches.length !== 5) {
    fail(
      `${panelSourcePath}: expected exactly 5 review decision packet rows, found ${decisionRowMatches.length}`,
    );
  }

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
    "task-center adapter dry-run review decision packet scope",
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
    "HEU Task Center adapter dry-run review decision packet check failed:",
  );
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("HEU Task Center adapter dry-run review decision packet check");
console.log(
  "HEU_TASK_CENTER_ADAPTER_DRY_RUN_REVIEW_DECISION_PACKET_READY: PASS_LOCAL",
);
console.log("TASK_CENTER_DATABASE_READY: NO_GO_REVIEW_DECISION_PACKET_ONLY");
console.log(
  "NO_RUNTIME_MUTATION: task center adapter dry-run review decision packet checker only; no owner approval, database client, database read, env enablement, file output write, table creation, SQL migration, task write, file upload, storage write, real-data fixture, AI call, paid automation, deploy, finance action or production GO",
);
