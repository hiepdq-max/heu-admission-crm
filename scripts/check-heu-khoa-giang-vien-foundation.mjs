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

function requireText(relativePath, tokens, label) {
  if (!exists(relativePath)) {
    return;
  }

  const contents = read(relativePath);
  for (const token of tokens) {
    if (!contents.includes(token)) {
      fail(`${relativePath}: missing ${label}: ${token}`);
    }
  }
}

const requiredFiles = [
  "docs/HEU_KHOA_GIANG_VIEN_GAP_PACK_20260703.md",
  "docs/HEU_KHOA_GIANG_VIEN_UAT_RESULT_LEDGER_TEMPLATE_20260703.md",
  "components/khoa/khoa-giang-vien-gap-pack.tsx",
  "app/khoa/page.tsx",
  "components/layout/app-shell.tsx",
  "docs/HEU_CURRENT_STATE_INVENTORY.md",
  "docs/HEU_SYSTEM_BUILD_BACKLOG.md",
  "docs/HEU_MODULE_READINESS_GAP_MATRIX_20260628_V01_DRAFT.md",
  "docs/HEU_IMPLEMENTATION_LOG.md",
  "package.json",
];

for (const file of requiredFiles) {
  requireFile(file);
}

const packageJson = exists("package.json") ? JSON.parse(read("package.json")) : {};

if (
  packageJson.scripts?.["check:heu-khoa-giang-vien-foundation"] !==
  "node scripts/check-heu-khoa-giang-vien-foundation.mjs"
) {
  fail("package.json: missing check:heu-khoa-giang-vien-foundation script");
}

requireText(
  "docs/HEU_KHOA_GIANG_VIEN_GAP_PACK_20260703.md",
  [
    "Status: DRAFT_CONTROL",
    "Production status: NO-GO",
    "KHOA_GV_READY / NO_GO / BLOCKED",
    "KHOA_REVIEW_READY / NO_GO / BLOCKED",
    "KHOA_OWNER_READY / NO_GO / BLOCKED",
    "KHOA_UAT_RESULT_READY / NO_GO / BLOCKED",
    "KHOA-GV-01",
    "KHOA-GV-08",
    "KHOA-REV-01",
    "KHOA-REV-06",
    "KHOA-SIGN-01",
    "KHOA-SIGN-06",
    "KHOA-UAT-LEDGER-01",
    "KHOA-UAT-LEDGER-08",
    "RV_KHOA_GIANG_VIEN_DELIVERY",
    "does not execute UAT",
    "approve teaching payment",
    "approve payroll",
    "owner GO/NO-GO",
    "production GO",
    "raw teacher personal data",
  ],
  "Khoa/Giang vien gap-pack boundary",
);

requireText(
  "docs/HEU_KHOA_GIANG_VIEN_UAT_RESULT_LEDGER_TEMPLATE_20260703.md",
  [
    "Status: DRAFT_CONTROL",
    "Production status: NO-GO",
    "KHOA_UAT_RESULT_READY / NO_GO / BLOCKED",
    "KHOA-UAT-LEDGER-01",
    "KHOA-UAT-LEDGER-08",
    "KHOA-REV-01",
    "KHOA-SIGN-06",
    "does not prove that any UAT case has been executed or accepted",
    "teacher personal data",
    "payroll files",
    "outside Git/Codex/chat",
  ],
  "Khoa/Giang vien UAT ledger template",
);

requireText(
  "components/khoa/khoa-giang-vien-gap-pack.tsx",
  [
    'data-heu-khoa-giang-vien-gap-pack="P10-01"',
    "Khoa/Giang vien Gap Pack: PASS_LOCAL only",
    "KHOA_GV_READY / NO_GO / BLOCKED",
    'data-heu-khoa-quick-access="P10-01_KHOA_QUICK_ACCESS"',
    'data-heu-khoa-quick-open="P10-01_KHOA_QUICK_OPEN_TOP3"',
    'data-heu-khoa-quick-access-overflow-guard="P10-01_KHOA_QUICK_ACCESS_NO_OVERFLOW"',
    "READ_ONLY_NAVIGATION / NO_GO / BLOCKED",
    "KHOA-GV-01",
    "KHOA-GV-08",
    "KHOA-REV-01",
    "KHOA-REV-06",
    'data-heu-khoa-owner-signoff="P10-01_OWNER_SIGNOFF_MANIFEST"',
    "KHOA_OWNER_READY / NO_GO / BLOCKED",
    "PENDING_OWNER",
    'data-heu-khoa-uat-result-ledger="P10-01_UAT_RESULT_LEDGER"',
    "KHOA_UAT_RESULT_READY / NO_GO / BLOCKED",
    "HEU_KHOA_GIANG_VIEN_UAT_RESULT_LEDGER_TEMPLATE_20260703.md",
    "PASS_LOCAL does not approve class delivery reliance",
    "owner GO/NO-GO or",
    "production GO",
    "min-w-0",
    "overflow-hidden",
    "truncate",
    "break-words",
    "aria-label",
    "title",
  ],
  "visible Khoa/Giang vien read-only panel",
);

requireText(
  "app/khoa/page.tsx",
  [
    "KhoaGiangVienGapPack",
    '<KhoaGiangVienGapPack />',
    'active="khoa"',
    'href="/khoa"',
    'href="/search?q=KHOA-GV"',
  ],
  "Khoa route",
);

requireText(
  "components/layout/app-shell.tsx",
  [
    'label: "Khoa/GV"',
    'href: "/khoa"',
    'key: "khoa"',
  ],
  "Khoa navigation",
);

requireText(
  "docs/HEU_CURRENT_STATE_INVENTORY.md",
  [
    "M08 Khoa/Giang vien",
    "Khoa/Giang vien gap pack",
    "HEU_KHOA_GIANG_VIEN_GAP_PACK_20260703.md",
    "KHOA-GV-01 through KHOA-GV-08",
    "KHOA-UAT-LEDGER-01 through KHOA-UAT-LEDGER-08",
    "PASS_LOCAL; no class delivery reliance, teacher profile reliance, teaching completion, attendance lock, teaching payment, payroll, evidence acceptance, UAT acceptance, owner GO/NO-GO or production GO approved",
  ],
  "current-state M08 propagation",
);

requireText(
  "docs/HEU_SYSTEM_BUILD_BACKLOG.md",
  [
    "## P10 - Khoa / Giang Vien Module",
    "P10-01",
    "Khoa/Giang vien gap pack",
    "HEU_KHOA_GIANG_VIEN_GAP_PACK_20260703.md",
    "HEU_KHOA_GIANG_VIEN_UAT_RESULT_LEDGER_TEMPLATE_20260703.md",
    "check:heu-khoa-giang-vien-foundation",
    "does not approve class delivery reliance, teacher profile reliance, teaching completion, attendance lock, teaching payment, payroll, evidence acceptance, UAT acceptance, owner GO/NO-GO or production GO",
  ],
  "backlog P10 propagation",
);

requireText(
  "docs/HEU_MODULE_READINESS_GAP_MATRIX_20260628_V01_DRAFT.md",
  [
    "Khoa / Giang vien",
    "HEU_KHOA_GIANG_VIEN_GAP_PACK_20260703.md",
    "HEU_KHOA_GIANG_VIEN_UAT_RESULT_LEDGER_TEMPLATE_20260703.md",
    "KHOA-GV-01 through KHOA-GV-08",
    "KHOA-UAT-LEDGER-01 through KHOA-UAT-LEDGER-08",
    "check:heu-khoa-giang-vien-foundation",
    "Signed Khoa/Giang vien UAT",
  ],
  "gap matrix M08 routing",
);

requireText(
  "docs/HEU_IMPLEMENTATION_LOG.md",
  [
    "## 2026-07-03 - P10-01 Khoa Giang Vien Gap Pack",
    "HEU_KHOA_GIANG_VIEN_GAP_PACK_20260703.md",
    "components/khoa/khoa-giang-vien-gap-pack.tsx",
    "app/khoa/page.tsx",
    "KHOA_GV_READY / NO_GO / BLOCKED",
    "KHOA_UAT_RESULT_READY / NO_GO / BLOCKED",
    "check:heu-khoa-giang-vien-foundation",
    "does not approve class delivery reliance",
    "teacher profile reliance",
    "teaching payment",
    "payroll",
    "owner GO/NO-GO",
    "production GO",
  ],
  "implementation log P10 entry",
);

if (failures.length > 0) {
  console.error("HEU Khoa/Giang vien foundation check failed.");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(
  "HEU Khoa/Giang vien foundation check passed. P10-01 remains PASS_LOCAL and production M08 stays NO-GO.",
);
