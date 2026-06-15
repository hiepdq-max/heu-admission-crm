import Link from "next/link";
import { AlertTriangle, CalendarClock, Phone } from "lucide-react";

import { PipelineStatusForm } from "@/components/pipeline/pipeline-status-form";

type PipelineLead = {
  id: string;
  lead_code: string;
  student_name: string;
  student_phone: string | null;
  parent_phone: string | null;
  status: string;
  priority: string;
  interested_major: string | null;
  next_followup_at: string | null;
  flow_id: string | null;
  assigned_to: string | null;
  is_duplicate: boolean;
};

type PipelineColumn = {
  status: string;
  label: string;
  description: string;
  color: string;
};

type UserLookup = {
  id: string;
  label: string;
};

type PipelineBoardProps = {
  columns: PipelineColumn[];
  leads: PipelineLead[];
  flows: UserLookup[];
  users: UserLookup[];
};

const priorityLabels: Record<string, string> = {
  LOW: "Thấp",
  NORMAL: "Bình thường",
  HIGH: "Cao",
  URGENT: "Khẩn cấp",
};

function formatFollowup(value: string | null) {
  if (!value) {
    return "Chưa đặt lịch";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function isOverdue(value: string | null) {
  if (!value) {
    return false;
  }

  return new Date(value).getTime() < Date.now();
}

function PipelineCard({
  lead,
  flow,
  owner,
}: {
  lead: PipelineLead;
  flow: string;
  owner: string;
}) {
  const overdue = isOverdue(lead.next_followup_at);

  return (
    <article className="rounded-md border border-zinc-200 bg-white p-4 shadow-sm transition hover:border-zinc-300 hover:shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link
            href={`/leads/${lead.id}`}
            className="block truncate text-sm font-semibold text-zinc-950 hover:underline"
          >
            {lead.student_name}
          </Link>
          <p className="mt-1 text-xs text-zinc-500">{lead.lead_code}</p>
        </div>
        <span className="shrink-0 rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-700">
          {priorityLabels[lead.priority] ?? lead.priority}
        </span>
      </div>

      <div className="mt-3 space-y-2 text-sm text-zinc-600">
        <p className="flex items-center gap-2">
          <Phone className="size-4 text-zinc-400" />
          {lead.student_phone ?? lead.parent_phone ?? "Chưa có SĐT"}
        </p>
        <p className="flex items-center gap-2">
          <CalendarClock
            className={`size-4 ${overdue ? "text-rose-600" : "text-zinc-400"}`}
          />
          {formatFollowup(lead.next_followup_at)}
        </p>
      </div>

      <div className="mt-3 space-y-2 text-xs text-zinc-500">
        <p>
          Ngành:{" "}
          <span className="font-medium text-zinc-700">
            {lead.interested_major ?? "Chưa nhập"}
          </span>
        </p>
        <p>
          Luồng: <span className="font-medium text-zinc-700">{flow}</span>
        </p>
        <p>
          Phụ trách: <span className="font-medium text-zinc-700">{owner}</span>
        </p>
      </div>

      {(overdue || lead.is_duplicate) && (
        <div className="mt-3 flex flex-wrap gap-2">
          {overdue ? (
            <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-2 py-1 text-xs font-medium text-rose-700">
              <AlertTriangle className="size-3.5" />
              Quá hạn
            </span>
          ) : null}
          {lead.is_duplicate ? (
            <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700">
              Trùng lead
            </span>
          ) : null}
        </div>
      )}

      <PipelineStatusForm
        leadId={lead.id}
        currentStatus={lead.status}
        currentNextFollowupAt={lead.next_followup_at}
      />
    </article>
  );
}

export function PipelineBoard({
  columns,
  leads,
  flows,
  users,
}: PipelineBoardProps) {
  const flowMap = new Map(flows.map((flow) => [flow.id, flow.label]));
  const userMap = new Map(users.map((user) => [user.id, user.label]));
  const leadsByStatus = new Map<string, PipelineLead[]>();

  for (const column of columns) {
    leadsByStatus.set(column.status, []);
  }

  for (const lead of leads) {
    const group = leadsByStatus.get(lead.status);

    if (group) {
      group.push(lead);
    }
  }

  return (
    <section className="space-y-4">
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800">
        Kanban hiện ở chế độ xem. Kéo thả sẽ làm ở bước sau để bảo đảm mọi thay
        đổi trạng thái vẫn đi qua quy tắc nghiệp vụ như FOLLOW_UP cần ngày hẹn
        và LOST cần lý do mất.
      </div>

      <div className="grid gap-4 xl:grid-cols-5">
        {columns.map((column) => {
          const columnLeads = leadsByStatus.get(column.status) ?? [];

          return (
            <section
              key={column.status}
              className="min-h-48 rounded-lg border border-zinc-200 bg-zinc-50 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`size-2.5 rounded-full ${column.color}`} />
                    <h2 className="truncate text-sm font-semibold">
                      {column.label}
                    </h2>
                  </div>
                  <p className="mt-1 text-xs text-zinc-500">
                    {column.description}
                  </p>
                </div>
                <span className="rounded-md bg-white px-2 py-1 text-sm font-semibold text-zinc-700">
                  {columnLeads.length}
                </span>
              </div>

              <div className="mt-4 space-y-3">
                {columnLeads.length === 0 ? (
                  <div className="rounded-md border border-dashed border-zinc-300 bg-white p-4 text-center text-sm text-zinc-500">
                    Chưa có lead
                  </div>
                ) : (
                  columnLeads.map((lead) => (
                    <PipelineCard
                      key={lead.id}
                      lead={lead}
                      flow={
                        lead.flow_id
                          ? flowMap.get(lead.flow_id) ?? "Không rõ luồng"
                          : "Chưa phân loại"
                      }
                      owner={
                        lead.assigned_to
                          ? userMap.get(lead.assigned_to) ?? "Không rõ"
                          : "Chưa phân công"
                      }
                    />
                  ))
                )}
              </div>
            </section>
          );
        })}
      </div>
    </section>
  );
}
