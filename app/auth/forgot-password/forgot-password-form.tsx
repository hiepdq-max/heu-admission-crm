"use client";

import Link from "next/link";
import { useActionState } from "react";
import { ArrowLeft, Loader2, MailCheck } from "lucide-react";

import {
  requestPasswordRecoveryAction,
  type ForgotPasswordState,
} from "./actions";
import { Button } from "@/components/ui/button";

const initialState: ForgotPasswordState = {};
const genericRecoveryMessage =
  "Nếu tài khoản đủ điều kiện khôi phục, hệ thống sẽ gửi hướng dẫn đến email đã đăng ký.";

export function ForgotPasswordForm() {
  const [state, formAction, isPending] = useActionState(
    requestPasswordRecoveryAction,
    initialState,
  );

  if (state.submitted) {
    return (
      <div className="space-y-4" data-heu-recovery-response="GENERIC_ALWAYS">
        <div className="flex items-start gap-3 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <MailCheck className="mt-0.5 size-4 shrink-0" />
          {genericRecoveryMessage}
        </div>
        <Button asChild variant="outline" className="w-full">
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
      action={formAction}
      className="space-y-4"
      data-heu-recovery-gate="ACTIVE_PROFILE DEPARTMENT EXACTLY_ONE_ACTIVE_ASSIGNED_POSITION"
      data-heu-recovery-boundary="SERVER_ONLY_SERVICE_ROLE NO_EMAIL_ENUMERATION NO_REAL_EMAIL_TEST AI_AUTOMATION_NO_GO PRODUCTION_NO_GO"
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
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? <Loader2 className="size-4 animate-spin" /> : <MailCheck className="size-4" />}
        Gửi yêu cầu khôi phục
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
