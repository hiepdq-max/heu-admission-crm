import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Megaphone,
  Plus,
  Table2,
  Users,
  Wallet,
} from "lucide-react";

import { withAdmissionSegmentParam } from "@/lib/workspace-url";

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
  activeSegmentId?: string | null;
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

function campaignRowHref(campaignId: string) {
  return `#campaign-row-${campaignId}`;
}

export function CampaignsOverview({
  campaigns,
  activeSegmentId = null,
  summary,
}: CampaignsOverviewProps) {
  const quickCampaigns = [...campaigns]
    .sort((left, right) => {
      const leadDelta = right.lead_count - left.lead_count;
      if (leadDelta !== 0) {
        return leadDelta;
      }

      const enrolledDelta = right.enrolled_count - left.enrolled_count;
      if (enrolledDelta !== 0) {
        return enrolledDelta;
      }

      return left.campaign_name.localeCompare(right.campaign_name);
    })
    .slice(0, 3);
  const campaignCreateHref = withAdmissionSegmentParam(
    "/campaigns/new",
    activeSegmentId,
  );
  const leadsHref = withAdmissionSegmentParam("/leads", activeSegmentId);

  return (
    <div className="space-y-6">
      <section
        className="min-w-0 overflow-hidden rounded-lg border border-zinc-200 bg-white p-5 shadow-sm"
        data-heu-campaign-quick-access="P0-06_CAMPAIGN_QUICK_ACCESS"
        data-heu-campaign-quick-open="P0-06_CAMPAIGN_QUICK_OPEN_TOP3"
        data-heu-campaign-quick-access-overflow-guard="P0-06_CAMPAIGN_QUICK_ACCESS_NO_OVERFLOW"
        data-heu-campaign-workspace-links="P0-06_CAMPAIGN_WORKSPACE_LINKS"
        data-heu-campaign-anchor-nav="new leads table top3"
      >
        <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex min-w-0 items-center gap-2 text-sm font-semibold text-zinc-950">
              <Megaphone className="size-4 shrink-0 text-zinc-600" />
              <span className="truncate">Mở nhanh chiến dịch tuyển sinh</span>
            </div>
            <p className="mt-2 max-w-4xl break-words text-sm leading-6 text-zinc-600">
              Điều hướng nhanh tới tạo chiến dịch, lead liên quan và các chiến
              dịch đang có nhiều lead nhất. Phần này chỉ hỗ trợ mở đúng vị trí,
              không duyệt ngân sách, không chạy quảng cáo và không ghi nhận tài
              chính.
            </p>
          </div>

          <div className="flex shrink-0 flex-wrap gap-2 text-sm font-medium">
            <Link
              href={campaignCreateHref}
              aria-label="Mở nhanh tạo chiến dịch"
              title="Mở nhanh tạo chiến dịch"
              className="inline-flex items-center gap-2 rounded-md bg-zinc-950 px-3 py-2 text-white hover:bg-zinc-800"
            >
              <Plus className="size-4" />
              Tạo chiến dịch
            </Link>
            <Link
              href={leadsHref}
              aria-label="Mở nhanh danh sách lead"
              title="Mở nhanh danh sách lead"
              className="inline-flex items-center gap-2 rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-700 hover:bg-zinc-100"
            >
              <Users className="size-4" />
              Xem lead
            </Link>
            <Link
              href="#campaigns-table"
              aria-label="Mở nhanh bảng chiến dịch"
              title="Mở nhanh bảng chiến dịch"
              className="inline-flex items-center gap-2 rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-700 hover:bg-zinc-100"
            >
              <Table2 className="size-4" />
              Bảng chiến dịch
            </Link>
          </div>
        </div>

        <div className="mt-4 grid min-w-0 gap-3 md:grid-cols-3">
          {quickCampaigns.length === 0 ? (
            <div className="min-w-0 rounded-md border border-dashed border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-500 md:col-span-3">
              Chưa có chiến dịch để mở nhanh.
            </div>
          ) : (
            quickCampaigns.map((campaign) => (
              <Link
                key={campaign.id}
                href={campaignRowHref(campaign.id)}
                aria-label={`Mở nhanh chiến dịch ${campaign.campaign_code}`}
                title={`Mở nhanh chiến dịch ${campaign.campaign_code}`}
                className="min-w-0 overflow-hidden rounded-md border border-zinc-200 bg-zinc-50 p-4 text-left transition hover:border-zinc-300 hover:bg-white"
              >
                <div className="flex min-w-0 items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-mono text-xs text-zinc-500">
                      {campaign.campaign_code}
                    </p>
                    <p className="mt-2 truncate text-sm font-semibold text-zinc-950">
                      {campaign.campaign_name}
                    </p>
                  </div>
                  <ArrowRight className="mt-0.5 size-4 shrink-0 text-zinc-500" />
                </div>
                <p className="mt-2 truncate text-xs font-medium text-zinc-500">
                  {campaign.status} · {campaign.source_name}
                </p>
                <p className="mt-2 break-words text-sm leading-6 text-zinc-600">
                  {campaign.lead_count} lead · {campaign.enrolled_count} nhập
                  học · chuyển đổi {campaign.conversion}
                </p>
              </Link>
            ))
          )}
        </div>
      </section>

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

      <section
        id="campaigns-table"
        className="scroll-mt-24 rounded-lg border border-zinc-200 bg-white shadow-sm"
      >
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
                  <tr
                    key={campaign.id}
                    id={`campaign-row-${campaign.id}`}
                    className="scroll-mt-24 align-top"
                  >
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
