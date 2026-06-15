import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Plus, RefreshCcw, Upload } from "lucide-react";

import { LeadList } from "@/components/leads/lead-list";
import { AppShell } from "@/components/layout/app-shell";
import { SegmentOperatingProfile } from "@/components/segments/segment-operating-readiness";
import { SegmentWorkspaceGuide } from "@/components/segments/segment-workspace-guide";
import { Button } from "@/components/ui/button";
import type {
  AdmissionSegmentCatalogRow,
  AdmissionSegmentFieldRuleRow,
  AdmissionSegmentOperationStepRow,
  AdmissionSegmentReadinessRow,
  AdmissionSegmentScopeRow,
  AdmissionSegmentWorkspaceRow,
} from "@/lib/admission-segments";
import { createClient } from "@/lib/supabase/server";

type PageProps = {
  params: Promise<{ id: string }>;
};

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

type SegmentLookupRow = {
  id: string;
  segment_name: string;
  program_group: string | null;
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

function canOpenSegment(
  segmentId: string,
  roleCode: string | null,
  scopes: AdmissionSegmentScopeRow[],
) {
  if (roleCode === "ADMIN" || scopes.length === 0) {
    return true;
  }

  return scopes.some((scope) => scope.segment_id === segmentId);
}

export default async function SegmentDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [
    currentRoleResult,
    segmentResult,
    segmentScopeRowsResult,
    leadsResult,
    sourceRowsResult,
    flowRowsResult,
    segmentRowsResult,
    campaignRowsResult,
    partnerRowsResult,
    userRowsResult,
    houMajorRowsResult,
    houStageRowsResult,
    workspaceResult,
    operationStepsResult,
    fieldRulesResult,
    readinessResult,
  ] = await Promise.all([
    supabase.rpc("current_user_role_code"),
    supabase
      .from("admission_segments")
      .select(
        "id,segment_code,segment_name,program_group,admission_object,delivery_context,partner_model,commission_model,contract_model,finance_risk,owner_department,sort_order,status",
      )
      .eq("id", id)
      .eq("status", "ACTIVE")
      .maybeSingle<AdmissionSegmentCatalogRow>(),
    supabase
      .from("user_admission_segment_scopes")
      .select("segment_id")
      .eq("user_id", user.id)
      .eq("status", "ACTIVE")
      .returns<AdmissionSegmentScopeRow[]>(),
    supabase
      .from("leads")
      .select(
        "id,lead_code,student_name,student_phone,parent_name,parent_phone,interested_major,province,district,ward,status,priority,next_followup_at,created_at,source_id,flow_id,admission_segment_id,campaign_id,partner_id,assigned_to,hou_major_id,hou_stage_id",
      )
      .eq("is_deleted", false)
      .eq("admission_segment_id", id)
      .order("created_at", { ascending: false })
      .limit(100)
      .returns<LeadRow[]>(),
    supabase.from("lead_sources").select("id,source_name"),
    supabase.from("admission_flows").select("id,flow_name"),
    supabase
      .from("admission_segments")
      .select("id,segment_name,program_group")
      .eq("status", "ACTIVE")
      .order("sort_order", { ascending: true })
      .returns<SegmentLookupRow[]>(),
    supabase.from("campaigns").select("id,campaign_name").eq("is_deleted", false),
    supabase.from("partners").select("id,partner_name").eq("is_deleted", false),
    supabase.from("users_profile").select("id,full_name"),
    supabase.from("hou_majors").select("id,major_code,major_name"),
    supabase.from("hou_admission_stages").select("id,stage_name"),
    supabase
      .from("admission_segment_workspaces")
      .select(
        "id,segment_id,workspace_code,operating_model,lead_scope_rule,required_partner,required_contract,required_commission_policy,required_finance_tracking,required_document_checklist,required_handover_cthssv,hou_controls_enabled,ai_allowed,ai_policy,control_note,control_status",
      )
      .eq("segment_id", id)
      .eq("status", "ACTIVE")
      .maybeSingle<AdmissionSegmentWorkspaceRow>(),
    supabase
      .from("admission_segment_operation_steps")
      .select(
        "id,segment_id,step_code,step_name,step_group,owner_department,action_href,required_for_operation,control_note,sort_order,control_status",
      )
      .eq("segment_id", id)
      .eq("status", "ACTIVE")
      .order("sort_order", { ascending: true })
      .returns<AdmissionSegmentOperationStepRow[]>(),
    supabase
      .from("admission_segment_field_rules")
      .select(
        "id,segment_id,field_code,field_label,field_group,is_visible,is_required,help_text,sort_order,control_status",
      )
      .eq("segment_id", id)
      .eq("status", "ACTIVE")
      .order("sort_order", { ascending: true })
      .returns<AdmissionSegmentFieldRuleRow[]>(),
    supabase
      .from("admission_segment_operating_readiness")
      .select(
        "segment_id,segment_code,segment_name,program_group,owner_department,workspace_id,workspace_code,operating_model,required_partner,required_contract,required_commission_policy,required_finance_tracking,required_document_checklist,required_handover_cthssv,hou_controls_enabled,ai_allowed,control_status,lead_count,enrolled_count,scoped_user_count,operation_step_count,required_step_count,visible_field_count,required_field_count,has_workspace_profile,has_required_steps,has_required_fields,has_user_scope,readiness_score,readiness_status,missing_items,ai_gate_status",
      )
      .eq("segment_id", id)
      .maybeSingle<AdmissionSegmentReadinessRow>(),
  ]);

  const segment = segmentResult.data;

  if (
    segmentResult.error ||
    !segment ||
    !canOpenSegment(
      id,
      currentRoleResult.data,
      segmentScopeRowsResult.data ?? [],
    )
  ) {
    notFound();
  }

  const segmentLookups = (segmentRowsResult.data ?? []).map((row) => ({
    id: String(row.id),
    label: row.program_group
      ? `${row.program_group} - ${row.segment_name}`
      : row.segment_name,
  }));

  return (
    <AppShell
      active="segments"
      title={segment.segment_name}
      description={`Khu làm việc riêng cho ${segment.program_group}. Lead bên dưới chỉ thuộc đối tượng này.`}
      actions={
        <>
          <Button asChild variant="outline">
            <Link href={`/segments/${id}`}>
              <RefreshCcw className="size-4" />
              Tải lại
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={`/import?segment=${id}`}>
              <Upload className="size-4" />
              Import cho đối tượng này
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/leads/new?segment=${id}`}>
              <Plus className="size-4" />
              Tạo lead trong đối tượng
            </Link>
          </Button>
        </>
      }
    >
      <SegmentWorkspaceGuide segment={segment} />
      <SegmentOperatingProfile
        readiness={readinessResult.data}
        workspace={workspaceResult.data}
        steps={operationStepsResult.data ?? []}
        fieldRules={fieldRulesResult.data ?? []}
        loadError={
          workspaceResult.error?.message ??
          operationStepsResult.error?.message ??
          fieldRulesResult.error?.message ??
          readinessResult.error?.message
        }
      />

      {leadsResult.error ? (
        <section className="rounded-lg border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">
          Không đọc được lead của đối tượng này: {leadsResult.error.message}
        </section>
      ) : (
        <LeadList
          leads={leadsResult.data ?? []}
          sources={toLookup(sourceRowsResult.data, "source_name")}
          flows={toLookup(flowRowsResult.data, "flow_name")}
          segments={segmentLookups}
          campaigns={toLookup(campaignRowsResult.data, "campaign_name")}
          partners={toLookup(partnerRowsResult.data, "partner_name")}
          users={toLookup(userRowsResult.data, "full_name")}
          houMajors={(houMajorRowsResult.data ?? []).map((row) => ({
            id: String(row.id),
            label: `${row.major_code} - ${row.major_name}`,
          }))}
          houStages={toLookup(houStageRowsResult.data, "stage_name")}
        />
      )}
    </AppShell>
  );
}
