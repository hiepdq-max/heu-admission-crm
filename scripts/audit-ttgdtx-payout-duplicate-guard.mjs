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

function requireFile(relativePath) {
  if (!existsSync(path.join(repoRoot, relativePath))) {
    fail(`Missing required file: ${relativePath}`);
  }
}

function requireText(contents, pattern, label, file) {
  if (!pattern.test(contents)) {
    fail(`${file}: missing ${label}`);
  }
}

const componentPath = "components/ttgdtx/ttgdtx-payout-duplicate-guard.tsx";
const evidenceChecklistPath = "components/ttgdtx/ttgdtx-payout-uat-evidence-checklist.tsx";
const pagePath = "app/ttgdtx/payment-requests/pay/page.tsx";
const buttonPath = "app/ttgdtx/payment-requests/pay/payment-submit-button.tsx";
const actionPath = "app/ttgdtx/payment-requests/pay/actions.ts";
const sqlPath = "database/step107_ttgdtx_payment_execution_p2_17.sql";
const runbookPath = "docs/P2_17_DUPLICATE_PAYOUT_UAT_RUNBOOK.md";
const checklistPath = "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md";
const backlogPath = "docs/HEU_SYSTEM_BUILD_BACKLOG.md";

for (const file of [
  componentPath,
  evidenceChecklistPath,
  pagePath,
  buttonPath,
  actionPath,
  sqlPath,
  runbookPath,
  checklistPath,
  backlogPath,
  "docs/HEU_IMPLEMENTATION_LOG.md",
  "AGENTS.md",
  "package.json",
  "scripts/audit-ttgdtx-release-gates.mjs",
]) {
  requireFile(file);
}

const component = read(componentPath);
const evidenceChecklist = read(evidenceChecklistPath);
const page = read(pagePath);
const button = read(buttonPath);
const action = read(actionPath);
const sql = read(sqlPath);
const runbook = read(runbookPath);
const checklist = read(checklistPath);
const backlog = read(backlogPath);
const agents = read("AGENTS.md");
const releaseGateAudit = read("scripts/audit-ttgdtx-release-gates.mjs");
const packageJson = JSON.parse(read("package.json"));

requireText(
  component,
  /data-ttgdtx-payout-duplicate-guard="P2-17"[\s\S]*nút pending[\s\S]*RPC[\s\S]*khóa dòng[\s\S]*voucher guard[\s\S]*P2-19/i,
  "P2-17 duplicate guard UI marker and guard chain",
  componentPath,
);

requireText(
  evidenceChecklist,
  /(?=[\s\S]*data-ttgdtx-payout-uat-evidence-checklist="P2-17")(?=[\s\S]*P2-17 payout UAT evidence checklist)(?=[\s\S]*PASS_LOCAL only)(?=[\s\S]*Signed payout UAT is still required before P2-17 can move from\s+IN_PROGRESS)(?=[\s\S]*raw bank statements, raw bank\s+accounts, vouchers, passwords, OTPs, service-role keys, raw\s+payment data, student PII and CCCD stay outside Git\/Codex\/chat)(?=[\s\S]*P2_17_DUPLICATE_PAYOUT_UAT_RUNBOOK\.md)(?=[\s\S]*P2-17-01\/P2-17-02)(?=[\s\S]*P2-17-03)(?=[\s\S]*P2-17-04\/P2-17-05\/P2-17-07)(?=[\s\S]*P2-17-06)(?=[\s\S]*P2-17-08)(?=[\s\S]*P2-17-09\/P2-17-10\/P2-17-11)(?=[\s\S]*KHTC, PHAP_CHE, BGH and Audit must sign the evidence outside\s+Codex\/chat)/i,
  "P2-17 payout UAT evidence checklist",
  evidenceChecklistPath,
);

for (const uatCase of [
  "P2-17-02",
  "P2-17-03",
  "P2-17-04",
  "P2-17-06",
  "P2-17-08",
  "P2-17-09",
  "P2-17-10",
  "P2-17-11",
]) {
  requireText(component, new RegExp(uatCase), `${uatCase} UI guard reference`, componentPath);
  requireText(runbook, new RegExp(`\\| ${uatCase} \\|`), `${uatCase} runbook case`, runbookPath);
}

requireText(
  page,
  /TtgdtxPayoutDuplicateGuard[\s\S]*<TtgdtxPayoutDuplicateGuard \/>/,
  "P2-17 page mounts duplicate payout guard",
  pagePath,
);

requireText(
  page,
  /<TtgdtxPayoutDuplicateGuard\s*\/>[\s\S]*<TtgdtxPayoutUatEvidenceChecklist\s*\/>/,
  "P2-17 page mounts UAT evidence checklist after duplicate guard",
  pagePath,
);

requireText(
  button,
  /useFormStatus\(\)[\s\S]*pending[\s\S]*disabled=\{isDisabled\}/,
  "client submit button disables while pending",
  buttonPath,
);

requireText(
  action,
  /const voucherNo = textValue\(formData, "voucher_no"\)[\s\S]*if \(!voucherNo\)[\s\S]*const evidenceUrl = textValue\(formData, "evidence_url"\)[\s\S]*if \(!evidenceUrl\)/i,
  "server action requires voucher and evidence URL before RPC",
  actionPath,
);

requireText(
  sql,
  /select \*[\s\S]*from public\.ttgdtx_partner_payment_requests[\s\S]*for update/i,
  "RPC row lock before payout calculation",
  sqlPath,
);

requireText(
  sql,
  /unique index uq_ttgdtx_partner_payment_disbursement_voucher[\s\S]*lower\(btrim\(voucher_no\)\)/i,
  "normalized voucher unique index",
  sqlPath,
);

requireText(
  sql,
  /revoke insert, update, delete on table public\.ttgdtx_partner_payment_disbursements from authenticated/i,
  "direct table writes revoked",
  sqlPath,
);

requireText(
  sql,
  /if v_amount > v_remaining[\s\S]*raise exception/i,
  "overpayment block",
  sqlPath,
);

requireText(
  sql,
  /P2_19_ACCEPTANCE_BEFORE_PAYOUT[\s\S]*P2_19_PARTNER_INVOICE_BEFORE_PAYOUT/i,
  "P2-19 BBNT and partner-invoice blockers",
  sqlPath,
);

requireText(
  runbook,
  /Local Guard Evidence[\s\S]*audit:ttgdtx-payout-duplicate-guard[\s\S]*does not replace signed UAT/i,
  "runbook local guard evidence section",
  runbookPath,
);

requireText(
  checklist,
  /P2-17 execute payout once[\s\S]*IN_PROGRESS[\s\S]*audit:ttgdtx-payout-duplicate-guard[\s\S]*signed UAT/i,
  "production checklist keeps P2-17 IN_PROGRESS with guard evidence",
  checklistPath,
);

requireText(
  backlog,
  /P2-17[\s\S]*audit:ttgdtx-payout-duplicate-guard/i,
  "backlog records P2-17 duplicate guard audit",
  backlogPath,
);

if (!packageJson.scripts?.["audit:ttgdtx-payout-duplicate-guard"]) {
  fail("package.json: missing audit:ttgdtx-payout-duplicate-guard script");
}

requireText(
  agents,
  /npm\.cmd run audit:ttgdtx-payout-duplicate-guard/,
  "AGENTS final handoff audit command",
  "AGENTS.md",
);

for (const needle of [
  componentPath,
  evidenceChecklistPath,
  "scripts/audit-ttgdtx-payout-duplicate-guard.mjs",
  "audit:ttgdtx-payout-duplicate-guard",
]) {
  if (!releaseGateAudit.includes(needle)) {
    fail(`scripts/audit-ttgdtx-release-gates.mjs: missing ${needle}`);
  }
}

if (failures.length > 0) {
  console.error("TTGDTX payout duplicate guard audit failed.");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("TTGDTX payout duplicate guard audit passed. P2-17 duplicate, overpay, direct-write and evidence guards are packaged for UAT.");
