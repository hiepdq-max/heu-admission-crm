import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
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

function requireText(contents, pattern, label, file) {
  if (!pattern.test(contents)) {
    fail(`${file}: missing ${label}`);
  }
}

const componentPath =
  "components/ttgdtx/ttgdtx-payout-execution-readiness-checklist.tsx";
const duplicateGuardPath =
  "components/ttgdtx/ttgdtx-payout-duplicate-guard.tsx";
const evidenceChecklistPath =
  "components/ttgdtx/ttgdtx-payout-uat-evidence-checklist.tsx";
const pagePath = "app/ttgdtx/payment-requests/pay/page.tsx";
const buttonPath = "app/ttgdtx/payment-requests/pay/payment-submit-button.tsx";
const actionPath = "app/ttgdtx/payment-requests/pay/actions.ts";
const sqlPath = "database/step107_ttgdtx_payment_execution_p2_17.sql";
const runbookPath = "docs/P2_17_DUPLICATE_PAYOUT_UAT_RUNBOOK.md";
const checklistPath = "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md";
const backlogPath = "docs/HEU_SYSTEM_BUILD_BACKLOG.md";
const inventoryPath = "docs/HEU_CURRENT_STATE_INVENTORY.md";

for (const file of [
  componentPath,
  duplicateGuardPath,
  evidenceChecklistPath,
  pagePath,
  buttonPath,
  actionPath,
  sqlPath,
  runbookPath,
  checklistPath,
  backlogPath,
  inventoryPath,
  "AGENTS.md",
  "package.json",
  "scripts/audit-ttgdtx-release-gates.mjs",
]) {
  requireFile(file);
}

const component = exists(componentPath) ? read(componentPath) : "";
const page = exists(pagePath) ? read(pagePath) : "";
const button = exists(buttonPath) ? read(buttonPath) : "";
const action = exists(actionPath) ? read(actionPath) : "";
const sql = exists(sqlPath) ? read(sqlPath) : "";
const runbook = exists(runbookPath) ? read(runbookPath) : "";
const checklist = exists(checklistPath) ? read(checklistPath) : "";
const backlog = exists(backlogPath) ? read(backlogPath) : "";
const inventory = exists(inventoryPath) ? read(inventoryPath) : "";
const agents = exists("AGENTS.md") ? read("AGENTS.md") : "";
const releaseGateAudit = exists("scripts/audit-ttgdtx-release-gates.mjs")
  ? read("scripts/audit-ttgdtx-release-gates.mjs")
  : "";
const packageJson = JSON.parse(read("package.json"));

requireText(
  component,
  /(?=[\s\S]*data-ttgdtx-payout-execution-readiness-checklist="P2-17")(?=[\s\S]*P2-17 payout execution readiness checklist)(?=[\s\S]*PASS_LOCAL only)(?=[\s\S]*data-ttgdtx-payout-immediate-stop="P2-17")(?=[\s\S]*P2-17 immediate payout stop conditions)(?=[\s\S]*P2_17_STOP_CHECK \/ RECORD_READY \/ BLOCKED)(?=[\s\S]*Request not approved or cannot pay)(?=[\s\S]*Amount, voucher, evidence or dossier fails)(?=[\s\S]*Bank-transfer boundary is unclear)(?=[\s\S]*P2-17-EXEC-01)(?=[\s\S]*P2-17-EXEC-08)(?=[\s\S]*Approved request identity)(?=[\s\S]*Remaining amount control)(?=[\s\S]*Voucher uniqueness)(?=[\s\S]*Evidence URL required)(?=[\s\S]*P2-19 dossier blockers)(?=[\s\S]*RPC-only write path)(?=[\s\S]*Double-submit guard)(?=[\s\S]*Audit trace and status)(?=[\s\S]*does not initiate a\s+bank transfer)(?=[\s\S]*Do not paste passwords, OTPs, service-role keys, raw student PII,\s+CCCD, bank accounts, raw bank statements, raw vouchers or raw\s+payment data into Git, Codex or chat)/i,
  "P2-17 payout execution readiness checklist UI",
  componentPath,
);

requireText(
  component,
  /(?=[\s\S]*data-ttgdtx-payout-release-decision-manifest="P2-17")(?=[\s\S]*P2-17 payout release decision manifest)(?=[\s\S]*PASS_LOCAL only)(?=[\s\S]*P2-17-REL-01)(?=[\s\S]*P2-17-REL-06)(?=[\s\S]*Approved request and scope)(?=[\s\S]*Amount and remaining balance)(?=[\s\S]*Voucher and evidence reference)(?=[\s\S]*P2-19 dossier gate)(?=[\s\S]*Technical write guard)(?=[\s\S]*Human release decision)(?=[\s\S]*P2_17_RELEASE_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*does not\s+initiate a bank transfer, approve finance action, accept UAT or\s+mark production GO)(?=[\s\S]*Missing release decision ID, unsigned owner decision, uncontrolled\s+evidence location, raw sensitive payout data or unclear bank-transfer\s+boundary keeps P2-17 NO-GO)/i,
  "P2-17 payout release decision manifest UI",
  componentPath,
);

requireText(
  page,
  /TtgdtxPayoutExecutionReadinessChecklist[\s\S]*<TtgdtxPayoutDuplicateGuard\s*\/>[\s\S]*<TtgdtxPayoutExecutionReadinessChecklist\s*\/>[\s\S]*<TtgdtxPayoutUatEvidenceChecklist\s*\/>/,
  "P2-17 page mounts execution readiness between duplicate guard and UAT evidence checklist",
  pagePath,
);

requireText(
  button,
  /useFormStatus\(\)[\s\S]*pending[\s\S]*disabled=\{isDisabled\}/,
  "submit button disables while pending",
  buttonPath,
);

requireText(
  action,
  /const voucherNo = textValue\(formData, "voucher_no"\)[\s\S]*if \(!voucherNo\)[\s\S]*const evidenceUrl = textValue\(formData, "evidence_url"\)[\s\S]*if \(!evidenceUrl\)[\s\S]*record_ttgdtx_partner_payment_disbursement/i,
  "server action requires voucher and evidence before RPC",
  actionPath,
);

requireText(
  sql,
  /(?=[\s\S]*for update)(?=[\s\S]*uq_ttgdtx_partner_payment_disbursement_voucher)(?=[\s\S]*lower\(btrim\(voucher_no\)\))(?=[\s\S]*revoke insert, update, delete on table public\.ttgdtx_partner_payment_disbursements from authenticated)(?=[\s\S]*if v_amount > v_remaining)(?=[\s\S]*P2_19_ACCEPTANCE_BEFORE_PAYOUT)(?=[\s\S]*P2_19_PARTNER_INVOICE_BEFORE_PAYOUT)/i,
  "SQL payout execution hard guards",
  sqlPath,
);

requireText(
  runbook,
  /(?=[\s\S]*ttgdtx-payout-execution-readiness-checklist\.tsx)(?=[\s\S]*P2-17-EXEC-01)(?=[\s\S]*P2-17-EXEC-08)(?=[\s\S]*Payout Release Decision Manifest)(?=[\s\S]*data-ttgdtx-payout-release-decision-manifest="P2-17")(?=[\s\S]*P2-17-REL-01)(?=[\s\S]*P2-17-REL-06)(?=[\s\S]*P2_17_RELEASE_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*audit:ttgdtx-payout-execution-readiness)(?=[\s\S]*does not replace signed UAT)/i,
  "runbook references execution readiness checklist",
  runbookPath,
);

requireText(
  checklist,
  /(?=[\s\S]*P2-17 execute payout once)(?=[\s\S]*IN_PROGRESS)(?=[\s\S]*payout release decision manifest)(?=[\s\S]*ttgdtx-payout-execution-readiness-checklist\.tsx)(?=[\s\S]*audit:ttgdtx-payout-execution-readiness)(?=[\s\S]*signed UAT)/i,
  "production checklist keeps P2-17 IN_PROGRESS with execution readiness audit",
  checklistPath,
);

requireText(
  backlog,
  /P2-17[\s\S]*payout release decision manifest[\s\S]*ttgdtx-payout-execution-readiness-checklist\.tsx[\s\S]*audit:ttgdtx-payout-execution-readiness/i,
  "backlog records P2-17 execution readiness guard",
  backlogPath,
);

requireText(
  inventory,
  /(?=[\s\S]*Partner payment\/payout[\s\S]*payout release decision manifest[\s\S]*Signed payout UAT pending)(?=[\s\S]*npm\.cmd run audit:ttgdtx-payout-execution-readiness[\s\S]*PASS)/i,
  "current-state P2-17 payout execution readiness audit evidence",
  inventoryPath,
);

if (!packageJson.scripts?.["audit:ttgdtx-payout-execution-readiness"]) {
  fail("package.json: missing audit:ttgdtx-payout-execution-readiness script");
}

requireText(
  agents,
  /Before any final handoff[\s\S]*npm\.cmd run audit:ttgdtx-payout-execution-readiness/i,
  "AGENTS final handoff payout execution readiness audit command",
  "AGENTS.md",
);

for (const needle of [
  componentPath,
  "scripts/audit-ttgdtx-payout-execution-readiness.mjs",
  "audit:ttgdtx-payout-execution-readiness",
]) {
  if (!releaseGateAudit.includes(needle)) {
    fail(`scripts/audit-ttgdtx-release-gates.mjs: missing ${needle}`);
  }
}

if (failures.length > 0) {
  console.error("TTGDTX payout execution readiness audit failed.");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(
  "TTGDTX payout execution readiness audit passed. P2-17 operator pre-pay checks are packaged for UAT.",
);
