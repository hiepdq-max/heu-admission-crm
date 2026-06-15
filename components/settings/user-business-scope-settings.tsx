import { ShieldCheck } from "lucide-react";

import { updateUserBusinessScopesAction } from "@/app/settings/actions";
import { Button } from "@/components/ui/button";

export type BusinessScopeUserRow = {
  id: string;
  email: string;
  full_name: string;
  role_id: string | null;
  department_id: string | null;
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
  loadError?: string;
  returnPath?: "/settings" | "/settings/scopes";
};

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

export function UserBusinessScopeSettings({
  users,
  roles,
  departments,
  segments,
  partners,
  userSegmentScopes,
  userPartnerScopes,
  loadError,
  returnPath = "/settings",
}: UserBusinessScopeSettingsProps) {
  const roleMap = new Map(roles.map((role) => [role.id, role.name]));
  const departmentMap = new Map(
    departments.map((department) => [department.id, department.name]),
  );
  const segmentScopeMap = toScopeMap(userSegmentScopes, "segment_id");
  const partnerScopeMap = toScopeMap(userPartnerScopes, "partner_id");

  return (
    <section className="rounded-lg border border-zinc-200 bg-white shadow-sm">
      <div className="border-b border-zinc-200 p-5">
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-4 text-zinc-500" />
          <h2 className="text-base font-semibold">Phạm vi làm việc của user</h2>
        </div>
        <p className="mt-1 text-sm text-zinc-500">
          Gán user vào đúng đối tượng tuyển sinh và đúng trung tâm/đối tác.
          Khi user có phạm vi được phân, dữ liệu lead sẽ bị giới hạn theo phạm vi
          đó.
        </p>
      </div>

      {loadError ? (
        <div className="m-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Chưa đọc được bảng phân phạm vi. Hãy chạy file SQL{" "}
          <span className="font-mono">
            database/step38_user_scopes_and_handovers.sql
          </span>{" "}
          trong Supabase SQL Editor. Chi tiết: {loadError}
        </div>
      ) : (
        <div className="space-y-4 p-5">
          {users.map((user) => {
            const selectedSegments = segmentScopeMap.get(user.id) ?? new Set();
            const selectedPartners = partnerScopeMap.get(user.id) ?? new Set();

            return (
              <form
                key={user.id}
                action={updateUserBusinessScopesAction}
                className="rounded-lg border border-zinc-200 bg-zinc-50 p-4"
              >
                <input type="hidden" name="user_id" value={user.id} />
                <input type="hidden" name="return_to" value={returnPath} />
                <div className="flex flex-col gap-3 border-b border-zinc-200 pb-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <h3 className="font-semibold text-zinc-950">
                      {user.full_name}
                    </h3>
                    <p className="mt-1 text-sm text-zinc-500">{user.email}</p>
                    <p className="mt-2 text-xs text-zinc-500">
                      {user.role_id ? roleMap.get(user.role_id) : "Chưa có role"}{" "}
                      ·{" "}
                      {user.department_id
                        ? departmentMap.get(user.department_id)
                        : "Chưa có phòng ban"}{" "}
                      · {user.status}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="rounded-md bg-white px-2 py-1 text-xs font-medium text-zinc-600">
                      {selectedSegments.size} đối tượng · {selectedPartners.size}{" "}
                      đối tác
                    </span>
                    <Button type="submit" size="sm">
                      Lưu phạm vi
                    </Button>
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
            );
          })}
        </div>
      )}
    </section>
  );
}
