import Link from "next/link";
import { redirect } from "next/navigation";
import { Route } from "lucide-react";

import { LeadForm } from "@/components/leads/lead-form";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import {
  buildLeadDynamicFields,
  getAdmissionLeadFormFieldConfigs,
} from "@/lib/admission-dynamic-fields";
import { getAllowedProgramMajorOptions } from "@/lib/admission-segment-program-rules";
import { createClient } from "@/lib/supabase/server";
import {
  getAdmissionWorkspaceContext,
  withAdmissionSegmentParam,
} from "@/lib/workspace";

type Option = {
  id: string;
  label: string;
};

type PartnerScopeRow = {
  partner_id: string;
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
  const workspaceReturnTo = withAdmissionSegmentParam(
    "/leads/new",
    workspace.activeSegmentId,
  );

  if (!workspace.activeSegmentId) {
    return (
      <AppShell
        active="leads"
        title="Tạo lead tuyển sinh"
        description="P0-14 yêu cầu chọn đúng đối tượng tuyển sinh trước khi nhập lead."
        workspaceSegmentId={workspace.activeSegmentId}
        workspaceReturnTo={workspaceReturnTo}
      >
        <section className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-800">
          <div className="flex items-start gap-3">
            <Route className="mt-0.5 size-5 shrink-0" />
            <div>
              <h2 className="font-semibold">
                Chưa chọn workspace để tạo lead
              </h2>
              <p className="mt-1">
                Hãy chọn một đối tượng tuyển sinh ở thanh{" "}
                <strong>P0-13 · Workspace đang làm việc</strong> rồi bấm{" "}
                <strong>Áp dụng</strong>. Sau đó quay lại tạo lead. Cách này
                giúp hệ thống không trộn lead HOU, TTGDTX, ngắn hạn hoặc tuyển
                sinh tại chỗ.
              </p>
              {workspace.segmentOptions.length === 0 ? (
                <p className="mt-2">
                  Tài khoản này hiện chưa được phân đối tượng tuyển sinh. ADMIN
                  hoặc trưởng phòng cần phân phạm vi user trước.
                </p>
              ) : null}
              <Button asChild className="mt-4">
                <Link href="/leads">Quay lại danh sách lead</Link>
              </Button>
            </div>
          </div>
        </section>
      </AppShell>
    );
  }

  const [
    { data: currentRoleCode },
    { data: sourceRows },
    { data: flowRows },
    { data: campaignRows },
    { data: partnerRows },
    programMajorOptions,
    { data: houProgramRows },
    { data: houMajorRows },
    { data: houLocationRows },
    { data: houStageRows },
    { data: partnerScopeRows },
    fieldConfigResult,
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
      getAllowedProgramMajorOptions(supabase, workspace.activeSegmentId),
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
        .from("user_partner_scopes")
        .select("partner_id")
        .eq("user_id", user.id)
        .eq("status", "ACTIVE")
        .returns<PartnerScopeRow[]>(),
      getAdmissionLeadFormFieldConfigs(supabase, workspace.activeSegmentId),
    ]);

  const allowedPartnerIds = new Set(
    (partnerScopeRows ?? []).map((scope) => scope.partner_id),
  );
  const canUseGlobalScope =
    currentRoleCode === "ADMIN" || currentRoleCode === "BGH";
  const partnerOptions = filterRowsByScope(
    partnerRows,
    allowedPartnerIds,
    canUseGlobalScope,
  );
  const segmentSelectOptions = workspace.activeSegment
    ? [
        {
          id: workspace.activeSegment.id,
          label: workspace.activeSegment.label,
          code: workspace.activeSegment.segmentCode,
          programGroup: workspace.activeSegment.programGroup ?? undefined,
        },
      ]
    : [];
  const defaultSegmentId = workspace.activeSegmentId;
  const hasPartnerScope = allowedPartnerIds.size > 0;
  const programs = programMajorOptions.programs;
  const majors = programMajorOptions.majors;
  const dynamicFields = buildLeadDynamicFields(fieldConfigResult.data);

  return (
    <AppShell
      active="leads"
      title="Tạo lead tuyển sinh"
      description="Nhập thông tin học sinh/phụ huynh, nguồn lead và lịch chăm sóc ban đầu."
      workspaceSegmentId={workspace.activeSegmentId}
      workspaceReturnTo={workspaceReturnTo}
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
        hasSegmentScope
        hasPartnerScope={hasPartnerScope}
        defaultSegmentId={defaultSegmentId}
        lockSegmentSelection
        dynamicFields={dynamicFields}
        dynamicConfigError={fieldConfigResult.error?.message}
        cancelHref={withAdmissionSegmentParam("/leads", workspace.activeSegmentId)}
      />
    </AppShell>
  );
}
