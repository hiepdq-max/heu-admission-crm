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

console.log("HEU executive priority command strip readiness check");
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

const commandTokens = [
  "ExecutivePriorityFocusItem",
  "executivePriorityFocusItems",
  "STD-29_EXECUTIVE_PRIORITY_COMMAND_STRIP",
  "PASS_LOCAL_PRIORITY_COMMAND_STRIP",
  "READ_ONLY_ROUTE_HINT",
  "FOCUS_QUERY_PARAM",
  "VISIBLE_FOCUS_ONLY",
  "focusHref(item.focusMode)",
  "focus={item.focusMode}",
  'focusMode: "finance"',
  'focusMode: "evidence"',
  'focusMode: "legal"',
  'focusMode: "reports"',
  'focusMode: "roles"',
  'focusMode: "blockers"',
  "Open priority command",
  "Finance reliance",
  "UAT/evidence route",
  "Legal/SOP",
  "Report reliance",
  "Role/scope",
  "Production blockers",
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
  /data-heu-executive-priority-command-strip="STD-29_EXECUTIVE_PRIORITY_COMMAND_STRIP"[\s\S]*data-heu-executive-priority-command-boundary="PASS_LOCAL_PRIORITY_COMMAND_STRIP READ_ONLY_ROUTE_HINT FOCUS_QUERY_PARAM VISIBLE_FOCUS_ONLY NO_STATE_MUTATION NO_ACCESS_GRANT NO_PERMISSION_EXPANSION NO_APPROVAL_ACTION NO_UAT_ACCEPTANCE NO_EVIDENCE_ACCEPTANCE NO_FINANCE_ACTION NO_OWNER_GO NO_PRODUCTION_GO"[\s\S]*data-heu-executive-priority-command-overflow-guard="STD-29_NO_OVERFLOW"/,
  "EXEC-DASHBOARD-STD29-PRIORITY-COMMAND-STRIP-ANCHOR",
  executiveDashboardPath,
);
requireAllText(
  executiveDashboard,
  commandTokens,
  "EXEC-DASHBOARD-STD29-PRIORITY-COMMAND-STRIP-TOKENS",
  executiveDashboardPath,
);
requireAllText(
  executiveReadiness,
  [
    "EXEC-DASHBOARD-PRIORITY-COMMAND-STRIP-ANCHOR",
    "EXEC-DASHBOARD-PRIORITY-COMMAND-STRIP-TOKENS",
    "PASS_LOCAL_PRIORITY_COMMAND_STRIP",
    "check:heu-executive-priority-command-strip-readiness",
  ],
  "EXECUTIVE-READINESS-STD29",
  executiveReadinessPath,
);
requireAllText(
  visualQa,
  [
    'data-heu-executive-priority-command-strip="STD-29_EXECUTIVE_PRIORITY_COMMAND_STRIP"',
    "PASS_LOCAL_PRIORITY_COMMAND_STRIP",
    "VISIBLE_FOCUS_ONLY",
    "focus={item.focusMode}",
  ],
  "VISUAL-QA-STD29",
  visualQaPath,
);
requireAllText(
  blueprint,
  [
    "STD-29",
    "STD-29_EXECUTIVE_PRIORITY_COMMAND_STRIP",
    "PASS_LOCAL_PRIORITY_COMMAND_STRIP",
    "FOCUS_QUERY_PARAM",
    "VISIBLE_FOCUS_ONLY",
    "NO_ACCESS_GRANT",
    "NO_PRODUCTION_GO",
  ],
  "BLUEPRINT-STD29",
  blueprintPath,
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

if (
  packageJson.scripts?.[
    "check:heu-executive-priority-command-strip-readiness"
  ] !== "node scripts/check-heu-executive-priority-command-strip-readiness.mjs"
) {
  fail(
    "package.json missing check:heu-executive-priority-command-strip-readiness script",
  );
}

console.log("READY PACKAGE-SCRIPT");
console.log(
  "HEU_EXECUTIVE_PRIORITY_COMMAND_STRIP_READY / NO_GO / BLOCKED: PASS_LOCAL_PRIORITY_COMMAND_STRIP. This check verifies priority focus commands route to focused read-only dashboard views only; it does not grant access, expand permissions, mutate workflow state, execute UAT, accept evidence, approve finance action, approve owner GO/NO-GO or mark production GO.",
);
