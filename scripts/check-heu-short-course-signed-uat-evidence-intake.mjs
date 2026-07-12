import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const failures = [];

function fail(message) {
  failures.push(message);
}

function exists(relativePath) {
  return existsSync(path.join(repoRoot, relativePath));
}

function read(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), "utf8");
}

function requireFile(relativePath) {
  if (!exists(relativePath)) {
    fail(`Missing required file: ${relativePath}`);
  }
}

function requireText(relativePath, tokens, label) {
  if (!exists(relativePath)) {
    return;
  }

  const contents = read(relativePath);
  for (const token of tokens) {
    if (!contents.includes(token)) {
      fail(`${relativePath}: missing ${label}: ${token}`);
    }
  }
}

const requiredFiles = [
  "docs/HEU_SHORT_COURSE_SIGNED_UAT_EVIDENCE_INTAKE_20260704.md",
  "docs/HEU_SHORT_COURSE_ATTENDANCE_PAYMENT_GAP_PACK_20260628_V01_DRAFT.md",
  "docs/HEU_SHORT_COURSE_UAT_RESULT_LEDGER_TEMPLATE_20260703.md",
  "docs/HEU_SHORT_COURSE_OWNER_SIGNOFF_MANIFEST_20260702.md",
  "docs/HEU_SHORT_COURSE_EXTERNAL_OWNER_ACTION_QUEUE_20260703.md",
  "docs/HEU_SHORT_COURSE_REPORT_VIEW_SOURCE_RECONCILIATION_CHECKLIST_20260703.md",
  "docs/HEU_SHORT_COURSE_ROLE_NEGATIVE_ACCESS_CHECKLIST_20260703.md",
  "docs/HEU_TRAINING_MODULE_COMPLETION_BREAKDOWN_20260703.md",
  "docs/HEU_REPORT_VIEW_SOURCE_MAP_20260628_V01_DRAFT.md",
  "components/short-course/short-course-attendance-payment-gap-pack.tsx",
  "docs/HEU_CURRENT_STATE_INVENTORY.md",
  "docs/HEU_SYSTEM_BUILD_BACKLOG.md",
  "docs/HEU_MODULE_READINESS_GAP_MATRIX_20260628_V01_DRAFT.md",
  "docs/HEU_IMPLEMENTATION_LOG.md",
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
  "package.json",
];

for (const file of requiredFiles) {
  requireFile(file);
}

const packageJson = exists("package.json") ? JSON.parse(read("package.json")) : {};

if (
  packageJson.scripts?.["check:heu-short-course-signed-uat-evidence-intake"] !==
  "node scripts/check-heu-short-course-signed-uat-evidence-intake.mjs"
) {
  fail("package.json: missing check:heu-short-course-signed-uat-evidence-intake script");
}

requireText(
  "docs/HEU_SHORT_COURSE_SIGNED_UAT_EVIDENCE_INTAKE_20260704.md",
  [
    "Status: PASS_LOCAL_EVIDENCE_INTAKE",
    "SC_SIGNED_UAT_EVIDENCE_READY / NO_GO / BLOCKED",
    "Production/UAT status: NO-GO",
    "SC-UAT-EVID-01",
    "SC-UAT-EVID-08",
    "SC-UAT-01 through SC-UAT-08",
    "SC-UAT-LEDGER-01 through SC-UAT-LEDGER-08",
    "SC-REV-01 through SC-REV-06",
    "SC-SIGN-01 through SC-SIGN-06",
    "SC-ROLE-EVID-01 through SC-ROLE-EVID-06",
    "RV_SHORT_COURSE_ATTENDANCE_PAYMENT",
    "outside Git/Codex/chat",
    "raw student personal data",
    "raw teacher personal data",
    "raw Drive URLs",
    "does not execute UAT",
    "accept evidence",
    "approve access closure",
    "approve owner GO/NO-GO",
    "mark production GO",
  ],
  "signed UAT evidence intake document",
);

requireText(
  "components/short-course/short-course-attendance-payment-gap-pack.tsx",
  [
    'data-heu-short-course-signed-uat-evidence-intake="P9-10_SIGNED_UAT_EVIDENCE_INTAKE"',
    'data-heu-short-course-signed-uat-evidence-doc="HEU_SHORT_COURSE_SIGNED_UAT_EVIDENCE_INTAKE_20260704"',
    'data-heu-short-course-signed-uat-evidence-decision="SC_SIGNED_UAT_EVIDENCE_READY_NO_GO_BLOCKED"',
    'data-heu-short-course-signed-uat-evidence-overflow-guard="P9-10_SHORT_COURSE_SIGNED_UAT_EVIDENCE_NO_OVERFLOW"',
    "SC_SIGNED_UAT_EVIDENCE_READY / NO_GO / BLOCKED",
    "SC-UAT-EVID-01",
    "SC-UAT-EVID-08",
    "HEU_SHORT_COURSE_SIGNED_UAT_EVIDENCE_INTAKE_20260704.md",
    "PENDING_EXTERNAL_SIGNED_UAT_EVIDENCE",
    "does not execute UAT",
    "min-w-0",
    "overflow-x-auto",
    "break-words",
  ],
  "visible P9-10 signed UAT evidence intake panel",
);

const propagationChecks = [
  [
    "docs/HEU_SHORT_COURSE_ATTENDANCE_PAYMENT_GAP_PACK_20260628_V01_DRAFT.md",
    [
      "HEU_SHORT_COURSE_SIGNED_UAT_EVIDENCE_INTAKE_20260704.md",
      "PASS_LOCAL_EVIDENCE_INTAKE",
      "SC-UAT-EVID-01 through SC-UAT-EVID-08",
      "SC_SIGNED_UAT_EVIDENCE_READY / NO_GO / BLOCKED",
    ],
    "gap pack P9-10 propagation",
  ],
  [
    "docs/HEU_SHORT_COURSE_UAT_RESULT_LEDGER_TEMPLATE_20260703.md",
    [
      "HEU_SHORT_COURSE_SIGNED_UAT_EVIDENCE_INTAKE_20260704.md",
      "SC-UAT-EVID-01 through SC-UAT-EVID-08",
      "SC_SIGNED_UAT_EVIDENCE_READY / NO_GO / BLOCKED",
    ],
    "UAT ledger P9-10 propagation",
  ],
  [
    "docs/HEU_SHORT_COURSE_OWNER_SIGNOFF_MANIFEST_20260702.md",
    [
      "HEU_SHORT_COURSE_SIGNED_UAT_EVIDENCE_INTAKE_20260704.md",
      "SC-UAT-EVID-01 through SC-UAT-EVID-08",
      "SC_SIGNED_UAT_EVIDENCE_READY / NO_GO / BLOCKED",
      "linked_signed_uat_evidence_case",
      "check:heu-short-course-signed-uat-evidence-intake",
    ],
    "owner signoff P9-10 propagation",
  ],
  [
    "docs/HEU_SHORT_COURSE_EXTERNAL_OWNER_ACTION_QUEUE_20260703.md",
    [
      "HEU_SHORT_COURSE_SIGNED_UAT_EVIDENCE_INTAKE_20260704.md",
      "SC-UAT-EVID-01 through SC-UAT-EVID-08",
      "SC_SIGNED_UAT_EVIDENCE_READY / NO_GO / BLOCKED",
    ],
    "external owner queue P9-10 propagation",
  ],
  [
    "docs/HEU_REPORT_VIEW_SOURCE_MAP_20260628_V01_DRAFT.md",
    [
      "HEU_SHORT_COURSE_SIGNED_UAT_EVIDENCE_INTAKE_20260704.md",
      "SC-UAT-EVID-01 through SC-UAT-EVID-08",
      "SC_SIGNED_UAT_EVIDENCE_READY / NO_GO / BLOCKED",
      "RV-EVID-05",
    ],
    "report-view source map P9-10 propagation",
  ],
  [
    "docs/HEU_CURRENT_STATE_INVENTORY.md",
    [
      "check:heu-short-course-signed-uat-evidence-intake",
      "Short Course signed UAT evidence intake",
      "HEU_SHORT_COURSE_SIGNED_UAT_EVIDENCE_INTAKE_20260704.md",
      "SC-UAT-EVID-01 through SC-UAT-EVID-08",
      "PASS_LOCAL_EVIDENCE_INTAKE",
    ],
    "current-state P9-10 propagation",
  ],
  [
    "docs/HEU_SYSTEM_BUILD_BACKLOG.md",
    [
      "P9-10",
      "Short Course signed UAT evidence intake",
      "HEU_SHORT_COURSE_SIGNED_UAT_EVIDENCE_INTAKE_20260704.md",
      "SC-UAT-EVID-01 through SC-UAT-EVID-08",
      "check:heu-short-course-signed-uat-evidence-intake",
    ],
    "backlog P9-10 propagation",
  ],
  [
    "docs/HEU_MODULE_READINESS_GAP_MATRIX_20260628_V01_DRAFT.md",
    [
      "Short Course signed UAT evidence intake",
      "HEU_SHORT_COURSE_SIGNED_UAT_EVIDENCE_INTAKE_20260704.md",
      "SC-UAT-EVID-01 through SC-UAT-EVID-08",
      "check:heu-short-course-signed-uat-evidence-intake",
      "signed Short Course UAT",
    ],
    "gap matrix P9-10 propagation",
  ],
  [
    "docs/HEU_IMPLEMENTATION_LOG.md",
    [
      "## 2026-07-04 - P9-10 Short Course Signed UAT Evidence Intake",
      "HEU_SHORT_COURSE_SIGNED_UAT_EVIDENCE_INTAKE_20260704.md",
      "SC-UAT-EVID-01 through SC-UAT-EVID-08",
      "SC_SIGNED_UAT_EVIDENCE_READY / NO_GO / BLOCKED",
      "check:heu-short-course-signed-uat-evidence-intake",
      "does not execute UAT",
    ],
    "implementation log P9-10 entry",
  ],
  [
    "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
    [
      "Short Course signed UAT evidence intake",
      "HEU_SHORT_COURSE_SIGNED_UAT_EVIDENCE_INTAKE_20260704.md",
      "SC-UAT-EVID-01 through SC-UAT-EVID-08",
      "SC_SIGNED_UAT_EVIDENCE_READY / NO_GO / BLOCKED",
      "signed Short Course UAT",
    ],
    "production checklist P9-10 propagation",
  ],
];

for (const [file, tokens, label] of propagationChecks) {
  requireText(file, tokens, label);
}

if (failures.length > 0) {
  console.error("HEU Short Course signed-UAT evidence intake check failed.");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(
  "HEU Short Course signed-UAT evidence intake check passed. P9-10 remains PASS_LOCAL_EVIDENCE_INTAKE and production M07/P9 stays NO-GO.",
);
