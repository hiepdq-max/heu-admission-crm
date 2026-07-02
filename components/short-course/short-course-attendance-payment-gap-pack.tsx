import Link from "next/link";
import {
  ArrowRightLeft,
  Banknote,
  ClipboardCheck,
  FileWarning,
  HandCoins,
  ListChecks,
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

      <div className="grid gap-5 border-t border-zinc-200 p-5 xl:grid-cols-[1.3fr_1fr]">
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
        className="border-t border-zinc-200 bg-zinc-50 p-5"
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
