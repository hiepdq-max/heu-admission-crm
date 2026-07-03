import { redirect } from "next/navigation";

import { CampaignForm } from "@/components/campaigns/campaign-form";
import { AppShell } from "@/components/layout/app-shell";
import { createClient } from "@/lib/supabase/server";
import {
  firstParam,
  getAdmissionWorkspaceContext,
  withAdmissionSegmentParam,
} from "@/lib/workspace";

type NewCampaignPageProps = {
  searchParams?: Promise<{
    segment?: string | string[];
  }>;
};

export default async function NewCampaignPage({
  searchParams,
}: NewCampaignPageProps) {
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
  const campaignCreateHref = withAdmissionSegmentParam(
    "/campaigns/new",
    workspace.activeSegmentId,
  );
  const campaignsHref = withAdmissionSegmentParam(
    "/campaigns",
    workspace.activeSegmentId,
  );

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
      workspaceSegmentId={workspace.activeSegmentId}
      workspaceReturnTo={campaignCreateHref}
    >
      <CampaignForm
        sources={(sources ?? []).map((source) => ({
          id: String(source.id),
          label: String(source.source_name ?? ""),
        }))}
        activeSegmentId={workspace.activeSegmentId}
        cancelHref={campaignsHref}
      />
    </AppShell>
  );
}
