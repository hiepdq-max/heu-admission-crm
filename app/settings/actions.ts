"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { allPermissions } from "@/lib/permissions";

function textValue(formData: FormData, key: string) {
  const value = String(formData.get(key) ?? "").trim();
  return value.length > 0 ? value : null;
}

const allowedLeadVisibility = new Set(["OWN", "TEAM", "DEPARTMENT", "ALL"]);
const createUserPermission = "users.create";
const userManagePermission = "users.manage";
const positionMatrixManagePermission = "permission_matrix.manage";
const privilegedUserRoleCodes = new Set(["ADMIN", "BGH"]);
const unsafeTemporaryPasswords = new Set([
  "12345678",
  "123456789",
  "1234567890",
  "admin123",
  "admin1234",
  "changeme",
  "heu123456",
  "password",
  "password123",
  "qwerty123",
  "welcome1",
]);

type AdminClient = ReturnType<typeof createAdminClient>;
type SettingsReturnPath = "/settings" | "/settings/scopes";

function settingsReturnPath(value: string | null): SettingsReturnPath {
  return value === "/settings/scopes" ? "/settings/scopes" : "/settings";
}

async function requireSettingsAuthenticatedUser(
  supabase: Awaited<ReturnType<typeof createClient>>,
) {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login");
  }

  return user;
}

function normalizePasswordSignal(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function isUnsafeTemporaryPassword(
  password: string,
  email: string,
  fullName: string,
) {
  const normalizedPassword = normalizePasswordSignal(password);
  const emailLocalPart = normalizePasswordSignal(email.split("@")[0] ?? "");
  const nameParts = fullName
    .split(/\s+/)
    .map(normalizePasswordSignal)
    .filter((part) => part.length >= 4);

  return (
    unsafeTemporaryPasswords.has(normalizedPassword) ||
    /^(.)\1{7,}$/.test(password) ||
    (emailLocalPart.length >= 4 && normalizedPassword.includes(emailLocalPart)) ||
    nameParts.some((part) => normalizedPassword.includes(part))
  );
}

function isMissingRolePermissionSoftRevokeMigration(message: string) {
  const normalizedMessage = message.toLowerCase();

  return (
    normalizedMessage.includes("role_permissions") &&
    (normalizedMessage.includes("status") ||
      normalizedMessage.includes("assigned_by") ||
      normalizedMessage.includes("revoked_by") ||
      normalizedMessage.includes("revoked_at")) &&
    (normalizedMessage.includes("could not find") ||
      normalizedMessage.includes("does not exist") ||
      normalizedMessage.includes("schema cache") ||
      normalizedMessage.includes("column"))
  );
}

function isExistingAuthUserError(message: string) {
  const normalizedMessage = message.toLowerCase();

  return (
    normalizedMessage.includes("already been registered") ||
    normalizedMessage.includes("already registered") ||
    normalizedMessage.includes("already exists") ||
    normalizedMessage.includes("user already")
  );
}

async function findAuthUserIdByEmail(adminClient: AdminClient, email: string) {
  const normalizedEmail = email.toLowerCase();

  for (let page = 1; page <= 20; page += 1) {
    const { data, error } = await adminClient.auth.admin.listUsers({
      page,
      perPage: 100,
    });

    if (error) {
      throw new Error("auth_user_lookup_failed");
    }

    const match = data.users.find(
      (authUser) => authUser.email?.toLowerCase() === normalizedEmail,
    );

    if (match) {
      return match.id;
    }

    if (data.users.length < 100) {
      break;
    }
  }

  return null;
}

async function upsertUserProfileForAuthUser(
  adminClient: AdminClient,
  input: {
    id: string;
    email: string;
    fullName: string;
    phone: string | null;
    roleId: string;
    departmentId: string | null;
    managerId: string | null;
  },
) {
  return adminClient.from("users_profile").upsert(
    {
      id: input.id,
      email: input.email,
      full_name: input.fullName,
      phone: input.phone,
      role_id: input.roleId,
      department_id: input.departmentId,
      manager_id: input.managerId,
      status: "ACTIVE",
    },
    { onConflict: "id" },
  );
}

async function requirePositionMatrixManage(returnPath: SettingsReturnPath) {
  const supabase = await createClient();
  await requireSettingsAuthenticatedUser(supabase);

  const [{ data: currentRoleCode }, { data: canManagePositionMatrix }] =
    await Promise.all([
      supabase.rpc("current_user_role_code"),
      supabase.rpc("has_permission", {
        permission_name: positionMatrixManagePermission,
      }),
    ]);

  if (currentRoleCode !== "ADMIN" && !canManagePositionMatrix) {
    redirect(`${returnPath}?error=not_allowed_position_assignment`);
  }

  return { supabase };
}

async function requireUserCredentialManage(returnPath: SettingsReturnPath) {
  const supabase = await createClient();
  await requireSettingsAuthenticatedUser(supabase);

  const [
    { data: currentRoleCode },
    { data: canCreateUser },
    { data: canManageUsers },
  ] = await Promise.all([
    supabase.rpc("current_user_role_code"),
    supabase.rpc("has_permission", {
      permission_name: createUserPermission,
    }),
    supabase.rpc("has_permission", {
      permission_name: userManagePermission,
    }),
  ]);

  if (currentRoleCode !== "ADMIN" && !canCreateUser && !canManageUsers) {
    redirect(`${returnPath}?error=not_allowed_create_user`);
  }

  return { supabase, currentRoleCode };
}

async function loadProfileForEmail(
  supabase: Awaited<ReturnType<typeof createClient>>,
  email: string,
) {
  return supabase
    .from("users_profile")
    .select("id,email,full_name,role_id,roles(code)")
    .eq("email", email)
    .maybeSingle<{
      id: string;
      email: string;
      full_name: string;
      role_id: string | null;
      roles: { code: string } | null;
    }>();
}

export async function assignHeuPositionByEmailAction(formData: FormData) {
  const returnPath = settingsReturnPath(textValue(formData, "return_to"));
  const positionCode = normalizeMasterCode(textValue(formData, "position_code"));
  const email = textValue(formData, "email")?.toLowerCase();
  const note = textValue(formData, "assignment_note");
  const { supabase } = await requirePositionMatrixManage(returnPath);

  if (!positionCode || !email) {
    redirect(`${returnPath}?error=missing_position_assignment_data`);
  }

  const { error } = await supabase.rpc("assign_heu_position_by_email", {
    target_position_code: positionCode,
    target_email: email,
    target_note: note,
  });

  if (error) {
    redirect(`${returnPath}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/settings");
  revalidatePath("/settings/scopes");
  redirect(`${returnPath}?position_assigned=1#position-matrix`);
}

export async function setUserTemporaryPasswordAction(formData: FormData) {
  const returnPath = settingsReturnPath(textValue(formData, "return_to"));
  const email = textValue(formData, "email")?.toLowerCase();
  const password = textValue(formData, "password");
  const { supabase, currentRoleCode } =
    await requireUserCredentialManage(returnPath);

  if (!email || !password) {
    redirect(`${returnPath}?error=missing_password_reset_data`);
  }

  const { data: profile, error: profileError } = await loadProfileForEmail(
    supabase,
    email,
  );

  if (profileError) {
    redirect(`${returnPath}?error=${encodeURIComponent(profileError.message)}`);
  }

  if (!profile) {
    redirect(`${returnPath}?error=missing_password_user`);
  }

  const targetRoleCode = profile.roles?.code ?? "";

  if (
    currentRoleCode !== "ADMIN" &&
    privilegedUserRoleCodes.has(targetRoleCode)
  ) {
    redirect(`${returnPath}?error=not_allowed_create_privileged_user`);
  }

  if (password.length < 8) {
    redirect(`${returnPath}?error=weak_password`);
  }

  if (isUnsafeTemporaryPassword(password, email, profile.full_name)) {
    redirect(`${returnPath}?error=unsafe_temporary_password`);
  }

  let adminClient: AdminClient;

  try {
    adminClient = createAdminClient();
  } catch {
    redirect(`${returnPath}?error=missing_service_role_key`);
  }

  let authUserId: string | null = null;

  try {
    authUserId = await findAuthUserIdByEmail(adminClient, email);
  } catch {
    redirect(`${returnPath}?error=auth_user_lookup_failed`);
  }

  if (!authUserId) {
    redirect(`${returnPath}?error=auth_user_exists_but_not_found`);
  }

  const { error } = await adminClient.auth.admin.updateUserById(authUserId, {
    password,
  });

  if (error) {
    redirect(`${returnPath}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/settings");
  revalidatePath("/settings/scopes");
  redirect(`${returnPath}?password_updated=1#position-password`);
}

export async function sendUserPasswordResetEmailAction(formData: FormData) {
  const returnPath = settingsReturnPath(textValue(formData, "return_to"));
  const email = textValue(formData, "email")?.toLowerCase();
  const { supabase, currentRoleCode } =
    await requireUserCredentialManage(returnPath);

  if (!email) {
    redirect(`${returnPath}?error=missing_password_reset_data`);
  }

  const { data: profile, error: profileError } = await loadProfileForEmail(
    supabase,
    email,
  );

  if (profileError) {
    redirect(`${returnPath}?error=${encodeURIComponent(profileError.message)}`);
  }

  if (!profile) {
    redirect(`${returnPath}?error=missing_password_user`);
  }

  const targetRoleCode = profile.roles?.code ?? "";

  if (
    currentRoleCode !== "ADMIN" &&
    privilegedUserRoleCodes.has(targetRoleCode)
  ) {
    redirect(`${returnPath}?error=not_allowed_create_privileged_user`);
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email);

  if (error) {
    redirect(`${returnPath}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/settings");
  revalidatePath("/settings/scopes");
  redirect(`${returnPath}?password_email_sent=1#position-password`);
}

export async function updateUserProfileAction(formData: FormData) {
  const supabase = await createClient();
  const user = await requireSettingsAuthenticatedUser(supabase);

  const targetUserId = textValue(formData, "user_id");
  const roleId = textValue(formData, "role_id");
  const departmentId = textValue(formData, "department_id");
  const managerId = textValue(formData, "manager_id");
  const status = String(formData.get("status") ?? "ACTIVE");
  const requestedReturnTo = textValue(formData, "return_to");
  const returnPath =
    requestedReturnTo === "/settings/scopes" ? "/settings/scopes" : "/settings";

  if (!targetUserId || !roleId) {
    redirect(`${returnPath}?error=missing_user_or_role`);
  }

  if (!["ACTIVE", "INACTIVE"].includes(status)) {
    redirect(`${returnPath}?error=invalid_status`);
  }

  if (managerId && managerId === targetUserId) {
    redirect(`${returnPath}?error=invalid_manager`);
  }

  const { data: currentProfile } = await supabase
    .from("users_profile")
    .select("role_id")
    .eq("id", user.id)
    .maybeSingle();

  const { data: currentRole } = currentProfile?.role_id
    ? await supabase
        .from("roles")
        .select("code")
        .eq("id", currentProfile.role_id)
        .maybeSingle()
    : { data: null };

  if (currentRole?.code !== "ADMIN") {
    redirect(`${returnPath}?error=not_admin`);
  }

  const { data: nextRole } = await supabase
    .from("roles")
    .select("code")
    .eq("id", roleId)
    .maybeSingle();

  if (targetUserId === user.id && (status !== "ACTIVE" || nextRole?.code !== "ADMIN")) {
    redirect(`${returnPath}?error=cannot_lock_self`);
  }

  const { error } = await supabase
    .from("users_profile")
    .update({
      role_id: roleId,
      department_id: departmentId,
      manager_id: managerId,
      status,
    })
    .eq("id", targetUserId);

  if (error) {
    redirect(`${returnPath}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/settings");
  revalidatePath("/settings/scopes");
  redirect(`${returnPath}?updated=1`);
}

export async function createUserAccountAction(formData: FormData) {
  const supabase = await createClient();
  await requireSettingsAuthenticatedUser(supabase);

  const requestedReturnTo = textValue(formData, "return_to");
  const returnPath =
    requestedReturnTo === "/settings/scopes" ? "/settings/scopes" : "/settings";
  const email = textValue(formData, "email")?.toLowerCase();
  const fullName = textValue(formData, "full_name");
  const phone = textValue(formData, "phone");
  const password = textValue(formData, "password");
  const roleId = textValue(formData, "role_id");
  const departmentId = textValue(formData, "department_id");
  const managerId = textValue(formData, "manager_id");

  const { data: currentRoleCode } = await supabase.rpc(
    "current_user_role_code",
  );
  const canCreateUser =
    currentRoleCode === "ADMIN" ||
    Boolean(
      (
        await supabase.rpc("has_permission", {
          permission_name: createUserPermission,
        })
      ).data,
    );

  if (!canCreateUser) {
    redirect(`${returnPath}?error=not_allowed_create_user`);
  }

  if (!email || !fullName || !password || !roleId) {
    redirect(`${returnPath}?error=missing_new_user_data`);
  }

  const { data: targetRole } = await supabase
    .from("roles")
    .select("code")
    .eq("id", roleId)
    .maybeSingle();

  if (!targetRole) {
    redirect(`${returnPath}?error=missing_role`);
  }

  if (
    currentRoleCode !== "ADMIN" &&
    privilegedUserRoleCodes.has(targetRole.code)
  ) {
    redirect(`${returnPath}?error=not_allowed_create_privileged_user`);
  }

  if (password.length < 8) {
    redirect(`${returnPath}?error=weak_password`);
  }

  if (isUnsafeTemporaryPassword(password, email, fullName)) {
    redirect(`${returnPath}?error=unsafe_temporary_password`);
  }

  let adminClient: AdminClient;

  try {
    adminClient = createAdminClient();
  } catch {
    redirect(`${returnPath}?error=missing_service_role_key`);
  }

  const { data: createdUser, error: createError } =
    await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
      },
    });

  let authUserId = createdUser.user?.id ?? null;
  let createdAuthUser = Boolean(authUserId);
  let linkedExistingAuthUser = false;

  if (createError || !authUserId) {
    if (createError && isExistingAuthUserError(createError.message)) {
      try {
        authUserId = await findAuthUserIdByEmail(adminClient, email);
      } catch {
        redirect(`${returnPath}?error=auth_user_lookup_failed`);
      }

      if (!authUserId) {
        redirect(`${returnPath}?error=auth_user_exists_but_not_found`);
      }

      createdAuthUser = false;
      linkedExistingAuthUser = true;
    } else {
      redirect(
        `${returnPath}?error=${encodeURIComponent(
          createError?.message ?? "Không tạo được tài khoản Auth.",
        )}`,
      );
    }
  }

  const { error: profileError } = await upsertUserProfileForAuthUser(
    adminClient,
    {
      id: authUserId,
      email,
      fullName,
      phone,
      roleId,
      departmentId,
      managerId,
    },
  );

  if (profileError) {
    let cleanupMessage = profileError.message;

    if (createdAuthUser) {
      const { error: cleanupError } = await adminClient.auth.admin.deleteUser(
        authUserId,
      );

      cleanupMessage = cleanupError
        ? `${profileError.message} Auth cleanup failed: ${cleanupError.message}`
        : profileError.message;
    }

    redirect(`${returnPath}?error=${encodeURIComponent(cleanupMessage)}`);
  }

  revalidatePath("/settings");
  revalidatePath("/settings/scopes");
  redirect(
    linkedExistingAuthUser
      ? `${returnPath}?profile_linked=1&auth_user_existing=1`
      : `${returnPath}?user_created=1`,
  );
}

export async function linkAuthUserProfileAction(formData: FormData) {
  const supabase = await createClient();
  await requireSettingsAuthenticatedUser(supabase);

  const requestedReturnTo = textValue(formData, "return_to");
  const returnPath =
    requestedReturnTo === "/settings/scopes" ? "/settings/scopes" : "/settings";
  const email = textValue(formData, "email")?.toLowerCase();
  const fullName = textValue(formData, "full_name");
  const phone = textValue(formData, "phone");
  const roleId = textValue(formData, "role_id");
  const departmentId = textValue(formData, "department_id");
  const managerId = textValue(formData, "manager_id");

  const { data: currentRoleCode } = await supabase.rpc(
    "current_user_role_code",
  );

  if (currentRoleCode !== "ADMIN") {
    redirect(`${returnPath}?error=not_admin`);
  }

  if (!email || !fullName || !roleId) {
    redirect(`${returnPath}?error=missing_auth_link_data`);
  }

  const { error } = await supabase.rpc("upsert_user_profile_from_auth", {
    target_email: email,
    target_full_name: fullName,
    target_phone: phone,
    target_role_id: roleId,
    target_department_id: departmentId,
    target_manager_id: managerId,
  });

  if (error) {
    const message = error.message.includes("function")
      ? "Chưa chạy SQL database/step39_user_profile_admin_tools.sql."
      : error.message;

    redirect(`${returnPath}?error=${encodeURIComponent(message)}`);
  }

  revalidatePath("/settings");
  revalidatePath("/settings/scopes");
  redirect(`${returnPath}?profile_linked=1`);
}

export async function updateRolePermissionsAction(formData: FormData) {
  const supabase = await createClient();
  const user = await requireSettingsAuthenticatedUser(supabase);

  const { data: currentRoleCode } = await supabase.rpc(
    "current_user_role_code",
  );

  if (currentRoleCode !== "ADMIN") {
    redirect("/settings?error=not_admin");
  }

  const roleId = textValue(formData, "role_id");

  if (!roleId) {
    redirect("/settings?error=missing_role");
  }

  const { data: targetRole } = await supabase
    .from("roles")
    .select("code")
    .eq("id", roleId)
    .maybeSingle();

  if (!targetRole) {
    redirect("/settings?error=missing_role");
  }

  const allowedPermissions = new Set(allPermissions);
  const selectedPermissions = new Set(
    formData
      .getAll("permissions")
      .map((permission) => String(permission))
      .filter((permission) => allowedPermissions.has(permission)),
  );

  if (targetRole.code === "ADMIN") {
    selectedPermissions.add("system.manage");
    selectedPermissions.add("users.manage");
    selectedPermissions.add(createUserPermission);
  }

  const permissionUpdateAt = new Date().toISOString();
  const permissionUpdateNote = `[${permissionUpdateAt}] Role permissions updated from settings by ${user.id}.`;

  const { error: revokeError } = await supabase
    .from("role_permissions")
    .update({
      status: "INACTIVE",
      revoked_by: user.id,
      revoked_at: permissionUpdateAt,
      note: permissionUpdateNote,
    })
    .eq("role_id", roleId)
    .neq("status", "INACTIVE");

  if (revokeError) {
    if (isMissingRolePermissionSoftRevokeMigration(revokeError.message)) {
      redirect("/settings?error=role_permission_soft_revoke_migration_required");
    }

    redirect(`/settings?error=${encodeURIComponent(revokeError.message)}`);
  }

  const rows = [...selectedPermissions].map((permission) => ({
    role_id: roleId,
    permission,
    status: "ACTIVE",
    assigned_by: user.id,
    revoked_by: null,
    revoked_at: null,
    note: permissionUpdateNote,
  }));

  if (rows.length > 0) {
    const { error: insertError } = await supabase
      .from("role_permissions")
      .upsert(rows, { onConflict: "role_id,permission" });

    if (insertError) {
      if (isMissingRolePermissionSoftRevokeMigration(insertError.message)) {
        redirect("/settings?error=role_permission_soft_revoke_migration_required");
      }

      redirect(`/settings?error=${encodeURIComponent(insertError.message)}`);
    }
  }

  revalidatePath("/settings");
  redirect("/settings?permissions_updated=1");
}

export async function updateUserBusinessScopesAction(formData: FormData) {
  const supabase = await createClient();
  const user = await requireSettingsAuthenticatedUser(supabase);

  const requestedReturnTo = textValue(formData, "return_to");
  const returnPath =
    requestedReturnTo === "/settings/scopes" ? "/settings/scopes" : "/settings";
  const targetUserId = textValue(formData, "user_id");
  const leadVisibility = String(formData.get("lead_visibility") ?? "OWN");

  if (!targetUserId) {
    redirect(`${returnPath}?error=missing_user`);
  }

  if (!allowedLeadVisibility.has(leadVisibility)) {
    redirect(`${returnPath}?error=invalid_lead_visibility`);
  }

  const { data: canManage, error: canManageError } = await supabase.rpc(
    "can_manage_user_scope",
    { target_user_id: targetUserId },
  );

  if (canManageError) {
    redirect(`${returnPath}?error=${encodeURIComponent(canManageError.message)}`);
  }

  if (!canManage) {
    redirect(`${returnPath}?error=not_allowed_scope`);
  }

  const { data: currentRoleCode } = await supabase.rpc(
    "current_user_role_code",
  );

  if (leadVisibility === "ALL" && currentRoleCode !== "ADMIN") {
    redirect(`${returnPath}?error=lead_visibility_all_admin_only`);
  }

  const segmentIds = Array.from(
    new Set(
      formData
        .getAll("segment_ids")
        .map((value) => String(value))
        .filter(Boolean),
    ),
  );
  const partnerIds = Array.from(
    new Set(
      formData
        .getAll("partner_ids")
        .map((value) => String(value))
        .filter(Boolean),
    ),
  );
  const scopeUpdateNote = `[${new Date().toISOString()}] Updated from settings scope form by ${user.id}.`;

  const { error: segmentArchiveError } = await supabase
    .from("user_admission_segment_scopes")
    .update({
      status: "INACTIVE",
      assigned_by: user.id,
      note: scopeUpdateNote,
    })
    .eq("user_id", targetUserId)
    .neq("status", "INACTIVE");

  if (segmentArchiveError) {
    redirect(`${returnPath}?error=${encodeURIComponent(segmentArchiveError.message)}`);
  }

  const { error: partnerArchiveError } = await supabase
    .from("user_partner_scopes")
    .update({
      status: "INACTIVE",
      assigned_by: user.id,
      note: scopeUpdateNote,
    })
    .eq("user_id", targetUserId)
    .neq("status", "INACTIVE");

  if (partnerArchiveError) {
    redirect(`${returnPath}?error=${encodeURIComponent(partnerArchiveError.message)}`);
  }

  if (segmentIds.length > 0) {
    const { error: segmentInsertError } = await supabase
      .from("user_admission_segment_scopes")
      .upsert(
        segmentIds.map((segmentId) => ({
          user_id: targetUserId,
          segment_id: segmentId,
          assigned_by: user.id,
          status: "ACTIVE",
          note: scopeUpdateNote,
        })),
        { onConflict: "user_id,segment_id" },
      );

    if (segmentInsertError) {
      redirect(
        `${returnPath}?error=${encodeURIComponent(segmentInsertError.message)}`,
      );
    }
  }

  if (partnerIds.length > 0) {
    const { error: partnerInsertError } = await supabase
      .from("user_partner_scopes")
      .upsert(
        partnerIds.map((partnerId) => ({
          user_id: targetUserId,
          partner_id: partnerId,
          assigned_by: user.id,
          status: "ACTIVE",
          note: scopeUpdateNote,
        })),
        { onConflict: "user_id,partner_id" },
      );

    if (partnerInsertError) {
      redirect(
        `${returnPath}?error=${encodeURIComponent(partnerInsertError.message)}`,
      );
    }
  }

  const { error: leadVisibilityError } = await supabase
    .from("user_lead_visibility_scopes")
    .upsert(
      {
        user_id: targetUserId,
        lead_visibility: leadVisibility,
        assigned_by: user.id,
        status: "ACTIVE",
      },
      { onConflict: "user_id" },
    );

  if (leadVisibilityError) {
    const message = leadVisibilityError.message.includes(
      "user_lead_visibility_scopes",
    )
      ? "Chua chay SQL database/step40_user_lead_visibility.sql."
      : leadVisibilityError.message;

    redirect(`${returnPath}?error=${encodeURIComponent(message)}`);
  }

  revalidatePath("/settings");
  revalidatePath("/settings/scopes");
  redirect(`${returnPath}?scopes_updated=1`);
}

function normalizeDocumentCode(value: string | null) {
  return value
    ?.trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function normalizeSourceCode(value: string | null) {
  return value
    ?.trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function normalizeMasterCode(value: string | null) {
  return value
    ?.trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function normalizeFieldKey(value: string | null) {
  return value
    ?.trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function numberValue(formData: FormData, key: string) {
  const value = Number(formData.get(key));
  return Number.isFinite(value) ? value : 0;
}

async function requireAdmissionConfigManage(returnPath = "/settings") {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [
    { data: currentRoleCode },
    { data: canManageSettings },
    { data: canManageAdmissionConfig },
  ] = await Promise.all([
    supabase.rpc("current_user_role_code"),
    supabase.rpc("has_permission", { permission_name: "settings.manage" }),
    supabase.rpc("has_permission", {
      permission_name: "admission_config.manage",
    }),
  ]);

  if (
    currentRoleCode !== "ADMIN" &&
    !canManageSettings &&
    !canManageAdmissionConfig
  ) {
    redirect(`${returnPath}?error=not_allowed_admission_config`);
  }

  return { supabase, user };
}

function revalidateAdmissionConfigPaths() {
  revalidatePath("/settings");
  revalidatePath("/leads");
  revalidatePath("/leads/new");
  revalidatePath("/import");
  revalidatePath("/pipeline");
  revalidatePath("/reports");
}

export async function createChecklistItemAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const documentCode = normalizeDocumentCode(textValue(formData, "document_code"));
  const documentName = textValue(formData, "document_name");

  if (!documentCode || !documentName) {
    redirect("/settings?error=missing_checklist_data");
  }

  const { data: existingChecklist } = await supabase
    .from("enrollment_checklists")
    .select("id")
    .eq("document_code", documentCode)
    .maybeSingle();

  if (existingChecklist) {
    redirect("/settings?error=duplicate_checklist_code");
  }

  const { error } = await supabase.from("enrollment_checklists").insert({
    document_code: documentCode,
    document_name: documentName,
    is_required: formData.get("is_required") === "on",
    applies_to_program: textValue(formData, "applies_to_program"),
    sort_order: numberValue(formData, "sort_order"),
    status: String(formData.get("status") ?? "ACTIVE"),
  });

  if (error) {
    redirect(`/settings?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/settings");
  redirect("/settings?checklist_created=1");
}

export async function updateChecklistItemAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const checklistId = textValue(formData, "checklist_id");
  const documentName = textValue(formData, "document_name");
  const status = String(formData.get("status") ?? "ACTIVE");

  if (!checklistId || !documentName) {
    redirect("/settings?error=missing_checklist_data");
  }

  if (!["ACTIVE", "INACTIVE"].includes(status)) {
    redirect("/settings?error=invalid_status");
  }

  const { error } = await supabase
    .from("enrollment_checklists")
    .update({
      document_name: documentName,
      is_required: formData.get("is_required") === "on",
      applies_to_program: textValue(formData, "applies_to_program"),
      sort_order: numberValue(formData, "sort_order"),
      status,
    })
    .eq("id", checklistId);

  if (error) {
    redirect(`/settings?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/settings");
  redirect("/settings?checklist_updated=1");
}

export async function createLeadSourceAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const sourceCode = normalizeSourceCode(textValue(formData, "source_code"));
  const sourceName = textValue(formData, "source_name");
  const sourceGroup = textValue(formData, "source_group");

  if (!sourceCode || !sourceName || !sourceGroup) {
    redirect("/settings?error=missing_source_data");
  }

  const { data: existingSource } = await supabase
    .from("lead_sources")
    .select("id")
    .eq("source_code", sourceCode)
    .maybeSingle();

  if (existingSource) {
    redirect("/settings?error=duplicate_source_code");
  }

  const { error } = await supabase.from("lead_sources").insert({
    source_code: sourceCode,
    source_name: sourceName,
    source_group: sourceGroup,
    status: String(formData.get("status") ?? "ACTIVE"),
  });

  if (error) {
    redirect(`/settings?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/settings");
  revalidatePath("/leads/new");
  revalidatePath("/campaigns/new");
  revalidatePath("/import");
  redirect("/settings?source_created=1");
}

export async function updateLeadSourceAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const sourceId = textValue(formData, "source_id");
  const sourceName = textValue(formData, "source_name");
  const sourceGroup = textValue(formData, "source_group");
  const status = String(formData.get("status") ?? "ACTIVE");

  if (!sourceId || !sourceName || !sourceGroup) {
    redirect("/settings?error=missing_source_data");
  }

  if (!["ACTIVE", "INACTIVE"].includes(status)) {
    redirect("/settings?error=invalid_status");
  }

  const { error } = await supabase
    .from("lead_sources")
    .update({
      source_name: sourceName,
      source_group: sourceGroup,
      status,
    })
    .eq("id", sourceId);

  if (error) {
    redirect(`/settings?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/settings");
  revalidatePath("/leads/new");
  revalidatePath("/campaigns/new");
  revalidatePath("/import");
  redirect("/settings?source_updated=1");
}

export async function createAdmissionFlowAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const flowCode = normalizeMasterCode(textValue(formData, "flow_code"));
  const flowName = textValue(formData, "flow_name");
  const shortDescription = textValue(formData, "short_description");
  const ownerDepartment = textValue(formData, "owner_department");
  const mainRisk = textValue(formData, "main_risk");

  if (!flowCode || !flowName || !shortDescription || !ownerDepartment || !mainRisk) {
    redirect("/settings?error=missing_flow_data");
  }

  const { data: existingFlow } = await supabase
    .from("admission_flows")
    .select("id")
    .eq("flow_code", flowCode)
    .maybeSingle();

  if (existingFlow) {
    redirect("/settings?error=duplicate_flow_code");
  }

  const { error } = await supabase.from("admission_flows").insert({
    flow_code: flowCode,
    flow_name: flowName,
    short_description: shortDescription,
    owner_department: ownerDepartment,
    main_risk: mainRisk,
    sort_order: numberValue(formData, "sort_order"),
    status: String(formData.get("status") ?? "ACTIVE"),
  });

  if (error) {
    redirect(`/settings?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/settings");
  redirect("/settings?flow_created=1");
}

export async function updateAdmissionFlowAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const flowId = textValue(formData, "flow_id");
  const flowName = textValue(formData, "flow_name");
  const shortDescription = textValue(formData, "short_description");
  const ownerDepartment = textValue(formData, "owner_department");
  const mainRisk = textValue(formData, "main_risk");
  const status = String(formData.get("status") ?? "ACTIVE");

  if (!flowId || !flowName || !shortDescription || !ownerDepartment || !mainRisk) {
    redirect("/settings?error=missing_flow_data");
  }

  if (!["ACTIVE", "INACTIVE"].includes(status)) {
    redirect("/settings?error=invalid_status");
  }

  const { error } = await supabase
    .from("admission_flows")
    .update({
      flow_name: flowName,
      short_description: shortDescription,
      owner_department: ownerDepartment,
      main_risk: mainRisk,
      sort_order: numberValue(formData, "sort_order"),
      status,
    })
    .eq("id", flowId);

  if (error) {
    redirect(`/settings?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/settings");
  redirect("/settings?flow_updated=1");
}

export async function createAdmissionProgramAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const programCode = normalizeMasterCode(textValue(formData, "program_code"));
  const programName = textValue(formData, "program_name");

  if (!programCode || !programName) {
    redirect("/settings?error=missing_program_data");
  }

  const { data: existingProgram } = await supabase
    .from("admission_programs")
    .select("id")
    .eq("program_code", programCode)
    .maybeSingle();

  if (existingProgram) {
    redirect("/settings?error=duplicate_program_code");
  }

  const { error } = await supabase.from("admission_programs").insert({
    program_code: programCode,
    program_name: programName,
    sort_order: numberValue(formData, "sort_order"),
    status: String(formData.get("status") ?? "ACTIVE"),
  });

  if (error) {
    redirect(`/settings?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/settings");
  revalidatePath("/leads/new");
  redirect("/settings?program_created=1");
}

export async function updateAdmissionProgramAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const programId = textValue(formData, "program_id");
  const programName = textValue(formData, "program_name");
  const status = String(formData.get("status") ?? "ACTIVE");

  if (!programId || !programName) {
    redirect("/settings?error=missing_program_data");
  }

  if (!["ACTIVE", "INACTIVE"].includes(status)) {
    redirect("/settings?error=invalid_status");
  }

  const { error } = await supabase
    .from("admission_programs")
    .update({
      program_name: programName,
      sort_order: numberValue(formData, "sort_order"),
      status,
    })
    .eq("id", programId);

  if (error) {
    redirect(`/settings?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/settings");
  revalidatePath("/leads/new");
  redirect("/settings?program_updated=1");
}

export async function createAdmissionMajorAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const majorCode = normalizeMasterCode(textValue(formData, "major_code"));
  const majorName = textValue(formData, "major_name");
  const programId = textValue(formData, "program_id");

  if (!majorCode || !majorName) {
    redirect("/settings?error=missing_major_data");
  }

  const { data: existingMajor } = await supabase
    .from("admission_majors")
    .select("id")
    .eq("major_code", majorCode)
    .maybeSingle();

  if (existingMajor) {
    redirect("/settings?error=duplicate_major_code");
  }

  const { error } = await supabase.from("admission_majors").insert({
    major_code: majorCode,
    major_name: majorName,
    program_id: programId,
    sort_order: numberValue(formData, "sort_order"),
    status: String(formData.get("status") ?? "ACTIVE"),
  });

  if (error) {
    redirect(`/settings?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/settings");
  revalidatePath("/leads/new");
  redirect("/settings?major_created=1");
}

export async function updateAdmissionMajorAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const majorId = textValue(formData, "major_id");
  const majorName = textValue(formData, "major_name");
  const programId = textValue(formData, "program_id");
  const status = String(formData.get("status") ?? "ACTIVE");

  if (!majorId || !majorName) {
    redirect("/settings?error=missing_major_data");
  }

  if (!["ACTIVE", "INACTIVE"].includes(status)) {
    redirect("/settings?error=invalid_status");
  }

  const { error } = await supabase
    .from("admission_majors")
    .update({
      major_name: majorName,
      program_id: programId,
      sort_order: numberValue(formData, "sort_order"),
      status,
    })
    .eq("id", majorId);

  if (error) {
    redirect(`/settings?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/settings");
  revalidatePath("/leads/new");
  redirect("/settings?major_updated=1");
}

export async function createHouLocationAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const locationCode = normalizeMasterCode(textValue(formData, "location_code"));
  const locationName = textValue(formData, "location_name");
  const addressLine = textValue(formData, "address_line");

  if (!locationCode || !locationName || !addressLine) {
    redirect("/settings?error=missing_hou_location_data");
  }

  const { data: existingLocation } = await supabase
    .from("hou_locations")
    .select("id")
    .eq("location_code", locationCode)
    .maybeSingle();

  if (existingLocation) {
    redirect("/settings?error=duplicate_hou_location_code");
  }

  const { error } = await supabase.from("hou_locations").insert({
    location_code: locationCode,
    location_name: locationName,
    location_type: textValue(formData, "location_type") ?? "LEARNING_SITE",
    address_line: addressLine,
    ward: textValue(formData, "ward"),
    district_legacy: textValue(formData, "district_legacy"),
    province: textValue(formData, "province"),
    approval_decision_no: textValue(formData, "approval_decision_no"),
    approval_decision_date: textValue(formData, "approval_decision_date"),
    valid_from: textValue(formData, "valid_from"),
    source_document: textValue(formData, "source_document"),
    approval_file_url: textValue(formData, "approval_file_url"),
    evidence_image_url: textValue(formData, "evidence_image_url"),
    evidence_note: textValue(formData, "evidence_note"),
    notes: textValue(formData, "notes"),
    status: String(formData.get("status") ?? "ACTIVE"),
  });

  if (error) {
    redirect(`/settings?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/settings");
  revalidatePath("/leads/new");
  redirect("/settings?hou_location_created=1");
}

export async function updateHouLocationAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const locationId = textValue(formData, "location_id");
  const locationName = textValue(formData, "location_name");
  const addressLine = textValue(formData, "address_line");
  const status = String(formData.get("status") ?? "ACTIVE");

  if (!locationId || !locationName || !addressLine) {
    redirect("/settings?error=missing_hou_location_data");
  }

  if (!["ACTIVE", "INACTIVE"].includes(status)) {
    redirect("/settings?error=invalid_status");
  }

  const { error } = await supabase
    .from("hou_locations")
    .update({
      location_name: locationName,
      location_type: textValue(formData, "location_type") ?? "LEARNING_SITE",
      address_line: addressLine,
      ward: textValue(formData, "ward"),
      district_legacy: textValue(formData, "district_legacy"),
      province: textValue(formData, "province"),
      approval_decision_no: textValue(formData, "approval_decision_no"),
      approval_decision_date: textValue(formData, "approval_decision_date"),
      valid_from: textValue(formData, "valid_from"),
      source_document: textValue(formData, "source_document"),
      approval_file_url: textValue(formData, "approval_file_url"),
      evidence_image_url: textValue(formData, "evidence_image_url"),
      evidence_note: textValue(formData, "evidence_note"),
      notes: textValue(formData, "notes"),
      status,
    })
    .eq("id", locationId);

  if (error) {
    redirect(`/settings?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/settings");
  revalidatePath("/leads/new");
  redirect("/settings?hou_location_updated=1");
}

export async function createAdmissionProgramRuleAction(formData: FormData) {
  const { supabase, user } = await requireAdmissionConfigManage();
  const segmentId = textValue(formData, "segment_id");
  const programId = textValue(formData, "program_id");
  const majorId = textValue(formData, "major_id");
  const status = String(formData.get("status") ?? "ACTIVE");

  if (!segmentId || !programId) {
    redirect("/settings?error=missing_admission_program_rule");
  }

  if (!["ACTIVE", "INACTIVE"].includes(status)) {
    redirect("/settings?error=invalid_status");
  }

  const { error } = await supabase.from("admission_segment_program_rules").upsert(
    {
      segment_id: segmentId,
      program_id: programId,
      major_id: majorId,
      is_default: formData.get("is_default") === "on",
      is_required: formData.get("is_required") === "on",
      sort_order: numberValue(formData, "sort_order"),
      note: textValue(formData, "note"),
      status,
      created_by: user.id,
      updated_by: user.id,
    },
    { onConflict: "segment_id,program_id,major_id" },
  );

  if (error) {
    redirect(`/settings?error=${encodeURIComponent(error.message)}`);
  }

  revalidateAdmissionConfigPaths();
  redirect("/settings?admission_config_created=1");
}

export async function updateAdmissionProgramRuleAction(formData: FormData) {
  const { supabase, user } = await requireAdmissionConfigManage();
  const ruleId = textValue(formData, "rule_id");
  const segmentId = textValue(formData, "segment_id");
  const programId = textValue(formData, "program_id");
  const majorId = textValue(formData, "major_id");
  const status = String(formData.get("status") ?? "ACTIVE");

  if (!ruleId || !segmentId || !programId) {
    redirect("/settings?error=missing_admission_program_rule");
  }

  if (!["ACTIVE", "INACTIVE"].includes(status)) {
    redirect("/settings?error=invalid_status");
  }

  const { error } = await supabase
    .from("admission_segment_program_rules")
    .update({
      segment_id: segmentId,
      program_id: programId,
      major_id: majorId,
      is_default: formData.get("is_default") === "on",
      is_required: formData.get("is_required") === "on",
      sort_order: numberValue(formData, "sort_order"),
      note: textValue(formData, "note"),
      status,
      updated_by: user.id,
    })
    .eq("id", ruleId);

  if (error) {
    redirect(`/settings?error=${encodeURIComponent(error.message)}`);
  }

  revalidateAdmissionConfigPaths();
  redirect("/settings?admission_config_updated=1");
}

export async function createAdmissionFormFieldConfigAction(formData: FormData) {
  const { supabase, user } = await requireAdmissionConfigManage();
  const segmentId = textValue(formData, "segment_id");
  const fieldKey = normalizeFieldKey(textValue(formData, "field_key"));
  const fieldLabel = textValue(formData, "field_label");
  const status = String(formData.get("status") ?? "ACTIVE");

  if (!segmentId || !fieldKey || !fieldLabel) {
    redirect("/settings?error=missing_admission_field_config");
  }

  if (!["ACTIVE", "INACTIVE"].includes(status)) {
    redirect("/settings?error=invalid_status");
  }

  const { error } = await supabase.from("admission_form_field_configs").upsert(
    {
      segment_id: segmentId,
      field_key: fieldKey,
      field_label: fieldLabel,
      field_group: normalizeMasterCode(textValue(formData, "field_group")) ?? "LEAD",
      field_type: String(formData.get("field_type") ?? "TEXT"),
      is_visible: formData.get("is_visible") === "on",
      is_required: formData.get("is_required") === "on",
      option_source: String(formData.get("option_source") ?? "NONE"),
      placeholder: textValue(formData, "placeholder"),
      help_text: textValue(formData, "help_text"),
      validation_rule: textValue(formData, "validation_rule"),
      sort_order: numberValue(formData, "sort_order"),
      status,
      created_by: user.id,
      updated_by: user.id,
    },
    { onConflict: "segment_id,field_key" },
  );

  if (error) {
    redirect(`/settings?error=${encodeURIComponent(error.message)}`);
  }

  revalidateAdmissionConfigPaths();
  redirect("/settings?admission_config_created=1");
}

export async function updateAdmissionFormFieldConfigAction(formData: FormData) {
  const { supabase, user } = await requireAdmissionConfigManage();
  const fieldId = textValue(formData, "field_id");
  const fieldLabel = textValue(formData, "field_label");
  const status = String(formData.get("status") ?? "ACTIVE");

  if (!fieldId || !fieldLabel) {
    redirect("/settings?error=missing_admission_field_config");
  }

  if (!["ACTIVE", "INACTIVE"].includes(status)) {
    redirect("/settings?error=invalid_status");
  }

  const { error } = await supabase
    .from("admission_form_field_configs")
    .update({
      field_label: fieldLabel,
      field_group: normalizeMasterCode(textValue(formData, "field_group")) ?? "LEAD",
      field_type: String(formData.get("field_type") ?? "TEXT"),
      is_visible: formData.get("is_visible") === "on",
      is_required: formData.get("is_required") === "on",
      option_source: String(formData.get("option_source") ?? "NONE"),
      placeholder: textValue(formData, "placeholder"),
      help_text: textValue(formData, "help_text"),
      validation_rule: textValue(formData, "validation_rule"),
      sort_order: numberValue(formData, "sort_order"),
      status,
      updated_by: user.id,
    })
    .eq("id", fieldId);

  if (error) {
    redirect(`/settings?error=${encodeURIComponent(error.message)}`);
  }

  revalidateAdmissionConfigPaths();
  redirect("/settings?admission_config_updated=1");
}

export async function createAdmissionConditionRuleConfigAction(
  formData: FormData,
) {
  const { supabase, user } = await requireAdmissionConfigManage();
  const segmentId = textValue(formData, "segment_id");
  const conditionCode = normalizeMasterCode(textValue(formData, "condition_code"));
  const conditionName = textValue(formData, "condition_name");
  const status = String(formData.get("status") ?? "ACTIVE");

  if (!segmentId || !conditionCode || !conditionName) {
    redirect("/settings?error=missing_admission_condition_config");
  }

  if (!["ACTIVE", "INACTIVE"].includes(status)) {
    redirect("/settings?error=invalid_status");
  }

  const { error } = await supabase
    .from("admission_condition_rule_configs")
    .upsert(
      {
        segment_id: segmentId,
        condition_code: conditionCode,
        condition_name: conditionName,
        condition_group: String(formData.get("condition_group") ?? "ADMISSION"),
        is_required: formData.get("is_required") === "on",
        blocking_level: String(formData.get("blocking_level") ?? "WARN"),
        evidence_required: formData.get("evidence_required") === "on",
        owner_department: textValue(formData, "owner_department"),
        checker_role: textValue(formData, "checker_role"),
        approver_role: textValue(formData, "approver_role"),
        rule_note: textValue(formData, "rule_note"),
        sort_order: numberValue(formData, "sort_order"),
        status,
        created_by: user.id,
        updated_by: user.id,
      },
      { onConflict: "segment_id,condition_code" },
    );

  if (error) {
    redirect(`/settings?error=${encodeURIComponent(error.message)}`);
  }

  revalidateAdmissionConfigPaths();
  redirect("/settings?admission_config_created=1");
}

export async function updateAdmissionConditionRuleConfigAction(
  formData: FormData,
) {
  const { supabase, user } = await requireAdmissionConfigManage();
  const ruleId = textValue(formData, "rule_id");
  const conditionName = textValue(formData, "condition_name");
  const status = String(formData.get("status") ?? "ACTIVE");

  if (!ruleId || !conditionName) {
    redirect("/settings?error=missing_admission_condition_config");
  }

  if (!["ACTIVE", "INACTIVE"].includes(status)) {
    redirect("/settings?error=invalid_status");
  }

  const { error } = await supabase
    .from("admission_condition_rule_configs")
    .update({
      condition_name: conditionName,
      condition_group: String(formData.get("condition_group") ?? "ADMISSION"),
      is_required: formData.get("is_required") === "on",
      blocking_level: String(formData.get("blocking_level") ?? "WARN"),
      evidence_required: formData.get("evidence_required") === "on",
      owner_department: textValue(formData, "owner_department"),
      checker_role: textValue(formData, "checker_role"),
      approver_role: textValue(formData, "approver_role"),
      rule_note: textValue(formData, "rule_note"),
      sort_order: numberValue(formData, "sort_order"),
      status,
      updated_by: user.id,
    })
    .eq("id", ruleId);

  if (error) {
    redirect(`/settings?error=${encodeURIComponent(error.message)}`);
  }

  revalidateAdmissionConfigPaths();
  redirect("/settings?admission_config_updated=1");
}
