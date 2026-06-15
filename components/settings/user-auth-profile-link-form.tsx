"use client";

import { useState } from "react";
import { Link2 } from "lucide-react";

import { linkAuthUserProfileAction } from "@/app/settings/actions";
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

type UserAuthProfileLinkFormProps = {
  roles: OptionRow[];
  departments: OptionRow[];
  managers: UserOptionRow[];
  returnPath?: "/settings" | "/settings/scopes";
};

const inputClass =
  "h-10 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm outline-none transition focus:border-zinc-500 focus:ring-3 focus:ring-zinc-200";

function isDepartmentHeadRole(role: OptionRow | undefined) {
  if (!role) {
    return false;
  }

  const normalizedName = role.name.toLowerCase();

  return (
    role.code?.endsWith("_HEAD") ||
    normalizedName.includes("truong phong") ||
    normalizedName.includes("trưởng phòng")
  );
}

function isStaffRole(role: OptionRow | undefined) {
  if (!role) {
    return false;
  }

  return !["ADMIN", "BGH"].includes(role.code ?? "") && !isDepartmentHeadRole(role);
}

export function UserAuthProfileLinkForm({
  roles,
  departments,
  managers,
  returnPath = "/settings",
}: UserAuthProfileLinkFormProps) {
  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [selectedDepartmentId, setSelectedDepartmentId] = useState("");
  const [selectedManagerId, setSelectedManagerId] = useState("");
  const selectedRole = roles.find((role) => role.id === selectedRoleId);
  const staffRole = isStaffRole(selectedRole);

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
    const nextRole = roles.find((role) => role.id === roleId);

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
  const managerOptions = selectedDepartmentId
    ? staffRole
      ? departmentHeads
      : [...departmentHeads, ...sameDepartmentOthers]
    : managers;

  return (
    <section className="rounded-lg border border-zinc-200 bg-white shadow-sm">
      <div className="border-b border-zinc-200 p-5">
        <div className="flex items-center gap-2">
          <Link2 className="size-4 text-zinc-500" />
          <h2 className="text-base font-semibold">
            Liên kết user Auth đã tạo thủ công
          </h2>
        </div>
        <p className="mt-1 text-sm leading-6 text-zinc-500">
          Dùng khi bạn đã tạo tài khoản ở Supabase Authentication. CRM sẽ tìm
          Auth user theo email rồi tạo/cập nhật hồ sơ trong users_profile.
        </p>
      </div>

      <form action={linkAuthUserProfileAction} className="space-y-4 p-5">
        <input type="hidden" name="return_to" value={returnPath} />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <div className="space-y-2">
            <label htmlFor="link-email" className="text-sm font-medium text-zinc-700">
              Email Auth đã tạo <span className="text-rose-600">*</span>
            </label>
            <input
              id="link-email"
              name="email"
              type="email"
              required
              className={inputClass}
              placeholder="user@heuschool.edu.vn"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="link-full-name"
              className="text-sm font-medium text-zinc-700"
            >
              Họ tên hiển thị <span className="text-rose-600">*</span>
            </label>
            <input
              id="link-full-name"
              name="full_name"
              required
              className={inputClass}
              placeholder="Nguyễn Văn A"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="link-phone" className="text-sm font-medium text-zinc-700">
              Số điện thoại
            </label>
            <input
              id="link-phone"
              name="phone"
              className={inputClass}
              placeholder="09xxxxxxxx"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="link-role"
              className="text-sm font-medium text-zinc-700"
            >
              Nhiệm vụ/role <span className="text-rose-600">*</span>
            </label>
            <select
              id="link-role"
              name="role_id"
              required
              className={inputClass}
              value={selectedRoleId}
              onChange={(event) => handleRoleChange(event.target.value)}
            >
              <option value="">Chọn role</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="link-department"
              className="text-sm font-medium text-zinc-700"
            >
              Phòng ban
            </label>
            <select
              id="link-department"
              name="department_id"
              className={inputClass}
              value={selectedDepartmentId}
              onChange={(event) => handleDepartmentChange(event.target.value)}
            >
              <option value="">Chọn phòng ban</option>
              {departments.map((department) => (
                <option key={department.id} value={department.id}>
                  {department.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="link-manager"
              className="text-sm font-medium text-zinc-700"
            >
              Người quản lý trực tiếp
            </label>
            <select
              id="link-manager"
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
          </div>
        </div>

        <div className="rounded-md border border-sky-200 bg-sky-50 p-3 text-sm leading-6 text-sky-800">
          Nếu form báo chưa chạy SQL step 39, hãy chạy file
          database/step39_user_profile_admin_tools.sql trong Supabase SQL
          Editor một lần.
        </div>

        <div className="flex justify-end">
          <Button type="submit">
            <Link2 className="size-4" />
            Liên kết vào CRM
          </Button>
        </div>
      </form>
    </section>
  );
}
