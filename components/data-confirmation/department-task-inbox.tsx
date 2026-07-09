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
