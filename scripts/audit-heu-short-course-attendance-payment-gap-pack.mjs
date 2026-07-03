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

function requireText(relativePath, pattern, label) {
  if (!exists(relativePath)) {
    return;
  }

  const contents = read(relativePath);
  if (!pattern.test(contents)) {
    fail(`${relativePath}: missing ${label}`);
  }
}

function requireSectionTokens(relativePath, title, tokens, label) {
  if (!exists(relativePath)) {
    return;
  }

  const contents = read(relativePath);
  const marker = `## ${title}`;
  const start = contents.indexOf(marker);

  if (start === -1) {
    fail(`${relativePath}: missing section ${title}`);
    return;
  }

  const next = contents.indexOf("\n## ", start + marker.length);
  const section = next === -1 ? contents.slice(start) : contents.slice(start, next);

  for (const token of tokens) {
    if (!section.includes(token)) {
      fail(`${relativePath}: missing ${label}: ${token}`);
    }
  }
}

const requiredFiles = [
  "docs/HEU_SHORT_COURSE_ATTENDANCE_PAYMENT_GAP_PACK_20260628_V01_DRAFT.md",
  "docs/HEU_SHORT_COURSE_ATTENDANCE_LOCK_EVIDENCE_CHECKLIST_20260703.md",
  "docs/HEU_SHORT_COURSE_BHXH_POLICY_DECISION_CHECKLIST_20260703.md",
  "docs/HEU_SHORT_COURSE_MEAL_ALLOWANCE_PAYMENT_BOUNDARY_CHECKLIST_20260703.md",
  "docs/HEU_SHORT_COURSE_INVOICE_PAYMENT_VERIFICATION_CHECKLIST_20260703.md",
  "docs/HEU_SHORT_COURSE_REPORT_VIEW_SOURCE_RECONCILIATION_CHECKLIST_20260703.md",
  "docs/HEU_SHORT_COURSE_ROLE_NEGATIVE_ACCESS_CHECKLIST_20260703.md",
  "docs/HEU_SHORT_COURSE_EXTERNAL_OWNER_ACTION_QUEUE_20260703.md",
  "docs/HEU_SHORT_COURSE_OWNER_SIGNOFF_MANIFEST_20260702.md",
  "docs/HEU_SHORT_COURSE_UAT_RESULT_LEDGER_TEMPLATE_20260703.md",
  "components/short-course/short-course-attendance-payment-gap-pack.tsx",
  "app/short-course/page.tsx",
  "app/short-course/intake/page.tsx",
  "app/short-course/intake/actions.ts",
  "app/short-course/actions/page.tsx",
  "app/short-course/drilldown/page.tsx",
  "app/short-course/workflows/page.tsx",
  "app/short-course/workflows/actions.ts",
  "lib/sensitive-display.ts",
  "scripts/check-heu-short-course-scope-readiness.mjs",
  "docs/HEU_PERMISSION_SCOPE_OPERATION_BREAKDOWN_20260703.md",
  "docs/HEU_SYSTEM_BUILD_BACKLOG.md",
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
  "docs/HEU_CURRENT_STATE_INVENTORY.md",
  "docs/HEU_MODULE_READINESS_GAP_MATRIX_20260628_V01_DRAFT.md",
  "docs/HEU_REPORT_VIEW_SOURCE_MAP_20260628_V01_DRAFT.md",
  "docs/HEU_IMPLEMENTATION_LOG.md",
  "AGENTS.md",
  "package.json",
  "scripts/audit-ttgdtx-release-gates.mjs",
];

for (const file of requiredFiles) {
  requireFile(file);
}

const packageJson = exists("package.json") ? JSON.parse(read("package.json")) : {};

if (!packageJson.scripts?.["audit:heu-short-course-attendance-payment-gap-pack"]) {
  fail("package.json: missing audit:heu-short-course-attendance-payment-gap-pack script");
}

if (
  packageJson.scripts?.["check:heu-short-course-scope-readiness"] !==
  "node scripts/check-heu-short-course-scope-readiness.mjs"
) {
  fail("package.json: missing check:heu-short-course-scope-readiness script");
}

requireText(
  "docs/HEU_SHORT_COURSE_ATTENDANCE_PAYMENT_GAP_PACK_20260628_V01_DRAFT.md",
  /(?=[\s\S]*Status:\s*DRAFT_CONTROL)(?=[\s\S]*Production status:\s*NO-GO)(?=[\s\S]*SC-AP-01)(?=[\s\S]*SC-AP-08)(?=[\s\S]*SC_ATTENDANCE_PAYMENT_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*RV_SHORT_COURSE_ATTENDANCE_PAYMENT)(?=[\s\S]*SC-UAT-01)(?=[\s\S]*SC-UAT-08)(?=[\s\S]*must not:[\s\S]*Lock, approve or alter attendance)(?=[\s\S]*pay meal, allowance, teacher, HR or payroll amounts)(?=[\s\S]*Treat `RV_SHORT_COURSE_ATTENDANCE_PAYMENT` as a production dashboard source)(?=[\s\S]*does not approve attendance lock, BHXH decision,\s+meal\/allowance payment, HR payment, invoice\/payment verification, statutory\s+accounting, period close, UAT acceptance, evidence acceptance, owner GO or\s+production GO)/i,
  "Short Course attendance/payment DRAFT_CONTROL boundary",
);

requireText(
  "docs/HEU_SHORT_COURSE_ATTENDANCE_LOCK_EVIDENCE_CHECKLIST_20260703.md",
  /(?=[\s\S]*Status:\s*DRAFT_CONTROL)(?=[\s\S]*Production status:\s*NO-GO)(?=[\s\S]*SC_ATTENDANCE_LOCK_EVIDENCE_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*SC-LOCK-EVID-01)(?=[\s\S]*SC-LOCK-EVID-06)(?=[\s\S]*SC-AP-02)(?=[\s\S]*SC-AP-03)(?=[\s\S]*SC-REV-01)(?=[\s\S]*SC-UAT-01)(?=[\s\S]*SC-UAT-02)(?=[\s\S]*SC-SIGN-01)(?=[\s\S]*does not lock attendance)(?=[\s\S]*approve owner GO\/NO-GO)(?=[\s\S]*mark production GO)/i,
  "Short Course attendance lock evidence checklist boundary",
);

requireText(
  "docs/HEU_SHORT_COURSE_BHXH_POLICY_DECISION_CHECKLIST_20260703.md",
  /(?=[\s\S]*Status:\s*DRAFT_CONTROL)(?=[\s\S]*Production status:\s*NO-GO)(?=[\s\S]*SC_BHXH_POLICY_DECISION_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*SC-BHXH-EVID-01)(?=[\s\S]*SC-BHXH-EVID-06)(?=[\s\S]*SC-AP-04)(?=[\s\S]*SC-REV-02)(?=[\s\S]*SC-UAT-03)(?=[\s\S]*SC-SIGN-02)(?=[\s\S]*does not approve BHXH\/chinh sach)(?=[\s\S]*decide eligibility)(?=[\s\S]*create policy effect)(?=[\s\S]*approve owner GO\/NO-GO)(?=[\s\S]*mark production GO)/i,
  "Short Course BHXH policy decision checklist boundary",
);

requireText(
  "docs/HEU_SHORT_COURSE_MEAL_ALLOWANCE_PAYMENT_BOUNDARY_CHECKLIST_20260703.md",
  /(?=[\s\S]*Status:\s*DRAFT_CONTROL)(?=[\s\S]*Production status:\s*NO-GO)(?=[\s\S]*SC_MEAL_ALLOWANCE_BOUNDARY_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*SC-MEAL-EVID-01)(?=[\s\S]*SC-MEAL-EVID-06)(?=[\s\S]*SC-AP-05)(?=[\s\S]*SC-REV-03)(?=[\s\S]*SC-UAT-04)(?=[\s\S]*SC-SIGN-03)(?=[\s\S]*does not calculate allowance)(?=[\s\S]*approve meal\/allowance)(?=[\s\S]*approve HR payment)(?=[\s\S]*approve teacher payment)(?=[\s\S]*create payroll effect)(?=[\s\S]*approve owner GO\/NO-GO)(?=[\s\S]*mark production GO)/i,
  "Short Course meal allowance payment boundary checklist",
);

requireText(
  "docs/HEU_SHORT_COURSE_INVOICE_PAYMENT_VERIFICATION_CHECKLIST_20260703.md",
  /(?=[\s\S]*Status:\s*DRAFT_CONTROL)(?=[\s\S]*Production status:\s*NO-GO)(?=[\s\S]*SC_INVOICE_PAYMENT_VERIFICATION_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*SC-PAY-EVID-01)(?=[\s\S]*SC-PAY-EVID-06)(?=[\s\S]*SC-AP-06)(?=[\s\S]*SC-REV-04)(?=[\s\S]*SC-UAT-05)(?=[\s\S]*SC-SIGN-04)(?=[\s\S]*does not verify invoice\/payment)(?=[\s\S]*post voucher)(?=[\s\S]*approve payment)(?=[\s\S]*approve reversal)(?=[\s\S]*close period)(?=[\s\S]*create statutory accounting effect)(?=[\s\S]*approve owner GO\/NO-GO)(?=[\s\S]*mark production GO)/i,
  "Short Course invoice payment verification checklist",
);

requireText(
  "docs/HEU_SHORT_COURSE_REPORT_VIEW_SOURCE_RECONCILIATION_CHECKLIST_20260703.md",
  /(?=[\s\S]*Status:\s*DRAFT_CONTROL)(?=[\s\S]*Production status:\s*NO-GO)(?=[\s\S]*SC_REPORT_VIEW_SOURCE_RECONCILIATION_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*SC-RV-EVID-01)(?=[\s\S]*SC-RV-EVID-06)(?=[\s\S]*SC-AP-07)(?=[\s\S]*SC-REV-05)(?=[\s\S]*SC-UAT-06)(?=[\s\S]*SC-SIGN-05)(?=[\s\S]*DQ-RV-06)(?=[\s\S]*RV-EVID-05)(?=[\s\S]*RV_SHORT_COURSE_ATTENDANCE_PAYMENT)(?=[\s\S]*does not approve report-view reliance)(?=[\s\S]*approve dashboard reliance)(?=[\s\S]*accept DQ evidence)(?=[\s\S]*accept source reconciliation)(?=[\s\S]*approve owner GO\/NO-GO)(?=[\s\S]*mark production GO)/i,
  "Short Course report-view source reconciliation checklist",
);

requireText(
  "docs/HEU_SHORT_COURSE_ROLE_NEGATIVE_ACCESS_CHECKLIST_20260703.md",
  /(?=[\s\S]*Status:\s*DRAFT_CONTROL)(?=[\s\S]*Production status:\s*NO-GO)(?=[\s\S]*SC_ROLE_NEGATIVE_ACCESS_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*SC-ROLE-EVID-01)(?=[\s\S]*SC-ROLE-EVID-06)(?=[\s\S]*SHORT-SCOPE-APP-GUARD)(?=[\s\S]*SHORT-SCOPE-WORKFLOWS)(?=[\s\S]*SHORT-SCOPE-ACTOR-LINK)(?=[\s\S]*NEGATIVE_CONTROL_QUEUE_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*P6_04_ACCESS_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*SC-UAT-07)(?=[\s\S]*SC-REV-06)(?=[\s\S]*SC-SIGN-06)(?=[\s\S]*P0-17 access closure handoff)(?=[\s\S]*does not create accounts)(?=[\s\S]*assign real users)(?=[\s\S]*grant access)(?=[\s\S]*broaden scope)(?=[\s\S]*accept negative-control proof)(?=[\s\S]*accept role UAT)(?=[\s\S]*approve access closure)(?=[\s\S]*mark production GO)/i,
  "Short Course role negative-access checklist",
);

requireText(
  "components/short-course/short-course-attendance-payment-gap-pack.tsx",
  /(?=[\s\S]*data-heu-short-course-attendance-payment-gap-pack="P9-01")(?=[\s\S]*Short Course Attendance\/Payment Gap Pack:\s*PASS_LOCAL only)(?=[\s\S]*SC_ATTENDANCE_PAYMENT_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*SC-AP-01)(?=[\s\S]*SC-AP-08)(?=[\s\S]*RV_SHORT_COURSE_ATTENDANCE_PAYMENT)(?=[\s\S]*PASS_LOCAL does not approve attendance lock, BHXH decision,\s+meal\/allowance payment, HR payment, invoice\/payment verification,\s+period close, statutory accounting, UAT acceptance, evidence\s+acceptance, owner GO or production GO)/i,
  "visible Short Course attendance/payment gap-pack panel",
);

requireText(
  "components/short-course/short-course-attendance-payment-gap-pack.tsx",
  /(?=[\s\S]*data-heu-short-course-attendance-lock-evidence="TRN-03_ATTENDANCE_LOCK_EVIDENCE")(?=[\s\S]*data-heu-short-course-attendance-lock-decision="SC_ATTENDANCE_LOCK_EVIDENCE_READY_NO_GO_BLOCKED")(?=[\s\S]*Attendance lock evidence checklist)(?=[\s\S]*docs\/HEU_SHORT_COURSE_ATTENDANCE_LOCK_EVIDENCE_CHECKLIST_20260703\.md)(?=[\s\S]*SC_ATTENDANCE_LOCK_EVIDENCE_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*SC-LOCK-EVID-01)(?=[\s\S]*SC-LOCK-EVID-06)(?=[\s\S]*SC-AP-02)(?=[\s\S]*SC-AP-03)(?=[\s\S]*SC-REV-01)(?=[\s\S]*SC-UAT-01\/02)(?=[\s\S]*SC-SIGN-01)(?=[\s\S]*PENDING_EXTERNAL_EVIDENCE)(?=[\s\S]*PASS_LOCAL does not lock attendance,\s+approve attendance, alter attendance, accept evidence, execute UAT,\s+approve payment, approve owner GO\/NO-GO or mark production GO)/i,
  "visible Short Course attendance lock evidence checklist",
);

requireText(
  "components/short-course/short-course-attendance-payment-gap-pack.tsx",
  /(?=[\s\S]*data-heu-short-course-bhxh-policy-decision="TRN-04_BHXH_POLICY_DECISION")(?=[\s\S]*data-heu-short-course-bhxh-policy-status="SC_BHXH_POLICY_DECISION_READY_NO_GO_BLOCKED")(?=[\s\S]*BHXH\/chinh sach decision checklist)(?=[\s\S]*docs\/HEU_SHORT_COURSE_BHXH_POLICY_DECISION_CHECKLIST_20260703\.md)(?=[\s\S]*SC_BHXH_POLICY_DECISION_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*SC-BHXH-EVID-01)(?=[\s\S]*SC-BHXH-EVID-06)(?=[\s\S]*SC-AP-04)(?=[\s\S]*SC-REV-02)(?=[\s\S]*SC-UAT-03)(?=[\s\S]*SC-SIGN-02)(?=[\s\S]*PENDING_EXTERNAL_POLICY_DECISION)(?=[\s\S]*PASS_LOCAL does not approve\s+BHXH\/chinh sach, decide eligibility, create policy effect, accept\s+evidence, execute UAT, approve payment, approve owner GO\/NO-GO or\s+mark production GO)/i,
  "visible Short Course BHXH policy decision checklist",
);

requireText(
  "components/short-course/short-course-attendance-payment-gap-pack.tsx",
  /(?=[\s\S]*data-heu-short-course-meal-allowance-boundary="TRN-05_MEAL_ALLOWANCE_PAYMENT_BOUNDARY")(?=[\s\S]*data-heu-short-course-meal-allowance-status="SC_MEAL_ALLOWANCE_BOUNDARY_READY_NO_GO_BLOCKED")(?=[\s\S]*Meal\/allowance payment boundary checklist)(?=[\s\S]*docs\/HEU_SHORT_COURSE_MEAL_ALLOWANCE_PAYMENT_BOUNDARY_CHECKLIST_20260703\.md)(?=[\s\S]*SC_MEAL_ALLOWANCE_BOUNDARY_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*SC-MEAL-EVID-01)(?=[\s\S]*SC-MEAL-EVID-06)(?=[\s\S]*SC-AP-05)(?=[\s\S]*SC-REV-03)(?=[\s\S]*SC-UAT-04)(?=[\s\S]*SC-SIGN-03)(?=[\s\S]*PENDING_EXTERNAL_PAYMENT_BOUNDARY)(?=[\s\S]*PASS_LOCAL does not calculate\s+allowance, approve meal\/allowance, approve HR payment, approve teacher\s+payment, create payroll effect, accept evidence, execute UAT, approve\s+owner GO\/NO-GO or mark production GO)/i,
  "visible Short Course meal allowance payment boundary checklist",
);

requireText(
  "components/short-course/short-course-attendance-payment-gap-pack.tsx",
  /(?=[\s\S]*data-heu-short-course-invoice-payment-verification="TRN-06_INVOICE_PAYMENT_VERIFICATION")(?=[\s\S]*data-heu-short-course-invoice-payment-status="SC_INVOICE_PAYMENT_VERIFICATION_READY_NO_GO_BLOCKED")(?=[\s\S]*Invoice\/payment verification checklist)(?=[\s\S]*docs\/HEU_SHORT_COURSE_INVOICE_PAYMENT_VERIFICATION_CHECKLIST_20260703\.md)(?=[\s\S]*SC_INVOICE_PAYMENT_VERIFICATION_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*SC-PAY-EVID-01)(?=[\s\S]*SC-PAY-EVID-06)(?=[\s\S]*SC-AP-06)(?=[\s\S]*SC-REV-04)(?=[\s\S]*SC-UAT-05)(?=[\s\S]*SC-SIGN-04)(?=[\s\S]*PENDING_EXTERNAL_PAYMENT_VERIFICATION)(?=[\s\S]*PASS_LOCAL does not verify\s+invoice\/payment, post voucher, approve payment, approve reversal,\s+close period, create statutory accounting effect, accept evidence,\s+execute UAT, approve owner GO\/NO-GO or mark production GO)/i,
  "visible Short Course invoice payment verification checklist",
);

requireText(
  "components/short-course/short-course-attendance-payment-gap-pack.tsx",
  /(?=[\s\S]*data-heu-short-course-report-view-source-reconciliation="TRN-07_REPORT_VIEW_SOURCE_RECONCILIATION")(?=[\s\S]*data-heu-short-course-report-view-status="SC_REPORT_VIEW_SOURCE_RECONCILIATION_READY_NO_GO_BLOCKED")(?=[\s\S]*Report-view source reconciliation checklist)(?=[\s\S]*docs\/HEU_SHORT_COURSE_REPORT_VIEW_SOURCE_RECONCILIATION_CHECKLIST_20260703\.md)(?=[\s\S]*SC_REPORT_VIEW_SOURCE_RECONCILIATION_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*SC-RV-EVID-01)(?=[\s\S]*SC-RV-EVID-06)(?=[\s\S]*SC-AP-07)(?=[\s\S]*DQ-RV-06)(?=[\s\S]*SC-REV-05)(?=[\s\S]*SC-UAT-06)(?=[\s\S]*SC-SIGN-05)(?=[\s\S]*PENDING_EXTERNAL_REPORT_VIEW_RECONCILIATION)(?=[\s\S]*PASS_LOCAL does not\s+approve report-view reliance, approve dashboard reliance, accept DQ\s+evidence, accept source reconciliation, execute UAT, accept evidence,\s+approve owner GO\/NO-GO or mark production GO)/i,
  "visible Short Course report-view source reconciliation checklist",
);

requireText(
  "components/short-course/short-course-attendance-payment-gap-pack.tsx",
  /(?=[\s\S]*data-heu-short-course-role-negative-access="TRN-08_ROLE_NEGATIVE_ACCESS")(?=[\s\S]*data-heu-short-course-role-negative-access-status="SC_ROLE_NEGATIVE_ACCESS_READY_NO_GO_BLOCKED")(?=[\s\S]*Role scope and negative-access checklist)(?=[\s\S]*docs\/HEU_SHORT_COURSE_ROLE_NEGATIVE_ACCESS_CHECKLIST_20260703\.md)(?=[\s\S]*SC_ROLE_NEGATIVE_ACCESS_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*SC-ROLE-EVID-01)(?=[\s\S]*SC-ROLE-EVID-06)(?=[\s\S]*SHORT-SCOPE-APP-GUARD)(?=[\s\S]*SHORT-SCOPE-WORKFLOWS)(?=[\s\S]*SHORT-SCOPE-ACTOR-LINK)(?=[\s\S]*PENDING_EXTERNAL_ROLE_NEGATIVE_ACCESS)(?=[\s\S]*PASS_LOCAL does not create\s+accounts, assign real users, grant access, broaden scope, accept\s+negative-control proof, accept role UAT, accept evidence, approve\s+access closure, approve owner GO\/NO-GO or mark production GO)/i,
  "visible Short Course role negative-access checklist",
);

requireText(
  "components/short-course/short-course-attendance-payment-gap-pack.tsx",
  /(?=[\s\S]*data-heu-hou-short-course-scope-switch="REAL-OPS-07_QUICK_SCOPE_SWITCH")(?=[\s\S]*data-heu-hou-short-course-quick-link="SHORT_COURSE_TO_HOU")(?=[\s\S]*href="\/hou")(?=[\s\S]*aria-label="Open HOU control surface from Short Course scope switch")(?=[\s\S]*title="Open HOU control surface")(?=[\s\S]*href="\/master-control")(?=[\s\S]*aria-label="Open Master Control from Short Course scope switch")(?=[\s\S]*title="Open Master Control")(?=[\s\S]*Short Course \/ HOU scope switch)(?=[\s\S]*min-w-0)(?=[\s\S]*overflow-hidden)(?=[\s\S]*break-words)(?=[\s\S]*truncate)(?=[\s\S]*shrink-0)(?=[\s\S]*flex-wrap)/i,
  "Short Course quick scope switch and overflow guards",
);

requireText(
  "components/short-course/short-course-attendance-payment-gap-pack.tsx",
  /(?=[\s\S]*data-heu-short-course-quick-access="P9-01_SHORT_COURSE_QUICK_ACCESS")(?=[\s\S]*data-heu-short-course-quick-open="P9-01_SHORT_COURSE_QUICK_OPEN_TOP3")(?=[\s\S]*data-heu-short-course-quick-access-overflow-guard="P9-01_SHORT_COURSE_QUICK_ACCESS_NO_OVERFLOW")(?=[\s\S]*Short Course quick access)(?=[\s\S]*READ_ONLY_NAVIGATION \/ NO_GO \/ BLOCKED)(?=[\s\S]*SC-AP-01\.\.08)(?=[\s\S]*SC-SIGN-01\.\.06)(?=[\s\S]*SC-UAT-LEDGER)(?=[\s\S]*href: "#short-course-control-table")(?=[\s\S]*href: "#short-course-owner-signoff")(?=[\s\S]*href: "#short-course-uat-result-ledger")(?=[\s\S]*id="short-course-control-table")(?=[\s\S]*id="short-course-owner-signoff")(?=[\s\S]*id="short-course-uat-result-ledger")(?=[\s\S]*min-w-0)(?=[\s\S]*overflow-hidden)(?=[\s\S]*truncate)(?=[\s\S]*break-words)(?=[\s\S]*aria-label)(?=[\s\S]*title)/i,
  "Short Course quick access top-three anchors and overflow guards",
);

requireText(
  "components/short-course/short-course-attendance-payment-gap-pack.tsx",
  /(?=[\s\S]*data-heu-short-course-quick-access="P9-01_SHORT_COURSE_QUICK_ACCESS")(?=[\s\S]*className="mt-2 break-words text-sm font-semibold leading-5 text-zinc-950"[\s\S]*\{row\.label\})(?=[\s\S]*className="mt-2 break-words text-xs font-medium leading-5 text-zinc-500"[\s\S]*\{row\.owner\})/i,
  "Short Course quick access label and owner wrap guards",
);

requireText(
  "components/short-course/short-course-attendance-payment-gap-pack.tsx",
  /(?=[\s\S]*data-heu-short-course-review-handoff="P9-01_REVIEW_HANDOFF")(?=[\s\S]*data-heu-short-course-review-handoff="P9-01_REVIEW_HANDOFF"[\s\S]*table-fixed)(?=[\s\S]*data-heu-short-course-review-handoff="P9-01_REVIEW_HANDOFF"[\s\S]*whitespace-normal)(?=[\s\S]*data-heu-short-course-review-handoff="P9-01_REVIEW_HANDOFF"[\s\S]*break-words)(?=[\s\S]*data-heu-short-course-review-decision="SC_REVIEW_READY_NO_GO_BLOCKED")(?=[\s\S]*Short Course review handoff)(?=[\s\S]*SC_REVIEW_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*SC-REV-01)(?=[\s\S]*SC-REV-06)(?=[\s\S]*Attendance lock packet)(?=[\s\S]*Invoice\/payment reconciliation)(?=[\s\S]*RV_SHORT_COURSE_ATTENDANCE_PAYMENT)(?=[\s\S]*signatures and evidence acceptance[\s\S]*outside Codex\/chat)(?=[\s\S]*PASS_LOCAL, Codex or AI output is treated as UAT acceptance or owner GO)/i,
  "Short Course review handoff queue",
);

requireText(
  "components/short-course/short-course-attendance-payment-gap-pack.tsx",
  /(?=[\s\S]*data-heu-short-course-owner-signoff="P9-01_OWNER_SIGNOFF_MANIFEST")(?=[\s\S]*data-heu-short-course-owner-signoff="P9-01_OWNER_SIGNOFF_MANIFEST"[\s\S]*min-w-0)(?=[\s\S]*data-heu-short-course-owner-signoff="P9-01_OWNER_SIGNOFF_MANIFEST"[\s\S]*break-words)(?=[\s\S]*data-heu-short-course-owner-signoff="P9-01_OWNER_SIGNOFF_MANIFEST"[\s\S]*overflow-hidden)(?=[\s\S]*data-heu-short-course-owner-decision="SHORT_COURSE_OWNER_READY_NO_GO_BLOCKED")(?=[\s\S]*Short Course owner signoff manifest)(?=[\s\S]*docs\/HEU_SHORT_COURSE_OWNER_SIGNOFF_MANIFEST_20260702\.md)(?=[\s\S]*SHORT_COURSE_OWNER_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*SC-SIGN-01)(?=[\s\S]*SC-SIGN-06)(?=[\s\S]*PENDING_OWNER)(?=[\s\S]*Missing, unsigned, NO-GO or[\s\S]*BLOCKED owner decisions keep Short Course production locked)/i,
  "Short Course owner signoff manifest panel",
);

requireText(
  "components/short-course/short-course-attendance-payment-gap-pack.tsx",
  /(?=[\s\S]*data-heu-short-course-uat-result-ledger="P9-01_UAT_RESULT_LEDGER")(?=[\s\S]*data-heu-short-course-uat-result-ledger="P9-01_UAT_RESULT_LEDGER"[\s\S]*table-fixed)(?=[\s\S]*data-heu-short-course-uat-result-ledger="P9-01_UAT_RESULT_LEDGER"[\s\S]*whitespace-normal)(?=[\s\S]*data-heu-short-course-uat-result-ledger="P9-01_UAT_RESULT_LEDGER"[\s\S]*break-words)(?=[\s\S]*data-heu-short-course-uat-result-decision="SC_UAT_RESULT_READY_NO_GO_BLOCKED")(?=[\s\S]*Short Course UAT result ledger)(?=[\s\S]*docs\/HEU_SHORT_COURSE_UAT_RESULT_LEDGER_TEMPLATE_20260703\.md)(?=[\s\S]*SC_UAT_RESULT_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*SC-UAT-LEDGER-01)(?=[\s\S]*SC-UAT-LEDGER-08)(?=[\s\S]*controlled evidence ref)(?=[\s\S]*outside Codex\/chat)/i,
  "Short Course UAT result ledger panel",
);

requireText(
  "app/short-course/page.tsx",
  /(?=[\s\S]*ShortCourseAttendancePaymentGapPack)(?=[\s\S]*<ShortCourseAttendancePaymentGapPack \/>)/i,
  "Short Course page mounts gap-pack panel",
);

requireText(
  "app/short-course/page.tsx",
  /(?=[\s\S]*getAdmissionWorkspaceContext)(?=[\s\S]*withAdmissionSegmentParam)(?=[\s\S]*workspaceSegmentId=\{activeSegmentId\})(?=[\s\S]*workspaceReturnTo=\{refreshHref\})(?=[\s\S]*\.eq\("admission_segment_id", activeSegmentId\))(?=[\s\S]*\.in\("class_id", classIds\))(?=[\s\S]*\.in\("enrollment_id", enrollmentIds\))/i,
  "Short Course page admission workspace read scope",
);

requireText(
  "app/short-course/intake/page.tsx",
  /(?=[\s\S]*getAdmissionWorkspaceContext)(?=[\s\S]*activeSegmentId)(?=[\s\S]*workspaceSegmentId=\{activeSegmentId\})(?=[\s\S]*name="admission_segment_id")(?=[\s\S]*\.eq\("admission_segment_id", activeSegmentId\))/i,
  "Short Course intake admission workspace read scope",
);

requireText(
  "app/short-course/intake/actions.ts",
  /(?=[\s\S]*createAuthedClient)(?=[\s\S]*can_use_admission_workspace)(?=[\s\S]*create_short_class)(?=[\s\S]*convert_short_course_lead_to_student)(?=[\s\S]*assign_short_enrollment_to_class)/i,
  "Short Course intake action workspace write guard",
);

requireText(
  "app/short-course/workflows/page.tsx",
  /(?=[\s\S]*getAdmissionWorkspaceContext)(?=[\s\S]*workspaceSegmentId=\{activeSegmentId\})(?=[\s\S]*short_course_workflow_request_status)(?=[\s\S]*admission_segment_id\.eq\.\$\{activeSegmentId\},admission_segment_id\.is\.null)/i,
  "Short Course workflow page workspace read scope",
);

requireText(
  "app/short-course/workflows/actions.ts",
  /(?=[\s\S]*can_use_admission_workspace)(?=[\s\S]*select\("segment_code"\))(?=[\s\S]*startsWith\("SHORT_"\))(?=[\s\S]*not_short_course_workspace)(?=[\s\S]*select\("request_status,requested_by,admission_segment_id"\))(?=[\s\S]*currentRequest\.admission_segment_id)(?=[\s\S]*await assertWorkspaceAllowed\()/i,
  "Short Course workflow action workspace update guard",
);

requireText(
  "lib/sensitive-display.ts",
  /(?=[\s\S]*export function maskPhone)(?=[\s\S]*export function maskIdentityNo)(?=[\s\S]*export function maskVoucherOrRawId)(?=[\s\S]*\*\*\*\$\{visibleTail\(normalized, visible\)\})/i,
  "Short Course sensitive display helper",
);

requireText(
  "app/short-course/drilldown/page.tsx",
  /(?=[\s\S]*maskPhone\(row\.student_phone\))(?=[\s\S]*maskIdentityNo\(row\.identity_no\))(?=[\s\S]*maskVoucherOrRawId\(row\.voucher_no\))(?=[\s\S]*maskVoucherOrRawId\(row\.invoice_id\))/i,
  "Short Course drilldown sensitive display masks",
);

requireText(
  "app/short-course/intake/page.tsx",
  /(?=[\s\S]*import \{ maskPhone \} from "@\/lib\/sensitive-display")(?=[\s\S]*maskPhone\(lead\.student_phone\))(?=[\s\S]*maskPhone\(enrollment\.student_phone\))/i,
  "Short Course intake sensitive display masks",
);

requireText(
  "app/short-course/actions/page.tsx",
  /(?=[\s\S]*import \{ maskVoucherOrRawId \} from "@\/lib\/sensitive-display")(?=[\s\S]*maskVoucherOrRawId\(row\.voucher_no\))/i,
  "Short Course action center sensitive display masks",
);

requireText(
  "scripts/check-heu-short-course-scope-readiness.mjs",
  /(?=[\s\S]*SHORT-SCOPE-APP-GUARD)(?=[\s\S]*SHORT-SCOPE-PRIVACY-DISPLAY)(?=[\s\S]*SHORT-SCOPE-SEGMENTS)(?=[\s\S]*SHORT-SCOPE-STUDENTS)(?=[\s\S]*SHORT-SCOPE-CLASSES)(?=[\s\S]*SHORT-SCOPE-ENROLLMENTS)(?=[\s\S]*SHORT-SCOPE-ATTENDANCE)(?=[\s\S]*SHORT-SCOPE-BHXH-FINANCE)(?=[\s\S]*SHORT-SCOPE-WORKFLOWS)(?=[\s\S]*SHORT-SCOPE-ACTOR-LINK)(?=[\s\S]*Secrets, emails, names, phone numbers, bank accounts, vouchers and raw IDs are never printed by this script)/i,
  "Short Course scope readiness checker status coverage",
);

requireText(
  "docs/HEU_PERMISSION_SCOPE_OPERATION_BREAKDOWN_20260703.md",
  /(?=[\s\S]*Slice 11 - Short Course Scope Closure)(?=[\s\S]*check:heu-short-course-scope-readiness)(?=[\s\S]*audit:heu-short-course-attendance-payment-gap-pack)(?=[\s\S]*SHORT-SCOPE-APP-GUARD)(?=[\s\S]*SHORT-SCOPE-BHXH-FINANCE)(?=[\s\S]*does not approve attendance lock, BHXH decision, meal\/allowance payment, HR payment, invoice\/payment verification, period close, statutory accounting, UAT acceptance, evidence acceptance, owner GO or production GO)/i,
  "permission breakdown Short Course scope closure slice",
);

requireText(
  "docs/HEU_SYSTEM_BUILD_BACKLOG.md",
  /P9-01[\s\S]*Short Course attendance\/payment gap pack[\s\S]*PASS_LOCAL[\s\S]*HEU_SHORT_COURSE_ATTENDANCE_PAYMENT_GAP_PACK_20260628_V01_DRAFT\.md[\s\S]*HEU_SHORT_COURSE_OWNER_SIGNOFF_MANIFEST_20260702\.md[\s\S]*HEU_SHORT_COURSE_UAT_RESULT_LEDGER_TEMPLATE_20260703\.md[\s\S]*short-course-attendance-payment-gap-pack\.tsx[\s\S]*\/short-course[\s\S]*SC-AP-01 through SC-AP-08[\s\S]*SC-SIGN-01 through SC-SIGN-06[\s\S]*SC-UAT-LEDGER-01 through SC-UAT-LEDGER-08[\s\S]*SHORT_COURSE_OWNER_READY \/ NO_GO \/ BLOCKED[\s\S]*SC_UAT_RESULT_READY \/ NO_GO \/ BLOCKED[\s\S]*audit:heu-short-course-attendance-payment-gap-pack[\s\S]*does not approve attendance lock, BHXH decision, meal\/allowance payment, HR payment, invoice\/payment verification, period close, statutory accounting, UAT acceptance, evidence acceptance, owner GO\/NO-GO or production GO/i,
  "P9-01 backlog row",
);

requireText(
  "docs/HEU_SYSTEM_BUILD_BACKLOG.md",
  /P9-01[\s\S]*read-only Short Course quick access[\s\S]*data-heu-short-course-quick-access="P9-01_SHORT_COURSE_QUICK_ACCESS"[\s\S]*no-overflow guard[\s\S]*audit:heu-short-course-attendance-payment-gap-pack/i,
  "P9-01 backlog Short Course quick access guard",
);

requireText(
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
  /Short Course attendance\/payment gap pack[\s\S]*PASS_LOCAL[\s\S]*HEU_SHORT_COURSE_ATTENDANCE_PAYMENT_GAP_PACK_20260628_V01_DRAFT\.md[\s\S]*HEU_SHORT_COURSE_OWNER_SIGNOFF_MANIFEST_20260702\.md[\s\S]*HEU_SHORT_COURSE_UAT_RESULT_LEDGER_TEMPLATE_20260703\.md[\s\S]*short-course-attendance-payment-gap-pack\.tsx[\s\S]*\/short-course[\s\S]*SC-SIGN-01 through SC-SIGN-06[\s\S]*SC-UAT-LEDGER-01 through SC-UAT-LEDGER-08[\s\S]*SHORT_COURSE_OWNER_READY \/ NO_GO \/ BLOCKED[\s\S]*SC_UAT_RESULT_READY \/ NO_GO \/ BLOCKED[\s\S]*audit:heu-short-course-attendance-payment-gap-pack[\s\S]*signed attendance\/payment UAT, BHXH\/policy signoff,[\s\S]*source reconciliation,[\s\S]*owner signoff manifest completion, UAT result ledger completion and report-view owner signoff still required/i,
  "production checklist Short Course gap-pack row",
);

requireText(
  "docs/HEU_CURRENT_STATE_INVENTORY.md",
  /npm\.cmd run audit:heu-short-course-attendance-payment-gap-pack[\s\S]*PASS[\s\S]*Short Course attendance\/payment gap pack[\s\S]*\/short-course[\s\S]*HEU_SHORT_COURSE_ATTENDANCE_PAYMENT_GAP_PACK_20260628_V01_DRAFT\.md[\s\S]*HEU_SHORT_COURSE_OWNER_SIGNOFF_MANIFEST_20260702\.md[\s\S]*HEU_SHORT_COURSE_UAT_RESULT_LEDGER_TEMPLATE_20260703\.md[\s\S]*SC-AP-01 through SC-AP-08[\s\S]*SC-SIGN-01 through SC-SIGN-06[\s\S]*SC-UAT-LEDGER-01 through SC-UAT-LEDGER-08[\s\S]*SHORT_COURSE_OWNER_READY \/ NO_GO \/ BLOCKED[\s\S]*SC_UAT_RESULT_READY \/ NO_GO \/ BLOCKED[\s\S]*PASS_LOCAL; no attendance lock, BHXH decision,[\s\S]*meal\/allowance payment, HR payment,[\s\S]*invoice\/payment verification,[\s\S]*period close, statutory accounting, UAT acceptance, evidence acceptance, owner GO\/NO-GO or production GO approved/i,
  "current-state Short Course gap-pack evidence",
);

requireText(
  "docs/HEU_CURRENT_STATE_INVENTORY.md",
  /Short Course attendance\/payment gap pack[\s\S]*read-only quick access[\s\S]*data-heu-short-course-quick-access="P9-01_SHORT_COURSE_QUICK_ACCESS"[\s\S]*data-heu-short-course-quick-access-overflow-guard="P9-01_SHORT_COURSE_QUICK_ACCESS_NO_OVERFLOW"[\s\S]*PASS_LOCAL; no attendance lock/i,
  "current-state Short Course quick access guard",
);

requireText(
  "docs/HEU_MODULE_READINESS_GAP_MATRIX_20260628_V01_DRAFT.md",
  /Short Course \/ Day Nghe[\s\S]*HEU_SHORT_COURSE_ATTENDANCE_PAYMENT_GAP_PACK_20260628_V01_DRAFT\.md[\s\S]*HEU_SHORT_COURSE_OWNER_SIGNOFF_MANIFEST_20260702\.md[\s\S]*HEU_SHORT_COURSE_UAT_RESULT_LEDGER_TEMPLATE_20260703\.md[\s\S]*SC-AP-01 through SC-AP-08[\s\S]*SC-SIGN-01 through SC-SIGN-06[\s\S]*SC-UAT-LEDGER-01 through SC-UAT-LEDGER-08[\s\S]*CAN_SUA[\s\S]*UAT result ledger[\s\S]*owner signoff manifest[\s\S]*Signed attendance\/payment UAT, BHXH\/policy signoff,[\s\S]*source reconciliation,[\s\S]*Short Course UAT result ledger, owner signoff manifest and report-view owner signoff[\s\S]*Short Course attendance\/payment gap pack[\s\S]*HEU_SHORT_COURSE_UAT_RESULT_LEDGER_TEMPLATE_20260703\.md[\s\S]*audit:heu-short-course-attendance-payment-gap-pack/i,
  "module readiness Short Course gap-pack routing",
);

requireText(
  "docs/HEU_SYSTEM_BUILD_BACKLOG.md",
  /P9-04[\s\S]*BHXH\/chinh sach decision checklist[\s\S]*HEU_SHORT_COURSE_BHXH_POLICY_DECISION_CHECKLIST_20260703\.md[\s\S]*data-heu-short-course-bhxh-policy-decision="TRN-04_BHXH_POLICY_DECISION"[\s\S]*SC-BHXH-EVID-01 through SC-BHXH-EVID-06[\s\S]*SC_BHXH_POLICY_DECISION_READY \/ NO_GO \/ BLOCKED[\s\S]*does not approve BHXH\/chinh sach, decide eligibility, create policy effect, accept evidence, execute UAT, approve payment, approve owner GO\/NO-GO or mark production GO/i,
  "P9-04 backlog BHXH policy decision row",
);

requireText(
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
  /Short Course attendance\/payment gap pack[\s\S]*HEU_SHORT_COURSE_BHXH_POLICY_DECISION_CHECKLIST_20260703\.md[\s\S]*SC-BHXH-EVID-01 through SC-BHXH-EVID-06[\s\S]*SC_BHXH_POLICY_DECISION_READY \/ NO_GO \/ BLOCKED[\s\S]*signed attendance\/payment UAT, BHXH\/policy signoff/i,
  "production checklist Short Course BHXH policy decision propagation",
);

requireText(
  "docs/HEU_CURRENT_STATE_INVENTORY.md",
  /Short Course attendance\/payment gap pack[\s\S]*HEU_SHORT_COURSE_BHXH_POLICY_DECISION_CHECKLIST_20260703\.md[\s\S]*SC-BHXH-EVID-01 through SC-BHXH-EVID-06[\s\S]*SC_BHXH_POLICY_DECISION_READY \/ NO_GO \/ BLOCKED[\s\S]*data-heu-short-course-bhxh-policy-decision="TRN-04_BHXH_POLICY_DECISION"[\s\S]*no attendance lock, BHXH decision, policy effect, eligibility decision/i,
  "current-state Short Course BHXH policy decision propagation",
);

requireText(
  "docs/HEU_SYSTEM_BUILD_BACKLOG.md",
  /P9-05[\s\S]*Meal\/allowance HR payment boundary checklist[\s\S]*HEU_SHORT_COURSE_MEAL_ALLOWANCE_PAYMENT_BOUNDARY_CHECKLIST_20260703\.md[\s\S]*data-heu-short-course-meal-allowance-boundary="TRN-05_MEAL_ALLOWANCE_PAYMENT_BOUNDARY"[\s\S]*SC-MEAL-EVID-01 through SC-MEAL-EVID-06[\s\S]*SC_MEAL_ALLOWANCE_BOUNDARY_READY \/ NO_GO \/ BLOCKED[\s\S]*does not calculate allowance, approve meal\/allowance, approve HR payment, approve teacher payment, create payroll effect, accept evidence, execute UAT, approve owner GO\/NO-GO or mark production GO/i,
  "P9-05 backlog meal allowance payment boundary row",
);

requireText(
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
  /Short Course attendance\/payment gap pack[\s\S]*HEU_SHORT_COURSE_MEAL_ALLOWANCE_PAYMENT_BOUNDARY_CHECKLIST_20260703\.md[\s\S]*SC-MEAL-EVID-01 through SC-MEAL-EVID-06[\s\S]*SC_MEAL_ALLOWANCE_BOUNDARY_READY \/ NO_GO \/ BLOCKED[\s\S]*signed attendance\/payment UAT, BHXH\/policy signoff/i,
  "production checklist Short Course meal allowance payment boundary propagation",
);

requireText(
  "docs/HEU_CURRENT_STATE_INVENTORY.md",
  /Short Course attendance\/payment gap pack[\s\S]*HEU_SHORT_COURSE_MEAL_ALLOWANCE_PAYMENT_BOUNDARY_CHECKLIST_20260703\.md[\s\S]*SC-MEAL-EVID-01 through SC-MEAL-EVID-06[\s\S]*SC_MEAL_ALLOWANCE_BOUNDARY_READY \/ NO_GO \/ BLOCKED[\s\S]*data-heu-short-course-meal-allowance-boundary="TRN-05_MEAL_ALLOWANCE_PAYMENT_BOUNDARY"[\s\S]*no attendance lock, BHXH decision, policy effect, eligibility decision, allowance calculation/i,
  "current-state Short Course meal allowance payment boundary propagation",
);

requireText(
  "docs/HEU_SYSTEM_BUILD_BACKLOG.md",
  /P9-06[\s\S]*Invoice\/payment verification checklist[\s\S]*HEU_SHORT_COURSE_INVOICE_PAYMENT_VERIFICATION_CHECKLIST_20260703\.md[\s\S]*data-heu-short-course-invoice-payment-verification="TRN-06_INVOICE_PAYMENT_VERIFICATION"[\s\S]*SC-PAY-EVID-01 through SC-PAY-EVID-06[\s\S]*SC_INVOICE_PAYMENT_VERIFICATION_READY \/ NO_GO \/ BLOCKED[\s\S]*does not verify invoice\/payment, post voucher, approve payment, approve reversal, close period, create statutory accounting effect, accept evidence, execute UAT, approve owner GO\/NO-GO or mark production GO/i,
  "P9-06 backlog invoice payment verification row",
);

requireText(
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
  /Short Course attendance\/payment gap pack[\s\S]*HEU_SHORT_COURSE_INVOICE_PAYMENT_VERIFICATION_CHECKLIST_20260703\.md[\s\S]*SC-PAY-EVID-01 through SC-PAY-EVID-06[\s\S]*SC_INVOICE_PAYMENT_VERIFICATION_READY \/ NO_GO \/ BLOCKED[\s\S]*signed attendance\/payment UAT, BHXH\/policy signoff, invoice\/payment verification signoff/i,
  "production checklist Short Course invoice payment verification propagation",
);

requireText(
  "docs/HEU_CURRENT_STATE_INVENTORY.md",
  /Short Course attendance\/payment gap pack[\s\S]*HEU_SHORT_COURSE_INVOICE_PAYMENT_VERIFICATION_CHECKLIST_20260703\.md[\s\S]*SC-PAY-EVID-01 through SC-PAY-EVID-06[\s\S]*SC_INVOICE_PAYMENT_VERIFICATION_READY \/ NO_GO \/ BLOCKED[\s\S]*data-heu-short-course-invoice-payment-verification="TRN-06_INVOICE_PAYMENT_VERIFICATION"[\s\S]*invoice\/payment verification, voucher posting, reversal approval, period close/i,
  "current-state Short Course invoice payment verification propagation",
);

requireText(
  "docs/HEU_SYSTEM_BUILD_BACKLOG.md",
  /P9-07[\s\S]*Report-view source reconciliation checklist[\s\S]*HEU_SHORT_COURSE_REPORT_VIEW_SOURCE_RECONCILIATION_CHECKLIST_20260703\.md[\s\S]*data-heu-short-course-report-view-source-reconciliation="TRN-07_REPORT_VIEW_SOURCE_RECONCILIATION"[\s\S]*SC-RV-EVID-01 through SC-RV-EVID-06[\s\S]*SC_REPORT_VIEW_SOURCE_RECONCILIATION_READY \/ NO_GO \/ BLOCKED[\s\S]*does not approve report-view reliance, approve dashboard reliance, accept DQ evidence, accept source reconciliation, execute UAT, accept evidence, approve owner GO\/NO-GO or mark production GO/i,
  "P9-07 backlog report-view source reconciliation row",
);

requireText(
  "docs/HEU_SYSTEM_BUILD_BACKLOG.md",
  /P9-08[\s\S]*Role scope and negative-access checklist[\s\S]*HEU_SHORT_COURSE_ROLE_NEGATIVE_ACCESS_CHECKLIST_20260703\.md[\s\S]*data-heu-short-course-role-negative-access="TRN-08_ROLE_NEGATIVE_ACCESS"[\s\S]*SC-ROLE-EVID-01 through SC-ROLE-EVID-06[\s\S]*SC_ROLE_NEGATIVE_ACCESS_READY \/ NO_GO \/ BLOCKED[\s\S]*does not create accounts, assign real users, grant access, broaden scope, accept negative-control proof, accept role UAT, accept evidence, approve access closure, approve owner GO\/NO-GO or mark production GO/i,
  "P9-08 backlog role negative-access row",
);

requireText(
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
  /Short Course attendance\/payment gap pack[\s\S]*HEU_SHORT_COURSE_REPORT_VIEW_SOURCE_RECONCILIATION_CHECKLIST_20260703\.md[\s\S]*SC-RV-EVID-01 through SC-RV-EVID-06[\s\S]*SC_REPORT_VIEW_SOURCE_RECONCILIATION_READY \/ NO_GO \/ BLOCKED[\s\S]*signed attendance\/payment UAT, BHXH\/policy signoff, invoice\/payment verification signoff, source reconciliation/i,
  "production checklist Short Course report-view source reconciliation propagation",
);

requireText(
  "docs/HEU_CURRENT_STATE_INVENTORY.md",
  /Short Course attendance\/payment gap pack[\s\S]*HEU_SHORT_COURSE_REPORT_VIEW_SOURCE_RECONCILIATION_CHECKLIST_20260703\.md[\s\S]*SC-RV-EVID-01 through SC-RV-EVID-06[\s\S]*SC_REPORT_VIEW_SOURCE_RECONCILIATION_READY \/ NO_GO \/ BLOCKED[\s\S]*data-heu-short-course-report-view-source-reconciliation="TRN-07_REPORT_VIEW_SOURCE_RECONCILIATION"[\s\S]*report-view reliance, dashboard reliance/i,
  "current-state Short Course report-view source reconciliation propagation",
);

requireText(
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
  /Short Course attendance\/payment gap pack[\s\S]*HEU_SHORT_COURSE_ROLE_NEGATIVE_ACCESS_CHECKLIST_20260703\.md[\s\S]*SC-ROLE-EVID-01 through SC-ROLE-EVID-06[\s\S]*SC_ROLE_NEGATIVE_ACCESS_READY \/ NO_GO \/ BLOCKED[\s\S]*signed attendance\/payment UAT, BHXH\/policy signoff, invoice\/payment verification signoff, source reconciliation, role\/negative-access UAT/i,
  "production checklist Short Course role negative-access propagation",
);

requireText(
  "docs/HEU_CURRENT_STATE_INVENTORY.md",
  /Short Course attendance\/payment gap pack[\s\S]*HEU_SHORT_COURSE_ROLE_NEGATIVE_ACCESS_CHECKLIST_20260703\.md[\s\S]*SC-ROLE-EVID-01 through SC-ROLE-EVID-06[\s\S]*SC_ROLE_NEGATIVE_ACCESS_READY \/ NO_GO \/ BLOCKED[\s\S]*data-heu-short-course-role-negative-access="TRN-08_ROLE_NEGATIVE_ACCESS"[\s\S]*role UAT, access closure/i,
  "current-state Short Course role negative-access propagation",
);

requireText(
  "docs/HEU_REPORT_VIEW_SOURCE_MAP_20260628_V01_DRAFT.md",
  /RV_SHORT_COURSE_ATTENDANCE_PAYMENT[\s\S]*HEU_SHORT_COURSE_REPORT_VIEW_SOURCE_RECONCILIATION_CHECKLIST_20260703\.md[\s\S]*SC-RV-EVID-01 through SC-RV-EVID-06[\s\S]*DQ-RV-06[\s\S]*RV-EVID-05[\s\S]*SC_REPORT_VIEW_SOURCE_RECONCILIATION_READY \/ NO_GO \/ BLOCKED/i,
  "report-view source map Short Course reconciliation propagation",
);

requireText(
  "docs/HEU_IMPLEMENTATION_LOG.md",
  /## 2026-06-28 - Short Course Attendance Payment Gap Pack[\s\S]*HEU_SHORT_COURSE_ATTENDANCE_PAYMENT_GAP_PACK_20260628_V01_DRAFT\.md[\s\S]*components\/short-course\/short-course-attendance-payment-gap-pack\.tsx[\s\S]*SC-AP-01 through\s+SC-AP-08[\s\S]*SC_ATTENDANCE_PAYMENT_READY \/ NO_GO \/ BLOCKED[\s\S]*audit:heu-short-course-attendance-payment-gap-pack[\s\S]*This is Short Course control packaging only[\s\S]*does not approve attendance\s+lock[\s\S]*BHXH decision[\s\S]*meal\/allowance payment[\s\S]*HR payment[\s\S]*invoice\/payment\s+verification[\s\S]*period close[\s\S]*statutory accounting[\s\S]*UAT acceptance[\s\S]*evidence\s+acceptance[\s\S]*owner GO[\s\S]*production GO/i,
  "implementation log Short Course gap-pack entry",
);

requireSectionTokens(
  "docs/HEU_IMPLEMENTATION_LOG.md",
  "2026-07-03 - P9-01 Short Course Quick Access No-Overflow Guard",
  [
    "short-course-attendance-payment-gap-pack.tsx",
    'data-heu-short-course-quick-access="P9-01_SHORT_COURSE_QUICK_ACCESS"',
    'data-heu-short-course-quick-open="P9-01_SHORT_COURSE_QUICK_OPEN_TOP3"',
    'data-heu-short-course-quick-access-overflow-guard="P9-01_SHORT_COURSE_QUICK_ACCESS_NO_OVERFLOW"',
    "top-three anchors",
    "SC-AP control gate table",
    "Short Course owner signoff manifest",
    "Short Course UAT result ledger",
    "min-w-0",
    "overflow-hidden",
    "truncate",
    "break-words",
    "aria-label",
    "title",
    "audit-heu-short-course-attendance-payment-gap-pack.mjs",
    "does not approve attendance lock",
    "BHXH",
    "meal/allowance payment",
    "HR payment",
    "invoice/payment verification",
    "period close",
    "statutory accounting",
    "execute UAT",
    "accept evidence",
    "owner GO/NO-GO",
    "production GO",
  ],
  "implementation log Short Course quick access guard entry",
);

requireText(
  "docs/HEU_IMPLEMENTATION_LOG.md",
  /## 2026-07-02 - P8\/P9 HOU Short Course Quick Scope Switch[\s\S]*components\/hou\/hou-ledger-handover-gap-pack\.tsx[\s\S]*data-heu-hou-short-course-quick-link="HOU_TO_SHORT_COURSE"[\s\S]*components\/short-course\/short-course-attendance-payment-gap-pack\.tsx[\s\S]*data-heu-hou-short-course-scope-switch="REAL-OPS-07_QUICK_SCOPE_SWITCH"[\s\S]*data-heu-hou-short-course-quick-link="SHORT_COURSE_TO_HOU"[\s\S]*audit:heu-hou-ledger-handover-gap-pack[\s\S]*audit:heu-short-course-attendance-payment-gap-pack[\s\S]*does not approve HOU handover[\s\S]*attendance lock[\s\S]*finance action[\s\S]*UAT acceptance[\s\S]*owner GO[\s\S]*production GO/i,
  "implementation log HOU/Short Course quick scope switch entry",
);

requireText(
  "docs/HEU_SHORT_COURSE_ATTENDANCE_PAYMENT_GAP_PACK_20260628_V01_DRAFT.md",
  /(?=[\s\S]*## 8\. Review Handoff Queue)(?=[\s\S]*SC_REVIEW_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*SC-REV-01)(?=[\s\S]*SC-REV-06)(?=[\s\S]*Attendance lock packet)(?=[\s\S]*Invoice\/payment reconciliation)(?=[\s\S]*RV_SHORT_COURSE_ATTENDANCE_PAYMENT)(?=[\s\S]*PASS_LOCAL, Codex or AI output is treated as UAT acceptance or owner GO)/i,
  "Short Course review handoff document queue",
);

requireText(
  "docs/HEU_SHORT_COURSE_ATTENDANCE_PAYMENT_GAP_PACK_20260628_V01_DRAFT.md",
  /(?=[\s\S]*## 8\.1 Attendance Lock Evidence Checklist)(?=[\s\S]*HEU_SHORT_COURSE_ATTENDANCE_LOCK_EVIDENCE_CHECKLIST_20260703\.md)(?=[\s\S]*SC_ATTENDANCE_LOCK_EVIDENCE_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*SC-LOCK-EVID-01)(?=[\s\S]*SC-LOCK-EVID-06)(?=[\s\S]*SC-AP-02)(?=[\s\S]*SC-AP-03)(?=[\s\S]*SC-REV-01)(?=[\s\S]*SC-UAT-01)(?=[\s\S]*SC-UAT-02)(?=[\s\S]*SC-SIGN-01)(?=[\s\S]*does not lock attendance, approve attendance, alter\s+attendance, accept evidence, execute UAT, approve payment, approve owner\s+GO\/NO-GO or mark production GO)/i,
  "Short Course gap pack routes to attendance lock evidence checklist",
);

requireText(
  "docs/HEU_SHORT_COURSE_ATTENDANCE_PAYMENT_GAP_PACK_20260628_V01_DRAFT.md",
  /(?=[\s\S]*## 8\.2 BHXH\/Chinh Sach Decision Checklist)(?=[\s\S]*HEU_SHORT_COURSE_BHXH_POLICY_DECISION_CHECKLIST_20260703\.md)(?=[\s\S]*SC_BHXH_POLICY_DECISION_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*SC-BHXH-EVID-01)(?=[\s\S]*SC-BHXH-EVID-06)(?=[\s\S]*SC-AP-04)(?=[\s\S]*SC-REV-02)(?=[\s\S]*SC-UAT-03)(?=[\s\S]*SC-SIGN-02)(?=[\s\S]*does not approve BHXH\/chinh sach, decide eligibility,\s+create policy effect, accept evidence, execute UAT, approve payment, approve\s+owner GO\/NO-GO or mark production GO)/i,
  "Short Course gap pack routes to BHXH policy decision checklist",
);

requireText(
  "docs/HEU_SHORT_COURSE_ATTENDANCE_PAYMENT_GAP_PACK_20260628_V01_DRAFT.md",
  /(?=[\s\S]*## 8\.3 Meal\/Allowance HR Payment Boundary Checklist)(?=[\s\S]*HEU_SHORT_COURSE_MEAL_ALLOWANCE_PAYMENT_BOUNDARY_CHECKLIST_20260703\.md)(?=[\s\S]*SC_MEAL_ALLOWANCE_BOUNDARY_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*SC-MEAL-EVID-01)(?=[\s\S]*SC-MEAL-EVID-06)(?=[\s\S]*SC-AP-05)(?=[\s\S]*SC-REV-03)(?=[\s\S]*SC-UAT-04)(?=[\s\S]*SC-SIGN-03)(?=[\s\S]*does not calculate allowance, approve meal\/allowance,\s+approve HR payment, approve teacher payment, create payroll effect, accept\s+evidence, execute UAT, approve owner GO\/NO-GO or mark production GO)/i,
  "Short Course gap pack routes to meal allowance payment boundary checklist",
);

requireText(
  "docs/HEU_SHORT_COURSE_ATTENDANCE_PAYMENT_GAP_PACK_20260628_V01_DRAFT.md",
  /(?=[\s\S]*## 8\.4 Invoice\/Payment Verification Checklist)(?=[\s\S]*HEU_SHORT_COURSE_INVOICE_PAYMENT_VERIFICATION_CHECKLIST_20260703\.md)(?=[\s\S]*SC_INVOICE_PAYMENT_VERIFICATION_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*SC-PAY-EVID-01)(?=[\s\S]*SC-PAY-EVID-06)(?=[\s\S]*SC-AP-06)(?=[\s\S]*SC-REV-04)(?=[\s\S]*SC-UAT-05)(?=[\s\S]*SC-SIGN-04)(?=[\s\S]*does not verify invoice\/payment, post voucher, approve\s+payment, approve reversal, close period, create statutory accounting effect,\s+accept evidence, execute UAT, approve owner GO\/NO-GO or mark production GO)/i,
  "Short Course gap pack routes to invoice payment verification checklist",
);

requireText(
  "docs/HEU_SHORT_COURSE_ATTENDANCE_PAYMENT_GAP_PACK_20260628_V01_DRAFT.md",
  /(?=[\s\S]*## 8\.5 Report-View Source Reconciliation Checklist)(?=[\s\S]*HEU_SHORT_COURSE_REPORT_VIEW_SOURCE_RECONCILIATION_CHECKLIST_20260703\.md)(?=[\s\S]*SC_REPORT_VIEW_SOURCE_RECONCILIATION_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*SC-RV-EVID-01)(?=[\s\S]*SC-RV-EVID-06)(?=[\s\S]*SC-AP-07)(?=[\s\S]*SC-REV-05)(?=[\s\S]*SC-UAT-06)(?=[\s\S]*SC-SIGN-05)(?=[\s\S]*DQ-RV-06)(?=[\s\S]*RV-EVID-05)(?=[\s\S]*does not approve report-view reliance, approve\s+dashboard reliance, accept DQ evidence, accept source reconciliation, execute\s+UAT, accept evidence, approve owner GO\/NO-GO or mark production GO)/i,
  "Short Course gap pack routes to report-view source reconciliation checklist",
);

requireText(
  "docs/HEU_SHORT_COURSE_ATTENDANCE_PAYMENT_GAP_PACK_20260628_V01_DRAFT.md",
  /(?=[\s\S]*## 8\.6 Role Scope And Negative-Access Checklist)(?=[\s\S]*HEU_SHORT_COURSE_ROLE_NEGATIVE_ACCESS_CHECKLIST_20260703\.md)(?=[\s\S]*SC_ROLE_NEGATIVE_ACCESS_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*SC-ROLE-EVID-01)(?=[\s\S]*SC-ROLE-EVID-06)(?=[\s\S]*SHORT-SCOPE-APP-GUARD)(?=[\s\S]*SHORT-SCOPE-WORKFLOWS)(?=[\s\S]*SHORT-SCOPE-ACTOR-LINK)(?=[\s\S]*NEGATIVE_CONTROL_QUEUE_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*P6_04_ACCESS_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*SC-UAT-07)(?=[\s\S]*SC-REV-06)(?=[\s\S]*SC-SIGN-06)(?=[\s\S]*does not create accounts, assign real users, grant\s+access, broaden scope, accept negative-control proof, accept role UAT, accept\s+evidence, approve access closure, approve owner GO\/NO-GO or mark production GO)/i,
  "Short Course gap pack routes to role negative-access checklist",
);

requireText(
  "docs/HEU_SHORT_COURSE_OWNER_SIGNOFF_MANIFEST_20260702.md",
  /(?=[\s\S]*Status:\s*DRAFT_CONTROL)(?=[\s\S]*Production status:\s*NO-GO)(?=[\s\S]*SHORT_COURSE_OWNER_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*SC-SIGN-01)(?=[\s\S]*SC-SIGN-06)(?=[\s\S]*Short Course remains `NO-GO` if any required owner decision is missing, unsigned)(?=[\s\S]*Passing the local audit proves only that the signoff template and boundary are[\s\S]*present)(?=[\s\S]*It does not prove that any owner has signed)/i,
  "Short Course owner signoff manifest document",
);

requireText(
  "docs/HEU_SHORT_COURSE_ATTENDANCE_PAYMENT_GAP_PACK_20260628_V01_DRAFT.md",
  /(?=[\s\S]*HEU_SHORT_COURSE_OWNER_SIGNOFF_MANIFEST_20260702\.md)(?=[\s\S]*SHORT_COURSE_OWNER_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*SC-SIGN-01)(?=[\s\S]*SC-SIGN-06)(?=[\s\S]*does not prove\s+owner approval until signatures and controlled evidence references exist[\s\S]*outside Codex\/chat)/i,
  "Short Course gap pack routes to owner signoff manifest",
);

requireText(
  "docs/HEU_SHORT_COURSE_UAT_RESULT_LEDGER_TEMPLATE_20260703.md",
  /(?=[\s\S]*Status:\s*DRAFT_CONTROL)(?=[\s\S]*Production status:\s*NO-GO)(?=[\s\S]*SC_UAT_RESULT_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*SC-UAT-LEDGER-01)(?=[\s\S]*SC-UAT-LEDGER-08)(?=[\s\S]*SC-REV-01)(?=[\s\S]*SC-SIGN-06)(?=[\s\S]*PASS_LOCAL, Codex or AI output is treated as owner approval)(?=[\s\S]*does not execute UAT,\s+accept evidence, approve attendance lock, approve payment, approve owner\s+GO\/NO-GO or mark production GO)(?=[\s\S]*does not prove that any UAT case has been executed or\s+accepted)/i,
  "Short Course UAT result ledger template",
);

requireText(
  "docs/HEU_SHORT_COURSE_ATTENDANCE_PAYMENT_GAP_PACK_20260628_V01_DRAFT.md",
  /(?=[\s\S]*## 11\. UAT Result Ledger Template)(?=[\s\S]*HEU_SHORT_COURSE_UAT_RESULT_LEDGER_TEMPLATE_20260703\.md)(?=[\s\S]*SC_UAT_RESULT_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*SC-UAT-LEDGER-01)(?=[\s\S]*SC-UAT-LEDGER-08)(?=[\s\S]*review handoff rows)(?=[\s\S]*owner signoff rows)(?=[\s\S]*does not execute UAT, accept evidence or approve owner\s+GO\/NO-GO)/i,
  "Short Course gap pack routes to UAT result ledger",
);

requireText(
  "docs/HEU_SHORT_COURSE_EXTERNAL_OWNER_ACTION_QUEUE_20260703.md",
  /(?=[\s\S]*Status:\s*PASS_LOCAL_OWNER_ACTION_QUEUE)(?=[\s\S]*SC_EXTERNAL_OWNER_ACTION_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*Production\/UAT status:\s*NO-GO)(?=[\s\S]*SC-OWNER-ACTION-01)(?=[\s\S]*SC-OWNER-ACTION-08)(?=[\s\S]*SC_UAT_RESULT_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*SHORT_COURSE_OWNER_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*does not execute UAT)(?=[\s\S]*approve owner GO\/NO-GO)(?=[\s\S]*mark production GO)/i,
  "Short Course external owner action queue document",
);

requireText(
  "docs/HEU_SHORT_COURSE_ATTENDANCE_PAYMENT_GAP_PACK_20260628_V01_DRAFT.md",
  /(?=[\s\S]*## 10\. External Owner Action Queue)(?=[\s\S]*HEU_SHORT_COURSE_EXTERNAL_OWNER_ACTION_QUEUE_20260703\.md)(?=[\s\S]*SC_EXTERNAL_OWNER_ACTION_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*SC-OWNER-ACTION-01 through SC-OWNER-ACTION-08)(?=[\s\S]*does not execute UAT, accept evidence, approve\s+finance reliance, approve access closure, approve owner GO\/NO-GO or mark\s+production GO)/i,
  "Short Course gap pack routes to external owner action queue",
);

requireText(
  "docs/HEU_IMPLEMENTATION_LOG.md",
  /## 2026-07-02 - P9-01 Short Course Review Handoff[\s\S]*data-heu-short-course-review-handoff="P9-01_REVIEW_HANDOFF"[\s\S]*SC-REV-01[\s\S]*SC-REV-06[\s\S]*SC_REVIEW_READY \/ NO_GO \/ BLOCKED[\s\S]*audit-heu-short-course-attendance-payment-gap-pack[\s\S]*does not\s+approve attendance lock[\s\S]*BHXH decision[\s\S]*meal\/allowance payment[\s\S]*invoice\/payment verification[\s\S]*UAT acceptance[\s\S]*evidence\s+acceptance[\s\S]*owner GO\/NO-GO[\s\S]*production GO/i,
  "implementation log Short Course review handoff entry",
);

requireText(
  "docs/HEU_IMPLEMENTATION_LOG.md",
  /## 2026-07-02 - P9-01 Short Course Owner Signoff Manifest[\s\S]*HEU_SHORT_COURSE_OWNER_SIGNOFF_MANIFEST_20260702\.md[\s\S]*SC-SIGN-01[\s\S]*SC-SIGN-06[\s\S]*SHORT_COURSE_OWNER_READY \/ NO_GO \/ BLOCKED[\s\S]*data-heu-short-course-owner-signoff="P9-01_OWNER_SIGNOFF_MANIFEST"[\s\S]*PENDING_OWNER[\s\S]*does not\s+approve attendance lock[\s\S]*BHXH decision[\s\S]*invoice\/payment verification[\s\S]*UAT acceptance[\s\S]*evidence\s+acceptance[\s\S]*owner GO\/NO-GO[\s\S]*production GO/i,
  "implementation log Short Course owner signoff manifest entry",
);

requireSectionTokens(
  "docs/HEU_IMPLEMENTATION_LOG.md",
  "2026-07-03 - TRN-03 Short Course Attendance Lock Evidence Checklist",
  [
    "HEU_SHORT_COURSE_ATTENDANCE_LOCK_EVIDENCE_CHECKLIST_20260703.md",
    "SC-LOCK-EVID-01",
    "SC-LOCK-EVID-06",
    "SC_ATTENDANCE_LOCK_EVIDENCE_READY / NO_GO / BLOCKED",
    'data-heu-short-course-attendance-lock-evidence="TRN-03_ATTENDANCE_LOCK_EVIDENCE"',
    "audit:heu-short-course-attendance-payment-gap-pack",
    "check:heu-training-module-completion-breakdown",
    "does not lock attendance",
    "approve attendance",
    "alter attendance",
    "accept evidence",
    "execute UAT",
    "approve payment",
    "owner GO/NO-GO",
    "production GO",
  ],
  "implementation log TRN-03 attendance lock evidence checklist entry",
);

requireSectionTokens(
  "docs/HEU_IMPLEMENTATION_LOG.md",
  "2026-07-03 - TRN-04 Short Course BHXH Policy Decision Checklist",
  [
    "HEU_SHORT_COURSE_BHXH_POLICY_DECISION_CHECKLIST_20260703.md",
    "SC-BHXH-EVID-01",
    "SC-BHXH-EVID-06",
    "SC_BHXH_POLICY_DECISION_READY / NO_GO / BLOCKED",
    'data-heu-short-course-bhxh-policy-decision="TRN-04_BHXH_POLICY_DECISION"',
    "audit:heu-short-course-attendance-payment-gap-pack",
    "check:heu-training-module-completion-breakdown",
    "does not approve BHXH/chinh sach",
    "decide eligibility",
    "create policy effect",
    "accept evidence",
    "execute UAT",
    "approve payment",
    "owner GO/NO-GO",
    "production GO",
  ],
  "implementation log TRN-04 BHXH policy decision checklist entry",
);

requireSectionTokens(
  "docs/HEU_IMPLEMENTATION_LOG.md",
  "2026-07-03 - TRN-05 Short Course Meal Allowance Payment Boundary Checklist",
  [
    "HEU_SHORT_COURSE_MEAL_ALLOWANCE_PAYMENT_BOUNDARY_CHECKLIST_20260703.md",
    "SC-MEAL-EVID-01",
    "SC-MEAL-EVID-06",
    "SC_MEAL_ALLOWANCE_BOUNDARY_READY / NO_GO / BLOCKED",
    'data-heu-short-course-meal-allowance-boundary="TRN-05_MEAL_ALLOWANCE_PAYMENT_BOUNDARY"',
    "audit:heu-short-course-attendance-payment-gap-pack",
    "check:heu-training-module-completion-breakdown",
    "does not calculate allowance",
    "approve meal/allowance",
    "approve HR payment",
    "approve teacher payment",
    "create payroll effect",
    "accept evidence",
    "execute UAT",
    "owner GO/NO-GO",
    "production GO",
  ],
  "implementation log TRN-05 meal allowance payment boundary checklist entry",
);

requireSectionTokens(
  "docs/HEU_IMPLEMENTATION_LOG.md",
  "2026-07-03 - TRN-06 Short Course Invoice Payment Verification Checklist",
  [
    "HEU_SHORT_COURSE_INVOICE_PAYMENT_VERIFICATION_CHECKLIST_20260703.md",
    "SC-PAY-EVID-01",
    "SC-PAY-EVID-06",
    "SC_INVOICE_PAYMENT_VERIFICATION_READY / NO_GO / BLOCKED",
    'data-heu-short-course-invoice-payment-verification="TRN-06_INVOICE_PAYMENT_VERIFICATION"',
    "audit:heu-short-course-attendance-payment-gap-pack",
    "check:heu-training-module-completion-breakdown",
    "does not verify invoice/payment",
    "post voucher",
    "approve payment",
    "approve reversal",
    "close period",
    "create statutory accounting effect",
    "accept evidence",
    "execute UAT",
    "owner GO/NO-GO",
    "production GO",
  ],
  "implementation log TRN-06 invoice payment verification checklist entry",
);

requireSectionTokens(
  "docs/HEU_IMPLEMENTATION_LOG.md",
  "2026-07-03 - TRN-07 Short Course Report View Source Reconciliation Checklist",
  [
    "HEU_SHORT_COURSE_REPORT_VIEW_SOURCE_RECONCILIATION_CHECKLIST_20260703.md",
    "SC-RV-EVID-01",
    "SC-RV-EVID-06",
    "SC_REPORT_VIEW_SOURCE_RECONCILIATION_READY / NO_GO / BLOCKED",
    'data-heu-short-course-report-view-source-reconciliation="TRN-07_REPORT_VIEW_SOURCE_RECONCILIATION"',
    "RV_SHORT_COURSE_ATTENDANCE_PAYMENT",
    "DQ-RV-06",
    "RV-EVID-05",
    "audit:heu-short-course-attendance-payment-gap-pack",
    "check:heu-training-module-completion-breakdown",
    "does not approve report-view reliance",
    "approve dashboard reliance",
    "accept DQ evidence",
    "accept source reconciliation",
    "execute UAT",
    "accept evidence",
    "owner GO/NO-GO",
    "production GO",
  ],
  "implementation log TRN-07 report-view source reconciliation checklist entry",
);

requireSectionTokens(
  "docs/HEU_IMPLEMENTATION_LOG.md",
  "2026-07-03 - TRN-08 Short Course Role Negative Access Checklist",
  [
    "HEU_SHORT_COURSE_ROLE_NEGATIVE_ACCESS_CHECKLIST_20260703.md",
    "SC-ROLE-EVID-01",
    "SC-ROLE-EVID-06",
    "SC_ROLE_NEGATIVE_ACCESS_READY / NO_GO / BLOCKED",
    'data-heu-short-course-role-negative-access="TRN-08_ROLE_NEGATIVE_ACCESS"',
    "SHORT-SCOPE-APP-GUARD",
    "SHORT-SCOPE-WORKFLOWS",
    "SHORT-SCOPE-ACTOR-LINK",
    "P6-04",
    "P0-17 access closure handoff",
    "audit:heu-short-course-attendance-payment-gap-pack",
    "check:heu-training-module-completion-breakdown",
    "does not create accounts",
    "assign real users",
    "grant access",
    "broaden scope",
    "accept negative-control proof",
    "accept role UAT",
    "approve access closure",
    "owner GO/NO-GO",
    "production GO",
  ],
  "implementation log TRN-08 role negative-access checklist entry",
);

requireSectionTokens(
  "docs/HEU_IMPLEMENTATION_LOG.md",
  "2026-07-03 - P9-01 Short Course UAT Result Ledger Guard",
  [
    "HEU_SHORT_COURSE_UAT_RESULT_LEDGER_TEMPLATE_20260703.md",
    "SC-UAT-LEDGER-01",
    "SC-UAT-LEDGER-08",
    "SC_UAT_RESULT_READY / NO_GO / BLOCKED",
    'data-heu-short-course-uat-result-ledger="P9-01_UAT_RESULT_LEDGER"',
    "table-fixed",
    "break-words",
    "does not",
    "execute UAT",
    "accept evidence",
    "approve attendance lock",
    "approve payment",
    "owner GO/NO-GO",
    "production GO",
  ],
  "implementation log Short Course UAT result ledger guard entry",
);

requireSectionTokens(
  "docs/HEU_IMPLEMENTATION_LOG.md",
  "2026-07-03 - P9-01 Short Course Control Propagation",
  [
    "HEU_CURRENT_STATE_INVENTORY.md",
    "HEU_SYSTEM_BUILD_BACKLOG.md",
    "HEU_MODULE_READINESS_GAP_MATRIX_20260628_V01_DRAFT.md",
    "TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
    "HEU_SHORT_COURSE_OWNER_SIGNOFF_MANIFEST_20260702.md",
    "HEU_SHORT_COURSE_UAT_RESULT_LEDGER_TEMPLATE_20260703.md",
    "SC-SIGN-01",
    "SC-SIGN-06",
    "SC-UAT-LEDGER-01",
    "SC-UAT-LEDGER-08",
    "SHORT_COURSE_OWNER_READY / NO_GO / BLOCKED",
    "SC_UAT_RESULT_READY / NO_GO / BLOCKED",
    "does not",
    "execute UAT",
    "accept evidence",
    "approve attendance lock",
    "approve payment",
    "owner GO/NO-GO",
    "production GO",
  ],
  "implementation log Short Course control propagation entry",
);

requireText(
  "AGENTS.md",
  /Required Reading Before Meaningful Changes[\s\S]*docs\/HEU_SHORT_COURSE_ATTENDANCE_PAYMENT_GAP_PACK_20260628_V01_DRAFT\.md[\s\S]*Before any final handoff[\s\S]*npm\.cmd run audit:heu-short-course-attendance-payment-gap-pack/i,
  "AGENTS required reading and final handoff audit",
);

requireText(
  "scripts/audit-ttgdtx-release-gates.mjs",
  /docs\/HEU_SHORT_COURSE_ATTENDANCE_PAYMENT_GAP_PACK_20260628_V01_DRAFT\.md[\s\S]*components\/short-course\/short-course-attendance-payment-gap-pack\.tsx[\s\S]*scripts\/audit-heu-short-course-attendance-payment-gap-pack\.mjs[\s\S]*audit:heu-short-course-attendance-payment-gap-pack/i,
  "release-gate file and script coverage",
);

if (failures.length > 0) {
  console.error("HEU Short Course attendance/payment gap-pack audit failed.");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(
  "HEU Short Course attendance/payment gap-pack audit passed. P9-01 remains PASS_LOCAL and production Short Course stays NO-GO.",
);
