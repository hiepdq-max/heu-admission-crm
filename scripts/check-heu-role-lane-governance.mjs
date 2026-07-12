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

console.log("HEU role-lane governance check");
console.log(
  "Secrets, passwords, raw PII, bank data, voucher data and account tokens are never printed by this script.",
);

const roleLanePath = "lib/heu-role-lanes.ts";
const executiveRolesPath = "lib/executive-roles.ts";
const blueprintPath = "docs/HEU_STANDARD_SYSTEM_BLUEPRINT_20260703.md";
const implementationLogPath = "docs/HEU_IMPLEMENTATION_LOG.md";
const packageJsonPath = "package.json";

const roleLane = read(roleLanePath);
const executiveRoles = read(executiveRolesPath);
const blueprint = read(blueprintPath);
const implementationLog = read(implementationLogPath);
const packageJson = JSON.parse(read(packageJsonPath));

requireAllText(
  roleLane,
  [
    "HEU_ROLE_LANE_CODES",
    "HEU_ROLE_LANE_MATRIX",
    "HEU_DEPARTMENT_ROLE_LANE_MAP",
    "normalizeHeuRoleCode",
    "getHeuRoleLane",
    "ADMIN",
    "BGH",
    "HIEU_TRUONG",
    "PHO_HIEU_TRUONG",
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
  ],
  "ROLE-LANE-CODE-COVERAGE",
  roleLanePath,
);
requireAllText(
  roleLane,
  [
    "NO_DAILY_DATA_ENTRY",
    "NO_FINANCE_EXECUTION",
    "NO_LEGAL_CONCLUSION",
    "NO_UAT_ACCEPTANCE",
    "NO_UNAPPROVED_BANK_INSTRUCTION",
    "NO_STATUTORY_BOOK_FROM_DASHBOARD",
    "NO_PAYMENT_EXECUTION",
    "NO_BUSINESS_APPROVAL",
    "NO_HIDDEN_EVIDENCE_MOVEMENT",
    "NO_OWNER_GO",
    "PASS_LOCAL_DEPARTMENT_ROLE_LANE_MAP",
    "EXECUTIVE_OVERSIGHT",
    "NO_ACCOUNT_CREATE",
    "NO_ROLE_ASSIGNMENT",
    "NO_PRODUCTION_GO",
  ],
  "ROLE-LANE-NEGATIVE-BOUNDARIES",
  roleLanePath,
);
requireText(
  executiveRoles,
  /import \{ normalizeHeuRoleCode \} from "@\/lib\/heu-role-lanes"[\s\S]*normalizeHeuRoleCode\(roleCode\)/,
  "EXECUTIVE-ROLE-NORMALIZER",
  executiveRolesPath,
);
requireAllText(
  blueprint,
  [
    "STD-12",
    "HEU_ROLE_LANE_MATRIX",
    "HIEU_TRUONG",
    "PHO_HIEU_TRUONG",
    "BGH",
    "KHTC",
    "PHAP_CHE",
    "IT_DATA",
    "AUDIT",
    "PASS_LOCAL_ROLE_GUARD",
    "PASS_LOCAL_DEPARTMENT_ROLE_LANE_MAP",
    "NO_ACCESS_GRANT",
    "NO_FINANCE_EXECUTION",
    "NO_LEGAL_CONCLUSION",
  ],
  "BLUEPRINT-STD12-ROLE-LANES",
  blueprintPath,
);
requireAllText(
  implementationLog,
  [
    "STD-12 Role Lane Governance Matrix",
    "lib/heu-role-lanes.ts",
    "check-heu-role-lane-governance.mjs",
    "PASS_LOCAL_ROLE_GUARD",
    "PASS_LOCAL_DEPARTMENT_ROLE_LANE_MAP",
    "NO_ACCESS_GRANT",
    "NO_FINANCE_EXECUTION",
    "NO_LEGAL_CONCLUSION",
    "does not grant access",
    "mark production GO",
  ],
  "IMPLEMENTATION-LOG-STD12",
  implementationLogPath,
);

if (
  packageJson.scripts?.["check:heu-role-lane-governance"] !==
  "node scripts/check-heu-role-lane-governance.mjs"
) {
  fail("package.json missing check:heu-role-lane-governance script");
}

console.log("READY PACKAGE-SCRIPT");
console.log(
  "HEU_ROLE_LANE_GOVERNANCE_READY / NO_GO / BLOCKED: PASS_LOCAL_ROLE_GUARD. This check standardizes role lanes only; it does not create accounts, grant access, expand permissions, execute finance, issue legal conclusions, accept UAT, approve owner GO/NO-GO or mark production GO.",
);
