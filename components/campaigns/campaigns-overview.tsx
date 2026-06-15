import { CalendarDays, CheckCircle2, Megaphone, Wallet } from "lucide-react";

type CampaignRow = {
  id: string;
  campaign_code: string;
  campaign_name: string;
  source_name: string;
  start_date: string | null;
  end_date: string | null;
  budget: number | null;
  status: string;
  note: string | null;
  lead_count: number;
  enrolled_count: number;
  conversion: string;
};

type CampaignsOverviewProps = {
  campaigns: CampaignRow[];
  summary: {
    totalCampaigns: number;
    activeCampaigns: number;
    totalLeads: number;
    totalEnrolled: number;
    conversion: string;
  };
};

function formatDate(value: string | null) {
  if (!value) {
    return "Chưa đặt";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
  }).format(new Date(value));
}

function formatMoney(value: number | null) {
  if (value === null || Number.isNaN(value)) {
    return "Chưa nhập";
  }

  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

function CountBar({ percent }: { percent: string }) {
  const value = Number(percent.replace("%", ""));

  return (
    <div className="h-2 w-full rounded-full bg-zinc-100">
      <div
        className="h-2 rounded-full bg-zinc-900"
        style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
      />
    </div>
  );
}

export function CampaignsOverview({
  campaigns,
  summary,
}: CampaignsOverviewProps) {
  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="mb-4 inline-flex rounded-md border border-sky-200 bg-sky-50 px-2 py-1 text-xs font-medium text-sky-700">
            Tổng chiến dịch
          </div>
          <p className="text-3xl font-semibold">{summary.totalCampaigns}</p>
          <p className="mt-2 text-sm text-zinc-500">
            {summary.activeCampaigns} đang active
          </p>
        </article>
        <article className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="mb-4 inline-flex rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
            Lead theo campaign
          </div>
          <p className="text-3xl font-semibold">{summary.totalLeads}</p>
          <p className="mt-2 text-sm text-zinc-500">Tính theo campaign_id</p>
        </article>
        <article className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="mb-4 inline-flex rounded-md border border-violet-200 bg-violet-50 px-2 py-1 text-xs font-medium text-violet-700">
            Đã nhập học
          </div>
          <p className="text-3xl font-semibold">{summary.totalEnrolled}</p>
          <p className="mt-2 text-sm text-zinc-500">Từ các chiến dịch</p>
        </article>
        <article className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="mb-4 inline-flex rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700">
            Chuyển đổi
          </div>
          <p className="text-3xl font-semibold">{summary.conversion}</p>
          <p className="mt-2 text-sm text-zinc-500">Lead đến nhập học</p>
        </article>
      </section>

      <section className="rounded-lg border border-zinc-200 bg-white shadow-sm">
        <div className="border-b border-zinc-200 p-5">
          <h2 className="text-base font-semibold">Danh sách chiến dịch</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Theo dõi chiến dịch, nguồn lead, thời gian, ngân sách và hiệu quả
            chuyển đổi.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1120px] text-sm">
            <thead className="bg-zinc-50 text-left text-xs font-medium uppercase text-zinc-500">
              <tr>
                <th className="px-5 py-3">Chiến dịch</th>
                <th className="px-5 py-3">Nguồn</th>
                <th className="px-5 py-3">Thời gian</th>
                <th className="px-5 py-3">Ngân sách</th>
                <th className="px-5 py-3">Lead</th>
                <th className="px-5 py-3">Nhập học</th>
                <th className="px-5 py-3">Chuyển đổi</th>
                <th className="px-5 py-3">Ghi chú</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {campaigns.length === 0 ? (
                <tr>
                  <td className="px-5 py-6 text-center text-zinc-500" colSpan={8}>
                    Chưa có chiến dịch.
                  </td>
                </tr>
              ) : (
                campaigns.map((campaign) => (
                  <tr key={campaign.id} className="align-top">
                    <td className="px-5 py-4">
                      <div className="flex items-start gap-3">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-zinc-100">
                          <Megaphone className="size-4 text-zinc-600" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-zinc-950">
                            {campaign.campaign_name}
                          </p>
                          <p className="mt-1 text-xs text-zinc-500">
                            {campaign.campaign_code}
                          </p>
                          <span className="mt-2 inline-flex rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-700">
                            {campaign.status}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-zinc-700">
                      {campaign.source_name}
                    </td>
                    <td className="px-5 py-4">
                      <p className="inline-flex items-center gap-2 text-zinc-700">
                        <CalendarDays className="size-4 text-zinc-400" />
                        {formatDate(campaign.start_date)}
                      </p>
                      <p className="mt-1 text-zinc-500">
                        đến {formatDate(campaign.end_date)}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="inline-flex items-center gap-2 text-zinc-700">
                        <Wallet className="size-4 text-zinc-400" />
                        {formatMoney(campaign.budget)}
                      </p>
                    </td>
                    <td className="px-5 py-4 font-medium text-sky-700">
                      {campaign.lead_count}
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-2 rounded-md bg-emerald-50 px-2 py-1 font-medium text-emerald-700">
                        <CheckCircle2 className="size-4" />
                        {campaign.enrolled_count}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <CountBar percent={campaign.conversion} />
                        <span className="w-14 text-right text-zinc-600">
                          {campaign.conversion}
                        </span>
                      </div>
                    </td>
                    <td className="max-w-xs px-5 py-4 text-zinc-600">
                      {campaign.note ?? "Chưa có ghi chú"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
