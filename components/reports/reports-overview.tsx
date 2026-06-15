import Link from "next/link";
import { BarChart3, CheckCircle2, FileDown, TrendingUp } from "lucide-react";

import { Button } from "@/components/ui/button";

type SummaryKpi = {
  label: string;
  value: string;
  note: string;
  tone: string;
};

type ReportRow = {
  key: string;
  label: string;
  count: number;
  percent: string;
};

type CounselorRow = {
  key: string;
  name: string;
  total: number;
  enrolled: number;
  followups: number;
  conversion: string;
};

type ReportsOverviewProps = {
  summary: SummaryKpi[];
  statusRows: ReportRow[];
  sourceRows: ReportRow[];
  flowRows: ReportRow[];
  counselorRows: CounselorRow[];
  lostReasonRows: ReportRow[];
  majorRows: ReportRow[];
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

function SimpleReportTable({
  title,
  description,
  rows,
  emptyText,
}: {
  title: string;
  description: string;
  rows: ReportRow[];
  emptyText: string;
}) {
  return (
    <section className="rounded-lg border border-zinc-200 bg-white shadow-sm">
      <div className="border-b border-zinc-200 p-5">
        <h2 className="text-base font-semibold">{title}</h2>
        <p className="mt-1 text-sm text-zinc-500">{description}</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-sm">
          <thead className="bg-zinc-50 text-left text-xs font-medium uppercase text-zinc-500">
            <tr>
              <th className="px-5 py-3">Nhóm</th>
              <th className="px-5 py-3">Số lead</th>
              <th className="px-5 py-3">Tỷ trọng</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200">
            {rows.length === 0 ? (
              <tr>
                <td className="px-5 py-6 text-center text-zinc-500" colSpan={3}>
                  {emptyText}
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.key}>
                  <td className="px-5 py-4">
                    <p className="font-medium text-zinc-900">{row.label}</p>
                  </td>
                  <td className="px-5 py-4 text-zinc-700">{row.count}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <CountBar percent={row.percent} />
                      <span className="w-14 text-right text-zinc-600">
                        {row.percent}
                      </span>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function ReportsOverview({
  summary,
  statusRows,
  sourceRows,
  flowRows,
  counselorRows,
  lostReasonRows,
  majorRows,
}: ReportsOverviewProps) {
  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summary.map((item) => (
          <article
            key={item.label}
            className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm"
          >
            <div
              className={`mb-4 inline-flex rounded-md border px-2 py-1 text-xs font-medium ${item.tone}`}
            >
              {item.label}
            </div>
            <p className="text-3xl font-semibold tracking-normal">{item.value}</p>
            <p className="mt-2 text-sm text-zinc-500">{item.note}</p>
          </article>
        ))}
      </section>

      <section className="rounded-lg border border-zinc-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-zinc-200 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold">Hiệu quả tư vấn viên</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Số lead, lead nhập học, follow-up mở và tỷ lệ chuyển đổi theo
              người phụ trách.
            </p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/leads">
              <FileDown className="size-4" />
              Xem dữ liệu lead
            </Link>
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="bg-zinc-50 text-left text-xs font-medium uppercase text-zinc-500">
              <tr>
                <th className="px-5 py-3">Tư vấn viên</th>
                <th className="px-5 py-3">Tổng lead</th>
                <th className="px-5 py-3">Đã nhập học</th>
                <th className="px-5 py-3">Follow-up mở</th>
                <th className="px-5 py-3">Chuyển đổi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {counselorRows.length === 0 ? (
                <tr>
                  <td className="px-5 py-6 text-center text-zinc-500" colSpan={5}>
                    Chưa có lead được phân công.
                  </td>
                </tr>
              ) : (
                counselorRows.map((row) => (
                  <tr key={row.key}>
                    <td className="px-5 py-4 font-medium text-zinc-900">
                      {row.name}
                    </td>
                    <td className="px-5 py-4 text-zinc-700">{row.total}</td>
                    <td className="px-5 py-4 text-zinc-700">{row.enrolled}</td>
                    <td className="px-5 py-4 text-zinc-700">{row.followups}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <CountBar percent={row.conversion} />
                        <span className="w-14 text-right text-zinc-600">
                          {row.conversion}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <SimpleReportTable
          title="Lead theo trạng thái"
          description="Phân bổ lead hiện tại trong pipeline tuyển sinh."
          rows={statusRows}
          emptyText="Chưa có dữ liệu trạng thái."
        />
        <SimpleReportTable
          title="Lead theo nguồn"
          description="Nguồn nào đang tạo nhiều lead nhất."
          rows={sourceRows}
          emptyText="Chưa có dữ liệu nguồn lead."
        />
        <SimpleReportTable
          title="Lead theo luồng tuyển sinh"
          description="Theo dõi 8 luồng tuyển sinh chính đang tạo lead."
          rows={flowRows}
          emptyText="Chưa có dữ liệu luồng tuyển sinh."
        />
        <SimpleReportTable
          title="Lead mất theo lý do"
          description="Chỉ tính các lead ở trạng thái LOST."
          rows={lostReasonRows}
          emptyText="Chưa có lead mất hoặc chưa nhập lý do mất."
        />
        <SimpleReportTable
          title="Ngành được quan tâm"
          description="Các ngành được học sinh/phụ huynh quan tâm nhiều nhất."
          rows={majorRows}
          emptyText="Chưa có dữ liệu ngành quan tâm."
        />
      </section>

      <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="size-5 text-emerald-600" />
              <h2 className="text-base font-semibold">Diễn giải nhanh</h2>
            </div>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-600">
              Báo cáo hiện đọc trực tiếp từ Supabase. Khi có thêm dữ liệu thật,
              các bảng này sẽ giúp so sánh hiệu quả nguồn lead, hiệu quả tư vấn
              viên, tỷ lệ chuyển đổi và lý do mất lead.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-md bg-zinc-50 px-3 py-2 text-sm text-zinc-600">
            <BarChart3 className="size-4" />
            MVP report
            <CheckCircle2 className="size-4 text-emerald-600" />
          </div>
        </div>
      </section>
    </div>
  );
}
