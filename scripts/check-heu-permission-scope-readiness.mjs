import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { createClient } from "@supabase/supabase-js";

const repoRoot = process.cwd();
const envPath = path.join(repoRoot, ".env.local");
const requiredEnvKeys = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
];
const privilegedRoleCodes = new Set(["ADMIN", "BGH"]);
const allowedLeadVisibility = new Set(["OWN", "TEAM", "DEPARTMENT", "ALL"]);
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

function hashLabel(value) {
  return crypto.createHash("sha256").update(String(value)).digest("hex").slice(0, 10);
}

async function countRows(supabase, table, buildQuery = (query) => query) {
  const { count, error } = await buildQuery(
    supabase.from(table).select("*", { count: "exact", head: true }),
  );

  if (error) {
    return { table, error: error.message };
  }

  return { table, count: count ?? 0 };
}

async function assertAuthProfilesLinked(adminClient, profiles) {
  const missingAuthUsers = [];

  for (const profile of profiles) {
    const { data, error } = await adminClient.auth.admin.getUserById(profile.id);

    if (error || !data?.user) {
      missingAuthUsers.push(hashLabel(profile.id));
    }
  }

  return missingAuthUsers;
}

const localEnv = parseEnvFile(envPath);
const missingKeys = requiredEnvKeys.filter((key) => !isMeaningfulSecret(localEnv[key]));

addStatus(
  "PERMISSION-SCOPE-ENV",
  missingKeys.length === 0 ? "READY" : "NO_GO",
  missingKeys.length === 0
    ? ".env.local has required Supabase env keys. Values are intentionally hidden."
    : `.env.local missing or placeholder keys: ${missingKeys.join(", ")}.`,
);

if (missingKeys.length === 0) {
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
      "PERMISSION-SCOPE-AUTH-ADMIN",
      authAdminError ? "NO_GO" : "READY",
      authAdminError
        ? "Auth Admin API failed. Check server env/project in Supabase. Raw errors are not printed."
        : "Auth Admin API is reachable with the server-only service role key.",
    );

    const [
      { data: profiles, error: profilesError },
      { data: segmentScopes, error: segmentScopesError },
      { data: partnerScopes, error: partnerScopesError },
      { data: leadVisibilityScopes, error: leadVisibilityScopesError },
      { data: workspacePreferences, error: workspacePreferencesError },
      activeSegments,
      activePartners,
    ] = await Promise.all([
      adminClient
        .from("users_profile")
        .select("id,status,role_id,department_id,manager_id,roles(code)")
        .eq("status", "ACTIVE"),
      adminClient
        .from("user_admission_segment_scopes")
        .select("user_id,segment_id,status")
        .eq("status", "ACTIVE"),
      adminClient
        .from("user_partner_scopes")
        .select("user_id,partner_id,status")
        .eq("status", "ACTIVE"),
      adminClient
        .from("user_lead_visibility_scopes")
        .select("user_id,lead_visibility,status")
        .eq("status", "ACTIVE"),
      adminClient
        .from("user_admission_workspace_preferences")
        .select("user_id,active_segment_id,status")
        .eq("status", "ACTIVE"),
      countRows(adminClient, "admission_segments", (query) =>
        query.eq("status", "ACTIVE"),
      ),
      countRows(adminClient, "partners", (query) =>
        query.eq("status", "ACTIVE").eq("is_deleted", false),
      ),
    ]);

    if (profilesError) {
      addStatus(
        "PERMISSION-SCOPE-PROFILES",
        "NO_GO",
        "Could not read active users_profile rows. Raw errors are not printed.",
      );
    }

    if (segmentScopesError) {
      addStatus(
        "PERMISSION-SCOPE-SEGMENT-ROWS",
        "NO_GO",
        "Could not read user_admission_segment_scopes rows. Raw errors are not printed.",
      );
    }

    if (partnerScopesError) {
      addStatus(
        "PERMISSION-SCOPE-PARTNER-ROWS",
        "NO_GO",
        "Could not read user_partner_scopes rows. Raw errors are not printed.",
      );
    }

    if (leadVisibilityScopesError) {
      addStatus(
        "PERMISSION-SCOPE-VISIBILITY-ROWS",
        "NO_GO",
        "Could not read user_lead_visibility_scopes rows. Run database/step40_user_lead_visibility.sql after approved migration order if missing.",
      );
    }

    if (workspacePreferencesError) {
      addStatus(
        "PERMISSION-SCOPE-WORKSPACE-PREFERENCES",
        "NO_GO",
        "Could not read user_admission_workspace_preferences rows. Run database/step52_admission_workspace_selector.sql after approved migration order if missing.",
      );
    }

    if (
      profiles &&
      segmentScopes &&
      partnerScopes &&
      leadVisibilityScopes &&
      workspacePreferences
    ) {
      const activeProfiles = profiles;
      const segmentScopeUsers = new Set(segmentScopes.map((row) => row.user_id));
      const partnerScopeUsers = new Set(partnerScopes.map((row) => row.user_id));
      const visibilityByUser = new Map(
        leadVisibilityScopes.map((row) => [row.user_id, row.lead_visibility]),
      );
      const segmentScopeIdsByUser = new Map();
      const workspacePreferenceByUser = new Map(
        workspacePreferences.map((row) => [row.user_id, row.active_segment_id]),
      );

      for (const row of segmentScopes) {
        const current = segmentScopeIdsByUser.get(row.user_id) ?? new Set();
        current.add(row.segment_id);
        segmentScopeIdsByUser.set(row.user_id, current);
      }

      const activeNonPrivilegedProfiles = activeProfiles.filter(
        (profile) => !privilegedRoleCodes.has(profile.roles?.code ?? ""),
      );
      const missingRoleProfiles = activeProfiles.filter((profile) => !profile.role_id);
      const activeWithoutExplicitLeadVisibility = activeProfiles.filter(
        (profile) => !visibilityByUser.has(profile.id),
      );
      const activeNonPrivilegedWithoutBusinessScope =
        activeNonPrivilegedProfiles.filter(
          (profile) =>
            !segmentScopeUsers.has(profile.id) && !partnerScopeUsers.has(profile.id),
        );
      const invalidLeadVisibilityRows = leadVisibilityScopes.filter(
        (scope) => !allowedLeadVisibility.has(scope.lead_visibility),
      );
      const nonPrivilegedAllVisibility = activeNonPrivilegedProfiles.filter(
        (profile) => visibilityByUser.get(profile.id) === "ALL",
      );
      const activeNonPrivilegedWithSegmentScopeWithoutWorkspacePreference =
        activeNonPrivilegedProfiles.filter((profile) => {
          const segmentIds = segmentScopeIdsByUser.get(profile.id);
          const activeSegmentId = workspacePreferenceByUser.get(profile.id);

          return (
            segmentIds?.size > 0 &&
            (!activeSegmentId || !segmentIds.has(activeSegmentId))
          );
        });
      const missingAuthUsers =
        authAdminError || profilesError
          ? []
          : await assertAuthProfilesLinked(adminClient, activeProfiles);

      addStatus(
        "PERMISSION-SCOPE-ACTIVE-PROFILES",
        activeProfiles.length > 0 ? "READY" : "NO_GO",
        `Active CRM profiles: ${activeProfiles.length}.`,
      );

      addStatus(
        "PERMISSION-SCOPE-AUTH-LINK",
        missingAuthUsers.length === 0 ? "READY" : "NO_GO",
        missingAuthUsers.length === 0
          ? "Every active users_profile row has a matching Supabase Auth user id."
          : `Active profiles without matching Auth user id: ${missingAuthUsers.length}; account labels: ${missingAuthUsers.join(", ")}.`,
      );

      addStatus(
        "PERMISSION-SCOPE-ROLE-LINK",
        missingRoleProfiles.length === 0 ? "READY" : "NO_GO",
        missingRoleProfiles.length === 0
          ? "Every active profile has a role_id."
          : `Active profiles missing role_id: ${missingRoleProfiles.length}.`,
      );

      addStatus(
        "PERMISSION-SCOPE-LEAD-VISIBILITY",
        activeWithoutExplicitLeadVisibility.length === 0 &&
          invalidLeadVisibilityRows.length === 0
          ? "READY"
          : "NO_GO",
        activeWithoutExplicitLeadVisibility.length === 0 &&
          invalidLeadVisibilityRows.length === 0
          ? "Every active profile has an explicit valid lead visibility row."
          : `Profiles missing explicit lead visibility: ${activeWithoutExplicitLeadVisibility.length}; invalid visibility rows: ${invalidLeadVisibilityRows.length}.`,
      );

      addStatus(
        "PERMISSION-SCOPE-BUSINESS-SCOPE",
        activeNonPrivilegedWithoutBusinessScope.length === 0 ? "READY" : "NO_GO",
        activeNonPrivilegedWithoutBusinessScope.length === 0
          ? "Every active non-ADMIN/BGH profile has at least one active segment or partner scope."
          : `Active non-ADMIN/BGH profiles without segment/partner scope: ${activeNonPrivilegedWithoutBusinessScope.length}.`,
      );

      addStatus(
        "PERMISSION-SCOPE-NO-BROAD-NON-ADMIN",
        nonPrivilegedAllVisibility.length === 0 ? "READY" : "NO_GO",
        nonPrivilegedAllVisibility.length === 0
          ? "No active non-ADMIN/BGH profile has lead visibility ALL."
          : `Active non-ADMIN/BGH profiles with lead visibility ALL: ${nonPrivilegedAllVisibility.length}.`,
      );

      addStatus(
        "PERMISSION-SCOPE-ACTIVE-WORKSPACE",
        activeNonPrivilegedWithSegmentScopeWithoutWorkspacePreference.length === 0
          ? "READY"
          : "NO_GO",
        activeNonPrivilegedWithSegmentScopeWithoutWorkspacePreference.length === 0
          ? "Every active non-ADMIN/BGH profile with segment scope has an active workspace preference inside that scope."
          : `Active non-ADMIN/BGH profiles with segment scope but no matching active workspace preference: ${activeNonPrivilegedWithSegmentScopeWithoutWorkspacePreference.length}.`,
      );

      addStatus(
        "PERMISSION-SCOPE-AVAILABLE-SCOPES",
        !activeSegments.error && activeSegments.count > 0 ? "READY" : "NO_GO",
        activeSegments.error
          ? "Could not count active admission_segments. Raw errors are not printed."
          : `Active admission segments available for assignment: ${activeSegments.count}.`,
      );

      addStatus(
        "PERMISSION-SCOPE-PARTNER-OPTIONS",
        activePartners.error ? "NO_GO" : "READY",
        activePartners.error
          ? "Could not count active partners. Raw errors are not printed."
          : `Active non-deleted partners available for optional partner scope: ${activePartners.count}.`,
      );

      addStatus(
        "PERMISSION-SCOPE-SUMMARY",
        "READY",
        [
          `active_profiles=${activeProfiles.length}`,
          `active_non_admin_bgh=${activeNonPrivilegedProfiles.length}`,
          `active_segment_scope_rows=${segmentScopes.length}`,
          `active_partner_scope_rows=${partnerScopes.length}`,
          `active_lead_visibility_rows=${leadVisibilityScopes.length}`,
          `active_workspace_preference_rows=${workspacePreferences.length}`,
        ].join("; "),
      );
    }
  } catch {
    addStatus(
      "PERMISSION-SCOPE-CHECK",
      "NO_GO",
      "Readiness check could not complete. Check server env/project and database schema. Raw errors are not printed.",
    );
  }
} else {
  addStatus(
    "PERMISSION-SCOPE-CHECK",
    "NO_GO",
    "Supabase permission/scope checks were skipped because required env keys are missing.",
  );
}

console.log("HEU permission/scope readiness check");
console.log("Secrets, emails, names, phone numbers and raw IDs are never printed by this script.");

for (const item of statuses) {
  console.log(`${item.status} ${item.code}: ${item.detail}`);
}

if (statuses.some((item) => item.status !== "READY")) {
  process.exit(1);
}
