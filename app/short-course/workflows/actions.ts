"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { withAdmissionSegmentParam } from "@/lib/workspace";

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

function safePath(value: string | null, fallback = "/short-course/workflows") {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return fallback;
  }

  return value;
}

function redirectBack(formData: FormData, status: string) {
  const segmentId = uuidValue(textValue(formData, "admission_segment_id"));
  const returnTo = safePath(textValue(formData, "return_to"));
  const path = withAdmissionSegmentParam(returnTo, segmentId);
  const joiner = path.includes("?") ? "&" : "?";

  redirect(`${path}${joiner}${status}=1`);
}

function redirectError(formData: FormData, message: string) {
  const segmentId = uuidValue(textValue(formData, "admission_segment_id"));
  const returnTo = safePath(textValue(formData, "return_to"));
  const path = withAdmissionSegmentParam(returnTo, segmentId);
  const joiner = path.includes("?") ? "&" : "?";

  redirect(`${path}${joiner}error=${encodeURIComponent(message)}`);
}

async function requireWorkflowPermission(
  formData: FormData,
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
    redirectError(formData, "not_allowed_workflow_request");
  }

  return { supabase, user };
}

async function assertWorkspaceAllowed(
  formData: FormData,
  supabase: Awaited<ReturnType<typeof createClient>>,
  segmentId: string | null,
) {
  if (!segmentId) {
    return;
  }

  const { data: allowed, error } = await supabase.rpc(
    "can_use_admission_workspace",
    { target_segment_id: segmentId },
  );

  if (error || !allowed) {
    redirectError(formData, error?.message ?? "workspace_not_allowed");
  }
}

export async function createShortCourseWorkflowRequestAction(
  formData: FormData,
) {
  const { supabase, user } = await requireWorkflowPermission(
    formData,
    "create",
  );
  const segmentId = uuidValue(textValue(formData, "admission_segment_id"));
  await assertWorkspaceAllowed(formData, supabase, segmentId);

  const approvalCode =
    normalizeCode(textValue(formData, "approval_code")) ??
    "APPROVE_P1_15_SHORT_WORK_REQUEST";
  const requestTitle = textValue(formData, "request_title");
  const entityType = normalizeCode(textValue(formData, "entity_type"));
  const entityCode = normalizeCode(textValue(formData, "entity_code"));
  const requestStatus = textValue(formData, "request_status") ?? "PENDING_CHECK";

  if (!approvalCode || !requestTitle || !entityType) {
    redirectError(formData, "missing_workflow_request");
  }

  if (!["DRAFT", "PENDING_CHECK"].includes(requestStatus)) {
    redirectError(formData, "invalid_workflow_request_status");
  }

  const { data: requestCode, error: requestCodeError } = await supabase.rpc(
    "next_workflow_request_code",
    { p_approval_code: approvalCode },
  );

  if (requestCodeError || !requestCode) {
    redirectError(
      formData,
      requestCodeError?.message ?? "Không tạo được mã phiếu xử lý.",
    );
  }

  const sourceHref = textValue(formData, "source_href");
  const taskCode = normalizeCode(textValue(formData, "task_code"));
  const makerNote = [
    taskCode ? `Mã việc từ Action Center: ${taskCode}` : null,
    sourceHref ? `Màn hình nguồn: ${sourceHref}` : null,
    textValue(formData, "maker_note"),
  ]
    .filter(Boolean)
    .join("\n");

  const { error } = await supabase.from("approval_requests").insert({
    approval_code: approvalCode,
    request_code: requestCode,
    request_title: requestTitle,
    entity_type: entityType,
    entity_id: uuidValue(textValue(formData, "entity_id")),
    entity_code: entityCode,
    request_note: textValue(formData, "request_note"),
    evidence_url: textValue(formData, "evidence_url"),
    maker_note: makerNote || null,
    request_status: requestStatus,
    requested_by: user.id,
    due_at: textValue(formData, "due_at"),
    admission_segment_id: segmentId,
    created_by: user.id,
    updated_by: user.id,
  });

  if (error) {
    redirectError(formData, error.message);
  }

  revalidatePath("/short-course/workflows");
  revalidatePath("/short-course/actions");
  redirectBack(formData, "created");
}

export async function updateShortCourseWorkflowRequestAction(
  formData: FormData,
) {
  const requestId = uuidValue(textValue(formData, "request_id"));
  const requestStatus = textValue(formData, "request_status");

  if (!requestId || !requestStatus) {
    redirectError(formData, "missing_workflow_request");
  }

  const allowedStatuses = [
    "PENDING_CHECK",
    "CHECKED",
    "APPROVED",
    "REJECTED",
    "NEEDS_FIX",
    "CANCELLED",
  ];

  if (
    !requestStatus ||
    !allowedStatuses.includes(requestStatus)
  ) {
    redirectError(formData, "invalid_workflow_request_status");
  }

  const nextStatus = requestStatus as string;

  const readClient = await createClient();
  const {
    data: { user: signedInUser },
  } = await readClient.auth.getUser();

  if (!signedInUser) {
    redirect("/login");
  }

  const { data: existingRequest, error: existingRequestError } =
    await readClient
      .from("approval_requests")
      .select("request_status,requested_by")
      .eq("id", requestId)
      .maybeSingle<{ request_status: string; requested_by: string | null }>();

  if (existingRequestError || !existingRequest) {
    redirectError(
      formData,
      existingRequestError?.message ?? "missing_workflow_request",
    );
  }

  const currentRequest = existingRequest as {
    request_status: string;
    requested_by: string | null;
  };

  const transitionMap: Record<string, string[]> = {
    DRAFT: ["PENDING_CHECK", "CANCELLED"],
    NEEDS_FIX: ["PENDING_CHECK", "CANCELLED"],
    PENDING_CHECK: ["CHECKED", "NEEDS_FIX", "CANCELLED"],
    CHECKED: ["APPROVED", "REJECTED"],
  };

  if (
    !transitionMap[currentRequest.request_status]?.includes(nextStatus)
  ) {
    redirectError(formData, "invalid_workflow_transition");
  }

  const requiredPermission =
    nextStatus === "APPROVED" || nextStatus === "REJECTED"
      ? "approve"
      : nextStatus === "PENDING_CHECK" ||
          (nextStatus === "CANCELLED" &&
            ["DRAFT", "NEEDS_FIX"].includes(currentRequest.request_status))
        ? "create"
      : "check";
  const { supabase, user } = await requireWorkflowPermission(
    formData,
    requiredPermission,
  );
  const now = new Date().toISOString();
  const updatePayload: Record<string, string | null> = {
    request_status: nextStatus,
    checker_note: textValue(formData, "checker_note"),
    approver_note: textValue(formData, "approver_note"),
    evidence_url: textValue(formData, "evidence_url"),
    updated_by: user.id,
  };

  if (nextStatus === "CHECKED") {
    updatePayload.checked_by = user.id;
    updatePayload.checked_at = now;
  }

  if (nextStatus === "PENDING_CHECK") {
    updatePayload.maker_note = textValue(formData, "maker_note");
  }

  if (nextStatus === "APPROVED") {
    updatePayload.approved_by = user.id;
    updatePayload.approved_at = now;
    updatePayload.rejected_by = null;
    updatePayload.rejected_at = null;
  }

  if (nextStatus === "REJECTED") {
    updatePayload.rejected_by = user.id;
    updatePayload.rejected_at = now;
    updatePayload.approved_by = null;
    updatePayload.approved_at = null;
  }

  if (nextStatus === "NEEDS_FIX") {
    updatePayload.checked_by = user.id;
    updatePayload.checked_at = now;
  }

  const { error } = await supabase
    .from("approval_requests")
    .update(updatePayload)
    .eq("id", requestId);

  if (error) {
    redirectError(formData, error.message);
  }

  revalidatePath("/short-course/workflows");
  revalidatePath("/short-course/actions");
  redirectBack(formData, "updated");
}
