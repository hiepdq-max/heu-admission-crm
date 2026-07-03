import crypto from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const repoRoot = process.cwd();
const envPath = path.join(repoRoot, ".env.local");
const ownerQueueDocPath =
  "docs/HEU_POSITION_ASSIGNMENT_OWNER_QUEUE_20260703.md";
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
  return crypto.createHash("sha256").update(String(value)).digest("hex").slice(0, 10);
}

function sampleHashes(rows, key = "id") {
  const hashes = rows
    .slice(0, 5)
    .map((row) => hashLabel(row[key] ?? JSON.stringify(row)));

  return hashes.length > 0
    ? ` Sample hashed row labels: ${hashes.join(", ")}.`
    : "";
}

function mapById(rows) {
  return new Map((rows ?? []).map((row) => [row.id, row]));
}

function mapByCode(rows, codeKey = "code") {
  return new Map((rows ?? []).map((row) => [row[codeKey], row]));
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
    const ownerQueueDoc = read(ownerQueueDocPath);
    const settingsMatrixCheck = read(
      "scripts/check-heu-settings-permission-matrix-readiness.mjs",
    );
    const userAccountAudit = read("scripts/audit-heu-user-account-security.mjs");
    const positionMatrix = read(
      "components/settings/position-assignment-matrix.tsx",
    );

    const requiredTokens = [
      packageJson.scripts?.["check:heu-position-assignment-owner-queue"] ===
      "node scripts/check-heu-position-assignment-owner-queue.mjs"
        ? "package-script-ok"
        : null,
      ownerQueueDoc.includes("HEU Position Assignment Owner Queue - 2026-07-03")
        ? "doc-title-ok"
        : null,
      ownerQueueDoc.includes("POSITION_OWNER_QUEUE_READY / NO_GO / BLOCKED")
        ? "doc-decision-lane-ok"
        : null,
      ownerQueueDoc.includes("Required seat owner assignment is pending")
        ? "doc-pending-ok"
        : null,
      ownerQueueDoc.includes("Do not paste passwords")
        ? "doc-secret-boundary-ok"
        : null,
      settingsMatrixCheck.includes("SETTINGS-MATRIX-POSITIONS")
        ? "settings-check-link-ok"
        : null,
      positionMatrix.includes('data-heu-position-assignment-matrix="P0-17"')
        ? "position-ui-ok"
        : null,
      userAccountAudit.includes("check-heu-position-assignment-owner-queue.mjs")
        ? "audit-hook-ok"
        : null,
    ];
    const missingCount = requiredTokens.filter((token) => !token).length;

    addStatus(
      "POSITION-OWNER-QUEUE-APP-GUARD",
      missingCount === 0 ? "READY" : "NO_GO",
      missingCount === 0
        ? "Owner assignment queue doc, package command, Settings matrix guard and user-account audit hook are wired."
        : `Owner assignment queue static guards missing: ${missingCount}.`,
    );
  } catch {
    addStatus(
      "POSITION-OWNER-QUEUE-APP-GUARD",
      "NO_GO",
      "Owner assignment queue static guard check could not complete. Raw errors are not printed.",
    );
  }
}

const localEnv = parseEnvFile(envPath);
const missingKeys = requiredEnvKeys.filter((key) => !isMeaningfulSecret(localEnv[key]));

addStatus(
  "POSITION-OWNER-QUEUE-ENV",
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
      positionsResult,
      assignmentsResult,
      profilesResult,
      rolesResult,
      departmentsResult,
      leadVisibilityResult,
      segmentScopesResult,
      partnerScopesResult,
      workspacePreferencesResult,
    ] = await Promise.all([
      fetchAllRows(
        adminClient,
        "heu_org_positions",
        "id,position_code,position_group,department_code,default_role_code,reports_to_position_code,seat_order,required_assignment,status",
        (query) => query.eq("status", "ACTIVE"),
      ),
      fetchAllRows(
        adminClient,
        "heu_position_assignments",
        "id,position_id,user_id,assignment_status,status",
        (query) => query.eq("status", "ACTIVE"),
      ),
      fetchAllRows(
        adminClient,
        "users_profile",
        "id,role_id,department_id,manager_id,status",
        (query) => query.eq("status", "ACTIVE"),
      ),
      fetchAllRows(adminClient, "roles", "id,code,name"),
      fetchAllRows(
        adminClient,
        "admission_departments",
        "id,code,name,status",
        (query) => query.eq("status", "ACTIVE"),
      ),
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
      positionsResult.error ||
      assignmentsResult.error ||
      profilesResult.error ||
      rolesResult.error ||
      departmentsResult.error ||
      leadVisibilityResult.error ||
      segmentScopesResult.error ||
      partnerScopesResult.error ||
      workspacePreferencesResult.error;

    addStatus(
      "POSITION-OWNER-QUEUE-DB-READ",
      readFailed ? "NO_GO" : "READY",
      readFailed
        ? "Could not read one or more owner assignment queue tables. Raw errors are not printed."
        : "Owner assignment queue tables are readable with the server-only service role key.",
    );

    if (!readFailed) {
      const positions = positionsResult.data ?? [];
      const assignments = assignmentsResult.data ?? [];
      const profiles = profilesResult.data ?? [];
      const roles = rolesResult.data ?? [];
      const departments = departmentsResult.data ?? [];
      const leadVisibility = leadVisibilityResult.data ?? [];
      const segmentScopes = segmentScopesResult.data ?? [];
      const partnerScopes = partnerScopesResult.data ?? [];
      const workspacePreferences = workspacePreferencesResult.data ?? [];

      const roleById = mapById(roles);
      const roleByCode = mapByCode(roles, "code");
      const departmentByCode = mapByCode(departments, "code");
      const assignedByPositionId = new Map();
      const assignedUserIds = new Set();

      for (const assignment of assignments) {
        if (assignment.assignment_status === "ACTIVE_ASSIGNED" && assignment.user_id) {
          assignedByPositionId.set(assignment.position_id, assignment);
          assignedUserIds.add(assignment.user_id);
        }
      }

      const requiredPositions = positions
        .filter((position) => position.required_assignment)
        .sort((left, right) => left.seat_order - right.seat_order);
      const missingRolePositions = requiredPositions.filter(
        (position) => !roleByCode.has(position.default_role_code),
      );
      const missingDepartmentPositions = requiredPositions.filter(
        (position) => !departmentByCode.has(position.department_code),
      );
      const unassignedRequiredPositions = requiredPositions.filter(
        (position) => !assignedByPositionId.has(position.id),
      );
      const pendingRequiredPositionCodes = unassignedRequiredPositions
        .map((position) => position.position_code)
        .join(",");

      addStatus(
        "POSITION-OWNER-QUEUE-REQUIRED-SEATS",
        requiredPositions.length > 0 &&
          missingRolePositions.length === 0 &&
          missingDepartmentPositions.length === 0
          ? "READY"
          : "NO_GO",
        requiredPositions.length > 0 &&
          missingRolePositions.length === 0 &&
          missingDepartmentPositions.length === 0
          ? [
              `required_positions=${requiredPositions.length}`,
              `assigned_required_positions=${
                requiredPositions.length - unassignedRequiredPositions.length
              }`,
              `unassigned_required_positions=${unassignedRequiredPositions.length}`,
              `pending_required_position_codes=${pendingRequiredPositionCodes || "none"}`,
            ].join("; ")
          : `Required position queue has missing role/department references: roles=${missingRolePositions.length}; departments=${missingDepartmentPositions.length}.`,
      );

      const candidateProfilesByPositionId = new Map();
      const candidateProfileIds = new Set();

      for (const position of unassignedRequiredPositions) {
        const role = roleByCode.get(position.default_role_code);
        const department = departmentByCode.get(position.department_code);

        if (!role || !department) {
          continue;
        }

        const matchingProfiles = profiles.filter(
          (profile) =>
            profile.role_id === role.id &&
            profile.department_id === department.id &&
            !assignedUserIds.has(profile.id),
        );

        candidateProfilesByPositionId.set(position.id, matchingProfiles);

        for (const profile of matchingProfiles) {
          candidateProfileIds.add(profile.id);
        }
      }

      const positionsWithCandidates = unassignedRequiredPositions.filter(
        (position) => (candidateProfilesByPositionId.get(position.id) ?? []).length > 0,
      );
      const positionsNeedingCreateOrLink = unassignedRequiredPositions.filter(
        (position) => (candidateProfilesByPositionId.get(position.id) ?? []).length === 0,
      );

      addStatus(
        "POSITION-OWNER-QUEUE-CANDIDATES",
        "READY",
        [
          `positions_with_matching_active_profiles=${positionsWithCandidates.length}`,
          `candidate_profile_count=${candidateProfileIds.size}`,
          `positions_needing_owner_create_or_link=${positionsNeedingCreateOrLink.length}`,
          "candidate match is evidence only, not owner approval",
        ].join("; "),
      );

      const leadVisibilityByUserId = new Map(
        leadVisibility.map((row) => [row.user_id, row.lead_visibility]),
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

      const candidateProfiles = profiles.filter((profile) =>
        candidateProfileIds.has(profile.id),
      );
      const candidateScopeFindings = [];

      for (const profile of candidateProfiles) {
        const roleCode = roleById.get(profile.role_id)?.code ?? "";

        if (privilegedRoleCodes.has(roleCode)) {
          continue;
        }

        const segmentIds = segmentScopeIdsByUserId.get(profile.id) ?? new Set();
        const partnerIds = partnerScopeIdsByUserId.get(profile.id) ?? new Set();
        const activeWorkspace = workspacePreferenceByUserId.get(profile.id);

        if (!leadVisibilityByUserId.has(profile.id)) {
          candidateScopeFindings.push({
            id: profile.id,
            finding: "missing_lead_visibility",
          });
        }

        if (segmentIds.size === 0 && partnerIds.size === 0) {
          candidateScopeFindings.push({
            id: profile.id,
            finding: "missing_business_scope",
          });
        }

        if (segmentIds.size > 0 && (!activeWorkspace || !segmentIds.has(activeWorkspace))) {
          candidateScopeFindings.push({
            id: profile.id,
            finding: "missing_active_workspace",
          });
        }
      }

      addStatus(
        "POSITION-OWNER-QUEUE-CANDIDATE-SCOPE",
        candidateScopeFindings.length === 0 ? "READY" : "NO_GO",
        candidateScopeFindings.length === 0
          ? `Matching candidate profiles with scope basics checked: ${candidateProfiles.length}.`
          : `Matching candidate profiles missing scope basics: ${candidateScopeFindings.length}.` +
              sampleHashes(candidateScopeFindings),
      );

      addStatus(
        "POSITION-OWNER-QUEUE-NO-AUTO-ASSIGN",
        "READY",
        [
          "This checker is read-only",
          `active_position_assignments=${assignments.length}`,
          "owner-approved mapping must be applied through Settings/RPC, not by this script",
        ].join("; "),
      );

      addStatus(
        "POSITION-OWNER-QUEUE-SECRET-BOUNDARY",
        "READY",
        "The queue reports counts, position codes and hashed row labels only; it does not print emails, names, phone numbers, passwords, reset links, service-role keys or raw IDs.",
      );

      addStatus(
        "POSITION-OWNER-QUEUE-SUMMARY",
        "READY",
        [
          `active_profiles=${profiles.length}`,
          `required_positions=${requiredPositions.length}`,
          `unassigned_required_positions=${unassignedRequiredPositions.length}`,
          `positions_with_candidates=${positionsWithCandidates.length}`,
          `positions_needing_create_or_link=${positionsNeedingCreateOrLink.length}`,
        ].join("; "),
      );
    }
  } catch {
    addStatus(
      "POSITION-OWNER-QUEUE-CHECK",
      "NO_GO",
      "Owner assignment queue check could not complete. Check server env/project and database schema. Raw errors are not printed.",
    );
  }
} else {
  addStatus(
    "POSITION-OWNER-QUEUE-CHECK",
    "NO_GO",
    "Owner assignment queue checks were skipped because required env keys are missing.",
  );
}

console.log("HEU position assignment owner queue check");
console.log(
  "Secrets, emails, names, phone numbers and raw IDs are never printed by this script.",
);

for (const item of statuses) {
  console.log(`${item.status} ${item.code}: ${item.detail}`);
}

if (statuses.some((item) => item.status !== "READY")) {
  process.exitCode = 1;
}
