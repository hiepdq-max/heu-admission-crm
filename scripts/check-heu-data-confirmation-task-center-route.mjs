import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const failures = [];

const pagePath = "app/data-confirmation/page.tsx";
const actionPath = "app/data-confirmation/actions.ts";
const appShellPath = "components/layout/app-shell.tsx";
const packagePath = "package.json";
const inventoryPath = "docs/HEU_CURRENT_STATE_INVENTORY.md";
const backlogPath = "docs/HEU_SYSTEM_BUILD_BACKLOG.md";
const gapMatrixPath = "docs/HEU_MODULE_READINESS_GAP_MATRIX_20260628_V01_DRAFT.md";
const logPath = "docs/HEU_IMPLEMENTATION_LOG.md";

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
  pagePath,
  actionPath,
  appShellPath,
  packagePath,
  inventoryPath,
  backlogPath,
  gapMatrixPath,
  logPath,
]) {
  requireFile(file);
}

const page = existsSync(path.join(repoRoot, pagePath)) ? read(pagePath) : "";
const action = existsSync(path.join(repoRoot, actionPath)) ? read(actionPath) : "";
const appShell = existsSync(path.join(repoRoot, appShellPath))
  ? read(appShellPath)
  : "";
const packageJson = existsSync(path.join(repoRoot, packagePath))
  ? JSON.parse(read(packagePath))
  : { scripts: {} };
const inventory = existsSync(path.join(repoRoot, inventoryPath))
  ? read(inventoryPath)
  : "";
const backlog = existsSync(path.join(repoRoot, backlogPath))
  ? read(backlogPath)
  : "";
const gapMatrix = existsSync(path.join(repoRoot, gapMatrixPath))
  ? read(gapMatrixPath)
  : "";
const log = existsSync(path.join(repoRoot, logPath)) ? read(logPath) : "";

requireTokens(
  page,
  [
    "data-heu-data-confirmation-task-center-route=\"DCTC_RUNTIME_ROUTE\"",
    "active=\"data-confirmation\"",
    "PASS_LOCAL_RUNTIME_ROUTE",
    "RLS_VIEW_ONLY",
    "RPC_ROUTE_TO_CHO_XAC_NHAN",
    "RPC_CONFIRM_ONLY",
    "DCTC_SOURCE_PROVENANCE_LOCK_READY",
    "DCTC_DEPARTMENT_QUEUE_SCOPE_READY",
    "NO_AUTO_SEED",
    "NO_RAW_DATA_IMPORT",
    "NO_DIRECT_TABLE_UPDATE",
    "NO_EMAIL_SEND",
    "NO_ACCOUNT_CREATE",
    "NO_TICKET_CREATE",
    "DCTC_AUDIT_TRACE_READY",
    "NO_AUDIT_LOG_MUTATION",
    "NO_EVIDENCE_ACCEPTANCE",
    "NO_UAT_ACCEPTANCE",
    "NO_OWNER_GO",
    "NO_PRODUCTION_GO",
    "heu_data_confirmation_task_center",
    "heu_data_confirmation_task_status_timeline",
    "route_data_confirmation_task",
    "confirm_data_confirmation_task",
    "task_center_status",
    "CHO_XAC_NHAN",
    "DUNG",
    "CAN_SUA",
    "KHONG_THUOC_TOI",
    "DA_KHOA",
    "Schema or access gate is not ready",
    "Control code:",
    "DCTC_VIEW_UNAVAILABLE",
    "DCTC_TIMELINE_UNAVAILABLE",
    "DCTC_READ_PERMISSION_REQUIRED",
    "ReadPermissionGate",
    "data-heu-dctc-read-permission-gate=\"DCTC_READ_PERMISSION_REQUIRED\"",
    "NO_QUEUE_QUERY_WITHOUT_DATA_CONFIRMATION_READ",
    "NO_TIMELINE_QUERY_WITHOUT_DATA_CONFIRMATION_READ",
    "type QueueScope",
    "department?: string | string[]",
    "departmentParam",
    "activeDepartment",
    "allowedDepartments.includes",
    "data-heu-dctc-department-queue-scope=\"DCTC_DEPARTMENT_QUEUE_SCOPE_READY\"",
    "data-heu-dctc-department-queue-boundary=\"DEPARTMENT_QUERY_PARAM_FILTERS_QUEUE_AND_TIMELINE NO_ACCESS_GRANT_FROM_FILTER\"",
    "DEPARTMENT_QUERY_PARAM_FILTERS_QUEUE_AND_TIMELINE",
    "NO_ACCESS_GRANT_FROM_FILTER",
    "department_scope=",
    "department_code",
    "countDepartmentRows",
    "query.eq(\"department_code\", activeDepartment)",
    "timelineQuery.eq(\"department_code\", activeDepartment)",
    "department: activeDepartment",
    "ASSIGNED_TO_ME",
    "OWNED_BY_ME",
    "scope?: string | string[]",
    "scopeParam",
    "activeScope",
    "owner_user_id",
    "assigned_user_id",
    "query.eq(\"assigned_user_id\", user.id)",
    "query.eq(\"owner_user_id\", user.id)",
    "timelineQuery.eq(\"assigned_user_id\", user.id)",
    "timelineQuery.eq(\"owner_user_id\", user.id)",
    "queue_scope=",
    "Assigned to me",
    "Owner lane",
    "const canReadTasks = Boolean(readPermissionResult.data);",
    "const canRouteTasks = canReadTasks && Boolean(routePermissionResult.data);",
    "if (canReadTasks) {",
    "No visible confirmation tasks",
    "RoutingForm",
    "RPC_ROUTE_TO_CHO_XAC_NHAN",
    "data-heu-dctc-route-assignee-lock=\"OWNER_AND_ASSIGNEE_REQUIRED_BEFORE_CHO_XAC_NHAN\"",
    "data-heu-dctc-owner-assignee-pair-lock=\"DCTC_OWNER_ASSIGNEE_PAIR_LOCK_READY OWNER_AND_ASSIGNEE_REQUIRED_BEFORE_CHO_XAC_NHAN\"",
    "DCTC_OWNER_ASSIGNEE_PAIR_LOCK_READY",
    "OWNER_AND_ASSIGNEE_REQUIRED_BEFORE_CHO_XAC_NHAN",
    "data-heu-dctc-scope-gate-lock=\"DCTC_SCOPE_GATE_REQUIRED_BEFORE_CHO_XAC_NHAN SCOPE_GATE_REF_REQUIRED_BEFORE_CHO_XAC_NHAN NO_ACCESS_GRANT_FROM_SCOPE_GATE_REF\"",
    "DCTC_SCOPE_GATE_REQUIRED_BEFORE_CHO_XAC_NHAN",
    "SCOPE_GATE_REF_REQUIRED_BEFORE_CHO_XAC_NHAN",
    "NO_ACCESS_GRANT_FROM_SCOPE_GATE_REF",
    "data-heu-dctc-source-provenance-lock=\"DCTC_SOURCE_PROVENANCE_LOCK_READY SOURCE_METADATA_REQUIRED_BEFORE_CHO_XAC_NHAN NO_RAW_SOURCE_PAYLOAD\"",
    "SOURCE_METADATA_REQUIRED_BEFORE_CHO_XAC_NHAN",
    "NO_RAW_SOURCE_PAYLOAD",
    "Owner user va Assigned user la bat buoc truoc",
    "Scope gate ref",
    "scope_gate_ref",
    "routeDataConfirmationTaskAction",
    "TaskRow",
    "ConfirmationForm",
    "can_current_user_confirm: boolean",
    "can_current_user_confirm",
    "data-heu-dctc-confirm-transition=\"CONFIRM_FROM_CHO_XAC_NHAN_ONLY\"",
    "data-heu-dctc-confirm-submitter-scope=\"CONFIRM_SUBMITTER_SCOPE_LOCK\"",
    "CONFIRM_SUBMITTER_SCOPE_LOCK",
    "CONFIRM_FROM_CHO_XAC_NHAN_ONLY",
    "row.task_center_status === \"CHO_XAC_NHAN\"",
    "Boolean(row.can_current_user_confirm)",
    "data_confirmation.confirm moi submit",
    "task da co ket qua thi khong submit",
    "data-heu-dctc-confirm-form=\"RPC_CONFIRM_ONLY REPAIR_OR_OUT_OF_SCOPE_NOTE_REQUIRED DA_KHOA_LOCK_REQUIRES_NOTE_AND_EVIDENCE_REF\"",
    "REPAIR_OR_OUT_OF_SCOPE_NOTE_REQUIRED",
    "Required for Can sua, Khong thuoc toi or Da khoa",
    "Required when locking to DA_KHOA",
    "due_date_or_batch",
    "owner_decision_ref",
    "Due date / batch",
    "Owner decision ref",
    "Due/batch:",
    "Owner decision:",
    "StatusTimeline",
    "STATUS_HISTORY_TIMELINE_READY",
    "data-heu-dctc-status-history-timeline=\"STATUS_HISTORY_TIMELINE_READY\"",
    "data-heu-dctc-status-history-scope=\"STATUS_HISTORY_SCOPE_PARITY\"",
    "data-heu-dctc-audit-trace=\"DCTC_AUDIT_TRACE_READY\"",
    "Scope={activeScope}",
    "data-heu-dctc-status-history-boundary=\"RLS_TIMELINE_VIEW_ONLY NO_DIRECT_HISTORY_TABLE_UPDATE NO_RAW_ERROR_DISCLOSURE NO_EVIDENCE_ACCEPTANCE NO_UAT_ACCEPTANCE NO_OWNER_GO NO_PRODUCTION_GO\"",
    "heu_data_confirmation_task_status_timeline",
    "DataConfirmationHistoryRow",
    "owner_user_id: string | null",
    "assigned_user_id: string | null",
    "audit_trace_ref: string",
    "audit_trace_ref",
    "previous_status",
    "next_status",
    "actor_user_name",
    "Audit trace:",
    "DCTC_AUDIT_TRACE_READY",
    "Timeline view is pending",
    "ControlledPilotLanes",
    "CONTROLLED_PILOT_LANE_READY",
    "data-heu-dctc-controlled-pilot-lanes=\"CONTROLLED_PILOT_LANE_READY\"",
    "data-heu-dctc-controlled-pilot-department-lock=\"CONTROLLED_PILOT_DEPARTMENT_ONLY\"",
    "CONTROLLED_PILOT_DEPARTMENT_ONLY",
    "route task chi cho 6 phong dung",
    "IT/Data, Audit va BGH la lane kiem soat/GO ben ngoai",
    "data-heu-dctc-controlled-pilot-departments=\"KHTC TUYEN_SINH CTHSSV DAO_TAO KHOA SHORT_COURSE\"",
    "data-heu-dctc-controlled-pilot-boundary=\"METADATA_ONLY NO_AUTO_SEED NO_RAW_DATA_IMPORT NO_REAL_TASK_CREATION NO_EMAIL_SEND NO_EVIDENCE_ACCEPTANCE NO_UAT_ACCEPTANCE NO_OWNER_GO NO_PRODUCTION_GO\"",
    "controlledPilotDepartments",
    "DCTC-KHTC-001",
    "DCTC-TUYEN-SINH-001",
    "DCTC-CTHSSV-001",
    "DCTC-DAO-TAO-001",
    "DCTC-KHOA-001",
    "DCTC-SHORT-COURSE-001",
    "AppShell",
  ],
  "DCTC route surface",
  pagePath,
);

requireTokens(
  appShell,
  [
    "label: \"Data confirmation\"",
    "href: \"/data-confirmation\"",
    "key: \"data-confirmation\"",
    "group: \"control\"",
    "permission: \"data_confirmation.read\"",
    "ClipboardCheck",
  ],
  "DCTC AppShell navigation entry",
  appShellPath,
);

requireTokens(
  action,
  [
    "\"use server\"",
    "routeDataConfirmationTaskAction",
    "allowedRouteDepartments",
    "DCTC_OWNER_ASSIGNEE_PAIR_LOCK_READY",
    "owner_and_assignee_required_before_cho_xac_nhan",
    "DCTC_SCOPE_GATE_REQUIRED_BEFORE_CHO_XAC_NHAN",
    "scope_gate_required_before_cho_xac_nhan",
    "DCTC_SOURCE_PROVENANCE_LOCK_READY",
    "source_metadata_required_before_cho_xac_nhan",
    "const ownerUserId = uuidValue(formData, \"owner_user_id\");",
    "const assignedUserId = uuidValue(formData, \"assigned_user_id\");",
    "const scopeGateRef = textValue(formData, \"scope_gate_ref\");",
    "if (!scopeGateRef)",
    "if (!ownerUserId || !assignedUserId)",
    "route_data_confirmation_task",
    "p_task_code",
    "p_department_code",
    "p_source_record_label",
    "p_data_domain",
    "p_source_route",
    "p_dq_check_ref",
    "p_controlled_evidence_ref",
    "p_due_date_or_batch",
    "p_owner_decision_ref",
    "p_scope_gate_ref",
    "scope_gate_ref",
    "due_date_or_batch",
    "owner_decision_ref",
    "scope_gate_ref",
    "redirectWithError(DCTC_SOURCE_PROVENANCE_LOCK_READY)",
    "redirectWithError(DCTC_SCOPE_GATE_REQUIRED_BEFORE_CHO_XAC_NHAN)",
    "DCTC_OWNER_ASSIGNEE_PAIR_LOCK_READY",
    "owner_and_assignee_required_before_cho_xac_nhan",
    "DCTC_SCOPE_GATE_REQUIRED_BEFORE_CHO_XAC_NHAN",
    "scope_gate_required_before_cho_xac_nhan",
    "if (!scopeGateRef)",
    "if (!ownerUserId || !assignedUserId)",
    "DCTC_ROUTE_UNAVAILABLE",
    "redirect(\"/data-confirmation?routed=1\")",
    "confirmDataConfirmationTaskAction",
    "allowedConfirmationStatuses",
    "DCTC_LOCK_NOTE_REQUIRED",
    "DCTC_REPAIR_OR_OUT_OF_SCOPE_NOTE_REQUIRED",
    "DCTC_LOCK_EVIDENCE_REQUIRED",
    "\"DUNG\"",
    "\"CAN_SUA\"",
    "\"KHONG_THUOC_TOI\"",
    "\"DA_KHOA\"",
    "confirm_data_confirmation_task",
    "p_task_id",
    "p_next_status",
    "p_note",
    "p_controlled_evidence_ref",
    "confirmation_note_required_for_repair_or_out_of_scope",
    "DCTC_REPAIR_OR_OUT_OF_SCOPE_NOTE_REQUIRED",
    "confirmation_note_required_for_locked_status",
    "controlled_evidence_ref_required_for_locked_status",
    "nextStatus === \"DA_KHOA\"",
    "DCTC_CONFIRM_UNAVAILABLE",
    "revalidatePath(\"/data-confirmation\")",
    "redirect(\"/data-confirmation?updated=1\")",
  ],
  "DCTC route action",
  actionPath,
);

requireNoPattern(
  `${page}\n${action}`,
  /error\.message|Supabase response:/i,
  "raw Supabase/database error disclosure",
  "app/data-confirmation",
);
requireNoPattern(
  `${page}\n${action}`,
  /\.from\(["']heu_data_confirmation_tasks["']\)[\s\S]*\.(insert|update|upsert|delete)\s*\(/i,
  "direct task table mutation",
  "app/data-confirmation",
);
requireNoPattern(
  `${page}\n${action}`,
  /auth\.admin|service_role|supabase_service_role_key|insert\s+into\s+auth\.users|createUser|send\s+email|smtp|password|owner\s+GO\s+accepted|production\s+GO\s+accepted/i,
  "secret/account/email/approval operation",
  "app/data-confirmation",
);
requireNoPattern(
  page,
  /allowedDepartments\s*=\s*\[[\s\S]*"IT_DATA"[\s\S]*\]/,
  "internal IT_DATA lane in DCTC route department list",
  pagePath,
);
requireNoPattern(
  page,
  /allowedDepartments\s*=\s*\[[\s\S]*"AUDIT"[\s\S]*\]/,
  "internal AUDIT lane in DCTC route department list",
  pagePath,
);
requireNoPattern(
  page,
  /allowedDepartments\s*=\s*\[[\s\S]*"BGH"[\s\S]*\]/,
  "internal BGH lane in DCTC route department list",
  pagePath,
);
requireNoPattern(
  action,
  /allowedRouteDepartments\s*=\s*new Set\(\[[\s\S]*"IT_DATA"[\s\S]*\]\)/,
  "internal IT_DATA lane in DCTC route action allow-list",
  actionPath,
);
requireNoPattern(
  action,
  /allowedRouteDepartments\s*=\s*new Set\(\[[\s\S]*"AUDIT"[\s\S]*\]\)/,
  "internal AUDIT lane in DCTC route action allow-list",
  actionPath,
);
requireNoPattern(
  action,
  /allowedRouteDepartments\s*=\s*new Set\(\[[\s\S]*"BGH"[\s\S]*\]\)/,
  "internal BGH lane in DCTC route action allow-list",
  actionPath,
);

if (
  packageJson.scripts?.["check:heu-data-confirmation-task-center-route"] !==
  "node scripts/check-heu-data-confirmation-task-center-route.mjs"
) {
  failures.push(
    `${packagePath}: missing check:heu-data-confirmation-task-center-route script`,
  );
}

requireTokens(
  inventory,
  [
    "npm.cmd run check:heu-data-confirmation-task-center-route",
    "PASS_LOCAL_RUNTIME_ROUTE",
    "components/layout/app-shell.tsx",
    "data_confirmation.read",
    "DCTC_READ_PERMISSION_REQUIRED",
    "NO_QUEUE_QUERY_WITHOUT_DATA_CONFIRMATION_READ",
    "DCTC_SOURCE_PROVENANCE_LOCK_READY",
    "source_record_label",
    "source_route",
    "data_domain",
    "dq_check_ref",
    "controlled_evidence_ref",
    "SOURCE_METADATA_REQUIRED_BEFORE_CHO_XAC_NHAN",
    "DCTC_DEPARTMENT_QUEUE_SCOPE_READY",
    "department_code",
    "DEPARTMENT_QUERY_PARAM_FILTERS_QUEUE_AND_TIMELINE",
    "ASSIGNED_TO_ME",
    "OWNED_BY_ME",
    "/data-confirmation",
    "heu_data_confirmation_task_center",
    "heu_data_confirmation_task_status_timeline",
    "route_data_confirmation_task",
    "confirm_data_confirmation_task",
    "due_date_or_batch",
    "owner_decision_ref",
    "scope_gate_ref",
    "ASSIGNEE_OR_OWNER_REQUIRED",
    "DCTC_OWNER_ASSIGNEE_PAIR_LOCK_READY",
    "OWNER_AND_ASSIGNEE_REQUIRED_BEFORE_CHO_XAC_NHAN",
    "DCTC_SCOPE_GATE_REQUIRED_BEFORE_CHO_XAC_NHAN",
    "SCOPE_GATE_REF_REQUIRED_BEFORE_CHO_XAC_NHAN",
    "RPC_ROUTE_TO_CHO_XAC_NHAN",
    "CONTROLLED_PILOT_LANE_READY",
    "KHTC",
    "TUYEN_SINH",
    "CTHSSV",
    "DAO_TAO",
    "KHOA",
    "SHORT_COURSE",
    "metadata only",
    "STATUS_HISTORY_TIMELINE_READY",
    "RLS_TIMELINE_VIEW_ONLY",
    "STATUS_HISTORY_SCOPE_PARITY",
    "DCTC_AUDIT_TRACE_READY",
    "NO_AUDIT_LOG_MUTATION",
    "audit_trace_ref",
    "RPC_CONFIRM_ONLY",
    "CONFIRM_SUBMITTER_SCOPE_LOCK",
    "CONFIRM_FROM_CHO_XAC_NHAN_ONLY",
    "REPAIR_OR_OUT_OF_SCOPE_NOTE_REQUIRED",
    "DA_KHOA lock requires note and controlled evidence ref",
    "does not auto-seed real tasks",
    "production GO",
  ],
  "current-state propagation",
  inventoryPath,
);

requireTokens(
  backlog,
  [
    "P0-22",
    "Data Confirmation Task Center runtime route",
    "check:heu-data-confirmation-task-center-route",
    "PASS_LOCAL_RUNTIME_ROUTE",
    "app/data-confirmation/page.tsx",
    "app/data-confirmation/actions.ts",
    "components/layout/app-shell.tsx",
    "data_confirmation.read",
    "DCTC_READ_PERMISSION_REQUIRED",
    "ASSIGNED_TO_ME",
    "OWNED_BY_ME",
    "DCTC_SOURCE_PROVENANCE_LOCK_READY",
    "source_record_label",
    "source_route",
    "data_domain",
    "dq_check_ref",
    "controlled_evidence_ref",
    "DCTC_DEPARTMENT_QUEUE_SCOPE_READY",
    "department_code",
    "DEPARTMENT_QUERY_PARAM_FILTERS_QUEUE_AND_TIMELINE",
    "STATUS_HISTORY_SCOPE_PARITY",
    "DCTC_AUDIT_TRACE_READY",
    "NO_AUDIT_LOG_MUTATION",
    "audit_trace_ref",
    "route_data_confirmation_task",
    "heu_data_confirmation_task_status_timeline",
    "due_date_or_batch",
    "owner_decision_ref",
    "scope_gate_ref",
    "ASSIGNEE_OR_OWNER_REQUIRED",
    "DCTC_OWNER_ASSIGNEE_PAIR_LOCK_READY",
    "OWNER_AND_ASSIGNEE_REQUIRED_BEFORE_CHO_XAC_NHAN",
    "DCTC_SCOPE_GATE_REQUIRED_BEFORE_CHO_XAC_NHAN",
    "SCOPE_GATE_REF_REQUIRED_BEFORE_CHO_XAC_NHAN",
    "CONTROLLED_PILOT_LANE_READY",
    "CONTROLLED_PILOT_DEPARTMENT_ONLY",
    "KHTC, Tuyen sinh, CTHSSV, Dao Tao, Khoa/Giang vien and Short Course",
    "REPAIR_OR_OUT_OF_SCOPE_NOTE_REQUIRED",
    "DA_KHOA lock requires note and controlled evidence ref",
    "does not auto-seed real tasks",
    "owner GO/NO-GO or production GO",
  ],
  "backlog propagation",
  backlogPath,
);

requireTokens(
  gapMatrix,
  [
    "Data Confirmation Task Center",
    "PASS_LOCAL_RUNTIME_ROUTE",
    "/data-confirmation",
    "data_confirmation.read",
    "DCTC_READ_PERMISSION_REQUIRED",
    "ASSIGNED_TO_ME",
    "OWNED_BY_ME",
    "DCTC_SOURCE_PROVENANCE_LOCK_READY",
    "source_record_label",
    "source_route",
    "data_domain",
    "dq_check_ref",
    "controlled_evidence_ref",
    "DCTC_DEPARTMENT_QUEUE_SCOPE_READY",
    "department_code",
    "DEPARTMENT_QUERY_PARAM_FILTERS_QUEUE_AND_TIMELINE",
    "STATUS_HISTORY_SCOPE_PARITY",
    "DCTC_AUDIT_TRACE_READY",
    "NO_AUDIT_LOG_MUTATION",
    "audit_trace_ref",
    "route_data_confirmation_task",
    "heu_data_confirmation_task_status_timeline",
    "RPC_ROUTE_TO_CHO_XAC_NHAN",
    "due_date_or_batch",
    "owner_decision_ref",
    "scope_gate_ref",
    "ASSIGNEE_OR_OWNER_REQUIRED",
    "DCTC_OWNER_ASSIGNEE_PAIR_LOCK_READY",
    "OWNER_AND_ASSIGNEE_REQUIRED_BEFORE_CHO_XAC_NHAN",
    "DCTC_SCOPE_GATE_REQUIRED_BEFORE_CHO_XAC_NHAN",
    "SCOPE_GATE_REF_REQUIRED_BEFORE_CHO_XAC_NHAN",
    "CONTROLLED_PILOT_LANE_READY",
    "CONTROLLED_PILOT_DEPARTMENT_ONLY",
    "KHTC, Admissions, CTHSSV, Dao Tao, Khoa/Giang vien and Short Course",
    "RPC_CONFIRM_ONLY",
    "CONFIRM_SUBMITTER_SCOPE_LOCK",
    "CONFIRM_FROM_CHO_XAC_NHAN_ONLY",
    "REPAIR_OR_OUT_OF_SCOPE_NOTE_REQUIRED",
    "DA_KHOA lock requires note and controlled evidence ref",
    "future production reliance",
    "owner GO/NO-GO or production GO",
  ],
  "gap-matrix propagation",
  gapMatrixPath,
);

requireTokens(
  log,
  [
    "2026-07-05 - Data Confirmation Task Center Runtime Route",
    "app/data-confirmation/page.tsx",
    "app/data-confirmation/actions.ts",
    "components/layout/app-shell.tsx",
    "scripts/check-heu-data-confirmation-task-center-route.mjs",
    "check:heu-data-confirmation-task-center-route",
    "PASS_LOCAL_RUNTIME_ROUTE",
    "RLS_VIEW_ONLY",
    "RPC_ROUTE_TO_CHO_XAC_NHAN",
    "CONTROLLED_PILOT_LANE_READY",
    "CONTROLLED_PILOT_DEPARTMENT_ONLY",
    "controlled department pilot lanes",
    "data_confirmation.read",
    "DCTC_READ_PERMISSION_REQUIRED",
    "ASSIGNED_TO_ME",
    "OWNED_BY_ME",
    "DCTC_SOURCE_PROVENANCE_LOCK_READY",
    "source_record_label",
    "source_route",
    "data_domain",
    "dq_check_ref",
    "controlled_evidence_ref",
    "DCTC_DEPARTMENT_QUEUE_SCOPE_READY",
    "department_code",
    "DEPARTMENT_QUERY_PARAM_FILTERS_QUEUE_AND_TIMELINE",
    "STATUS_HISTORY_TIMELINE_READY",
    "STATUS_HISTORY_SCOPE_PARITY",
    "heu_data_confirmation_task_status_timeline",
    "DCTC_AUDIT_TRACE_READY",
    "NO_AUDIT_LOG_MUTATION",
    "audit_trace_ref",
    "RPC_CONFIRM_ONLY",
    "CONFIRM_SUBMITTER_SCOPE_LOCK",
    "CONFIRM_FROM_CHO_XAC_NHAN_ONLY",
    "REPAIR_OR_OUT_OF_SCOPE_NOTE_REQUIRED",
    "DA_KHOA_LOCK_REQUIRES_NOTE_AND_EVIDENCE_REF",
    "DA_KHOA lock requires note and controlled evidence ref",
    "route_data_confirmation_task",
    "due_date_or_batch",
    "owner_decision_ref",
    "scope_gate_ref",
    "ASSIGNEE_OR_OWNER_REQUIRED",
    "DCTC_OWNER_ASSIGNEE_PAIR_LOCK_READY",
    "OWNER_AND_ASSIGNEE_REQUIRED_BEFORE_CHO_XAC_NHAN",
    "DCTC_SCOPE_GATE_REQUIRED_BEFORE_CHO_XAC_NHAN",
    "SCOPE_GATE_REF_REQUIRED_BEFORE_CHO_XAC_NHAN",
    "does not auto-seed real tasks",
    "Production remains NO-GO",
  ],
  "implementation-log propagation",
  logPath,
);

if (failures.length > 0) {
  console.error("HEU Data Confirmation Task Center route check failed.");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("HEU Data Confirmation Task Center route check");
console.log("DCTC_RUNTIME_ROUTE_READY: PASS_LOCAL_RUNTIME_ROUTE");
console.log(
  "route=/data-confirmation; read=heu_data_confirmation_task_center; route=route_data_confirmation_task; pilot_lanes=CONTROLLED_PILOT_LANE_READY; department_lock=CONTROLLED_PILOT_DEPARTMENT_ONLY; submitter_lock=CONFIRM_SUBMITTER_SCOPE_LOCK; update=confirm_data_confirmation_task",
);
console.log(
  "repair_out_of_scope_note_lock=REPAIR_OR_OUT_OF_SCOPE_NOTE_REQUIRED",
);
console.log(
  "source_provenance_lock=DCTC_SOURCE_PROVENANCE_LOCK_READY; route_requires=SOURCE_METADATA_REQUIRED_BEFORE_CHO_XAC_NHAN; payload=NO_RAW_SOURCE_PAYLOAD",
);
console.log(
  "owner_assignee_pair_lock=DCTC_OWNER_ASSIGNEE_PAIR_LOCK_READY; route_requires=OWNER_AND_ASSIGNEE_REQUIRED_BEFORE_CHO_XAC_NHAN",
);
console.log(
  "scope_gate_route_lock=DCTC_SCOPE_GATE_REQUIRED_BEFORE_CHO_XAC_NHAN; route_requires=SCOPE_GATE_REF_REQUIRED_BEFORE_CHO_XAC_NHAN",
);
console.log("audit_trace_ref=DCTC_AUDIT_TRACE_READY");
console.log(
  "department_queue_scope=DCTC_DEPARTMENT_QUEUE_SCOPE_READY; boundary=DEPARTMENT_QUERY_PARAM_FILTERS_QUEUE_AND_TIMELINE; access=NO_ACCESS_GRANT_FROM_FILTER",
);
console.log(
  "Boundary: RLS/RPC only; no auto-seed, raw-data import, direct table update, email, account, ticket, evidence/UAT acceptance, owner GO/NO-GO or production GO.",
);
