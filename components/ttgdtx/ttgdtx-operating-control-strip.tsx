import Link from "next/link";
import { ArrowRight, ListChecks, ShieldCheck } from "lucide-react";

import { getTtgdtxOperatingNeighbors } from "@/lib/ttgdtx-operating-controls";

type TtgdtxOperatingControlStripProps = {
  currentCode: string;
};

export function TtgdtxOperatingControlStrip({
  currentCode,
}: TtgdtxOperatingControlStripProps) {
  const { previous, current, next } = getTtgdtxOperatingNeighbors(currentCode);

  if (!current) {
    return null;
  }

  return (
    <section
      className="rounded-lg border border-zinc-200 bg-white p-5 text-sm shadow-sm"
      data-ttgdtx-operating-control={current.code}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 text-zinc-500">
            <ListChecks className="size-4" />
            <span className="text-xs font-medium uppercase">
              Chuỗi vận hành TTGDTX
            </span>
          </div>
          <h2 className="mt-2 text-base font-semibold text-zinc-950">
            {current.label} ({current.code})
          </h2>
          <p className="mt-2 leading-6 text-zinc-600">
            Owner: <span className="font-medium text-zinc-900">{current.owner}</span>.
            Điều kiện trước khi đi tiếp: {current.mustHave.join(", ")}.
          </p>
          <p className="mt-1 leading-6 text-amber-800">
            Nếu thiếu điều kiện, bước này phải chặn: {current.blocks}.
          </p>
        </div>

        <div className="grid min-w-0 gap-2 text-xs sm:grid-cols-3 lg:min-w-[520px]">
          <ControlStep label="Trước" item={previous} />
          <ControlStep label="Đang làm" item={current} active />
          <ControlStep label="Sau" item={next} />
        </div>
      </div>
    </section>
  );
}

function ControlStep({
  label,
  item,
  active = false,
}: {
  label: string;
  item: { code: string; label: string; href: string } | null;
  active?: boolean;
}) {
  if (!item) {
    return (
      <div className="border-l-2 border-zinc-200 py-1 pl-3 text-zinc-500">
        <p className="font-medium">{label}</p>
        <p className="mt-1">Không có</p>
      </div>
    );
  }

  return (
    <Link
      href={item.href}
      className={`border-l-2 py-1 pl-3 transition hover:text-zinc-950 ${
        active
          ? "border-emerald-500 text-emerald-800"
          : "border-zinc-200 text-zinc-700"
      }`}
    >
      <p className="font-medium">{label}</p>
      <p className="mt-1 flex items-center gap-1">
        <span>
          {item.label} ({item.code})
        </span>
        {!active ? <ArrowRight className="size-3 shrink-0" /> : null}
      </p>
      {active ? (
        <p className="mt-1 inline-flex items-center gap-1">
          <ShieldCheck className="size-3" />
          Kiểm soát hiện tại
        </p>
      ) : null}
    </Link>
  );
}
