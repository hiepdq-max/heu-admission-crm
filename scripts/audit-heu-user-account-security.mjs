import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const failures = [];

function fail(message) {
  failures.push(message);
}

function read(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), "utf8");
}

function requireFile(relativePath) {
  if (!existsSync(path.join(repoRoot, relativePath))) {
    fail(`Missing required file: ${relativePath}`);
  }
}

function requireAllText(contents, tokens, label, file) {
  for (const token of tokens) {
    if (!contents.includes(token)) {
      fail(`${file}: missing ${label}: ${token}`);
    }
  }
}

function forbidText(contents, tokens, label, file) {
  for (const token of tokens) {
    if (contents.includes(token)) {
      fail(`${file}: forbidden ${label}: ${token}`);
    }
  }
}

function requireOrderedText(contents, tokens, label, file) {
  let cursor = 0;

  for (const token of tokens) {
    const next = contents.indexOf(token, cursor);
    if (next === -1) {
      fail(`${file}: missing ordered ${label}: ${token}`);
      return;
    }
    cursor = next + token.length;
  }
}

function requireSection(contents, heading, tokens, file) {
  const marker = `## ${heading}`;
  const start = contents.indexOf(marker);
  if (start === -1) {
    fail(`${file}: missing section ${heading}`);
    return;
  }

  const next = contents.indexOf("\n## ", start + marker.length);
  const section = next === -1 ? contents.slice(start) : contents.slice(start, next);
  requireAllText(section, tokens, heading, file);
}

const formPath = "components/settings/user-create-form.tsx";
const linkFormPath = "components/settings/user-auth-profile-link-form.tsx";
const businessScopePath =
  "components/settings/user-business-scope-settings.tsx";
const positionMatrixPath =
  "components/settings/position-assignment-matrix.tsx";
const onboardingPath = "components/settings/real-user-onboarding-panel.tsx";
const actionsPath = "app/settings/actions.ts";
const settingsPagePath = "app/settings/page.tsx";
const scopePagePath = "app/settings/scopes/page.tsx";
const supabaseCheckPath = "components/settings/supabase-check.tsx";
const supabaseCheckPagePath = "app/settings/supabase-check/page.tsx";
const appShellPath = "components/layout/app-shell.tsx";
const permissionsPath = "lib/permissions.ts";
const seedPath = "database/seed.sql";
const userCreateServerKeyTemplatePath =
  "docs/HEU_USER_CREATE_SERVER_KEY_TEMPLATE_20260702.md";
const userCreateReadinessCheckPath =
  "scripts/check-heu-user-create-readiness.mjs";
const userCreatePermissionMigrationPath =
  "database/step112_admin_user_create_permission.sql";
const departmentHeadRolesMigrationPath =
  "database/step113_department_head_roles.sql";
const organizationPositionMatrixPath =
  "database/step114_organization_position_permission_matrix.sql";
const readinessPath = "lib/production-readiness.ts";
const financeDayOneRunbookPath =
  "docs/HEU_FINANCE_DAY1_REAL_RUN_REHEARSAL_20260630.md";
const financeDayOneActivationTemplatePath =
  "docs/HEU_FINANCE_DAY1_ACCOUNT_ACTIVATION_TEMPLATE_20260630.md";
const financeDayOneStartGateChecklistPath =
  "docs/HEU_FINANCE_DAY1_START_GATE_CHECKLIST_20260630.md";
const financeDayOnePreloginMatrixPath =
  "docs/HEU_FINANCE_DAY1_P6_04_PRELOGIN_MATRIX_20260630.md";
const financeDayOneLedgerTemplatePath =
  "docs/HEU_FINANCE_DAY1_RESULT_LEDGER_TEMPLATE_20260630.md";
const packagePath = "package.json";
const agentsPath = "AGENTS.md";
const releaseGatePath = "scripts/audit-ttgdtx-release-gates.mjs";
const logPath = "docs/HEU_IMPLEMENTATION_LOG.md";

for (const file of [
  formPath,
  linkFormPath,
  businessScopePath,
  positionMatrixPath,
  onboardingPath,
  actionsPath,
  settingsPagePath,
  scopePagePath,
  supabaseCheckPath,
  supabaseCheckPagePath,
  appShellPath,
  permissionsPath,
  seedPath,
  userCreateServerKeyTemplatePath,
  userCreateReadinessCheckPath,
  userCreatePermissionMigrationPath,
  departmentHeadRolesMigrationPath,
  organizationPositionMatrixPath,
  readinessPath,
  financeDayOneRunbookPath,
  financeDayOneActivationTemplatePath,
  financeDayOneStartGateChecklistPath,
  financeDayOnePreloginMatrixPath,
  financeDayOneLedgerTemplatePath,
  packagePath,
  agentsPath,
  releaseGatePath,
  logPath,
]) {
  requireFile(file);
}

const form = read(formPath);
const linkForm = read(linkFormPath);
const businessScope = read(businessScopePath);
const positionMatrix = read(positionMatrixPath);
const onboarding = read(onboardingPath);
const actions = read(actionsPath);
const settingsPage = read(settingsPagePath);
const scopePage = read(scopePagePath);
const supabaseCheck = read(supabaseCheckPath);
const supabaseCheckPage = read(supabaseCheckPagePath);
const appShell = read(appShellPath);
const permissionsSource = read(permissionsPath);
const seedSource = read(seedPath);
const userCreateServerKeyTemplate = read(userCreateServerKeyTemplatePath);
const userCreateReadinessCheck = read(userCreateReadinessCheckPath);
const userCreatePermissionMigration = read(userCreatePermissionMigrationPath);
const departmentHeadRolesMigration = read(departmentHeadRolesMigrationPath);
const organizationPositionMatrix = read(organizationPositionMatrixPath);
const readinessSource = read(readinessPath);
const financeDayOneRunbook = read(financeDayOneRunbookPath);
const financeDayOneActivationTemplate = read(financeDayOneActivationTemplatePath);
const financeDayOneStartGateChecklist = read(financeDayOneStartGateChecklistPath);
const financeDayOnePreloginMatrix = read(financeDayOnePreloginMatrixPath);
const financeDayOneLedgerTemplate = read(financeDayOneLedgerTemplatePath);
const packageJson = JSON.parse(read(packagePath));
const agents = read(agentsPath);
const releaseGate = read(releaseGatePath);
const implementationLog = read(logPath);

requireAllText(
  form,
  [
    'id="password"',
    'type="password"',
    'autoComplete="new-password"',
    "minLength={8}",
    'aria-describedby="temporary-password-help"',
    'id="temporary-password-help"',
    "Codex/chat",
    "email",
    "service role key",
    "Không hiển thị key",
    "không ghi log mật khẩu tạm",
  ],
  "temporary password field safety guidance",
  formPath,
);

requireAllText(
  actions,
  [
    "unsafeTemporaryPasswords",
    "password123",
    "heu123456",
    "normalizePasswordSignal",
    "isUnsafeTemporaryPassword",
    "emailLocalPart",
    "nameParts",
    "unsafe_temporary_password",
  ],
  "server-side unsafe temporary password guard",
  actionsPath,
);

requireAllText(
  permissionsSource,
  [
    'code: "users.create"',
    "Tạo Supabase Auth user và gắn profile CRM",
  ],
  "dedicated create-user permission catalog entry",
  permissionsPath,
);

requireAllText(
  seedSource,
  ["('users.create')"],
  "ADMIN seed keeps create-user permission",
  seedPath,
);

requireAllText(
  actions,
  [
    'const createUserPermission = "users.create"',
    "privilegedUserRoleCodes",
    "permission_name: createUserPermission",
    "not_allowed_create_user",
    "not_allowed_create_privileged_user",
    '.from("users_profile")',
    "adminClient.auth.admin.deleteUser",
    "Auth cleanup failed",
    "selectedPermissions.add(createUserPermission)",
  ],
  "server-side create-user permission and privileged-role guard",
  actionsPath,
);

requireAllText(
  actions,
  [
    "isExistingAuthUserError",
    "findAuthUserIdByEmail",
    "auth_user_lookup_failed",
    "auth_user_exists_but_not_found",
    "upsertUserProfileForAuthUser",
    "createdAuthUser",
    "linkedExistingAuthUser",
    "profile_linked=1&auth_user_existing=1",
  ],
  "existing Supabase Auth user profile-link fallback guard",
  actionsPath,
);

requireAllText(
  actions,
  [
    'const positionMatrixManagePermission = "permission_matrix.manage"',
    "assignHeuPositionByEmailAction",
    "assign_heu_position_by_email",
    "target_position_code",
    "target_email",
    "not_allowed_position_assignment",
    "setUserTemporaryPasswordAction",
    "sendUserPasswordResetEmailAction",
    "adminClient.auth.admin.updateUserById",
    "resetPasswordForEmail",
    "isUnsafeTemporaryPassword",
    "missing_password_reset_data",
    "missing_password_user",
  ],
  "position assignment and password-reset server guard",
  actionsPath,
);

requireAllText(
  form,
  [
    "createUserDisabledReason",
    "missing_permission",
    "canCreatePrivilegedUsers",
    '!["ADMIN", "BGH"].includes',
    "users.create",
    "missingServiceRoleMessage",
    "ADMIN vẫn có thể tạo user thủ công",
    "nhờ ADMIN/IT_DATA cấu hình key server",
    "không gửi mật khẩu tạm, OTP hay invite/reset link",
  ],
  "create-user form permission and privileged-role guard",
  formPath,
);

requireAllText(
  linkForm,
  [
    "financeDayOneManualLinkChecks",
    'data-heu-finance-day-one-manual-auth-link="P0-17-P6-04"',
    "Finance Day-1 accounting user manual Auth link",
    "FIN_MANUAL_LINK_READY / NO_GO / BLOCKED",
    "FIN-LINK-01",
    "FIN-LINK-04",
    "REAL_KHTC_TTGDTX_OPERATOR_01",
    "outside Codex/chat",
    "does not collect",
    "approve UAT",
    "finance reliance",
    "mark production GO",
    "P6-04",
    "P2-18",
    "P5-03",
    "P2-17",
    "password reset link",
    "account activation/invite link",
    "service-role",
    "raw PII",
    "bank data",
    "voucher",
  ],
  "Finance Day-1 manual Auth link handoff guard",
  linkFormPath,
);

requireAllText(
  settingsPage,
  [
    "unsafe_temporary_password",
    "Mật khẩu tạm quá dễ đoán",
    "email/tên user",
    "kênh bảo mật",
    "RealUserOnboardingPanel",
    "<RealUserOnboardingPanel />",
    "<UserCreateForm",
    "not_allowed_create_user",
    "not_allowed_create_privileged_user",
    "canCreatePrivilegedUsers",
    "auth_user_lookup_failed",
    "Auth user đã tồn tại",
    "Email đã tồn tại",
  ],
  "settings page user-account guard",
  settingsPagePath,
);

requireAllText(
  scopePage,
  [
    "canCreateUserPermission",
    'permission_name: "users.create"',
    "canCreateUsers",
    "canUseScopePanels",
    "not_allowed_create_user",
    "not_allowed_create_privileged_user",
    "createUserDisabledReason",
    'canCreatePrivilegedUsers={currentRoleCode === "ADMIN"}',
    "auth_user_lookup_failed",
    "Auth user đã tồn tại",
    "Email đã tồn tại",
  ],
  "scoped page create-user permission guard",
  scopePagePath,
);

requireAllText(
  `${form}\n${linkForm}\n${businessScope}`,
  [
    "departmentManagerRoleCodes",
    "ACCOUNTING_LEAD",
    "CTHSSV_LEAD",
    "organizationManagers",
    "departmentHeads.length > 0",
    'normalizedName.includes("truong nhom")',
    'normalizedName.includes("trưởng nhóm")',
    'normalizedName.includes("trưởng phòng")',
  ],
  "department lead Vietnamese role detection guard",
  `${formPath}, ${linkFormPath}, ${businessScopePath}`,
);

requireAllText(
  appShell,
  [
    'permissions: [',
    '"scope.manage_department"',
    '"users.create"',
    '"permission_matrix.read"',
    '"permission_matrix.manage"',
    "item.permissions",
    "itemPermissions.some",
  ],
  "sidebar exposes user scope page to delegated create-user operators",
  appShellPath,
);

requireAllText(
  positionMatrix,
  [
    'data-heu-position-assignment-matrix="P0-17"',
    'data-heu-position-matrix-overflow-guard="P0-17_NO_OVERFLOW"',
    'data-heu-position-matrix-quick-access="P0-17_POSITION_QUICK_ACCESS"',
    'data-heu-position-group-filters="ALL BGH DAO_TAO TUYEN_SINH CTHSSV KHTC PHAP_CHE AUDIT IT_DATA KHOA NGAN_HAN HR"',
    "Ma trận vị trí và user",
    "assignHeuPositionByEmailAction",
    "setUserTemporaryPasswordAction",
    "sendUserPasswordResetEmailAction",
    "heu-position-user-email-options",
    "min-w-0",
    "overflow-hidden",
    "break-words",
    "truncate",
    "overflow-x-auto",
    "shrink-0",
    "Không hiển thị, không log",
    "không gửi mật khẩu thô",
    "SUPABASE_SERVICE_ROLE_KEY",
    "Step 114",
    "PASS_LOCAL",
  ],
  "position assignment matrix UI guard",
  positionMatrixPath,
);

requireSection(implementationLog, "2026-07-02 - P0-17 Position Assignment Control UI", [
  "components/settings/position-assignment-matrix.tsx",
  "/settings/scopes",
  "permission_matrix.read",
  "permission_matrix.manage",
  "data-heu-position-matrix-quick-access=\"P0-17_POSITION_QUICK_ACCESS\"",
  "data-heu-position-matrix-overflow-guard=\"P0-17_NO_OVERFLOW\"",
  "does not create fake accounts",
  "approve UAT",
  "approve finance reliance",
  "mark production GO",
], logPath);

requireAllText(
  supabaseCheck,
  [
    "serviceRoleKeyConfigured",
    "userCreationPreflightItems",
    "Trạng thái tạo user tự động",
    "Preflight tạo user trong phần mềm",
    "SUPABASE_SERVICE_ROLE_KEY",
    "users.create",
    "mật khẩu tạm, OTP hoặc invite link",
    "không gửi qua Codex/chat/email",
  ],
  "Supabase check user-create service-role readiness",
  supabaseCheckPath,
);

requireAllText(
  supabaseCheckPage,
  [
    "checkServiceRoleAdminApi",
    "adminClient.auth.admin.listUsers",
    "USER-CREATE-ENV",
    "USER-CREATE-AUTH-ADMIN",
    "USER-CREATE-ADMIN-SEED",
    "USER-CREATE-OPERATOR",
    "USER-CREATE-ROUTE",
    "USER_CREATE_AUTH_ADMIN_NO_GO",
    "USER_CREATE_ADMIN_CLIENT_NO_GO",
    "không đưa chi tiết lỗi ra UI/log/chat",
    "serviceRoleKeyConfigured",
    "process.env.SUPABASE_SERVICE_ROLE_KEY",
    "userCreationPreflightItems",
  ],
  "Supabase check page passes service-role readiness without exposing key",
  supabaseCheckPagePath,
);

forbidText(
  supabaseCheckPage,
  ["error.message"],
  "raw Supabase Auth Admin API error disclosure",
  supabaseCheckPagePath,
);

requireAllText(
  userCreateServerKeyTemplate,
  [
    "NEXT_PUBLIC_SUPABASE_URL=",
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=",
    "SUPABASE_SERVICE_ROLE_KEY=",
    "Do not commit `.env.local`",
    "Do not paste secret values",
    "check:heu-user-create-readiness",
    "must not print secret values or",
    "raw Supabase error messages",
  ],
  "safe server-key template for user creation",
  userCreateServerKeyTemplatePath,
);

requireAllText(
  userCreateReadinessCheck,
  [
    "HEU user-create readiness check",
    "Secrets are never printed by this script.",
    "USER-CREATE-ENV",
    "USER-CREATE-AUTH-ADMIN",
    "USER-CREATE-ADMIN-SEED",
    "USER_CREATE_AUTH_ADMIN_NO_GO",
    "USER_CREATE_ADMIN_ROLE_NO_GO",
    "USER_CREATE_ADMIN_SEED_NO_GO",
    "USER_CREATE_READINESS_EXCEPTION_NO_GO",
    "Raw errors are not printed.",
    "auth.admin.listUsers",
    "role_permissions",
    "users.create",
    "database/step112_admin_user_create_permission.sql",
  ],
  "local user-create readiness script",
  userCreateReadinessCheckPath,
);

requireAllText(
  userCreatePermissionMigration,
  [
    "Step 112 - P0-17 Admin user-create permission grant",
    "insert into public.role_permissions",
    "values (admin_role_id, 'users.create')",
    "on conflict (role_id, permission) do nothing",
    "status = 'ACTIVE'",
    "database/step112_admin_user_create_permission.sql",
    "Do not run in production from Codex/chat",
    "service-role keys, passwords, OTPs, invite links",
  ],
  "existing database users.create permission migration",
  userCreatePermissionMigrationPath,
);

requireAllText(
  `${seedSource}\n${departmentHeadRolesMigration}`,
  [
    "CTHSSV_LEAD",
    "ACCOUNTING_LEAD",
    "users.manage_department",
    "scope.manage_department",
    "payments.verify",
  ],
  "department lead role seed and migration setup",
  `${seedPath}, ${departmentHeadRolesMigrationPath}`,
);

requireAllText(
  departmentHeadRolesMigration,
  [
    "Step 113 - P0-17 department head roles for user/profile setup",
    "Migration candidate only",
    "Do not run in production from Codex/chat",
    "Production requires backup evidence",
    "migration order approval",
    "business Go/No-Go sign-off",
    "do not paste passwords, OTPs, invite/reset links",
    "service-role keys or raw PII",
  ],
  "department head role migration safety boundary",
  departmentHeadRolesMigrationPath,
);

requireAllText(
  organizationPositionMatrix,
  [
    "Step 114 - P0-17 HEU organization position, permission and assignment matrix",
    "Migration candidate only",
    "Do not run in production from Codex/chat",
    "Keep real account assignment separate from role design",
    "heu_org_positions",
    "heu_position_permission_matrix",
    "heu_position_assignments",
    "heu_position_matrix_status",
    "assign_heu_position_by_email",
    "ADMISSION_HEAD",
    "COUNSELOR",
    "('LEGAL', 'Nhan su phap che'",
    "('PHAP_CHE_01', 'Phap che 01'",
    "join public.roles r on r.code = p.default_role_code",
    "public.can_read_permission_matrix()",
    "public.can_manage_permission_matrix()",
    "or public.has_permission('users.manage')",
    "on delete restrict",
    "do not paste passwords, OTPs, invite/reset links",
    "service-role keys, raw PII, CCCD, bank data or screenshots",
  ],
  "organization position permission matrix setup",
  organizationPositionMatrixPath,
);

forbidText(
  organizationPositionMatrix,
  ["using (true);", "on delete cascade"],
  "open authenticated read policy in organization position matrix",
  organizationPositionMatrixPath,
);

requireAllText(
  permissionsSource,
  [
    'code: "permission_matrix.read"',
    'label: "Xem ma trận vị trí"',
    'code: "permission_matrix.manage"',
    'label: "Gán ma trận vị trí"',
  ],
  "permission matrix labels",
  permissionsPath,
);

requireAllText(
  actions,
  [
    "positionMatrixManagePermission",
    "userManagePermission",
    "requirePositionMatrixManage",
    "requireUserCredentialManage",
    "assignHeuPositionByEmailAction",
    "assign_heu_position_by_email",
    "setUserTemporaryPasswordAction",
    "sendUserPasswordResetEmailAction",
    "not_allowed_create_privileged_user",
    "isUnsafeTemporaryPassword",
    "findAuthUserIdByEmail",
    "updateUserById",
    "resetPasswordForEmail",
    "position_assigned=1#position-matrix",
    "password_updated=1#position-password",
    "password_email_sent=1#position-password",
  ],
  "position assignment and credential handoff actions",
  actionsPath,
);

requireSection(implementationLog, "2026-07-02 - P0-17 Organization Position Permission Matrix", [
  "database/step114_organization_position_permission_matrix.sql",
  "standard HEU position matrix",
  "heu_org_positions",
  "heu_position_permission_matrix",
  "heu_position_assignments",
  "heu_position_matrix_status",
  "LEGAL",
  "PHAP_CHE_01",
  "PHAP_CHE_03",
  "can_read_permission_matrix",
  "can_manage_permission_matrix",
  "no open all-authenticated read",
  "no on delete cascade",
  "permission_matrix.read",
  "permission_matrix.manage",
  "assign_heu_position_by_email",
  "does not create",
  "accounts",
  "set passwords",
  "send reset/invite links",
  "approve UAT",
  "approve finance reliance",
  "approve migration order",
  "mark production GO",
], logPath);

forbidText(
  userCreateReadinessCheck,
  [".message"],
  "raw Supabase readiness error disclosure",
  userCreateReadinessCheckPath,
);

requireAllText(
  JSON.stringify(packageJson.scripts),
  ["check:heu-user-create-readiness"],
  "package command for user-create readiness",
  packagePath,
);

requireOrderedText(
  settingsPage,
  ["RealUserOnboardingPanel", "<RealUserOnboardingPanel />", "<UserCreateForm"],
  "real-user onboarding panel before create-user form",
  settingsPagePath,
);

requireOrderedText(
  scopePage,
  ["RealUserOnboardingPanel", "<RealUserOnboardingPanel />", "<UserCreateForm"],
  "real-user onboarding panel before scoped create-user form",
  scopePagePath,
);

requireAllText(
  onboarding,
  [
    'data-heu-real-user-onboarding-panel="P0-17"',
    "Real user onboarding for accounting",
    "PASS_LOCAL only",
    "USER-REAL-01",
    "USER-REAL-05",
    "Supabase Auth",
    "User Scope Enforcement",
    "P6-04",
    "P2-18",
    "P5-03",
    "USER_READY / NO_GO / BLOCKED",
    "passwords, temporary passwords",
    "OTPs",
    "password reset links",
    "account activation/invite links",
    "production GO",
    'data-heu-real-user-finance-lanes="P0-17-P5-03"',
    "KHTC accounting operator",
    "BGH read-only reviewer",
    "Audit read-only reviewer",
    "Phap Che contract/legal reviewer",
    "Out-of-scope negative account",
  ],
  "real-user accounting onboarding guard",
  onboardingPath,
);

requireAllText(
  onboarding,
  [
    "PRODUCTION_FINANCE_DAY_ONE_START_GATES",
    "PRODUCTION_FINANCE_DAY_ONE_START_GATE_CHECKLIST",
    'data-heu-finance-day-one-start-gates="P0-03_P0-10_P6-04_P0-14_P0-17"',
    "Finance Day-1 start gates before real-accounting accounts",
    "FIN_START_READY / NO_GO / BLOCKED",
    "Do not invite, create or activate any real-accounting account",
    "controlled evidence outside Git/Codex/chat",
    "gate.requiredProof",
    "gate.stopCondition",
  ],
  "finance Day-1 start gates before real-accounting accounts UI",
  onboardingPath,
);

requireAllText(
  onboarding,
  [
    "PRODUCTION_FINANCE_DAY_ONE_ACCOUNT_ACTIVATION_CHECKS",
    "PRODUCTION_FINANCE_DAY_ONE_ACCOUNT_ACTIVATION_TEMPLATE",
    'data-heu-finance-day-one-account-activation="P0-17-P6-04"',
    "Finance Day-1 account activation handoff",
    "FIN_ACTIVATION_READY / NO_GO / BLOCKED",
    "invite status, profile link, narrow scope",
    "without storing credentials or invite links",
    "item.requiredProof",
    "item.stopCondition",
  ],
  "finance Day-1 account activation handoff guard",
  onboardingPath,
);

requireAllText(
  onboarding,
  [
    "PRODUCTION_FINANCE_DAY_ONE_P6_04_PRELOGIN_CHECKS",
    "PRODUCTION_FINANCE_DAY_ONE_P6_04_PRELOGIN_MATRIX",
    'data-heu-finance-day-one-p6-04-prelogin-matrix="P6-04-P0-17"',
    "Finance Day-1 P6-04 pre-login route matrix",
    "P6_04_PRELOGIN_READY / NO_GO / BLOCKED",
    "Record one P6-04 route/scope result",
    "Negative-control account must be BLOCKED/EMPTY_SCOPED_STATE",
    "item.rolloutOrder",
    "item.entryGate",
    "item.advanceGate",
    "item.accountLabel",
    "item.allowedBeforeFinanceLogin",
    "item.blockedBeforeFinanceLogin",
    "item.requiredResult",
    "item.stopCondition",
  ],
  "finance Day-1 P6-04 pre-login route matrix guard",
  onboardingPath,
);

requireAllText(
  onboarding,
  [
    "PRODUCTION_FINANCE_DAY_ONE_RUNBOOK",
    "PRODUCTION_FINANCE_DAY_ONE_RUN_STEPS",
    'data-heu-finance-day-one-run-rehearsal="P0-17-P6-04-P2-18-P5-03-P2-17"',
    "Finance Day-1 real-run rehearsal before expansion",
    "FIN_DAY1_READY / NO_GO / BLOCKED",
    "approved real-accounting account labels",
    "does not create accounts, approve access, accept",
    "move money or mark production GO",
    "step.requiredAction",
    "step.stopCondition",
  ],
  "finance Day-1 real-run rehearsal guard",
  onboardingPath,
);

requireAllText(
  onboarding,
  [
    "PRODUCTION_FINANCE_DAY_ONE_ACCOUNT_LANES",
    "PRODUCTION_FINANCE_DAY_ONE_RESULT_FIELDS",
    "PRODUCTION_FINANCE_DAY_ONE_RESULT_LEDGER_TEMPLATE",
    'data-heu-finance-day-one-result-ledger="P0-17-P6-04-P2-18-P5-03-P2-17"',
    "Finance Day-1 result ledger for real users",
    "FIN_DAY1_RESULT_READY / NO_GO / BLOCKED",
    "Record one controlled result row per approved account label and route",
    "does not approve",
    "access, accept UAT",
    "approve finance reliance",
    "lane.rolloutOrder",
    "lane.entryGate",
    "lane.advanceGate",
    "lane.accountLabel",
    "lane.requiredResult",
    "lane.stopCondition",
    "item.forbiddenContent",
  ],
  "finance Day-1 result ledger guard",
  onboardingPath,
);

requireAllText(
  onboarding,
  [
    'data-heu-real-user-access-closure="P0-17-P6-04"',
    "Real-user access closure after pilot/UAT",
    "USER-CLOSE-01",
    "USER-CLOSE-04",
    "ACCESS_RETAIN / REVOKE_OR_REDUCE / BLOCKED",
    "soft-revoke/INACTIVE",
    "passwords, temporary passwords",
    "account activation/invite links",
    "PRODUCTION_FINANCE_DAY_ONE_ACCESS_CLOSURE_LANES",
    'data-heu-finance-day-one-access-closure-lanes="P0-17-FIN-USER"',
    "Finance Day-1 sequential access closure lanes",
    "Close one `FIN-USER` lane at a time",
    "current lane has a",
    "controlled P0-17 closure decision",
    "lane.closureDecisionValue",
    "lane.retainCondition",
    "lane.reduceOrRevokeCondition",
    "lane.nextLaneGate",
  ],
  "real-user access closure guard and Finance Day-1 closure lanes",
  onboardingPath,
);

requireAllText(
  readinessSource,
  [
    "PRODUCTION_FINANCE_DAY_ONE_START_GATE_CHECKLIST",
    "HEU_FINANCE_DAY1_START_GATE_CHECKLIST_20260630.md",
    "export type ProductionFinanceDayOneStartGate",
    "export const PRODUCTION_FINANCE_DAY_ONE_START_GATES",
    "FIN-START-01",
    "P0-03 backup/restore evidence is accepted before real accounts",
    "FIN-START-05",
    "Human owner boundary is acknowledged",
    "FIN_START_READY",
    "create accounts, grant access, accept UAT, move money or mark production GO",
  ],
  "finance Day-1 start gates shared source",
  readinessPath,
);

requireAllText(
  readinessSource,
  [
    "PRODUCTION_FINANCE_DAY_ONE_ACCOUNT_ACTIVATION_TEMPLATE",
    "HEU_FINANCE_DAY1_ACCOUNT_ACTIVATION_TEMPLATE_20260630.md",
    "export type ProductionFinanceDayOneAccountActivationCheck",
    "export const PRODUCTION_FINANCE_DAY_ONE_ACCOUNT_ACTIVATION_CHECKS",
    "FIN-ACT-01",
    "Account label and owner are approved",
    "FIN-ACT-05",
    "P6-04 pre-login route check is recorded",
    "Password, temporary password, OTP, reset link, account invite/activation link",
  ],
  "finance Day-1 account activation handoff shared source",
  readinessPath,
);

requireAllText(
  readinessSource,
  [
    "PRODUCTION_FINANCE_DAY_ONE_P6_04_PRELOGIN_MATRIX",
    "HEU_FINANCE_DAY1_P6_04_PRELOGIN_MATRIX_20260630.md",
    "export type ProductionFinanceDayOnePreloginRouteCheck",
    "export const PRODUCTION_FINANCE_DAY_ONE_P6_04_PRELOGIN_CHECKS",
    "FIN-USER-01",
    "P6-04-PRELOGIN-01",
    "REAL_KHTC_TTGDTX_OPERATOR_01",
    "FIN-USER-05",
    "P6-04-PRELOGIN-05",
    "REAL_OUT_OF_SCOPE_NEGATIVE_01",
    "allowedBeforeFinanceLogin",
    "blockedBeforeFinanceLogin",
    "requiredResult",
    "BLOCKED or EMPTY_SCOPED_STATE",
    "negative-control account sees any protected route",
  ],
  "finance Day-1 P6-04 pre-login route matrix shared source",
  readinessPath,
);

requireAllText(
  readinessSource,
  [
    "PRODUCTION_FINANCE_DAY_ONE_RUNBOOK",
    "HEU_FINANCE_DAY1_REAL_RUN_REHEARSAL_20260630.md",
    "export const PRODUCTION_FINANCE_DAY_ONE_RUN_STEPS",
    "FIN-DAY1-01",
    "Secure account activation outside Codex",
    "FIN-DAY1-05",
    "Access closure before expansion",
    "FIN_DAY1_READY / NO_GO / BLOCKED",
    "Passwords, temporary passwords, OTPs, reset links",
    "blocked users keep active finance access",
  ],
  "finance Day-1 real-run rehearsal shared source",
  readinessPath,
);

requireAllText(
  readinessSource,
  [
    "PRODUCTION_FINANCE_DAY_ONE_RESULT_LEDGER_TEMPLATE",
    "HEU_FINANCE_DAY1_RESULT_LEDGER_TEMPLATE_20260630.md",
    "export type ProductionFinanceDayOneAccountLane",
    "export const PRODUCTION_FINANCE_DAY_ONE_ACCOUNT_LANES",
    "export const PRODUCTION_FINANCE_DAY_ONE_RESULT_FIELDS",
    "REAL_BGH_READONLY_01",
    "REAL_AUDIT_READONLY_01",
    "REAL_PHAP_CHE_REVIEW_01",
    "No skipped lane",
    "No next-lane access",
    "Evidence ID",
    "Owner decision",
    "FIN_DAY1_RESULT_READY",
    "Access closure",
    "No raw PII, CCCD, bank data, voucher body",
    "No password, OTP, invite/reset link",
  ],
  "finance Day-1 result ledger shared source",
  readinessPath,
);

requireAllText(
  readinessSource,
  [
    "export type ProductionFinanceDayOneAccessClosureLane",
    "closureDecisionValue",
    "retainCondition",
    "reduceOrRevokeCondition",
    "blockCondition",
    "nextLaneGate",
    "requiredProof",
    "export const PRODUCTION_FINANCE_DAY_ONE_ACCESS_CLOSURE_LANES",
    "FIN-DAY1-EVID-001",
    "FIN-DAY1-EVID-005",
    "ACCESS_RETAIN / REVOKE_OR_REDUCE / BLOCKED",
    "soft-revoke/INACTIVE proof",
    "Any department/user expansion starts before the negative-control closure decision is signed",
  ],
  "finance Day-1 sequential access closure shared source",
  readinessPath,
);

requireAllText(
  financeDayOneStartGateChecklist,
  [
    "Status: PASS_LOCAL_CHECKLIST",
    "FIN_START_READY / NO_GO / BLOCKED",
    "FIN-START-EVID-001",
    "FIN-START-EVID-005",
    "FIN-START-01",
    "FIN-START-05",
    "Do not paste or attach passwords",
    "does not create accounts",
    "send invites",
    "store passwords",
    "grant access",
    "execute UAT",
    "accept evidence",
    "approve finance reliance",
    "approve access closure",
    "move money",
    "issue bank instructions",
    "mark production GO",
    "Do not start `FIN-ACT-EVID-001`",
  ],
  "finance Day-1 start-gate checklist template",
  financeDayOneStartGateChecklistPath,
);

requireAllText(
  financeDayOneActivationTemplate,
  [
    "Status: PASS_LOCAL_TEMPLATE",
    "Production status: NO-GO",
    "Run one activation row at a time",
    "Rollout order",
    "Entry gate",
    "Advance gate",
    "FIN-USER-01",
    "FIN-USER-05",
    "REAL_KHTC_TTGDTX_OPERATOR_01",
    "REAL_BGH_READONLY_01",
    "REAL_AUDIT_READONLY_01",
    "REAL_PHAP_CHE_REVIEW_01",
    "REAL_OUT_OF_SCOPE_NEGATIVE_01",
    "FIN_ACTIVATION_READY / NO_GO / BLOCKED",
    "FIN-ACT-01",
    "FIN-ACT-05",
    "does not create accounts",
    "store passwords",
    "mark production GO",
    "Never paste or attach",
    "Do not open P2-18, P5-03 or P2-17",
    "Do not open the next `FIN-USER` lane",
    "Start Gates Before Any Invite/Create",
    "HEU_FINANCE_DAY1_START_GATE_CHECKLIST_20260630.md",
    "No invite, create or activation row may start",
    "P6-04 Pre-Login Matrix Handoff",
    "allowed route family",
    "blocked route family",
    "negative-control account",
  ],
  "finance Day-1 account activation handoff template",
  financeDayOneActivationTemplatePath,
);

requireAllText(
  financeDayOnePreloginMatrix,
  [
    "Status: PASS_LOCAL_TEMPLATE",
    "Production status: NO-GO",
    "P6_04_PRELOGIN_READY / NO_GO / BLOCKED",
    "Run one pre-login row at a time",
    "Rollout order",
    "Entry gate",
    "Advance gate",
    "FIN-USER-01",
    "FIN-USER-05",
    "REAL_KHTC_TTGDTX_OPERATOR_01",
    "REAL_BGH_READONLY_01",
    "REAL_AUDIT_READONLY_01",
    "REAL_PHAP_CHE_REVIEW_01",
    "REAL_OUT_OF_SCOPE_NEGATIVE_01",
    "P6-04-PRELOGIN-EVID-001",
    "P6-04-PRELOGIN-EVID-005",
    "does not create accounts",
    "store passwords",
    "move money",
    "mark production GO",
    "Do not open the next `FIN-USER` lane",
  ],
  "finance Day-1 P6-04 pre-login matrix template",
  financeDayOnePreloginMatrixPath,
);

requireAllText(
  financeDayOneRunbook,
  [
    "Status: PASS_LOCAL_RUNBOOK",
    "Production status: NO-GO",
    "Required Day-1 Accounts",
    "Rollout order",
    "Entry gate",
    "Advance gate",
    "Run one account lane at a time",
    "FIN-USER-01",
    "FIN-USER-05",
    "REAL_KHTC_TTGDTX_OPERATOR_01",
    "REAL_OUT_OF_SCOPE_NEGATIVE_01",
    "FIN-DAY1-01",
    "FIN-DAY1-05",
    "FIN_DAY1_READY / NO_GO / BLOCKED",
    "Do not paste or store",
    "Passwords, temporary passwords, OTPs, reset links or account invite links",
    "Do not expand from finance to the next department",
    "HEU_FINANCE_DAY1_ACCOUNT_ACTIVATION_TEMPLATE_20260630.md",
    "first real-accounting login",
    "secure invite/create state",
    "HEU profile link",
    "narrow business scope",
    "P6-04 pre-login result",
    "outside Git/Codex/chat",
    "HEU_FINANCE_DAY1_P6_04_PRELOGIN_MATRIX_20260630.md",
    "P6-04 Pre-Login Route Matrix",
    "ALLOWED",
    "BLOCKED",
    "EMPTY_SCOPED_STATE",
    "do not open P2-18, P5-03 or P2-17",
    "Day-1 Result Ledger",
    "HEU_FINANCE_DAY1_RESULT_LEDGER_TEMPLATE_20260630.md",
    "FIN-DAY1-EVID-001",
    "ACCESS_RETAIN",
    "REVOKE_OR_REDUCE",
    "Raw PII, CCCD, bank data, voucher body",
    "does not approve access, accept UAT, approve finance reliance, move money",
    "Sequential Access Closure Decision Queue",
    "Close each lane in order",
    "exact signed scope",
    "Do not open `FIN-USER-02` until signed",
    "Do not expand beyond Finance Day-1 until signed",
  ],
  "finance Day-1 real-run rehearsal runbook",
  financeDayOneRunbookPath,
);

requireAllText(
  financeDayOneLedgerTemplate,
  [
    "Status: PASS_LOCAL_TEMPLATE",
    "Production status: NO-GO",
    "Rollout order",
    "Entry gate",
    "Advance gate",
    "FIN-USER-01",
    "FIN-USER-05",
    "Run one rollout lane at a time",
    "Do not expand beyond Finance Day-1",
    "REAL_KHTC_TTGDTX_OPERATOR_01",
    "REAL_BGH_READONLY_01",
    "REAL_AUDIT_READONLY_01",
    "REAL_PHAP_CHE_REVIEW_01",
    "REAL_OUT_OF_SCOPE_NEGATIVE_01",
    "FIN_DAY1_RESULT_READY / NO_GO / BLOCKED",
    "ACCESS_RETAIN / REVOKE_OR_REDUCE / BLOCKED",
    "does not create accounts",
    "issue bank instructions",
    "mark production GO",
    "No raw screenshots",
    "Stop and Escalate",
    "Sequential Access Closure Decision Queue",
    "Each row must close before the next lane opens",
    "Do not open `FIN-USER-02` until signed",
    "Do not expand beyond Finance Day-1 until signed",
  ],
  "finance Day-1 result ledger and access closure template",
  financeDayOneLedgerTemplatePath,
);

if (!packageJson.scripts?.["audit:heu-user-account-security"]) {
  fail(`${packagePath}: missing audit:heu-user-account-security script`);
}

requireAllText(
  agents,
  ["Before any final handoff", "npm.cmd run audit:heu-user-account-security"],
  "final handoff user-account security audit command",
  agentsPath,
);

requireAllText(
  releaseGate,
  ["audit:heu-user-account-security", "user account temporary password", "security"],
  "release-gate user-account security audit coverage",
  releaseGatePath,
);

requireSection(implementationLog, "2026-06-29 - Real User Access Closure Guard", [
  "data-heu-real-user-access-closure=\"P0-17-P6-04\"",
  "real-user-onboarding-panel.tsx",
  "ACCESS_RETAIN",
  "REVOKE_OR_REDUCE",
  "BLOCKED",
  "P6-04",
  "P2-18",
  "P5-03",
  "soft-revoke",
  "INACTIVE",
  "does not create accounts",
  "revoke live users",
  "send passwords",
  "approve role scope",
  "accept UAT",
  "finance action",
  "mark production GO",
], logPath);

requireSection(implementationLog, "2026-06-29 - Real User Accounting Onboarding Guard", [
  "real-user-onboarding-panel.tsx",
  "UserAuthProfileLinkForm",
  "KHTC/BGH/Audit/Phap Che",
  "Out-of-scope negative account",
  "P6-04",
  "P2-18",
  "P5-03",
  "does not create production accounts",
  "send passwords",
  "approve role scope",
  "accept UAT",
  "approve finance action",
  "mark production GO",
], logPath);

requireSection(implementationLog, "2026-06-30 - Finance Day-1 Start Gate Evidence Checklist", [
  "HEU_FINANCE_DAY1_START_GATE_CHECKLIST_20260630.md",
  "PASS_LOCAL_CHECKLIST",
  "FIN-START-EVID-001",
  "FIN-START-EVID-005",
  "PRODUCTION_FINANCE_DAY_ONE_START_GATE_CHECKLIST",
  "does not create accounts",
  "send",
  "invites",
  "store passwords",
  "grant access",
  "execute UAT",
  "accept evidence",
  "approve finance reliance",
  "approve access closure",
  "move money",
  "mark production GO",
], logPath);

requireSection(implementationLog, "2026-06-30 - Finance Day-1 Start Gates Before Real Account Activation", [
  "PRODUCTION_FINANCE_DAY_ONE_START_GATES",
  "FIN-START-01",
  "FIN-START-05",
  "data-heu-finance-day-one-start-gates=\"P0-03_P0-10_P6-04_P0-14_P0-17\"",
  "data-ttgdtx-finance-day-one-start-gates=\"P0-03_P0-10_P6-04_P0-14_P0-17\"",
  "FIN_START_READY / NO_GO / BLOCKED",
  "does not create accounts",
  "send",
  "invites",
  "store passwords",
  "grant access",
  "execute UAT",
  "accept evidence",
  "approve finance reliance",
  "approve access closure",
  "move money",
  "mark production GO",
], logPath);

requireSection(implementationLog, "2026-06-30 - Finance Day-1 Account Activation Handoff", [
  "HEU_FINANCE_DAY1_ACCOUNT_ACTIVATION_TEMPLATE_20260630.md",
  "PRODUCTION_FINANCE_DAY_ONE_ACCOUNT_ACTIVATION_TEMPLATE",
  "PRODUCTION_FINANCE_DAY_ONE_ACCOUNT_ACTIVATION_CHECKS",
  "FIN-ACT-01 through FIN-ACT-05",
  "FIN_ACTIVATION_READY / NO_GO / BLOCKED",
  "does not create accounts",
  "send",
  "invites",
  "store passwords",
  "approve access",
  "mark production GO",
], logPath);

requireSection(implementationLog, "2026-06-30 - Finance Day-1 P6-04 Pre-Login Matrix", [
  "HEU_FINANCE_DAY1_P6_04_PRELOGIN_MATRIX_20260630.md",
  "PRODUCTION_FINANCE_DAY_ONE_P6_04_PRELOGIN_MATRIX",
  "PRODUCTION_FINANCE_DAY_ONE_P6_04_PRELOGIN_CHECKS",
  "P6-04-PRELOGIN-01",
  "P6-04-PRELOGIN-05",
  "REAL_KHTC_TTGDTX_OPERATOR_01",
  "REAL_OUT_OF_SCOPE_NEGATIVE_01",
  "P6_04_PRELOGIN_READY / NO_GO / BLOCKED",
  "does not create accounts",
  "send",
  "invites",
  "store passwords",
  "execute UAT",
  "grant access",
  "accept route evidence",
  "approve finance action",
  "move money",
  "mark production GO",
], logPath);

requireSection(implementationLog, "2026-06-30 - Finance Day-1 Result Ledger Guard", [
  "PRODUCTION_FINANCE_DAY_ONE_ACCOUNT_LANES",
  "PRODUCTION_FINANCE_DAY_ONE_RESULT_FIELDS",
  "data-heu-finance-day-one-result-ledger=\"P0-17-P6-04-P2-18-P5-03-P2-17\"",
  "REAL_KHTC_TTGDTX_OPERATOR_01",
  "REAL_OUT_OF_SCOPE_NEGATIVE_01",
  "FIN_DAY1_RESULT_READY / NO_GO / BLOCKED",
  "does not create accounts",
  "send passwords",
  "grant access",
  "accept UAT",
  "approve finance action",
  "mark production GO",
], logPath);

requireSection(implementationLog, "2026-06-30 - Finance Day-1 Sequential Real User Rollout", [
  "PRODUCTION_FINANCE_DAY_ONE_ACCOUNT_LANES",
  "rolloutOrder",
  "entryGate",
  "advanceGate",
  "FIN-USER-01",
  "FIN-USER-05",
  "one account lane at a time",
  "controlled result row",
  "P0-17 access closure",
  "does not create accounts",
  "send invites",
  "store passwords",
  "grant access",
  "execute UAT",
  "accept evidence",
  "approve finance reliance",
  "approve access closure",
  "expand departments or users",
  "move money",
  "mark production GO",
], logPath);

requireSection(implementationLog, "2026-06-30 - Finance Day-1 Sequential Access Closure Lanes", [
  "PRODUCTION_FINANCE_DAY_ONE_ACCESS_CLOSURE_LANES",
  "closureDecisionValue",
  "retainCondition",
  "reduceOrRevokeCondition",
  "blockCondition",
  "nextLaneGate",
  "HEU_FINANCE_DAY1_RESULT_LEDGER_TEMPLATE_20260630.md",
  "HEU_FINANCE_DAY1_REAL_RUN_REHEARSAL_20260630.md",
  "ACCESS_RETAIN",
  "REVOKE_OR_REDUCE",
  "BLOCKED",
  "does not create accounts",
  "send invites",
  "store passwords",
  "grant access",
  "revoke live users",
  "execute UAT",
  "accept evidence",
  "approve finance reliance",
  "approve access closure",
  "expand departments or users",
  "move money",
  "mark production GO",
], logPath);

requireSection(implementationLog, "2026-06-28 - Current State User Account Security Alignment", [
  "HEU_CURRENT_STATE_INVENTORY.md",
  "HEU_SYSTEM_BUILD_BACKLOG.md",
  "M02/role-workspace scope",
  "user account temporary password guard",
  "audit-heu-current-state-inventory.mjs",
  "audit-heu-implementation-log.mjs",
  "release-gate audits",
  "current-state/backlog alignment only",
  "does not create accounts",
  "send passwords",
  "approve role scope",
  "mark production GO",
], logPath);

requireSection(implementationLog, "2026-07-02 - P0-17 User Account Security Audit Fast Guard", [
  "audit-heu-user-account-security.mjs",
  "regex-heavy lookahead checks",
  "token-based checks",
  "P0-17",
  "P6-04",
  "Finance Day-1",
  "audit:heu-user-account-security",
  "audit:heu-implementation-log",
  "does not create",
  "accounts",
  "send invites",
  "store passwords",
  "grant access",
  "execute UAT",
  "accept",
  "evidence",
  "approve finance action",
  "approve owner GO/NO-GO",
  "mark production GO",
], logPath);

requireSection(implementationLog, "2026-07-02 - Finance Day-1 Manual Auth Link Guard", [
  "user-auth-profile-link-form.tsx",
  "data-heu-finance-day-one-manual-auth-link=\"P0-17-P6-04\"",
  "FIN_MANUAL_LINK_READY / NO_GO / BLOCKED",
  "FIN-LINK-01",
  "FIN-LINK-04",
  "REAL_KHTC_TTGDTX_OPERATOR_01",
  "P6-04",
  "P2-18",
  "P5-03",
  "P2-17",
  "does not create",
  "real accounts",
  "collect credentials",
  "send invites",
  "store passwords",
  "grant access",
  "execute UAT",
  "accept evidence",
  "approve finance reliance",
  "approve owner GO/NO-GO",
  "mark production GO",
], logPath);

requireSection(implementationLog, "2026-07-02 - P0-17 Auth User Profile Link Fallback", [
  "app/settings/actions.ts",
  "already exists in Supabase Auth",
  "upserts `users_profile`",
  "components/settings/user-create-form.tsx",
  "components/settings/user-auth-profile-link-form.tsx",
  "components/settings/user-business-scope-settings.tsx",
  "same-department head",
  "same-department users",
  "ADMIN/BGH/lead roles",
  "Standardized Settings Vietnamese copy",
  "trưởng nhóm",
  "scripts/audit-heu-user-account-security.mjs",
  "database/step113_department_head_roles.sql",
  "CTHSSV_LEAD",
  "ACCOUNTING_LEAD",
  "does not expose passwords",
  "send reset/invite links",
  "approve UAT",
  "approve finance reliance",
  "approve migration order",
  "mark production GO",
], logPath);

if (failures.length > 0) {
  console.error("HEU user-account security audit failed.");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(
  "HEU user-account security audit passed. Temporary password and real-user onboarding handling are guarded.",
);
