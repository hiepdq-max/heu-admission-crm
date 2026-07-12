import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const contractUrl = new URL("../lib/position-smart-contract.ts", import.meta.url);
const source = await readFile(fileURLToPath(contractUrl), "utf8");
const contract = await import(contractUrl.href);

for (const token of [
  "DRAFT",
  "CHECK",
  "SUGGEST",
  "BGH_READ_ONLY",
  "OPERATIONAL",
  "ZERO_COST_LOCAL_FIRST",
  "PROPOSAL_ONLY",
]) {
  assert.match(source, new RegExp(`\\b${token}\\b`), `missing required contract token: ${token}`);
}

for (const forbidden of ["APPROVE", "WRITE", "SEND", "PAY", "DELETE", "MIGRATION", "PRODUCTION"]) {
  assert.match(source, new RegExp(`\\b${forbidden}\\b`), `missing explicit forbidden capability: ${forbidden}`);
}

for (const requiredField of [
  "accountScopeKey",
  "positionCode",
  "departmentCode",
  "workspaceScope",
  "metadataKeys",
  "requestId",
]) {
  assert.match(
    source,
    new RegExp(`\\b${requiredField}\\b`),
    `missing required scoped metadata field: ${requiredField}`,
  );
}

assert.match(source, /POSITION_SMART_FAIL_CLOSED/);
assert.match(source, /HOU_SCOPE_MUST_BE_SEPARATED/);
assert.match(source, /scopesAreIndependent/);
assert.match(source, /INVALID_OUTPUT_MODE/);
assert.match(source, /INVALID_POSITION_LANE/);
assert.match(source, /RESTRICTED_METADATA_KEY_PARTS/);
assert.match(source, /RESTRICTED_METADATA_KEY/);

for (const prohibitedRuntime of [
  /\bfetch\s*\(/,
  /\baxios\b/,
  /\bopenai\b/i,
  /\banthropic\b/i,
  /\bsupabase\b/i,
  /\b(localStorage|sessionStorage)\b/,
  /\b(writeFile|appendFile|createWriteStream)\b/,
  /\b(setInterval|setTimeout)\s*\(/,
  /\b(approve|write|send|pay|delete|migrate|deploy)\s*\(/i,
]) {
  assert.doesNotMatch(source, prohibitedRuntime, `prohibited runtime or storage capability: ${prohibitedRuntime}`);
}

assert.doesNotMatch(
  source,
  /@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/,
  "real email-like identifier must not be hardcoded",
);

const operationalScope = {
  accountScopeKey: "ACCOUNT_SCOPE_01",
  positionCode: "POSITION_01",
  departmentCode: "HEU:DEPARTMENT_01",
  workspaceScope: ["HEU:WORKSPACE_01"],
  lane: "OPERATIONAL",
};

assert.equal(contract.validatePositionSmartScope(operationalScope).ok, true);
assert.equal(
  contract.validatePositionSmartScope({ ...operationalScope, lane: "UNKNOWN" }).ok,
  false,
);
assert.equal(
  contract.validatePositionSmartScope({
    ...operationalScope,
    departmentCode: "HOU:DEPARTMENT_01",
    workspaceScope: ["HOU:WORKSPACE_01", "HEU:WORKSPACE_01"],
  }).ok,
  false,
);
assert.equal(
  contract.validatePositionSmartScope({
    ...operationalScope,
    workspaceScope: ["HEU:WORKSPACE_01", "heu:workspace_01"],
  }).ok,
  false,
);

assert.equal(
  contract.scopesAreIndependent(operationalScope, {
    ...operationalScope,
    positionCode: "POSITION_02",
  }),
  false,
);
assert.equal(
  contract.scopesAreIndependent(
    {
      ...operationalScope,
      workspaceScope: ["HEU:WORKSPACE_A", "HEU:WORKSPACE_B"],
    },
    {
      ...operationalScope,
      workspaceScope: ["HEU:WORKSPACE_B", "HEU:WORKSPACE_A"],
    },
  ),
  false,
);
assert.equal(
  contract.scopesAreIndependent(operationalScope, {
    ...operationalScope,
    accountScopeKey: "ACCOUNT_SCOPE_02",
  }),
  true,
);
assert.equal(
  contract.validatePositionSmartScope({
    ...operationalScope,
    departmentCode: "hou:department_01",
    workspaceScope: ["hou:workspace_01"],
  }).ok,
  true,
);
assert.equal(
  contract.validatePositionSmartScope({
    ...operationalScope,
    departmentCode: "hou:department_01",
    workspaceScope: ["hou:workspace_01", "heu:workspace_01"],
  }).ok,
  false,
);

const safeInput = {
  scope: operationalScope,
  requestId: "REQUEST_01",
  requestedMode: "DRAFT",
  metadataKeys: ["record_status", "record_count"],
};
assert.equal(contract.createPositionSmartProposalLog(safeInput).outcome, "PROPOSAL_ONLY");
assert.throws(
  () => contract.createPositionSmartProposalLog({ ...safeInput, requestedMode: "APPROVE" }),
  /INVALID_OUTPUT_MODE/,
);

for (const restrictedKey of [
  "email",
  "phone_number",
  "mobile_number",
  "telephone_number",
  "cccd_hash",
  "identity_code",
  "pii_flag",
  "home_address",
  "bank_account",
  "password",
  "credential_type",
  "otp_code",
  "access_token",
  "client_secret",
  "raw_lead",
  "raw_student",
  "raw_payment",
  "raw_evidence",
  "emailAddress",
  "bankAccount",
  "cccdHash",
  "accessToken",
  "rawStudent",
]) {
  assert.throws(
    () =>
      contract.createPositionSmartProposalLog({
        ...safeInput,
        metadataKeys: [restrictedKey],
      }),
    /RESTRICTED_METADATA_KEY/,
  );
}

console.log(
  "PASS: HEU position Smart contract runtime guards, restricted metadata denylist, " +
    "proposal-only behavior, and local-first boundaries are fail-closed.",
);
