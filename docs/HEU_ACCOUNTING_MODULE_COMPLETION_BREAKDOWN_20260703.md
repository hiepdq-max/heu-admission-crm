# HEU Accounting Module Completion Breakdown - 2026-07-03

Status: PASS_LOCAL_BREAKDOWN
Production/UAT status: NO-GO until signed multi-account UAT, controlled
external evidence, backup/restore proof, signed migration order and owner
GO/NO-GO are completed outside Git/Codex/chat.

## Purpose

This document breaks the HEU accounting module into small goals that can be
checked, improved and closed one at a time.

Accounting module means the controlled finance chain around TTGDTX 9+ plus the
read-only HEU Finance Desk:

- P2-01 contract basis.
- P2-02 tuition policy.
- P0-19 legal/finance gate.
- P2-03 receivable.
- P2-10 tuition collection and invoice/chung-tu decision.
- P2-13 reconciliation.
- P2-14 review/approve/lock.
- P2-15 payment request.
- P2-16 check/approve payment request.
- P2-17 payout record.
- P2-18 accounting dashboard.
- P5-03 Finance Desk read-only cockpit.
- P6-03 audit traceability.
- P6-04 role/workspace scope.
- P6-06 hard-delete/cascade closure.

PASS_LOCAL here means the local code, SQL source and guard scripts are packaged
for controlled UAT. It does not approve finance action, bank transfer, voucher
posting, statutory accounting, evidence acceptance, migration, UAT result,
owner waiver, owner GO/NO-GO or production GO.

## System And Report Coordination Lock

`ACCT-SYSTEM-REPORT-COORDINATION-LOCK` keeps the accounting slice aligned with
the wider system build and reporting surfaces without overwriting other
modules.

`accounting_coordination_lock=ACCT_SYSTEM_REPORT_COORDINATION` with
`source=accounting_module_breakdown_runtime` requires the accounting module to
read the coordination sources as control references only:

- `docs/HEU_CURRENT_STATE_INVENTORY.md` for the current M09/M10 state.
- `docs/HEU_SYSTEM_BUILD_BACKLOG.md` for P0-16, P5-02 and P5-03 backlog
  anchors.
- `docs/HEU_MODULE_READINESS_GAP_MATRIX_20260628_V01_DRAFT.md` for module
  readiness and report-view reliance limits.
- `docs/HEU_REPORT_VIEW_SOURCE_MAP_20260628_V01_DRAFT.md` for
  `RV_TTGDTX_FINANCE_SUMMARY`, `RV_TTGDTX_CONG_NO_THUC_THU` and
  `RV_TTGDTX_COM_CHI_TRA`.

Required boundary tokens:

- `M09 Tai chinh/Cong no`.
- `M10 Dashboard`.
- `system_backlog_reference=read_only`.
- `report_view_reference=read_only`.
- `reports_read_only_reference=true`.
- `no_cross_module_overwrite=true`.
- `no_report_view_reliance_inference=true`.
- `no_dashboard_reliance_inference=true`.
- `no_raw_workbook_import=true`.
- `no_source_data_edit=true`.
- `no_task_or_email_creation=true`.

This lock is coordination-only. It does not edit report modules, change source
data, import raw workbooks, approve dashboard/report-view reliance, create
tasks, send email, accept evidence, approve finance reliance or mark production
GO.

Local readiness gate:

- `npm.cmd run check:heu-accounting-local-readiness`
- Decision value: `ACCT_LOCAL_READY / NO_GO / BLOCKED`.
- The gate runs the focused ACCT command set below and returns `NO_GO` when
  any required local guard fails. It is read-only and does not create accounts,
  execute UAT, accept evidence, approve finance reliance, approve owner
  GO/NO-GO or mark production GO.
- Machine-readable operator lines:
  - `ACCT_LOCAL_SUMMARY`: stable fields `status`, `passed`, `total`,
    `failed` and `duration_ms`.
  - `ACCT_LOCAL_BLOCKERS`: comma-separated failing command names, or `none`.
  - `ACCT_LOCAL_NEXT_ACTION`: owner/external next action such as
    `close_owner_external_blockers=ACCT-00,ACCT-11,ACCT-12` or
    `signed_uat_external_flow=required`; it keeps `no_auto_fix=true` or
    `no_auto_approval=true` explicit and never auto-fixes or auto-approves.
- ACCT-00 starts with `check:heu-user-scope-baseline-repair-queue` so
  `missing_visibility` and `missing_business_scope` are repaired before
  negative-control browser UAT or Finance Desk reliance can proceed.
- ACCT-00 scope packets mirrored through
  `check:heu-negative-control-account-queue` must carry
  `source=negative_control_account_queue_runtime` before the accounting
  aggregate guards can treat the runtime mirror as current evidence.
- The scope repair checker emits
  `ACCT-00-SCOPE-REPAIR-OWNER-PACKET-LOCK` with
  `scope_repair_owner_packet_lock=ACCT-00_SCOPE_REPAIR_OWNER_PACKET_LOCK`,
  `profile_count=2`, `decision_count=4`,
  `role_codes=DAO_TAO_LEAD,TCHC_LEAD`,
  `required_inputs=safe_owner_repair_labels_generated,owner_action_packet_generated,role_codes_recorded,decision_count_recorded,secure_owner_lookup_channel_recorded,controlled_evidence_id_recorded`,
  `required_dependency_record=safe_label,role_code,owner_label_mapped,owner_lane_confirmed,secure_owner_lookup_channel_recorded,controlled_evidence_id_recorded`,
  `blocked_if=safe_owner_repair_labels_missing,owner_action_packet_missing,role_codes_missing,decision_count_mismatch,owner_label_unmapped,secure_owner_lookup_channel_missing,controlled_evidence_id_missing,raw_profile_id_present`
  and `next_allowed_step=ACCT-00_SCOPE_REPAIR_OWNER_DECISION_MATRIX` so safe
  labels and owner packets cannot be mistaken for owner approval.
- The scope repair checker emits
  `ACCT-00-SCOPE-REPAIR-OWNER-DECISION-MATRIX` with
  `scope_repair_owner_decision_matrix=ACCT-00_SCOPE_REPAIR_OWNER_DECISION_MATRIX`,
  `profile_count=2`, `decision_count=4`,
  `required_owner_record=owner_label_mapped,lead_visibility_choice_recorded,business_scope_choice_recorded,owner_lane_confirmed,secure_admin_channel_recorded,controlled_evidence_id_recorded`,
  `required_per_label_record=safe_label,role_code,approved_visibility_choice_when_required,approved_segment_or_partner_scope_when_required,owner_reviewer,controlled_evidence_id`,
  `blocked_if=owner_label_unmapped,required_visibility_choice_missing,required_business_scope_choice_missing,secure_admin_channel_missing,controlled_evidence_id_missing`,
  `next_allowed_step=ACCT-00_SCOPE_BASELINE_OWNER_DECISION`,
  `no_raw_profile_id=true`, `no_email_or_phone=true`,
  `no_auto_scope_change=true`, `no_evidence_acceptance=true`,
  `no_uat_pass_inference=true` and `no_finance_reliance_inference=true` so
  the redacted hash labels must be mapped into owner decisions before any
  scope baseline checklist can be closed.
- The scope repair checker emits
  `ACCT-00-SCOPE-BASELINE-DECISION-CHECKLIST` with
  `scope_decision_checklist=ACCT-00_SCOPE_BASELINE_OWNER_DECISION`,
  `required_closure=lead_visibility_choice_recorded,business_scope_choice_recorded,owner_lane_confirmed,secure_admin_channel_recorded,post_repair_snapshot_recorded`,
  requiring `lead_visibility_choice_recorded`,
  `business_scope_choice_recorded`, `owner_lane_confirmed`,
  `secure_admin_channel_recorded`, `post_repair_snapshot_recorded`,
  `no_all_visibility_for_non_admin=true` and `no_auto_scope_change=true`
  before ACCT-00 can move from scope repair into negative-control account work.
- The scope repair checker now also emits
  `ACCT-00-SCOPE-REPAIR-DECISION-DEPENDENCY-LOCK` with
  `scope_repair_decision_dependency_lock=ACCT-00_SCOPE_REPAIR_DECISION_DEPENDENCY`,
  `required_inputs=scope_baseline_decision_checklist_closed,lead_visibility_choice_recorded,business_scope_choice_recorded,owner_lane_confirmed,secure_admin_channel_recorded`,
  `required_dependency_record=approved_visibility_choice_recorded,approved_business_scope_recorded,owner_lane_confirmed,secure_admin_channel_recorded,controlled_evidence_id_recorded`,
  `blocked_if=scope_baseline_decision_checklist_closed=no,owner_lane_confirmed=no,lead_visibility_choice_recorded=no,business_scope_choice_recorded=no,secure_admin_channel_recorded=no`,
  `next_allowed_step=ACCT-00_SCOPE_REPAIR_EXECUTION`,
  `no_evidence_acceptance=true`, `no_uat_pass_inference=true`,
  `no_finance_reliance_inference=true` and `no_owner_go_inference=true` so
  owner-side scope repair cannot start from hash labels or PASS_LOCAL package
  evidence alone.
- The scope repair checker also emits
  `ACCT-00-SCOPE-REPAIR-EXECUTION-PACKET` with
  `scope_repair_execution_packet=ACCT-00_SCOPE_REPAIR_EXECUTION`,
  `required_execution_record=pre_repair_snapshot_recorded,approved_visibility_choice_applied,approved_business_scope_applied,workspace_preference_verified,post_repair_snapshot_recorded,controlled_evidence_id_recorded`,
  `no_raw_profile_id=true`, `no_service_role_key_in_evidence=true`,
  `no_auto_scope_change=true`, `no_auto_uat_approval=true` and
  `no_auto_production_go=true` so the actual owner-side scope repair has a
  pre/post snapshot record before negative-control account provisioning.
- The scope repair checker also emits
  `ACCT-00-SCOPE-POST-REPAIR-RERUN-PROOF-PACKET` with
  `scope_post_repair_rerun_proof_packet=ACCT-00_SCOPE_POST_REPAIR_RERUN_PROOF`,
  `required_inputs=scope_repair_execution_closed,post_repair_snapshot_recorded,controlled_evidence_id_recorded,owner_lane_confirmed`,
  `required_rerun_record=check_heu_user_scope_baseline_repair_queue_rerun,check_heu_negative_control_account_queue_rerun,check_heu_finance_payment_scope_readiness_rerun,check_heu_role_scope_uat_pack_rerun,check_heu_user_account_security_rerun`,
  `required_result_record=missing_visibility=0,missing_business_scope=0,non_admin_all_visibility=0,workspace_mismatch=0,ttgdtx_negative_candidates_recomputed,finance_payment_scope_ready_recorded,role_scope_pack_passed,controlled_evidence_id_recorded`,
  `blocked_if=scope_baseline_closed=no,post_repair_snapshot_recorded=no,controlled_evidence_id_recorded=no,negative_control_queue_re_run_recorded=no`,
  `next_allowed_step=ACCT-00_SCOPE_POST_REPAIR_VERIFICATION`,
  `no_auto_account_create=true`, `no_evidence_acceptance=true`,
  `no_uat_pass_inference=true`, `no_finance_reliance_inference=true` and
  `no_owner_go_inference=true` so post-repair verification cannot rely on a
  stale scope snapshot or skipped negative-control rerun.
- The scope repair checker now also emits
  `ACCT-00-SCOPE-POST-REPAIR-VERIFICATION-PACKET` with
  `scope_post_repair_verification_packet=ACCT-00_SCOPE_POST_REPAIR_VERIFICATION`,
  `scope_baseline_closed=no`,
  `required_inputs=scope_repair_execution_closed,post_repair_snapshot_recorded,controlled_evidence_id_recorded`,
  `required_verification_record=missing_visibility=0,missing_business_scope=0,non_admin_all_visibility=0,workspace_mismatch=0,workspace_preference_inside_scope_confirmed,negative_control_queue_re_run_recorded,controlled_evidence_id_recorded`,
  `next_allowed_step=ACCT-00_SCOPE_EXTERNAL_CLOSURE_HANDOFF` and
  `no_auto_acceptance=true` so the owner-applied repair must be verified
  before ACCT-00 moves into scope external closure handoff.
- The scope repair checker now also emits
  `ACCT-00-SCOPE-EXTERNAL-CLOSURE-HANDOFF-PACKET` with
  `scope_external_closure_handoff_packet=ACCT-00_SCOPE_EXTERNAL_CLOSURE_HANDOFF`,
  `scope_baseline_closed=no`,
  `required_inputs=scope_baseline_decision_checklist_closed,scope_repair_execution_closed,scope_post_repair_rerun_proof_closed,scope_post_repair_verification_closed,controlled_evidence_id_recorded,owner_lane_confirmed`,
  `required_owner_closure=missing_visibility=0,missing_business_scope=0,non_admin_all_visibility=0,workspace_mismatch=0,lead_visibility_choice_recorded,business_scope_choice_recorded,approved_visibility_choice_applied,approved_business_scope_applied,workspace_preference_inside_scope_confirmed,post_repair_snapshot_recorded,negative_control_queue_re_run_recorded,controlled_evidence_id_recorded`,
  `blocked_if=scope_baseline_closed=no,missing_visibility>0,missing_business_scope>0,non_admin_all_visibility>0,workspace_mismatch>0,controlled_evidence_id_recorded=no`,
  `next_allowed_step=ACCT-00_NEGATIVE_ACCOUNT_DEPENDENCY`,
  `no_auto_account_create=true`, `no_evidence_acceptance=true`,
  `no_uat_pass_inference=true`, `no_finance_reliance_inference=true` and
  `no_owner_go_inference=true` so negative-account dependency cannot rely on
  a scope verification packet without final owner closure and controlled
  evidence routing.
- The negative-control checker now emits
  `ACCT-00-NEGATIVE-ACCOUNT-DEPENDENCY-LOCK` with
  `negative_account_dependency_lock=ACCT-00_NEGATIVE_ACCOUNT_DEPENDENCY`,
  `required_inputs=scope_external_closure_handoff_closed,scope_post_repair_verification_closed,scope_baseline_closed,owner_lane_confirmed,secure_admin_channel_recorded,controlled_evidence_id_recorded`,
  `required_dependency_record=scope_external_closure_handoff_closed,missing_visibility=0,missing_business_scope=0,non_admin_all_visibility=0,workspace_mismatch=0,workspace_preference_inside_scope_confirmed,negative_control_queue_re_run_recorded,controlled_evidence_id_recorded,post_repair_snapshot_recorded`,
  `blocked_if=scope_external_closure_handoff_closed=no,scope_baseline_closed=no,missing_visibility>0,missing_business_scope>0,non_admin_all_visibility>0,workspace_mismatch>0`,
  `next_allowed_step=ACCT-00_NEGATIVE_ACCOUNT_PROVISIONING`,
  `no_auto_account_create=true`, `no_auto_scope_grant=true`,
  `no_auto_scope_change=true`, `no_evidence_acceptance=true`,
  `no_uat_pass_inference=true`, `no_finance_reliance_inference=true` and
  `no_owner_go_inference=true` so provisioning cannot start from scope repair
  execution alone while the baseline is still open.
- `check:heu-negative-control-account-queue` emits
  `ACCT-00-PRE-UAT-OWNER-CHECKLIST` with
  `owner_checklist=ACCT-00_PRE_UAT`, requiring scope baseline repair,
  `REAL_OUT_OF_SCOPE_NEGATIVE_01`, non-target scope assignment, browser denial
  evidence and `controlled_evidence_id_recorded` before signed accounting UAT.
- `check:heu-accounting-negative-control-owner-action-queue` provides
  ACCT-00 negative-control owner-action queue coverage for
  `docs/HEU_ACCOUNTING_NEGATIVE_CONTROL_OWNER_ACTION_QUEUE_20260703.md` and
  `ACCT_NEGATIVE_CONTROL_READY / NO_GO / BLOCKED`; it verifies the ACCT-00
  owner-action order, secret boundary, scope-baseline dependency,
  negative-account dependency, browser-denial dependency and ACCT-12 handoff
  tokens without creating accounts, changing scope, executing browser UAT,
  accepting evidence or approving finance reliance.
- The same checker emits
  `ACCT-00-NEGATIVE-ACCOUNT-PROVISIONING-CHECKLIST` with
  `negative_account_checklist=ACCT-00_NEGATIVE_ACCOUNT_PROVISIONING`,
  `required_closure=target_account_label_recorded,non_target_business_scope_recorded,target_segment_exclusion_recorded,credential_boundary_acknowledged,controlled_evidence_id_recorded`,
  requiring `target_account_label_recorded`,
  `non_target_business_scope_recorded`, `target_segment_exclusion_recorded`,
  `credential_boundary_acknowledged`, `controlled_evidence_id_recorded`,
  `no_ttgdtx_scope=true`, `no_settings_or_permission_access=true` and
  `no_auto_account_create=true` before browser denial evidence can be treated
  as ready to collect.
- The same checker now emits
  `ACCT-00-NEGATIVE-ACCOUNT-EXECUTION-PACKET` with
  `negative_account_execution_packet=ACCT-00_NEGATIVE_ACCOUNT_EXECUTION`,
  `required_inputs=negative_account_dependency_lock_closed,provisioning_decision_closed,target_account_label_recorded,secure_admin_channel_recorded`,
  `blocked_if=negative_account_dependency_lock_closed=no,scope_baseline_closed=no,missing_visibility>0,missing_business_scope>0`,
  `required_execution_record=auth_profile_link_recorded,non_target_business_scope_applied,target_segment_exclusion_verified,lead_visibility_non_all_verified,settings_permission_denial_ready,credential_boundary_acknowledged,controlled_evidence_id_recorded`,
  `no_raw_account_id=true`, `no_auto_account_create=true`,
  `no_auto_scope_grant=true`, `no_auto_uat_approval=true` and
  `no_auto_production_go=true` so creating/linking
  `REAL_OUT_OF_SCOPE_NEGATIVE_01` remains owner-side execution recording before
  browser denial evidence.
- The same checker now also emits
  `ACCT-00-NEGATIVE-ACCOUNT-POST-EXECUTION-VERIFICATION-PACKET` with
  `negative_account_post_execution_verification_packet=ACCT-00_NEGATIVE_ACCOUNT_POST_EXECUTION_VERIFICATION`,
  current `negative_account_ready=no`,
  `required_inputs=negative_account_execution_closed,auth_profile_link_recorded,non_target_business_scope_applied,target_segment_exclusion_verified,controlled_evidence_id_recorded`,
  `required_verification_record=ttgdtx_negative_candidates>=1,negative_account_label_recorded,auth_profile_link_verified,non_target_business_scope_verified,target_segment_exclusion_verified,lead_visibility_non_all_verified,settings_permission_denial_ready,controlled_evidence_id_recorded`,
  `next_allowed_step=ACCT-00_NEGATIVE_BROWSER_DENIAL`,
  `no_auto_account_create=true`, `no_auto_scope_grant=true`,
  `no_auto_acceptance=true`, `no_auto_uat_approval=true` and
  `no_auto_production_go=true` so browser-denial evidence cannot start from an
  unverified account/link/scope state.
- The same checker now emits
  `ACCT-00-NEGATIVE-BROWSER-EVIDENCE-DEPENDENCY-LOCK` with
  `negative_browser_evidence_dependency_lock=ACCT-00_NEGATIVE_BROWSER_EVIDENCE_DEPENDENCY`,
  `required_inputs=negative_account_post_execution_verification_closed,negative_account_ready,controlled_evidence_id_recorded,reviewer_recorded,owner_lane_confirmed`,
  `required_dependency_record=ttgdtx_negative_candidates>=1,negative_account_label_recorded,auth_profile_link_verified,non_target_business_scope_verified,target_segment_exclusion_verified,lead_visibility_non_all_verified,settings_permission_denial_ready,controlled_evidence_id_recorded`,
  `blocked_if=negative_account_ready=no,ttgdtx_negative_candidates=0,scope_baseline_closed=no,missing_visibility>0,missing_business_scope>0`,
  `next_allowed_step=ACCT-00_NEGATIVE_BROWSER_DENIAL`,
  `no_browser_uat_execution=true`, `no_evidence_acceptance=true`,
  `no_uat_pass_inference=true`, `no_finance_reliance_inference=true` and
  `no_owner_go_inference=true` so browser-denial evidence cannot start while
  the negative account is still not verified ready.
- The same checker emits `ACCT-00-NEGATIVE-CONTROL-EVIDENCE-CHECKLIST` with
  `negative_evidence_checklist=ACCT-00_NEGATIVE_BROWSER_DENIAL` so browser
  denial evidence must carry controlled evidence ID, reviewer, route result and
  owner decision before ACCT-00 can support signed accounting UAT.
- The same checker emits `ACCT-00-NEGATIVE-BROWSER-ROUTE-MATRIX` with
  `negative_route_matrix=ACCT-00_NEGATIVE_BROWSER_ROUTES`,
  `route_count=5`, `required_routes=lead,finance,evidence,audit,settings`,
  `expected_result=BLOCKED_OR_EMPTY_SCOPED_STATE` and
  `required_closure=lead_route_denial_recorded,finance_route_denial_recorded,evidence_route_denial_recorded,audit_route_denial_recorded,settings_route_denial_recorded,controlled_evidence_id_recorded,reviewer_recorded,owner_decision_recorded`
  so each lead, finance, evidence, audit and settings route denial is recorded
  separately before negative browser proof can support signed accounting UAT.
- The same checker now also emits
  `ACCT-00-NEGATIVE-CONTROL-FINAL-PROOF-DECISION-PACKET` with
  `negative_control_final_proof_decision_packet=ACCT-00_NEGATIVE_CONTROL_FINAL_PROOF_DECISION`,
  current `negative_control_proof_ready=no`,
  `required_inputs=negative_browser_denial_closed,negative_browser_route_matrix_closed,controlled_evidence_id_recorded,reviewer_recorded,owner_decision_recorded`,
  `required_decision_record=negative_control_proof_decision_recorded,lead_route_denial_recorded,finance_route_denial_recorded,evidence_route_denial_recorded,audit_route_denial_recorded,settings_route_denial_recorded,controlled_evidence_id_recorded,reviewer_recorded,owner_decision_recorded,blocker_state_recorded`,
  `allowed_decision_values=PASS,NO_GO,BLOCKED`,
  `next_allowed_step=ACCT-12_SIGNED_ROUTE_EVIDENCE_INTAKE`,
  `no_evidence_acceptance=true`, `no_uat_pass_inference=true`,
  `no_finance_reliance_inference=true` and `no_owner_go_inference=true` so
  ACCT-12 signed route evidence intake cannot use negative-control proof until
  the final proof decision is recorded by the owner lane.
- The same checker now also emits
  `ACCT-00-OWNER-EXTERNAL-CLOSURE-HANDOFF-PACKET` with
  `owner_external_closure_handoff_packet=ACCT-00_OWNER_EXTERNAL_CLOSURE_HANDOFF`,
  `required_inputs=scope_post_repair_verification_closed,negative_account_post_execution_verification_closed,negative_browser_denial_closed,negative_control_final_proof_decision_recorded,controlled_evidence_id_recorded,owner_lane_confirmed`,
  `required_owner_closure=missing_visibility=0,missing_business_scope=0,non_admin_all_visibility=0,workspace_mismatch=0,ttgdtx_negative_candidates>=1,negative_control_proof_decision_recorded,lead_route_denial_recorded,finance_route_denial_recorded,evidence_route_denial_recorded,audit_route_denial_recorded,settings_route_denial_recorded,blocker_state_recorded,controlled_evidence_id_recorded`,
  `blocked_if=missing_visibility>0,missing_business_scope>0,ttgdtx_negative_candidates=0,negative_control_proof_ready=no,controlled_evidence_id_recorded=no`,
  `next_allowed_step=ACCT-12_NEGATIVE_CONTROL_PROOF_DEPENDENCY`,
  `no_auto_scope_change=true`, `no_auto_account_create=true`,
  `no_evidence_acceptance=true`, `no_uat_pass_inference=true`,
  `no_finance_reliance_inference=true`, `no_owner_go_inference=true` and
  `no_auto_production_go=true` so ACCT-00 cannot hand off to ACCT-12 while
  scope, negative account, route-denial proof or controlled evidence is still
  open.
- ACCT-01 through ACCT-06 integrity audits are part of the same readiness gate:
  operating-control UI, contract/tuition guard, invoice policy, VND money
  format, period lock, reconciliation repair safety and receivable/payment
  lifecycle must pass before signed accounting UAT can be discussed.
- ACCT-04 through ACCT-09 no-duplicate controls are checked by
  `check:heu-accounting-no-duplicate-control-ledger`, with
  `docs/HEU_ACCOUNTING_NO_DUPLICATE_CONTROL_LEDGER_20260703.md` mapping
  ACCT-NODUP-01 through ACCT-NODUP-06 and
  `ACCT_NO_DUPLICATE_READY / NO_GO / BLOCKED` across receivable, collection,
  reconciliation, payment request and payout.
- ACCT-11 and ACCT-12 are checked by
  `check:heu-accounting-risk-closure-ledger` and
  `check:heu-accounting-owner-closure-ledger` so pending external evidence and
  owner decisions keep the local readiness gate red instead of being hidden in
  narrative notes.
- ACCT-11 now emits `ACCT-11-RISK-EVIDENCE-INTAKE-CHECKLIST` with
  `risk_evidence_checklist=ACCT-11_EVIDENCE_INTAKE`,
  `controlled_evidence_ids_recorded`, `no_raw_backup_or_database_export=true`
  and `no_auto_acceptance=true` so risk evidence intake has an explicit owner
  order without accepting evidence.
- ACCT-11 now also emits `ACCT-11-AUDIT-TRACE-CLOSURE-CHECKLIST` with
  `audit_trace_checklist=ACCT-11_AUDIT_TRACE_CLOSURE`,
  `required_inputs=ttgdtx_write_trigger_coverage_confirmed,audit_trace_ui_confirmed,acceptance_matrix_reviewed,decision_manifest_reviewed`,
  `required_closure=audit_log_trigger_coverage_recorded,sampled_actor_recorded,sampled_entity_recorded,sampled_action_recorded,sampled_timestamp_recorded,before_after_usefulness_recorded,controlled_evidence_ids_recorded,owner_quorum_recorded`,
  `no_raw_audit_payload=true`, `no_audit_log_mutation=true`,
  `no_auto_acceptance=true` and `no_auto_production_go=true` so P6-03 audit
  trace proof is routed without mutating audit logs or accepting raw payloads.
- ACCT-11 now also emits `ACCT-11-HARD-DELETE-CASCADE-CLOSURE-CHECKLIST` with
  `hard_delete_cascade_checklist=ACCT-11_HARD_DELETE_CASCADE_CLOSURE`,
  `required_inputs=audit_trace_closed,p6_06_boundary_guard_passed,cascade_finding_register_reviewed,conversion_or_waiver_path_identified`,
  `required_closure=ttgdtx_hard_delete_boundary_recorded,p6_06_findings_triaged,conversion_or_written_waiver_recorded,protected_record_retention_recorded,cascade_execution_blocked,controlled_evidence_ids_recorded,owner_quorum_recorded`,
  `no_hard_delete_execution=true`, `no_cascade_execution=true`,
  `no_owner_waiver_inference=true`, `no_auto_acceptance=true` and
  `no_auto_production_go=true` so P6-06 hard-delete/cascade closure cannot be
  inferred from audit trace proof, local guard success or owner silence.
- ACCT-11 now also emits `ACCT-11-BACKUP-RESTORE-PROOF-CHECKLIST` with
  `backup_restore_checklist=ACCT-11_BACKUP_RESTORE_PROOF`,
  `required_inputs=audit_trace_closed,hard_delete_boundary_closed,restore_target_identified,rollback_redaction_path_defined`,
  `required_closure=backup_id_recorded,restore_target_recorded,target_isolation_recorded,restore_smoke_check_recorded,controlled_evidence_ids_recorded,owner_quorum_recorded`,
  `no_raw_backup_or_database_export=true`, `no_migration_approval=true`,
  `no_auto_acceptance=true` and `no_auto_production_go=true` so
  backup/restore proof is routed before migration or final risk decision
  without executing backup/restore or approving migration.
- ACCT-11 now also emits `ACCT-11-MIGRATION-ORDER-SIGNOFF-CHECKLIST` with
  `migration_order_checklist=ACCT-11_MIGRATION_ORDER_SIGNOFF`,
  `required_inputs=backup_restore_proof_closed,audit_trace_closed,hard_delete_boundary_closed,rollback_redaction_path_defined`,
  `required_closure=step90_step110_order_signed,signer_authority_recorded,migration_scope_recorded,exception_decisions_recorded,rollback_note_recorded,controlled_evidence_ids_recorded,owner_quorum_recorded`,
  `no_migration_execution=true`, `no_auto_migration_approval=true`,
  `no_auto_acceptance=true` and `no_auto_production_go=true` so a signed
  Step90-Step110 order cannot be inferred from backup/restore proof or local
  audit success.
- ACCT-11 now also emits `ACCT-11-ROLLBACK-REDACTION-PROOF-CHECKLIST` with
  `rollback_redaction_checklist=ACCT-11_ROLLBACK_REDACTION_PROOF`,
  `required_inputs=backup_restore_proof_closed,migration_order_signed,audit_trace_closed,protected_evidence_identified`,
  `required_closure=rollback_path_recorded,redaction_path_recorded,protected_evidence_retained,audit_history_retained,cleanup_scope_recorded,controlled_evidence_ids_recorded,owner_quorum_recorded`,
  `no_hard_delete_execution=true`, `no_cascade_execution=true`,
  `no_evidence_destruction=true`, `no_auto_acceptance=true` and
  `no_auto_production_go=true` so rollback/redaction proof cannot destroy
  evidence or hide audit history.
- ACCT-11 now also emits `ACCT-11-FINAL-RISK-DEPENDENCY-LOCK` with
  `final_risk_dependency_lock=ACCT-11_FINAL_RISK_DEPENDENCY`,
  `required_inputs=audit_trace_closed,hard_delete_cascade_closed,backup_restore_proof_closed,migration_order_signed,rollback_redaction_proof_closed,controlled_evidence_ids_recorded,owner_quorum_recorded`,
  `required_dependency_record=audit_log_trigger_coverage_recorded,p6_06_findings_triaged,backup_id_recorded,restore_smoke_check_recorded,step90_step110_order_signed,rollback_path_recorded,redaction_path_recorded,protected_evidence_retained,controlled_evidence_ids_recorded,owner_quorum_recorded`,
  `blocked_if=audit_trace_closed=no,hard_delete_cascade_closed=no,backup_restore_proof_closed=no,migration_order_signed=no,rollback_redaction_proof_closed=no,controlled_evidence_ids_recorded=no,owner_quorum_recorded=no`,
  `next_allowed_step=ACCT-11_FINAL_RISK_DECISION`,
  `no_evidence_acceptance=true`, `no_owner_waiver_inference=true`,
  `no_finance_reliance_inference=true`, `no_uat_pass_inference=true`,
  `no_owner_go_inference=true`, `no_auto_migration_approval=true` and
  `no_auto_production_go=true` so final risk decision cannot be inferred from
  partial risk evidence, local guard success or owner silence.
- ACCT-11 also emits `ACCT-11-RISK-FINAL-DECISION-CHECKLIST` with
  `risk_decision_checklist=ACCT-11_FINAL_RISK_DECISION`,
  `final_risk_decision_recorded`, `owner_quorum_recorded`,
  `waiver_or_correction_recorded`, `boundary_acknowledged`,
  `no_owner_waiver_inference=true`, `no_auto_migration_approval=true` and
  `no_auto_production_go=true` so final risk decisions cannot be inferred from
  PASS_LOCAL evidence intake.
- ACCT-11 also emits `ACCT-11-FINAL-RISK-DECISION-PACKET` with
  `final_risk_decision_packet=ACCT-11_FINAL_RISK_DECISION_PACKET`,
  `required_inputs=audit_trace_closed,hard_delete_cascade_closed,backup_restore_proof_closed,migration_order_signed,rollback_redaction_proof_closed,controlled_evidence_ids_recorded`,
  `allowed_decision_values=PASS,NO_GO,BLOCKED`,
  `required_decision_record=final_risk_decision_recorded,owner_quorum_recorded,residual_risk_statement_recorded,waiver_or_correction_recorded,boundary_acknowledged,controlled_evidence_ids_recorded`,
  `residual_risk_statement_recorded`, `no_evidence_acceptance=true`,
  `no_finance_reliance_inference=true`, `no_uat_pass_inference=true`,
  `no_owner_go_inference=true` and `no_auto_production_go=true` so final risk
  decision routing cannot accept evidence, infer waiver approval, approve
  finance reliance or create owner GO/NO-GO.
- ACCT-11 now also emits
  `ACCT-11-RISK-EXTERNAL-EVIDENCE-HANDOFF-PACKET` with
  `risk_external_evidence_handoff_packet=ACCT-11_RISK_EXTERNAL_EVIDENCE_HANDOFF`,
  `source=accounting_risk_closure_ledger_runtime`,
  current `risk_closure_ready=no`,
  `required_inputs=audit_trace_closed,hard_delete_cascade_closed,backup_restore_proof_closed,migration_order_signed,rollback_redaction_proof_closed,final_risk_decision_recorded,owner_quorum_recorded,controlled_evidence_ids_recorded`,
  `required_owner_closure=pending_risk_external_evidence=0,pending_risk_owner=0,pending_acceptance_owner=0,audit_log_trigger_coverage_recorded,p6_06_findings_triaged,backup_id_recorded,restore_smoke_check_recorded,step90_step110_order_signed,rollback_path_recorded,redaction_path_recorded,protected_evidence_retained,final_risk_decision_recorded,owner_quorum_recorded,controlled_evidence_ids_recorded`,
  `blocked_if=pending_risk_external_evidence>0,pending_risk_owner>0,pending_acceptance_owner>0,final_risk_decision_recorded=no,owner_quorum_recorded=no,controlled_evidence_ids_recorded=no`,
  `next_allowed_step=ACCT-12_FINANCE_RELIANCE_DEPENDENCY`,
  `no_raw_backup_or_database_export=true`, `no_evidence_acceptance=true`,
  `no_finance_reliance_inference=true`, `no_uat_pass_inference=true`,
  `no_owner_go_inference=true`, `no_auto_migration_approval=true` and
  `no_auto_production_go=true` so ACCT-12 cannot rely on ACCT-11 risk closure
  while external evidence, owner decisions or controlled evidence IDs remain
  open.
- ACCT-12 now emits `ACCT-12-OWNER-UAT-ROUTE-CHECKLIST` with
  `owner_route_checklist=ACCT-12_OWNER_UAT_ROUTE`,
  `finance_reliance_decision_recorded`, `final_owner_go_no_go_recorded`,
  `no_raw_pii_or_payment_evidence=true` and `no_auto_approval=true` so signed
  UAT route closure is ordered without approving UAT or owner GO/NO-GO.
- ACCT-12 now also emits
  `ACCT-12-NEGATIVE-CONTROL-PROOF-DEPENDENCY-LOCK` with
  `negative_control_proof_dependency_lock=ACCT-12_NEGATIVE_CONTROL_PROOF_DEPENDENCY`,
  `required_inputs=ACCT-00_SCOPE_EXTERNAL_CLOSURE_HANDOFF_closed,negative_control_final_proof_decision_packet_closed,negative_control_proof_decision_recorded,controlled_evidence_id_recorded,reviewer_recorded,owner_decision_recorded,blocker_state_recorded`,
  `required_dependency_record=ACCT-00_SCOPE_EXTERNAL_CLOSURE_HANDOFF_closed,ACCT-00_NEGATIVE_CONTROL_FINAL_PROOF_DECISION_closed,scope_baseline_closed,negative_control_proof_ready_verified,lead_route_denial_recorded,finance_route_denial_recorded,evidence_route_denial_recorded,audit_route_denial_recorded,settings_route_denial_recorded,linked_signed_route_evidence_packet_recorded`,
  `blocked_if=ACCT-00_SCOPE_EXTERNAL_CLOSURE_HANDOFF_closed=no,scope_baseline_closed=no,negative_control_proof_ready=no,ttgdtx_negative_candidates=0,missing_visibility>0,missing_business_scope>0`,
  `next_allowed_step=ACCT-12_SIGNED_ROUTE_EVIDENCE_INTAKE`,
  `no_evidence_acceptance=true`, `no_uat_pass_inference=true`,
  `no_finance_reliance_inference=true` and `no_owner_go_inference=true` so
  signed route evidence cannot start from a generic or inferred
  negative-control proof state.
- ACCT-12 also emits `ACCT-12-SIGNED-ROUTE-EVIDENCE-INTAKE-PACKET` with
  `signed_route_evidence_packet=ACCT-12_SIGNED_ROUTE_EVIDENCE_INTAKE`,
  `source=accounting_owner_closure_ledger_runtime`,
  `required_inputs=negative_control_proof_closed,route_execution_log_reviewed,controlled_evidence_storage_confirmed,owner_lane_confirmed`,
  `required_route_record=uat_route_id_recorded,controlled_evidence_id_recorded,redaction_reviewer_recorded,route_result_recorded,route_owner_signature_recorded,linked_acceptance_item_recorded,blocker_state_recorded`,
  `no_raw_screenshot_or_pii=true`, `no_evidence_acceptance=true`,
  `no_uat_pass_inference=true`, `no_finance_reliance_inference=true`,
  `no_owner_go_inference=true` and `no_auto_production_go=true` so signed
  route evidence cannot be treated as accepted evidence, UAT pass, finance
  reliance or owner GO/NO-GO.
- ACCT-12 also emits `ACCT-12-FINANCE-RELIANCE-DEPENDENCY-LOCK` with
  `finance_reliance_dependency_lock=ACCT-12_FINANCE_RELIANCE_DEPENDENCY`,
  `source=accounting_owner_closure_ledger_runtime`,
  `required_inputs=signed_route_evidence_closed,negative_control_dependency_closed,legal_finance_gate_signed,no_duplicate_ledger_signed,risk_closure_signed,dashboard_finance_desk_signed,access_closure_route_recorded`,
  `required_dependency_record=signed_route_evidence_packet_closed,negative_control_proof_dependency_lock_closed,p0_19_legal_finance_gate_signed,no_duplicate_ledger_signed,final_risk_decision_packet_closed,dashboard_finance_desk_signed,access_closure_route_recorded`,
  `blocked_if=signed_route_evidence_closed=no,negative_control_proof_ready=no,legal_finance_gate_signed=no,no_duplicate_ledger_signed=no,risk_closure_signed=no,dashboard_finance_desk_signed=no,access_closure_route_recorded=no`,
  `next_allowed_step=ACCT-12_FINANCE_RELIANCE_DECISION`,
  `signed_route_evidence_packet_closed`,
  `negative_control_proof_dependency_lock_closed`,
  `p0_19_legal_finance_gate_signed`, `no_duplicate_ledger_signed`,
  `final_risk_decision_packet_closed`, `dashboard_finance_desk_signed`,
  `access_closure_route_recorded`, `no_evidence_acceptance=true`,
  `no_uat_pass_inference=true`, `no_finance_reliance_inference=true`,
  `no_voucher_posting=true`, `no_bank_transfer=true`,
  `no_owner_go_inference=true`, `no_auto_approval=true` and
  `no_auto_production_go=true` so finance reliance cannot be inferred from
  route evidence, partial signed UAT, dashboard proof or owner silence.
- ACCT-12 also emits `ACCT-12-FINANCE-RELIANCE-DECISION-CHECKLIST` with
  `finance_reliance_checklist=ACCT-12_FINANCE_RELIANCE_DECISION`,
  `required_inputs=scope_negative_control_closed,legal_finance_gate_signed,no_duplicate_ledger_signed,risk_closure_signed,dashboard_finance_desk_signed,access_closure_recorded`,
  `required_closure=finance_reliance_decision_recorded,finance_owner_recorded,accountant_access_decision_recorded,controlled_evidence_ids_recorded,owner_quorum_recorded`,
  `no_finance_reliance_inference=true`, `no_voucher_posting=true`,
  `no_bank_transfer=true` and `no_auto_approval=true` so route evidence cannot
  be treated as voucher posting, bank transfer or finance reliance.
- ACCT-12 also emits `ACCT-12-ACCESS-CLOSURE-DEPENDENCY-LOCK` with
  `access_closure_dependency_lock=ACCT-12_ACCESS_CLOSURE_DEPENDENCY`,
  `source=accounting_owner_closure_ledger_runtime`,
  `required_inputs=finance_reliance_decision_closed,signed_route_evidence_closed,negative_control_dependency_closed,scope_baseline_closed,risk_closure_signed,p0_17_access_closure_route_recorded,owner_lane_confirmed`,
  `required_dependency_record=finance_reliance_decision_recorded,finance_owner_recorded,accountant_access_decision_recorded,signed_route_evidence_packet_closed,negative_control_proof_dependency_lock_closed,scope_baseline_closed,final_risk_decision_packet_closed,p0_17_access_closure_route_recorded`,
  `blocked_if=finance_reliance_decision_recorded=no,signed_route_evidence_closed=no,scope_baseline_closed=no,risk_closure_signed=no,p0_17_access_closure_route_recorded=no,owner_lane_confirmed=no`,
  `next_allowed_step=ACCT-12_ACCESS_CLOSURE_DECISION`,
  `p0_17_access_closure_route_recorded`, `no_password_or_invite_link=true`,
  `no_auto_access_change=true`, `no_account_create=true`,
  `no_scope_grant=true`, `no_evidence_acceptance=true`,
  `no_finance_reliance_inference=true`, `no_owner_go_inference=true` and
  `no_auto_production_go=true` so access closure cannot be inferred from
  finance reliance, route evidence, P0-17 references or owner silence.
- ACCT-12 also emits `ACCT-12-ACCESS-CLOSURE-DECISION-CHECKLIST` with
  `access_closure_checklist=ACCT-12_ACCESS_CLOSURE_DECISION`,
  `required_inputs=scope_baseline_closed,negative_control_proof_closed,signed_route_evidence_closed,finance_reliance_decision_recorded,risk_closure_signed`,
  `required_closure=accountant_retain_revoke_block_recorded,privileged_access_review_recorded,temporary_access_removed,negative_account_access_locked,access_closure_decision_recorded,controlled_evidence_ids_recorded,owner_quorum_recorded`,
  `no_password_or_invite_link=true`, `no_auto_access_change=true`,
  `no_finance_reliance_inference=true` and `no_auto_production_go=true` so
  access closure cannot be inferred from route evidence or finance reliance.
- ACCT-12 also emits `ACCT-12-FINAL-OWNER-DEPENDENCY-LOCK` with
  `final_owner_dependency_lock=ACCT-12_FINAL_OWNER_DEPENDENCY`,
  `source=accounting_owner_closure_ledger_runtime`,
  `required_inputs=finance_reliance_decision_closed,access_closure_decision_closed,signed_route_evidence_closed,final_risk_decision_closed,p0_09_owner_packet_recorded,owner_quorum_recorded,controlled_evidence_ids_recorded`,
  `required_dependency_record=finance_reliance_decision_recorded,access_closure_decision_recorded,signed_route_evidence_packet_closed,final_risk_decision_packet_closed,p0_09_final_owner_packet_recorded,owner_quorum_recorded,controlled_evidence_ids_recorded,blocker_state_recorded`,
  `blocked_if=finance_reliance_decision_recorded=no,access_closure_decision_recorded=no,final_risk_decision_recorded=no,p0_09_final_owner_packet_recorded=no,owner_quorum_recorded=no,controlled_evidence_ids_recorded=no`,
  `next_allowed_step=ACCT-12_FINAL_OWNER_DECISION`,
  `no_evidence_acceptance=true`, `no_uat_pass_inference=true`,
  `no_finance_reliance_inference=true`, `no_access_closure_inference=true`,
  `no_owner_go_inference=true`, `no_auto_approval=true` and
  `no_auto_production_go=true` so final owner decision cannot be inferred from
  finance reliance, access closure, final risk routing, signed route evidence
  or P0-09 references.
- ACCT-12 also emits `ACCT-12-FINAL-OWNER-DECISION-CHECKLIST` with
  `owner_decision_checklist=ACCT-12_FINAL_OWNER_DECISION`,
  `required_closure=finance_reliance_decision_recorded,final_owner_go_no_go_recorded,owner_quorum_recorded,access_closure_decision_recorded,controlled_evidence_ids_recorded`,
  `owner_quorum_recorded`, `access_closure_decision_recorded`,
  `controlled_evidence_ids_recorded`, `no_finance_reliance_inference=true`,
  `no_uat_pass_inference=true` and `no_auto_production_go=true` so final owner
  decisions cannot be inferred from route evidence or PASS_LOCAL checks.
- `check:heu-accounting-open-blocker-action-queue` packages the current
  ACCT-00, ACCT-11 and ACCT-12 blocker set in
  `docs/HEU_ACCOUNTING_OPEN_BLOCKER_ACTION_QUEUE_20260703.md` with
  `ACCT_OPEN_BLOCKER_ACTION_READY / NO_GO / BLOCKED`, ACCT-BLOCKER-01 through
  ACCT-BLOCKER-04 and explicit owner-only closure rules.

## Tóm Tắt Vận Hành Tiếng Việt

Readiness gate in thêm hai dòng tiếng Việt cho người vận hành nhưng vẫn giữ
nguyên token kiểm soát:

- `TOM_TAT_KE_TOAN`: diễn giải nhanh `NO_GO` hoặc `PASS_LOCAL`, số lượng kiểm
  tra đã PASS và việc còn blocker trước UAT nội bộ.
- `VIEC_CAN_LAM_TIEP`: chỉ ra việc kế tiếp theo ACCT-00, ACCT-11 và ACCT-12.

Kết quả hiện tại vẫn là `TOM_TAT_KE_TOAN: NO_GO` vì `ACCT-00` còn scope
baseline/negative-control account, `ACCT-11` còn evidence/owner risk closure
và `ACCT-12` còn signed UAT/owner route closure. Khi toàn bộ local guard xanh,
`TOM_TAT_KE_TOAN: PASS_LOCAL` vẫn chỉ là đóng gói local, không tự approve UAT,
finance reliance, owner GO/NO-GO hay production GO.

## Completion Slices

| Slice | Small goal | Current local status | Main evidence | Exit rule |
|---|---|---|---|---|
| ACCT-00 | Accounting scope baseline | PASS_LOCAL_QUEUE | `docs/HEU_PERMISSION_SCOPE_OPERATION_BREAKDOWN_20260703.md`; `docs/HEU_USER_SCOPE_BASELINE_REPAIR_QUEUE_20260703.md`; `docs/HEU_NEGATIVE_CONTROL_ACCOUNT_QUEUE_20260703.md`; `docs/HEU_ACCOUNTING_NEGATIVE_CONTROL_OWNER_ACTION_QUEUE_20260703.md`; `docs/HEU_ACCOUNTING_OPEN_BLOCKER_ACTION_QUEUE_20260703.md`; `npm.cmd run check:heu-accounting-local-readiness`; `npm.cmd run check:heu-user-scope-baseline-repair-queue`; `npm.cmd run check:heu-finance-payment-scope-readiness`; `npm.cmd run check:heu-negative-control-account-queue`; `npm.cmd run check:heu-accounting-negative-control-owner-action-queue`; `npm.cmd run check:heu-accounting-open-blocker-action-queue`; `npm.cmd run audit:heu-role-scope-uat-pack` | No wider finance user lane until role/workspace and negative-control UAT evidence are signed; if `missing_visibility>0`, `missing_business_scope>0` or `ttgdtx_negative_candidates=0`, owner must close `ACCT-00-SCOPE-BASELINE-DECISION-CHECKLIST`, fix the visibility/business-scope baseline and create/link `REAL_OUT_OF_SCOPE_NEGATIVE_01` through the approved secure channel before signed browser UAT. |
| ACCT-01 | Accounting operating spine | PASS_LOCAL | `lib/ttgdtx-operating-controls.ts`; `components/ttgdtx/ttgdtx-operating-control-strip.tsx`; `npm.cmd run audit:ttgdtx-operating-control-ui` | Every finance page shows step, owner, blockers and next action before UAT. |
| ACCT-02 | Contract and tuition basis | PASS_LOCAL | `database/step88_ttgdtx_partner_contract_master.sql`; `database/step89_ttgdtx_tuition_policy.sql`; `npm.cmd run audit:ttgdtx-contract-tuition-master-guard` | Signed legal/KHTC UAT confirms P2-01 and P2-02 before finance reliance. |
| ACCT-03 | Legal/finance gate before receivable | PASS_LOCAL_GATE | `docs/P0_19_P2_01_P2_02_PILOT_OPEN_UAT_RUNBOOK.md`; `components/ttgdtx/ttgdtx-p019-gate-guard.tsx`; `components/ttgdtx/ttgdtx-p019-uat-evidence-checklist.tsx`; P0-19 immediate stop guard; P0-19 waiver/exception register; P0-19 acceptance matrix; P0-19 gate decision manifest; `npm.cmd run audit:ttgdtx-p019-gate-guard` | P0-19 decision manifest is signed outside Git/Codex/chat; no receivable is created from an unapproved, unsigned, sandbox-only or waived gate. |
| ACCT-04 | Receivable creation | PASS_LOCAL | `database/step90_ttgdtx_student_receivables.sql`; unique active lead/policy/term guard; audit trigger; `docs/HEU_ACCOUNTING_NO_DUPLICATE_CONTROL_LEDGER_20260703.md`; `npm.cmd run audit:ttgdtx-receivable-payment-lifecycle`; `npm.cmd run check:heu-accounting-no-duplicate-control-ledger` | P2-03 duplicate receivable, lifecycle transition and audit-log UAT are signed. |
| ACCT-05 | Tuition collection and invoice/chung-tu | PASS_LOCAL | `database/step96_ttgdtx_tuition_collection_p2_10.sql`; active voucher uniqueness and over-collection guard; `lib/ttgdtx-invoice-policy.ts`; `docs/HEU_ACCOUNTING_NO_DUPLICATE_CONTROL_LEDGER_20260703.md`; `npm.cmd run audit:ttgdtx-invoice-policy`; `npm.cmd run audit:vnd-money-format`; `npm.cmd run check:heu-accounting-no-duplicate-control-ledger` | P2-10 cannot over-collect or duplicate vouchers; invoice/chung-tu owner decision is signed. |
| ACCT-06 | Reconciliation and period lock | PASS_LOCAL | `database/step101_ttgdtx_reconciliation_p2_13.sql`; `database/step104_ttgdtx_reconciliation_approval_p2_14.sql`; one-payment-one-active-line guard; `docs/HEU_ACCOUNTING_NO_DUPLICATE_CONTROL_LEDGER_20260703.md`; `npm.cmd run audit:ttgdtx-period-lock-policy`; `npm.cmd run audit:ttgdtx-reconciliation-repair-safety`; `npm.cmd run check:heu-accounting-no-duplicate-control-ledger` | One receipt can be in only one active reconciliation line; locked-period adjustment needs human evidence. |
| ACCT-07 | Payment request dossier | PASS_LOCAL | `database/step105_ttgdtx_partner_payment_request_p2_15.sql`; batch/request-line uniqueness; `components/ttgdtx/ttgdtx-payment-dossier-checklist.tsx`; `docs/HEU_ACCOUNTING_NO_DUPLICATE_CONTROL_LEDGER_20260703.md`; `npm.cmd run audit:ttgdtx-payment-dossier-checklist`; `npm.cmd run check:heu-accounting-no-duplicate-control-ledger` | P2-15 opens only from locked P2-14, complete BBNT/partner-invoice evidence and no duplicate batch request. |
| ACCT-08 | Payment approval separation | PASS_LOCAL | `database/step106_ttgdtx_payment_request_approval_p2_16.sql`; `components/ttgdtx/ttgdtx-payment-approval-separation-guard.tsx` | P2-16 CHECK happens before APPROVE; maker/checker/approver exception requires owner proof. |
| ACCT-09 | Payout record without duplicate payment | PASS_LOCAL_LEDGER | `database/step107_ttgdtx_payment_execution_p2_17.sql`; `docs/P2_17_DUPLICATE_PAYOUT_UAT_RUNBOOK.md`; `docs/P2_17_DUPLICATE_PAYOUT_UAT_EVIDENCE_LEDGER_20260703.md`; `docs/HEU_ACCOUNTING_NO_DUPLICATE_CONTROL_LEDGER_20260703.md`; payout acceptance matrix; payout release decision manifest; mandatory payout boundary acknowledgment; `npm.cmd run audit:ttgdtx-payout-duplicate-guard`; `npm.cmd run audit:ttgdtx-payout-execution-readiness`; `npm.cmd run check:heu-accounting-no-duplicate-control-ledger` | P2-17-01 through P2-17-11, P2-17-ACCEPT-01 through P2-17-ACCEPT-06, ACCT-NODUP-05 and `P2_17_RELEASE_READY / NO_GO / BLOCKED` are signed outside Git/Codex/chat before any real payout reliance. |
| ACCT-10 | Accounting dashboard and Finance Desk | PASS_LOCAL | `database/step108_ttgdtx_accounting_dashboard_p2_18.sql`; `database/step111_heu_finance_desk.sql`; `app/finance-desk/page.tsx`; `npm.cmd run audit:ttgdtx-dashboard-source-reconciliation`; `npm.cmd run audit:heu-finance-desk` | P2-18 and P5-03 are read-only, source-reconciled and signed by KHTC/BGH before reliance. |
| ACCT-11 | Audit, hard-delete and rollback safety | PASS_LOCAL_RISK_LEDGER | `docs/HEU_ACCOUNTING_RISK_CLOSURE_LEDGER_20260703.md`; `docs/HEU_ACCOUNTING_OPEN_BLOCKER_ACTION_QUEUE_20260703.md`; `npm.cmd run check:heu-accounting-risk-closure-ledger`; `npm.cmd run check:heu-accounting-open-blocker-action-queue`; `npm.cmd run audit:ttgdtx-audit-log`; `npm.cmd run audit:ttgdtx-audit-trail-guard`; `npm.cmd run audit:hard-delete-boundary-guard`; `npm.cmd run audit:ttgdtx-backup-restore-dry-run-pack`; `npm.cmd run audit:ttgdtx-migration-order-guard` | `ACCT_11_RISK_READY / NO_GO / BLOCKED` is signed outside Git/Codex/chat after backup/restore proof, migration order, audit trace, rollback/redaction proof, cascade conversion or written waiver, `ACCT-11-FINAL-RISK-DEPENDENCY-LOCK` and `ACCT-11-FINAL-RISK-DECISION-PACKET` are closed; if `pending_external_evidence>0` or `pending_owner>0`, the local readiness gate stays NO_GO. |
| ACCT-12 | Controlled UAT and owner closure | PASS_LOCAL_OWNER_LEDGER | `docs/HEU_ACCOUNTING_UAT_OWNER_CLOSURE_LEDGER_20260703.md`; `docs/HEU_ACCOUNTING_NEGATIVE_CONTROL_OWNER_ACTION_QUEUE_20260703.md`; `docs/HEU_ACCOUNTING_OPEN_BLOCKER_ACTION_QUEUE_20260703.md`; `docs/TTGDTX_UAT_EXECUTION_LOG_20260625.md`; `docs/TTGDTX_SIGNED_UAT_EXECUTION_ROUTING_HUB_20260628.md`; `docs/TTGDTX_PRODUCTION_OWNER_SIGNOFF_PACK_20260627.md`; `npm.cmd run check:heu-accounting-owner-closure-ledger`; `npm.cmd run check:heu-accounting-open-blocker-action-queue`; `npm.cmd run audit:ttgdtx-signed-uat-execution-routing-hub`; `npm.cmd run audit:ttgdtx-production-owner-signoff-pack`; `npm.cmd run audit:ttgdtx-production-readiness-guard` | `ACCT_12_OWNER_READY / NO_GO / BLOCKED` is signed outside Git/Codex/chat after all UAT-ROUTE-01 through UAT-ROUTE-11, finance reliance, risk closure, negative-control proof, `ACCT-12-NEGATIVE-CONTROL-PROOF-DEPENDENCY-LOCK`, `ACCT-12-SIGNED-ROUTE-EVIDENCE-INTAKE-PACKET`, `ACCT-12-FINANCE-RELIANCE-DEPENDENCY-LOCK`, `ACCT-12-FINANCE-RELIANCE-DECISION-CHECKLIST`, `ACCT-12-ACCESS-CLOSURE-DEPENDENCY-LOCK`, `ACCT-12-ACCESS-CLOSURE-DECISION-CHECKLIST`, `ACCT-12-FINAL-OWNER-DEPENDENCY-LOCK`, `ACCT-12-FINAL-OWNER-DECISION-CHECKLIST`, owner quorum, access closure and owner GO/NO-GO are closed; if `pending_external_evidence>0` or `pending_owner>0`, the local readiness gate stays NO_GO. |

## Small-Goal Work Order

Use this order when optimizing or completing the module:

1. Close ACCT-00 scope and negative-control account queue.
2. Keep ACCT-01 operating spine visible on every accounting screen.
3. Confirm ACCT-02 and ACCT-03 before any receivable or payment reliance.
4. Verify ACCT-04 through ACCT-06 with synthetic and redacted UAT cases.
5. Verify ACCT-07 through ACCT-09 with duplicate and evidence-stop cases.
6. Verify ACCT-10 dashboard/Finance Desk as read-only source reconciliation.
7. Close ACCT-11 risk controls: audit trace, hard-delete/cascade, backup,
   rollback and migration order.
8. Execute ACCT-12 signed UAT route closure and owner GO/NO-GO.

Do not skip ahead from a local green guard to production reliance. The next
slice can start only when the previous slice is either PASS_LOCAL for code work
or explicitly signed/blocked by the responsible owner for real operation.

## Focused Command Set

Run these commands while working this module:

```powershell
npm.cmd run check:heu-accounting-local-readiness
npm.cmd run check:heu-accounting-module-breakdown
npm.cmd run check:heu-user-scope-baseline-repair-queue
npm.cmd run check:heu-finance-payment-scope-readiness
npm.cmd run check:heu-negative-control-account-queue
npm.cmd run check:heu-accounting-negative-control-owner-action-queue
npm.cmd run check:heu-accounting-risk-closure-ledger
npm.cmd run check:heu-accounting-owner-closure-ledger
npm.cmd run check:heu-accounting-open-blocker-action-queue
npm.cmd run audit:ttgdtx-operating-control-ui
npm.cmd run audit:ttgdtx-contract-tuition-master-guard
npm.cmd run audit:ttgdtx-p019-gate-guard
npm.cmd run audit:ttgdtx-payment-dossier-checklist
npm.cmd run audit:ttgdtx-invoice-policy
npm.cmd run audit:vnd-money-format
npm.cmd run audit:ttgdtx-period-lock-policy
npm.cmd run audit:ttgdtx-reconciliation-repair-safety
npm.cmd run audit:ttgdtx-receivable-payment-lifecycle
npm.cmd run check:heu-accounting-no-duplicate-control-ledger
npm.cmd run audit:ttgdtx-payout-duplicate-guard
npm.cmd run audit:ttgdtx-payout-execution-readiness
npm.cmd run audit:ttgdtx-dashboard-source-reconciliation
npm.cmd run audit:heu-finance-desk
npm.cmd run audit:ttgdtx-audit-log
npm.cmd run audit:ttgdtx-audit-trail-guard
npm.cmd run audit:hard-delete-boundary-guard
npm.cmd run audit:ttgdtx-signed-uat-execution-routing-hub
npm.cmd run audit:ttgdtx-production-owner-signoff-pack
npm.cmd run audit:ttgdtx-production-readiness-guard
npm.cmd run audit:ttgdtx-release-gates
npm.cmd run build
```

## Current Local Conclusion

The accounting module is locally packaged for controlled UAT, but it is not
complete for real operation.

Current local closure notes:

- ACCT-00 because Finance/payment scope checks depend on the user scope
  baseline repair queue, service-role-backed readiness, the negative-control
  queue, and owner-created
  `REAL_OUT_OF_SCOPE_NEGATIVE_01` proof when no TTGDTX negative candidate
  exists.
- ACCT-03 because P0-19 is locally packaged with the immediate stop guard,
  waiver/exception register, acceptance matrix and gate decision manifest, but
  signed legal/finance UAT still controls real receivable reliance.
- ACCT-04 through ACCT-06 because local integrity guards now explicitly check
  receivable/payment lifecycle, invoice/chung-tu policy, VND money formatting,
  locked-period policy and reconciliation repair safety before downstream
  payment or dashboard reliance.
- ACCT-04 through ACCT-09 because
  `docs/HEU_ACCOUNTING_NO_DUPLICATE_CONTROL_LEDGER_20260703.md` and
  `check:heu-accounting-no-duplicate-control-ledger` now keep active
  receivable, tuition voucher, reconciliation payment, payment request and
  payout duplicate guards in the same readiness chain.
- ACCT-09 because duplicate payout prevention is the highest-risk money
  movement boundary, and the local ledger now separates PASS_LOCAL packaging
  from signed payout UAT evidence.

ACCT-11 now has a local risk-closure ledger, but the real closure decision is
still NO-GO until audit trace evidence, hard-delete/cascade conversion or
written waiver, backup/restore proof, rollback/redaction proof and
Step90-Step110 migration order are signed outside Git/Codex/chat.
`ACCT-11-RISK-OWNER-PACKET` routes
`owner_action_packet=ACCT-11_RISK_CLOSURE` to Audit, IT_DATA, KHTC, PHAP_CHE,
BGH and process owners; it is routing only, not evidence acceptance.
`ACCT-11-AUDIT-TRACE-CLOSURE-CHECKLIST` requires
`audit_trace_checklist=ACCT-11_AUDIT_TRACE_CLOSURE`,
`required_inputs=ttgdtx_write_trigger_coverage_confirmed,audit_trace_ui_confirmed,acceptance_matrix_reviewed,decision_manifest_reviewed`,
`required_closure=audit_log_trigger_coverage_recorded,sampled_actor_recorded,sampled_entity_recorded,sampled_action_recorded,sampled_timestamp_recorded,before_after_usefulness_recorded,controlled_evidence_ids_recorded,owner_quorum_recorded`,
`audit_log_trigger_coverage_recorded`, `sampled_actor_recorded`,
`sampled_entity_recorded`, `sampled_action_recorded`,
`sampled_timestamp_recorded`, `before_after_usefulness_recorded`,
`no_raw_audit_payload=true`, `no_audit_log_mutation=true`,
`no_auto_acceptance=true` and `no_auto_production_go=true` before ACCT-11 can
support later risk closure steps.
`ACCT-11-HARD-DELETE-CASCADE-CLOSURE-CHECKLIST` requires
`hard_delete_cascade_checklist=ACCT-11_HARD_DELETE_CASCADE_CLOSURE`,
`required_inputs=audit_trace_closed,p6_06_boundary_guard_passed,cascade_finding_register_reviewed,conversion_or_waiver_path_identified`,
`required_closure=ttgdtx_hard_delete_boundary_recorded,p6_06_findings_triaged,conversion_or_written_waiver_recorded,protected_record_retention_recorded,cascade_execution_blocked,controlled_evidence_ids_recorded,owner_quorum_recorded`,
`ttgdtx_hard_delete_boundary_recorded`, `p6_06_findings_triaged`,
`conversion_or_written_waiver_recorded`,
`protected_record_retention_recorded`, `cascade_execution_blocked`,
`no_hard_delete_execution=true`, `no_cascade_execution=true`,
`no_owner_waiver_inference=true`, `no_auto_acceptance=true` and
`no_auto_production_go=true` before ACCT-11 can support backup/restore proof,
migration order, rollback/redaction proof or final risk decision.
`ACCT-11-BACKUP-RESTORE-PROOF-CHECKLIST` requires
`backup_restore_checklist=ACCT-11_BACKUP_RESTORE_PROOF`,
`required_inputs=audit_trace_closed,hard_delete_boundary_closed,restore_target_identified,rollback_redaction_path_defined`,
`required_closure=backup_id_recorded,restore_target_recorded,target_isolation_recorded,restore_smoke_check_recorded,controlled_evidence_ids_recorded,owner_quorum_recorded`,
`backup_id_recorded`, `restore_target_recorded`,
`target_isolation_recorded`, `restore_smoke_check_recorded`,
`no_raw_backup_or_database_export=true`, `no_migration_approval=true`,
`no_auto_acceptance=true` and `no_auto_production_go=true` before migration
order or final risk decision can support signed accounting UAT.
`ACCT-11-MIGRATION-ORDER-SIGNOFF-CHECKLIST` requires
`migration_order_checklist=ACCT-11_MIGRATION_ORDER_SIGNOFF`,
`required_inputs=backup_restore_proof_closed,audit_trace_closed,hard_delete_boundary_closed,rollback_redaction_path_defined`,
`required_closure=step90_step110_order_signed,signer_authority_recorded,migration_scope_recorded,exception_decisions_recorded,rollback_note_recorded,controlled_evidence_ids_recorded,owner_quorum_recorded`,
`step90_step110_order_signed`, `signer_authority_recorded`,
`migration_scope_recorded`, `exception_decisions_recorded`,
`rollback_note_recorded`, `no_migration_execution=true`,
`no_auto_migration_approval=true`, `no_auto_acceptance=true` and
`no_auto_production_go=true` before ACCT-11 can support signed migration-order
reliance.
`ACCT-11-ROLLBACK-REDACTION-PROOF-CHECKLIST` requires
`rollback_redaction_checklist=ACCT-11_ROLLBACK_REDACTION_PROOF`,
`required_inputs=backup_restore_proof_closed,migration_order_signed,audit_trace_closed,protected_evidence_identified`,
`required_closure=rollback_path_recorded,redaction_path_recorded,protected_evidence_retained,audit_history_retained,cleanup_scope_recorded,controlled_evidence_ids_recorded,owner_quorum_recorded`,
`rollback_path_recorded`, `redaction_path_recorded`,
`protected_evidence_retained`, `audit_history_retained`,
`cleanup_scope_recorded`, `no_hard_delete_execution=true`,
`no_cascade_execution=true`, `no_evidence_destruction=true`,
`no_auto_acceptance=true` and `no_auto_production_go=true` before ACCT-11 can
support final risk decision.
`ACCT-11-RISK-FINAL-DECISION-CHECKLIST` requires
`risk_decision_checklist=ACCT-11_FINAL_RISK_DECISION`,
`final_risk_decision_recorded`, `owner_quorum_recorded`,
`waiver_or_correction_recorded`, `boundary_acknowledged`,
`no_owner_waiver_inference=true`, `no_auto_migration_approval=true` and
`no_auto_production_go=true` before ACCT-11 can support signed accounting UAT.
`ACCT-11-FINAL-RISK-DECISION-PACKET` requires
`final_risk_decision_packet=ACCT-11_FINAL_RISK_DECISION_PACKET`,
`required_inputs=audit_trace_closed,hard_delete_cascade_closed,backup_restore_proof_closed,migration_order_signed,rollback_redaction_proof_closed,controlled_evidence_ids_recorded`,
`allowed_decision_values=PASS,NO_GO,BLOCKED`,
`required_decision_record=final_risk_decision_recorded,owner_quorum_recorded,residual_risk_statement_recorded,waiver_or_correction_recorded,boundary_acknowledged,controlled_evidence_ids_recorded`,
`residual_risk_statement_recorded`, `no_evidence_acceptance=true`,
`no_finance_reliance_inference=true`, `no_uat_pass_inference=true`,
`no_owner_go_inference=true` and `no_auto_production_go=true` before ACCT-11
can feed ACCT-12 finance reliance, signed UAT closure or final owner decision.

ACCT-12 now has a local owner/UAT closure ledger, but the real owner decision is
still NO-GO until UAT-ROUTE-01 through UAT-ROUTE-11, finance reliance closure,
negative-control proof, risk closure and P0-09 final owner GO/NO-GO are signed
outside Git/Codex/chat.
`ACCT-12-NEGATIVE-CONTROL-PROOF-DEPENDENCY-LOCK` requires
`negative_control_proof_dependency_lock=ACCT-12_NEGATIVE_CONTROL_PROOF_DEPENDENCY`,
`required_inputs=ACCT-00_SCOPE_EXTERNAL_CLOSURE_HANDOFF_closed,negative_control_final_proof_decision_packet_closed,negative_control_proof_decision_recorded,controlled_evidence_id_recorded,reviewer_recorded,owner_decision_recorded,blocker_state_recorded`,
`required_dependency_record=ACCT-00_SCOPE_EXTERNAL_CLOSURE_HANDOFF_closed,ACCT-00_NEGATIVE_CONTROL_FINAL_PROOF_DECISION_closed,scope_baseline_closed,negative_control_proof_ready_verified,lead_route_denial_recorded,finance_route_denial_recorded,evidence_route_denial_recorded,audit_route_denial_recorded,settings_route_denial_recorded,linked_signed_route_evidence_packet_recorded`,
`blocked_if=ACCT-00_SCOPE_EXTERNAL_CLOSURE_HANDOFF_closed=no,scope_baseline_closed=no,negative_control_proof_ready=no,ttgdtx_negative_candidates=0,missing_visibility>0,missing_business_scope>0`,
`next_allowed_step=ACCT-12_SIGNED_ROUTE_EVIDENCE_INTAKE`,
`ACCT-00_SCOPE_EXTERNAL_CLOSURE_HANDOFF_closed`,
`scope_baseline_closed`,
`negative_control_final_proof_decision_packet_closed`,
`negative_control_proof_ready_verified`,
`linked_signed_route_evidence_packet_recorded`,
`no_evidence_acceptance=true`, `no_uat_pass_inference=true`,
`no_finance_reliance_inference=true` and `no_owner_go_inference=true` before
route evidence can reference negative-control proof.
`ACCT-12-SIGNED-ROUTE-EVIDENCE-INTAKE-PACKET` requires
`signed_route_evidence_packet=ACCT-12_SIGNED_ROUTE_EVIDENCE_INTAKE`,
`required_inputs=negative_control_proof_closed,route_execution_log_reviewed,controlled_evidence_storage_confirmed,owner_lane_confirmed`,
`required_route_record=uat_route_id_recorded,controlled_evidence_id_recorded,redaction_reviewer_recorded,route_result_recorded,route_owner_signature_recorded,linked_acceptance_item_recorded,blocker_state_recorded`,
`uat_route_id_recorded`, `redaction_reviewer_recorded`,
`route_owner_signature_recorded`, `linked_acceptance_item_recorded`,
`blocker_state_recorded`, `no_raw_screenshot_or_pii=true`,
`no_evidence_acceptance=true`, `no_uat_pass_inference=true`,
`no_finance_reliance_inference=true`, `no_owner_go_inference=true` and
`no_auto_production_go=true` before route evidence can feed finance reliance,
access closure or final owner decision.
`ACCT-12-FINANCE-RELIANCE-DEPENDENCY-LOCK` requires
`finance_reliance_dependency_lock=ACCT-12_FINANCE_RELIANCE_DEPENDENCY`,
`source=accounting_owner_closure_ledger_runtime`,
`required_inputs=signed_route_evidence_closed,negative_control_dependency_closed,legal_finance_gate_signed,no_duplicate_ledger_signed,risk_closure_signed,dashboard_finance_desk_signed,access_closure_route_recorded`,
`required_dependency_record=signed_route_evidence_packet_closed,negative_control_proof_dependency_lock_closed,p0_19_legal_finance_gate_signed,no_duplicate_ledger_signed,final_risk_decision_packet_closed,dashboard_finance_desk_signed,access_closure_route_recorded`,
`blocked_if=signed_route_evidence_closed=no,negative_control_proof_ready=no,legal_finance_gate_signed=no,no_duplicate_ledger_signed=no,risk_closure_signed=no,dashboard_finance_desk_signed=no,access_closure_route_recorded=no`,
`next_allowed_step=ACCT-12_FINANCE_RELIANCE_DECISION`,
`signed_route_evidence_packet_closed`,
`negative_control_proof_dependency_lock_closed`,
`p0_19_legal_finance_gate_signed`, `no_duplicate_ledger_signed`,
`final_risk_decision_packet_closed`, `dashboard_finance_desk_signed`,
`access_closure_route_recorded`, `no_evidence_acceptance=true`,
`no_uat_pass_inference=true`, `no_finance_reliance_inference=true`,
`no_voucher_posting=true`, `no_bank_transfer=true`,
`no_owner_go_inference=true`, `no_auto_approval=true` and
`no_auto_production_go=true` before route evidence, negative-control proof,
P0-19, no-duplicate, risk, dashboard or access closure material can support
finance reliance.
`ACCT-12-FINANCE-RELIANCE-DECISION-CHECKLIST` requires
`finance_reliance_checklist=ACCT-12_FINANCE_RELIANCE_DECISION`,
`required_inputs=scope_negative_control_closed,legal_finance_gate_signed,no_duplicate_ledger_signed,risk_closure_signed,dashboard_finance_desk_signed,access_closure_recorded`,
`required_closure=finance_reliance_decision_recorded,finance_owner_recorded,accountant_access_decision_recorded,controlled_evidence_ids_recorded,owner_quorum_recorded`,
`finance_owner_recorded`, `accountant_access_decision_recorded`,
`controlled_evidence_ids_recorded`, `owner_quorum_recorded`,
`no_finance_reliance_inference=true`, `no_voucher_posting=true`,
`no_bank_transfer=true` and `no_auto_approval=true` before anyone treats the
accounting module as finance-reliable.
`ACCT-12-ACCESS-CLOSURE-DEPENDENCY-LOCK` requires
`access_closure_dependency_lock=ACCT-12_ACCESS_CLOSURE_DEPENDENCY`,
`source=accounting_owner_closure_ledger_runtime`,
`required_inputs=finance_reliance_decision_closed,signed_route_evidence_closed,negative_control_dependency_closed,scope_baseline_closed,risk_closure_signed,p0_17_access_closure_route_recorded,owner_lane_confirmed`,
`required_dependency_record=finance_reliance_decision_recorded,finance_owner_recorded,accountant_access_decision_recorded,signed_route_evidence_packet_closed,negative_control_proof_dependency_lock_closed,scope_baseline_closed,final_risk_decision_packet_closed,p0_17_access_closure_route_recorded`,
`blocked_if=finance_reliance_decision_recorded=no,signed_route_evidence_closed=no,scope_baseline_closed=no,risk_closure_signed=no,p0_17_access_closure_route_recorded=no,owner_lane_confirmed=no`,
`next_allowed_step=ACCT-12_ACCESS_CLOSURE_DECISION`,
`p0_17_access_closure_route_recorded`, `no_password_or_invite_link=true`,
`no_auto_access_change=true`, `no_account_create=true`,
`no_scope_grant=true`, `no_evidence_acceptance=true`,
`no_finance_reliance_inference=true`, `no_owner_go_inference=true` and
`no_auto_production_go=true` before ACCT-12 can route accountant, privileged,
temporary or negative-account access closure.
`ACCT-12-ACCESS-CLOSURE-DECISION-CHECKLIST` requires
`access_closure_checklist=ACCT-12_ACCESS_CLOSURE_DECISION`,
`required_inputs=scope_baseline_closed,negative_control_proof_closed,signed_route_evidence_closed,finance_reliance_decision_recorded,risk_closure_signed`,
`required_closure=accountant_retain_revoke_block_recorded,privileged_access_review_recorded,temporary_access_removed,negative_account_access_locked,access_closure_decision_recorded,controlled_evidence_ids_recorded,owner_quorum_recorded`,
`accountant_retain_revoke_block_recorded`,
`privileged_access_review_recorded`, `temporary_access_removed`,
`negative_account_access_locked`, `access_closure_decision_recorded`,
`controlled_evidence_ids_recorded`, `owner_quorum_recorded`,
`no_password_or_invite_link=true`, `no_auto_access_change=true`,
`no_finance_reliance_inference=true` and `no_auto_production_go=true` before
ACCT-12 can support signed accounting UAT or final owner decision.
`ACCT-12-FINAL-OWNER-DECISION-CHECKLIST` requires
`owner_decision_checklist=ACCT-12_FINAL_OWNER_DECISION`,
`required_closure=finance_reliance_decision_recorded,final_owner_go_no_go_recorded,owner_quorum_recorded,access_closure_decision_recorded,controlled_evidence_ids_recorded`,
`finance_reliance_decision_recorded`, `final_owner_go_no_go_recorded`,
`owner_quorum_recorded`, `access_closure_decision_recorded`,
`controlled_evidence_ids_recorded`, `no_finance_reliance_inference=true`,
`no_uat_pass_inference=true` and `no_auto_production_go=true` before ACCT-12
can support signed accounting UAT.

The current negative-control owner-action queue makes `missing_visibility>0`,
`missing_business_scope>0` and `ttgdtx_negative_candidates=0` explicit blockers
for signed accounting browser UAT until IT_DATA/TRUONG_PHONG/Audit/KHTC owners
fix the baseline, create/link `REAL_OUT_OF_SCOPE_NEGATIVE_01` and sign
controlled evidence outside Git/Codex/chat. The ACCT-00 negative evidence
checklist requires
`scope_decision_checklist=ACCT-00_SCOPE_BASELINE_OWNER_DECISION`,
`lead_visibility_choice_recorded`, `business_scope_choice_recorded`,
`owner_lane_confirmed`, `secure_admin_channel_recorded`,
`post_repair_snapshot_recorded`, `no_all_visibility_for_non_admin=true` and
`no_auto_scope_change=true` before negative-control account work proceeds; the
ACCT-00 scope repair execution packet requires
`scope_repair_execution_packet=ACCT-00_SCOPE_REPAIR_EXECUTION`,
`required_execution_record=pre_repair_snapshot_recorded,approved_visibility_choice_applied,approved_business_scope_applied,workspace_preference_verified,post_repair_snapshot_recorded,controlled_evidence_id_recorded`,
`pre_repair_snapshot_recorded`, `approved_visibility_choice_applied`,
`approved_business_scope_applied`, `workspace_preference_verified`,
`no_raw_profile_id=true`, `no_service_role_key_in_evidence=true`,
`no_auto_scope_change=true`, `no_auto_uat_approval=true` and
`no_auto_production_go=true`; the ACCT-00 post-repair verification packet
requires
`scope_post_repair_verification_packet=ACCT-00_SCOPE_POST_REPAIR_VERIFICATION`,
`scope_baseline_closed=no`,
`required_inputs=scope_repair_execution_closed,post_repair_snapshot_recorded,controlled_evidence_id_recorded`,
`required_verification_record=missing_visibility=0,missing_business_scope=0,non_admin_all_visibility=0,workspace_mismatch=0,workspace_preference_inside_scope_confirmed,negative_control_queue_re_run_recorded,controlled_evidence_id_recorded`,
`next_allowed_step=ACCT-00_SCOPE_EXTERNAL_CLOSURE_HANDOFF` and
`no_auto_acceptance=true`; the ACCT-00 negative account dependency lock
requires
`negative_account_dependency_lock=ACCT-00_NEGATIVE_ACCOUNT_DEPENDENCY`,
`required_inputs=scope_external_closure_handoff_closed,scope_post_repair_verification_closed,scope_baseline_closed,owner_lane_confirmed,secure_admin_channel_recorded,controlled_evidence_id_recorded`,
`required_dependency_record=scope_external_closure_handoff_closed,missing_visibility=0,missing_business_scope=0,non_admin_all_visibility=0,workspace_mismatch=0,workspace_preference_inside_scope_confirmed,negative_control_queue_re_run_recorded,controlled_evidence_id_recorded,post_repair_snapshot_recorded`,
`blocked_if=scope_external_closure_handoff_closed=no,scope_baseline_closed=no,missing_visibility>0,missing_business_scope>0,non_admin_all_visibility>0,workspace_mismatch>0`,
`next_allowed_step=ACCT-00_NEGATIVE_ACCOUNT_PROVISIONING`,
`no_auto_account_create=true`, `no_auto_scope_grant=true`,
`no_auto_scope_change=true`, `no_evidence_acceptance=true`,
`no_uat_pass_inference=true`, `no_finance_reliance_inference=true` and
`no_owner_go_inference=true`; the
ACCT-00 provisioning checklist requires
`negative_account_checklist=ACCT-00_NEGATIVE_ACCOUNT_PROVISIONING`,
`required_closure=target_account_label_recorded,non_target_business_scope_recorded,target_segment_exclusion_recorded,credential_boundary_acknowledged,controlled_evidence_id_recorded`,
`target_account_label_recorded`, `non_target_business_scope_recorded`,
`target_segment_exclusion_recorded`, `credential_boundary_acknowledged`,
`controlled_evidence_id_recorded`, `no_ttgdtx_scope=true`,
`no_settings_or_permission_access=true` and `no_auto_account_create=true`
before browser denial evidence starts; the ACCT-00 negative account execution
packet requires
`negative_account_execution_packet=ACCT-00_NEGATIVE_ACCOUNT_EXECUTION`,
`required_inputs=negative_account_dependency_lock_closed,provisioning_decision_closed,target_account_label_recorded,secure_admin_channel_recorded`,
`blocked_if=negative_account_dependency_lock_closed=no,scope_baseline_closed=no,missing_visibility>0,missing_business_scope>0`,
`required_execution_record=auth_profile_link_recorded,non_target_business_scope_applied,target_segment_exclusion_verified,lead_visibility_non_all_verified,settings_permission_denial_ready,credential_boundary_acknowledged,controlled_evidence_id_recorded`,
`auth_profile_link_recorded`, `non_target_business_scope_applied`,
`target_segment_exclusion_verified`, `lead_visibility_non_all_verified`,
`settings_permission_denial_ready`, `no_raw_account_id=true`,
`no_auto_account_create=true`, `no_auto_scope_grant=true`,
`no_auto_uat_approval=true` and `no_auto_production_go=true` before browser
denial evidence starts; the ACCT-00 negative account post-execution
verification packet requires
`negative_account_post_execution_verification_packet=ACCT-00_NEGATIVE_ACCOUNT_POST_EXECUTION_VERIFICATION`,
`negative_account_ready=no`,
`required_inputs=negative_account_execution_closed,auth_profile_link_recorded,non_target_business_scope_applied,target_segment_exclusion_verified,controlled_evidence_id_recorded`,
`required_verification_record=ttgdtx_negative_candidates>=1,negative_account_label_recorded,auth_profile_link_verified,non_target_business_scope_verified,target_segment_exclusion_verified,lead_visibility_non_all_verified,settings_permission_denial_ready,controlled_evidence_id_recorded`,
`next_allowed_step=ACCT-00_NEGATIVE_BROWSER_DENIAL`, `no_raw_account_id=true`,
`no_auto_account_create=true`, `no_auto_scope_grant=true`,
`no_auto_acceptance=true`, `no_auto_uat_approval=true` and
`no_auto_production_go=true`; the ACCT-00 negative browser evidence dependency
lock requires
`negative_browser_evidence_dependency_lock=ACCT-00_NEGATIVE_BROWSER_EVIDENCE_DEPENDENCY`,
`required_inputs=negative_account_post_execution_verification_closed,negative_account_ready,controlled_evidence_id_recorded,reviewer_recorded,owner_lane_confirmed`,
`required_dependency_record=ttgdtx_negative_candidates>=1,negative_account_label_recorded,auth_profile_link_verified,non_target_business_scope_verified,target_segment_exclusion_verified,lead_visibility_non_all_verified,settings_permission_denial_ready,controlled_evidence_id_recorded`,
`blocked_if=negative_account_ready=no,ttgdtx_negative_candidates=0,scope_baseline_closed=no,missing_visibility>0,missing_business_scope>0`,
`next_allowed_step=ACCT-00_NEGATIVE_BROWSER_DENIAL`,
`no_browser_uat_execution=true`, `no_evidence_acceptance=true`,
`no_uat_pass_inference=true`, `no_finance_reliance_inference=true` and
`no_owner_go_inference=true`; the ACCT-00 negative evidence checklist
then requires
`negative_evidence_checklist=ACCT-00_NEGATIVE_BROWSER_DENIAL`,
`required_result=BLOCKED_OR_EMPTY_SCOPED_STATE`, `reviewer_recorded`,
`route_result_recorded`, `owner_decision_recorded`,
`no_raw_screenshot_or_pii=true` and `no_auto_acceptance=true`; the ACCT-00
negative browser route matrix then requires
`negative_route_matrix=ACCT-00_NEGATIVE_BROWSER_ROUTES`, `route_count=5`,
`required_routes=lead,finance,evidence,audit,settings`,
`expected_result=BLOCKED_OR_EMPTY_SCOPED_STATE`,
`lead_route_denial_recorded`, `finance_route_denial_recorded`,
`evidence_route_denial_recorded`, `audit_route_denial_recorded`,
`settings_route_denial_recorded`, `controlled_evidence_id_recorded`,
`reviewer_recorded`, `owner_decision_recorded`,
`no_raw_screenshot_or_pii=true` and `no_auto_acceptance=true`; the ACCT-00
negative-control final proof decision packet then requires
`negative_control_final_proof_decision_packet=ACCT-00_NEGATIVE_CONTROL_FINAL_PROOF_DECISION`,
`negative_control_proof_ready=no`,
`required_inputs=negative_browser_denial_closed,negative_browser_route_matrix_closed,controlled_evidence_id_recorded,reviewer_recorded,owner_decision_recorded`,
`required_decision_record=negative_control_proof_decision_recorded,lead_route_denial_recorded,finance_route_denial_recorded,evidence_route_denial_recorded,audit_route_denial_recorded,settings_route_denial_recorded,controlled_evidence_id_recorded,reviewer_recorded,owner_decision_recorded,blocker_state_recorded`,
`allowed_decision_values=PASS,NO_GO,BLOCKED`,
`next_allowed_step=ACCT-12_SIGNED_ROUTE_EVIDENCE_INTAKE`,
`negative_control_proof_decision_recorded`, `blocker_state_recorded`,
`no_evidence_acceptance=true`, `no_uat_pass_inference=true`,
`no_finance_reliance_inference=true` and `no_owner_go_inference=true` before
ACCT-12 can rely on negative-control proof.

The open blocker action queue
`docs/HEU_ACCOUNTING_OPEN_BLOCKER_ACTION_QUEUE_20260703.md` consolidates the
same live NO-GO rows into ACCT-BLOCKER-01 through ACCT-BLOCKER-04:
ACCT-00 scope baseline repair, ACCT-00 negative-control account create/link,
ACCT-11 risk closure with `pending_risk_external_evidence=9` and ACCT-12
owner/UAT route closure with `pending_route_external_evidence=11`. Its decision
lane is `ACCT_OPEN_BLOCKER_ACTION_READY / NO_GO / BLOCKED`; it is a PASS_LOCAL
action queue, not evidence acceptance or owner approval.

The local readiness gate `check:heu-accounting-local-readiness` intentionally
stays red while the negative-control blocker, ACCT-11 risk ledger or ACCT-12
owner ledger is red. A green gate can only mean `ACCT_LOCAL_READY / NO_GO /
BLOCKED` is locally packaged; it still cannot sign UAT, accept controlled
evidence, approve finance reliance, approve owner GO/NO-GO or mark production
GO.

Both remain local-only until signed browser UAT and owner evidence exist.
