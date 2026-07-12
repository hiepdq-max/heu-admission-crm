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

console.log("HEU executive Legal/SOP evidence-authority queue readiness check");
console.log(
  "Secrets, raw PII, bank data, vouchers, passwords, legal documents and signed evidence are never printed by this script.",
);

const executiveDashboardPath =
  "components/dashboard/executive-dashboard-overview.tsx";
const executiveReadinessPath =
  "scripts/check-heu-executive-dashboard-readiness.mjs";
const requiredAnswerPath =
  "scripts/check-heu-executive-legal-sop-required-answer-index-readiness.mjs";
const legalTriagePath =
  "scripts/check-heu-executive-legal-sop-triage-readiness.mjs";
const legalAuthorityPath = "scripts/check-heu-legal-sop-authority-readiness.mjs";
const visualQaPath = "scripts/check-heu-executive-dashboard-visual-qa.mjs";
const legalMatrixPath =
  "docs/HEU_LEGAL_SOP_GOVERNANCE_CONTROL_MATRIX_20260628_V01_DRAFT.md";
const blueprintPath = "docs/HEU_STANDARD_SYSTEM_BLUEPRINT_20260703.md";
const implementationLogPath = "docs/HEU_IMPLEMENTATION_LOG.md";
const packageJsonPath = "package.json";

const executiveDashboard = read(executiveDashboardPath);
const executiveReadiness = read(executiveReadinessPath);
const requiredAnswer = read(requiredAnswerPath);
const legalTriage = read(legalTriagePath);
const legalAuthority = read(legalAuthorityPath);
const visualQa = read(visualQaPath);
const legalMatrix = read(legalMatrixPath);
const blueprint = read(blueprintPath);
const implementationLog = read(implementationLogPath);
const packageJson = JSON.parse(read(packageJsonPath));

const evidenceAuthorityTokens = [
  "ExecutiveLegalSopEvidenceAuthorityQueue",
  "executiveLegalSopEvidenceAuthorityQueueRows",
  "STD-40_EXECUTIVE_LEGAL_SOP_EVIDENCE_AUTHORITY_QUEUE",
  "STD-40 Evidence-authority queue",
  "PASS_LOCAL_LEGAL_SOP_EVIDENCE_AUTHORITY_QUEUE",
  "EVIDENCE_AUTHORITY_QUEUE",
  "PHAP_CHE_REVIEW_REQUIRED",
  "SOP_OWNER_SIGNOFF_REQUIRED",
  "MAKER_CHECKER_APPROVER_REQUIRED",
  "CONTROLLED_EVIDENCE_REQUIRED",
  "EXTERNAL_SIGNOFF_REQUIRED",
  "OWNER_SIGNOFF_PENDING",
  "NO_LEGAL_ADVICE",
  "NO_OFFICIAL_SOP",
  "NO_APPROVAL_ACTION",
  "NO_FINANCE_ACTION",
  "NO_DASHBOARD_RELIANCE",
  "NO_REPORT_VIEW_RELIANCE",
  "NO_RAW_EVIDENCE_MOVEMENT",
  "NO_EVIDENCE_ACCEPTANCE",
  "NO_UAT_ACCEPTANCE",
  "NO_OWNER_GO",
  "NO_PRODUCTION_GO",
  "LAW-QUEUE-01",
  "LAW-QUEUE-02",
  "LAW-QUEUE-03",
  "LAW-QUEUE-04",
  "LAW-QUEUE-05",
  "LAW-QUEUE-06",
  "Legal basis hold",
  "SOP version hold",
  "Maker/checker/approver hold",
  "Controlled evidence hold",
  "External signer hold",
  "Dashboard/report reliance legal hold",
  "Cau tra loi con thieu",
  "Bang chung / tham quyen",
  "Control tiep",
];

requireText(
  executiveDashboard,
  /data-heu-executive-legal-sop-evidence-authority-queue="STD-40_EXECUTIVE_LEGAL_SOP_EVIDENCE_AUTHORITY_QUEUE"[\s\S]*data-heu-executive-legal-sop-evidence-authority-boundary="DRAFT_CONTROL PASS_LOCAL_LEGAL_SOP_EVIDENCE_AUTHORITY_QUEUE EVIDENCE_AUTHORITY_QUEUE PHAP_CHE_REVIEW_REQUIRED SOP_OWNER_SIGNOFF_REQUIRED MAKER_CHECKER_APPROVER_REQUIRED CONTROLLED_EVIDENCE_REQUIRED EXTERNAL_SIGNOFF_REQUIRED OWNER_SIGNOFF_PENDING NO_LEGAL_ADVICE NO_OFFICIAL_SOP NO_APPROVAL_ACTION NO_FINANCE_ACTION NO_DASHBOARD_RELIANCE NO_REPORT_VIEW_RELIANCE NO_RAW_EVIDENCE_MOVEMENT NO_EVIDENCE_ACCEPTANCE NO_UAT_ACCEPTANCE NO_OWNER_GO NO_PRODUCTION_GO"[\s\S]*data-heu-executive-legal-sop-evidence-authority-overflow-guard="STD-40_NO_OVERFLOW"/,
  "EXEC-DASHBOARD-STD40-EVIDENCE-AUTHORITY-ANCHOR",
  executiveDashboardPath,
);
requireAllText(
  executiveDashboard,
  evidenceAuthorityTokens,
  "EXEC-DASHBOARD-STD40-EVIDENCE-AUTHORITY-TOKENS",
  executiveDashboardPath,
);
requireAllText(
  executiveReadiness,
  [
    "EXEC-DASHBOARD-LEGAL-SOP-EVIDENCE-AUTHORITY-ANCHOR",
    "EXEC-DASHBOARD-LEGAL-SOP-EVIDENCE-AUTHORITY-TOKENS",
    "PASS_LOCAL_LEGAL_SOP_EVIDENCE_AUTHORITY_QUEUE",
    "check:heu-executive-legal-sop-evidence-authority-queue-readiness",
  ],
  "EXECUTIVE-READINESS-STD40",
  executiveReadinessPath,
);
requireAllText(
  requiredAnswer,
  [
    "STD-40_EXECUTIVE_LEGAL_SOP_EVIDENCE_AUTHORITY_QUEUE",
    "LAW-QUEUE-01",
    "LAW-QUEUE-06",
    "PASS_LOCAL_LEGAL_SOP_EVIDENCE_AUTHORITY_QUEUE",
  ],
  "REQUIRED-ANSWER-CHECKER-STD40",
  requiredAnswerPath,
);
requireAllText(
  legalTriage,
  [
    "STD-40_EXECUTIVE_LEGAL_SOP_EVIDENCE_AUTHORITY_QUEUE",
    "LAW-QUEUE-01",
    "LAW-QUEUE-06",
    "PASS_LOCAL_LEGAL_SOP_EVIDENCE_AUTHORITY_QUEUE",
  ],
  "LEGAL-TRIAGE-CHECKER-STD40",
  legalTriagePath,
);
requireAllText(
  legalAuthority,
  [
    "STD-40_EXECUTIVE_LEGAL_SOP_EVIDENCE_AUTHORITY_QUEUE",
    "LAW-QUEUE-01",
    "LAW-QUEUE-06",
    "PASS_LOCAL_LEGAL_SOP_EVIDENCE_AUTHORITY_QUEUE",
  ],
  "LEGAL-AUTHORITY-CHECKER-STD40",
  legalAuthorityPath,
);
requireAllText(
  visualQa,
  [
    'data-heu-executive-legal-sop-evidence-authority-queue="STD-40_EXECUTIVE_LEGAL_SOP_EVIDENCE_AUTHORITY_QUEUE"',
    "STD-40 Evidence-authority queue",
    "LAW-QUEUE-01",
    "LAW-QUEUE-06",
    "PASS_LOCAL_LEGAL_SOP_EVIDENCE_AUTHORITY_QUEUE",
  ],
  "VISUAL-QA-STD40",
  visualQaPath,
);
requireAllText(
  legalMatrix,
  [
    "STD-40 Evidence Authority Queue",
    "STD-40_EXECUTIVE_LEGAL_SOP_EVIDENCE_AUTHORITY_QUEUE",
    "LAW-QUEUE-01",
    "LAW-QUEUE-06",
    "PASS_LOCAL_LEGAL_SOP_EVIDENCE_AUTHORITY_QUEUE",
    "EVIDENCE_AUTHORITY_QUEUE",
    "NO_RAW_EVIDENCE_MOVEMENT",
    "NO_EVIDENCE_ACCEPTANCE",
    "NO_UAT_ACCEPTANCE",
    "does not provide legal advice",
    "issue official SOP",
    "mark production GO",
  ],
  "LEGAL-MATRIX-STD40",
  legalMatrixPath,
);
requireAllText(
  blueprint,
  [
    "STD-40",
    "STD-40_EXECUTIVE_LEGAL_SOP_EVIDENCE_AUTHORITY_QUEUE",
    "PASS_LOCAL_LEGAL_SOP_EVIDENCE_AUTHORITY_QUEUE",
    "EVIDENCE_AUTHORITY_QUEUE",
    "LAW-QUEUE-01",
    "LAW-QUEUE-06",
    "NO_RAW_EVIDENCE_MOVEMENT",
    "NO_EVIDENCE_ACCEPTANCE",
    "NO_UAT_ACCEPTANCE",
  ],
  "BLUEPRINT-STD40",
  blueprintPath,
);
requireAllText(
  implementationLog,
  [
    "STD-40 Executive Legal SOP Evidence Authority Queue",
    'data-heu-executive-legal-sop-evidence-authority-queue="STD-40_EXECUTIVE_LEGAL_SOP_EVIDENCE_AUTHORITY_QUEUE"',
    "LAW-QUEUE-01",
    "LAW-QUEUE-06",
    "PASS_LOCAL_LEGAL_SOP_EVIDENCE_AUTHORITY_QUEUE",
    "check:heu-executive-legal-sop-evidence-authority-queue-readiness",
    /does not provide legal advice/i,
    "mark production GO",
  ],
  "IMPLEMENTATION-LOG-STD40",
  implementationLogPath,
);

if (
  packageJson.scripts?.[
    "check:heu-executive-legal-sop-evidence-authority-queue-readiness"
  ] !==
  "node scripts/check-heu-executive-legal-sop-evidence-authority-queue-readiness.mjs"
) {
  fail(
    "package.json missing check:heu-executive-legal-sop-evidence-authority-queue-readiness script",
  );
}

console.log("READY PACKAGE-SCRIPT");
console.log(
  "HEU_EXECUTIVE_LEGAL_SOP_EVIDENCE_AUTHORITY_QUEUE_READY / NO_GO / BLOCKED: PASS_LOCAL_LEGAL_SOP_EVIDENCE_AUTHORITY_QUEUE. This check verifies the executive Legal/SOP evidence-authority queue only; it does not provide legal advice, issue official SOP, approve workflow state, execute finance, accept UAT, accept evidence, approve owner GO/NO-GO or mark production GO.",
);
