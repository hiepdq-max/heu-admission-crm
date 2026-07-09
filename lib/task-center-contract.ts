export const TASK_CENTER_READ_MODEL_CONTRACT_ONLY =
  "TASK_CENTER_READ_MODEL_INTERFACE_CONTRACT_ONLY";
export const TASK_CENTER_READ_MODEL_TASK_ID =
  "HEU-DATA-005-TASK-CENTER-READ-MODEL-INTERFACE";
export const TASK_CENTER_NO_TABLE_CREATED = "NO_TASK_TABLE_CREATED";
export const TASK_CENTER_NO_MUTATION_ROUTE_CREATED =
  "NO_TASK_MUTATION_ROUTE_CREATED";
export const TASK_CENTER_NO_AI_OR_AUTOMATION =
  "NO_AI_CALL_NO_AUTOMATION_STEP";

export const TASK_CENTER_STATUSES = [
  "DRAFT",
  "CHO_XAC_NHAN",
  "DUNG",
  "CAN_SUA",
  "KHONG_THUOC_TOI",
  "DA_KHOA",
  "DA_HUY",
] as const;

export type TaskCenterStatus = (typeof TASK_CENTER_STATUSES)[number];

export const TASK_CENTER_OPEN_STATUSES = [
  "DRAFT",
  "CHO_XAC_NHAN",
  "CAN_SUA",
  "KHONG_THUOC_TOI",
] as const satisfies readonly TaskCenterStatus[];

export const TASK_CENTER_CLOSED_STATUSES = [
  "DUNG",
  "DA_KHOA",
  "DA_HUY",
] as const satisfies readonly TaskCenterStatus[];

export const TASK_CENTER_STATUS_TRANSITIONS = [
  { from: "DRAFT", to: "CHO_XAC_NHAN", owner: "IT_DATA_OR_SOURCE_OWNER" },
  { from: "CHO_XAC_NHAN", to: "DUNG", owner: "DEPARTMENT_OWNER" },
  { from: "CHO_XAC_NHAN", to: "CAN_SUA", owner: "DEPARTMENT_OWNER" },
  {
    from: "CHO_XAC_NHAN",
    to: "KHONG_THUOC_TOI",
    owner: "DEPARTMENT_OWNER",
  },
  { from: "DUNG", to: "DA_KHOA", owner: "AUDIT_OR_OWNER_REVIEWER" },
  { from: "CAN_SUA", to: "CHO_XAC_NHAN", owner: "IT_DATA_AFTER_CORRECTION" },
  {
    from: "KHONG_THUOC_TOI",
    to: "CHO_XAC_NHAN",
    owner: "IT_DATA_AFTER_REROUTE",
  },
  { from: "ANY_OPEN", to: "DA_HUY", owner: "IT_DATA_AND_AUDIT_WITH_REASON" },
] as const;

export const TASK_CENTER_DEPARTMENT_CODES = [
  "ADMISSION",
  "CTHSSV",
  "TRAINING",
  "KHOA",
  "FINANCE",
  "HOU",
  "IT_DATA",
  "AUDIT",
  "BGH",
] as const;

export type TaskCenterDepartmentCode =
  (typeof TASK_CENTER_DEPARTMENT_CODES)[number];

export type TaskCenterSourceModule =
  | "admission"
  | "cthssv"
  | "training"
  | "finance"
  | "hou"
  | "system";

export const TASK_CENTER_SOURCE_REF_ALLOWLIST = {
  admission: ["lead_id", "followup_ref", "ho_so_ref", "handover_ref"],
  cthssv: ["student_ref", "handover_ref", "status_ref"],
  training: ["class_ref", "program_ref", "teacher_ref", "schedule_ref"],
  finance: ["receivable_ref", "recon_ref", "payment_ref", "evidence_ref"],
  hou: ["hou_student_ref", "hou_contract_ref", "hou_recon_ref", "hou_com_ref"],
  system: ["user_ref", "role_ref", "workspace_ref", "audit_ref"],
} as const satisfies Record<TaskCenterSourceModule, readonly string[]>;

export const TASK_CENTER_REQUIRED_COLUMNS = [
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
  "created_by_user_id",
  "reviewed_by_user_id",
  "metadata_ref",
  "created_at",
  "updated_at",
  "closed_at",
  "archived_at",
] as const;

export const TASK_CENTER_ROLE_GROUPS = {
  admission: ["TUYEN_SINH", "ADMISSION_HEAD", "TEAM_LEAD", "COUNSELOR"],
  cthssv: ["CTHSSV", "CTHSSV_LEAD"],
  training: ["DAO_TAO", "KHOA", "KHOA_BO_MON", "NGAN_HAN", "HR"],
  finance: ["KHTC", "ACCOUNTING", "ACCOUNTING_LEAD"],
  control: ["BGH", "IT_DATA", "AUDIT", "PHAP_CHE", "ADMIN"],
} as const;

export type TaskCenterActionGateKey =
  | "canWriteScopedDraft"
  | "canImportLeadDraft"
  | "canAcceptCthssvHandover"
  | "canReviewScopedDraft"
  | "canManageSystemScope";

export type TaskCenterActionGateSnapshot = Record<
  TaskCenterActionGateKey,
  boolean
> & {
  canReadScopedData: boolean;
};

export type TaskCenterLaneId =
  | "admission"
  | "cthssv"
  | "training"
  | "finance"
  | "hou"
  | "control";

export type TaskCenterLaneDefinition = {
  id: TaskCenterLaneId;
  title: string;
  owner: string;
  departmentCode: TaskCenterDepartmentCode;
  sourceModule: TaskCenterSourceModule;
  href: string;
  roleCodes: readonly string[];
  requiredGate: TaskCenterActionGateKey;
  refs: string;
  nextAction: string;
  blockedAction: string;
};

export type TaskCenterFallbackLane = Omit<
  TaskCenterLaneDefinition,
  "id" | "departmentCode" | "sourceModule"
> & {
  id: "general";
  departmentCode: "IT_DATA";
  sourceModule: "system";
};

export type TaskCenterVisibleLane =
  | TaskCenterLaneDefinition
  | TaskCenterFallbackLane;

export type TaskCenterLaneStatus = "NO_GO_SCOPE" | "DRAFT_READY" | "READ_ONLY";

export const TASK_CENTER_DEPARTMENT_LANES = [
  {
    id: "admission",
    title: "Tuyen sinh",
    owner: "Tuyen sinh + IT_DATA",
    departmentCode: "ADMISSION",
    sourceModule: "admission",
    href: "/leads",
    roleCodes: TASK_CENTER_ROLE_GROUPS.admission,
    requiredGate: "canWriteScopedDraft",
    refs: "lead_id, followup_ref, ho_so_ref",
    nextAction: "Xu ly lead, lich tu van va ho so dang cho xac nhan.",
    blockedAction: "Chi doc hoac chua co quyen thao tac lead trong workspace.",
  },
  {
    id: "cthssv",
    title: "CTHSSV",
    owner: "CTHSSV + Audit",
    departmentCode: "CTHSSV",
    sourceModule: "cthssv",
    href: "/cthssv",
    roleCodes: TASK_CENTER_ROLE_GROUPS.cthssv,
    requiredGate: "canAcceptCthssvHandover",
    refs: "student_ref, handover_ref, status_ref",
    nextAction: "Xac nhan ho so hoc sinh va tinh trang tiep nhan.",
    blockedAction: "Chua co quyen nhan ban giao CTHSSV trong workspace.",
  },
  {
    id: "training",
    title: "Dao tao / Khoa",
    owner: "Dao tao + Khoa owner",
    departmentCode: "TRAINING",
    sourceModule: "training",
    href: "/khoa",
    roleCodes: TASK_CENTER_ROLE_GROUPS.training,
    requiredGate: "canReviewScopedDraft",
    refs: "class_ref, program_ref, teacher_ref",
    nextAction: "Rao soat lop, nganh, lich va danh sach can xac nhan.",
    blockedAction: "Chi hien ref; chua mo workflow ghi cho Dao tao/Khoa.",
  },
  {
    id: "finance",
    title: "Ke toan read-only",
    owner: "KHTC + Audit",
    departmentCode: "FINANCE",
    sourceModule: "finance",
    href: "/finance-desk",
    roleCodes: TASK_CENTER_ROLE_GROUPS.finance,
    requiredGate: "canReviewScopedDraft",
    refs: "receivable_ref, recon_ref, evidence_ref",
    nextAction: "Doi soat nhap cong no/hoc phi o che do doc va ref-only.",
    blockedAction: "Khong mo mutation tai chinh neu chua co module gate.",
  },
  {
    id: "hou",
    title: "HOU separated",
    owner: "HOU owner + KHTC + Audit",
    departmentCode: "HOU",
    sourceModule: "hou",
    href: "/hou",
    roleCodes: [
      ...TASK_CENTER_ROLE_GROUPS.control,
      ...TASK_CENTER_ROLE_GROUPS.finance,
    ],
    requiredGate: "canReviewScopedDraft",
    refs: "hou_student_ref, hou_contract_ref, com_ref",
    nextAction: "Chi doi soat ref HOU; khong gop voi trung cap HEU.",
    blockedAction: "Chua tinh COM/HOU neu thieu hop dong va doi soat.",
  },
  {
    id: "control",
    title: "IT_DATA / Audit",
    owner: "IT_DATA + Audit",
    departmentCode: "IT_DATA",
    sourceModule: "system",
    href: "/settings/scopes",
    roleCodes: TASK_CENTER_ROLE_GROUPS.control,
    requiredGate: "canManageSystemScope",
    refs: "user_ref, role_ref, workspace_ref, audit_ref",
    nextAction: "Kiem scope, user pilot, negative access va audit evidence.",
    blockedAction: "Chua co quyen quan tri scope trong workspace.",
  },
] as const satisfies readonly TaskCenterLaneDefinition[];

export function taskCenterRoleIn(
  roleCode: string | null,
  roleCodes: readonly string[],
) {
  return Boolean(roleCode && roleCodes.includes(roleCode));
}

export function isTaskCenterControlRole(roleCode: string | null) {
  return taskCenterRoleIn(roleCode, TASK_CENTER_ROLE_GROUPS.control);
}

export function isTaskCenterLaneVisible(
  lane: TaskCenterLaneDefinition,
  roleCode: string | null,
  actionGate: TaskCenterActionGateSnapshot,
) {
  if (isTaskCenterControlRole(roleCode)) {
    return lane.id === "control" || lane.id === "hou" || lane.id === "finance";
  }

  if (taskCenterRoleIn(roleCode, lane.roleCodes)) {
    return true;
  }

  return lane.id === "control" && actionGate.canManageSystemScope;
}

export function getVisibleTaskCenterLanes(
  roleCode: string | null,
  actionGate: TaskCenterActionGateSnapshot,
) {
  return TASK_CENTER_DEPARTMENT_LANES.filter((lane) =>
    isTaskCenterLaneVisible(lane, roleCode, actionGate),
  );
}

export function getTaskCenterFallbackLane(
  roleCode: string | null,
): TaskCenterFallbackLane {
  return {
    id: "general",
    title: roleCode ? `Role ${roleCode}` : "Chua co role",
    owner: "IT_DATA",
    departmentCode: "IT_DATA",
    sourceModule: "system",
    href: "/data-confirmation",
    roleCodes: [],
    requiredGate: "canReviewScopedDraft",
    refs: "workspace_ref, role_ref, task_ref",
    nextAction: "Cho IT_DATA gan lane nghiep vu va scope dung phong ban.",
    blockedAction: "Chua map role vao lane cong viec HEU.",
  };
}

export function resolveTaskCenterLaneStatus(
  lane: TaskCenterVisibleLane,
  scopeDecision: string,
  actionGate: TaskCenterActionGateSnapshot,
) {
  if (scopeDecision === "NO_MATCHING_SCOPE" || !actionGate.canReadScopedData) {
    return {
      label: "NO_GO_SCOPE" as const,
      detail: "Can IT_DATA gan role/workspace/scope truoc khi hien viec that.",
    };
  }

  if (actionGate[lane.requiredGate]) {
    return {
      label: "DRAFT_READY" as const,
      detail: lane.nextAction,
    };
  }

  return {
    label: "READ_ONLY" as const,
    detail: lane.blockedAction,
  };
}
