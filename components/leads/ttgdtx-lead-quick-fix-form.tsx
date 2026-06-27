"use client";

import { useActionState } from "react";
import { AlertTriangle, CheckCircle2, Loader2, Save } from "lucide-react";

import {
  updateTtgdtxLeadQuickFixAction,
  type TtgdtxLeadQuickFixFormState,
} from "@/app/leads/[id]/actions";
import { Button } from "@/components/ui/button";

type Option = {
  id: string;
  label: string;
};

type MajorOption = Option & {
  programId: string | null;
  programLabel?: string | null;
};

type OfferingOption = Option & {
  programId: string | null;
  majorId: string | null;
};

type TtgdtxLeadQuickFixFormProps = {
  leadId: string;
  currentStatus: string;
  currentPartnerId: string | null;
  currentProgramId: string | null;
  currentMajorId: string | null;
  currentOfferingId: string | null;
  documentCount: number;
  partners: Option[];
  programs: Option[];
  majors: MajorOption[];
  offerings: OfferingOption[];
};

const initialState: TtgdtxLeadQuickFixFormState = {};

const inputClass =
  "h-11 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm outline-none transition focus:border-zinc-500 focus:ring-3 focus:ring-zinc-200";

const textareaClass =
  "min-h-24 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-zinc-500 focus:ring-3 focus:ring-zinc-200";

const readyStatusOptions = [
  {
    id: "DOCUMENT_SUBMITTED",
    label: "Đã nộp hồ sơ",
    hint: "Khuyên dùng để mở điều kiện công nợ P2-03.",
  },
  {
    id: "ELIGIBLE",
    label: "Đủ điều kiện",
    hint: "Chỉ giữ nếu lead đã được kiểm soát đủ điều kiện.",
  },
  {
    id: "ENROLLED",
    label: "Đã nhập học",
    hint: "Chỉ giữ nếu học sinh đã nhập học thật.",
  },
];

const statusLabels: Record<string, string> = {
  NEW: "Lead mới",
  ASSIGNED: "Đã phân tư vấn",
  CONTACTED: "Đã liên hệ",
  INTERESTED: "Có quan tâm",
  FOLLOW_UP: "Chăm sóc tiếp",
  DOCUMENT_PENDING: "Chờ hồ sơ",
  DOCUMENT_SUBMITTED: "Đã nộp hồ sơ",
  ELIGIBLE: "Đủ điều kiện",
  ENROLLED: "Đã nhập học",
  LOST: "Không đăng ký",
};

function isReadyStatus(status: string) {
  return readyStatusOptions.some((option) => option.id === status);
}

function fieldValue(
  state: TtgdtxLeadQuickFixFormState,
  name: string,
  fallback = "",
) {
  return state.fields?.[name] ?? fallback;
}

function fieldError(state: TtgdtxLeadQuickFixFormState, name: string) {
  return state.fieldErrors?.[name];
}

function fieldClass(
  state: TtgdtxLeadQuickFixFormState,
  name: string,
  baseClass = inputClass,
) {
  return fieldError(state, name)
    ? baseClass
        .replace("border-zinc-300", "border-rose-300")
        .replace("focus:border-zinc-500", "focus:border-rose-500")
    : baseClass;
}

function FieldError({
  state,
  name,
}: {
  state: TtgdtxLeadQuickFixFormState;
  name: string;
}) {
  const message = fieldError(state, name);

  if (!message) {
    return null;
  }

  return <p className="text-xs font-medium text-rose-600">{message}</p>;
}

function OptionPreview({
  label,
  options,
}: {
  label: string;
  options: Option[];
}) {
  if (options.length === 0) {
    return null;
  }

  return (
    <div className="rounded-md border border-zinc-200 bg-zinc-50 p-3 text-xs leading-5 text-zinc-600">
      <p className="font-medium text-zinc-700">{label}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.slice(0, 5).map((option) => (
          <span
            key={option.id}
            className="rounded-full border border-zinc-200 bg-white px-2 py-1"
          >
            {option.label}
          </span>
        ))}
        {options.length > 5 ? (
          <span className="rounded-full border border-zinc-200 bg-white px-2 py-1">
            +{options.length - 5} lựa chọn khác
          </span>
        ) : null}
      </div>
    </div>
  );
}

export function TtgdtxLeadQuickFixForm({
  leadId,
  currentStatus,
  currentPartnerId,
  currentProgramId,
  currentMajorId,
  currentOfferingId,
  documentCount,
  partners,
  programs,
  majors,
  offerings,
}: TtgdtxLeadQuickFixFormProps) {
  const [state, formAction, isPending] = useActionState(
    updateTtgdtxLeadQuickFixAction,
    initialState,
  );
  const defaultStatus = isReadyStatus(currentStatus)
    ? currentStatus
    : documentCount > 0
      ? "DOCUMENT_SUBMITTED"
      : currentStatus;
  const shouldShowKeepCurrentStatus = !isReadyStatus(currentStatus);
  const defaultPartnerId =
    currentPartnerId ?? (partners.length === 1 ? partners[0].id : "");
  const defaultProgramId =
    currentProgramId ?? (programs.length === 1 ? programs[0].id : "");
  const defaultMajorId =
    currentMajorId ?? (majors.length === 1 ? majors[0].id : "");

  return (
    <section className="rounded-lg border border-amber-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
            P2-05 · Sửa nhanh chỗ thiếu TTGDTX
          </p>
          <h3 className="mt-1 text-lg font-semibold">
            Bổ sung điều kiện để tạo công nợ học phí
          </h3>
          <p className="mt-1 text-sm leading-6 text-zinc-500">
            Chỉ sửa các thông tin đang chặn P2-03. Ô nào đúng sẽ giữ nguyên,
            không bắt nhập lại.
          </p>
        </div>

        <div className="rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-600">
          Lead: <span className="font-medium text-zinc-900">{leadId}</span>
        </div>
      </div>

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
        <input name="lead_id" type="hidden" value={leadId} />

        {state.error ? (
          <div className="flex gap-2 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm leading-6 text-rose-700">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            <span>{state.error}</span>
          </div>
        ) : null}

        {state.success ? (
          <div className="flex gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm leading-6 text-emerald-700">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
            <span>{state.success}</span>
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="p2_05_status" className="text-sm font-medium">
              Trạng thái đủ tạo công nợ
            </label>
            <select
              id="p2_05_status"
              name="status"
              className={fieldClass(state, "status")}
              defaultValue={fieldValue(state, "status", defaultStatus)}
            >
              {shouldShowKeepCurrentStatus ? (
                <option value={currentStatus}>
                  Giữ trạng thái hiện tại:{" "}
                  {statusLabels[currentStatus] ?? currentStatus}
                </option>
              ) : null}
              {readyStatusOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="text-xs leading-5 text-zinc-500">
              Nếu chưa chắc, chọn “Đã nộp hồ sơ”. Hệ thống vẫn giữ các gate hồ
              sơ, học phí và pháp lý phía sau.
            </p>
            {documentCount === 0 ? (
              <p className="text-xs leading-5 text-amber-700">
                Lead chưa có hồ sơ nào. Bạn có thể giữ trạng thái hiện tại để
                lưu TTGDTX/ngành trước; sau khi thêm ít nhất 1 hồ sơ ở tab Hồ
                sơ thì quay lại chọn Đã nộp hồ sơ.
              </p>
            ) : null}
            <FieldError state={state} name="status" />
          </div>

          <div className="space-y-2">
            <label htmlFor="p2_05_partner_id" className="text-sm font-medium">
              TTGDTX / đối tác liên kết
            </label>
            <select
              id="p2_05_partner_id"
              name="partner_id"
              className={fieldClass(state, "partner_id")}
              defaultValue={fieldValue(state, "partner_id", defaultPartnerId)}
            >
              <option value="">Chọn TTGDTX</option>
              {partners.length === 0 ? (
                <option disabled value="__no_ttgdtx_options">
                  Chưa có TTGDTX trong phạm vi tài khoản
                </option>
              ) : null}
              {partners.map((partner) => (
                <option key={partner.id} value={partner.id}>
                  {partner.label}
                </option>
              ))}
            </select>
            {partners.length > 0 ? (
              <p className="text-xs leading-5 text-zinc-500">
                Đang có {partners.length} TTGDTX có thể chọn theo phạm vi tài
                khoản hiện tại.
              </p>
            ) : (
              <p className="text-xs leading-5 text-amber-700">
                Chưa thấy tên trung tâm vì tài khoản chưa có TTGDTX trong phạm
                vi, hoặc chưa tạo đối tác loại TTGDTX ở module Đối tác/CTV.
              </p>
            )}
            <OptionPreview
              label="TTGDTX đang được phép chọn"
              options={partners}
            />
            <FieldError state={state} name="partner_id" />
          </div>

          <div className="space-y-2">
            <label htmlFor="p2_05_program_id" className="text-sm font-medium">
              Hệ/chương trình
            </label>
            <select
              id="p2_05_program_id"
              name="admission_program_id"
              className={fieldClass(state, "admission_program_id")}
              defaultValue={fieldValue(
                state,
                "admission_program_id",
                defaultProgramId,
              )}
            >
              <option value="">Chọn hệ/chương trình</option>
              {programs.map((program) => (
                <option key={program.id} value={program.id}>
                  {program.label}
                </option>
              ))}
            </select>
            <OptionPreview
              label="Hệ/chương trình đang được phép chọn"
              options={programs}
            />
            <FieldError state={state} name="admission_program_id" />
          </div>

          <div className="space-y-2">
            <label htmlFor="p2_05_major_id" className="text-sm font-medium">
              Ngành/nghề chuẩn
            </label>
            <select
              id="p2_05_major_id"
              name="admission_major_id"
              className={fieldClass(state, "admission_major_id")}
              defaultValue={fieldValue(
                state,
                "admission_major_id",
                defaultMajorId,
              )}
            >
              <option value="">Chọn ngành/nghề</option>
              {majors.map((major) => (
                <option key={major.id} value={major.id}>
                  {major.programLabel
                    ? `${major.label} · ${major.programLabel}`
                    : major.label}
                </option>
              ))}
            </select>
            <FieldError state={state} name="admission_major_id" />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label htmlFor="p2_05_offering_id" className="text-sm font-medium">
              Ngành/khóa chi tiết nếu có
            </label>
            <select
              id="p2_05_offering_id"
              name="admission_offering_id"
              className={fieldClass(state, "admission_offering_id")}
              defaultValue={fieldValue(
                state,
                "admission_offering_id",
                currentOfferingId ?? "",
              )}
            >
              <option value="">Không chọn, để hệ thống khớp theo ngành</option>
              {offerings.map((offering) => (
                <option key={offering.id} value={offering.id}>
                  {offering.label}
                </option>
              ))}
            </select>
            <p className="text-xs leading-5 text-zinc-500">
              Nếu một ngành có nhiều khóa/chính sách, chọn đúng khóa để tránh
              công nợ sai.
            </p>
            <FieldError state={state} name="admission_offering_id" />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="p2_05_note" className="text-sm font-medium">
            Ghi chú kiểm tra
          </label>
          <textarea
            id="p2_05_note"
            name="note"
            className={fieldClass(state, "note", textareaClass)}
            defaultValue={fieldValue(state, "note")}
            placeholder="Ví dụ: đã đối chiếu danh sách TTGDTX, đủ hồ sơ đầu vào."
          />
          <FieldError state={state} name="note" />
        </div>

        <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-900">
          Sau khi lưu, quay lại P2-05. Nếu còn cảnh báo, hệ thống sẽ chỉ đúng
          chỗ còn thiếu như P2-02 học phí hoặc hợp đồng P2-01.
        </div>

        <Button type="submit" disabled={isPending} className="w-full md:w-auto">
          {isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          Lưu và kiểm tra lại P2-05
        </Button>
      </form>
    </section>
  );
}
