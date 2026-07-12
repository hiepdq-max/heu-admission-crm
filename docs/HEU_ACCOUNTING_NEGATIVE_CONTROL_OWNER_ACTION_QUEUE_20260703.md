# HEU Accounting Negative-Control Owner Action Queue - 2026-07-03

Status: PASS_LOCAL_OWNER_ACTION_QUEUE
Decision lane: ACCT_NEGATIVE_CONTROL_READY / NO_GO / BLOCKED
Production/UAT status: NO-GO until the owner fixes active profile visibility
baseline, creates or links the TTGDTX out-of-scope negative-control account, and
signs browser UAT evidence outside Git/Codex/chat.

## Purpose

This queue turns the live `check:heu-negative-control-account-queue` blocker
into owner actions for ACCT-00 and ACCT-12. It is local packaging only. It does
not create users, set passwords, send invites, assign roles, update visibility,
grant scope, execute UAT, accept evidence, approve finance reliance, approve
owner GO/NO-GO or mark production GO.

`check:heu-accounting-negative-control-owner-action-queue` is the local
read-only guard for this queue. It verifies the owner-action routing, ACCT-00
dependency order, secret boundary and ACCT-12 handoff tokens without changing
scope, creating accounts or accepting evidence.

Secret boundary: do not paste emails, names, phone numbers, profile IDs,
passwords, temporary passwords, OTPs, password reset links, account
activation/invite links, service-role keys, raw student PII, CCCD, bank
accounts, vouchers or raw evidence into this file, Git, Codex/chat, email notes
or screenshots. Use redacted account labels and controlled evidence IDs only.

## Current Live Blocker Shape

Latest observed local guard shape:

- `NO_GO USER-SCOPE-REPAIR-LEAD-VISIBILITY` reports `missing_visibility=2`
  from `check:heu-user-scope-baseline-repair-queue`.
- `NO_GO USER-SCOPE-REPAIR-BUSINESS-SCOPE` reports
  `missing_business_scope=2` from `check:heu-user-scope-baseline-repair-queue`.
- `NO_GO NEGATIVE-CONTROL-BASELINE` reports `missing_visibility=2`.
- `READY NEGATIVE-CONTROL-TTGDTX-QUEUE` can report
  `ttgdtx_negative_candidates=0`.
- The ACCT-00 scope-packet runtime mirror from
  `check:heu-negative-control-account-queue` must carry
  `source=negative_control_account_queue_runtime` before these packets can be
  treated as current owner-action queue evidence.
- `REAL_OUT_OF_SCOPE_NEGATIVE_01` is still owner create/link pending for
  `TC9_TTGDTX_LINKED`.

These are stop conditions for signed accounting browser UAT. PASS_LOCAL package
checks may continue, but no owner should treat the accounting module as UAT pass
or finance-reliable while these rows remain unresolved.

## Required Owner Action Queue

| Action | Owner lane | Required action outside Codex/chat | Required result | Stop condition |
|---|---|---|---|---|
| ACCT-NEG-01 | IT_DATA + TRUONG_PHONG | Review `docs/HEU_USER_SCOPE_BASELINE_REPAIR_QUEUE_20260703.md`, map `safe_owner_repair_labels` through the approved secure channel and fix missing lead-visibility plus business-scope rows through approved admin workflow | `missing_visibility=0`, `missing_business_scope=0` and no non-ADMIN/BGH `ALL` visibility | Any active non-ADMIN/BGH profile has missing visibility, missing business scope or broad `ALL` visibility |
| ACCT-NEG-02 | IT_DATA + Audit | Create or link `REAL_OUT_OF_SCOPE_NEGATIVE_01` through approved secure channel, with no password/reset/invite link recorded in Git/Codex/chat | Active non-ADMIN/BGH test account exists with explicit non-`ALL` visibility | Account creation/linking evidence is absent, ownerless, or contains a secret |
| ACCT-NEG-03 | IT_DATA + KHTC + Audit | Assign only a safe non-target business scope outside `TC9_TTGDTX_LINKED` | `ttgdtx_negative_candidates>=1` and the account is not scoped to TTGDTX protected data | Account has TTGDTX segment scope, broad workspace preference, or finance/audit/settings visibility |
| ACCT-NEG-04 | IT_DATA + process owners | Run browser negative test for TTGDTX lead, finance, evidence, audit and settings routes | `BLOCKED` or `EMPTY_SCOPED_STATE` for TTGDTX protected data | Negative account can see or write TTGDTX protected data |
| ACCT-NEG-05 | Audit + KHTC + BGH | Store redacted controlled evidence ID, reviewer, route result and owner decision outside Git/Codex/chat | `ACCT_NEGATIVE_CONTROL_READY / NO_GO / BLOCKED` owner decision is recorded | Evidence ID, reviewer, owner decision or stop-condition note is missing |

## Required Re-Run Sequence

Run only after the owner actions above are completed outside Codex/chat:

```powershell
npm.cmd run check:heu-user-scope-baseline-repair-queue
npm.cmd run check:heu-negative-control-account-queue
npm.cmd run check:heu-accounting-negative-control-owner-action-queue
npm.cmd run check:heu-permission-scope-readiness
npm.cmd run audit:heu-user-account-security
npm.cmd run audit:heu-role-scope-uat-pack
npm.cmd run audit:ttgdtx-role-scope-access
npm.cmd run check:heu-accounting-module-breakdown
```

Expected local gate before signed browser UAT can proceed:

- `NEGATIVE-CONTROL-BASELINE` is `READY`.
- `USER-SCOPE-REPAIR-LEAD-VISIBILITY` is `READY`.
- `USER-SCOPE-REPAIR-BUSINESS-SCOPE` is `READY`.
- `ttgdtx_negative_candidates>=1`.
- `REAL_OUT_OF_SCOPE_NEGATIVE_01` has redacted controlled evidence outside
  Git/Codex/chat.
- `scope_repair_owner_packet_lock=ACCT-00_SCOPE_REPAIR_OWNER_PACKET_LOCK`
  is closed with safe labels, owner packet, owner-lane mapping, secure lookup
  channel and controlled evidence ID recorded.
- `scope_repair_owner_decision_matrix=ACCT-00_SCOPE_REPAIR_OWNER_DECISION_MATRIX`
  is closed with per-label owner decisions and controlled evidence IDs.
- `scope_decision_checklist=ACCT-00_SCOPE_BASELINE_OWNER_DECISION` is closed
  with owner lane, secure admin channel and post-repair snapshot recorded.
- `scope_repair_decision_dependency_lock=ACCT-00_SCOPE_REPAIR_DECISION_DEPENDENCY`
  is closed before owner-side scope repair execution starts.
- `scope_repair_execution_packet=ACCT-00_SCOPE_REPAIR_EXECUTION` is closed
  with pre-repair snapshot, approved visibility, approved business scope,
  workspace preference verification, post-repair snapshot and controlled
  evidence ID recorded.
- `scope_post_repair_rerun_proof_packet=ACCT-00_SCOPE_POST_REPAIR_RERUN_PROOF`
  is closed with the user-scope, negative-control, finance/payment scope,
  role/scope UAT-pack and user-account security rerun records.
- `scope_post_repair_verification_packet=ACCT-00_SCOPE_POST_REPAIR_VERIFICATION`
  is closed with `scope_baseline_closed=yes`, zero missing scope findings and
  `negative_control_queue_re_run_recorded`.
- `scope_external_closure_handoff_packet=ACCT-00_SCOPE_EXTERNAL_CLOSURE_HANDOFF`
  is closed with `scope_baseline_closed=yes`, owner closure tokens, controlled
  evidence ID and no missing scope findings before negative-account dependency
  is treated as owner-eligible.
- `negative_account_dependency_lock=ACCT-00_NEGATIVE_ACCOUNT_DEPENDENCY` is
  closed before provisioning starts.
- `negative_account_checklist=ACCT-00_NEGATIVE_ACCOUNT_PROVISIONING` is closed
  with non-target scope, target-segment exclusion and credential boundary
  acknowledged.
- `negative_account_execution_packet=ACCT-00_NEGATIVE_ACCOUNT_EXECUTION` is
  closed with Auth/profile link, non-target business scope, target-segment
  exclusion, non-`ALL` visibility, settings denial readiness and controlled
  evidence ID recorded.
- `negative_browser_evidence_dependency_lock=ACCT-00_NEGATIVE_BROWSER_EVIDENCE_DEPENDENCY`
  is closed before browser denial evidence starts.
- `negative_route_matrix=ACCT-00_NEGATIVE_BROWSER_ROUTES` is closed with
  lead, finance, evidence, audit and settings route denial recorded.
- No password, temporary password, OTP, reset link, invite link, service-role
  key, raw ID or raw screenshot enters Git/Codex/chat.

## ACCT-00 Pre-UAT Owner Checklist

`check:heu-negative-control-account-queue` now emits
`ACCT-00-PRE-UAT-OWNER-CHECKLIST` with `owner_checklist=ACCT-00_PRE_UAT`.
Treat it as the single pre-UAT closure order for the ACCT-00 owner lane:

- First close `USER-SCOPE-REPAIR-01` and `USER-SCOPE-REPAIR-02`.
- Then close `ACCT-NEG-02`, `ACCT-NEG-03`, `ACCT-NEG-04` and `ACCT-NEG-05`.
- Required closure is
  `required_closure=missing_visibility=0,missing_business_scope=0,ttgdtx_negative_candidates>=1,controlled_evidence_id_recorded`.
- The checklist must keep `no_password_or_invite_link=true` and
  `no_auto_fix=true`; it routes owner action only and never creates accounts or
  approves UAT.

## ACCT-00 Scope Repair Owner Packet Lock

`check:heu-user-scope-baseline-repair-queue` also emits
`ACCT-00-SCOPE-REPAIR-OWNER-PACKET-LOCK` with
`scope_repair_owner_packet_lock=ACCT-00_SCOPE_REPAIR_OWNER_PACKET_LOCK`.
Use it to lock the owner packet dependency before ACCT-NEG-01 can advance to
the owner decision matrix:

- `profile_count=2`.
- `decision_count=4`.
- `role_codes=DAO_TAO_LEAD,TCHC_LEAD`.
- Required inputs are
  `required_inputs=safe_owner_repair_labels_generated,owner_action_packet_generated,role_codes_recorded,decision_count_recorded,secure_owner_lookup_channel_recorded,controlled_evidence_id_recorded`.
- Required dependency record is
  `required_dependency_record=safe_label,role_code,owner_label_mapped,owner_lane_confirmed,secure_owner_lookup_channel_recorded,controlled_evidence_id_recorded`.
- Block closure when
  `blocked_if=safe_owner_repair_labels_missing,owner_action_packet_missing,role_codes_missing,decision_count_mismatch,owner_label_unmapped,secure_owner_lookup_channel_missing,controlled_evidence_id_missing,raw_profile_id_present`.
- `next_allowed_step=ACCT-00_SCOPE_REPAIR_OWNER_DECISION_MATRIX`.
- `no_raw_profile_id=true`.
- `no_email_or_phone=true`.
- `no_password_or_invite_link=true`.
- `no_service_role_key_in_evidence=true`.
- `no_auto_scope_change=true`.
- `no_evidence_acceptance=true`.
- `no_uat_pass_inference=true`.
- `no_finance_reliance_inference=true`.
- `no_owner_go_inference=true`.
- `no_auto_production_go=true`.

## ACCT-00 Scope Repair Owner Decision Matrix

`check:heu-user-scope-baseline-repair-queue` also emits
`ACCT-00-SCOPE-REPAIR-OWNER-DECISION-MATRIX` with
`scope_repair_owner_decision_matrix=ACCT-00_SCOPE_REPAIR_OWNER_DECISION_MATRIX`.
Use it to map every safe repair label before ACCT-NEG-01 is treated as closed:

- `profile_count=2`.
- `decision_count=4`.
- `role_codes=DAO_TAO_LEAD,TCHC_LEAD`.
- `missing_visibility_labels`.
- `missing_business_scope_labels`.
- Required owner record is
  `required_owner_record=owner_label_mapped,lead_visibility_choice_recorded,business_scope_choice_recorded,owner_lane_confirmed,secure_admin_channel_recorded,controlled_evidence_id_recorded`.
- Required per-label record is
  `required_per_label_record=safe_label,role_code,approved_visibility_choice_when_required,approved_segment_or_partner_scope_when_required,owner_reviewer,controlled_evidence_id`.
- Block closure when
  `blocked_if=owner_label_unmapped,required_visibility_choice_missing,required_business_scope_choice_missing,secure_admin_channel_missing,controlled_evidence_id_missing`.
- `next_allowed_step=ACCT-00_SCOPE_BASELINE_OWNER_DECISION`.
- `no_raw_profile_id=true`.
- `no_email_or_phone=true`.
- `no_password_or_invite_link=true`.
- `no_service_role_key_in_evidence=true`.
- `no_auto_scope_change=true`.
- `no_evidence_acceptance=true`.
- `no_uat_pass_inference=true`.
- `no_finance_reliance_inference=true`.
- `no_owner_go_inference=true`.
- `no_auto_production_go=true`.

This matrix is owner-side routing only. It does not change scope, accept
evidence, create users, execute browser UAT, approve finance reliance or mark
production GO.

## ACCT-00 Scope Baseline Owner Decision Checklist

`check:heu-user-scope-baseline-repair-queue` also emits
`ACCT-00-SCOPE-BASELINE-DECISION-CHECKLIST` with
`scope_decision_checklist=ACCT-00_SCOPE_BASELINE_OWNER_DECISION`. Use it to
close ACCT-NEG-01 before ACCT-NEG-02 can proceed:

- Required closure is
  `required_closure=lead_visibility_choice_recorded,business_scope_choice_recorded,owner_lane_confirmed,secure_admin_channel_recorded,post_repair_snapshot_recorded`.
- `no_all_visibility_for_non_admin=true`.
- `no_password_or_invite_link=true`.
- `no_auto_scope_change=true`.

This checklist is scope-decision routing only. It does not change lead
visibility, grant scope, create accounts, accept evidence, approve UAT or mark
production GO.

## ACCT-00 Scope Repair Decision Dependency Lock

`check:heu-user-scope-baseline-repair-queue` also emits
`ACCT-00-SCOPE-REPAIR-DECISION-DEPENDENCY-LOCK` with
`scope_repair_decision_dependency_lock=ACCT-00_SCOPE_REPAIR_DECISION_DEPENDENCY`.
Use it after the scope-baseline owner decision and before owner-side scope
repair execution:

- Required inputs are
  `required_inputs=scope_baseline_decision_checklist_closed,lead_visibility_choice_recorded,business_scope_choice_recorded,owner_lane_confirmed,secure_admin_channel_recorded`.
- Required dependency record is
  `required_dependency_record=approved_visibility_choice_recorded,approved_business_scope_recorded,owner_lane_confirmed,secure_admin_channel_recorded,controlled_evidence_id_recorded`.
- Block execution when
  `blocked_if=scope_baseline_decision_checklist_closed=no,owner_lane_confirmed=no,lead_visibility_choice_recorded=no,business_scope_choice_recorded=no,secure_admin_channel_recorded=no`.
- `next_allowed_step=ACCT-00_SCOPE_REPAIR_EXECUTION`.
- `no_all_visibility_for_non_admin=true`.
- `no_password_or_invite_link=true`.
- `no_raw_profile_id=true`.
- `no_service_role_key_in_evidence=true`.
- `no_auto_scope_change=true`.
- `no_evidence_acceptance=true`.
- `no_uat_pass_inference=true`.
- `no_finance_reliance_inference=true`.
- `no_owner_go_inference=true`.
- `no_auto_production_go=true`.

This lock is dependency routing only. It does not change scope, expose raw IDs,
accept evidence, create users, approve finance reliance, approve UAT or mark
production GO.

## ACCT-00 Scope Repair Execution Packet

`check:heu-user-scope-baseline-repair-queue` also emits
`ACCT-00-SCOPE-REPAIR-EXECUTION-PACKET` with
`scope_repair_execution_packet=ACCT-00_SCOPE_REPAIR_EXECUTION`. Use it after
the scope-baseline owner decision and before negative-account provisioning:

- Required execution record is
  `required_execution_record=pre_repair_snapshot_recorded,approved_visibility_choice_applied,approved_business_scope_applied,workspace_preference_verified,post_repair_snapshot_recorded,controlled_evidence_id_recorded`.
- `pre_repair_snapshot_recorded`.
- `approved_visibility_choice_applied`.
- `approved_business_scope_applied`.
- `workspace_preference_verified`.
- `no_all_visibility_for_non_admin=true`.
- `no_raw_profile_id=true`.
- `no_service_role_key_in_evidence=true`.
- `no_auto_scope_change=true`.
- `no_auto_uat_approval=true`.
- `no_auto_production_go=true`.

This packet is owner-side execution recording only. It does not change scope,
expose raw IDs, expose service-role keys, create accounts, accept negative
proof, approve UAT or mark production GO.

## ACCT-00 Scope Post-Repair Rerun Proof Packet

`check:heu-user-scope-baseline-repair-queue` also emits
`ACCT-00-SCOPE-POST-REPAIR-RERUN-PROOF-PACKET` with
`scope_post_repair_rerun_proof_packet=ACCT-00_SCOPE_POST_REPAIR_RERUN_PROOF`.
Use it after scope repair execution and before post-repair verification:

- Required inputs are
  `required_inputs=scope_repair_execution_closed,post_repair_snapshot_recorded,controlled_evidence_id_recorded,owner_lane_confirmed`.
- Required rerun record is
  `required_rerun_record=check_heu_user_scope_baseline_repair_queue_rerun,check_heu_negative_control_account_queue_rerun,check_heu_finance_payment_scope_readiness_rerun,check_heu_role_scope_uat_pack_rerun,check_heu_user_account_security_rerun`.
- Required result record is
  `required_result_record=missing_visibility=0,missing_business_scope=0,non_admin_all_visibility=0,workspace_mismatch=0,ttgdtx_negative_candidates_recomputed,finance_payment_scope_ready_recorded,role_scope_pack_passed,controlled_evidence_id_recorded`.
- Block verification when
  `blocked_if=scope_baseline_closed=no,post_repair_snapshot_recorded=no,controlled_evidence_id_recorded=no,negative_control_queue_re_run_recorded=no`.
- `next_allowed_step=ACCT-00_SCOPE_POST_REPAIR_VERIFICATION`.
- `no_raw_profile_id=true`.
- `no_service_role_key_in_evidence=true`.
- `no_password_or_invite_link=true`.
- `no_auto_scope_change=true`.
- `no_auto_account_create=true`.
- `no_evidence_acceptance=true`.
- `no_uat_pass_inference=true`.
- `no_finance_reliance_inference=true`.
- `no_owner_go_inference=true`.
- `no_auto_production_go=true`.

This packet is rerun-proof routing only. It does not run UAT, create accounts,
change scope, accept evidence, approve finance reliance or mark production GO.

## ACCT-00 Scope Post-Repair Verification Packet

`check:heu-user-scope-baseline-repair-queue` also emits
`ACCT-00-SCOPE-POST-REPAIR-VERIFICATION-PACKET` with
`scope_post_repair_verification_packet=ACCT-00_SCOPE_POST_REPAIR_VERIFICATION`.
Use it after scope repair execution and before the scope external closure
handoff:

- Current live status remains `scope_baseline_closed=no`.
- Required inputs are
  `required_inputs=scope_repair_execution_closed,post_repair_snapshot_recorded,controlled_evidence_id_recorded`.
- Required verification record is
  `required_verification_record=missing_visibility=0,missing_business_scope=0,non_admin_all_visibility=0,workspace_mismatch=0,workspace_preference_inside_scope_confirmed,negative_control_queue_re_run_recorded,controlled_evidence_id_recorded`.
- `next_allowed_step=ACCT-00_SCOPE_EXTERNAL_CLOSURE_HANDOFF`.
- `no_auto_acceptance=true`.
- `no_auto_uat_approval=true`.
- `no_auto_production_go=true`.

This packet is verification routing only. It does not accept evidence, create
users, link Auth, grant scope, execute browser UAT, approve finance reliance or
mark production GO.

## ACCT-00 Scope External Closure Handoff Packet

`check:heu-user-scope-baseline-repair-queue` also emits
`ACCT-00-SCOPE-EXTERNAL-CLOSURE-HANDOFF-PACKET` with
`scope_external_closure_handoff_packet=ACCT-00_SCOPE_EXTERNAL_CLOSURE_HANDOFF`.
Use it after post-repair verification and before negative-account dependency:

- Current live status remains `scope_baseline_closed=no`.
- Required inputs are
  `required_inputs=scope_baseline_decision_checklist_closed,scope_repair_execution_closed,scope_post_repair_rerun_proof_closed,scope_post_repair_verification_closed,controlled_evidence_id_recorded,owner_lane_confirmed`.
- Required owner closure is
  `required_owner_closure=missing_visibility=0,missing_business_scope=0,non_admin_all_visibility=0,workspace_mismatch=0,lead_visibility_choice_recorded,business_scope_choice_recorded,approved_visibility_choice_applied,approved_business_scope_applied,workspace_preference_inside_scope_confirmed,post_repair_snapshot_recorded,negative_control_queue_re_run_recorded,controlled_evidence_id_recorded`.
- Block the handoff when
  `blocked_if=scope_baseline_closed=no,missing_visibility>0,missing_business_scope>0,non_admin_all_visibility>0,workspace_mismatch>0,controlled_evidence_id_recorded=no`.
- `next_allowed_step=ACCT-00_NEGATIVE_ACCOUNT_DEPENDENCY`.
- `no_raw_profile_id=true`.
- `no_service_role_key_in_evidence=true`.
- `no_auto_scope_change=true`.
- `no_auto_account_create=true`.
- `no_evidence_acceptance=true`.
- `no_uat_pass_inference=true`.
- `no_finance_reliance_inference=true`.
- `no_owner_go_inference=true`.
- `no_auto_production_go=true`.

This handoff is owner-closure routing only. It does not change scope, create
accounts, accept evidence, approve UAT, approve finance reliance or mark
production GO.

## ACCT-00 Negative Account Dependency Lock

`check:heu-negative-control-account-queue` also emits
`ACCT-00-NEGATIVE-ACCOUNT-DEPENDENCY-LOCK` with
`negative_account_dependency_lock=ACCT-00_NEGATIVE_ACCOUNT_DEPENDENCY`. Use it
after scope external closure handoff and before provisioning:

- Current live status remains `scope_baseline_closed=no`.
- Required inputs are
  `required_inputs=scope_external_closure_handoff_closed,scope_post_repair_verification_closed,scope_baseline_closed,owner_lane_confirmed,secure_admin_channel_recorded,controlled_evidence_id_recorded`.
- Required dependency record is
  `required_dependency_record=scope_external_closure_handoff_closed,missing_visibility=0,missing_business_scope=0,non_admin_all_visibility=0,workspace_mismatch=0,workspace_preference_inside_scope_confirmed,negative_control_queue_re_run_recorded,controlled_evidence_id_recorded,post_repair_snapshot_recorded`.
- Block provisioning if
  `blocked_if=scope_external_closure_handoff_closed=no,scope_baseline_closed=no,missing_visibility>0,missing_business_scope>0,non_admin_all_visibility>0,workspace_mismatch>0`.
- `next_allowed_step=ACCT-00_NEGATIVE_ACCOUNT_PROVISIONING`.
- `no_auto_account_create=true`.
- `no_auto_scope_grant=true`.
- `no_auto_scope_change=true`.
- `no_password_or_invite_link=true`.
- `no_raw_profile_id=true`.
- `no_service_role_key_in_evidence=true`.
- `no_evidence_acceptance=true`.
- `no_uat_pass_inference=true`.
- `no_finance_reliance_inference=true`.
- `no_owner_go_inference=true`.
- `no_auto_production_go=true`.

This lock is dependency routing only. It does not create users, grant scope,
accept evidence, infer UAT pass, approve finance reliance or mark production
GO.

## ACCT-00 Negative Account Provisioning Checklist

`check:heu-negative-control-account-queue` also emits
`ACCT-00-NEGATIVE-ACCOUNT-PROVISIONING-CHECKLIST` with
`negative_account_checklist=ACCT-00_NEGATIVE_ACCOUNT_PROVISIONING`. Use it to
close ACCT-NEG-02 and ACCT-NEG-03 before browser denial evidence starts:

- Required closure is
  `required_closure=target_account_label_recorded,non_target_business_scope_recorded,target_segment_exclusion_recorded,credential_boundary_acknowledged,controlled_evidence_id_recorded`.
- `no_ttgdtx_scope=true`.
- `no_settings_or_permission_access=true`.
- `no_password_or_invite_link=true`.
- `no_auto_account_create=true`.

This checklist is provisioning routing only. It does not create users, set
passwords, send invite/reset links, grant scope, accept evidence, approve UAT,
approve finance reliance or mark production GO.

## ACCT-00 Negative Account Execution Packet

`check:heu-negative-control-account-queue` also emits
`ACCT-00-NEGATIVE-ACCOUNT-EXECUTION-PACKET` with
`negative_account_execution_packet=ACCT-00_NEGATIVE_ACCOUNT_EXECUTION`. Use it
to record ACCT-NEG-02 and ACCT-NEG-03 execution before browser denial evidence:

- `target_account_label=REAL_OUT_OF_SCOPE_NEGATIVE_01`.
- Required inputs are
  `required_inputs=negative_account_dependency_lock_closed,provisioning_decision_closed,target_account_label_recorded,secure_admin_channel_recorded`.
- Block execution if
  `blocked_if=negative_account_dependency_lock_closed=no,scope_baseline_closed=no,missing_visibility>0,missing_business_scope>0`.
- Required execution record is
  `required_execution_record=auth_profile_link_recorded,non_target_business_scope_applied,target_segment_exclusion_verified,lead_visibility_non_all_verified,settings_permission_denial_ready,credential_boundary_acknowledged,controlled_evidence_id_recorded`.
- `no_ttgdtx_scope=true`.
- `no_settings_or_permission_access=true`.
- `no_password_or_invite_link=true`.
- `no_raw_account_id=true`.
- `no_auto_account_create=true`.
- `no_auto_scope_grant=true`.
- `no_auto_uat_approval=true`.
- `no_auto_production_go=true`.

This packet records owner-side execution only. It does not create users, link
Auth, assign scope, reveal raw account IDs, accept evidence, execute browser
UAT, approve finance reliance or mark production GO.

## ACCT-00 Negative Account Post-Execution Verification Packet

`check:heu-negative-control-account-queue` also emits
`ACCT-00-NEGATIVE-ACCOUNT-POST-EXECUTION-VERIFICATION-PACKET` with
`negative_account_post_execution_verification_packet=ACCT-00_NEGATIVE_ACCOUNT_POST_EXECUTION_VERIFICATION`.
Use it after ACCT-NEG-02/03 execution and before browser denial evidence:

- Current live status remains `negative_account_ready=no` while
  `ttgdtx_negative_candidates=0`.
- Required inputs are
  `required_inputs=negative_account_execution_closed,auth_profile_link_recorded,non_target_business_scope_applied,target_segment_exclusion_verified,controlled_evidence_id_recorded`.
- Required verification record is
  `required_verification_record=ttgdtx_negative_candidates>=1,negative_account_label_recorded,auth_profile_link_verified,non_target_business_scope_verified,target_segment_exclusion_verified,lead_visibility_non_all_verified,settings_permission_denial_ready,controlled_evidence_id_recorded`.
- `next_allowed_step=ACCT-00_NEGATIVE_BROWSER_DENIAL`.
- `no_raw_account_id=true`.
- `no_auto_account_create=true`.
- `no_auto_scope_grant=true`.
- `no_auto_acceptance=true`.
- `no_auto_uat_approval=true`.
- `no_auto_production_go=true`.

This packet is verification routing only. It does not create users, link Auth,
grant scope, accept evidence, execute browser UAT, approve finance reliance or
mark production GO.

## ACCT-00 Negative Browser Evidence Dependency Lock

`check:heu-negative-control-account-queue` also emits
`ACCT-00-NEGATIVE-BROWSER-EVIDENCE-DEPENDENCY-LOCK` with
`negative_browser_evidence_dependency_lock=ACCT-00_NEGATIVE_BROWSER_EVIDENCE_DEPENDENCY`.
Use it after post-execution verification and before browser denial evidence:

- Current live status remains `negative_account_ready=no` while
  `ttgdtx_negative_candidates=0`.
- Required inputs are
  `required_inputs=negative_account_post_execution_verification_closed,negative_account_ready,controlled_evidence_id_recorded,reviewer_recorded,owner_lane_confirmed`.
- Required dependency record is
  `required_dependency_record=ttgdtx_negative_candidates>=1,negative_account_label_recorded,auth_profile_link_verified,non_target_business_scope_verified,target_segment_exclusion_verified,lead_visibility_non_all_verified,settings_permission_denial_ready,controlled_evidence_id_recorded`.
- Block browser evidence if
  `blocked_if=negative_account_ready=no,ttgdtx_negative_candidates=0,scope_baseline_closed=no,missing_visibility>0,missing_business_scope>0`.
- `next_allowed_step=ACCT-00_NEGATIVE_BROWSER_DENIAL`.
- `no_browser_uat_execution=true`.
- `no_raw_screenshot_or_pii=true`.
- `no_password_or_invite_link=true`.
- `no_evidence_acceptance=true`.
- `no_uat_pass_inference=true`.
- `no_finance_reliance_inference=true`.
- `no_owner_go_inference=true`.
- `no_auto_production_go=true`.

This lock is dependency routing only. It does not run browser UAT, accept
evidence, infer UAT pass, approve finance reliance or mark production GO.

## ACCT-00 Negative Browser Denial Evidence Checklist

`check:heu-negative-control-account-queue` also emits
`ACCT-00-NEGATIVE-CONTROL-EVIDENCE-CHECKLIST` with
`negative_evidence_checklist=ACCT-00_NEGATIVE_BROWSER_DENIAL`. Use it to close
ACCT-NEG-04 and ACCT-NEG-05 without storing raw evidence in Git/Codex/chat:

- `route_scope=lead,finance,evidence,audit,settings`.
- `required_result=BLOCKED_OR_EMPTY_SCOPED_STATE`.
- `required_closure=controlled_evidence_id_recorded,reviewer_recorded,route_result_recorded,owner_decision_recorded`.
- `no_raw_screenshot_or_pii=true`.
- `no_password_or_invite_link=true`.
- `no_auto_acceptance=true`.

The owner lane must record only controlled evidence IDs, reviewer, route
result and owner decision in the approved secure evidence store. This local
queue does not execute browser UAT, accept evidence or approve owner closure.

## ACCT-00 Negative Browser Route Matrix

`check:heu-negative-control-account-queue` also emits
`ACCT-00-NEGATIVE-BROWSER-ROUTE-MATRIX` with
`negative_route_matrix=ACCT-00_NEGATIVE_BROWSER_ROUTES`. Use it to close the
route-by-route browser denial matrix for ACCT-NEG-04 and ACCT-NEG-05:

- `route_count=5`.
- `required_routes=lead,finance,evidence,audit,settings`.
- `expected_result=BLOCKED_OR_EMPTY_SCOPED_STATE`.
- Required closure is
  `required_closure=lead_route_denial_recorded,finance_route_denial_recorded,evidence_route_denial_recorded,audit_route_denial_recorded,settings_route_denial_recorded,controlled_evidence_id_recorded,reviewer_recorded,owner_decision_recorded`.
- `no_raw_screenshot_or_pii=true`.
- `no_password_or_invite_link=true`.
- `no_auto_acceptance=true`.

This matrix records only controlled route-denial evidence IDs and owner
review decisions outside Git/Codex/chat. It does not execute browser UAT,
accept evidence, create accounts, approve finance reliance or mark production
GO.

## ACCT-00 Negative-Control Final Proof Decision Packet

`check:heu-negative-control-account-queue` also emits
`ACCT-00-NEGATIVE-CONTROL-FINAL-PROOF-DECISION-PACKET` with
`negative_control_final_proof_decision_packet=ACCT-00_NEGATIVE_CONTROL_FINAL_PROOF_DECISION`.
Use it after ACCT-NEG-04/05 route-denial evidence and before ACCT-12 signed
route evidence intake:

- Current live status remains `negative_control_proof_ready=no` while
  `ttgdtx_negative_candidates=0`.
- Required inputs are
  `required_inputs=negative_browser_denial_closed,negative_browser_route_matrix_closed,controlled_evidence_id_recorded,reviewer_recorded,owner_decision_recorded`.
- Required decision record is
  `required_decision_record=negative_control_proof_decision_recorded,lead_route_denial_recorded,finance_route_denial_recorded,evidence_route_denial_recorded,audit_route_denial_recorded,settings_route_denial_recorded,controlled_evidence_id_recorded,reviewer_recorded,owner_decision_recorded,blocker_state_recorded`.
- `allowed_decision_values=PASS,NO_GO,BLOCKED`.
- `next_allowed_step=ACCT-12_SIGNED_ROUTE_EVIDENCE_INTAKE`.
- `no_evidence_acceptance=true`.
- `no_uat_pass_inference=true`.
- `no_finance_reliance_inference=true`.
- `no_owner_go_inference=true`.
- `no_auto_acceptance=true`.
- `no_auto_uat_approval=true`.
- `no_auto_production_go=true`.

This packet is final proof decision routing only. It does not accept evidence,
execute browser UAT, approve finance reliance, approve owner GO/NO-GO or mark
production GO.

## ACCT-00 Owner External Closure Handoff Packet

`check:heu-negative-control-account-queue` also emits
`ACCT-00-OWNER-EXTERNAL-CLOSURE-HANDOFF-PACKET` with
`owner_external_closure_handoff_packet=ACCT-00_OWNER_EXTERNAL_CLOSURE_HANDOFF`.
Use it as the ACCT-00-to-ACCT-12 handoff only after owner-side scope repair,
negative account verification, browser denial evidence and final proof
decision records are closed:

- Current live status remains blocked while `scope_baseline_closed=no`,
  `negative_account_ready=no`, `negative_control_proof_ready=no`,
  `missing_visibility>0`, `missing_business_scope>0` or
  `ttgdtx_negative_candidates=0`.
- Required inputs are
  `required_inputs=scope_post_repair_verification_closed,negative_account_post_execution_verification_closed,negative_browser_denial_closed,negative_control_final_proof_decision_recorded,controlled_evidence_id_recorded,owner_lane_confirmed`.
- Required owner closure is
  `required_owner_closure=missing_visibility=0,missing_business_scope=0,non_admin_all_visibility=0,workspace_mismatch=0,ttgdtx_negative_candidates>=1,negative_control_proof_decision_recorded,lead_route_denial_recorded,finance_route_denial_recorded,evidence_route_denial_recorded,audit_route_denial_recorded,settings_route_denial_recorded,blocker_state_recorded,controlled_evidence_id_recorded`.
- Block the handoff if
  `blocked_if=missing_visibility>0,missing_business_scope>0,ttgdtx_negative_candidates=0,negative_control_proof_ready=no,controlled_evidence_id_recorded=no`.
- `next_allowed_step=ACCT-12_NEGATIVE_CONTROL_PROOF_DEPENDENCY`.
- `no_raw_profile_id=true`.
- `no_raw_account_id=true`.
- `no_raw_screenshot_or_pii=true`.
- `no_password_or_invite_link=true`.
- `no_auto_scope_change=true`.
- `no_auto_account_create=true`.
- `no_evidence_acceptance=true`.
- `no_uat_pass_inference=true`.
- `no_finance_reliance_inference=true`.
- `no_owner_go_inference=true`.
- `no_auto_production_go=true`.

This handoff is external owner closure routing only. It does not create
accounts, change scope, run browser UAT, accept evidence, approve finance
reliance, approve owner GO/NO-GO or mark production GO.

## Accounting Stop Rule

Keep ACCT-00 and ACCT-12 at NO-GO for signed UAT if any of these is true:

- `missing_visibility>0` (latest observed value: `missing_visibility=2`).
- `missing_business_scope>0` (latest observed value:
  `missing_business_scope=2`).
- `non_admin_all_visibility>0`.
- `ttgdtx_negative_candidates=0`.
- `REAL_OUT_OF_SCOPE_NEGATIVE_01` is not owner-approved or not linked.
- The negative account can access TTGDTX lead, finance, evidence, audit or
  settings data.
- The evidence is raw, uncontrolled, unsigned or stored only in Git/Codex/chat.

This queue is intentionally stricter than local packaging. It protects the
accounting UAT boundary and does not approve account creation, role scope,
signed UAT, finance reliance, owner GO/NO-GO or production GO.
