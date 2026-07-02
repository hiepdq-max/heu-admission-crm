import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const failures = [];

function fail(message) {
  failures.push(message);
}

function read(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), "utf8");
}

function exists(relativePath) {
  return existsSync(path.join(repoRoot, relativePath));
}

function requireFile(relativePath) {
  if (!exists(relativePath)) {
    fail(`Missing required file: ${relativePath}`);
  }
}

function requireText(relativePath, pattern, label) {
  if (!exists(relativePath)) {
    return;
  }

  const contents = read(relativePath);
  if (!pattern.test(contents)) {
    fail(`${relativePath}: missing ${label}`);
  }
}

const dataModelPath = "docs/HEU_DATA_MODEL_V1.md";
const dictionaryPath = "docs/HEU_DATA_DICTIONARY_V1.md";
const roleMatrixPath = "docs/HEU_ROLE_PERMISSION_MATRIX_V1.md";
const sqlMapPath = "docs/HEU_SQL_OBJECT_MASTER_MAP_20260627.md";
const segmentOperatingPath =
  "components/segments/segment-operating-readiness.tsx";
const segmentOperatingFocusPath =
  "components/segments/segment-operating-focus-layout.tsx";
const segmentWorkspaceGuidePath =
  "components/segments/segment-workspace-guide.tsx";
const segmentDetailPagePath = "app/segments/[id]/page.tsx";
const leadListPath = "components/leads/lead-list.tsx";
const implementationLogPath = "docs/HEU_IMPLEMENTATION_LOG.md";

for (const file of [
  dataModelPath,
  dictionaryPath,
  roleMatrixPath,
  sqlMapPath,
  segmentOperatingPath,
  segmentOperatingFocusPath,
  segmentWorkspaceGuidePath,
  segmentDetailPagePath,
  leadListPath,
  implementationLogPath,
]) {
  requireFile(file);
}

const canonicalMasters = [
  "STUDENT_MASTER",
  "CLASS_MASTER",
  "PROGRAM_MAJOR_MASTER",
  "COHORT_MASTER",
  "CENTER_TTGDTX_MASTER",
  "PARTNER_MASTER",
  "CONTRACT_MASTER",
  "TUITION_POLICY_MASTER",
  "FEE_ITEM_MASTER",
  "RECEIVABLE_MASTER",
  "PAYMENT_MASTER",
  "STAFF_USER_MASTER",
  "ROLE_PERMISSION_MASTER",
  "AUDIT_LOG",
];

const dataModel = exists(dataModelPath) ? read(dataModelPath) : "";
const dictionary = exists(dictionaryPath) ? read(dictionaryPath) : "";
const roleMatrix = exists(roleMatrixPath) ? read(roleMatrixPath) : "";
const sqlMap = exists(sqlMapPath) ? read(sqlMapPath) : "";

for (const master of canonicalMasters) {
  if (!dataModel.includes(`\`${master}\``)) {
    fail(`${dataModelPath}: missing canonical master ${master}`);
  }
}

for (const master of [
  "CENTER_TTGDTX_MASTER",
  "PARTNER_MASTER",
  "CONTRACT_MASTER",
  "CLASS_MASTER",
  "STUDENT_MASTER",
  "TUITION_POLICY_MASTER",
  "RECEIVABLE_MASTER",
  "PAYMENT_MASTER",
]) {
  if (!dictionary.includes(`\`${master}\``)) {
    fail(`${dictionaryPath}: missing master definition ${master}`);
  }
}

requireText(
  dataModelPath,
  /Legal basis before transaction posting[\s\S]*Master data before workflow and automation[\s\S]*Audit log before conclusion[\s\S]*AI may draft and check, but cannot approve/i,
  "system principles",
);

requireText(
  dataModelPath,
  /No production migration is allowed until backup, restore dry-run, UAT and human approval are recorded/i,
  "production migration boundary",
);

requireText(
  dataModelPath,
  /P1-01 is PASS_LOCAL[\s\S]*does not approve schema\s+changes, production migration, real-data import, production dashboard use or\s+automated finance posting/i,
  "P1-01 PASS_LOCAL boundary",
);

requireText(
  dictionaryPath,
  /Business code[\s\S]*Record status[\s\S]*Source document[\s\S]*Evidence URL[\s\S]*Soft delete reason/i,
  "core field naming standard",
);

requireText(
  dictionaryPath,
  /Do not commit or print:[\s\S]*raw CCCD[\s\S]*bank account number[\s\S]*API keys, service-role keys, passwords, OTPs/i,
  "sensitive data rule",
);

requireText(
  dictionaryPath,
  /P1-02 is PASS_LOCAL[\s\S]*does not approve\s+schema changes, production migration, real-data import or production data\s+exposure/i,
  "P1-02 PASS_LOCAL boundary",
);

const requiredRoles = [
  "bgh_viewer",
  "it_data_admin",
  "ttgdtx_manager",
  "khtc_accountant",
  "khtc_approver",
  "phap_che_reviewer",
  "tuyen_sinh_staff",
  "cthssv_staff",
  "dao_tao_staff",
  "audit_viewer",
  "partner_limited",
];

for (const role of requiredRoles) {
  if (!roleMatrix.includes(`\`${role}\``)) {
    fail(`${roleMatrixPath}: missing role ${role}`);
  }
}

for (const permissionFamily of [
  "CRM",
  "TTGDTX master",
  "Tuition policy",
  "Import",
  "Receivable",
  "Collection",
  "Reconciliation",
  "Payment request",
  "Payout",
  "Dashboard",
  "Audit",
]) {
  if (!roleMatrix.includes(permissionFamily)) {
    fail(`${roleMatrixPath}: missing permission family ${permissionFamily}`);
  }
}

requireText(
  roleMatrixPath,
  /Codex\/AI is never an approver[\s\S]*approved_by[\s\S]*approved_at[\s\S]*locked_by/i,
  "AI approval boundary",
);

requireText(
  roleMatrixPath,
  /Every finance\/legal\/TTGDTX read should be checked against at least one of:[\s\S]*user role[\s\S]*center scope[\s\S]*partner scope[\s\S]*admission segment scope[\s\S]*department ownership/i,
  "scope boundary",
);

requireText(
  roleMatrixPath,
  /P1-03 is PASS_LOCAL[\s\S]*does\s+not approve production access, broad permissions, real-data UAT or autonomous\s+AI approval/i,
  "P1-03 PASS_LOCAL boundary",
);

requireText(
  segmentOperatingPath,
  /(?=[\s\S]*data-heu-segment-quick-access="P0-05_WORKSPACE_QUICK_ACCESS")(?=[\s\S]*LEAD_LIST)(?=[\s\S]*LEAD_CREATE)(?=[\s\S]*LEAD_IMPORT)(?=[\s\S]*data-heu-segment-operation-steps="P0-05_SCOPE_STEPS")/,
  "P0-05 segment quick access and scoped step markers",
);
requireText(
  segmentOperatingFocusPath,
  /(?=[\s\S]*data-heu-segment-operating-focus-layout="P1-11_SEGMENT_FOCUS")(?=[\s\S]*role="tablist")(?=[\s\S]*role="tab")(?=[\s\S]*role="tabpanel")(?=[\s\S]*aria-controls=\{panelId\})(?=[\s\S]*aria-labelledby=\{`segment-operating-tab-\$\{activeSection\.id\}`\})(?=[\s\S]*ArrowRight)(?=[\s\S]*ArrowDown)(?=[\s\S]*ArrowLeft)(?=[\s\S]*ArrowUp)(?=[\s\S]*Home)(?=[\s\S]*End)(?=[\s\S]*min-w-0)(?=[\s\S]*overflow-hidden)(?=[\s\S]*break-words)(?=[\s\S]*truncate)/,
  "segment operating focus layout accessibility and overflow guard",
);
requireText(
  segmentDetailPagePath,
  /SegmentOperatingFocusLayout[\s\S]*segmentOperatingSections[\s\S]*SegmentWorkspaceGuide[\s\S]*SegmentOperatingProfile[\s\S]*LeadList/,
  "segment detail page focus layout order",
);
requireText(
  leadListPath,
  /(?=[\s\S]*"use client")(?=[\s\S]*type LeadQuickFilter)(?=[\s\S]*id: "followup")(?=[\s\S]*id: "unassigned")(?=[\s\S]*id: "documents")(?=[\s\S]*id: "priority")(?=[\s\S]*id: "active")(?=[\s\S]*data-heu-lead-list-quick-filters="P0-05_LEAD_QUICK_FILTERS")(?=[\s\S]*data-heu-lead-quick-filter-buttons="all followup unassigned documents priority active")(?=[\s\S]*aria-pressed=\{isActive\})/,
  "P0-05 lead list quick filters",
);
requireText(
  leadListPath,
  /(?=[\s\S]*useRouter)(?=[\s\S]*normalizeSearchText)(?=[\s\S]*buildLeadSearchIndex)(?=[\s\S]*leadSearchIndex)(?=[\s\S]*handleSearchKeyDown)(?=[\s\S]*router\.push\(`\/leads\/\$\{firstQuickLead\.id\}`\))(?=[\s\S]*data-heu-lead-list-quick-search="P0-05_LEAD_QUICK_SEARCH")(?=[\s\S]*data-heu-lead-quick-open-results="P0-05_LEAD_QUICK_OPEN_RESULTS")(?=[\s\S]*const quickLeadMatches = filteredLeads\.slice\(0, 3\))(?=[\s\S]*aria-label=)(?=[\s\S]*setSearchQuery\(""\))(?=[\s\S]*lg:hidden)(?=[\s\S]*hidden overflow-x-auto lg:block)/,
  "P0-05 lead list quick search and mobile quick open",
);
requireText(
  leadListPath,
  /(?=[\s\S]*min-w-0)(?=[\s\S]*overflow-hidden)(?=[\s\S]*break-words)(?=[\s\S]*truncate)(?=[\s\S]*shrink-0)(?=[\s\S]*overflow-x-auto)/,
  "lead list quick filter overflow guards",
);
requireText(
  segmentOperatingPath,
  /min-w-0[\s\S]*overflow-hidden[\s\S]*break-words[\s\S]*truncate/,
  "segment operating overflow guards",
);
requireText(
  segmentWorkspaceGuidePath,
  /(?=[\s\S]*data-heu-segment-workspace-guide="P0-05_WORKSPACE_GUIDE")(?=[\s\S]*Truy cập theo nghiệp vụ)(?=[\s\S]*Lead tạo trong khu này phải gắn đúng đối tượng tuyển sinh)/,
  "P0-05 segment workspace guide marker",
);
requireText(
  segmentWorkspaceGuidePath,
  /min-w-0[\s\S]*overflow-hidden[\s\S]*break-words/,
  "segment workspace guide overflow guards",
);
requireText(
  implementationLogPath,
  /P0-05 Segment Workspace Quick Access[\s\S]*segment-operating-focus-layout\.tsx[\s\S]*data-heu-segment-operating-focus-layout="P1-11_SEGMENT_FOCUS"[\s\S]*segment-operating-readiness\.tsx[\s\S]*data-heu-segment-quick-access="P0-05_WORKSPACE_QUICK_ACCESS"[\s\S]*segment-workspace-guide\.tsx[\s\S]*data-heu-segment-workspace-guide="P0-05_WORKSPACE_GUIDE"[\s\S]*lead-list\.tsx[\s\S]*data-heu-lead-list-quick-filters="P0-05_LEAD_QUICK_FILTERS"[\s\S]*data-heu-lead-list-quick-search="P0-05_LEAD_QUICK_SEARCH"[\s\S]*data-heu-lead-quick-open-results="P0-05_LEAD_QUICK_OPEN_RESULTS"[\s\S]*audit-heu-data-foundation\.mjs[\s\S]*does not change role scope[\s\S]*execute UAT[\s\S]*approve finance action[\s\S]*mark production GO/i,
  "P0-05 segment workspace quick access implementation log boundary",
);

for (const master of canonicalMasters) {
  if (!sqlMap.includes(`\`${master}\``)) {
    fail(`${sqlMapPath}: SQL map missing canonical master ${master}`);
  }
}

const packageJson = JSON.parse(read("package.json"));
if (!packageJson.scripts?.["audit:heu-data-foundation"]) {
  fail("package.json: missing audit:heu-data-foundation script");
}

const backlog = read("docs/HEU_SYSTEM_BUILD_BACKLOG.md");
for (const code of ["P1-01", "P1-02", "P1-03"]) {
  if (!new RegExp(`${code}[\\s\\S]*PASS_LOCAL[\\s\\S]*audit:heu-data-foundation`).test(backlog)) {
    fail(`Backlog ${code} must be PASS_LOCAL and reference audit:heu-data-foundation.`);
  }
}

const checklist = read("docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md");
if (!/HEU data foundation controls[\s\S]*PASS_LOCAL[\s\S]*audit:heu-data-foundation/.test(checklist)) {
  fail("Production checklist must include HEU data foundation PASS_LOCAL evidence.");
}

const agents = read("AGENTS.md");
for (const file of [dataModelPath, dictionaryPath, roleMatrixPath]) {
  if (!agents.includes(file)) {
    fail(`AGENTS.md: missing ${file} in required reading.`);
  }
}
if (!agents.includes("npm.cmd run audit:heu-data-foundation")) {
  fail("AGENTS.md: missing data foundation audit in final handoff checks.");
}

const releaseGateAudit = read("scripts/audit-ttgdtx-release-gates.mjs");
if (!releaseGateAudit.includes("audit:heu-data-foundation")) {
  fail("scripts/audit-ttgdtx-release-gates.mjs: missing data foundation audit gate coverage.");
}

if (failures.length > 0) {
  console.error("HEU data foundation audit failed.");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("HEU data foundation audit passed. P1-01/P1-02/P1-03 are controlled without production changes.");
