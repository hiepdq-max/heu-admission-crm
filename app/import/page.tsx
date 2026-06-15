import Link from "next/link";
import { redirect } from "next/navigation";
import { Users } from "lucide-react";

import { LeadImportForm } from "@/components/import/lead-import-form";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

type Option = {
  id: string;
  label: string;
};

type SegmentScopeRow = {
  segment_id: string;
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
) {
  if (allowedIds.size === 0) {
    return rows ?? [];
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
  const requestedSegmentId = firstParam(resolvedSearchParams.segment);

  const [
    { data: sourceRows },
    { data: flowRows },
    { data: segmentRows },
    { data: campaignRows },
    { data: partnerRows },
    { data: segmentScopeRows },
  ] = await Promise.all([
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
    ]);
  const allowedSegmentIds = new Set(
    (segmentScopeRows ?? []).map((scope) => scope.segment_id),
  );
  const segmentOptions = filterRowsByScope(segmentRows, allowedSegmentIds).map(
    (segment) => ({
      id: String(segment.id),
      label: segment.program_group
        ? `${segment.program_group} - ${segment.segment_name}`
        : segment.segment_name,
    }),
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
      actions={
        <Button asChild variant="outline">
          <Link href="/leads">
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
        partners={toOptions(partnerRows, "partner_name")}
        defaultSegmentId={defaultSegmentId}
        hasSegmentScope={allowedSegmentIds.size > 0}
      />
    </AppShell>
  );
}
