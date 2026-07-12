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
const linkForm = readRequired(
  "components/settings/user-auth-profile-link-form.tsx",
);
const callback = readRequired("app/auth/callback/route.ts");
const updatePassword = readRequired("app/auth/update-password/page.tsx");
const policies = readRequired("database/policies.sql");
const positionMatrix = readRequired(
  "components/settings/position-assignment-matrix.tsx",
);
const positionMatrixSql = readRequired(
  "database/step114_organization_position_permission_matrix.sql",
);
const auditHelperStart = actions.indexOf(
  "async function writeControlledUserAudit",
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
  "export async function sendUserPasswordResetEmailAction",
);
const credentialEnd = actions.indexOf(
  "export async function updateUserProfileAction",
);
const credentialActions =
  credentialStart >= 0 && credentialEnd > credentialStart
    ? actions.slice(credentialStart, credentialEnd)
    : "";
const assignStart = actions.indexOf(
  "export async function assignHeuPositionByEmailAction",
);
const auditHelper =
  auditHelperStart >= 0 && assignStart > auditHelperStart
    ? actions.slice(auditHelperStart, assignStart)
    : "";
const assignEnd = credentialStart;
const assignAction =
  assignStart >= 0 && assignEnd > assignStart
    ? actions.slice(assignStart, assignEnd)
    : "";
const updateProfileStart = actions.indexOf(
  "export async function updateUserProfileAction",
);
const updateProfileAction =
  updateProfileStart >= 0 && createStart > updateProfileStart
    ? actions.slice(updateProfileStart, createStart)
    : "";
const linkStart = actions.indexOf(
  "export async function linkAuthUserProfileAction",
);
const linkEnd = actions.indexOf(
  "export async function updateRolePermissionsAction",
);
const linkAction =
  linkStart >= 0 && linkEnd > linkStart
    ? actions.slice(linkStart, linkEnd)
    : "";

requireTokens(createAction, "deferred user provisioning action", [
  "adminClient.auth.admin.createUser",
  "email_confirm: true",
  "ban_duration: pendingActivationBanDuration",
  "upsertUserProfileForAuthUser",
  "adminClient.auth.admin.deleteUser",
  "createdAuthUser",
  "auth_user_requires_controlled_link",
  'status: "INACTIVE"',
  "missing_new_user_department",
]);

for (const forbidden of [
  'textValue(formData, "password")',
  "auth.admin.inviteUserByEmail",
  "unsafe_temporary_password",
  "linkedExistingAuthUser",
  "resolvedProfileStatus",
  "existingProfile?.status",
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
  'ban_duration: "none"',
  "auth_user_activation_unlock_failed",
  "ban_duration: pendingActivationBanDuration",
]);

for (const forbidden of [
  "setUserTemporaryPasswordAction",
  'textValue(formData, "password")',
  "unsafeTemporaryPasswords",
  "isUnsafeTemporaryPassword",
  "password_updated=1",
]) {
  if (actions.includes(forbidden)) {
    failures.push(`settings actions contain operator password write: ${forbidden}`);
  }
}

if (
  /auth\.admin\.updateUserById\([\s\S]{0,500}\{\s*password\s*[:,]/.test(
    actions,
  )
) {
  failures.push("settings actions contain operator password write payload");
}

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

requireTokens(assignAction, "one-account-one-position action guard", [
  "user_already_has_active_position",
  "active_user_without_position_requires_review",
  "needsControlledActivation",
  "auth_user_activation_lock_failed",
  '{ ban_duration: pendingActivationBanDuration }',
  '.update({ status: "ACTIVE" })',
  '.update({ status: "INACTIVE" })',
  '.from("heu_position_assignments")',
  "existingPositionId !== targetPositionResult.data?.id",
  "writeControlledUserAudit",
  "HEU_USER_POSITION_ACTIVATED",
  "activation_audit_log_failed",
]);

requireTokens(credentialActions, "activation audit trail", [
  "writeControlledUserAudit",
  "HEU_USER_ACTIVATION_EMAIL_INTENT",
  "HEU_USER_ACTIVATION_EMAIL_FAILED",
  "HEU_USER_ACTIVATION_EMAIL_SENT",
  "activation_audit_log_failed",
]);

requireTokens(auditHelper, "metadata-only activation audit helper", [
  '.from("audit_logs")',
  'entity_type: "users_profile"',
  'note: "HEU_USER_ACTIVATION_CONTROL"',
]);

for (const forbidden of ["target_email", "full_name", "phone", "password", "token"]) {
  if (auditHelper.includes(forbidden)) {
    failures.push(`activation audit helper contains forbidden field: ${forbidden}`);
  }
}

requireTokens(updateProfileAction, "manual activation guard", [
  'targetProfileState?.status !== "ACTIVE" && status === "ACTIVE"',
  "activation_requires_position_assignment",
]);

requireTokens(linkAction, "legacy Auth link server guard", [
  'currentRoleCode === "ADMIN"',
  "manual_auth_link_disabled",
  "upsert_user_profile_from_auth",
]);

if (
  linkAction.indexOf("manual_auth_link_disabled") >
  linkAction.indexOf("upsert_user_profile_from_auth")
) {
  failures.push("legacy Auth link must be blocked before the active-profile RPC");
}

requireTokens(linkForm, "legacy Auth link UI guard", [
  'type="button"',
  "disabled",
  'data-heu-manual-auth-link-status="NO_GO"',
  'data-heu-manual-auth-link="BLOCKED_LEGACY_ACTIVE_PROFILE_RPC"',
]);

requireTokens(positionMatrix, "position-scoped Smart guidance", [
  'data-heu-one-account-one-position="ENFORCED"',
  'data-heu-position-smart-mode="DRAFT_CHECK_SUGGEST_ONLY"',
  'data-heu-position-activation-flow="AUTH_BANNED ASSIGN_POSITION ACTIVATE_PROFILE SEND_RESET_EMAIL UNBAN_ON_SUCCESS"',
  "Một tài khoản vận hành = một vị trí ACTIVE",
  "Smart quản trị đi theo đúng vị trí và scope",
  "App không thu hoặc đặt mật khẩu tạm",
  "sendUserPasswordResetEmailAction",
]);

for (const forbidden of [
  "setUserTemporaryPasswordAction",
  'name="password"',
  'type="password"',
  "set-password-value",
  "Đặt mật khẩu tạm",
]) {
  if (positionMatrix.includes(forbidden)) {
    failures.push(`position matrix contains operator password input: ${forbidden}`);
  }
}

requireTokens(positionMatrixSql, "database one-account-one-position guard", [
  "idx_heu_position_assignments_active_user",
  "on public.heu_position_assignments(user_id)",
  "where status = 'ACTIVE' and user_id is not null",
]);

requireTokens(form, "deferred-activation form", [
  "NO_TEMP_PASSWORD_NO_EMAIL",
  "BANNED_UNTIL_POSITION_AND_EMAIL",
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
console.log("Operator-known temporary password: BLOCKED_BY_CODE");
console.log("Email at provisioning time: NO_GO");
console.log("One account / one ACTIVE position: PASS_LOCAL_GUARDED");
console.log("Position Smart mode: DRAFT_CHECK_SUGGEST_ONLY");
console.log("Activation email and redirect allowlist: NO_GO_UNTIL_CONTROLLED_TEST");
console.log("Production: NO_GO");
