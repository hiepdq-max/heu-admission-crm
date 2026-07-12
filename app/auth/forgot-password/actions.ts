"use server";

import { recoveryRedirectUrl } from "@/lib/auth-recovery-origin";
import { createAdminClient } from "@/lib/supabase/admin";

export type ForgotPasswordState = {
  submitted?: boolean;
};

export async function requestPasswordRecoveryAction(
  _previousState: ForgotPasswordState,
  formData: FormData,
): Promise<ForgotPasswordState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();

  if (!email) {
    return { submitted: true };
  }

  try {
    const adminClient = createAdminClient();
    const { data: profile, error: profileError } = await adminClient
      .from("users_profile")
      .select("id,department_id,status")
      .eq("email", email)
      .maybeSingle<{
        id: string;
        department_id: string | null;
        status: string;
      }>();

    if (
      profileError ||
      !profile ||
      profile.status !== "ACTIVE" ||
      !profile.department_id
    ) {
      return { submitted: true };
    }

    const { data: assignments, error: assignmentError } = await adminClient
      .from("heu_position_assignments")
      .select("id")
      .eq("user_id", profile.id)
      .eq("status", "ACTIVE")
      .eq("assignment_status", "ACTIVE_ASSIGNED")
      .limit(2)
      .returns<Array<{ id: string }>>();

    if (assignmentError || assignments?.length !== 1) {
      return { submitted: true };
    }

    await adminClient.auth.resetPasswordForEmail(email, {
      redirectTo: await recoveryRedirectUrl(),
    });
  } catch {
    // Fail closed and preserve the same external response for every outcome.
  }

  return { submitted: true };
}
