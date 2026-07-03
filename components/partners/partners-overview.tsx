import Link from "next/link";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Phone,
  Plus,
  Table2,
  TrendingUp,
  Users,
} from "lucide-react";

import { withAdmissionSegmentParam } from "@/lib/workspace-url";

type PartnerRow = {
  id: string;
  partner_code: string;
  partner_name: string;
  partner_type: string;
  phone: string | null;
  email: string | null;
  area: string | null;
  commission_note: string | null;
  contract_status: string | null;
  status: string;
  owner_name: string;
  lead_count: number;
  enrolled_count: number;
  conversion: string;
};

type PartnersOverviewProps = {
  partners: PartnerRow[];
  activeSegmentId?: string | null;
  summary: {
    totalPartners: number;
    activePartners: number;
    totalLeads: number;
    totalEnrolled: number;
    conversion: string;
  };
};

const typeLabels: Record<string, string> = {
  CTV: "CTV",
  THCS: "Trường THCS",
  TTGDTX: "TTGDTX",
  BUSINESS: "Doanh nghiệp",
  OTHER: "Khác",
};

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

function partnerRowHref(partnerId: string) {
  return `#partner-row-${partnerId}`;
}

export function PartnersOverview({
  partners,
  activeSegmentId = null,
  summary,
}: PartnersOverviewProps) {
  const quickPartners = [...partners]
    .sort((left, right) => {
      const leadDelta = right.lead_count - left.lead_count;
      if (leadDelta !== 0) {
        return leadDelta;
      }

      const enrolledDelta = right.enrolled_count - left.enrolled_count;
      if (enrolledDelta !== 0) {
        return enrolledDelta;
      }

      return left.partner_name.localeCompare(right.partner_name);
    })
    .slice(0, 3);
  const partnerCreateHref = withAdmissionSegmentParam(
    "/partners/new",
    activeSegmentId,
  );
  const leadsHref = withAdmissionSegmentParam("/leads", activeSegmentId);

  return (
    <div className="space-y-6">
      <section
        className="min-w-0 overflow-hidden rounded-lg border border-zinc-200 bg-white p-5 shadow-sm"
        data-heu-partner-quick-access="P0-06_PARTNER_QUICK_ACCESS"
        data-heu-partner-quick-open="P0-06_PARTNER_QUICK_OPEN_TOP3"
        data-heu-partner-quick-access-overflow-guard="P0-06_PARTNER_QUICK_ACCESS_NO_OVERFLOW"
        data-heu-partner-workspace-links="P0-06_PARTNER_WORKSPACE_LINKS"
        data-heu-partner-anchor-nav="new leads table top3"
      >
        <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex min-w-0 items-center gap-2 text-sm font-semibold text-zinc-950">
              <Building2 className="size-4 shrink-0 text-zinc-600" />
              <span className="truncate">Mở nhanh đối tác / nguồn</span>
            </div>
            <p className="mt-2 max-w-4xl break-words text-sm leading-6 text-zinc-600">
              Điều hướng nhanh tới tạo đối tác, lead liên quan và các nguồn có
              nhiều lead nhất. Phần này chỉ hỗ trợ mở đúng vị trí, không duyệt
              COM, hợp đồng hay thanh toán.
            </p>
          </div>

          <div className="flex shrink-0 flex-wrap gap-2 text-sm font-medium">
            <Link
              href={partnerCreateHref}
              aria-label="Mở nhanh tạo đối tác"
              title="Mở nhanh tạo đối tác"
              className="inline-flex items-center gap-2 rounded-md bg-zinc-950 px-3 py-2 text-white hover:bg-zinc-800"
            >
              <Plus className="size-4" />
              Tạo đối tác
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
              href="#partners-table"
              aria-label="Mở nhanh bảng đối tác"
              title="Mở nhanh bảng đối tác"
              className="inline-flex items-center gap-2 rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-700 hover:bg-zinc-100"
            >
              <Table2 className="size-4" />
              Bảng đối tác
            </Link>
          </div>
        </div>

        <div className="mt-4 grid min-w-0 gap-3 md:grid-cols-3">
          {quickPartners.length === 0 ? (
            <div className="min-w-0 rounded-md border border-dashed border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-500 md:col-span-3">
              Chưa có đối tác để mở nhanh.
            </div>
          ) : (
            quickPartners.map((partner) => (
              <Link
                key={partner.id}
                href={partnerRowHref(partner.id)}
                aria-label={`Mở nhanh đối tác ${partner.partner_code}`}
                title={`Mở nhanh đối tác ${partner.partner_code}`}
                className="min-w-0 overflow-hidden rounded-md border border-zinc-200 bg-zinc-50 p-4 text-left transition hover:border-zinc-300 hover:bg-white"
              >
                <div className="flex min-w-0 items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-mono text-xs text-zinc-500">
                      {partner.partner_code}
                    </p>
                    <p className="mt-2 truncate text-sm font-semibold text-zinc-950">
                      {partner.partner_name}
                    </p>
                  </div>
                  <ArrowRight className="mt-0.5 size-4 shrink-0 text-zinc-500" />
                </div>
                <p className="mt-2 truncate text-xs font-medium text-zinc-500">
                  {typeLabels[partner.partner_type] ?? partner.partner_type} ·{" "}
                  {partner.status}
                </p>
                <p className="mt-2 break-words text-sm leading-6 text-zinc-600">
                  {partner.lead_count} lead · {partner.enrolled_count} nhập học
                  · chuyển đổi {partner.conversion}
                </p>
              </Link>
            ))
          )}
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="mb-4 inline-flex rounded-md border border-sky-200 bg-sky-50 px-2 py-1 text-xs font-medium text-sky-700">
            Tổng đối tác
          </div>
          <p className="text-3xl font-semibold">{summary.totalPartners}</p>
          <p className="mt-2 text-sm text-zinc-500">
            {summary.activePartners} đang active
          </p>
        </article>
        <article className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="mb-4 inline-flex rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
            Lead mang về
          </div>
          <p className="text-3xl font-semibold">{summary.totalLeads}</p>
          <p className="mt-2 text-sm text-zinc-500">Tính theo partner_id</p>
        </article>
        <article className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="mb-4 inline-flex rounded-md border border-violet-200 bg-violet-50 px-2 py-1 text-xs font-medium text-violet-700">
            Đã nhập học
          </div>
          <p className="text-3xl font-semibold">{summary.totalEnrolled}</p>
          <p className="mt-2 text-sm text-zinc-500">
            Từ nguồn đối tác/CTV
          </p>
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
        id="partners-table"
        className="scroll-mt-24 rounded-lg border border-zinc-200 bg-white shadow-sm"
      >
        <div className="border-b border-zinc-200 p-5">
          <h2 className="text-base font-semibold">Danh sách đối tác</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Theo dõi CTV, trường THCS, TTGDTX, doanh nghiệp và hiệu quả chuyển
            đổi. COM hiện chỉ lưu mô tả, chưa tự động chi.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1120px] text-sm">
            <thead className="bg-zinc-50 text-left text-xs font-medium uppercase text-zinc-500">
              <tr>
                <th className="px-5 py-3">Đối tác</th>
                <th className="px-5 py-3">Loại / khu vực</th>
                <th className="px-5 py-3">Liên hệ</th>
                <th className="px-5 py-3">Phụ trách HEU</th>
                <th className="px-5 py-3">Lead</th>
                <th className="px-5 py-3">Nhập học</th>
                <th className="px-5 py-3">Chuyển đổi</th>
                <th className="px-5 py-3">COM / hợp đồng</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {partners.length === 0 ? (
                <tr>
                  <td className="px-5 py-6 text-center text-zinc-500" colSpan={8}>
                    Chưa có đối tác.
                  </td>
                </tr>
              ) : (
                partners.map((partner) => (
                  <tr
                    key={partner.id}
                    id={`partner-row-${partner.id}`}
                    className="scroll-mt-24 align-top"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-start gap-3">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-zinc-100">
                          <Building2 className="size-4 text-zinc-600" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-zinc-950">
                            {partner.partner_name}
                          </p>
                          <p className="mt-1 text-xs text-zinc-500">
                            {partner.partner_code}
                          </p>
                          <span className="mt-2 inline-flex rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-700">
                            {partner.status}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-medium text-zinc-700">
                        {typeLabels[partner.partner_type] ??
                          partner.partner_type}
                      </p>
                      <p className="mt-1 text-zinc-500">
                        {partner.area ?? "Chưa nhập khu vực"}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="flex items-center gap-2 text-zinc-700">
                        <Phone className="size-4 text-zinc-400" />
                        {partner.phone ?? "Chưa có SĐT"}
                      </p>
                      <p className="mt-1 text-zinc-500">
                        {partner.email ?? "Chưa có email"}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-zinc-700">
                      {partner.owner_name}
                    </td>
                    <td className="px-5 py-4">
                      <div className="inline-flex items-center gap-2 rounded-md bg-sky-50 px-2 py-1 font-medium text-sky-700">
                        <Users className="size-4" />
                        {partner.lead_count}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="inline-flex items-center gap-2 rounded-md bg-emerald-50 px-2 py-1 font-medium text-emerald-700">
                        <CheckCircle2 className="size-4" />
                        {partner.enrolled_count}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <CountBar percent={partner.conversion} />
                        <span className="w-14 text-right text-zinc-600">
                          {partner.conversion}
                        </span>
                      </div>
                    </td>
                    <td className="max-w-xs px-5 py-4">
                      <p className="text-zinc-700">
                        {partner.commission_note ?? "Chưa có mô tả COM"}
                      </p>
                      <p className="mt-2 inline-flex items-center gap-1 text-xs text-zinc-500">
                        <TrendingUp className="size-3.5" />
                        Hợp đồng: {partner.contract_status ?? "Chưa nhập"}
                      </p>
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
