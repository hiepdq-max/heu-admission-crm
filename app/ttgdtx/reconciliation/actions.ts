"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

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

function safePath(value: string | null, fallback = "/ttgdtx/reconciliation") {
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

export async function createTtgdtxReconciliationBatchAction(
  formData: FormData,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const partnerId = uuidValue(textValue(formData, "partner_id"));
  const periodLabel = textValue(formData, "period_label");
  const periodStart = textValue(formData, "period_start");
  const periodEnd = textValue(formData, "period_end");

  if (!partnerId || !periodLabel || !periodStart || !periodEnd) {
    redirectWithError(
      formData,
      "Cần chọn TTGDTX, nhập tên kỳ, ngày bắt đầu và ngày kết thúc trước khi tạo kỳ đối soát.",
    );
  }

  const { error } = await supabase.rpc("create_ttgdtx_reconciliation_batch", {
    p_partner_id: partnerId,
    p_period_label: periodLabel,
    p_period_start: periodStart,
    p_period_end: periodEnd,
    p_note: textValue(formData, "note"),
    p_evidence_url: textValue(formData, "evidence_url"),
  });

  if (error) {
    redirectWithError(formData, error.message);
  }

  revalidatePath("/ttgdtx");
  revalidatePath("/ttgdtx/receivables");
  revalidatePath("/ttgdtx/payments");
  revalidatePath("/ttgdtx/reconciliation");
  redirectWithStatus(formData, "created");
}
