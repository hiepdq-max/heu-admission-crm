import crypto from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const repoRoot = process.cwd();
const envPath = path.join(repoRoot, ".env.local");
const repairQueuePath =
  "docs/HEU_USER_SCOPE_BASELINE_REPAIR_QUEUE_20260703.md";
const requiredEnvKeys = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
];
const privilegedRoleCodes = new Set([
  "ADMIN",
  "BGH",
  "HIEU_TRUONG",
  "PHO_HIEU_TRUONG",
]);
const statuses = [];

function addStatus(code, status, detail) {
  statuses.push({ code, status, detail });
}

function read(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), "utf8");
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
  const hash = crypto.createHash("sha256");

  hash["update"](String(value));

  return hash.digest("hex").slice(0, 10);
}

function formatOwnerRepairLabels(rows, issueCode, roleById) {
  const labels = rows.slice(0, 10).map((profile) => {
    const roleCode = roleById.get(profile.role_id)?.code ?? "NO_ROLE";

    return `${hashLabel(`${issueCode}:${profile.id}`)}:${roleCode}`;
  });

  return labels.length > 0 ? labels.join(", ") : "none";
}

async function fetchAllRows(adminClient, table, select, buildQuery = (query) => query) {
  const rows = [];
  const pageSize = 1000;
  let from = 0;

  while (true) {
    const { data, error } = await buildQuery(
      adminClient
        .from(table)
        .select(select)
        .range(from, from + pageSize - 1),
    );

    if (error) {
      return { data: null, error: true };
    }

    const page = data ?? [];
    rows.push(...page);

    if (page.length < pageSize) {
      return { data: rows, error: false };
    }

    from += pageSize;
  }
}

function addToSetMap(map, key, value) {
  const current = map.get(key) ?? new Set();
  current.add(value);
  map.set(key, current);
}

function hasBusinessScope(profileId, segmentScopeIdsByUserId, partnerScopeIdsByUserId) {
  return (
    (segmentScopeIdsByUserId.get(profileId)?.size ?? 0) > 0 ||
    (partnerScopeIdsByUserId.get(profileId)?.size ?? 0) > 0
  );
}

function checkStaticGuards() {
  try {
    const packageJson = JSON.parse(read("package.json"));
    const repairQueue = read(repairQueuePath);
    const auditSource = read("scripts/audit-heu-user-account-security.mjs");
    const cutoverPanel = read("components/settings/user-operation-cutover-panel.tsx");

    const requiredTokens = [
      packageJson.scripts?.["check:heu-user-scope-baseline-repair-queue"] ===
      "node scripts/check-heu-user-scope-baseline-repair-queue.mjs"
        ? "package-script-ok"
        : null,
      repairQueue.includes("HEU User Scope Baseline Repair Queue - 2026-07-03")
        ? "doc-title-ok"
        : null,
      repairQueue.includes("USER_SCOPE_BASELINE_REPAIR_READY / NO_GO / BLOCKED")
        ? "decision-lane-ok"
        : null,
      repairQueue.includes("USER-SCOPE-REPAIR-01") &&
      repairQueue.includes("USER-SCOPE-REPAIR-02") &&
      repairQueue.includes("USER-SCOPE-REPAIR-03") &&
      repairQueue.includes("USER-SCOPE-REPAIR-04")
        ? "queue-order-ok"
        : null,
      repairQueue.includes("missing_visibility=1") &&
      repairQueue.includes("missing_business_scope=1")
        ? "live-blocker-ok"
        : null,
      repairQueue.includes("safe_owner_repair_labels")
        ? "owner-labels-ok"
        : null,
      auditSource.includes("check-heu-user-scope-baseline-repair-queue.mjs")
        ? "audit-hook-ok"
        : null,
      cutoverPanel.includes("HEU_USER_SCOPE_BASELINE_REPAIR_QUEUE_20260703.md")
        ? "ui-link-ok"
        : null,
    ];
    const missingCount = requiredTokens.filter((token) => !token).length;

    addStatus(
      "USER-SCOPE-REPAIR-APP-GUARD",
      missingCount === 0 ? "READY" : "NO_GO",
      missingCount === 0
        ? "Scope baseline repair queue doc, package command, UI reference and audit static guard are wired."
        : `Scope baseline repair queue static guards missing: ${missingCount}.`,
    );
  } catch {
    addStatus(
      "USER-SCOPE-REPAIR-APP-GUARD",
      "NO_GO",
      "Scope baseline repair queue static guard check could not complete. Raw errors are not printed.",
    );
  }
}

const localEnv = parseEnvFile(envPath);
const missingKeys = requiredEnvKeys.filter((key) => !isMeaningfulSecret(localEnv[key]));

addStatus(
  "USER-SCOPE-REPAIR-ENV",
  missingKeys.length === 0 ? "READY" : "NO_GO",
  missingKeys.length === 0
    ? ".env.local has required Supabase env keys. Values are intentionally hidden."
    : `.env.local missing or placeholder keys: ${missingKeys.join(", ")}.`,
);

checkStaticGuards();

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

    const [
      profilesResult,
      rolesResult,
      leadVisibilityResult,
      segmentScopesResult,
      partnerScopesResult,
      workspacePreferencesResult,
    ] = await Promise.all([
      fetchAllRows(
        adminClient,
        "users_profile",
        "id,role_id,status",
        (query) => query.eq("status", "ACTIVE"),
      ),
      fetchAllRows(adminClient, "roles", "id,code,name"),
      fetchAllRows(
        adminClient,
        "user_lead_visibility_scopes",
        "user_id,lead_visibility,status",
        (query) => query.eq("status", "ACTIVE"),
      ),
      fetchAllRows(
        adminClient,
        "user_admission_segment_scopes",
        "user_id,segment_id,status",
        (query) => query.eq("status", "ACTIVE"),
      ),
      fetchAllRows(
        adminClient,
        "user_partner_scopes",
        "user_id,partner_id,status",
        (query) => query.eq("status", "ACTIVE"),
      ),
      fetchAllRows(
        adminClient,
        "user_admission_workspace_preferences",
        "user_id,active_segment_id,status",
        (query) => query.eq("status", "ACTIVE"),
      ),
    ]);

    const readFailed =
      profilesResult.error ||
      rolesResult.error ||
      leadVisibilityResult.error ||
      segmentScopesResult.error ||
      partnerScopesResult.error ||
      workspacePreferencesResult.error;

    addStatus(
      "USER-SCOPE-REPAIR-DB-READ",
      readFailed ? "NO_GO" : "READY",
      readFailed
        ? "Could not read one or more scope baseline tables. Raw errors are not printed."
        : "Scope baseline tables are readable with the server-only service role key.",
    );

    if (!readFailed) {
      const profiles = profilesResult.data ?? [];
      const roles = rolesResult.data ?? [];
      const leadVisibilityRows = leadVisibilityResult.data ?? [];
      const segmentScopes = segmentScopesResult.data ?? [];
      const partnerScopes = partnerScopesResult.data ?? [];
      const workspacePreferences = workspacePreferencesResult.data ?? [];
      const roleById = new Map(roles.map((row) => [row.id, row]));
      const visibilityByUserId = new Map(
        leadVisibilityRows.map((row) => [row.user_id, row.lead_visibility]),
      );
      const segmentScopeIdsByUserId = new Map();
      const partnerScopeIdsByUserId = new Map();
      const workspacePreferenceByUserId = new Map(
        workspacePreferences.map((row) => [row.user_id, row.active_segment_id]),
      );

      for (const row of segmentScopes) {
        addToSetMap(segmentScopeIdsByUserId, row.user_id, row.segment_id);
      }

      for (const row of partnerScopes) {
        addToSetMap(partnerScopeIdsByUserId, row.user_id, row.partner_id);
      }

      const activeNonPrivilegedProfiles = profiles.filter((profile) => {
        const roleCode = roleById.get(profile.role_id)?.code ?? "";

        return !privilegedRoleCodes.has(roleCode);
      });
      const missingLeadVisibility = activeNonPrivilegedProfiles.filter(
        (profile) => !visibilityByUserId.has(profile.id),
      );
      const broadLeadVisibility = activeNonPrivilegedProfiles.filter(
        (profile) => visibilityByUserId.get(profile.id) === "ALL",
      );
      const missingBusinessScope = activeNonPrivilegedProfiles.filter(
        (profile) =>
          !hasBusinessScope(
            profile.id,
            segmentScopeIdsByUserId,
            partnerScopeIdsByUserId,
          ),
      );
      const workspaceMismatch = activeNonPrivilegedProfiles.filter((profile) => {
        const segmentIds = segmentScopeIdsByUserId.get(profile.id);
        const activeSegmentId = workspacePreferenceByUserId.get(profile.id);

        return Boolean(segmentIds?.size) && !segmentIds.has(activeSegmentId);
      });

      addStatus(
        "USER-SCOPE-REPAIR-LEAD-VISIBILITY",
        missingLeadVisibility.length === 0 ? "READY" : "NO_GO",
        missingLeadVisibility.length === 0
          ? "Every active non-ADMIN/BGH profile has explicit lead visibility."
          : `missing_visibility=${missingLeadVisibility.length}; owner must choose OWN/TEAM/DEPARTMENT visibility through Settings/RPC before cutover.`,
      );

      addStatus(
        "USER-SCOPE-REPAIR-BUSINESS-SCOPE",
        missingBusinessScope.length === 0 ? "READY" : "NO_GO",
        missingBusinessScope.length === 0
          ? "Every active non-ADMIN/BGH profile has at least one active segment or partner scope."
          : `missing_business_scope=${missingBusinessScope.length}; owner must approve segment/partner scope before position assignment or cutover.`,
      );

      addStatus(
        "USER-SCOPE-REPAIR-NO-BROAD-VISIBILITY",
        broadLeadVisibility.length === 0 ? "READY" : "NO_GO",
        broadLeadVisibility.length === 0
          ? "No active non-ADMIN/BGH profile has lead visibility ALL."
          : `non_admin_all_visibility=${broadLeadVisibility.length}; reduce broad visibility before cutover.`,
      );

      addStatus(
        "USER-SCOPE-REPAIR-WORKSPACE",
        workspaceMismatch.length === 0 ? "READY" : "NO_GO",
        workspaceMismatch.length === 0
          ? "Every scoped non-ADMIN/BGH profile has workspace preference inside assigned segment scope."
          : `workspace_mismatch=${workspaceMismatch.length}; fix active workspace before cutover.`,
      );

      addStatus(
        "USER-SCOPE-REPAIR-OWNER-LABELS",
        "READY",
        [
          `safe_owner_repair_labels=lead_visibility:${formatOwnerRepairLabels(
            missingLeadVisibility,
            "missing_lead_visibility",
            roleById,
          )}`,
          `business_scope:${formatOwnerRepairLabels(
            missingBusinessScope,
            "missing_business_scope",
            roleById,
          )}`,
          "hash labels are for secure owner-side lookup only",
        ].join("; "),
      );

      addStatus(
        "USER-SCOPE-REPAIR-NO-AUTO-ACTION",
        "READY",
        "This checker is read-only; owner-approved scope repair must be applied through Settings/RPC or a secure admin channel, not by this script.",
      );

      addStatus(
        "USER-SCOPE-REPAIR-SECRET-BOUNDARY",
        "READY",
        "The queue reports counts and safe process labels only; it does not print emails, names, phone numbers, passwords, reset links, service-role keys or raw IDs.",
      );

      addStatus(
        "USER-SCOPE-REPAIR-SUMMARY",
        "READY",
        [
          `active_profiles=${profiles.length}`,
          `active_non_admin_bgh=${activeNonPrivilegedProfiles.length}`,
          `missing_visibility=${missingLeadVisibility.length}`,
          `missing_business_scope=${missingBusinessScope.length}`,
          `non_admin_all_visibility=${broadLeadVisibility.length}`,
          `workspace_mismatch=${workspaceMismatch.length}`,
        ].join("; "),
      );
    }
  } catch {
    addStatus(
      "USER-SCOPE-REPAIR-CHECK",
      "NO_GO",
      "Scope baseline repair queue check could not complete. Check server env/project and database schema. Raw errors are not printed.",
    );
  }
} else {
  addStatus(
    "USER-SCOPE-REPAIR-CHECK",
    "NO_GO",
    "Scope baseline repair queue checks were skipped because required env keys are missing.",
  );
}

console.log("HEU user scope baseline repair queue check");
console.log(
  "Secrets, emails, names, phone numbers and raw IDs are never printed by this script.",
);
console.log(
  "Repair order: USER-SCOPE-REPAIR-01 -> USER-SCOPE-REPAIR-02 -> USER-SCOPE-REPAIR-03 -> USER-SCOPE-REPAIR-04.",
);

for (const item of statuses) {
  console.log(`${item.status} ${item.code}: ${item.detail}`);
}

if (statuses.some((item) => item.status !== "READY")) {
  process.exitCode = 1;
}
