import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import { createClient } from "@supabase/supabase-js";

const repoRoot = process.cwd();
const envFile = path.resolve(
  repoRoot,
  process.env.HEU_ENV_FILE || ".env.local",
);

function parseEnvFile(filePath) {
  if (!existsSync(filePath)) return {};

  return Object.fromEntries(
    readFileSync(filePath, "utf8")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#") && line.includes("="))
      .map((line) => {
        const separator = line.indexOf("=");
        return [
          line.slice(0, separator).trim(),
          line.slice(separator + 1).trim().replace(/^["']|["']$/g, ""),
        ];
      }),
  );
}

function meaningfulSecret(value) {
  return (
    typeof value === "string" &&
    value.length > 20 &&
    !/placeholder|changeme|example|your[_-]/i.test(value)
  );
}

function setMapAdd(map, key, value) {
  const values = map.get(key) ?? new Set();
  values.add(value);
  map.set(key, values);
}

function setDifference(left, right) {
  return new Set([...left].filter((value) => !right.has(value)));
}

function setIntersection(left, right) {
  return new Set([...left].filter((value) => right.has(value)));
}

function setUnion(left, right) {
  return new Set([...left, ...right]);
}

function isHighRiskPermission(permission) {
  return /(^|\.)(approve|pay|manage)$/.test(permission);
}

async function fetchAllRows(client, table, select, build = (query) => query) {
  const rows = [];
  const pageSize = 1000;

  for (let from = 0; ; from += pageSize) {
    const { data, error } = await build(
      client.from(table).select(select).range(from, from + pageSize - 1),
    );

    if (error) return { rows: [], error: true };
    rows.push(...(data ?? []));
    if ((data ?? []).length < pageSize) return { rows, error: false };
  }
}

function assertStaticContract() {
  const rolePermissionSource = readFileSync(
    path.join(repoRoot, "database/step109_role_permission_soft_revoke_p0_11.sql"),
    "utf8",
  );
  const positionSource = readFileSync(
    path.join(repoRoot, "database/step114_organization_position_permission_matrix.sql"),
    "utf8",
  );

  const requiredRoleTokens = [
    "public.has_permission(permission_name text)",
    "public.role_permissions",
    "public.permission_delegations",
  ];
  const requiredPositionTokens = [
    "public.heu_position_permission_matrix",
    "public.heu_position_assignments",
    "ACTIVE_ASSIGNED",
  ];

  if (
    !requiredRoleTokens.every((token) => rolePermissionSource.includes(token)) ||
    !requiredPositionTokens.every((token) => positionSource.includes(token))
  ) {
    throw new Error("STATIC_PERMISSION_CONTRACT_INCOMPLETE");
  }
}

async function main() {
  assertStaticContract();

  const fileEnv = parseEnvFile(envFile);
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || fileEnv.NEXT_PUBLIC_SUPABASE_URL;
  const serverSecretKey =
    process.env.SUPABASE_SECRET_KEY ||
    fileEnv.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    fileEnv.SUPABASE_SERVICE_ROLE_KEY;

  if (!meaningfulSecret(supabaseUrl) || !meaningfulSecret(serverSecretKey)) {
    console.error(
      "HEU_EFFECTIVE_POSITION_PERMISSION_DRY_RUN: NO_GO - missing controlled server env",
    );
    process.exitCode = 1;
    return;
  }

  const client = createClient(supabaseUrl, serverSecretKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const [
    positionsResult,
    matrixResult,
    assignmentsResult,
    profilesResult,
    rolesResult,
    departmentsResult,
    rolePermissionsResult,
    allRolePermissionsResult,
    delegationsResult,
  ] = await Promise.all([
    fetchAllRows(
      client,
      "heu_org_positions",
      "id,position_code,department_code,default_role_code,status",
      (query) => query.eq("status", "ACTIVE"),
    ),
    fetchAllRows(
      client,
      "heu_position_permission_matrix",
      "position_id,permission,status",
      (query) => query.eq("status", "ACTIVE"),
    ),
    fetchAllRows(
      client,
      "heu_position_assignments",
      "position_id,user_id,assignment_status,status",
      (query) =>
        query
          .eq("status", "ACTIVE")
          .eq("assignment_status", "ACTIVE_ASSIGNED"),
    ),
    fetchAllRows(
      client,
      "users_profile",
      "id,role_id,department_id,status",
      (query) => query.eq("status", "ACTIVE"),
    ),
    fetchAllRows(client, "roles", "id,code"),
    fetchAllRows(
      client,
      "admission_departments",
      "id,code,status",
      (query) => query.eq("status", "ACTIVE"),
    ),
    fetchAllRows(client, "active_role_permissions", "role_id,permission"),
    fetchAllRows(
      client,
      "role_permissions",
      "role_id,permission,status",
    ),
    fetchAllRows(
      client,
      "permission_delegations",
      "to_user_id,permission_code,starts_at,ends_at,delegation_status,record_status",
      (query) =>
        query
          .eq("delegation_status", "ACTIVE")
          .eq("record_status", "ACTIVE"),
    ),
  ]);

  const requiredReadFailed = [
    positionsResult,
    matrixResult,
    assignmentsResult,
    profilesResult,
    rolesResult,
    departmentsResult,
    rolePermissionsResult,
    allRolePermissionsResult,
  ].some((result) => result.error);

  if (requiredReadFailed) {
    console.error(
      "HEU_EFFECTIVE_POSITION_PERMISSION_DRY_RUN: NO_GO - required technical tables are not readable",
    );
    process.exitCode = 1;
    return;
  }

  const positionById = new Map(
    positionsResult.rows.map((row) => [row.id, row]),
  );
  const roleById = new Map(rolesResult.rows.map((row) => [row.id, row]));
  const roleByCode = new Map(rolesResult.rows.map((row) => [row.code, row]));
  const departmentByCode = new Map(
    departmentsResult.rows.map((row) => [row.code, row]),
  );
  const matrixByPosition = new Map();
  const rolePermissionsByRole = new Map();
  const allRolePermissionsByRole = new Map();
  const assignmentsByUser = new Map();
  const delegationsByUser = new Map();
  const now = Date.now();

  for (const row of matrixResult.rows) {
    setMapAdd(matrixByPosition, row.position_id, row.permission);
  }
  for (const row of rolePermissionsResult.rows) {
    setMapAdd(rolePermissionsByRole, row.role_id, row.permission);
  }
  for (const row of allRolePermissionsResult.rows) {
    setMapAdd(allRolePermissionsByRole, row.role_id, row.permission);
  }
  for (const row of assignmentsResult.rows) {
    const rows = assignmentsByUser.get(row.user_id) ?? [];
    rows.push(row);
    assignmentsByUser.set(row.user_id, rows);
  }
  if (!delegationsResult.error) {
    for (const row of delegationsResult.rows) {
      const startsAt = Date.parse(row.starts_at);
      const endsAt = Date.parse(row.ends_at);
      if (startsAt <= now && now <= endsAt) {
        setMapAdd(delegationsByUser, row.to_user_id, row.permission_code);
      }
    }
  }

  const summaryByPosition = new Map();
  let failClosedProfiles = 0;
  let effectiveGrantCount = 0;
  let removedGrantCount = 0;
  let highRiskRemovedCount = 0;
  let delegationOutsidePositionCount = 0;
  const activeCoverageGapPositions = [];
  const allStatusCoverageGapPositions = [];

  for (const position of positionsResult.rows) {
    const defaultRole = roleByCode.get(position.default_role_code);
    if (!defaultRole) continue;

    const matrixPermissions = matrixByPosition.get(position.id) ?? new Set();
    const activeRolePermissions =
      rolePermissionsByRole.get(defaultRole.id) ?? new Set();
    const allRolePermissions =
      allRolePermissionsByRole.get(defaultRole.id) ?? new Set();

    if (setDifference(activeRolePermissions, matrixPermissions).size > 0) {
      activeCoverageGapPositions.push(position.position_code);
    }
    if (setDifference(allRolePermissions, matrixPermissions).size > 0) {
      allStatusCoverageGapPositions.push(position.position_code);
    }
  }

  for (const profile of profilesResult.rows) {
    const assignments = assignmentsByUser.get(profile.id) ?? [];
    if (assignments.length !== 1) {
      failClosedProfiles += 1;
      continue;
    }

    const assignment = assignments[0];
    const position = positionById.get(assignment.position_id);
    const role = roleById.get(profile.role_id);
    const expectedRole = position
      ? roleByCode.get(position.default_role_code)
      : null;
    const expectedDepartment = position
      ? departmentByCode.get(position.department_code)
      : null;

    if (
      !position ||
      !role ||
      !expectedRole ||
      !expectedDepartment ||
      expectedRole.id !== profile.role_id ||
      expectedDepartment.id !== profile.department_id
    ) {
      failClosedProfiles += 1;
      continue;
    }

    const rolePermissions =
      rolePermissionsByRole.get(profile.role_id) ?? new Set();
    const delegatedPermissions =
      delegationsByUser.get(profile.id) ?? new Set();
    const currentCandidatePermissions = setUnion(
      rolePermissions,
      delegatedPermissions,
    );
    const positionPermissions =
      matrixByPosition.get(position.id) ?? new Set();
    const effectivePermissions = setIntersection(
      currentCandidatePermissions,
      positionPermissions,
    );
    const removedPermissions = setDifference(
      currentCandidatePermissions,
      positionPermissions,
    );
    const delegationOutsidePosition = setDifference(
      delegatedPermissions,
      positionPermissions,
    );
    const highRiskRemoved = [...removedPermissions].filter(
      isHighRiskPermission,
    );

    effectiveGrantCount += effectivePermissions.size;
    removedGrantCount += removedPermissions.size;
    highRiskRemovedCount += highRiskRemoved.length;
    delegationOutsidePositionCount += delegationOutsidePosition.size;

    const summary = summaryByPosition.get(position.position_code) ?? {
      accounts: 0,
      candidate: new Set(),
      matrix: new Set(),
      effective: new Set(),
      removed: new Set(),
      highRiskRemoved: new Set(),
    };
    summary.accounts += 1;
    summary.candidate = setUnion(summary.candidate, currentCandidatePermissions);
    summary.matrix = setUnion(summary.matrix, positionPermissions);
    summary.effective = setUnion(summary.effective, effectivePermissions);
    summary.removed = setUnion(summary.removed, removedPermissions);
    summary.highRiskRemoved = setUnion(
      summary.highRiskRemoved,
      new Set(highRiskRemoved),
    );
    summaryByPosition.set(position.position_code, summary);
  }

  console.log("HEU_EFFECTIVE_POSITION_PERMISSION_DRY_RUN: PASS_READ_ONLY");
  console.log("CURRENT_RUNTIME: ROLE_OR_VALID_DELEGATION");
  console.log(
    "PROPOSED_RUNTIME: POSITION_MATRIX_INTERSECT_ROLE_OR_VALID_DELEGATION",
  );
  console.log(`active_profiles=${profilesResult.rows.length}`);
  console.log(`fail_closed_profiles=${failClosedProfiles}`);
  console.log(`effective_grants=${effectiveGrantCount}`);
  console.log(`role_or_delegation_grants_removed=${removedGrantCount}`);
  console.log(`high_risk_grants_removed=${highRiskRemovedCount}`);
  console.log(
    `delegation_outside_position_removed=${delegationOutsidePositionCount}`,
  );
  console.log(
    `delegation_table=${delegationsResult.error ? "NOT_AVAILABLE" : "READ_ONLY_CHECKED"}`,
  );
  console.log(
    `inactive_role_permission_rows=${allRolePermissionsResult.rows.filter((row) => row.status !== "ACTIVE").length}`,
  );
  console.log(
    `active_role_matrix_coverage_gaps=${activeCoverageGapPositions.length}`,
  );
  console.log(
    `all_status_role_matrix_coverage_gaps=${allStatusCoverageGapPositions.length}`,
  );
  console.log(
    `active_gap_positions=${activeCoverageGapPositions.sort().join(",") || "none"}`,
  );
  console.log(
    `all_status_gap_positions=${allStatusCoverageGapPositions.sort().join(",") || "none"}`,
  );

  for (const [positionCode, summary] of [...summaryByPosition].sort(([a], [b]) =>
    a.localeCompare(b),
  )) {
    console.log(
      [
        `position=${positionCode}`,
        `accounts=${summary.accounts}`,
        `candidate=${summary.candidate.size}`,
        `matrix=${summary.matrix.size}`,
        `effective=${summary.effective.size}`,
        `removed=${summary.removed.size}`,
        `high_risk_removed=${summary.highRiskRemoved.size}`,
      ].join("; "),
    );
  }

  console.log("BGH_ROLE_BYPASS: NO_GO_REVIEW_REQUIRED");
  console.log("DATABASE_WRITE: NOT_PERFORMED");
  console.log("RUNTIME_ENFORCEMENT: NO_GO_UNTIL_APPROVED_MIGRATION");
  console.log("PRODUCTION: NO_GO");
}

main().catch(() => {
  console.error(
    "HEU_EFFECTIVE_POSITION_PERMISSION_DRY_RUN: NO_GO - controlled read failed",
  );
  process.exitCode = 1;
});
