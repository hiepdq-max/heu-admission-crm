import "server-only";

import { headers } from "next/headers";

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
  if (
    (origin.protocol !== "http:" && origin.protocol !== "https:") ||
    origin.username ||
    origin.password
  ) {
    throw new Error("invalid_recovery_origin");
  }

  return origin.origin;
}

function localDevelopmentOrigin(host: string, forwardedProto: string | null) {
  const safeHost = host.replace(/^(?:0\.0\.0\.0|\[::\])(?=:\d+$|$)/, "localhost");
  const parsed = new URL(`http://${safeHost}`);

  if (parsed.hostname !== "localhost" && parsed.hostname !== "127.0.0.1") {
    throw new Error("untrusted_local_recovery_host");
  }

  const protocol = forwardedProto?.split(",")[0]?.trim() === "https"
    ? "https"
    : "http";
  return `${protocol}://${safeHost}`;
}

export async function recoveryRedirectUrl() {
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
