import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, Search } from "lucide-react";

import { DashboardOverview } from "@/components/dashboard/dashboard-overview";
import { AppShell } from "@/components/layout/app-shell";
import { AdmissionSegmentOverview } from "@/components/segments/admission-segment-overview";
import { Button } from "@/components/ui/button";
import {
  buildAdmissionSegmentOverview,
  filterAdmissionSegmentsByScope,
  type AdmissionSegmentCatalogRow,
  type AdmissionSegmentLeadStatRow,
  type AdmissionSegmentScopeRow,
} from "@/lib/admission-segments";
import { createClient } from "@/lib/supabase/server";
import {
  admissionWorkspaceSegmentIds,
  applyAdmissionSegmentIds,
  firstParam,
  getAdmissionWorkspaceContext,
  withAdmissionSegmentParam,
} from "@/lib/workspace";

type PipelineDefinition = {
  status: string;
  label: string;
  color: string;
};

type UrgentLeadRow = {
  id: string;
  lead_code: string;
  student_name: string;
  student_phone: string | null;
  parent_phone: string | null;
  status: string;
  priority: string;
  interested_major: string | null;
  next_followup_at: string;
  assigned_to: string | null;
  note: string | null;
};

type HomePageProps = {
  searchParams?: Promise<{
    segment?: string | string[];
  }>;
};

const pipelineDefinitions: PipelineDefinition[] = [
  { status: "NEW", label: "Lead mới", color: "bg-sky-500" },
  { status: "ASSIGNED", label: "Đã phân tư vấn", color: "bg-cyan-500" },
  { status: "CONTACTED", label: "Đã liên hệ", color: "bg-blue-500" },
  { status: "INTERESTED", label: "Có quan tâm", color: "bg-violet-500" },
  { status: "FOLLOW_UP", label: "Chăm sóc tiếp", color: "bg-amber-500" },
  { status: "DOCUMENT_PENDING", label: "Chờ hồ sơ", color: "bg-orange-500" },
  {
    status: "DOCUMENT_SUBMITTED",
    label: "Đã nộp hồ sơ",
    color: "bg-indigo-500",
  },
  { status: "ELIGIBLE", label: "Đủ điều kiện", color: "bg-emerald-500" },
  { status: "ENROLLED", label: "Đã nhập học", color: "bg-green-500" },
  { status: "LOST", label: "Không đăng ký", color: "bg-rose-500" },
];

const statusLabels = new Map(
  pipelineDefinitions.map((item) => [item.status, item.label]),
);

function startOfToday() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function startOfTomorrow() {
  const today = startOfToday();
  return new Date(today.getTime() + 24 * 60 * 60 * 1000);
}

function formatNumber(value: number | null) {
  return new Intl.NumberFormat("vi-VN").format(value ?? 0);
}

function formatDue(value: string) {
  const due = new Date(value);
  const now = new Date();
  const today = startOfToday();
  const tomorrow = startOfTomorrow();

  if (due < now) {
    return "Quá hạn";
  }

  if (due >= today && due < tomorrow) {
    return new Intl.DateTimeFormat("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(due);
  }

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(due);
}

export default async function Home({ searchParams }: HomePageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const resolvedSearchParams = searchParams ? await searchParams : {};
  const requestedSegmentId = firstParam(resolvedSearchParams.segment);
  const workspace = await getAdmissionWorkspaceContext(
    supabase,
    user.id,
    requestedSegmentId,
  );
  const segmentFilterIds = admissionWorkspaceSegmentIds(workspace);

  const todayStart = startOfToday().toISOString();
  const tomorrowStart = startOfTomorrow().toISOString();
  const now = new Date().toISOString();

  const [
    totalResult,
    newTodayResult,
    followupOpenResult,
    overdueResult,
    enrolledResult,
    todayFollowupResult,
    activityTodayResult,
    documentsCheckedTodayResult,
    urgentLeadsResult,
    userRowsResult,
    currentRoleResult,
    segmentRowsResult,
    segmentScopeRowsResult,
    segmentLeadRowsResult,
    ...pipelineResults
  ] = await Promise.all([
    applyAdmissionSegmentIds(
      supabase
        .from("leads")
        .select("id", { count: "exact", head: true })
        .eq("is_deleted", false),
      segmentFilterIds,
    ),
    applyAdmissionSegmentIds(
      supabase
        .from("leads")
        .select("id", { count: "exact", head: true })
        .eq("is_deleted", false)
        .gte("created_at", todayStart),
      segmentFilterIds,
    ),
    applyAdmissionSegmentIds(
      supabase
        .from("leads")
        .select("id", { count: "exact", head: true })
        .eq("is_deleted", false)
        .not("next_followup_at", "is", null)
        .neq("status", "ENROLLED")
        .neq("status", "LOST"),
      segmentFilterIds,
    ),
    applyAdmissionSegmentIds(
      supabase
        .from("leads")
        .select("id", { count: "exact", head: true })
        .eq("is_deleted", false)
        .not("next_followup_at", "is", null)
        .lt("next_followup_at", now)
        .neq("status", "ENROLLED")
        .neq("status", "LOST"),
      segmentFilterIds,
    ),
    applyAdmissionSegmentIds(
      supabase
        .from("leads")
        .select("id", { count: "exact", head: true })
        .eq("is_deleted", false)
        .eq("status", "ENROLLED"),
      segmentFilterIds,
    ),
    applyAdmissionSegmentIds(
      supabase
        .from("leads")
        .select("id", { count: "exact", head: true })
        .eq("is_deleted", false)
        .not("next_followup_at", "is", null)
        .gte("next_followup_at", todayStart)
        .lt("next_followup_at", tomorrowStart)
        .neq("status", "ENROLLED")
        .neq("status", "LOST"),
      segmentFilterIds,
    ),
    supabase
      .from("lead_activities")
      .select("id", { count: "exact", head: true })
      .gte("created_at", todayStart),
    supabase
      .from("lead_documents")
      .select("id", { count: "exact", head: true })
      .eq("status", "CHECKED")
      .gte("checked_at", todayStart),
    applyAdmissionSegmentIds(
      supabase
        .from("leads")
        .select(
          "id,lead_code,student_name,student_phone,parent_phone,status,priority,interested_major,next_followup_at,assigned_to,note",
        )
        .eq("is_deleted", false)
        .not("next_followup_at", "is", null)
        .neq("status", "ENROLLED")
        .neq("status", "LOST"),
      segmentFilterIds,
    )
      .order("next_followup_at", { ascending: true })
      .limit(5)
      .returns<UrgentLeadRow[]>(),
    supabase.from("users_profile").select("id,full_name"),
    supabase.rpc("current_user_role_code"),
    supabase
      .from("admission_segments")
      .select(
        "id,segment_code,segment_name,program_group,admission_object,delivery_context,partner_model,commission_model,contract_model,finance_risk,owner_department,sort_order,status",
      )
      .eq("status", "ACTIVE")
      .order("sort_order", { ascending: true })
      .returns<AdmissionSegmentCatalogRow[]>(),
    supabase
      .from("user_admission_segment_scopes")
      .select("segment_id")
      .eq("user_id", user.id)
      .eq("status", "ACTIVE")
      .returns<AdmissionSegmentScopeRow[]>(),
    applyAdmissionSegmentIds(
      supabase
        .from("leads")
        .select("admission_segment_id,status")
        .eq("is_deleted", false),
      segmentFilterIds,
    )
      .limit(5000)
      .returns<AdmissionSegmentLeadStatRow[]>(),
    ...pipelineDefinitions.map((item) =>
      applyAdmissionSegmentIds(
        supabase
          .from("leads")
          .select("id", { count: "exact", head: true })
          .eq("is_deleted", false)
          .eq("status", item.status),
        segmentFilterIds,
      ),
    ),
  ]);

  const totalLeads = totalResult.count ?? 0;
  const enrolledLeads = enrolledResult.count ?? 0;
  const conversionRate =
    totalLeads > 0 ? `${((enrolledLeads / totalLeads) * 100).toFixed(1)}%` : "0%";

  const pipeline = pipelineDefinitions.map((definition, index) => ({
    ...definition,
    count: pipelineResults[index]?.count ?? 0,
  }));
  const visibleSegmentRowsBase = filterAdmissionSegmentsByScope(
    segmentRowsResult.data ?? [],
    segmentScopeRowsResult.data ?? [],
    currentRoleResult.data === "ADMIN" || currentRoleResult.data === "BGH",
  );
  const visibleSegmentRows = workspace.activeSegmentId
    ? visibleSegmentRowsBase.filter(
        (segment) => segment.id === workspace.activeSegmentId,
      )
    : visibleSegmentRowsBase;
  const segmentOverviewData = buildAdmissionSegmentOverview(
    visibleSegmentRows,
    segmentLeadRowsResult.data ?? [],
  );

  const userMap = new Map(
    (userRowsResult.data ?? []).map((row) => [
      String(row.id),
      String(row.full_name ?? ""),
    ]),
  );

  const urgentLeads = (urgentLeadsResult.data ?? []).map((lead) => ({
    id: lead.id,
    name: lead.student_name,
    phone: lead.student_phone ?? lead.parent_phone ?? "Chưa có SĐT",
    owner: lead.assigned_to
      ? userMap.get(lead.assigned_to) ?? "Không rõ"
      : "Chưa phân công",
    status: statusLabels.get(lead.status) ?? lead.status,
    note: lead.note ?? lead.interested_major ?? "Chưa có ghi chú",
    due: formatDue(lead.next_followup_at),
  }));

  const kpis = [
    {
      label: "Tổng lead",
      value: formatNumber(totalLeads),
      trend: "Toàn bộ lead đang hoạt động",
      tone: "border-sky-200 bg-sky-50 text-sky-700",
    },
    {
      label: "Lead mới hôm nay",
      value: formatNumber(newTodayResult.count),
      trend: "Tạo từ 00:00 hôm nay",
      tone: "border-emerald-200 bg-emerald-50 text-emerald-700",
    },
    {
      label: "Cần chăm sóc",
      value: formatNumber(followupOpenResult.count),
      trend: `${formatNumber(todayFollowupResult.count)} lead đến hạn hôm nay`,
      tone: "border-amber-200 bg-amber-50 text-amber-700",
    },
    {
      label: "Đã nhập học",
      value: formatNumber(enrolledLeads),
      trend: `Tỷ lệ chuyển đổi ${conversionRate}`,
      tone: "border-violet-200 bg-violet-50 text-violet-700",
    },
  ];

  const activities = [
    `${formatNumber(activityTodayResult.count)} hoạt động tư vấn được ghi hôm nay`,
    `${formatNumber(documentsCheckedTodayResult.count)} hồ sơ được kiểm tra hôm nay`,
    `${formatNumber(overdueResult.count)} lead đang quá hạn chăm sóc`,
    `${formatNumber(todayFollowupResult.count)} lead cần follow-up trong hôm nay`,
  ];

  return (
    <AppShell
      active="dashboard"
      title="Dashboard tuyển sinh"
      description={
        workspace.activeSegment
          ? `Đang xem dashboard riêng cho: ${workspace.activeSegment.label}.`
          : "Theo dõi lead, follow-up, hồ sơ và chuyển đổi nhập học từ dữ liệu Supabase."
      }
      workspaceSegmentId={workspace.activeSegmentId}
      workspaceReturnTo={withAdmissionSegmentParam(
        "/",
        workspace.activeSegmentId,
      )}
      actions={
        <>
          <Button asChild variant="outline">
            <Link
              href={withAdmissionSegmentParam(
                "/leads",
                workspace.activeSegmentId,
              )}
            >
              <Search className="size-4" />
              Tìm lead
            </Link>
          </Button>
          <Button asChild>
            <Link
              href={withAdmissionSegmentParam(
                "/leads/new",
                workspace.activeSegmentId,
              )}
            >
              <Plus className="size-4" />
              Tạo lead
            </Link>
          </Button>
        </>
      }
    >
      <DashboardOverview
        kpis={kpis}
        pipeline={pipeline}
        urgentLeads={urgentLeads}
        activities={activities}
        segmentOverview={
          <AdmissionSegmentOverview
            segments={segmentOverviewData.segments}
            uncategorizedCount={segmentOverviewData.uncategorizedCount}
            compact
          />
        }
      />
    </AppShell>
  );
}
