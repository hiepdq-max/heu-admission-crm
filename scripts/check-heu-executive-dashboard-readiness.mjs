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

console.log("HEU executive dashboard readiness check");
console.log(
  "Secrets, passwords, emails, raw PII, bank data and voucher data are never printed by this script.",
);

const helperPath = "lib/executive-roles.ts";
const workspacePath = "lib/workspace.ts";
const appShellPath = "components/layout/app-shell.tsx";
const homePath = "app/page.tsx";
const executiveDashboardPath =
  "components/dashboard/executive-dashboard-overview.tsx";
const blueprintPath = "docs/HEU_STANDARD_SYSTEM_BLUEPRINT_20260703.md";
const implementationLogPath = "docs/HEU_IMPLEMENTATION_LOG.md";
const packageJsonPath = "package.json";

const helper = read(helperPath);
const workspace = read(workspacePath);
const appShell = read(appShellPath);
const home = read(homePath);
const executiveDashboard = read(executiveDashboardPath);
const blueprint = read(blueprintPath);
const implementationLog = read(implementationLogPath);
const packageJson = JSON.parse(read(packageJsonPath));

for (const roleCode of [
  "ADMIN",
  "BGH",
  "HIEU_TRUONG",
  "PHO_HIEU_TRUONG",
]) {
  requireText(helper, roleCode, `EXEC-ROLE-${roleCode}`, helperPath);
}

requireText(
  helper,
  /export function isExecutiveRole[\s\S]*EXECUTIVE_ROLE_CODES\.includes/,
  "EXEC-ROLE-HELPER",
  helperPath,
);
requireText(
  workspace,
  /import \{ isExecutiveRole \} from "@\/lib\/executive-roles"[\s\S]*const canSeeAllSegments = isExecutiveRole\(currentRoleCode\)/,
  "WORKSPACE-EXECUTIVE-ALL-SEGMENTS",
  workspacePath,
);
requireText(
  home,
  /import \{ isExecutiveRole \} from "@\/lib\/executive-roles"[\s\S]*const isExecutiveDashboard = isExecutiveRole\(roleCode\)/,
  "HOME-EXECUTIVE-ROLE-GATE",
  homePath,
);
requireText(
  home,
  /ExecutiveDashboardOverview[\s\S]*permissions=\{executivePermissions\}/,
  "HOME-EXECUTIVE-DASHBOARD-ROUTE",
  homePath,
);
requireText(
  home,
  /Boolean\(workspace\.activeSegmentId\) && !isExecutiveDashboard/,
  "HOME-EXECUTIVE-NO-LEAD-CREATE",
  homePath,
);
requireText(
  home,
  /"master_control\.read"[\s\S]*"finance_desk\.read"[\s\S]*"permission_matrix\.manage"/,
  "HOME-EXECUTIVE-PERMISSION-QUICKLINKS",
  homePath,
);

requireText(
  appShell,
  /import \{ isExecutiveRole \} from "@\/lib\/executive-roles"[\s\S]*const isExecutive = isExecutiveRole\(currentRoleCode\)/,
  "APP-SHELL-EXECUTIVE-ROLE-GATE",
  appShellPath,
);
requireText(
  appShell,
  /function buildWorkspaceQuickLinks\([\s\S]*canCreateLead: boolean[\s\S]*if \(canCreateLead\)[\s\S]*buildWorkspaceQuickLinks\([\s\S]*!isExecutive/,
  "APP-SHELL-EXECUTIVE-NO-CREATE-QUICK-ACTION",
  appShellPath,
);
requireText(
  appShell,
  /data-heu-workspace-quick-links="P0-13_WORKSPACE_QUICK_LINKS"[\s\S]*data-heu-workspace-quick-links-overflow-guard="P0-13_WORKSPACE_QUICK_LINKS_NO_OVERFLOW"/,
  "APP-SHELL-QUICK-ACCESS-OVERFLOW-GUARD",
  appShellPath,
);

requireText(
  executiveDashboard,
  /data-heu-executive-dashboard="STD-01_EXECUTIVE_DASHBOARD"[\s\S]*data-heu-executive-dashboard-readonly="STD-01_READ_ONLY"/,
  "EXEC-DASHBOARD-READONLY-ANCHOR",
  executiveDashboardPath,
);
requireText(
  executiveDashboard,
  /data-heu-executive-quick-access="STD-01_EXECUTIVE_QUICK_ACCESS"[\s\S]*data-heu-executive-quick-access-overflow-guard="STD-01_NO_OVERFLOW"/,
  "EXEC-DASHBOARD-QUICK-ACCESS-ANCHOR",
  executiveDashboardPath,
);
requireAllText(
  executiveDashboard,
  [
    "PRODUCTION_BLOCKERS",
    "NO-GO",
    "report-view signoff",
    "UAT",
    "production GO",
  ],
  "EXEC-DASHBOARD-NO-GO-BOUNDARY",
  executiveDashboardPath,
);
requireText(
  executiveDashboard,
  /href: withAdmissionSegmentParam\("\/reports"[\s\S]*href: "\/master-control"[\s\S]*href: withAdmissionSegmentParam\("\/finance-desk"[\s\S]*href: "\/settings\/scopes"/,
  "EXEC-DASHBOARD-PERMISSION-GATED-QUICKLINKS",
  executiveDashboardPath,
);
requireText(
  executiveDashboard,
  /data-heu-executive-report-reliance="STD-03_REPORT_RELIANCE_QUICK_STATUS"[\s\S]*data-heu-executive-report-reliance-boundary="OWNER_SIGNOFF_PENDING DQ-DM-05 NO_PRODUCTION_RELIANCE NO_DASHBOARD_RELIANCE NO_FINANCE_ACTION NO_OWNER_GO"/,
  "EXEC-DASHBOARD-REPORT-RELIANCE-ANCHOR",
  executiveDashboardPath,
);
requireText(
  executiveDashboard,
  /RV_TTGDTX_FINANCE_SUMMARY[\s\S]*OWNER_SIGNOFF_PENDING[\s\S]*DQ-RV-01, DQ-RV-02, DQ-DM-05[\s\S]*P2-18[\s\S]*P5-03[\s\S]*Finance Day-1/i,
  "EXEC-DASHBOARD-REPORT-RELIANCE-TTGDTX",
  executiveDashboardPath,
);
requireText(
  executiveDashboard,
  /RV_HOU_LEDGER_SUMMARY[\s\S]*HOU_LEDGER_READY \/ NO_GO \/ BLOCKED[\s\S]*DQ-RV-05, DQ-DM-05[\s\S]*HOU handover/i,
  "EXEC-DASHBOARD-REPORT-RELIANCE-HOU",
  executiveDashboardPath,
);
requireText(
  executiveDashboard,
  /RV_SHORT_COURSE_ATTENDANCE_PAYMENT[\s\S]*SC_REPORT_VIEW_SOURCE_RECONCILIATION_READY \/ NO_GO \/ BLOCKED[\s\S]*DQ-RV-06, DQ-DM-05[\s\S]*attendance lock/i,
  "EXEC-DASHBOARD-REPORT-RELIANCE-SHORT-COURSE",
  executiveDashboardPath,
);
requireText(
  executiveDashboard,
  /RV_AUDIT_RISK_CONTROL[\s\S]*AUDIT_AI_SCOPE_READY \/ NO_GO \/ BLOCKED[\s\S]*DQ-RV-07, DQ-DM-05[\s\S]*owner decision/i,
  "EXEC-DASHBOARD-REPORT-RELIANCE-AUDIT",
  executiveDashboardPath,
);
requireText(
  executiveDashboard,
  /OWNER_SIGNOFF_PENDING[\s\S]*DQ-DM-05[\s\S]*dashboard khong[\s\S]*reliance[\s\S]*finance action[\s\S]*owner[\s\S]*production GO/i,
  "EXEC-DASHBOARD-REPORT-RELIANCE-NO-GO",
  executiveDashboardPath,
);
requireText(
  executiveDashboard,
  /NO_OWNER_GO|owner GO\/NO-GO|production GO/i,
  "EXEC-DASHBOARD-OWNER-BOUNDARY",
  executiveDashboardPath,
);
requireText(
  executiveDashboard,
  /data-heu-executive-legal-sop-queue="STD-04_LEGAL_SOP_OWNER_ACTION_QUEUE"[\s\S]*data-heu-executive-legal-sop-boundary="DRAFT_CONTROL NO_LEGAL_ADVICE NO_OFFICIAL_SOP NO_OWNER_APPROVAL NO_ACCESS_GRANT NO_FINANCE_ACTION NO_PRODUCTION_GO"[\s\S]*data-heu-executive-legal-sop-overflow-guard="STD-04_NO_OVERFLOW"/,
  "EXEC-DASHBOARD-LEGAL-SOP-ANCHOR",
  executiveDashboardPath,
);
requireText(
  executiveDashboard,
  /LEGAL-STD-01[\s\S]*PHAP_CHE_REVIEW_PENDING \/ NO_GO \/ BLOCKED[\s\S]*Legal\/SOP owner action/i,
  "EXEC-DASHBOARD-LEGAL-SOP-LEGAL-BASIS",
  executiveDashboardPath,
);
requireText(
  executiveDashboard,
  /LEGAL-STD-02[\s\S]*SOP_OWNER_SIGNOFF_PENDING \/ NO_GO \/ BLOCKED[\s\S]*official SOP/i,
  "EXEC-DASHBOARD-LEGAL-SOP-SOP-VERSION",
  executiveDashboardPath,
);
requireText(
  executiveDashboard,
  /LEGAL-STD-03[\s\S]*INVOICE_POLICY_DECISION_PENDING \/ NO_GO \/ BLOCKED[\s\S]*invoice\/chung-tu/i,
  "EXEC-DASHBOARD-LEGAL-SOP-INVOICE",
  executiveDashboardPath,
);
requireText(
  executiveDashboard,
  /LEGAL-STD-04[\s\S]*EVIDENCE_CLASS_REVIEW_PENDING \/ NO_GO \/ BLOCKED[\s\S]*raw PII[\s\S]*bank[\s\S]*voucher[\s\S]*password/i,
  "EXEC-DASHBOARD-LEGAL-SOP-EVIDENCE",
  executiveDashboardPath,
);
requireText(
  executiveDashboard,
  /LEGAL-STD-05[\s\S]*ROLE_SCOPE_UAT_PENDING \/ NO_GO \/ BLOCKED[\s\S]*No access grant/i,
  "EXEC-DASHBOARD-LEGAL-SOP-ROLE-SCOPE",
  executiveDashboardPath,
);
requireText(
  executiveDashboard,
  /LEGAL-STD-06[\s\S]*OWNER_DECISION_EXTERNAL_PENDING \/ NO_GO \/ BLOCKED[\s\S]*PASS_LOCAL cannot infer owner approval/i,
  "EXEC-DASHBOARD-LEGAL-SOP-OWNER-DECISION",
  executiveDashboardPath,
);
requireText(
  executiveDashboard,
  /DRAFT_CONTROL[\s\S]*khong phat hanh SOP[\s\S]*khong ket luan phap ly[\s\S]*khong mo quyen[\s\S]*khong duyet tai chinh[\s\S]*production GO/i,
  "EXEC-DASHBOARD-LEGAL-SOP-NO-GO",
  executiveDashboardPath,
);
requireText(
  executiveDashboard,
  /data-heu-executive-module-maturity="STD-05_MODULE_MATURITY_ACTION_ROW"[\s\S]*data-heu-executive-module-maturity-boundary="PASS_LOCAL_UI NO_UAT_ACCEPTANCE NO_EVIDENCE_ACCEPTANCE NO_REPORT_VIEW_RELIANCE NO_FINANCE_ACTION NO_OWNER_GO NO_PRODUCTION_GO"[\s\S]*data-heu-executive-module-maturity-overflow-guard="STD-05_NO_OVERFLOW"/,
  "EXEC-DASHBOARD-MODULE-MATURITY-ANCHOR",
  executiveDashboardPath,
);
requireAllText(
  executiveDashboard,
  [
    "M01-M12 maturity action row",
    "M01",
    "M02",
    "M03",
    "M04",
    "M05",
    "M06",
    "M07",
    "M08",
    "M09",
    "M10",
    "M11",
    "M12",
    "STRONG_INTERNAL",
    "PASS_LOCAL_PACKAGED",
    "READ_ONLY_UAT_GATED",
    "ADVISORY_ONLY",
  ],
  "EXEC-DASHBOARD-MODULE-MATURITY-M01-M12",
  executiveDashboardPath,
);
requireText(
  executiveDashboard,
  /khong chap nhan UAT[\s\S]*khong nhan evidence[\s\S]*khong reliance report-view[\s\S]*khong duyet tai[\s\S]*khong owner GO[\s\S]*khong production GO/i,
  "EXEC-DASHBOARD-MODULE-MATURITY-NO-GO",
  executiveDashboardPath,
);

requireAllText(
  blueprint,
  [
    "STD-01",
    "PASS_LOCAL_UI",
    "STD-02",
    "PASS_LOCAL_GUARD",
    "STD-03",
    "NO_DASHBOARD_RELIANCE",
    "STD-04",
    "NO_LEGAL_ADVICE",
    "STD-05",
    "NO_UAT_ACCEPTANCE",
  ],
  "BLUEPRINT-STD01-STD05-BOUNDARY",
  blueprintPath,
);
requireAllText(
  implementationLog,
  [
    "STD-01 Executive Dashboard Quick Access",
    "lib/executive-roles.ts",
    "Dashboard Hieu truong/BGH",
    'data-heu-executive-dashboard="STD-01_EXECUTIVE_DASHBOARD"',
    /does\s+not create leads/i,
    "approve finance action",
    "mark production GO",
  ],
  "IMPLEMENTATION-LOG-STD01",
  implementationLogPath,
);
requireAllText(
  implementationLog,
  [
    "STD-02 Executive Dashboard Readiness Guard",
    "check-heu-executive-dashboard-readiness.mjs",
    "check:heu-executive-dashboard-readiness",
    "PASS_LOCAL_GUARD",
    /does not create\s+accounts/i,
    /approve report-view\s+reliance/i,
    /mark production\s+GO/i,
  ],
  "IMPLEMENTATION-LOG-STD02",
  implementationLogPath,
);
requireAllText(
  implementationLog,
  [
    "STD-03 Executive Report Reliance Quick Status",
    'data-heu-executive-report-reliance="STD-03_REPORT_RELIANCE_QUICK_STATUS"',
    "OWNER_SIGNOFF_PENDING",
    "DQ-DM-05",
    "NO_DASHBOARD_RELIANCE",
    "does not approve report-view reliance",
    "mark production GO",
  ],
  "IMPLEMENTATION-LOG-STD03",
  implementationLogPath,
);
requireAllText(
  implementationLog,
  [
    "STD-04 Executive Legal SOP Owner Action Queue",
    'data-heu-executive-legal-sop-queue="STD-04_LEGAL_SOP_OWNER_ACTION_QUEUE"',
    "LEGAL-STD-01",
    "LEGAL-STD-06",
    "DRAFT_CONTROL",
    "NO_LEGAL_ADVICE",
    "NO_OFFICIAL_SOP",
    /does not approve legal\s+position/i,
    "mark production GO",
  ],
  "IMPLEMENTATION-LOG-STD04",
  implementationLogPath,
);
requireAllText(
  implementationLog,
  [
    "STD-05 Executive Module Maturity Action Row",
    'data-heu-executive-module-maturity="STD-05_MODULE_MATURITY_ACTION_ROW"',
    "M01",
    "M12",
    "NO_UAT_ACCEPTANCE",
    "NO_REPORT_VIEW_RELIANCE",
    "does not accept UAT",
    "mark production GO",
  ],
  "IMPLEMENTATION-LOG-STD05",
  implementationLogPath,
);

if (
  packageJson.scripts?.["check:heu-executive-dashboard-readiness"] !==
  "node scripts/check-heu-executive-dashboard-readiness.mjs"
) {
  fail("package.json missing check:heu-executive-dashboard-readiness script");
}

console.log("READY PACKAGE-SCRIPT");
console.log(
  "EXECUTIVE_DASHBOARD_READY / NO_GO / BLOCKED: PASS_LOCAL_UI. This check does not create accounts, grant access, execute UAT, accept evidence, approve report-view reliance, approve dashboard reliance, approve legal position, issue official SOP, approve finance action, approve owner GO/NO-GO or mark production GO.",
);
