import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const policyPath = "docs/TTGDTX_PERIOD_LOCK_ADJUSTMENT_POLICY_20260627.md";
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

function requireText(contents, pattern, label) {
  if (!pattern.test(contents)) {
    fail(`${policyPath}: missing ${label}`);
  }
}

requireFile(policyPath);
requireFile("docs/P2_13_RECONCILIATION_REPAIR_SAFETY_UAT_RUNBOOK.md");
requireFile("docs/P2_17_DUPLICATE_PAYOUT_UAT_RUNBOOK.md");
requireFile("docs/TTGDTX_AUDIT_LOG_UAT_RUNBOOK.md");

const policy = existsSync(path.join(repoRoot, policyPath)) ? read(policyPath) : "";

requireText(policy, /Do not edit locked lines directly/i, "direct edit block");
requireText(policy, /Do not hard-delete locked batches/i, "hard-delete block");
requireText(policy, /Do not let AI unlock, approve, pay, mark revenue or mark go-live/i, "AI lock boundary");
requireText(policy, /Do not create P2-15 payment request from an unlocked or reopened period/i, "P2-15 locked-period dependency");
requireText(policy, /Human creates adjustment request/i, "human adjustment request");
requireText(policy, /Authorized approver approves or rejects/i, "authorized approval requirement");
requireText(policy, /additive adjustment lines or a controlled reversal, not silent overwrite/i, "no silent overwrite rule");
requireText(policy, /Original locked values, new values, actor, time and evidence link remain traceable/i, "audit traceability");
requireText(policy, /Reopening a locked period is exceptional/i, "exceptional reopen rule");
requireText(policy, /P4-05 is PASS_LOCAL/i, "PASS_LOCAL result");
requireText(policy, /Signed UAT must still prove locked\s+period behavior/i, "signed UAT boundary");

const requiredAdjustmentTypes = [
  "RECEIPT_CORRECTION",
  "INVOICE_STATUS_CORRECTION",
  "STUDENT_STATUS_CORRECTION",
  "BBNT_AMOUNT_CORRECTION",
  "PARTNER_PAYMENT_HOLD",
  "PARTNER_PAYMENT_RELEASE",
];

for (const type of requiredAdjustmentTypes) {
  if (!policy.includes(type)) {
    fail(`${policyPath}: missing adjustment type ${type}`);
  }
}

const packageJson = JSON.parse(read("package.json"));
if (!packageJson.scripts?.["audit:ttgdtx-period-lock-policy"]) {
  fail("package.json: missing audit:ttgdtx-period-lock-policy script");
}

const backlog = read("docs/HEU_SYSTEM_BUILD_BACKLOG.md");
if (!/P4-05[\s\S]*PASS_LOCAL[\s\S]*TTGDTX_PERIOD_LOCK_ADJUSTMENT_POLICY_20260627\.md/.test(backlog)) {
  fail("Backlog P4-05 must be PASS_LOCAL and reference the period lock policy.");
}

if (failures.length > 0) {
  console.error("TTGDTX period lock policy audit failed.");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("TTGDTX period lock policy audit passed. Locked periods require human adjustment evidence.");
