import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const failures = [];

const sqlPath = "database/step121_data_confirmation_task_center.sql";
const packagePath = "package.json";
const inventoryPath = "docs/HEU_CURRENT_STATE_INVENTORY.md";
const backlogPath = "docs/HEU_SYSTEM_BUILD_BACKLOG.md";
const gapMatrixPath = "docs/HEU_MODULE_READINESS_GAP_MATRIX_20260628_V01_DRAFT.md";
const sqlObjectMapPath = "docs/HEU_SQL_OBJECT_MASTER_MAP_20260627.md";
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
  sqlPath,
  packagePath,
  inventoryPath,
  backlogPath,
  gapMatrixPath,
  sqlObjectMapPath,
  logPath,
]) {
  requireFile(file);
}

const sql = existsSync(path.join(repoRoot, sqlPath)) ? read(sqlPath) : "";
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
const sqlObjectMap = existsSync(path.join(repoRoot, sqlObjectMapPath))
  ? read(sqlObjectMapPath)
  : "";
const log = existsSync(path.join(repoRoot, logPath)) ? read(logPath) : "";

requireTokens(
  sql,
  [
    "Step 121 - Data Confirmation Task Center core contract",
    "Migration candidate only. Do not run in production from Codex/chat.",
    "CONTROLLED_PILOT_DEPARTMENT_ONLY",
    "DCTC_SOURCE_PROVENANCE_LOCK_READY",
    "SOURCE_METADATA_REQUIRED_BEFORE_CHO_XAC_NHAN",
    "the task center only routes approved source metadata, never raw payloads",
    "six controlled",
    "public.data_confirmation_task_status",
    "'CHO_XAC_NHAN'",
    "'DUNG'",
    "'CAN_SUA'",
    "'KHONG_THUOC_TOI'",
    "'DA_KHOA'",
    "create table if not exists public.heu_data_confirmation_tasks",
    "create table if not exists public.heu_data_confirmation_task_status_history",
    "heu_data_confirmation_task_status_timeline",
    "task_center_status public.data_confirmation_task_status not null default 'CHO_XAC_NHAN'",
    "due_date_or_batch text not null",
    "owner_decision_ref text not null",
    "scope_gate_ref text not null",
    "add column if not exists due_date_or_batch text",
    "add column if not exists owner_decision_ref text",
    "add column if not exists scope_gate_ref text",
    "department_code in",
    "'KHTC'",
    "'TUYEN_SINH'",
    "'CTHSSV'",
    "'DAO_TAO'",
    "'KHOA'",
    "'SHORT_COURSE'",
    "WAITING_OWNER_CONFIRMATION",
    "CONFIRMED_BY_DEPARTMENT",
    "RETURNED_FOR_REPAIR",
    "OUT_OF_SCOPE",
    "LOCKED",
    "SIGNED_UAT_READY_EXTERNAL",
    "public.can_read_data_confirmation_task",
    "public.can_route_data_confirmation_task",
    "public.can_confirm_data_confirmation_task",
    "public.route_data_confirmation_task",
    "p_due_date_or_batch text default null",
    "p_owner_decision_ref text default null",
    "p_scope_gate_ref text default null",
    "Authentication is required to route a data-confirmation task",
    "Not allowed to route data-confirmation tasks",
    "Task code, department, source label, data domain, source route, DQ check ref, controlled evidence ref, due date or batch and owner decision ref are required",
    "DCTC_OWNER_ASSIGNEE_PAIR_LOCK_READY",
    "OWNER_AND_ASSIGNEE_REQUIRED_BEFORE_CHO_XAC_NHAN",
    "DCTC_SCOPE_GATE_REQUIRED_BEFORE_CHO_XAC_NHAN",
    "SCOPE_GATE_REF_REQUIRED_BEFORE_CHO_XAC_NHAN",
    "Data-confirmation task requires scope gate ref before CHO_XAC_NHAN",
    "p_owner_user_id is null or p_assigned_user_id is null",
    "Data-confirmation task requires both owner user lane and assigned user before CHO_XAC_NHAN",
    "insert into public.heu_data_confirmation_tasks",
    "cleaned_due_date_or_batch",
    "cleaned_owner_decision_ref",
    "cleaned_scope_gate_ref",
    "Data-confirmation task code already exists",
    "public.confirm_data_confirmation_task",
    "task_row.task_center_status <> 'CHO_XAC_NHAN'",
    "Data-confirmation task can only be confirmed from CHO_XAC_NHAN",
    "raise exception 'Use task routing to keep CHO_XAC_NHAN; confirmation cannot reset a task'",
    "cleaned_note",
    "cleaned_controlled_evidence_ref",
    "REPAIR_OR_OUT_OF_SCOPE_NOTE_REQUIRED",
    "p_next_status in ('CAN_SUA', 'KHONG_THUOC_TOI')",
    "CAN_SUA and KHONG_THUOC_TOI require confirmation note",
    "DA_KHOA requires lock note and controlled evidence ref",
    "insert into public.heu_data_confirmation_task_status_history",
    "trg_heu_data_confirmation_tasks_updated_at",
    "trg_heu_data_confirmation_tasks_audit",
    "trg_heu_data_confirmation_task_status_history_audit",
    "for each row execute function public.write_audit_log();",
    "create or replace view public.heu_data_confirmation_task_center",
    "('DCTC_TASK:' || t.task_code) as audit_trace_ref",
    "can_current_user_confirm",
    "coalesce(public.can_confirm_data_confirmation_task(",
    "public.can_confirm_data_confirmation_task(",
    "grant select on public.heu_data_confirmation_task_center to authenticated",
    "create or replace view public.heu_data_confirmation_task_status_timeline",
    "('DCTC_HISTORY:' || h.id::text) as audit_trace_ref",
    "grant select on public.heu_data_confirmation_task_status_timeline to authenticated",
    "t.owner_user_id",
    "t.assigned_user_id",
    "actor.full_name as actor_user_name",
    "audit_trace_ref",
    "h.previous_status",
    "h.next_status",
    "'data_confirmation.read'",
    "'data_confirmation.route'",
    "'data_confirmation.confirm'",
    "'data_confirmation.manage'",
    "HEU_DATA_CONFIRMATION_TASKS",
    "HEU_DATA_CONFIRMATION_TASK_STATUS_HISTORY",
    "HEU_DATA_CONFIRMATION_TASK_CENTER",
    "Production requires backup evidence, restore dry-run, signed migration order",
  ],
  "DCTC schema contract",
  sqlPath,
);

requireNoPattern(
  sql,
  /insert\s+into\s+public\.heu_data_confirmation_tasks\s*\([^)]*\)\s*values\s*\(\s*['"`]/i,
  "static real task seed",
  sqlPath,
);
requireNoPattern(
  sql,
  /auth\.admin|service_role\s*=|supabase_service_role_key|insert\s+into\s+auth\.users|create\s+user\b|send\s+email\b|smtp\s*=|password\s*=|otp\s*=/i,
  "secret/account/email operation",
  sqlPath,
);
requireNoPattern(
  sql,
  /constraint\s+heu_data_confirmation_tasks_department_valid[\s\S]*'(IT_DATA|AUDIT|BGH)'/i,
  "internal lane in DCTC task department constraint",
  sqlPath,
);
requireNoPattern(
  sql,
  /cleaned_department_code\s+not\s+in\s*\([\s\S]*'(IT_DATA|AUDIT|BGH)'/i,
  "internal lane in DCTC route department validation",
  sqlPath,
);

if (
  packageJson.scripts?.["check:heu-data-confirmation-task-center-schema"] !==
  "node scripts/check-heu-data-confirmation-task-center-schema.mjs"
) {
  failures.push(
    `${packagePath}: missing check:heu-data-confirmation-task-center-schema script`,
  );
}

requireTokens(
  inventory,
  [
    "npm.cmd run check:heu-data-confirmation-task-center-schema",
    "database/step121_data_confirmation_task_center.sql",
    "PASS_LOCAL_SCHEMA_CONTRACT",
    "heu_data_confirmation_tasks",
    "heu_data_confirmation_task_status_history",
    "heu_data_confirmation_task_center",
    "heu_data_confirmation_task_status_timeline",
    "audit_trace_ref",
    "DCTC_TASK",
    "DCTC_HISTORY",
    "route_data_confirmation_task",
    "DCTC_SOURCE_PROVENANCE_LOCK_READY",
    "source_record_label",
    "source_route",
    "data_domain",
    "dq_check_ref",
    "controlled_evidence_ref",
    "SOURCE_METADATA_REQUIRED_BEFORE_CHO_XAC_NHAN",
    "due_date_or_batch",
    "owner_decision_ref",
    "scope_gate_ref",
    "ASSIGNEE_OR_OWNER_REQUIRED",
    "DCTC_OWNER_ASSIGNEE_PAIR_LOCK_READY",
    "OWNER_AND_ASSIGNEE_REQUIRED_BEFORE_CHO_XAC_NHAN",
    "DCTC_SCOPE_GATE_REQUIRED_BEFORE_CHO_XAC_NHAN",
    "SCOPE_GATE_REF_REQUIRED_BEFORE_CHO_XAC_NHAN",
    "CONTROLLED_PILOT_DEPARTMENT_ONLY",
    "status-timeline scope columns",
    "assigned_user_id",
    "owner_user_id",
    "CHO_XAC_NHAN",
    "CONFIRM_FROM_CHO_XAC_NHAN_ONLY",
    "CONFIRM_SUBMITTER_SCOPE_LOCK",
    "REPAIR_OR_OUT_OF_SCOPE_NOTE_REQUIRED",
    "CAN_SUA and KHONG_THUOC_TOI require confirmation note",
    "KHONG_THUOC_TOI",
    "DA_KHOA",
    "DA_KHOA lock requires note and controlled evidence ref",
    "confirm_data_confirmation_task",
    "does not auto-seed real tasks",
    "import raw data",
    "production GO",
  ],
  "current-state propagation",
  inventoryPath,
);

requireTokens(
  backlog,
  [
    "P0-21",
    "Data Confirmation Task Center schema contract",
    "database/step121_data_confirmation_task_center.sql",
    "check:heu-data-confirmation-task-center-schema",
    "PASS_LOCAL_SCHEMA_CONTRACT",
    "audit_trace_ref",
    "DCTC_TASK",
    "DCTC_HISTORY",
    "route_data_confirmation_task",
    "DCTC_SOURCE_PROVENANCE_LOCK_READY",
    "source_record_label",
    "source_route",
    "data_domain",
    "dq_check_ref",
    "controlled_evidence_ref",
    "due_date_or_batch",
    "owner_decision_ref",
    "scope_gate_ref",
    "ASSIGNEE_OR_OWNER_REQUIRED",
    "DCTC_OWNER_ASSIGNEE_PAIR_LOCK_READY",
    "OWNER_AND_ASSIGNEE_REQUIRED_BEFORE_CHO_XAC_NHAN",
    "DCTC_SCOPE_GATE_REQUIRED_BEFORE_CHO_XAC_NHAN",
    "SCOPE_GATE_REF_REQUIRED_BEFORE_CHO_XAC_NHAN",
    "CONTROLLED_PILOT_DEPARTMENT_ONLY",
    "heu_data_confirmation_task_status_timeline",
    "status-timeline scope columns",
    "assigned_user_id",
    "owner_user_id",
    "CONFIRM_FROM_CHO_XAC_NHAN_ONLY",
    "CONFIRM_SUBMITTER_SCOPE_LOCK",
    "REPAIR_OR_OUT_OF_SCOPE_NOTE_REQUIRED",
    "CAN_SUA and KHONG_THUOC_TOI require confirmation note",
    "DA_KHOA lock requires note and controlled evidence ref",
    "does not auto-seed real tasks",
    "import raw data",
    "owner GO/NO-GO or production GO",
  ],
  "backlog propagation",
  backlogPath,
);

requireTokens(
  gapMatrix,
  [
    "Data Confirmation Task Center",
    "database/step121_data_confirmation_task_center.sql",
    "heu_data_confirmation_tasks",
    "route_data_confirmation_task",
    "confirm_data_confirmation_task",
    "heu_data_confirmation_task_status_timeline",
    "PASS_LOCAL_SCHEMA_CONTRACT",
    "route_data_confirmation_task",
    "DCTC_SOURCE_PROVENANCE_LOCK_READY",
    "source_record_label",
    "source_route",
    "data_domain",
    "dq_check_ref",
    "controlled_evidence_ref",
    "due_date_or_batch",
    "owner_decision_ref",
    "scope_gate_ref",
    "ASSIGNEE_OR_OWNER_REQUIRED",
    "DCTC_OWNER_ASSIGNEE_PAIR_LOCK_READY",
    "OWNER_AND_ASSIGNEE_REQUIRED_BEFORE_CHO_XAC_NHAN",
    "DCTC_SCOPE_GATE_REQUIRED_BEFORE_CHO_XAC_NHAN",
    "SCOPE_GATE_REF_REQUIRED_BEFORE_CHO_XAC_NHAN",
    "CONTROLLED_PILOT_DEPARTMENT_ONLY",
    "status-timeline scope columns",
    "assigned_user_id",
    "owner_user_id",
    "REPAIR_OR_OUT_OF_SCOPE_NOTE_REQUIRED",
    "CAN_SUA and KHONG_THUOC_TOI require confirmation note",
    "DA_KHOA lock requires note and controlled evidence ref",
    "must not auto-seed real tasks",
    "import raw data",
    "owner GO/NO-GO or production GO",
  ],
  "gap-matrix propagation",
  gapMatrixPath,
);

requireTokens(
  sqlObjectMap,
  [
    "DATA_CONFIRMATION_TASK_MASTER",
    "heu_data_confirmation_tasks",
    "heu_data_confirmation_task_status_history",
    "heu_data_confirmation_task_center",
    "heu_data_confirmation_task_status_timeline",
    "route_data_confirmation_task",
    "DCTC_SOURCE_PROVENANCE_LOCK_READY",
    "source_record_label",
    "source_route",
    "data_domain",
    "dq_check_ref",
    "controlled_evidence_ref",
    "due_date_or_batch",
    "owner_decision_ref",
    "scope_gate_ref",
    "ASSIGNEE_OR_OWNER_REQUIRED",
    "DCTC_OWNER_ASSIGNEE_PAIR_LOCK_READY",
    "OWNER_AND_ASSIGNEE_REQUIRED_BEFORE_CHO_XAC_NHAN",
    "DCTC_SCOPE_GATE_REQUIRED_BEFORE_CHO_XAC_NHAN",
    "SCOPE_GATE_REF_REQUIRED_BEFORE_CHO_XAC_NHAN",
    "CONTROLLED_PILOT_DEPARTMENT_ONLY",
    "CONFIRM_SUBMITTER_SCOPE_LOCK",
    "assigned_user_id",
    "owner_user_id",
    "CONFIRM_FROM_CHO_XAC_NHAN_ONLY",
    "status timeline scope parity",
    "Step121 DCTC schema contract",
    "PASS_LOCAL_SCHEMA_CONTRACT",
    "audit_trace_ref",
    "DCTC_TASK",
    "DCTC_HISTORY",
    "REPAIR_OR_OUT_OF_SCOPE_NOTE_REQUIRED",
    "CAN_SUA and KHONG_THUOC_TOI require confirmation note",
    "DA_KHOA lock requires note and controlled evidence ref",
    "must not auto-seed real tasks",
    "import raw data",
    "owner GO/NO-GO",
  ],
  "SQL object master map propagation",
  sqlObjectMapPath,
);

requireTokens(
  log,
  [
    "2026-07-05 - Data Confirmation Task Center Schema Contract",
    "database/step121_data_confirmation_task_center.sql",
    "check-heu-data-confirmation-task-center-schema.mjs",
    "check:heu-data-confirmation-task-center-schema",
    "PASS_LOCAL_SCHEMA_CONTRACT",
    "heu_data_confirmation_tasks",
    "heu_data_confirmation_task_status_history",
    "heu_data_confirmation_task_center",
    "heu_data_confirmation_task_status_timeline",
    "route_data_confirmation_task",
    "DCTC_SOURCE_PROVENANCE_LOCK_READY",
    "source_record_label",
    "source_route",
    "data_domain",
    "dq_check_ref",
    "controlled_evidence_ref",
    "confirm_data_confirmation_task",
    "due_date_or_batch",
    "owner_decision_ref",
    "scope_gate_ref",
    "ASSIGNEE_OR_OWNER_REQUIRED",
    "DCTC_OWNER_ASSIGNEE_PAIR_LOCK_READY",
    "OWNER_AND_ASSIGNEE_REQUIRED_BEFORE_CHO_XAC_NHAN",
    "DCTC_SCOPE_GATE_REQUIRED_BEFORE_CHO_XAC_NHAN",
    "SCOPE_GATE_REF_REQUIRED_BEFORE_CHO_XAC_NHAN",
    "CONTROLLED_PILOT_DEPARTMENT_ONLY",
    "CONFIRM_SUBMITTER_SCOPE_LOCK",
    "status-timeline scope columns",
    "assigned_user_id",
    "owner_user_id",
    "CONFIRM_FROM_CHO_XAC_NHAN_ONLY",
    "audit_trace_ref",
    "DCTC_TASK",
    "DCTC_HISTORY",
    "REPAIR_OR_OUT_OF_SCOPE_NOTE_REQUIRED",
    "CAN_SUA and KHONG_THUOC_TOI require confirmation note",
    "DA_KHOA lock requires note and controlled evidence ref",
    "does not auto-seed real tasks",
    "does not import raw data",
    "Production remains NO-GO",
  ],
  "implementation-log propagation",
  logPath,
);

if (failures.length > 0) {
  console.error("HEU Data Confirmation Task Center schema check failed.");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("HEU Data Confirmation Task Center schema check");
console.log("DCTC_SCHEMA_CONTRACT_READY: PASS_LOCAL_SCHEMA_CONTRACT");
console.log(
  "task_center_status=CHO_XAC_NHAN|DUNG|CAN_SUA|KHONG_THUOC_TOI|DA_KHOA",
);
console.log(
  "repair_out_of_scope_note_lock=REPAIR_OR_OUT_OF_SCOPE_NOTE_REQUIRED",
);
console.log(
  "source_provenance_lock=DCTC_SOURCE_PROVENANCE_LOCK_READY; route_requires=source_record_label|source_route|data_domain|dq_check_ref|controlled_evidence_ref|due_date_or_batch|owner_decision_ref",
);
console.log(
  "owner_assignee_pair_lock=DCTC_OWNER_ASSIGNEE_PAIR_LOCK_READY; route_requires=owner_user_id|assigned_user_id",
);
console.log(
  "scope_gate_route_lock=DCTC_SCOPE_GATE_REQUIRED_BEFORE_CHO_XAC_NHAN; route_requires=scope_gate_ref",
);
console.log("audit_trace_ref=DCTC_TASK|DCTC_HISTORY");
console.log(
  "Boundary: migration candidate only; no seed task, email, account, UAT/evidence acceptance, owner GO/NO-GO or production GO.",
);
