import Link from "next/link";
import { ArrowRight, Search, Workflow } from "lucide-react";

import {
  TTGDTX_PROCESS_LABELS,
  type TtgdtxProcessLabel,
} from "@/lib/ttgdtx-process-labels";

const featuredProcessCodes = [
  "P2-01",
  "P2-02",
  "P2-03",
  "P2-10",
  "P2-13",
  "P2-15",
  "P2-17",
  "P2-18",
  "P2-19",
  "P5-03",
];

const featuredProcesses = featuredProcessCodes
  .map((code) => TTGDTX_PROCESS_LABELS.find((item) => item.code === code))
  .filter((item): item is TtgdtxProcessLabel => Boolean(item));

export function TtgdtxProcessQuickFinder() {
  return (
    <section
      className="rounded-lg border border-zinc-200 bg-white p-5 text-sm shadow-sm"
      data-ttgdtx-process-quick-finder="TTGDTX_9PLUS"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 text-zinc-500">
            <Workflow className="size-4" />
            <span className="text-xs font-medium uppercase">
              Tìm nhanh quy trình TTGDTX
            </span>
          </div>
          <h2 className="mt-2 text-base font-semibold text-zinc-950">
            Chọn theo tên việc trước, mã P2 để đối chiếu sau
          </h2>
          <p className="mt-2 leading-6 text-zinc-600">
            Ví dụ: Thu học phí (P2-10) là màn ghi nhận tiền đã thu, chứng từ
            thu và hóa đơn/chứng từ nếu cần. Có thể tìm bằng: thu hoc phi,
            chung tu thu, hoa don thu tien hoặc P2-10.
          </p>
        </div>

        <form action="/search" className="w-full max-w-md">
          <label
            className="text-xs font-medium uppercase text-zinc-500"
            htmlFor="ttgdtx-process-search"
          >
            Tìm toàn hệ thống
          </label>
          <div className="mt-2 flex min-w-0 items-center rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2">
            <Search className="mr-2 size-4 shrink-0 text-zinc-500" />
            <input
              id="ttgdtx-process-search"
              name="q"
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-zinc-400"
              placeholder="Finance Desk, Thu hoc phi, P2-10"
              type="search"
            />
          </div>
        </form>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {featuredProcesses.map((process) => (
          <Link
            key={process.code}
            href={process.href}
            className="rounded-md border border-zinc-200 bg-zinc-50 p-3 transition hover:border-emerald-300 hover:bg-emerald-50"
            data-ttgdtx-process-quick-finder-item={process.code}
          >
            <p className="flex items-center justify-between gap-3 font-medium text-zinc-950">
              <span>{process.label}</span>
              <ArrowRight className="size-4 shrink-0 text-zinc-500" />
            </p>
            <p className="mt-2 leading-5 text-zinc-600">
              {process.plainMeaning}
            </p>
            <p className="mt-2 text-xs uppercase text-zinc-500">
              Từ khóa: {process.searchTerms.slice(0, 3).join(", ")}
            </p>
          </Link>
        ))}
      </div>

      <p className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 leading-6 text-amber-800">
        PASS_LOCAL only. Bộ tìm nhanh này chỉ hỗ trợ điều hướng và tìm hồ sơ,
        không phê duyệt tài chính, UAT, dữ liệu production hoặc production GO.
      </p>
    </section>
  );
}
