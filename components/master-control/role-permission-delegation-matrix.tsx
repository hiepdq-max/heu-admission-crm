import {
  AlertTriangle,
  KeyRound,
  LockKeyhole,
  Save,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
} from "lucide-react";

import {
  createPermissionDelegationAction,
  updatePermissionDelegationAction,
  updatePermissionRegistryAction,
} from "@/app/master-control/actions";
import { Button } from "@/components/ui/button";

export type PermissionRegistryRow = {
  id: string;
  permission_code: string;
  permission_group: string;
  permission_label: string;
  module_code: string | null;
  module_name: string | null;
  owner_department: string | null;
  risk_level: string;
  grant_scope: string;
  requires_scope: boolean;
  requires_approval: boolean;
  allow_delegation: boolean;
  max_delegation_hours: number;
  ai_allowed: boolean;
  control_note: string | null;
  control_status: string;
  role_count: number;
  user_count: number;
  active_delegation_count: number;
  control_flags: string[] | null;
  registry_status: string;
};

export type UserPermissionMatrixRow = {
  id: string;
  email: string;
  full_name: string;
  status: string;
  role_id: string | null;
  role_code: string | null;
  role_name: string | null;
  department_id: string | null;
  department_code: string | null;
  department_name: string | null;
  manager_id: string | null;
  manager_name: string | null;
  role_permission_count: number;
  high_risk_permission_count: number;
  critical_permission_count: number;
  broad_permission_count: number;
  segment_scope_count: number;
  partner_scope_count: number;
  active_delegation_count: number;
  expired_delegation_count: number;
  control_flags: string[] | null;
  permission_status: string;
};

export type PermissionDelegationRow = {
  id: string;
  delegation_code: string;
  from_user_id: string;
  from_user_name: string | null;
  from_user_email: string | null;
  from_role_code: string | null;
  to_user_id: string;
  to_user_name: string | null;
  to_user_email: string | null;
  to_role_code: string | null;
  permission_code: string;
  permission_label: string | null;
  permission_group: string | null;
  risk_level: string | null;
  allow_delegation: boolean | null;
  max_delegation_hours: number | null;
  delegation_reason: string;
  scope_note: string | null;
  starts_at: string;
  ends_at: string;
  delegation_status: string;
  requested_by: string | null;
  requested_by_name: string | null;
  approved_by: string | null;
  approved_by_name: string | null;
  approved_at: string | null;
  revoked_by: string | null;
  revoked_by_name: string | null;
  revoked_at: string | null;
  note: string | null;
  created_at: string;
  updated_at: string;
  effective_status: string;
  control_flags: string[] | null;
};

export type RolePermissionDelegationSummaryRow = {
  permission_count: number;
  role_permission_count: number;
  user_count: number;
  ready_user_count: number;
  high_risk_user_count: number;
  delegated_user_count: number;
  active_delegation_count: number;
  expired_delegation_count: number;
  permission_needs_fix_count: number;
};

export type PermissionUserOptionRow = {
  id: string;
  full_name: string;
  email: string;
};

export type PermissionModuleOptionRow = {
  module_code: string;
  module_name: string;
};

type RolePermissionDelegationMatrixProps = {
  permissions: PermissionRegistryRow[];
  users: UserPermissionMatrixRow[];
  delegations: PermissionDelegationRow[];
  summary?: RolePermissionDelegationSummaryRow | null;
  userOptions: PermissionUserOptionRow[];
  moduleOptions: PermissionModuleOptionRow[];
  canManage: boolean;
  canApprove: boolean;
  canRevoke: boolean;
  loadError?: string;
};

const inputClass =
  "h-10 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm outline-none transition focus:border-zinc-500 focus:ring-3 focus:ring-zinc-200";

const textareaClass =
  "min-h-24 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-zinc-500 focus:ring-3 focus:ring-zinc-200";

const riskLevels = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
const grantScopes = ["ROLE", "ROLE_AND_SCOPE", "APPROVAL", "TEMP_DELEGATION", "SYSTEM_ONLY"];
const controlStatuses = ["DAT", "DAT_TAM_THOI", "CAN_SUA", "CHUA_DU_DIEU_KIEN"];

const riskLabels: Record<string, string> = {
  LOW: "Thấp",
  MEDIUM: "Trung bình",
  HIGH: "Cao",
  CRITICAL: "Rất cao",
};

const grantScopeLabels: Record<string, string> = {
  ROLE: "Theo vai trò",
  ROLE_AND_SCOPE: "Theo vai trò + phạm vi",
  APPROVAL: "Cần duyệt",
  TEMP_DELEGATION: "Ủy quyền tạm",
  SYSTEM_ONLY: "Chỉ hệ thống",
};

const controlStatusLabels: Record<string, string> = {
  DAT: "Đạt",
  DAT_TAM_THOI: "Đạt tạm thời",
  CAN_SUA: "Cần sửa",
  CHUA_DU_DIEU_KIEN: "Chưa đủ điều kiện",
};

const userStatusLabels: Record<string, string> = {
  READY: "Ổn",
  NEEDS_SCOPE: "Thiếu phạm vi",
  NEEDS_FIX: "Cần sửa",
  HIGH_RISK: "Rủi ro cao",
  BLOCKED: "Bị chặn",
  INACTIVE: "Không hoạt động",
};

const registryStatusLabels: Record<string, string> = {
  READY: "Đã kiểm soát",
  TEMP_READY: "Tạm dùng",
  NEEDS_FIX: "Cần sửa",
  BLOCKED: "Bị chặn",
};

const delegationStatusLabels: Record<string, string> = {
  PENDING: "Chờ duyệt",
  ACTIVE: "Đang hiệu lực",
  SCHEDULED: "Chưa đến hạn",
  EXPIRED: "Hết hạn",
  REJECTED: "Từ chối",
  REVOKED: "Đã thu hồi",
  CANCELLED: "Đã hủy",
};

const flagLabels: Record<string, string> = {
  NO_ROLE: "Chưa có role",
  NO_DEPARTMENT: "Chưa có phòng ban",
  NO_MANAGER: "Chưa có quản lý trực tiếp",
  NO_PERMISSION: "Role chưa có quyền",
  HAS_BROAD_PERMISSION: "Có quyền rộng",
  HAS_CRITICAL_PERMISSION: "Có quyền rất cao",
  NO_BUSINESS_SCOPE: "Chưa có phạm vi nghiệp vụ",
  HAS_ACTIVE_DELEGATION: "Có ủy quyền hiệu lực",
  HAS_EXPIRED_DELEGATION: "Có ủy quyền hết hạn",
  MISSING_OWNER: "Thiếu owner",
  HIGH_RISK_WITHOUT_APPROVAL: "Quyền rủi ro cao chưa bắt buộc duyệt",
  CRITICAL_DELEGATION_TOO_LONG: "Ủy quyền quyền rất cao quá dài",
  AI_ON_HIGH_RISK_PERMISSION: "AI bật trên quyền rủi ro cao",
  CONTROL_NOT_READY: "Kiểm soát chưa đạt",
  PERMISSION_NOT_REGISTERED: "Quyền chưa đăng ký",
  DELEGATION_NOT_ALLOWED: "Quyền không cho ủy quyền",
  DELEGATION_TOO_LONG: "Ủy quyền quá thời hạn",
  MISSING_REASON: "Thiếu lý do",
  ACTIVE_WITHOUT_APPROVER: "Hiệu lực nhưng thiếu người duyệt",
  EXPIRED: "Hết hạn",
};

function formatNumber(value: number | null | undefined) {
  return new Intl.NumberFormat("vi-VN").format(value ?? 0);
}

function formatDateTime(value: string | null) {
  if (!value) return "Chưa có";

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function toDateTimeLocal(value: Date) {
  const offsetMs = value.getTimezoneOffset() * 60_000;
  return new Date(value.getTime() - offsetMs).toISOString().slice(0, 16);
}

function Metric({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: typeof KeyRound;
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

function CheckboxField({
  name,
  label,
  defaultChecked,
}: {
  name: string;
  label: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex items-center gap-2 rounded-md border border-zinc-200 px-3 py-2 text-sm text-zinc-700">
      <input name={name} type="checkbox" defaultChecked={defaultChecked} />
      {label}
    </label>
  );
}

function statusTone(value: string) {
  if (["READY", "ACTIVE"].includes(value)) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }
  if (["HIGH_RISK", "BLOCKED", "REJECTED", "REVOKED"].includes(value)) {
    return "border-rose-200 bg-rose-50 text-rose-700";
  }
  if (["NEEDS_SCOPE", "NEEDS_FIX", "EXPIRED"].includes(value)) {
    return "border-amber-200 bg-amber-50 text-amber-800";
  }
  return "border-sky-200 bg-sky-50 text-sky-700";
}

export function RolePermissionDelegationMatrix({
  permissions,
  users,
  delegations,
  summary,
  userOptions,
  moduleOptions,
  canManage,
  canApprove,
  canRevoke,
  loadError,
}: RolePermissionDelegationMatrixProps) {
  if (loadError) {
    return (
      <section className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-800">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 size-5 shrink-0" />
          <div>
            <h2 className="font-semibold">
              Chưa có Role, Permission & Delegation Matrix P0-11
            </h2>
            <p className="mt-1">
              Hãy chạy file{" "}
              <span className="font-mono">
                database/step50_role_permission_delegation_matrix.sql
              </span>{" "}
              trong Supabase SQL Editor rồi tải lại Master Control. Chi tiết:{" "}
              {loadError}
            </p>
          </div>
        </div>
      </section>
    );
  }

  const now = new Date();
  const defaultStart = toDateTimeLocal(now);
  const defaultEnd = toDateTimeLocal(new Date(now.getTime() + 24 * 60 * 60 * 1000));
  const effectiveSummary = summary ?? {
    permission_count: permissions.length,
    role_permission_count: 0,
    user_count: users.length,
    ready_user_count: users.filter((user) => user.permission_status === "READY").length,
    high_risk_user_count: users.filter((user) =>
      ["HIGH_RISK", "BLOCKED"].includes(user.permission_status),
    ).length,
    delegated_user_count: users.filter((user) => user.active_delegation_count > 0).length,
    active_delegation_count: delegations.filter(
      (delegation) => delegation.effective_status === "ACTIVE",
    ).length,
    expired_delegation_count: delegations.filter(
      (delegation) => delegation.effective_status === "EXPIRED",
    ).length,
    permission_needs_fix_count: permissions.filter((permission) =>
      ["BLOCKED", "NEEDS_FIX"].includes(permission.registry_status),
    ).length,
  };

  return (
    <section className="space-y-5">
      <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <KeyRound className="size-5 text-zinc-600" />
              <h2 className="text-lg font-semibold">
                Role, Permission & Delegation Matrix P0-11
              </h2>
            </div>
            <p className="mt-2 max-w-4xl text-sm leading-6 text-zinc-500">
              Ma trận kiểm soát ai được làm gì, quyền nào rủi ro cao, user nào
              thiếu role/phòng ban/quản lý/phạm vi, và ủy quyền tạm thời nào
              đang có hiệu lực. Ủy quyền chỉ có tác dụng khi đã duyệt và còn hạn.
            </p>
          </div>
          <span className="rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-medium text-zinc-600">
            Đúng người · Đúng quyền · Đúng phạm vi · Có hạn · Có log
          </span>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <Metric label="User" value={effectiveSummary.user_count} icon={UserCheck} />
        <Metric
          label="User rủi ro cao"
          value={effectiveSummary.high_risk_user_count}
          icon={ShieldAlert}
        />
        <Metric
          label="Quyền registry"
          value={effectiveSummary.permission_count}
          icon={KeyRound}
        />
        <Metric
          label="Ủy quyền hiệu lực"
          value={effectiveSummary.active_delegation_count}
          icon={ShieldCheck}
        />
        <Metric
          label="Ủy quyền hết hạn"
          value={effectiveSummary.expired_delegation_count}
          icon={AlertTriangle}
        />
      </div>

      <section className="rounded-lg border border-zinc-200 bg-white shadow-sm">
        <div className="border-b border-zinc-200 p-5">
          <h3 className="text-base font-semibold">Tạo ủy quyền tạm thời</h3>
          <p className="mt-1 text-sm text-zinc-500">
            Dùng khi trưởng phòng hoặc người phụ trách cần giao quyền tạm thời
            cho người khác. Không dùng thay cho phân quyền cố định.
          </p>
        </div>
        <form
          action={createPermissionDelegationAction}
          className="grid gap-4 p-5 lg:grid-cols-4"
        >
          <select name="from_user_id" className={inputClass} required>
            <option value="">Người ủy quyền</option>
            {userOptions.map((user) => (
              <option key={user.id} value={user.id}>
                {user.full_name} - {user.email}
              </option>
            ))}
          </select>
          <select name="to_user_id" className={inputClass} required>
            <option value="">Người nhận quyền</option>
            {userOptions.map((user) => (
              <option key={user.id} value={user.id}>
                {user.full_name} - {user.email}
              </option>
            ))}
          </select>
          <select name="permission_code" className={inputClass} required>
            <option value="">Chọn quyền</option>
            {permissions.map((permission) => (
              <option key={permission.id} value={permission.permission_code}>
                {permission.permission_label} ({permission.permission_code})
              </option>
            ))}
          </select>
          <select
            name="delegation_status"
            className={inputClass}
            defaultValue={canApprove ? "ACTIVE" : "PENDING"}
          >
            <option value="PENDING">Gửi chờ duyệt</option>
            {canApprove ? <option value="ACTIVE">Duyệt ngay</option> : null}
          </select>
          <input
            name="starts_at"
            type="datetime-local"
            className={inputClass}
            defaultValue={defaultStart}
          />
          <input
            name="ends_at"
            type="datetime-local"
            className={inputClass}
            defaultValue={defaultEnd}
            required
          />
          <textarea
            name="delegation_reason"
            className={`${textareaClass} lg:col-span-2`}
            placeholder="Lý do ủy quyền"
            required
          />
          <textarea
            name="scope_note"
            className={`${textareaClass} lg:col-span-4`}
            placeholder="Phạm vi ủy quyền, ví dụ: xử lý hồ sơ HOU trong ngày 16/06/2026"
          />
          <div className="lg:col-span-4">
            <Button type="submit" disabled={!canManage && !canApprove}>
              <LockKeyhole className="size-4" />
              Tạo ủy quyền
            </Button>
          </div>
        </form>
      </section>

      <section className="rounded-lg border border-zinc-200 bg-white shadow-sm">
        <div className="border-b border-zinc-200 p-5">
          <h3 className="text-base font-semibold">Bảng kiểm user và quyền</h3>
          <p className="mt-1 text-sm text-zinc-500">
            User đạt khi có role, phòng ban, quản lý trực tiếp nếu cần, phạm vi
            nghiệp vụ và không có quyền rộng ngoài kiểm soát.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1180px] text-sm">
            <thead className="bg-zinc-50 text-left text-xs font-medium uppercase text-zinc-500">
              <tr>
                <th className="px-5 py-3">User</th>
                <th className="px-5 py-3">Vai trò / phòng</th>
                <th className="px-5 py-3">Quyền</th>
                <th className="px-5 py-3">Phạm vi</th>
                <th className="px-5 py-3">Trạng thái</th>
                <th className="px-5 py-3">Cảnh báo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {users.length === 0 ? (
                <tr>
                  <td className="px-5 py-8 text-center text-zinc-500" colSpan={6}>
                    Chưa có user trong ma trận quyền.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="align-top">
                    <td className="px-5 py-4">
                      <p className="font-medium text-zinc-950">{user.full_name}</p>
                      <p className="mt-1 text-xs text-zinc-500">{user.email}</p>
                      <p className="mt-2 text-xs text-zinc-500">
                        Quản lý: {user.manager_name ?? "Chưa gắn"}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-medium text-zinc-700">
                        {user.role_name ?? "Chưa có role"}
                      </p>
                      <p className="mt-1 text-xs text-zinc-500">
                        {user.role_code ?? "NO_ROLE"} ·{" "}
                        {user.department_name ?? "Chưa có phòng"}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-xs text-zinc-500">
                        Tổng quyền: {formatNumber(user.role_permission_count)}
                      </p>
                      <p className="mt-1 text-xs text-zinc-500">
                        Rộng: {formatNumber(user.broad_permission_count)} · Cao:{" "}
                        {formatNumber(user.high_risk_permission_count)} · Rất cao:{" "}
                        {formatNumber(user.critical_permission_count)}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-xs text-zinc-500">
                        Đối tượng: {formatNumber(user.segment_scope_count)}
                      </p>
                      <p className="mt-1 text-xs text-zinc-500">
                        Đối tác: {formatNumber(user.partner_scope_count)}
                      </p>
                      <p className="mt-1 text-xs text-zinc-500">
                        Ủy quyền: {formatNumber(user.active_delegation_count)}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-md border px-2 py-1 text-xs font-medium ${statusTone(
                          user.permission_status,
                        )}`}
                      >
                        {userStatusLabels[user.permission_status] ??
                          user.permission_status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <Flags flags={user.control_flags} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1fr_1fr]">
        <div className="rounded-lg border border-zinc-200 bg-white shadow-sm">
          <div className="border-b border-zinc-200 p-5">
            <h3 className="text-base font-semibold">Ủy quyền gần đây</h3>
            <p className="mt-1 text-sm text-zinc-500">
              Ủy quyền phải có lý do, người duyệt, thời hạn và có thể thu hồi.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px] text-sm">
              <thead className="bg-zinc-50 text-left text-xs font-medium uppercase text-zinc-500">
                <tr>
                  <th className="px-5 py-3">Ủy quyền</th>
                  <th className="px-5 py-3">Quyền / hạn</th>
                  <th className="px-5 py-3">Kiểm soát</th>
                  <th className="px-5 py-3">Cập nhật</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {delegations.length === 0 ? (
                  <tr>
                    <td className="px-5 py-8 text-center text-zinc-500" colSpan={4}>
                      Chưa có ủy quyền.
                    </td>
                  </tr>
                ) : (
                  delegations.map((delegation) => (
                    <tr key={delegation.id} className="align-top">
                      <td className="px-5 py-4">
                        <p className="font-mono text-xs text-zinc-500">
                          {delegation.delegation_code}
                        </p>
                        <p className="mt-1 font-medium text-zinc-950">
                          {delegation.from_user_name ?? "Người ủy quyền"} →{" "}
                          {delegation.to_user_name ?? "Người nhận"}
                        </p>
                        <p className="mt-2 line-clamp-3 text-xs leading-5 text-zinc-500">
                          {delegation.delegation_reason}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-medium text-zinc-700">
                          {delegation.permission_label ?? delegation.permission_code}
                        </p>
                        <p className="mt-1 text-xs text-zinc-500">
                          {delegation.permission_code} ·{" "}
                          {riskLabels[delegation.risk_level ?? ""] ??
                            delegation.risk_level ??
                            "Chưa rõ"}
                        </p>
                        <p className="mt-2 text-xs text-zinc-500">
                          {formatDateTime(delegation.starts_at)} →{" "}
                          {formatDateTime(delegation.ends_at)}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-md border px-2 py-1 text-xs font-medium ${statusTone(
                            delegation.effective_status,
                          )}`}
                        >
                          {delegationStatusLabels[delegation.effective_status] ??
                            delegation.effective_status}
                        </span>
                        <div className="mt-2">
                          <Flags flags={delegation.control_flags} />
                        </div>
                        <p className="mt-2 text-xs text-zinc-500">
                          Duyệt: {delegation.approved_by_name ?? "Chưa duyệt"}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        {canApprove || canRevoke || canManage ? (
                          <form
                            action={updatePermissionDelegationAction}
                            className="grid min-w-72 gap-2"
                          >
                            <input
                              type="hidden"
                              name="delegation_id"
                              value={delegation.id}
                            />
                            <select
                              name="delegation_status"
                              className={inputClass}
                              defaultValue={delegation.delegation_status}
                            >
                              {canApprove ? (
                                <>
                                  <option value="ACTIVE">Duyệt hiệu lực</option>
                                  <option value="REJECTED">Từ chối</option>
                                  <option value="PENDING">Chờ duyệt</option>
                                </>
                              ) : null}
                              {canRevoke ? <option value="REVOKED">Thu hồi</option> : null}
                              {canManage ? <option value="CANCELLED">Hủy</option> : null}
                            </select>
                            <textarea
                              name="note"
                              className={textareaClass}
                              defaultValue={delegation.note ?? ""}
                              placeholder="Ghi chú xử lý"
                            />
                            <Button type="submit" size="sm">
                              <Save className="size-4" />
                              Lưu ủy quyền
                            </Button>
                          </form>
                        ) : (
                          <span className="text-xs text-zinc-500">
                            Chưa có quyền xử lý
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white shadow-sm">
          <div className="border-b border-zinc-200 p-5">
            <h3 className="text-base font-semibold">Registry quyền</h3>
            <p className="mt-1 text-sm text-zinc-500">
              Admin/IT Data kiểm soát quyền nào rủi ro cao, có cần scope, có cho
              ủy quyền không và tối đa bao lâu.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1040px] text-sm">
              <thead className="bg-zinc-50 text-left text-xs font-medium uppercase text-zinc-500">
                <tr>
                  <th className="px-5 py-3">Quyền</th>
                  <th className="px-5 py-3">Risk / dùng</th>
                  <th className="px-5 py-3">Cảnh báo</th>
                  {canManage ? <th className="px-5 py-3">Cập nhật registry</th> : null}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {permissions.slice(0, 50).map((permission) => (
                  <tr key={permission.id} className="align-top">
                    <td className="px-5 py-4">
                      <p className="font-mono text-xs text-zinc-500">
                        {permission.permission_code}
                      </p>
                      <p className="mt-1 font-medium text-zinc-950">
                        {permission.permission_label}
                      </p>
                      <p className="mt-2 text-xs text-zinc-500">
                        {permission.permission_group} ·{" "}
                        {permission.module_code ?? "Chưa gắn module"}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-xs text-zinc-500">
                        Risk: {riskLabels[permission.risk_level] ?? permission.risk_level}
                      </p>
                      <p className="mt-1 text-xs text-zinc-500">
                        Cấp theo:{" "}
                        {grantScopeLabels[permission.grant_scope] ??
                          permission.grant_scope}
                      </p>
                      <p className="mt-1 text-xs text-zinc-500">
                        Role: {formatNumber(permission.role_count)} · User:{" "}
                        {formatNumber(permission.user_count)} · Delegation:{" "}
                        {formatNumber(permission.active_delegation_count)}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`mb-2 inline-flex rounded-md border px-2 py-1 text-xs font-medium ${statusTone(
                          permission.registry_status,
                        )}`}
                      >
                        {registryStatusLabels[permission.registry_status] ??
                          permission.registry_status}
                      </span>
                      <Flags flags={permission.control_flags} />
                    </td>
                    {canManage ? (
                      <td className="px-5 py-4">
                        <form
                          action={updatePermissionRegistryAction}
                          className="grid min-w-96 gap-2"
                        >
                          <input type="hidden" name="registry_id" value={permission.id} />
                          <input
                            name="permission_label"
                            className={inputClass}
                            defaultValue={permission.permission_label}
                          />
                          <div className="grid gap-2 sm:grid-cols-2">
                            <input
                              name="permission_group"
                              className={inputClass}
                              defaultValue={permission.permission_group}
                            />
                            <select
                              name="module_code"
                              className={inputClass}
                              defaultValue={permission.module_code ?? ""}
                            >
                              <option value="">Chưa gắn module</option>
                              {moduleOptions.map((module) => (
                                <option key={module.module_code} value={module.module_code}>
                                  {module.module_code} - {module.module_name}
                                </option>
                              ))}
                            </select>
                            <input
                              name="owner_department"
                              className={inputClass}
                              defaultValue={permission.owner_department ?? ""}
                              placeholder="Owner"
                            />
                            <select
                              name="risk_level"
                              className={inputClass}
                              defaultValue={permission.risk_level}
                            >
                              {riskLevels.map((risk) => (
                                <option key={risk} value={risk}>
                                  {riskLabels[risk] ?? risk}
                                </option>
                              ))}
                            </select>
                            <select
                              name="grant_scope"
                              className={inputClass}
                              defaultValue={permission.grant_scope}
                            >
                              {grantScopes.map((scope) => (
                                <option key={scope} value={scope}>
                                  {grantScopeLabels[scope] ?? scope}
                                </option>
                              ))}
                            </select>
                            <input
                              name="max_delegation_hours"
                              type="number"
                              min="0"
                              className={inputClass}
                              defaultValue={permission.max_delegation_hours}
                            />
                            <select
                              name="control_status"
                              className={inputClass}
                              defaultValue={permission.control_status}
                            >
                              {controlStatuses.map((status) => (
                                <option key={status} value={status}>
                                  {controlStatusLabels[status] ?? status}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="grid gap-2 sm:grid-cols-2">
                            <CheckboxField
                              name="requires_scope"
                              label="Cần scope"
                              defaultChecked={permission.requires_scope}
                            />
                            <CheckboxField
                              name="requires_approval"
                              label="Cần duyệt"
                              defaultChecked={permission.requires_approval}
                            />
                            <CheckboxField
                              name="allow_delegation"
                              label="Cho ủy quyền"
                              defaultChecked={permission.allow_delegation}
                            />
                            <CheckboxField
                              name="ai_allowed"
                              label="Cho AI đọc"
                              defaultChecked={permission.ai_allowed}
                            />
                          </div>
                          <textarea
                            name="control_note"
                            className={textareaClass}
                            defaultValue={permission.control_note ?? ""}
                            placeholder="Ghi chú kiểm soát"
                          />
                          <Button type="submit" size="sm">
                            <Save className="size-4" />
                            Lưu quyền
                          </Button>
                        </form>
                      </td>
                    ) : null}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </section>
  );
}
