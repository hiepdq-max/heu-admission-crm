import Link from "next/link";
import { redirect } from "next/navigation";
import { Users } from "lucide-react";

import { LeadImportForm } from "@/components/import/lead-import-form";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import {
  getAdmissionWorkspaceContext,
  withAdmissionSegmentParam,
} from "@/lib/workspace";

type Option = {
  id: string;
  label: string;
};

type SegmentScopeRow = {
  segment_id: string;
};

type PartnerScopeRow = {
  partner_id: string;
};

type SegmentOptionRow = {
  id: string;
  segment_name: string;
  program_group: string | null;
};

type ImportPageProps = {
  searchParams?: Promise<{
    segment?: string | string[];
  }>;
};

function toOptions<T extends Record<string, unknown>>(
  rows: T[] | null,
  labelKey: keyof T,
): Option[] {
  return (rows ?? []).map((row) => ({
    id: String(row.id),
    label: String(row[labelKey] ?? ""),
  }));
}

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function filterRowsByScope<T extends { id: unknown }>(
  rows: T[] | null,
  allowedIds: Set<string>,
  showAllWhenUnscoped: boolean,
) {
  if (allowedIds.size === 0) {
    return showAllWhenUnscoped ? (rows ?? []) : [];
  }

  return (rows ?? []).filter((row) => allowedIds.has(String(row.id)));
}

export default async function ImportPage({ searchParams }: ImportPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const requestedSegmentParam = firstParam(resolvedSearchParams.segment);
  const workspace = await getAdmissionWorkspaceContext(
    supabase,
    user.id,
    requestedSegmentParam,
  );
  const requestedSegmentId = workspace.activeSegmentId ?? requestedSegmentParam;

  const [
    { data: currentRoleCode },
    { data: sourceRows },
    { data: flowRows },
    { data: segmentRows },
    { data: campaignRows },
    { data: partnerRows },
    { data: segmentScopeRows },
    { data: partnerScopeRows },
  ] = await Promise.all([
      supabase.rpc("current_user_role_code"),
      supabase
        .from("lead_sources")
        .select("id,source_name")
        .eq("status", "ACTIVE")
        .order("source_name", { ascending: true }),
      supabase
        .from("admission_flows")
        .select("id,flow_name")
        .eq("status", "ACTIVE")
        .order("sort_order", { ascending: true }),
      supabase
        .from("admission_segments")
        .select("id,segment_name,program_group")
        .eq("status", "ACTIVE")
        .order("sort_order", { ascending: true })
        .returns<SegmentOptionRow[]>(),
      supabase
        .from("campaigns")
        .select("id,campaign_name")
        .eq("is_deleted", false)
        .order("campaign_name", { ascending: true }),
      supabase
        .from("partners")
        .select("id,partner_name")
        .eq("is_deleted", false)
        .order("partner_name", { ascending: true }),
      supabase
        .from("user_admission_segment_scopes")
        .select("segment_id")
        .eq("user_id", user.id)
        .eq("status", "ACTIVE")
        .returns<SegmentScopeRow[]>(),
      supabase
        .from("user_partner_scopes")
        .select("partner_id")
        .eq("user_id", user.id)
        .eq("status", "ACTIVE")
        .returns<PartnerScopeRow[]>(),
    ]);
  const allowedSegmentIds = new Set(
    (segmentScopeRows ?? []).map((scope) => scope.segment_id),
  );
  const allowedPartnerIds = new Set(
    (partnerScopeRows ?? []).map((scope) => scope.partner_id),
  );
  const canUseGlobalScope =
    currentRoleCode === "ADMIN" || currentRoleCode === "BGH";
  const segmentOptions = filterRowsByScope(
    segmentRows,
    allowedSegmentIds,
    canUseGlobalScope,
  ).map(
    (segment) => ({
      id: String(segment.id),
      label: segment.program_group
        ? `${segment.program_group} - ${segment.segment_name}`
        : segment.segment_name,
    }),
  );
  const partnerOptions = filterRowsByScope(
    partnerRows,
    allowedPartnerIds,
    canUseGlobalScope,
  );
  const defaultSegmentId = segmentOptions.some(
    (segment) => segment.id === requestedSegmentId,
  )
    ? requestedSegmentId ?? ""
    : "";

  return (
    <AppShell
      active="import"
      title="Import dữ liệu"
      description="Nhập lead từ CSV, kiểm tra thiếu dữ liệu và bỏ qua số điện thoại trùng."
      workspaceSegmentId={workspace.activeSegmentId}
      workspaceReturnTo={withAdmissionSegmentParam(
        "/import",
        workspace.activeSegmentId,
      )}
      actions={
        <Button asChild variant="outline">
          <Link
            href={withAdmissionSegmentParam(
              "/leads",
              workspace.activeSegmentId,
            )}
          >
            <Users className="size-4" />
            Xem lead
          </Link>
        </Button>
      }
    >
      <LeadImportForm
        sources={toOptions(sourceRows, "source_name")}
        flows={toOptions(flowRows, "flow_name")}
        segments={segmentOptions}
        campaigns={toOptions(campaignRows, "campaign_name")}
        partners={toOptions(partnerOptions, "partner_name")}
        defaultSegmentId={defaultSegmentId}
        hasSegmentScope={!canUseGlobalScope}
      />
    </AppShell>
  );
}
