"use client";

import { type FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, MailCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

type ResetState = "idle" | "sent";

function browserSafePasswordRecoveryOrigin() {
  const callbackOrigin = new URL(window.location.origin);

  if (
    callbackOrigin.hostname === "0.0.0.0" ||
    callbackOrigin.hostname === "[::]" ||
    callbackOrigin.hostname === "::"
  ) {
    callbackOrigin.hostname = "localhost";
  }

  return callbackOrigin.origin;
}

function passwordRecoveryRedirectUrl() {
  const callbackUrl = new URL(
    "/auth/callback",
    browserSafePasswordRecoveryOrigin(),
  );
  callbackUrl.searchParams.set("next", "/auth/update-password");
  return callbackUrl.toString();
}

export function ForgotPasswordForm() {
  const supabase = useMemo(() => createClient(), []);
  const [state, setState] = useState<ResetState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "")
      .trim()
      .toLowerCase();

    if (!email) {
      setErrorMessage("Nhập email tài khoản HEU Admission CRM.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: passwordRecoveryRedirectUrl(),
    });

    setIsSubmitting(false);

    if (error) {
      setErrorMessage(
        "Chưa gửi được email đặt lại mật khẩu. Hãy thử lại hoặc liên hệ IT_DATA qua kênh bảo mật.",
      );
      return;
    }

    setState("sent");
  }

  if (state === "sent") {
    return (
      <div
        className="space-y-4"
        data-heu-self-service-password-reset="P0-17_SELF_SERVICE_PASSWORD_RESET"
        data-heu-self-service-password-boundary="NO_RAW_RESET_LINK NO_PASSWORD_CAPTURE NO_CODEX_EMAIL_SEND NO_SCOPE_CHANGE NO_UAT_ACCEPTANCE NO_OWNER_GO NO_PRODUCTION_GO"
      >
        <div className="flex items-start gap-3 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <MailCheck className="mt-0.5 size-4" />
          Nếu email tồn tại trong HEU Admission CRM, hệ thống sẽ gửi liên kết
          đặt lại mật khẩu qua hộp thư của người dùng. Không đưa liên kết, OTP hoặc mật khẩu vào
          Git/Codex/chat.
        </div>
        <Button asChild variant="outline">
          <Link href="/login">
            <ArrowLeft className="size-4" />
            Về trang đăng nhập
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4"
      data-heu-self-service-password-reset="P0-17_SELF_SERVICE_PASSWORD_RESET"
      data-heu-self-service-password-boundary="NO_RAW_RESET_LINK NO_PASSWORD_CAPTURE NO_CODEX_EMAIL_SEND NO_SCOPE_CHANGE NO_UAT_ACCEPTANCE NO_OWNER_GO NO_PRODUCTION_GO"
    >
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium text-zinc-700">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="h-10 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm outline-none transition focus:border-zinc-500 focus:ring-3 focus:ring-zinc-200"
          placeholder="user@heu.edu.vn"
        />
      </div>

      {errorMessage ? (
        <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {errorMessage}
        </div>
      ) : null}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <MailCheck className="size-4" />
        )}
        Gửi email đặt lại mật khẩu
      </Button>

      <Button asChild variant="outline" className="w-full">
        <Link href="/login">
          <ArrowLeft className="size-4" />
          Về trang đăng nhập
        </Link>
      </Button>
    </form>
  );
}
