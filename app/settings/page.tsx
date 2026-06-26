import Link from "next/link";
import { redirect } from "next/navigation";
import { Database } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import {
  ChecklistSettings,
  type ChecklistMasterRow,
} from "@/components/settings/checklist-settings";
import {
  LeadSourceSettings,
  type LeadSourceMasterRow,
} from "@/components/settings/lead-source-settings";
import {
  AdmissionFlowSettings,
  type AdmissionFlowRow,
} from "@/components/settings/admission-flow-settings";
import {
  AdmissionSegmentSettings,
  type AdmissionSegmentRow,
} from "@/components/settings/admission-segment-settings";
import {
  ProgramMajorSettings,
  type AdmissionMajorRow,
  type AdmissionProgramRow,
} from "@/components/settings/program-major-settings";
import {
  AdmissionDynamicConfigSettings,
  type AdmissionConditionRuleConfigRow,
  type AdmissionDynamicConfigOverviewRow,
  type AdmissionDynamicConfigSummaryRow,
  type AdmissionFormFieldConfigRow,
  type AdmissionProgramRuleConfigRow,
} from "@/components/settings/admission-dynamic-config-settings";
import {
  HouFoundationSettings,
  type HouAdmissionStageRow,
  type HouFinancialPolicyRow,
  type HouLocationRow,
  type HouMajorRow,
  type HouProgramRow,
  type HouTermRow,
} from "@/components/settings/hou-foundation-settings";
import {
  HouCommissionSettings,
  type HouCommissionCycleRow,
  type HouCommissionEligibilityRuleRow,
  type HouCommissionPolicyLineRow,
  type HouCommissionPolicyRow,
  type HouRevenueShareVersionRow,
  type HouTuitionCreditRateRow,
} from "@/components/settings/hou-commission-settings";
import {
  UserSettingsOverview,
  type DepartmentRow,
  type RolePermissionRow,
  type RoleRow,
  type UserProfileRow,
} from "@/components/settings/user-settings-overview";
import { UserCreateForm } from "@/components/settings/user-create-form";
import { UserAuthProfileLinkForm } from "@/components/settings/user-auth-profile-link-form";
import {
  UserBusinessScopeSettings,
  type BusinessScopeDepartmentRow,
  type BusinessScopeRoleRow,
  type BusinessScopeUserRow,
  type UserLeadVisibilityScopeRow,
  type UserPartnerScopeRow,
  type UserSegmentScopeRow,
} from "@/components/settings/user-business-scope-settings";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

type SettingsPageProps = {
  searchParams?: Promise<{
    updated?: string;
    checklist_created?: string;
    checklist_updated?: string;
    source_created?: string;
    source_updated?: string;
    flow_created?: string;
    flow_updated?: string;
    program_created?: string;
    program_updated?: string;
    major_created?: string;
    major_updated?: string;
    hou_location_created?: string;
    hou_location_updated?: string;
    admission_config_created?: string;
    admission_config_updated?: string;
    permissions_updated?: string;
    scopes_updated?: string;
    user_created?: string;
    profile_linked?: string;
    error?: string;
  }>;
};

const errorMessages: Record<string, string> = {
  missing_new_user_data:
    "Thiếu email, họ tên, mật khẩu tạm hoặc role của user mới.",
  missing_auth_link_data:
    "Thiếu email, họ tên hoặc role để liên kết Auth user vào CRM.",
  weak_password: "Mật khẩu tạm cần tối thiểu 8 ký tự.",
  missing_service_role_key:
    "Chưa cấu hình SUPABASE_SERVICE_ROLE_KEY nên app chưa thể tạo tài khoản đăng nhập tự động.",
  invalid_manager: "Người quản lý trực tiếp không được trùng với chính user đó.",
  missing_user_or_role: "Thiếu user hoặc role cần cập nhật.",
  missing_user: "Thiếu user cần cập nhật.",
  missing_role: "Thiếu role cần cập nhật quyền.",
  not_allowed_scope:
    "Bạn không có quyền phân phạm vi cho tài khoản này.",
  invalid_lead_visibility: "Mức hiển thị lead không hợp lệ.",
  lead_visibility_all_admin_only:
    "Chỉ ADMIN mới được gán quyền xem lead toàn hệ thống.",
  missing_checklist_data: "Thiếu mã hoặc tên giấy tờ hồ sơ.",
  role_permission_soft_revoke_migration_required:
    "Cần chạy migration step109_role_permission_soft_revoke_p0_11.sql trước khi cập nhật ma trận quyền để tránh xóa cứng role_permissions.",
  duplicate_checklist_code:
    "Mã giấy tờ này đã tồn tại. Hãy sửa dòng giấy tờ hiện có hoặc dùng mã khác.",
  missing_source_data: "Thiếu mã nguồn, tên nguồn hoặc nhóm nguồn lead.",
  duplicate_source_code:
    "Mã nguồn lead này đã tồn tại. Hãy sửa dòng nguồn hiện có hoặc dùng mã khác.",
  missing_program_data: "Thiếu mã hoặc tên hệ đào tạo.",
  missing_flow_data: "Thiếu mã, tên, mô tả, owner hoặc rủi ro của luồng tuyển sinh.",
  duplicate_flow_code:
    "Mã luồng tuyển sinh này đã tồn tại. Hãy sửa dòng hiện có hoặc dùng mã khác.",
  duplicate_program_code:
    "Mã hệ đào tạo này đã tồn tại. Hãy sửa dòng hiện có hoặc dùng mã khác.",
  missing_major_data: "Thiếu mã hoặc tên ngành tuyển sinh.",
  duplicate_major_code:
    "Mã ngành này đã tồn tại. Hãy sửa dòng ngành hiện có hoặc dùng mã khác.",
  missing_hou_location_data: "Thiếu mã, tên hoặc địa chỉ địa điểm HOU.",
  duplicate_hou_location_code:
    "Mã địa điểm HOU này đã tồn tại. Hãy sửa địa điểm hiện có hoặc dùng mã khác.",
  missing_admission_program_rule:
    "Thiếu đối tượng tuyển sinh hoặc hệ đào tạo cần gắn.",
  missing_admission_field_config:
    "Thiếu đối tượng tuyển sinh, mã field hoặc nhãn hiển thị field.",
  missing_admission_condition_config:
    "Thiếu đối tượng tuyển sinh, mã điều kiện hoặc tên điều kiện.",
  not_allowed_admission_config:
    "Bạn chưa có quyền quản lý cấu hình tuyển sinh động.",
  invalid_status: "Trạng thái user không hợp lệ.",
  not_admin: "Chỉ ADMIN mới được cập nhật phân quyền.",
  cannot_lock_self:
    "Không thể tự hạ role ADMIN hoặc khóa chính tài khoản đang đăng nhập.",
};

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;
type RolePermissionStatusRow = RolePermissionRow & {
  status?: string | null;
};

function isMissingRolePermissionStatusColumn(message: string) {
  const normalizedMessage = message.toLowerCase();

  return (
    normalizedMessage.includes("role_permissions") &&
    normalizedMessage.includes("status") &&
    (normalizedMessage.includes("could not find") ||
      normalizedMessage.includes("does not exist") ||
      normalizedMessage.includes("schema cache") ||
      normalizedMessage.includes("column"))
  );
}

async function loadRolePermissions(supabase: SupabaseServerClient) {
  const activeResult = await supabase
    .from("role_permissions")
    .select("role_id,permission,status")
    .eq("status", "ACTIVE")
    .order("permission", { ascending: true })
    .returns<RolePermissionStatusRow[]>();

  if (!activeResult.error) {
    return {
      data: (activeResult.data ?? []).map((permission) => ({
        role_id: permission.role_id,
        permission: permission.permission,
      })),
      error: null,
    };
  }

  if (!isMissingRolePermissionStatusColumn(activeResult.error.message)) {
    return activeResult;
  }

  return supabase
    .from("role_permissions")
    .select("role_id,permission")
    .order("permission", { ascending: true })
    .returns<RolePermissionRow[]>();
}

export default async function SettingsPage({ searchParams }: SettingsPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: currentRoleCode } = await supabase.rpc(
    "current_user_role_code",
  );

  if (currentRoleCode !== "ADMIN") {
    redirect("/");
  }

  const params = await searchParams;

  const [
    { data: users, error: usersError },
    { data: roles },
    { data: departments },
    { data: permissions },
    { data: checklists },
    { data: leadSources },
    { data: admissionFlows, error: admissionFlowsError },
    { data: admissionSegments, error: admissionSegmentsError },
    { data: partnerScopeOptions },
    { data: userSegmentScopes, error: userSegmentScopesError },
    { data: userPartnerScopes, error: userPartnerScopesError },
    { data: userLeadVisibilityScopes, error: userLeadVisibilityScopesError },
    { data: programs, error: programsError },
    { data: majors, error: majorsError },
    { data: dynamicConfigSummary, error: dynamicConfigSummaryError },
    { data: dynamicConfigOverview, error: dynamicConfigOverviewError },
    { data: admissionProgramRules, error: admissionProgramRulesError },
    { data: admissionFormFields, error: admissionFormFieldsError },
    { data: admissionConditionRules, error: admissionConditionRulesError },
    { data: houPrograms, error: houProgramsError },
    { data: houLocations, error: houLocationsError },
    { data: houMajors, error: houMajorsError },
    { data: houStages, error: houStagesError },
    { data: houTerms, error: houTermsError },
    { data: houPolicies, error: houPoliciesError },
  ] = await Promise.all([
    supabase
      .from("users_profile")
      .select(
        "id,email,full_name,phone,role_id,department_id,manager_id,status,created_at",
      )
      .order("created_at", { ascending: false })
      .returns<UserProfileRow[]>(),
    supabase
      .from("roles")
      .select("id,code,name,description")
      .order("code", { ascending: true })
      .returns<RoleRow[]>(),
    supabase
      .from("admission_departments")
      .select("id,code,name,status")
      .order("code", { ascending: true })
      .returns<DepartmentRow[]>(),
    loadRolePermissions(supabase),
    supabase
      .from("enrollment_checklists")
      .select(
        "id,document_code,document_name,is_required,applies_to_program,sort_order,status",
      )
      .order("sort_order", { ascending: true })
      .returns<ChecklistMasterRow[]>(),
    supabase
      .from("lead_sources")
      .select("id,source_code,source_name,source_group,status,created_at")
      .order("source_group", { ascending: true })
      .order("source_code", { ascending: true })
      .returns<LeadSourceMasterRow[]>(),
    supabase
      .from("admission_flows")
      .select(
        "id,flow_code,flow_name,short_description,owner_department,main_risk,sort_order,status",
      )
      .order("sort_order", { ascending: true })
      .returns<AdmissionFlowRow[]>(),
    supabase
      .from("admission_segments")
      .select(
        "id,segment_code,segment_name,program_group,admission_object,delivery_context,partner_model,commission_model,contract_model,finance_risk,owner_department,sort_order,status",
      )
      .eq("status", "ACTIVE")
      .order("sort_order", { ascending: true })
      .returns<AdmissionSegmentRow[]>(),
    supabase
      .from("partners")
      .select("id,partner_name,partner_type,area")
      .eq("is_deleted", false)
      .eq("status", "ACTIVE")
      .order("partner_type", { ascending: true })
      .order("partner_name", { ascending: true })
      .returns<Array<{ id: string; partner_name: string; partner_type: string; area: string | null }>>(),
    supabase
      .from("user_admission_segment_scopes")
      .select("user_id,segment_id")
      .eq("status", "ACTIVE")
      .returns<UserSegmentScopeRow[]>(),
    supabase
      .from("user_partner_scopes")
      .select("user_id,partner_id")
      .eq("status", "ACTIVE")
      .returns<UserPartnerScopeRow[]>(),
    supabase
      .from("user_lead_visibility_scopes")
      .select("user_id,lead_visibility")
      .eq("status", "ACTIVE")
      .returns<UserLeadVisibilityScopeRow[]>(),
    supabase
      .from("admission_programs")
      .select("id,program_code,program_name,sort_order,status")
      .order("sort_order", { ascending: true })
      .returns<AdmissionProgramRow[]>(),
    supabase
      .from("admission_majors")
      .select("id,major_code,major_name,program_id,sort_order,status")
      .order("sort_order", { ascending: true })
      .returns<AdmissionMajorRow[]>(),
    supabase
      .from("admission_dynamic_config_summary")
      .select(
        "segment_count,ready_count,needs_fix_count,blocked_count,program_rule_count,visible_field_count,required_condition_count",
      )
      .returns<AdmissionDynamicConfigSummaryRow[]>(),
    supabase
      .from("admission_dynamic_config_status")
      .select(
        "segment_id,segment_code,segment_name,program_group,owner_department,program_rule_count,program_count,major_rule_count,field_count,visible_field_count,required_field_count,condition_count,required_condition_count,control_flags,config_status",
      )
      .order("program_group", { ascending: true })
      .order("segment_name", { ascending: true })
      .returns<AdmissionDynamicConfigOverviewRow[]>(),
    supabase
      .from("admission_segment_program_rule_status")
      .select(
        "id,segment_id,segment_code,segment_name,program_group,program_id,program_code,program_name,major_id,major_code,major_name,is_default,is_required,sort_order,note,status",
      )
      .order("segment_name", { ascending: true })
      .order("sort_order", { ascending: true })
      .returns<AdmissionProgramRuleConfigRow[]>(),
    supabase
      .from("admission_form_field_config_status")
      .select(
        "id,segment_id,segment_code,segment_name,field_key,field_label,field_group,field_type,is_visible,is_required,option_source,placeholder,help_text,validation_rule,sort_order,status,control_flags,field_status",
      )
      .order("segment_name", { ascending: true })
      .order("sort_order", { ascending: true })
      .returns<AdmissionFormFieldConfigRow[]>(),
    supabase
      .from("admission_condition_rule_config_status")
      .select(
        "id,segment_id,segment_code,segment_name,condition_code,condition_name,condition_group,is_required,blocking_level,evidence_required,owner_department,checker_role,approver_role,rule_note,sort_order,status,control_flags,rule_status",
      )
      .order("segment_name", { ascending: true })
      .order("sort_order", { ascending: true })
      .returns<AdmissionConditionRuleConfigRow[]>(),
    supabase
      .from("hou_programs")
      .select(
        "id,program_code,program_name,awarding_institution,coordinating_institution,delivery_mode,admission_system_url,lms_url,info_url,contract_code,valid_from,valid_to,tuition_collection_owner,notes,status",
      )
      .order("program_code", { ascending: true })
      .returns<HouProgramRow[]>(),
    supabase
      .from("hou_locations")
      .select(
        "id,location_code,location_name,location_type,address_line,ward,district_legacy,province,approval_decision_no,approval_decision_date,valid_from,source_document,approval_file_url,evidence_image_url,evidence_note,notes,status",
      )
      .order("location_code", { ascending: true })
      .returns<HouLocationRow[]>(),
    supabase
      .from("hou_majors")
      .select("id,major_code,major_name,sort_order,status")
      .order("sort_order", { ascending: true })
      .returns<HouMajorRow[]>(),
    supabase
      .from("hou_admission_stages")
      .select("id,stage_code,stage_name,sort_order,is_terminal,status")
      .order("sort_order", { ascending: true })
      .returns<HouAdmissionStageRow[]>(),
    supabase
      .from("hou_terms")
      .select(
        "id,term_code,term_name,starts_on,ends_on,tuition_collection_starts_on,tuition_collection_ends_on,result_recognition_month,status",
      )
      .order("starts_on", { ascending: true })
      .returns<HouTermRow[]>(),
    supabase
      .from("hou_financial_policies")
      .select(
        "id,policy_code,policy_name,policy_type,amount_vnd,hou_share_percent,heu_share_percent,effective_from,effective_to,payment_condition,source_document,status",
      )
      .order("effective_from", { ascending: false })
      .returns<HouFinancialPolicyRow[]>(),
  ]);

  const error = params?.error
    ? errorMessages[params.error] ?? decodeURIComponent(params.error)
    : usersError?.message;
  const canViewSensitiveHouFinance = [
    "ADMIN",
    "BGH",
    "ADMISSION_HEAD",
  ].includes(currentRoleCode);
  const canAssignAllLeadVisibility = currentRoleCode === "ADMIN";
  const canViewHouCommission = [
    "ADMIN",
    "BGH",
    "ADMISSION_HEAD",
    "ACCOUNTING",
  ].includes(currentRoleCode);
  const canViewHouCommissionStrategy = [
    "ADMIN",
    "BGH",
    "ADMISSION_HEAD",
  ].includes(currentRoleCode);

  let houCommissionPolicies: HouCommissionPolicyRow[] = [];
  let houCommissionLines: HouCommissionPolicyLineRow[] = [];
  let houCommissionRules: HouCommissionEligibilityRuleRow[] = [];
  let houCommissionCycles: HouCommissionCycleRow[] = [];
  let houTuitionRates: HouTuitionCreditRateRow[] = [];
  let houRevenueShares: HouRevenueShareVersionRow[] = [];
  let houCommissionLoadError: string | undefined;

  if (canViewHouCommission) {
    const [
      policyResult,
      lineResult,
      ruleResult,
      cycleResult,
      tuitionRateResult,
    ] = await Promise.all([
      supabase
        .from("hou_commission_policies")
        .select(
          "id,policy_code,policy_name,station_code,effective_from,effective_to,payment_day_of_month,settlement_cutoff_rule,tax_withholding_percent,dropout_risk_rule,breakeven_rule,status",
        )
        .order("effective_from", { ascending: false })
        .returns<HouCommissionPolicyRow[]>(),
      supabase
        .from("hou_commission_policy_lines")
        .select(
          "id,policy_id,classification,component_code,component_name,receiver_type,payer_source,gross_amount_vnd,tax_withholding_percent,is_taxable,condition_note,sort_order,status",
        )
        .order("sort_order", { ascending: true })
        .returns<HouCommissionPolicyLineRow[]>(),
      supabase
        .from("hou_commission_eligibility_rules")
        .select(
          "id,policy_id,rule_code,rule_name,rule_description,blocking_level,sort_order,status",
        )
        .order("sort_order", { ascending: true })
        .returns<HouCommissionEligibilityRuleRow[]>(),
      supabase
        .from("hou_commission_cycles")
        .select("id,cycle_code,cycle_name,period_start,period_end,payment_due_date,status")
        .order("period_start", { ascending: false })
        .returns<HouCommissionCycleRow[]>(),
      supabase
        .from("hou_tuition_credit_rates")
        .select(
          "id,rate_code,rate_name,tuition_per_credit_vnd,effective_from,effective_to,status",
        )
        .order("effective_from", { ascending: false })
        .returns<HouTuitionCreditRateRow[]>(),
    ]);

    houCommissionPolicies = policyResult.data ?? [];
    houCommissionLines = lineResult.data ?? [];
    houCommissionRules = ruleResult.data ?? [];
    houCommissionCycles = cycleResult.data ?? [];
    houTuitionRates = tuitionRateResult.data ?? [];

    const commissionErrors = [
      policyResult.error?.message,
      lineResult.error?.message,
      ruleResult.error?.message,
      cycleResult.error?.message,
      tuitionRateResult.error?.message,
    ].filter(Boolean);

    if (canViewHouCommissionStrategy) {
      const { data: revenueShareData, error: revenueShareError } = await supabase
        .from("hou_revenue_share_versions")
        .select(
          "id,share_code,share_name,heu_share_percent,hou_share_percent,effective_from,effective_to,source_document,status",
        )
        .order("effective_from", { ascending: false })
        .returns<HouRevenueShareVersionRow[]>();

      houRevenueShares = revenueShareData ?? [];

      if (revenueShareError?.message) {
        commissionErrors.push(revenueShareError.message);
      }
    }

    houCommissionLoadError = commissionErrors[0];
  }

  return (
    <AppShell
      active="settings"
      title="Cấu hình"
      description="Quản lý người dùng, vai trò, phòng ban và phân quyền cơ bản."
      actions={
        <Button asChild variant="outline">
          <Link href="/settings/supabase-check">
            <Database className="size-4" />
            Kiểm tra Supabase
          </Link>
        </Button>
      }
    >
      <div className="space-y-6">
        {params?.user_created ? (
          <section className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
            Đã tạo tài khoản user mới.
          </section>
        ) : null}
        {params?.profile_linked ? (
          <section className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
            Đã liên kết Auth user vào CRM.
          </section>
        ) : null}
        {params?.admission_config_created || params?.admission_config_updated ? (
          <section className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
            Đã lưu cấu hình tuyển sinh động P0-17.
          </section>
        ) : null}

        <UserCreateForm
          roles={roles ?? []}
          departments={departments ?? []}
          managers={(users ?? []).map((profile) => ({
            id: profile.id,
            full_name: profile.full_name,
            email: profile.email,
            role_id: profile.role_id,
            department_id: profile.department_id,
          }))}
          canCreateAuthUser={Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY)}
        />
        <UserAuthProfileLinkForm
          roles={roles ?? []}
          departments={departments ?? []}
          managers={(users ?? []).map((profile) => ({
            id: profile.id,
            full_name: profile.full_name,
            email: profile.email,
            role_id: profile.role_id,
            department_id: profile.department_id,
          }))}
        />

        <UserSettingsOverview
          currentUserId={user.id}
          users={users ?? []}
          roles={roles ?? []}
          departments={departments ?? []}
          permissions={permissions ?? []}
          message={
            params?.updated
              ? "Đã cập nhật cấu hình user."
              : params?.checklist_created
                ? "Đã thêm giấy tờ hồ sơ mới."
                : params?.checklist_updated
                  ? "Đã cập nhật checklist hồ sơ."
                  : params?.source_created
                    ? "Đã thêm nguồn lead mới."
                    : params?.source_updated
                      ? "Đã cập nhật nguồn lead."
                      : params?.flow_created
                        ? "Đã thêm luồng tuyển sinh mới."
                        : params?.flow_updated
                          ? "Đã cập nhật luồng tuyển sinh."
                          : params?.program_created
                        ? "Đã thêm hệ đào tạo mới."
                        : params?.program_updated
                          ? "Đã cập nhật hệ đào tạo."
                          : params?.major_created
                            ? "Đã thêm ngành tuyển sinh mới."
                            : params?.major_updated
                              ? "Đã cập nhật ngành tuyển sinh."
                              : params?.hou_location_created
                                ? "Đã thêm địa điểm học HOU mới."
                              : params?.hou_location_updated
                                  ? "Đã cập nhật địa điểm học HOU."
                                  : params?.permissions_updated
                                    ? "Đã cập nhật quyền cho role."
                                    : params?.scopes_updated
                                      ? "Đã cập nhật phạm vi làm việc của user."
                              : undefined
          }
          error={error}
        />
        <UserBusinessScopeSettings
          users={(users ?? []) as BusinessScopeUserRow[]}
          roles={(roles ?? []) as BusinessScopeRoleRow[]}
          departments={(departments ?? []) as BusinessScopeDepartmentRow[]}
          segments={(admissionSegments ?? []).map((segment) => ({
            id: segment.id,
            label: segment.segment_name,
            group: segment.program_group,
          }))}
          partners={(partnerScopeOptions ?? []).map((partner) => ({
            id: partner.id,
            label: partner.partner_name,
            group: [partner.partner_type, partner.area].filter(Boolean).join(" · "),
          }))}
          userSegmentScopes={userSegmentScopes ?? []}
          userPartnerScopes={userPartnerScopes ?? []}
          userLeadVisibilityScopes={userLeadVisibilityScopes ?? []}
          canManageUserProfiles
          canAssignAllLeadVisibility={canAssignAllLeadVisibility}
          loadError={
            userSegmentScopesError?.message ??
            userPartnerScopesError?.message ??
            userLeadVisibilityScopesError?.message
          }
        />
        <ProgramMajorSettings
          programs={programs ?? []}
          majors={majors ?? []}
          loadError={programsError?.message ?? majorsError?.message}
        />
        <AdmissionDynamicConfigSettings
          overview={dynamicConfigOverview ?? []}
          summary={dynamicConfigSummary?.[0]}
          programRules={admissionProgramRules ?? []}
          formFields={admissionFormFields ?? []}
          conditionRules={admissionConditionRules ?? []}
          segments={admissionSegments ?? []}
          programs={programs ?? []}
          majors={majors ?? []}
          loadError={
            dynamicConfigSummaryError?.message ??
            dynamicConfigOverviewError?.message ??
            admissionProgramRulesError?.message ??
            admissionFormFieldsError?.message ??
            admissionConditionRulesError?.message
          }
        />
        <HouFoundationSettings
          programs={houPrograms ?? []}
          locations={houLocations ?? []}
          majors={houMajors ?? []}
          stages={houStages ?? []}
          terms={houTerms ?? []}
          policies={houPolicies ?? []}
          canViewSensitiveFinance={canViewSensitiveHouFinance}
          loadError={
            houProgramsError?.message ??
            houLocationsError?.message ??
            houMajorsError?.message ??
            houStagesError?.message ??
            houTermsError?.message ??
            houPoliciesError?.message
          }
        />
        <HouCommissionSettings
          canViewHouCommission={canViewHouCommission}
          canViewStrategicFinance={canViewHouCommissionStrategy}
          policies={houCommissionPolicies}
          lines={houCommissionLines}
          rules={houCommissionRules}
          cycles={houCommissionCycles}
          tuitionRates={houTuitionRates}
          revenueShares={houRevenueShares}
          loadError={houCommissionLoadError}
        />
        <AdmissionFlowSettings
          flows={admissionFlows ?? []}
          loadError={admissionFlowsError?.message}
        />
        <AdmissionSegmentSettings
          segments={admissionSegments ?? []}
          loadError={admissionSegmentsError?.message}
        />
        <LeadSourceSettings sources={leadSources ?? []} />
        <ChecklistSettings checklists={checklists ?? []} />
      </div>
    </AppShell>
  );
}
