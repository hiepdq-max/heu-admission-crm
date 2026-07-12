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

console.log("HEU executive finance reliance fast-index readiness check");
console.log(
  "Secrets, raw PII, bank data, vouchers, passwords, payment files and signed evidence are never printed by this script.",
);

const executiveDashboardPath =
  "components/dashboard/executive-dashboard-overview.tsx";
const executiveReadinessPath =
  "scripts/check-heu-executive-dashboard-readiness.mjs";
const financeTriagePath =
  "scripts/check-heu-executive-finance-reliance-triage-readiness.mjs";
const financePaymentPath = "scripts/check-heu-finance-payment-scope-readiness.mjs";
const visualQaPath = "scripts/check-heu-executive-dashboard-visual-qa.mjs";
const blueprintPath = "docs/HEU_STANDARD_SYSTEM_BLUEPRINT_20260703.md";
const implementationLogPath = "docs/HEU_IMPLEMENTATION_LOG.md";
const packageJsonPath = "package.json";

const executiveDashboard = read(executiveDashboardPath);
const executiveReadiness = read(executiveReadinessPath);
const financeTriage = read(financeTriagePath);
const financePayment = read(financePaymentPath);
const visualQa = read(visualQaPath);
const blueprint = read(blueprintPath);
const implementationLog = read(implementationLogPath);
const packageJson = JSON.parse(read(packageJsonPath));

const fastIndexTokens = [
  "ExecutiveFinanceRelianceFastIndex",
  "financeRelianceFastIndexRows",
  "STD-35_EXECUTIVE_FINANCE_RELIANCE_FAST_INDEX",
  "STD-35 Finance reliance fast index",
  "PASS_LOCAL_FINANCE_RELIANCE_FAST_INDEX",
  "FINANCE_RELIANCE_INDEX",
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
  "NO_VOUCHER_POSTING",
  "NO_PAYMENT_EXECUTION",
  "NO_BANK_INSTRUCTION",
  "NO_STATUTORY_ACCOUNTING",
  "NO_FINANCE_RELIANCE",
  "NO_UAT_ACCEPTANCE",
  "NO_OWNER_GO",
  "NO_PRODUCTION_GO",
  "FIN-IDX-01",
  "FIN-IDX-02",
  "FIN-IDX-03",
  "FIN-IDX-04",
  "FIN-IDX-05",
  "FIN-IDX-06",
  "P2-18 accounting dashboard",
  "P5-03 Finance Desk",
  "Finance Day-1",
  "ACCT local readiness",
  "Payment request / payout",
  "Role/scope negative proof",
  "NO_CREATE_UPDATE_APPROVE_PAY",
  "NO_MONEY_MOVEMENT",
  "NO_ACCESS_CLOSURE",
];

const readonlyLockTokens = [
  "ExecutiveFinanceReadonlyRelianceLock",
  "financeReadonlyRelianceLockRows",
  "STD-41_EXECUTIVE_FINANCE_READONLY_RELIANCE_LOCK",
  "STD-41 Finance read-only reliance lock",
  "PASS_LOCAL_FINANCE_READONLY_RELIANCE_LOCK",
  "RELIANCE_LOCK",
  "SCOPE_BOUND_DASHBOARD",
  "FIN-LOCK-01",
  "FIN-LOCK-02",
  "FIN-LOCK-03",
  "FIN-LOCK-04",
  "FIN-LOCK-05",
  "FIN-LOCK-06",
  "P2-18 accounting dashboard",
  "P5-03 Finance Desk",
  "Collection / reconciliation",
  "Payment request / payout",
  "ACCT local + Finance Day-1",
  "Role/scope-bound finance visibility",
  "NO_DEBT_CLEARING",
  "NO_INVOICE_ISSUANCE",
  "NO_MONEY_MOVEMENT",
  "NO_EVIDENCE_ACCEPTANCE",
];

requireText(
  executiveDashboard,
  /data-heu-executive-finance-reliance-fast-index="STD-35_EXECUTIVE_FINANCE_RELIANCE_FAST_INDEX"[\s\S]*data-heu-executive-finance-reliance-fast-index-boundary="PASS_LOCAL_FINANCE_RELIANCE_FAST_INDEX READ_ONLY FINANCE_RELIANCE_INDEX P2-18 P5-03 FIN_DAY1 ACCT_LOCAL P6-04 SOURCE_MAP_REQUIRED OWNER_SIGNOFF_PENDING CONTROLLED_EVIDENCE_REQUIRED SIGNED_UAT_PENDING NO_DASHBOARD_RELIANCE NO_VOUCHER_POSTING NO_PAYMENT_EXECUTION NO_BANK_INSTRUCTION NO_STATUTORY_ACCOUNTING NO_FINANCE_RELIANCE NO_UAT_ACCEPTANCE NO_OWNER_GO NO_PRODUCTION_GO"[\s\S]*data-heu-executive-finance-reliance-fast-index-overflow-guard="STD-35_NO_OVERFLOW"/,
  "EXEC-DASHBOARD-STD35-FINANCE-RELIANCE-FAST-INDEX-ANCHOR",
  executiveDashboardPath,
);
requireAllText(
  executiveDashboard,
  fastIndexTokens,
  "EXEC-DASHBOARD-STD35-FINANCE-RELIANCE-FAST-INDEX-TOKENS",
  executiveDashboardPath,
);
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
    "EXEC-DASHBOARD-FINANCE-RELIANCE-FAST-INDEX-ANCHOR",
    "EXEC-DASHBOARD-FINANCE-RELIANCE-FAST-INDEX-TOKENS",
    "EXEC-DASHBOARD-FINANCE-READONLY-RELIANCE-LOCK-ANCHOR",
    "EXEC-DASHBOARD-FINANCE-READONLY-RELIANCE-LOCK-TOKENS",
    "PASS_LOCAL_FINANCE_RELIANCE_FAST_INDEX",
    "PASS_LOCAL_FINANCE_READONLY_RELIANCE_LOCK",
    "check:heu-executive-finance-reliance-fast-index-readiness",
    "check:heu-executive-finance-readonly-reliance-lock-readiness",
  ],
  "EXECUTIVE-READINESS-STD35",
  executiveReadinessPath,
);
requireAllText(
  financeTriage,
  [
    "STD-35_EXECUTIVE_FINANCE_RELIANCE_FAST_INDEX",
    "FIN-IDX-01",
    "FIN-IDX-06",
    "PASS_LOCAL_FINANCE_RELIANCE_FAST_INDEX",
    "STD-41_EXECUTIVE_FINANCE_READONLY_RELIANCE_LOCK",
    "FIN-LOCK-01",
    "FIN-LOCK-06",
    "PASS_LOCAL_FINANCE_READONLY_RELIANCE_LOCK",
  ],
  "FINANCE-TRIAGE-STD35",
  financeTriagePath,
);
requireAllText(
  financePayment,
  [
    "FINANCE-RELIANCE-FAST-INDEX",
    "STD-35_EXECUTIVE_FINANCE_RELIANCE_FAST_INDEX",
    "FIN-IDX-01",
    "FIN-IDX-06",
    "PASS_LOCAL_FINANCE_RELIANCE_FAST_INDEX",
    "FINANCE-READONLY-RELIANCE-LOCK",
    "STD-41_EXECUTIVE_FINANCE_READONLY_RELIANCE_LOCK",
    "FIN-LOCK-01",
    "FIN-LOCK-06",
    "PASS_LOCAL_FINANCE_READONLY_RELIANCE_LOCK",
  ],
  "FINANCE-PAYMENT-SCOPE-STD35",
  financePaymentPath,
);
requireAllText(
  visualQa,
  [
    'data-heu-executive-finance-reliance-fast-index="STD-35_EXECUTIVE_FINANCE_RELIANCE_FAST_INDEX"',
    "STD-35 Finance reliance fast index",
    "FIN-IDX-01",
    "FIN-IDX-06",
    "PASS_LOCAL_FINANCE_RELIANCE_FAST_INDEX",
    'data-heu-executive-finance-readonly-reliance-lock="STD-41_EXECUTIVE_FINANCE_READONLY_RELIANCE_LOCK"',
    "FIN-LOCK-01",
    "FIN-LOCK-06",
    "PASS_LOCAL_FINANCE_READONLY_RELIANCE_LOCK",
  ],
  "VISUAL-QA-STD35",
  visualQaPath,
);
requireAllText(
  blueprint,
  [
    "STD-35",
    "STD-35_EXECUTIVE_FINANCE_RELIANCE_FAST_INDEX",
    "PASS_LOCAL_FINANCE_RELIANCE_FAST_INDEX",
    "FINANCE_RELIANCE_INDEX",
    "FIN-IDX-01",
    "FIN-IDX-06",
    "NO_PAYMENT_EXECUTION",
    "NO_BANK_INSTRUCTION",
    "NO_STATUTORY_ACCOUNTING",
    "NO_FINANCE_RELIANCE",
    "STD-41",
    "STD-41_EXECUTIVE_FINANCE_READONLY_RELIANCE_LOCK",
    "PASS_LOCAL_FINANCE_READONLY_RELIANCE_LOCK",
    "RELIANCE_LOCK",
    "FIN-LOCK-01",
    "FIN-LOCK-06",
    "NO_DEBT_CLEARING",
    "NO_INVOICE_ISSUANCE",
    "NO_MONEY_MOVEMENT",
  ],
  "BLUEPRINT-STD35",
  blueprintPath,
);
requireAllText(
  implementationLog,
  [
    "STD-35 Executive Finance Reliance Fast Index",
    'data-heu-executive-finance-reliance-fast-index="STD-35_EXECUTIVE_FINANCE_RELIANCE_FAST_INDEX"',
    "FIN-IDX-01",
    "FIN-IDX-06",
    "PASS_LOCAL_FINANCE_RELIANCE_FAST_INDEX",
    "check:heu-executive-finance-reliance-fast-index-readiness",
    "STD-41 Executive Finance Readonly Reliance Lock",
    'data-heu-executive-finance-readonly-reliance-lock="STD-41_EXECUTIVE_FINANCE_READONLY_RELIANCE_LOCK"',
    "FIN-LOCK-01",
    "FIN-LOCK-06",
    "PASS_LOCAL_FINANCE_READONLY_RELIANCE_LOCK",
    "check:heu-executive-finance-readonly-reliance-lock-readiness",
    /does not approve\s+finance reliance/i,
    "mark production GO",
  ],
  "IMPLEMENTATION-LOG-STD35",
  implementationLogPath,
);

if (
  packageJson.scripts?.[
    "check:heu-executive-finance-reliance-fast-index-readiness"
  ] !==
  "node scripts/check-heu-executive-finance-reliance-fast-index-readiness.mjs"
) {
  fail(
    "package.json missing check:heu-executive-finance-reliance-fast-index-readiness script",
  );
}

console.log("READY PACKAGE-SCRIPT");
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

console.log("READY PACKAGE-STD41-SCRIPT");
console.log(
  "HEU_EXECUTIVE_FINANCE_RELIANCE_FAST_INDEX_READY / NO_GO / BLOCKED: PASS_LOCAL_FINANCE_RELIANCE_FAST_INDEX with PASS_LOCAL_FINANCE_READONLY_RELIANCE_LOCK. This check verifies the executive finance reliance fast index and read-only reliance lock only; it does not clear debt, issue invoices, post vouchers, execute payment, move money, issue bank instructions, approve finance reliance, accept UAT, accept evidence, approve owner GO/NO-GO or mark production GO.",
);
