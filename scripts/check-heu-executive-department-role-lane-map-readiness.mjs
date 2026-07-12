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

console.log("HEU executive department role-lane map readiness check");
console.log(
  "Secrets, raw PII, bank data, vouchers, passwords and signed evidence are never printed by this script.",
);

const roleLanePath = "lib/heu-role-lanes.ts";
const executiveDashboardPath =
  "components/dashboard/executive-dashboard-overview.tsx";
const executiveReadinessPath =
  "scripts/check-heu-executive-dashboard-readiness.mjs";
const roleScopeFocusPath =
  "scripts/check-heu-executive-role-scope-focus-readiness.mjs";
const roleLaneGovernancePath = "scripts/check-heu-role-lane-governance.mjs";
const blueprintPath = "docs/HEU_STANDARD_SYSTEM_BLUEPRINT_20260703.md";
const implementationLogPath = "docs/HEU_IMPLEMENTATION_LOG.md";
const packageJsonPath = "package.json";

const roleLane = read(roleLanePath);
const executiveDashboard = read(executiveDashboardPath);
const executiveReadiness = read(executiveReadinessPath);
const roleScopeFocus = read(roleScopeFocusPath);
const roleLaneGovernance = read(roleLaneGovernancePath);
const blueprint = read(blueprintPath);
const implementationLog = read(implementationLogPath);
const packageJson = JSON.parse(read(packageJsonPath));

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
  executiveDashboard,
  /data-heu-executive-department-role-lane-map="STD-32_EXECUTIVE_DEPARTMENT_ROLE_LANE_MAP"[\s\S]*data-heu-executive-department-role-lane-boundary="PASS_LOCAL_DEPARTMENT_ROLE_LANE_MAP READ_ONLY EXECUTIVE_OVERSIGHT NO_ACCESS_GRANT NO_PERMISSION_EXPANSION NO_ACCOUNT_CREATE NO_ROLE_ASSIGNMENT NO_FINANCE_EXECUTION NO_LEGAL_CONCLUSION NO_UAT_ACCEPTANCE NO_OWNER_GO NO_PRODUCTION_GO"[\s\S]*data-heu-executive-department-role-lane-overflow-guard="STD-32_NO_OVERFLOW"/,
  "EXEC-DASHBOARD-STD32-DEPARTMENT-MAP-ANCHOR",
  executiveDashboardPath,
);
requireAllText(
  executiveDashboard,
  [
    "HEU_DEPARTMENT_ROLE_LANE_MAP",
    "STD-32 Department role lane map",
    "BGH xem dung nguoi dung viec theo tung phong ban",
    "executive oversight read-only",
    "khong tao tai",
    "khong gan role",
    "P6-04_PENDING",
    "HEU_DEPARTMENT_ROLE_LANE_MAP.map",
    "lane.code",
    "lane.label",
    "lane.accountableLane",
    "lane.operatingScope",
    "lane.requiredEvidence",
    "lane.forbiddenScope",
    "Owner lane",
    "Operating scope",
    "Evidence",
    "Stop",
  ],
  "EXEC-DASHBOARD-STD32-DEPARTMENT-MAP-TOKENS",
  executiveDashboardPath,
);
requireAllText(
  executiveReadiness,
  [
    "EXEC-DASHBOARD-DEPARTMENT-ROLE-LANE-MAP-ANCHOR",
    "EXEC-DASHBOARD-DEPARTMENT-ROLE-LANE-MAP-TOKENS",
    "PASS_LOCAL_DEPARTMENT_ROLE_LANE_MAP",
    "check:heu-executive-department-role-lane-map-readiness",
  ],
  "EXECUTIVE-READINESS-STD32",
  executiveReadinessPath,
);
requireAllText(
  roleScopeFocus,
  [
    "STD-32_EXECUTIVE_DEPARTMENT_ROLE_LANE_MAP",
    "PASS_LOCAL_DEPARTMENT_ROLE_LANE_MAP",
    "HEU_DEPARTMENT_ROLE_LANE_MAP",
    "HEU_DEPARTMENT_ROLE_LANE_MAP.map",
    "lane.accountableLane",
    "lane.operatingScope",
    "lane.requiredEvidence",
    "lane.forbiddenScope",
  ],
  "ROLE-SCOPE-FOCUS-STD32",
  roleScopeFocusPath,
);
requireAllText(
  roleLaneGovernance,
  [
    "HEU_DEPARTMENT_ROLE_LANE_MAP",
    "PASS_LOCAL_DEPARTMENT_ROLE_LANE_MAP",
    "DEPT-TUYEN-SINH",
    "DEPT-AUDIT",
  ],
  "ROLE-LANE-GOVERNANCE-STD32",
  roleLaneGovernancePath,
);
requireAllText(
  blueprint,
  [
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
  ],
  "BLUEPRINT-STD32",
  blueprintPath,
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

if (
  packageJson.scripts?.["check:heu-executive-department-role-lane-map-readiness"] !==
  "node scripts/check-heu-executive-department-role-lane-map-readiness.mjs"
) {
  fail(
    "package.json missing check:heu-executive-department-role-lane-map-readiness script",
  );
}

console.log("READY PACKAGE-SCRIPT");
console.log(
  "HEU_EXECUTIVE_DEPARTMENT_ROLE_LANE_MAP_READY / NO_GO / BLOCKED: PASS_LOCAL_DEPARTMENT_ROLE_LANE_MAP. This check verifies executive department role-lane visibility only; it does not create accounts, assign roles, grant access, expand permissions, execute UAT, accept evidence, approve finance action, issue legal conclusions, approve owner GO/NO-GO or mark production GO.",
);
