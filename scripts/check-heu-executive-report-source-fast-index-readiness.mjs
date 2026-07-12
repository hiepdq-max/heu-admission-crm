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

console.log("HEU executive report source fast-index readiness check");
console.log(
  "Secrets, raw PII, bank data, vouchers, passwords and signed evidence are never printed by this script.",
);

const executiveDashboardPath =
  "components/dashboard/executive-dashboard-overview.tsx";
const executiveReadinessPath =
  "scripts/check-heu-executive-dashboard-readiness.mjs";
const reportTriagePath =
  "scripts/check-heu-executive-report-source-map-triage-readiness.mjs";
const reportsScopePath = "scripts/check-heu-reports-dashboard-scope-readiness.mjs";
const blueprintPath = "docs/HEU_STANDARD_SYSTEM_BLUEPRINT_20260703.md";
const implementationLogPath = "docs/HEU_IMPLEMENTATION_LOG.md";
const packageJsonPath = "package.json";

const executiveDashboard = read(executiveDashboardPath);
const executiveReadiness = read(executiveReadinessPath);
const reportTriage = read(reportTriagePath);
const reportsScope = read(reportsScopePath);
const blueprint = read(blueprintPath);
const implementationLog = read(implementationLogPath);
const packageJson = JSON.parse(read(packageJsonPath));

requireText(
  executiveDashboard,
  /data-heu-executive-report-source-fast-index="STD-33_EXECUTIVE_REPORT_SOURCE_FAST_INDEX"[\s\S]*data-heu-executive-report-source-fast-index-boundary="PASS_LOCAL_REPORT_SOURCE_FAST_INDEX READ_ONLY REPORT_VIEW_SOURCE_INDEX DQ_DM05_VISIBLE OWNER_SIGNOFF_PENDING CONTROLLED_EVIDENCE_REQUIRED NO_DASHBOARD_RELIANCE NO_RAW_SOURCE_OPEN NO_FINANCE_ACTION NO_STATUTORY_ACCOUNTING NO_UAT_ACCEPTANCE NO_EVIDENCE_ACCEPTANCE NO_OWNER_GO NO_PRODUCTION_GO"[\s\S]*data-heu-executive-report-source-fast-index-overflow-guard="STD-33_NO_OVERFLOW"/,
  "EXEC-DASHBOARD-STD33-REPORT-SOURCE-FAST-INDEX-ANCHOR",
  executiveDashboardPath,
);
requireAllText(
  executiveDashboard,
  [
    "ExecutiveReportSourceFastIndex",
    "executiveReportSourceFastIndexRows",
    "STD-33 Report source fast index",
    "PASS_LOCAL_REPORT_SOURCE_FAST_INDEX",
    "REPORT_VIEW_SOURCE_INDEX",
    "DQ_DM05_VISIBLE",
    "NO_RAW_SOURCE_OPEN",
    "RPT-IDX-01",
    "RPT-IDX-02",
    "RPT-IDX-03",
    "RPT-IDX-04",
    "RPT-IDX-05",
    "RPT-IDX-06",
    "RV_TTGDTX_FINANCE_SUMMARY",
    "RV_TTGDTX_CONG_NO_THUC_THU",
    "RV_HOU_LEDGER_SUMMARY",
    "RV_SHORT_COURSE_ATTENDANCE_PAYMENT",
    "RV_AUDIT_RISK_CONTROL",
    "RV_AI_ALLOWED_CONTEXT",
    "P2-18 + P5-03 + FIN-DAY1",
    "P2-10 + P2-13/P2-14",
    "HOU handover + tuition ledger + COM policy",
    "Short Course attendance + invoice/payment",
    "AI policy + approved report views + prompt audit",
    "NO_DASHBOARD_RELIANCE",
    "NO_STATUTORY_ACCOUNTING",
    "NO_AI_PRODUCTION_ACTION",
    "STD-39_EXECUTIVE_REPORT_DASHBOARD_SCOPE_CONTRACT",
    "STD-39 Report-dashboard scope contract",
    "PASS_LOCAL_REPORT_DASHBOARD_SCOPE_CONTRACT",
    "REPORT_VIEW_TO_DASHBOARD_SCOPE",
    "RPT-SCOPE-01",
    "RPT-SCOPE-06",
    "NO_REPORT_VIEW_RELIANCE",
  ],
  "EXEC-DASHBOARD-STD33-REPORT-SOURCE-FAST-INDEX-TOKENS",
  executiveDashboardPath,
);
requireAllText(
  executiveReadiness,
  [
    "EXEC-DASHBOARD-REPORT-SOURCE-FAST-INDEX-ANCHOR",
    "EXEC-DASHBOARD-REPORT-SOURCE-FAST-INDEX-TOKENS",
    "PASS_LOCAL_REPORT_SOURCE_FAST_INDEX",
    "PASS_LOCAL_REPORT_DASHBOARD_SCOPE_CONTRACT",
    "check:heu-executive-report-source-fast-index-readiness",
    "check:heu-executive-report-dashboard-scope-contract-readiness",
  ],
  "EXECUTIVE-READINESS-STD33",
  executiveReadinessPath,
);
requireAllText(
  reportTriage,
  [
    "STD-33_EXECUTIVE_REPORT_SOURCE_FAST_INDEX",
    "PASS_LOCAL_REPORT_SOURCE_FAST_INDEX",
    "RPT-IDX-01",
    "RPT-IDX-06",
    "STD-39_EXECUTIVE_REPORT_DASHBOARD_SCOPE_CONTRACT",
    "PASS_LOCAL_REPORT_DASHBOARD_SCOPE_CONTRACT",
  ],
  "REPORT-TRIAGE-STD33",
  reportTriagePath,
);
requireAllText(
  reportsScope,
  [
    "EXECUTIVE-DASHBOARD-STD33-REPORT-SOURCE-FAST-INDEX",
    "STD-33_EXECUTIVE_REPORT_SOURCE_FAST_INDEX",
    "PASS_LOCAL_REPORT_SOURCE_FAST_INDEX",
    "PASS_LOCAL_REPORT_DASHBOARD_SCOPE_CONTRACT",
    "NO_RAW_SOURCE_OPEN",
  ],
  "REPORTS-SCOPE-STD33",
  reportsScopePath,
);
requireAllText(
  blueprint,
  [
    "STD-33",
    "STD-33_EXECUTIVE_REPORT_SOURCE_FAST_INDEX",
    "PASS_LOCAL_REPORT_SOURCE_FAST_INDEX",
    "REPORT_VIEW_SOURCE_INDEX",
    "DQ_DM05_VISIBLE",
    "NO_RAW_SOURCE_OPEN",
    "NO_DASHBOARD_RELIANCE",
    "STD-39",
    "STD-39_EXECUTIVE_REPORT_DASHBOARD_SCOPE_CONTRACT",
    "PASS_LOCAL_REPORT_DASHBOARD_SCOPE_CONTRACT",
    "REPORT_VIEW_TO_DASHBOARD_SCOPE",
    "NO_REPORT_VIEW_RELIANCE",
  ],
  "BLUEPRINT-STD33",
  blueprintPath,
);
requireAllText(
  implementationLog,
  [
    "STD-33 Executive Report Source Fast Index",
    'data-heu-executive-report-source-fast-index="STD-33_EXECUTIVE_REPORT_SOURCE_FAST_INDEX"',
    "RPT-IDX-01",
    "RPT-IDX-06",
    "PASS_LOCAL_REPORT_SOURCE_FAST_INDEX",
    "check:heu-executive-report-source-fast-index-readiness",
    "STD-39 Executive Report Dashboard Scope Contract",
    "PASS_LOCAL_REPORT_DASHBOARD_SCOPE_CONTRACT",
    "check:heu-executive-report-dashboard-scope-contract-readiness",
    "does not approve report-view reliance",
    "mark production GO",
  ],
  "IMPLEMENTATION-LOG-STD33",
  implementationLogPath,
);

if (
  packageJson.scripts?.["check:heu-executive-report-source-fast-index-readiness"] !==
  "node scripts/check-heu-executive-report-source-fast-index-readiness.mjs"
) {
  fail(
    "package.json missing check:heu-executive-report-source-fast-index-readiness script",
  );
}

console.log("READY PACKAGE-SCRIPT");
console.log(
  "HEU_EXECUTIVE_REPORT_SOURCE_FAST_INDEX_READY / NO_GO / BLOCKED: PASS_LOCAL_REPORT_SOURCE_FAST_INDEX. This check verifies executive report/source fast-index visibility only; it does not open raw source, approve DQ evidence, approve report-view reliance, approve dashboard reliance, execute UAT, accept evidence, approve finance action, approve owner GO/NO-GO or mark production GO.",
);
