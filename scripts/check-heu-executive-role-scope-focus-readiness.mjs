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

console.log("HEU executive role/scope focus readiness check");
console.log(
  "Secrets, raw PII, bank data, vouchers, passwords and signed evidence are never printed by this script.",
);

const executiveDashboardPath =
  "components/dashboard/executive-dashboard-overview.tsx";
const appShellPath = "components/layout/app-shell.tsx";
const executiveReadinessPath =
  "scripts/check-heu-executive-dashboard-readiness.mjs";
const focusModePath = "scripts/check-heu-executive-focus-mode-readiness.mjs";
const globalFocusPath =
  "scripts/check-heu-executive-global-focus-shortcuts-readiness.mjs";
const visualQaPath = "scripts/check-heu-executive-dashboard-visual-qa.mjs";
const blueprintPath = "docs/HEU_STANDARD_SYSTEM_BLUEPRINT_20260703.md";
const implementationLogPath = "docs/HEU_IMPLEMENTATION_LOG.md";
const packageJsonPath = "package.json";

const executiveDashboard = read(executiveDashboardPath);
const appShell = read(appShellPath);
const executiveReadiness = read(executiveReadinessPath);
const focusMode = read(focusModePath);
const globalFocus = read(globalFocusPath);
const visualQa = read(visualQaPath);
const blueprint = read(blueprintPath);
const implementationLog = read(implementationLogPath);
const packageJson = JSON.parse(read(packageJsonPath));

requireText(
  executiveDashboard,
  /data-heu-executive-role-scope-decision="STD-23_EXECUTIVE_ROLE_SCOPE_DECISION_STRIP"[\s\S]*data-heu-executive-role-scope-boundary="PASS_LOCAL_EXECUTIVE_ROLE_SCOPE READ_ONLY P6-04_ROLE_SCOPE_UAT_PENDING NEGATIVE_ACCESS_PROOF_PENDING NO_ACCESS_GRANT NO_PERMISSION_EXPANSION NO_DAILY_DATA_ENTRY NO_FINANCE_EXECUTION NO_LEGAL_CONCLUSION NO_UAT_ACCEPTANCE NO_OWNER_GO NO_PRODUCTION_GO"[\s\S]*data-heu-executive-role-scope-overflow-guard="STD-23_NO_OVERFLOW"/,
  "EXEC-DASHBOARD-STD23-ROLE-SCOPE-ANCHOR",
  executiveDashboardPath,
);
requireAllText(
  executiveDashboard,
  [
    "STD-23_EXECUTIVE_ROLE_SCOPE_DECISION_STRIP",
    "STD-32_EXECUTIVE_DEPARTMENT_ROLE_LANE_MAP",
    "Executive role/scope decision strip",
    "PASS_LOCAL_EXECUTIVE_ROLE_SCOPE",
    "PASS_LOCAL_DEPARTMENT_ROLE_LANE_MAP",
    "P6-04_ROLE_SCOPE_UAT_PENDING",
    "NEGATIVE_ACCESS_PROOF_PENDING",
    "NO_ACCESS_GRANT",
    "NO_PERMISSION_EXPANSION",
    "NO_ACCOUNT_CREATE",
    "NO_ROLE_ASSIGNMENT",
    "NO_DAILY_DATA_ENTRY",
    "NO_FINANCE_EXECUTION",
    "NO_LEGAL_CONCLUSION",
    "NO_UAT_ACCEPTANCE",
    "NO_OWNER_GO",
    "NO_PRODUCTION_GO",
    "getHeuRoleLane",
    "HEU_ROLE_LANE_MATRIX",
    "HEU_DEPARTMENT_ROLE_LANE_MAP",
    "currentRoleLane",
    "executiveRoleLanes",
    "HEU_DEPARTMENT_ROLE_LANE_MAP.map",
    "lane.accountableLane",
    "lane.operatingScope",
    "lane.requiredEvidence",
    "lane.forbiddenScope",
    "EXEC-ROLE-01",
    "EXEC-ROLE-02",
    "EXEC-ROLE-03",
    "EXEC-ROLE-04",
    "UNKNOWN_ROLE_LANE",
    'mode: "roles"',
    'roles: ["ROL"]',
    'id="executive-role-scope"',
  ],
  "EXEC-DASHBOARD-STD23-ROLE-SCOPE-TOKENS",
  executiveDashboardPath,
);
requireText(
  executiveDashboard,
  /data-heu-executive-department-role-lane-map="STD-32_EXECUTIVE_DEPARTMENT_ROLE_LANE_MAP"[\s\S]*data-heu-executive-department-role-lane-boundary="PASS_LOCAL_DEPARTMENT_ROLE_LANE_MAP READ_ONLY EXECUTIVE_OVERSIGHT NO_ACCESS_GRANT NO_PERMISSION_EXPANSION NO_ACCOUNT_CREATE NO_ROLE_ASSIGNMENT NO_FINANCE_EXECUTION NO_LEGAL_CONCLUSION NO_UAT_ACCEPTANCE NO_OWNER_GO NO_PRODUCTION_GO"[\s\S]*data-heu-executive-department-role-lane-overflow-guard="STD-32_NO_OVERFLOW"/,
  "EXEC-DASHBOARD-STD32-DEPARTMENT-ROLE-LANE-MAP",
  executiveDashboardPath,
);
requireText(
  executiveDashboard,
  /data-heu-executive-dashboard-scope-visibility="STD-37_EXECUTIVE_DASHBOARD_SCOPE_VISIBILITY_INVARIANT"[\s\S]*data-heu-executive-dashboard-scope-visibility-boundary="PASS_LOCAL_DASHBOARD_SCOPE_VISIBILITY READ_ONLY SCOPE_BOUND_DASHBOARD canSeeAllSegments visibleSegmentIds admissionWorkspaceSegmentIds applyAdmissionSegmentIds ACTIVE_SEGMENT_LIMIT EXECUTIVE_ALL_SEGMENTS NON_EXECUTIVE_VISIBLE_SEGMENTS NO_CROSS_SCOPE_DASHBOARD NO_RAW_SOURCE_OPEN NO_ACCESS_GRANT NO_PERMISSION_EXPANSION NO_STATE_MUTATION NO_FINANCE_ACTION NO_LEGAL_CONCLUSION NO_UAT_ACCEPTANCE NO_EVIDENCE_ACCEPTANCE NO_OWNER_GO NO_PRODUCTION_GO"[\s\S]*data-heu-executive-dashboard-scope-visibility-overflow-guard="STD-37_NO_OVERFLOW"/,
  "EXEC-DASHBOARD-STD37-DASHBOARD-SCOPE-VISIBILITY",
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
    "NO_CROSS_SCOPE_DASHBOARD",
    "NO_STATE_MUTATION",
    "NO_FINANCE_ACTION",
    "NO_LEGAL_CONCLUSION",
  ],
  "EXEC-DASHBOARD-STD37-DASHBOARD-SCOPE-VISIBILITY-TOKENS",
  executiveDashboardPath,
);
requireText(
  executiveDashboard,
  /data-heu-executive-dashboard-permission-matrix="STD-38_EXECUTIVE_DASHBOARD_PERMISSION_MATRIX"[\s\S]*data-heu-executive-dashboard-permission-matrix-boundary="PASS_LOCAL_EXECUTIVE_DASHBOARD_PERMISSION_MATRIX READ_ONLY ROUTE_VISIBILITY_MATRIX runtimePermissionGate canOpenMasterControl canOpenFinanceDesk canOpenScopeControl master_control\.read finance_desk\.read scope\.manage_department users\.create permission_matrix\.read permission_matrix\.manage NO_ACCESS_GRANT NO_PERMISSION_EXPANSION NO_ACCOUNT_CREATE NO_ROLE_ASSIGNMENT NO_STATE_MUTATION NO_APPROVAL_ACTION NO_FINANCE_ACTION NO_LEGAL_CONCLUSION NO_UAT_ACCEPTANCE NO_EVIDENCE_ACCEPTANCE NO_OWNER_GO NO_PRODUCTION_GO"[\s\S]*data-heu-executive-dashboard-permission-matrix-overflow-guard="STD-38_NO_OVERFLOW"/,
  "EXEC-DASHBOARD-STD38-PERMISSION-MATRIX",
  executiveDashboardPath,
);
requireAllText(
  executiveDashboard,
  [
    "ExecutiveDashboardPermissionMatrix",
    "executiveDashboardPermissionMatrixRows",
    "STD-38 Executive dashboard permission matrix",
    "PASS_LOCAL_EXECUTIVE_DASHBOARD_PERMISSION_MATRIX",
    "ROUTE_VISIBILITY_MATRIX",
    "runtimePermissionGate",
    "EXEC-PERM-01",
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
  "EXEC-DASHBOARD-STD38-PERMISSION-MATRIX-TOKENS",
  executiveDashboardPath,
);
requireAllText(
  appShell,
  [
    "Phân quyền",
    'href: focusHref("roles")',
    "STD-19_EXECUTIVE_GLOBAL_FOCUS_SHORTCUTS",
    "NO_ACCESS_GRANT",
    "NO_PERMISSION_EXPANSION",
  ],
  "APP-SHELL-STD23-ROLE-SCOPE-SHORTCUT",
  appShellPath,
);
requireAllText(
  executiveReadiness,
  [
    "EXEC-DASHBOARD-ROLE-SCOPE-DECISION-ANCHOR",
    "EXEC-DASHBOARD-ROLE-SCOPE-DECISION-TOKENS",
    "EXEC-DASHBOARD-DEPARTMENT-ROLE-LANE-MAP-ANCHOR",
    "EXEC-DASHBOARD-DEPARTMENT-ROLE-LANE-MAP-TOKENS",
    "EXEC-DASHBOARD-DASHBOARD-SCOPE-VISIBILITY-ANCHOR",
    "EXEC-DASHBOARD-DASHBOARD-SCOPE-VISIBILITY-TOKENS",
    "EXEC-DASHBOARD-PERMISSION-MATRIX-ANCHOR",
    "EXEC-DASHBOARD-PERMISSION-MATRIX-TOKENS",
    "APP-SHELL-EXECUTIVE-ROLE-SCOPE-FOCUS-SHORTCUT",
    "PASS_LOCAL_EXECUTIVE_ROLE_SCOPE",
    "PASS_LOCAL_DEPARTMENT_ROLE_LANE_MAP",
    "PASS_LOCAL_DASHBOARD_SCOPE_VISIBILITY",
    "PASS_LOCAL_EXECUTIVE_DASHBOARD_PERMISSION_MATRIX",
    "check:heu-executive-role-scope-focus-readiness",
    "check:heu-executive-department-role-lane-map-readiness",
    "check:heu-dashboard-scope-visibility-invariant-readiness",
    "check:heu-executive-dashboard-permission-matrix-readiness",
  ],
  "EXECUTIVE-READINESS-STD23",
  executiveReadinessPath,
);
requireAllText(
  focusMode,
  [
    'mode: "roles"',
    "Role/scope",
    "focus=roles",
    "PASS_LOCAL_EXECUTIVE_ROLE_SCOPE",
  ],
  "FOCUS-MODE-STD23",
  focusModePath,
);
requireAllText(
  globalFocus,
  [
    "Phân quyền",
    "focus=roles",
    "PASS_LOCAL_EXECUTIVE_ROLE_SCOPE",
  ],
  "GLOBAL-FOCUS-STD23",
  globalFocusPath,
);
requireAllText(
  visualQa,
  [
    'data-heu-executive-role-scope-decision="STD-23_EXECUTIVE_ROLE_SCOPE_DECISION_STRIP"',
    'id="executive-role-scope"',
    "PASS_LOCAL_EXECUTIVE_ROLE_SCOPE",
  ],
  "VISUAL-QA-STD23",
  visualQaPath,
);
requireAllText(
  blueprint,
  [
    "STD-23",
    "STD-23_EXECUTIVE_ROLE_SCOPE_DECISION_STRIP",
    "STD-32",
    "STD-32_EXECUTIVE_DEPARTMENT_ROLE_LANE_MAP",
    "STD-37",
    "STD-37_EXECUTIVE_DASHBOARD_SCOPE_VISIBILITY_INVARIANT",
    "STD-38",
    "STD-38_EXECUTIVE_DASHBOARD_PERMISSION_MATRIX",
    "PASS_LOCAL_EXECUTIVE_ROLE_SCOPE",
    "PASS_LOCAL_DEPARTMENT_ROLE_LANE_MAP",
    "PASS_LOCAL_DASHBOARD_SCOPE_VISIBILITY",
    "PASS_LOCAL_EXECUTIVE_DASHBOARD_PERMISSION_MATRIX",
    "focus=roles",
    "P6-04_ROLE_SCOPE_UAT_PENDING",
    "NEGATIVE_ACCESS_PROOF_PENDING",
    "NO_ACCESS_GRANT",
    "NO_PERMISSION_EXPANSION",
  ],
  "BLUEPRINT-STD23",
  blueprintPath,
);
requireAllText(
  implementationLog,
  [
    "STD-23 Executive Role Scope Focus",
    "STD-32 Executive Department Role Lane Map",
    "STD-37 Executive Dashboard Scope Visibility Invariant",
    "STD-38 Executive Dashboard Permission Matrix",
    'data-heu-executive-role-scope-decision="STD-23_EXECUTIVE_ROLE_SCOPE_DECISION_STRIP"',
    'data-heu-executive-department-role-lane-map="STD-32_EXECUTIVE_DEPARTMENT_ROLE_LANE_MAP"',
    'data-heu-executive-dashboard-scope-visibility="STD-37_EXECUTIVE_DASHBOARD_SCOPE_VISIBILITY_INVARIANT"',
    'data-heu-executive-dashboard-permission-matrix="STD-38_EXECUTIVE_DASHBOARD_PERMISSION_MATRIX"',
    "Phân quyền",
    "focus=roles",
    "PASS_LOCAL_EXECUTIVE_ROLE_SCOPE",
    "PASS_LOCAL_DEPARTMENT_ROLE_LANE_MAP",
    "PASS_LOCAL_DASHBOARD_SCOPE_VISIBILITY",
    "PASS_LOCAL_EXECUTIVE_DASHBOARD_PERMISSION_MATRIX",
    "check:heu-executive-role-scope-focus-readiness",
    "check:heu-executive-department-role-lane-map-readiness",
    "check:heu-dashboard-scope-visibility-invariant-readiness",
    "check:heu-executive-dashboard-permission-matrix-readiness",
    "does not grant access",
    "mark production GO",
  ],
  "IMPLEMENTATION-LOG-STD23",
  implementationLogPath,
);

if (
  packageJson.scripts?.["check:heu-executive-role-scope-focus-readiness"] !==
  "node scripts/check-heu-executive-role-scope-focus-readiness.mjs"
) {
  fail(
    "package.json missing check:heu-executive-role-scope-focus-readiness script",
  );
}

console.log("READY PACKAGE-SCRIPT");
console.log(
  "HEU_EXECUTIVE_ROLE_SCOPE_FOCUS_READY / NO_GO / BLOCKED: PASS_LOCAL_EXECUTIVE_ROLE_SCOPE. This check verifies executive role/scope visibility and quick focus only; it does not create accounts, grant access, expand permissions, execute UAT, accept evidence, approve finance action, approve owner GO/NO-GO or mark production GO.",
);
