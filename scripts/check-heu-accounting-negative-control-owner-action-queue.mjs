import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const failures = [];

function fail(message) {
  failures.push(message);
}

function read(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), "utf8");
}

function requireFile(relativePath) {
  if (!existsSync(path.join(repoRoot, relativePath))) {
    fail(`Missing required file: ${relativePath}`);
  }
}

function requireIncludes(contents, token, label, file) {
  if (!contents.includes(token)) {
    fail(`${file}: missing ${label}: ${token}`);
  }
}

function requireAll(contents, tokens, label, file) {
  for (const token of tokens) {
    requireIncludes(contents, token, label, file);
  }
}

const ownerQueuePath =
  "docs/HEU_ACCOUNTING_NEGATIVE_CONTROL_OWNER_ACTION_QUEUE_20260703.md";
const breakdownPath = "docs/HEU_ACCOUNTING_MODULE_COMPLETION_BREAKDOWN_20260703.md";
const openBlockerPath =
  "docs/HEU_ACCOUNTING_OPEN_BLOCKER_ACTION_QUEUE_20260703.md";
const negativeQueueCheckPath = "scripts/check-heu-negative-control-account-queue.mjs";
const scopeRepairCheckPath =
  "scripts/check-heu-user-scope-baseline-repair-queue.mjs";
const localReadinessPath = "scripts/check-heu-accounting-local-readiness.mjs";
const packagePath = "package.json";

for (const file of [
  ownerQueuePath,
  breakdownPath,
  openBlockerPath,
  negativeQueueCheckPath,
  scopeRepairCheckPath,
  localReadinessPath,
  packagePath,
]) {
  requireFile(file);
}

const ownerQueue = read(ownerQueuePath);
const breakdown = read(breakdownPath);
const openBlocker = read(openBlockerPath);
const negativeQueueCheck = read(negativeQueueCheckPath);
const scopeRepairCheck = read(scopeRepairCheckPath);
const localReadiness = read(localReadinessPath);
const packageJson = JSON.parse(read(packagePath));

console.log("HEU accounting negative-control owner action queue check");
console.log(
  "Mode: PASS_LOCAL read-only ACCT-00 owner-action queue check. It does not create accounts, change scope, execute browser UAT, accept evidence, approve finance reliance, approve owner GO/NO-GO or mark production GO.",
);

requireAll(
  ownerQueue,
  [
    "Status: PASS_LOCAL_OWNER_ACTION_QUEUE",
    "ACCT_NEGATIVE_CONTROL_READY / NO_GO / BLOCKED",
    "Production/UAT status: NO-GO",
    "check:heu-accounting-negative-control-owner-action-queue",
    "check:heu-user-scope-baseline-repair-queue",
    "check:heu-negative-control-account-queue",
    "check:heu-accounting-module-breakdown",
    "missing_visibility=2",
    "missing_business_scope=2",
    "missing_visibility>0",
    "missing_business_scope>0",
    "ttgdtx_negative_candidates=0",
    "ttgdtx_negative_candidates>=1",
    "REAL_OUT_OF_SCOPE_NEGATIVE_01",
    "TC9_TTGDTX_LINKED",
    "ACCT-NEG-01",
    "ACCT-NEG-02",
    "ACCT-NEG-03",
    "ACCT-NEG-04",
    "ACCT-NEG-05",
    "HEU_USER_SCOPE_BASELINE_REPAIR_QUEUE_20260703.md",
    "safe_owner_repair_labels",
    "ACCT-00-PRE-UAT-OWNER-CHECKLIST",
    "source=negative_control_account_queue_runtime",
    "owner_checklist=ACCT-00_PRE_UAT",
    "required_closure=missing_visibility=0,missing_business_scope=0,ttgdtx_negative_candidates>=1,controlled_evidence_id_recorded",
    "ACCT-00-SCOPE-REPAIR-OWNER-PACKET-LOCK",
    "scope_repair_owner_packet_lock=ACCT-00_SCOPE_REPAIR_OWNER_PACKET_LOCK",
    "required_inputs=safe_owner_repair_labels_generated,owner_action_packet_generated,role_codes_recorded,decision_count_recorded,secure_owner_lookup_channel_recorded,controlled_evidence_id_recorded",
    "required_dependency_record=safe_label,role_code,owner_label_mapped,owner_lane_confirmed,secure_owner_lookup_channel_recorded,controlled_evidence_id_recorded",
    "blocked_if=safe_owner_repair_labels_missing,owner_action_packet_missing,role_codes_missing,decision_count_mismatch,owner_label_unmapped,secure_owner_lookup_channel_missing,controlled_evidence_id_missing,raw_profile_id_present",
    "next_allowed_step=ACCT-00_SCOPE_REPAIR_OWNER_DECISION_MATRIX",
    "ACCT-00-SCOPE-REPAIR-OWNER-DECISION-MATRIX",
    "scope_repair_owner_decision_matrix=ACCT-00_SCOPE_REPAIR_OWNER_DECISION_MATRIX",
    "required_owner_record=owner_label_mapped,lead_visibility_choice_recorded,business_scope_choice_recorded,owner_lane_confirmed,secure_admin_channel_recorded,controlled_evidence_id_recorded",
    "required_per_label_record=safe_label,role_code,approved_visibility_choice_when_required,approved_segment_or_partner_scope_when_required,owner_reviewer,controlled_evidence_id",
    "blocked_if=owner_label_unmapped,required_visibility_choice_missing,required_business_scope_choice_missing,secure_admin_channel_missing,controlled_evidence_id_missing",
    "next_allowed_step=ACCT-00_SCOPE_BASELINE_OWNER_DECISION",
    "ACCT-00-SCOPE-BASELINE-DECISION-CHECKLIST",
    "scope_decision_checklist=ACCT-00_SCOPE_BASELINE_OWNER_DECISION",
    "ACCT-00-SCOPE-REPAIR-DECISION-DEPENDENCY-LOCK",
    "scope_repair_decision_dependency_lock=ACCT-00_SCOPE_REPAIR_DECISION_DEPENDENCY",
    "required_inputs=scope_baseline_decision_checklist_closed,lead_visibility_choice_recorded,business_scope_choice_recorded,owner_lane_confirmed,secure_admin_channel_recorded",
    "required_dependency_record=approved_visibility_choice_recorded,approved_business_scope_recorded,owner_lane_confirmed,secure_admin_channel_recorded,controlled_evidence_id_recorded",
    "blocked_if=scope_baseline_decision_checklist_closed=no,owner_lane_confirmed=no,lead_visibility_choice_recorded=no,business_scope_choice_recorded=no,secure_admin_channel_recorded=no",
    "next_allowed_step=ACCT-00_SCOPE_REPAIR_EXECUTION",
    "ACCT-00-SCOPE-REPAIR-EXECUTION-PACKET",
    "scope_repair_execution_packet=ACCT-00_SCOPE_REPAIR_EXECUTION",
    "required_execution_record=pre_repair_snapshot_recorded,approved_visibility_choice_applied,approved_business_scope_applied,workspace_preference_verified,post_repair_snapshot_recorded,controlled_evidence_id_recorded",
    "ACCT-00-SCOPE-POST-REPAIR-RERUN-PROOF-PACKET",
    "scope_post_repair_rerun_proof_packet=ACCT-00_SCOPE_POST_REPAIR_RERUN_PROOF",
    "required_rerun_record=check_heu_user_scope_baseline_repair_queue_rerun,check_heu_negative_control_account_queue_rerun,check_heu_finance_payment_scope_readiness_rerun,check_heu_role_scope_uat_pack_rerun,check_heu_user_account_security_rerun",
    "ACCT-00-SCOPE-POST-REPAIR-VERIFICATION-PACKET",
    "scope_post_repair_verification_packet=ACCT-00_SCOPE_POST_REPAIR_VERIFICATION",
    "ACCT-00-SCOPE-EXTERNAL-CLOSURE-HANDOFF-PACKET",
    "scope_external_closure_handoff_packet=ACCT-00_SCOPE_EXTERNAL_CLOSURE_HANDOFF",
    "ACCT-00-NEGATIVE-ACCOUNT-DEPENDENCY-LOCK",
    "negative_account_dependency_lock=ACCT-00_NEGATIVE_ACCOUNT_DEPENDENCY",
    "required_inputs=scope_external_closure_handoff_closed,scope_post_repair_verification_closed,scope_baseline_closed,owner_lane_confirmed,secure_admin_channel_recorded,controlled_evidence_id_recorded",
    "required_dependency_record=scope_external_closure_handoff_closed,missing_visibility=0,missing_business_scope=0,non_admin_all_visibility=0,workspace_mismatch=0,workspace_preference_inside_scope_confirmed,negative_control_queue_re_run_recorded,controlled_evidence_id_recorded,post_repair_snapshot_recorded",
    "blocked_if=scope_external_closure_handoff_closed=no,scope_baseline_closed=no,missing_visibility>0,missing_business_scope>0,non_admin_all_visibility>0,workspace_mismatch>0",
    "ACCT-00-NEGATIVE-ACCOUNT-PROVISIONING-CHECKLIST",
    "negative_account_checklist=ACCT-00_NEGATIVE_ACCOUNT_PROVISIONING",
    "ACCT-00-NEGATIVE-ACCOUNT-EXECUTION-PACKET",
    "negative_account_execution_packet=ACCT-00_NEGATIVE_ACCOUNT_EXECUTION",
    "blocked_if=negative_account_dependency_lock_closed=no,scope_baseline_closed=no,missing_visibility>0,missing_business_scope>0",
    "ACCT-00-NEGATIVE-ACCOUNT-POST-EXECUTION-VERIFICATION-PACKET",
    "negative_account_post_execution_verification_packet=ACCT-00_NEGATIVE_ACCOUNT_POST_EXECUTION_VERIFICATION",
    "ACCT-00-NEGATIVE-BROWSER-EVIDENCE-DEPENDENCY-LOCK",
    "negative_browser_evidence_dependency_lock=ACCT-00_NEGATIVE_BROWSER_EVIDENCE_DEPENDENCY",
    "blocked_if=negative_account_ready=no,ttgdtx_negative_candidates=0,scope_baseline_closed=no,missing_visibility>0,missing_business_scope>0",
    "ACCT-00-NEGATIVE-CONTROL-EVIDENCE-CHECKLIST",
    "negative_evidence_checklist=ACCT-00_NEGATIVE_BROWSER_DENIAL",
    "ACCT-00-NEGATIVE-BROWSER-ROUTE-MATRIX",
    "negative_route_matrix=ACCT-00_NEGATIVE_BROWSER_ROUTES",
    "required_routes=lead,finance,evidence,audit,settings",
    "ACCT-00-NEGATIVE-CONTROL-FINAL-PROOF-DECISION-PACKET",
    "negative_control_final_proof_decision_packet=ACCT-00_NEGATIVE_CONTROL_FINAL_PROOF_DECISION",
    "allowed_decision_values=PASS,NO_GO,BLOCKED",
    "ACCT-00-OWNER-EXTERNAL-CLOSURE-HANDOFF-PACKET",
    "owner_external_closure_handoff_packet=ACCT-00_OWNER_EXTERNAL_CLOSURE_HANDOFF",
    "next_allowed_step=ACCT-12_NEGATIVE_CONTROL_PROOF_DEPENDENCY",
    "controlled_evidence_id_recorded",
    "reviewer_recorded",
    "route_result_recorded",
    "owner_decision_recorded",
    "blocker_state_recorded",
    "no_raw_profile_id=true",
    "no_raw_account_id=true",
    "no_raw_screenshot_or_pii=true",
    "no_password_or_invite_link=true",
    "no_service_role_key_in_evidence=true",
    "no_auto_scope_change=true",
    "no_auto_account_create=true",
    "no_auto_scope_grant=true",
    "no_evidence_acceptance=true",
    "no_uat_pass_inference=true",
    "no_finance_reliance_inference=true",
    "no_owner_go_inference=true",
    "no_auto_production_go=true",
  ],
  "owner-action queue contract",
  ownerQueuePath,
);

requireAll(
  breakdown,
  [
    "HEU_ACCOUNTING_NEGATIVE_CONTROL_OWNER_ACTION_QUEUE_20260703.md",
    "npm.cmd run check:heu-accounting-negative-control-owner-action-queue",
    "ACCT_NEGATIVE_CONTROL_READY / NO_GO / BLOCKED",
    "ACCT-00 negative-control owner-action queue coverage",
  ],
  "breakdown linkage",
  breakdownPath,
);

requireAll(
  openBlocker,
  [
    "HEU_ACCOUNTING_NEGATIVE_CONTROL_OWNER_ACTION_QUEUE_20260703.md",
    "check:heu-accounting-negative-control-owner-action-queue",
    "ACCT-00 negative-control owner-action queue",
  ],
  "open-blocker linkage",
  openBlockerPath,
);

requireAll(
  negativeQueueCheck,
  [
    "formatNegativeOwnerActionPacket",
    "source=negative_control_account_queue_runtime",
    "ACCT-00-NEGATIVE-ACCOUNT-DEPENDENCY-LOCK",
    "ACCT-00-NEGATIVE-BROWSER-EVIDENCE-DEPENDENCY-LOCK",
    "ACCT-00-OWNER-EXTERNAL-CLOSURE-HANDOFF-PACKET",
  ],
  "negative-control source checks",
  negativeQueueCheckPath,
);

requireAll(
  scopeRepairCheck,
  [
    "ACCT-00-SCOPE-REPAIR-OWNER-PACKET-LOCK",
    "ACCT-00-SCOPE-REPAIR-OWNER-DECISION-MATRIX",
    "ACCT-00-SCOPE-BASELINE-DECISION-CHECKLIST",
    "ACCT-00-SCOPE-EXTERNAL-CLOSURE-HANDOFF-PACKET",
  ],
  "scope-repair source checks",
  scopeRepairCheckPath,
);

requireAll(
  localReadiness,
  [
    "check:heu-accounting-negative-control-owner-action-queue",
    "ACCT-00 negative-control owner-action queue is packaged around the live scope and negative-account blockers",
  ],
  "local-readiness linkage",
  localReadinessPath,
);

if (
  packageJson.scripts?.["check:heu-accounting-negative-control-owner-action-queue"] !==
  "node scripts/check-heu-accounting-negative-control-owner-action-queue.mjs"
) {
  fail(`${packagePath}: missing script check:heu-accounting-negative-control-owner-action-queue`);
}

if (failures.length > 0) {
  console.error("HEU accounting negative-control owner action queue check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(
  "HEU accounting negative-control owner action queue check passed. ACCT-00 owner-action routing is packaged; live scope/account/evidence blockers remain external NO-GO conditions.",
);
