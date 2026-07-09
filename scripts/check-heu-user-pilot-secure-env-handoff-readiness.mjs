import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const failures = [];

const handoffPath = "docs/HEU_CONTROL/HEU_USER_PILOT_007_SECURE_ENV_HANDOFF_20260709.md";
const precheckLedgerPath =
  "docs/HEU_CONTROL/HEU_USER_PILOT_003_IDENTITY_SCOPE_PRECHECK_LEDGER_20260709.md";
const activationWorksheetPath =
  "docs/HEU_CONTROL/HEU_USER_PILOT_006_USER_ACTIVATION_WORKSHEET_READINESS_20260709.md";
const checkerPath = "scripts/check-heu-user-pilot-secure-env-handoff-readiness.mjs";
const packagePath = "package.json";
const checkerAlias = "check:heu-user-pilot-secure-env-handoff-readiness";
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
  handoffPath,
  precheckLedgerPath,
  activationWorksheetPath,
  checkerPath,
  packagePath,
]) {
  requireFile(file);
}

if (failures.length === 0) {
  const handoff = read(handoffPath);
  const precheckLedger = read(precheckLedgerPath);
  const activationWorksheet = read(activationWorksheetPath);
  const checkerScript = read(checkerPath);
  const packageJson = JSON.parse(read(packagePath));

  requireTokens(
    handoff,
    [
      "HEU-USER-PILOT-007-SECURE-ENV-HANDOFF",
      "Status: PASS_LOCAL_HANDOFF",
      "Production status: NO-GO",
      "Current local blockers:",
      "NO_GO USER-CREATE-ENV",
      "NO_GO PERMISSION-SCOPE-ENV",
      "This handoff does not provide or store secrets.",
      "NEXT_PUBLIC_SUPABASE_URL",
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
      "SUPABASE_SERVICE_ROLE_KEY",
      "Do not write the values in this document.",
      "git check-ignore .env.local",
      "npm.cmd run check:heu-user-create-readiness",
      "npm.cmd run check:heu-permission-scope-readiness",
      "ENV-HANDOFF-01",
      "ENV-HANDOFF-05",
      "NO_GO_UNTIL_LOCAL_CONFIRM",
      "NO_GO_UNTIL_RERUN",
      "AI/Codex must not",
      "Ask the user to paste secrets.",
      "Read, print, summarize or store secret values.",
      "Grant role, department, workspace or business scope.",
      "SOP-RESULT",
      "`NO_GO` for live user activation",
      "CAN_SUA",
    ],
    "secure env handoff token",
    handoffPath,
  );

  forbidPatterns(
    handoff,
    [
      {
        label: "actual Supabase URL assignment",
        pattern: /NEXT_PUBLIC_SUPABASE_URL\s*=\s*\S+/,
      },
      {
        label: "actual publishable key assignment",
        pattern: /NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY\s*=\s*\S+/,
      },
      {
        label: "actual service-role key assignment",
        pattern: /SUPABASE_SERVICE_ROLE_KEY\s*=\s*\S+/,
      },
      {
        label: "JWT-like token",
        pattern: /eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{10,}/,
      },
    ],
    "secret material",
    handoffPath,
  );

  requireTokens(
    precheckLedger,
    [
      "HEU-USER-PILOT-003-IDENTITY-SCOPE-PRECHECK-LEDGER",
      "check:heu-user-create-readiness",
      "check:heu-permission-scope-readiness",
      "USER-CREATE-ENV",
      "PERMISSION-SCOPE-ENV",
      "Day-1 real-user pilot | NO_GO",
    ],
    "precheck dependency token",
    precheckLedgerPath,
  );

  requireTokens(
    activationWorksheet,
    [
      "HEU-USER-PILOT-006-USER-ACTIVATION-WORKSHEET-READINESS",
      "NO_GO_EXTERNAL_ENV",
      "No database rollback is required",
      "NO_GO` for real user activation",
    ],
    "activation worksheet dependency token",
    activationWorksheetPath,
  );

  if (packageJson.scripts?.[checkerAlias] !== checkerCommand) {
    fail(`${packagePath}: missing or mismatched ${checkerAlias}`);
  }

  requireTokens(
    checkerScript,
    [
      "existsSync",
      "readFileSync",
      "HEU_USER_PILOT_SECURE_ENV_HANDOFF_READY: PASS_LOCAL",
      "LIVE_USER_ENV_READY: NO_GO_UNTIL_IT_DATA_LOCAL_CONFIRM",
      "NO_RUNTIME_CHANGE: secure env handoff checker only; no secret readout, account creation, scope grant, password handling, migration, deploy, paid automation, finance action or production GO",
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
  console.error("HEU user pilot secure env handoff readiness check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("HEU user pilot secure env handoff readiness check");
console.log("HEU_USER_PILOT_SECURE_ENV_HANDOFF_READY: PASS_LOCAL");
console.log("LIVE_USER_ENV_READY: NO_GO_UNTIL_IT_DATA_LOCAL_CONFIRM");
console.log(
  "NO_RUNTIME_CHANGE: secure env handoff checker only; no secret readout, account creation, scope grant, password handling, migration, deploy, paid automation, finance action or production GO",
);
