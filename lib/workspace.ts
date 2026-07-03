import { cookies } from "next/headers";

import { createClient } from "@/lib/supabase/server";
export {
  firstParam,
  safeReturnPath,
  withAdmissionSegmentParam,
  withoutAdmissionSegmentParam,
  workspaceRedirectPath,
} from "@/lib/workspace-url";

export const ACTIVE_ADMISSION_SEGMENT_COOKIE =
  "heu_active_admission_segment_id";
export const NO_MATCH_SEGMENT_ID = "00000000-0000-0000-0000-000000000000";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

export type AdmissionWorkspaceOption = {
  id: string;
  label: string;
  segmentCode: string;
  segmentName: string;
  programGroup: string | null;
  workspaceCode: string | null;
  operatingModel: string | null;
  readinessStatus: string | null;
  readinessScore: number | null;
  isActive: boolean;
};

export type AdmissionWorkspaceContext = {
  segmentOptions: AdmissionWorkspaceOption[];
  activeSegmentId: string | null;
  activeSegment: AdmissionWorkspaceOption | null;
  canSeeAllSegments: boolean;
  visibleSegmentIds: string[];
};

type WorkspaceViewRow = {
  segment_id: string;
  segment_code: string;
  segment_name: string;
  program_group: string | null;
  workspace_code: string | null;
  operating_model: string | null;
  readiness_score: number | null;
  readiness_status: string | null;
  is_active: boolean | null;
};

type SegmentFallbackRow = {
  id: string;
  segment_code: string;
  segment_name: string;
  program_group: string | null;
};

type SegmentScopeRow = {
  segment_id: string;
};

function optionLabel(row: {
  program_group: string | null;
  segment_name: string;
}) {
  return row.program_group
    ? `${row.program_group} - ${row.segment_name}`
    : row.segment_name;
}

function toOption(row: WorkspaceViewRow): AdmissionWorkspaceOption {
  return {
    id: row.segment_id,
    label: optionLabel(row),
    segmentCode: row.segment_code,
    segmentName: row.segment_name,
    programGroup: row.program_group,
    workspaceCode: row.workspace_code,
    operatingModel: row.operating_model,
    readinessStatus: row.readiness_status,
    readinessScore: row.readiness_score,
    isActive: Boolean(row.is_active),
  };
}

export function admissionWorkspaceSegmentIds(
  context: AdmissionWorkspaceContext,
) {
  if (context.activeSegmentId) {
    return [context.activeSegmentId];
  }

  if (context.canSeeAllSegments) {
    return null;
  }

  return context.visibleSegmentIds.length > 0
    ? context.visibleSegmentIds
    : [NO_MATCH_SEGMENT_ID];
}

type SegmentFilterBuilder<T> = {
  eq(column: string, value: string): T;
  in(column: string, values: string[]): T;
};

export function applyAdmissionSegmentIds<T>(
  query: T,
  segmentIds: string[] | null,
  column = "admission_segment_id",
) {
  const filterable = query as SegmentFilterBuilder<T>;

  if (!segmentIds) {
    return query;
  }

  if (segmentIds.length === 1) {
    return filterable.eq(column, segmentIds[0]);
  }

  return filterable.in(column, segmentIds);
}

export async function getAdmissionWorkspaceContext(
  supabase: SupabaseServerClient,
  userId: string,
  requestedSegmentId?: string | null,
): Promise<AdmissionWorkspaceContext> {
  const cookieStore = await cookies();
  const cookieSegmentId =
    cookieStore.get(ACTIVE_ADMISSION_SEGMENT_COOKIE)?.value ?? null;
  const { data: currentRoleCode } = await supabase.rpc("current_user_role_code");
  const canSeeAllSegments =
    currentRoleCode === "ADMIN" || currentRoleCode === "BGH";

  const { data: workspaceRows, error: workspaceError } = await supabase
    .from("current_user_admission_workspaces")
    .select(
      "segment_id,segment_code,segment_name,program_group,workspace_code,operating_model,readiness_score,readiness_status,is_active",
    )
    .order("program_group", { ascending: true })
    .order("segment_name", { ascending: true })
    .returns<WorkspaceViewRow[]>();

  let segmentOptions: AdmissionWorkspaceOption[];

  if (!workspaceError && workspaceRows) {
    segmentOptions = workspaceRows.map(toOption);
  } else {
    const [{ data: segmentRows }, { data: segmentScopeRows }] =
      await Promise.all([
        supabase
          .from("admission_segments")
          .select("id,segment_code,segment_name,program_group")
          .eq("status", "ACTIVE")
          .order("sort_order", { ascending: true })
          .returns<SegmentFallbackRow[]>(),
        supabase
          .from("user_admission_segment_scopes")
          .select("segment_id")
          .eq("user_id", userId)
          .eq("status", "ACTIVE")
          .returns<SegmentScopeRow[]>(),
      ]);
    const allowedIds = new Set(
      (segmentScopeRows ?? []).map((scope) => scope.segment_id),
    );

    segmentOptions = (segmentRows ?? [])
      .filter((segment) => canSeeAllSegments || allowedIds.has(segment.id))
      .map((segment) => ({
        id: segment.id,
        label: optionLabel(segment),
        segmentCode: segment.segment_code,
        segmentName: segment.segment_name,
        programGroup: segment.program_group,
        workspaceCode: null,
        operatingModel: null,
        readinessStatus: null,
        readinessScore: null,
        isActive: false,
      }));
  }

  const visibleSegmentIds = segmentOptions.map((segment) => segment.id);
  const requested = requestedSegmentId
    ? segmentOptions.find((segment) => segment.id === requestedSegmentId)
    : null;
  const cookieSelected = cookieSegmentId
    ? segmentOptions.find((segment) => segment.id === cookieSegmentId)
    : null;
  const stored = segmentOptions.find((segment) => segment.isActive);
  const onlyOption = segmentOptions.length === 1 ? segmentOptions[0] : null;
  const activeSegment = requested ?? cookieSelected ?? stored ?? onlyOption ?? null;

  return {
    segmentOptions,
    activeSegmentId: activeSegment?.id ?? null,
    activeSegment,
    canSeeAllSegments,
    visibleSegmentIds,
  };
}
