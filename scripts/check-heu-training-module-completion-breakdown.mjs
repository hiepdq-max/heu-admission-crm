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

function requireIncludes(contents, token, label, file) {
  if (!contents.includes(token)) {
    failures.push(`${file}: missing ${label}: ${token}`);
  }
}

function requireAll(contents, tokens, label, file) {
  for (const token of tokens) {
    requireIncludes(contents, token, label, file);
  }
}

const breakdownPath = "docs/HEU_TRAINING_MODULE_COMPLETION_BREAKDOWN_20260703.md";
const gapPackPath =
  "docs/HEU_SHORT_COURSE_ATTENDANCE_PAYMENT_GAP_PACK_20260628_V01_DRAFT.md";
const attendanceLockPath =
  "docs/HEU_SHORT_COURSE_ATTENDANCE_LOCK_EVIDENCE_CHECKLIST_20260703.md";
const bhxhPolicyPath =
  "docs/HEU_SHORT_COURSE_BHXH_POLICY_DECISION_CHECKLIST_20260703.md";
const mealAllowancePath =
  "docs/HEU_SHORT_COURSE_MEAL_ALLOWANCE_PAYMENT_BOUNDARY_CHECKLIST_20260703.md";
const invoicePaymentPath =
  "docs/HEU_SHORT_COURSE_INVOICE_PAYMENT_VERIFICATION_CHECKLIST_20260703.md";
const reportViewReconciliationPath =
  "docs/HEU_SHORT_COURSE_REPORT_VIEW_SOURCE_RECONCILIATION_CHECKLIST_20260703.md";
const roleNegativeAccessPath =
  "docs/HEU_SHORT_COURSE_ROLE_NEGATIVE_ACCESS_CHECKLIST_20260703.md";
const externalOwnerActionPath =
  "docs/HEU_SHORT_COURSE_EXTERNAL_OWNER_ACTION_QUEUE_20260703.md";
const signedUatEvidencePath =
  "docs/HEU_SHORT_COURSE_SIGNED_UAT_EVIDENCE_INTAKE_20260704.md";
const ownerManifestPath =
  "docs/HEU_SHORT_COURSE_OWNER_SIGNOFF_MANIFEST_20260702.md";
const uatLedgerPath = "docs/HEU_SHORT_COURSE_UAT_RESULT_LEDGER_TEMPLATE_20260703.md";
const reportViewSourceMapPath = "docs/HEU_REPORT_VIEW_SOURCE_MAP_20260628_V01_DRAFT.md";
const packagePath = "package.json";
const backlogPath = "docs/HEU_SYSTEM_BUILD_BACKLOG.md";
const inventoryPath = "docs/HEU_CURRENT_STATE_INVENTORY.md";
const matrixPath = "docs/HEU_MODULE_READINESS_GAP_MATRIX_20260628_V01_DRAFT.md";
const frameworkPath = "docs/HEU_SYSTEM_FRAMEWORK_REVIEW_20260702.md";
const checklistPath = "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md";
const implementationLogPath = "docs/HEU_IMPLEMENTATION_LOG.md";

for (const file of [
  breakdownPath,
  gapPackPath,
  attendanceLockPath,
  bhxhPolicyPath,
  mealAllowancePath,
  invoicePaymentPath,
  reportViewReconciliationPath,
  roleNegativeAccessPath,
  externalOwnerActionPath,
  signedUatEvidencePath,
  ownerManifestPath,
  uatLedgerPath,
  reportViewSourceMapPath,
  packagePath,
  backlogPath,
  inventoryPath,
  matrixPath,
  frameworkPath,
  checklistPath,
  implementationLogPath,
  "scripts/check-heu-short-course-scope-readiness.mjs",
  "scripts/audit-heu-short-course-attendance-payment-gap-pack.mjs",
]) {
  requireFile(file);
}

const breakdown = read(breakdownPath);
const gapPack = read(gapPackPath);
const attendanceLock = read(attendanceLockPath);
const bhxhPolicy = read(bhxhPolicyPath);
const mealAllowance = read(mealAllowancePath);
const invoicePayment = read(invoicePaymentPath);
const reportViewReconciliation = read(reportViewReconciliationPath);
const roleNegativeAccess = read(roleNegativeAccessPath);
const externalOwnerAction = read(externalOwnerActionPath);
const signedUatEvidence = read(signedUatEvidencePath);
const ownerManifest = read(ownerManifestPath);
const uatLedger = read(uatLedgerPath);
const reportViewSourceMap = read(reportViewSourceMapPath);
const packageJson = JSON.parse(read(packagePath));
const backlog = read(backlogPath);
const inventory = read(inventoryPath);
const matrix = read(matrixPath);
const framework = read(frameworkPath);
const checklist = read(checklistPath);
const implementationLog = read(implementationLogPath);

requireAll(
  breakdown,
  [
    "Status: PASS_LOCAL_BREAKDOWN",
    "Production/UAT status: NO-GO",
    "TRAINING_MODULE_READY / NO_GO / BLOCKED",
    "M07 Dao Tao",
    "P9-01 Short Course / Day Nghe",
    "TRN-00",
    "TRN-01",
    "TRN-02",
    "TRN-03",
    "TRN-04",
    "TRN-05",
    "TRN-06",
    "TRN-07",
    "TRN-08",
    "TRN-09",
    "TRN-10",
    "PASS_LOCAL_TEMPLATE",
    "HEU_SHORT_COURSE_ATTENDANCE_LOCK_EVIDENCE_CHECKLIST_20260703.md",
    "HEU_SHORT_COURSE_BHXH_POLICY_DECISION_CHECKLIST_20260703.md",
    "HEU_SHORT_COURSE_MEAL_ALLOWANCE_PAYMENT_BOUNDARY_CHECKLIST_20260703.md",
    "HEU_SHORT_COURSE_INVOICE_PAYMENT_VERIFICATION_CHECKLIST_20260703.md",
    "HEU_SHORT_COURSE_REPORT_VIEW_SOURCE_RECONCILIATION_CHECKLIST_20260703.md",
    "HEU_SHORT_COURSE_ROLE_NEGATIVE_ACCESS_CHECKLIST_20260703.md",
    "HEU_SHORT_COURSE_EXTERNAL_OWNER_ACTION_QUEUE_20260703.md",
    "HEU_SHORT_COURSE_SIGNED_UAT_EVIDENCE_INTAKE_20260704.md",
    "SC_ATTENDANCE_LOCK_EVIDENCE_READY / NO_GO / BLOCKED",
    "SC_BHXH_POLICY_DECISION_READY / NO_GO / BLOCKED",
    "SC_MEAL_ALLOWANCE_BOUNDARY_READY / NO_GO / BLOCKED",
    "SC_INVOICE_PAYMENT_VERIFICATION_READY / NO_GO / BLOCKED",
    "SC_REPORT_VIEW_SOURCE_RECONCILIATION_READY / NO_GO / BLOCKED",
    "SC_ROLE_NEGATIVE_ACCESS_READY / NO_GO / BLOCKED",
    "SC_EXTERNAL_OWNER_ACTION_READY / NO_GO / BLOCKED",
    "SC_SIGNED_UAT_EVIDENCE_READY / NO_GO / BLOCKED",
    "SC-LOCK-EVID-01",
    "SC-LOCK-EVID-06",
    "SC-BHXH-EVID-01",
    "SC-BHXH-EVID-06",
    "SC-MEAL-EVID-01",
    "SC-MEAL-EVID-06",
    "SC-PAY-EVID-01",
    "SC-PAY-EVID-06",
    "SC-RV-EVID-01",
    "SC-RV-EVID-06",
    "SC-ROLE-EVID-01",
    "SC-ROLE-EVID-06",
    "SC-OWNER-ACTION-01",
    "SC-OWNER-ACTION-08",
    "SC-UAT-EVID-01",
    "SC-UAT-EVID-08",
    "SHORT-SCOPE-STUDENTS",
    "SHORT-SCOPE-CLASSES",
    "SHORT-SCOPE-ENROLLMENTS",
    "SHORT-SCOPE-BHXH-FINANCE",
    "SHORT-SCOPE-WORKFLOWS",
    "SHORT-SCOPE-ACTOR-LINK",
    "SC-AP-01",
    "SC-AP-08",
    "SC-REV-01",
    "SC-REV-06",
    "SC-SIGN-01",
    "SC-SIGN-06",
    "SC-UAT-LEDGER-01",
    "SC-UAT-LEDGER-08",
    "SC_UAT_RESULT_READY / NO_GO / BLOCKED",
    "SHORT_COURSE_OWNER_READY / NO_GO / BLOCKED",
    "RV_SHORT_COURSE_ATTENDANCE_PAYMENT",
    "npm.cmd run check:heu-training-module-completion-breakdown",
    "npm.cmd run check:heu-short-course-external-owner-action-queue",
    "npm.cmd run check:heu-short-course-signed-uat-evidence-intake",
    "npm.cmd run check:heu-short-course-scope-readiness",
    "npm.cmd run audit:heu-short-course-attendance-payment-gap-pack",
    "npm.cmd run audit:heu-role-scope-uat-pack",
    "does not approve class operation",
    "owner GO/NO-GO",
    "production GO",
  ],
  "training module completion breakdown coverage",
  breakdownPath,
);

requireAll(
  gapPack,
  [
    "Status: DRAFT_CONTROL",
    "Production status: NO-GO",
    "SC_ATTENDANCE_PAYMENT_READY / NO_GO / BLOCKED",
    "SC-AP-01",
    "SC-AP-08",
    "SC-REV-01",
    "SC-REV-06",
    "RV_SHORT_COURSE_ATTENDANCE_PAYMENT",
    "does not approve attendance lock",
  ],
  "Short Course gap-pack boundary",
  gapPackPath,
);

requireAll(
  attendanceLock,
  [
    "Status: DRAFT_CONTROL",
    "Production status: NO-GO",
    "SC_ATTENDANCE_LOCK_EVIDENCE_READY / NO_GO / BLOCKED",
    "SC-LOCK-EVID-01",
    "SC-LOCK-EVID-06",
    "SC-AP-02",
    "SC-AP-03",
    "SC-REV-01",
    "SC-UAT-01",
    "SC-UAT-02",
    "SC-SIGN-01",
    "does not lock attendance",
    "approve owner GO/NO-GO",
    "mark production GO",
  ],
  "Short Course attendance lock evidence checklist boundary",
  attendanceLockPath,
);

requireAll(
  bhxhPolicy,
  [
    "Status: DRAFT_CONTROL",
    "Production status: NO-GO",
    "SC_BHXH_POLICY_DECISION_READY / NO_GO / BLOCKED",
    "SC-BHXH-EVID-01",
    "SC-BHXH-EVID-06",
    "SC-AP-04",
    "SC-REV-02",
    "SC-UAT-03",
    "SC-SIGN-02",
    "does not approve BHXH/chinh sach",
    "decide eligibility",
    "create policy effect",
    "approve owner GO/NO-GO",
    "mark production GO",
  ],
  "Short Course BHXH policy decision checklist boundary",
  bhxhPolicyPath,
);

requireAll(
  mealAllowance,
  [
    "Status: DRAFT_CONTROL",
    "Production status: NO-GO",
    "SC_MEAL_ALLOWANCE_BOUNDARY_READY / NO_GO / BLOCKED",
    "SC-MEAL-EVID-01",
    "SC-MEAL-EVID-06",
    "SC-AP-05",
    "SC-REV-03",
    "SC-UAT-04",
    "SC-SIGN-03",
    "does not calculate allowance",
    "approve meal/allowance",
    "approve HR payment",
    "approve teacher payment",
    "create payroll effect",
    "approve owner GO/NO-GO",
    "mark production GO",
  ],
  "Short Course meal allowance payment boundary checklist",
  mealAllowancePath,
);

requireAll(
  invoicePayment,
  [
    "Status: DRAFT_CONTROL",
    "Production status: NO-GO",
    "SC_INVOICE_PAYMENT_VERIFICATION_READY / NO_GO / BLOCKED",
    "SC-PAY-EVID-01",
    "SC-PAY-EVID-06",
    "SC-AP-06",
    "SC-REV-04",
    "SC-UAT-05",
    "SC-SIGN-04",
    "does not verify invoice/payment",
    "post voucher",
    "approve reversal",
    "close period",
    "create statutory accounting effect",
    "approve owner GO/NO-GO",
    "mark production GO",
  ],
  "Short Course invoice payment verification checklist",
  invoicePaymentPath,
);

requireAll(
  reportViewReconciliation,
  [
    "Status: DRAFT_CONTROL",
    "Production status: NO-GO",
    "SC_REPORT_VIEW_SOURCE_RECONCILIATION_READY / NO_GO / BLOCKED",
    "SC-RV-EVID-01",
    "SC-RV-EVID-06",
    "SC-AP-07",
    "SC-REV-05",
    "SC-UAT-06",
    "SC-SIGN-05",
    "DQ-RV-06",
    "RV-EVID-05",
    "RV_SHORT_COURSE_ATTENDANCE_PAYMENT",
    "does not approve report-view reliance",
    "approve dashboard reliance",
    "accept DQ evidence",
    "accept source reconciliation",
    "approve owner GO/NO-GO",
    "mark production GO",
  ],
  "Short Course report-view source reconciliation checklist",
  reportViewReconciliationPath,
);

requireAll(
  roleNegativeAccess,
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
    "does not create accounts",
    "assign real users",
    "grant access",
    "broaden scope",
    "accept negative-control proof",
    "accept role UAT",
    "approve access closure",
    "mark production GO",
  ],
  "Short Course role negative-access checklist",
  roleNegativeAccessPath,
);

requireAll(
  externalOwnerAction,
  [
    "Status: PASS_LOCAL_OWNER_ACTION_QUEUE",
    "SC_EXTERNAL_OWNER_ACTION_READY / NO_GO / BLOCKED",
    "Production/UAT status: NO-GO",
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
    "does not execute UAT",
    "accept evidence",
    "approve owner GO/NO-GO",
    "mark production GO",
  ],
  "Short Course external owner action queue",
  externalOwnerActionPath,
);

requireAll(
  signedUatEvidence,
  [
    "Status: PASS_LOCAL_EVIDENCE_INTAKE",
    "SC_SIGNED_UAT_EVIDENCE_READY / NO_GO / BLOCKED",
    "SC-UAT-EVID-01",
    "SC-UAT-EVID-08",
    "SC-UAT-LEDGER-01 through SC-UAT-LEDGER-08",
    "RV_SHORT_COURSE_ATTENDANCE_PAYMENT",
    "does not execute UAT",
    "accept evidence",
    "approve access closure",
    "approve owner GO/NO-GO",
    "mark production GO",
  ],
  "Short Course signed UAT evidence intake",
  signedUatEvidencePath,
);

requireAll(
  reportViewSourceMap,
  [
    "RV_SHORT_COURSE_ATTENDANCE_PAYMENT",
    "HEU_SHORT_COURSE_REPORT_VIEW_SOURCE_RECONCILIATION_CHECKLIST_20260703.md",
    "SC-RV-EVID-01 through SC-RV-EVID-06",
    "HEU_SHORT_COURSE_SIGNED_UAT_EVIDENCE_INTAKE_20260704.md",
    "SC-UAT-EVID-01 through SC-UAT-EVID-08",
    "SC_SIGNED_UAT_EVIDENCE_READY / NO_GO / BLOCKED",
    "SC_REPORT_VIEW_SOURCE_RECONCILIATION_READY / NO_GO / BLOCKED",
    "DQ-RV-06",
    "RV-EVID-05",
  ],
  "Short Course report-view source map anchors",
  reportViewSourceMapPath,
);

requireAll(
  ownerManifest,
  [
    "SHORT_COURSE_OWNER_READY / NO_GO / BLOCKED",
    "SC-SIGN-01",
    "SC-SIGN-06",
    "It does not prove that any owner has signed",
  ],
  "Short Course owner manifest boundary",
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
  "Short Course UAT result ledger boundary",
  uatLedgerPath,
);

for (const scriptName of [
  "check:heu-training-module-completion-breakdown",
  "check:heu-short-course-scope-readiness",
  "check:heu-short-course-role-negative-access",
  "check:heu-short-course-external-owner-action-queue",
  "check:heu-short-course-signed-uat-evidence-intake",
  "audit:heu-short-course-attendance-payment-gap-pack",
  "audit:heu-role-scope-uat-pack",
  "audit:heu-current-state-inventory",
  "audit:heu-implementation-log",
  "audit:ttgdtx-release-gates",
]) {
  if (!packageJson.scripts?.[scriptName]) {
    failures.push(`${packagePath}: missing script ${scriptName}`);
  }
}

requireAll(
  backlog,
  [
    "P9 - Short Course / Day Nghe Module",
    "P9-02",
    "Dao Tao training module completion breakdown",
    "P9-03",
    "Attendance lock evidence checklist",
    "P9-04",
    "BHXH/chinh sach decision checklist",
    "P9-05",
    "Meal/allowance HR payment boundary checklist",
    "P9-06",
    "Invoice/payment verification checklist",
    "P9-07",
    "Report-view source reconciliation checklist",
    "P9-08",
    "Role scope and negative-access checklist",
    "HEU_TRAINING_MODULE_COMPLETION_BREAKDOWN_20260703.md",
    "HEU_SHORT_COURSE_ATTENDANCE_LOCK_EVIDENCE_CHECKLIST_20260703.md",
    "HEU_SHORT_COURSE_BHXH_POLICY_DECISION_CHECKLIST_20260703.md",
    "HEU_SHORT_COURSE_MEAL_ALLOWANCE_PAYMENT_BOUNDARY_CHECKLIST_20260703.md",
    "HEU_SHORT_COURSE_INVOICE_PAYMENT_VERIFICATION_CHECKLIST_20260703.md",
    "HEU_SHORT_COURSE_REPORT_VIEW_SOURCE_RECONCILIATION_CHECKLIST_20260703.md",
    "HEU_SHORT_COURSE_ROLE_NEGATIVE_ACCESS_CHECKLIST_20260703.md",
    "HEU_SHORT_COURSE_EXTERNAL_OWNER_ACTION_QUEUE_20260703.md",
    "TRAINING_MODULE_READY / NO_GO / BLOCKED",
    "SC_ATTENDANCE_LOCK_EVIDENCE_READY / NO_GO / BLOCKED",
    "SC_BHXH_POLICY_DECISION_READY / NO_GO / BLOCKED",
    "SC_MEAL_ALLOWANCE_BOUNDARY_READY / NO_GO / BLOCKED",
    "SC_INVOICE_PAYMENT_VERIFICATION_READY / NO_GO / BLOCKED",
    "SC_REPORT_VIEW_SOURCE_RECONCILIATION_READY / NO_GO / BLOCKED",
    "SC_ROLE_NEGATIVE_ACCESS_READY / NO_GO / BLOCKED",
    "SC_EXTERNAL_OWNER_ACTION_READY / NO_GO / BLOCKED",
    "check:heu-training-module-completion-breakdown",
    "does not approve class operation",
  ],
  "backlog P9-02 training completion anchors",
  backlogPath,
);

requireAll(
  inventory,
  [
    "M07 Dao tao",
    "HEU_TRAINING_MODULE_COMPLETION_BREAKDOWN_20260703.md",
    "HEU_SHORT_COURSE_ATTENDANCE_LOCK_EVIDENCE_CHECKLIST_20260703.md",
    "HEU_SHORT_COURSE_BHXH_POLICY_DECISION_CHECKLIST_20260703.md",
    "HEU_SHORT_COURSE_MEAL_ALLOWANCE_PAYMENT_BOUNDARY_CHECKLIST_20260703.md",
    "HEU_SHORT_COURSE_INVOICE_PAYMENT_VERIFICATION_CHECKLIST_20260703.md",
    "HEU_SHORT_COURSE_REPORT_VIEW_SOURCE_RECONCILIATION_CHECKLIST_20260703.md",
    "HEU_SHORT_COURSE_ROLE_NEGATIVE_ACCESS_CHECKLIST_20260703.md",
    "TRAINING_MODULE_READY / NO_GO / BLOCKED",
    "SC_ATTENDANCE_LOCK_EVIDENCE_READY / NO_GO / BLOCKED",
    "SC_BHXH_POLICY_DECISION_READY / NO_GO / BLOCKED",
    "SC_MEAL_ALLOWANCE_BOUNDARY_READY / NO_GO / BLOCKED",
    "SC_INVOICE_PAYMENT_VERIFICATION_READY / NO_GO / BLOCKED",
    "SC_REPORT_VIEW_SOURCE_RECONCILIATION_READY / NO_GO / BLOCKED",
    "SC_ROLE_NEGATIVE_ACCESS_READY / NO_GO / BLOCKED",
    "Short Course attendance/payment gap pack",
    "no attendance lock",
  ],
  "current-state training module anchors",
  inventoryPath,
);

requireAll(
  matrix,
  [
    "Short Course / Day Nghe",
    "HEU_TRAINING_MODULE_COMPLETION_BREAKDOWN_20260703.md",
    "HEU_SHORT_COURSE_ATTENDANCE_LOCK_EVIDENCE_CHECKLIST_20260703.md",
    "HEU_SHORT_COURSE_BHXH_POLICY_DECISION_CHECKLIST_20260703.md",
    "HEU_SHORT_COURSE_MEAL_ALLOWANCE_PAYMENT_BOUNDARY_CHECKLIST_20260703.md",
    "HEU_SHORT_COURSE_INVOICE_PAYMENT_VERIFICATION_CHECKLIST_20260703.md",
    "HEU_SHORT_COURSE_REPORT_VIEW_SOURCE_RECONCILIATION_CHECKLIST_20260703.md",
    "HEU_SHORT_COURSE_ROLE_NEGATIVE_ACCESS_CHECKLIST_20260703.md",
    "TRAINING_MODULE_READY / NO_GO / BLOCKED",
    "SC_ATTENDANCE_LOCK_EVIDENCE_READY / NO_GO / BLOCKED",
    "SC_BHXH_POLICY_DECISION_READY / NO_GO / BLOCKED",
    "SC_MEAL_ALLOWANCE_BOUNDARY_READY / NO_GO / BLOCKED",
    "SC_INVOICE_PAYMENT_VERIFICATION_READY / NO_GO / BLOCKED",
    "SC_REPORT_VIEW_SOURCE_RECONCILIATION_READY / NO_GO / BLOCKED",
    "SC_ROLE_NEGATIVE_ACCESS_READY / NO_GO / BLOCKED",
    "Signed attendance/payment UAT",
    "owner signoff manifest",
  ],
  "module readiness training anchors",
  matrixPath,
);

requireAll(
  framework,
  [
    "M07 Dao tao",
    "training completion breakdown",
    "BHXH/policy decision checklist",
    "meal/allowance boundary checklist",
    "invoice/payment verification checklist",
    "report-view source reconciliation checklist",
    "role/negative-access checklist",
    "UAT result ledger",
    "owner closure template",
    "Production class or training record reliance",
    "F07",
    "Short Course",
  ],
  "framework training anchors",
  frameworkPath,
);

requireAll(
  checklist,
  [
    "Short Course attendance/payment gap pack",
    "HEU_SHORT_COURSE_ATTENDANCE_LOCK_EVIDENCE_CHECKLIST_20260703.md",
    "HEU_SHORT_COURSE_BHXH_POLICY_DECISION_CHECKLIST_20260703.md",
    "HEU_SHORT_COURSE_MEAL_ALLOWANCE_PAYMENT_BOUNDARY_CHECKLIST_20260703.md",
    "HEU_SHORT_COURSE_INVOICE_PAYMENT_VERIFICATION_CHECKLIST_20260703.md",
    "HEU_SHORT_COURSE_REPORT_VIEW_SOURCE_RECONCILIATION_CHECKLIST_20260703.md",
    "HEU_SHORT_COURSE_ROLE_NEGATIVE_ACCESS_CHECKLIST_20260703.md",
    "HEU_TRAINING_MODULE_COMPLETION_BREAKDOWN_20260703.md",
    "TRAINING_MODULE_READY / NO_GO / BLOCKED",
    "SC_ATTENDANCE_LOCK_EVIDENCE_READY / NO_GO / BLOCKED",
    "SC_BHXH_POLICY_DECISION_READY / NO_GO / BLOCKED",
    "SC_MEAL_ALLOWANCE_BOUNDARY_READY / NO_GO / BLOCKED",
    "SC_INVOICE_PAYMENT_VERIFICATION_READY / NO_GO / BLOCKED",
    "SC_REPORT_VIEW_SOURCE_RECONCILIATION_READY / NO_GO / BLOCKED",
    "SC_ROLE_NEGATIVE_ACCESS_READY / NO_GO / BLOCKED",
    "owner signoff manifest completion",
    "report-view owner signoff still required",
  ],
  "production checklist training anchors",
  checklistPath,
);

requireAll(
  implementationLog,
  [
    "2026-07-03 - P9-02 Dao Tao Training Module Completion Breakdown",
    "2026-07-03 - TRN-03 Short Course Attendance Lock Evidence Checklist",
    "2026-07-03 - TRN-04 Short Course BHXH Policy Decision Checklist",
    "2026-07-03 - TRN-05 Short Course Meal Allowance Payment Boundary Checklist",
    "2026-07-03 - TRN-06 Short Course Invoice Payment Verification Checklist",
    "2026-07-03 - TRN-07 Short Course Report View Source Reconciliation Checklist",
    "2026-07-03 - TRN-08 Short Course Role Negative Access Checklist",
    "2026-07-03 - Short Course External Owner Action Queue",
    "2026-07-03 - TRN-09/TRN-10 Short Course Evidence Trace And Owner Closure Alignment",
    "HEU_TRAINING_MODULE_COMPLETION_BREAKDOWN_20260703.md",
    "HEU_SHORT_COURSE_ATTENDANCE_LOCK_EVIDENCE_CHECKLIST_20260703.md",
    "HEU_SHORT_COURSE_BHXH_POLICY_DECISION_CHECKLIST_20260703.md",
    "HEU_SHORT_COURSE_MEAL_ALLOWANCE_PAYMENT_BOUNDARY_CHECKLIST_20260703.md",
    "HEU_SHORT_COURSE_INVOICE_PAYMENT_VERIFICATION_CHECKLIST_20260703.md",
    "HEU_SHORT_COURSE_REPORT_VIEW_SOURCE_RECONCILIATION_CHECKLIST_20260703.md",
    "HEU_SHORT_COURSE_ROLE_NEGATIVE_ACCESS_CHECKLIST_20260703.md",
    "HEU_SHORT_COURSE_EXTERNAL_OWNER_ACTION_QUEUE_20260703.md",
    "HEU_SHORT_COURSE_UAT_RESULT_LEDGER_TEMPLATE_20260703.md",
    "HEU_SHORT_COURSE_OWNER_SIGNOFF_MANIFEST_20260702.md",
    "check-heu-training-module-completion-breakdown.mjs",
    "check-heu-short-course-external-owner-action-queue.mjs",
    "TRN-00",
    "TRN-10",
    "SC-LOCK-EVID-01",
    "SC-LOCK-EVID-06",
    "SC-BHXH-EVID-01",
    "SC-BHXH-EVID-06",
    "SC-MEAL-EVID-01",
    "SC-MEAL-EVID-06",
    "SC-PAY-EVID-01",
    "SC-PAY-EVID-06",
    "SC-RV-EVID-01",
    "SC-RV-EVID-06",
    "SC-ROLE-EVID-01",
    "SC-ROLE-EVID-06",
    "SC-UAT-LEDGER-01",
    "SC-UAT-LEDGER-08",
    "SC-SIGN-01",
    "SC-SIGN-06",
    "TRAINING_MODULE_READY / NO_GO / BLOCKED",
    "SC_ATTENDANCE_LOCK_EVIDENCE_READY / NO_GO / BLOCKED",
    "SC_BHXH_POLICY_DECISION_READY / NO_GO / BLOCKED",
    "SC_MEAL_ALLOWANCE_BOUNDARY_READY / NO_GO / BLOCKED",
    "SC_INVOICE_PAYMENT_VERIFICATION_READY / NO_GO / BLOCKED",
    "SC_REPORT_VIEW_SOURCE_RECONCILIATION_READY / NO_GO / BLOCKED",
    "SC_ROLE_NEGATIVE_ACCESS_READY / NO_GO / BLOCKED",
    "SC_EXTERNAL_OWNER_ACTION_READY / NO_GO / BLOCKED",
    "SC_UAT_RESULT_READY / NO_GO / BLOCKED",
    "SHORT_COURSE_OWNER_READY / NO_GO / BLOCKED",
    "does not approve class operation",
    "owner GO/NO-GO",
    "production GO",
  ],
  "implementation log P9-02 training completion entry",
  implementationLogPath,
);

if (failures.length > 0) {
  console.error("HEU training module completion breakdown check failed.");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(
  "HEU training module completion breakdown check passed. TRN-00..TRN-10 are defined with local-only completion gates.",
);
