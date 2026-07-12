"use client";

import { useMemo, useState } from "react";
import {
  CheckCircle2,
  KeyRound,
  Mail,
  Search,
  ShieldCheck,
  UserCheck,
  UsersRound,
} from "lucide-react";

import {
  assignHeuPositionByEmailAction,
  sendUserPasswordResetEmailAction,
  setUserTemporaryPasswordAction,
} from "@/app/settings/actions";
import { Button } from "@/components/ui/button";

export type HeuPositionMatrixStatusRow = {
  id: string;
  position_code: string;
  position_name: string;
  position_group: string;
  department_code: string;
  department_name: string | null;
  default_role_code: string;
  default_role_name: string | null;
  reports_to_position_code: string | null;
  reports_to_position_name: string | null;
  seat_order: number;
  required_assignment: boolean;
  control_status: string;
  status: string;
  permission_count: number;
  active_assignment_id: string | null;
  assigned_full_name: string | null;
  assigned_email: string | null;
  assignment_state: string;
};

export type PositionAssignmentUserOption = {
  id: string;
  full_name: string;
  email: string;
  status: string;
};

type PositionAssignmentMatrixProps = {
  rows: HeuPositionMatrixStatusRow[];
  users: PositionAssignmentUserOption[];
  canManageAssignments: boolean;
  canManagePasswords: boolean;
  hasServiceRoleKey: boolean;
  returnPath?: "/settings" | "/settings/scopes";
  loadError?: string;
};

const inputClass =
  "h-9 w-full rounded-md border border-zinc-300 bg-white px-2 text-sm outline-none transition focus:border-zinc-500 focus:ring-3 focus:ring-zinc-200";

const groupOrder = [
  "BGH",
  "DAO_TAO",
  "TUYEN_SINH",
  "CTHSSV",
  "KHTC",
  "PHAP_CHE",
  "AUDIT",
  "IT_DATA",
  "KHOA",
  "NGAN_HAN",
  "TCHC",
  "TO_CHUC_NHAN_SU",
  "HR",
];

const groupLabels: Record<string, string> = {
  BGH: "BGH",
  DAO_TAO: "Đào tạo",
  TUYEN_SINH: "Tuyển sinh",
  CTHSSV: "CTHSSV",
  KHTC: "Kế toán",
  PHAP_CHE: "Pháp chế",
  AUDIT: "Audit",
  IT_DATA: "IT/Data",
  KHOA: "Khoa",
  TCHC: "TCHC",
  TO_CHUC_NHAN_SU: "TCHC",
  NGAN_HAN: "Ngắn hạn",
  HR: "Tổ chức",
};

const assignmentStateLabels: Record<string, string> = {
  ASSIGNED: "Đã gán",
  NEEDS_USER: "Cần người",
  READY_EMPTY: "Ghế dự phòng",
};

function groupLabel(value: string) {
  return groupLabels[value] ?? value;
}

function assignmentStateLabel(value: string) {
  return assignmentStateLabels[value] ?? value;
}

function assignmentStateClass(value: string) {
  if (value === "ASSIGNED") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (value === "NEEDS_USER") {
    return "border-amber-200 bg-amber-50 text-amber-800";
  }

  return "border-zinc-200 bg-zinc-50 text-zinc-600";
}

const legacyTchcPositionDisplay: Record<
  string,
  { code: string; name: string }
> = {
  HR_HEAD: {
    code: "TCHC_HEAD",
    name: "Truong phong To chuc hanh chinh",
  },
  HR_01: {
    code: "TCHC_01",
    name: "To chuc hanh chinh 01",
  },
  HR_02: {
    code: "TCHC_02",
    name: "To chuc hanh chinh 02",
  },
  HR_03: {
    code: "TCHC_03",
    name: "To chuc hanh chinh 03",
  },
};

function displayPositionCode(value: string | null) {
  if (!value) {
    return null;
  }

  return legacyTchcPositionDisplay[value]?.code ?? value;
}

function displayPositionName(row: Pick<HeuPositionMatrixStatusRow, "position_code" | "position_name">) {
  return legacyTchcPositionDisplay[row.position_code]?.name ?? row.position_name;
}

function displayRoleCode(value: string) {
  if (value === "HR_LEAD") {
    return "TCHC_LEAD";
  }

  if (value === "HR") {
    return "TCHC";
  }

  return value;
}

function displayRoleName(row: Pick<HeuPositionMatrixStatusRow, "default_role_code" | "default_role_name">) {
  if (row.default_role_code === "HR_LEAD") {
    return "Truong phong To chuc hanh chinh";
  }

  if (row.default_role_code === "HR") {
    return "Nhan su To chuc hanh chinh";
  }

  return row.default_role_name ?? row.default_role_code;
}

function displayDepartmentName(row: Pick<HeuPositionMatrixStatusRow, "department_code" | "department_name" | "position_group">) {
  if (
    row.department_code === "HR" ||
    row.department_code === "TCHC" ||
    row.position_group === "TO_CHUC_NHAN_SU" ||
    row.position_group === "TCHC"
  ) {
    return "Phong To chuc hanh chinh (TCHC)";
  }

  return row.department_name ?? row.department_code;
}

function normalizeSearch(value: string) {
  return value.trim().toLowerCase();
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
    <article className="min-w-0 overflow-hidden rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex min-w-0 items-center justify-between gap-3">
        <span
          className={`inline-flex max-w-full truncate rounded-md border px-2 py-1 text-xs font-medium ${tone}`}
        >
          {label}
        </span>
        <Icon className="size-4 shrink-0 text-zinc-400" />
      </div>
      <p className="mt-3 truncate text-2xl font-semibold text-zinc-950">
        {value}
      </p>
    </article>
  );
}

export function PositionAssignmentMatrix({
  rows,
  users,
  canManageAssignments,
  canManagePasswords,
  hasServiceRoleKey,
  returnPath = "/settings/scopes",
  loadError,
}: PositionAssignmentMatrixProps) {
  const [selectedGroup, setSelectedGroup] = useState("ALL");
  const [query, setQuery] = useState("");
  const sortedRows = useMemo(
    () =>
      [...rows].sort((left, right) => {
        const leftGroup = groupOrder.indexOf(left.position_group);
        const rightGroup = groupOrder.indexOf(right.position_group);
        const groupCompare =
          (leftGroup === -1 ? 99 : leftGroup) -
          (rightGroup === -1 ? 99 : rightGroup);

        if (groupCompare !== 0) {
          return groupCompare;
        }

        return left.seat_order - right.seat_order;
      }),
    [rows],
  );
  const availableGroups = useMemo(
    () =>
      Array.from(new Set(sortedRows.map((row) => row.position_group))).sort(
        (left, right) =>
          (groupOrder.indexOf(left) === -1 ? 99 : groupOrder.indexOf(left)) -
          (groupOrder.indexOf(right) === -1 ? 99 : groupOrder.indexOf(right)),
      ),
    [sortedRows],
  );
  const normalizedQuery = normalizeSearch(query);
  const filteredRows = sortedRows.filter((row) => {
    const matchesGroup =
      selectedGroup === "ALL" || row.position_group === selectedGroup;
    const haystack = [
      row.position_code,
      displayPositionCode(row.position_code),
      row.position_name,
      displayPositionName(row),
      row.department_name,
      displayDepartmentName(row),
      row.default_role_name,
      row.default_role_code,
      displayRoleName(row),
      displayRoleCode(row.default_role_code),
      row.assigned_full_name,
      row.assigned_email,
      row.reports_to_position_code,
      displayPositionCode(row.reports_to_position_code),
      row.reports_to_position_name,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return matchesGroup && (!normalizedQuery || haystack.includes(normalizedQuery));
  });
  const assignedCount = rows.filter(
    (row) => row.assignment_state === "ASSIGNED",
  ).length;
  const requiredMissingCount = rows.filter(
    (row) => row.assignment_state === "NEEDS_USER",
  ).length;
  const readyEmptyCount = rows.filter(
    (row) => row.assignment_state === "READY_EMPTY",
  ).length;
  const activeUsers = users.filter((user) => user.status === "ACTIVE");

  return (
    <section
      id="position-matrix"
      data-heu-position-assignment-matrix="P0-17"
      data-heu-position-matrix-overflow-guard="P0-17_NO_OVERFLOW"
      data-heu-position-matrix-quick-access="P0-17_POSITION_QUICK_ACCESS"
      data-heu-position-matrix-quick-access-overflow-guard="P0-17_POSITION_QUICK_ACCESS_NO_OVERFLOW"
      data-heu-position-group-filters="ALL BGH DAO_TAO TUYEN_SINH CTHSSV KHTC PHAP_CHE AUDIT IT_DATA KHOA NGAN_HAN HR"
      data-heu-position-group-labels="TCHC TO_CHUC_NHAN_SU_LEGACY HR_TECH_LEGACY"
      className="min-w-0 overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm"
    >
      <div className="border-b border-zinc-200 p-5">
        <div className="flex min-w-0 flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex min-w-0 items-center gap-2">
              <ShieldCheck className="size-4 shrink-0 text-zinc-500" />
              <h2 className="truncate text-base font-semibold text-zinc-950">
                Ma trận vị trí và user
              </h2>
            </div>
            <p className="mt-1 max-w-3xl break-words text-sm leading-6 text-zinc-500">
              Gán email đã có trong Auth/profile vào vị trí chuẩn để hệ tự động
              đồng bộ role, phòng ban và người quản lý trực tiếp.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2 text-xs font-medium">
            <span className="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1 text-zinc-600">
              Step 114
            </span>
            <span className="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1 text-zinc-600">
              PASS_LOCAL
            </span>
          </div>
        </div>
      </div>

      <div className="min-w-0 space-y-5 p-5">
        {loadError ? (
          <div className="min-w-0 break-words rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            Không tải được ma trận vị trí. Mã kiểm soát:
            POSITION_MATRIX_VIEW_UNAVAILABLE.
          </div>
        ) : null}

        <div
          data-heu-one-account-one-position="ENFORCED"
          data-heu-position-smart-mode="DRAFT_CHECK_SUGGEST_ONLY"
          data-heu-position-activation-flow="AUTH_BANNED ASSIGN_POSITION ACTIVATE_PROFILE SEND_RESET_EMAIL UNBAN_ON_SUCCESS"
          className="rounded-lg border border-sky-200 bg-sky-50 p-4 text-sm text-sky-950"
        >
          <h3 className="font-semibold">
            Một tài khoản vận hành = một vị trí ACTIVE
          </h3>
          <p className="mt-1 leading-6 text-sky-900">
            Người kiêm nhiệm dùng tài khoản vận hành riêng cho từng vị trí; hệ
            thống không cộng dồn quyền BGH, Trưởng phòng hoặc nhân viên vào một
            tài khoản. Trình tự pilot: provision INACTIVE, lưu scope, chuyển
            ACTIVE khi chưa có credential, gắn vị trí, rồi mới gửi email đặt
            mật khẩu.
          </p>
          <p className="mt-2 text-xs leading-5 text-sky-800">
            Smart quản trị đi theo đúng vị trí và scope: chỉ kiểm tra, gợi ý,
            soạn nháp; không tự ghi dữ liệu thật, phê duyệt, gửi email, chi tiền
            hoặc mở production.
          </p>
        </div>

        <div className="grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Tổng vị trí"
            value={rows.length}
            tone="border-sky-200 bg-sky-50 text-sky-700"
            icon={UsersRound}
          />
          <StatCard
            label="Đã gán user"
            value={assignedCount}
            tone="border-emerald-200 bg-emerald-50 text-emerald-700"
            icon={CheckCircle2}
          />
          <StatCard
            label="Cần gán"
            value={requiredMissingCount}
            tone="border-amber-200 bg-amber-50 text-amber-800"
            icon={UserCheck}
          />
          <StatCard
            label="Ghế dự phòng"
            value={readyEmptyCount}
            tone="border-zinc-200 bg-zinc-50 text-zinc-700"
            icon={ShieldCheck}
          />
        </div>

        <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
          <div className="min-w-0 space-y-3">
            <div className="flex min-w-0 flex-col gap-3 lg:flex-row lg:items-center">
              <label className="relative block min-w-0 flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
                <span className="sr-only">Tìm vị trí hoặc user</span>
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  className="h-9 w-full rounded-md border border-zinc-300 bg-white pl-9 pr-3 text-sm outline-none transition focus:border-zinc-500 focus:ring-3 focus:ring-zinc-200"
                  placeholder="Tìm theo vị trí, email, phòng ban"
                />
              </label>
              <div className="flex min-w-0 flex-wrap gap-2 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setSelectedGroup("ALL")}
                  className={`max-w-full truncate rounded-md border px-3 py-2 text-xs font-medium transition ${
                    selectedGroup === "ALL"
                      ? "border-zinc-900 bg-zinc-900 text-white"
                      : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"
                  }`}
                >
                  Tất cả
                </button>
                {availableGroups.map((group) => (
                  <button
                    key={group}
                    type="button"
                    onClick={() => setSelectedGroup(group)}
                    className={`max-w-full truncate rounded-md border px-3 py-2 text-xs font-medium transition ${
                      selectedGroup === group
                        ? "border-zinc-900 bg-zinc-900 text-white"
                        : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"
                    }`}
                  >
                    {groupLabel(group)}
                  </button>
                ))}
              </div>
            </div>

            <datalist id="heu-position-user-email-options">
              {activeUsers.map((user) => (
                <option key={user.id} value={user.email}>
                  {user.full_name}
                </option>
              ))}
            </datalist>

            <div className="min-w-0 overflow-x-auto rounded-lg border border-zinc-200">
              <table className="w-full min-w-[1180px] text-sm">
                <thead className="bg-zinc-50 text-left text-xs font-medium uppercase text-zinc-500">
                  <tr>
                    <th className="px-4 py-3">Vị trí</th>
                    <th className="px-4 py-3">Role/Phòng</th>
                    <th className="px-4 py-3">Quản lý</th>
                    <th className="px-4 py-3">User đang gán</th>
                    <th className="px-4 py-3">Gán nhanh</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {filteredRows.length === 0 ? (
                    <tr>
                      <td className="px-4 py-6 text-center text-zinc-500" colSpan={5}>
                        Chưa có vị trí phù hợp bộ lọc.
                      </td>
                    </tr>
                  ) : (
                    filteredRows.map((row) => (
                      <tr key={row.id} className="align-top">
                        <td className="px-4 py-4">
                          <p className="font-semibold text-zinc-950">
                            {displayPositionName(row)}
                          </p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            <span className="rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-700">
                              {displayPositionCode(row.position_code)}
                            </span>
                            <span className="rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-700">
                              {groupLabel(row.position_group)}
                            </span>
                            <span
                              className={`rounded-md border px-2 py-1 text-xs font-medium ${assignmentStateClass(
                                row.assignment_state,
                              )}`}
                            >
                              {assignmentStateLabel(row.assignment_state)}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <p className="font-medium text-zinc-900">
                            {displayRoleName(row)}
                          </p>
                          <p className="mt-1 text-xs text-zinc-500">
                            {displayRoleCode(row.default_role_code)}
                          </p>
                          <p className="mt-2 text-sm text-zinc-700">
                            {displayDepartmentName(row)}
                          </p>
                          <p className="mt-1 text-xs text-zinc-500">
                            {row.permission_count} quyền mặc định
                          </p>
                        </td>
                        <td className="px-4 py-4 text-zinc-700">
                          {row.reports_to_position_name ? (
                            <>
                              <p>
                                {row.reports_to_position_code
                                  ? (legacyTchcPositionDisplay[
                                      row.reports_to_position_code
                                    ]?.name ?? row.reports_to_position_name)
                                  : row.reports_to_position_name}
                              </p>
                              <p className="mt-1 text-xs text-zinc-500">
                                {displayPositionCode(row.reports_to_position_code)}
                              </p>
                            </>
                          ) : (
                            <span className="text-zinc-500">Cấp cao nhất</span>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          {row.assigned_email ? (
                            <>
                              <p className="font-medium text-zinc-950">
                                {row.assigned_full_name ?? row.assigned_email}
                              </p>
                              <p className="mt-1 text-zinc-500">{row.assigned_email}</p>
                            </>
                          ) : (
                            <span className="text-zinc-500">Chưa gán user</span>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <form
                            action={assignHeuPositionByEmailAction}
                            className="grid gap-2 md:grid-cols-[220px_1fr_auto]"
                          >
                            <input type="hidden" name="return_to" value={returnPath} />
                            <input
                              type="hidden"
                              name="position_code"
                              value={row.position_code}
                            />
                            <input
                              name="email"
                              type="email"
                              list="heu-position-user-email-options"
                              className={inputClass}
                              placeholder="user@heuschool.edu.vn"
                              defaultValue={row.assigned_email ?? ""}
                              disabled={!canManageAssignments}
                              required
                            />
                            <input
                              name="assignment_note"
                              className={inputClass}
                              placeholder="Ghi chú"
                              disabled={!canManageAssignments}
                            />
                            <Button
                              type="submit"
                              size="sm"
                              disabled={!canManageAssignments}
                            >
                              Gán
                            </Button>
                          </form>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <aside
            id="position-password"
            className="min-w-0 space-y-4 overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50 p-4"
          >
            <div>
              <div className="flex min-w-0 items-center gap-2">
                <KeyRound className="size-4 shrink-0 text-zinc-500" />
                <h3 className="text-sm font-semibold text-zinc-950">
                  Mật khẩu và truy cập
                </h3>
              </div>
              <p className="mt-1 break-words text-xs leading-5 text-zinc-500">
                Chỉ xử lý cho email đã có profile. Không hiển thị, không log và
                không gửi mật khẩu thô qua chat/email thường.
              </p>
            </div>

            <form
              action={setUserTemporaryPasswordAction}
              className="min-w-0 space-y-3 overflow-hidden rounded-lg border border-zinc-200 bg-white p-4"
            >
              <input type="hidden" name="return_to" value={returnPath} />
              <div className="space-y-2">
                <label
                  htmlFor="set-password-email"
                  className="text-xs font-medium text-zinc-700"
                >
                  Email user
                </label>
                <input
                  id="set-password-email"
                  name="email"
                  type="email"
                  list="heu-position-user-email-options"
                  className={inputClass}
                  placeholder="user@heuschool.edu.vn"
                  disabled={!canManagePasswords || !hasServiceRoleKey}
                  required
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="set-password-value"
                  className="text-xs font-medium text-zinc-700"
                >
                  Mật khẩu tạm mới
                </label>
                <input
                  id="set-password-value"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  className={inputClass}
                  placeholder="Tối thiểu 8 ký tự"
                  disabled={!canManagePasswords || !hasServiceRoleKey}
                  required
                />
              </div>
              <Button
                type="submit"
                size="sm"
                disabled={!canManagePasswords || !hasServiceRoleKey}
              >
                Đặt mật khẩu tạm
              </Button>
              {!hasServiceRoleKey ? (
                <p className="text-xs leading-5 text-amber-700">
                  Thiếu SUPABASE_SERVICE_ROLE_KEY nên không thể đặt mật khẩu từ app.
                </p>
              ) : null}
            </form>

            <form
              action={sendUserPasswordResetEmailAction}
              className="min-w-0 space-y-3 overflow-hidden rounded-lg border border-zinc-200 bg-white p-4"
            >
              <input type="hidden" name="return_to" value={returnPath} />
              <div className="flex min-w-0 items-center gap-2">
                <Mail className="size-4 shrink-0 text-zinc-500" />
                <p className="text-sm font-medium text-zinc-950">
                  Email đặt lại mật khẩu
                </p>
              </div>
              <input
                name="email"
                type="email"
                list="heu-position-user-email-options"
                className={inputClass}
                placeholder="user@heuschool.edu.vn"
                disabled={!canManagePasswords}
                required
              />
              <Button
                type="submit"
                size="sm"
                variant="outline"
                disabled={!canManagePasswords}
              >
                Gửi email reset
              </Button>
            </form>
          </aside>
        </div>
      </div>
    </section>
  );
}
