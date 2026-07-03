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
  "docs/HEU_KHOA_GIANG_VIEN_EVIDENCE_TRACE_SOURCE_RECONCILIATION_CHECKLIST_20260703.md",
  "docs/HEU_KHOA_GIANG_VIEN_GAP_PACK_20260703.md",
  "docs/HEU_KHOA_GIANG_VIEN_DELIVERY_SOURCE_MAP_20260703.md",
  "docs/HEU_KHOA_GIANG_VIEN_TEACHER_PROFILE_PRIVACY_REGISTER_20260703.md",
  "docs/HEU_KHOA_GIANG_VIEN_NEGATIVE_ACCESS_CHECKLIST_20260703.md",
  "docs/HEU_KHOA_GIANG_VIEN_OWNER_SIGNOFF_MANIFEST_20260703.md",
  "docs/HEU_KHOA_GIANG_VIEN_UAT_RESULT_LEDGER_TEMPLATE_20260703.md",
  "docs/HEU_REPORT_VIEW_SOURCE_MAP_20260628_V01_DRAFT.md",
  "docs/HEU_DATA_MASTER_REPORT_VIEW_COMPATIBILITY_20260628_V01_DRAFT.md",
  "components/khoa/khoa-giang-vien-gap-pack.tsx",
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
  packageJson.scripts?.["check:heu-khoa-giang-vien-evidence-trace"] !==
  "node scripts/check-heu-khoa-giang-vien-evidence-trace.mjs"
) {
  fail("package.json: missing check:heu-khoa-giang-vien-evidence-trace script");
}

requireText(
  "docs/HEU_KHOA_GIANG_VIEN_EVIDENCE_TRACE_SOURCE_RECONCILIATION_CHECKLIST_20260703.md",
  [
    "Status: PASS_LOCAL_EVIDENCE_TRACE",
    "Production/UAT status: NO-GO",
    "KHOA_EVIDENCE_TRACE_READY / NO_GO / BLOCKED",
    "KHOA_SOURCE_RECONCILIATION_READY / NO_GO / BLOCKED",
    "RV_KHOA_GIANG_VIEN_DELIVERY / NO_GO / BLOCKED",
    "KHOA-EVID-01",
    "KHOA-EVID-08",
    "KHOA-SRC-01 through KHOA-SRC-08",
    "KHOA-DQ-01 through KHOA-DQ-08",
    "KHOA-RV-EVID-01 through KHOA-RV-EVID-06",
    "RV-EVID-07",
    "KHOA-PRIV-01 through KHOA-PRIV-06",
    "KHOA-NEG-01 through KHOA-NEG-08",
    "KHOA-UAT-LEDGER-01 through KHOA-UAT-LEDGER-08",
    "KHOA-SIGN-01 through KHOA-SIGN-06",
    "outside Git/Codex/chat",
    "raw teacher personal data",
    "does not approve report-view reliance",
    "accept source reconciliation",
    "approve owner GO/NO-GO",
    "mark production GO",
  ],
  "evidence trace checklist",
);

requireText(
  "docs/HEU_KHOA_GIANG_VIEN_GAP_PACK_20260703.md",
  [
    "HEU_KHOA_GIANG_VIEN_EVIDENCE_TRACE_SOURCE_RECONCILIATION_CHECKLIST_20260703.md",
    "PASS_LOCAL_EVIDENCE_TRACE",
    "KHOA-EVID-01 through KHOA-EVID-08",
    "KHOA_EVIDENCE_TRACE_READY / NO_GO / BLOCKED",
    "KHOA_SOURCE_RECONCILIATION_READY / NO_GO / BLOCKED",
  ],
  "gap pack P10-06 propagation",
);

requireText(
  "docs/HEU_KHOA_GIANG_VIEN_DELIVERY_SOURCE_MAP_20260703.md",
  [
    "HEU_KHOA_GIANG_VIEN_EVIDENCE_TRACE_SOURCE_RECONCILIATION_CHECKLIST_20260703.md",
    "KHOA-EVID-01 through KHOA-EVID-08",
    "KHOA_EVIDENCE_TRACE_READY / NO_GO / BLOCKED",
    "KHOA_SOURCE_RECONCILIATION_READY / NO_GO / BLOCKED",
    "DQ-RV-09",
    "RV-EVID-07",
  ],
  "delivery source map evidence trace propagation",
);

requireText(
  "docs/HEU_KHOA_GIANG_VIEN_TEACHER_PROFILE_PRIVACY_REGISTER_20260703.md",
  [
    "HEU_KHOA_GIANG_VIEN_EVIDENCE_TRACE_SOURCE_RECONCILIATION_CHECKLIST_20260703.md",
    "KHOA-EVID-01 through KHOA-EVID-08",
    "KHOA_EVIDENCE_TRACE_READY / NO_GO / BLOCKED",
    "linked_evidence_trace_case",
    "check:heu-khoa-giang-vien-evidence-trace",
  ],
  "privacy register evidence trace propagation",
);

requireText(
  "docs/HEU_KHOA_GIANG_VIEN_NEGATIVE_ACCESS_CHECKLIST_20260703.md",
  [
    "HEU_KHOA_GIANG_VIEN_EVIDENCE_TRACE_SOURCE_RECONCILIATION_CHECKLIST_20260703.md",
    "KHOA-EVID-01 through KHOA-EVID-08",
    "KHOA_EVIDENCE_TRACE_READY / NO_GO / BLOCKED",
    "linked_evidence_trace_case",
    "check:heu-khoa-giang-vien-evidence-trace",
  ],
  "negative-access evidence trace propagation",
);

requireText(
  "docs/HEU_KHOA_GIANG_VIEN_OWNER_SIGNOFF_MANIFEST_20260703.md",
  [
    "HEU_KHOA_GIANG_VIEN_EVIDENCE_TRACE_SOURCE_RECONCILIATION_CHECKLIST_20260703.md",
    "KHOA-EVID-01 through KHOA-EVID-08",
    "KHOA_EVIDENCE_TRACE_READY / NO_GO / BLOCKED",
    "KHOA_SOURCE_RECONCILIATION_READY / NO_GO / BLOCKED",
    "linked_evidence_trace_case",
    "check:heu-khoa-giang-vien-evidence-trace",
  ],
  "owner manifest evidence trace propagation",
);

requireText(
  "docs/HEU_KHOA_GIANG_VIEN_UAT_RESULT_LEDGER_TEMPLATE_20260703.md",
  [
    "HEU_KHOA_GIANG_VIEN_EVIDENCE_TRACE_SOURCE_RECONCILIATION_CHECKLIST_20260703.md",
    "KHOA-EVID-01 through KHOA-EVID-08",
    "KHOA_EVIDENCE_TRACE_READY / NO_GO / BLOCKED",
    "KHOA_SOURCE_RECONCILIATION_READY / NO_GO / BLOCKED",
    "KHOA-EVID-06",
  ],
  "UAT ledger evidence trace propagation",
);

requireText(
  "docs/HEU_REPORT_VIEW_SOURCE_MAP_20260628_V01_DRAFT.md",
  [
    "HEU_KHOA_GIANG_VIEN_EVIDENCE_TRACE_SOURCE_RECONCILIATION_CHECKLIST_20260703.md",
    "KHOA-EVID-01 through KHOA-EVID-08",
    "KHOA_EVIDENCE_TRACE_READY / NO_GO / BLOCKED",
    "KHOA_SOURCE_RECONCILIATION_READY / NO_GO / BLOCKED",
    "DQ-RV-09",
    "RV-EVID-07",
  ],
  "report-view source map P10-06 propagation",
);

requireText(
  "docs/HEU_DATA_MASTER_REPORT_VIEW_COMPATIBILITY_20260628_V01_DRAFT.md",
  [
    "HEU_KHOA_GIANG_VIEN_EVIDENCE_TRACE_SOURCE_RECONCILIATION_CHECKLIST_20260703.md",
    "KHOA_EVIDENCE_TRACE_READY / NO_GO / BLOCKED",
    "KHOA_SOURCE_RECONCILIATION_READY / NO_GO / BLOCKED",
  ],
  "data master/report-view compatibility P10-06 propagation",
);

requireText(
  "components/khoa/khoa-giang-vien-gap-pack.tsx",
  [
    'data-heu-khoa-evidence-trace="P10-06_EVIDENCE_TRACE_SOURCE_RECONCILIATION"',
    'data-heu-khoa-evidence-trace-doc="HEU_KHOA_GIANG_VIEN_EVIDENCE_TRACE_SOURCE_RECONCILIATION_CHECKLIST_20260703"',
    'data-heu-khoa-evidence-trace-decision="KHOA_EVIDENCE_TRACE_READY_NO_GO_BLOCKED"',
    'data-heu-khoa-evidence-trace-overflow-guard="P10-06_KHOA_EVIDENCE_TRACE_NO_OVERFLOW"',
    "KHOA_EVIDENCE_TRACE_READY / NO_GO / BLOCKED",
    "KHOA_SOURCE_RECONCILIATION_READY / NO_GO / BLOCKED",
    "KHOA-EVID-01",
    "KHOA-EVID-08",
    "HEU_KHOA_GIANG_VIEN_EVIDENCE_TRACE_SOURCE_RECONCILIATION_CHECKLIST_20260703.md",
    "PENDING_EXTERNAL_SOURCE_RECONCILIATION",
    "does not approve report-view reliance",
    "min-w-0",
    "overflow-x-auto",
    "break-words",
  ],
  "visible P10-06 evidence trace panel",
);

requireText(
  "docs/HEU_CURRENT_STATE_INVENTORY.md",
  [
    "check:heu-khoa-giang-vien-evidence-trace",
    "Khoa/Giang vien evidence trace/source reconciliation checklist",
    "HEU_KHOA_GIANG_VIEN_EVIDENCE_TRACE_SOURCE_RECONCILIATION_CHECKLIST_20260703.md",
    "KHOA-EVID-01 through KHOA-EVID-08",
    "KHOA_EVIDENCE_TRACE_READY / NO_GO / BLOCKED",
    "PASS_LOCAL_EVIDENCE_TRACE",
  ],
  "current-state P10-06 propagation",
);

requireText(
  "docs/HEU_SYSTEM_BUILD_BACKLOG.md",
  [
    "P10-06",
    "Khoa/Giang vien evidence trace/source reconciliation checklist",
    "HEU_KHOA_GIANG_VIEN_EVIDENCE_TRACE_SOURCE_RECONCILIATION_CHECKLIST_20260703.md",
    "KHOA-EVID-01 through KHOA-EVID-08",
    "KHOA_EVIDENCE_TRACE_READY / NO_GO / BLOCKED",
    "check:heu-khoa-giang-vien-evidence-trace",
  ],
  "backlog P10-06 propagation",
);

requireText(
  "docs/HEU_MODULE_READINESS_GAP_MATRIX_20260628_V01_DRAFT.md",
  [
    "Khoa/Giang vien evidence trace/source reconciliation checklist",
    "HEU_KHOA_GIANG_VIEN_EVIDENCE_TRACE_SOURCE_RECONCILIATION_CHECKLIST_20260703.md",
    "KHOA-EVID-01 through KHOA-EVID-08",
    "check:heu-khoa-giang-vien-evidence-trace",
    "external source reconciliation",
  ],
  "gap matrix P10-06 propagation",
);

requireText(
  "docs/HEU_IMPLEMENTATION_LOG.md",
  [
    "## 2026-07-03 - P10-06 Khoa Giang Vien Evidence Trace Source Reconciliation",
    "HEU_KHOA_GIANG_VIEN_EVIDENCE_TRACE_SOURCE_RECONCILIATION_CHECKLIST_20260703.md",
    "KHOA-EVID-01 through KHOA-EVID-08",
    "KHOA_EVIDENCE_TRACE_READY / NO_GO / BLOCKED",
    "check:heu-khoa-giang-vien-evidence-trace",
    "does not approve report-view reliance",
  ],
  "implementation log P10-06 entry",
);

requireText(
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
  [
    "Khoa/Giang vien evidence trace/source reconciliation checklist",
    "HEU_KHOA_GIANG_VIEN_EVIDENCE_TRACE_SOURCE_RECONCILIATION_CHECKLIST_20260703.md",
    "KHOA-EVID-01 through KHOA-EVID-08",
    "KHOA_EVIDENCE_TRACE_READY / NO_GO / BLOCKED",
    "check:heu-khoa-giang-vien-evidence-trace",
    "external source reconciliation",
  ],
  "production checklist P10-06 propagation",
);

if (failures.length > 0) {
  console.error("HEU Khoa/Giang vien evidence-trace check failed.");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(
  "HEU Khoa/Giang vien evidence-trace check passed. P10-06 remains PASS_LOCAL_EVIDENCE_TRACE and production M08 stays NO-GO.",
);
