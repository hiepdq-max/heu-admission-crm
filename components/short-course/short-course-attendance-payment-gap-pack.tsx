import Link from "next/link";
import {
  ArrowRightLeft,
  Banknote,
  ClipboardCheck,
  FileWarning,
  HandCoins,
  ListChecks,
  LockKeyhole,
  ShieldAlert,
  ShieldCheck,
  Utensils,
} from "lucide-react";

const controlRows = [
  {
    code: "SC-AP-01",
    label: "Enrollment basis",
    owner: "CTHSSV + Dao tao",
    gate: "Student, class, enrollment status and evidence are complete.",
  },
  {
    code: "SC-AP-02",
    label: "Attendance session",
    owner: "Dao tao",
    gate: "Session date, teacher/class owner and attendance lock state are known.",
  },
  {
    code: "SC-AP-03",
    label: "Attendance approval",
    owner: "Dao tao + Audit",
    gate: "Locked/approved attendance has signer, timestamp and exception route.",
  },
  {
    code: "SC-AP-04",
    label: "BHXH/chinh sach",
    owner: "CTHSSV + Phap Che",
    gate: "Policy case status, eligibility and evidence decision are signed.",
  },
  {
    code: "SC-AP-05",
    label: "Meal/allowance basis",
    owner: "Dao tao + HR/KHTC",
    gate: "Attendance-based meal or allowance basis is reconciled before payment.",
  },
  {
    code: "SC-AP-06",
    label: "Invoice/payment",
    owner: "KHTC",
    gate: "Invoice, payment status, voucher evidence and reversal rule are present.",
  },
  {
    code: "SC-AP-07",
    label: "Report view signoff",
    owner: "BGH + Audit",
    gate: "RV_SHORT_COURSE_ATTENDANCE_PAYMENT has DQ, owner signoff and UAT evidence.",
  },
  {
    code: "SC-AP-08",
    label: "Production stop rule",
    owner: "IT_DATA + Audit",
    gate: "No payroll, allowance, payment-period close or dashboard reliance before signed UAT.",
  },
];

const gapRows = [
  {
    area: "Attendance",
    current: "Sessions and locked/approved counts are visible on the dashboard.",
    gap: "Signed attendance UAT and exception evidence are still pending.",
  },
  {
    area: "BHXH/chinh sach",
    current: "Policy cases and readiness counts exist.",
    gap: "Owner decision, evidence class and legal basis need signed proof.",
  },
  {
    area: "Meal/HR payment",
    current: "Attendance can support allowance logic later.",
    gap: "Meal, teacher or HR payment rules are not approved for automation.",
  },
  {
    area: "Finance",
    current: "Invoices, payments and verified amount are summarized.",
    gap: "Payment verification, reversal and period lock UAT are still blockers.",
  },
];

const quickAccessRows = [
  {
    code: "SC-AP-01..08",
    label: "Attendance/payment gates",
    owner: "Dao tao + KHTC",
    href: "#short-course-control-table",
    summary:
      "Open attendance, BHXH, meal/allowance and invoice/payment controls.",
  },
  {
    code: "SC-SIGN-01..06",
    label: "Owner signoff",
    owner: "Process owners + Audit",
    href: "#short-course-owner-signoff",
    summary:
      "Review pending owner decisions before any Short Course reliance claim.",
  },
  {
    code: "SC-UAT-LEDGER",
    label: "UAT result ledger",
    owner: "Audit + IT_DATA",
    href: "#short-course-uat-result-ledger",
    summary:
      "Check SC-UAT-LEDGER-01 through 08 before any signed UAT statement.",
  },
];

const reviewHandoffRows = [
  {
    code: "SC-REV-01",
    owner: "Dao tao",
    review: "Attendance lock packet",
    proof:
      "Class list, session dates, locked attendance count, signer and exception route.",
    stop: "Attendance can still be edited, signer is missing or exception route is unclear.",
  },
  {
    code: "SC-REV-02",
    owner: "CTHSSV + Phap Che",
    review: "BHXH/chinh sach decision",
    proof:
      "Policy basis, eligibility decision, evidence class and owner/legal signer.",
    stop: "Policy decision is oral, unsigned or not tied to controlled evidence.",
  },
  {
    code: "SC-REV-03",
    owner: "HR + KHTC",
    review: "Meal/allowance formula",
    proof:
      "Formula version, attendance source, exception handling and payment boundary.",
    stop: "System can calculate or pay before policy signoff and signed UAT.",
  },
  {
    code: "SC-REV-04",
    owner: "KHTC",
    review: "Invoice/payment reconciliation",
    proof:
      "Invoice/payment source match, voucher reference, reversal rule and period-lock rule.",
    stop: "Payment is marked verified without voucher, reversal or source reconciliation.",
  },
  {
    code: "SC-REV-05",
    owner: "BGH + Audit",
    review: "Report view reliance",
    proof:
      "RV_SHORT_COURSE_ATTENDANCE_PAYMENT DQ result, source map and owner signoff route.",
    stop: "Dashboard is used for reliance before report-view owner signoff.",
  },
  {
    code: "SC-REV-06",
    owner: "IT_DATA + Audit",
    review: "Final UAT trace",
    proof:
      "SC-UAT-01 through SC-UAT-08 result, actor, evidence ref and reviewer decision.",
    stop: "PASS_LOCAL, Codex or AI output is treated as UAT acceptance or owner GO.",
  },
];

const attendanceLockEvidenceRows = [
  {
    code: "SC-LOCK-EVID-01",
    control: "SC-AP-02",
    proof:
      "Class code/name, session date, teacher/class owner and active Short Course segment label.",
    stop: "Class/session is missing, cross-scope or ownerless.",
  },
  {
    code: "SC-LOCK-EVID-02",
    control: "SC-AP-02/03",
    proof: "Attendance lock state, locked/approved count and lock timestamp.",
    stop: "Attendance can still be edited or lock state is unclear.",
  },
  {
    code: "SC-LOCK-EVID-03",
    control: "SC-AP-03",
    proof: "Signer/reviewer label, reviewer role and review timestamp.",
    stop: "Signer is missing, unsigned or stored only in Codex/chat.",
  },
  {
    code: "SC-LOCK-EVID-04",
    control: "SC-REV-01",
    proof:
      "Exception route, correction rule, exception owner and audit trace reference.",
    stop: "Attendance correction can bypass trace or owner review.",
  },
  {
    code: "SC-LOCK-EVID-05",
    control: "SC-UAT-01/02",
    proof:
      "Controlled UAT evidence reference for attendance readiness and attendance evidence trace.",
    stop: "Screenshot/ref is uncontrolled, raw-sensitive or missing.",
  },
  {
    code: "SC-LOCK-EVID-06",
    control: "SC-SIGN-01",
    proof: "Owner decision state for attendance lock packet before finance reliance.",
    stop: "Payment, meal/allowance, BHXH or report reliance starts before owner signoff.",
  },
];

const bhxhPolicyDecisionRows = [
  {
    code: "SC-BHXH-EVID-01",
    control: "SC-AP-04",
    proof:
      "Policy case identifier, active Short Course segment label and student/class linkage without raw PII in Git.",
    stop: "Policy case is missing, cross-scope or tied only to raw uncontrolled evidence.",
  },
  {
    code: "SC-BHXH-EVID-02",
    control: "SC-AP-04",
    proof: "Eligibility decision state, basis code and effective-date boundary.",
    stop: "Eligibility is oral, ambiguous, unsigned or lacks effective-date boundary.",
  },
  {
    code: "SC-BHXH-EVID-03",
    control: "SC-REV-02",
    proof: "Legal/SOP basis reference, evidence class and redaction class.",
    stop: "Legal basis is missing, unreviewed or stores raw sensitive proof in Git/Codex/chat.",
  },
  {
    code: "SC-BHXH-EVID-04",
    control: "SC-UAT-03",
    proof:
      "Controlled UAT evidence reference for BHXH/chinh sach route behavior and negative stop condition.",
    stop: "UAT evidence is uncontrolled, raw-sensitive, missing or bypasses owner/legal review.",
  },
  {
    code: "SC-BHXH-EVID-05",
    control: "SC-SIGN-02",
    proof: "Owner/legal signer label, role, decision timestamp and decision state.",
    stop: "Signer is missing, unsigned, delegated without authority or stored only in Codex/chat.",
  },
  {
    code: "SC-BHXH-EVID-06",
    control: "SC-AP-05/06",
    proof:
      "Downstream block proof showing meal/allowance, HR payment, invoice/payment and dashboard reliance remain locked until policy signoff.",
    stop: "Any downstream calculation, payment, verification or report reliance starts before signed policy decision.",
  },
];

const mealAllowanceBoundaryRows = [
  {
    code: "SC-MEAL-EVID-01",
    control: "SC-AP-05",
    proof: "Formula version, formula owner and effective-date boundary.",
    stop: "Formula is oral, ambiguous, unsigned or lacks effective-date boundary.",
  },
  {
    code: "SC-MEAL-EVID-02",
    control: "SC-AP-05",
    proof:
      "Attendance source reference tied to locked attendance packet and active Short Course segment label.",
    stop: "Attendance source is unlocked, cross-scope, unsigned or not tied to TRN-03.",
  },
  {
    code: "SC-MEAL-EVID-03",
    control: "SC-AP-04/05",
    proof:
      "Policy dependency reference showing BHXH/chinh sach decision state from TRN-04 before any formula reliance.",
    stop: "Formula relies on policy effect before signed policy decision.",
  },
  {
    code: "SC-MEAL-EVID-04",
    control: "SC-REV-03",
    proof:
      "Exception handling rule for absent/late/waived/adjusted attendance and manual owner route.",
    stop: "Exception can bypass owner review or audit trace.",
  },
  {
    code: "SC-MEAL-EVID-05",
    control: "SC-UAT-04",
    proof:
      "Controlled UAT evidence reference proving the route stays design-only and blocked from payment execution.",
    stop: "System calculates, approves or pays allowance/HR/teacher amount automatically.",
  },
  {
    code: "SC-MEAL-EVID-06",
    control: "SC-SIGN-03",
    proof:
      "Owner signer label, role, decision timestamp and blocked-payment proof before finance reliance.",
    stop: "Payment, payroll, invoice/payment verification or report reliance starts before owner signoff.",
  },
];

const invoicePaymentVerificationRows = [
  {
    code: "SC-PAY-EVID-01",
    control: "SC-AP-06",
    proof:
      "Invoice identifier, Short Course segment label, class/enrollment linkage and redaction class.",
    stop: "Invoice is missing, cross-scope, duplicated or stored only in uncontrolled proof.",
  },
  {
    code: "SC-PAY-EVID-02",
    control: "SC-AP-06",
    proof:
      "Payment status source, amount match state, payment date boundary and controlled voucher reference.",
    stop: "Payment is marked verified without source match, voucher reference or date boundary.",
  },
  {
    code: "SC-PAY-EVID-03",
    control: "SC-REV-04",
    proof:
      "Reversal/refund/adjustment rule with owner route and audit trace for mismatch cases.",
    stop: "Mismatch can be fixed manually without reversal rule, owner route or audit trail.",
  },
  {
    code: "SC-PAY-EVID-04",
    control: "SC-REV-04",
    proof:
      "Period-lock rule proving verified payment cannot close or affect statutory accounting before owner signoff.",
    stop: "Period close, statutory accounting or report reliance starts before signed evidence.",
  },
  {
    code: "SC-PAY-EVID-05",
    control: "SC-UAT-05",
    proof:
      "Controlled UAT evidence reference proving invoice/payment drilldown stays verification-gated.",
    stop: "UAT evidence is missing, uncontrolled or shows payment verified without voucher/reversal proof.",
  },
  {
    code: "SC-PAY-EVID-06",
    control: "SC-SIGN-04",
    proof:
      "Owner signer label, role, decision timestamp and blocked-verification proof before finance/report reliance.",
    stop: "Verified payment, period close, statutory accounting or dashboard reliance starts before owner signoff.",
  },
];

const reportViewReconciliationRows = [
  {
    code: "SC-RV-EVID-01",
    control: "SC-AP-07",
    proof:
      "RV_SHORT_COURSE_ATTENDANCE_PAYMENT source-map row, controlled source list and allowed consumer list.",
    stop: "Report view has missing source, hidden source or unlisted dashboard consumer.",
  },
  {
    code: "SC-RV-EVID-02",
    control: "DQ-RV-06",
    proof:
      "Class, student, attendance, invoice and payment linkage DQ result with controlled evidence reference.",
    stop: "Dashboard relies on payment period before attendance/payment linkage proof.",
  },
  {
    code: "SC-RV-EVID-03",
    control: "SC-REV-05",
    proof:
      "Source reconciliation result tying attendance lock, BHXH policy, meal/allowance and invoice/payment checklist states to the report view.",
    stop: "Source reconciliation omits upstream TRN-03 through TRN-06 blockers.",
  },
  {
    code: "SC-RV-EVID-04",
    control: "SC-UAT-06",
    proof:
      "Controlled UAT evidence reference proving /reports and /short-course keep the report view signoff-blocked.",
    stop: "Dashboard can be relied on before signed UAT and report-view owner decision.",
  },
  {
    code: "SC-RV-EVID-05",
    control: "SC-SIGN-05",
    proof:
      "Owner signer label, role, decision timestamp and report-view reliance decision state.",
    stop: "Signer is missing, unsigned, delegated without authority or stored only in Codex/chat.",
  },
  {
    code: "SC-RV-EVID-06",
    control: "RV-EVID-05",
    proof:
      "Evidence attachment queue reference proving report-view source reconciliation remains outside Git/Codex/chat when sensitive.",
    stop: "Raw attendance, payment, voucher, bank, personal or Drive evidence is stored in Git/Codex/chat.",
  },
];

const roleNegativeAccessRows = [
  {
    code: "SC-ROLE-EVID-01",
    control: "SHORT-SCOPE-APP-GUARD",
    proof:
      "/short-course, /short-course/intake, /short-course/workflows and related actions prove auth, workspace and Short Course segment guards before sensitive behavior.",
    stop: "Route queries Short Course data before auth/workspace guard or relies on UI-only hiding.",
  },
  {
    code: "SC-ROLE-EVID-02",
    control: "SHORT-SCOPE-WORKFLOWS",
    proof:
      "Workflow requests with concrete Short Course targets carry Short Course segment scope and cannot be updated from a different workspace.",
    stop: "Out-of-scope workspace can change workflow status or see private workflow detail.",
  },
  {
    code: "SC-ROLE-EVID-03",
    control: "SHORT-SCOPE-ACTOR-LINK",
    proof:
      "Actor labels for attendance, policy, invoice/payment and workflow rows resolve to active CRM profiles without raw identity data.",
    stop: "Actor is missing, inactive, broad, unidentified or stored with raw PII in Git/Codex/chat.",
  },
  {
    code: "SC-ROLE-EVID-04",
    control: "NEGATIVE_CONTROL_QUEUE_READY",
    proof:
      "REAL_OUT_OF_SCOPE_NEGATIVE_01 or owner-approved Short Course negative label receives BLOCKED or EMPTY_SCOPED_STATE for private Short Course data.",
    stop: "Negative account sees Short Course private payment, policy, attendance or student detail.",
  },
  {
    code: "SC-ROLE-EVID-05",
    control: "P6_04_ACCESS_READY",
    proof:
      "P6-04 role-scope UAT pack proves allowed DAO_TAO, CTHSSV, KHTC, HR, PHAP_CHE, IT_DATA and Audit lanes plus denied out-of-scope lane.",
    stop: "Any role sees private Short Course data outside approved scope or can execute finance/action paths.",
  },
  {
    code: "SC-ROLE-EVID-06",
    control: "SC-UAT-07 / SC-SIGN-06",
    proof:
      "Controlled evidence ref, reviewer, owner signer and P0-17 access closure handoff exist for role/negative-access result.",
    stop: "Signed role UAT, reviewer decision or access closure handoff is missing, unsigned or stored only in Codex/chat.",
  },
];

const ownerSignoffRows = [
  {
    code: "SC-SIGN-01",
    owner: "Dao tao",
    decision: "Attendance lock packet and exception route",
  },
  {
    code: "SC-SIGN-02",
    owner: "CTHSSV + Phap Che",
    decision: "BHXH/chinh sach eligibility and legal basis",
  },
  {
    code: "SC-SIGN-03",
    owner: "HR + KHTC",
    decision: "Meal/allowance formula boundary",
  },
  {
    code: "SC-SIGN-04",
    owner: "KHTC",
    decision: "Invoice/payment reconciliation, voucher and reversal rule",
  },
  {
    code: "SC-SIGN-05",
    owner: "BGH + Audit",
    decision: "RV_SHORT_COURSE_ATTENDANCE_PAYMENT reliance decision",
  },
  {
    code: "SC-SIGN-06",
    owner: "IT_DATA + Audit",
    decision: "Final UAT trace and access-scope check",
  },
];

const uatResultLedgerRows = [
  {
    code: "SC-UAT-LEDGER-01",
    uat: "SC-UAT-01",
    review: "SC-REV-01",
    signoff: "SC-SIGN-01",
    evidence: "Attendance readiness screenshot/ref plus route/user label.",
    stop: "Attendance is shown as final for payment.",
  },
  {
    code: "SC-UAT-LEDGER-02",
    uat: "SC-UAT-02",
    review: "SC-REV-01",
    signoff: "SC-SIGN-01",
    evidence: "Locked attendance signer, timestamp and exception route ref.",
    stop: "Attendance can be changed without trace.",
  },
  {
    code: "SC-UAT-LEDGER-03",
    uat: "SC-UAT-03",
    review: "SC-REV-02",
    signoff: "SC-SIGN-02",
    evidence: "Policy/legal basis, eligibility and evidence-class ref.",
    stop: "Policy decision bypasses legal/owner review.",
  },
  {
    code: "SC-UAT-LEDGER-04",
    uat: "SC-UAT-04",
    review: "SC-REV-03",
    signoff: "SC-SIGN-03",
    evidence: "Formula version, attendance source and blocked-payment proof.",
    stop: "System calculates or pays before policy signoff.",
  },
  {
    code: "SC-UAT-LEDGER-05",
    uat: "SC-UAT-05",
    review: "SC-REV-04",
    signoff: "SC-SIGN-04",
    evidence: "Invoice/payment source match, voucher ref and reversal/lock rule.",
    stop: "Payment is verified without voucher or source reconciliation.",
  },
  {
    code: "SC-UAT-LEDGER-06",
    uat: "SC-UAT-06",
    review: "SC-REV-05",
    signoff: "SC-SIGN-05",
    evidence: "RV_SHORT_COURSE_ATTENDANCE_PAYMENT DQ/source/signoff ref.",
    stop: "Dashboard is relied on before signed report-view owner decision.",
  },
  {
    code: "SC-UAT-LEDGER-07",
    uat: "SC-UAT-07",
    review: "SC-REV-06",
    signoff: "SC-SIGN-06",
    evidence: "Negative route/user evidence ref with scoped result.",
    stop: "Out-of-scope staff see private payment or policy detail.",
  },
  {
    code: "SC-UAT-LEDGER-08",
    uat: "SC-UAT-08",
    review: "SC-REV-06",
    signoff: "SC-SIGN-06",
    evidence: "Actor, owner, evidence ref, reviewer and decision trace row.",
    stop: "PASS_LOCAL, Codex or AI output is treated as owner approval.",
  },
];

const signedUatEvidenceRows = [
  {
    code: "SC-UAT-EVID-01",
    owner: "Audit + IT_DATA",
    evidence: "Controlled storage location and forbidden-content review.",
    stop: "Evidence is pasted into Git/Codex/chat or storage class is unknown.",
  },
  {
    code: "SC-UAT-EVID-02",
    owner: "Dao tao + Audit",
    evidence: "Signed attendance lock and exception-route UAT refs.",
    stop: "Attendance lock is treated as accepted from PASS_LOCAL.",
  },
  {
    code: "SC-UAT-EVID-03",
    owner: "CTHSSV + Phap Che",
    evidence: "Signed BHXH/chinh sach decision and legal basis refs.",
    stop: "Policy effect is trusted without owner/legal signoff.",
  },
  {
    code: "SC-UAT-EVID-04",
    owner: "HR + KHTC",
    evidence: "Signed meal/allowance and HR payment boundary refs.",
    stop: "System calculates or pays before signed payment boundary.",
  },
  {
    code: "SC-UAT-EVID-05",
    owner: "KHTC + Audit",
    evidence: "Signed invoice/payment, voucher, reversal and period-lock refs.",
    stop: "Invoice/payment is verified or period-closed without controlled evidence.",
  },
  {
    code: "SC-UAT-EVID-06",
    owner: "BGH + IT_DATA + Audit",
    evidence: "Signed RV_SHORT_COURSE_ATTENDANCE_PAYMENT source reconciliation refs.",
    stop: "Dashboard/report view is relied on before signed owner decision.",
  },
  {
    code: "SC-UAT-EVID-07",
    owner: "IT_DATA + Audit",
    evidence: "Signed role/negative-access UAT refs for scoped and denied accounts.",
    stop: "Out-of-scope user can see private attendance, policy or payment detail.",
  },
  {
    code: "SC-UAT-EVID-08",
    owner: "Final owner quorum",
    evidence: "Final owner quorum, linked UAT ledger and linked signoff refs.",
    stop: "Owner GO/NO-GO is missing, unsigned or inferred from local checks.",
  },
];

function StatusBadge({ children }: { children: string }) {
  return (
    <span className="inline-flex max-w-full rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-left text-xs font-medium leading-5 text-amber-700">
      {children}
    </span>
  );
}

export function ShortCourseAttendancePaymentGapPack() {
  return (
    <section
      data-heu-short-course-attendance-payment-gap-pack="P9-01"
      className="rounded-lg border border-zinc-200 bg-white shadow-sm"
    >
      <div className="border-b border-zinc-200 p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-zinc-100">
              <ListChecks className="size-5 text-zinc-600" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base font-semibold">
                  Short Course Attendance/Payment Gap Pack: PASS_LOCAL only
                </h2>
                <StatusBadge>
                  SC_ATTENDANCE_PAYMENT_READY / NO_GO / BLOCKED
                </StatusBadge>
              </div>
              <p className="mt-2 max-w-4xl text-sm leading-6 text-zinc-600">
                Gói này giữ điểm danh, BHXH/chính sách, suất ăn/phụ cấp, hóa
                đơn và thanh toán ngắn hạn trong một luồng kiểm soát. Nó chỉ
                chuẩn bị UAT, không khóa kỳ, không duyệt công, không chi tiền
                và không dùng dashboard làm căn cứ production.
              </p>
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2 text-xs font-medium">
            <span className="rounded-md bg-zinc-100 px-2 py-1 text-zinc-700">
              DRAFT_CONTROL
            </span>
            <span className="rounded-md bg-rose-50 px-2 py-1 text-rose-700">
              Production NO-GO
            </span>
          </div>
        </div>
      </div>

      <div
        className="border-b border-zinc-200 p-5"
        data-heu-short-course-quick-access="P9-01_SHORT_COURSE_QUICK_ACCESS"
        data-heu-short-course-quick-open="P9-01_SHORT_COURSE_QUICK_OPEN_TOP3"
        data-heu-short-course-quick-access-overflow-guard="P9-01_SHORT_COURSE_QUICK_ACCESS_NO_OVERFLOW"
      >
        <div className="mb-3 flex min-w-0 flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <div className="flex min-w-0 items-center gap-2 text-sm font-semibold text-zinc-950">
              <ListChecks className="size-4 shrink-0 text-zinc-600" />
              <span className="truncate">Short Course quick access</span>
            </div>
            <p className="mt-2 max-w-4xl break-words text-sm leading-6 text-zinc-600">
              Top three PASS_LOCAL anchors for Short Course review: attendance
              and payment gates, owner signoff and UAT result ledger.
            </p>
          </div>
          <StatusBadge>READ_ONLY_NAVIGATION / NO_GO / BLOCKED</StatusBadge>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          {quickAccessRows.map((row) => (
            <Link
              key={row.code}
              href={row.href}
              aria-label={`Open ${row.label} for ${row.code}`}
              title={`Open ${row.label}`}
              className="min-w-0 overflow-hidden rounded-md border border-zinc-200 bg-zinc-50 p-4 text-left transition hover:border-zinc-300 hover:bg-white"
            >
              <div className="flex min-w-0 items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-mono text-xs text-zinc-500">
                    {row.code}
                  </p>
                  <p className="mt-2 break-words text-sm font-semibold leading-5 text-zinc-950">
                    {row.label}
                  </p>
                </div>
                <ArrowRightLeft className="mt-0.5 size-4 shrink-0 text-zinc-500" />
              </div>
              <p className="mt-2 break-words text-xs font-medium leading-5 text-zinc-500">
                {row.owner}
              </p>
              <p className="mt-2 break-words text-sm leading-6 text-zinc-600">
                {row.summary}
              </p>
            </Link>
          ))}
        </div>
      </div>

      <div
        className="border-b border-zinc-200 p-5"
        data-heu-hou-short-course-scope-switch="REAL-OPS-07_QUICK_SCOPE_SWITCH"
        data-heu-hou-short-course-quick-link="SHORT_COURSE_TO_HOU"
      >
        <div className="flex min-w-0 flex-col gap-3 overflow-hidden rounded-md border border-zinc-200 bg-zinc-50 p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-sm font-semibold text-zinc-950">
              <ArrowRightLeft className="size-4 shrink-0 text-zinc-600" />
              <span className="truncate">Short Course / HOU scope switch</span>
            </div>
            <p className="mt-2 break-words text-sm leading-6 text-zinc-600">
              Quick access keeps Short Course attendance/payment and HOU ledger
              in separate PASS_LOCAL surfaces for REAL-OPS-07 review.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2 text-sm font-medium">
            <Link
              href="/hou"
              aria-label="Open HOU control surface from Short Course scope switch"
              title="Open HOU control surface"
              className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-700 hover:bg-zinc-100"
            >
              Open HOU
            </Link>
            <Link
              href="/master-control"
              aria-label="Open Master Control from Short Course scope switch"
              title="Open Master Control"
              className="rounded-md bg-zinc-950 px-3 py-2 text-white hover:bg-zinc-800"
            >
              Master Control
            </Link>
          </div>
        </div>
      </div>

      <div className="grid gap-4 p-5 lg:grid-cols-4">
        <div className="rounded-md bg-zinc-50 p-4">
          <div className="flex items-center gap-2 text-xs font-medium uppercase text-zinc-500">
            <ClipboardCheck className="size-4" />
            Attendance
          </div>
          <p className="mt-3 text-sm leading-6 text-zinc-700">
            Điểm danh chỉ được dùng cho tài chính khi session đã khóa, có người
            duyệt, có exception route và có evidence đã rà soát.
          </p>
        </div>
        <div className="rounded-md bg-zinc-50 p-4">
          <div className="flex items-center gap-2 text-xs font-medium uppercase text-zinc-500">
            <ShieldCheck className="size-4" />
            BHXH/chính sách
          </div>
          <p className="mt-3 text-sm leading-6 text-zinc-700">
            Case BHXH/chính sách cần eligibility, căn cứ pháp chế, bằng chứng
            và người ký trước khi downstream dựa vào.
          </p>
        </div>
        <div className="rounded-md bg-zinc-50 p-4">
          <div className="flex items-center gap-2 text-xs font-medium uppercase text-zinc-500">
            <Utensils className="size-4" />
            Meal/allowance
          </div>
          <p className="mt-3 text-sm leading-6 text-zinc-700">
            Suất ăn, phụ cấp hoặc chi giảng viên chỉ là mapping dự thảo cho đến
            khi có chính sách, công thức và UAT được ký.
          </p>
        </div>
        <div className="rounded-md bg-zinc-50 p-4">
          <div className="flex items-center gap-2 text-xs font-medium uppercase text-zinc-500">
            <Banknote className="size-4" />
            Finance
          </div>
          <p className="mt-3 text-sm leading-6 text-zinc-700">
            Invoice/payment cần chứng từ, trạng thái xác nhận, quy tắc hoàn/đảo
            và khóa kỳ trước khi báo cáo được tin cậy.
          </p>
        </div>
      </div>

      <div
        className="grid gap-5 border-t border-zinc-200 p-5 xl:grid-cols-[1.3fr_1fr]"
        id="short-course-control-table"
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[780px] text-sm">
            <thead className="bg-zinc-50 text-left text-xs font-medium uppercase text-zinc-500">
              <tr>
                <th className="px-4 py-3">Gate</th>
                <th className="px-4 py-3">Control</th>
                <th className="px-4 py-3">Owner</th>
                <th className="px-4 py-3">Required proof</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {controlRows.map((row) => (
                <tr key={row.code} className="align-top">
                  <td className="px-4 py-4 font-mono text-xs text-zinc-500">
                    {row.code}
                  </td>
                  <td className="px-4 py-4 font-medium text-zinc-950">
                    {row.label}
                  </td>
                  <td className="px-4 py-4 text-zinc-700">{row.owner}</td>
                  <td className="px-4 py-4 text-zinc-600">{row.gate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="space-y-3">
          {gapRows.map((row) => (
            <div key={row.area} className="rounded-md border border-zinc-200 p-4">
              <div className="flex items-center gap-2">
                <HandCoins className="size-4 text-zinc-600" />
                <p className="text-sm font-semibold text-zinc-950">
                  {row.area}
                </p>
              </div>
              <p className="mt-2 text-sm leading-6 text-zinc-600">
                {row.current}
              </p>
              <p className="mt-2 flex items-start gap-2 text-sm leading-6 text-amber-700">
                <FileWarning className="mt-0.5 size-4 shrink-0" />
                {row.gap}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div
        className="border-t border-zinc-200 p-5"
        data-heu-short-course-review-handoff="P9-01_REVIEW_HANDOFF"
        data-heu-short-course-review-decision="SC_REVIEW_READY_NO_GO_BLOCKED"
      >
        <div className="mb-4 flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-zinc-950">
              <ClipboardCheck className="size-4 text-zinc-600" />
              <span>Short Course review handoff</span>
            </div>
            <p className="mt-2 max-w-4xl text-sm leading-6 text-zinc-600">
              This checklist turns the P9-01 gap pack into a review queue for
              Dao tao, CTHSSV, KHTC, HR, Phap Che, BGH, IT_DATA and Audit. It
              prepares owner review only; signatures and evidence acceptance
              still happen outside Codex/chat.
            </p>
          </div>
          <StatusBadge>SC_REVIEW_READY / NO_GO / BLOCKED</StatusBadge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] table-fixed text-sm">
            <thead className="bg-zinc-50 text-left text-xs font-medium uppercase text-zinc-500">
              <tr>
                <th className="w-[18%] px-4 py-3">Review</th>
                <th className="w-[14%] px-4 py-3">Owner</th>
                <th className="w-[20%] px-4 py-3">What to check</th>
                <th className="w-[24%] px-4 py-3">Required proof</th>
                <th className="w-[24%] px-4 py-3">Stop condition</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {reviewHandoffRows.map((row) => (
                <tr key={row.code} className="align-top">
                  <td className="break-words px-4 py-4">
                    <p className="font-mono text-xs text-zinc-500">
                      {row.code}
                    </p>
                    <p className="mt-1 font-medium text-zinc-950">
                      {row.review}
                    </p>
                  </td>
                  <td className="whitespace-normal break-words px-4 py-4 text-zinc-700">
                    {row.owner}
                  </td>
                  <td className="whitespace-normal break-words px-4 py-4 text-zinc-600">
                    Owner checks current route, source and blocker state before
                    any signed UAT result.
                  </td>
                  <td className="whitespace-normal break-words px-4 py-4 text-zinc-600">
                    {row.proof}
                  </td>
                  <td className="whitespace-normal break-words px-4 py-4 text-amber-700">
                    {row.stop}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div
        id="short-course-attendance-lock-evidence"
        className="border-t border-zinc-200 p-5"
        data-heu-short-course-attendance-lock-evidence="TRN-03_ATTENDANCE_LOCK_EVIDENCE"
        data-heu-short-course-attendance-lock-decision="SC_ATTENDANCE_LOCK_EVIDENCE_READY_NO_GO_BLOCKED"
      >
        <div className="mb-4 flex min-w-0 flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-sm font-semibold text-zinc-950">
              <LockKeyhole className="size-4 text-zinc-600" />
              <span>Attendance lock evidence checklist</span>
            </div>
            <p className="mt-2 max-w-4xl break-words text-sm leading-6 text-zinc-600">
              Prepare TRN-03 evidence in
              docs/HEU_SHORT_COURSE_ATTENDANCE_LOCK_EVIDENCE_CHECKLIST_20260703.md.
              SC-LOCK-EVID-01 through SC-LOCK-EVID-06 must prove class/session
              scope, lock state, signer, exception route, SC-UAT-01/02 evidence
              refs and SC-SIGN-01 owner decision outside Codex/chat.
            </p>
          </div>
          <StatusBadge>
            SC_ATTENDANCE_LOCK_EVIDENCE_READY / NO_GO / BLOCKED
          </StatusBadge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] table-fixed text-sm">
            <thead className="bg-zinc-50 text-left text-xs font-medium uppercase text-zinc-500">
              <tr>
                <th className="w-[18%] px-4 py-3">Evidence</th>
                <th className="w-[14%] px-4 py-3">Control</th>
                <th className="w-[34%] px-4 py-3">Required proof</th>
                <th className="w-[34%] px-4 py-3">Stop condition</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {attendanceLockEvidenceRows.map((row) => (
                <tr key={row.code} className="align-top">
                  <td className="break-words px-4 py-4 font-mono text-xs text-zinc-500">
                    {row.code}
                  </td>
                  <td className="break-words px-4 py-4 font-medium text-zinc-950">
                    {row.control}
                  </td>
                  <td className="whitespace-normal break-words px-4 py-4 text-zinc-600">
                    {row.proof}
                  </td>
                  <td className="whitespace-normal break-words px-4 py-4 text-amber-700">
                    {row.stop}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-4 break-words text-sm leading-6 text-amber-700">
          PENDING_EXTERNAL_EVIDENCE: PASS_LOCAL does not lock attendance,
          approve attendance, alter attendance, accept evidence, execute UAT,
          approve payment, approve owner GO/NO-GO or mark production GO.
        </p>
      </div>

      <div
        id="short-course-bhxh-policy-decision"
        className="border-t border-zinc-200 p-5"
        data-heu-short-course-bhxh-policy-decision="TRN-04_BHXH_POLICY_DECISION"
        data-heu-short-course-bhxh-policy-status="SC_BHXH_POLICY_DECISION_READY_NO_GO_BLOCKED"
      >
        <div className="mb-4 flex min-w-0 flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-sm font-semibold text-zinc-950">
              <ShieldCheck className="size-4 text-zinc-600" />
              <span>BHXH/chinh sach decision checklist</span>
            </div>
            <p className="mt-2 max-w-4xl break-words text-sm leading-6 text-zinc-600">
              Prepare TRN-04 evidence in
              docs/HEU_SHORT_COURSE_BHXH_POLICY_DECISION_CHECKLIST_20260703.md.
              SC-BHXH-EVID-01 through SC-BHXH-EVID-06 must prove policy case
              scope, eligibility basis, legal/SOP review, SC-UAT-03 evidence,
              SC-SIGN-02 owner/legal decision and downstream payment/report
              blocks outside Codex/chat.
            </p>
          </div>
          <StatusBadge>
            SC_BHXH_POLICY_DECISION_READY / NO_GO / BLOCKED
          </StatusBadge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] table-fixed text-sm">
            <thead className="bg-zinc-50 text-left text-xs font-medium uppercase text-zinc-500">
              <tr>
                <th className="w-[18%] px-4 py-3">Evidence</th>
                <th className="w-[14%] px-4 py-3">Control</th>
                <th className="w-[34%] px-4 py-3">Required proof</th>
                <th className="w-[34%] px-4 py-3">Stop condition</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {bhxhPolicyDecisionRows.map((row) => (
                <tr key={row.code} className="align-top">
                  <td className="break-words px-4 py-4 font-mono text-xs text-zinc-500">
                    {row.code}
                  </td>
                  <td className="break-words px-4 py-4 font-medium text-zinc-950">
                    {row.control}
                  </td>
                  <td className="whitespace-normal break-words px-4 py-4 text-zinc-600">
                    {row.proof}
                  </td>
                  <td className="whitespace-normal break-words px-4 py-4 text-amber-700">
                    {row.stop}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-4 break-words text-sm leading-6 text-amber-700">
          PENDING_EXTERNAL_POLICY_DECISION: PASS_LOCAL does not approve
          BHXH/chinh sach, decide eligibility, create policy effect, accept
          evidence, execute UAT, approve payment, approve owner GO/NO-GO or
          mark production GO.
        </p>
      </div>

      <div
        id="short-course-meal-allowance-boundary"
        className="border-t border-zinc-200 p-5"
        data-heu-short-course-meal-allowance-boundary="TRN-05_MEAL_ALLOWANCE_PAYMENT_BOUNDARY"
        data-heu-short-course-meal-allowance-status="SC_MEAL_ALLOWANCE_BOUNDARY_READY_NO_GO_BLOCKED"
      >
        <div className="mb-4 flex min-w-0 flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-sm font-semibold text-zinc-950">
              <Utensils className="size-4 text-zinc-600" />
              <span>Meal/allowance payment boundary checklist</span>
            </div>
            <p className="mt-2 max-w-4xl break-words text-sm leading-6 text-zinc-600">
              Prepare TRN-05 evidence in
              docs/HEU_SHORT_COURSE_MEAL_ALLOWANCE_PAYMENT_BOUNDARY_CHECKLIST_20260703.md.
              SC-MEAL-EVID-01 through SC-MEAL-EVID-06 must prove formula
              version, locked attendance source, TRN-04 policy dependency,
              exception handling, SC-UAT-04 design-only evidence and SC-SIGN-03
              blocked-payment owner decision outside Codex/chat.
            </p>
          </div>
          <StatusBadge>
            SC_MEAL_ALLOWANCE_BOUNDARY_READY / NO_GO / BLOCKED
          </StatusBadge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] table-fixed text-sm">
            <thead className="bg-zinc-50 text-left text-xs font-medium uppercase text-zinc-500">
              <tr>
                <th className="w-[18%] px-4 py-3">Evidence</th>
                <th className="w-[14%] px-4 py-3">Control</th>
                <th className="w-[34%] px-4 py-3">Required proof</th>
                <th className="w-[34%] px-4 py-3">Stop condition</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {mealAllowanceBoundaryRows.map((row) => (
                <tr key={row.code} className="align-top">
                  <td className="break-words px-4 py-4 font-mono text-xs text-zinc-500">
                    {row.code}
                  </td>
                  <td className="break-words px-4 py-4 font-medium text-zinc-950">
                    {row.control}
                  </td>
                  <td className="whitespace-normal break-words px-4 py-4 text-zinc-600">
                    {row.proof}
                  </td>
                  <td className="whitespace-normal break-words px-4 py-4 text-amber-700">
                    {row.stop}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-4 break-words text-sm leading-6 text-amber-700">
          PENDING_EXTERNAL_PAYMENT_BOUNDARY: PASS_LOCAL does not calculate
          allowance, approve meal/allowance, approve HR payment, approve teacher
          payment, create payroll effect, accept evidence, execute UAT, approve
          owner GO/NO-GO or mark production GO.
        </p>
      </div>

      <div
        id="short-course-invoice-payment-verification"
        className="border-t border-zinc-200 p-5"
        data-heu-short-course-invoice-payment-verification="TRN-06_INVOICE_PAYMENT_VERIFICATION"
        data-heu-short-course-invoice-payment-status="SC_INVOICE_PAYMENT_VERIFICATION_READY_NO_GO_BLOCKED"
      >
        <div className="mb-4 flex min-w-0 flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-sm font-semibold text-zinc-950">
              <Banknote className="size-4 text-zinc-600" />
              <span>Invoice/payment verification checklist</span>
            </div>
            <p className="mt-2 max-w-4xl break-words text-sm leading-6 text-zinc-600">
              Prepare TRN-06 evidence in
              docs/HEU_SHORT_COURSE_INVOICE_PAYMENT_VERIFICATION_CHECKLIST_20260703.md.
              SC-PAY-EVID-01 through SC-PAY-EVID-06 must prove invoice source
              scope, payment/voucher match, reversal rule, period-lock rule,
              SC-UAT-05 verification evidence and SC-SIGN-04 blocked-verification
              owner decision outside Codex/chat.
            </p>
          </div>
          <StatusBadge>
            SC_INVOICE_PAYMENT_VERIFICATION_READY / NO_GO / BLOCKED
          </StatusBadge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] table-fixed text-sm">
            <thead className="bg-zinc-50 text-left text-xs font-medium uppercase text-zinc-500">
              <tr>
                <th className="w-[18%] px-4 py-3">Evidence</th>
                <th className="w-[14%] px-4 py-3">Control</th>
                <th className="w-[34%] px-4 py-3">Required proof</th>
                <th className="w-[34%] px-4 py-3">Stop condition</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {invoicePaymentVerificationRows.map((row) => (
                <tr key={row.code} className="align-top">
                  <td className="break-words px-4 py-4 font-mono text-xs text-zinc-500">
                    {row.code}
                  </td>
                  <td className="break-words px-4 py-4 font-medium text-zinc-950">
                    {row.control}
                  </td>
                  <td className="whitespace-normal break-words px-4 py-4 text-zinc-600">
                    {row.proof}
                  </td>
                  <td className="whitespace-normal break-words px-4 py-4 text-amber-700">
                    {row.stop}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-4 break-words text-sm leading-6 text-amber-700">
          PENDING_EXTERNAL_PAYMENT_VERIFICATION: PASS_LOCAL does not verify
          invoice/payment, post voucher, approve payment, approve reversal,
          close period, create statutory accounting effect, accept evidence,
          execute UAT, approve owner GO/NO-GO or mark production GO.
        </p>
      </div>

      <div
        id="short-course-report-view-reconciliation"
        className="border-t border-zinc-200 p-5"
        data-heu-short-course-report-view-source-reconciliation="TRN-07_REPORT_VIEW_SOURCE_RECONCILIATION"
        data-heu-short-course-report-view-status="SC_REPORT_VIEW_SOURCE_RECONCILIATION_READY_NO_GO_BLOCKED"
      >
        <div className="mb-4 flex min-w-0 flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-sm font-semibold text-zinc-950">
              <ClipboardCheck className="size-4 text-zinc-600" />
              <span>Report-view source reconciliation checklist</span>
            </div>
            <p className="mt-2 max-w-4xl break-words text-sm leading-6 text-zinc-600">
              Prepare TRN-07 evidence in
              docs/HEU_SHORT_COURSE_REPORT_VIEW_SOURCE_RECONCILIATION_CHECKLIST_20260703.md.
              SC-RV-EVID-01 through SC-RV-EVID-06 must prove source-map scope,
              DQ-RV-06 linkage, upstream TRN-03 through TRN-06 blockers,
              SC-UAT-06 signoff-block evidence and SC-SIGN-05 report-view owner
              decision outside Codex/chat.
            </p>
          </div>
          <StatusBadge>
            SC_REPORT_VIEW_SOURCE_RECONCILIATION_READY / NO_GO / BLOCKED
          </StatusBadge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1040px] table-fixed text-sm">
            <thead className="bg-zinc-50 text-left text-xs font-medium uppercase text-zinc-500">
              <tr>
                <th className="w-[18%] px-4 py-3">Evidence</th>
                <th className="w-[14%] px-4 py-3">Control</th>
                <th className="w-[34%] px-4 py-3">Required proof</th>
                <th className="w-[34%] px-4 py-3">Stop condition</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {reportViewReconciliationRows.map((row) => (
                <tr key={row.code} className="align-top">
                  <td className="break-words px-4 py-4 font-mono text-xs text-zinc-500">
                    {row.code}
                  </td>
                  <td className="break-words px-4 py-4 font-medium text-zinc-950">
                    {row.control}
                  </td>
                  <td className="whitespace-normal break-words px-4 py-4 text-zinc-600">
                    {row.proof}
                  </td>
                  <td className="whitespace-normal break-words px-4 py-4 text-amber-700">
                    {row.stop}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-4 break-words text-sm leading-6 text-amber-700">
          PENDING_EXTERNAL_REPORT_VIEW_RECONCILIATION: PASS_LOCAL does not
          approve report-view reliance, approve dashboard reliance, accept DQ
          evidence, accept source reconciliation, execute UAT, accept evidence,
          approve owner GO/NO-GO or mark production GO.
        </p>
      </div>

      <div
        id="short-course-role-negative-access"
        className="border-t border-zinc-200 p-5"
        data-heu-short-course-role-negative-access="TRN-08_ROLE_NEGATIVE_ACCESS"
        data-heu-short-course-role-negative-access-status="SC_ROLE_NEGATIVE_ACCESS_READY_NO_GO_BLOCKED"
      >
        <div className="mb-4 flex min-w-0 flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-sm font-semibold text-zinc-950">
              <ClipboardCheck className="size-4 text-zinc-600" />
              <span>Role scope and negative-access checklist</span>
            </div>
            <p className="mt-2 max-w-4xl break-words text-sm leading-6 text-zinc-600">
              Prepare TRN-08 evidence in
              docs/HEU_SHORT_COURSE_ROLE_NEGATIVE_ACCESS_CHECKLIST_20260703.md.
              SC-ROLE-EVID-01 through SC-ROLE-EVID-06 must prove guarded
              Short Course routes, workflow scope, actor links, negative-account
              denial, P6-04 role-scope UAT alignment and P0-17 access closure
              handoff outside Codex/chat.
            </p>
          </div>
          <StatusBadge>
            SC_ROLE_NEGATIVE_ACCESS_READY / NO_GO / BLOCKED
          </StatusBadge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1040px] table-fixed text-sm">
            <thead className="bg-zinc-50 text-left text-xs font-medium uppercase text-zinc-500">
              <tr>
                <th className="w-[18%] px-4 py-3">Evidence</th>
                <th className="w-[14%] px-4 py-3">Control</th>
                <th className="w-[34%] px-4 py-3">Required proof</th>
                <th className="w-[34%] px-4 py-3">Stop condition</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {roleNegativeAccessRows.map((row) => (
                <tr key={row.code} className="align-top">
                  <td className="break-words px-4 py-4 font-mono text-xs text-zinc-500">
                    {row.code}
                  </td>
                  <td className="break-words px-4 py-4 font-medium text-zinc-950">
                    {row.control}
                  </td>
                  <td className="whitespace-normal break-words px-4 py-4 text-zinc-600">
                    {row.proof}
                  </td>
                  <td className="whitespace-normal break-words px-4 py-4 text-amber-700">
                    {row.stop}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-4 break-words text-sm leading-6 text-amber-700">
          PENDING_EXTERNAL_ROLE_NEGATIVE_ACCESS: PASS_LOCAL does not create accounts, assign real users, grant access, broaden scope, accept negative-control proof, accept role UAT, accept evidence, approve access closure, approve owner GO/NO-GO or mark production GO.
        </p>
      </div>

      <div
        id="short-course-uat-result-ledger"
        className="border-t border-zinc-200 p-5"
        data-heu-short-course-uat-result-ledger="P9-01_UAT_RESULT_LEDGER"
        data-heu-short-course-uat-result-decision="SC_UAT_RESULT_READY_NO_GO_BLOCKED"
      >
        <div className="mb-4 flex min-w-0 flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-sm font-semibold text-zinc-950">
              <ListChecks className="size-4 text-zinc-600" />
              <span>Short Course UAT result ledger</span>
            </div>
            <p className="mt-2 max-w-4xl break-words text-sm leading-6 text-zinc-600">
              Record SC-UAT-01 through SC-UAT-08 in
              docs/HEU_SHORT_COURSE_UAT_RESULT_LEDGER_TEMPLATE_20260703.md
              before owner signoff. Each row needs a controlled evidence ref,
              reviewer and linked SC-REV/SC-SIGN decision outside Codex/chat.
            </p>
          </div>
          <StatusBadge>SC_UAT_RESULT_READY / NO_GO / BLOCKED</StatusBadge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1020px] table-fixed text-sm">
            <thead className="bg-zinc-50 text-left text-xs font-medium uppercase text-zinc-500">
              <tr>
                <th className="w-[16%] px-4 py-3">Ledger</th>
                <th className="w-[12%] px-4 py-3">UAT</th>
                <th className="w-[12%] px-4 py-3">Review</th>
                <th className="w-[12%] px-4 py-3">Signoff</th>
                <th className="w-[24%] px-4 py-3">Evidence ref</th>
                <th className="w-[24%] px-4 py-3">Stop condition</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {uatResultLedgerRows.map((row) => (
                <tr key={row.code} className="align-top">
                  <td className="break-words px-4 py-4 font-mono text-xs text-zinc-500">
                    {row.code}
                  </td>
                  <td className="break-words px-4 py-4 font-medium text-zinc-950">
                    {row.uat}
                  </td>
                  <td className="break-words px-4 py-4 text-zinc-700">
                    {row.review}
                  </td>
                  <td className="break-words px-4 py-4 text-zinc-700">
                    {row.signoff}
                  </td>
                  <td className="whitespace-normal break-words px-4 py-4 text-zinc-600">
                    {row.evidence}
                  </td>
                  <td className="whitespace-normal break-words px-4 py-4 text-amber-700">
                    {row.stop}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div
        id="short-course-signed-uat-evidence"
        className="border-t border-zinc-200 bg-zinc-50 p-5"
        data-heu-short-course-signed-uat-evidence-intake="P9-10_SIGNED_UAT_EVIDENCE_INTAKE"
        data-heu-short-course-signed-uat-evidence-doc="HEU_SHORT_COURSE_SIGNED_UAT_EVIDENCE_INTAKE_20260704"
        data-heu-short-course-signed-uat-evidence-decision="SC_SIGNED_UAT_EVIDENCE_READY_NO_GO_BLOCKED"
        data-heu-short-course-signed-uat-evidence-overflow-guard="P9-10_SHORT_COURSE_SIGNED_UAT_EVIDENCE_NO_OVERFLOW"
      >
        <div className="mb-4 flex min-w-0 flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-sm font-semibold text-zinc-950">
              <ClipboardCheck className="size-4 text-zinc-600" />
              <span>Short Course signed UAT evidence intake</span>
            </div>
            <p className="mt-2 max-w-4xl break-words text-sm leading-6 text-zinc-600">
              Record SC-UAT-EVID-01 through SC-UAT-EVID-08 in
              docs/HEU_SHORT_COURSE_SIGNED_UAT_EVIDENCE_INTAKE_20260704.md
              after external owners complete real UAT. This captures only
              controlled evidence references, signer lanes, redaction reviewer,
              signed date, result and blocker state outside Codex/chat.
            </p>
          </div>
          <StatusBadge>SC_SIGNED_UAT_EVIDENCE_READY / NO_GO / BLOCKED</StatusBadge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] table-fixed text-sm">
            <thead className="bg-white text-left text-xs font-medium uppercase text-zinc-500">
              <tr>
                <th className="w-[16%] px-4 py-3">Evidence</th>
                <th className="w-[18%] px-4 py-3">Owner lane</th>
                <th className="w-[33%] px-4 py-3">Required ref</th>
                <th className="w-[33%] px-4 py-3">Stop condition</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 bg-white">
              {signedUatEvidenceRows.map((row) => (
                <tr key={row.code} className="align-top">
                  <td className="break-words px-4 py-4 font-mono text-xs text-zinc-500">
                    {row.code}
                  </td>
                  <td className="break-words px-4 py-4 font-medium text-zinc-950">
                    {row.owner}
                  </td>
                  <td className="whitespace-normal break-words px-4 py-4 text-zinc-600">
                    {row.evidence}
                  </td>
                  <td className="whitespace-normal break-words px-4 py-4 text-amber-700">
                    {row.stop}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-4 break-words text-sm leading-6 text-amber-700">
          PENDING_EXTERNAL_SIGNED_UAT_EVIDENCE: PASS_LOCAL does not execute UAT, accept evidence, approve attendance lock, approve BHXH/chinh sach, approve meal/allowance, approve HR payment, approve teacher payment, verify invoice/payment, approve report-view reliance, approve dashboard reliance, approve role UAT, approve access closure, approve owner GO/NO-GO or mark production GO.
        </p>
      </div>

      <div
        id="short-course-owner-signoff"
        className="border-t border-zinc-200 bg-white p-5"
        data-heu-short-course-owner-signoff="P9-01_OWNER_SIGNOFF_MANIFEST"
        data-heu-short-course-owner-decision="SHORT_COURSE_OWNER_READY_NO_GO_BLOCKED"
      >
        <div className="mb-4 flex min-w-0 flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-sm font-semibold text-zinc-950">
              <ShieldCheck className="size-4 text-zinc-600" />
              <span>Short Course owner signoff manifest</span>
            </div>
            <p className="mt-2 max-w-4xl break-words text-sm leading-6 text-zinc-600">
              Owner decisions must be recorded outside Codex/chat in
              docs/HEU_SHORT_COURSE_OWNER_SIGNOFF_MANIFEST_20260702.md with
              controlled evidence references. Missing, unsigned, NO-GO or
              BLOCKED owner decisions keep Short Course production locked.
            </p>
          </div>
          <StatusBadge>SHORT_COURSE_OWNER_READY / NO_GO / BLOCKED</StatusBadge>
        </div>

        <div className="grid min-w-0 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {ownerSignoffRows.map((row) => (
            <article
              key={row.code}
              className="min-w-0 overflow-hidden rounded-md border border-zinc-200 bg-white p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="font-mono text-xs text-zinc-500">
                  {row.code}
                </span>
                <span className="shrink-0 rounded-md bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700">
                  PENDING_OWNER
                </span>
              </div>
              <p className="mt-3 break-words text-sm font-semibold text-zinc-950">
                {row.owner}
              </p>
              <p className="mt-2 break-words text-sm leading-6 text-zinc-600">
                {row.decision}
              </p>
            </article>
          ))}
        </div>
      </div>

      <div className="border-t border-zinc-200 bg-amber-50 px-5 py-4">
        <div className="flex items-start gap-2 text-sm leading-6 text-amber-800">
          <ShieldAlert className="mt-0.5 size-4 shrink-0" />
          <p>
            PASS_LOCAL does not approve attendance lock, BHXH decision,
            meal/allowance payment, HR payment, invoice/payment verification,
            period close, statutory accounting, UAT acceptance, evidence
            acceptance, owner GO or production GO.
          </p>
        </div>
      </div>
    </section>
  );
}
