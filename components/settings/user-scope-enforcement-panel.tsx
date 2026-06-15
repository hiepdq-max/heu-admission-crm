import {
  AlertTriangle,
  CheckCircle2,
  Eye,
  LockKeyhole,
  ShieldAlert,
  ShieldCheck,
  Users,
} from "lucide-react";

export type UserScopeEffectiveAccessRow = {
  user_id: string;
  email: string;
  full_name: string;
  user_status: string;
  role_code: string | null;
  role_name: string | null;
  department_id: string | null;
  department_code: string | null;
  department_name: string | null;
  manager_id: string | null;
  manager_name: string | null;
  lead_visibility: string;
  segment_scope_count: number;
  partner_scope_count: number;
  direct_report_count: number;
  assigned_lead_count: number;
  created_lead_count: number;
  permission_count: number;
  has_leads_read_all: boolean;
  has_leads_write_all: boolean;
  has_settings_manage: boolean;
  has_scope_manage_department: boolean;
  broad_lead_access: boolean;
  has_business_scope: boolean;
  risk_flags: string[] | null;
  enforcement_status: string;
  access_model: string;
};

export type UserScopeEnforcementSummaryRow = {
  user_count: number;
  ok_count: number;
  check_count: number;
  needs_fix_count: number;
  high_risk_count: number;
  broad_access_count: number;
  strict_access_count: number;
  missing_scope_count: number;
};

type UserScopeEnforcementPanelProps = {
  rows: UserScopeEffectiveAccessRow[];
  summary?: UserScopeEnforcementSummaryRow | null;
  loadError?: string;
};

const statusLabels: Record<string, string> = {
  OK: "OK",
  CHECK: "Cần kiểm tra",
  NEEDS_FIX: "Cần sửa",
  HIGH_RISK: "Rủi ro cao",
};

const statusTones: Record<string, string> = {
  OK: "border-emerald-200 bg-emerald-50 text-emerald-700",
  CHECK: "border-amber-200 bg-amber-50 text-amber-700",
  NEEDS_FIX: "border-orange-200 bg-orange-50 text-orange-700",
  HIGH_RISK: "border-rose-200 bg-rose-50 text-rose-700",
};

const accessModelLabels: Record<string, string> = {
  STRICT: "Chặt theo phạm vi",
  ROLE_ONLY: "Theo role, chưa có scope",
  FULL_CONTROL: "Toàn hệ thống",
  BROAD: "Mở rộng",
};

const leadVisibilityLabels: Record<string, string> = {
  OWN: "Lead của mình",
  TEAM: "Cấp dưới trực tiếp",
  DEPARTMENT: "Cùng phòng ban",
  ALL: "Toàn hệ thống",
};

const riskFlagLabels: Record<string, string> = {
  MISSING_DEPARTMENT: "Chưa gắn phòng ban",
  MISSING_MANAGER: "Chưa gắn quản lý trực tiếp",
  MISSING_BUSINESS_SCOPE: "Chưa phân đối tượng/đối tác",
  OVER_BROAD_NON_ADMIN: "User không phải ADMIN nhưng quyền quá rộng",
  TEAM_SCOPE_WITHOUT_SUBORDINATE: "Chọn xem cấp dưới nhưng chưa có cấp dưới",
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

function RiskFlags({ flags }: { flags: string[] | null }) {
  if (!flags || flags.length === 0) {
    return (
      <span className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
        Không có cảnh báo
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
          {riskFlagLabels[flag] ?? flag}
        </span>
      ))}
    </div>
  );
}

export function UserScopeEnforcementPanel({
  rows,
  summary,
  loadError,
}: UserScopeEnforcementPanelProps) {
  if (loadError) {
    return (
      <section className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-800">
        <div className="flex items-start gap-3">
          <ShieldAlert className="mt-0.5 size-5 shrink-0" />
          <div>
            <h2 className="font-semibold">
              Chưa có User Scope Enforcement P0-06
            </h2>
            <p className="mt-1">
              Hãy chạy file{" "}
              <span className="font-mono">
                database/step45_user_scope_enforcement.sql
              </span>{" "}
              trong Supabase SQL Editor rồi tải lại trang. Chi tiết:{" "}
              {loadError}
            </p>
          </div>
        </div>
      </section>
    );
  }

  const effectiveSummary = summary ?? {
    user_count: rows.length,
    ok_count: rows.filter((row) => row.enforcement_status === "OK").length,
    check_count: rows.filter((row) => row.enforcement_status === "CHECK").length,
    needs_fix_count: rows.filter((row) => row.enforcement_status === "NEEDS_FIX")
      .length,
    high_risk_count: rows.filter((row) => row.enforcement_status === "HIGH_RISK")
      .length,
    broad_access_count: rows.filter((row) =>
      ["BROAD", "FULL_CONTROL"].includes(row.access_model),
    ).length,
    strict_access_count: rows.filter((row) => row.access_model === "STRICT")
      .length,
    missing_scope_count: rows.filter(
      (row) =>
        row.segment_scope_count === 0 &&
        row.partner_scope_count === 0 &&
        !["ADMIN", "BGH"].includes(row.role_code ?? ""),
    ).length,
  };

  return (
    <section className="space-y-5">
      <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <LockKeyhole className="size-5 text-zinc-600" />
              <h2 className="text-lg font-semibold">
                User Scope Enforcement P0-06
              </h2>
            </div>
            <p className="mt-2 max-w-4xl text-sm leading-6 text-zinc-500">
              Kiểm tra quyền đang có hiệu lực: user thuộc phòng nào, quản lý
              trực tiếp là ai, thấy lead theo mức nào, đã được phân đối tượng
              tuyển sinh/đối tác chưa, và có rủi ro mở quá rộng hay không.
            </p>
          </div>
          <span className="rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-medium text-zinc-600">
            Đúng người · Đúng phòng · Đúng đối tượng · Đúng dữ liệu
          </span>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="User OK" value={effectiveSummary.ok_count} icon={CheckCircle2} />
        <Metric label="Cần sửa" value={effectiveSummary.needs_fix_count} icon={AlertTriangle} />
        <Metric label="Rủi ro cao" value={effectiveSummary.high_risk_count} icon={ShieldAlert} />
        <Metric label="Chặt theo scope" value={effectiveSummary.strict_access_count} icon={LockKeyhole} />
      </div>

      <section className="rounded-lg border border-zinc-200 bg-white shadow-sm">
        <div className="border-b border-zinc-200 p-5">
          <div className="flex items-center gap-2">
            <Eye className="size-4 text-zinc-600" />
            <h3 className="text-base font-semibold">
              Bảng kiểm tra phạm vi hiệu lực
            </h3>
          </div>
          <p className="mt-1 text-sm text-zinc-500">
            Nếu một dòng có cảnh báo, hãy chọn user đó ở phần bên dưới và sửa
            phòng ban, quản lý trực tiếp, mức hiển thị lead hoặc phạm vi đối
            tượng/đối tác.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1120px] text-sm">
            <thead className="bg-zinc-50 text-left text-xs font-medium uppercase text-zinc-500">
              <tr>
                <th className="px-5 py-3">User</th>
                <th className="px-5 py-3">Phòng / quản lý</th>
                <th className="px-5 py-3">Mức lead</th>
                <th className="px-5 py-3">Phạm vi</th>
                <th className="px-5 py-3">Lead liên quan</th>
                <th className="px-5 py-3">Trạng thái</th>
                <th className="px-5 py-3">Cảnh báo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {rows.map((row) => (
                <tr key={row.user_id} className="align-top">
                  <td className="px-5 py-4">
                    <p className="font-medium text-zinc-950">{row.full_name}</p>
                    <p className="mt-1 text-xs text-zinc-500">{row.email}</p>
                    <p className="mt-2 rounded-md bg-zinc-100 px-2 py-1 text-xs text-zinc-600">
                      {row.role_name ?? row.role_code ?? "Chưa gắn role"}
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-medium text-zinc-700">
                      {row.department_name ?? "Chưa gắn phòng"}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">
                      Quản lý: {row.manager_name ?? "Chưa gắn"}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">
                      Cấp dưới: {formatNumber(row.direct_report_count)}
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-medium text-zinc-700">
                      {leadVisibilityLabels[row.lead_visibility] ??
                        row.lead_visibility}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">
                      {accessModelLabels[row.access_model] ?? row.access_model}
                    </p>
                    {row.broad_lead_access ? (
                      <p className="mt-2 inline-flex rounded-md bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700">
                        Quyền rộng
                      </p>
                    ) : null}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2 text-zinc-700">
                      <Users className="size-4 text-zinc-400" />
                      {formatNumber(row.segment_scope_count)} đối tượng ·{" "}
                      {formatNumber(row.partner_scope_count)} đối tác
                    </div>
                    <p className="mt-1 text-xs text-zinc-500">
                      {row.has_business_scope
                        ? "Đã có scope nghiệp vụ"
                        : "Chưa phân scope nghiệp vụ"}
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-zinc-700">
                      Đang phụ trách: {formatNumber(row.assigned_lead_count)}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">
                      Đã tạo: {formatNumber(row.created_lead_count)}
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
                    <RiskFlags flags={row.risk_flags} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {rows.length === 0 ? (
          <div className="border-t border-zinc-200 p-5 text-sm text-zinc-500">
            Chưa có user nào trong phạm vi bạn được xem.
          </div>
        ) : null}
      </section>
    </section>
  );
}
