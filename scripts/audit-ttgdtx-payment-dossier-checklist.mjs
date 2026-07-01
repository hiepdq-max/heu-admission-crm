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

const componentPath = "components/ttgdtx/ttgdtx-payment-dossier-checklist.tsx";
const approvalSeparationGuardPath =
  "components/ttgdtx/ttgdtx-payment-approval-separation-guard.tsx";
const p215PagePath = "app/ttgdtx/payment-requests/page.tsx";
const p216PagePath = "app/ttgdtx/payment-requests/review/page.tsx";
const p217PagePath = "app/ttgdtx/payment-requests/pay/page.tsx";
const p215ActionPath = "app/ttgdtx/payment-requests/actions.ts";
const p217ActionPath = "app/ttgdtx/payment-requests/pay/actions.ts";
const checklistPath = "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md";

for (const file of [
  componentPath,
  approvalSeparationGuardPath,
  p215PagePath,
  p216PagePath,
  p217PagePath,
  p215ActionPath,
  p217ActionPath,
  checklistPath,
  "docs/HEU_SYSTEM_BUILD_BACKLOG.md",
  "docs/HEU_IMPLEMENTATION_LOG.md",
  "AGENTS.md",
  "package.json",
  "scripts/audit-ttgdtx-release-gates.mjs",
]) {
  requireFile(file);
}

const component = read(componentPath);
const approvalSeparationGuard = read(approvalSeparationGuardPath);
const p215Page = read(p215PagePath);
const p216Page = read(p216PagePath);
const p217Page = read(p217PagePath);
const p215Action = read(p215ActionPath);
const p217Action = read(p217ActionPath);
const checklist = read(checklistPath);
const backlog = read("docs/HEU_SYSTEM_BUILD_BACKLOG.md");
const agents = read("AGENTS.md");
const releaseGateAudit = read("scripts/audit-ttgdtx-release-gates.mjs");
const packageJson = JSON.parse(read("package.json"));

requireText(
  component,
  /data-ttgdtx-payment-dossier-checklist=\{currentStep\}/,
  "stable payment dossier checklist marker",
  componentPath,
);

requireText(
  component,
  /BBNT[\s\S]*Partner invoice evidence[\s\S]*P2_19_ACCEPTANCE_BEFORE_PAYOUT[\s\S]*P2_19_PARTNER_INVOICE_BEFORE_PAYOUT/i,
  "shared BBNT and partner-invoice dossier checks",
  componentPath,
);

requireText(
  component,
  /P2-15[\s\S]*evidence_url is missing[\s\S]*P2-17[\s\S]*voucher\/evidence[\s\S]*duplicate payout/i,
  "P2-15 evidence and P2-17 payout-specific checks",
  componentPath,
);

requireText(
  component,
  /(?=[\s\S]*data-ttgdtx-payment-dossier-acceptance-matrix=\{currentStep\})(?=[\s\S]*payment dossier acceptance matrix)(?=[\s\S]*PASS_LOCAL only)(?=[\s\S]*PAYMENT_DOSSIER_ACCEPT \/ FAIL \/ BLOCKED)(?=[\s\S]*P2-DOSSIER-ACCEPT-01)(?=[\s\S]*P2-DOSSIER-ACCEPT-06)(?=[\s\S]*Locked reconciliation period accepted)(?=[\s\S]*BBNT accepted-period proof complete)(?=[\s\S]*Partner invoice or waiver controlled)(?=[\s\S]*Payment amount basis reconciles)(?=[\s\S]*P2-19 source-control checks pass)(?=[\s\S]*Signed UAT and production boundary)(?=[\s\S]*PASS_LOCAL is treated as payment approval, payout approval, UAT acceptance, bank transfer instruction or production GO)/i,
  "P2-15/P2-17 payment dossier acceptance matrix",
  componentPath,
);

requireText(
  p215Page,
  /TtgdtxPaymentDossierChecklist[\s\S]*currentStep="P2-15"/,
  "P2-15 page mounts dossier checklist",
  p215PagePath,
);

requireText(
  approvalSeparationGuard,
  /(?=[\s\S]*data-ttgdtx-payment-approval-separation-guard="P2-16")(?=[\s\S]*Guard tách kiểm tra\/duyệt P2-16)(?=[\s\S]*P2-16-SEP-01)(?=[\s\S]*P2-16-SEP-06)(?=[\s\S]*Maker không tự duyệt)(?=[\s\S]*CHECK tr(?:uoc|ước) APPROVE)(?=[\s\S]*Hồ sơ trước lệnh chi)(?=[\s\S]*Duyệt không phải chi tiền)(?=[\s\S]*Return\/reject bắt buộc lý do)(?=[\s\S]*Bằng chứng đã redact)(?=[\s\S]*data-ttgdtx-payment-approval-decision-boundary="P2-16")(?=[\s\S]*P2_16_APPROVAL_SEPARATED \/ NO_GO \/ BLOCKED)(?=[\s\S]*PASS_LOCAL only)(?=[\s\S]*does not initiate payout or approve production use)/i,
  "P2-16 maker/checker/approver separation guard",
  approvalSeparationGuardPath,
);

requireText(
  p216Page,
  /(?=[\s\S]*TtgdtxPaymentApprovalSeparationGuard)(?=[\s\S]*currentCode="P2-16")/i,
  "P2-16 page mounts approval separation guard",
  p216PagePath,
);

requireText(
  p217Page,
  /TtgdtxPaymentDossierChecklist[\s\S]*currentStep="P2-17"/,
  "P2-17 page mounts dossier checklist",
  p217PagePath,
);

requireText(
  p215Action,
  /const evidenceUrl = textValue\(formData, "evidence_url"\)[\s\S]*if \(!evidenceUrl\)[\s\S]*P2-15/i,
  "P2-15 server action requires dossier evidence link",
  p215ActionPath,
);

requireText(
  p217Action,
  /const voucherNo = textValue\(formData, "voucher_no"\)[\s\S]*if \(!voucherNo\)[\s\S]*const evidenceUrl = textValue\(formData, "evidence_url"\)[\s\S]*if \(!evidenceUrl\)/i,
  "P2-17 server action requires voucher and payout evidence",
  p217ActionPath,
);

requireText(
  checklist,
  /BBNT evidence gate before partner payment[\s\S]*PASS_LOCAL[\s\S]*payment dossier acceptance matrix[\s\S]*audit:ttgdtx-payment-dossier-checklist[\s\S]*signed UAT/i,
  "BBNT evidence gate PASS_LOCAL checklist row",
  checklistPath,
);

requireText(
  checklist,
  /P2-15 note\/evidence completeness[\s\S]*PASS_LOCAL[\s\S]*TtgdtxPaymentDossierChecklist[\s\S]*payment dossier acceptance matrix[\s\S]*signed UAT/i,
  "P2-15 dossier completeness PASS_LOCAL row",
  checklistPath,
);

requireText(
  checklist,
  /P2-16 check\/approve payment request[\s\S]*PASS_LOCAL[\s\S]*ttgdtx-payment-approval-separation-guard\.tsx[\s\S]*P2-16-SEP-01[\s\S]*P2-16-SEP-06[\s\S]*P2_16_APPROVAL_SEPARATED \/ NO_GO \/ BLOCKED[\s\S]*signed payout UAT[\s\S]*one person creating, checking and approving without written owner exception/i,
  "P2-16 approval separation PASS_LOCAL checklist row",
  checklistPath,
);

requireText(
  backlog,
  /P2-15[\s\S]*ttgdtx-payment-dossier-checklist[\s\S]*payment dossier acceptance matrix/i,
  "P2-15 backlog dossier checklist evidence",
  "docs/HEU_SYSTEM_BUILD_BACKLOG.md",
);

requireText(
  backlog,
  /P2-16[\s\S]*Partner payment request approval[\s\S]*PASS_LOCAL[\s\S]*ttgdtx-payment-approval-separation-guard\.tsx[\s\S]*P2-16-SEP-01[\s\S]*P2-16-SEP-06[\s\S]*P2_16_APPROVAL_SEPARATED \/ NO_GO \/ BLOCKED[\s\S]*signed payout UAT/i,
  "P2-16 backlog approval separation evidence",
  "docs/HEU_SYSTEM_BUILD_BACKLOG.md",
);

if (!packageJson.scripts?.["audit:ttgdtx-payment-dossier-checklist"]) {
  fail("package.json: missing audit:ttgdtx-payment-dossier-checklist script");
}

requireText(
  agents,
  /npm\.cmd run audit:ttgdtx-payment-dossier-checklist/,
  "AGENTS final handoff audit command",
  "AGENTS.md",
);

for (const needle of [
  componentPath,
  approvalSeparationGuardPath,
  "scripts/audit-ttgdtx-payment-dossier-checklist.mjs",
  "audit:ttgdtx-payment-dossier-checklist",
]) {
  if (!releaseGateAudit.includes(needle)) {
    fail(`scripts/audit-ttgdtx-release-gates.mjs: missing ${needle}`);
  }
}

if (failures.length > 0) {
  console.error("TTGDTX payment dossier checklist audit failed.");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("TTGDTX payment dossier checklist audit passed. P2-15/P2-16/P2-17 show dossier, approval separation and payout evidence gates.");
