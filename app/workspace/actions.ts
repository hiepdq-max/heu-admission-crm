"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import {
  ACTIVE_ADMISSION_SEGMENT_COOKIE,
  getAdmissionWorkspaceContext,
  safeReturnPath,
  workspaceRedirectPath,
} from "@/lib/workspace";

export async function setAdmissionWorkspaceAction(formData: FormData) {
  const segmentId = String(formData.get("segment_id") ?? "").trim();
  const returnTo = safeReturnPath(String(formData.get("return_to") ?? ""));
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const cookieStore = await cookies();

  if (!segmentId) {
    cookieStore.delete(ACTIVE_ADMISSION_SEGMENT_COOKIE);
    await supabase
      .from("user_admission_workspace_preferences")
      .upsert(
        {
          user_id: user.id,
          active_segment_id: null,
          assigned_by: user.id,
          status: "ACTIVE",
        },
        { onConflict: "user_id" },
      );

    redirect(workspaceRedirectPath(returnTo, null));
  }

  const workspace = await getAdmissionWorkspaceContext(
    supabase,
    user.id,
    segmentId,
  );

  if (workspace.activeSegmentId !== segmentId) {
    redirect("/segments?workspace_error=not_allowed");
  }

  cookieStore.set(ACTIVE_ADMISSION_SEGMENT_COOKIE, segmentId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  await supabase
    .from("user_admission_workspace_preferences")
    .upsert(
      {
        user_id: user.id,
        active_segment_id: segmentId,
        assigned_by: user.id,
        status: "ACTIVE",
      },
      { onConflict: "user_id" },
    );

  redirect(workspaceRedirectPath(returnTo, segmentId));
}
