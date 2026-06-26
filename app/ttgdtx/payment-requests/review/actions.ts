"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

function textValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function uuidValue(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)
    ? value
    : null;
}

function numberValue(value: string) {
  const digits = value.replace(/[^\d]/g, "");
  if (!digits) {
    return null;
  }

  const numeric = Number(digits);
  return Number.isFinite(numeric) && numeric > 0 ? numeric : null;
}

function safePath(value: string) {
  return value.startsWith("/ttgdtx") ? value : "/ttgdtx/payment-requests/review";
}

function redirectWithError(formData: FormData, message: string): never {
  const returnTo = safePath(textValue(formData, "return_to"));
  redirect(`${returnTo}?error=${encodeURIComponent(message)}`);
}

function redirectWithStatus(formData: FormData, status: string): never {
  const returnTo = safePath(textValue(formData, "return_to"));
  redirect(`${returnTo}?updated=${encodeURIComponent(status)}`);
}

export async function reviewTtgdtxPartnerPaymentRequestAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const requestId = uuidValue(textValue(formData, "request_id"));
  const actionType = textValue(formData, "action_type");

  if (!requestId || !actionType) {
    redirectWithError(formData, "Cần chọn phiếu và hành động P2-16.");
  }

  const { error } = await supabase.rpc("review_ttgdtx_partner_payment_request", {
    p_request_id: requestId,
    p_action: actionType,
    p_approved_amount_vnd: numberValue(textValue(formData, "approved_amount_vnd")),
    p_note: textValue(formData, "note"),
    p_evidence_url: textValue(formData, "evidence_url"),
  });

  if (error) {
    redirectWithError(formData, error.message);
  }

  revalidatePath("/ttgdtx");
  revalidatePath("/ttgdtx/reconciliation/review");
  revalidatePath("/ttgdtx/payment-requests");
  revalidatePath("/ttgdtx/payment-requests/review");

  redirectWithStatus(formData, actionType);
}
