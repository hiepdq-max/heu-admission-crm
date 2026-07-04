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

function tableRows(contents, prefix) {
  return contents
    .split(/\r?\n/)
    .filter((line) => line.trim().startsWith(`| ${prefix}`));
}

const queuePath = "docs/HEU_ACCOUNTING_OPEN_BLOCKER_ACTION_QUEUE_20260703.md";
const breakdownPath = "docs/HEU_ACCOUNTING_MODULE_COMPLETION_BREAKDOWN_20260703.md";
const readinessPath = "scripts/check-heu-accounting-local-readiness.mjs";
const moduleBreakdownCheckPath =
  "scripts/check-heu-accounting-module-breakdown.mjs";
const packagePath = "package.json";

for (const file of [
  queuePath,
  breakdownPath,
  readinessPath,
  moduleBreakdownCheckPath,
  packagePath,
]) {
  requireFile(file);
}

const queue = read(queuePath);
const breakdown = read(breakdownPath);
const readiness = read(readinessPath);
const moduleBreakdownCheck = read(moduleBreakdownCheckPath);
const packageJson = JSON.parse(read(packagePath));

console.log("HEU accounting open blocker action queue check");
console.log(
  "Mode: PASS_LOCAL read-only blocker queue check. It does not create accounts, execute UAT, accept evidence, approve finance reliance, approve owner GO/NO-GO or mark production GO.",
);

requireAll(
  queue,
  [
    "Status: PASS_LOCAL_OPEN_BLOCKER_QUEUE",
    "ACCT_OPEN_BLOCKER_ACTION_READY / NO_GO / BLOCKED",
    "Production/UAT status: NO-GO",
    "check:heu-accounting-local-readiness",
    "check:heu-user-scope-baseline-repair-queue",
    "check:heu-negative-control-account-queue",
    "check:heu-accounting-negative-control-owner-action-queue",
    "check:heu-accounting-risk-closure-ledger",
    "check:heu-accounting-owner-closure-ledger",
    "check:heu-accounting-open-blocker-action-queue",
    "ACCT-BLOCKER-01",
    "ACCT-BLOCKER-02",
    "ACCT-BLOCKER-03",
    "ACCT-BLOCKER-04",
    "missing_visibility=2",
    "missing_business_scope=2",
    "missing_visibility>0",
    "missing_business_scope>0",
    "lead_visibility:c02dbcb7c7:TCHC_LEAD",
    "lead_visibility:c709df4313:DAO_TAO_LEAD",
    "business_scope:66f945b0fb:TCHC_LEAD",
    "business_scope:ebb9e255bd:DAO_TAO_LEAD",
    "ttgdtx_negative_candidates=0",
    "ttgdtx_negative_candidates>=1",
    "ACCT-00 negative-control owner-action queue",
    "NEGATIVE-CONTROL-OWNER-PACKET",
    "ACCT-00-PRE-UAT-OWNER-CHECKLIST",
    "source=negative_control_account_queue_runtime",
    "ACCT-00-SCOPE-REPAIR-OWNER-PACKET-LOCK",
    "ACCT-00-SCOPE-REPAIR-OWNER-DECISION-MATRIX",
    "ACCT-00-SCOPE-BASELINE-DECISION-CHECKLIST",
    "ACCT-00-SCOPE-REPAIR-EXECUTION-PACKET",
    "ACCT-00-SCOPE-POST-REPAIR-VERIFICATION-PACKET",
    "ACCT-00-SCOPE-EXTERNAL-CLOSURE-HANDOFF-PACKET",
    "ACCT-00-NEGATIVE-ACCOUNT-PROVISIONING-CHECKLIST",
    "ACCT-00-NEGATIVE-ACCOUNT-EXECUTION-PACKET",
    "ACCT-00-NEGATIVE-ACCOUNT-POST-EXECUTION-VERIFICATION-PACKET",
    "ACCT-00-NEGATIVE-CONTROL-EVIDENCE-CHECKLIST",
    "ACCT-00-NEGATIVE-BROWSER-ROUTE-MATRIX",
    "ACCT-00-NEGATIVE-CONTROL-FINAL-PROOF-DECISION-PACKET",
    "owner_action_packet=target_account_label=REAL_OUT_OF_SCOPE_NEGATIVE_01",
    "owner_checklist=ACCT-00_PRE_UAT",
    "scope_repair_owner_packet_lock=ACCT-00_SCOPE_REPAIR_OWNER_PACKET_LOCK",
    "required_inputs=safe_owner_repair_labels_generated,owner_action_packet_generated,role_codes_recorded,decision_count_recorded,secure_owner_lookup_channel_recorded,controlled_evidence_id_recorded",
    "required_dependency_record=safe_label,role_code,owner_label_mapped,owner_lane_confirmed,secure_owner_lookup_channel_recorded,controlled_evidence_id_recorded",
    "blocked_if=safe_owner_repair_labels_missing,owner_action_packet_missing,role_codes_missing,decision_count_mismatch,owner_label_unmapped,secure_owner_lookup_channel_missing,controlled_evidence_id_missing,raw_profile_id_present",
    "next_allowed_step=ACCT-00_SCOPE_REPAIR_OWNER_DECISION_MATRIX",
    "scope_repair_owner_decision_matrix=ACCT-00_SCOPE_REPAIR_OWNER_DECISION_MATRIX",
    "profile_count=2",
    "decision_count=4",
    "required_owner_record=owner_label_mapped,lead_visibility_choice_recorded,business_scope_choice_recorded,owner_lane_confirmed,secure_admin_channel_recorded,controlled_evidence_id_recorded",
    "required_per_label_record=safe_label,role_code,approved_visibility_choice_when_required,approved_segment_or_partner_scope_when_required,owner_reviewer,controlled_evidence_id",
    "blocked_if=owner_label_unmapped,required_visibility_choice_missing,required_business_scope_choice_missing,secure_admin_channel_missing,controlled_evidence_id_missing",
    "next_allowed_step=ACCT-00_SCOPE_BASELINE_OWNER_DECISION",
    "scope_decision_checklist=ACCT-00_SCOPE_BASELINE_OWNER_DECISION",
    "scope_repair_execution_packet=ACCT-00_SCOPE_REPAIR_EXECUTION",
    "required_closure=lead_visibility_choice_recorded,business_scope_choice_recorded,owner_lane_confirmed,secure_admin_channel_recorded,post_repair_snapshot_recorded",
    "ACCT-00-SCOPE-REPAIR-DECISION-DEPENDENCY-LOCK",
    "scope_repair_decision_dependency_lock=ACCT-00_SCOPE_REPAIR_DECISION_DEPENDENCY",
    "required_inputs=scope_baseline_decision_checklist_closed,lead_visibility_choice_recorded,business_scope_choice_recorded,owner_lane_confirmed,secure_admin_channel_recorded",
    "required_dependency_record=approved_visibility_choice_recorded,approved_business_scope_recorded,owner_lane_confirmed,secure_admin_channel_recorded,controlled_evidence_id_recorded",
    "blocked_if=scope_baseline_decision_checklist_closed=no,owner_lane_confirmed=no,lead_visibility_choice_recorded=no,business_scope_choice_recorded=no,secure_admin_channel_recorded=no",
    "next_allowed_step=ACCT-00_SCOPE_REPAIR_EXECUTION",
    "required_execution_record=pre_repair_snapshot_recorded,approved_visibility_choice_applied,approved_business_scope_applied,workspace_preference_verified,post_repair_snapshot_recorded,controlled_evidence_id_recorded",
    "ACCT-00-SCOPE-POST-REPAIR-RERUN-PROOF-PACKET",
    "scope_post_repair_rerun_proof_packet=ACCT-00_SCOPE_POST_REPAIR_RERUN_PROOF",
    "required_inputs=scope_repair_execution_closed,post_repair_snapshot_recorded,controlled_evidence_id_recorded,owner_lane_confirmed",
    "required_rerun_record=check_heu_user_scope_baseline_repair_queue_rerun,check_heu_negative_control_account_queue_rerun,check_heu_finance_payment_scope_readiness_rerun,check_heu_role_scope_uat_pack_rerun,check_heu_user_account_security_rerun",
    "required_result_record=missing_visibility=0,missing_business_scope=0,non_admin_all_visibility=0,workspace_mismatch=0,ttgdtx_negative_candidates_recomputed,finance_payment_scope_ready_recorded,role_scope_pack_passed,controlled_evidence_id_recorded",
    "blocked_if=scope_baseline_closed=no,post_repair_snapshot_recorded=no,controlled_evidence_id_recorded=no,negative_control_queue_re_run_recorded=no",
    "next_allowed_step=ACCT-00_SCOPE_POST_REPAIR_VERIFICATION",
    "scope_post_repair_verification_packet=ACCT-00_SCOPE_POST_REPAIR_VERIFICATION",
    "scope_baseline_closed=no",
    "required_inputs=scope_repair_execution_closed,post_repair_snapshot_recorded,controlled_evidence_id_recorded",
    "required_verification_record=missing_visibility=0,missing_business_scope=0,non_admin_all_visibility=0,workspace_mismatch=0,workspace_preference_inside_scope_confirmed,negative_control_queue_re_run_recorded,controlled_evidence_id_recorded",
    "next_allowed_step=ACCT-00_SCOPE_EXTERNAL_CLOSURE_HANDOFF",
    "scope_external_closure_handoff_packet=ACCT-00_SCOPE_EXTERNAL_CLOSURE_HANDOFF",
    "required_inputs=scope_baseline_decision_checklist_closed,scope_repair_execution_closed,scope_post_repair_rerun_proof_closed,scope_post_repair_verification_closed,controlled_evidence_id_recorded,owner_lane_confirmed",
    "required_owner_closure=missing_visibility=0,missing_business_scope=0,non_admin_all_visibility=0,workspace_mismatch=0,lead_visibility_choice_recorded,business_scope_choice_recorded,approved_visibility_choice_applied,approved_business_scope_applied,workspace_preference_inside_scope_confirmed,post_repair_snapshot_recorded,negative_control_queue_re_run_recorded,controlled_evidence_id_recorded",
    "blocked_if=scope_baseline_closed=no,missing_visibility>0,missing_business_scope>0,non_admin_all_visibility>0,workspace_mismatch>0,controlled_evidence_id_recorded=no",
    "next_allowed_step=ACCT-00_NEGATIVE_ACCOUNT_DEPENDENCY",
    "ACCT-00-NEGATIVE-ACCOUNT-DEPENDENCY-LOCK",
    "negative_account_dependency_lock=ACCT-00_NEGATIVE_ACCOUNT_DEPENDENCY",
    "required_inputs=scope_external_closure_handoff_closed,scope_post_repair_verification_closed,scope_baseline_closed,owner_lane_confirmed,secure_admin_channel_recorded,controlled_evidence_id_recorded",
    "required_dependency_record=scope_external_closure_handoff_closed,missing_visibility=0,missing_business_scope=0,non_admin_all_visibility=0,workspace_mismatch=0,workspace_preference_inside_scope_confirmed,negative_control_queue_re_run_recorded,controlled_evidence_id_recorded,post_repair_snapshot_recorded",
    "blocked_if=scope_external_closure_handoff_closed=no,scope_baseline_closed=no,missing_visibility>0,missing_business_scope>0,non_admin_all_visibility>0,workspace_mismatch>0",
    "lead_visibility_choice_recorded",
    "business_scope_choice_recorded",
    "secure_admin_channel_recorded",
    "pre_repair_snapshot_recorded",
    "approved_visibility_choice_applied",
    "approved_business_scope_applied",
    "workspace_preference_verified",
    "workspace_preference_inside_scope_confirmed",
    "negative_control_queue_re_run_recorded",
    "post_repair_snapshot_recorded",
    "negative_evidence_checklist=ACCT-00_NEGATIVE_BROWSER_DENIAL",
    "negative_account_checklist=ACCT-00_NEGATIVE_ACCOUNT_PROVISIONING",
    "negative_account_execution_packet=ACCT-00_NEGATIVE_ACCOUNT_EXECUTION",
    "negative_account_post_execution_verification_packet=ACCT-00_NEGATIVE_ACCOUNT_POST_EXECUTION_VERIFICATION",
    "negative_account_ready=no",
    "ACCT-00-NEGATIVE-BROWSER-EVIDENCE-DEPENDENCY-LOCK",
    "negative_browser_evidence_dependency_lock=ACCT-00_NEGATIVE_BROWSER_EVIDENCE_DEPENDENCY",
    "required_inputs=negative_account_post_execution_verification_closed,negative_account_ready,controlled_evidence_id_recorded,reviewer_recorded,owner_lane_confirmed",
    "required_dependency_record=ttgdtx_negative_candidates>=1,negative_account_label_recorded,auth_profile_link_verified,non_target_business_scope_verified,target_segment_exclusion_verified,lead_visibility_non_all_verified,settings_permission_denial_ready,controlled_evidence_id_recorded",
    "blocked_if=negative_account_ready=no,ttgdtx_negative_candidates=0,scope_baseline_closed=no,missing_visibility>0,missing_business_scope>0",
    "negative_route_matrix=ACCT-00_NEGATIVE_BROWSER_ROUTES",
    "negative_control_final_proof_decision_packet=ACCT-00_NEGATIVE_CONTROL_FINAL_PROOF_DECISION",
    "negative_control_proof_ready=no",
    "required_closure=target_account_label_recorded,non_target_business_scope_recorded,target_segment_exclusion_recorded,credential_boundary_acknowledged,controlled_evidence_id_recorded",
    "required_inputs=negative_account_dependency_lock_closed,provisioning_decision_closed,target_account_label_recorded,secure_admin_channel_recorded",
    "blocked_if=negative_account_dependency_lock_closed=no,scope_baseline_closed=no,missing_visibility>0,missing_business_scope>0",
    "required_execution_record=auth_profile_link_recorded,non_target_business_scope_applied,target_segment_exclusion_verified,lead_visibility_non_all_verified,settings_permission_denial_ready,credential_boundary_acknowledged,controlled_evidence_id_recorded",
    "required_inputs=negative_account_execution_closed,auth_profile_link_recorded,non_target_business_scope_applied,target_segment_exclusion_verified,controlled_evidence_id_recorded",
    "required_verification_record=ttgdtx_negative_candidates>=1,negative_account_label_recorded,auth_profile_link_verified,non_target_business_scope_verified,target_segment_exclusion_verified,lead_visibility_non_all_verified,settings_permission_denial_ready,controlled_evidence_id_recorded",
    "next_allowed_step=ACCT-00_NEGATIVE_BROWSER_DENIAL",
    "auth_profile_link_recorded",
    "auth_profile_link_verified",
    "negative_account_label_recorded",
    "non_target_business_scope_verified",
    "target_account_label_recorded",
    "non_target_business_scope_recorded",
    "non_target_business_scope_applied",
    "target_segment_exclusion_recorded",
    "target_segment_exclusion_verified",
    "lead_visibility_non_all_verified",
    "settings_permission_denial_ready",
    "credential_boundary_acknowledged",
    "required_result=BLOCKED_OR_EMPTY_SCOPED_STATE",
    "expected_result=BLOCKED_OR_EMPTY_SCOPED_STATE",
    "route_count=5",
    "required_routes=lead,finance,evidence,audit,settings",
    "required_closure=lead_route_denial_recorded,finance_route_denial_recorded,evidence_route_denial_recorded,audit_route_denial_recorded,settings_route_denial_recorded,controlled_evidence_id_recorded,reviewer_recorded,owner_decision_recorded",
    "required_inputs=negative_browser_denial_closed,negative_browser_route_matrix_closed,controlled_evidence_id_recorded,reviewer_recorded,owner_decision_recorded",
    "required_decision_record=negative_control_proof_decision_recorded,lead_route_denial_recorded,finance_route_denial_recorded,evidence_route_denial_recorded,audit_route_denial_recorded,settings_route_denial_recorded,controlled_evidence_id_recorded,reviewer_recorded,owner_decision_recorded,blocker_state_recorded",
    "allowed_decision_values=PASS,NO_GO,BLOCKED",
    "next_allowed_step=ACCT-12_SIGNED_ROUTE_EVIDENCE_INTAKE",
    "ACCT-00-OWNER-EXTERNAL-CLOSURE-HANDOFF-PACKET",
    "owner_external_closure_handoff_packet=ACCT-00_OWNER_EXTERNAL_CLOSURE_HANDOFF",
    "required_inputs=scope_post_repair_verification_closed,negative_account_post_execution_verification_closed,negative_browser_denial_closed,negative_control_final_proof_decision_recorded,controlled_evidence_id_recorded,owner_lane_confirmed",
    "required_owner_closure=missing_visibility=0,missing_business_scope=0,non_admin_all_visibility=0,workspace_mismatch=0,ttgdtx_negative_candidates>=1,negative_control_proof_decision_recorded,lead_route_denial_recorded,finance_route_denial_recorded,evidence_route_denial_recorded,audit_route_denial_recorded,settings_route_denial_recorded,blocker_state_recorded,controlled_evidence_id_recorded",
    "blocked_if=missing_visibility>0,missing_business_scope>0,ttgdtx_negative_candidates=0,negative_control_proof_ready=no,controlled_evidence_id_recorded=no",
    "next_allowed_step=ACCT-12_NEGATIVE_CONTROL_PROOF_DEPENDENCY",
    "negative_control_proof_decision_recorded",
    "blocker_state_recorded",
    "no_all_visibility_for_non_admin=true",
    "no_raw_profile_id=true",
    "no_service_role_key_in_evidence=true",
    "no_raw_account_id=true",
    "no_ttgdtx_scope=true",
    "no_settings_or_permission_access=true",
    "no_browser_uat_execution=true",
    "controlled_evidence_id_recorded",
    "reviewer_recorded",
    "route_result_recorded",
    "lead_route_denial_recorded",
    "finance_route_denial_recorded",
    "evidence_route_denial_recorded",
    "audit_route_denial_recorded",
    "settings_route_denial_recorded",
    "owner_decision_recorded",
    "no_raw_screenshot_or_pii=true",
    "no_password_or_invite_link=true",
    "no_evidence_acceptance=true",
    "no_uat_pass_inference=true",
    "no_finance_reliance_inference=true",
    "no_owner_go_inference=true",
    "no_auto_acceptance=true",
    "no_auto_scope_change=true",
    "no_auto_account_create=true",
    "no_auto_scope_grant=true",
    "no_auto_fix=true",
    "REAL_OUT_OF_SCOPE_NEGATIVE_01",
    "TC9_TTGDTX_LINKED",
    "pending_external_evidence=9",
    "pending_owner=15",
    "pending_risk_external_evidence=9",
    "pending_risk_owner=9",
    "ACCT-11-RISK-OWNER-PACKET",
    "ACCT-11-RISK-EVIDENCE-INTAKE-CHECKLIST",
    "ACCT-11-AUDIT-TRACE-CLOSURE-CHECKLIST",
    "ACCT-11-BACKUP-RESTORE-PROOF-CHECKLIST",
    "ACCT-11-MIGRATION-ORDER-SIGNOFF-CHECKLIST",
    "ACCT-11-ROLLBACK-REDACTION-PROOF-CHECKLIST",
    "ACCT-11-RISK-FINAL-DECISION-CHECKLIST",
    "owner_action_packet=ACCT-11_RISK_CLOSURE",
    "risk_evidence_checklist=ACCT-11_EVIDENCE_INTAKE",
    "audit_trace_checklist=ACCT-11_AUDIT_TRACE_CLOSURE",
    "required_inputs=ttgdtx_write_trigger_coverage_confirmed,audit_trace_ui_confirmed,acceptance_matrix_reviewed,decision_manifest_reviewed",
    "required_closure=audit_log_trigger_coverage_recorded,sampled_actor_recorded,sampled_entity_recorded,sampled_action_recorded,sampled_timestamp_recorded,before_after_usefulness_recorded,controlled_evidence_ids_recorded,owner_quorum_recorded",
    "audit_log_trigger_coverage_recorded",
    "sampled_actor_recorded",
    "sampled_entity_recorded",
    "sampled_action_recorded",
    "sampled_timestamp_recorded",
    "before_after_usefulness_recorded",
    "no_raw_audit_payload=true",
    "no_audit_log_mutation=true",
    "ACCT-11-HARD-DELETE-CASCADE-CLOSURE-CHECKLIST",
    "hard_delete_cascade_checklist=ACCT-11_HARD_DELETE_CASCADE_CLOSURE",
    "required_inputs=audit_trace_closed,p6_06_boundary_guard_passed,cascade_finding_register_reviewed,conversion_or_waiver_path_identified",
    "required_closure=ttgdtx_hard_delete_boundary_recorded,p6_06_findings_triaged,conversion_or_written_waiver_recorded,protected_record_retention_recorded,cascade_execution_blocked,controlled_evidence_ids_recorded,owner_quorum_recorded",
    "ttgdtx_hard_delete_boundary_recorded",
    "p6_06_findings_triaged",
    "conversion_or_written_waiver_recorded",
    "protected_record_retention_recorded",
    "cascade_execution_blocked",
    "backup_restore_checklist=ACCT-11_BACKUP_RESTORE_PROOF",
    "required_inputs=audit_trace_closed,hard_delete_boundary_closed,restore_target_identified,rollback_redaction_path_defined",
    "required_closure=backup_id_recorded,restore_target_recorded,target_isolation_recorded,restore_smoke_check_recorded,controlled_evidence_ids_recorded,owner_quorum_recorded",
    "backup_id_recorded",
    "restore_target_recorded",
    "target_isolation_recorded",
    "restore_smoke_check_recorded",
    "no_migration_approval=true",
    "migration_order_checklist=ACCT-11_MIGRATION_ORDER_SIGNOFF",
    "required_inputs=backup_restore_proof_closed,audit_trace_closed,hard_delete_boundary_closed,rollback_redaction_path_defined",
    "required_closure=step90_step110_order_signed,signer_authority_recorded,migration_scope_recorded,exception_decisions_recorded,rollback_note_recorded,controlled_evidence_ids_recorded,owner_quorum_recorded",
    "step90_step110_order_signed",
    "signer_authority_recorded",
    "migration_scope_recorded",
    "exception_decisions_recorded",
    "rollback_note_recorded",
    "no_migration_execution=true",
    "rollback_redaction_checklist=ACCT-11_ROLLBACK_REDACTION_PROOF",
    "required_inputs=backup_restore_proof_closed,migration_order_signed,audit_trace_closed,protected_evidence_identified",
    "required_closure=rollback_path_recorded,redaction_path_recorded,protected_evidence_retained,audit_history_retained,cleanup_scope_recorded,controlled_evidence_ids_recorded,owner_quorum_recorded",
    "rollback_path_recorded",
    "redaction_path_recorded",
    "protected_evidence_retained",
    "audit_history_retained",
    "cleanup_scope_recorded",
    "no_hard_delete_execution=true",
    "no_cascade_execution=true",
    "no_evidence_destruction=true",
    "ACCT-11-FINAL-RISK-DEPENDENCY-LOCK",
    "final_risk_dependency_lock=ACCT-11_FINAL_RISK_DEPENDENCY",
    "required_inputs=audit_trace_closed,hard_delete_cascade_closed,backup_restore_proof_closed,migration_order_signed,rollback_redaction_proof_closed,controlled_evidence_ids_recorded,owner_quorum_recorded",
    "required_dependency_record=audit_log_trigger_coverage_recorded,p6_06_findings_triaged,backup_id_recorded,restore_smoke_check_recorded,step90_step110_order_signed,rollback_path_recorded,redaction_path_recorded,protected_evidence_retained,controlled_evidence_ids_recorded,owner_quorum_recorded",
    "blocked_if=audit_trace_closed=no,hard_delete_cascade_closed=no,backup_restore_proof_closed=no,migration_order_signed=no,rollback_redaction_proof_closed=no,controlled_evidence_ids_recorded=no,owner_quorum_recorded=no",
    "next_allowed_step=ACCT-11_FINAL_RISK_DECISION",
    "risk_decision_checklist=ACCT-11_FINAL_RISK_DECISION",
    "ACCT-11-FINAL-RISK-DECISION-PACKET",
    "final_risk_decision_packet=ACCT-11_FINAL_RISK_DECISION_PACKET",
    "required_inputs=audit_trace_closed,hard_delete_cascade_closed,backup_restore_proof_closed,migration_order_signed,rollback_redaction_proof_closed,controlled_evidence_ids_recorded",
    "allowed_decision_values=PASS,NO_GO,BLOCKED",
    "required_decision_record=final_risk_decision_recorded,owner_quorum_recorded,residual_risk_statement_recorded,waiver_or_correction_recorded,boundary_acknowledged,controlled_evidence_ids_recorded",
    "ACCT-11-RISK-EXTERNAL-EVIDENCE-HANDOFF-PACKET",
    "risk_external_evidence_handoff_packet=ACCT-11_RISK_EXTERNAL_EVIDENCE_HANDOFF",
    "source=accounting_risk_closure_ledger_runtime",
    "risk_closure_ready=no",
    "required_inputs=audit_trace_closed,hard_delete_cascade_closed,backup_restore_proof_closed,migration_order_signed,rollback_redaction_proof_closed,final_risk_decision_recorded,owner_quorum_recorded,controlled_evidence_ids_recorded",
    "required_owner_closure=pending_risk_external_evidence=0,pending_risk_owner=0,pending_acceptance_owner=0,audit_log_trigger_coverage_recorded,p6_06_findings_triaged,backup_id_recorded,restore_smoke_check_recorded,step90_step110_order_signed,rollback_path_recorded,redaction_path_recorded,protected_evidence_retained,final_risk_decision_recorded,owner_quorum_recorded,controlled_evidence_ids_recorded",
    "blocked_if=pending_risk_external_evidence>0,pending_risk_owner>0,pending_acceptance_owner>0,final_risk_decision_recorded=no,owner_quorum_recorded=no,controlled_evidence_ids_recorded=no",
    "next_allowed_step=ACCT-12_FINANCE_RELIANCE_DEPENDENCY",
    "final_risk_decision_recorded",
    "residual_risk_statement_recorded",
    "owner_quorum_recorded",
    "waiver_or_correction_recorded",
    "boundary_acknowledged",
    "no_owner_waiver_inference=true",
    "no_evidence_acceptance=true",
    "no_finance_reliance_inference=true",
    "no_uat_pass_inference=true",
    "no_owner_go_inference=true",
    "no_auto_migration_approval=true",
    "no_auto_production_go=true",
    "controlled_evidence_ids_recorded",
    "no_raw_backup_or_database_export=true",
    "no_auto_acceptance=true",
    "pending_external_evidence=11",
    "pending_owner=17",
    "pending_route_external_evidence=11",
    "pending_route_owner=11",
    "pending_acceptance_owner=6",
    "ACCT-12-OWNER-UAT-ROUTE-CHECKLIST",
    "owner_route_checklist=ACCT-12_OWNER_UAT_ROUTE",
    "ACCT-12-NEGATIVE-CONTROL-PROOF-DEPENDENCY-LOCK",
    "negative_control_proof_dependency_lock=ACCT-12_NEGATIVE_CONTROL_PROOF_DEPENDENCY",
    "required_inputs=ACCT-00_SCOPE_EXTERNAL_CLOSURE_HANDOFF_closed,negative_control_final_proof_decision_packet_closed,negative_control_proof_decision_recorded,controlled_evidence_id_recorded,reviewer_recorded,owner_decision_recorded,blocker_state_recorded",
    "required_dependency_record=ACCT-00_SCOPE_EXTERNAL_CLOSURE_HANDOFF_closed,ACCT-00_NEGATIVE_CONTROL_FINAL_PROOF_DECISION_closed,scope_baseline_closed,negative_control_proof_ready_verified,lead_route_denial_recorded,finance_route_denial_recorded,evidence_route_denial_recorded,audit_route_denial_recorded,settings_route_denial_recorded,linked_signed_route_evidence_packet_recorded",
    "blocked_if=ACCT-00_SCOPE_EXTERNAL_CLOSURE_HANDOFF_closed=no,scope_baseline_closed=no,negative_control_proof_ready=no,ttgdtx_negative_candidates=0,missing_visibility>0,missing_business_scope>0",
    "next_allowed_step=ACCT-12_SIGNED_ROUTE_EVIDENCE_INTAKE",
    "negative_control_final_proof_decision_packet_closed",
    "negative_control_proof_ready_verified",
    "linked_signed_route_evidence_packet_recorded",
    "ACCT-12-SIGNED-ROUTE-EVIDENCE-INTAKE-PACKET",
    "signed_route_evidence_packet=ACCT-12_SIGNED_ROUTE_EVIDENCE_INTAKE",
    "source=accounting_owner_closure_ledger_runtime",
    "required_inputs=negative_control_proof_closed,route_execution_log_reviewed,controlled_evidence_storage_confirmed,owner_lane_confirmed",
    "required_route_record=uat_route_id_recorded,controlled_evidence_id_recorded,redaction_reviewer_recorded,route_result_recorded,route_owner_signature_recorded,linked_acceptance_item_recorded,blocker_state_recorded",
    "uat_route_id_recorded",
    "redaction_reviewer_recorded",
    "route_owner_signature_recorded",
    "linked_acceptance_item_recorded",
    "blocker_state_recorded",
    "ACCT-12-FINANCE-RELIANCE-DEPENDENCY-LOCK",
    "finance_reliance_dependency_lock=ACCT-12_FINANCE_RELIANCE_DEPENDENCY",
    "source=accounting_owner_closure_ledger_runtime",
    "required_inputs=signed_route_evidence_closed,negative_control_dependency_closed,legal_finance_gate_signed,no_duplicate_ledger_signed,risk_closure_signed,dashboard_finance_desk_signed,access_closure_route_recorded",
    "required_dependency_record=signed_route_evidence_packet_closed,negative_control_proof_dependency_lock_closed,p0_19_legal_finance_gate_signed,no_duplicate_ledger_signed,final_risk_decision_packet_closed,dashboard_finance_desk_signed,access_closure_route_recorded",
    "blocked_if=signed_route_evidence_closed=no,negative_control_proof_ready=no,legal_finance_gate_signed=no,no_duplicate_ledger_signed=no,risk_closure_signed=no,dashboard_finance_desk_signed=no,access_closure_route_recorded=no",
    "next_allowed_step=ACCT-12_FINANCE_RELIANCE_DECISION",
    "signed_route_evidence_packet_closed",
    "negative_control_proof_dependency_lock_closed",
    "p0_19_legal_finance_gate_signed",
    "no_duplicate_ledger_signed",
    "final_risk_decision_packet_closed",
    "dashboard_finance_desk_signed",
    "access_closure_route_recorded",
    "ACCT-12-FINANCE-RELIANCE-DECISION-CHECKLIST",
    "finance_reliance_checklist=ACCT-12_FINANCE_RELIANCE_DECISION",
    "required_inputs=scope_negative_control_closed,legal_finance_gate_signed,no_duplicate_ledger_signed,risk_closure_signed,dashboard_finance_desk_signed,access_closure_recorded",
    "required_closure=finance_reliance_decision_recorded,finance_owner_recorded,accountant_access_decision_recorded,controlled_evidence_ids_recorded,owner_quorum_recorded",
    "finance_owner_recorded",
    "accountant_access_decision_recorded",
    "ACCT-12-ACCESS-CLOSURE-DEPENDENCY-LOCK",
    "access_closure_dependency_lock=ACCT-12_ACCESS_CLOSURE_DEPENDENCY",
    "source=accounting_owner_closure_ledger_runtime",
    "required_inputs=finance_reliance_decision_closed,signed_route_evidence_closed,negative_control_dependency_closed,scope_baseline_closed,risk_closure_signed,p0_17_access_closure_route_recorded,owner_lane_confirmed",
    "required_dependency_record=finance_reliance_decision_recorded,finance_owner_recorded,accountant_access_decision_recorded,signed_route_evidence_packet_closed,negative_control_proof_dependency_lock_closed,scope_baseline_closed,final_risk_decision_packet_closed,p0_17_access_closure_route_recorded",
    "blocked_if=finance_reliance_decision_recorded=no,signed_route_evidence_closed=no,scope_baseline_closed=no,risk_closure_signed=no,p0_17_access_closure_route_recorded=no,owner_lane_confirmed=no",
    "next_allowed_step=ACCT-12_ACCESS_CLOSURE_DECISION",
    "p0_17_access_closure_route_recorded",
    "no_account_create=true",
    "no_scope_grant=true",
    "ACCT-12-ACCESS-CLOSURE-DECISION-CHECKLIST",
    "access_closure_checklist=ACCT-12_ACCESS_CLOSURE_DECISION",
    "required_inputs=scope_baseline_closed,negative_control_proof_closed,signed_route_evidence_closed,finance_reliance_decision_recorded,risk_closure_signed",
    "required_closure=accountant_retain_revoke_block_recorded,privileged_access_review_recorded,temporary_access_removed,negative_account_access_locked,access_closure_decision_recorded,controlled_evidence_ids_recorded,owner_quorum_recorded",
    "accountant_retain_revoke_block_recorded",
    "privileged_access_review_recorded",
    "temporary_access_removed",
    "negative_account_access_locked",
    "ACCT-12-FINAL-OWNER-DEPENDENCY-LOCK",
    "final_owner_dependency_lock=ACCT-12_FINAL_OWNER_DEPENDENCY",
    "source=accounting_owner_closure_ledger_runtime",
    "required_inputs=finance_reliance_decision_closed,access_closure_decision_closed,signed_route_evidence_closed,final_risk_decision_closed,p0_09_owner_packet_recorded,owner_quorum_recorded,controlled_evidence_ids_recorded",
    "required_dependency_record=finance_reliance_decision_recorded,access_closure_decision_recorded,signed_route_evidence_packet_closed,final_risk_decision_packet_closed,p0_09_final_owner_packet_recorded,owner_quorum_recorded,controlled_evidence_ids_recorded,blocker_state_recorded",
    "blocked_if=finance_reliance_decision_recorded=no,access_closure_decision_recorded=no,final_risk_decision_recorded=no,p0_09_final_owner_packet_recorded=no,owner_quorum_recorded=no,controlled_evidence_ids_recorded=no",
    "next_allowed_step=ACCT-12_FINAL_OWNER_DECISION",
    "p0_09_final_owner_packet_recorded",
    "no_access_closure_inference=true",
    "ACCT-12-FINAL-OWNER-DECISION-CHECKLIST",
    "owner_decision_checklist=ACCT-12_FINAL_OWNER_DECISION",
    "required_closure=finance_reliance_decision_recorded,final_owner_go_no_go_recorded,owner_quorum_recorded,access_closure_decision_recorded,controlled_evidence_ids_recorded",
    "finance_reliance_decision_recorded",
    "final_owner_go_no_go_recorded",
    "access_closure_decision_recorded",
    "no_finance_reliance_inference=true",
    "no_voucher_posting=true",
    "no_bank_transfer=true",
    "no_password_or_invite_link=true",
    "no_auto_access_change=true",
    "no_uat_pass_inference=true",
    "no_raw_pii_or_payment_evidence=true",
    "no_raw_screenshot_or_pii=true",
    "no_evidence_acceptance=true",
    "no_owner_go_inference=true",
    "no_auto_approval=true",
    "pending_risk_external_evidence>0",
    "pending_route_external_evidence>0",
    "pending_acceptance_owner>0",
    "UAT-ROUTE-01 through UAT-ROUTE-11",
    "ACCT_11_RISK_READY / NO_GO / BLOCKED",
    "ACCT_12_OWNER_READY / NO_GO / BLOCKED",
    "does not create accounts",
    "execute UAT",
    "accept evidence",
    "approve finance reliance",
    "approve owner GO/NO-GO",
    "production GO",
  ],
  "open blocker queue coverage",
  queuePath,
);

const blockerRows = tableRows(queue, "ACCT-BLOCKER-");
if (blockerRows.length !== 4) {
  fail(`${queuePath}: expected 4 ACCT-BLOCKER rows, found ${blockerRows.length}`);
}

requireAll(
  breakdown,
  [
    "HEU_ACCOUNTING_OPEN_BLOCKER_ACTION_QUEUE_20260703.md",
    "check:heu-accounting-open-blocker-action-queue",
    "ACCT_OPEN_BLOCKER_ACTION_READY / NO_GO / BLOCKED",
    "ACCT-BLOCKER-01",
    "ACCT-BLOCKER-04",
  ],
  "accounting breakdown open blocker queue coverage",
  breakdownPath,
);

requireAll(
  readiness,
  [
    "check:heu-accounting-open-blocker-action-queue",
    "ACCT-00/11/12 open blocker owner-action queue is packaged",
  ],
  "accounting readiness open blocker queue command",
  readinessPath,
);

requireAll(
  moduleBreakdownCheck,
  [
    queuePath,
    "check:heu-accounting-open-blocker-action-queue",
    "ACCT_OPEN_BLOCKER_ACTION_READY / NO_GO / BLOCKED",
  ],
  "module breakdown checker open blocker queue enforcement",
  moduleBreakdownCheckPath,
);

const expectedScript =
  "node scripts/check-heu-accounting-open-blocker-action-queue.mjs";
if (
  packageJson.scripts?.["check:heu-accounting-open-blocker-action-queue"] !==
  expectedScript
) {
  fail(
    `${packagePath}: missing script check:heu-accounting-open-blocker-action-queue`,
  );
}

const expectedNegativeOwnerActionScript =
  "node scripts/check-heu-accounting-negative-control-owner-action-queue.mjs";
if (
  packageJson.scripts?.[
    "check:heu-accounting-negative-control-owner-action-queue"
  ] !== expectedNegativeOwnerActionScript
) {
  fail(
    `${packagePath}: missing script check:heu-accounting-negative-control-owner-action-queue`,
  );
}

if (failures.length > 0) {
  console.error("HEU accounting open blocker action queue check failed.");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(
  "HEU accounting open blocker action queue check passed. Current NO-GO blockers are packaged for owner action; signed UAT and owner evidence remain external.",
);
