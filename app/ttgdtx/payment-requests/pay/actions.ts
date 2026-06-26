"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

function textValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function uuidValue(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  )
    ? value
    : null;
}

function moneyValue(value: string) {
  const normalized = value.replace(/[^\d]/g, "");
  if (!normalized) {
    return 0;
  }

  const numeric = Number(normalized);
  return Number.isFinite(numeric) && numeric > 0 ? numeric : 0;
}

function safeReturnTo(value: string) {
  return value.startsWith("/ttgdtx")
    ? value
    : "/ttgdtx/payment-requests/pay";
}

function redirectWithError(formData: FormData, message: string): never {
  const returnTo = safeReturnTo(textValue(formData, "return_to"));
  redirect(`${returnTo}?error=${encodeURIComponent(message)}`);
}

export async function recordTtgdtxPartnerPaymentDisbursementAction(
  formData: FormData,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const requestId = uuidValue(textValue(formData, "request_id"));
  const amount = moneyValue(textValue(formData, "amount_vnd"));
  const voucherNo = textValue(formData, "voucher_no");

  if (!requestId) {
    redirectWithError(
      formData,
      "Thiếu phiếu đề nghị thanh toán cần xử lý P2-17.",
    );
  }

  if (!amount) {
    redirectWithError(formData, "Vui lòng nhập số tiền chi.");
  }

  if (!voucherNo) {
    redirectWithError(formData, "Vui lòng nhập số chứng từ hoặc số phiếu chi.");
  }

  const evidenceUrl = textValue(formData, "evidence_url");

  if (!evidenceUrl) {
    redirectWithError(
      formData,
      "Cần gắn link chứng từ chi tiền/ủy nhiệm chi trước khi ghi nhận P2-17.",
    );
  }

  const { error } = await supabase.rpc(
    "record_ttgdtx_partner_payment_disbursement",
    {
      p_request_id: requestId,
      p_amount_vnd: amount,
      p_payment_date: textValue(formData, "payment_date") || null,
      p_payment_method: textValue(formData, "payment_method") || "BANK_TRANSFER",
      p_voucher_no: voucherNo,
      p_recipient_name: textValue(formData, "recipient_name") || null,
      p_recipient_account: textValue(formData, "recipient_account") || null,
      p_recipient_bank: textValue(formData, "recipient_bank") || null,
      p_evidence_url: evidenceUrl,
      p_note: textValue(formData, "note") || null,
    },
  );

  if (error) {
    redirectWithError(formData, error.message);
  }

  revalidatePath("/ttgdtx");
  revalidatePath("/ttgdtx/payment-requests");
  revalidatePath("/ttgdtx/payment-requests/review");
  revalidatePath("/ttgdtx/payment-requests/pay");

  redirect(`${safeReturnTo(textValue(formData, "return_to"))}?paid=1`);
}
