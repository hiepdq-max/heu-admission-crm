import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const policyPath = "docs/HEU_LEAD_TO_STUDENT_HANDOVER_POLICY_20260627.md";
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
    fail(`${policyPath}: missing ${label}`);
  }
}

requireFile(policyPath);
requireFile("docs/TTGDTX_LEAD_QUICK_FIX_UAT_RUNBOOK.md");
requireFile("components/leads/lead-handover-panel.tsx");
requireFile("lib/permissions.ts");
requireFile("lib/heu-os-display.ts");

const policy = exists(policyPath) ? read(policyPath) : "";
const handoverPanel = exists("components/leads/lead-handover-panel.tsx")
  ? read("components/leads/lead-handover-panel.tsx")
  : "";

requireText(policy, /Tuyen Sinh[\s\S]*CTHSSV[\s\S]*Dao Tao[\s\S]*KHTC/i, "department responsibility chain");
requireText(policy, /DOCUMENT_SUBMITTED[\s\S]*ELIGIBLE[\s\S]*ENROLLED/i, "lead status basis");
requireText(policy, /source\/evidence link/i, "source/evidence link requirement");
requireText(policy, /Accept or reject result with reason, timestamp and audit activity/i, "accept/reject audit requirement");
requireText(policy, /Do not paste raw student, parent, CCCD, phone, bank, password, OTP or credential\s+data/i, "sensitive-data boundary");
requireText(policy, /handover\.create[\s\S]*handover\.accept_cthssv[\s\S]*handover\.accept_accounting/i, "handover permission hooks");
requireText(policy, /server side,\s*not only by hiding buttons in the UI/i, "server-side enforcement rule");
requireText(policy, /Lead-to-student handover does not:[\s\S]*Create receivables[\s\S]*Collect tuition[\s\S]*Issue invoice or receipt[\s\S]*Reconcile money[\s\S]*Approve partner payment[\s\S]*Execute payout[\s\S]*Mark revenue[\s\S]*Mark production GO/i, "finance and production boundary");
requireText(policy, /P2-05 remains the receivable gate[\s\S]*P2-03 remains the final\s+student receivable creation control/i, "P2-05/P2-03 finance gate dependency");
requireText(policy, /P0-19, P2-01 and P2-02 must still be ready/i, "legal/tuition prerequisite dependency");
requireText(policy, /AI output alone is not approval evidence/i, "AI approval boundary");
requireText(policy, /P3-02 is PASS_LOCAL/i, "PASS_LOCAL result");
requireText(policy, /Signed UAT must still prove role scope/i, "signed UAT boundary");
requireText(
  policy,
  /(?=[\s\S]*P3-02 Acceptance Matrix)(?=[\s\S]*data-heu-lead-handover-acceptance-matrix="P3-02")(?=[\s\S]*P3-02-ACCEPT-01)(?=[\s\S]*P3-02-ACCEPT-06)(?=[\s\S]*Complete handover packet)(?=[\s\S]*Receiving role and workspace scope)(?=[\s\S]*Accept\/reject decision trace)(?=[\s\S]*Finance boundary preserved)(?=[\s\S]*Redacted evidence only)(?=[\s\S]*Human approval, audit and AI boundary)(?=[\s\S]*P3_02_ACCEPT \/ FAIL \/ BLOCKED)/i,
  "P3-02 acceptance matrix",
);
requireText(
  handoverPanel,
  /(?=[\s\S]*data-heu-lead-handover-acceptance-matrix="P3-02")(?=[\s\S]*P3-02 lead-to-student handover acceptance matrix)(?=[\s\S]*PASS_LOCAL\s+only)(?=[\s\S]*packet is complete)(?=[\s\S]*receiver scope is valid)(?=[\s\S]*accept\/reject trace is auditable)(?=[\s\S]*finance gates remain separate)(?=[\s\S]*evidence is redacted)(?=[\s\S]*human approval is explicit)(?=[\s\S]*P3-02-ACCEPT-01)(?=[\s\S]*P3-02-ACCEPT-06)(?=[\s\S]*P3_02_ACCEPT \/ FAIL \/ BLOCKED)/i,
  "P3-02 visible acceptance matrix",
);

const permissions = read("lib/permissions.ts");
for (const permission of [
  "handover.create",
  "handover.accept_cthssv",
  "handover.accept_accounting",
]) {
  if (!permissions.includes(permission)) {
    fail(`lib/permissions.ts: missing ${permission}`);
  }
}

const osDisplay = read("lib/heu-os-display.ts");
if (!/WF_CTHSSV_HANDOVER/.test(osDisplay) || !/APPROVE_HSSV_ACCEPT/.test(osDisplay)) {
  fail("lib/heu-os-display.ts: missing CTHSSV handover workflow/approval labels.");
}

const packageJson = JSON.parse(read("package.json"));
if (!packageJson.scripts?.["audit:heu-lead-handover-policy"]) {
  fail("package.json: missing audit:heu-lead-handover-policy script");
}

const backlog = read("docs/HEU_SYSTEM_BUILD_BACKLOG.md");
if (!/P3-02[\s\S]*PASS_LOCAL[\s\S]*HEU_LEAD_TO_STUDENT_HANDOVER_POLICY_20260627\.md[\s\S]*P3-02 acceptance matrix[\s\S]*audit:heu-lead-handover-policy/.test(backlog)) {
  fail("Backlog P3-02 must be PASS_LOCAL and reference the handover policy audit.");
}

const checklist = read("docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md");
if (!/Lead-to-student handover guard[\s\S]*PASS_LOCAL[\s\S]*P3-02 acceptance matrix[\s\S]*audit:heu-lead-handover-policy/.test(checklist)) {
  fail("Production checklist must include the lead-to-student handover PASS_LOCAL guard.");
}

const agents = read("AGENTS.md");
if (!agents.includes("docs/HEU_LEAD_TO_STUDENT_HANDOVER_POLICY_20260627.md")) {
  fail("AGENTS.md: missing lead handover policy in required reading.");
}
if (!agents.includes("npm.cmd run audit:heu-lead-handover-policy")) {
  fail("AGENTS.md: missing lead handover audit in final handoff checks.");
}

const releaseGateAudit = read("scripts/audit-ttgdtx-release-gates.mjs");
if (!releaseGateAudit.includes(policyPath) || !releaseGateAudit.includes("audit:heu-lead-handover-policy")) {
  fail("scripts/audit-ttgdtx-release-gates.mjs: missing handover policy gate coverage.");
}

if (failures.length > 0) {
  console.error("HEU lead-to-student handover policy audit failed.");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("HEU lead-to-student handover policy audit passed. P3-02 remains controlled and finance-gated.");
