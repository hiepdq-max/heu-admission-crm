# HEU User Scope Baseline Repair Queue - 2026-07-03

Status: PASS_LOCAL_QUEUE

Decision lane: USER_SCOPE_BASELINE_REPAIR_READY / NO_GO / BLOCKED

Current decision: NO_GO

Purpose: isolate the live active-profile scope blocker before any user/role
cutover, position assignment, negative-control proof or department expansion.

## Current Live Snapshot

- `active_profiles=6`
- `active_non_admin_bgh=3`
- `missing_visibility=2`
- `missing_business_scope=2`
- `non_admin_all_visibility=0`
- `workspace_mismatch=0`
- `required_positions=15`
- `unassigned_required_positions=11`

`HIEU_TRUONG` and `PHO_HIEU_TRUONG` are treated as executive/BGH-equivalent
roles for this baseline. They stay behind owner sign-off and read-only
governance controls; they are not counted as daily non-ADMIN/BGH scope repair
users.

## Repair Queue

| Queue | Required owner action | Stop condition |
| --- | --- | --- |
| `USER-SCOPE-REPAIR-01` | Add explicit lead visibility for the active non-ADMIN/BGH daily operating profile through Settings/RPC after owner confirms the lane. Use `OWN`, `TEAM` or `DEPARTMENT`; keep `ALL` ADMIN/executive-only. | Any non-ADMIN/BGH daily operating user has no visibility row or receives `ALL` visibility. |
| `USER-SCOPE-REPAIR-02` | Add one approved admission segment or partner scope for the same active profile and verify the active workspace preference is inside that scope. | User has no segment/partner scope, or active workspace points outside assigned scope. |
| `USER-SCOPE-REPAIR-03` | Re-run owner-position candidate review only after scope baseline is green; candidate evidence is not owner approval. | Candidate profile is assigned to a required position before lead visibility and business scope are green. |
| `USER-SCOPE-REPAIR-04` | Re-run TTGDTX negative-control queue and operation cutover gate after baseline repair. | `REAL_OUT_OF_SCOPE_NEGATIVE_01` is missing or unrestricted TTGDTX data is visible. |

## Owner Repair Evidence

- Run `npm.cmd run check:heu-user-scope-baseline-repair-queue` to get
  `safe_owner_repair_labels` for the current missing lead visibility and
  business scope rows.
- The checker also prints `USER-SCOPE-REPAIR-OWNER-PACKET` with
  `owner_action_packet=profile_count=2`,
  `role_codes=DAO_TAO_LEAD,TCHC_LEAD`, `decision_count=4`,
  `lead_visibility_choice_required` and
  `segment_or_partner_scope_required` so owner-side repair can confirm the
  current daily operating queues rather than separate untracked fixes.
- Labels are redacted hash labels plus role code only. They are for secure
  owner-side lookup by IT_DATA; do not paste emails, names, phone numbers, raw
  IDs, screenshots, passwords, OTPs, invite links or reset links into this doc,
  Git, Codex or chat.
- Owner must map each label to one approved user lane outside Git/Codex/chat,
  then apply the approved `OWN`, `TEAM` or `DEPARTMENT` lead visibility and
  one approved segment or partner scope through Settings/RPC.
- `USER-SCOPE-REPAIR-OWNER-LABELS` and `USER-SCOPE-REPAIR-OWNER-PACKET` are
  evidence routing only; they are not owner approval and they do not change
  scope data.

## ACCT-00 Scope Repair Owner Packet Lock

`npm.cmd run check:heu-user-scope-baseline-repair-queue` also prints
`ACCT-00-SCOPE-REPAIR-OWNER-PACKET-LOCK` with
`scope_repair_owner_packet_lock=ACCT-00_SCOPE_REPAIR_OWNER_PACKET_LOCK`.
Use it between the owner packet and the owner decision matrix so safe labels
cannot be mistaken for owner approval.

The current live lock keeps `profile_count=2`, `decision_count=4` and
`role_codes=DAO_TAO_LEAD,TCHC_LEAD` visible without exposing profile IDs.

Required input tokens are
`required_inputs=safe_owner_repair_labels_generated,owner_action_packet_generated,role_codes_recorded,decision_count_recorded,secure_owner_lookup_channel_recorded,controlled_evidence_id_recorded`.

Required dependency-record tokens are
`required_dependency_record=safe_label,role_code,owner_label_mapped,owner_lane_confirmed,secure_owner_lookup_channel_recorded,controlled_evidence_id_recorded`.

The lock blocks the owner decision matrix when
`blocked_if=safe_owner_repair_labels_missing,owner_action_packet_missing,role_codes_missing,decision_count_mismatch,owner_label_unmapped,secure_owner_lookup_channel_missing,controlled_evidence_id_missing,raw_profile_id_present`.

The next allowed step after this lock is
`next_allowed_step=ACCT-00_SCOPE_REPAIR_OWNER_DECISION_MATRIX`.

The lock keeps these boundaries explicit:

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

This lock is owner-packet dependency routing only. It does not change scope,
grant business scope, set workspace preference, accept evidence, approve UAT,
approve finance reliance, approve owner GO/NO-GO or mark production GO.

## ACCT-00 Scope Repair Owner Decision Matrix

`npm.cmd run check:heu-user-scope-baseline-repair-queue` also prints
`ACCT-00-SCOPE-REPAIR-OWNER-DECISION-MATRIX` with
`scope_repair_owner_decision_matrix=ACCT-00_SCOPE_REPAIR_OWNER_DECISION_MATRIX`.
Use it to map each safe hash label to an owner-side decision before the
baseline owner checklist is treated as ready.

The current live matrix keeps `profile_count=2`, `decision_count=4`,
`role_codes=DAO_TAO_LEAD,TCHC_LEAD`, `missing_visibility_labels`,
`missing_business_scope_labels`, and the redacted hash labels in one owner lane.

Required owner-record tokens are
`required_owner_record=owner_label_mapped,lead_visibility_choice_recorded,business_scope_choice_recorded,owner_lane_confirmed,secure_admin_channel_recorded,controlled_evidence_id_recorded`.

Required per-label record tokens are
`required_per_label_record=safe_label,role_code,approved_visibility_choice_when_required,approved_segment_or_partner_scope_when_required,owner_reviewer,controlled_evidence_id`.

The matrix blocks closure when
`blocked_if=owner_label_unmapped,required_visibility_choice_missing,required_business_scope_choice_missing,secure_admin_channel_missing,controlled_evidence_id_missing`.

The next allowed step after this matrix is
`next_allowed_step=ACCT-00_SCOPE_BASELINE_OWNER_DECISION`.

The matrix keeps these boundaries explicit:

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

This matrix is owner-side routing only. It does not change lead visibility,
grant business scope, set workspace preference, accept evidence, approve UAT,
approve finance reliance, approve owner GO/NO-GO or mark production GO.

## In-App Scope Save Guard

- Settings scope saves are guarded by `P0-17_SCOPE_OWNER_APPROVAL_ACK`.
- `components/settings/user-business-scope-settings.tsx` requires
  `scope_owner_approved=yes` before the operator can submit a lead-visibility,
  admission-segment or partner-scope change.
- `app/settings/actions.ts` rejects `updateUserBusinessScopesAction` with
  `scope_owner_approval_required` unless the owner-approved secure channel
  confirmation is present; this check runs before any
  `user_admission_segment_scopes`, `user_partner_scopes` or
  `user_lead_visibility_scopes` write.
- The same Settings scope form requires
  `data-heu-scope-controlled-evidence-id="P0-17_SCOPE_CONTROLLED_EVIDENCE_ID"`
  and `scope_controlled_evidence_id` before saving.
- `app/settings/actions.ts` rejects missing or unsafe evidence tokens with
  `scope_controlled_evidence_id_required` or
  `scope_controlled_evidence_id_invalid`; the accepted value is stored only as
  `controlled_evidence_id=<safe token>` in the scope note.
- The same save path writes
  `lead_visibility_note_with_controlled_evidence=true` by storing the safe
  note on `user_lead_visibility_scopes` as well as segment/partner scope rows,
  so visibility repair has the same redacted traceability as business scope.
- This is a save guard only. It does not infer owner approval from a local
  PASS_LOCAL check, does not approve UAT and does not mark production GO.

## ACCT-00 Scope Baseline Owner Decision Checklist

`npm.cmd run check:heu-user-scope-baseline-repair-queue` also prints
`ACCT-00-SCOPE-BASELINE-DECISION-CHECKLIST` with
`scope_decision_checklist=ACCT-00_SCOPE_BASELINE_OWNER_DECISION` so the ACCT-00
scope repair cannot be inferred from hash labels or a local PASS_LOCAL package.

Required closure tokens are
`required_closure=lead_visibility_choice_recorded,business_scope_choice_recorded,owner_lane_confirmed,secure_admin_channel_recorded,post_repair_snapshot_recorded`,
`no_all_visibility_for_non_admin=true`, `no_password_or_invite_link=true` and
`no_auto_scope_change=true`.

The owner lane must record the approved lead visibility choice, the approved
segment or partner scope, the accountable owner lane, the secure admin channel
used for the repair and the post-repair snapshot result outside Git/Codex/chat.
This checklist does not change lead visibility, grant business scope, create
accounts, send invite/reset links, approve UAT, approve finance reliance,
approve owner GO/NO-GO or mark production GO.

## ACCT-00 Scope Repair Decision Dependency Lock

`npm.cmd run check:heu-user-scope-baseline-repair-queue` also prints
`ACCT-00-SCOPE-REPAIR-DECISION-DEPENDENCY-LOCK` with
`scope_repair_decision_dependency_lock=ACCT-00_SCOPE_REPAIR_DECISION_DEPENDENCY`.
Use it before any owner-side scope repair execution packet is treated as ready.

The lock keeps the current live blocker counts visible with
`missing_visibility=2`, `missing_business_scope=2`, `non_admin_all_visibility=0`
and `workspace_mismatch=0`.

Required input tokens are
`required_inputs=scope_baseline_decision_checklist_closed,lead_visibility_choice_recorded,business_scope_choice_recorded,owner_lane_confirmed,secure_admin_channel_recorded`.

Required dependency-record tokens are
`required_dependency_record=approved_visibility_choice_recorded,approved_business_scope_recorded,owner_lane_confirmed,secure_admin_channel_recorded,controlled_evidence_id_recorded`.

The lock blocks scope repair execution when
`blocked_if=scope_baseline_decision_checklist_closed=no,owner_lane_confirmed=no,lead_visibility_choice_recorded=no,business_scope_choice_recorded=no,secure_admin_channel_recorded=no`.

The next allowed step after this dependency record is closed is
`next_allowed_step=ACCT-00_SCOPE_REPAIR_EXECUTION`.

The lock keeps these boundaries explicit:

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

This lock is a dependency record only. It does not change lead visibility,
grant business scope, set workspace preference, accept evidence, create
accounts, approve UAT, approve finance reliance, approve owner GO/NO-GO or
mark production GO.

## ACCT-00 Scope Repair Execution Packet

`npm.cmd run check:heu-user-scope-baseline-repair-queue` also prints
`ACCT-00-SCOPE-REPAIR-EXECUTION-PACKET` with
`scope_repair_execution_packet=ACCT-00_SCOPE_REPAIR_EXECUTION`. Use it only
after the owner lane has closed the scope-baseline decision checklist.

Required input tokens are
`required_inputs=owner_lane_confirmed,lead_visibility_choice_recorded,business_scope_choice_recorded,secure_admin_channel_recorded`.

Required execution-record tokens are
`required_execution_record=pre_repair_snapshot_recorded,approved_visibility_choice_applied,approved_business_scope_applied,workspace_preference_verified,post_repair_snapshot_recorded,controlled_evidence_id_recorded`.

The packet keeps these boundaries explicit:

- `no_all_visibility_for_non_admin=true`.
- `no_password_or_invite_link=true`.
- `no_raw_profile_id=true`.
- `no_service_role_key_in_evidence=true`.
- `no_auto_scope_change=true`.
- `no_auto_uat_approval=true`.
- `no_auto_production_go=true`.

This packet is an owner-side execution record only. It does not change lead
visibility, grant business scope, set workspace preference, expose raw profile
IDs, expose service-role keys, create accounts, approve UAT, approve finance
reliance, approve owner GO/NO-GO or mark production GO.

## ACCT-00 Scope Post-Repair Rerun Proof Packet

`npm.cmd run check:heu-user-scope-baseline-repair-queue` also prints
`ACCT-00-SCOPE-POST-REPAIR-RERUN-PROOF-PACKET` with
`scope_post_repair_rerun_proof_packet=ACCT-00_SCOPE_POST_REPAIR_RERUN_PROOF`.
Use it after the owner-side scope repair execution packet and before
post-repair verification is treated as ready.

The current live packet remains `scope_baseline_closed=no` while
`missing_visibility=2` and `missing_business_scope=2`.

Required input tokens are
`required_inputs=scope_repair_execution_closed,post_repair_snapshot_recorded,controlled_evidence_id_recorded,owner_lane_confirmed`.

Required rerun-record tokens are
`required_rerun_record=check_heu_user_scope_baseline_repair_queue_rerun,check_heu_negative_control_account_queue_rerun,check_heu_finance_payment_scope_readiness_rerun,check_heu_role_scope_uat_pack_rerun,check_heu_user_account_security_rerun`.

Required result-record tokens are
`required_result_record=missing_visibility=0,missing_business_scope=0,non_admin_all_visibility=0,workspace_mismatch=0,ttgdtx_negative_candidates_recomputed,finance_payment_scope_ready_recorded,role_scope_pack_passed,controlled_evidence_id_recorded`.

The packet blocks verification when
`blocked_if=scope_baseline_closed=no,post_repair_snapshot_recorded=no,controlled_evidence_id_recorded=no,negative_control_queue_re_run_recorded=no`.

The next allowed step after this packet is
`next_allowed_step=ACCT-00_SCOPE_POST_REPAIR_VERIFICATION`.

The packet keeps these boundaries explicit:

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

This packet is a rerun proof record only. It does not run UAT, create accounts,
change lead visibility, grant business scope, accept evidence, approve finance
reliance, approve owner GO/NO-GO or mark production GO.

## ACCT-00 Scope Post-Repair Verification Packet

`npm.cmd run check:heu-user-scope-baseline-repair-queue` also prints
`ACCT-00-SCOPE-POST-REPAIR-VERIFICATION-PACKET` with
`scope_post_repair_verification_packet=ACCT-00_SCOPE_POST_REPAIR_VERIFICATION`.
Use it only after the owner-side scope repair execution packet is closed.

The current live packet remains `scope_baseline_closed=no` while
`missing_visibility=2` and `missing_business_scope=2`.

Required input tokens are
`required_inputs=scope_repair_execution_closed,post_repair_snapshot_recorded,controlled_evidence_id_recorded`.

Required verification-record tokens are
`required_verification_record=missing_visibility=0,missing_business_scope=0,non_admin_all_visibility=0,workspace_mismatch=0,workspace_preference_inside_scope_confirmed,negative_control_queue_re_run_recorded,controlled_evidence_id_recorded`.

The next allowed step after this packet is closed is
`next_allowed_step=ACCT-00_SCOPE_EXTERNAL_CLOSURE_HANDOFF`.

The packet keeps these boundaries explicit:

- `no_raw_profile_id=true`.
- `no_service_role_key_in_evidence=true`.
- `no_password_or_invite_link=true`.
- `no_auto_scope_change=true`.
- `no_auto_acceptance=true`.
- `no_auto_uat_approval=true`.
- `no_auto_production_go=true`.

This packet is a verification record only. It does not change lead visibility,
grant business scope, set workspace preference, accept evidence, create
accounts, approve UAT, approve finance reliance, approve owner GO/NO-GO or
mark production GO.

## ACCT-00 Scope External Closure Handoff Packet

`npm.cmd run check:heu-user-scope-baseline-repair-queue` also prints
`ACCT-00-SCOPE-EXTERNAL-CLOSURE-HANDOFF-PACKET` with
`scope_external_closure_handoff_packet=ACCT-00_SCOPE_EXTERNAL_CLOSURE_HANDOFF`.
Use it only after post-repair verification is closed and before
negative-account dependency is treated as ready.

The current live packet remains `scope_baseline_closed=no` while
`missing_visibility=2` and `missing_business_scope=2`.

Required input tokens are
`required_inputs=scope_baseline_decision_checklist_closed,scope_repair_execution_closed,scope_post_repair_rerun_proof_closed,scope_post_repair_verification_closed,controlled_evidence_id_recorded,owner_lane_confirmed`.

Required owner-closure tokens are
`required_owner_closure=missing_visibility=0,missing_business_scope=0,non_admin_all_visibility=0,workspace_mismatch=0,lead_visibility_choice_recorded,business_scope_choice_recorded,approved_visibility_choice_applied,approved_business_scope_applied,workspace_preference_inside_scope_confirmed,post_repair_snapshot_recorded,negative_control_queue_re_run_recorded,controlled_evidence_id_recorded`.

The handoff blocks negative-account dependency when
`blocked_if=scope_baseline_closed=no,missing_visibility>0,missing_business_scope>0,non_admin_all_visibility>0,workspace_mismatch>0,controlled_evidence_id_recorded=no`.

The next allowed step after this handoff is
`next_allowed_step=ACCT-00_NEGATIVE_ACCOUNT_DEPENDENCY`.

The handoff keeps these boundaries explicit:

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

This handoff is external owner-closure routing only. It does not change lead
visibility, grant business scope, set workspace preference, create accounts,
accept evidence, approve UAT, approve finance reliance, approve owner GO/NO-GO
or mark production GO.

## Required Commands

- `npm.cmd run check:heu-user-scope-baseline-repair-queue -- --static-only`
  for PASS_LOCAL package verification without reading live Supabase data
- `npm.cmd run check:heu-user-scope-baseline-repair-queue`
  for live owner queue labels; this remains `NO_GO` until the owner closes
  `missing_visibility` and `missing_business_scope`
- `npm.cmd run check:heu-permission-scope-readiness`
- `npm.cmd run check:heu-user-activation-worksheet-readiness`
- `npm.cmd run check:heu-position-assignment-owner-queue`
- `npm.cmd run check:heu-negative-control-account-queue`
- `npm.cmd run check:heu-user-operation-cutover-readiness`
- `npm.cmd run audit:heu-user-account-security`

## PASS_LOCAL Boundary

This queue does not create accounts, assign real users, set passwords, send
reset/invite links, change lead visibility, add segment/partner scope, execute
UAT, accept evidence, approve finance reliance, approve owner GO/NO-GO or mark
production GO.

Boundary tokens: send reset/invite links; execute UAT; mark production GO.

It is expected to return `NO_GO` until the owner-approved scope repair is done
through the app/secure admin channel and redacted evidence is stored outside
Git/Codex/chat.
