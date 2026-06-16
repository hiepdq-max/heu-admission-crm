import {
  AlertTriangle,
  ClipboardCheck,
  Database,
  Eye,
  GitBranch,
  ShieldCheck,
  UsersRound,
} from "lucide-react";

export type ProcessOwnershipRow = {
  id: string;
  ownership_code: string;
  process_name: string;
  module_code: string;
  module_name: string | null;
  workflow_code: string | null;
  workflow_name: string | null;
  entity_type: string;
  source_table: string;
  owner_department: string;
  maker_role: string;
  checker_role: string | null;
  approver_role: string | null;
  viewer_scope: string;
  handover_from_department: string | null;
  handover_to_department: string | null;
  required_evidence: string | null;
  audit_rule: string;
  sla_hours: number | null;
  risk_level: string;
  control_status: string;
  control_flags: string[] | null;
  ownership_status: string;
};

export type ProcessOwnershipSummaryRow = {
  process_count: number;
  ready_count: number;
  temp_ready_count: number;
  needs_fix_count: number;
  blocked_count: number;
  high_risk_count: number;
  missing_approver_count: number;
};

type ProcessOwnershipMatrixProps = {
  rows: ProcessOwnershipRow[];
  summary?: ProcessOwnershipSummaryRow | null;
  loadError?: string;
};

const statusLabels: Record<string, string> = {
  READY: "Đã rõ trách nhiệm",
  TEMP_READY: "Tạm dùng",
  NEEDS_FIX: "Cần bổ sung",
  BLOCKED: "Bị chặn",
};

const statusTones: Record<string, string> = {
  READY: "border-emerald-200 bg-emerald-50 text-emerald-700",
  TEMP_READY: "border-sky-200 bg-sky-50 text-sky-700",
  NEEDS_FIX: "border-amber-200 bg-amber-50 text-amber-800",
  BLOCKED: "border-rose-200 bg-rose-50 text-rose-700",
};

const riskLabels: Record<string, string> = {
  LOW: "Thấp",
  MEDIUM: "Trung bình",
  HIGH: "Cao",
  CRITICAL: "Rất cao",
};

const viewerScopeLabels: Record<string, string> = {
  OWN: "Chỉ việc của mình",
  TEAM: "Theo đội",
  DEPARTMENT: "Theo phòng ban",
  ROLE_AND_SCOPE: "Theo vai trò + phạm vi",
  ALL_AUTHORIZED: "Người được cấp quyền",
  RESTRICTED: "Hạn chế",
};

const flagLabels: Record<string, string> = {
  MISSING_OWNER: "Thiếu phòng chịu trách nhiệm",
  MISSING_MAKER: "Thiếu người nhập/thực hiện",
  MISSING_CHECKER: "Thiếu người kiểm",
  HIGH_RISK_MISSING_APPROVER: "Rủi ro cao nhưng thiếu người duyệt",
  MISSING_VIEWER_SCOPE: "Thiếu phạm vi được xem",
  MISSING_SOURCE_TABLE: "Thiếu bảng dữ liệu gốc",
  MISSING_EVIDENCE_RULE: "Thiếu quy tắc minh chứng",
  MISSING_AUDIT_RULE: "Thiếu quy tắc log",
  MISSING_HANDOVER_TARGET: "Thiếu nơi nhận bàn giao",
  CONTROL_NOT_READY: "Kiểm soát chưa đạt",
};

function formatNumber(value: number | null | undefined) {
  return new Intl.NumberFormat("vi-VN").format(value ?? 0);
}

function statusTone(value: string) {
  return statusTones[value] ?? "border-zinc-200 bg-zinc-50 text-zinc-700";
}

function Metric({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: typeof ClipboardCheck;
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

function Flags({ flags }: { flags: string[] | null }) {
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

export function ProcessOwnershipMatrix({
  rows,
  summary,
  loadError,
}: ProcessOwnershipMatrixProps) {
  if (loadError) {
    return (
      <section className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-800">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 size-5 shrink-0" />
          <div>
            <h2 className="font-semibold">
              Chưa có Data & Process Ownership Matrix P0-16
            </h2>
            <p className="mt-1">
              Hãy chạy file{" "}
              <span className="font-mono">
                database/step55_process_ownership_matrix.sql
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
    process_count: rows.length,
    ready_count: rows.filter((row) => row.ownership_status === "READY").length,
    temp_ready_count: rows.filter((row) => row.ownership_status === "TEMP_READY")
      .length,
    needs_fix_count: rows.filter((row) => row.ownership_status === "NEEDS_FIX")
      .length,
    blocked_count: rows.filter((row) => row.ownership_status === "BLOCKED")
      .length,
    high_risk_count: rows.filter((row) =>
      ["HIGH", "CRITICAL"].includes(row.risk_level),
    ).length,
    missing_approver_count: rows.filter((row) => !row.approver_role).length,
  };

  return (
    <section className="space-y-5">
      <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <ClipboardCheck className="size-5 text-zinc-600" />
              <h2 className="text-lg font-semibold">
                Data & Process Ownership Matrix P0-16
              </h2>
            </div>
            <p className="mt-2 max-w-4xl text-sm leading-6 text-zinc-500">
              Bảng này trả lời câu hỏi vận hành quan trọng nhất: việc nào ai
              nhập, ai kiểm, ai duyệt, ai được xem, dữ liệu gốc nằm ở bảng nào,
              cần minh chứng gì và bàn giao sang phòng nào. Đây là lớp chống phụ
              thuộc trí nhớ cá nhân trước khi mở rộng ERP/AI OS.
            </p>
          </div>
          <span className="rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-medium text-zinc-600">
            Đúng người làm · Đúng người kiểm · Đúng người duyệt · Có log
          </span>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <Metric
          label="Quy trình đã khai báo"
          value={effectiveSummary.process_count}
          icon={GitBranch}
        />
        <Metric
          label="Đã rõ trách nhiệm"
          value={effectiveSummary.ready_count}
          icon={ShieldCheck}
        />
        <Metric
          label="Cần bổ sung"
          value={effectiveSummary.needs_fix_count}
          icon={AlertTriangle}
        />
        <Metric
          label="Bị chặn"
          value={effectiveSummary.blocked_count}
          icon={ShieldCheck}
        />
        <Metric
          label="Rủi ro cao"
          value={effectiveSummary.high_risk_count}
          icon={AlertTriangle}
        />
      </div>

      <section className="rounded-lg border border-zinc-200 bg-white shadow-sm">
        <div className="border-b border-zinc-200 p-5">
          <h3 className="text-base font-semibold">
            Ma trận trách nhiệm theo quy trình
          </h3>
          <p className="mt-1 text-sm text-zinc-500">
            Quy trình rủi ro cao phải có người duyệt. Quy trình bàn giao phải có
            nơi giao và nơi nhận rõ ràng.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1500px] text-sm">
            <thead className="bg-zinc-50 text-left text-xs font-medium uppercase text-zinc-500">
              <tr>
                <th className="px-5 py-3">Quy trình</th>
                <th className="px-5 py-3">Dữ liệu gốc</th>
                <th className="px-5 py-3">Trách nhiệm</th>
                <th className="px-5 py-3">Phạm vi xem</th>
                <th className="px-5 py-3">Bàn giao</th>
                <th className="px-5 py-3">Minh chứng / log</th>
                <th className="px-5 py-3">Trạng thái</th>
                <th className="px-5 py-3">Cảnh báo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {rows.length === 0 ? (
                <tr>
                  <td className="px-5 py-8 text-center text-zinc-500" colSpan={8}>
                    Chưa có quy trình nào trong ma trận trách nhiệm.
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.id} className="align-top">
                    <td className="px-5 py-4">
                      <p className="font-mono text-xs text-zinc-500">
                        {row.ownership_code}
                      </p>
                      <p className="mt-1 font-medium text-zinc-950">
                        {row.process_name}
                      </p>
                      <p className="mt-2 text-xs text-zinc-500">
                        {row.module_code} · {row.module_name ?? "Chưa rõ module"}
                      </p>
                      <p className="mt-1 text-xs text-zinc-500">
                        Workflow: {row.workflow_code ?? "Chưa gắn"}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 text-zinc-700">
                        <Database className="size-4 text-zinc-400" />
                        <span className="font-mono text-xs">{row.source_table}</span>
                      </div>
                      <p className="mt-2 text-xs text-zinc-500">
                        Đối tượng: {row.entity_type}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <div className="space-y-1 text-xs leading-5 text-zinc-600">
                        <p>
                          <span className="font-medium text-zinc-900">Owner:</span>{" "}
                          {row.owner_department}
                        </p>
                        <p>
                          <span className="font-medium text-zinc-900">Nhập/làm:</span>{" "}
                          {row.maker_role}
                        </p>
                        <p>
                          <span className="font-medium text-zinc-900">Kiểm:</span>{" "}
                          {row.checker_role ?? "Chưa rõ"}
                        </p>
                        <p>
                          <span className="font-medium text-zinc-900">Duyệt:</span>{" "}
                          {row.approver_role ?? "Chưa rõ"}
                        </p>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 text-xs text-zinc-600">
                        <Eye className="size-4 text-zinc-400" />
                        <span>
                          {viewerScopeLabels[row.viewer_scope] ?? row.viewer_scope}
                        </span>
                      </div>
                      <p className="mt-2 text-xs text-zinc-500">
                        SLA:{" "}
                        {row.sla_hours
                          ? `${formatNumber(row.sla_hours)} giờ`
                          : "Chưa đặt"}
                      </p>
                      <p className="mt-1 text-xs text-zinc-500">
                        Rủi ro: {riskLabels[row.risk_level] ?? row.risk_level}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-start gap-2 text-xs leading-5 text-zinc-600">
                        <UsersRound className="mt-0.5 size-4 shrink-0 text-zinc-400" />
                        <div>
                          <p>Giao: {row.handover_from_department ?? "Không ghi"}</p>
                          <p>Nhận: {row.handover_to_department ?? "Không ghi"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <p className="line-clamp-3 text-xs leading-5 text-zinc-600">
                        {row.required_evidence ?? "Chưa ghi quy tắc minh chứng"}
                      </p>
                      <p className="mt-2 line-clamp-3 text-xs leading-5 text-zinc-500">
                        Log: {row.audit_rule}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-md border px-2 py-1 text-xs font-medium ${statusTone(
                          row.ownership_status,
                        )}`}
                      >
                        {statusLabels[row.ownership_status] ?? row.ownership_status}
                      </span>
                      <p className="mt-2 text-xs text-zinc-500">
                        Control: {row.control_status}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <Flags flags={row.control_flags} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}
