import {
  TASK_CENTER_DEPARTMENT_CODES,
  TASK_CENTER_REQUIRED_COLUMNS,
  TASK_CENTER_SOURCE_REF_ALLOWLIST,
  TASK_CENTER_STATUSES,
  type TaskCenterActionGateSnapshot,
  type TaskCenterDepartmentCode,
  type TaskCenterSourceModule,
  type TaskCenterStatus,
  type TaskCenterVisibleLane,
} from "@/lib/task-center-contract";

export const TASK_CENTER_READONLY_QUERY_PLAN_ONLY =
  "TASK_CENTER_READONLY_QUERY_PLAN_ONLY";
export const TASK_CENTER_SCOPE_FIRST_QUERY_REQUIRED =
  "SCOPE_FIRST_QUERY_REQUIRED";
export const TASK_CENTER_DATABASE_READY_NO_GO_QUERY_PLAN_ONLY =
  "TASK_CENTER_DATABASE_READY_NO_GO_QUERY_PLAN_ONLY";
export const TASK_CENTER_NO_BROAD_FALLBACK = "NO_BROAD_FALLBACK";
export const TASK_CENTER_NO_QUERY_MUTATION = "NO_TASK_MUTATION_ROUTE_CREATED";
export const TASK_CENTER_NO_AI_OR_AUTOMATION =
  "NO_AI_CALL_NO_AUTOMATION_STEP";

export const TASK_CENTER_READONLY_PAGE_SIZE_LIMIT = 50;

export const TASK_CENTER_READONLY_SCOPE_FILTERS = [
  "workspace_id",
  "admission_segment_id",
  "department_code",
  "owner_role_code",
] as const;

export const TASK_CENTER_READONLY_SELECT_COLUMNS = [
  "task_id",
  "workspace_id",
  "admission_segment_id",
  "department_code",
  "owner_role_code",
  "owner_user_id",
  "source_module",
  "source_ref_type",
  "source_ref_id",
  "controlled_evidence_id",
  "title",
  "status",
  "priority",
  "due_at",
  "created_at",
  "updated_at",
  "closed_at",
] as const satisfies readonly (typeof TASK_CENTER_REQUIRED_COLUMNS)[number][];

export const TASK_CENTER_READONLY_SORT_ORDER = [
  { column: "due_at", direction: "asc_nulls_last" },
  { column: "priority", direction: "desc" },
  { column: "updated_at", direction: "desc" },
] as const;

export type TaskCenterReadonlyQueryPlan = {
  mode: typeof TASK_CENTER_READONLY_QUERY_PLAN_ONLY;
  databaseReady: typeof TASK_CENTER_DATABASE_READY_NO_GO_QUERY_PLAN_ONLY;
  pageSizeLimit: typeof TASK_CENTER_READONLY_PAGE_SIZE_LIMIT;
  scopeFilters: typeof TASK_CENTER_READONLY_SCOPE_FILTERS;
  selectColumns: typeof TASK_CENTER_READONLY_SELECT_COLUMNS;
  allowedDepartmentCodes: typeof TASK_CENTER_DEPARTMENT_CODES;
  allowedStatuses: typeof TASK_CENTER_STATUSES;
  sourceRefAllowlist: typeof TASK_CENTER_SOURCE_REF_ALLOWLIST;
  sortOrder: typeof TASK_CENTER_READONLY_SORT_ORDER;
  laneIds: readonly TaskCenterVisibleLane["id"][];
  departmentCodes: readonly TaskCenterDepartmentCode[];
  sourceModules: readonly TaskCenterSourceModule[];
  visibleStatuses: readonly TaskCenterStatus[];
  boundary: {
    scopeFirst: typeof TASK_CENTER_SCOPE_FIRST_QUERY_REQUIRED;
    noBroadFallback: typeof TASK_CENTER_NO_BROAD_FALLBACK;
    noMutation: typeof TASK_CENTER_NO_QUERY_MUTATION;
    noAiOrAutomation: typeof TASK_CENTER_NO_AI_OR_AUTOMATION;
  };
};

export function createTaskCenterReadonlyQueryPlan(
  lanes: readonly TaskCenterVisibleLane[],
  actionGate: TaskCenterActionGateSnapshot,
): TaskCenterReadonlyQueryPlan {
  const laneIds = lanes.map((lane) => lane.id);
  const departmentCodes = lanes.map((lane) => lane.departmentCode);
  const sourceModules = lanes.map((lane) => lane.sourceModule);
  const visibleStatuses = actionGate.canReviewScopedDraft
    ? TASK_CENTER_STATUSES
    : TASK_CENTER_STATUSES.filter((status) => status !== "DA_HUY");

  return {
    mode: TASK_CENTER_READONLY_QUERY_PLAN_ONLY,
    databaseReady: TASK_CENTER_DATABASE_READY_NO_GO_QUERY_PLAN_ONLY,
    pageSizeLimit: TASK_CENTER_READONLY_PAGE_SIZE_LIMIT,
    scopeFilters: TASK_CENTER_READONLY_SCOPE_FILTERS,
    selectColumns: TASK_CENTER_READONLY_SELECT_COLUMNS,
    allowedDepartmentCodes: TASK_CENTER_DEPARTMENT_CODES,
    allowedStatuses: TASK_CENTER_STATUSES,
    sourceRefAllowlist: TASK_CENTER_SOURCE_REF_ALLOWLIST,
    sortOrder: TASK_CENTER_READONLY_SORT_ORDER,
    laneIds,
    departmentCodes,
    sourceModules,
    visibleStatuses,
    boundary: {
      scopeFirst: TASK_CENTER_SCOPE_FIRST_QUERY_REQUIRED,
      noBroadFallback: TASK_CENTER_NO_BROAD_FALLBACK,
      noMutation: TASK_CENTER_NO_QUERY_MUTATION,
      noAiOrAutomation: TASK_CENTER_NO_AI_OR_AUTOMATION,
    },
  };
}
