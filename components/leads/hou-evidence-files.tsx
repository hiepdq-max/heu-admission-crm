"use client";

import { useActionState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  FileUp,
  Link2,
  Loader2,
  PlusCircle,
  ShieldAlert,
} from "lucide-react";

import {
  createHouEvidenceFileAction,
  type HouEvidenceFormState,
} from "@/app/leads/[id]/actions";
import type { HouCommissionClaimRow } from "@/components/leads/hou-commission-claim-form";
import { Button } from "@/components/ui/button";

export type HouEvidenceFileRow = {
  id: string;
  evidence_scope: string;
  lead_id: string | null;
  location_id: string | null;
  claim_id: string | null;
  evidence_type: string;
  evidence_title: string;
  file_url: string;
  file_name: string | null;
  file_mime_hint: string | null;
  file_date: string | null;
  confidential_level: string;
  note: string | null;
  status: string;
  created_at: string;
};

type HouEvidenceFilesProps = {
  leadId: string;
  canManageHouEvidence: boolean;
  evidenceFiles: HouEvidenceFileRow[];
  claims: HouCommissionClaimRow[];
  loadError?: string;
};

const initialState: HouEvidenceFormState = {};

const inputClass =
  "h-10 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm outline-none transition focus:border-zinc-500 focus:ring-3 focus:ring-zinc-200";

const textareaClass =
  "min-h-20 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-zinc-500 focus:ring-3 focus:ring-zinc-200";

const evidenceTypeLabels: Record<string, string> = {
  HOU_STUDENT_LIST: "Danh sách sinh viên HOU",
  ADMISSION_DECISION: "Quyết định trúng tuyển",
  TUITION_PROOF: "Chứng từ học phí",
  COM_PROOF: "Minh chứng COM",
  PAYMENT_VOUCHER: "Phiếu chi / chứng từ thanh toán",
  STUDENT_DOCUMENT: "Hồ sơ học viên",
  OTHER: "Khác",
};

const scopeLabels: Record<string, string> = {
  LEAD: "Theo lead",
  COM_CLAIM: "Theo đề nghị COM",
  LOCATION: "Theo địa điểm",
  PAYMENT: "Theo thanh toán",
  PROGRAM: "Theo chương trình",
  GENERAL: "Chung",
};

const confidentialLabels: Record<string, string> = {
  INTERNAL: "Nội bộ",
  SENSITIVE: "Nhạy cảm",
  FINANCE_CONFIDENTIAL: "Tài chính mật",
};

function formatDate(value: string | null) {
  if (!value) {
    return "Chưa có ngày";
  }

  return new Intl.DateTimeFormat("vi-VN").format(new Date(`${value}T00:00:00`));
}

function confidentialClass(level: string) {
  if (level === "FINANCE_CONFIDENTIAL") {
    return "bg-rose-50 text-rose-700";
  }

  if (level === "SENSITIVE") {
    return "bg-amber-50 text-amber-700";
  }

  return "bg-zinc-100 text-zinc-700";
}

function fieldValue(
  state: HouEvidenceFormState,
  name: string,
  fallback = "",
) {
  return state.fields?.[name] ?? fallback;
}

function fieldError(state: HouEvidenceFormState, name: string) {
  return state.fieldErrors?.[name];
}

function fieldClass(
  state: HouEvidenceFormState,
  name: string,
  baseClass = inputClass,
) {
  return fieldError(state, name)
    ? baseClass.replace("border-zinc-300", "border-rose-300").replace(
        "focus:border-zinc-500",
        "focus:border-rose-500",
      )
    : baseClass;
}

function FieldError({
  state,
  name,
}: {
  state: HouEvidenceFormState;
  name: string;
}) {
  const message = fieldError(state, name);

  if (!message) {
    return null;
  }

  return <p className="text-xs font-medium text-rose-600">{message}</p>;
}

export function HouEvidenceFiles({
  leadId,
  canManageHouEvidence,
  evidenceFiles,
  claims,
  loadError,
}: HouEvidenceFilesProps) {
  const [state, formAction, isPending] = useActionState(
    createHouEvidenceFileAction,
    initialState,
  );

  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-zinc-100">
          <FileUp className="size-5 text-zinc-600" />
        </div>
        <div>
          <h3 className="text-base font-semibold">Hồ sơ minh chứng HOU</h3>
          <p className="mt-1 text-sm text-zinc-500">
            Lưu link file, ảnh hoặc thư mục Google Drive liên quan đến HOU. Dữ liệu
            tài chính/COM có phân quyền riêng để tránh lộ thông tin nhạy cảm.
          </p>
        </div>
      </div>

      {loadError ? (
        <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            <p>
              Chưa đọc được bảng minh chứng HOU. Hãy chạy SQL bước 35G rồi tải
              lại trang. Chi tiết: {loadError}
            </p>
          </div>
        </div>
      ) : null}

      <div className="mt-5 space-y-3">
        {evidenceFiles.length > 0 ? (
          evidenceFiles.map((file) => (
            <div
              key={file.id}
              className="rounded-lg border border-zinc-200 p-4"
            >
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-md bg-sky-50 px-2 py-1 text-xs font-medium text-sky-700">
                      {evidenceTypeLabels[file.evidence_type] ?? file.evidence_type}
                    </span>
                    <span className="rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-700">
                      {scopeLabels[file.evidence_scope] ?? file.evidence_scope}
                    </span>
                    <span
                      className={`rounded-md px-2 py-1 text-xs font-medium ${confidentialClass(
                        file.confidential_level,
                      )}`}
                    >
                      {confidentialLabels[file.confidential_level] ??
                        file.confidential_level}
                    </span>
                  </div>
                  <h4 className="mt-2 font-medium text-zinc-950">
                    {file.evidence_title}
                  </h4>
                  <p className="mt-1 text-sm text-zinc-500">
                    {file.file_name || "Chưa đặt tên file"} · {formatDate(file.file_date)}
                  </p>
                  {file.note ? (
                    <p className="mt-2 text-sm leading-6 text-zinc-600">{file.note}</p>
                  ) : null}
                </div>

                <Button asChild variant="outline" size="sm">
                  <a href={file.file_url} target="_blank" rel="noreferrer">
                    <ExternalLink className="size-4" />
                    Mở file
                  </a>
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-lg border border-dashed border-zinc-300 p-4 text-sm text-zinc-500">
            Chưa có minh chứng HOU nào cho lead này.
          </div>
        )}
      </div>

      {state.error ? (
        <div className="mt-5 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {state.error}
        </div>
      ) : null}

      {state.success ? (
        <div className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
            <p>{state.success}</p>
          </div>
        </div>
      ) : null}

      <form
        key={
          state.success
            ? "success"
            : state.error
              ? JSON.stringify(state.fields ?? {})
              : "initial"
        }
        action={formAction}
        className="mt-5 space-y-5"
      >
        <input type="hidden" name="lead_id" value={leadId} />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="space-y-2">
            <label
              htmlFor="evidence_scope"
              className="text-sm font-medium text-zinc-700"
            >
              Phạm vi
            </label>
            <select
              id="evidence_scope"
              name="evidence_scope"
              className={fieldClass(state, "evidence_scope")}
              defaultValue={fieldValue(state, "evidence_scope", "LEAD")}
            >
              <option value="LEAD">Theo lead</option>
              {canManageHouEvidence ? (
                <option value="COM_CLAIM">Theo đề nghị COM</option>
              ) : null}
            </select>
            <FieldError state={state} name="evidence_scope" />
          </div>

          <div className="space-y-2">
            <label htmlFor="claim_id" className="text-sm font-medium text-zinc-700">
              Đề nghị COM
            </label>
            <select
              id="claim_id"
              name="claim_id"
              className={fieldClass(state, "claim_id")}
              defaultValue={fieldValue(state, "claim_id")}
              disabled={!canManageHouEvidence || claims.length === 0}
            >
              <option value="">Không chọn</option>
              {claims.map((claim) => (
                <option key={claim.id} value={claim.id}>
                  {claim.classification} · {claim.hou_student_code ?? claim.student_name}
                </option>
              ))}
            </select>
            <FieldError state={state} name="claim_id" />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="evidence_type"
              className="text-sm font-medium text-zinc-700"
            >
              Loại minh chứng
            </label>
            <select
              id="evidence_type"
              name="evidence_type"
              className={fieldClass(state, "evidence_type")}
              defaultValue={fieldValue(
                state,
                "evidence_type",
                "STUDENT_DOCUMENT",
              )}
              required
            >
              <option value="HOU_STUDENT_LIST">Danh sách sinh viên HOU</option>
              <option value="ADMISSION_DECISION">Quyết định trúng tuyển</option>
              <option value="TUITION_PROOF">Chứng từ học phí</option>
              <option value="COM_PROOF">Minh chứng COM</option>
              <option value="PAYMENT_VOUCHER">Phiếu chi / thanh toán</option>
              <option value="STUDENT_DOCUMENT">Hồ sơ học viên</option>
              <option value="OTHER">Khác</option>
            </select>
            <FieldError state={state} name="evidence_type" />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="confidential_level"
              className="text-sm font-medium text-zinc-700"
            >
              Mức bảo mật
            </label>
            <select
              id="confidential_level"
              name="confidential_level"
              className={fieldClass(state, "confidential_level")}
              defaultValue={fieldValue(state, "confidential_level", "INTERNAL")}
            >
              <option value="INTERNAL">Nội bộ</option>
              {canManageHouEvidence ? (
                <>
                  <option value="SENSITIVE">Nhạy cảm</option>
                  <option value="FINANCE_CONFIDENTIAL">Tài chính mật</option>
                </>
              ) : null}
            </select>
            <FieldError state={state} name="confidential_level" />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="space-y-2 md:col-span-2">
            <label
              htmlFor="evidence_title"
              className="text-sm font-medium text-zinc-700"
            >
              Tiêu đề minh chứng
            </label>
            <input
              id="evidence_title"
              name="evidence_title"
              className={fieldClass(state, "evidence_title")}
              placeholder="VD: Quyết định trúng tuyển HOU đợt 1"
              defaultValue={fieldValue(state, "evidence_title")}
              required
            />
            <FieldError state={state} name="evidence_title" />
          </div>

          <div className="space-y-2">
            <label htmlFor="file_name" className="text-sm font-medium text-zinc-700">
              Tên file
            </label>
            <input
              id="file_name"
              name="file_name"
              className={fieldClass(state, "file_name")}
              placeholder="VD: QD-trung-tuyen.pdf"
              defaultValue={fieldValue(state, "file_name")}
            />
            <FieldError state={state} name="file_name" />
          </div>

          <div className="space-y-2">
            <label htmlFor="file_date" className="text-sm font-medium text-zinc-700">
              Ngày file
            </label>
            <input
              id="file_date"
              name="file_date"
              type="date"
              className={fieldClass(state, "file_date")}
              defaultValue={fieldValue(state, "file_date")}
            />
            <FieldError state={state} name="file_date" />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-[1fr_220px]">
          <div className="space-y-2">
            <label htmlFor="file_url" className="text-sm font-medium text-zinc-700">
              Link file / ảnh
            </label>
            <div className="relative">
              <Link2 className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
              <input
                id="file_url"
                name="file_url"
                type="url"
                className={fieldClass(
                  state,
                  "file_url",
                  "h-10 w-full rounded-md border border-zinc-300 bg-white pl-9 pr-3 text-sm outline-none transition focus:border-zinc-500 focus:ring-3 focus:ring-zinc-200",
                )}
                placeholder="https://drive.google.com/..."
                defaultValue={fieldValue(state, "file_url")}
                required
              />
            </div>
            <FieldError state={state} name="file_url" />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="file_mime_hint"
              className="text-sm font-medium text-zinc-700"
            >
              Định dạng
            </label>
            <select
              id="file_mime_hint"
              name="file_mime_hint"
              className={fieldClass(state, "file_mime_hint")}
              defaultValue={fieldValue(state, "file_mime_hint")}
            >
              <option value="">Không rõ</option>
              <option value="application/pdf">PDF</option>
              <option value="image/*">Ảnh</option>
              <option value="application/vnd.openxmlformats-officedocument.wordprocessingml.document">
                Word
              </option>
              <option value="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet">
                Excel
              </option>
              <option value="folder">Thư mục Drive</option>
            </select>
            <FieldError state={state} name="file_mime_hint" />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="note" className="text-sm font-medium text-zinc-700">
            Ghi chú
          </label>
          <textarea
            id="note"
            name="note"
            className={fieldClass(state, "note", textareaClass)}
            defaultValue={fieldValue(state, "note")}
            placeholder="VD: File do HOU gửi, dùng để đối soát COM tháng 06/2026..."
          />
          <FieldError state={state} name="note" />
        </div>

        <div className="rounded-md border border-amber-200 bg-amber-50 p-3">
          <div className="flex items-start gap-2">
            <ShieldAlert className="mt-0.5 size-4 shrink-0 text-amber-700" />
            <p className="text-sm leading-6 text-amber-800">
              Link Google Drive cần được phân quyền đúng người xem. Mục tài chính mật
              chỉ nên dùng cho chứng từ COM, phiếu chi, công nợ hoặc tỷ lệ hợp tác
              HEU-HOU.
            </p>
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={isPending || Boolean(loadError)}>
            {isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <PlusCircle className="size-4" />
            )}
            Lưu minh chứng
          </Button>
        </div>
      </form>
    </section>
  );
}
