import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock3,
  FileSearch,
  GitPullRequestArrow,
  RefreshCcw,
  RotateCcw,
  Save,
  ShieldAlert,
  SquarePlus,
} from "lucide-react";

import {
  createShortCourseWorkflowRequestAction,
  updateShortCourseWorkflowRequestAction,
} from "@/app/short-course/workflows/actions";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import {
  firstParam,
  getAdmissionWorkspaceContext,
  withAdmissionSegmentParam,
} from "@/lib/workspace";

type ShortCourseWorkflowPageProps = {
  searchParams?: Promise<{
    segment?: string | string[];
    entityType?: string | string[];
    entityId?: string | string[];
    entityCode?: string | string[];
    title?: string | string[];
    note?: string | string[];
    taskCode?: string | string[];
    sourceHref?: string | string[];
    created?: string | string[];
    updated?: string | string[];
    error?: string | string[];
  }>;
};

type WorkflowRequestRow = {
  id: string;
  request_code: string;
  request_title: string;
  approval_code: string;
  decision_name: string;
  workflow_code: string | null;
  workflow_name: string | null;
  entity_type: string;
  entity_id: string | null;
  entity_code: string | null;
  request_note: string | null;
  evidence_url: string | null;
  maker_note: string | null;
  checker_note: string | null;
  approver_note: string | null;
  request_status: string;
  requested_by_name: string | null;
  checked_by_name: string | null;
  approved_by_name: string | null;
  rejected_by_name: string | null;
  due_at: string | null;
  checked_at: string | null;
  approved_at: string | null;
  rejected_at: string | null;
  created_at: string;
  updated_at: string;
  is_overdue: boolean;
  request_flags: string[] | null;
  next_action: string;
  admission_segment_id: string | null;
  segment_label: string | null;
};

type ApprovalOptionRow = {
  approval_code: string;
  decision_name: string;
  workflow_code: string | null;
  required_evidence: string;
  blocking_rule: string;
  control_status: string;
};

type Summary = {
  total: number;
  pending: number;
  checked: number;
  approved: number;
  needsFix: number;
  overdue: number;
};

type StatusAction = {
  value: string;
  label: string;
  note: string;
};

const inputClass =
  "h-10 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm outline-none transition focus:border-zinc-500 focus:ring-3 focus:ring-zinc-200";

const textareaClass =
  "min-h-24 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-zinc-500 focus:ring-3 focus:ring-zinc-200";

const statusLabels: Record<string, string> = {
  DRAFT: "Bản nháp",
  PENDING_CHECK: "Chờ kiểm",
  CHECKED: "Đã kiểm",
  APPROVED: "Đã duyệt",
  REJECTED: "Từ chối",
  NEEDS_FIX: "Cần bổ sung",
  CANCELLED: "Đã hủy",
};

const statusTones: Record<string, string> = {
  DRAFT: "border-zinc-200 bg-zinc-50 text-zinc-700",
  PENDING_CHECK: "border-sky-200 bg-sky-50 text-sky-700",
  CHECKED: "border-indigo-200 bg-indigo-50 text-indigo-700",
  APPROVED: "border-emerald-200 bg-emerald-50 text-emerald-700",
  REJECTED: "border-rose-200 bg-rose-50 text-rose-700",
  NEEDS_FIX: "border-amber-200 bg-amber-50 text-amber-800",
  CANCELLED: "border-zinc-200 bg-zinc-100 text-zinc-600",
};

const flagLabels: Record<string, string> = {
  MISSING_EVIDENCE: "Thiếu minh chứng",
  MISSING_REQUEST_NOTE: "Thiếu ghi chú đề nghị",
  CHECK_OVERDUE: "Quá hạn kiểm",
  APPROVAL_OVERDUE: "Quá hạn duyệt",
  NEEDS_FIX: "Cần bổ sung",
  REJECTED: "Đã bị từ chối",
};

const requestTypes = [
  {
    value: "SHORT_STUDENT",
    label: "Hồ sơ học viên",
    note: "Sửa/bổ sung dữ liệu học viên ngắn hạn.",
  },
  {
    value: "SHORT_CLASS",
    label: "Lớp ngắn hạn",
    note: "Mở lớp, chỉnh lớp, kiểm tra lịch hoặc địa điểm.",
  },
  {
    value: "SHORT_ENROLLMENT",
    label: "Ghi danh/xếp lớp",
    note: "Gắn học viên vào lớp, kiểm tra trạng thái ghi danh.",
  },
  {
    value: "SHORT_ATTENDANCE",
    label: "Điểm danh",
    note: "Kiểm tra buổi học, khóa điểm danh, thiếu dữ liệu điểm danh.",
  },
  {
    value: "SHORT_BHXH",
    label: "BHXH/trợ cấp thất nghiệp",
    note: "Xử lý điều kiện, hồ sơ hoặc rủi ro chính sách.",
  },
  {
    value: "SHORT_FINANCE",
    label: "Học phí/công nợ",
    note: "Kiểm tra khoản phải thu, quá hạn hoặc sai số liệu.",
  },
  {
    value: "SHORT_PAYMENT",
    label: "Thanh toán/chứng từ",
    note: "Xác nhận thu, phiếu thu, chứng từ kế toán.",
  },
  {
    value: "SHORT_RISK",
    label: "Rủi ro/ngoại lệ",
    note: "Cảnh báo cần người phụ trách kiểm tra.",
  },
];

const errorMessages: Record<string, string> = {
  missing_workflow_request: "Thiếu thông tin phiếu xử lý.",
  invalid_workflow_request_status: "Trạng thái phiếu xử lý không hợp lệ.",
  invalid_workflow_transition:
    "Luồng trạng thái không hợp lệ. Hệ thống chỉ cho đi đúng bước: tạo, kiểm, duyệt hoặc trả về bổ sung.",
  not_allowed_workflow_request:
    "Tài khoản chưa có quyền tạo, kiểm hoặc duyệt phiếu xử lý.",
  workspace_not_allowed:
    "Tài khoản không được thao tác trong đối tượng tuyển sinh đang chọn.",
};

function formatNumber(value: number | null | undefined) {
  return new Intl.NumberFormat("vi-VN").format(value ?? 0);
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

function safePath(value: string | null | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return null;
  }

  return value;
}

function summarize(rows: WorkflowRequestRow[]): Summary {
  return {
    total: rows.length,
    pending: rows.filter((row) => row.request_status === "PENDING_CHECK")
      .length,
    checked: rows.filter((row) => row.request_status === "CHECKED").length,
    approved: rows.filter((row) => row.request_status === "APPROVED").length,
    needsFix: rows.filter((row) => row.request_status === "NEEDS_FIX").length,
    overdue: rows.filter((row) => row.is_overdue).length,
  };
}

function Metric({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: typeof GitPullRequestArrow;
}) {
  return (
    <article className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-md bg-zinc-100">
          <Icon className="size-5 text-zinc-600" />
        </div>
        <div>
          <p className="text-2xl font-semibold">{formatNumber(value)}</p>
          <p className="text-sm text-zinc-500">{label}</p>
        </div>
      </div>
    </article>
  );
}

function RequestFlags({ flags }: { flags: string[] | null }) {
  if (!flags || flags.length === 0) {
    return (
      <span className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
        Đủ thông tin tối thiểu
      </span>
    );
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {flags.map((flag) => (
        <span
          key={flag}
          className="rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-medium text-amber-800"
        >
          {flagLabels[flag] ?? flag}
        </span>
      ))}
    </div>
  );
}

function RequestStatusSelect({
  canCheck,
  canApprove,
}: {
  canCheck: boolean;
  canApprove: boolean;
}) {
  return (
    <select name="request_status" className={inputClass} defaultValue="CHECKED">
      {canCheck ? <option value="CHECKED">Đã kiểm, chuyển duyệt</option> : null}
      {canCheck ? <option value="NEEDS_FIX">Trả về bổ sung</option> : null}
      {canCheck ? <option value="CANCELLED">Hủy phiếu</option> : null}
      {canApprove ? <option value="APPROVED">Duyệt</option> : null}
      {canApprove ? <option value="REJECTED">Từ chối</option> : null}
    </select>
  );
}

function requestStatusActions({
  row,
  canCreate,
  canCheck,
  canApprove,
}: {
  row: WorkflowRequestRow;
  canCreate: boolean;
  canCheck: boolean;
  canApprove: boolean;
}): StatusAction[] {
  if (row.request_status === "DRAFT" || row.request_status === "NEEDS_FIX") {
    return canCreate
      ? [
          {
            value: "PENDING_CHECK",
            label: "Gửi kiểm",
            note: "Dùng khi người tạo đã bổ sung xong thông tin.",
          },
          {
            value: "CANCELLED",
            label: "Hủy phiếu",
            note: "Dùng khi việc không còn cần xử lý.",
          },
        ]
      : [];
  }

  if (row.request_status === "PENDING_CHECK") {
    return canCheck
      ? [
          {
            value: "CHECKED",
            label: "Đã kiểm, chuyển duyệt",
            note: "Dùng khi thông tin đủ để trình duyệt.",
          },
          {
            value: "NEEDS_FIX",
            label: "Trả về bổ sung",
            note: "Dùng khi thiếu minh chứng hoặc thiếu ghi chú.",
          },
          {
            value: "CANCELLED",
            label: "Hủy phiếu",
            note: "Dùng khi phiếu tạo sai hoặc không còn cần xử lý.",
          },
        ]
      : [];
  }

  if (row.request_status === "CHECKED") {
    return canApprove
      ? [
          {
            value: "APPROVED",
            label: "Duyệt",
            note: "Dùng khi đồng ý cho xử lý nghiệp vụ tiếp theo.",
          },
          {
            value: "REJECTED",
            label: "Từ chối",
            note: "Dùng khi không chấp thuận yêu cầu.",
          },
        ]
      : [];
  }

  return [];
}

function sourceHrefForRequest(
  row: WorkflowRequestRow,
  activeSegmentId: string | null,
) {
  if (!row.entity_id) {
    return null;
  }

  const typeMap: Record<string, string> = {
    SHORT_STUDENT: "students",
    SHORT_CLASS: "classes",
    SHORT_ENROLLMENT: "enrollments",
    SHORT_ATTENDANCE: "attendance",
    SHORT_BHXH: "bhxh",
    SHORT_FINANCE: "invoices",
    SHORT_PAYMENT: "payments",
    SHORT_RISK: "risks",
  };
  const drilldownType = typeMap[row.entity_type];

  if (!drilldownType) {
    return null;
  }

  return withAdmissionSegmentParam(
    `/short-course/drilldown?type=${drilldownType}&entityId=${row.entity_id}`,
    activeSegmentId,
  );
}

function WorkflowRequestCards({
  rows,
  canCreate,
  canCheck,
  canApprove,
  activeSegmentId,
}: {
  rows: WorkflowRequestRow[];
  canCreate: boolean;
  canCheck: boolean;
  canApprove: boolean;
  activeSegmentId: string | null;
}) {
  if (rows.length === 0) {
    return (
      <div className="p-8 text-center text-sm leading-6 text-zinc-500">
        Chưa có phiếu xử lý ngắn hạn trong phạm vi đang chọn.
      </div>
    );
  }

  return (
    <div className="grid gap-4 p-5">
      {rows.map((row) => {
        const actions = requestStatusActions({
          row,
          canCreate,
          canCheck,
          canApprove,
        });
        const sourceHref = sourceHrefForRequest(row, activeSegmentId);
        const noteFieldName =
          row.request_status === "CHECKED"
            ? "approver_note"
            : row.request_status === "DRAFT" ||
                row.request_status === "NEEDS_FIX"
              ? "maker_note"
              : "checker_note";

        return (
          <article
            key={row.id}
            className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm"
          >
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div className="min-w-0 space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-md border px-2 py-1 text-xs font-medium ${
                      statusTones[row.request_status] ??
                      "border-zinc-200 bg-zinc-50 text-zinc-700"
                    }`}
                  >
                    {statusLabels[row.request_status] ?? row.request_status}
                  </span>
                  {row.is_overdue ? (
                    <span className="rounded-md border border-rose-200 bg-rose-50 px-2 py-1 text-xs font-medium text-rose-700">
                      Quá hạn
                    </span>
                  ) : null}
                  <span className="font-mono text-xs text-zinc-500">
                    {row.request_code}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-semibold text-zinc-950">
                    {row.request_title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-zinc-600">
                    {row.request_note ?? "Chưa có ghi chú đề nghị."}
                  </p>
                </div>

                <div className="grid gap-3 text-sm text-zinc-600 md:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-md bg-zinc-50 p-3">
                    <p className="text-xs uppercase text-zinc-500">Nghiệp vụ</p>
                    <p className="mt-1 font-medium text-zinc-800">
                      {row.decision_name}
                    </p>
                    <p className="mt-1 font-mono text-xs text-zinc-500">
                      {row.approval_code}
                    </p>
                  </div>
                  <div className="rounded-md bg-zinc-50 p-3">
                    <p className="text-xs uppercase text-zinc-500">Đối tượng</p>
                    <p className="mt-1 font-medium text-zinc-800">
                      {row.entity_type}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">
                      {row.entity_code ?? row.entity_id ?? "Chưa gắn mã"}
                    </p>
                  </div>
                  <div className="rounded-md bg-zinc-50 p-3">
                    <p className="text-xs uppercase text-zinc-500">Người xử lý</p>
                    <p className="mt-1">Tạo: {row.requested_by_name ?? "Chưa rõ"}</p>
                    <p>Kiểm: {row.checked_by_name ?? "Chưa kiểm"}</p>
                    <p>
                      Duyệt:{" "}
                      {row.approved_by_name ??
                        row.rejected_by_name ??
                        "Chưa duyệt"}
                    </p>
                  </div>
                  <div className="rounded-md bg-zinc-50 p-3">
                    <p className="text-xs uppercase text-zinc-500">Thời gian</p>
                    <p className="mt-1">Tạo: {formatDateTime(row.created_at)}</p>
                    <p>Hạn: {formatDateTime(row.due_at)}</p>
                    <p>Cập nhật: {formatDateTime(row.updated_at)}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <RequestFlags flags={row.request_flags} />
                  {row.segment_label ? (
                    <span className="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1 text-xs text-zinc-600">
                      {row.segment_label}
                    </span>
                  ) : null}
                  {sourceHref ? (
                    <Button asChild variant="outline" size="sm">
                      <Link href={sourceHref}>
                        Mở dữ liệu nguồn
                        <ArrowRight className="size-4" />
                      </Link>
                    </Button>
                  ) : null}
                  {row.evidence_url ? (
                    <Button asChild variant="outline" size="sm">
                      <a href={row.evidence_url}>Mở minh chứng</a>
                    </Button>
                  ) : null}
                </div>
              </div>

              <div className="w-full shrink-0 xl:w-[360px]">
                {actions.length > 0 ? (
                  <form
                    action={updateShortCourseWorkflowRequestAction}
                    className="grid gap-3 rounded-lg border border-zinc-200 bg-zinc-50 p-4"
                  >
                    <input
                      type="hidden"
                      name="return_to"
                      value="/short-course/workflows"
                    />
                    <input
                      type="hidden"
                      name="admission_segment_id"
                      value={activeSegmentId ?? ""}
                    />
                    <input type="hidden" name="request_id" value={row.id} />
                    <label className="grid gap-1">
                      <span className="text-sm font-medium text-zinc-700">
                        Hành động tiếp theo
                      </span>
                      <select
                        name="request_status"
                        className={inputClass}
                        defaultValue={actions[0]?.value}
                      >
                        {actions.map((action) => (
                          <option key={action.value} value={action.value}>
                            {action.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <p className="text-xs leading-5 text-zinc-500">
                      {actions[0]?.note}
                    </p>
                    <input
                      name="evidence_url"
                      className={inputClass}
                      defaultValue={row.evidence_url ?? ""}
                      placeholder="Link minh chứng"
                    />
                    <textarea
                      name={noteFieldName}
                      className={textareaClass}
                      defaultValue={
                        noteFieldName === "approver_note"
                          ? row.approver_note ?? ""
                          : noteFieldName === "maker_note"
                            ? row.maker_note ?? ""
                            : row.checker_note ?? ""
                      }
                      placeholder="Ghi chú xử lý"
                    />
                    <Button type="submit" size="sm">
                      <Save className="size-4" />
                      Lưu xử lý
                    </Button>
                  </form>
                ) : (
                  <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm leading-6 text-zinc-500">
                    {["APPROVED", "REJECTED", "CANCELLED"].includes(
                      row.request_status,
                    )
                      ? "Phiếu đã kết thúc."
                      : "Tài khoản hiện tại chưa có quyền xử lý bước này."}
                  </div>
                )}
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}

function Message({
  message,
  tone = "success",
}: {
  message: string;
  tone?: "success" | "error" | "warning";
}) {
  const toneClass =
    tone === "error"
      ? "border-rose-200 bg-rose-50 text-rose-700"
      : tone === "warning"
        ? "border-amber-200 bg-amber-50 text-amber-800"
        : "border-emerald-200 bg-emerald-50 text-emerald-700";

  return (
    <section className={`rounded-lg border p-4 text-sm leading-6 ${toneClass}`}>
      {message}
    </section>
  );
}

export default async function ShortCourseWorkflowPage({
  searchParams,
}: ShortCourseWorkflowPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const params = await searchParams;
  const requestedSegmentId = firstParam(params?.segment) ?? null;
  const workspace = await getAdmissionWorkspaceContext(
    supabase,
    user.id,
    requestedSegmentId,
  );
  const activeSegmentId = workspace.activeSegmentId;
  const pageHref = withAdmissionSegmentParam(
    "/short-course/workflows",
    activeSegmentId,
  );
  const actionCenterHref = withAdmissionSegmentParam(
    "/short-course/actions",
    activeSegmentId,
  );
  const sourceHref = safePath(firstParam(params?.sourceHref));

  const [
    { data: roleCode },
    { data: canCreateWorkflow },
    { data: canCheckWorkflow },
    { data: canApproveWorkflow },
    { data: approvalOptions, error: approvalOptionsError },
    { data: workflowRows, error: workflowRowsError },
  ] = await Promise.all([
    supabase.rpc("current_user_role_code"),
    supabase.rpc("can_create_workflow_request"),
    supabase.rpc("can_check_workflow_request"),
    supabase.rpc("can_approve_workflow_request"),
    supabase
      .from("heu_os_approval_matrix")
      .select(
        "approval_code,decision_name,workflow_code,required_evidence,blocking_rule,control_status",
      )
      .eq("module_code", "M11_SHORT_COURSE_ERP")
      .eq("status", "ACTIVE")
      .order("created_at", { ascending: false })
      .returns<ApprovalOptionRow[]>(),
    (() => {
      let query = supabase
        .from("short_course_workflow_request_status")
        .select(
          "id,request_code,request_title,approval_code,decision_name,workflow_code,workflow_name,entity_type,entity_id,entity_code,request_note,evidence_url,maker_note,checker_note,approver_note,request_status,requested_by_name,checked_by_name,approved_by_name,rejected_by_name,due_at,checked_at,approved_at,rejected_at,created_at,updated_at,is_overdue,request_flags,next_action,admission_segment_id,segment_label",
        )
        .order("created_at", { ascending: false })
        .limit(80);

      if (activeSegmentId) {
        query = query.or(
          `admission_segment_id.eq.${activeSegmentId},admission_segment_id.is.null`,
        );
      }

      return query.returns<WorkflowRequestRow[]>();
    })(),
  ]);

  const canCreate = roleCode === "ADMIN" || Boolean(canCreateWorkflow);
  const canCheck = roleCode === "ADMIN" || Boolean(canCheckWorkflow);
  const canApprove = roleCode === "ADMIN" || Boolean(canApproveWorkflow);
  const rows = workflowRows ?? [];
  const summary = summarize(rows);
  const defaultApprovalCode =
    approvalOptions?.find(
      (approval) =>
        approval.approval_code === "APPROVE_P1_15_SHORT_WORK_REQUEST",
    )?.approval_code ??
    approvalOptions?.[0]?.approval_code ??
    "APPROVE_P1_15_SHORT_WORK_REQUEST";
  const defaultEntityType =
    firstParam(params?.entityType) ?? requestTypes[0]?.value ?? "SHORT_COURSE";
  const message = params?.created
    ? "Đã tạo phiếu xử lý. Phiếu đã đi vào luồng kiểm/duyệt."
    : params?.updated
      ? "Đã cập nhật trạng thái phiếu xử lý."
      : undefined;
  const errorCode = firstParam(params?.error);
  const error = errorCode
    ? errorMessages[errorCode] ?? decodeURIComponent(errorCode)
    : undefined;

  return (
    <AppShell
      active="short-course"
      title="P1-15 · Phiếu xử lý ngắn hạn"
      description={
        workspace.activeSegment
          ? `Tạo và theo dõi phiếu xử lý trong phạm vi: ${workspace.activeSegment.label}.`
          : "Tạo phiếu xử lý nghiệp vụ ngắn hạn có maker, checker, approver và audit."
      }
      workspaceSegmentId={activeSegmentId}
      workspaceReturnTo={pageHref}
      actions={
        <>
          <Button asChild variant="outline">
            <Link href={withAdmissionSegmentParam("/short-course", activeSegmentId)}>
              <ArrowLeft className="size-4" />
              Dashboard ngắn hạn
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={actionCenterHref}>
              <GitPullRequestArrow className="size-4" />
              Action Center
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={pageHref}>
              <RefreshCcw className="size-4" />
              Tải lại
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/search?q=P1-15">
              <FileSearch className="size-4" />
              Tìm P1-15
            </Link>
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        {message ? <Message message={message} /> : null}
        {error ? <Message message={error} tone="error" /> : null}
        {workflowRowsError ? (
          <Message
            tone="warning"
            message={`Chưa đọc được P1-15 từ Supabase. Hãy chạy database/step79_short_course_workflow_requests.sql rồi tải lại. Chi tiết: ${workflowRowsError.message}`}
          />
        ) : null}
        {approvalOptionsError ? (
          <Message
            tone="warning"
            message={`Chưa đọc được danh sách điểm duyệt. Chi tiết: ${approvalOptionsError.message}`}
          />
        ) : null}

        <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <GitPullRequestArrow className="size-5 text-zinc-600" />
                <h2 className="text-lg font-semibold">
                  P1-15 · Workflow Request ngắn hạn
                </h2>
              </div>
              <p className="mt-2 max-w-5xl text-sm leading-6 text-zinc-500">
                Phiếu xử lý là lớp kiểm soát giữa cảnh báo và hành động. Người
                tạo nêu việc cần xử lý, người kiểm xác nhận đủ căn cứ, người
                duyệt quyết định. Action Center chỉ chỉ ra việc; P1-15 mới tạo
                luồng xử lý có log.
              </p>
            </div>
            <span className="rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-medium text-zinc-600">
              Đúng người duyệt · Có minh chứng · Có audit
            </span>
          </div>
        </section>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
          <Metric label="Tổng phiếu" value={summary.total} icon={GitPullRequestArrow} />
          <Metric label="Chờ kiểm" value={summary.pending} icon={Clock3} />
          <Metric label="Đã kiểm" value={summary.checked} icon={CheckCircle2} />
          <Metric label="Đã duyệt" value={summary.approved} icon={CheckCircle2} />
          <Metric label="Cần bổ sung" value={summary.needsFix} icon={RotateCcw} />
          <Metric label="Quá hạn" value={summary.overdue} icon={ShieldAlert} />
        </div>

        <section className="rounded-lg border border-zinc-200 bg-white shadow-sm">
          <div className="border-b border-zinc-200 p-5">
            <h2 className="text-base font-semibold">Tạo phiếu xử lý</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Nếu đi từ Action Center, các ô chính đã được điền sẵn. Anh/chị chỉ
              kiểm tra lại, bổ sung minh chứng nếu có, rồi bấm tạo phiếu.
            </p>
          </div>

          {canCreate ? (
            <form
              action={createShortCourseWorkflowRequestAction}
              className="grid gap-4 p-5 lg:grid-cols-4"
            >
              <input
                type="hidden"
                name="return_to"
                value="/short-course/workflows"
              />
              <input
                type="hidden"
                name="admission_segment_id"
                value={activeSegmentId ?? ""}
              />
              <input
                type="hidden"
                name="task_code"
                value={firstParam(params?.taskCode) ?? ""}
              />
              <input type="hidden" name="source_href" value={sourceHref ?? ""} />

              <label className="grid gap-1">
                <span className="text-sm font-medium text-zinc-700">
                  Điểm duyệt
                </span>
                <select
                  name="approval_code"
                  className={inputClass}
                  defaultValue={defaultApprovalCode}
                  required
                >
                  {approvalOptions?.length ? (
                    approvalOptions.map((approval) => (
                      <option
                        key={approval.approval_code}
                        value={approval.approval_code}
                      >
                        {approval.approval_code} - {approval.decision_name}
                      </option>
                    ))
                  ) : (
                    <option value={defaultApprovalCode}>
                      APPROVE_P1_15_SHORT_WORK_REQUEST
                    </option>
                  )}
                </select>
              </label>

              <label className="grid gap-1">
                <span className="text-sm font-medium text-zinc-700">
                  Loại việc
                </span>
                <select
                  name="entity_type"
                  className={inputClass}
                  defaultValue={defaultEntityType}
                  required
                >
                  {requestTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-1 lg:col-span-2">
                <span className="text-sm font-medium text-zinc-700">
                  Tên việc cần xử lý
                </span>
                <input
                  name="request_title"
                  className={inputClass}
                  defaultValue={firstParam(params?.title) ?? ""}
                  placeholder="VD: Bổ sung CCCD cho học viên..."
                  required
                />
              </label>

              <label className="grid gap-1">
                <span className="text-sm font-medium text-zinc-700">
                  Mã đối tượng
                </span>
                <input
                  name="entity_code"
                  className={inputClass}
                  defaultValue={
                    firstParam(params?.entityCode) ??
                    firstParam(params?.taskCode) ??
                    ""
                  }
                  placeholder="Mã học viên/lớp/việc"
                />
              </label>

              <label className="grid gap-1">
                <span className="text-sm font-medium text-zinc-700">
                  ID nếu có
                </span>
                <input
                  name="entity_id"
                  className={inputClass}
                  defaultValue={firstParam(params?.entityId) ?? ""}
                  placeholder="UUID từ hệ thống"
                />
              </label>

              <label className="grid gap-1">
                <span className="text-sm font-medium text-zinc-700">
                  Hạn xử lý
                </span>
                <input name="due_at" type="datetime-local" className={inputClass} />
              </label>

              <label className="grid gap-1">
                <span className="text-sm font-medium text-zinc-700">
                  Trạng thái tạo
                </span>
                <select
                  name="request_status"
                  className={inputClass}
                  defaultValue="PENDING_CHECK"
                >
                  <option value="PENDING_CHECK">Gửi kiểm ngay</option>
                  <option value="DRAFT">Lưu nháp</option>
                </select>
              </label>

              <label className="grid gap-1 lg:col-span-2">
                <span className="text-sm font-medium text-zinc-700">
                  Link minh chứng
                </span>
                <input
                  name="evidence_url"
                  className={inputClass}
                  placeholder="Link Drive, ảnh, quyết định, chứng từ..."
                />
              </label>

              <label className="grid gap-1 lg:col-span-2">
                <span className="text-sm font-medium text-zinc-700">
                  Nội dung đề nghị
                </span>
                <textarea
                  name="request_note"
                  className={textareaClass}
                  defaultValue={firstParam(params?.note) ?? ""}
                  placeholder="Nêu rõ việc cần xử lý, lý do, rủi ro nếu không xử lý."
                />
              </label>

              <label className="grid gap-1 lg:col-span-2">
                <span className="text-sm font-medium text-zinc-700">
                  Ghi chú người tạo
                </span>
                <textarea
                  name="maker_note"
                  className={textareaClass}
                  placeholder="Ghi chú nội bộ nếu cần."
                />
              </label>

              <div className="flex flex-wrap items-center gap-3 lg:col-span-4">
                <Button type="submit">
                  <SquarePlus className="size-4" />
                  Tạo phiếu xử lý
                </Button>
                {sourceHref ? (
                  <Button asChild variant="outline">
                    <Link href={sourceHref}>
                      Mở màn hình nguồn
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                ) : null}
              </div>
            </form>
          ) : (
            <div className="p-5 text-sm leading-6 text-zinc-500">
              Tài khoản hiện tại chưa có quyền tạo phiếu xử lý. Cần được cấp
              quyền workflow_request.create hoặc quyền Master Control phù hợp.
            </div>
          )}
        </section>

        <section className="rounded-lg border border-zinc-200 bg-white shadow-sm">
          <div className="border-b border-zinc-200 p-5">
            <h2 className="text-base font-semibold">Phiếu đang xử lý</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Luồng chuẩn: tạo phiếu → kiểm → duyệt hoặc trả về bổ sung. Mỗi
              lần cập nhật đều đi qua Supabase và audit log.
            </p>
          </div>

          <WorkflowRequestCards
            rows={rows}
            canCreate={canCreate}
            canCheck={canCheck}
            canApprove={canApprove}
            activeSegmentId={activeSegmentId}
          />

          <div className="hidden">
            <table className="w-full min-w-[1280px] text-sm">
              <thead className="bg-zinc-50 text-left text-xs font-medium uppercase text-zinc-500">
                <tr>
                  <th className="px-5 py-3">Phiếu</th>
                  <th className="px-5 py-3">Nghiệp vụ</th>
                  <th className="px-5 py-3">Đối tượng</th>
                  <th className="px-5 py-3">Người xử lý</th>
                  <th className="px-5 py-3">Trạng thái</th>
                  <th className="px-5 py-3">Cảnh báo</th>
                  {canCheck || canApprove ? (
                    <th className="px-5 py-3">Cập nhật</th>
                  ) : null}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {rows.length === 0 ? (
                  <tr>
                    <td
                      className="px-5 py-10 text-center text-zinc-500"
                      colSpan={canCheck || canApprove ? 7 : 6}
                    >
                      Chưa có phiếu xử lý ngắn hạn trong phạm vi đang chọn.
                    </td>
                  </tr>
                ) : (
                  rows.map((row) => {
                    const canUpdate =
                      (canCheck || canApprove) &&
                      !["APPROVED", "REJECTED", "CANCELLED"].includes(
                        row.request_status,
                      );

                    return (
                      <tr key={row.id} className="align-top">
                        <td className="px-5 py-4">
                          <p className="font-mono text-xs text-zinc-500">
                            {row.request_code}
                          </p>
                          <p className="mt-1 font-medium text-zinc-950">
                            {row.request_title}
                          </p>
                          <p className="mt-2 text-xs text-zinc-500">
                            Tạo: {formatDateTime(row.created_at)}
                            {row.due_at
                              ? ` · hạn ${formatDateTime(row.due_at)}`
                              : ""}
                          </p>
                          <p className="mt-1 text-xs text-zinc-500">
                            {row.segment_label ?? "Chưa gắn phạm vi"}
                          </p>
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-medium text-zinc-700">
                            {row.decision_name}
                          </p>
                          <p className="mt-1 font-mono text-xs text-zinc-500">
                            {row.approval_code}
                          </p>
                          <p className="mt-2 text-xs text-zinc-500">
                            {row.workflow_name ??
                              row.workflow_code ??
                              "Chưa gắn workflow"}
                          </p>
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-medium text-zinc-700">
                            {row.entity_type}
                          </p>
                          <p className="mt-1 text-xs text-zinc-500">
                            {row.entity_code ?? row.entity_id ?? "Chưa gắn mã"}
                          </p>
                          <p className="mt-2 line-clamp-2 text-xs text-zinc-500">
                            {row.request_note ?? "Chưa có ghi chú đề nghị"}
                          </p>
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-zinc-700">
                            Tạo: {row.requested_by_name ?? "Chưa rõ"}
                          </p>
                          <p className="mt-1 text-zinc-700">
                            Kiểm: {row.checked_by_name ?? "Chưa kiểm"}
                          </p>
                          <p className="mt-1 text-zinc-700">
                            Duyệt:{" "}
                            {row.approved_by_name ??
                              row.rejected_by_name ??
                              "Chưa duyệt"}
                          </p>
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-md border px-2 py-1 text-xs font-medium ${
                              statusTones[row.request_status] ??
                              "border-zinc-200 bg-zinc-50 text-zinc-700"
                            }`}
                          >
                            {statusLabels[row.request_status] ??
                              row.request_status}
                          </span>
                          <p className="mt-2 text-xs text-zinc-500">
                            Bước tiếp: {row.next_action}
                          </p>
                        </td>
                        <td className="px-5 py-4">
                          <RequestFlags flags={row.request_flags} />
                          {row.evidence_url ? (
                            <a
                              href={row.evidence_url}
                              className="mt-2 block text-xs text-zinc-700 underline"
                            >
                              Mở minh chứng
                            </a>
                          ) : null}
                        </td>
                        {canCheck || canApprove ? (
                          <td className="px-5 py-4">
                            {canUpdate ? (
                              <form
                                action={updateShortCourseWorkflowRequestAction}
                                className="grid min-w-72 gap-2"
                              >
                                <input
                                  type="hidden"
                                  name="return_to"
                                  value="/short-course/workflows"
                                />
                                <input
                                  type="hidden"
                                  name="admission_segment_id"
                                  value={activeSegmentId ?? ""}
                                />
                                <input
                                  type="hidden"
                                  name="request_id"
                                  value={row.id}
                                />
                                <RequestStatusSelect
                                  canCheck={canCheck}
                                  canApprove={canApprove}
                                />
                                <input
                                  name="evidence_url"
                                  className={inputClass}
                                  defaultValue={row.evidence_url ?? ""}
                                  placeholder="Link minh chứng"
                                />
                                {canCheck ? (
                                  <textarea
                                    name="checker_note"
                                    className={textareaClass}
                                    defaultValue={row.checker_note ?? ""}
                                    placeholder="Ghi chú kiểm"
                                  />
                                ) : null}
                                {canApprove ? (
                                  <textarea
                                    name="approver_note"
                                    className={textareaClass}
                                    defaultValue={row.approver_note ?? ""}
                                    placeholder="Ghi chú duyệt"
                                  />
                                ) : null}
                                <Button type="submit" size="sm">
                                  <Save className="size-4" />
                                  Lưu xử lý
                                </Button>
                              </form>
                            ) : (
                              <span className="text-xs text-zinc-500">
                                Phiếu đã kết thúc.
                              </span>
                            )}
                          </td>
                        ) : null}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
