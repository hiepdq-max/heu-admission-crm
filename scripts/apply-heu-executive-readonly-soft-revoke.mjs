import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const repoRoot = process.cwd();
const envPath = path.join(repoRoot, ".env.local");
const confirmToken = "EXECUTIVE_READONLY_SOFT_REVOKE_20260704";
const executiveRoleCodes = ["BGH", "HIEU_TRUONG", "PHO_HIEU_TRUONG"];
const allowedReadOnlyPermissions = new Set([
  "audit.read",
  "finance_desk.read",
  "heu_os.search.read",
  "leads.read_all",
  "master_control.read",
  "permission_matrix.read",
  "process_ownership.read",
  "reports.read_all",
  "scope.audit",
  "scope.enforcement.read",
  "workflow_request.read",
]);
const riskyPermissionPattern =
  /(^|\.)(approve|manage|create|update|delete|pay|lock|submit|reject|reverse|issue|cancel|assign|open|convert|verify|check)$/i;

function parseEnvFile(filePath) {
  if (!existsSync(filePath)) {
    return {};
  }

  const env = {};
  const contents = readFileSync(filePath, "utf8");

  for (const rawLine of contents.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (!line || line.startsWith("#")) {
      continue;
    }

    const separator = line.indexOf("=");

    if (separator === -1) {
      continue;
    }

    const key = line.slice(0, separator).trim();
    const value = line.slice(separator + 1).trim().replace(/^["']|["']$/g, "");
    env[key] = value;
  }

  return env;
}

function isMeaningfulSecret(value) {
  return (
    typeof value === "string" &&
    value.length > 20 &&
    !/your|todo|changeme|placeholder/i.test(value)
  );
}

function isRiskyExecutivePermission(permission) {
  return (
    !allowedReadOnlyPermissions.has(permission) ||
    riskyPermissionPattern.test(permission) ||
    permission.includes("read_sensitive")
  );
}

function chunk(items, size) {
  const chunks = [];

  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }

  return chunks;
}

function printRoleSummary(rows, label) {
  const grouped = new Map();

  for (const row of rows) {
    const roleCode = row.roleCode ?? "UNKNOWN";
    const permissions = grouped.get(roleCode) ?? [];
    permissions.push(row.permission);
    grouped.set(roleCode, permissions);
  }

  for (const roleCode of executiveRoleCodes) {
    const permissions = grouped.get(roleCode) ?? [];
    const sample = permissions.slice(0, 16).join(",") || "none";
    const remaining = Math.max(permissions.length - 16, 0);
    console.log(
      `${label} role=${roleCode}; target_count=${permissions.length}; sample=${sample}; remaining=${remaining}`,
    );
  }
}

function shouldApply() {
  return process.argv.includes("--apply");
}

function hasConfirmToken() {
  return process.argv.includes(`--confirm=${confirmToken}`);
}

async function updateRows(adminClient, tableName, rowIds, patch) {
  for (const ids of chunk(rowIds, 100)) {
    const { error } = await adminClient.from(tableName).update(patch).in("id", ids);

    if (error) {
      throw new Error(`${tableName} update failed: ${error.message}`);
    }
  }
}

async function main() {
  const apply = shouldApply();

  console.log("HEU executive read-only soft-revoke");
  console.log(
    "Secrets, emails, names, raw user ids, bank data, vouchers and signed evidence are never printed by this script.",
  );
  console.log(
    apply
      ? "MODE=APPLY"
      : `MODE=DRY_RUN; rerun with --apply --confirm=${confirmToken} to soft-revoke.`,
  );

  if (apply && !hasConfirmToken()) {
    console.error(`NO_GO CONFIRMATION_REQUIRED expected --confirm=${confirmToken}`);
    process.exitCode = 1;
    return;
  }

  const env = parseEnvFile(envPath);
  const requiredEnvKeys = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "SUPABASE_SERVICE_ROLE_KEY",
  ];
  const missingKeys = requiredEnvKeys.filter((key) => !isMeaningfulSecret(env[key]));

  if (missingKeys.length > 0) {
    console.error(`NO_GO ENV_MISSING keys=${missingKeys.join(",")}`);
    process.exitCode = 1;
    return;
  }

  const adminClient = createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } },
  );

  const { data: roles, error: rolesError } = await adminClient
    .from("roles")
    .select("id,code")
    .in("code", executiveRoleCodes);

  if (rolesError) {
    console.error("NO_GO ROLE_READ_FAILED");
    process.exitCode = 1;
    return;
  }

  const foundRoleCodes = new Set((roles ?? []).map((role) => role.code));
  const missingRoleCodes = executiveRoleCodes.filter((code) => !foundRoleCodes.has(code));

  if (missingRoleCodes.length > 0) {
    console.error(`NO_GO EXECUTIVE_ROLE_MISSING roles=${missingRoleCodes.join(",")}`);
    process.exitCode = 1;
    return;
  }

  const roleById = new Map((roles ?? []).map((role) => [role.id, role.code]));
  const roleIds = [...roleById.keys()];
  const { data: rolePermissionRows, error: rolePermissionError } = await adminClient
    .from("role_permissions")
    .select("id,role_id,permission,status")
    .in("role_id", roleIds)
    .order("permission", { ascending: true });

  if (rolePermissionError) {
    console.error("NO_GO ROLE_PERMISSION_READ_FAILED");
    process.exitCode = 1;
    return;
  }

  const targetRolePermissionRows = (rolePermissionRows ?? [])
    .filter((row) => row.status !== "INACTIVE")
    .filter((row) => isRiskyExecutivePermission(row.permission))
    .map((row) => ({
      ...row,
      roleCode: roleById.get(row.role_id),
    }));

  printRoleSummary(targetRolePermissionRows, "ROLE_PERMISSION_TARGET");

  const { data: positionRows, error: positionError } = await adminClient
    .from("heu_org_positions")
    .select("id,position_code,default_role_code")
    .in("default_role_code", executiveRoleCodes);

  let targetPositionPermissionRows = [];

  if (positionError) {
    console.log("POSITION_PERMISSION_TARGET status=SKIPPED; reason=position_table_unreadable");
  } else if ((positionRows ?? []).length > 0) {
    const positionById = new Map(
      positionRows.map((position) => [
        position.id,
        {
          positionCode: position.position_code,
          roleCode: position.default_role_code,
        },
      ]),
    );
    const { data: positionPermissionRows, error: positionPermissionError } =
      await adminClient
        .from("heu_position_permission_matrix")
        .select("id,position_id,permission,status")
        .in("position_id", [...positionById.keys()])
        .order("permission", { ascending: true });

    if (positionPermissionError) {
      console.log(
        "POSITION_PERMISSION_TARGET status=SKIPPED; reason=position_permission_table_unreadable",
      );
    } else {
      targetPositionPermissionRows = (positionPermissionRows ?? [])
        .filter((row) => row.status !== "INACTIVE")
        .filter((row) => isRiskyExecutivePermission(row.permission))
        .map((row) => ({
          ...row,
          roleCode: positionById.get(row.position_id)?.roleCode,
          positionCode: positionById.get(row.position_id)?.positionCode,
        }));

      console.log(
        `POSITION_PERMISSION_TARGET target_count=${targetPositionPermissionRows.length}; positions=${positionRows.length}`,
      );
    }
  }

  if (!apply) {
    console.log(
      `DRY_RUN_READY role_permission_targets=${targetRolePermissionRows.length}; position_permission_targets=${targetPositionPermissionRows.length}; no_db_change=true`,
    );
    return;
  }

  const now = new Date().toISOString();
  const note =
    "EXEC-ACCESS-REVOKE-01 STD-44 executive read-only soft revoke; reversible by approved forward migration.";

  if (targetRolePermissionRows.length > 0) {
    await updateRows(
      adminClient,
      "role_permissions",
      targetRolePermissionRows.map((row) => row.id),
      {
        status: "INACTIVE",
        revoked_at: now,
        note,
        updated_at: now,
      },
    );
  }

  if (targetPositionPermissionRows.length > 0) {
    await updateRows(
      adminClient,
      "heu_position_permission_matrix",
      targetPositionPermissionRows.map((row) => row.id),
      {
        status: "INACTIVE",
        updated_at: now,
      },
    );
  }

  console.log(
    `APPLY_DONE role_permission_rows=${targetRolePermissionRows.length}; position_permission_rows=${targetPositionPermissionRows.length}; hard_delete=false; admin_role_untouched=true`,
  );
}

main().catch((error) => {
  console.error(`NO_GO APPLY_FAILED ${error.message}`);
  process.exitCode = 1;
});
