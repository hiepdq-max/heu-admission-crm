import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const failures = [];

function read(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), "utf8");
}

function exists(relativePath) {
  return existsSync(path.join(repoRoot, relativePath));
}

function fail(message) {
  failures.push(message);
}

function requireFile(relativePath) {
  if (!exists(relativePath)) {
    fail(`Missing required file: ${relativePath}`);
  }
}

function requireText(relativePath, pattern, label) {
  if (!exists(relativePath)) {
    return;
  }

  const contents = read(relativePath);
  if (!pattern.test(contents)) {
    fail(`${relativePath}: missing ${label}`);
  }
}

const requiredFiles = [
  "docs/TTGDTX_ROLE_SCOPE_UAT_RUNBOOK.md",
  "docs/TTGDTX_BROWSER_UAT_MATRIX_20260625.md",
  "docs/TTGDTX_SYNTHETIC_UAT_ACCOUNT_SETUP.md",
  "docs/TTGDTX_UAT_EXECUTION_LOG_20260625.md",
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
];

for (const file of requiredFiles) {
  requireFile(file);
}

const requiredAccounts = [
  "UAT_ADMIN",
  "UAT_BGH",
  "UAT_KHTC",
  "UAT_TUYEN_SINH",
  "UAT_PHAP_CHE",
  "UAT_OUT_OF_SCOPE",
];

for (const account of requiredAccounts) {
  requireText(
    "docs/TTGDTX_ROLE_SCOPE_UAT_RUNBOOK.md",
    new RegExp(account),
    `${account} in role-scope runbook`,
  );
  requireText(
    "docs/TTGDTX_UAT_EXECUTION_LOG_20260625.md",
    new RegExp(`${account}[\\s\\S]*PENDING`),
    `${account} pending marker in execution log`,
  );
  requireText(
    "docs/TTGDTX_SYNTHETIC_UAT_ACCOUNT_SETUP.md",
    new RegExp(account),
    `${account} in synthetic account setup`,
  );
  requireText(
    "docs/TTGDTX_BROWSER_UAT_MATRIX_20260625.md",
    new RegExp(account),
    `${account} in browser UAT matrix`,
  );
}

const requiredRoutes = [
  "/ttgdtx",
  "/ttgdtx/tuition",
  "/ttgdtx/gate",
  "/ttgdtx/receivables",
  "/ttgdtx/payments",
  "/ttgdtx/reconciliation",
  "/ttgdtx/reconciliation/review",
  "/ttgdtx/payment-requests",
  "/ttgdtx/payment-requests/review",
  "/ttgdtx/payment-requests/pay",
  "/ttgdtx/accounting-dashboard",
  "/ttgdtx/import",
  "/ttgdtx/import/issues",
  "/ttgdtx/import/workload",
  "/ttgdtx/master",
  "/ttgdtx/source-control",
  "/ttgdtx/simulation",
];

for (const route of requiredRoutes) {
  const escapedRoute = route.replaceAll("/", "\\/");
  requireText(
    "docs/TTGDTX_ROLE_SCOPE_UAT_RUNBOOK.md",
    new RegExp(`\\|\\s*\`${escapedRoute}\``),
    `${route} in role-scope route matrix`,
  );
  requireText(
    "docs/TTGDTX_UAT_EXECUTION_LOG_20260625.md",
    new RegExp(`\\|\\s*\`${escapedRoute}\`\\s*\\|\\s*PASS - redirected to \`\\/login\``),
    `${route} unauthenticated smoke evidence`,
  );
  requireText(
    "docs/TTGDTX_BROWSER_UAT_MATRIX_20260625.md",
    new RegExp(`\\|\\s*\`${escapedRoute}\``),
    `${route} in browser UAT matrix`,
  );
}

const requiredScripts = [
  "audit:permission-soft-revoke",
  "audit:ttgdtx-role-scope-access",
  "audit:ttgdtx-dashboard-access",
  "audit:ttgdtx-data-fetch-gate",
];

for (const script of requiredScripts) {
  requireText(
    "docs/TTGDTX_ROLE_SCOPE_UAT_RUNBOOK.md",
    new RegExp(script.replaceAll(":", ":")),
    `${script} in static preflight`,
  );
}

requireText(
  "docs/TTGDTX_UAT_EXECUTION_LOG_20260625.md",
  /Result:\s*PARTIAL PASS/i,
  "partial-pass decision",
);

requireText(
  "docs/TTGDTX_UAT_EXECUTION_LOG_20260625.md",
  /(?=[\s\S]*Internal UAT Run Closure Tracker)(?=[\s\S]*BLOCKED_PENDING_MULTI_ACCOUNT_UAT)(?=[\s\S]*UAT_PASS)(?=[\s\S]*UAT-CLOSE-01 Synthetic accounts prepared)(?=[\s\S]*UAT-CLOSE-06 Owners sign UAT result)(?=[\s\S]*Any missing account, route result, negative-test result, redaction proof or\s+owner signature keeps production NO-GO)(?=[\s\S]*No passwords, OTPs, service-role keys, raw PII, bank accounts or raw payment evidence in Git\/Codex\/chat)/i,
  "internal UAT run closure tracker remains blocked until signed evidence",
);

requireText(
  "docs/TTGDTX_UAT_EXECUTION_LOG_20260625.md",
  /No real passwords, OTPs, service keys, bank credentials/i,
  "no secret or real credential rule",
);

requireText(
  "docs/TTGDTX_SYNTHETIC_UAT_ACCOUNT_SETUP.md",
  /Do not send real passwords into Codex\/chat/i,
  "Codex password boundary",
);

requireText(
  "docs/TTGDTX_SYNTHETIC_UAT_ACCOUNT_SETUP.md",
  /users_profile[\s\S]*user_admission_segment_scopes/i,
  "profile and workspace scope verification query",
);

requireText(
  "docs/TTGDTX_BROWSER_UAT_MATRIX_20260625.md",
  /Simulation-Specific Checks[\s\S]*ttgdtx\.contract\.read[\s\S]*ttgdtx\.tuition\.read[\s\S]*ttgdtx\.receivable\.read/i,
  "simulation-specific permission checks",
);

requireText(
  "docs/TTGDTX_BROWSER_UAT_MATRIX_20260625.md",
  /UAT_OUT_OF_SCOPE[\s\S]*BLOCK/i,
  "out-of-scope blocked expectation",
);

requireText(
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
  /Current recommendation:\s*NO-GO for production/i,
  "NO-GO production recommendation",
);

requireText(
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
  /\|\s*Internal UAT sign-off\s*\|[\s\S]*\|\s*IN_PROGRESS\s*\|[\s\S]*TTGDTX_UAT_EXECUTION_LOG_20260625\.md/i,
  "internal UAT sign-off IN_PROGRESS with execution log",
);

if (failures.length > 0) {
  console.error("TTGDTX UAT readiness audit failed.");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(
  `TTGDTX UAT readiness audit passed. Checked ${requiredFiles.length} files, ${requiredAccounts.length} accounts and ${requiredRoutes.length} routes.`,
);
