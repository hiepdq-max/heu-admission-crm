import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const failures = [];

function fail(message) {
  failures.push(message);
}

function exists(relativePath) {
  return existsSync(path.join(repoRoot, relativePath));
}

function read(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), "utf8");
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

const requiredFiles = [
  "docs/HEU_FINANCE_ADVANCE_PAYMENT_DATA_DICTIONARY_20260701_V01_DRAFT.md",
  "docs/HEU_SOP_TAM_UNG_THANH_TOAN_SOFTWARE_MAPPING_20260701_V01_DRAFT.md",
  "components/finance/advance-payment-workflow-shell.tsx",
  "app/finance/advance-payment/page.tsx",
  "components/layout/app-shell.tsx",
  "docs/HEU_SYSTEM_BUILD_BACKLOG.md",
  "docs/HEU_IMPLEMENTATION_LOG.md",
  "package.json",
];

for (const file of requiredFiles) {
  requireFile(file);
}

const packageJson = exists("package.json") ? JSON.parse(read("package.json")) : {};

if (!packageJson.scripts?.["audit:heu-finance-advance-payment-shell"]) {
  fail("package.json: missing audit:heu-finance-advance-payment-shell script");
}

requireText(
  "docs/HEU_FINANCE_ADVANCE_PAYMENT_DATA_DICTIONARY_20260701_V01_DRAFT.md",
  /(?=[\s\S]*Status:\s*DRAFT_CONTROL)(?=[\s\S]*Production status:\s*NO-GO)(?=[\s\S]*ADVANCE_MASTER)(?=[\s\S]*ADVANCE_RECON_LOG)(?=[\s\S]*PAYMENT_REQUEST)(?=[\s\S]*PAYMENT_MASTER)(?=[\s\S]*FINANCE_APPROVAL_LOG)(?=[\s\S]*EVIDENCE_REFERENCE)(?=[\s\S]*ADVANCE_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*PAYMENT_REQUEST_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*PAYMENT_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*Raw vouchers, bank statements, payroll files, payee bank accounts, student\s+PII, teacher personal data, CCCD, passwords, OTPs, reset links and invite\s+links stay outside Git\/Codex\/chat)(?=[\s\S]*does not create production schema,\s+import real data, execute bank transfer, approve finance action, accept\s+evidence, accept UAT, approve owner signoff or mark production GO)/i,
  "finance advance/payment data dictionary boundary",
);

requireText(
  "components/finance/advance-payment-workflow-shell.tsx",
  /(?=[\s\S]*data-heu-advance-payment-workflow-shell="P5-04")(?=[\s\S]*PASS_LOCAL DESIGN_ONLY NO_PRODUCTION_PAYMENT NO_BANK_TRANSFER NO_AUTO_COM NO_UAT_ACCEPTANCE NO_OWNER_GO)(?=[\s\S]*ADVANCE_GATE)(?=[\s\S]*PAYMENT_REQUEST_GATE)(?=[\s\S]*PAYMENT_GATE)(?=[\s\S]*P0_10_EVIDENCE_GATE)(?=[\s\S]*ADVANCE_MASTER)(?=[\s\S]*PAYMENT_MASTER)(?=[\s\S]*Khong tao tam ung that)(?=[\s\S]*khong thuc hien chuyen khoan)(?=[\s\S]*Khong coi PASS_LOCAL la SOP da ban hanh)/i,
  "read-only advance/payment workflow shell",
);

requireText(
  "app/finance/advance-payment/page.tsx",
  /(?=[\s\S]*AdvancePaymentWorkflowShell)(?=[\s\S]*active="finance-advance-payment")(?=[\s\S]*Tam ung \/ Thanh toan)/i,
  "advance/payment route mounts shell",
);

requireText(
  "components/layout/app-shell.tsx",
  /(?=[\s\S]*Tam ung\/TT)(?=[\s\S]*href: "\/finance\/advance-payment")(?=[\s\S]*key: "finance-advance-payment")/i,
  "app shell finance advance/payment navigation",
);

requireText(
  "docs/HEU_SYSTEM_BUILD_BACKLOG.md",
  /P5-04[\s\S]*Finance advance\/payment read-only shell[\s\S]*PASS_LOCAL[\s\S]*HEU_FINANCE_ADVANCE_PAYMENT_DATA_DICTIONARY_20260701_V01_DRAFT\.md[\s\S]*advance-payment-workflow-shell\.tsx[\s\S]*\/finance\/advance-payment[\s\S]*audit:heu-finance-advance-payment-shell[\s\S]*does not create production records, execute bank transfer, approve finance action, accept UAT\/evidence or mark production GO/i,
  "P5-04 backlog row",
);

requireText(
  "docs/HEU_IMPLEMENTATION_LOG.md",
  /## 2026-07-01 - Finance Advance Payment Read-Only Shell[\s\S]*HEU_FINANCE_ADVANCE_PAYMENT_DATA_DICTIONARY_20260701_V01_DRAFT\.md[\s\S]*components\/finance\/advance-payment-workflow-shell\.tsx[\s\S]*app\/finance\/advance-payment\/page\.tsx[\s\S]*audit:heu-finance-advance-payment-shell[\s\S]*This is mock workflow and data-dictionary packaging only[\s\S]*does not create production records, execute bank transfer, approve finance action, accept evidence, accept UAT, approve owner signoff or mark production GO/i,
  "implementation log P5-04 entry",
);

if (failures.length > 0) {
  console.error("HEU finance advance/payment shell audit failed.");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(
  "HEU finance advance/payment shell audit passed. P5-04 is read-only PASS_LOCAL and production remains NO-GO.",
);
