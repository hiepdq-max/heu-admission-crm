import Link from "next/link";
import { redirect } from "next/navigation";
import { FileSearch, RefreshCcw } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import {
  ShortCourseDashboard,
  type ShortCourseExceptionRow,
  type ShortCourseExceptionSummaryRow,
  type ShortCourseKpiRow,
  type ShortCourseSummaryRow,
} from "@/components/short-course/short-course-dashboard";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import {
  firstParam,
  getAdmissionWorkspaceContext,
  withAdmissionSegmentParam,
} from "@/lib/workspace";

type ShortCoursePageProps = {
  searchParams?: Promise<{
    segment?: string | string[];
  }>;
};

type StudentLiteRow = {
  student_status: string | null;
};

type ClassLiteRow = {
  id: string;
  class_status: string | null;
};

type EnrollmentLiteRow = {
  id: string;
  class_id: string | null;
  enrollment_status: string | null;
  attendance_status: string | null;
  finance_status: string | null;
  bhxh_policy_status: string | null;
  evidence_status: string | null;
};

type AttendanceLiteRow = {
  session_status: string | null;
  attendance_locked: boolean | null;
};

type BhxhLiteRow = {
  eligibility_status: string | null;
  case_status: string | null;
};

type InvoiceLiteRow = {
  balance_amount_vnd: number | string | null;
  invoice_status: string | null;
};

type PaymentLiteRow = {
  payment_amount_vnd: number | string | null;
  payment_status: string | null;
};

type RiskAlertLiteRow = {
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

const severityOrder: Record<string, number> = {
  CRITICAL: 0,
  HIGH: 1,
  MEDIUM: 2,
  LOW: 3,
};

function numericValue(value: number | string | null | undefined) {
  if (value === null || value === undefined) {
    return 0;
  }

  if (typeof value === "number") {
    return value;
  }

  return Number(value) || 0;
}

function countRows<Row>(rows: Row[], predicate: (row: Row) => boolean) {
  return rows.filter(predicate).length;
}

function sumRows<Row>(
  rows: Row[],
  getValue: (row: Row) => number | string | null | undefined,
) {
  return rows.reduce((total, row) => total + numericValue(getValue(row)), 0);
}

function countResultValue(result: { count: number | null }) {
  return result.count ?? 0;
}

function emptyResult<Row>() {
  return Promise.resolve({
    data: [] as Row[],
    count: 0,
    error: null,
  });
}

function compactErrorMessages(
  errors: Array<{ message: string } | null | undefined>,
) {
  const messages = Array.from(
    new Set(errors.filter(Boolean).map((error) => error?.message ?? "")),
  ).filter(Boolean);

  return messages.join(" | ") || null;
}

function buildKpis(
  summary: ShortCourseSummaryRow,
  activeSegmentId: string | null,
): ShortCourseKpiRow[] {
  const drilldownHref = (type: string, extra = "") =>
    withAdmissionSegmentParam(
      `/short-course/drilldown?type=${type}${extra}`,
      activeSegmentId,
    );
  const openRiskCount = numericValue(summary.open_risk_count);
  const criticalRiskCount = numericValue(summary.dashboard_critical_exception_count);
  const financeOpenBalance = numericValue(summary.finance_open_balance_vnd);
  const paymentPendingCount = numericValue(summary.payment_pending_count);
  const bhxhNeedsFixCount = numericValue(summary.bhxh_needs_fix_count);
  const attendanceNeedsFixCount = numericValue(summary.attendance_needs_fix_count);

  return [
    {
      metric_code: "TOTAL_STUDENTS",
      metric_label: "Học viên ngắn hạn",
      metric_group: "OPERATIONS",
      metric_value: summary.student_count,
      severity: "LOW",
      owner_department: "CTHSSV + DAO_TAO",
      metric_note: "Đọc trực tiếp từ Student Master trong phạm vi đang chọn.",
      href: drilldownHref("students"),
    },
    {
      metric_code: "OPEN_CLASSES",
      metric_label: "Lớp đang mở/chạy",
      metric_group: "OPERATIONS",
      metric_value: summary.class_running_count,
      severity: "LOW",
      owner_department: "DAO_TAO",
      metric_note: "Lớp OPEN hoặc IN_PROGRESS.",
      href: drilldownHref("classes"),
    },
    {
      metric_code: "OPEN_EXCEPTIONS",
      metric_label: "Rủi ro đang mở",
      metric_group: "EXCEPTION",
      metric_value: summary.open_risk_count,
      severity: openRiskCount > 0 ? "HIGH" : "LOW",
      owner_department: "BGH + IT_DATA + AUDIT",
      metric_note: "Risk alert chưa RESOLVED/DISMISSED.",
      href: drilldownHref("risks"),
    },
    {
      metric_code: "CRITICAL_EXCEPTIONS",
      metric_label: "Rủi ro nghiêm trọng",
      metric_group: "EXCEPTION",
      metric_value: summary.dashboard_critical_exception_count,
      severity: criticalRiskCount > 0 ? "CRITICAL" : "LOW",
      owner_department: "BGH + AUDIT",
      metric_note: "Cần xử lý trước khi tự động hóa.",
      href: drilldownHref("risks", "&status=CRITICAL"),
    },
    {
      metric_code: "FINANCE_OPEN_BALANCE",
      metric_label: "Công nợ còn mở",
      metric_group: "FINANCE",
      metric_value: summary.finance_open_balance_vnd,
      severity: financeOpenBalance > 0 ? "MEDIUM" : "LOW",
      owner_department: "KHTC",
      metric_note: "Tổng số tiền còn phải thu theo invoice chưa hủy/hoàn.",
      href: drilldownHref("invoices"),
    },
    {
      metric_code: "PAYMENT_PENDING",
      metric_label: "Thanh toán chờ xác nhận",
      metric_group: "FINANCE",
      metric_value: summary.payment_pending_count,
      severity: paymentPendingCount > 0 ? "MEDIUM" : "LOW",
      owner_department: "KHTC",
      metric_note: "Payment PENDING cần kế toán đối soát.",
      href: drilldownHref("payments", "&status=PENDING"),
    },
    {
      metric_code: "BHXH_NEEDS_FIX",
      metric_label: "BHXH/chính sách cần sửa",
      metric_group: "COMPLIANCE",
      metric_value: summary.bhxh_needs_fix_count,
      severity: bhxhNeedsFixCount > 0 ? "HIGH" : "LOW",
      owner_department: "CTHSSV + PHAP_CHE",
      metric_note: "Case bị NEEDS_FIX/REJECTED cần bổ sung chứng cứ.",
      href: drilldownHref("bhxh"),
    },
    {
      metric_code: "ATTENDANCE_NEEDS_FIX",
      metric_label: "Điểm danh cần xử lý",
      metric_group: "DATA_QUALITY",
      metric_value: summary.attendance_needs_fix_count,
      severity: attendanceNeedsFixCount > 0 ? "HIGH" : "LOW",
      owner_department: "DAO_TAO",
      metric_note: "Buổi học đã mở nhưng chưa khóa/duyệt.",
      href: drilldownHref("attendance"),
    },
  ];
}

function buildExceptionSummary(
  rows: RiskAlertLiteRow[],
): ShortCourseExceptionSummaryRow[] {
  const grouped = new Map<string, ShortCourseExceptionSummaryRow>();

  for (const row of rows) {
    const severity = row.severity ?? "MEDIUM";
    const ownerDepartment = row.owner_department ?? "DAO_TAO + KHTC";
    const exceptionGroup = row.alert_type ?? "RISK_ALERT";
    const key = `${exceptionGroup}-${severity}-${ownerDepartment}`;
    const current = grouped.get(key);

    if (!current) {
      grouped.set(key, {
        exception_group: exceptionGroup,
        module_step: "P1-12",
        owner_department: ownerDepartment,
        severity,
        exception_count: 1,
        oldest_updated_at: row.updated_at,
        newest_updated_at: row.updated_at,
      });
      continue;
    }

    current.exception_count += 1;

    if (
      row.updated_at &&
      (!current.oldest_updated_at ||
        new Date(row.updated_at).getTime() <
          new Date(current.oldest_updated_at).getTime())
    ) {
      current.oldest_updated_at = row.updated_at;
    }

    if (
      row.updated_at &&
      (!current.newest_updated_at ||
        new Date(row.updated_at).getTime() >
          new Date(current.newest_updated_at).getTime())
    ) {
      current.newest_updated_at = row.updated_at;
    }
  }

  return Array.from(grouped.values()).sort((a, b) => {
    const severityCompare =
      (severityOrder[a.severity] ?? 9) - (severityOrder[b.severity] ?? 9);

    if (severityCompare !== 0) {
      return severityCompare;
    }

    return b.exception_count - a.exception_count;
  });
}

function buildExceptionRows(rows: RiskAlertLiteRow[]): ShortCourseExceptionRow[] {
  return rows
    .map((row) => ({
      exception_code: row.alert_code,
      module_step: "P1-12",
      exception_group: row.alert_type ?? "RISK_ALERT",
      severity: row.severity ?? "MEDIUM",
      exception_title: row.alert_title,
      entity_type: row.entity_type,
      entity_id: row.entity_id ?? "",
      entity_code: row.entity_code,
      entity_name: null,
      admission_segment_id: null,
      segment_code: null,
      segment_name: null,
      readiness_status: row.alert_status ?? "OPEN",
      control_flags: row.alert_type ? [row.alert_type] : [],
      owner_department: row.owner_department ?? "DAO_TAO + KHTC",
      action_hint:
        row.note ??
        "Kiểm tra risk alert gốc, xử lý đúng owner rồi cập nhật trạng thái.",
      source_view: "short_risk_alerts",
      updated_at: row.updated_at,
    }))
    .sort((a, b) => {
      const severityCompare =
        (severityOrder[a.severity] ?? 9) - (severityOrder[b.severity] ?? 9);

      if (severityCompare !== 0) {
        return severityCompare;
      }

      return (
        new Date(b.updated_at ?? 0).getTime() -
        new Date(a.updated_at ?? 0).getTime()
      );
    })
    .slice(0, 12);
}

export default async function ShortCoursePage({
  searchParams,
}: ShortCoursePageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const resolvedSearchParams = searchParams ? await searchParams : {};
  const requestedSegmentId = firstParam(resolvedSearchParams.segment);
  const workspace = await getAdmissionWorkspaceContext(
    supabase,
    user.id,
    requestedSegmentId,
  );
  const activeSegmentId = workspace.activeSegmentId;
  const refreshHref = withAdmissionSegmentParam(
    "/short-course",
    activeSegmentId,
  );

  function studentQuery() {
    let query = supabase
      .from("short_student_master")
      .select("student_status", { count: "exact" })
      .eq("status", "ACTIVE");

    if (activeSegmentId) {
      query = query.eq("admission_segment_id", activeSegmentId);
    }

    return query.limit(5000).returns<StudentLiteRow[]>();
  }

  function classQuery() {
    let query = supabase
      .from("short_class_master")
      .select("id,class_status", { count: "exact" })
      .eq("status", "ACTIVE");

    if (activeSegmentId) {
      query = query.eq("admission_segment_id", activeSegmentId);
    }

    return query.limit(5000).returns<ClassLiteRow[]>();
  }

  function enrollmentQuery() {
    let query = supabase
      .from("short_enrollments")
      .select(
        "id,class_id,enrollment_status,attendance_status,finance_status,bhxh_policy_status,evidence_status",
        { count: "exact" },
      )
      .eq("record_status", "ACTIVE");

    if (activeSegmentId) {
      query = query.eq("admission_segment_id", activeSegmentId);
    }

    return query.limit(5000).returns<EnrollmentLiteRow[]>();
  }

  const [studentsResult, classesResult, enrollmentsResult] = await Promise.all([
    studentQuery(),
    classQuery(),
    enrollmentQuery(),
  ]);

  const classRows = classesResult.data ?? [];
  const enrollmentRows = enrollmentsResult.data ?? [];
  const classIds = classRows.map((row) => row.id);
  const enrollmentIds = enrollmentRows.map((row) => row.id);

  function attendanceQuery() {
    let query = supabase
      .from("short_attendance_sessions")
      .select("session_status,attendance_locked", { count: "exact" })
      .eq("record_status", "ACTIVE");

    if (activeSegmentId) {
      query = query.in("class_id", classIds);
    }

    return query.limit(5000).returns<AttendanceLiteRow[]>();
  }

  function bhxhQuery() {
    let query = supabase
      .from("short_bhxh_policy_cases")
      .select("eligibility_status,case_status", { count: "exact" })
      .eq("record_status", "ACTIVE");

    if (activeSegmentId) {
      query = query.in("enrollment_id", enrollmentIds);
    }

    return query.limit(5000).returns<BhxhLiteRow[]>();
  }

  function invoiceQuery() {
    let query = supabase
      .from("short_finance_invoices")
      .select("balance_amount_vnd,invoice_status", { count: "exact" })
      .eq("record_status", "ACTIVE");

    if (activeSegmentId) {
      query = query.in("enrollment_id", enrollmentIds);
    }

    return query.limit(5000).returns<InvoiceLiteRow[]>();
  }

  function paymentQuery() {
    let query = supabase
      .from("short_payments")
      .select("payment_amount_vnd,payment_status", { count: "exact" })
      .eq("record_status", "ACTIVE");

    if (activeSegmentId) {
      query = query.in("enrollment_id", enrollmentIds);
    }

    return query.limit(5000).returns<PaymentLiteRow[]>();
  }

  const [
    attendanceResult,
    bhxhResult,
    invoiceResult,
    paymentResult,
    riskResult,
  ] = await Promise.all([
    activeSegmentId && classIds.length === 0
      ? emptyResult<AttendanceLiteRow>()
      : attendanceQuery(),
    activeSegmentId && enrollmentIds.length === 0
      ? emptyResult<BhxhLiteRow>()
      : bhxhQuery(),
    activeSegmentId && enrollmentIds.length === 0
      ? emptyResult<InvoiceLiteRow>()
      : invoiceQuery(),
    activeSegmentId && enrollmentIds.length === 0
      ? emptyResult<PaymentLiteRow>()
      : paymentQuery(),
    supabase
      .from("short_risk_alerts")
      .select(
        "alert_code,alert_type,alert_title,entity_type,entity_id,entity_code,severity,alert_status,owner_department,note,updated_at",
        { count: "exact" },
      )
      .eq("record_status", "ACTIVE")
      .not("alert_status", "in", "(RESOLVED,DISMISSED)")
      .limit(200)
      .returns<RiskAlertLiteRow[]>(),
  ]);

  const studentRows = studentsResult.data ?? [];
  const attendanceRows = attendanceResult.data ?? [];
  const bhxhRows = bhxhResult.data ?? [];
  const invoiceRows = invoiceResult.data ?? [];
  const paymentRows = paymentResult.data ?? [];
  const riskRows = riskResult.data ?? [];

  const verifiedPaymentRows = paymentRows.filter(
    (row) => row.payment_status === "VERIFIED",
  );
  const pendingPaymentCount = countRows(
    paymentRows,
    (row) => row.payment_status === "PENDING",
  );
  const criticalRiskCount = countRows(
    riskRows,
    (row) => row.severity === "CRITICAL",
  );
  const highRiskCount = countRows(riskRows, (row) => row.severity === "HIGH");

  const summary: ShortCourseSummaryRow = {
    student_count: countResultValue(studentsResult),
    class_count: countResultValue(classesResult),
    enrollment_count: countResultValue(enrollmentsResult),
    attendance_session_count: countResultValue(attendanceResult),
    bhxh_case_count: countResultValue(bhxhResult),
    invoice_count: countResultValue(invoiceResult),
    payment_count: countResultValue(paymentResult),
    open_risk_count: countResultValue(riskResult),
    student_needs_fix_count: countRows(
      studentRows,
      (row) => row.student_status === "STAGING",
    ),
    student_duplicate_risk_count: 0,
    student_verified_count: countRows(
      studentRows,
      (row) => row.student_status === "ACTIVE",
    ),
    class_needs_fix_count: countRows(
      classRows,
      (row) => row.class_status === "PLANNED",
    ),
    class_open_ready_count: countRows(
      classRows,
      (row) => row.class_status === "OPEN",
    ),
    class_running_count: countRows(classRows, (row) =>
      ["OPEN", "IN_PROGRESS"].includes(row.class_status ?? ""),
    ),
    enrollment_unassigned_count: countRows(
      enrollmentRows,
      (row) => row.class_id === null,
    ),
    enrollment_assignment_blocked_count: countRows(
      enrollmentRows,
      (row) => row.enrollment_status === "CANCELLED",
    ),
    enrollment_ready_for_class_open_count: countRows(
      enrollmentRows,
      (row) => row.class_id !== null && row.enrollment_status === "ENROLLED",
    ),
    enrollment_ready_for_attendance_count: countRows(
      enrollmentRows,
      (row) =>
        row.class_id !== null &&
        ["ENROLLED", "STUDYING"].includes(row.enrollment_status ?? ""),
    ),
    attendance_needs_fix_count: countRows(
      attendanceRows,
      (row) =>
        ["OPEN", "PLANNED"].includes(row.session_status ?? "") &&
        row.attendance_locked === false,
    ),
    attendance_ready_to_lock_count: countRows(
      attendanceRows,
      (row) => row.session_status === "OPEN" && row.attendance_locked === false,
    ),
    attendance_locked_or_approved_count: countRows(attendanceRows, (row) =>
      ["LOCKED", "APPROVED"].includes(row.session_status ?? ""),
    ),
    bhxh_needs_fix_count: countRows(
      bhxhRows,
      (row) =>
        row.eligibility_status === "NEEDS_FIX" ||
        row.case_status === "REJECTED",
    ),
    bhxh_ready_count: countRows(bhxhRows, (row) =>
      ["PENDING_CHECK", "CHECKED", "SUBMITTED", "APPROVED"].includes(
        row.case_status ?? "",
      ),
    ),
    bhxh_approved_count: countRows(
      bhxhRows,
      (row) => row.case_status === "APPROVED",
    ),
    finance_needs_fix_count: countRows(
      invoiceRows,
      (row) =>
        numericValue(row.balance_amount_vnd) > 0 &&
        row.invoice_status === "PAID",
    ),
    finance_ready_count: countRows(invoiceRows, (row) =>
      ["DRAFT", "ISSUED", "PARTIAL_PAID", "LOCKED"].includes(
        row.invoice_status ?? "",
      ),
    ),
    finance_open_balance_vnd: sumRows(
      invoiceRows.filter(
        (row) => !["CANCELLED", "REFUNDED"].includes(row.invoice_status ?? ""),
      ),
      (row) => row.balance_amount_vnd,
    ),
    payment_ready_to_verify_count: pendingPaymentCount,
    payment_needs_fix_count: countRows(paymentRows, (row) =>
      ["REJECTED", "REVERSED"].includes(row.payment_status ?? ""),
    ),
    payment_verified_count: verifiedPaymentRows.length,
    payment_pending_count: pendingPaymentCount,
    payment_verified_amount_vnd: sumRows(
      verifiedPaymentRows,
      (row) => row.payment_amount_vnd,
    ),
    dashboard_exception_count: countResultValue(riskResult),
    dashboard_critical_exception_count: criticalRiskCount,
    dashboard_high_exception_count: highRiskCount,
  };

  const kpis = buildKpis(summary, activeSegmentId);
  const exceptionSummary = buildExceptionSummary(riskRows);
  const exceptions = buildExceptionRows(riskRows);
  const coreErrors = [
    studentsResult.error,
    classesResult.error,
    enrollmentsResult.error,
  ];
  const loadError =
    coreErrors.every(Boolean) && coreErrors[0] ? coreErrors[0].message : null;
  const warning = loadError
    ? null
    : compactErrorMessages([
        ...coreErrors,
        attendanceResult.error,
        bhxhResult.error,
        invoiceResult.error,
        paymentResult.error,
        riskResult.error,
      ]);

  return (
    <AppShell
      active="short-course"
      title="ERP ngắn hạn"
      description={
        workspace.activeSegment
          ? `Dashboard vận hành ngắn hạn trong phạm vi: ${workspace.activeSegment.label}.`
          : "Dashboard vận hành ngắn hạn: học viên, lớp, điểm danh, chính sách, tài chính và exception."
      }
      workspaceSegmentId={activeSegmentId}
      workspaceReturnTo={refreshHref}
      actions={
        <>
          <Button asChild variant="outline">
            <Link href={refreshHref}>
              <RefreshCcw className="size-4" />
              Tải lại
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/search?q=P1-12">
              <FileSearch className="size-4" />
              Tìm P1-12
            </Link>
          </Button>
        </>
      }
    >
      <ShortCourseDashboard
        kpis={kpis}
        summary={summary}
        exceptionSummary={exceptionSummary}
        exceptions={exceptions}
        loadError={loadError}
        warning={warning}
      />
    </AppShell>
  );
}
