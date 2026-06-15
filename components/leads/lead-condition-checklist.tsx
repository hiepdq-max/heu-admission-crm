"use client";

import { useActionState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardCheck,
  Loader2,
  Save,
} from "lucide-react";

import {
  updateLeadConditionAction,
  type ConditionFormState,
} from "@/app/leads/[id]/actions";
import { Button } from "@/components/ui/button";

export type LeadConditionTemplateRow = {
  id: string;
  condition_scope: string;
  condition_code: string;
  condition_name: string;
  condition_description: string | null;
  is_required_default: boolean;
  sort_order: number;
};

export type LeadConditionCheckRow = {
  id: string;
  lead_id: string;
  condition_template_id: string | null;
  condition_scope: string;
  condition_code: string;
  condition_name: string;
  is_required: boolean;
  is_checked: boolean;
  note: string | null;
  checked_at: string | null;
};

type LeadConditionChecklistProps = {
  leadId: string;
  templates: LeadConditionTemplateRow[];
  checks: LeadConditionCheckRow[];
  loadError?: string;
};

const initialState: ConditionFormState = {};

const scopeLabels: Record<string, string> = {
  ENROLLMENT: "Điều kiện nhập học",
  COM: "Điều kiện nhận COM",
  OTHER: "Điều kiện khác",
};

const scopeDescriptions: Record<string, string> = {
  ENROLLMENT:
    "Các điều kiện bắt buộc trước khi xác nhận học viên đủ điều kiện nhập học.",
  COM:
    "Các điều kiện bắt buộc trước khi tạo, duyệt hoặc chi COM.",
  OTHER:
    "Điều kiện vận hành bổ sung. Có thể bật/tắt bắt buộc theo từng lead.",
};

function formatDateTime(value: string | null) {
  if (!value) {
    return null;
  }

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function fieldValue(state: ConditionFormState, name: string, fallback = "") {
  return state.fields?.[name] ?? fallback;
}

function ConditionRow({
  leadId,
  template,
  check,
}: {
  leadId: string;
  template: LeadConditionTemplateRow;
  check?: LeadConditionCheckRow;
}) {
  const [state, formAction, isPending] = useActionState(
    updateLeadConditionAction,
    initialState,
  );
  const lockedRequired = template.condition_scope !== "OTHER";
  const checkedAt = formatDateTime(check?.checked_at ?? null);
  const isRequired = lockedRequired
    ? true
    : state.error
      ? fieldValue(state, "is_required") === "on"
      : check?.is_required ?? template.is_required_default;
  const isChecked = state.error
    ? fieldValue(state, "is_checked") === "on"
    : check?.is_checked ?? false;

  return (
    <form
      action={formAction}
      className="rounded-md border border-zinc-200 bg-white p-4"
    >
      <input type="hidden" name="lead_id" value={leadId} />
      <input type="hidden" name="condition_template_id" value={template.id} />
      {lockedRequired ? <input type="hidden" name="is_required" value="on" /> : null}

      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="font-medium text-zinc-950">
              {template.condition_name}
            </h4>
            <span
              className={`rounded-md px-2 py-1 text-xs font-medium ${
                isRequired
                  ? "bg-rose-50 text-rose-700"
                  : "bg-zinc-100 text-zinc-600"
              }`}
            >
              {isRequired ? "Bắt buộc" : "Không bắt buộc"}
            </span>
            <span
              className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium ${
                isChecked
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-amber-50 text-amber-700"
              }`}
            >
              {isChecked ? (
                <CheckCircle2 className="size-3.5" />
              ) : (
                <AlertTriangle className="size-3.5" />
              )}
              {isChecked ? "Đã đạt" : "Chưa đạt"}
            </span>
          </div>
          <p className="mt-2 text-sm leading-6 text-zinc-500">
            {template.condition_description ?? template.condition_code}
          </p>
          {checkedAt ? (
            <p className="mt-2 text-xs text-emerald-700">
              Đã tick lúc {checkedAt}
            </p>
          ) : null}
        </div>

        <Button type="submit" size="sm" disabled={isPending}>
          {isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          Lưu
        </Button>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-[180px_190px_1fr]">
        <label className="flex items-center gap-2 rounded-md border border-zinc-200 px-3 py-2 text-sm text-zinc-700">
          <input
            name="is_checked"
            type="checkbox"
            className="size-4 rounded border-zinc-300"
            defaultChecked={isChecked}
          />
          Đã đạt
        </label>

        <label
          className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm ${
            lockedRequired
              ? "border-zinc-200 bg-zinc-50 text-zinc-500"
              : "border-zinc-200 text-zinc-700"
          }`}
        >
          <input
            name={lockedRequired ? undefined : "is_required"}
            type="checkbox"
            className="size-4 rounded border-zinc-300"
            defaultChecked={isRequired}
            disabled={lockedRequired}
          />
          Bắt buộc
        </label>

        <input
          name="note"
          defaultValue={fieldValue(state, "note", check?.note ?? "")}
          className="h-10 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm outline-none transition focus:border-zinc-500 focus:ring-3 focus:ring-zinc-200"
          placeholder="Ghi chú kiểm tra, ví dụ: đã đối chiếu với hồ sơ/học phí..."
        />
      </div>

      {state.error ? (
        <div className="mt-3 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {state.error}
        </div>
      ) : null}

      {state.success ? (
        <div className="mt-3 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {state.success}
        </div>
      ) : null}
    </form>
  );
}

export function LeadConditionChecklist({
  leadId,
  templates,
  checks,
  loadError,
}: LeadConditionChecklistProps) {
  const checksByCode = new Map(checks.map((check) => [check.condition_code, check]));
  const requiredTemplates = templates.filter((template) => {
    const check = checksByCode.get(template.condition_code);

    return (
      template.condition_scope !== "OTHER" ||
      check?.is_required ||
      template.is_required_default
    );
  });
  const requiredTotal = requiredTemplates.length;
  const requiredDone = requiredTemplates.filter((template) => {
    const check = checksByCode.get(template.condition_code);

    return check?.is_checked;
  }).length;

  if (loadError) {
    return (
      <section className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
        <div className="flex items-start gap-2">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          <p>
            Chưa đọc được checklist điều kiện. Hãy chạy SQL bước 36A rồi tải lại
            trang. Chi tiết: {loadError}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-lg border border-zinc-200 bg-white shadow-sm">
      <div className="border-b border-zinc-200 p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-zinc-100">
              <ClipboardCheck className="size-5 text-zinc-600" />
            </div>
            <div>
              <h3 className="text-base font-semibold">
                Điều kiện nhập học và COM
              </h3>
              <p className="mt-1 text-sm text-zinc-500">
                Tick từng điều kiện đã đạt. Điều kiện nhập học và COM là bắt buộc;
                điều kiện khác có thể bật/tắt bắt buộc theo từng lead.
              </p>
            </div>
          </div>
          <div
            className={`rounded-md border px-3 py-2 text-sm ${
              requiredDone >= requiredTotal && requiredTotal > 0
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-amber-200 bg-amber-50 text-amber-800"
            }`}
          >
            {requiredDone}/{requiredTotal} điều kiện bắt buộc đã đạt
          </div>
        </div>
      </div>

      <div className="space-y-6 p-5">
        {["ENROLLMENT", "COM", "OTHER"].map((scope) => {
          const scopeTemplates = templates
            .filter((template) => template.condition_scope === scope)
            .sort((a, b) => a.sort_order - b.sort_order);

          return (
            <div key={scope} className="space-y-3">
              <div>
                <h4 className="text-sm font-semibold">{scopeLabels[scope]}</h4>
                <p className="mt-1 text-sm text-zinc-500">
                  {scopeDescriptions[scope]}
                </p>
              </div>
              {scopeTemplates.length === 0 ? (
                <div className="rounded-md border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-500">
                  Chưa có điều kiện trong nhóm này.
                </div>
              ) : (
                scopeTemplates.map((template) => (
                  <ConditionRow
                    key={template.id}
                    leadId={leadId}
                    template={template}
                    check={checksByCode.get(template.condition_code)}
                  />
                ))
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
