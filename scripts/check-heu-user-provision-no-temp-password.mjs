import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const failures = [];

function readRequired(relativePath) {
  const absolutePath = path.join(repoRoot, relativePath);
  if (!existsSync(absolutePath)) {
    failures.push(`missing ${relativePath}`);
    return "";
  }
  return readFileSync(absolutePath, "utf8");
}

function requireTokens(content, label, tokens) {
  const missing = tokens.filter((token) => !content.includes(token));
  if (missing.length > 0) {
    failures.push(`${label}: missing ${missing.join(", ")}`);
  }
}

const actions = readRequired("app/settings/actions.ts");
const form = readRequired("components/settings/user-create-form.tsx");
const callback = readRequired("app/auth/callback/route.ts");
const updatePassword = readRequired("app/auth/update-password/page.tsx");
const policies = readRequired("database/policies.sql");
const positionMatrix = readRequired(
  "components/settings/position-assignment-matrix.tsx",
);
const positionMatrixSql = readRequired(
  "database/step114_organization_position_permission_matrix.sql",
);

const createStart = actions.indexOf(
  "export async function createUserAccountAction",
);
const createEnd = actions.indexOf(
  "export async function linkAuthUserProfileAction",
);
const createAction =
  createStart >= 0 && createEnd > createStart
    ? actions.slice(createStart, createEnd)
    : "";
const credentialStart = actions.indexOf(
  "export async function setUserTemporaryPasswordAction",
);
const credentialEnd = actions.indexOf(
  "export async function updateUserProfileAction",
);
const credentialActions =
  credentialStart >= 0 && credentialEnd > credentialStart
    ? actions.slice(credentialStart, credentialEnd)
    : "";

requireTokens(createAction, "deferred user provisioning action", [
  "adminClient.auth.admin.createUser",
  "email_confirm: true",
  "upsertUserProfileForAuthUser",
  "adminClient.auth.admin.deleteUser",
  "createdAuthUser",
  "linkedExistingAuthUser",
  'status: createdAuthUser ? "INACTIVE" : "ACTIVE"',
  "missing_new_user_department",
]);

for (const forbidden of [
  'textValue(formData, "password")',
  "auth.admin.inviteUserByEmail",
  "unsafe_temporary_password",
]) {
  if (createAction.includes(forbidden)) {
    failures.push(`create-user action contains forbidden token: ${forbidden}`);
  }
}

requireTokens(credentialActions, "activation gate", [
  'profile.status !== "ACTIVE"',
  "!profile.department_id",
  "user_activation_not_ready",
  "profileHasActivePosition",
  "user_position_not_ready",
  "resetPasswordForEmail",
]);

if (
  credentialActions.indexOf("user_activation_not_ready") >
  credentialActions.indexOf("resetPasswordForEmail")
) {
  failures.push("activation gate must run before reset email");
}

if (
  credentialActions.indexOf("user_position_not_ready") >
  credentialActions.indexOf("resetPasswordForEmail")
) {
  failures.push("active-position gate must run before reset email");
}

requireTokens(actions, "one-account-one-position action guard", [
  "user_position_requires_active_profile",
  "user_already_has_active_position",
  '.from("heu_position_assignments")',
  'existingPositionId !== targetPositionResult.data.id',
]);

requireTokens(positionMatrix, "position-scoped Smart guidance", [
  'data-heu-one-account-one-position="ENFORCED"',
  'data-heu-position-smart-mode="DRAFT_CHECK_SUGGEST_ONLY"',
  "Một tài khoản vận hành = một vị trí ACTIVE",
  "Smart quản trị đi theo đúng vị trí và scope",
]);

requireTokens(positionMatrixSql, "database one-account-one-position guard", [
  "idx_heu_position_assignments_active_user",
  "on public.heu_position_assignments(user_id)",
  "where status = 'ACTIVE' and user_id is not null",
]);

requireTokens(form, "deferred-activation form", [
  "NO_TEMP_PASSWORD_NO_EMAIL",
  "App không thu mật khẩu tạm",
  "không gửi email lúc tạo",
  "Tạo user chưa kích hoạt",
]);

for (const forbidden of [
  'id="password"',
  'name="password"',
  'type="password"',
]) {
  if (form.includes(forbidden)) {
    failures.push(`new-user form contains forbidden token: ${forbidden}`);
  }
}

requireTokens(callback, "auth callback", [
  "exchangeCodeForSession",
  "safeNextPath",
  "recovery_link_invalid",
  "missing_auth_code",
  "NextResponse.redirect(new URL(next, requestUrl.origin))",
]);
requireTokens(updatePassword, "password update route", [
  "UpdatePasswordForm",
  "HEU Admission CRM",
]);
requireTokens(policies, "inactive profile role and permission guard", [
  "create or replace function public.current_user_role_code()",
  "create or replace function public.has_permission(permission_name text)",
  "and u.status = 'ACTIVE'",
]);

if (failures.length > 0) {
  for (const failure of failures) {
    console.error(`HEU_USER_PROVISION_NO_TEMP_PASSWORD: NO_GO - ${failure}`);
  }
  process.exit(1);
}

console.log("HEU_USER_PROVISION_NO_TEMP_PASSWORD: PASS_LOCAL");
console.log("Operator-known temporary password: NO_GO");
console.log("Email at provisioning time: NO_GO");
console.log("One account / one ACTIVE position: PASS_LOCAL_GUARDED");
console.log("Position Smart mode: DRAFT_CHECK_SUGGEST_ONLY");
console.log("Activation email and redirect allowlist: NO_GO_UNTIL_CONTROLLED_TEST");
console.log("Production: NO_GO");
