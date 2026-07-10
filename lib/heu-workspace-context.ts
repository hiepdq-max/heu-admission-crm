import { createClient } from "@/lib/supabase/server";
import {
  admissionWorkspaceSegmentIds,
  applyAdmissionSegmentIds,
  getAdmissionWorkspaceContext,
  type AdmissionWorkspaceContext,
} from "@/lib/workspace";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

type UserProfileContextRow = {
  id: string;
  department_id: string | null;
  status: string;
};

type DepartmentContextRow = {
  code: string | null;
};

export type HEUScopeDecision =
  | "SCOPED"
  | "ALL_READONLY"
  | "NO_SCOPE"
  | "BLOCKED";

export type HEUAllowedActions = {
  read: boolean;
  create: boolean;
  update: boolean;
  review: boolean;
  approve: boolean;
  pay: boolean;
  admin: boolean;
};

export type HEUWorkspaceContext = {
  authUserId: string;
  crmUserId: string | null;
  roleCode: string | null;
  orgUnitCode: string | null;
  activeWorkspaceId: string | null;
  activeSegmentId: string | null;
  visibleSegmentIds: string[];
  canSeeAllSegments: boolean;
  scopeDecision: HEUScopeDecision;
  scopeSource: string;
  allowedActions: HEUAllowedActions;
  admissionWorkspace: AdmissionWorkspaceContext;
  noSecretBoundary: true;
};

function deriveScopeDecision(params: {
  crmUserId: string | null;
  roleCode: string | null;
  workspace: AdmissionWorkspaceContext;
}): HEUScopeDecision {
  const { crmUserId, roleCode, workspace } = params;

  if (!crmUserId || !roleCode) {
    return "BLOCKED";
  }

  if (workspace.canSeeAllSegments) {
    return "ALL_READONLY";
  }

  if (workspace.activeSegmentId || workspace.visibleSegmentIds.length > 0) {
    return "SCOPED";
  }

  return "NO_SCOPE";
}

function deriveScopeSource(
  decision: HEUScopeDecision,
  workspace: AdmissionWorkspaceContext,
) {
  if (decision === "BLOCKED") {
    return "users_profile_or_role_missing";
  }

  if (decision === "ALL_READONLY") {
    return "executive_admission_workspace";
  }

  if (decision === "SCOPED") {
    return workspace.activeSegmentId
      ? "admission_workspace_active_segment"
      : "admission_workspace_visible_segments";
  }

  return "admission_workspace_empty";
}

export function getHEUAdmissionSegmentIds(context: HEUWorkspaceContext) {
  return admissionWorkspaceSegmentIds(context.admissionWorkspace);
}

export function applyHEUSegmentScope<T>(
  query: T,
  context: HEUWorkspaceContext,
  column = "admission_segment_id",
) {
  return applyAdmissionSegmentIds(
    query,
    getHEUAdmissionSegmentIds(context),
    column,
  );
}

export async function getHEUWorkspaceContext(
  supabase: SupabaseServerClient,
  userId: string,
  requestedSegmentId?: string | null,
): Promise<HEUWorkspaceContext> {
  const [
    admissionWorkspace,
    roleResult,
    profileResult,
    reportsReadAllResult,
    reportsReadTeamResult,
    reportsReadScopeResult,
  ] = await Promise.all([
    getAdmissionWorkspaceContext(supabase, userId, requestedSegmentId),
    supabase.rpc("current_user_role_code"),
    supabase
      .from("users_profile")
      .select("id,department_id,status")
      .eq("id", userId)
      .maybeSingle<UserProfileContextRow>(),
    supabase.rpc("has_permission", { permission_name: "reports.read_all" }),
    supabase.rpc("has_permission", { permission_name: "reports.read_team" }),
    supabase.rpc("has_permission", { permission_name: "reports.read_scope" }),
  ]);

  const roleCode = (roleResult.data as string | null) ?? null;
  const crmUserId = profileResult.data?.id ?? null;
  const departmentId = profileResult.data?.department_id ?? null;
  const scopeDecision = deriveScopeDecision({
    crmUserId,
    roleCode,
    workspace: admissionWorkspace,
  });
  const allowedActions: HEUAllowedActions = {
    read:
      admissionWorkspace.canSeeAllSegments ||
      Boolean(reportsReadAllResult.data) ||
      Boolean(reportsReadTeamResult.data) ||
      Boolean(reportsReadScopeResult.data),
    create: false,
    update: false,
    review: false,
    approve: false,
    pay: false,
    admin: false,
  };

  let orgUnitCode: string | null = null;

  if (departmentId) {
    const { data: departmentRow } = await supabase
      .from("admission_departments")
      .select("code")
      .eq("id", departmentId)
      .maybeSingle<DepartmentContextRow>();

    orgUnitCode = departmentRow?.code ?? null;
  }

  return {
    authUserId: userId,
    crmUserId,
    roleCode,
    orgUnitCode,
    activeWorkspaceId: admissionWorkspace.activeSegmentId,
    activeSegmentId: admissionWorkspace.activeSegmentId,
    visibleSegmentIds: admissionWorkspace.visibleSegmentIds,
    canSeeAllSegments: admissionWorkspace.canSeeAllSegments,
    scopeDecision,
    scopeSource: deriveScopeSource(scopeDecision, admissionWorkspace),
    allowedActions,
    admissionWorkspace,
    noSecretBoundary: true,
  };
}
