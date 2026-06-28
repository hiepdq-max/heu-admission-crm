import {
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

function StatusBadge({ children }: { children: string }) {
  return (
    <span className="inline-flex rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700">
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
