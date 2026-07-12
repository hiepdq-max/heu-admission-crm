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

console.log("HEU dashboard scope visibility invariant readiness check");
console.log(
  "Secrets, raw PII, bank data, vouchers, passwords, cookies and signed evidence are never printed by this script.",
);

const executiveDashboardPath =
  "components/dashboard/executive-dashboard-overview.tsx";
const workspacePath = "lib/workspace.ts";
const homePath = "app/page.tsx";
const executiveReadinessPath =
  "scripts/check-heu-executive-dashboard-readiness.mjs";
const roleScopePath =
  "scripts/check-heu-executive-role-scope-focus-readiness.mjs";
const visualQaPath = "scripts/check-heu-executive-dashboard-visual-qa.mjs";
const blueprintPath = "docs/HEU_STANDARD_SYSTEM_BLUEPRINT_20260703.md";
const implementationLogPath = "docs/HEU_IMPLEMENTATION_LOG.md";
const packageJsonPath = "package.json";

const executiveDashboard = read(executiveDashboardPath);
const workspace = read(workspacePath);
const home = read(homePath);
const executiveReadiness = read(executiveReadinessPath);
const roleScope = read(roleScopePath);
const visualQa = read(visualQaPath);
const blueprint = read(blueprintPath);
const implementationLog = read(implementationLogPath);
const packageJson = JSON.parse(read(packageJsonPath));

const scopeVisibilityTokens = [
  "ExecutiveDashboardScopeVisibility",
  "dashboardScopeVisibilityRows",
  "STD-37_EXECUTIVE_DASHBOARD_SCOPE_VISIBILITY_INVARIANT",
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
  "NO_ACCESS_GRANT",
  "NO_PERMISSION_EXPANSION",
  "NO_STATE_MUTATION",
  "NO_FINANCE_ACTION",
  "NO_LEGAL_CONCLUSION",
  "NO_UAT_ACCEPTANCE",
  "NO_EVIDENCE_ACCEPTANCE",
  "NO_OWNER_GO",
  "NO_PRODUCTION_GO",
];

requireText(
  executiveDashboard,
  /data-heu-executive-dashboard-scope-visibility="STD-37_EXECUTIVE_DASHBOARD_SCOPE_VISIBILITY_INVARIANT"[\s\S]*data-heu-executive-dashboard-scope-visibility-boundary="PASS_LOCAL_DASHBOARD_SCOPE_VISIBILITY READ_ONLY SCOPE_BOUND_DASHBOARD canSeeAllSegments visibleSegmentIds admissionWorkspaceSegmentIds applyAdmissionSegmentIds ACTIVE_SEGMENT_LIMIT EXECUTIVE_ALL_SEGMENTS NON_EXECUTIVE_VISIBLE_SEGMENTS NO_CROSS_SCOPE_DASHBOARD NO_RAW_SOURCE_OPEN NO_ACCESS_GRANT NO_PERMISSION_EXPANSION NO_STATE_MUTATION NO_FINANCE_ACTION NO_LEGAL_CONCLUSION NO_UAT_ACCEPTANCE NO_EVIDENCE_ACCEPTANCE NO_OWNER_GO NO_PRODUCTION_GO"[\s\S]*data-heu-executive-dashboard-scope-visibility-overflow-guard="STD-37_NO_OVERFLOW"/,
  "EXEC-DASHBOARD-STD37-SCOPE-VISIBILITY-ANCHOR",
  executiveDashboardPath,
);
requireAllText(
  executiveDashboard,
  scopeVisibilityTokens,
  "EXEC-DASHBOARD-STD37-SCOPE-VISIBILITY-TOKENS",
  executiveDashboardPath,
);
requireText(
  workspace,
  /const canSeeAllSegments = isExecutiveRole\(currentRoleCode\)[\s\S]*\.filter\(\(segment\) => canSeeAllSegments \|\| allowedIds\.has\(segment\.id\)\)[\s\S]*const visibleSegmentIds = segmentOptions\.map\(\(segment\) => segment\.id\)/,
  "WORKSPACE-STD37-CAN-SEE-ALL-SEGMENTS",
  workspacePath,
);
requireText(
  workspace,
  /export function admissionWorkspaceSegmentIds[\s\S]*if \(context\.activeSegmentId\)[\s\S]*return \[context\.activeSegmentId\][\s\S]*if \(context\.canSeeAllSegments\)[\s\S]*return null[\s\S]*return context\.visibleSegmentIds\.length > 0[\s\S]*: \[NO_MATCH_SEGMENT_ID\]/,
  "WORKSPACE-STD37-SEGMENT-FILTER-INVARIANT",
  workspacePath,
);
requireText(
  home,
  /const segmentFilterIds = admissionWorkspaceSegmentIds\(workspace\)[\s\S]*applyAdmissionSegmentIds\([\s\S]*\.from\("leads"\)[\s\S]*segmentFilterIds[\s\S]*ExecutiveDashboardOverview[\s\S]*focusMode=\{requestedExecutiveFocus\}/,
  "HOME-STD37-DASHBOARD-SEGMENT-SCOPE",
  homePath,
);
requireAllText(
  executiveReadiness,
  [
    "EXEC-DASHBOARD-DASHBOARD-SCOPE-VISIBILITY-ANCHOR",
    "EXEC-DASHBOARD-DASHBOARD-SCOPE-VISIBILITY-TOKENS",
    "WORKSPACE-DASHBOARD-SCOPE-VISIBILITY",
    "HOME-DASHBOARD-SCOPE-VISIBILITY",
    "PASS_LOCAL_DASHBOARD_SCOPE_VISIBILITY",
    "check:heu-dashboard-scope-visibility-invariant-readiness",
  ],
  "EXECUTIVE-READINESS-STD37",
  executiveReadinessPath,
);
requireAllText(
  roleScope,
  [
    "STD-37_EXECUTIVE_DASHBOARD_SCOPE_VISIBILITY_INVARIANT",
    "PASS_LOCAL_DASHBOARD_SCOPE_VISIBILITY",
    "SCOPE-VIS-01",
    "SCOPE-VIS-05",
  ],
  "ROLE-SCOPE-STD37",
  roleScopePath,
);
requireAllText(
  visualQa,
  [
    'data-heu-executive-dashboard-scope-visibility="STD-37_EXECUTIVE_DASHBOARD_SCOPE_VISIBILITY_INVARIANT"',
    "STD-37 Dashboard scope visibility invariant",
    "PASS_LOCAL_DASHBOARD_SCOPE_VISIBILITY",
  ],
  "VISUAL-QA-STD37",
  visualQaPath,
);
requireAllText(
  blueprint,
  [
    "STD-37",
    "STD-37_EXECUTIVE_DASHBOARD_SCOPE_VISIBILITY_INVARIANT",
    "PASS_LOCAL_DASHBOARD_SCOPE_VISIBILITY",
    "SCOPE_BOUND_DASHBOARD",
    "NO_CROSS_SCOPE_DASHBOARD",
    "ACTIVE_SEGMENT_LIMIT",
    "NON_EXECUTIVE_VISIBLE_SEGMENTS",
  ],
  "BLUEPRINT-STD37",
  blueprintPath,
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

console.log("READY PACKAGE-SCRIPT");
console.log(
  "HEU_DASHBOARD_SCOPE_VISIBILITY_READY / NO_GO / BLOCKED: PASS_LOCAL_DASHBOARD_SCOPE_VISIBILITY. This check verifies the dashboard scope visibility invariant only; it does not create accounts, grant access, expand permissions, open cross-scope dashboards, mutate workflow state, execute UAT, accept evidence, approve finance action, issue legal conclusions, approve owner GO/NO-GO or mark production GO.",
);
