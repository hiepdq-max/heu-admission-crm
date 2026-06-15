import { AlertTriangle, Route } from "lucide-react";

export type AdmissionSegmentRow = {
  id: string;
  segment_code: string;
  segment_name: string;
  program_group: string;
  admission_object: string;
  delivery_context: string;
  partner_model: string;
  commission_model: string;
  contract_model: string;
  finance_risk: string;
  owner_department: string;
  sort_order: number;
  status: string;
};

type AdmissionSegmentSettingsProps = {
  segments: AdmissionSegmentRow[];
  loadError?: string;
};

export function AdmissionSegmentSettings({
  segments,
  loadError,
}: AdmissionSegmentSettingsProps) {
  return (
    <section
      id="segments"
      className="rounded-lg border border-zinc-200 bg-white shadow-sm"
    >
      <div className="border-b border-zinc-200 p-5">
        <div className="flex items-center gap-2">
          <Route className="size-4 text-zinc-500" />
          <h2 className="text-base font-semibold">Đối tượng tuyển sinh</h2>
        </div>
        <p className="mt-1 text-sm text-zinc-500">
          Tách riêng từng đối tượng tuyển sinh để quản lý đúng mô hình liên
          kết, COM, hợp đồng, tài chính và rủi ro.
        </p>
      </div>

      {loadError ? (
        <div className="m-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <div className="flex gap-3">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            <p>
              Chưa đọc được danh mục đối tượng tuyển sinh. Hãy chạy file SQL{" "}
              <span className="font-mono">
                database/step37_admission_segments.sql
              </span>{" "}
              trong Supabase SQL Editor rồi tải lại trang. Chi tiết: {loadError}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 p-5 xl:grid-cols-2">
          {segments.map((segment) => (
            <article
              key={segment.id}
              className="rounded-lg border border-zinc-200 bg-zinc-50 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-zinc-950">
                    {segment.segment_name}
                  </h3>
                  <p className="mt-1 text-xs font-medium text-zinc-500">
                    {segment.segment_code}
                  </p>
                </div>
                <span className="rounded-md bg-white px-2 py-1 text-xs font-medium text-zinc-600">
                  {segment.program_group}
                </span>
              </div>

              <div className="mt-4 space-y-3 text-sm leading-6 text-zinc-700">
                <p>
                  <span className="font-medium text-zinc-950">Đối tượng: </span>
                  {segment.admission_object}
                </p>
                <p>
                  <span className="font-medium text-zinc-950">Mô hình: </span>
                  {segment.delivery_context}
                </p>
                <p>
                  <span className="font-medium text-zinc-950">Đối tác: </span>
                  {segment.partner_model}
                </p>
                <p>
                  <span className="font-medium text-zinc-950">COM: </span>
                  {segment.commission_model}
                </p>
                <p>
                  <span className="font-medium text-zinc-950">Hợp đồng: </span>
                  {segment.contract_model}
                </p>
                <p className="rounded-md border border-amber-200 bg-amber-50 p-3 text-amber-800">
                  <span className="font-medium">Rủi ro: </span>
                  {segment.finance_risk}
                </p>
              </div>
            </article>
          ))}

          {segments.length === 0 ? (
            <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-5 text-sm text-zinc-500">
              Chưa có đối tượng tuyển sinh active.
            </div>
          ) : null}
        </div>
      )}
    </section>
  );
}
