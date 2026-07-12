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

console.log("HEU executive dashboard permission matrix readiness check");
console.log(
  "Secrets, raw PII, bank data, vouchers, passwords, cookies and signed evidence are never printed by this script.",
);

const executiveDashboardPath =
  "components/dashboard/executive-dashboard-overview.tsx";
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
const home = read(homePath);
const executiveReadiness = read(executiveReadinessPath);
const roleScope = read(roleScopePath);
const visualQa = read(visualQaPath);
const blueprint = read(blueprintPath);
const implementationLog = read(implementationLogPath);
const packageJson = JSON.parse(read(packageJsonPath));

const permissionMatrixTokens = [
  "ExecutiveDashboardPermissionMatrix",
  "executiveDashboardPermissionMatrixRows",
  "getDashboardPermissionSignal",
  "getDashboardPermissionHref",
  "STD-38_EXECUTIVE_DASHBOARD_PERMISSION_MATRIX",
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
  "canOpenMasterControl",
  "canOpenFinanceDesk",
  "canOpenScopeControl",
  "NO_ACCESS_GRANT",
  "NO_PERMISSION_EXPANSION",
  "NO_ACCOUNT_CREATE",
  "NO_ROLE_ASSIGNMENT",
  "NO_STATE_MUTATION",
  "NO_APPROVAL_ACTION",
  "NO_FINANCE_ACTION",
  "NO_LEGAL_CONCLUSION",
  "NO_UAT_ACCEPTANCE",
  "NO_EVIDENCE_ACCEPTANCE",
  "NO_OWNER_GO",
  "NO_PRODUCTION_GO",
];

requireText(
  executiveDashboard,
  /data-heu-executive-dashboard-permission-matrix="STD-38_EXECUTIVE_DASHBOARD_PERMISSION_MATRIX"[\s\S]*data-heu-executive-dashboard-permission-matrix-boundary="PASS_LOCAL_EXECUTIVE_DASHBOARD_PERMISSION_MATRIX READ_ONLY ROUTE_VISIBILITY_MATRIX runtimePermissionGate canOpenMasterControl canOpenFinanceDesk canOpenScopeControl master_control\.read finance_desk\.read scope\.manage_department users\.create permission_matrix\.read permission_matrix\.manage NO_ACCESS_GRANT NO_PERMISSION_EXPANSION NO_ACCOUNT_CREATE NO_ROLE_ASSIGNMENT NO_STATE_MUTATION NO_APPROVAL_ACTION NO_FINANCE_ACTION NO_LEGAL_CONCLUSION NO_UAT_ACCEPTANCE NO_EVIDENCE_ACCEPTANCE NO_OWNER_GO NO_PRODUCTION_GO"[\s\S]*data-heu-executive-dashboard-permission-matrix-overflow-guard="STD-38_NO_OVERFLOW"/,
  "EXEC-DASHBOARD-STD38-PERMISSION-MATRIX-ANCHOR",
  executiveDashboardPath,
);
requireAllText(
  executiveDashboard,
  permissionMatrixTokens,
  "EXEC-DASHBOARD-STD38-PERMISSION-MATRIX-TOKENS",
  executiveDashboardPath,
);
requireText(
  home,
  /const executivePermissionNames = \[[\s\S]*"master_control\.read"[\s\S]*"finance_desk\.read"[\s\S]*"scope\.manage_department"[\s\S]*"users\.create"[\s\S]*"permission_matrix\.read"[\s\S]*"permission_matrix\.manage"[\s\S]*supabase\.rpc\("has_permission"[\s\S]*const executivePermissions: ExecutiveDashboardPermissions = \{[\s\S]*canOpenMasterControl: hasExecutivePermission\("master_control\.read"\)[\s\S]*canOpenFinanceDesk: hasExecutivePermission\("finance_desk\.read"\)[\s\S]*canOpenScopeControl:[\s\S]*hasExecutivePermission\("scope\.manage_department"\)[\s\S]*hasExecutivePermission\("users\.create"\)[\s\S]*hasExecutivePermission\("permission_matrix\.read"\)[\s\S]*hasExecutivePermission\("permission_matrix\.manage"\)/,
  "HOME-STD38-RUNTIME-PERMISSION-GATE",
  homePath,
);
requireAllText(
  executiveReadiness,
  [
    "EXEC-DASHBOARD-PERMISSION-MATRIX-ANCHOR",
    "EXEC-DASHBOARD-PERMISSION-MATRIX-TOKENS",
    "HOME-DASHBOARD-PERMISSION-MATRIX",
    "PASS_LOCAL_EXECUTIVE_DASHBOARD_PERMISSION_MATRIX",
    "check:heu-executive-dashboard-permission-matrix-readiness",
  ],
  "EXECUTIVE-READINESS-STD38",
  executiveReadinessPath,
);
requireAllText(
  roleScope,
  [
    "STD-38_EXECUTIVE_DASHBOARD_PERMISSION_MATRIX",
    "PASS_LOCAL_EXECUTIVE_DASHBOARD_PERMISSION_MATRIX",
    "EXEC-PERM-01",
    "EXEC-PERM-07",
    "ROUTE_VISIBILITY_MATRIX",
  ],
  "ROLE-SCOPE-STD38",
  roleScopePath,
);
requireAllText(
  visualQa,
  [
    'data-heu-executive-dashboard-permission-matrix="STD-38_EXECUTIVE_DASHBOARD_PERMISSION_MATRIX"',
    "STD-38 Executive dashboard permission matrix",
    "PASS_LOCAL_EXECUTIVE_DASHBOARD_PERMISSION_MATRIX",
  ],
  "VISUAL-QA-STD38",
  visualQaPath,
);
requireAllText(
  blueprint,
  [
    "STD-38",
    "STD-38_EXECUTIVE_DASHBOARD_PERMISSION_MATRIX",
    "PASS_LOCAL_EXECUTIVE_DASHBOARD_PERMISSION_MATRIX",
    "ROUTE_VISIBILITY_MATRIX",
    "runtimePermissionGate",
    "NO_ACCESS_GRANT",
    "NO_PERMISSION_EXPANSION",
  ],
  "BLUEPRINT-STD38",
  blueprintPath,
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
  packageJson.scripts?.[
    "check:heu-executive-dashboard-permission-matrix-readiness"
  ] !==
  "node scripts/check-heu-executive-dashboard-permission-matrix-readiness.mjs"
) {
  fail(
    "package.json missing check:heu-executive-dashboard-permission-matrix-readiness script",
  );
}

console.log("READY PACKAGE-SCRIPT");
console.log(
  "HEU_EXECUTIVE_DASHBOARD_PERMISSION_MATRIX_READY / NO_GO / BLOCKED: PASS_LOCAL_EXECUTIVE_DASHBOARD_PERMISSION_MATRIX. This check verifies executive dashboard route visibility only; it does not create accounts, grant access, expand permissions, assign roles, mutate workflow state, execute UAT, accept evidence, approve finance action, issue legal conclusions, approve owner GO/NO-GO or mark production GO.",
);
