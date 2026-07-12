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
const roleLanePath = "lib/heu-role-lanes.ts";
const workspacePath = "lib/workspace.ts";
const appShellPath = "components/layout/app-shell.tsx";
const homePath = "app/page.tsx";
const executiveDashboardPath =
  "components/dashboard/executive-dashboard-overview.tsx";
const blueprintPath = "docs/HEU_STANDARD_SYSTEM_BLUEPRINT_20260703.md";
const legalMatrixPath =
  "docs/HEU_LEGAL_SOP_GOVERNANCE_CONTROL_MATRIX_20260628_V01_DRAFT.md";
const implementationLogPath = "docs/HEU_IMPLEMENTATION_LOG.md";
const packageJsonPath = "package.json";

const helper = read(helperPath);
const roleLane = read(roleLanePath);
const workspace = read(workspacePath);
const appShell = read(appShellPath);
const home = read(homePath);
const executiveDashboard = read(executiveDashboardPath);
const blueprint = read(blueprintPath);
const legalMatrix = read(legalMatrixPath);
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
  /import \{ normalizeHeuRoleCode \} from "@\/lib\/heu-role-lanes"[\s\S]*export function isExecutiveRole[\s\S]*EXECUTIVE_ROLE_CODES\.includes[\s\S]*normalizeHeuRoleCode\(roleCode\)/,
  "EXEC-ROLE-HELPER",
  helperPath,
);
requireAllText(
  roleLane,
  [
    "HEU_ROLE_LANE_MATRIX",
    "HEU_DEPARTMENT_ROLE_LANE_MAP",
    "normalizeHeuRoleCode",
    "getHeuRoleLane",
    "HIEU_TRUONG",
    "PHO_HIEU_TRUONG",
    "BGH",
    "KHTC",
    "PHAP_CHE",
    "IT_DATA",
    "AUDIT",
    "DEPT-TUYEN-SINH",
    "DEPT-DAO-TAO",
    "DEPT-CTHSSV",
    "DEPT-KHOA-GV",
    "DEPT-TCHC",
    "DEPT-KHTC",
    "DEPT-PHAP-CHE",
    "DEPT-IT-DATA",
    "DEPT-AUDIT",
    "PASS_LOCAL_DEPARTMENT_ROLE_LANE_MAP",
    "EXECUTIVE_OVERSIGHT",
    "NO_ACCOUNT_CREATE",
    "NO_ROLE_ASSIGNMENT",
    "NO_ACCESS_GRANT",
    "NO_FINANCE_EXECUTION",
    "NO_LEGAL_CONCLUSION",
    "NO_UAT_ACCEPTANCE",
    "NO_OWNER_GO",
  ],
  "ROLE-LANE-GOVERNANCE-MATRIX",
  roleLanePath,
);
requireAllText(
  roleLane,
  [
    "HEU_DEPARTMENT_ROLE_LANE_MAP",
    "HEU_DEPARTMENT_ROLE_LANE_BOUNDARY",
    "PASS_LOCAL_DEPARTMENT_ROLE_LANE_MAP",
    "EXECUTIVE_OVERSIGHT",
    "DEPT-TUYEN-SINH",
    "DEPT-DAO-TAO",
    "DEPT-CTHSSV",
    "DEPT-KHOA-GV",
    "DEPT-TCHC",
    "DEPT-KHTC",
    "DEPT-PHAP-CHE",
    "DEPT-IT-DATA",
    "DEPT-AUDIT",
    "NO_ACCOUNT_CREATE",
    "NO_ROLE_ASSIGNMENT",
    "NO_ACCESS_GRANT",
    "NO_PERMISSION_EXPANSION",
    "NO_FINANCE_EXECUTION",
    "NO_LEGAL_CONCLUSION",
    "NO_UAT_ACCEPTANCE",
    "NO_OWNER_GO",
    "NO_PRODUCTION_GO",
  ],
  "ROLE-LANE-STD32-DEPARTMENT-MAP",
  roleLanePath,
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
  appShell,
  /data-heu-executive-global-focus-shortcuts="STD-19_EXECUTIVE_GLOBAL_FOCUS_SHORTCUTS"[\s\S]*data-heu-executive-global-focus-shortcuts-boundary="EXECUTIVE_ONLY READ_ONLY_ROUTE_HINT FOCUS_QUERY_PARAM NO_ACCESS_GRANT NO_PERMISSION_EXPANSION NO_STATE_MUTATION NO_APPROVAL_ACTION NO_UAT_ACCEPTANCE NO_EVIDENCE_ACCEPTANCE NO_FINANCE_ACTION NO_OWNER_GO NO_PRODUCTION_GO"[\s\S]*data-heu-executive-global-focus-shortcuts-overflow-guard="STD-19_NO_OVERFLOW"/,
  "APP-SHELL-EXECUTIVE-GLOBAL-FOCUS-SHORTCUTS-ANCHOR",
  appShellPath,
);
requireText(
  appShell,
  /data-heu-executive-focus-compact-labels="STD-31_EXECUTIVE_GLOBAL_FOCUS_COMPACT_LABELS"[\s\S]*data-heu-executive-focus-compact-labels-boundary="PASS_LOCAL_GLOBAL_FOCUS_COMPACT_LABELS EXECUTIVE_ONLY COMPACT_LABELS READ_ONLY_ROUTE_HINT FOCUS_QUERY_PARAM NO_LONG_COPY NO_ACCESS_GRANT NO_PERMISSION_EXPANSION NO_STATE_MUTATION NO_APPROVAL_ACTION NO_UAT_ACCEPTANCE NO_EVIDENCE_ACCEPTANCE NO_FINANCE_ACTION NO_OWNER_GO NO_PRODUCTION_GO"[\s\S]*data-heu-executive-focus-compact-labels-overflow-guard="STD-31_NO_OVERFLOW"/,
  "APP-SHELL-EXECUTIVE-GLOBAL-FOCUS-COMPACT-LABELS-ANCHOR",
  appShellPath,
);
requireAllText(
  appShell,
  [
    "buildExecutiveFocusQuickLinks",
    "executiveFocusQuickLinks",
    "Tổng quan",
    "Báo cáo",
    "Tài chính",
    "Bằng chứng",
    "Phân quyền",
    "Pháp chế",
    "M01-M12",
    "Blocker",
    'href: focusHref("roles")',
    '?focus=${mode}',
    "STD-23_EXECUTIVE_ROLE_SCOPE_FOCUS_SHORTCUT",
    "PASS_LOCAL_EXECUTIVE_ROLE_SCOPE",
    "PASS_LOCAL_GLOBAL_FOCUS_COMPACT_LABELS",
    "COMPACT_LABELS",
    "NO_LONG_COPY",
    "EXECUTIVE_ONLY",
    "READ_ONLY_ROUTE_HINT",
    "NO_ACCESS_GRANT",
    "NO_PERMISSION_EXPANSION",
  ],
  "APP-SHELL-EXECUTIVE-GLOBAL-FOCUS-SHORTCUTS-TOKENS",
  appShellPath,
);
requireText(
  appShell,
  /data-heu-executive-focus-lane-separation="STD-20_EXECUTIVE_FOCUS_LANE_SEPARATION"[\s\S]*data-heu-executive-focus-lane-separation-boundary="EXECUTIVE_ONLY SEPARATE_FROM_WORKSPACE READ_ONLY_ROUTE_HINT FOCUS_QUERY_PARAM NO_ACCESS_GRANT NO_PERMISSION_EXPANSION NO_STATE_MUTATION NO_APPROVAL_ACTION NO_UAT_ACCEPTANCE NO_EVIDENCE_ACCEPTANCE NO_FINANCE_ACTION NO_OWNER_GO NO_PRODUCTION_GO"[\s\S]*data-heu-executive-focus-lane-separation-overflow-guard="STD-20_NO_OVERFLOW"/,
  "APP-SHELL-EXECUTIVE-FOCUS-LANE-SEPARATION-ANCHOR",
  appShellPath,
);
requireAllText(
  appShell,
  [
    "STD-20_EXECUTIVE_FOCUS_LANE_SEPARATION",
    "SEPARATE_FROM_WORKSPACE",
    "executiveFocusQuickLinks.length > 0",
    "workspaceQuickLinks.length > 0",
    "Mo nhanh BGH focus",
    "P0-13_WORKSPACE_QUICK_LINKS",
    "P0-13_WORKSPACE_QUICK_OPEN_DAILY",
  ],
  "APP-SHELL-EXECUTIVE-FOCUS-LANE-SEPARATION-TOKENS",
  appShellPath,
);
requireText(
  appShell,
  /data-heu-quick-lane-labels="STD-21_QUICK_LANE_LABELS"[\s\S]*data-heu-quick-lane-labels-boundary="COMPACT_LABELS NO_LONG_COPY NO_STATE_MUTATION NO_APPROVAL_ACTION NO_ACCESS_GRANT NO_PERMISSION_EXPANSION NO_UAT_ACCEPTANCE NO_EVIDENCE_ACCEPTANCE NO_FINANCE_ACTION NO_OWNER_GO NO_PRODUCTION_GO"[\s\S]*data-heu-quick-lane-labels-overflow-guard="STD-21_NO_OVERFLOW"/,
  "APP-SHELL-QUICK-LANE-LABELS-ANCHOR",
  appShellPath,
);
requireAllText(
  appShell,
  [
    "STD-21_QUICK_LANE_LABELS",
    "STD-21_WORKSPACE_QUICK_LANE_LABEL",
    "COMPACT_LABELS",
    "NO_LONG_COPY",
    "BGH focus",
    "Read-only",
    "Workspace",
    "P0-13",
  ],
  "APP-SHELL-QUICK-LANE-LABELS-TOKENS",
  appShellPath,
);
requireText(
  appShell,
  /data-heu-executive-role-scope-focus-shortcut="STD-23_EXECUTIVE_ROLE_SCOPE_FOCUS_SHORTCUT"[\s\S]*data-heu-executive-role-scope-focus-boundary="PASS_LOCAL_EXECUTIVE_ROLE_SCOPE EXECUTIVE_ONLY READ_ONLY_ROUTE_HINT FOCUS_QUERY_PARAM NO_ACCESS_GRANT NO_PERMISSION_EXPANSION NO_UAT_ACCEPTANCE NO_FINANCE_ACTION NO_OWNER_GO NO_PRODUCTION_GO"/,
  "APP-SHELL-EXECUTIVE-ROLE-SCOPE-FOCUS-SHORTCUT",
  appShellPath,
);

requireText(
  executiveDashboard,
  /data-heu-executive-focus-mode="STD-17_EXECUTIVE_FOCUS_MODE"[\s\S]*data-heu-executive-focus-boundary="READ_ONLY FOCUS_QUERY_PARAM NO_STATE_MUTATION NO_HIDDEN_NO_GO NO_UAT_ACCEPTANCE NO_EVIDENCE_ACCEPTANCE NO_FINANCE_ACTION NO_OWNER_GO NO_PRODUCTION_GO"[\s\S]*data-heu-executive-focus-overflow-guard="STD-17_NO_OVERFLOW"/,
  "EXEC-DASHBOARD-FOCUS-MODE-ANCHOR",
  executiveDashboardPath,
);
requireAllText(
  executiveDashboard,
  [
    "ExecutiveFocusMode",
    "ExecutiveFocusModeItem",
    "normalizeExecutiveFocusMode",
    "showFocusedSection",
    "focusHref",
    "Focus mode",
    "Toan canh",
    "Reports",
    "Finance",
    "UAT/evidence",
    "Role/scope",
    "Legal/SOP",
    "M01-M12",
    "Blockers",
    'mode: "reports"',
    'mode: "finance"',
    'mode: "evidence"',
    'mode: "roles"',
    'mode: "legal"',
    'mode: "modules"',
    'mode: "blockers"',
    "?focus=${mode}",
    "PASS_LOCAL_EXECUTIVE_ROLE_SCOPE",
    "NO_HIDDEN_NO_GO",
    "NO_STATE_MUTATION",
  ],
  "EXEC-DASHBOARD-FOCUS-MODE-TOKENS",
  executiveDashboardPath,
);
requireText(
  executiveDashboard,
  /data-heu-executive-focus-next-action="STD-18_EXECUTIVE_FOCUS_NEXT_ACTION"[\s\S]*data-heu-executive-focus-next-action-boundary="READ_ONLY_ROUTE_HINT NO_STATE_MUTATION NO_HIDDEN_NO_GO NO_UAT_ACCEPTANCE NO_EVIDENCE_ACCEPTANCE NO_FINANCE_ACTION NO_APPROVAL_ACTION NO_OWNER_GO NO_PRODUCTION_GO"[\s\S]*data-heu-executive-focus-next-action-overflow-guard="STD-18_NO_OVERFLOW"/,
  "EXEC-DASHBOARD-FOCUS-NEXT-ACTION-ANCHOR",
  executiveDashboardPath,
);
requireAllText(
  executiveDashboard,
  [
    "ExecutiveFocusNextAction",
    "executiveFocusNextActionRows",
    "getExecutiveFocusNextAction",
    "currentFocusNextAction",
    "Next action for active focus",
    "READ_ONLY_ROUTE_HINT",
    "NEXT-ALL",
    "NEXT-RPT",
    "NEXT-FIN",
    "NEXT-EVD",
    "NEXT-ROL",
    "NEXT-LAW",
    "NEXT-M12",
    "NEXT-BLK",
    "Open target",
    "Stop rule",
  ],
  "EXEC-DASHBOARD-FOCUS-NEXT-ACTION-TOKENS",
  executiveDashboardPath,
);
requireAllText(
  home,
  [
    "focus?: string | string[]",
    "requestedExecutiveFocus",
    "focusMode={requestedExecutiveFocus}",
  ],
  "HOME-EXECUTIVE-FOCUS-PARAM",
  homePath,
);
requireText(
  executiveDashboard,
  /data-heu-executive-dashboard="STD-01_EXECUTIVE_DASHBOARD"[\s\S]*data-heu-executive-dashboard-readonly="STD-01_READ_ONLY"/,
  "EXEC-DASHBOARD-READONLY-ANCHOR",
  executiveDashboardPath,
);
requireText(
  executiveDashboard,
  /data-heu-executive-operating-brain-completion="STD-43_EXECUTIVE_OPERATING_BRAIN_COMPLETION_GATE"[\s\S]*data-heu-executive-operating-brain-completion-boundary="PASS_LOCAL_EXECUTIVE_OPERATING_BRAIN_COMPLETION READ_ONLY COMPLETION_GATE STD-01 STD-37 STD-38 STD-39 STD-40 STD-41 STD-42 STD-44 SCOPE_BOUND_DASHBOARD ROUTE_VISIBILITY_MATRIX REPORT_VIEW_TO_DASHBOARD_SCOPE EVIDENCE_AUTHORITY_QUEUE RELIANCE_LOCK ACCEPTANCE_LOCK EXECUTIVE_EFFECTIVE_ACCESS_READONLY LIVE_EXECUTIVE_PERMISSION_NO_GO SIGNED_UAT_PENDING OWNER_SIGNOFF_PENDING CONTROLLED_EVIDENCE_REQUIRED NO_STATE_MUTATION NO_ACCESS_GRANT NO_PERMISSION_EXPANSION NO_ACCOUNT_CREATE NO_ROLE_ASSIGNMENT NO_APPROVAL_PERMISSION NO_PAYMENT_PERMISSION NO_DASHBOARD_RELIANCE NO_REPORT_VIEW_RELIANCE NO_FINANCE_RELIANCE NO_FINANCE_ACTION NO_LEGAL_CONCLUSION NO_OFFICIAL_SOP NO_UAT_EXECUTION NO_UAT_ACCEPTANCE NO_EVIDENCE_ACCEPTANCE NO_OWNER_GO NO_PRODUCTION_GO"[\s\S]*data-heu-executive-operating-brain-completion-overflow-guard="STD-43_NO_OVERFLOW"/,
  "EXEC-DASHBOARD-OPERATING-BRAIN-COMPLETION-ANCHOR",
  executiveDashboardPath,
);
requireAllText(
  executiveDashboard,
  [
    "ExecutiveOperatingBrainCompletion",
    "executiveOperatingBrainCompletionRows",
    "STD-43 Executive operating brain completion gate",
    "PASS_LOCAL_EXECUTIVE_OPERATING_BRAIN_COMPLETION",
    "COMPLETION_GATE",
    "BRAIN-GATE-01",
    "BRAIN-GATE-02",
    "BRAIN-GATE-03",
    "BRAIN-GATE-04",
    "BRAIN-GATE-05",
    "BRAIN-GATE-06",
    "BRAIN-GATE-07",
    "Executive read-only landing",
    "Role/scope dashboard visibility",
    "Report/source reliance map",
    "Legal/SOP authority backbone",
    "Finance read-only reliance lock",
    "UAT/evidence acceptance lock",
    "Executive effective-access read-only live gate",
    "Quyen o dau thi chi duoc xem dashboard o day",
    "STD-44",
    "EXECUTIVE_EFFECTIVE_ACCESS_READONLY",
    "LIVE_EXECUTIVE_PERMISSION_NO_GO",
    "SCOPE_BOUND_DASHBOARD",
    "ROUTE_VISIBILITY_MATRIX",
    "REPORT_VIEW_TO_DASHBOARD_SCOPE",
    "EVIDENCE_AUTHORITY_QUEUE",
    "RELIANCE_LOCK",
    "ACCEPTANCE_LOCK",
    "NO_DASHBOARD_RELIANCE",
    "NO_FINANCE_RELIANCE",
    "NO_UAT_ACCEPTANCE",
    "NO_EVIDENCE_ACCEPTANCE",
  ],
  "EXEC-DASHBOARD-OPERATING-BRAIN-COMPLETION-TOKENS",
  executiveDashboardPath,
);
requireText(
  executiveDashboard,
  /data-heu-executive-effective-access-readonly="STD-44_EXECUTIVE_EFFECTIVE_ACCESS_READONLY_GATE"[\s\S]*data-heu-executive-effective-access-readonly-boundary="PASS_LOCAL_EXECUTIVE_EFFECTIVE_ACCESS_READONLY_GUARD READ_ONLY LIVE_EFFECTIVE_ACCESS_CHECK role_permissions user_scope_effective_access user_scope_enforcement_summary BGH HIEU_TRUONG PHO_HIEU_TRUONG EXECUTIVE_READONLY_ALLOWED_PERMISSIONS LIVE_EXECUTIVE_PERMISSION_NO_GO NO_APPROVAL_PERMISSION NO_PAYMENT_PERMISSION NO_MANAGE_PERMISSION NO_CREATE_PERMISSION NO_UPDATE_PERMISSION NO_DELETE_PERMISSION NO_SENSITIVE_READ NO_HARD_DELETE NO_ACCESS_GRANT NO_PERMISSION_EXPANSION NO_ACCOUNT_CREATE NO_ROLE_ASSIGNMENT NO_STATE_MUTATION NO_DASHBOARD_RELIANCE NO_FINANCE_RELIANCE NO_LEGAL_CONCLUSION NO_UAT_ACCEPTANCE NO_EVIDENCE_ACCEPTANCE NO_OWNER_GO NO_PRODUCTION_GO"[\s\S]*data-heu-executive-effective-access-readonly-overflow-guard="STD-44_NO_OVERFLOW"/,
  "EXEC-DASHBOARD-STD44-EFFECTIVE-ACCESS-ANCHOR",
  executiveDashboardPath,
);
requireAllText(
  executiveDashboard,
  [
    "ExecutiveEffectiveAccessReadOnlyGate",
    "executiveEffectiveAccessReadOnlyGateRows",
    "STD-44 Executive effective-access read-only gate",
    "PASS_LOCAL_EXECUTIVE_EFFECTIVE_ACCESS_READONLY_GUARD",
    "LIVE_EFFECTIVE_ACCESS_CHECK",
    "EXEC-ACCESS-01",
    "EXEC-ACCESS-02",
    "EXEC-ACCESS-03",
    "EXEC-ACCESS-04",
    "EXEC-ACCESS-05",
    "EXEC-ACCESS-06",
    "LIVE_EXECUTIVE_PERMISSION_NO_GO",
    "NO_APPROVAL_PERMISSION",
    "NO_PAYMENT_PERMISSION",
    "NO_HARD_DELETE",
    "NO_SENSITIVE_READ",
    "role_permissions.status soft-revoke path",
    "user_scope_effective_access",
    "user_scope_enforcement_summary",
    "BGH",
    "HIEU_TRUONG",
    "PHO_HIEU_TRUONG",
  ],
  "EXEC-DASHBOARD-STD44-EFFECTIVE-ACCESS-TOKENS",
  executiveDashboardPath,
);
requireText(
  executiveDashboard,
  /data-heu-executive-active-focus-header="STD-30_EXECUTIVE_ACTIVE_FOCUS_HEADER"[\s\S]*data-heu-executive-active-focus-boundary="PASS_LOCAL_ACTIVE_FOCUS_HEADER READ_ONLY_ROUTE_HINT FOCUS_QUERY_PARAM ACTIVE_FOCUS_VISIBLE RETURN_TO_ALL NO_STATE_MUTATION NO_ACCESS_GRANT NO_PERMISSION_EXPANSION NO_APPROVAL_ACTION NO_UAT_ACCEPTANCE NO_EVIDENCE_ACCEPTANCE NO_FINANCE_ACTION NO_OWNER_GO NO_PRODUCTION_GO"[\s\S]*data-heu-executive-active-focus-overflow-guard="STD-30_NO_OVERFLOW"/,
  "EXEC-DASHBOARD-ACTIVE-FOCUS-HEADER-ANCHOR",
  executiveDashboardPath,
);
requireAllText(
  executiveDashboard,
  [
    "currentFocusModeItem",
    "STD-30 Active focus header",
    "PASS_LOCAL_ACTIVE_FOCUS_HEADER",
    "ACTIVE_FOCUS_VISIBLE",
    "RETURN_TO_ALL",
    "focus={currentFocusMode}",
    "Đang xem:",
    "focusHref(\"all\")",
    "Xem toàn cảnh điều hành",
    "NO_ACCESS_GRANT",
    "NO_PERMISSION_EXPANSION",
  ],
  "EXEC-DASHBOARD-ACTIVE-FOCUS-HEADER-TOKENS",
  executiveDashboardPath,
);
requireText(
  executiveDashboard,
  /data-heu-executive-quick-access="STD-01_EXECUTIVE_QUICK_ACCESS"[\s\S]*data-heu-executive-quick-access-overflow-guard="STD-01_NO_OVERFLOW"/,
  "EXEC-DASHBOARD-QUICK-ACCESS-ANCHOR",
  executiveDashboardPath,
);
requireText(
  executiveDashboard,
  /data-heu-executive-section-navigator="STD-07_EXECUTIVE_SECTION_NAVIGATOR"[\s\S]*data-heu-executive-section-navigator-boundary="NO_HIDDEN_NO_GO NO_APPROVAL_ACTION NO_STATE_MUTATION NO_PRODUCTION_GO"[\s\S]*data-heu-executive-section-navigator-overflow-guard="STD-07_NO_OVERFLOW"/,
  "EXEC-DASHBOARD-SECTION-NAVIGATOR-ANCHOR",
  executiveDashboardPath,
);
requireText(
  executiveDashboard,
  /data-heu-executive-focus-scoped-navigator="STD-22_EXECUTIVE_FOCUS_SCOPED_NAVIGATOR"[\s\S]*data-heu-executive-focus-scoped-navigator-boundary="VISIBLE_SECTION_LINKS_ONLY PERSISTENT_OVERVIEW_PRIORITY_NEXT_QUICK NO_HIDDEN_TARGET_LINK NO_STATE_MUTATION NO_APPROVAL_ACTION NO_UAT_ACCEPTANCE NO_EVIDENCE_ACCEPTANCE NO_FINANCE_ACTION NO_OWNER_GO NO_PRODUCTION_GO"[\s\S]*data-heu-executive-focus-scoped-navigator-overflow-guard="STD-22_NO_OVERFLOW"/,
  "EXEC-DASHBOARD-FOCUS-SCOPED-NAVIGATOR-ANCHOR",
  executiveDashboardPath,
);
requireAllText(
  executiveDashboard,
  [
    "persistentExecutiveSectionCodes",
    "executiveFocusSectionCodes",
    "getExecutiveSectionNavItemsForFocus",
    "visibleSectionNavItems",
    'reports: ["RPT"]',
    'finance: ["FIN"]',
    'evidence: ["EVD"]',
    'roles: ["ROL"]',
    'legal: ["LAW"]',
    'modules: ["M12", "ADM"]',
    'blockers: ["BLK"]',
    "VISIBLE_SECTION_LINKS_ONLY",
    "PERSISTENT_OVERVIEW_PRIORITY_NEXT_QUICK",
    "NO_HIDDEN_TARGET_LINK",
  ],
  "EXEC-DASHBOARD-FOCUS-SCOPED-NAVIGATOR-TOKENS",
  executiveDashboardPath,
);
requireText(
  executiveDashboard,
  /data-heu-executive-responsive-density="STD-08_RESPONSIVE_DENSITY_SECTION_ORDER"[\s\S]*data-heu-executive-responsive-density-boundary="NO_HIDDEN_BLOCKERS NO_OVERLAP NO_PRODUCTION_GO NO_APPROVAL_ACTION"[\s\S]*data-heu-executive-section-order="overview section_navigator focus_next_action priority_focus quick_access report_reliance finance uat_evidence role_scope legal_sop module_maturity kpis blockers admissions segment_overview"/,
  "EXEC-DASHBOARD-RESPONSIVE-DENSITY-ANCHOR",
  executiveDashboardPath,
);
requireText(
  executiveDashboard,
  /data-heu-executive-visual-qa="STD-09_EXECUTIVE_VISUAL_QA_SOURCE_GUARD"[\s\S]*data-heu-executive-visual-qa-boundary="PASS_LOCAL_VISUAL_QA AUTH_REQUIRED NO_SCREENSHOT_CLAIM NO_UAT_ACCEPTANCE NO_APPROVAL_ACTION NO_PRODUCTION_GO"[\s\S]*data-heu-executive-visual-qa-viewports="desktop_1440 mobile_390"/,
  "EXEC-DASHBOARD-VISUAL-QA-ANCHOR",
  executiveDashboardPath,
);
requireText(
  executiveDashboard,
  /data-heu-executive-priority-focus="STD-11_EXECUTIVE_PRIORITY_FOCUS_RAIL"[\s\S]*data-heu-executive-priority-focus-boundary="READ_ONLY NO_HIDDEN_NO_GO NO_STATE_MUTATION NO_APPROVAL_ACTION NO_PRODUCTION_GO"[\s\S]*data-heu-executive-priority-focus-overflow-guard="STD-11_NO_OVERFLOW"/,
  "EXEC-DASHBOARD-PRIORITY-FOCUS-ANCHOR",
  executiveDashboardPath,
);
requireText(
  executiveDashboard,
  /data-heu-executive-priority-command-strip="STD-29_EXECUTIVE_PRIORITY_COMMAND_STRIP"[\s\S]*data-heu-executive-priority-command-boundary="PASS_LOCAL_PRIORITY_COMMAND_STRIP READ_ONLY_ROUTE_HINT FOCUS_QUERY_PARAM VISIBLE_FOCUS_ONLY NO_STATE_MUTATION NO_ACCESS_GRANT NO_PERMISSION_EXPANSION NO_APPROVAL_ACTION NO_UAT_ACCEPTANCE NO_EVIDENCE_ACCEPTANCE NO_FINANCE_ACTION NO_OWNER_GO NO_PRODUCTION_GO"[\s\S]*data-heu-executive-priority-command-overflow-guard="STD-29_NO_OVERFLOW"/,
  "EXEC-DASHBOARD-PRIORITY-COMMAND-STRIP-ANCHOR",
  executiveDashboardPath,
);
requireAllText(
  executiveDashboard,
  [
    "space-y-3 sm:space-y-4",
    "scroll-mt-24",
    "p-3 shadow-sm sm:p-4",
    "gap-3 sm:grid-cols-2 sm:gap-4",
    "scroll-mt-24 grid gap-4 xl:grid-cols",
    "min-h-48",
    "NO_HIDDEN_BLOCKERS",
    "NO_OVERLAP",
  ],
  "EXEC-DASHBOARD-RESPONSIVE-DENSITY-TOKENS",
  executiveDashboardPath,
);
requireAllText(
  executiveDashboard,
  [
    'id="executive-section-navigator"',
    "PASS_LOCAL_VISUAL_QA",
    "AUTH_REQUIRED",
    "NO_SCREENSHOT_CLAIM",
    "desktop_1440",
    "mobile_390",
    "STD-11_EXECUTIVE_PRIORITY_FOCUS_RAIL",
    "STD-23_EXECUTIVE_ROLE_SCOPE_DECISION_STRIP",
    "PASS_LOCAL_EXECUTIVE_ROLE_SCOPE",
  ],
  "EXEC-DASHBOARD-VISUAL-QA-TOKENS",
  executiveDashboardPath,
);
requireAllText(
  executiveDashboard,
  [
    "Priority focus",
    "NO-GO visible",
    'id="executive-priority-focus"',
    "#executive-priority-focus",
    "FIN",
    "EVD",
    "LAW",
    "RPT",
    "ROL",
    "BLK",
    "Finance reliance",
    "UAT/evidence route",
    "Legal/SOP",
    "Report reliance",
    "Role/scope",
    "Production blockers",
    "focusHref(item.focusMode)",
    "focus={item.focusMode}",
    'focusMode: "finance"',
    'focusMode: "evidence"',
    'focusMode: "legal"',
    'focusMode: "reports"',
    'focusMode: "roles"',
    'focusMode: "blockers"',
    "P2-18/P5-03 signed proof pending",
    "P0-14/P6-04/P2-18/P5-03 signed evidence pending",
    "Final owner GO/NO-GO unsigned",
    "NO_STATE_MUTATION",
  ],
  "EXEC-DASHBOARD-PRIORITY-FOCUS-TOKENS",
  executiveDashboardPath,
);
requireAllText(
  executiveDashboard,
  [
    "STD-29_EXECUTIVE_PRIORITY_COMMAND_STRIP",
    "PASS_LOCAL_PRIORITY_COMMAND_STRIP",
    "READ_ONLY_ROUTE_HINT",
    "FOCUS_QUERY_PARAM",
    "VISIBLE_FOCUS_ONLY",
    "Open priority command",
    "focusHref(item.focusMode)",
    "NO_ACCESS_GRANT",
    "NO_PERMISSION_EXPANSION",
    "NO_APPROVAL_ACTION",
    "NO_UAT_ACCEPTANCE",
    "NO_EVIDENCE_ACCEPTANCE",
    "NO_FINANCE_ACTION",
    "NO_OWNER_GO",
    "NO_PRODUCTION_GO",
  ],
  "EXEC-DASHBOARD-PRIORITY-COMMAND-STRIP-TOKENS",
  executiveDashboardPath,
);
requireAllText(
  executiveDashboard,
  [
    "Executive focus",
    'id="executive-overview"',
    'id="executive-priority-focus"',
    'id="executive-quick-access"',
    'id="executive-report-reliance"',
    'id="executive-finance-readonly"',
    'id="executive-uat-evidence"',
    'id="executive-role-scope"',
    'id="executive-legal-sop"',
    'id="executive-module-maturity"',
    'id="executive-blockers"',
    'id="executive-admissions-signal"',
    "#executive-overview",
    "#executive-priority-focus",
    "#executive-finance-readonly",
    "#executive-uat-evidence",
    "#executive-role-scope",
    "#executive-legal-sop",
    "#executive-module-maturity",
    "#executive-blockers",
  ],
  "EXEC-DASHBOARD-SECTION-NAVIGATOR-LINKS",
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
  /data-heu-executive-report-source-fast-index="STD-33_EXECUTIVE_REPORT_SOURCE_FAST_INDEX"[\s\S]*data-heu-executive-report-source-fast-index-boundary="PASS_LOCAL_REPORT_SOURCE_FAST_INDEX READ_ONLY REPORT_VIEW_SOURCE_INDEX DQ_DM05_VISIBLE OWNER_SIGNOFF_PENDING CONTROLLED_EVIDENCE_REQUIRED NO_DASHBOARD_RELIANCE NO_RAW_SOURCE_OPEN NO_FINANCE_ACTION NO_STATUTORY_ACCOUNTING NO_UAT_ACCEPTANCE NO_EVIDENCE_ACCEPTANCE NO_OWNER_GO NO_PRODUCTION_GO"[\s\S]*data-heu-executive-report-source-fast-index-overflow-guard="STD-33_NO_OVERFLOW"/,
  "EXEC-DASHBOARD-REPORT-SOURCE-FAST-INDEX-ANCHOR",
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
  ],
  "EXEC-DASHBOARD-REPORT-SOURCE-FAST-INDEX-TOKENS",
  executiveDashboardPath,
);
requireText(
  executiveDashboard,
  /data-heu-executive-report-dashboard-scope-contract="STD-39_EXECUTIVE_REPORT_DASHBOARD_SCOPE_CONTRACT"[\s\S]*data-heu-executive-report-dashboard-scope-contract-boundary="PASS_LOCAL_REPORT_DASHBOARD_SCOPE_CONTRACT READ_ONLY REPORT_VIEW_TO_DASHBOARD_SCOPE REPORT_VIEW_REGISTER SOURCE_MAP_REQUIRED DQ_DM05_VISIBLE OWNER_SIGNOFF_PENDING CONTROLLED_EVIDENCE_REQUIRED SCOPE_BOUND_DASHBOARD NO_RAW_SOURCE_OPEN NO_CROSS_SCOPE_DASHBOARD NO_DASHBOARD_RELIANCE NO_REPORT_VIEW_RELIANCE NO_FINANCE_ACTION NO_STATUTORY_ACCOUNTING NO_UAT_ACCEPTANCE NO_EVIDENCE_ACCEPTANCE NO_LEGAL_CONCLUSION NO_OWNER_GO NO_PRODUCTION_GO"[\s\S]*data-heu-executive-report-dashboard-scope-contract-overflow-guard="STD-39_NO_OVERFLOW"/,
  "EXEC-DASHBOARD-REPORT-DASHBOARD-SCOPE-CONTRACT-ANCHOR",
  executiveDashboardPath,
);
requireAllText(
  executiveDashboard,
  [
    "ExecutiveReportDashboardScopeContract",
    "executiveReportDashboardScopeContractRows",
    "STD-39 Report-dashboard scope contract",
    "PASS_LOCAL_REPORT_DASHBOARD_SCOPE_CONTRACT",
    "REPORT_VIEW_TO_DASHBOARD_SCOPE",
    "REPORT_VIEW_REGISTER",
    "SOURCE_MAP_REQUIRED",
    "SCOPE_BOUND_DASHBOARD",
    "RPT-SCOPE-01",
    "RPT-SCOPE-02",
    "RPT-SCOPE-03",
    "RPT-SCOPE-04",
    "RPT-SCOPE-05",
    "RPT-SCOPE-06",
    "Executive finance focus / Finance Desk",
    "Executive reports focus / KHTC finance review",
    "Executive reports focus / HOU owner route",
    "Executive reports focus / Dao tao-KHTC review",
    "Executive blockers focus / Audit risk queue",
    "Executive AI advisory / allowed-context view",
    "NO_CROSS_SCOPE_DASHBOARD",
    "NO_REPORT_VIEW_RELIANCE",
    "READ_ONLY_ADVISORY / NO_DASHBOARD_RELIANCE",
  ],
  "EXEC-DASHBOARD-REPORT-DASHBOARD-SCOPE-CONTRACT-TOKENS",
  executiveDashboardPath,
);
requireText(
  executiveDashboard,
  /data-heu-executive-report-source-map-triage="STD-24_EXECUTIVE_REPORT_SOURCE_MAP_TRIAGE"[\s\S]*data-heu-executive-report-source-map-triage-boundary="PASS_LOCAL_REPORT_SOURCE_TRIAGE READ_ONLY REPORT_VIEW_MASTER_CONTRACT DQ-DM-05 OWNER_SIGNOFF_PENDING CONTROLLED_EVIDENCE_REQUIRED NO_RAW_WORKBOOK NO_RAW_BANK_FILE NO_VOUCHER NO_DASHBOARD_RELIANCE NO_FINANCE_ACTION NO_STATUTORY_ACCOUNTING NO_UAT_ACCEPTANCE NO_OWNER_GO NO_PRODUCTION_GO"[\s\S]*data-heu-executive-report-source-map-triage-overflow-guard="STD-24_NO_OVERFLOW"/,
  "EXEC-DASHBOARD-REPORT-SOURCE-MAP-TRIAGE-ANCHOR",
  executiveDashboardPath,
);
requireAllText(
  executiveDashboard,
  [
    "ExecutiveReportSourceMapTriage",
    "executiveReportSourceMapTriageRows",
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
  "EXEC-DASHBOARD-REPORT-SOURCE-MAP-TRIAGE-TOKENS",
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
  /data-heu-executive-finance-readonly="STD-06_FINANCE_READONLY_RELIANCE_PROOF"[\s\S]*data-heu-executive-finance-boundary="READ_ONLY P2-18 P5-03 FIN-DAY1 ACCT-LOCAL NO_VOUCHER NO_PAYMENT NO_BANK_INSTRUCTION NO_STATUTORY_ACCOUNTING NO_FINANCE_RELIANCE NO_PRODUCTION_GO"[\s\S]*data-heu-executive-finance-overflow-guard="STD-06_NO_OVERFLOW"/,
  "EXEC-DASHBOARD-FINANCE-READONLY-ANCHOR",
  executiveDashboardPath,
);
requireAllText(
  executiveDashboard,
  [
    "Finance read-only reliance proof",
    "P2-18",
    "P2_18_RELIANCE_PENDING / NO_GO / BLOCKED",
    "P5-03",
    "P5_03_CONTROLLED_TRIAL_READY / NO_GO / BLOCKED",
    "FIN-DAY1",
    "FIN_START_READY / FIN_DAY1_RESULT_READY / NO_GO / BLOCKED",
    "ACCT-LOCAL",
    "ACCT_LOCAL_READY / NO_GO / BLOCKED",
    "P5-03-TRIAL-EVID-001",
    "P5-03-TRIAL-EVID-005",
    "FIN-START-EVID-001",
    "FIN-DAY1-EVID-005",
  ],
  "EXEC-DASHBOARD-FINANCE-READONLY-PROOF-ROWS",
  executiveDashboardPath,
);
requireText(
  executiveDashboard,
  /khong voucher[\s\S]*khong payment[\s\S]*khong bank instruction[\s\S]*khong statutory accounting[\s\S]*khong finance reliance[\s\S]*production GO/i,
  "EXEC-DASHBOARD-FINANCE-READONLY-NO-GO",
  executiveDashboardPath,
);
requireText(
  executiveDashboard,
  /data-heu-executive-finance-reliance-fast-index="STD-35_EXECUTIVE_FINANCE_RELIANCE_FAST_INDEX"[\s\S]*data-heu-executive-finance-reliance-fast-index-boundary="PASS_LOCAL_FINANCE_RELIANCE_FAST_INDEX READ_ONLY FINANCE_RELIANCE_INDEX P2-18 P5-03 FIN_DAY1 ACCT_LOCAL P6-04 SOURCE_MAP_REQUIRED OWNER_SIGNOFF_PENDING CONTROLLED_EVIDENCE_REQUIRED SIGNED_UAT_PENDING NO_DASHBOARD_RELIANCE NO_VOUCHER_POSTING NO_PAYMENT_EXECUTION NO_BANK_INSTRUCTION NO_STATUTORY_ACCOUNTING NO_FINANCE_RELIANCE NO_UAT_ACCEPTANCE NO_OWNER_GO NO_PRODUCTION_GO"[\s\S]*data-heu-executive-finance-reliance-fast-index-overflow-guard="STD-35_NO_OVERFLOW"/,
  "EXEC-DASHBOARD-FINANCE-RELIANCE-FAST-INDEX-ANCHOR",
  executiveDashboardPath,
);
requireAllText(
  executiveDashboard,
  [
    "ExecutiveFinanceRelianceFastIndex",
    "financeRelianceFastIndexRows",
    "STD-35 Finance reliance fast index",
    "PASS_LOCAL_FINANCE_RELIANCE_FAST_INDEX",
    "FINANCE_RELIANCE_INDEX",
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
    "NO_PAYMENT_EXECUTION",
    "NO_BANK_INSTRUCTION",
    "NO_STATUTORY_ACCOUNTING",
    "NO_FINANCE_RELIANCE",
  ],
  "EXEC-DASHBOARD-FINANCE-RELIANCE-FAST-INDEX-TOKENS",
  executiveDashboardPath,
);
requireText(
  executiveDashboard,
  /data-heu-executive-finance-readonly-reliance-lock="STD-41_EXECUTIVE_FINANCE_READONLY_RELIANCE_LOCK"[\s\S]*data-heu-executive-finance-readonly-reliance-lock-boundary="PASS_LOCAL_FINANCE_READONLY_RELIANCE_LOCK READ_ONLY RELIANCE_LOCK SCOPE_BOUND_DASHBOARD P2-18 P5-03 FIN_DAY1 ACCT_LOCAL P6-04 SOURCE_MAP_REQUIRED OWNER_SIGNOFF_PENDING CONTROLLED_EVIDENCE_REQUIRED SIGNED_UAT_PENDING NO_DASHBOARD_RELIANCE NO_REPORT_VIEW_RELIANCE NO_COLLECTION_RELIANCE NO_DEBT_CLEARING NO_VOUCHER_POSTING NO_INVOICE_ISSUANCE NO_PAYMENT_EXECUTION NO_BANK_INSTRUCTION NO_MONEY_MOVEMENT NO_STATUTORY_ACCOUNTING NO_FINANCE_RELIANCE NO_UAT_ACCEPTANCE NO_EVIDENCE_ACCEPTANCE NO_OWNER_GO NO_PRODUCTION_GO"[\s\S]*data-heu-executive-finance-readonly-reliance-lock-overflow-guard="STD-41_NO_OVERFLOW"/,
  "EXEC-DASHBOARD-FINANCE-READONLY-RELIANCE-LOCK-ANCHOR",
  executiveDashboardPath,
);
requireAllText(
  executiveDashboard,
  [
    "ExecutiveFinanceReadonlyRelianceLock",
    "financeReadonlyRelianceLockRows",
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
    "Visible use",
    "Required before reliance",
    "P2-18 accounting dashboard",
    "P5-03 Finance Desk",
    "Collection / reconciliation",
    "Payment request / payout",
    "ACCT local + Finance Day-1",
    "Role/scope-bound finance visibility",
    "NO_DEBT_CLEARING",
    "NO_INVOICE_ISSUANCE",
    "NO_MONEY_MOVEMENT",
    "NO_CROSS_SCOPE_DASHBOARD",
    "NO_EVIDENCE_ACCEPTANCE",
  ],
  "EXEC-DASHBOARD-FINANCE-READONLY-RELIANCE-LOCK-TOKENS",
  executiveDashboardPath,
);
requireText(
  executiveDashboard,
  /data-heu-executive-finance-reliance-triage="STD-26_EXECUTIVE_FINANCE_RELIANCE_TRIAGE"[\s\S]*data-heu-executive-finance-reliance-triage-boundary="PASS_LOCAL_FINANCE_RELIANCE_TRIAGE READ_ONLY P2-18 P5-03 FIN_DAY1 P6-04 SOURCE_MAP_REQUIRED OWNER_SIGNOFF_PENDING CONTROLLED_EVIDENCE_REQUIRED SIGNED_UAT_PENDING NO_DASHBOARD_RELIANCE NO_VOUCHER_POSTING NO_PAYMENT_EXECUTION NO_BANK_INSTRUCTION NO_STATUTORY_ACCOUNTING NO_FINANCE_RELIANCE NO_UAT_ACCEPTANCE NO_OWNER_GO NO_PRODUCTION_GO"[\s\S]*data-heu-executive-finance-reliance-triage-overflow-guard="STD-26_NO_OVERFLOW"/,
  "EXEC-DASHBOARD-FINANCE-RELIANCE-TRIAGE-ANCHOR",
  executiveDashboardPath,
);
requireAllText(
  executiveDashboard,
  [
    "ExecutiveFinanceRelianceDecision",
    "financeRelianceDecisionRows",
    "STD-26 Finance reliance decision triage",
    "PASS_LOCAL_FINANCE_RELIANCE_TRIAGE",
    "FIN-REL-01",
    "FIN-REL-02",
    "FIN-REL-03",
    "FIN-REL-04",
    "FIN-REL-05",
    "Signed P2-18/P5-03 route",
    "Finance Day-1 ledger route",
    "Role/scope negative proof",
    "Owner reliance decision",
    "Forbidden actions lock",
    "SIGNED_UAT_PENDING",
    "NO_DASHBOARD_RELIANCE",
    "NO_VOUCHER_POSTING",
    "NO_PAYMENT_EXECUTION",
    "NO_BANK_INSTRUCTION",
    "NO_STATUTORY_ACCOUNTING",
    "NO_FINANCE_RELIANCE",
  ],
  "EXEC-DASHBOARD-FINANCE-RELIANCE-TRIAGE-TOKENS",
  executiveDashboardPath,
);
requireText(
  executiveDashboard,
  /data-heu-executive-finance-source-contract="STD-15_FINANCE_RELIANCE_SOURCE_CONTRACT"[\s\S]*data-heu-executive-finance-source-boundary="READ_ONLY SOURCE_MAP_REQUIRED OWNER_SIGNOFF_PENDING CONTROLLED_EVIDENCE_REQUIRED NO_VOUCHER_POSTING NO_PAYMENT_EXECUTION NO_BANK_INSTRUCTION NO_STATUTORY_ACCOUNTING NO_FINANCE_RELIANCE NO_PRODUCTION_GO"[\s\S]*data-heu-executive-finance-source-overflow-guard="STD-15_NO_OVERFLOW"/,
  "EXEC-DASHBOARD-FINANCE-SOURCE-CONTRACT-ANCHOR",
  executiveDashboardPath,
);
requireAllText(
  executiveDashboard,
  [
    "STD-15 Finance reliance source contract",
    "SOURCE_MAP_REQUIRED / NO_GO / BLOCKED",
    "FIN-SRC-01",
    "FIN-SRC-02",
    "FIN-SRC-03",
    "FIN-SRC-04",
    "FIN-SRC-05",
    "Receivable / cong no",
    "Collection / thu hoc phi",
    "Reconciliation / doi soat",
    "Payment request / de nghi chi",
    "Payout evidence / chi tien",
    "P2-03 + P2-05 gate",
    "P2-10 payments",
    "P2-13 + P2-14 lock",
    "P2-15 + P2-16",
    "P2-17 record only",
    "No bank instruction, money movement or statutory voucher from dashboard/PASS_LOCAL.",
  ],
  "EXEC-DASHBOARD-FINANCE-SOURCE-CONTRACT-TOKENS",
  executiveDashboardPath,
);
requireText(
  executiveDashboard,
  /data-heu-executive-uat-evidence-route="STD-16_UAT_EVIDENCE_ROUTE_CHECKLIST"[\s\S]*data-heu-executive-uat-evidence-boundary="PASS_LOCAL_EVIDENCE_ROUTE SIGNED_UAT_PENDING CONTROLLED_EVIDENCE_REQUIRED OWNER_SIGNOFF_PENDING NO_UAT_ACCEPTANCE NO_EVIDENCE_ACCEPTANCE NO_FINANCE_RELIANCE NO_ACCESS_CLOSURE NO_OWNER_GO NO_PRODUCTION_GO"[\s\S]*data-heu-executive-uat-evidence-overflow-guard="STD-16_NO_OVERFLOW"/,
  "EXEC-DASHBOARD-UAT-EVIDENCE-ROUTE-ANCHOR",
  executiveDashboardPath,
);
requireText(
  executiveDashboard,
  /data-heu-executive-uat-evidence-closure-triage="STD-27_EXECUTIVE_UAT_EVIDENCE_CLOSURE_TRIAGE"[\s\S]*data-heu-executive-uat-evidence-closure-boundary="PASS_LOCAL_UAT_EVIDENCE_TRIAGE READ_ONLY P0-14 P6-04 P2-18 P5-03 P0-09 P0-15 P0-17 SIGNED_UAT_PENDING CONTROLLED_EVIDENCE_REQUIRED OWNER_SIGNOFF_PENDING NO_UAT_EXECUTION NO_UAT_ACCEPTANCE NO_EVIDENCE_ACCEPTANCE NO_ACCESS_CLOSURE NO_ACCESS_GRANT NO_PERMISSION_EXPANSION NO_FINANCE_RELIANCE NO_LEGAL_CONCLUSION NO_OWNER_GO NO_PRODUCTION_GO"[\s\S]*data-heu-executive-uat-evidence-closure-overflow-guard="STD-27_NO_OVERFLOW"/,
  "EXEC-DASHBOARD-UAT-EVIDENCE-CLOSURE-TRIAGE-ANCHOR",
  executiveDashboardPath,
);
requireAllText(
  executiveDashboard,
  [
    "ExecutiveUatEvidenceClosure",
    "uatEvidenceClosureRows",
    "STD-27 UAT/evidence closure triage",
    "PASS_LOCAL_UAT_EVIDENCE_TRIAGE",
    "UAT-CLOSE-01",
    "UAT-CLOSE-02",
    "UAT-CLOSE-03",
    "UAT-CLOSE-04",
    "UAT-CLOSE-05",
    "Controlled evidence location",
    "Signed UAT route state",
    "Role/access closure dependency",
    "Finance/legal reliance dependency",
    "Final owner decision pack",
    "NO_UAT_EXECUTION",
    "NO_UAT_ACCEPTANCE",
    "NO_EVIDENCE_ACCEPTANCE",
    "NO_ACCESS_CLOSURE",
    "NO_ACCESS_GRANT",
    "NO_PERMISSION_EXPANSION",
    "NO_FINANCE_RELIANCE",
    "NO_LEGAL_CONCLUSION",
  ],
  "EXEC-DASHBOARD-UAT-EVIDENCE-CLOSURE-TRIAGE-TOKENS",
  executiveDashboardPath,
);
requireText(
  executiveDashboard,
  /data-heu-executive-uat-evidence-fast-action="STD-36_EXECUTIVE_UAT_EVIDENCE_FAST_ACTION_QUEUE"[\s\S]*data-heu-executive-uat-evidence-fast-action-boundary="PASS_LOCAL_UAT_EVIDENCE_FAST_ACTION_QUEUE READ_ONLY FAST_ACTION_QUEUE P0-14 P6-04 P2-18 P5-03 P6-03 P6-06 P0-09 P0-15 SIGNED_UAT_PENDING CONTROLLED_EVIDENCE_REQUIRED OWNER_SIGNOFF_PENDING NO_EVIDENCE_UPLOAD NO_UAT_EXECUTION NO_UAT_ACCEPTANCE NO_EVIDENCE_ACCEPTANCE NO_ACCESS_GRANT NO_ACCESS_CLOSURE NO_PERMISSION_EXPANSION NO_FINANCE_RELIANCE NO_LEGAL_CONCLUSION NO_OWNER_GO NO_PRODUCTION_GO"[\s\S]*data-heu-executive-uat-evidence-fast-action-overflow-guard="STD-36_NO_OVERFLOW"/,
  "EXEC-DASHBOARD-UAT-EVIDENCE-FAST-ACTION-ANCHOR",
  executiveDashboardPath,
);
requireAllText(
  executiveDashboard,
  [
    "ExecutiveUatEvidenceFastAction",
    "uatEvidenceFastActionRows",
    "STD-36 UAT/evidence fast action queue",
    "PASS_LOCAL_UAT_EVIDENCE_FAST_ACTION_QUEUE",
    "FAST_ACTION_QUEUE",
    "NO_EVIDENCE_UPLOAD",
    "UAT-FAST-01",
    "UAT-FAST-02",
    "UAT-FAST-03",
    "UAT-FAST-04",
    "UAT-FAST-05",
    "UAT-FAST-06",
    "P0-14 controlled evidence intake",
    "P6-04 role/workspace proof",
    "P2-18/P5-03 finance signed proof",
    "P0-19 legal/SOP confirmation",
    "P6-03/P6-06 audit and cascade closure",
    "P0-09/P0-15 final owner packet",
    "Open scope controls",
    "Open Finance Desk/P2-18 route",
    "Open legal gates",
    "Open audit lane",
    "Open Master Control",
  ],
  "EXEC-DASHBOARD-UAT-EVIDENCE-FAST-ACTION-TOKENS",
  executiveDashboardPath,
);
requireText(
  executiveDashboard,
  /data-heu-executive-uat-evidence-acceptance-lock="STD-42_EXECUTIVE_UAT_EVIDENCE_ACCEPTANCE_LOCK"[\s\S]*data-heu-executive-uat-evidence-acceptance-lock-boundary="PASS_LOCAL_UAT_EVIDENCE_ACCEPTANCE_LOCK READ_ONLY ACCEPTANCE_LOCK SIGNED_UAT_PENDING CONTROLLED_EVIDENCE_REQUIRED OWNER_SIGNOFF_PENDING REDACTION_REVIEW_REQUIRED NO_EVIDENCE_UPLOAD NO_RAW_EVIDENCE_MOVEMENT NO_UAT_EXECUTION NO_UAT_ACCEPTANCE NO_EVIDENCE_ACCEPTANCE NO_ACCESS_CLOSURE NO_ACCESS_GRANT NO_PERMISSION_EXPANSION NO_FINANCE_RELIANCE NO_DASHBOARD_RELIANCE NO_PAYMENT_EXECUTION NO_LEGAL_CONCLUSION NO_OFFICIAL_SOP NO_WORKFLOW_RELIANCE NO_AUDIT_CLOSURE NO_WAIVER_RELIANCE NO_HIDDEN_EVIDENCE_MOVEMENT NO_OWNER_GO NO_PRODUCTION_GO"[\s\S]*data-heu-executive-uat-evidence-acceptance-lock-overflow-guard="STD-42_NO_OVERFLOW"/,
  "EXEC-DASHBOARD-UAT-EVIDENCE-ACCEPTANCE-LOCK-ANCHOR",
  executiveDashboardPath,
);
requireAllText(
  executiveDashboard,
  [
    "ExecutiveUatEvidenceAcceptanceLock",
    "uatEvidenceAcceptanceLockRows",
    "STD-42 UAT/evidence acceptance lock",
    "PASS_LOCAL_UAT_EVIDENCE_ACCEPTANCE_LOCK",
    "ACCEPTANCE_LOCK",
    "REDACTION_REVIEW_REQUIRED",
    "NO_RAW_EVIDENCE_MOVEMENT",
    "NO_DASHBOARD_RELIANCE",
    "NO_PAYMENT_EXECUTION",
    "NO_OFFICIAL_SOP",
    "NO_WORKFLOW_RELIANCE",
    "NO_AUDIT_CLOSURE",
    "NO_WAIVER_RELIANCE",
    "NO_HIDDEN_EVIDENCE_MOVEMENT",
    "UAT-LOCK-01",
    "UAT-LOCK-02",
    "UAT-LOCK-03",
    "UAT-LOCK-04",
    "UAT-LOCK-05",
    "UAT-LOCK-06",
    "Visible use",
    "Required before acceptance",
    "P6-04 role/scope UAT proof",
    "P2-18/P5-03 finance UAT",
    "Signed UAT closure",
  ],
  "EXEC-DASHBOARD-UAT-EVIDENCE-ACCEPTANCE-LOCK-TOKENS",
  executiveDashboardPath,
);
requireText(
  executiveDashboard,
  /data-heu-executive-production-blocker-triage="STD-28_EXECUTIVE_PRODUCTION_BLOCKER_TRIAGE"[\s\S]*data-heu-executive-production-blocker-boundary="PASS_LOCAL_PRODUCTION_BLOCKER_TRIAGE READ_ONLY BACKUP_RESTORE_PROOF_REQUIRED MIGRATION_ORDER_SIGNOFF_REQUIRED SIGNED_UAT_PENDING OWNER_SIGNOFF_PENDING CONTROLLED_EVIDENCE_REQUIRED NO_UAT_ACCEPTANCE NO_EVIDENCE_ACCEPTANCE NO_FINANCE_RELIANCE NO_LEGAL_CONCLUSION NO_MIGRATION_APPROVAL NO_OWNER_GO NO_PRODUCTION_GO"[\s\S]*data-heu-executive-production-blocker-overflow-guard="STD-28_NO_OVERFLOW"/,
  "EXEC-DASHBOARD-PRODUCTION-BLOCKER-TRIAGE-ANCHOR",
  executiveDashboardPath,
);
requireAllText(
  executiveDashboard,
  [
    "ExecutiveProductionBlockerTriage",
    "productionBlockerTriageRows",
    "STD-28 Production blocker owner triage",
    "PASS_LOCAL_PRODUCTION_BLOCKER_TRIAGE",
    "BACKUP_RESTORE_PROOF_REQUIRED",
    "MIGRATION_ORDER_SIGNOFF_REQUIRED",
    "OWNER_SIGNOFF_PENDING",
    "CONTROLLED_EVIDENCE_REQUIRED",
    "NO_MIGRATION_APPROVAL",
    "BLK-CLOSE-01",
    "BLK-CLOSE-02",
    "BLK-CLOSE-03",
    "BLK-CLOSE-04",
    "BLK-CLOSE-05",
    "Backup/restore proof",
    "Migration order signoff",
    "Signed UAT route closure",
    "Finance/legal reliance closure",
    "Final owner GO/NO-GO packet",
  ],
  "EXEC-DASHBOARD-PRODUCTION-BLOCKER-TRIAGE-TOKENS",
  executiveDashboardPath,
);
requireAllText(
  executiveDashboard,
  [
    "UAT/evidence signed route",
    "PASS_LOCAL_EVIDENCE_ROUTE",
    "UAT-EVID-01",
    "UAT-EVID-02",
    "UAT-EVID-03",
    "UAT-EVID-04",
    "UAT-EVID-05",
    "P0-14 controlled evidence intake",
    "P6-04 role/workspace UAT",
    "P2-18 accounting dashboard UAT",
    "P5-03 Finance Desk UAT",
    "P0-09/P0-15 owner decision pack",
    "P0_14_EVIDENCE_INTAKE_PENDING / NO_GO / BLOCKED",
    "P6_04_ROLE_SCOPE_UAT_PENDING / NO_GO / BLOCKED",
    "P2_18_SIGNED_UAT_PENDING / NO_GO / BLOCKED",
    "P5_03_SIGNED_UAT_PENDING / NO_GO / BLOCKED",
    "OWNER_DECISION_PENDING / NO_GO / BLOCKED",
    "No raw screenshots, bank data, vouchers, passwords or evidence acceptance in Git/Codex/chat.",
    "No dashboard reliance, statutory accounting or finance conclusion before signed evidence.",
    "No owner GO/NO-GO, migration approval or production GO from dashboard/PASS_LOCAL.",
  ],
  "EXEC-DASHBOARD-UAT-EVIDENCE-ROUTE-TOKENS",
  executiveDashboardPath,
);
requireText(
  executiveDashboard,
  /data-heu-executive-role-scope-decision="STD-23_EXECUTIVE_ROLE_SCOPE_DECISION_STRIP"[\s\S]*data-heu-executive-role-scope-boundary="PASS_LOCAL_EXECUTIVE_ROLE_SCOPE READ_ONLY P6-04_ROLE_SCOPE_UAT_PENDING NEGATIVE_ACCESS_PROOF_PENDING NO_ACCESS_GRANT NO_PERMISSION_EXPANSION NO_DAILY_DATA_ENTRY NO_FINANCE_EXECUTION NO_LEGAL_CONCLUSION NO_UAT_ACCEPTANCE NO_OWNER_GO NO_PRODUCTION_GO"[\s\S]*data-heu-executive-role-scope-overflow-guard="STD-23_NO_OVERFLOW"/,
  "EXEC-DASHBOARD-ROLE-SCOPE-DECISION-ANCHOR",
  executiveDashboardPath,
);
requireAllText(
  executiveDashboard,
  [
    "Executive role/scope decision strip",
    "PASS_LOCAL_EXECUTIVE_ROLE_SCOPE",
    "P6-04_ROLE_SCOPE_UAT_PENDING",
    "NEGATIVE_ACCESS_PROOF_PENDING",
    "getHeuRoleLane",
    "HEU_ROLE_LANE_MATRIX",
    "currentRoleLane",
    "executiveRoleLanes",
    "UNKNOWN_ROLE_LANE",
    "EXEC-ROLE-01",
    "EXEC-ROLE-02",
    "EXEC-ROLE-03",
    "EXEC-ROLE-04",
    "Current role lane normalized",
    "Executive read-only dashboard scope",
    "Professional lane separation",
    "Negative access proof pending",
    "NO_ACCESS_GRANT",
    "NO_PERMISSION_EXPANSION",
    "NO_DAILY_DATA_ENTRY",
    "NO_FINANCE_EXECUTION",
    "NO_LEGAL_CONCLUSION",
    "NO_UAT_ACCEPTANCE",
    "NO_OWNER_GO",
    "NO_PRODUCTION_GO",
  ],
  "EXEC-DASHBOARD-ROLE-SCOPE-DECISION-TOKENS",
  executiveDashboardPath,
);
requireText(
  executiveDashboard,
  /data-heu-executive-dashboard-scope-visibility="STD-37_EXECUTIVE_DASHBOARD_SCOPE_VISIBILITY_INVARIANT"[\s\S]*data-heu-executive-dashboard-scope-visibility-boundary="PASS_LOCAL_DASHBOARD_SCOPE_VISIBILITY READ_ONLY SCOPE_BOUND_DASHBOARD canSeeAllSegments visibleSegmentIds admissionWorkspaceSegmentIds applyAdmissionSegmentIds ACTIVE_SEGMENT_LIMIT EXECUTIVE_ALL_SEGMENTS NON_EXECUTIVE_VISIBLE_SEGMENTS NO_CROSS_SCOPE_DASHBOARD NO_RAW_SOURCE_OPEN NO_ACCESS_GRANT NO_PERMISSION_EXPANSION NO_STATE_MUTATION NO_FINANCE_ACTION NO_LEGAL_CONCLUSION NO_UAT_ACCEPTANCE NO_EVIDENCE_ACCEPTANCE NO_OWNER_GO NO_PRODUCTION_GO"[\s\S]*data-heu-executive-dashboard-scope-visibility-overflow-guard="STD-37_NO_OVERFLOW"/,
  "EXEC-DASHBOARD-DASHBOARD-SCOPE-VISIBILITY-ANCHOR",
  executiveDashboardPath,
);
requireAllText(
  executiveDashboard,
  [
    "ExecutiveDashboardScopeVisibility",
    "dashboardScopeVisibilityRows",
    "STD-37 Dashboard scope visibility invariant",
    "PASS_LOCAL_DASHBOARD_SCOPE_VISIBILITY",
    "SCOPE_BOUND_DASHBOARD",
    "Quyen o dau, dashboard o day",
    "SCOPE-VIS-01",
    "SCOPE-VIS-02",
    "SCOPE-VIS-03",
    "SCOPE-VIS-04",
    "SCOPE-VIS-05",
    "HIEU_TRUONG / BGH / PHO_HIEU_TRUONG",
    "Phong ban / user thuong",
    "KHTC / finance lane",
    "PHAP_CHE / SOP lane",
    "IT_DATA / Audit",
    "canSeeAllSegments",
    "visibleSegmentIds",
    "admissionWorkspaceSegmentIds",
    "applyAdmissionSegmentIds",
    "NO_CROSS_SCOPE_DASHBOARD",
    "NO_RAW_SOURCE_OPEN",
    "NO_STATE_MUTATION",
    "NO_FINANCE_ACTION",
    "NO_LEGAL_CONCLUSION",
  ],
  "EXEC-DASHBOARD-DASHBOARD-SCOPE-VISIBILITY-TOKENS",
  executiveDashboardPath,
);
requireText(
  workspace,
  /const canSeeAllSegments = isExecutiveRole\(currentRoleCode\)[\s\S]*\.filter\(\(segment\) => canSeeAllSegments \|\| allowedIds\.has\(segment\.id\)\)[\s\S]*const visibleSegmentIds = segmentOptions\.map\(\(segment\) => segment\.id\)/,
  "WORKSPACE-DASHBOARD-SCOPE-VISIBILITY",
  workspacePath,
);
requireText(
  home,
  /const segmentFilterIds = admissionWorkspaceSegmentIds\(workspace\)[\s\S]*applyAdmissionSegmentIds\([\s\S]*\.from\("leads"\)[\s\S]*segmentFilterIds[\s\S]*ExecutiveDashboardOverview[\s\S]*focusMode=\{requestedExecutiveFocus\}/,
  "HOME-DASHBOARD-SCOPE-VISIBILITY",
  homePath,
);
requireText(
  executiveDashboard,
  /data-heu-executive-dashboard-permission-matrix="STD-38_EXECUTIVE_DASHBOARD_PERMISSION_MATRIX"[\s\S]*data-heu-executive-dashboard-permission-matrix-boundary="PASS_LOCAL_EXECUTIVE_DASHBOARD_PERMISSION_MATRIX READ_ONLY ROUTE_VISIBILITY_MATRIX runtimePermissionGate canOpenMasterControl canOpenFinanceDesk canOpenScopeControl master_control\.read finance_desk\.read scope\.manage_department users\.create permission_matrix\.read permission_matrix\.manage NO_ACCESS_GRANT NO_PERMISSION_EXPANSION NO_ACCOUNT_CREATE NO_ROLE_ASSIGNMENT NO_STATE_MUTATION NO_APPROVAL_ACTION NO_FINANCE_ACTION NO_LEGAL_CONCLUSION NO_UAT_ACCEPTANCE NO_EVIDENCE_ACCEPTANCE NO_OWNER_GO NO_PRODUCTION_GO"[\s\S]*data-heu-executive-dashboard-permission-matrix-overflow-guard="STD-38_NO_OVERFLOW"/,
  "EXEC-DASHBOARD-PERMISSION-MATRIX-ANCHOR",
  executiveDashboardPath,
);
requireAllText(
  executiveDashboard,
  [
    "ExecutiveDashboardPermissionMatrix",
    "executiveDashboardPermissionMatrixRows",
    "getDashboardPermissionSignal",
    "getDashboardPermissionHref",
    "STD-38 Executive dashboard permission matrix",
    "PASS_LOCAL_EXECUTIVE_DASHBOARD_PERMISSION_MATRIX",
    "ROUTE_VISIBILITY_MATRIX",
    "runtimePermissionGate",
    "EXEC-PERM-01",
    "EXEC-PERM-02",
    "EXEC-PERM-03",
    "EXEC-PERM-04",
    "EXEC-PERM-05",
    "EXEC-PERM-06",
    "EXEC-PERM-07",
    "READ_ONLY_DASHBOARD_VISIBLE",
    "ROUTE_VISIBLE_BY_PERMISSION",
    "ROUTE_LINK_BLOCKED_PENDING_PERMISSION",
    "master_control.read",
    "finance_desk.read",
    "scope.manage_department",
    "users.create",
    "permission_matrix.read",
    "permission_matrix.manage",
    "NO_ACCOUNT_CREATE",
    "NO_ROLE_ASSIGNMENT",
    "NO_APPROVAL_ACTION",
  ],
  "EXEC-DASHBOARD-PERMISSION-MATRIX-TOKENS",
  executiveDashboardPath,
);
requireText(
  home,
  /const executivePermissionNames = \[[\s\S]*"master_control\.read"[\s\S]*"finance_desk\.read"[\s\S]*"scope\.manage_department"[\s\S]*"users\.create"[\s\S]*"permission_matrix\.read"[\s\S]*"permission_matrix\.manage"[\s\S]*const executivePermissions: ExecutiveDashboardPermissions = \{[\s\S]*canOpenMasterControl: hasExecutivePermission\("master_control\.read"\)[\s\S]*canOpenFinanceDesk: hasExecutivePermission\("finance_desk\.read"\)[\s\S]*canOpenScopeControl:[\s\S]*hasExecutivePermission\("scope\.manage_department"\)[\s\S]*hasExecutivePermission\("users\.create"\)[\s\S]*hasExecutivePermission\("permission_matrix\.read"\)[\s\S]*hasExecutivePermission\("permission_matrix\.manage"\)/,
  "HOME-DASHBOARD-PERMISSION-MATRIX",
  homePath,
);
requireText(
  executiveDashboard,
  /data-heu-executive-department-role-lane-map="STD-32_EXECUTIVE_DEPARTMENT_ROLE_LANE_MAP"[\s\S]*data-heu-executive-department-role-lane-boundary="PASS_LOCAL_DEPARTMENT_ROLE_LANE_MAP READ_ONLY EXECUTIVE_OVERSIGHT NO_ACCESS_GRANT NO_PERMISSION_EXPANSION NO_ACCOUNT_CREATE NO_ROLE_ASSIGNMENT NO_FINANCE_EXECUTION NO_LEGAL_CONCLUSION NO_UAT_ACCEPTANCE NO_OWNER_GO NO_PRODUCTION_GO"[\s\S]*data-heu-executive-department-role-lane-overflow-guard="STD-32_NO_OVERFLOW"/,
  "EXEC-DASHBOARD-DEPARTMENT-ROLE-LANE-MAP-ANCHOR",
  executiveDashboardPath,
);
requireAllText(
  executiveDashboard,
  [
    "STD-32_EXECUTIVE_DEPARTMENT_ROLE_LANE_MAP",
    "PASS_LOCAL_DEPARTMENT_ROLE_LANE_MAP",
    "EXECUTIVE_OVERSIGHT",
    "HEU_DEPARTMENT_ROLE_LANE_MAP.map",
    "lane.code",
    "lane.label",
    "lane.accountableLane",
    "lane.operatingScope",
    "lane.requiredEvidence",
    "lane.forbiddenScope",
    "STD-32 Department role lane map",
    "BGH xem dung nguoi dung viec theo tung phong ban",
    "executive oversight read-only",
    "khong tao tai",
    "khong gan role",
    "P6-04_PENDING",
    "Owner lane",
    "Operating scope",
    "Evidence",
    "Stop",
    "NO_ACCESS_GRANT",
    "NO_PERMISSION_EXPANSION",
    "NO_ACCOUNT_CREATE",
    "NO_ROLE_ASSIGNMENT",
    "NO_FINANCE_EXECUTION",
    "NO_LEGAL_CONCLUSION",
    "NO_UAT_ACCEPTANCE",
    "NO_OWNER_GO",
    "NO_PRODUCTION_GO",
  ],
  "EXEC-DASHBOARD-DEPARTMENT-ROLE-LANE-MAP-TOKENS",
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
  /data-heu-executive-legal-sop-required-answer-index="STD-34_EXECUTIVE_LEGAL_SOP_REQUIRED_ANSWER_INDEX"[\s\S]*data-heu-executive-legal-sop-required-answer-boundary="DRAFT_CONTROL PASS_LOCAL_LEGAL_SOP_REQUIRED_ANSWER_INDEX REQUIRED_ANSWER_INDEX PHAP_CHE_REVIEW_REQUIRED SOP_OWNER_SIGNOFF_REQUIRED MAKER_CHECKER_APPROVER_REQUIRED CONTROLLED_EVIDENCE_REQUIRED EXTERNAL_SIGNOFF_REQUIRED NO_LEGAL_ADVICE NO_OFFICIAL_SOP NO_APPROVAL_ACTION NO_FINANCE_ACTION NO_OWNER_GO NO_PRODUCTION_GO"[\s\S]*data-heu-executive-legal-sop-required-answer-overflow-guard="STD-34_NO_OVERFLOW"/,
  "EXEC-DASHBOARD-LEGAL-SOP-REQUIRED-ANSWER-ANCHOR",
  executiveDashboardPath,
);
requireAllText(
  executiveDashboard,
  [
    "ExecutiveLegalSopRequiredAnswerIndex",
    "executiveLegalSopRequiredAnswerIndexRows",
    "STD-34 Required-answer index",
    "PASS_LOCAL_LEGAL_SOP_REQUIRED_ANSWER_INDEX",
    "REQUIRED_ANSWER_INDEX",
    "LAW-IDX-01",
    "LAW-IDX-02",
    "LAW-IDX-03",
    "LAW-IDX-04",
    "LAW-IDX-05",
    "LAW-IDX-06",
    "F01 Lead to student",
    "F02 TTGDTX tuition",
    "F03 Payment and payout",
    "F06 Short Course",
    "M02 Role and sensitive access",
    "M10 Dashboard/report reliance",
    "Can cu",
    "Maker/checker/approver",
    "Chung tu / signer",
    "NO_HANDOVER_RELIANCE",
    "NO_FINANCE_RELIANCE",
    "NO_PAYMENT_EXECUTION",
    "NO_ACCESS_GRANT",
    "NO_DASHBOARD_RELIANCE",
  ],
  "EXEC-DASHBOARD-LEGAL-SOP-REQUIRED-ANSWER-TOKENS",
  executiveDashboardPath,
);
requireText(
  executiveDashboard,
  /data-heu-executive-legal-sop-evidence-authority-queue="STD-40_EXECUTIVE_LEGAL_SOP_EVIDENCE_AUTHORITY_QUEUE"[\s\S]*data-heu-executive-legal-sop-evidence-authority-boundary="DRAFT_CONTROL PASS_LOCAL_LEGAL_SOP_EVIDENCE_AUTHORITY_QUEUE EVIDENCE_AUTHORITY_QUEUE PHAP_CHE_REVIEW_REQUIRED SOP_OWNER_SIGNOFF_REQUIRED MAKER_CHECKER_APPROVER_REQUIRED CONTROLLED_EVIDENCE_REQUIRED EXTERNAL_SIGNOFF_REQUIRED OWNER_SIGNOFF_PENDING NO_LEGAL_ADVICE NO_OFFICIAL_SOP NO_APPROVAL_ACTION NO_FINANCE_ACTION NO_DASHBOARD_RELIANCE NO_REPORT_VIEW_RELIANCE NO_RAW_EVIDENCE_MOVEMENT NO_EVIDENCE_ACCEPTANCE NO_UAT_ACCEPTANCE NO_OWNER_GO NO_PRODUCTION_GO"[\s\S]*data-heu-executive-legal-sop-evidence-authority-overflow-guard="STD-40_NO_OVERFLOW"/,
  "EXEC-DASHBOARD-LEGAL-SOP-EVIDENCE-AUTHORITY-ANCHOR",
  executiveDashboardPath,
);
requireAllText(
  executiveDashboard,
  [
    "ExecutiveLegalSopEvidenceAuthorityQueue",
    "executiveLegalSopEvidenceAuthorityQueueRows",
    "STD-40 Evidence-authority queue",
    "PASS_LOCAL_LEGAL_SOP_EVIDENCE_AUTHORITY_QUEUE",
    "EVIDENCE_AUTHORITY_QUEUE",
    "LAW-QUEUE-01",
    "LAW-QUEUE-02",
    "LAW-QUEUE-03",
    "LAW-QUEUE-04",
    "LAW-QUEUE-05",
    "LAW-QUEUE-06",
    "Legal basis hold",
    "SOP version hold",
    "Maker/checker/approver hold",
    "Controlled evidence hold",
    "External signer hold",
    "Dashboard/report reliance legal hold",
    "Cau tra loi con thieu",
    "Bang chung / tham quyen",
    "Control tiep",
    "NO_RAW_EVIDENCE_MOVEMENT",
    "NO_EVIDENCE_ACCEPTANCE",
    "NO_UAT_ACCEPTANCE",
  ],
  "EXEC-DASHBOARD-LEGAL-SOP-EVIDENCE-AUTHORITY-TOKENS",
  executiveDashboardPath,
);
requireText(
  executiveDashboard,
  /data-heu-executive-legal-sop-triage="STD-25_EXECUTIVE_LEGAL_SOP_TRIAGE"[\s\S]*data-heu-executive-legal-sop-triage-boundary="DRAFT_CONTROL PASS_LOCAL_LEGAL_SOP_TRIAGE PHAP_CHE_REVIEW_REQUIRED SOP_OWNER_SIGNOFF_REQUIRED MAKER_CHECKER_APPROVER_REQUIRED CONTROLLED_EVIDENCE_REQUIRED EXTERNAL_SIGNOFF_REQUIRED NO_LEGAL_ADVICE NO_OFFICIAL_SOP NO_APPROVAL_ACTION NO_FINANCE_ACTION NO_OWNER_GO NO_PRODUCTION_GO"[\s\S]*data-heu-executive-legal-sop-triage-overflow-guard="STD-25_NO_OVERFLOW"/,
  "EXEC-DASHBOARD-LEGAL-SOP-TRIAGE-ANCHOR",
  executiveDashboardPath,
);
requireAllText(
  executiveDashboard,
  [
    "ExecutiveLegalSopTriage",
    "executiveLegalSopTriageRows",
    "STD-25 Legal/SOP triage",
    "PASS_LOCAL_LEGAL_SOP_TRIAGE",
    "PHAP_CHE_REVIEW_REQUIRED",
    "SOP_OWNER_SIGNOFF_REQUIRED",
    "MAKER_CHECKER_APPROVER_REQUIRED",
    "CONTROLLED_EVIDENCE_REQUIRED",
    "EXTERNAL_SIGNOFF_REQUIRED",
    "NO_LEGAL_ADVICE",
    "NO_OFFICIAL_SOP",
    "NO_APPROVAL_ACTION",
    "NO_FINANCE_ACTION",
    "NO_OWNER_GO",
    "NO_PRODUCTION_GO",
    "LEGAL-TRIAGE-01",
    "LEGAL-TRIAGE-02",
    "LEGAL-TRIAGE-03",
    "LEGAL-TRIAGE-04",
    "LEGAL-TRIAGE-05",
    "Legal basis route",
    "SOP version route",
    "Maker/checker/approver route",
    "Controlled evidence route",
    "External signer route",
  ],
  "EXEC-DASHBOARD-LEGAL-SOP-TRIAGE-TOKENS",
  executiveDashboardPath,
);
requireText(
  executiveDashboard,
  /data-heu-executive-legal-sop-authority-checklist="STD-14_LEGAL_SOP_AUTHORITY_CHECKLIST"[\s\S]*data-heu-executive-legal-sop-authority-boundary="DRAFT_CONTROL PHAP_CHE_REVIEW_REQUIRED SOP_OWNER_SIGNOFF_REQUIRED MAKER_CHECKER_APPROVER_REQUIRED CONTROLLED_EVIDENCE_REQUIRED EXTERNAL_SIGNOFF_REQUIRED NO_LEGAL_ADVICE NO_OFFICIAL_SOP NO_FINANCE_ACTION NO_OWNER_GO NO_PRODUCTION_GO"[\s\S]*data-heu-executive-legal-sop-authority-overflow-guard="STD-14_NO_OVERFLOW"/,
  "EXEC-DASHBOARD-LEGAL-SOP-AUTHORITY-ANCHOR",
  executiveDashboardPath,
);
requireAllText(
  executiveDashboard,
  [
    "Authority checklist",
    "AUTH-LEGAL-BASIS",
    "AUTH-SOP-VERSION",
    "AUTH-MAKER",
    "AUTH-CHECKER",
    "AUTH-APPROVER",
    "AUTH-EVIDENCE",
    "AUTH-SIGNER",
    "Can cu phap ly nao?",
    "SOP nao dang ap dung?",
    "Ai nhap / tao du lieu?",
    "Ai kiem tra?",
    "Ai duyet?",
    "Chung tu nam o dau?",
    "Ai ky / chot ben ngoai he thong?",
    "PHAP_CHE_REVIEW_REQUIRED",
    "MAKER_CHECKER_APPROVER_REQUIRED",
    "CONTROLLED_EVIDENCE_REQUIRED",
    "EXTERNAL_SIGNOFF_REQUIRED",
  ],
  "EXEC-DASHBOARD-LEGAL-SOP-AUTHORITY-TOKENS",
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
requireAllText(
  legalMatrix,
  [
    "STD-14 Authority Checklist",
    "STD-14_LEGAL_SOP_AUTHORITY_CHECKLIST",
    "AUTH-LEGAL-BASIS",
    "AUTH-SOP-VERSION",
    "AUTH-MAKER",
    "AUTH-CHECKER",
    "AUTH-APPROVER",
    "AUTH-EVIDENCE",
    "AUTH-SIGNER",
    "NO_GO",
    "BLOCKED",
    "does not provide legal advice",
    "issue official SOP",
    "mark production GO",
  ],
  "LEGAL-MATRIX-STD14-AUTHORITY",
  legalMatrixPath,
);
requireAllText(
  legalMatrix,
  [
    "STD-34 Required Answer Index",
    "STD-34_EXECUTIVE_LEGAL_SOP_REQUIRED_ANSWER_INDEX",
    "PASS_LOCAL_LEGAL_SOP_REQUIRED_ANSWER_INDEX",
    "REQUIRED_ANSWER_INDEX",
    "LAW-IDX-01",
    "LAW-IDX-06",
    "PHAP_CHE_REVIEW_REQUIRED",
    "SOP_OWNER_SIGNOFF_REQUIRED",
    "MAKER_CHECKER_APPROVER_REQUIRED",
    "CONTROLLED_EVIDENCE_REQUIRED",
    "EXTERNAL_SIGNOFF_REQUIRED",
    "NO_LEGAL_ADVICE",
    "NO_OFFICIAL_SOP",
    "mark production GO",
  ],
  "LEGAL-MATRIX-STD34-REQUIRED-ANSWER",
  legalMatrixPath,
);
requireAllText(
  legalMatrix,
  [
    "STD-40 Evidence Authority Queue",
    "STD-40_EXECUTIVE_LEGAL_SOP_EVIDENCE_AUTHORITY_QUEUE",
    "PASS_LOCAL_LEGAL_SOP_EVIDENCE_AUTHORITY_QUEUE",
    "EVIDENCE_AUTHORITY_QUEUE",
    "LAW-QUEUE-01",
    "LAW-QUEUE-06",
    "NO_RAW_EVIDENCE_MOVEMENT",
    "NO_EVIDENCE_ACCEPTANCE",
    "NO_UAT_ACCEPTANCE",
    "does not provide legal advice",
    "issue official SOP",
    "mark production GO",
  ],
  "LEGAL-MATRIX-STD40-EVIDENCE-AUTHORITY",
  legalMatrixPath,
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
    "STD-06",
    "NO_VOUCHER",
    "NO_STATUTORY_ACCOUNTING",
    "STD-07",
    "NO_HIDDEN_NO_GO",
    "STD-08",
    "NO_OVERLAP",
    "STD-09",
    "PASS_LOCAL_VISUAL_QA",
    "AUTH_REQUIRED",
    "NO_SCREENSHOT_CLAIM",
    "STD-10",
    "STD-11",
    "STD-11_EXECUTIVE_PRIORITY_FOCUS_RAIL",
    "NO_STATE_MUTATION",
    "STD-12",
    "HEU_ROLE_LANE_MATRIX",
    "PASS_LOCAL_ROLE_GUARD",
    "NO_ACCESS_GRANT",
    "STD-13",
    "PASS_LOCAL_REPORT_SOURCE_GUARD",
    "NO_DASHBOARD_RELIANCE",
    "STD-14",
    "STD-14_LEGAL_SOP_AUTHORITY_CHECKLIST",
    "PASS_LOCAL_LEGAL_SOP_GUARD",
    "PHAP_CHE_REVIEW_REQUIRED",
    "MAKER_CHECKER_APPROVER_REQUIRED",
    "CONTROLLED_EVIDENCE_REQUIRED",
    "STD-15",
    "STD-15_FINANCE_RELIANCE_SOURCE_CONTRACT",
    "PASS_LOCAL_FINANCE_RELIANCE_GUARD",
    "SOURCE_MAP_REQUIRED",
    "NO_PAYMENT_EXECUTION",
    "STD-16",
    "STD-16_UAT_EVIDENCE_ROUTE_CHECKLIST",
    "PASS_LOCAL_EVIDENCE_ROUTE",
    "SIGNED_UAT_PENDING",
    "NO_EVIDENCE_ACCEPTANCE",
    "STD-17",
    "STD-17_EXECUTIVE_FOCUS_MODE",
    "PASS_LOCAL_FOCUS_MODE",
    "FOCUS_QUERY_PARAM",
    "NO_STATE_MUTATION",
    "STD-18",
    "STD-18_EXECUTIVE_FOCUS_NEXT_ACTION",
    "PASS_LOCAL_NEXT_ACTION",
    "READ_ONLY_ROUTE_HINT",
    "STD-19",
    "STD-19_EXECUTIVE_GLOBAL_FOCUS_SHORTCUTS",
    "PASS_LOCAL_GLOBAL_FOCUS_SHORTCUTS",
    "EXECUTIVE_ONLY",
    "NO_ACCESS_GRANT",
    "NO_PERMISSION_EXPANSION",
    "STD-20",
    "STD-20_EXECUTIVE_FOCUS_LANE_SEPARATION",
    "PASS_LOCAL_FOCUS_LANE_SEPARATION",
    "SEPARATE_FROM_WORKSPACE",
    "STD-21",
    "STD-21_QUICK_LANE_LABELS",
    "PASS_LOCAL_QUICK_LANE_LABELS",
    "COMPACT_LABELS",
    "NO_LONG_COPY",
    "STD-22",
    "STD-22_EXECUTIVE_FOCUS_SCOPED_NAVIGATOR",
    "PASS_LOCAL_FOCUS_SCOPED_NAVIGATOR",
    "VISIBLE_SECTION_LINKS_ONLY",
    "NO_HIDDEN_TARGET_LINK",
    "STD-23",
    "STD-23_EXECUTIVE_ROLE_SCOPE_DECISION_STRIP",
    "PASS_LOCAL_EXECUTIVE_ROLE_SCOPE",
    "P6-04_ROLE_SCOPE_UAT_PENDING",
    "NEGATIVE_ACCESS_PROOF_PENDING",
    "focus=roles",
    "NO_ACCESS_GRANT",
    "NO_PERMISSION_EXPANSION",
    "STD-24",
    "STD-24_EXECUTIVE_REPORT_SOURCE_MAP_TRIAGE",
    "PASS_LOCAL_REPORT_SOURCE_TRIAGE",
    "REPORT_VIEW_MASTER_CONTRACT",
    "DQ-DM-05",
    "OWNER_SIGNOFF_PENDING",
    "CONTROLLED_EVIDENCE_REQUIRED",
    "NO_DASHBOARD_RELIANCE",
    "STD-25",
    "STD-25_EXECUTIVE_LEGAL_SOP_TRIAGE",
    "PASS_LOCAL_LEGAL_SOP_TRIAGE",
    "SOP_OWNER_SIGNOFF_REQUIRED",
    "EXTERNAL_SIGNOFF_REQUIRED",
    "NO_OFFICIAL_SOP",
    "STD-26",
    "STD-26_EXECUTIVE_FINANCE_RELIANCE_TRIAGE",
    "PASS_LOCAL_FINANCE_RELIANCE_TRIAGE",
    "SIGNED_UAT_PENDING",
    "NO_PAYMENT_EXECUTION",
    "NO_BANK_INSTRUCTION",
    "NO_STATUTORY_ACCOUNTING",
    "NO_FINANCE_RELIANCE",
    "STD-27",
    "STD-27_EXECUTIVE_UAT_EVIDENCE_CLOSURE_TRIAGE",
    "PASS_LOCAL_UAT_EVIDENCE_TRIAGE",
    "NO_UAT_EXECUTION",
    "NO_EVIDENCE_ACCEPTANCE",
    "NO_ACCESS_CLOSURE",
    "STD-28",
    "STD-28_EXECUTIVE_PRODUCTION_BLOCKER_TRIAGE",
    "PASS_LOCAL_PRODUCTION_BLOCKER_TRIAGE",
    "BACKUP_RESTORE_PROOF_REQUIRED",
    "MIGRATION_ORDER_SIGNOFF_REQUIRED",
    "NO_MIGRATION_APPROVAL",
    "STD-29",
    "STD-29_EXECUTIVE_PRIORITY_COMMAND_STRIP",
    "PASS_LOCAL_PRIORITY_COMMAND_STRIP",
    "VISIBLE_FOCUS_ONLY",
    "STD-30",
    "STD-30_EXECUTIVE_ACTIVE_FOCUS_HEADER",
    "PASS_LOCAL_ACTIVE_FOCUS_HEADER",
    "ACTIVE_FOCUS_VISIBLE",
    "RETURN_TO_ALL",
    "STD-31",
    "STD-31_EXECUTIVE_GLOBAL_FOCUS_COMPACT_LABELS",
    "PASS_LOCAL_GLOBAL_FOCUS_COMPACT_LABELS",
    "NO_LONG_COPY",
    "STD-32",
    "STD-32_EXECUTIVE_DEPARTMENT_ROLE_LANE_MAP",
    "PASS_LOCAL_DEPARTMENT_ROLE_LANE_MAP",
    "EXECUTIVE_OVERSIGHT",
    "DEPT-TUYEN-SINH",
    "DEPT-KHTC",
    "DEPT-PHAP-CHE",
    "DEPT-IT-DATA",
    "DEPT-AUDIT",
    "NO_ACCOUNT_CREATE",
    "NO_ROLE_ASSIGNMENT",
    "NO_ACCESS_GRANT",
    "NO_PERMISSION_EXPANSION",
    "STD-33",
    "STD-33_EXECUTIVE_REPORT_SOURCE_FAST_INDEX",
    "PASS_LOCAL_REPORT_SOURCE_FAST_INDEX",
    "REPORT_VIEW_SOURCE_INDEX",
    "DQ_DM05_VISIBLE",
    "NO_RAW_SOURCE_OPEN",
    "STD-39",
    "STD-39_EXECUTIVE_REPORT_DASHBOARD_SCOPE_CONTRACT",
    "PASS_LOCAL_REPORT_DASHBOARD_SCOPE_CONTRACT",
    "REPORT_VIEW_TO_DASHBOARD_SCOPE",
    "SCOPE_BOUND_DASHBOARD",
    "NO_REPORT_VIEW_RELIANCE",
    "STD-34",
    "STD-34_EXECUTIVE_LEGAL_SOP_REQUIRED_ANSWER_INDEX",
    "PASS_LOCAL_LEGAL_SOP_REQUIRED_ANSWER_INDEX",
    "REQUIRED_ANSWER_INDEX",
    "LAW-IDX-01",
    "LAW-IDX-06",
    "NO_LEGAL_ADVICE",
    "NO_OFFICIAL_SOP",
    "STD-40",
    "STD-40_EXECUTIVE_LEGAL_SOP_EVIDENCE_AUTHORITY_QUEUE",
    "PASS_LOCAL_LEGAL_SOP_EVIDENCE_AUTHORITY_QUEUE",
    "EVIDENCE_AUTHORITY_QUEUE",
    "LAW-QUEUE-01",
    "LAW-QUEUE-06",
    "NO_RAW_EVIDENCE_MOVEMENT",
    "NO_EVIDENCE_ACCEPTANCE",
    "NO_UAT_ACCEPTANCE",
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
    "NO_EVIDENCE_ACCEPTANCE",
    "STD-36",
    "STD-36_EXECUTIVE_UAT_EVIDENCE_FAST_ACTION_QUEUE",
    "PASS_LOCAL_UAT_EVIDENCE_FAST_ACTION_QUEUE",
    "FAST_ACTION_QUEUE",
    "UAT-FAST-01",
    "UAT-FAST-06",
    "NO_EVIDENCE_UPLOAD",
    "NO_UAT_ACCEPTANCE",
    "NO_EVIDENCE_ACCEPTANCE",
    "NO_ACCESS_CLOSURE",
    "STD-42",
    "STD-42_EXECUTIVE_UAT_EVIDENCE_ACCEPTANCE_LOCK",
    "PASS_LOCAL_UAT_EVIDENCE_ACCEPTANCE_LOCK",
    "ACCEPTANCE_LOCK",
    "UAT-LOCK-01",
    "UAT-LOCK-06",
    "NO_RAW_EVIDENCE_MOVEMENT",
    "NO_HIDDEN_EVIDENCE_MOVEMENT",
    "STD-43",
    "STD-43_EXECUTIVE_OPERATING_BRAIN_COMPLETION_GATE",
    "PASS_LOCAL_EXECUTIVE_OPERATING_BRAIN_COMPLETION",
    "COMPLETION_GATE",
    "BRAIN-GATE-01",
    "BRAIN-GATE-06",
    "BRAIN-GATE-07",
    "Quyen o dau thi chi duoc xem dashboard o day",
    "STD-37",
    "STD-37_EXECUTIVE_DASHBOARD_SCOPE_VISIBILITY_INVARIANT",
    "PASS_LOCAL_DASHBOARD_SCOPE_VISIBILITY",
    "SCOPE_BOUND_DASHBOARD",
    "NO_CROSS_SCOPE_DASHBOARD",
    "ACTIVE_SEGMENT_LIMIT",
    "NON_EXECUTIVE_VISIBLE_SEGMENTS",
    "STD-38",
    "STD-38_EXECUTIVE_DASHBOARD_PERMISSION_MATRIX",
    "PASS_LOCAL_EXECUTIVE_DASHBOARD_PERMISSION_MATRIX",
    "ROUTE_VISIBILITY_MATRIX",
    "runtimePermissionGate",
    "EXEC-PERM-01",
    "EXEC-PERM-07",
    "STD-44",
    "STD-44_EXECUTIVE_EFFECTIVE_ACCESS_READONLY_GATE",
    "PASS_LOCAL_EXECUTIVE_EFFECTIVE_ACCESS_READONLY_GUARD",
    "EXEC-ACCESS-01",
    "EXEC-ACCESS-06",
    "LIVE_EXECUTIVE_PERMISSION_NO_GO",
    "NO_APPROVAL_PERMISSION",
    "NO_PAYMENT_PERMISSION",
  ],
  "BLUEPRINT-STD01-STD39-BOUNDARY",
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
requireAllText(
  implementationLog,
  [
    "STD-06 Executive Finance Read-Only Reliance Proof",
    'data-heu-executive-finance-readonly="STD-06_FINANCE_READONLY_RELIANCE_PROOF"',
    "P2-18",
    "P5-03",
    "FIN-DAY1",
    "ACCT-LOCAL",
    "NO_VOUCHER",
    "NO_BANK_INSTRUCTION",
    "NO_STATUTORY_ACCOUNTING",
    "does not post vouchers",
    "mark production GO",
  ],
  "IMPLEMENTATION-LOG-STD06",
  implementationLogPath,
);
requireAllText(
  implementationLog,
  [
    "STD-07 Executive Section Navigator",
    'data-heu-executive-section-navigator="STD-07_EXECUTIVE_SECTION_NAVIGATOR"',
    "Executive focus",
    "NO_HIDDEN_NO_GO",
    "NO_APPROVAL_ACTION",
    "does not hide NO-GO",
    "mark production GO",
  ],
  "IMPLEMENTATION-LOG-STD07",
  implementationLogPath,
);
requireAllText(
  implementationLog,
  [
    "STD-08 Executive Responsive Density And Section Order",
    'data-heu-executive-responsive-density="STD-08_RESPONSIVE_DENSITY_SECTION_ORDER"',
    "scroll-mt-24",
    "NO_HIDDEN_BLOCKERS",
    "NO_OVERLAP",
    "does not hide blockers",
    "mark production GO",
  ],
  "IMPLEMENTATION-LOG-STD08",
  implementationLogPath,
);
requireAllText(
  implementationLog,
  [
    "STD-09 Executive Dashboard Visual QA Guard",
    'data-heu-executive-visual-qa="STD-09_EXECUTIVE_VISUAL_QA_SOURCE_GUARD"',
    "check-heu-executive-dashboard-visual-qa.mjs",
    "check:heu-executive-dashboard-visual-qa",
    "PASS_LOCAL_VISUAL_QA",
    "AUTH_REQUIRED",
    "NO_SCREENSHOT_CLAIM",
    /does not\s+claim authenticated screenshots/i,
    "mark production GO",
  ],
  "IMPLEMENTATION-LOG-STD09",
  implementationLogPath,
);
requireAllText(
  implementationLog,
  [
    "STD-11 Executive Priority Focus Rail",
    'data-heu-executive-priority-focus="STD-11_EXECUTIVE_PRIORITY_FOCUS_RAIL"',
    "FIN",
    "LAW",
    "RPT",
    "ROL",
    "BLK",
    "NO_HIDDEN_NO_GO",
    "NO_STATE_MUTATION",
    /does not[\s\S]*mutate workflow state/i,
    "mark production GO",
  ],
  "IMPLEMENTATION-LOG-STD11",
  implementationLogPath,
);
requireAllText(
  implementationLog,
  [
    "STD-12 Role Lane Governance Matrix",
    "lib/heu-role-lanes.ts",
    "check:heu-role-lane-governance",
    "PASS_LOCAL_ROLE_GUARD",
    "NO_ACCESS_GRANT",
    "NO_FINANCE_EXECUTION",
    "NO_LEGAL_CONCLUSION",
    "does not grant access",
    "mark production GO",
  ],
  "IMPLEMENTATION-LOG-STD12",
  implementationLogPath,
);
requireAllText(
  implementationLog,
  [
    "STD-14 Legal SOP Authority Checklist",
    'data-heu-executive-legal-sop-authority-checklist="STD-14_LEGAL_SOP_AUTHORITY_CHECKLIST"',
    "check-heu-legal-sop-authority-readiness.mjs",
    "PASS_LOCAL_LEGAL_SOP_GUARD",
    "AUTH-LEGAL-BASIS",
    "AUTH-SIGNER",
    "does not provide legal advice",
    "mark production GO",
  ],
  "IMPLEMENTATION-LOG-STD14",
  implementationLogPath,
);
requireAllText(
  implementationLog,
  [
    "STD-15 Finance Reliance Source Contract",
    'data-heu-executive-finance-source-contract="STD-15_FINANCE_RELIANCE_SOURCE_CONTRACT"',
    "FIN-SRC-01",
    "FIN-SRC-05",
    "SOURCE_MAP_REQUIRED",
    "PASS_LOCAL_FINANCE_RELIANCE_GUARD",
    "does not post vouchers",
    "mark production GO",
  ],
  "IMPLEMENTATION-LOG-STD15",
  implementationLogPath,
);
requireAllText(
  implementationLog,
  [
    "STD-16 Executive UAT Evidence Route",
    'data-heu-executive-uat-evidence-route="STD-16_UAT_EVIDENCE_ROUTE_CHECKLIST"',
    "UAT-EVID-01",
    "UAT-EVID-05",
    "PASS_LOCAL_EVIDENCE_ROUTE",
    "check:heu-uat-evidence-route-readiness",
    "does not execute UAT",
    "mark production GO",
  ],
  "IMPLEMENTATION-LOG-STD16",
  implementationLogPath,
);
requireAllText(
  implementationLog,
  [
    "STD-17 Executive Focus Mode",
    'data-heu-executive-focus-mode="STD-17_EXECUTIVE_FOCUS_MODE"',
    "focus=reports",
    "focus=finance",
    "focus=evidence",
    "focus=roles",
    "focus=legal",
    "focus=modules",
    "focus=blockers",
    "check:heu-executive-focus-mode-readiness",
    "PASS_LOCAL_FOCUS_MODE",
    "PASS_LOCAL_EXECUTIVE_ROLE_SCOPE",
    "does not mutate workflow state",
    "mark production GO",
  ],
  "IMPLEMENTATION-LOG-STD17",
  implementationLogPath,
);
requireAllText(
  implementationLog,
  [
    "STD-18 Executive Focus Next Action",
    'data-heu-executive-focus-next-action="STD-18_EXECUTIVE_FOCUS_NEXT_ACTION"',
    "NEXT-ALL",
    "NEXT-RPT",
    "NEXT-FIN",
    "NEXT-EVD",
    "NEXT-LAW",
    "NEXT-M12",
    "NEXT-BLK",
    "check:heu-executive-focus-next-action-readiness",
    "PASS_LOCAL_NEXT_ACTION",
    "does not mutate workflow state",
    "mark production GO",
  ],
  "IMPLEMENTATION-LOG-STD18",
  implementationLogPath,
);
requireAllText(
  implementationLog,
  [
    "STD-19 Executive Global Focus Shortcuts",
    'data-heu-executive-global-focus-shortcuts="STD-19_EXECUTIVE_GLOBAL_FOCUS_SHORTCUTS"',
    "Tổng quan",
    "Báo cáo",
    "Tài chính",
    "Bằng chứng",
    "Phân quyền",
    "Pháp chế",
    "M01-M12",
    "Blocker",
    "check:heu-executive-global-focus-shortcuts-readiness",
    "PASS_LOCAL_GLOBAL_FOCUS_SHORTCUTS",
    "PASS_LOCAL_EXECUTIVE_ROLE_SCOPE",
    "does not grant access",
    "mark production GO",
  ],
  "IMPLEMENTATION-LOG-STD19",
  implementationLogPath,
);
requireAllText(
  implementationLog,
  [
    "STD-20 Executive Focus Lane Separation",
    'data-heu-executive-focus-lane-separation="STD-20_EXECUTIVE_FOCUS_LANE_SEPARATION"',
    "executive focus lane",
    "P0-13 workspace quick strip",
    "check:heu-executive-focus-lane-separation-readiness",
    "PASS_LOCAL_FOCUS_LANE_SEPARATION",
    "does not grant access",
    "mark production GO",
  ],
  "IMPLEMENTATION-LOG-STD20",
  implementationLogPath,
);
requireAllText(
  implementationLog,
  [
    "STD-21 AppShell Quick Lane Labels",
    'data-heu-quick-lane-labels="STD-21_QUICK_LANE_LABELS"',
    'data-heu-workspace-quick-lane-label="STD-21_WORKSPACE_QUICK_LANE_LABEL"',
    "BGH focus",
    "Workspace",
    "check:heu-appshell-quick-lane-labels-readiness",
    "PASS_LOCAL_QUICK_LANE_LABELS",
    "does not grant access",
    "mark production GO",
  ],
  "IMPLEMENTATION-LOG-STD21",
  implementationLogPath,
);
requireAllText(
  implementationLog,
  [
    "STD-22 Executive Focus Scoped Navigator",
    'data-heu-executive-focus-scoped-navigator="STD-22_EXECUTIVE_FOCUS_SCOPED_NAVIGATOR"',
    "visibleSectionNavItems",
    "VISIBLE_SECTION_LINKS_ONLY",
    "NO_HIDDEN_TARGET_LINK",
    "check:heu-executive-focus-scoped-navigator-readiness",
    "PASS_LOCAL_FOCUS_SCOPED_NAVIGATOR",
    "does not mutate workflow state",
    "mark production GO",
  ],
  "IMPLEMENTATION-LOG-STD22",
  implementationLogPath,
);
requireAllText(
  implementationLog,
  [
    "STD-23 Executive Role Scope Focus",
    'data-heu-executive-role-scope-decision="STD-23_EXECUTIVE_ROLE_SCOPE_DECISION_STRIP"',
    "STD-23_EXECUTIVE_ROLE_SCOPE_FOCUS_SHORTCUT",
    "Phân quyền",
    "focus=roles",
    "EXEC-ROLE-01",
    "EXEC-ROLE-04",
    "PASS_LOCAL_EXECUTIVE_ROLE_SCOPE",
    "check:heu-executive-role-scope-focus-readiness",
    "does not grant access",
    "mark production GO",
  ],
  "IMPLEMENTATION-LOG-STD23",
  implementationLogPath,
);
requireAllText(
  implementationLog,
  [
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
requireAllText(
  implementationLog,
  [
    "STD-33 Executive Report Source Fast Index",
    'data-heu-executive-report-source-fast-index="STD-33_EXECUTIVE_REPORT_SOURCE_FAST_INDEX"',
    "RPT-IDX-01",
    "RPT-IDX-06",
    "PASS_LOCAL_REPORT_SOURCE_FAST_INDEX",
    "check:heu-executive-report-source-fast-index-readiness",
    "does not approve report-view reliance",
    "mark production GO",
  ],
  "IMPLEMENTATION-LOG-STD33",
  implementationLogPath,
);
requireAllText(
  implementationLog,
  [
    "STD-34 Executive Legal SOP Required Answer Index",
    'data-heu-executive-legal-sop-required-answer-index="STD-34_EXECUTIVE_LEGAL_SOP_REQUIRED_ANSWER_INDEX"',
    "LAW-IDX-01",
    "LAW-IDX-06",
    "PASS_LOCAL_LEGAL_SOP_REQUIRED_ANSWER_INDEX",
    "check:heu-executive-legal-sop-required-answer-index-readiness",
    /does not provide legal advice/i,
    "mark production GO",
  ],
  "IMPLEMENTATION-LOG-STD34",
  implementationLogPath,
);
requireAllText(
  implementationLog,
  [
    "STD-40 Executive Legal SOP Evidence Authority Queue",
    'data-heu-executive-legal-sop-evidence-authority-queue="STD-40_EXECUTIVE_LEGAL_SOP_EVIDENCE_AUTHORITY_QUEUE"',
    "LAW-QUEUE-01",
    "LAW-QUEUE-06",
    "PASS_LOCAL_LEGAL_SOP_EVIDENCE_AUTHORITY_QUEUE",
    "check:heu-executive-legal-sop-evidence-authority-queue-readiness",
    /does not provide legal advice/i,
    "mark production GO",
  ],
  "IMPLEMENTATION-LOG-STD40",
  implementationLogPath,
);
requireAllText(
  implementationLog,
  [
    "STD-25 Executive Legal SOP Triage",
    'data-heu-executive-legal-sop-triage="STD-25_EXECUTIVE_LEGAL_SOP_TRIAGE"',
    "LEGAL-TRIAGE-01",
    "LEGAL-TRIAGE-05",
    "PASS_LOCAL_LEGAL_SOP_TRIAGE",
    "check:heu-executive-legal-sop-triage-readiness",
    /does not provide legal advice/i,
    "mark production GO",
  ],
  "IMPLEMENTATION-LOG-STD25",
  implementationLogPath,
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
    /does not approve\s+finance reliance/i,
    "mark production GO",
  ],
  "IMPLEMENTATION-LOG-STD35",
  implementationLogPath,
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
requireAllText(
  implementationLog,
  [
    "STD-26 Executive Finance Reliance Triage",
    'data-heu-executive-finance-reliance-triage="STD-26_EXECUTIVE_FINANCE_RELIANCE_TRIAGE"',
    "FIN-REL-01",
    "FIN-REL-05",
    "PASS_LOCAL_FINANCE_RELIANCE_TRIAGE",
    "check:heu-executive-finance-reliance-triage-readiness",
    /does not approve\s+finance reliance/i,
    "mark production GO",
  ],
  "IMPLEMENTATION-LOG-STD26",
  implementationLogPath,
);
requireAllText(
  implementationLog,
  [
    "STD-27 Executive UAT Evidence Triage",
    'data-heu-executive-uat-evidence-closure-triage="STD-27_EXECUTIVE_UAT_EVIDENCE_CLOSURE_TRIAGE"',
    "UAT-CLOSE-01",
    "UAT-CLOSE-05",
    "PASS_LOCAL_UAT_EVIDENCE_TRIAGE",
    "check:heu-executive-uat-evidence-triage-readiness",
    /does not execute UAT/i,
    "accept evidence",
    "mark production GO",
  ],
  "IMPLEMENTATION-LOG-STD27",
  implementationLogPath,
);
requireAllText(
  implementationLog,
  [
    "STD-36 Executive UAT Evidence Fast Action Queue",
    'data-heu-executive-uat-evidence-fast-action="STD-36_EXECUTIVE_UAT_EVIDENCE_FAST_ACTION_QUEUE"',
    "UAT-FAST-01",
    "UAT-FAST-06",
    "PASS_LOCAL_UAT_EVIDENCE_FAST_ACTION_QUEUE",
    "check:heu-executive-uat-evidence-fast-action-readiness",
    /does not upload evidence/i,
    "accept evidence",
    "mark production GO",
  ],
  "IMPLEMENTATION-LOG-STD36",
  implementationLogPath,
);
requireAllText(
  implementationLog,
  [
    "STD-42 Executive UAT Evidence Acceptance Lock",
    'data-heu-executive-uat-evidence-acceptance-lock="STD-42_EXECUTIVE_UAT_EVIDENCE_ACCEPTANCE_LOCK"',
    "UAT-LOCK-01",
    "UAT-LOCK-06",
    "PASS_LOCAL_UAT_EVIDENCE_ACCEPTANCE_LOCK",
    "check:heu-executive-uat-evidence-acceptance-lock-readiness",
    /does not collect evidence/i,
    "accept evidence",
    "mark production GO",
  ],
  "IMPLEMENTATION-LOG-STD42",
  implementationLogPath,
);
requireAllText(
  implementationLog,
  [
    "STD-43 Executive Operating Brain Completion Gate",
    'data-heu-executive-operating-brain-completion="STD-43_EXECUTIVE_OPERATING_BRAIN_COMPLETION_GATE"',
    "BRAIN-GATE-01",
    "BRAIN-GATE-06",
    "BRAIN-GATE-07",
    "STD-44",
    "LIVE_EXECUTIVE_PERMISSION_NO_GO",
    "PASS_LOCAL_EXECUTIVE_OPERATING_BRAIN_COMPLETION",
    "check:heu-executive-operating-brain-completion-readiness",
    /does not grant access/i,
    "accept evidence",
    "mark production GO",
  ],
  "IMPLEMENTATION-LOG-STD43",
  implementationLogPath,
);
requireAllText(
  implementationLog,
  [
    "STD-44 Executive Effective Access Read-Only Gate",
    'data-heu-executive-effective-access-readonly="STD-44_EXECUTIVE_EFFECTIVE_ACCESS_READONLY_GATE"',
    "EXEC-ACCESS-01",
    "EXEC-ACCESS-06",
    "PASS_LOCAL_EXECUTIVE_EFFECTIVE_ACCESS_READONLY_GUARD",
    "LIVE_EXECUTIVE_PERMISSION_NO_GO",
    "check:heu-executive-effective-access-readonly-readiness",
    /does not change role permissions/i,
    "approve finance action",
    "mark production GO",
  ],
  "IMPLEMENTATION-LOG-STD44",
  implementationLogPath,
);
requireAllText(
  implementationLog,
  [
    "STD-28 Executive Production Blocker Triage",
    'data-heu-executive-production-blocker-triage="STD-28_EXECUTIVE_PRODUCTION_BLOCKER_TRIAGE"',
    "BLK-CLOSE-01",
    "BLK-CLOSE-05",
    "PASS_LOCAL_PRODUCTION_BLOCKER_TRIAGE",
    "check:heu-executive-production-blocker-triage-readiness",
    /does not approve\s+waiver/i,
    "owner GO/NO-GO",
    "mark production GO",
  ],
  "IMPLEMENTATION-LOG-STD28",
  implementationLogPath,
);
requireAllText(
  implementationLog,
  [
    "STD-29 Executive Priority Command Strip",
    'data-heu-executive-priority-command-strip="STD-29_EXECUTIVE_PRIORITY_COMMAND_STRIP"',
    "PASS_LOCAL_PRIORITY_COMMAND_STRIP",
    "focusHref(item.focusMode)",
    "VISIBLE_FOCUS_ONLY",
    "check:heu-executive-priority-command-strip-readiness",
    /does not grant access/i,
    "mutate workflow state",
    "mark production GO",
  ],
  "IMPLEMENTATION-LOG-STD29",
  implementationLogPath,
);
requireAllText(
  implementationLog,
  [
    "STD-30 Executive Active Focus Header",
    'data-heu-executive-active-focus-header="STD-30_EXECUTIVE_ACTIVE_FOCUS_HEADER"',
    "PASS_LOCAL_ACTIVE_FOCUS_HEADER",
    "ACTIVE_FOCUS_VISIBLE",
    "RETURN_TO_ALL",
    "check:heu-executive-active-focus-header-readiness",
    /does not grant access/i,
    "mutate workflow state",
    "mark production GO",
  ],
  "IMPLEMENTATION-LOG-STD30",
  implementationLogPath,
);
requireAllText(
  implementationLog,
  [
    "STD-31 Executive Global Focus Compact Labels",
    'data-heu-executive-focus-compact-labels="STD-31_EXECUTIVE_GLOBAL_FOCUS_COMPACT_LABELS"',
    "Tổng quan",
    "Báo cáo",
    "Tài chính",
    "Bằng chứng",
    "Phân quyền",
    "Pháp chế",
    "M01-M12",
    "Blocker",
    "check:heu-executive-global-focus-compact-labels-readiness",
    "PASS_LOCAL_GLOBAL_FOCUS_COMPACT_LABELS",
    "does not grant access",
    "mark production GO",
  ],
  "IMPLEMENTATION-LOG-STD31",
  implementationLogPath,
);
requireAllText(
  implementationLog,
  [
    "STD-32 Executive Department Role Lane Map",
    "HEU_DEPARTMENT_ROLE_LANE_MAP",
    'data-heu-executive-department-role-lane-map="STD-32_EXECUTIVE_DEPARTMENT_ROLE_LANE_MAP"',
    "DEPT-TUYEN-SINH",
    "DEPT-AUDIT",
    "PASS_LOCAL_DEPARTMENT_ROLE_LANE_MAP",
    "check:heu-executive-department-role-lane-map-readiness",
    "does not create accounts",
    "assign roles",
    "mark production GO",
  ],
  "IMPLEMENTATION-LOG-STD32",
  implementationLogPath,
);
requireAllText(
  implementationLog,
  [
    "STD-37 Executive Dashboard Scope Visibility Invariant",
    'data-heu-executive-dashboard-scope-visibility="STD-37_EXECUTIVE_DASHBOARD_SCOPE_VISIBILITY_INVARIANT"',
    "SCOPE-VIS-01",
    "SCOPE-VIS-05",
    "PASS_LOCAL_DASHBOARD_SCOPE_VISIBILITY",
    "check:heu-dashboard-scope-visibility-invariant-readiness",
    /does not grant access/i,
    "cross-scope dashboard",
    "mark production GO",
  ],
  "IMPLEMENTATION-LOG-STD37",
  implementationLogPath,
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
requireAllText(
  implementationLog,
  [
    "STD-38 Executive Dashboard Permission Matrix",
    'data-heu-executive-dashboard-permission-matrix="STD-38_EXECUTIVE_DASHBOARD_PERMISSION_MATRIX"',
    "EXEC-PERM-01",
    "EXEC-PERM-07",
    "PASS_LOCAL_EXECUTIVE_DASHBOARD_PERMISSION_MATRIX",
    "check:heu-executive-dashboard-permission-matrix-readiness",
    /does not grant access/i,
    "permission expansion",
    "mark production GO",
  ],
  "IMPLEMENTATION-LOG-STD38",
  implementationLogPath,
);

if (
  packageJson.scripts?.["check:heu-executive-dashboard-readiness"] !==
  "node scripts/check-heu-executive-dashboard-readiness.mjs"
) {
  fail("package.json missing check:heu-executive-dashboard-readiness script");
}

console.log("READY PACKAGE-SCRIPT");
if (
  packageJson.scripts?.["check:heu-executive-dashboard-visual-qa"] !==
  "node scripts/check-heu-executive-dashboard-visual-qa.mjs"
) {
  fail("package.json missing check:heu-executive-dashboard-visual-qa script");
}

console.log("READY PACKAGE-VISUAL-QA-SCRIPT");
if (
  packageJson.scripts?.[
    "check:heu-executive-operating-brain-completion-readiness"
  ] !==
  "node scripts/check-heu-executive-operating-brain-completion-readiness.mjs"
) {
  fail(
    "package.json missing check:heu-executive-operating-brain-completion-readiness script",
  );
}

console.log("READY PACKAGE-EXECUTIVE-OPERATING-BRAIN-COMPLETION-SCRIPT");
if (
  packageJson.scripts?.[
    "check:heu-executive-effective-access-readonly-readiness"
  ] !==
  "node scripts/check-heu-executive-effective-access-readonly-readiness.mjs"
) {
  fail(
    "package.json missing check:heu-executive-effective-access-readonly-readiness script",
  );
}

console.log("READY PACKAGE-EXECUTIVE-EFFECTIVE-ACCESS-READONLY-SCRIPT");
if (
  packageJson.scripts?.["check:heu-role-lane-governance"] !==
  "node scripts/check-heu-role-lane-governance.mjs"
) {
  fail("package.json missing check:heu-role-lane-governance script");
}

console.log("READY PACKAGE-ROLE-LANE-GOVERNANCE-SCRIPT");
if (
  packageJson.scripts?.["check:heu-legal-sop-authority-readiness"] !==
  "node scripts/check-heu-legal-sop-authority-readiness.mjs"
) {
  fail("package.json missing check:heu-legal-sop-authority-readiness script");
}

console.log("READY PACKAGE-LEGAL-SOP-AUTHORITY-SCRIPT");
if (
  packageJson.scripts?.["check:heu-uat-evidence-route-readiness"] !==
  "node scripts/check-heu-uat-evidence-route-readiness.mjs"
) {
  fail("package.json missing check:heu-uat-evidence-route-readiness script");
}

console.log("READY PACKAGE-UAT-EVIDENCE-ROUTE-SCRIPT");
if (
  packageJson.scripts?.["check:heu-executive-focus-mode-readiness"] !==
  "node scripts/check-heu-executive-focus-mode-readiness.mjs"
) {
  fail("package.json missing check:heu-executive-focus-mode-readiness script");
}

console.log("READY PACKAGE-EXECUTIVE-FOCUS-MODE-SCRIPT");
if (
  packageJson.scripts?.["check:heu-executive-focus-next-action-readiness"] !==
  "node scripts/check-heu-executive-focus-next-action-readiness.mjs"
) {
  fail(
    "package.json missing check:heu-executive-focus-next-action-readiness script",
  );
}

console.log("READY PACKAGE-EXECUTIVE-FOCUS-NEXT-ACTION-SCRIPT");
if (
  packageJson.scripts?.[
    "check:heu-executive-global-focus-shortcuts-readiness"
  ] !== "node scripts/check-heu-executive-global-focus-shortcuts-readiness.mjs"
) {
  fail(
    "package.json missing check:heu-executive-global-focus-shortcuts-readiness script",
  );
}

console.log("READY PACKAGE-EXECUTIVE-GLOBAL-FOCUS-SHORTCUTS-SCRIPT");
if (
  packageJson.scripts?.[
    "check:heu-executive-global-focus-compact-labels-readiness"
  ] !==
  "node scripts/check-heu-executive-global-focus-compact-labels-readiness.mjs"
) {
  fail(
    "package.json missing check:heu-executive-global-focus-compact-labels-readiness script",
  );
}

console.log("READY PACKAGE-EXECUTIVE-GLOBAL-FOCUS-COMPACT-LABELS-SCRIPT");
if (
  packageJson.scripts?.[
    "check:heu-executive-focus-lane-separation-readiness"
  ] !== "node scripts/check-heu-executive-focus-lane-separation-readiness.mjs"
) {
  fail(
    "package.json missing check:heu-executive-focus-lane-separation-readiness script",
  );
}

console.log("READY PACKAGE-EXECUTIVE-FOCUS-LANE-SEPARATION-SCRIPT");
if (
  packageJson.scripts?.["check:heu-appshell-quick-lane-labels-readiness"] !==
  "node scripts/check-heu-appshell-quick-lane-labels-readiness.mjs"
) {
  fail("package.json missing check:heu-appshell-quick-lane-labels-readiness script");
}

console.log("READY PACKAGE-APPSHELL-QUICK-LANE-LABELS-SCRIPT");
if (
  packageJson.scripts?.[
    "check:heu-executive-focus-scoped-navigator-readiness"
  ] !== "node scripts/check-heu-executive-focus-scoped-navigator-readiness.mjs"
) {
  fail(
    "package.json missing check:heu-executive-focus-scoped-navigator-readiness script",
  );
}

console.log("READY PACKAGE-EXECUTIVE-FOCUS-SCOPED-NAVIGATOR-SCRIPT");
if (
  packageJson.scripts?.["check:heu-executive-role-scope-focus-readiness"] !==
  "node scripts/check-heu-executive-role-scope-focus-readiness.mjs"
) {
  fail(
    "package.json missing check:heu-executive-role-scope-focus-readiness script",
  );
}

console.log("READY PACKAGE-EXECUTIVE-ROLE-SCOPE-FOCUS-SCRIPT");
if (
  packageJson.scripts?.[
    "check:heu-dashboard-scope-visibility-invariant-readiness"
  ] !==
  "node scripts/check-heu-dashboard-scope-visibility-invariant-readiness.mjs"
) {
  fail(
    "package.json missing check:heu-dashboard-scope-visibility-invariant-readiness script",
  );
}

console.log("READY PACKAGE-DASHBOARD-SCOPE-VISIBILITY-SCRIPT");
if (
  packageJson.scripts?.[
    "check:heu-executive-dashboard-permission-matrix-readiness"
  ] !==
  "node scripts/check-heu-executive-dashboard-permission-matrix-readiness.mjs"
) {
  fail(
    "package.json missing check:heu-executive-dashboard-permission-matrix-readiness script",
  );
}

console.log("READY PACKAGE-EXECUTIVE-DASHBOARD-PERMISSION-MATRIX-SCRIPT");
if (
  packageJson.scripts?.[
    "check:heu-executive-department-role-lane-map-readiness"
  ] !==
  "node scripts/check-heu-executive-department-role-lane-map-readiness.mjs"
) {
  fail(
    "package.json missing check:heu-executive-department-role-lane-map-readiness script",
  );
}

console.log("READY PACKAGE-EXECUTIVE-DEPARTMENT-ROLE-LANE-MAP-SCRIPT");
if (
  packageJson.scripts?.[
    "check:heu-executive-report-source-fast-index-readiness"
  ] !==
  "node scripts/check-heu-executive-report-source-fast-index-readiness.mjs"
) {
  fail(
    "package.json missing check:heu-executive-report-source-fast-index-readiness script",
  );
}

console.log("READY PACKAGE-EXECUTIVE-REPORT-SOURCE-FAST-INDEX-SCRIPT");
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

console.log("READY PACKAGE-EXECUTIVE-REPORT-DASHBOARD-SCOPE-CONTRACT-SCRIPT");
if (
  packageJson.scripts?.[
    "check:heu-executive-report-source-map-triage-readiness"
  ] !== "node scripts/check-heu-executive-report-source-map-triage-readiness.mjs"
) {
  fail(
    "package.json missing check:heu-executive-report-source-map-triage-readiness script",
  );
}

console.log("READY PACKAGE-EXECUTIVE-REPORT-SOURCE-MAP-TRIAGE-SCRIPT");
if (
  packageJson.scripts?.[
    "check:heu-executive-legal-sop-required-answer-index-readiness"
  ] !==
  "node scripts/check-heu-executive-legal-sop-required-answer-index-readiness.mjs"
) {
  fail(
    "package.json missing check:heu-executive-legal-sop-required-answer-index-readiness script",
  );
}

console.log("READY PACKAGE-EXECUTIVE-LEGAL-SOP-REQUIRED-ANSWER-INDEX-SCRIPT");
if (
  packageJson.scripts?.[
    "check:heu-executive-legal-sop-evidence-authority-queue-readiness"
  ] !==
  "node scripts/check-heu-executive-legal-sop-evidence-authority-queue-readiness.mjs"
) {
  fail(
    "package.json missing check:heu-executive-legal-sop-evidence-authority-queue-readiness script",
  );
}

console.log("READY PACKAGE-EXECUTIVE-LEGAL-SOP-EVIDENCE-AUTHORITY-QUEUE-SCRIPT");
if (
  packageJson.scripts?.[
    "check:heu-executive-legal-sop-triage-readiness"
  ] !== "node scripts/check-heu-executive-legal-sop-triage-readiness.mjs"
) {
  fail(
    "package.json missing check:heu-executive-legal-sop-triage-readiness script",
  );
}

console.log("READY PACKAGE-EXECUTIVE-LEGAL-SOP-TRIAGE-SCRIPT");
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

console.log("READY PACKAGE-EXECUTIVE-FINANCE-RELIANCE-FAST-INDEX-SCRIPT");
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

console.log("READY PACKAGE-EXECUTIVE-FINANCE-READONLY-RELIANCE-LOCK-SCRIPT");
if (
  packageJson.scripts?.[
    "check:heu-executive-finance-reliance-triage-readiness"
  ] !== "node scripts/check-heu-executive-finance-reliance-triage-readiness.mjs"
) {
  fail(
    "package.json missing check:heu-executive-finance-reliance-triage-readiness script",
  );
}

console.log("READY PACKAGE-EXECUTIVE-FINANCE-RELIANCE-TRIAGE-SCRIPT");
if (
  packageJson.scripts?.[
    "check:heu-executive-uat-evidence-triage-readiness"
  ] !== "node scripts/check-heu-executive-uat-evidence-triage-readiness.mjs"
) {
  fail(
    "package.json missing check:heu-executive-uat-evidence-triage-readiness script",
  );
}

console.log("READY PACKAGE-EXECUTIVE-UAT-EVIDENCE-TRIAGE-SCRIPT");
if (
  packageJson.scripts?.[
    "check:heu-executive-uat-evidence-fast-action-readiness"
  ] !==
  "node scripts/check-heu-executive-uat-evidence-fast-action-readiness.mjs"
) {
  fail(
    "package.json missing check:heu-executive-uat-evidence-fast-action-readiness script",
  );
}

console.log("READY PACKAGE-EXECUTIVE-UAT-EVIDENCE-FAST-ACTION-SCRIPT");
if (
  packageJson.scripts?.[
    "check:heu-executive-uat-evidence-acceptance-lock-readiness"
  ] !==
  "node scripts/check-heu-executive-uat-evidence-acceptance-lock-readiness.mjs"
) {
  fail(
    "package.json missing check:heu-executive-uat-evidence-acceptance-lock-readiness script",
  );
}

console.log("READY PACKAGE-EXECUTIVE-UAT-EVIDENCE-ACCEPTANCE-LOCK-SCRIPT");
if (
  packageJson.scripts?.[
    "check:heu-executive-production-blocker-triage-readiness"
  ] !== "node scripts/check-heu-executive-production-blocker-triage-readiness.mjs"
) {
  fail(
    "package.json missing check:heu-executive-production-blocker-triage-readiness script",
  );
}

console.log("READY PACKAGE-EXECUTIVE-PRODUCTION-BLOCKER-TRIAGE-SCRIPT");
if (
  packageJson.scripts?.[
    "check:heu-executive-priority-command-strip-readiness"
  ] !== "node scripts/check-heu-executive-priority-command-strip-readiness.mjs"
) {
  fail(
    "package.json missing check:heu-executive-priority-command-strip-readiness script",
  );
}

console.log("READY PACKAGE-EXECUTIVE-PRIORITY-COMMAND-STRIP-SCRIPT");
if (
  packageJson.scripts?.["check:heu-executive-active-focus-header-readiness"] !==
  "node scripts/check-heu-executive-active-focus-header-readiness.mjs"
) {
  fail("package.json missing check:heu-executive-active-focus-header-readiness script");
}

console.log("READY PACKAGE-EXECUTIVE-ACTIVE-FOCUS-HEADER-SCRIPT");
console.log(
  "EXECUTIVE_DASHBOARD_READY / NO_GO / BLOCKED: PASS_LOCAL_UI with PASS_LOCAL_EXECUTIVE_OPERATING_BRAIN_COMPLETION, PASS_LOCAL_EXECUTIVE_EFFECTIVE_ACCESS_READONLY_GUARD, PASS_LOCAL_VISUAL_QA source guard, read-only priority focus rail, PASS_LOCAL_PRIORITY_COMMAND_STRIP, PASS_LOCAL_ACTIVE_FOCUS_HEADER, PASS_LOCAL_ROLE_GUARD, PASS_LOCAL_DEPARTMENT_ROLE_LANE_MAP, PASS_LOCAL_DASHBOARD_SCOPE_VISIBILITY, PASS_LOCAL_EXECUTIVE_DASHBOARD_PERMISSION_MATRIX, PASS_LOCAL_REPORT_SOURCE_FAST_INDEX, PASS_LOCAL_REPORT_DASHBOARD_SCOPE_CONTRACT, PASS_LOCAL_REPORT_SOURCE_TRIAGE, PASS_LOCAL_FINANCE_RELIANCE_FAST_INDEX, PASS_LOCAL_FINANCE_READONLY_RELIANCE_LOCK, PASS_LOCAL_FINANCE_RELIANCE_TRIAGE, PASS_LOCAL_UAT_EVIDENCE_FAST_ACTION_QUEUE, PASS_LOCAL_UAT_EVIDENCE_ACCEPTANCE_LOCK, PASS_LOCAL_UAT_EVIDENCE_TRIAGE, PASS_LOCAL_PRODUCTION_BLOCKER_TRIAGE, PASS_LOCAL_LEGAL_SOP_REQUIRED_ANSWER_INDEX, PASS_LOCAL_LEGAL_SOP_EVIDENCE_AUTHORITY_QUEUE, PASS_LOCAL_LEGAL_SOP_TRIAGE, PASS_LOCAL_LEGAL_SOP_GUARD, PASS_LOCAL_FINANCE_RELIANCE_GUARD, PASS_LOCAL_EVIDENCE_ROUTE, PASS_LOCAL_FOCUS_MODE, PASS_LOCAL_NEXT_ACTION, PASS_LOCAL_GLOBAL_FOCUS_SHORTCUTS, PASS_LOCAL_GLOBAL_FOCUS_COMPACT_LABELS, PASS_LOCAL_FOCUS_LANE_SEPARATION, PASS_LOCAL_QUICK_LANE_LABELS, PASS_LOCAL_FOCUS_SCOPED_NAVIGATOR and PASS_LOCAL_EXECUTIVE_ROLE_SCOPE. This check does not create accounts, assign roles, grant access, expand permissions, open raw source, mutate workflow state, create approval actions, claim authenticated screenshots, collect evidence, upload evidence, move raw evidence, execute UAT, accept UAT, accept evidence, approve report-view reliance, approve dashboard reliance, approve legal position, issue official SOP, approve migration, approve waiver, post vouchers, move money, issue bank instructions, approve finance action, approve owner GO/NO-GO or mark production GO.",
);
