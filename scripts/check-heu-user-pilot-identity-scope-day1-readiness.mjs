import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const failures = [];

const runbookPath =
  "docs/HEU_CONTROL/HEU_USER_PILOT_002_IDENTITY_SCOPE_DAY1_RUNBOOK_20260709.md";
const pilot001Path =
  "docs/HEU_CONTROL/HEU_USER_PILOT_001_REAL_USER_UAT_REGISTER_20260709.md";
const appShellDecisionPath =
  "docs/HEU_CONTROL/HEU_APP_SHELL_001_MODULAR_MONOLITH_DECISION_20260709.md";
const checkerPath =
  "scripts/check-heu-user-pilot-identity-scope-day1-readiness.mjs";
const packagePath = "package.json";
const checkerAlias = "check:heu-user-pilot-identity-scope-day1-readiness";
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
  runbookPath,
  pilot001Path,
  appShellDecisionPath,
  checkerPath,
  packagePath,
]) {
  requireFile(file);
}

if (failures.length === 0) {
  const runbook = read(runbookPath);
  const pilot001 = read(pilot001Path);
  const appShellDecision = read(appShellDecisionPath);
  const checkerScript = read(checkerPath);
  const packageJson = JSON.parse(read(packagePath));

  requireTokens(
    runbook,
    [
      "HEU-USER-PILOT-002-IDENTITY-SCOPE-DAY1-RUNBOOK",
      "Production status: NO-GO",
      "docs/control runbook and read-only checker only",
      "8-12 pilot users can be prepared for controlled login",
      "Every pilot user has role, department, workspace and business scope",
      "No password, reset link, invite link, secret or raw evidence enters Git/Codex/chat",
      "BLOCKED_SOURCE_MISSING",
      "Batch A - Control",
      "Batch B - Department",
      "Batch C - Finance",
      "Batch D - Negative",
      "ID-DAY1-01",
      "ID-DAY1-06",
      "Codex may draft the checklist and verify control tokens. Codex must not create",
      "or invite real users, set passwords, grant scope or send credentials.",
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
      "DAY1-EXIT-01",
      "DAY1-EXIT-10",
      "DAT_TAM_THOI_CONTROLLED_PILOT",
      "AI must not",
      "call budget",
      "kill switch",
      "REVOKE_OR_REDUCE",
      "npm.cmd run check:heu-user-pilot-identity-scope-day1-readiness",
      "Do not run migration, deploy, `npm install`, `npm ci`, Supabase push or paid",
      "SOP-SCOPE",
      "SOP-RESULT",
      "CAN_SUA",
    ],
    "Day-1 identity/scope runbook token",
    runbookPath,
  );

  requireTokens(
    pilot001,
    [
      "HEU-USER-PILOT-001-REAL-USER-UAT-REGISTER",
      "First Usable Product Acceptance",
      "Negative Access Tests",
      "PILOT-NEG-01",
    ],
    "Pilot 001 dependency token",
    pilot001Path,
  );

  requireTokens(
    appShellDecision,
    [
      "Modular Monolith / HEU App Shell",
      "HEUWorkspaceContext wrapper",
      "Data Confirmation Task Center",
      "Production status: NO-GO",
    ],
    "AppShell dependency token",
    appShellDecisionPath,
  );

  if (packageJson.scripts?.[checkerAlias] !== checkerCommand) {
    fail(`${packagePath}: missing or mismatched ${checkerAlias}`);
  }

  requireTokens(
    checkerScript,
    [
      "existsSync",
      "readFileSync",
      "HEU_USER_PILOT_IDENTITY_SCOPE_DAY1_READY: PASS_LOCAL",
      "NO_RUNTIME_CHANGE: docs/control Day-1 identity-scope checker only; no account creation, scope grant, password handling, migration, deploy, paid automation, finance action or production GO",
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
  console.error("HEU User Pilot identity/scope Day-1 readiness failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("HEU User Pilot identity/scope Day-1 readiness check");
console.log("HEU_USER_PILOT_IDENTITY_SCOPE_DAY1_READY: PASS_LOCAL");
console.log(
  "NO_RUNTIME_CHANGE: docs/control Day-1 identity-scope checker only; no account creation, scope grant, password handling, migration, deploy, paid automation, finance action or production GO",
);
