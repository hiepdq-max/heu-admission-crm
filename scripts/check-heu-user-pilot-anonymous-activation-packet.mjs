import { readFileSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const packetPath =
  "docs/HEU_CONTROL/HEU_USER_PILOT_002_ANONYMOUS_ACCOUNT_POSITION_ACTIVATION_PACKET_20260712.md";
const packet = readFileSync(path.join(repoRoot, packetPath), "utf8");
const failures = [];

function requireTokens(label, tokens) {
  const missing = tokens.filter((token) => !packet.includes(token));
  if (missing.length > 0) {
    failures.push(`${label}: missing ${missing.join(", ")}`);
  }
}

requireTokens("control contract", [
  "HEU-USER-PILOT-002-ANONYMOUS-ACCOUNT-POSITION-ACTIVATION-PACKET",
  "Stage D - internal controlled test only",
  "Production status: NO-GO",
  "Every row is one independent Auth account and one active operating position",
  "No account may union two positions, departments or workspaces",
  "controlled_people=7",
  "pilot_accounts=8",
  "dual_role_people=1",
  "positions_with_matching_active_profiles=0",
  "positions_needing_owner_create_or_link=11",
  "database_write=NOT_PERFORMED",
]);

requireTokens("activation guards", [
  "Provision the Auth user without a password and without sending email",
  "Create or link the CRM profile as `INACTIVE`",
  "Assign exactly one `ACTIVE_ASSIGNED` position",
  "no broad fallback is allowed",
  "DRAFT_CHECK_SUGGEST",
  "Rollback is status-based and never hard-deletes original records",
]);

const expectedRows = new Map([
  ["PILOT-EXEC-01", ["HT", "BGH", "HEU:EXECUTIVE", "READ_ONLY", "VERIFY_EXISTING_OR_CREATE"]],
  ["PILOT-ADMISSION-HEAD-01", ["TUYEN_SINH_HEAD", "PHONG_TUYEN_SINH", "HEU:ADMISSION", "OPERATIONAL_DRAFT", "CREATE_OR_LINK"]],
  ["PILOT-ACCOUNTING-OPS-01", ["KE_TOAN_01", "PHONG_KHTC", "HEU:FINANCE", "READ_ONLY_DRAFT", "CREATE_OR_LINK"]],
  ["PILOT-ACCOUNTING-OPS-02", ["KE_TOAN_02", "PHONG_KHTC", "HEU:FINANCE", "READ_ONLY_DRAFT", "CREATE_OR_LINK"]],
  ["PILOT-ACCOUNTING-MANAGER-01", ["KE_TOAN_03", "PHONG_KHTC", "HEU:FINANCE", "READ_ONLY_NO_APPROVE", "CREATE_OR_LINK"]],
  ["PILOT-TCHC-HEAD-01", ["TCHC_HEAD", "TCHC", "HEU:TCHC", "OPERATIONAL_DRAFT", "VERIFY_EXISTING_OR_CREATE"]],
  ["PILOT-TCHC-DEPUTY-01", ["TCHC_DEPUTY", "TCHC", "HEU:TCHC", "OPERATIONAL_DRAFT_NO_FINAL_APPROVE", "CREATE_OR_LINK"]],
  ["PILOT-HOU-RECRUITMENT-CTV-01", ["TUYEN_SINH_01", "PHONG_TUYEN_SINH", "HOU:ADMISSION:OWN", "OWN_LEADS_ONLY_NO_COM", "BLOCKED_LEGAL_SCOPE"]],
]);

const rows = packet
  .split(/\r?\n/)
  .filter((line) => /^\| PILOT-[A-Z0-9-]+ \|/.test(line))
  .map((line) => line.split("|").slice(1, -1).map((cell) => cell.trim()));

if (rows.length !== expectedRows.size) {
  failures.push(`account register: expected ${expectedRows.size} rows, found ${rows.length}`);
}

const accountCodes = new Set();
const positionCodes = new Set();

for (const row of rows) {
  const [accountCode, positionCode, departmentCode, workspaceScope, initialAccess, activationState, smartMode] = row;
  const expected = expectedRows.get(accountCode);

  if (!expected) {
    failures.push(`unexpected account code: ${accountCode}`);
    continue;
  }

  if (accountCodes.has(accountCode)) {
    failures.push(`duplicate account code: ${accountCode}`);
  }
  accountCodes.add(accountCode);

  if (positionCodes.has(positionCode)) {
    failures.push(`position reused by multiple pilot accounts: ${positionCode}`);
  }
  positionCodes.add(positionCode);

  const actual = [positionCode, departmentCode, workspaceScope, initialAccess, activationState];
  if (actual.some((value, index) => value !== expected[index])) {
    failures.push(`mapping mismatch for ${accountCode}`);
  }

  if (smartMode !== "DRAFT_CHECK_SUGGEST") {
    failures.push(`unsafe Smart mode for ${accountCode}: ${smartMode}`);
  }

  if (/(^|:)ALL($|:)/.test(workspaceScope)) {
    failures.push(`broad workspace scope for ${accountCode}: ${workspaceScope}`);
  }
}

for (const accountCode of expectedRows.keys()) {
  if (!accountCodes.has(accountCode)) {
    failures.push(`missing account row: ${accountCode}`);
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
  if (pattern.test(packet)) {
    failures.push(`restricted value pattern found: ${pattern}`);
  }
}

if (failures.length > 0) {
  for (const failure of failures) {
    console.error(`HEU_USER_PILOT_002: NO_GO - ${failure}`);
  }
  process.exit(1);
}

console.log("HEU_USER_PILOT_002: PASS_LOCAL");
console.log("anonymous_accounts=8");
console.log("independent_positions=8");
console.log("smart_mode=DRAFT_CHECK_SUGGEST");
console.log("real_identity_mapping=OUTSIDE_GIT_OWNER_CHANNEL");
console.log("database_write=NOT_PERFORMED");
console.log("real_user_activation=NO_GO_UNTIL_PER_ACCOUNT_OWNER_GATE");
console.log("production=NO_GO");
