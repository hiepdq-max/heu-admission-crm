import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  FileCheck2,
  GitPullRequestArrow,
  RotateCcw,
  Save,
  ShieldAlert,
  SquarePlus,
} from "lucide-react";

import {
  createWorkflowRequestAction,
  updateWorkflowRequestAction,
} from "@/app/master-control/actions";
import { Button } from "@/components/ui/button";

export type WorkflowRequestRow = {
  id: string;
  request_code: string;
  request_title: string;
  approval_code: string;
  decision_name: string;
  decision_level: string;
  module_code: string;
  module_name: string | null;
  workflow_code: string | null;
  workflow_name: string | null;
  maker_role: string;
  checker_role: string | null;
  approver_role: string;
  required_evidence: string;
  blocking_rule: string;
  sla_hours: number | null;
  entity_type: string;
  entity_id: string | null;
  entity_code: string | null;
  request_note: string | null;
  evidence_url: string | null;
  maker_note: string | null;
  checker_note: string | null;
  approver_note: string | null;
  request_status: string;
  requested_by: string | null;
  requested_by_name: string | null;
  requested_by_email: string | null;
  checked_by: string | null;
  checked_by_name: string | null;
  approved_by: string | null;
  approved_by_name: string | null;
  rejected_by: string | null;
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
};

export type WorkflowRequestSummaryRow = {
  request_count: number;
  draft_count: number;
  pending_check_count: number;
  checked_count: number;
  approved_count: number;
  rejected_count: number;
  needs_fix_count: number;
  overdue_count: number;
};

export type WorkflowApprovalOptionRow = {
  approval_code: string;
  decision_name: string;
  module_code: string;
  workflow_code: string | null;
  required_evidence: string;
  blocking_rule: string;
  control_status: string;
};

type WorkflowRequestEngineProps = {
  rows: WorkflowRequestRow[];
  summary?: WorkflowRequestSummaryRow | null;
  approvalOptions: WorkflowApprovalOptionRow[];
  canCreate: boolean;
  canCheck: boolean;
  canApprove: boolean;
  loadError?: string;
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

function formatNumber(value: number | null | undefined) {
  return new Intl.NumberFormat("vi-VN").format(value ?? 0);
}

function formatDateTime(value: string | null) {
  if (!value) {
    return "Chưa có";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
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
        Không cảnh báo
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
      {canApprove ? <option value="APPROVED">Duyệt</option> : null}
      {canApprove ? <option value="REJECTED">Từ chối</option> : null}
    </select>
  );
}

export function WorkflowRequestEngine({
  rows,
  summary,
  approvalOptions,
  canCreate,
  canCheck,
  canApprove,
  loadError,
}: WorkflowRequestEngineProps) {
  if (loadError) {
    return (
      <section className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-800">
        <div className="flex items-start gap-3">
          <ShieldAlert className="mt-0.5 size-5 shrink-0" />
          <div>
            <h2 className="font-semibold">
              Chưa có Workflow Request Engine P0-08
            </h2>
            <p className="mt-1">
              Hãy chạy file{" "}
              <span className="font-mono">
                database/step47_workflow_request_engine.sql
              </span>{" "}
              trong Supabase SQL Editor rồi tải lại Master Control. Chi tiết:{" "}
              {loadError}
            </p>
          </div>
        </div>
      </section>
    );
  }

  const effectiveSummary = summary ?? {
    request_count: rows.length,
    draft_count: rows.filter((row) => row.request_status === "DRAFT").length,
    pending_check_count: rows.filter(
      (row) => row.request_status === "PENDING_CHECK",
    ).length,
    checked_count: rows.filter((row) => row.request_status === "CHECKED")
      .length,
    approved_count: rows.filter((row) => row.request_status === "APPROVED")
      .length,
    rejected_count: rows.filter((row) => row.request_status === "REJECTED")
      .length,
    needs_fix_count: rows.filter((row) => row.request_status === "NEEDS_FIX")
      .length,
    overdue_count: rows.filter((row) => row.is_overdue).length,
  };

  return (
    <section className="space-y-5">
      <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <GitPullRequestArrow className="size-5 text-zinc-600" />
              <h2 className="text-lg font-semibold">
                Workflow Request Engine P0-08
              </h2>
            </div>
            <p className="mt-2 max-w-4xl text-sm leading-6 text-zinc-500">
              Engine này biến approval gate thành phiếu xử lý thật: tạo đề
              nghị, kiểm, duyệt, từ chối hoặc trả về bổ sung. Sau này COM, bàn
              giao hồ sơ, tài chính và AI automation sẽ gọi engine này thay vì
              tự chuyển trạng thái.
            </p>
          </div>
          <span className="rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-medium text-zinc-600">
            Request thật · Có người kiểm · Có người duyệt · Có log
          </span>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <Metric
          label="Chờ kiểm"
          value={effectiveSummary.pending_check_count}
          icon={Clock3}
        />
        <Metric
          label="Đã kiểm"
          value={effectiveSummary.checked_count}
          icon={FileCheck2}
        />
        <Metric
          label="Đã duyệt"
          value={effectiveSummary.approved_count}
          icon={CheckCircle2}
        />
        <Metric
          label="Cần bổ sung"
          value={effectiveSummary.needs_fix_count}
          icon={RotateCcw}
        />
        <Metric
          label="Quá hạn"
          value={effectiveSummary.overdue_count}
          icon={AlertTriangle}
        />
      </div>

      {canCreate ? (
        <section className="rounded-lg border border-zinc-200 bg-white shadow-sm">
          <div className="border-b border-zinc-200 p-5">
            <h3 className="text-base font-semibold">Tạo request duyệt</h3>
            <p className="mt-1 text-sm text-zinc-500">
              Dùng để tạo một phiếu duyệt theo approval code có sẵn. Ví dụ:
              duyệt COM, duyệt bàn giao CTHSSV, duyệt bật AI.
            </p>
          </div>
          <form
            action={createWorkflowRequestAction}
            className="grid gap-4 p-5 lg:grid-cols-4"
          >
            <select
              name="approval_code"
              className={inputClass}
              required
              defaultValue=""
            >
              <option value="">Chọn điểm duyệt</option>
              {approvalOptions.map((approval) => (
                <option
                  key={approval.approval_code}
                  value={approval.approval_code}
                >
                  {approval.approval_code} - {approval.decision_name}
                </option>
              ))}
            </select>
            <input
              name="request_title"
              className={inputClass}
              placeholder="Tiêu đề request"
              required
            />
            <input
              name="entity_type"
              className={inputClass}
              placeholder="LEAD / COM_BATCH / HOU"
              required
            />
            <input
              name="entity_code"
              className={inputClass}
              placeholder="Mã hồ sơ/lead/kỳ"
            />
            <input
              name="entity_id"
              className={inputClass}
              placeholder="UUID nếu có"
            />
            <input
              name="evidence_url"
              className={inputClass}
              placeholder="Link minh chứng"
            />
            <input name="due_at" type="datetime-local" className={inputClass} />
            <select
              name="request_status"
              className={inputClass}
              defaultValue="PENDING_CHECK"
            >
              <option value="PENDING_CHECK">Gửi kiểm ngay</option>
              <option value="DRAFT">Lưu nháp</option>
            </select>
            <textarea
              name="request_note"
              className={`${textareaClass} lg:col-span-2`}
              placeholder="Nội dung đề nghị"
            />
            <textarea
              name="maker_note"
              className={`${textareaClass} lg:col-span-2`}
              placeholder="Ghi chú của người tạo"
            />
            <div className="lg:col-span-4">
              <Button type="submit">
                <SquarePlus className="size-4" />
                Tạo request
              </Button>
            </div>
          </form>
        </section>
      ) : null}

      <section className="rounded-lg border border-zinc-200 bg-white shadow-sm">
        <div className="border-b border-zinc-200 p-5">
          <h3 className="text-base font-semibold">Request đang xử lý</h3>
          <p className="mt-1 text-sm text-zinc-500">
            Mỗi request phải đi theo trạng thái: Chờ kiểm → Đã kiểm → Đã duyệt
            hoặc bị trả về/từ chối. Mọi cập nhật đều có audit log.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1260px] text-sm">
            <thead className="bg-zinc-50 text-left text-xs font-medium uppercase text-zinc-500">
              <tr>
                <th className="px-5 py-3">Request</th>
                <th className="px-5 py-3">Gate / nghiệp vụ</th>
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
                    className="px-5 py-8 text-center text-zinc-500"
                    colSpan={canCheck || canApprove ? 7 : 6}
                  >
                    Chưa có workflow request.
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
                          {row.due_at ? ` · hạn ${formatDateTime(row.due_at)}` : ""}
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
                          {row.module_name ?? row.module_code} ·{" "}
                          {row.workflow_name ?? row.workflow_code ?? "Chưa gắn workflow"}
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
                          Kiểm: {row.checked_by_name ?? row.checker_role ?? "Chưa kiểm"}
                        </p>
                        <p className="mt-1 text-zinc-700">
                          Duyệt:{" "}
                          {row.approved_by_name ??
                            row.rejected_by_name ??
                            row.approver_role}
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
                              action={updateWorkflowRequestAction}
                              className="grid min-w-72 gap-2"
                            >
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
                              Request đã kết thúc.
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
    </section>
  );
}
