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

function activeScopeMap(rows, userKey, scopeKey) {
  const map = new Map();

  for (const row of rows ?? []) {
    const current = map.get(row[userKey]) ?? new Set();
    current.add(row[scopeKey]);
    map.set(row[userKey], current);
  }

  return map;
}

function isPrivilegedProfile(profile) {
  return privilegedRoleCodes.has(profile?.roles?.code ?? "");
}

function userSegmentMismatch(profile, segmentScopes, segmentId) {
  if (!profile || !segmentId || isPrivilegedProfile(profile)) {
    return false;
  }

  const scopes = segmentScopes.get(profile.id);
  return scopes?.size > 0 && !scopes.has(segmentId);
}

function userPartnerMismatch(profile, partnerScopes, partnerId) {
  if (!profile || !partnerId || isPrivilegedProfile(profile)) {
    return false;
  }

  const scopes = partnerScopes.get(profile.id);
  return scopes?.size > 0 && !scopes.has(partnerId);
}

function statusFromCount(count) {
  return count === 0 ? "READY" : "NO_GO";
}

function countDetail(okMessage, count, problemMessage) {
  return count === 0 ? okMessage : `${problemMessage}: ${count}.`;
}

const localEnv = parseEnvFile(envPath);
const missingKeys = requiredEnvKeys.filter((key) => !isMeaningfulSecret(localEnv[key]));

addStatus(
  "LEAD-IMPORT-SCOPE-ENV",
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

    const [
      { data: leads, error: leadsError },
      { data: profiles, error: profilesError },
      { data: segmentScopes, error: segmentScopesError },
      { data: partnerScopes, error: partnerScopesError },
      { data: segments, error: segmentsError },
      { data: partners, error: partnersError },
    ] = await Promise.all([
      adminClient
        .from("leads")
        .select(
          "id,is_deleted,admission_segment_id,partner_id,assigned_to,created_by",
        )
        .eq("is_deleted", false),
      adminClient
        .from("users_profile")
        .select("id,status,role_id,roles(code)")
        .eq("status", "ACTIVE"),
      adminClient
        .from("user_admission_segment_scopes")
        .select("user_id,segment_id,status")
        .eq("status", "ACTIVE"),
      adminClient
        .from("user_partner_scopes")
        .select("user_id,partner_id,status")
        .eq("status", "ACTIVE"),
      adminClient.from("admission_segments").select("id,status"),
      adminClient.from("partners").select("id,status,is_deleted"),
    ]);

    if (leadsError) {
      addStatus(
        "LEAD-IMPORT-SCOPE-LEADS",
        "NO_GO",
        "Could not read active leads. Raw errors are not printed.",
      );
    }

    if (profilesError) {
      addStatus(
        "LEAD-IMPORT-SCOPE-PROFILES",
        "NO_GO",
        "Could not read active users_profile rows. Raw errors are not printed.",
      );
    }

    if (segmentScopesError || partnerScopesError) {
      addStatus(
        "LEAD-IMPORT-SCOPE-USER-SCOPES",
        "NO_GO",
        "Could not read user segment/partner scope rows. Raw errors are not printed.",
      );
    }

    if (segmentsError || partnersError) {
      addStatus(
        "LEAD-IMPORT-SCOPE-MASTERS",
        "NO_GO",
        "Could not read admission segment or partner masters. Raw errors are not printed.",
      );
    }

    if (
      leads &&
      profiles &&
      segmentScopes &&
      partnerScopes &&
      segments &&
      partners
    ) {
      const profileById = new Map(profiles.map((profile) => [profile.id, profile]));
      const segmentStatusById = new Map(
        segments.map((segment) => [segment.id, segment.status]),
      );
      const partnerById = new Map(partners.map((partner) => [partner.id, partner]));
      const segmentScopesByUser = activeScopeMap(
        segmentScopes,
        "user_id",
        "segment_id",
      );
      const partnerScopesByUser = activeScopeMap(
        partnerScopes,
        "user_id",
        "partner_id",
      );
      const missingSegmentLeads = leads.filter((lead) => !lead.admission_segment_id);
      const inactiveSegmentLeads = leads.filter(
        (lead) =>
          lead.admission_segment_id &&
          segmentStatusById.get(lead.admission_segment_id) !== "ACTIVE",
      );
      const inactivePartnerLeads = leads.filter((lead) => {
        if (!lead.partner_id) {
          return false;
        }

        const partner = partnerById.get(lead.partner_id);
        return !partner || partner.status !== "ACTIVE" || partner.is_deleted;
      });
      const missingAssignedProfiles = leads.filter(
        (lead) => lead.assigned_to && !profileById.has(lead.assigned_to),
      );
      const missingCreatedProfiles = leads.filter(
        (lead) => lead.created_by && !profileById.has(lead.created_by),
      );
      const assignedSegmentMismatch = leads.filter((lead) =>
        userSegmentMismatch(
          profileById.get(lead.assigned_to),
          segmentScopesByUser,
          lead.admission_segment_id,
        ),
      );
      const createdSegmentMismatch = leads.filter((lead) =>
        userSegmentMismatch(
          profileById.get(lead.created_by),
          segmentScopesByUser,
          lead.admission_segment_id,
        ),
      );
      const assignedPartnerMismatch = leads.filter((lead) =>
        userPartnerMismatch(
          profileById.get(lead.assigned_to),
          partnerScopesByUser,
          lead.partner_id,
        ),
      );
      const createdPartnerMismatch = leads.filter((lead) =>
        userPartnerMismatch(
          profileById.get(lead.created_by),
          partnerScopesByUser,
          lead.partner_id,
        ),
      );
      const blockedLeadHashes = missingSegmentLeads
        .slice(0, 5)
        .map((lead) => hashLabel(lead.id));

      addStatus(
        "LEAD-IMPORT-SCOPE-ACTIVE-LEADS",
        "READY",
        `Active non-deleted leads checked: ${leads.length}.`,
      );

      addStatus(
        "LEAD-IMPORT-SCOPE-SEGMENT-TAG",
        statusFromCount(missingSegmentLeads.length),
        countDetail(
          "Every active lead has an admission_segment_id.",
          missingSegmentLeads.length,
          "Active leads missing admission_segment_id",
        ) +
          (blockedLeadHashes.length > 0
            ? ` Sample hashed lead labels: ${blockedLeadHashes.join(", ")}.`
            : ""),
      );

      addStatus(
        "LEAD-IMPORT-SCOPE-ACTIVE-SEGMENT",
        statusFromCount(inactiveSegmentLeads.length),
        countDetail(
          "Every active lead points to an active admission segment.",
          inactiveSegmentLeads.length,
          "Active leads pointing to inactive/missing admission segment",
        ),
      );

      addStatus(
        "LEAD-IMPORT-SCOPE-ACTIVE-PARTNER",
        statusFromCount(inactivePartnerLeads.length),
        countDetail(
          "Every active lead partner is active and not deleted when present.",
          inactivePartnerLeads.length,
          "Active leads pointing to inactive/deleted partner",
        ),
      );

      addStatus(
        "LEAD-IMPORT-SCOPE-ACTOR-LINK",
        missingAssignedProfiles.length === 0 && missingCreatedProfiles.length === 0
          ? "READY"
          : "NO_GO",
        missingAssignedProfiles.length === 0 && missingCreatedProfiles.length === 0
          ? "Assigned/created user references are either empty or active CRM profiles."
          : `Leads with missing assigned profile: ${missingAssignedProfiles.length}; missing created_by profile: ${missingCreatedProfiles.length}.`,
      );

      addStatus(
        "LEAD-IMPORT-SCOPE-ASSIGNED-SEGMENT",
        statusFromCount(assignedSegmentMismatch.length),
        countDetail(
          "Assigned scoped users do not have cross-segment active leads.",
          assignedSegmentMismatch.length,
          "Assigned scoped users with lead outside active segment scope",
        ),
      );

      addStatus(
        "LEAD-IMPORT-SCOPE-CREATED-SEGMENT",
        statusFromCount(createdSegmentMismatch.length),
        countDetail(
          "Created-by scoped users do not have cross-segment active leads.",
          createdSegmentMismatch.length,
          "Created-by scoped users with lead outside active segment scope",
        ),
      );

      addStatus(
        "LEAD-IMPORT-SCOPE-ASSIGNED-PARTNER",
        statusFromCount(assignedPartnerMismatch.length),
        countDetail(
          "Assigned scoped users do not have cross-partner active leads.",
          assignedPartnerMismatch.length,
          "Assigned scoped users with lead outside active partner scope",
        ),
      );

      addStatus(
        "LEAD-IMPORT-SCOPE-CREATED-PARTNER",
        statusFromCount(createdPartnerMismatch.length),
        countDetail(
          "Created-by scoped users do not have cross-partner active leads.",
          createdPartnerMismatch.length,
          "Created-by scoped users with lead outside active partner scope",
        ),
      );

      addStatus(
        "LEAD-IMPORT-SCOPE-SUMMARY",
        "READY",
        [
          `active_leads=${leads.length}`,
          `missing_segment=${missingSegmentLeads.length}`,
          `active_profiles=${profiles.length}`,
          `active_segment_scope_rows=${segmentScopes.length}`,
          `active_partner_scope_rows=${partnerScopes.length}`,
        ].join("; "),
      );
    }
  } catch {
    addStatus(
      "LEAD-IMPORT-SCOPE-CHECK",
      "NO_GO",
      "Lead/import scope readiness check could not complete. Check server env/project and database schema. Raw errors are not printed.",
    );
  }
} else {
  addStatus(
    "LEAD-IMPORT-SCOPE-CHECK",
    "NO_GO",
    "Lead/import scope checks were skipped because required env keys are missing.",
  );
}

console.log("HEU lead/import scope readiness check");
console.log("Secrets, emails, names, phone numbers and raw lead IDs are never printed by this script.");

for (const item of statuses) {
  console.log(`${item.status} ${item.code}: ${item.detail}`);
}

if (statuses.some((item) => item.status !== "READY")) {
  process.exitCode = 1;
}
