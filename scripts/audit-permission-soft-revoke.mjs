import { readFileSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();

function read(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), "utf8");
}

function fail(message) {
  console.error(`Permission soft-revoke audit failed: ${message}`);
  process.exitCode = 1;
}

function requirePattern(contents, pattern, label) {
  if (!pattern.test(contents)) {
    fail(`Missing ${label}.`);
  }
}

function forbidPattern(contents, pattern, label) {
  if (pattern.test(contents)) {
    fail(`Forbidden ${label}.`);
  }
}

const schema = read("database/schema.sql");
const step109 = read("database/step109_role_permission_soft_revoke_p0_11.sql");
const settingsActions = read("app/settings/actions.ts");
const settingsPage = read("app/settings/page.tsx");

forbidPattern(
  settingsActions,
  /\.delete\s*\(/,
  "Supabase .delete() usage in app/settings/actions.ts",
);

forbidPattern(
  `${step109}\n${settingsActions}`,
  /\bdelete\s+from\s+public\.role_permissions\b/i,
  "hard delete from public.role_permissions",
);

requirePattern(
  schema,
  /unique\s*\(\s*role_id\s*,\s*permission\s*\)/i,
  "role_permissions unique(role_id, permission)",
);

for (const column of [
  "status",
  "assigned_by",
  "revoked_by",
  "revoked_at",
  "note",
  "updated_at",
]) {
  requirePattern(
    step109,
    new RegExp(`add column if not exists ${column}\\b`, "i"),
    `Step109 ${column} column`,
  );
}

requirePattern(
  step109,
  /create\s+index\s+if\s+not\s+exists\s+idx_role_permissions_active_role[\s\S]*where\s+status\s*=\s*'ACTIVE'/i,
  "active role permission index",
);

requirePattern(
  step109,
  /create\s+or\s+replace\s+view\s+public\.active_role_permissions[\s\S]*where\s+status\s*=\s*'ACTIVE'/i,
  "active_role_permissions view filtered to ACTIVE",
);

requirePattern(
  step109,
  /create\s+or\s+replace\s+function\s+public\.has_permission[\s\S]*rp\.status\s*=\s*'ACTIVE'/i,
  "has_permission ACTIVE filter",
);

requirePattern(
  settingsActions,
  /\.from\("role_permissions"\)[\s\S]*\.update\(\s*\{[\s\S]*status:\s*"INACTIVE"[\s\S]*revoked_by:[\s\S]*revoked_at:/,
  "settings role permission soft revoke update",
);

requirePattern(
  settingsActions,
  /\.from\("role_permissions"\)[\s\S]*\.upsert\([\s\S]*onConflict:\s*"role_id,permission"/,
  "settings role permission upsert by role_id,permission",
);

requirePattern(
  settingsPage,
  /\.from\("role_permissions"\)[\s\S]*\.eq\("status",\s*"ACTIVE"\)/,
  "settings page ACTIVE permission read",
);

if (process.exitCode) {
  process.exit(process.exitCode);
}

console.log("Permission soft-revoke audit passed.");
