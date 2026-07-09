import { isExecutiveRole } from "@/lib/executive-roles";
import type { createClient } from "@/lib/supabase/server";
import {
  admissionWorkspaceSegmentIds,
  getAdmissionWorkspaceContext,
  NO_MATCH_SEGMENT_ID,
  type AdmissionWorkspaceContext,
} from "@/lib/workspace";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

export type HEUWorkspaceScopeDecision =
  | "SEGMENT_SCOPED"
  | "ALL_SEGMENTS_READONLY"
  | "NO_MATCHING_SCOPE";

export type HEUWorkspaceActionGate = {
  canReadScopedData: boolean;
  canWriteScopedDraft: boolean;
  canImportLeadDraft: boolean;
  canAcceptCthssvHandover: boolean;
  canReviewScopedDraft: boolean;
  canManageSystemScope: boolean;
  actionPermissionsLoaded: boolean;
  financeMutationRequiresModuleGate: true;
  productionApprovalRequiresHumanGate: true;
};

export type HEUWorkspaceContextOptions = {
  requestedSegmentId?: string | null;
  includeActionPermissions?: boolean;
};

export type HEUWorkspaceContext = {
  authUserId: string;
  roleCode: string | null;
  isExecutive: boolean;
  admissionWorkspace: AdmissionWorkspaceContext;
  activeSegmentId: string | null;
  visibleSegmentIds: string[];
  segmentFilterIds: string[] | null;
  scopeDecision: HEUWorkspaceScopeDecision;
  scopeSource: "current_user_admission_workspaces_or_guarded_fallback";
  actionGate: HEUWorkspaceActionGate;
  noBroadFallback: true;
};

const WRITE_DRAFT_PERMISSIONS = [
  "leads.write_all",
  "leads.write_team",
  "leads.write_assigned",
] as const;

const IMPORT_LEAD_DRAFT_PERMISSIONS = ["leads.import"] as const;

const CTHSSV_HANDOVER_PERMISSIONS = ["handover.accept_cthssv"] as const;

const REVIEW_DRAFT_PERMISSIONS = [
  "audit.read",
  "handover.accept_cthssv",
  "master_control.check",
] as const;

const SYSTEM_SCOPE_PERMISSIONS = [
  "system.manage",
  "users.manage",
  "users.create",
  "settings.manage",
  "scope.manage_department",
] as const;

function isNoMatchingScope(segmentFilterIds: string[] | null) {
  return (
    Array.isArray(segmentFilterIds) &&
    segmentFilterIds.length === 1 &&
    segmentFilterIds[0] === NO_MATCH_SEGMENT_ID
  );
}

function resolveScopeDecision(
  admissionWorkspace: AdmissionWorkspaceContext,
  segmentFilterIds: string[] | null,
): HEUWorkspaceScopeDecision {
  if (isNoMatchingScope(segmentFilterIds)) {
    return "NO_MATCHING_SCOPE";
  }

  if (admissionWorkspace.canSeeAllSegments && segmentFilterIds === null) {
    return "ALL_SEGMENTS_READONLY";
  }

  return "SEGMENT_SCOPED";
}

async function hasAnyPermission(
  supabase: SupabaseServerClient,
  permissionNames: readonly string[],
) {
  const checks = await Promise.all(
    permissionNames.map((permission_name) =>
      supabase.rpc("has_permission", { permission_name }),
    ),
  );

  return checks.some((check) => !check.error && Boolean(check.data));
}

export async function getHEUWorkspaceContext(
  supabase: SupabaseServerClient,
  userId: string,
  options: HEUWorkspaceContextOptions = {},
): Promise<HEUWorkspaceContext> {
  const { requestedSegmentId = null, includeActionPermissions = false } =
    options;
  const { data: roleCode } = await supabase.rpc("current_user_role_code");
  const admissionWorkspace = await getAdmissionWorkspaceContext(
    supabase,
    userId,
    requestedSegmentId,
    { currentRoleCode: roleCode },
  );
  const segmentFilterIds = admissionWorkspaceSegmentIds(admissionWorkspace);
  const scopeDecision = resolveScopeDecision(
    admissionWorkspace,
    segmentFilterIds,
  );
  const canReadScopedData = scopeDecision !== "NO_MATCHING_SCOPE";
  const canUseScopedDraft = scopeDecision === "SEGMENT_SCOPED";
  const actionPermissionResults = includeActionPermissions
    ? await Promise.all([
        canUseScopedDraft
          ? hasAnyPermission(supabase, WRITE_DRAFT_PERMISSIONS)
          : Promise.resolve(false),
        canUseScopedDraft
          ? hasAnyPermission(supabase, IMPORT_LEAD_DRAFT_PERMISSIONS)
          : Promise.resolve(false),
        canUseScopedDraft
          ? hasAnyPermission(supabase, CTHSSV_HANDOVER_PERMISSIONS)
          : Promise.resolve(false),
        canReadScopedData
          ? hasAnyPermission(supabase, REVIEW_DRAFT_PERMISSIONS)
          : Promise.resolve(false),
        hasAnyPermission(supabase, SYSTEM_SCOPE_PERMISSIONS),
      ])
    : ([false, false, false, false, false] as const);
  const [
    canWriteScopedDraft,
    canImportLeadDraft,
    canAcceptCthssvHandover,
    canReviewScopedDraft,
    canManageSystemScope,
  ] = actionPermissionResults;

  return {
    authUserId: userId,
    roleCode,
    isExecutive: isExecutiveRole(roleCode),
    admissionWorkspace,
    activeSegmentId: admissionWorkspace.activeSegmentId,
    visibleSegmentIds: admissionWorkspace.visibleSegmentIds,
    segmentFilterIds,
    scopeDecision,
    scopeSource: "current_user_admission_workspaces_or_guarded_fallback",
    actionGate: {
      canReadScopedData,
      canWriteScopedDraft,
      canImportLeadDraft,
      canAcceptCthssvHandover,
      canReviewScopedDraft,
      canManageSystemScope,
      actionPermissionsLoaded: includeActionPermissions,
      financeMutationRequiresModuleGate: true,
      productionApprovalRequiresHumanGate: true,
    },
    noBroadFallback: true,
  };
}

export function heuWorkspaceSegmentIds(context: HEUWorkspaceContext) {
  return context.segmentFilterIds;
}

export function isHEUWorkspaceScoped(context: HEUWorkspaceContext) {
  return context.scopeDecision === "SEGMENT_SCOPED";
}
