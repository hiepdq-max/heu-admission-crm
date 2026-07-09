import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const failures = [];

const worksheetPath =
  "docs/HEU_CONTROL/HEU_USER_PILOT_006_USER_ACTIVATION_WORKSHEET_READINESS_20260709.md";
const pilot001Path =
  "docs/HEU_CONTROL/HEU_USER_PILOT_001_REAL_USER_UAT_REGISTER_20260709.md";
const day1RunbookPath =
  "docs/HEU_CONTROL/HEU_USER_PILOT_002_IDENTITY_SCOPE_DAY1_RUNBOOK_20260709.md";
const precheckLedgerPath =
  "docs/HEU_CONTROL/HEU_USER_PILOT_003_IDENTITY_SCOPE_PRECHECK_LEDGER_20260709.md";
const secureEnvHandoffPath =
  "docs/HEU_CONTROL/HEU_USER_PILOT_007_SECURE_ENV_HANDOFF_20260709.md";
const cutoverGatePath = "docs/HEU_USER_PERMISSION_OPERATION_CUTOVER_GATE_20260703.md";
const cutoverCheckerPath = "scripts/check-heu-user-operation-cutover-readiness.mjs";
const checkerPath = "scripts/check-heu-user-activation-worksheet-readiness.mjs";
const packagePath = "package.json";
const checkerAlias = "check:heu-user-activation-worksheet-readiness";
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
  worksheetPath,
  pilot001Path,
  day1RunbookPath,
  precheckLedgerPath,
  secureEnvHandoffPath,
  cutoverGatePath,
  cutoverCheckerPath,
  checkerPath,
  packagePath,
]) {
  requireFile(file);
}

if (failures.length === 0) {
  const worksheet = read(worksheetPath);
  const pilot001 = read(pilot001Path);
  const day1Runbook = read(day1RunbookPath);
  const precheckLedger = read(precheckLedgerPath);
  const secureEnvHandoff = read(secureEnvHandoffPath);
  const cutoverGate = read(cutoverGatePath);
  const cutoverChecker = read(cutoverCheckerPath);
  const checkerScript = read(checkerPath);
  const packageJson = JSON.parse(read(packagePath));

  requireTokens(
    worksheet,
    [
      "HEU-USER-PILOT-006-USER-ACTIVATION-WORKSHEET-READINESS",
      "Status: PASS_LOCAL_WORKSHEET",
      "Production status: NO-GO",
      "This worksheet is a control artifact only.",
      "Do not paste any of the following into this worksheet, Git, Codex or chat",
      "Password, temporary password, OTP, password reset link or account",
      "activation/invite link",
      "Use only safe seat labels, role codes, route labels, owner lanes and controlled",
      "PILOT-BGH-01",
      "PILOT-ITDATA-01",
      "PILOT-AUDIT-01",
      "PILOT-PHAPCHE-01",
      "PILOT-TS-01",
      "PILOT-CTHSSV-01",
      "PILOT-DAO-01",
      "PILOT-KHOA-01",
      "PILOT-KHTC-01",
      "PILOT-NEG-01",
      "ACTIVATION-WORKSHEET-01",
      "ACTIVATION-AUTH-02",
      "ACTIVATION-SCOPE-03",
      "ACTIVATION-NEGATIVE-04",
      "ACTIVATION-CUTOVER-05",
      "ACTIVATION-OWNER-06",
      "NO_GO_EXTERNAL_ENV",
      "NO_GO_EXTERNAL_OWNER",
      "NO_GO_EXTERNAL_EVIDENCE",
      "NO_GO_OWNER_SIGNOFF",
      "npm.cmd run check:heu-user-activation-worksheet-readiness",
      "AI/Codex must not",
      "Create/invite users.",
      "Grant role, department, workspace or business scope.",
      "SOP-RESULT",
      "`NO_GO` for real user activation.",
      "CAN_SUA",
    ],
    "worksheet token",
    worksheetPath,
  );

  requireTokens(
    pilot001,
    [
      "HEU-USER-PILOT-001-REAL-USER-UAT-REGISTER",
      "PILOT-BGH-01",
      "PILOT-NEG-01",
      "USER-PILOT-AUTH-01",
      "No raw PII, bank data, password, token, reset link or evidence file enters Git/Codex/chat",
      "npm.cmd run check:heu-user-activation-worksheet-readiness",
    ],
    "pilot register token",
    pilot001Path,
  );

  requireTokens(
    day1Runbook,
    [
      "HEU-USER-PILOT-002-IDENTITY-SCOPE-DAY1-RUNBOOK",
      "DAY1-EXIT-01",
      "DAY1-EXIT-10",
      "Codex may draft the checklist and verify control tokens. Codex must not create",
      "Production status: NO-GO",
    ],
    "Day-1 runbook token",
    day1RunbookPath,
  );

  requireTokens(
    precheckLedger,
    [
      "HEU-USER-PILOT-003-IDENTITY-SCOPE-PRECHECK-LEDGER",
      "HEU-USER-PILOT-006-USER-ACTIVATION-WORKSHEET-READINESS",
      "HEU-USER-PILOT-007-SECURE-ENV-HANDOFF",
      "check:heu-user-activation-worksheet-readiness",
      "check:heu-user-pilot-secure-env-handoff-readiness",
      "PASS_LOCAL_WORKSHEET",
      "PASS_LOCAL_HANDOFF",
      "Day-1 real-user pilot | NO_GO",
    ],
    "precheck ledger token",
    precheckLedgerPath,
  );

  requireTokens(
    secureEnvHandoff,
    [
      "HEU-USER-PILOT-007-SECURE-ENV-HANDOFF",
      "Status: PASS_LOCAL_HANDOFF",
      "Production status: NO-GO",
      "NO_GO USER-CREATE-ENV",
      "NO_GO PERMISSION-SCOPE-ENV",
      "Do not write the values in this document.",
      "Ask the user to paste secrets.",
      "Read, print, summarize or store secret values.",
    ],
    "secure env handoff dependency token",
    secureEnvHandoffPath,
  );

  requireTokens(
    cutoverGate,
    [
      "HEU User Permission Operation Cutover Gate",
      "npm.cmd run check:heu-user-activation-worksheet-readiness",
      "This gate does not create accounts",
      "set passwords, send reset/invite links",
      "Current cutover decision: NO_GO",
    ],
    "cutover gate token",
    cutoverGatePath,
  );

  requireTokens(
    cutoverChecker,
    [
      "check:heu-user-activation-worksheet-readiness",
      "HEU-USER-PILOT-006-USER-ACTIVATION-WORKSHEET-READINESS",
      "USER_PERMISSION_OPERATION_CUTOVER_READY: NO_GO_EXTERNAL_OWNER_BLOCKERS",
    ],
    "cutover checker dependency token",
    cutoverCheckerPath,
  );

  if (packageJson.scripts?.[checkerAlias] !== checkerCommand) {
    fail(`${packagePath}: missing or mismatched ${checkerAlias}`);
  }

  requireTokens(
    checkerScript,
    [
      "existsSync",
      "readFileSync",
      "HEU_USER_ACTIVATION_WORKSHEET_READY: PASS_LOCAL",
      "USER_ACTIVATION_READY: NO_GO_EXTERNAL_OWNER_AND_ENV_BLOCKERS",
      "NO_RUNTIME_CHANGE: user activation worksheet checker only; no account creation, scope grant, password handling, migration, deploy, paid automation, finance action or production GO",
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
  console.error("HEU user activation worksheet readiness check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("HEU user activation worksheet readiness check");
console.log("HEU_USER_ACTIVATION_WORKSHEET_READY: PASS_LOCAL");
console.log("USER_ACTIVATION_READY: NO_GO_EXTERNAL_OWNER_AND_ENV_BLOCKERS");
console.log(
  "NO_RUNTIME_CHANGE: user activation worksheet checker only; no account creation, scope grant, password handling, migration, deploy, paid automation, finance action or production GO",
);
