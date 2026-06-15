import { redirect } from "next/navigation";
import { RefreshCcw } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { ReportsOverview } from "@/components/reports/reports-overview";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

type LeadReportRow = {
  id: string;
  status: string;
  source_id: string | null;
  flow_id: string | null;
  assigned_to: string | null;
  lost_reason: string | null;
  interested_major: string | null;
  next_followup_at: string | null;
  created_at: string;
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

const lostReasonLabels: Record<string, string> = {
  NO_NEED: "Không còn nhu cầu",
  NO_CONTACT: "Không liên hệ được",
  WRONG_PHONE: "Sai số điện thoại",
  CHOSE_OTHER_SCHOOL: "Chọn trường khác",
  TUITION_CONCERN: "Lo ngại học phí",
  DISTANCE: "Xa địa điểm học",
  FAMILY_NOT_AGREE: "Gia đình không đồng ý",
  NOT_ELIGIBLE: "Không đủ điều kiện",
  DUPLICATE: "Trùng dữ liệu",
  OTHER: "Khác",
};

function toLookupMap<T extends Record<string, unknown>>(
  rows: T[] | null,
  labelKey: keyof T,
) {
  return new Map(
    (rows ?? []).map((row) => [String(row.id), String(row[labelKey] ?? "")]),
  );
}

function percent(count: number, total: number) {
  if (total <= 0) {
    return "0%";
  }

  return `${((count / total) * 100).toFixed(1)}%`;
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("vi-VN").format(value);
}

function groupRows(
  leads: LeadReportRow[],
  getKey: (lead: LeadReportRow) => string | null,
  getLabel: (key: string) => string,
  total: number,
) {
  const counts = new Map<string, number>();

  for (const lead of leads) {
    const key = getKey(lead);

    if (!key) {
      continue;
    }

    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([key, count]) => ({
      key,
      label: getLabel(key),
      count,
      percent: percent(count, total),
    }))
    .sort((a, b) => b.count - a.count);
}

function startOfToday() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export default async function ReportsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [
    { data: leads },
    { data: sourceRows },
    { data: flowRows },
    { data: userRows },
  ] = await Promise.all([
      supabase
        .from("leads")
        .select(
          "id,status,source_id,flow_id,assigned_to,lost_reason,interested_major,next_followup_at,created_at",
        )
        .eq("is_deleted", false)
        .order("created_at", { ascending: false })
        .limit(5000)
        .returns<LeadReportRow[]>(),
      supabase.from("lead_sources").select("id,source_name"),
      supabase.from("admission_flows").select("id,flow_name"),
      supabase.from("users_profile").select("id,full_name"),
    ]);

  const leadRows = leads ?? [];
  const total = leadRows.length;
  const enrolled = leadRows.filter((lead) => lead.status === "ENROLLED").length;
  const lost = leadRows.filter((lead) => lead.status === "LOST").length;
  const todayStart = startOfToday();
  const newToday = leadRows.filter(
    (lead) => new Date(lead.created_at) >= todayStart,
  ).length;
  const openFollowups = leadRows.filter(
    (lead) =>
      lead.next_followup_at &&
      lead.status !== "ENROLLED" &&
      lead.status !== "LOST",
  ).length;

  const sourceMap = toLookupMap(sourceRows, "source_name");
  const flowMap = toLookupMap(flowRows, "flow_name");
  const userMap = toLookupMap(userRows, "full_name");

  const statusRows = groupRows(
    leadRows,
    (lead) => lead.status,
    (key) => statusLabels[key] ?? key,
    total,
  );

  const sourceRowsReport = groupRows(
    leadRows,
    (lead) => lead.source_id ?? "UNKNOWN_SOURCE",
    (key) => (key === "UNKNOWN_SOURCE" ? "Chưa rõ nguồn" : sourceMap.get(key) ?? "Không rõ"),
    total,
  );

  const flowRowsReport = groupRows(
    leadRows,
    (lead) => lead.flow_id ?? "UNKNOWN_FLOW",
    (key) =>
      key === "UNKNOWN_FLOW"
        ? "Chưa phân loại luồng"
        : flowMap.get(key) ?? "Không rõ luồng",
    total,
  );

  const lostReasonRows = groupRows(
    leadRows.filter((lead) => lead.status === "LOST"),
    (lead) => lead.lost_reason ?? "UNKNOWN_REASON",
    (key) =>
      key === "UNKNOWN_REASON"
        ? "Chưa nhập lý do"
        : lostReasonLabels[key] ?? key,
    lost || 1,
  );

  const majorRows = groupRows(
    leadRows,
    (lead) => lead.interested_major?.trim() || "UNKNOWN_MAJOR",
    (key) => (key === "UNKNOWN_MAJOR" ? "Chưa rõ ngành" : key),
    total,
  );

  const counselorIds = Array.from(
    new Set(leadRows.map((lead) => lead.assigned_to).filter(Boolean)),
  ) as string[];

  const counselorRows = counselorIds
    .map((id) => {
      const owned = leadRows.filter((lead) => lead.assigned_to === id);
      const ownedEnrolled = owned.filter(
        (lead) => lead.status === "ENROLLED",
      ).length;
      const ownedFollowups = owned.filter(
        (lead) =>
          lead.next_followup_at &&
          lead.status !== "ENROLLED" &&
          lead.status !== "LOST",
      ).length;

      return {
        key: id,
        name: userMap.get(id) ?? "Không rõ",
        total: owned.length,
        enrolled: ownedEnrolled,
        followups: ownedFollowups,
        conversion: percent(ownedEnrolled, owned.length),
      };
    })
    .sort((a, b) => b.total - a.total);

  const conversionRate = percent(enrolled, total);

  return (
    <AppShell
      active="reports"
      title="Báo cáo tuyển sinh"
      description="Tổng hợp hiệu quả nguồn lead, tư vấn viên, ngành, địa bàn và chuyển đổi từ dữ liệu Supabase."
      actions={
        <Button asChild variant="outline">
          <a href="/reports">
            <RefreshCcw className="size-4" />
            Tải lại
          </a>
        </Button>
      }
    >
      <ReportsOverview
        summary={[
          {
            label: "Tổng lead",
            value: formatNumber(total),
            note: "Lead đang hoạt động trong CRM",
            tone: "border-sky-200 bg-sky-50 text-sky-700",
          },
          {
            label: "Lead mới hôm nay",
            value: formatNumber(newToday),
            note: "Tạo từ 00:00 hôm nay",
            tone: "border-emerald-200 bg-emerald-50 text-emerald-700",
          },
          {
            label: "Chuyển đổi",
            value: conversionRate,
            note: `${formatNumber(enrolled)} lead đã nhập học`,
            tone: "border-violet-200 bg-violet-50 text-violet-700",
          },
          {
            label: "Cần chăm sóc",
            value: formatNumber(openFollowups),
            note: `${formatNumber(lost)} lead đã mất`,
            tone: "border-amber-200 bg-amber-50 text-amber-700",
          },
        ]}
        statusRows={statusRows}
        sourceRows={sourceRowsReport}
        flowRows={flowRowsReport}
        counselorRows={counselorRows}
        lostReasonRows={lostReasonRows}
        majorRows={majorRows}
      />
    </AppShell>
  );
}
