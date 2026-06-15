"use client";

import { useActionState } from "react";
import { AlertTriangle, Loader2, Save } from "lucide-react";

import {
  updateLeadStatusAction,
  type StatusFormState,
} from "@/app/leads/[id]/actions";
import { Button } from "@/components/ui/button";

type StatusUpdateFormProps = {
  leadId: string;
  currentStatus: string;
  currentLostReason: string | null;
  currentNextFollowupAt: string | null;
  currentNote: string | null;
};

const initialState: StatusFormState = {};

const inputClass =
  "h-10 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm outline-none transition focus:border-zinc-500 focus:ring-3 focus:ring-zinc-200";

const textareaClass =
  "min-h-20 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-zinc-500 focus:ring-3 focus:ring-zinc-200";

function toDateTimeLocal(value: string | null) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}

function fieldValue(state: StatusFormState, name: string, fallback = "") {
  return state.fields?.[name] ?? fallback;
}

function fieldError(state: StatusFormState, name: string) {
  return state.fieldErrors?.[name];
}

function fieldClass(
  state: StatusFormState,
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

function FieldError({ state, name }: { state: StatusFormState; name: string }) {
  const message = fieldError(state, name);

  if (!message) {
    return null;
  }

  return <p className="text-xs font-medium text-rose-600">{message}</p>;
}

export function StatusUpdateForm({
  leadId,
  currentStatus,
  currentLostReason,
  currentNextFollowupAt,
  currentNote,
}: StatusUpdateFormProps) {
  const [state, formAction, isPending] = useActionState(
    updateLeadStatusAction,
    initialState,
  );

  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
      <div>
        <h3 className="text-base font-semibold">Cập nhật trạng thái lead</h3>
        <p className="mt-1 text-sm text-zinc-500">
          Database sẽ chặn các chuyển trạng thái sai quy tắc, ví dụ thiếu hồ sơ
          bắt buộc hoặc thiếu lý do mất lead.
        </p>
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
        className="mt-5 space-y-4"
      >
        <input name="lead_id" type="hidden" value={leadId} />

        {state.error ? (
          <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {state.error}
          </div>
        ) : null}

        {state.success ? (
          <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            {state.success}
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <div className="space-y-2">
            <label htmlFor="status" className="text-sm font-medium text-zinc-700">
              Trạng thái mới
            </label>
            <select
              id="status"
              name="status"
              className={fieldClass(state, "status")}
              defaultValue={fieldValue(state, "status", currentStatus)}
            >
              <option value="NEW">Lead mới</option>
              <option value="ASSIGNED">Đã phân tư vấn</option>
              <option value="CONTACTED">Đã liên hệ</option>
              <option value="INTERESTED">Có quan tâm</option>
              <option value="FOLLOW_UP">Cần chăm sóc tiếp</option>
              <option value="VISITED">Đã đến trường/gặp trực tiếp</option>
              <option value="DOCUMENT_PENDING">Chờ hồ sơ</option>
              <option value="DOCUMENT_SUBMITTED">Đã nộp hồ sơ</option>
              <option value="ELIGIBLE">Đủ điều kiện</option>
              <option value="ENROLLED">Đã nhập học</option>
              <option value="LOST">Không đăng ký</option>
              <option value="DUPLICATE">Trùng lead</option>
            </select>
            <FieldError state={state} name="status" />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="next_followup_at"
              className="text-sm font-medium text-zinc-700"
            >
              Ngày hẹn tiếp theo
            </label>
            <input
              id="next_followup_at"
              name="next_followup_at"
              className={fieldClass(state, "next_followup_at")}
              defaultValue={fieldValue(
                state,
                "next_followup_at",
                toDateTimeLocal(currentNextFollowupAt),
              )}
              type="datetime-local"
            />
            <FieldError state={state} name="next_followup_at" />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="lost_reason"
              className="text-sm font-medium text-zinc-700"
            >
              Lý do mất lead
            </label>
            <select
              id="lost_reason"
              name="lost_reason"
              className={fieldClass(state, "lost_reason")}
              defaultValue={fieldValue(
                state,
                "lost_reason",
                currentLostReason ?? "",
              )}
            >
              <option value="">Không áp dụng</option>
              <option value="NO_NEED">Không còn nhu cầu</option>
              <option value="NO_CONTACT">Không liên hệ được</option>
              <option value="WRONG_PHONE">Sai số điện thoại</option>
              <option value="CHOSE_OTHER_SCHOOL">Chọn trường khác</option>
              <option value="TUITION_CONCERN">Lo ngại học phí</option>
              <option value="DISTANCE">Xa địa điểm học</option>
              <option value="FAMILY_NOT_AGREE">Gia đình không đồng ý</option>
              <option value="NOT_ELIGIBLE">Không đủ điều kiện</option>
              <option value="DUPLICATE">Trùng dữ liệu</option>
              <option value="OTHER">Khác</option>
            </select>
            <FieldError state={state} name="lost_reason" />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="note" className="text-sm font-medium text-zinc-700">
            Ghi chú cập nhật
          </label>
          <textarea
            id="note"
            name="note"
            className={fieldClass(state, "note", textareaClass)}
            defaultValue={fieldValue(state, "note", currentNote ?? "")}
            placeholder="Ghi lý do chuyển trạng thái hoặc việc cần làm tiếp theo."
          />
          <FieldError state={state} name="note" />
        </div>

        <div className="rounded-md border border-amber-200 bg-amber-50 p-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 size-4 text-amber-700" />
            <p className="text-sm leading-6 text-amber-800">
              `FOLLOW_UP` cần ngày hẹn. `LOST` cần lý do mất. `ELIGIBLE` và
              `ENROLLED` còn phụ thuộc vào hồ sơ, enrollment và tài chính theo
              trigger database.
            </p>
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={isPending}>
            {isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            Cập nhật trạng thái
          </Button>
        </div>
      </form>
    </section>
  );
}
