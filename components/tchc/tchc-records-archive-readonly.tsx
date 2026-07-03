import {
  AlertTriangle,
  Archive,
  ClipboardList,
  FileStack,
  LockKeyhole,
  Route,
  ShieldCheck,
} from "lucide-react";

export type TchcRecordsArchiveDashboardRow = {
  dashboard_code: string;
  dashboard_name: string;
  item_count: number;
  open_count: number;
  blocked_count: number;
  overdue_count: number;
  archive_ready_count: number;
  last_activity_at: string | null;
  readiness_state: string;
};

type TchcRecordsArchiveReadonlyProps = {
  rows: TchcRecordsArchiveDashboardRow[];
  loadError?: string;
};

const blueprintRows: TchcRecordsArchiveDashboardRow[] = [
  {
    dashboard_code: "DOCUMENT_FLOW",
    dashboard_name: "So van ban den/di",
    item_count: 0,
    open_count: 0,
    blocked_count: 0,
    overdue_count: 0,
    archive_ready_count: 0,
    last_activity_at: null,
    readiness_state: "NO_DATA",
  },
  {
    dashboard_code: "ARCHIVE_STATUS",
    dashboard_name: "Ho so luu tru",
    item_count: 0,
    open_count: 0,
    blocked_count: 0,
    overdue_count: 0,
    archive_ready_count: 0,
    last_activity_at: null,
    readiness_state: "NO_DATA",
  },
  {
    dashboard_code: "HANDOVER_QUEUE",
    dashboard_name: "Ban giao/xu ly ho so",
    item_count: 0,
    open_count: 0,
    blocked_count: 0,
    overdue_count: 0,
    archive_ready_count: 0,
    last_activity_at: null,
    readiness_state: "NO_DATA",
  },
];

const stopRules = [
  "Khong luu raw Drive link, file goc, CCCD, OTP, password hoac noi dung van ban nhay cam trong app/chat/repo.",
  "Khong huy, di chuyen, xoa ho so neu chua co SOP va legal signoff.",
  "Khong coi cockpit nay la so van thu chinh thuc khi control_status con DRAFT_CONTROL.",
  "Khong dung PASS_LOCAL thay cho PHAP_CHE approval, UAT, owner GO hoac production GO.",
];

const fieldGroups = [
  {
    code: "DOCUMENT_REGISTER",
    title: "So van ban den/di",
    icon: FileStack,
    fields:
      "document_code, direction, document_number_safe, title_safe, issuing_unit_safe, due_date, document_status, evidence_ref_code",
  },
  {
    code: "ARCHIVE_REGISTER",
    title: "Ho so luu tru",
    icon: Archive,
    fields:
      "archive_code, archive_domain, shelf_code, box_code, folder_code, retention_rule_code, retention_until, digitization_status",
  },
  {
    code: "HANDOVER_REGISTER",
    title: "Ban giao/xu ly",
    icon: Route,
    fields:
      "handover_code, item_type, source_item_code, from_position_code, to_department_code, due_date, handover_status",
  },
];

function formatNumber(value: number) {
  return new Intl.NumberFormat("vi-VN").format(value);
}

function readinessClass(state: string) {
  if (state === "READY") {
    return "border-emerald-200 bg-emerald-50 text-emerald-800";
  }

  if (state === "DRAFT_CONTROL") {
    return "border-amber-200 bg-amber-50 text-amber-800";
  }

  return "border-zinc-200 bg-zinc-50 text-zinc-700";
}

function StatCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: number;
  detail: string;
}) {
  return (
    <article className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-medium uppercase text-zinc-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-zinc-950">
        {formatNumber(value)}
      </p>
      <p className="mt-1 text-sm leading-6 text-zinc-600">{detail}</p>
    </article>
  );
}

export function TchcRecordsArchiveReadonly({
  rows,
  loadError,
}: TchcRecordsArchiveReadonlyProps) {
  const dashboardRows = rows.length > 0 ? rows : blueprintRows;
  const totalItems = rows.reduce((sum, row) => sum + row.item_count, 0);
  const totalOpen = rows.reduce((sum, row) => sum + row.open_count, 0);
  const totalBlocked = rows.reduce((sum, row) => sum + row.blocked_count, 0);
  const totalOverdue = rows.reduce((sum, row) => sum + row.overdue_count, 0);

  return (
    <div
      className="space-y-6"
      data-heu-tchc-records-archive-readonly="TCHC_RECORDS_ARCHIVE_READONLY"
      data-heu-tchc-records-archive-boundary="DRAFT_CONTROL READ_ONLY NO_RAW_FILE NO_DELETE NO_MOVE NO_APPROVAL NO_PRODUCTION_GO"
      data-heu-tchc-records-archive-objects="heu_tchc_document_register heu_tchc_archive_register heu_tchc_archive_handover_register heu_tchc_records_archive_dashboard"
    >
      <section className="rounded-lg border border-zinc-200 bg-white shadow-sm">
        <div className="border-b border-zinc-100 p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-2 rounded-md border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                <Archive className="h-4 w-4" aria-hidden="true" />
                TCHC Records Archive
              </div>
              <h2 className="mt-3 text-xl font-semibold text-zinc-950">
                Van thu luu tru cockpit
              </h2>
              <p className="mt-2 max-w-4xl text-sm leading-6 text-zinc-600">
                Read-only cockpit de TCHC, PHAP_CHE, BGH va Audit nhin nhanh so
                van ban den/di, ho so luu tru, ban giao xu ly, han qua han va
                trang thai so hoa. He thong chi hien metadata an toan.
              </p>
            </div>
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-900">
              <div className="flex items-start gap-2">
                <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <span>
                  Production NO-GO. Chua co nut tao/sua/xoa/di chuyen ho so,
                  chua phe duyet va chua chap nhan file goc.
                </span>
              </div>
            </div>
          </div>
        </div>

        {loadError ? (
          <div className="border-b border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            Cannot load records/archive data. Check whether
            `step118_tchc_records_archive_system.sql` has been applied.
          </div>
        ) : null}

        <div className="grid gap-4 p-6 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Tong metadata"
            value={totalItems}
            detail="Tong so dong an toan dang ghi nhan trong cockpit."
          />
          <StatCard
            label="Dang mo"
            value={totalOpen}
            detail="Viec chua dong, chua luu tru xong hoac dang so hoa."
          />
          <StatCard
            label="Qua han"
            value={totalOverdue}
            detail="Can TCHC ra soat han xu ly/thoi han bao quan."
          />
          <StatCard
            label="Bi chan"
            value={totalBlocked}
            detail="Can PHAP_CHE/TCHC/Audit xu ly gate truoc."
          />
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {fieldGroups.map((group) => {
          const Icon = group.icon;

          return (
            <article key={group.code} className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-semibold text-zinc-950">
                <Icon className="h-4 w-4 text-zinc-500" aria-hidden="true" />
                {group.title}
              </div>
              <p className="mt-2 text-xs font-medium uppercase text-zinc-500">
                {group.code}
              </p>
              <p className="mt-3 text-sm leading-6 text-zinc-600">
                {group.fields}
              </p>
            </article>
          );
        })}
      </section>

      <section className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm">
        <div className="border-b border-zinc-100 p-5">
          <h3 className="flex items-center gap-2 text-base font-semibold text-zinc-950">
            <ClipboardList className="h-4 w-4 text-zinc-500" aria-hidden="true" />
            Dashboard status
          </h3>
          <p className="mt-1 text-sm leading-6 text-zinc-600">
            Data source: `heu_tchc_records_archive_dashboard`. Neu chua co du
            lieu that, bang se hien blueprint 3 luong can mo.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] text-sm">
            <thead className="bg-zinc-50 text-left text-xs font-medium uppercase text-zinc-500">
              <tr>
                <th className="px-4 py-3">Luong</th>
                <th className="px-4 py-3">Tong</th>
                <th className="px-4 py-3">Dang mo</th>
                <th className="px-4 py-3">Qua han</th>
                <th className="px-4 py-3">Bi chan</th>
                <th className="px-4 py-3">Da san sang luu tru/so hoa</th>
                <th className="px-4 py-3">Trang thai</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {dashboardRows.map((row) => (
                <tr key={row.dashboard_code} className="align-top">
                  <td className="px-4 py-4">
                    <div className="font-semibold text-zinc-950">
                      {row.dashboard_name}
                    </div>
                    <div className="mt-1 text-xs text-zinc-500">
                      {row.dashboard_code}
                    </div>
                  </td>
                  <td className="px-4 py-4">{formatNumber(row.item_count)}</td>
                  <td className="px-4 py-4">{formatNumber(row.open_count)}</td>
                  <td className="px-4 py-4">{formatNumber(row.overdue_count)}</td>
                  <td className="px-4 py-4">{formatNumber(row.blocked_count)}</td>
                  <td className="px-4 py-4">
                    {formatNumber(row.archive_ready_count)}
                  </td>
                  <td className="px-4 py-4">
                    <span className={`rounded-md border px-2.5 py-1 text-xs font-semibold ${readinessClass(row.readiness_state)}`}>
                      {row.readiness_state}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-lg border border-red-200 bg-red-50 p-5 text-sm text-red-900">
        <h3 className="flex items-center gap-2 font-semibold">
          <AlertTriangle className="h-4 w-4" aria-hidden="true" />
          Stop rules
        </h3>
        <div className="mt-3 grid gap-2 md:grid-cols-2">
          {stopRules.map((rule) => (
            <div key={rule} className="flex gap-2">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{rule}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
