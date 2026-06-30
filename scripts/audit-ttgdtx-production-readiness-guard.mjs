import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const failures = [];

function read(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), "utf8");
}

function requireFile(relativePath) {
  if (!existsSync(path.join(repoRoot, relativePath))) {
    failures.push(`Missing required file: ${relativePath}`);
  }
}

function requireText(contents, pattern, label, file) {
  if (!pattern.test(contents)) {
    failures.push(`${file}: missing ${label}`);
  }
}

const componentPath = "components/ttgdtx/ttgdtx-production-readiness-guard.tsx";
const blockerSourcePath = "lib/production-readiness.ts";
const uatGuardPath = "components/ttgdtx/ttgdtx-uat-signoff-guard.tsx";
const executionQueuePath = "components/ttgdtx/ttgdtx-production-execution-queue.tsx";
const pagePath = "app/ttgdtx/page.tsx";
const checklistPath = "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md";
const backlogPath = "docs/HEU_SYSTEM_BUILD_BACKLOG.md";
const financeDayOneRunbookPath =
  "docs/HEU_FINANCE_DAY1_REAL_RUN_REHEARSAL_20260630.md";
const financeDayOneLedgerTemplatePath =
  "docs/HEU_FINANCE_DAY1_RESULT_LEDGER_TEMPLATE_20260630.md";

for (const file of [
  componentPath,
  blockerSourcePath,
  uatGuardPath,
  executionQueuePath,
  pagePath,
  checklistPath,
  backlogPath,
  financeDayOneRunbookPath,
  financeDayOneLedgerTemplatePath,
  "docs/HEU_IMPLEMENTATION_LOG.md",
  "docs/TTGDTX_UAT_OPERATOR_HANDOFF_20260627.md",
  "AGENTS.md",
  "package.json",
  "scripts/audit-ttgdtx-release-gates.mjs",
]) {
  requireFile(file);
}

const component = read(componentPath);
const blockerSource = read(blockerSourcePath);
const uatGuard = read(uatGuardPath);
const executionQueue = read(executionQueuePath);
const page = read(pagePath);
const checklist = read(checklistPath);
const backlog = read(backlogPath);
const financeDayOneRunbook = read(financeDayOneRunbookPath);
const financeDayOneLedgerTemplate = read(financeDayOneLedgerTemplatePath);
const agents = read("AGENTS.md");
const releaseGateAudit = read("scripts/audit-ttgdtx-release-gates.mjs");
const packageJson = JSON.parse(read("package.json"));

requireText(
  component,
  /data-ttgdtx-production-readiness-guard="TTGDTX_9PLUS"/,
  "TTGDTX production readiness guard marker",
  componentPath,
);
requireText(
  component,
  /Production remains NO-GO[\s\S]*PASS_LOCAL[\s\S]*render từ cùng nguồn production\s+blocker[\s\S]*không\s+phê duyệt production migration/i,
  "NO-GO and PASS_LOCAL boundary",
  componentPath,
);

requireText(
  component,
  /Không chạy migration production từ Codex\/chat[\s\S]*Không dùng dữ liệu\s+thật, mật khẩu, OTP, service key, CCCD, tài khoản ngân hàng hoặc\s+file thanh toán thật trong UAT[\s\S]*Cách đi tiếp an toàn: chạy audit[\s\S]*Đạt đến đâu commit đến đó; chưa đạt thì giữ\s+NO-GO và sửa từng lỗi nhỏ/i,
  "accented Vietnamese production-readiness guidance",
  componentPath,
);

requireText(
  component,
  /(?=[\s\S]*PRODUCTION_BLOCKERS)(?=[\s\S]*PRODUCTION_BLOCKERS\.map)(?=[\s\S]*item\.code)(?=[\s\S]*item\.owner)(?=[\s\S]*item\.requiredEvidence)(?=[\s\S]*Evidence pack required)/i,
  "TTGDTX guard renders shared production blocker source",
  componentPath,
);

if (/const\s+readinessBlockers\b/.test(component)) {
  failures.push(
    `${componentPath}: must not keep a local readinessBlockers array; render PRODUCTION_BLOCKERS from ${blockerSourcePath}.`,
  );
}

requireText(
  blockerSource,
  /(?=[\s\S]*export const PRODUCTION_BLOCKERS)(?=[\s\S]*P0-03)(?=[\s\S]*Step90-Step110)(?=[\s\S]*P0-19)(?=[\s\S]*P2-17)(?=[\s\S]*P2-18)(?=[\s\S]*P6-04)(?=[\s\S]*P6-03)(?=[\s\S]*P6-06)(?=[\s\S]*P0-10)(?=[\s\S]*P0-09)(?=[\s\S]*Final signed multi-owner GO\/NO-GO)/i,
  "shared production blocker source includes all current TTGDTX production blockers",
  blockerSourcePath,
);

requireText(
  page,
  /TtgdtxProductionReadinessGuard[\s\S]*<TtgdtxProductionReadinessGuard \/>/,
  "TTGDTX landing page mounts production readiness guard",
  pagePath,
);

requireText(
  uatGuard,
  /(?=[\s\S]*data-ttgdtx-uat-signoff-guard="INTERNAL_UAT")(?=[\s\S]*Internal UAT sign-off)(?=[\s\S]*PASS_LOCAL)(?=[\s\S]*Production remains NO-GO until signed multi-account UAT evidence\s+exists)(?=[\s\S]*PASS_LOCAL does not approve real pilot start, production\s+migration, revenue recognition, payout, dashboard reliance or\s+Go\/No-Go)(?=[\s\S]*Do not paste real passwords, temporary passwords, password reset\s+links, account activation\/invite links, OTPs, service-role keys,\s+student PII, CCCD, phone numbers, bank accounts or raw payment\s+evidence)(?=[\s\S]*UAT_ADMIN)(?=[\s\S]*UAT_BGH)(?=[\s\S]*UAT_KHTC)(?=[\s\S]*UAT_TUYEN_SINH)(?=[\s\S]*UAT_PHAP_CHE)(?=[\s\S]*UAT_OUT_OF_SCOPE)(?=[\s\S]*TTGDTX_SYNTHETIC_UAT_ACCOUNT_SETUP\.md)(?=[\s\S]*TTGDTX_BROWSER_UAT_MATRIX_20260625\.md)(?=[\s\S]*TTGDTX_UAT_EXECUTION_LOG_20260625\.md)(?=[\s\S]*signed multi-account UAT still required)(?=[\s\S]*PRODUCTION_GOVERNANCE_ASSURANCE_STEPS)(?=[\s\S]*data-ttgdtx-governance-uat-execution-readiness="P6-04_P6-03")(?=[\s\S]*Governance UAT execution readiness: P6-04 \+ P6-03)(?=[\s\S]*Run P6-04 role\/workspace UAT first, then P6-03 audit-log\s+traceability sampling)(?=[\s\S]*P6_04_SCOPE_UAT \/ P6_03_TRACE_UAT)(?=[\s\S]*Runbook:[\s\S]*step\.runbook)(?=[\s\S]*Guard:[\s\S]*step\.auditCommand)(?=[\s\S]*Stop if evidence is unsigned, role scope leaks, audit trace is\s+missing, redaction fails or the result is stored in\s+Git\/Codex\/chat)(?=[\s\S]*data-ttgdtx-uat-run-closure-tracker="INTERNAL_UAT")(?=[\s\S]*Internal UAT run closure tracker)(?=[\s\S]*UAT_PASS \/ UAT_FAIL \/ BLOCKED)(?=[\s\S]*UAT-CLOSE-01)(?=[\s\S]*UAT-CLOSE-06)(?=[\s\S]*Finance and dashboard negative tests pass)(?=[\s\S]*Owners sign UAT result)(?=[\s\S]*Missing route evidence, owner signature, redaction\s+proof or negative-test result keeps production NO-GO)/i,
  "TTGDTX internal UAT sign-off guard",
  uatGuardPath,
);

requireText(
  page,
  /<TtgdtxProductionReadinessGuard\s*\/>[\s\S]*<TtgdtxUatSignoffGuard\s*\/>[\s\S]*<TtgdtxOperatingControlStrip\b/,
  "TTGDTX landing page mounts UAT sign-off guard before operating strip",
  pagePath,
);

requireText(
  executionQueue,
  /(?=[\s\S]*data-ttgdtx-production-execution-queue="TTGDTX_9PLUS")(?=[\s\S]*TTGDTX production execution queue)(?=[\s\S]*PASS_LOCAL only)(?=[\s\S]*PRODUCTION_EXECUTION_STEPS)(?=[\s\S]*redaction, backup\/restore, migration order,\s+role UAT, P0-19, P2-17, P2-18, audit-log traceability,\s+hard-delete conversion\/waiver, P0-14 intake-ledger evidence\s+binder, P0-15 final handoff summary, then final owner Go\/No-Go)(?=[\s\S]*Do not skip\s+ahead)(?=[\s\S]*Final result stays NO-GO until signed owner GO exists)(?=[\s\S]*Decision:[\s\S]*step\.decisionValue)(?=[\s\S]*Stop:[\s\S]*step\.stopCondition)/i,
  "TTGDTX production execution queue UI shell",
  executionQueuePath,
);

requireText(
  executionQueue,
  /(?=[\s\S]*SAFE_ITERATION_STEPS)(?=[\s\S]*data-ttgdtx-safe-iteration-loop="TTGDTX_9PLUS")(?=[\s\S]*Safe iteration loop: one small slice at a time)(?=[\s\S]*Build rhythm: select one blocker, run the local audit, attach\s+controlled proof, then advance only when the guard is green)(?=[\s\S]*fail keeps NO-GO)/i,
  "TTGDTX safe iteration loop",
  executionQueuePath,
);

requireText(
  executionQueue,
  /(?=[\s\S]*PRODUCTION_INFRA_READINESS_STEPS)(?=[\s\S]*data-ttgdtx-infra-readiness-plan="P0-03_STEP90_STEP110")(?=[\s\S]*Infra readiness plan: P0-03 \+ Step90-Step110)(?=[\s\S]*backup\/restore dry-run first)(?=[\s\S]*sign the migration order)(?=[\s\S]*No production migration runs from Codex\/chat)(?=[\s\S]*keeps production NO-GO)(?=[\s\S]*backup proof first)(?=[\s\S]*Decision:[\s\S]*step\.decisionValue)(?=[\s\S]*Stop:[\s\S]*step\.stopCondition)(?=[\s\S]*Open infra route)/i,
  "TTGDTX P0-03/Step90-Step110 infra readiness plan",
  executionQueuePath,
);

requireText(
  executionQueue,
  /(?=[\s\S]*PRODUCTION_UAT_LAUNCH_STEPS)(?=[\s\S]*data-ttgdtx-uat-launch-plan="P2-18_P5-03")(?=[\s\S]*First UAT launch plan: P2-18 \+ P5-03)(?=[\s\S]*signed browser UAT)(?=[\s\S]*Use synthetic accounts plus P6-04 real-accounting\s+queue\/result proof)(?=[\s\S]*store proof outside Git\/Codex\/chat)(?=[\s\S]*signed evidence required)(?=[\s\S]*Decision:[\s\S]*step\.decisionValue)(?=[\s\S]*Stop:[\s\S]*step\.stopCondition)(?=[\s\S]*Open UAT route)/i,
  "TTGDTX P2-18/P5-03 UAT launch plan",
  executionQueuePath,
);

requireText(
  executionQueue,
  /(?=[\s\S]*PRODUCTION_FINANCE_UAT_FIRST_PASS_STEPS)(?=[\s\S]*data-ttgdtx-finance-first-uat-checklist="P2-18_P5-03")(?=[\s\S]*First signed finance UAT checklist: P2-18 \+ P5-03)(?=[\s\S]*P2_18_P5_03_FIRST_UAT_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*FIN-UAT-01)(?=[\s\S]*FIN-UAT-05)(?=[\s\S]*P0-10\s+evidence redaction)(?=[\s\S]*P6-04 real users)(?=[\s\S]*dashboard reconciliation)(?=[\s\S]*Finance Desk\s+read-only behavior)(?=[\s\S]*P0-14\/P0-17 handoff)(?=[\s\S]*not UAT acceptance)/i,
  "TTGDTX P2-18/P5-03 first finance UAT checklist",
  executionQueuePath,
);

requireText(
  executionQueue,
  /(?=[\s\S]*PRODUCTION_FINANCE_DAY_ONE_RUNBOOK)(?=[\s\S]*PRODUCTION_FINANCE_DAY_ONE_RUN_STEPS)(?=[\s\S]*data-ttgdtx-finance-day-one-run-rehearsal="P0-17_P6-04_P2-18_P5-03_P2-17")(?=[\s\S]*data-ttgdtx-finance-day-one-run-range="FIN-DAY1-01_FIN-DAY1-05")(?=[\s\S]*Finance Day-1 real-run rehearsal: PASS_LOCAL only)(?=[\s\S]*approved account labels only)(?=[\s\S]*outside Git\/Codex\/chat)(?=[\s\S]*do not initiate a bank instruction)(?=[\s\S]*Runbook:[\s\S]*PRODUCTION_FINANCE_DAY_ONE_RUNBOOK)(?=[\s\S]*FIN_DAY1_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*FIN-DAY1-01)(?=[\s\S]*FIN-DAY1-05)(?=[\s\S]*Decision:[\s\S]*step\.decisionValue)(?=[\s\S]*Stop:[\s\S]*step\.stopCondition)/i,
  "TTGDTX finance Day-1 real-run rehearsal UI",
  executionQueuePath,
);

requireText(
  executionQueue,
  /(?=[\s\S]*PRODUCTION_FINANCE_DAY_ONE_ACCOUNT_LANES)(?=[\s\S]*PRODUCTION_FINANCE_DAY_ONE_RESULT_FIELDS)(?=[\s\S]*PRODUCTION_FINANCE_DAY_ONE_RESULT_LEDGER_TEMPLATE)(?=[\s\S]*data-ttgdtx-finance-day-one-result-ledger="P0-17_P6-04_P2-18_P5-03_P2-17")(?=[\s\S]*Finance Day-1 result ledger: real-user proof rows)(?=[\s\S]*Each real-accounting Day-1 lane needs a controlled evidence row)(?=[\s\S]*Template:[\s\S]*PRODUCTION_FINANCE_DAY_ONE_RESULT_LEDGER_TEMPLATE)(?=[\s\S]*FIN_DAY1_RESULT_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*lane\.accountLabel)(?=[\s\S]*lane\.requiredResult)(?=[\s\S]*lane\.stopCondition)(?=[\s\S]*item\.forbiddenContent)(?=[\s\S]*Missing, ownerless or raw evidence keeps production\s+NO-GO)/i,
  "TTGDTX finance Day-1 result ledger UI",
  executionQueuePath,
);

requireText(
  blockerSource,
  /(?=[\s\S]*export const SAFE_ITERATION_STEPS)(?=[\s\S]*ITER-01)(?=[\s\S]*Pick one blocker)(?=[\s\S]*ITER-02)(?=[\s\S]*Run local guard)(?=[\s\S]*ITER-03)(?=[\s\S]*Attach controlled proof)(?=[\s\S]*ITER-04)(?=[\s\S]*Advance only if green)(?=[\s\S]*commit that small scope)(?=[\s\S]*keep NO-GO)/i,
  "TTGDTX safe iteration shared source",
  blockerSourcePath,
);

requireText(
  blockerSource,
  /(?=[\s\S]*export const PRODUCTION_INFRA_READINESS_STEPS)(?=[\s\S]*P0-03)(?=[\s\S]*Backup and restore dry-run evidence)(?=[\s\S]*STEP90_STEP110_BACKUP_RESTORE_OPERATOR_RUN_SHEET_20260627\.md)(?=[\s\S]*P0_03_RESTORE_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*Backup ID is missing)(?=[\s\S]*audit:ttgdtx-backup-restore-dry-run-pack)(?=[\s\S]*Step90-Step110)(?=[\s\S]*Signed production migration order)(?=[\s\S]*STEP90_STEP110_MIGRATION_ORDER_SIGNOFF_GUARD_20260627\.md)(?=[\s\S]*STEP90_110_MIGRATION_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*Migration order is unsigned)(?=[\s\S]*audit:ttgdtx-migration-order-guard)/i,
  "TTGDTX P0-03/Step90-Step110 infra readiness shared source",
  blockerSourcePath,
);

requireText(
  executionQueue,
  /(?=[\s\S]*PRODUCTION_GATE_HANDOVER_STEPS)(?=[\s\S]*data-ttgdtx-gate-handover-plan="P0-19_P3-01_P3-02")(?=[\s\S]*Gate and handover readiness: P0-19 \+ P3-01\/P3-02)(?=[\s\S]*legal\/finance basis)(?=[\s\S]*lead handover UAT)(?=[\s\S]*Handover cannot bypass P0-19\/P2-05\/P2-03)(?=[\s\S]*keeps production NO-GO)(?=[\s\S]*finance gate first)(?=[\s\S]*Decision:[\s\S]*step\.decisionValue)(?=[\s\S]*Stop:[\s\S]*step\.stopCondition)(?=[\s\S]*Open gate route)/i,
  "TTGDTX P0-19/P3 gate-handover readiness plan",
  executionQueuePath,
);

requireText(
  executionQueue,
  /(?=[\s\S]*PRODUCTION_GOVERNANCE_ASSURANCE_STEPS)(?=[\s\S]*data-ttgdtx-governance-assurance-plan="P6-04_P6-03")(?=[\s\S]*Governance assurance plan: P6-04 \+ P6-03)(?=[\s\S]*role\/workspace scope)(?=[\s\S]*audit-log traceability)(?=[\s\S]*role leak)(?=[\s\S]*missing trace row)(?=[\s\S]*keeps production NO-GO)(?=[\s\S]*scope and trace required)(?=[\s\S]*Decision:[\s\S]*step\.decisionValue)(?=[\s\S]*Stop:[\s\S]*step\.stopCondition)(?=[\s\S]*Open governance route)/i,
  "TTGDTX P6-04/P6-03 governance assurance plan",
  executionQueuePath,
);

requireText(
  blockerSource,
  /(?=[\s\S]*export const PRODUCTION_GATE_HANDOVER_STEPS)(?=[\s\S]*P0-19)(?=[\s\S]*Legal and finance gate UAT)(?=[\s\S]*P0_19_P2_01_P2_02_PILOT_OPEN_UAT_RUNBOOK\.md)(?=[\s\S]*P0_19_GATE_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*Legal basis, tuition policy, waiver\/exception decision)(?=[\s\S]*audit:ttgdtx-p019-gate-guard)(?=[\s\S]*P3-01\/P3-02)(?=[\s\S]*Lead lifecycle and handover UAT)(?=[\s\S]*HEU_LEAD_LIFECYCLE_HANDOVER_UAT_RUNBOOK_20260628\.md)(?=[\s\S]*P3_01_P3_02_HANDOVER_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*bypass P0-19\/P2-05\/P2-03 gates)(?=[\s\S]*audit:heu-lead-lifecycle-handover-uat-pack)/i,
  "TTGDTX P0-19/P3 gate-handover shared source",
  blockerSourcePath,
);

requireText(
  blockerSource,
  /(?=[\s\S]*export const PRODUCTION_GOVERNANCE_ASSURANCE_STEPS)(?=[\s\S]*P6-04)(?=[\s\S]*Role and workspace scope UAT)(?=[\s\S]*HEU_ROLE_SCOPE_UAT_EXECUTION_PACK_20260627\.md)(?=[\s\S]*P6_04_SCOPE_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*Any role leak)(?=[\s\S]*audit:heu-role-scope-uat-pack)(?=[\s\S]*P6-03)(?=[\s\S]*Audit-log traceability UAT)(?=[\s\S]*TTGDTX_AUDIT_LOG_UAT_RUNBOOK\.md)(?=[\s\S]*P6_03_TRACE_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*Any required trace row is missing)(?=[\s\S]*audit:ttgdtx-audit-trail-guard)/i,
  "TTGDTX P6-04/P6-03 governance assurance shared source",
  blockerSourcePath,
);

requireText(
  blockerSource,
  /(?=[\s\S]*export const PRODUCTION_UAT_LAUNCH_STEPS)(?=[\s\S]*P2-18)(?=[\s\S]*Accounting dashboard browser UAT)(?=[\s\S]*docs\/P2_18_ACCOUNTING_DASHBOARD_UAT_RUNBOOK\.md)(?=[\s\S]*P6-04 real accounting user queue\/result proof)(?=[\s\S]*P2_18_RELIANCE_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*Dashboard can write)(?=[\s\S]*P6-04 real-accounting proof is missing)(?=[\s\S]*audit:ttgdtx-accounting-dashboard-uat-plan)(?=[\s\S]*P5-03)(?=[\s\S]*Finance Desk browser UAT)(?=[\s\S]*docs\/HEU_FINANCE_DESK_UAT_RUNBOOK_20260627\.md)(?=[\s\S]*P5_03_RELIANCE_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*Finance Desk can mutate source facts)(?=[\s\S]*lacks P6-04 real-accounting proof)(?=[\s\S]*audit:heu-finance-desk)/i,
  "TTGDTX P2-18/P5-03 UAT launch shared source",
  blockerSourcePath,
);

requireText(
  blockerSource,
  /(?=[\s\S]*export const PRODUCTION_FINANCE_UAT_FIRST_PASS_STEPS)(?=[\s\S]*FIN-UAT-01)(?=[\s\S]*P0-10 evidence redaction is ready)(?=[\s\S]*FIN-UAT-02)(?=[\s\S]*P6-04 real-accounting accounts are ready)(?=[\s\S]*FIN-UAT-03)(?=[\s\S]*P2-18 dashboard route is ready)(?=[\s\S]*FIN-UAT-04)(?=[\s\S]*P5-03 Finance Desk route is ready)(?=[\s\S]*FIN-UAT-05)(?=[\s\S]*P0-14\/P0-17 handoff is ready)(?=[\s\S]*Evidence ID, redaction reviewer, owner signature state or access closure decision is missing)/i,
  "TTGDTX P2-18/P5-03 first finance UAT shared source",
  blockerSourcePath,
);

requireText(
  blockerSource,
  /(?=[\s\S]*export type ProductionFinanceDayOneRunStep)(?=[\s\S]*PRODUCTION_FINANCE_DAY_ONE_RUNBOOK[\s\S]*HEU_FINANCE_DAY1_REAL_RUN_REHEARSAL_20260630\.md)(?=[\s\S]*export const PRODUCTION_FINANCE_DAY_ONE_RUN_STEPS)(?=[\s\S]*FIN-DAY1-01)(?=[\s\S]*Secure account activation outside Codex)(?=[\s\S]*FIN-DAY1-02)(?=[\s\S]*Scope proof before first finance login)(?=[\s\S]*FIN-DAY1-03)(?=[\s\S]*Read-only dashboard confidence check)(?=[\s\S]*FIN-DAY1-04)(?=[\s\S]*Payout rehearsal with no bank action)(?=[\s\S]*FIN-DAY1-05)(?=[\s\S]*Access closure before expansion)(?=[\s\S]*FIN_DAY1_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*Passwords, temporary passwords, OTPs, reset links)(?=[\s\S]*A bank instruction is initiated)(?=[\s\S]*blocked users keep active finance access)/i,
  "TTGDTX finance Day-1 real-run rehearsal shared source",
  blockerSourcePath,
);

requireText(
  blockerSource,
  /(?=[\s\S]*PRODUCTION_FINANCE_DAY_ONE_RESULT_LEDGER_TEMPLATE[\s\S]*HEU_FINANCE_DAY1_RESULT_LEDGER_TEMPLATE_20260630\.md)(?=[\s\S]*export type ProductionFinanceDayOneAccountLane)(?=[\s\S]*export type ProductionFinanceDayOneResultField)(?=[\s\S]*export const PRODUCTION_FINANCE_DAY_ONE_ACCOUNT_LANES)(?=[\s\S]*REAL_KHTC_TTGDTX_OPERATOR_01)(?=[\s\S]*REAL_BGH_READONLY_01)(?=[\s\S]*REAL_AUDIT_READONLY_01)(?=[\s\S]*REAL_PHAP_CHE_REVIEW_01)(?=[\s\S]*REAL_OUT_OF_SCOPE_NEGATIVE_01)(?=[\s\S]*export const PRODUCTION_FINANCE_DAY_ONE_RESULT_FIELDS)(?=[\s\S]*Evidence ID)(?=[\s\S]*Owner decision)(?=[\s\S]*FIN_DAY1_RESULT_READY)(?=[\s\S]*Access closure)(?=[\s\S]*No raw PII, CCCD, bank data, voucher body)(?=[\s\S]*No password, OTP, invite\/reset link)/i,
  "TTGDTX finance Day-1 result ledger shared source",
  blockerSourcePath,
);

requireText(
  financeDayOneRunbook,
  /(?=[\s\S]*Status:\s*PASS_LOCAL_RUNBOOK)(?=[\s\S]*Production status:\s*NO-GO)(?=[\s\S]*FIN-DAY1-01)(?=[\s\S]*FIN-DAY1-05)(?=[\s\S]*FIN_DAY1_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*P0-17 secure account activation outside Codex\/chat)(?=[\s\S]*P6-04 role and workspace scope proof)(?=[\s\S]*P2-18 and P5-03 read-only dashboard confidence check)(?=[\s\S]*P2-17 payout rehearsal with no bank action)(?=[\s\S]*P0-17 access closure before expanding)(?=[\s\S]*does not create accounts)(?=[\s\S]*send passwords)(?=[\s\S]*initiate bank\s+instructions)(?=[\s\S]*mark\s+production GO)/i,
  "Finance Day-1 real-run rehearsal runbook",
  financeDayOneRunbookPath,
);

requireText(
  financeDayOneRunbook,
  /(?=[\s\S]*Day-1 Result Ledger)(?=[\s\S]*HEU_FINANCE_DAY1_RESULT_LEDGER_TEMPLATE_20260630\.md)(?=[\s\S]*REAL_KHTC_TTGDTX_OPERATOR_01)(?=[\s\S]*REAL_OUT_OF_SCOPE_NEGATIVE_01)(?=[\s\S]*FIN-DAY1-EVID-001)(?=[\s\S]*FIN_DAY1_RESULT_READY)(?=[\s\S]*ACCESS_RETAIN)(?=[\s\S]*REVOKE_OR_REDUCE)(?=[\s\S]*Raw PII, CCCD, bank data, voucher body)(?=[\s\S]*does not approve access, accept UAT, approve finance reliance, move money or\s+mark production GO)/i,
  "Finance Day-1 result ledger runbook",
  financeDayOneRunbookPath,
);

requireText(
  financeDayOneLedgerTemplate,
  /(?=[\s\S]*Status:\s*PASS_LOCAL_TEMPLATE)(?=[\s\S]*Production status:\s*NO-GO)(?=[\s\S]*REAL_KHTC_TTGDTX_OPERATOR_01)(?=[\s\S]*REAL_BGH_READONLY_01)(?=[\s\S]*REAL_AUDIT_READONLY_01)(?=[\s\S]*REAL_PHAP_CHE_REVIEW_01)(?=[\s\S]*REAL_OUT_OF_SCOPE_NEGATIVE_01)(?=[\s\S]*FIN_DAY1_RESULT_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*ACCESS_RETAIN \/ REVOKE_OR_REDUCE \/ BLOCKED)(?=[\s\S]*does not create accounts)(?=[\s\S]*issue bank instructions)(?=[\s\S]*mark production GO)(?=[\s\S]*No raw screenshots)(?=[\s\S]*Stop and Escalate)/i,
  "Finance Day-1 result ledger template",
  financeDayOneLedgerTemplatePath,
);

requireText(
  executionQueue,
  /(?=[\s\S]*PRODUCTION_RISK_CLOSURE_STEPS)(?=[\s\S]*data-ttgdtx-risk-closure-plan="P6-06_P2-17")(?=[\s\S]*Next risk closure plan: P6-06 \+ P2-17)(?=[\s\S]*hard-delete\/cascade conversion-or-waiver)(?=[\s\S]*payout\s+duplicate\/dossier evidence)(?=[\s\S]*Missing proof\s+keeps production NO-GO)(?=[\s\S]*closure proof required)(?=[\s\S]*Decision:[\s\S]*step\.decisionValue)(?=[\s\S]*Stop:[\s\S]*step\.stopCondition)(?=[\s\S]*Open closure route)/i,
  "TTGDTX P6-06/P2-17 risk closure plan",
  executionQueuePath,
);

requireText(
  blockerSource,
  /(?=[\s\S]*export const PRODUCTION_RISK_CLOSURE_STEPS)(?=[\s\S]*P6-06)(?=[\s\S]*Hard-delete and cascade conversion or waiver)(?=[\s\S]*HEU_NON_TTGDTX_CASCADE_FINDING_REGISTER_20260628\.md)(?=[\s\S]*P6_06_CLOSURE_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*protected finance, evidence, approval, payment, lead or audit path)(?=[\s\S]*audit:hard-delete-conversion-decision-queue)(?=[\s\S]*P2-17)(?=[\s\S]*Payout duplicate-click and dossier UAT)(?=[\s\S]*P2_17_DUPLICATE_PAYOUT_UAT_RUNBOOK\.md)(?=[\s\S]*P2_17_RELEASE_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*Payment can run twice)(?=[\s\S]*audit:ttgdtx-payout-execution-readiness)/i,
  "TTGDTX P6-06/P2-17 risk closure shared source",
  blockerSourcePath,
);

requireText(
  blockerSource,
  /P0-10[\s\S]*P0-03[\s\S]*Step90-Step110[\s\S]*P6-04[\s\S]*P0-19[\s\S]*P2-17[\s\S]*P2-18[\s\S]*P6-03[\s\S]*P6-06[\s\S]*P0-14[\s\S]*P0-15[\s\S]*Owner GO\/NO-GO/i,
  "TTGDTX production execution shared source order",
  blockerSourcePath,
);

requireText(
  blockerSource,
  /(?=[\s\S]*export const PRODUCTION_EXECUTION_STEPS)(?=[\s\S]*P0_10_REDACTION_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*P0_03_RESTORE_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*STEP90_110_MIGRATION_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*P6_04_SCOPE_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*P0_19_GATE_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*P2_17_RELEASE_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*P2_18_RELIANCE_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*P6_03_TRACE_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*P6_06_CLOSURE_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*P0_14_EVIDENCE_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*P0_15_HANDOFF_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*OWNER_GO_NO_GO_SIGNED \/ NO_GO \/ BLOCKED)(?=[\s\S]*stored only in Codex\/chat)/i,
  "TTGDTX production execution shared source decision stops",
  blockerSourcePath,
);

requireText(
  blockerSource,
  /P0-15[\s\S]*Prepare final handoff summary[\s\S]*P0-14 controlled evidence intake ledger[\s\S]*redaction reviewer[\s\S]*owner signature state[\s\S]*P6-04\/P6-03\/P6-06 proof paths and the P6-06 finding register[\s\S]*before owner decision/i,
  "TTGDTX P0-15 final handoff split evidence source",
  blockerSourcePath,
);

requireText(
  page,
  /<TtgdtxProductionReadinessGuard\s*\/>[\s\S]*<TtgdtxUatSignoffGuard\s*\/>[\s\S]*<TtgdtxProductionExecutionQueue\s*\/>[\s\S]*<TtgdtxOperatingControlStrip\b/,
  "TTGDTX landing page mounts production execution queue before operating strip",
  pagePath,
);

requireText(
  checklist,
  /Internal UAT sign-off[\s\S]*IN_PROGRESS[\s\S]*TTGDTX_UAT_OPERATOR_HANDOFF_20260627\.md[\s\S]*TTGDTX_UAT_EXECUTION_LOG_20260625\.md[\s\S]*governance UAT execution readiness for P6-04\/P6-03[\s\S]*internal UAT run closure tracker[\s\S]*ttgdtx-production-readiness-guard\.tsx[\s\S]*renders shared `PRODUCTION_BLOCKERS` from `lib\/production-readiness\.ts`[\s\S]*ttgdtx-uat-signoff-guard\.tsx[\s\S]*governance UAT execution readiness for P6-04\/P6-03[\s\S]*UAT run closure tracker[\s\S]*main execution queue with decision values and stop conditions[\s\S]*P0-03\/Step90-Step110 infra readiness plan[\s\S]*P0-19\/P3-01\/P3-02 gate-handover readiness plan[\s\S]*P6-04\/P6-03 governance assurance plan[\s\S]*P2-18\/P5-03 UAT launch plan with P6-04 real-accounting queue\/result proof, first signed finance UAT checklist and finance Day-1 real-run rehearsal[\s\S]*FIN_DAY1_READY \/ NO_GO \/ BLOCKED[\s\S]*HEU_FINANCE_DAY1_REAL_RUN_REHEARSAL_20260630\.md[\s\S]*HEU_FINANCE_DAY1_RESULT_LEDGER_TEMPLATE_20260630\.md[\s\S]*P6-06\/P2-17 risk closure plan[\s\S]*audit:ttgdtx-production-readiness-guard[\s\S]*signed multi-account UAT still required/i,
  "production checklist keeps internal UAT IN_PROGRESS with readiness guard evidence",
  checklistPath,
);

requireText(
  backlog,
  /P0-08[\s\S]*Expose TTGDTX production readiness guard in app[\s\S]*PASS_LOCAL[\s\S]*TTGDTX landing guard renders shared `PRODUCTION_BLOCKERS` from `lib\/production-readiness\.ts`[\s\S]*governance UAT execution readiness for P6-04\/P6-03[\s\S]*UAT run closure tracker[\s\S]*UAT execution closure template[\s\S]*UAT operator handoff[\s\S]*main execution queue with decision values and stop conditions[\s\S]*safe iteration loop[\s\S]*P0-03\/Step90-Step110 infra readiness plan[\s\S]*P0-19\/P3-01\/P3-02 gate-handover readiness plan[\s\S]*P6-04\/P6-03 governance assurance plan[\s\S]*P2-18\/P5-03 UAT launch plan with P6-04 real-accounting queue\/result proof, first signed finance UAT checklist and finance Day-1 real-run rehearsal[\s\S]*FIN_DAY1_READY \/ NO_GO \/ BLOCKED[\s\S]*HEU_FINANCE_DAY1_REAL_RUN_REHEARSAL_20260630\.md[\s\S]*HEU_FINANCE_DAY1_RESULT_LEDGER_TEMPLATE_20260630\.md[\s\S]*P6-06\/P2-17 risk closure plan[\s\S]*audit:ttgdtx-production-readiness-guard/i,
  "P0-08 backlog guard row",
  backlogPath,
);

if (!packageJson.scripts?.["audit:ttgdtx-production-readiness-guard"]) {
  failures.push("package.json: missing audit:ttgdtx-production-readiness-guard script");
}

requireText(
  agents,
  /npm\.cmd run audit:ttgdtx-production-readiness-guard/,
  "AGENTS final handoff audit command",
  "AGENTS.md",
);

for (const needle of [
  componentPath,
  uatGuardPath,
  executionQueuePath,
  "scripts/audit-ttgdtx-production-readiness-guard.mjs",
  "audit:ttgdtx-production-readiness-guard",
]) {
  if (!releaseGateAudit.includes(needle)) {
    failures.push(`scripts/audit-ttgdtx-release-gates.mjs: missing ${needle}`);
  }
}

if (failures.length > 0) {
  console.error("TTGDTX production readiness guard audit failed.");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(
  "TTGDTX production readiness guard audit passed. NO-GO blockers are visible in the app.",
);
