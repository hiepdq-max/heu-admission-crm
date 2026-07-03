import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const repoRoot = process.cwd();
const envPath = path.join(repoRoot, ".env.local");
const negativeQueueDocPath =
  "docs/HEU_NEGATIVE_CONTROL_ACCOUNT_QUEUE_20260703.md";
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
const targetSegmentCodes = {
  ttgdtx: "TC9_TTGDTX_LINKED",
  hou: "UNIVERSITY_TRANSFER_HOU",
};
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

function mapById(rows) {
  return new Map((rows ?? []).map((row) => [row.id, row]));
}

function addToSetMap(map, key, value) {
  const current = map.get(key) ?? new Set();
  current.add(value);
  map.set(key, current);
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

function checkStaticGuards() {
  try {
    const packageJson = JSON.parse(read("package.json"));
    const negativeQueueDoc = read(negativeQueueDocPath);
    const permissionScopeCheck = read("scripts/check-heu-permission-scope-readiness.mjs");
    const userAccountAudit = read("scripts/audit-heu-user-account-security.mjs");
    const productionReadiness = read("lib/production-readiness.ts");

    const requiredTokens = [
      packageJson.scripts?.["check:heu-negative-control-account-queue"] ===
      "node scripts/check-heu-negative-control-account-queue.mjs"
        ? "package-script-ok"
        : null,
      negativeQueueDoc.includes("HEU Negative Control Account Queue - 2026-07-03")
        ? "doc-title-ok"
        : null,
      negativeQueueDoc.includes("NEGATIVE_CONTROL_QUEUE_READY / NO_GO / BLOCKED")
        ? "decision-lane-ok"
        : null,
      negativeQueueDoc.includes("REAL_OUT_OF_SCOPE_NEGATIVE_01")
        ? "negative-label-ok"
        : null,
      negativeQueueDoc.includes("Do not paste passwords")
        ? "secret-boundary-ok"
        : null,
      permissionScopeCheck.includes("PERMISSION-SCOPE-NO-BROAD-NON-ADMIN")
        ? "permission-scope-link-ok"
        : null,
      productionReadiness.includes("REAL_OUT_OF_SCOPE_NEGATIVE_01")
        ? "production-readiness-link-ok"
        : null,
      userAccountAudit.includes("check-heu-negative-control-account-queue.mjs")
        ? "audit-hook-ok"
        : null,
    ];
    const missingCount = requiredTokens.filter((token) => !token).length;

    addStatus(
      "NEGATIVE-CONTROL-APP-GUARD",
      missingCount === 0 ? "READY" : "NO_GO",
      missingCount === 0
        ? "Negative-control queue doc, package command, permission-scope guard and user-account audit hook are wired."
        : `Negative-control static guards missing: ${missingCount}.`,
    );
  } catch {
    addStatus(
      "NEGATIVE-CONTROL-APP-GUARD",
      "NO_GO",
      "Negative-control static guard check could not complete. Raw errors are not printed.",
    );
  }
}

function hasBusinessScope(profileId, segmentScopeIdsByUserId, partnerScopeIdsByUserId) {
  return (
    (segmentScopeIdsByUserId.get(profileId)?.size ?? 0) > 0 ||
    (partnerScopeIdsByUserId.get(profileId)?.size ?? 0) > 0
  );
}

function isUsableNegativeCandidate(
  profile,
  roleById,
  visibilityByUserId,
  segmentScopeIdsByUserId,
  partnerScopeIdsByUserId,
  workspacePreferenceByUserId,
  targetSegmentId,
) {
  const roleCode = roleById.get(profile.role_id)?.code ?? "";
  const segmentIds = segmentScopeIdsByUserId.get(profile.id) ?? new Set();
  const leadVisibility = visibilityByUserId.get(profile.id);

  return (
    !privilegedRoleCodes.has(roleCode) &&
    Boolean(leadVisibility) &&
    leadVisibility !== "ALL" &&
    hasBusinessScope(profile.id, segmentScopeIdsByUserId, partnerScopeIdsByUserId) &&
    (!targetSegmentId || !segmentIds.has(targetSegmentId)) &&
    workspacePreferenceByUserId.get(profile.id) !== targetSegmentId
  );
}

const localEnv = parseEnvFile(envPath);
const missingKeys = requiredEnvKeys.filter((key) => !isMeaningfulSecret(localEnv[key]));

addStatus(
  "NEGATIVE-CONTROL-ENV",
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
      segmentsResult,
    ] = await Promise.all([
      fetchAllRows(
        adminClient,
        "users_profile",
        "id,role_id,department_id,status",
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
      fetchAllRows(
        adminClient,
        "admission_segments",
        "id,segment_code,status",
        (query) => query.eq("status", "ACTIVE"),
      ),
    ]);

    const readFailed =
      profilesResult.error ||
      rolesResult.error ||
      leadVisibilityResult.error ||
      segmentScopesResult.error ||
      partnerScopesResult.error ||
      workspacePreferencesResult.error ||
      segmentsResult.error;

    addStatus(
      "NEGATIVE-CONTROL-DB-READ",
      readFailed ? "NO_GO" : "READY",
      readFailed
        ? "Could not read one or more negative-control queue tables. Raw errors are not printed."
        : "Negative-control queue tables are readable with the server-only service role key.",
    );

    if (!readFailed) {
      const profiles = profilesResult.data ?? [];
      const roles = rolesResult.data ?? [];
      const leadVisibilityRows = leadVisibilityResult.data ?? [];
      const segmentScopes = segmentScopesResult.data ?? [];
      const partnerScopes = partnerScopesResult.data ?? [];
      const workspacePreferences = workspacePreferencesResult.data ?? [];
      const segments = segmentsResult.data ?? [];

      const roleById = mapById(roles);
      const segmentByCode = new Map(segments.map((row) => [row.segment_code, row]));
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
      const nonPrivilegedBroadVisibility = activeNonPrivilegedProfiles.filter(
        (profile) => visibilityByUserId.get(profile.id) === "ALL",
      );
      const activeNonPrivilegedWithBusinessScope = activeNonPrivilegedProfiles.filter(
        (profile) =>
          hasBusinessScope(profile.id, segmentScopeIdsByUserId, partnerScopeIdsByUserId),
      );
      const activeNonPrivilegedWithoutLeadVisibility =
        activeNonPrivilegedProfiles.filter(
          (profile) => !visibilityByUserId.has(profile.id),
        );

      addStatus(
        "NEGATIVE-CONTROL-BASELINE",
        activeNonPrivilegedWithoutLeadVisibility.length === 0 &&
          nonPrivilegedBroadVisibility.length === 0
          ? "READY"
          : "NO_GO",
        activeNonPrivilegedWithoutLeadVisibility.length === 0 &&
          nonPrivilegedBroadVisibility.length === 0
          ? [
              `active_non_admin_bgh=${activeNonPrivilegedProfiles.length}`,
              `active_non_admin_bgh_with_business_scope=${activeNonPrivilegedWithBusinessScope.length}`,
              "no active non-ADMIN/BGH profile has lead visibility ALL",
            ].join("; ")
          : `Negative-control baseline findings: missing_visibility=${activeNonPrivilegedWithoutLeadVisibility.length}; non_admin_all_visibility=${nonPrivilegedBroadVisibility.length}.`,
      );

      const ttgdtxSegmentId = segmentByCode.get(targetSegmentCodes.ttgdtx)?.id;
      const houSegmentId = segmentByCode.get(targetSegmentCodes.hou)?.id;
      const shortSegmentIds = new Set(
        segments
          .filter((segment) => segment.segment_code?.startsWith("SHORT_"))
          .map((segment) => segment.id),
      );

      const ttgdtxCandidates = activeNonPrivilegedProfiles.filter((profile) =>
        isUsableNegativeCandidate(
          profile,
          roleById,
          visibilityByUserId,
          segmentScopeIdsByUserId,
          partnerScopeIdsByUserId,
          workspacePreferenceByUserId,
          ttgdtxSegmentId,
        ),
      );
      const houCandidates = activeNonPrivilegedProfiles.filter((profile) =>
        isUsableNegativeCandidate(
          profile,
          roleById,
          visibilityByUserId,
          segmentScopeIdsByUserId,
          partnerScopeIdsByUserId,
          workspacePreferenceByUserId,
          houSegmentId,
        ),
      );
      const shortCandidates = activeNonPrivilegedProfiles.filter((profile) => {
        const segmentIds = segmentScopeIdsByUserId.get(profile.id) ?? new Set();
        const activeWorkspace = workspacePreferenceByUserId.get(profile.id);

        return (
          isUsableNegativeCandidate(
            profile,
            roleById,
            visibilityByUserId,
            segmentScopeIdsByUserId,
            partnerScopeIdsByUserId,
            workspacePreferenceByUserId,
            null,
          ) &&
          ![...shortSegmentIds].some((segmentId) => segmentIds.has(segmentId)) &&
          !shortSegmentIds.has(activeWorkspace)
        );
      });

      addStatus(
        "NEGATIVE-CONTROL-TTGDTX-QUEUE",
        ttgdtxSegmentId ? "READY" : "NO_GO",
        ttgdtxSegmentId
          ? [
              `target_segment=${targetSegmentCodes.ttgdtx}`,
              `ttgdtx_negative_candidates=${ttgdtxCandidates.length}`,
              ttgdtxCandidates.length === 0
                ? "owner create/link pending for REAL_OUT_OF_SCOPE_NEGATIVE_01"
                : "candidate evidence only, not signed UAT",
            ].join("; ")
          : `Target segment ${targetSegmentCodes.ttgdtx} is missing.`,
      );

      addStatus(
        "NEGATIVE-CONTROL-MODULE-QUEUE",
        houSegmentId && shortSegmentIds.size > 0 ? "READY" : "NO_GO",
        houSegmentId && shortSegmentIds.size > 0
          ? [
              `hou_negative_candidates=${houCandidates.length}`,
              `short_course_negative_candidates=${shortCandidates.length}`,
              `short_course_target_segments=${shortSegmentIds.size}`,
            ].join("; ")
          : `Module negative-control targets missing: hou=${houSegmentId ? 0 : 1}; short=${shortSegmentIds.size}.`,
      );

      addStatus(
        "NEGATIVE-CONTROL-NO-AUTO-CREATE",
        "READY",
        "This checker is read-only; owner-approved negative-control accounts must be created/linked through approved secure channels, not by this script.",
      );

      addStatus(
        "NEGATIVE-CONTROL-SECRET-BOUNDARY",
        "READY",
        "The queue reports counts and target labels only; it does not print emails, names, phone numbers, passwords, reset links, service-role keys or raw IDs.",
      );

      addStatus(
        "NEGATIVE-CONTROL-SUMMARY",
        "READY",
        [
          `active_profiles=${profiles.length}`,
          `active_non_admin_bgh=${activeNonPrivilegedProfiles.length}`,
          `ttgdtx_negative_candidates=${ttgdtxCandidates.length}`,
          `hou_negative_candidates=${houCandidates.length}`,
          `short_course_negative_candidates=${shortCandidates.length}`,
        ].join("; "),
      );
    }
  } catch {
    addStatus(
      "NEGATIVE-CONTROL-CHECK",
      "NO_GO",
      "Negative-control account queue check could not complete. Check server env/project and database schema. Raw errors are not printed.",
    );
  }
} else {
  addStatus(
    "NEGATIVE-CONTROL-CHECK",
    "NO_GO",
    "Negative-control checks were skipped because required env keys are missing.",
  );
}

console.log("HEU negative-control account queue check");
console.log(
  "Secrets, emails, names, phone numbers and raw IDs are never printed by this script.",
);

for (const item of statuses) {
  console.log(`${item.status} ${item.code}: ${item.detail}`);
}

if (statuses.some((item) => item.status !== "READY")) {
  process.exitCode = 1;
}
