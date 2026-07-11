import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const failures = [];

function read(relativePath) {
  const absolutePath = path.join(repoRoot, relativePath);
  if (!existsSync(absolutePath)) {
    failures.push(`Missing required file: ${relativePath}`);
    return "";
  }

  return readFileSync(absolutePath, "utf8");
}

function requireTokens(contents, tokens, relativePath) {
  for (const token of tokens) {
    if (!contents.includes(token)) {
      failures.push(`${relativePath}: missing token: ${token}`);
    }
  }
}

function forbidTokens(contents, tokens, relativePath) {
  for (const token of tokens) {
    if (contents.includes(token)) {
      failures.push(`${relativePath}: forbidden token: ${token}`);
    }
  }
}

const loginFormPath = "components/auth/login-form.tsx";
const forgotPagePath = "app/auth/forgot-password/page.tsx";
const forgotFormPath = "app/auth/forgot-password/forgot-password-form.tsx";
const callbackPath = "app/auth/callback/route.ts";
const updateFormPath = "app/auth/update-password/update-password-form.tsx";
const settingsActionsPath = "app/settings/actions.ts";
const packagePath = "package.json";

const loginForm = read(loginFormPath);
const forgotPage = read(forgotPagePath);
const forgotForm = read(forgotFormPath);
const callbackRoute = read(callbackPath);
const updateForm = read(updateFormPath);
const settingsActions = read(settingsActionsPath);
const packageJson = read(packagePath);

requireTokens(
  loginForm,
  [
    'href="/auth/forgot-password"',
    "P0-17_SELF_SERVICE_PASSWORD_RESET_ENTRY",
  ],
  loginFormPath,
);

requireTokens(
  forgotPage,
  ["ForgotPasswordForm", 'redirect("/auth/update-password")'],
  forgotPagePath,
);

requireTokens(
  forgotForm,
  [
    "supabase.auth.resetPasswordForEmail",
    "redirectTo: passwordRecoveryRedirectUrl()",
    "browserSafePasswordRecoveryOrigin",
    'callbackOrigin.hostname === "0.0.0.0"',
    'callbackOrigin.hostname = "localhost"',
    'callbackUrl.searchParams.set("next", "/auth/update-password")',
    "NO_RAW_RESET_LINK",
    "NO_PASSWORD_CAPTURE",
    "NO_SCOPE_CHANGE",
    "NO_OWNER_GO",
    "NO_PRODUCTION_GO",
  ],
  forgotFormPath,
);

forbidTokens(
  forgotForm,
  ["localStorage", "sessionStorage", "console.log", "service_role"],
  forgotFormPath,
);

requireTokens(
  settingsActions,
  [
    "browserSafePasswordRecoveryHost",
    '/^(?:0\\.0\\.0\\.0|\\[::\\])(?=:\\d+$|$)/',
    "const safeHost = browserSafePasswordRecoveryHost(host)",
    "return `${protocol}://${safeHost}`",
  ],
  settingsActionsPath,
);

requireTokens(
  callbackRoute,
  ["safeNextPath", "exchangeCodeForSession", "recovery_link_invalid"],
  callbackPath,
);

requireTokens(
  updateForm,
  [
    "supabase.auth.updateUser({ password })",
    "await supabase.auth.signOut()",
  ],
  updateFormPath,
);

requireTokens(
  packageJson,
  [
    '"check:heu-auth-password-recovery-origin-guard"',
    "node scripts/check-heu-auth-password-recovery-origin-guard.mjs",
  ],
  packagePath,
);

if (failures.length > 0) {
  console.error("HEU password recovery origin guard check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("HEU password recovery origin guard check");
console.log("PASSWORD_RECOVERY_ORIGIN_GUARD: PASS_LOCAL");
console.log("PASSWORD_RECOVERY_EMAIL_DELIVERY: NO_GO_UNTIL_CONTROLLED_TEST");
console.log("SUPABASE_REDIRECT_ALLOWLIST: NO_GO_UNTIL_OWNER_VERIFIED");
console.log("PRODUCTION: NO_GO");
