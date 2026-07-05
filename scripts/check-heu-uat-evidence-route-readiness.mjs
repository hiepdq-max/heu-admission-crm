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

console.log("HEU UAT/evidence route readiness check");
console.log(
  "Secrets, raw PII, bank data, vouchers, passwords, cookies and signed evidence are never printed by this script.",
);

const executiveDashboardPath =
  "components/dashboard/executive-dashboard-overview.tsx";
const executiveReadinessPath =
  "scripts/check-heu-executive-dashboard-readiness.mjs";
const blueprintPath = "docs/HEU_STANDARD_SYSTEM_BLUEPRINT_20260703.md";
const implementationLogPath = "docs/HEU_IMPLEMENTATION_LOG.md";
const packageJsonPath = "package.json";

const executiveDashboard = read(executiveDashboardPath);
const executiveReadiness = read(executiveReadinessPath);
const blueprint = read(blueprintPath);
const implementationLog = read(implementationLogPath);
const packageJson = JSON.parse(read(packageJsonPath));

const routeTokens = [
  "STD-16_UAT_EVIDENCE_ROUTE_CHECKLIST",
  "PASS_LOCAL_EVIDENCE_ROUTE",
  "SIGNED_UAT_PENDING",
  "CONTROLLED_EVIDENCE_REQUIRED",
  "OWNER_SIGNOFF_PENDING",
  "NO_UAT_ACCEPTANCE",
  "NO_EVIDENCE_ACCEPTANCE",
  "NO_FINANCE_RELIANCE",
  "NO_ACCESS_CLOSURE",
  "NO_OWNER_GO",
  "NO_PRODUCTION_GO",
  "UAT-EVID-01",
  "UAT-EVID-02",
  "UAT-EVID-03",
  "UAT-EVID-04",
  "UAT-EVID-05",
  "P0-14 controlled evidence intake",
  "P6-04 role/workspace UAT",
  "P2-18 accounting dashboard UAT",
  "P5-03 Finance Desk UAT",
  "P0-09/P0-15 owner decision pack",
];

const triageTokens = [
  "STD-27_EXECUTIVE_UAT_EVIDENCE_CLOSURE_TRIAGE",
  "STD-27 UAT/evidence closure triage",
  "PASS_LOCAL_UAT_EVIDENCE_TRIAGE",
  "UAT-CLOSE-01",
  "UAT-CLOSE-02",
  "UAT-CLOSE-03",
  "UAT-CLOSE-04",
  "UAT-CLOSE-05",
  "Controlled evidence location",
  "Signed UAT route state",
  "Role/access closure dependency",
  "Finance/legal reliance dependency",
  "Final owner decision pack",
];

const fastActionTokens = [
  "STD-36_EXECUTIVE_UAT_EVIDENCE_FAST_ACTION_QUEUE",
  "STD-36 UAT/evidence fast action queue",
  "PASS_LOCAL_UAT_EVIDENCE_FAST_ACTION_QUEUE",
  "FAST_ACTION_QUEUE",
  "NO_EVIDENCE_UPLOAD",
  "UAT-FAST-01",
  "UAT-FAST-02",
  "UAT-FAST-03",
  "UAT-FAST-04",
  "UAT-FAST-05",
  "UAT-FAST-06",
  "P0-14 controlled evidence intake",
  "P6-04 role/workspace proof",
  "P2-18/P5-03 finance signed proof",
  "P0-19 legal/SOP confirmation",
  "P6-03/P6-06 audit and cascade closure",
  "P0-09/P0-15 final owner packet",
];

const acceptanceLockTokens = [
  "STD-42_EXECUTIVE_UAT_EVIDENCE_ACCEPTANCE_LOCK",
  "STD-42 UAT/evidence acceptance lock",
  "PASS_LOCAL_UAT_EVIDENCE_ACCEPTANCE_LOCK",
  "ACCEPTANCE_LOCK",
  "REDACTION_REVIEW_REQUIRED",
  "NO_RAW_EVIDENCE_MOVEMENT",
  "NO_DASHBOARD_RELIANCE",
  "NO_PAYMENT_EXECUTION",
  "NO_OFFICIAL_SOP",
  "NO_WORKFLOW_RELIANCE",
  "NO_AUDIT_CLOSURE",
  "NO_WAIVER_RELIANCE",
  "NO_HIDDEN_EVIDENCE_MOVEMENT",
  "UAT-LOCK-01",
  "UAT-LOCK-02",
  "UAT-LOCK-03",
  "UAT-LOCK-04",
  "UAT-LOCK-05",
  "UAT-LOCK-06",
  "P0-14 controlled evidence intake",
  "P6-04 role/scope UAT proof",
  "P2-18/P5-03 finance UAT",
  "P0-19 legal/SOP confirmation",
  "P6-03/P6-06 audit and cascade closure",
  "P0-09/P0-15 final owner packet",
];

requireText(
  executiveDashboard,
  /data-heu-executive-uat-evidence-route="STD-16_UAT_EVIDENCE_ROUTE_CHECKLIST"[\s\S]*data-heu-executive-uat-evidence-boundary="PASS_LOCAL_EVIDENCE_ROUTE SIGNED_UAT_PENDING CONTROLLED_EVIDENCE_REQUIRED OWNER_SIGNOFF_PENDING NO_UAT_ACCEPTANCE NO_EVIDENCE_ACCEPTANCE NO_FINANCE_RELIANCE NO_ACCESS_CLOSURE NO_OWNER_GO NO_PRODUCTION_GO"[\s\S]*data-heu-executive-uat-evidence-overflow-guard="STD-16_NO_OVERFLOW"/,
  "EXEC-DASHBOARD-STD16-UAT-EVIDENCE-ANCHOR",
  executiveDashboardPath,
);
requireAllText(
  executiveDashboard,
  [
    "UAT/evidence signed route",
    "P0-14/P6-04/P2-18/P5-03 signed evidence pending",
    "No raw screenshots, bank data, vouchers, passwords or evidence acceptance in Git/Codex/chat.",
    "No access closure, role expansion or real-user reliance from PASS_LOCAL.",
    "No finance reliance, voucher posting, payment execution or bank instruction.",
    "No owner GO/NO-GO, migration approval or production GO from dashboard/PASS_LOCAL.",
    ...routeTokens,
  ],
  "EXEC-DASHBOARD-STD16-UAT-EVIDENCE-TOKENS",
  executiveDashboardPath,
);
requireAllText(
  executiveDashboard,
  triageTokens,
  "EXEC-DASHBOARD-STD27-UAT-EVIDENCE-TRIAGE-TOKENS",
  executiveDashboardPath,
);
requireText(
  executiveDashboard,
  /data-heu-executive-uat-evidence-fast-action="STD-36_EXECUTIVE_UAT_EVIDENCE_FAST_ACTION_QUEUE"[\s\S]*data-heu-executive-uat-evidence-fast-action-boundary="PASS_LOCAL_UAT_EVIDENCE_FAST_ACTION_QUEUE READ_ONLY FAST_ACTION_QUEUE P0-14 P6-04 P2-18 P5-03 P6-03 P6-06 P0-09 P0-15 SIGNED_UAT_PENDING CONTROLLED_EVIDENCE_REQUIRED OWNER_SIGNOFF_PENDING NO_EVIDENCE_UPLOAD NO_UAT_EXECUTION NO_UAT_ACCEPTANCE NO_EVIDENCE_ACCEPTANCE NO_ACCESS_GRANT NO_ACCESS_CLOSURE NO_PERMISSION_EXPANSION NO_FINANCE_RELIANCE NO_LEGAL_CONCLUSION NO_OWNER_GO NO_PRODUCTION_GO"[\s\S]*data-heu-executive-uat-evidence-fast-action-overflow-guard="STD-36_NO_OVERFLOW"/,
  "EXEC-DASHBOARD-STD36-UAT-EVIDENCE-FAST-ACTION-ANCHOR",
  executiveDashboardPath,
);
requireAllText(
  executiveDashboard,
  fastActionTokens,
  "EXEC-DASHBOARD-STD36-UAT-EVIDENCE-FAST-ACTION-TOKENS",
  executiveDashboardPath,
);
requireText(
  executiveDashboard,
  /data-heu-executive-uat-evidence-acceptance-lock="STD-42_EXECUTIVE_UAT_EVIDENCE_ACCEPTANCE_LOCK"[\s\S]*data-heu-executive-uat-evidence-acceptance-lock-boundary="PASS_LOCAL_UAT_EVIDENCE_ACCEPTANCE_LOCK READ_ONLY ACCEPTANCE_LOCK SIGNED_UAT_PENDING CONTROLLED_EVIDENCE_REQUIRED OWNER_SIGNOFF_PENDING REDACTION_REVIEW_REQUIRED NO_EVIDENCE_UPLOAD NO_RAW_EVIDENCE_MOVEMENT NO_UAT_EXECUTION NO_UAT_ACCEPTANCE NO_EVIDENCE_ACCEPTANCE NO_ACCESS_CLOSURE NO_ACCESS_GRANT NO_PERMISSION_EXPANSION NO_FINANCE_RELIANCE NO_DASHBOARD_RELIANCE NO_PAYMENT_EXECUTION NO_LEGAL_CONCLUSION NO_OFFICIAL_SOP NO_WORKFLOW_RELIANCE NO_AUDIT_CLOSURE NO_WAIVER_RELIANCE NO_HIDDEN_EVIDENCE_MOVEMENT NO_OWNER_GO NO_PRODUCTION_GO"[\s\S]*data-heu-executive-uat-evidence-acceptance-lock-overflow-guard="STD-42_NO_OVERFLOW"/,
  "EXEC-DASHBOARD-STD42-UAT-EVIDENCE-ACCEPTANCE-LOCK-ANCHOR",
  executiveDashboardPath,
);
requireAllText(
  executiveDashboard,
  acceptanceLockTokens,
  "EXEC-DASHBOARD-STD42-UAT-EVIDENCE-ACCEPTANCE-LOCK-TOKENS",
  executiveDashboardPath,
);
requireAllText(
  executiveReadiness,
  [
    "STD-16_UAT_EVIDENCE_ROUTE_CHECKLIST",
    "EXEC-DASHBOARD-UAT-EVIDENCE-ROUTE-ANCHOR",
    "EXEC-DASHBOARD-UAT-EVIDENCE-ROUTE-TOKENS",
    "EXEC-DASHBOARD-UAT-EVIDENCE-CLOSURE-TRIAGE-ANCHOR",
    "EXEC-DASHBOARD-UAT-EVIDENCE-CLOSURE-TRIAGE-TOKENS",
    "EXEC-DASHBOARD-UAT-EVIDENCE-FAST-ACTION-ANCHOR",
    "EXEC-DASHBOARD-UAT-EVIDENCE-FAST-ACTION-TOKENS",
    "EXEC-DASHBOARD-UAT-EVIDENCE-ACCEPTANCE-LOCK-ANCHOR",
    "EXEC-DASHBOARD-UAT-EVIDENCE-ACCEPTANCE-LOCK-TOKENS",
    "PASS_LOCAL_EVIDENCE_ROUTE",
    "PASS_LOCAL_UAT_EVIDENCE_TRIAGE",
    "PASS_LOCAL_UAT_EVIDENCE_FAST_ACTION_QUEUE",
    "PASS_LOCAL_UAT_EVIDENCE_ACCEPTANCE_LOCK",
    "NO_EVIDENCE_ACCEPTANCE",
  ],
  "EXECUTIVE-READINESS-STD16",
  executiveReadinessPath,
);
requireAllText(
  blueprint,
  [
    "STD-16",
    "STD-16_UAT_EVIDENCE_ROUTE_CHECKLIST",
    "PASS_LOCAL_EVIDENCE_ROUTE",
    "SIGNED_UAT_PENDING",
    "NO_EVIDENCE_ACCEPTANCE",
    "NO_ACCESS_CLOSURE",
    "STD-27",
    "STD-27_EXECUTIVE_UAT_EVIDENCE_CLOSURE_TRIAGE",
    "PASS_LOCAL_UAT_EVIDENCE_TRIAGE",
    "STD-36",
    "STD-36_EXECUTIVE_UAT_EVIDENCE_FAST_ACTION_QUEUE",
    "PASS_LOCAL_UAT_EVIDENCE_FAST_ACTION_QUEUE",
    "STD-42",
    "STD-42_EXECUTIVE_UAT_EVIDENCE_ACCEPTANCE_LOCK",
    "PASS_LOCAL_UAT_EVIDENCE_ACCEPTANCE_LOCK",
    "ACCEPTANCE_LOCK",
    "UAT-LOCK-01",
    "UAT-LOCK-06",
  ],
  "BLUEPRINT-STD16-UAT-EVIDENCE",
  blueprintPath,
);
requireAllText(
  implementationLog,
  [
    "STD-16 Executive UAT Evidence Route",
    'data-heu-executive-uat-evidence-route="STD-16_UAT_EVIDENCE_ROUTE_CHECKLIST"',
    "UAT-EVID-01",
    "UAT-EVID-05",
    "PASS_LOCAL_EVIDENCE_ROUTE",
    "check:heu-uat-evidence-route-readiness",
    "does not execute UAT",
    "accept evidence",
    "mark production GO",
    "STD-27 Executive UAT Evidence Triage",
    'data-heu-executive-uat-evidence-closure-triage="STD-27_EXECUTIVE_UAT_EVIDENCE_CLOSURE_TRIAGE"',
    "PASS_LOCAL_UAT_EVIDENCE_TRIAGE",
    "STD-36 Executive UAT Evidence Fast Action Queue",
    'data-heu-executive-uat-evidence-fast-action="STD-36_EXECUTIVE_UAT_EVIDENCE_FAST_ACTION_QUEUE"',
    "PASS_LOCAL_UAT_EVIDENCE_FAST_ACTION_QUEUE",
    "STD-42 Executive UAT Evidence Acceptance Lock",
    'data-heu-executive-uat-evidence-acceptance-lock="STD-42_EXECUTIVE_UAT_EVIDENCE_ACCEPTANCE_LOCK"',
    "PASS_LOCAL_UAT_EVIDENCE_ACCEPTANCE_LOCK",
  ],
  "IMPLEMENTATION-LOG-STD16",
  implementationLogPath,
);

if (
  packageJson.scripts?.["check:heu-uat-evidence-route-readiness"] !==
  "node scripts/check-heu-uat-evidence-route-readiness.mjs"
) {
  fail("package.json missing check:heu-uat-evidence-route-readiness script");
}

console.log("READY PACKAGE-SCRIPT");
if (
  packageJson.scripts?.[
    "check:heu-executive-uat-evidence-acceptance-lock-readiness"
  ] !==
  "node scripts/check-heu-executive-uat-evidence-acceptance-lock-readiness.mjs"
) {
  fail(
    "package.json missing check:heu-executive-uat-evidence-acceptance-lock-readiness script",
  );
}

console.log("READY PACKAGE-EXECUTIVE-UAT-EVIDENCE-ACCEPTANCE-LOCK-SCRIPT");
console.log(
  "HEU_UAT_EVIDENCE_ROUTE_READY / NO_GO / BLOCKED: PASS_LOCAL_EVIDENCE_ROUTE with PASS_LOCAL_UAT_EVIDENCE_FAST_ACTION_QUEUE and PASS_LOCAL_UAT_EVIDENCE_ACCEPTANCE_LOCK. This check verifies the evidence route checklist only; it does not collect evidence, upload evidence, move raw evidence, execute UAT, accept UAT, accept evidence, grant access, close access, approve finance reliance, approve owner GO/NO-GO or mark production GO.",
);
