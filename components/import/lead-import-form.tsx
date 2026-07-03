"use client";

import Link from "next/link";
import { useActionState, useRef } from "react";
import {
  AlertCircle,
  ArrowRight,
  ClipboardPaste,
  FileText,
  Loader2,
  Upload,
} from "lucide-react";

import {
  importLeadsAction,
  type ImportLeadState,
} from "@/app/import/actions";
import { Button } from "@/components/ui/button";
import { withAdmissionSegmentParam } from "@/lib/workspace-url";

type Option = {
  id: string;
  label: string;
};

type LeadImportFormProps = {
  sources: Option[];
  flows: Option[];
  segments: Option[];
  campaigns: Option[];
  partners: Option[];
  defaultSegmentId?: string;
  hasSegmentScope?: boolean;
  lockSegmentSelection?: boolean;
};

const initialState: ImportLeadState = {};

const inputClass =
  "h-10 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm outline-none transition focus:border-zinc-500 focus:ring-3 focus:ring-zinc-200";

const textareaClass =
  "min-h-40 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 font-mono text-sm outline-none transition focus:border-zinc-500 focus:ring-3 focus:ring-zinc-200";

const sampleCsv = `student_name,student_phone,parent_name,parent_phone,current_school,current_grade,segment_code,program_code,major_code,flow_code,province,ward,legacy_district,note
Nguyen Van Test,0912345678,Nguyen Thi Phu Huynh,0987654321,THCS Mau,9,TC9_TTGDTX_LINKED,TRUNG_CAP,HUONG_DAN_DU_LICH,ONLINE_MARKETING,Ha Noi,Phuong Mau,Quan cu neu co,Import thu`;

function ImportQuickMetric({
  label,
  value,
  href,
  tone,
}: {
  label: string;
  value: number | string;
  href: string;
  tone: string;
}) {
  return (
    <a
      href={href}
      aria-label={`Đi tới phần import ${label}`}
      title={`Đi tới phần import ${label}`}
      className={`block min-w-0 overflow-hidden rounded-md border px-3 py-2 text-sm transition hover:shadow-sm ${tone}`}
    >
      <span className="block truncate text-xs font-medium">{label}</span>
      <span className="mt-1 block truncate text-xl font-semibold">{value}</span>
    </a>
  );
}

function ImportQuickAccess({
  segmentLabel,
  sourceCount,
  flowCount,
  partnerCount,
  leadsHref,
  onPasteSample,
}: {
  segmentLabel: string;
  sourceCount: number;
  flowCount: number;
  partnerCount: number;
  leadsHref: string;
  onPasteSample: () => void;
}) {
  return (
    <section
      className="min-w-0 overflow-hidden rounded-lg border border-zinc-200 bg-white p-4 shadow-sm"
      data-heu-import-quick-access="P0-14_IMPORT_QUICK_ACCESS"
      data-heu-import-sample-paste="P0-14_IMPORT_SAMPLE_PASTE"
      data-heu-import-quick-access-overflow-guard="P0-14_IMPORT_QUICK_ACCESS_NO_OVERFLOW"
      data-heu-import-anchor-nav="defaults csv submit result"
    >
      <div className="flex min-w-0 flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex min-w-0 items-center gap-2 text-sm font-semibold text-zinc-900">
            <FileText className="size-4 shrink-0 text-zinc-500" />
            <span className="truncate">Mở nhanh import lead</span>
          </div>
          <p className="mt-1 break-words text-sm text-zinc-500">
            Workspace: <span className="font-medium text-zinc-700">{segmentLabel}</span>
          </p>
        </div>

        <div className="flex min-w-0 flex-wrap gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href={leadsHref}>
              Xem lead
              <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={onPasteSample}>
            <ClipboardPaste className="size-4" />
            Dán CSV mẫu
          </Button>
        </div>
      </div>

      <div className="mt-4 grid min-w-0 grid-cols-2 gap-2 md:grid-cols-4">
        <ImportQuickMetric
          label="Mặc định"
          value="1"
          href="#import-defaults"
          tone="border-emerald-200 bg-emerald-50 text-emerald-700"
        />
        <ImportQuickMetric
          label="Nguồn"
          value={sourceCount}
          href="#import-defaults"
          tone="border-sky-200 bg-sky-50 text-sky-700"
        />
        <ImportQuickMetric
          label="Luồng"
          value={flowCount}
          href="#import-defaults"
          tone="border-violet-200 bg-violet-50 text-violet-700"
        />
        <ImportQuickMetric
          label="Đối tác"
          value={partnerCount}
          href="#import-csv"
          tone="border-amber-200 bg-amber-50 text-amber-700"
        />
      </div>
    </section>
  );
}

function SelectField({
  label,
  name,
  options,
  placeholder,
  defaultValue = "",
  required = false,
}: {
  label: string;
  name: string;
  options: Option[];
  placeholder: string;
  defaultValue?: string;
  required?: boolean;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={name} className="text-sm font-medium text-zinc-700">
        {label}
      </label>
      <select
        id={name}
        name={name}
        className={inputClass}
        defaultValue={defaultValue}
        required={required}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function ResultPanel({ state }: { state: ImportLeadState }) {
  if (state.error) {
    return (
      <section
        id="import-result"
        className="scroll-mt-24 rounded-lg border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700"
      >
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <p>{state.error}</p>
        </div>
      </section>
    );
  }

  if (!state.result) {
    return null;
  }

  return (
    <section
      id="import-result"
      className="scroll-mt-24 rounded-lg border border-emerald-200 bg-emerald-50 p-5"
    >
      <h2 className="text-base font-semibold text-emerald-900">
        Kết quả import
      </h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-4">
        <div className="rounded-md bg-white p-3">
          <p className="text-xs text-zinc-500">Tổng dòng</p>
          <p className="text-2xl font-semibold">{state.result.totalRows}</p>
        </div>
        <div className="rounded-md bg-white p-3">
          <p className="text-xs text-zinc-500">Đã lưu</p>
          <p className="text-2xl font-semibold text-emerald-700">
            {state.result.inserted}
          </p>
        </div>
        <div className="rounded-md bg-white p-3">
          <p className="text-xs text-zinc-500">Bỏ qua</p>
          <p className="text-2xl font-semibold text-amber-700">
            {state.result.skipped}
          </p>
        </div>
        <div className="rounded-md bg-white p-3">
          <p className="text-xs text-zinc-500">Lỗi</p>
          <p className="text-2xl font-semibold text-rose-700">
            {state.result.errors.length}
          </p>
        </div>
      </div>

      {state.result.errors.length > 0 || state.result.duplicates.length > 0 ? (
        <div className="mt-4 rounded-md bg-white p-4 text-sm text-zinc-700">
          <p className="font-medium">Chi tiết dòng bỏ qua</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {[...state.result.errors, ...state.result.duplicates]
              .slice(0, 10)
              .map((message) => (
                <li key={message}>{message}</li>
              ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}

export function LeadImportForm({
  sources,
  flows,
  segments,
  campaigns,
  partners,
  defaultSegmentId = "",
  hasSegmentScope = false,
  lockSegmentSelection = false,
}: LeadImportFormProps) {
  const [state, formAction, isPending] = useActionState(
    importLeadsAction,
    initialState,
  );
  const csvTextRef = useRef<HTMLTextAreaElement>(null);
  const cannotImportByScope = hasSegmentScope && segments.length === 0;
  const activeSegmentLabel =
    segments.find((segment) => segment.id === defaultSegmentId)?.label ??
    "Workspace đang chọn";
  const leadsHref = withAdmissionSegmentParam("/leads", defaultSegmentId);

  function pasteSampleCsv() {
    if (!csvTextRef.current) {
      return;
    }

    csvTextRef.current.value = sampleCsv;
    csvTextRef.current.focus();
  }

  return (
    <div className="space-y-6">
      <ImportQuickAccess
        segmentLabel={activeSegmentLabel}
        sourceCount={sources.length}
        flowCount={flows.length}
        partnerCount={partners.length}
        leadsHref={leadsHref}
        onPasteSample={pasteSampleCsv}
      />

      <ResultPanel state={state} />

      {cannotImportByScope ? (
        <section className="rounded-lg border border-rose-200 bg-rose-50 p-5 text-sm leading-6 text-rose-700">
          Tài khoản này chưa được phân đối tượng tuyển sinh nên chưa thể import
          lead. Hãy nhờ ADMIN hoặc trưởng phòng vào Phạm vi user để phân đúng
          đối tượng trước.
        </section>
      ) : null}

      <form action={formAction} className="space-y-6">
        <section
          id="import-defaults"
          className="scroll-mt-24 rounded-lg border border-zinc-200 bg-white p-5 shadow-sm"
        >
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-zinc-100">
              <FileText className="size-5 text-zinc-600" />
            </div>
            <div>
              <h2 className="text-base font-semibold">Import lead từ CSV</h2>
              <p className="mt-1 text-sm text-zinc-500">
                Dùng file CSV xuất từ Excel hoặc dán nội dung CSV. Hệ thống sẽ
                bỏ qua số điện thoại đã tồn tại để tránh tạo trùng lead.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {lockSegmentSelection && defaultSegmentId ? (
              <div
                className="space-y-2"
                data-heu-import-workspace-lock="P0-14_IMPORT_WORKSPACE_LOCK"
              >
                <p className="text-sm font-medium text-zinc-700">
                  Đối tượng tuyển sinh mặc định
                </p>
                <input
                  type="hidden"
                  name="default_admission_segment_id"
                  value={defaultSegmentId}
                />
                <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
                  {segments.find((segment) => segment.id === defaultSegmentId)
                    ?.label ?? "Workspace đang chọn"}
                </div>
                <p className="text-xs text-zinc-500">
                  P0-14 khóa import vào đúng workspace này. Nếu CSV có cột đối
                  tượng khác, dòng đó sẽ bị báo lỗi.
                </p>
              </div>
            ) : (
              <SelectField
                label="Đối tượng tuyển sinh mặc định"
                name="default_admission_segment_id"
                options={segments}
                placeholder="Chọn đối tượng"
                defaultValue={defaultSegmentId}
                required={hasSegmentScope}
              />
            )}
            <SelectField
              label="Nguồn mặc định"
              name="default_source_id"
              options={sources}
              placeholder="Không gắn nguồn"
            />
            <SelectField
              label="Luồng mặc định"
              name="default_flow_id"
              options={flows}
              placeholder="Không gắn luồng"
            />
            <SelectField
              label="Chiến dịch mặc định"
              name="default_campaign_id"
              options={campaigns}
              placeholder="Không gắn chiến dịch"
            />
            <SelectField
              label="Đối tác mặc định"
              name="default_partner_id"
              options={partners}
              placeholder="Không gắn đối tác"
            />
          </div>
        </section>

        <section
          id="import-csv"
          className="scroll-mt-24 rounded-lg border border-zinc-200 bg-white p-5 shadow-sm"
        >
          <h2 className="text-base font-semibold">Dữ liệu CSV</h2>
          <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="csv_file"
                  className="text-sm font-medium text-zinc-700"
                >
                  Chọn file .csv
                </label>
                <input
                  id="csv_file"
                  name="csv_file"
                  type="file"
                  accept=".csv,text/csv"
                  className={inputClass}
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="csv_text"
                  className="text-sm font-medium text-zinc-700"
                >
                  Hoặc dán nội dung CSV
                </label>
                <textarea
                  ref={csvTextRef}
                  id="csv_text"
                  name="csv_text"
                  className={textareaClass}
                  placeholder={sampleCsv}
                />
              </div>
            </div>

            <aside className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
              <h3 className="text-sm font-semibold">Cột CSV hỗ trợ</h3>
              <p className="mt-2 text-sm text-zinc-600">
                Bắt buộc: <span className="font-medium">student_name</span> và
                ít nhất một số điện thoại.
              </p>
              <div className="mt-4 rounded-md bg-white p-3">
                <pre className="whitespace-pre-wrap text-xs leading-5 text-zinc-700">
                  {sampleCsv}
                </pre>
              </div>
              <p className="mt-3 text-xs text-zinc-500">
                Có thể thêm: student_dob, student_gender, current_school,
                current_grade, graduation_year, program_code, program_name,
                major_code, major_name, interested_program, interested_major,
                province, ward, legacy_district, source_code, flow_code,
                flow_name, admission_flow, campaign_code, partner_code, status,
                priority, note. Cột legacy_district chỉ dùng cho quận/huyện cũ
                trước 01/07/2025. Nếu đang chọn workspace P0-13, cột
                segment_code/segment_name trong CSV phải khớp workspace đó hoặc
                bỏ trống.
              </p>
            </aside>
          </div>
        </section>

        <div id="import-submit" className="flex scroll-mt-24 justify-end">
          <Button type="submit" disabled={isPending || cannotImportByScope}>
            {isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Upload className="size-4" />
            )}
            Import lead
          </Button>
        </div>
      </form>
    </div>
  );
}
