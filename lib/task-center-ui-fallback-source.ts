import type {
  TaskCenterActionGateSnapshot,
  TaskCenterVisibleLane,
} from "@/lib/task-center-contract";
import {
  createTaskCenterReadonlyAdapterSkeleton,
  TASK_CENTER_READONLY_ADAPTER_DISABLED_BY_DEFAULT,
  TASK_CENTER_READONLY_ADAPTER_NO_DATABASE_CLIENT,
  TASK_CENTER_READONLY_ADAPTER_NO_DATABASE_READ,
  TASK_CENTER_READONLY_ADAPTER_NO_TASK_MUTATION,
  TASK_CENTER_READONLY_ADAPTER_NO_AI_OR_AUTOMATION,
  TASK_CENTER_READONLY_ADAPTER_SKELETON_ONLY,
  type TaskCenterReadonlyAdapterSkeleton,
} from "@/lib/task-center-readonly-adapter-skeleton";
import {
  getMockTaskCenterTasksForLanes,
  TASK_CENTER_MOCK_DATA_ONLY,
  TASK_CENTER_MOCK_READONLY_LIST,
  type TaskCenterMockTask,
} from "@/lib/task-center-mock-read-model";

export const TASK_CENTER_UI_FALLBACK_WIRING_ONLY =
  "TASK_CENTER_UI_FALLBACK_WIRING_ONLY";
export const TASK_CENTER_MOCK_READONLY_FALLBACK_ACTIVE =
  "MOCK_READONLY_FALLBACK_ACTIVE";
export const TASK_CENTER_DISABLED_ADAPTER_OUTPUT_ONLY =
  "DISABLED_ADAPTER_OUTPUT_ONLY";
export const TASK_CENTER_UI_FALLBACK_NO_DATABASE_CLIENT =
  "NO_DATABASE_CLIENT_CREATED";
export const TASK_CENTER_UI_FALLBACK_NO_DATABASE_READ =
  "NO_DATABASE_READ_EXECUTED";
export const TASK_CENTER_UI_FALLBACK_NO_TASK_MUTATION =
  "NO_TASK_MUTATION_ROUTE_CREATED";
export const TASK_CENTER_UI_FALLBACK_NO_AI_OR_AUTOMATION =
  "NO_AI_CALL_NO_AUTOMATION_STEP";

export type TaskCenterUiFallbackSource = {
  mode: typeof TASK_CENTER_UI_FALLBACK_WIRING_ONLY;
  dataSource: typeof TASK_CENTER_MOCK_READONLY_FALLBACK_ACTIVE;
  adapterStatus: typeof TASK_CENTER_READONLY_ADAPTER_DISABLED_BY_DEFAULT;
  adapterMode: typeof TASK_CENTER_READONLY_ADAPTER_SKELETON_ONLY;
  adapter: TaskCenterReadonlyAdapterSkeleton;
  displayTasks: readonly TaskCenterMockTask[];
  adapterRows: readonly [];
  boundary: {
    mockList: typeof TASK_CENTER_MOCK_READONLY_LIST;
    mockDataOnly: typeof TASK_CENTER_MOCK_DATA_ONLY;
    disabledAdapterOutput: typeof TASK_CENTER_DISABLED_ADAPTER_OUTPUT_ONLY;
    noDatabaseClient: typeof TASK_CENTER_UI_FALLBACK_NO_DATABASE_CLIENT;
    noDatabaseRead: typeof TASK_CENTER_UI_FALLBACK_NO_DATABASE_READ;
    noMutation: typeof TASK_CENTER_UI_FALLBACK_NO_TASK_MUTATION;
    noAiOrAutomation: typeof TASK_CENTER_UI_FALLBACK_NO_AI_OR_AUTOMATION;
  };
};

export function createTaskCenterUiFallbackSource(
  lanes: readonly TaskCenterVisibleLane[],
  actionGate: TaskCenterActionGateSnapshot,
): TaskCenterUiFallbackSource {
  const adapter = createTaskCenterReadonlyAdapterSkeleton(lanes, actionGate);

  return {
    mode: TASK_CENTER_UI_FALLBACK_WIRING_ONLY,
    dataSource: TASK_CENTER_MOCK_READONLY_FALLBACK_ACTIVE,
    adapterStatus: TASK_CENTER_READONLY_ADAPTER_DISABLED_BY_DEFAULT,
    adapterMode: TASK_CENTER_READONLY_ADAPTER_SKELETON_ONLY,
    adapter,
    displayTasks: getMockTaskCenterTasksForLanes(lanes),
    adapterRows: adapter.rows,
    boundary: {
      mockList: TASK_CENTER_MOCK_READONLY_LIST,
      mockDataOnly: TASK_CENTER_MOCK_DATA_ONLY,
      disabledAdapterOutput: TASK_CENTER_DISABLED_ADAPTER_OUTPUT_ONLY,
      noDatabaseClient: TASK_CENTER_READONLY_ADAPTER_NO_DATABASE_CLIENT,
      noDatabaseRead: TASK_CENTER_READONLY_ADAPTER_NO_DATABASE_READ,
      noMutation: TASK_CENTER_READONLY_ADAPTER_NO_TASK_MUTATION,
      noAiOrAutomation: TASK_CENTER_READONLY_ADAPTER_NO_AI_OR_AUTOMATION,
    },
  };
}
