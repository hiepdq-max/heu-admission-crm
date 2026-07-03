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
  "docs/HEU_KHOA_GIANG_VIEN_OWNER_SIGNOFF_MANIFEST_20260703.md",
  "docs/HEU_KHOA_GIANG_VIEN_GAP_PACK_20260703.md",
  "docs/HEU_KHOA_GIANG_VIEN_UAT_RESULT_LEDGER_TEMPLATE_20260703.md",
  "components/khoa/khoa-giang-vien-gap-pack.tsx",
  "docs/HEU_CURRENT_STATE_INVENTORY.md",
  "docs/HEU_SYSTEM_BUILD_BACKLOG.md",
  "docs/HEU_MODULE_READINESS_GAP_MATRIX_20260628_V01_DRAFT.md",
  "docs/HEU_IMPLEMENTATION_LOG.md",
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
  "package.json",
];

for (const file of requiredFiles) {
  requireFile(file);
}

const packageJson = exists("package.json") ? JSON.parse(read("package.json")) : {};

if (
  packageJson.scripts?.["check:heu-khoa-giang-vien-owner-signoff"] !==
  "node scripts/check-heu-khoa-giang-vien-owner-signoff.mjs"
) {
  fail("package.json: missing check:heu-khoa-giang-vien-owner-signoff script");
}

requireText(
  "docs/HEU_KHOA_GIANG_VIEN_OWNER_SIGNOFF_MANIFEST_20260703.md",
  [
    "Status: PASS_LOCAL_MANIFEST",
    "Production status: NO-GO",
    "KHOA_OWNER_READY / NO_GO / BLOCKED",
    "KHOA_GV_READY / NO_GO / BLOCKED",
    "KHOA_REVIEW_READY / NO_GO / BLOCKED",
    "KHOA_UAT_RESULT_READY / NO_GO / BLOCKED",
    "KHOA_DELIVERY_SOURCE_READY / NO_GO / BLOCKED",
    "RV_KHOA_GIANG_VIEN_DELIVERY / NO_GO / BLOCKED",
    "KHOA-SIGN-01",
    "KHOA-SIGN-06",
    "KHOA-REV-01 through KHOA-REV-06",
    "KHOA-UAT-01 through KHOA-UAT-08",
    "KHOA-SRC-01 through KHOA-SRC-08",
    "signer_name",
    "signer_lane",
    "decision_value",
    "evidence_ref",
    "linked_review_case",
    "linked_uat_case",
    "linked_source_case",
    "outside Codex/chat",
    "outside Git/Codex/chat",
    "raw teacher personal data",
    "teacher payment files",
    "does not execute UAT, accept evidence, approve class delivery reliance",
    "approve teaching payment",
    "approved owner GO/NO-GO",
    "marked production GO",
  ],
  "Khoa/Giang vien owner signoff manifest",
);

requireText(
  "docs/HEU_KHOA_GIANG_VIEN_GAP_PACK_20260703.md",
  [
    "HEU_KHOA_GIANG_VIEN_OWNER_SIGNOFF_MANIFEST_20260703.md",
    "PASS_LOCAL_MANIFEST",
    "KHOA-SIGN-01",
    "KHOA-SIGN-06",
  ],
  "gap pack owner signoff manifest reference",
);

requireText(
  "docs/HEU_KHOA_GIANG_VIEN_UAT_RESULT_LEDGER_TEMPLATE_20260703.md",
  [
    "HEU_KHOA_GIANG_VIEN_OWNER_SIGNOFF_MANIFEST_20260703.md",
    "missing, unsigned, NO_GO or BLOCKED owner decisions keep M08 locked",
    "KHOA-SIGN-01",
    "KHOA-SIGN-06",
  ],
  "UAT ledger owner signoff manifest reference",
);

requireText(
  "components/khoa/khoa-giang-vien-gap-pack.tsx",
  [
    'data-heu-khoa-owner-signoff="P10-01_OWNER_SIGNOFF_MANIFEST"',
    'data-heu-khoa-owner-signoff-manifest="P10-03_OWNER_SIGNOFF_MANIFEST"',
    'data-heu-khoa-owner-signoff-doc="HEU_KHOA_GIANG_VIEN_OWNER_SIGNOFF_MANIFEST_20260703"',
    'data-heu-khoa-owner-signoff-overflow-guard="P10-03_KHOA_OWNER_SIGNOFF_NO_OVERFLOW"',
    "KHOA_OWNER_READY / NO_GO / BLOCKED",
    "KHOA-SIGN-01",
    "KHOA-SIGN-06",
    "PENDING_OWNER",
    "KHOA-DQ-01 through KHOA-DQ-08",
    "docs/HEU_KHOA_GIANG_VIEN_OWNER_SIGNOFF_MANIFEST_20260703.md",
    "raw teacher personal data",
    "report-view owner signoff",
    "min-w-0",
    "overflow-hidden",
    "break-words",
  ],
  "visible P10-03 Khoa owner signoff panel",
);

requireText(
  "docs/HEU_CURRENT_STATE_INVENTORY.md",
  [
    "check:heu-khoa-giang-vien-owner-signoff",
    "Khoa/Giang vien owner signoff manifest",
    "HEU_KHOA_GIANG_VIEN_OWNER_SIGNOFF_MANIFEST_20260703.md",
    "KHOA-SIGN-01 through KHOA-SIGN-06",
    "KHOA_OWNER_READY / NO_GO / BLOCKED",
    "PASS_LOCAL_MANIFEST",
  ],
  "current-state P10-03 propagation",
);

requireText(
  "docs/HEU_SYSTEM_BUILD_BACKLOG.md",
  [
    "P10-03",
    "Khoa/Giang vien owner signoff manifest",
    "HEU_KHOA_GIANG_VIEN_OWNER_SIGNOFF_MANIFEST_20260703.md",
    "KHOA-SIGN-01 through KHOA-SIGN-06",
    "KHOA_OWNER_READY / NO_GO / BLOCKED",
    "check:heu-khoa-giang-vien-owner-signoff",
  ],
  "backlog P10-03 propagation",
);

requireText(
  "docs/HEU_MODULE_READINESS_GAP_MATRIX_20260628_V01_DRAFT.md",
  [
    "Khoa/Giang vien owner signoff manifest",
    "HEU_KHOA_GIANG_VIEN_OWNER_SIGNOFF_MANIFEST_20260703.md",
    "KHOA-SIGN-01 through KHOA-SIGN-06",
    "check:heu-khoa-giang-vien-owner-signoff",
    "signed owner signoff manifest",
  ],
  "gap matrix P10-03 propagation",
);

requireText(
  "docs/HEU_IMPLEMENTATION_LOG.md",
  [
    "## 2026-07-03 - P10-03 Khoa Giang Vien Owner Signoff Manifest",
    "HEU_KHOA_GIANG_VIEN_OWNER_SIGNOFF_MANIFEST_20260703.md",
    "KHOA-SIGN-01 through KHOA-SIGN-06",
    "KHOA_OWNER_READY / NO_GO / BLOCKED",
    "check:heu-khoa-giang-vien-owner-signoff",
    "does not approve teaching payment",
  ],
  "implementation log P10-03 entry",
);

requireText(
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
  [
    "Khoa/Giang vien owner signoff manifest",
    "HEU_KHOA_GIANG_VIEN_OWNER_SIGNOFF_MANIFEST_20260703.md",
    "KHOA-SIGN-01 through KHOA-SIGN-06",
    "KHOA_OWNER_READY / NO_GO / BLOCKED",
    "check:heu-khoa-giang-vien-owner-signoff",
    "signed Khoa/Giang vien owner signoff manifest",
  ],
  "production checklist P10-03 propagation",
);

if (failures.length > 0) {
  console.error("HEU Khoa/Giang vien owner-signoff check failed.");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(
  "HEU Khoa/Giang vien owner-signoff check passed. P10-03 remains PASS_LOCAL_MANIFEST and production M08 stays NO-GO.",
);
