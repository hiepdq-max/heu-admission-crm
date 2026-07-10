import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const failures = [];

const componentPath = "components/data-confirmation/department-task-inbox.tsx";
const panelSourcePath = "lib/task-center-gate-evidence-panel-source.ts";
const docPath =
  "docs/HEU_CONTROL/HEU_DATA_035_TASK_CENTER_ADAPTER_DRY_RUN_DB_READ_GO_NO_GO_PRECHECK_20260710.md";
const nextDocPath =
  "docs/HEU_CONTROL/HEU_DATA_036_TASK_CENTER_ADAPTER_DRY_RUN_OWNER_SIGNOFF_EVIDENCE_MATRIX_REVIEW_20260710.md";
const priorDocPath =
  "docs/HEU_CONTROL/HEU_DATA_034_TASK_CENTER_ADAPTER_DRY_RUN_REVIEW_DECISION_PACKET_20260710.md";
const manifestPath =
  "docs/HEU_CONTROL/HEU_APP_SHELL_001_STAGE_FILE_MANIFEST_20260709.md";
const priorCheckerPath =
  "scripts/check-heu-task-center-adapter-dry-run-review-decision-packet.mjs";
const checkerPath =
  "scripts/check-heu-task-center-adapter-dry-run-db-read-go-no-go-precheck.mjs";
const nextCheckerPath =
  "scripts/check-heu-task-center-adapter-dry-run-owner-signoff-evidence-matrix-review.mjs";
const runnerScriptPath =
  "scripts/dry-run-heu-task-center-adapter-local-runner.mjs";
const packagePath = "package.json";
const checkerAlias =
  "check:heu-task-center-adapter-dry-run-db-read-go-no-go-precheck";
const checkerCommand = `node ${checkerPath}`;
const nextCheckerAlias =
  "check:heu-task-center-adapter-dry-run-owner-signoff-evidence-matrix-review";
const nextCheckerCommand = `node ${nextCheckerPath}`;

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
  nextDocPath,
  priorDocPath,
  manifestPath,
  priorCheckerPath,
  checkerPath,
  nextCheckerPath,
  runnerScriptPath,
  packagePath,
]) {
  requireFile(file);
}

if (failures.length === 0) {
  const component = read(componentPath);
  const panelSource = read(panelSourcePath);
  const doc = read(docPath);
  const nextDoc = read(nextDocPath);
  const priorDoc = read(priorDocPath);
  const manifest = read(manifestPath);
  const priorChecker = read(priorCheckerPath);
  const checkerScript = read(checkerPath);
  const nextChecker = read(nextCheckerPath);
  const runnerScript = read(runnerScriptPath);
  const packageJson = JSON.parse(read(packagePath));

  const boundaryTokens = [
    "TASK_CENTER_ADAPTER_DRY_RUN_DB_READ_GO_NO_GO_PRECHECK_ONLY",
    "TASK_CENTER_ADAPTER_DRY_RUN_DB_READ_GO_NO_GO_PRECHECK_READONLY",
    "TASK_CENTER_ADAPTER_DRY_RUN_DB_READ_GO_NO_GO_PRECHECK_DRAFT_ONLY",
    "TASK_CENTER_ADAPTER_DRY_RUN_DB_READ_GO_NO_GO_PRECHECK_NO_APPROVAL",
    "TASK_CENTER_ADAPTER_DRY_RUN_DB_READ_GO_NO_GO_PRECHECK_NO_DATABASE_READ",
    "TASK_CENTER_ADAPTER_DRY_RUN_DB_READ_GO_NO_GO_PRECHECK_NO_DATABASE_CLIENT",
    "TASK_CENTER_ADAPTER_DRY_RUN_DB_READ_GO_NO_GO_PRECHECK_NO_ENV_ENABLEMENT",
    "TASK_CENTER_ADAPTER_DRY_RUN_DB_READ_GO_NO_GO_PRECHECK_NO_FILE_WRITE",
    "TASK_CENTER_ADAPTER_DRY_RUN_DB_READ_GO_NO_GO_PRECHECK_NO_TASK_MUTATION",
    "TASK_CENTER_ADAPTER_DRY_RUN_DB_READ_GO_NO_GO_PRECHECK_NO_REAL_DATA",
    "TASK_CENTER_ADAPTER_DRY_RUN_DB_READ_GO_NO_GO_PRECHECK_NO_AI_OR_AUTOMATION",
  ];

  const precheckRows = [
    "DB_READ_GO_NO_GO_PRECHECK_IT_DATA_SCOPE_FIRST",
    "DB_READ_GO_NO_GO_PRECHECK_AUDIT_NEGATIVE_ACCESS",
    "DB_READ_GO_NO_GO_PRECHECK_PHAP_CHE_RESTRICTED_DATA",
    "DB_READ_GO_NO_GO_PRECHECK_DEPARTMENT_OWNER_TASK_BOUNDARY",
    "DB_READ_GO_NO_GO_PRECHECK_BGH_PRODUCTION_NO_GO",
  ];

  const precheckEvidenceTokens = [
    "NO_GO_REQUIRES_OWNER_DECISION",
    "SIGNED_SCOPE_FIRST_FILTER_MATRIX",
    "DATABASE_READ_ADAPTER_ENABLEMENT",
    "NO_DB_READ_WITHOUT_IT_DATA_SCOPE_FIRST_SIGNOFF",
    "SIGNED_NEGATIVE_ACCESS_TEST_PLAN",
    "DATABASE_READ_RUNTIME_TEST",
    "NO_DB_READ_WITHOUT_AUDIT_NEGATIVE_ACCESS_SIGNOFF",
    "RESTRICTED_DATA_MINIMIZATION_DECISION",
    "RAW_PII_PAYMENT_FIELD_ACCESS",
    "NO_RAW_PII_OR_PAYMENT_DB_READ",
    "DEPARTMENT_TASK_FIELD_OWNERSHIP_MATRIX",
    "TASK_MUTATION_OR_CROSS_DEPARTMENT_READ",
    "NO_CROSS_SCOPE_TASK_READ_OR_WRITE",
    "BGH_NO_PRODUCTION_GO_ACKNOWLEDGEMENT",
    "PRODUCTION_DEPLOY_OR_OWNER_GO",
    "NO_PRODUCTION_GO_NO_DEPLOY",
  ];

  const sourceTokens = [
    "TaskCenterAdapterDryRunDbReadGoNoGoPrecheckItem",
    "adapterDryRunDbReadGoNoGoPrecheckItems",
    "adapterDryRunDbReadGoNoGoPrecheck",
    "DB_READ_GO_NO_GO_PRECHECK_READY: PASS_LOCAL_PRECHECK_ONLY",
    "TASK_CENTER_DATABASE_READY: NO_GO_DB_READ_GO_NO_GO_PRECHECK_ONLY",
    ...precheckRows,
    ...precheckEvidenceTokens,
  ];

  requireTokens(
    panelSource,
    [...boundaryTokens, ...sourceTokens],
    "DB read GO/NO-GO precheck source token",
    panelSourcePath,
  );

  requireTokens(
    component,
    [
      ...boundaryTokens,
      "dbReadGoNoGoPrecheckCodes",
      "data-heu-task-center-adapter-dry-run-db-read-go-no-go-precheck",
      "data-heu-task-center-adapter-dry-run-db-read-go-no-go-precheck-readonly",
      "data-heu-task-center-adapter-dry-run-db-read-go-no-go-precheck-draft-only",
      "data-heu-task-center-adapter-dry-run-db-read-go-no-go-precheck-no-approval",
      "data-heu-task-center-adapter-dry-run-db-read-go-no-go-precheck-no-database-read",
      "data-heu-task-center-adapter-dry-run-db-read-go-no-go-precheck-no-database-client",
      "data-heu-task-center-adapter-dry-run-db-read-go-no-go-precheck-no-env-enablement",
      "data-heu-task-center-adapter-dry-run-db-read-go-no-go-precheck-no-file-write",
      "data-heu-task-center-adapter-dry-run-db-read-go-no-go-precheck-no-task-mutation",
      "data-heu-task-center-adapter-dry-run-db-read-go-no-go-precheck-no-real-data",
      "data-heu-task-center-adapter-dry-run-db-read-go-no-go-precheck-no-ai-or-automation",
      "data-heu-task-center-adapter-dry-run-db-read-go-no-go-precheck-codes",
      "data-heu-task-center-adapter-dry-run-db-read-go-no-go-precheck-item",
      "data-heu-task-center-adapter-dry-run-db-read-go-no-go-precheck-reviewer",
      "data-heu-task-center-adapter-dry-run-db-read-go-no-go-precheck-go-no-go",
      "data-heu-task-center-adapter-dry-run-db-read-go-no-go-precheck-required-evidence",
      "data-heu-task-center-adapter-dry-run-db-read-go-no-go-precheck-blocked-action",
      "data-heu-task-center-adapter-dry-run-db-read-go-no-go-precheck-stop-rule",
      "HEU-Data-035 - DB read GO/NO-GO precheck",
      "Precheck NO-GO truoc khi xet DB read",
      "gateEvidence.adapterDryRunDbReadGoNoGoPrecheck.items.map",
      "gateEvidence.adapterDryRunDbReadGoNoGoPrecheck.result",
      ...precheckRows,
    ],
    "component DB read GO/NO-GO precheck token",
    componentPath,
  );

  requireTokens(
    doc,
    [
      "HEU-DATA-035-TASK-CENTER-ADAPTER-DRY-RUN-DB-READ-GO-NO-GO-PRECHECK",
      "Status: PASS_LOCAL_PRECHECK_ONLY",
      "Production status: NO-GO",
      "Runtime status: DB_READ_GO_NO_GO_PRECHECK_READY: PASS_LOCAL_PRECHECK_ONLY",
      "Database status: TASK_CENTER_DATABASE_READY: NO_GO_DB_READ_GO_NO_GO_PRECHECK_ONLY",
      ...boundaryTokens,
      ...precheckRows,
      ...precheckEvidenceTokens,
      checkerAlias,
      nextCheckerAlias,
      "HEU-DATA-036-TASK-CENTER-ADAPTER-DRY-RUN-OWNER-SIGNOFF-EVIDENCE-MATRIX-REVIEW",
      "OWNER_SIGNOFF_EVIDENCE_MATRIX_REVIEW_READY: PASS_LOCAL_MATRIX_ONLY",
      "TASK_CENTER_DATABASE_READY: NO_GO_OWNER_SIGNOFF_EVIDENCE_MATRIX_REVIEW_ONLY",
    ],
    "DB read GO/NO-GO precheck doc token",
    docPath,
  );

  requireTokens(
    nextDoc,
    [
      "HEU-DATA-036-TASK-CENTER-ADAPTER-DRY-RUN-OWNER-SIGNOFF-EVIDENCE-MATRIX-REVIEW",
      "Status: PASS_LOCAL_MATRIX_ONLY",
      "OWNER_SIGNOFF_EVIDENCE_MATRIX_REVIEW_READY: PASS_LOCAL_MATRIX_ONLY",
      "TASK_CENTER_DATABASE_READY: NO_GO_OWNER_SIGNOFF_EVIDENCE_MATRIX_REVIEW_ONLY",
      "SIGNOFF_EVIDENCE_REVIEW_REQUIRED_NO_GO",
      "CONTROLLED_EVIDENCE_OUTSIDE_GIT_OR_CHAT",
    ],
    "next owner signoff evidence matrix review doc token",
    nextDocPath,
  );

  requireTokens(
    priorDoc,
    [
      "HEU-DATA-035-TASK-CENTER-ADAPTER-DRY-RUN-DB-READ-GO-NO-GO-PRECHECK",
      checkerAlias,
      "DB_READ_GO_NO_GO_PRECHECK_READY: PASS_LOCAL_PRECHECK_ONLY",
      "TASK_CENTER_DATABASE_READY: NO_GO_DB_READ_GO_NO_GO_PRECHECK_ONLY",
    ],
    "prior review decision packet next-slice token",
    priorDocPath,
  );

  requireTokens(
    manifest,
    [
      docPath,
      nextDocPath,
      checkerPath,
      nextCheckerPath,
      "node --check scripts/check-heu-task-center-adapter-dry-run-db-read-go-no-go-precheck.mjs",
      "node --check scripts/check-heu-task-center-adapter-dry-run-owner-signoff-evidence-matrix-review.mjs",
      "npm.cmd run check:heu-task-center-adapter-dry-run-db-read-go-no-go-precheck",
      "npm.cmd run check:heu-task-center-adapter-dry-run-owner-signoff-evidence-matrix-review",
    ],
    "manifest DB read GO/NO-GO precheck token",
    manifestPath,
  );

  requireTokens(
    priorChecker,
    [
      "HEU-DATA-035-TASK-CENTER-ADAPTER-DRY-RUN-DB-READ-GO-NO-GO-PRECHECK",
      checkerAlias,
      "DB_READ_GO_NO_GO_PRECHECK_READY: PASS_LOCAL_PRECHECK_ONLY",
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

  if (packageJson.scripts?.[nextCheckerAlias] !== nextCheckerCommand) {
    fail(`${packagePath}: missing or mismatched ${nextCheckerAlias}`);
  }

  requireTokens(
    checkerScript,
    [
      "existsSync",
      "readFileSync",
      "HEU_TASK_CENTER_ADAPTER_DRY_RUN_DB_READ_GO_NO_GO_PRECHECK_READY: PASS_LOCAL",
      "TASK_CENTER_DATABASE_READY: NO_GO_DB_READ_GO_NO_GO_PRECHECK_ONLY",
      "NO_RUNTIME_MUTATION: task center adapter dry-run DB read GO/NO-GO precheck checker only; no owner approval, database client, database read, env enablement, file output write, table creation, SQL migration, task write, file upload, storage write, real-data fixture, AI call, paid automation, deploy, finance action or production GO",
    ],
    "checker-script read-only token",
    checkerPath,
  );

  requireTokens(
    nextChecker,
    [
      "HEU_TASK_CENTER_ADAPTER_DRY_RUN_OWNER_SIGNOFF_EVIDENCE_MATRIX_REVIEW_READY: PASS_LOCAL",
      "TASK_CENTER_DATABASE_READY: NO_GO_OWNER_SIGNOFF_EVIDENCE_MATRIX_REVIEW_ONLY",
      "SIGNOFF_EVIDENCE_REVIEW_REQUIRED_NO_GO",
    ],
    "next checker read-only token",
    nextCheckerPath,
  );

  const precheckRowMatches =
    panelSource.match(/code:\s*"DB_READ_GO_NO_GO_PRECHECK_[A-Z_]+"/g) ?? [];
  if (precheckRowMatches.length !== 5) {
    fail(
      `${panelSourcePath}: expected exactly 5 DB read GO/NO-GO precheck rows, found ${precheckRowMatches.length}`,
    );
  }

  const noGoMatches =
    panelSource.match(/goNoGo:\s*"NO_GO_REQUIRES_OWNER_DECISION",/g) ?? [];
  if (noGoMatches.length !== 5) {
    fail(
      `${panelSourcePath}: expected exactly 5 NO_GO_REQUIRES_OWNER_DECISION assignments, found ${noGoMatches.length}`,
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
        pattern:
          /eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{10,}/,
      },
    ],
    "runtime DB, env, SQL, file, upload, storage, secret, approval or mutation API",
    "task-center adapter dry-run DB read GO/NO-GO precheck scope",
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
    "HEU Task Center adapter dry-run DB read GO/NO-GO precheck failed:",
  );
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("HEU Task Center adapter dry-run DB read GO/NO-GO precheck");
console.log(
  "HEU_TASK_CENTER_ADAPTER_DRY_RUN_DB_READ_GO_NO_GO_PRECHECK_READY: PASS_LOCAL",
);
console.log(
  "TASK_CENTER_DATABASE_READY: NO_GO_DB_READ_GO_NO_GO_PRECHECK_ONLY",
);
console.log(
  "NO_RUNTIME_MUTATION: task center adapter dry-run DB read GO/NO-GO precheck checker only; no owner approval, database client, database read, env enablement, file output write, table creation, SQL migration, task write, file upload, storage write, real-data fixture, AI call, paid automation, deploy, finance action or production GO",
);
