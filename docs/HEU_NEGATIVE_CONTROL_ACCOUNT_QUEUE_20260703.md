# HEU Negative Control Account Queue - 2026-07-03

Status: PASS_LOCAL_QUEUE.
Production/UAT status: NO-GO until the negative-control account is
owner-approved, created/linked through the secure channel, tested in browser
UAT and signed outside Codex/chat.

## Purpose

This queue makes the required out-of-scope account explicit before any role,
workspace or finance lane is widened. It does not create a real user, set a
password, send an invite/reset link, approve UAT or assign broad access.

Decision lane: `NEGATIVE_CONTROL_QUEUE_READY / NO_GO / BLOCKED`.

Secret boundary: Do not paste passwords, temporary passwords, OTPs, password
reset links, account activation/invite links, service-role keys, raw student
PII, CCCD, phone numbers, bank accounts, vouchers or raw evidence into this
file, Git, Codex, chat, email notes or screenshots.

## Required Negative Lanes

| Order | Lane | Required account label | Expected result | Stop condition |
| --- | --- | --- | --- | --- |
| 1 | TTGDTX 9+ scoped lead/finance lane | `REAL_OUT_OF_SCOPE_NEGATIVE_01` | `BLOCKED` or `EMPTY_SCOPED_STATE` for `TC9_TTGDTX_LINKED` protected data | Account sees TTGDTX lead, finance, evidence, audit or settings data |
| 2 | HOU lane | `REAL_OUT_OF_SCOPE_NEGATIVE_01` or owner-approved HOU negative label | `BLOCKED` or `EMPTY_SCOPED_STATE` for HOU data | Account sees HOU ledger, COM, evidence or payment rows |
| 3 | Short Course lane | `REAL_OUT_OF_SCOPE_NEGATIVE_01` or owner-approved Short Course negative label | `BLOCKED` or `EMPTY_SCOPED_STATE` for Short Course data | Account sees Short Course students, classes, attendance, BHXH or finance rows |
| 4 | Broad lead visibility | Any active non-ADMIN/BGH test account | No `ALL` lead visibility | Non-ADMIN/BGH profile has `ALL` |
| 5 | Settings/permission matrix | Any non-IT_DATA negative account | Settings/permission matrix blocked | Account can manage users, credentials or permission matrix |

## Runtime Queue Rule

- A candidate must be an active non-ADMIN/BGH profile with explicit non-`ALL`
  lead visibility and at least one safe business scope outside the target lane.
- candidate evidence only, not owner approval. No result is an approval; it is
  only evidence for owner review.
- If no TTGDTX negative candidate exists, create/link
  `REAL_OUT_OF_SCOPE_NEGATIVE_01` through the approved secure channel outside
  Codex/chat, then assign only a non-target business scope and re-run checks.
- Negative-control evidence must be redacted and stored outside Git/Codex/chat.

## Owner Action Packet

- `npm.cmd run check:heu-negative-control-account-queue` also prints
  `NEGATIVE-CONTROL-OWNER-PACKET` with
  `owner_action_packet=target_account_label=REAL_OUT_OF_SCOPE_NEGATIVE_01`,
  `target_segment=TC9_TTGDTX_LINKED`, `ttgdtx_negative_candidates=0`,
  `baseline_missing_visibility=2`, `non_admin_all_visibility=0` and
  `required_decisions=repair_scope_baseline_first,create_or_link_negative_account,assign_non_target_business_scope,run_browser_denial_evidence,record_controlled_evidence_id`
  while the current blocker remains open.
- The packet is for IT_DATA/Audit owner-side routing only. It is not account
  creation, not a password/reset/invite instruction, not UAT evidence, not
  evidence acceptance and not owner approval.
- Owner must first close USER-SCOPE-REPAIR-01, then create or link
  `REAL_OUT_OF_SCOPE_NEGATIVE_01` outside Git/Codex/chat, assign only a
  non-target scope, run browser denial evidence and store a controlled evidence
  ID outside Git/Codex/chat.

## ACCT-00 Pre-UAT Owner Checklist

The same checker also prints `ACCT-00-PRE-UAT-OWNER-CHECKLIST` with
`owner_checklist=ACCT-00_PRE_UAT` so IT_DATA, Audit and KHTC can close the
pre-UAT sequence in one controlled lane:

1. Close `USER-SCOPE-REPAIR-01` and `USER-SCOPE-REPAIR-02` until
   `missing_visibility=0`, `missing_business_scope=0` and
   `non_admin_all_visibility=0`.
2. Create or link `REAL_OUT_OF_SCOPE_NEGATIVE_01` through the approved secure
   channel, without recording passwords, OTPs, reset links, invite links or raw
   account IDs in Git/Codex/chat.
3. Record the negative-account execution packet with auth/profile link,
   non-target scope, target-segment exclusion and credential boundary.
4. Assign only a safe non-target scope outside `TC9_TTGDTX_LINKED`.
5. Run browser denial evidence for lead, finance, evidence, audit and settings
   routes.
6. Record a controlled evidence ID outside Git/Codex/chat before signed
   accounting UAT.

Required closure tokens are
`required_closure=missing_visibility=0,missing_business_scope=0,ttgdtx_negative_candidates>=1,controlled_evidence_id_recorded`,
`no_password_or_invite_link=true` and `no_auto_fix=true`.

## ACCT-00 Scope Repair Owner Packet Lock

`check:heu-user-scope-baseline-repair-queue` emits
`ACCT-00-SCOPE-REPAIR-OWNER-PACKET-LOCK` with
`scope_repair_owner_packet_lock=ACCT-00_SCOPE_REPAIR_OWNER_PACKET_LOCK`.
`check:heu-negative-control-account-queue` mirrors the same lock at runtime as
`source=negative_control_account_queue_runtime` before any negative-account
dependency can be treated as owner-eligible.
Close it before the owner decision matrix so safe labels and owner packets are
not treated as owner approval.

The lock carries `profile_count=2`, `decision_count=4` and
`role_codes=DAO_TAO_LEAD,TCHC_LEAD`.

Required inputs are
`required_inputs=safe_owner_repair_labels_generated,owner_action_packet_generated,role_codes_recorded,decision_count_recorded,secure_owner_lookup_channel_recorded,controlled_evidence_id_recorded`.

Required dependency record is
`required_dependency_record=safe_label,role_code,owner_label_mapped,owner_lane_confirmed,secure_owner_lookup_channel_recorded,controlled_evidence_id_recorded`.

Block closure if
`blocked_if=safe_owner_repair_labels_missing,owner_action_packet_missing,role_codes_missing,decision_count_mismatch,owner_label_unmapped,secure_owner_lookup_channel_missing,controlled_evidence_id_missing,raw_profile_id_present`.

The next allowed step is
`next_allowed_step=ACCT-00_SCOPE_REPAIR_OWNER_DECISION_MATRIX`.

The lock keeps `no_raw_profile_id=true`, `no_email_or_phone=true`,
`no_password_or_invite_link=true`, `no_service_role_key_in_evidence=true`,
`no_auto_scope_change=true`, `no_evidence_acceptance=true`,
`no_uat_pass_inference=true`, `no_finance_reliance_inference=true`,
`no_owner_go_inference=true` and `no_auto_production_go=true`.

## ACCT-00 Scope Repair Owner Decision Matrix

`check:heu-user-scope-baseline-repair-queue` emits
`ACCT-00-SCOPE-REPAIR-OWNER-DECISION-MATRIX` with
`scope_repair_owner_decision_matrix=ACCT-00_SCOPE_REPAIR_OWNER_DECISION_MATRIX`.
`check:heu-negative-control-account-queue` mirrors the same matrix at runtime
as `source=negative_control_account_queue_runtime`.
Close it before treating the scope baseline owner checklist as ready for the
negative-control lane.

The current owner-side matrix carries `profile_count=2`, `decision_count=4`,
`missing_visibility_labels`, `missing_business_scope_labels` and
`role_codes=DAO_TAO_LEAD,TCHC_LEAD`.

Required owner-record tokens are
`required_owner_record=owner_label_mapped,lead_visibility_choice_recorded,business_scope_choice_recorded,owner_lane_confirmed,secure_admin_channel_recorded,controlled_evidence_id_recorded`.

Required per-label record tokens are
`required_per_label_record=safe_label,role_code,approved_visibility_choice_when_required,approved_segment_or_partner_scope_when_required,owner_reviewer,controlled_evidence_id`.

Block closure if
`blocked_if=owner_label_unmapped,required_visibility_choice_missing,required_business_scope_choice_missing,secure_admin_channel_missing,controlled_evidence_id_missing`.

The next allowed step is
`next_allowed_step=ACCT-00_SCOPE_BASELINE_OWNER_DECISION`.

This matrix must keep `no_raw_profile_id=true`, `no_email_or_phone=true`,
`no_password_or_invite_link=true`, `no_service_role_key_in_evidence=true`,
`no_auto_scope_change=true`, `no_evidence_acceptance=true`,
`no_uat_pass_inference=true`, `no_finance_reliance_inference=true`,
`no_owner_go_inference=true` and `no_auto_production_go=true`.

## ACCT-00 Scope Baseline Owner Decision Checklist

`check:heu-user-scope-baseline-repair-queue` emits
`ACCT-00-SCOPE-BASELINE-DECISION-CHECKLIST` with
`scope_decision_checklist=ACCT-00_SCOPE_BASELINE_OWNER_DECISION`.
`check:heu-negative-control-account-queue` mirrors this checklist at runtime as
`source=negative_control_account_queue_runtime`. Close it
before creating/linking the TTGDTX negative-control account:

- `lead_visibility_choice_recorded`.
- `business_scope_choice_recorded`.
- `owner_lane_confirmed`.
- `secure_admin_channel_recorded`.
- `post_repair_snapshot_recorded`.

Required closure tokens are
`required_closure=lead_visibility_choice_recorded,business_scope_choice_recorded,owner_lane_confirmed,secure_admin_channel_recorded,post_repair_snapshot_recorded`,
`no_all_visibility_for_non_admin=true`, `no_password_or_invite_link=true` and
`no_auto_scope_change=true`.

This checklist does not change scope data or approve the repair. It only
blocks the negative-control account lane from proceeding on hash labels or
PASS_LOCAL output alone.

## ACCT-00 Scope Repair Decision Dependency Lock

Before negative-control account provisioning, the upstream scope queue must
close `ACCT-00-SCOPE-REPAIR-DECISION-DEPENDENCY-LOCK` with
`scope_repair_decision_dependency_lock=ACCT-00_SCOPE_REPAIR_DECISION_DEPENDENCY`.
`check:heu-negative-control-account-queue` mirrors this lock at runtime as
`source=negative_control_account_queue_runtime`.

Required input tokens are
`required_inputs=scope_baseline_decision_checklist_closed,lead_visibility_choice_recorded,business_scope_choice_recorded,owner_lane_confirmed,secure_admin_channel_recorded`.

Required dependency-record tokens are
`required_dependency_record=approved_visibility_choice_recorded,approved_business_scope_recorded,owner_lane_confirmed,secure_admin_channel_recorded,controlled_evidence_id_recorded`.

Block owner-side scope repair execution if
`blocked_if=scope_baseline_decision_checklist_closed=no,owner_lane_confirmed=no,lead_visibility_choice_recorded=no,business_scope_choice_recorded=no,secure_admin_channel_recorded=no`.

The next allowed step after this lock is
`next_allowed_step=ACCT-00_SCOPE_REPAIR_EXECUTION`.

This lock must keep `no_all_visibility_for_non_admin=true`,
`no_password_or_invite_link=true`, `no_raw_profile_id=true`,
`no_service_role_key_in_evidence=true`, `no_auto_scope_change=true`,
`no_evidence_acceptance=true`, `no_uat_pass_inference=true`,
`no_finance_reliance_inference=true`, `no_owner_go_inference=true` and
`no_auto_production_go=true`. It is not a scope update, not evidence acceptance
and not approval for negative-account provisioning.

## ACCT-00 Scope Repair Execution Packet

Before negative-control account provisioning, the upstream scope queue must
close `ACCT-00-SCOPE-REPAIR-EXECUTION-PACKET` with
`scope_repair_execution_packet=ACCT-00_SCOPE_REPAIR_EXECUTION`.
`check:heu-negative-control-account-queue` mirrors this packet at runtime as
`source=negative_control_account_queue_runtime`.

Required execution-record tokens are
`required_execution_record=pre_repair_snapshot_recorded,approved_visibility_choice_applied,approved_business_scope_applied,workspace_preference_verified,post_repair_snapshot_recorded,controlled_evidence_id_recorded`.

This packet must keep `no_all_visibility_for_non_admin=true`,
`no_password_or_invite_link=true`, `no_raw_profile_id=true`,
`no_service_role_key_in_evidence=true`, `no_auto_scope_change=true`,
`no_auto_uat_approval=true` and `no_auto_production_go=true`. It is not a
negative-account creation step and it does not accept browser-denial evidence.

## ACCT-00 Scope Post-Repair Rerun Proof Packet

Before negative-control account provisioning, the upstream scope queue must
also close `ACCT-00-SCOPE-POST-REPAIR-RERUN-PROOF-PACKET` with
`scope_post_repair_rerun_proof_packet=ACCT-00_SCOPE_POST_REPAIR_RERUN_PROOF`.
`check:heu-negative-control-account-queue` mirrors this packet at runtime as
`source=negative_control_account_queue_runtime`.

Required input tokens are
`required_inputs=scope_repair_execution_closed,post_repair_snapshot_recorded,controlled_evidence_id_recorded,owner_lane_confirmed`.

Required rerun-record tokens are
`required_rerun_record=check_heu_user_scope_baseline_repair_queue_rerun,check_heu_negative_control_account_queue_rerun,check_heu_finance_payment_scope_readiness_rerun,check_heu_role_scope_uat_pack_rerun,check_heu_user_account_security_rerun`.

Required result-record tokens are
`required_result_record=missing_visibility=0,missing_business_scope=0,non_admin_all_visibility=0,workspace_mismatch=0,ttgdtx_negative_candidates_recomputed,finance_payment_scope_ready_recorded,role_scope_pack_passed,controlled_evidence_id_recorded`.

Block verification if
`blocked_if=scope_baseline_closed=no,post_repair_snapshot_recorded=no,controlled_evidence_id_recorded=no,negative_control_queue_re_run_recorded=no`.

The next allowed step is
`next_allowed_step=ACCT-00_SCOPE_POST_REPAIR_VERIFICATION`.

This packet must keep `no_raw_profile_id=true`,
`no_service_role_key_in_evidence=true`, `no_password_or_invite_link=true`,
`no_auto_scope_change=true`, `no_auto_account_create=true`,
`no_evidence_acceptance=true`, `no_uat_pass_inference=true`,
`no_finance_reliance_inference=true`, `no_owner_go_inference=true` and
`no_auto_production_go=true`. It is not a rerun approval, account creation or
evidence acceptance step.

## ACCT-00 Scope Post-Repair Verification Packet

Before negative-control account provisioning, the upstream scope queue must
also close `ACCT-00-SCOPE-POST-REPAIR-VERIFICATION-PACKET` with
`scope_post_repair_verification_packet=ACCT-00_SCOPE_POST_REPAIR_VERIFICATION`.

The current live packet remains `scope_baseline_closed=no` until the owner
repair brings `missing_visibility`, `missing_business_scope`,
`non_admin_all_visibility` and `workspace_mismatch` to zero.

Required input tokens are
`required_inputs=scope_repair_execution_closed,post_repair_snapshot_recorded,controlled_evidence_id_recorded`.

Required verification-record tokens are
`required_verification_record=missing_visibility=0,missing_business_scope=0,non_admin_all_visibility=0,workspace_mismatch=0,workspace_preference_inside_scope_confirmed,negative_control_queue_re_run_recorded,controlled_evidence_id_recorded`.

The next allowed step after this verification packet is
`next_allowed_step=ACCT-00_SCOPE_EXTERNAL_CLOSURE_HANDOFF`; the external
closure handoff and dependency lock below must close before provisioning is
owner-eligible.

This packet must keep `no_auto_acceptance=true`, `no_auto_uat_approval=true`
and `no_auto_production_go=true`. It does not accept evidence, create accounts,
grant scope, approve UAT, approve finance reliance, approve owner GO/NO-GO or
mark production GO.

## ACCT-00 Scope External Closure Handoff Packet

Before negative-control account provisioning, the upstream scope queue must
also close `ACCT-00-SCOPE-EXTERNAL-CLOSURE-HANDOFF-PACKET` with
`scope_external_closure_handoff_packet=ACCT-00_SCOPE_EXTERNAL_CLOSURE_HANDOFF`.
Use it as the final scope-baseline owner handoff before the negative-account
dependency lock is treated as owner-eligible.

The current live handoff remains `scope_baseline_closed=no` while
`missing_visibility=2` and `missing_business_scope=2`.

Required input tokens are
`required_inputs=scope_baseline_decision_checklist_closed,scope_repair_execution_closed,scope_post_repair_rerun_proof_closed,scope_post_repair_verification_closed,controlled_evidence_id_recorded,owner_lane_confirmed`.

Required owner-closure tokens are
`required_owner_closure=missing_visibility=0,missing_business_scope=0,non_admin_all_visibility=0,workspace_mismatch=0,lead_visibility_choice_recorded,business_scope_choice_recorded,approved_visibility_choice_applied,approved_business_scope_applied,workspace_preference_inside_scope_confirmed,post_repair_snapshot_recorded,negative_control_queue_re_run_recorded,controlled_evidence_id_recorded`.

Block the handoff if
`blocked_if=scope_baseline_closed=no,missing_visibility>0,missing_business_scope>0,non_admin_all_visibility>0,workspace_mismatch>0,controlled_evidence_id_recorded=no`.

The next allowed step after this handoff is
`next_allowed_step=ACCT-00_NEGATIVE_ACCOUNT_DEPENDENCY`.

This handoff must keep `no_raw_profile_id=true`,
`no_service_role_key_in_evidence=true`, `no_password_or_invite_link=true`,
`no_auto_scope_change=true`, `no_auto_account_create=true`,
`no_evidence_acceptance=true`, `no_uat_pass_inference=true`,
`no_finance_reliance_inference=true`, `no_owner_go_inference=true` and
`no_auto_production_go=true`. It does not change scope, create accounts,
accept evidence, approve UAT, approve finance reliance, approve owner
GO/NO-GO or mark production GO.

## ACCT-00 Negative Account Dependency Lock

`check:heu-negative-control-account-queue` also emits
`ACCT-00-NEGATIVE-ACCOUNT-DEPENDENCY-LOCK` with
`negative_account_dependency_lock=ACCT-00_NEGATIVE_ACCOUNT_DEPENDENCY`. Use it
to prevent negative-account provisioning from starting on a scope repair
execution packet, post-repair verification packet or local PASS_LOCAL queue
alone. The ACCT-00 scope external closure handoff must be closed first.

The current live lock remains `scope_baseline_closed=no` while
`missing_visibility>0` or `missing_business_scope>0`.

Required input tokens are
`required_inputs=scope_external_closure_handoff_closed,scope_post_repair_verification_closed,scope_baseline_closed,owner_lane_confirmed,secure_admin_channel_recorded,controlled_evidence_id_recorded`.

Required dependency-record tokens are
`required_dependency_record=scope_external_closure_handoff_closed,missing_visibility=0,missing_business_scope=0,non_admin_all_visibility=0,workspace_mismatch=0,workspace_preference_inside_scope_confirmed,negative_control_queue_re_run_recorded,controlled_evidence_id_recorded,post_repair_snapshot_recorded`.

Block the dependency if
`blocked_if=scope_external_closure_handoff_closed=no,scope_baseline_closed=no,missing_visibility>0,missing_business_scope>0,non_admin_all_visibility>0,workspace_mismatch>0`.

The next allowed step after this lock is
`next_allowed_step=ACCT-00_NEGATIVE_ACCOUNT_PROVISIONING`.

This lock must keep `no_auto_account_create=true`,
`no_auto_scope_grant=true`, `no_auto_scope_change=true`,
`no_password_or_invite_link=true`, `no_raw_profile_id=true`,
`no_service_role_key_in_evidence=true`, `no_evidence_acceptance=true`,
`no_uat_pass_inference=true`, `no_finance_reliance_inference=true`,
`no_owner_go_inference=true` and `no_auto_production_go=true`.

## ACCT-00 Negative Account Provisioning Checklist

`check:heu-negative-control-account-queue` also emits
`ACCT-00-NEGATIVE-ACCOUNT-PROVISIONING-CHECKLIST` with
`negative_account_checklist=ACCT-00_NEGATIVE_ACCOUNT_PROVISIONING`. Close it
after scope baseline repair and before browser denial evidence:

- `target_account_label_recorded`.
- `non_target_business_scope_recorded`.
- `target_segment_exclusion_recorded`.
- `credential_boundary_acknowledged`.
- `controlled_evidence_id_recorded`.

Required closure tokens are
`required_closure=target_account_label_recorded,non_target_business_scope_recorded,target_segment_exclusion_recorded,credential_boundary_acknowledged,controlled_evidence_id_recorded`,
`no_ttgdtx_scope=true`, `no_settings_or_permission_access=true`,
`no_password_or_invite_link=true` and `no_auto_account_create=true`.

This checklist is provisioning routing only. It does not create a real user,
set a password, send an invite/reset link, grant scope, accept evidence,
approve UAT, approve finance reliance, approve owner GO/NO-GO or mark
production GO.

## ACCT-00 Negative Account Execution Packet

`check:heu-negative-control-account-queue` also emits
`ACCT-00-NEGATIVE-ACCOUNT-EXECUTION-PACKET` with
`negative_account_execution_packet=ACCT-00_NEGATIVE_ACCOUNT_EXECUTION`. Close it
after the provisioning decision and before browser denial evidence:

- `target_account_label=REAL_OUT_OF_SCOPE_NEGATIVE_01`.
- `required_inputs=negative_account_dependency_lock_closed,provisioning_decision_closed,target_account_label_recorded,secure_admin_channel_recorded`.
- `blocked_if=negative_account_dependency_lock_closed=no,scope_baseline_closed=no,missing_visibility>0,missing_business_scope>0`.
- `required_execution_record=auth_profile_link_recorded,non_target_business_scope_applied,target_segment_exclusion_verified,lead_visibility_non_all_verified,settings_permission_denial_ready,credential_boundary_acknowledged,controlled_evidence_id_recorded`.
- `no_ttgdtx_scope=true`.
- `no_settings_or_permission_access=true`.
- `no_password_or_invite_link=true`.
- `no_raw_account_id=true`.
- `no_auto_account_create=true`.
- `no_auto_scope_grant=true`.
- `no_auto_uat_approval=true`.
- `no_auto_production_go=true`.

This packet is execution recording only. It does not create a user, link Auth,
assign scope, reveal raw account IDs, expose credentials, run browser UAT,
accept evidence, approve finance reliance, approve owner GO/NO-GO or mark
production GO.

## ACCT-00 Negative Account Post-Execution Verification Packet

`check:heu-negative-control-account-queue` also emits
`ACCT-00-NEGATIVE-ACCOUNT-POST-EXECUTION-VERIFICATION-PACKET` with
`negative_account_post_execution_verification_packet=ACCT-00_NEGATIVE_ACCOUNT_POST_EXECUTION_VERIFICATION`.
Close it after the negative-account execution packet and before browser denial
evidence.

The current live packet remains `negative_account_ready=no` while
`ttgdtx_negative_candidates=0`.

Required input tokens are
`required_inputs=negative_account_execution_closed,auth_profile_link_recorded,non_target_business_scope_applied,target_segment_exclusion_verified,controlled_evidence_id_recorded`.

Required verification-record tokens are
`required_verification_record=ttgdtx_negative_candidates>=1,negative_account_label_recorded,auth_profile_link_verified,non_target_business_scope_verified,target_segment_exclusion_verified,lead_visibility_non_all_verified,settings_permission_denial_ready,controlled_evidence_id_recorded`.

The next allowed step after this verification packet is
`next_allowed_step=ACCT-00_NEGATIVE_BROWSER_DENIAL`.

This packet must keep `no_ttgdtx_scope=true`,
`no_settings_or_permission_access=true`, `no_password_or_invite_link=true`,
`no_raw_account_id=true`, `no_auto_account_create=true`,
`no_auto_scope_grant=true`, `no_auto_acceptance=true`,
`no_auto_uat_approval=true` and `no_auto_production_go=true`.

This packet is verification routing only. It does not create a user, link Auth,
assign scope, reveal raw account IDs, accept evidence, execute browser UAT,
approve finance reliance, approve owner GO/NO-GO or mark production GO.

## ACCT-00 Negative Browser Evidence Dependency Lock

`check:heu-negative-control-account-queue` also emits
`ACCT-00-NEGATIVE-BROWSER-EVIDENCE-DEPENDENCY-LOCK` with
`negative_browser_evidence_dependency_lock=ACCT-00_NEGATIVE_BROWSER_EVIDENCE_DEPENDENCY`.
Use it after post-execution verification and before browser denial evidence.

The current live lock remains `negative_account_ready=no` while
`ttgdtx_negative_candidates=0`.

Required input tokens are
`required_inputs=negative_account_post_execution_verification_closed,negative_account_ready,controlled_evidence_id_recorded,reviewer_recorded,owner_lane_confirmed`.

Required dependency-record tokens are
`required_dependency_record=ttgdtx_negative_candidates>=1,negative_account_label_recorded,auth_profile_link_verified,non_target_business_scope_verified,target_segment_exclusion_verified,lead_visibility_non_all_verified,settings_permission_denial_ready,controlled_evidence_id_recorded`.

Block browser evidence if
`blocked_if=negative_account_ready=no,ttgdtx_negative_candidates=0,scope_baseline_closed=no,missing_visibility>0,missing_business_scope>0`.

The next allowed step after this lock is
`next_allowed_step=ACCT-00_NEGATIVE_BROWSER_DENIAL`.

This lock must keep `no_browser_uat_execution=true`,
`no_raw_screenshot_or_pii=true`, `no_password_or_invite_link=true`,
`no_evidence_acceptance=true`, `no_uat_pass_inference=true`,
`no_finance_reliance_inference=true`, `no_owner_go_inference=true` and
`no_auto_production_go=true`.

## ACCT-00 Negative Browser Denial Evidence Checklist

`check:heu-negative-control-account-queue` also emits
`ACCT-00-NEGATIVE-CONTROL-EVIDENCE-CHECKLIST` with
`negative_evidence_checklist=ACCT-00_NEGATIVE_BROWSER_DENIAL`. Treat it as the
controlled intake rule for the browser denial proof, not as evidence
acceptance:

- `route_scope=lead,finance,evidence,audit,settings`.
- `required_result=BLOCKED_OR_EMPTY_SCOPED_STATE`.
- `required_closure=controlled_evidence_id_recorded,reviewer_recorded,route_result_recorded,owner_decision_recorded`.
- `no_raw_screenshot_or_pii=true`.
- `no_password_or_invite_link=true`.
- `no_auto_acceptance=true`.

Owner-side evidence must use a controlled evidence ID plus reviewer, route
result and owner decision outside Git/Codex/chat. Raw screenshots, profile
names, emails, account IDs, passwords, invite/reset links, PII, bank data and
payment evidence stay outside this repository.

## ACCT-00 Negative Browser Route Matrix

`check:heu-negative-control-account-queue` also emits
`ACCT-00-NEGATIVE-BROWSER-ROUTE-MATRIX` with
`negative_route_matrix=ACCT-00_NEGATIVE_BROWSER_ROUTES`. Treat it as the
route-by-route denial matrix for the same negative account before browser
denial proof can support signed accounting UAT:

- `route_count=5`.
- `required_routes=lead,finance,evidence,audit,settings`.
- `expected_result=BLOCKED_OR_EMPTY_SCOPED_STATE`.
- `required_closure=lead_route_denial_recorded,finance_route_denial_recorded,evidence_route_denial_recorded,audit_route_denial_recorded,settings_route_denial_recorded,controlled_evidence_id_recorded,reviewer_recorded,owner_decision_recorded`.
- `no_raw_screenshot_or_pii=true`.
- `no_password_or_invite_link=true`.
- `no_auto_acceptance=true`.

Each route result must be recorded as controlled evidence outside
Git/Codex/chat. The matrix does not run browser UAT, accept evidence, create
accounts, approve finance reliance, approve owner GO/NO-GO or mark production
GO.

## ACCT-00 Negative-Control Final Proof Decision Packet

`check:heu-negative-control-account-queue` also emits
`ACCT-00-NEGATIVE-CONTROL-FINAL-PROOF-DECISION-PACKET` with
`negative_control_final_proof_decision_packet=ACCT-00_NEGATIVE_CONTROL_FINAL_PROOF_DECISION`.
Use it after the negative browser denial checklist and route matrix are closed,
before ACCT-12 can reference `negative_control_proof_closed`.

The current live packet remains `negative_control_proof_ready=no` while
`ttgdtx_negative_candidates=0`.

Required input tokens are
`required_inputs=negative_browser_denial_closed,negative_browser_route_matrix_closed,controlled_evidence_id_recorded,reviewer_recorded,owner_decision_recorded`.

Required decision-record tokens are
`required_decision_record=negative_control_proof_decision_recorded,lead_route_denial_recorded,finance_route_denial_recorded,evidence_route_denial_recorded,audit_route_denial_recorded,settings_route_denial_recorded,controlled_evidence_id_recorded,reviewer_recorded,owner_decision_recorded,blocker_state_recorded`.

Allowed decision values are `allowed_decision_values=PASS,NO_GO,BLOCKED`.
The next allowed step after this packet is
`next_allowed_step=ACCT-12_SIGNED_ROUTE_EVIDENCE_INTAKE`.

This packet must keep `no_raw_screenshot_or_pii=true`,
`no_password_or_invite_link=true`, `no_evidence_acceptance=true`,
`no_uat_pass_inference=true`, `no_finance_reliance_inference=true`,
`no_owner_go_inference=true`, `no_auto_acceptance=true`,
`no_auto_uat_approval=true` and `no_auto_production_go=true`.

This packet records final proof decision routing only. It does not accept
evidence, execute browser UAT, approve finance reliance, approve owner
GO/NO-GO or mark production GO.

## ACCT-00 Owner External Closure Handoff Packet

`check:heu-negative-control-account-queue` also emits
`ACCT-00-OWNER-EXTERNAL-CLOSURE-HANDOFF-PACKET` with
`owner_external_closure_handoff_packet=ACCT-00_OWNER_EXTERNAL_CLOSURE_HANDOFF`.
Use it only after scope repair, negative account verification and final
negative-control proof decision are recorded outside Git/Codex/chat.

The current live handoff remains blocked while `scope_baseline_closed=no`,
`negative_account_ready=no`, `negative_control_proof_ready=no`,
`missing_visibility>0`, `missing_business_scope>0` or
`ttgdtx_negative_candidates=0`.

Required input tokens are
`required_inputs=scope_post_repair_verification_closed,negative_account_post_execution_verification_closed,negative_browser_denial_closed,negative_control_final_proof_decision_recorded,controlled_evidence_id_recorded,owner_lane_confirmed`.

Required owner-closure tokens are
`required_owner_closure=missing_visibility=0,missing_business_scope=0,non_admin_all_visibility=0,workspace_mismatch=0,ttgdtx_negative_candidates>=1,negative_control_proof_decision_recorded,lead_route_denial_recorded,finance_route_denial_recorded,evidence_route_denial_recorded,audit_route_denial_recorded,settings_route_denial_recorded,blocker_state_recorded,controlled_evidence_id_recorded`.

Block the handoff if
`blocked_if=missing_visibility>0,missing_business_scope>0,ttgdtx_negative_candidates=0,negative_control_proof_ready=no,controlled_evidence_id_recorded=no`.

The next allowed dependency is
`next_allowed_step=ACCT-12_NEGATIVE_CONTROL_PROOF_DEPENDENCY`.

This handoff must keep `no_raw_profile_id=true`, `no_raw_account_id=true`,
`no_raw_screenshot_or_pii=true`, `no_password_or_invite_link=true`,
`no_auto_scope_change=true`, `no_auto_account_create=true`,
`no_evidence_acceptance=true`, `no_uat_pass_inference=true`,
`no_finance_reliance_inference=true`, `no_owner_go_inference=true` and
`no_auto_production_go=true`.

This packet is external owner closure routing only. It does not create
accounts, change scope, run browser UAT, accept evidence, approve finance
reliance, approve owner GO/NO-GO or mark production GO.

## Required Commands

- `npm.cmd run check:heu-negative-control-account-queue`
- `npm.cmd run check:heu-permission-scope-readiness`
- `npm.cmd run audit:heu-user-account-security`
- `npm.cmd run audit:heu-role-scope-uat-pack`
- `npm.cmd run audit:ttgdtx-role-scope-access`

## Exit Rule

The queue can be PASS_LOCAL while the negative-control account is missing, but
only as an owner-action queue. It does not create accounts, assign real users,
set passwords, send reset/invite links, approve UAT, approve finance reliance,
approve owner GO/NO-GO or mark production GO.
