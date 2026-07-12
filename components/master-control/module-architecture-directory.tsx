"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Bot,
  Boxes,
  Database,
  GitBranch,
  Search,
  ShieldCheck,
} from "lucide-react";

import type { HeuOsModuleReadinessRow } from "@/components/master-control/module-readiness-overview";
import {
  aiGateStatusLabel,
  aiGateStatusTone,
  moduleDisplay,
  readinessStatusLabel,
  readinessStatusTone,
} from "@/lib/heu-os-display";

type ModuleArchitectureDirectoryProps = {
  rows: HeuOsModuleReadinessRow[];
  loadError?: string;
};

function normalized(value: string) {
  return value.trim().toLocaleLowerCase("vi-VN");
}

export function ModuleArchitectureDirectory({
  rows,
  loadError,
}: ModuleArchitectureDirectoryProps) {
  const groups = Array.from(new Set(rows.map((row) => row.module_group))).sort(
    (left, right) => left.localeCompare(right, "vi"),
  );
  const [selectedGroup, setSelectedGroup] = useState("ALL");
  const [query, setQuery] = useState("");
  const queryValue = normalized(query);
  const visibleRows = rows
    .filter(
      (row) => selectedGroup === "ALL" || row.module_group === selectedGroup,
    )
    .filter((row) => {
      if (!queryValue) return true;
      return normalized(
        [
          row.module_code,
          row.module_name,
          row.module_group,
          row.owner_department ?? "",
        ].join(" "),
      ).includes(queryValue);
    })
    .sort((left, right) => left.module_code.localeCompare(right.module_code));
  const aiLockedCount = rows.filter(
    (row) => row.ai_gate_status === "AI_LOCKED",
  ).length;
  const attentionCount = rows.filter(
    (row) => row.readiness_status !== "READY",
  ).length;

  if (loadError) {
    return (
      <section className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
        Chưa đọc được registry kiến trúc mô-đun. Không tự tạo dữ liệu thay thế.
        Chi tiết: {loadError}
      </section>
    );
  }

  return (
    <section
      className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm"
      data-heu-module-architecture-directory="METADATA_DRIVEN_ROLE_SCOPED_READ_ONLY"
      data-heu-module-ai-boundary="DRAFT_CHECK_SUGGEST_ONLY"
    >
      <div className="border-b border-zinc-200 bg-[linear-gradient(125deg,#eff6ff_0%,#ffffff_55%,#f8fafc_100%)] p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">
              <Boxes className="size-4" />
              Kiến trúc modular monolith
            </div>
            <h2 className="mt-2 text-xl font-semibold text-zinc-950">
              Sơ đồ mô-đun HEU
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-600">
              Một app chính, một database chung. Mỗi mô-đun có owner, dữ liệu,
              workflow, điểm duyệt, rủi ro và AI gate riêng để dễ truy cập và tự
              động hóa có kiểm soát.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="rounded-lg border border-zinc-200 bg-white px-3 py-2">
              <strong className="block text-lg text-zinc-950">{rows.length}</strong>
              Mô-đun
            </div>
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-amber-900">
              <strong className="block text-lg">{attentionCount}</strong>
              Cần xử lý
            </div>
            <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-blue-900">
              <strong className="block text-lg">{aiLockedCount}</strong>
              AI khóa
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="border-b border-zinc-200 bg-zinc-50 p-3 lg:border-r lg:border-b-0">
          <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Nhóm kiến trúc
          </p>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
            <button
              type="button"
              onClick={() => setSelectedGroup("ALL")}
              className={`flex items-center justify-between rounded-lg border px-3 py-3 text-left text-sm font-semibold transition ${
                selectedGroup === "ALL"
                  ? "border-blue-700 bg-blue-700 text-white"
                  : "border-zinc-200 bg-white text-zinc-800 hover:border-blue-300"
              }`}
            >
              Toàn bộ hệ thống
              <span className="rounded-md bg-black/5 px-2 py-1 text-xs">
                {rows.length}
              </span>
            </button>
            {groups.map((group) => {
              const count = rows.filter(
                (row) => row.module_group === group,
              ).length;
              const selected = selectedGroup === group;
              return (
                <button
                  key={group}
                  type="button"
                  onClick={() => setSelectedGroup(group)}
                  className={`flex items-center justify-between gap-3 rounded-lg border px-3 py-3 text-left transition ${
                    selected
                      ? "border-blue-700 bg-blue-700 text-white"
                      : "border-zinc-200 bg-white text-zinc-800 hover:border-blue-300"
                  }`}
                >
                  <span className="truncate text-sm font-semibold">{group}</span>
                  <span
                    className={`rounded-md px-2 py-1 text-xs font-semibold ${
                      selected ? "bg-white/15" : "bg-zinc-100"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        <div className="min-w-0 p-4 sm:p-6">
          <div className="flex flex-col gap-4 border-b border-zinc-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                {selectedGroup === "ALL" ? "HEU OS" : selectedGroup}
              </p>
              <h3 className="mt-1 text-lg font-semibold text-zinc-950">
                {selectedGroup === "ALL"
                  ? "Toàn bộ mô-đun"
                  : `Nhóm ${selectedGroup}`}
              </h3>
            </div>
            <label className="relative block w-full sm:max-w-xs">
              <Search className="pointer-events-none absolute top-2.5 left-3 size-4 text-zinc-400" />
              <span className="sr-only">Tìm mô-đun</span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Tìm mã, tên hoặc owner"
                className="h-10 w-full rounded-lg border border-zinc-300 bg-white pr-3 pl-9 text-sm outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
              />
            </label>
          </div>

          {visibleRows.length === 0 ? (
            <div className="mt-5 rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-8 text-center text-sm text-zinc-500">
              Không có mô-đun phù hợp với bộ lọc.
            </div>
          ) : (
            <div className="mt-5 grid gap-4 xl:grid-cols-2">
              {visibleRows.map((row) => {
                const display = moduleDisplay(row.module_code, {
                  name: row.module_name,
                  group: row.module_group,
                  owner: row.owner_department,
                });
                return (
                  <article
                    key={row.id}
                    className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm"
                    data-heu-module-code={row.module_code}
                    data-heu-module-owner={row.owner_department ?? "UNASSIGNED"}
                    data-heu-module-ai-gate={row.ai_gate_status}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-mono text-xs text-blue-700">
                          {row.module_code}
                        </p>
                        <h4 className="mt-1 truncate font-semibold text-zinc-950">
                          {display.name}
                        </h4>
                        <p className="mt-1 text-xs text-zinc-500">
                          Owner: {display.owner}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 rounded-md border px-2 py-1 text-xs font-semibold ${readinessStatusTone(
                          row.readiness_status,
                        )}`}
                      >
                        {readinessStatusLabel(row.readiness_status)}
                      </span>
                    </div>

                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-zinc-100">
                      <div
                        className="h-full rounded-full bg-blue-700"
                        style={{
                          width: `${Math.max(0, Math.min(100, row.readiness_score))}%`,
                        }}
                      />
                    </div>
                    <p className="mt-2 text-xs text-zinc-500">
                      Sẵn sàng {row.readiness_score}%
                    </p>

                    <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
                      <div className="rounded-lg bg-zinc-50 p-3">
                        <GitBranch className="size-4 text-zinc-500" />
                        <strong className="mt-2 block text-base text-zinc-950">
                          {row.workflow_count}
                        </strong>
                        Workflow
                      </div>
                      <div className="rounded-lg bg-zinc-50 p-3">
                        <Database className="size-4 text-zinc-500" />
                        <strong className="mt-2 block text-base text-zinc-950">
                          {row.master_data_count}
                        </strong>
                        Data master
                      </div>
                      <div className="rounded-lg bg-zinc-50 p-3">
                        <ShieldCheck className="size-4 text-zinc-500" />
                        <strong className="mt-2 block text-base text-zinc-950">
                          {row.risk_count}
                        </strong>
                        Rủi ro
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-3 border-t border-zinc-200 pt-4">
                      <span
                        className={`inline-flex items-center gap-2 rounded-md border px-2 py-1 text-xs font-semibold ${aiGateStatusTone(
                          row.ai_gate_status,
                        )}`}
                      >
                        <Bot className="size-3.5" />
                        {aiGateStatusLabel(row.ai_gate_status)}
                      </span>
                      <Link
                        href={`/master-control/modules/${encodeURIComponent(row.module_code)}`}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-900"
                      >
                        Mở mô-đun
                        <ArrowRight className="size-4" />
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
