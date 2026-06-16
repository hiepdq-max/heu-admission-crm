import { redirect } from "next/navigation";

import { LeadForm } from "@/components/leads/lead-form";
import { AppShell } from "@/components/layout/app-shell";
import { createClient } from "@/lib/supabase/server";
import {
  getAdmissionWorkspaceContext,
  withAdmissionSegmentParam,
} from "@/lib/workspace";

type Option = {
  id: string;
  label: string;
};

type MajorOption = Option & {
  programId: string | null;
  programLabel: string | null;
};

type SegmentScopeRow = {
  segment_id: string;
};

type PartnerScopeRow = {
  partner_id: string;
};

type SegmentOptionRow = {
  id: string;
  segment_code: string;
  segment_name: string;
  program_group: string | null;
};

type NewLeadPageProps = {
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

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function NewLeadPage({ searchParams }: NewLeadPageProps) {
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
    { data: campaignRows },
    { data: partnerRows },
    { data: segmentRows },
    { data: programRows },
    { data: majorRows },
    { data: houProgramRows },
    { data: houMajorRows },
    { data: houLocationRows },
    { data: houStageRows },
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
        .from("campaigns")
        .select("id,campaign_name")
        .eq("is_deleted", false)
        .eq("status", "ACTIVE")
        .order("campaign_name", { ascending: true }),
      supabase
        .from("partners")
        .select("id,partner_name")
        .eq("is_deleted", false)
        .eq("status", "ACTIVE")
        .order("partner_name", { ascending: true }),
      supabase
        .from("admission_segments")
        .select("id,segment_code,segment_name,program_group")
        .eq("status", "ACTIVE")
        .order("sort_order", { ascending: true })
        .returns<SegmentOptionRow[]>(),
      supabase
        .from("admission_programs")
        .select("id,program_name")
        .eq("status", "ACTIVE")
        .order("sort_order", { ascending: true }),
      supabase
        .from("admission_majors")
        .select("id,major_name,program_id")
        .eq("status", "ACTIVE")
        .order("sort_order", { ascending: true }),
      supabase
        .from("hou_programs")
        .select("id,program_name")
        .eq("status", "ACTIVE")
        .order("program_name", { ascending: true }),
      supabase
        .from("hou_majors")
        .select("id,major_code,major_name")
        .eq("status", "ACTIVE")
        .order("sort_order", { ascending: true }),
      supabase
        .from("hou_locations")
        .select("id,location_name")
        .eq("status", "ACTIVE")
        .order("location_name", { ascending: true }),
      supabase
        .from("hou_admission_stages")
        .select("id,stage_name")
        .eq("status", "ACTIVE")
        .order("sort_order", { ascending: true }),
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
  );
  const partnerOptions = filterRowsByScope(
    partnerRows,
    allowedPartnerIds,
    canUseGlobalScope,
  );
  const segmentSelectOptions = segmentOptions.map((segment) => ({
    id: String(segment.id),
    label: segment.program_group
      ? `${segment.program_group} - ${segment.segment_name}`
      : segment.segment_name,
    code: segment.segment_code,
    programGroup: segment.program_group ?? undefined,
  }));
  const defaultSegmentId = segmentSelectOptions.some(
    (segment) => segment.id === requestedSegmentId,
  )
    ? requestedSegmentId ?? ""
    : "";
  const hasSegmentScope = !canUseGlobalScope;
  const hasPartnerScope = allowedPartnerIds.size > 0;
  const programs = toOptions(programRows, "program_name");
  const programMap = new Map(programs.map((program) => [program.id, program.label]));
  const majors: MajorOption[] = (majorRows ?? []).map((row) => ({
    id: String(row.id),
    label: String(row.major_name ?? ""),
    programId: row.program_id ? String(row.program_id) : null,
    programLabel: row.program_id
      ? programMap.get(String(row.program_id)) ?? null
      : null,
  }));

  return (
    <AppShell
      active="leads"
      title="Tạo lead tuyển sinh"
      description="Nhập thông tin học sinh/phụ huynh, nguồn lead và lịch chăm sóc ban đầu."
      workspaceSegmentId={workspace.activeSegmentId}
      workspaceReturnTo={withAdmissionSegmentParam(
        "/leads/new",
        workspace.activeSegmentId,
      )}
    >
      <LeadForm
        sources={toOptions(sourceRows, "source_name")}
        flows={toOptions(flowRows, "flow_name")}
        campaigns={toOptions(campaignRows, "campaign_name")}
        partners={toOptions(partnerOptions, "partner_name")}
        segments={segmentSelectOptions}
        programs={programs}
        majors={majors}
        houPrograms={toOptions(houProgramRows, "program_name")}
        houMajors={(houMajorRows ?? []).map((row) => ({
          id: String(row.id),
          label: `${row.major_code} - ${row.major_name}`,
        }))}
        houLocations={toOptions(houLocationRows, "location_name")}
        houStages={toOptions(houStageRows, "stage_name")}
        hasSegmentScope={hasSegmentScope}
        hasPartnerScope={hasPartnerScope}
        defaultSegmentId={defaultSegmentId}
      />
    </AppShell>
  );
}
