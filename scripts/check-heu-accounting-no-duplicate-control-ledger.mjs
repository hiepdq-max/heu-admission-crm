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

function requireIncludes(contents, token, label, file) {
  if (!contents.includes(token)) {
    fail(`${file}: missing ${label}: ${token}`);
  }
}

function requireAll(contents, tokens, label, file) {
  for (const token of tokens) {
    requireIncludes(contents, token, label, file);
  }
}

const ledgerPath = "docs/HEU_ACCOUNTING_NO_DUPLICATE_CONTROL_LEDGER_20260703.md";
const breakdownPath = "docs/HEU_ACCOUNTING_MODULE_COMPLETION_BREAKDOWN_20260703.md";
const readinessPath = "scripts/check-heu-accounting-local-readiness.mjs";
const moduleBreakdownCheckPath = "scripts/check-heu-accounting-module-breakdown.mjs";
const packagePath = "package.json";
const step90Path = "database/step90_ttgdtx_student_receivables.sql";
const step96Path = "database/step96_ttgdtx_tuition_collection_p2_10.sql";
const step101Path = "database/step101_ttgdtx_reconciliation_p2_13.sql";
const step105Path = "database/step105_ttgdtx_partner_payment_request_p2_15.sql";
const step107Path = "database/step107_ttgdtx_payment_execution_p2_17.sql";
const lifecycleAuditPath = "scripts/audit-ttgdtx-receivable-payment-lifecycle.mjs";
const paymentDossierAuditPath = "scripts/audit-ttgdtx-payment-dossier-checklist.mjs";
const payoutDuplicateAuditPath = "scripts/audit-ttgdtx-payout-duplicate-guard.mjs";
const payoutLedgerPath =
  "docs/P2_17_DUPLICATE_PAYOUT_UAT_EVIDENCE_LEDGER_20260703.md";

for (const file of [
  ledgerPath,
  breakdownPath,
  readinessPath,
  moduleBreakdownCheckPath,
  packagePath,
  step90Path,
  step96Path,
  step101Path,
  step105Path,
  step107Path,
  lifecycleAuditPath,
  paymentDossierAuditPath,
  payoutDuplicateAuditPath,
  payoutLedgerPath,
]) {
  requireFile(file);
}

const ledger = read(ledgerPath);
const breakdown = read(breakdownPath);
const readiness = read(readinessPath);
const moduleBreakdownCheck = read(moduleBreakdownCheckPath);
const packageJson = JSON.parse(read(packagePath));
const step90 = read(step90Path);
const step96 = read(step96Path);
const step101 = read(step101Path);
const step105 = read(step105Path);
const step107 = read(step107Path);
const lifecycleAudit = read(lifecycleAuditPath);
const paymentDossierAudit = read(paymentDossierAuditPath);
const payoutDuplicateAudit = read(payoutDuplicateAuditPath);
const payoutLedger = read(payoutLedgerPath);

requireAll(
  ledger,
  [
    "Status: PASS_LOCAL_NO_DUPLICATE_LEDGER",
    "ACCT_NO_DUPLICATE_READY / NO_GO / BLOCKED",
    "Production/UAT status: NO-GO",
    "does not create receivables",
    "approve finance reliance",
    "production GO",
    "ACCT-NODUP-01",
    "ACCT-NODUP-02",
    "ACCT-NODUP-03",
    "ACCT-NODUP-04",
    "ACCT-NODUP-05",
    "ACCT-NODUP-06",
    "uq_ttgdtx_receivable_lead_policy_term_active",
    "uq_ttgdtx_payment_voucher_active",
    "uq_ttgdtx_reconciliation_payment_once",
    "uq_ttgdtx_payment_request_batch_once",
    "uq_ttgdtx_payment_request_line_once",
    "uq_ttgdtx_partner_payment_disbursement_voucher",
    "REQUEST_ALREADY_PAID",
    "P2-17-02 through P2-17-07",
    "check:heu-accounting-no-duplicate-control-ledger",
    "audit:ttgdtx-receivable-payment-lifecycle",
    "audit:ttgdtx-payment-dossier-checklist",
    "audit:ttgdtx-payout-duplicate-guard",
    "check:heu-accounting-local-readiness",
    "PENDING_OWNER",
  ],
  "no-duplicate ledger coverage",
  ledgerPath,
);

requireAll(
  step90,
  [
    "uq_ttgdtx_receivable_lead_policy_term_active",
    "on public.ttgdtx_student_receivables(lead_id, tuition_policy_id, term_label)",
    "and receivable_status <> 'CANCELLED'",
    "RECEIVABLE_ALREADY_EXISTS",
    "create_ttgdtx_student_receivable",
  ],
  "P2-03 duplicate receivable guard",
  step90Path,
);

requireAll(
  step96,
  [
    "uq_ttgdtx_payment_voucher_active",
    "on public.ttgdtx_tuition_payments(voucher_no)",
    "and payment_status in ('DRAFT', 'POSTED')",
    "v_existing_posted + v_new_effective > v_receivable.payable_amount_vnd",
    "reverse_ttgdtx_tuition_payment",
  ],
  "P2-10 duplicate voucher and over-collection guard",
  step96Path,
);

requireAll(
  step101,
  [
    "uq_ttgdtx_reconciliation_payment_once",
    "on public.ttgdtx_tuition_reconciliation_lines(payment_id)",
    "and line_status not in ('CANCELLED', 'EXCLUDED')",
    "PAYMENT_NOT_POSTED",
    "NEEDS_INVOICE_DECISION",
  ],
  "P2-13 duplicate reconciliation guard",
  step101Path,
);

requireAll(
  step105,
  [
    "uq_ttgdtx_payment_request_batch_once",
    "on public.ttgdtx_partner_payment_requests(reconciliation_batch_id)",
    "uq_ttgdtx_payment_request_line_once",
    "on public.ttgdtx_partner_payment_request_lines(reconciliation_line_id)",
    "request.reconciliation_batch_id = p_batch_id",
    "khong tao trung",
    "P2_19_ACCEPTANCE_BEFORE_PAYOUT",
    "P2_19_PARTNER_INVOICE_BEFORE_PAYOUT",
  ],
  "P2-15 duplicate payment request guard",
  step105Path,
);

requireAll(
  step107,
  [
    "for update",
    "uq_ttgdtx_partner_payment_disbursement_voucher",
    "lower(btrim(voucher_no))",
    "REQUEST_ALREADY_PAID",
    "if v_amount > v_remaining",
    "revoke insert, update, delete on table public.ttgdtx_partner_payment_disbursements from authenticated",
  ],
  "P2-17 duplicate payout guard",
  step107Path,
);

requireAll(
  lifecycleAudit,
  [
    "uq_ttgdtx_partner_payment_disbursement_voucher",
    "REQUEST_ALREADY_PAID",
    "audit:ttgdtx-receivable-payment-lifecycle",
  ],
  "lifecycle audit duplicate coverage",
  lifecycleAuditPath,
);

requireAll(
  paymentDossierAudit,
  [
    "duplicate payout",
    "P2-15",
    "P2-16",
    "P2-17",
  ],
  "payment dossier duplicate boundary coverage",
  paymentDossierAuditPath,
);

requireAll(
  payoutDuplicateAudit,
  [
    "P2-17-02",
    "P2-17-03",
    "P2-17-04",
    "P2-17-06",
    "P2-17-07",
    "audit:ttgdtx-payout-duplicate-guard",
  ],
  "payout duplicate UAT case coverage",
  payoutDuplicateAuditPath,
);

requireAll(
  payoutLedger,
  [
    "P2-17-02",
    "Double-submit while pending",
    "P2-17-03",
    "Duplicate voucher with spacing/casing changes",
    "P2-17-04",
    "Overpayment attempt",
    "P2-17-07",
    "Payout after request already PAID",
  ],
  "P2-17 duplicate payout ledger coverage",
  payoutLedgerPath,
);

requireAll(
  breakdown,
  [
    "HEU_ACCOUNTING_NO_DUPLICATE_CONTROL_LEDGER_20260703.md",
    "check:heu-accounting-no-duplicate-control-ledger",
    "ACCT_NO_DUPLICATE_READY / NO_GO / BLOCKED",
    "ACCT-NODUP-01",
    "ACCT-NODUP-06",
  ],
  "accounting breakdown no-duplicate coverage",
  breakdownPath,
);

requireAll(
  readiness,
  [
    "check:heu-accounting-no-duplicate-control-ledger",
    "ACCT-04..ACCT-09 no-duplicate ledger",
  ],
  "accounting readiness no-duplicate command",
  readinessPath,
);

requireAll(
  moduleBreakdownCheck,
  [
    ledgerPath,
    "check:heu-accounting-no-duplicate-control-ledger",
    "ACCT_NO_DUPLICATE_READY / NO_GO / BLOCKED",
  ],
  "module breakdown checker no-duplicate enforcement",
  moduleBreakdownCheckPath,
);

for (const scriptName of [
  "check:heu-accounting-no-duplicate-control-ledger",
  "check:heu-accounting-local-readiness",
  "check:heu-accounting-module-breakdown",
  "audit:ttgdtx-receivable-payment-lifecycle",
  "audit:ttgdtx-payment-dossier-checklist",
  "audit:ttgdtx-payout-duplicate-guard",
]) {
  if (!packageJson.scripts?.[scriptName]) {
    fail(`${packagePath}: missing script ${scriptName}`);
  }
}

if (failures.length > 0) {
  console.error("HEU accounting no-duplicate control ledger check failed.");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(
  "HEU accounting no-duplicate control ledger check passed. ACCT no-duplicate controls are packaged locally; signed UAT and owner evidence remain external.",
);
