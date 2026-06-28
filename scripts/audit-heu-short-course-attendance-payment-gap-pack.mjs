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
  "docs/HEU_SHORT_COURSE_ATTENDANCE_PAYMENT_GAP_PACK_20260628_V01_DRAFT.md",
  "components/short-course/short-course-attendance-payment-gap-pack.tsx",
  "app/short-course/page.tsx",
  "docs/HEU_SYSTEM_BUILD_BACKLOG.md",
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
  "docs/HEU_CURRENT_STATE_INVENTORY.md",
  "docs/HEU_MODULE_READINESS_GAP_MATRIX_20260628_V01_DRAFT.md",
  "docs/HEU_IMPLEMENTATION_LOG.md",
  "AGENTS.md",
  "package.json",
  "scripts/audit-ttgdtx-release-gates.mjs",
];

for (const file of requiredFiles) {
  requireFile(file);
}

const packageJson = exists("package.json") ? JSON.parse(read("package.json")) : {};

if (!packageJson.scripts?.["audit:heu-short-course-attendance-payment-gap-pack"]) {
  fail("package.json: missing audit:heu-short-course-attendance-payment-gap-pack script");
}

requireText(
  "docs/HEU_SHORT_COURSE_ATTENDANCE_PAYMENT_GAP_PACK_20260628_V01_DRAFT.md",
  /(?=[\s\S]*Status:\s*DRAFT_CONTROL)(?=[\s\S]*Production status:\s*NO-GO)(?=[\s\S]*SC-AP-01)(?=[\s\S]*SC-AP-08)(?=[\s\S]*SC_ATTENDANCE_PAYMENT_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*RV_SHORT_COURSE_ATTENDANCE_PAYMENT)(?=[\s\S]*SC-UAT-01)(?=[\s\S]*SC-UAT-08)(?=[\s\S]*must not:[\s\S]*Lock, approve or alter attendance)(?=[\s\S]*pay meal, allowance, teacher, HR or payroll amounts)(?=[\s\S]*Treat `RV_SHORT_COURSE_ATTENDANCE_PAYMENT` as a production dashboard source)(?=[\s\S]*does not approve attendance lock, BHXH decision,\s+meal\/allowance payment, HR payment, invoice\/payment verification, statutory\s+accounting, period close, UAT acceptance, evidence acceptance, owner GO or\s+production GO)/i,
  "Short Course attendance/payment DRAFT_CONTROL boundary",
);

requireText(
  "components/short-course/short-course-attendance-payment-gap-pack.tsx",
  /(?=[\s\S]*data-heu-short-course-attendance-payment-gap-pack="P9-01")(?=[\s\S]*Short Course Attendance\/Payment Gap Pack:\s*PASS_LOCAL only)(?=[\s\S]*SC_ATTENDANCE_PAYMENT_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*SC-AP-01)(?=[\s\S]*SC-AP-08)(?=[\s\S]*RV_SHORT_COURSE_ATTENDANCE_PAYMENT)(?=[\s\S]*PASS_LOCAL does not approve attendance lock, BHXH decision,\s+meal\/allowance payment, HR payment, invoice\/payment verification,\s+period close, statutory accounting, UAT acceptance, evidence\s+acceptance, owner GO or production GO)/i,
  "visible Short Course attendance/payment gap-pack panel",
);

requireText(
  "app/short-course/page.tsx",
  /(?=[\s\S]*ShortCourseAttendancePaymentGapPack)(?=[\s\S]*<ShortCourseAttendancePaymentGapPack \/>)/i,
  "Short Course page mounts gap-pack panel",
);

requireText(
  "docs/HEU_SYSTEM_BUILD_BACKLOG.md",
  /P9-01[\s\S]*Short Course attendance\/payment gap pack[\s\S]*PASS_LOCAL[\s\S]*HEU_SHORT_COURSE_ATTENDANCE_PAYMENT_GAP_PACK_20260628_V01_DRAFT\.md[\s\S]*short-course-attendance-payment-gap-pack\.tsx[\s\S]*\/short-course[\s\S]*SC-AP-01 through SC-AP-08[\s\S]*audit:heu-short-course-attendance-payment-gap-pack[\s\S]*does not approve attendance lock, BHXH decision, meal\/allowance payment, HR payment, invoice\/payment verification, period close, statutory accounting, UAT acceptance, evidence acceptance, owner GO or production GO/i,
  "P9-01 backlog row",
);

requireText(
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
  /Short Course attendance\/payment gap pack[\s\S]*PASS_LOCAL[\s\S]*HEU_SHORT_COURSE_ATTENDANCE_PAYMENT_GAP_PACK_20260628_V01_DRAFT\.md[\s\S]*short-course-attendance-payment-gap-pack\.tsx[\s\S]*\/short-course[\s\S]*audit:heu-short-course-attendance-payment-gap-pack[\s\S]*signed attendance\/payment UAT, BHXH\/policy signoff, source reconciliation and report-view owner signoff still required/i,
  "production checklist Short Course gap-pack row",
);

requireText(
  "docs/HEU_CURRENT_STATE_INVENTORY.md",
  /npm\.cmd run audit:heu-short-course-attendance-payment-gap-pack[\s\S]*PASS[\s\S]*Short Course attendance\/payment gap pack[\s\S]*\/short-course[\s\S]*HEU_SHORT_COURSE_ATTENDANCE_PAYMENT_GAP_PACK_20260628_V01_DRAFT\.md[\s\S]*SC-AP-01 through SC-AP-08[\s\S]*PASS_LOCAL; no attendance lock, BHXH decision, meal\/allowance payment, HR payment, invoice\/payment verification, period close, statutory accounting, UAT acceptance, evidence acceptance or production GO approved/i,
  "current-state Short Course gap-pack evidence",
);

requireText(
  "docs/HEU_MODULE_READINESS_GAP_MATRIX_20260628_V01_DRAFT.md",
  /Short Course \/ Day Nghe[\s\S]*HEU_SHORT_COURSE_ATTENDANCE_PAYMENT_GAP_PACK_20260628_V01_DRAFT\.md[\s\S]*SC-AP-01 through SC-AP-08[\s\S]*CAN_SUA[\s\S]*Signed attendance\/payment UAT and Short Course report view signoff[\s\S]*Short Course attendance\/payment gap pack[\s\S]*short-course-attendance-payment-gap-pack\.tsx[\s\S]*audit:heu-short-course-attendance-payment-gap-pack/i,
  "module readiness Short Course gap-pack routing",
);

requireText(
  "docs/HEU_IMPLEMENTATION_LOG.md",
  /## 2026-06-28 - Short Course Attendance Payment Gap Pack[\s\S]*HEU_SHORT_COURSE_ATTENDANCE_PAYMENT_GAP_PACK_20260628_V01_DRAFT\.md[\s\S]*components\/short-course\/short-course-attendance-payment-gap-pack\.tsx[\s\S]*SC-AP-01 through\s+SC-AP-08[\s\S]*SC_ATTENDANCE_PAYMENT_READY \/ NO_GO \/ BLOCKED[\s\S]*audit:heu-short-course-attendance-payment-gap-pack[\s\S]*This is Short Course control packaging only[\s\S]*does not approve attendance\s+lock[\s\S]*BHXH decision[\s\S]*meal\/allowance payment[\s\S]*HR payment[\s\S]*invoice\/payment\s+verification[\s\S]*period close[\s\S]*statutory accounting[\s\S]*UAT acceptance[\s\S]*evidence\s+acceptance[\s\S]*owner GO[\s\S]*production GO/i,
  "implementation log Short Course gap-pack entry",
);

requireText(
  "AGENTS.md",
  /Required Reading Before Meaningful Changes[\s\S]*docs\/HEU_SHORT_COURSE_ATTENDANCE_PAYMENT_GAP_PACK_20260628_V01_DRAFT\.md[\s\S]*Before any final handoff[\s\S]*npm\.cmd run audit:heu-short-course-attendance-payment-gap-pack/i,
  "AGENTS required reading and final handoff audit",
);

requireText(
  "scripts/audit-ttgdtx-release-gates.mjs",
  /docs\/HEU_SHORT_COURSE_ATTENDANCE_PAYMENT_GAP_PACK_20260628_V01_DRAFT\.md[\s\S]*components\/short-course\/short-course-attendance-payment-gap-pack\.tsx[\s\S]*scripts\/audit-heu-short-course-attendance-payment-gap-pack\.mjs[\s\S]*audit:heu-short-course-attendance-payment-gap-pack/i,
  "release-gate file and script coverage",
);

if (failures.length > 0) {
  console.error("HEU Short Course attendance/payment gap-pack audit failed.");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(
  "HEU Short Course attendance/payment gap-pack audit passed. P9-01 remains PASS_LOCAL and production Short Course stays NO-GO.",
);
