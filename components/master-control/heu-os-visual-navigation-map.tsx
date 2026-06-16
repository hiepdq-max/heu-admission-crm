import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Bot,
  CalendarClock,
  CheckCircle2,
  ClipboardCheck,
  Database,
  FileCheck2,
  FileSpreadsheet,
  GraduationCap,
  History,
  LayoutDashboard,
  Megaphone,
  Route,
  Settings,
  ShieldAlert,
  ShieldCheck,
  Users,
  type LucideIcon,
} from "lucide-react";

import {
  aiGateStatusLabel,
  missingItemLabel,
  readinessStatusLabel,
} from "@/lib/heu-os-display";

export type HeuOsNavigationNodeRow = {
  id: string;
  node_code: string;
  node_name: string;
  node_group: string;
  module_code: string | null;
  href: string;
  summary: string;
  owner_department: string | null;
  primary_action: string | null;
  sort_order: number;
  is_core: boolean;
  requires_attention_rule: string | null;
  control_status: string;
  module_name: string | null;
  module_group: string | null;
  readiness_score: number | null;
  readiness_status: string | null;
  missing_items: string[] | null;
  ai_gate_status: string | null;
  attention_count: number;
  visual_status: string;
};

export type HeuOsNavigationSummaryRow = {
  node_count: number;
  ready_count: number;
  temp_ready_count: number;
  needs_fix_count: number;
  blocked_count: number;
  core_count: number;
};

type HeuOsVisualNavigationMapProps = {
  rows: HeuOsNavigationNodeRow[];
  summary: HeuOsNavigationSummaryRow | null;
  loadError?: string;
};

const groupLabels: Record<string, string> = {
  CONTROL: "Điều hành & kiểm soát",
  ADMISSION: "Tuyển sinh",
  HOU: "Liên thông HOU",
  OPERATION: "Vận hành nghiệp vụ",
  FINANCE: "Tài chính",
  REPORT_AI: "Báo cáo & AI",
  SETTINGS: "Cấu hình",
};

const groupDescriptions: Record<string, string> = {
  CONTROL: "Nơi kiểm soát hệ thống, log, quy trình và tình trạng sẵn sàng.",
  ADMISSION: "Nơi tách đối tượng tuyển sinh và xử lý lead đúng phạm vi.",
  HOU: "Nơi xử lý riêng liên thông HOU, học phí, hồ sơ và COM HOU.",
  OPERATION: "Nơi bàn giao hồ sơ, đối tác, import và vận hành thường ngày.",
  FINANCE: "Nơi kiểm soát học phí, công nợ, COM và chứng từ.",
  REPORT_AI: "Nơi xem báo cáo và dùng AI trong phạm vi được phép.",
  SETTINGS: "Nơi phân quyền, phân việc và cấu hình dữ liệu gốc.",
};

const groupOrder = [
  "CONTROL",
  "ADMISSION",
  "HOU",
  "OPERATION",
  "FINANCE",
  "REPORT_AI",
  "SETTINGS",
];

const nodeIconMap: Record<string, LucideIcon> = {
  NAV_DASHBOARD: LayoutDashboard,
  NAV_MASTER_CONTROL: FileCheck2,
  NAV_SEGMENTS: Route,
  NAV_LEADS: Users,
  NAV_PIPELINE: ClipboardCheck,
  NAV_FOLLOWUPS: CalendarClock,
  NAV_HOU: GraduationCap,
  NAV_DOCUMENTS: ShieldCheck,
  NAV_PARTNERS: Database,
  NAV_CAMPAIGNS: Megaphone,
  NAV_REPORTS: BarChart3,
  NAV_IMPORT: FileSpreadsheet,
  NAV_AUDIT: History,
  NAV_AI_ASSISTANT: Bot,
  NAV_SCOPES: ShieldCheck,
  NAV_SETTINGS: Settings,
};

const visualStatusLabels: Record<string, string> = {
  READY: "Đã sẵn sàng",
  TEMP_READY: "Đạt tạm thời",
  NEEDS_FIX: "Cần xử lý",
  BLOCKED: "Đang chặn",
};

const visualStatusTones: Record<string, string> = {
  READY: "border-emerald-200 bg-emerald-50 text-emerald-700",
  TEMP_READY: "border-blue-200 bg-blue-50 text-blue-700",
  NEEDS_FIX: "border-amber-200 bg-amber-50 text-amber-800",
  BLOCKED: "border-rose-200 bg-rose-50 text-rose-700",
};

function groupRows(rows: HeuOsNavigationNodeRow[]) {
  const grouped = new Map<string, HeuOsNavigationNodeRow[]>();

  for (const row of rows) {
    const items = grouped.get(row.node_group) ?? [];
    items.push(row);
    grouped.set(row.node_group, items);
  }

  return groupOrder
    .filter((group) => grouped.has(group))
    .map((group) => ({
      group,
      rows: grouped
        .get(group)!
        .slice()
        .sort((a, b) => a.sort_order - b.sort_order),
    }));
}

function Metric({
  label,
  value,
  tone = "bg-zinc-100 text-zinc-700",
}: {
  label: string;
  value: number;
  tone?: string;
}) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
      <p className={`inline-flex rounded-md px-2 py-1 text-xs ${tone}`}>
        {label}
      </p>
      <p className="mt-3 text-2xl font-semibold">{value}</p>
    </div>
  );
}

function NavigationNode({ row }: { row: HeuOsNavigationNodeRow }) {
  const Icon = nodeIconMap[row.node_code] ?? FileCheck2;
  const statusTone =
    visualStatusTones[row.visual_status] ?? visualStatusTones.TEMP_READY;
  const statusLabel =
    visualStatusLabels[row.visual_status] ?? visualStatusLabels.TEMP_READY;
  const missingItems = row.missing_items ?? [];

  return (
    <Link
      href={row.href}
      className="group block rounded-lg border border-zinc-200 bg-white p-4 shadow-sm transition hover:border-zinc-400 hover:bg-zinc-50"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-zinc-100 text-zinc-600">
            <Icon className="size-5" />
          </div>
          <div>
            <p className="font-semibold text-zinc-950">{row.node_name}</p>
            <p className="mt-1 text-xs text-zinc-500">
              {row.module_code ?? "Không gắn module"}
            </p>
          </div>
        </div>
        <ArrowRight className="size-4 shrink-0 text-zinc-400 transition group-hover:translate-x-0.5 group-hover:text-zinc-800" />
      </div>

      <p className="mt-3 text-sm leading-6 text-zinc-600">{row.summary}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        <span className={`rounded-md border px-2 py-1 text-xs ${statusTone}`}>
          {statusLabel}
        </span>
        {row.is_core ? (
          <span className="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1 text-xs text-zinc-600">
            Khối lõi
          </span>
        ) : null}
        {row.readiness_status ? (
          <span className="rounded-md border border-zinc-200 bg-white px-2 py-1 text-xs text-zinc-600">
            {readinessStatusLabel(row.readiness_status)}
          </span>
        ) : null}
      </div>

      <dl className="mt-4 grid gap-2 text-xs text-zinc-500 sm:grid-cols-2">
        <div>
          <dt className="font-medium text-zinc-800">Owner</dt>
          <dd>{row.owner_department ?? "Chưa gán"}</dd>
        </div>
        <div>
          <dt className="font-medium text-zinc-800">Thao tác chính</dt>
          <dd>{row.primary_action ?? "Mở module"}</dd>
        </div>
      </dl>

      {row.requires_attention_rule ? (
        <div className="mt-4 rounded-md bg-zinc-50 p-3 text-xs leading-5 text-zinc-600">
          {row.requires_attention_rule}
        </div>
      ) : null}

      {missingItems.length > 0 || row.ai_gate_status ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {row.ai_gate_status ? (
            <span className="rounded-md bg-zinc-100 px-2 py-1 text-xs text-zinc-600">
              {aiGateStatusLabel(row.ai_gate_status)}
            </span>
          ) : null}
          {missingItems.slice(0, 3).map((item) => (
            <span
              key={item}
              className="rounded-md bg-amber-50 px-2 py-1 text-xs text-amber-800"
            >
              Thiếu: {missingItemLabel(item)}
            </span>
          ))}
        </div>
      ) : null}
    </Link>
  );
}

export function HeuOsVisualNavigationMap({
  rows,
  summary,
  loadError,
}: HeuOsVisualNavigationMapProps) {
  if (loadError) {
    return (
      <section className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-800">
        <div className="flex items-start gap-3">
          <ShieldAlert className="mt-0.5 size-5 shrink-0" />
          <div>
            <h2 className="font-semibold">
              Chưa có HEU OS Visual Navigation Map P0-12
            </h2>
            <p className="mt-1">
              Hãy chạy file{" "}
              <span className="font-mono">
                database/step51_heu_os_visual_navigation_map.sql
              </span>{" "}
              trong Supabase SQL Editor rồi tải lại Master Control. Chi tiết:{" "}
              {loadError}
            </p>
          </div>
        </div>
      </section>
    );
  }

  const groupedRows = groupRows(rows);

  return (
    <section className="space-y-5">
      <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Route className="size-5 text-zinc-600" />
              <h2 className="text-lg font-semibold">
                HEU OS Visual Navigation Map P0-12
              </h2>
            </div>
            <p className="mt-2 max-w-4xl text-sm leading-6 text-zinc-500">
              Bản đồ bấm nhanh để người dùng đi đúng khu vực: chọn đúng đối
              tượng tuyển sinh, mở đúng lead của đối tượng đó, tách riêng HOU,
              TTGDTX, ngắn hạn, hồ sơ, tài chính, báo cáo và AI. Đây là lớp
              điều hướng để hệ thống dễ dùng nhưng vẫn kiểm soát chặt.
            </p>
          </div>
          <span className="rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-medium text-zinc-600">
            Đúng người · Đúng phạm vi · Đúng module
          </span>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        <Metric label="Tổng ô" value={summary?.node_count ?? rows.length} />
        <Metric
          label="Khối lõi"
          value={summary?.core_count ?? rows.filter((row) => row.is_core).length}
          tone="bg-zinc-100 text-zinc-700"
        />
        <Metric
          label="Đã sẵn sàng"
          value={summary?.ready_count ?? 0}
          tone="bg-emerald-50 text-emerald-700"
        />
        <Metric
          label="Đạt tạm thời"
          value={summary?.temp_ready_count ?? 0}
          tone="bg-blue-50 text-blue-700"
        />
        <Metric
          label="Cần xử lý"
          value={summary?.needs_fix_count ?? 0}
          tone="bg-amber-50 text-amber-800"
        />
        <Metric
          label="Đang chặn"
          value={summary?.blocked_count ?? 0}
          tone="bg-rose-50 text-rose-700"
        />
      </div>

      {rows.length === 0 ? (
        <div className="rounded-lg border border-zinc-200 bg-white p-6 text-sm text-zinc-500 shadow-sm">
          Chưa có ô điều hướng. Hãy chạy SQL P0-12 hoặc kiểm tra quyền đọc
          Master Control.
        </div>
      ) : (
        groupedRows.map(({ group, rows: groupItems }) => (
          <section key={group} className="space-y-3">
            <div className="flex flex-col gap-1">
              <h3 className="text-base font-semibold">
                {groupLabels[group] ?? group}
              </h3>
              <p className="text-sm text-zinc-500">
                {groupDescriptions[group] ?? "Nhóm điều hướng trong HEU OS."}
              </p>
            </div>
            <div className="grid gap-4 xl:grid-cols-2">
              {groupItems.map((row) => (
                <NavigationNode key={row.id} row={row} />
              ))}
            </div>
          </section>
        ))
      )}

      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-800">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 size-5 shrink-0" />
          <p>
            Cách dùng: trước tiên bấm <strong>Đối tượng tuyển sinh</strong> để
            chọn đúng mảng, sau đó vào <strong>Lead tuyển sinh</strong>. Khi đó
            danh sách lead chỉ nên hiện đúng dữ liệu của đối tượng và phạm vi
            user đang được phân.
          </p>
        </div>
      </div>
    </section>
  );
}
