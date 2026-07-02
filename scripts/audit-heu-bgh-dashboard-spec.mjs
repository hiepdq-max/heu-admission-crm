import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const specPath = "docs/HEU_BGH_OPERATING_DASHBOARD_SPEC_20260627.md";
const blockerSourcePath = "lib/production-readiness.ts";
const blockerSummaryPath =
  "components/master-control/production-readiness-blocker-summary.tsx";
const masterControlPagePath = "app/master-control/page.tsx";
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

function requireText(contents, pattern, label, file = specPath) {
  if (!pattern.test(contents)) {
    fail(`${file}: missing ${label}`);
  }
}

const requiredFiles = [
  specPath,
  blockerSourcePath,
  ".github/workflows/heu-pass-local.yml",
  "app/page.tsx",
  "app/reports/page.tsx",
  masterControlPagePath,
  blockerSummaryPath,
  "docs/HEU_DEPARTMENT_TASK_HANDOFF_REGISTER_20260702.md",
  "docs/HEU_DAILY_EMAIL_DISPATCH_HANDOFF_20260702.md",
  "docs/HEU_MASTER_CONTROL_GOAL_REGISTER_20260702.md",
  "scripts/report-heu-email-readiness.mjs",
  "scripts/report-heu-daily-dry-run.mjs",
  "app/ttgdtx/accounting-dashboard/page.tsx",
  "docs/TTGDTX_ACCOUNTING_DASHBOARD_ROLE_UAT_PLAN_20260627.md",
  "docs/HEU_ROLE_SCOPE_UAT_EXECUTION_PACK_20260627.md",
  "docs/TTGDTX_RECEIVABLE_PAYMENT_STATUS_LIFECYCLE_POLICY_20260627.md",
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
];

for (const file of requiredFiles) {
  requireFile(file);
}

const spec = exists(specPath) ? read(specPath) : "";
const blockerSource = exists(blockerSourcePath) ? read(blockerSourcePath) : "";
const blockerSummary = exists(blockerSummaryPath) ? read(blockerSummaryPath) : "";
const masterControlPage = exists(masterControlPagePath)
  ? read(masterControlPagePath)
  : "";
const currentStateInventory = read("docs/HEU_CURRENT_STATE_INVENTORY.md");
const implementationLog = read("docs/HEU_IMPLEMENTATION_LOG.md");
const dailyReportScript = read("scripts/report-heu-daily-dry-run.mjs");
const emailReadinessScript = read("scripts/report-heu-email-readiness.mjs");
const passLocalWorkflow = read(".github/workflows/heu-pass-local.yml");
const departmentTaskRegister = read(
  "docs/HEU_DEPARTMENT_TASK_HANDOFF_REGISTER_20260702.md",
);
const emailDispatchHandoff = read(
  "docs/HEU_DAILY_EMAIL_DISPATCH_HANDOFF_20260702.md",
);
const masterControlGoalRegister = read(
  "docs/HEU_MASTER_CONTROL_GOAL_REGISTER_20260702.md",
);

requireText(spec, /P5-02 BGH operating dashboard specification/i, "P5-02 scope");
requireText(spec, /NO-GO until source workflows, role-scope UAT and owner\s+sign-off are complete/i, "production NO-GO boundary");
requireText(spec, /executive\s+read-only control surface/i, "read-only executive surface");
requireText(spec, /not a daily data-entry screen/i, "not daily data-entry rule");
requireText(spec, /Workflow before dashboard[\s\S]*Locked\/approved facts before conclusion[\s\S]*Exception first[\s\S]*Scope aware[\s\S]*Read-only by default/i, "design principles");
requireText(spec, /Admission pipeline[\s\S]*TTGDTX finance cockpit[\s\S]*Go\/No-Go readiness[\s\S]*Risk and exception board[\s\S]*Source\/evidence health[\s\S]*Role\/scope health[\s\S]*AI advisory health/i, "dashboard section coverage");
requireText(spec, /Lead conversion[\s\S]*Handover backlog[\s\S]*Receivable total[\s\S]*Collected total[\s\S]*Reconciliation health[\s\S]*Partner payable[\s\S]*Exception count[\s\S]*Production blockers/i, "minimum KPI set");
requireText(spec, /BGH should not be the daily data-entry role/i, "BGH posture");
requireText(spec, /must not expose row-level PII, raw bank data, credentials,\s+passwords, temporary passwords, OTPs, password reset links, account\s+activation\/invite links, service keys, unredacted source files or private\s+contract terms/i, "privacy rule");
requireText(spec, /A dashboard card can mutate business or finance state/i, "mutation stop condition");
requireText(spec, /production checklist remains\s+NO-GO/i, "GO/NO-GO stop condition");
requireText(
  spec,
  /(?=[\s\S]*P5-02 Read-Only Blocker Summary)(?=[\s\S]*production-readiness-blocker-summary\.tsx)(?=[\s\S]*data-heu-production-blocker-summary="P5-02")(?=[\s\S]*data-heu-production-safe-iteration-loop="P5-02")(?=[\s\S]*data-heu-production-action-queue="P5-02")(?=[\s\S]*Safe iteration loop)(?=[\s\S]*Next controlled actions)(?=[\s\S]*P0-14 intake-ledger evidence binder closure)(?=[\s\S]*P0-15 final\s+handoff summary)(?=[\s\S]*No GO button is provided)/i,
  "read-only blocker summary implementation note",
);
requireText(
  spec,
  /(?=[\s\S]*data-heu-daily-report-task-handoff="P5-02")(?=[\s\S]*DAILY_REPORT_DRY_RUN \/ NO_GO \/ BLOCKED)(?=[\s\S]*build progress, controlled trial users and plain-language\s+glossary)(?=[\s\S]*IT_DATA, KHTC, BGH, Audit and Phap Che)(?=[\s\S]*does not send email, create real tasks, store\s+passwords, OTPs, invite\/reset links, bank data, raw PII or approve UAT,\s+finance action, owner GO or production GO)(?=[\s\S]*npm\.cmd run report:heu-daily-dry-run)(?=[\s\S]*GitHub Actions step summary)(?=[\s\S]*without sending mail)(?=[\s\S]*HEU_MASTER_CONTROL_GOAL_REGISTER_20260702\.md)(?=[\s\S]*MASTER_GOAL_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*phase order A-E)(?=[\s\S]*cloud\s+PASS_LOCAL boundary)(?=[\s\S]*Build Agent, QA\/Audit Agent, Data Check Agent, Finance Trial Support,\s+UAT\/Evidence Coordinator, Report\/Email Coordinator and Human Authority Owner)(?=[\s\S]*does not self-code, self-deploy,\s+send real email, create real tasks\/users, approve UAT, accept evidence,\s+approve finance\/owner decisions or mark production GO)(?=[\s\S]*npm\.cmd run report:heu-email-readiness)(?=[\s\S]*EMAIL_DRY_RUN_READY \/ EMAIL_CONFIG_REQUIRED \/ BLOCKED)(?=[\s\S]*hides values, does not send mail)/i,
  "daily report and task handoff dry-run implementation note",
);
requireText(
  spec,
  /(?=[\s\S]*blocker-owner lanes sourced from)(?=[\s\S]*lib\/production-readiness\.ts)(?=[\s\S]*PRODUCTION_BLOCKERS)(?=[\s\S]*BLOCKER_OWNER_LANES_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*P0-03, Step90-Step110, P0-19,\s+P2-17, P2-18, P6-04, P6-03, P6-06, P0-10 and P0-09)(?=[\s\S]*responsible\s+owner labels)(?=[\s\S]*outside\s+Git\/Codex\/chat)(?=[\s\S]*does not send email, create real\s+tasks\/tickets, accept evidence, execute UAT, approve finance action, approve\s+owner GO\/NO-GO or mark production GO)/i,
  "daily report blocker-owner lanes implementation note",
);
requireText(
  spec,
  /(?=[\s\S]*signed UAT route summary from)(?=[\s\S]*TTGDTX_UAT_EXECUTION_LOG_20260625\.md)(?=[\s\S]*Section 5\.2)(?=[\s\S]*TTGDTX_SIGNED_UAT_EXECUTION_ROUTING_HUB_20260628\.md)(?=[\s\S]*SIGNED_UAT_ROUTE_SUMMARY_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*UAT-ROUTE-01 through\s+UAT-ROUTE-11)(?=[\s\S]*PENDING status)(?=[\s\S]*owner labels)(?=[\s\S]*minimum proof)(?=[\s\S]*outside Git\/Codex\/chat)(?=[\s\S]*does not send email, create real tasks\/tickets,\s+accept evidence, execute UAT, approve finance action, approve owner GO\/NO-GO\s+or mark production GO)/i,
  "daily report signed UAT route summary implementation note",
);
requireText(
  spec,
  /(?=[\s\S]*HEU_DEPARTMENT_TASK_HANDOFF_REGISTER_20260702\.md)(?=[\s\S]*data-heu-department-task-handoff-register="P5-02")(?=[\s\S]*DEPT_TASK_REGISTER_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*BGH, IT_DATA, KHTC, PHAP_CHE, Audit, TUYEN_SINH, CTHSSV, DAO_TAO and HR)(?=[\s\S]*user labels, stage, in-app task, how the user uses it, required\s+external proof and stop condition)(?=[\s\S]*does not send real email, create real tickets, assign\s+real accounts, accept evidence, execute UAT, approve finance action, approve\s+owner GO or mark production GO)/i,
  "department task handoff register implementation note",
);
requireText(
  spec,
  /(?=[\s\S]*HEU_DAILY_EMAIL_DISPATCH_HANDOFF_20260702\.md)(?=[\s\S]*EMAIL_DISPATCH_HANDOFF_READY \/ EMAIL_CONFIG_REQUIRED \/ BLOCKED)(?=[\s\S]*required owner approvals)(?=[\s\S]*allowed recipient labels)(?=[\s\S]*manual enablement steps)(?=[\s\S]*stop conditions)(?=[\s\S]*does\s+not store recipient addresses, SMTP values or secrets in Git\/Codex\/chat)(?=[\s\S]*does\s+not send mail)(?=[\s\S]*does\s+not approve UAT,\s+evidence, finance action, owner GO\/NO-GO or production GO)/i,
  "daily email dispatch handoff implementation note",
);
requireText(spec, /P5-02 is PASS_LOCAL[\s\S]*does not implement a production BGH\s+dashboard[\s\S]*replace signed UAT/i, "PASS_LOCAL local-only boundary");

requireText(
  departmentTaskRegister,
  /(?=[\s\S]*Status:\s*PASS_LOCAL_DRY_RUN)(?=[\s\S]*DEPT_TASK_REGISTER_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*BGH_READONLY_REVIEWER_LABEL)(?=[\s\S]*IT_DATA_BUILD_OPERATOR_LABEL)(?=[\s\S]*KHTC_ACCOUNTING_OPERATOR_LABEL)(?=[\s\S]*PHAP_CHE_REVIEWER_LABEL)(?=[\s\S]*AUDIT_READONLY_REVIEWER_LABEL)(?=[\s\S]*TUYEN_SINH_OPERATOR_LABEL)(?=[\s\S]*CTHSSV_HANDOVER_OPERATOR_LABEL)(?=[\s\S]*DAO_TAO_REVIEWER_LABEL)(?=[\s\S]*HR_REVIEWER_LABEL)(?=[\s\S]*does not send email, create real tasks,\s+assign real user accounts)(?=[\s\S]*Forbidden Content)(?=[\s\S]*Passwords, temporary passwords, OTPs)(?=[\s\S]*Bank statements, vouchers, raw payment data)(?=[\s\S]*does not\s+approve production, UAT, evidence, finance action, access creation, email\s+sending, task automation or owner GO\/NO-GO)/i,
  "department task handoff register dry-run boundary",
  "docs/HEU_DEPARTMENT_TASK_HANDOFF_REGISTER_20260702.md",
);
requireText(
  emailDispatchHandoff,
  /(?=[\s\S]*Status:\s*PASS_LOCAL_CONFIG_HANDOFF)(?=[\s\S]*EMAIL_DISPATCH_HANDOFF_READY \/ EMAIL_CONFIG_REQUIRED \/ BLOCKED)(?=[\s\S]*HEU_DAILY_REPORT_TO)(?=[\s\S]*HEU_SMTP_PASSWORD)(?=[\s\S]*BGH_DAILY_REPORT_ALIAS)(?=[\s\S]*KHTC_CONTROLLED_TRIAL_ALIAS)(?=[\s\S]*EMAIL-DISPATCH-01)(?=[\s\S]*EMAIL-DISPATCH-06)(?=[\s\S]*does not send email, create real tasks)(?=[\s\S]*does not approve production, UAT, evidence acceptance, finance approval,\s+owner GO\/NO-GO or production GO)(?=[\s\S]*Production remains NO-GO)/i,
  "daily email dispatch handoff config boundary",
  "docs/HEU_DAILY_EMAIL_DISPATCH_HANDOFF_20260702.md",
);

requireText(
  blockerSummary,
  /(?=[\s\S]*SAFE_ITERATION_STEPS)(?=[\s\S]*data-heu-production-blocker-summary="P5-02")(?=[\s\S]*P5-02 production blocker summary)(?=[\s\S]*PASS_LOCAL only)(?=[\s\S]*Read-only BGH\/owner view)(?=[\s\S]*Production remains NO-GO until backup\/restore, migration order,\s+legal\/finance UAT, payout UAT, dashboard UAT, role-scope UAT,\s+audit-log UAT, hard-delete conversion\/waiver, redaction, P0-14\s+intake-ledger evidence binder, P0-15 final handoff summary and\s+final owner sign-off are completed outside Codex\/chat)(?=[\s\S]*PRODUCTION_BLOCKERS)(?=[\s\S]*PRODUCTION_EXECUTION_STEPS)(?=[\s\S]*data-heu-production-safe-iteration-loop="P5-02")(?=[\s\S]*Safe iteration loop)(?=[\s\S]*Master Control follows the same rhythm as TTGDTX)(?=[\s\S]*data-heu-production-action-queue="P5-02")(?=[\s\S]*Next controlled actions)(?=[\s\S]*P0-14\s+intake-ledger evidence binder)(?=[\s\S]*P0-15 final handoff summary)(?=[\s\S]*owner GO\/NO-GO discussion)(?=[\s\S]*Current recommendation:[\s\S]*NO-GO)(?=[\s\S]*No GO button is provided here)(?=[\s\S]*PASS_LOCAL does not approve production\s+dashboard use, finance actions, production migration, UAT acceptance,\s+owner waiver or production GO)(?=[\s\S]*secrets, passwords,\s+temporary passwords, OTPs, password reset links, account\s+activation\/invite links, service-role keys, bank credentials, raw\s+student PII, raw CCCD, raw phone numbers, raw bank account numbers,\s+bank statements, vouchers or raw payment data)/i,
  "P5-02 production blocker summary UI shell",
  blockerSummaryPath,
);
requireText(
  blockerSummary,
  /(?=[\s\S]*DAILY_REPORT_LINES)(?=[\s\S]*TASK_HANDOFF_LANES)(?=[\s\S]*data-heu-daily-report-task-handoff="P5-02")(?=[\s\S]*Daily report and task handoff: dry-run only)(?=[\s\S]*DAILY_REPORT_DRY_RUN \/ NO_GO \/ BLOCKED)(?=[\s\S]*does not send email, create real tasks, store secrets or approve\s+any business decision)(?=[\s\S]*DRY-RUN-REPORT-01)(?=[\s\S]*DRY-RUN-REPORT-03)(?=[\s\S]*TASK-HANDOFF-02)(?=[\s\S]*Khong nhap mat khau, OTP, invite\/reset link)(?=[\s\S]*Khong coi PASS_LOCAL la UAT signed, finance approved, owner GO hoac production GO)/i,
  "P5-02 daily report and task handoff UI shell",
  blockerSummaryPath,
);
requireText(
  blockerSummary,
  /(?=[\s\S]*DEPARTMENT_TASK_HANDOFF_REGISTER)(?=[\s\S]*data-heu-department-task-handoff-register="P5-02")(?=[\s\S]*Department task handoff register: dry-run only)(?=[\s\S]*DEPT_TASK_REGISTER_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*BGH_READONLY_REVIEWER_LABEL)(?=[\s\S]*IT_DATA_BUILD_OPERATOR_LABEL)(?=[\s\S]*KHTC_ACCOUNTING_OPERATOR_LABEL)(?=[\s\S]*PHAP_CHE_REVIEWER_LABEL)(?=[\s\S]*AUDIT_READONLY_REVIEWER_LABEL)(?=[\s\S]*TUYEN_SINH_OPERATOR_LABEL)(?=[\s\S]*CTHSSV_HANDOVER_OPERATOR_LABEL)(?=[\s\S]*DAO_TAO_REVIEWER_LABEL \/ HR_REVIEWER_LABEL)(?=[\s\S]*no real email, real ticket, account creation, evidence\s+acceptance, UAT approval, finance approval or owner GO)/i,
  "P5-02 department task handoff UI shell",
  blockerSummaryPath,
);
requireText(
  masterControlGoalRegister,
  /(?=[\s\S]*Status:\s*PASS_LOCAL_GOAL_CONTROL)(?=[\s\S]*MASTER_GOAL_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*Continuous Build Goal When Local Machine Is Off)(?=[\s\S]*Expert Team Build Goal)(?=[\s\S]*Build Phases)(?=[\s\S]*Required Reporting Style)(?=[\s\S]*Production remains NO-GO)/i,
  "Master Control goal register source for daily report",
  "docs/HEU_MASTER_CONTROL_GOAL_REGISTER_20260702.md",
);
requireText(
  dailyReportScript,
  /(?=[\s\S]*HEU daily PASS_LOCAL report draft)(?=[\s\S]*Mode: DRY_RUN only - no email sent, no real task created)(?=[\s\S]*Production: NO-GO)(?=[\s\S]*Muc tieu tong chi huy)(?=[\s\S]*MASTER_GOAL_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*HEU_MASTER_CONTROL_GOAL_REGISTER_20260702\.md)(?=[\s\S]*Khi may tinh tat)(?=[\s\S]*GitHub Actions co the chay PASS_LOCAL, audit, lint, build va report summary; khong tu code, tu deploy, tu approve)(?=[\s\S]*Thu tu giai doan)(?=[\s\S]*A Clean\/package dirty scope)(?=[\s\S]*E Remaining blockers)(?=[\s\S]*Build Agent, QA\/Audit Agent, Data Check Agent, Finance Trial Support)(?=[\s\S]*Human Authority Owner)(?=[\s\S]*khong production GO, khong email\/nhiem vu\/user that, khong UAT\/evidence\/finance\/owner approval)(?=[\s\S]*Nguoi dung thu va cach su dung)(?=[\s\S]*KHTC_ACCOUNTING_OPERATOR_LABEL)(?=[\s\S]*BGH_READONLY_REVIEWER_LABEL)(?=[\s\S]*AUDIT_READONLY_REVIEWER_LABEL)(?=[\s\S]*PHAP_CHE_REVIEWER_LABEL)(?=[\s\S]*Chu thich tu IT)(?=[\s\S]*PASS_LOCAL)(?=[\s\S]*Audit)(?=[\s\S]*Lint)(?=[\s\S]*Build)(?=[\s\S]*UAT)(?=[\s\S]*NO-GO)(?=[\s\S]*Viec theo tung phong\/user label)(?=[\s\S]*DEPT_TASK_REGISTER_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*IT_DATA_BUILD_OPERATOR_LABEL)(?=[\s\S]*TUYEN_SINH_OPERATOR_LABEL)(?=[\s\S]*CTHSSV_HANDOVER_OPERATOR_LABEL)(?=[\s\S]*DAO_TAO_REVIEWER_LABEL \/ HR_REVIEWER_LABEL)(?=[\s\S]*Blocker theo phong\/owner)(?=[\s\S]*BLOCKER_OWNER_LANES_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*lib\/production-readiness\.ts -> PRODUCTION_BLOCKERS)(?=[\s\S]*Signed UAT route summary)(?=[\s\S]*SIGNED_UAT_ROUTE_SUMMARY_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*TTGDTX_UAT_EXECUTION_LOG_20260625\.md Section 5\.2)(?=[\s\S]*TTGDTX_SIGNED_UAT_EXECUTION_ROUTING_HUB_20260628\.md)(?=[\s\S]*UAT-ROUTE-01)(?=[\s\S]*UAT-ROUTE-11)(?=[\s\S]*PENDING)(?=[\s\S]*no email sent, no real task created, no evidence accepted, no UAT approved)(?=[\s\S]*P0-03)(?=[\s\S]*Step90-Step110)(?=[\s\S]*P0-19)(?=[\s\S]*P2-17)(?=[\s\S]*P2-18)(?=[\s\S]*P6-04)(?=[\s\S]*P6-03)(?=[\s\S]*P6-06)(?=[\s\S]*P0-10)(?=[\s\S]*P0-09)(?=[\s\S]*passwords, OTPs, invite\/reset links, service-role keys, bank credentials, raw PII, bank statements, vouchers hoac raw payment data)/i,
  "P5-02 daily report dry-run script",
  "scripts/report-heu-daily-dry-run.mjs",
);
requireText(
  emailReadinessScript,
  /(?=[\s\S]*HEU daily email readiness check)(?=[\s\S]*EMAIL_DRY_RUN_READY)(?=[\s\S]*EMAIL_CONFIG_REQUIRED)(?=[\s\S]*EMAIL_DISPATCH_HANDOFF_READY)(?=[\s\S]*BLOCKED)(?=[\s\S]*READINESS_ONLY - no email is sent by this script)(?=[\s\S]*HEU_DAILY_EMAIL_DISPATCH_HANDOFF_20260702\.md)(?=[\s\S]*HEU_DAILY_REPORT_TO)(?=[\s\S]*HEU_DAILY_REPORT_FROM)(?=[\s\S]*HEU_SMTP_HOST)(?=[\s\S]*HEU_SMTP_PASSWORD)(?=[\s\S]*value is hidden)(?=[\s\S]*Required approval owners)(?=[\s\S]*Allowed recipient labels)(?=[\s\S]*Manual enablement steps)(?=[\s\S]*Stop conditions)(?=[\s\S]*BGH_DAILY_REPORT_ALIAS)(?=[\s\S]*EMAIL-DISPATCH-06)(?=[\s\S]*GitHub Actions secrets\/variables outside Git\/Codex\/chat)(?=[\s\S]*passwords, app passwords, OTPs, invite\/reset links, service-role keys, bank credentials, raw PII, bank statements, vouchers or raw payment data)/i,
  "P5-02 daily email readiness script",
  "scripts/report-heu-email-readiness.mjs",
);
requireText(
  passLocalWorkflow,
  /node scripts\/report-heu-daily-dry-run\.mjs >> "\$GITHUB_STEP_SUMMARY"/,
  "PASS_LOCAL workflow daily report summary hook",
  ".github/workflows/heu-pass-local.yml",
);
requireText(
  passLocalWorkflow,
  /node scripts\/report-heu-email-readiness\.mjs >> "\$GITHUB_STEP_SUMMARY"/,
  "PASS_LOCAL workflow email readiness summary hook",
  ".github/workflows/heu-pass-local.yml",
);

requireText(
  blockerSource,
  /P0-03[\s\S]*Step90-Step110[\s\S]*P0-19[\s\S]*P2-17[\s\S]*P2-18[\s\S]*P6-04[\s\S]*P6-03[\s\S]*P6-06[\s\S]*P0-10[\s\S]*P0-09/i,
  "P5-02 production blocker shared source coverage",
  blockerSourcePath,
);

requireText(
  masterControlPage,
  /ProductionReadinessBlockerSummary[\s\S]*<ProductionReadinessBlockerSummary\s*\/>[\s\S]*<HeuOsVisualNavigationMap/i,
  "Master Control mounts production blocker summary before navigation map",
  masterControlPagePath,
);

const accountingPlan = read("docs/TTGDTX_ACCOUNTING_DASHBOARD_ROLE_UAT_PLAN_20260627.md");
requireText(
  accountingPlan,
  /The dashboard must not:[\s\S]*Create receivables[\s\S]*Execute payout[\s\S]*Mark production GO/i,
  "accounting dashboard read-only boundary",
  "docs/TTGDTX_ACCOUNTING_DASHBOARD_ROLE_UAT_PLAN_20260627.md",
);

const rolePack = read("docs/HEU_ROLE_SCOPE_UAT_EXECUTION_PACK_20260627.md");
requireText(
  rolePack,
  /UAT_BGH[\s\S]*Read dashboards and approved summary views[\s\S]*Daily entry, payment execution, hidden source evidence/i,
  "BGH role-scope UAT row",
  "docs/HEU_ROLE_SCOPE_UAT_EXECUTION_PACK_20260627.md",
);

const accountingPage = read("app/ttgdtx/accounting-dashboard/page.tsx");
requireText(
  accountingPage,
  /roleCode === "ADMIN" \|\| roleCode === "BGH"[\s\S]*hasReportsReadAll/i,
  "BGH/report access guard",
  "app/ttgdtx/accounting-dashboard/page.tsx",
);
requireText(
  accountingPage,
  /if \(canOpen\)[\s\S]*ttgdtx_accounting_dashboard_summary/i,
  "dashboard queries after canOpen",
  "app/ttgdtx/accounting-dashboard/page.tsx",
);

const packageJson = JSON.parse(read("package.json"));
if (!packageJson.scripts?.["audit:heu-bgh-dashboard-spec"]) {
  fail("package.json: missing audit:heu-bgh-dashboard-spec script");
}
if (packageJson.scripts?.["report:heu-daily-dry-run"] !== "node scripts/report-heu-daily-dry-run.mjs") {
  fail("package.json: missing report:heu-daily-dry-run script");
}
if (packageJson.scripts?.["report:heu-email-readiness"] !== "node scripts/report-heu-email-readiness.mjs") {
  fail("package.json: missing report:heu-email-readiness script");
}

const backlog = read("docs/HEU_SYSTEM_BUILD_BACKLOG.md");
if (!/P5-02[\s\S]*PASS_LOCAL[\s\S]*HEU_BGH_OPERATING_DASHBOARD_SPEC_20260627\.md[\s\S]*production-readiness-blocker-summary\.tsx[\s\S]*safe iteration loop[\s\S]*next controlled actions queue includes P0-14 intake-ledger evidence binder and P0-15 final handoff summary[\s\S]*audit:heu-bgh-dashboard-spec/.test(backlog)) {
  fail("Backlog P5-02 must be PASS_LOCAL and reference BGH dashboard spec audit.");
}
if (!/P5-02[\s\S]*HEU_DEPARTMENT_TASK_HANDOFF_REGISTER_20260702\.md[\s\S]*HEU_DAILY_EMAIL_DISPATCH_HANDOFF_20260702\.md[\s\S]*scripts\/report-heu-daily-dry-run\.mjs[\s\S]*scripts\/report-heu-email-readiness\.mjs[\s\S]*daily report\/task handoff dry-run shell[\s\S]*DAILY_REPORT_DRY_RUN \/ NO_GO \/ BLOCKED[\s\S]*department task handoff register[\s\S]*DEPT_TASK_REGISTER_READY \/ NO_GO \/ BLOCKED[\s\S]*EMAIL_DRY_RUN_READY \/ EMAIL_CONFIG_REQUIRED \/ BLOCKED[\s\S]*EMAIL_DISPATCH_HANDOFF_READY \/ EMAIL_CONFIG_REQUIRED \/ BLOCKED[\s\S]*npm\.cmd run report:heu-daily-dry-run[\s\S]*npm\.cmd run report:heu-email-readiness[\s\S]*no email is sent, no real task\/ticket is created[\s\S]*no real account is assigned/i.test(backlog)) {
  fail("Backlog P5-02 must reference the daily report/task handoff dry-run shell.");
}
if (!/P5-02[\s\S]*HEU_MASTER_CONTROL_GOAL_REGISTER_20260702\.md[\s\S]*MASTER_GOAL_READY \/ NO_GO \/ BLOCKED[\s\S]*phase order A-E[\s\S]*cloud PASS_LOCAL boundary[\s\S]*expert-team lanes[\s\S]*no UAT\/evidence\/finance\/owner decision is approved[\s\S]*no production GO is marked/i.test(backlog)) {
  fail("Backlog P5-02 must reference the Master Control goal daily report summary.");
}
if (!/P5-02[\s\S]*lib\/production-readiness\.ts[\s\S]*PRODUCTION_BLOCKERS[\s\S]*BLOCKER_OWNER_LANES_READY \/ NO_GO \/ BLOCKED[\s\S]*P0-03, Step90-Step110, P0-19, P2-17, P2-18, P6-04, P6-03, P6-06, P0-10 and P0-09[\s\S]*no evidence is accepted[\s\S]*no production GO is marked/i.test(backlog)) {
  fail("Backlog P5-02 must reference the daily report blocker-owner lanes.");
}
if (!/P5-02[\s\S]*TTGDTX_UAT_EXECUTION_LOG_20260625\.md[\s\S]*Section 5\.2[\s\S]*TTGDTX_SIGNED_UAT_EXECUTION_ROUTING_HUB_20260628\.md[\s\S]*SIGNED_UAT_ROUTE_SUMMARY_READY \/ NO_GO \/ BLOCKED[\s\S]*UAT-ROUTE-01 through UAT-ROUTE-11[\s\S]*PENDING status[\s\S]*owner labels and minimum proof[\s\S]*no evidence is accepted[\s\S]*no production GO is marked/i.test(backlog)) {
  fail("Backlog P5-02 must reference the daily report signed UAT route summary.");
}
if (!/P0-02[\s\S]*npm\.cmd run report:heu-daily-dry-run[\s\S]*npm\.cmd run report:heu-email-readiness[\s\S]*scheduled summary appends a dry-run daily report draft plus email readiness checklist but does not send email/i.test(backlog)) {
  fail("Backlog P0-02 must reference the PASS_LOCAL daily report dry-run summary.");
}

const checklist = read("docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md");
if (!/BGH operating dashboard specification[\s\S]*PASS_LOCAL[\s\S]*HEU_BGH_OPERATING_DASHBOARD_SPEC_20260627\.md[\s\S]*production-readiness-blocker-summary\.tsx[\s\S]*safe iteration loop[\s\S]*next controlled actions queue includes P0-14 intake-ledger evidence binder and P0-15 final handoff summary/.test(checklist)) {
  fail("Production checklist must include BGH operating dashboard specification PASS_LOCAL evidence.");
}
if (!/BGH operating dashboard specification[\s\S]*HEU_DEPARTMENT_TASK_HANDOFF_REGISTER_20260702\.md[\s\S]*HEU_DAILY_EMAIL_DISPATCH_HANDOFF_20260702\.md[\s\S]*scripts\/report-heu-daily-dry-run\.mjs[\s\S]*scripts\/report-heu-email-readiness\.mjs[\s\S]*daily report\/task handoff dry-run shell[\s\S]*DAILY_REPORT_DRY_RUN \/ NO_GO \/ BLOCKED[\s\S]*department task handoff register[\s\S]*DEPT_TASK_REGISTER_READY \/ NO_GO \/ BLOCKED[\s\S]*EMAIL_DRY_RUN_READY \/ EMAIL_CONFIG_REQUIRED \/ BLOCKED[\s\S]*EMAIL_DISPATCH_HANDOFF_READY \/ EMAIL_CONFIG_REQUIRED \/ BLOCKED[\s\S]*npm\.cmd run report:heu-daily-dry-run[\s\S]*npm\.cmd run report:heu-email-readiness[\s\S]*no production dashboard implementation, real email sending, real task\/ticket creation, real account assignment[\s\S]*GO decision/i.test(checklist)) {
  fail("Production checklist must keep the BGH daily report/task handoff in dry-run mode.");
}
if (!/BGH operating dashboard specification[\s\S]*HEU_MASTER_CONTROL_GOAL_REGISTER_20260702\.md[\s\S]*MASTER_GOAL_READY \/ NO_GO \/ BLOCKED[\s\S]*phase order A-E[\s\S]*cloud PASS_LOCAL boundary[\s\S]*expert-team lanes[\s\S]*no production dashboard implementation, real email sending, real task\/ticket creation, real account assignment[\s\S]*UAT\/evidence\/finance\/owner approval or GO decision/i.test(checklist)) {
  fail("Production checklist must keep the Master Control goal daily report summary in dry-run mode.");
}
if (!/BGH operating dashboard specification[\s\S]*lib\/production-readiness\.ts[\s\S]*PRODUCTION_BLOCKERS[\s\S]*BLOCKER_OWNER_LANES_READY \/ NO_GO \/ BLOCKED[\s\S]*P0-03, Step90-Step110, P0-19, P2-17, P2-18, P6-04, P6-03, P6-06, P0-10 and P0-09[\s\S]*no production dashboard implementation, real email sending, real task\/ticket creation, real account assignment, evidence acceptance, UAT\/evidence\/finance\/owner approval or GO decision/i.test(checklist)) {
  fail("Production checklist must keep the daily report blocker-owner lanes in dry-run mode.");
}
if (!/BGH operating dashboard specification[\s\S]*TTGDTX_UAT_EXECUTION_LOG_20260625\.md[\s\S]*Section 5\.2[\s\S]*TTGDTX_SIGNED_UAT_EXECUTION_ROUTING_HUB_20260628\.md[\s\S]*SIGNED_UAT_ROUTE_SUMMARY_READY \/ NO_GO \/ BLOCKED[\s\S]*UAT-ROUTE-01 through UAT-ROUTE-11[\s\S]*PENDING status[\s\S]*owner labels and minimum proof[\s\S]*no production dashboard implementation, real email sending, real task\/ticket creation, real account assignment, evidence acceptance, UAT\/evidence\/finance\/owner approval or GO decision/i.test(checklist)) {
  fail("Production checklist must keep the daily report signed UAT route summary in dry-run mode.");
}

if (!/\.github\/workflows\/heu-pass-local\.yml[\s\S]*report:heu-daily-dry-run[\s\S]*report:heu-email-readiness[\s\S]*email readiness checklist[\s\S]*without sending email/i.test(currentStateInventory)) {
  fail("Current-state inventory must mention the PASS_LOCAL daily report dry-run summary hook.");
}
if (!/Accounting dashboard \/ BGH control[\s\S]*daily report\/task handoff dry-run[\s\S]*HEU_DEPARTMENT_TASK_HANDOFF_REGISTER_20260702\.md[\s\S]*department\/user-label task lanes[\s\S]*without sending email, creating real tasks\/tickets, assigning real accounts[\s\S]*approving UAT\/finance\/owner GO/i.test(currentStateInventory)) {
  fail("Current-state inventory must mention the P5-02 daily report/task handoff dry-run boundary.");
}
if (!/Accounting dashboard \/ BGH control[\s\S]*HEU_DAILY_EMAIL_DISPATCH_HANDOFF_20260702\.md[\s\S]*daily email dispatch handoff[\s\S]*allowed recipient labels[\s\S]*manual enablement steps[\s\S]*without sending email, creating real tasks\/tickets, assigning real accounts[\s\S]*approving UAT\/finance\/owner GO/i.test(currentStateInventory)) {
  fail("Current-state inventory must mention the P5-02 daily email dispatch handoff boundary.");
}
if (!/M10 Dashboard[\s\S]*HEU_MASTER_CONTROL_GOAL_REGISTER_20260702\.md[\s\S]*MASTER_GOAL_READY \/ NO_GO \/ BLOCKED[\s\S]*phase order A-E[\s\S]*cloud PASS_LOCAL boundary[\s\S]*expert-team lanes[\s\S]*no real email sending, no real task\/ticket creation and no real account assignment/i.test(currentStateInventory)) {
  fail("Current-state inventory must mention the Master Control goal daily report summary.");
}
if (!/Accounting dashboard \/ BGH control[\s\S]*Master Control goal status[\s\S]*phase order A-E[\s\S]*cloud PASS_LOCAL boundary[\s\S]*expert-team lanes[\s\S]*without sending email, creating real tasks\/tickets, assigning real accounts[\s\S]*approving UAT\/finance\/owner GO/i.test(currentStateInventory)) {
  fail("Current-state inventory must mention the P5-02 daily report Master Control goal status boundary.");
}
if (!/M10 Dashboard[\s\S]*lib\/production-readiness\.ts[\s\S]*PRODUCTION_BLOCKERS[\s\S]*BLOCKER_OWNER_LANES_READY \/ NO_GO \/ BLOCKED[\s\S]*P0-03, Step90-Step110, P0-19, P2-17, P2-18, P6-04, P6-03, P6-06, P0-10 and P0-09[\s\S]*no real email sending, no real task\/ticket creation and no real account assignment/i.test(currentStateInventory)) {
  fail("Current-state inventory must mention the P5-02 daily report blocker-owner lanes.");
}
if (!/M10 Dashboard[\s\S]*TTGDTX_UAT_EXECUTION_LOG_20260625\.md[\s\S]*Section 5\.2[\s\S]*TTGDTX_SIGNED_UAT_EXECUTION_ROUTING_HUB_20260628\.md[\s\S]*SIGNED_UAT_ROUTE_SUMMARY_READY \/ NO_GO \/ BLOCKED[\s\S]*UAT-ROUTE-01 through UAT-ROUTE-11[\s\S]*PENDING status[\s\S]*no real email sending, no real task\/ticket creation and no real account assignment/i.test(currentStateInventory)) {
  fail("Current-state inventory must mention the P5-02 daily report signed UAT route summary.");
}
if (!/Accounting dashboard \/ BGH control[\s\S]*blocker-owner lanes[\s\S]*without sending email, creating real tasks\/tickets, assigning real accounts, accepting evidence or approving UAT\/finance\/owner GO/i.test(currentStateInventory)) {
  fail("Current-state inventory must mention the P5-02 blocker-owner lane dry-run boundary.");
}
if (!/Accounting dashboard \/ BGH control[\s\S]*signed UAT route summary[\s\S]*UAT-ROUTE-01 through UAT-ROUTE-11 still PENDING[\s\S]*without sending email, creating real tasks\/tickets, assigning real accounts, accepting evidence or approving UAT\/finance\/owner GO/i.test(currentStateInventory)) {
  fail("Current-state inventory must mention the P5-02 signed UAT route summary dry-run boundary.");
}

if (!/P5-02 Daily Report And Task Handoff Dry-Run[\s\S]*data-heu-daily-report-task-handoff="P5-02"[\s\S]*DAILY_REPORT_DRY_RUN \/ NO_GO \/ BLOCKED[\s\S]*does not send real\s+email, create real tasks[\s\S]*approve owner GO or mark\s+production GO/i.test(implementationLog)) {
  fail("Implementation log must record the P5-02 daily report/task handoff dry-run boundary.");
}
if (!/HEU Daily Report Draft Generator[\s\S]*scripts\/report-heu-daily-dry-run\.mjs[\s\S]*npm\.cmd run report:heu-daily-dry-run[\s\S]*GitHub Actions step summary[\s\S]*does not send email, create real tasks[\s\S]*approve owner GO or\s+mark production GO/i.test(implementationLog)) {
  fail("Implementation log must record the daily report draft generator boundary.");
}
if (!/HEU Daily Email Readiness Checker[\s\S]*scripts\/report-heu-email-readiness\.mjs[\s\S]*report:heu-email-readiness[\s\S]*EMAIL_DRY_RUN_READY[\s\S]*EMAIL_CONFIG_REQUIRED[\s\S]*BLOCKED[\s\S]*hiding all values[\s\S]*email readiness checklist after the daily report draft[\s\S]*does not send email[\s\S]*approve owner GO or mark production GO/i.test(implementationLog)) {
  fail("Implementation log must record the email readiness checker boundary.");
}
if (!/P5-02 Daily Email Dispatch Handoff Guard[\s\S]*HEU_DAILY_EMAIL_DISPATCH_HANDOFF_20260702\.md[\s\S]*PASS_LOCAL_CONFIG_HANDOFF[\s\S]*EMAIL_DISPATCH_HANDOFF_READY \/ EMAIL_CONFIG_REQUIRED \/ BLOCKED[\s\S]*scripts\/report-heu-email-readiness\.mjs[\s\S]*required approval owners[\s\S]*allowed recipient labels[\s\S]*manual enablement\s+steps and stop conditions[\s\S]*does not send real\s+email, create real tasks\/tickets, assign real accounts[\s\S]*execute UAT,\s+accept\s+evidence, approve finance action, approve owner GO\/NO-GO, run production\s+migration or mark production GO/i.test(implementationLog)) {
  fail("Implementation log must record the daily email dispatch handoff guard boundary.");
}
if (!/P5-02 Department Task Handoff Register Dry-Run[\s\S]*HEU_DEPARTMENT_TASK_HANDOFF_REGISTER_20260702\.md[\s\S]*DEPT_TASK_REGISTER_READY \/ NO_GO \/ BLOCKED[\s\S]*BGH, IT_DATA, KHTC[\s\S]*TUYEN_SINH, CTHSSV, DAO_TAO and HR[\s\S]*data-heu-department-task-handoff-register="P5-02"[\s\S]*scripts\/report-heu-daily-dry-run\.mjs[\s\S]*same department\/user-label task lanes[\s\S]*does not send\s+real email, create real tasks\/tickets, assign real accounts[\s\S]*execute UAT,\s+accept\s+evidence, approve finance action, approve owner GO\/NO-GO, run production\s+migration or mark production GO/i.test(implementationLog)) {
  fail("Implementation log must record the department task handoff register dry-run boundary.");
}
if (!/P5-02 Master Goal Daily Report Summary[\s\S]*scripts\/report-heu-daily-dry-run\.mjs[\s\S]*HEU_MASTER_CONTROL_GOAL_REGISTER_20260702\.md[\s\S]*MASTER_GOAL_READY \/ NO_GO \/ BLOCKED[\s\S]*phase order A-E[\s\S]*cloud PASS_LOCAL boundary[\s\S]*expert-team lanes[\s\S]*audit-heu-bgh-dashboard-spec\.mjs[\s\S]*does not self-code, self-deploy,\s+send real email, create real tasks\/tickets, create real accounts[\s\S]*execute UAT, accept\s+evidence, approve finance action, approve owner GO\/NO-GO, run production\s+migration or mark production GO/i.test(implementationLog)) {
  fail("Implementation log must record the Master Control goal daily report summary boundary.");
}
if (!/P5-02 Daily Report Blocker Owner Lanes[\s\S]*scripts\/report-heu-daily-dry-run\.mjs[\s\S]*lib\/production-readiness\.ts[\s\S]*PRODUCTION_BLOCKERS[\s\S]*BLOCKER_OWNER_LANES_READY \/ NO_GO \/ BLOCKED[\s\S]*P0-03, Step90-Step110, P0-19, P2-17, P2-18, P6-04, P6-03, P6-06, P0-10 and\s+P0-09[\s\S]*IT_DATA, KHTC, PHAP_CHE, BGH, Audit,\s+TRUONG_PHONG and business owners[\s\S]*does not send real email, create\s+real tasks\/tickets, create real accounts, accept evidence, execute UAT,\s+approve finance action, approve owner GO\/NO-GO, run production migration or\s+mark production GO/i.test(implementationLog)) {
  fail("Implementation log must record the daily report blocker-owner lane boundary.");
}
if (!/P5-02 Daily Report Signed UAT Route Summary[\s\S]*scripts\/report-heu-daily-dry-run\.mjs[\s\S]*TTGDTX_UAT_EXECUTION_LOG_20260625\.md[\s\S]*Section 5\.2[\s\S]*TTGDTX_SIGNED_UAT_EXECUTION_ROUTING_HUB_20260628\.md[\s\S]*SIGNED_UAT_ROUTE_SUMMARY_READY \/ NO_GO \/ BLOCKED[\s\S]*UAT-ROUTE-01 through UAT-ROUTE-11[\s\S]*PENDING status[\s\S]*owner labels[\s\S]*minimum\s+proof[\s\S]*does not send real email, create\s+real tasks\/tickets, create real accounts, accept evidence, execute UAT,\s+approve finance action, approve owner GO\/NO-GO, run production migration or\s+mark production GO/i.test(implementationLog)) {
  fail("Implementation log must record the daily report signed UAT route summary boundary.");
}

const agents = read("AGENTS.md");
if (!agents.includes("docs/HEU_BGH_OPERATING_DASHBOARD_SPEC_20260627.md")) {
  fail("AGENTS.md: missing BGH dashboard spec in required reading.");
}
if (!agents.includes("npm.cmd run audit:heu-bgh-dashboard-spec")) {
  fail("AGENTS.md: missing BGH dashboard spec audit in final handoff checks.");
}

const releaseGateAudit = read("scripts/audit-ttgdtx-release-gates.mjs");
if (
  !releaseGateAudit.includes(specPath) ||
  !releaseGateAudit.includes(blockerSummaryPath) ||
  !releaseGateAudit.includes("audit:heu-bgh-dashboard-spec")
) {
  fail("scripts/audit-ttgdtx-release-gates.mjs: missing BGH dashboard spec gate coverage.");
}

if (failures.length > 0) {
  console.error("HEU BGH dashboard spec audit failed.");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("HEU BGH dashboard spec audit passed. P5-02 blocker summary is read-only and does not approve production.");
