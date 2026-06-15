"use client";

import { useActionState } from "react";
import {
  Banknote,
  CheckCircle2,
  Loader2,
  Save,
  Send,
  ShieldCheck,
  WalletCards,
  XCircle,
} from "lucide-react";

import {
  createHouCommissionPaymentBatchAction,
  updateHouCommissionPaymentBatchStatusAction,
  type HouPaymentBatchState,
} from "@/app/hou/actions";
import { Button } from "@/components/ui/button";

export type HouPaymentCandidateRow = {
  claimLineId: string;
  claimId: string;
  studentName: string;
  houStudentCode: string | null;
  classification: string;
  componentName: string;
  grossAmountVnd: number;
  taxWithheldVnd: number;
  debtOffsetAmountVnd: number;
  netAmountVnd: number;
  claimStatus: string;
  lineStatus: string;
};

export type HouPaymentBatchRow = {
  id: string;
  payment_batch_code: string;
  payment_batch_name: string;
  payment_method: string;
  status: string;
  accounting_voucher_no: string | null;
  total_gross_vnd: number;
  total_tax_withheld_vnd: number;
  total_debt_offset_vnd: number;
  total_net_vnd: number;
  requested_at: string | null;
  approved_at: string | null;
  paid_at: string | null;
  note: string | null;
  created_at: string;
  line_count: number;
};

type HouPaymentBatchesProps = {
  canManageCom: boolean;
  candidates: HouPaymentCandidateRow[];
  batches: HouPaymentBatchRow[];
  defaultBatchCode: string;
  defaultBatchName: string;
};

const initialState: HouPaymentBatchState = {};

const inputClass =
  "h-9 w-full rounded-md border border-zinc-300 bg-white px-2 text-sm outline-none transition focus:border-zinc-500 focus:ring-3 focus:ring-zinc-200";

const textareaClass =
  "min-h-16 w-full rounded-md border border-zinc-300 bg-white px-2 py-2 text-sm outline-none transition focus:border-zinc-500 focus:ring-3 focus:ring-zinc-200";

const batchStatusClasses: Record<string, string> = {
  DRAFT: "bg-zinc-100 text-zinc-700",
  REVIEWING: "bg-violet-50 text-violet-700",
  APPROVED: "bg-emerald-50 text-emerald-700",
  PAID: "bg-green-50 text-green-700",
  CANCELLED: "bg-rose-50 text-rose-700",
};

function formatCurrency(value: number) {
  return `${new Intl.NumberFormat("vi-VN").format(value)}đ`;
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

function fieldValue(state: HouPaymentBatchState, name: string, fallback = "") {
  return state.fields?.[name] ?? fallback;
}

function fieldError(state: HouPaymentBatchState, name: string) {
  return state.fieldErrors?.[name];
}

function fieldClass(
  state: HouPaymentBatchState,
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
  state: HouPaymentBatchState;
  name: string;
}) {
  const message = fieldError(state, name);

  if (!message) {
    return null;
  }

  return <p className="text-xs font-medium text-rose-600">{message}</p>;
}

function batchTargetOptions(status: string) {
  if (status === "DRAFT") {
    return [
      { value: "REVIEWING", label: "Chuyển rà soát" },
      { value: "APPROVED", label: "Duyệt kỳ" },
      { value: "CANCELLED", label: "Hủy kỳ" },
    ];
  }

  if (status === "REVIEWING") {
    return [
      { value: "APPROVED", label: "Duyệt kỳ" },
      { value: "CANCELLED", label: "Hủy kỳ" },
    ];
  }

  if (status === "APPROVED") {
    return [
      { value: "PAID", label: "Ghi nhận đã chi" },
      { value: "CANCELLED", label: "Hủy kỳ" },
    ];
  }

  return [];
}

function targetButtonVariant(value: string) {
  if (value === "CANCELLED") {
    return "destructive" as const;
  }

  if (value === "REVIEWING") {
    return "outline" as const;
  }

  return "default" as const;
}

function TargetActionIcon({ value }: { value: string }) {
  if (value === "REVIEWING") {
    return <Send className="size-3.5" />;
  }

  if (value === "APPROVED") {
    return <ShieldCheck className="size-3.5" />;
  }

  if (value === "PAID") {
    return <Banknote className="size-3.5" />;
  }

  if (value === "CANCELLED") {
    return <XCircle className="size-3.5" />;
  }

  return <Save className="size-3.5" />;
}

function BatchStatusForm({ batch }: { batch: HouPaymentBatchRow }) {
  const [state, formAction, isPending] = useActionState(
    updateHouCommissionPaymentBatchStatusAction,
    initialState,
  );
  const options = batchTargetOptions(batch.status);
  const shouldShowVoucher =
    options.some((option) => option.value === "PAID") ||
    Boolean(batch.accounting_voucher_no);

  if (options.length === 0) {
    return <p className="text-xs text-zinc-500">Không còn thao tác.</p>;
  }

  return (
    <form
      key={
        state.success
          ? `success-${batch.id}`
          : state.error
            ? JSON.stringify(state.fields ?? {})
            : `initial-${batch.id}`
      }
      action={formAction}
      className="space-y-2"
    >
      <input type="hidden" name="payment_batch_id" value={batch.id} />
      <div className="grid gap-2 md:grid-cols-2">
        {shouldShowVoucher ? (
          <div>
            <input
              name="accounting_voucher_no"
              className={fieldClass(state, "accounting_voucher_no")}
              defaultValue={fieldValue(
                state,
                "accounting_voucher_no",
                batch.accounting_voucher_no ?? "",
              )}
              placeholder="Số chứng từ kế toán"
            />
            <FieldError state={state} name="accounting_voucher_no" />
          </div>
        ) : (
          <input type="hidden" name="accounting_voucher_no" value="" />
        )}

        <div>
          <input
            name="note"
            className={fieldClass(state, "note")}
            defaultValue={fieldValue(state, "note")}
            placeholder="Ghi chú xử lý"
          />
          <FieldError state={state} name="note" />
        </div>
      </div>

      {options.some((option) => option.value === "PAID") ? (
        <p className="text-xs text-amber-700">
          Chỉ ghi nhận đã chi khi đã có chứng từ kế toán thật.
        </p>
      ) : null}

      <div>
        <div className="flex flex-wrap gap-2">
          {options.map((option) => (
            <Button
              key={option.value}
              type="submit"
              name="target_status"
              value={option.value}
              size="sm"
              variant={targetButtonVariant(option.value)}
              disabled={isPending}
            >
              {isPending ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <TargetActionIcon value={option.value} />
              )}
              {option.label}
            </Button>
          ))}
        </div>
        <FieldError state={state} name="target_status" />
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

export function HouPaymentBatches({
  canManageCom,
  candidates,
  batches,
  defaultBatchCode,
  defaultBatchName,
}: HouPaymentBatchesProps) {
  const [state, formAction, isPending] = useActionState(
    createHouCommissionPaymentBatchAction,
    initialState,
  );
  const totalSelectedHint = candidates.reduce(
    (total, candidate) => total + candidate.netAmountVnd,
    0,
  );

  return (
    <section className="rounded-lg border border-zinc-200 bg-white shadow-sm">
      <div className="border-b border-zinc-200 p-5">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-zinc-100">
            <WalletCards className="size-5 text-zinc-600" />
          </div>
          <div>
            <h2 className="text-base font-semibold">Kỳ thanh toán COM HOU</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Gom các dòng COM đã duyệt vào một kỳ thanh toán để kế toán rà soát,
              duyệt và ghi nhận đã chi.
            </p>
          </div>
        </div>
      </div>

      {!canManageCom ? (
        <div className="border-b border-zinc-200 p-5 text-sm text-amber-800">
          Tài khoản hiện tại không có quyền lập hoặc cập nhật kỳ thanh toán COM.
        </div>
      ) : (
        <form
          key={
            state.success
              ? "success"
              : state.error
                ? JSON.stringify(state.fields ?? {})
                : "initial"
          }
          action={formAction}
          className="border-b border-zinc-200 p-5"
        >
          <div className="grid gap-4 lg:grid-cols-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700">
                Mã kỳ thanh toán
              </label>
              <input
                name="payment_batch_code"
                className={fieldClass(state, "payment_batch_code")}
                defaultValue={fieldValue(
                  state,
                  "payment_batch_code",
                  defaultBatchCode,
                )}
              />
              <FieldError state={state} name="payment_batch_code" />
            </div>

            <div className="space-y-2 lg:col-span-2">
              <label className="text-sm font-medium text-zinc-700">
                Tên kỳ thanh toán
              </label>
              <input
                name="payment_batch_name"
                className={fieldClass(state, "payment_batch_name")}
                defaultValue={fieldValue(
                  state,
                  "payment_batch_name",
                  defaultBatchName,
                )}
              />
              <FieldError state={state} name="payment_batch_name" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700">
                Hình thức chi
              </label>
              <select
                name="payment_method"
                className={fieldClass(state, "payment_method")}
                defaultValue={fieldValue(
                  state,
                  "payment_method",
                  "BANK_TRANSFER",
                )}
              >
                <option value="BANK_TRANSFER">Chuyển khoản</option>
                <option value="CASH">Tiền mặt</option>
                <option value="OFFSET_DEBT">Bù trừ công nợ</option>
                <option value="INTERNAL_TRANSFER">Chuyển nội bộ</option>
                <option value="OTHER">Khác</option>
              </select>
              <FieldError state={state} name="payment_method" />
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <label className="text-sm font-medium text-zinc-700">Ghi chú</label>
            <textarea
              name="note"
              className={fieldClass(state, "note", textareaClass)}
              defaultValue={fieldValue(state, "note")}
              placeholder="VD: Kỳ COM HOU tháng 06/2026, chờ kế toán đối soát trước khi chi."
            />
            <FieldError state={state} name="note" />
          </div>

          <div className="mt-5 overflow-x-auto rounded-lg border border-zinc-200">
            <table className="w-full min-w-[920px] text-sm">
              <thead className="bg-zinc-50 text-left text-xs font-medium uppercase text-zinc-500">
                <tr>
                  <th className="px-4 py-3">Chọn</th>
                  <th className="px-4 py-3">Học viên</th>
                  <th className="px-4 py-3">Thành phần COM</th>
                  <th className="px-4 py-3">Gross</th>
                  <th className="px-4 py-3">Thuế</th>
                  <th className="px-4 py-3">Bù trừ</th>
                  <th className="px-4 py-3">Net chi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {candidates.length === 0 ? (
                  <tr>
                    <td className="px-4 py-6 text-center text-zinc-500" colSpan={7}>
                      Chưa có dòng COM APPROVED nào sẵn sàng lập kỳ thanh toán.
                    </td>
                  </tr>
                ) : (
                  candidates.map((candidate) => (
                    <tr key={candidate.claimLineId}>
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          name="claim_line_ids"
                          value={candidate.claimLineId}
                          defaultChecked
                          className="size-4 rounded border-zinc-300"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-zinc-900">
                          {candidate.studentName}
                        </p>
                        <p className="mt-1 font-mono text-xs text-zinc-500">
                          {candidate.houStudentCode ?? "Chưa có mã SV"} ·{" "}
                          {candidate.classification}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-zinc-700">
                        {candidate.componentName}
                      </td>
                      <td className="px-4 py-3 text-zinc-700">
                        {formatCurrency(candidate.grossAmountVnd)}
                      </td>
                      <td className="px-4 py-3 text-zinc-700">
                        {formatCurrency(candidate.taxWithheldVnd)}
                      </td>
                      <td className="px-4 py-3 text-zinc-700">
                        {formatCurrency(candidate.debtOffsetAmountVnd)}
                      </td>
                      <td className="px-4 py-3 font-medium text-zinc-950">
                        {formatCurrency(candidate.netAmountVnd)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-zinc-500">
              Tổng net nếu chọn tất cả:{" "}
              <span className="font-medium text-zinc-950">
                {formatCurrency(totalSelectedHint)}
              </span>
            </p>
            <Button type="submit" disabled={isPending || candidates.length === 0}>
              {isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              Tạo kỳ thanh toán
            </Button>
          </div>

          {state.error ? (
            <div className="mt-4 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {state.error}
            </div>
          ) : null}

          {state.success ? (
            <div className="mt-4 flex items-start gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
              <span>{state.success}</span>
            </div>
          ) : null}
        </form>
      )}

      <div className="p-5">
        <h3 className="text-sm font-semibold">Các kỳ thanh toán gần đây</h3>
        <div className="mt-4 overflow-x-auto rounded-lg border border-zinc-200">
          <table className="w-full min-w-[980px] text-sm">
            <thead className="bg-zinc-50 text-left text-xs font-medium uppercase text-zinc-500">
              <tr>
                <th className="px-4 py-3">Kỳ thanh toán</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3">Số dòng</th>
                <th className="px-4 py-3">Net chi</th>
                <th className="px-4 py-3">Chứng từ</th>
                <th className="px-4 py-3">Mốc xử lý</th>
                <th className="px-4 py-3">Cập nhật</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {batches.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-center text-zinc-500" colSpan={7}>
                    Chưa có kỳ thanh toán COM HOU.
                  </td>
                </tr>
              ) : (
                batches.map((batch) => (
                  <tr key={batch.id} className="align-top">
                    <td className="px-4 py-3">
                      <p className="font-medium text-zinc-900">
                        {batch.payment_batch_name}
                      </p>
                      <p className="mt-1 font-mono text-xs text-zinc-500">
                        {batch.payment_batch_code}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-md px-2 py-1 text-xs font-medium ${
                          batchStatusClasses[batch.status] ??
                          "bg-zinc-100 text-zinc-700"
                        }`}
                      >
                        {batch.status}
                      </span>
                      <p className="mt-2 text-xs text-zinc-500">
                        {batch.payment_method}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-zinc-700">
                      {batch.line_count}
                    </td>
                    <td className="px-4 py-3 font-medium text-zinc-950">
                      {formatCurrency(batch.total_net_vnd)}
                    </td>
                    <td className="px-4 py-3 text-zinc-700">
                      {batch.accounting_voucher_no ?? "Chưa có"}
                    </td>
                    <td className="px-4 py-3 text-xs leading-5 text-zinc-500">
                      <p>Tạo: {formatDateTime(batch.created_at)}</p>
                      <p>Duyệt: {formatDateTime(batch.approved_at)}</p>
                      <p>Chi: {formatDateTime(batch.paid_at)}</p>
                    </td>
                    <td className="px-4 py-3">
                      {canManageCom ? (
                        <BatchStatusForm batch={batch} />
                      ) : (
                        <span className="text-xs text-zinc-500">
                          Không có quyền cập nhật
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
