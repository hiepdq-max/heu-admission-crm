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
    taskId: "MOCK-ADMISSION-001",
    laneId: "admission",
    departmentCode: "ADMISSION",
    title: "Kiem tra lead demo cho tuyen sinh",
    status: "CHO_XAC_NHAN",
    priority: "HIGH",
    sourceModule: "admission",
    sourceRefType: "lead_id",
    sourceRefId: "lead_demo_ref_001",
    controlledEvidenceId: "evidence_demo_ref_001",
    safeSummary: "Lead mau chi co ref, khong chua dien thoai, CCCD hoac email.",
    dueLabel: "Hom nay",
    ownerHint: "Tuyen sinh",
  },
  {
    taskId: "MOCK-CTHSSV-001",
    laneId: "cthssv",
    departmentCode: "CTHSSV",
    title: "Xac nhan ho so hoc sinh demo",
    status: "CAN_SUA",
    priority: "NORMAL",
    sourceModule: "cthssv",
    sourceRefType: "student_ref",
    sourceRefId: "student_demo_ref_001",
    controlledEvidenceId: "evidence_demo_ref_002",
    safeSummary: "Ho so mau can phong CTHSSV xac nhan trang thai tiep nhan.",
    dueLabel: "2 ngay",
    ownerHint: "CTHSSV",
  },
  {
    taskId: "MOCK-TRAINING-001",
    laneId: "training",
    departmentCode: "TRAINING",
    title: "Rao soat lop/nganh demo",
    status: "DRAFT",
    priority: "NORMAL",
    sourceModule: "training",
    sourceRefType: "class_ref",
    sourceRefId: "class_demo_ref_001",
    controlledEvidenceId: null,
    safeSummary: "Lop/nganh mau can Dao tao/Khoa doi chieu truoc khi dung that.",
    dueLabel: "Tuan nay",
    ownerHint: "Dao tao/Khoa",
  },
  {
    taskId: "MOCK-FINANCE-001",
    laneId: "finance",
    departmentCode: "FINANCE",
    title: "Doi soat cong no demo read-only",
    status: "CHO_XAC_NHAN",
    priority: "HIGH",
    sourceModule: "finance",
    sourceRefType: "receivable_ref",
    sourceRefId: "receivable_demo_ref_001",
    controlledEvidenceId: "evidence_demo_ref_003",
    safeSummary: "Dong tai chinh mau chi de xem UI, khong ket luan cong no.",
    dueLabel: "Hom nay",
    ownerHint: "Ke toan + Audit",
  },
  {
    taskId: "MOCK-HOU-001",
    laneId: "hou",
    departmentCode: "HOU",
    title: "Kiem ref HOU demo tach rieng",
    status: "KHONG_THUOC_TOI",
    priority: "NORMAL",
    sourceModule: "hou",
    sourceRefType: "hou_student_ref",
    sourceRefId: "hou_student_demo_ref_001",
    controlledEvidenceId: "evidence_demo_ref_004",
    safeSummary: "HOU demo tach khoi trung cap HEU, chua tinh COM.",
    dueLabel: "3 ngay",
    ownerHint: "HOU owner + KHTC",
  },
  {
    taskId: "MOCK-CONTROL-001",
    laneId: "control",
    departmentCode: "IT_DATA",
    title: "Kiem workspace scope demo",
    status: "DRAFT",
    priority: "URGENT",
    sourceModule: "system",
    sourceRefType: "workspace_ref",
    sourceRefId: "workspace_demo_ref_001",
    controlledEvidenceId: null,
    safeSummary: "Task mau de IT_DATA/Audit kiem scope truoc khi noi DB that.",
    dueLabel: "Ngay",
    ownerHint: "IT_DATA + Audit",
  },
  {
    taskId: "MOCK-GENERAL-001",
    laneId: "general",
    departmentCode: "IT_DATA",
    title: "Cho gan lane phong ban",
    status: "DRAFT",
    priority: "LOW",
    sourceModule: "system",
    sourceRefType: "role_ref",
    sourceRefId: "role_demo_ref_001",
    controlledEvidenceId: null,
    safeSummary: "Role chua map lane nghiep vu nen chi hien task he thong mau.",
    dueLabel: "Sau khi IT_DATA gan scope",
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
