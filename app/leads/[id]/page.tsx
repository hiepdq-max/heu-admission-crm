import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Pencil } from "lucide-react";

import { ActivityForm } from "@/components/leads/activity-form";
import { ActivityTimeline } from "@/components/leads/activity-timeline";
import { DocumentChecklist } from "@/components/leads/document-checklist";
import {
  LeadConditionChecklist,
  type LeadConditionCheckRow,
  type LeadConditionTemplateRow,
} from "@/components/leads/lead-condition-checklist";
import {
  HouCommissionClaimForm,
  type HouCommissionClaimLineRow,
  type HouCommissionClaimRow,
  type HouCommissionPayeeOption,
  type HouCommissionPolicyOption,
} from "@/components/leads/hou-commission-claim-form";
import {
  HouEvidenceFiles,
  type HouEvidenceFileRow,
} from "@/components/leads/hou-evidence-files";
import { HouLeadForm } from "@/components/leads/hou-lead-form";
import { HouLeadWorkspace } from "@/components/leads/hou-lead-workspace";
import { LeadDetail } from "@/components/leads/lead-detail";
import { StatusUpdateForm } from "@/components/leads/status-update-form";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

type PageProps = {
  params: Promise<{ id: string }>;
};

type LeadDetailData = {
  id: string;
  lead_code: string;
  student_name: string;
  student_phone: string | null;
  student_dob: string | null;
  student_gender: string | null;
  parent_name: string | null;
  parent_phone: string | null;
  parent_relationship: string | null;
  current_school: string | null;
  current_grade: string | null;
  graduation_year: number | null;
  interested_program: string | null;
  interested_major: string | null;
  province: string | null;
  district: string | null;
  ward: string | null;
  status: string;
  priority: string;
  lost_reason: string | null;
  next_followup_at: string | null;
  note: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  source_id: string | null;
  flow_id: string | null;
  campaign_id: string | null;
  partner_id: string | null;
  assigned_to: string | null;
  hou_program_id: string | null;
  hou_major_id: string | null;
  hou_location_id: string | null;
  hou_admin_class_id: string | null;
  hou_stage_id: string | null;
  hou_admission_system_status: string | null;
  hou_admission_system_synced_at: string | null;
  hou_first_term_tuition_confirmed: boolean;
  hou_first_term_tuition_confirmed_at: string | null;
  hou_enrollment_recorded_at: string | null;
};

type ActivityRow = {
  id: string;
  activity_type: string;
  activity_result: string | null;
  content: string;
  next_action: string | null;
  next_followup_at: string | null;
  created_by: string | null;
  created_at: string;
};

type LookupRow = {
  id: string;
  label: string;
};

type UserLookupRow = {
  id: string;
  full_name: string | null;
  role_id: string | null;
};

type RoleLookupRow = {
  id: string;
  code: string;
};

type ChecklistRow = {
  id: string;
  document_code: string;
  document_name: string;
  is_required: boolean;
  sort_order: number;
};

type LeadDocumentRow = {
  id: string;
  checklist_id: string | null;
  document_type: string;
  status: string;
  file_url: string | null;
  note: string | null;
  checked_at: string | null;
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

async function getLookupLabel(
  table:
    | "lead_sources"
    | "admission_flows"
    | "campaigns"
    | "partners"
    | "users_profile",
  id: string | null,
  labelColumn: string,
) {
  if (!id) {
    return null;
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from(table)
    .select(labelColumn)
    .eq("id", id)
    .maybeSingle();

  if (!data) {
    return null;
  }

  return String((data as unknown as Record<string, unknown>)[labelColumn] ?? "");
}

export default async function LeadDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: lead, error } = await supabase
    .from("leads")
    .select(
      "id,lead_code,student_name,student_phone,student_dob,student_gender,parent_name,parent_phone,parent_relationship,current_school,current_grade,graduation_year,interested_program,interested_major,province,district,ward,status,priority,lost_reason,next_followup_at,note,created_by,created_at,updated_at,source_id,flow_id,campaign_id,partner_id,assigned_to,hou_program_id,hou_major_id,hou_location_id,hou_admin_class_id,hou_stage_id,hou_admission_system_status,hou_admission_system_synced_at,hou_first_term_tuition_confirmed,hou_first_term_tuition_confirmed_at,hou_enrollment_recorded_at",
    )
    .eq("id", id)
    .eq("is_deleted", false)
    .maybeSingle<LeadDetailData>();

  if (error || !lead) {
    notFound();
  }

  const [
    sourceName,
    flowName,
    campaignName,
    partnerName,
    ownerName,
    houProgramRowsResult,
    houMajorRowsResult,
    houLocationRowsResult,
    houStageRowsResult,
    activitiesResult,
    userRowsResult,
    roleRowsResult,
    checklistResult,
    documentsResult,
    conditionTemplatesResult,
    conditionChecksResult,
    activityCountResult,
    documentCountResult,
  ] = await Promise.all([
    getLookupLabel("lead_sources", lead.source_id, "source_name"),
    getLookupLabel("admission_flows", lead.flow_id, "flow_name"),
    getLookupLabel("campaigns", lead.campaign_id, "campaign_name"),
    getLookupLabel("partners", lead.partner_id, "partner_name"),
    getLookupLabel("users_profile", lead.assigned_to, "full_name"),
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
      .from("lead_activities")
      .select(
        "id,activity_type,activity_result,content,next_action,next_followup_at,created_by,created_at",
      )
      .eq("lead_id", lead.id)
      .order("created_at", { ascending: false })
      .limit(20)
      .returns<ActivityRow[]>(),
    supabase
      .from("users_profile")
      .select("id,full_name,role_id")
      .returns<UserLookupRow[]>(),
    supabase.from("roles").select("id,code").returns<RoleLookupRow[]>(),
    supabase
      .from("enrollment_checklists")
      .select("id,document_code,document_name,is_required,sort_order")
      .eq("status", "ACTIVE")
      .order("sort_order", { ascending: true })
      .returns<ChecklistRow[]>(),
    supabase
      .from("lead_documents")
      .select("id,checklist_id,document_type,status,file_url,note,checked_at")
      .eq("lead_id", lead.id)
      .returns<LeadDocumentRow[]>(),
    supabase
      .from("lead_condition_templates")
      .select(
        "id,condition_scope,condition_code,condition_name,condition_description,is_required_default,sort_order",
      )
      .eq("status", "ACTIVE")
      .order("sort_order", { ascending: true })
      .returns<LeadConditionTemplateRow[]>(),
    supabase
      .from("lead_condition_checks")
      .select(
        "id,lead_id,condition_template_id,condition_scope,condition_code,condition_name,is_required,is_checked,note,checked_at",
      )
      .eq("lead_id", lead.id)
      .eq("status", "ACTIVE")
      .returns<LeadConditionCheckRow[]>(),
    supabase
      .from("lead_activities")
      .select("id", { count: "exact", head: true })
      .eq("lead_id", lead.id),
    supabase
      .from("lead_documents")
      .select("id", { count: "exact", head: true })
      .eq("lead_id", lead.id),
  ]);

  const houPrograms = toLookup(houProgramRowsResult.data, "program_name");
  const houMajors = (houMajorRowsResult.data ?? []).map((row) => ({
    id: String(row.id),
    label: `${row.major_code} - ${row.major_name}`,
  }));
  const houLocations = toLookup(houLocationRowsResult.data, "location_name");
  const houStages = toLookup(houStageRowsResult.data, "stage_name");
  const houProgramName =
    houPrograms.find((item) => item.id === lead.hou_program_id)?.label ?? null;
  const houMajorName =
    houMajors.find((item) => item.id === lead.hou_major_id)?.label ?? null;
  const houLocationName =
    houLocations.find((item) => item.id === lead.hou_location_id)?.label ?? null;
  const houStageName =
    houStages.find((item) => item.id === lead.hou_stage_id)?.label ?? null;
  const userNameMap = new Map(
    (userRowsResult.data ?? []).map((profile) => [
      profile.id,
      profile.full_name ?? "Không rõ tên",
    ]),
  );
  const creatorName = lead.created_by ? userNameMap.get(lead.created_by) ?? null : null;
  const lastActivity = activitiesResult.data?.[0];
  const lastUpdatedByName = lastActivity?.created_by
    ? userNameMap.get(lastActivity.created_by) ?? null
    : null;
  const currentUserProfile = userRowsResult.data?.find(
    (profile) => profile.id === user.id,
  );
  const currentRoleCode =
    roleRowsResult.data?.find((role) => role.id === currentUserProfile?.role_id)
      ?.code ?? "";
  const canManageHouCommission = [
    "ADMIN",
    "BGH",
    "ADMISSION_HEAD",
    "ACCOUNTING",
  ].includes(currentRoleCode);
  const today = new Date().toISOString().slice(0, 10);
  const defaultFirstTuitionPaidAt =
    lead.hou_first_term_tuition_confirmed_at?.slice(0, 10) ?? "";
  const defaultCommissionBaseDate = defaultFirstTuitionPaidAt || today;
  let houCommissionPolicies: HouCommissionPolicyOption[] = [];
  let houCommissionPayees: HouCommissionPayeeOption[] = [];
  let houCommissionClaims: HouCommissionClaimRow[] = [];
  let houCommissionClaimLines: HouCommissionClaimLineRow[] = [];
  let houCommissionLoadError: string | undefined;

  if (canManageHouCommission) {
    const [policyResult, payeeResult, claimResult] = await Promise.all([
      supabase
        .from("hou_commission_policies")
        .select(
          "id,policy_code,policy_name,effective_from,effective_to,status",
        )
        .order("effective_from", { ascending: false })
        .returns<HouCommissionPolicyOption[]>(),
      supabase
        .from("hou_commission_payees")
        .select("id,payee_type,payee_code,payee_name,status")
        .order("payee_name", { ascending: true })
        .returns<HouCommissionPayeeOption[]>(),
      supabase
        .from("hou_commission_claims")
        .select(
          "id,policy_id,payee_id,classification,hou_student_code,student_name,commission_base_date,claim_status,dropout_risk_level,debt_offset_amount_vnd,created_at",
        )
        .eq("lead_id", lead.id)
        .neq("claim_status", "CANCELLED")
        .order("created_at", { ascending: false })
        .returns<HouCommissionClaimRow[]>(),
    ]);

    houCommissionPolicies = policyResult.data ?? [];
    houCommissionPayees = payeeResult.data ?? [];
    houCommissionClaims = claimResult.data ?? [];

    const commissionErrors = [
      policyResult.error?.message,
      payeeResult.error?.message,
      claimResult.error?.message,
    ].filter(Boolean);

    if (houCommissionClaims.length > 0) {
      const { data: claimLineData, error: claimLineError } = await supabase
        .from("hou_commission_claim_lines")
        .select(
          "id,claim_id,component_code,component_name,gross_amount_vnd,tax_withheld_vnd,debt_offset_amount_vnd,net_amount_vnd,line_status",
        )
        .in(
          "claim_id",
          houCommissionClaims.map((claim) => claim.id),
        )
        .returns<HouCommissionClaimLineRow[]>();

      houCommissionClaimLines = claimLineData ?? [];

      if (claimLineError?.message) {
        commissionErrors.push(claimLineError.message);
      }
    }

    houCommissionLoadError = commissionErrors[0];
  }

  let houEvidenceFiles: HouEvidenceFileRow[] = [];
  let houEvidenceLoadError: string | undefined;
  const { data: houEvidenceData, error: houEvidenceError } = await supabase
    .from("hou_evidence_files")
    .select(
      "id,evidence_scope,lead_id,location_id,claim_id,evidence_type,evidence_title,file_url,file_name,file_mime_hint,file_date,confidential_level,note,status,created_at",
    )
    .eq("lead_id", lead.id)
    .eq("status", "ACTIVE")
    .order("created_at", { ascending: false })
    .returns<HouEvidenceFileRow[]>();

  if (houEvidenceError) {
    houEvidenceLoadError = houEvidenceError.message;
  } else {
    houEvidenceFiles = houEvidenceData ?? [];
  }

  const checklistRows = checklistResult.data ?? [];
  const documentRows = documentsResult.data ?? [];
  const conditionTemplates = conditionTemplatesResult.data ?? [];
  const conditionChecks = conditionChecksResult.data ?? [];
  const conditionChecklistLoadError =
    conditionTemplatesResult.error?.message ?? conditionChecksResult.error?.message;
  const documentByChecklistId = new Map(
    documentRows
      .filter((document) => document.checklist_id)
      .map((document) => [document.checklist_id as string, document]),
  );
  const requiredChecklistRows = checklistRows.filter((item) => item.is_required);
  const readyDocumentStatuses = new Set(["SUBMITTED", "CHECKED"]);
  const readyRequiredDocuments = requiredChecklistRows.filter((item) => {
    const document = documentByChecklistId.get(item.id);

    return document ? readyDocumentStatuses.has(document.status) : false;
  });
  const missingRequiredDocumentNames = requiredChecklistRows
    .filter((item) => {
      const document = documentByChecklistId.get(item.id);

      return !document || !readyDocumentStatuses.has(document.status);
    })
    .map((item) => item.document_name);
  const conditionCheckByCode = new Map(
    conditionChecks.map((check) => [check.condition_code, check]),
  );
  const requiredConditionTemplates = conditionTemplates.filter((template) => {
    const check = conditionCheckByCode.get(template.condition_code);

    return (
      template.condition_scope !== "OTHER" ||
      check?.is_required ||
      template.is_required_default
    );
  });
  const readyRequiredConditions = requiredConditionTemplates.filter((template) => {
    const check = conditionCheckByCode.get(template.condition_code);

    return check?.is_checked;
  });
  const missingRequiredConditionNames = requiredConditionTemplates
    .filter((template) => {
      const check = conditionCheckByCode.get(template.condition_code);

      return !check?.is_checked;
    })
    .map((template) => template.condition_name);
  const activeHouCommissionClaimLines = houCommissionClaimLines.filter(
    (line) => line.line_status !== "CANCELLED",
  );
  const houClaimNetTotalVnd = canManageHouCommission
    ? activeHouCommissionClaimLines.reduce(
        (total, line) => total + line.net_amount_vnd,
        0,
      )
    : null;
  const latestHouCommissionClaim = houCommissionClaims[0] ?? null;

  return (
    <AppShell
      active="leads"
      title="Chi tiết lead"
      description={`${lead.lead_code} - ${lead.student_name}`}
      actions={
        <>
          <Button asChild variant="outline">
            <Link href="/leads">
              <ArrowLeft className="size-4" />
              Danh sách lead
            </Link>
          </Button>
          <Button variant="outline">
            <Pencil className="size-4" />
            Sửa lead
          </Button>
        </>
      }
    >
      <LeadDetail
        lead={lead}
        sourceName={sourceName}
        flowName={flowName}
        campaignName={campaignName}
        partnerName={partnerName}
        ownerName={ownerName}
        creatorName={creatorName}
        lastUpdatedByName={lastUpdatedByName}
        houProgramName={houProgramName}
        houMajorName={houMajorName}
        houLocationName={houLocationName}
        houStageName={houStageName}
        activityCount={activityCountResult.count ?? 0}
        documentCount={documentCountResult.count ?? 0}
      />
      <HouLeadWorkspace
        leadCode={lead.lead_code}
        studentName={lead.student_name}
        houProgramName={houProgramName}
        houMajorName={houMajorName}
        houLocationName={houLocationName}
        houStageName={houStageName}
        houAdmissionSystemStatus={lead.hou_admission_system_status}
        houAdmissionSystemSyncedAt={lead.hou_admission_system_synced_at}
        houFirstTermTuitionConfirmed={lead.hou_first_term_tuition_confirmed}
        houEnrollmentRecordedAt={lead.hou_enrollment_recorded_at}
        evidenceCount={houEvidenceFiles.length}
        conditionRequiredCount={requiredConditionTemplates.length}
        conditionReadyRequiredCount={readyRequiredConditions.length}
        missingRequiredConditionNames={missingRequiredConditionNames}
        requiredDocumentCount={requiredChecklistRows.length}
        readyRequiredDocumentCount={readyRequiredDocuments.length}
        missingRequiredDocumentNames={missingRequiredDocumentNames}
        claimCount={houCommissionClaims.length}
        latestClaimStatus={latestHouCommissionClaim?.claim_status ?? null}
        latestClaimRiskLevel={latestHouCommissionClaim?.dropout_risk_level ?? null}
        claimNetTotalVnd={houClaimNetTotalVnd}
        canSeeFinancial={canManageHouCommission}
      />
      <div id="conditions" className="scroll-mt-24">
        <LeadConditionChecklist
          leadId={lead.id}
          templates={conditionTemplates}
          checks={conditionChecks}
          loadError={conditionChecklistLoadError}
        />
      </div>
      <div id="hou-info" className="scroll-mt-24">
        <HouLeadForm
          leadId={lead.id}
          currentProgramId={lead.hou_program_id}
          currentMajorId={lead.hou_major_id}
          currentLocationId={lead.hou_location_id}
          currentStageId={lead.hou_stage_id}
          currentAdmissionSystemStatus={lead.hou_admission_system_status}
          currentAdmissionSystemSyncedAt={lead.hou_admission_system_synced_at}
          currentFirstTermTuitionConfirmed={lead.hou_first_term_tuition_confirmed}
          currentFirstTermTuitionConfirmedAt={lead.hou_first_term_tuition_confirmed_at}
          currentEnrollmentRecordedAt={lead.hou_enrollment_recorded_at}
          programs={houPrograms}
          majors={houMajors}
          locations={houLocations}
          stages={houStages}
        />
      </div>
      <div id="hou-com" className="scroll-mt-24">
        <HouCommissionClaimForm
          leadId={lead.id}
          partnerName={partnerName}
          ownerName={ownerName}
          canManageHouCommission={canManageHouCommission}
          loadError={houCommissionLoadError}
          policies={houCommissionPolicies}
          payees={houCommissionPayees}
          claims={houCommissionClaims}
          claimLines={houCommissionClaimLines}
          defaultCommissionBaseDate={defaultCommissionBaseDate}
          defaultFirstTuitionPaidAt={defaultFirstTuitionPaidAt}
        />
      </div>
      <div id="hou-evidence" className="scroll-mt-24">
        <HouEvidenceFiles
          leadId={lead.id}
          canManageHouEvidence={canManageHouCommission}
          evidenceFiles={houEvidenceFiles}
          claims={houCommissionClaims}
          loadError={houEvidenceLoadError}
        />
      </div>
      <div id="lead-status" className="scroll-mt-24">
        <StatusUpdateForm
          leadId={lead.id}
          currentStatus={lead.status}
          currentLostReason={lead.lost_reason}
          currentNextFollowupAt={lead.next_followup_at}
          currentNote={lead.note}
        />
      </div>
      <ActivityForm leadId={lead.id} />
      <ActivityTimeline
        activities={activitiesResult.data ?? []}
        users={toLookup(userRowsResult.data, "full_name")}
      />
      <div id="documents" className="scroll-mt-24">
        <DocumentChecklist
          leadId={lead.id}
          checklist={checklistRows}
          documents={documentRows}
        />
      </div>
    </AppShell>
  );
}
