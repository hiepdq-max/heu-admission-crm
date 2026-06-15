"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

function textValue(formData: FormData, key: string) {
  const value = String(formData.get(key) ?? "").trim();
  return value.length > 0 ? value : null;
}

function normalizeCode(value: string | null) {
  return value
    ?.trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function boolValue(formData: FormData, key: string) {
  return formData.get(key) === "on";
}

async function requireMasterControlPermission(
  permission: "manage" | "approve" = "manage",
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const permissionName =
    permission === "approve"
      ? "master_control.approve"
      : "master_control.manage";
  const [{ data: roleCode }, { data: hasPermission }] = await Promise.all([
    supabase.rpc("current_user_role_code"),
    supabase.rpc("has_permission", { permission_name: permissionName }),
  ]);

  if (roleCode !== "ADMIN" && !hasPermission) {
    redirect("/master-control?error=not_allowed");
  }

  return { supabase, user };
}

export async function createLegalRegistryAction(formData: FormData) {
  const { supabase, user } = await requireMasterControlPermission("manage");
  const legalCode = normalizeCode(textValue(formData, "legal_code"));
  const title = textValue(formData, "title");

  if (!legalCode || !title) {
    redirect("/master-control?error=missing_legal_data");
  }

  const { error } = await supabase.from("legal_registry").insert({
    legal_code: legalCode,
    title,
    source_type: textValue(formData, "source_type") ?? "OTHER",
    issuing_authority: textValue(formData, "issuing_authority"),
    document_no: textValue(formData, "document_no"),
    issued_on: textValue(formData, "issued_on"),
    effective_from: textValue(formData, "effective_from"),
    effective_to: textValue(formData, "effective_to"),
    source_url: textValue(formData, "source_url"),
    file_url: textValue(formData, "file_url"),
    scope_note: textValue(formData, "scope_note"),
    owner_department: textValue(formData, "owner_department"),
    checker: textValue(formData, "checker"),
    approver: textValue(formData, "approver"),
    control_status: textValue(formData, "control_status") ?? "DAT_TAM_THOI",
    created_by: user.id,
    updated_by: user.id,
  });

  if (error) {
    redirect(`/master-control?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/master-control");
  redirect("/master-control?legal_created=1");
}

export async function updateLegalRegistryAction(formData: FormData) {
  const { supabase, user } = await requireMasterControlPermission("manage");
  const legalId = textValue(formData, "legal_id");
  const title = textValue(formData, "title");

  if (!legalId || !title) {
    redirect("/master-control?error=missing_legal_data");
  }

  const { error } = await supabase
    .from("legal_registry")
    .update({
      title,
      source_type: textValue(formData, "source_type") ?? "OTHER",
      issuing_authority: textValue(formData, "issuing_authority"),
      document_no: textValue(formData, "document_no"),
      issued_on: textValue(formData, "issued_on"),
      effective_from: textValue(formData, "effective_from"),
      effective_to: textValue(formData, "effective_to"),
      source_url: textValue(formData, "source_url"),
      file_url: textValue(formData, "file_url"),
      scope_note: textValue(formData, "scope_note"),
      owner_department: textValue(formData, "owner_department"),
      checker: textValue(formData, "checker"),
      approver: textValue(formData, "approver"),
      control_status: textValue(formData, "control_status") ?? "DAT_TAM_THOI",
      updated_by: user.id,
    })
    .eq("id", legalId);

  if (error) {
    redirect(`/master-control?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/master-control");
  redirect("/master-control?legal_updated=1");
}

export async function createSopRegistryAction(formData: FormData) {
  const { supabase, user } = await requireMasterControlPermission("manage");
  const sopCode = normalizeCode(textValue(formData, "sop_code"));
  const sopName = textValue(formData, "sop_name");
  const moduleCode = normalizeCode(textValue(formData, "module_code"));

  if (!sopCode || !sopName || !moduleCode) {
    redirect("/master-control?error=missing_sop_data");
  }

  const { error } = await supabase.from("sop_registry").insert({
    sop_code: sopCode,
    sop_name: sopName,
    module_code: moduleCode,
    objective: textValue(formData, "objective"),
    owner_department: textValue(formData, "owner_department"),
    checker_role: textValue(formData, "checker_role"),
    approver_role: textValue(formData, "approver_role"),
    legal_registry_id: textValue(formData, "legal_registry_id"),
    input_note: textValue(formData, "input_note"),
    output_note: textValue(formData, "output_note"),
    risk_note: textValue(formData, "risk_note"),
    control_note: textValue(formData, "control_note"),
    file_url: textValue(formData, "file_url"),
    effective_from: textValue(formData, "effective_from"),
    control_status: textValue(formData, "control_status") ?? "DAT_TAM_THOI",
    created_by: user.id,
    updated_by: user.id,
  });

  if (error) {
    redirect(`/master-control?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/master-control");
  redirect("/master-control?sop_created=1");
}

export async function updateSopRegistryAction(formData: FormData) {
  const { supabase, user } = await requireMasterControlPermission("manage");
  const sopId = textValue(formData, "sop_id");
  const sopName = textValue(formData, "sop_name");
  const moduleCode = normalizeCode(textValue(formData, "module_code"));

  if (!sopId || !sopName || !moduleCode) {
    redirect("/master-control?error=missing_sop_data");
  }

  const { error } = await supabase
    .from("sop_registry")
    .update({
      sop_name: sopName,
      module_code: moduleCode,
      objective: textValue(formData, "objective"),
      owner_department: textValue(formData, "owner_department"),
      checker_role: textValue(formData, "checker_role"),
      approver_role: textValue(formData, "approver_role"),
      legal_registry_id: textValue(formData, "legal_registry_id"),
      input_note: textValue(formData, "input_note"),
      output_note: textValue(formData, "output_note"),
      risk_note: textValue(formData, "risk_note"),
      control_note: textValue(formData, "control_note"),
      file_url: textValue(formData, "file_url"),
      effective_from: textValue(formData, "effective_from"),
      control_status: textValue(formData, "control_status") ?? "DAT_TAM_THOI",
      updated_by: user.id,
    })
    .eq("id", sopId);

  if (error) {
    redirect(`/master-control?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/master-control");
  redirect("/master-control?sop_updated=1");
}

export async function createDataDictionaryTableAction(formData: FormData) {
  const { supabase, user } = await requireMasterControlPermission("manage");
  const tableCode = normalizeCode(textValue(formData, "table_code"));
  const tableName = textValue(formData, "table_name");
  const moduleCode = normalizeCode(textValue(formData, "module_code"));

  if (!tableCode || !tableName || !moduleCode) {
    redirect("/master-control?error=missing_data_table");
  }

  const { error } = await supabase.from("data_dictionary_tables").insert({
    table_code: tableCode,
    table_name: tableName,
    module_code: moduleCode,
    table_type: textValue(formData, "table_type") ?? "MASTER",
    data_owner_department: textValue(formData, "data_owner_department"),
    purpose: textValue(formData, "purpose"),
    sensitivity_level: textValue(formData, "sensitivity_level") ?? "INTERNAL",
    ai_allowed: boolValue(formData, "ai_allowed"),
    control_status: textValue(formData, "control_status") ?? "DAT_TAM_THOI",
    created_by: user.id,
    updated_by: user.id,
  });

  if (error) {
    redirect(`/master-control?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/master-control");
  redirect("/master-control?data_table_created=1");
}

export async function createDataDictionaryFieldAction(formData: FormData) {
  const { supabase, user } = await requireMasterControlPermission("manage");
  const tableId = textValue(formData, "table_id");
  const fieldCode = normalizeCode(textValue(formData, "field_code"));
  const fieldName = textValue(formData, "field_name");

  if (!tableId || !fieldCode || !fieldName) {
    redirect("/master-control?error=missing_data_field");
  }

  const { error } = await supabase.from("data_dictionary_fields").insert({
    table_id: tableId,
    field_code: fieldCode,
    field_name: fieldName,
    data_type: textValue(formData, "data_type") ?? "text",
    is_required: boolValue(formData, "is_required"),
    is_unique: boolValue(formData, "is_unique"),
    is_sensitive: boolValue(formData, "is_sensitive"),
    ai_allowed: boolValue(formData, "ai_allowed"),
    validation_rule: textValue(formData, "validation_rule"),
    note: textValue(formData, "note"),
    control_status: textValue(formData, "control_status") ?? "DAT_TAM_THOI",
    created_by: user.id,
    updated_by: user.id,
  });

  if (error) {
    redirect(`/master-control?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/master-control");
  redirect("/master-control?data_field_created=1");
}

export async function createDecisionGateAction(formData: FormData) {
  const { supabase, user } = await requireMasterControlPermission("manage");
  const gateCode = normalizeCode(textValue(formData, "gate_code"));
  const gateName = textValue(formData, "gate_name");
  const entityType = normalizeCode(textValue(formData, "entity_type"));
  const entityCode = normalizeCode(textValue(formData, "entity_code"));

  if (!gateCode || !gateName || !entityType || !entityCode) {
    redirect("/master-control?error=missing_decision_gate");
  }

  const { error } = await supabase.from("decision_gates").insert({
    gate_code: gateCode,
    gate_name: gateName,
    gate_type: textValue(formData, "gate_type") ?? "OTHER",
    entity_type: entityType,
    entity_code: entityCode,
    owner_department: textValue(formData, "owner_department"),
    requested_by: user.id,
    checker_note: textValue(formData, "checker_note"),
    approver_note: textValue(formData, "approver_note"),
    evidence_url: textValue(formData, "evidence_url"),
    decision_status: textValue(formData, "decision_status") ?? "DRAFT",
    due_at: textValue(formData, "due_at"),
    created_by: user.id,
    updated_by: user.id,
  });

  if (error) {
    redirect(`/master-control?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/master-control");
  redirect("/master-control?decision_created=1");
}

export async function updateDecisionGateAction(formData: FormData) {
  const { supabase, user } = await requireMasterControlPermission("approve");
  const gateId = textValue(formData, "gate_id");
  const decisionStatus = textValue(formData, "decision_status") ?? "PENDING";

  if (!gateId) {
    redirect("/master-control?error=missing_decision_gate");
  }

  const { error } = await supabase
    .from("decision_gates")
    .update({
      decision_status: decisionStatus,
      checker_note: textValue(formData, "checker_note"),
      approver_note: textValue(formData, "approver_note"),
      evidence_url: textValue(formData, "evidence_url"),
      decided_by: ["APPROVED", "REJECTED"].includes(decisionStatus)
        ? user.id
        : null,
      decided_at: ["APPROVED", "REJECTED"].includes(decisionStatus)
        ? new Date().toISOString()
        : null,
      updated_by: user.id,
    })
    .eq("id", gateId);

  if (error) {
    redirect(`/master-control?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/master-control");
  redirect("/master-control?decision_updated=1");
}
