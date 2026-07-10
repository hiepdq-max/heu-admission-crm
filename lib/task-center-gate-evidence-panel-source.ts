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

export type TaskCenterGateEvidenceOwnerRow = {
  lane: TaskCenterEnablementOwnerLane;
  label: string;
  decision: TaskCenterEnablementDecision;
  requiredProof: string;
};

export type TaskCenterGateEvidencePanelSource = {
  mode: typeof TASK_CENTER_GATE_EVIDENCE_PANEL_ONLY;
  panelMode: typeof TASK_CENTER_GATE_EVIDENCE_PANEL_READONLY;
  databaseStatus: typeof TASK_CENTER_GATE_EVIDENCE_PANEL_DATABASE_NO_GO;
  gateMode: typeof TASK_CENTER_READONLY_ADAPTER_ENABLEMENT_GATE_ONLY;
  gate: TaskCenterReadonlyAdapterEnablementGate;
  ownerRows: readonly TaskCenterGateEvidenceOwnerRow[];
  requiredProof: readonly string[];
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
