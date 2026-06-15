import Link from "next/link";
import { AlertTriangle, ClipboardList, Plus, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { AdmissionSegmentOverviewRow } from "@/lib/admission-segments";

type AdmissionSegmentOverviewProps = {
  segments: AdmissionSegmentOverviewRow[];
  uncategorizedCount: number;
  compact?: boolean;
};

function formatNumber(value: number) {
  return new Intl.NumberFormat("vi-VN").format(value);
}

function groupSegments(segments: AdmissionSegmentOverviewRow[]) {
  const groups = new Map<string, AdmissionSegmentOverviewRow[]>();

  for (const segment of segments) {
    const rows = groups.get(segment.program_group) ?? [];
    rows.push(segment);
    groups.set(segment.program_group, rows);
  }

  return [...groups.entries()];
}

export function AdmissionSegmentOverview({
  segments,
  uncategorizedCount,
  compact = false,
}: AdmissionSegmentOverviewProps) {
  const groups = groupSegments(segments);

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <ClipboardList className="size-4 text-zinc-500" />
            <h2 className="text-base font-semibold">Đối tượng tuyển sinh</h2>
          </div>
          <p className="mt-1 text-sm leading-6 text-zinc-500">
            Tách riêng từng nhóm để tránh lẫn quy trình, hồ sơ, pháp chế, đối
            tác, COM và rủi ro tài chính.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {compact ? (
            <Button asChild variant="outline" size="sm">
              <Link href="/segments">
                <Users className="size-4" />
                Xem đầy đủ
              </Link>
            </Button>
          ) : null}
          <Button asChild size="sm">
            <Link href="/leads/new">
              <Plus className="size-4" />
              Tạo lead
            </Link>
          </Button>
        </div>
      </div>

      <div className="space-y-5">
        {uncategorizedCount > 0 ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            <div className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 size-4" />
              <p>
                Có {formatNumber(uncategorizedCount)} lead chưa gắn đối tượng
                tuyển sinh. Cần cập nhật để báo cáo và phân quyền không bị lẫn.
              </p>
            </div>
          </div>
        ) : null}

        {groups.length === 0 ? (
          <div className="rounded-md border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-500">
            Chưa có đối tượng tuyển sinh. Hãy chạy SQL step37 hoặc kiểm tra cấu
            hình master.
          </div>
        ) : (
          groups.map(([groupName, rows]) => (
            <div key={groupName} className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold uppercase text-zinc-500">
                  {groupName}
                </h3>
                <span className="text-xs text-zinc-500">
                  {rows.length} đối tượng
                </span>
              </div>
              <div
                className={`grid gap-3 ${
                  compact ? "xl:grid-cols-3" : "lg:grid-cols-2 xl:grid-cols-3"
                }`}
              >
                {rows.map((segment) => {
                  const conversion =
                    segment.leadCount > 0
                      ? (segment.enrolledCount / segment.leadCount) * 100
                      : 0;

                  return (
                    <article
                      key={segment.id}
                      className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-zinc-950">
                            {segment.segment_name}
                          </p>
                          <p className="mt-1 font-mono text-xs text-zinc-500">
                            {segment.segment_code}
                          </p>
                        </div>
                        <span className="rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-600">
                          {formatNumber(segment.leadCount)} lead
                        </span>
                      </div>

                      <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
                        <div className="rounded-md bg-zinc-50 p-2">
                          <p className="text-zinc-500">Đang xử lý</p>
                          <p className="mt-1 text-lg font-semibold text-zinc-950">
                            {formatNumber(segment.activeCount)}
                          </p>
                        </div>
                        <div className="rounded-md bg-emerald-50 p-2 text-emerald-700">
                          <p>Nhập học</p>
                          <p className="mt-1 text-lg font-semibold">
                            {formatNumber(segment.enrolledCount)}
                          </p>
                        </div>
                        <div className="rounded-md bg-sky-50 p-2 text-sky-700">
                          <p>Tỷ lệ</p>
                          <p className="mt-1 text-lg font-semibold">
                            {conversion.toFixed(1)}%
                          </p>
                        </div>
                      </div>

                      <dl className="mt-4 space-y-2 text-xs leading-5 text-zinc-600">
                        <div>
                          <dt className="font-medium text-zinc-800">Mô hình</dt>
                          <dd>{segment.delivery_context}</dd>
                        </div>
                        {!compact ? (
                          <>
                            <div>
                              <dt className="font-medium text-zinc-800">
                                Đối tác / COM
                              </dt>
                              <dd>{segment.partner_model}</dd>
                              <dd className="mt-1">{segment.commission_model}</dd>
                            </div>
                            <div>
                              <dt className="font-medium text-zinc-800">
                                Rủi ro chính
                              </dt>
                              <dd>{segment.finance_risk}</dd>
                            </div>
                          </>
                        ) : null}
                      </dl>

                      <div className="mt-4 flex items-center justify-between gap-3 text-xs text-zinc-500">
                        <span>{segment.owner_department}</span>
                        <Link
                          href={`/leads?segment=${segment.id}`}
                          className="font-medium text-zinc-800 underline"
                        >
                          Xem lead
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
