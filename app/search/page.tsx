import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  Database,
  FileSearch,
  ListChecks,
  Search,
  ShieldAlert,
} from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import {
  matchesTtgdtxProcessQuery,
  TTGDTX_PROCESS_LABELS,
  TTGDTX_PROCESS_SEARCH_SUGGESTIONS,
} from "@/lib/ttgdtx-process-labels";
import {
  firstParam,
  getAdmissionWorkspaceContext,
  withAdmissionSegmentParam,
} from "@/lib/workspace";

type SearchPageProps = {
  searchParams?: Promise<{
    q?: string | string[];
    segment?: string | string[];
  }>;
};

type SearchResultRow = {
  result_rank: number;
  result_type: string;
  result_label: string;
  result_code: string | null;
  result_summary: string | null;
  href: string | null;
  module_code: string | null;
  source_table: string | null;
  entity_id: string | null;
  segment_id: string | null;
  segment_label: string | null;
  owner_department: string | null;
  status_label: string | null;
  risk_level: string | null;
  updated_at: string | null;
};

const typeLabels: Record<string, string> = {
  NAVIGATION: "Điều hướng",
  MODULE: "Module",
  WORKFLOW: "Quy trình",
  APPROVAL: "Điểm duyệt",
  MASTER_DATA: "Dữ liệu gốc",
  RISK: "Rủi ro",
  ADMISSION_OBJECT: "Đối tượng tuyển sinh",
  LEAD: "Lead",
  SHORT_STUDENT: "Học viên ngắn hạn",
  SHORT_CLASS: "Lớp ngắn hạn",
  EXCEPTION: "Exception",
};

const typeTones: Record<string, string> = {
  NAVIGATION: "border-sky-200 bg-sky-50 text-sky-700",
  MODULE: "border-zinc-200 bg-zinc-50 text-zinc-700",
  WORKFLOW: "border-cyan-200 bg-cyan-50 text-cyan-700",
  APPROVAL: "border-violet-200 bg-violet-50 text-violet-700",
  MASTER_DATA: "border-indigo-200 bg-indigo-50 text-indigo-700",
  RISK: "border-rose-200 bg-rose-50 text-rose-700",
  ADMISSION_OBJECT: "border-emerald-200 bg-emerald-50 text-emerald-700",
  LEAD: "border-amber-200 bg-amber-50 text-amber-700",
  SHORT_STUDENT: "border-teal-200 bg-teal-50 text-teal-700",
  SHORT_CLASS: "border-lime-200 bg-lime-50 text-lime-700",
  EXCEPTION: "border-orange-200 bg-orange-50 text-orange-700",
};

function isFunctionMissing(message: string) {
  return (
    message.includes("search_heu_os") ||
    message.includes("Could not find the function") ||
    message.includes("function public.search_heu_os")
  );
}

function normalizeSearchInput(value: string) {
  return value
    .replace(/[*%]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isScopedSearchMissing(message: string) {
  return (
    message.includes("p_segment_id") ||
    message.includes("Could not choose the best candidate function") ||
    message.includes("Could not find the function")
  );
}

function formatUpdatedAt(value: string | null) {
  if (!value) {
    return null;
  }

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function safeHref(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/";
  }

  return value;
}

function buildTtgdtxProcessResults(query: string): SearchResultRow[] {
  return TTGDTX_PROCESS_LABELS.filter((item) =>
    matchesTtgdtxProcessQuery(item, query),
  ).map((item, index) => ({
    result_rank: index + 1,
    result_type: "WORKFLOW",
    result_label: item.label,
    result_code: item.code,
    result_summary: item.plainMeaning,
    href: item.href,
    module_code: "TTGDTX",
    source_table: null,
    entity_id: null,
    segment_id: null,
    segment_label: null,
    owner_department: null,
    status_label: "PASS_LOCAL",
    risk_level: null,
    updated_at: null,
  }));
}

function mergeSearchResults(
  localResults: SearchResultRow[],
  remoteResults: SearchResultRow[],
) {
  const seen = new Set<string>();
  const merged: SearchResultRow[] = [];

  for (const row of [...localResults, ...remoteResults]) {
    const key = `${row.result_type}:${row.result_code ?? row.href ?? row.entity_id}`;

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    merged.push(row);
  }

  return merged;
}

function SearchForm({
  query,
  segmentId,
}: {
  query: string;
  segmentId: string | null;
}) {
  return (
    <form
      action="/search"
      method="get"
      className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm"
    >
      {segmentId ? <input type="hidden" name="segment" value={segmentId} /> : null}
      <label className="text-sm font-medium text-zinc-700" htmlFor="heu-search">
        Từ khóa
      </label>
      <div className="mt-2 flex flex-col gap-2 sm:flex-row">
        <div className="flex min-h-10 flex-1 items-center gap-2 rounded-lg border border-zinc-300 bg-white px-3">
          <Search className="size-4 shrink-0 text-zinc-500" />
          <input
            id="heu-search"
            name="q"
            type="search"
            defaultValue={query}
            placeholder="VD: P1-10, BHXH, tên học viên, số điện thoại..."
            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-zinc-400"
          />
        </div>
        <Button type="submit" className="h-10">
          <FileSearch className="size-4" />
          Tìm kiếm
        </Button>
      </div>
      <p className="mt-2 text-xs leading-5 text-zinc-500">
        Search chỉ đọc dữ liệu trong phạm vi tài khoản của bạn. Nếu không thấy
        kết quả, có thể bạn chưa được phân quyền hoặc từ khóa chưa khớp.
      </p>
    </form>
  );
}

function SearchSuggestions({ segmentId }: { segmentId: string | null }) {
  const suggestions = [
    "P1-18",
    "P1-10",
    "P1-11",
    "BHXH",
    ...TTGDTX_PROCESS_SEARCH_SUGGESTIONS,
    "điểm danh",
    "công nợ",
    "ngắn hạn",
  ];

  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-zinc-100">
          <Database className="size-5 text-zinc-600" />
        </div>
        <div className="min-w-0">
          <h2 className="font-semibold">Có thể thử tìm</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {suggestions.map((item) => (
              <Link
                key={item}
                href={withAdmissionSegmentParam(
                  `/search?q=${encodeURIComponent(item)}`,
                  segmentId,
                )}
                className="max-w-full break-words rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50"
              >
                {item}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function resultHref(row: SearchResultRow, activeSegmentId: string | null) {
  const segmentId = row.segment_id ?? activeSegmentId;

  if (row.result_type === "SHORT_STUDENT" && row.entity_id) {
    return withAdmissionSegmentParam(
      `/short-course/drilldown?type=students&entityId=${row.entity_id}`,
      segmentId,
    );
  }

  if (row.result_type === "SHORT_CLASS" && row.entity_id) {
    return withAdmissionSegmentParam(
      `/short-course/drilldown?type=classes&entityId=${row.entity_id}`,
      segmentId,
    );
  }

  if (row.result_type === "EXCEPTION") {
    const query = row.result_code ?? row.result_label;

    return withAdmissionSegmentParam(
      `/short-course/drilldown?type=risks&q=${encodeURIComponent(query)}`,
      segmentId,
    );
  }

  return withAdmissionSegmentParam(safeHref(row.href), segmentId);
}

function SearchResultCard({
  row,
  activeSegmentId,
}: {
  row: SearchResultRow;
  activeSegmentId: string | null;
}) {
  const label = typeLabels[row.result_type] ?? row.result_type;
  const tone =
    typeTones[row.result_type] ?? "border-zinc-200 bg-zinc-50 text-zinc-700";
  const updatedAt = formatUpdatedAt(row.updated_at);

  return (
    <article className="min-w-0 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-md border px-2 py-1 text-xs ${tone}`}>
              {label}
            </span>
            {row.result_code ? (
              <span className="font-mono text-xs text-zinc-500">
                {row.result_code}
              </span>
            ) : null}
            {row.risk_level ? (
              <span className="rounded-md bg-zinc-100 px-2 py-1 text-xs text-zinc-600">
                {row.risk_level}
              </span>
            ) : null}
          </div>
          <h2 className="mt-3 break-words text-base font-semibold text-zinc-950">
            {row.result_label}
          </h2>
          {row.result_summary ? (
            <p className="mt-2 line-clamp-3 break-words text-sm leading-6 text-zinc-600">
              {row.result_summary}
            </p>
          ) : null}
          <div className="mt-3 flex flex-wrap gap-2 text-xs text-zinc-500">
            {row.module_code ? (
              <span className="break-words">Module: {row.module_code}</span>
            ) : null}
            {row.segment_label ? (
              <span className="break-words">
                Đối tượng: {row.segment_label}
              </span>
            ) : null}
            {row.owner_department ? (
              <span className="break-words">
                Owner: {row.owner_department}
              </span>
            ) : null}
            {row.status_label ? (
              <span className="break-words">
                Trạng thái: {row.status_label}
              </span>
            ) : null}
            {updatedAt ? (
              <span className="break-words">Cập nhật: {updatedAt}</span>
            ) : null}
          </div>
        </div>
        <Button asChild variant="outline" className="sm:shrink-0">
          <Link href={resultHref(row, activeSegmentId)}>
            Mở
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
    </article>
  );
}

function resultKey(row: SearchResultRow, index: number) {
  return `${row.result_type}-${row.result_code ?? row.entity_id ?? row.href ?? index}`;
}

function SearchQuickOpen({
  results,
  activeSegmentId,
}: {
  results: SearchResultRow[];
  activeSegmentId: string | null;
}) {
  const quickResults = results.slice(0, 3);

  if (quickResults.length === 0) {
    return null;
  }

  return (
    <section
      className="min-w-0 overflow-hidden rounded-lg border border-zinc-200 bg-white p-3 shadow-sm"
      data-heu-search-quick-open="P1-11_SEARCH_QUICK_OPEN"
      data-heu-search-quick-open-overflow-guard="P1-11_SEARCH_QUICK_OPEN_NO_OVERFLOW"
    >
      <div className="flex min-w-0 items-center justify-between gap-3 px-1">
        <h2 className="min-w-0 truncate text-sm font-semibold text-zinc-950">
          Mở nhanh
        </h2>
        <span className="shrink-0 text-xs text-zinc-500">
          {quickResults.length}/{results.length}
        </span>
      </div>
      <div className="mt-3 grid min-w-0 gap-2 lg:grid-cols-3">
        {quickResults.map((row, index) => (
          <Link
            key={resultKey(row, index)}
            href={resultHref(row, activeSegmentId)}
            aria-label={`Mở nhanh ${row.result_label}`}
            title={`Mở nhanh ${row.result_label}`}
            className="group flex min-h-24 min-w-0 items-center justify-between gap-3 overflow-hidden rounded-md border border-zinc-200 bg-zinc-50 px-3 py-3 transition hover:border-zinc-400 hover:bg-white"
          >
            <span className="min-w-0 overflow-hidden">
              <span className="block truncate text-sm font-semibold text-zinc-950">
                {row.result_label}
              </span>
              <span className="mt-1 block truncate text-xs text-zinc-500">
                {typeLabels[row.result_type] ?? row.result_type}
                {row.result_code ? ` · ${row.result_code}` : ""}
              </span>
              {row.result_summary ? (
                <span className="mt-1 block line-clamp-2 break-words text-xs leading-5 text-zinc-500">
                  {row.result_summary}
                </span>
              ) : null}
            </span>
            <ArrowRight className="size-4 shrink-0 text-zinc-400 transition group-hover:text-zinc-900" />
          </Link>
        ))}
      </div>
    </section>
  );
}

export default async function HeuOsSearchPage({ searchParams }: SearchPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const resolvedSearchParams = searchParams ? await searchParams : {};
  const query = (firstParam(resolvedSearchParams.q) ?? "").trim();
  const effectiveQuery = normalizeSearchInput(query);
  const requestedSegmentId = firstParam(resolvedSearchParams.segment);
  const workspace = await getAdmissionWorkspaceContext(
    supabase,
    user.id,
    requestedSegmentId,
  );

  let results: SearchResultRow[] = [];
  let loadError: string | null = null;

  if (effectiveQuery.length >= 2) {
    const processResults = buildTtgdtxProcessResults(effectiveQuery);

    const { data, error } = await supabase.rpc("search_heu_os", {
      p_query: effectiveQuery,
      p_limit: 50,
      p_segment_id: workspace.activeSegmentId,
    });

    if (error) {
      if (isScopedSearchMissing(error.message)) {
        const fallback = await supabase.rpc("search_heu_os", {
          p_query: effectiveQuery,
          p_limit: 50,
        });

        if (fallback.error) {
          loadError = processResults.length > 0 ? null : fallback.error.message;
        } else {
          const fallbackRows = Array.isArray(fallback.data)
            ? (fallback.data as SearchResultRow[])
            : [];

          results = fallbackRows.filter(
            (row) =>
              !workspace.activeSegmentId ||
              !row.segment_id ||
              row.segment_id === workspace.activeSegmentId,
          );
        }
      } else {
        loadError = error.message;
      }
    } else {
      results = Array.isArray(data) ? (data as SearchResultRow[]) : [];
    }

    if (processResults.length > 0) {
      results = mergeSearchResults(processResults, results);
      loadError = null;
    }
  }

  return (
    <AppShell
      active="search"
      title="Tìm kiếm HEU OS"
      description={
        workspace.activeSegment
          ? `Đang tìm trong phạm vi: ${workspace.activeSegment.label}.`
          : "Tìm module, quy trình, lead, học viên, lớp và cảnh báo trong phạm vi được phép."
      }
      workspaceSegmentId={workspace.activeSegmentId}
      workspaceReturnTo={withAdmissionSegmentParam(
        "/search",
        workspace.activeSegmentId,
      )}
    >
      <SearchForm query={query} segmentId={workspace.activeSegmentId} />

      {loadError ? (
        <section className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-800">
          <div className="flex items-start gap-3">
            <ShieldAlert className="mt-0.5 size-5 shrink-0" />
            <div>
              <h2 className="font-semibold">
                {isFunctionMissing(loadError)
                  ? "Chưa chạy SQL P1-11"
                  : "Chưa đọc được Search Engine"}
              </h2>
              <p className="mt-1">
                {isFunctionMissing(loadError)
                  ? "Hãy chạy file database/step75_heu_os_search_engine.sql trong Supabase SQL Editor, sau đó tải lại trang."
                  : loadError}
              </p>
            </div>
          </div>
        </section>
      ) : query.length === 0 ? (
        <SearchSuggestions segmentId={workspace.activeSegmentId} />
      ) : effectiveQuery.length < 2 ? (
        <section className="rounded-lg border border-zinc-200 bg-white p-5 text-sm text-zinc-500 shadow-sm">
          Nhập ít nhất 2 ký tự để tìm kiếm.
        </section>
      ) : results.length === 0 ? (
        <section className="rounded-lg border border-zinc-200 bg-white p-5 text-sm leading-6 text-zinc-500 shadow-sm">
          Không tìm thấy kết quả phù hợp với từ khóa{" "}
          <span className="font-semibold text-zinc-900">{query}</span>
          {effectiveQuery !== query ? (
            <>
              {" "}
              sau khi hệ thống hiểu thành{" "}
              <span className="font-semibold text-zinc-900">
                {effectiveQuery}
              </span>
            </>
          ) : null}
          . Hãy thử mã module như <span className="font-mono">P1-18</span>, tên
          học viên, số điện thoại hoặc từ khóa nghiệp vụ.
        </section>
      ) : (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-zinc-500">
              Tìm thấy{" "}
              <span className="font-semibold text-zinc-900">
                {results.length}
              </span>{" "}
              kết quả cho “{effectiveQuery}”
              {effectiveQuery !== query ? ` từ từ khóa anh nhập “${query}”` : ""}
              .
            </p>
            <span className="rounded-md bg-zinc-200 px-2 py-1 text-xs text-zinc-600">
              P1-11
            </span>
          </div>
          <SearchQuickOpen
            results={results}
            activeSegmentId={workspace.activeSegmentId}
          />
          {results.map((row, index) => (
            <SearchResultCard
              key={resultKey(row, index)}
              row={row}
              activeSegmentId={workspace.activeSegmentId}
            />
          ))}
        </section>
      )}

      <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-zinc-100">
            <ListChecks className="size-5 text-zinc-600" />
          </div>
          <div>
            <h2 className="font-semibold">Nguyên tắc P1-11</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-600">
              Search chỉ giúp tìm và mở đúng nơi xử lý. Nó không thay đổi dữ
              liệu, không duyệt hồ sơ, không xác nhận tài chính và không vượt
              quyền người dùng.
            </p>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
