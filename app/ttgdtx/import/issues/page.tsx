import Link from "next/link";
import { redirect } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  BrainCircuit,
  CheckCircle2,
  Clock3,
  FileSearch,
  FileSpreadsheet,
  RefreshCcw,
  Route,
  SendHorizontal,
  ShieldAlert,
  UsersRound,
  Workflow,
} from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { firstParam } from "@/lib/workspace";

import { updateTtgdtxImportIssueTaskAction } from "./actions";

type IssuesPageProps = {
  searchParams?: Promise<{
    error?: string | string[];
    updated?: string | string[];
  }>;
};

type SegmentRow = {
  id: string;
  segment_code: string;
  segment_name: string;
};

type ScopeRow = {
  segment_id: string;
};

type IssueTaskRow = {
  task_id: string;
  task_code: string;
  issue_code: string;
  issue_title: string;
  issue_category: string;
  issue_category_label: string;
  issue_explanation: string;
  severity: string;
  severity_label: string;
  source_department: string;
  owner_department: string;
  report_to_department: string;
  task_status: string;
  task_status_label: string;
  sla_hours: number;
  due_at: string;
  is_overdue: boolean;
  requires_approval: boolean;
  default_fix_action: string;
  escalation_rule: string;
  source_sheet: string | null;
  check_status: string | null;
  check_message: string | null;
  fix_hint: string | null;
  resolution_note: string | null;
  evidence_url: string | null;
  ai_suggestion: string | null;
  batch_code: string;
  batch_name: string;
  admission_segment_id: string;
  segment_code: string;
  segment_name: string;
  created_at: string;
  updated_at: string;
};

type IssueSummaryRow = {
  issue_category: string;
  issue_category_label: string;
  task_count: number;
  open_count: number;
  critical_count: number;
  overdue_count: number;
  approval_required_count: number;
};

const fieldClass =
  "h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm outline-none focus:border-zinc-500";
const textAreaClass =
  "min-h-20 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500";

function formatDate(value: string | null | undefined) {
  if (!value) {
    return "Chưa có";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function canOpenIssues(
  segmentId: string | null,
  roleCode: string | null,
  scopes: ScopeRow[],
  hasIssueRead: boolean,
) {
  if (roleCode === "ADMIN" || roleCode === "BGH") {
    return true;
  }

  if (!segmentId || !hasIssueRead) {
    return false;
  }

  return scopes.some((scope) => scope.segment_id === segmentId);
}

function categoryTone(category: string) {
  switch (category) {
    case "SYSTEM_TECH":
      return "border-sky-200 bg-sky-50 text-sky-700";
    case "PROCESS_LOGIC":
      return "border-violet-200 bg-violet-50 text-violet-700";
    case "PROFESSIONAL":
      return "border-amber-200 bg-amber-50 text-amber-800";
    case "LEGAL_FINANCE":
      return "border-rose-200 bg-rose-50 text-rose-700";
    default:
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }
}

function severityTone(severity: string) {
  if (severity === "CRITICAL") {
    return "border-rose-300 bg-rose-100 text-rose-800";
  }

  if (severity === "ERROR") {
    return "border-orange-200 bg-orange-50 text-orange-800";
  }

  if (severity === "WARNING") {
    return "border-amber-200 bg-amber-50 text-amber-800";
  }

  return "border-zinc-200 bg-zinc-50 text-zinc-600";
}

function statusTone(status: string, isOverdue: boolean) {
  if (isOverdue) {
    return "border-rose-200 bg-rose-50 text-rose-700";
  }

  if (status === "RESOLVED") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (status === "WAITING_APPROVAL" || status === "ESCALATED") {
    return "border-violet-200 bg-violet-50 text-violet-700";
  }

  return "border-sky-200 bg-sky-50 text-sky-700";
}

export default async function TtgdtxImportIssuesPage({
  searchParams,
}: IssuesPageProps) {
  const params = await searchParams;
  const errorMessage = firstParam(params?.error);
  const updatedMessage = firstParam(params?.updated);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [
    roleResult,
    readPermissionResult,
    managePermissionResult,
    closePermissionResult,
    segmentResult,
    scopeResult,
  ] = await Promise.all([
    supabase.rpc("current_user_role_code"),
    supabase.rpc("has_permission", {
      permission_name: "ttgdtx.import.issue.read",
    }),
    supabase.rpc("has_permission", {
      permission_name: "ttgdtx.import.issue.resolve",
    }),
    supabase.rpc("has_permission", {
      permission_name: "ttgdtx.import.issue.close",
    }),
    supabase
      .from("admission_segments")
      .select("id,segment_code,segment_name")
      .eq("segment_code", "TC9_TTGDTX_LINKED")
      .eq("status", "ACTIVE")
      .maybeSingle<SegmentRow>(),
    supabase
      .from("user_admission_segment_scopes")
      .select("segment_id")
      .eq("user_id", user.id)
      .eq("status", "ACTIVE")
      .returns<ScopeRow[]>(),
  ]);

  const segment = segmentResult.data;
  const canOpen = canOpenIssues(
    segment?.id ?? null,
    roleResult.data,
    scopeResult.data ?? [],
    Boolean(readPermissionResult.data),
  );
  let tasks: IssueTaskRow[] = [];
  let summaryRows: IssueSummaryRow[] = [];
  let dataError: { message: string } | null = null;

  if (canOpen) {
    const [taskResult, summaryResult] = await Promise.all([
      supabase
        .from("ttgdtx_import_issue_task_board")
        .select("*")
        .order("due_at", { ascending: true })
        .returns<IssueTaskRow[]>(),
      supabase
        .from("ttgdtx_import_issue_task_summary")
        .select("*")
        .order("issue_category", { ascending: true })
        .returns<IssueSummaryRow[]>(),
    ]);

    tasks = taskResult.data ?? [];
    summaryRows = summaryResult.data ?? [];
    dataError = taskResult.error ?? summaryResult.error;
  }

  const canResolve =
    roleResult.data === "ADMIN" ||
    roleResult.data === "BGH" ||
    Boolean(managePermissionResult.data) ||
    Boolean(closePermissionResult.data);
  const openCount = tasks.filter(
    (task) => !["RESOLVED", "CANCELLED"].includes(task.task_status),
  ).length;
  const criticalCount = tasks.filter((task) => task.severity === "CRITICAL").length;
  const overdueCount = tasks.filter((task) => task.is_overdue).length;
  const approvalCount = tasks.filter((task) => task.requires_approval).length;

  return (
    <AppShell
      active="ttgdtx"
      title="P2-07 · Phân luồng lỗi import TTGDTX"
      description="Tự phân loại lỗi P2-06: lỗi dữ liệu, hệ thống, logic, chuyên môn, pháp chế/kế toán; sau đó sinh đầu việc đúng đơn vị xử lý."
      workspaceSegmentId={segment?.id ?? null}
      workspaceReturnTo="/ttgdtx/import/issues"
      actions={
        <>
          <Button asChild variant="outline">
            <Link href="/ttgdtx/import">
              <ArrowLeft className="size-4" />
              P2-06 import
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/ttgdtx/gate">
              <ShieldAlert className="size-4" />
              P2-05 gate
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/ttgdtx/receivables">
              <Workflow className="size-4" />
              P2-03 công nợ
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/ttgdtx/import/issues">
              <RefreshCcw className="size-4" />
              Tải lại
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/search?q=P2-07">
              <FileSearch className="size-4" />
              Tìm P2-07
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/search?q=P2-08">
              <FileSearch className="size-4" />
              Tìm P2-08
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/ttgdtx/import/workload">
              <Workflow className="size-4" />
              P2-09 bảng việc
            </Link>
          </Button>
        </>
      }
    >
      {!canOpen ? (
        <section className="rounded-lg border border-rose-200 bg-rose-50 p-5 text-sm leading-6 text-rose-700">
          Tài khoản hiện tại chưa có quyền xem P2-07. Cần quyền phân luồng lỗi
          import TTGDTX hoặc được phân vào phạm vi Trung cấp 9+ liên kết TTGDTX.
        </section>
      ) : dataError ? (
        <section className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-800">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 size-5 shrink-0" />
            <div>
              <p className="font-semibold">Chưa đọc được P2-07</p>
              <p className="mt-1">
                Hãy chạy SQL step93 sau step92. Chi tiết kỹ thuật:{" "}
                {dataError.message}
              </p>
            </div>
          </div>
        </section>
      ) : (
        <div className="space-y-6">
          {errorMessage ? (
            <section className="rounded-lg border border-rose-200 bg-rose-50 p-5 text-sm leading-6 text-rose-700">
              {errorMessage}
            </section>
          ) : null}

          {updatedMessage ? (
            <section className="rounded-lg border border-emerald-200 bg-emerald-50 p-5 text-sm leading-6 text-emerald-700">
              Đã lưu xử lý P2-08 và ghi nhật ký cho phiếu lỗi.
            </section>
          ) : null}

          <section className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-900">
            <div className="flex items-start gap-3">
              <Route className="mt-0.5 size-5 shrink-0" />
              <div>
                <h2 className="font-semibold">Nguyên tắc P2-07</h2>
                <p className="mt-1">
                  Không gọi chung mọi thứ là lỗi hệ thống. Lỗi dữ liệu thì đơn vị
                  giữ file sửa; lỗi kỹ thuật thì IT/Data xử lý; lỗi logic thì owner
                  quy trình cùng IT/Data rà soát; lỗi chuyên môn thì phòng chuyên môn
                  chịu trách nhiệm; lỗi pháp chế/kế toán thì phải báo cấp có thẩm
                  quyền và có minh chứng trước khi đóng.
                </p>
              </div>
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <article className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-zinc-500">Đầu việc đang mở</p>
              <p className="mt-3 text-3xl font-semibold">{openCount}</p>
              <p className="mt-2 text-xs text-zinc-500">
                Từ lỗi/cảnh báo P2-06 chưa đóng.
              </p>
            </article>
            <article className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-zinc-500">Nghiêm trọng</p>
              <p className="mt-3 text-3xl font-semibold text-rose-700">
                {criticalCount}
              </p>
              <p className="mt-2 text-xs text-zinc-500">
                Cần ưu tiên KHTC/IT/Data/Audit.
              </p>
            </article>
            <article className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-zinc-500">Cần duyệt/kiểm</p>
              <p className="mt-3 text-3xl font-semibold text-violet-700">
                {approvalCount}
              </p>
              <p className="mt-2 text-xs text-zinc-500">
                Không tự đóng nếu thiếu minh chứng.
              </p>
            </article>
            <article className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-zinc-500">Quá hạn SLA</p>
              <p className="mt-3 text-3xl font-semibold text-orange-700">
                {overdueCount}
              </p>
              <p className="mt-2 text-xs text-zinc-500">
                Quá hạn thì tự báo tuyến quản lý.
              </p>
            </article>
          </section>

          <section className="rounded-lg border border-zinc-200 bg-white shadow-sm">
            <div className="border-b border-zinc-200 p-5">
              <h2 className="text-lg font-semibold">Nhóm lỗi theo trách nhiệm</h2>
              <p className="mt-1 text-sm text-zinc-500">
                Đây là cách hệ thống tách lỗi để không bắt một phòng xử lý nhầm việc
                của phòng khác.
              </p>
            </div>

            <div className="grid gap-4 p-5 lg:grid-cols-5">
              {summaryRows.length === 0 ? (
                <p className="text-sm text-zinc-500">
                  Chưa có đầu việc P2-07. Nếu P2-06 đang có lỗi, hãy chạy lại SQL
                  step93 để sinh phiếu.
                </p>
              ) : (
                summaryRows.map((row) => (
                  <article
                    key={row.issue_category}
                    className={`rounded-lg border p-4 ${categoryTone(
                      row.issue_category,
                    )}`}
                  >
                    <p className="text-sm font-medium">{row.issue_category_label}</p>
                    <p className="mt-3 text-2xl font-semibold">{row.task_count}</p>
                    <p className="mt-2 text-xs">
                      Mở: {row.open_count} · Nghiêm trọng: {row.critical_count}
                    </p>
                    <p className="mt-1 text-xs">
                      Cần duyệt: {row.approval_required_count} · Quá hạn:{" "}
                      {row.overdue_count}
                    </p>
                  </article>
                ))
              )}
            </div>
          </section>

          <section className="rounded-lg border border-zinc-200 bg-white shadow-sm">
            <div className="border-b border-zinc-200 p-5">
              <h2 className="text-lg font-semibold">Phiếu lỗi / đầu việc cần xử lý</h2>
              <p className="mt-1 text-sm text-zinc-500">
                Mỗi dòng là một việc được sinh từ P2-06. Dữ liệu đúng giữ nguyên;
                chỗ nào sai thì giao đúng nơi xử lý.
              </p>
            </div>

            <div className="divide-y divide-zinc-200">
              {tasks.length === 0 ? (
                <div className="p-5 text-sm text-zinc-500">
                  Chưa có phiếu lỗi P2-07 trong phạm vi đang chọn.
                </div>
              ) : (
                tasks.map((task) => (
                  <article
                    key={task.task_id}
                    className="grid gap-5 p-5 xl:grid-cols-[1.1fr_1.2fr_1fr]"
                  >
                    <div>
                      <div className="flex flex-wrap gap-2">
                        <span
                          className={`rounded-md border px-2 py-1 text-xs font-medium ${categoryTone(
                            task.issue_category,
                          )}`}
                        >
                          {task.issue_category_label}
                        </span>
                        <span
                          className={`rounded-md border px-2 py-1 text-xs font-medium ${severityTone(
                            task.severity,
                          )}`}
                        >
                          {task.severity_label}
                        </span>
                      </div>
                      <h3 className="mt-3 text-lg font-semibold">
                        {task.issue_title}
                      </h3>
                      <p className="mt-2 text-xs text-zinc-500">{task.task_code}</p>
                      <p className="mt-3 text-sm leading-6 text-zinc-600">
                        {task.issue_explanation}
                      </p>
                    </div>

                    <div className="space-y-3 text-sm leading-6 text-zinc-600">
                      <div className="rounded-lg border border-zinc-200 p-4">
                        <div className="flex items-start gap-3">
                          <UsersRound className="mt-1 size-4 shrink-0 text-zinc-500" />
                          <div>
                            <p>
                              Nguồn lỗi:{" "}
                              <span className="font-medium">
                                {task.source_department}
                              </span>
                            </p>
                            <p>
                              Đơn vị xử lý:{" "}
                              <span className="font-medium">
                                {task.owner_department}
                              </span>
                            </p>
                            <p>
                              Báo cáo:{" "}
                              <span className="font-medium">
                                {task.report_to_department}
                              </span>
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-lg border border-zinc-200 p-4">
                        <p className="font-medium text-zinc-900">Cách xử lý chuẩn</p>
                        <p className="mt-2">{task.default_fix_action}</p>
                        <p className="mt-2 text-zinc-500">{task.escalation_rule}</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div
                        className={`rounded-lg border p-4 text-sm ${statusTone(
                          task.task_status,
                          task.is_overdue,
                        )}`}
                      >
                        <div className="flex items-start gap-3">
                          {task.task_status === "RESOLVED" ? (
                            <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
                          ) : (
                            <Clock3 className="mt-0.5 size-4 shrink-0" />
                          )}
                          <div>
                            <p className="font-medium">
                              {task.is_overdue
                                ? "Quá hạn xử lý"
                                : task.task_status_label}
                            </p>
                            <p className="mt-1">Hạn: {formatDate(task.due_at)}</p>
                            <p className="mt-1">SLA: {task.sla_hours} giờ</p>
                          </div>
                        </div>
                      </div>

                      {task.requires_approval ? (
                        <div className="rounded-lg border border-violet-200 bg-violet-50 p-4 text-sm leading-6 text-violet-700">
                          Cần người có thẩm quyền kiểm/duyệt trước khi đóng lỗi.
                        </div>
                      ) : null}

                      {task.ai_suggestion ? (
                        <div className="rounded-lg border border-zinc-200 p-4 text-sm leading-6 text-zinc-600">
                          <div className="flex gap-2">
                            <BrainCircuit className="mt-1 size-4 shrink-0 text-zinc-500" />
                            <p>{task.ai_suggestion}</p>
                          </div>
                        </div>
                      ) : null}

                      <div className="flex flex-wrap gap-2">
                        <Button asChild variant="outline">
                          <Link href="/ttgdtx/import">
                            <FileSpreadsheet className="size-4" />
                            Mở P2-06
                          </Link>
                        </Button>
                        <Button asChild variant="outline">
                          <Link href={`/search?q=${encodeURIComponent(task.issue_code)}`}>
                            <FileSearch className="size-4" />
                            Tra cứu
                          </Link>
                        </Button>
                      </div>

                      {canResolve ? (
                        <form
                          action={updateTtgdtxImportIssueTaskAction}
                          className="space-y-3 rounded-lg border border-zinc-200 bg-zinc-50 p-4"
                        >
                          <input
                            name="task_id"
                            type="hidden"
                            value={task.task_id}
                          />

                          <div>
                            <label
                              className="text-xs font-medium uppercase text-zinc-500"
                              htmlFor={`next_action_${task.task_id}`}
                            >
                              P2-08 · Thao tác xử lý
                            </label>
                            <select
                              className={fieldClass}
                              defaultValue={
                                task.task_status === "OPEN"
                                  ? "START"
                                  : task.requires_approval ||
                                      task.severity === "ERROR" ||
                                      task.severity === "CRITICAL" ||
                                      task.issue_category === "LEGAL_FINANCE"
                                    ? "REQUEST_APPROVAL"
                                    : "SUBMIT_FIX"
                              }
                              id={`next_action_${task.task_id}`}
                              name="next_action"
                            >
                              <option value="START">Bắt đầu xử lý</option>
                              <option value="SUBMIT_FIX">
                                Đã xử lý, chuyển kiểm/đóng
                              </option>
                              <option value="REQUEST_APPROVAL">
                                Chuyển chờ duyệt
                              </option>
                              <option value="APPROVE_RESOLUTION">
                                Duyệt đóng lỗi
                              </option>
                              <option value="RETURN_FIX">
                                Trả về bổ sung
                              </option>
                              <option value="ESCALATE">Báo cấp trên</option>
                              <option value="REOPEN">Mở lại phiếu</option>
                              <option value="CANCEL">Hủy phiếu</option>
                            </select>
                          </div>

                          <div>
                            <label
                              className="text-xs font-medium uppercase text-zinc-500"
                              htmlFor={`evidence_url_${task.task_id}`}
                            >
                              Link minh chứng
                            </label>
                            <input
                              className={fieldClass}
                              defaultValue={task.evidence_url ?? ""}
                              id={`evidence_url_${task.task_id}`}
                              name="evidence_url"
                              placeholder="Dán link Drive, ảnh, biên bản hoặc chứng từ"
                            />
                          </div>

                          <div>
                            <label
                              className="text-xs font-medium uppercase text-zinc-500"
                              htmlFor={`actor_note_${task.task_id}`}
                            >
                              Ghi chú xử lý
                            </label>
                            <textarea
                              className={textAreaClass}
                              id={`actor_note_${task.task_id}`}
                              name="actor_note"
                              placeholder="Ví dụ: đã sửa file thu học phí, đã đối chiếu với kế toán, chuyển kế toán trưởng duyệt..."
                              required
                            />
                          </div>

                          <div>
                            <label
                              className="text-xs font-medium uppercase text-zinc-500"
                              htmlFor={`decision_note_${task.task_id}`}
                            >
                              Ghi chú duyệt nếu có
                            </label>
                            <input
                              className={fieldClass}
                              id={`decision_note_${task.task_id}`}
                              name="decision_note"
                              placeholder="Dành cho lỗi cần duyệt/đóng"
                            />
                          </div>

                          <Button type="submit">
                            <SendHorizontal className="size-4" />
                            Lưu P2-08
                          </Button>
                        </form>
                      ) : (
                        <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm leading-6 text-zinc-500">
                          Tài khoản hiện tại chỉ được xem phiếu lỗi. Muốn xử lý/đóng
                          phiếu cần quyền P2-08.
                        </div>
                      )}
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>
        </div>
      )}
    </AppShell>
  );
}
