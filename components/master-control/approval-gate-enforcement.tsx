import {
  AlertTriangle,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";

export type ApprovalGateEnforcementRow = {
  id: string;
  approval_code: string;
  module_code: string;
  module_name: string | null;
  workflow_code: string | null;
  workflow_name: string | null;
  decision_name: string;
  decision_level: string;
  maker_role: string;
  checker_role: string | null;
  approver_role: string;
  required_evidence: string;
  blocking_rule: string;
  sla_hours: number | null;
  control_status: string;
  gate_code: string | null;
  gate_status: string | null;
  decided_by: string | null;
  decided_at: string | null;
  open_request_count: number;
  approved_request_count: number;
  has_checker_role: boolean;
  has_approver_role: boolean;
  has_required_evidence: boolean;
  has_blocking_rule: boolean;
  has_audit_rule: boolean;
  has_decision_gate: boolean;
  has_approved_gate: boolean;
  missing_items: string[] | null;
  enforcement_status: string;
};

export type ApprovalGateEnforcementSummaryRow = {
  approval_count: number;
  ready_count: number;
  needs_approval_count: number;
  needs_fix_count: number;
  blocked_count: number;
  open_request_count: number;
  approved_request_count: number;
};

type ApprovalGateEnforcementProps = {
  rows: ApprovalGateEnforcementRow[];
  summary?: ApprovalGateEnforcementSummaryRow | null;
  loadError?: string;
};

const statusLabels: Record<string, string> = {
  READY: "Sẵn sàng",
  NEEDS_APPROVAL: "Chờ duyệt gate",
  NEEDS_FIX: "Cần sửa",
  BLOCKED: "Đang bị chặn",
};

const statusTones: Record<string, string> = {
  READY: "border-emerald-200 bg-emerald-50 text-emerald-700",
  NEEDS_APPROVAL: "border-sky-200 bg-sky-50 text-sky-700",
  NEEDS_FIX: "border-amber-200 bg-amber-50 text-amber-800",
  BLOCKED: "border-rose-200 bg-rose-50 text-rose-700",
};

const missingItemLabels: Record<string, string> = {
  MISSING_CHECKER_ROLE: "Thiếu người kiểm",
  MISSING_APPROVER_ROLE: "Thiếu người duyệt",
  MISSING_REQUIRED_EVIDENCE: "Thiếu minh chứng bắt buộc",
  MISSING_BLOCKING_RULE: "Thiếu quy tắc chặn",
  MISSING_AUDIT_RULE: "Thiếu log/audit",
  MISSING_DECISION_GATE: "Thiếu decision gate",
  GATE_NOT_APPROVED: "Gate chưa được duyệt",
  APPROVAL_RULE_NOT_READY: "Quy tắc chưa đủ điều kiện",
};

function formatNumber(value: number | null | undefined) {
  return new Intl.NumberFormat("vi-VN").format(value ?? 0);
}

function Metric({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: typeof ShieldCheck;
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

function MissingItems({ items }: { items: string[] | null }) {
  if (!items || items.length === 0) {
    return (
      <span className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
        Đủ điều kiện
      </span>
    );
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <span
          key={item}
          className="rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-medium text-amber-800"
        >
          {missingItemLabels[item] ?? item}
        </span>
      ))}
    </div>
  );
}

export function ApprovalGateEnforcement({
  rows,
  summary,
  loadError,
}: ApprovalGateEnforcementProps) {
  if (loadError) {
    return (
      <section className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-800">
        <div className="flex items-start gap-3">
          <ShieldAlert className="mt-0.5 size-5 shrink-0" />
          <div>
            <h2 className="font-semibold">
              Chưa có Approval Gate Enforcement P0-07
            </h2>
            <p className="mt-1">
              Hãy chạy file{" "}
              <span className="font-mono">
                database/step46_approval_gate_enforcement.sql
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
    approval_count: rows.length,
    ready_count: rows.filter((row) => row.enforcement_status === "READY")
      .length,
    needs_approval_count: rows.filter(
      (row) => row.enforcement_status === "NEEDS_APPROVAL",
    ).length,
    needs_fix_count: rows.filter(
      (row) => row.enforcement_status === "NEEDS_FIX",
    ).length,
    blocked_count: rows.filter((row) => row.enforcement_status === "BLOCKED")
      .length,
    open_request_count: rows.reduce(
      (total, row) => total + row.open_request_count,
      0,
    ),
    approved_request_count: rows.reduce(
      (total, row) => total + row.approved_request_count,
      0,
    ),
  };

  return (
    <section className="space-y-5">
      <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <ClipboardCheck className="size-5 text-zinc-600" />
              <h2 className="text-lg font-semibold">
                Approval Gate Enforcement P0-07
              </h2>
            </div>
            <p className="mt-2 max-w-4xl text-sm leading-6 text-zinc-500">
              Kiểm tra từng điểm duyệt quan trọng: ai tạo, ai kiểm, ai duyệt,
              cần minh chứng gì, rule nào phải chặn và đã có gate phê duyệt
              hay chưa. Đây là lớp bảo vệ trước khi mở workflow, tài chính hoặc
              AI automation chạy thật.
            </p>
          </div>
          <span className="rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-medium text-zinc-600">
            Đúng quy trình · Đúng người duyệt · Có minh chứng · Có log
          </span>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <Metric
          label="Sẵn sàng"
          value={effectiveSummary.ready_count}
          icon={CheckCircle2}
        />
        <Metric
          label="Chờ duyệt gate"
          value={effectiveSummary.needs_approval_count}
          icon={Clock3}
        />
        <Metric
          label="Cần sửa"
          value={effectiveSummary.needs_fix_count}
          icon={AlertTriangle}
        />
        <Metric
          label="Đang bị chặn"
          value={effectiveSummary.blocked_count}
          icon={ShieldAlert}
        />
        <Metric
          label="Request đang mở"
          value={effectiveSummary.open_request_count}
          icon={ClipboardCheck}
        />
      </div>

      <section className="rounded-lg border border-zinc-200 bg-white shadow-sm">
        <div className="border-b border-zinc-200 p-5">
          <h3 className="text-base font-semibold">Bảng kiểm điểm duyệt</h3>
          <p className="mt-1 text-sm text-zinc-500">
            Dòng nào còn “Cần sửa” hoặc “Đang bị chặn” thì chưa nên cho nghiệp
            vụ đó go-live. Dòng “Chờ duyệt gate” nghĩa là đã đủ cấu hình nhưng
            cần người có quyền duyệt gate xác nhận.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1180px] text-sm">
            <thead className="bg-zinc-50 text-left text-xs font-medium uppercase text-zinc-500">
              <tr>
                <th className="px-5 py-3">Điểm duyệt</th>
                <th className="px-5 py-3">Module / quy trình</th>
                <th className="px-5 py-3">Người xử lý</th>
                <th className="px-5 py-3">Minh chứng / rule chặn</th>
                <th className="px-5 py-3">Gate</th>
                <th className="px-5 py-3">Trạng thái</th>
                <th className="px-5 py-3">Cần xử lý</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {rows.map((row) => (
                <tr key={row.id} className="align-top">
                  <td className="px-5 py-4">
                    <p className="font-medium text-zinc-950">
                      {row.decision_name}
                    </p>
                    <p className="mt-1 font-mono text-xs text-zinc-500">
                      {row.approval_code}
                    </p>
                    <p className="mt-2 text-xs text-zinc-500">
                      Cấp duyệt: {row.decision_level}
                      {row.sla_hours ? ` · SLA ${row.sla_hours}h` : ""}
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-medium text-zinc-700">
                      {row.module_name ?? row.module_code}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">
                      {row.workflow_name ?? row.workflow_code ?? "Chưa gắn quy trình"}
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-zinc-700">Tạo: {row.maker_role}</p>
                    <p className="mt-1 text-zinc-700">
                      Kiểm: {row.checker_role ?? "Chưa gắn"}
                    </p>
                    <p className="mt-1 text-zinc-700">
                      Duyệt: {row.approver_role}
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="line-clamp-2 text-zinc-700">
                      {row.required_evidence}
                    </p>
                    <p className="mt-2 line-clamp-2 text-xs text-rose-700">
                      Chặn nếu: {row.blocking_rule}
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-mono text-xs text-zinc-600">
                      {row.gate_code ?? "Chưa có gate"}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">
                      Gate status: {row.gate_status ?? "Chưa có"}
                    </p>
                    <p className="mt-2 text-xs text-zinc-500">
                      Request mở: {formatNumber(row.open_request_count)} · Đã
                      duyệt: {formatNumber(row.approved_request_count)}
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex rounded-md border px-2 py-1 text-xs font-medium ${
                        statusTones[row.enforcement_status] ??
                        "border-zinc-200 bg-zinc-100 text-zinc-700"
                      }`}
                    >
                      {statusLabels[row.enforcement_status] ??
                        row.enforcement_status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <MissingItems items={row.missing_items} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {rows.length === 0 ? (
          <div className="border-t border-zinc-200 p-5 text-sm text-zinc-500">
            Chưa có điểm duyệt nào trong approval matrix.
          </div>
        ) : null}
      </section>
    </section>
  );
}
