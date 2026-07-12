import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];

function read(file) {
  const fullPath = path.join(root, file);
  if (!existsSync(fullPath)) {
    failures.push(`missing ${file}`);
    return "";
  }
  return readFileSync(fullPath, "utf8");
}

function requireTokens(source, file, tokens) {
  for (const token of tokens) {
    if (!source.includes(token)) failures.push(`${file}: missing ${token}`);
  }
}

const originPath = "lib/auth-recovery-origin.ts";
const settingsPath = "app/settings/actions.ts";
const origin = read(originPath);
const settings = read(settingsPath);

requireTokens(origin, originPath, [
  'import "server-only"',
  "process.env.NEXT_PUBLIC_SITE_URL",
  "process.env.VERCEL_URL",
  'origin.protocol !== "http:"',
  'origin.protocol !== "https:"',
  "origin.username",
  "origin.password",
  'process.env.NODE_ENV === "production"',
  'throw new Error("missing_canonical_recovery_origin")',
  'parsed.hostname !== "localhost"',
  'parsed.hostname !== "127.0.0.1"',
  'requestHeaders.get("host")',
  'requestHeaders.get("x-forwarded-proto")',
]);
requireTokens(settings, settingsPath, [
  'import { recoveryRedirectUrl } from "@/lib/auth-recovery-origin"',
  "redirectTo: await recoveryRedirectUrl()",
]);

for (const forbidden of [
  "x-forwarded-host",
  "requestOrigin",
  "passwordRecoveryRedirectUrl",
  'return "http://localhost:3000"',
]) {
  if (settings.includes(forbidden)) failures.push(`${settingsPath}: forbidden ${forbidden}`);
}

for (const source of [origin, settings]) {
  for (const forbidden of ["console.log", "console.error", "SUPABASE_SERVICE_ROLE_KEY"]) {
    if (source.includes(forbidden)) failures.push(`forbidden ${forbidden}`);
  }
}

if (failures.length > 0) {
  console.error("HEU_SETTINGS_RECOVERY_ORIGIN_GUARD: NO_GO");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("HEU_SETTINGS_RECOVERY_ORIGIN_GUARD: PASS_LOCAL");
console.log("CANONICAL_ORIGIN: REQUIRED_IN_PRODUCTION");
console.log("REQUEST_HOST_FALLBACK: LOCALHOST_ONLY");
console.log("EMAIL_DELIVERY: NOT_RUN");
console.log("PRODUCTION: NO_GO");
