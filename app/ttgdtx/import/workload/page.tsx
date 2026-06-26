import Link from "next/link";
import { redirect } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  Building2,
  CheckCircle2,
  Clock3,
  FileSearch,
  RefreshCcw,
  Route,
  ShieldAlert,
  Workflow,
} from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { firstParam } from "@/lib/workspace";

type WorkloadPageProps = {
  searchParams?: Promise<{
    department?: string | string[];
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

type DepartmentSummaryRow = {
  department_code: string;
  department_label: string;
  task_count: number;
  open_count: number;
  waiting_owner_count: number;
  in_progress_count: number;
  waiting_approval_count: number;
  overdue_count: number;
  critical_count: number;
  top_priority_score: number | null;
  nearest_due_at: string | null;
};

type DepartmentTaskRow = {
  department_code: string;
  department_label: string;
  task_id: string;
  task_code: string;
  issue_code: string;
  issue_title: string;
  issue_category: string;
  issue_category_label: string;
  severity: string;
  severity_label: string;
  task_status: string;
  task_status_label: string;
  work_status_group: string;
  source_department: string;
  owner_department: string;
  report_to_department: string;
  requires_approval: boolean;
  sla_hours: number;
  due_at: string;
  is_overdue: boolean;
  default_fix_action: string;
  escalation_rule: string;
  check_message: string | null;
  fix_hint: string | null;
  resolution_note: string | null;
  evidence_url: string | null;
  batch_code: string;
  batch_name: string;
  segment_name: string;
  latest_event_type_label: string | null;
  latest_actor_note: string | null;
  latest_event_by: string | null;
  latest_event_at: string | null;
  next_work_hint: string;
  priority_score: number;
  updated_at: string;
};

function formatDateTime(value: string | null | undefined) {
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

function canOpenWorkload(
  segmentId: string | null,
  roleCode: string | null,
  scopes: ScopeRow[],
  hasWorkloadRead: boolean,
  hasIssueRead: boolean,
) {
  if (roleCode === "ADMIN" || roleCode === "BGH") {
    return true;
  }

  if (!segmentId || (!hasWorkloadRead && !hasIssueRead)) {
    return false;
  }

  return scopes.some((scope) => scope.segment_id === segmentId);
}

function workTone(row: Pick<DepartmentTaskRow, "work_status_group" | "severity">) {
  if (row.work_status_group === "OVERDUE" || row.severity === "CRITICAL") {
    return "border-rose-200 bg-rose-50 text-rose-700";
  }

  if (row.work_status_group === "WAITING_APPROVAL") {
    return "border-violet-200 bg-violet-50 text-violet-700";
  }

  if (row.work_status_group === "IN_PROGRESS") {
    return "border-sky-200 bg-sky-50 text-sky-700";
  }

  if (row.work_status_group === "CLOSED") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  return "border-amber-200 bg-amber-50 text-amber-800";
}

function categoryTone(category: string) {
  switch (category) {
    case "LEGAL_FINANCE":
      return "border-rose-200 bg-rose-50 text-rose-700";
    case "SYSTEM_TECH":
      return "border-sky-200 bg-sky-50 text-sky-700";
    case "PROCESS_LOGIC":
      return "border-violet-200 bg-violet-50 text-violet-700";
    case "PROFESSIONAL":
      return "border-amber-200 bg-amber-50 text-amber-800";
    default:
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }
}

export default async function TtgdtxDepartmentWorkloadPage({
  searchParams,
}: WorkloadPageProps) {
  const params = await searchParams;
  const selectedDepartment = firstParam(params?.department);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [
    roleResult,
    workloadPermissionResult,
    issuePermissionResult,
    segmentResult,
    scopeResult,
  ] = await Promise.all([
    supabase.rpc("current_user_role_code"),
    supabase.rpc("has_permission", {
      permission_name: "ttgdtx.department.task.read",
    }),
    supabase.rpc("has_permission", {
      permission_name: "ttgdtx.import.issue.read",
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
  const canOpen = canOpenWorkload(
    segment?.id ?? null,
    roleResult.data,
    scopeResult.data ?? [],
    Boolean(workloadPermissionResult.data),
    Boolean(issuePermissionResult.data),
  );
  let dataError: { message: string } | null = null;
  let summaries: DepartmentSummaryRow[] = [];
  let allTasks: DepartmentTaskRow[] = [];

  if (canOpen) {
    const [summaryResult, taskResult] = await Promise.all([
      supabase
        .from("ttgdtx_department_issue_workload_summary")
        .select("*")
        .order("open_count", { ascending: false })
        .returns<DepartmentSummaryRow[]>(),
      supabase
        .from("ttgdtx_department_issue_workload")
        .select("*")
        .order("priority_score", { ascending: false })
        .order("due_at", { ascending: true })
        .returns<DepartmentTaskRow[]>(),
    ]);

    dataError = summaryResult.error ?? taskResult.error;
    summaries = summaryResult.data ?? [];
    allTasks = taskResult.data ?? [];
  }

  const tasks = selectedDepartment
    ? allTasks.filter((task) => task.department_code === selectedDepartment)
    : allTasks;
  const openCount = tasks.filter(
    (task) => !["RESOLVED", "CANCELLED"].includes(task.task_status),
  ).length;
  const overdueCount = tasks.filter((task) => task.is_overdue).length;
  const criticalCount = tasks.filter((task) => task.severity === "CRITICAL").length;
  const waitingApprovalCount = tasks.filter(
    (task) => task.work_status_group === "WAITING_APPROVAL",
  ).length;

  return (
    <AppShell
      active="ttgdtx"
      title="P2-09 · Bảng việc theo phòng ban"
      description="Điều phối việc xử lý lỗi TTGDTX theo KHTC, IT/Data, CTHSSV, Pháp chế, Đào tạo, Audit và BGH."
      workspaceSegmentId={segment?.id ?? null}
      workspaceReturnTo="/ttgdtx/import/workload"
      actions={
        <>
          <Button asChild variant="outline">
            <Link href="/ttgdtx/import/issues">
              <ArrowLeft className="size-4" />
              P2-07/P2-08
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/ttgdtx/import">
              <Route className="size-4" />
              P2-06 import
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/ttgdtx/import/workload">
              <RefreshCcw className="size-4" />
              Tải lại
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/search?q=P2-09">
              <FileSearch className="size-4" />
              Tìm P2-09
            </Link>
          </Button>
        </>
      }
    >
      {!canOpen ? (
        <section className="rounded-lg border border-rose-200 bg-rose-50 p-5 text-sm leading-6 text-rose-700">
          Tài khoản hiện tại chưa có quyền xem bảng việc P2-09 hoặc chưa được phân
          phạm vi Trung cấp 9+ liên kết TTGDTX.
        </section>
      ) : dataError ? (
        <section className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-800">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 size-5 shrink-0" />
            <div>
              <p className="font-semibold">Chưa đọc được P2-09</p>
              <p className="mt-1">
                Hãy chạy SQL step95 sau step94. Chi tiết kỹ thuật:{" "}
                {dataError.message}
              </p>
            </div>
          </div>
        </section>
      ) : (
        <div className="space-y-6">
          <section className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-900">
            <div className="flex items-start gap-3">
              <ShieldAlert className="mt-0.5 size-5 shrink-0" />
              <div>
                <h2 className="font-semibold">Nguyên tắc P2-09</h2>
                <p className="mt-1">
                  P2-09 chỉ là bảng điều phối. Muốn thay đổi trạng thái vẫn phải
                  mở phiếu P2-07/P2-08 để ghi chú, minh chứng và audit log. Như
                  vậy không phòng nào xử lý nhầm việc của phòng khác.
                </p>
              </div>
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <article className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-zinc-500">Việc đang mở</p>
              <p className="mt-3 text-3xl font-semibold">{openCount}</p>
              <p className="mt-2 text-xs text-zinc-500">
                Theo bộ lọc phòng ban hiện tại.
              </p>
            </article>
            <article className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-zinc-500">Quá hạn</p>
              <p className="mt-3 text-3xl font-semibold text-rose-700">
                {overdueCount}
              </p>
              <p className="mt-2 text-xs text-zinc-500">
                Cần trưởng phòng/owner xử lý trước.
              </p>
            </article>
            <article className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-zinc-500">Nghiêm trọng</p>
              <p className="mt-3 text-3xl font-semibold text-orange-700">
                {criticalCount}
              </p>
              <p className="mt-2 text-xs text-zinc-500">
                Không tự đóng nếu thiếu minh chứng.
              </p>
            </article>
            <article className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-zinc-500">Chờ duyệt</p>
              <p className="mt-3 text-3xl font-semibold text-violet-700">
                {waitingApprovalCount}
              </p>
              <p className="mt-2 text-xs text-zinc-500">
                Cần người có thẩm quyền duyệt.
              </p>
            </article>
          </section>

          <section className="rounded-lg border border-zinc-200 bg-white shadow-sm">
            <div className="border-b border-zinc-200 p-5">
              <h2 className="text-lg font-semibold">Chọn phòng ban</h2>
              <p className="mt-1 text-sm text-zinc-500">
                Bấm vào một phòng để chỉ xem việc thuộc phòng đó.
              </p>
            </div>
            <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-4">
              <Link
                className={`rounded-lg border p-4 transition hover:bg-zinc-50 ${
                  selectedDepartment ? "border-zinc-200" : "border-zinc-900"
                }`}
                href="/ttgdtx/import/workload"
              >
                <p className="text-sm font-medium">Tất cả phòng ban</p>
                <p className="mt-3 text-2xl font-semibold">{allTasks.length}</p>
                <p className="mt-2 text-xs text-zinc-500">Toàn bộ phiếu việc</p>
              </Link>

              {summaries.map((summary) => (
                <Link
                  className={`rounded-lg border p-4 transition hover:bg-zinc-50 ${
                    selectedDepartment === summary.department_code
                      ? "border-zinc-900"
                      : "border-zinc-200"
                  }`}
                  href={`/ttgdtx/import/workload?department=${encodeURIComponent(
                    summary.department_code,
                  )}`}
                  key={summary.department_code}
                >
                  <div className="flex items-start gap-3">
                    <Building2 className="mt-1 size-4 shrink-0 text-zinc-500" />
                    <div>
                      <p className="text-sm font-medium">
                        {summary.department_label}
                      </p>
                      <p className="mt-2 text-2xl font-semibold">
                        {summary.open_count}
                      </p>
                      <p className="mt-1 text-xs text-zinc-500">
                        Tổng {summary.task_count} · Quá hạn {summary.overdue_count} ·
                        Chờ duyệt {summary.waiting_approval_count}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-zinc-200 bg-white shadow-sm">
            <div className="border-b border-zinc-200 p-5">
              <h2 className="text-lg font-semibold">Danh sách việc cần xử lý</h2>
              <p className="mt-1 text-sm text-zinc-500">
                Mở phiếu P2-07/P2-08 để cập nhật trạng thái, ghi chú và minh chứng.
              </p>
            </div>

            <div className="divide-y divide-zinc-200">
              {tasks.length === 0 ? (
                <div className="p-5 text-sm text-zinc-500">
                  Chưa có việc trong bộ lọc đang chọn.
                </div>
              ) : (
                tasks.map((task) => (
                  <article
                    className="grid gap-5 p-5 xl:grid-cols-[0.8fr_1.2fr_1fr]"
                    key={`${task.department_code}-${task.task_id}`}
                  >
                    <div>
                      <span className="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1 text-xs font-medium text-zinc-600">
                        {task.department_label}
                      </span>
                      <h3 className="mt-3 text-lg font-semibold">
                        {task.issue_title}
                      </h3>
                      <p className="mt-2 text-xs text-zinc-500">{task.task_code}</p>
                      <p className="mt-3 text-sm leading-6 text-zinc-600">
                        Nguồn: {task.source_department} · Xử lý:{" "}
                        {task.owner_department} · Báo cáo:{" "}
                        {task.report_to_department}
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        <span
                          className={`rounded-md border px-2 py-1 text-xs font-medium ${categoryTone(
                            task.issue_category,
                          )}`}
                        >
                          {task.issue_category_label}
                        </span>
                        <span
                          className={`rounded-md border px-2 py-1 text-xs font-medium ${workTone(
                            task,
                          )}`}
                        >
                          {task.task_status_label}
                        </span>
                      </div>
                      <p className="text-sm leading-6 text-zinc-600">
                        {task.next_work_hint}
                      </p>
                      {task.latest_event_type_label ? (
                        <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-sm leading-6 text-zinc-600">
                          <p className="font-medium text-zinc-900">
                            Cập nhật gần nhất: {task.latest_event_type_label}
                          </p>
                          <p>{task.latest_actor_note}</p>
                          <p className="text-xs text-zinc-500">
                            {task.latest_event_by ?? "Chưa rõ người cập nhật"} ·{" "}
                            {formatDateTime(task.latest_event_at)}
                          </p>
                        </div>
                      ) : (
                        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-800">
                          Chưa có cập nhật P2-08.
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div
                        className={`rounded-lg border p-4 text-sm leading-6 ${workTone(
                          task,
                        )}`}
                      >
                        <div className="flex items-start gap-3">
                          {task.task_status === "RESOLVED" ? (
                            <CheckCircle2 className="mt-1 size-4 shrink-0" />
                          ) : (
                            <Clock3 className="mt-1 size-4 shrink-0" />
                          )}
                          <div>
                            <p className="font-medium">
                              Hạn xử lý: {formatDateTime(task.due_at)}
                            </p>
                            <p>SLA: {task.sla_hours} giờ</p>
                            <p>Ưu tiên: {task.priority_score}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Button asChild>
                          <Link href="/ttgdtx/import/issues">
                            <Workflow className="size-4" />
                            Mở P2-08
                          </Link>
                        </Button>
                        <Button asChild variant="outline">
                          <Link
                            href={`/search?q=${encodeURIComponent(
                              task.task_code,
                            )}`}
                          >
                            <FileSearch className="size-4" />
                            Tra cứu
                          </Link>
                        </Button>
                      </div>
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
