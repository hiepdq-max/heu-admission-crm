"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

function textValue(formData: FormData, key: string) {
  const value = String(formData.get(key) ?? "").trim();
  return value.length > 0 ? value : null;
}

export async function updateUserProfileAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const targetUserId = textValue(formData, "user_id");
  const roleId = textValue(formData, "role_id");
  const departmentId = textValue(formData, "department_id");
  const status = String(formData.get("status") ?? "ACTIVE");

  if (!targetUserId || !roleId) {
    redirect("/settings?error=missing_user_or_role");
  }

  if (!["ACTIVE", "INACTIVE"].includes(status)) {
    redirect("/settings?error=invalid_status");
  }

  const { data: currentProfile } = await supabase
    .from("users_profile")
    .select("role_id")
    .eq("id", user.id)
    .maybeSingle();

  const { data: currentRole } = currentProfile?.role_id
    ? await supabase
        .from("roles")
        .select("code")
        .eq("id", currentProfile.role_id)
        .maybeSingle()
    : { data: null };

  if (currentRole?.code !== "ADMIN") {
    redirect("/settings?error=not_admin");
  }

  const { data: nextRole } = await supabase
    .from("roles")
    .select("code")
    .eq("id", roleId)
    .maybeSingle();

  if (targetUserId === user.id && (status !== "ACTIVE" || nextRole?.code !== "ADMIN")) {
    redirect("/settings?error=cannot_lock_self");
  }

  const { error } = await supabase
    .from("users_profile")
    .update({
      role_id: roleId,
      department_id: departmentId,
      status,
    })
    .eq("id", targetUserId);

  if (error) {
    redirect(`/settings?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/settings");
  redirect("/settings?updated=1");
}

function normalizeDocumentCode(value: string | null) {
  return value
    ?.trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function normalizeSourceCode(value: string | null) {
  return value
    ?.trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function normalizeMasterCode(value: string | null) {
  return value
    ?.trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function numberValue(formData: FormData, key: string) {
  const value = Number(formData.get(key));
  return Number.isFinite(value) ? value : 0;
}

export async function createChecklistItemAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const documentCode = normalizeDocumentCode(textValue(formData, "document_code"));
  const documentName = textValue(formData, "document_name");

  if (!documentCode || !documentName) {
    redirect("/settings?error=missing_checklist_data");
  }

  const { data: existingChecklist } = await supabase
    .from("enrollment_checklists")
    .select("id")
    .eq("document_code", documentCode)
    .maybeSingle();

  if (existingChecklist) {
    redirect("/settings?error=duplicate_checklist_code");
  }

  const { error } = await supabase.from("enrollment_checklists").insert({
    document_code: documentCode,
    document_name: documentName,
    is_required: formData.get("is_required") === "on",
    applies_to_program: textValue(formData, "applies_to_program"),
    sort_order: numberValue(formData, "sort_order"),
    status: String(formData.get("status") ?? "ACTIVE"),
  });

  if (error) {
    redirect(`/settings?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/settings");
  redirect("/settings?checklist_created=1");
}

export async function updateChecklistItemAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const checklistId = textValue(formData, "checklist_id");
  const documentName = textValue(formData, "document_name");
  const status = String(formData.get("status") ?? "ACTIVE");

  if (!checklistId || !documentName) {
    redirect("/settings?error=missing_checklist_data");
  }

  if (!["ACTIVE", "INACTIVE"].includes(status)) {
    redirect("/settings?error=invalid_status");
  }

  const { error } = await supabase
    .from("enrollment_checklists")
    .update({
      document_name: documentName,
      is_required: formData.get("is_required") === "on",
      applies_to_program: textValue(formData, "applies_to_program"),
      sort_order: numberValue(formData, "sort_order"),
      status,
    })
    .eq("id", checklistId);

  if (error) {
    redirect(`/settings?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/settings");
  redirect("/settings?checklist_updated=1");
}

export async function createLeadSourceAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const sourceCode = normalizeSourceCode(textValue(formData, "source_code"));
  const sourceName = textValue(formData, "source_name");
  const sourceGroup = textValue(formData, "source_group");

  if (!sourceCode || !sourceName || !sourceGroup) {
    redirect("/settings?error=missing_source_data");
  }

  const { data: existingSource } = await supabase
    .from("lead_sources")
    .select("id")
    .eq("source_code", sourceCode)
    .maybeSingle();

  if (existingSource) {
    redirect("/settings?error=duplicate_source_code");
  }

  const { error } = await supabase.from("lead_sources").insert({
    source_code: sourceCode,
    source_name: sourceName,
    source_group: sourceGroup,
    status: String(formData.get("status") ?? "ACTIVE"),
  });

  if (error) {
    redirect(`/settings?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/settings");
  revalidatePath("/leads/new");
  revalidatePath("/campaigns/new");
  revalidatePath("/import");
  redirect("/settings?source_created=1");
}

export async function updateLeadSourceAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const sourceId = textValue(formData, "source_id");
  const sourceName = textValue(formData, "source_name");
  const sourceGroup = textValue(formData, "source_group");
  const status = String(formData.get("status") ?? "ACTIVE");

  if (!sourceId || !sourceName || !sourceGroup) {
    redirect("/settings?error=missing_source_data");
  }

  if (!["ACTIVE", "INACTIVE"].includes(status)) {
    redirect("/settings?error=invalid_status");
  }

  const { error } = await supabase
    .from("lead_sources")
    .update({
      source_name: sourceName,
      source_group: sourceGroup,
      status,
    })
    .eq("id", sourceId);

  if (error) {
    redirect(`/settings?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/settings");
  revalidatePath("/leads/new");
  revalidatePath("/campaigns/new");
  revalidatePath("/import");
  redirect("/settings?source_updated=1");
}

export async function createAdmissionFlowAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const flowCode = normalizeMasterCode(textValue(formData, "flow_code"));
  const flowName = textValue(formData, "flow_name");
  const shortDescription = textValue(formData, "short_description");
  const ownerDepartment = textValue(formData, "owner_department");
  const mainRisk = textValue(formData, "main_risk");

  if (!flowCode || !flowName || !shortDescription || !ownerDepartment || !mainRisk) {
    redirect("/settings?error=missing_flow_data");
  }

  const { data: existingFlow } = await supabase
    .from("admission_flows")
    .select("id")
    .eq("flow_code", flowCode)
    .maybeSingle();

  if (existingFlow) {
    redirect("/settings?error=duplicate_flow_code");
  }

  const { error } = await supabase.from("admission_flows").insert({
    flow_code: flowCode,
    flow_name: flowName,
    short_description: shortDescription,
    owner_department: ownerDepartment,
    main_risk: mainRisk,
    sort_order: numberValue(formData, "sort_order"),
    status: String(formData.get("status") ?? "ACTIVE"),
  });

  if (error) {
    redirect(`/settings?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/settings");
  redirect("/settings?flow_created=1");
}

export async function updateAdmissionFlowAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const flowId = textValue(formData, "flow_id");
  const flowName = textValue(formData, "flow_name");
  const shortDescription = textValue(formData, "short_description");
  const ownerDepartment = textValue(formData, "owner_department");
  const mainRisk = textValue(formData, "main_risk");
  const status = String(formData.get("status") ?? "ACTIVE");

  if (!flowId || !flowName || !shortDescription || !ownerDepartment || !mainRisk) {
    redirect("/settings?error=missing_flow_data");
  }

  if (!["ACTIVE", "INACTIVE"].includes(status)) {
    redirect("/settings?error=invalid_status");
  }

  const { error } = await supabase
    .from("admission_flows")
    .update({
      flow_name: flowName,
      short_description: shortDescription,
      owner_department: ownerDepartment,
      main_risk: mainRisk,
      sort_order: numberValue(formData, "sort_order"),
      status,
    })
    .eq("id", flowId);

  if (error) {
    redirect(`/settings?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/settings");
  redirect("/settings?flow_updated=1");
}

export async function createAdmissionProgramAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const programCode = normalizeMasterCode(textValue(formData, "program_code"));
  const programName = textValue(formData, "program_name");

  if (!programCode || !programName) {
    redirect("/settings?error=missing_program_data");
  }

  const { data: existingProgram } = await supabase
    .from("admission_programs")
    .select("id")
    .eq("program_code", programCode)
    .maybeSingle();

  if (existingProgram) {
    redirect("/settings?error=duplicate_program_code");
  }

  const { error } = await supabase.from("admission_programs").insert({
    program_code: programCode,
    program_name: programName,
    sort_order: numberValue(formData, "sort_order"),
    status: String(formData.get("status") ?? "ACTIVE"),
  });

  if (error) {
    redirect(`/settings?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/settings");
  revalidatePath("/leads/new");
  redirect("/settings?program_created=1");
}

export async function updateAdmissionProgramAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const programId = textValue(formData, "program_id");
  const programName = textValue(formData, "program_name");
  const status = String(formData.get("status") ?? "ACTIVE");

  if (!programId || !programName) {
    redirect("/settings?error=missing_program_data");
  }

  if (!["ACTIVE", "INACTIVE"].includes(status)) {
    redirect("/settings?error=invalid_status");
  }

  const { error } = await supabase
    .from("admission_programs")
    .update({
      program_name: programName,
      sort_order: numberValue(formData, "sort_order"),
      status,
    })
    .eq("id", programId);

  if (error) {
    redirect(`/settings?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/settings");
  revalidatePath("/leads/new");
  redirect("/settings?program_updated=1");
}

export async function createAdmissionMajorAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const majorCode = normalizeMasterCode(textValue(formData, "major_code"));
  const majorName = textValue(formData, "major_name");
  const programId = textValue(formData, "program_id");

  if (!majorCode || !majorName) {
    redirect("/settings?error=missing_major_data");
  }

  const { data: existingMajor } = await supabase
    .from("admission_majors")
    .select("id")
    .eq("major_code", majorCode)
    .maybeSingle();

  if (existingMajor) {
    redirect("/settings?error=duplicate_major_code");
  }

  const { error } = await supabase.from("admission_majors").insert({
    major_code: majorCode,
    major_name: majorName,
    program_id: programId,
    sort_order: numberValue(formData, "sort_order"),
    status: String(formData.get("status") ?? "ACTIVE"),
  });

  if (error) {
    redirect(`/settings?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/settings");
  revalidatePath("/leads/new");
  redirect("/settings?major_created=1");
}

export async function updateAdmissionMajorAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const majorId = textValue(formData, "major_id");
  const majorName = textValue(formData, "major_name");
  const programId = textValue(formData, "program_id");
  const status = String(formData.get("status") ?? "ACTIVE");

  if (!majorId || !majorName) {
    redirect("/settings?error=missing_major_data");
  }

  if (!["ACTIVE", "INACTIVE"].includes(status)) {
    redirect("/settings?error=invalid_status");
  }

  const { error } = await supabase
    .from("admission_majors")
    .update({
      major_name: majorName,
      program_id: programId,
      sort_order: numberValue(formData, "sort_order"),
      status,
    })
    .eq("id", majorId);

  if (error) {
    redirect(`/settings?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/settings");
  revalidatePath("/leads/new");
  redirect("/settings?major_updated=1");
}

export async function createHouLocationAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const locationCode = normalizeMasterCode(textValue(formData, "location_code"));
  const locationName = textValue(formData, "location_name");
  const addressLine = textValue(formData, "address_line");

  if (!locationCode || !locationName || !addressLine) {
    redirect("/settings?error=missing_hou_location_data");
  }

  const { data: existingLocation } = await supabase
    .from("hou_locations")
    .select("id")
    .eq("location_code", locationCode)
    .maybeSingle();

  if (existingLocation) {
    redirect("/settings?error=duplicate_hou_location_code");
  }

  const { error } = await supabase.from("hou_locations").insert({
    location_code: locationCode,
    location_name: locationName,
    location_type: textValue(formData, "location_type") ?? "LEARNING_SITE",
    address_line: addressLine,
    ward: textValue(formData, "ward"),
    district_legacy: textValue(formData, "district_legacy"),
    province: textValue(formData, "province"),
    approval_decision_no: textValue(formData, "approval_decision_no"),
    approval_decision_date: textValue(formData, "approval_decision_date"),
    valid_from: textValue(formData, "valid_from"),
    source_document: textValue(formData, "source_document"),
    approval_file_url: textValue(formData, "approval_file_url"),
    evidence_image_url: textValue(formData, "evidence_image_url"),
    evidence_note: textValue(formData, "evidence_note"),
    notes: textValue(formData, "notes"),
    status: String(formData.get("status") ?? "ACTIVE"),
  });

  if (error) {
    redirect(`/settings?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/settings");
  revalidatePath("/leads/new");
  redirect("/settings?hou_location_created=1");
}

export async function updateHouLocationAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const locationId = textValue(formData, "location_id");
  const locationName = textValue(formData, "location_name");
  const addressLine = textValue(formData, "address_line");
  const status = String(formData.get("status") ?? "ACTIVE");

  if (!locationId || !locationName || !addressLine) {
    redirect("/settings?error=missing_hou_location_data");
  }

  if (!["ACTIVE", "INACTIVE"].includes(status)) {
    redirect("/settings?error=invalid_status");
  }

  const { error } = await supabase
    .from("hou_locations")
    .update({
      location_name: locationName,
      location_type: textValue(formData, "location_type") ?? "LEARNING_SITE",
      address_line: addressLine,
      ward: textValue(formData, "ward"),
      district_legacy: textValue(formData, "district_legacy"),
      province: textValue(formData, "province"),
      approval_decision_no: textValue(formData, "approval_decision_no"),
      approval_decision_date: textValue(formData, "approval_decision_date"),
      valid_from: textValue(formData, "valid_from"),
      source_document: textValue(formData, "source_document"),
      approval_file_url: textValue(formData, "approval_file_url"),
      evidence_image_url: textValue(formData, "evidence_image_url"),
      evidence_note: textValue(formData, "evidence_note"),
      notes: textValue(formData, "notes"),
      status,
    })
    .eq("id", locationId);

  if (error) {
    redirect(`/settings?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/settings");
  revalidatePath("/leads/new");
  redirect("/settings?hou_location_updated=1");
}
