"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export type CampaignFormState = {
  error?: string;
};

function textValue(formData: FormData, key: string) {
  const value = String(formData.get(key) ?? "").trim();
  return value.length > 0 ? value : null;
}

export async function createCampaignAction(
  _previousState: CampaignFormState,
  formData: FormData,
): Promise<CampaignFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const campaignCode = textValue(formData, "campaign_code");
  const campaignName = textValue(formData, "campaign_name");

  if (!campaignCode) {
    return { error: "Vui lòng nhập mã chiến dịch." };
  }

  if (!campaignName) {
    return { error: "Vui lòng nhập tên chiến dịch." };
  }

  const budgetValue = textValue(formData, "budget");

  const { error } = await supabase.from("campaigns").insert({
    campaign_code: campaignCode,
    campaign_name: campaignName,
    source_id: textValue(formData, "source_id"),
    start_date: textValue(formData, "start_date"),
    end_date: textValue(formData, "end_date"),
    budget: budgetValue ? Number(budgetValue) : null,
    status: String(formData.get("status") ?? "ACTIVE"),
    note: textValue(formData, "note"),
  });

  if (error) {
    return { error: "Chưa tạo được chiến dịch: " + error.message };
  }

  revalidatePath("/campaigns");
  redirect("/campaigns");
}
