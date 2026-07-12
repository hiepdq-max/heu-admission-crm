import {
  TASK_CENTER_SOURCE_REF_ALLOWLIST,
  TASK_CENTER_STATUSES,
  type TaskCenterDepartmentCode,
  type TaskCenterSourceModule,
  type TaskCenterStatus,
  type TaskCenterVisibleLane,
} from "@/lib/task-center-contract";

export const TASK_CENTER_MOCK_READONLY_LIST =
  "TASK_CENTER_MOCK_READONLY_LIST";
export const TASK_CENTER_MOCK_DATA_ONLY =
  "MOCK_DATA_ONLY_NO_DATABASE_READ";
export const TASK_CENTER_NO_TASK_MUTATION = "NO_TASK_MUTATION_ROUTE_CREATED";
export const TASK_CENTER_NO_AI_OR_AUTOMATION =
  "NO_AI_CALL_NO_AUTOMATION_STEP";

export const TASK_CENTER_MOCK_TASK_STATUSES = TASK_CENTER_STATUSES;

export type TaskCenterMockPriority = "LOW" | "NORMAL" | "HIGH" | "URGENT";

export type TaskCenterMockTask = {
  taskId: string;
  laneId: TaskCenterVisibleLane["id"];
  departmentCode: TaskCenterDepartmentCode;
  title: string;
  status: TaskCenterStatus;
  priority: TaskCenterMockPriority;
  sourceModule: TaskCenterSourceModule;
  sourceRefType: string;
  sourceRefId: string;
  controlledEvidenceId: string | null;
  safeSummary: string;
  dueLabel: string;
  ownerHint: string;
};

export const TASK_CENTER_MOCK_TASKS = [
  {
    taskId: "PILOT-ADMISSION-ACTOR-001",
    laneId: "admission",
    departmentCode: "ADMISSION",
    title: "Xác nhận người phụ trách 10 lead pilot",
    status: "CAN_SUA",
    priority: "URGENT",
    sourceModule: "admission",
    sourceRefType: "lead_id",
    sourceRefId: "pilot_actor_batch_ref",
    controlledEvidenceId: "HEU-ADM-ACTOR-UAT-REF",
    safeSummary:
      "Metadata live đang có 10 lead nhưng chưa có actor Tuyển sinh ACTIVE; cần Owner xác nhận trước cutover.",
    dueLabel: "Ưu tiên 1",
    ownerHint: "Trưởng phòng Tuyển sinh + IT_DATA",
  },
  {
    taskId: "PILOT-ADMISSION-DOCUMENT-002",
    laneId: "admission",
    departmentCode: "ADMISSION",
    title: "Đối chiếu hồ sơ cho lead đã nộp",
    status: "CHO_XAC_NHAN",
    priority: "HIGH",
    sourceModule: "admission",
    sourceRefType: "ho_so_ref",
    sourceRefId: "submitted_lead_document_batch_ref",
    controlledEvidenceId: null,
    safeSummary:
      "Có 1 lead ở trạng thái nộp hồ sơ hoặc cao hơn nhưng chưa có document metadata; không tải hồ sơ gốc vào task.",
    dueLabel: "Ưu tiên 2",
    ownerHint: "Tuyển sinh + CTHSSV",
  },
  {
    taskId: "PILOT-ADMISSION-HANDOVER-003",
    laneId: "admission",
    departmentCode: "ADMISSION",
    title: "Chuẩn bị bàn giao Tuyển sinh sang CTHSSV",
    status: "DRAFT",
    priority: "HIGH",
    sourceModule: "admission",
    sourceRefType: "handover_ref",
    sourceRefId: "pilot_handover_batch_ref",
    controlledEvidenceId: null,
    safeSummary:
      "Chỉ mở bàn giao sau khi actor và document metadata hợp lệ; không tạo công nợ hoặc kết luận nhập học.",
    dueLabel: "Ưu tiên 3",
    ownerHint: "Tuyển sinh + CTHSSV + Audit",
  },
  {
    taskId: "PILOT-CTHSSV-001",
    laneId: "cthssv",
    departmentCode: "CTHSSV",
    title: "Kiểm tra điều kiện tiếp nhận hồ sơ pilot",
    status: "CAN_SUA",
    priority: "NORMAL",
    sourceModule: "cthssv",
    sourceRefType: "student_ref",
    sourceRefId: "pilot_student_handover_ref",
    controlledEvidenceId: null,
    safeSummary:
      "CTHSSV chỉ xác nhận metadata/ref sau khi nhận packet bàn giao hợp lệ; không đọc hồ sơ thô tại fallback.",
    dueLabel: "Sau bàn giao",
    ownerHint: "CTHSSV + Audit",
  },
  {
    taskId: "PILOT-TRAINING-001",
    laneId: "training",
    departmentCode: "TRAINING",
    title: "Rà soát lớp/ngành cho hồ sơ đủ điều kiện",
    status: "DRAFT",
    priority: "NORMAL",
    sourceModule: "training",
    sourceRefType: "class_ref",
    sourceRefId: "pilot_class_program_ref",
    controlledEvidenceId: null,
    safeSummary:
      "Đào tạo/Khoa chỉ nhận ref đã được CTHSSV xác nhận; chưa xếp lớp hoặc ghi dữ liệu thật.",
    dueLabel: "Sau CTHSSV",
    ownerHint: "Đào tạo/Khoa",
  },
  {
    taskId: "PILOT-FINANCE-READONLY-001",
    laneId: "finance",
    departmentCode: "FINANCE",
    title: "Đối soát nháp pilot ở chế độ chỉ đọc",
    status: "CHO_XAC_NHAN",
    priority: "HIGH",
    sourceModule: "finance",
    sourceRefType: "receivable_ref",
    sourceRefId: "pilot_reconciliation_draft_ref",
    controlledEvidenceId: "HEU-ACCT-SCOPE-UAT-REF",
    safeSummary:
      "Kế toán chỉ xem và chuẩn bị đối soát nháp; không ghi thu, không duyệt và không chuyển tiền.",
    dueLabel: "Read-only",
    ownerHint: "Kế toán + Audit",
  },
  {
    taskId: "PILOT-CONTROL-001",
    laneId: "control",
    departmentCode: "IT_DATA",
    title: "Kiểm tra 9 tài khoản, vị trí và scope pilot",
    status: "DRAFT",
    priority: "URGENT",
    sourceModule: "system",
    sourceRefType: "workspace_ref",
    sourceRefId: "pilot_9_accounts_workspace_ref",
    controlledEvidenceId: null,
    safeSummary:
      "Xác nhận mỗi account đúng một vị trí và không có quyền rộng mặc định trước khi mở UAT.",
    dueLabel: "Hằng ngày",
    ownerHint: "IT_DATA + Audit",
  },
  {
    taskId: "PILOT-GENERAL-001",
    laneId: "general",
    departmentCode: "IT_DATA",
    title: "Chờ gán lane phòng ban",
    status: "DRAFT",
    priority: "LOW",
    sourceModule: "system",
    sourceRefType: "role_ref",
    sourceRefId: "pilot_role_lane_ref",
    controlledEvidenceId: null,
    safeSummary:
      "Role chưa map lane nghiệp vụ nên chỉ hiển thị checklist hệ thống, không fallback sang dữ liệu phòng khác.",
    dueLabel: "Sau khi IT_DATA gán scope",
    ownerHint: "IT_DATA",
  },
] as const satisfies readonly TaskCenterMockTask[];

export function isMockTaskRefAllowed(task: TaskCenterMockTask) {
  return TASK_CENTER_SOURCE_REF_ALLOWLIST[task.sourceModule].includes(
    task.sourceRefType as never,
  );
}

export function getMockTaskCenterTasksForLanes(
  lanes: readonly TaskCenterVisibleLane[],
) {
  const visibleLaneIds = new Set(lanes.map((lane) => lane.id));
  const visibleTasks = TASK_CENTER_MOCK_TASKS.filter((task) =>
    visibleLaneIds.has(task.laneId),
  );

  return visibleTasks.length > 0
    ? visibleTasks
    : TASK_CENTER_MOCK_TASKS.filter((task) => task.laneId === "general");
}
