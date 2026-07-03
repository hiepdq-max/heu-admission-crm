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
  "docs/HEU_KHOA_GIANG_VIEN_NEGATIVE_ACCESS_CHECKLIST_20260703.md",
  "docs/HEU_KHOA_GIANG_VIEN_TEACHER_PROFILE_PRIVACY_REGISTER_20260703.md",
  "docs/HEU_KHOA_GIANG_VIEN_GAP_PACK_20260703.md",
  "docs/HEU_KHOA_GIANG_VIEN_OWNER_SIGNOFF_MANIFEST_20260703.md",
  "docs/HEU_KHOA_GIANG_VIEN_UAT_RESULT_LEDGER_TEMPLATE_20260703.md",
  "docs/HEU_KHOA_GIANG_VIEN_DELIVERY_SOURCE_MAP_20260703.md",
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
  packageJson.scripts?.["check:heu-khoa-giang-vien-negative-access"] !==
  "node scripts/check-heu-khoa-giang-vien-negative-access.mjs"
) {
  fail("package.json: missing check:heu-khoa-giang-vien-negative-access script");
}

requireText(
  "docs/HEU_KHOA_GIANG_VIEN_NEGATIVE_ACCESS_CHECKLIST_20260703.md",
  [
    "Status: PASS_LOCAL_NEGATIVE_ACCESS",
    "Production/UAT status: NO-GO",
    "KHOA_NEGATIVE_ACCESS_READY / NO_GO / BLOCKED",
    "KHOA-NEG-01",
    "KHOA-NEG-08",
    "OUT_OF_SCOPE_NEGATIVE_USER",
    "ALLOW_SCOPED, READ_ONLY_REVIEW, DENY or BLOCKED",
    "linked_privacy_case",
    "linked_uat_case",
    "linked_signoff_case",
    "KHOA-PRIV-06",
    "KHOA-UAT-07",
    "KHOA-SIGN-06",
    "outside Git/Codex/chat",
    "raw teacher personal data",
    "does not grant",
    "does not approve teacher profile display",
    "does not approve teaching payment",
    "does not approve payroll",
    "owner GO/NO-GO",
    "production GO",
  ],
  "negative access checklist",
);

requireText(
  "docs/HEU_KHOA_GIANG_VIEN_TEACHER_PROFILE_PRIVACY_REGISTER_20260703.md",
  [
    "HEU_KHOA_GIANG_VIEN_NEGATIVE_ACCESS_CHECKLIST_20260703.md",
    "KHOA-NEG-01 through KHOA-NEG-08",
    "KHOA_NEGATIVE_ACCESS_READY / NO_GO / BLOCKED",
    "linked_negative_access_case",
    "check:heu-khoa-giang-vien-negative-access",
  ],
  "privacy register negative-access propagation",
);

requireText(
  "docs/HEU_KHOA_GIANG_VIEN_GAP_PACK_20260703.md",
  [
    "HEU_KHOA_GIANG_VIEN_NEGATIVE_ACCESS_CHECKLIST_20260703.md",
    "PASS_LOCAL_NEGATIVE_ACCESS",
    "KHOA-NEG-01 through KHOA-NEG-08",
    "KHOA_NEGATIVE_ACCESS_READY / NO_GO / BLOCKED",
  ],
  "gap pack P10-05 propagation",
);

requireText(
  "docs/HEU_KHOA_GIANG_VIEN_OWNER_SIGNOFF_MANIFEST_20260703.md",
  [
    "HEU_KHOA_GIANG_VIEN_NEGATIVE_ACCESS_CHECKLIST_20260703.md",
    "KHOA-NEG-01 through KHOA-NEG-08",
    "KHOA_NEGATIVE_ACCESS_READY / NO_GO / BLOCKED",
    "linked_negative_access_case",
    "check:heu-khoa-giang-vien-negative-access",
  ],
  "owner signoff negative-access propagation",
);

requireText(
  "docs/HEU_KHOA_GIANG_VIEN_UAT_RESULT_LEDGER_TEMPLATE_20260703.md",
  [
    "HEU_KHOA_GIANG_VIEN_NEGATIVE_ACCESS_CHECKLIST_20260703.md",
    "KHOA-NEG-01 through KHOA-NEG-08",
    "KHOA_NEGATIVE_ACCESS_READY / NO_GO / BLOCKED",
    "KHOA-PRIV-06 negative access proof",
  ],
  "UAT ledger negative-access propagation",
);

requireText(
  "docs/HEU_KHOA_GIANG_VIEN_DELIVERY_SOURCE_MAP_20260703.md",
  [
    "HEU_KHOA_GIANG_VIEN_NEGATIVE_ACCESS_CHECKLIST_20260703.md",
    "KHOA-NEG-01 through KHOA-NEG-08",
    "KHOA_NEGATIVE_ACCESS_READY / NO_GO / BLOCKED",
    "KHOA-SRC-08",
    "KHOA-DQ-08",
  ],
  "delivery source map negative-access propagation",
);

requireText(
  "components/khoa/khoa-giang-vien-gap-pack.tsx",
  [
    'data-heu-khoa-negative-access="P10-05_NEGATIVE_ACCESS_CHECKLIST"',
    'data-heu-khoa-negative-access-doc="HEU_KHOA_GIANG_VIEN_NEGATIVE_ACCESS_CHECKLIST_20260703"',
    'data-heu-khoa-negative-access-decision="KHOA_NEGATIVE_ACCESS_READY_NO_GO_BLOCKED"',
    'data-heu-khoa-negative-access-overflow-guard="P10-05_KHOA_NEGATIVE_ACCESS_NO_OVERFLOW"',
    "KHOA_NEGATIVE_ACCESS_READY / NO_GO / BLOCKED",
    "KHOA-NEG-01",
    "KHOA-NEG-08",
    "OUT_OF_SCOPE_NEGATIVE_USER",
    "docs/HEU_KHOA_GIANG_VIEN_NEGATIVE_ACCESS_CHECKLIST_20260703.md",
    "raw teacher personal data",
    "outside Git/Codex/chat",
    "min-w-0",
    "overflow-x-auto",
    "break-words",
  ],
  "visible P10-05 negative-access panel",
);

requireText(
  "docs/HEU_CURRENT_STATE_INVENTORY.md",
  [
    "check:heu-khoa-giang-vien-negative-access",
    "Khoa/Giang vien negative access checklist",
    "HEU_KHOA_GIANG_VIEN_NEGATIVE_ACCESS_CHECKLIST_20260703.md",
    "KHOA-NEG-01 through KHOA-NEG-08",
    "KHOA_NEGATIVE_ACCESS_READY / NO_GO / BLOCKED",
    "PASS_LOCAL_NEGATIVE_ACCESS",
  ],
  "current-state P10-05 propagation",
);

requireText(
  "docs/HEU_SYSTEM_BUILD_BACKLOG.md",
  [
    "P10-05",
    "Khoa/Giang vien negative access checklist",
    "HEU_KHOA_GIANG_VIEN_NEGATIVE_ACCESS_CHECKLIST_20260703.md",
    "KHOA-NEG-01 through KHOA-NEG-08",
    "KHOA_NEGATIVE_ACCESS_READY / NO_GO / BLOCKED",
    "check:heu-khoa-giang-vien-negative-access",
  ],
  "backlog P10-05 propagation",
);

requireText(
  "docs/HEU_MODULE_READINESS_GAP_MATRIX_20260628_V01_DRAFT.md",
  [
    "Khoa/Giang vien negative access checklist",
    "HEU_KHOA_GIANG_VIEN_NEGATIVE_ACCESS_CHECKLIST_20260703.md",
    "KHOA-NEG-01 through KHOA-NEG-08",
    "check:heu-khoa-giang-vien-negative-access",
    "signed negative access proof",
  ],
  "gap matrix P10-05 propagation",
);

requireText(
  "docs/HEU_IMPLEMENTATION_LOG.md",
  [
    "## 2026-07-03 - P10-05 Khoa Giang Vien Negative Access Checklist",
    "HEU_KHOA_GIANG_VIEN_NEGATIVE_ACCESS_CHECKLIST_20260703.md",
    "KHOA-NEG-01 through KHOA-NEG-08",
    "KHOA_NEGATIVE_ACCESS_READY / NO_GO / BLOCKED",
    "check:heu-khoa-giang-vien-negative-access",
    "does not grant access",
  ],
  "implementation log P10-05 entry",
);

requireText(
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
  [
    "Khoa/Giang vien negative access checklist",
    "HEU_KHOA_GIANG_VIEN_NEGATIVE_ACCESS_CHECKLIST_20260703.md",
    "KHOA-NEG-01 through KHOA-NEG-08",
    "KHOA_NEGATIVE_ACCESS_READY / NO_GO / BLOCKED",
    "check:heu-khoa-giang-vien-negative-access",
    "signed negative access proof",
  ],
  "production checklist P10-05 propagation",
);

if (failures.length > 0) {
  console.error("HEU Khoa/Giang vien negative-access check failed.");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(
  "HEU Khoa/Giang vien negative-access check passed. P10-05 remains PASS_LOCAL_NEGATIVE_ACCESS and production M08 stays NO-GO.",
);
