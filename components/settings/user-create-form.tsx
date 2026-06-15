import { UserPlus } from "lucide-react";

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
};

type UserCreateFormProps = {
  roles: OptionRow[];
  departments: OptionRow[];
  managers: UserOptionRow[];
  returnPath?: "/settings" | "/settings/scopes";
};

const inputClass =
  "h-10 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm outline-none transition focus:border-zinc-500 focus:ring-3 focus:ring-zinc-200";

export function UserCreateForm({
  roles,
  departments,
  managers,
  returnPath = "/settings",
}: UserCreateFormProps) {
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
              required
              minLength={8}
              className={inputClass}
              placeholder="Tối thiểu 8 ký tự"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="role_id"
              className="text-sm font-medium text-zinc-700"
            >
              Nhiệm vụ/role <span className="text-rose-600">*</span>
            </label>
            <select id="role_id" name="role_id" required className={inputClass}>
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
              htmlFor="department_id"
              className="text-sm font-medium text-zinc-700"
            >
              Phòng ban
            </label>
            <select
              id="department_id"
              name="department_id"
              className={inputClass}
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
            <select id="manager_id" name="manager_id" className={inputClass}>
              <option value="">Chưa gắn người quản lý</option>
              {managers.map((manager) => (
                <option key={manager.id} value={manager.id}>
                  {manager.full_name} - {manager.email}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-800">
          Nếu bấm tạo mà báo thiếu service role key, cần thêm biến
          SUPABASE_SERVICE_ROLE_KEY vào `.env.local` và Vercel Environment
          Variables. Không đưa key này ra trình duyệt.
        </div>

        <div className="flex justify-end">
          <Button type="submit">
            <UserPlus className="size-4" />
            Tạo user
          </Button>
        </div>
      </form>
    </section>
  );
}
