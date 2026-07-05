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

console.log("HEU executive report source map triage readiness check");
console.log(
  "Secrets, raw PII, bank data, vouchers, passwords and signed evidence are never printed by this script.",
);

const executiveDashboardPath =
  "components/dashboard/executive-dashboard-overview.tsx";
const executiveReadinessPath =
  "scripts/check-heu-executive-dashboard-readiness.mjs";
const reportsScopePath = "scripts/check-heu-reports-dashboard-scope-readiness.mjs";
const visualQaPath = "scripts/check-heu-executive-dashboard-visual-qa.mjs";
const blueprintPath = "docs/HEU_STANDARD_SYSTEM_BLUEPRINT_20260703.md";
const implementationLogPath = "docs/HEU_IMPLEMENTATION_LOG.md";
const packageJsonPath = "package.json";

const executiveDashboard = read(executiveDashboardPath);
const executiveReadiness = read(executiveReadinessPath);
const reportsScope = read(reportsScopePath);
const visualQa = read(visualQaPath);
const blueprint = read(blueprintPath);
const implementationLog = read(implementationLogPath);
const packageJson = JSON.parse(read(packageJsonPath));

requireText(
  executiveDashboard,
  /data-heu-executive-report-source-map-triage="STD-24_EXECUTIVE_REPORT_SOURCE_MAP_TRIAGE"[\s\S]*data-heu-executive-report-source-map-triage-boundary="PASS_LOCAL_REPORT_SOURCE_TRIAGE READ_ONLY REPORT_VIEW_MASTER_CONTRACT DQ-DM-05 OWNER_SIGNOFF_PENDING CONTROLLED_EVIDENCE_REQUIRED NO_RAW_WORKBOOK NO_RAW_BANK_FILE NO_VOUCHER NO_DASHBOARD_RELIANCE NO_FINANCE_ACTION NO_STATUTORY_ACCOUNTING NO_UAT_ACCEPTANCE NO_OWNER_GO NO_PRODUCTION_GO"[\s\S]*data-heu-executive-report-source-map-triage-overflow-guard="STD-24_NO_OVERFLOW"/,
  "EXEC-DASHBOARD-STD24-REPORT-SOURCE-MAP-TRIAGE-ANCHOR",
  executiveDashboardPath,
);
requireAllText(
  executiveDashboard,
  [
    "ExecutiveReportSourceMapTriage",
    "executiveReportSourceMapTriageRows",
    "ExecutiveReportSourceFastIndex",
    "executiveReportSourceFastIndexRows",
    "STD-33_EXECUTIVE_REPORT_SOURCE_FAST_INDEX",
    "STD-33 Report source fast index",
    "PASS_LOCAL_REPORT_SOURCE_FAST_INDEX",
    "RPT-IDX-01",
    "RPT-IDX-06",
    "STD-39_EXECUTIVE_REPORT_DASHBOARD_SCOPE_CONTRACT",
    "STD-39 Report-dashboard scope contract",
    "PASS_LOCAL_REPORT_DASHBOARD_SCOPE_CONTRACT",
    "REPORT_VIEW_TO_DASHBOARD_SCOPE",
    "RPT-SCOPE-01",
    "RPT-SCOPE-06",
    "STD-24_EXECUTIVE_REPORT_SOURCE_MAP_TRIAGE",
    "STD-24 Report source map triage",
    "PASS_LOCAL_REPORT_SOURCE_TRIAGE",
    "REPORT_VIEW_MASTER_CONTRACT",
    "DQ-DM-05",
    "OWNER_SIGNOFF_PENDING",
    "CONTROLLED_EVIDENCE_REQUIRED",
    "NO_RAW_WORKBOOK",
    "NO_RAW_BANK_FILE",
    "NO_VOUCHER",
    "NO_DASHBOARD_RELIANCE",
    "NO_REPORT_VIEW_RELIANCE",
    "NO_FINANCE_ACTION",
    "NO_STATUTORY_ACCOUNTING",
    "NO_UAT_ACCEPTANCE",
    "NO_OWNER_GO",
    "NO_PRODUCTION_GO",
    "RPT-SRC-01",
    "RPT-SRC-02",
    "RPT-SRC-03",
    "RPT-SRC-04",
    "RPT-SRC-05",
    "Report-view contract",
    "DQ-DM-05 dashboard lock",
    "Owner signoff route",
    "Controlled evidence ref",
    "Reliance decision",
  ],
  "EXEC-DASHBOARD-STD24-REPORT-SOURCE-MAP-TRIAGE-TOKENS",
  executiveDashboardPath,
);
requireAllText(
  executiveReadiness,
  [
    "EXEC-DASHBOARD-REPORT-SOURCE-FAST-INDEX-ANCHOR",
    "EXEC-DASHBOARD-REPORT-SOURCE-FAST-INDEX-TOKENS",
    "EXEC-DASHBOARD-REPORT-SOURCE-MAP-TRIAGE-ANCHOR",
    "EXEC-DASHBOARD-REPORT-SOURCE-MAP-TRIAGE-TOKENS",
    "PASS_LOCAL_REPORT_SOURCE_FAST_INDEX",
    "PASS_LOCAL_REPORT_SOURCE_TRIAGE",
    "PASS_LOCAL_REPORT_DASHBOARD_SCOPE_CONTRACT",
    "check:heu-executive-report-source-fast-index-readiness",
    "check:heu-executive-report-dashboard-scope-contract-readiness",
    "check:heu-executive-report-source-map-triage-readiness",
  ],
  "EXECUTIVE-READINESS-STD24",
  executiveReadinessPath,
);
requireAllText(
  reportsScope,
  [
    "EXECUTIVE-DASHBOARD-STD33-REPORT-SOURCE-FAST-INDEX",
    "STD-33_EXECUTIVE_REPORT_SOURCE_FAST_INDEX",
    "PASS_LOCAL_REPORT_SOURCE_FAST_INDEX",
    "PASS_LOCAL_REPORT_DASHBOARD_SCOPE_CONTRACT",
    "EXECUTIVE-DASHBOARD-STD24-REPORT-SOURCE-MAP-TRIAGE",
    "STD-24_EXECUTIVE_REPORT_SOURCE_MAP_TRIAGE",
    "PASS_LOCAL_REPORT_SOURCE_TRIAGE",
    "NO_DASHBOARD_RELIANCE",
    "NO_REPORT_VIEW_RELIANCE",
  ],
  "REPORTS-SCOPE-STD24",
  reportsScopePath,
);
requireAllText(
  visualQa,
  [
    'data-heu-executive-report-source-map-triage="STD-24_EXECUTIVE_REPORT_SOURCE_MAP_TRIAGE"',
    "PASS_LOCAL_REPORT_SOURCE_TRIAGE",
    "RPT-SRC-01",
    "RPT-SRC-05",
  ],
  "VISUAL-QA-STD24",
  visualQaPath,
);
requireAllText(
  blueprint,
  [
    "STD-33",
    "STD-33_EXECUTIVE_REPORT_SOURCE_FAST_INDEX",
    "PASS_LOCAL_REPORT_SOURCE_FAST_INDEX",
    "STD-39",
    "STD-39_EXECUTIVE_REPORT_DASHBOARD_SCOPE_CONTRACT",
    "PASS_LOCAL_REPORT_DASHBOARD_SCOPE_CONTRACT",
    "REPORT_VIEW_TO_DASHBOARD_SCOPE",
    "STD-24",
    "STD-24_EXECUTIVE_REPORT_SOURCE_MAP_TRIAGE",
    "PASS_LOCAL_REPORT_SOURCE_TRIAGE",
    "REPORT_VIEW_MASTER_CONTRACT",
    "DQ-DM-05",
    "OWNER_SIGNOFF_PENDING",
    "CONTROLLED_EVIDENCE_REQUIRED",
    "NO_DASHBOARD_RELIANCE",
    "NO_REPORT_VIEW_RELIANCE",
  ],
  "BLUEPRINT-STD24",
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
    'data-heu-executive-report-dashboard-scope-contract="STD-39_EXECUTIVE_REPORT_DASHBOARD_SCOPE_CONTRACT"',
    "RPT-SCOPE-01",
    "RPT-SCOPE-06",
    "PASS_LOCAL_REPORT_DASHBOARD_SCOPE_CONTRACT",
    "check:heu-executive-report-dashboard-scope-contract-readiness",
    "STD-24 Executive Report Source Map Triage",
    'data-heu-executive-report-source-map-triage="STD-24_EXECUTIVE_REPORT_SOURCE_MAP_TRIAGE"',
    "RPT-SRC-01",
    "RPT-SRC-05",
    "PASS_LOCAL_REPORT_SOURCE_TRIAGE",
    "check:heu-executive-report-source-map-triage-readiness",
    /does not approve\s+report-view reliance/i,
    "mark production GO",
  ],
  "IMPLEMENTATION-LOG-STD24",
  implementationLogPath,
);

if (
  packageJson.scripts?.["check:heu-executive-report-source-map-triage-readiness"] !==
  "node scripts/check-heu-executive-report-source-map-triage-readiness.mjs"
) {
  fail(
    "package.json missing check:heu-executive-report-source-map-triage-readiness script",
  );
}

console.log("READY PACKAGE-SCRIPT");
console.log(
  "HEU_EXECUTIVE_REPORT_SOURCE_MAP_TRIAGE_READY / NO_GO / BLOCKED: PASS_LOCAL_REPORT_SOURCE_TRIAGE. This check verifies executive report/source-map triage only; it does not approve report-view reliance, dashboard reliance, finance action, statutory accounting, UAT, evidence, owner GO/NO-GO or production GO.",
);
