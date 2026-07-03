import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const failures = [];

function exists(relativePath) {
  return existsSync(path.join(repoRoot, relativePath));
}

function read(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), "utf8");
}

function requireFile(relativePath) {
  if (!exists(relativePath)) {
    failures.push(`Missing required file: ${relativePath}`);
  }
}

function requireText(relativePath, tokens, label) {
  if (!exists(relativePath)) {
    return;
  }

  const contents = read(relativePath);
  for (const token of tokens) {
    if (!contents.includes(token)) {
      failures.push(`${relativePath}: missing ${label}: ${token}`);
    }
  }
}

const requiredFiles = [
  "docs/HEU_SHORT_COURSE_ROLE_NEGATIVE_ACCESS_CHECKLIST_20260703.md",
  "docs/HEU_SHORT_COURSE_ATTENDANCE_PAYMENT_GAP_PACK_20260628_V01_DRAFT.md",
  "docs/HEU_TRAINING_MODULE_COMPLETION_BREAKDOWN_20260703.md",
  "components/short-course/short-course-attendance-payment-gap-pack.tsx",
  "scripts/check-heu-short-course-scope-readiness.mjs",
  "scripts/check-heu-training-module-completion-breakdown.mjs",
  "scripts/audit-heu-short-course-attendance-payment-gap-pack.mjs",
  "docs/HEU_SYSTEM_BUILD_BACKLOG.md",
  "docs/HEU_CURRENT_STATE_INVENTORY.md",
  "docs/HEU_MODULE_READINESS_GAP_MATRIX_20260628_V01_DRAFT.md",
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
  "docs/HEU_IMPLEMENTATION_LOG.md",
  "package.json",
];

for (const file of requiredFiles) {
  requireFile(file);
}

const packageJson = exists("package.json") ? JSON.parse(read("package.json")) : {};

if (
  packageJson.scripts?.["check:heu-short-course-role-negative-access"] !==
  "node scripts/check-heu-short-course-role-negative-access.mjs"
) {
  failures.push(
    "package.json: missing check:heu-short-course-role-negative-access script",
  );
}

requireText(
  "docs/HEU_SHORT_COURSE_ROLE_NEGATIVE_ACCESS_CHECKLIST_20260703.md",
  [
    "Status: DRAFT_CONTROL",
    "Production status: NO-GO",
    "SC_ROLE_NEGATIVE_ACCESS_READY / NO_GO / BLOCKED",
    "SC-ROLE-EVID-01",
    "SC-ROLE-EVID-06",
    "SHORT-SCOPE-APP-GUARD",
    "SHORT-SCOPE-WORKFLOWS",
    "SHORT-SCOPE-ACTOR-LINK",
    "NEGATIVE_CONTROL_QUEUE_READY / NO_GO / BLOCKED",
    "P6_04_ACCESS_READY / NO_GO / BLOCKED",
    "SC-UAT-07",
    "SC-REV-06",
    "SC-SIGN-06",
    "P0-17 access closure handoff",
    "Do not store passwords",
    "temporary passwords",
    "OTPs",
    "reset links",
    "invite links",
    "service-role keys",
    "raw student identity data",
    "phone numbers",
    "CCCD",
    "bank",
    "accounts",
    "vouchers",
    "does not create accounts",
    "assign real users",
    "grant access",
    "broaden scope",
    "negative-control proof",
    "accept role UAT",
    "access closure",
    "mark production GO",
  ],
  "role negative-access checklist",
);

requireText(
  "components/short-course/short-course-attendance-payment-gap-pack.tsx",
  [
    'data-heu-short-course-role-negative-access="TRN-08_ROLE_NEGATIVE_ACCESS"',
    'data-heu-short-course-role-negative-access-status="SC_ROLE_NEGATIVE_ACCESS_READY_NO_GO_BLOCKED"',
    "Role scope and negative-access checklist",
    "docs/HEU_SHORT_COURSE_ROLE_NEGATIVE_ACCESS_CHECKLIST_20260703.md",
    "SC_ROLE_NEGATIVE_ACCESS_READY / NO_GO / BLOCKED",
    "SC-ROLE-EVID-01",
    "SC-ROLE-EVID-06",
    "PENDING_EXTERNAL_ROLE_NEGATIVE_ACCESS",
    "PASS_LOCAL does not create",
    "accounts, assign real users, grant access, broaden scope",
    "negative-control proof",
    "accept role UAT",
    "access closure",
    "approve owner GO/NO-GO",
    "mark production GO",
    "overflow-x-auto",
    "table-fixed",
    "break-words",
  ],
  "visible Short Course role negative-access panel",
);

requireText(
  "scripts/check-heu-short-course-scope-readiness.mjs",
  [
    "SHORT-SCOPE-APP-GUARD",
    "SHORT-SCOPE-PRIVACY-DISPLAY",
    "SHORT-SCOPE-WORKFLOWS",
    "SHORT-SCOPE-ACTOR-LINK",
    "Secrets, emails, names, phone numbers, bank accounts, vouchers and raw IDs are never printed by this script",
  ],
  "scope checker dependencies",
);

requireText(
  "scripts/check-heu-training-module-completion-breakdown.mjs",
  [
    "HEU_SHORT_COURSE_ROLE_NEGATIVE_ACCESS_CHECKLIST_20260703.md",
    "SC_ROLE_NEGATIVE_ACCESS_READY / NO_GO / BLOCKED",
    "SC-ROLE-EVID-01",
    "SC-ROLE-EVID-06",
    "check:heu-short-course-role-negative-access",
  ],
  "training completion propagation",
);

requireText(
  "scripts/audit-heu-short-course-attendance-payment-gap-pack.mjs",
  [
    "HEU_SHORT_COURSE_ROLE_NEGATIVE_ACCESS_CHECKLIST_20260703.md",
    "data-heu-short-course-role-negative-access=\"TRN-08_ROLE_NEGATIVE_ACCESS\"",
    "SC_ROLE_NEGATIVE_ACCESS_READY / NO_GO / BLOCKED",
    "P9-08 backlog role negative-access row",
  ],
  "attendance/payment audit propagation",
);

requireText(
  "docs/HEU_SYSTEM_BUILD_BACKLOG.md",
  [
    "P9-08",
    "Role scope and negative-access checklist",
    "HEU_SHORT_COURSE_ROLE_NEGATIVE_ACCESS_CHECKLIST_20260703.md",
    "SC-ROLE-EVID-01 through SC-ROLE-EVID-06",
    "SC_ROLE_NEGATIVE_ACCESS_READY / NO_GO / BLOCKED",
    "check:heu-short-course-role-negative-access",
    "does not create accounts",
    "mark production GO",
  ],
  "backlog P9-08 propagation",
);

requireText(
  "docs/HEU_CURRENT_STATE_INVENTORY.md",
  [
    "role/negative-access checklist",
    "HEU_SHORT_COURSE_ROLE_NEGATIVE_ACCESS_CHECKLIST_20260703.md",
    "SC-ROLE-EVID-01 through SC-ROLE-EVID-06",
    "SC_ROLE_NEGATIVE_ACCESS_READY / NO_GO / BLOCKED",
    "data-heu-short-course-role-negative-access=\"TRN-08_ROLE_NEGATIVE_ACCESS\"",
    "check:heu-short-course-role-negative-access",
    "role UAT, access closure",
  ],
  "current-state role negative-access propagation",
);

requireText(
  "docs/HEU_MODULE_READINESS_GAP_MATRIX_20260628_V01_DRAFT.md",
  [
    "HEU_SHORT_COURSE_ROLE_NEGATIVE_ACCESS_CHECKLIST_20260703.md",
    "SC-ROLE-EVID-01 through SC-ROLE-EVID-06",
    "SC_ROLE_NEGATIVE_ACCESS_READY / NO_GO / BLOCKED",
    "role/negative-access checklist",
    "role/negative-access proof",
  ],
  "readiness matrix role negative-access propagation",
);

requireText(
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
  [
    "HEU_SHORT_COURSE_ROLE_NEGATIVE_ACCESS_CHECKLIST_20260703.md",
    "SC-ROLE-EVID-01 through SC-ROLE-EVID-06",
    "SC_ROLE_NEGATIVE_ACCESS_READY / NO_GO / BLOCKED",
    "role/negative-access UAT",
    "Short Course attendance, BHXH/policy, meal/allowance, HR payment, owner decision, invoice/payment flow, role access or report-view reliance is trusted before signed UAT",
  ],
  "production checklist role negative-access propagation",
);

requireText(
  "docs/HEU_IMPLEMENTATION_LOG.md",
  [
    "TRN-08 Short Course Role Negative Access Checklist",
    "HEU_SHORT_COURSE_ROLE_NEGATIVE_ACCESS_CHECKLIST_20260703.md",
    "SC-ROLE-EVID-01 through SC-ROLE-EVID-06",
    "SC_ROLE_NEGATIVE_ACCESS_READY / NO_GO / BLOCKED",
    "check-heu-short-course-role-negative-access.mjs",
    "does not create accounts",
    "mark production GO",
  ],
  "implementation log TRN-08 checker entry",
);

if (failures.length > 0) {
  console.error("HEU Short Course role negative-access check failed.");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(
  "HEU Short Course role negative-access check passed. TRN-08 remains DRAFT_CONTROL/PASS_LOCAL and Short Course production stays NO-GO.",
);
