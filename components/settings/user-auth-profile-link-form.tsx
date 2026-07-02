"use client";

import { useState } from "react";
import { ClipboardCheck, Link2, ShieldAlert } from "lucide-react";

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

const financeDayOneManualLinkChecks = [
  {
    code: "FIN-LINK-01",
    title: "Manual Auth user already exists",
    detail:
      "Admin/IT_DATA creates or invites the real accounting user in Supabase Auth through an approved secure channel before this form is used.",
  },
  {
    code: "FIN-LINK-02",
    title: "Safe account label only",
    detail:
      "Record only redacted labels such as REAL_KHTC_TTGDTX_OPERATOR_01, owner, department, role and scope; never paste passwords, OTPs, reset links or invite links.",
  },
  {
    code: "FIN-LINK-03",
    title: "Run P6-04 before finance routes",
    detail:
      "After linking the HEU profile, run the Finance Day-1 P6-04 pre-login matrix before P2-18, P5-03 or P2-17 is opened for real use.",
  },
  {
    code: "FIN-LINK-04",
    title: "Stop on broad or unsigned access",
    detail:
      "Stop if scope is broad, owner approval is missing, negative-control access is not blocked or any secret appears in evidence.",
  },
];

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

        <div
          className="rounded-md border border-indigo-200 bg-indigo-50 p-3 text-sm leading-6 text-indigo-950"
          data-heu-finance-day-one-manual-auth-link="P0-17-P6-04"
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-center gap-2 font-semibold">
              <ClipboardCheck className="size-4 text-indigo-700" />
              Finance Day-1 accounting user manual Auth link
            </div>
            <span className="rounded-md border border-indigo-200 bg-white px-2 py-1 text-xs font-medium text-indigo-900">
              Decision: FIN_MANUAL_LINK_READY / NO_GO / BLOCKED
            </span>
          </div>
          <p className="mt-2">
            Use this handoff only after the real accounting account was created
            or invited outside Codex/chat. This form links the Auth user to HEU
            profile, department, manager and role; it does not collect
            credentials, activate access by itself, approve UAT, approve
            finance reliance or mark production GO.
          </p>
          <div className="mt-3 grid gap-2 lg:grid-cols-4">
            {financeDayOneManualLinkChecks.map((item) => (
              <article
                key={item.code}
                className="border-l-2 border-indigo-300 bg-white px-3 py-2"
              >
                <p className="text-xs font-semibold uppercase text-indigo-700">
                  {item.code}
                </p>
                <p className="mt-1 font-medium text-zinc-950">{item.title}</p>
                <p className="mt-2 text-xs text-zinc-700">{item.detail}</p>
              </article>
            ))}
          </div>
          <div className="mt-3 flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
            <ShieldAlert className="mt-0.5 size-4 shrink-0" />
            <p>
              Stop before submit if a password, temporary password, OTP,
              password reset link, account activation/invite link, service-role
              key, raw PII, bank data or voucher appears in this form,
              screenshot, evidence note or Codex/chat.
            </p>
          </div>
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
