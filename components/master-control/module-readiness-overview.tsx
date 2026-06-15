import Link from "next/link";
import {
  AlertTriangle,
  Bot,
  CheckCircle2,
  ClipboardCheck,
  Lock,
  ShieldAlert,
} from "lucide-react";

import {
  aiGateStatusLabel,
  aiGateStatusTone,
  missingItemLabel,
  moduleDisplay,
  readinessStatusLabel,
  readinessStatusTone,
} from "@/lib/heu-os-display";

export type HeuOsModuleReadinessRow = {
  id: string;
  module_code: string;
  module_name: string;
  module_group: string;
  owner_department: string | null;
  control_status: string;
  has_owner: boolean;
  workflow_count: number;
  approval_count: number;
  master_data_count: number;
  risk_count: number;
  sop_count: number;
  legal_count: number;
  has_workflow: boolean;
  has_approval: boolean;
  has_master_data: boolean;
  has_risk: boolean;
  has_sop: boolean;
  has_legal: boolean;
  readiness_score: number;
  readiness_status: string;
  missing_items: string[] | null;
  ai_gate_status: string;
};

type ModuleReadinessOverviewProps = {
  rows: HeuOsModuleReadinessRow[];
  loadError?: string;
};

type ModuleReadinessCardProps = {
  row: HeuOsModuleReadinessRow;
  compact?: boolean;
};

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
          <p className="text-2xl font-semibold">{value}</p>
          <p className="text-sm text-zinc-500">{label}</p>
        </div>
      </div>
    </article>
  );
}

function ScoreBar({ value }: { value: number }) {
  const safeValue = Math.max(0, Math.min(100, value));

  return (
    <div className="h-2 rounded-full bg-zinc-100">
      <div
        className="h-2 rounded-full bg-zinc-900"
        style={{ width: `${safeValue}%` }}
      />
    </div>
  );
}

export function ModuleReadinessCard({
  row,
  compact = false,
}: ModuleReadinessCardProps) {
  const display = moduleDisplay(row.module_code, {
    name: row.module_name,
    group: row.module_group,
    owner: row.owner_department,
  });
  const missingItems = row.missing_items ?? [];

  return (
    <article className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="font-mono text-xs text-zinc-500">{row.module_code}</p>
          <h3 className="mt-1 font-semibold text-zinc-950">{display.name}</h3>
          <p className="mt-1 text-xs uppercase text-zinc-500">
            {display.group} · Owner: {display.owner}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span
            className={`rounded-md border px-2 py-1 text-xs font-medium ${readinessStatusTone(
              row.readiness_status,
            )}`}
          >
            {readinessStatusLabel(row.readiness_status)}
          </span>
          <span
            className={`rounded-md border px-2 py-1 text-xs font-medium ${aiGateStatusTone(
              row.ai_gate_status,
            )}`}
          >
            {aiGateStatusLabel(row.ai_gate_status)}
          </span>
        </div>
      </div>

      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between text-xs text-zinc-500">
          <span>Điểm sẵn sàng</span>
          <span className="font-medium text-zinc-900">
            {row.readiness_score}%
          </span>
        </div>
        <ScoreBar value={row.readiness_score} />
      </div>

      <div className="mt-4 grid gap-2 text-xs sm:grid-cols-3 lg:grid-cols-6">
        <span className="rounded-md bg-zinc-50 px-2 py-2 text-zinc-600">
          SOP: {row.sop_count}
        </span>
        <span className="rounded-md bg-zinc-50 px-2 py-2 text-zinc-600">
          Pháp lý: {row.legal_count}
        </span>
        <span className="rounded-md bg-zinc-50 px-2 py-2 text-zinc-600">
          Quy trình: {row.workflow_count}
        </span>
        <span className="rounded-md bg-zinc-50 px-2 py-2 text-zinc-600">
          Duyệt: {row.approval_count}
        </span>
        <span className="rounded-md bg-zinc-50 px-2 py-2 text-zinc-600">
          Dữ liệu: {row.master_data_count}
        </span>
        <span className="rounded-md bg-zinc-50 px-2 py-2 text-zinc-600">
          Rủi ro: {row.risk_count}
        </span>
      </div>

      {missingItems.length > 0 ? (
        <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-700" />
            <div>
              <p className="text-xs font-medium text-amber-900">
                Còn thiếu trước khi production
              </p>
              <ul className="mt-2 flex flex-wrap gap-2">
                {missingItems.map((item) => (
                  <li
                    key={item}
                    className="rounded-md bg-white px-2 py-1 text-xs text-amber-800"
                  >
                    {missingItemLabel(item)}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">
          Đã đủ các điều kiện nền. Vẫn cần người có thẩm quyền duyệt trước khi
          bật production/AI.
        </div>
      )}

      {!compact ? (
        <Link
          href={`/master-control/modules/${encodeURIComponent(row.module_code)}`}
          className="mt-4 inline-flex rounded-md border border-zinc-300 bg-white px-3 py-2 text-xs font-medium text-zinc-800 hover:bg-zinc-100"
        >
          Mở chi tiết module
        </Link>
      ) : null}
    </article>
  );
}

export function ModuleReadinessOverview({
  rows,
  loadError,
}: ModuleReadinessOverviewProps) {
  if (loadError) {
    return (
      <section className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-800">
        <div className="flex items-start gap-3">
          <ShieldAlert className="mt-0.5 size-5 shrink-0" />
          <div>
            <h2 className="font-semibold">
              Chưa có Module Readiness Gate P0-04
            </h2>
            <p className="mt-1">
              Hãy chạy file{" "}
              <span className="font-mono">
                database/step43_module_readiness_gate.sql
              </span>{" "}
              trong Supabase SQL Editor rồi tải lại Master Control. Chi tiết:{" "}
              {loadError}
            </p>
          </div>
        </div>
      </section>
    );
  }

  const readyCount = rows.filter(
    (row) => row.readiness_status === "READY",
  ).length;
  const temporaryCount = rows.filter(
    (row) => row.readiness_status === "READY_TEMP",
  ).length;
  const blockedCount = rows.filter(
    (row) => row.readiness_status === "BLOCKED",
  ).length;
  const aiLockedCount = rows.filter(
    (row) => row.ai_gate_status === "AI_LOCKED",
  ).length;

  return (
    <section className="space-y-5">
      <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <ClipboardCheck className="size-5 text-zinc-600" />
              <h2 className="text-lg font-semibold">
                Module Readiness Gate P0-04
              </h2>
            </div>
            <p className="mt-2 max-w-4xl text-sm leading-6 text-zinc-500">
              Cổng này tự kiểm tra từng module đã đủ owner, SOP, căn cứ pháp
              lý, dữ liệu gốc, quy trình, ma trận duyệt và rủi ro kiểm soát
              trước khi đưa vào production hoặc bật AI/automation.
            </p>
          </div>
          <span className="rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-medium text-zinc-600">
            Thiếu điều kiện nào · Chỉ đúng chỗ đó · Không bắt nhập lại phần đúng
          </span>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Đạt production" value={readyCount} icon={CheckCircle2} />
        <Metric label="Đủ khung, chờ duyệt" value={temporaryCount} icon={Bot} />
        <Metric label="Đang bị chặn" value={blockedCount} icon={ShieldAlert} />
        <Metric label="AI đang khóa" value={aiLockedCount} icon={Lock} />
      </div>

      <section className="rounded-lg border border-zinc-200 bg-white shadow-sm">
        <div className="border-b border-zinc-200 p-5">
          <h3 className="text-base font-semibold">
            Tình trạng sẵn sàng theo module
          </h3>
          <p className="mt-1 text-sm text-zinc-500">
            Đây là danh sách kiểm soát trước khi mở rộng hệ thống. Module nào
            còn thiếu sẽ hiện đúng mục cần bổ sung.
          </p>
        </div>
        <div className="grid gap-4 p-5 xl:grid-cols-2">
          {rows.length === 0 ? (
            <p className="text-sm text-zinc-500">
              Chưa có module nào để kiểm tra.
            </p>
          ) : (
            rows.map((row) => <ModuleReadinessCard key={row.id} row={row} />)
          )}
        </div>
      </section>
    </section>
  );
}
