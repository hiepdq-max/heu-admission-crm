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
  ProgramMajorSettings,
  type AdmissionMajorRow,
  type AdmissionProgramRow,
} from "@/components/settings/program-major-settings";
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
    error?: string;
  }>;
};

const errorMessages: Record<string, string> = {
  missing_user_or_role: "Thiếu user hoặc role cần cập nhật.",
  missing_checklist_data: "Thiếu mã hoặc tên giấy tờ hồ sơ.",
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
  invalid_status: "Trạng thái user không hợp lệ.",
  not_admin: "Chỉ ADMIN mới được cập nhật phân quyền.",
  cannot_lock_self:
    "Không thể tự hạ role ADMIN hoặc khóa chính tài khoản đang đăng nhập.",
};

export default async function SettingsPage({ searchParams }: SettingsPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
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
    { data: programs, error: programsError },
    { data: majors, error: majorsError },
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
    supabase
      .from("role_permissions")
      .select("role_id,permission")
      .order("permission", { ascending: true })
      .returns<RolePermissionRow[]>(),
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
  const currentProfile = users?.find((profile) => profile.id === user.id);
  const currentRoleCode =
    roles?.find((role) => role.id === currentProfile?.role_id)?.code ?? "";
  const canViewSensitiveHouFinance = [
    "ADMIN",
    "BGH",
    "ADMISSION_HEAD",
  ].includes(currentRoleCode);
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
                              : undefined
          }
          error={error}
        />
        <ProgramMajorSettings
          programs={programs ?? []}
          majors={majors ?? []}
          loadError={programsError?.message ?? majorsError?.message}
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
        <LeadSourceSettings sources={leadSources ?? []} />
        <ChecklistSettings checklists={checklists ?? []} />
      </div>
    </AppShell>
  );
}
