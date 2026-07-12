"use client";

import { useState } from "react";
import {
  CheckCircle2,
  Circle,
  Plus,
  RotateCcw,
  Search,
} from "lucide-react";

import type { HeuDemoRole } from "@/lib/demo-role-directory";

type DemoWorkItem = {
  id: string;
  laneIndex: number;
  title: string;
  status: "OPEN" | "DONE";
};

type DemoWorkbenchProps = {
  role: HeuDemoRole;
};

function buildDemoItems(role: HeuDemoRole): DemoWorkItem[] {
  return role.lanes.flatMap((lane, laneIndex) => [
    {
      id: `${role.key}-${laneIndex}-check`,
      laneIndex,
      title: `${lane}: kiểm tra danh sách mẫu`,
      status: "OPEN" as const,
    },
    {
      id: `${role.key}-${laneIndex}-report`,
      laneIndex,
      title: `${lane}: ghi nhận kết quả mô phỏng`,
      status: "OPEN" as const,
    },
  ]);
}

export function DemoWorkbench({ role }: DemoWorkbenchProps) {
  const [items, setItems] = useState(() => buildDemoItems(role));
  const [activeLane, setActiveLane] = useState<number | "all">("all");
  const [query, setQuery] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newLane, setNewLane] = useState("0");

  const normalizedQuery = query.trim().toLocaleLowerCase();
  const visibleItems = items.filter((item) => {
    const matchesLane = activeLane === "all" || item.laneIndex === activeLane;
    const matchesQuery =
      !normalizedQuery || item.title.toLocaleLowerCase().includes(normalizedQuery);
    return matchesLane && matchesQuery;
  });
  const doneCount = items.filter((item) => item.status === "DONE").length;

  function toggleItem(itemId: string) {
    setItems((current) =>
      current.map((item) =>
        item.id === itemId
          ? { ...item, status: item.status === "DONE" ? "OPEN" : "DONE" }
          : item,
      ),
    );
  }

  function addItem(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const title = newTitle.trim();
    if (!title) return;

    setItems((current) => [
      {
        id: `${role.key}-${Date.now()}`,
        laneIndex: Number(newLane),
        title,
        status: "OPEN",
      },
      ...current,
    ]);
    setNewTitle("");
  }

  function resetWorkbench() {
    setItems(buildDemoItems(role));
    setActiveLane("all");
    setQuery("");
    setNewTitle("");
    setNewLane("0");
  }

  return (
    <section
      className="space-y-5"
      aria-labelledby="demo-workbench-title"
      data-heu-demo-workbench="LOCAL_SESSION_ONLY"
    >
      <div className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-mono text-xs font-semibold text-blue-700">
              HEU-FUNC-001 / LOCAL WORKBENCH
            </p>
            <h2 id="demo-workbench-title" className="mt-2 text-xl font-semibold">
              Khu vực thao tác thử nghiệm
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Các thao tác bên dưới có kết quả trong phiên trình duyệt này để bạn
              kiểm tra luồng công việc. Tải lại trang sẽ khôi phục dữ liệu mẫu.
            </p>
          </div>
          <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
            KHÔNG GHI DỮ LIỆU
          </span>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs text-slate-500">Tổng việc</p>
            <p className="mt-1 text-2xl font-semibold">{items.length}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs text-slate-500">Đã hoàn thành</p>
            <p className="mt-1 text-2xl font-semibold text-emerald-700">{doneCount}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs text-slate-500">Đang mở</p>
            <p className="mt-1 text-2xl font-semibold text-amber-700">{items.length - doneCount}</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Tìm trong việc mô phỏng..."
              aria-label="Tìm việc mô phỏng"
              className="h-10 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <button
            type="button"
            onClick={resetWorkbench}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <RotateCcw className="size-4" />
            Đặt lại phiên thử
          </button>
        </div>
        <div className="mt-4 flex gap-2 overflow-x-auto pb-1" aria-label="Lọc theo khu vực">
          <button
            type="button"
            aria-pressed={activeLane === "all"}
            onClick={() => setActiveLane("all")}
            className={`h-9 shrink-0 rounded-lg border px-3 text-sm font-semibold ${activeLane === "all" ? "border-blue-700 bg-blue-700 text-white" : "border-slate-300 text-slate-700 hover:bg-blue-50"}`}
          >
            Tất cả ({items.length})
          </button>
          {role.lanes.map((lane, index) => (
            <button
              key={lane}
              type="button"
              aria-pressed={activeLane === index}
              onClick={() => setActiveLane(index)}
              className={`h-9 shrink-0 rounded-lg border px-3 text-sm font-semibold ${activeLane === index ? "border-blue-700 bg-blue-700 text-white" : "border-slate-300 text-slate-700 hover:bg-blue-50"}`}
            >
              {lane} ({items.filter((item) => item.laneIndex === index).length})
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={addItem} className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <Plus className="size-5 text-blue-700" />
          <h3 className="font-semibold">Tạo việc mô phỏng</h3>
        </div>
        <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_240px_auto]">
          <input
            value={newTitle}
            onChange={(event) => setNewTitle(event.target.value)}
            placeholder="Ví dụ: Kiểm tra hồ sơ mẫu số 01"
            aria-label="Tên việc mô phỏng mới"
            className="h-10 rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
          />
          <select
            value={newLane}
            onChange={(event) => setNewLane(event.target.value)}
            aria-label="Khu vực của việc mô phỏng"
            className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
          >
            {role.lanes.map((lane, index) => (
              <option key={lane} value={index}>
                {lane}
              </option>
            ))}
          </select>
          <button type="submit" className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 text-sm font-bold text-white hover:bg-blue-800">
            <Plus className="size-4" />
            Tạo việc
          </button>
        </div>
      </form>

      <div className="space-y-3" aria-live="polite">
        {visibleItems.map((item) => (
          <article key={item.id} className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-start gap-3">
              {item.status === "DONE" ? <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600" /> : <Circle className="mt-0.5 size-5 shrink-0 text-amber-600" />}
              <div className="min-w-0">
                <p className={`font-semibold ${item.status === "DONE" ? "text-slate-400 line-through" : "text-slate-800"}`}>{item.title}</p>
                <p className="mt-1 text-xs text-slate-500">{role.lanes[item.laneIndex]} · {item.status === "DONE" ? "Đã hoàn thành" : "Đang mở"}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => toggleItem(item.id)}
              className={`inline-flex h-9 shrink-0 items-center justify-center rounded-lg border px-3 text-sm font-semibold ${item.status === "DONE" ? "border-slate-300 text-slate-700 hover:bg-slate-50" : "border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"}`}
            >
              {item.status === "DONE" ? "Mở lại việc" : "Đánh dấu hoàn thành"}
            </button>
          </article>
        ))}
        {visibleItems.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-600">
            Không có việc phù hợp. Hãy đổi bộ lọc hoặc tạo việc mô phỏng mới.
          </div>
        ) : null}
      </div>
    </section>
  );
}
