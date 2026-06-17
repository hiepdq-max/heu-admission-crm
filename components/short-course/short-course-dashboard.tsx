import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Banknote,
  CheckCircle2,
  ClipboardCheck,
  GraduationCap,
  ListChecks,
  ShieldAlert,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";

export type ShortCourseKpiRow = {
  metric_code: string;
  metric_label: string;
  metric_group: string;
  metric_value: number | string | null;
  severity: string;
  owner_department: string | null;
  metric_note: string | null;
};

export type ShortCourseSummaryRow = {
  student_count: number | null;
  class_count: number | null;
  enrollment_count: number | null;
  attendance_session_count: number | null;
  bhxh_case_count: number | null;
  invoice_count: number | null;
  payment_count: number | null;
  open_risk_count: number | null;
  student_needs_fix_count: number | null;
  student_duplicate_risk_count: number | null;
  student_verified_count: number | null;
  class_needs_fix_count: number | null;
  class_open_ready_count: number | null;
  class_running_count: number | null;
  enrollment_unassigned_count: number | null;
  enrollment_assignment_blocked_count: number | null;
  enrollment_ready_for_class_open_count: number | null;
  enrollment_ready_for_attendance_count: number | null;
  attendance_needs_fix_count: number | null;
  attendance_ready_to_lock_count: number | null;
  attendance_locked_or_approved_count: number | null;
  bhxh_needs_fix_count: number | null;
  bhxh_ready_count: number | null;
  bhxh_approved_count: number | null;
  finance_needs_fix_count: number | null;
  finance_ready_count: number | null;
  finance_open_balance_vnd: number | string | null;
  payment_ready_to_verify_count: number | null;
  payment_needs_fix_count: number | null;
  payment_verified_count: number | null;
  payment_pending_count: number | null;
  payment_verified_amount_vnd: number | string | null;
  dashboard_exception_count: number | null;
  dashboard_critical_exception_count: number | null;
  dashboard_high_exception_count: number | null;
};

export type ShortCourseExceptionSummaryRow = {
  exception_group: string;
  module_step: string;
  owner_department: string;
  severity: string;
  exception_count: number;
  oldest_updated_at: string | null;
  newest_updated_at: string | null;
};

export type ShortCourseExceptionRow = {
  exception_code: string;
  module_step: string;
  exception_group: string;
  severity: string;
  exception_title: string;
  entity_type: string;
  entity_id: string;
  entity_code: string | null;
  entity_name: string | null;
  admission_segment_id: string | null;
  segment_code: string | null;
  segment_name: string | null;
  readiness_status: string;
  control_flags: string[] | null;
  owner_department: string;
  action_hint: string;
  source_view: string;
  updated_at: string | null;
};

type ShortCourseDashboardProps = {
  kpis: ShortCourseKpiRow[];
  summary: ShortCourseSummaryRow | null;
  exceptionSummary: ShortCourseExceptionSummaryRow[];
  exceptions: ShortCourseExceptionRow[];
  loadError?: string | null;
};

const severityTone: Record<string, string> = {
  LOW: "border-emerald-200 bg-emerald-50 text-emerald-700",
  MEDIUM: "border-amber-200 bg-amber-50 text-amber-700",
  HIGH: "border-orange-200 bg-orange-50 text-orange-700",
  CRITICAL: "border-rose-200 bg-rose-50 text-rose-700",
};

const groupLabels: Record<string, string> = {
  OPERATIONS: "Vận hành",
  EXCEPTION: "Exception",
  FINANCE: "Tài chính",
  COMPLIANCE: "Kiểm soát",
  DATA_QUALITY: "Chất lượng dữ liệu",
  OPERATION: "Vận hành",
};

const metricIcons: Record<string, typeof Users> = {
  TOTAL_STUDENTS: Users,
  OPEN_CLASSES: GraduationCap,
  OPEN_EXCEPTIONS: ShieldAlert,
  CRITICAL_EXCEPTIONS: AlertTriangle,
  FINANCE_OPEN_BALANCE: Banknote,
  PAYMENT_PENDING: Banknote,
  BHXH_NEEDS_FIX: ClipboardCheck,
  ATTENDANCE_NEEDS_FIX: ListChecks,
};

function numberValue(value: number | string | null | undefined) {
  if (value === null || value === undefined) {
    return 0;
  }

  if (typeof value === "number") {
    return value;
  }

  return Number(value) || 0;
}

function formatNumber(value: number | string | null | undefined) {
  return new Intl.NumberFormat("vi-VN").format(numberValue(value));
}

function formatMoney(value: number | string | null | undefined) {
  return `${new Intl.NumberFormat("vi-VN").format(numberValue(value))}đ`;
}

function formatDateTime(value: string | null | undefined) {
  if (!value) {
    return "Chưa có";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function metricDisplayValue(row: ShortCourseKpiRow) {
  if (row.metric_code === "FINANCE_OPEN_BALANCE") {
    return formatMoney(row.metric_value);
  }

  return formatNumber(row.metric_value);
}

function KpiCard({ row }: { row: ShortCourseKpiRow }) {
  const Icon = metricIcons[row.metric_code] ?? CheckCircle2;
  const tone =
    severityTone[row.severity] ?? "border-zinc-200 bg-zinc-50 text-zinc-700";

  return (
    <article className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className={`rounded-md border px-2 py-1 text-xs ${tone}`}>
            {groupLabels[row.metric_group] ?? row.metric_group}
          </span>
          <p className="mt-5 text-3xl font-semibold tracking-normal">
            {metricDisplayValue(row)}
          </p>
          <h2 className="mt-2 font-medium text-zinc-950">{row.metric_label}</h2>
          {row.metric_note ? (
            <p className="mt-2 text-sm leading-6 text-zinc-500">
              {row.metric_note}
            </p>
          ) : null}
        </div>
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-zinc-100">
          <Icon className="size-5 text-zinc-600" />
        </div>
      </div>
      {row.owner_department ? (
        <p className="mt-4 text-xs text-zinc-500">
          Owner: {row.owner_department}
        </p>
      ) : null}
    </article>
  );
}

function HealthItem({
  label,
  value,
  note,
}: {
  label: string;
  value: number | string | null | undefined;
  note: string;
}) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
      <p className="text-2xl font-semibold">{formatNumber(value)}</p>
      <p className="mt-1 text-sm font-medium text-zinc-900">{label}</p>
      <p className="mt-1 text-xs leading-5 text-zinc-500">{note}</p>
    </div>
  );
}

function ExceptionSummaryTable({
  rows,
}: {
  rows: ShortCourseExceptionSummaryRow[];
}) {
  return (
    <section className="rounded-lg border border-zinc-200 bg-white shadow-sm">
      <div className="border-b border-zinc-200 p-5">
        <h2 className="text-base font-semibold">Exception theo nhóm xử lý</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Gom lỗi theo module, owner và mức độ để trưởng phòng biết nơi cần gỡ.
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[840px] text-sm">
          <thead className="bg-zinc-50 text-left text-xs font-medium uppercase text-zinc-500">
            <tr>
              <th className="px-5 py-3">Module</th>
              <th className="px-5 py-3">Nhóm</th>
              <th className="px-5 py-3">Mức độ</th>
              <th className="px-5 py-3">Số lỗi</th>
              <th className="px-5 py-3">Owner</th>
              <th className="px-5 py-3">Mới nhất</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-6 text-center text-zinc-500">
                  Chưa có exception đang mở.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr
                  key={`${row.module_step}-${row.exception_group}-${row.severity}`}
                >
                  <td className="px-5 py-4 font-medium text-zinc-900">
                    {row.module_step}
                  </td>
                  <td className="px-5 py-4 text-zinc-600">
                    {groupLabels[row.exception_group] ?? row.exception_group}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`rounded-md border px-2 py-1 text-xs ${
                        severityTone[row.severity] ??
                        "border-zinc-200 bg-zinc-50 text-zinc-700"
                      }`}
                    >
                      {row.severity}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-zinc-700">
                    {formatNumber(row.exception_count)}
                  </td>
                  <td className="px-5 py-4 text-zinc-600">
                    {row.owner_department}
                  </td>
                  <td className="px-5 py-4 text-zinc-500">
                    {formatDateTime(row.newest_updated_at)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function ExceptionList({ rows }: { rows: ShortCourseExceptionRow[] }) {
  return (
    <section className="rounded-lg border border-zinc-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-zinc-200 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold">Việc cần xử lý gần nhất</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Mỗi dòng chỉ ra đúng chỗ sai. Phần đúng giữ nguyên, xử lý tại module
            gốc.
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/search?q=exception">
            Tìm exception
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
      <div className="divide-y divide-zinc-200">
        {rows.length === 0 ? (
          <div className="p-6 text-center text-sm text-zinc-500">
            Chưa có việc lỗi cần xử lý.
          </div>
        ) : (
          rows.map((row) => (
            <article key={row.exception_code} className="p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-md border px-2 py-1 text-xs ${
                        severityTone[row.severity] ??
                        "border-zinc-200 bg-zinc-50 text-zinc-700"
                      }`}
                    >
                      {row.severity}
                    </span>
                    <span className="font-mono text-xs text-zinc-500">
                      {row.exception_code}
                    </span>
                  </div>
                  <h3 className="mt-3 font-semibold text-zinc-950">
                    {row.exception_title}
                  </h3>
                  <p className="mt-1 text-sm text-zinc-600">
                    {row.entity_code ?? row.entity_type}
                    {row.entity_name ? ` · ${row.entity_name}` : ""}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-zinc-600">
                    {row.action_hint}
                  </p>
                  {row.control_flags && row.control_flags.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {row.control_flags.map((flag) => (
                        <span
                          key={flag}
                          className="rounded-md bg-zinc-100 px-2 py-1 text-xs text-zinc-600"
                        >
                          {flag}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
                <div className="text-sm text-zinc-500 sm:text-right">
                  <p>{row.module_step}</p>
                  <p>{row.owner_department}</p>
                  <p>{formatDateTime(row.updated_at)}</p>
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

export function ShortCourseDashboard({
  kpis,
  summary,
  exceptionSummary,
  exceptions,
  loadError,
}: ShortCourseDashboardProps) {
  if (loadError) {
    return (
      <section className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-800">
        <div className="flex items-start gap-3">
          <ShieldAlert className="mt-0.5 size-5 shrink-0" />
          <div>
            <h2 className="font-semibold">Chưa đọc được dashboard ngắn hạn</h2>
            <p className="mt-1">{loadError}</p>
            <p className="mt-2">
              Nếu lỗi báo thiếu view, hãy chạy lại các SQL từ P1-01 đến P1-10,
              đặc biệt là step74.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.length === 0 ? (
          <article className="rounded-lg border border-zinc-200 bg-white p-5 text-sm text-zinc-500 shadow-sm sm:col-span-2 xl:col-span-4">
            Chưa có KPI ngắn hạn. Hãy chạy SQL P1-10/step74 trước.
          </article>
        ) : (
          kpis.map((row) => <KpiCard key={row.metric_code} row={row} />)
        )}
      </section>

      <section className="rounded-lg border border-zinc-200 bg-white shadow-sm">
        <div className="border-b border-zinc-200 p-5">
          <h2 className="text-base font-semibold">Sức khỏe chuỗi vận hành</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Tóm tắt theo xương sống dữ liệu: học viên, lớp, ghi danh, điểm danh,
            chính sách, công nợ và thanh toán.
          </p>
        </div>
        <div className="grid gap-3 p-5 sm:grid-cols-2 xl:grid-cols-4">
          <HealthItem
            label="Học viên đã xác minh"
            value={summary?.student_verified_count}
            note="Student Master VERIFIED/VERIFIED_LOCKED"
          />
          <HealthItem
            label="Lớp sẵn sàng mở"
            value={summary?.class_open_ready_count}
            note="Class readiness OPEN_READY"
          />
          <HealthItem
            label="Ghi danh chưa xếp lớp"
            value={summary?.enrollment_unassigned_count}
            note="Cần DAO_TAO/CTHSSV xử lý"
          />
          <HealthItem
            label="Điểm danh đã khóa/duyệt"
            value={summary?.attendance_locked_or_approved_count}
            note="Nguồn dữ liệu gốc cho chính sách/tài chính"
          />
          <HealthItem
            label="BHXH/chính sách sẵn sàng"
            value={summary?.bhxh_ready_count}
            note="READY_TO_CHECK/READY_TO_SUBMIT/SUBMITTED"
          />
          <HealthItem
            label="Công nợ sẵn sàng"
            value={summary?.finance_ready_count}
            note="READY_TO_ISSUE/READY_TO_LOCK"
          />
          <HealthItem
            label="Thanh toán đã xác nhận"
            value={summary?.payment_verified_count}
            note={`${formatMoney(summary?.payment_verified_amount_vnd)} đã xác nhận`}
          />
          <HealthItem
            label="Rủi ro đang mở"
            value={summary?.open_risk_count}
            note="Risk alert chưa RESOLVED"
          />
        </div>
      </section>

      <ExceptionSummaryTable rows={exceptionSummary} />
      <ExceptionList rows={exceptions} />
    </div>
  );
}
