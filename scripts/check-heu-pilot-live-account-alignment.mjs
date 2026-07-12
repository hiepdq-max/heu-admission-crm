import crypto from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import { createClient } from "@supabase/supabase-js";

const repoRoot = process.cwd();
const envPath = path.resolve(
  repoRoot,
  process.env.HEU_ENV_FILE || ".env.local",
);
const contractOnly = process.env.HEU_ALIGNMENT_MODE === "contract";
const alignmentPhase =
  process.env.HEU_ALIGNMENT_PHASE === "staged" ? "staged" : "active";
const stagedAccountCodes = new Set([
  "heu-system-admin",
  "tuyen-sinh-truong-phong",
  "tuyen-sinh-ctv",
  "khtc-quan-ly",
  "khtc-thu-chi",
  "khtc-ngan-hang",
  "tchc-pho-phong",
]);

const expectedAccounts = new Map([
  ["heu-system-admin", {
    positionCode: "HEU_SYSTEM_ADMIN",
    roleCode: "IT_DATA_HEAD",
    departmentCode: "IT_DATA",
    scopePolicy: "NO_BUSINESS_SCOPE",
    expectedProfileStatus: "ACTIVE",
  }],
  ["heu-principal", {
    positionCode: "HT",
    roleCode: "HIEU_TRUONG",
    departmentCode: "LEADERSHIP",
    scopePolicy: "NO_BUSINESS_SCOPE",
    expectedProfileStatus: "ACTIVE",
  }],
  ["tuyen-sinh-truong-phong", {
    positionCode: "TUYEN_SINH_HEAD",
    roleCode: "PILOT_ADMISSION_HEAD",
    departmentCode: "ADMISSION",
    scopePolicy: "ADMISSION_DEPARTMENT",
    expectedProfileStatus: "ACTIVE",
  }],
  ["tuyen-sinh-ctv", {
    positionCode: "TUYEN_SINH_01",
    roleCode: "PILOT_COUNSELOR",
    departmentCode: "ADMISSION",
    scopePolicy: "BLOCKED_OUT_OF_7_DAY_SCOPE",
    expectedProfileStatus: "INACTIVE",
  }],
  ["khtc-quan-ly", {
    positionCode: "KE_TOAN_DEPUTY",
    roleCode: "PILOT_ACCOUNTING_LEAD_READONLY",
    departmentCode: "ACCOUNTING",
    scopePolicy: "NO_BUSINESS_SCOPE",
    expectedProfileStatus: "ACTIVE",
  }],
  ["khtc-thu-chi", {
    positionCode: "KE_TOAN_01",
    roleCode: "PILOT_ACCOUNTING_READONLY",
    departmentCode: "ACCOUNTING",
    scopePolicy: "NO_BUSINESS_SCOPE",
    expectedProfileStatus: "ACTIVE",
  }],
  ["khtc-ngan-hang", {
    positionCode: "KE_TOAN_02",
    roleCode: "PILOT_ACCOUNTING_READONLY",
    departmentCode: "ACCOUNTING",
    scopePolicy: "NO_BUSINESS_SCOPE",
    expectedProfileStatus: "ACTIVE",
  }],
  ["tchc-truong-phong", {
    positionCode: "TCHC_HEAD",
    roleCode: "TCHC_LEAD",
    departmentCode: "TCHC",
    scopePolicy: "NO_BUSINESS_SCOPE",
    expectedProfileStatus: "ACTIVE",
  }],
  ["tchc-pho-phong", {
    positionCode: "TCHC_DEPUTY",
    roleCode: "TCHC_LEAD",
    departmentCode: "TCHC",
    scopePolicy: "NO_BUSINESS_SCOPE",
    expectedProfileStatus: "ACTIVE",
  }],
]);

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

function accountHash(accountCode) {
  return crypto.createHash("sha256").update(accountCode).digest("hex").slice(0, 10);
}

function addFinding(findings, accountCode, code) {
  findings.push({
    account: accountCode,
    accountHash: accountHash(accountCode),
    code,
  });
}

function assertContract() {
  const failures = [];
  const positions = new Set();

  if (expectedAccounts.size !== 9) {
    failures.push("EXPECTED_ACCOUNT_COUNT");
  }

  for (const [accountCode, expected] of expectedAccounts) {
    if (positions.has(expected.positionCode)) {
      failures.push(`DUPLICATE_POSITION:${accountCode}`);
    }
    positions.add(expected.positionCode);

    if (/(^|:)ALL($|:)/.test(expected.scopePolicy)) {
      failures.push(`BROAD_SCOPE_POLICY:${accountCode}`);
    }
  }

  if (
    expectedAccounts.get("heu-system-admin")?.roleCode !== "IT_DATA_HEAD" ||
    expectedAccounts.get("tuyen-sinh-truong-phong")?.roleCode !==
      "PILOT_ADMISSION_HEAD" ||
    expectedAccounts.get("khtc-quan-ly")?.roleCode !==
      "PILOT_ACCOUNTING_LEAD_READONLY" ||
    expectedAccounts.get("tuyen-sinh-ctv")?.scopePolicy !==
      "BLOCKED_OUT_OF_7_DAY_SCOPE"
  ) {
    failures.push("LEAST_PRIVILEGE_CONTRACT");
  }

  return failures;
}

async function listAuthUsers(adminClient) {
  const users = [];

  for (let page = 1; ; page += 1) {
    const { data, error } = await adminClient.auth.admin.listUsers({
      page,
      perPage: 1000,
    });
    if (error) return { users: [], error: true };
    users.push(...(data.users ?? []));
    if ((data.users ?? []).length < 1000) {
      return { users, error: false };
    }
  }
}

async function selectRows(client, table, select, buildQuery) {
  const query = client.from(table).select(select);
  const { data, error } = await buildQuery(query);
  return { rows: data ?? [], error: Boolean(error) };
}

const contractFailures = assertContract();
if (contractFailures.length > 0) {
  for (const failure of contractFailures) {
    console.error(`HEU_PILOT_LIVE_ALIGNMENT: NO_GO - ${failure}`);
  }
  process.exit(1);
}

if (contractOnly) {
  console.log("HEU_PILOT_LIVE_ALIGNMENT: PASS_LOCAL_CONTRACT");
  console.log("expected_accounts=9");
  console.log("unique_positions=9");
  console.log("broad_default_scope=BLOCKED");
  console.log("hou_workspace=BLOCKED_OUT_OF_7_DAY_SCOPE");
  console.log("database_write=NOT_PERFORMED");
  process.exit(0);
}

const env = parseEnvFile(envPath);
const requiredEnvKeys = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "NEXT_PUBLIC_HEU_PILOT_ACCOUNT_DIRECTORY_JSON",
];
const missingEnv = requiredEnvKeys.filter((key) =>
  key === "NEXT_PUBLIC_HEU_PILOT_ACCOUNT_DIRECTORY_JSON"
    ? !env[key]
    : !meaningfulSecret(env[key]),
);

if (missingEnv.length > 0) {
  console.error(
    `HEU_PILOT_LIVE_ALIGNMENT: NO_GO - missing controlled env keys count=${missingEnv.length}`,
  );
  process.exit(1);
}

let directoryRows;
try {
  directoryRows = JSON.parse(env.NEXT_PUBLIC_HEU_PILOT_ACCOUNT_DIRECTORY_JSON);
} catch {
  console.error("HEU_PILOT_LIVE_ALIGNMENT: NO_GO - invalid pilot directory JSON");
  process.exit(1);
}

if (!Array.isArray(directoryRows)) {
  console.error("HEU_PILOT_LIVE_ALIGNMENT: NO_GO - pilot directory must be an array");
  process.exit(1);
}

const findings = [];
const directoryById = new Map();
const emails = new Set();

for (const row of directoryRows) {
  const id = String(row?.id ?? "");
  const email = String(row?.email ?? "").trim().toLowerCase();

  if (!expectedAccounts.has(id)) {
    addFinding(findings, id || "UNKNOWN_ACCOUNT", "UNEXPECTED_ACCOUNT_CODE");
    continue;
  }
  if (directoryById.has(id)) {
    addFinding(findings, id, "DUPLICATE_ACCOUNT_CODE");
  }
  if (!email.includes("@")) {
    addFinding(findings, id, "INVALID_CONTROLLED_EMAIL");
  }
  if (emails.has(email)) {
    addFinding(findings, id, "DUPLICATE_CONTROLLED_EMAIL");
  }

  directoryById.set(id, { id, email });
  emails.add(email);
}

for (const accountCode of expectedAccounts.keys()) {
  if (!directoryById.has(accountCode)) {
    addFinding(findings, accountCode, "MISSING_DIRECTORY_ACCOUNT");
  }
}

if (directoryById.size !== expectedAccounts.size) {
  console.error(
    `HEU_PILOT_LIVE_ALIGNMENT: NO_GO - directory_count=${directoryById.size}; expected=9`,
  );
}

const adminClient = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: { autoRefreshToken: false, persistSession: false },
  },
);

const controlledEmails = [...directoryById.values()].map((row) => row.email);
const authResult = await listAuthUsers(adminClient);
const [
  profilesResult,
  rolesResult,
  departmentsResult,
  positionsResult,
] = await Promise.all([
  selectRows(
    adminClient,
    "users_profile",
    "id,email,role_id,department_id,status",
    (query) => query.in("email", controlledEmails),
  ),
  selectRows(adminClient, "roles", "id,code", (query) => query),
  selectRows(adminClient, "admission_departments", "id,code", (query) => query),
  selectRows(
    adminClient,
    "heu_org_positions",
    "id,position_code,department_code,default_role_code,status",
    (query) =>
      query.in(
        "position_code",
        [...expectedAccounts.values()].map((item) => item.positionCode),
      ),
  ),
]);

if (
  authResult.error ||
  profilesResult.error ||
  rolesResult.error ||
  departmentsResult.error ||
  positionsResult.error
) {
  console.error("HEU_PILOT_LIVE_ALIGNMENT: NO_GO - controlled metadata read failed");
  process.exit(1);
}

const profileIds = profilesResult.rows.map((row) => row.id);
const [
  assignmentsResult,
  segmentScopesResult,
  partnerScopesResult,
  leadVisibilityResult,
] = profileIds.length > 0
  ? await Promise.all([
      selectRows(
        adminClient,
        "heu_position_assignments",
        "position_id,user_id,assignment_status,status",
        (query) => query.in("user_id", profileIds),
      ),
      selectRows(
        adminClient,
        "user_admission_segment_scopes",
        "user_id,status",
        (query) => query.in("user_id", profileIds),
      ),
      selectRows(
        adminClient,
        "user_partner_scopes",
        "user_id,status",
        (query) => query.in("user_id", profileIds),
      ),
      selectRows(
        adminClient,
        "user_lead_visibility_scopes",
        "user_id,lead_visibility,status",
        (query) => query.in("user_id", profileIds),
      ),
    ])
  : [
      { rows: [], error: false },
      { rows: [], error: false },
      { rows: [], error: false },
      { rows: [], error: false },
    ];

if (
  assignmentsResult.error ||
  segmentScopesResult.error ||
  partnerScopesResult.error ||
  leadVisibilityResult.error
) {
  console.error("HEU_PILOT_LIVE_ALIGNMENT: NO_GO - controlled scope read failed");
  process.exit(1);
}

const authEmails = new Set(
  authResult.users.map((user) => user.email?.toLowerCase()).filter(Boolean),
);
const authByEmail = new Map(
  authResult.users
    .filter((user) => user.email)
    .map((user) => [user.email.toLowerCase(), user]),
);
const profileByEmail = new Map(
  profilesResult.rows.map((profile) => [profile.email.toLowerCase(), profile]),
);
const roleById = new Map(rolesResult.rows.map((role) => [role.id, role.code]));
const departmentById = new Map(
  departmentsResult.rows.map((department) => [department.id, department.code]),
);
const positionById = new Map(
  positionsResult.rows.map((position) => [position.id, position]),
);
const positionByCode = new Map(
  positionsResult.rows.map((position) => [position.position_code, position]),
);

for (const [accountCode, expected] of expectedAccounts) {
  const directory = directoryById.get(accountCode);
  if (!directory) continue;

  const authUser = authByEmail.get(directory.email);
  if (!authEmails.has(directory.email) || !authUser) {
    addFinding(findings, accountCode, "AUTH_MISSING");
  } else if (
    alignmentPhase === "staged" &&
    stagedAccountCodes.has(accountCode) &&
    (!authUser.banned_until || Date.parse(authUser.banned_until) <= Date.now())
  ) {
    addFinding(findings, accountCode, "AUTH_NOT_BANNED_STAGED");
  }

  const profile = profileByEmail.get(directory.email);
  if (!profile) {
    addFinding(findings, accountCode, "PROFILE_MISSING");
    continue;
  }

  const expectedProfileStatus =
    alignmentPhase === "staged" && stagedAccountCodes.has(accountCode)
      ? "INACTIVE"
      : expected.expectedProfileStatus;
  if (profile.status !== expectedProfileStatus) {
    addFinding(findings, accountCode, "PROFILE_STATUS_MISMATCH");
  }
  if (roleById.get(profile.role_id) !== expected.roleCode) {
    addFinding(findings, accountCode, "ROLE_MISMATCH");
  }
  if (departmentById.get(profile.department_id) !== expected.departmentCode) {
    addFinding(findings, accountCode, "DEPARTMENT_MISMATCH");
  }

  if (!positionByCode.has(expected.positionCode)) {
    addFinding(findings, accountCode, "POSITION_MASTER_MISSING");
  }

  const activeAssignments = assignmentsResult.rows.filter(
    (assignment) =>
      assignment.user_id === profile.id &&
      assignment.status === "ACTIVE" &&
      assignment.assignment_status === "ACTIVE_ASSIGNED",
  );
  if (activeAssignments.length !== 1) {
    addFinding(findings, accountCode, "ACTIVE_POSITION_COUNT_NOT_ONE");
  } else if (
    positionById.get(activeAssignments[0].position_id)?.position_code !==
    expected.positionCode
  ) {
    addFinding(findings, accountCode, "POSITION_MISMATCH");
  }

  const segmentScopeCount = segmentScopesResult.rows.filter(
    (scope) => scope.user_id === profile.id && scope.status === "ACTIVE",
  ).length;
  const partnerScopeCount = partnerScopesResult.rows.filter(
    (scope) => scope.user_id === profile.id && scope.status === "ACTIVE",
  ).length;
  const leadVisibility = leadVisibilityResult.rows.find(
    (scope) => scope.user_id === profile.id && scope.status === "ACTIVE",
  )?.lead_visibility;

  if (partnerScopeCount > 0) {
    addFinding(findings, accountCode, "PARTNER_SCOPE_NOT_ALLOWED");
  }

  if (expected.scopePolicy === "ADMISSION_DEPARTMENT") {
    if (segmentScopeCount < 1) {
      addFinding(findings, accountCode, "ADMISSION_SEGMENT_SCOPE_MISSING");
    }
    if (leadVisibility !== "DEPARTMENT") {
      addFinding(findings, accountCode, "LEAD_VISIBILITY_NOT_DEPARTMENT");
    }
  } else {
    if (segmentScopeCount > 0) {
      addFinding(findings, accountCode, "UNEXPECTED_ADMISSION_SEGMENT_SCOPE");
    }
    if (leadVisibility === "ALL" || leadVisibility === "DEPARTMENT") {
      addFinding(findings, accountCode, "BROAD_LEAD_VISIBILITY");
    }
  }
}

const findingsByAccount = new Map();
for (const finding of findings) {
  const values = findingsByAccount.get(finding.account) ?? [];
  values.push(finding.code);
  findingsByAccount.set(finding.account, values);
}

for (const accountCode of expectedAccounts.keys()) {
  const accountFindings = findingsByAccount.get(accountCode) ?? [];
  console.log(
    [
      `account=${accountCode}`,
      `hash=${accountHash(accountCode)}`,
      `status=${accountFindings.length === 0 ? "ALIGNED" : "NO_GO"}`,
      `findings=${accountFindings.length > 0 ? accountFindings.join(",") : "none"}`,
    ].join("; "),
  );
}

const alignedCount = [...expectedAccounts.keys()].filter(
  (accountCode) => !(findingsByAccount.get(accountCode)?.length > 0),
).length;

console.log(`pilot_accounts=9`);
console.log(`alignment_phase=${alignmentPhase}`);
console.log(`aligned_accounts=${alignedCount}`);
console.log(`finding_count=${findings.length}`);
console.log("raw_identity_output=BLOCKED");
console.log("database_write=NOT_PERFORMED");
console.log("production=NO_GO");

if (findings.length > 0) {
  console.error("HEU_PILOT_LIVE_ALIGNMENT: NO_GO");
  process.exit(1);
}

console.log("HEU_PILOT_LIVE_ALIGNMENT: PASS_READ_ONLY");
