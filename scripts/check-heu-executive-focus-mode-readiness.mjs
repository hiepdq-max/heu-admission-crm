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

console.log("HEU executive focus mode readiness check");
console.log(
  "Secrets, raw PII, bank data, vouchers, passwords and signed evidence are never printed by this script.",
);

const homePath = "app/page.tsx";
const executiveDashboardPath =
  "components/dashboard/executive-dashboard-overview.tsx";
const executiveReadinessPath =
  "scripts/check-heu-executive-dashboard-readiness.mjs";
const visualQaPath = "scripts/check-heu-executive-dashboard-visual-qa.mjs";
const blueprintPath = "docs/HEU_STANDARD_SYSTEM_BLUEPRINT_20260703.md";
const implementationLogPath = "docs/HEU_IMPLEMENTATION_LOG.md";
const packageJsonPath = "package.json";

const home = read(homePath);
const executiveDashboard = read(executiveDashboardPath);
const executiveReadiness = read(executiveReadinessPath);
const visualQa = read(visualQaPath);
const blueprint = read(blueprintPath);
const implementationLog = read(implementationLogPath);
const packageJson = JSON.parse(read(packageJsonPath));

const focusTokens = [
  "STD-17_EXECUTIVE_FOCUS_MODE",
  "FOCUS_QUERY_PARAM",
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
  "PASS_LOCAL_EXECUTIVE_ROLE_SCOPE",
  "?focus=${mode}",
  "NO_STATE_MUTATION",
  "NO_HIDDEN_NO_GO",
  "NO_UAT_ACCEPTANCE",
  "NO_EVIDENCE_ACCEPTANCE",
  "NO_FINANCE_ACTION",
  "NO_OWNER_GO",
  "NO_PRODUCTION_GO",
];

requireText(
  executiveDashboard,
  /data-heu-executive-focus-mode="STD-17_EXECUTIVE_FOCUS_MODE"[\s\S]*data-heu-executive-focus-boundary="READ_ONLY FOCUS_QUERY_PARAM NO_STATE_MUTATION NO_HIDDEN_NO_GO NO_UAT_ACCEPTANCE NO_EVIDENCE_ACCEPTANCE NO_FINANCE_ACTION NO_OWNER_GO NO_PRODUCTION_GO"[\s\S]*data-heu-executive-focus-overflow-guard="STD-17_NO_OVERFLOW"/,
  "EXEC-DASHBOARD-STD17-FOCUS-ANCHOR",
  executiveDashboardPath,
);
requireAllText(
  executiveDashboard,
  focusTokens,
  "EXEC-DASHBOARD-STD17-FOCUS-TOKENS",
  executiveDashboardPath,
);
requireAllText(
  home,
  [
    "focus?: string | string[]",
    "requestedExecutiveFocus",
    "focusMode={requestedExecutiveFocus}",
  ],
  "HOME-STD17-FOCUS-PARAM",
  homePath,
);
requireAllText(
  executiveReadiness,
  [
    "EXEC-DASHBOARD-FOCUS-MODE-ANCHOR",
    "EXEC-DASHBOARD-FOCUS-MODE-TOKENS",
    "HOME-EXECUTIVE-FOCUS-PARAM",
    "STD-17_EXECUTIVE_FOCUS_MODE",
    "PASS_LOCAL_FOCUS_MODE",
    "PASS_LOCAL_EXECUTIVE_ROLE_SCOPE",
  ],
  "EXECUTIVE-READINESS-STD17",
  executiveReadinessPath,
);
requireAllText(
  visualQa,
  [
    'data-heu-executive-focus-mode="STD-17_EXECUTIVE_FOCUS_MODE"',
    "Focus mode",
    "FOCUS_QUERY_PARAM",
  ],
  "VISUAL-QA-STD17",
  visualQaPath,
);
requireAllText(
  blueprint,
  [
    "STD-17",
    "STD-17_EXECUTIVE_FOCUS_MODE",
    "PASS_LOCAL_FOCUS_MODE",
    "FOCUS_QUERY_PARAM",
    "focus=roles",
    "PASS_LOCAL_EXECUTIVE_ROLE_SCOPE",
    "NO_STATE_MUTATION",
    "NO_HIDDEN_NO_GO",
  ],
  "BLUEPRINT-STD17-FOCUS",
  blueprintPath,
);
requireAllText(
  implementationLog,
  [
    "STD-17 Executive Focus Mode",
    'data-heu-executive-focus-mode="STD-17_EXECUTIVE_FOCUS_MODE"',
    "focus=reports",
    "focus=finance",
    "focus=evidence",
    "focus=legal",
    "focus=modules",
    "focus=blockers",
    "check:heu-executive-focus-mode-readiness",
    "PASS_LOCAL_FOCUS_MODE",
    "does not mutate workflow state",
    "mark production GO",
  ],
  "IMPLEMENTATION-LOG-STD17",
  implementationLogPath,
);

if (
  packageJson.scripts?.["check:heu-executive-focus-mode-readiness"] !==
  "node scripts/check-heu-executive-focus-mode-readiness.mjs"
) {
  fail("package.json missing check:heu-executive-focus-mode-readiness script");
}

console.log("READY PACKAGE-SCRIPT");
console.log(
  "HEU_EXECUTIVE_FOCUS_MODE_READY / NO_GO / BLOCKED: PASS_LOCAL_FOCUS_MODE. This check verifies query-param focus navigation only; it does not mutate workflow state, hide NO-GO status, execute UAT, accept evidence, approve finance action, approve owner GO/NO-GO or mark production GO.",
);
