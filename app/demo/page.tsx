import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, ShieldCheck } from "lucide-react";

import {
  getHeuDemoRole,
  getHeuDemoRoleDirectory,
  isHeuDemoRoleLoginEnabled,
} from "@/lib/demo-role-directory";

type DemoPageProps = {
  searchParams?: Promise<{ role?: string | string[] }>;
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function DemoPage({ searchParams }: DemoPageProps) {
  if (!isHeuDemoRoleLoginEnabled()) {
    notFound();
  }

  const params = searchParams ? await searchParams : {};
  const roles = getHeuDemoRoleDirectory();
  const selectedRole = getHeuDemoRole(firstParam(params.role));

  return (
    <main
      className="min-h-screen bg-slate-100 px-4 py-6 text-slate-950 sm:px-6 lg:px-10"
      data-heu-demo-mode="READ_ONLY"
      data-heu-demo-source="SYNTHETIC_METADATA_ONLY"
    >
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-blue-100 bg-white px-5 py-4 shadow-sm">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-blue-700 px-3 py-1 text-xs font-bold text-white">
                HEU DEMO
              </span>
              <span className="rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
                READ_ONLY
              </span>
            </div>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight">
              Kiểm tra nhanh theo vai trò
            </h1>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">
              Bản mô phỏng để kiểm tra giao diện và ranh giới phòng ban. Không
              phải phiên đăng nhập, không đọc Supabase và không ghi dữ liệu.
            </p>
          </div>
          <Link
            href="/login"
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <ArrowLeft className="size-4" />
            Đăng nhập thật
          </Link>
        </header>

        <section className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <aside className="rounded-2xl border border-blue-100 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <ShieldCheck className="size-5 text-blue-700" />
              <h2 className="font-semibold">7 vai trò mô phỏng</h2>
            </div>
            <div className="space-y-2" aria-label="Chọn vai trò demo">
              {roles.map((role) => (
                <Link
                  key={role.key}
                  href={`/demo?role=${role.key}`}
                  aria-current={role.key === selectedRole.key ? "page" : undefined}
                  className={`block rounded-xl border px-3 py-3 transition ${
                    role.key === selectedRole.key
                      ? "border-blue-700 bg-blue-700 text-white shadow-sm"
                      : "border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50"
                  }`}
                >
                  <span className="block text-sm font-semibold">{role.title}</span>
                  <span
                    className={`mt-1 block text-xs ${
                      role.key === selectedRole.key ? "text-blue-100" : "text-slate-500"
                    }`}
                  >
                    {role.department}
                  </span>
                </Link>
              ))}
            </div>
          </aside>

          <section className="space-y-6">
            <div className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-mono text-xs font-semibold text-blue-700">
                    DEMO_ROLE / {selectedRole.roleCode}
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold">{selectedRole.title}</h2>
                  <p className="mt-2 text-sm text-slate-600">
                    {selectedRole.department} · {selectedRole.scope}
                  </p>
                </div>
                <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                  KHÔNG GHI DỮ LIỆU
                </span>
              </div>
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {selectedRole.lanes.map((lane) => (
                  <article key={lane} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm font-semibold text-slate-800">{lane}</p>
                    <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                      <CheckCircle2 className="size-4 text-blue-600" />
                      3 mục mô phỏng
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950">
              <p className="font-semibold">Ranh giới kiểm thử</p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>Không tạo user, không kiểm tra mật khẩu và không tạo session.</li>
                <li>Không mở dashboard thật, tài chính thật, hồ sơ thật hoặc thao tác duyệt.</li>
                <li>Muốn kiểm tra Auth/RBAC/RLS thật phải dùng tài khoản Supabase được cấp riêng.</li>
              </ul>
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}
