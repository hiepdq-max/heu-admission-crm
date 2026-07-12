import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const files = {
  action: "app/settings/actions.ts",
  form: "components/settings/user-business-scope-settings.tsx",
  leadVisibilitySchema: "database/step40_user_lead_visibility.sql",
};
const failures = [];

function readRequired(relativePath) {
  const absolutePath = path.join(repoRoot, relativePath);
  if (!existsSync(absolutePath)) {
    failures.push(`missing ${relativePath}`);
    return "";
  }
  return readFileSync(absolutePath, "utf8");
}

function requireTokens(content, label, tokens) {
  const missing = tokens.filter((token) => !content.includes(token));
  if (missing.length > 0) {
    failures.push(`${label}: missing ${missing.join(", ")}`);
  }
}

const action = readRequired(files.action);
const form = readRequired(files.form);
const leadVisibilitySchema = readRequired(files.leadVisibilitySchema);

requireTokens(action, "server guard", [
  "normalizeControlledEvidenceId",
  "scope_owner_approval_required",
  "scope_controlled_evidence_id_required",
  "scope_controlled_evidence_id_invalid",
  "owner-approved scope channel confirmed",
  "controlled_evidence_id=${controlledEvidenceId}",
  "note: scopeUpdateNote",
  "/\\d{9,}/.test(normalized)",
]);

requireTokens(form, "operator form", [
  'name="scope_owner_approved"',
  'name="scope_controlled_evidence_id"',
  'pattern="CE-SCOPE-',
  'autoComplete="off"',
  "P0-17_SCOPE_OWNER_APPROVAL_ACK",
  "P0-17_SCOPE_CONTROLLED_EVIDENCE_ID",
  "Khong nhap",
  "CCCD",
  "token",
  "mat khau",
]);

requireTokens(leadVisibilitySchema, "existing schema contract", [
  "create table if not exists public.user_lead_visibility_scopes",
  "note text",
]);

const firstScopeWrite = action.indexOf(
  '.from("user_admission_segment_scopes")',
);
for (const gate of [
  "scope_owner_approval_required",
  "scope_controlled_evidence_id_required",
  "scope_controlled_evidence_id_invalid",
]) {
  const gateIndex = action.indexOf(gate);
  if (gateIndex === -1 || firstScopeWrite === -1 || gateIndex > firstScopeWrite) {
    failures.push(`server guard must run before first scope write: ${gate}`);
  }
}

if (failures.length > 0) {
  for (const failure of failures) {
    console.error(`HEU_USER_PILOT_SCOPE_SAVE_GUARD: NO_GO - ${failure}`);
  }
  process.exit(1);
}

console.log("HEU_USER_PILOT_SCOPE_SAVE_GUARD: PASS_LOCAL");
console.log("Scope change without owner/evidence reference: NO_GO");
console.log("Real-user activation and production: NO_GO");
