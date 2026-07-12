import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const repoRoot = process.cwd();
const envPath = path.resolve(
  repoRoot,
  process.env.HEU_ENV_FILE || ".env.local",
);

function parseEnv(filePath) {
  if (!existsSync(filePath)) return {};
  const env = {};
  for (const rawLine of readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const separator = line.indexOf("=");
    if (separator < 1) continue;
    env[line.slice(0, separator)] = line
      .slice(separator + 1)
      .trim()
      .replace(/^['"]|['"]$/g, "");
  }
  return env;
}

const env = parseEnv(envPath);
const requiredKeys = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
];
if (requiredKeys.some((key) => !env[key])) {
  console.error("NO_GO ACTOR-REPAIR-ENV: required server env is unavailable.");
  process.exit(1);
}

const client = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

const [leadsResult, positionsResult, assignmentsResult, profilesResult, scopesResult] =
  await Promise.all([
    client
      .from("leads")
      .select("assigned_to,created_by,admission_segment_id")
      .eq("is_deleted", false),
    client
      .from("heu_org_positions")
      .select("id,position_code,status")
      .eq("position_code", "TUYEN_SINH_HEAD")
      .eq("status", "ACTIVE"),
    client
      .from("heu_position_assignments")
      .select("position_id,user_id,assignment_status,status")
      .eq("status", "ACTIVE"),
    client.from("users_profile").select("id,status"),
    client
      .from("user_admission_segment_scopes")
      .select("user_id,segment_id,status")
      .eq("status", "ACTIVE"),
  ]);

if (
  leadsResult.error ||
  positionsResult.error ||
  assignmentsResult.error ||
  profilesResult.error ||
  scopesResult.error
) {
  console.error("NO_GO ACTOR-REPAIR-READ: one or more metadata reads failed.");
  process.exit(1);
}

const leads = leadsResult.data ?? [];
const profiles = new Map(
  (profilesResult.data ?? []).map((profile) => [profile.id, profile]),
);
const position = positionsResult.data?.[0] ?? null;
const assignment = (assignmentsResult.data ?? []).find(
  (row) =>
    position &&
    row.position_id === position.id &&
    row.assignment_status === "ACTIVE_ASSIGNED",
);
const targetProfile = assignment ? profiles.get(assignment.user_id) : null;
const targetScopes = new Set(
  (scopesResult.data ?? [])
    .filter((scope) => scope.user_id === assignment?.user_id)
    .map((scope) => scope.segment_id),
);
const repairRows = leads.filter((lead) => {
  const assignedProfile = lead.assigned_to
    ? profiles.get(lead.assigned_to)
    : null;
  return lead.assigned_to && assignedProfile?.status !== "ACTIVE";
});
const eligibleRepairRows = repairRows.filter(
  (lead) =>
    lead.admission_segment_id && targetScopes.has(lead.admission_segment_id),
);
const excludedOutOfScopeRows = repairRows.length - eligibleRepairRows.length;
const uniqueCurrentActors = new Set(
  repairRows.map((lead) => lead.assigned_to).filter(Boolean),
);

const ready =
  Boolean(position) &&
  Boolean(assignment) &&
  targetProfile?.status === "ACTIVE" &&
  targetScopes.size > 0 &&
  eligibleRepairRows.length > 0;

console.log("HEU admission pilot actor repair queue (READ_ONLY)");
console.log(
  [
    `repair_rows=${repairRows.length}`,
    `eligible_in_scope_rows=${eligibleRepairRows.length}`,
    `excluded_out_of_scope_rows=${excludedOutOfScopeRows}`,
    `unique_current_actors=${uniqueCurrentActors.size}`,
    `target_position_present=${Boolean(position)}`,
    `target_assignment_present=${Boolean(assignment)}`,
    `target_profile_active=${targetProfile?.status === "ACTIVE"}`,
    `target_active_segment_scopes=${targetScopes.size}`,
  ].join("; "),
);
console.log(
  ready
    ? "READY ACTOR-REPAIR-QUEUE: snapshot and soft rollback plan may be prepared; no mutation executed."
    : "NO_GO ACTOR-REPAIR-QUEUE: target owner/scope is not ready; no mutation executed.",
);

if (!ready) process.exitCode = 1;
