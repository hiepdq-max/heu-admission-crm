"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

function textValue(formData: FormData, key: string) {
  const value = formData.get(key);

  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
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

  const numeric = Number(value.replace(/[^\d]/g, ""));
  return Number.isFinite(numeric) && numeric > 0 ? numeric : null;
}

function safePath(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/ttgdtx/payment-requests";
  }

  return value;
}

function redirectWithStatus(formData: FormData, status: string) {
  const target = safePath(textValue(formData, "return_to"));
  redirect(`${target}?created=${encodeURIComponent(status)}`);
}

function redirectWithError(formData: FormData, message: string) {
  const target = safePath(textValue(formData, "return_to"));
  redirect(`${target}?error=${encodeURIComponent(message)}`);
}

export async function createTtgdtxPartnerPaymentRequestAction(
  formData: FormData,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const batchId = uuidValue(textValue(formData, "batch_id"));

  if (!batchId) {
    redirectWithError(
      formData,
      "Cần chọn một kỳ P2-14 đã khóa trước khi tạo đề nghị thanh toán.",
    );
  }

  const evidenceUrl = textValue(formData, "evidence_url");

  if (!evidenceUrl) {
    redirectWithError(
      formData,
      "Cần gắn link bộ hồ sơ BBNT/hóa đơn đối tác trước khi tạo đề nghị thanh toán P2-15.",
    );
  }

  const { error } = await supabase.rpc(
    "create_ttgdtx_partner_payment_request",
    {
      p_batch_id: batchId,
      p_requested_amount_vnd: numberValue(
        textValue(formData, "requested_amount_vnd"),
      ),
      p_note: textValue(formData, "note"),
      p_evidence_url: evidenceUrl,
    },
  );

  if (error) {
    redirectWithError(formData, error.message);
  }

  revalidatePath("/ttgdtx");
  revalidatePath("/ttgdtx/reconciliation");
  revalidatePath("/ttgdtx/reconciliation/review");
  revalidatePath("/ttgdtx/payment-requests");
  redirectWithStatus(formData, "1");
}
