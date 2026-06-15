import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, RefreshCcw } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { CampaignsOverview } from "@/components/campaigns/campaigns-overview";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

type CampaignData = {
  id: string;
  campaign_code: string;
  campaign_name: string;
  source_id: string | null;
  start_date: string | null;
  end_date: string | null;
  budget: number | null;
  status: string;
  note: string | null;
};

type LeadData = {
  id: string;
  campaign_id: string | null;
  status: string;
};

function percent(count: number, total: number) {
  if (total <= 0) {
    return "0%";
  }

  return `${((count / total) * 100).toFixed(1)}%`;
}

export default async function CampaignsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [{ data: campaigns, error }, { data: leads }, { data: sources }] =
    await Promise.all([
      supabase
        .from("campaigns")
        .select(
          "id,campaign_code,campaign_name,source_id,start_date,end_date,budget,status,note",
        )
        .order("created_at", { ascending: false })
        .returns<CampaignData[]>(),
      supabase
        .from("leads")
        .select("id,campaign_id,status")
        .eq("is_deleted", false)
        .not("campaign_id", "is", null)
        .returns<LeadData[]>(),
      supabase.from("lead_sources").select("id,source_name"),
    ]);

  const sourceMap = new Map(
    (sources ?? []).map((source) => [
      String(source.id),
      String(source.source_name ?? ""),
    ]),
  );

  const campaignRows = (campaigns ?? []).map((campaign) => {
    const campaignLeads = (leads ?? []).filter(
      (lead) => lead.campaign_id === campaign.id,
    );
    const enrolledCount = campaignLeads.filter(
      (lead) => lead.status === "ENROLLED",
    ).length;

    return {
      ...campaign,
      source_name: campaign.source_id
        ? sourceMap.get(campaign.source_id) ?? "Không rõ"
        : "Chưa gắn nguồn",
      lead_count: campaignLeads.length,
      enrolled_count: enrolledCount,
      conversion: percent(enrolledCount, campaignLeads.length),
    };
  });

  const totalLeads = campaignRows.reduce((sum, row) => sum + row.lead_count, 0);
  const totalEnrolled = campaignRows.reduce(
    (sum, row) => sum + row.enrolled_count,
    0,
  );

  return (
    <AppShell
      active="campaigns"
      title="Chiến dịch tuyển sinh"
      description="Theo dõi chiến dịch tuyển sinh và hiệu quả chuyển đổi từ dữ liệu Supabase."
      actions={
        <>
          <Button asChild variant="outline">
            <Link href="/campaigns">
              <RefreshCcw className="size-4" />
              Tải lại
            </Link>
          </Button>
          <Button asChild>
            <Link href="/campaigns/new">
              <Plus className="size-4" />
              Tạo chiến dịch
            </Link>
          </Button>
        </>
      }
    >
      {error ? (
        <section className="rounded-lg border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">
          Không đọc được dữ liệu chiến dịch: {error.message}
        </section>
      ) : (
        <CampaignsOverview
          campaigns={campaignRows}
          summary={{
            totalCampaigns: campaignRows.length,
            activeCampaigns: campaignRows.filter(
              (row) => row.status === "ACTIVE",
            ).length,
            totalLeads,
            totalEnrolled,
            conversion: percent(totalEnrolled, totalLeads),
          }}
        />
      )}
    </AppShell>
  );
}
