import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const failures = [];

const ledgerPath =
  "docs/HEU_CONTROL/HEU_USER_PILOT_003_IDENTITY_SCOPE_PRECHECK_LEDGER_20260709.md";
const day1RunbookPath =
  "docs/HEU_CONTROL/HEU_USER_PILOT_002_IDENTITY_SCOPE_DAY1_RUNBOOK_20260709.md";
const checkerPath =
  "scripts/check-heu-user-pilot-identity-scope-precheck-ledger-readiness.mjs";
const packagePath = "package.json";
const checkerAlias =
  "check:heu-user-pilot-identity-scope-precheck-ledger-readiness";
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

for (const file of [ledgerPath, day1RunbookPath, checkerPath, packagePath]) {
  requireFile(file);
}

if (failures.length === 0) {
  const ledger = read(ledgerPath);
  const day1Runbook = read(day1RunbookPath);
  const checkerScript = read(checkerPath);
  const packageJson = JSON.parse(read(packagePath));

  requireTokens(
    ledger,
    [
      "HEU-USER-PILOT-003-IDENTITY-SCOPE-PRECHECK-LEDGER",
      "Production status: NO-GO",
      "Local ignored `node_modules` junction only",
      "Install command | Not run",
      "Migration/deploy | Not run",
      "check:heu-user-pilot-identity-scope-day1-readiness",
      "check:heu-app-shell-draft-pr-readiness",
      "audit:heu-user-account-security",
      "audit:heu-role-scope-uat-pack",
      "audit:ttgdtx-role-scope-access",
      "check:heu-user-create-readiness",
      "check:heu-permission-scope-readiness",
      "check:heu-user-scope-baseline-repair-queue -- --static-only",
      "check:heu-user-operation-cutover-readiness",
      "PASS_LOCAL_CHECKER_WIRED",
      "check:heu-user-activation-worksheet-readiness",
      "PASS_LOCAL_WORKSHEET",
      "check:heu-user-pilot-secure-env-handoff-readiness",
      "PASS_LOCAL_HANDOFF",
      "check:heu-user-pilot-live-check-result-ledger-readiness",
      "PASS_LOCAL_LEDGER",
      "check:heu-user-pilot-stacked-pr-review-packet-readiness",
      "PASS_LOCAL_REVIEW_PACKET",
      "USER-CREATE-ENV",
      "PERMISSION-SCOPE-ENV",
      "USER-SCOPE-REPAIR-APP-GUARD",
      "USER-STACKED-PR-REVIEW-PACKET",
      "ui-owner-approval-ack-ok",
      "ui-controlled-evidence-id-ok",
      "server-owner-approval-guard-ok",
      "server-controlled-evidence-id-guard-ok",
      "Day-1 real-user pilot | NO_GO",
      "HEU-USER-PILOT-004-SCOPE-SAVE-GUARD-MINIMAL-FIX",
      "No account creation.",
      "No Supabase Auth Admin call.",
      "No migration.",
      "No production scope grant.",
      "HEU-USER-PILOT-005-OPERATION-CUTOVER-READINESS-CHECKER",
      "HEU-USER-PILOT-006-USER-ACTIVATION-WORKSHEET-READINESS",
      "HEU-USER-PILOT-007-SECURE-ENV-HANDOFF",
      "HEU-USER-PILOT-008-LIVE-CHECK-RESULT-LEDGER",
      "HEU-USER-PILOT-009-STACKED-PR-REVIEW-PACKET",
      "Review PR #15 through PR #19 with IT_DATA + Audit",
      "SOP-RESULT",
      "CAN_SUA",
    ],
    "precheck ledger token",
    ledgerPath,
  );

  requireTokens(
    day1Runbook,
    [
      "HEU-USER-PILOT-002-IDENTITY-SCOPE-DAY1-RUNBOOK",
      "DAY1-EXIT-01",
      "Codex may draft the checklist and verify control tokens. Codex must not create",
      "Production status: NO-GO",
    ],
    "Day-1 runbook dependency token",
    day1RunbookPath,
  );

  if (packageJson.scripts?.[checkerAlias] !== checkerCommand) {
    fail(`${packagePath}: missing or mismatched ${checkerAlias}`);
  }

  requireTokens(
    checkerScript,
    [
      "existsSync",
      "readFileSync",
      "HEU_USER_PILOT_IDENTITY_SCOPE_PRECHECK_LEDGER_READY: PASS_LOCAL",
      "NO_RUNTIME_CHANGE: docs/control precheck ledger checker only; no account creation, scope grant, password handling, migration, deploy, paid automation, finance action or production GO",
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
  console.error("HEU User Pilot identity/scope precheck ledger failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("HEU User Pilot identity/scope precheck ledger readiness check");
console.log("HEU_USER_PILOT_IDENTITY_SCOPE_PRECHECK_LEDGER_READY: PASS_LOCAL");
console.log(
  "NO_RUNTIME_CHANGE: docs/control precheck ledger checker only; no account creation, scope grant, password handling, migration, deploy, paid automation, finance action or production GO",
);
