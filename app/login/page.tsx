import Link from "next/link";
import { redirect } from "next/navigation";

import { LoginForm } from "@/components/auth/login-form";
import { isHeuDemoRoleLoginEnabled } from "@/lib/demo-role-directory";
import { createClient } from "@/lib/supabase/server";

export default async function LoginPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/");
  }

  const demoEnabled = isHeuDemoRoleLoginEnabled();

  return (
    <main className="min-h-screen bg-zinc-100 px-4 py-10 text-zinc-950">
      <section className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-5xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm lg:grid-cols-[1fr_420px]">
          <div className="hidden bg-zinc-950 p-10 text-white lg:block">
            <div className="flex size-12 items-center justify-center rounded-lg bg-white text-sm font-semibold text-zinc-950">
              HEU
            </div>
            <div className="mt-24 max-w-md">
              <h1 className="text-3xl font-semibold tracking-normal">
                HEU Admission CRM
              </h1>
              <p className="mt-4 text-sm leading-6 text-zinc-300">
                Đăng nhập để quản lý lead tuyển sinh, follow-up, hồ sơ nhập học,
                báo cáo và audit log theo đúng phân quyền.
              </p>
            </div>
          </div>

          <div className="p-6 sm:p-10">
            <div className="mb-8">
              <h2 className="text-2xl font-semibold tracking-normal">
                Đăng nhập
              </h2>
              <p className="mt-2 text-sm text-zinc-500">
                Sử dụng tài khoản được tạo trong Supabase Auth.
              </p>
            </div>
            <LoginForm />
            {demoEnabled ? (
              <div className="mt-5 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm">
                <p className="font-semibold text-blue-950">Cần kiểm tra giao diện nhanh?</p>
                <p className="mt-1 text-xs leading-5 text-blue-900/75">
                  Demo nội bộ chỉ dùng dữ liệu giả lập, không cần mật khẩu và không đăng nhập vào hệ thống thật.
                </p>
                <Link
                  href="/demo"
                  className="mt-3 inline-flex font-semibold text-blue-700 underline-offset-4 hover:underline"
                >
                  Mở 7 vai trò demo read-only
                </Link>
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </main>
  );
}
