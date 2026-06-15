import {
  AlertTriangle,
  CheckCircle2,
  FileArchive,
  FileCheck2,
  FilePlus2,
  LinkIcon,
  Save,
  ShieldAlert,
} from "lucide-react";

import {
  createEvidenceDocumentAction,
  updateEvidenceDocumentAction,
} from "@/app/master-control/actions";
import { Button } from "@/components/ui/button";

export type EvidenceDocumentRow = {
  id: string;
  evidence_code: string;
  evidence_title: string;
  evidence_type: string;
  entity_type: string;
  entity_id: string | null;
  entity_code: string | null;
  lead_id: string | null;
  lead_code: string | null;
  student_name: string | null;
  approval_request_id: string | null;
  request_code: string | null;
  request_title: string | null;
  file_url: string;
  file_name: string | null;
  file_mime_hint: string | null;
  file_date: string | null;
  storage_provider: string;
  confidentiality: string;
  document_status: string;
  verification_note: string | null;
  checked_by: string | null;
  checked_by_name: string | null;
  checked_at: string | null;
  note: string | null;
  created_by: string | null;
  created_by_name: string | null;
  created_at: string;
  updated_at: string;
  control_flags: string[] | null;
  control_status: string;
};

export type EvidenceDocumentSummaryRow = {
  evidence_count: number;
  ready_count: number;
  waiting_check_count: number;
  needs_fix_count: number;
  blocked_count: number;
  sensitive_count: number;
};

export type EvidenceRequestOptionRow = {
  id: string;
  request_code: string;
  request_title: string;
  request_status: string;
};

type EvidenceDocumentControlProps = {
  rows: EvidenceDocumentRow[];
  summary?: EvidenceDocumentSummaryRow | null;
  requestOptions: EvidenceRequestOptionRow[];
  canCreate: boolean;
  canCheck: boolean;
  loadError?: string;
};

const inputClass =
  "h-10 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm outline-none transition focus:border-zinc-500 focus:ring-3 focus:ring-zinc-200";

const textareaClass =
  "min-h-24 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-zinc-500 focus:ring-3 focus:ring-zinc-200";

const evidenceTypes = [
  "STUDENT_DOCUMENT",
  "TUITION_PROOF",
  "COM_PROOF",
  "PAYMENT_VOUCHER",
  "CONTRACT",
  "DECISION",
  "LOCATION_PROOF",
  "HOU_DOCUMENT",
  "REQUEST_EVIDENCE",
  "LEGAL_SOP",
  "AI_LOG",
  "OTHER",
];

const evidenceTypeLabels: Record<string, string> = {
  STUDENT_DOCUMENT: "Hồ sơ học sinh",
  TUITION_PROOF: "Minh chứng học phí",
  COM_PROOF: "Minh chứng COM",
  PAYMENT_VOUCHER: "Chứng từ thanh toán",
  CONTRACT: "Hợp đồng",
  DECISION: "Quyết định",
  LOCATION_PROOF: "Minh chứng địa điểm",
  HOU_DOCUMENT: "Tài liệu HOU",
  REQUEST_EVIDENCE: "Minh chứng request",
  LEGAL_SOP: "Pháp chế / SOP",
  AI_LOG: "Log AI",
  OTHER: "Khác",
};

const storageProviders = [
  "GOOGLE_DRIVE",
  "SUPABASE_STORAGE",
  "URL",
  "LOCAL_NOTE",
  "OTHER",
];

const storageProviderLabels: Record<string, string> = {
  GOOGLE_DRIVE: "Google Drive",
  SUPABASE_STORAGE: "Supabase Storage",
  URL: "Link ngoài",
  LOCAL_NOTE: "Ghi chú nội bộ",
  OTHER: "Khác",
};

const confidentialityOptions = [
  "PUBLIC",
  "INTERNAL",
  "CONFIDENTIAL",
  "RESTRICTED",
  "SECRET",
];

const confidentialityLabels: Record<string, string> = {
  PUBLIC: "Công khai",
  INTERNAL: "Nội bộ",
  CONFIDENTIAL: "Bảo mật",
  RESTRICTED: "Giới hạn người xem",
  SECRET: "Tối mật",
};

const statusLabels: Record<string, string> = {
  DRAFT: "Bản nháp",
  SUBMITTED: "Chờ kiểm",
  CHECKED: "Đã kiểm",
  NEEDS_FIX: "Cần bổ sung",
  REJECTED: "Từ chối",
  ARCHIVED: "Lưu trữ",
};

const controlLabels: Record<string, string> = {
  READY: "Sẵn sàng",
  WAITING_CHECK: "Chờ kiểm",
  NEEDS_FIX: "Cần sửa",
  BLOCKED: "Đang bị chặn",
};

const controlTones: Record<string, string> = {
  READY: "border-emerald-200 bg-emerald-50 text-emerald-700",
  WAITING_CHECK: "border-sky-200 bg-sky-50 text-sky-700",
  NEEDS_FIX: "border-amber-200 bg-amber-50 text-amber-800",
  BLOCKED: "border-rose-200 bg-rose-50 text-rose-700",
};

const flagLabels: Record<string, string> = {
  MISSING_FILE_URL: "Thiếu link/file",
  MISSING_TITLE: "Thiếu tiêu đề",
  WAITING_CHECK: "Đang chờ kiểm",
  NEEDS_FIX: "Cần bổ sung",
  REJECTED: "Đã từ chối",
  SENSITIVE: "Dữ liệu nhạy cảm",
};

function formatNumber(value: number | null | undefined) {
  return new Intl.NumberFormat("vi-VN").format(value ?? 0);
}

function formatDateTime(value: string | null) {
  if (!value) {
    return "Chưa có";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function Metric({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: typeof FileCheck2;
}) {
  return (
    <article className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-md bg-zinc-100">
          <Icon className="size-5 text-zinc-600" />
        </div>
        <div>
          <p className="text-2xl font-semibold">{formatNumber(value)}</p>
          <p className="text-sm text-zinc-500">{label}</p>
        </div>
      </div>
    </article>
  );
}

function ControlFlags({ flags }: { flags: string[] | null }) {
  if (!flags || flags.length === 0) {
    return (
      <span className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
        Không cảnh báo
      </span>
    );
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {flags.map((flag) => (
        <span
          key={flag}
          className="rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-medium text-amber-800"
        >
          {flagLabels[flag] ?? flag}
        </span>
      ))}
    </div>
  );
}

export function EvidenceDocumentControl({
  rows,
  summary,
  requestOptions,
  canCreate,
  canCheck,
  loadError,
}: EvidenceDocumentControlProps) {
  if (loadError) {
    return (
      <section className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-800">
        <div className="flex items-start gap-3">
          <ShieldAlert className="mt-0.5 size-5 shrink-0" />
          <div>
            <h2 className="font-semibold">
              Chưa có Evidence & Document Control P0-09
            </h2>
            <p className="mt-1">
              Hãy chạy file{" "}
              <span className="font-mono">
                database/step48_evidence_document_control.sql
              </span>{" "}
              trong Supabase SQL Editor rồi tải lại Master Control. Chi tiết:{" "}
              {loadError}
            </p>
          </div>
        </div>
      </section>
    );
  }

  const effectiveSummary = summary ?? {
    evidence_count: rows.length,
    ready_count: rows.filter((row) => row.control_status === "READY").length,
    waiting_check_count: rows.filter(
      (row) => row.control_status === "WAITING_CHECK",
    ).length,
    needs_fix_count: rows.filter((row) => row.control_status === "NEEDS_FIX")
      .length,
    blocked_count: rows.filter((row) => row.control_status === "BLOCKED")
      .length,
    sensitive_count: rows.filter((row) =>
      ["RESTRICTED", "SECRET"].includes(row.confidentiality),
    ).length,
  };

  return (
    <section className="space-y-5">
      <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <FileArchive className="size-5 text-zinc-600" />
              <h2 className="text-lg font-semibold">
                Evidence & Document Control P0-09
              </h2>
            </div>
            <p className="mt-2 max-w-4xl text-sm leading-6 text-zinc-500">
              Registry chung cho link Drive, ảnh, chứng từ, hợp đồng, quyết
              định, hồ sơ học sinh và log AI. Mục tiêu là request nào cần duyệt
              cũng có minh chứng rõ ràng, đúng bảo mật và có người kiểm.
            </p>
          </div>
          <span className="rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-medium text-zinc-600">
            Có file/link · Có phân loại · Có bảo mật · Có người kiểm
          </span>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <Metric
          label="Đã kiểm"
          value={effectiveSummary.ready_count}
          icon={CheckCircle2}
        />
        <Metric
          label="Chờ kiểm"
          value={effectiveSummary.waiting_check_count}
          icon={FileCheck2}
        />
        <Metric
          label="Cần bổ sung"
          value={effectiveSummary.needs_fix_count}
          icon={AlertTriangle}
        />
        <Metric
          label="Bị chặn"
          value={effectiveSummary.blocked_count}
          icon={ShieldAlert}
        />
        <Metric
          label="Nhạy cảm"
          value={effectiveSummary.sensitive_count}
          icon={FileArchive}
        />
      </div>

      {canCreate ? (
        <section className="rounded-lg border border-zinc-200 bg-white shadow-sm">
          <div className="border-b border-zinc-200 p-5">
            <h3 className="text-base font-semibold">Thêm minh chứng</h3>
            <p className="mt-1 text-sm text-zinc-500">
              Dán link Drive/file/ảnh/chứng từ vào registry chung. Nếu minh
              chứng thuộc một workflow request, hãy chọn request tương ứng.
            </p>
          </div>
          <form
            action={createEvidenceDocumentAction}
            className="grid gap-4 p-5 lg:grid-cols-4"
          >
            <input
              name="evidence_title"
              className={inputClass}
              placeholder="Tiêu đề minh chứng"
              required
            />
            <select name="evidence_type" className={inputClass} defaultValue="OTHER">
              {evidenceTypes.map((type) => (
                <option key={type} value={type}>
                  {evidenceTypeLabels[type] ?? type}
                </option>
              ))}
            </select>
            <input
              name="entity_type"
              className={inputClass}
              placeholder="LEAD / COM_BATCH / HOU / AI"
              defaultValue="GENERAL"
              required
            />
            <input
              name="entity_code"
              className={inputClass}
              placeholder="Mã đối tượng nếu có"
            />
            <select
              name="approval_request_id"
              className={inputClass}
              defaultValue=""
            >
              <option value="">Không gắn workflow request</option>
              {requestOptions.map((request) => (
                <option key={request.id} value={request.id}>
                  {request.request_code} - {request.request_title}
                </option>
              ))}
            </select>
            <input name="lead_id" className={inputClass} placeholder="Lead UUID nếu có" />
            <input name="entity_id" className={inputClass} placeholder="Entity UUID nếu có" />
            <input name="file_date" type="date" className={inputClass} />
            <input
              name="file_url"
              className={`${inputClass} lg:col-span-2`}
              placeholder="https://drive.google.com/..."
              required
            />
            <input name="file_name" className={inputClass} placeholder="Tên file nếu có" />
            <select
              name="file_mime_hint"
              className={inputClass}
              defaultValue=""
            >
              <option value="">Không rõ loại file</option>
              <option value="image">Ảnh</option>
              <option value="application/pdf">PDF</option>
              <option value="application/vnd.openxmlformats-officedocument.wordprocessingml.document">
                Word
              </option>
              <option value="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet">
                Excel
              </option>
            </select>
            <select
              name="storage_provider"
              className={inputClass}
              defaultValue="GOOGLE_DRIVE"
            >
              {storageProviders.map((provider) => (
                <option key={provider} value={provider}>
                  {storageProviderLabels[provider] ?? provider}
                </option>
              ))}
            </select>
            <select
              name="confidentiality"
              className={inputClass}
              defaultValue="INTERNAL"
            >
              {confidentialityOptions.map((level) => (
                <option key={level} value={level}>
                  {confidentialityLabels[level] ?? level}
                </option>
              ))}
            </select>
            <select
              name="document_status"
              className={inputClass}
              defaultValue="SUBMITTED"
            >
              <option value="SUBMITTED">Gửi kiểm</option>
              <option value="DRAFT">Bản nháp</option>
            </select>
            <textarea
              name="note"
              className={`${textareaClass} lg:col-span-4`}
              placeholder="Ghi chú minh chứng, nguồn file, lưu ý bảo mật..."
            />
            <div className="lg:col-span-4">
              <Button type="submit">
                <FilePlus2 className="size-4" />
                Thêm minh chứng
              </Button>
            </div>
          </form>
        </section>
      ) : null}

      <section className="rounded-lg border border-zinc-200 bg-white shadow-sm">
        <div className="border-b border-zinc-200 p-5">
          <h3 className="text-base font-semibold">Bảng kiểm minh chứng</h3>
          <p className="mt-1 text-sm text-zinc-500">
            Minh chứng bắt buộc phải có link/file, phân loại đúng, mức bảo mật
            phù hợp và được kiểm trước khi dùng để duyệt request quan trọng.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1220px] text-sm">
            <thead className="bg-zinc-50 text-left text-xs font-medium uppercase text-zinc-500">
              <tr>
                <th className="px-5 py-3">Minh chứng</th>
                <th className="px-5 py-3">Đối tượng</th>
                <th className="px-5 py-3">File / bảo mật</th>
                <th className="px-5 py-3">Kiểm soát</th>
                <th className="px-5 py-3">Cảnh báo</th>
                {canCheck ? <th className="px-5 py-3">Cập nhật</th> : null}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {rows.length === 0 ? (
                <tr>
                  <td
                    className="px-5 py-8 text-center text-zinc-500"
                    colSpan={canCheck ? 6 : 5}
                  >
                    Chưa có minh chứng trong registry chung.
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.id} className="align-top">
                    <td className="px-5 py-4">
                      <p className="font-mono text-xs text-zinc-500">
                        {row.evidence_code}
                      </p>
                      <p className="mt-1 font-medium text-zinc-950">
                        {row.evidence_title}
                      </p>
                      <p className="mt-2 text-xs text-zinc-500">
                        {evidenceTypeLabels[row.evidence_type] ??
                          row.evidence_type}{" "}
                        · tạo {formatDateTime(row.created_at)}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-medium text-zinc-700">
                        {row.entity_type}
                      </p>
                      <p className="mt-1 text-xs text-zinc-500">
                        {row.entity_code ??
                          row.lead_code ??
                          row.request_code ??
                          "Chưa gắn mã"}
                      </p>
                      <p className="mt-2 line-clamp-2 text-xs text-zinc-500">
                        {row.student_name ?? row.request_title ?? row.note ?? ""}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <a
                        href={row.file_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-zinc-900 underline"
                      >
                        <LinkIcon className="size-3" />
                        Mở file
                      </a>
                      <p className="mt-2 text-xs text-zinc-500">
                        {storageProviderLabels[row.storage_provider] ??
                          row.storage_provider}{" "}
                        ·{" "}
                        {confidentialityLabels[row.confidentiality] ??
                          row.confidentiality}
                      </p>
                      <p className="mt-1 text-xs text-zinc-500">
                        {row.file_name ?? row.file_mime_hint ?? "Chưa ghi tên file"}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-md border px-2 py-1 text-xs font-medium ${
                          controlTones[row.control_status] ??
                          "border-zinc-200 bg-zinc-50 text-zinc-700"
                        }`}
                      >
                        {controlLabels[row.control_status] ?? row.control_status}
                      </span>
                      <p className="mt-2 text-xs text-zinc-500">
                        Trạng thái: {statusLabels[row.document_status] ?? row.document_status}
                      </p>
                      <p className="mt-1 text-xs text-zinc-500">
                        Kiểm: {row.checked_by_name ?? "Chưa kiểm"} ·{" "}
                        {formatDateTime(row.checked_at)}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <ControlFlags flags={row.control_flags} />
                      {row.verification_note ? (
                        <p className="mt-2 text-xs text-zinc-500">
                          {row.verification_note}
                        </p>
                      ) : null}
                    </td>
                    {canCheck ? (
                      <td className="px-5 py-4">
                        <form
                          action={updateEvidenceDocumentAction}
                          className="grid min-w-72 gap-2"
                        >
                          <input type="hidden" name="evidence_id" value={row.id} />
                          <select
                            name="document_status"
                            className={inputClass}
                            defaultValue={row.document_status}
                          >
                            <option value="CHECKED">Đã kiểm</option>
                            <option value="NEEDS_FIX">Cần bổ sung</option>
                            <option value="REJECTED">Từ chối</option>
                            <option value="SUBMITTED">Chờ kiểm</option>
                            <option value="ARCHIVED">Lưu trữ</option>
                          </select>
                          <textarea
                            name="verification_note"
                            className={textareaClass}
                            defaultValue={row.verification_note ?? ""}
                            placeholder="Ghi chú kiểm"
                          />
                          <textarea
                            name="note"
                            className={textareaClass}
                            defaultValue={row.note ?? ""}
                            placeholder="Ghi chú nội bộ"
                          />
                          <Button type="submit" size="sm">
                            <Save className="size-4" />
                            Lưu kiểm
                          </Button>
                        </form>
                      </td>
                    ) : null}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}
