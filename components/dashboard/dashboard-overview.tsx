import Link from "next/link";
import type { ReactNode } from "react";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  PhoneCall,
} from "lucide-react";

import { Button } from "@/components/ui/button";

type KpiItem = {
  label: string;
  value: string;
  trend: string;
  tone: string;
};

type PipelineItem = {
  status: string;
  label: string;
  count: number;
  color: string;
};

type UrgentLead = {
  id: string;
  name: string;
  phone: string;
  owner: string;
  status: string;
  note: string;
  due: string;
};

type DashboardOverviewProps = {
  kpis: KpiItem[];
  pipeline: PipelineItem[];
  urgentLeads: UrgentLead[];
  activities: string[];
  segmentOverview?: ReactNode;
};

export function DashboardOverview({
  kpis,
  pipeline,
  urgentLeads,
  activities,
  segmentOverview,
}: DashboardOverviewProps) {
  return (
    <>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <article
            key={kpi.label}
            className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm"
          >
            <div
              className={`mb-4 inline-flex rounded-md border px-2 py-1 text-xs font-medium ${kpi.tone}`}
            >
              {kpi.label}
            </div>
            <p className="text-3xl font-semibold tracking-normal">{kpi.value}</p>
            <p className="mt-2 text-sm text-zinc-500">{kpi.trend}</p>
          </article>
        ))}
      </section>

      {segmentOverview}

      <section className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <div className="rounded-lg border border-zinc-200 bg-white shadow-sm">
          <div className="flex flex-col gap-2 border-b border-zinc-200 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-semibold">Pipeline tuyển sinh</h2>
              <p className="mt-1 text-sm text-zinc-500">
                Tình trạng lead theo các bước chính của quy trình.
              </p>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/reports">
                <BarChart3 className="size-4" />
                Xem báo cáo
              </Link>
            </Button>
          </div>

          <div className="grid gap-3 p-5 md:grid-cols-2">
            {pipeline.map((item) => (
              <div
                key={item.status}
                className="rounded-md border border-zinc-200 p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className={`size-2.5 rounded-full ${item.color}`} />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {item.label}
                      </p>
                      <p className="text-xs text-zinc-500">{item.status}</p>
                    </div>
                  </div>
                  <p className="text-2xl font-semibold">{item.count}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white shadow-sm">
          <div className="border-b border-zinc-200 p-5">
            <h2 className="text-base font-semibold">Hoạt động hôm nay</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Các tín hiệu cần trưởng nhóm nắm nhanh.
            </p>
          </div>
          <div className="space-y-3 p-5">
            {activities.map((activity) => (
              <div
                key={activity}
                className="flex items-start gap-3 rounded-md bg-zinc-50 p-3"
              >
                <Activity className="mt-0.5 size-4 text-zinc-600" />
                <p className="text-sm text-zinc-700">{activity}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="rounded-lg border border-zinc-200 bg-white shadow-sm">
          <div className="flex flex-col gap-2 border-b border-zinc-200 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-semibold">Lead cần xử lý ngay</h2>
              <p className="mt-1 text-sm text-zinc-500">
                Ưu tiên lead có lịch hẹn gần nhất hoặc đã quá hạn.
              </p>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/followups">
                <PhoneCall className="size-4" />
                Danh sách gọi
              </Link>
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="bg-zinc-50 text-left text-xs font-medium uppercase text-zinc-500">
                <tr>
                  <th className="px-5 py-3">Lead</th>
                  <th className="px-5 py-3">Phụ trách</th>
                  <th className="px-5 py-3">Trạng thái</th>
                  <th className="px-5 py-3">Ghi chú</th>
                  <th className="px-5 py-3">Hạn xử lý</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {urgentLeads.length === 0 ? (
                  <tr>
                    <td className="px-5 py-6 text-center text-zinc-500" colSpan={5}>
                      Chưa có lead cần follow-up.
                    </td>
                  </tr>
                ) : (
                  urgentLeads.map((lead) => (
                    <tr key={lead.id} className="align-top">
                      <td className="px-5 py-4">
                        <Link
                          href={`/leads/${lead.id}`}
                          className="font-medium hover:underline"
                        >
                          {lead.name}
                        </Link>
                        <p className="mt-1 text-zinc-500">{lead.phone}</p>
                      </td>
                      <td className="px-5 py-4 text-zinc-700">{lead.owner}</td>
                      <td className="px-5 py-4">
                        <span className="rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-700">
                          {lead.status}
                        </span>
                      </td>
                      <td className="max-w-xs px-5 py-4 text-zinc-600">
                        {lead.note}
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1.5 rounded-md bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700">
                          <AlertTriangle className="size-3.5" />
                          {lead.due}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white shadow-sm">
          <div className="border-b border-zinc-200 p-5">
            <h2 className="text-base font-semibold">Nguyên tắc MVP</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Thứ tự ưu tiên theo bản thiết kế.
            </p>
          </div>
          <div className="space-y-3 p-5">
            {[
              "Data Master trước",
              "Workflow trước",
              "Phân quyền trước",
              "Audit Log trước",
              "Dashboard sau",
              "AI chỉ hỗ trợ nháp",
            ].map((rule) => (
              <div key={rule} className="flex items-center gap-3">
                <CheckCircle2 className="size-4 text-emerald-600" />
                <span className="text-sm font-medium text-zinc-700">
                  {rule}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
