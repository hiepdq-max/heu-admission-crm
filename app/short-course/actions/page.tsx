import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Banknote,
  CalendarCheck,
  ClipboardCheck,
  FileSearch,
  GraduationCap,
  ListChecks,
  RefreshCcw,
  Search,
  ShieldAlert,
  Users,
} from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import {
  admissionWorkspaceSegmentIds,
  applyAdmissionSegmentIds,
  firstParam,
  getAdmissionWorkspaceContext,
  withAdmissionSegmentParam,
} from "@/lib/workspace";

type ActionCenterPageProps = {
  searchParams?: Promise<{
    q?: string | string[];
    owner?: string | string[];
    priority?: string | string[];
    segment?: string | string[];
  }>;
};

type Priority = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

type StudentRow = {
  id: string;
  student_code: string;
  student_name: string;
  student_phone: string | null;
  identity_no: string | null;
  student_status: string | null;
  lead_id: string | null;
  updated_at: string | null;
};

type ClassRow = {
  id: string;
  class_code: string;
  class_name: string;
  training_location: string | null;
  instructor_name: string | null;
  planned_start_date: string | null;
  capacity: number | null;
  class_status: string | null;
  updated_at: string | null;
};

type EnrollmentRow = {
  id: string;
  enrollment_code: string;
  class_id: string | null;
  enrollment_status: string | null;
  attendance_status: string | null;
  finance_status: string | null;
  bhxh_policy_status: string | null;
  evidence_status: string | null;
  updated_at: string | null;
};

type AttendanceRow = {
  id: string;
  session_code: string;
  session_date: string;
  session_title: string | null;
  session_status: string | null;
  attendance_locked: boolean | null;
  updated_at: string | null;
};

type BhxhRow = {
  id: string;
  case_code: string;
  eligibility_status: string | null;
  case_status: string | null;
  updated_at: string | null;
};

type InvoiceRow = {
  id: string;
  invoice_code: string;
  balance_amount_vnd: number | string | null;
  due_date: string | null;
  invoice_status: string | null;
  updated_at: string | null;
};

type PaymentRow = {
  id: string;
  payment_code: string;
  payment_amount_vnd: number | string | null;
  payment_date: string | null;
  payment_status: string | null;
  voucher_no: string | null;
  updated_at: string | null;
};

type RiskRow = {
  id: string;
  alert_code: string;
  alert_type: string | null;
  alert_title: string;
  entity_id: string | null;
  entity_code: string | null;
  severity: string | null;
  alert_status: string | null;
  owner_department: string | null;
  note: string | null;
  updated_at: string | null;
};

type ActionTask = {
  id: string;
  taskCode: string;
  title: string;
  reason: string;
  group: string;
  priority: Priority;
  owner: string;
  source: string;
  status: string;
  dueLabel: string;
  updatedAt: string | null;
  actionHref: string;
  actionLabel: string;
};

const priorityOrder: Record<Priority, number> = {
  CRITICAL: 0,
  HIGH: 1,
  MEDIUM: 2,
  LOW: 3,
};

const priorityLabels: Record<Priority, string> = {
  CRITICAL: "Khẩn cấp",
  HIGH: "Cao",
  MEDIUM: "Trung bình",
  LOW: "Thấp",
};

const priorityTone: Record<Priority, string> = {
  CRITICAL: "border-rose-200 bg-rose-50 text-rose-700",
  HIGH: "border-orange-200 bg-orange-50 text-orange-700",
  MEDIUM: "border-amber-200 bg-amber-50 text-amber-700",
  LOW: "border-emerald-200 bg-emerald-50 text-emerald-700",
};

const groupIcons: Record<string, typeof ListChecks> = {
  STUDENT: Users,
  CLASS: GraduationCap,
  ENROLLMENT: ListChecks,
  ATTENDANCE: CalendarCheck,
  BHXH: ClipboardCheck,
  FINANCE: Banknote,
  PAYMENT: Banknote,
  RISK: ShieldAlert,
};

function normalizeSearch(value: string | null | undefined) {
  return (value ?? "").trim().toLowerCase();
}

function normalizePriority(value: string | null | undefined) {
  if (value && value in priorityOrder) {
    return value as Priority;
  }

  return null;
}

function numericValue(value: number | string | null | undefined) {
  if (value === null || value === undefined) {
    return 0;
  }

  if (typeof value === "number") {
    return value;
  }

  return Number(value) || 0;
}

function formatMoney(value: number | string | null | undefined) {
  return `${new Intl.NumberFormat("vi-VN").format(numericValue(value))}đ`;
}

function formatDate(value: string | null | undefined) {
  if (!value) {
    return "Chưa có";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
  }).format(new Date(value));
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

function startOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

function isPastDate(value: string | null | undefined) {
  if (!value) {
    return false;
  }

  return new Date(value).getTime() < startOfToday().getTime();
}

function isDueTodayOrPast(value: string | null | undefined) {
  if (!value) {
    return false;
  }

  return new Date(value).getTime() <= startOfToday().getTime();
}

function drilldownHref(
  type: string,
  entityId: string,
  segmentId: string | null,
) {
  return withAdmissionSegmentParam(
    `/short-course/drilldown?type=${type}&entityId=${entityId}`,
    segmentId,
  );
}

function actionCenterHref(
  segmentId: string | null,
  extraSearchParams = "",
) {
  return withAdmissionSegmentParam(
    `/short-course/actions${extraSearchParams}`,
    segmentId,
  );
}

function matchesSearch(task: ActionTask, query: string) {
  if (!query) {
    return true;
  }

  return [
    task.taskCode,
    task.title,
    task.reason,
    task.group,
    task.priority,
    task.owner,
    task.source,
    task.status,
    task.dueLabel,
  ]
    .join(" ")
    .toLowerCase()
    .includes(query);
}

function sortTasks(a: ActionTask, b: ActionTask) {
  const priorityCompare = priorityOrder[a.priority] - priorityOrder[b.priority];

  if (priorityCompare !== 0) {
    return priorityCompare;
  }

  return (
    new Date(b.updatedAt ?? 0).getTime() -
    new Date(a.updatedAt ?? 0).getTime()
  );
}

function compactErrorMessages(
  errors: Array<{ message: string } | null | undefined>,
) {
  const messages = Array.from(
    new Set(errors.filter(Boolean).map((error) => error?.message ?? "")),
  ).filter(Boolean);

  return messages.join(" | ") || null;
}

function buildStudentTasks(rows: StudentRow[], segmentId: string | null) {
  return rows.flatMap<ActionTask>((row) => {
    const tasks: ActionTask[] = [];

    if (row.student_status === "STAGING") {
      tasks.push({
        id: `student-profile-${row.id}`,
        taskCode: `ACT-STUDENT-${row.student_code}`,
        title: `Xác minh học viên ${row.student_name}`,
        reason: "Student Master còn ở STAGING, chưa đủ chắc để đẩy tiếp sang vận hành lớp/điểm danh/tài chính.",
        group: "STUDENT",
        priority: "HIGH",
        owner: "CTHSSV + DAO_TAO",
        source: "short_student_master",
        status: row.student_status,
        dueLabel: "Cần xử lý trước khi nhập học/chạy lớp",
        updatedAt: row.updated_at,
        actionHref: drilldownHref("students", row.id, segmentId),
        actionLabel: "Mở học viên",
      });
    }

    if (!row.student_phone || !row.identity_no) {
      tasks.push({
        id: `student-contact-${row.id}`,
        taskCode: `ACT-STUDENT-DATA-${row.student_code}`,
        title: `Bổ sung dữ liệu gốc cho ${row.student_name}`,
        reason: [
          !row.student_phone ? "thiếu SĐT" : null,
          !row.identity_no ? "thiếu CCCD" : null,
        ]
          .filter(Boolean)
          .join(", "),
        group: "STUDENT",
        priority: "MEDIUM",
        owner: "CTHSSV + TUYEN_SINH",
        source: "short_student_master",
        status: row.student_status ?? "UNKNOWN",
        dueLabel: "Bổ sung trước khi khóa hồ sơ",
        updatedAt: row.updated_at,
        actionHref: row.lead_id
          ? withAdmissionSegmentParam(`/leads/${row.lead_id}`, segmentId)
          : drilldownHref("students", row.id, segmentId),
        actionLabel: row.lead_id ? "Mở lead gốc" : "Mở học viên",
      });
    }

    return tasks;
  });
}

function buildClassTasks(rows: ClassRow[], segmentId: string | null) {
  return rows.flatMap<ActionTask>((row) => {
    const missing = [
      !row.training_location ? "thiếu địa điểm" : null,
      !row.instructor_name ? "thiếu giảng viên" : null,
      !row.planned_start_date ? "thiếu ngày khai giảng" : null,
      !row.capacity ? "thiếu sức chứa" : null,
    ].filter(Boolean);

    if (row.class_status !== "PLANNED" || missing.length === 0) {
      return [];
    }

    return [
      {
        id: `class-ready-${row.id}`,
        taskCode: `ACT-CLASS-${row.class_code}`,
        title: `Bổ sung điều kiện mở lớp ${row.class_name}`,
        reason: missing.join(", "),
        group: "CLASS",
        priority: "MEDIUM",
        owner: "DAO_TAO",
        source: "short_class_master",
        status: row.class_status ?? "UNKNOWN",
        dueLabel: "Cần đủ trước khi mở lớp",
        updatedAt: row.updated_at,
        actionHref: drilldownHref("classes", row.id, segmentId),
        actionLabel: "Mở lớp",
      },
    ];
  });
}

function buildEnrollmentTasks(rows: EnrollmentRow[], segmentId: string | null) {
  return rows.flatMap<ActionTask>((row) => {
    const tasks: ActionTask[] = [];

    if (!row.class_id && row.enrollment_status !== "CANCELLED") {
      tasks.push({
        id: `enrollment-class-${row.id}`,
        taskCode: `ACT-ENROLL-${row.enrollment_code}`,
        title: `Gán lớp cho ghi danh ${row.enrollment_code}`,
        reason: "Ghi danh chưa có class_id nên chưa thể đi sang điểm danh, BHXH và tài chính ổn định.",
        group: "ENROLLMENT",
        priority: "HIGH",
        owner: "DAO_TAO + CTHSSV",
        source: "short_enrollments",
        status: row.enrollment_status ?? "UNKNOWN",
        dueLabel: "Cần xử lý trước khi chạy lớp",
        updatedAt: row.updated_at,
        actionHref: drilldownHref("enrollments", row.id, segmentId),
        actionLabel: "Mở ghi danh",
      });
    }

    if (["NOT_READY", "PARTIAL"].includes(row.evidence_status ?? "")) {
      tasks.push({
        id: `enrollment-evidence-${row.id}`,
        taskCode: `ACT-EVIDENCE-${row.enrollment_code}`,
        title: `Bổ sung hồ sơ cho ${row.enrollment_code}`,
        reason: `Trạng thái hồ sơ: ${row.evidence_status}. Hồ sơ chưa đủ thì bàn giao vận hành dễ sai.`,
        group: "ENROLLMENT",
        priority: "MEDIUM",
        owner: "CTHSSV",
        source: "short_enrollments",
        status: row.evidence_status ?? "UNKNOWN",
        dueLabel: "Bổ sung trước khi xác nhận đủ điều kiện",
        updatedAt: row.updated_at,
        actionHref: drilldownHref("enrollments", row.id, segmentId),
        actionLabel: "Mở ghi danh",
      });
    }

    return tasks;
  });
}

function buildAttendanceTasks(rows: AttendanceRow[], segmentId: string | null) {
  return rows
    .filter(
      (row) =>
        ["OPEN", "PLANNED"].includes(row.session_status ?? "") &&
        row.attendance_locked === false,
    )
    .map<ActionTask>((row) => ({
      id: `attendance-lock-${row.id}`,
      taskCode: `ACT-ATT-${row.session_code}`,
      title: `Khóa/kiểm tra điểm danh ${row.session_title ?? row.session_code}`,
      reason: "Buổi học chưa khóa điểm danh. Attendance là nguồn dữ liệu gốc cho BHXH/chính sách và tài chính.",
      group: "ATTENDANCE",
      priority: isDueTodayOrPast(row.session_date) ? "HIGH" : "MEDIUM",
      owner: "DAO_TAO",
      source: "short_attendance_sessions",
      status: row.session_status ?? "UNKNOWN",
      dueLabel: isPastDate(row.session_date)
        ? `Quá ngày học ${formatDate(row.session_date)}`
        : `Ngày học ${formatDate(row.session_date)}`,
      updatedAt: row.updated_at,
      actionHref: drilldownHref("attendance", row.id, segmentId),
      actionLabel: "Mở điểm danh",
    }));
}

function buildBhxhTasks(rows: BhxhRow[], segmentId: string | null) {
  return rows
    .filter((row) =>
      ["NEEDS_FIX", "REJECTED", "PENDING"].includes(row.eligibility_status ?? "") ||
      ["DRAFT", "PENDING_CHECK", "REJECTED"].includes(row.case_status ?? ""),
    )
    .map<ActionTask>((row) => {
      const blocked =
        row.eligibility_status === "NEEDS_FIX" || row.case_status === "REJECTED";

      return {
        id: `bhxh-${row.id}`,
        taskCode: `ACT-BHXH-${row.case_code}`,
        title: `Kiểm tra BHXH/chính sách ${row.case_code}`,
        reason: `Trạng thái đủ điều kiện: ${row.eligibility_status ?? "Chưa rõ"}; trạng thái case: ${row.case_status ?? "Chưa rõ"}.`,
        group: "BHXH",
        priority: blocked ? "HIGH" : "MEDIUM",
        owner: "CTHSSV + PHAP_CHE",
        source: "short_bhxh_policy_cases",
        status: row.case_status ?? row.eligibility_status ?? "UNKNOWN",
        dueLabel: "Cần rõ trước khi đề xuất/chi chính sách",
        updatedAt: row.updated_at,
        actionHref: drilldownHref("bhxh", row.id, segmentId),
        actionLabel: "Mở BHXH",
      };
    });
}

function buildInvoiceTasks(rows: InvoiceRow[], segmentId: string | null) {
  return rows.flatMap<ActionTask>((row) => {
    const tasks: ActionTask[] = [];
    const balance = numericValue(row.balance_amount_vnd);

    if (row.invoice_status === "DRAFT") {
      tasks.push({
        id: `invoice-issue-${row.id}`,
        taskCode: `ACT-INVOICE-${row.invoice_code}`,
        title: `Phát hành công nợ ${row.invoice_code}`,
        reason: "Invoice còn DRAFT, chưa phải công nợ phát hành chính thức để theo dõi thu.",
        group: "FINANCE",
        priority: "MEDIUM",
        owner: "KHTC",
        source: "short_finance_invoices",
        status: row.invoice_status,
        dueLabel: "Cần phát hành/kiểm tra trước khi thu",
        updatedAt: row.updated_at,
        actionHref: drilldownHref("invoices", row.id, segmentId),
        actionLabel: "Mở công nợ",
      });
    }

    if (
      balance > 0 &&
      row.due_date &&
      isPastDate(row.due_date) &&
      !["CANCELLED", "REFUNDED"].includes(row.invoice_status ?? "")
    ) {
      tasks.push({
        id: `invoice-overdue-${row.id}`,
        taskCode: `ACT-OVERDUE-${row.invoice_code}`,
        title: `Công nợ quá hạn ${row.invoice_code}`,
        reason: `Còn phải thu ${formatMoney(balance)}, hạn ${formatDate(row.due_date)}.`,
        group: "FINANCE",
        priority: "HIGH",
        owner: "KHTC",
        source: "short_finance_invoices",
        status: row.invoice_status ?? "UNKNOWN",
        dueLabel: `Quá hạn ${formatDate(row.due_date)}`,
        updatedAt: row.updated_at,
        actionHref: drilldownHref("invoices", row.id, segmentId),
        actionLabel: "Mở công nợ",
      });
    }

    return tasks;
  });
}

function buildPaymentTasks(rows: PaymentRow[], segmentId: string | null) {
  return rows
    .filter((row) => ["PENDING", "REJECTED", "REVERSED"].includes(row.payment_status ?? ""))
    .map<ActionTask>((row) => ({
      id: `payment-${row.id}`,
      taskCode: `ACT-PAY-${row.payment_code}`,
      title:
        row.payment_status === "PENDING"
          ? `Đối soát thanh toán ${row.payment_code}`
          : `Kiểm tra thanh toán ${row.payment_code}`,
      reason: [
        `Số tiền: ${formatMoney(row.payment_amount_vnd)}`,
        row.voucher_no ? `chứng từ ${row.voucher_no}` : "chưa có số chứng từ",
        `ngày ${formatDate(row.payment_date)}`,
      ].join(" · "),
      group: "PAYMENT",
      priority: row.payment_status === "PENDING" ? "HIGH" : "MEDIUM",
      owner: "KHTC",
      source: "short_payments",
      status: row.payment_status ?? "UNKNOWN",
      dueLabel: "Kế toán cần xác nhận trước khi ghi nhận đã thu",
      updatedAt: row.updated_at,
      actionHref: drilldownHref("payments", row.id, segmentId),
      actionLabel: "Mở thanh toán",
    }));
}

function buildRiskTasks(rows: RiskRow[], segmentId: string | null) {
  return rows.map<ActionTask>((row) => {
    const priority =
      row.severity && row.severity in priorityOrder
        ? (row.severity as Priority)
        : "MEDIUM";

    return {
      id: `risk-${row.id}`,
      taskCode: `ACT-RISK-${row.alert_code}`,
      title: row.alert_title,
      reason:
        row.note ??
        `Cảnh báo ${row.alert_type ?? "RISK_ALERT"} cần owner kiểm tra.`,
      group: "RISK",
      priority,
      owner: row.owner_department ?? "BGH + IT_DATA + AUDIT",
      source: "short_risk_alerts",
      status: row.alert_status ?? "OPEN",
      dueLabel: row.entity_code ? `Liên quan ${row.entity_code}` : "Cần kiểm tra",
      updatedAt: row.updated_at,
      actionHref: drilldownHref("risks", row.id, segmentId),
      actionLabel: "Mở rủi ro",
    };
  });
}

function ActionSummary({
  tasks,
  filteredCount,
}: {
  tasks: ActionTask[];
  filteredCount: number;
}) {
  const criticalCount = tasks.filter((task) => task.priority === "CRITICAL").length;
  const highCount = tasks.filter((task) => task.priority === "HIGH").length;
  const financeCount = tasks.filter((task) =>
    ["FINANCE", "PAYMENT"].includes(task.group),
  ).length;

  const summaryItems = [
    { label: "Tổng việc mở", value: tasks.length, note: "Từ dữ liệu thật" },
    { label: "Khẩn cấp", value: criticalCount, note: "Cần BGH/owner xử lý ngay" },
    { label: "Ưu tiên cao", value: highCount, note: "Không nên để qua ngày" },
    { label: "Việc tài chính", value: financeCount, note: "KHTC/kế toán" },
  ];

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {summaryItems.map((item) => (
        <article
          key={item.label}
          className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm"
        >
          <p className="text-3xl font-semibold">{item.value}</p>
          <h2 className="mt-2 font-medium text-zinc-950">{item.label}</h2>
          <p className="mt-1 text-sm text-zinc-500">{item.note}</p>
        </article>
      ))}
      <p className="text-sm text-zinc-500 sm:col-span-2 xl:col-span-4">
        Đang hiển thị <span className="font-semibold text-zinc-900">{filteredCount}</span>{" "}
        việc sau khi áp dụng bộ lọc.
      </p>
    </section>
  );
}

function ActionFilters({
  query,
  owner,
  priority,
  owners,
  segmentId,
}: {
  query: string;
  owner: string;
  priority: Priority | null;
  owners: string[];
  segmentId: string | null;
}) {
  return (
    <form
      action="/short-course/actions"
      method="get"
      className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm"
    >
      {segmentId ? <input type="hidden" name="segment" value={segmentId} /> : null}
      <div className="grid gap-3 lg:grid-cols-[1fr_220px_180px_auto]">
        <label className="block">
          <span className="text-sm font-medium text-zinc-700">Tìm việc</span>
          <div className="mt-2 flex min-h-10 items-center gap-2 rounded-lg border border-zinc-300 bg-white px-3">
            <Search className="size-4 shrink-0 text-zinc-500" />
            <input
              name="q"
              type="search"
              defaultValue={query}
              placeholder="Nhập mã, học viên, trạng thái, owner..."
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-zinc-400"
            />
          </div>
        </label>
        <label className="block">
          <span className="text-sm font-medium text-zinc-700">Owner</span>
          <select
            name="owner"
            defaultValue={owner}
            className="mt-2 h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm outline-none"
          >
            <option value="">Tất cả owner</option>
            {owners.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-medium text-zinc-700">Ưu tiên</span>
          <select
            name="priority"
            defaultValue={priority ?? ""}
            className="mt-2 h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm outline-none"
          >
            <option value="">Tất cả</option>
            {(Object.keys(priorityLabels) as Priority[]).map((item) => (
              <option key={item} value={item}>
                {priorityLabels[item]}
              </option>
            ))}
          </select>
        </label>
        <div className="flex items-end">
          <Button type="submit" className="h-10 w-full">
            <FileSearch className="size-4" />
            Lọc việc
          </Button>
        </div>
      </div>
    </form>
  );
}

function PriorityLinks({
  activePriority,
  segmentId,
}: {
  activePriority: Priority | null;
  segmentId: string | null;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto rounded-lg border border-zinc-200 bg-white p-2 shadow-sm">
      <Link
        href={actionCenterHref(segmentId)}
        className={`whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium ${
          activePriority === null
            ? "bg-zinc-950 text-white"
            : "text-zinc-600 hover:bg-zinc-100"
        }`}
      >
        Tất cả
      </Link>
      {(Object.keys(priorityLabels) as Priority[]).map((item) => (
        <Link
          key={item}
          href={actionCenterHref(segmentId, `?priority=${item}`)}
          className={`whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium ${
            activePriority === item
              ? "bg-zinc-950 text-white"
              : "text-zinc-600 hover:bg-zinc-100"
          }`}
        >
          {priorityLabels[item]}
        </Link>
      ))}
    </div>
  );
}

function ActionTaskList({ tasks }: { tasks: ActionTask[] }) {
  return (
    <section className="rounded-lg border border-zinc-200 bg-white shadow-sm">
      <div className="border-b border-zinc-200 p-5">
        <h2 className="text-base font-semibold">Danh sách việc cần xử lý</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Mỗi dòng chỉ chỉ ra việc cần làm và nơi mở để xử lý. P1-14 chưa tự sửa
          dữ liệu, chưa tự duyệt và chưa cho AI thao tác thay người.
        </p>
      </div>
      <div className="divide-y divide-zinc-200">
        {tasks.length === 0 ? (
          <div className="p-8 text-center text-sm leading-6 text-zinc-500">
            Chưa có việc phù hợp với bộ lọc hiện tại.
          </div>
        ) : (
          tasks.map((task) => {
            const Icon = groupIcons[task.group] ?? ListChecks;

            return (
              <article key={task.id} className="p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-zinc-100">
                      <Icon className="size-5 text-zinc-600" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-md border px-2 py-1 text-xs ${
                            priorityTone[task.priority]
                          }`}
                        >
                          {priorityLabels[task.priority]}
                        </span>
                        <span className="font-mono text-xs text-zinc-500">
                          {task.taskCode}
                        </span>
                        <span className="rounded-md bg-zinc-100 px-2 py-1 text-xs text-zinc-600">
                          {task.group}
                        </span>
                      </div>
                      <h3 className="mt-3 font-semibold text-zinc-950">
                        {task.title}
                      </h3>
                      <p className="mt-2 max-w-4xl text-sm leading-6 text-zinc-600">
                        {task.reason}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2 text-xs text-zinc-500">
                        <span>Owner: {task.owner}</span>
                        <span>Nguồn: {task.source}</span>
                        <span>Trạng thái: {task.status}</span>
                        <span>{task.dueLabel}</span>
                        <span>Cập nhật: {formatDateTime(task.updatedAt)}</span>
                      </div>
                    </div>
                  </div>
                  <Button asChild variant="outline" className="lg:shrink-0">
                    <Link href={task.actionHref}>
                      {task.actionLabel}
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                </div>
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}

export default async function ShortCourseActionCenterPage({
  searchParams,
}: ActionCenterPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const resolvedSearchParams = searchParams ? await searchParams : {};
  const requestedSegmentId = firstParam(resolvedSearchParams.segment);
  const query = firstParam(resolvedSearchParams.q) ?? "";
  const ownerFilter = firstParam(resolvedSearchParams.owner) ?? "";
  const priorityFilter = normalizePriority(firstParam(resolvedSearchParams.priority));
  const normalizedQuery = normalizeSearch(query);
  const workspace = await getAdmissionWorkspaceContext(
    supabase,
    user.id,
    requestedSegmentId,
  );
  const segmentIds = admissionWorkspaceSegmentIds(workspace);
  const activeSegmentId = workspace.activeSegmentId;

  let studentQuery = supabase
    .from("short_student_master")
    .select("id,student_code,student_name,student_phone,identity_no,student_status,lead_id,updated_at")
    .eq("status", "ACTIVE");
  studentQuery = applyAdmissionSegmentIds(studentQuery, segmentIds);

  let classQuery = supabase
    .from("short_class_master")
    .select("id,class_code,class_name,training_location,instructor_name,planned_start_date,capacity,class_status,updated_at")
    .eq("status", "ACTIVE");
  classQuery = applyAdmissionSegmentIds(classQuery, segmentIds);

  let enrollmentQuery = supabase
    .from("short_enrollments")
    .select("id,enrollment_code,class_id,enrollment_status,attendance_status,finance_status,bhxh_policy_status,evidence_status,updated_at")
    .eq("record_status", "ACTIVE");
  enrollmentQuery = applyAdmissionSegmentIds(enrollmentQuery, segmentIds);

  const [studentsResult, classesResult, enrollmentsResult] = await Promise.all([
    studentQuery.limit(5000).returns<StudentRow[]>(),
    classQuery.limit(5000).returns<ClassRow[]>(),
    enrollmentQuery.limit(5000).returns<EnrollmentRow[]>(),
  ]);

  const classIds = (classesResult.data ?? []).map((row) => row.id);
  const enrollmentIds = (enrollmentsResult.data ?? []).map((row) => row.id);

  const [
    attendanceResult,
    bhxhResult,
    invoiceResult,
    paymentResult,
    riskResult,
  ] = await Promise.all([
    segmentIds && classIds.length === 0
      ? Promise.resolve({ data: [] as AttendanceRow[], error: null })
      : (() => {
          let queryBuilder = supabase
            .from("short_attendance_sessions")
            .select("id,session_code,session_date,session_title,session_status,attendance_locked,updated_at")
            .eq("record_status", "ACTIVE");

          if (segmentIds) {
            queryBuilder = queryBuilder.in("class_id", classIds);
          }

          return queryBuilder.limit(5000).returns<AttendanceRow[]>();
        })(),
    segmentIds && enrollmentIds.length === 0
      ? Promise.resolve({ data: [] as BhxhRow[], error: null })
      : (() => {
          let queryBuilder = supabase
            .from("short_bhxh_policy_cases")
            .select("id,case_code,eligibility_status,case_status,updated_at")
            .eq("record_status", "ACTIVE");

          if (segmentIds) {
            queryBuilder = queryBuilder.in("enrollment_id", enrollmentIds);
          }

          return queryBuilder.limit(5000).returns<BhxhRow[]>();
        })(),
    segmentIds && enrollmentIds.length === 0
      ? Promise.resolve({ data: [] as InvoiceRow[], error: null })
      : (() => {
          let queryBuilder = supabase
            .from("short_finance_invoices")
            .select("id,invoice_code,balance_amount_vnd,due_date,invoice_status,updated_at")
            .eq("record_status", "ACTIVE");

          if (segmentIds) {
            queryBuilder = queryBuilder.in("enrollment_id", enrollmentIds);
          }

          return queryBuilder.limit(5000).returns<InvoiceRow[]>();
        })(),
    segmentIds && enrollmentIds.length === 0
      ? Promise.resolve({ data: [] as PaymentRow[], error: null })
      : (() => {
          let queryBuilder = supabase
            .from("short_payments")
            .select("id,payment_code,payment_amount_vnd,payment_date,payment_status,voucher_no,updated_at")
            .eq("record_status", "ACTIVE");

          if (segmentIds) {
            queryBuilder = queryBuilder.in("enrollment_id", enrollmentIds);
          }

          return queryBuilder.limit(5000).returns<PaymentRow[]>();
        })(),
    supabase
      .from("short_risk_alerts")
      .select("id,alert_code,alert_type,alert_title,entity_id,entity_code,severity,alert_status,owner_department,note,updated_at")
      .eq("record_status", "ACTIVE")
      .not("alert_status", "in", "(RESOLVED,DISMISSED)")
      .limit(1000)
      .returns<RiskRow[]>(),
  ]);

  const scopedEntityIds = new Set([
    ...(studentsResult.data ?? []).map((row) => row.id),
    ...(classesResult.data ?? []).map((row) => row.id),
    ...(enrollmentsResult.data ?? []).map((row) => row.id),
    ...(attendanceResult.data ?? []).map((row) => row.id),
    ...(bhxhResult.data ?? []).map((row) => row.id),
    ...(invoiceResult.data ?? []).map((row) => row.id),
    ...(paymentResult.data ?? []).map((row) => row.id),
  ]);
  const scopedRiskRows =
    segmentIds === null
      ? riskResult.data ?? []
      : (riskResult.data ?? []).filter(
          (row) => row.entity_id && scopedEntityIds.has(row.entity_id),
        );

  const tasks = [
    ...buildStudentTasks(studentsResult.data ?? [], activeSegmentId),
    ...buildClassTasks(classesResult.data ?? [], activeSegmentId),
    ...buildEnrollmentTasks(enrollmentsResult.data ?? [], activeSegmentId),
    ...buildAttendanceTasks(attendanceResult.data ?? [], activeSegmentId),
    ...buildBhxhTasks(bhxhResult.data ?? [], activeSegmentId),
    ...buildInvoiceTasks(invoiceResult.data ?? [], activeSegmentId),
    ...buildPaymentTasks(paymentResult.data ?? [], activeSegmentId),
    ...buildRiskTasks(scopedRiskRows, activeSegmentId),
  ].sort(sortTasks);
  const owners = Array.from(new Set(tasks.map((task) => task.owner))).sort();
  const filteredTasks = tasks
    .filter((task) => matchesSearch(task, normalizedQuery))
    .filter((task) => (ownerFilter ? task.owner === ownerFilter : true))
    .filter((task) =>
      priorityFilter ? task.priority === priorityFilter : true,
    );
  const loadWarning = compactErrorMessages([
    studentsResult.error,
    classesResult.error,
    enrollmentsResult.error,
    attendanceResult.error,
    bhxhResult.error,
    invoiceResult.error,
    paymentResult.error,
    riskResult.error,
  ]);
  const refreshHref = actionCenterHref(activeSegmentId);

  return (
    <AppShell
      active="short-course"
      title="P1-14 · Action Center ngắn hạn"
      description={
        workspace.activeSegment
          ? `Gom việc cần xử lý trong phạm vi: ${workspace.activeSegment.label}.`
          : "Gom việc cần xử lý từ học viên, lớp, ghi danh, điểm danh, BHXH, tài chính, thanh toán và rủi ro."
      }
      workspaceSegmentId={activeSegmentId}
      workspaceReturnTo={refreshHref}
      actions={
        <>
          <Button asChild variant="outline">
            <Link href={withAdmissionSegmentParam("/short-course", activeSegmentId)}>
              <ArrowLeft className="size-4" />
              Dashboard ngắn hạn
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={refreshHref}>
              <RefreshCcw className="size-4" />
              Tải lại
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/search?q=P1-14">
              <FileSearch className="size-4" />
              Tìm P1-14
            </Link>
          </Button>
        </>
      }
    >
      <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-zinc-100">
            <ListChecks className="size-5 text-zinc-600" />
          </div>
          <div>
            <p className="text-xs font-medium uppercase text-zinc-500">
              P1-14 · Workflow Action Center
            </p>
            <h2 className="mt-1 text-lg font-semibold">
              Trung tâm việc cần xử lý
            </h2>
            <p className="mt-2 max-w-4xl text-sm leading-6 text-zinc-600">
              Đây là lớp điều phối việc. Hệ thống chỉ chỉ ra việc cần làm, owner
              và nơi mở để xử lý; chưa tự sửa dữ liệu, chưa tự duyệt và AI chỉ
              được phép hỗ trợ cảnh báo/gợi ý.
            </p>
          </div>
        </div>
      </section>

      {loadWarning ? (
        <section className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-800">
          <div className="flex items-start gap-3">
            <ShieldAlert className="mt-0.5 size-5 shrink-0" />
            <div>
              <h2 className="font-semibold">Một phần dữ liệu chưa đọc được</h2>
              <p className="mt-1">{loadWarning}</p>
            </div>
          </div>
        </section>
      ) : null}

      <ActionSummary tasks={tasks} filteredCount={filteredTasks.length} />
      <PriorityLinks activePriority={priorityFilter} segmentId={activeSegmentId} />
      <ActionFilters
        query={query}
        owner={ownerFilter}
        priority={priorityFilter}
        owners={owners}
        segmentId={activeSegmentId}
      />
      <ActionTaskList tasks={filteredTasks} />
    </AppShell>
  );
}
