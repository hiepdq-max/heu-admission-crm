import { NextResponse, type NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";

function safeNextPath(value: string | null) {
  if (value && value.startsWith("/") && !value.startsWith("//")) {
    return value;
  }

  return "/";
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const tokenHash = requestUrl.searchParams.get("token_hash");
  const authType = requestUrl.searchParams.get("type");
  const callbackError =
    requestUrl.searchParams.get("error_description") ??
    requestUrl.searchParams.get("error");
  const next = safeNextPath(requestUrl.searchParams.get("next"));

  if (callbackError) {
    return NextResponse.redirect(
      new URL("/login?auth_error=recovery_link_invalid", requestUrl.origin),
    );
  }

  const hasMagicLinkToken = Boolean(tokenHash) && authType === "magiclink";

  if (!code && !hasMagicLinkToken) {
    return NextResponse.redirect(
      new URL("/login?auth_error=missing_auth_code", requestUrl.origin),
    );
  }

  const supabase = await createClient();
  const { error } = code
    ? await supabase.auth.exchangeCodeForSession(code)
    : await supabase.auth.verifyOtp({
        token_hash: tokenHash!,
        type: "magiclink",
      });

  if (error) {
    return NextResponse.redirect(
      new URL("/login?auth_error=recovery_link_invalid", requestUrl.origin),
    );
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin));
}
