import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const policyPath = "docs/TTGDTX_RECEIVABLE_PAYMENT_STATUS_LIFECYCLE_POLICY_20260627.md";
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

function requireText(contents, pattern, label, file = policyPath) {
  if (!pattern.test(contents)) {
    fail(`${file}: missing ${label}`);
  }
}

function requireAll(contents, values, label, file) {
  for (const value of values) {
    if (!contents.includes(value)) {
      fail(`${file}: missing ${label} ${value}`);
    }
  }
}

const requiredFiles = [
  policyPath,
  "database/step90_ttgdtx_student_receivables.sql",
  "database/step96_ttgdtx_tuition_collection_p2_10.sql",
  "database/step101_ttgdtx_reconciliation_p2_13.sql",
  "database/step104_ttgdtx_reconciliation_approval_p2_14.sql",
  "database/step105_ttgdtx_partner_payment_request_p2_15.sql",
  "database/step106_ttgdtx_payment_request_approval_p2_16.sql",
  "database/step107_ttgdtx_payment_execution_p2_17.sql",
  "components/ttgdtx/ttgdtx-reconciliation-exception-gate.tsx",
  "app/ttgdtx/reconciliation/page.tsx",
  "app/ttgdtx/reconciliation/review/page.tsx",
  "docs/TTGDTX_PERIOD_LOCK_ADJUSTMENT_POLICY_20260627.md",
  "docs/P2_17_DUPLICATE_PAYOUT_UAT_RUNBOOK.md",
];

for (const file of requiredFiles) {
  requireFile(file);
}

const policy = exists(policyPath) ? read(policyPath) : "";
const step90 = read("database/step90_ttgdtx_student_receivables.sql");
const step96 = read("database/step96_ttgdtx_tuition_collection_p2_10.sql");
const step101 = read("database/step101_ttgdtx_reconciliation_p2_13.sql");
const step104 = read("database/step104_ttgdtx_reconciliation_approval_p2_14.sql");
const step105 = read("database/step105_ttgdtx_partner_payment_request_p2_15.sql");
const step106 = read("database/step106_ttgdtx_payment_request_approval_p2_16.sql");
const step107 = read("database/step107_ttgdtx_payment_execution_p2_17.sql");
const reconciliationExceptionGate = read(
  "components/ttgdtx/ttgdtx-reconciliation-exception-gate.tsx",
);
const reconciliationPage = read("app/ttgdtx/reconciliation/page.tsx");
const reconciliationReviewPage = read("app/ttgdtx/reconciliation/review/page.tsx");

requireText(policy, /P4-01 receivable\/payment status lifecycle/i, "P4-01 scope");
requireText(policy, /NO-GO until signed finance UAT and human owner approval/i, "production NO-GO boundary");
requireText(policy, /does not approve production migration,\s+real-data import, production finance operation, revenue recognition or payout\s+execution/i, "local-only boundary");

requireAll(
  policy,
  [
    "ttgdtx_student_receivables",
    "ttgdtx_tuition_payments",
    "ttgdtx_tuition_reconciliation_batches",
    "ttgdtx_tuition_reconciliation_lines",
    "ttgdtx_partner_payment_requests",
    "ttgdtx_partner_payment_disbursements",
  ],
  "lifecycle object",
  policyPath,
);

requireText(policy, /Lead\/gate to receivable[\s\S]*P0-19, P2-01, P2-02 and P2-05/i, "receivable gate transition");
requireText(policy, /P2-14 must move `READY_FOR_REVIEW -> REVIEWED -> APPROVED -> LOCKED`/i, "reconciliation review chain");
requireText(policy, /P2-16 must move `SUBMITTED -> CHECKED -> APPROVED`/i, "payment request approval chain");
requireText(policy, /P2-17 can record payout only from `APPROVED`/i, "payout approval dependency");
requireText(policy, /P4-01 is PASS_LOCAL[\s\S]*Signed finance UAT must still prove/i, "PASS_LOCAL and signed UAT boundary");

requireAll(
  step90,
  [
    "receivable_status",
    "PENDING_COLLECTION",
    "PARTIAL",
    "PAID",
    "OVERDUE",
    "WAIVED",
    "CANCELLED",
    "collection_status",
    "invoice_status",
    "paid_amount_vnd <= greatest(expected_amount_vnd - discount_amount_vnd, 0)",
  ],
  "P2-03 status/amount guard",
  "database/step90_ttgdtx_student_receivables.sql",
);

requireAll(
  step96,
  [
    "payment_status in ('DRAFT', 'POSTED', 'REVERSED', 'CANCELLED')",
    "invoice_required in ('REQUIRED', 'NOT_REQUIRED', 'PENDING_POLICY', 'WAIVED_BY_AUTHORITY')",
    "invoice_status in ('NOT_STARTED', 'PENDING', 'ISSUED', 'CANCELLED', 'REPLACED', 'WAIVED', 'NOT_REQUIRED')",
    "create or replace function public.reverse_ttgdtx_tuition_payment",
    "payment_status = 'REVERSED'",
  ],
  "P2-10 collection/invoice lifecycle",
  "database/step96_ttgdtx_tuition_collection_p2_10.sql",
);

requireAll(
  step101,
  [
    "reconciliation_status in ('DRAFT', 'READY_FOR_REVIEW', 'REVIEWED', 'APPROVED', 'LOCKED', 'CANCELLED')",
    "line_status in ('READY', 'BLOCKED', 'IN_BATCH', 'REVIEWED', 'EXCLUDED', 'CANCELLED')",
    "case when p.payment_status <> 'POSTED' then 'PAYMENT_NOT_POSTED' end",
    "NEEDS_INVOICE_DECISION",
  ],
  "P2-13 reconciliation lifecycle",
  "database/step101_ttgdtx_reconciliation_p2_13.sql",
);

requireAll(
  step104,
  [
    "READY_FOR_REVIEW",
    "REVIEWED",
    "APPROVED",
    "LOCKED",
    "review_ttgdtx_reconciliation_batch",
    "coalesce(line.invoice_control_status, 'NEEDS_INVOICE_DECISION') <> 'RESOLVED'",
  ],
  "P2-14 review/lock lifecycle",
  "database/step104_ttgdtx_reconciliation_approval_p2_14.sql",
);

requireAll(
  step105,
  [
    "request_status in ('SUBMITTED', 'CHECKED', 'APPROVED', 'REJECTED', 'CANCELLED', 'PAID')",
    "b.reconciliation_status <> 'LOCKED'",
    "line_status in ('IN_REQUEST', 'EXCLUDED', 'CANCELLED')",
  ],
  "P2-15 payment request lifecycle",
  "database/step105_ttgdtx_partner_payment_request_p2_15.sql",
);

requireAll(
  step106,
  [
    "v_action = 'CHECK'",
    "v_next_status := 'CHECKED'",
    "v_action = 'APPROVE'",
    "v_next_status := 'APPROVED'",
    "v_request.request_status <> 'SUBMITTED'",
    "v_request.request_status <> 'CHECKED'",
  ],
  "P2-16 approval chain",
  "database/step106_ttgdtx_payment_request_approval_p2_16.sql",
);

requireAll(
  step107,
  [
    "payment_status in ('POSTED', 'CANCELLED')",
    "v_request.request_status <> 'APPROVED'",
    "REQUEST_ALREADY_PAID",
    "uq_ttgdtx_partner_payment_disbursement_voucher",
    "request_status = case",
    "then 'PAID'",
  ],
  "P2-17 payout lifecycle",
  "database/step107_ttgdtx_payment_execution_p2_17.sql",
);

requireText(
  reconciliationExceptionGate,
  /(?=[\s\S]*data-ttgdtx-reconciliation-exception-gate="P2-13_P2-14")(?=[\s\S]*REC-GATE-01)(?=[\s\S]*REC-GATE-02)(?=[\s\S]*REC-GATE-03)(?=[\s\S]*REC-GATE-04)(?=[\s\S]*POSTED)(?=[\s\S]*invoice_control_status)(?=[\s\S]*LOCKED)(?=[\s\S]*P0-14\/P6-03)(?=[\s\S]*PASS_LOCAL only)(?=[\s\S]*Signed finance UAT)(?=[\s\S]*payout reliance)/i,
  "P2-13/P2-14 reconciliation exception gate",
  "components/ttgdtx/ttgdtx-reconciliation-exception-gate.tsx",
);

requireText(
  reconciliationPage,
  /(?=[\s\S]*TtgdtxReconciliationExceptionGate)(?=[\s\S]*currentCode="P2-13")/i,
  "P2-13 reconciliation exception gate mount",
  "app/ttgdtx/reconciliation/page.tsx",
);

requireText(
  reconciliationReviewPage,
  /(?=[\s\S]*TtgdtxReconciliationExceptionGate)(?=[\s\S]*currentCode="P2-14")/i,
  "P2-14 reconciliation exception gate mount",
  "app/ttgdtx/reconciliation/review/page.tsx",
);

const packageJson = JSON.parse(read("package.json"));
if (!packageJson.scripts?.["audit:ttgdtx-receivable-payment-lifecycle"]) {
  fail("package.json: missing audit:ttgdtx-receivable-payment-lifecycle script");
}

const backlog = read("docs/HEU_SYSTEM_BUILD_BACKLOG.md");
if (
  !/P4-01[\s\S]*PASS_LOCAL[\s\S]*TTGDTX_RECEIVABLE_PAYMENT_STATUS_LIFECYCLE_POLICY_20260627\.md[\s\S]*ttgdtx-reconciliation-exception-gate\.tsx[\s\S]*REC-GATE-01[\s\S]*REC-GATE-04[\s\S]*audit:ttgdtx-receivable-payment-lifecycle/.test(backlog)
) {
  fail("Backlog P4-01 must be PASS_LOCAL and reference lifecycle policy plus reconciliation exception gate audit.");
}

const checklist = read("docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md");
if (
  !/Receivable\/payment status lifecycle[\s\S]*PASS_LOCAL[\s\S]*TTGDTX_RECEIVABLE_PAYMENT_STATUS_LIFECYCLE_POLICY_20260627\.md[\s\S]*ttgdtx-reconciliation-exception-gate\.tsx[\s\S]*REC-GATE-01[\s\S]*REC-GATE-04/.test(checklist)
) {
  fail("Production checklist must include receivable/payment lifecycle PASS_LOCAL evidence and reconciliation exception gate.");
}

const agents = read("AGENTS.md");
if (!agents.includes("docs/TTGDTX_RECEIVABLE_PAYMENT_STATUS_LIFECYCLE_POLICY_20260627.md")) {
  fail("AGENTS.md: missing receivable/payment lifecycle policy in required reading.");
}
if (!agents.includes("npm.cmd run audit:ttgdtx-receivable-payment-lifecycle")) {
  fail("AGENTS.md: missing receivable/payment lifecycle audit in final handoff checks.");
}

const releaseGateAudit = read("scripts/audit-ttgdtx-release-gates.mjs");
if (
  !releaseGateAudit.includes(policyPath) ||
  !releaseGateAudit.includes("ttgdtx-reconciliation-exception-gate.tsx") ||
  !releaseGateAudit.includes("audit:ttgdtx-receivable-payment-lifecycle")
) {
  fail("scripts/audit-ttgdtx-release-gates.mjs: missing receivable/payment lifecycle gate coverage.");
}

if (failures.length > 0) {
  console.error("TTGDTX receivable/payment lifecycle audit failed.");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("TTGDTX receivable/payment lifecycle audit passed. P4-01 is controlled without production changes.");
