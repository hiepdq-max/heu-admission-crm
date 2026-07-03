import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const dailyControlPath = "docs/HEU_IT_DATA_DAILY_CONTROL_CHECK_20260703.md";
const inventoryPath = "docs/HEU_CURRENT_STATE_INVENTORY.md";
const backlogPath = "docs/HEU_SYSTEM_BUILD_BACKLOG.md";
const gapMatrixPath = "docs/HEU_MODULE_READINESS_GAP_MATRIX_20260628_V01_DRAFT.md";
const step114Path = "database/step114_organization_position_permission_matrix.sql";
const statuses = [];

function addStatus(code, status, detail) {
  statuses.push({ code, status, detail });
}

function read(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), "utf8");
}

function fileExists(relativePath) {
  return existsSync(path.join(repoRoot, relativePath));
}

function missingTokens(contents, tokens) {
  return tokens.filter((token) => !contents.includes(token));
}

function requireFiles() {
  const requiredFiles = [
    dailyControlPath,
    inventoryPath,
    backlogPath,
    gapMatrixPath,
    step114Path,
    "package.json",
  ];
  const missingFiles = requiredFiles.filter((file) => !fileExists(file));

  addStatus(
    "IT-DATA-DAILY-FILES",
    missingFiles.length === 0 ? "READY" : "NO_GO",
    missingFiles.length === 0
      ? "Daily control doc and required source docs are present."
      : `Missing required files: ${missingFiles.join(", ")}.`,
  );

  return missingFiles.length === 0;
}

function checkDailyControlDoc() {
  const dailyControl = read(dailyControlPath);
  const missing = missingTokens(dailyControl, [
    "HEU IT/Data Daily Control Check - 2026-07-03",
    "Status: PASS_LOCAL_CONTROL",
    "IT_DATA_DAILY_CONTROL_READY / NO_GO / BLOCKED",
    "Current production decision: NO_GO",
    "IT-DAILY-01-WORKTREE",
    "IT-DAILY-02-ROLE-SCOPE",
    "IT-DAILY-03-EVIDENCE-PRIVACY",
    "IT-DAILY-04-AUDIT-RISK",
    "IT-DAILY-05-QUICK-SCOPE",
    "IT-DAILY-06-RUNTIME",
    "IT-DAILY-07-OWNER-BLOCKERS",
    "npm.cmd run audit:heu-current-state-inventory",
    "npm.cmd run audit:heu-user-account-security",
    "npm.cmd run audit:heu-role-scope-uat-pack",
    "npm.cmd run audit:heu-controlled-evidence-redaction-pack",
    "npm.cmd run audit:ttgdtx-audit-trail-guard",
    "npm.cmd run audit:hard-delete-conversion-decision-queue",
    "npm.cmd run audit:ttgdtx-release-gates",
    "HEU_FAST_LOOP_WORKTREE",
    "HEU_FAST_LOOP_WORKTREE_AREAS",
    "HEU_FAST_LOOP_AREA_SAMPLE",
    "HEU_FAST_LOOP_NEXT_GUARDS",
    "HEU_FAST_LOOP_RUNTIME_PREFLIGHT",
    "HEU_FAST_LOOP_WORKTREE_SCOPE",
    "`app`, `components`, `docs`, `scripts`, `database` and `other`",
    "up to three changed",
    ".next/lock",
    "active Next dev/build process",
    "node --check",
    "npx.cmd eslint",
    "audit:ttgdtx-migration-order-guard",
    "audit:heu-sql-object-master-map",
    "--security",
    "--strict-worktree",
    "DIRTY_WARN_ONLY",
    "does not create accounts",
    "execute UAT",
    "approve finance reliance",
    "mark production GO",
  ]);

  addStatus(
    "IT-DATA-DAILY-DOC",
    missing.length === 0 ? "READY" : "NO_GO",
    missing.length === 0
      ? "Daily control doc contains decision lane, seven control lanes, command ladder and PASS_LOCAL boundary."
      : `Daily control doc missing tokens: ${missing.length}.`,
  );
}

function checkPackageScript() {
  const packageJson = JSON.parse(read("package.json"));
  const expected =
    "node scripts/check-heu-it-data-daily-control.mjs";

  addStatus(
    "IT-DATA-DAILY-PACKAGE",
    packageJson.scripts?.["check:heu-it-data-daily-control"] === expected
      ? "READY"
      : "NO_GO",
      packageJson.scripts?.["check:heu-it-data-daily-control"] === expected
        ? "Package exposes check:heu-it-data-daily-control."
        : "Package is missing check:heu-it-data-daily-control or points to the wrong script.",
  );

  const fastLoopExpected = "node scripts/check-heu-fast-local-loop.mjs";

  addStatus(
    "IT-DATA-FAST-LOOP-PACKAGE",
    packageJson.scripts?.["check:heu-fast-local-loop"] === fastLoopExpected
      ? "READY"
      : "NO_GO",
    packageJson.scripts?.["check:heu-fast-local-loop"] === fastLoopExpected
      ? "Package exposes check:heu-fast-local-loop for fast PASS_LOCAL checks."
      : "Package is missing check:heu-fast-local-loop or points to the wrong script.",
  );
}

function checkNoGoBoundary() {
  const inventory = read(inventoryPath);
  const gapMatrix = read(gapMatrixPath);
  const missing = [
    inventory.includes("Conclusion: Stage D - internal controlled test only. Production remains NO-GO")
      ? null
      : "inventory-stage-d-no-go",
    gapMatrix.includes("Production status: NO-GO")
      ? null
      : "gap-matrix-production-no-go",
  ].filter(Boolean);

  addStatus(
    "IT-DATA-DAILY-NO-GO-BOUNDARY",
    missing.length === 0 ? "READY" : "NO_GO",
    missing.length === 0
      ? "Stage D and production NO-GO remain explicit."
      : `NO-GO boundary missing tokens: ${missing.join(", ")}.`,
  );
}

function checkItDataControlLinks() {
  const backlog = read(backlogPath);
  const step114 = read(step114Path);
  const missing = [
    backlog.includes("P0-17") && backlog.includes("User account temporary password security")
      ? null
      : "backlog-p0-17",
    backlog.includes("P6-04") && backlog.includes("Role-scope UAT")
      ? null
      : "backlog-p6-04",
    backlog.includes("P6-03") && backlog.includes("TTGDTX audit-log coverage")
      ? null
      : "backlog-p6-03",
    backlog.includes("P6-06") && backlog.includes("Non-TTGDTX/base cascade review")
      ? null
      : "backlog-p6-06",
    step114.includes("IT_DATA") && step114.includes("IT/Data")
      ? null
      : "step114-it-data",
    step114.includes("IT_DATA_HEAD") && step114.includes("permission_matrix.manage")
      ? null
      : "step114-manage-permission",
  ].filter(Boolean);

  addStatus(
    "IT-DATA-DAILY-CONTROL-LINKS",
    missing.length === 0 ? "READY" : "NO_GO",
    missing.length === 0
      ? "IT/Data role, permission matrix, role-scope, audit-log and cascade control links are present."
      : `IT/Data control links missing: ${missing.join(", ")}.`,
  );
}

function addReadOnlyBoundary() {
  addStatus(
    "IT-DATA-DAILY-READ-ONLY",
    "READY",
    "This checker is static/read-only; it does not call Supabase, create accounts, assign users, set passwords, send email, accept evidence, approve UAT, approve finance reliance or mark production GO.",
  );
}

console.log("HEU IT/Data daily control check");
console.log("Secrets, raw PII, bank data, vouchers and evidence files are never printed by this script.");

try {
  if (requireFiles()) {
    checkDailyControlDoc();
    checkPackageScript();
    checkNoGoBoundary();
    checkItDataControlLinks();
  }
  addReadOnlyBoundary();
} catch {
  addStatus(
    "IT-DATA-DAILY-CHECK",
    "NO_GO",
    "Daily control check could not complete. Raw errors are not printed.",
  );
}

for (const item of statuses) {
  console.log(`${item.code}: ${item.status} - ${item.detail}`);
}

const failing = statuses.filter((item) => item.status !== "READY");

if (failing.length > 0) {
  console.error(`IT_DATA_DAILY_CONTROL_READY: NO_GO (${failing.length} failing control lane(s))`);
  process.exit(1);
}

console.log("IT_DATA_DAILY_CONTROL_READY: PASS_LOCAL_CONTROL");
