import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const failures = [];

const ledgerPath =
  "docs/HEU_CONTROL/HEU_USER_PILOT_008_LIVE_CHECK_RESULT_LEDGER_20260710.md";
const secureEnvHandoffPath =
  "docs/HEU_CONTROL/HEU_USER_PILOT_007_SECURE_ENV_HANDOFF_20260709.md";
const activationWorksheetPath =
  "docs/HEU_CONTROL/HEU_USER_PILOT_006_USER_ACTIVATION_WORKSHEET_READINESS_20260709.md";
const checkerPath =
  "scripts/check-heu-user-pilot-live-check-result-ledger-readiness.mjs";
const packagePath = "package.json";
const checkerAlias = "check:heu-user-pilot-live-check-result-ledger-readiness";
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
  ledgerPath,
  secureEnvHandoffPath,
  activationWorksheetPath,
  checkerPath,
  packagePath,
]) {
  requireFile(file);
}

if (failures.length === 0) {
  const ledger = read(ledgerPath);
  const secureEnvHandoff = read(secureEnvHandoffPath);
  const activationWorksheet = read(activationWorksheetPath);
  const checkerScript = read(checkerPath);
  const packageJson = JSON.parse(read(packagePath));

  requireTokens(
    ledger,
    [
      "HEU-USER-PILOT-008-LIVE-CHECK-RESULT-LEDGER",
      "Status: PASS_LOCAL_LEDGER",
      "Production status: NO-GO",
      "env_local_exists=False",
      "USER-CREATE-ENV=NO_GO",
      "PERMISSION-SCOPE-ENV=NO_GO",
      "LIVE_USER_ENV_READY=NO_GO_UNTIL_IT_DATA_LOCAL_CONFIRM",
      "NO_GO_ENV_NOT_READY",
      "PASS_LOCAL_NO_SECRET_VALUE_RECORDED",
      "Allowed evidence in this ledger:",
      "Forbidden evidence in this ledger:",
      "Env value or `KEY=value` assignment.",
      "LIVE-CHECK-01",
      "LIVE-CHECK-05",
      "NO_GO_OWNER_REVIEW_PENDING",
      "check:heu-user-create-readiness",
      "check:heu-permission-scope-readiness",
      "check:heu-user-activation-worksheet-readiness",
      "check:heu-user-operation-cutover-readiness",
      "AI/Codex must not",
      "Read, print, summarize or store `.env.local`.",
      "Grant role, department, workspace or business scope.",
      "SOP-RESULT",
      "`NO_GO` for real user activation",
      "CAN_SUA",
    ],
    "live-check result ledger token",
    ledgerPath,
  );

  forbidPatterns(
    ledger,
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
    ledgerPath,
  );

  requireTokens(
    secureEnvHandoff,
    [
      "HEU-USER-PILOT-007-SECURE-ENV-HANDOFF",
      "Status: PASS_LOCAL_HANDOFF",
      "LIVE_USER_ENV_READY=NO_GO_UNTIL_IT_DATA_LOCAL_CONFIRM",
      "Do not write the values in this document.",
      "AI/Codex must not",
    ],
    "secure env handoff dependency token",
    secureEnvHandoffPath,
  );

  requireTokens(
    activationWorksheet,
    [
      "HEU-USER-PILOT-006-USER-ACTIVATION-WORKSHEET-READINESS",
      "NO_GO_EXTERNAL_ENV",
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
      "HEU_USER_PILOT_LIVE_CHECK_RESULT_LEDGER_READY: PASS_LOCAL",
      "LIVE_USER_CHECKS_READY: NO_GO_ENV_NOT_READY",
      "NO_RUNTIME_CHANGE: live-check result ledger checker only; no secret readout, account creation, scope grant, password handling, migration, deploy, paid automation, finance action or production GO",
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
  console.error("HEU user pilot live-check result ledger readiness check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("HEU user pilot live-check result ledger readiness check");
console.log("HEU_USER_PILOT_LIVE_CHECK_RESULT_LEDGER_READY: PASS_LOCAL");
console.log("LIVE_USER_CHECKS_READY: NO_GO_ENV_NOT_READY");
console.log(
  "NO_RUNTIME_CHANGE: live-check result ledger checker only; no secret readout, account creation, scope grant, password handling, migration, deploy, paid automation, finance action or production GO",
);
