"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export type PartnerFormState = {
  error?: string;
};

function textValue(formData: FormData, key: string) {
  const value = String(formData.get(key) ?? "").trim();
  return value.length > 0 ? value : null;
}

export async function createPartnerAction(
  _previousState: PartnerFormState,
  formData: FormData,
): Promise<PartnerFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const partnerCode = textValue(formData, "partner_code");
  const partnerName = textValue(formData, "partner_name");
  const partnerType = textValue(formData, "partner_type");

  if (!partnerCode) {
    return { error: "Vui lòng nhập mã đối tác." };
  }

  if (!partnerName) {
    return { error: "Vui lòng nhập tên đối tác." };
  }

  if (!partnerType) {
    return { error: "Vui lòng chọn loại đối tác." };
  }

  const { error } = await supabase.from("partners").insert({
    partner_code: partnerCode,
    partner_name: partnerName,
    partner_type: partnerType,
    phone: textValue(formData, "phone"),
    email: textValue(formData, "email"),
    area: textValue(formData, "area"),
    owner_user_id: user.id,
    commission_note: textValue(formData, "commission_note"),
    contract_status: textValue(formData, "contract_status"),
    status: String(formData.get("status") ?? "ACTIVE"),
  });

  if (error) {
    return { error: "Chưa tạo được đối tác: " + error.message };
  }

  revalidatePath("/partners");
  redirect("/partners");
}
