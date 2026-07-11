import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const contractUrl = new URL("../lib/position-smart-contract.ts", import.meta.url);
const source = await readFile(fileURLToPath(contractUrl), "utf8");

for (const token of ["DRAFT", "CHECK", "SUGGEST", "BGH_READ_ONLY", "OPERATIONAL", "ZERO_COST_LOCAL_FIRST", "PROPOSAL_ONLY"]) {
  assert.match(source, new RegExp(`\\b${token}\\b`), `missing required contract token: ${token}`);
}

for (const forbidden of ["APPROVE", "WRITE", "SEND", "PAY", "DELETE", "MIGRATION", "PRODUCTION"]) {
  assert.match(source, new RegExp(`\\b${forbidden}\\b`), `missing explicit forbidden capability: ${forbidden}`);
}

for (const requiredField of ["accountScopeKey", "positionCode", "departmentCode", "workspaceScope", "metadataKeys", "requestId"]) {
  assert.match(source, new RegExp(`\\b${requiredField}\\b`), `missing required scoped metadata field: ${requiredField}`);
}

assert.match(source, /POSITION_SMART_FAIL_CLOSED/);
assert.match(source, /HOU_SCOPE_MUST_BE_SEPARATED/);
assert.match(source, /scopesAreIndependent/);

for (const prohibitedRuntime of [
  /\bfetch\s*\(/,
  /\baxios\b/,
  /\bopenai\b/i,
  /\banthropic\b/i,
  /\bsupabase\b/i,
  /\b(localStorage|sessionStorage)\b/,
  /\b(writeFile|appendFile|createWriteStream)\b/,
  /\b(setInterval|setTimeout)\s*\(/,
]) {
  assert.doesNotMatch(source, prohibitedRuntime, `prohibited runtime or storage capability: ${prohibitedRuntime}`);
}

assert.doesNotMatch(source, /@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/, "real email-like identifier must not be hardcoded");

console.log("PASS: HEU position Smart contract is scoped, proposal-only, local-first, and fail-closed.");
