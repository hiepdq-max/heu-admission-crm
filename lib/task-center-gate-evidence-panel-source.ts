import {
  createTaskCenterReadonlyAdapterEnablementGate,
  TASK_CENTER_ADAPTER_ENABLEMENT_DEFAULT_NO_GO,
  TASK_CENTER_ADAPTER_ENABLEMENT_NO_AI_OR_AUTOMATION,
  TASK_CENTER_ADAPTER_ENABLEMENT_NO_DATABASE_CLIENT,
  TASK_CENTER_ADAPTER_ENABLEMENT_NO_DATABASE_READ,
  TASK_CENTER_ADAPTER_ENABLEMENT_NO_SQL_MIGRATION,
  TASK_CENTER_ADAPTER_ENABLEMENT_NO_TASK_MUTATION,
  TASK_CENTER_ADAPTER_ENABLEMENT_OWNER_REVIEW_REQUIRED,
  TASK_CENTER_READONLY_ADAPTER_ENABLEMENT_GATE_ONLY,
  type TaskCenterEnablementDecision,
  type TaskCenterEnablementOwnerLane,
  type TaskCenterReadonlyAdapterEnablementGate,
} from "@/lib/task-center-readonly-adapter-enablement-gate";

export const TASK_CENTER_GATE_EVIDENCE_PANEL_ONLY =
  "TASK_CENTER_GATE_EVIDENCE_PANEL_ONLY";
export const TASK_CENTER_GATE_EVIDENCE_PANEL_READONLY =
  "TASK_CENTER_GATE_EVIDENCE_PANEL_READONLY";
export const TASK_CENTER_GATE_EVIDENCE_PANEL_DATABASE_NO_GO =
  "TASK_CENTER_GATE_EVIDENCE_PANEL_DATABASE_NO_GO";
export const TASK_CENTER_GATE_EVIDENCE_PANEL_NO_DATABASE_CLIENT =
  "NO_DATABASE_CLIENT_CREATED";
export const TASK_CENTER_GATE_EVIDENCE_PANEL_NO_DATABASE_READ =
  "NO_DATABASE_READ_EXECUTED";
export const TASK_CENTER_GATE_EVIDENCE_PANEL_NO_SQL_MIGRATION =
  "NO_SQL_MIGRATION_CREATED";
export const TASK_CENTER_GATE_EVIDENCE_PANEL_NO_TASK_MUTATION =
  "NO_TASK_MUTATION_ROUTE_CREATED";
export const TASK_CENTER_GATE_EVIDENCE_PANEL_NO_AI_OR_AUTOMATION =
  "NO_AI_CALL_NO_AUTOMATION_STEP";
export const TASK_CENTER_REAL_USER_UAT_COPY_ONLY =
  "TASK_CENTER_REAL_USER_UAT_COPY_ONLY";
export const TASK_CENTER_REAL_USER_UAT_COPY_READONLY =
  "TASK_CENTER_REAL_USER_UAT_COPY_READONLY";
export const TASK_CENTER_REAL_USER_UAT_COPY_NO_APPROVAL =
  "TASK_CENTER_REAL_USER_UAT_COPY_NO_APPROVAL";
export const TASK_CENTER_REAL_USER_UAT_COPY_NO_DATA_ENTRY =
  "TASK_CENTER_REAL_USER_UAT_COPY_NO_DATA_ENTRY";

export type TaskCenterGateEvidenceOwnerRow = {
  lane: TaskCenterEnablementOwnerLane;
  label: string;
  decision: TaskCenterEnablementDecision;
  requiredProof: string;
};

export type TaskCenterRealUserUatCopyItem = {
  code: string;
  title: string;
  detail: string;
};

export type TaskCenterGateEvidencePanelSource = {
  mode: typeof TASK_CENTER_GATE_EVIDENCE_PANEL_ONLY;
  panelMode: typeof TASK_CENTER_GATE_EVIDENCE_PANEL_READONLY;
  databaseStatus: typeof TASK_CENTER_GATE_EVIDENCE_PANEL_DATABASE_NO_GO;
  gateMode: typeof TASK_CENTER_READONLY_ADAPTER_ENABLEMENT_GATE_ONLY;
  gate: TaskCenterReadonlyAdapterEnablementGate;
  ownerRows: readonly TaskCenterGateEvidenceOwnerRow[];
  requiredProof: readonly string[];
  uatCopy: {
    mode: typeof TASK_CENTER_REAL_USER_UAT_COPY_ONLY;
    readonly: typeof TASK_CENTER_REAL_USER_UAT_COPY_READONLY;
    noApproval: typeof TASK_CENTER_REAL_USER_UAT_COPY_NO_APPROVAL;
    noDataEntry: typeof TASK_CENTER_REAL_USER_UAT_COPY_NO_DATA_ENTRY;
    allowed: readonly TaskCenterRealUserUatCopyItem[];
    blocked: readonly TaskCenterRealUserUatCopyItem[];
    reportTo: readonly TaskCenterRealUserUatCopyItem[];
  };
  boundary: {
    ownerReviewRequired: typeof TASK_CENTER_ADAPTER_ENABLEMENT_OWNER_REVIEW_REQUIRED;
    defaultNoGo: typeof TASK_CENTER_ADAPTER_ENABLEMENT_DEFAULT_NO_GO;
    noDatabaseClient: typeof TASK_CENTER_GATE_EVIDENCE_PANEL_NO_DATABASE_CLIENT;
    noDatabaseRead: typeof TASK_CENTER_GATE_EVIDENCE_PANEL_NO_DATABASE_READ;
    noSqlMigration: typeof TASK_CENTER_GATE_EVIDENCE_PANEL_NO_SQL_MIGRATION;
    noTaskMutation: typeof TASK_CENTER_GATE_EVIDENCE_PANEL_NO_TASK_MUTATION;
    noAiOrAutomation: typeof TASK_CENTER_GATE_EVIDENCE_PANEL_NO_AI_OR_AUTOMATION;
  };
};

const ownerRows: readonly Omit<TaskCenterGateEvidenceOwnerRow, "decision">[] = [
  {
    lane: "IT_DATA",
    label: "IT_DATA scope-first filter",
    requiredProof: "IT_DATA_SCOPE_FIRST_FILTER_SIGNOFF",
  },
  {
    lane: "AUDIT",
    label: "Audit negative-access evidence",
    requiredProof: "AUDIT_NEGATIVE_ACCESS_EVIDENCE",
  },
  {
    lane: "PHAP_CHE",
    label: "PHAP_CHE restricted-data boundary",
    requiredProof: "PHAP_CHE_RESTRICTED_DATA_BOUNDARY_SIGNOFF",
  },
  {
    lane: "DEPARTMENT_OWNER",
    label: "Department task label acceptance",
    requiredProof: "DEPARTMENT_OWNER_TASK_LABEL_ACCEPTANCE",
  },
  {
    lane: "BGH",
    label: "BGH production NO-GO acknowledgement",
    requiredProof: "BGH_PRODUCTION_NO_GO_ACKNOWLEDGEMENT",
  },
];

const allowedUatCopy: readonly TaskCenterRealUserUatCopyItem[] = [
  {
    code: "UAT_CAN_VIEW_SCOPE",
    title: "Xem lane cong viec cua phong minh",
    detail: "Kiem tra lane, ten viec mau va trang thai gate co de hieu khong.",
  },
  {
    code: "UAT_CAN_CHECK_LABEL",
    title: "Kiem tra nhan va nguoi phu trach",
    detail: "Bao lai neu ten phong, owner lane hoac proof code chua dung.",
  },
  {
    code: "UAT_CAN_REPORT_GAP",
    title: "Ghi nhan diem sai",
    detail: "Gui gap cho IT_DATA/Audit, khong sua truc tiep tren he thong.",
  },
];

const blockedUatCopy: readonly TaskCenterRealUserUatCopyItem[] = [
  {
    code: "UAT_BLOCK_APPROVAL",
    title: "Khong phe duyet",
    detail: "Panel nay khong phai man hinh duyet va khong thay chu ky owner.",
  },
  {
    code: "UAT_BLOCK_REAL_DATA_ENTRY",
    title: "Khong nhap du lieu that",
    detail: "Khong nhap CCCD, so dien thoai, thanh toan, cong no hoac COM.",
  },
  {
    code: "UAT_BLOCK_DB_ENABLEMENT",
    title: "Khong bat database",
    detail: "Moi du lieu hien tai van la mock/fallback va database dang NO_GO.",
  },
];

const reportToUatCopy: readonly TaskCenterRealUserUatCopyItem[] = [
  {
    code: "UAT_REPORT_IT_DATA",
    title: "Loi scope hoac hien sai phong",
    detail: "Bao IT_DATA de kiem tra workspace/role/scope.",
  },
  {
    code: "UAT_REPORT_AUDIT",
    title: "Loi gate, proof hoac risk",
    detail: "Bao Audit neu thay panel co ve cho phep hanh dong that.",
  },
  {
    code: "UAT_REPORT_OWNER",
    title: "Ten viec kho hieu",
    detail: "Bao owner phong ban de chuan hoa ngon ngu nghiep vu.",
  },
];

export function createTaskCenterGateEvidencePanelSource(): TaskCenterGateEvidencePanelSource {
  const gate = createTaskCenterReadonlyAdapterEnablementGate();

  return {
    mode: TASK_CENTER_GATE_EVIDENCE_PANEL_ONLY,
    panelMode: TASK_CENTER_GATE_EVIDENCE_PANEL_READONLY,
    databaseStatus: TASK_CENTER_GATE_EVIDENCE_PANEL_DATABASE_NO_GO,
    gateMode: TASK_CENTER_READONLY_ADAPTER_ENABLEMENT_GATE_ONLY,
    gate,
    ownerRows: ownerRows.map((row) => ({
      ...row,
      decision: gate.ownerReview[row.lane],
    })),
    requiredProof: gate.requiredProof,
    uatCopy: {
      mode: TASK_CENTER_REAL_USER_UAT_COPY_ONLY,
      readonly: TASK_CENTER_REAL_USER_UAT_COPY_READONLY,
      noApproval: TASK_CENTER_REAL_USER_UAT_COPY_NO_APPROVAL,
      noDataEntry: TASK_CENTER_REAL_USER_UAT_COPY_NO_DATA_ENTRY,
      allowed: allowedUatCopy,
      blocked: blockedUatCopy,
      reportTo: reportToUatCopy,
    },
    boundary: {
      ownerReviewRequired: TASK_CENTER_ADAPTER_ENABLEMENT_OWNER_REVIEW_REQUIRED,
      defaultNoGo: TASK_CENTER_ADAPTER_ENABLEMENT_DEFAULT_NO_GO,
      noDatabaseClient: TASK_CENTER_ADAPTER_ENABLEMENT_NO_DATABASE_CLIENT,
      noDatabaseRead: TASK_CENTER_ADAPTER_ENABLEMENT_NO_DATABASE_READ,
      noSqlMigration: TASK_CENTER_ADAPTER_ENABLEMENT_NO_SQL_MIGRATION,
      noTaskMutation: TASK_CENTER_ADAPTER_ENABLEMENT_NO_TASK_MUTATION,
      noAiOrAutomation: TASK_CENTER_ADAPTER_ENABLEMENT_NO_AI_OR_AUTOMATION,
    },
  };
}
