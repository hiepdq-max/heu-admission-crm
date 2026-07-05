"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

const allowedConfirmationStatuses = new Set([
  "DUNG",
  "CAN_SUA",
  "KHONG_THUOC_TOI",
  "DA_KHOA",
]);

const allowedRouteDepartments = new Set([
  "KHTC",
  "TUYEN_SINH",
  "CTHSSV",
  "DAO_TAO",
  "KHOA",
  "SHORT_COURSE",
]);

const DCTC_ROUTE_UNAVAILABLE = "DCTC_ROUTE_UNAVAILABLE";
const DCTC_CONFIRM_UNAVAILABLE = "DCTC_CONFIRM_UNAVAILABLE";
const DCTC_ROUTE_ASSIGNEE_OR_OWNER_REQUIRED =
  "assignee_or_owner_required_for_confirmation_task";
const DCTC_SOURCE_PROVENANCE_LOCK_READY =
  "source_metadata_required_before_cho_xac_nhan";
const DCTC_LOCK_NOTE_REQUIRED = "confirmation_note_required_for_locked_status";
const DCTC_REPAIR_OR_OUT_OF_SCOPE_NOTE_REQUIRED =
  "confirmation_note_required_for_repair_or_out_of_scope";
const DCTC_LOCK_EVIDENCE_REQUIRED =
  "controlled_evidence_ref_required_for_locked_status";

function textValue(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function uuidValue(formData: FormData, key: string) {
  const value = textValue(formData, key);

  return value || null;
}

function redirectWithError(message: string) {
  redirect(`/data-confirmation?error=${encodeURIComponent(message)}`);
}

export async function routeDataConfirmationTaskAction(formData: FormData) {
  const taskCode = textValue(formData, "task_code");
  const departmentCode = textValue(formData, "department_code").toUpperCase();
  const sourceRecordLabel = textValue(formData, "source_record_label");
  const dataDomain = textValue(formData, "data_domain");
  const sourceRoute = textValue(formData, "source_route");
  const dqCheckRef = textValue(formData, "dq_check_ref");
  const controlledEvidenceRef = textValue(formData, "controlled_evidence_ref");
  const dueDateOrBatch = textValue(formData, "due_date_or_batch");
  const ownerDecisionRef = textValue(formData, "owner_decision_ref");
  const statusNote = textValue(formData, "status_note");
  const ownerUserId = uuidValue(formData, "owner_user_id");
  const assignedUserId = uuidValue(formData, "assigned_user_id");

  if (
    !taskCode ||
    !allowedRouteDepartments.has(departmentCode) ||
    !sourceRecordLabel ||
    !dataDomain ||
    !sourceRoute ||
    !dqCheckRef ||
    !controlledEvidenceRef ||
    !dueDateOrBatch ||
    !ownerDecisionRef
  ) {
    redirectWithError(DCTC_SOURCE_PROVENANCE_LOCK_READY);
  }

  if (!ownerUserId && !assignedUserId) {
    redirectWithError(DCTC_ROUTE_ASSIGNEE_OR_OWNER_REQUIRED);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { error } = await supabase.rpc("route_data_confirmation_task", {
    p_admission_segment_id: uuidValue(formData, "admission_segment_id"),
    p_assigned_user_id: assignedUserId,
    p_controlled_evidence_ref: controlledEvidenceRef,
    p_data_domain: dataDomain,
    p_department_code: departmentCode,
    p_dq_check_ref: dqCheckRef,
    p_due_date_or_batch: dueDateOrBatch,
    p_owner_decision_ref: ownerDecisionRef,
    p_owner_user_id: ownerUserId,
    p_source_record_label: sourceRecordLabel,
    p_source_route: sourceRoute,
    p_status_note: statusNote || null,
    p_task_code: taskCode,
  });

  if (error) {
    redirectWithError(DCTC_ROUTE_UNAVAILABLE);
  }

  revalidatePath("/data-confirmation");
  redirect("/data-confirmation?routed=1");
}

export async function confirmDataConfirmationTaskAction(formData: FormData) {
  const taskId = textValue(formData, "task_id");
  const nextStatus = textValue(formData, "next_status").toUpperCase();
  const note = textValue(formData, "note");
  const controlledEvidenceRef = textValue(formData, "controlled_evidence_ref");

  if (!taskId || !allowedConfirmationStatuses.has(nextStatus)) {
    redirectWithError("missing_or_invalid_confirmation_task_status");
  }

  if (
    (nextStatus === "CAN_SUA" ||
      nextStatus === "KHONG_THUOC_TOI" ||
      nextStatus === "DA_KHOA") &&
    !note
  ) {
    redirectWithError(
      nextStatus === "DA_KHOA"
        ? DCTC_LOCK_NOTE_REQUIRED
        : DCTC_REPAIR_OR_OUT_OF_SCOPE_NOTE_REQUIRED,
    );
  }

  if (nextStatus === "DA_KHOA" && !controlledEvidenceRef) {
    redirectWithError(DCTC_LOCK_EVIDENCE_REQUIRED);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { error } = await supabase.rpc("confirm_data_confirmation_task", {
    p_controlled_evidence_ref: controlledEvidenceRef || null,
    p_next_status: nextStatus,
    p_note: note || null,
    p_task_id: taskId,
  });

  if (error) {
    redirectWithError(DCTC_CONFIRM_UNAVAILABLE);
  }

  revalidatePath("/data-confirmation");
  redirect("/data-confirmation?updated=1");
}
