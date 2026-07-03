"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AlertCircle, ArrowLeft, KeyRound, Loader2, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

type RecoveryStatus = "checking" | "ready" | "error" | "success";

function authErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    if (
      error.message === "missing_recovery_session" ||
      error.message.toLowerCase().includes("session")
    ) {
      return "Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn. Hãy yêu cầu gửi lại email reset.";
    }

    return error.message;
  }

  return "Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.";
}

export function UpdatePasswordForm() {
  const supabase = useMemo(() => createClient(), []);
  const [status, setStatus] = useState<RecoveryStatus>("checking");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isActive = true;

    async function prepareRecoverySession() {
      const currentUrl = new URL(window.location.href);
      const hashParams = new URLSearchParams(
        window.location.hash.replace(/^#/, ""),
      );
      const urlError =
        currentUrl.searchParams.get("error_description") ??
        currentUrl.searchParams.get("error") ??
        hashParams.get("error_description") ??
        hashParams.get("error");

      if (urlError) {
        if (isActive) {
          setErrorMessage("Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.");
          setStatus("error");
        }

        return;
      }

      try {
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");
        const code = currentUrl.searchParams.get("code");

        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            throw error;
          }
        } else if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);

          if (error) {
            throw error;
          }
        }

        if (accessToken || code) {
          window.history.replaceState(null, "", window.location.pathname);
        }

        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error || !session) {
          throw error ?? new Error("missing_recovery_session");
        }

        if (isActive) {
          setErrorMessage(null);
          setStatus("ready");
        }
      } catch (error) {
        if (isActive) {
          setErrorMessage(authErrorMessage(error));
          setStatus("error");
        }
      }
    }

    prepareRecoverySession();

    return () => {
      isActive = false;
    };
  }, [supabase]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const password = String(formData.get("password") ?? "");
    const confirmPassword = String(formData.get("confirm_password") ?? "");

    if (password.length < 8) {
      setErrorMessage("Mật khẩu mới cần tối thiểu 8 ký tự.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Hai lần nhập mật khẩu chưa khớp.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setIsSubmitting(false);
      setErrorMessage(authErrorMessage(error));
      setStatus("error");
      return;
    }

    await supabase.auth.signOut();
    setStatus("success");
    window.setTimeout(() => {
      window.location.assign("/login?password_reset=done");
    }, 900);
  }

  if (status === "checking") {
    return (
      <div className="flex items-center gap-3 rounded-md border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-600">
        <Loader2 className="size-4 animate-spin" />
        Đang kiểm tra link đặt lại mật khẩu...
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="space-y-4">
        <div className="flex items-start gap-3 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <ShieldCheck className="mt-0.5 size-4" />
          Mật khẩu đã được cập nhật. Hệ thống sẽ chuyển về trang đăng nhập.
        </div>
        <Button asChild variant="outline">
          <Link href="/login?password_reset=done">Về trang đăng nhập</Link>
        </Button>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="space-y-4">
        <div className="flex items-start gap-3 rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <AlertCircle className="mt-0.5 size-4" />
          <span>
            {errorMessage ??
              "Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn."}
          </span>
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium text-zinc-700">
          Mật khẩu mới
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          className="h-10 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm outline-none transition focus:border-zinc-500 focus:ring-3 focus:ring-zinc-200"
          placeholder="Nhập mật khẩu mới"
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="confirm_password"
          className="text-sm font-medium text-zinc-700"
        >
          Nhập lại mật khẩu mới
        </label>
        <input
          id="confirm_password"
          name="confirm_password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          className="h-10 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm outline-none transition focus:border-zinc-500 focus:ring-3 focus:ring-zinc-200"
          placeholder="Nhập lại mật khẩu mới"
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
          <KeyRound className="size-4" />
        )}
        Cập nhật mật khẩu
      </Button>
    </form>
  );
}
