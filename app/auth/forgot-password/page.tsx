import { redirect } from "next/navigation";

import { ForgotPasswordForm } from "./forgot-password-form";
import { createClient } from "@/lib/supabase/server";

export default async function ForgotPasswordPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/auth/update-password");
  }

  return (
    <main className="min-h-screen bg-zinc-100 px-4 py-10 text-zinc-950">
      <section className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-3xl items-center justify-center">
        <div className="w-full overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm">
          <div className="border-b border-zinc-200 bg-zinc-950 p-8 text-white">
            <div className="flex size-12 items-center justify-center rounded-lg bg-white text-sm font-semibold text-zinc-950">
              HEU
            </div>
            <h1 className="mt-10 text-3xl font-semibold tracking-normal">
              Quên mật khẩu
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-300">
              Tự gửi email đặt lại mật khẩu về hộp thư đã đăng ký với HEU Admission CRM.
            </p>
          </div>

          <div className="p-6 sm:p-8">
            <ForgotPasswordForm />
          </div>
        </div>
      </section>
    </main>
  );
}
