import { redirect } from "next/navigation";

import { AppShell } from "@/components/layout/app-shell";
import {
  UserBusinessScopeSettings,
  type BusinessScopeDepartmentRow,
  type BusinessScopeRoleRow,
  type BusinessScopeUserRow,
  type UserLeadVisibilityScopeRow,
  type UserPartnerScopeRow,
  type UserSegmentScopeRow,
} from "@/components/settings/user-business-scope-settings";
import { UserCreateForm } from "@/components/settings/user-create-form";
import { UserAuthProfileLinkForm } from "@/components/settings/user-auth-profile-link-form";
import { RealUserOnboardingPanel } from "@/components/settings/real-user-onboarding-panel";
import {
  UserScopeEnforcementPanel,
  type UserScopeEffectiveAccessRow,
  type UserScopeEnforcementSummaryRow,
} from "@/components/settings/user-scope-enforcement-panel";
import { createClient } from "@/lib/supabase/server";

type ScopePageProps = {
  searchParams?: Promise<{
    scopes_updated?: string;
    updated?: string;
    user_created?: string;
    profile_linked?: string;
    error?: string;
  }>;
};

type CurrentProfileRow = {
  id: string;
  department_id: string | null;
};

const errorMessages: Record<string, string> = {
  missing_new_user_data:
    "Thiếu email, họ tên, mật khẩu tạm hoặc role của user mới.",
  missing_auth_link_data:
    "Thiếu email, họ tên hoặc role để liên kết Auth user vào CRM.",
  missing_user: "Thiếu user cần cập nhật phạm vi.",
  not_allowed_scope: "Bạn không có quyền phân phạm vi cho tài khoản này.",
  weak_password: "Mật khẩu tạm cần tối thiểu 8 ký tự.",
  missing_service_role_key:
    "Chưa cấu hình SUPABASE_SERVICE_ROLE_KEY nên app chưa thể tạo tài khoản đăng nhập tự động.",
  invalid_manager: "Người quản lý trực tiếp không được trùng với chính user đó.",
  not_admin: "Chỉ ADMIN mới được tạo user hoặc đổi role/phòng ban.",
  invalid_lead_visibility: "Mức hiển thị lead không hợp lệ.",
  lead_visibility_all_admin_only:
    "Chỉ ADMIN mới được gán quyền xem lead toàn hệ thống.",
};

export default async function ScopeSettingsPage({
  searchParams,
}: ScopePageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [{ data: currentRoleCode }, { data: canManageScopes }] =
    await Promise.all([
      supabase.rpc("current_user_role_code"),
      supabase.rpc("has_permission", {
        permission_name: "scope.manage_department",
      }),
    ]);

  if (currentRoleCode !== "ADMIN" && !canManageScopes) {
    redirect("/");
  }

  const params = await searchParams;
  const [
    { data: currentProfile },
    { data: users },
    { data: roles },
    { data: departments },
    { data: admissionSegments, error: admissionSegmentsError },
    { data: partnerScopeOptions },
    { data: userSegmentScopes, error: userSegmentScopesError },
    { data: userPartnerScopes, error: userPartnerScopesError },
    { data: userLeadVisibilityScopes, error: userLeadVisibilityScopesError },
    { data: scopeEnforcementRows, error: scopeEnforcementRowsError },
    { data: scopeEnforcementSummary, error: scopeEnforcementSummaryError },
  ] = await Promise.all([
    supabase
      .from("users_profile")
      .select("id,department_id")
      .eq("id", user.id)
      .maybeSingle<CurrentProfileRow>(),
    supabase
      .from("users_profile")
      .select(
        "id,email,full_name,phone,role_id,department_id,manager_id,status,created_at",
      )
      .order("created_at", { ascending: false })
      .returns<BusinessScopeUserRow[]>(),
    supabase
      .from("roles")
      .select("id,code,name,description")
      .order("code", { ascending: true })
      .returns<BusinessScopeRoleRow[]>(),
    supabase
      .from("admission_departments")
      .select("id,code,name,status")
      .order("code", { ascending: true })
      .returns<BusinessScopeDepartmentRow[]>(),
    supabase
      .from("admission_segments")
      .select(
        "id,segment_code,segment_name,program_group,admission_object,delivery_context,partner_model,commission_model,contract_model,finance_risk,owner_department,sort_order,status",
      )
      .eq("status", "ACTIVE")
      .order("sort_order", { ascending: true }),
    supabase
      .from("partners")
      .select("id,partner_name,partner_type,area")
      .eq("is_deleted", false)
      .eq("status", "ACTIVE")
      .order("partner_type", { ascending: true })
      .order("partner_name", { ascending: true }),
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
      .from("user_scope_effective_access")
      .select(
        "user_id,email,full_name,user_status,role_code,role_name,department_id,department_code,department_name,manager_id,manager_name,lead_visibility,segment_scope_count,partner_scope_count,direct_report_count,assigned_lead_count,created_lead_count,permission_count,has_leads_read_all,has_leads_write_all,has_settings_manage,has_scope_manage_department,broad_lead_access,has_business_scope,risk_flags,enforcement_status,access_model",
      )
      .order("enforcement_status", { ascending: false })
      .returns<UserScopeEffectiveAccessRow[]>(),
    supabase
      .from("user_scope_enforcement_summary")
      .select(
        "user_count,ok_count,check_count,needs_fix_count,high_risk_count,broad_access_count,strict_access_count,missing_scope_count",
      )
      .maybeSingle<UserScopeEnforcementSummaryRow>(),
  ]);

  const visibleUsers =
    currentRoleCode === "ADMIN"
      ? users ?? []
      : (users ?? []).filter(
          (profile) =>
            profile.department_id &&
            profile.department_id === currentProfile?.department_id,
        );
  const visibleUserIds = new Set(visibleUsers.map((profile) => profile.id));
  const visibleSegmentScopes = (userSegmentScopes ?? []).filter((scope) =>
    visibleUserIds.has(scope.user_id),
  );
  const visiblePartnerScopes = (userPartnerScopes ?? []).filter((scope) =>
    visibleUserIds.has(scope.user_id),
  );
  const visibleLeadVisibilityScopes = (userLeadVisibilityScopes ?? []).filter(
    (scope) => visibleUserIds.has(scope.user_id),
  );
  const visibleScopeEnforcementRows = (scopeEnforcementRows ?? []).filter(
    (row) => visibleUserIds.has(row.user_id),
  );
  const error = params?.error
    ? errorMessages[params.error] ?? decodeURIComponent(params.error)
    : undefined;
  const isServiceRoleKeyWarning = params?.error === "missing_service_role_key";
  const message = params?.scopes_updated
    ? "Đã cập nhật phạm vi làm việc của user."
    : params?.updated
      ? "Đã cập nhật phân công phòng ban/nhiệm vụ."
      : params?.user_created
        ? "Đã tạo tài khoản user mới."
        : params?.profile_linked
          ? "Đã liên kết Auth user vào CRM."
    : undefined;

  return (
    <AppShell
      active="scopes"
      title="Phạm vi user"
      description="Phân user theo đúng đối tượng tuyển sinh và đối tác/CTV được phép xử lý."
    >
      {message ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          {message}
        </div>
      ) : null}

      {error ? (
        <div
          className={`rounded-lg border p-4 text-sm ${
            isServiceRoleKeyWarning
              ? "border-amber-200 bg-amber-50 text-amber-800"
              : "border-rose-200 bg-rose-50 text-rose-700"
          }`}
        >
          {error}
        </div>
      ) : null}

      {currentRoleCode === "ADMIN" ? (
        <>
          <RealUserOnboardingPanel />
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
            returnPath="/settings/scopes"
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
            returnPath="/settings/scopes"
          />
        </>
      ) : null}

      <UserScopeEnforcementPanel
        rows={visibleScopeEnforcementRows}
        summary={currentRoleCode === "ADMIN" ? scopeEnforcementSummary : null}
        loadError={
          scopeEnforcementRowsError?.message ??
          scopeEnforcementSummaryError?.message
        }
      />

      <UserBusinessScopeSettings
        users={visibleUsers}
        roles={roles ?? []}
        departments={departments ?? []}
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
        userSegmentScopes={visibleSegmentScopes}
        userPartnerScopes={visiblePartnerScopes}
        userLeadVisibilityScopes={visibleLeadVisibilityScopes}
        returnPath="/settings/scopes"
        canManageUserProfiles={currentRoleCode === "ADMIN"}
        canAssignAllLeadVisibility={currentRoleCode === "ADMIN"}
        loadError={
          admissionSegmentsError?.message ??
          userSegmentScopesError?.message ??
          userPartnerScopesError?.message ??
          userLeadVisibilityScopesError?.message
        }
      />
    </AppShell>
  );
}
