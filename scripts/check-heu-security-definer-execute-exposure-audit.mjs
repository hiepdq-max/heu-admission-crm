import { readFileSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const docPath =
  "docs/HEU_CONTROL/HEU_SEC_001_SECURITY_DEFINER_EXECUTE_EXPOSURE_AUDIT_20260712.md";
const source = readFileSync(path.join(repoRoot, docPath), "utf8");
const failures = [];

const requiredTokens = [
  "HEU-SEC-001-SECURITY-DEFINER-EXECUTE-EXPOSURE-AUDIT",
  "Status: DRAFT_CONTROL",
  "Production status: NO-GO",
  "Security advisor findings | 338",
  "Security ERROR | 1",
  "Functions executable by `anon` | 166",
  "public.ttgdtx_p2_19_real_data_evidence_status",
  "upsert_user_profile_from_auth",
  "does not prove that all 166 functions are directly",
  "calls `public.is_admin()`",
  "P1",
  "P0",
  "143 active role permissions",
  "51 permissions matching",
  "There is currently no active master position whose default role is `ADMIN`",
  "Revoke execute from `PUBLIC` and `anon` only after dependency review",
  "No bulk revoke is approved",
  "Prefer `SECURITY INVOKER`",
  "fixed empty search path",
  "Test as `anon`",
  "authenticated p50/p95",
  "Never delete an index only because an advisor marks it unused",
  "DATABASE_WRITE=NOT_PERFORMED",
  "MIGRATION=NO_GO",
  "USER_UAT=NO_GO",
  "PRODUCTION=NO_GO",
];

for (const token of requiredTokens) {
  if (!source.includes(token)) {
    failures.push(`missing control token: ${token}`);
  }
}

const forbiddenPatterns = [
  /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i,
  /\b0\d{9,10}\b/,
  /\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/i,
  /password\s*[:=]\s*["'][^"']+/i,
  /token\s*[:=]\s*["'][^"']+/i,
  /secret\s*[:=]\s*["'][^"']+/i,
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
];

for (const pattern of forbiddenPatterns) {
  if (pattern.test(source)) {
    failures.push(`restricted value pattern found: ${pattern}`);
  }
}

if (/\b(revoke|grant)\s+(all|execute)\b[^\n;]*;/i.test(source)) {
  failures.push("executable privilege SQL is forbidden in the audit document");
}

if (failures.length > 0) {
  for (const failure of failures) {
    console.error(`HEU_SEC_001=NO_GO - ${failure}`);
  }
  process.exit(1);
}

console.log("HEU_SEC_001=PASS_LOCAL_DRAFT_CONTROL");
console.log("SECURITY_DEFINER_FUNCTIONS=166");
console.log("ANON_EXECUTABLE_FUNCTIONS=166");
console.log("COUNTEREVIDENCE=RECORDED");
console.log("DATABASE_WRITE=NOT_PERFORMED");
console.log("MIGRATION=NO_GO");
console.log("USER_UAT=NO_GO");
console.log("PRODUCTION=NO_GO");
