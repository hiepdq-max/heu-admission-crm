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

console.log("HEU Legal/SOP authority readiness check");
console.log(
  "Secrets, raw PII, bank data, vouchers, passwords, legal documents and signed evidence are never printed by this script.",
);

const executiveDashboardPath =
  "components/dashboard/executive-dashboard-overview.tsx";
const legalMatrixPath =
  "docs/HEU_LEGAL_SOP_GOVERNANCE_CONTROL_MATRIX_20260628_V01_DRAFT.md";
const executiveReadinessPath =
  "scripts/check-heu-executive-dashboard-readiness.mjs";
const blueprintPath = "docs/HEU_STANDARD_SYSTEM_BLUEPRINT_20260703.md";
const implementationLogPath = "docs/HEU_IMPLEMENTATION_LOG.md";
const packageJsonPath = "package.json";

const executiveDashboard = read(executiveDashboardPath);
const legalMatrix = read(legalMatrixPath);
const executiveReadiness = read(executiveReadinessPath);
const blueprint = read(blueprintPath);
const implementationLog = read(implementationLogPath);
const packageJson = JSON.parse(read(packageJsonPath));

const authorityTokens = [
  "AUTH-LEGAL-BASIS",
  "AUTH-SOP-VERSION",
  "AUTH-MAKER",
  "AUTH-CHECKER",
  "AUTH-APPROVER",
  "AUTH-EVIDENCE",
  "AUTH-SIGNER",
  "Can cu phap ly nao?",
  "SOP nao dang ap dung?",
  "Ai nhap / tao du lieu?",
  "Ai kiem tra?",
  "Ai duyet?",
  "Chung tu nam o dau?",
  "Ai ky / chot ben ngoai he thong?",
  "PHAP_CHE_REVIEW_REQUIRED",
  "SOP_OWNER_SIGNOFF_REQUIRED",
  "MAKER_CHECKER_APPROVER_REQUIRED",
  "CONTROLLED_EVIDENCE_REQUIRED",
  "EXTERNAL_SIGNOFF_REQUIRED",
  "NO_LEGAL_ADVICE",
  "NO_OFFICIAL_SOP",
  "NO_FINANCE_ACTION",
  "NO_OWNER_GO",
  "NO_PRODUCTION_GO",
];

const triageTokens = [
  "STD-25_EXECUTIVE_LEGAL_SOP_TRIAGE",
  "STD-25 Legal/SOP triage",
  "PASS_LOCAL_LEGAL_SOP_TRIAGE",
  "LEGAL-TRIAGE-01",
  "LEGAL-TRIAGE-02",
  "LEGAL-TRIAGE-03",
  "LEGAL-TRIAGE-04",
  "LEGAL-TRIAGE-05",
];

const requiredAnswerTokens = [
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
  /data-heu-executive-legal-sop-authority-checklist="STD-14_LEGAL_SOP_AUTHORITY_CHECKLIST"[\s\S]*data-heu-executive-legal-sop-authority-boundary="DRAFT_CONTROL PHAP_CHE_REVIEW_REQUIRED SOP_OWNER_SIGNOFF_REQUIRED MAKER_CHECKER_APPROVER_REQUIRED CONTROLLED_EVIDENCE_REQUIRED EXTERNAL_SIGNOFF_REQUIRED NO_LEGAL_ADVICE NO_OFFICIAL_SOP NO_FINANCE_ACTION NO_OWNER_GO NO_PRODUCTION_GO"[\s\S]*data-heu-executive-legal-sop-authority-overflow-guard="STD-14_NO_OVERFLOW"/,
  "EXEC-DASHBOARD-STD14-AUTHORITY-ANCHOR",
  executiveDashboardPath,
);
requireAllText(
  executiveDashboard,
  ["Authority checklist", ...authorityTokens],
  "EXEC-DASHBOARD-STD14-AUTHORITY-TOKENS",
  executiveDashboardPath,
);
requireAllText(
  executiveDashboard,
  triageTokens,
  "EXEC-DASHBOARD-STD25-TRIAGE-TOKENS",
  executiveDashboardPath,
);
requireText(
  executiveDashboard,
  /data-heu-executive-legal-sop-required-answer-index="STD-34_EXECUTIVE_LEGAL_SOP_REQUIRED_ANSWER_INDEX"[\s\S]*data-heu-executive-legal-sop-required-answer-boundary="DRAFT_CONTROL PASS_LOCAL_LEGAL_SOP_REQUIRED_ANSWER_INDEX REQUIRED_ANSWER_INDEX PHAP_CHE_REVIEW_REQUIRED SOP_OWNER_SIGNOFF_REQUIRED MAKER_CHECKER_APPROVER_REQUIRED CONTROLLED_EVIDENCE_REQUIRED EXTERNAL_SIGNOFF_REQUIRED NO_LEGAL_ADVICE NO_OFFICIAL_SOP NO_APPROVAL_ACTION NO_FINANCE_ACTION NO_OWNER_GO NO_PRODUCTION_GO"[\s\S]*data-heu-executive-legal-sop-required-answer-overflow-guard="STD-34_NO_OVERFLOW"/,
  "EXEC-DASHBOARD-STD34-REQUIRED-ANSWER-ANCHOR",
  executiveDashboardPath,
);
requireAllText(
  executiveDashboard,
  requiredAnswerTokens,
  "EXEC-DASHBOARD-STD34-REQUIRED-ANSWER-TOKENS",
  executiveDashboardPath,
);
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
  legalMatrix,
  [
    "STD-14 Authority Checklist",
    "STD-14_LEGAL_SOP_AUTHORITY_CHECKLIST",
    ...authorityTokens,
    "does not provide legal advice",
    "issue official SOP",
    "approve finance action",
    "mark production GO",
  ],
  "LEGAL-MATRIX-STD14-AUTHORITY-TOKENS",
  legalMatrixPath,
);
requireAllText(
  legalMatrix,
  [
    "STD-34 Required Answer Index",
    "STD-34_EXECUTIVE_LEGAL_SOP_REQUIRED_ANSWER_INDEX",
    "PASS_LOCAL_LEGAL_SOP_REQUIRED_ANSWER_INDEX",
    "REQUIRED_ANSWER_INDEX",
    "LAW-IDX-01",
    "LAW-IDX-06",
    "does not provide legal advice",
    "issue official SOP",
    "mark production GO",
  ],
  "LEGAL-MATRIX-STD34-REQUIRED-ANSWER-TOKENS",
  legalMatrixPath,
);
requireAllText(
  legalMatrix,
  [
    "STD-40 Evidence Authority Queue",
    "STD-40_EXECUTIVE_LEGAL_SOP_EVIDENCE_AUTHORITY_QUEUE",
    "PASS_LOCAL_LEGAL_SOP_EVIDENCE_AUTHORITY_QUEUE",
    "EVIDENCE_AUTHORITY_QUEUE",
    "LAW-QUEUE-01",
    "LAW-QUEUE-06",
    "NO_RAW_EVIDENCE_MOVEMENT",
    "NO_EVIDENCE_ACCEPTANCE",
    "NO_UAT_ACCEPTANCE",
    "does not provide legal advice",
    "issue official SOP",
    "mark production GO",
  ],
  "LEGAL-MATRIX-STD40-EVIDENCE-AUTHORITY-TOKENS",
  legalMatrixPath,
);
requireAllText(
  executiveReadiness,
  [
    "STD-34_EXECUTIVE_LEGAL_SOP_REQUIRED_ANSWER_INDEX",
    "PASS_LOCAL_LEGAL_SOP_REQUIRED_ANSWER_INDEX",
    "LAW-IDX-01",
    "LAW-IDX-06",
    "STD-40_EXECUTIVE_LEGAL_SOP_EVIDENCE_AUTHORITY_QUEUE",
    "PASS_LOCAL_LEGAL_SOP_EVIDENCE_AUTHORITY_QUEUE",
    "LAW-QUEUE-01",
    "LAW-QUEUE-06",
    "STD-14_LEGAL_SOP_AUTHORITY_CHECKLIST",
    "AUTH-LEGAL-BASIS",
    "AUTH-SIGNER",
    "PHAP_CHE_REVIEW_REQUIRED",
    "MAKER_CHECKER_APPROVER_REQUIRED",
    "NO_OFFICIAL_SOP",
  ],
  "EXECUTIVE-READINESS-STD14",
  executiveReadinessPath,
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
    "STD-40",
    "STD-40_EXECUTIVE_LEGAL_SOP_EVIDENCE_AUTHORITY_QUEUE",
    "PASS_LOCAL_LEGAL_SOP_EVIDENCE_AUTHORITY_QUEUE",
    "EVIDENCE_AUTHORITY_QUEUE",
    "LAW-QUEUE-01",
    "LAW-QUEUE-06",
    "STD-14",
    "STD-14_LEGAL_SOP_AUTHORITY_CHECKLIST",
    "PASS_LOCAL_LEGAL_SOP_GUARD",
    "PHAP_CHE_REVIEW_REQUIRED",
    "MAKER_CHECKER_APPROVER_REQUIRED",
    "CONTROLLED_EVIDENCE_REQUIRED",
    "EXTERNAL_SIGNOFF_REQUIRED",
    "NO_LEGAL_ADVICE",
    "NO_OFFICIAL_SOP",
  ],
  "BLUEPRINT-STD14-AUTHORITY",
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
    "STD-40 Executive Legal SOP Evidence Authority Queue",
    'data-heu-executive-legal-sop-evidence-authority-queue="STD-40_EXECUTIVE_LEGAL_SOP_EVIDENCE_AUTHORITY_QUEUE"',
    "LAW-QUEUE-01",
    "LAW-QUEUE-06",
    "PASS_LOCAL_LEGAL_SOP_EVIDENCE_AUTHORITY_QUEUE",
    "check:heu-executive-legal-sop-evidence-authority-queue-readiness",
    "STD-14 Legal SOP Authority Checklist",
    'data-heu-executive-legal-sop-authority-checklist="STD-14_LEGAL_SOP_AUTHORITY_CHECKLIST"',
    "check-heu-legal-sop-authority-readiness.mjs",
    "PASS_LOCAL_LEGAL_SOP_GUARD",
    "AUTH-LEGAL-BASIS",
    "AUTH-SIGNER",
    "does not provide legal advice",
    "mark production GO",
  ],
  "IMPLEMENTATION-LOG-STD14",
  implementationLogPath,
);

if (
  packageJson.scripts?.["check:heu-legal-sop-authority-readiness"] !==
  "node scripts/check-heu-legal-sop-authority-readiness.mjs"
) {
  fail("package.json missing check:heu-legal-sop-authority-readiness script");
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
  "HEU_LEGAL_SOP_AUTHORITY_READY / NO_GO / BLOCKED: PASS_LOCAL_LEGAL_SOP_GUARD with PASS_LOCAL_LEGAL_SOP_EVIDENCE_AUTHORITY_QUEUE. This check verifies authority questions and the evidence-authority queue only; it does not provide legal advice, issue official SOP, grant access, execute finance, accept UAT, accept evidence, approve owner GO/NO-GO or mark production GO.",
);
