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

const registerFiles = [
  "docs/HEU_ROOT_CONTROL_ACTION_REGISTER_20260627_V01_DRAFT.md",
  "docs/HEU_DATA_MASTER_P0_REGISTER_20260627_V01_DRAFT.md",
  "docs/HEU_DATA_DICTIONARY_MIN_20260627_V01_DRAFT.md",
  "docs/HEU_SOP_TO_DATA_MAPPING_20260627_V01_DRAFT.md",
  "docs/HEU_REPORT_VIEW_REGISTER_20260627_V01_DRAFT.md",
  "docs/HEU_REPORT_VIEW_SOURCE_MAP_20260628_V01_DRAFT.md",
  "docs/HEU_AI_AGENT_SCOPE_REGISTER_20260627_V01_DRAFT.md",
  "docs/HEU_RISK_CONTROL_SIGNOFF_REGISTER_20260627_V01_DRAFT.md",
  "docs/HEU_MODULE_READINESS_GAP_MATRIX_20260628_V01_DRAFT.md",
];

for (const file of [
  ...registerFiles,
  "docs/HEU_SYSTEM_BUILD_BACKLOG.md",
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
  "docs/HEU_CURRENT_STATE_INVENTORY.md",
  "docs/HEU_IMPLEMENTATION_LOG.md",
  "app/reports/page.tsx",
  "components/reports/report-view-source-map-panel.tsx",
  "AGENTS.md",
  "package.json",
  "scripts/audit-ttgdtx-release-gates.mjs",
]) {
  requireFile(file);
}

for (const file of registerFiles) {
  requireText(file, /Status:\s*DRAFT_CONTROL/i, "DRAFT_CONTROL status");
  requireText(file, /Production status:.*NO-GO/i, "NO-GO production boundary");
}

requireText(
  "docs/HEU_ROOT_CONTROL_ACTION_REGISTER_20260627_V01_DRAFT.md",
  /No new level-1 folder is allowed[\s\S]*00_HE_THONG[\s\S]*11_AUDIT_KIEM_SOAT[\s\S]*Folder Registry, File Registry,\s*Version Log, Audit Log and Signoff Register/i,
  "root folder and registry rule",
);

requireText(
  "docs/HEU_ROOT_CONTROL_ACTION_REGISTER_20260627_V01_DRAFT.md",
  /RC-08[\s\S]*DRAFT_MATRIX_READY[\s\S]*HEU_MODULE_READINESS_GAP_MATRIX_20260628_V01_DRAFT\.md[\s\S]*RC-09[\s\S]*DRAFT_MATRIX_READY[\s\S]*HEU_MODULE_READINESS_GAP_MATRIX_20260628_V01_DRAFT\.md[\s\S]*RC-10[\s\S]*DRAFT_MATRIX_READY[\s\S]*HEU_MODULE_READINESS_GAP_MATRIX_20260628_V01_DRAFT\.md[\s\S]*TTGDTX\/Finance[\s\S]*HOU[\s\S]*Short Course/i,
  "root action register module matrix routing",
);

requireText(
  "docs/HEU_DATA_MASTER_P0_REGISTER_20260627_V01_DRAFT.md",
  /Data Master comes before workflow, dashboard, automation and AI[\s\S]*STUDENT_MASTER \/ HOC_SINH_MASTER[\s\S]*REPORT_VIEW_REGISTER[\s\S]*SIGNOFF_REGISTER/i,
  "P0 data master ordering and required masters",
);

requireText(
  "docs/HEU_DATA_DICTIONARY_MIN_20260627_V01_DRAFT.md",
  /AI is never approver[\s\S]*Money is recognized only after HEU receives and reconciles it[\s\S]*Do not commit or paste raw CCCD/i,
  "minimum dictionary control fields and sensitive-data rule",
);

requireText(
  "docs/HEU_SOP_TO_DATA_MAPPING_20260627_V01_DRAFT.md",
  /Event -> Legal Check -> Regulation -> SOP[\s\S]*Report View -> Dashboard -> Audit[\s\S]*CHUA_DU_DIEU_KIEN/i,
  "SOP-to-data gate chain",
);

requireText(
  "docs/HEU_REPORT_VIEW_REGISTER_20260627_V01_DRAFT.md",
  /Dashboard -> Report View -> Data Quality Check -> Source Map -> Owner Signoff[\s\S]*HEU_REPORT_VIEW_SOURCE_MAP_20260628_V01_DRAFT\.md[\s\S]*RV_TTGDTX_FINANCE_SUMMARY[\s\S]*SOURCE_MAP_DRAFT[\s\S]*RV_AI_ALLOWED_CONTEXT/i,
  "report-view source control",
);

requireText(
  "docs/HEU_REPORT_VIEW_SOURCE_MAP_20260628_V01_DRAFT.md",
  /Dashboard -> Report View -> Physical Source -> Data Quality Check -> Owner\s+Signoff -> UAT Evidence[\s\S]*RV_TTGDTX_FINANCE_SUMMARY[\s\S]*RV_TTGDTX_CONG_NO_THUC_THU[\s\S]*RV_TTGDTX_COM_CHI_TRA[\s\S]*RV_HOU_LEDGER_SUMMARY[\s\S]*RV_SHORT_COURSE_ATTENDANCE_PAYMENT[\s\S]*RV_AI_ALLOWED_CONTEXT/i,
  "report-view source map controlled views",
);

requireText(
  "docs/HEU_REPORT_VIEW_SOURCE_MAP_20260628_V01_DRAFT.md",
  /KPI Dictionary Shell[\s\S]*KPI_TTGDTX_ACTUAL_COLLECTION[\s\S]*Does not replace bank reconciliation or HEU actual receipt proof[\s\S]*Data Quality Check Log Shell[\s\S]*DQ-RV-01[\s\S]*DQ-RV-08[\s\S]*Report views remain DRAFT_CONTROL until owner signoff and UAT evidence exist/i,
  "report-view source map KPI and DQ boundaries",
);

requireText(
  "components/reports/report-view-source-map-panel.tsx",
  /(?=[\s\S]*data-heu-report-view-source-map-panel="P0-16")(?=[\s\S]*Report View Source Map: PASS_LOCAL only)(?=[\s\S]*does not approve production\s+reliance, statutory accounting, finance action, UAT acceptance,\s+evidence acceptance or owner GO)(?=[\s\S]*RV_TTGDTX_FINANCE_SUMMARY)(?=[\s\S]*RV_TTGDTX_CONG_NO_THUC_THU)(?=[\s\S]*RV_TTGDTX_COM_CHI_TRA)(?=[\s\S]*RV_HOU_LEDGER_SUMMARY)(?=[\s\S]*RV_SHORT_COURSE_ATTENDANCE_PAYMENT)(?=[\s\S]*RV_AI_ALLOWED_CONTEXT)(?=[\s\S]*KPI_TTGDTX_ACTUAL_COLLECTION)(?=[\s\S]*DQ-RV-08)/i,
  "report-view source map read-only UI panel",
);

requireText(
  "components/reports/report-view-source-map-panel.tsx",
  /(?=[\s\S]*Data Quality Check status capture)(?=[\s\S]*CAPTURE_REQUIRED)(?=[\s\S]*Owner action:)(?=[\s\S]*Evidence state:)(?=[\s\S]*RECON_EVIDENCE_REQUIRED)(?=[\s\S]*PAYOUT_LOCK_REQUIRED)(?=[\s\S]*READ_ONLY_SCOPE_REQUIRED)(?=[\s\S]*AI production action remains blocked)/i,
  "report-view data-quality status capture",
);

requireText(
  "app/reports/page.tsx",
  /ReportViewSourceMapPanel[\s\S]*<ReportViewSourceMapPanel \/>/i,
  "reports page mounts source-map panel",
);

requireText(
  "docs/HEU_AI_AGENT_SCOPE_REGISTER_20260627_V01_DRAFT.md",
  /AI may draft, check, summarize and warn[\s\S]*AI must not\s+approve, pay, post finance records, delete data or mark production GO[\s\S]*Signed UAT proving AI cannot approve, pay, release, delete or go-live/i,
  "AI scope lock",
);

requireText(
  "docs/HEU_RISK_CONTROL_SIGNOFF_REGISTER_20260627_V01_DRAFT.md",
  /PASS_LOCAL means local packaging or static audit passed[\s\S]*does not mean:[\s\S]*production ready[\s\S]*owner GO granted[\s\S]*Human signer only/i,
  "risk signoff boundary",
);

requireText(
  "docs/HEU_MODULE_READINESS_GAP_MATRIX_20260628_V01_DRAFT.md",
  /Classify the current HEU build against the P0 register pack[\s\S]*DAT[\s\S]*CAN_SUA[\s\S]*CHUA_DU_DIEU_KIEN[\s\S]*CAM_CODE[\s\S]*TTGDTX\/9\+ Operating Module[\s\S]*Finance Desk[\s\S]*Gach no from receipt[\s\S]*CAM_CODE[\s\S]*Partner payout execution[\s\S]*CAM_CODE[\s\S]*Bank\/collateral operation[\s\S]*CAM_CODE/i,
  "module readiness matrix classifications and finance stop conditions",
);

requireText(
  "docs/HEU_MODULE_READINESS_GAP_MATRIX_20260628_V01_DRAFT.md",
  /Next Build Queue[\s\S]*TTGDTX\/Finance signed UAT execution support[\s\S]*Report View Register hardening[\s\S]*Data Quality Check status capture[\s\S]*next build is owner signoff capture[\s\S]*Cross-module Data Master compatibility plan[\s\S]*HOU ledger\/handover gap pack[\s\S]*Short Course attendance\/payment gap pack[\s\S]*AI scope logging design[\s\S]*Production remains NO-GO until backup\/restore, migration order, signed UAT,\s+hard-delete\/cascade closure and final owner Go\/No-Go are complete/i,
  "module readiness matrix next build queue and NO-GO boundary",
);

const packageJson = JSON.parse(read("package.json"));
if (!packageJson.scripts?.["audit:heu-p0-register-pack"]) {
  fail("package.json: missing audit:heu-p0-register-pack script");
}

requireText(
  "docs/HEU_SYSTEM_BUILD_BACKLOG.md",
  /P0-16[\s\S]*HEU P0 register pack[\s\S]*PASS_LOCAL[\s\S]*HEU_ROOT_CONTROL_ACTION_REGISTER_20260627_V01_DRAFT\.md[\s\S]*HEU_REPORT_VIEW_SOURCE_MAP_20260628_V01_DRAFT\.md[\s\S]*components\/reports\/report-view-source-map-panel\.tsx[\s\S]*\/reports[\s\S]*HEU_MODULE_READINESS_GAP_MATRIX_20260628_V01_DRAFT\.md[\s\S]*audit:heu-p0-register-pack[\s\S]*does not approve production/i,
  "P0-16 backlog row",
);

requireText(
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
  /HEU P0 register pack[\s\S]*PASS_LOCAL[\s\S]*HEU_ROOT_CONTROL_ACTION_REGISTER_20260627_V01_DRAFT\.md[\s\S]*HEU_REPORT_VIEW_SOURCE_MAP_20260628_V01_DRAFT\.md[\s\S]*components\/reports\/report-view-source-map-panel\.tsx[\s\S]*\/reports[\s\S]*HEU_RISK_CONTROL_SIGNOFF_REGISTER_20260627_V01_DRAFT\.md[\s\S]*HEU_MODULE_READINESS_GAP_MATRIX_20260628_V01_DRAFT\.md[\s\S]*audit:heu-p0-register-pack[\s\S]*does not approve production/i,
  "production checklist P0 register row",
);

requireText(
  "docs/HEU_CURRENT_STATE_INVENTORY.md",
  /npm\.cmd run audit:heu-p0-register-pack[\s\S]*PASS[\s\S]*P0 register pack[\s\S]*root control, data master, dictionary, SOP-to-data, report view, report-view source map, read-only `\/reports` source-map panel with Data Quality Check status capture, AI scope, risk signoff registers and module readiness gap matrix/i,
  "current-state P0 register evidence",
);

requireText(
  "docs/HEU_IMPLEMENTATION_LOG.md",
  /Report View Data Quality Status Capture[\s\S]*components\/reports\/report-view-source-map-panel\.tsx[\s\S]*Data Quality Check capture status[\s\S]*owner action[\s\S]*evidence state[\s\S]*stop condition[\s\S]*actual\s+receipt\/reconciliation evidence[\s\S]*AI\s+read-only scope checks[\s\S]*read-only report governance UI only[\s\S]*does not approve dashboard\s+production reliance, statutory accounting, finance action, UAT acceptance,\s+evidence acceptance, owner GO or production GO/i,
  "report-view data-quality status capture implementation log entry",
);

requireText(
  "docs/HEU_IMPLEMENTATION_LOG.md",
  /Report View Source Map Read-Only UI[\s\S]*components\/reports\/report-view-source-map-panel\.tsx[\s\S]*read-only P0-16 panel[\s\S]*Mounted the panel on `\/reports`[\s\S]*P0 register, current-state, implementation-log and release-gate\s+audits[\s\S]*read-only report governance UI only[\s\S]*does not approve dashboard\s+production reliance, statutory accounting, finance action, UAT acceptance,\s+evidence acceptance, owner GO or production GO/i,
  "report-view source map read-only UI implementation log entry",
);

requireText(
  "docs/HEU_IMPLEMENTATION_LOG.md",
  /Report View Source Map Hardening[\s\S]*HEU_REPORT_VIEW_SOURCE_MAP_20260628_V01_DRAFT\.md[\s\S]*TTGDTX\/Finance Desk,\s+HOU, Short Course, Audit and AI[\s\S]*SOURCE_MAP_DRAFT[\s\S]*KPI dictionary plus data-quality-check shells[\s\S]*read-only report governance[\s\S]*does not approve dashboard production\s+reliance, statutory accounting, finance action, UAT acceptance, evidence\s+acceptance or owner GO/i,
  "report-view source map implementation log entry",
);

requireText(
  "docs/HEU_IMPLEMENTATION_LOG.md",
  /Module Readiness Gap Matrix[\s\S]*HEU_MODULE_READINESS_GAP_MATRIX_20260628_V01_DRAFT\.md[\s\S]*DAT[\s\S]*CAN_SUA[\s\S]*CHUA_DU_DIEU_KIEN[\s\S]*CAM_CODE[\s\S]*RC-08, RC-09 and RC-10[\s\S]*review\/control routing only[\s\S]*does not execute UAT, approve\s+migration, approve finance action, accept evidence or mark production GO/i,
  "module readiness gap matrix implementation log entry",
);

requireText(
  "docs/HEU_IMPLEMENTATION_LOG.md",
  /P0 Register Pack Foundation[\s\S]*HEU_ROOT_CONTROL_ACTION_REGISTER_20260627_V01_DRAFT\.md[\s\S]*audit:heu-p0-register-pack[\s\S]*This is register packaging only[\s\S]*does not execute UAT, approve migration,\s+approve finance action or mark production GO/i,
  "implementation log entry",
);

requireText(
  "AGENTS.md",
  /HEU_ROOT_CONTROL_ACTION_REGISTER_20260627_V01_DRAFT\.md[\s\S]*HEU_RISK_CONTROL_SIGNOFF_REGISTER_20260627_V01_DRAFT\.md[\s\S]*HEU_MODULE_READINESS_GAP_MATRIX_20260628_V01_DRAFT\.md[\s\S]*npm\.cmd run audit:heu-p0-register-pack/i,
  "AGENTS required reading and handoff command",
);

requireText(
  "scripts/audit-ttgdtx-release-gates.mjs",
  /scripts\/audit-heu-p0-register-pack\.mjs[\s\S]*audit:heu-p0-register-pack/i,
  "release-gate required file and script coverage",
);

if (failures.length > 0) {
  console.error("HEU P0 register pack audit failed.");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("HEU P0 register pack audit passed. P0 registers are packaged as DRAFT_CONTROL with production NO-GO.");
