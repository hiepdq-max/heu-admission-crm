"use client";

import { useActionState } from "react";
import { Loader2, Save } from "lucide-react";

import {
  createLeadActivityAction,
  type ActivityFormState,
} from "@/app/leads/[id]/actions";
import { Button } from "@/components/ui/button";

type ActivityFormProps = {
  leadId: string;
};

const initialState: ActivityFormState = {};

const inputClass =
  "h-10 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm outline-none transition focus:border-zinc-500 focus:ring-3 focus:ring-zinc-200";

const textareaClass =
  "min-h-24 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-zinc-500 focus:ring-3 focus:ring-zinc-200";

function fieldValue(state: ActivityFormState, name: string, fallback = "") {
  return state.fields?.[name] ?? fallback;
}

function fieldError(state: ActivityFormState, name: string) {
  return state.fieldErrors?.[name];
}

function fieldClass(
  state: ActivityFormState,
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

function FieldError({ state, name }: { state: ActivityFormState; name: string }) {
  const message = fieldError(state, name);

  if (!message) {
    return null;
  }

  return <p className="text-xs font-medium text-rose-600">{message}</p>;
}

export function ActivityForm({ leadId }: ActivityFormProps) {
  const [state, formAction, isPending] = useActionState(
    createLeadActivityAction,
    initialState,
  );

  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
      <div>
        <h3 className="text-base font-semibold">Ghi hoạt động tư vấn</h3>
        <p className="mt-1 text-sm text-zinc-500">
          Mỗi lần gọi, nhắn, gặp hoặc ghi chú tư vấn đều nên lưu lại tại đây.
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
            <label
              htmlFor="activity_type"
              className="text-sm font-medium text-zinc-700"
            >
              Loại hoạt động <span className="text-rose-600">*</span>
            </label>
            <select
              id="activity_type"
              name="activity_type"
              className={fieldClass(state, "activity_type")}
              defaultValue={fieldValue(state, "activity_type", "CALL")}
              required
            >
              <option value="CALL">Gọi điện</option>
              <option value="ZALO">Zalo</option>
              <option value="SMS">SMS</option>
              <option value="EMAIL">Email</option>
              <option value="MEETING">Gặp trực tiếp</option>
              <option value="NOTE">Ghi chú</option>
              <option value="DOCUMENT">Hồ sơ</option>
              <option value="PAYMENT">Tài chính</option>
            </select>
            <FieldError state={state} name="activity_type" />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="activity_result"
              className="text-sm font-medium text-zinc-700"
            >
              Kết quả
            </label>
            <input
              id="activity_result"
              name="activity_result"
              className={fieldClass(state, "activity_result")}
              defaultValue={fieldValue(state, "activity_result")}
              placeholder="Có quan tâm / Không nghe máy / Hẹn gặp..."
            />
            <FieldError state={state} name="activity_result" />
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
              defaultValue={fieldValue(state, "next_followup_at")}
              type="datetime-local"
            />
            <FieldError state={state} name="next_followup_at" />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="content" className="text-sm font-medium text-zinc-700">
            Nội dung tư vấn <span className="text-rose-600">*</span>
          </label>
          <textarea
            id="content"
            name="content"
            className={fieldClass(state, "content", textareaClass)}
            defaultValue={fieldValue(state, "content")}
            required
            placeholder="Ghi lại nội dung trao đổi với học sinh/phụ huynh."
          />
          <FieldError state={state} name="content" />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="next_action"
            className="text-sm font-medium text-zinc-700"
          >
            Việc cần làm tiếp theo
          </label>
          <input
            id="next_action"
            name="next_action"
            className={fieldClass(state, "next_action")}
            defaultValue={fieldValue(state, "next_action")}
            placeholder="Gửi checklist hồ sơ, gọi lại phụ huynh, mời đến trường..."
          />
          <FieldError state={state} name="next_action" />
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={isPending}>
            {isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            Lưu hoạt động
          </Button>
        </div>
      </form>
    </section>
  );
}
