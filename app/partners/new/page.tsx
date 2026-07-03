import { redirect } from "next/navigation";

import { AppShell } from "@/components/layout/app-shell";
import { PartnerForm } from "@/components/partners/partner-form";
import { createClient } from "@/lib/supabase/server";
import {
  firstParam,
  getAdmissionWorkspaceContext,
  withAdmissionSegmentParam,
} from "@/lib/workspace";

type NewPartnerPageProps = {
  searchParams?: Promise<{
    segment?: string | string[];
  }>;
};

export default async function NewPartnerPage({
  searchParams,
}: NewPartnerPageProps) {
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
  const partnerCreateHref = withAdmissionSegmentParam(
    "/partners/new",
    workspace.activeSegmentId,
  );
  const partnersHref = withAdmissionSegmentParam(
    "/partners",
    workspace.activeSegmentId,
  );

  return (
    <AppShell
      active="partners"
      title="Tạo đối tác / CTV / TTGDTX"
      description="Nhập thông tin đối tác mang lead về cho tuyển sinh."
      workspaceSegmentId={workspace.activeSegmentId}
      workspaceReturnTo={partnerCreateHref}
    >
      <PartnerForm
        activeSegmentId={workspace.activeSegmentId}
        cancelHref={partnersHref}
      />
    </AppShell>
  );
}
