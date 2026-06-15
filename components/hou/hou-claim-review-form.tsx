"use client";

import { useActionState } from "react";
import { CheckCircle2, Loader2, Save } from "lucide-react";

import {
  reviewHouCommissionClaimAction,
  type HouClaimReviewState,
} from "@/app/hou/actions";
import { Button } from "@/components/ui/button";

type HouClaimReviewFormProps = {
  claimId: string;
  currentStatus: string;
};

const initialState: HouClaimReviewState = {};

const selectClass =
  "h-9 w-full rounded-md border border-zinc-300 bg-white px-2 text-sm outline-none transition focus:border-zinc-500 focus:ring-3 focus:ring-zinc-200";

const inputClass =
  "h-9 w-full rounded-md border border-zinc-300 bg-white px-2 text-sm outline-none transition focus:border-zinc-500 focus:ring-3 focus:ring-zinc-200";

function fieldValue(state: HouClaimReviewState, name: string, fallback = "") {
  return state.fields?.[name] ?? fallback;
}

function fieldError(state: HouClaimReviewState, name: string) {
  return state.fieldErrors?.[name];
}

function fieldClass(
  state: HouClaimReviewState,
  name: string,
  baseClass: string,
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
  state: HouClaimReviewState;
  name: string;
}) {
  const message = fieldError(state, name);

  if (!message) {
    return null;
  }

  return <p className="text-xs font-medium text-rose-600">{message}</p>;
}

function targetOptions(currentStatus: string) {
  if (currentStatus === "APPROVED") {
    return [{ value: "RISK_HOLD", label: "Giữ lại do rủi ro" }];
  }

  if (currentStatus === "RISK_HOLD") {
    return [
      { value: "REVIEWING", label: "Chuyển rà soát" },
      { value: "APPROVED", label: "Duyệt COM" },
      { value: "REJECTED", label: "Từ chối COM" },
    ];
  }

  if (currentStatus === "REVIEWING") {
    return [
      { value: "APPROVED", label: "Duyệt COM" },
      { value: "RISK_HOLD", label: "Giữ lại do rủi ro" },
      { value: "REJECTED", label: "Từ chối COM" },
    ];
  }

  if (currentStatus === "ELIGIBLE" || currentStatus === "DRAFT") {
    return [
      { value: "REVIEWING", label: "Chuyển rà soát" },
      { value: "APPROVED", label: "Duyệt COM" },
      { value: "RISK_HOLD", label: "Giữ lại do rủi ro" },
      { value: "REJECTED", label: "Từ chối COM" },
    ];
  }

  return [];
}

export function HouClaimReviewForm({
  claimId,
  currentStatus,
}: HouClaimReviewFormProps) {
  const [state, formAction, isPending] = useActionState(
    reviewHouCommissionClaimAction,
    initialState,
  );
  const options = targetOptions(currentStatus);

  if (options.length === 0) {
    return (
      <p className="text-xs leading-5 text-zinc-500">
        Trạng thái này chưa cần thao tác duyệt ở bước 35I.
      </p>
    );
  }

  return (
    <form
      key={
        state.success
          ? `success-${claimId}`
          : state.error
            ? JSON.stringify(state.fields ?? {})
            : `initial-${claimId}`
      }
      action={formAction}
      className="min-w-[260px] space-y-2"
    >
      <input type="hidden" name="claim_id" value={claimId} />

      <div className="grid gap-2 sm:grid-cols-[160px_1fr_auto]">
        <div>
          <select
            name="target_status"
            className={fieldClass(state, "target_status", selectClass)}
            defaultValue={fieldValue(state, "target_status", options[0].value)}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <FieldError state={state} name="target_status" />
        </div>

        <div>
          <input
            name="review_note"
            className={fieldClass(state, "review_note", inputClass)}
            defaultValue={fieldValue(state, "review_note")}
            placeholder="Lý do xử lý"
          />
          <FieldError state={state} name="review_note" />
        </div>

        <Button type="submit" size="sm" disabled={isPending}>
          {isPending ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Save className="size-3.5" />
          )}
          Lưu
        </Button>
      </div>

      {state.error ? (
        <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
          {state.error}
        </div>
      ) : null}

      {state.success ? (
        <div className="flex items-start gap-1.5 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
          <CheckCircle2 className="mt-0.5 size-3.5 shrink-0" />
          <span>{state.success}</span>
        </div>
      ) : null}
    </form>
  );
}
