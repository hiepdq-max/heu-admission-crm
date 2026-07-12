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

console.log("HEU executive report-dashboard scope contract readiness check");
console.log(
  "Secrets, raw PII, bank data, vouchers, passwords, cookies and signed evidence are never printed by this script.",
);

const executiveDashboardPath =
  "components/dashboard/executive-dashboard-overview.tsx";
const executiveReadinessPath =
  "scripts/check-heu-executive-dashboard-readiness.mjs";
const reportFastIndexPath =
  "scripts/check-heu-executive-report-source-fast-index-readiness.mjs";
const reportTriagePath =
  "scripts/check-heu-executive-report-source-map-triage-readiness.mjs";
const reportsScopePath = "scripts/check-heu-reports-dashboard-scope-readiness.mjs";
const visualQaPath = "scripts/check-heu-executive-dashboard-visual-qa.mjs";
const blueprintPath = "docs/HEU_STANDARD_SYSTEM_BLUEPRINT_20260703.md";
const implementationLogPath = "docs/HEU_IMPLEMENTATION_LOG.md";
const packageJsonPath = "package.json";

const executiveDashboard = read(executiveDashboardPath);
const executiveReadiness = read(executiveReadinessPath);
const reportFastIndex = read(reportFastIndexPath);
const reportTriage = read(reportTriagePath);
const reportsScope = read(reportsScopePath);
const visualQa = read(visualQaPath);
const blueprint = read(blueprintPath);
const implementationLog = read(implementationLogPath);
const packageJson = JSON.parse(read(packageJsonPath));

const reportDashboardScopeTokens = [
  "ExecutiveReportDashboardScopeContract",
  "executiveReportDashboardScopeContractRows",
  "STD-39_EXECUTIVE_REPORT_DASHBOARD_SCOPE_CONTRACT",
  "STD-39 Report-dashboard scope contract",
  "PASS_LOCAL_REPORT_DASHBOARD_SCOPE_CONTRACT",
  "REPORT_VIEW_TO_DASHBOARD_SCOPE",
  "REPORT_VIEW_REGISTER",
  "SOURCE_MAP_REQUIRED",
  "DQ_DM05_VISIBLE",
  "SCOPE_BOUND_DASHBOARD",
  "RPT-SCOPE-01",
  "RPT-SCOPE-02",
  "RPT-SCOPE-03",
  "RPT-SCOPE-04",
  "RPT-SCOPE-05",
  "RPT-SCOPE-06",
  "RV_TTGDTX_FINANCE_SUMMARY",
  "RV_TTGDTX_CONG_NO_THUC_THU",
  "RV_HOU_LEDGER_SUMMARY",
  "RV_SHORT_COURSE_ATTENDANCE_PAYMENT",
  "RV_AUDIT_RISK_CONTROL",
  "RV_AI_ALLOWED_CONTEXT",
  "Executive finance focus / Finance Desk",
  "Executive reports focus / KHTC finance review",
  "Executive reports focus / HOU owner route",
  "Executive reports focus / Dao tao-KHTC review",
  "Executive blockers focus / Audit risk queue",
  "Executive AI advisory / allowed-context view",
  "NO_RAW_SOURCE_OPEN",
  "NO_CROSS_SCOPE_DASHBOARD",
  "NO_DASHBOARD_RELIANCE",
  "NO_REPORT_VIEW_RELIANCE",
  "NO_FINANCE_ACTION",
  "NO_STATUTORY_ACCOUNTING",
  "NO_EVIDENCE_ACCEPTANCE",
  "NO_LEGAL_CONCLUSION",
  "READ_ONLY_ADVISORY / NO_DASHBOARD_RELIANCE",
];

requireText(
  executiveDashboard,
  /data-heu-executive-report-dashboard-scope-contract="STD-39_EXECUTIVE_REPORT_DASHBOARD_SCOPE_CONTRACT"[\s\S]*data-heu-executive-report-dashboard-scope-contract-boundary="PASS_LOCAL_REPORT_DASHBOARD_SCOPE_CONTRACT READ_ONLY REPORT_VIEW_TO_DASHBOARD_SCOPE REPORT_VIEW_REGISTER SOURCE_MAP_REQUIRED DQ_DM05_VISIBLE OWNER_SIGNOFF_PENDING CONTROLLED_EVIDENCE_REQUIRED SCOPE_BOUND_DASHBOARD NO_RAW_SOURCE_OPEN NO_CROSS_SCOPE_DASHBOARD NO_DASHBOARD_RELIANCE NO_REPORT_VIEW_RELIANCE NO_FINANCE_ACTION NO_STATUTORY_ACCOUNTING NO_UAT_ACCEPTANCE NO_EVIDENCE_ACCEPTANCE NO_LEGAL_CONCLUSION NO_OWNER_GO NO_PRODUCTION_GO"[\s\S]*data-heu-executive-report-dashboard-scope-contract-overflow-guard="STD-39_NO_OVERFLOW"/,
  "EXEC-DASHBOARD-STD39-REPORT-DASHBOARD-SCOPE-CONTRACT-ANCHOR",
  executiveDashboardPath,
);
requireAllText(
  executiveDashboard,
  reportDashboardScopeTokens,
  "EXEC-DASHBOARD-STD39-REPORT-DASHBOARD-SCOPE-CONTRACT-TOKENS",
  executiveDashboardPath,
);
requireAllText(
  executiveReadiness,
  [
    "EXEC-DASHBOARD-REPORT-DASHBOARD-SCOPE-CONTRACT-ANCHOR",
    "EXEC-DASHBOARD-REPORT-DASHBOARD-SCOPE-CONTRACT-TOKENS",
    "PASS_LOCAL_REPORT_DASHBOARD_SCOPE_CONTRACT",
    "check:heu-executive-report-dashboard-scope-contract-readiness",
  ],
  "EXECUTIVE-READINESS-STD39",
  executiveReadinessPath,
);
requireAllText(
  reportFastIndex,
  [
    "STD-39_EXECUTIVE_REPORT_DASHBOARD_SCOPE_CONTRACT",
    "PASS_LOCAL_REPORT_DASHBOARD_SCOPE_CONTRACT",
    "RPT-SCOPE-01",
    "RPT-SCOPE-06",
  ],
  "REPORT-FAST-INDEX-STD39",
  reportFastIndexPath,
);
requireAllText(
  reportTriage,
  [
    "STD-39_EXECUTIVE_REPORT_DASHBOARD_SCOPE_CONTRACT",
    "PASS_LOCAL_REPORT_DASHBOARD_SCOPE_CONTRACT",
    "REPORT_VIEW_TO_DASHBOARD_SCOPE",
    "NO_REPORT_VIEW_RELIANCE",
  ],
  "REPORT-TRIAGE-STD39",
  reportTriagePath,
);
requireAllText(
  reportsScope,
  [
    "EXECUTIVE-DASHBOARD-STD39-REPORT-DASHBOARD-SCOPE-CONTRACT",
    "STD-39_EXECUTIVE_REPORT_DASHBOARD_SCOPE_CONTRACT",
    "PASS_LOCAL_REPORT_DASHBOARD_SCOPE_CONTRACT",
    "REPORT_VIEW_TO_DASHBOARD_SCOPE",
  ],
  "REPORTS-SCOPE-STD39",
  reportsScopePath,
);
requireAllText(
  visualQa,
  [
    'data-heu-executive-report-dashboard-scope-contract="STD-39_EXECUTIVE_REPORT_DASHBOARD_SCOPE_CONTRACT"',
    "STD-39 Report-dashboard scope contract",
    "PASS_LOCAL_REPORT_DASHBOARD_SCOPE_CONTRACT",
  ],
  "VISUAL-QA-STD39",
  visualQaPath,
);
requireAllText(
  blueprint,
  [
    "STD-39",
    "STD-39_EXECUTIVE_REPORT_DASHBOARD_SCOPE_CONTRACT",
    "PASS_LOCAL_REPORT_DASHBOARD_SCOPE_CONTRACT",
    "REPORT_VIEW_TO_DASHBOARD_SCOPE",
    "SCOPE_BOUND_DASHBOARD",
    "NO_REPORT_VIEW_RELIANCE",
  ],
  "BLUEPRINT-STD39",
  blueprintPath,
);
requireAllText(
  implementationLog,
  [
    "STD-39 Executive Report Dashboard Scope Contract",
    'data-heu-executive-report-dashboard-scope-contract="STD-39_EXECUTIVE_REPORT_DASHBOARD_SCOPE_CONTRACT"',
    "RPT-SCOPE-01",
    "RPT-SCOPE-06",
    "PASS_LOCAL_REPORT_DASHBOARD_SCOPE_CONTRACT",
    "check:heu-executive-report-dashboard-scope-contract-readiness",
    "does not approve report-view reliance",
    "mark production GO",
  ],
  "IMPLEMENTATION-LOG-STD39",
  implementationLogPath,
);

if (
  packageJson.scripts?.[
    "check:heu-executive-report-dashboard-scope-contract-readiness"
  ] !==
  "node scripts/check-heu-executive-report-dashboard-scope-contract-readiness.mjs"
) {
  fail(
    "package.json missing check:heu-executive-report-dashboard-scope-contract-readiness script",
  );
}

console.log("READY PACKAGE-SCRIPT");
console.log(
  "HEU_EXECUTIVE_REPORT_DASHBOARD_SCOPE_CONTRACT_READY / NO_GO / BLOCKED: PASS_LOCAL_REPORT_DASHBOARD_SCOPE_CONTRACT. This check verifies report-view to dashboard scope contract only; it does not open raw source, approve DQ evidence, approve report-view reliance, approve dashboard reliance, execute UAT, accept evidence, approve finance action, issue legal conclusions, approve owner GO/NO-GO or mark production GO.",
);
