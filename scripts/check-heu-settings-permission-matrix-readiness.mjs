import crypto from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const repoRoot = process.cwd();
const envPath = path.resolve(
  repoRoot,
  process.env.HEU_ENV_FILE || ".env.local",
);
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
const permissionMatrixManageRoleCodes = new Set([
  "ADMIN",
  "IT_DATA",
  "IT_DATA_HEAD",
]);
const credentialManageRoleCodes = new Set(["ADMIN", "IT_DATA", "IT_DATA_HEAD"]);
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

function readyFromCount(count) {
  return count === 0 ? "READY" : "NO_GO";
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

function findDuplicateRows(rows, keyName) {
  const seen = new Set();
  const duplicates = [];

  for (const row of rows ?? []) {
    const value = row[keyName];

    if (!value) {
      continue;
    }

    if (seen.has(value)) {
      duplicates.push(row);
    } else {
      seen.add(value);
    }
  }

  return duplicates;
}

function roleCodesForPermission(rolePermissions, roleById, permission) {
  return (rolePermissions ?? [])
    .filter((row) => row.permission === permission)
    .map((row) => roleById.get(row.role_id)?.code ?? "UNKNOWN_ROLE")
    .sort();
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

function checkAppGuards() {
  try {
    const packageJson = JSON.parse(read("package.json"));
    const scopePage = read("app/settings/scopes/page.tsx");
    const matrixComponent = read(
      "components/settings/position-assignment-matrix.tsx",
    );
    const userAccessGuide = read(
      "components/settings/user-access-workflow-guide.tsx",
    );
    const actions = read("app/settings/actions.ts");
    const sqlSource = read("database/step114_organization_position_permission_matrix.sql");

    const requiredTokens = [
      packageJson.scripts?.["check:heu-settings-permission-matrix-readiness"] ===
      "node scripts/check-heu-settings-permission-matrix-readiness.mjs"
        ? "package-script-ok"
        : null,
      scopePage.includes('permission_name: "permission_matrix.read"')
        ? "scope-read-ok"
        : null,
      scopePage.includes('permission_name: "permission_matrix.manage"')
        ? "scope-manage-ok"
        : null,
      scopePage.includes("heu_position_matrix_status") ? "status-view-ok" : null,
      scopePage.includes("<PositionAssignmentMatrix") ? "matrix-ui-ok" : null,
      scopePage.includes("<UserScopeEnforcementPanel") ? "scope-panel-ok" : null,
      scopePage.includes("<UserAccessWorkflowGuide />") ? "workflow-guide-ok" : null,
      matrixComponent.includes('data-heu-position-assignment-matrix="P0-17"')
        ? "matrix-data-attr-ok"
        : null,
      matrixComponent.includes("data-heu-position-matrix-overflow-guard")
        ? "matrix-overflow-ok"
        : null,
      matrixComponent.includes("assignHeuPositionByEmailAction")
        ? "assign-action-ui-ok"
        : null,
      matrixComponent.includes("setUserTemporaryPasswordAction")
        ? "temp-password-ui-ok"
        : null,
      matrixComponent.includes("sendUserPasswordResetEmailAction")
        ? "reset-email-ui-ok"
        : null,
      actions.includes("requirePositionMatrixManage") ? "manage-guard-ok" : null,
      actions.includes("assign_heu_position_by_email") ? "assign-rpc-ok" : null,
      actions.includes("not_allowed_position_assignment")
        ? "assignment-error-ok"
        : null,
      actions.includes("isUnsafeTemporaryPassword")
        ? "unsafe-password-guard-ok"
        : null,
      sqlSource.includes("public.can_read_permission_matrix()")
        ? "read-function-ok"
        : null,
      sqlSource.includes("public.can_manage_permission_matrix()")
        ? "manage-function-ok"
        : null,
      sqlSource.includes("heu_org_positions") ? "positions-table-ok" : null,
      sqlSource.includes("heu_position_permission_matrix")
        ? "position-permission-table-ok"
        : null,
      sqlSource.includes("heu_position_assignments")
        ? "assignment-table-ok"
        : null,
      userAccessGuide.includes(
        'data-heu-user-access-workflow-guide="P0-17_USER_ACCESS_WORKFLOW_GUIDE"',
      )
        ? "workflow-data-attr-ok"
        : null,
    ];
    const missingCount = requiredTokens.filter((token) => !token).length;

    addStatus(
      "SETTINGS-MATRIX-APP-GUARD",
      missingCount === 0 ? "READY" : "NO_GO",
      missingCount === 0
        ? "Settings scope page, position matrix UI, workflow guide, actions and Step114 SQL guard the permission matrix surface."
        : `Settings permission matrix static guards missing: ${missingCount}.`,
    );
  } catch {
    addStatus(
      "SETTINGS-MATRIX-APP-GUARD",
      "NO_GO",
      "Settings permission matrix static guard check could not complete. Raw errors are not printed.",
    );
  }
}

const localEnv = parseEnvFile(envPath);
const missingKeys = requiredEnvKeys.filter((key) => !isMeaningfulSecret(localEnv[key]));

addStatus(
  "SETTINGS-MATRIX-ENV",
  missingKeys.length === 0 ? "READY" : "NO_GO",
  missingKeys.length === 0
    ? ".env.local has required Supabase env keys. Values are intentionally hidden."
    : `.env.local missing or placeholder keys: ${missingKeys.join(", ")}.`,
);

checkAppGuards();

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
      permissionMatrixResult,
      assignmentsResult,
      rolesResult,
      rolePermissionsResult,
      departmentsResult,
      profilesResult,
    ] = await Promise.all([
      fetchAllRows(
        adminClient,
        "heu_org_positions",
        "id,position_code,position_name,position_group,department_code,default_role_code,reports_to_position_code,seat_order,required_assignment,control_status,status",
        (query) => query.eq("status", "ACTIVE"),
      ),
      fetchAllRows(
        adminClient,
        "heu_position_permission_matrix",
        "id,position_id,permission,permission_source,status",
        (query) => query.eq("status", "ACTIVE"),
      ),
      fetchAllRows(
        adminClient,
        "heu_position_assignments",
        "id,position_id,user_id,assignment_status,assigned_by,status",
        (query) => query.eq("status", "ACTIVE"),
      ),
      fetchAllRows(adminClient, "roles", "id,code,name"),
      fetchAllRows(
        adminClient,
        "active_role_permissions",
        "role_id,permission",
      ),
      fetchAllRows(
        adminClient,
        "admission_departments",
        "id,code,name,status",
        (query) => query.eq("status", "ACTIVE"),
      ),
      fetchAllRows(
        adminClient,
        "users_profile",
        "id,role_id,department_id,manager_id,status",
        (query) => query.eq("status", "ACTIVE"),
      ),
    ]);

    const readFailed =
      positionsResult.error ||
      permissionMatrixResult.error ||
      assignmentsResult.error ||
      rolesResult.error ||
      rolePermissionsResult.error ||
      departmentsResult.error ||
      profilesResult.error;

    addStatus(
      "SETTINGS-MATRIX-DB-READ",
      readFailed ? "NO_GO" : "READY",
      readFailed
        ? "Could not read one or more Settings permission matrix tables/views. Raw errors are not printed."
        : "Settings permission matrix base tables are readable with the server-only service role key.",
    );

    if (!readFailed) {
      const positions = positionsResult.data ?? [];
      const permissionMatrix = permissionMatrixResult.data ?? [];
      const assignments = assignmentsResult.data ?? [];
      const roles = rolesResult.data ?? [];
      const rolePermissions = rolePermissionsResult.data ?? [];
      const departments = departmentsResult.data ?? [];
      const profiles = profilesResult.data ?? [];

      const positionById = mapById(positions);
      const positionByCode = mapByCode(positions, "position_code");
      const roleById = mapById(roles);
      const roleByCode = mapByCode(roles, "code");
      const departmentByCode = mapByCode(departments, "code");
      const profileById = mapById(profiles);
      const rolePermissionsByRoleId = new Map();
      const matrixPermissionsByPositionId = new Map();

      for (const row of rolePermissions) {
        addToSetMap(rolePermissionsByRoleId, row.role_id, row.permission);
      }

      for (const row of permissionMatrix) {
        addToSetMap(matrixPermissionsByPositionId, row.position_id, row.permission);
      }

      const activeAssignedAssignments = assignments.filter(
        (row) => row.assignment_status === "ACTIVE_ASSIGNED" && row.user_id,
      );
      const activeAssignedByPositionId = new Map(
        activeAssignedAssignments.map((row) => [row.position_id, row]),
      );
      const requiredPositions = positions.filter((row) => row.required_assignment);
      const requiredUnassigned = requiredPositions.filter(
        (row) => !activeAssignedByPositionId.has(row.id),
      );
      const missingRolePositions = positions.filter(
        (row) => !roleByCode.has(row.default_role_code),
      );
      const missingDepartmentPositions = positions.filter(
        (row) => !departmentByCode.has(row.department_code),
      );
      const missingManagerPositions = positions.filter(
        (row) =>
          row.reports_to_position_code &&
          !positionByCode.has(row.reports_to_position_code),
      );

      addStatus(
        "SETTINGS-MATRIX-POSITIONS",
        positions.length > 0 &&
          missingRolePositions.length === 0 &&
          missingDepartmentPositions.length === 0 &&
          missingManagerPositions.length === 0
          ? "READY"
          : "NO_GO",
        positions.length > 0 &&
          missingRolePositions.length === 0 &&
          missingDepartmentPositions.length === 0 &&
          missingManagerPositions.length === 0
          ? [
              `active_positions=${positions.length}`,
              `required_positions=${requiredPositions.length}`,
              `required_unassigned=${requiredUnassigned.length}`,
              "owner assignment pending, not auto-filled by Codex",
            ].join("; ")
          : `Position matrix references missing roles/departments/managers: roles=${missingRolePositions.length}; departments=${missingDepartmentPositions.length}; managers=${missingManagerPositions.length}.`,
      );

      const matrixRowsMissingPosition = permissionMatrix.filter(
        (row) => !positionById.has(row.position_id),
      );
      const matrixCoverageGaps = [];
      const positionsWithoutRolePermissions = [];

      for (const position of positions) {
        const role = roleByCode.get(position.default_role_code);

        if (!role) {
          continue;
        }

        const rolePermissionSet = rolePermissionsByRoleId.get(role.id) ?? new Set();
        const positionPermissionSet =
          matrixPermissionsByPositionId.get(position.id) ?? new Set();

        if (rolePermissionSet.size === 0) {
          positionsWithoutRolePermissions.push(position);
          continue;
        }

        for (const permission of rolePermissionSet) {
          if (!positionPermissionSet.has(permission)) {
            matrixCoverageGaps.push(position);
            break;
          }
        }
      }

      addStatus(
        "SETTINGS-MATRIX-PERMISSIONS",
        permissionMatrix.length > 0 &&
          matrixRowsMissingPosition.length === 0 &&
          matrixCoverageGaps.length === 0 &&
          positionsWithoutRolePermissions.length === 0
          ? "READY"
          : "NO_GO",
        permissionMatrix.length > 0 &&
          matrixRowsMissingPosition.length === 0 &&
          matrixCoverageGaps.length === 0 &&
          positionsWithoutRolePermissions.length === 0
          ? `Active position-permission rows: ${permissionMatrix.length}; every active position covers its default role permissions.`
          : `Position-permission gaps: missing_position_rows=${matrixRowsMissingPosition.length}; coverage_gaps=${matrixCoverageGaps.length}; default_roles_without_permissions=${positionsWithoutRolePermissions.length}.` +
              sampleHashes([
                ...matrixRowsMissingPosition,
                ...matrixCoverageGaps,
                ...positionsWithoutRolePermissions,
              ]),
      );

      const duplicateActivePositions = findDuplicateRows(assignments, "position_id");
      const duplicateActiveUsers = findDuplicateRows(
        activeAssignedAssignments,
        "user_id",
      );
      const assignmentsMissingPosition = assignments.filter(
        (row) => !positionById.has(row.position_id),
      );
      const assignmentsMissingUser = assignments.filter(
        (row) => row.user_id && !profileById.has(row.user_id),
      );
      const activeAssignedMissingUser = activeAssignedAssignments.filter(
        (row) => !profileById.has(row.user_id),
      );
      const assignmentProfileMismatches = [];
      const assignmentManagerMismatches = [];

      for (const assignment of activeAssignedAssignments) {
        const position = positionById.get(assignment.position_id);
        const profile = profileById.get(assignment.user_id);

        if (!position || !profile) {
          continue;
        }

        const role = roleByCode.get(position.default_role_code);
        const department = departmentByCode.get(position.department_code);

        if (
          !role ||
          !department ||
          profile.role_id !== role.id ||
          profile.department_id !== department.id
        ) {
          assignmentProfileMismatches.push(assignment);
        }

        const managerPosition = position.reports_to_position_code
          ? positionByCode.get(position.reports_to_position_code)
          : null;
        const managerAssignment = managerPosition
          ? activeAssignedByPositionId.get(managerPosition.id)
          : null;

        if (
          managerAssignment?.user_id &&
          managerAssignment.user_id !== assignment.user_id &&
          profile.manager_id !== managerAssignment.user_id
        ) {
          assignmentManagerMismatches.push(assignment);
        }
      }

      const assignmentFindings = [
        ...duplicateActivePositions,
        ...duplicateActiveUsers,
        ...assignmentsMissingPosition,
        ...assignmentsMissingUser,
        ...activeAssignedMissingUser,
        ...assignmentProfileMismatches,
        ...assignmentManagerMismatches,
      ];

      addStatus(
        "SETTINGS-MATRIX-ASSIGNMENTS",
        readyFromCount(assignmentFindings.length),
        assignmentFindings.length === 0
          ? `Active position assignments checked: ${assignments.length}; active assigned users: ${activeAssignedAssignments.length}.`
          : `Position assignment consistency findings: duplicate_positions=${duplicateActivePositions.length}; duplicate_users=${duplicateActiveUsers.length}; missing_positions=${assignmentsMissingPosition.length}; missing_users=${assignmentsMissingUser.length}; active_assigned_missing_users=${activeAssignedMissingUser.length}; role_department_mismatches=${assignmentProfileMismatches.length}; manager_mismatches=${assignmentManagerMismatches.length}.` +
              sampleHashes(assignmentFindings),
      );

      const systemManageRoleCodes = roleCodesForPermission(
        rolePermissions,
        roleById,
        "system.manage",
      );
      const permissionManageRoleCodes = roleCodesForPermission(
        rolePermissions,
        roleById,
        "permission_matrix.manage",
      );
      const usersCreateRoleCodes = roleCodesForPermission(
        rolePermissions,
        roleById,
        "users.create",
      );
      const usersManageRoleCodes = roleCodesForPermission(
        rolePermissions,
        roleById,
        "users.manage",
      );
      const unsafeSystemManageRoles = systemManageRoleCodes.filter(
        (code) => code !== "ADMIN",
      );
      const unsafePermissionManageRoles = permissionManageRoleCodes.filter(
        (code) => !permissionMatrixManageRoleCodes.has(code),
      );
      const unsafeCredentialRoles = [
        ...usersCreateRoleCodes,
        ...usersManageRoleCodes,
      ].filter((code) => !credentialManageRoleCodes.has(code));

      addStatus(
        "SETTINGS-MATRIX-ROLE-RISK",
        unsafeSystemManageRoles.length === 0 &&
          unsafePermissionManageRoles.length === 0 &&
          unsafeCredentialRoles.length === 0
          ? "READY"
          : "NO_GO",
        unsafeSystemManageRoles.length === 0 &&
          unsafePermissionManageRoles.length === 0 &&
          unsafeCredentialRoles.length === 0
          ? [
              `system.manage=${systemManageRoleCodes.join(",") || "none"}`,
              `permission_matrix.manage=${permissionManageRoleCodes.join(",") || "none"}`,
              `credential_manage=${Array.from(
                new Set([...usersCreateRoleCodes, ...usersManageRoleCodes]),
              )
                .sort()
                .join(",") || "none"}`,
            ].join("; ")
          : `Unsafe role permission grants: system_manage=${unsafeSystemManageRoles.length}; permission_matrix_manage=${unsafePermissionManageRoles.length}; credential_manage=${unsafeCredentialRoles.length}.`,
      );

      const profilesMissingRole = profiles.filter((row) => !row.role_id);
      const profilesMissingDepartment = profiles.filter((row) => !row.department_id);
      const nonPrivilegedSystemManageUsers = profiles.filter((profile) => {
        const role = roleById.get(profile.role_id);
        const permissionSet = rolePermissionsByRoleId.get(profile.role_id) ?? new Set();

        return (
          role &&
          !privilegedRoleCodes.has(role.code) &&
          permissionSet.has("system.manage")
        );
      });
      const unauthorizedMatrixManageUsers = profiles.filter((profile) => {
        const role = roleById.get(profile.role_id);
        const permissionSet = rolePermissionsByRoleId.get(profile.role_id) ?? new Set();

        return (
          role &&
          permissionSet.has("permission_matrix.manage") &&
          !permissionMatrixManageRoleCodes.has(role.code)
        );
      });
      const activeUserFindings = [
        ...profilesMissingRole,
        ...profilesMissingDepartment,
        ...nonPrivilegedSystemManageUsers,
        ...unauthorizedMatrixManageUsers,
      ];

      addStatus(
        "SETTINGS-MATRIX-ACTIVE-USERS",
        readyFromCount(activeUserFindings.length),
        activeUserFindings.length === 0
          ? `Active profiles checked: ${profiles.length}; active profiles assigned to HEU positions: ${activeAssignedAssignments.length}.`
          : `Active profile role/permission findings: missing_role=${profilesMissingRole.length}; missing_department=${profilesMissingDepartment.length}; non_privileged_system_manage=${nonPrivilegedSystemManageUsers.length}; unauthorized_matrix_manage=${unauthorizedMatrixManageUsers.length}.` +
              sampleHashes(activeUserFindings),
      );

      addStatus(
        "SETTINGS-MATRIX-SECRET-BOUNDARY",
        "READY",
        "The check reports counts and hashed row labels only; it does not print emails, names, phone numbers, passwords, reset links, service-role keys or raw IDs.",
      );

      addStatus(
        "SETTINGS-MATRIX-SUMMARY",
        "READY",
        [
          `positions=${positions.length}`,
          `required_positions=${requiredPositions.length}`,
          `assigned_positions=${activeAssignedAssignments.length}`,
          `required_unassigned=${requiredUnassigned.length}`,
          `position_matrix_permissions=${permissionMatrix.length}`,
          `active_users=${profiles.length}`,
        ].join("; "),
      );
    }
  } catch {
    addStatus(
      "SETTINGS-MATRIX-CHECK",
      "NO_GO",
      "Settings permission matrix readiness check could not complete. Check server env/project and database schema. Raw errors are not printed.",
    );
  }
} else {
  addStatus(
    "SETTINGS-MATRIX-CHECK",
    "NO_GO",
    "Settings permission matrix checks were skipped because required env keys are missing.",
  );
}

console.log("HEU Settings permission matrix readiness check");
console.log(
  "Secrets, emails, names, phone numbers and raw IDs are never printed by this script.",
);

for (const item of statuses) {
  console.log(`${item.status} ${item.code}: ${item.detail}`);
}

if (statuses.some((item) => item.status !== "READY")) {
  process.exitCode = 1;
}
