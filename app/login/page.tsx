import { redirect } from "next/navigation";

import { LoginForm } from "@/components/auth/login-form";
import { createClient } from "@/lib/supabase/server";

export default async function LoginPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/");
  }

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
          </div>
        </div>
      </section>
    </main>
  );
}
