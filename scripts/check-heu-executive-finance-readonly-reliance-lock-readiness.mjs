import fs from "node:fs";

function read(path) {
  return fs.readFileSync(path, "utf8");
}

function fail(message) {
  console.error(`NO_GO ${message}`);
  process.exit(1);
}

function requireText(text, pattern, label, path) {
  const ok =
    typeof pattern === "string" ? text.includes(pattern) : pattern.test(text);

  if (!ok) {
    fail(`${label} missing in ${path}`);
  }

  console.log(`READY ${label}`);
}

function requireAllText(text, patterns, label, path) {
  for (const pattern of patterns) {
    const ok =
      typeof pattern === "string" ? text.includes(pattern) : pattern.test(text);

    if (!ok) {
      fail(`${label} missing ${pattern.toString()} in ${path}`);
    }
  }

  console.log(`READY ${label}`);
}

console.log("HEU executive finance read-only reliance lock readiness check");
console.log(
  "Secrets, raw PII, bank data, vouchers, passwords, payment files and signed evidence are never printed by this script.",
);

const executiveDashboardPath =
  "components/dashboard/executive-dashboard-overview.tsx";
const executiveReadinessPath =
  "scripts/check-heu-executive-dashboard-readiness.mjs";
const financeFastIndexPath =
  "scripts/check-heu-executive-finance-reliance-fast-index-readiness.mjs";
const financeTriagePath =
  "scripts/check-heu-executive-finance-reliance-triage-readiness.mjs";
const financePaymentPath = "scripts/check-heu-finance-payment-scope-readiness.mjs";
const visualQaPath = "scripts/check-heu-executive-dashboard-visual-qa.mjs";
const blueprintPath = "docs/HEU_STANDARD_SYSTEM_BLUEPRINT_20260703.md";
const implementationLogPath = "docs/HEU_IMPLEMENTATION_LOG.md";
const packageJsonPath = "package.json";

const executiveDashboard = read(executiveDashboardPath);
const executiveReadiness = read(executiveReadinessPath);
const financeFastIndex = read(financeFastIndexPath);
const financeTriage = read(financeTriagePath);
const financePayment = read(financePaymentPath);
const visualQa = read(visualQaPath);
const blueprint = read(blueprintPath);
const implementationLog = read(implementationLogPath);
const packageJson = JSON.parse(read(packageJsonPath));

const readonlyLockTokens = [
  "ExecutiveFinanceReadonlyRelianceLock",
  "financeReadonlyRelianceLockRows",
  "STD-41_EXECUTIVE_FINANCE_READONLY_RELIANCE_LOCK",
  "STD-41 Finance read-only reliance lock",
  "PASS_LOCAL_FINANCE_READONLY_RELIANCE_LOCK",
  "RELIANCE_LOCK",
  "SCOPE_BOUND_DASHBOARD",
  "P2-18",
  "P5-03",
  "FIN_DAY1",
  "ACCT_LOCAL",
  "P6-04",
  "SOURCE_MAP_REQUIRED",
  "OWNER_SIGNOFF_PENDING",
  "CONTROLLED_EVIDENCE_REQUIRED",
  "SIGNED_UAT_PENDING",
  "NO_DASHBOARD_RELIANCE",
  "NO_REPORT_VIEW_RELIANCE",
  "NO_COLLECTION_RELIANCE",
  "NO_DEBT_CLEARING",
  "NO_VOUCHER_POSTING",
  "NO_INVOICE_ISSUANCE",
  "NO_PAYMENT_EXECUTION",
  "NO_BANK_INSTRUCTION",
  "NO_MONEY_MOVEMENT",
  "NO_STATUTORY_ACCOUNTING",
  "NO_FINANCE_RELIANCE",
  "NO_UAT_ACCEPTANCE",
  "NO_EVIDENCE_ACCEPTANCE",
  "NO_OWNER_GO",
  "NO_PRODUCTION_GO",
  "FIN-LOCK-01",
  "FIN-LOCK-02",
  "FIN-LOCK-03",
  "FIN-LOCK-04",
  "FIN-LOCK-05",
  "FIN-LOCK-06",
  "Visible use",
  "Required before reliance",
  "P2-18 accounting dashboard",
  "P5-03 Finance Desk",
  "Collection / reconciliation",
  "Payment request / payout",
  "ACCT local + Finance Day-1",
  "Role/scope-bound finance visibility",
];

requireText(
  executiveDashboard,
  /data-heu-executive-finance-readonly-reliance-lock="STD-41_EXECUTIVE_FINANCE_READONLY_RELIANCE_LOCK"[\s\S]*data-heu-executive-finance-readonly-reliance-lock-boundary="PASS_LOCAL_FINANCE_READONLY_RELIANCE_LOCK READ_ONLY RELIANCE_LOCK SCOPE_BOUND_DASHBOARD P2-18 P5-03 FIN_DAY1 ACCT_LOCAL P6-04 SOURCE_MAP_REQUIRED OWNER_SIGNOFF_PENDING CONTROLLED_EVIDENCE_REQUIRED SIGNED_UAT_PENDING NO_DASHBOARD_RELIANCE NO_REPORT_VIEW_RELIANCE NO_COLLECTION_RELIANCE NO_DEBT_CLEARING NO_VOUCHER_POSTING NO_INVOICE_ISSUANCE NO_PAYMENT_EXECUTION NO_BANK_INSTRUCTION NO_MONEY_MOVEMENT NO_STATUTORY_ACCOUNTING NO_FINANCE_RELIANCE NO_UAT_ACCEPTANCE NO_EVIDENCE_ACCEPTANCE NO_OWNER_GO NO_PRODUCTION_GO"[\s\S]*data-heu-executive-finance-readonly-reliance-lock-overflow-guard="STD-41_NO_OVERFLOW"/,
  "EXEC-DASHBOARD-STD41-FINANCE-READONLY-RELIANCE-LOCK-ANCHOR",
  executiveDashboardPath,
);
requireAllText(
  executiveDashboard,
  readonlyLockTokens,
  "EXEC-DASHBOARD-STD41-FINANCE-READONLY-RELIANCE-LOCK-TOKENS",
  executiveDashboardPath,
);
requireAllText(
  executiveReadiness,
  [
    "EXEC-DASHBOARD-FINANCE-READONLY-RELIANCE-LOCK-ANCHOR",
    "EXEC-DASHBOARD-FINANCE-READONLY-RELIANCE-LOCK-TOKENS",
    "PASS_LOCAL_FINANCE_READONLY_RELIANCE_LOCK",
    "check:heu-executive-finance-readonly-reliance-lock-readiness",
  ],
  "EXECUTIVE-READINESS-STD41",
  executiveReadinessPath,
);
requireAllText(
  financeFastIndex,
  [
    "STD-41_EXECUTIVE_FINANCE_READONLY_RELIANCE_LOCK",
    "FIN-LOCK-01",
    "FIN-LOCK-06",
    "PASS_LOCAL_FINANCE_READONLY_RELIANCE_LOCK",
  ],
  "FINANCE-FAST-INDEX-CHECKER-STD41",
  financeFastIndexPath,
);
requireAllText(
  financeTriage,
  [
    "STD-41_EXECUTIVE_FINANCE_READONLY_RELIANCE_LOCK",
    "FIN-LOCK-01",
    "FIN-LOCK-06",
    "PASS_LOCAL_FINANCE_READONLY_RELIANCE_LOCK",
  ],
  "FINANCE-TRIAGE-CHECKER-STD41",
  financeTriagePath,
);
requireAllText(
  financePayment,
  [
    "FINANCE-READONLY-RELIANCE-LOCK",
    "STD-41_EXECUTIVE_FINANCE_READONLY_RELIANCE_LOCK",
    "FIN-LOCK-01",
    "FIN-LOCK-06",
    "PASS_LOCAL_FINANCE_READONLY_RELIANCE_LOCK",
  ],
  "FINANCE-PAYMENT-SCOPE-STD41",
  financePaymentPath,
);
requireAllText(
  visualQa,
  [
    'data-heu-executive-finance-readonly-reliance-lock="STD-41_EXECUTIVE_FINANCE_READONLY_RELIANCE_LOCK"',
    "STD-41 Finance read-only reliance lock",
    "FIN-LOCK-01",
    "FIN-LOCK-06",
    "PASS_LOCAL_FINANCE_READONLY_RELIANCE_LOCK",
  ],
  "VISUAL-QA-STD41",
  visualQaPath,
);
requireAllText(
  blueprint,
  [
    "STD-41",
    "STD-41_EXECUTIVE_FINANCE_READONLY_RELIANCE_LOCK",
    "PASS_LOCAL_FINANCE_READONLY_RELIANCE_LOCK",
    "RELIANCE_LOCK",
    "FIN-LOCK-01",
    "FIN-LOCK-06",
    "NO_DEBT_CLEARING",
    "NO_INVOICE_ISSUANCE",
    "NO_MONEY_MOVEMENT",
    "NO_EVIDENCE_ACCEPTANCE",
  ],
  "BLUEPRINT-STD41",
  blueprintPath,
);
requireAllText(
  implementationLog,
  [
    "STD-41 Executive Finance Readonly Reliance Lock",
    'data-heu-executive-finance-readonly-reliance-lock="STD-41_EXECUTIVE_FINANCE_READONLY_RELIANCE_LOCK"',
    "FIN-LOCK-01",
    "FIN-LOCK-06",
    "PASS_LOCAL_FINANCE_READONLY_RELIANCE_LOCK",
    "check:heu-executive-finance-readonly-reliance-lock-readiness",
    /does not approve\s+finance reliance/i,
    "mark production GO",
  ],
  "IMPLEMENTATION-LOG-STD41",
  implementationLogPath,
);

if (
  packageJson.scripts?.[
    "check:heu-executive-finance-readonly-reliance-lock-readiness"
  ] !==
  "node scripts/check-heu-executive-finance-readonly-reliance-lock-readiness.mjs"
) {
  fail(
    "package.json missing check:heu-executive-finance-readonly-reliance-lock-readiness script",
  );
}

console.log("READY PACKAGE-SCRIPT");
console.log(
  "HEU_EXECUTIVE_FINANCE_READONLY_RELIANCE_LOCK_READY / NO_GO / BLOCKED: PASS_LOCAL_FINANCE_READONLY_RELIANCE_LOCK. This check verifies the executive finance read-only reliance lock only; it does not clear debt, issue invoices, post vouchers, execute payment, move money, issue bank instructions, approve finance reliance, accept UAT, accept evidence, approve owner GO/NO-GO or mark production GO.",
);
