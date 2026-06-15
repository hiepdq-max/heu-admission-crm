import Link from "next/link";
import { AlertTriangle, Phone, UserRound } from "lucide-react";

type LeadRow = {
  id: string;
  lead_code: string;
  student_name: string;
  student_phone: string | null;
  parent_name: string | null;
  parent_phone: string | null;
  interested_major: string | null;
  province: string | null;
  district: string | null;
  ward: string | null;
  status: string;
  priority: string;
  next_followup_at: string | null;
  created_at: string;
  source_id: string | null;
  flow_id: string | null;
  campaign_id: string | null;
  partner_id: string | null;
  assigned_to: string | null;
  hou_major_id: string | null;
  hou_stage_id: string | null;
};

type LookupRow = {
  id: string;
  label: string;
};

type LeadListProps = {
  leads: LeadRow[];
  sources: LookupRow[];
  flows: LookupRow[];
  campaigns: LookupRow[];
  partners: LookupRow[];
  users: LookupRow[];
  houMajors: LookupRow[];
  houStages: LookupRow[];
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

const statusClasses: Record<string, string> = {
  NEW: "bg-sky-50 text-sky-700 border-sky-200",
  ASSIGNED: "bg-cyan-50 text-cyan-700 border-cyan-200",
  CONTACTED: "bg-blue-50 text-blue-700 border-blue-200",
  INTERESTED: "bg-violet-50 text-violet-700 border-violet-200",
  FOLLOW_UP: "bg-amber-50 text-amber-700 border-amber-200",
  VISITED: "bg-indigo-50 text-indigo-700 border-indigo-200",
  DOCUMENT_PENDING: "bg-orange-50 text-orange-700 border-orange-200",
  DOCUMENT_SUBMITTED: "bg-purple-50 text-purple-700 border-purple-200",
  ELIGIBLE: "bg-emerald-50 text-emerald-700 border-emerald-200",
  ENROLLED: "bg-green-50 text-green-700 border-green-200",
  LOST: "bg-rose-50 text-rose-700 border-rose-200",
  DUPLICATE: "bg-zinc-100 text-zinc-700 border-zinc-200",
};

const priorityLabels: Record<string, string> = {
  LOW: "Thấp",
  NORMAL: "Bình thường",
  HIGH: "Cao",
  URGENT: "Khẩn cấp",
};

function toMap(rows: LookupRow[]) {
  return new Map(rows.map((row) => [row.id, row.label]));
}

function formatDateTime(value: string | null) {
  if (!value) {
    return "Chưa đặt";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatArea(lead: Pick<LeadRow, "province" | "district" | "ward">) {
  const currentArea = [lead.ward, lead.province].filter(Boolean).join(" / ");

  if (!currentArea && !lead.district) {
    return "Chưa rõ địa bàn";
  }

  if (lead.district) {
    return `${currentArea || "Chưa rõ địa bàn hiện tại"} / Quận huyện cũ: ${lead.district}`;
  }

  return currentArea;
}

export function LeadList({
  leads,
  sources,
  flows,
  campaigns,
  partners,
  users,
  houMajors,
  houStages,
}: LeadListProps) {
  const sourceMap = toMap(sources);
  const flowMap = toMap(flows);
  const campaignMap = toMap(campaigns);
  const partnerMap = toMap(partners);
  const userMap = toMap(users);
  const houMajorMap = toMap(houMajors);
  const houStageMap = toMap(houStages);

  if (leads.length === 0) {
    return (
      <section className="rounded-lg border border-zinc-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex size-12 items-center justify-center rounded-lg bg-zinc-100">
          <UserRound className="size-5 text-zinc-500" />
        </div>
        <h2 className="mt-4 text-base font-semibold">Chưa có lead</h2>
        <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-zinc-500">
          Chưa có lead phù hợp với tài khoản hiện tại. Hãy bấm nút tạo lead mới
          hoặc import danh sách tuyển sinh để bắt đầu theo dõi trên CRM.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-lg border border-zinc-200 bg-white shadow-sm">
      <div className="flex flex-col gap-2 border-b border-zinc-200 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold">Danh sách lead</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Đang hiển thị {leads.length} lead mới nhất từ Supabase.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1040px] text-sm">
          <thead className="bg-zinc-50 text-left text-xs font-medium uppercase text-zinc-500">
            <tr>
              <th className="px-5 py-3">Lead</th>
              <th className="px-5 py-3">Liên hệ</th>
              <th className="px-5 py-3">Nhu cầu</th>
              <th className="px-5 py-3">Nguồn</th>
              <th className="px-5 py-3">Trạng thái</th>
              <th className="px-5 py-3">Phụ trách</th>
              <th className="px-5 py-3">Follow-up</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200">
            {leads.map((lead) => {
              const source = lead.source_id
                ? sourceMap.get(lead.source_id)
                : null;
              const flow = lead.flow_id ? flowMap.get(lead.flow_id) : null;
              const campaign = lead.campaign_id
                ? campaignMap.get(lead.campaign_id)
                : null;
              const partner = lead.partner_id
                ? partnerMap.get(lead.partner_id)
                : null;
              const owner = lead.assigned_to
                ? userMap.get(lead.assigned_to)
                : null;
              const houMajor = lead.hou_major_id
                ? houMajorMap.get(lead.hou_major_id)
                : null;
              const houStage = lead.hou_stage_id
                ? houStageMap.get(lead.hou_stage_id)
                : null;

              return (
                <tr key={lead.id} className="align-top">
                  <td className="px-5 py-4">
                    <Link
                      href={`/leads/${lead.id}`}
                      className="font-medium text-zinc-950 hover:underline"
                    >
                      {lead.student_name}
                    </Link>
                    <p className="mt-1 text-xs text-zinc-500">
                      {lead.lead_code}
                    </p>
                    <p className="mt-2 text-xs text-zinc-500">
                      Tạo: {formatDateTime(lead.created_at)}
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    <div className="space-y-2">
                      <p className="flex items-center gap-2 text-zinc-700">
                        <Phone className="size-3.5 text-zinc-400" />
                        {lead.student_phone ?? "Chưa có SĐT HS"}
                      </p>
                      <p className="text-xs text-zinc-500">
                        PH: {lead.parent_name ?? "Chưa nhập"} -{" "}
                        {lead.parent_phone ?? "Chưa có SĐT"}
                      </p>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-medium text-zinc-700">
                      {lead.interested_major ?? "Chưa rõ ngành"}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">
                      {formatArea(lead)}
                    </p>
                    {houMajor || houStage ? (
                      <p className="mt-2 inline-flex max-w-full rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
                        HOU: {houMajor ?? "Chưa chọn ngành"} ·{" "}
                        {houStage ?? "Chưa chọn bước"}
                      </p>
                    ) : null}
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-medium text-zinc-700">
                      {source ?? "Chưa rõ nguồn"}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">
                      Luồng: {flow ?? "Chưa phân loại luồng"}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">
                      {campaign ?? partner ?? "Không có chiến dịch/đối tác"}
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    <div className="space-y-2">
                      <span
                        className={`inline-flex rounded-md border px-2 py-1 text-xs font-medium ${
                          statusClasses[lead.status] ??
                          "border-zinc-200 bg-zinc-100 text-zinc-700"
                        }`}
                      >
                        {statusLabels[lead.status] ?? lead.status}
                      </span>
                      <p className="text-xs text-zinc-500">
                        Ưu tiên: {priorityLabels[lead.priority] ?? lead.priority}
                      </p>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-zinc-700">
                    {owner ?? "Chưa phân công"}
                  </td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-700">
                      {lead.next_followup_at ? (
                        <AlertTriangle className="size-3.5 text-amber-600" />
                      ) : null}
                      {formatDateTime(lead.next_followup_at)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
