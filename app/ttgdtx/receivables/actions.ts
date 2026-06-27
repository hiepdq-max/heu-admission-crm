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

function safePath(value: string | null, fallback = "/ttgdtx/receivables") {
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

export async function createTtgdtxReceivableAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const leadId = uuidValue(textValue(formData, "lead_id"));
  const policyId = uuidValue(textValue(formData, "tuition_policy_id"));
  const dueDate = textValue(formData, "due_date");
  const termLabel = textValue(formData, "term_label") ?? "KY_1";

  if (!leadId || !policyId || !dueDate) {
    redirectWithError(
      formData,
      "Cần chọn lead, chính sách học phí và hạn thu trước khi tạo công nợ.",
    );
  }

  const { error } = await supabase.rpc("create_ttgdtx_student_receivable", {
    p_lead_id: leadId,
    p_tuition_policy_id: policyId,
    p_due_date: dueDate,
    p_term_label: termLabel,
    p_note: textValue(formData, "note"),
  });

  if (error) {
    redirectWithError(formData, error.message);
  }

  revalidatePath("/ttgdtx");
  revalidatePath("/ttgdtx/tuition");
  revalidatePath("/ttgdtx/receivables");
  revalidatePath("/ttgdtx/gate");
  revalidatePath("/ttgdtx/simulation");
  redirectWithStatus(formData, "created");
}
