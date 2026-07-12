import { Database, ShieldAlert } from "lucide-react";

import type { TaskCenterLiveReadonlyResult } from "@/lib/task-center-live-readonly-adapter";

type TaskCenterLiveReadonlyListProps = {
  result: TaskCenterLiveReadonlyResult;
};

export function TaskCenterLiveReadonlyList({
  result,
}: TaskCenterLiveReadonlyListProps) {
  if (result.status !== "READY") {
    return (
      <section
        className="rounded-lg border border-zinc-200 bg-zinc-50 p-4"
        data-heu-task-center-live-readonly-status={result.status}
        data-heu-task-center-live-readonly-boundary="FAIL_CLOSED_FALLBACK_ONLY"
      >
        <div className="flex items-start gap-3 text-sm text-zinc-600">
          <ShieldAlert className="mt-0.5 size-4 shrink-0 text-amber-600" />
          <div>
            <p className="font-medium text-zinc-900">
              Task Center live chua duoc bat
            </p>
            <p className="mt-1">{result.reason}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className="overflow-hidden rounded-lg border border-zinc-200 bg-white"
      data-heu-task-center-live-readonly-status="READY"
      data-heu-task-center-live-readonly-boundary="VIEW_ONLY_NO_RPC_NO_MUTATION"
    >
      <div className="flex items-start gap-3 border-b border-zinc-200 p-5">
        <Database className="mt-0.5 size-4 shrink-0 text-emerald-700" />
        <div>
          <h3 className="font-semibold text-zinc-950">
            Task live dung pham vi
          </h3>
          <p className="mt-1 text-sm text-zinc-600">
            Chi doc metadata/ref da qua RLS va bo loc phong ban/workspace.
          </p>
        </div>
      </div>

      {result.rows.length === 0 ? (
        <p className="p-5 text-sm text-zinc-600">
          Khong co task live trong pham vi hien tai.
        </p>
      ) : (
        <div className="divide-y divide-zinc-200">
          {result.rows.map((task) => (
            <article
              key={task.taskId}
              className="grid gap-3 p-4 text-sm lg:grid-cols-[0.8fr_1.5fr_1fr_1fr]"
              data-heu-task-center-live-task={task.taskCode}
            >
              <div>
                <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2 py-1 text-xs font-medium text-zinc-700">
                  {task.status}
                </span>
                <p className="mt-2 text-xs text-zinc-500">
                  {task.departmentCode}
                </p>
              </div>
              <div>
                <p className="font-medium text-zinc-950">{task.title}</p>
                <p className="mt-1 text-xs leading-5 text-zinc-500">
                  {task.safeSummary}
                </p>
              </div>
              <div className="text-zinc-700">
                <p>{task.ownerHint}</p>
                <p className="mt-1 text-xs text-zinc-500">{task.dueLabel}</p>
              </div>
              <div className="font-mono text-xs text-zinc-600">
                <p className="break-all">{task.sourceRecordLabel}</p>
                <p className="mt-1 break-all text-zinc-500">
                  {task.auditTraceRef}
                </p>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
