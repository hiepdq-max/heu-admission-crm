"use server";

import { headers } from "next/headers";

import { createAdminClient } from "@/lib/supabase/admin";

export type ForgotPasswordState = {
  submitted?: boolean;
};

function configuredRecoveryOrigin() {
  const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const vercelUrl = process.env.VERCEL_URL;
  const candidate = configuredSiteUrl
    ? configuredSiteUrl
    : vercelUrl
      ? vercelUrl.startsWith("http")
        ? vercelUrl
        : `https://${vercelUrl}`
      : null;

  if (!candidate) return null;

  const origin = new URL(candidate);
  if (origin.protocol !== "http:" && origin.protocol !== "https:") {
    throw new Error("invalid_recovery_origin_protocol");
  }

  return origin.origin;
}

function localDevelopmentOrigin(host: string, forwardedProto: string | null) {
  const safeHost = host.replace(/^(?:0\.0\.0\.0|\[::\])(?=:\d+$|$)/, "localhost");
  const parsed = new URL(`http://${safeHost}`);

  if (parsed.hostname !== "localhost" && parsed.hostname !== "127.0.0.1") {
    throw new Error("untrusted_local_recovery_host");
  }

  const protocol = forwardedProto === "https" ? "https" : "http";
  return `${protocol}://${safeHost}`;
}

async function recoveryRedirectUrl() {
  const configuredOrigin = configuredRecoveryOrigin();
  if (configuredOrigin) {
    const callbackUrl = new URL("/auth/callback", configuredOrigin);
    callbackUrl.searchParams.set("next", "/auth/update-password");
    return callbackUrl.toString();
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("missing_canonical_recovery_origin");
  }

  const requestHeaders = await headers();
  const host = requestHeaders.get("host");
  if (!host) throw new Error("missing_local_recovery_host");
  const origin = localDevelopmentOrigin(
    host,
    requestHeaders.get("x-forwarded-proto"),
  );
  const callbackUrl = new URL("/auth/callback", origin);
  callbackUrl.searchParams.set("next", "/auth/update-password");
  return callbackUrl.toString();
}

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
