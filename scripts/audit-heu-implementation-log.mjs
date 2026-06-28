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

function requireFile(relativePath) {
  if (!existsSync(path.join(repoRoot, relativePath))) {
    fail(`Missing required file: ${relativePath}`);
  }
}

function requireText(contents, pattern, label, file) {
  if (!pattern.test(contents)) {
    fail(`${file}: missing ${label}`);
  }
}

for (const file of [
  "AGENTS.md",
  "package.json",
  "docs/HEU_IMPLEMENTATION_LOG.md",
  "docs/HEU_SYSTEM_BUILD_BACKLOG.md",
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
  "docs/HEU_CURRENT_STATE_INVENTORY.md",
  "docs/HEU_LEGAL_SOP_GOVERNANCE_CONTROL_MATRIX_20260628_V01_DRAFT.md",
  "docs/HEU_AI_PROMPT_OUTPUT_AUDIT_LOGGING_DESIGN_20260628.md",
  "docs/HEU_REPORT_VIEW_SOURCE_MAP_20260628_V01_DRAFT.md",
  "docs/HEU_DATA_MASTER_REPORT_VIEW_COMPATIBILITY_20260628_V01_DRAFT.md",
  "docs/HEU_HOU_LEDGER_HANDOVER_GAP_PACK_20260628_V01_DRAFT.md",
  "docs/HEU_SHORT_COURSE_ATTENDANCE_PAYMENT_GAP_PACK_20260628_V01_DRAFT.md",
  "docs/TTGDTX_SIGNED_UAT_EXECUTION_ROUTING_HUB_20260628.md",
  "docs/HEU_MODULE_READINESS_GAP_MATRIX_20260628_V01_DRAFT.md",
  "components/reports/report-view-source-map-panel.tsx",
  "components/reports/data-master-report-view-bridge-panel.tsx",
  "components/hou/hou-ledger-handover-gap-pack.tsx",
  "components/short-course/short-course-attendance-payment-gap-pack.tsx",
  "components/ttgdtx/ttgdtx-signed-uat-execution-routing-hub.tsx",
  "scripts/audit-ttgdtx-signed-uat-execution-routing-hub.mjs",
  "scripts/audit-ttgdtx-release-gates.mjs",
]) {
  requireFile(file);
}

const agents = read("AGENTS.md");
const packageJson = JSON.parse(read("package.json"));
const log = read("docs/HEU_IMPLEMENTATION_LOG.md");
const backlog = read("docs/HEU_SYSTEM_BUILD_BACKLOG.md");
const checklist = read("docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md");
const inventory = read("docs/HEU_CURRENT_STATE_INVENTORY.md");
const releaseGateAudit = read("scripts/audit-ttgdtx-release-gates.mjs");

const fastFailures = [];

function fastRequire(contents, tokens, label, file) {
  for (const token of tokens) {
    if (!contents.includes(token)) {
      fastFailures.push(`${file}: missing ${label}: ${token}`);
    }
  }
}

function fastSection(title, tokens) {
  const marker = `## ${title}`;
  const start = log.indexOf(marker);
  if (start === -1) {
    fastFailures.push(`docs/HEU_IMPLEMENTATION_LOG.md: missing section ${title}`);
    return;
  }

  const next = log.indexOf("\n## ", start + marker.length);
  const section = next === -1 ? log.slice(start) : log.slice(start, next);
  fastRequire(section, tokens, title, "docs/HEU_IMPLEMENTATION_LOG.md");
}

if (!packageJson.scripts?.["audit:heu-implementation-log"]) {
  fastFailures.push("package.json: missing audit:heu-implementation-log script");
}

fastRequire(
  agents,
  ["Before any final handoff", "npm.cmd run audit:heu-implementation-log"],
  "implementation-log audit in final handoff checks",
  "AGENTS.md",
);

fastRequire(
  releaseGateAudit,
  ["scripts/audit-heu-implementation-log.mjs", "audit:heu-implementation-log"],
  "release-gate coverage for implementation-log audit",
  "scripts/audit-ttgdtx-release-gates.mjs",
);

fastSection("2026-06-28 - P2-17 Payout Immediate Stop Guard", [
  "data-ttgdtx-payout-immediate-stop",
  "ttgdtx-payout-execution-readiness-checklist.tsx",
  "request is not approved",
  "can_pay",
  "amount/voucher/evidence/dossier checks fail",
  "bank-transfer boundary is unclear",
  "audit:ttgdtx-payout-execution-readiness",
  "audit:ttgdtx-release-gates",
  "does not initiate money movement",
  "mark production GO",
]);

fastSection("2026-06-28 - P0-19 Legal Finance Immediate Stop Guard", [
  "data-ttgdtx-p019-immediate-stop",
  "ttgdtx-p019-uat-evidence-checklist.tsx",
  "legal scope",
  "program/major",
  "tuition amount",
  "invoice/chung-tu",
  "P2-05/P2-03 can create a",
  "sandbox data",
  "Step100",
  "oral, ownerless",
  "signed legal/finance UAT",
  "controlled redacted evidence",
  "audit:ttgdtx-p019-gate-guard",
  "audit:heu-current-state-inventory",
  "audit:ttgdtx-release-gates",
  "does not execute UAT",
  "mark production GO",
]);

fastSection("2026-06-28 - P2-18 Dashboard Immediate Stop Guard", [
  "data-ttgdtx-dashboard-immediate-stop",
  "ttgdtx-dashboard-source-reconciliation-checklist.tsx",
  "finance approval",
  "statutory accounting",
  "revenue recognition",
  "bank-transfer instruction",
  "signed browser UAT",
  "source reconciliation",
  "contract-only",
  "out-of-scope users see finance totals",
  "source variance",
  "raw sensitive dashboard evidence",
  "audit:ttgdtx-dashboard-source-reconciliation",
  "audit:heu-current-state-inventory",
  "audit:ttgdtx-release-gates",
  "does not execute browser UAT",
  "mark production GO",
]);

fastSection("2026-06-28 - P5-03 Finance Desk Immediate Stop Guard", [
  "data-finance-desk-immediate-stop",
  "finance-desk-uat-evidence-checklist.tsx",
  "statutory accounting",
  "voucher posting",
  "bank-transfer",
  "signed browser UAT",
  "workspace-scope denial",
  "contract-only/out-of-scope users see totals",
  "raw sensitive evidence",
  "audit:heu-finance-desk",
  "audit:heu-current-state-inventory",
  "audit:ttgdtx-release-gates",
  "does not execute UAT",
  "mark production GO",
]);

fastSection("2026-06-28 - P6-06 Conversion Immediate Stop Guard", [
  "data-hard-delete-conversion-immediate-stop",
  "hard-delete-conversion-decision-queue.tsx",
  "protected row can still cascade-delete",
  "waiver is broad/oral/ownerless",
  "rollback relies on truncate",
  "audit:hard-delete-conversion-decision-queue",
  "audit:ttgdtx-release-gates",
  "does not execute deletion",
  "production GO",
]);

fastSection("2026-06-28 - P0-03 Backup Restore Immediate Stop Guard", [
  "data-p003-backup-restore-immediate-stop",
  "supabase-backup-restore-guard.tsx",
  "target identity",
  "is unclear",
  "backup/restore proof is incomplete",
  "secrets/raw PII",
  "audit:ttgdtx-backup-restore-dry-run-pack",
  "audit:ttgdtx-release-gates",
  "does not execute backup",
  "production GO",
]);

fastSection("2026-06-28 - P0-14 Evidence Binder Forbidden Content Prominence", [
  "ttgdtx-production-evidence-binder.tsx",
  "forbidden-content rule",
  "audit:heu-production-evidence-binder",
  "audit:ttgdtx-release-gates",
  "Forbidden",
  "controlled evidence",
  "does not collect evidence",
  "mark production GO",
]);

fastSection("2026-06-28 - TTGDTX Release Gate Execution Queue Decision Lock", [
  "scripts/audit-ttgdtx-release-gates.mjs",
  "Decision",
  "Stop",
  "step.decisionValue",
  "step.stopCondition",
  "main execution queue with decision values and stop conditions",
  "P0-03/Step90-Step110",
  "does not collect evidence",
  "mark production GO",
]);

fastSection("2026-06-28 - TTGDTX Main Execution Queue Decision Stops", [
  "PRODUCTION_EXECUTION_STEPS",
  "decision values",
  "stop conditions",
  "P0-10 redaction",
  "final owner",
  "GO/NO-GO",
  "ttgdtx-production-execution-queue.tsx",
  "main execution queue",
  "does not collect evidence",
  "mark production GO",
]);

fastSection("2026-06-28 - TTGDTX Signed UAT Execution Routing Hub", [
  "TTGDTX_SIGNED_UAT_EXECUTION_ROUTING_HUB_20260628.md",
  "components/ttgdtx/ttgdtx-signed-uat-execution-routing-hub.tsx",
  "SIGNED_UAT_READY / NO_GO / BLOCKED",
  "UAT-ROUTE-01 through UAT-ROUTE-11",
  "audit:ttgdtx-signed-uat-execution-routing-hub",
  "does not execute UAT, accept evidence, sign owner results, grant access, approve finance action, approve migration, approve owner GO/NO-GO or mark production GO",
]);

fastSection("2026-06-28 - TTGDTX Signed UAT Route Decision Lane", [
  "decisionValue",
  "SIGNED_UAT_EXECUTION_ROUTES",
  "lib/production-readiness.ts",
  "components/ttgdtx/ttgdtx-signed-uat-execution-routing-hub.tsx",
  "TTGDTX_SIGNED_UAT_EXECUTION_ROUTING_HUB_20260628.md",
  "SIGNED_UAT_READY / NO_GO / BLOCKED",
  "Decision lane",
  "audit:ttgdtx-signed-uat-execution-routing-hub",
  "does not execute UAT",
  "mark production GO",
]);

fastSection("2026-06-28 - TTGDTX UAT Route Decision Lane Per-Route Audit", [
  "audit-ttgdtx-uat-readiness.mjs",
  "audit-ttgdtx-signed-uat-execution-routing-hub.mjs",
  "TTGDTX_UAT_EXECUTION_LOG_20260625.md",
  "UAT-ROUTE-01",
  "UAT-ROUTE-11",
  "SIGNED_UAT_READY / NO_GO / BLOCKED",
  "audit hardening only",
  "mark production GO",
]);

fastSection("2026-06-28 - TTGDTX UAT Operator Handoff Routing Alignment", [
  "TTGDTX_UAT_OPERATOR_HANDOFF_20260627.md",
  "TTGDTX_SIGNED_UAT_EXECUTION_ROUTING_HUB_20260628.md",
  "UAT-HANDOFF-03/UAT-HANDOFF-04",
  "UAT-ROUTE-01",
  "UAT-ROUTE-11",
  "audit:ttgdtx-uat-readiness",
  "audit:ttgdtx-signed-uat-execution-routing-hub",
  "does not execute UAT",
  "mark production GO",
]);

fastSection("2026-06-28 - TTGDTX Signed UAT Route Result Tracker", [
  "TTGDTX_UAT_EXECUTION_LOG_20260625.md",
  "Signed UAT Route Result Tracker",
  "decision lane",
  "SIGNED_UAT_READY / NO_GO / BLOCKED",
  "UAT-ROUTE-01",
  "UAT-ROUTE-11",
  "BLOCKED_PENDING_SIGNED_UAT_ROUTE_EVIDENCE",
  "PENDING",
  "TTGDTX_UAT_OPERATOR_HANDOFF_20260627.md",
  "TTGDTX_SIGNED_UAT_EXECUTION_ROUTING_HUB_20260628.md",
  "does not execute UAT",
  "mark production GO",
]);

fastSection("2026-06-28 - Vietnamese Business Label Encoding Assertion", [
  "TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
  "valid UTF-8",
  "audit-heu-vietnamese-text-encoding.mjs",
  "P2-10 tuition collection",
  "invoice/chung-tu",
  "BBNT/nghiem thu",
  "VND suffix",
  "does not approve UAT",
  "production GO",
]);

fastSection("2026-06-28 - TTGDTX P2-18/P5-03 UAT Launch Decision Stops", [
  "PRODUCTION_UAT_LAUNCH_STEPS",
  "decision values",
  "stop conditions",
  "P2-18 dashboard reliance",
  "P5-03 Finance Desk reliance",
  "ttgdtx-production-execution-queue.tsx",
  "production checklist",
  "current-state inventory",
  "does not execute browser UAT",
  "mark production GO",
]);

fastSection("2026-06-28 - TTGDTX P6-06/P2-17 Risk Closure Decision Stops", [
  "PRODUCTION_RISK_CLOSURE_STEPS",
  "decision values",
  "stop conditions",
  "P6-06 hard-delete/cascade",
  "P2-17 payout release readiness",
  "P6_06_CLOSURE_READY / NO_GO / BLOCKED",
  "P2_17_RELEASE_READY / NO_GO / BLOCKED",
  "ttgdtx-production-execution-queue.tsx",
  "does not convert database paths",
  "mark production GO",
]);

fastSection("2026-06-28 - TTGDTX P0-03/Step90-Step110 Infra Decision Stops", [
  "PRODUCTION_INFRA_READINESS_STEPS",
  "decision values",
  "stop conditions",
  "P0-03 backup/restore",
  "Step90-Step110 migration-order",
  "P0_03_RESTORE_READY / NO_GO / BLOCKED",
  "STEP90_110_MIGRATION_READY / NO_GO / BLOCKED",
  "ttgdtx-production-execution-queue.tsx",
  "does not execute backup",
  "mark production GO",
]);

fastSection("2026-06-28 - TTGDTX P0-19/P3 Gate-Handover Decision Stops", [
  "PRODUCTION_GATE_HANDOVER_STEPS",
  "decision values",
  "stop conditions",
  "P0-19 legal/finance",
  "P3-01/P3-02 lead lifecycle",
  "P0_19_GATE_READY",
  "P3_01_P3_02_HANDOVER_READY",
  "ttgdtx-production-execution-queue.tsx",
  "does not accept legal basis",
  "mark production",
]);

fastSection("2026-06-28 - TTGDTX P6-04/P6-03 Governance Decision Stops", [
  "PRODUCTION_GOVERNANCE_ASSURANCE_STEPS",
  "decision values",
  "stop conditions",
  "P6-04 role/workspace",
  "P6-03 audit-log traceability",
  "P6_04_SCOPE_READY",
  "P6_03_TRACE_READY",
  "ttgdtx-production-execution-queue.tsx",
  "does not execute role/workspace UAT",
  "mark production GO",
]);

fastSection("2026-06-28 - Short Course Attendance Payment Gap Pack", [
  "HEU_SHORT_COURSE_ATTENDANCE_PAYMENT_GAP_PACK_20260628_V01_DRAFT.md",
  "components/short-course/short-course-attendance-payment-gap-pack.tsx",
  "SC_ATTENDANCE_PAYMENT_READY / NO_GO / BLOCKED",
  "audit:heu-short-course-attendance-payment-gap-pack",
  "production GO",
]);

fastSection("2026-06-28 - HOU Ledger Handover Gap Pack", [
  "HEU_HOU_LEDGER_HANDOVER_GAP_PACK_20260628_V01_DRAFT.md",
  "components/hou/hou-ledger-handover-gap-pack.tsx",
  "HOU_LEDGER_READY / NO_GO / BLOCKED",
  "audit:heu-hou-ledger-handover-gap-pack",
  "production GO",
]);

fastSection("2026-06-28 - AI Prompt Output Audit Logging Design", [
  "HEU_AI_PROMPT_OUTPUT_AUDIT_LOGGING_DESIGN_20260628.md",
  "P7-04 PASS_LOCAL_DESIGN",
  "controlled evidence reference",
  "does not call an AI service",
]);

fastSection("2026-06-28 - Legal SOP Governance Control Matrix", [
  "HEU_LEGAL_SOP_GOVERNANCE_CONTROL_MATRIX_20260628_V01_DRAFT.md",
  "Legal Article Master",
  "SOP Register",
  "DRAFT_CONTROL",
]);

fastSection("2026-06-28 - Data Master Report View Compatibility Bridge", [
  "HEU_DATA_MASTER_REPORT_VIEW_COMPATIBILITY_20260628_V01_DRAFT.md",
  "components/reports/data-master-report-view-bridge-panel.tsx",
  "STUDENT_MASTER",
  "CLASS_MASTER",
  "COHORT_MASTER",
]);

fastSection("2026-06-28 - Module Readiness Gap Matrix", [
  "HEU_MODULE_READINESS_GAP_MATRIX_20260628_V01_DRAFT.md",
  "`DAT`",
  "`CAN_SUA`",
  "`CHUA_DU_DIEU_KIEN`",
  "`CAM_CODE`",
]);

fastSection("2026-06-28 - Report View Source Map Hardening", [
  "HEU_REPORT_VIEW_SOURCE_MAP_20260628_V01_DRAFT.md",
  "TTGDTX/Finance Desk",
  "HOU",
  "Short Course",
]);

fastSection("2026-06-28 - TTGDTX Governance UAT Execution Readiness", [
  "ttgdtx-uat-signoff-guard.tsx",
  "P6-04/P6-03 governance UAT execution",
  "P6-04 must run",
  "before P6-03",
]);

fastSection("2026-06-28 - P0-14 Controlled Evidence Intake Ledger", [
  "ttgdtx-production-evidence-binder.tsx",
  "P0_14_INTAKE_READY / NO_GO / BLOCKED",
  "controlled evidence intake ledger",
]);

fastRequire(
  backlog,
  [
    "P0-05",
    "Record every phase in `HEU_IMPLEMENTATION_LOG.md`",
    "audit:heu-implementation-log",
    "log before commit",
  ],
  "P0-05 implementation-log backlog guard",
  "docs/HEU_SYSTEM_BUILD_BACKLOG.md",
);

fastRequire(
  checklist,
  [
    "Implementation log discipline",
    "docs/HEU_IMPLEMENTATION_LOG.md",
    "audit:heu-implementation-log",
    "Keep P0-05 implementation log audit green",
  ],
  "production checklist implementation-log control",
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
);

fastRequire(
  inventory,
  [
    "npm.cmd run audit:heu-implementation-log",
    "npm.cmd run audit:ttgdtx-signed-uat-execution-routing-hub",
    "signed UAT execution routing hub",
    "P0-05 implementation log audit guard",
    "61 audit scripts passed",
  ],
  "current-state implementation-log audit evidence",
  "docs/HEU_CURRENT_STATE_INVENTORY.md",
);

if (fastFailures.length > 0) {
  console.error("HEU implementation-log audit failed.");
  for (const failure of fastFailures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(
  "HEU implementation-log audit passed. Safe build slices are logged with local-only boundaries.",
);
process.exit(0);

if (!packageJson.scripts?.["audit:heu-implementation-log"]) {
  fail("package.json: missing audit:heu-implementation-log script");
}

requireText(
  agents,
  /Before any final handoff[\s\S]*npm\.cmd run audit:heu-implementation-log/i,
  "implementation-log audit in final handoff checks",
  "AGENTS.md",
);

requireText(
  releaseGateAudit,
  /scripts\/audit-heu-implementation-log\.mjs[\s\S]*audit:heu-implementation-log/i,
  "release-gate coverage for implementation-log audit",
  "scripts/audit-ttgdtx-release-gates.mjs",
);

requireText(
  log,
  /## 2026-06-28 - TTGDTX Signed UAT Execution Routing Hub[\s\S]*TTGDTX_SIGNED_UAT_EXECUTION_ROUTING_HUB_20260628\.md[\s\S]*ttgdtx-signed-uat-execution-routing-hub\.tsx[\s\S]*SIGNED_UAT_READY \/ NO_GO \/ BLOCKED[\s\S]*UAT-ROUTE-01 through UAT-ROUTE-11[\s\S]*audit:ttgdtx-signed-uat-execution-routing-hub[\s\S]*does not execute UAT, accept evidence, sign owner results, grant access, approve finance action, approve migration, approve owner GO\/NO-GO or mark production GO/i,
  "TTGDTX signed UAT execution routing hub log boundary",
  "docs/HEU_IMPLEMENTATION_LOG.md",
);

requireText(
  log,
  /## 2026-06-28 - Short Course Attendance Payment Gap Pack[\s\S]*HEU_SHORT_COURSE_ATTENDANCE_PAYMENT_GAP_PACK_20260628_V01_DRAFT\.md[\s\S]*components\/short-course\/short-course-attendance-payment-gap-pack\.tsx[\s\S]*SC-AP-01 through\s+SC-AP-08[\s\S]*SC_ATTENDANCE_PAYMENT_READY \/ NO_GO \/ BLOCKED[\s\S]*audit:heu-short-course-attendance-payment-gap-pack[\s\S]*This is Short Course control packaging only[\s\S]*does not approve attendance\s+lock[\s\S]*BHXH decision[\s\S]*meal\/allowance payment[\s\S]*HR payment[\s\S]*invoice\/payment\s+verification[\s\S]*period close[\s\S]*statutory accounting[\s\S]*UAT acceptance[\s\S]*evidence\s+acceptance[\s\S]*owner GO[\s\S]*production GO/i,
  "Short Course attendance payment gap-pack log boundary",
  "docs/HEU_IMPLEMENTATION_LOG.md",
);

requireText(
  log,
  /## 2026-06-28 - HOU Ledger Handover Gap Pack[\s\S]*HEU_HOU_LEDGER_HANDOVER_GAP_PACK_20260628_V01_DRAFT\.md[\s\S]*components\/hou\/hou-ledger-handover-gap-pack\.tsx[\s\S]*HOU-LH-01 through HOU-LH-08[\s\S]*HOU_LEDGER_READY \/ NO_GO \/ BLOCKED[\s\S]*audit:heu-hou-ledger-handover-gap-pack[\s\S]*This is HOU control packaging only[\s\S]*does not approve HOU handover[\s\S]*tuition ledger posting[\s\S]*invoice issuance[\s\S]*COM payout[\s\S]*finance action[\s\S]*UAT\s+acceptance[\s\S]*evidence acceptance[\s\S]*owner GO[\s\S]*production GO/i,
  "HOU ledger handover gap-pack log boundary",
  "docs/HEU_IMPLEMENTATION_LOG.md",
);

requireText(
  log,
  /## 2026-06-28 - AI Prompt Output Audit Logging Design[\s\S]*HEU_AI_PROMPT_OUTPUT_AUDIT_LOGGING_DESIGN_20260628\.md[\s\S]*P7-04 PASS_LOCAL_DESIGN[\s\S]*actor,\s+role\/workspace scope, source-scope refs, redaction status, prompt\/output\s+hashes when available, forbidden-action flags, human decision status and\s+controlled evidence reference[\s\S]*This is AI audit-log design only[\s\S]*does not call an AI service, store live\s+prompts, read restricted data, write workflow state, approve finance action,\s+accept UAT, accept evidence, approve owner GO or mark production GO/i,
  "AI prompt/output audit logging design log boundary",
  "docs/HEU_IMPLEMENTATION_LOG.md",
);

requireText(
  log,
  /## 2026-06-28 - Legal SOP Governance Control Matrix[\s\S]*HEU_LEGAL_SOP_GOVERNANCE_CONTROL_MATRIX_20260628_V01_DRAFT\.md[\s\S]*Legal Article Master, SOP Register, evidence class, workflow gate,\s+report view reliance, finance reliance, AI scope and owner decision\s+boundaries[\s\S]*DRAFT_CONTROL[\s\S]*This is legal\/SOP\/governance control mapping only[\s\S]*does not issue legal\s+policy, approve an SOP, move Drive files, accept UAT, accept evidence,\s+approve finance action, waive owner decision or mark production GO/i,
  "Legal SOP Governance control matrix log boundary",
  "docs/HEU_IMPLEMENTATION_LOG.md",
);

requireText(
  log,
  /## 2026-06-28 - Data Master Report View Compatibility Bridge[\s\S]*HEU_DATA_MASTER_REPORT_VIEW_COMPATIBILITY_20260628_V01_DRAFT\.md[\s\S]*components\/reports\/data-master-report-view-bridge-panel\.tsx[\s\S]*STUDENT_MASTER[\s\S]*CLASS_MASTER[\s\S]*COHORT_MASTER[\s\S]*backlog, production checklist, current-state inventory, module\s+readiness matrix, P0 register audit and release-gate file coverage[\s\S]*This is Data Master \/ Report View compatibility packaging only[\s\S]*does not\s+create production SQL, merge source data, import real data, approve\s+report-view signoff, approve dashboard reliance, accept evidence, approve\s+migration, approve finance action or mark production GO/i,
  "Data Master Report View compatibility bridge log boundary",
  "docs/HEU_IMPLEMENTATION_LOG.md",
);

requireText(
  log,
  /## 2026-06-28 - Module Readiness Gap Matrix[\s\S]*HEU_MODULE_READINESS_GAP_MATRIX_20260628_V01_DRAFT\.md[\s\S]*classify HEU modules against the P0 register pack as `DAT`, `CAN_SUA`,\s+`CHUA_DU_DIEU_KIEN` or `CAM_CODE`[\s\S]*RC-08, RC-09 and RC-10 point to\s+the matrix for TTGDTX\/Finance, HOU and Short Course follow-up[\s\S]*This is review\/control routing only[\s\S]*does not execute UAT, approve\s+migration, approve finance action, accept evidence or mark production GO/i,
  "module readiness gap matrix log boundary",
  "docs/HEU_IMPLEMENTATION_LOG.md",
);

requireText(
  log,
  /## 2026-06-28 - Report View Source Map Hardening[\s\S]*HEU_REPORT_VIEW_SOURCE_MAP_20260628_V01_DRAFT\.md[\s\S]*logical report view to current controlled sources for TTGDTX\/Finance Desk,\s+HOU, Short Course, Audit and AI[\s\S]*SOURCE_MAP_DRAFT[\s\S]*KPI dictionary plus data-quality-check shells[\s\S]*This is read-only report governance[\s\S]*does not approve dashboard production\s+reliance, statutory accounting, finance action, UAT acceptance, evidence\s+acceptance or owner GO/i,
  "report-view source map hardening log boundary",
  "docs/HEU_IMPLEMENTATION_LOG.md",
);

requireText(
  log,
  /## 2026-06-28 - Report View Source Map Read-Only UI[\s\S]*components\/reports\/report-view-source-map-panel\.tsx[\s\S]*read-only P0-16 panel[\s\S]*Mounted the panel on `\/reports`[\s\S]*P0 register, current-state, implementation-log and release-gate\s+audits[\s\S]*This is read-only report governance UI only[\s\S]*does not approve dashboard\s+production reliance, statutory accounting, finance action, UAT acceptance,\s+evidence acceptance, owner GO or production GO/i,
  "report-view source map read-only UI log boundary",
  "docs/HEU_IMPLEMENTATION_LOG.md",
);

requireText(
  log,
  /## 2026-06-28 - Report View Data Quality Status Capture[\s\S]*components\/reports\/report-view-source-map-panel\.tsx[\s\S]*Data Quality Check capture status[\s\S]*owner action[\s\S]*evidence state[\s\S]*stop condition[\s\S]*actual\s+receipt\/reconciliation evidence[\s\S]*AI\s+read-only scope checks[\s\S]*This is read-only report governance UI only[\s\S]*does not approve dashboard\s+production reliance, statutory accounting, finance action, UAT acceptance,\s+evidence acceptance, owner GO or production GO/i,
  "report-view data-quality status capture log boundary",
  "docs/HEU_IMPLEMENTATION_LOG.md",
);

requireText(
  log,
  /## 2026-06-28 - Report View Owner Signoff Capture[\s\S]*components\/reports\/report-view-source-map-panel\.tsx[\s\S]*owner signoff capture queue[\s\S]*required owner groups[\s\S]*signoff state and blockers[\s\S]*current-state, P0 register and release-gate audits[\s\S]*This is read-only report governance UI only[\s\S]*does not collect signatures,\s+approve dashboard production reliance, statutory accounting, finance action,\s+UAT acceptance, evidence acceptance, owner GO or production GO/i,
  "report-view owner signoff capture log boundary",
  "docs/HEU_IMPLEMENTATION_LOG.md",
);

requireText(
  backlog,
  /P0-05[\s\S]*Record every phase in `HEU_IMPLEMENTATION_LOG\.md`[\s\S]*PASS_LOCAL[\s\S]*docs\/HEU_IMPLEMENTATION_LOG\.md[\s\S]*audit:heu-implementation-log[\s\S]*log before commit[\s\S]*does not approve production/i,
  "P0-05 implementation-log backlog guard",
  "docs/HEU_SYSTEM_BUILD_BACKLOG.md",
);

requireText(
  checklist,
  /Implementation log discipline[\s\S]*PASS_LOCAL[\s\S]*docs\/HEU_IMPLEMENTATION_LOG\.md[\s\S]*audit:heu-implementation-log[\s\S]*scope, checks and local-only boundary/i,
  "production checklist implementation-log row",
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
);

requireText(
  checklist,
  /P0 controls include implementation-log discipline[\s\S]*P0-14 production evidence binder[\s\S]*P0-15 final\s+handoff coverage[\s\S]*Production remains NO-GO until\s+controlled external evidence and required owner signatures exist/i,
  "P0 Go/No-Go controls include implementation-log and local-only boundary",
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
);

requireText(
  checklist,
  /highest priority blockers[\s\S]*Keep P0-05 implementation log audit green[\s\S]*safe build slice[\s\S]*scope, checks and local-only boundary[\s\S]*before commit/i,
  "priority blocker list includes P0-05 implementation-log guard",
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
);

requireText(
  inventory,
  /npm\.cmd run audit:heu-implementation-log[\s\S]*PASS[\s\S]*npm\.cmd run audit:heu-user-account-security[\s\S]*PASS[\s\S]*npm\.cmd run audit:heu-lead-lifecycle-handover-uat-pack[\s\S]*PASS[\s\S]*npm\.cmd run audit:heu-p0-register-pack[\s\S]*PASS[\s\S]*npm\.cmd run audit:ttgdtx-signed-uat-execution-routing-hub[\s\S]*PASS[\s\S]*Full `audit:\*` suite[\s\S]*signed UAT execution routing hub[\s\S]*P5-02 Master Control action queue and safe iteration loop[\s\S]*P5-03 Finance Desk read-only cockpit guard[\s\S]*HOU ledger\/handover gap pack[\s\S]*Short Course attendance\/payment gap pack[\s\S]*P3-01\/P3-02 UAT execution pack guard[\s\S]*P0-05 implementation log audit guard[\s\S]*P0 register pack[\s\S]*user account temporary password guard[\s\S]*61 audit scripts passed/i,
  "current-state implementation-log audit evidence",
  "docs/HEU_CURRENT_STATE_INVENTORY.md",
);

requireText(
  log,
  /## 2026-06-28 - Account-Control Guard Vietnamese Copy Polish[\s\S]*ttgdtx-account-control-scope-guard\.tsx[\s\S]*phong tỏa\/giải tỏa tài khoản and giải chấp separation\s+guidance uses clear Vietnamese with accents[\s\S]*Vietnamese titles, `Phạm vi` and `Ranh giới`[\s\S]*metadata-only, no-bank-operation and no-production-GO\s+boundaries[\s\S]*audit:ttgdtx-account-control-scope-decision[\s\S]*audit:ttgdtx-release-gates[\s\S]*accented Vietnamese copy and scope\s+boundary cannot silently regress[\s\S]*This is UI copy and audit alignment only[\s\S]*does not collect evidence,\s+execute UAT, create a bank workflow, approve account freeze\/release, approve\s+collateral release, approve finance action or mark production GO/i,
  "account-control guard Vietnamese copy polish log boundary",
  "docs/HEU_IMPLEMENTATION_LOG.md",
);

requireText(
  log,
  /## 2026-06-28 - TTGDTX Production Guard Vietnamese Copy Polish[\s\S]*ttgdtx-production-readiness-guard\.tsx[\s\S]*PASS_LOCAL, no-production-migration, no-real-data and safe\s+iteration guidance uses clear Vietnamese with accents[\s\S]*audit:ttgdtx-production-readiness-guard[\s\S]*audit:ttgdtx-release-gates[\s\S]*accented Vietnamese guidance and\s+PASS_LOCAL\/NO-GO boundary cannot silently regress[\s\S]*This is UI copy and audit alignment only[\s\S]*does not collect evidence,\s+execute UAT, approve migration, approve finance action, approve owner waiver\s+or mark production GO/i,
  "TTGDTX production guard Vietnamese copy polish log boundary",
  "docs/HEU_IMPLEMENTATION_LOG.md",
);

requireText(
  log,
  /## 2026-06-28 - P0-13 TTGDTX Guard Shared Blocker Coverage[\s\S]*audit:heu-production-blocker-source[\s\S]*TTGDTX landing guard,\s+Master Control blocker summary and TTGDTX production execution queue must all\s+render from `lib\/production-readiness\.ts`[\s\S]*P0-13 backlog row, production checklist and current-state\s+inventory[\s\S]*shared blocker source explicitly covers the TTGDTX landing\s+guard[\s\S]*current-state and release-gate audits[\s\S]*cannot silently drift\s+back to only Master Control plus execution queue coverage[\s\S]*This is shared-source coverage alignment only[\s\S]*does not collect evidence,\s+execute UAT, approve migration, approve finance action, approve owner waiver\s+or mark production GO/i,
  "P0-13 TTGDTX guard shared blocker coverage log boundary",
  "docs/HEU_IMPLEMENTATION_LOG.md",
);

requireText(
  log,
  /## 2026-06-28 - TTGDTX Production Guard Shared Blocker Source[\s\S]*ttgdtx-production-readiness-guard\.tsx[\s\S]*renders `PRODUCTION_BLOCKERS` from\s+`lib\/production-readiness\.ts` instead of maintaining a shorter local blocker\s+list[\s\S]*backlog, production checklist and current-state inventory[\s\S]*TTGDTX guard, Master Control blocker summary and production execution queue\s+remain tied to the same shared blocker source[\s\S]*audit:ttgdtx-production-readiness-guard[\s\S]*local\s+`readinessBlockers` array cannot silently reappear[\s\S]*This is UI\/source alignment only[\s\S]*does not collect evidence, execute UAT,\s+approve migration, approve finance action, approve owner waiver or mark\s+production GO/i,
  "TTGDTX production guard shared blocker source log boundary",
  "docs/HEU_IMPLEMENTATION_LOG.md",
);

requireText(
  log,
  /## 2026-06-28 - P0-15 Final Handoff Owner Decision Manifest Alignment[\s\S]*AGENTS\.md[\s\S]*lib\/production-readiness\.ts[\s\S]*HEU_SYSTEM_BUILD_BACKLOG\.md[\s\S]*TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST\.md[\s\S]*HEU_CURRENT_STATE_INVENTORY\.md[\s\S]*P0-15 final handoff summaries must\s+include the P0-09 final owner decision manifest alongside the P0-09\s+sign-off\/UAT handoff evidence path[\s\S]*final-handoff, production-blocker-source, production-evidence,\s+current-state, implementation-log and release-gate audits[\s\S]*This is final-handoff packaging only[\s\S]*does not collect evidence, accept\s+evidence, execute UAT, approve migration, approve finance action, approve\s+owner waiver or mark production GO/i,
  "P0-15 final handoff owner decision manifest alignment log boundary",
  "docs/HEU_IMPLEMENTATION_LOG.md",
);

requireText(
  log,
  /## 2026-06-28 - P0-09 Final Owner Decision Manifest Shared Source Alignment[\s\S]*lib\/production-readiness\.ts[\s\S]*P0-09 and P0-14-09 shared source\s+wording requires the final owner decision manifest alongside the owner\s+sign-off pack, UAT operator handoff and redacted evidence references[\s\S]*production-blocker-source, production-evidence-binder,\s+implementation-log and release-gate audits[\s\S]*final owner decision cannot\s+drift back to a generic sign-off note[\s\S]*This is shared-source wording and guard alignment only[\s\S]*does not collect\s+evidence, accept evidence, execute UAT, approve migration, approve finance\s+action, approve owner waiver or mark production GO/i,
  "P0-09 final owner decision manifest shared source alignment log boundary",
  "docs/HEU_IMPLEMENTATION_LOG.md",
);

requireText(
  log,
  /## 2026-06-28 - P5-02 P0-14 Intake Ledger Action Queue Alignment[\s\S]*Master Control blocker summary and TTGDTX production execution\s+queue[\s\S]*P0-14 intake-ledger evidence\s+binder before P0-15 final handoff and owner GO\/NO-GO[\s\S]*BGH operating dashboard spec, backlog, production checklist and\s+current-state inventory[\s\S]*does not reduce\s+P0-14 to a generic evidence binder[\s\S]*BGH dashboard, current-state, implementation-log, production\s+readiness and release-gate audits[\s\S]*This is management-queue wording and guard alignment only[\s\S]*does not\s+collect evidence, accept evidence, execute UAT, approve migration, approve\s+finance action, approve owner waiver or mark production GO/i,
  "P5-02 P0-14 intake ledger action queue alignment log boundary",
  "docs/HEU_IMPLEMENTATION_LOG.md",
);

requireText(
  log,
  /## 2026-06-28 - P0-15 Final Handoff Evidence Intake Ledger Alignment[\s\S]*AGENTS\.md[\s\S]*P0-14 controlled evidence intake ledger, redaction reviewer and owner\s+signature state alongside P0-03\/P0-09\/P0-13\/P0-14 evidence paths[\s\S]*lib\/production-readiness\.ts[\s\S]*HEU_SYSTEM_BUILD_BACKLOG\.md[\s\S]*TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST\.md[\s\S]*HEU_CURRENT_STATE_INVENTORY\.md[\s\S]*cannot treat the P0-14\s+evidence binder as complete without intake-ledger proof[\s\S]*final-handoff, current-state, implementation-log and release-gate\s+audits[\s\S]*This is final-handoff packaging only[\s\S]*does not collect evidence, accept\s+evidence, execute UAT, approve migration, approve finance action, approve\s+owner waiver or mark production GO/i,
  "P0-15 final handoff evidence intake ledger alignment log boundary",
  "docs/HEU_IMPLEMENTATION_LOG.md",
);

requireText(
  log,
  /## 2026-06-28 - P0-14 Controlled Evidence Intake Ledger[\s\S]*ttgdtx-production-evidence-binder\.tsx[\s\S]*non-secret evidence ID, controlled folder reference,\s+evidence class, redaction reviewer, owner signature state and blocker\s+decision before P0-14 closure[\s\S]*HEU_CONTROLLED_EVIDENCE_REDACTION_PACK_20260627\.md[\s\S]*P0_14_INTAKE_READY \/ NO_GO \/ BLOCKED[\s\S]*P0-10 redaction review hands off safely into P0-14[\s\S]*HEU_SYSTEM_BUILD_BACKLOG\.md[\s\S]*TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST\.md[\s\S]*HEU_CURRENT_STATE_INVENTORY\.md[\s\S]*production-evidence, controlled-evidence, current-state,\s+implementation-log and release-gate audits[\s\S]*This is evidence-intake packaging only[\s\S]*does not collect raw evidence,\s+accept evidence, approve UAT, approve migration, approve finance action,\s+approve owner waiver or mark production GO/i,
  "P0-14 controlled evidence intake ledger log boundary",
  "docs/HEU_IMPLEMENTATION_LOG.md",
);

requireText(
  log,
  /## 2026-06-28 - Step90-Step110 Migration Evidence Acceptance Lock[\s\S]*STEP90_STEP110_MIGRATION_ORDER_SIGNOFF_GUARD_20260627\.md[\s\S]*MIG-LOCK-01 through\s+MIG-LOCK-06[\s\S]*P0-03 target identity lock, backup\/restore proof,\s+preflight\/postflight checks, restore smoke-check, rollback\/exception decision\s+and required owner evidence acceptance[\s\S]*lib\/production-readiness\.ts[\s\S]*target identity lock and\s+MIGRATION_EVIDENCE_ACCEPTED before migration-order signature[\s\S]*HEU_SYSTEM_BUILD_BACKLOG\.md[\s\S]*TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST\.md[\s\S]*HEU_CURRENT_STATE_INVENTORY\.md[\s\S]*migration-order, production-blocker-source, current-state,\s+implementation-log and release-gate audits[\s\S]*This is migration-order packaging only[\s\S]*does not execute backup, restore,\s+production migration, rollback, UAT acceptance, evidence acceptance, owner\s+waiver, finance action or production GO/i,
  "Step90-Step110 migration evidence acceptance lock log boundary",
  "docs/HEU_IMPLEMENTATION_LOG.md",
);

requireText(
  log,
  /## 2026-06-28 - P0-03 Backup\/Restore Target Identity Lock[\s\S]*supabase-backup-restore-guard\.tsx[\s\S]*execution authority, production source-only status, isolated restore\s+target, app banner, SQL editor\/CLI profile and controlled evidence folder[\s\S]*STEP90_STEP110_BACKUP_RESTORE_OPERATOR_RUN_SHEET_20260627\.md[\s\S]*STEP90_STEP110_BACKUP_RESTORE_DRY_RUN_EVIDENCE_PACK_20260627\.md[\s\S]*P0-03-TARGET-01 through P0-03-TARGET-06[\s\S]*TARGET_LOCK_READY \/ STOP \/\s+BLOCKED[\s\S]*backlog, production checklist and current-state inventory[\s\S]*backup\/restore, current-state, implementation-log and release-gate\s+audits[\s\S]*This is target-lock packaging only[\s\S]*does not execute backup, restore,\s+migration dry-run, rollback, UAT acceptance, evidence acceptance, finance\s+action, owner waiver or production GO/i,
  "P0-03 backup/restore target identity lock log boundary",
  "docs/HEU_IMPLEMENTATION_LOG.md",
);

requireText(
  log,
  /## 2026-06-28 - TTGDTX Governance UAT Execution Readiness[\s\S]*ttgdtx-uat-signoff-guard\.tsx[\s\S]*P6-04\/P6-03 governance UAT execution\s+readiness section before the UAT run closure tracker[\s\S]*PRODUCTION_GOVERNANCE_ASSURANCE_STEPS[\s\S]*route,\s+runbook, owner, local guard command and stop conditions[\s\S]*P6-04\s+role\/workspace UAT[\s\S]*P6-03 audit-log traceability UAT[\s\S]*TTGDTX_UAT_EXECUTION_LOG_20260625\.md[\s\S]*BLOCKED_PENDING_SIGNED_GOVERNANCE_UAT[\s\S]*P6-04 must run\s+before P6-03[\s\S]*synthetic accounts, controlled evidence,\s+redaction and owner signatures outside Git\/Codex\/chat[\s\S]*HEU_SYSTEM_BUILD_BACKLOG\.md[\s\S]*TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST\.md[\s\S]*HEU_CURRENT_STATE_INVENTORY\.md[\s\S]*UAT readiness, production readiness, current-state, implementation\s+log and release-gate audits[\s\S]*This is UAT execution-readiness packaging only[\s\S]*does not execute UAT,\s+create synthetic accounts, grant access, collect evidence, accept audit\s+traceability, approve finance action, waive evidence or mark production GO/i,
  "TTGDTX governance UAT execution readiness log boundary",
  "docs/HEU_IMPLEMENTATION_LOG.md",
);

requireText(
  log,
  /## 2026-06-28 - TTGDTX P0-14 Governance Evidence Checkpoint[\s\S]*ttgdtx-production-evidence-binder\.tsx[\s\S]*P0-14 governance evidence checkpoint[\s\S]*P6-04 role\/workspace proof[\s\S]*P6-03\s+audit trace proof[\s\S]*PRODUCTION_GOVERNANCE_ASSURANCE_STEPS[\s\S]*PRODUCTION_EVIDENCE_REQUIREMENTS[\s\S]*HEU_SYSTEM_BUILD_BACKLOG\.md[\s\S]*TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST\.md[\s\S]*HEU_CURRENT_STATE_INVENTORY\.md[\s\S]*production evidence binder and release-gate audits[\s\S]*This is evidence-checkpoint packaging only[\s\S]*does not collect evidence,\s+execute UAT, grant access, accept audit traceability, approve owner review,\s+waive evidence or mark production GO/i,
  "TTGDTX P0-14 governance evidence checkpoint log boundary",
  "docs/HEU_IMPLEMENTATION_LOG.md",
);

requireText(
  log,
  /## 2026-06-28 - TTGDTX P6-04 P6-03 Governance Assurance Plan[\s\S]*PRODUCTION_GOVERNANCE_ASSURANCE_STEPS[\s\S]*P6-04 role\/workspace scope UAT[\s\S]*P6-03\s+audit-log traceability UAT[\s\S]*ttgdtx-production-execution-queue\.tsx[\s\S]*route, runbook, owner, evidence and local guard command before\s+dashboard\/Finance Desk UAT and risk-closure tracks[\s\S]*HEU_SYSTEM_BUILD_BACKLOG\.md[\s\S]*TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST\.md[\s\S]*HEU_CURRENT_STATE_INVENTORY\.md[\s\S]*production readiness, production blocker source, current-state and\s+release-gate audits[\s\S]*This is governance-assurance launch packaging only[\s\S]*does not execute UAT,\s+grant access, accept audit traceability,\s+approve finance action, accept\s+evidence, waive owner sign-off or mark production GO/i,
  "TTGDTX P6-04/P6-03 governance assurance plan log boundary",
  "docs/HEU_IMPLEMENTATION_LOG.md",
);

requireText(
  log,
  /## 2026-06-28 - TTGDTX P0-19 P3 Gate Handover Readiness Plan[\s\S]*PRODUCTION_GATE_HANDOVER_STEPS[\s\S]*P0-19 legal\/finance gate UAT[\s\S]*P3-01\/P3-02 lead lifecycle\/handover UAT[\s\S]*ttgdtx-production-execution-queue\.tsx[\s\S]*route, runbook, owner, evidence and local guard command before\s+dashboard\/Finance Desk UAT and risk-closure tracks[\s\S]*HEU_SYSTEM_BUILD_BACKLOG\.md[\s\S]*TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST\.md[\s\S]*HEU_CURRENT_STATE_INVENTORY\.md[\s\S]*production readiness, production blocker source, current-state and\s+release-gate audits[\s\S]*This is gate-handover launch packaging only[\s\S]*does not execute UAT, accept\s+handover, create receivable, approve finance action, accept evidence, waive\s+owner sign-off or mark production GO/i,
  "TTGDTX P0-19/P3 gate-handover readiness plan log boundary",
  "docs/HEU_IMPLEMENTATION_LOG.md",
);

requireText(
  log,
  /## 2026-06-28 - TTGDTX P0-03 Step90-Step110 Infra Readiness Plan[\s\S]*PRODUCTION_INFRA_READINESS_STEPS[\s\S]*P0-03 backup\/restore dry-run evidence[\s\S]*Step90-Step110 signed production migration order[\s\S]*ttgdtx-production-execution-queue\.tsx[\s\S]*route, runbook, owner, evidence and local guard command before UAT launch\s+and risk-closure tracks[\s\S]*HEU_SYSTEM_BUILD_BACKLOG\.md[\s\S]*TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST\.md[\s\S]*HEU_CURRENT_STATE_INVENTORY\.md[\s\S]*production readiness, production blocker source, current-state and\s+release-gate audits[\s\S]*This is infra-readiness launch packaging only[\s\S]*does not execute backup,\s+restore, production migration, migration-order approval, evidence acceptance,\s+finance action, UAT acceptance or production GO/i,
  "TTGDTX P0-03/Step90-Step110 infra readiness plan log boundary",
  "docs/HEU_IMPLEMENTATION_LOG.md",
);

requireText(
  log,
  /## 2026-06-28 - TTGDTX P6-06 P2-17 Risk Closure Plan[\s\S]*PRODUCTION_RISK_CLOSURE_STEPS[\s\S]*P6-06 hard-delete\/cascade conversion-or-waiver[\s\S]*P2-17 payout duplicate\/dossier UAT[\s\S]*ttgdtx-production-execution-queue\.tsx[\s\S]*route,\s+runbook, owner, evidence and local guard command[\s\S]*HEU_SYSTEM_BUILD_BACKLOG\.md[\s\S]*TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST\.md[\s\S]*HEU_CURRENT_STATE_INVENTORY\.md[\s\S]*production readiness, production blocker source, current-state and\s+release-gate audits[\s\S]*This is risk-closure launch packaging only[\s\S]*does not execute payout UAT,\s+convert cascade rules, approve waiver, collect evidence, approve finance\s+action, accept evidence or mark production GO/i,
  "TTGDTX P6-06/P2-17 risk closure plan log boundary",
  "docs/HEU_IMPLEMENTATION_LOG.md",
);

requireText(
  log,
  /## 2026-06-28 - TTGDTX P2-18 P5-03 UAT Launch Plan[\s\S]*PRODUCTION_UAT_LAUNCH_STEPS[\s\S]*P2-18 accounting dashboard[\s\S]*P5-03\s+Finance Desk[\s\S]*ttgdtx-production-execution-queue\.tsx[\s\S]*route, runbook,\s+owner, evidence and local guard command[\s\S]*HEU_SYSTEM_BUILD_BACKLOG\.md[\s\S]*TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST\.md[\s\S]*HEU_CURRENT_STATE_INVENTORY\.md[\s\S]*production readiness, production blocker source, current-state and\s+release-gate audits[\s\S]*This is UAT launch packaging only[\s\S]*does not execute browser UAT, collect\s+evidence, accept dashboard reliance, approve finance action, approve\s+production migration or mark production GO/i,
  "TTGDTX P2-18/P5-03 UAT launch plan log boundary",
  "docs/HEU_IMPLEMENTATION_LOG.md",
);

requireText(
  log,
  /## 2026-06-28 - Finance Desk UAT Evidence Checklist[\s\S]*finance-desk-uat-evidence-checklist\.tsx[\s\S]*\/finance-desk[\s\S]*P5-03\s+browser UAT cases[\s\S]*acceptance criteria[\s\S]*no-secret evidence rules[\s\S]*HEU_FINANCE_DESK_UAT_RUNBOOK_20260627\.md[\s\S]*HEU_SYSTEM_BUILD_BACKLOG\.md[\s\S]*TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST\.md[\s\S]*HEU_CURRENT_STATE_INVENTORY\.md[\s\S]*audit-heu-finance-desk\.mjs[\s\S]*release-gate audits[\s\S]*This is UAT packaging only[\s\S]*does not execute UAT, collect evidence,\s+approve finance action, approve dashboard reliance, run production migration\s+or mark production GO/i,
  "Finance Desk UAT evidence checklist log boundary",
  "docs/HEU_IMPLEMENTATION_LOG.md",
);

requireText(
  log,
  /(?=[\s\S]*## 2026-06-28 - Current State User Account Security Alignment)(?=[\s\S]*HEU_CURRENT_STATE_INVENTORY\.md)(?=[\s\S]*HEU_SYSTEM_BUILD_BACKLOG\.md)(?=[\s\S]*M02\/role-workspace scope)(?=[\s\S]*user account temporary password guard)(?=[\s\S]*58-audit-script count)(?=[\s\S]*audit-heu-current-state-inventory\.mjs)(?=[\s\S]*audit-heu-implementation-log\.mjs)(?=[\s\S]*release-gate audits)(?=[\s\S]*current-state\/backlog alignment only)(?=[\s\S]*does not create accounts)(?=[\s\S]*send passwords)(?=[\s\S]*approve role scope)(?=[\s\S]*mark production GO)/i,
  "current-state user-account security alignment log boundary",
  "docs/HEU_IMPLEMENTATION_LOG.md",
);

requireText(
  log,
  /## 2026-06-28 - P2-10 Quick Finder Invoice Prompt[\s\S]*ttgdtx-process-quick-finder\.tsx[\s\S]*placeholder includes `xuat hoa don`[\s\S]*invoice\/chung-tu questions toward Thu hoc phi \(P2-10\)[\s\S]*audit-ttgdtx-process-labels\.mjs[\s\S]*release-gate audits[\s\S]*This is navigation\/discovery packaging only[\s\S]*does not approve invoice\s+issuance, legal\/tax interpretation, finance posting, UAT acceptance, owner\s+waiver or production GO/i,
  "P2-10 quick finder invoice prompt log boundary",
  "docs/HEU_IMPLEMENTATION_LOG.md",
);

requireText(
  log,
  /## 2026-06-28 - P2-10 Natural Invoice Search Fallback[\s\S]*ttgdtx-process-labels\.ts[\s\S]*thu tien co hoa don khong[\s\S]*thu tien co xuat hoa don khong[\s\S]*xuat hoa\s+don[\s\S]*co can hoa don[\s\S]*app\/search\/page\.tsx[\s\S]*merges local TTGDTX process-label\s+matches before remote search results[\s\S]*Thu hoc phi \(P2-10\)[\s\S]*invoice\/chung-tu questions[\s\S]*TTGDTX_PROCESS_CODE_MAP_20260625\.md[\s\S]*audit-ttgdtx-process-labels\.mjs[\s\S]*release-gate audits[\s\S]*This is navigation\/discovery packaging only[\s\S]*does not approve invoice\s+issuance, legal\/tax interpretation, finance posting, UAT acceptance, owner\s+waiver or production GO/i,
  "P2-10 natural invoice search fallback log boundary",
  "docs/HEU_IMPLEMENTATION_LOG.md",
);

requireText(
  log,
  /## 2026-06-28 - Current State P6-06 Conversion Or Written Waiver Wording[\s\S]*HEU_CURRENT_STATE_INVENTORY\.md[\s\S]*P6-06 priority action[\s\S]*hard-delete\/cascade findings need conversion or a\s+written waiver[\s\S]*not a generic waiver[\s\S]*audit-heu-current-state-inventory\.mjs[\s\S]*P6-06 blocker summary loses the conversion-or-written\s+waiver requirement[\s\S]*This is current-state wording alignment only[\s\S]*does not approve production\s+deletion, cascade execution, waiver, conversion migration, data cleanup,\s+evidence acceptance, owner GO\/NO-GO or production GO/i,
  "current-state P6-06 conversion-or-written-waiver wording log boundary",
  "docs/HEU_IMPLEMENTATION_LOG.md",
);

requireText(
  log,
  /## 2026-06-28 - P0-13 Shared Source P0-03 P3 Gate Proof[\s\S]*HEU_SYSTEM_BUILD_BACKLOG\.md[\s\S]*TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST\.md[\s\S]*P0-13 shared blocker\s+source coverage[\s\S]*P0-03 restore smoke-check proof for P0-19\/P3 gate\s+preservation[\s\S]*operator run sheet and owner sign-off\/UAT handoff\s+path[\s\S]*audit-heu-production-blocker-source\.mjs[\s\S]*backlog,\s+checklist, current-state and shared P0-15 source checks fail[\s\S]*This is P0-13 source-alignment packaging only[\s\S]*does not execute backup,\s+restore, migration dry-run, UAT, evidence acceptance, finance action, owner\s+waiver or production GO/i,
  "P0-13 shared source P0-03/P3 gate proof log boundary",
  "docs/HEU_IMPLEMENTATION_LOG.md",
);

requireText(
  log,
  /## 2026-06-28 - P0-15 Final Handoff P0-03 P3 Gate Proof[\s\S]*AGENTS\.md[\s\S]*lib\/production-readiness\.ts[\s\S]*HEU_SYSTEM_BUILD_BACKLOG\.md[\s\S]*TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST\.md[\s\S]*HEU_CURRENT_STATE_INVENTORY\.md[\s\S]*P0-03\s+restore smoke-check proof for P0-19\/P3 gate preservation[\s\S]*final-handoff, current-state and release-gate audits[\s\S]*This is final-handoff packaging only[\s\S]*does not execute backup, restore,\s+migration dry-run, UAT, evidence acceptance, finance action, owner waiver or\s+production GO/i,
  "P0-15 final handoff P0-03/P3 gate proof log boundary",
  "docs/HEU_IMPLEMENTATION_LOG.md",
);

requireText(
  log,
  /## 2026-06-28 - P0-14 Evidence Binder P0-03 P3 Gate Proof[\s\S]*lib\/production-readiness\.ts[\s\S]*P0-14-01 backup\/restore evidence[\s\S]*restore smoke-check proof that P0-19 and P3-01\/P3-02 gate\s+preservation survived the restore dry-run[\s\S]*HEU_SYSTEM_BUILD_BACKLOG\.md[\s\S]*TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST\.md[\s\S]*HEU_CURRENT_STATE_INVENTORY\.md[\s\S]*P0-03 restore smoke-check proof for P0-19\/P3 gate preservation[\s\S]*production-evidence, current-state and release-gate audits[\s\S]*This is evidence-binder packaging only[\s\S]*does not execute backup, restore,\s+migration dry-run, UAT, evidence acceptance, finance action, owner waiver or\s+production GO/i,
  "P0-14 evidence binder P0-03/P3 gate proof log boundary",
  "docs/HEU_IMPLEMENTATION_LOG.md",
);

requireText(
  log,
  /## 2026-06-28 - P0-03 Restore Smoke-Check P0-19 P3 Gate Coverage[\s\S]*STEP90_STEP110_BACKUP_RESTORE_DRY_RUN_EVIDENCE_PACK_20260627\.md[\s\S]*P0-19 legal\/finance gate UAT[\s\S]*P3-01\/P3-02 lifecycle\/handover UAT[\s\S]*supabase-backup-restore-guard\.tsx[\s\S]*P0-03-SMOKE-07[\s\S]*lead handover cannot create finance facts or bypass\s+P0-19\/P2-05\/P2-03 after restore[\s\S]*backlog, production checklist, backup\/restore audit and release-gate\s+audit[\s\S]*This is restore-smoke-check packaging only[\s\S]*does not execute backup,\s+restore, migration dry-run, UAT, evidence acceptance, finance action,\s+owner waiver or production GO/i,
  "P0-03 restore smoke-check P0-19/P3 gate coverage log boundary",
  "docs/HEU_IMPLEMENTATION_LOG.md",
);

requireText(
  log,
  /## 2026-06-28 - Current State P0-09 P3 Evidence Alignment[\s\S]*HEU_CURRENT_STATE_INVENTORY\.md[\s\S]*Stage D\/NO-GO snapshot[\s\S]*P0-09 owner sign-off\/UAT handoff evidence path includes\s+the P3-01\/P3-02 lifecycle and handover UAT requirement[\s\S]*current-state audit[\s\S]*missing P3 UAT evidence in the owner\s+signoff path, controlled evidence path, final handoff path or production\s+NO-GO blocker list fails locally[\s\S]*This is current-state inventory alignment only[\s\S]*does not execute UAT,\s+attach real evidence, approve migration, approve finance action, accept\s+handover, waive owner sign-off or mark production GO/i,
  "current-state P0-09 P3 evidence alignment log boundary",
  "docs/HEU_IMPLEMENTATION_LOG.md",
);

requireText(
  log,
  /## 2026-06-28 - P0-09 Owner Signoff P3 UAT Alignment[\s\S]*TTGDTX_PRODUCTION_OWNER_SIGNOFF_PACK_20260627\.md[\s\S]*HEU_LEAD_LIFECYCLE_HANDOVER_UAT_RUNBOOK_20260628\.md[\s\S]*ttgdtx-owner-go-no-go-evidence-checklist\.tsx[\s\S]*TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST\.md[\s\S]*HEU_SYSTEM_BUILD_BACKLOG\.md[\s\S]*P0-19, P2-17, P2-18 and P6-06 evidence[\s\S]*missing P3 UAT, unsigned\s+P3 handover or any P3 bypass of P0-19\/P2-05\/P2-03 finance gates keeps\s+production NO-GO[\s\S]*This is owner-signoff P3 UAT alignment only[\s\S]*does not execute UAT, accept\s+handover, create receivable, approve finance action, accept evidence, waive\s+owner sign-off or mark production GO/i,
  "P0-09 owner signoff P3 UAT alignment log boundary",
  "docs/HEU_IMPLEMENTATION_LOG.md",
);

requireText(
  log,
  /## 2026-06-28 - P3-01 P3-02 Lead Lifecycle Handover UAT Pack[\s\S]*HEU_LEAD_LIFECYCLE_HANDOVER_UAT_RUNBOOK_20260628\.md[\s\S]*lead-lifecycle-guard\.tsx[\s\S]*P3-UAT-01 through\s+P3-UAT-08[\s\S]*audit:heu-lead-lifecycle-handover-uat-pack[\s\S]*This is P3 UAT packaging only[\s\S]*does not execute UAT, accept handover,\s+create receivable, approve finance action, accept evidence, waive owner\s+sign-off or mark production GO/i,
  "P3 lead lifecycle/handover UAT pack log boundary",
  "docs/HEU_IMPLEMENTATION_LOG.md",
);

for (const heading of [
  "P0-14 Evidence Binder Proof Alignment",
  "P0-15 Final Handoff Summary Guard",
  "P5-02 Execution Queue Evidence Closure Alignment",
  "P0-05 Implementation Log Audit Guard",
  "Production Priority Blocker List Alignment",
  "P0 Go No-Go Control Paragraph Alignment",
  "Current State Inventory P0 Control Alignment",
  "VND Audit Output Vietnamese Clarity",
  "Finance Desk Read-Only Guard Packaging",
  "Finance Desk UAT Runbook Packaging",
  "Finance Desk Process Finder Link",
  "P0 Register Pack Foundation",
  "Finance Desk No-Data Boundary Guard",
  "Finance Desk Vietnamese Copy Clarity",
]) {
  requireText(
    log,
    new RegExp(`## 2026-06-27 - ${heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`),
    `log heading ${heading}`,
    "docs/HEU_IMPLEMENTATION_LOG.md",
  );
}

requireText(
  log,
  /## 2026-06-28 - P0-15 Final Handoff P6-06 Register Reference[\s\S]*AGENTS\.md[\s\S]*HEU_NON_TTGDTX_CASCADE_FINDING_REGISTER_20260628\.md[\s\S]*P6-06 hard-delete\/cascade proof paths[\s\S]*HEU_SYSTEM_BUILD_BACKLOG\.md[\s\S]*TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST\.md[\s\S]*HEU_CURRENT_STATE_INVENTORY\.md[\s\S]*P0-15 final handoff coverage[\s\S]*final-handoff, current-state, implementation-log and release-gate\s+audits[\s\S]*This is final-handoff packaging only[\s\S]*does not approve production\s+deletion, cascade execution, waiver, conversion migration, evidence\s+acceptance, owner GO\/NO-GO or production GO/i,
  "P0-15 final handoff P6-06 register reference log boundary",
  "docs/HEU_IMPLEMENTATION_LOG.md",
);

requireText(
  log,
  /## 2026-06-28 - P0-09 Owner Signoff P6-06 Register Alignment[\s\S]*TTGDTX_PRODUCTION_OWNER_SIGNOFF_PACK_20260627\.md[\s\S]*HEU_NON_TTGDTX_CASCADE_FINDING_REGISTER_20260628\.md[\s\S]*P6-06-FIND-001\s+through P6-06-FIND-044[\s\S]*ttgdtx-owner-go-no-go-evidence-checklist\.tsx[\s\S]*TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST\.md[\s\S]*HEU_SYSTEM_BUILD_BACKLOG\.md[\s\S]*owner-signoff, implementation-log and release-gate audits[\s\S]*This is owner-signoff evidence alignment only[\s\S]*does not approve production\s+deletion, cascade execution, waiver, conversion migration, UAT acceptance,\s+owner GO\/NO-GO or production GO/i,
  "P0-09 owner signoff P6-06 register alignment log boundary",
  "docs/HEU_IMPLEMENTATION_LOG.md",
);

requireText(
  log,
  /## 2026-06-28 - P6-06 Cascade Finding Register[\s\S]*HEU_NON_TTGDTX_CASCADE_FINDING_REGISTER_20260628\.md[\s\S]*P6-06-FIND-001 through P6-06-FIND-044[\s\S]*current SQL locations, child tables,\s+parent references, owner lanes and required dispositions[\s\S]*HEU_NON_TTGDTX_CASCADE_REVIEW_20260627\.md[\s\S]*TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST\.md[\s\S]*HEU_SYSTEM_BUILD_BACKLOG\.md[\s\S]*HEU_CURRENT_STATE_INVENTORY\.md[\s\S]*non-TTGDTX cascade, current-state, implementation-log and release\s+gate audits[\s\S]*This is finding-register packaging only[\s\S]*does not approve production\s+deletion, cascade execution, waiver, conversion migration, data cleanup,\s+rollback success or production GO/i,
  "P6-06 cascade finding register log boundary",
  "docs/HEU_IMPLEMENTATION_LOG.md",
);

requireText(
  log,
  /## 2026-06-28 - P5-03 Finance Desk Reliance Decision Manifest[\s\S]*\/finance-desk[\s\S]*KHTC,\s+BGH, IT_DATA and AUDIT[\s\S]*HEU_FINANCE_DESK_UAT_RUNBOOK_20260627\.md[\s\S]*TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST\.md[\s\S]*HEU_SYSTEM_BUILD_BACKLOG\.md[\s\S]*HEU_CURRENT_STATE_INVENTORY\.md[\s\S]*Finance Desk, current-state, implementation-log and release-gate\s+audits[\s\S]*This is cockpit-reliance packaging only[\s\S]*does not approve finance action,\s+statutory accounting, voucher posting, bank transfer, UAT acceptance,\s+dashboard production reliance, owner waiver or production GO/i,
  "P5-03 Finance Desk reliance decision manifest log boundary",
  "docs/HEU_IMPLEMENTATION_LOG.md",
);

requireText(
  log,
  /## 2026-06-28 - P3-02 Lead Handover Decision Manifest[\s\S]*lead-handover-panel\.tsx[\s\S]*HEU_LEAD_TO_STUDENT_HANDOVER_POLICY_20260627\.md[\s\S]*TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST\.md[\s\S]*HEU_SYSTEM_BUILD_BACKLOG\.md[\s\S]*HEU_CURRENT_STATE_INVENTORY\.md[\s\S]*handover, current-state, implementation-log and release-gate audits[\s\S]*This is handover-reliance packaging only[\s\S]*does not approve enrollment,\s+receivable creation, tuition collection, invoice issuance, revenue\s+recognition, finance posting, UAT acceptance, owner waiver or production GO/i,
  "P3-02 lead handover decision manifest log boundary",
  "docs/HEU_IMPLEMENTATION_LOG.md",
);

requireText(
  log,
  /P0-05 Implementation Log Audit Guard[\s\S]*audit:heu-implementation-log[\s\S]*P0-05 backlog[\s\S]*production checklist[\s\S]*current-state\s+inventory[\s\S]*This is governance-log alignment only[\s\S]*does not execute UAT, accept real\s+evidence, approve migration, approve finance action or mark production GO/i,
  "P0-05 log boundary",
  "docs/HEU_IMPLEMENTATION_LOG.md",
);

requireText(
  log,
  /Production Priority Blocker List Alignment[\s\S]*P0-14 evidence binder[\s\S]*P0-15 final handoff coverage[\s\S]*P0-05\s+implementation-log audit[\s\S]*audit:heu-production-evidence-binder[\s\S]*audit:heu-final-handoff-coverage[\s\S]*audit:heu-implementation-log[\s\S]*audit:ttgdtx-release-gates[\s\S]*This is checklist-priority alignment only[\s\S]*does not collect evidence,\s+execute UAT, approve migration, approve finance action or mark production GO/i,
  "priority blocker list alignment log boundary",
  "docs/HEU_IMPLEMENTATION_LOG.md",
);

requireText(
  log,
  /P0 Go No-Go Control Paragraph Alignment[\s\S]*P0 controls paragraph[\s\S]*implementation-log\s+discipline[\s\S]*P0-14 evidence binder[\s\S]*P0-15 final handoff coverage[\s\S]*Production remains NO-GO until controlled\s+external evidence and required owner signatures exist[\s\S]*audit:heu-production-evidence-binder[\s\S]*audit:heu-final-handoff-coverage[\s\S]*audit:heu-implementation-log[\s\S]*audit:ttgdtx-release-gates[\s\S]*This is P0 control wording alignment only[\s\S]*does not collect evidence,\s+execute UAT, approve migration, approve finance action or mark production GO/i,
  "P0 Go/No-Go control paragraph alignment log boundary",
  "docs/HEU_IMPLEMENTATION_LOG.md",
);

requireText(
  log,
  /Current State Inventory P0 Control Alignment[\s\S]*current-state inventory[\s\S]*P0\s+Go\/No-Go control paragraph alignment[\s\S]*audit:heu-current-state-inventory[\s\S]*audit:heu-implementation-log[\s\S]*audit:ttgdtx-release-gates[\s\S]*This is current-state inventory alignment only[\s\S]*does not collect evidence,\s+execute UAT, approve migration, approve finance action or mark production GO/i,
  "current-state inventory P0 control alignment log boundary",
  "docs/HEU_IMPLEMENTATION_LOG.md",
);

requireText(
  log,
  /VND Audit Output Vietnamese Clarity[\s\S]*xong\/xanh[\s\S]*1\.000\.000 đ[\s\S]*audit:vnd-money-format[\s\S]*This is audit-output clarity only[\s\S]*does not change finance calculation,\s+collect evidence, execute UAT, approve migration, approve finance action or\s+mark production GO/i,
  "VND audit output clarity log boundary",
  "docs/HEU_IMPLEMENTATION_LOG.md",
);

requireText(
  log,
  /Finance Desk Read-Only Guard Packaging[\s\S]*\/finance-desk[\s\S]*P5-03[\s\S]*lib\/vnd-money\.ts[\s\S]*audit:heu-finance-desk[\s\S]*authentication, permission\/workspace scope,\s+read-only data sources, safe internal links and no write actions[\s\S]*This is PASS_LOCAL packaging only[\s\S]*does not execute UAT, approve finance\s+action, run production migration, accept evidence or mark production GO/i,
  "Finance Desk read-only guard packaging log boundary",
  "docs/HEU_IMPLEMENTATION_LOG.md",
);

requireText(
  log,
  /Finance Desk UAT Runbook Packaging[\s\S]*HEU_FINANCE_DESK_UAT_RUNBOOK_20260627\.md[\s\S]*P5-03 browser UAT[\s\S]*contract-only denial[\s\S]*out-of-scope denial[\s\S]*read-only behavior[\s\S]*audit:heu-finance-desk[\s\S]*audit:ttgdtx-release-gates[\s\S]*This is UAT packaging only[\s\S]*does not execute UAT, collect evidence,\s+approve finance action, run production migration, accept evidence or mark\s+production GO/i,
  "Finance Desk UAT runbook packaging log boundary",
  "docs/HEU_IMPLEMENTATION_LOG.md",
);

requireText(
  log,
  /Finance Desk Process Finder Link[\s\S]*HEU Finance Desk \(P5-03\)[\s\S]*TTGDTX process-label map[\s\S]*\/finance-desk[\s\S]*process-label and release-gate audits[\s\S]*This is navigation\/discovery packaging only[\s\S]*does not grant production\s+access, execute UAT, approve finance action, run production migration, accept\s+evidence or mark production GO/i,
  "Finance Desk process finder log boundary",
  "docs/HEU_IMPLEMENTATION_LOG.md",
);

requireText(
  log,
  /Finance Desk No-Data Boundary Guard[\s\S]*FinanceDeskReadOnlyBoundary[\s\S]*no-access,\s+missing-view and loaded-data states[\s\S]*Step90-Step111[\s\S]*backed-up UAT environment[\s\S]*This is UI safety packaging only[\s\S]*does not run Step111, execute UAT,\s+approve migration, approve finance action, accept evidence or mark production\s+GO/i,
  "Finance Desk no-data boundary guard log boundary",
  "docs/HEU_IMPLEMENTATION_LOG.md",
);

requireText(
  log,
  /Finance Desk Vietnamese Copy Clarity[\s\S]*status badges, KPI cards,\s+missing-data state, source registry panel, control table and action links[\s\S]*audit:heu-finance-desk[\s\S]*audit:heu-vietnamese-text-encoding[\s\S]*audit:ttgdtx-release-gates[\s\S]*This is UI text clarity only[\s\S]*does not change finance calculation, run\s+Step111, execute UAT, approve migration, approve finance action, accept\s+evidence or mark production GO/i,
  "Finance Desk Vietnamese copy clarity log boundary",
  "docs/HEU_IMPLEMENTATION_LOG.md",
);

requireText(
  log,
  /P0 Register Pack Foundation[\s\S]*HEU P0 register pack as DRAFT_CONTROL documents[\s\S]*HEU_ROOT_CONTROL_ACTION_REGISTER_20260627_V01_DRAFT\.md[\s\S]*Data\s+Master, minimum data dictionary, SOP-to-data mapping, report views, AI agent\s+scope and risk\/signoff boundaries[\s\S]*audit:heu-p0-register-pack[\s\S]*This is register packaging only[\s\S]*does not execute UAT, approve migration,\s+approve finance action or mark production GO/i,
  "P0 register pack foundation log boundary",
  "docs/HEU_IMPLEMENTATION_LOG.md",
);

if (failures.length > 0) {
  console.error("HEU implementation-log audit failed.");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("HEU implementation-log audit passed. P0-05 log discipline is guarded.");
