import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const failures = [];

const packetPath =
  "docs/HEU_CONTROL/HEU_USER_PILOT_009_STACKED_PR_REVIEW_PACKET_20260710.md";
const precheckLedgerPath =
  "docs/HEU_CONTROL/HEU_USER_PILOT_003_IDENTITY_SCOPE_PRECHECK_LEDGER_20260709.md";
const liveLedgerPath =
  "docs/HEU_CONTROL/HEU_USER_PILOT_008_LIVE_CHECK_RESULT_LEDGER_20260710.md";
const manifestPath =
  "docs/HEU_CONTROL/HEU_APP_SHELL_001_STAGE_FILE_MANIFEST_20260709.md";
const checkerPath =
  "scripts/check-heu-user-pilot-stacked-pr-review-packet-readiness.mjs";
const packagePath = "package.json";
const checkerAlias =
  "check:heu-user-pilot-stacked-pr-review-packet-readiness";
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
  packetPath,
  precheckLedgerPath,
  liveLedgerPath,
  manifestPath,
  checkerPath,
  packagePath,
]) {
  requireFile(file);
}

if (failures.length === 0) {
  const packet = read(packetPath);
  const precheckLedger = read(precheckLedgerPath);
  const liveLedger = read(liveLedgerPath);
  const manifest = read(manifestPath);
  const checkerScript = read(checkerPath);
  const packageJson = JSON.parse(read(packagePath));

  requireTokens(
    packet,
    [
      "HEU-USER-PILOT-009-STACKED-PR-REVIEW-PACKET",
      "Status: PASS_LOCAL_REVIEW_PACKET",
      "Production status: NO-GO",
      "Base branch: codex/heu/user-live-check-result-ledger",
      "PR #15",
      "PR #16",
      "PR #17",
      "PR #18",
      "PR #19",
      "codex/heu/user-pilot-scope-save-guard",
      "codex/heu/user-pilot-cutover-readiness",
      "codex/heu/user-activation-worksheet-readiness",
      "codex/heu/user-secure-env-handoff",
      "codex/heu/user-live-check-result-ledger",
      "https://github.com/hiepdq-max/heu-admission-crm/pull/15",
      "https://github.com/hiepdq-max/heu-admission-crm/pull/16",
      "https://github.com/hiepdq-max/heu-admission-crm/pull/17",
      "https://github.com/hiepdq-max/heu-admission-crm/pull/18",
      "https://github.com/hiepdq-max/heu-admission-crm/pull/19",
      "Move Out Of Draft Conditions",
      "Do not merge out of order",
      "No-Go Conditions",
      "check:heu-user-pilot-stacked-pr-review-packet-readiness",
      "check:heu-user-pilot-live-check-result-ledger-readiness",
      "check:heu-user-pilot-secure-env-handoff-readiness",
      "check:heu-user-activation-worksheet-readiness",
      "check:heu-user-operation-cutover-readiness",
      "check:heu-user-pilot-identity-scope-precheck-ledger-readiness",
      "check:heu-app-shell-draft-pr-readiness",
      "AI/Codex must not",
      "Read, print, store or summarize `.env.local`.",
      "Create, invite, activate, disable or delete users.",
      "Grant role, department, workspace or business scope.",
      "CAN_SUA_IT_DATA_AUDIT",
      "NO_GO_OWNER_REVIEW_PENDING",
      "NO_GO_PRODUCTION",
      "SOP-RESULT",
      "SOP-NEXT",
    ],
    "review packet token",
    packetPath,
  );

  forbidPatterns(
    packet,
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
    packetPath,
  );

  requireTokens(
    precheckLedger,
    [
      "HEU-USER-PILOT-009-STACKED-PR-REVIEW-PACKET",
      "PASS_LOCAL_REVIEW_PACKET",
      "check:heu-user-pilot-stacked-pr-review-packet-readiness",
      "Review PR #15 through PR #19 with IT_DATA + Audit",
    ],
    "precheck ledger review-packet token",
    precheckLedgerPath,
  );

  requireTokens(
    liveLedger,
    [
      "HEU-USER-PILOT-008-LIVE-CHECK-RESULT-LEDGER",
      "Status: PASS_LOCAL_LEDGER",
      "LIVE_USER_ENV_READY=NO_GO_UNTIL_IT_DATA_LOCAL_CONFIRM",
      "status-only live-check results",
    ],
    "live ledger dependency token",
    liveLedgerPath,
  );

  requireTokens(
    manifest,
    [
      packetPath,
      checkerPath,
      "check:heu-user-pilot-stacked-pr-review-packet-readiness",
    ],
    "manifest review-packet token",
    manifestPath,
  );

  if (packageJson.scripts?.[checkerAlias] !== checkerCommand) {
    fail(`${packagePath}: missing or mismatched ${checkerAlias}`);
  }

  requireTokens(
    checkerScript,
    [
      "existsSync",
      "readFileSync",
      "HEU_USER_PILOT_STACKED_PR_REVIEW_PACKET_READY: PASS_LOCAL",
      "USER_PILOT_REVIEW_READY: CAN_SUA_IT_DATA_AUDIT",
      "NO_RUNTIME_CHANGE: stacked PR review packet checker only; no secret readout, account creation, scope grant, password handling, migration, deploy, paid automation, finance action or production GO",
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
  console.error("HEU user pilot stacked PR review packet failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("HEU user pilot stacked PR review packet readiness check");
console.log("HEU_USER_PILOT_STACKED_PR_REVIEW_PACKET_READY: PASS_LOCAL");
console.log("USER_PILOT_REVIEW_READY: CAN_SUA_IT_DATA_AUDIT");
console.log(
  "NO_RUNTIME_CHANGE: stacked PR review packet checker only; no secret readout, account creation, scope grant, password handling, migration, deploy, paid automation, finance action or production GO",
);
