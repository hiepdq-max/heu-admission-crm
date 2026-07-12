import { readFileSync } from "node:fs";
import path from "node:path";

const scriptPath = "scripts/apply-heu-admission-pilot-actor-repair.mjs";
const source = readFileSync(path.join(process.cwd(), scriptPath), "utf8");
const requiredTokens = [
  'new Set(["plan", "apply", "rollback"])',
  "APPLY_SCOPED_LEAD_ACTOR_REPAIR",
  "ROLLBACK_SCOPED_LEAD_ACTOR_REPAIR",
  "HEU_ACTOR_REPAIR_EXPECTED_COUNT",
  "HEU_ACTOR_REPAIR_SNAPSHOT_PATH",
  "HEU_ACTOR_REPAIR_OPERATOR_USER_ID",
  "HEU-ADM-ACTOR-",
  'position_code", "TUYEN_SINH_HEAD',
  "targetProfile?.status !== \"ACTIVE\"",
  "created_by_mutation=0",
  "HEU_ADMISSION_ACTOR_REASSIGNED",
  "HEU_ADMISSION_ACTOR_REPAIR_ROLLBACK",
  "HEU_ADMISSION_ACTOR_REPAIR_AUTO_ROLLBACK",
  "previous_assigned_to",
  "updateFailed",
  "auditFailed",
  "restored === snapshot.rows.length",
  'action: "HEU_ADMISSION_ACTOR_REASSIGNED"',
  'entity_type: "leads"',
  '["ADMIN", "IT_DATA", "AUDIT", "IT_DATA_HEAD"]',
  "hard_delete=0",
];
const forbiddenPatterns = [
  /\.delete\s*\(/,
  /created_by\s*:/,
  /\b(?:password|otp)\b|secret_link/i,
  /openai|anthropic|chatgpt/i,
];

const failures = requiredTokens
  .filter((token) => !source.includes(token))
  .map((token) => `missing token: ${token}`);
for (const pattern of forbiddenPatterns) {
  if (pattern.test(source)) failures.push(`forbidden pattern: ${pattern}`);
}
if (failures.length > 0) {
  console.error("HEU admission actor repair controlled apply check failed.");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(
  "HEU admission actor repair controlled apply check passed. Plan by default; exact-count snapshot/audit/rollback gates required.",
);
