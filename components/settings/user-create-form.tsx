"use client";

import { useState } from "react";
import { LoaderCircle, UserPlus } from "lucide-react";
import { useFormStatus } from "react-dom";

import { createUserAccountAction } from "@/app/settings/actions";
import { Button } from "@/components/ui/button";

type OptionRow = {
  id: string;
  name: string;
  code?: string;
};

type UserOptionRow = {
  id: string;
  full_name: string;
  email: string;
  role_id: string | null;
  department_id: string | null;
};

type CreateUserDisabledReason = "missing_service_role_key" | "missing_permission";

type UserCreateFormProps = {
  roles: OptionRow[];
  departments: OptionRow[];
  managers: UserOptionRow[];
  returnPath?: "/settings" | "/settings/scopes";
  canCreateAuthUser?: boolean;
  createUserDisabledReason?: CreateUserDisabledReason;
  canCreatePrivilegedUsers?: boolean;
};

const inputClass =
  "h-10 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm outline-none transition focus:border-zinc-500 focus:ring-3 focus:ring-zinc-200";

const departmentManagerRoleCodes = new Set([
  "ADMISSION_HEAD",
  "ACCOUNTING_LEAD",
  "CTHSSV_LEAD",
  "TEAM_LEAD",
]);

function isDepartmentHeadRole(role: OptionRow | undefined) {
  if (!role) {
    return false;
  }

  const normalizedName = role.name.toLowerCase();

  return (
    Boolean(role.code && departmentManagerRoleCodes.has(role.code)) ||
    role.code?.endsWith("_HEAD") ||
    role.code?.endsWith("_LEAD") ||
    normalizedName.includes("truong phong") ||
    normalizedName.includes("truong nhom") ||
    normalizedName.includes("trưởng phòng") ||
    normalizedName.includes("trưởng nhóm")
  );
}

function isStaffRole(role: OptionRow | undefined) {
  if (!role) {
    return false;
  }

  return !["ADMIN", "BGH"].includes(role.code ?? "") && !isDepartmentHeadRole(role);
}

function UserCreateSubmitButton({
  canCreateAuthUser,
  disabledButtonLabel,
}: {
  canCreateAuthUser: boolean;
  disabledButtonLabel: string;
}) {
  const { pending } = useFormStatus();
  const isDisabled = !canCreateAuthUser || pending;

  return (
    <Button aria-live="polite" disabled={isDisabled} type="submit">
      {pending ? (
        <LoaderCircle className="size-4 animate-spin" />
      ) : (
        <UserPlus className="size-4" />
      )}
      {pending
        ? "Đang tạo user..."
        : canCreateAuthUser
          ? "Tạo user"
          : disabledButtonLabel}
    </Button>
  );
}

export function UserCreateForm({
  roles,
  departments,
  managers,
  returnPath = "/settings",
  canCreateAuthUser = false,
  createUserDisabledReason,
  canCreatePrivilegedUsers = true,
}: UserCreateFormProps) {
  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [selectedDepartmentId, setSelectedDepartmentId] = useState("");
  const [selectedManagerId, setSelectedManagerId] = useState("");
  const assignableRoles = canCreatePrivilegedUsers
    ? roles
    : roles.filter((role) => !["ADMIN", "BGH"].includes(role.code ?? ""));
  const selectedRole = assignableRoles.find(
    (role) => role.id === selectedRoleId,
  );
  const staffRole = isStaffRole(selectedRole);
  const departmentHeads = managers.filter((manager) => {
    const role = roles.find((item) => item.id === manager.role_id);

    return (
      manager.department_id === selectedDepartmentId &&
      isDepartmentHeadRole(role)
    );
  });
  const sameDepartmentOthers = managers.filter((manager) => {
    const role = roles.find((item) => item.id === manager.role_id);

    return (
      manager.department_id === selectedDepartmentId &&
      !isDepartmentHeadRole(role)
    );
  });
  const organizationManagers = managers.filter((manager) => {
    const role = roles.find((item) => item.id === manager.role_id);
    const roleCode = role?.code ?? "";

    return ["ADMIN", "BGH"].includes(roleCode) || isDepartmentHeadRole(role);
  });
  const managerOptions = selectedDepartmentId
    ? staffRole
      ? departmentHeads.length > 0
        ? departmentHeads
        : [
            ...sameDepartmentOthers,
            ...organizationManagers.filter(
              (manager) => manager.department_id !== selectedDepartmentId,
            ),
          ]
      : [...departmentHeads, ...sameDepartmentOthers]
    : managers;

  function firstDepartmentHeadId(departmentId: string) {
    return (
      managers.find((manager) => {
        const role = roles.find((item) => item.id === manager.role_id);

        return (
          manager.department_id === departmentId && isDepartmentHeadRole(role)
        );
      })?.id ?? ""
    );
  }

  function handleRoleChange(roleId: string) {
    const nextRole = assignableRoles.find((role) => role.id === roleId);

    setSelectedRoleId(roleId);

    if (isStaffRole(nextRole)) {
      setSelectedManagerId(firstDepartmentHeadId(selectedDepartmentId));
    }
  }

  function handleDepartmentChange(departmentId: string) {
    setSelectedDepartmentId(departmentId);

    if (staffRole) {
      setSelectedManagerId(firstDepartmentHeadId(departmentId));
    }
  }

  const effectiveDisabledReason =
    createUserDisabledReason ??
    (canCreateAuthUser ? undefined : "missing_service_role_key");
  const disabledButtonLabel =
    effectiveDisabledReason === "missing_permission"
      ? "Chưa có quyền"
      : "Chưa cấu hình key";
  const missingServiceRoleMessage = canCreatePrivilegedUsers
    ? "Chưa cấu hình SUPABASE_SERVICE_ROLE_KEY nên nút tạo user tự động đang bị khóa. ADMIN vẫn có thể tạo user thủ công trong Supabase Auth rồi quay lại liên kết Auth user vào CRM."
    : "Chưa cấu hình SUPABASE_SERVICE_ROLE_KEY nên nút tạo user tự động đang bị khóa. Người được ủy quyền users.create cần nhờ ADMIN/IT_DATA cấu hình key server hoặc tạo/link Auth thủ công; không gửi mật khẩu tạm, OTP hay invite/reset link qua chat/email.";
  const gateMessage = canCreateAuthUser
    ? "CRM đã có service role key và user hiện tại có quyền users.create. Có thể tạo tài khoản đăng nhập tự động. Không hiển thị key, không ghi log mật khẩu tạm."
    : effectiveDisabledReason === "missing_permission"
      ? "User hiện tại chưa được cấp quyền users.create nên nút tạo user tự động đang bị khóa. ADMIN có thể cấp quyền này trong ma trận phân quyền."
      : missingServiceRoleMessage;

  return (
    <section className="rounded-lg border border-zinc-200 bg-white shadow-sm">
      <div className="border-b border-zinc-200 p-5">
        <div className="flex items-center gap-2">
          <UserPlus className="size-4 text-zinc-500" />
          <h2 className="text-base font-semibold">Tạo tài khoản user</h2>
        </div>
        <p className="mt-1 text-sm leading-6 text-zinc-500">
          Tạo tài khoản đăng nhập Supabase Auth, sau đó gắn profile, phòng ban,
          role và người quản lý trong CRM. Chức năng này chỉ dành cho ADMIN.
        </p>
      </div>

      <form action={createUserAccountAction} className="space-y-4 p-5">
        <input type="hidden" name="return_to" value={returnPath} />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-zinc-700">
              Email đăng nhập <span className="text-rose-600">*</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className={inputClass}
              placeholder="user@heuschool.edu.vn"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="full_name"
              className="text-sm font-medium text-zinc-700"
            >
              Họ tên <span className="text-rose-600">*</span>
            </label>
            <input
              id="full_name"
              name="full_name"
              required
              className={inputClass}
              placeholder="Nguyễn Văn A"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="phone" className="text-sm font-medium text-zinc-700">
              Số điện thoại
            </label>
            <input
              id="phone"
              name="phone"
              className={inputClass}
              placeholder="09xxxxxxxx"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="password"
              className="text-sm font-medium text-zinc-700"
            >
              Mật khẩu tạm <span className="text-rose-600">*</span>
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              aria-describedby="temporary-password-help"
              className={inputClass}
              placeholder="Tối thiểu 8 ký tự"
            />
            <p
              id="temporary-password-help"
              className="text-xs leading-5 text-amber-700"
            >
              Dùng mật khẩu tạm riêng cho user mới, không dùng mật khẩu thật,
              không gửi qua Codex/chat, email thường, ghi chú hay file đính kèm.
              Yêu cầu đổi mật khẩu qua kênh bảo mật sau lần đăng nhập đầu.
              Không hiển thị key, không ghi log mật khẩu tạm.
            </p>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="role_id"
              className="text-sm font-medium text-zinc-700"
            >
              Nhiệm vụ/role <span className="text-rose-600">*</span>
            </label>
            <select
              id="role_id"
              name="role_id"
              required
              className={inputClass}
              value={selectedRoleId}
              onChange={(event) => handleRoleChange(event.target.value)}
            >
              <option value="">Chọn role</option>
              {assignableRoles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
            {!canCreatePrivilegedUsers ? (
              <p className="text-xs leading-5 text-amber-700">
                Quyền users.create không được tạo role ADMIN/BGH. Nếu cần role đặc
                quyền, ADMIN phải thực hiện.
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="department_id"
              className="text-sm font-medium text-zinc-700"
            >
              Phòng ban
            </label>
            <select
              id="department_id"
              name="department_id"
              className={inputClass}
              value={selectedDepartmentId}
              onChange={(event) => handleDepartmentChange(event.target.value)}
            >
              <option value="">Chưa gắn phòng ban</option>
              {departments.map((department) => (
                <option key={department.id} value={department.id}>
                  {department.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2 xl:col-span-3">
            <label
              htmlFor="manager_id"
              className="text-sm font-medium text-zinc-700"
            >
              Người quản lý trực tiếp
            </label>
            <select
              id="manager_id"
              name="manager_id"
              className={inputClass}
              value={selectedManagerId}
              onChange={(event) => setSelectedManagerId(event.target.value)}
            >
              <option value="">Chưa gắn người quản lý</option>
              {selectedDepartmentId && staffRole && departmentHeads.length === 0 ? (
                <option value="" disabled>
                  Chưa có Trưởng phòng cùng phòng ban
                </option>
              ) : null}
              {managerOptions.map((manager) => (
                <option key={manager.id} value={manager.id}>
                  {manager.full_name} - {manager.email}
                </option>
              ))}
            </select>
            {staffRole ? (
              <p className="text-xs leading-5 text-amber-700">
                Đối với nhân viên, người quản lý trực tiếp là Trưởng phòng cùng
                phòng ban. Nếu chưa có lựa chọn, hãy tạo/gán user Trưởng phòng
                trước.
              </p>
            ) : null}
          </div>
        </div>

        <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-800">
          {gateMessage}
        </div>

        <div className="flex justify-end">
          <UserCreateSubmitButton
            canCreateAuthUser={canCreateAuthUser}
            disabledButtonLabel={disabledButtonLabel}
          />
        </div>
      </form>
    </section>
  );
}
