import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const runbookPath = "docs/HEU_LEAD_LIFECYCLE_HANDOVER_UAT_RUNBOOK_20260628.md";
const componentPath = "components/leads/lead-lifecycle-guard.tsx";
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

function requireText(relativePath, pattern, label) {
  if (!exists(relativePath)) {
    return;
  }

  const contents = read(relativePath);
  if (!pattern.test(contents)) {
    fail(`${relativePath}: missing ${label}`);
  }
}

for (const file of [
  runbookPath,
  componentPath,
  "docs/HEU_LEAD_LIFECYCLE_STANDARD_20260627.md",
  "docs/HEU_LEAD_TO_STUDENT_HANDOVER_POLICY_20260627.md",
  "docs/HEU_SYSTEM_BUILD_BACKLOG.md",
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
  "docs/HEU_CURRENT_STATE_INVENTORY.md",
  "docs/HEU_IMPLEMENTATION_LOG.md",
  "AGENTS.md",
  "package.json",
  "scripts/audit-ttgdtx-release-gates.mjs",
]) {
  requireFile(file);
}

requireText(
  runbookPath,
  /Status:\s*PASS_LOCAL_TEMPLATE[\s\S]*Scope:\s*P3-01 lead lifecycle and P3-02 lead-to-student handover[\s\S]*Production status:\s*NO-GO/i,
  "local-only P3 UAT scope",
);
requireText(
  runbookPath,
  /does not approve enrollment,\s+handover reliance, receivable creation, tuition collection, invoice issuance,\s+finance posting, UAT acceptance, owner waiver or production GO/i,
  "P3 UAT non-approval boundary",
);
requireText(
  runbookPath,
  /Required Local Preflight[\s\S]*audit:heu-lead-lifecycle-handover-uat-pack[\s\S]*audit:heu-lead-lifecycle-standard[\s\S]*audit:heu-lead-handover-policy[\s\S]*audit:ttgdtx-release-gates[\s\S]*audit:heu-vietnamese-text-encoding[\s\S]*npm\.cmd run lint[\s\S]*npm\.cmd run build[\s\S]*git status --short --branch/i,
  "local preflight checklist",
);

for (const account of [
  "UAT_TUYEN_SINH_TTGDTX",
  "UAT_CTHSSV",
  "UAT_DAO_TAO",
  "UAT_KHTC_TTGDTX_OPERATOR",
  "UAT_PHAP_CHE",
  "UAT_AUDIT",
  "UAT_OUT_OF_SCOPE_STAFF",
]) {
  requireText(runbookPath, new RegExp(account), `test account ${account}`);
}

for (const caseId of [
  "P3-UAT-01",
  "P3-UAT-02",
  "P3-UAT-03",
  "P3-UAT-04",
  "P3-UAT-05",
  "P3-UAT-06",
  "P3-UAT-07",
  "P3-UAT-08",
]) {
  requireText(runbookPath, new RegExp(caseId), `runbook case ${caseId}`);
  requireText(componentPath, new RegExp(caseId), `visible case ${caseId}`);
}

requireText(
  runbookPath,
  /Evidence Record Template[\s\S]*Lead or packet reference[\s\S]*Use masked\/reference ID only[\s\S]*Data exposure check[\s\S]*No raw PII, CCCD, phone, bank data, vouchers, passwords, temporary passwords, OTPs, password reset links, account activation\/invite links, service-role keys or API keys[\s\S]*Signers[\s\S]*Tuyen Sinh \/ CTHSSV \/ Dao Tao \/ KHTC \/ IT_DATA \/ Audit/i,
  "evidence record template and no-secret rule",
);
requireText(
  runbookPath,
  /P3-01-ACCEPT-01[\s\S]*P3-01-ACCEPT-06[\s\S]*P3-02-ACCEPT-01[\s\S]*P3-02-ACCEPT-06/i,
  "P3 acceptance matrices",
);
requireText(
  runbookPath,
  /Human Decision Manifest[\s\S]*P3-UAT-DEC-01[\s\S]*P3-UAT-DEC-06[\s\S]*READY_FOR_OWNER_REVIEW \/ NO_GO \/ BLOCKED/i,
  "P3 human decision manifest",
);
requireText(
  runbookPath,
  /P3-01\/P3-02 remain pending until every P3-UAT case is executed with redacted\s+evidence, every decision is signed by the required owners, and final owner\s+Go\/No-Go is recorded outside Git\/Codex\/chat/i,
  "P3 closure rule",
);

requireText(
  componentPath,
  /(?=[\s\S]*data-heu-lead-lifecycle-handover-uat-pack="P3-01-P3-02")(?=[\s\S]*P3-01\/P3-02 UAT execution pack:\s*PASS_LOCAL only)(?=[\s\S]*HEU_LEAD_LIFECYCLE_HANDOVER_UAT_RUNBOOK_20260628\.md)(?=[\s\S]*Tuyen Sinh, CTHSSV, Dao Tao, KHTC, IT_DATA and Audit)/i,
  "visible P3 UAT pack",
);
requireText(
  componentPath,
  /PASS_LOCAL does not accept UAT, approve handover reliance, create\s+finance facts, waive evidence, approve owner sign-off or mark\s+production GO/i,
  "visible non-approval boundary",
);

requireText(
  componentPath,
  /No raw form dump into AI[\s\S]*passwords, temporary\s+passwords, OTPs, password reset links, account activation\/invite\s+links, service-role keys, raw student PII, CCCD, phone, bank\s+data, vouchers or payment evidence[\s\S]*Git\/Codex\/chat/i,
  "visible P3 account-secret and raw-evidence warning",
);

const packageJson = JSON.parse(read("package.json"));
if (!packageJson.scripts?.["audit:heu-lead-lifecycle-handover-uat-pack"]) {
  fail("package.json: missing audit:heu-lead-lifecycle-handover-uat-pack script");
}

requireText(
  "AGENTS.md",
  /Required Reading Before Meaningful Changes[\s\S]*docs\/HEU_LEAD_LIFECYCLE_HANDOVER_UAT_RUNBOOK_20260628\.md[\s\S]*Before any final handoff[\s\S]*npm\.cmd run audit:heu-lead-lifecycle-handover-uat-pack/i,
  "AGENTS required reading and final handoff audit",
);

requireText(
  "docs/HEU_SYSTEM_BUILD_BACKLOG.md",
  /P3-01[\s\S]*HEU_LEAD_LIFECYCLE_HANDOVER_UAT_RUNBOOK_20260628\.md[\s\S]*P3-01\/P3-02 UAT execution pack[\s\S]*audit:heu-lead-lifecycle-handover-uat-pack/i,
  "P3-01 backlog UAT pack reference",
);
requireText(
  "docs/HEU_SYSTEM_BUILD_BACKLOG.md",
  /P3-02[\s\S]*HEU_LEAD_LIFECYCLE_HANDOVER_UAT_RUNBOOK_20260628\.md[\s\S]*P3-01\/P3-02 UAT execution pack[\s\S]*signed role-scope UAT and handover decision still required/i,
  "P3-02 backlog UAT pack reference",
);
requireText(
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
  /Lead lifecycle standard[\s\S]*HEU_LEAD_LIFECYCLE_HANDOVER_UAT_RUNBOOK_20260628\.md[\s\S]*P3-01\/P3-02 UAT execution pack[\s\S]*signed UAT still required/i,
  "production checklist P3-01 UAT pack reference",
);
requireText(
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
  /Lead-to-student handover guard[\s\S]*HEU_LEAD_LIFECYCLE_HANDOVER_UAT_RUNBOOK_20260628\.md[\s\S]*P3-01\/P3-02 UAT execution pack[\s\S]*signed UAT and handover decision still required/i,
  "production checklist P3-02 UAT pack reference",
);
requireText(
  "docs/HEU_CURRENT_STATE_INVENTORY.md",
  /M05 Tuyen sinh CRM[\s\S]*P3-01\/P3-02 UAT execution pack[\s\S]*Lead lifecycle\/handover[\s\S]*HEU_LEAD_LIFECYCLE_HANDOVER_UAT_RUNBOOK_20260628\.md[\s\S]*signed role\/workflow UAT and handover decision pending/i,
  "current-state P3 UAT pack reference",
);
requireText(
  "docs/HEU_IMPLEMENTATION_LOG.md",
  /## 2026-06-28 - P3-01 P3-02 Lead Lifecycle Handover UAT Pack[\s\S]*HEU_LEAD_LIFECYCLE_HANDOVER_UAT_RUNBOOK_20260628\.md[\s\S]*lead-lifecycle-guard\.tsx[\s\S]*P3-UAT-01 through\s+P3-UAT-08[\s\S]*audit:heu-lead-lifecycle-handover-uat-pack[\s\S]*This is P3 UAT packaging only[\s\S]*does not execute UAT, accept handover,\s+create receivable, approve finance action, accept evidence, waive owner\s+sign-off or mark production GO/i,
  "implementation log P3 UAT pack boundary",
);
requireText(
  "scripts/audit-ttgdtx-release-gates.mjs",
  /HEU_LEAD_LIFECYCLE_HANDOVER_UAT_RUNBOOK_20260628\.md[\s\S]*scripts\/audit-heu-lead-lifecycle-handover-uat-pack\.mjs[\s\S]*audit:heu-lead-lifecycle-handover-uat-pack[\s\S]*data-heu-lead-lifecycle-handover-uat-pack="P3-01-P3-02"/i,
  "release-gate P3 UAT pack coverage",
);

if (failures.length > 0) {
  console.error("HEU lead lifecycle/handover UAT pack audit failed.");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("HEU lead lifecycle/handover UAT pack audit passed. P3-01/P3-02 UAT is packaged, not accepted.");
