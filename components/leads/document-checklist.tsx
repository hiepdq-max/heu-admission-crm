"use client";

import { useActionState } from "react";
import { CheckCircle2, FileCheck2, Loader2, Save } from "lucide-react";

import {
  updateLeadDocumentAction,
  type DocumentFormState,
} from "@/app/leads/[id]/actions";
import { Button } from "@/components/ui/button";

type ChecklistRow = {
  id: string;
  document_code: string;
  document_name: string;
  is_required: boolean;
  sort_order: number;
};

type LeadDocumentRow = {
  id: string;
  checklist_id: string | null;
  document_type: string;
  status: string;
  file_url: string | null;
  note: string | null;
  checked_at: string | null;
};

type DocumentChecklistProps = {
  leadId: string;
  checklist: ChecklistRow[];
  documents: LeadDocumentRow[];
};

const statusLabels: Record<string, string> = {
  MISSING: "Thiếu",
  PENDING: "Chờ bổ sung",
  SUBMITTED: "Đã nhận",
  CHECKED: "Đã kiểm tra",
  REJECTED: "Từ chối",
};

const statusClasses: Record<string, string> = {
  MISSING: "bg-zinc-100 text-zinc-700",
  PENDING: "bg-amber-50 text-amber-700",
  SUBMITTED: "bg-sky-50 text-sky-700",
  CHECKED: "bg-emerald-50 text-emerald-700",
  REJECTED: "bg-rose-50 text-rose-700",
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

function DocumentChecklistItem({
  leadId,
  item,
  document,
}: {
  leadId: string;
  item: ChecklistRow;
  document?: LeadDocumentRow;
}) {
  const initialState: DocumentFormState = {};
  const [state, formAction, isPending] = useActionState(
    updateLeadDocumentAction,
    initialState,
  );

  const fieldValue = (name: string, fallback = "") =>
    state.fields?.[name] ?? fallback;
  const fieldError = (name: string) => state.fieldErrors?.[name];
  const fieldClass = (name: string) =>
    fieldError(name)
      ? "h-9 w-full rounded-md border border-rose-300 bg-white px-2 text-sm outline-none focus:border-rose-500 focus:ring-3 focus:ring-zinc-200"
      : "h-9 w-full rounded-md border border-zinc-300 bg-white px-2 text-sm outline-none focus:border-zinc-500 focus:ring-3 focus:ring-zinc-200";
  const status = document?.status ?? "MISSING";
  const checkedTime = formatDateTime(document?.checked_at ?? null);

  return (
    <form
      key={
        state.success
          ? `success-${item.id}`
          : state.error
            ? JSON.stringify(state.fields ?? {})
            : `initial-${item.id}`
      }
      action={formAction}
      className="rounded-md border border-zinc-200 bg-white p-4"
    >
      <input name="lead_id" type="hidden" value={leadId} />
      <input name="checklist_id" type="hidden" value={item.id} />
      <input name="document_type" type="hidden" value={item.document_code} />

      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="font-medium text-zinc-900">{item.document_name}</h4>
            {item.is_required ? (
              <span className="rounded-md bg-rose-50 px-2 py-1 text-xs font-medium text-rose-700">
                Bắt buộc
              </span>
            ) : (
              <span className="rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-600">
                Nếu có
              </span>
            )}
            <span
              className={`rounded-md px-2 py-1 text-xs font-medium ${
                statusClasses[status] ?? "bg-zinc-100 text-zinc-700"
              }`}
            >
              {statusLabels[status] ?? status}
            </span>
          </div>
          <p className="mt-1 text-xs text-zinc-500">{item.document_code}</p>
          {checkedTime ? (
            <p className="mt-2 inline-flex items-center gap-2 text-xs text-emerald-700">
              <CheckCircle2 className="size-3.5" />
              Đã kiểm tra lúc {checkedTime}
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

      <div className="mt-4 grid gap-3 lg:grid-cols-[180px_1fr_1fr]">
        <div className="space-y-2">
          <label className="text-xs font-medium text-zinc-600" htmlFor={`status-${item.id}`}>
            Trạng thái
          </label>
          <select
            id={`status-${item.id}`}
            name="status"
            defaultValue={fieldValue("status", status)}
            className={fieldClass("status")}
          >
            <option value="MISSING">Thiếu</option>
            <option value="PENDING">Chờ bổ sung</option>
            <option value="SUBMITTED">Đã nhận</option>
            <option value="CHECKED">Đã kiểm tra</option>
            <option value="REJECTED">Từ chối</option>
          </select>
          {fieldError("status") ? (
            <p className="text-xs font-medium text-rose-600">
              {fieldError("status")}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-zinc-600" htmlFor={`file-${item.id}`}>
            Link file
          </label>
          <input
            id={`file-${item.id}`}
            name="file_url"
            defaultValue={fieldValue("file_url", document?.file_url ?? "")}
            className={fieldClass("file_url")}
            placeholder="https://drive.google.com/..."
          />
          {fieldError("file_url") ? (
            <p className="text-xs font-medium text-rose-600">
              {fieldError("file_url")}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-zinc-600" htmlFor={`note-${item.id}`}>
            Ghi chú
          </label>
          <input
            id={`note-${item.id}`}
            name="note"
            defaultValue={fieldValue("note", document?.note ?? "")}
            className={fieldClass("note")}
            placeholder="Thiếu bản photo, cần bổ sung..."
          />
          {fieldError("note") ? (
            <p className="text-xs font-medium text-rose-600">
              {fieldError("note")}
            </p>
          ) : null}
        </div>
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

export function DocumentChecklist({
  leadId,
  checklist,
  documents,
}: DocumentChecklistProps) {
  const documentMap = new Map(
    documents.map((document) => [document.document_type, document]),
  );
  const requiredCount = checklist.filter((item) => item.is_required).length;
  const checkedRequiredCount = checklist.filter((item) => {
    const document = documentMap.get(item.document_code);
    return item.is_required && document?.status === "CHECKED";
  }).length;

  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-base font-semibold">Checklist hồ sơ nhập học</h3>
          <p className="mt-1 text-sm text-zinc-500">
            Cập nhật trạng thái từng giấy tờ trước khi xét đủ điều kiện.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-md bg-zinc-100 px-3 py-2 text-sm font-medium text-zinc-700">
          <FileCheck2 className="size-4" />
          {checkedRequiredCount}/{requiredCount} hồ sơ bắt buộc đã kiểm tra
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {checklist.map((item) => (
          <DocumentChecklistItem
            key={item.id}
            leadId={leadId}
            item={item}
            document={documentMap.get(item.document_code)}
          />
        ))}
      </div>
    </section>
  );
}
