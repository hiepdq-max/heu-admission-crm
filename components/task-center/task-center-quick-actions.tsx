import Link from "next/link";
import {
  AlertTriangle,
  BarChart3,
  ClipboardCheck,
  Users,
} from "lucide-react";

import { withAdmissionSegmentParam } from "@/lib/workspace-url";

type TaskCenterQuickActionsProps = {
  activeSegmentId?: string | null;
  canReadTasks: boolean;
  isExecutive: boolean;
};

const actionClassName =
  "group flex min-w-0 items-center gap-3 rounded-md border border-zinc-200 bg-white p-4 transition-colors hover:border-zinc-400 hover:bg-zinc-50";

export function TaskCenterQuickActions({
  activeSegmentId,
  canReadTasks,
  isExecutive,
}: TaskCenterQuickActionsProps) {
  if (!canReadTasks && !isExecutive) {
    return null;
  }

  const actions = [
    ...(canReadTasks
      ? [
          {
            href: "/data-confirmation?scope=assigned_to_me",
            label: "Viec cua toi",
            description: "Task dang giao cho tai khoan nay",
            icon: ClipboardCheck,
          },
          {
            href: "/data-confirmation?scope=department_queue",
            label: "Viec phong toi",
            description: "Hang doi phong theo scope hien tai",
            icon: Users,
          },
          {
            href: "/data-confirmation?scope=blocked_or_overdue",
            label: "Diem tac",
            description: "Task dang bi chan hoac can sua",
            icon: AlertTriangle,
          },
        ]
      : []),
    ...(isExecutive
      ? [
          {
            href: "/reports?focus=hot-spots",
            label: "Bao cao BGH",
            description: "Hot-spot read-only theo pham vi",
            icon: BarChart3,
          },
        ]
      : []),
  ];

  return (
    <section
      className="rounded-lg border border-zinc-200 bg-zinc-50 p-5"
      data-heu-task-center-quick-actions="TASK_CENTER_QUICK_ACTIONS_READ_ONLY"
      data-heu-task-center-boundary="NO_TASK_MUTATION NO_SCOPE_BYPASS NO_RAW_PAYLOAD"
    >
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
          Task Center
        </p>
        <h2 className="mt-1 text-base font-semibold text-zinc-950">
          Cong viec can theo doi
        </h2>
        <p className="mt-1 text-sm text-zinc-600">
          Moi lien ket chuyen den route DCTC; quyen va scope duoc kiem tra lai
          tai route dich.
        </p>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.href}
              href={withAdmissionSegmentParam(action.href, activeSegmentId)}
              className={actionClassName}
            >
              <Icon className="size-5 shrink-0 text-zinc-700" />
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-zinc-950">
                  {action.label}
                </span>
                <span className="mt-1 block text-xs leading-5 text-zinc-600">
                  {action.description}
                </span>
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
