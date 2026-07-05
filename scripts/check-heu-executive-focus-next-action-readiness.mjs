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

console.log("HEU executive focus next-action readiness check");
console.log(
  "Secrets, raw PII, bank data, vouchers, passwords and signed evidence are never printed by this script.",
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

const nextActionTokens = [
  "STD-18_EXECUTIVE_FOCUS_NEXT_ACTION",
  "ExecutiveFocusNextAction",
  "executiveFocusNextActionRows",
  "getExecutiveFocusNextAction",
  "currentFocusNextAction",
  "CurrentFocusNextActionIcon",
  "Next action for active focus",
  "READ_ONLY_ROUTE_HINT",
  "NO_STATE_MUTATION",
  "NO_HIDDEN_NO_GO",
  "NO_UAT_ACCEPTANCE",
  "NO_EVIDENCE_ACCEPTANCE",
  "NO_FINANCE_ACTION",
  "NO_APPROVAL_ACTION",
  "NO_OWNER_GO",
  "NO_PRODUCTION_GO",
  "NEXT-ALL",
  "NEXT-RPT",
  "NEXT-FIN",
  "NEXT-EVD",
  "NEXT-LAW",
  "NEXT-M12",
  "NEXT-BLK",
  "Open target",
  "Owner lane",
  "Stop rule",
  'href: "#executive-report-reliance"',
  'href: "#executive-finance-readonly"',
  'href: "#executive-uat-evidence"',
  'href: "#executive-legal-sop"',
  'href: "#executive-module-maturity"',
  'href: "#executive-blockers"',
];

requireText(
  executiveDashboard,
  /data-heu-executive-focus-next-action="STD-18_EXECUTIVE_FOCUS_NEXT_ACTION"[\s\S]*data-heu-executive-focus-next-action-boundary="READ_ONLY_ROUTE_HINT NO_STATE_MUTATION NO_HIDDEN_NO_GO NO_UAT_ACCEPTANCE NO_EVIDENCE_ACCEPTANCE NO_FINANCE_ACTION NO_APPROVAL_ACTION NO_OWNER_GO NO_PRODUCTION_GO"[\s\S]*data-heu-executive-focus-next-action-overflow-guard="STD-18_NO_OVERFLOW"/,
  "EXEC-DASHBOARD-STD18-FOCUS-NEXT-ACTION-ANCHOR",
  executiveDashboardPath,
);
requireText(
  executiveDashboard,
  /data-heu-executive-section-order="overview section_navigator focus_next_action priority_focus quick_access report_reliance finance uat_evidence role_scope legal_sop module_maturity kpis blockers admissions segment_overview"/,
  "EXEC-DASHBOARD-STD18-SECTION-ORDER",
  executiveDashboardPath,
);
requireAllText(
  executiveDashboard,
  nextActionTokens,
  "EXEC-DASHBOARD-STD18-FOCUS-NEXT-ACTION-TOKENS",
  executiveDashboardPath,
);
requireAllText(
  executiveReadiness,
  [
    "EXEC-DASHBOARD-FOCUS-NEXT-ACTION-ANCHOR",
    "EXEC-DASHBOARD-FOCUS-NEXT-ACTION-TOKENS",
    "PASS_LOCAL_NEXT_ACTION",
    "check:heu-executive-focus-next-action-readiness",
  ],
  "EXECUTIVE-READINESS-STD18",
  executiveReadinessPath,
);
requireAllText(
  visualQa,
  [
    'data-heu-executive-focus-next-action="STD-18_EXECUTIVE_FOCUS_NEXT_ACTION"',
    'id="executive-focus-next-action"',
    "Next action for active focus",
    "READ_ONLY_ROUTE_HINT",
  ],
  "VISUAL-QA-STD18",
  visualQaPath,
);
requireAllText(
  blueprint,
  [
    "STD-18",
    "STD-18_EXECUTIVE_FOCUS_NEXT_ACTION",
    "PASS_LOCAL_NEXT_ACTION",
    "READ_ONLY_ROUTE_HINT",
    "NO_STATE_MUTATION",
    "NO_HIDDEN_NO_GO",
  ],
  "BLUEPRINT-STD18-FOCUS-NEXT-ACTION",
  blueprintPath,
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

if (
  packageJson.scripts?.["check:heu-executive-focus-next-action-readiness"] !==
  "node scripts/check-heu-executive-focus-next-action-readiness.mjs"
) {
  fail(
    "package.json missing check:heu-executive-focus-next-action-readiness script",
  );
}

console.log("READY PACKAGE-SCRIPT");
console.log(
  "HEU_EXECUTIVE_FOCUS_NEXT_ACTION_READY / NO_GO / BLOCKED: PASS_LOCAL_NEXT_ACTION. This check verifies read-only route hints only; it does not mutate workflow state, hide NO-GO status, execute UAT, accept evidence, approve finance action, approve owner GO/NO-GO or mark production GO.",
);
