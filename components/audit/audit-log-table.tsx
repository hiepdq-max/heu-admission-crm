import {
  Clock,
  Database,
  FileJson,
  Pencil,
  PlusCircle,
  Trash2,
  UserRound,
} from "lucide-react";

type JsonRecord = Record<string, unknown>;

export type AuditLogRow = {
  id: string;
  user_id: string | null;
  user_name: string;
  user_email: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  old_value: JsonRecord | null;
  new_value: JsonRecord | null;
  note: string | null;
  created_at: string;
};

type AuditLogTableProps = {
  logs: AuditLogRow[];
  summary: {
    total: number;
    inserts: number;
    updates: number;
    deletes: number;
    entityTypes: number;
  };
};

const actionLabels: Record<string, string> = {
  INSERT: "Tạo mới",
  UPDATE: "Cập nhật",
  DELETE: "Xóa",
};

const entityLabels: Record<string, string> = {
  leads: "Lead",
  lead_documents: "Hồ sơ lead",
  lead_followups: "Lịch chăm sóc",
  lead_activities: "Hoạt động lead",
  campaigns: "Chiến dịch",
  partners: "Đối tác",
  enrollments: "Nhập học",
  admission_payments: "Tài chính",
};

const ignoredFields = new Set([
  "updated_at",
  "created_at",
  "deleted_at",
  "student_phone_norm",
  "parent_phone_norm",
]);

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatValue(value: unknown) {
  if (value === null || value === undefined || value === "") {
    return "Trống";
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
}

function shortId(value: string | null) {
  if (!value) {
    return "Không có ID";
  }

  return value.slice(0, 8);
}

function getActionIcon(action: string) {
  if (action === "INSERT") return PlusCircle;
  if (action === "UPDATE") return Pencil;
  if (action === "DELETE") return Trash2;
  return FileJson;
}

function getActionClass(action: string) {
  if (action === "INSERT") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (action === "UPDATE") {
    return "border-sky-200 bg-sky-50 text-sky-700";
  }

  if (action === "DELETE") {
    return "border-rose-200 bg-rose-50 text-rose-700";
  }

  return "border-zinc-200 bg-zinc-50 text-zinc-700";
}

function getNameFromValue(value: JsonRecord | null) {
  if (!value) {
    return null;
  }

  const keys = [
    "lead_code",
    "student_name",
    "campaign_name",
    "partner_name",
    "activity_type",
    "document_type",
    "status",
  ];

  for (const key of keys) {
    const current = value[key];
    if (current) {
      return String(current);
    }
  }

  return null;
}

function summarizeChanges(log: AuditLogRow) {
  if (log.action === "INSERT") {
    const name = getNameFromValue(log.new_value);
    return name ? `Tạo bản ghi: ${name}` : "Tạo bản ghi mới";
  }

  if (log.action === "DELETE") {
    const name = getNameFromValue(log.old_value);
    return name ? `Xóa bản ghi: ${name}` : "Xóa bản ghi";
  }

  if (!log.old_value || !log.new_value) {
    return "Cập nhật bản ghi";
  }

  const changes = Object.keys(log.new_value)
    .filter((key) => !ignoredFields.has(key))
    .filter((key) => formatValue(log.old_value?.[key]) !== formatValue(log.new_value?.[key]))
    .slice(0, 4)
    .map(
      (key) =>
        `${key}: ${formatValue(log.old_value?.[key])} -> ${formatValue(log.new_value?.[key])}`,
    );

  if (changes.length === 0) {
    return "Cập nhật kỹ thuật, không đổi trường nghiệp vụ";
  }

  return changes.join("; ");
}

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: string;
}) {
  return (
    <article className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
      <div
        className={`mb-4 inline-flex rounded-md border px-2 py-1 text-xs font-medium ${tone}`}
      >
        {label}
      </div>
      <p className="text-3xl font-semibold">{value}</p>
    </article>
  );
}

export function AuditLogTable({ logs, summary }: AuditLogTableProps) {
  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Tổng log"
          value={summary.total}
          tone="border-zinc-200 bg-zinc-50 text-zinc-700"
        />
        <StatCard
          label="Tạo mới"
          value={summary.inserts}
          tone="border-emerald-200 bg-emerald-50 text-emerald-700"
        />
        <StatCard
          label="Cập nhật"
          value={summary.updates}
          tone="border-sky-200 bg-sky-50 text-sky-700"
        />
        <StatCard
          label="Loại dữ liệu"
          value={summary.entityTypes}
          tone="border-violet-200 bg-violet-50 text-violet-700"
        />
      </section>

      <section className="rounded-lg border border-zinc-200 bg-white shadow-sm">
        <div className="border-b border-zinc-200 p-5">
          <h2 className="text-base font-semibold">Nhật ký thao tác gần đây</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Hiển thị tối đa 100 thao tác mới nhất do trigger database ghi lại.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1120px] text-sm">
            <thead className="bg-zinc-50 text-left text-xs font-medium uppercase text-zinc-500">
              <tr>
                <th className="px-5 py-3">Thời gian</th>
                <th className="px-5 py-3">Người thao tác</th>
                <th className="px-5 py-3">Hành động</th>
                <th className="px-5 py-3">Dữ liệu</th>
                <th className="px-5 py-3">Tóm tắt thay đổi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {logs.length === 0 ? (
                <tr>
                  <td className="px-5 py-6 text-center text-zinc-500" colSpan={5}>
                    Chưa có audit log. Hãy thử tạo lead, cập nhật trạng thái hoặc
                    import CSV để database ghi log mới.
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const ActionIcon = getActionIcon(log.action);

                  return (
                    <tr key={log.id} className="align-top">
                      <td className="px-5 py-4">
                        <p className="inline-flex items-center gap-2 text-zinc-700">
                          <Clock className="size-4 text-zinc-400" />
                          {formatDateTime(log.created_at)}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="inline-flex items-center gap-2 font-medium text-zinc-900">
                          <UserRound className="size-4 text-zinc-400" />
                          {log.user_name}
                        </p>
                        <p className="mt-1 text-xs text-zinc-500">
                          {log.user_email ?? "Không có email"}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-2 rounded-md border px-2 py-1 text-xs font-medium ${getActionClass(
                            log.action,
                          )}`}
                        >
                          <ActionIcon className="size-3.5" />
                          {actionLabels[log.action] ?? log.action}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <p className="inline-flex items-center gap-2 font-medium text-zinc-900">
                          <Database className="size-4 text-zinc-400" />
                          {entityLabels[log.entity_type] ?? log.entity_type}
                        </p>
                        <p className="mt-1 font-mono text-xs text-zinc-500">
                          {shortId(log.entity_id)}
                        </p>
                      </td>
                      <td className="max-w-xl px-5 py-4 text-zinc-700">
                        {summarizeChanges(log)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
