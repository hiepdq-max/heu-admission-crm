import Link from "next/link";
import { ClipboardCheck, FileWarning, UserRoundX } from "lucide-react";

import type { AdmissionPilotTaskLiveSummary } from "@/lib/admission-pilot-task-read-model";
import { withAdmissionSegmentParam } from "@/lib/workspace";

type Props = {
  result: AdmissionPilotTaskLiveSummary;
  activeSegmentId: string | null;
};

export function AdmissionPilotTaskLiveSummaryPanel({
  result,
  activeSegmentId,
}: Props) {
  if (result.status !== "READY") return null;

  const firstBlockedPacketHref = result.firstBlockedLeadId
    ? `/leads/${result.firstBlockedLeadId}#documents`
    : "/leads?quick=documents";

  const tasks = [
    {
      code: "PILOT-ADMISSION-ACTOR-001",
      label: "Lead chưa có người phụ trách",
      value: result.missingActorCount,
      href: "/leads?quick=unassigned",
      actionLabel: "Mở danh sách đúng scope",
      icon: UserRoundX,
    },
    {
      code: "PILOT-ADMISSION-DOCUMENT-002",
      label: "Lead còn thiếu hồ sơ CHECKED",
      value: result.documentBlockedCount,
      href: firstBlockedPacketHref,
      actionLabel: result.firstBlockedLeadId
        ? "Mở thẳng checklist cần kiểm tra"
        : "Mở danh sách đúng scope",
      icon: FileWarning,
    },
    {
      code: "PILOT-ADMISSION-HANDOVER-003",
      label: "Packet đủ điều kiện bàn giao",
      value: result.handoverReadyCount,
      href: "/leads?quick=documents",
      actionLabel: "Mở danh sách đúng scope",
      icon: ClipboardCheck,
    },
  ] as const;

  return (
    <section
      className="rounded-lg border border-sky-200 bg-sky-50/50 p-5"
      data-heu-admission-pilot-task-live-summary="READY"
      data-heu-admission-pilot-task-scope="ACTIVE_SEGMENT_RLS_METADATA_ONLY"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase text-sky-700">
            Pilot Tuyển sinh · metadata live
          </p>
          <h2 className="mt-1 font-semibold text-zinc-950">
            Việc cần xử lý trong segment hiện tại
          </h2>
          <p className="mt-1 text-sm text-zinc-600">
            {result.totalLeadCount} lead trong scope; không hiển thị tên, email,
            điện thoại hoặc hồ sơ gốc.
          </p>
        </div>
        <span className="w-fit rounded-full border border-sky-200 bg-white px-2.5 py-1 text-xs font-medium text-sky-700">
          READ_ONLY
        </span>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {tasks.map((task) => {
          const Icon = task.icon;
          return (
            <Link
              key={task.code}
              href={withAdmissionSegmentParam(task.href, activeSegmentId)}
              className="rounded-md border border-zinc-200 bg-white p-4 transition hover:border-sky-300"
              data-heu-admission-pilot-live-task={task.code}
            >
              <div className="flex items-start justify-between gap-3">
                <Icon className="size-5 text-sky-700" />
                <span className="text-2xl font-semibold text-zinc-950">
                  {task.value}
                </span>
              </div>
              <p className="mt-3 text-sm font-medium text-zinc-900">
                {task.label}
              </p>
              <p className="mt-1 text-xs text-zinc-500">{task.actionLabel}</p>
            </Link>
          );
        })}
      </div>
      {result.documentBlockedCount > 0 ? (
        <p className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-900">
          Owner chỉ chuyển giấy tờ sang CHECKED khi đã xem evidence được phép,
          ghi nhận người và thời điểm kiểm tra. Không dùng nút này để tự động
          chấp nhận hồ sơ hoặc thay quyết định CTHSSV.
        </p>
      ) : null}
    </section>
  );
}
