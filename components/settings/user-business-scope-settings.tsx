"use client";

import { useState } from "react";
import { ShieldCheck, UserCog } from "lucide-react";

import {
  updateUserBusinessScopesAction,
  updateUserProfileAction,
} from "@/app/settings/actions";
import { Button } from "@/components/ui/button";

export type BusinessScopeUserRow = {
  id: string;
  email: string;
  full_name: string;
  role_id: string | null;
  department_id: string | null;
  manager_id: string | null;
  status: string;
};

export type BusinessScopeRoleRow = {
  id: string;
  code: string;
  name: string;
};

export type BusinessScopeDepartmentRow = {
  id: string;
  name: string;
};

export type UserSegmentScopeRow = {
  user_id: string;
  segment_id: string;
};

export type UserPartnerScopeRow = {
  user_id: string;
  partner_id: string;
};

export type UserLeadVisibilityScopeRow = {
  user_id: string;
  lead_visibility: string;
};

export type ScopeOptionRow = {
  id: string;
  label: string;
  group?: string | null;
};

type UserBusinessScopeSettingsProps = {
  users: BusinessScopeUserRow[];
  roles: BusinessScopeRoleRow[];
  departments: BusinessScopeDepartmentRow[];
  segments: ScopeOptionRow[];
  partners: ScopeOptionRow[];
  userSegmentScopes: UserSegmentScopeRow[];
  userPartnerScopes: UserPartnerScopeRow[];
  userLeadVisibilityScopes: UserLeadVisibilityScopeRow[];
  loadError?: string;
  returnPath?: "/settings" | "/settings/scopes";
  canManageUserProfiles?: boolean;
  canAssignAllLeadVisibility?: boolean;
};

const selectClass =
  "h-10 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm outline-none transition focus:border-zinc-500 focus:ring-3 focus:ring-zinc-200";

const departmentManagerRoleCodes = new Set([
  "ADMISSION_HEAD",
  "ACCOUNTING_LEAD",
  "CTHSSV_LEAD",
  "TEAM_LEAD",
]);

const leadVisibilityOptions = [
  {
    value: "OWN",
    label: "Chỉ lead của mình",
    description: "User chỉ thấy lead do mình tạo hoặc đang được gán xử lý.",
  },
  {
    value: "TEAM",
    label: "Lead của mình và cấp dưới",
    description: "Dùng cho trưởng nhóm hoặc người quản lý trực tiếp.",
  },
  {
    value: "DEPARTMENT",
    label: "Lead cùng phòng ban",
    description: "Dùng cho trưởng phòng xem đúng phần việc của phòng.",
  },
  {
    value: "ALL",
    label: "Toàn hệ thống",
    description: "Chỉ ADMIN nên dùng cho tài khoản quản trị đặc biệt.",
  },
];

function toScopeMap<T extends { user_id: string }>(
  rows: T[],
  valueKey: keyof T,
) {
  const map = new Map<string, Set<string>>();

  for (const row of rows) {
    const current = map.get(row.user_id) ?? new Set<string>();
    current.add(String(row[valueKey]));
    map.set(row.user_id, current);
  }

  return map;
}

function isDepartmentHeadRole(role: BusinessScopeRoleRow | undefined) {
  if (!role) {
    return false;
  }

  const normalizedName = role.name.toLowerCase();

  return (
    departmentManagerRoleCodes.has(role.code) ||
    role.code.endsWith("_HEAD") ||
    role.code.endsWith("_LEAD") ||
    normalizedName.includes("truong phong") ||
    normalizedName.includes("truong nhom") ||
    normalizedName.includes("trưởng phòng") ||
    normalizedName.includes("trưởng nhóm")
  );
}

function isStaffRole(role: BusinessScopeRoleRow | undefined) {
  if (!role) {
    return false;
  }

  return !["ADMIN", "BGH"].includes(role.code) && !isDepartmentHeadRole(role);
}

function defaultLeadVisibilityForRole(role: BusinessScopeRoleRow | undefined) {
  if (!role) {
    return "OWN";
  }

  if (["ADMIN", "BGH"].includes(role.code)) {
    return "ALL";
  }

  if (isDepartmentHeadRole(role)) {
    return "DEPARTMENT";
  }

  if (role.code === "TEAM_LEAD") {
    return "TEAM";
  }

  return "OWN";
}

function labelFromMap(map: Map<string, string>, id: string | null) {
  return id ? map.get(id) ?? "Chưa rõ" : "Chưa gắn";
}

export function UserBusinessScopeSettings({
  users,
  roles,
  departments,
  segments,
  partners,
  userSegmentScopes,
  userPartnerScopes,
  userLeadVisibilityScopes,
  loadError,
  returnPath = "/settings",
  canManageUserProfiles = false,
  canAssignAllLeadVisibility = false,
}: UserBusinessScopeSettingsProps) {
  const [selectedUserId, setSelectedUserId] = useState(users[0]?.id ?? "");
  const selectedUser = users.find((user) => user.id === selectedUserId) ?? null;
  const [draftRoleId, setDraftRoleId] = useState(selectedUser?.role_id ?? "");
  const [draftDepartmentId, setDraftDepartmentId] = useState(
    selectedUser?.department_id ?? "",
  );
  const [draftManagerId, setDraftManagerId] = useState(
    selectedUser?.manager_id ?? "",
  );
  const roleMap = new Map(roles.map((role) => [role.id, role.name]));
  const departmentMap = new Map(
    departments.map((department) => [department.id, department.name]),
  );
  const userMap = new Map(users.map((user) => [user.id, user.full_name]));
  const segmentScopeMap = toScopeMap(userSegmentScopes, "segment_id");
  const partnerScopeMap = toScopeMap(userPartnerScopes, "partner_id");
  const leadVisibilityMap = new Map(
    userLeadVisibilityScopes.map((scope) => [
      scope.user_id,
      scope.lead_visibility,
    ]),
  );
  const selectedSegments = selectedUser
    ? segmentScopeMap.get(selectedUser.id) ?? new Set<string>()
    : new Set<string>();
  const selectedPartners = selectedUser
    ? partnerScopeMap.get(selectedUser.id) ?? new Set<string>()
    : new Set<string>();
  const draftRole = roles.find((role) => role.id === draftRoleId);
  const effectiveLeadVisibility = selectedUser
    ? leadVisibilityMap.get(selectedUser.id) ??
      defaultLeadVisibilityForRole(
        roles.find((role) => role.id === selectedUser.role_id),
      )
    : "OWN";
  const staffRole = isStaffRole(draftRole);
  const departmentHeads = users.filter((candidate) => {
    const role = roles.find((item) => item.id === candidate.role_id);

    return (
      candidate.id !== selectedUser?.id &&
      candidate.department_id === draftDepartmentId &&
      isDepartmentHeadRole(role)
    );
  });
  const sameDepartmentOthers = users.filter((candidate) => {
    const role = roles.find((item) => item.id === candidate.role_id);

    return (
      candidate.id !== selectedUser?.id &&
      candidate.department_id === draftDepartmentId &&
      !isDepartmentHeadRole(role)
    );
  });
  const organizationManagers = users.filter((candidate) => {
    const role = roles.find((item) => item.id === candidate.role_id);

    return (
      candidate.id !== selectedUser?.id &&
      (["ADMIN", "BGH"].includes(role?.code ?? "") ||
        isDepartmentHeadRole(role))
    );
  });
  const managerOptions = draftDepartmentId
    ? staffRole
      ? departmentHeads.length > 0
        ? departmentHeads
        : [
            ...sameDepartmentOthers,
            ...organizationManagers.filter(
              (candidate) => candidate.department_id !== draftDepartmentId,
            ),
          ]
      : [...departmentHeads, ...sameDepartmentOthers]
    : users.filter((candidate) => candidate.id !== selectedUser?.id);

  function firstDepartmentHeadId(departmentId: string, userId: string) {
    return (
      users.find((candidate) => {
        const role = roles.find((item) => item.id === candidate.role_id);

        return (
          candidate.id !== userId &&
          candidate.department_id === departmentId &&
          isDepartmentHeadRole(role)
        );
      })?.id ?? ""
    );
  }

  function handleSelectedUserChange(userId: string) {
    const nextUser = users.find((user) => user.id === userId) ?? null;

    setSelectedUserId(userId);
    setDraftRoleId(nextUser?.role_id ?? "");
    setDraftDepartmentId(nextUser?.department_id ?? "");
    setDraftManagerId(nextUser?.manager_id ?? "");
  }

  function handleDraftRoleChange(roleId: string) {
    const nextRole = roles.find((role) => role.id === roleId);

    setDraftRoleId(roleId);

    if (isStaffRole(nextRole) && selectedUser) {
      setDraftManagerId(firstDepartmentHeadId(draftDepartmentId, selectedUser.id));
    }
  }

  function handleDraftDepartmentChange(departmentId: string) {
    setDraftDepartmentId(departmentId);

    if (staffRole && selectedUser) {
      setDraftManagerId(firstDepartmentHeadId(departmentId, selectedUser.id));
    }
  }

  return (
    <section className="rounded-lg border border-zinc-200 bg-white shadow-sm">
      <div className="border-b border-zinc-200 p-5">
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-4 text-zinc-500" />
          <h2 className="text-base font-semibold">Phạm vi làm việc của user</h2>
        </div>
        <p className="mt-1 text-sm leading-6 text-zinc-500">
          Chọn user trước, kiểm tra phòng ban/nhiệm vụ, sau đó mới phân đối
          tượng tuyển sinh và trung tâm/đối tác được phép làm việc.
        </p>
      </div>

      {loadError ? (
        <div className="m-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Chưa đọc được bảng phân phạm vi. Hãy chạy file SQL{" "}
          <span className="font-mono">
            database/step38_user_scopes_and_handovers.sql
          </span>{" "}
          và nếu đang thiếu mức hiển thị lead thì chạy thêm{" "}
          <span className="font-mono">
            database/step40_user_lead_visibility.sql
          </span>{" "}
          trong Supabase SQL Editor. Chi tiết: {loadError}
        </div>
      ) : (
        <div className="space-y-5 p-5">
          {users.length === 0 ? (
            <div className="rounded-md border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-500">
              Chưa có user để phân việc. ADMIN cần tạo user trước.
            </div>
          ) : (
            <>
              <div className="rounded-md border border-zinc-200 bg-zinc-50 p-4">
                <label
                  htmlFor="selected-user"
                  className="text-sm font-medium text-zinc-700"
                >
                  Bước 1 - Chọn user cần phân công
                </label>
                <select
                  id="selected-user"
                  value={selectedUserId}
                  onChange={(event) => handleSelectedUserChange(event.target.value)}
                  className={`${selectClass} mt-2`}
                >
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.full_name} - {user.email}
                    </option>
                  ))}
                </select>
              </div>

              {selectedUser ? (
                <>
                  <div className="rounded-md border border-zinc-200 p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-zinc-100">
                        <UserCog className="size-4 text-zinc-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-zinc-950">
                          Bước 2 - Phòng ban và nhiệm vụ
                        </h3>
                        <p className="mt-1 text-sm text-zinc-500">
                          User: {selectedUser.full_name} ·{" "}
                          {labelFromMap(roleMap, selectedUser.role_id)} ·{" "}
                          {labelFromMap(
                            departmentMap,
                            selectedUser.department_id,
                          )}{" "}
                          · Quản lý:{" "}
                          {labelFromMap(userMap, selectedUser.manager_id)}
                        </p>
                      </div>
                    </div>

                    {canManageUserProfiles ? (
                      <form
                        key={`assignment-${selectedUser.id}`}
                        action={updateUserProfileAction}
                        className="mt-4 grid gap-3 lg:grid-cols-[1fr_1fr_1fr_160px_auto]"
                      >
                        <input
                          type="hidden"
                          name="user_id"
                          value={selectedUser.id}
                        />
                        <input type="hidden" name="return_to" value={returnPath} />
                        <select
                          name="role_id"
                          className={selectClass}
                          value={draftRoleId}
                          onChange={(event) =>
                            handleDraftRoleChange(event.target.value)
                          }
                        >
                          <option value="">Chọn nhiệm vụ/role</option>
                          {roles.map((role) => (
                            <option key={role.id} value={role.id}>
                              {role.name}
                            </option>
                          ))}
                        </select>
                        <select
                          name="department_id"
                          className={selectClass}
                          value={draftDepartmentId}
                          onChange={(event) =>
                            handleDraftDepartmentChange(event.target.value)
                          }
                        >
                          <option value="">Chọn phòng ban</option>
                          {departments.map((department) => (
                            <option key={department.id} value={department.id}>
                              {department.name}
                            </option>
                          ))}
                        </select>
                        <select
                          name="manager_id"
                          className={selectClass}
                          value={draftManagerId}
                          onChange={(event) =>
                            setDraftManagerId(event.target.value)
                          }
                        >
                          <option value="">Chọn quản lý trực tiếp</option>
                          {draftDepartmentId &&
                          staffRole &&
                          departmentHeads.length === 0 ? (
                            <option value="" disabled>
                              Chưa có Trưởng phòng cùng phòng ban
                            </option>
                          ) : null}
                          {managerOptions.map((manager) => (
                            <option key={manager.id} value={manager.id}>
                              {manager.full_name}
                            </option>
                          ))}
                        </select>
                        <select
                          name="status"
                          className={selectClass}
                          defaultValue={selectedUser.status}
                        >
                          <option value="ACTIVE">ACTIVE</option>
                          <option value="INACTIVE">INACTIVE</option>
                        </select>
                        <Button type="submit">Lưu phân công</Button>
                        {staffRole ? (
                          <p className="lg:col-span-5 text-xs leading-5 text-amber-700">
                            Đối với nhân viên/trưởng nhóm, người quản lý trực
                            tiếp là Trưởng phòng cùng phòng ban. Nếu danh sách
                            chưa có Trưởng phòng, hãy tạo hoặc gán role Trưởng
                            phòng cho user phù hợp trước.
                          </p>
                        ) : null}
                      </form>
                    ) : (
                      <div className="mt-4 rounded-md border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-600">
                        Bạn chỉ được phân phạm vi làm việc cho cấp dưới cùng
                        phòng. Việc đổi role/phòng ban do ADMIN thực hiện.
                      </div>
                    )}
                  </div>

                  <form
                    key={`scope-${selectedUser.id}`}
                    action={updateUserBusinessScopesAction}
                    className="rounded-md border border-zinc-200 p-4"
                  >
                    <input type="hidden" name="user_id" value={selectedUser.id} />
                    <input type="hidden" name="return_to" value={returnPath} />

                    <div className="flex flex-col gap-3 border-b border-zinc-200 pb-4 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <h3 className="font-semibold text-zinc-950">
                          Bước 3 - Phân việc theo đối tượng/công việc
                        </h3>
                        <p className="mt-1 text-sm text-zinc-500">
                          Tích đúng nhóm tuyển sinh và đúng trung tâm/đối tác.
                          Nếu bỏ trống toàn bộ, user sẽ theo quy tắc role cũ.
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-600">
                          {selectedSegments.size} đối tượng ·{" "}
                          {selectedPartners.size} đối tác
                        </span>
                        <Button type="submit">Lưu phạm vi</Button>
                      </div>
                    </div>

                    <div className="mt-4 rounded-md border border-zinc-200 bg-zinc-50 p-3">
                      <label
                        htmlFor={`lead-visibility-${selectedUser.id}`}
                        className="text-xs font-semibold uppercase text-zinc-500"
                      >
                        Mức hiển thị lead
                      </label>
                      <select
                        id={`lead-visibility-${selectedUser.id}`}
                        name="lead_visibility"
                        defaultValue={effectiveLeadVisibility}
                        className={`${selectClass} mt-2`}
                      >
                        {leadVisibilityOptions
                          .filter(
                            (option) =>
                              option.value !== "ALL" ||
                              canAssignAllLeadVisibility,
                          )
                          .map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                      </select>
                      <p className="mt-2 text-xs leading-5 text-zinc-500">
                        Nếu user vẫn thấy thông tin của người khác, chọn
                        &quot;Chỉ lead của mình&quot;. Phạm vi đối tượng/đối tác
                        bên dưới vẫn được áp dụng song song.
                      </p>
                      <div className="mt-2 grid gap-2 text-xs text-zinc-500 sm:grid-cols-2">
                        {leadVisibilityOptions
                          .filter(
                            (option) =>
                              option.value !== "ALL" ||
                              canAssignAllLeadVisibility,
                          )
                          .map((option) => (
                            <div
                              key={option.value}
                              className="rounded border border-zinc-200 bg-white p-2"
                            >
                              <span className="font-medium text-zinc-700">
                                {option.label}
                              </span>
                              <span className="mt-1 block">
                                {option.description}
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>

                    <div className="mt-4 grid gap-4 xl:grid-cols-2">
                      <fieldset className="rounded-md border border-zinc-200 bg-white p-3">
                        <legend className="px-1 text-xs font-semibold uppercase text-zinc-500">
                          Đối tượng tuyển sinh được làm
                        </legend>
                        <div className="mt-2 grid gap-2 sm:grid-cols-2">
                          {segments.map((segment) => (
                            <label
                              key={segment.id}
                              className="flex items-start gap-2 rounded-md p-2 text-sm hover:bg-zinc-50"
                            >
                              <input
                                type="checkbox"
                                name="segment_ids"
                                value={segment.id}
                                defaultChecked={selectedSegments.has(segment.id)}
                                className="mt-1 size-4"
                              />
                              <span>
                                <span className="block font-medium text-zinc-900">
                                  {segment.label}
                                </span>
                                {segment.group ? (
                                  <span className="block text-xs text-zinc-500">
                                    {segment.group}
                                  </span>
                                ) : null}
                              </span>
                            </label>
                          ))}
                        </div>
                      </fieldset>

                      <fieldset className="rounded-md border border-zinc-200 bg-white p-3">
                        <legend className="px-1 text-xs font-semibold uppercase text-zinc-500">
                          Trung tâm/đối tác được làm
                        </legend>
                        <div className="mt-2 grid max-h-80 gap-2 overflow-y-auto sm:grid-cols-2">
                          {partners.map((partner) => (
                            <label
                              key={partner.id}
                              className="flex items-start gap-2 rounded-md p-2 text-sm hover:bg-zinc-50"
                            >
                              <input
                                type="checkbox"
                                name="partner_ids"
                                value={partner.id}
                                defaultChecked={selectedPartners.has(partner.id)}
                                className="mt-1 size-4"
                              />
                              <span>
                                <span className="block font-medium text-zinc-900">
                                  {partner.label}
                                </span>
                                {partner.group ? (
                                  <span className="block text-xs text-zinc-500">
                                    {partner.group}
                                  </span>
                                ) : null}
                              </span>
                            </label>
                          ))}
                        </div>
                      </fieldset>
                    </div>
                  </form>
                </>
              ) : null}
            </>
          )}
        </div>
      )}
    </section>
  );
}
