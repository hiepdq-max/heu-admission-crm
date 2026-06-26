"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

const allowedIssueActions = new Set([
  "START",
  "SUBMIT_FIX",
  "REQUEST_APPROVAL",
  "APPROVE_RESOLUTION",
  "RETURN_FIX",
  "ESCALATE",
  "CANCEL",
  "REOPEN",
]);

export async function updateTtgdtxImportIssueTaskAction(formData: FormData) {
  const taskId = String(formData.get("task_id") ?? "");
  const nextAction = String(formData.get("next_action") ?? "")
    .trim()
    .toUpperCase();
  const actorNote = String(formData.get("actor_note") ?? "");
  const evidenceUrl = String(formData.get("evidence_url") ?? "");
  const decisionNote = String(formData.get("decision_note") ?? "");

  if (!taskId || !allowedIssueActions.has(nextAction) || !actorNote.trim()) {
    redirect(
      `/ttgdtx/import/issues?error=${encodeURIComponent(
        "Cần chọn thao tác hợp lệ và nhập ghi chú xử lý.",
      )}`,
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("resolve_ttgdtx_import_issue_task", {
    actor_note: actorNote.trim(),
    decision_note: decisionNote.trim() || null,
    evidence_url: evidenceUrl.trim() || null,
    next_action: nextAction,
    target_task_id: taskId,
  });

  if (error) {
    redirect(
      `/ttgdtx/import/issues?error=${encodeURIComponent(error.message)}`,
    );
  }

  revalidatePath("/ttgdtx/import/issues");
  redirect("/ttgdtx/import/issues?updated=1");
}
