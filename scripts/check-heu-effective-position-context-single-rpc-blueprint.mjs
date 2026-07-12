import { readFileSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const contextPath = "lib/heu-workspace-context.ts";
const blueprintPath =
  "docs/HEU_CONTROL/HEU_PERF_009_EFFECTIVE_POSITION_CONTEXT_SINGLE_RPC_BLUEPRINT_20260712.md";
const context = readFileSync(path.join(repoRoot, contextPath), "utf8");
const blueprint = readFileSync(path.join(repoRoot, blueprintPath), "utf8");
const failures = [];

function extractPermissionArray(name) {
  const match = context.match(
    new RegExp(`const ${name} = \\[([\\s\\S]*?)\\] as const;`),
  );

  if (!match) {
    failures.push(`missing permission array: ${name}`);
    return [];
  }

  return [...match[1].matchAll(/["']([^"']+)["']/g)].map(
    (permission) => permission[1],
  );
}

const permissionArrays = [
  "WRITE_DRAFT_PERMISSIONS",
  "IMPORT_LEAD_DRAFT_PERMISSIONS",
  "CTHSSV_HANDOVER_PERMISSIONS",
  "REVIEW_DRAFT_PERMISSIONS",
  "SYSTEM_SCOPE_PERMISSIONS",
].map(extractPermissionArray);
const permissions = permissionArrays.flat();
const uniquePermissions = new Set(permissions);

if (permissions.length !== 13) {
  failures.push(`permission baseline changed: expected 13, found ${permissions.length}`);
}

if (uniquePermissions.size !== 12) {
  failures.push(`unique permission baseline changed: expected 12, found ${uniquePermissions.size}`);
}

if (
  permissions.filter((permission) => permission === "handover.accept_cthssv")
    .length !== 2
) {
  failures.push("expected duplicate handover.accept_cthssv baseline is missing");
}

for (const token of [
  'supabase.rpc("has_permission", { permission_name })',
  "includeActionPermissions",
  "Promise.all",
]) {
  if (!context.includes(token)) {
    failures.push(`current context token missing: ${token}`);
  }
}

const requiredBlueprintTokens = [
  "HEU-PERF-009-EFFECTIVE-POSITION-CONTEXT-SINGLE-RPC-BLUEPRINT",
  "permission_round_trips=13",
  "unique_permission_codes=12",
  "POSITION_MATRIX_INTERSECT_ROLE_OR_VALID_DELEGATION",
  "effective_permissions =",
  "INTERSECT",
  "active_role_permissions UNION valid_delegations",
  "The function must never accept a `user_id`",
  "(select auth.uid())",
  "Revoke execute from `PUBLIC` and `anon`",
  "SECURITY DEFINER REVIEW REQUIRED",
  "search_path = ''",
  "Limit requested permission codes to at most 32",
  "no dynamic SQL",
  "One bounded response under 8 KiB",
  "Shared cross-user cache",
  "Forbidden",
  "The old result remains authoritative",
  "Any difference that grants more access is",
  "Keep `public.has_permission(text)` for RLS",
  "SQL_EXECUTION=NOT_PERFORMED",
  "MIGRATION=NO_GO",
  "RLS_REPLACEMENT=NO_GO",
  "PRODUCTION=NO_GO",
];

for (const token of requiredBlueprintTokens) {
  if (!blueprint.includes(token)) {
    failures.push(`blueprint token missing: ${token}`);
  }
}

const highConfidenceRestrictedPatterns = [
  /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i,
  /\b0\d{9,10}\b/,
  /\b\d{12}\b/,
  /password\s*[:=]\s*["'][^"']+/i,
  /token\s*[:=]\s*["'][^"']+/i,
  /secret\s*[:=]\s*["'][^"']+/i,
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
];

for (const pattern of highConfidenceRestrictedPatterns) {
  if (pattern.test(blueprint)) {
    failures.push(`restricted value pattern found: ${pattern}`);
  }
}

if (failures.length > 0) {
  for (const failure of failures) {
    console.error(`HEU_PERF_009: NO_GO - ${failure}`);
  }
  process.exit(1);
}

console.log("HEU_PERF_009: PASS_LOCAL");
console.log(`permission_round_trips=${permissions.length}`);
console.log(`unique_permission_codes=${uniquePermissions.size}`);
console.log("target_permission_round_trips=1");
console.log("effective_permission_formula=POSITION_MATRIX_INTERSECT_ROLE_OR_VALID_DELEGATION");
console.log("sql_execution=NOT_PERFORMED");
console.log("migration=NO_GO");
console.log("production=NO_GO");
