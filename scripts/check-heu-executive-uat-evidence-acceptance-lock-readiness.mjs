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

console.log("HEU executive UAT/evidence acceptance lock readiness check");
console.log(
  "Secrets, raw PII, bank data, vouchers, passwords, cookies and signed evidence are never printed by this script.",
);

const executiveDashboardPath =
  "components/dashboard/executive-dashboard-overview.tsx";
const executiveReadinessPath =
  "scripts/check-heu-executive-dashboard-readiness.mjs";
const uatEvidencePath = "scripts/check-heu-uat-evidence-route-readiness.mjs";
const fastActionPath =
  "scripts/check-heu-executive-uat-evidence-fast-action-readiness.mjs";
const triagePath =
  "scripts/check-heu-executive-uat-evidence-triage-readiness.mjs";
const visualQaPath = "scripts/check-heu-executive-dashboard-visual-qa.mjs";
const blueprintPath = "docs/HEU_STANDARD_SYSTEM_BLUEPRINT_20260703.md";
const implementationLogPath = "docs/HEU_IMPLEMENTATION_LOG.md";
const packageJsonPath = "package.json";

const executiveDashboard = read(executiveDashboardPath);
const executiveReadiness = read(executiveReadinessPath);
const uatEvidence = read(uatEvidencePath);
const fastAction = read(fastActionPath);
const triage = read(triagePath);
const visualQa = read(visualQaPath);
const blueprint = read(blueprintPath);
const implementationLog = read(implementationLogPath);
const packageJson = JSON.parse(read(packageJsonPath));

const acceptanceLockTokens = [
  "ExecutiveUatEvidenceAcceptanceLock",
  "uatEvidenceAcceptanceLockRows",
  "STD-42_EXECUTIVE_UAT_EVIDENCE_ACCEPTANCE_LOCK",
  "STD-42 UAT/evidence acceptance lock",
  "PASS_LOCAL_UAT_EVIDENCE_ACCEPTANCE_LOCK",
  "ACCEPTANCE_LOCK",
  "SIGNED_UAT_PENDING",
  "CONTROLLED_EVIDENCE_REQUIRED",
  "OWNER_SIGNOFF_PENDING",
  "REDACTION_REVIEW_REQUIRED",
  "NO_EVIDENCE_UPLOAD",
  "NO_RAW_EVIDENCE_MOVEMENT",
  "NO_UAT_EXECUTION",
  "NO_UAT_ACCEPTANCE",
  "NO_EVIDENCE_ACCEPTANCE",
  "NO_ACCESS_CLOSURE",
  "NO_ACCESS_GRANT",
  "NO_PERMISSION_EXPANSION",
  "NO_FINANCE_RELIANCE",
  "NO_DASHBOARD_RELIANCE",
  "NO_PAYMENT_EXECUTION",
  "NO_LEGAL_CONCLUSION",
  "NO_OFFICIAL_SOP",
  "NO_WORKFLOW_RELIANCE",
  "NO_AUDIT_CLOSURE",
  "NO_WAIVER_RELIANCE",
  "NO_HIDDEN_EVIDENCE_MOVEMENT",
  "NO_OWNER_GO",
  "NO_PRODUCTION_GO",
  "UAT-LOCK-01",
  "UAT-LOCK-02",
  "UAT-LOCK-03",
  "UAT-LOCK-04",
  "UAT-LOCK-05",
  "UAT-LOCK-06",
  "Visible use",
  "Required before acceptance",
  "P0-14 controlled evidence intake",
  "P6-04 role/scope UAT proof",
  "P2-18/P5-03 finance UAT",
  "P0-19 legal/SOP confirmation",
  "P6-03/P6-06 audit and cascade closure",
  "P0-09/P0-15 final owner packet",
  "External evidence id",
  "Signed role/scope UAT",
  "Signed browser UAT",
  "PHAP_CHE legal-basis review",
  "Audit-log proof",
  "Signed UAT closure",
];

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
    "EXEC-DASHBOARD-UAT-EVIDENCE-ACCEPTANCE-LOCK-ANCHOR",
    "EXEC-DASHBOARD-UAT-EVIDENCE-ACCEPTANCE-LOCK-TOKENS",
    "PASS_LOCAL_UAT_EVIDENCE_ACCEPTANCE_LOCK",
    "check:heu-executive-uat-evidence-acceptance-lock-readiness",
  ],
  "EXECUTIVE-READINESS-STD42",
  executiveReadinessPath,
);
requireAllText(
  uatEvidence,
  [
    "STD-42_EXECUTIVE_UAT_EVIDENCE_ACCEPTANCE_LOCK",
    "UAT-LOCK-01",
    "UAT-LOCK-06",
    "PASS_LOCAL_UAT_EVIDENCE_ACCEPTANCE_LOCK",
  ],
  "UAT-EVIDENCE-ROUTE-STD42",
  uatEvidencePath,
);
requireAllText(
  fastAction,
  [
    "STD-42_EXECUTIVE_UAT_EVIDENCE_ACCEPTANCE_LOCK",
    "UAT-LOCK-01",
    "UAT-LOCK-06",
    "PASS_LOCAL_UAT_EVIDENCE_ACCEPTANCE_LOCK",
  ],
  "UAT-EVIDENCE-FAST-ACTION-STD42",
  fastActionPath,
);
requireAllText(
  triage,
  [
    "STD-42_EXECUTIVE_UAT_EVIDENCE_ACCEPTANCE_LOCK",
    "UAT-LOCK-01",
    "UAT-LOCK-06",
    "PASS_LOCAL_UAT_EVIDENCE_ACCEPTANCE_LOCK",
  ],
  "UAT-EVIDENCE-TRIAGE-STD42",
  triagePath,
);
requireAllText(
  visualQa,
  [
    'data-heu-executive-uat-evidence-acceptance-lock="STD-42_EXECUTIVE_UAT_EVIDENCE_ACCEPTANCE_LOCK"',
    "STD-42 UAT/evidence acceptance lock",
    "UAT-LOCK-01",
    "UAT-LOCK-06",
    "PASS_LOCAL_UAT_EVIDENCE_ACCEPTANCE_LOCK",
  ],
  "VISUAL-QA-STD42",
  visualQaPath,
);
requireAllText(
  blueprint,
  [
    "STD-42",
    "STD-42_EXECUTIVE_UAT_EVIDENCE_ACCEPTANCE_LOCK",
    "PASS_LOCAL_UAT_EVIDENCE_ACCEPTANCE_LOCK",
    "ACCEPTANCE_LOCK",
    "UAT-LOCK-01",
    "UAT-LOCK-06",
    "NO_RAW_EVIDENCE_MOVEMENT",
    "NO_UAT_ACCEPTANCE",
    "NO_EVIDENCE_ACCEPTANCE",
  ],
  "BLUEPRINT-STD42",
  blueprintPath,
);
requireAllText(
  implementationLog,
  [
    "STD-42 Executive UAT Evidence Acceptance Lock",
    'data-heu-executive-uat-evidence-acceptance-lock="STD-42_EXECUTIVE_UAT_EVIDENCE_ACCEPTANCE_LOCK"',
    "UAT-LOCK-01",
    "UAT-LOCK-06",
    "PASS_LOCAL_UAT_EVIDENCE_ACCEPTANCE_LOCK",
    "check:heu-executive-uat-evidence-acceptance-lock-readiness",
    /does not collect evidence/i,
    "accept evidence",
    "mark production GO",
  ],
  "IMPLEMENTATION-LOG-STD42",
  implementationLogPath,
);

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

console.log("READY PACKAGE-SCRIPT");
console.log(
  "HEU_EXECUTIVE_UAT_EVIDENCE_ACCEPTANCE_LOCK_READY / NO_GO / BLOCKED: PASS_LOCAL_UAT_EVIDENCE_ACCEPTANCE_LOCK. This check verifies the executive UAT/evidence acceptance lock only; it does not collect evidence, upload evidence, move raw evidence, execute UAT, accept UAT, accept evidence, grant access, close access, expand permissions, approve finance reliance, approve dashboard reliance, issue legal conclusions, approve owner GO/NO-GO or mark production GO.",
);
