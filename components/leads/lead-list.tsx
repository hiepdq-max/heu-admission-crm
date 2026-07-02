"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, type KeyboardEvent } from "react";
import {
  AlertTriangle,
  ArrowRight,
  ListFilter,
  Phone,
  Search,
  UserRound,
  X,
} from "lucide-react";

type LeadRow = {
  id: string;
  lead_code: string;
  student_name: string;
  student_phone: string | null;
  parent_name: string | null;
  parent_phone: string | null;
  interested_major: string | null;
  province: string | null;
  district: string | null;
  ward: string | null;
  status: string;
  priority: string;
  next_followup_at: string | null;
  created_at: string;
  source_id: string | null;
  flow_id: string | null;
  admission_segment_id: string | null;
  campaign_id: string | null;
  partner_id: string | null;
  assigned_to: string | null;
  hou_major_id: string | null;
  hou_stage_id: string | null;
};

type LookupRow = {
  id: string;
  label: string;
};

type LeadListProps = {
  leads: LeadRow[];
  sources: LookupRow[];
  flows: LookupRow[];
  segments: LookupRow[];
  campaigns: LookupRow[];
  partners: LookupRow[];
  users: LookupRow[];
  houMajors: LookupRow[];
  houStages: LookupRow[];
};

const statusLabels: Record<string, string> = {
  NEW: "Lead mới",
  ASSIGNED: "Đã phân tư vấn",
  CONTACTED: "Đã liên hệ",
  INTERESTED: "Có quan tâm",
  FOLLOW_UP: "Cần chăm sóc",
  VISITED: "Đã đến trường",
  DOCUMENT_PENDING: "Chờ hồ sơ",
  DOCUMENT_SUBMITTED: "Đã nộp hồ sơ",
  ELIGIBLE: "Đủ điều kiện",
  ENROLLED: "Đã nhập học",
  LOST: "Không đăng ký",
  DUPLICATE: "Trùng lead",
};

const statusClasses: Record<string, string> = {
  NEW: "bg-sky-50 text-sky-700 border-sky-200",
  ASSIGNED: "bg-cyan-50 text-cyan-700 border-cyan-200",
  CONTACTED: "bg-blue-50 text-blue-700 border-blue-200",
  INTERESTED: "bg-violet-50 text-violet-700 border-violet-200",
  FOLLOW_UP: "bg-amber-50 text-amber-700 border-amber-200",
  VISITED: "bg-indigo-50 text-indigo-700 border-indigo-200",
  DOCUMENT_PENDING: "bg-orange-50 text-orange-700 border-orange-200",
  DOCUMENT_SUBMITTED: "bg-purple-50 text-purple-700 border-purple-200",
  ELIGIBLE: "bg-emerald-50 text-emerald-700 border-emerald-200",
  ENROLLED: "bg-green-50 text-green-700 border-green-200",
  LOST: "bg-rose-50 text-rose-700 border-rose-200",
  DUPLICATE: "bg-zinc-100 text-zinc-700 border-zinc-200",
};

const priorityLabels: Record<string, string> = {
  LOW: "Thấp",
  NORMAL: "Bình thường",
  HIGH: "Cao",
  URGENT: "Khẩn cấp",
};

type LeadQuickFilter =
  | "all"
  | "followup"
  | "unassigned"
  | "documents"
  | "priority"
  | "active";

type LeadQuickFilterDefinition = {
  id: LeadQuickFilter;
  label: string;
  description: string;
  matches: (lead: LeadRow) => boolean;
};

type LeadSearchLookups = {
  sourceMap: Map<string, string>;
  flowMap: Map<string, string>;
  segmentMap: Map<string, string>;
  campaignMap: Map<string, string>;
  partnerMap: Map<string, string>;
  userMap: Map<string, string>;
  houMajorMap: Map<string, string>;
  houStageMap: Map<string, string>;
};

const closedStatuses = new Set(["ENROLLED", "LOST", "DUPLICATE"]);
const documentStatuses = new Set([
  "DOCUMENT_PENDING",
  "DOCUMENT_SUBMITTED",
  "ELIGIBLE",
]);
const highPriorities = new Set(["HIGH", "URGENT"]);

function isFollowUpLead(lead: LeadRow) {
  return lead.status === "FOLLOW_UP" || Boolean(lead.next_followup_at);
}

function isActiveLead(lead: LeadRow) {
  return !closedStatuses.has(lead.status);
}

function normalizeSearchText(value: string | null | undefined) {
  return (value ?? "")
    .toLocaleLowerCase("vi-VN")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d");
}

function buildLeadSearchIndex(lead: LeadRow, lookups: LeadSearchLookups) {
  const searchableParts = [
    lead.lead_code,
    lead.student_name,
    lead.student_phone,
    lead.parent_name,
    lead.parent_phone,
    lead.interested_major,
    lead.province,
    lead.district,
    lead.ward,
    statusLabels[lead.status] ?? lead.status,
    priorityLabels[lead.priority] ?? lead.priority,
    lead.source_id ? lookups.sourceMap.get(lead.source_id) : null,
    lead.flow_id ? lookups.flowMap.get(lead.flow_id) : null,
    lead.admission_segment_id
      ? lookups.segmentMap.get(lead.admission_segment_id)
      : null,
    lead.campaign_id ? lookups.campaignMap.get(lead.campaign_id) : null,
    lead.partner_id ? lookups.partnerMap.get(lead.partner_id) : null,
    lead.assigned_to ? lookups.userMap.get(lead.assigned_to) : null,
    lead.hou_major_id ? lookups.houMajorMap.get(lead.hou_major_id) : null,
    lead.hou_stage_id ? lookups.houStageMap.get(lead.hou_stage_id) : null,
  ];

  return normalizeSearchText(searchableParts.filter(Boolean).join(" "));
}

const quickFilters: LeadQuickFilterDefinition[] = [
  {
    id: "all",
    label: "Tất cả",
    description: "Lead mới nhất",
    matches: () => true,
  },
  {
    id: "followup",
    label: "Cần chăm sóc",
    description: "Có lịch hoặc trạng thái follow-up",
    matches: isFollowUpLead,
  },
  {
    id: "unassigned",
    label: "Chưa phụ trách",
    description: "Chưa phân tư vấn",
    matches: (lead) => !lead.assigned_to,
  },
  {
    id: "documents",
    label: "Hồ sơ",
    description: "Đang chờ hoặc đã nộp hồ sơ",
    matches: (lead) => documentStatuses.has(lead.status),
  },
  {
    id: "priority",
    label: "Ưu tiên cao",
    description: "HIGH hoặc URGENT",
    matches: (lead) => highPriorities.has(lead.priority),
  },
  {
    id: "active",
    label: "Đang mở",
    description: "Chưa thuộc nhóm đã đóng",
    matches: isActiveLead,
  },
];

function toMap(rows: LookupRow[]) {
  return new Map(rows.map((row) => [row.id, row.label]));
}

function formatDateTime(value: string | null) {
  if (!value) {
    return "Chưa đặt";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatArea(lead: Pick<LeadRow, "province" | "district" | "ward">) {
  const currentArea = [lead.ward, lead.province].filter(Boolean).join(" / ");

  if (!currentArea && !lead.district) {
    return "Chưa rõ địa bàn";
  }

  if (lead.district) {
    return `${currentArea || "Chưa rõ địa bàn hiện tại"} / Quận huyện cũ: ${lead.district}`;
  }

  return currentArea;
}

export function LeadList({
  leads,
  sources,
  flows,
  segments,
  campaigns,
  partners,
  users,
  houMajors,
  houStages,
}: LeadListProps) {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<LeadQuickFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const sourceMap = useMemo(() => toMap(sources), [sources]);
  const flowMap = useMemo(() => toMap(flows), [flows]);
  const segmentMap = useMemo(() => toMap(segments), [segments]);
  const campaignMap = useMemo(() => toMap(campaigns), [campaigns]);
  const partnerMap = useMemo(() => toMap(partners), [partners]);
  const userMap = useMemo(() => toMap(users), [users]);
  const houMajorMap = useMemo(() => toMap(houMajors), [houMajors]);
  const houStageMap = useMemo(() => toMap(houStages), [houStages]);
  const activeFilterDefinition =
    quickFilters.find((filter) => filter.id === activeFilter) ?? quickFilters[0];
  const normalizedSearchQuery = normalizeSearchText(searchQuery);
  const searchLookups = useMemo(
    (): LeadSearchLookups => ({
      sourceMap,
      flowMap,
      segmentMap,
      campaignMap,
      partnerMap,
      userMap,
      houMajorMap,
      houStageMap,
    }),
    [
      campaignMap,
      flowMap,
      houMajorMap,
      houStageMap,
      partnerMap,
      segmentMap,
      sourceMap,
      userMap,
    ],
  );
  const leadSearchIndex = useMemo(
    () =>
      new Map(
        leads.map((lead) => [lead.id, buildLeadSearchIndex(lead, searchLookups)]),
      ),
    [leads, searchLookups],
  );
  const filteredLeads = useMemo(
    () =>
      leads.filter(
        (lead) =>
          activeFilterDefinition.matches(lead) &&
          (!normalizedSearchQuery ||
            (leadSearchIndex.get(lead.id) ?? "").includes(normalizedSearchQuery)),
      ),
    [activeFilterDefinition, leadSearchIndex, leads, normalizedSearchQuery],
  );
  const quickFilterStats = useMemo(
    () =>
      quickFilters.map((filter) => ({
        ...filter,
        count: leads.filter(
          (lead) =>
            filter.matches(lead) &&
            (!normalizedSearchQuery ||
              (leadSearchIndex.get(lead.id) ?? "").includes(
                normalizedSearchQuery,
              )),
        ).length,
      })),
    [leadSearchIndex, leads, normalizedSearchQuery],
  );
  const quickLeadMatches = filteredLeads.slice(0, 3);
  const firstQuickLead = quickLeadMatches[0] ?? null;

  function handleSearchKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Enter" || !firstQuickLead) {
      return;
    }

    event.preventDefault();
    router.push(`/leads/${firstQuickLead.id}`);
  }

  if (leads.length === 0) {
    return (
      <section className="rounded-lg border border-zinc-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex size-12 items-center justify-center rounded-lg bg-zinc-100">
          <UserRound className="size-5 text-zinc-500" />
        </div>
        <h2 className="mt-4 text-base font-semibold">Chưa có lead</h2>
        <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-zinc-500">
          Chưa có lead phù hợp với tài khoản hiện tại. Hãy bấm nút tạo lead mới
          hoặc import danh sách tuyển sinh để bắt đầu theo dõi trên CRM.
        </p>
      </section>
    );
  }

  return (
    <section
      className="min-w-0 overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm"
      data-heu-lead-list-quick-filters="P0-05_LEAD_QUICK_FILTERS"
    >
      <div className="flex flex-col gap-4 border-b border-zinc-200 p-5">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <ListFilter className="size-4 text-zinc-500" />
            <h2 className="text-base font-semibold">Danh sách lead</h2>
          </div>
          <p className="mt-1 break-words text-sm text-zinc-500">
            Đang hiển thị {filteredLeads.length}/{leads.length} lead theo nhóm{" "}
            {activeFilterDefinition.label.toLowerCase()}.
          </p>
        </div>

        <div
          className="flex min-w-0 flex-col gap-2 sm:flex-row"
          data-heu-lead-list-quick-search="P0-05_LEAD_QUICK_SEARCH"
        >
          <label className="relative block min-w-0 flex-1">
            <span className="sr-only">Tìm lead trong danh sách</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Tìm tên, mã lead, SĐT, ngành, nguồn..."
              className="h-10 w-full rounded-md border border-zinc-200 bg-white pl-9 pr-10 text-sm text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-zinc-400"
            />
            {searchQuery ? (
              <button
                type="button"
                aria-label="Xóa tìm kiếm"
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
              >
                <X className="size-4" />
              </button>
            ) : null}
          </label>
        </div>

        <div
          className="grid min-w-0 gap-2 sm:grid-cols-2 xl:grid-cols-6"
          data-heu-lead-quick-filter-buttons="all followup unassigned documents priority active"
        >
          {quickFilterStats.map((filter) => {
            const isActive = filter.id === activeFilter;

            return (
              <button
                key={filter.id}
                type="button"
                aria-pressed={isActive}
                onClick={() => setActiveFilter(filter.id)}
                className={`flex min-h-20 min-w-0 flex-col justify-between overflow-hidden rounded-md border p-3 text-left transition ${
                  isActive
                    ? "border-zinc-950 bg-zinc-950 text-white"
                    : "border-zinc-200 bg-zinc-50 text-zinc-700 hover:border-zinc-400 hover:bg-white"
                }`}
              >
                <span className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-medium">
                    {filter.label}
                  </span>
                  <span
                    className={`rounded-md px-2 py-0.5 text-xs font-semibold ${
                      isActive
                        ? "bg-white text-zinc-950"
                        : "bg-white text-zinc-700"
                    }`}
                  >
                    {filter.count}
                  </span>
                </span>
                <span
                  className={`mt-2 line-clamp-2 text-xs leading-5 ${
                    isActive ? "text-zinc-200" : "text-zinc-500"
                  }`}
                >
                  {filter.description}
                </span>
              </button>
            );
          })}
        </div>

        <div
          className="min-w-0 overflow-hidden rounded-md border border-zinc-200 bg-zinc-50 p-3"
          data-heu-lead-quick-open-results="P0-05_LEAD_QUICK_OPEN_RESULTS"
        >
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-zinc-950">
              Kết quả mở nhanh
            </p>
            <span className="text-xs text-zinc-500">
              {quickLeadMatches.length}/{filteredLeads.length}
            </span>
          </div>
          {quickLeadMatches.length > 0 ? (
            <div className="mt-3 grid gap-2 lg:grid-cols-3">
              {quickLeadMatches.map((lead) => (
                <Link
                  key={lead.id}
                  href={`/leads/${lead.id}`}
                  className="group flex min-h-20 min-w-0 items-center justify-between gap-3 rounded-md border border-zinc-200 bg-white px-3 py-3 transition hover:border-zinc-400"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-zinc-950">
                      {lead.student_name}
                    </span>
                    <span className="mt-1 block truncate text-xs text-zinc-500">
                      {lead.lead_code} ·{" "}
                      {statusLabels[lead.status] ?? lead.status}
                    </span>
                    <span className="mt-1 block truncate text-xs text-zinc-500">
                      {lead.student_phone ?? lead.parent_phone ?? "Chưa có SĐT"}
                    </span>
                  </span>
                  <ArrowRight className="size-4 shrink-0 text-zinc-400 transition group-hover:text-zinc-900" />
                </Link>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-sm text-zinc-500">
              Nhóm này chưa có lead trong dữ liệu đang hiển thị.
            </p>
          )}
        </div>
      </div>

      {filteredLeads.length === 0 ? (
        <div className="p-6 text-sm text-zinc-500">
          Không có lead khớp nhóm {activeFilterDefinition.label.toLowerCase()}
          {searchQuery ? ` và từ khóa "${searchQuery}".` : "."}
        </div>
      ) : (
        <>
          <div className="grid gap-3 p-3 lg:hidden">
            {filteredLeads.map((lead) => {
              const segment = lead.admission_segment_id
                ? segmentMap.get(lead.admission_segment_id)
                : null;
              const owner = lead.assigned_to
                ? userMap.get(lead.assigned_to)
                : null;

              return (
                <article
                  key={lead.id}
                  className="rounded-md border border-zinc-200 bg-white p-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Link
                        href={`/leads/${lead.id}`}
                        className="block truncate font-medium text-zinc-950"
                      >
                        {lead.student_name}
                      </Link>
                      <p className="mt-1 truncate text-xs text-zinc-500">
                        {lead.lead_code}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-md border px-2 py-1 text-xs font-medium ${
                        statusClasses[lead.status] ??
                        "border-zinc-200 bg-zinc-100 text-zinc-700"
                      }`}
                    >
                      {statusLabels[lead.status] ?? lead.status}
                    </span>
                  </div>

                  <div className="mt-3 grid gap-2 text-sm text-zinc-600">
                    <p className="flex items-center gap-2">
                      <Phone className="size-3.5 text-zinc-400" />
                      {lead.student_phone ??
                        lead.parent_phone ??
                        "Chưa có SĐT"}
                    </p>
                    <p className="truncate">
                      {lead.interested_major ?? "Chưa rõ ngành"}
                    </p>
                    <p className="truncate">
                      {segment ?? "Chưa rõ đối tượng"} ·{" "}
                      {owner ?? "Chưa phân công"}
                    </p>
                    <p className="text-xs text-zinc-500">
                      Follow-up: {formatDateTime(lead.next_followup_at)}
                    </p>
                  </div>

                  <Link
                    href={`/leads/${lead.id}`}
                    className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-100"
                  >
                    Mở lead
                    <ArrowRight className="size-4" />
                  </Link>
                </article>
              );
            })}
          </div>

        <div className="hidden overflow-x-auto lg:block">
          <table className="w-full min-w-[1040px] text-sm">
            <thead className="bg-zinc-50 text-left text-xs font-medium uppercase text-zinc-500">
              <tr>
                <th className="px-5 py-3">Lead</th>
                <th className="px-5 py-3">Liên hệ</th>
                <th className="px-5 py-3">Nhu cầu</th>
                <th className="px-5 py-3">Nguồn</th>
                <th className="px-5 py-3">Trạng thái</th>
                <th className="px-5 py-3">Phụ trách</th>
                <th className="px-5 py-3">Follow-up</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {filteredLeads.map((lead) => {
                const source = lead.source_id
                  ? sourceMap.get(lead.source_id)
                  : null;
                const flow = lead.flow_id ? flowMap.get(lead.flow_id) : null;
                const segment = lead.admission_segment_id
                  ? segmentMap.get(lead.admission_segment_id)
                  : null;
                const campaign = lead.campaign_id
                  ? campaignMap.get(lead.campaign_id)
                  : null;
                const partner = lead.partner_id
                  ? partnerMap.get(lead.partner_id)
                  : null;
                const owner = lead.assigned_to
                  ? userMap.get(lead.assigned_to)
                  : null;
                const houMajor = lead.hou_major_id
                  ? houMajorMap.get(lead.hou_major_id)
                  : null;
                const houStage = lead.hou_stage_id
                  ? houStageMap.get(lead.hou_stage_id)
                  : null;

                return (
                  <tr key={lead.id} className="align-top">
                    <td className="px-5 py-4">
                      <Link
                        href={`/leads/${lead.id}`}
                        className="font-medium text-zinc-950 hover:underline"
                      >
                        {lead.student_name}
                      </Link>
                      <p className="mt-1 text-xs text-zinc-500">
                        {lead.lead_code}
                      </p>
                      <p className="mt-2 text-xs text-zinc-500">
                        Tạo: {formatDateTime(lead.created_at)}
                      </p>
                    </td>
                  <td className="px-5 py-4">
                    <div className="space-y-2">
                      <p className="flex items-center gap-2 text-zinc-700">
                        <Phone className="size-3.5 text-zinc-400" />
                        {lead.student_phone ?? "Chưa có SĐT HS"}
                      </p>
                      <p className="text-xs text-zinc-500">
                        PH: {lead.parent_name ?? "Chưa nhập"} -{" "}
                        {lead.parent_phone ?? "Chưa có SĐT"}
                      </p>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-medium text-zinc-700">
                      {lead.interested_major ?? "Chưa rõ ngành"}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">
                      {formatArea(lead)}
                    </p>
                    {segment ? (
                      <p className="mt-2 inline-flex max-w-full rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-700">
                        {segment}
                      </p>
                    ) : null}
                    {houMajor || houStage ? (
                      <p className="mt-2 inline-flex max-w-full rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
                        HOU: {houMajor ?? "Chưa chọn ngành"} ·{" "}
                        {houStage ?? "Chưa chọn bước"}
                      </p>
                    ) : null}
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-medium text-zinc-700">
                      {source ?? "Chưa rõ nguồn"}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">
                      Luồng: {flow ?? "Chưa phân loại luồng"}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">
                      {campaign ?? partner ?? "Không có chiến dịch/đối tác"}
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    <div className="space-y-2">
                      <span
                        className={`inline-flex rounded-md border px-2 py-1 text-xs font-medium ${
                          statusClasses[lead.status] ??
                          "border-zinc-200 bg-zinc-100 text-zinc-700"
                        }`}
                      >
                        {statusLabels[lead.status] ?? lead.status}
                      </span>
                      <p className="text-xs text-zinc-500">
                        Ưu tiên: {priorityLabels[lead.priority] ?? lead.priority}
                      </p>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-zinc-700">
                    {owner ?? "Chưa phân công"}
                  </td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-700">
                      {lead.next_followup_at ? (
                        <AlertTriangle className="size-3.5 text-amber-600" />
                      ) : null}
                      {formatDateTime(lead.next_followup_at)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
        </>
      )}
    </section>
  );
}
