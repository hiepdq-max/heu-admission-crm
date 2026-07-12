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

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function boundaryAttributePattern({
  anchorAttribute,
  anchorValue,
  boundaryAttribute,
  boundaryTokens,
  overflowAttribute,
  overflowValue,
}) {
  const boundaryLookaheads = boundaryTokens
    .map((token) => `(?=[^"]*${escapeRegExp(token)})`)
    .join("");

  return new RegExp(
    `${escapeRegExp(anchorAttribute)}="${escapeRegExp(anchorValue)}"` +
      `[\\s\\S]*${escapeRegExp(boundaryAttribute)}="${boundaryLookaheads}[^"]*"` +
      `[\\s\\S]*${escapeRegExp(overflowAttribute)}="${escapeRegExp(overflowValue)}"`,
  );
}

console.log("HEU executive operating brain completion readiness check");
console.log(
  "Secrets, passwords, emails, raw PII, bank data, vouchers and signed evidence are never printed by this script.",
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

const completionTokens = [
  "ExecutiveOperatingBrainCompletion",
  "executiveOperatingBrainCompletionRows",
  "STD-43_EXECUTIVE_OPERATING_BRAIN_COMPLETION_GATE",
  "STD-43 Executive operating brain completion gate",
  "PASS_LOCAL_EXECUTIVE_OPERATING_BRAIN_COMPLETION",
  "COMPLETION_GATE",
  "STD-01",
  "STD-37",
  "STD-38",
  "STD-39",
  "STD-40",
  "STD-41",
  "STD-42",
  "SCOPE_BOUND_DASHBOARD",
  "ROUTE_VISIBILITY_MATRIX",
  "REPORT_VIEW_TO_DASHBOARD_SCOPE",
  "EVIDENCE_AUTHORITY_QUEUE",
  "RELIANCE_LOCK",
  "ACCEPTANCE_LOCK",
  "SIGNED_UAT_PENDING",
  "OWNER_SIGNOFF_PENDING",
  "CONTROLLED_EVIDENCE_REQUIRED",
  "NO_STATE_MUTATION",
  "NO_ACCESS_GRANT",
  "NO_PERMISSION_EXPANSION",
  "NO_ACCOUNT_CREATE",
  "NO_ROLE_ASSIGNMENT",
  "NO_DASHBOARD_RELIANCE",
  "NO_REPORT_VIEW_RELIANCE",
  "NO_FINANCE_RELIANCE",
  "NO_FINANCE_ACTION",
  "NO_LEGAL_CONCLUSION",
  "NO_OFFICIAL_SOP",
  "NO_UAT_EXECUTION",
  "NO_UAT_ACCEPTANCE",
  "NO_EVIDENCE_ACCEPTANCE",
  "NO_OWNER_GO",
  "NO_PRODUCTION_GO",
  "BRAIN-GATE-01",
  "BRAIN-GATE-02",
  "BRAIN-GATE-03",
  "BRAIN-GATE-04",
  "BRAIN-GATE-05",
  "BRAIN-GATE-06",
  "Executive read-only landing",
  "Role/scope dashboard visibility",
  "Report/source reliance map",
  "Legal/SOP authority backbone",
  "Finance read-only reliance lock",
  "UAT/evidence acceptance lock",
  "Quyen o dau thi chi duoc xem dashboard o day",
];

const completionBoundaryTokens = [
  "PASS_LOCAL_EXECUTIVE_OPERATING_BRAIN_COMPLETION",
  "READ_ONLY",
  "COMPLETION_GATE",
  "STD-01",
  "STD-37",
  "STD-38",
  "STD-39",
  "STD-40",
  "STD-41",
  "STD-42",
  "SCOPE_BOUND_DASHBOARD",
  "ROUTE_VISIBILITY_MATRIX",
  "REPORT_VIEW_TO_DASHBOARD_SCOPE",
  "EVIDENCE_AUTHORITY_QUEUE",
  "RELIANCE_LOCK",
  "ACCEPTANCE_LOCK",
  "SIGNED_UAT_PENDING",
  "OWNER_SIGNOFF_PENDING",
  "CONTROLLED_EVIDENCE_REQUIRED",
  "NO_STATE_MUTATION",
  "NO_ACCESS_GRANT",
  "NO_PERMISSION_EXPANSION",
  "NO_ACCOUNT_CREATE",
  "NO_ROLE_ASSIGNMENT",
  "NO_DASHBOARD_RELIANCE",
  "NO_REPORT_VIEW_RELIANCE",
  "NO_FINANCE_RELIANCE",
  "NO_FINANCE_ACTION",
  "NO_LEGAL_CONCLUSION",
  "NO_OFFICIAL_SOP",
  "NO_UAT_EXECUTION",
  "NO_UAT_ACCEPTANCE",
  "NO_EVIDENCE_ACCEPTANCE",
  "NO_OWNER_GO",
  "NO_PRODUCTION_GO",
];

requireText(
  executiveDashboard,
  boundaryAttributePattern({
    anchorAttribute: "data-heu-executive-operating-brain-completion",
    anchorValue: "STD-43_EXECUTIVE_OPERATING_BRAIN_COMPLETION_GATE",
    boundaryAttribute: "data-heu-executive-operating-brain-completion-boundary",
    boundaryTokens: completionBoundaryTokens,
    overflowAttribute: "data-heu-executive-operating-brain-completion-overflow-guard",
    overflowValue: "STD-43_NO_OVERFLOW",
  }),
  "EXEC-DASHBOARD-STD43-OPERATING-BRAIN-COMPLETION-ANCHOR",
  executiveDashboardPath,
);
requireAllText(
  executiveDashboard,
  completionTokens,
  "EXEC-DASHBOARD-STD43-OPERATING-BRAIN-COMPLETION-TOKENS",
  executiveDashboardPath,
);
requireAllText(
  executiveReadiness,
  [
    "EXEC-DASHBOARD-OPERATING-BRAIN-COMPLETION-ANCHOR",
    "EXEC-DASHBOARD-OPERATING-BRAIN-COMPLETION-TOKENS",
    "PASS_LOCAL_EXECUTIVE_OPERATING_BRAIN_COMPLETION",
    "check:heu-executive-operating-brain-completion-readiness",
  ],
  "EXECUTIVE-READINESS-STD43",
  executiveReadinessPath,
);
requireAllText(
  visualQa,
  [
    'data-heu-executive-operating-brain-completion="STD-43_EXECUTIVE_OPERATING_BRAIN_COMPLETION_GATE"',
    "STD-43 Executive operating brain completion gate",
    "BRAIN-GATE-01",
    "BRAIN-GATE-06",
    "PASS_LOCAL_EXECUTIVE_OPERATING_BRAIN_COMPLETION",
  ],
  "VISUAL-QA-STD43",
  visualQaPath,
);
requireAllText(
  blueprint,
  [
    "STD-43",
    "STD-43_EXECUTIVE_OPERATING_BRAIN_COMPLETION_GATE",
    "PASS_LOCAL_EXECUTIVE_OPERATING_BRAIN_COMPLETION",
    "COMPLETION_GATE",
    "BRAIN-GATE-01",
    "BRAIN-GATE-06",
    "Quyen o dau thi chi duoc xem dashboard o day",
    "NO_DASHBOARD_RELIANCE",
    "NO_FINANCE_RELIANCE",
    "NO_UAT_ACCEPTANCE",
    "NO_EVIDENCE_ACCEPTANCE",
  ],
  "BLUEPRINT-STD43",
  blueprintPath,
);
requireAllText(
  implementationLog,
  [
    "STD-43 Executive Operating Brain Completion Gate",
    'data-heu-executive-operating-brain-completion="STD-43_EXECUTIVE_OPERATING_BRAIN_COMPLETION_GATE"',
    "BRAIN-GATE-01",
    "BRAIN-GATE-06",
    "PASS_LOCAL_EXECUTIVE_OPERATING_BRAIN_COMPLETION",
    "check:heu-executive-operating-brain-completion-readiness",
    /does not grant access/i,
    "accept evidence",
    "mark production GO",
  ],
  "IMPLEMENTATION-LOG-STD43",
  implementationLogPath,
);

if (
  packageJson.scripts?.[
    "check:heu-executive-operating-brain-completion-readiness"
  ] !==
  "node scripts/check-heu-executive-operating-brain-completion-readiness.mjs"
) {
  fail(
    "package.json missing check:heu-executive-operating-brain-completion-readiness script",
  );
}

console.log("READY PACKAGE-SCRIPT");
console.log(
  "HEU_EXECUTIVE_OPERATING_BRAIN_COMPLETION_READY / NO_GO / BLOCKED: PASS_LOCAL_EXECUTIVE_OPERATING_BRAIN_COMPLETION. This check verifies the executive operating brain completion gate only; it does not create accounts, assign roles, grant access, expand permissions, mutate workflow state, approve dashboard reliance, approve finance reliance, issue legal conclusions, execute UAT, accept UAT, accept evidence, approve owner GO/NO-GO or mark production GO.",
);
