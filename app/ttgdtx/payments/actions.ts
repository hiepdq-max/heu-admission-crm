"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

const invoiceRequiredValues = new Set([
  "REQUIRED",
  "NOT_REQUIRED",
  "PENDING_POLICY",
  "WAIVED_BY_AUTHORITY",
]);

const invoiceIssuerValues = new Set([
  "HEU",
  "TTGDTX",
  "PARTNER",
  "OTHER_APPROVED",
]);

const invoiceStatusValues = new Set([
  "NOT_STARTED",
  "PENDING",
  "ISSUED",
  "CANCELLED",
  "REPLACED",
  "WAIVED",
  "NOT_REQUIRED",
]);

function textValue(formData: FormData, key: string) {
  const value = String(formData.get(key) ?? "").trim();
  return value.length > 0 ? value : null;
}

function uuidValue(value: string | null) {
  if (!value) {
    return null;
  }

  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  )
    ? value
    : null;
}

function numberValue(value: string | null) {
  if (!value) {
    return null;
  }

  const normalized = value.replace(/[^\d]/g, "");
  const numeric = Number(normalized);

  return Number.isFinite(numeric) && numeric > 0 ? numeric : null;
}

function safePath(value: string | null, fallback = "/ttgdtx/payments") {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return fallback;
  }

  return value;
}

function redirectWithStatus(formData: FormData, status: string) {
  const returnTo = safePath(textValue(formData, "return_to"));
  const joiner = returnTo.includes("?") ? "&" : "?";

  redirect(`${returnTo}${joiner}${status}=1`);
}

function redirectWithError(formData: FormData, message: string) {
  const returnTo = safePath(textValue(formData, "return_to"));
  const joiner = returnTo.includes("?") ? "&" : "?";

  redirect(`${returnTo}${joiner}error=${encodeURIComponent(message)}`);
}

export async function recordTtgdtxTuitionPaymentAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const receivableId = uuidValue(textValue(formData, "receivable_id"));
  const paymentAmount = numberValue(textValue(formData, "payment_amount_vnd"));
  const paymentDate = textValue(formData, "payment_date");
  const voucherNo = textValue(formData, "voucher_no");
  const invoiceRequired =
    textValue(formData, "invoice_required") ?? "PENDING_POLICY";
  const invoiceIssuer = textValue(formData, "invoice_issuer");
  const invoiceStatus = textValue(formData, "invoice_status") ?? "PENDING";

  if (!receivableId || !paymentAmount || !paymentDate || !voucherNo) {
    redirectWithError(
      formData,
      "Cần chọn công nợ, nhập số tiền, ngày thu và số chứng từ trước khi lưu.",
    );
  }

  if (
    !invoiceRequiredValues.has(invoiceRequired) ||
    (invoiceIssuer && !invoiceIssuerValues.has(invoiceIssuer)) ||
    !invoiceStatusValues.has(invoiceStatus)
  ) {
    redirectWithError(
      formData,
      "Cần chọn trạng thái hóa đơn/chứng từ hợp lệ trước khi lưu.",
    );
  }

  const { error } = await supabase.rpc("record_ttgdtx_tuition_payment", {
    p_receivable_id: receivableId,
    p_payment_amount_vnd: paymentAmount,
    p_payment_date: paymentDate,
    p_payment_method: textValue(formData, "payment_method") ?? "BANK_TRANSFER",
    p_voucher_no: voucherNo,
    p_evidence_url: textValue(formData, "evidence_url"),
    p_payer_name: textValue(formData, "payer_name"),
    p_collector_note: textValue(formData, "collector_note"),
    p_invoice_required: invoiceRequired,
    p_invoice_issuer: invoiceIssuer,
    p_invoice_status: invoiceStatus,
    p_invoice_no: textValue(formData, "invoice_no"),
    p_invoice_issue_date: textValue(formData, "invoice_issue_date"),
    p_invoice_evidence_url: textValue(formData, "invoice_evidence_url"),
    p_invoice_waiver_reason: textValue(formData, "invoice_waiver_reason"),
    p_invoice_control_note: textValue(formData, "invoice_control_note"),
  });

  if (error) {
    redirectWithError(formData, error.message);
  }

  revalidatePath("/ttgdtx");
  revalidatePath("/ttgdtx/receivables");
  revalidatePath("/ttgdtx/payments");
  redirectWithStatus(formData, "collected");
}
