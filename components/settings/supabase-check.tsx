"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";

import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

type CheckState =
  | { status: "idle"; message: string }
  | { status: "loading"; message: string }
  | { status: "success"; message: string }
  | { status: "error"; message: string };

type UserCreationPreflightItem = {
  code: string;
  label: string;
  status: "READY" | "NO_GO";
  detail: string;
};

type SupabaseCheckProps = {
  serviceRoleKeyConfigured?: boolean;
  userCreationPreflightItems?: UserCreationPreflightItem[];
};

export function SupabaseCheck({
  serviceRoleKeyConfigured = false,
  userCreationPreflightItems = [],
}: SupabaseCheckProps) {
  const [state, setState] = useState<CheckState>({
    status: "idle",
    message: "Bấm nút kiểm tra sau khi đã chạy SQL trong Supabase.",
  });

  async function checkConnection() {
    setState({
      status: "loading",
      message: "Đang kiểm tra kết nối Supabase...",
    });

    const { data, error } = await supabase
      .from("roles")
      .select("code,name")
      .limit(5);

    if (error) {
      setState({
        status: "error",
        message:
          "Chưa đọc được bảng roles. Nếu bạn chưa chạy SQL thì đây là bình thường. Chi tiết: " +
          error.message,
      });
      return;
    }

    setState({
      status: "success",
      message: `Kết nối thành công. Đọc được ${data.length} role từ Supabase.`,
    });
  }

  const Icon =
    state.status === "success"
      ? CheckCircle2
      : state.status === "error"
        ? XCircle
        : state.status === "loading"
          ? Loader2
          : CheckCircle2;
  const userCreationPreflightReady =
    userCreationPreflightItems.length > 0 &&
    userCreationPreflightItems.every((item) => item.status === "READY");

  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="max-w-3xl">
        <h2 className="text-base font-semibold">Kiểm tra Supabase</h2>
        <p className="mt-3 text-sm leading-6 text-zinc-600">
          Trang này dùng để kiểm tra app đã đọc được `.env.local` và có thể gọi
          Supabase hay chưa. Ở bước hiện tại, lỗi phổ biến nhất là chưa chạy các
          file SQL trong thư mục database.
        </p>
      </div>

      <div
        className={`mt-6 rounded-md border p-4 ${
          serviceRoleKeyConfigured
            ? "border-emerald-200 bg-emerald-50"
            : "border-amber-200 bg-amber-50"
        }`}
      >
        <div className="flex items-start gap-3">
          {serviceRoleKeyConfigured ? (
            <CheckCircle2 className="mt-0.5 size-5 text-emerald-600" />
          ) : (
            <XCircle className="mt-0.5 size-5 text-amber-600" />
          )}
          <div className="space-y-2 text-sm leading-6">
            <h3 className="font-semibold text-zinc-950">
              Trạng thái tạo user tự động
            </h3>
            {serviceRoleKeyConfigured ? (
              <p className="text-emerald-800">
                SUPABASE_SERVICE_ROLE_KEY đã được cấu hình trên server. Form tạo
                user sẽ mở khi tài khoản hiện tại có quyền users.create.
              </p>
            ) : (
              <p className="text-amber-800">
                Thiếu SUPABASE_SERVICE_ROLE_KEY trong .env.local nên form tạo
                user tự động đang bị khóa. Lấy key trong Supabase Project
                Settings, dán vào .env.local trên máy/server rồi restart app.
              </p>
            )}
            <p className="text-zinc-600">
              Key này chỉ đọc ở server; không nhập vào UI, không ghi log và
              không gửi qua Codex/chat/email.
            </p>
          </div>
        </div>
      </div>

      {userCreationPreflightItems.length > 0 ? (
        <div className="mt-6 rounded-md border border-zinc-200 bg-zinc-50 p-4">
          <div className="flex items-start gap-3">
            {userCreationPreflightReady ? (
              <CheckCircle2 className="mt-0.5 size-5 text-emerald-600" />
            ) : (
              <XCircle className="mt-0.5 size-5 text-amber-600" />
            )}
            <div>
              <h3 className="font-semibold text-zinc-950">
                Preflight tạo user trong phần mềm
              </h3>
              <p className="mt-1 text-sm leading-6 text-zinc-600">
                Chỉ khi tất cả dòng dưới đây READY thì mới nên tạo user thật.
                Không dán service role key, mật khẩu tạm, OTP hoặc invite link
                vào UI/log/chat.
              </p>
            </div>
          </div>

          <div className="mt-4 divide-y divide-zinc-200 rounded-md border border-zinc-200 bg-white">
            {userCreationPreflightItems.map((item) => (
              <div
                key={item.code}
                className="grid gap-3 p-4 text-sm md:grid-cols-[220px_1fr]"
              >
                <div className="flex items-center gap-2 font-medium text-zinc-950">
                  {item.status === "READY" ? (
                    <CheckCircle2 className="size-4 text-emerald-600" />
                  ) : (
                    <XCircle className="size-4 text-amber-600" />
                  )}
                  <span>{item.label}</span>
                </div>
                <div>
                  <span
                    className={
                      item.status === "READY"
                        ? "font-semibold text-emerald-700"
                        : "font-semibold text-amber-700"
                    }
                  >
                    {item.status}
                  </span>
                  <p className="mt-1 leading-6 text-zinc-600">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mt-6 flex flex-col gap-4 rounded-md border border-zinc-200 bg-zinc-50 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <Icon
            className={`mt-0.5 size-5 ${
              state.status === "success"
                ? "text-emerald-600"
                : state.status === "error"
                  ? "text-rose-600"
                  : "text-zinc-500"
            } ${state.status === "loading" ? "animate-spin" : ""}`}
          />
          <p className="text-sm leading-6 text-zinc-700">{state.message}</p>
        </div>
        <Button onClick={checkConnection} disabled={state.status === "loading"}>
          Kiểm tra kết nối
        </Button>
      </div>
    </section>
  );
}
