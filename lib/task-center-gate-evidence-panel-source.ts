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
export const TASK_CENTER_PILOT_REVIEW_PACKET_ONLY =
  "TASK_CENTER_PILOT_REVIEW_PACKET_ONLY";
export const TASK_CENTER_PILOT_REVIEW_PACKET_READONLY =
  "TASK_CENTER_PILOT_REVIEW_PACKET_READONLY";
export const TASK_CENTER_PILOT_REVIEW_PACKET_DRAFT_ONLY =
  "TASK_CENTER_PILOT_REVIEW_PACKET_DRAFT_ONLY";
export const TASK_CENTER_PILOT_REVIEW_PACKET_NO_APPROVAL =
  "TASK_CENTER_PILOT_REVIEW_PACKET_NO_APPROVAL";
export const TASK_CENTER_PILOT_REVIEW_PACKET_NO_UPLOAD =
  "TASK_CENTER_PILOT_REVIEW_PACKET_NO_UPLOAD";
export const TASK_CENTER_PILOT_REVIEW_PACKET_NO_STORAGE_WRITE =
  "TASK_CENTER_PILOT_REVIEW_PACKET_NO_STORAGE_WRITE";
export const TASK_CENTER_PILOT_REVIEW_PACKET_NO_RAW_PII =
  "TASK_CENTER_PILOT_REVIEW_PACKET_NO_RAW_PII";
export const TASK_CENTER_OWNER_SIGNOFF_ROUTING_MAP_ONLY =
  "TASK_CENTER_OWNER_SIGNOFF_ROUTING_MAP_ONLY";
export const TASK_CENTER_OWNER_SIGNOFF_ROUTING_MAP_READONLY =
  "TASK_CENTER_OWNER_SIGNOFF_ROUTING_MAP_READONLY";
export const TASK_CENTER_OWNER_SIGNOFF_ROUTING_MAP_DRAFT_ONLY =
  "TASK_CENTER_OWNER_SIGNOFF_ROUTING_MAP_DRAFT_ONLY";
export const TASK_CENTER_OWNER_SIGNOFF_ROUTING_MAP_NO_APPROVAL =
  "TASK_CENTER_OWNER_SIGNOFF_ROUTING_MAP_NO_APPROVAL";
export const TASK_CENTER_OWNER_SIGNOFF_ROUTING_MAP_NO_DATABASE_READ =
  "TASK_CENTER_OWNER_SIGNOFF_ROUTING_MAP_NO_DATABASE_READ";
export const TASK_CENTER_OWNER_SIGNOFF_ROUTING_MAP_NO_TASK_MUTATION =
  "TASK_CENTER_OWNER_SIGNOFF_ROUTING_MAP_NO_TASK_MUTATION";
export const TASK_CENTER_OWNER_SIGNOFF_ROUTING_MAP_NO_AI_OR_AUTOMATION =
  "TASK_CENTER_OWNER_SIGNOFF_ROUTING_MAP_NO_AI_OR_AUTOMATION";
export const TASK_CENTER_READONLY_ADAPTER_DECISION_LEDGER_ONLY =
  "TASK_CENTER_READONLY_ADAPTER_DECISION_LEDGER_ONLY";
export const TASK_CENTER_READONLY_ADAPTER_DECISION_LEDGER_READONLY =
  "TASK_CENTER_READONLY_ADAPTER_DECISION_LEDGER_READONLY";
export const TASK_CENTER_READONLY_ADAPTER_DECISION_LEDGER_DRAFT_ONLY =
  "TASK_CENTER_READONLY_ADAPTER_DECISION_LEDGER_DRAFT_ONLY";
export const TASK_CENTER_READONLY_ADAPTER_DECISION_LEDGER_NO_APPROVAL =
  "TASK_CENTER_READONLY_ADAPTER_DECISION_LEDGER_NO_APPROVAL";
export const TASK_CENTER_READONLY_ADAPTER_DECISION_LEDGER_NO_DATABASE_READ =
  "TASK_CENTER_READONLY_ADAPTER_DECISION_LEDGER_NO_DATABASE_READ";
export const TASK_CENTER_READONLY_ADAPTER_DECISION_LEDGER_NO_TASK_MUTATION =
  "TASK_CENTER_READONLY_ADAPTER_DECISION_LEDGER_NO_TASK_MUTATION";
export const TASK_CENTER_READONLY_ADAPTER_DECISION_LEDGER_NO_AI_OR_AUTOMATION =
  "TASK_CENTER_READONLY_ADAPTER_DECISION_LEDGER_NO_AI_OR_AUTOMATION";
export const TASK_CENTER_DB_READ_ADAPTER_IMPLEMENTATION_PLAN_ONLY =
  "TASK_CENTER_DB_READ_ADAPTER_IMPLEMENTATION_PLAN_ONLY";
export const TASK_CENTER_DB_READ_ADAPTER_IMPLEMENTATION_PLAN_READONLY =
  "TASK_CENTER_DB_READ_ADAPTER_IMPLEMENTATION_PLAN_READONLY";
export const TASK_CENTER_DB_READ_ADAPTER_IMPLEMENTATION_PLAN_DRAFT_ONLY =
  "TASK_CENTER_DB_READ_ADAPTER_IMPLEMENTATION_PLAN_DRAFT_ONLY";
export const TASK_CENTER_DB_READ_ADAPTER_IMPLEMENTATION_PLAN_NO_DATABASE_READ =
  "TASK_CENTER_DB_READ_ADAPTER_IMPLEMENTATION_PLAN_NO_DATABASE_READ";
export const TASK_CENTER_DB_READ_ADAPTER_IMPLEMENTATION_PLAN_NO_DATABASE_CLIENT =
  "TASK_CENTER_DB_READ_ADAPTER_IMPLEMENTATION_PLAN_NO_DATABASE_CLIENT";
export const TASK_CENTER_DB_READ_ADAPTER_IMPLEMENTATION_PLAN_NO_TASK_MUTATION =
  "TASK_CENTER_DB_READ_ADAPTER_IMPLEMENTATION_PLAN_NO_TASK_MUTATION";
export const TASK_CENTER_DB_READ_ADAPTER_IMPLEMENTATION_PLAN_NO_AI_OR_AUTOMATION =
  "TASK_CENTER_DB_READ_ADAPTER_IMPLEMENTATION_PLAN_NO_AI_OR_AUTOMATION";
export const TASK_CENTER_ADAPTER_TEST_FIXTURE_CONTRACT_ONLY =
  "TASK_CENTER_ADAPTER_TEST_FIXTURE_CONTRACT_ONLY";
export const TASK_CENTER_ADAPTER_TEST_FIXTURE_CONTRACT_READONLY =
  "TASK_CENTER_ADAPTER_TEST_FIXTURE_CONTRACT_READONLY";
export const TASK_CENTER_ADAPTER_TEST_FIXTURE_CONTRACT_DRAFT_ONLY =
  "TASK_CENTER_ADAPTER_TEST_FIXTURE_CONTRACT_DRAFT_ONLY";
export const TASK_CENTER_ADAPTER_TEST_FIXTURE_CONTRACT_NO_DATABASE_READ =
  "TASK_CENTER_ADAPTER_TEST_FIXTURE_CONTRACT_NO_DATABASE_READ";
export const TASK_CENTER_ADAPTER_TEST_FIXTURE_CONTRACT_NO_DATABASE_CLIENT =
  "TASK_CENTER_ADAPTER_TEST_FIXTURE_CONTRACT_NO_DATABASE_CLIENT";
export const TASK_CENTER_ADAPTER_TEST_FIXTURE_CONTRACT_NO_TASK_MUTATION =
  "TASK_CENTER_ADAPTER_TEST_FIXTURE_CONTRACT_NO_TASK_MUTATION";
export const TASK_CENTER_ADAPTER_TEST_FIXTURE_CONTRACT_NO_REAL_DATA =
  "TASK_CENTER_ADAPTER_TEST_FIXTURE_CONTRACT_NO_REAL_DATA";
export const TASK_CENTER_ADAPTER_TEST_FIXTURE_CONTRACT_NO_AI_OR_AUTOMATION =
  "TASK_CENTER_ADAPTER_TEST_FIXTURE_CONTRACT_NO_AI_OR_AUTOMATION";
export const TASK_CENTER_DISABLED_RUNTIME_SEAM_VERIFICATION_ONLY =
  "TASK_CENTER_DISABLED_RUNTIME_SEAM_VERIFICATION_ONLY";
export const TASK_CENTER_DISABLED_RUNTIME_SEAM_VERIFICATION_READONLY =
  "TASK_CENTER_DISABLED_RUNTIME_SEAM_VERIFICATION_READONLY";
export const TASK_CENTER_DISABLED_RUNTIME_SEAM_VERIFICATION_DRAFT_ONLY =
  "TASK_CENTER_DISABLED_RUNTIME_SEAM_VERIFICATION_DRAFT_ONLY";
export const TASK_CENTER_DISABLED_RUNTIME_SEAM_VERIFICATION_NO_DATABASE_READ =
  "TASK_CENTER_DISABLED_RUNTIME_SEAM_VERIFICATION_NO_DATABASE_READ";
export const TASK_CENTER_DISABLED_RUNTIME_SEAM_VERIFICATION_NO_DATABASE_CLIENT =
  "TASK_CENTER_DISABLED_RUNTIME_SEAM_VERIFICATION_NO_DATABASE_CLIENT";
export const TASK_CENTER_DISABLED_RUNTIME_SEAM_VERIFICATION_NO_TASK_MUTATION =
  "TASK_CENTER_DISABLED_RUNTIME_SEAM_VERIFICATION_NO_TASK_MUTATION";
export const TASK_CENTER_DISABLED_RUNTIME_SEAM_VERIFICATION_NO_REAL_DATA =
  "TASK_CENTER_DISABLED_RUNTIME_SEAM_VERIFICATION_NO_REAL_DATA";
export const TASK_CENTER_DISABLED_RUNTIME_SEAM_VERIFICATION_NO_ENV_ENABLEMENT =
  "TASK_CENTER_DISABLED_RUNTIME_SEAM_VERIFICATION_NO_ENV_ENABLEMENT";
export const TASK_CENTER_DISABLED_RUNTIME_SEAM_VERIFICATION_NO_AI_OR_AUTOMATION =
  "TASK_CENTER_DISABLED_RUNTIME_SEAM_VERIFICATION_NO_AI_OR_AUTOMATION";
export const TASK_CENTER_OWNER_GATE_EVIDENCE_MATRIX_ONLY =
  "TASK_CENTER_OWNER_GATE_EVIDENCE_MATRIX_ONLY";
export const TASK_CENTER_OWNER_GATE_EVIDENCE_MATRIX_READONLY =
  "TASK_CENTER_OWNER_GATE_EVIDENCE_MATRIX_READONLY";
export const TASK_CENTER_OWNER_GATE_EVIDENCE_MATRIX_DRAFT_ONLY =
  "TASK_CENTER_OWNER_GATE_EVIDENCE_MATRIX_DRAFT_ONLY";
export const TASK_CENTER_OWNER_GATE_EVIDENCE_MATRIX_NO_APPROVAL =
  "TASK_CENTER_OWNER_GATE_EVIDENCE_MATRIX_NO_APPROVAL";
export const TASK_CENTER_OWNER_GATE_EVIDENCE_MATRIX_NO_DATABASE_READ =
  "TASK_CENTER_OWNER_GATE_EVIDENCE_MATRIX_NO_DATABASE_READ";
export const TASK_CENTER_OWNER_GATE_EVIDENCE_MATRIX_NO_DATABASE_CLIENT =
  "TASK_CENTER_OWNER_GATE_EVIDENCE_MATRIX_NO_DATABASE_CLIENT";
export const TASK_CENTER_OWNER_GATE_EVIDENCE_MATRIX_NO_TASK_MUTATION =
  "TASK_CENTER_OWNER_GATE_EVIDENCE_MATRIX_NO_TASK_MUTATION";
export const TASK_CENTER_OWNER_GATE_EVIDENCE_MATRIX_NO_REAL_DATA =
  "TASK_CENTER_OWNER_GATE_EVIDENCE_MATRIX_NO_REAL_DATA";
export const TASK_CENTER_OWNER_GATE_EVIDENCE_MATRIX_NO_AI_OR_AUTOMATION =
  "TASK_CENTER_OWNER_GATE_EVIDENCE_MATRIX_NO_AI_OR_AUTOMATION";
export const TASK_CENTER_ADAPTER_PREFLIGHT_CHECKLIST_ONLY =
  "TASK_CENTER_ADAPTER_PREFLIGHT_CHECKLIST_ONLY";
export const TASK_CENTER_ADAPTER_PREFLIGHT_CHECKLIST_READONLY =
  "TASK_CENTER_ADAPTER_PREFLIGHT_CHECKLIST_READONLY";
export const TASK_CENTER_ADAPTER_PREFLIGHT_CHECKLIST_DRAFT_ONLY =
  "TASK_CENTER_ADAPTER_PREFLIGHT_CHECKLIST_DRAFT_ONLY";
export const TASK_CENTER_ADAPTER_PREFLIGHT_CHECKLIST_NO_APPROVAL =
  "TASK_CENTER_ADAPTER_PREFLIGHT_CHECKLIST_NO_APPROVAL";
export const TASK_CENTER_ADAPTER_PREFLIGHT_CHECKLIST_NO_DATABASE_READ =
  "TASK_CENTER_ADAPTER_PREFLIGHT_CHECKLIST_NO_DATABASE_READ";
export const TASK_CENTER_ADAPTER_PREFLIGHT_CHECKLIST_NO_DATABASE_CLIENT =
  "TASK_CENTER_ADAPTER_PREFLIGHT_CHECKLIST_NO_DATABASE_CLIENT";
export const TASK_CENTER_ADAPTER_PREFLIGHT_CHECKLIST_NO_TASK_MUTATION =
  "TASK_CENTER_ADAPTER_PREFLIGHT_CHECKLIST_NO_TASK_MUTATION";
export const TASK_CENTER_ADAPTER_PREFLIGHT_CHECKLIST_NO_REAL_DATA =
  "TASK_CENTER_ADAPTER_PREFLIGHT_CHECKLIST_NO_REAL_DATA";
export const TASK_CENTER_ADAPTER_PREFLIGHT_CHECKLIST_NO_ENV_ENABLEMENT =
  "TASK_CENTER_ADAPTER_PREFLIGHT_CHECKLIST_NO_ENV_ENABLEMENT";
export const TASK_CENTER_ADAPTER_PREFLIGHT_CHECKLIST_NO_AI_OR_AUTOMATION =
  "TASK_CENTER_ADAPTER_PREFLIGHT_CHECKLIST_NO_AI_OR_AUTOMATION";
export const TASK_CENTER_READONLY_ADAPTER_DRY_RUN_SWITCH_CONTRACT_ONLY =
  "TASK_CENTER_READONLY_ADAPTER_DRY_RUN_SWITCH_CONTRACT_ONLY";
export const TASK_CENTER_READONLY_ADAPTER_DRY_RUN_SWITCH_CONTRACT_READONLY =
  "TASK_CENTER_READONLY_ADAPTER_DRY_RUN_SWITCH_CONTRACT_READONLY";
export const TASK_CENTER_READONLY_ADAPTER_DRY_RUN_SWITCH_CONTRACT_DRAFT_ONLY =
  "TASK_CENTER_READONLY_ADAPTER_DRY_RUN_SWITCH_CONTRACT_DRAFT_ONLY";
export const TASK_CENTER_READONLY_ADAPTER_DRY_RUN_SWITCH_CONTRACT_NO_APPROVAL =
  "TASK_CENTER_READONLY_ADAPTER_DRY_RUN_SWITCH_CONTRACT_NO_APPROVAL";
export const TASK_CENTER_READONLY_ADAPTER_DRY_RUN_SWITCH_CONTRACT_NO_DATABASE_READ =
  "TASK_CENTER_READONLY_ADAPTER_DRY_RUN_SWITCH_CONTRACT_NO_DATABASE_READ";
export const TASK_CENTER_READONLY_ADAPTER_DRY_RUN_SWITCH_CONTRACT_NO_DATABASE_CLIENT =
  "TASK_CENTER_READONLY_ADAPTER_DRY_RUN_SWITCH_CONTRACT_NO_DATABASE_CLIENT";
export const TASK_CENTER_READONLY_ADAPTER_DRY_RUN_SWITCH_CONTRACT_NO_TASK_MUTATION =
  "TASK_CENTER_READONLY_ADAPTER_DRY_RUN_SWITCH_CONTRACT_NO_TASK_MUTATION";
export const TASK_CENTER_READONLY_ADAPTER_DRY_RUN_SWITCH_CONTRACT_NO_REAL_DATA =
  "TASK_CENTER_READONLY_ADAPTER_DRY_RUN_SWITCH_CONTRACT_NO_REAL_DATA";
export const TASK_CENTER_READONLY_ADAPTER_DRY_RUN_SWITCH_CONTRACT_NO_ENV_ENABLEMENT =
  "TASK_CENTER_READONLY_ADAPTER_DRY_RUN_SWITCH_CONTRACT_NO_ENV_ENABLEMENT";
export const TASK_CENTER_READONLY_ADAPTER_DRY_RUN_SWITCH_CONTRACT_NO_AI_OR_AUTOMATION =
  "TASK_CENTER_READONLY_ADAPTER_DRY_RUN_SWITCH_CONTRACT_NO_AI_OR_AUTOMATION";

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

export type TaskCenterPilotReviewPacketItem = {
  code: string;
  title: string;
  requiredReviewer:
    | "IT_DATA"
    | "AUDIT"
    | "PHAP_CHE"
    | "DEPARTMENT_OWNER"
    | "BGH";
  passCondition: string;
};

export type TaskCenterOwnerSignoffRoutingItem = {
  code: string;
  ownerLane:
    | "IT_DATA"
    | "AUDIT"
    | "PHAP_CHE"
    | "DEPARTMENT_OWNER"
    | "BGH";
  reviewQuestion: string;
  requiredEvidenceCode: string;
  blocksDbReadUntil: string;
};

export type TaskCenterReadonlyAdapterDecisionLedgerItem = {
  code: string;
  ownerLane:
    | "IT_DATA"
    | "AUDIT"
    | "PHAP_CHE"
    | "DEPARTMENT_OWNER"
    | "BGH";
  decision: "HOLD_NO_GO";
  decisionReason: string;
  requiredBeforeDbRead: string;
};

export type TaskCenterDbReadAdapterImplementationPlanItem = {
  code: string;
  phase: "PLAN_ONLY";
  implementationStep: string;
  requiredGateBeforeExecution: string;
  forbiddenInThisSlice: string;
};

export type TaskCenterAdapterTestFixtureContractItem = {
  code: string;
  fixtureMode: "SYNTHETIC_CONTRACT";
  workspaceLane: string;
  expectedResult: string;
  requiredBeforeDbRead: string;
  forbiddenInThisSlice: string;
};

export type TaskCenterDisabledRuntimeSeamVerificationItem = {
  code: string;
  seamState: "DISABLED_RUNTIME_SEAM";
  verifiedRuntimeSeam: string;
  requiredBeforeEnablement: string;
  forbiddenInThisSlice: string;
};

export type TaskCenterOwnerGateEvidenceMatrixItem = {
  code: string;
  ownerLane:
    | "IT_DATA"
    | "AUDIT"
    | "PHAP_CHE"
    | "DEPARTMENT_OWNER"
    | "BGH";
  evidenceState: "OWNER_EVIDENCE_REQUIRED";
  requiredEvidenceCode: string;
  passCondition: string;
  blocksDbReadUntil: string;
  forbiddenInThisSlice: string;
};

export type TaskCenterAdapterPreflightChecklistItem = {
  code: string;
  preflightState: "PREFLIGHT_REQUIRED";
  checklistOwner:
    | "IT_DATA"
    | "AUDIT"
    | "PHAP_CHE"
    | "DEPARTMENT_OWNER"
    | "BGH";
  requiredBeforeAdapterRead: string;
  passCondition: string;
  forbiddenInThisSlice: string;
};

export type TaskCenterReadonlyAdapterDryRunSwitchContractItem = {
  code: string;
  switchState: "DRY_RUN_SWITCH_CONTRACT";
  contractOwner:
    | "IT_DATA"
    | "AUDIT"
    | "PHAP_CHE"
    | "DEPARTMENT_OWNER"
    | "BGH";
  requiredBeforeSwitch: string;
  dryRunBehavior: string;
  forbiddenInThisSlice: string;
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
  pilotReviewPacket: {
    mode: typeof TASK_CENTER_PILOT_REVIEW_PACKET_ONLY;
    readonly: typeof TASK_CENTER_PILOT_REVIEW_PACKET_READONLY;
    draftOnly: typeof TASK_CENTER_PILOT_REVIEW_PACKET_DRAFT_ONLY;
    noApproval: typeof TASK_CENTER_PILOT_REVIEW_PACKET_NO_APPROVAL;
    noUpload: typeof TASK_CENTER_PILOT_REVIEW_PACKET_NO_UPLOAD;
    noStorageWrite: typeof TASK_CENTER_PILOT_REVIEW_PACKET_NO_STORAGE_WRITE;
    noRawPii: typeof TASK_CENTER_PILOT_REVIEW_PACKET_NO_RAW_PII;
    items: readonly TaskCenterPilotReviewPacketItem[];
  };
  ownerSignoffRoutingMap: {
    mode: typeof TASK_CENTER_OWNER_SIGNOFF_ROUTING_MAP_ONLY;
    readonly: typeof TASK_CENTER_OWNER_SIGNOFF_ROUTING_MAP_READONLY;
    draftOnly: typeof TASK_CENTER_OWNER_SIGNOFF_ROUTING_MAP_DRAFT_ONLY;
    noApproval: typeof TASK_CENTER_OWNER_SIGNOFF_ROUTING_MAP_NO_APPROVAL;
    noDatabaseRead: typeof TASK_CENTER_OWNER_SIGNOFF_ROUTING_MAP_NO_DATABASE_READ;
    noTaskMutation: typeof TASK_CENTER_OWNER_SIGNOFF_ROUTING_MAP_NO_TASK_MUTATION;
    noAiOrAutomation: typeof TASK_CENTER_OWNER_SIGNOFF_ROUTING_MAP_NO_AI_OR_AUTOMATION;
    items: readonly TaskCenterOwnerSignoffRoutingItem[];
  };
  readonlyAdapterDecisionLedger: {
    mode: typeof TASK_CENTER_READONLY_ADAPTER_DECISION_LEDGER_ONLY;
    readonly: typeof TASK_CENTER_READONLY_ADAPTER_DECISION_LEDGER_READONLY;
    draftOnly: typeof TASK_CENTER_READONLY_ADAPTER_DECISION_LEDGER_DRAFT_ONLY;
    noApproval: typeof TASK_CENTER_READONLY_ADAPTER_DECISION_LEDGER_NO_APPROVAL;
    noDatabaseRead: typeof TASK_CENTER_READONLY_ADAPTER_DECISION_LEDGER_NO_DATABASE_READ;
    noTaskMutation: typeof TASK_CENTER_READONLY_ADAPTER_DECISION_LEDGER_NO_TASK_MUTATION;
    noAiOrAutomation: typeof TASK_CENTER_READONLY_ADAPTER_DECISION_LEDGER_NO_AI_OR_AUTOMATION;
    items: readonly TaskCenterReadonlyAdapterDecisionLedgerItem[];
  };
  dbReadAdapterImplementationPlan: {
    mode: typeof TASK_CENTER_DB_READ_ADAPTER_IMPLEMENTATION_PLAN_ONLY;
    readonly: typeof TASK_CENTER_DB_READ_ADAPTER_IMPLEMENTATION_PLAN_READONLY;
    draftOnly: typeof TASK_CENTER_DB_READ_ADAPTER_IMPLEMENTATION_PLAN_DRAFT_ONLY;
    noDatabaseRead: typeof TASK_CENTER_DB_READ_ADAPTER_IMPLEMENTATION_PLAN_NO_DATABASE_READ;
    noDatabaseClient: typeof TASK_CENTER_DB_READ_ADAPTER_IMPLEMENTATION_PLAN_NO_DATABASE_CLIENT;
    noTaskMutation: typeof TASK_CENTER_DB_READ_ADAPTER_IMPLEMENTATION_PLAN_NO_TASK_MUTATION;
    noAiOrAutomation: typeof TASK_CENTER_DB_READ_ADAPTER_IMPLEMENTATION_PLAN_NO_AI_OR_AUTOMATION;
    items: readonly TaskCenterDbReadAdapterImplementationPlanItem[];
  };
  adapterTestFixtureContract: {
    mode: typeof TASK_CENTER_ADAPTER_TEST_FIXTURE_CONTRACT_ONLY;
    readonly: typeof TASK_CENTER_ADAPTER_TEST_FIXTURE_CONTRACT_READONLY;
    draftOnly: typeof TASK_CENTER_ADAPTER_TEST_FIXTURE_CONTRACT_DRAFT_ONLY;
    noDatabaseRead: typeof TASK_CENTER_ADAPTER_TEST_FIXTURE_CONTRACT_NO_DATABASE_READ;
    noDatabaseClient: typeof TASK_CENTER_ADAPTER_TEST_FIXTURE_CONTRACT_NO_DATABASE_CLIENT;
    noTaskMutation: typeof TASK_CENTER_ADAPTER_TEST_FIXTURE_CONTRACT_NO_TASK_MUTATION;
    noRealData: typeof TASK_CENTER_ADAPTER_TEST_FIXTURE_CONTRACT_NO_REAL_DATA;
    noAiOrAutomation: typeof TASK_CENTER_ADAPTER_TEST_FIXTURE_CONTRACT_NO_AI_OR_AUTOMATION;
    items: readonly TaskCenterAdapterTestFixtureContractItem[];
  };
  disabledRuntimeSeamVerification: {
    mode: typeof TASK_CENTER_DISABLED_RUNTIME_SEAM_VERIFICATION_ONLY;
    readonly: typeof TASK_CENTER_DISABLED_RUNTIME_SEAM_VERIFICATION_READONLY;
    draftOnly: typeof TASK_CENTER_DISABLED_RUNTIME_SEAM_VERIFICATION_DRAFT_ONLY;
    noDatabaseRead: typeof TASK_CENTER_DISABLED_RUNTIME_SEAM_VERIFICATION_NO_DATABASE_READ;
    noDatabaseClient: typeof TASK_CENTER_DISABLED_RUNTIME_SEAM_VERIFICATION_NO_DATABASE_CLIENT;
    noTaskMutation: typeof TASK_CENTER_DISABLED_RUNTIME_SEAM_VERIFICATION_NO_TASK_MUTATION;
    noRealData: typeof TASK_CENTER_DISABLED_RUNTIME_SEAM_VERIFICATION_NO_REAL_DATA;
    noEnvEnablement: typeof TASK_CENTER_DISABLED_RUNTIME_SEAM_VERIFICATION_NO_ENV_ENABLEMENT;
    noAiOrAutomation: typeof TASK_CENTER_DISABLED_RUNTIME_SEAM_VERIFICATION_NO_AI_OR_AUTOMATION;
    items: readonly TaskCenterDisabledRuntimeSeamVerificationItem[];
  };
  ownerGateEvidenceMatrix: {
    mode: typeof TASK_CENTER_OWNER_GATE_EVIDENCE_MATRIX_ONLY;
    readonly: typeof TASK_CENTER_OWNER_GATE_EVIDENCE_MATRIX_READONLY;
    draftOnly: typeof TASK_CENTER_OWNER_GATE_EVIDENCE_MATRIX_DRAFT_ONLY;
    noApproval: typeof TASK_CENTER_OWNER_GATE_EVIDENCE_MATRIX_NO_APPROVAL;
    noDatabaseRead: typeof TASK_CENTER_OWNER_GATE_EVIDENCE_MATRIX_NO_DATABASE_READ;
    noDatabaseClient: typeof TASK_CENTER_OWNER_GATE_EVIDENCE_MATRIX_NO_DATABASE_CLIENT;
    noTaskMutation: typeof TASK_CENTER_OWNER_GATE_EVIDENCE_MATRIX_NO_TASK_MUTATION;
    noRealData: typeof TASK_CENTER_OWNER_GATE_EVIDENCE_MATRIX_NO_REAL_DATA;
    noAiOrAutomation: typeof TASK_CENTER_OWNER_GATE_EVIDENCE_MATRIX_NO_AI_OR_AUTOMATION;
    items: readonly TaskCenterOwnerGateEvidenceMatrixItem[];
  };
  adapterPreflightChecklist: {
    mode: typeof TASK_CENTER_ADAPTER_PREFLIGHT_CHECKLIST_ONLY;
    readonly: typeof TASK_CENTER_ADAPTER_PREFLIGHT_CHECKLIST_READONLY;
    draftOnly: typeof TASK_CENTER_ADAPTER_PREFLIGHT_CHECKLIST_DRAFT_ONLY;
    noApproval: typeof TASK_CENTER_ADAPTER_PREFLIGHT_CHECKLIST_NO_APPROVAL;
    noDatabaseRead: typeof TASK_CENTER_ADAPTER_PREFLIGHT_CHECKLIST_NO_DATABASE_READ;
    noDatabaseClient: typeof TASK_CENTER_ADAPTER_PREFLIGHT_CHECKLIST_NO_DATABASE_CLIENT;
    noTaskMutation: typeof TASK_CENTER_ADAPTER_PREFLIGHT_CHECKLIST_NO_TASK_MUTATION;
    noRealData: typeof TASK_CENTER_ADAPTER_PREFLIGHT_CHECKLIST_NO_REAL_DATA;
    noEnvEnablement: typeof TASK_CENTER_ADAPTER_PREFLIGHT_CHECKLIST_NO_ENV_ENABLEMENT;
    noAiOrAutomation: typeof TASK_CENTER_ADAPTER_PREFLIGHT_CHECKLIST_NO_AI_OR_AUTOMATION;
    items: readonly TaskCenterAdapterPreflightChecklistItem[];
  };
  readonlyAdapterDryRunSwitchContract: {
    mode: typeof TASK_CENTER_READONLY_ADAPTER_DRY_RUN_SWITCH_CONTRACT_ONLY;
    readonly: typeof TASK_CENTER_READONLY_ADAPTER_DRY_RUN_SWITCH_CONTRACT_READONLY;
    draftOnly: typeof TASK_CENTER_READONLY_ADAPTER_DRY_RUN_SWITCH_CONTRACT_DRAFT_ONLY;
    noApproval: typeof TASK_CENTER_READONLY_ADAPTER_DRY_RUN_SWITCH_CONTRACT_NO_APPROVAL;
    noDatabaseRead: typeof TASK_CENTER_READONLY_ADAPTER_DRY_RUN_SWITCH_CONTRACT_NO_DATABASE_READ;
    noDatabaseClient: typeof TASK_CENTER_READONLY_ADAPTER_DRY_RUN_SWITCH_CONTRACT_NO_DATABASE_CLIENT;
    noTaskMutation: typeof TASK_CENTER_READONLY_ADAPTER_DRY_RUN_SWITCH_CONTRACT_NO_TASK_MUTATION;
    noRealData: typeof TASK_CENTER_READONLY_ADAPTER_DRY_RUN_SWITCH_CONTRACT_NO_REAL_DATA;
    noEnvEnablement: typeof TASK_CENTER_READONLY_ADAPTER_DRY_RUN_SWITCH_CONTRACT_NO_ENV_ENABLEMENT;
    noAiOrAutomation: typeof TASK_CENTER_READONLY_ADAPTER_DRY_RUN_SWITCH_CONTRACT_NO_AI_OR_AUTOMATION;
    items: readonly TaskCenterReadonlyAdapterDryRunSwitchContractItem[];
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

const pilotReviewPacketItems: readonly TaskCenterPilotReviewPacketItem[] = [
  {
    code: "PILOT_REVIEW_SCOPE_MATCH",
    title: "Scope va lane hien dung",
    requiredReviewer: "IT_DATA",
    passCondition:
      "Evidence shows role, scope, lane and timestamp without raw PII.",
  },
  {
    code: "PILOT_REVIEW_GATE_NO_GO",
    title: "Gate van NO-GO",
    requiredReviewer: "AUDIT",
    passCondition:
      "Evidence shows database NO-GO and no approval action.",
  },
  {
    code: "PILOT_REVIEW_RESTRICTED_DATA",
    title: "Khong lo du lieu han che",
    requiredReviewer: "PHAP_CHE",
    passCondition:
      "Evidence is redacted and does not include CCCD, phone, payment or raw student data.",
  },
  {
    code: "PILOT_REVIEW_OWNER_LANGUAGE",
    title: "Owner hieu copy UAT",
    requiredReviewer: "DEPARTMENT_OWNER",
    passCondition:
      "User can explain allowed, blocked and report-to copy.",
  },
  {
    code: "PILOT_REVIEW_PRODUCTION_BOUNDARY",
    title: "Production remains NO-GO",
    requiredReviewer: "BGH",
    passCondition: "Review packet states production remains NO-GO.",
  },
];

const ownerSignoffRoutingItems: readonly TaskCenterOwnerSignoffRoutingItem[] = [
  {
    code: "OWNER_SIGNOFF_IT_DATA_SCOPE",
    ownerLane: "IT_DATA",
    reviewQuestion: "Workspace, role and lane filter are scope-first.",
    requiredEvidenceCode: "IT_DATA_SCOPE_FIRST_FILTER_SIGNOFF",
    blocksDbReadUntil: "DB_READ_BLOCKED_UNTIL_IT_DATA_SIGNOFF",
  },
  {
    code: "OWNER_SIGNOFF_AUDIT_NEGATIVE_ACCESS",
    ownerLane: "AUDIT",
    reviewQuestion: "Negative-access evidence proves other lanes are blocked.",
    requiredEvidenceCode: "AUDIT_NEGATIVE_ACCESS_EVIDENCE",
    blocksDbReadUntil: "DB_READ_BLOCKED_UNTIL_AUDIT_SIGNOFF",
  },
  {
    code: "OWNER_SIGNOFF_PHAP_CHE_REDACTION",
    ownerLane: "PHAP_CHE",
    reviewQuestion: "Restricted-data boundary is clear and evidence is redacted.",
    requiredEvidenceCode: "PHAP_CHE_RESTRICTED_DATA_BOUNDARY_SIGNOFF",
    blocksDbReadUntil: "DB_READ_BLOCKED_UNTIL_PHAP_CHE_SIGNOFF",
  },
  {
    code: "OWNER_SIGNOFF_DEPARTMENT_LABELS",
    ownerLane: "DEPARTMENT_OWNER",
    reviewQuestion: "Department task labels match real user language.",
    requiredEvidenceCode: "DEPARTMENT_OWNER_TASK_LABEL_ACCEPTANCE",
    blocksDbReadUntil: "DB_READ_BLOCKED_UNTIL_DEPARTMENT_OWNER_SIGNOFF",
  },
  {
    code: "OWNER_SIGNOFF_BGH_NO_GO_ACK",
    ownerLane: "BGH",
    reviewQuestion: "BGH acknowledges production remains NO-GO.",
    requiredEvidenceCode: "BGH_PRODUCTION_NO_GO_ACKNOWLEDGEMENT",
    blocksDbReadUntil: "DB_READ_BLOCKED_UNTIL_BGH_ACKNOWLEDGEMENT",
  },
];

const readonlyAdapterDecisionLedgerItems: readonly TaskCenterReadonlyAdapterDecisionLedgerItem[] =
  [
    {
      code: "ADAPTER_LEDGER_SCOPE_FILTER_HOLD",
      ownerLane: "IT_DATA",
      decision: "HOLD_NO_GO",
      decisionReason: "Scope-first filter signoff is still required.",
      requiredBeforeDbRead: "IT_DATA_SCOPE_FIRST_FILTER_SIGNOFF",
    },
    {
      code: "ADAPTER_LEDGER_NEGATIVE_ACCESS_HOLD",
      ownerLane: "AUDIT",
      decision: "HOLD_NO_GO",
      decisionReason: "Negative-access evidence is still required.",
      requiredBeforeDbRead: "AUDIT_NEGATIVE_ACCESS_EVIDENCE",
    },
    {
      code: "ADAPTER_LEDGER_RESTRICTED_DATA_HOLD",
      ownerLane: "PHAP_CHE",
      decision: "HOLD_NO_GO",
      decisionReason: "Restricted-data boundary signoff is still required.",
      requiredBeforeDbRead: "PHAP_CHE_RESTRICTED_DATA_BOUNDARY_SIGNOFF",
    },
    {
      code: "ADAPTER_LEDGER_DEPARTMENT_LABEL_HOLD",
      ownerLane: "DEPARTMENT_OWNER",
      decision: "HOLD_NO_GO",
      decisionReason: "Department task label acceptance is still required.",
      requiredBeforeDbRead: "DEPARTMENT_OWNER_TASK_LABEL_ACCEPTANCE",
    },
    {
      code: "ADAPTER_LEDGER_BGH_PRODUCTION_HOLD",
      ownerLane: "BGH",
      decision: "HOLD_NO_GO",
      decisionReason: "BGH production NO-GO acknowledgement is still required.",
      requiredBeforeDbRead: "BGH_PRODUCTION_NO_GO_ACKNOWLEDGEMENT",
    },
  ];

const dbReadAdapterImplementationPlanItems: readonly TaskCenterDbReadAdapterImplementationPlanItem[] =
  [
    {
      code: "DB_READ_PLAN_SCOPE_FILTER_CONTRACT",
      phase: "PLAN_ONLY",
      implementationStep: "Define workspace/role/lane filter contract.",
      requiredGateBeforeExecution: "IT_DATA_SCOPE_FIRST_FILTER_SIGNOFF",
      forbiddenInThisSlice: "NO_DATABASE_CLIENT_CREATED",
    },
    {
      code: "DB_READ_PLAN_NEGATIVE_ACCESS_TEST",
      phase: "PLAN_ONLY",
      implementationStep: "Define negative-access test cases before adapter read.",
      requiredGateBeforeExecution: "AUDIT_NEGATIVE_ACCESS_EVIDENCE",
      forbiddenInThisSlice: "NO_DATABASE_READ_EXECUTED",
    },
    {
      code: "DB_READ_PLAN_RESTRICTED_FIELD_ALLOWLIST",
      phase: "PLAN_ONLY",
      implementationStep: "Define metadata-only field allowlist for Task Center.",
      requiredGateBeforeExecution:
        "PHAP_CHE_RESTRICTED_DATA_BOUNDARY_SIGNOFF",
      forbiddenInThisSlice: "NO_RAW_PII_NO_PAYMENT_DATA",
    },
    {
      code: "DB_READ_PLAN_DEPARTMENT_LABEL_MAP",
      phase: "PLAN_ONLY",
      implementationStep: "Define department label mapping for task display.",
      requiredGateBeforeExecution: "DEPARTMENT_OWNER_TASK_LABEL_ACCEPTANCE",
      forbiddenInThisSlice: "NO_TASK_MUTATION_ROUTE_CREATED",
    },
    {
      code: "DB_READ_PLAN_PRODUCTION_BOUNDARY",
      phase: "PLAN_ONLY",
      implementationStep: "Keep production boundary explicit after adapter plan.",
      requiredGateBeforeExecution: "BGH_PRODUCTION_NO_GO_ACKNOWLEDGEMENT",
      forbiddenInThisSlice: "NO_PRODUCTION_GO_NO_DEPLOY",
    },
  ];

const adapterTestFixtureContractItems: readonly TaskCenterAdapterTestFixtureContractItem[] =
  [
    {
      code: "FIXTURE_CONTRACT_SCOPE_INCLUDED",
      fixtureMode: "SYNTHETIC_CONTRACT",
      workspaceLane: "ADMISSION_SYNTHETIC_LANE",
      expectedResult: "Only matching department task metadata is visible.",
      requiredBeforeDbRead: "IT_DATA_SCOPE_FIRST_FILTER_SIGNOFF",
      forbiddenInThisSlice: "NO_REAL_USER_DATA",
    },
    {
      code: "FIXTURE_CONTRACT_SCOPE_EXCLUDED",
      fixtureMode: "SYNTHETIC_CONTRACT",
      workspaceLane: "CTHSSV_NEGATIVE_ACCESS_LANE",
      expectedResult: "Non-matching lane returns no task metadata.",
      requiredBeforeDbRead: "AUDIT_NEGATIVE_ACCESS_EVIDENCE",
      forbiddenInThisSlice: "NO_DATABASE_READ_EXECUTED",
    },
    {
      code: "FIXTURE_CONTRACT_RESTRICTED_FIELD_MASK",
      fixtureMode: "SYNTHETIC_CONTRACT",
      workspaceLane: "PHAP_CHE_METADATA_ONLY_LANE",
      expectedResult: "Fixture excludes CCCD, phone, payment and raw PII fields.",
      requiredBeforeDbRead: "PHAP_CHE_RESTRICTED_DATA_BOUNDARY_SIGNOFF",
      forbiddenInThisSlice: "NO_RAW_PII_NO_PAYMENT_DATA",
    },
    {
      code: "FIXTURE_CONTRACT_STATUS_READONLY",
      fixtureMode: "SYNTHETIC_CONTRACT",
      workspaceLane: "READONLY_TASK_STATUS_LANE",
      expectedResult: "Reading fixture cannot change task status or audit rows.",
      requiredBeforeDbRead: "DEPARTMENT_OWNER_TASK_LABEL_ACCEPTANCE",
      forbiddenInThisSlice: "NO_TASK_MUTATION_ROUTE_CREATED",
    },
    {
      code: "FIXTURE_CONTRACT_OWNER_GATE_NO_GO",
      fixtureMode: "SYNTHETIC_CONTRACT",
      workspaceLane: "BGH_PRODUCTION_NO_GO_LANE",
      expectedResult: "Fixture keeps production gate NO-GO until formal approval.",
      requiredBeforeDbRead: "BGH_PRODUCTION_NO_GO_ACKNOWLEDGEMENT",
      forbiddenInThisSlice: "NO_PRODUCTION_GO_NO_DEPLOY",
    },
  ];

const disabledRuntimeSeamVerificationItems: readonly TaskCenterDisabledRuntimeSeamVerificationItem[] =
  [
    {
      code: "RUNTIME_SEAM_ADAPTER_DISABLED_DEFAULT",
      seamState: "DISABLED_RUNTIME_SEAM",
      verifiedRuntimeSeam:
        "createTaskCenterReadonlyAdapterSkeleton returns DISABLED_BY_DEFAULT.",
      requiredBeforeEnablement: "FEATURE_FLAG_REQUIRED_AND_OWNER_GATES",
      forbiddenInThisSlice: "NO_DATABASE_CLIENT_CREATED",
    },
    {
      code: "RUNTIME_SEAM_FALLBACK_SOURCE_ACTIVE",
      seamState: "DISABLED_RUNTIME_SEAM",
      verifiedRuntimeSeam:
        "createTaskCenterUiFallbackSource returns MOCK_READONLY_FALLBACK_ACTIVE.",
      requiredBeforeEnablement: "MOCK_FALLBACK_CONFIRMED",
      forbiddenInThisSlice: "NO_DATABASE_READ_EXECUTED",
    },
    {
      code: "RUNTIME_SEAM_EMPTY_ADAPTER_ROWS",
      seamState: "DISABLED_RUNTIME_SEAM",
      verifiedRuntimeSeam:
        "adapterRows remains readonly empty array until DB read approval.",
      requiredBeforeEnablement: "AUDIT_NEGATIVE_ACCESS_EVIDENCE",
      forbiddenInThisSlice: "NO_REAL_USER_DATA",
    },
    {
      code: "RUNTIME_SEAM_NO_ENV_ENABLEMENT",
      seamState: "DISABLED_RUNTIME_SEAM",
      verifiedRuntimeSeam: "No env or feature flag enables adapter in this slice.",
      requiredBeforeEnablement: "IT_DATA_RUNTIME_FLAG_SIGNOFF",
      forbiddenInThisSlice: "NO_ENV_ENABLEMENT",
    },
    {
      code: "RUNTIME_SEAM_PRODUCTION_NO_GO",
      seamState: "DISABLED_RUNTIME_SEAM",
      verifiedRuntimeSeam:
        "Production remains NO-GO while seam verification is local only.",
      requiredBeforeEnablement: "BGH_PRODUCTION_NO_GO_ACKNOWLEDGEMENT",
      forbiddenInThisSlice: "NO_PRODUCTION_GO_NO_DEPLOY",
    },
  ];

const ownerGateEvidenceMatrixItems: readonly TaskCenterOwnerGateEvidenceMatrixItem[] =
  [
    {
      code: "OWNER_GATE_EVIDENCE_IT_DATA_SCOPE",
      ownerLane: "IT_DATA",
      evidenceState: "OWNER_EVIDENCE_REQUIRED",
      requiredEvidenceCode: "IT_DATA_SCOPE_FIRST_FILTER_SIGNOFF",
      passCondition: "Workspace, role and lane filter contract is signed off.",
      blocksDbReadUntil: "DB_READ_BLOCKED_UNTIL_IT_DATA_SCOPE_EVIDENCE",
      forbiddenInThisSlice: "NO_DATABASE_CLIENT_CREATED",
    },
    {
      code: "OWNER_GATE_EVIDENCE_AUDIT_NEGATIVE_ACCESS",
      ownerLane: "AUDIT",
      evidenceState: "OWNER_EVIDENCE_REQUIRED",
      requiredEvidenceCode: "AUDIT_NEGATIVE_ACCESS_EVIDENCE",
      passCondition: "Negative-access evidence proves other lanes are blocked.",
      blocksDbReadUntil: "DB_READ_BLOCKED_UNTIL_AUDIT_NEGATIVE_ACCESS_EVIDENCE",
      forbiddenInThisSlice: "NO_DATABASE_READ_EXECUTED",
    },
    {
      code: "OWNER_GATE_EVIDENCE_PHAP_CHE_RESTRICTED_DATA",
      ownerLane: "PHAP_CHE",
      evidenceState: "OWNER_EVIDENCE_REQUIRED",
      requiredEvidenceCode: "PHAP_CHE_RESTRICTED_DATA_BOUNDARY_SIGNOFF",
      passCondition: "Restricted-field allowlist excludes raw PII and payment data.",
      blocksDbReadUntil: "DB_READ_BLOCKED_UNTIL_PHAP_CHE_EVIDENCE",
      forbiddenInThisSlice: "NO_RAW_PII_NO_PAYMENT_DATA",
    },
    {
      code: "OWNER_GATE_EVIDENCE_DEPARTMENT_LABEL_ACCEPTANCE",
      ownerLane: "DEPARTMENT_OWNER",
      evidenceState: "OWNER_EVIDENCE_REQUIRED",
      requiredEvidenceCode: "DEPARTMENT_OWNER_TASK_LABEL_ACCEPTANCE",
      passCondition: "Department owner confirms task labels match real work.",
      blocksDbReadUntil: "DB_READ_BLOCKED_UNTIL_DEPARTMENT_OWNER_EVIDENCE",
      forbiddenInThisSlice: "NO_TASK_MUTATION_ROUTE_CREATED",
    },
    {
      code: "OWNER_GATE_EVIDENCE_BGH_NO_GO_ACK",
      ownerLane: "BGH",
      evidenceState: "OWNER_EVIDENCE_REQUIRED",
      requiredEvidenceCode: "BGH_PRODUCTION_NO_GO_ACKNOWLEDGEMENT",
      passCondition: "BGH acknowledges production remains NO-GO.",
      blocksDbReadUntil: "DB_READ_BLOCKED_UNTIL_BGH_NO_GO_EVIDENCE",
      forbiddenInThisSlice: "NO_PRODUCTION_GO_NO_DEPLOY",
    },
  ];

const adapterPreflightChecklistItems: readonly TaskCenterAdapterPreflightChecklistItem[] =
  [
    {
      code: "PREFLIGHT_SCOPE_FILTER_SIGNOFF",
      preflightState: "PREFLIGHT_REQUIRED",
      checklistOwner: "IT_DATA",
      requiredBeforeAdapterRead: "IT_DATA_SCOPE_FIRST_FILTER_SIGNOFF",
      passCondition:
        "Scope-first filter contract is signed off and mapped to workspace/role/lane.",
      forbiddenInThisSlice: "NO_DATABASE_CLIENT_CREATED",
    },
    {
      code: "PREFLIGHT_NEGATIVE_ACCESS_EVIDENCE",
      preflightState: "PREFLIGHT_REQUIRED",
      checklistOwner: "AUDIT",
      requiredBeforeAdapterRead: "AUDIT_NEGATIVE_ACCESS_EVIDENCE",
      passCondition:
        "Negative-access evidence covers excluded lanes and no broad fallback.",
      forbiddenInThisSlice: "NO_DATABASE_READ_EXECUTED",
    },
    {
      code: "PREFLIGHT_RESTRICTED_FIELD_ALLOWLIST",
      preflightState: "PREFLIGHT_REQUIRED",
      checklistOwner: "PHAP_CHE",
      requiredBeforeAdapterRead:
        "PHAP_CHE_RESTRICTED_DATA_BOUNDARY_SIGNOFF",
      passCondition:
        "Metadata allowlist excludes CCCD, phone, payment and raw PII.",
      forbiddenInThisSlice: "NO_RAW_PII_NO_PAYMENT_DATA",
    },
    {
      code: "PREFLIGHT_OWNER_LABEL_ACCEPTANCE",
      preflightState: "PREFLIGHT_REQUIRED",
      checklistOwner: "DEPARTMENT_OWNER",
      requiredBeforeAdapterRead: "DEPARTMENT_OWNER_TASK_LABEL_ACCEPTANCE",
      passCondition: "Department owner accepts task labels and readonly copy.",
      forbiddenInThisSlice: "NO_TASK_MUTATION_ROUTE_CREATED",
    },
    {
      code: "PREFLIGHT_BGH_NO_GO_ACK",
      preflightState: "PREFLIGHT_REQUIRED",
      checklistOwner: "BGH",
      requiredBeforeAdapterRead: "BGH_PRODUCTION_NO_GO_ACKNOWLEDGEMENT",
      passCondition:
        "BGH acknowledges adapter remains pre-production and NO-GO.",
      forbiddenInThisSlice: "NO_PRODUCTION_GO_NO_DEPLOY",
    },
  ];

const readonlyAdapterDryRunSwitchContractItems: readonly TaskCenterReadonlyAdapterDryRunSwitchContractItem[] =
  [
    {
      code: "DRY_RUN_SWITCH_SCOPE_FILTER_ONLY",
      switchState: "DRY_RUN_SWITCH_CONTRACT",
      contractOwner: "IT_DATA",
      requiredBeforeSwitch: "IT_DATA_SCOPE_FIRST_FILTER_SIGNOFF",
      dryRunBehavior:
        "Switch contract may point only to scope-first adapter path and must default OFF.",
      forbiddenInThisSlice: "NO_ENV_ENABLEMENT",
    },
    {
      code: "DRY_RUN_SWITCH_NEGATIVE_ACCESS_GUARD",
      switchState: "DRY_RUN_SWITCH_CONTRACT",
      contractOwner: "AUDIT",
      requiredBeforeSwitch: "AUDIT_NEGATIVE_ACCESS_EVIDENCE",
      dryRunBehavior:
        "Dry-run switch must require negative-access fixture evidence before any DB read.",
      forbiddenInThisSlice: "NO_DATABASE_READ_EXECUTED",
    },
    {
      code: "DRY_RUN_SWITCH_FIELD_ALLOWLIST_GUARD",
      switchState: "DRY_RUN_SWITCH_CONTRACT",
      contractOwner: "PHAP_CHE",
      requiredBeforeSwitch: "PHAP_CHE_RESTRICTED_DATA_BOUNDARY_SIGNOFF",
      dryRunBehavior:
        "Dry-run switch must expose metadata allowlist only; raw PII/payment fields stay blocked.",
      forbiddenInThisSlice: "NO_RAW_PII_NO_PAYMENT_DATA",
    },
    {
      code: "DRY_RUN_SWITCH_READONLY_STATUS",
      switchState: "DRY_RUN_SWITCH_CONTRACT",
      contractOwner: "DEPARTMENT_OWNER",
      requiredBeforeSwitch: "DEPARTMENT_OWNER_TASK_LABEL_ACCEPTANCE",
      dryRunBehavior:
        "Dry-run switch cannot create, update, approve or change task status.",
      forbiddenInThisSlice: "NO_TASK_MUTATION_ROUTE_CREATED",
    },
    {
      code: "DRY_RUN_SWITCH_PRODUCTION_NO_GO",
      switchState: "DRY_RUN_SWITCH_CONTRACT",
      contractOwner: "BGH",
      requiredBeforeSwitch: "BGH_PRODUCTION_NO_GO_ACKNOWLEDGEMENT",
      dryRunBehavior:
        "Dry-run switch remains local/UAT-only and cannot imply production readiness.",
      forbiddenInThisSlice: "NO_PRODUCTION_GO_NO_DEPLOY",
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
    pilotReviewPacket: {
      mode: TASK_CENTER_PILOT_REVIEW_PACKET_ONLY,
      readonly: TASK_CENTER_PILOT_REVIEW_PACKET_READONLY,
      draftOnly: TASK_CENTER_PILOT_REVIEW_PACKET_DRAFT_ONLY,
      noApproval: TASK_CENTER_PILOT_REVIEW_PACKET_NO_APPROVAL,
      noUpload: TASK_CENTER_PILOT_REVIEW_PACKET_NO_UPLOAD,
      noStorageWrite: TASK_CENTER_PILOT_REVIEW_PACKET_NO_STORAGE_WRITE,
      noRawPii: TASK_CENTER_PILOT_REVIEW_PACKET_NO_RAW_PII,
      items: pilotReviewPacketItems,
    },
    ownerSignoffRoutingMap: {
      mode: TASK_CENTER_OWNER_SIGNOFF_ROUTING_MAP_ONLY,
      readonly: TASK_CENTER_OWNER_SIGNOFF_ROUTING_MAP_READONLY,
      draftOnly: TASK_CENTER_OWNER_SIGNOFF_ROUTING_MAP_DRAFT_ONLY,
      noApproval: TASK_CENTER_OWNER_SIGNOFF_ROUTING_MAP_NO_APPROVAL,
      noDatabaseRead: TASK_CENTER_OWNER_SIGNOFF_ROUTING_MAP_NO_DATABASE_READ,
      noTaskMutation: TASK_CENTER_OWNER_SIGNOFF_ROUTING_MAP_NO_TASK_MUTATION,
      noAiOrAutomation: TASK_CENTER_OWNER_SIGNOFF_ROUTING_MAP_NO_AI_OR_AUTOMATION,
      items: ownerSignoffRoutingItems,
    },
    readonlyAdapterDecisionLedger: {
      mode: TASK_CENTER_READONLY_ADAPTER_DECISION_LEDGER_ONLY,
      readonly: TASK_CENTER_READONLY_ADAPTER_DECISION_LEDGER_READONLY,
      draftOnly: TASK_CENTER_READONLY_ADAPTER_DECISION_LEDGER_DRAFT_ONLY,
      noApproval: TASK_CENTER_READONLY_ADAPTER_DECISION_LEDGER_NO_APPROVAL,
      noDatabaseRead: TASK_CENTER_READONLY_ADAPTER_DECISION_LEDGER_NO_DATABASE_READ,
      noTaskMutation: TASK_CENTER_READONLY_ADAPTER_DECISION_LEDGER_NO_TASK_MUTATION,
      noAiOrAutomation: TASK_CENTER_READONLY_ADAPTER_DECISION_LEDGER_NO_AI_OR_AUTOMATION,
      items: readonlyAdapterDecisionLedgerItems,
    },
    dbReadAdapterImplementationPlan: {
      mode: TASK_CENTER_DB_READ_ADAPTER_IMPLEMENTATION_PLAN_ONLY,
      readonly: TASK_CENTER_DB_READ_ADAPTER_IMPLEMENTATION_PLAN_READONLY,
      draftOnly: TASK_CENTER_DB_READ_ADAPTER_IMPLEMENTATION_PLAN_DRAFT_ONLY,
      noDatabaseRead: TASK_CENTER_DB_READ_ADAPTER_IMPLEMENTATION_PLAN_NO_DATABASE_READ,
      noDatabaseClient: TASK_CENTER_DB_READ_ADAPTER_IMPLEMENTATION_PLAN_NO_DATABASE_CLIENT,
      noTaskMutation: TASK_CENTER_DB_READ_ADAPTER_IMPLEMENTATION_PLAN_NO_TASK_MUTATION,
      noAiOrAutomation: TASK_CENTER_DB_READ_ADAPTER_IMPLEMENTATION_PLAN_NO_AI_OR_AUTOMATION,
      items: dbReadAdapterImplementationPlanItems,
    },
    adapterTestFixtureContract: {
      mode: TASK_CENTER_ADAPTER_TEST_FIXTURE_CONTRACT_ONLY,
      readonly: TASK_CENTER_ADAPTER_TEST_FIXTURE_CONTRACT_READONLY,
      draftOnly: TASK_CENTER_ADAPTER_TEST_FIXTURE_CONTRACT_DRAFT_ONLY,
      noDatabaseRead: TASK_CENTER_ADAPTER_TEST_FIXTURE_CONTRACT_NO_DATABASE_READ,
      noDatabaseClient: TASK_CENTER_ADAPTER_TEST_FIXTURE_CONTRACT_NO_DATABASE_CLIENT,
      noTaskMutation: TASK_CENTER_ADAPTER_TEST_FIXTURE_CONTRACT_NO_TASK_MUTATION,
      noRealData: TASK_CENTER_ADAPTER_TEST_FIXTURE_CONTRACT_NO_REAL_DATA,
      noAiOrAutomation: TASK_CENTER_ADAPTER_TEST_FIXTURE_CONTRACT_NO_AI_OR_AUTOMATION,
      items: adapterTestFixtureContractItems,
    },
    disabledRuntimeSeamVerification: {
      mode: TASK_CENTER_DISABLED_RUNTIME_SEAM_VERIFICATION_ONLY,
      readonly: TASK_CENTER_DISABLED_RUNTIME_SEAM_VERIFICATION_READONLY,
      draftOnly: TASK_CENTER_DISABLED_RUNTIME_SEAM_VERIFICATION_DRAFT_ONLY,
      noDatabaseRead: TASK_CENTER_DISABLED_RUNTIME_SEAM_VERIFICATION_NO_DATABASE_READ,
      noDatabaseClient: TASK_CENTER_DISABLED_RUNTIME_SEAM_VERIFICATION_NO_DATABASE_CLIENT,
      noTaskMutation: TASK_CENTER_DISABLED_RUNTIME_SEAM_VERIFICATION_NO_TASK_MUTATION,
      noRealData: TASK_CENTER_DISABLED_RUNTIME_SEAM_VERIFICATION_NO_REAL_DATA,
      noEnvEnablement: TASK_CENTER_DISABLED_RUNTIME_SEAM_VERIFICATION_NO_ENV_ENABLEMENT,
      noAiOrAutomation: TASK_CENTER_DISABLED_RUNTIME_SEAM_VERIFICATION_NO_AI_OR_AUTOMATION,
      items: disabledRuntimeSeamVerificationItems,
    },
    ownerGateEvidenceMatrix: {
      mode: TASK_CENTER_OWNER_GATE_EVIDENCE_MATRIX_ONLY,
      readonly: TASK_CENTER_OWNER_GATE_EVIDENCE_MATRIX_READONLY,
      draftOnly: TASK_CENTER_OWNER_GATE_EVIDENCE_MATRIX_DRAFT_ONLY,
      noApproval: TASK_CENTER_OWNER_GATE_EVIDENCE_MATRIX_NO_APPROVAL,
      noDatabaseRead: TASK_CENTER_OWNER_GATE_EVIDENCE_MATRIX_NO_DATABASE_READ,
      noDatabaseClient: TASK_CENTER_OWNER_GATE_EVIDENCE_MATRIX_NO_DATABASE_CLIENT,
      noTaskMutation: TASK_CENTER_OWNER_GATE_EVIDENCE_MATRIX_NO_TASK_MUTATION,
      noRealData: TASK_CENTER_OWNER_GATE_EVIDENCE_MATRIX_NO_REAL_DATA,
      noAiOrAutomation: TASK_CENTER_OWNER_GATE_EVIDENCE_MATRIX_NO_AI_OR_AUTOMATION,
      items: ownerGateEvidenceMatrixItems,
    },
    adapterPreflightChecklist: {
      mode: TASK_CENTER_ADAPTER_PREFLIGHT_CHECKLIST_ONLY,
      readonly: TASK_CENTER_ADAPTER_PREFLIGHT_CHECKLIST_READONLY,
      draftOnly: TASK_CENTER_ADAPTER_PREFLIGHT_CHECKLIST_DRAFT_ONLY,
      noApproval: TASK_CENTER_ADAPTER_PREFLIGHT_CHECKLIST_NO_APPROVAL,
      noDatabaseRead: TASK_CENTER_ADAPTER_PREFLIGHT_CHECKLIST_NO_DATABASE_READ,
      noDatabaseClient: TASK_CENTER_ADAPTER_PREFLIGHT_CHECKLIST_NO_DATABASE_CLIENT,
      noTaskMutation: TASK_CENTER_ADAPTER_PREFLIGHT_CHECKLIST_NO_TASK_MUTATION,
      noRealData: TASK_CENTER_ADAPTER_PREFLIGHT_CHECKLIST_NO_REAL_DATA,
      noEnvEnablement: TASK_CENTER_ADAPTER_PREFLIGHT_CHECKLIST_NO_ENV_ENABLEMENT,
      noAiOrAutomation: TASK_CENTER_ADAPTER_PREFLIGHT_CHECKLIST_NO_AI_OR_AUTOMATION,
      items: adapterPreflightChecklistItems,
    },
    readonlyAdapterDryRunSwitchContract: {
      mode: TASK_CENTER_READONLY_ADAPTER_DRY_RUN_SWITCH_CONTRACT_ONLY,
      readonly: TASK_CENTER_READONLY_ADAPTER_DRY_RUN_SWITCH_CONTRACT_READONLY,
      draftOnly: TASK_CENTER_READONLY_ADAPTER_DRY_RUN_SWITCH_CONTRACT_DRAFT_ONLY,
      noApproval: TASK_CENTER_READONLY_ADAPTER_DRY_RUN_SWITCH_CONTRACT_NO_APPROVAL,
      noDatabaseRead: TASK_CENTER_READONLY_ADAPTER_DRY_RUN_SWITCH_CONTRACT_NO_DATABASE_READ,
      noDatabaseClient: TASK_CENTER_READONLY_ADAPTER_DRY_RUN_SWITCH_CONTRACT_NO_DATABASE_CLIENT,
      noTaskMutation: TASK_CENTER_READONLY_ADAPTER_DRY_RUN_SWITCH_CONTRACT_NO_TASK_MUTATION,
      noRealData: TASK_CENTER_READONLY_ADAPTER_DRY_RUN_SWITCH_CONTRACT_NO_REAL_DATA,
      noEnvEnablement: TASK_CENTER_READONLY_ADAPTER_DRY_RUN_SWITCH_CONTRACT_NO_ENV_ENABLEMENT,
      noAiOrAutomation: TASK_CENTER_READONLY_ADAPTER_DRY_RUN_SWITCH_CONTRACT_NO_AI_OR_AUTOMATION,
      items: readonlyAdapterDryRunSwitchContractItems,
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
