import Link from "next/link";
import {
  AlertTriangle,
  ClipboardCheck,
  GraduationCap,
  Handshake,
  ShieldCheck,
  Users,
  WalletCards,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import type {
  HEUWorkspaceActionGate,
  HEUWorkspaceScopeDecision,
} from "@/lib/heu-workspace-context";
import {
  TASK_CENTER_MOCK_DATA_ONLY,
  TASK_CENTER_MOCK_READONLY_LIST,
  TASK_CENTER_NO_AI_OR_AUTOMATION,
  TASK_CENTER_NO_TASK_MUTATION,
} from "@/lib/task-center-mock-read-model";
import {
  createTaskCenterUiFallbackSource,
  TASK_CENTER_DISABLED_ADAPTER_OUTPUT_ONLY,
  TASK_CENTER_MOCK_READONLY_FALLBACK_ACTIVE,
  TASK_CENTER_UI_FALLBACK_NO_DATABASE_CLIENT,
  TASK_CENTER_UI_FALLBACK_NO_DATABASE_READ,
  TASK_CENTER_UI_FALLBACK_WIRING_ONLY,
} from "@/lib/task-center-ui-fallback-source";
import {
  createTaskCenterGateEvidencePanelSource,
  TASK_CENTER_GATE_EVIDENCE_PANEL_DATABASE_NO_GO,
  TASK_CENTER_GATE_EVIDENCE_PANEL_NO_AI_OR_AUTOMATION,
  TASK_CENTER_GATE_EVIDENCE_PANEL_NO_DATABASE_CLIENT,
  TASK_CENTER_GATE_EVIDENCE_PANEL_NO_DATABASE_READ,
  TASK_CENTER_GATE_EVIDENCE_PANEL_NO_SQL_MIGRATION,
  TASK_CENTER_GATE_EVIDENCE_PANEL_NO_TASK_MUTATION,
  TASK_CENTER_GATE_EVIDENCE_PANEL_ONLY,
  TASK_CENTER_GATE_EVIDENCE_PANEL_READONLY,
  TASK_CENTER_ADAPTER_TEST_FIXTURE_CONTRACT_DRAFT_ONLY,
  TASK_CENTER_ADAPTER_TEST_FIXTURE_CONTRACT_NO_AI_OR_AUTOMATION,
  TASK_CENTER_ADAPTER_TEST_FIXTURE_CONTRACT_NO_DATABASE_CLIENT,
  TASK_CENTER_ADAPTER_TEST_FIXTURE_CONTRACT_NO_DATABASE_READ,
  TASK_CENTER_ADAPTER_TEST_FIXTURE_CONTRACT_NO_REAL_DATA,
  TASK_CENTER_ADAPTER_TEST_FIXTURE_CONTRACT_NO_TASK_MUTATION,
  TASK_CENTER_ADAPTER_TEST_FIXTURE_CONTRACT_ONLY,
  TASK_CENTER_ADAPTER_TEST_FIXTURE_CONTRACT_READONLY,
  TASK_CENTER_DISABLED_RUNTIME_SEAM_VERIFICATION_DRAFT_ONLY,
  TASK_CENTER_DISABLED_RUNTIME_SEAM_VERIFICATION_NO_AI_OR_AUTOMATION,
  TASK_CENTER_DISABLED_RUNTIME_SEAM_VERIFICATION_NO_DATABASE_CLIENT,
  TASK_CENTER_DISABLED_RUNTIME_SEAM_VERIFICATION_NO_DATABASE_READ,
  TASK_CENTER_DISABLED_RUNTIME_SEAM_VERIFICATION_NO_ENV_ENABLEMENT,
  TASK_CENTER_DISABLED_RUNTIME_SEAM_VERIFICATION_NO_REAL_DATA,
  TASK_CENTER_DISABLED_RUNTIME_SEAM_VERIFICATION_NO_TASK_MUTATION,
  TASK_CENTER_DISABLED_RUNTIME_SEAM_VERIFICATION_ONLY,
  TASK_CENTER_DISABLED_RUNTIME_SEAM_VERIFICATION_READONLY,
  TASK_CENTER_ADAPTER_PREFLIGHT_CHECKLIST_DRAFT_ONLY,
  TASK_CENTER_ADAPTER_PREFLIGHT_CHECKLIST_NO_AI_OR_AUTOMATION,
  TASK_CENTER_ADAPTER_PREFLIGHT_CHECKLIST_NO_APPROVAL,
  TASK_CENTER_ADAPTER_PREFLIGHT_CHECKLIST_NO_DATABASE_CLIENT,
  TASK_CENTER_ADAPTER_PREFLIGHT_CHECKLIST_NO_DATABASE_READ,
  TASK_CENTER_ADAPTER_PREFLIGHT_CHECKLIST_NO_ENV_ENABLEMENT,
  TASK_CENTER_ADAPTER_PREFLIGHT_CHECKLIST_NO_REAL_DATA,
  TASK_CENTER_ADAPTER_PREFLIGHT_CHECKLIST_NO_TASK_MUTATION,
  TASK_CENTER_ADAPTER_PREFLIGHT_CHECKLIST_ONLY,
  TASK_CENTER_ADAPTER_PREFLIGHT_CHECKLIST_READONLY,
  TASK_CENTER_READONLY_ADAPTER_DRY_RUN_SWITCH_CONTRACT_DRAFT_ONLY,
  TASK_CENTER_READONLY_ADAPTER_DRY_RUN_SWITCH_CONTRACT_NO_AI_OR_AUTOMATION,
  TASK_CENTER_READONLY_ADAPTER_DRY_RUN_SWITCH_CONTRACT_NO_APPROVAL,
  TASK_CENTER_READONLY_ADAPTER_DRY_RUN_SWITCH_CONTRACT_NO_DATABASE_CLIENT,
  TASK_CENTER_READONLY_ADAPTER_DRY_RUN_SWITCH_CONTRACT_NO_DATABASE_READ,
  TASK_CENTER_READONLY_ADAPTER_DRY_RUN_SWITCH_CONTRACT_NO_ENV_ENABLEMENT,
  TASK_CENTER_READONLY_ADAPTER_DRY_RUN_SWITCH_CONTRACT_NO_REAL_DATA,
  TASK_CENTER_READONLY_ADAPTER_DRY_RUN_SWITCH_CONTRACT_NO_TASK_MUTATION,
  TASK_CENTER_READONLY_ADAPTER_DRY_RUN_SWITCH_CONTRACT_ONLY,
  TASK_CENTER_READONLY_ADAPTER_DRY_RUN_SWITCH_CONTRACT_READONLY,
  TASK_CENTER_DRY_RUN_ENV_GATE_LEDGER_DRAFT_ONLY,
  TASK_CENTER_DRY_RUN_ENV_GATE_LEDGER_NO_AI_OR_AUTOMATION,
  TASK_CENTER_DRY_RUN_ENV_GATE_LEDGER_NO_APPROVAL,
  TASK_CENTER_DRY_RUN_ENV_GATE_LEDGER_NO_DATABASE_CLIENT,
  TASK_CENTER_DRY_RUN_ENV_GATE_LEDGER_NO_DATABASE_READ,
  TASK_CENTER_DRY_RUN_ENV_GATE_LEDGER_NO_ENV_ENABLEMENT,
  TASK_CENTER_DRY_RUN_ENV_GATE_LEDGER_NO_REAL_DATA,
  TASK_CENTER_DRY_RUN_ENV_GATE_LEDGER_NO_TASK_MUTATION,
  TASK_CENTER_DRY_RUN_ENV_GATE_LEDGER_ONLY,
  TASK_CENTER_DRY_RUN_ENV_GATE_LEDGER_READONLY,
  TASK_CENTER_ADAPTER_DRY_RUN_READINESS_REVIEW_DRAFT_ONLY,
  TASK_CENTER_ADAPTER_DRY_RUN_READINESS_REVIEW_NO_AI_OR_AUTOMATION,
  TASK_CENTER_ADAPTER_DRY_RUN_READINESS_REVIEW_NO_APPROVAL,
  TASK_CENTER_ADAPTER_DRY_RUN_READINESS_REVIEW_NO_DATABASE_CLIENT,
  TASK_CENTER_ADAPTER_DRY_RUN_READINESS_REVIEW_NO_DATABASE_READ,
  TASK_CENTER_ADAPTER_DRY_RUN_READINESS_REVIEW_NO_ENV_ENABLEMENT,
  TASK_CENTER_ADAPTER_DRY_RUN_READINESS_REVIEW_NO_REAL_DATA,
  TASK_CENTER_ADAPTER_DRY_RUN_READINESS_REVIEW_NO_TASK_MUTATION,
  TASK_CENTER_ADAPTER_DRY_RUN_READINESS_REVIEW_ONLY,
  TASK_CENTER_ADAPTER_DRY_RUN_READINESS_REVIEW_READONLY,
  TASK_CENTER_ADAPTER_DRY_RUN_STATIC_NEGATIVE_ACCESS_PACKET_DRAFT_ONLY,
  TASK_CENTER_ADAPTER_DRY_RUN_STATIC_NEGATIVE_ACCESS_PACKET_NO_AI_OR_AUTOMATION,
  TASK_CENTER_ADAPTER_DRY_RUN_STATIC_NEGATIVE_ACCESS_PACKET_NO_APPROVAL,
  TASK_CENTER_ADAPTER_DRY_RUN_STATIC_NEGATIVE_ACCESS_PACKET_NO_DATABASE_CLIENT,
  TASK_CENTER_ADAPTER_DRY_RUN_STATIC_NEGATIVE_ACCESS_PACKET_NO_DATABASE_READ,
  TASK_CENTER_ADAPTER_DRY_RUN_STATIC_NEGATIVE_ACCESS_PACKET_NO_ENV_ENABLEMENT,
  TASK_CENTER_ADAPTER_DRY_RUN_STATIC_NEGATIVE_ACCESS_PACKET_NO_REAL_DATA,
  TASK_CENTER_ADAPTER_DRY_RUN_STATIC_NEGATIVE_ACCESS_PACKET_NO_TASK_MUTATION,
  TASK_CENTER_ADAPTER_DRY_RUN_STATIC_NEGATIVE_ACCESS_PACKET_ONLY,
  TASK_CENTER_ADAPTER_DRY_RUN_STATIC_NEGATIVE_ACCESS_PACKET_READONLY,
  TASK_CENTER_ADAPTER_DRY_RUN_READONLY_TEST_HARNESS_DESIGN_DRAFT_ONLY,
  TASK_CENTER_ADAPTER_DRY_RUN_READONLY_TEST_HARNESS_DESIGN_NO_AI_OR_AUTOMATION,
  TASK_CENTER_ADAPTER_DRY_RUN_READONLY_TEST_HARNESS_DESIGN_NO_APPROVAL,
  TASK_CENTER_ADAPTER_DRY_RUN_READONLY_TEST_HARNESS_DESIGN_NO_DATABASE_CLIENT,
  TASK_CENTER_ADAPTER_DRY_RUN_READONLY_TEST_HARNESS_DESIGN_NO_DATABASE_READ,
  TASK_CENTER_ADAPTER_DRY_RUN_READONLY_TEST_HARNESS_DESIGN_NO_ENV_ENABLEMENT,
  TASK_CENTER_ADAPTER_DRY_RUN_READONLY_TEST_HARNESS_DESIGN_NO_REAL_DATA,
  TASK_CENTER_ADAPTER_DRY_RUN_READONLY_TEST_HARNESS_DESIGN_NO_TASK_MUTATION,
  TASK_CENTER_ADAPTER_DRY_RUN_READONLY_TEST_HARNESS_DESIGN_ONLY,
  TASK_CENTER_ADAPTER_DRY_RUN_READONLY_TEST_HARNESS_DESIGN_READONLY,
  TASK_CENTER_ADAPTER_DRY_RUN_SYNTHETIC_FIXTURE_CONTRACT_DRAFT_ONLY,
  TASK_CENTER_ADAPTER_DRY_RUN_SYNTHETIC_FIXTURE_CONTRACT_NO_AI_OR_AUTOMATION,
  TASK_CENTER_ADAPTER_DRY_RUN_SYNTHETIC_FIXTURE_CONTRACT_NO_APPROVAL,
  TASK_CENTER_ADAPTER_DRY_RUN_SYNTHETIC_FIXTURE_CONTRACT_NO_DATABASE_CLIENT,
  TASK_CENTER_ADAPTER_DRY_RUN_SYNTHETIC_FIXTURE_CONTRACT_NO_DATABASE_READ,
  TASK_CENTER_ADAPTER_DRY_RUN_SYNTHETIC_FIXTURE_CONTRACT_NO_ENV_ENABLEMENT,
  TASK_CENTER_ADAPTER_DRY_RUN_SYNTHETIC_FIXTURE_CONTRACT_NO_REAL_DATA,
  TASK_CENTER_ADAPTER_DRY_RUN_SYNTHETIC_FIXTURE_CONTRACT_NO_TASK_MUTATION,
  TASK_CENTER_ADAPTER_DRY_RUN_SYNTHETIC_FIXTURE_CONTRACT_ONLY,
  TASK_CENTER_ADAPTER_DRY_RUN_SYNTHETIC_FIXTURE_CONTRACT_READONLY,
  TASK_CENTER_ADAPTER_DRY_RUN_SYNTHETIC_FIXTURE_RUNNER_PLAN_DRAFT_ONLY,
  TASK_CENTER_ADAPTER_DRY_RUN_SYNTHETIC_FIXTURE_RUNNER_PLAN_NO_AI_OR_AUTOMATION,
  TASK_CENTER_ADAPTER_DRY_RUN_SYNTHETIC_FIXTURE_RUNNER_PLAN_NO_APPROVAL,
  TASK_CENTER_ADAPTER_DRY_RUN_SYNTHETIC_FIXTURE_RUNNER_PLAN_NO_DATABASE_CLIENT,
  TASK_CENTER_ADAPTER_DRY_RUN_SYNTHETIC_FIXTURE_RUNNER_PLAN_NO_DATABASE_READ,
  TASK_CENTER_ADAPTER_DRY_RUN_SYNTHETIC_FIXTURE_RUNNER_PLAN_NO_ENV_ENABLEMENT,
  TASK_CENTER_ADAPTER_DRY_RUN_SYNTHETIC_FIXTURE_RUNNER_PLAN_NO_REAL_DATA,
  TASK_CENTER_ADAPTER_DRY_RUN_SYNTHETIC_FIXTURE_RUNNER_PLAN_NO_TASK_MUTATION,
  TASK_CENTER_ADAPTER_DRY_RUN_SYNTHETIC_FIXTURE_RUNNER_PLAN_ONLY,
  TASK_CENTER_ADAPTER_DRY_RUN_SYNTHETIC_FIXTURE_RUNNER_PLAN_READONLY,
  TASK_CENTER_ADAPTER_DRY_RUN_RUNNER_STATIC_CHECK_DESIGN_DRAFT_ONLY,
  TASK_CENTER_ADAPTER_DRY_RUN_RUNNER_STATIC_CHECK_DESIGN_NO_AI_OR_AUTOMATION,
  TASK_CENTER_ADAPTER_DRY_RUN_RUNNER_STATIC_CHECK_DESIGN_NO_APPROVAL,
  TASK_CENTER_ADAPTER_DRY_RUN_RUNNER_STATIC_CHECK_DESIGN_NO_DATABASE_CLIENT,
  TASK_CENTER_ADAPTER_DRY_RUN_RUNNER_STATIC_CHECK_DESIGN_NO_DATABASE_READ,
  TASK_CENTER_ADAPTER_DRY_RUN_RUNNER_STATIC_CHECK_DESIGN_NO_ENV_ENABLEMENT,
  TASK_CENTER_ADAPTER_DRY_RUN_RUNNER_STATIC_CHECK_DESIGN_NO_REAL_DATA,
  TASK_CENTER_ADAPTER_DRY_RUN_RUNNER_STATIC_CHECK_DESIGN_NO_TASK_MUTATION,
  TASK_CENTER_ADAPTER_DRY_RUN_RUNNER_STATIC_CHECK_DESIGN_ONLY,
  TASK_CENTER_ADAPTER_DRY_RUN_RUNNER_STATIC_CHECK_DESIGN_READONLY,
  TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_CANDIDATE_READINESS_DRAFT_ONLY,
  TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_CANDIDATE_READINESS_NO_AI_OR_AUTOMATION,
  TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_CANDIDATE_READINESS_NO_APPROVAL,
  TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_CANDIDATE_READINESS_NO_DATABASE_CLIENT,
  TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_CANDIDATE_READINESS_NO_DATABASE_READ,
  TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_CANDIDATE_READINESS_NO_ENV_ENABLEMENT,
  TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_CANDIDATE_READINESS_NO_REAL_DATA,
  TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_CANDIDATE_READINESS_NO_TASK_MUTATION,
  TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_CANDIDATE_READINESS_ONLY,
  TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_CANDIDATE_READINESS_READONLY,
  TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_SCRIPT_DRAFT_DRAFT_ONLY,
  TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_SCRIPT_DRAFT_NO_AI_OR_AUTOMATION,
  TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_SCRIPT_DRAFT_NO_APPROVAL,
  TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_SCRIPT_DRAFT_NO_DATABASE_CLIENT,
  TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_SCRIPT_DRAFT_NO_DATABASE_READ,
  TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_SCRIPT_DRAFT_NO_ENV_ENABLEMENT,
  TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_SCRIPT_DRAFT_NO_REAL_DATA,
  TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_SCRIPT_DRAFT_NO_TASK_MUTATION,
  TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_SCRIPT_DRAFT_ONLY,
  TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_SCRIPT_DRAFT_READONLY,
  TASK_CENTER_ADAPTER_DRY_RUN_RUNNER_OUTPUT_LEDGER_DRAFT_ONLY,
  TASK_CENTER_ADAPTER_DRY_RUN_RUNNER_OUTPUT_LEDGER_NO_AI_OR_AUTOMATION,
  TASK_CENTER_ADAPTER_DRY_RUN_RUNNER_OUTPUT_LEDGER_NO_APPROVAL,
  TASK_CENTER_ADAPTER_DRY_RUN_RUNNER_OUTPUT_LEDGER_NO_DATABASE_CLIENT,
  TASK_CENTER_ADAPTER_DRY_RUN_RUNNER_OUTPUT_LEDGER_NO_DATABASE_READ,
  TASK_CENTER_ADAPTER_DRY_RUN_RUNNER_OUTPUT_LEDGER_NO_ENV_ENABLEMENT,
  TASK_CENTER_ADAPTER_DRY_RUN_RUNNER_OUTPUT_LEDGER_NO_REAL_DATA,
  TASK_CENTER_ADAPTER_DRY_RUN_RUNNER_OUTPUT_LEDGER_NO_TASK_MUTATION,
  TASK_CENTER_ADAPTER_DRY_RUN_RUNNER_OUTPUT_LEDGER_ONLY,
  TASK_CENTER_ADAPTER_DRY_RUN_RUNNER_OUTPUT_LEDGER_READONLY,
  TASK_CENTER_ADAPTER_DRY_RUN_OUTPUT_LEDGER_STATIC_SNAPSHOT_DRAFT_ONLY,
  TASK_CENTER_ADAPTER_DRY_RUN_OUTPUT_LEDGER_STATIC_SNAPSHOT_NO_AI_OR_AUTOMATION,
  TASK_CENTER_ADAPTER_DRY_RUN_OUTPUT_LEDGER_STATIC_SNAPSHOT_NO_APPROVAL,
  TASK_CENTER_ADAPTER_DRY_RUN_OUTPUT_LEDGER_STATIC_SNAPSHOT_NO_DATABASE_CLIENT,
  TASK_CENTER_ADAPTER_DRY_RUN_OUTPUT_LEDGER_STATIC_SNAPSHOT_NO_DATABASE_READ,
  TASK_CENTER_ADAPTER_DRY_RUN_OUTPUT_LEDGER_STATIC_SNAPSHOT_NO_ENV_ENABLEMENT,
  TASK_CENTER_ADAPTER_DRY_RUN_OUTPUT_LEDGER_STATIC_SNAPSHOT_NO_FILE_WRITE,
  TASK_CENTER_ADAPTER_DRY_RUN_OUTPUT_LEDGER_STATIC_SNAPSHOT_NO_REAL_DATA,
  TASK_CENTER_ADAPTER_DRY_RUN_OUTPUT_LEDGER_STATIC_SNAPSHOT_NO_TASK_MUTATION,
  TASK_CENTER_ADAPTER_DRY_RUN_OUTPUT_LEDGER_STATIC_SNAPSHOT_ONLY,
  TASK_CENTER_ADAPTER_DRY_RUN_OUTPUT_LEDGER_STATIC_SNAPSHOT_READONLY,
  TASK_CENTER_ADAPTER_DRY_RUN_REVIEW_DECISION_PACKET_DRAFT_ONLY,
  TASK_CENTER_ADAPTER_DRY_RUN_REVIEW_DECISION_PACKET_NO_AI_OR_AUTOMATION,
  TASK_CENTER_ADAPTER_DRY_RUN_REVIEW_DECISION_PACKET_NO_APPROVAL,
  TASK_CENTER_ADAPTER_DRY_RUN_REVIEW_DECISION_PACKET_NO_DATABASE_CLIENT,
  TASK_CENTER_ADAPTER_DRY_RUN_REVIEW_DECISION_PACKET_NO_DATABASE_READ,
  TASK_CENTER_ADAPTER_DRY_RUN_REVIEW_DECISION_PACKET_NO_ENV_ENABLEMENT,
  TASK_CENTER_ADAPTER_DRY_RUN_REVIEW_DECISION_PACKET_NO_FILE_WRITE,
  TASK_CENTER_ADAPTER_DRY_RUN_REVIEW_DECISION_PACKET_NO_REAL_DATA,
  TASK_CENTER_ADAPTER_DRY_RUN_REVIEW_DECISION_PACKET_NO_TASK_MUTATION,
  TASK_CENTER_ADAPTER_DRY_RUN_REVIEW_DECISION_PACKET_ONLY,
  TASK_CENTER_ADAPTER_DRY_RUN_REVIEW_DECISION_PACKET_READONLY,
  TASK_CENTER_ADAPTER_DRY_RUN_DB_READ_GO_NO_GO_PRECHECK_DRAFT_ONLY,
  TASK_CENTER_ADAPTER_DRY_RUN_DB_READ_GO_NO_GO_PRECHECK_NO_AI_OR_AUTOMATION,
  TASK_CENTER_ADAPTER_DRY_RUN_DB_READ_GO_NO_GO_PRECHECK_NO_APPROVAL,
  TASK_CENTER_ADAPTER_DRY_RUN_DB_READ_GO_NO_GO_PRECHECK_NO_DATABASE_CLIENT,
  TASK_CENTER_ADAPTER_DRY_RUN_DB_READ_GO_NO_GO_PRECHECK_NO_DATABASE_READ,
  TASK_CENTER_ADAPTER_DRY_RUN_DB_READ_GO_NO_GO_PRECHECK_NO_ENV_ENABLEMENT,
  TASK_CENTER_ADAPTER_DRY_RUN_DB_READ_GO_NO_GO_PRECHECK_NO_FILE_WRITE,
  TASK_CENTER_ADAPTER_DRY_RUN_DB_READ_GO_NO_GO_PRECHECK_NO_REAL_DATA,
  TASK_CENTER_ADAPTER_DRY_RUN_DB_READ_GO_NO_GO_PRECHECK_NO_TASK_MUTATION,
  TASK_CENTER_ADAPTER_DRY_RUN_DB_READ_GO_NO_GO_PRECHECK_ONLY,
  TASK_CENTER_ADAPTER_DRY_RUN_DB_READ_GO_NO_GO_PRECHECK_READONLY,
  TASK_CENTER_OWNER_GATE_EVIDENCE_MATRIX_DRAFT_ONLY,
  TASK_CENTER_OWNER_GATE_EVIDENCE_MATRIX_NO_AI_OR_AUTOMATION,
  TASK_CENTER_OWNER_GATE_EVIDENCE_MATRIX_NO_APPROVAL,
  TASK_CENTER_OWNER_GATE_EVIDENCE_MATRIX_NO_DATABASE_CLIENT,
  TASK_CENTER_OWNER_GATE_EVIDENCE_MATRIX_NO_DATABASE_READ,
  TASK_CENTER_OWNER_GATE_EVIDENCE_MATRIX_NO_REAL_DATA,
  TASK_CENTER_OWNER_GATE_EVIDENCE_MATRIX_NO_TASK_MUTATION,
  TASK_CENTER_OWNER_GATE_EVIDENCE_MATRIX_ONLY,
  TASK_CENTER_OWNER_GATE_EVIDENCE_MATRIX_READONLY,
  TASK_CENTER_DB_READ_ADAPTER_IMPLEMENTATION_PLAN_DRAFT_ONLY,
  TASK_CENTER_DB_READ_ADAPTER_IMPLEMENTATION_PLAN_NO_AI_OR_AUTOMATION,
  TASK_CENTER_DB_READ_ADAPTER_IMPLEMENTATION_PLAN_NO_DATABASE_CLIENT,
  TASK_CENTER_DB_READ_ADAPTER_IMPLEMENTATION_PLAN_NO_DATABASE_READ,
  TASK_CENTER_DB_READ_ADAPTER_IMPLEMENTATION_PLAN_NO_TASK_MUTATION,
  TASK_CENTER_DB_READ_ADAPTER_IMPLEMENTATION_PLAN_ONLY,
  TASK_CENTER_DB_READ_ADAPTER_IMPLEMENTATION_PLAN_READONLY,
  TASK_CENTER_OWNER_SIGNOFF_ROUTING_MAP_DRAFT_ONLY,
  TASK_CENTER_OWNER_SIGNOFF_ROUTING_MAP_NO_AI_OR_AUTOMATION,
  TASK_CENTER_OWNER_SIGNOFF_ROUTING_MAP_NO_APPROVAL,
  TASK_CENTER_OWNER_SIGNOFF_ROUTING_MAP_NO_DATABASE_READ,
  TASK_CENTER_OWNER_SIGNOFF_ROUTING_MAP_NO_TASK_MUTATION,
  TASK_CENTER_OWNER_SIGNOFF_ROUTING_MAP_ONLY,
  TASK_CENTER_OWNER_SIGNOFF_ROUTING_MAP_READONLY,
  TASK_CENTER_PILOT_REVIEW_PACKET_DRAFT_ONLY,
  TASK_CENTER_PILOT_REVIEW_PACKET_NO_APPROVAL,
  TASK_CENTER_PILOT_REVIEW_PACKET_NO_RAW_PII,
  TASK_CENTER_PILOT_REVIEW_PACKET_NO_STORAGE_WRITE,
  TASK_CENTER_PILOT_REVIEW_PACKET_NO_UPLOAD,
  TASK_CENTER_PILOT_REVIEW_PACKET_ONLY,
  TASK_CENTER_PILOT_REVIEW_PACKET_READONLY,
  TASK_CENTER_READONLY_ADAPTER_DECISION_LEDGER_DRAFT_ONLY,
  TASK_CENTER_READONLY_ADAPTER_DECISION_LEDGER_NO_AI_OR_AUTOMATION,
  TASK_CENTER_READONLY_ADAPTER_DECISION_LEDGER_NO_APPROVAL,
  TASK_CENTER_READONLY_ADAPTER_DECISION_LEDGER_NO_DATABASE_READ,
  TASK_CENTER_READONLY_ADAPTER_DECISION_LEDGER_NO_TASK_MUTATION,
  TASK_CENTER_READONLY_ADAPTER_DECISION_LEDGER_ONLY,
  TASK_CENTER_READONLY_ADAPTER_DECISION_LEDGER_READONLY,
  TASK_CENTER_REAL_USER_UAT_COPY_NO_APPROVAL,
  TASK_CENTER_REAL_USER_UAT_COPY_NO_DATA_ENTRY,
  TASK_CENTER_REAL_USER_UAT_COPY_ONLY,
  TASK_CENTER_REAL_USER_UAT_COPY_READONLY,
  TASK_CENTER_UAT_EVIDENCE_CHECKLIST_NO_RAW_PII,
  TASK_CENTER_UAT_EVIDENCE_CHECKLIST_NO_STORAGE_WRITE,
  TASK_CENTER_UAT_EVIDENCE_CHECKLIST_NO_UPLOAD,
  TASK_CENTER_UAT_EVIDENCE_CHECKLIST_ONLY,
  TASK_CENTER_UAT_EVIDENCE_CHECKLIST_READONLY,
} from "@/lib/task-center-gate-evidence-panel-source";
import {
  getTaskCenterFallbackLane,
  getVisibleTaskCenterLanes,
  resolveTaskCenterLaneStatus,
  type TaskCenterLaneStatus,
  type TaskCenterVisibleLane,
} from "@/lib/task-center-contract";
import { withAdmissionSegmentParam } from "@/lib/workspace";

type DepartmentTaskInboxProps = {
  roleCode: string | null;
  scopeDecision: HEUWorkspaceScopeDecision;
  activeSegmentId: string | null;
  visibleSegmentCount: number;
  actionGate: HEUWorkspaceActionGate;
};

const laneIcons: Record<TaskCenterVisibleLane["id"], LucideIcon> = {
  admission: Users,
  cthssv: ClipboardCheck,
  training: GraduationCap,
  finance: WalletCards,
  hou: Handshake,
  control: ShieldCheck,
  general: ShieldCheck,
};

const laneStatusClasses: Record<TaskCenterLaneStatus, string> = {
  NO_GO_SCOPE: "border-amber-200 bg-amber-50 text-amber-800",
  DRAFT_READY: "border-emerald-200 bg-emerald-50 text-emerald-700",
  READ_ONLY: "border-zinc-200 bg-zinc-50 text-zinc-700",
};

const runnerOutputLedgerCodes = [
  "RUNNER_OUTPUT_LEDGER_BOUNDARY_CAPTURE",
  "RUNNER_OUTPUT_LEDGER_CASE_COUNT",
  "RUNNER_OUTPUT_LEDGER_RESTRICTED_DATA_ABSENT",
  "RUNNER_OUTPUT_LEDGER_DEPARTMENT_MISMATCH_BLOCKED",
  "RUNNER_OUTPUT_LEDGER_PRODUCTION_NO_GO",
] as const;

const outputLedgerStaticSnapshotCodes = [
  "OUTPUT_LEDGER_STATIC_SNAPSHOT_BOUNDARY_MODE",
  "OUTPUT_LEDGER_STATIC_SNAPSHOT_CASE_COUNT",
  "OUTPUT_LEDGER_STATIC_SNAPSHOT_RESTRICTED_DATA_ABSENT",
  "OUTPUT_LEDGER_STATIC_SNAPSHOT_DEPARTMENT_MISMATCH_BLOCKED",
  "OUTPUT_LEDGER_STATIC_SNAPSHOT_PRODUCTION_NO_GO",
] as const;

const reviewDecisionPacketCodes = [
  "REVIEW_DECISION_PACKET_IT_DATA_SCOPE_FIRST",
  "REVIEW_DECISION_PACKET_AUDIT_NEGATIVE_ACCESS",
  "REVIEW_DECISION_PACKET_PHAP_CHE_RESTRICTED_DATA",
  "REVIEW_DECISION_PACKET_DEPARTMENT_OWNER_TASK_BOUNDARY",
  "REVIEW_DECISION_PACKET_BGH_PRODUCTION_NO_GO",
] as const;

const dbReadGoNoGoPrecheckCodes = [
  "DB_READ_GO_NO_GO_PRECHECK_IT_DATA_SCOPE_FIRST",
  "DB_READ_GO_NO_GO_PRECHECK_AUDIT_NEGATIVE_ACCESS",
  "DB_READ_GO_NO_GO_PRECHECK_PHAP_CHE_RESTRICTED_DATA",
  "DB_READ_GO_NO_GO_PRECHECK_DEPARTMENT_OWNER_TASK_BOUNDARY",
  "DB_READ_GO_NO_GO_PRECHECK_BGH_PRODUCTION_NO_GO",
] as const;

export function DepartmentTaskInbox({
  roleCode,
  scopeDecision,
  activeSegmentId,
  visibleSegmentCount,
  actionGate,
}: DepartmentTaskInboxProps) {
  const visibleLanes = getVisibleTaskCenterLanes(roleCode, actionGate);
  const inboxLanes =
    visibleLanes.length > 0 ? visibleLanes : [getTaskCenterFallbackLane(roleCode)];
  const taskFallback = createTaskCenterUiFallbackSource(inboxLanes, actionGate);
  const gateEvidence = createTaskCenterGateEvidencePanelSource();
  const mockTasks = taskFallback.displayTasks;

  return (
    <section
      className="rounded-lg border border-zinc-200 bg-white"
      data-heu-department-task-inbox="HEU_DEPARTMENT_TASK_INBOX_MVP"
      data-heu-task-center-read-model-interface="HEU_TASK_CENTER_READ_MODEL_INTERFACE"
      data-heu-department-task-inbox-scope="ROLE_WORKSPACE_SCOPE_FILTERED"
      data-heu-department-task-inbox-boundary="REF_ONLY_NO_RAW_PII_NO_MUTATION"
      data-heu-department-task-inbox-cost-guard="NO_AI_CALL_NO_AUTOMATION_STEP"
    >
      <div className="border-b border-zinc-200 p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs font-medium uppercase text-zinc-500">
              HEU-Data-003 · Department Task Inbox MVP
            </p>
            <h2 className="mt-1 text-base font-semibold text-zinc-950">
              Viec cua toi theo phong ban
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-600">
              Inbox nay chi hien lane cong viec dua tren role, workspace va
              action gate. No khong query bang task that, khong luu raw PII,
              khong goi AI va khong tao automation step.
            </p>
          </div>
          <div className="rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-600">
            <div>Role: {roleCode ?? "NO_ROLE"}</div>
            <div>Scope: {scopeDecision}</div>
            <div>Visible segments: {visibleSegmentCount}</div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 p-5 lg:grid-cols-2">
        {inboxLanes.map((lane) => {
          const Icon = laneIcons[lane.id];
          const status = resolveTaskCenterLaneStatus(
            lane,
            scopeDecision,
            actionGate,
          );
          const href = withAdmissionSegmentParam(lane.href, activeSegmentId);

          return (
            <article
              key={lane.id}
              className="rounded-lg border border-zinc-200 bg-zinc-50 p-4"
              data-heu-task-inbox-lane={lane.id}
              data-heu-task-inbox-status={status.label}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                  <div className="rounded-md border border-zinc-200 bg-white p-2">
                    <Icon className="size-4 text-zinc-600" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-zinc-950">{lane.title}</h3>
                    <p className="mt-1 text-xs text-zinc-500">{lane.owner}</p>
                  </div>
                </div>
                <span
                  className={`shrink-0 rounded-full border px-2 py-1 text-xs font-medium ${
                    laneStatusClasses[status.label]
                  }`}
                >
                  {status.label}
                </span>
              </div>

              <dl className="mt-4 space-y-2 text-sm">
                <div>
                  <dt className="text-xs font-medium uppercase text-zinc-500">
                    Ref metadata
                  </dt>
                  <dd className="mt-1 text-zinc-700">{lane.refs}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase text-zinc-500">
                    Next safe action
                  </dt>
                  <dd className="mt-1 text-zinc-700">{status.detail}</dd>
                </div>
              </dl>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Button asChild size="sm" variant="outline">
                  <Link href={href}>Mo module</Link>
                </Button>
                <span className="inline-flex items-center gap-1 text-xs text-zinc-500">
                  <ClipboardCheck className="size-3.5" />
                  Ref-only
                </span>
              </div>
            </article>
          );
        })}
      </div>

      <div
        className="border-t border-zinc-200 p-5"
        data-heu-task-center-gate-evidence-panel={TASK_CENTER_GATE_EVIDENCE_PANEL_ONLY}
        data-heu-task-center-gate-evidence-readonly={TASK_CENTER_GATE_EVIDENCE_PANEL_READONLY}
        data-heu-task-center-gate-evidence-database={TASK_CENTER_GATE_EVIDENCE_PANEL_DATABASE_NO_GO}
        data-heu-task-center-gate-evidence-no-database-client={TASK_CENTER_GATE_EVIDENCE_PANEL_NO_DATABASE_CLIENT}
        data-heu-task-center-gate-evidence-no-database-read={TASK_CENTER_GATE_EVIDENCE_PANEL_NO_DATABASE_READ}
        data-heu-task-center-gate-evidence-no-sql-migration={TASK_CENTER_GATE_EVIDENCE_PANEL_NO_SQL_MIGRATION}
        data-heu-task-center-gate-evidence-no-task-mutation={TASK_CENTER_GATE_EVIDENCE_PANEL_NO_TASK_MUTATION}
        data-heu-task-center-gate-evidence-cost-guard={TASK_CENTER_GATE_EVIDENCE_PANEL_NO_AI_OR_AUTOMATION}
        data-heu-task-center-real-user-uat-copy={TASK_CENTER_REAL_USER_UAT_COPY_ONLY}
        data-heu-task-center-real-user-uat-copy-readonly={TASK_CENTER_REAL_USER_UAT_COPY_READONLY}
        data-heu-task-center-real-user-uat-copy-no-approval={TASK_CENTER_REAL_USER_UAT_COPY_NO_APPROVAL}
        data-heu-task-center-real-user-uat-copy-no-data-entry={TASK_CENTER_REAL_USER_UAT_COPY_NO_DATA_ENTRY}
        data-heu-task-center-uat-evidence-checklist={TASK_CENTER_UAT_EVIDENCE_CHECKLIST_ONLY}
        data-heu-task-center-uat-evidence-checklist-readonly={TASK_CENTER_UAT_EVIDENCE_CHECKLIST_READONLY}
        data-heu-task-center-uat-evidence-checklist-no-upload={TASK_CENTER_UAT_EVIDENCE_CHECKLIST_NO_UPLOAD}
        data-heu-task-center-uat-evidence-checklist-no-storage-write={TASK_CENTER_UAT_EVIDENCE_CHECKLIST_NO_STORAGE_WRITE}
        data-heu-task-center-uat-evidence-checklist-no-raw-pii={TASK_CENTER_UAT_EVIDENCE_CHECKLIST_NO_RAW_PII}
        data-heu-task-center-pilot-review-packet={TASK_CENTER_PILOT_REVIEW_PACKET_ONLY}
        data-heu-task-center-pilot-review-packet-readonly={TASK_CENTER_PILOT_REVIEW_PACKET_READONLY}
        data-heu-task-center-pilot-review-packet-draft-only={TASK_CENTER_PILOT_REVIEW_PACKET_DRAFT_ONLY}
        data-heu-task-center-pilot-review-packet-no-approval={TASK_CENTER_PILOT_REVIEW_PACKET_NO_APPROVAL}
        data-heu-task-center-pilot-review-packet-no-upload={TASK_CENTER_PILOT_REVIEW_PACKET_NO_UPLOAD}
        data-heu-task-center-pilot-review-packet-no-storage-write={TASK_CENTER_PILOT_REVIEW_PACKET_NO_STORAGE_WRITE}
        data-heu-task-center-pilot-review-packet-no-raw-pii={TASK_CENTER_PILOT_REVIEW_PACKET_NO_RAW_PII}
        data-heu-task-center-owner-signoff-routing-map={TASK_CENTER_OWNER_SIGNOFF_ROUTING_MAP_ONLY}
        data-heu-task-center-owner-signoff-routing-map-readonly={TASK_CENTER_OWNER_SIGNOFF_ROUTING_MAP_READONLY}
        data-heu-task-center-owner-signoff-routing-map-draft-only={TASK_CENTER_OWNER_SIGNOFF_ROUTING_MAP_DRAFT_ONLY}
        data-heu-task-center-owner-signoff-routing-map-no-approval={TASK_CENTER_OWNER_SIGNOFF_ROUTING_MAP_NO_APPROVAL}
        data-heu-task-center-owner-signoff-routing-map-no-database-read={TASK_CENTER_OWNER_SIGNOFF_ROUTING_MAP_NO_DATABASE_READ}
        data-heu-task-center-owner-signoff-routing-map-no-task-mutation={TASK_CENTER_OWNER_SIGNOFF_ROUTING_MAP_NO_TASK_MUTATION}
        data-heu-task-center-owner-signoff-routing-map-no-ai-or-automation={TASK_CENTER_OWNER_SIGNOFF_ROUTING_MAP_NO_AI_OR_AUTOMATION}
        data-heu-task-center-readonly-adapter-decision-ledger={TASK_CENTER_READONLY_ADAPTER_DECISION_LEDGER_ONLY}
        data-heu-task-center-readonly-adapter-decision-ledger-readonly={TASK_CENTER_READONLY_ADAPTER_DECISION_LEDGER_READONLY}
        data-heu-task-center-readonly-adapter-decision-ledger-draft-only={TASK_CENTER_READONLY_ADAPTER_DECISION_LEDGER_DRAFT_ONLY}
        data-heu-task-center-readonly-adapter-decision-ledger-no-approval={TASK_CENTER_READONLY_ADAPTER_DECISION_LEDGER_NO_APPROVAL}
        data-heu-task-center-readonly-adapter-decision-ledger-no-database-read={TASK_CENTER_READONLY_ADAPTER_DECISION_LEDGER_NO_DATABASE_READ}
        data-heu-task-center-readonly-adapter-decision-ledger-no-task-mutation={TASK_CENTER_READONLY_ADAPTER_DECISION_LEDGER_NO_TASK_MUTATION}
        data-heu-task-center-readonly-adapter-decision-ledger-no-ai-or-automation={TASK_CENTER_READONLY_ADAPTER_DECISION_LEDGER_NO_AI_OR_AUTOMATION}
        data-heu-task-center-db-read-adapter-implementation-plan={TASK_CENTER_DB_READ_ADAPTER_IMPLEMENTATION_PLAN_ONLY}
        data-heu-task-center-db-read-adapter-implementation-plan-readonly={TASK_CENTER_DB_READ_ADAPTER_IMPLEMENTATION_PLAN_READONLY}
        data-heu-task-center-db-read-adapter-implementation-plan-draft-only={TASK_CENTER_DB_READ_ADAPTER_IMPLEMENTATION_PLAN_DRAFT_ONLY}
        data-heu-task-center-db-read-adapter-implementation-plan-no-database-read={TASK_CENTER_DB_READ_ADAPTER_IMPLEMENTATION_PLAN_NO_DATABASE_READ}
        data-heu-task-center-db-read-adapter-implementation-plan-no-database-client={TASK_CENTER_DB_READ_ADAPTER_IMPLEMENTATION_PLAN_NO_DATABASE_CLIENT}
        data-heu-task-center-db-read-adapter-implementation-plan-no-task-mutation={TASK_CENTER_DB_READ_ADAPTER_IMPLEMENTATION_PLAN_NO_TASK_MUTATION}
        data-heu-task-center-db-read-adapter-implementation-plan-no-ai-or-automation={TASK_CENTER_DB_READ_ADAPTER_IMPLEMENTATION_PLAN_NO_AI_OR_AUTOMATION}
        data-heu-task-center-adapter-test-fixture-contract={TASK_CENTER_ADAPTER_TEST_FIXTURE_CONTRACT_ONLY}
        data-heu-task-center-adapter-test-fixture-contract-readonly={TASK_CENTER_ADAPTER_TEST_FIXTURE_CONTRACT_READONLY}
        data-heu-task-center-adapter-test-fixture-contract-draft-only={TASK_CENTER_ADAPTER_TEST_FIXTURE_CONTRACT_DRAFT_ONLY}
        data-heu-task-center-adapter-test-fixture-contract-no-database-read={TASK_CENTER_ADAPTER_TEST_FIXTURE_CONTRACT_NO_DATABASE_READ}
        data-heu-task-center-adapter-test-fixture-contract-no-database-client={TASK_CENTER_ADAPTER_TEST_FIXTURE_CONTRACT_NO_DATABASE_CLIENT}
        data-heu-task-center-adapter-test-fixture-contract-no-task-mutation={TASK_CENTER_ADAPTER_TEST_FIXTURE_CONTRACT_NO_TASK_MUTATION}
        data-heu-task-center-adapter-test-fixture-contract-no-real-data={TASK_CENTER_ADAPTER_TEST_FIXTURE_CONTRACT_NO_REAL_DATA}
        data-heu-task-center-adapter-test-fixture-contract-no-ai-or-automation={TASK_CENTER_ADAPTER_TEST_FIXTURE_CONTRACT_NO_AI_OR_AUTOMATION}
        data-heu-task-center-disabled-runtime-seam-verification={TASK_CENTER_DISABLED_RUNTIME_SEAM_VERIFICATION_ONLY}
        data-heu-task-center-disabled-runtime-seam-verification-readonly={TASK_CENTER_DISABLED_RUNTIME_SEAM_VERIFICATION_READONLY}
        data-heu-task-center-disabled-runtime-seam-verification-draft-only={TASK_CENTER_DISABLED_RUNTIME_SEAM_VERIFICATION_DRAFT_ONLY}
        data-heu-task-center-disabled-runtime-seam-verification-no-database-read={TASK_CENTER_DISABLED_RUNTIME_SEAM_VERIFICATION_NO_DATABASE_READ}
        data-heu-task-center-disabled-runtime-seam-verification-no-database-client={TASK_CENTER_DISABLED_RUNTIME_SEAM_VERIFICATION_NO_DATABASE_CLIENT}
        data-heu-task-center-disabled-runtime-seam-verification-no-task-mutation={TASK_CENTER_DISABLED_RUNTIME_SEAM_VERIFICATION_NO_TASK_MUTATION}
        data-heu-task-center-disabled-runtime-seam-verification-no-real-data={TASK_CENTER_DISABLED_RUNTIME_SEAM_VERIFICATION_NO_REAL_DATA}
        data-heu-task-center-disabled-runtime-seam-verification-no-env-enablement={TASK_CENTER_DISABLED_RUNTIME_SEAM_VERIFICATION_NO_ENV_ENABLEMENT}
        data-heu-task-center-disabled-runtime-seam-verification-no-ai-or-automation={TASK_CENTER_DISABLED_RUNTIME_SEAM_VERIFICATION_NO_AI_OR_AUTOMATION}
        data-heu-task-center-owner-gate-evidence-matrix={TASK_CENTER_OWNER_GATE_EVIDENCE_MATRIX_ONLY}
        data-heu-task-center-owner-gate-evidence-matrix-readonly={TASK_CENTER_OWNER_GATE_EVIDENCE_MATRIX_READONLY}
        data-heu-task-center-owner-gate-evidence-matrix-draft-only={TASK_CENTER_OWNER_GATE_EVIDENCE_MATRIX_DRAFT_ONLY}
        data-heu-task-center-owner-gate-evidence-matrix-no-approval={TASK_CENTER_OWNER_GATE_EVIDENCE_MATRIX_NO_APPROVAL}
        data-heu-task-center-owner-gate-evidence-matrix-no-database-read={TASK_CENTER_OWNER_GATE_EVIDENCE_MATRIX_NO_DATABASE_READ}
        data-heu-task-center-owner-gate-evidence-matrix-no-database-client={TASK_CENTER_OWNER_GATE_EVIDENCE_MATRIX_NO_DATABASE_CLIENT}
        data-heu-task-center-owner-gate-evidence-matrix-no-task-mutation={TASK_CENTER_OWNER_GATE_EVIDENCE_MATRIX_NO_TASK_MUTATION}
        data-heu-task-center-owner-gate-evidence-matrix-no-real-data={TASK_CENTER_OWNER_GATE_EVIDENCE_MATRIX_NO_REAL_DATA}
        data-heu-task-center-owner-gate-evidence-matrix-no-ai-or-automation={TASK_CENTER_OWNER_GATE_EVIDENCE_MATRIX_NO_AI_OR_AUTOMATION}
        data-heu-task-center-adapter-preflight-checklist={TASK_CENTER_ADAPTER_PREFLIGHT_CHECKLIST_ONLY}
        data-heu-task-center-adapter-preflight-checklist-readonly={TASK_CENTER_ADAPTER_PREFLIGHT_CHECKLIST_READONLY}
        data-heu-task-center-adapter-preflight-checklist-draft-only={TASK_CENTER_ADAPTER_PREFLIGHT_CHECKLIST_DRAFT_ONLY}
        data-heu-task-center-adapter-preflight-checklist-no-approval={TASK_CENTER_ADAPTER_PREFLIGHT_CHECKLIST_NO_APPROVAL}
        data-heu-task-center-adapter-preflight-checklist-no-database-read={TASK_CENTER_ADAPTER_PREFLIGHT_CHECKLIST_NO_DATABASE_READ}
        data-heu-task-center-adapter-preflight-checklist-no-database-client={TASK_CENTER_ADAPTER_PREFLIGHT_CHECKLIST_NO_DATABASE_CLIENT}
        data-heu-task-center-adapter-preflight-checklist-no-task-mutation={TASK_CENTER_ADAPTER_PREFLIGHT_CHECKLIST_NO_TASK_MUTATION}
        data-heu-task-center-adapter-preflight-checklist-no-real-data={TASK_CENTER_ADAPTER_PREFLIGHT_CHECKLIST_NO_REAL_DATA}
        data-heu-task-center-adapter-preflight-checklist-no-env-enablement={TASK_CENTER_ADAPTER_PREFLIGHT_CHECKLIST_NO_ENV_ENABLEMENT}
        data-heu-task-center-adapter-preflight-checklist-no-ai-or-automation={TASK_CENTER_ADAPTER_PREFLIGHT_CHECKLIST_NO_AI_OR_AUTOMATION}
        data-heu-task-center-readonly-adapter-dry-run-switch-contract={TASK_CENTER_READONLY_ADAPTER_DRY_RUN_SWITCH_CONTRACT_ONLY}
        data-heu-task-center-readonly-adapter-dry-run-switch-contract-readonly={TASK_CENTER_READONLY_ADAPTER_DRY_RUN_SWITCH_CONTRACT_READONLY}
        data-heu-task-center-readonly-adapter-dry-run-switch-contract-draft-only={TASK_CENTER_READONLY_ADAPTER_DRY_RUN_SWITCH_CONTRACT_DRAFT_ONLY}
        data-heu-task-center-readonly-adapter-dry-run-switch-contract-no-approval={TASK_CENTER_READONLY_ADAPTER_DRY_RUN_SWITCH_CONTRACT_NO_APPROVAL}
        data-heu-task-center-readonly-adapter-dry-run-switch-contract-no-database-read={TASK_CENTER_READONLY_ADAPTER_DRY_RUN_SWITCH_CONTRACT_NO_DATABASE_READ}
        data-heu-task-center-readonly-adapter-dry-run-switch-contract-no-database-client={TASK_CENTER_READONLY_ADAPTER_DRY_RUN_SWITCH_CONTRACT_NO_DATABASE_CLIENT}
        data-heu-task-center-readonly-adapter-dry-run-switch-contract-no-task-mutation={TASK_CENTER_READONLY_ADAPTER_DRY_RUN_SWITCH_CONTRACT_NO_TASK_MUTATION}
        data-heu-task-center-readonly-adapter-dry-run-switch-contract-no-real-data={TASK_CENTER_READONLY_ADAPTER_DRY_RUN_SWITCH_CONTRACT_NO_REAL_DATA}
        data-heu-task-center-readonly-adapter-dry-run-switch-contract-no-env-enablement={TASK_CENTER_READONLY_ADAPTER_DRY_RUN_SWITCH_CONTRACT_NO_ENV_ENABLEMENT}
        data-heu-task-center-readonly-adapter-dry-run-switch-contract-no-ai-or-automation={TASK_CENTER_READONLY_ADAPTER_DRY_RUN_SWITCH_CONTRACT_NO_AI_OR_AUTOMATION}
        data-heu-task-center-dry-run-env-gate-ledger={TASK_CENTER_DRY_RUN_ENV_GATE_LEDGER_ONLY}
        data-heu-task-center-dry-run-env-gate-ledger-readonly={TASK_CENTER_DRY_RUN_ENV_GATE_LEDGER_READONLY}
        data-heu-task-center-dry-run-env-gate-ledger-draft-only={TASK_CENTER_DRY_RUN_ENV_GATE_LEDGER_DRAFT_ONLY}
        data-heu-task-center-dry-run-env-gate-ledger-no-approval={TASK_CENTER_DRY_RUN_ENV_GATE_LEDGER_NO_APPROVAL}
        data-heu-task-center-dry-run-env-gate-ledger-no-database-read={TASK_CENTER_DRY_RUN_ENV_GATE_LEDGER_NO_DATABASE_READ}
        data-heu-task-center-dry-run-env-gate-ledger-no-database-client={TASK_CENTER_DRY_RUN_ENV_GATE_LEDGER_NO_DATABASE_CLIENT}
        data-heu-task-center-dry-run-env-gate-ledger-no-task-mutation={TASK_CENTER_DRY_RUN_ENV_GATE_LEDGER_NO_TASK_MUTATION}
        data-heu-task-center-dry-run-env-gate-ledger-no-real-data={TASK_CENTER_DRY_RUN_ENV_GATE_LEDGER_NO_REAL_DATA}
        data-heu-task-center-dry-run-env-gate-ledger-no-env-enablement={TASK_CENTER_DRY_RUN_ENV_GATE_LEDGER_NO_ENV_ENABLEMENT}
        data-heu-task-center-dry-run-env-gate-ledger-no-ai-or-automation={TASK_CENTER_DRY_RUN_ENV_GATE_LEDGER_NO_AI_OR_AUTOMATION}
        data-heu-task-center-adapter-dry-run-readiness-review={TASK_CENTER_ADAPTER_DRY_RUN_READINESS_REVIEW_ONLY}
        data-heu-task-center-adapter-dry-run-readiness-review-readonly={TASK_CENTER_ADAPTER_DRY_RUN_READINESS_REVIEW_READONLY}
        data-heu-task-center-adapter-dry-run-readiness-review-draft-only={TASK_CENTER_ADAPTER_DRY_RUN_READINESS_REVIEW_DRAFT_ONLY}
        data-heu-task-center-adapter-dry-run-readiness-review-no-approval={TASK_CENTER_ADAPTER_DRY_RUN_READINESS_REVIEW_NO_APPROVAL}
        data-heu-task-center-adapter-dry-run-readiness-review-no-database-read={TASK_CENTER_ADAPTER_DRY_RUN_READINESS_REVIEW_NO_DATABASE_READ}
        data-heu-task-center-adapter-dry-run-readiness-review-no-database-client={TASK_CENTER_ADAPTER_DRY_RUN_READINESS_REVIEW_NO_DATABASE_CLIENT}
        data-heu-task-center-adapter-dry-run-readiness-review-no-env-enablement={TASK_CENTER_ADAPTER_DRY_RUN_READINESS_REVIEW_NO_ENV_ENABLEMENT}
        data-heu-task-center-adapter-dry-run-readiness-review-no-task-mutation={TASK_CENTER_ADAPTER_DRY_RUN_READINESS_REVIEW_NO_TASK_MUTATION}
        data-heu-task-center-adapter-dry-run-readiness-review-no-real-data={TASK_CENTER_ADAPTER_DRY_RUN_READINESS_REVIEW_NO_REAL_DATA}
        data-heu-task-center-adapter-dry-run-readiness-review-no-ai-or-automation={TASK_CENTER_ADAPTER_DRY_RUN_READINESS_REVIEW_NO_AI_OR_AUTOMATION}
        data-heu-task-center-adapter-dry-run-static-negative-access-packet={TASK_CENTER_ADAPTER_DRY_RUN_STATIC_NEGATIVE_ACCESS_PACKET_ONLY}
        data-heu-task-center-adapter-dry-run-static-negative-access-packet-readonly={TASK_CENTER_ADAPTER_DRY_RUN_STATIC_NEGATIVE_ACCESS_PACKET_READONLY}
        data-heu-task-center-adapter-dry-run-static-negative-access-packet-draft-only={TASK_CENTER_ADAPTER_DRY_RUN_STATIC_NEGATIVE_ACCESS_PACKET_DRAFT_ONLY}
        data-heu-task-center-adapter-dry-run-static-negative-access-packet-no-approval={TASK_CENTER_ADAPTER_DRY_RUN_STATIC_NEGATIVE_ACCESS_PACKET_NO_APPROVAL}
        data-heu-task-center-adapter-dry-run-static-negative-access-packet-no-database-read={TASK_CENTER_ADAPTER_DRY_RUN_STATIC_NEGATIVE_ACCESS_PACKET_NO_DATABASE_READ}
        data-heu-task-center-adapter-dry-run-static-negative-access-packet-no-database-client={TASK_CENTER_ADAPTER_DRY_RUN_STATIC_NEGATIVE_ACCESS_PACKET_NO_DATABASE_CLIENT}
        data-heu-task-center-adapter-dry-run-static-negative-access-packet-no-env-enablement={TASK_CENTER_ADAPTER_DRY_RUN_STATIC_NEGATIVE_ACCESS_PACKET_NO_ENV_ENABLEMENT}
        data-heu-task-center-adapter-dry-run-static-negative-access-packet-no-task-mutation={TASK_CENTER_ADAPTER_DRY_RUN_STATIC_NEGATIVE_ACCESS_PACKET_NO_TASK_MUTATION}
        data-heu-task-center-adapter-dry-run-static-negative-access-packet-no-real-data={TASK_CENTER_ADAPTER_DRY_RUN_STATIC_NEGATIVE_ACCESS_PACKET_NO_REAL_DATA}
        data-heu-task-center-adapter-dry-run-static-negative-access-packet-no-ai-or-automation={TASK_CENTER_ADAPTER_DRY_RUN_STATIC_NEGATIVE_ACCESS_PACKET_NO_AI_OR_AUTOMATION}
        data-heu-task-center-adapter-dry-run-readonly-test-harness-design={TASK_CENTER_ADAPTER_DRY_RUN_READONLY_TEST_HARNESS_DESIGN_ONLY}
        data-heu-task-center-adapter-dry-run-readonly-test-harness-design-readonly={TASK_CENTER_ADAPTER_DRY_RUN_READONLY_TEST_HARNESS_DESIGN_READONLY}
        data-heu-task-center-adapter-dry-run-readonly-test-harness-design-draft-only={TASK_CENTER_ADAPTER_DRY_RUN_READONLY_TEST_HARNESS_DESIGN_DRAFT_ONLY}
        data-heu-task-center-adapter-dry-run-readonly-test-harness-design-no-approval={TASK_CENTER_ADAPTER_DRY_RUN_READONLY_TEST_HARNESS_DESIGN_NO_APPROVAL}
        data-heu-task-center-adapter-dry-run-readonly-test-harness-design-no-database-read={TASK_CENTER_ADAPTER_DRY_RUN_READONLY_TEST_HARNESS_DESIGN_NO_DATABASE_READ}
        data-heu-task-center-adapter-dry-run-readonly-test-harness-design-no-database-client={TASK_CENTER_ADAPTER_DRY_RUN_READONLY_TEST_HARNESS_DESIGN_NO_DATABASE_CLIENT}
        data-heu-task-center-adapter-dry-run-readonly-test-harness-design-no-env-enablement={TASK_CENTER_ADAPTER_DRY_RUN_READONLY_TEST_HARNESS_DESIGN_NO_ENV_ENABLEMENT}
        data-heu-task-center-adapter-dry-run-readonly-test-harness-design-no-task-mutation={TASK_CENTER_ADAPTER_DRY_RUN_READONLY_TEST_HARNESS_DESIGN_NO_TASK_MUTATION}
        data-heu-task-center-adapter-dry-run-readonly-test-harness-design-no-real-data={TASK_CENTER_ADAPTER_DRY_RUN_READONLY_TEST_HARNESS_DESIGN_NO_REAL_DATA}
        data-heu-task-center-adapter-dry-run-readonly-test-harness-design-no-ai-or-automation={TASK_CENTER_ADAPTER_DRY_RUN_READONLY_TEST_HARNESS_DESIGN_NO_AI_OR_AUTOMATION}
        data-heu-task-center-adapter-dry-run-synthetic-fixture-contract={TASK_CENTER_ADAPTER_DRY_RUN_SYNTHETIC_FIXTURE_CONTRACT_ONLY}
        data-heu-task-center-adapter-dry-run-synthetic-fixture-contract-readonly={TASK_CENTER_ADAPTER_DRY_RUN_SYNTHETIC_FIXTURE_CONTRACT_READONLY}
        data-heu-task-center-adapter-dry-run-synthetic-fixture-contract-draft-only={TASK_CENTER_ADAPTER_DRY_RUN_SYNTHETIC_FIXTURE_CONTRACT_DRAFT_ONLY}
        data-heu-task-center-adapter-dry-run-synthetic-fixture-contract-no-approval={TASK_CENTER_ADAPTER_DRY_RUN_SYNTHETIC_FIXTURE_CONTRACT_NO_APPROVAL}
        data-heu-task-center-adapter-dry-run-synthetic-fixture-contract-no-database-read={TASK_CENTER_ADAPTER_DRY_RUN_SYNTHETIC_FIXTURE_CONTRACT_NO_DATABASE_READ}
        data-heu-task-center-adapter-dry-run-synthetic-fixture-contract-no-database-client={TASK_CENTER_ADAPTER_DRY_RUN_SYNTHETIC_FIXTURE_CONTRACT_NO_DATABASE_CLIENT}
        data-heu-task-center-adapter-dry-run-synthetic-fixture-contract-no-env-enablement={TASK_CENTER_ADAPTER_DRY_RUN_SYNTHETIC_FIXTURE_CONTRACT_NO_ENV_ENABLEMENT}
        data-heu-task-center-adapter-dry-run-synthetic-fixture-contract-no-task-mutation={TASK_CENTER_ADAPTER_DRY_RUN_SYNTHETIC_FIXTURE_CONTRACT_NO_TASK_MUTATION}
        data-heu-task-center-adapter-dry-run-synthetic-fixture-contract-no-real-data={TASK_CENTER_ADAPTER_DRY_RUN_SYNTHETIC_FIXTURE_CONTRACT_NO_REAL_DATA}
        data-heu-task-center-adapter-dry-run-synthetic-fixture-contract-no-ai-or-automation={TASK_CENTER_ADAPTER_DRY_RUN_SYNTHETIC_FIXTURE_CONTRACT_NO_AI_OR_AUTOMATION}
        data-heu-task-center-adapter-dry-run-synthetic-fixture-runner-plan={TASK_CENTER_ADAPTER_DRY_RUN_SYNTHETIC_FIXTURE_RUNNER_PLAN_ONLY}
        data-heu-task-center-adapter-dry-run-synthetic-fixture-runner-plan-readonly={TASK_CENTER_ADAPTER_DRY_RUN_SYNTHETIC_FIXTURE_RUNNER_PLAN_READONLY}
        data-heu-task-center-adapter-dry-run-synthetic-fixture-runner-plan-draft-only={TASK_CENTER_ADAPTER_DRY_RUN_SYNTHETIC_FIXTURE_RUNNER_PLAN_DRAFT_ONLY}
        data-heu-task-center-adapter-dry-run-synthetic-fixture-runner-plan-no-approval={TASK_CENTER_ADAPTER_DRY_RUN_SYNTHETIC_FIXTURE_RUNNER_PLAN_NO_APPROVAL}
        data-heu-task-center-adapter-dry-run-synthetic-fixture-runner-plan-no-database-read={TASK_CENTER_ADAPTER_DRY_RUN_SYNTHETIC_FIXTURE_RUNNER_PLAN_NO_DATABASE_READ}
        data-heu-task-center-adapter-dry-run-synthetic-fixture-runner-plan-no-database-client={TASK_CENTER_ADAPTER_DRY_RUN_SYNTHETIC_FIXTURE_RUNNER_PLAN_NO_DATABASE_CLIENT}
        data-heu-task-center-adapter-dry-run-synthetic-fixture-runner-plan-no-env-enablement={TASK_CENTER_ADAPTER_DRY_RUN_SYNTHETIC_FIXTURE_RUNNER_PLAN_NO_ENV_ENABLEMENT}
        data-heu-task-center-adapter-dry-run-synthetic-fixture-runner-plan-no-task-mutation={TASK_CENTER_ADAPTER_DRY_RUN_SYNTHETIC_FIXTURE_RUNNER_PLAN_NO_TASK_MUTATION}
        data-heu-task-center-adapter-dry-run-synthetic-fixture-runner-plan-no-real-data={TASK_CENTER_ADAPTER_DRY_RUN_SYNTHETIC_FIXTURE_RUNNER_PLAN_NO_REAL_DATA}
        data-heu-task-center-adapter-dry-run-synthetic-fixture-runner-plan-no-ai-or-automation={TASK_CENTER_ADAPTER_DRY_RUN_SYNTHETIC_FIXTURE_RUNNER_PLAN_NO_AI_OR_AUTOMATION}
        data-heu-task-center-adapter-dry-run-runner-static-check-design={TASK_CENTER_ADAPTER_DRY_RUN_RUNNER_STATIC_CHECK_DESIGN_ONLY}
        data-heu-task-center-adapter-dry-run-runner-static-check-design-readonly={TASK_CENTER_ADAPTER_DRY_RUN_RUNNER_STATIC_CHECK_DESIGN_READONLY}
        data-heu-task-center-adapter-dry-run-runner-static-check-design-draft-only={TASK_CENTER_ADAPTER_DRY_RUN_RUNNER_STATIC_CHECK_DESIGN_DRAFT_ONLY}
        data-heu-task-center-adapter-dry-run-runner-static-check-design-no-approval={TASK_CENTER_ADAPTER_DRY_RUN_RUNNER_STATIC_CHECK_DESIGN_NO_APPROVAL}
        data-heu-task-center-adapter-dry-run-runner-static-check-design-no-database-read={TASK_CENTER_ADAPTER_DRY_RUN_RUNNER_STATIC_CHECK_DESIGN_NO_DATABASE_READ}
        data-heu-task-center-adapter-dry-run-runner-static-check-design-no-database-client={TASK_CENTER_ADAPTER_DRY_RUN_RUNNER_STATIC_CHECK_DESIGN_NO_DATABASE_CLIENT}
        data-heu-task-center-adapter-dry-run-runner-static-check-design-no-env-enablement={TASK_CENTER_ADAPTER_DRY_RUN_RUNNER_STATIC_CHECK_DESIGN_NO_ENV_ENABLEMENT}
        data-heu-task-center-adapter-dry-run-runner-static-check-design-no-task-mutation={TASK_CENTER_ADAPTER_DRY_RUN_RUNNER_STATIC_CHECK_DESIGN_NO_TASK_MUTATION}
        data-heu-task-center-adapter-dry-run-runner-static-check-design-no-real-data={TASK_CENTER_ADAPTER_DRY_RUN_RUNNER_STATIC_CHECK_DESIGN_NO_REAL_DATA}
        data-heu-task-center-adapter-dry-run-runner-static-check-design-no-ai-or-automation={TASK_CENTER_ADAPTER_DRY_RUN_RUNNER_STATIC_CHECK_DESIGN_NO_AI_OR_AUTOMATION}
        data-heu-task-center-adapter-dry-run-local-runner-candidate-readiness={TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_CANDIDATE_READINESS_ONLY}
        data-heu-task-center-adapter-dry-run-local-runner-candidate-readiness-readonly={TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_CANDIDATE_READINESS_READONLY}
        data-heu-task-center-adapter-dry-run-local-runner-candidate-readiness-draft-only={TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_CANDIDATE_READINESS_DRAFT_ONLY}
        data-heu-task-center-adapter-dry-run-local-runner-candidate-readiness-no-approval={TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_CANDIDATE_READINESS_NO_APPROVAL}
        data-heu-task-center-adapter-dry-run-local-runner-candidate-readiness-no-database-read={TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_CANDIDATE_READINESS_NO_DATABASE_READ}
        data-heu-task-center-adapter-dry-run-local-runner-candidate-readiness-no-database-client={TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_CANDIDATE_READINESS_NO_DATABASE_CLIENT}
        data-heu-task-center-adapter-dry-run-local-runner-candidate-readiness-no-env-enablement={TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_CANDIDATE_READINESS_NO_ENV_ENABLEMENT}
        data-heu-task-center-adapter-dry-run-local-runner-candidate-readiness-no-task-mutation={TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_CANDIDATE_READINESS_NO_TASK_MUTATION}
        data-heu-task-center-adapter-dry-run-local-runner-candidate-readiness-no-real-data={TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_CANDIDATE_READINESS_NO_REAL_DATA}
        data-heu-task-center-adapter-dry-run-local-runner-candidate-readiness-no-ai-or-automation={TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_CANDIDATE_READINESS_NO_AI_OR_AUTOMATION}
        data-heu-task-center-adapter-dry-run-local-runner-script-draft={TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_SCRIPT_DRAFT_ONLY}
        data-heu-task-center-adapter-dry-run-local-runner-script-draft-readonly={TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_SCRIPT_DRAFT_READONLY}
        data-heu-task-center-adapter-dry-run-local-runner-script-draft-draft-only={TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_SCRIPT_DRAFT_DRAFT_ONLY}
        data-heu-task-center-adapter-dry-run-local-runner-script-draft-no-approval={TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_SCRIPT_DRAFT_NO_APPROVAL}
        data-heu-task-center-adapter-dry-run-local-runner-script-draft-no-database-read={TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_SCRIPT_DRAFT_NO_DATABASE_READ}
        data-heu-task-center-adapter-dry-run-local-runner-script-draft-no-database-client={TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_SCRIPT_DRAFT_NO_DATABASE_CLIENT}
        data-heu-task-center-adapter-dry-run-local-runner-script-draft-no-env-enablement={TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_SCRIPT_DRAFT_NO_ENV_ENABLEMENT}
        data-heu-task-center-adapter-dry-run-local-runner-script-draft-no-task-mutation={TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_SCRIPT_DRAFT_NO_TASK_MUTATION}
        data-heu-task-center-adapter-dry-run-local-runner-script-draft-no-real-data={TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_SCRIPT_DRAFT_NO_REAL_DATA}
        data-heu-task-center-adapter-dry-run-local-runner-script-draft-no-ai-or-automation={TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_SCRIPT_DRAFT_NO_AI_OR_AUTOMATION}
        data-heu-task-center-adapter-dry-run-runner-output-ledger={TASK_CENTER_ADAPTER_DRY_RUN_RUNNER_OUTPUT_LEDGER_ONLY}
        data-heu-task-center-adapter-dry-run-runner-output-ledger-readonly={TASK_CENTER_ADAPTER_DRY_RUN_RUNNER_OUTPUT_LEDGER_READONLY}
        data-heu-task-center-adapter-dry-run-runner-output-ledger-draft-only={TASK_CENTER_ADAPTER_DRY_RUN_RUNNER_OUTPUT_LEDGER_DRAFT_ONLY}
        data-heu-task-center-adapter-dry-run-runner-output-ledger-no-approval={TASK_CENTER_ADAPTER_DRY_RUN_RUNNER_OUTPUT_LEDGER_NO_APPROVAL}
        data-heu-task-center-adapter-dry-run-runner-output-ledger-no-database-read={TASK_CENTER_ADAPTER_DRY_RUN_RUNNER_OUTPUT_LEDGER_NO_DATABASE_READ}
        data-heu-task-center-adapter-dry-run-runner-output-ledger-no-database-client={TASK_CENTER_ADAPTER_DRY_RUN_RUNNER_OUTPUT_LEDGER_NO_DATABASE_CLIENT}
        data-heu-task-center-adapter-dry-run-runner-output-ledger-no-env-enablement={TASK_CENTER_ADAPTER_DRY_RUN_RUNNER_OUTPUT_LEDGER_NO_ENV_ENABLEMENT}
        data-heu-task-center-adapter-dry-run-runner-output-ledger-no-task-mutation={TASK_CENTER_ADAPTER_DRY_RUN_RUNNER_OUTPUT_LEDGER_NO_TASK_MUTATION}
        data-heu-task-center-adapter-dry-run-runner-output-ledger-no-real-data={TASK_CENTER_ADAPTER_DRY_RUN_RUNNER_OUTPUT_LEDGER_NO_REAL_DATA}
        data-heu-task-center-adapter-dry-run-runner-output-ledger-no-ai-or-automation={TASK_CENTER_ADAPTER_DRY_RUN_RUNNER_OUTPUT_LEDGER_NO_AI_OR_AUTOMATION}
        data-heu-task-center-adapter-dry-run-output-ledger-static-snapshot={TASK_CENTER_ADAPTER_DRY_RUN_OUTPUT_LEDGER_STATIC_SNAPSHOT_ONLY}
        data-heu-task-center-adapter-dry-run-output-ledger-static-snapshot-readonly={TASK_CENTER_ADAPTER_DRY_RUN_OUTPUT_LEDGER_STATIC_SNAPSHOT_READONLY}
        data-heu-task-center-adapter-dry-run-output-ledger-static-snapshot-draft-only={TASK_CENTER_ADAPTER_DRY_RUN_OUTPUT_LEDGER_STATIC_SNAPSHOT_DRAFT_ONLY}
        data-heu-task-center-adapter-dry-run-output-ledger-static-snapshot-no-approval={TASK_CENTER_ADAPTER_DRY_RUN_OUTPUT_LEDGER_STATIC_SNAPSHOT_NO_APPROVAL}
        data-heu-task-center-adapter-dry-run-output-ledger-static-snapshot-no-database-read={TASK_CENTER_ADAPTER_DRY_RUN_OUTPUT_LEDGER_STATIC_SNAPSHOT_NO_DATABASE_READ}
        data-heu-task-center-adapter-dry-run-output-ledger-static-snapshot-no-database-client={TASK_CENTER_ADAPTER_DRY_RUN_OUTPUT_LEDGER_STATIC_SNAPSHOT_NO_DATABASE_CLIENT}
        data-heu-task-center-adapter-dry-run-output-ledger-static-snapshot-no-env-enablement={TASK_CENTER_ADAPTER_DRY_RUN_OUTPUT_LEDGER_STATIC_SNAPSHOT_NO_ENV_ENABLEMENT}
        data-heu-task-center-adapter-dry-run-output-ledger-static-snapshot-no-file-write={TASK_CENTER_ADAPTER_DRY_RUN_OUTPUT_LEDGER_STATIC_SNAPSHOT_NO_FILE_WRITE}
        data-heu-task-center-adapter-dry-run-output-ledger-static-snapshot-no-task-mutation={TASK_CENTER_ADAPTER_DRY_RUN_OUTPUT_LEDGER_STATIC_SNAPSHOT_NO_TASK_MUTATION}
        data-heu-task-center-adapter-dry-run-output-ledger-static-snapshot-no-real-data={TASK_CENTER_ADAPTER_DRY_RUN_OUTPUT_LEDGER_STATIC_SNAPSHOT_NO_REAL_DATA}
        data-heu-task-center-adapter-dry-run-output-ledger-static-snapshot-no-ai-or-automation={TASK_CENTER_ADAPTER_DRY_RUN_OUTPUT_LEDGER_STATIC_SNAPSHOT_NO_AI_OR_AUTOMATION}
        data-heu-task-center-adapter-dry-run-review-decision-packet={TASK_CENTER_ADAPTER_DRY_RUN_REVIEW_DECISION_PACKET_ONLY}
        data-heu-task-center-adapter-dry-run-review-decision-packet-readonly={TASK_CENTER_ADAPTER_DRY_RUN_REVIEW_DECISION_PACKET_READONLY}
        data-heu-task-center-adapter-dry-run-review-decision-packet-draft-only={TASK_CENTER_ADAPTER_DRY_RUN_REVIEW_DECISION_PACKET_DRAFT_ONLY}
        data-heu-task-center-adapter-dry-run-review-decision-packet-no-approval={TASK_CENTER_ADAPTER_DRY_RUN_REVIEW_DECISION_PACKET_NO_APPROVAL}
        data-heu-task-center-adapter-dry-run-review-decision-packet-no-database-read={TASK_CENTER_ADAPTER_DRY_RUN_REVIEW_DECISION_PACKET_NO_DATABASE_READ}
        data-heu-task-center-adapter-dry-run-review-decision-packet-no-database-client={TASK_CENTER_ADAPTER_DRY_RUN_REVIEW_DECISION_PACKET_NO_DATABASE_CLIENT}
        data-heu-task-center-adapter-dry-run-review-decision-packet-no-env-enablement={TASK_CENTER_ADAPTER_DRY_RUN_REVIEW_DECISION_PACKET_NO_ENV_ENABLEMENT}
        data-heu-task-center-adapter-dry-run-review-decision-packet-no-file-write={TASK_CENTER_ADAPTER_DRY_RUN_REVIEW_DECISION_PACKET_NO_FILE_WRITE}
        data-heu-task-center-adapter-dry-run-review-decision-packet-no-task-mutation={TASK_CENTER_ADAPTER_DRY_RUN_REVIEW_DECISION_PACKET_NO_TASK_MUTATION}
        data-heu-task-center-adapter-dry-run-review-decision-packet-no-real-data={TASK_CENTER_ADAPTER_DRY_RUN_REVIEW_DECISION_PACKET_NO_REAL_DATA}
        data-heu-task-center-adapter-dry-run-review-decision-packet-no-ai-or-automation={TASK_CENTER_ADAPTER_DRY_RUN_REVIEW_DECISION_PACKET_NO_AI_OR_AUTOMATION}
        data-heu-task-center-adapter-dry-run-db-read-go-no-go-precheck={TASK_CENTER_ADAPTER_DRY_RUN_DB_READ_GO_NO_GO_PRECHECK_ONLY}
        data-heu-task-center-adapter-dry-run-db-read-go-no-go-precheck-readonly={TASK_CENTER_ADAPTER_DRY_RUN_DB_READ_GO_NO_GO_PRECHECK_READONLY}
        data-heu-task-center-adapter-dry-run-db-read-go-no-go-precheck-draft-only={TASK_CENTER_ADAPTER_DRY_RUN_DB_READ_GO_NO_GO_PRECHECK_DRAFT_ONLY}
        data-heu-task-center-adapter-dry-run-db-read-go-no-go-precheck-no-approval={TASK_CENTER_ADAPTER_DRY_RUN_DB_READ_GO_NO_GO_PRECHECK_NO_APPROVAL}
        data-heu-task-center-adapter-dry-run-db-read-go-no-go-precheck-no-database-read={TASK_CENTER_ADAPTER_DRY_RUN_DB_READ_GO_NO_GO_PRECHECK_NO_DATABASE_READ}
        data-heu-task-center-adapter-dry-run-db-read-go-no-go-precheck-no-database-client={TASK_CENTER_ADAPTER_DRY_RUN_DB_READ_GO_NO_GO_PRECHECK_NO_DATABASE_CLIENT}
        data-heu-task-center-adapter-dry-run-db-read-go-no-go-precheck-no-env-enablement={TASK_CENTER_ADAPTER_DRY_RUN_DB_READ_GO_NO_GO_PRECHECK_NO_ENV_ENABLEMENT}
        data-heu-task-center-adapter-dry-run-db-read-go-no-go-precheck-no-file-write={TASK_CENTER_ADAPTER_DRY_RUN_DB_READ_GO_NO_GO_PRECHECK_NO_FILE_WRITE}
        data-heu-task-center-adapter-dry-run-db-read-go-no-go-precheck-no-task-mutation={TASK_CENTER_ADAPTER_DRY_RUN_DB_READ_GO_NO_GO_PRECHECK_NO_TASK_MUTATION}
        data-heu-task-center-adapter-dry-run-db-read-go-no-go-precheck-no-real-data={TASK_CENTER_ADAPTER_DRY_RUN_DB_READ_GO_NO_GO_PRECHECK_NO_REAL_DATA}
        data-heu-task-center-adapter-dry-run-db-read-go-no-go-precheck-no-ai-or-automation={TASK_CENTER_ADAPTER_DRY_RUN_DB_READ_GO_NO_GO_PRECHECK_NO_AI_OR_AUTOMATION}
      >
        <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs font-medium uppercase text-zinc-500">
              HEU-Data-011 - Gate evidence panel
            </p>
            <h3 className="mt-1 text-sm font-semibold text-zinc-950">
              Trang thai gate truoc khi bat adapter read-only
            </h3>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-zinc-600">
              Panel nay chi hien trang thai gate da khoa. No khong tao DB
              client, khong doc database, khong tao migration, khong sua task,
              khong goi AI va khong kich hoat automation.
            </p>
          </div>
          <div className="flex flex-col gap-1 text-xs">
            <span className="inline-flex w-fit rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 font-medium text-amber-700">
              {gateEvidence.databaseStatus}
            </span>
            <span className="text-zinc-500">
              Gate: {gateEvidence.gateMode}
            </span>
          </div>
        </div>

        <div className="grid gap-3 lg:grid-cols-5">
          {gateEvidence.ownerRows.map((row) => (
            <article
              key={row.lane}
              className="rounded-lg border border-zinc-200 bg-zinc-50 p-3"
              data-heu-task-center-gate-owner-lane={row.lane}
              data-heu-task-center-gate-owner-decision={row.decision}
              data-heu-task-center-gate-required-proof={row.requiredProof}
            >
              <div className="text-xs font-medium uppercase text-zinc-500">
                {row.lane}
              </div>
              <div className="mt-1 text-sm font-semibold text-zinc-950">
                {row.decision}
              </div>
              <div className="mt-2 text-xs leading-5 text-zinc-600">
                {row.label}
              </div>
              <div className="mt-2 break-all font-mono text-[11px] text-zinc-500">
                {row.requiredProof}
              </div>
            </article>
          ))}
        </div>

        <div className="mt-4 rounded-lg border border-zinc-200 bg-white p-3 text-xs leading-5 text-zinc-600">
          <div className="font-medium uppercase text-zinc-500">
            Required proof before DB read
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {gateEvidence.requiredProof.map((proof) => (
              <span
                key={proof}
                className="rounded-full border border-zinc-200 bg-zinc-50 px-2 py-1 font-mono"
              >
                {proof}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-3">
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
            <div className="text-xs font-medium uppercase text-emerald-700">
              User UAT duoc lam
            </div>
            <div className="mt-3 space-y-3">
              {gateEvidence.uatCopy.allowed.map((item) => (
                <div
                  key={item.code}
                  data-heu-task-center-real-user-uat-allowed={item.code}
                >
                  <div className="text-sm font-semibold text-emerald-950">
                    {item.title}
                  </div>
                  <div className="mt-1 text-xs leading-5 text-emerald-800">
                    {item.detail}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-rose-200 bg-rose-50 p-3">
            <div className="text-xs font-medium uppercase text-rose-700">
              User UAT khong duoc lam
            </div>
            <div className="mt-3 space-y-3">
              {gateEvidence.uatCopy.blocked.map((item) => (
                <div
                  key={item.code}
                  data-heu-task-center-real-user-uat-blocked={item.code}
                >
                  <div className="text-sm font-semibold text-rose-950">
                    {item.title}
                  </div>
                  <div className="mt-1 text-xs leading-5 text-rose-800">
                    {item.detail}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-sky-200 bg-sky-50 p-3">
            <div className="text-xs font-medium uppercase text-sky-700">
              User UAT bao cho ai
            </div>
            <div className="mt-3 space-y-3">
              {gateEvidence.uatCopy.reportTo.map((item) => (
                <div
                  key={item.code}
                  data-heu-task-center-real-user-uat-report-to={item.code}
                >
                  <div className="text-sm font-semibold text-sky-950">
                    {item.title}
                  </div>
                  <div className="mt-1 text-xs leading-5 text-sky-800">
                    {item.detail}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div
          className="mt-4 rounded-lg border border-zinc-200 bg-white p-3"
          data-heu-task-center-adapter-dry-run-runner-output-ledger-codes={runnerOutputLedgerCodes.join(
            "|",
          )}
        >
          <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="text-xs font-medium uppercase text-zinc-500">
                HEU-Data-013 - UAT evidence checklist
              </div>
              <div className="mt-1 text-sm font-semibold text-zinc-950">
                Checklist bang chung UAT can chup ben ngoai he thong
              </div>
              <p className="mt-1 max-w-3xl text-xs leading-5 text-zinc-600">
                Checklist nay chi huong dan loai bang chung can thu. Khong co
                upload file, khong ghi storage, khong doc database va khong
                yeu cau du lieu nhay cam.
              </p>
            </div>
            <span className="inline-flex w-fit rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs font-medium text-zinc-700">
              {gateEvidence.uatEvidenceChecklist.mode}
            </span>
          </div>

          <div className="mt-3 grid gap-2 lg:grid-cols-5">
            {gateEvidence.uatEvidenceChecklist.items.map((item) => (
              <article
                key={item.code}
                className="rounded-md border border-zinc-200 bg-zinc-50 p-3"
                data-heu-task-center-uat-evidence-item={item.code}
                data-heu-task-center-uat-evidence-reviewer={item.reviewer}
              >
                <div className="font-mono text-[11px] text-zinc-500">
                  {item.code}
                </div>
                <div className="mt-1 text-sm font-semibold text-zinc-950">
                  {item.title}
                </div>
                <div className="mt-2 text-xs leading-5 text-zinc-600">
                  {item.expectedEvidence}
                </div>
                <div className="mt-2 inline-flex rounded-full border border-zinc-200 bg-white px-2 py-1 text-[11px] font-medium text-zinc-600">
                  Reviewer: {item.reviewer}
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="mt-4 rounded-lg border border-zinc-200 bg-white p-3">
          <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="text-xs font-medium uppercase text-zinc-500">
                HEU-Data-014 - Pilot review packet
              </div>
              <div className="mt-1 text-sm font-semibold text-zinc-950">
                Bo goi review pilot truoc khi mo DB read
              </div>
              <p className="mt-1 max-w-3xl text-xs leading-5 text-zinc-600">
                Packet nay chi gom dieu kien review cho pilot. Bang chung that
                nam ngoai Git/Codex/chat, khong upload, khong ghi storage,
                khong phe duyet va production remains NO-GO.
              </p>
            </div>
            <span className="inline-flex w-fit rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs font-medium text-zinc-700">
              {gateEvidence.pilotReviewPacket.mode}
            </span>
          </div>

          <div className="mt-3 grid gap-2 lg:grid-cols-5">
            {gateEvidence.pilotReviewPacket.items.map((item) => (
              <article
                key={item.code}
                className="rounded-md border border-zinc-200 bg-zinc-50 p-3"
                data-heu-task-center-pilot-review-item={item.code}
                data-heu-task-center-pilot-review-reviewer={
                  item.requiredReviewer
                }
              >
                <div className="font-mono text-[11px] text-zinc-500">
                  {item.code}
                </div>
                <div className="mt-1 text-sm font-semibold text-zinc-950">
                  {item.title}
                </div>
                <div className="mt-2 text-xs leading-5 text-zinc-600">
                  {item.passCondition}
                </div>
                <div className="mt-2 inline-flex rounded-full border border-zinc-200 bg-white px-2 py-1 text-[11px] font-medium text-zinc-600">
                  Reviewer: {item.requiredReviewer}
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="mt-4 rounded-lg border border-zinc-200 bg-white p-3">
          <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="text-xs font-medium uppercase text-zinc-500">
                HEU-Data-015 - Owner signoff routing map
              </div>
              <div className="mt-1 text-sm font-semibold text-zinc-950">
                Ban do tuyen owner truoc khi mo DB read
              </div>
              <p className="mt-1 max-w-3xl text-xs leading-5 text-zinc-600">
                Map nay chi chi ra owner nao can xem dieu kien nao. Khong co
                nut phe duyet, khong doc database, khong sua task, khong goi
                AI va khong kich hoat automation.
              </p>
            </div>
            <span className="inline-flex w-fit rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs font-medium text-zinc-700">
              {gateEvidence.ownerSignoffRoutingMap.mode}
            </span>
          </div>

          <div className="mt-3 grid gap-2 lg:grid-cols-5">
            {gateEvidence.ownerSignoffRoutingMap.items.map((item) => (
              <article
                key={item.code}
                className="rounded-md border border-zinc-200 bg-zinc-50 p-3"
                data-heu-task-center-owner-signoff-item={item.code}
                data-heu-task-center-owner-signoff-lane={item.ownerLane}
                data-heu-task-center-owner-signoff-evidence={
                  item.requiredEvidenceCode
                }
                data-heu-task-center-owner-signoff-db-blocker={
                  item.blocksDbReadUntil
                }
              >
                <div className="font-mono text-[11px] text-zinc-500">
                  {item.code}
                </div>
                <div className="mt-1 text-sm font-semibold text-zinc-950">
                  {item.ownerLane}
                </div>
                <div className="mt-2 text-xs leading-5 text-zinc-600">
                  {item.reviewQuestion}
                </div>
                <div className="mt-2 break-all font-mono text-[11px] text-zinc-500">
                  {item.requiredEvidenceCode}
                </div>
                <div className="mt-2 rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-[11px] font-medium text-amber-700">
                  {item.blocksDbReadUntil}
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="mt-4 rounded-lg border border-zinc-200 bg-white p-3">
          <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="text-xs font-medium uppercase text-zinc-500">
                HEU-Data-016 - Read-only adapter decision ledger
              </div>
              <div className="mt-1 text-sm font-semibold text-zinc-950">
                So quyet dinh giu adapter DB o trang thai HOLD_NO_GO
              </div>
              <p className="mt-1 max-w-3xl text-xs leading-5 text-zinc-600">
                Ledger nay chi ghi ly do chua mo adapter DB. Moi dong la
                HOLD_NO_GO cho toi khi owner cung cap evidence hop le; khong
                doc database, khong sua task, khong phe duyet va khong goi AI.
              </p>
            </div>
            <span className="inline-flex w-fit rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs font-medium text-zinc-700">
              {gateEvidence.readonlyAdapterDecisionLedger.mode}
            </span>
          </div>

          <div className="mt-3 grid gap-2 lg:grid-cols-5">
            {gateEvidence.readonlyAdapterDecisionLedger.items.map((item) => (
              <article
                key={item.code}
                className="rounded-md border border-amber-200 bg-amber-50 p-3"
                data-heu-task-center-readonly-adapter-decision-item={item.code}
                data-heu-task-center-readonly-adapter-decision-lane={
                  item.ownerLane
                }
                data-heu-task-center-readonly-adapter-decision-state={
                  item.decision
                }
                data-heu-task-center-readonly-adapter-decision-required={
                  item.requiredBeforeDbRead
                }
              >
                <div className="font-mono text-[11px] text-amber-700">
                  {item.code}
                </div>
                <div className="mt-1 text-sm font-semibold text-amber-950">
                  {item.decision}
                </div>
                <div className="mt-1 text-xs font-medium text-amber-800">
                  Owner: {item.ownerLane}
                </div>
                <div className="mt-2 text-xs leading-5 text-amber-800">
                  {item.decisionReason}
                </div>
                <div className="mt-2 break-all font-mono text-[11px] text-amber-700">
                  {item.requiredBeforeDbRead}
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="mt-4 rounded-lg border border-zinc-200 bg-white p-3">
          <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="text-xs font-medium uppercase text-zinc-500">
                HEU-Data-017 - DB-read adapter implementation plan
              </div>
              <div className="mt-1 text-sm font-semibold text-zinc-950">
                Ke hoach mo adapter doc DB sau khi du owner gate
              </div>
              <p className="mt-1 max-w-3xl text-xs leading-5 text-zinc-600">
                Plan nay chi chia buoc trien khai adapter doc DB trong tuong
                lai. Slice hien tai van khong tao database client, khong doc
                database, khong sua task, khong goi AI va khong deploy.
              </p>
            </div>
            <span className="inline-flex w-fit rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs font-medium text-zinc-700">
              {gateEvidence.dbReadAdapterImplementationPlan.mode}
            </span>
          </div>

          <div className="mt-3 grid gap-2 lg:grid-cols-5">
            {gateEvidence.dbReadAdapterImplementationPlan.items.map((item) => (
              <article
                key={item.code}
                className="rounded-md border border-zinc-200 bg-zinc-50 p-3"
                data-heu-task-center-db-read-plan-item={item.code}
                data-heu-task-center-db-read-plan-phase={item.phase}
                data-heu-task-center-db-read-plan-required-gate={
                  item.requiredGateBeforeExecution
                }
                data-heu-task-center-db-read-plan-forbidden={
                  item.forbiddenInThisSlice
                }
              >
                <div className="font-mono text-[11px] text-zinc-500">
                  {item.code}
                </div>
                <div className="mt-1 text-sm font-semibold text-zinc-950">
                  {item.phase}
                </div>
                <div className="mt-2 text-xs leading-5 text-zinc-600">
                  {item.implementationStep}
                </div>
                <div className="mt-2 break-all font-mono text-[11px] text-zinc-500">
                  {item.requiredGateBeforeExecution}
                </div>
                <div className="mt-2 rounded-md border border-rose-200 bg-rose-50 px-2 py-1 text-[11px] font-medium text-rose-700">
                  {item.forbiddenInThisSlice}
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="mt-4 rounded-lg border border-zinc-200 bg-white p-3">
          <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="text-xs font-medium uppercase text-zinc-500">
                HEU-Data-018 - Adapter test fixture contract
              </div>
              <div className="mt-1 text-sm font-semibold text-zinc-950">
                Hop dong fixture synthetic truoc khi mo DB read
              </div>
              <p className="mt-1 max-w-3xl text-xs leading-5 text-zinc-600">
                Fixture nay chi dinh nghia du lieu synthetic de test scope am,
                field allowlist va readonly status. Slice hien tai van khong
                tao database client, khong doc database, khong dung du lieu
                that, khong sua task, khong goi AI va khong deploy.
              </p>
            </div>
            <span className="inline-flex w-fit rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs font-medium text-zinc-700">
              {gateEvidence.adapterTestFixtureContract.mode}
            </span>
          </div>

          <div className="mt-3 grid gap-2 lg:grid-cols-5">
            {gateEvidence.adapterTestFixtureContract.items.map((item) => (
              <article
                key={item.code}
                className="rounded-md border border-zinc-200 bg-zinc-50 p-3"
                data-heu-task-center-adapter-test-fixture-item={item.code}
                data-heu-task-center-adapter-test-fixture-mode={item.fixtureMode}
                data-heu-task-center-adapter-test-fixture-lane={item.workspaceLane}
                data-heu-task-center-adapter-test-fixture-required={
                  item.requiredBeforeDbRead
                }
                data-heu-task-center-adapter-test-fixture-forbidden={
                  item.forbiddenInThisSlice
                }
              >
                <div className="font-mono text-[11px] text-zinc-500">
                  {item.code}
                </div>
                <div className="mt-1 text-sm font-semibold text-zinc-950">
                  {item.fixtureMode}
                </div>
                <div className="mt-2 break-all font-mono text-[11px] text-zinc-500">
                  {item.workspaceLane}
                </div>
                <div className="mt-2 text-xs leading-5 text-zinc-600">
                  {item.expectedResult}
                </div>
                <div className="mt-2 break-all font-mono text-[11px] text-zinc-500">
                  {item.requiredBeforeDbRead}
                </div>
                <div className="mt-2 rounded-md border border-rose-200 bg-rose-50 px-2 py-1 text-[11px] font-medium text-rose-700">
                  {item.forbiddenInThisSlice}
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="mt-4 rounded-lg border border-zinc-200 bg-white p-3">
          <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="text-xs font-medium uppercase text-zinc-500">
                HEU-Data-019 - Disabled runtime seam verification
              </div>
              <div className="mt-1 text-sm font-semibold text-zinc-950">
                Bang chung seam runtime van khoa truoc DB read
              </div>
              <p className="mt-1 max-w-3xl text-xs leading-5 text-zinc-600">
                Verification nay doi chieu adapter skeleton va UI fallback:
                adapter van DISABLED_BY_DEFAULT, fallback mock van active,
                adapterRows rong, khong co env bat adapter, khong doc DB,
                khong dung du lieu that va khong deploy.
              </p>
            </div>
            <span className="inline-flex w-fit rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs font-medium text-zinc-700">
              {gateEvidence.disabledRuntimeSeamVerification.mode}
            </span>
          </div>

          <div className="mt-3 grid gap-2 lg:grid-cols-5">
            {gateEvidence.disabledRuntimeSeamVerification.items.map((item) => (
              <article
                key={item.code}
                className="rounded-md border border-zinc-200 bg-zinc-50 p-3"
                data-heu-task-center-disabled-runtime-seam-item={item.code}
                data-heu-task-center-disabled-runtime-seam-state={item.seamState}
                data-heu-task-center-disabled-runtime-seam-required={
                  item.requiredBeforeEnablement
                }
                data-heu-task-center-disabled-runtime-seam-forbidden={
                  item.forbiddenInThisSlice
                }
              >
                <div className="font-mono text-[11px] text-zinc-500">
                  {item.code}
                </div>
                <div className="mt-1 text-sm font-semibold text-zinc-950">
                  {item.seamState}
                </div>
                <div className="mt-2 text-xs leading-5 text-zinc-600">
                  {item.verifiedRuntimeSeam}
                </div>
                <div className="mt-2 break-all font-mono text-[11px] text-zinc-500">
                  {item.requiredBeforeEnablement}
                </div>
                <div className="mt-2 rounded-md border border-rose-200 bg-rose-50 px-2 py-1 text-[11px] font-medium text-rose-700">
                  {item.forbiddenInThisSlice}
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="mt-4 rounded-lg border border-zinc-200 bg-white p-3">
          <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="text-xs font-medium uppercase text-zinc-500">
                HEU-Data-020 - Owner gate evidence matrix
              </div>
              <div className="mt-1 text-sm font-semibold text-zinc-950">
                Ma tran evidence owner truoc khi mo DB read
              </div>
              <p className="mt-1 max-w-3xl text-xs leading-5 text-zinc-600">
                Matrix nay chi liet ke evidence bat buoc cho IT_DATA, Audit,
                PHAP_CHE, owner phong ban va BGH. Tat ca lane van
                OWNER_EVIDENCE_REQUIRED, khong phe duyet, khong doc DB,
                khong dung du lieu that va khong deploy.
              </p>
            </div>
            <span className="inline-flex w-fit rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs font-medium text-zinc-700">
              {gateEvidence.ownerGateEvidenceMatrix.mode}
            </span>
          </div>

          <div className="mt-3 grid gap-2 lg:grid-cols-5">
            {gateEvidence.ownerGateEvidenceMatrix.items.map((item) => (
              <article
                key={item.code}
                className="rounded-md border border-zinc-200 bg-zinc-50 p-3"
                data-heu-task-center-owner-gate-evidence-item={item.code}
                data-heu-task-center-owner-gate-evidence-lane={item.ownerLane}
                data-heu-task-center-owner-gate-evidence-state={
                  item.evidenceState
                }
                data-heu-task-center-owner-gate-evidence-required={
                  item.requiredEvidenceCode
                }
                data-heu-task-center-owner-gate-evidence-blocker={
                  item.blocksDbReadUntil
                }
                data-heu-task-center-owner-gate-evidence-forbidden={
                  item.forbiddenInThisSlice
                }
              >
                <div className="font-mono text-[11px] text-zinc-500">
                  {item.code}
                </div>
                <div className="mt-1 text-sm font-semibold text-zinc-950">
                  {item.ownerLane}
                </div>
                <div className="mt-1 rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-[11px] font-medium text-amber-700">
                  {item.evidenceState}
                </div>
                <div className="mt-2 text-xs leading-5 text-zinc-600">
                  {item.passCondition}
                </div>
                <div className="mt-2 break-all font-mono text-[11px] text-zinc-500">
                  {item.requiredEvidenceCode}
                </div>
                <div className="mt-2 break-all font-mono text-[11px] text-zinc-500">
                  {item.blocksDbReadUntil}
                </div>
                <div className="mt-2 rounded-md border border-rose-200 bg-rose-50 px-2 py-1 text-[11px] font-medium text-rose-700">
                  {item.forbiddenInThisSlice}
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="mt-4 rounded-lg border border-zinc-200 bg-white p-3">
          <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="text-xs font-medium uppercase text-zinc-500">
                HEU-Data-021 - Adapter preflight checklist
              </div>
              <div className="mt-1 text-sm font-semibold text-zinc-950">
                Checklist truoc khi mo adapter doc DB
              </div>
              <p className="mt-1 max-w-3xl text-xs leading-5 text-zinc-600">
                Checklist nay chi gom cac dieu kien bat buoc truoc khi mo
                adapter doc DB. Tat ca dong van PREFLIGHT_REQUIRED, khong phe
                duyet, khong doc DB, khong tao client, khong bat env, khong
                dung du lieu that, khong goi AI va khong deploy.
              </p>
            </div>
            <span className="inline-flex w-fit rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs font-medium text-zinc-700">
              {gateEvidence.adapterPreflightChecklist.mode}
            </span>
          </div>

          <div className="mt-3 grid gap-2 lg:grid-cols-5">
            {gateEvidence.adapterPreflightChecklist.items.map((item) => (
              <article
                key={item.code}
                className="rounded-md border border-zinc-200 bg-zinc-50 p-3"
                data-heu-task-center-adapter-preflight-item={item.code}
                data-heu-task-center-adapter-preflight-owner={
                  item.checklistOwner
                }
                data-heu-task-center-adapter-preflight-state={
                  item.preflightState
                }
                data-heu-task-center-adapter-preflight-required={
                  item.requiredBeforeAdapterRead
                }
                data-heu-task-center-adapter-preflight-forbidden={
                  item.forbiddenInThisSlice
                }
              >
                <div className="font-mono text-[11px] text-zinc-500">
                  {item.code}
                </div>
                <div className="mt-1 text-sm font-semibold text-zinc-950">
                  {item.checklistOwner}
                </div>
                <div className="mt-1 rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-[11px] font-medium text-amber-700">
                  {item.preflightState}
                </div>
                <div className="mt-2 text-xs leading-5 text-zinc-600">
                  {item.passCondition}
                </div>
                <div className="mt-2 break-all font-mono text-[11px] text-zinc-500">
                  {item.requiredBeforeAdapterRead}
                </div>
                <div className="mt-2 rounded-md border border-rose-200 bg-rose-50 px-2 py-1 text-[11px] font-medium text-rose-700">
                  {item.forbiddenInThisSlice}
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="mt-4 rounded-lg border border-zinc-200 bg-white p-3">
          <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="text-xs font-medium uppercase text-zinc-500">
                HEU-Data-022 - Read-only adapter dry-run switch contract
              </div>
              <div className="mt-1 text-sm font-semibold text-zinc-950">
                Hop dong switch dry-run mac dinh OFF
              </div>
              <p className="mt-1 max-w-3xl text-xs leading-5 text-zinc-600">
                Contract nay chi mo ta dieu kien de thiet ke switch dry-run
                trong tuong lai. Switch van default OFF, khong bat env, khong
                tao DB client, khong doc DB, khong sua task, khong dung du
                lieu that, khong goi AI va khong deploy.
              </p>
            </div>
            <span className="inline-flex w-fit rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs font-medium text-zinc-700">
              {gateEvidence.readonlyAdapterDryRunSwitchContract.mode}
            </span>
          </div>

          <div className="mt-3 grid gap-2 lg:grid-cols-5">
            {gateEvidence.readonlyAdapterDryRunSwitchContract.items.map(
              (item) => (
                <article
                  key={item.code}
                  className="rounded-md border border-zinc-200 bg-zinc-50 p-3"
                  data-heu-task-center-dry-run-switch-contract-item={item.code}
                  data-heu-task-center-dry-run-switch-contract-owner={
                    item.contractOwner
                  }
                  data-heu-task-center-dry-run-switch-contract-state={
                    item.switchState
                  }
                  data-heu-task-center-dry-run-switch-contract-required={
                    item.requiredBeforeSwitch
                  }
                  data-heu-task-center-dry-run-switch-contract-forbidden={
                    item.forbiddenInThisSlice
                  }
                >
                  <div className="font-mono text-[11px] text-zinc-500">
                    {item.code}
                  </div>
                  <div className="mt-1 text-sm font-semibold text-zinc-950">
                    {item.contractOwner}
                  </div>
                  <div className="mt-1 rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-[11px] font-medium text-amber-700">
                    {item.switchState}
                  </div>
                  <div className="mt-2 text-xs leading-5 text-zinc-600">
                    {item.dryRunBehavior}
                  </div>
                  <div className="mt-2 break-all font-mono text-[11px] text-zinc-500">
                    {item.requiredBeforeSwitch}
                  </div>
                  <div className="mt-2 rounded-md border border-rose-200 bg-rose-50 px-2 py-1 text-[11px] font-medium text-rose-700">
                    {item.forbiddenInThisSlice}
                  </div>
                </article>
              ),
            )}
          </div>
        </div>

        <div className="mt-4 rounded-lg border border-zinc-200 bg-white p-3">
          <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="text-xs font-medium uppercase text-zinc-500">
                HEU-Data-023 - Dry-run env gate ledger
              </div>
              <div className="mt-1 text-sm font-semibold text-zinc-950">
                So gate env dry-run mac dinh DISABLED
              </div>
              <p className="mt-1 max-w-3xl text-xs leading-5 text-zinc-600">
                Ledger nay chi ghi nhan dieu kien truoc khi thiet ke env gate
                dry-run. Env gate van DISABLED_BY_DEFAULT, khong co env
                assignment, khong tao DB client, khong doc DB, khong sua task,
                khong dung du lieu that, khong goi AI va khong deploy.
              </p>
            </div>
            <span className="inline-flex w-fit rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs font-medium text-zinc-700">
              {gateEvidence.dryRunEnvGateLedger.mode}
            </span>
          </div>

          <div className="mt-3 grid gap-2 lg:grid-cols-5">
            {gateEvidence.dryRunEnvGateLedger.items.map((item) => (
              <article
                key={item.code}
                className="rounded-md border border-zinc-200 bg-zinc-50 p-3"
                data-heu-task-center-dry-run-env-gate-ledger-item={item.code}
                data-heu-task-center-dry-run-env-gate-ledger-owner={
                  item.gateOwner
                }
                data-heu-task-center-dry-run-env-gate-ledger-state={
                  item.gateState
                }
                data-heu-task-center-dry-run-env-gate-ledger-required={
                  item.requiredBeforeEnvEnablement
                }
                data-heu-task-center-dry-run-env-gate-ledger-forbidden={
                  item.forbiddenInThisSlice
                }
              >
                <div className="font-mono text-[11px] text-zinc-500">
                  {item.code}
                </div>
                <div className="mt-1 text-sm font-semibold text-zinc-950">
                  {item.gateOwner}
                </div>
                <div className="mt-1 rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-[11px] font-medium text-amber-700">
                  {item.gateState}
                </div>
                <div className="mt-2 text-xs leading-5 text-zinc-600">
                  {item.disabledDefaultEvidence}
                </div>
                <div className="mt-2 break-all font-mono text-[11px] text-zinc-500">
                  {item.requiredBeforeEnvEnablement}
                </div>
                <div className="mt-2 rounded-md border border-rose-200 bg-rose-50 px-2 py-1 text-[11px] font-medium text-rose-700">
                  {item.forbiddenInThisSlice}
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="mt-4 rounded-lg border border-zinc-200 bg-white p-3">
          <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="text-xs font-medium uppercase text-zinc-500">
                HEU-Data-024 - Adapter dry-run readiness review
              </div>
              <div className="mt-1 text-sm font-semibold text-zinc-950">
                Review dieu kien truoc khi bat dry-run adapter
              </div>
              <p className="mt-1 max-w-3xl text-xs leading-5 text-zinc-600">
                Review nay chi tong hop dieu kien owner can xac nhan truoc khi
                cho phep di tiep. Ket luan van NO-GO cho DB runtime: khong bat
                env, khong tao DB client, khong doc DB, khong sua task, khong
                dung du lieu that, khong goi AI va khong automation step.
              </p>
            </div>
            <div className="flex flex-col gap-1 text-xs">
              <span className="inline-flex w-fit rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 font-medium text-zinc-700">
                {gateEvidence.adapterDryRunReadinessReview.mode}
              </span>
              <span className="inline-flex w-fit rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 font-medium text-rose-700">
                {gateEvidence.adapterDryRunReadinessReview.readiness}
              </span>
            </div>
          </div>

          <div className="mt-3 grid gap-2 lg:grid-cols-5">
            {gateEvidence.adapterDryRunReadinessReview.items.map((item) => (
              <article
                key={item.code}
                className="rounded-md border border-zinc-200 bg-zinc-50 p-3"
                data-heu-task-center-adapter-dry-run-readiness-review-item={item.code}
                data-heu-task-center-adapter-dry-run-readiness-review-reviewer={
                  item.reviewer
                }
                data-heu-task-center-adapter-dry-run-readiness-review-state={
                  item.readinessState
                }
                data-heu-task-center-adapter-dry-run-readiness-review-required={
                  item.requiredEvidenceCode
                }
                data-heu-task-center-adapter-dry-run-readiness-review-stop-rule={
                  item.stopRule
                }
              >
                <div className="font-mono text-[11px] text-zinc-500">
                  {item.code}
                </div>
                <div className="mt-1 text-sm font-semibold text-zinc-950">
                  {item.reviewer}
                </div>
                <div className="mt-1 rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-[11px] font-medium text-amber-700">
                  {item.readinessState}
                </div>
                <div className="mt-2 break-all font-mono text-[11px] text-zinc-500">
                  {item.requiredEvidenceCode}
                </div>
                <div className="mt-2 rounded-md border border-rose-200 bg-rose-50 px-2 py-1 text-[11px] font-medium text-rose-700">
                  {item.stopRule}
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="mt-4 rounded-lg border border-zinc-200 bg-white p-3">
          <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="text-xs font-medium uppercase text-zinc-500">
                HEU-Data-025 - Static negative-access packet
              </div>
              <div className="mt-1 text-sm font-semibold text-zinc-950">
                Cac case chan truy cap truoc dry-run adapter
              </div>
              <p className="mt-1 max-w-3xl text-xs leading-5 text-zinc-600">
                Packet nay chi mo ta case negative-access can co bang chung
                truoc khi cho phep dry-run adapter. Van khong bat env, khong
                tao DB client, khong doc DB, khong sua task, khong dung du
                lieu that, khong goi AI va khong automation step.
              </p>
            </div>
            <div className="flex flex-col gap-1 text-xs">
              <span className="inline-flex w-fit rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 font-medium text-zinc-700">
                {gateEvidence.adapterDryRunStaticNegativeAccessPacket.mode}
              </span>
              <span className="inline-flex w-fit rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 font-medium text-emerald-700">
                {gateEvidence.adapterDryRunStaticNegativeAccessPacket.result}
              </span>
            </div>
          </div>

          <div className="mt-3 grid gap-2 lg:grid-cols-5">
            {gateEvidence.adapterDryRunStaticNegativeAccessPacket.items.map(
              (item) => (
                <article
                  key={item.code}
                  className="rounded-md border border-zinc-200 bg-zinc-50 p-3"
                  data-heu-task-center-adapter-dry-run-static-negative-access-packet-item={item.code}
                  data-heu-task-center-adapter-dry-run-static-negative-access-packet-reviewer={
                    item.reviewer
                  }
                  data-heu-task-center-adapter-dry-run-static-negative-access-packet-required={
                    item.requiredEvidenceCode
                  }
                  data-heu-task-center-adapter-dry-run-static-negative-access-packet-expected={
                    item.expectedResult
                  }
                  data-heu-task-center-adapter-dry-run-static-negative-access-packet-stop-rule={
                    item.stopRule
                  }
                >
                  <div className="font-mono text-[11px] text-zinc-500">
                    {item.code}
                  </div>
                  <div className="mt-1 text-sm font-semibold text-zinc-950">
                    {item.reviewer}
                  </div>
                  <div className="mt-2 text-xs leading-5 text-zinc-600">
                    {item.negativeScenario}
                  </div>
                  <div className="mt-2 break-all font-mono text-[11px] text-zinc-500">
                    {item.requiredEvidenceCode}
                  </div>
                  <div className="mt-2 rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-[11px] font-medium text-amber-700">
                    {item.expectedResult}
                  </div>
                  <div className="mt-2 rounded-md border border-rose-200 bg-rose-50 px-2 py-1 text-[11px] font-medium text-rose-700">
                    {item.stopRule}
                  </div>
                </article>
              ),
            )}
          </div>
        </div>

        <div className="mt-4 rounded-lg border border-zinc-200 bg-white p-3">
          <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="text-xs font-medium uppercase text-zinc-500">
                HEU-Data-026 - Readonly test-harness design
              </div>
              <div className="mt-1 text-sm font-semibold text-zinc-950">
                Thiet ke harness test scope truoc dry-run adapter
              </div>
              <p className="mt-1 max-w-3xl text-xs leading-5 text-zinc-600">
                Harness nay moi la thiet ke read-only cho fixture va assertion
                tong hop. Van khong bat env, khong tao DB client, khong doc DB,
                khong sua task, khong dung du lieu that, khong goi AI va khong
                automation step.
              </p>
            </div>
            <div className="flex flex-col gap-1 text-xs">
              <span className="inline-flex w-fit rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 font-medium text-zinc-700">
                {gateEvidence.adapterDryRunReadonlyTestHarnessDesign.mode}
              </span>
              <span className="inline-flex w-fit rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 font-medium text-emerald-700">
                {gateEvidence.adapterDryRunReadonlyTestHarnessDesign.result}
              </span>
            </div>
          </div>

          <div className="mt-3 grid gap-2 lg:grid-cols-3">
            {gateEvidence.adapterDryRunReadonlyTestHarnessDesign.items.map(
              (item) => (
                <article
                  key={item.code}
                  className="rounded-md border border-zinc-200 bg-zinc-50 p-3"
                  data-heu-task-center-adapter-dry-run-readonly-test-harness-design-item={item.code}
                  data-heu-task-center-adapter-dry-run-readonly-test-harness-design-reviewer={
                    item.reviewer
                  }
                  data-heu-task-center-adapter-dry-run-readonly-test-harness-design-fixture={
                    item.fixturePlan
                  }
                  data-heu-task-center-adapter-dry-run-readonly-test-harness-design-assertion={
                    item.assertionPlan
                  }
                  data-heu-task-center-adapter-dry-run-readonly-test-harness-design-stop-rule={
                    item.stopRule
                  }
                >
                  <div className="font-mono text-[11px] text-zinc-500">
                    {item.code}
                  </div>
                  <div className="mt-1 text-sm font-semibold text-zinc-950">
                    {item.reviewer}
                  </div>
                  <div className="mt-2 break-all font-mono text-[11px] text-zinc-500">
                    {item.fixturePlan}
                  </div>
                  <div className="mt-2 rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-[11px] font-medium text-amber-700">
                    {item.assertionPlan}
                  </div>
                  <div className="mt-2 rounded-md border border-rose-200 bg-rose-50 px-2 py-1 text-[11px] font-medium text-rose-700">
                    {item.stopRule}
                  </div>
                </article>
              ),
            )}
          </div>
        </div>

        <div className="mt-4 rounded-lg border border-zinc-200 bg-white p-3">
          <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="text-xs font-medium uppercase text-zinc-500">
                HEU-Data-027 - Synthetic fixture contract
              </div>
              <div className="mt-1 text-sm font-semibold text-zinc-950">
                Hop dong fixture gia lap cho dry-run harness
              </div>
              <p className="mt-1 max-w-3xl text-xs leading-5 text-zinc-600">
                Contract nay chi khoa actor, task metadata va assertion fixture
                bang du lieu gia lap. Van khong tao fixture runtime, khong bat
                env, khong tao DB client, khong doc DB, khong dung du lieu
                that, khong goi AI va khong automation step.
              </p>
            </div>
            <div className="flex flex-col gap-1 text-xs">
              <span className="inline-flex w-fit rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 font-medium text-zinc-700">
                {gateEvidence.adapterDryRunSyntheticFixtureContract.mode}
              </span>
              <span className="inline-flex w-fit rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 font-medium text-emerald-700">
                {gateEvidence.adapterDryRunSyntheticFixtureContract.result}
              </span>
            </div>
          </div>

          <div className="mt-3 grid gap-2 lg:grid-cols-5">
            {gateEvidence.adapterDryRunSyntheticFixtureContract.items.map(
              (item) => (
                <article
                  key={item.code}
                  className="rounded-md border border-zinc-200 bg-zinc-50 p-3"
                  data-heu-task-center-adapter-dry-run-synthetic-fixture-contract-item={item.code}
                  data-heu-task-center-adapter-dry-run-synthetic-fixture-contract-reviewer={
                    item.reviewer
                  }
                  data-heu-task-center-adapter-dry-run-synthetic-fixture-contract-actor={
                    item.actorFixture
                  }
                  data-heu-task-center-adapter-dry-run-synthetic-fixture-contract-task={
                    item.taskFixture
                  }
                  data-heu-task-center-adapter-dry-run-synthetic-fixture-contract-assertion={
                    item.assertionFixture
                  }
                  data-heu-task-center-adapter-dry-run-synthetic-fixture-contract-stop-rule={
                    item.stopRule
                  }
                >
                  <div className="font-mono text-[11px] text-zinc-500">
                    {item.code}
                  </div>
                  <div className="mt-1 text-sm font-semibold text-zinc-950">
                    {item.reviewer}
                  </div>
                  <div className="mt-2 break-all font-mono text-[11px] text-zinc-500">
                    {item.actorFixture}
                  </div>
                  <div className="mt-2 break-all font-mono text-[11px] text-zinc-500">
                    {item.taskFixture}
                  </div>
                  <div className="mt-2 rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-[11px] font-medium text-amber-700">
                    {item.assertionFixture}
                  </div>
                  <div className="mt-2 rounded-md border border-rose-200 bg-rose-50 px-2 py-1 text-[11px] font-medium text-rose-700">
                    {item.stopRule}
                  </div>
                </article>
              ),
            )}
          </div>
        </div>

        <div className="mt-4 rounded-lg border border-zinc-200 bg-white p-3">
          <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="text-xs font-medium uppercase text-zinc-500">
                HEU-Data-028 - Synthetic fixture runner plan
              </div>
              <div className="mt-1 text-sm font-semibold text-zinc-950">
                Ke hoach runner gia lap, chua tao runner executable
              </div>
              <p className="mt-1 max-w-3xl text-xs leading-5 text-zinc-600">
                Plan nay chi khoa thu tu load contract, validate assertion va
                report PASS/NO-GO local. Van khong tao runner file, khong bat
                env, khong tao DB client, khong doc DB, khong dung du lieu
                that, khong goi AI va khong automation step.
              </p>
            </div>
            <div className="flex flex-col gap-1 text-xs">
              <span className="inline-flex w-fit rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 font-medium text-zinc-700">
                {gateEvidence.adapterDryRunSyntheticFixtureRunnerPlan.mode}
              </span>
              <span className="inline-flex w-fit rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 font-medium text-emerald-700">
                {gateEvidence.adapterDryRunSyntheticFixtureRunnerPlan.result}
              </span>
            </div>
          </div>

          <div className="mt-3 grid gap-2 lg:grid-cols-5">
            {gateEvidence.adapterDryRunSyntheticFixtureRunnerPlan.items.map(
              (item) => (
                <article
                  key={item.code}
                  className="rounded-md border border-zinc-200 bg-zinc-50 p-3"
                  data-heu-task-center-adapter-dry-run-synthetic-fixture-runner-plan-item={item.code}
                  data-heu-task-center-adapter-dry-run-synthetic-fixture-runner-plan-reviewer={
                    item.reviewer
                  }
                  data-heu-task-center-adapter-dry-run-synthetic-fixture-runner-plan-step={
                    item.runnerStep
                  }
                  data-heu-task-center-adapter-dry-run-synthetic-fixture-runner-plan-input={
                    item.inputContract
                  }
                  data-heu-task-center-adapter-dry-run-synthetic-fixture-runner-plan-output={
                    item.outputContract
                  }
                  data-heu-task-center-adapter-dry-run-synthetic-fixture-runner-plan-stop-rule={
                    item.stopRule
                  }
                >
                  <div className="font-mono text-[11px] text-zinc-500">
                    {item.code}
                  </div>
                  <div className="mt-1 text-sm font-semibold text-zinc-950">
                    {item.reviewer}
                  </div>
                  <div className="mt-2 break-all font-mono text-[11px] text-zinc-500">
                    {item.runnerStep}
                  </div>
                  <div className="mt-2 break-all font-mono text-[11px] text-zinc-500">
                    {item.inputContract}
                  </div>
                  <div className="mt-2 rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-[11px] font-medium text-amber-700">
                    {item.outputContract}
                  </div>
                  <div className="mt-2 rounded-md border border-rose-200 bg-rose-50 px-2 py-1 text-[11px] font-medium text-rose-700">
                    {item.stopRule}
                  </div>
                </article>
              ),
            )}
          </div>
        </div>

        <div className="mt-4 rounded-lg border border-zinc-200 bg-white p-3">
          <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="text-xs font-medium uppercase text-zinc-500">
                HEU-Data-029 - Runner static-check design
              </div>
              <div className="mt-1 text-sm font-semibold text-zinc-950">
                Thiet ke static-check cho runner dry-run
              </div>
              <p className="mt-1 max-w-3xl text-xs leading-5 text-zinc-600">
                Design nay chi khoa cac assert tinh truoc khi co runner
                candidate. Van khong tao runner executable, khong bat env,
                khong tao DB client, khong doc DB, khong dung du lieu that,
                khong goi AI va khong automation step.
              </p>
            </div>
            <div className="flex flex-col gap-1 text-xs">
              <span className="inline-flex w-fit rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 font-medium text-zinc-700">
                {gateEvidence.adapterDryRunRunnerStaticCheckDesign.mode}
              </span>
              <span className="inline-flex w-fit rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 font-medium text-emerald-700">
                {gateEvidence.adapterDryRunRunnerStaticCheckDesign.result}
              </span>
            </div>
          </div>

          <div className="mt-3 grid gap-2 lg:grid-cols-5">
            {gateEvidence.adapterDryRunRunnerStaticCheckDesign.items.map(
              (item) => (
                <article
                  key={item.code}
                  className="rounded-md border border-zinc-200 bg-zinc-50 p-3"
                  data-heu-task-center-adapter-dry-run-runner-static-check-design-item={item.code}
                  data-heu-task-center-adapter-dry-run-runner-static-check-design-reviewer={
                    item.reviewer
                  }
                  data-heu-task-center-adapter-dry-run-runner-static-check-design-check={
                    item.staticCheck
                  }
                  data-heu-task-center-adapter-dry-run-runner-static-check-design-input={
                    item.inputSource
                  }
                  data-heu-task-center-adapter-dry-run-runner-static-check-design-output={
                    item.expectedOutput
                  }
                  data-heu-task-center-adapter-dry-run-runner-static-check-design-stop-rule={
                    item.stopRule
                  }
                >
                  <div className="font-mono text-[11px] text-zinc-500">
                    {item.code}
                  </div>
                  <div className="mt-1 text-sm font-semibold text-zinc-950">
                    {item.reviewer}
                  </div>
                  <div className="mt-2 break-all font-mono text-[11px] text-zinc-500">
                    {item.staticCheck}
                  </div>
                  <div className="mt-2 break-all font-mono text-[11px] text-zinc-500">
                    {item.inputSource}
                  </div>
                  <div className="mt-2 rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-[11px] font-medium text-amber-700">
                    {item.expectedOutput}
                  </div>
                  <div className="mt-2 rounded-md border border-rose-200 bg-rose-50 px-2 py-1 text-[11px] font-medium text-rose-700">
                    {item.stopRule}
                  </div>
                </article>
              ),
            )}
          </div>
        </div>

        <div className="mt-4 rounded-lg border border-zinc-200 bg-white p-3">
          <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="text-xs font-medium uppercase text-zinc-500">
                HEU-Data-030 - Local runner candidate readiness
              </div>
              <div className="mt-1 text-sm font-semibold text-zinc-950">
                Khoa dieu kien truoc khi tao runner local
              </div>
              <p className="mt-1 max-w-3xl text-xs leading-5 text-zinc-600">
                Readiness nay chi xac nhan chuoi fixture, runner plan va
                static-check da du dieu kien truoc khi tao runner candidate.
                Van khong tao runner executable, khong bat env, khong tao DB
                client, khong doc DB, khong dung du lieu that, khong goi AI va
                khong automation step.
              </p>
            </div>
            <div className="flex flex-col gap-1 text-xs">
              <span className="inline-flex w-fit rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 font-medium text-zinc-700">
                {gateEvidence.adapterDryRunLocalRunnerCandidateReadiness.mode}
              </span>
              <span className="inline-flex w-fit rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 font-medium text-emerald-700">
                {gateEvidence.adapterDryRunLocalRunnerCandidateReadiness.result}
              </span>
            </div>
          </div>

          <div className="mt-3 grid gap-2 lg:grid-cols-5">
            {gateEvidence.adapterDryRunLocalRunnerCandidateReadiness.items.map(
              (item) => (
                <article
                  key={item.code}
                  className="rounded-md border border-zinc-200 bg-zinc-50 p-3"
                  data-heu-task-center-adapter-dry-run-local-runner-candidate-readiness-item={item.code}
                  data-heu-task-center-adapter-dry-run-local-runner-candidate-readiness-reviewer={
                    item.reviewer
                  }
                  data-heu-task-center-adapter-dry-run-local-runner-candidate-readiness-gate={
                    item.readinessGate
                  }
                  data-heu-task-center-adapter-dry-run-local-runner-candidate-readiness-prerequisite={
                    item.prerequisite
                  }
                  data-heu-task-center-adapter-dry-run-local-runner-candidate-readiness-evidence={
                    item.expectedEvidence
                  }
                  data-heu-task-center-adapter-dry-run-local-runner-candidate-readiness-stop-rule={
                    item.stopRule
                  }
                >
                  <div className="font-mono text-[11px] text-zinc-500">
                    {item.code}
                  </div>
                  <div className="mt-1 text-sm font-semibold text-zinc-950">
                    {item.reviewer}
                  </div>
                  <div className="mt-2 break-all font-mono text-[11px] text-zinc-500">
                    {item.readinessGate}
                  </div>
                  <div className="mt-2 break-all font-mono text-[11px] text-zinc-500">
                    {item.prerequisite}
                  </div>
                  <div className="mt-2 rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-[11px] font-medium text-amber-700">
                    {item.expectedEvidence}
                  </div>
                  <div className="mt-2 rounded-md border border-rose-200 bg-rose-50 px-2 py-1 text-[11px] font-medium text-rose-700">
                    {item.stopRule}
                  </div>
                </article>
              ),
            )}
          </div>
        </div>

        <div className="mt-4 rounded-lg border border-zinc-200 bg-white p-3">
          <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="text-xs font-medium uppercase text-zinc-500">
                HEU-Data-031 - Local runner script draft
              </div>
              <div className="mt-1 text-sm font-semibold text-zinc-950">
                Runner local synthetic, chi in report
              </div>
              <p className="mt-1 max-w-3xl text-xs leading-5 text-zinc-600">
                Runner script nay chi chay deterministic local tren fixture
                synthetic in-memory va in PASS/NO-GO report. Van khong bat env,
                khong tao DB client, khong doc DB, khong ghi task, khong dung
                du lieu that, khong goi AI va khong automation step.
              </p>
            </div>
            <div className="flex flex-col gap-1 text-xs">
              <span className="inline-flex w-fit rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 font-medium text-zinc-700">
                {gateEvidence.adapterDryRunLocalRunnerScriptDraft.mode}
              </span>
              <span className="inline-flex w-fit rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 font-medium text-emerald-700">
                {gateEvidence.adapterDryRunLocalRunnerScriptDraft.result}
              </span>
            </div>
          </div>

          <div className="mt-3 grid gap-2 lg:grid-cols-5">
            {gateEvidence.adapterDryRunLocalRunnerScriptDraft.items.map(
              (item) => (
                <article
                  key={item.code}
                  className="rounded-md border border-zinc-200 bg-zinc-50 p-3"
                  data-heu-task-center-adapter-dry-run-local-runner-script-draft-item={item.code}
                  data-heu-task-center-adapter-dry-run-local-runner-script-draft-reviewer={
                    item.reviewer
                  }
                  data-heu-task-center-adapter-dry-run-local-runner-script-draft-assertion={
                    item.runnerAssertion
                  }
                  data-heu-task-center-adapter-dry-run-local-runner-script-draft-input={
                    item.syntheticInput
                  }
                  data-heu-task-center-adapter-dry-run-local-runner-script-draft-report={
                    item.expectedReport
                  }
                  data-heu-task-center-adapter-dry-run-local-runner-script-draft-stop-rule={
                    item.stopRule
                  }
                >
                  <div className="font-mono text-[11px] text-zinc-500">
                    {item.code}
                  </div>
                  <div className="mt-1 text-sm font-semibold text-zinc-950">
                    {item.reviewer}
                  </div>
                  <div className="mt-2 break-all font-mono text-[11px] text-zinc-500">
                    {item.runnerAssertion}
                  </div>
                  <div className="mt-2 break-all font-mono text-[11px] text-zinc-500">
                    {item.syntheticInput}
                  </div>
                  <div className="mt-2 rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-[11px] font-medium text-amber-700">
                    {item.expectedReport}
                  </div>
                  <div className="mt-2 rounded-md border border-rose-200 bg-rose-50 px-2 py-1 text-[11px] font-medium text-rose-700">
                    {item.stopRule}
                  </div>
                </article>
              ),
            )}
          </div>
        </div>

        <div className="mt-4 rounded-lg border border-zinc-200 bg-white p-3">
          <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="text-xs font-medium uppercase text-zinc-500">
                HEU-Data-032 - Runner output ledger
              </div>
              <div className="mt-1 text-sm font-semibold text-zinc-950">
                Ledger chi doc output runner local
              </div>
              <p className="mt-1 max-w-3xl text-xs leading-5 text-zinc-600">
                Ledger nay chi khoa cac truong output can doc tu runner local
                synthetic. No khong ghi file, khong tao DB client, khong doc
                DB, khong ghi task, khong dung du lieu that, khong goi AI va
                khong automation step.
              </p>
            </div>
            <div className="flex flex-col gap-1 text-xs">
              <span className="inline-flex w-fit rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 font-medium text-zinc-700">
                {gateEvidence.adapterDryRunRunnerOutputLedger.mode}
              </span>
              <span className="inline-flex w-fit rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 font-medium text-emerald-700">
                {gateEvidence.adapterDryRunRunnerOutputLedger.result}
              </span>
            </div>
          </div>

          <div className="mt-3 grid gap-2 lg:grid-cols-5">
            {gateEvidence.adapterDryRunRunnerOutputLedger.items.map((item) => (
              <article
                key={item.code}
                className="rounded-md border border-zinc-200 bg-zinc-50 p-3"
                data-heu-task-center-adapter-dry-run-runner-output-ledger-item={item.code}
                data-heu-task-center-adapter-dry-run-runner-output-ledger-reviewer={
                  item.reviewer
                }
                data-heu-task-center-adapter-dry-run-runner-output-ledger-field={
                  item.ledgerField
                }
                data-heu-task-center-adapter-dry-run-runner-output-ledger-token={
                  item.expectedToken
                }
                data-heu-task-center-adapter-dry-run-runner-output-ledger-report={
                  item.sourceReport
                }
                data-heu-task-center-adapter-dry-run-runner-output-ledger-stop-rule={
                  item.stopRule
                }
              >
                <div className="font-mono text-[11px] text-zinc-500">
                  {item.code}
                </div>
                <div className="mt-1 text-sm font-semibold text-zinc-950">
                  {item.reviewer}
                </div>
                <div className="mt-2 break-all font-mono text-[11px] text-zinc-500">
                  {item.ledgerField}
                </div>
                <div className="mt-2 break-all font-mono text-[11px] text-zinc-500">
                  {item.expectedToken}
                </div>
                <div className="mt-2 rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-[11px] font-medium text-amber-700">
                  {item.sourceReport}
                </div>
                <div className="mt-2 rounded-md border border-rose-200 bg-rose-50 px-2 py-1 text-[11px] font-medium text-rose-700">
                  {item.stopRule}
                </div>
              </article>
            ))}
          </div>
        </div>

        <div
          className="mt-4 rounded-lg border border-zinc-200 bg-white p-3"
          data-heu-task-center-adapter-dry-run-output-ledger-static-snapshot-codes={outputLedgerStaticSnapshotCodes.join(
            "|",
          )}
        >
          <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="text-xs font-medium uppercase text-zinc-500">
                HEU-Data-033 - Output ledger static snapshot
              </div>
              <div className="mt-1 text-sm font-semibold text-zinc-950">
                Snapshot tinh de doi chieu output ledger
              </div>
              <p className="mt-1 max-w-3xl text-xs leading-5 text-zinc-600">
                Snapshot nay chi la bang doi chieu tinh trong source/UI/checker.
                No khong ghi file snapshot, khong doc DB, khong tao DB client,
                khong ghi task, khong dung du lieu that, khong goi AI va khong
                automation step.
              </p>
            </div>
            <div className="flex flex-col gap-1 text-xs">
              <span className="inline-flex w-fit rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 font-medium text-zinc-700">
                {gateEvidence.adapterDryRunOutputLedgerStaticSnapshot.mode}
              </span>
              <span className="inline-flex w-fit rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 font-medium text-emerald-700">
                {gateEvidence.adapterDryRunOutputLedgerStaticSnapshot.result}
              </span>
            </div>
          </div>

          <div className="mt-3 grid gap-2 lg:grid-cols-5">
            {gateEvidence.adapterDryRunOutputLedgerStaticSnapshot.items.map(
              (item) => (
                <article
                  key={item.code}
                  className="rounded-md border border-zinc-200 bg-zinc-50 p-3"
                  data-heu-task-center-adapter-dry-run-output-ledger-static-snapshot-item={
                    item.code
                  }
                  data-heu-task-center-adapter-dry-run-output-ledger-static-snapshot-reviewer={
                    item.reviewer
                  }
                  data-heu-task-center-adapter-dry-run-output-ledger-static-snapshot-field={
                    item.snapshotField
                  }
                  data-heu-task-center-adapter-dry-run-output-ledger-static-snapshot-value={
                    item.expectedValue
                  }
                  data-heu-task-center-adapter-dry-run-output-ledger-static-snapshot-source-row={
                    item.sourceLedgerRow
                  }
                  data-heu-task-center-adapter-dry-run-output-ledger-static-snapshot-stop-rule={
                    item.stopRule
                  }
                >
                  <div className="font-mono text-[11px] text-zinc-500">
                    {item.code}
                  </div>
                  <div className="mt-1 text-sm font-semibold text-zinc-950">
                    {item.reviewer}
                  </div>
                  <div className="mt-2 break-all font-mono text-[11px] text-zinc-500">
                    {item.snapshotField}
                  </div>
                  <div className="mt-2 break-all font-mono text-[11px] text-zinc-500">
                    {item.expectedValue}
                  </div>
                  <div className="mt-2 rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-[11px] font-medium text-amber-700">
                    {item.sourceLedgerRow}
                  </div>
                  <div className="mt-2 rounded-md border border-rose-200 bg-rose-50 px-2 py-1 text-[11px] font-medium text-rose-700">
                    {item.stopRule}
                  </div>
                </article>
              ),
            )}
          </div>
        </div>

        <div
          className="mt-4 rounded-lg border border-zinc-200 bg-white p-3"
          data-heu-task-center-adapter-dry-run-review-decision-packet-codes={reviewDecisionPacketCodes.join(
            "|",
          )}
        >
          <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="text-xs font-medium uppercase text-zinc-500">
                HEU-Data-034 - Review decision packet
              </div>
              <div className="mt-1 text-sm font-semibold text-zinc-950">
                Goi cau hoi review truoc khi xet DB read
              </div>
              <p className="mt-1 max-w-3xl text-xs leading-5 text-zinc-600">
                Packet nay chi gom cau hoi review va dieu kien chan. Moi dong
                deu giu `REVIEW_REQUIRED_NO_GO`, khong phe duyet owner GO,
                khong ghi file, khong doc DB, khong tao task, khong dung du
                lieu that, khong goi AI va khong automation step.
              </p>
            </div>
            <div className="flex flex-col gap-1 text-xs">
              <span className="inline-flex w-fit rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 font-medium text-zinc-700">
                {gateEvidence.adapterDryRunReviewDecisionPacket.mode}
              </span>
              <span className="inline-flex w-fit rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 font-medium text-emerald-700">
                {gateEvidence.adapterDryRunReviewDecisionPacket.result}
              </span>
            </div>
          </div>

          <div className="mt-3 grid gap-2 lg:grid-cols-5">
            {gateEvidence.adapterDryRunReviewDecisionPacket.items.map(
              (item) => (
                <article
                  key={item.code}
                  className="rounded-md border border-zinc-200 bg-zinc-50 p-3"
                  data-heu-task-center-adapter-dry-run-review-decision-packet-item={
                    item.code
                  }
                  data-heu-task-center-adapter-dry-run-review-decision-packet-reviewer={
                    item.reviewer
                  }
                  data-heu-task-center-adapter-dry-run-review-decision-packet-decision-state={
                    item.decisionState
                  }
                  data-heu-task-center-adapter-dry-run-review-decision-packet-question={
                    item.reviewQuestion
                  }
                  data-heu-task-center-adapter-dry-run-review-decision-packet-required-before-db-read={
                    item.requiredBeforeDbRead
                  }
                  data-heu-task-center-adapter-dry-run-review-decision-packet-stop-rule={
                    item.stopRule
                  }
                >
                  <div className="font-mono text-[11px] text-zinc-500">
                    {item.code}
                  </div>
                  <div className="mt-1 text-sm font-semibold text-zinc-950">
                    {item.reviewer}
                  </div>
                  <div className="mt-2 rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-[11px] font-medium text-amber-700">
                    {item.decisionState}
                  </div>
                  <div className="mt-2 text-xs leading-5 text-zinc-600">
                    {item.reviewQuestion}
                  </div>
                  <div className="mt-2 break-all font-mono text-[11px] text-zinc-500">
                    {item.requiredBeforeDbRead}
                  </div>
                  <div className="mt-2 rounded-md border border-rose-200 bg-rose-50 px-2 py-1 text-[11px] font-medium text-rose-700">
                    {item.stopRule}
                  </div>
                </article>
              ),
            )}
          </div>
        </div>

        <div
          className="mt-4 rounded-lg border border-zinc-200 bg-white p-3"
          data-heu-task-center-adapter-dry-run-db-read-go-no-go-precheck-codes={dbReadGoNoGoPrecheckCodes.join(
            "|",
          )}
        >
          <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="text-xs font-medium uppercase text-zinc-500">
                HEU-Data-035 - DB read GO/NO-GO precheck
              </div>
              <div className="mt-1 text-sm font-semibold text-zinc-950">
                Precheck NO-GO truoc khi xet DB read
              </div>
              <p className="mt-1 max-w-3xl text-xs leading-5 text-zinc-600">
                Precheck nay chi gom bang owner evidence va stop rule truoc khi
                xet DB read. Moi dong van la
                `NO_GO_REQUIRES_OWNER_DECISION`, khong owner approval, khong
                tao DB client, khong doc DB, khong ghi file, khong sua task,
                khong dung du lieu that, khong goi AI va khong automation step.
              </p>
            </div>
            <div className="flex flex-col gap-1 text-xs">
              <span className="inline-flex w-fit rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 font-medium text-zinc-700">
                {gateEvidence.adapterDryRunDbReadGoNoGoPrecheck.mode}
              </span>
              <span className="inline-flex w-fit rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 font-medium text-emerald-700">
                {gateEvidence.adapterDryRunDbReadGoNoGoPrecheck.result}
              </span>
            </div>
          </div>

          <div className="mt-3 grid gap-2 lg:grid-cols-5">
            {gateEvidence.adapterDryRunDbReadGoNoGoPrecheck.items.map(
              (item) => (
                <article
                  key={item.code}
                  className="rounded-md border border-zinc-200 bg-zinc-50 p-3"
                  data-heu-task-center-adapter-dry-run-db-read-go-no-go-precheck-item={
                    item.code
                  }
                  data-heu-task-center-adapter-dry-run-db-read-go-no-go-precheck-reviewer={
                    item.reviewer
                  }
                  data-heu-task-center-adapter-dry-run-db-read-go-no-go-precheck-go-no-go={
                    item.goNoGo
                  }
                  data-heu-task-center-adapter-dry-run-db-read-go-no-go-precheck-required-evidence={
                    item.requiredEvidence
                  }
                  data-heu-task-center-adapter-dry-run-db-read-go-no-go-precheck-blocked-action={
                    item.blockedAction
                  }
                  data-heu-task-center-adapter-dry-run-db-read-go-no-go-precheck-stop-rule={
                    item.stopRule
                  }
                >
                  <div className="font-mono text-[11px] text-zinc-500">
                    {item.code}
                  </div>
                  <div className="mt-1 text-sm font-semibold text-zinc-950">
                    {item.reviewer}
                  </div>
                  <div className="mt-2 rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-[11px] font-medium text-amber-700">
                    {item.goNoGo}
                  </div>
                  <div className="mt-2 break-all font-mono text-[11px] text-zinc-500">
                    {item.requiredEvidence}
                  </div>
                  <div className="mt-2 break-all font-mono text-[11px] text-zinc-500">
                    {item.blockedAction}
                  </div>
                  <div className="mt-2 rounded-md border border-rose-200 bg-rose-50 px-2 py-1 text-[11px] font-medium text-rose-700">
                    {item.stopRule}
                  </div>
                </article>
              ),
            )}
          </div>
        </div>
      </div>

      <div
        className="border-t border-zinc-200 p-5"
        data-heu-task-center-mock-readonly-list={TASK_CENTER_MOCK_READONLY_LIST}
        data-heu-task-center-mock-boundary={TASK_CENTER_MOCK_DATA_ONLY}
        data-heu-task-center-mock-mutation={TASK_CENTER_NO_TASK_MUTATION}
        data-heu-task-center-mock-cost-guard={TASK_CENTER_NO_AI_OR_AUTOMATION}
        data-heu-task-center-ui-fallback-wiring={TASK_CENTER_UI_FALLBACK_WIRING_ONLY}
        data-heu-task-center-ui-fallback-source={TASK_CENTER_MOCK_READONLY_FALLBACK_ACTIVE}
        data-heu-task-center-disabled-adapter-output={TASK_CENTER_DISABLED_ADAPTER_OUTPUT_ONLY}
        data-heu-task-center-ui-fallback-no-database-client={TASK_CENTER_UI_FALLBACK_NO_DATABASE_CLIENT}
        data-heu-task-center-ui-fallback-no-database-read={TASK_CENTER_UI_FALLBACK_NO_DATABASE_READ}
      >
        <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs font-medium uppercase text-zinc-500">
              HEU-Data-009 - UI fallback wiring
            </p>
            <h3 className="mt-1 text-sm font-semibold text-zinc-950">
              Task mau theo lane dang hien
            </h3>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-zinc-600">
              Danh sach mau chi de UAT UI/scope; khong phai task that. UI
              dang di qua fallback source: adapter skeleton bi khoa mac dinh,
              nen hien mock data va khong doc database, khong goi AI, khong
              tao automation va khong co nut sua/duyet.
            </p>
          </div>
          <div className="flex flex-col gap-1 text-xs">
            <span className="inline-flex w-fit rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 font-medium text-sky-700">
              {taskFallback.dataSource}
            </span>
            <span className="text-zinc-500">
              Adapter: {taskFallback.adapterStatus}
            </span>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-zinc-200">
          <div className="grid grid-cols-[minmax(9rem,1fr)_minmax(13rem,2fr)_minmax(8rem,1fr)_minmax(10rem,1.4fr)_minmax(8rem,1fr)] gap-0 bg-zinc-100 px-3 py-2 text-xs font-medium uppercase text-zinc-500 max-lg:hidden">
            <div>Status</div>
            <div>Task</div>
            <div>Phong</div>
            <div>Ref</div>
            <div>Owner/Due</div>
          </div>
          <div className="divide-y divide-zinc-200 bg-white">
            {mockTasks.map((task) => (
              <article
                key={task.taskId}
                className="grid gap-3 px-3 py-3 text-sm lg:grid-cols-[minmax(9rem,1fr)_minmax(13rem,2fr)_minmax(8rem,1fr)_minmax(10rem,1.4fr)_minmax(8rem,1fr)]"
                data-heu-task-center-mock-task-id={task.taskId}
                data-heu-task-center-mock-lane={task.laneId}
              >
                <div>
                  <span className="inline-flex rounded-full border border-zinc-200 bg-zinc-50 px-2 py-1 text-xs font-medium text-zinc-700">
                    {task.status}
                  </span>
                  <div className="mt-1 text-xs text-zinc-500">
                    {task.priority}
                  </div>
                </div>
                <div>
                  <div className="font-medium text-zinc-950">{task.title}</div>
                  <div className="mt-1 text-xs leading-5 text-zinc-500">
                    {task.safeSummary}
                  </div>
                </div>
                <div className="text-zinc-700">
                  {task.departmentCode}
                  <div className="mt-1 text-xs text-zinc-500">
                    {task.sourceModule}
                  </div>
                </div>
                <div className="font-mono text-xs text-zinc-600">
                  <div>{task.sourceRefType}</div>
                  <div className="mt-1 break-all">{task.sourceRefId}</div>
                  {task.controlledEvidenceId ? (
                    <div className="mt-1 text-zinc-500">
                      {task.controlledEvidenceId}
                    </div>
                  ) : null}
                </div>
                <div className="text-zinc-700">
                  {task.ownerHint}
                  <div className="mt-1 text-xs text-zinc-500">
                    {task.dueLabel}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-zinc-200 bg-zinc-50 p-5">
        <div className="flex items-start gap-3 text-sm text-zinc-600">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600" />
          <p>
            Khong dung inbox nay de phe duyet, sua du lieu that, tinh cong no,
            tinh COM, chap nhan evidence hoac mo production. Day chi la MVP de
            user nhin thay cong viec dung lane truoc khi noi bang Task Center
            that.
          </p>
        </div>
      </div>
    </section>
  );
}
