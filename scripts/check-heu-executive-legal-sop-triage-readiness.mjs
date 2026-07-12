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

console.log("HEU executive Legal/SOP triage readiness check");
console.log(
  "Secrets, raw PII, bank data, vouchers, passwords, legal documents and signed evidence are never printed by this script.",
);

const executiveDashboardPath =
  "components/dashboard/executive-dashboard-overview.tsx";
const executiveReadinessPath =
  "scripts/check-heu-executive-dashboard-readiness.mjs";
const legalAuthorityPath = "scripts/check-heu-legal-sop-authority-readiness.mjs";
const visualQaPath = "scripts/check-heu-executive-dashboard-visual-qa.mjs";
const blueprintPath = "docs/HEU_STANDARD_SYSTEM_BLUEPRINT_20260703.md";
const implementationLogPath = "docs/HEU_IMPLEMENTATION_LOG.md";
const packageJsonPath = "package.json";

const executiveDashboard = read(executiveDashboardPath);
const executiveReadiness = read(executiveReadinessPath);
const legalAuthority = read(legalAuthorityPath);
const visualQa = read(visualQaPath);
const blueprint = read(blueprintPath);
const implementationLog = read(implementationLogPath);
const packageJson = JSON.parse(read(packageJsonPath));

const triageTokens = [
  "ExecutiveLegalSopTriage",
  "executiveLegalSopTriageRows",
  "STD-25_EXECUTIVE_LEGAL_SOP_TRIAGE",
  "STD-25 Legal/SOP triage",
  "PASS_LOCAL_LEGAL_SOP_TRIAGE",
  "PHAP_CHE_REVIEW_REQUIRED",
  "SOP_OWNER_SIGNOFF_REQUIRED",
  "MAKER_CHECKER_APPROVER_REQUIRED",
  "CONTROLLED_EVIDENCE_REQUIRED",
  "EXTERNAL_SIGNOFF_REQUIRED",
  "NO_LEGAL_ADVICE",
  "NO_OFFICIAL_SOP",
  "NO_APPROVAL_ACTION",
  "NO_FINANCE_ACTION",
  "NO_OWNER_GO",
  "NO_PRODUCTION_GO",
  "LEGAL-TRIAGE-01",
  "LEGAL-TRIAGE-02",
  "LEGAL-TRIAGE-03",
  "LEGAL-TRIAGE-04",
  "LEGAL-TRIAGE-05",
  "Legal basis route",
  "SOP version route",
  "Maker/checker/approver route",
  "Controlled evidence route",
  "External signer route",
];

const requiredAnswerTokens = [
  "ExecutiveLegalSopRequiredAnswerIndex",
  "executiveLegalSopRequiredAnswerIndexRows",
  "STD-34_EXECUTIVE_LEGAL_SOP_REQUIRED_ANSWER_INDEX",
  "STD-34 Required-answer index",
  "PASS_LOCAL_LEGAL_SOP_REQUIRED_ANSWER_INDEX",
  "REQUIRED_ANSWER_INDEX",
  "LAW-IDX-01",
  "LAW-IDX-02",
  "LAW-IDX-03",
  "LAW-IDX-04",
  "LAW-IDX-05",
  "LAW-IDX-06",
  "Can cu",
  "Maker/checker/approver",
  "Chung tu / signer",
];

const evidenceAuthorityTokens = [
  "ExecutiveLegalSopEvidenceAuthorityQueue",
  "executiveLegalSopEvidenceAuthorityQueueRows",
  "STD-40_EXECUTIVE_LEGAL_SOP_EVIDENCE_AUTHORITY_QUEUE",
  "STD-40 Evidence-authority queue",
  "PASS_LOCAL_LEGAL_SOP_EVIDENCE_AUTHORITY_QUEUE",
  "EVIDENCE_AUTHORITY_QUEUE",
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
  "NO_RAW_EVIDENCE_MOVEMENT",
  "NO_EVIDENCE_ACCEPTANCE",
  "NO_UAT_ACCEPTANCE",
];

requireText(
  executiveDashboard,
  /data-heu-executive-legal-sop-triage="STD-25_EXECUTIVE_LEGAL_SOP_TRIAGE"[\s\S]*data-heu-executive-legal-sop-triage-boundary="DRAFT_CONTROL PASS_LOCAL_LEGAL_SOP_TRIAGE PHAP_CHE_REVIEW_REQUIRED SOP_OWNER_SIGNOFF_REQUIRED MAKER_CHECKER_APPROVER_REQUIRED CONTROLLED_EVIDENCE_REQUIRED EXTERNAL_SIGNOFF_REQUIRED NO_LEGAL_ADVICE NO_OFFICIAL_SOP NO_APPROVAL_ACTION NO_FINANCE_ACTION NO_OWNER_GO NO_PRODUCTION_GO"[\s\S]*data-heu-executive-legal-sop-triage-overflow-guard="STD-25_NO_OVERFLOW"/,
  "EXEC-DASHBOARD-STD25-LEGAL-SOP-TRIAGE-ANCHOR",
  executiveDashboardPath,
);
requireAllText(
  executiveDashboard,
  triageTokens,
  "EXEC-DASHBOARD-STD25-LEGAL-SOP-TRIAGE-TOKENS",
  executiveDashboardPath,
);
requireText(
  executiveDashboard,
  /data-heu-executive-legal-sop-required-answer-index="STD-34_EXECUTIVE_LEGAL_SOP_REQUIRED_ANSWER_INDEX"[\s\S]*data-heu-executive-legal-sop-required-answer-boundary="DRAFT_CONTROL PASS_LOCAL_LEGAL_SOP_REQUIRED_ANSWER_INDEX REQUIRED_ANSWER_INDEX PHAP_CHE_REVIEW_REQUIRED SOP_OWNER_SIGNOFF_REQUIRED MAKER_CHECKER_APPROVER_REQUIRED CONTROLLED_EVIDENCE_REQUIRED EXTERNAL_SIGNOFF_REQUIRED NO_LEGAL_ADVICE NO_OFFICIAL_SOP NO_APPROVAL_ACTION NO_FINANCE_ACTION NO_OWNER_GO NO_PRODUCTION_GO"[\s\S]*data-heu-executive-legal-sop-required-answer-overflow-guard="STD-34_NO_OVERFLOW"/,
  "EXEC-DASHBOARD-STD34-LEGAL-SOP-REQUIRED-ANSWER-ANCHOR",
  executiveDashboardPath,
);
requireAllText(
  executiveDashboard,
  requiredAnswerTokens,
  "EXEC-DASHBOARD-STD34-LEGAL-SOP-REQUIRED-ANSWER-TOKENS",
  executiveDashboardPath,
);
requireText(
  executiveDashboard,
  /data-heu-executive-legal-sop-evidence-authority-queue="STD-40_EXECUTIVE_LEGAL_SOP_EVIDENCE_AUTHORITY_QUEUE"[\s\S]*data-heu-executive-legal-sop-evidence-authority-boundary="DRAFT_CONTROL PASS_LOCAL_LEGAL_SOP_EVIDENCE_AUTHORITY_QUEUE EVIDENCE_AUTHORITY_QUEUE PHAP_CHE_REVIEW_REQUIRED SOP_OWNER_SIGNOFF_REQUIRED MAKER_CHECKER_APPROVER_REQUIRED CONTROLLED_EVIDENCE_REQUIRED EXTERNAL_SIGNOFF_REQUIRED OWNER_SIGNOFF_PENDING NO_LEGAL_ADVICE NO_OFFICIAL_SOP NO_APPROVAL_ACTION NO_FINANCE_ACTION NO_DASHBOARD_RELIANCE NO_REPORT_VIEW_RELIANCE NO_RAW_EVIDENCE_MOVEMENT NO_EVIDENCE_ACCEPTANCE NO_UAT_ACCEPTANCE NO_OWNER_GO NO_PRODUCTION_GO"[\s\S]*data-heu-executive-legal-sop-evidence-authority-overflow-guard="STD-40_NO_OVERFLOW"/,
  "EXEC-DASHBOARD-STD40-LEGAL-SOP-EVIDENCE-AUTHORITY-ANCHOR",
  executiveDashboardPath,
);
requireAllText(
  executiveDashboard,
  evidenceAuthorityTokens,
  "EXEC-DASHBOARD-STD40-LEGAL-SOP-EVIDENCE-AUTHORITY-TOKENS",
  executiveDashboardPath,
);
requireAllText(
  executiveReadiness,
  [
    "EXEC-DASHBOARD-LEGAL-SOP-TRIAGE-ANCHOR",
    "EXEC-DASHBOARD-LEGAL-SOP-TRIAGE-TOKENS",
    "EXEC-DASHBOARD-LEGAL-SOP-REQUIRED-ANSWER-ANCHOR",
    "EXEC-DASHBOARD-LEGAL-SOP-REQUIRED-ANSWER-TOKENS",
    "EXEC-DASHBOARD-LEGAL-SOP-EVIDENCE-AUTHORITY-ANCHOR",
    "EXEC-DASHBOARD-LEGAL-SOP-EVIDENCE-AUTHORITY-TOKENS",
    "PASS_LOCAL_LEGAL_SOP_REQUIRED_ANSWER_INDEX",
    "PASS_LOCAL_LEGAL_SOP_EVIDENCE_AUTHORITY_QUEUE",
    "check:heu-executive-legal-sop-required-answer-index-readiness",
    "check:heu-executive-legal-sop-evidence-authority-queue-readiness",
    "PASS_LOCAL_LEGAL_SOP_TRIAGE",
    "check:heu-executive-legal-sop-triage-readiness",
  ],
  "EXECUTIVE-READINESS-STD25",
  executiveReadinessPath,
);
requireAllText(
  legalAuthority,
  [
    "STD-34_EXECUTIVE_LEGAL_SOP_REQUIRED_ANSWER_INDEX",
    "LAW-IDX-01",
    "LAW-IDX-06",
    "PASS_LOCAL_LEGAL_SOP_REQUIRED_ANSWER_INDEX",
    "STD-25_EXECUTIVE_LEGAL_SOP_TRIAGE",
    "LEGAL-TRIAGE-01",
    "LEGAL-TRIAGE-05",
    "PASS_LOCAL_LEGAL_SOP_TRIAGE",
    "STD-40_EXECUTIVE_LEGAL_SOP_EVIDENCE_AUTHORITY_QUEUE",
    "LAW-QUEUE-01",
    "LAW-QUEUE-06",
    "PASS_LOCAL_LEGAL_SOP_EVIDENCE_AUTHORITY_QUEUE",
  ],
  "LEGAL-AUTHORITY-STD25",
  legalAuthorityPath,
);
requireAllText(
  visualQa,
  [
    'data-heu-executive-legal-sop-triage="STD-25_EXECUTIVE_LEGAL_SOP_TRIAGE"',
    "STD-25 Legal/SOP triage",
    "LEGAL-TRIAGE-01",
    "LEGAL-TRIAGE-05",
    "PASS_LOCAL_LEGAL_SOP_TRIAGE",
    'data-heu-executive-legal-sop-evidence-authority-queue="STD-40_EXECUTIVE_LEGAL_SOP_EVIDENCE_AUTHORITY_QUEUE"',
    "LAW-QUEUE-01",
    "LAW-QUEUE-06",
    "PASS_LOCAL_LEGAL_SOP_EVIDENCE_AUTHORITY_QUEUE",
  ],
  "VISUAL-QA-STD25",
  visualQaPath,
);
requireAllText(
  blueprint,
  [
    "STD-34",
    "STD-34_EXECUTIVE_LEGAL_SOP_REQUIRED_ANSWER_INDEX",
    "PASS_LOCAL_LEGAL_SOP_REQUIRED_ANSWER_INDEX",
    "REQUIRED_ANSWER_INDEX",
    "LAW-IDX-01",
    "LAW-IDX-06",
    "STD-25",
    "STD-25_EXECUTIVE_LEGAL_SOP_TRIAGE",
    "PASS_LOCAL_LEGAL_SOP_TRIAGE",
    "PHAP_CHE_REVIEW_REQUIRED",
    "MAKER_CHECKER_APPROVER_REQUIRED",
    "CONTROLLED_EVIDENCE_REQUIRED",
    "EXTERNAL_SIGNOFF_REQUIRED",
    "NO_LEGAL_ADVICE",
    "NO_OFFICIAL_SOP",
    "STD-40",
    "STD-40_EXECUTIVE_LEGAL_SOP_EVIDENCE_AUTHORITY_QUEUE",
    "PASS_LOCAL_LEGAL_SOP_EVIDENCE_AUTHORITY_QUEUE",
    "EVIDENCE_AUTHORITY_QUEUE",
    "LAW-QUEUE-01",
    "LAW-QUEUE-06",
    "NO_RAW_EVIDENCE_MOVEMENT",
  ],
  "BLUEPRINT-STD25",
  blueprintPath,
);
requireAllText(
  implementationLog,
  [
    "STD-34 Executive Legal SOP Required Answer Index",
    'data-heu-executive-legal-sop-required-answer-index="STD-34_EXECUTIVE_LEGAL_SOP_REQUIRED_ANSWER_INDEX"',
    "LAW-IDX-01",
    "LAW-IDX-06",
    "PASS_LOCAL_LEGAL_SOP_REQUIRED_ANSWER_INDEX",
    "check:heu-executive-legal-sop-required-answer-index-readiness",
    "STD-25 Executive Legal SOP Triage",
    'data-heu-executive-legal-sop-triage="STD-25_EXECUTIVE_LEGAL_SOP_TRIAGE"',
    "LEGAL-TRIAGE-01",
    "LEGAL-TRIAGE-05",
    "PASS_LOCAL_LEGAL_SOP_TRIAGE",
    "check:heu-executive-legal-sop-triage-readiness",
    "STD-40 Executive Legal SOP Evidence Authority Queue",
    'data-heu-executive-legal-sop-evidence-authority-queue="STD-40_EXECUTIVE_LEGAL_SOP_EVIDENCE_AUTHORITY_QUEUE"',
    "LAW-QUEUE-01",
    "LAW-QUEUE-06",
    "PASS_LOCAL_LEGAL_SOP_EVIDENCE_AUTHORITY_QUEUE",
    "check:heu-executive-legal-sop-evidence-authority-queue-readiness",
    /does not provide legal advice/i,
    "mark production GO",
  ],
  "IMPLEMENTATION-LOG-STD25",
  implementationLogPath,
);

if (
  packageJson.scripts?.["check:heu-executive-legal-sop-triage-readiness"] !==
  "node scripts/check-heu-executive-legal-sop-triage-readiness.mjs"
) {
  fail(
    "package.json missing check:heu-executive-legal-sop-triage-readiness script",
  );
}

console.log("READY PACKAGE-SCRIPT");
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

console.log("READY PACKAGE-STD40-SCRIPT");
console.log(
  "HEU_EXECUTIVE_LEGAL_SOP_TRIAGE_READY / NO_GO / BLOCKED: PASS_LOCAL_LEGAL_SOP_TRIAGE with PASS_LOCAL_LEGAL_SOP_EVIDENCE_AUTHORITY_QUEUE. This check verifies executive Legal/SOP triage and evidence-authority queue only; it does not provide legal advice, issue official SOP, approve workflow state, execute finance, accept UAT, accept evidence, approve owner GO/NO-GO or mark production GO.",
);
