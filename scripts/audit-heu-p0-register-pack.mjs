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
  "docs/HEU_LEGAL_SOP_GOVERNANCE_CONTROL_MATRIX_20260628_V01_DRAFT.md",
  "docs/HEU_REPORT_VIEW_REGISTER_20260627_V01_DRAFT.md",
  "docs/HEU_REPORT_VIEW_SOURCE_MAP_20260628_V01_DRAFT.md",
  "docs/HEU_DATA_MASTER_REPORT_VIEW_COMPATIBILITY_20260628_V01_DRAFT.md",
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
  "components/reports/data-master-report-view-bridge-panel.tsx",
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
  "docs/HEU_ROOT_CONTROL_ACTION_REGISTER_20260627_V01_DRAFT.md",
  /RC-04[\s\S]*HEU_LEGAL_SOP_GOVERNANCE_CONTROL_MATRIX_20260628_V01_DRAFT\.md[\s\S]*RC-07A[\s\S]*Legal\/SOP\/Governance control matrix[\s\S]*DRAFT_CONTROL[\s\S]*Legal Article Master, SOP Register, evidence class, workflow gate, report view and owner decision boundaries are mapped[\s\S]*signed owner review still required/i,
  "root action register Legal/SOP/Governance routing",
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
  "docs/HEU_SOP_TO_DATA_MAPPING_20260627_V01_DRAFT.md",
  /HEU_LEGAL_SOP_GOVERNANCE_CONTROL_MATRIX_20260628_V01_DRAFT\.md[\s\S]*Legal Article Master, SOP Register, evidence-class,\s+workflow-gate, report-view, finance-reliance, AI-scope and owner-decision\s+boundaries[\s\S]*cannot be used as official legal\s+approval, official SOP issuance, evidence acceptance, UAT acceptance, finance\s+approval, owner waiver or production GO/i,
  "SOP-to-data related Legal/SOP/Governance matrix",
);
requireText(
  "docs/HEU_LEGAL_SOP_GOVERNANCE_CONTROL_MATRIX_20260628_V01_DRAFT.md",
  /(?=[\s\S]*Status:\s*DRAFT_CONTROL)(?=[\s\S]*Production status:\s*NO-GO)(?=[\s\S]*Legal basis -> Regulation\/SOP -> Data source -> Workflow gate -> Evidence\s+class -> Report view -> Audit log -> Signoff register -> Owner decision)(?=[\s\S]*Legal Article Master)(?=[\s\S]*SOP Register)(?=[\s\S]*Evidence Class Boundary)(?=[\s\S]*Workflow Gate)(?=[\s\S]*Report View Reliance)(?=[\s\S]*Finance Reliance Boundary)(?=[\s\S]*AI Scope Boundary)(?=[\s\S]*Owner Decision Boundary)(?=[\s\S]*does not issue legal policy, approve an SOP, accept UAT,\s+accept evidence, approve finance action, approve migration, move Drive files or\s+grant owner Go\/No-Go)/i,
  "Legal/SOP/Governance control matrix boundary",
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
  "docs/HEU_REPORT_VIEW_SOURCE_MAP_20260628_V01_DRAFT.md",
  /Evidence Attachment Queue[\s\S]*RV-EVID-01[\s\S]*RV_TTGDTX_FINANCE_SUMMARY[\s\S]*P5-03-TRIAL-EVID-001 through P5-03-TRIAL-EVID-005[\s\S]*FIN-START-EVID-001 through FIN-START-EVID-005[\s\S]*FIN-DAY1-EVID-001 through FIN-DAY1-EVID-005[\s\S]*P5_03_CONTROLLED_TRIAL_READY \/ FIN_START_READY \/ FIN_DAY1_RESULT_READY \/ NO_GO \/ BLOCKED[\s\S]*RV-EVID-02[\s\S]*SIGNED_UAT_READY \/ NO_GO \/ BLOCKED[\s\S]*RV-EVID-03[\s\S]*PAYOUT_RELEASE_READY \/ NO_GO \/ BLOCKED[\s\S]*RV-EVID-04[\s\S]*HOU_LEDGER_READY \/ NO_GO \/ BLOCKED[\s\S]*RV-EVID-05[\s\S]*SC_ATTENDANCE_PAYMENT_READY \/ NO_GO \/ BLOCKED[\s\S]*RV-EVID-06[\s\S]*AUDIT_AI_SCOPE_READY \/ NO_GO \/ BLOCKED[\s\S]*does not upload files,\s+accept evidence, approve signoff, waive blockers or store raw evidence/i,
  "report-view evidence attachment queue doc",
);

requireText(
  "components/reports/report-view-source-map-panel.tsx",
  /(?=[\s\S]*data-heu-report-view-source-map-panel="P0-16")(?=[\s\S]*Report View Source Map: PASS_LOCAL only)(?=[\s\S]*does not approve production\s+reliance, statutory accounting, finance action, UAT acceptance,\s+evidence acceptance or owner GO)(?=[\s\S]*RV_TTGDTX_FINANCE_SUMMARY)(?=[\s\S]*RV_TTGDTX_CONG_NO_THUC_THU)(?=[\s\S]*RV_TTGDTX_COM_CHI_TRA)(?=[\s\S]*RV_TTGDTX_UAT_READINESS)(?=[\s\S]*RV_HOU_LEDGER_SUMMARY)(?=[\s\S]*RV_SHORT_COURSE_ATTENDANCE_PAYMENT)(?=[\s\S]*RV_AUDIT_RISK_CONTROL)(?=[\s\S]*RV_AI_ALLOWED_CONTEXT)(?=[\s\S]*KPI_TTGDTX_ACTUAL_COLLECTION)(?=[\s\S]*DQ-RV-01)(?=[\s\S]*DQ-RV-02)(?=[\s\S]*DQ-RV-03)(?=[\s\S]*DQ-RV-04)(?=[\s\S]*DQ-RV-05)(?=[\s\S]*DQ-RV-06)(?=[\s\S]*DQ-RV-07)(?=[\s\S]*DQ-RV-08)/i,
  "report-view source map read-only UI panel",
);

requireText(
  "components/reports/report-view-source-map-panel.tsx",
  /(?=[\s\S]*Data Quality Check status capture)(?=[\s\S]*DQ-RV-01)(?=[\s\S]*DQ-RV-02)(?=[\s\S]*DQ-RV-03)(?=[\s\S]*DQ-RV-04)(?=[\s\S]*DQ-RV-05)(?=[\s\S]*DQ-RV-06)(?=[\s\S]*DQ-RV-07)(?=[\s\S]*DQ-RV-08)(?=[\s\S]*CAPTURE_REQUIRED)(?=[\s\S]*SOURCE_RECON_REQUIRED)(?=[\s\S]*RECON_EVIDENCE_REQUIRED)(?=[\s\S]*PAYOUT_LOCK_REQUIRED)(?=[\s\S]*MODULE_SEPARATION_REQUIRED)(?=[\s\S]*ATTENDANCE_LOCK_REQUIRED)(?=[\s\S]*OWNER_DECISION_REQUIRED)(?=[\s\S]*READ_ONLY_SCOPE_REQUIRED)(?=[\s\S]*Owner action:)(?=[\s\S]*Evidence state:)(?=[\s\S]*AI production action remains blocked)/i,
  "report-view data-quality status capture",
);

requireText(
  "components/reports/report-view-source-map-panel.tsx",
  /(?=[\s\S]*Owner signoff capture)(?=[\s\S]*RV-SIGN-01)(?=[\s\S]*RV_TTGDTX_FINANCE_SUMMARY)(?=[\s\S]*OWNER_SIGNOFF_PENDING)(?=[\s\S]*PAYOUT_SIGNOFF_REQUIRED)(?=[\s\S]*HOU_OWNER_SIGNOFF_REQUIRED)(?=[\s\S]*SHORT_COURSE_SIGNOFF_REQUIRED)(?=[\s\S]*AI_SCOPE_SIGNOFF_REQUIRED)(?=[\s\S]*does not collect signatures)/i,
  "report-view owner signoff capture",
);

requireText(
  "components/reports/report-view-source-map-panel.tsx",
  /(?=[\s\S]*data-heu-report-view-evidence-attachment-queue="RV-EVID-01)(?=[\s\S]*Evidence attachment queue)(?=[\s\S]*RV-EVID-01)(?=[\s\S]*P5-03-TRIAL-EVID-001 through P5-03-TRIAL-EVID-005)(?=[\s\S]*FIN-START-EVID-001 through FIN-START-EVID-005)(?=[\s\S]*FIN-DAY1-EVID-001 through FIN-DAY1-EVID-005)(?=[\s\S]*P5_03_CONTROLLED_TRIAL_READY \/ FIN_START_READY \/ FIN_DAY1_RESULT_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*RV-EVID-02)(?=[\s\S]*SIGNED_UAT_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*RV-EVID-03)(?=[\s\S]*PAYOUT_RELEASE_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*RV-EVID-04)(?=[\s\S]*HOU_LEDGER_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*RV-EVID-05)(?=[\s\S]*SC_ATTENDANCE_PAYMENT_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*RV-EVID-06)(?=[\s\S]*AUDIT_AI_SCOPE_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*It does not upload files,\s+accept evidence or waive blockers)/i,
  "report-view evidence attachment queue UI",
);

requireText(
  "docs/HEU_DATA_MASTER_REPORT_VIEW_COMPATIBILITY_20260628_V01_DRAFT.md",
  /(?=[\s\S]*Status:\s*DRAFT_CONTROL)(?=[\s\S]*Production status:\s*NO-GO)(?=[\s\S]*STUDENT_MASTER)(?=[\s\S]*CLASS_MASTER)(?=[\s\S]*COHORT_MASTER)(?=[\s\S]*CV_STUDENT_MASTER_UNIFIED)(?=[\s\S]*CV_CLASS_MASTER_UNIFIED)(?=[\s\S]*CV_COHORT_MASTER_UNIFIED)(?=[\s\S]*REPORT_VIEW_MASTER_CONTRACT)(?=[\s\S]*DQ-DM-01)(?=[\s\S]*DQ-DM-04)(?=[\s\S]*DQ-DM-05[\s\S]*Dashboard reliance lock)(?=[\s\S]*DESIGN_ONLY)(?=[\s\S]*does not approve production SQL,\s+schema migration, UAT acceptance, dashboard reliance, evidence acceptance,\s+finance action or owner Go\/No-Go)/i,
  "Data Master / Report View compatibility plan boundary",
);

requireText(
  "components/reports/data-master-report-view-bridge-panel.tsx",
  /(?=[\s\S]*data-heu-data-master-report-view-bridge-panel="DM-RV-03")(?=[\s\S]*Data Master \/ Report View Bridge: DESIGN_ONLY)(?=[\s\S]*does not\s+create production SQL, merge source records, import real data or\s+approve dashboard reliance)(?=[\s\S]*CV_STUDENT_MASTER_UNIFIED)(?=[\s\S]*CV_CLASS_MASTER_UNIFIED)(?=[\s\S]*CV_COHORT_MASTER_UNIFIED)(?=[\s\S]*REPORT_VIEW_MASTER_CONTRACT)(?=[\s\S]*DQ-DM-01)(?=[\s\S]*DQ-DM-04)(?=[\s\S]*DQ-DM-05)(?=[\s\S]*Dashboard reliance lock)(?=[\s\S]*OWNER_SIGNOFF_PENDING)/i,
  "Data Master / Report View bridge panel",
);

requireText(
  "app/reports/page.tsx",
  /(?=[\s\S]*ReportViewSourceMapPanel)(?=[\s\S]*<ReportViewSourceMapPanel \/>)(?=[\s\S]*DataMasterReportViewBridgePanel)(?=[\s\S]*<DataMasterReportViewBridgePanel \/>)/i,
  "reports page mounts source-map and Data Master / Report View bridge panels",
);

requireText(
  "docs/HEU_AI_AGENT_SCOPE_REGISTER_20260627_V01_DRAFT.md",
  /AI may draft, check, summarize and warn[\s\S]*AI must not\s+approve, pay, post finance records, delete data or mark production GO[\s\S]*Signed UAT proving AI cannot approve, pay, release, delete or go-live/i,
  "AI scope lock",
);

requireText(
  "docs/HEU_RISK_CONTROL_SIGNOFF_REGISTER_20260627_V01_DRAFT.md",
  /PASS_LOCAL means local packaging or static audit passed[\s\S]*does not mean:[\s\S]*production ready[\s\S]*owner GO granted[\s\S]*Legal\/SOP\/governance chain incomplete[\s\S]*Legal\/SOP\/Governance Control Matrix[\s\S]*Human signer only/i,
  "risk signoff boundary",
);

requireText(
  "docs/HEU_MODULE_READINESS_GAP_MATRIX_20260628_V01_DRAFT.md",
  /Classify the current HEU build against the P0 register pack[\s\S]*DAT[\s\S]*CAN_SUA[\s\S]*CHUA_DU_DIEU_KIEN[\s\S]*CAM_CODE[\s\S]*TTGDTX\/9\+ Operating Module[\s\S]*Finance Desk[\s\S]*Gach no from receipt[\s\S]*CAM_CODE[\s\S]*Partner payout execution[\s\S]*CAM_CODE[\s\S]*Bank\/collateral operation[\s\S]*CAM_CODE/i,
  "module readiness matrix classifications and finance stop conditions",
);

requireText(
  "docs/HEU_MODULE_READINESS_GAP_MATRIX_20260628_V01_DRAFT.md",
  /Next Build Queue[\s\S]*TTGDTX\/Finance signed UAT execution support[\s\S]*Report View Register hardening[\s\S]*Data Quality Check status capture, owner signoff capture, controlled evidence attachment queue and DQ-DM-05 reliance lock are created[\s\S]*next gate is actual report-view owner signoff and external controlled evidence attachment[\s\S]*Cross-module Data Master compatibility plan[\s\S]*DQ-DM-01 through DQ-DM-05[\s\S]*next gate is owner signoff before any production SQL or dashboard reliance[\s\S]*HOU ledger\/handover gap pack[\s\S]*Short Course attendance\/payment gap pack[\s\S]*AI scope logging design[\s\S]*Production remains NO-GO until backup\/restore, migration order, signed UAT,\s+hard-delete\/cascade closure and final owner Go\/No-Go are complete/i,
  "module readiness matrix next build queue and NO-GO boundary",
);

requireText(
  "docs/HEU_MODULE_READINESS_GAP_MATRIX_20260628_V01_DRAFT.md",
  /Report View Register[\s\S]*owner signoff capture, controlled evidence attachment queue[\s\S]*evidence attachment queue and master\/report compatibility bridge[\s\S]*Actual owner signoff and external controlled evidence attachment per report view[\s\S]*Cong no dashboard from approved view[\s\S]*controlled evidence attachment queue exist, but actual signoff and external controlled evidence references are still missing/i,
  "module readiness report-view controlled evidence queue sync",
);

const packageJson = JSON.parse(read("package.json"));
if (!packageJson.scripts?.["audit:heu-p0-register-pack"]) {
  fail("package.json: missing audit:heu-p0-register-pack script");
}

requireText(
  "docs/HEU_SYSTEM_BUILD_BACKLOG.md",
  /P0-16[\s\S]*HEU P0 register pack[\s\S]*PASS_LOCAL[\s\S]*HEU_ROOT_CONTROL_ACTION_REGISTER_20260627_V01_DRAFT\.md[\s\S]*HEU_LEGAL_SOP_GOVERNANCE_CONTROL_MATRIX_20260628_V01_DRAFT\.md[\s\S]*HEU_REPORT_VIEW_SOURCE_MAP_20260628_V01_DRAFT\.md[\s\S]*components\/reports\/report-view-source-map-panel\.tsx[\s\S]*\/reports[\s\S]*RV_TTGDTX_FINANCE_SUMMARY[\s\S]*Finance Day-1 start-gate checklist and result ledger[\s\S]*FIN_START_READY \/ NO_GO \/ BLOCKED[\s\S]*FIN_DAY1_RESULT_READY \/ NO_GO \/ BLOCKED[\s\S]*HEU_MODULE_READINESS_GAP_MATRIX_20260628_V01_DRAFT\.md[\s\S]*audit:heu-p0-register-pack[\s\S]*does not approve production/i,
  "P0-16 backlog row",
);

requireText(
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
  /HEU P0 register pack[\s\S]*PASS_LOCAL[\s\S]*HEU_ROOT_CONTROL_ACTION_REGISTER_20260627_V01_DRAFT\.md[\s\S]*HEU_LEGAL_SOP_GOVERNANCE_CONTROL_MATRIX_20260628_V01_DRAFT\.md[\s\S]*HEU_REPORT_VIEW_SOURCE_MAP_20260628_V01_DRAFT\.md[\s\S]*components\/reports\/report-view-source-map-panel\.tsx[\s\S]*\/reports[\s\S]*RV_TTGDTX_FINANCE_SUMMARY[\s\S]*Finance Day-1 start-gate checklist and result ledger[\s\S]*FIN_START_READY \/ NO_GO \/ BLOCKED[\s\S]*FIN_DAY1_RESULT_READY \/ NO_GO \/ BLOCKED[\s\S]*HEU_RISK_CONTROL_SIGNOFF_REGISTER_20260627_V01_DRAFT\.md[\s\S]*HEU_MODULE_READINESS_GAP_MATRIX_20260628_V01_DRAFT\.md[\s\S]*audit:heu-p0-register-pack[\s\S]*does not approve production/i,
  "production checklist P0 register row",
);

requireText(
  "docs/HEU_SYSTEM_BUILD_BACKLOG.md",
  /P0-18[\s\S]*Data Master \/ Report View compatibility bridge[\s\S]*PASS_LOCAL[\s\S]*HEU_DATA_MASTER_REPORT_VIEW_COMPATIBILITY_20260628_V01_DRAFT\.md[\s\S]*components\/reports\/data-master-report-view-bridge-panel\.tsx[\s\S]*\/reports[\s\S]*STUDENT_MASTER[\s\S]*CLASS_MASTER[\s\S]*COHORT_MASTER[\s\S]*DQ-DM-01 through DQ-DM-05[\s\S]*dashboard reliance lock[\s\S]*does not create production SQL, merge source data, import real data, approve report-view signoff, approve dashboard reliance or mark production GO/i,
  "P0-18 Data Master / Report View bridge backlog row",
);

requireText(
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
  /Data Master \/ Report View compatibility bridge[\s\S]*PASS_LOCAL[\s\S]*HEU_DATA_MASTER_REPORT_VIEW_COMPATIBILITY_20260628_V01_DRAFT\.md[\s\S]*components\/reports\/data-master-report-view-bridge-panel\.tsx[\s\S]*\/reports[\s\S]*STUDENT_MASTER[\s\S]*CLASS_MASTER[\s\S]*COHORT_MASTER[\s\S]*DQ-DM-01 through DQ-DM-05[\s\S]*dashboard reliance lock[\s\S]*no production SQL, source merge, real-data import, report-view signoff, dashboard reliance or production GO/i,
  "Data Master / Report View bridge production checklist row",
);

requireText(
  "docs/HEU_CURRENT_STATE_INVENTORY.md",
  /npm\.cmd run audit:heu-p0-register-pack[\s\S]*PASS[\s\S]*P0 register pack[\s\S]*root control, data master, dictionary, SOP-to-data, Legal\/SOP\/Governance control matrix, report view, report-view source map, read-only `\/reports` source-map panel with Data Quality Check status capture, owner signoff capture and controlled evidence attachment queue[\s\S]*RV_TTGDTX_FINANCE_SUMMARY[\s\S]*Finance Day-1 start-gate checklist and Finance Day-1 result ledger[\s\S]*AI scope, risk signoff registers and module readiness gap matrix[\s\S]*HEU_DATA_MASTER_REPORT_VIEW_COMPATIBILITY_20260628_V01_DRAFT\.md[\s\S]*STUDENT_MASTER[\s\S]*CLASS_MASTER[\s\S]*COHORT_MASTER/i,
  "current-state P0 register evidence",
);

requireText(
  "docs/HEU_IMPLEMENTATION_LOG.md",
  /Report View Finance Day-1 Evidence Gate[\s\S]*report-view-source-map-panel\.tsx[\s\S]*RV_TTGDTX_FINANCE_SUMMARY[\s\S]*Finance Day-1 start-gate and result\s+ledger evidence[\s\S]*HEU_REPORT_VIEW_SOURCE_MAP_20260628_V01_DRAFT\.md[\s\S]*FIN-START-EVID-001[\s\S]*FIN-DAY1-EVID-005[\s\S]*FIN_START_READY \/ NO_GO \/ BLOCKED[\s\S]*FIN_DAY1_RESULT_READY \/ NO_GO \/ BLOCKED[\s\S]*audit-heu-p0-register-pack\.mjs[\s\S]*does not upload files[\s\S]*approve report-view reliance[\s\S]*mark production GO/i,
  "report-view Finance Day-1 evidence gate implementation log entry",
);

requireText(
  "docs/HEU_CURRENT_STATE_INVENTORY.md",
  /Data Master \/ Report View bridge[\s\S]*\/reports[\s\S]*compatibility objects, report-view master requirements and DQ-DM-01 through DQ-DM-05 stop conditions[\s\S]*dashboard reliance lock[\s\S]*PASS_LOCAL; no production SQL, source merge, real-data import, report-view signoff or dashboard reliance approved/i,
  "current-state Data Master / Report View bridge row",
);

requireText(
  "docs/HEU_IMPLEMENTATION_LOG.md",
  /Data Master Report View Compatibility Bridge[\s\S]*HEU_DATA_MASTER_REPORT_VIEW_COMPATIBILITY_20260628_V01_DRAFT\.md[\s\S]*components\/reports\/data-master-report-view-bridge-panel\.tsx[\s\S]*STUDENT_MASTER[\s\S]*CLASS_MASTER[\s\S]*COHORT_MASTER[\s\S]*does not\s+create production SQL, merge source data, import real data, approve\s+report-view signoff, approve dashboard reliance, accept evidence, approve\s+migration, approve finance action or mark production GO/i,
  "Data Master / Report View bridge implementation log entry",
);

requireText(
  "docs/HEU_IMPLEMENTATION_LOG.md",
  /Report View Owner Signoff Capture[\s\S]*components\/reports\/report-view-source-map-panel\.tsx[\s\S]*owner signoff capture queue[\s\S]*required owner groups[\s\S]*signoff state and blockers[\s\S]*current-state, P0 register and release-gate audits[\s\S]*read-only report governance UI only[\s\S]*does not collect signatures,\s+approve dashboard production reliance, statutory accounting, finance action,\s+UAT acceptance, evidence acceptance, owner GO or production GO/i,
  "report-view owner signoff capture implementation log entry",
);

requireText(
  "docs/HEU_IMPLEMENTATION_LOG.md",
  /Report View Evidence Attachment Queue[\s\S]*components\/reports\/report-view-source-map-panel\.tsx[\s\S]*HEU_REPORT_VIEW_SOURCE_MAP_20260628_V01_DRAFT\.md[\s\S]*RV-EVID-01 through RV-EVID-06[\s\S]*P5-03-TRIAL-EVID-001 through P5-03-TRIAL-EVID-005[\s\S]*P5_03_CONTROLLED_TRIAL_READY \/ NO_GO \/ BLOCKED[\s\S]*Data Quality Check status capture, owner signoff\s+capture and controlled evidence attachment queue[\s\S]*read-only report governance UI packaging only[\s\S]*does not upload\s+files, collect signatures, accept evidence, approve signoff, waive blockers,\s+approve finance action, approve report-view reliance, accept UAT or mark\s+production GO/i,
  "report-view evidence attachment queue implementation log entry",
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
  /Legal SOP Governance Control Matrix[\s\S]*HEU_LEGAL_SOP_GOVERNANCE_CONTROL_MATRIX_20260628_V01_DRAFT\.md[\s\S]*Legal Article Master, SOP Register, evidence class, workflow gate,\s+report view reliance, finance reliance, AI scope and owner decision\s+boundaries[\s\S]*DRAFT_CONTROL[\s\S]*does not issue legal\s+policy, approve an SOP, move Drive files, accept UAT, accept evidence,\s+approve finance action, waive owner decision or mark production GO/i,
  "Legal/SOP/Governance matrix implementation log entry",
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
