import { CalendarClock, History } from "lucide-react";

type ActivityRow = {
  id: string;
  activity_type: string;
  activity_result: string | null;
  content: string;
  next_action: string | null;
  next_followup_at: string | null;
  created_by: string | null;
  created_at: string;
};

type UserLookup = {
  id: string;
  label: string;
};

type ActivityTimelineProps = {
  activities: ActivityRow[];
  users: UserLookup[];
};

const activityLabels: Record<string, string> = {
  CALL: "Gọi điện",
  ZALO: "Zalo",
  SMS: "SMS",
  EMAIL: "Email",
  MEETING: "Gặp trực tiếp",
  NOTE: "Ghi chú",
  STATUS_CHANGE: "Đổi trạng thái",
  ASSIGNMENT: "Phân công",
  DOCUMENT: "Hồ sơ",
  PAYMENT: "Tài chính",
};

function formatDateTime(value: string | null) {
  if (!value) {
    return "Chưa đặt";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

export function ActivityTimeline({ activities, users }: ActivityTimelineProps) {
  const userMap = new Map(users.map((user) => [user.id, user.label]));

  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
      <div>
        <h3 className="text-base font-semibold">Lịch sử tư vấn</h3>
        <p className="mt-1 text-sm text-zinc-500">
          Các hoạt động mới nhất được ghi nhận cho lead này.
        </p>
      </div>

      {activities.length === 0 ? (
        <div className="mt-5 rounded-md border border-dashed border-zinc-300 p-6 text-center">
          <History className="mx-auto size-5 text-zinc-400" />
          <p className="mt-3 text-sm font-medium text-zinc-700">
            Chưa có hoạt động tư vấn
          </p>
          <p className="mt-1 text-sm text-zinc-500">
            Hãy ghi cuộc gọi, tin nhắn hoặc ghi chú đầu tiên ở form bên trên.
          </p>
        </div>
      ) : (
        <div className="mt-5 divide-y divide-zinc-200">
          {activities.map((activity) => (
            <article key={activity.id} className="py-4 first:pt-0 last:pb-0">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-700">
                      {activityLabels[activity.activity_type] ??
                        activity.activity_type}
                    </span>
                    {activity.activity_result ? (
                      <span className="rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
                        {activity.activity_result}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-3 text-sm leading-6 text-zinc-700">
                    {activity.content}
                  </p>
                </div>
                <div className="shrink-0 text-sm text-zinc-500">
                  {formatDateTime(activity.created_at)}
                </div>
              </div>

              <div className="mt-3 grid gap-2 text-sm text-zinc-500 md:grid-cols-2">
                <p>
                  Người ghi:{" "}
                  <span className="font-medium text-zinc-700">
                    {activity.created_by
                      ? userMap.get(activity.created_by) ?? "Không rõ"
                      : "Không rõ"}
                  </span>
                </p>
                {activity.next_followup_at ? (
                  <p className="inline-flex items-center gap-2">
                    <CalendarClock className="size-4 text-amber-600" />
                    Hẹn tiếp: {formatDateTime(activity.next_followup_at)}
                  </p>
                ) : null}
              </div>

              {activity.next_action ? (
                <div className="mt-3 rounded-md bg-zinc-50 p-3 text-sm text-zinc-700">
                  Việc tiếp theo: {activity.next_action}
                </div>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
