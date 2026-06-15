import { CheckCircle2, ShieldCheck, UserCog, UsersRound } from "lucide-react";

import { updateUserProfileAction } from "@/app/settings/actions";
import { Button } from "@/components/ui/button";

export type UserProfileRow = {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  role_id: string | null;
  department_id: string | null;
  manager_id: string | null;
  status: string;
  created_at: string;
};

export type RoleRow = {
  id: string;
  code: string;
  name: string;
  description: string | null;
};

export type DepartmentRow = {
  id: string;
  code: string;
  name: string;
  status: string;
};

export type RolePermissionRow = {
  role_id: string;
  permission: string;
};

type UserSettingsOverviewProps = {
  currentUserId: string;
  users: UserProfileRow[];
  roles: RoleRow[];
  departments: DepartmentRow[];
  permissions: RolePermissionRow[];
  message?: string;
  error?: string;
};

const inputClass =
  "h-9 w-full rounded-md border border-zinc-300 bg-white px-2 text-sm outline-none transition focus:border-zinc-500 focus:ring-3 focus:ring-zinc-200";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
  }).format(new Date(value));
}

function StatCard({
  label,
  value,
  tone,
  icon: Icon,
}: {
  label: string;
  value: number;
  tone: string;
  icon: typeof UsersRound;
}) {
  return (
    <article className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <span
          className={`inline-flex rounded-md border px-2 py-1 text-xs font-medium ${tone}`}
        >
          {label}
        </span>
        <Icon className="size-5 text-zinc-400" />
      </div>
      <p className="text-3xl font-semibold">{value}</p>
    </article>
  );
}

function roleName(roles: RoleRow[], roleId: string | null) {
  return roles.find((role) => role.id === roleId)?.name ?? "Chưa gắn role";
}

function departmentName(departments: DepartmentRow[], departmentId: string | null) {
  return (
    departments.find((department) => department.id === departmentId)?.name ??
    "Chưa gắn phòng ban"
  );
}

export function UserSettingsOverview({
  currentUserId,
  users,
  roles,
  departments,
  permissions,
  message,
  error,
}: UserSettingsOverviewProps) {
  const activeUsers = users.filter((user) => user.status === "ACTIVE").length;
  const activeDepartments = departments.filter(
    (department) => department.status === "ACTIVE",
  ).length;
  const permissionsByRole = new Map<string, string[]>();

  for (const permission of permissions) {
    const current = permissionsByRole.get(permission.role_id) ?? [];
    current.push(permission.permission);
    permissionsByRole.set(permission.role_id, current);
  }

  return (
    <div className="space-y-6">
      {message ? (
        <section className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          {message}
        </section>
      ) : null}

      {error ? (
        <section className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {error}
        </section>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Tổng user"
          value={users.length}
          tone="border-sky-200 bg-sky-50 text-sky-700"
          icon={UsersRound}
        />
        <StatCard
          label="User active"
          value={activeUsers}
          tone="border-emerald-200 bg-emerald-50 text-emerald-700"
          icon={CheckCircle2}
        />
        <StatCard
          label="Role"
          value={roles.length}
          tone="border-violet-200 bg-violet-50 text-violet-700"
          icon={ShieldCheck}
        />
        <StatCard
          label="Phòng ban"
          value={activeDepartments}
          tone="border-amber-200 bg-amber-50 text-amber-700"
          icon={UserCog}
        />
      </section>

      <section className="rounded-lg border border-zinc-200 bg-white shadow-sm">
        <div className="border-b border-zinc-200 p-5">
          <h2 className="text-base font-semibold">Người dùng và phân quyền</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Cập nhật role, phòng ban và trạng thái tài khoản trong bảng
            users_profile.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1120px] text-sm">
            <thead className="bg-zinc-50 text-left text-xs font-medium uppercase text-zinc-500">
              <tr>
                <th className="px-5 py-3">User</th>
                <th className="px-5 py-3">Role hiện tại</th>
                <th className="px-5 py-3">Phòng ban</th>
                <th className="px-5 py-3">Cập nhật</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {users.length === 0 ? (
                <tr>
                  <td className="px-5 py-6 text-center text-zinc-500" colSpan={4}>
                    Chưa có user trong users_profile.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="align-top">
                    <td className="px-5 py-4">
                      <p className="font-medium text-zinc-950">
                        {user.full_name}
                        {user.id === currentUserId ? (
                          <span className="ml-2 rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-600">
                            Bạn
                          </span>
                        ) : null}
                      </p>
                      <p className="mt-1 text-zinc-500">{user.email}</p>
                      <p className="mt-1 text-xs text-zinc-500">
                        Tạo ngày {formatDate(user.created_at)}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-medium text-zinc-900">
                        {roleName(roles, user.role_id)}
                      </p>
                      <span className="mt-2 inline-flex rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-700">
                        {user.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-zinc-700">
                      {departmentName(departments, user.department_id)}
                    </td>
                    <td className="px-5 py-4">
                      <form
                        action={updateUserProfileAction}
                        className="grid gap-3 md:grid-cols-[190px_190px_130px_auto]"
                      >
                        <input type="hidden" name="user_id" value={user.id} />
                        <select
                          name="role_id"
                          className={inputClass}
                          defaultValue={user.role_id ?? ""}
                        >
                          {roles.map((role) => (
                            <option key={role.id} value={role.id}>
                              {role.name}
                            </option>
                          ))}
                        </select>
                        <select
                          name="department_id"
                          className={inputClass}
                          defaultValue={user.department_id ?? ""}
                        >
                          <option value="">Không gắn</option>
                          {departments.map((department) => (
                            <option key={department.id} value={department.id}>
                              {department.name}
                            </option>
                          ))}
                        </select>
                        <select
                          name="status"
                          className={inputClass}
                          defaultValue={user.status}
                        >
                          <option value="ACTIVE">ACTIVE</option>
                          <option value="INACTIVE">INACTIVE</option>
                        </select>
                        <Button type="submit" size="sm">
                          Lưu
                        </Button>
                      </form>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-lg border border-zinc-200 bg-white shadow-sm">
        <div className="border-b border-zinc-200 p-5">
          <h2 className="text-base font-semibold">Ma trận role - quyền</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Bước này đang cho xem quyền theo role. Chỉnh chi tiết từng quyền sẽ
            làm sau khi có màn hình quản trị nâng cao hơn.
          </p>
        </div>

        <div className="grid gap-4 p-5 lg:grid-cols-2">
          {roles.map((role) => {
            const rolePermissions = permissionsByRole.get(role.id) ?? [];

            return (
              <article
                key={role.id}
                className="rounded-lg border border-zinc-200 bg-zinc-50 p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-zinc-950">{role.name}</h3>
                    <p className="mt-1 text-xs font-medium text-zinc-500">
                      {role.code}
                    </p>
                  </div>
                  <span className="rounded-md bg-white px-2 py-1 text-xs font-medium text-zinc-600">
                    {rolePermissions.length} quyền
                  </span>
                </div>
                <p className="mt-3 text-sm text-zinc-600">
                  {role.description ?? "Chưa có mô tả."}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {rolePermissions.length === 0 ? (
                    <span className="text-sm text-zinc-500">Chưa gắn quyền</span>
                  ) : (
                    rolePermissions.map((permission) => (
                      <span
                        key={permission}
                        className="rounded-md border border-zinc-200 bg-white px-2 py-1 text-xs text-zinc-700"
                      >
                        {permission}
                      </span>
                    ))
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
