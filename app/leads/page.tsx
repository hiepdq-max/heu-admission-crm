import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, RefreshCcw, Upload } from "lucide-react";

import { LeadList } from "@/components/leads/lead-list";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

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

function toLookup<T extends Record<string, unknown>>(
  rows: T[] | null,
  labelKey: keyof T,
): LookupRow[] {
  return (rows ?? []).map((row) => ({
    id: String(row.id),
    label: String(row[labelKey] ?? ""),
  }));
}

export default async function LeadsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: leads, error: leadsError } = await supabase
    .from("leads")
    .select(
      "id,lead_code,student_name,student_phone,parent_name,parent_phone,interested_major,province,district,ward,status,priority,next_followup_at,created_at,source_id,flow_id,admission_segment_id,campaign_id,partner_id,assigned_to,hou_major_id,hou_stage_id",
    )
    .eq("is_deleted", false)
    .order("created_at", { ascending: false })
    .limit(50)
    .returns<LeadRow[]>();

  const [
    { data: sourceRows },
    { data: flowRows },
    { data: segmentRows },
    { data: campaignRows },
    { data: partnerRows },
    { data: userRows },
    { data: houMajorRows },
    { data: houStageRows },
  ] = await Promise.all([
    supabase.from("lead_sources").select("id,source_name"),
    supabase.from("admission_flows").select("id,flow_name"),
    supabase.from("admission_segments").select("id,segment_name"),
    supabase.from("campaigns").select("id,campaign_name").eq("is_deleted", false),
    supabase.from("partners").select("id,partner_name").eq("is_deleted", false),
    supabase.from("users_profile").select("id,full_name"),
    supabase.from("hou_majors").select("id,major_code,major_name"),
    supabase.from("hou_admission_stages").select("id,stage_name"),
  ]);

  return (
    <AppShell
      active="leads"
      title="Lead tuyển sinh"
      description="Danh sách lead thật đang đọc từ Supabase theo phân quyền hiện tại."
      actions={
        <>
          <Button asChild variant="outline">
            <Link href="/leads">
              <RefreshCcw className="size-4" />
              Tải lại
            </Link>
          </Button>
          <Button variant="outline">
            <Upload className="size-4" />
            Import CSV
          </Button>
          <Button asChild>
            <Link href="/leads/new">
              <Plus className="size-4" />
              Tạo lead
            </Link>
          </Button>
        </>
      }
    >
      {leadsError ? (
        <section className="rounded-lg border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">
          Không đọc được bảng leads: {leadsError.message}
        </section>
      ) : (
        <LeadList
          leads={leads ?? []}
          sources={toLookup(sourceRows, "source_name")}
          flows={toLookup(flowRows, "flow_name")}
          segments={toLookup(segmentRows, "segment_name")}
          campaigns={toLookup(campaignRows, "campaign_name")}
          partners={toLookup(partnerRows, "partner_name")}
          users={toLookup(userRows, "full_name")}
          houMajors={(houMajorRows ?? []).map((row) => ({
            id: String(row.id),
            label: `${row.major_code} - ${row.major_name}`,
          }))}
          houStages={toLookup(houStageRows, "stage_name")}
        />
      )}
    </AppShell>
  );
}
