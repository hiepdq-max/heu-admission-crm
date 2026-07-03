import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const failures = [];

function read(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), "utf8");
}

function requireFile(relativePath) {
  if (!existsSync(path.join(repoRoot, relativePath))) {
    failures.push(`Missing required file: ${relativePath}`);
  }
}

function requireAll(contents, tokens, label, file) {
  for (const token of tokens) {
    if (!contents.includes(token)) {
      failures.push(`${file}: missing ${label}: ${token}`);
    }
  }
}

const queuePath =
  "docs/HEU_SHORT_COURSE_EXTERNAL_OWNER_ACTION_QUEUE_20260703.md";
const breakdownPath =
  "docs/HEU_TRAINING_MODULE_COMPLETION_BREAKDOWN_20260703.md";
const gapPackPath =
  "docs/HEU_SHORT_COURSE_ATTENDANCE_PAYMENT_GAP_PACK_20260628_V01_DRAFT.md";
const ownerManifestPath =
  "docs/HEU_SHORT_COURSE_OWNER_SIGNOFF_MANIFEST_20260702.md";
const uatLedgerPath =
  "docs/HEU_SHORT_COURSE_UAT_RESULT_LEDGER_TEMPLATE_20260703.md";
const implementationLogPath = "docs/HEU_IMPLEMENTATION_LOG.md";
const packagePath = "package.json";

for (const file of [
  queuePath,
  breakdownPath,
  gapPackPath,
  ownerManifestPath,
  uatLedgerPath,
  implementationLogPath,
  packagePath,
]) {
  requireFile(file);
}

if (failures.length === 0) {
  const queue = read(queuePath);
  const breakdown = read(breakdownPath);
  const gapPack = read(gapPackPath);
  const ownerManifest = read(ownerManifestPath);
  const uatLedger = read(uatLedgerPath);
  const implementationLog = read(implementationLogPath);
  const packageJson = JSON.parse(read(packagePath));

  requireAll(
    queue,
    [
      "Status: PASS_LOCAL_OWNER_ACTION_QUEUE",
      "SC_EXTERNAL_OWNER_ACTION_READY / NO_GO / BLOCKED",
      "Production/UAT status: NO-GO",
      "Short Course / Day Nghe",
      "TRN-03 through TRN-10",
      "SC-OWNER-ACTION-01",
      "SC-OWNER-ACTION-08",
      "SC_ATTENDANCE_LOCK_EVIDENCE_READY / NO_GO / BLOCKED",
      "SC_BHXH_POLICY_DECISION_READY / NO_GO / BLOCKED",
      "SC_MEAL_ALLOWANCE_BOUNDARY_READY / NO_GO / BLOCKED",
      "SC_INVOICE_PAYMENT_VERIFICATION_READY / NO_GO / BLOCKED",
      "SC_REPORT_VIEW_SOURCE_RECONCILIATION_READY / NO_GO / BLOCKED",
      "SC_ROLE_NEGATIVE_ACCESS_READY / NO_GO / BLOCKED",
      "SC_UAT_RESULT_READY / NO_GO / BLOCKED",
      "SHORT_COURSE_OWNER_READY / NO_GO / BLOCKED",
      "SC-LOCK-EVID-01 through SC-LOCK-EVID-06",
      "SC-BHXH-EVID-01 through SC-BHXH-EVID-06",
      "SC-MEAL-EVID-01 through SC-MEAL-EVID-06",
      "SC-PAY-EVID-01 through SC-PAY-EVID-06",
      "SC-RV-EVID-01 through SC-RV-EVID-06",
      "SC-ROLE-EVID-01 through SC-ROLE-EVID-06",
      "SC-UAT-LEDGER-01 through SC-UAT-LEDGER-08",
      "SC-SIGN-01 through SC-SIGN-06",
      "RV_SHORT_COURSE_ATTENDANCE_PAYMENT",
      "does not execute UAT",
      "accept evidence",
      "approve owner GO/NO-GO",
      "mark production GO",
      "passwords",
      "OTPs",
      "service-role keys",
      "raw Drive URLs",
    ],
    "Short Course external owner action queue",
    queuePath,
  );

  requireAll(
    breakdown,
    [
      "HEU_SHORT_COURSE_EXTERNAL_OWNER_ACTION_QUEUE_20260703.md",
      "SC_EXTERNAL_OWNER_ACTION_READY / NO_GO / BLOCKED",
      "SC-OWNER-ACTION-01 through SC-OWNER-ACTION-08",
      "npm.cmd run check:heu-short-course-external-owner-action-queue",
    ],
    "training breakdown owner-action queue linkage",
    breakdownPath,
  );

  requireAll(
    gapPack,
    [
      "HEU_SHORT_COURSE_EXTERNAL_OWNER_ACTION_QUEUE_20260703.md",
      "SC_EXTERNAL_OWNER_ACTION_READY / NO_GO / BLOCKED",
      "SC-OWNER-ACTION-01 through SC-OWNER-ACTION-08",
    ],
    "gap pack owner-action queue linkage",
    gapPackPath,
  );

  requireAll(
    ownerManifest,
    [
      "SHORT_COURSE_OWNER_READY / NO_GO / BLOCKED",
      "SC-SIGN-01",
      "SC-SIGN-06",
      "It does not prove that any owner has signed",
    ],
    "owner manifest boundary",
    ownerManifestPath,
  );

  requireAll(
    uatLedger,
    [
      "SC_UAT_RESULT_READY / NO_GO / BLOCKED",
      "SC-UAT-LEDGER-01",
      "SC-UAT-LEDGER-08",
      "does not execute UAT",
      "does not prove that any UAT case has been executed",
    ],
    "UAT ledger boundary",
    uatLedgerPath,
  );

  requireAll(
    implementationLog,
    [
      "2026-07-03 - Short Course External Owner Action Queue",
      "HEU_SHORT_COURSE_EXTERNAL_OWNER_ACTION_QUEUE_20260703.md",
      "SC_EXTERNAL_OWNER_ACTION_READY / NO_GO / BLOCKED",
      "SC-OWNER-ACTION-01 through SC-OWNER-ACTION-08",
      "check-heu-short-course-external-owner-action-queue.mjs",
      "does not execute UAT",
      "approve owner GO/NO-GO",
      "production GO",
    ],
    "implementation log owner-action queue entry",
    implementationLogPath,
  );

  const expected =
    "node scripts/check-heu-short-course-external-owner-action-queue.mjs";
  if (
    packageJson.scripts?.["check:heu-short-course-external-owner-action-queue"] !==
    expected
  ) {
    failures.push(
      `${packagePath}: missing check:heu-short-course-external-owner-action-queue script`,
    );
  }
}

if (failures.length > 0) {
  console.error("HEU Short Course external owner action queue check failed.");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(
  "HEU Short Course external owner action queue check passed. Real operation remains NO-GO until signed owner/UAT evidence exists outside Git/Codex/chat.",
);
