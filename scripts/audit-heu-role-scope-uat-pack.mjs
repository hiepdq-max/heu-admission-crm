import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const packPath = "docs/HEU_ROLE_SCOPE_UAT_EXECUTION_PACK_20260627.md";
const failures = [];

function fail(message) {
  failures.push(message);
}

function read(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), "utf8");
}

function exists(relativePath) {
  return existsSync(path.join(repoRoot, relativePath));
}

function requireFile(relativePath) {
  if (!exists(relativePath)) {
    fail(`Missing required file: ${relativePath}`);
  }
}

function requireText(contents, pattern, label) {
  if (!pattern.test(contents)) {
    fail(`${packPath}: missing ${label}`);
  }
}

requireFile(packPath);
requireFile("docs/TTGDTX_ROLE_SCOPE_UAT_RUNBOOK.md");
requireFile("docs/TTGDTX_BROWSER_UAT_MATRIX_20260625.md");
requireFile("docs/TTGDTX_ACCOUNTING_DASHBOARD_ROLE_UAT_PLAN_20260627.md");
requireFile("components/settings/user-scope-enforcement-panel.tsx");
requireFile("scripts/audit-ttgdtx-role-scope-access.mjs");
requireFile("scripts/audit-ttgdtx-data-fetch-gate.mjs");

const pack = exists(packPath) ? read(packPath) : "";
const panel = exists("components/settings/user-scope-enforcement-panel.tsx")
  ? read("components/settings/user-scope-enforcement-panel.tsx")
  : "";

requireText(pack, /P6-04 role-scope UAT/i, "P6-04 scope");
requireText(pack, /NO-GO until signed UAT evidence exists/i, "production NO-GO boundary");
requireText(pack, /Do not paste passwords, OTPs, reset links, API keys, service-role keys, CCCD,\s+private phone numbers, bank accounts, bank statements, vouchers or raw student\s+identity data/i, "secret and sensitive-data boundary");
requireText(pack, /audit:permission-soft-revoke[\s\S]*audit:ttgdtx-role-scope-access[\s\S]*audit:ttgdtx-data-fetch-gate[\s\S]*audit:ttgdtx-dashboard-access[\s\S]*audit:ttgdtx-accounting-dashboard-uat-plan[\s\S]*audit:heu-role-scope-uat-pack[\s\S]*audit:ttgdtx-release-gates/i, "required static preflight commands");
requireText(pack, /UAT_ADMIN[\s\S]*UAT_BGH[\s\S]*UAT_KHTC_TTGDTX_OPERATOR[\s\S]*UAT_TUYEN_SINH_TTGDTX[\s\S]*UAT_CTHSSV[\s\S]*UAT_DAO_TAO[\s\S]*UAT_PHAP_CHE[\s\S]*UAT_AUDIT[\s\S]*UAT_OUT_OF_SCOPE_STAFF/i, "role matrix coverage");
requireText(pack, /Lead list\/detail[\s\S]*TTGDTX contract\/source[\s\S]*TTGDTX receivable, collection, reconciliation and payment[\s\S]*TTGDTX accounting dashboard[\s\S]*Master\/settings[\s\S]*Audit log/i, "route family coverage");
requireText(pack, /data-heu-role-scope-route-matrix="P6-04"[\s\S]*P6-04-ROUTE-01[\s\S]*P6-04-ROUTE-07[\s\S]*ALLOWED[\s\S]*BLOCKED[\s\S]*EMPTY_SCOPED_STATE[\s\S]*UI-only hide is not enough/i, "role-scope route matrix coverage");
requireText(pack, /Expected result[\s\S]*ALLOWED, BLOCKED or EMPTY_SCOPED_STATE/i, "evidence expected result field");
requireText(pack, /Stop UAT and fix/i, "stop conditions section");
requireText(pack, /A page queries sensitive data before auth, permission and scope checks/i, "query-before-gate stop condition");
requireText(pack, /UI hiding is the only control/i, "server-side bypass stop condition");
requireText(pack, /non-admin receives broad lead visibility `ALL`/i, "broad lead access stop condition");
requireText(pack, /AI can approve, pay, release, delete, mark revenue or mark production GO/i, "AI approval stop condition");
requireText(pack, /P6-04 is PASS_LOCAL/i, "PASS_LOCAL result");
requireText(pack, /Signed role-scope UAT evidence is still required/i, "signed UAT boundary");

if (
  !/(?=[\s\S]*data-heu-role-scope-ui-guard="P6-04")(?=[\s\S]*P6-04 role-scope UAT)(?=[\s\S]*PASS_LOCAL)(?=[\s\S]*Signed role-scope UAT evidence is still required)(?=[\s\S]*NO-GO until\s+signed UAT evidence exists)(?=[\s\S]*UAT_ADMIN)(?=[\s\S]*UAT_BGH)(?=[\s\S]*UAT_KHTC)(?=[\s\S]*UAT_TUYEN_SINH)(?=[\s\S]*UAT_PHAP_CHE)(?=[\s\S]*UAT_AUDIT)(?=[\s\S]*UAT_OUT_OF_SCOPE_STAFF)(?=[\s\S]*passwords)(?=[\s\S]*OTPs)(?=[\s\S]*service-role keys)(?=[\s\S]*CCCD)(?=[\s\S]*bank\s+accounts)(?=[\s\S]*raw student identity data)/i.test(
    panel,
  )
) {
  fail(
    "components/settings/user-scope-enforcement-panel.tsx: missing P6-04 UI guard, signed-UAT boundary, role coverage or no-secret warning.",
  );
}

if (
  !/(?=[\s\S]*data-heu-role-scope-evidence-checklist="P6-04")(?=[\s\S]*P6-04 role\/workspace evidence checklist)(?=[\s\S]*PASS_LOCAL only)(?=[\s\S]*Signed role-scope UAT is still required before P6-04 can move\s+from IN_PROGRESS)(?=[\s\S]*HEU_ROLE_SCOPE_UAT_EXECUTION_PACK_20260627\.md)(?=[\s\S]*P6-04-SCOPE-001)(?=[\s\S]*P6-04-SCOPE-006)(?=[\s\S]*ALLOWED, BLOCKED or EMPTY_SCOPED_STATE)(?=[\s\S]*passwords, OTPs, reset links, API keys,\s+service-role keys, CCCD, bank accounts, bank statements,\s+vouchers and raw student identity data)(?=[\s\S]*PASS_LOCAL does not approve production access, broad permissions,\s+real-data UAT, finance action, hard-delete, AI approval or\s+production GO)/i.test(panel)
) {
  fail(
    "components/settings/user-scope-enforcement-panel.tsx: missing P6-04 role/workspace evidence checklist or no-secret boundary.",
  );
}

if (
  !/(?=[\s\S]*data-heu-role-scope-route-matrix="P6-04")(?=[\s\S]*P6-04 role-scope route matrix)(?=[\s\S]*PASS_LOCAL only)(?=[\s\S]*P6-04-ROUTE-01)(?=[\s\S]*P6-04-ROUTE-07)(?=[\s\S]*Login and unauthenticated routes)(?=[\s\S]*Lead list\/detail)(?=[\s\S]*TTGDTX contract\/source pages)(?=[\s\S]*TTGDTX receivable, collection, reconciliation and payment)(?=[\s\S]*TTGDTX accounting dashboard)(?=[\s\S]*Master\/settings pages)(?=[\s\S]*Audit log pages)(?=[\s\S]*ALLOWED, BLOCKED\s+or EMPTY_SCOPED_STATE)(?=[\s\S]*UI-only hide is not enough if a server\s+action can still write)(?=[\s\S]*Do not paste passwords, OTPs, reset links, API keys,\s+service-role keys, CCCD, bank accounts, bank statements,\s+vouchers or raw student identity data)/i.test(panel)
) {
  fail(
    "components/settings/user-scope-enforcement-panel.tsx: missing P6-04 route matrix, route coverage, server-side bypass warning or no-secret boundary.",
  );
}

const runbook = read("docs/TTGDTX_ROLE_SCOPE_UAT_RUNBOOK.md");
if (!/Do not test with real passwords, OTPs, service keys or bank credentials/i.test(runbook)) {
  fail("TTGDTX role-scope runbook must keep the no-secret rule.");
}
if (!/UAT_OUT_OF_SCOPE[\s\S]*Cannot open scoped TTGDTX data/i.test(runbook)) {
  fail("TTGDTX role-scope runbook must include out-of-scope denial.");
}

const packageJson = JSON.parse(read("package.json"));
if (!packageJson.scripts?.["audit:heu-role-scope-uat-pack"]) {
  fail("package.json: missing audit:heu-role-scope-uat-pack script");
}

const backlog = read("docs/HEU_SYSTEM_BUILD_BACKLOG.md");
if (!/P6-04[\s\S]*PASS_LOCAL[\s\S]*HEU_ROLE_SCOPE_UAT_EXECUTION_PACK_20260627\.md[\s\S]*components\/settings\/user-scope-enforcement-panel\.tsx[\s\S]*role-scope evidence checklist[\s\S]*audit:heu-role-scope-uat-pack/.test(backlog)) {
  fail("Backlog P6-04 must be PASS_LOCAL and reference the role-scope UAT pack audit.");
}

const checklist = read("docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md");
if (!/Permission by role and workspace[\s\S]*IN_PROGRESS[\s\S]*HEU_ROLE_SCOPE_UAT_EXECUTION_PACK_20260627\.md[\s\S]*components\/settings\/user-scope-enforcement-panel\.tsx[\s\S]*role-scope evidence checklist/.test(checklist)) {
  fail("Production checklist must keep role/workspace permission IN_PROGRESS and reference the P6-04 pack.");
}

const agents = read("AGENTS.md");
if (!agents.includes("docs/HEU_ROLE_SCOPE_UAT_EXECUTION_PACK_20260627.md")) {
  fail("AGENTS.md: missing role-scope UAT pack in required reading.");
}
if (!agents.includes("npm.cmd run audit:heu-role-scope-uat-pack")) {
  fail("AGENTS.md: missing role-scope UAT pack audit in final handoff checks.");
}

const releaseGateAudit = read("scripts/audit-ttgdtx-release-gates.mjs");
if (!releaseGateAudit.includes(packPath) || !releaseGateAudit.includes("audit:heu-role-scope-uat-pack")) {
  fail("scripts/audit-ttgdtx-release-gates.mjs: missing role-scope UAT pack gate coverage.");
}

if (failures.length > 0) {
  console.error("HEU role-scope UAT pack audit failed.");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("HEU role-scope UAT pack audit passed. P6-04 is packaged but still needs signed UAT.");
