"use client";

import { useState } from "react";
import {
  Building2,
  ChevronRight,
  CircleUserRound,
  Search,
  ShieldCheck,
  UsersRound,
} from "lucide-react";

import type { HeuPositionMatrixStatusRow } from "@/components/settings/position-assignment-matrix";

type UserRow = {
  id: string;
  email: string;
  full_name: string;
  role_id: string | null;
  department_id: string | null;
  manager_id: string | null;
  status: string;
};

type RoleRow = {
  id: string;
  code: string;
  name: string;
};

type DepartmentRow = {
  id: string;
  code?: string;
  name: string;
  status?: string;
};

type DepartmentUserDirectoryProps = {
  users: UserRow[];
  roles: RoleRow[];
  departments: DepartmentRow[];
  positions: HeuPositionMatrixStatusRow[];
};

const moduleByDepartment: Record<string, string> = {
  BGH: "Dashboard & điều hành",
  KHTC: "Tài chính & công nợ",
  TCHC: "Tổ chức & hành chính",
  TO_CHUC_NHAN_SU: "Tổ chức & nhân sự",
  TUYEN_SINH: "Tuyển sinh",
  CTHSSV: "Công tác HSSV",
  DAO_TAO: "Đào tạo",
  KHOA: "Khoa chuyên môn",
  PHAP_CHE: "Pháp chế",
  AUDIT: "Audit & kiểm soát",
  IT_DATA: "Hệ thống & dữ liệu",
  NGAN_HAN: "Đào tạo ngắn hạn",
};

function normalized(value: string) {
  return value.trim().toLocaleLowerCase("vi-VN");
}

export function DepartmentUserDirectory({
  users,
  roles,
  departments,
  positions,
}: DepartmentUserDirectoryProps) {
  const activeDepartments = departments.filter(
    (department) => department.status !== "INACTIVE",
  );
  const initialDepartmentId =
    activeDepartments.find((department) =>
      users.some((user) => user.department_id === department.id),
    )?.id ??
    activeDepartments[0]?.id ??
    "UNASSIGNED";
  const [selectedDepartmentId, setSelectedDepartmentId] = useState(
    initialDepartmentId,
  );
  const [query, setQuery] = useState("");
  const roleById = new Map(roles.map((role) => [role.id, role]));
  const userById = new Map(users.map((user) => [user.id, user]));
  const positionByEmail = new Map(
    positions
      .filter((position) => position.assigned_email)
      .map((position) => [normalized(position.assigned_email ?? ""), position]),
  );
  const unassignedCount = users.filter((user) => !user.department_id).length;
  const selectedDepartment = activeDepartments.find(
    (department) => department.id === selectedDepartmentId,
  );
  const queryValue = normalized(query);
  const departmentUsers = users
    .filter((user) =>
      selectedDepartmentId === "UNASSIGNED"
        ? !user.department_id
        : user.department_id === selectedDepartmentId,
    )
    .filter((user) => {
      if (!queryValue) return true;
      const role = user.role_id ? roleById.get(user.role_id) : null;
      return normalized(
        [user.full_name, user.email, role?.name ?? "", role?.code ?? ""].join(
          " ",
        ),
      ).includes(queryValue);
    })
    .sort((left, right) => {
      const leftRole = left.role_id ? roleById.get(left.role_id) : null;
      const rightRole = right.role_id ? roleById.get(right.role_id) : null;
      const leftLead = /(_HEAD|_LEAD|ADMIN|BGH)$/.test(leftRole?.code ?? "");
      const rightLead = /(_HEAD|_LEAD|ADMIN|BGH)$/.test(rightRole?.code ?? "");
      if (leftLead !== rightLead) return leftLead ? -1 : 1;
      return left.full_name.localeCompare(right.full_name, "vi");
    });

  return (
    <section
      className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm"
      data-heu-department-user-directory="DEPARTMENT_POSITION_USER"
    >
      <div className="border-b border-zinc-200 bg-[linear-gradient(120deg,#f8fafc_0%,#ffffff_55%,#eff6ff_100%)] p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">
              <Building2 className="size-4" />
              Sơ đồ quản trị HEU
            </div>
            <h2 className="text-xl font-semibold text-zinc-950">
              Phòng ban, mô-đun và người sử dụng
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-600">
              Chọn một phòng để xem đúng user, vị trí, role và tuyến quản lý. Dữ
              liệu hiển thị tuân theo phạm vi của tài khoản đang đăng nhập.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="rounded-lg border border-zinc-200 bg-white px-3 py-2">
              <strong className="block text-lg text-zinc-950">
                {activeDepartments.length}
              </strong>
              Phòng
            </div>
            <div className="rounded-lg border border-zinc-200 bg-white px-3 py-2">
              <strong className="block text-lg text-zinc-950">
                {users.length}
              </strong>
              User
            </div>
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-amber-800">
              <strong className="block text-lg">{unassignedCount}</strong>
              Chưa gán
            </div>
          </div>
        </div>
      </div>

      <div className="grid min-h-[460px] lg:grid-cols-[310px_minmax(0,1fr)]">
        <aside className="border-b border-zinc-200 bg-zinc-50 p-3 lg:border-r lg:border-b-0">
          <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Kiến trúc mô-đun
          </p>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
            {activeDepartments.map((department) => {
              const count = users.filter(
                (user) => user.department_id === department.id,
              ).length;
              const selected = selectedDepartmentId === department.id;
              return (
                <button
                  key={department.id}
                  type="button"
                  onClick={() => setSelectedDepartmentId(department.id)}
                  className={`flex items-center justify-between gap-3 rounded-lg border px-3 py-3 text-left transition ${
                    selected
                      ? "border-blue-700 bg-blue-700 text-white shadow-sm"
                      : "border-zinc-200 bg-white text-zinc-800 hover:border-blue-300"
                  }`}
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold">
                      {department.name}
                    </span>
                    <span
                      className={`mt-1 block truncate text-xs ${
                        selected ? "text-blue-100" : "text-zinc-500"
                      }`}
                    >
                      {department.code
                        ? moduleByDepartment[department.code] ?? department.code
                        : "Mô-đun nghiệp vụ"}
                    </span>
                  </span>
                  <span
                    className={`rounded-md px-2 py-1 text-xs font-semibold ${
                      selected ? "bg-white/15" : "bg-zinc-100"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
            {unassignedCount > 0 ? (
              <button
                type="button"
                onClick={() => setSelectedDepartmentId("UNASSIGNED")}
                className={`flex items-center justify-between gap-3 rounded-lg border px-3 py-3 text-left transition ${
                  selectedDepartmentId === "UNASSIGNED"
                    ? "border-amber-600 bg-amber-600 text-white"
                    : "border-amber-200 bg-amber-50 text-amber-900"
                }`}
              >
                <span>
                  <span className="block text-sm font-semibold">Chưa gán phòng</span>
                  <span className="mt-1 block text-xs opacity-80">
                    Cần ADMIN xử lý
                  </span>
                </span>
                <span className="rounded-md bg-white/20 px-2 py-1 text-xs font-semibold">
                  {unassignedCount}
                </span>
              </button>
            ) : null}
          </div>
        </aside>

        <div className="min-w-0 p-4 sm:p-6">
          <div className="flex flex-col gap-4 border-b border-zinc-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                {selectedDepartment?.code ?? "DEPARTMENT"}
              </p>
              <h3 className="mt-1 text-lg font-semibold text-zinc-950">
                {selectedDepartment?.name ?? "User chưa gán phòng ban"}
              </h3>
              <p className="mt-1 text-sm text-zinc-500">
                {selectedDepartment
                  ? selectedDepartment.code
                    ? moduleByDepartment[selectedDepartment.code] ??
                      "Mô-đun nghiệp vụ"
                    : "Mô-đun nghiệp vụ"
                  : "Cần hoàn thiện phòng, vị trí và người quản lý"}
              </p>
            </div>
            <label className="relative block w-full sm:max-w-xs">
              <Search className="pointer-events-none absolute top-2.5 left-3 size-4 text-zinc-400" />
              <span className="sr-only">Tìm user trong phòng</span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Tìm tên, email hoặc role"
                className="h-10 w-full rounded-lg border border-zinc-300 bg-white pr-3 pl-9 text-sm outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
              />
            </label>
          </div>

          {departmentUsers.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-8 text-center">
              <UsersRound className="size-8 text-zinc-400" />
              <p className="mt-3 font-semibold text-zinc-800">
                Không có user phù hợp
              </p>
              <p className="mt-1 text-sm text-zinc-500">
                Kiểm tra từ khóa hoặc tạo/gán user cho phòng này.
              </p>
            </div>
          ) : (
            <div className="mt-5 grid gap-3 xl:grid-cols-2">
              {departmentUsers.map((user) => {
                const role = user.role_id ? roleById.get(user.role_id) : null;
                const manager = user.manager_id
                  ? userById.get(user.manager_id)
                  : null;
                const position = positionByEmail.get(normalized(user.email));
                const leadRole = /(_HEAD|_LEAD|ADMIN|BGH)$/.test(
                  role?.code ?? "",
                );
                return (
                  <article
                    key={user.id}
                    className={`rounded-xl border p-4 ${
                      leadRole
                        ? "border-blue-200 bg-blue-50/60"
                        : "border-zinc-200 bg-white"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-start gap-3">
                        <span
                          className={`grid size-10 shrink-0 place-items-center rounded-lg ${
                            leadRole
                              ? "bg-blue-700 text-white"
                              : "bg-zinc-100 text-zinc-600"
                          }`}
                        >
                          {leadRole ? (
                            <ShieldCheck className="size-5" />
                          ) : (
                            <CircleUserRound className="size-5" />
                          )}
                        </span>
                        <div className="min-w-0">
                          <h4 className="truncate font-semibold text-zinc-950">
                            {user.full_name}
                          </h4>
                          <p className="mt-1 truncate text-xs text-zinc-500">
                            {user.email}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`shrink-0 rounded-md px-2 py-1 text-[11px] font-semibold ${
                          user.status === "ACTIVE"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {user.status}
                      </span>
                    </div>
                    <dl className="mt-4 grid gap-2 text-xs sm:grid-cols-2">
                      <div className="rounded-lg bg-white/80 p-3">
                        <dt className="text-zinc-500">Vị trí</dt>
                        <dd className="mt-1 font-medium text-zinc-900">
                          {position?.position_name ?? "Chưa gán vị trí chuẩn"}
                        </dd>
                      </div>
                      <div className="rounded-lg bg-white/80 p-3">
                        <dt className="text-zinc-500">Role</dt>
                        <dd className="mt-1 font-medium text-zinc-900">
                          {role?.name ?? "Chưa gán role"}
                        </dd>
                      </div>
                      <div className="rounded-lg bg-white/80 p-3 sm:col-span-2">
                        <dt className="text-zinc-500">Quản lý trực tiếp</dt>
                        <dd className="mt-1 font-medium text-zinc-900">
                          {manager?.full_name ?? "Chưa gán người quản lý"}
                        </dd>
                      </div>
                    </dl>
                  </article>
                );
              })}
            </div>
          )}

          <div className="mt-5 flex flex-col gap-3 rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-600 sm:flex-row sm:items-center sm:justify-between">
            <span>
              Thay đổi user, vị trí và phạm vi được thực hiện tại khu vực kiểm
              soát bên dưới.
            </span>
            <a
              href="#user-scope-management"
              className="inline-flex items-center gap-2 font-semibold text-blue-700 hover:text-blue-900"
            >
              Mở quản trị chi tiết
              <ChevronRight className="size-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
