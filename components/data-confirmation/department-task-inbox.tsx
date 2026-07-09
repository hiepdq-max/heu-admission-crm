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
  getMockTaskCenterTasksForLanes,
  TASK_CENTER_MOCK_DATA_ONLY,
  TASK_CENTER_MOCK_READONLY_LIST,
  TASK_CENTER_NO_AI_OR_AUTOMATION,
  TASK_CENTER_NO_TASK_MUTATION,
} from "@/lib/task-center-mock-read-model";
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
  const mockTasks = getMockTaskCenterTasksForLanes(inboxLanes);

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
        data-heu-task-center-mock-readonly-list={TASK_CENTER_MOCK_READONLY_LIST}
        data-heu-task-center-mock-boundary={TASK_CENTER_MOCK_DATA_ONLY}
        data-heu-task-center-mock-mutation={TASK_CENTER_NO_TASK_MUTATION}
        data-heu-task-center-mock-cost-guard={TASK_CENTER_NO_AI_OR_AUTOMATION}
      >
        <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs font-medium uppercase text-zinc-500">
              HEU-Data-006 - Mock read-only list
            </p>
            <h3 className="mt-1 text-sm font-semibold text-zinc-950">
              Task mau theo lane dang hien
            </h3>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-zinc-600">
              Danh sach mau chi de UAT UI/scope; khong phai task that. Du
              lieu nay khong doc database, khong goi AI, khong tao automation
              va khong co nut sua/duyet.
            </p>
          </div>
          <span className="inline-flex w-fit rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-xs font-medium text-sky-700">
            {TASK_CENTER_MOCK_DATA_ONLY}
          </span>
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
