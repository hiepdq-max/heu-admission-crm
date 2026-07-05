import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const failures = [];

const selfPath =
  "scripts/check-heu-core-department-data-confirmation-task-register.mjs";
const docPath =
  "docs/HEU_CORE_DEPARTMENT_DATA_CONFIRMATION_TASK_REGISTER_20260705.md";
const executiveRegisterPath =
  "docs/HEU_EXECUTIVE_OPERATING_DECISION_DATA_REPORTING_PHASE_REGISTER_20260705.md";
const departmentTaskRegisterPath =
  "docs/HEU_DEPARTMENT_TASK_HANDOFF_REGISTER_20260702.md";
const rootDriveConfirmationPath =
  "docs/HEU_ROOT_DRIVE_DEPARTMENT_CONFIRMATION_INTAKE_20260703.md";
const breakdownPath =
  "docs/HEU_PERMISSION_SCOPE_OPERATION_BREAKDOWN_20260703.md";
const logPath = "docs/HEU_IMPLEMENTATION_LOG.md";
const packagePath = "package.json";

const moduleQueuePaths = [
  "docs/HEU_ACCOUNTING_OPEN_BLOCKER_ACTION_QUEUE_20260703.md",
  "docs/HEU_ACCOUNTING_NEGATIVE_CONTROL_OWNER_ACTION_QUEUE_20260703.md",
  "docs/HEU_ACCOUNTING_UAT_OWNER_CLOSURE_LEDGER_20260703.md",
  "docs/HEU_ADMISSIONS_DOCUMENT_REVIEW_REPORTING_QUEUE_20260704.md",
  "docs/HEU_ADMISSIONS_SIGNED_UAT_EVIDENCE_INTAKE_20260704.md",
  "docs/HEU_ADMISSIONS_OWNER_CLOSURE_LEDGER_20260704.md",
  "docs/HEU_CTHSSV_EXTERNAL_OWNER_ACTION_QUEUE_20260703.md",
  "docs/HEU_CTHSSV_SIGNED_UAT_EVIDENCE_INTAKE_20260703.md",
  "docs/HEU_CTHSSV_OWNER_CLOSURE_LEDGER_20260704.md",
  "docs/HEU_DAO_TAO_LOCAL_READINESS_AGGREGATOR_20260704.md",
  "docs/HEU_DAO_TAO_FINAL_LOCAL_REVIEW_DOSSIER_20260705.md",
  "docs/HEU_TRAINING_MODULE_COMPLETION_BREAKDOWN_20260703.md",
  "docs/HEU_KHOA_GIANG_VIEN_EVIDENCE_TRACE_SOURCE_RECONCILIATION_CHECKLIST_20260703.md",
  "docs/HEU_KHOA_GIANG_VIEN_SIGNED_UAT_EVIDENCE_INTAKE_20260704.md",
  "docs/HEU_KHOA_GIANG_VIEN_OWNER_CLOSURE_LEDGER_20260704.md",
  "docs/HEU_SHORT_COURSE_SIGNED_UAT_EVIDENCE_INTAKE_20260704.md",
  "docs/HEU_SHORT_COURSE_OWNER_CLOSURE_LEDGER_20260704.md",
  "docs/HEU_SHORT_COURSE_LOCAL_COMPLETION_GATE_20260704.md",
];

function read(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), "utf8");
}

function requireFile(relativePath) {
  if (!existsSync(path.join(repoRoot, relativePath))) {
    failures.push(`Missing required file: ${relativePath}`);
  }
}

function requireTokens(contents, tokens, label, file) {
  for (const token of tokens) {
    if (!contents.includes(token)) {
      failures.push(`${file}: missing ${label}: ${token}`);
    }
  }
}

function requireNoTokens(contents, tokens, label, file) {
  for (const token of tokens) {
    if (contents.includes(token)) {
      failures.push(`${file}: forbidden ${label}: ${token}`);
    }
  }
}

for (const file of [
  selfPath,
  docPath,
  executiveRegisterPath,
  departmentTaskRegisterPath,
  rootDriveConfirmationPath,
  breakdownPath,
  logPath,
  packagePath,
]) {
  requireFile(file);
}

const self = existsSync(path.join(repoRoot, selfPath)) ? read(selfPath) : "";
const doc = existsSync(path.join(repoRoot, docPath)) ? read(docPath) : "";
const executiveRegister = existsSync(path.join(repoRoot, executiveRegisterPath))
  ? read(executiveRegisterPath)
  : "";
const departmentTaskRegister = existsSync(
  path.join(repoRoot, departmentTaskRegisterPath),
)
  ? read(departmentTaskRegisterPath)
  : "";
const rootDriveConfirmation = existsSync(
  path.join(repoRoot, rootDriveConfirmationPath),
)
  ? read(rootDriveConfirmationPath)
  : "";
const breakdown = existsSync(path.join(repoRoot, breakdownPath))
  ? read(breakdownPath)
  : "";
const log = existsSync(path.join(repoRoot, logPath)) ? read(logPath) : "";
const packageJson = existsSync(path.join(repoRoot, packagePath))
  ? JSON.parse(read(packagePath))
  : { scripts: {} };
const forbiddenMutationTokens = [
  [".", "insert("],
  [".", "update("],
  [".", "upsert("],
  [".", "delete("],
  ["create", "Client("],
  ["auth", ".admin"],
].map((parts) => parts.join(""));

requireTokens(
  doc,
  [
    "Status: PASS_LOCAL_TASK_REGISTER",
    "CORE_DEPARTMENT_DATA_CONFIRMATION_READY / NO_GO / BLOCKED",
    "REAL_DATA_CONFIRMATION_READY: NO_GO",
    "PHASE-01 Core Lock",
    "PHASE-02 Controlled Department Trial",
    "PHASE-03 Real Data Confirmation Tasks",
    "PHASE-04 UAT / Evidence / Production Gate",
    "user_department_permission_scope_task_confirmation",
    "PENDING_DEPARTMENT_CONFIRMATION",
    "CONFIRMED_BY_DEPARTMENT",
    "RETURNED_FOR_REPAIR",
    "BLOCKED_BY_SCOPE",
    "SIGNED_UAT_READY_EXTERNAL",
    "DCTC status bridge",
    "DCTC_STATUS_BRIDGE_READY",
    "CHO_XAC_NHAN",
    "WAITING_OWNER_CONFIRMATION",
    "DUNG",
    "CAN_SUA",
    "KHONG_THUOC_TOI",
    "OUT_OF_SCOPE",
    "DA_KHOA",
    "LOCKED",
    "NO_SIGNED_UAT_ACCEPTANCE_FROM_DA_KHOA",
    "DCTC_SOURCE_PROVENANCE_LOCK_READY",
    "required_task_record=source_record_label,source_route,data_domain,dq_check_ref,department_owner_lane,assigned_user_label,required_route,scope_gate,confirmation_status,controlled_evidence_id,audit_log_ref,audit_trace_ref,due_date_or_batch,owner_decision_ref",
    "SOURCE_METADATA_REQUIRED_BEFORE_CHO_XAC_NHAN",
    "source route, data domain, DQ check ref, controlled evidence ref",
    "copy raw source payloads",
    "DCTC_AUDIT_TRACE_READY",
    "NO_AUDIT_LOG_MUTATION",
    "DCTC-KHTC-001",
    "DCTC-TUYEN-SINH-001",
    "DCTC-CTHSSV-001",
    "DCTC-DAO-TAO-001",
    "DCTC-KHOA-001",
    "DCTC-SHORT-COURSE-001",
    "DCTC-IT-DATA-001",
    "DCTC-AUDIT-001",
    "DCTC-BGH-001",
    "missing_visibility=0",
    "missing_business_scope=0",
    "department_lane_mismatch=0",
    "required_positions=15",
    "unassigned_required_positions=11",
    "ttgdtx_negative_candidates=0",
    "pending_external_evidence_lanes=4",
    "does not create accounts",
    "link Auth",
    "assign real users",
    "assign positions",
    "change lead visibility",
    "add segment/partner scope",
    "mutate database rows",
    "send email",
    "create tickets",
    "accept evidence",
    "approve UAT",
    "approve finance reliance",
    "approve owner GO/NO-GO",
    "write final user guides",
    "mark production GO",
  ],
  "core department data confirmation task register",
  docPath,
);

for (const file of moduleQueuePaths) {
  requireTokens(doc, [file], "module queue reference", docPath);
}

requireTokens(
  executiveRegister,
  [
    "PHASE-03 Real Data Confirmation Tasks",
    "Data Confirmation Task Center Status Taxonomy",
    "task_center_status",
    "CHO_XAC_NHAN",
  ],
  "executive phase data-confirmation anchor",
  executiveRegisterPath,
);

requireTokens(
  departmentTaskRegister,
  [
    "DEPT_TASK_REGISTER_READY / NO_GO / BLOCKED",
    "Department Task Register",
    "REAL_OPS_ROUTE_SUMMARY_READY",
  ],
  "department task handoff anchor",
  departmentTaskRegisterPath,
);

requireTokens(
  rootDriveConfirmation,
  [
    "Department Question Lanes",
    "General Department Response Template",
    "Department",
    "Self-assessment",
  ],
  "root-drive department confirmation anchor",
  rootDriveConfirmationPath,
);

requireTokens(
  breakdown,
  [
    "Slice 57 - Core Department Data Confirmation Task Register",
    "HEU_CORE_DEPARTMENT_DATA_CONFIRMATION_TASK_REGISTER_20260705.md",
    "check:heu-core-department-data-confirmation-task-register",
    "CORE_DEPARTMENT_DATA_CONFIRMATION_READY / NO_GO / BLOCKED",
    "REAL_DATA_CONFIRMATION_READY: NO_GO",
    "PENDING_DEPARTMENT_CONFIRMATION",
    "CONFIRMED_BY_DEPARTMENT",
    "RETURNED_FOR_REPAIR",
    "BLOCKED_BY_SCOPE",
    "SIGNED_UAT_READY_EXTERNAL",
    "DCTC_STATUS_BRIDGE_READY",
    "OUT_OF_SCOPE",
    "LOCKED",
    "NO_SIGNED_UAT_ACCEPTANCE_FROM_DA_KHOA",
  ],
  "permission-scope breakdown propagation",
  breakdownPath,
);

requireTokens(
  log,
  [
    "2026-07-05 - Core Department Data Confirmation Task Register",
    "HEU_CORE_DEPARTMENT_DATA_CONFIRMATION_TASK_REGISTER_20260705.md",
    "check-heu-core-department-data-confirmation-task-register.mjs",
    "check:heu-core-department-data-confirmation-task-register",
    "CORE_DEPARTMENT_DATA_CONFIRMATION_READY / NO_GO / BLOCKED",
    "REAL_DATA_CONFIRMATION_READY: NO_GO",
    "DCTC_STATUS_BRIDGE_READY",
    "audit:heu-user-account-security",
  ],
  "implementation log propagation",
  logPath,
);

if (
  packageJson.scripts?.["check:heu-core-department-data-confirmation-task-register"] !==
  "node scripts/check-heu-core-department-data-confirmation-task-register.mjs"
) {
  failures.push(
    `${packagePath}: missing check:heu-core-department-data-confirmation-task-register`,
  );
}

requireNoTokens(
  self,
  forbiddenMutationTokens,
  "mutating operation in checker",
  selfPath,
);

if (failures.length > 0) {
  console.error("HEU core department data confirmation task register check failed.");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("HEU core department data confirmation task register check");
console.log("CORE_DEPARTMENT_DATA_CONFIRMATION_READY: PASS_LOCAL_TASK_REGISTER");
console.log("REAL_DATA_CONFIRMATION_READY: NO_GO");
console.log(
  "department_confirmation_states=PENDING_DEPARTMENT_CONFIRMATION|CONFIRMED_BY_DEPARTMENT|RETURNED_FOR_REPAIR|BLOCKED_BY_SCOPE|SIGNED_UAT_READY_EXTERNAL",
);
console.log(
  "dctc_status_bridge=CHO_XAC_NHAN:PENDING_DEPARTMENT_CONFIRMATION|DUNG:CONFIRMED_BY_DEPARTMENT|CAN_SUA:RETURNED_FOR_REPAIR|KHONG_THUOC_TOI:OUT_OF_SCOPE|DA_KHOA:LOCKED",
);
console.log(
  "Boundary: metadata-only; no accounts, scope changes, database mutation, real tasks/email, evidence acceptance, UAT acceptance, owner GO/NO-GO or production GO.",
);
