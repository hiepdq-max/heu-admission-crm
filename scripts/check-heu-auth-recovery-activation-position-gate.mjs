import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const read = (file) => {
  const full = path.join(root, file);
  if (!existsSync(full)) {
    failures.push(`missing ${file}`);
    return "";
  }
  return readFileSync(full, "utf8");
};
const actionPath = "app/auth/forgot-password/actions.ts";
const formPath = "app/auth/forgot-password/forgot-password-form.tsx";
const loginPath = "components/auth/login-form.tsx";
const action = read(actionPath);
const form = read(formPath);
const login = read(loginPath);
const requireTokens = (source, file, tokens) => tokens.forEach((token) => {
  if (!source.includes(token)) failures.push(`${file}: missing ${token}`);
});

requireTokens(action, actionPath, [
  'import { createAdminClient } from "@/lib/supabase/admin"',
  '.from("users_profile")',
  '.select("id,department_id,status")',
  'profile.status !== "ACTIVE"',
  "!profile.department_id",
  '.from("heu_position_assignments")',
  '.eq("status", "ACTIVE")',
  '.eq("assignment_status", "ACTIVE_ASSIGNED")',
  ".limit(2)",
  "assignments?.length !== 1",
  "adminClient.auth.resetPasswordForEmail",
  "configuredRecoveryOrigin",
  "process.env.NEXT_PUBLIC_SITE_URL",
  "process.env.VERCEL_URL",
  'process.env.NODE_ENV === "production"',
  'throw new Error("missing_canonical_recovery_origin")',
  'parsed.hostname !== "localhost"',
  'parsed.hostname !== "127.0.0.1"',
  'origin.protocol !== "http:"',
  'origin.protocol !== "https:"',
  "catch {",
  "return { submitted: true }",
]);
requireTokens(form, formPath, [
  "requestPasswordRecoveryAction",
  "genericRecoveryMessage",
  'data-heu-recovery-response="GENERIC_ALWAYS"',
  "AI_AUTOMATION_NO_GO",
  "PRODUCTION_NO_GO",
]);
requireTokens(login, loginPath, ['href="/auth/forgot-password"']);

for (const forbidden of ["console.log", "console.error", "serviceRoleKey", "SUPABASE_SERVICE_ROLE_KEY"]) {
  if (action.includes(forbidden)) failures.push(`${actionPath}: forbidden ${forbidden}`);
}
if (/resetPasswordForEmail/.test(form)) failures.push(`${formPath}: browser email send forbidden`);
if (/profileError[^]*return\s+\{\s*(?:error|message)/.test(action)) failures.push(`${actionPath}: differentiated external error forbidden`);

if (failures.length) {
  console.error("HEU Auth recovery activation/position gate: FAIL");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("HEU_AUTH_RECOVERY_ACTIVATION_POSITION_GATE: PASS_LOCAL");
console.log("EMAIL_DELIVERY_TEST: NOT_RUN");
console.log("SUPABASE_REDIRECT_ALLOWLIST: NO_GO_UNTIL_OWNER_VERIFIED");
console.log("AI_AUTOMATION: NO_GO");
console.log("PRODUCTION: NO_GO");
