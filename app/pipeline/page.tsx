import Link from "next/link";
import { redirect } from "next/navigation";
import { RefreshCcw } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { PipelineBoard } from "@/components/pipeline/pipeline-board";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

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

const columns = [
  {
    status: "NEW",
    label: "Lead mới",
    description: "Vừa vào hệ thống",
    color: "bg-sky-500",
  },
  {
    status: "ASSIGNED",
    label: "Đã phân tư vấn",
    description: "Đã có người phụ trách",
    color: "bg-cyan-500",
  },
  {
    status: "CONTACTED",
    label: "Đã liên hệ",
    description: "Đã gọi/nhắn lần đầu",
    color: "bg-blue-500",
  },
  {
    status: "INTERESTED",
    label: "Có quan tâm",
    description: "Có nhu cầu học",
    color: "bg-violet-500",
  },
  {
    status: "FOLLOW_UP",
    label: "Chăm sóc tiếp",
    description: "Có lịch gọi lại",
    color: "bg-amber-500",
  },
  {
    status: "DOCUMENT_PENDING",
    label: "Chờ hồ sơ",
    description: "Đang bổ sung giấy tờ",
    color: "bg-orange-500",
  },
  {
    status: "DOCUMENT_SUBMITTED",
    label: "Đã nộp hồ sơ",
    description: "Đang kiểm tra hồ sơ",
    color: "bg-indigo-500",
  },
  {
    status: "ELIGIBLE",
    label: "Đủ điều kiện",
    description: "Sẵn sàng nhập học",
    color: "bg-emerald-500",
  },
  {
    status: "ENROLLED",
    label: "Đã nhập học",
    description: "Chốt tuyển sinh",
    color: "bg-green-500",
  },
  {
    status: "LOST",
    label: "Không đăng ký",
    description: "Lead đã mất",
    color: "bg-rose-500",
  },
];

function toLookup<T extends Record<string, unknown>>(
  rows: T[] | null,
  labelKey: keyof T,
) {
  return (rows ?? []).map((row) => ({
    id: String(row.id),
    label: String(row[labelKey] ?? ""),
  }));
}

export default async function PipelinePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [{ data: leads, error }, { data: flows }, { data: users }] = await Promise.all([
    supabase
      .from("leads")
      .select(
        "id,lead_code,student_name,student_phone,parent_phone,status,priority,interested_major,next_followup_at,flow_id,assigned_to,is_duplicate",
      )
      .eq("is_deleted", false)
      .order("updated_at", { ascending: false })
      .limit(500)
      .returns<PipelineLead[]>(),
    supabase.from("admission_flows").select("id,flow_name"),
    supabase.from("users_profile").select("id,full_name"),
  ]);

  return (
    <AppShell
      active="pipeline"
      title="Pipeline tuyển sinh"
      description="Kanban lead theo trạng thái tuyển sinh, đọc trực tiếp từ Supabase."
      actions={
        <Button asChild variant="outline">
          <Link href="/pipeline">
            <RefreshCcw className="size-4" />
            Tải lại
          </Link>
        </Button>
      }
    >
      {error ? (
        <section className="rounded-lg border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">
          Không đọc được pipeline: {error.message}
        </section>
      ) : (
        <PipelineBoard
          columns={columns}
          leads={leads ?? []}
          flows={toLookup(flows, "flow_name")}
          users={toLookup(users, "full_name")}
        />
      )}
    </AppShell>
  );
}
