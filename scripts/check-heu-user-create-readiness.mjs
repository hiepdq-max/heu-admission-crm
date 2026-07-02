import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const repoRoot = process.cwd();
const envPath = path.join(repoRoot, ".env.local");
const requiredEnvKeys = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
];
const statuses = [];

function addStatus(code, status, detail) {
  statuses.push({ code, status, detail });
}

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

const localEnv = parseEnvFile(envPath);
const hasSupabaseUrl = isMeaningfulSecret(localEnv.NEXT_PUBLIC_SUPABASE_URL);
const hasServiceRoleKey = isMeaningfulSecret(localEnv.SUPABASE_SERVICE_ROLE_KEY);
const missingKeys = requiredEnvKeys.filter((key) => !isMeaningfulSecret(localEnv[key]));

addStatus(
  "USER-CREATE-ENV",
  missingKeys.length === 0 ? "READY" : "NO_GO",
  missingKeys.length === 0
    ? ".env.local has required Supabase env keys. Values are intentionally hidden."
    : `.env.local missing or placeholder keys: ${missingKeys.join(", ")}.`,
);

if (hasSupabaseUrl) {
  addStatus("USER-CREATE-URL", "READY", "Supabase URL is configured.");
} else {
  addStatus("USER-CREATE-URL", "NO_GO", "Supabase URL is missing.");
}

if (hasServiceRoleKey && hasSupabaseUrl) {
  try {
    const adminClient = createClient(
      localEnv.NEXT_PUBLIC_SUPABASE_URL,
      localEnv.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    );

    const { error: authAdminError } = await adminClient.auth.admin.listUsers({
      page: 1,
      perPage: 1,
    });

    addStatus(
      "USER-CREATE-AUTH-ADMIN",
      authAdminError ? "NO_GO" : "READY",
      authAdminError
        ? "USER_CREATE_AUTH_ADMIN_NO_GO: Auth Admin API failed. Check server env/project in Supabase. Raw errors are not printed."
        : "Auth Admin API is reachable with the server-only service role key.",
    );

    const { data: adminRole, error: adminRoleError } = await adminClient
      .from("roles")
      .select("id")
      .eq("code", "ADMIN")
      .maybeSingle();

    if (adminRoleError || !adminRole?.id) {
      addStatus(
        "USER-CREATE-ADMIN-ROLE",
        "NO_GO",
        adminRoleError
          ? "USER_CREATE_ADMIN_ROLE_NO_GO: ADMIN role lookup failed. Check seed/database access. Raw errors are not printed."
          : "ADMIN role is missing.",
      );
    } else {
      addStatus("USER-CREATE-ADMIN-ROLE", "READY", "ADMIN role exists.");

      const { data: adminPermission, error: adminPermissionError } =
        await adminClient
          .from("role_permissions")
          .select("permission")
          .eq("role_id", adminRole.id)
          .eq("permission", "users.create")
          .maybeSingle();

      addStatus(
        "USER-CREATE-ADMIN-SEED",
        adminPermission && !adminPermissionError ? "READY" : "NO_GO",
        adminPermissionError
          ? "USER_CREATE_ADMIN_SEED_NO_GO: ADMIN users.create lookup failed. Check seed/database access. Raw errors are not printed."
          : adminPermission
            ? "ADMIN has users.create in role_permissions."
            : "ADMIN is missing users.create in role_permissions; run database/step112_admin_user_create_permission.sql after approved backup/migration order.",
    );
  }
  } catch {
    addStatus(
      "USER-CREATE-AUTH-ADMIN",
      "NO_GO",
      "USER_CREATE_READINESS_EXCEPTION_NO_GO: Readiness check could not complete. Check server env/project. Raw errors are not printed.",
    );
  }
} else {
  addStatus(
    "USER-CREATE-AUTH-ADMIN",
    "NO_GO",
    hasServiceRoleKey
      ? "Supabase URL is missing, so Auth Admin API check was skipped."
      : "SUPABASE_SERVICE_ROLE_KEY is missing, so Auth Admin API check was skipped.",
  );
}

console.log("HEU user-create readiness check");
console.log("Secrets are never printed by this script.");

for (const item of statuses) {
  console.log(`${item.status} ${item.code}: ${item.detail}`);
}

if (statuses.some((item) => item.status !== "READY")) {
  process.exit(1);
}
