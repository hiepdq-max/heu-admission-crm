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

console.log("HEU executive focus scoped navigator readiness check");
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

requireText(
  executiveDashboard,
  /data-heu-executive-focus-scoped-navigator="STD-22_EXECUTIVE_FOCUS_SCOPED_NAVIGATOR"[\s\S]*data-heu-executive-focus-scoped-navigator-boundary="VISIBLE_SECTION_LINKS_ONLY PERSISTENT_OVERVIEW_PRIORITY_NEXT_QUICK NO_HIDDEN_TARGET_LINK NO_STATE_MUTATION NO_APPROVAL_ACTION NO_UAT_ACCEPTANCE NO_EVIDENCE_ACCEPTANCE NO_FINANCE_ACTION NO_OWNER_GO NO_PRODUCTION_GO"[\s\S]*data-heu-executive-focus-scoped-navigator-overflow-guard="STD-22_NO_OVERFLOW"/,
  "EXEC-DASHBOARD-STD22-FOCUS-SCOPED-NAVIGATOR-ANCHOR",
  executiveDashboardPath,
);
requireText(
  executiveDashboard,
  /const visibleSectionNavItems =[\s\S]*getExecutiveSectionNavItemsForFocus\(currentFocusMode\)[\s\S]*visibleSectionNavItems\.map/,
  "EXEC-DASHBOARD-STD22-VISIBLE-NAV-MAP",
  executiveDashboardPath,
);
requireAllText(
  executiveDashboard,
  [
    "STD-22_EXECUTIVE_FOCUS_SCOPED_NAVIGATOR",
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
    "NO_STATE_MUTATION",
    "NO_APPROVAL_ACTION",
    "NO_UAT_ACCEPTANCE",
    "NO_EVIDENCE_ACCEPTANCE",
    "NO_FINANCE_ACTION",
    "NO_OWNER_GO",
    "NO_PRODUCTION_GO",
  ],
  "EXEC-DASHBOARD-STD22-FOCUS-SCOPED-NAVIGATOR-TOKENS",
  executiveDashboardPath,
);
requireAllText(
  executiveReadiness,
  [
    "EXEC-DASHBOARD-FOCUS-SCOPED-NAVIGATOR-ANCHOR",
    "EXEC-DASHBOARD-FOCUS-SCOPED-NAVIGATOR-TOKENS",
    "PASS_LOCAL_FOCUS_SCOPED_NAVIGATOR",
    "check:heu-executive-focus-scoped-navigator-readiness",
  ],
  "EXECUTIVE-READINESS-STD22",
  executiveReadinessPath,
);
requireAllText(
  visualQa,
  [
    'data-heu-executive-focus-scoped-navigator="STD-22_EXECUTIVE_FOCUS_SCOPED_NAVIGATOR"',
    "VISIBLE_SECTION_LINKS_ONLY",
    "NO_HIDDEN_TARGET_LINK",
  ],
  "VISUAL-QA-STD22",
  visualQaPath,
);
requireAllText(
  blueprint,
  [
    "STD-22",
    "STD-22_EXECUTIVE_FOCUS_SCOPED_NAVIGATOR",
    "PASS_LOCAL_FOCUS_SCOPED_NAVIGATOR",
    "PASS_LOCAL_EXECUTIVE_ROLE_SCOPE",
    "VISIBLE_SECTION_LINKS_ONLY",
    "NO_HIDDEN_TARGET_LINK",
    "PERSISTENT_OVERVIEW_PRIORITY_NEXT_QUICK",
  ],
  "BLUEPRINT-STD22-FOCUS-SCOPED-NAVIGATOR",
  blueprintPath,
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

if (
  packageJson.scripts?.[
    "check:heu-executive-focus-scoped-navigator-readiness"
  ] !== "node scripts/check-heu-executive-focus-scoped-navigator-readiness.mjs"
) {
  fail(
    "package.json missing check:heu-executive-focus-scoped-navigator-readiness script",
  );
}

console.log("READY PACKAGE-SCRIPT");
console.log(
  "HEU_EXECUTIVE_FOCUS_SCOPED_NAVIGATOR_READY / NO_GO / BLOCKED: PASS_LOCAL_FOCUS_SCOPED_NAVIGATOR. This check verifies the section navigator links only to visible focused sections; it does not mutate workflow state, execute UAT, accept evidence, approve finance action, approve owner GO/NO-GO or mark production GO.",
);
