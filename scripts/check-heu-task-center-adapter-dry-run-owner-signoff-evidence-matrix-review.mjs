import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const failures = [];

const componentPath = "components/data-confirmation/department-task-inbox.tsx";
const panelSourcePath = "lib/task-center-gate-evidence-panel-source.ts";
const docPath =
  "docs/HEU_CONTROL/HEU_DATA_036_TASK_CENTER_ADAPTER_DRY_RUN_OWNER_SIGNOFF_EVIDENCE_MATRIX_REVIEW_20260710.md";
const priorDocPath =
  "docs/HEU_CONTROL/HEU_DATA_035_TASK_CENTER_ADAPTER_DRY_RUN_DB_READ_GO_NO_GO_PRECHECK_20260710.md";
const manifestPath =
  "docs/HEU_CONTROL/HEU_APP_SHELL_001_STAGE_FILE_MANIFEST_20260709.md";
const priorCheckerPath =
  "scripts/check-heu-task-center-adapter-dry-run-db-read-go-no-go-precheck.mjs";
const checkerPath =
  "scripts/check-heu-task-center-adapter-dry-run-owner-signoff-evidence-matrix-review.mjs";
const runnerScriptPath =
  "scripts/dry-run-heu-task-center-adapter-local-runner.mjs";
const packagePath = "package.json";
const checkerAlias =
  "check:heu-task-center-adapter-dry-run-owner-signoff-evidence-matrix-review";
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
    "TASK_CENTER_ADAPTER_DRY_RUN_OWNER_SIGNOFF_EVIDENCE_MATRIX_REVIEW_ONLY",
    "TASK_CENTER_ADAPTER_DRY_RUN_OWNER_SIGNOFF_EVIDENCE_MATRIX_REVIEW_READONLY",
    "TASK_CENTER_ADAPTER_DRY_RUN_OWNER_SIGNOFF_EVIDENCE_MATRIX_REVIEW_DRAFT_ONLY",
    "TASK_CENTER_ADAPTER_DRY_RUN_OWNER_SIGNOFF_EVIDENCE_MATRIX_REVIEW_NO_APPROVAL",
    "TASK_CENTER_ADAPTER_DRY_RUN_OWNER_SIGNOFF_EVIDENCE_MATRIX_REVIEW_NO_DATABASE_READ",
    "TASK_CENTER_ADAPTER_DRY_RUN_OWNER_SIGNOFF_EVIDENCE_MATRIX_REVIEW_NO_DATABASE_CLIENT",
    "TASK_CENTER_ADAPTER_DRY_RUN_OWNER_SIGNOFF_EVIDENCE_MATRIX_REVIEW_NO_ENV_ENABLEMENT",
    "TASK_CENTER_ADAPTER_DRY_RUN_OWNER_SIGNOFF_EVIDENCE_MATRIX_REVIEW_NO_FILE_WRITE",
    "TASK_CENTER_ADAPTER_DRY_RUN_OWNER_SIGNOFF_EVIDENCE_MATRIX_REVIEW_NO_TASK_MUTATION",
    "TASK_CENTER_ADAPTER_DRY_RUN_OWNER_SIGNOFF_EVIDENCE_MATRIX_REVIEW_NO_REAL_DATA",
    "TASK_CENTER_ADAPTER_DRY_RUN_OWNER_SIGNOFF_EVIDENCE_MATRIX_REVIEW_NO_AI_OR_AUTOMATION",
  ];

  const matrixRows = [
    "OWNER_SIGNOFF_EVIDENCE_MATRIX_IT_DATA_SCOPE_FIRST",
    "OWNER_SIGNOFF_EVIDENCE_MATRIX_AUDIT_NEGATIVE_ACCESS",
    "OWNER_SIGNOFF_EVIDENCE_MATRIX_PHAP_CHE_RESTRICTED_DATA",
    "OWNER_SIGNOFF_EVIDENCE_MATRIX_DEPARTMENT_OWNER_TASK_BOUNDARY",
    "OWNER_SIGNOFF_EVIDENCE_MATRIX_BGH_PRODUCTION_NO_GO",
  ];

  const matrixEvidenceTokens = [
    "SIGNOFF_EVIDENCE_REVIEW_REQUIRED_NO_GO",
    "SIGNED_SCOPE_FIRST_FILTER_MATRIX",
    "SIGNED_NEGATIVE_ACCESS_TEST_PLAN",
    "RESTRICTED_DATA_MINIMIZATION_DECISION",
    "DEPARTMENT_TASK_FIELD_OWNERSHIP_MATRIX",
    "BGH_NO_PRODUCTION_GO_ACKNOWLEDGEMENT",
    "CONTROLLED_EVIDENCE_OUTSIDE_GIT_OR_CHAT",
    "NO_OWNER_SIGNOFF_WITHOUT_IT_DATA_EVIDENCE_REVIEW",
    "NO_OWNER_SIGNOFF_WITHOUT_AUDIT_EVIDENCE_REVIEW",
    "NO_OWNER_SIGNOFF_WITHOUT_PHAP_CHE_EVIDENCE_REVIEW",
    "NO_OWNER_SIGNOFF_WITHOUT_DEPARTMENT_OWNER_EVIDENCE_REVIEW",
    "NO_PRODUCTION_GO_NO_DEPLOY",
  ];

  const sourceTokens = [
    "TaskCenterAdapterDryRunOwnerSignoffEvidenceMatrixReviewItem",
    "adapterDryRunOwnerSignoffEvidenceMatrixReviewItems",
    "adapterDryRunOwnerSignoffEvidenceMatrixReview",
    "OWNER_SIGNOFF_EVIDENCE_MATRIX_REVIEW_READY: PASS_LOCAL_MATRIX_ONLY",
    "TASK_CENTER_DATABASE_READY: NO_GO_OWNER_SIGNOFF_EVIDENCE_MATRIX_REVIEW_ONLY",
    ...matrixRows,
    ...matrixEvidenceTokens,
  ];

  requireTokens(
    panelSource,
    [...boundaryTokens, ...sourceTokens],
    "owner signoff evidence matrix review source token",
    panelSourcePath,
  );

  requireTokens(
    component,
    [
      ...boundaryTokens,
      "ownerSignoffEvidenceMatrixReviewCodes",
      "data-heu-task-center-adapter-dry-run-owner-signoff-evidence-matrix-review",
      "data-heu-task-center-adapter-dry-run-owner-signoff-evidence-matrix-review-readonly",
      "data-heu-task-center-adapter-dry-run-owner-signoff-evidence-matrix-review-draft-only",
      "data-heu-task-center-adapter-dry-run-owner-signoff-evidence-matrix-review-no-approval",
      "data-heu-task-center-adapter-dry-run-owner-signoff-evidence-matrix-review-no-database-read",
      "data-heu-task-center-adapter-dry-run-owner-signoff-evidence-matrix-review-no-database-client",
      "data-heu-task-center-adapter-dry-run-owner-signoff-evidence-matrix-review-no-env-enablement",
      "data-heu-task-center-adapter-dry-run-owner-signoff-evidence-matrix-review-no-file-write",
      "data-heu-task-center-adapter-dry-run-owner-signoff-evidence-matrix-review-no-task-mutation",
      "data-heu-task-center-adapter-dry-run-owner-signoff-evidence-matrix-review-no-real-data",
      "data-heu-task-center-adapter-dry-run-owner-signoff-evidence-matrix-review-no-ai-or-automation",
      "data-heu-task-center-adapter-dry-run-owner-signoff-evidence-matrix-review-codes",
      "data-heu-task-center-adapter-dry-run-owner-signoff-evidence-matrix-review-item",
      "data-heu-task-center-adapter-dry-run-owner-signoff-evidence-matrix-review-owner-lane",
      "data-heu-task-center-adapter-dry-run-owner-signoff-evidence-matrix-review-reviewer",
      "data-heu-task-center-adapter-dry-run-owner-signoff-evidence-matrix-review-signoff-state",
      "data-heu-task-center-adapter-dry-run-owner-signoff-evidence-matrix-review-evidence-artifact",
      "data-heu-task-center-adapter-dry-run-owner-signoff-evidence-matrix-review-evidence-storage-rule",
      "data-heu-task-center-adapter-dry-run-owner-signoff-evidence-matrix-review-stop-rule",
      "HEU-Data-036 - Owner signoff evidence matrix review",
      "Matrix review-only cho bang chung signoff",
      "gateEvidence.adapterDryRunOwnerSignoffEvidenceMatrixReview.items.map",
      "gateEvidence.adapterDryRunOwnerSignoffEvidenceMatrixReview.result",
      ...matrixRows,
    ],
    "component owner signoff evidence matrix review token",
    componentPath,
  );

  requireTokens(
    doc,
    [
      "HEU-DATA-036-TASK-CENTER-ADAPTER-DRY-RUN-OWNER-SIGNOFF-EVIDENCE-MATRIX-REVIEW",
      "Status: PASS_LOCAL_MATRIX_ONLY",
      "Production status: NO-GO",
      "Runtime status: OWNER_SIGNOFF_EVIDENCE_MATRIX_REVIEW_READY: PASS_LOCAL_MATRIX_ONLY",
      "Database status: TASK_CENTER_DATABASE_READY: NO_GO_OWNER_SIGNOFF_EVIDENCE_MATRIX_REVIEW_ONLY",
      ...boundaryTokens,
      ...matrixRows,
      ...matrixEvidenceTokens,
      checkerAlias,
      "HEU-DATA-037-TASK-CENTER-ADAPTER-DRY-RUN-OWNER-DECISION-QUEUE-REVIEW",
    ],
    "owner signoff evidence matrix review doc token",
    docPath,
  );

  requireTokens(
    priorDoc,
    [
      "HEU-DATA-036-TASK-CENTER-ADAPTER-DRY-RUN-OWNER-SIGNOFF-EVIDENCE-MATRIX-REVIEW",
      checkerAlias,
      "OWNER_SIGNOFF_EVIDENCE_MATRIX_REVIEW_READY: PASS_LOCAL_MATRIX_ONLY",
      "TASK_CENTER_DATABASE_READY: NO_GO_OWNER_SIGNOFF_EVIDENCE_MATRIX_REVIEW_ONLY",
    ],
    "prior DB read GO/NO-GO precheck next-slice token",
    priorDocPath,
  );

  requireTokens(
    manifest,
    [
      docPath,
      checkerPath,
      "node --check scripts/check-heu-task-center-adapter-dry-run-owner-signoff-evidence-matrix-review.mjs",
      "npm.cmd run check:heu-task-center-adapter-dry-run-owner-signoff-evidence-matrix-review",
    ],
    "manifest owner signoff evidence matrix review token",
    manifestPath,
  );

  requireTokens(
    priorChecker,
    [
      "HEU-DATA-036-TASK-CENTER-ADAPTER-DRY-RUN-OWNER-SIGNOFF-EVIDENCE-MATRIX-REVIEW",
      checkerAlias,
      "OWNER_SIGNOFF_EVIDENCE_MATRIX_REVIEW_READY: PASS_LOCAL_MATRIX_ONLY",
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
      "HEU_TASK_CENTER_ADAPTER_DRY_RUN_OWNER_SIGNOFF_EVIDENCE_MATRIX_REVIEW_READY: PASS_LOCAL",
      "TASK_CENTER_DATABASE_READY: NO_GO_OWNER_SIGNOFF_EVIDENCE_MATRIX_REVIEW_ONLY",
      "NO_RUNTIME_MUTATION: task center adapter dry-run owner signoff evidence matrix review checker only; no owner approval, official signoff, database client, database read, env enablement, file output write, table creation, SQL migration, task write, file upload, storage write, real-data fixture, AI call, paid automation, deploy, finance action or production GO",
    ],
    "checker-script read-only token",
    checkerPath,
  );

  const matrixRowMatches =
    panelSource.match(/code:\s*"OWNER_SIGNOFF_EVIDENCE_MATRIX_[A-Z_]+"/g) ?? [];
  if (matrixRowMatches.length !== 5) {
    fail(
      `${panelSourcePath}: expected exactly 5 owner signoff evidence matrix rows, found ${matrixRowMatches.length}`,
    );
  }

  const reviewNoGoMatches =
    panelSource.match(/signoffState:\s*"SIGNOFF_EVIDENCE_REVIEW_REQUIRED_NO_GO",/g) ?? [];
  if (reviewNoGoMatches.length !== 5) {
    fail(
      `${panelSourcePath}: expected exactly 5 SIGNOFF_EVIDENCE_REVIEW_REQUIRED_NO_GO assignments, found ${reviewNoGoMatches.length}`,
    );
  }

  const storageRuleMatches =
    panelSource.match(/evidenceStorageRule:\s*"CONTROLLED_EVIDENCE_OUTSIDE_GIT_OR_CHAT",/g) ?? [];
  if (storageRuleMatches.length !== 5) {
    fail(
      `${panelSourcePath}: expected exactly 5 controlled-evidence storage rules, found ${storageRuleMatches.length}`,
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
    "task-center adapter dry-run owner signoff evidence matrix review scope",
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
    "HEU Task Center adapter dry-run owner signoff evidence matrix review failed:",
  );
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("HEU Task Center adapter dry-run owner signoff evidence matrix review");
console.log(
  "HEU_TASK_CENTER_ADAPTER_DRY_RUN_OWNER_SIGNOFF_EVIDENCE_MATRIX_REVIEW_READY: PASS_LOCAL",
);
console.log(
  "TASK_CENTER_DATABASE_READY: NO_GO_OWNER_SIGNOFF_EVIDENCE_MATRIX_REVIEW_ONLY",
);
console.log(
  "NO_RUNTIME_MUTATION: task center adapter dry-run owner signoff evidence matrix review checker only; no owner approval, official signoff, database client, database read, env enablement, file output write, table creation, SQL migration, task write, file upload, storage write, real-data fixture, AI call, paid automation, deploy, finance action or production GO",
);
