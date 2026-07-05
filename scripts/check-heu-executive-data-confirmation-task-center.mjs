import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const docPath =
  "docs/HEU_EXECUTIVE_OPERATING_DECISION_DATA_REPORTING_PHASE_REGISTER_20260705.md";
const logPath = "docs/HEU_IMPLEMENTATION_LOG.md";
const inventoryPath = "docs/HEU_CURRENT_STATE_INVENTORY.md";
const packagePath = "package.json";
const dashboardPath = "components/dashboard/executive-dashboard-overview.tsx";
const failures = [];

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

function requireNoPattern(contents, pattern, label, file) {
  if (pattern.test(contents)) {
    failures.push(`${file}: forbidden ${label}`);
  }
}

for (const file of [
  docPath,
  logPath,
  inventoryPath,
  packagePath,
  dashboardPath,
]) {
  requireFile(file);
}

const doc = existsSync(path.join(repoRoot, docPath)) ? read(docPath) : "";
const log = existsSync(path.join(repoRoot, logPath)) ? read(logPath) : "";
const inventory = existsSync(path.join(repoRoot, inventoryPath))
  ? read(inventoryPath)
  : "";
const dashboard = existsSync(path.join(repoRoot, dashboardPath))
  ? read(dashboardPath)
  : "";
const packageJson = existsSync(path.join(repoRoot, packagePath))
  ? JSON.parse(read(packagePath))
  : { scripts: {} };

requireTokens(
  doc,
  [
    "Data Confirmation Task Center Status Taxonomy",
    "Task Center status values",
    "`task_center_status`",
    "`CHO_XAC_NHAN`",
    "Chờ xác nhận",
    "`DUNG`",
    "Đúng",
    "`CAN_SUA`",
    "Cần sửa",
    "`KHONG_THUOC_TOI`",
    "Không thuộc tôi",
    "`DA_KHOA`",
    "Đã khóa",
    "Minimum Data Confirmation Task Center queue",
    "`DCTC-KHTC-001`",
    "`DCTC-TUYEN-SINH-001`",
    "`DCTC-CTHSSV-001`",
    "`DCTC-DAO-TAO-001`",
    "`DCTC-KHOA-001`",
    "`DCTC-SHORT-COURSE-001`",
    "Canonical task-id rule",
    "Legacy shorthand IDs are not canonical",
    "Only the responsible external owner may mark",
    "PASS_LOCAL checks may verify tokens and routing only",
    "must not create",
    "real email, task/ticket, user account",
    "evidence acceptance, UAT acceptance, owner GO/NO-GO or",
    "production GO",
    "Khoa loi chung",
    "Cho tung phong dung thu co kiem soat",
    "Giao viec xac nhan du lieu that",
    "Legal SOP Governance Authority Binding",
    "EXECUTIVE_FOUR_PHASE_LEGAL_SOP_GOVERNANCE_GATE",
    "Ai duoc ky?",
    "Ai duoc duyet?",
    "Bang chung nao hop le?",
    "No inferred signature from PASS_LOCAL",
    "Production remains NO-GO while any proof or signature is missing",
    "Whole-System Master Control Status Table",
    "WHOLE_SYSTEM_MASTER_CONTROL_STATUS_TABLE",
    "MASTER_CONTROL_SYSTEM_STATUS_READY / NO_GO / BLOCKED",
    "which lane is PASS_LOCAL",
    "which lane is NO-GO",
    "User/permission operation",
    "HEU_ROLE_POSITION_OPERATION_TEST_MATRIX_20260704.md",
    "ROLE_POSITION_OPERATION_TEST_MATRIX_READY / NO_GO / BLOCKED",
    "check:heu-role-position-operation-test-matrix",
    "Guide writing decision: NO_GO",
    "missing_visibility=0",
    "missing_business_scope=0",
    "department_lane_mismatch=0",
    "required_positions=15",
    "unassigned_required_positions=11",
    "ttgdtx_negative_candidates=0",
    "pending_external_evidence_lanes=4",
    "REAL_OUT_OF_SCOPE_NEGATIVE_01",
    "Data Master / Report View",
    "Accounting / Finance Desk / TTGDTX 9+",
    "Admissions / Tuyen sinh",
    "Dao Tao / Khoa / Short Course",
    "Legal SOP Governance",
    "UAT / Evidence / Production Gate",
    "HEU AI Agent",
    "Guidance docs for departments/users",
    "NO-GO until signed UAT, controlled evidence, backup/restore and owner GO/NO-GO",
  ],
  "Data Confirmation Task Center contract",
  docPath,
);

if (
  packageJson.scripts?.["check:heu-executive-data-confirmation-task-center"] !==
  "node scripts/check-heu-executive-data-confirmation-task-center.mjs"
) {
  failures.push(
    `${packagePath}: missing check:heu-executive-data-confirmation-task-center script`,
  );
}

requireTokens(
  dashboard,
  [
    "data-heu-executive-data-confirmation-task-center=\"STD-45_DATA_CONFIRMATION_TASK_CENTER\"",
    "PASS_LOCAL_DATA_CONFIRMATION_TASK_CENTER",
    "READ_ONLY METADATA_ONLY",
    "NO_REAL_TASK",
    "NO_REAL_EMAIL",
    "NO_ACCOUNT_CREATE",
    "NO_DATABASE_MUTATION",
    "Data Confirmation Task Center",
    "REAL_DATA_CONFIRMATION_READY / NO_GO / BLOCKED",
    "dataConfirmationStatuses",
    "dataConfirmationTaskRows",
    "DCTC-KHTC-001",
    "DCTC-TUYEN-SINH-001",
    "DCTC-CTHSSV-001",
    "DCTC-DAO-TAO-001",
    "DCTC-KHOA-001",
    "DCTC-SHORT-COURSE-001",
    "CHO_XAC_NHAN",
    "DUNG",
    "CAN_SUA",
    "KHONG_THUOC_TOI",
    "DA_KHOA",
  ],
  "dashboard Task Center surface",
  dashboardPath,
);

requireNoPattern(
  doc,
  /`DCTC-(TS|DT|SC)-001`/,
  "legacy shorthand DCTC task id in executive register",
  docPath,
);

requireNoPattern(
  dashboard,
  /code:\s*"DCTC-(TS|DT|SC)-001"/,
  "legacy shorthand DCTC task id in executive dashboard",
  dashboardPath,
);

requireTokens(
  inventory,
  [
    "npm.cmd run check:heu-executive-data-confirmation-task-center",
    "STD-45_DATA_CONFIRMATION_TASK_CENTER",
    "task_center_status",
    "CHO_XAC_NHAN",
    "DUNG",
    "CAN_SUA",
    "KHONG_THUOC_TOI",
    "DA_KHOA",
    "DCTC-KHTC-001",
    "DCTC-TUYEN-SINH-001",
    "DCTC-CTHSSV-001",
    "DCTC-DAO-TAO-001",
    "DCTC-KHOA-001",
    "DCTC-SHORT-COURSE-001",
    "does not create real email, task/ticket, account",
    "production GO",
  ],
  "current-state propagation",
  inventoryPath,
);

requireTokens(
  log,
  [
    "Data Confirmation Task Center",
    "STD-45_DATA_CONFIRMATION_TASK_CENTER",
    "task_center_status",
    "CHO_XAC_NHAN",
    "DUNG",
    "CAN_SUA",
    "KHONG_THUOC_TOI",
    "DA_KHOA",
    "check-heu-executive-data-confirmation-task-center.mjs",
    "DCTC Canonical Department Task ID Alignment",
    "DCTC-TUYEN-SINH-001",
    "DCTC-DAO-TAO-001",
    "DCTC-SHORT-COURSE-001",
    "Whole-System Master Control Status Table",
    "MASTER_CONTROL_SYSTEM_STATUS_READY / NO_GO / BLOCKED",
    "WHOLE_SYSTEM_MASTER_CONTROL_STATUS_TABLE",
    "HEU_ROLE_POSITION_OPERATION_TEST_MATRIX_20260704.md",
    "ROLE_POSITION_OPERATION_TEST_MATRIX_READY / NO_GO / BLOCKED",
    "check:heu-role-position-operation-test-matrix",
    "DCTC Role-Aware User-Scope Blocker Alignment",
    "missing_visibility=0",
    "missing_business_scope=0",
    "department_lane_mismatch=0",
    "required_positions=15",
    "unassigned_required_positions=11",
    "ttgdtx_negative_candidates=0",
    "pending_external_evidence_lanes=4",
    "does not change app runtime",
    "production status",
  ],
  "implementation-log propagation",
  logPath,
);

if (failures.length > 0) {
  console.error("HEU executive data confirmation task center check failed.");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("HEU executive data confirmation task center check");
console.log("EXECUTIVE_DATA_REPORTING_PHASE_READY: PASS_LOCAL_DECISION_REGISTER");
console.log(
  "task_center_status=CHO_XAC_NHAN|DUNG|CAN_SUA|KHONG_THUOC_TOI|DA_KHOA",
);
console.log(
  "Boundary: metadata-only; no real task/email/account, UAT/evidence acceptance, owner GO/NO-GO or production GO.",
);
