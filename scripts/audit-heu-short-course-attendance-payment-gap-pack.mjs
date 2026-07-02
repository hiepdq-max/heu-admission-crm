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
  "docs/HEU_SHORT_COURSE_OWNER_SIGNOFF_MANIFEST_20260702.md",
  "docs/HEU_SHORT_COURSE_UAT_RESULT_LEDGER_TEMPLATE_20260703.md",
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
  "components/short-course/short-course-attendance-payment-gap-pack.tsx",
  /(?=[\s\S]*data-heu-hou-short-course-scope-switch="REAL-OPS-07_QUICK_SCOPE_SWITCH")(?=[\s\S]*data-heu-hou-short-course-quick-link="SHORT_COURSE_TO_HOU")(?=[\s\S]*href="\/hou")(?=[\s\S]*aria-label="Open HOU control surface from Short Course scope switch")(?=[\s\S]*title="Open HOU control surface")(?=[\s\S]*href="\/master-control")(?=[\s\S]*aria-label="Open Master Control from Short Course scope switch")(?=[\s\S]*title="Open Master Control")(?=[\s\S]*Short Course \/ HOU scope switch)(?=[\s\S]*min-w-0)(?=[\s\S]*overflow-hidden)(?=[\s\S]*break-words)(?=[\s\S]*truncate)(?=[\s\S]*shrink-0)(?=[\s\S]*flex-wrap)/i,
  "Short Course quick scope switch and overflow guards",
);

requireText(
  "components/short-course/short-course-attendance-payment-gap-pack.tsx",
  /(?=[\s\S]*data-heu-short-course-review-handoff="P9-01_REVIEW_HANDOFF")(?=[\s\S]*data-heu-short-course-review-handoff="P9-01_REVIEW_HANDOFF"[\s\S]*table-fixed)(?=[\s\S]*data-heu-short-course-review-handoff="P9-01_REVIEW_HANDOFF"[\s\S]*whitespace-normal)(?=[\s\S]*data-heu-short-course-review-handoff="P9-01_REVIEW_HANDOFF"[\s\S]*break-words)(?=[\s\S]*data-heu-short-course-review-decision="SC_REVIEW_READY_NO_GO_BLOCKED")(?=[\s\S]*Short Course review handoff)(?=[\s\S]*SC_REVIEW_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*SC-REV-01)(?=[\s\S]*SC-REV-06)(?=[\s\S]*Attendance lock packet)(?=[\s\S]*Invoice\/payment reconciliation)(?=[\s\S]*RV_SHORT_COURSE_ATTENDANCE_PAYMENT)(?=[\s\S]*signatures and evidence acceptance[\s\S]*outside Codex\/chat)(?=[\s\S]*PASS_LOCAL, Codex or AI output is treated as UAT acceptance or owner GO)/i,
  "Short Course review handoff queue",
);

requireText(
  "components/short-course/short-course-attendance-payment-gap-pack.tsx",
  /(?=[\s\S]*data-heu-short-course-owner-signoff="P9-01_OWNER_SIGNOFF_MANIFEST")(?=[\s\S]*data-heu-short-course-owner-signoff="P9-01_OWNER_SIGNOFF_MANIFEST"[\s\S]*min-w-0)(?=[\s\S]*data-heu-short-course-owner-signoff="P9-01_OWNER_SIGNOFF_MANIFEST"[\s\S]*break-words)(?=[\s\S]*data-heu-short-course-owner-signoff="P9-01_OWNER_SIGNOFF_MANIFEST"[\s\S]*overflow-hidden)(?=[\s\S]*data-heu-short-course-owner-decision="SHORT_COURSE_OWNER_READY_NO_GO_BLOCKED")(?=[\s\S]*Short Course owner signoff manifest)(?=[\s\S]*docs\/HEU_SHORT_COURSE_OWNER_SIGNOFF_MANIFEST_20260702\.md)(?=[\s\S]*SHORT_COURSE_OWNER_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*SC-SIGN-01)(?=[\s\S]*SC-SIGN-06)(?=[\s\S]*PENDING_OWNER)(?=[\s\S]*Missing, unsigned, NO-GO or[\s\S]*BLOCKED owner decisions keep Short Course production locked)/i,
  "Short Course owner signoff manifest panel",
);

requireText(
  "components/short-course/short-course-attendance-payment-gap-pack.tsx",
  /(?=[\s\S]*data-heu-short-course-uat-result-ledger="P9-01_UAT_RESULT_LEDGER")(?=[\s\S]*data-heu-short-course-uat-result-ledger="P9-01_UAT_RESULT_LEDGER"[\s\S]*table-fixed)(?=[\s\S]*data-heu-short-course-uat-result-ledger="P9-01_UAT_RESULT_LEDGER"[\s\S]*whitespace-normal)(?=[\s\S]*data-heu-short-course-uat-result-ledger="P9-01_UAT_RESULT_LEDGER"[\s\S]*break-words)(?=[\s\S]*data-heu-short-course-uat-result-decision="SC_UAT_RESULT_READY_NO_GO_BLOCKED")(?=[\s\S]*Short Course UAT result ledger)(?=[\s\S]*docs\/HEU_SHORT_COURSE_UAT_RESULT_LEDGER_TEMPLATE_20260703\.md)(?=[\s\S]*SC_UAT_RESULT_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*SC-UAT-LEDGER-01)(?=[\s\S]*SC-UAT-LEDGER-08)(?=[\s\S]*controlled evidence ref)(?=[\s\S]*outside Codex\/chat)/i,
  "Short Course UAT result ledger panel",
);

requireText(
  "app/short-course/page.tsx",
  /(?=[\s\S]*ShortCourseAttendancePaymentGapPack)(?=[\s\S]*<ShortCourseAttendancePaymentGapPack \/>)/i,
  "Short Course page mounts gap-pack panel",
);

requireText(
  "docs/HEU_SYSTEM_BUILD_BACKLOG.md",
  /P9-01[\s\S]*Short Course attendance\/payment gap pack[\s\S]*PASS_LOCAL[\s\S]*HEU_SHORT_COURSE_ATTENDANCE_PAYMENT_GAP_PACK_20260628_V01_DRAFT\.md[\s\S]*HEU_SHORT_COURSE_OWNER_SIGNOFF_MANIFEST_20260702\.md[\s\S]*HEU_SHORT_COURSE_UAT_RESULT_LEDGER_TEMPLATE_20260703\.md[\s\S]*short-course-attendance-payment-gap-pack\.tsx[\s\S]*\/short-course[\s\S]*SC-AP-01 through SC-AP-08[\s\S]*SC-SIGN-01 through SC-SIGN-06[\s\S]*SC-UAT-LEDGER-01 through SC-UAT-LEDGER-08[\s\S]*SHORT_COURSE_OWNER_READY \/ NO_GO \/ BLOCKED[\s\S]*SC_UAT_RESULT_READY \/ NO_GO \/ BLOCKED[\s\S]*audit:heu-short-course-attendance-payment-gap-pack[\s\S]*does not approve attendance lock, BHXH decision, meal\/allowance payment, HR payment, invoice\/payment verification, period close, statutory accounting, UAT acceptance, evidence acceptance, owner GO\/NO-GO or production GO/i,
  "P9-01 backlog row",
);

requireText(
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
  /Short Course attendance\/payment gap pack[\s\S]*PASS_LOCAL[\s\S]*HEU_SHORT_COURSE_ATTENDANCE_PAYMENT_GAP_PACK_20260628_V01_DRAFT\.md[\s\S]*HEU_SHORT_COURSE_OWNER_SIGNOFF_MANIFEST_20260702\.md[\s\S]*HEU_SHORT_COURSE_UAT_RESULT_LEDGER_TEMPLATE_20260703\.md[\s\S]*short-course-attendance-payment-gap-pack\.tsx[\s\S]*\/short-course[\s\S]*SC-SIGN-01 through SC-SIGN-06[\s\S]*SC-UAT-LEDGER-01 through SC-UAT-LEDGER-08[\s\S]*SHORT_COURSE_OWNER_READY \/ NO_GO \/ BLOCKED[\s\S]*SC_UAT_RESULT_READY \/ NO_GO \/ BLOCKED[\s\S]*audit:heu-short-course-attendance-payment-gap-pack[\s\S]*signed attendance\/payment UAT, BHXH\/policy signoff, source reconciliation, owner signoff manifest completion, UAT result ledger completion and report-view owner signoff still required/i,
  "production checklist Short Course gap-pack row",
);

requireText(
  "docs/HEU_CURRENT_STATE_INVENTORY.md",
  /npm\.cmd run audit:heu-short-course-attendance-payment-gap-pack[\s\S]*PASS[\s\S]*Short Course attendance\/payment gap pack[\s\S]*\/short-course[\s\S]*HEU_SHORT_COURSE_ATTENDANCE_PAYMENT_GAP_PACK_20260628_V01_DRAFT\.md[\s\S]*HEU_SHORT_COURSE_OWNER_SIGNOFF_MANIFEST_20260702\.md[\s\S]*HEU_SHORT_COURSE_UAT_RESULT_LEDGER_TEMPLATE_20260703\.md[\s\S]*SC-AP-01 through SC-AP-08[\s\S]*SC-SIGN-01 through SC-SIGN-06[\s\S]*SC-UAT-LEDGER-01 through SC-UAT-LEDGER-08[\s\S]*SHORT_COURSE_OWNER_READY \/ NO_GO \/ BLOCKED[\s\S]*SC_UAT_RESULT_READY \/ NO_GO \/ BLOCKED[\s\S]*PASS_LOCAL; no attendance lock, BHXH decision, meal\/allowance payment, HR payment, invoice\/payment verification, period close, statutory accounting, UAT acceptance, evidence acceptance, owner GO\/NO-GO or production GO approved/i,
  "current-state Short Course gap-pack evidence",
);

requireText(
  "docs/HEU_MODULE_READINESS_GAP_MATRIX_20260628_V01_DRAFT.md",
  /Short Course \/ Day Nghe[\s\S]*HEU_SHORT_COURSE_ATTENDANCE_PAYMENT_GAP_PACK_20260628_V01_DRAFT\.md[\s\S]*HEU_SHORT_COURSE_OWNER_SIGNOFF_MANIFEST_20260702\.md[\s\S]*HEU_SHORT_COURSE_UAT_RESULT_LEDGER_TEMPLATE_20260703\.md[\s\S]*SC-AP-01 through SC-AP-08[\s\S]*SC-SIGN-01 through SC-SIGN-06[\s\S]*SC-UAT-LEDGER-01 through SC-UAT-LEDGER-08[\s\S]*CAN_SUA[\s\S]*UAT result ledger[\s\S]*owner signoff manifest[\s\S]*Signed attendance\/payment UAT, BHXH\/policy signoff, source reconciliation, Short Course UAT result ledger, owner signoff manifest and report-view owner signoff[\s\S]*Short Course attendance\/payment gap pack[\s\S]*HEU_SHORT_COURSE_UAT_RESULT_LEDGER_TEMPLATE_20260703\.md[\s\S]*audit:heu-short-course-attendance-payment-gap-pack/i,
  "module readiness Short Course gap-pack routing",
);

requireText(
  "docs/HEU_IMPLEMENTATION_LOG.md",
  /## 2026-06-28 - Short Course Attendance Payment Gap Pack[\s\S]*HEU_SHORT_COURSE_ATTENDANCE_PAYMENT_GAP_PACK_20260628_V01_DRAFT\.md[\s\S]*components\/short-course\/short-course-attendance-payment-gap-pack\.tsx[\s\S]*SC-AP-01 through\s+SC-AP-08[\s\S]*SC_ATTENDANCE_PAYMENT_READY \/ NO_GO \/ BLOCKED[\s\S]*audit:heu-short-course-attendance-payment-gap-pack[\s\S]*This is Short Course control packaging only[\s\S]*does not approve attendance\s+lock[\s\S]*BHXH decision[\s\S]*meal\/allowance payment[\s\S]*HR payment[\s\S]*invoice\/payment\s+verification[\s\S]*period close[\s\S]*statutory accounting[\s\S]*UAT acceptance[\s\S]*evidence\s+acceptance[\s\S]*owner GO[\s\S]*production GO/i,
  "implementation log Short Course gap-pack entry",
);

requireText(
  "docs/HEU_IMPLEMENTATION_LOG.md",
  /## 2026-07-02 - P8\/P9 HOU Short Course Quick Scope Switch[\s\S]*components\/hou\/hou-ledger-handover-gap-pack\.tsx[\s\S]*data-heu-hou-short-course-quick-link="HOU_TO_SHORT_COURSE"[\s\S]*components\/short-course\/short-course-attendance-payment-gap-pack\.tsx[\s\S]*data-heu-hou-short-course-scope-switch="REAL-OPS-07_QUICK_SCOPE_SWITCH"[\s\S]*data-heu-hou-short-course-quick-link="SHORT_COURSE_TO_HOU"[\s\S]*audit:heu-hou-ledger-handover-gap-pack[\s\S]*audit:heu-short-course-attendance-payment-gap-pack[\s\S]*does not approve HOU handover[\s\S]*attendance lock[\s\S]*finance action[\s\S]*UAT acceptance[\s\S]*owner GO[\s\S]*production GO/i,
  "implementation log HOU/Short Course quick scope switch entry",
);

requireText(
  "docs/HEU_SHORT_COURSE_ATTENDANCE_PAYMENT_GAP_PACK_20260628_V01_DRAFT.md",
  /(?=[\s\S]*## 8\. Review Handoff Queue)(?=[\s\S]*SC_REVIEW_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*SC-REV-01)(?=[\s\S]*SC-REV-06)(?=[\s\S]*Attendance lock packet)(?=[\s\S]*Invoice\/payment reconciliation)(?=[\s\S]*RV_SHORT_COURSE_ATTENDANCE_PAYMENT)(?=[\s\S]*PASS_LOCAL, Codex or AI output is treated as UAT acceptance or owner GO)/i,
  "Short Course review handoff document queue",
);

requireText(
  "docs/HEU_SHORT_COURSE_OWNER_SIGNOFF_MANIFEST_20260702.md",
  /(?=[\s\S]*Status:\s*DRAFT_CONTROL)(?=[\s\S]*Production status:\s*NO-GO)(?=[\s\S]*SHORT_COURSE_OWNER_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*SC-SIGN-01)(?=[\s\S]*SC-SIGN-06)(?=[\s\S]*Short Course remains `NO-GO` if any required owner decision is missing, unsigned)(?=[\s\S]*Passing the local audit proves only that the signoff template and boundary are[\s\S]*present)(?=[\s\S]*It does not prove that any owner has signed)/i,
  "Short Course owner signoff manifest document",
);

requireText(
  "docs/HEU_SHORT_COURSE_ATTENDANCE_PAYMENT_GAP_PACK_20260628_V01_DRAFT.md",
  /(?=[\s\S]*HEU_SHORT_COURSE_OWNER_SIGNOFF_MANIFEST_20260702\.md)(?=[\s\S]*SHORT_COURSE_OWNER_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*SC-SIGN-01)(?=[\s\S]*SC-SIGN-06)(?=[\s\S]*does not prove\s+owner approval until signatures and controlled evidence references exist[\s\S]*outside Codex\/chat)/i,
  "Short Course gap pack routes to owner signoff manifest",
);

requireText(
  "docs/HEU_SHORT_COURSE_UAT_RESULT_LEDGER_TEMPLATE_20260703.md",
  /(?=[\s\S]*Status:\s*DRAFT_CONTROL)(?=[\s\S]*Production status:\s*NO-GO)(?=[\s\S]*SC_UAT_RESULT_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*SC-UAT-LEDGER-01)(?=[\s\S]*SC-UAT-LEDGER-08)(?=[\s\S]*SC-REV-01)(?=[\s\S]*SC-SIGN-06)(?=[\s\S]*PASS_LOCAL, Codex or AI output is treated as owner approval)(?=[\s\S]*does not execute UAT,\s+accept evidence, approve attendance lock, approve payment, approve owner\s+GO\/NO-GO or mark production GO)(?=[\s\S]*does not prove that any UAT case has been executed or\s+accepted)/i,
  "Short Course UAT result ledger template",
);

requireText(
  "docs/HEU_SHORT_COURSE_ATTENDANCE_PAYMENT_GAP_PACK_20260628_V01_DRAFT.md",
  /(?=[\s\S]*## 10\. UAT Result Ledger Template)(?=[\s\S]*HEU_SHORT_COURSE_UAT_RESULT_LEDGER_TEMPLATE_20260703\.md)(?=[\s\S]*SC_UAT_RESULT_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*SC-UAT-LEDGER-01)(?=[\s\S]*SC-UAT-LEDGER-08)(?=[\s\S]*review handoff rows)(?=[\s\S]*owner signoff rows)(?=[\s\S]*does not execute UAT, accept evidence or approve owner\s+GO\/NO-GO)/i,
  "Short Course gap pack routes to UAT result ledger",
);

requireText(
  "docs/HEU_IMPLEMENTATION_LOG.md",
  /## 2026-07-02 - P9-01 Short Course Review Handoff[\s\S]*data-heu-short-course-review-handoff="P9-01_REVIEW_HANDOFF"[\s\S]*SC-REV-01[\s\S]*SC-REV-06[\s\S]*SC_REVIEW_READY \/ NO_GO \/ BLOCKED[\s\S]*audit-heu-short-course-attendance-payment-gap-pack[\s\S]*does not\s+approve attendance lock[\s\S]*BHXH decision[\s\S]*meal\/allowance payment[\s\S]*invoice\/payment verification[\s\S]*UAT acceptance[\s\S]*evidence\s+acceptance[\s\S]*owner GO\/NO-GO[\s\S]*production GO/i,
  "implementation log Short Course review handoff entry",
);

requireText(
  "docs/HEU_IMPLEMENTATION_LOG.md",
  /## 2026-07-02 - P9-01 Short Course Owner Signoff Manifest[\s\S]*HEU_SHORT_COURSE_OWNER_SIGNOFF_MANIFEST_20260702\.md[\s\S]*SC-SIGN-01[\s\S]*SC-SIGN-06[\s\S]*SHORT_COURSE_OWNER_READY \/ NO_GO \/ BLOCKED[\s\S]*data-heu-short-course-owner-signoff="P9-01_OWNER_SIGNOFF_MANIFEST"[\s\S]*PENDING_OWNER[\s\S]*does not\s+approve attendance lock[\s\S]*BHXH decision[\s\S]*invoice\/payment verification[\s\S]*UAT acceptance[\s\S]*evidence\s+acceptance[\s\S]*owner GO\/NO-GO[\s\S]*production GO/i,
  "implementation log Short Course owner signoff manifest entry",
);

requireText(
  "docs/HEU_IMPLEMENTATION_LOG.md",
  /## 2026-07-03 - P9-01 Short Course UAT Result Ledger Guard[\s\S]*HEU_SHORT_COURSE_UAT_RESULT_LEDGER_TEMPLATE_20260703\.md[\s\S]*SC-UAT-LEDGER-01[\s\S]*SC-UAT-LEDGER-08[\s\S]*SC_UAT_RESULT_READY \/ NO_GO \/ BLOCKED[\s\S]*data-heu-short-course-uat-result-ledger="P9-01_UAT_RESULT_LEDGER"[\s\S]*table-fixed[\s\S]*break-words[\s\S]*does not\s+execute UAT[\s\S]*accept evidence[\s\S]*approve attendance lock[\s\S]*approve payment[\s\S]*owner GO\/NO-GO[\s\S]*production GO/i,
  "implementation log Short Course UAT result ledger guard entry",
);

requireText(
  "docs/HEU_IMPLEMENTATION_LOG.md",
  /## 2026-07-03 - P9-01 Short Course Control Propagation[\s\S]*HEU_CURRENT_STATE_INVENTORY\.md[\s\S]*HEU_SYSTEM_BUILD_BACKLOG\.md[\s\S]*HEU_MODULE_READINESS_GAP_MATRIX_20260628_V01_DRAFT\.md[\s\S]*TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST\.md[\s\S]*HEU_SHORT_COURSE_OWNER_SIGNOFF_MANIFEST_20260702\.md[\s\S]*HEU_SHORT_COURSE_UAT_RESULT_LEDGER_TEMPLATE_20260703\.md[\s\S]*SC-SIGN-01[\s\S]*SC-SIGN-06[\s\S]*SC-UAT-LEDGER-01[\s\S]*SC-UAT-LEDGER-08[\s\S]*SHORT_COURSE_OWNER_READY \/ NO_GO \/ BLOCKED[\s\S]*SC_UAT_RESULT_READY \/ NO_GO \/ BLOCKED[\s\S]*does\s+not execute UAT[\s\S]*accept evidence[\s\S]*approve attendance lock[\s\S]*approve payment[\s\S]*owner GO\/NO-GO[\s\S]*production GO/i,
  "implementation log Short Course control propagation entry",
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
