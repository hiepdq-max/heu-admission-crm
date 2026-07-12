import { readFileSync } from "node:fs";

const applyPath = "scripts/apply-heu-pilot-accounting-readonly-scope.mjs";
const packagePath = "package.json";
const apply = readFileSync(applyPath, "utf8");
const pkg = JSON.parse(readFileSync(packagePath, "utf8"));
const requiredTokens = [
  "TC9_TTGDTX_LINKED",
  "PILOT_ACCOUNTING_LEAD_READONLY",
  "PILOT_ACCOUNTING_READONLY",
  "APPLY_ACCOUNTING_READONLY_SEGMENT_SCOPE",
  "ROLLBACK_ACCOUNTING_READONLY_SEGMENT_SCOPE",
  "HEU-ACCT-SCOPE-",
  "user_admission_segment_scopes",
  "audit_logs",
  "permission_mutation=0",
  "lead_visibility_mutation=0",
  "finance_mutation=0",
  "hard_delete=0",
];
const forbiddenPatterns = [
  /\.delete\s*\(/,
  /role_permissions[^\n]*\.(?:insert|update|upsert)\s*\(/,
  /user_lead_visibility_scopes[^\n]*\.(?:insert|update|upsert)\s*\(/,
  /user_partner_scopes[^\n]*\.(?:insert|update|upsert)\s*\(/,
  /auth\.admin\.(?:createUser|updateUserById|inviteUserByEmail)/,
  /\b(?:password|otp|magiclink)\b/i,
  /openai|anthropic|gemini/i,
];
const failures = [];

for (const token of requiredTokens) {
  if (!apply.includes(token)) failures.push(`missing token: ${token}`);
}
for (const pattern of forbiddenPatterns) {
  if (pattern.test(apply)) failures.push(`forbidden pattern: ${pattern}`);
}
if (
  pkg.scripts?.["apply:heu-pilot-accounting-readonly-scope"] !==
    `node ${applyPath}`
) {
  failures.push("missing controlled apply alias");
}
if (
  pkg.scripts?.["check:heu-pilot-accounting-readonly-scope"] !==
    "node scripts/check-heu-pilot-accounting-readonly-scope.mjs"
) {
  failures.push("missing checker alias");
}

if (failures.length > 0) {
  for (const failure of failures) console.error(`NO_GO ${failure}`);
  process.exit(1);
}

console.log("PASS_LOCAL HEU-PILOT-ACCOUNTING-READONLY-SCOPE");
console.log("default_mode=plan; controlled_apply=GATED; rollback=SOFT_STATUS");
console.log("segment_scope=TC9_TTGDTX_LINKED; broad_scope=BLOCKED");
console.log("permission_mutation=0; lead_visibility_mutation=0; finance_mutation=0");
console.log("production=NO_GO");
