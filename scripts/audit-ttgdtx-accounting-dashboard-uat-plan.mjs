import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const planPath = "docs/TTGDTX_ACCOUNTING_DASHBOARD_ROLE_UAT_PLAN_20260627.md";
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
    fail(`${planPath}: missing ${label}`);
  }
}

requireFile(planPath);
requireFile("docs/P2_18_ACCOUNTING_DASHBOARD_UAT_RUNBOOK.md");
requireFile("scripts/audit-ttgdtx-dashboard-access.mjs");
requireFile("scripts/audit-ttgdtx-data-fetch-gate.mjs");
requireFile("scripts/audit-ttgdtx-role-scope-access.mjs");

const plan = exists(planPath) ? read(planPath) : "";

requireText(plan, /P2-18 remains IN_PROGRESS/i, "P2-18 remains IN_PROGRESS boundary");
requireText(plan, /signed browser UAT evidence/i, "signed browser UAT evidence requirement");
requireText(plan, /Use only synthetic, redacted or approved UAT data/i, "synthetic/redacted data boundary");
requireText(plan, /Do not put real student, parent, CCCD, phone, bank account, voucher, password,\s+temporary password, OTP, password reset link, account activation\/invite link,\s+credential, service key or production screenshot data/i, "secret and PII boundary");
requireText(plan, /Never paste account passwords, temporary passwords, OTPs, password reset links\s+or account activation\/invite links into the evidence log/i, "account-secret evidence-log boundary");
requireText(plan, /The dashboard must not:[\s\S]*Create receivables[\s\S]*Collect tuition[\s\S]*Issue invoice or receipt[\s\S]*Reconcile money[\s\S]*Approve payment request[\s\S]*Execute payout[\s\S]*Edit evidence[\s\S]*Mark production GO/i, "read-only dashboard boundary");
requireText(plan, /UAT_ADMIN_OR_BGH_TTGDTX[\s\S]*Can open dashboard/i, "authorized BGH/Admin account case");
requireText(plan, /UAT_KHTC_TTGDTX_OPERATOR[\s\S]*no money movement action is available/i, "KHTC read-only account case");
requireText(plan, /UAT_TUYEN_SINH_TTGDTX[\s\S]*Blocked from unrestricted finance dashboard data/i, "Tuyen Sinh denial case");
requireText(plan, /UAT_PHAP_CHE_CONTRACT_ONLY[\s\S]*contract read permission alone does not expose finance totals/i, "contract-only denial case");
requireText(plan, /UAT_OUT_OF_SCOPE_STAFF[\s\S]*Blocked or sees empty scoped state/i, "out-of-scope denial case");
requireText(plan, /audit:ttgdtx-dashboard-access[\s\S]*audit:ttgdtx-data-fetch-gate[\s\S]*audit:ttgdtx-role-scope-access[\s\S]*audit:ttgdtx-accounting-dashboard-uat-plan/i, "required local audit commands");
requireText(plan, /Source comparison[\s\S]*Summary\/control-board source check result/i, "source comparison evidence field");
requireText(plan, /Stop UAT and fix/i, "stop condition section");
requireText(plan, /Real passwords, temporary passwords, OTPs, password reset links,\s+account activation\/invite links, CCCD, bank data or student private data appears in\s+screenshots, Git, Codex\/chat or evidence notes/i, "account-secret stop condition");
requireText(plan, /P5-01 is PASS_LOCAL/i, "PASS_LOCAL result");
requireText(plan, /not production-approved/i, "production NO-GO boundary");

const runbook = read("docs/P2_18_ACCOUNTING_DASHBOARD_UAT_RUNBOOK.md");
if (!/P2-18-04[\s\S]*outside finance\/report scope[\s\S]*blocked/i.test(runbook)) {
  fail("P2_18 runbook must include out-of-scope dashboard access test.");
}
if (!/P2-18-05[\s\S]*contract read permission alone does not expose finance totals/i.test(runbook)) {
  fail("P2_18 runbook must include contract-only denial test.");
}

const packageJson = JSON.parse(read("package.json"));
if (!packageJson.scripts?.["audit:ttgdtx-accounting-dashboard-uat-plan"]) {
  fail("package.json: missing audit:ttgdtx-accounting-dashboard-uat-plan script");
}

const backlog = read("docs/HEU_SYSTEM_BUILD_BACKLOG.md");
if (!/P5-01[\s\S]*PASS_LOCAL[\s\S]*TTGDTX_ACCOUNTING_DASHBOARD_ROLE_UAT_PLAN_20260627\.md[\s\S]*audit:ttgdtx-accounting-dashboard-uat-plan/.test(backlog)) {
  fail("Backlog P5-01 must be PASS_LOCAL and reference the dashboard UAT plan audit.");
}

const checklist = read("docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md");
if (!/P2-18 accounting dashboard[\s\S]*IN_PROGRESS[\s\S]*TTGDTX_ACCOUNTING_DASHBOARD_ROLE_UAT_PLAN_20260627\.md/.test(checklist)) {
  fail("Production checklist must keep P2-18 IN_PROGRESS and reference the role UAT plan.");
}

const agents = read("AGENTS.md");
if (!agents.includes("docs/TTGDTX_ACCOUNTING_DASHBOARD_ROLE_UAT_PLAN_20260627.md")) {
  fail("AGENTS.md: missing dashboard role UAT plan in required reading.");
}
if (!agents.includes("npm.cmd run audit:ttgdtx-accounting-dashboard-uat-plan")) {
  fail("AGENTS.md: missing dashboard UAT plan audit in final handoff checks.");
}

const releaseGateAudit = read("scripts/audit-ttgdtx-release-gates.mjs");
if (
  !releaseGateAudit.includes(planPath) ||
  !releaseGateAudit.includes("audit:ttgdtx-accounting-dashboard-uat-plan")
) {
  fail("scripts/audit-ttgdtx-release-gates.mjs: missing dashboard role UAT plan gate coverage.");
}

if (failures.length > 0) {
  console.error("TTGDTX accounting dashboard UAT plan audit failed.");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("TTGDTX accounting dashboard UAT plan audit passed. P5-01 is packaged but not production-approved.");
