"use client";

import { useActionState } from "react";
import { useState } from "react";
import Link from "next/link";
import { ChevronRight, Loader2, LogIn, ShieldCheck } from "lucide-react";

import { loginAction, type LoginState } from "@/app/login/actions";
import { Button } from "@/components/ui/button";
import { getHeuPilotAccountDirectory } from "@/lib/pilot-account-directory";

const initialState: LoginState = {};

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [state, formAction, isPending] = useActionState(
    loginAction,
    initialState,
  );
  const pilotAccounts = getHeuPilotAccountDirectory();

  return (
    <form action={formAction} className="space-y-4">
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
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="h-10 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm outline-none transition focus:border-zinc-500 focus:ring-3 focus:ring-zinc-200"
          placeholder="admin@heu.edu.vn"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium text-zinc-700">
          Mật khẩu
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="h-10 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm outline-none transition focus:border-zinc-500 focus:ring-3 focus:ring-zinc-200"
          placeholder="Nhập mật khẩu"
        />
      </div>

      {state.error ? (
        <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {state.error}
        </div>
      ) : null}

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <LogIn className="size-4" />
        )}
        Đăng nhập
      </Button>
      {pilotAccounts.length > 0 ? (
        <section className="border-t border-zinc-200 pt-5" aria-label="Pilot accounts">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-zinc-900">Tai khoan pilot</p>
              <p className="mt-1 text-xs leading-5 text-zinc-500">
                Chon tai khoan de dien email. Mat khau khong duoc luu hoac hien thi.
              </p>
            </div>
            <ShieldCheck className="size-4 shrink-0 text-emerald-600" />
          </div>
          <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
            {pilotAccounts.map((account) => (
              <button
                key={account.id}
                type="button"
                onClick={() => setEmail(account.email)}
                className="group flex w-full items-center justify-between gap-3 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-3 text-left transition hover:border-zinc-400 hover:bg-white focus:outline-none focus:ring-3 focus:ring-zinc-200"
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-zinc-900">
                    {account.displayName}
                  </span>
                  <span className="mt-1 block truncate text-xs text-zinc-500">
                    {account.email}
                  </span>
                  <span className="mt-1 block text-xs text-zinc-600">
                    {account.roleLabel} - {account.scopeLabel}
                  </span>
                </span>
                <ChevronRight className="size-4 shrink-0 text-zinc-400 transition group-hover:translate-x-0.5 group-hover:text-zinc-900" />
              </button>
            ))}
          </div>
        </section>
      ) : null}

      <div className="text-center text-sm">
        <Link href="/auth/forgot-password" className="font-medium text-zinc-600 underline-offset-4 hover:text-zinc-950 hover:underline">
          Quên mật khẩu?
        </Link>
      </div>
    </form>
  );
}
