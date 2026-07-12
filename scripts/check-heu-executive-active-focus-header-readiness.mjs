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

console.log("HEU executive active focus header readiness check");
console.log(
  "Secrets, raw PII, bank data, vouchers, passwords, cookies and signed evidence are never printed by this script.",
);

const executiveDashboardPath =
  "components/dashboard/executive-dashboard-overview.tsx";
const executiveReadinessPath =
  "scripts/check-heu-executive-dashboard-readiness.mjs";
const visualQaPath = "scripts/check-heu-executive-dashboard-visual-qa.mjs";
const blueprintPath = "docs/HEU_STANDARD_SYSTEM_BLUEPRINT_20260703.md";
const implementationLogPath = "docs/HEU_IMPLEMENTATION_LOG.md";
const packageJsonPath = "package.json";

const executiveDashboard = read(executiveDashboardPath);
const executiveReadiness = read(executiveReadinessPath);
const visualQa = read(visualQaPath);
const blueprint = read(blueprintPath);
const implementationLog = read(implementationLogPath);
const packageJson = JSON.parse(read(packageJsonPath));

const headerTokens = [
  "currentFocusModeItem",
  "STD-30_EXECUTIVE_ACTIVE_FOCUS_HEADER",
  "STD-30 Active focus header",
  "PASS_LOCAL_ACTIVE_FOCUS_HEADER",
  "ACTIVE_FOCUS_VISIBLE",
  "RETURN_TO_ALL",
  "READ_ONLY_ROUTE_HINT",
  "FOCUS_QUERY_PARAM",
  "focus={currentFocusMode}",
  "Đang xem:",
  "focusHref(\"all\")",
  "Xem toàn cảnh điều hành",
  "Toàn cảnh",
  "NO_STATE_MUTATION",
  "NO_ACCESS_GRANT",
  "NO_PERMISSION_EXPANSION",
  "NO_APPROVAL_ACTION",
  "NO_UAT_ACCEPTANCE",
  "NO_EVIDENCE_ACCEPTANCE",
  "NO_FINANCE_ACTION",
  "NO_OWNER_GO",
  "NO_PRODUCTION_GO",
];

requireText(
  executiveDashboard,
  /data-heu-executive-active-focus-header="STD-30_EXECUTIVE_ACTIVE_FOCUS_HEADER"[\s\S]*data-heu-executive-active-focus-boundary="PASS_LOCAL_ACTIVE_FOCUS_HEADER READ_ONLY_ROUTE_HINT FOCUS_QUERY_PARAM ACTIVE_FOCUS_VISIBLE RETURN_TO_ALL NO_STATE_MUTATION NO_ACCESS_GRANT NO_PERMISSION_EXPANSION NO_APPROVAL_ACTION NO_UAT_ACCEPTANCE NO_EVIDENCE_ACCEPTANCE NO_FINANCE_ACTION NO_OWNER_GO NO_PRODUCTION_GO"[\s\S]*data-heu-executive-active-focus-overflow-guard="STD-30_NO_OVERFLOW"/,
  "EXEC-DASHBOARD-STD30-ACTIVE-FOCUS-HEADER-ANCHOR",
  executiveDashboardPath,
);
requireAllText(
  executiveDashboard,
  headerTokens,
  "EXEC-DASHBOARD-STD30-ACTIVE-FOCUS-HEADER-TOKENS",
  executiveDashboardPath,
);
requireAllText(
  executiveReadiness,
  [
    "EXEC-DASHBOARD-ACTIVE-FOCUS-HEADER-ANCHOR",
    "EXEC-DASHBOARD-ACTIVE-FOCUS-HEADER-TOKENS",
    "PASS_LOCAL_ACTIVE_FOCUS_HEADER",
    "check:heu-executive-active-focus-header-readiness",
  ],
  "EXECUTIVE-READINESS-STD30",
  executiveReadinessPath,
);
requireAllText(
  visualQa,
  [
    'data-heu-executive-active-focus-header="STD-30_EXECUTIVE_ACTIVE_FOCUS_HEADER"',
    "STD-30 Active focus header",
    "PASS_LOCAL_ACTIVE_FOCUS_HEADER",
    "ACTIVE_FOCUS_VISIBLE",
    "RETURN_TO_ALL",
  ],
  "VISUAL-QA-STD30",
  visualQaPath,
);
requireAllText(
  blueprint,
  [
    "STD-30",
    "STD-30_EXECUTIVE_ACTIVE_FOCUS_HEADER",
    "PASS_LOCAL_ACTIVE_FOCUS_HEADER",
    "ACTIVE_FOCUS_VISIBLE",
    "RETURN_TO_ALL",
    "NO_STATE_MUTATION",
    "NO_PRODUCTION_GO",
  ],
  "BLUEPRINT-STD30",
  blueprintPath,
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

if (
  packageJson.scripts?.["check:heu-executive-active-focus-header-readiness"] !==
  "node scripts/check-heu-executive-active-focus-header-readiness.mjs"
) {
  fail("package.json missing check:heu-executive-active-focus-header-readiness script");
}

console.log("READY PACKAGE-SCRIPT");
console.log(
  "HEU_EXECUTIVE_ACTIVE_FOCUS_HEADER_READY / NO_GO / BLOCKED: PASS_LOCAL_ACTIVE_FOCUS_HEADER. This check verifies the active focus header and return-to-all route hint only; it does not grant access, expand permissions, mutate workflow state, execute UAT, accept evidence, approve finance action, approve owner GO/NO-GO or mark production GO.",
);
