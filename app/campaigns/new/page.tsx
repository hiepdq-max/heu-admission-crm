import { redirect } from "next/navigation";

import { CampaignForm } from "@/components/campaigns/campaign-form";
import { AppShell } from "@/components/layout/app-shell";
import { createClient } from "@/lib/supabase/server";

export default async function NewCampaignPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: sources } = await supabase
    .from("lead_sources")
    .select("id,source_name")
    .eq("status", "ACTIVE")
    .order("source_name", { ascending: true });

  return (
    <AppShell
      active="campaigns"
      title="Tạo chiến dịch tuyển sinh"
      description="Tạo chiến dịch để sau này gắn lead và đo hiệu quả chuyển đổi."
    >
      <CampaignForm
        sources={(sources ?? []).map((source) => ({
          id: String(source.id),
          label: String(source.source_name ?? ""),
        }))}
      />
    </AppShell>
  );
}
