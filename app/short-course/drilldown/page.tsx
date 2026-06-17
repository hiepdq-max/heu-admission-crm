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

type DrilldownPageProps = {
  searchParams?: Promise<{
    type?: string | string[];
    q?: string | string[];
    status?: string | string[];
    entityId?: string | string[];
    segment?: string | string[];
  }>;
};

type DrilldownType =
  | "students"
  | "classes"
  | "enrollments"
  | "attendance"
  | "bhxh"
  | "invoices"
  | "payments"
  | "risks";

type SelectOption = {
  id: string;
};

type StudentRow = {
  id: string;
  student_code: string;
  student_name: string;
  student_phone: string | null;
  identity_no: string | null;
  student_status: string | null;
  source_status: string | null;
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
  student_id: string;
  class_id: string | null;
  enrollment_status: string | null;
  attendance_status: string | null;
  finance_status: string | null;
  bhxh_policy_status: string | null;
  evidence_status: string | null;
  enrolled_on: string | null;
  updated_at: string | null;
};

type AttendanceRow = {
  id: string;
  session_code: string;
  class_id: string;
  session_date: string;
  start_time: string | null;
  session_title: string | null;
  session_status: string | null;
  attendance_locked: boolean | null;
  updated_at: string | null;
};

type BhxhRow = {
  id: string;
  case_code: string;
  enrollment_id: string;
  student_id: string;
  policy_type: string | null;
  eligibility_status: string | null;
  case_status: string | null;
  requested_amount_vnd: number | string | null;
  approved_amount_vnd: number | string | null;
  updated_at: string | null;
};

type InvoiceRow = {
  id: string;
  invoice_code: string;
  enrollment_id: string;
  student_id: string;
  expected_amount_vnd: number | string | null;
  payable_amount_vnd: number | string | null;
  paid_amount_vnd: number | string | null;
  balance_amount_vnd: number | string | null;
  due_date: string | null;
  invoice_status: string | null;
  updated_at: string | null;
};

type PaymentRow = {
  id: string;
  payment_code: string;
  invoice_id: string;
  enrollment_id: string;
  student_id: string;
  payment_amount_vnd: number | string | null;
  payment_date: string | null;
  payment_method: string | null;
  payment_status: string | null;
  voucher_no: string | null;
  updated_at: string | null;
};

type RiskRow = {
  id: string;
  alert_code: string;
  alert_type: string | null;
  alert_title: string;
  entity_type: string;
  entity_id: string | null;
  entity_code: string | null;
  severity: string | null;
  alert_status: string | null;
  owner_department: string | null;
  note: string | null;
  updated_at: string | null;
};

type DrilldownRow = {
  id: string;
  code: string;
  title: string;
  subtitle: string;
  status: string | null;
  statusLabel: string | null;
  owner: string;
  updatedAt: string | null;
  badges: string[];
  amount?: number | string | null;
  actions?: Array<{
    label: string;
    href: string;
  }>;
};

const drilldownConfig: Record<
  DrilldownType,
  {
    title: string;
    description: string;
    icon: typeof Users;
    owner: string;
  }
> = {
  students: {
    title: "Học viên ngắn hạn",
    description: "Danh sách Student Master ngắn hạn trong phạm vi đang chọn.",
    icon: Users,
    owner: "CTHSSV + DAO_TAO",
  },
  classes: {
    title: "Lớp ngắn hạn",
    description: "Danh sách lớp, địa điểm, giảng viên và trạng thái mở lớp.",
    icon: GraduationCap,
    owner: "DAO_TAO",
  },
  enrollments: {
    title: "Ghi danh ngắn hạn",
    description: "Điểm nối giữa học viên, lớp, điểm danh, BHXH và tài chính.",
    icon: ListChecks,
    owner: "CTHSSV + DAO_TAO",
  },
  attendance: {
    title: "Điểm danh ngắn hạn",
    description: "Buổi học và trạng thái khóa/duyệt điểm danh.",
    icon: CalendarCheck,
    owner: "DAO_TAO",
  },
  bhxh: {
    title: "BHXH/chính sách",
    description: "Case chính sách/trợ cấp cần kiểm tra theo học viên.",
    icon: ClipboardCheck,
    owner: "CTHSSV + PHAP_CHE",
  },
  invoices: {
    title: "Công nợ ngắn hạn",
    description: "Invoice, số phải thu, đã thu và còn phải thu.",
    icon: Banknote,
    owner: "KHTC",
  },
  payments: {
    title: "Thanh toán ngắn hạn",
    description: "Khoản thu, trạng thái đối soát và chứng từ thanh toán.",
    icon: Banknote,
    owner: "KHTC",
  },
  risks: {
    title: "Rủi ro/exception ngắn hạn",
    description: "Các cảnh báo cần owner xử lý trước khi vận hành tiếp.",
    icon: ShieldAlert,
    owner: "BGH + IT_DATA + AUDIT",
  },
};

const typeTabs: Array<{ type: DrilldownType; label: string }> = [
  { type: "students", label: "Học viên" },
  { type: "classes", label: "Lớp" },
  { type: "enrollments", label: "Ghi danh" },
  { type: "attendance", label: "Điểm danh" },
  { type: "bhxh", label: "BHXH" },
  { type: "invoices", label: "Công nợ" },
  { type: "payments", label: "Thanh toán" },
  { type: "risks", label: "Rủi ro" },
];

const statusTone: Record<string, string> = {
  ACTIVE: "border-emerald-200 bg-emerald-50 text-emerald-700",
  OPEN: "border-emerald-200 bg-emerald-50 text-emerald-700",
  IN_PROGRESS: "border-sky-200 bg-sky-50 text-sky-700",
  ENROLLED: "border-sky-200 bg-sky-50 text-sky-700",
  STUDYING: "border-sky-200 bg-sky-50 text-sky-700",
  PENDING: "border-amber-200 bg-amber-50 text-amber-700",
  DRAFT: "border-zinc-200 bg-zinc-50 text-zinc-700",
  PLANNED: "border-zinc-200 bg-zinc-50 text-zinc-700",
  LOCKED: "border-violet-200 bg-violet-50 text-violet-700",
  VERIFIED: "border-emerald-200 bg-emerald-50 text-emerald-700",
  PAID: "border-emerald-200 bg-emerald-50 text-emerald-700",
  HIGH: "border-orange-200 bg-orange-50 text-orange-700",
  CRITICAL: "border-rose-200 bg-rose-50 text-rose-700",
  REJECTED: "border-rose-200 bg-rose-50 text-rose-700",
  CANCELLED: "border-zinc-200 bg-zinc-50 text-zinc-500",
};

function normalizeType(value: string | null | undefined): DrilldownType {
  if (value && value in drilldownConfig) {
    return value as DrilldownType;
  }

  return "students";
}

function normalizeSearch(value: string | null | undefined) {
  return (value ?? "").trim().toLowerCase();
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

function matchesSearch(row: DrilldownRow, query: string) {
  if (!query) {
    return true;
  }

  return [
    row.code,
    row.title,
    row.subtitle,
    row.status,
    row.statusLabel,
    row.owner,
    ...row.badges,
  ]
    .join(" ")
    .toLowerCase()
    .includes(query);
}

function matchesStatus(row: DrilldownRow, status: string | null) {
  if (!status) {
    return true;
  }

  return row.status === status || row.statusLabel === status;
}

function detailHref(type: DrilldownType, id: string, segmentId: string | null) {
  return withAdmissionSegmentParam(
    `/short-course/drilldown?type=${type}&entityId=${id}`,
    segmentId,
  );
}

function tabHref(type: DrilldownType, segmentId: string | null) {
  return withAdmissionSegmentParam(`/short-course/drilldown?type=${type}`, segmentId);
}

function typeHref(type: DrilldownType, segmentId: string | null, extra = "") {
  return withAdmissionSegmentParam(
    `/short-course/drilldown?type=${type}${extra}`,
    segmentId,
  );
}

function queryExtra(value: string) {
  return `&q=${encodeURIComponent(value)}`;
}

function DrilldownTabs({
  activeType,
  segmentId,
}: {
  activeType: DrilldownType;
  segmentId: string | null;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto rounded-lg border border-zinc-200 bg-white p-2 shadow-sm">
      {typeTabs.map((tab) => (
        <Link
          key={tab.type}
          href={tabHref(tab.type, segmentId)}
          className={`whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium ${
            tab.type === activeType
              ? "bg-zinc-950 text-white"
              : "text-zinc-600 hover:bg-zinc-100"
          }`}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}

function DrilldownSearchForm({
  type,
  query,
  status,
  segmentId,
}: {
  type: DrilldownType;
  query: string;
  status: string | null;
  segmentId: string | null;
}) {
  return (
    <form
      action="/short-course/drilldown"
      method="get"
      className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm"
    >
      <input type="hidden" name="type" value={type} />
      {segmentId ? <input type="hidden" name="segment" value={segmentId} /> : null}
      {status ? <input type="hidden" name="status" value={status} /> : null}
      <label className="text-sm font-medium text-zinc-700" htmlFor="drilldown-q">
        Tìm trong danh sách này
      </label>
      <div className="mt-2 flex flex-col gap-2 sm:flex-row">
        <div className="flex min-h-10 flex-1 items-center gap-2 rounded-lg border border-zinc-300 bg-white px-3">
          <Search className="size-4 shrink-0 text-zinc-500" />
          <input
            id="drilldown-q"
            name="q"
            type="search"
            defaultValue={query}
            placeholder="Nhập mã, tên, trạng thái hoặc ghi chú..."
            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-zinc-400"
          />
        </div>
        <Button type="submit" className="h-10">
          <FileSearch className="size-4" />
          Lọc
        </Button>
      </div>
    </form>
  );
}

function DrilldownTable({ rows }: { rows: DrilldownRow[] }) {
  return (
    <section className="rounded-lg border border-zinc-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[920px] text-sm">
          <thead className="bg-zinc-50 text-left text-xs font-medium uppercase text-zinc-500">
            <tr>
              <th className="px-5 py-3">Mã / tên</th>
              <th className="px-5 py-3">Thông tin chính</th>
              <th className="px-5 py-3">Trạng thái</th>
              <th className="px-5 py-3">Owner</th>
              <th className="px-5 py-3">Cập nhật</th>
              <th className="px-5 py-3">Mở</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-zinc-500">
                  Chưa có dữ liệu phù hợp trong phạm vi đang chọn.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id}>
                  <td className="px-5 py-4">
                    <p className="font-medium text-zinc-950">{row.title}</p>
                    <p className="mt-1 font-mono text-xs text-zinc-500">
                      {row.code}
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="max-w-xl leading-6 text-zinc-600">
                      {row.subtitle}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {row.badges.map((badge) => (
                        <span
                          key={badge}
                          className="rounded-md bg-zinc-100 px-2 py-1 text-xs text-zinc-600"
                        >
                          {badge}
                        </span>
                      ))}
                      {row.amount !== undefined ? (
                        <span className="rounded-md bg-amber-50 px-2 py-1 text-xs text-amber-700">
                          {formatMoney(row.amount)}
                        </span>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    {row.statusLabel ? (
                      <span
                        className={`rounded-md border px-2 py-1 text-xs ${
                          statusTone[row.statusLabel] ??
                          statusTone[row.status ?? ""] ??
                          "border-zinc-200 bg-zinc-50 text-zinc-700"
                        }`}
                      >
                        {row.statusLabel}
                      </span>
                    ) : (
                      <span className="text-zinc-400">Chưa rõ</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-zinc-600">{row.owner}</td>
                  <td className="px-5 py-4 text-zinc-500">
                    {formatDateTime(row.updatedAt)}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-2">
                      {row.actions && row.actions.length > 0 ? (
                        row.actions.map((action) => (
                          <Button
                            key={`${row.id}-${action.label}`}
                            asChild
                            variant="outline"
                            size="sm"
                          >
                            <Link href={action.href}>
                              {action.label}
                              <ArrowRight className="size-4" />
                            </Link>
                          </Button>
                        ))
                      ) : (
                        <span className="text-xs text-zinc-400">
                          Chưa có thao tác
                        </span>
                      )}
                    </div>
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

async function loadScopedClassIds(
  supabase: Awaited<ReturnType<typeof createClient>>,
  segmentIds: string[] | null,
) {
  let query = supabase
    .from("short_class_master")
    .select("id")
    .eq("status", "ACTIVE");
  query = applyAdmissionSegmentIds(query, segmentIds);
  const { data } = await query.limit(5000).returns<SelectOption[]>();
  return (data ?? []).map((row) => row.id);
}

async function loadScopedEnrollmentIds(
  supabase: Awaited<ReturnType<typeof createClient>>,
  segmentIds: string[] | null,
) {
  let query = supabase
    .from("short_enrollments")
    .select("id")
    .eq("record_status", "ACTIVE");
  query = applyAdmissionSegmentIds(query, segmentIds);
  const { data } = await query.limit(5000).returns<SelectOption[]>();
  return (data ?? []).map((row) => row.id);
}

async function loadStudents(
  supabase: Awaited<ReturnType<typeof createClient>>,
  segmentIds: string[] | null,
  entityId: string | null,
  activeSegmentId: string | null,
) {
  let query = supabase
    .from("short_student_master")
    .select(
      "id,student_code,student_name,student_phone,identity_no,student_status,source_status,lead_id,updated_at",
    )
    .eq("status", "ACTIVE");
  query = applyAdmissionSegmentIds(query, segmentIds);

  if (entityId) {
    query = query.eq("id", entityId);
  }

  const { data, error } = await query
    .order("updated_at", { ascending: false })
    .limit(200)
    .returns<StudentRow[]>();

  return {
    rows: (data ?? []).map<DrilldownRow>((row) => ({
      id: row.id,
      code: row.student_code,
      title: row.student_name,
      subtitle: [
        row.student_phone ? `SĐT: ${row.student_phone}` : "Chưa có SĐT",
        row.identity_no ? `CCCD: ${row.identity_no}` : "Chưa có CCCD",
      ].join(" · "),
      status: row.student_status,
      statusLabel: row.student_status,
      owner: "CTHSSV + DAO_TAO",
      updatedAt: row.updated_at,
      badges: [row.source_status ?? "Chưa rõ nguồn"],
      actions: row.lead_id
        ? [
            {
              label: "Mở lead gốc",
              href: withAdmissionSegmentParam(`/leads/${row.lead_id}`, activeSegmentId),
            },
          ]
        : [
            {
              label: "Ghi danh",
              href: typeHref(
                "enrollments",
                activeSegmentId,
                queryExtra(row.student_code),
              ),
            },
          ],
    })),
    error,
  };
}

async function loadClasses(
  supabase: Awaited<ReturnType<typeof createClient>>,
  segmentIds: string[] | null,
  entityId: string | null,
  activeSegmentId: string | null,
) {
  let query = supabase
    .from("short_class_master")
    .select(
      "id,class_code,class_name,training_location,instructor_name,planned_start_date,capacity,class_status,updated_at",
    )
    .eq("status", "ACTIVE");
  query = applyAdmissionSegmentIds(query, segmentIds);

  if (entityId) {
    query = query.eq("id", entityId);
  }

  const { data, error } = await query
    .order("updated_at", { ascending: false })
    .limit(200)
    .returns<ClassRow[]>();

  return {
    rows: (data ?? []).map<DrilldownRow>((row) => ({
      id: row.id,
      code: row.class_code,
      title: row.class_name,
      subtitle: [
        row.training_location ? `Địa điểm: ${row.training_location}` : "Chưa có địa điểm",
        row.instructor_name ? `GV: ${row.instructor_name}` : "Chưa có giảng viên",
        row.planned_start_date ? `Khai giảng: ${formatDate(row.planned_start_date)}` : "Chưa có ngày khai giảng",
      ].join(" · "),
      status: row.class_status,
      statusLabel: row.class_status,
      owner: "DAO_TAO",
      updatedAt: row.updated_at,
      badges: [row.capacity ? `Sức chứa: ${row.capacity}` : "Chưa có sức chứa"],
      actions: [
        {
          label: "Xem ghi danh",
          href: typeHref(
            "enrollments",
            activeSegmentId,
            queryExtra(row.class_code),
          ),
        },
        {
          label: "Xem điểm danh",
          href: typeHref(
            "attendance",
            activeSegmentId,
            queryExtra(row.class_code),
          ),
        },
      ],
    })),
    error,
  };
}

async function loadEnrollments(
  supabase: Awaited<ReturnType<typeof createClient>>,
  segmentIds: string[] | null,
  entityId: string | null,
  activeSegmentId: string | null,
) {
  let query = supabase
    .from("short_enrollments")
    .select(
      "id,enrollment_code,student_id,class_id,enrollment_status,attendance_status,finance_status,bhxh_policy_status,evidence_status,enrolled_on,updated_at",
    )
    .eq("record_status", "ACTIVE");
  query = applyAdmissionSegmentIds(query, segmentIds);

  if (entityId) {
    query = query.eq("id", entityId);
  }

  const { data, error } = await query
    .order("updated_at", { ascending: false })
    .limit(200)
    .returns<EnrollmentRow[]>();

  return {
    rows: (data ?? []).map<DrilldownRow>((row) => ({
      id: row.id,
      code: row.enrollment_code,
      title: `Ghi danh ${row.enrollment_code}`,
      subtitle: [
        row.class_id ? `Đã gắn lớp` : "Chưa gắn lớp",
        row.enrolled_on ? `Ngày ghi danh: ${formatDate(row.enrolled_on)}` : "Chưa có ngày ghi danh",
      ].join(" · "),
      status: row.enrollment_status,
      statusLabel: row.enrollment_status,
      owner: "CTHSSV + DAO_TAO",
      updatedAt: row.updated_at,
      badges: [
        `Điểm danh: ${row.attendance_status ?? "Chưa rõ"}`,
        `Tài chính: ${row.finance_status ?? "Chưa rõ"}`,
        `BHXH: ${row.bhxh_policy_status ?? "Chưa rõ"}`,
        `Hồ sơ: ${row.evidence_status ?? "Chưa rõ"}`,
      ],
      actions: [
        {
          label: "Công nợ",
          href: typeHref(
            "invoices",
            activeSegmentId,
            queryExtra(row.enrollment_code),
          ),
        },
        {
          label: "BHXH",
          href: typeHref(
            "bhxh",
            activeSegmentId,
            queryExtra(row.enrollment_code),
          ),
        },
      ],
    })),
    error,
  };
}

async function loadAttendance(
  supabase: Awaited<ReturnType<typeof createClient>>,
  segmentIds: string[] | null,
  entityId: string | null,
) {
  const classIds = segmentIds ? await loadScopedClassIds(supabase, segmentIds) : null;

  if (segmentIds && classIds?.length === 0) {
    return { rows: [] as DrilldownRow[], error: null };
  }

  let query = supabase
    .from("short_attendance_sessions")
    .select(
      "id,session_code,class_id,session_date,start_time,session_title,session_status,attendance_locked,updated_at",
    )
    .eq("record_status", "ACTIVE");

  if (classIds) {
    query = query.in("class_id", classIds);
  }

  if (entityId) {
    query = query.eq("id", entityId);
  }

  const { data, error } = await query
    .order("session_date", { ascending: false })
    .limit(200)
    .returns<AttendanceRow[]>();

  return {
    rows: (data ?? []).map<DrilldownRow>((row) => ({
      id: row.id,
      code: row.session_code,
      title: row.session_title ?? `Buổi học ${row.session_code}`,
      subtitle: [
        `Ngày học: ${formatDate(row.session_date)}`,
        row.start_time ? `Giờ: ${row.start_time}` : "Chưa có giờ",
        row.attendance_locked ? "Đã khóa điểm danh" : "Chưa khóa điểm danh",
      ].join(" · "),
      status: row.session_status,
      statusLabel: row.session_status,
      owner: "DAO_TAO",
      updatedAt: row.updated_at,
      badges: [row.attendance_locked ? "LOCKED" : "UNLOCKED"],
    })),
    error,
  };
}

async function loadBhxh(
  supabase: Awaited<ReturnType<typeof createClient>>,
  segmentIds: string[] | null,
  entityId: string | null,
) {
  const enrollmentIds = segmentIds
    ? await loadScopedEnrollmentIds(supabase, segmentIds)
    : null;

  if (segmentIds && enrollmentIds?.length === 0) {
    return { rows: [] as DrilldownRow[], error: null };
  }

  let query = supabase
    .from("short_bhxh_policy_cases")
    .select(
      "id,case_code,enrollment_id,student_id,policy_type,eligibility_status,case_status,requested_amount_vnd,approved_amount_vnd,updated_at",
    )
    .eq("record_status", "ACTIVE");

  if (enrollmentIds) {
    query = query.in("enrollment_id", enrollmentIds);
  }

  if (entityId) {
    query = query.eq("id", entityId);
  }

  const { data, error } = await query
    .order("updated_at", { ascending: false })
    .limit(200)
    .returns<BhxhRow[]>();

  return {
    rows: (data ?? []).map<DrilldownRow>((row) => ({
      id: row.id,
      code: row.case_code,
      title: `Case ${row.case_code}`,
      subtitle: [
        row.policy_type ?? "Chưa rõ loại chính sách",
        `Đủ điều kiện: ${row.eligibility_status ?? "Chưa rõ"}`,
      ].join(" · "),
      status: row.case_status,
      statusLabel: row.case_status,
      owner: "CTHSSV + PHAP_CHE",
      updatedAt: row.updated_at,
      badges: [`Yêu cầu: ${formatMoney(row.requested_amount_vnd)}`],
      amount: row.approved_amount_vnd,
    })),
    error,
  };
}

async function loadInvoices(
  supabase: Awaited<ReturnType<typeof createClient>>,
  segmentIds: string[] | null,
  entityId: string | null,
) {
  const enrollmentIds = segmentIds
    ? await loadScopedEnrollmentIds(supabase, segmentIds)
    : null;

  if (segmentIds && enrollmentIds?.length === 0) {
    return { rows: [] as DrilldownRow[], error: null };
  }

  let query = supabase
    .from("short_finance_invoices")
    .select(
      "id,invoice_code,enrollment_id,student_id,expected_amount_vnd,payable_amount_vnd,paid_amount_vnd,balance_amount_vnd,due_date,invoice_status,updated_at",
    )
    .eq("record_status", "ACTIVE");

  if (enrollmentIds) {
    query = query.in("enrollment_id", enrollmentIds);
  }

  if (entityId) {
    query = query.eq("id", entityId);
  }

  const { data, error } = await query
    .order("updated_at", { ascending: false })
    .limit(200)
    .returns<InvoiceRow[]>();

  return {
    rows: (data ?? []).map<DrilldownRow>((row) => ({
      id: row.id,
      code: row.invoice_code,
      title: `Công nợ ${row.invoice_code}`,
      subtitle: [
        `Phải thu: ${formatMoney(row.payable_amount_vnd)}`,
        `Đã thu: ${formatMoney(row.paid_amount_vnd)}`,
        row.due_date ? `Hạn: ${formatDate(row.due_date)}` : "Chưa có hạn",
      ].join(" · "),
      status: row.invoice_status,
      statusLabel: row.invoice_status,
      owner: "KHTC",
      updatedAt: row.updated_at,
      badges: [`Dự kiến: ${formatMoney(row.expected_amount_vnd)}`],
      amount: row.balance_amount_vnd,
    })),
    error,
  };
}

async function loadPayments(
  supabase: Awaited<ReturnType<typeof createClient>>,
  segmentIds: string[] | null,
  entityId: string | null,
) {
  const enrollmentIds = segmentIds
    ? await loadScopedEnrollmentIds(supabase, segmentIds)
    : null;

  if (segmentIds && enrollmentIds?.length === 0) {
    return { rows: [] as DrilldownRow[], error: null };
  }

  let query = supabase
    .from("short_payments")
    .select(
      "id,payment_code,invoice_id,enrollment_id,student_id,payment_amount_vnd,payment_date,payment_method,payment_status,voucher_no,updated_at",
    )
    .eq("record_status", "ACTIVE");

  if (enrollmentIds) {
    query = query.in("enrollment_id", enrollmentIds);
  }

  if (entityId) {
    query = query.eq("id", entityId);
  }

  const { data, error } = await query
    .order("updated_at", { ascending: false })
    .limit(200)
    .returns<PaymentRow[]>();

  return {
    rows: (data ?? []).map<DrilldownRow>((row) => ({
      id: row.id,
      code: row.payment_code,
      title: `Thanh toán ${row.payment_code}`,
      subtitle: [
        `Ngày: ${formatDate(row.payment_date)}`,
        `Hình thức: ${row.payment_method ?? "Chưa rõ"}`,
        row.voucher_no ? `Chứng từ: ${row.voucher_no}` : "Chưa có chứng từ",
      ].join(" · "),
      status: row.payment_status,
      statusLabel: row.payment_status,
      owner: "KHTC",
      updatedAt: row.updated_at,
      badges: [`Invoice: ${row.invoice_id}`],
      amount: row.payment_amount_vnd,
    })),
    error,
  };
}

async function loadRisks(
  supabase: Awaited<ReturnType<typeof createClient>>,
  entityId: string | null,
) {
  let query = supabase
    .from("short_risk_alerts")
    .select(
      "id,alert_code,alert_type,alert_title,entity_type,entity_id,entity_code,severity,alert_status,owner_department,note,updated_at",
    )
    .eq("record_status", "ACTIVE")
    .not("alert_status", "in", "(RESOLVED,DISMISSED)");

  if (entityId) {
    query = query.eq("id", entityId);
  }

  const { data, error } = await query
    .order("updated_at", { ascending: false })
    .limit(200)
    .returns<RiskRow[]>();

  return {
    rows: (data ?? []).map<DrilldownRow>((row) => ({
      id: row.id,
      code: row.alert_code,
      title: row.alert_title,
      subtitle: [
        row.entity_code ?? row.entity_type,
        row.note ?? "Chưa có ghi chú xử lý",
      ].join(" · "),
      status: row.severity,
      statusLabel: row.severity,
      owner: row.owner_department ?? "BGH + IT_DATA + AUDIT",
      updatedAt: row.updated_at,
      badges: [row.alert_status ?? "OPEN", row.alert_type ?? "RISK_ALERT"],
    })),
    error,
  };
}

export default async function ShortCourseDrilldownPage({
  searchParams,
}: DrilldownPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const resolvedSearchParams = searchParams ? await searchParams : {};
  const activeType = normalizeType(firstParam(resolvedSearchParams.type));
  const query = firstParam(resolvedSearchParams.q) ?? "";
  const normalizedQuery = normalizeSearch(query);
  const status = firstParam(resolvedSearchParams.status) ?? null;
  const entityId = firstParam(resolvedSearchParams.entityId) ?? null;
  const requestedSegmentId = firstParam(resolvedSearchParams.segment);
  const workspace = await getAdmissionWorkspaceContext(
    supabase,
    user.id,
    requestedSegmentId,
  );
  const segmentIds = admissionWorkspaceSegmentIds(workspace);
  const activeSegmentId = workspace.activeSegmentId;
  const config = drilldownConfig[activeType];
  const Icon = config.icon;

  let result: { rows: DrilldownRow[]; error: { message: string } | null };

  switch (activeType) {
    case "classes":
      result = await loadClasses(supabase, segmentIds, entityId, activeSegmentId);
      break;
    case "enrollments":
      result = await loadEnrollments(
        supabase,
        segmentIds,
        entityId,
        activeSegmentId,
      );
      break;
    case "attendance":
      result = await loadAttendance(supabase, segmentIds, entityId);
      break;
    case "bhxh":
      result = await loadBhxh(supabase, segmentIds, entityId);
      break;
    case "invoices":
      result = await loadInvoices(supabase, segmentIds, entityId);
      break;
    case "payments":
      result = await loadPayments(supabase, segmentIds, entityId);
      break;
    case "risks":
      result = await loadRisks(supabase, entityId);
      break;
    case "students":
    default:
      result = await loadStudents(supabase, segmentIds, entityId, activeSegmentId);
      break;
  }

  const filteredRows = result.rows
    .filter((row) => matchesSearch(row, normalizedQuery))
    .filter((row) => matchesStatus(row, status))
    .map((row) => ({
      ...row,
      actions:
        row.actions && row.actions.length > 0
          ? row.actions
          : [
              {
                label: "Mở dòng",
                href: detailHref(activeType, row.id, activeSegmentId),
              },
            ],
    }));

  return (
    <AppShell
      active="short-course"
      title={`P1-13 · ${config.title}`}
      description={
        workspace.activeSegment
          ? `Drilldown trong phạm vi: ${workspace.activeSegment.label}.`
          : config.description
      }
      workspaceSegmentId={activeSegmentId}
      workspaceReturnTo={typeHref(activeType, activeSegmentId)}
      actions={
        <>
          <Button asChild variant="outline">
            <Link href={withAdmissionSegmentParam("/short-course", activeSegmentId)}>
              <ArrowLeft className="size-4" />
              Dashboard ngắn hạn
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={typeHref(activeType, activeSegmentId)}>
              <RefreshCcw className="size-4" />
              Tải lại
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/search?q=P1-13">
              <FileSearch className="size-4" />
              Tìm P1-13
            </Link>
          </Button>
        </>
      }
    >
      <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-zinc-100">
              <Icon className="size-5 text-zinc-600" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase text-zinc-500">
                P1-13 · Drilldown
              </p>
              <h2 className="mt-1 text-lg font-semibold">{config.title}</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-600">
                {config.description} Màn hình này chỉ đọc dữ liệu, không tự sửa
                nghiệp vụ và không bỏ qua phân quyền/phạm vi.
              </p>
            </div>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-600">
            Owner: <span className="font-medium text-zinc-900">{config.owner}</span>
          </div>
        </div>
      </section>

      <DrilldownTabs activeType={activeType} segmentId={activeSegmentId} />

      <DrilldownSearchForm
        type={activeType}
        query={query}
        status={status}
        segmentId={activeSegmentId}
      />

      {status ? (
        <div className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white p-3 text-sm text-zinc-600 shadow-sm">
          <span>
            Đang lọc trạng thái/mức độ:{" "}
            <span className="font-semibold text-zinc-950">{status}</span>
          </span>
          <Link
            href={typeHref(activeType, activeSegmentId)}
            className="font-medium text-zinc-950 underline"
          >
            Bỏ lọc
          </Link>
        </div>
      ) : null}

      {result.error ? (
        <section className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-800">
          <div className="flex items-start gap-3">
            <ShieldAlert className="mt-0.5 size-5 shrink-0" />
            <div>
              <h2 className="font-semibold">Chưa đọc được drilldown</h2>
              <p className="mt-1">{result.error.message}</p>
            </div>
          </div>
        </section>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-zinc-500">
              Hiển thị{" "}
              <span className="font-semibold text-zinc-900">
                {filteredRows.length}
              </span>{" "}
              dòng. Nếu chưa thấy dữ liệu, kiểm tra workspace P0-13 hoặc dữ liệu
              nền P1-01 đến P1-10.
            </p>
            <span className="rounded-md bg-zinc-200 px-2 py-1 text-xs text-zinc-600">
              P1-13
            </span>
          </div>
          <DrilldownTable rows={filteredRows} />
        </>
      )}
    </AppShell>
  );
}
