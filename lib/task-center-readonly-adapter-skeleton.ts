import type {
  TaskCenterActionGateSnapshot,
  TaskCenterVisibleLane,
} from "@/lib/task-center-contract";
import {
  createTaskCenterReadonlyQueryPlan,
  TASK_CENTER_DATABASE_READY_NO_GO_QUERY_PLAN_ONLY,
  TASK_CENTER_NO_AI_OR_AUTOMATION,
  TASK_CENTER_NO_BROAD_FALLBACK,
  TASK_CENTER_NO_QUERY_MUTATION,
  TASK_CENTER_READONLY_QUERY_PLAN_ONLY,
  TASK_CENTER_SCOPE_FIRST_QUERY_REQUIRED,
  type TaskCenterReadonlyQueryPlan,
} from "@/lib/task-center-readonly-query-contract";

export const TASK_CENTER_READONLY_ADAPTER_SKELETON_ONLY =
  "TASK_CENTER_READONLY_ADAPTER_SKELETON_ONLY";
export const TASK_CENTER_READONLY_ADAPTER_DISABLED_BY_DEFAULT =
  "DISABLED_BY_DEFAULT";
export const TASK_CENTER_READONLY_ADAPTER_FEATURE_FLAG_REQUIRED =
  "FEATURE_FLAG_REQUIRED";
export const TASK_CENTER_READONLY_ADAPTER_NO_DATABASE_CLIENT =
  "NO_DATABASE_CLIENT_CREATED";
export const TASK_CENTER_READONLY_ADAPTER_NO_DATABASE_READ =
  "NO_DATABASE_READ_EXECUTED";
export const TASK_CENTER_READONLY_ADAPTER_NO_SQL_MIGRATION =
  "NO_SQL_MIGRATION_CREATED";
export const TASK_CENTER_READONLY_ADAPTER_NO_TASK_MUTATION =
  "NO_TASK_MUTATION_ROUTE_CREATED";
export const TASK_CENTER_READONLY_ADAPTER_NO_AI_OR_AUTOMATION =
  "NO_AI_CALL_NO_AUTOMATION_STEP";

export type TaskCenterReadonlyAdapterStatus =
  | typeof TASK_CENTER_READONLY_ADAPTER_DISABLED_BY_DEFAULT
  | "NO_GO_DATABASE_NOT_CONNECTED";

export type TaskCenterReadonlyAdapterSkeleton = {
  mode: typeof TASK_CENTER_READONLY_ADAPTER_SKELETON_ONLY;
  status: TaskCenterReadonlyAdapterStatus;
  featureFlag: typeof TASK_CENTER_READONLY_ADAPTER_FEATURE_FLAG_REQUIRED;
  queryPlan: TaskCenterReadonlyQueryPlan;
  rows: readonly [];
  reason: string;
  boundary: {
    queryPlanOnly: typeof TASK_CENTER_READONLY_QUERY_PLAN_ONLY;
    databaseReady: typeof TASK_CENTER_DATABASE_READY_NO_GO_QUERY_PLAN_ONLY;
    scopeFirst: typeof TASK_CENTER_SCOPE_FIRST_QUERY_REQUIRED;
    noBroadFallback: typeof TASK_CENTER_NO_BROAD_FALLBACK;
    noDatabaseClient: typeof TASK_CENTER_READONLY_ADAPTER_NO_DATABASE_CLIENT;
    noDatabaseRead: typeof TASK_CENTER_READONLY_ADAPTER_NO_DATABASE_READ;
    noSqlMigration: typeof TASK_CENTER_READONLY_ADAPTER_NO_SQL_MIGRATION;
    noMutation: typeof TASK_CENTER_NO_QUERY_MUTATION;
    noAiOrAutomation: typeof TASK_CENTER_NO_AI_OR_AUTOMATION;
  };
};

export function createTaskCenterReadonlyAdapterSkeleton(
  lanes: readonly TaskCenterVisibleLane[],
  actionGate: TaskCenterActionGateSnapshot,
): TaskCenterReadonlyAdapterSkeleton {
  return {
    mode: TASK_CENTER_READONLY_ADAPTER_SKELETON_ONLY,
    status: TASK_CENTER_READONLY_ADAPTER_DISABLED_BY_DEFAULT,
    featureFlag: TASK_CENTER_READONLY_ADAPTER_FEATURE_FLAG_REQUIRED,
    queryPlan: createTaskCenterReadonlyQueryPlan(lanes, actionGate),
    rows: [],
    reason:
      "Adapter skeleton is disabled until IT_DATA, Audit, PHAP_CHE and owner gates approve the read-only DB implementation.",
    boundary: {
      queryPlanOnly: TASK_CENTER_READONLY_QUERY_PLAN_ONLY,
      databaseReady: TASK_CENTER_DATABASE_READY_NO_GO_QUERY_PLAN_ONLY,
      scopeFirst: TASK_CENTER_SCOPE_FIRST_QUERY_REQUIRED,
      noBroadFallback: TASK_CENTER_NO_BROAD_FALLBACK,
      noDatabaseClient: TASK_CENTER_READONLY_ADAPTER_NO_DATABASE_CLIENT,
      noDatabaseRead: TASK_CENTER_READONLY_ADAPTER_NO_DATABASE_READ,
      noSqlMigration: TASK_CENTER_READONLY_ADAPTER_NO_SQL_MIGRATION,
      noMutation: TASK_CENTER_NO_QUERY_MUTATION,
      noAiOrAutomation: TASK_CENTER_NO_AI_OR_AUTOMATION,
    },
  };
}
