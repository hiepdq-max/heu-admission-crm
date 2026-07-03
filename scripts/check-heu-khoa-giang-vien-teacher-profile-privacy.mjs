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
  packageJson.scripts?.["check:heu-khoa-giang-vien-teacher-profile-privacy"] !==
  "node scripts/check-heu-khoa-giang-vien-teacher-profile-privacy.mjs"
) {
  fail(
    "package.json: missing check:heu-khoa-giang-vien-teacher-profile-privacy script",
  );
}

requireText(
  "docs/HEU_KHOA_GIANG_VIEN_TEACHER_PROFILE_PRIVACY_REGISTER_20260703.md",
  [
    "Status: PASS_LOCAL_PRIVACY_REGISTER",
    "Production status: NO-GO",
    "KHOA_TEACHER_PROFILE_PRIVACY_READY / NO_GO / BLOCKED",
    "KHOA-PRIV-01",
    "KHOA-PRIV-06",
    "PUBLIC_INTERNAL",
    "ROLE_RESTRICTED",
    "CONTROLLED_EVIDENCE",
    "linked_review_case",
    "linked_signoff_case",
    "linked_uat_case",
    "linked_source_case",
    "KHOA-REV-02",
    "KHOA-SIGN-02",
    "KHOA-UAT-02",
    "KHOA-SRC-02 / KHOA-DQ-02",
    "outside Git/Codex/chat",
    "raw teacher personal data",
    "does not import real teacher data",
    "does not approve teacher profile display",
    "does not approve teacher profile reliance",
    "does not approve teaching payment",
    "owner GO/NO-GO",
    "production GO",
  ],
  "teacher profile privacy register",
);

requireText(
  "docs/HEU_KHOA_GIANG_VIEN_GAP_PACK_20260703.md",
  [
    "HEU_KHOA_GIANG_VIEN_TEACHER_PROFILE_PRIVACY_REGISTER_20260703.md",
    "PASS_LOCAL_PRIVACY_REGISTER",
    "KHOA-PRIV-01 through KHOA-PRIV-06",
    "KHOA_TEACHER_PROFILE_PRIVACY_READY / NO_GO / BLOCKED",
  ],
  "gap pack P10-04 privacy propagation",
);

requireText(
  "docs/HEU_KHOA_GIANG_VIEN_OWNER_SIGNOFF_MANIFEST_20260703.md",
  [
    "HEU_KHOA_GIANG_VIEN_TEACHER_PROFILE_PRIVACY_REGISTER_20260703.md",
    "KHOA-PRIV-01 through KHOA-PRIV-06",
    "KHOA_TEACHER_PROFILE_PRIVACY_READY / NO_GO / BLOCKED",
    "linked_privacy_case",
    "check:heu-khoa-giang-vien-teacher-profile-privacy",
  ],
  "owner signoff privacy propagation",
);

requireText(
  "docs/HEU_KHOA_GIANG_VIEN_UAT_RESULT_LEDGER_TEMPLATE_20260703.md",
  [
    "HEU_KHOA_GIANG_VIEN_TEACHER_PROFILE_PRIVACY_REGISTER_20260703.md",
    "KHOA-PRIV-01 through KHOA-PRIV-06",
    "KHOA_TEACHER_PROFILE_PRIVACY_READY / NO_GO / BLOCKED",
    "KHOA-PRIV-06 negative access proof",
  ],
  "UAT ledger privacy propagation",
);

requireText(
  "docs/HEU_KHOA_GIANG_VIEN_DELIVERY_SOURCE_MAP_20260703.md",
  [
    "HEU_KHOA_GIANG_VIEN_TEACHER_PROFILE_PRIVACY_REGISTER_20260703.md",
    "KHOA-PRIV-01 through KHOA-PRIV-06",
    "KHOA_TEACHER_PROFILE_PRIVACY_READY / NO_GO / BLOCKED",
    "KHOA-SRC-02",
    "KHOA-DQ-02",
  ],
  "delivery source map privacy propagation",
);

requireText(
  "components/khoa/khoa-giang-vien-gap-pack.tsx",
  [
    'data-heu-khoa-teacher-profile-privacy="P10-04_TEACHER_PROFILE_PRIVACY_REGISTER"',
    'data-heu-khoa-teacher-profile-privacy-doc="HEU_KHOA_GIANG_VIEN_TEACHER_PROFILE_PRIVACY_REGISTER_20260703"',
    'data-heu-khoa-teacher-profile-privacy-decision="KHOA_TEACHER_PROFILE_PRIVACY_READY_NO_GO_BLOCKED"',
    'data-heu-khoa-teacher-profile-privacy-overflow-guard="P10-04_KHOA_TEACHER_PROFILE_PRIVACY_NO_OVERFLOW"',
    "KHOA_TEACHER_PROFILE_PRIVACY_READY / NO_GO / BLOCKED",
    "KHOA-PRIV-01",
    "KHOA-PRIV-06",
    "docs/HEU_KHOA_GIANG_VIEN_TEACHER_PROFILE_PRIVACY_REGISTER_20260703.md",
    "raw teacher personal data",
    "outside Git/Codex/chat",
    "min-w-0",
    "overflow-x-auto",
    "break-words",
  ],
  "visible P10-04 teacher profile privacy panel",
);

requireText(
  "docs/HEU_CURRENT_STATE_INVENTORY.md",
  [
    "check:heu-khoa-giang-vien-teacher-profile-privacy",
    "Khoa/Giang vien teacher profile privacy register",
    "HEU_KHOA_GIANG_VIEN_TEACHER_PROFILE_PRIVACY_REGISTER_20260703.md",
    "KHOA-PRIV-01 through KHOA-PRIV-06",
    "KHOA_TEACHER_PROFILE_PRIVACY_READY / NO_GO / BLOCKED",
    "PASS_LOCAL_PRIVACY_REGISTER",
  ],
  "current-state P10-04 propagation",
);

requireText(
  "docs/HEU_SYSTEM_BUILD_BACKLOG.md",
  [
    "P10-04",
    "Khoa/Giang vien teacher profile privacy register",
    "HEU_KHOA_GIANG_VIEN_TEACHER_PROFILE_PRIVACY_REGISTER_20260703.md",
    "KHOA-PRIV-01 through KHOA-PRIV-06",
    "KHOA_TEACHER_PROFILE_PRIVACY_READY / NO_GO / BLOCKED",
    "check:heu-khoa-giang-vien-teacher-profile-privacy",
  ],
  "backlog P10-04 propagation",
);

requireText(
  "docs/HEU_MODULE_READINESS_GAP_MATRIX_20260628_V01_DRAFT.md",
  [
    "Khoa/Giang vien teacher profile privacy register",
    "HEU_KHOA_GIANG_VIEN_TEACHER_PROFILE_PRIVACY_REGISTER_20260703.md",
    "KHOA-PRIV-01 through KHOA-PRIV-06",
    "check:heu-khoa-giang-vien-teacher-profile-privacy",
    "signed HR/PHAP_CHE privacy approval",
  ],
  "gap matrix P10-04 propagation",
);

requireText(
  "docs/HEU_IMPLEMENTATION_LOG.md",
  [
    "## 2026-07-03 - P10-04 Khoa Giang Vien Teacher Profile Privacy Register",
    "HEU_KHOA_GIANG_VIEN_TEACHER_PROFILE_PRIVACY_REGISTER_20260703.md",
    "KHOA-PRIV-01 through KHOA-PRIV-06",
    "KHOA_TEACHER_PROFILE_PRIVACY_READY / NO_GO / BLOCKED",
    "check:heu-khoa-giang-vien-teacher-profile-privacy",
    "does not approve teacher profile display",
  ],
  "implementation log P10-04 entry",
);

requireText(
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
  [
    "Khoa/Giang vien teacher profile privacy register",
    "HEU_KHOA_GIANG_VIEN_TEACHER_PROFILE_PRIVACY_REGISTER_20260703.md",
    "KHOA-PRIV-01 through KHOA-PRIV-06",
    "KHOA_TEACHER_PROFILE_PRIVACY_READY / NO_GO / BLOCKED",
    "check:heu-khoa-giang-vien-teacher-profile-privacy",
    "signed HR/PHAP_CHE privacy approval",
  ],
  "production checklist P10-04 propagation",
);

if (failures.length > 0) {
  console.error("HEU Khoa/Giang vien teacher-profile privacy check failed.");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(
  "HEU Khoa/Giang vien teacher-profile privacy check passed. P10-04 remains PASS_LOCAL_PRIVACY_REGISTER and production M08 stays NO-GO.",
);
