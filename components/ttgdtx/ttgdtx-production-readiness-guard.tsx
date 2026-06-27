import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  LockKeyhole,
  Route,
  ShieldAlert,
} from "lucide-react";

import { PRODUCTION_BLOCKERS } from "@/lib/production-readiness";

export function TtgdtxProductionReadinessGuard() {
  return (
    <section
      data-ttgdtx-production-readiness-guard="TTGDTX_9PLUS"
      className="rounded-lg border border-zinc-200 bg-white p-5 text-sm shadow-sm"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex max-w-4xl items-start gap-3">
          <ShieldAlert className="mt-0.5 size-5 shrink-0 text-rose-700" />
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-semibold text-zinc-950">
                Guard Go/No-Go production TTGDTX 9+
              </h2>
              <span className="rounded-md border border-rose-200 bg-rose-50 px-2 py-1 text-xs font-semibold uppercase text-rose-700">
                Production remains NO-GO
              </span>
            </div>
            <p className="mt-2 leading-6 text-zinc-600">
              PASS_LOCAL chỉ có nghĩa là app, tài liệu và audit guard đã sẵn
              sàng cho UAT nội bộ. Guard này render từ cùng nguồn production
              blocker với Master Control và execution queue; PASS_LOCAL không
              phê duyệt production migration, thu/chi tiền, backup, signed UAT
              hoặc ký duyệt của chủ sở hữu.
            </p>
          </div>
        </div>

        <div className="flex min-w-64 items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-amber-900">
          <LockKeyhole className="mt-0.5 size-4 shrink-0" />
          <p>
            Không chạy migration production từ Codex/chat. Không dùng dữ liệu
            thật, mật khẩu, OTP, service key, CCCD, tài khoản ngân hàng hoặc
            file thanh toán thật trong UAT.
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 xl:grid-cols-2">
        {PRODUCTION_BLOCKERS.map((item) => {
          const href = item.href;

          return (
            <div
              key={item.code}
              className="border-l-2 border-rose-200 bg-rose-50/60 px-3 py-3"
            >
              <div className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 size-4 shrink-0 text-rose-700" />
                <div>
                  <p className="text-xs font-semibold uppercase text-rose-700">
                    {item.code}
                  </p>
                  <p className="font-medium text-zinc-950">{item.title}</p>
                  <p className="mt-2 text-xs font-medium text-zinc-500">
                    Owner: {item.owner}
                  </p>
                  <p className="mt-2 leading-5 text-zinc-700">
                    {item.requiredEvidence}
                  </p>
                  {href ? (
                    <Link
                      href={href}
                      className="mt-2 inline-flex items-center gap-1 text-xs font-medium uppercase text-rose-700 hover:text-rose-900"
                    >
                      <Route className="size-3" />
                      Open workflow
                    </Link>
                  ) : (
                    <p className="mt-2 inline-flex items-center gap-1 text-xs font-medium uppercase text-rose-700">
                      <Route className="size-3" />
                      Evidence pack required
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-5 flex items-start gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-800">
        <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
        <p>
          Cách đi tiếp an toàn: chạy audit, dùng synthetic UAT account, ghi
          evidence, có owner ký. Đạt đến đâu commit đến đó; chưa đạt thì giữ
          NO-GO và sửa từng lỗi nhỏ.
        </p>
      </div>
    </section>
  );
}
