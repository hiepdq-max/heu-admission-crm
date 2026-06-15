import { redirect } from "next/navigation";

import { AppShell } from "@/components/layout/app-shell";
import {
  UserBusinessScopeSettings,
  type BusinessScopeDepartmentRow,
  type BusinessScopeRoleRow,
  type BusinessScopeUserRow,
  type UserPartnerScopeRow,
  type UserSegmentScopeRow,
} from "@/components/settings/user-business-scope-settings";
import { createClient } from "@/lib/supabase/server";

type ScopePageProps = {
  searchParams?: Promise<{
    scopes_updated?: string;
    error?: string;
  }>;
};

type CurrentProfileRow = {
  id: string;
  department_id: string | null;
};

const errorMessages: Record<string, string> = {
  missing_user: "Thiếu user cần cập nhật phạm vi.",
  not_allowed_scope: "Bạn không có quyền phân phạm vi cho tài khoản này.",
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
  const error = params?.error
    ? errorMessages[params.error] ?? decodeURIComponent(params.error)
    : undefined;
  const message = params?.scopes_updated
    ? "Đã cập nhật phạm vi làm việc của user."
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
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

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
        returnPath="/settings/scopes"
        loadError={
          admissionSegmentsError?.message ??
          userSegmentScopesError?.message ??
          userPartnerScopesError?.message
        }
      />
    </AppShell>
  );
}
