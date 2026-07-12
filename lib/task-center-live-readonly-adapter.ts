import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  TaskCenterDepartmentCode,
  TaskCenterStatus,
} from "@/lib/task-center-contract";

export const TASK_CENTER_LIVE_READONLY_ADAPTER =
  "TASK_CENTER_LIVE_READONLY_ADAPTER";
export const TASK_CENTER_LIVE_VIEW = "heu_data_confirmation_task_center";
export const TASK_CENTER_LIVE_PAGE_LIMIT = 50;

const liveDepartmentCodes: Record<TaskCenterDepartmentCode, string> = {
  ADMISSION: "TUYEN_SINH",
  CTHSSV: "CTHSSV",
  TRAINING: "DAO_TAO",
  KHOA: "KHOA",
  FINANCE: "KHTC",
  HOU: "HOU",
  IT_DATA: "IT_DATA",
  AUDIT: "AUDIT",
  BGH: "BGH",
};

const liveStatuses = new Set<TaskCenterStatus>([
  "CHO_XAC_NHAN",
  "DUNG",
  "CAN_SUA",
  "KHONG_THUOC_TOI",
  "DA_KHOA",
]);

type LiveTaskRow = {
  id: string;
  task_code: string;
  department_code: string;
  owner_user_name: string | null;
  assigned_user_name: string | null;
  admission_segment_id: string | null;
  source_record_label: string;
  source_route: string;
  data_domain: string;
  controlled_evidence_ref: string | null;
  due_date_or_batch: string | null;
  task_center_status: string;
  blocker_state: string;
  status_note: string | null;
  audit_trace_ref: string;
};

export type TaskCenterLiveReadonlyTask = {
  taskId: string;
  taskCode: string;
  departmentCode: string;
  title: string;
  status: TaskCenterStatus;
  sourceRoute: string;
  dataDomain: string;
  sourceRecordLabel: string;
  controlledEvidenceRef: string | null;
  dueLabel: string;
  ownerHint: string;
  safeSummary: string;
  auditTraceRef: string;
};

export type TaskCenterLiveReadonlyResult = {
  mode: typeof TASK_CENTER_LIVE_READONLY_ADAPTER;
  status: "DISABLED" | "NO_SCOPE" | "SCHEMA_UNAVAILABLE" | "READY";
  rows: readonly TaskCenterLiveReadonlyTask[];
  databaseReadExecuted: boolean;
  reason: string;
};

type ReadOptions = {
  enabled: boolean;
  departmentCodes: readonly TaskCenterDepartmentCode[];
  admissionSegmentId: string | null;
};

function mapLiveTask(row: LiveTaskRow): TaskCenterLiveReadonlyTask | null {
  if (!liveStatuses.has(row.task_center_status as TaskCenterStatus)) return null;
  return {
    taskId: row.id,
    taskCode: row.task_code,
    departmentCode: row.department_code,
    title: row.source_record_label,
    status: row.task_center_status as TaskCenterStatus,
    sourceRoute: row.source_route,
    dataDomain: row.data_domain,
    sourceRecordLabel: row.source_record_label,
    controlledEvidenceRef: row.controlled_evidence_ref,
    dueLabel: row.due_date_or_batch ?? "Chua co han",
    ownerHint:
      row.assigned_user_name ?? row.owner_user_name ?? row.department_code,
    safeSummary: row.status_note ?? row.blocker_state,
    auditTraceRef: row.audit_trace_ref,
  };
}

export async function readTaskCenterLiveReadonly(
  client: SupabaseClient,
  options: ReadOptions,
): Promise<TaskCenterLiveReadonlyResult> {
  if (!options.enabled) {
    return {
      mode: TASK_CENTER_LIVE_READONLY_ADAPTER,
      status: "DISABLED",
      rows: [],
      databaseReadExecuted: false,
      reason: "Feature flag is disabled.",
    };
  }

  const scopedDepartments = Array.from(
    new Set(options.departmentCodes.map((code) => liveDepartmentCodes[code])),
  );
  if (scopedDepartments.length === 0) {
    return {
      mode: TASK_CENTER_LIVE_READONLY_ADAPTER,
      status: "NO_SCOPE",
      rows: [],
      databaseReadExecuted: false,
      reason: "No department scope; broad fallback is forbidden.",
    };
  }

  let query = client
    .from(TASK_CENTER_LIVE_VIEW)
    .select(
      "id,task_code,department_code,owner_user_name,assigned_user_name,admission_segment_id,source_record_label,source_route,data_domain,controlled_evidence_ref,due_date_or_batch,task_center_status,blocker_state,status_note,audit_trace_ref",
    )
    .in("department_code", scopedDepartments)
    .limit(TASK_CENTER_LIVE_PAGE_LIMIT);

  if (options.admissionSegmentId) {
    query = query.eq("admission_segment_id", options.admissionSegmentId);
  }

  const { data, error } = await query;
  if (error) {
    return {
      mode: TASK_CENTER_LIVE_READONLY_ADAPTER,
      status: "SCHEMA_UNAVAILABLE",
      rows: [],
      databaseReadExecuted: true,
      reason: "Scoped Task Center view is unavailable; no broad fallback.",
    };
  }

  const rows = ((data ?? []) as LiveTaskRow[])
    .map(mapLiveTask)
    .filter((row): row is TaskCenterLiveReadonlyTask => Boolean(row));
  return {
    mode: TASK_CENTER_LIVE_READONLY_ADAPTER,
    status: "READY",
    rows,
    databaseReadExecuted: true,
    reason: "Scoped read-only Task Center rows loaded.",
  };
}
