import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const inventoryPath = "docs/HEU_CURRENT_STATE_INVENTORY.md";
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

function requireText(contents, pattern, label, file = inventoryPath) {
  if (!pattern.test(contents)) {
    fail(`${file}: missing ${label}`);
  }
}

for (const file of [
  inventoryPath,
  "docs/GIT_CLEANUP_ANALYSIS.md",
  "docs/HEU_LEAD_LIFECYCLE_STANDARD_20260627.md",
  "docs/TTGDTX_CONTRACT_TUITION_MASTER_GUARD_20260627.md",
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
  "docs/HEU_SYSTEM_BUILD_BACKLOG.md",
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
  "AGENTS.md",
  "package.json",
]) {
  requireFile(file);
}

const inventory = existsSync(path.join(repoRoot, inventoryPath))
  ? read(inventoryPath)
  : "";
const agents = existsSync(path.join(repoRoot, "AGENTS.md")) ? read("AGENTS.md") : "";
const backlog = existsSync(path.join(repoRoot, "docs/HEU_SYSTEM_BUILD_BACKLOG.md"))
  ? read("docs/HEU_SYSTEM_BUILD_BACKLOG.md")
  : "";

requireText(inventory, /Date:\s*2026-06-28/i, "current inventory date");
requireText(
  inventory,
  /Git state:\s*clean local worktree at last verified handoff; exact ahead count and\s+current commit are live Git state/i,
  "live Git state boundary",
);
requireText(
  inventory,
  /Conclusion:\s*Stage D - internal controlled test only\. Production remains NO-GO/i,
  "Stage D NO-GO conclusion",
);
requireText(
  inventory,
  /npm\.cmd run audit:ttgdtx-release-gates[\s\S]*PASS[\s\S]*npm\.cmd run audit:heu-git-hygiene[\s\S]*PASS[\s\S]*npm\.cmd run audit:ttgdtx-process-labels[\s\S]*PASS[\s\S]*npm\.cmd run audit:heu-bgh-dashboard-spec[\s\S]*PASS[\s\S]*npm\.cmd run audit:heu-finance-desk[\s\S]*PASS[\s\S]*npm\.cmd run audit:heu-hou-ledger-handover-gap-pack[\s\S]*PASS[\s\S]*npm\.cmd run audit:heu-vietnamese-text-encoding[\s\S]*PASS[\s\S]*npm\.cmd run audit:vnd-money-format[\s\S]*PASS[\s\S]*npm\.cmd run audit:heu-production-blocker-source[\s\S]*PASS[\s\S]*npm\.cmd run audit:heu-production-evidence-binder[\s\S]*PASS[\s\S]*npm\.cmd run audit:heu-final-handoff-coverage[\s\S]*PASS[\s\S]*npm\.cmd run audit:heu-implementation-log[\s\S]*PASS[\s\S]*npm\.cmd run audit:heu-user-account-security[\s\S]*PASS[\s\S]*npm\.cmd run audit:heu-controlled-evidence-redaction-pack[\s\S]*PASS[\s\S]*npm\.cmd run audit:permission-soft-revoke[\s\S]*PASS[\s\S]*npm\.cmd run audit:ttgdtx-role-scope-access[\s\S]*PASS[\s\S]*npm\.cmd run audit:ttgdtx-data-fetch-gate[\s\S]*PASS[\s\S]*npm\.cmd run audit:heu-role-scope-uat-pack[\s\S]*PASS[\s\S]*npm\.cmd run audit:ttgdtx-audit-log[\s\S]*PASS[\s\S]*npm\.cmd run audit:ttgdtx-audit-trail-guard[\s\S]*PASS[\s\S]*npm\.cmd run audit:heu-lead-lifecycle-handover-uat-pack[\s\S]*PASS[\s\S]*npm\.cmd run audit:ttgdtx-production-owner-signoff-pack[\s\S]*PASS[\s\S]*npm\.cmd run audit:heu-p0-register-pack[\s\S]*PASS[\s\S]*npm\.cmd run audit:heu-short-course-attendance-payment-gap-pack[\s\S]*PASS[\s\S]*npm\.cmd run audit:ttgdtx-signed-uat-execution-routing-hub[\s\S]*PASS[\s\S]*npm\.cmd run audit:hard-delete-conversion-decision-queue[\s\S]*PASS[\s\S]*npm\.cmd run audit:ttgdtx-payout-duplicate-guard[\s\S]*PASS[\s\S]*npm\.cmd run audit:ttgdtx-payout-execution-readiness[\s\S]*PASS[\s\S]*npm\.cmd run audit:ttgdtx-dashboard-access[\s\S]*PASS[\s\S]*npm\.cmd run audit:ttgdtx-dashboard-readonly-guard[\s\S]*PASS[\s\S]*npm\.cmd run audit:ttgdtx-accounting-dashboard-uat-plan[\s\S]*PASS[\s\S]*npm\.cmd run audit:ttgdtx-dashboard-source-reconciliation[\s\S]*PASS[\s\S]*Full `audit:\*` suite[\s\S]*TTGDTX process quick finder, production guard shared blocker source alignment, signed UAT execution routing hub, P5-02 Master Control action queue and safe iteration loop, P5-03 Finance Desk read-only cockpit guard, HOU ledger\/handover gap pack, Short Course attendance\/payment gap pack, P3-01\/P3-02 UAT execution pack guard, P0-05 implementation log audit guard, P0-13 blocker source evidence-path alignment, P0-14 evidence closure tracker, P0-15 final handoff summary guard, P0 register pack[\s\S]*Data Master \/ Report View compatibility bridge[\s\S]*user account temporary password guard[\s\S]*61 audit scripts passed/i,
  "current audit evidence",
);
requireText(
  inventory,
  /npm\.cmd run audit:heu-lead-lifecycle-standard[\s\S]*PASS/i,
  "P3-01 lead lifecycle audit evidence",
);
requireText(
  inventory,
  /npm\.cmd run audit:ttgdtx-contract-tuition-master-guard[\s\S]*PASS/i,
  "P2-01/P2-02 master guard audit evidence",
);
requireText(
  inventory,
  /M02 HR[\s\S]*Role\/scope pages, P6-04 UAT pack, create-user temporary password guard, real-user accounting onboarding guard and real-user access closure guard exist/i,
  "M02 user account temporary password current module state",
);
requireText(
  backlog,
  /P0-17[\s\S]*User account temporary password security[\s\S]*PASS_LOCAL[\s\S]*user-create-form\.tsx[\s\S]*real-user-onboarding-panel\.tsx[\s\S]*user-auth-profile-link-form\.tsx[\s\S]*actions\.ts[\s\S]*audit-heu-user-account-security\.mjs[\s\S]*Codex\/chat\/email notes\/attachments[\s\S]*does not display keys or log temporary passwords[\s\S]*real accounting users[\s\S]*P6-04[\s\S]*P2-18[\s\S]*P5-03[\s\S]*ACCESS_RETAIN \/ REVOKE_OR_REDUCE \/ BLOCKED[\s\S]*soft-revoke\/INACTIVE evidence/i,
  "P0-17 user account temporary password backlog row",
  "docs/HEU_SYSTEM_BUILD_BACKLOG.md",
);
requireText(
  inventory,
  /M03 Data Master[\s\S]*Admission programs, majors, TTGDTX master[\s\S]*Partial[\s\S]*Master\/dropdown controls and the Data Master \/ Report View compatibility bridge exist; signed UAT and owner signoff still required/i,
  "M03 Data Master compatibility bridge state",
);

requireText(
  inventory,
  /M05 Tuyen sinh CRM[\s\S]*P3-01 lifecycle guard, P3-01 acceptance matrix, P3-02 handover policy, P3-02 acceptance matrix, handover decision manifest and P3-01\/P3-02 UAT execution pack exist[\s\S]*finance-gated/i,
  "M05 P3-01/P3-02 current module state",
);
requireText(
  inventory,
  /Lead lifecycle\/handover[\s\S]*P3-01 lifecycle standard, P3-01 acceptance matrix, P3-02 handover policy, P3-02 acceptance matrix, handover decision manifest and `docs\/HEU_LEAD_LIFECYCLE_HANDOVER_UAT_RUNBOOK_20260628\.md` exist[\s\S]*PASS_LOCAL[\s\S]*signed role\/workflow UAT and handover decision pending/i,
  "P3-01/P3-02 control state",
);
requireText(
  inventory,
  /M09 Tai chinh\/Cong no[\s\S]*P2-01\/P2-02 master guard[\s\S]*P2-03 through P2-18[\s\S]*P5-03 Finance Desk read-only cockpit with real accounting user evidence bridge and reliance decision manifest[\s\S]*signed finance\/legal UAT still required/i,
  "M09 P2-01/P2-02 current module state",
);
requireText(
  inventory,
  /M10 Dashboard[\s\S]*P2-18 read-only guard, source reconciliation, dashboard acceptance matrix, dashboard immediate stop guard, real accounting user evidence bridge, dashboard reliance decision manifest, P5-02 action queue with safe iteration loop and P5-03 Finance Desk read-only cockpit with real accounting user evidence bridge and reliance decision manifest are UAT-gated and include P0-14\/P0-15 before owner GO\/NO-GO/i,
  "M10 P2-18 dashboard acceptance matrix current module state",
);
requireText(
  inventory,
  /Production readiness guard[\s\S]*TTGDTX landing guard renders shared `PRODUCTION_BLOCKERS` from `lib\/production-readiness\.ts`; internal UAT closure tracker, governance UAT execution readiness for P6-04\/P6-03, signed UAT execution routing hub, UAT execution closure template, UAT operator handoff, main execution queue with decision values and stop conditions, execution queue with safe iteration loop, P0-03\/Step90-Step110 infra readiness plan with decision values and stop conditions, P0-19\/P3-01\/P3-02 gate-handover readiness plan with decision values and stop conditions, P6-04\/P6-03 governance assurance plan with decision values and stop conditions, P2-18\/P5-03 UAT launch plan with P6-04 real-accounting queue\/result proof, decision values and stop conditions, P6-06\/P2-17 risk closure plan with decision values and stop conditions, owner GO\/NO-GO checklist, owner acceptance matrix, P0-17 access closure decision gate, final owner decision manifest and owner sign-off handoff evidence path with P3-01\/P3-02 UAT requirement[\s\S]*PASS_LOCAL, NO-GO[\s\S]*TTGDTX signed UAT execution routing hub[\s\S]*TTGDTX_SIGNED_UAT_EXECUTION_ROUTING_HUB_20260628\.md[\s\S]*ttgdtx-signed-uat-execution-routing-hub\.tsx[\s\S]*UAT-ROUTE-01 through UAT-ROUTE-11[\s\S]*SIGNED_UAT_READY \/ NO_GO \/ BLOCKED[\s\S]*UAT-ROUTE-11 carries the P0-17 access closure decision into final owner GO\/NO-GO[\s\S]*PASS_LOCAL; signed UAT and owner reliance still required[\s\S]*Backup\/restore[\s\S]*Evidence pack, UI guard, target identity lock, operator run sheet, external evidence manifest, restore smoke-check acceptance matrix with P0-19\/P3 gate preservation and P0-17 access closure state preservation, and backup\/restore closure decision manifest exist[\s\S]*Template ready; real backup\/restore evidence missing/i,
  "P0-03 backup/restore smoke-check acceptance control state",
);
requireText(
  inventory,
  /Migration order[\s\S]*Step90-Step110 guard, migration evidence acceptance lock and audit exist[\s\S]*Signed approval still required/i,
  "Step90-Step110 migration evidence acceptance current-state row",
);
requireText(
  inventory,
  /Production blocker shared source[\s\S]*lib\/production-readiness\.ts[\s\S]*TTGDTX landing guard[\s\S]*Master Control blocker summary and TTGDTX execution queue[\s\S]*P0-03 operator run sheet evidence path[\s\S]*P0-03 restore smoke-check proof for P0-19\/P3 gate preservation[\s\S]*P0-09 owner sign-off\/UAT handoff evidence path[\s\S]*P0-09 final owner decision manifest[\s\S]*PASS_LOCAL, NO-GO/i,
  "P0-13 production blocker shared source evidence-path state",
);
requireText(
  inventory,
  /Process discovery\/navigation[\s\S]*Shared TTGDTX process labels, Search suggestions and `\/ttgdtx` quick finder show business name before P2 code[\s\S]*PASS_LOCAL; signed browser UAT pending/i,
  "TTGDTX process discovery and quick finder control state",
);
requireText(
  inventory,
  /M01 Legal[\s\S]*P0-19 legal\/finance gate, immediate stop guard, acceptance matrix, gate decision manifest and Legal\/SOP\/Governance control matrix are packaged; signed UAT and PHAP_CHE owner review still required[\s\S]*Legal\/finance gate[\s\S]*P0-19 guard, UAT checklist, immediate stop guard, waiver\/exception register, acceptance matrix and gate decision manifest exist[\s\S]*Signed legal\/finance UAT still required[\s\S]*Receivable\/collection\/reconciliation[\s\S]*P2-03, P2-10, P2-10 invoice\/chung-tu UAT evidence checklist, P2-10 invoice\/chung-tu decision manifest, P2-13 and P2-14 packaged; shared VND helper covers P2-10\/P2-17 money-form parsing\/input formatting plus P2-18 dashboard and P5-03 Finance Desk display[\s\S]*Local controls pass; signed finance UAT pending/i,
  "P0-19 legal/finance acceptance matrix control state",
);
requireText(
  inventory,
  /Contract\/tuition master[\s\S]*P2-01\/P2-02 master guard exists[\s\S]*PASS_LOCAL[\s\S]*signed legal\/finance\/KHTC UAT pending/i,
  "P2-01/P2-02 control state",
);
requireText(
  inventory,
  /Accounting dashboard \/ BGH control[\s\S]*P2-18 read-only guard, source reconciliation checklist, UAT checklist, dashboard acceptance matrix, dashboard immediate stop guard, real accounting user evidence bridge to P6-04 queue\/result proof, dashboard reliance decision manifest and P5-02 Master Control action queue with safe iteration loop, P0-14 intake-ledger evidence binder and P0-15 final handoff summary before owner GO\/NO-GO exist[\s\S]*Signed browser UAT pending/i,
  "P2-18 dashboard and P5-02 action queue control state",
);
requireText(
  inventory,
  /Finance Desk \/ KHTC cockpit[\s\S]*P5-03 read-only cockpit exists at `\/finance-desk` with permission and workspace-scope gate, read-only TTGDTX views, shared VND formatter, UAT evidence checklist, immediate stop guard, real accounting user evidence bridge to P6-04 queue\/result proof, `docs\/HEU_FINANCE_DESK_UAT_RUNBOOK_20260627\.md` acceptance matrix and P5-03 reliance decision manifest[\s\S]*Signed browser UAT and reliance decision pending/i,
  "P5-03 Finance Desk current control state",
);
requireText(
  inventory,
  /P0 register pack[\s\S]*Root control, data master, dictionary, SOP-to-data, report view, report-view source map, read-only `\/reports` source-map panel with Data Quality Check status capture and owner signoff capture, AI scope, risk signoff registers and module readiness gap matrix exist as DRAFT_CONTROL documents[\s\S]*HEU_DATA_MASTER_REPORT_VIEW_COMPATIBILITY_20260628_V01_DRAFT\.md[\s\S]*data-master-report-view-bridge-panel\.tsx[\s\S]*STUDENT_MASTER[\s\S]*CLASS_MASTER[\s\S]*COHORT_MASTER[\s\S]*PASS_LOCAL; official owner signoff and Drive registry still required/i,
  "P0 register pack current control state",
);
requireText(
  inventory,
  /Data Master \/ Report View bridge[\s\S]*\/reports[\s\S]*compatibility objects, report-view master requirements and DQ-DM-01 through DQ-DM-05 stop conditions[\s\S]*dashboard reliance lock[\s\S]*PASS_LOCAL; no production SQL, source merge, real-data import, report-view signoff or dashboard reliance approved/i,
  "Data Master / Report View bridge current control state",
);
requireText(
  inventory,
  /HOU ledger\/handover gap pack[\s\S]*\/hou[\s\S]*HEU_HOU_LEDGER_HANDOVER_GAP_PACK_20260628_V01_DRAFT\.md[\s\S]*HOU-LH-01 through HOU-LH-08[\s\S]*PASS_LOCAL; no HOU handover, tuition ledger posting, invoice issuance, COM payout, finance action, UAT acceptance, evidence acceptance or production GO approved/i,
  "HOU ledger/handover gap-pack current control state",
);
requireText(
  inventory,
  /Short Course attendance\/payment gap pack[\s\S]*\/short-course[\s\S]*HEU_SHORT_COURSE_ATTENDANCE_PAYMENT_GAP_PACK_20260628_V01_DRAFT\.md[\s\S]*SC-AP-01 through SC-AP-08[\s\S]*PASS_LOCAL; no attendance lock, BHXH decision, meal\/allowance payment, HR payment, invoice\/payment verification, period close, statutory accounting, UAT acceptance, evidence acceptance or production GO approved/i,
  "Short Course attendance/payment gap-pack current control state",
);
requireText(
  inventory,
  /Partner payment\/payout[\s\S]*P2-15, P2-16, P2-17 packaged with dossier, payment dossier acceptance matrix, duplicate, execution-readiness guards, payout acceptance matrix and payout release decision manifest[\s\S]*Signed payout UAT pending/i,
  "P2-17 payout execution readiness control state",
);
requireText(
  inventory,
  /Account-control\/collateral scope[\s\S]*Account-control scope decision and source-control UI guard keep tuition-account freeze\/release metadata-only and collateral giai-chap separate[\s\S]*PASS_LOCAL; real bank\/collateral operation deferred/i,
  "account-control/collateral scope control state",
);
requireText(
  inventory,
  /Hard-delete\/cascade[\s\S]*TTGDTX cascade passes; non-TTGDTX review identifies 44 findings, locks P6-06-FIND-001 through P6-06-FIND-044 in `docs\/HEU_NON_TTGDTX_CASCADE_FINDING_REGISTER_20260628\.md`, and exposes a conversion\/waiver decision queue, owner triage batch plan, hard-delete\/cascade acceptance matrix and closure decision manifest[\s\S]*Conversion or written waiver pending/i,
  "P6-06 hard-delete decision queue control state",
);
requireText(
  inventory,
  /Controlled evidence[\s\S]*Redaction\/intake pack, audit guard, controlled evidence acceptance matrix, P0-14 evidence binder, controlled evidence intake ledger, governance evidence checkpoint, finance reliance evidence checkpoint and closure tracker exist[\s\S]*P0-03 operator run sheet proof[\s\S]*P0-03 restore smoke-check proof for P0-19\/P3 gate preservation[\s\S]*separate P6-04 role\/workspace proof[\s\S]*P6-03 audit-log proof[\s\S]*P2-18\/P5-03 real-accounting reliance proof with P0-17 access closure decision[\s\S]*P6-06 hard-delete\/cascade conversion-or-waiver proof[\s\S]*P0-09 owner sign-off\/UAT handoff\/final owner decision manifest proof with P3-01\/P3-02 runbook evidence[\s\S]*temporary passwords, password reset links and account activation\/invite links are forbidden in Git\/Codex\/chat[\s\S]*Real evidence must stay outside Git\/Codex\/chat/i,
  "P0-14 controlled evidence binder closure tracker state",
);
requireText(
  inventory,
  /Final handoff coverage[\s\S]*AGENTS\.md[\s\S]*live git state[\s\S]*local check results[\s\S]*Stage D\/NO-GO[\s\S]*P0-03 operator run sheet evidence path[\s\S]*P0-03 restore smoke-check proof for P0-19\/P3 gate preservation[\s\S]*P0-09 owner sign-off\/UAT handoff evidence path[\s\S]*P0-09 final owner decision manifest[\s\S]*P3-01\/P3-02 UAT requirement[\s\S]*P0-13 blocker source[\s\S]*P0-14 evidence binder[\s\S]*controlled evidence intake ledger[\s\S]*redaction reviewer[\s\S]*owner signature state[\s\S]*P2-18\/P5-03 real-accounting finance reliance proof[\s\S]*P0-17 access closure decision[\s\S]*separate P6-04 role\/workspace[\s\S]*P6-03 audit-log[\s\S]*P6-06 hard-delete\/cascade proof paths[\s\S]*HEU_NON_TTGDTX_CASCADE_FINDING_REGISTER_20260628\.md[\s\S]*PASS_LOCAL; cannot override production NO-GO/i,
  "P0-15 final handoff summary guard state",
);
requireText(
  inventory,
  /Role\/workspace scope[\s\S]*P6-04 pack, scope UI guard, create-user temporary password guard, real-user accounting onboarding guard, real-user access closure guard, real accounting user UAT queue and result template, post-UAT access closure handoff, evidence checklist, route matrix, acceptance matrix, access decision manifest, governance UAT execution readiness, internal UAT run closure tracker, execution-log closure template and UAT operator handoff exist[\s\S]*Multi-account signed UAT pending/i,
  "P6-04 role-scope route matrix control state",
);
requireText(
  inventory,
  /Audit log[\s\S]*Static coverage, audit trace acceptance matrix, audit-log evidence acceptance matrix, audit traceability decision manifest and governance UAT execution readiness pass locally[\s\S]*Signed audit-log UAT pending/i,
  "P6-03 audit-log governance UAT execution readiness state",
);
requireText(
  inventory,
  /P7-01\/P7-02\/P7-03 are PASS_LOCAL and P7-04 prompt\/output audit logging is PASS_LOCAL_DESIGN; autonomous AI remains locked[\s\S]*AI helper layer[\s\S]*Task checklist and risk board are read-only; P7-04 prompt\/output audit logging design exists[\s\S]*Advisory only; no AI service call, prompt storage, workflow write or autonomous approval/i,
  "AI remains advisory-only",
);
requireText(
  inventory,
  /Current stage:\s*Stage D - internal controlled test only[\s\S]*Production is still NO-GO because:[\s\S]*No real production backup\/restore dry-run evidence[\s\S]*Step90-Step110 production migration order is not signed[\s\S]*P3-01\/P3-02 lifecycle and handover UAT is not signed[\s\S]*P2-18 dashboard browser UAT is not signed[\s\S]*P5-03 Finance Desk browser UAT is not signed[\s\S]*Final BGH\/IT_DATA\/KHTC\/PHAP_CHE\/Audit\/owner GO\/NO-GO is not signed/i,
  "production NO-GO blocker list",
);
requireText(
  inventory,
  /P3-01\/P3-02[\s\S]*still require signed evidence[\s\S]*Execute P3-01\/P3-02 lead lifecycle and handover UAT/i,
  "P3-01/P3-02 signed UAT priority",
);
requireText(
  inventory,
  /Record final owner GO\/NO-GO outside Codex\/chat using the owner sign-off pack,\s+final owner decision manifest and UAT operator handoff references/i,
  "owner sign-off handoff priority",
);
requireText(
  inventory,
  /Convert remaining non-TTGDTX\/base hard-delete\/cascade findings or obtain\s+written waiver[\s\S]*Most important blockers[\s\S]*hard-delete\/cascade conversion or written waiver and owner GO\/NO-GO/i,
  "P6-06 conversion-or-written-waiver priority wording",
);
requireText(
  inventory,
  /Raw PII, bank data, passwords, temporary passwords, account activation\/invite links, service-role keys and vouchers must stay outside Git\/Codex\/chat/i,
  "sensitive-data boundary",
);

if (/Git state:\s*dirty/i.test(inventory)) {
  fail(`${inventoryPath}: must not say the current Git state is dirty.`);
}
if (/Latest known commit:\s*9d54348/i.test(inventory)) {
  fail(`${inventoryPath}: must not keep the stale 2026-06-22 commit marker.`);
}
if (/Dirty working tree\s*\|\s*HIGH/i.test(inventory)) {
  fail(`${inventoryPath}: stale dirty working tree risk row must be replaced.`);
}
if (/P2-01 TTGDTX contract active[\s\S]*\|\s*DONE\s*\|/i.test(inventory)) {
  fail(`${inventoryPath}: must not mark P2-01 DONE without signed evidence.`);
}
if (/P2-02 tuition policy ready[\s\S]*\|\s*DONE\s*\|/i.test(inventory)) {
  fail(`${inventoryPath}: must not mark P2-02 DONE without signed evidence.`);
}

const packageJson = JSON.parse(read("package.json"));
if (!packageJson.scripts?.["audit:heu-current-state-inventory"]) {
  fail("package.json: missing audit:heu-current-state-inventory script");
}

requireText(
  agents,
  /Before any final handoff[\s\S]*npm\.cmd run audit:heu-current-state-inventory/i,
  "final handoff current-state inventory audit command",
  "AGENTS.md",
);

if (failures.length > 0) {
  console.error("HEU current-state inventory audit failed.");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("HEU current-state inventory audit passed. Inventory reflects Stage D NO-GO current state.");
