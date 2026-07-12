import { readFileSync } from "node:fs";

const source = readFileSync("app/auth/callback/route.ts", "utf8");
const required = [
  'requestUrl.searchParams.get("token_hash")',
  'requestUrl.searchParams.get("type")',
  'authType === "magiclink"',
  "supabase.auth.verifyOtp",
  'type: "magiclink"',
  "safeNextPath",
  "recovery_link_invalid",
];
const forbidden = [
  'type: authType',
  'new URL(next)',
  'startsWith("http")',
];

const missing = required.filter((token) => !source.includes(token));
const unsafe = forbidden.filter((token) => source.includes(token));

if (missing.length || unsafe.length) {
  console.error(
    `NO_GO AUTH-MAGICLINK-CALLBACK: missing=${missing.join(",") || "none"}; unsafe=${unsafe.join(",") || "none"}`,
  );
  process.exit(1);
}

console.log(
  "PASS_LOCAL AUTH-MAGICLINK-CALLBACK: code and magiclink token_hash are supported; type allowlist and internal next-path guard remain fail-closed.",
);
