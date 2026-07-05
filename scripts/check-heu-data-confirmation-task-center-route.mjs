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
    "NO_AUTO_SEED",
    "NO_RAW_DATA_IMPORT",
    "NO_DIRECT_TABLE_UPDATE",
    "NO_EMAIL_SEND",
    "NO_ACCOUNT_CREATE",
    "NO_TICKET_CREATE",
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
    "data-heu-dctc-route-assignee-lock=\"ASSIGNEE_OR_OWNER_REQUIRED\"",
    "Owner user hoac Assigned user la bat buoc truoc",
    "routeDataConfirmationTaskAction",
    "TaskRow",
    "ConfirmationForm",
    "can_current_user_confirm: boolean",
    "can_current_user_confirm",
    "data-heu-dctc-confirm-transition=\"CONFIRM_FROM_CHO_XAC_NHAN_ONLY\"",
    "data-heu-dctc-confirm-submitter-scope=\"CONFIRM_SUBMITTER_SCOPE_LOCK\"",
    "CONFIRM_SUBMITTER_SCOPE_LOCK",
    "CONFIRM_FROM_CHO_XAC_NHAN_ONLY",
    "row.task_center_status === \"CHO_XAC_NHAN\" && row.can_current_user_confirm",
    "data_confirmation.confirm moi submit",
    "task da co ket qua thi khong submit",
    "data-heu-dctc-confirm-form=\"RPC_CONFIRM_ONLY DA_KHOA_LOCK_REQUIRES_NOTE_AND_EVIDENCE_REF\"",
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
    "Scope={activeScope}",
    "data-heu-dctc-status-history-boundary=\"RLS_TIMELINE_VIEW_ONLY NO_DIRECT_HISTORY_TABLE_UPDATE NO_RAW_ERROR_DISCLOSURE NO_EVIDENCE_ACCEPTANCE NO_UAT_ACCEPTANCE NO_OWNER_GO NO_PRODUCTION_GO\"",
    "heu_data_confirmation_task_status_timeline",
    "DataConfirmationHistoryRow",
    "owner_user_id: string | null",
    "assigned_user_id: string | null",
    "previous_status",
    "next_status",
    "actor_user_name",
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
    "DCTC_ROUTE_ASSIGNEE_OR_OWNER_REQUIRED",
    "assignee_or_owner_required_for_confirmation_task",
    "const ownerUserId = uuidValue(formData, \"owner_user_id\");",
    "const assignedUserId = uuidValue(formData, \"assigned_user_id\");",
    "if (!ownerUserId && !assignedUserId)",
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
    "due_date_or_batch",
    "owner_decision_ref",
    "missing_required_route_task_metadata",
    "DCTC_ROUTE_ASSIGNEE_OR_OWNER_REQUIRED",
    "assignee_or_owner_required_for_confirmation_task",
    "if (!ownerUserId && !assignedUserId)",
    "DCTC_ROUTE_UNAVAILABLE",
    "redirect(\"/data-confirmation?routed=1\")",
    "confirmDataConfirmationTaskAction",
    "allowedConfirmationStatuses",
    "DCTC_LOCK_NOTE_REQUIRED",
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
    "ASSIGNED_TO_ME",
    "OWNED_BY_ME",
    "/data-confirmation",
    "heu_data_confirmation_task_center",
    "heu_data_confirmation_task_status_timeline",
    "route_data_confirmation_task",
    "confirm_data_confirmation_task",
    "due_date_or_batch",
    "owner_decision_ref",
    "ASSIGNEE_OR_OWNER_REQUIRED",
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
    "RPC_CONFIRM_ONLY",
    "CONFIRM_SUBMITTER_SCOPE_LOCK",
    "CONFIRM_FROM_CHO_XAC_NHAN_ONLY",
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
    "STATUS_HISTORY_SCOPE_PARITY",
    "route_data_confirmation_task",
    "heu_data_confirmation_task_status_timeline",
    "due_date_or_batch",
    "owner_decision_ref",
    "ASSIGNEE_OR_OWNER_REQUIRED",
    "CONTROLLED_PILOT_LANE_READY",
    "CONTROLLED_PILOT_DEPARTMENT_ONLY",
    "KHTC, Tuyen sinh, CTHSSV, Dao Tao, Khoa/Giang vien and Short Course",
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
    "STATUS_HISTORY_SCOPE_PARITY",
    "route_data_confirmation_task",
    "heu_data_confirmation_task_status_timeline",
    "RPC_ROUTE_TO_CHO_XAC_NHAN",
    "due_date_or_batch",
    "owner_decision_ref",
    "ASSIGNEE_OR_OWNER_REQUIRED",
    "CONTROLLED_PILOT_LANE_READY",
    "CONTROLLED_PILOT_DEPARTMENT_ONLY",
    "KHTC, Admissions, CTHSSV, Dao Tao, Khoa/Giang vien and Short Course",
    "RPC_CONFIRM_ONLY",
    "CONFIRM_SUBMITTER_SCOPE_LOCK",
    "CONFIRM_FROM_CHO_XAC_NHAN_ONLY",
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
    "STATUS_HISTORY_TIMELINE_READY",
    "STATUS_HISTORY_SCOPE_PARITY",
    "heu_data_confirmation_task_status_timeline",
    "RPC_CONFIRM_ONLY",
    "CONFIRM_SUBMITTER_SCOPE_LOCK",
    "CONFIRM_FROM_CHO_XAC_NHAN_ONLY",
    "DA_KHOA_LOCK_REQUIRES_NOTE_AND_EVIDENCE_REF",
    "DA_KHOA lock requires note and controlled evidence ref",
    "route_data_confirmation_task",
    "due_date_or_batch",
    "owner_decision_ref",
    "ASSIGNEE_OR_OWNER_REQUIRED",
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
  "route=/data-confirmation; read=heu_data_confirmation_task_center; route=route_data_confirmation_task; pilot_lanes=CONTROLLED_PILOT_LANE_READY; department_lock=CONTROLLED_PILOT_DEPARTMENT_ONLY; update=confirm_data_confirmation_task",
);
console.log(
  "Boundary: RLS/RPC only; no auto-seed, raw-data import, direct table update, email, account, ticket, evidence/UAT acceptance, owner GO/NO-GO or production GO.",
);
