"use client";

import { useActionState } from "react";
import { Loader2, Save } from "lucide-react";

import {
  updateLeadStatusAction,
  type StatusFormState,
} from "@/app/leads/[id]/actions";
import { Button } from "@/components/ui/button";

type PipelineStatusFormProps = {
  leadId: string;
  currentStatus: string;
  currentNextFollowupAt: string | null;
};

const initialState: StatusFormState = {};

const inputClass =
  "h-8 w-full rounded-md border border-zinc-300 bg-white px-2 text-xs outline-none transition focus:border-zinc-500 focus:ring-3 focus:ring-zinc-200";

const textareaClass =
  "min-h-16 w-full rounded-md border border-zinc-300 bg-white px-2 py-2 text-xs outline-none transition focus:border-zinc-500 focus:ring-3 focus:ring-zinc-200";

function toDateTimeLocal(value: string | null) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}

export function PipelineStatusForm({
  leadId,
  currentStatus,
  currentNextFollowupAt,
}: PipelineStatusFormProps) {
  const [state, formAction, isPending] = useActionState(
    updateLeadStatusAction,
    initialState,
  );

  return (
    <details className="mt-3 rounded-md border border-zinc-200 bg-zinc-50 p-3">
      <summary className="cursor-pointer select-none text-xs font-medium text-zinc-700">
        Chuyển trạng thái
      </summary>

      <form action={formAction} className="mt-3 space-y-3">
        <input name="lead_id" type="hidden" value={leadId} />

        {state.error ? (
          <div className="rounded-md border border-rose-200 bg-rose-50 px-2 py-2 text-xs text-rose-700">
            {state.error}
          </div>
        ) : null}

        {state.success ? (
          <div className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-2 text-xs text-emerald-700">
            {state.success}
          </div>
        ) : null}

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-600" htmlFor={`status-${leadId}`}>
            Trạng thái
          </label>
          <select
            id={`status-${leadId}`}
            name="status"
            className={inputClass}
            defaultValue={currentStatus}
          >
            <option value="NEW">Lead mới</option>
            <option value="ASSIGNED">Đã phân tư vấn</option>
            <option value="CONTACTED">Đã liên hệ</option>
            <option value="INTERESTED">Có quan tâm</option>
            <option value="FOLLOW_UP">Chăm sóc tiếp</option>
            <option value="VISITED">Đã đến trường</option>
            <option value="DOCUMENT_PENDING">Chờ hồ sơ</option>
            <option value="DOCUMENT_SUBMITTED">Đã nộp hồ sơ</option>
            <option value="ELIGIBLE">Đủ điều kiện</option>
            <option value="ENROLLED">Đã nhập học</option>
            <option value="LOST">Không đăng ký</option>
            <option value="DUPLICATE">Trùng lead</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label
            className="text-xs font-medium text-zinc-600"
            htmlFor={`next-followup-${leadId}`}
          >
            Ngày hẹn nếu FOLLOW_UP
          </label>
          <input
            id={`next-followup-${leadId}`}
            name="next_followup_at"
            className={inputClass}
            defaultValue={toDateTimeLocal(currentNextFollowupAt)}
            type="datetime-local"
          />
        </div>

        <div className="space-y-1.5">
          <label
            className="text-xs font-medium text-zinc-600"
            htmlFor={`lost-reason-${leadId}`}
          >
            Lý do nếu LOST
          </label>
          <select
            id={`lost-reason-${leadId}`}
            name="lost_reason"
            className={inputClass}
            defaultValue=""
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
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-600" htmlFor={`note-${leadId}`}>
            Ghi chú
          </label>
          <textarea
            id={`note-${leadId}`}
            name="note"
            className={textareaClass}
            placeholder="Lý do chuyển trạng thái hoặc việc cần làm tiếp."
          />
        </div>

        <Button type="submit" size="sm" className="w-full" disabled={isPending}>
          {isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          Lưu trạng thái
        </Button>
      </form>
    </details>
  );
}
