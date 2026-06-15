import Link from "next/link";
import { AlertTriangle, CalendarClock, Clock3, Phone } from "lucide-react";

type FollowupLead = {
  id: string;
  lead_code: string;
  student_name: string;
  student_phone: string | null;
  parent_name: string | null;
  parent_phone: string | null;
  status: string;
  priority: string;
  interested_major: string | null;
  next_followup_at: string;
  assigned_to: string | null;
};

type UserLookup = {
  id: string;
  label: string;
};

type FollowupBoardProps = {
  overdue: FollowupLead[];
  today: FollowupLead[];
  upcoming: FollowupLead[];
  users: UserLookup[];
};

const statusLabels: Record<string, string> = {
  NEW: "Lead mới",
  ASSIGNED: "Đã phân tư vấn",
  CONTACTED: "Đã liên hệ",
  INTERESTED: "Có quan tâm",
  FOLLOW_UP: "Cần chăm sóc",
  VISITED: "Đã đến trường",
  DOCUMENT_PENDING: "Chờ hồ sơ",
  DOCUMENT_SUBMITTED: "Đã nộp hồ sơ",
  ELIGIBLE: "Đủ điều kiện",
  ENROLLED: "Đã nhập học",
  LOST: "Không đăng ký",
  DUPLICATE: "Trùng lead",
};

const priorityLabels: Record<string, string> = {
  LOW: "Thấp",
  NORMAL: "Bình thường",
  HIGH: "Cao",
  URGENT: "Khẩn cấp",
};

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function FollowupCard({
  lead,
  ownerName,
}: {
  lead: FollowupLead;
  ownerName: string;
}) {
  return (
    <Link
      href={`/leads/${lead.id}`}
      className="block rounded-md border border-zinc-200 bg-white p-4 shadow-sm transition hover:border-zinc-300 hover:shadow"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-zinc-950">
            {lead.student_name}
          </p>
          <p className="mt-1 text-xs text-zinc-500">{lead.lead_code}</p>
        </div>
        <span className="shrink-0 rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-700">
          {priorityLabels[lead.priority] ?? lead.priority}
        </span>
      </div>

      <div className="mt-3 space-y-2 text-sm text-zinc-600">
        <p className="flex items-center gap-2">
          <Clock3 className="size-4 text-zinc-400" />
          {formatDateTime(lead.next_followup_at)}
        </p>
        <p className="flex items-center gap-2">
          <Phone className="size-4 text-zinc-400" />
          {lead.student_phone ?? lead.parent_phone ?? "Chưa có SĐT"}
        </p>
      </div>

      <div className="mt-3 grid gap-2 text-xs text-zinc-500">
        <p>
          Trạng thái:{" "}
          <span className="font-medium text-zinc-700">
            {statusLabels[lead.status] ?? lead.status}
          </span>
        </p>
        <p>
          Ngành:{" "}
          <span className="font-medium text-zinc-700">
            {lead.interested_major ?? "Chưa nhập"}
          </span>
        </p>
        <p>
          Phụ trách: <span className="font-medium text-zinc-700">{ownerName}</span>
        </p>
      </div>
    </Link>
  );
}

function FollowupColumn({
  title,
  description,
  leads,
  users,
  tone,
  icon,
}: {
  title: string;
  description: string;
  leads: FollowupLead[];
  users: Map<string, string>;
  tone: string;
  icon: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            {icon}
            <h2 className="text-base font-semibold">{title}</h2>
          </div>
          <p className="mt-1 text-sm text-zinc-500">{description}</p>
        </div>
        <span className={`rounded-md px-2 py-1 text-sm font-semibold ${tone}`}>
          {leads.length}
        </span>
      </div>

      <div className="mt-4 space-y-3">
        {leads.length === 0 ? (
          <div className="rounded-md border border-dashed border-zinc-300 bg-white p-5 text-center text-sm text-zinc-500">
            Không có lead trong nhóm này.
          </div>
        ) : (
          leads.map((lead) => (
            <FollowupCard
              key={lead.id}
              lead={lead}
              ownerName={
                lead.assigned_to
                  ? users.get(lead.assigned_to) ?? "Không rõ"
                  : "Chưa phân công"
              }
            />
          ))
        )}
      </div>
    </section>
  );
}

export function FollowupBoard({
  overdue,
  today,
  upcoming,
  users,
}: FollowupBoardProps) {
  const userMap = new Map(users.map((user) => [user.id, user.label]));
  const total = overdue.length + today.length + upcoming.length;

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-zinc-500">Tổng follow-up mở</p>
          <p className="mt-2 text-3xl font-semibold">{total}</p>
        </div>
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-5 shadow-sm">
          <p className="text-sm text-rose-700">Quá hạn</p>
          <p className="mt-2 text-3xl font-semibold text-rose-700">
            {overdue.length}
          </p>
        </div>
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-5 shadow-sm">
          <p className="text-sm text-amber-700">Cần xử lý hôm nay</p>
          <p className="mt-2 text-3xl font-semibold text-amber-700">
            {today.length}
          </p>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <FollowupColumn
          title="Quá hạn"
          description="Lead đã qua thời điểm hẹn chăm sóc."
          leads={overdue}
          users={userMap}
          tone="bg-rose-100 text-rose-700"
          icon={<AlertTriangle className="size-4 text-rose-600" />}
        />
        <FollowupColumn
          title="Hôm nay"
          description="Lead cần gọi, nhắn hoặc gặp trong ngày."
          leads={today}
          users={userMap}
          tone="bg-amber-100 text-amber-700"
          icon={<CalendarClock className="size-4 text-amber-600" />}
        />
        <FollowupColumn
          title="Sắp tới"
          description="Lịch chăm sóc từ ngày mai trở đi."
          leads={upcoming}
          users={userMap}
          tone="bg-sky-100 text-sky-700"
          icon={<CalendarClock className="size-4 text-sky-600" />}
        />
      </section>
    </div>
  );
}
