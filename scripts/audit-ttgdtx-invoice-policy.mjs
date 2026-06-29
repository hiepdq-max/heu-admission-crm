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

const policyPath = "lib/ttgdtx-invoice-policy.ts";
const componentPath = "components/ttgdtx/ttgdtx-invoice-policy-matrix.tsx";
const paymentsPagePath = "app/ttgdtx/payments/page.tsx";
const checklistPath = "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md";
const backlogPath = "docs/HEU_SYSTEM_BUILD_BACKLOG.md";
const linkedReviewPath = "docs/TTGDTX_LINKED_OPERATING_REVIEW_20260625.md";
const invoiceUatRunbookPath =
  "docs/TTGDTX_P2_10_INVOICE_POLICY_UAT_RUNBOOK_20260627.md";

for (const file of [
  policyPath,
  componentPath,
  paymentsPagePath,
  checklistPath,
  backlogPath,
  linkedReviewPath,
  invoiceUatRunbookPath,
  "docs/HEU_IMPLEMENTATION_LOG.md",
  "AGENTS.md",
  "package.json",
  "scripts/audit-ttgdtx-release-gates.mjs",
]) {
  requireFile(file);
}

const policy = read(policyPath);
const component = read(componentPath);
const paymentsPage = read(paymentsPagePath);
const checklist = read(checklistPath);
const backlog = read(backlogPath);
const linkedReview = read(linkedReviewPath);
const invoiceUatRunbook = read(invoiceUatRunbookPath);
const agents = read("AGENTS.md");
const releaseGateAudit = read("scripts/audit-ttgdtx-release-gates.mjs");
const packageJson = JSON.parse(read("package.json"));

for (const status of [
  "REQUIRED",
  "NOT_REQUIRED",
  "PENDING_POLICY",
  "WAIVED_BY_AUTHORITY",
]) {
  requireText(policy, new RegExp(status), `${status} invoice status`, policyPath);
}

for (const code of [
  "HEU_COLLECTS_STUDENT",
  "CENTER_COLLECTS_STUDENT",
  "SPLIT_COLLECTION",
  "OFFSET_OR_ADJUSTMENT",
  "OTHER_COLLECTION_MODEL",
]) {
  requireText(policy, new RegExp(`code: "${code}"`), `${code} policy case`, policyPath);
}

requireText(
  policy,
  /Khong tra loi yes\/no toan cuc|Không trả lời yes\/no toàn cục/i,
  "global yes/no prohibition",
  policyPath,
);

requireText(
  component,
  /data-ttgdtx-invoice-policy-matrix="P2-10"[\s\S]*PASS_LOCAL[\s\S]*KHTC\/Pháp chế|data-ttgdtx-invoice-policy-matrix="P2-10"[\s\S]*PASS_LOCAL[\s\S]*KHTC\/Phap Che/i,
  "stable P2-10 invoice matrix marker and local-only boundary",
  componentPath,
);

requireText(
  component,
  /PENDING_POLICY[\s\S]*xin xác nhận owner|PENDING_POLICY[\s\S]*xin xac nhan owner/i,
  "unknown-case pending owner confirmation",
  componentPath,
);

requireText(
  component,
  /(?=[\s\S]*data-ttgdtx-invoice-evidence-checklist="P2-10")(?=[\s\S]*P2-10 invoice\/chung-tu UAT evidence checklist)(?=[\s\S]*PASS_LOCAL only)(?=[\s\S]*P2_10_INVOICE_ACCEPT \/ FAIL \/ BLOCKED)(?=[\s\S]*P2-10-INV-01)(?=[\s\S]*P2-10-INV-06)(?=[\s\S]*PENDING_POLICY chan doi soat va chi tiep)(?=[\s\S]*KHTC\/Phap Che ky UAT truoc production)(?=[\s\S]*raw bank data, CCCD, phone, password, temporary password, OTP, password reset link, account activation\/invite link, service-role key or voucher body)(?=[\s\S]*PASS_LOCAL is treated as invoice approval, legal\/tax advice, UAT acceptance or production GO)/i,
  "P2-10 invoice/chung-tu UAT evidence checklist",
  componentPath,
);

requireText(
  component,
  /(?=[\s\S]*data-ttgdtx-invoice-decision-manifest="P2-10")(?=[\s\S]*P2-10 invoice\/chung-tu decision manifest)(?=[\s\S]*PASS_LOCAL only)(?=[\s\S]*P2_10_INVOICE_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*P2-10-DEC-01)(?=[\s\S]*P2-10-DEC-06)(?=[\s\S]*Collection model and payer decision)(?=[\s\S]*Required invoice\/chung-tu issuance decision)(?=[\s\S]*Not-required or waiver basis decision)(?=[\s\S]*Pending policy downstream blocker decision)(?=[\s\S]*Evidence redaction and storage decision)(?=[\s\S]*Final KHTC\/PHAP_CHE sign-off decision)(?=[\s\S]*không phê duyệt xuất hóa đơn)(?=[\s\S]*tư vấn thuế\/pháp lý)(?=[\s\S]*hạch toán tài chính)(?=[\s\S]*nghiệm thu UAT)(?=[\s\S]*PASS_LOCAL is treated as invoice approval)/i,
  "P2-10 invoice/chung-tu decision manifest",
  componentPath,
);

requireText(
  invoiceUatRunbook,
  /(?=[\s\S]*Status:\s*PASS_LOCAL_TEMPLATE)(?=[\s\S]*does not approve invoice issuance, tax\/legal interpretation,\s+finance posting, UAT acceptance or production GO)(?=[\s\S]*P2-10-INV-01)(?=[\s\S]*P2-10-INV-06)(?=[\s\S]*Downstream blocking check)(?=[\s\S]*Final KHTC\/PHAP_CHE UAT sign-off)(?=[\s\S]*passwords, temporary passwords, OTPs, password reset links,\s+account activation\/invite links, service-role keys)(?=[\s\S]*P2-10 Invoice\/Chung-Tu Decision Manifest)(?=[\s\S]*P2_10_INVOICE_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*P2-10-DEC-01)(?=[\s\S]*P2-10-DEC-06)(?=[\s\S]*npm\.cmd run audit:ttgdtx-invoice-policy)(?=[\s\S]*P2-10 invoice\/chung-tu policy remains production NO-GO)/i,
  "P2-10 invoice/chung-tu UAT runbook",
  invoiceUatRunbookPath,
);

requireText(
  paymentsPage,
  /TtgdtxInvoicePolicyMatrix[\s\S]*<TtgdtxInvoicePolicyMatrix \/>/m,
  "P2-10 page mounts invoice policy matrix",
  paymentsPagePath,
);

requireText(
  checklist,
  /P2-10\)[\s\S]*PASS_LOCAL[\s\S]*invoice\/chung-tu UAT evidence checklist[\s\S]*P2-10 invoice\/chung-tu decision manifest[\s\S]*TTGDTX_P2_10_INVOICE_POLICY_UAT_RUNBOOK_20260627\.md[\s\S]*audit:ttgdtx-invoice-policy[\s\S]*signed KHTC\/Phap Che/i,
  "production checklist invoice policy PASS_LOCAL row",
  checklistPath,
);

requireText(
  backlog,
  /P4-02[\s\S]*Invoice\/receipt policy matrix[\s\S]*invoice\/chung-tu UAT evidence checklist[\s\S]*P2-10 invoice\/chung-tu decision manifest[\s\S]*TTGDTX_P2_10_INVOICE_POLICY_UAT_RUNBOOK_20260627\.md[\s\S]*audit:ttgdtx-invoice-policy/i,
  "P4-02 backlog audit evidence",
  backlogPath,
);

requireText(
  linkedReview,
  /Collection invoice\/receipt[\s\S]*invoice policy matrix, invoice\/chung-tu UAT evidence checklist and invoice\/chung-tu decision manifest[\s\S]*PASS_LOCAL/i,
  "linked operating review invoice matrix status",
  linkedReviewPath,
);

if (!packageJson.scripts?.["audit:ttgdtx-invoice-policy"]) {
  fail("package.json: missing audit:ttgdtx-invoice-policy script");
}

requireText(
  agents,
  /npm\.cmd run audit:ttgdtx-invoice-policy/,
  "AGENTS final handoff audit command",
  "AGENTS.md",
);

for (const needle of [
  policyPath,
  componentPath,
  invoiceUatRunbookPath,
  "scripts/audit-ttgdtx-invoice-policy.mjs",
  "audit:ttgdtx-invoice-policy",
]) {
  if (!releaseGateAudit.includes(needle)) {
    fail(`scripts/audit-ttgdtx-release-gates.mjs: missing ${needle}`);
  }
}

if (failures.length > 0) {
  console.error("TTGDTX invoice policy audit failed.");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("TTGDTX invoice policy audit passed. P2-10 has a local policy matrix with production approval still gated.");
