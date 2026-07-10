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
export const TASK_CENTER_UAT_EVIDENCE_CHECKLIST_ONLY =
  "TASK_CENTER_UAT_EVIDENCE_CHECKLIST_ONLY";
export const TASK_CENTER_UAT_EVIDENCE_CHECKLIST_READONLY =
  "TASK_CENTER_UAT_EVIDENCE_CHECKLIST_READONLY";
export const TASK_CENTER_UAT_EVIDENCE_CHECKLIST_NO_UPLOAD =
  "TASK_CENTER_UAT_EVIDENCE_CHECKLIST_NO_UPLOAD";
export const TASK_CENTER_UAT_EVIDENCE_CHECKLIST_NO_STORAGE_WRITE =
  "TASK_CENTER_UAT_EVIDENCE_CHECKLIST_NO_STORAGE_WRITE";
export const TASK_CENTER_UAT_EVIDENCE_CHECKLIST_NO_RAW_PII =
  "TASK_CENTER_UAT_EVIDENCE_CHECKLIST_NO_RAW_PII";

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

export type TaskCenterUatEvidenceChecklistItem = {
  code: string;
  title: string;
  expectedEvidence: string;
  reviewer: "IT_DATA" | "AUDIT" | "PHAP_CHE" | "DEPARTMENT_OWNER" | "BGH";
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
  uatEvidenceChecklist: {
    mode: typeof TASK_CENTER_UAT_EVIDENCE_CHECKLIST_ONLY;
    readonly: typeof TASK_CENTER_UAT_EVIDENCE_CHECKLIST_READONLY;
    noUpload: typeof TASK_CENTER_UAT_EVIDENCE_CHECKLIST_NO_UPLOAD;
    noStorageWrite: typeof TASK_CENTER_UAT_EVIDENCE_CHECKLIST_NO_STORAGE_WRITE;
    noRawPii: typeof TASK_CENTER_UAT_EVIDENCE_CHECKLIST_NO_RAW_PII;
    items: readonly TaskCenterUatEvidenceChecklistItem[];
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

const uatEvidenceChecklistItems: readonly TaskCenterUatEvidenceChecklistItem[] = [
  {
    code: "UAT_EVIDENCE_SCOPE_VISIBLE",
    title: "Chup man hinh lane/scope dang thay",
    expectedEvidence: "Anh chup che PII, chi giu role, scope, lane va timestamp.",
    reviewer: "IT_DATA",
  },
  {
    code: "UAT_EVIDENCE_GATE_NO_GO_VISIBLE",
    title: "Chup trang thai gate NO_GO",
    expectedEvidence: "Anh chup panel co database NO_GO va owner lanes NO_GO.",
    reviewer: "AUDIT",
  },
  {
    code: "UAT_EVIDENCE_ALLOWED_BLOCKED_COPY",
    title: "Xac nhan copy duoc lam/khong duoc lam",
    expectedEvidence: "Ghi nhan user hieu khong phe duyet, khong nhap du lieu that.",
    reviewer: "DEPARTMENT_OWNER",
  },
  {
    code: "UAT_EVIDENCE_RESTRICTED_DATA_BOUNDARY",
    title: "Xac nhan khong yeu cau du lieu nhay cam",
    expectedEvidence: "PHAP_CHE xem copy khong yeu cau CCCD, dien thoai, thanh toan.",
    reviewer: "PHAP_CHE",
  },
  {
    code: "UAT_EVIDENCE_PRODUCTION_NO_GO",
    title: "Xac nhan production van NO-GO",
    expectedEvidence: "BGH/Audit ghi nhan panel chi phuc vu UAT, khong mo production.",
    reviewer: "BGH",
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
    uatEvidenceChecklist: {
      mode: TASK_CENTER_UAT_EVIDENCE_CHECKLIST_ONLY,
      readonly: TASK_CENTER_UAT_EVIDENCE_CHECKLIST_READONLY,
      noUpload: TASK_CENTER_UAT_EVIDENCE_CHECKLIST_NO_UPLOAD,
      noStorageWrite: TASK_CENTER_UAT_EVIDENCE_CHECKLIST_NO_STORAGE_WRITE,
      noRawPii: TASK_CENTER_UAT_EVIDENCE_CHECKLIST_NO_RAW_PII,
      items: uatEvidenceChecklistItems,
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
