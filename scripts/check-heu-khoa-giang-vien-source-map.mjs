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
  "docs/HEU_KHOA_GIANG_VIEN_DELIVERY_SOURCE_MAP_20260703.md",
  "docs/HEU_KHOA_GIANG_VIEN_GAP_PACK_20260703.md",
  "docs/HEU_REPORT_VIEW_REGISTER_20260627_V01_DRAFT.md",
  "docs/HEU_REPORT_VIEW_SOURCE_MAP_20260628_V01_DRAFT.md",
  "docs/HEU_DATA_MASTER_REPORT_VIEW_COMPATIBILITY_20260628_V01_DRAFT.md",
  "docs/HEU_SQL_OBJECT_MASTER_MAP_20260627.md",
  "components/khoa/khoa-giang-vien-gap-pack.tsx",
  "docs/HEU_CURRENT_STATE_INVENTORY.md",
  "docs/HEU_SYSTEM_BUILD_BACKLOG.md",
  "docs/HEU_MODULE_READINESS_GAP_MATRIX_20260628_V01_DRAFT.md",
  "docs/HEU_IMPLEMENTATION_LOG.md",
  "package.json",
];

for (const file of requiredFiles) {
  requireFile(file);
}

const packageJson = exists("package.json") ? JSON.parse(read("package.json")) : {};

if (
  packageJson.scripts?.["check:heu-khoa-giang-vien-source-map"] !==
  "node scripts/check-heu-khoa-giang-vien-source-map.mjs"
) {
  fail("package.json: missing check:heu-khoa-giang-vien-source-map script");
}

requireText(
  "docs/HEU_KHOA_GIANG_VIEN_DELIVERY_SOURCE_MAP_20260703.md",
  [
    "Status: DRAFT_CONTROL",
    "Production status: NO-GO",
    "KHOA_DELIVERY_SOURCE_READY / NO_GO / BLOCKED",
    "RV_KHOA_GIANG_VIEN_DELIVERY / NO_GO / BLOCKED",
    "KHOA-SRC-01",
    "KHOA-SRC-08",
    "KHOA-DQ-01",
    "KHOA-DQ-08",
    "KHOA-RV-EVID-01",
    "KHOA-RV-EVID-06",
    "KPI_KHOA_TEACHER_PROFILE_SCOPE_GAP",
    "KPI_KHOA_DELIVERY_EVIDENCE_TRACE_GAP",
    "KPI_KHOA_PAYMENT_BOUNDARY_BLOCKED",
    "outside Git/Codex/chat",
    "does not approve class delivery reliance",
    "does not approve teaching payment",
    "approve payroll",
    "owner GO/NO-GO",
    "production GO",
  ],
  "Khoa/Giang vien delivery source map",
);

requireText(
  "docs/HEU_KHOA_GIANG_VIEN_GAP_PACK_20260703.md",
  [
    "HEU_KHOA_GIANG_VIEN_DELIVERY_SOURCE_MAP_20260703.md",
    "KHOA-SRC-01 through KHOA-SRC-08",
    "KHOA-DQ-01",
    "KHOA-DQ-08",
    "KHOA-RV-EVID-01 through KHOA-RV-EVID-06",
    "KHOA_DELIVERY_SOURCE_READY / NO_GO / BLOCKED",
    "RV_KHOA_GIANG_VIEN_DELIVERY / NO_GO / BLOCKED",
  ],
  "gap pack P10-02 source-map reference",
);

requireText(
  "docs/HEU_REPORT_VIEW_REGISTER_20260627_V01_DRAFT.md",
  [
    "RV_KHOA_GIANG_VIEN_DELIVERY",
    "Khoa/Giang vien",
    "teacher profile privacy",
    "payment/payroll stop rule",
    "SOURCE_MAP_DRAFT",
  ],
  "report view register Khoa row",
);

requireText(
  "docs/HEU_REPORT_VIEW_SOURCE_MAP_20260628_V01_DRAFT.md",
  [
    "RV_KHOA_GIANG_VIEN_DELIVERY",
    "HEU_KHOA_GIANG_VIEN_DELIVERY_SOURCE_MAP_20260703.md",
    "KHOA-DQ-01 through KHOA-DQ-08",
    "KPI_KHOA_TEACHER_PROFILE_SCOPE_GAP",
    "KPI_KHOA_DELIVERY_EVIDENCE_TRACE_GAP",
    "KPI_KHOA_PAYMENT_BOUNDARY_BLOCKED",
    "DQ-RV-09",
    "RV-EVID-07",
    "KHOA-RV-EVID-01 through KHOA-RV-EVID-06",
    "KHOA_DELIVERY_SOURCE_READY / RV_KHOA_GIANG_VIEN_DELIVERY / NO_GO / BLOCKED",
  ],
  "report view source map Khoa propagation",
);

requireText(
  "docs/HEU_DATA_MASTER_REPORT_VIEW_COMPATIBILITY_20260628_V01_DRAFT.md",
  [
    "CV_FACULTY_DEPARTMENT_COMPAT",
    "CV_TEACHER_PROFILE_COMPAT",
    "FACULTY_DEPARTMENT_MASTER",
    "TEACHER_PROFILE_MASTER",
    "TEACHING_DELIVERY_MASTER",
    "RV_KHOA_GIANG_VIEN_DELIVERY",
    "KHOA-DQ-01",
    "KHOA-DQ-02",
  ],
  "data master compatibility Khoa propagation",
);

requireText(
  "docs/HEU_SQL_OBJECT_MASTER_MAP_20260627.md",
  [
    "FACULTY_DEPARTMENT_MASTER",
    "TEACHER_PROFILE_MASTER",
    "TEACHING_DELIVERY_MASTER",
    "future owner-signed Khoa register",
    "HR/PHAP_CHE teacher display-field register",
    "payment/payroll boundaries need signed Khoa/DAO_TAO/Audit/KHTC owner proof",
  ],
  "SQL object map Khoa master names",
);

requireText(
  "components/khoa/khoa-giang-vien-gap-pack.tsx",
  [
    'data-heu-khoa-delivery-source-map="P10-02_RV_KHOA_GIANG_VIEN_DELIVERY"',
    'data-heu-khoa-delivery-source-decision="KHOA_DELIVERY_SOURCE_READY_NO_GO_BLOCKED"',
    'data-heu-khoa-delivery-source-overflow-guard="P10-02_KHOA_SOURCE_MAP_NO_OVERFLOW"',
    "RV_KHOA_GIANG_VIEN_DELIVERY source map",
    "KHOA_DELIVERY_SOURCE_READY / NO_GO / BLOCKED",
    "KHOA-SRC-01",
    "KHOA-SRC-08",
    "KHOA-DQ-01",
    "KHOA-DQ-08",
    "KPI_KHOA_TEACHER_PROFILE_SCOPE_GAP",
    "KPI_KHOA_DELIVERY_EVIDENCE_TRACE_GAP",
    "KPI_KHOA_PAYMENT_BOUNDARY_BLOCKED",
    "min-w-0",
    "overflow-hidden",
    "break-words",
    "table-fixed",
  ],
  "visible P10-02 Khoa source-map panel",
);

requireText(
  "docs/HEU_CURRENT_STATE_INVENTORY.md",
  [
    "check:heu-khoa-giang-vien-source-map",
    "Khoa/Giang vien delivery source map",
    "HEU_KHOA_GIANG_VIEN_DELIVERY_SOURCE_MAP_20260703.md",
    "KHOA-SRC-01 through KHOA-SRC-08",
    "KHOA-DQ-01 through KHOA-DQ-08",
    "RV_KHOA_GIANG_VIEN_DELIVERY",
  ],
  "current-state P10-02 propagation",
);

requireText(
  "docs/HEU_SYSTEM_BUILD_BACKLOG.md",
  [
    "P10-02",
    "Khoa/Giang vien delivery source map",
    "HEU_KHOA_GIANG_VIEN_DELIVERY_SOURCE_MAP_20260703.md",
    "KHOA_DELIVERY_SOURCE_READY / NO_GO / BLOCKED",
    "RV_KHOA_GIANG_VIEN_DELIVERY / NO_GO / BLOCKED",
    "check:heu-khoa-giang-vien-source-map",
  ],
  "backlog P10-02 propagation",
);

requireText(
  "docs/HEU_MODULE_READINESS_GAP_MATRIX_20260628_V01_DRAFT.md",
  [
    "Khoa/Giang vien delivery source map",
    "HEU_KHOA_GIANG_VIEN_DELIVERY_SOURCE_MAP_20260703.md",
    "KHOA-SRC-01 through KHOA-SRC-08",
    "KHOA-DQ-01 through KHOA-DQ-08",
    "check:heu-khoa-giang-vien-source-map",
    "report-view owner signoff",
  ],
  "gap matrix P10-02 propagation",
);

requireText(
  "docs/HEU_IMPLEMENTATION_LOG.md",
  [
    "## 2026-07-03 - P10-02 Khoa Giang Vien Delivery Source Map",
    "HEU_KHOA_GIANG_VIEN_DELIVERY_SOURCE_MAP_20260703.md",
    "RV_KHOA_GIANG_VIEN_DELIVERY",
    "KHOA_DELIVERY_SOURCE_READY / NO_GO / BLOCKED",
    "check:heu-khoa-giang-vien-source-map",
    "does not approve teaching payment",
  ],
  "implementation log P10-02 entry",
);

if (failures.length > 0) {
  console.error("HEU Khoa/Giang vien source-map check failed.");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(
  "HEU Khoa/Giang vien source-map check passed. P10-02 remains PASS_LOCAL and RV_KHOA_GIANG_VIEN_DELIVERY stays NO-GO for production reliance.",
);
