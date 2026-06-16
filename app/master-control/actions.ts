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

function jsonValue(formData: FormData, key: string) {
  const value = textValue(formData, key);

  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as unknown;
  } catch {
    redirect("/master-control?error=invalid_master_data_json");
  }
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

async function requireWorkflowRequestPermission(
  permission: "create" | "check" | "approve",
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const rpcName =
    permission === "approve"
      ? "can_approve_workflow_request"
      : permission === "check"
        ? "can_check_workflow_request"
        : "can_create_workflow_request";
  const [{ data: roleCode }, { data: hasPermission }] = await Promise.all([
    supabase.rpc("current_user_role_code"),
    supabase.rpc(rpcName),
  ]);

  if (roleCode !== "ADMIN" && !hasPermission) {
    redirect("/master-control?error=not_allowed_workflow_request");
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

export async function createWorkflowRequestAction(formData: FormData) {
  const { supabase, user } = await requireWorkflowRequestPermission("create");
  const approvalCode = normalizeCode(textValue(formData, "approval_code"));
  const requestTitle = textValue(formData, "request_title");
  const entityType = normalizeCode(textValue(formData, "entity_type"));
  const entityCode = normalizeCode(textValue(formData, "entity_code"));
  const requestStatus = textValue(formData, "request_status") ?? "PENDING_CHECK";

  if (!approvalCode || !requestTitle || !entityType) {
    redirect("/master-control?error=missing_workflow_request");
  }

  if (!["DRAFT", "PENDING_CHECK"].includes(requestStatus)) {
    redirect("/master-control?error=invalid_workflow_request_status");
  }

  const { data: requestCode, error: requestCodeError } = await supabase.rpc(
    "next_workflow_request_code",
    { p_approval_code: approvalCode },
  );

  if (requestCodeError || !requestCode) {
    redirect(
      `/master-control?error=${encodeURIComponent(
        requestCodeError?.message ?? "Không tạo được mã request.",
      )}`,
    );
  }

  const { error } = await supabase.from("approval_requests").insert({
    approval_code: approvalCode,
    request_code: requestCode,
    request_title: requestTitle,
    entity_type: entityType,
    entity_id: uuidValue(textValue(formData, "entity_id")),
    entity_code: entityCode,
    request_note: textValue(formData, "request_note"),
    evidence_url: textValue(formData, "evidence_url"),
    maker_note: textValue(formData, "maker_note"),
    request_status: requestStatus,
    requested_by: user.id,
    due_at: textValue(formData, "due_at"),
    created_by: user.id,
    updated_by: user.id,
  });

  if (error) {
    redirect(`/master-control?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/master-control");
  redirect("/master-control?workflow_request_created=1");
}

export async function updateWorkflowRequestAction(formData: FormData) {
  const requestId = textValue(formData, "request_id");
  const requestStatus = textValue(formData, "request_status");

  if (!requestId || !requestStatus) {
    redirect("/master-control?error=missing_workflow_request");
  }

  if (
    !["PENDING_CHECK", "CHECKED", "APPROVED", "REJECTED", "NEEDS_FIX", "CANCELLED"].includes(
      requestStatus,
    )
  ) {
    redirect("/master-control?error=invalid_workflow_request_status");
  }

  const requiredPermission =
    requestStatus === "APPROVED" || requestStatus === "REJECTED"
      ? "approve"
      : "check";
  const { supabase, user } = await requireWorkflowRequestPermission(
    requiredPermission,
  );
  const now = new Date().toISOString();

  const updatePayload: Record<string, string | null> = {
    request_status: requestStatus,
    checker_note: textValue(formData, "checker_note"),
    approver_note: textValue(formData, "approver_note"),
    evidence_url: textValue(formData, "evidence_url"),
    updated_by: user.id,
  };

  if (requestStatus === "CHECKED") {
    updatePayload.checked_by = user.id;
    updatePayload.checked_at = now;
  }

  if (requestStatus === "APPROVED") {
    updatePayload.approved_by = user.id;
    updatePayload.approved_at = now;
    updatePayload.rejected_by = null;
    updatePayload.rejected_at = null;
  }

  if (requestStatus === "REJECTED") {
    updatePayload.rejected_by = user.id;
    updatePayload.rejected_at = now;
    updatePayload.approved_by = null;
    updatePayload.approved_at = null;
  }

  if (requestStatus === "NEEDS_FIX") {
    updatePayload.checked_by = user.id;
    updatePayload.checked_at = now;
  }

  const { error } = await supabase
    .from("approval_requests")
    .update(updatePayload)
    .eq("id", requestId);

  if (error) {
    redirect(`/master-control?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/master-control");
  redirect("/master-control?workflow_request_updated=1");
}

async function requireEvidencePermission(permission: "create" | "check") {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const rpcName =
    permission === "check"
      ? "can_check_evidence_document"
      : "can_create_evidence_document";
  const [{ data: roleCode }, { data: hasPermission }] = await Promise.all([
    supabase.rpc("current_user_role_code"),
    supabase.rpc(rpcName),
  ]);

  if (roleCode !== "ADMIN" && !hasPermission) {
    redirect("/master-control?error=not_allowed_evidence");
  }

  return { supabase, user };
}

export async function createEvidenceDocumentAction(formData: FormData) {
  const { supabase, user } = await requireEvidencePermission("create");
  const evidenceTitle = textValue(formData, "evidence_title");
  const entityType = normalizeCode(textValue(formData, "entity_type")) ?? "GENERAL";
  const fileUrl = textValue(formData, "file_url");

  if (!evidenceTitle || !entityType || !fileUrl) {
    redirect("/master-control?error=missing_evidence_document");
  }

  if (!/^https?:\/\//i.test(fileUrl)) {
    redirect("/master-control?error=invalid_evidence_url");
  }

  const { data: evidenceCode, error: evidenceCodeError } = await supabase.rpc(
    "next_evidence_code",
    { p_entity_type: entityType },
  );

  if (evidenceCodeError || !evidenceCode) {
    redirect(
      `/master-control?error=${encodeURIComponent(
        evidenceCodeError?.message ?? "Không tạo được mã minh chứng.",
      )}`,
    );
  }

  const { error } = await supabase.from("evidence_documents").insert({
    evidence_code: evidenceCode,
    evidence_title: evidenceTitle,
    evidence_type: textValue(formData, "evidence_type") ?? "OTHER",
    entity_type: entityType,
    entity_id: uuidValue(textValue(formData, "entity_id")),
    entity_code: normalizeCode(textValue(formData, "entity_code")) ?? null,
    lead_id: uuidValue(textValue(formData, "lead_id")),
    approval_request_id: uuidValue(textValue(formData, "approval_request_id")),
    file_url: fileUrl,
    file_name: textValue(formData, "file_name"),
    file_mime_hint: textValue(formData, "file_mime_hint"),
    file_date: textValue(formData, "file_date"),
    storage_provider: textValue(formData, "storage_provider") ?? "GOOGLE_DRIVE",
    confidentiality: textValue(formData, "confidentiality") ?? "INTERNAL",
    document_status: textValue(formData, "document_status") ?? "SUBMITTED",
    note: textValue(formData, "note"),
    created_by: user.id,
    updated_by: user.id,
  });

  if (error) {
    redirect(`/master-control?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/master-control");
  redirect("/master-control?evidence_created=1");
}

export async function updateEvidenceDocumentAction(formData: FormData) {
  const { supabase, user } = await requireEvidencePermission("check");
  const evidenceId = textValue(formData, "evidence_id");
  const documentStatus = textValue(formData, "document_status");

  if (!evidenceId || !documentStatus) {
    redirect("/master-control?error=missing_evidence_document");
  }

  if (
    !["DRAFT", "SUBMITTED", "CHECKED", "NEEDS_FIX", "REJECTED", "ARCHIVED"].includes(
      documentStatus,
    )
  ) {
    redirect("/master-control?error=invalid_evidence_status");
  }

  const checked = ["CHECKED", "NEEDS_FIX", "REJECTED"].includes(documentStatus);
  const { error } = await supabase
    .from("evidence_documents")
    .update({
      document_status: documentStatus,
      verification_note: textValue(formData, "verification_note"),
      note: textValue(formData, "note"),
      checked_by: checked ? user.id : null,
      checked_at: checked ? new Date().toISOString() : null,
      updated_by: user.id,
    })
    .eq("id", evidenceId);

  if (error) {
    redirect(`/master-control?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/master-control");
  redirect("/master-control?evidence_updated=1");
}

async function requireMasterDataPermission(
  permission: "request" | "check" | "approve" | "manage",
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const rpcName =
    permission === "manage"
      ? "can_manage_master_data_governance"
      : permission === "approve"
        ? "can_approve_master_data_change"
        : permission === "check"
          ? "can_check_master_data_change"
          : "can_request_master_data_change";
  const [{ data: roleCode }, { data: hasPermission }] = await Promise.all([
    supabase.rpc("current_user_role_code"),
    supabase.rpc(rpcName),
  ]);

  if (roleCode !== "ADMIN" && !hasPermission) {
    redirect("/master-control?error=not_allowed_master_data");
  }

  return { supabase, user };
}

export async function createMasterDataGovernanceAction(formData: FormData) {
  const { supabase, user } = await requireMasterDataPermission("manage");
  const masterCode = normalizeCode(textValue(formData, "master_code"));
  const masterName = textValue(formData, "master_name");
  const moduleCode = normalizeCode(textValue(formData, "module_code"));
  const sourceTable = textValue(formData, "source_table");
  const ownerDepartment = textValue(formData, "owner_department");

  if (!masterCode || !masterName || !moduleCode || !sourceTable || !ownerDepartment) {
    redirect("/master-control?error=missing_master_data_governance");
  }

  const { error } = await supabase.from("master_data_governance").insert({
    master_code: masterCode,
    master_name: masterName,
    module_code: moduleCode,
    source_table: sourceTable,
    data_domain: textValue(formData, "data_domain") ?? "OPERATION",
    owner_department: ownerDepartment,
    steward_role: textValue(formData, "steward_role"),
    approval_required: boolValue(formData, "approval_required"),
    checker_role: textValue(formData, "checker_role"),
    approver_role: textValue(formData, "approver_role"),
    sensitivity_level: textValue(formData, "sensitivity_level") ?? "INTERNAL",
    change_frequency: textValue(formData, "change_frequency") ?? "ON_DEMAND",
    ai_allowed: boolValue(formData, "ai_allowed"),
    duplicate_rule: textValue(formData, "duplicate_rule"),
    effective_date_required: boolValue(formData, "effective_date_required"),
    audit_required: boolValue(formData, "audit_required"),
    evidence_required: boolValue(formData, "evidence_required"),
    scope_rule: textValue(formData, "scope_rule"),
    control_note: textValue(formData, "control_note"),
    control_status: textValue(formData, "control_status") ?? "DAT_TAM_THOI",
    created_by: user.id,
    updated_by: user.id,
  });

  if (error) {
    redirect(`/master-control?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/master-control");
  redirect("/master-control?master_data_created=1");
}

export async function updateMasterDataGovernanceAction(formData: FormData) {
  const { supabase, user } = await requireMasterDataPermission("manage");
  const governanceId = textValue(formData, "governance_id");
  const masterName = textValue(formData, "master_name");
  const moduleCode = normalizeCode(textValue(formData, "module_code"));
  const sourceTable = textValue(formData, "source_table");
  const ownerDepartment = textValue(formData, "owner_department");

  if (!governanceId || !masterName || !moduleCode || !sourceTable || !ownerDepartment) {
    redirect("/master-control?error=missing_master_data_governance");
  }

  const { error } = await supabase
    .from("master_data_governance")
    .update({
      master_name: masterName,
      module_code: moduleCode,
      source_table: sourceTable,
      data_domain: textValue(formData, "data_domain") ?? "OPERATION",
      owner_department: ownerDepartment,
      steward_role: textValue(formData, "steward_role"),
      approval_required: boolValue(formData, "approval_required"),
      checker_role: textValue(formData, "checker_role"),
      approver_role: textValue(formData, "approver_role"),
      sensitivity_level: textValue(formData, "sensitivity_level") ?? "INTERNAL",
      change_frequency: textValue(formData, "change_frequency") ?? "ON_DEMAND",
      ai_allowed: boolValue(formData, "ai_allowed"),
      duplicate_rule: textValue(formData, "duplicate_rule"),
      effective_date_required: boolValue(formData, "effective_date_required"),
      audit_required: boolValue(formData, "audit_required"),
      evidence_required: boolValue(formData, "evidence_required"),
      scope_rule: textValue(formData, "scope_rule"),
      control_note: textValue(formData, "control_note"),
      control_status: textValue(formData, "control_status") ?? "DAT_TAM_THOI",
      updated_by: user.id,
    })
    .eq("id", governanceId);

  if (error) {
    redirect(`/master-control?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/master-control");
  redirect("/master-control?master_data_updated=1");
}

export async function createMasterDataChangeRequestAction(formData: FormData) {
  const { supabase, user } = await requireMasterDataPermission("request");
  const governanceId = textValue(formData, "governance_id");
  const masterCode = normalizeCode(textValue(formData, "master_code"));
  const changeTitle = textValue(formData, "change_title");

  if (!governanceId || !masterCode || !changeTitle) {
    redirect("/master-control?error=missing_master_data_request");
  }

  const { data: requestCode, error: requestCodeError } = await supabase.rpc(
    "next_master_data_request_code",
    { p_master_code: masterCode },
  );

  if (requestCodeError || !requestCode) {
    redirect(
      `/master-control?error=${encodeURIComponent(
        requestCodeError?.message ?? "Không tạo được mã yêu cầu dữ liệu gốc.",
      )}`,
    );
  }

  const { error } = await supabase.from("master_data_change_requests").insert({
    request_code: requestCode,
    governance_id: governanceId,
    change_type: textValue(formData, "change_type") ?? "UPDATE",
    target_record_id: uuidValue(textValue(formData, "target_record_id")),
    target_record_code: normalizeCode(textValue(formData, "target_record_code")),
    change_title: changeTitle,
    current_value: jsonValue(formData, "current_value"),
    proposed_value: jsonValue(formData, "proposed_value"),
    request_reason: textValue(formData, "request_reason"),
    evidence_url: textValue(formData, "evidence_url"),
    request_status: textValue(formData, "request_status") ?? "PENDING_CHECK",
    requested_by: user.id,
    created_by: user.id,
    updated_by: user.id,
  });

  if (error) {
    redirect(`/master-control?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/master-control");
  redirect("/master-control?master_data_request_created=1");
}

export async function updateMasterDataChangeRequestAction(formData: FormData) {
  const requestId = textValue(formData, "request_id");
  const requestStatus = textValue(formData, "request_status");

  if (!requestId || !requestStatus) {
    redirect("/master-control?error=missing_master_data_request");
  }

  if (
    ![
      "PENDING_CHECK",
      "CHECKED",
      "APPROVED",
      "REJECTED",
      "NEEDS_FIX",
      "APPLIED",
      "CANCELLED",
    ].includes(requestStatus)
  ) {
    redirect("/master-control?error=invalid_master_data_request_status");
  }

  const permission =
    requestStatus === "APPROVED" || requestStatus === "REJECTED"
      ? "approve"
      : requestStatus === "APPLIED"
        ? "manage"
        : "check";
  const { supabase, user } = await requireMasterDataPermission(permission);
  const now = new Date().toISOString();

  const updatePayload: Record<string, string | null> = {
    request_status: requestStatus,
    rejection_reason: textValue(formData, "rejection_reason"),
    evidence_url: textValue(formData, "evidence_url"),
    updated_by: user.id,
  };

  if (["CHECKED", "NEEDS_FIX"].includes(requestStatus)) {
    updatePayload.checked_by = user.id;
    updatePayload.checked_at = now;
  }

  if (requestStatus === "APPROVED") {
    updatePayload.approved_by = user.id;
    updatePayload.approved_at = now;
  }

  if (requestStatus === "REJECTED") {
    updatePayload.approved_by = null;
    updatePayload.approved_at = null;
  }

  if (requestStatus === "APPLIED") {
    updatePayload.applied_by = user.id;
    updatePayload.applied_at = now;
  }

  const { error } = await supabase
    .from("master_data_change_requests")
    .update(updatePayload)
    .eq("id", requestId);

  if (error) {
    redirect(`/master-control?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/master-control");
  redirect("/master-control?master_data_request_updated=1");
}
