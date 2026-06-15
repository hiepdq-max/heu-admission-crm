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

export function SupabaseCheck() {
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
