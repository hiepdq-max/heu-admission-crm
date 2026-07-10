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

        <div className="mt-4 rounded-lg border border-zinc-200 bg-white p-3">
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
