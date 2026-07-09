import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const failures = [];

const cutoverGatePath = "docs/HEU_USER_PERMISSION_OPERATION_CUTOVER_GATE_20260703.md";
const cutoverPanelPath = "components/settings/user-operation-cutover-panel.tsx";
const pilot001Path =
  "docs/HEU_CONTROL/HEU_USER_PILOT_001_REAL_USER_UAT_REGISTER_20260709.md";
const day1RunbookPath =
  "docs/HEU_CONTROL/HEU_USER_PILOT_002_IDENTITY_SCOPE_DAY1_RUNBOOK_20260709.md";
const precheckLedgerPath =
  "docs/HEU_CONTROL/HEU_USER_PILOT_003_IDENTITY_SCOPE_PRECHECK_LEDGER_20260709.md";
const activationWorksheetPath =
  "docs/HEU_CONTROL/HEU_USER_PILOT_006_USER_ACTIVATION_WORKSHEET_READINESS_20260709.md";
const checkerPath = "scripts/check-heu-user-operation-cutover-readiness.mjs";
const packagePath = "package.json";
const checkerAlias = "check:heu-user-operation-cutover-readiness";
const checkerCommand = `node ${checkerPath}`;
const activationWorksheetAlias = "check:heu-user-activation-worksheet-readiness";
const activationWorksheetCommand =
  "node scripts/check-heu-user-activation-worksheet-readiness.mjs";

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
  cutoverGatePath,
  cutoverPanelPath,
  pilot001Path,
  day1RunbookPath,
  precheckLedgerPath,
  activationWorksheetPath,
  checkerPath,
  packagePath,
]) {
  requireFile(file);
}

if (failures.length === 0) {
  const cutoverGate = read(cutoverGatePath);
  const cutoverPanel = read(cutoverPanelPath);
  const pilot001 = read(pilot001Path);
  const day1Runbook = read(day1RunbookPath);
  const precheckLedger = read(precheckLedgerPath);
  const activationWorksheet = read(activationWorksheetPath);
  const checkerScript = read(checkerPath);
  const packageJson = JSON.parse(read(packagePath));

  requireTokens(
    cutoverGate,
    [
      "HEU User Permission Operation Cutover Gate",
      "Status: PASS_LOCAL_GATE",
      "Current cutover decision: NO_GO",
      "USER_PERMISSION_OPERATION_CUTOVER_READY / NO_GO / BLOCKED",
      "CUTOVER-OWNER-SEATS-01",
      "CUTOVER-AUTH-LINK-02",
      "CUTOVER-SCOPE-BASELINE-03",
      "CUTOVER-NEGATIVE-04",
      "CUTOVER-P6-UAT-05",
      "CUTOVER-OWNER-GO-06",
      "P6_04_SIGNED_UAT_REFERENCE: PENDING_OWNER_UPLOAD",
      "ACCESS_CLOSURE_REFERENCE: PENDING_OWNER_UPLOAD",
      "NEGATIVE_CONTROL_BROWSER_PROOF_REFERENCE: PENDING_OWNER_UPLOAD",
      "OWNER_CUTOVER_DECISION_REFERENCE: PENDING_OWNER_SIGNOFF",
      "npm.cmd run check:heu-user-operation-cutover-readiness",
      "npm.cmd run check:heu-user-activation-worksheet-readiness",
      "It is expected to return `NO_GO` until the owner-approved users",
      "approve owner GO/NO-GO or mark production GO",
    ],
    "cutover gate token",
    cutoverGatePath,
  );

  requireTokens(
    cutoverPanel,
    [
      'data-heu-user-operation-cutover-panel="P0-17_USER_OPERATION_CUTOVER_GATE"',
      'data-heu-user-operation-cutover-status="USER_PERMISSION_OPERATION_CUTOVER_READY_NO_GO_BLOCKED"',
      "USER-CUTOVER-REQUIRED-POSITIONS",
      "USER-CUTOVER-TTGDTX-NEGATIVE-CONTROL",
      "USER-CUTOVER-EXTERNAL-EVIDENCE",
      "USER-CUTOVER-SCOPE-BASELINE",
      "USER-CUTOVER-AUTH-LINK",
      "Current cutover decision: NO_GO",
      "This panel does not create accounts",
      "send reset/invite links",
      "approve owner GO/NO-GO or mark production GO",
    ],
    "cutover panel token",
    cutoverPanelPath,
  );

  requireTokens(
    pilot001,
    [
      "HEU-USER-PILOT-001-REAL-USER-UAT-REGISTER",
      "docs/HEU_USER_PERMISSION_OPERATION_CUTOVER_GATE_20260703.md",
      "npm.cmd run check:heu-user-operation-cutover-readiness",
      "NO_GO remains valid until owner-approved users",
    ],
    "pilot dependency token",
    pilot001Path,
  );

  requireTokens(
    day1Runbook,
    [
      "HEU-USER-PILOT-002-IDENTITY-SCOPE-DAY1-RUNBOOK",
      "User cutover gate",
      "docs/HEU_USER_PERMISSION_OPERATION_CUTOVER_GATE_20260703.md",
      "DAY1-EXIT-10",
      "Codex does not infer approval",
    ],
    "Day-1 dependency token",
    day1RunbookPath,
  );

  requireTokens(
    precheckLedger,
    [
      "HEU-USER-PILOT-003-IDENTITY-SCOPE-PRECHECK-LEDGER",
      "check:heu-user-operation-cutover-readiness",
      "check:heu-user-activation-worksheet-readiness",
      "PASS_LOCAL_CHECKER_WIRED",
      "PASS_LOCAL_WORKSHEET",
      "Day-1 real-user pilot | NO_GO",
      "HEU-USER-PILOT-005-OPERATION-CUTOVER-READINESS-CHECKER",
      "HEU-USER-PILOT-006-USER-ACTIVATION-WORKSHEET-READINESS",
      "Production status: NO-GO",
    ],
    "precheck ledger token",
    precheckLedgerPath,
  );

  requireTokens(
    activationWorksheet,
    [
      "HEU-USER-PILOT-006-USER-ACTIVATION-WORKSHEET-READINESS",
      "Status: PASS_LOCAL_WORKSHEET",
      "Production status: NO-GO",
      "PILOT-NEG-01",
      "ACTIVATION-OWNER-06",
      "NO_GO_OWNER_SIGNOFF",
      "AI/Codex must not",
      "Create/invite users.",
      "Grant role, department, workspace or business scope.",
    ],
    "activation worksheet token",
    activationWorksheetPath,
  );

  if (packageJson.scripts?.[checkerAlias] !== checkerCommand) {
    fail(`${packagePath}: missing or mismatched ${checkerAlias}`);
  }

  if (packageJson.scripts?.[activationWorksheetAlias] !== activationWorksheetCommand) {
    fail(`${packagePath}: missing or mismatched ${activationWorksheetAlias}`);
  }

  requireTokens(
    checkerScript,
    [
      "existsSync",
      "readFileSync",
      "HEU_USER_OPERATION_CUTOVER_CHECKER_READY: PASS_LOCAL",
      "USER_PERMISSION_OPERATION_CUTOVER_READY: NO_GO_EXTERNAL_OWNER_BLOCKERS",
      "NO_RUNTIME_CHANGE: user operation cutover checker only; no account creation, scope grant, password handling, migration, deploy, paid automation, finance action or production GO",
    ],
    "checker-script read-only token",
    checkerPath,
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
  console.error("HEU user operation cutover readiness check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("HEU user operation cutover readiness check");
console.log("HEU_USER_OPERATION_CUTOVER_CHECKER_READY: PASS_LOCAL");
console.log("USER_PERMISSION_OPERATION_CUTOVER_READY: NO_GO_EXTERNAL_OWNER_BLOCKERS");
console.log(
  "NO_RUNTIME_CHANGE: user operation cutover checker only; no account creation, scope grant, password handling, migration, deploy, paid automation, finance action or production GO",
);
