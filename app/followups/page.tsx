import { redirect } from "next/navigation";
import { RefreshCcw } from "lucide-react";

import { FollowupBoard } from "@/components/followups/followup-board";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

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

function toLookup<T extends Record<string, unknown>>(
  rows: T[] | null,
  labelKey: keyof T,
): UserLookup[] {
  return (rows ?? []).map((row) => ({
    id: String(row.id),
    label: String(row[labelKey] ?? ""),
  }));
}

function startOfToday() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function startOfTomorrow() {
  const today = startOfToday();
  return new Date(today.getTime() + 24 * 60 * 60 * 1000);
}

export default async function FollowupsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: leads, error } = await supabase
    .from("leads")
    .select(
      "id,lead_code,student_name,student_phone,parent_name,parent_phone,status,priority,interested_major,next_followup_at,assigned_to",
    )
    .eq("is_deleted", false)
    .not("next_followup_at", "is", null)
    .neq("status", "ENROLLED")
    .neq("status", "LOST")
    .order("next_followup_at", { ascending: true })
    .returns<FollowupLead[]>();

  const { data: userRows } = await supabase
    .from("users_profile")
    .select("id,full_name");

  const todayStart = startOfToday();
  const tomorrowStart = startOfTomorrow();

  const overdue: FollowupLead[] = [];
  const today: FollowupLead[] = [];
  const upcoming: FollowupLead[] = [];

  for (const lead of leads ?? []) {
    const dueAt = new Date(lead.next_followup_at);

    if (dueAt < todayStart) {
      overdue.push(lead);
    } else if (dueAt < tomorrowStart) {
      today.push(lead);
    } else {
      upcoming.push(lead);
    }
  }

  return (
    <AppShell
      active="followups"
      title="Lịch tư vấn"
      description="Các lead cần chăm sóc theo lịch hẹn, chia theo quá hạn, hôm nay và sắp tới."
      actions={
        <Button asChild variant="outline">
          <a href="/followups">
            <RefreshCcw className="size-4" />
            Tải lại
          </a>
        </Button>
      }
    >
      {error ? (
        <section className="rounded-lg border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">
          Không đọc được dữ liệu follow-up: {error.message}
        </section>
      ) : (
        <FollowupBoard
          overdue={overdue}
          today={today}
          upcoming={upcoming}
          users={toLookup(userRows, "full_name")}
        />
      )}
    </AppShell>
  );
}
