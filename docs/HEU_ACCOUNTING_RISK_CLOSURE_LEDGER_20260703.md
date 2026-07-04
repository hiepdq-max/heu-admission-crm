# HEU Accounting Risk Closure Ledger - 2026-07-03

Status: PASS_LOCAL_RISK_LEDGER_TEMPLATE
Decision lane: ACCT_11_RISK_READY / NO_GO / BLOCKED
Production/UAT status: NO-GO until Audit, IT_DATA, KHTC, PHAP_CHE, BGH and
process owners sign the required evidence outside Git/Codex/chat.

## Purpose

This ledger turns ACCT-11 into one controlled evidence queue for audit trace,
hard-delete/cascade, backup/restore, rollback and migration-order closure. It
does not execute backup, restore, migration, deletion, cascade conversion,
rollback, UAT, evidence acceptance, finance action, owner waiver, owner GO/NO-GO
or production GO.

Secret boundary: do not paste passwords, temporary passwords, OTPs, password
reset links, account activation/invite links, service-role keys, API keys,
database URLs, raw student PII, CCCD, phone numbers, bank accounts, bank
statements, voucher bodies, raw payment evidence, backup dumps, restore exports
or raw database exports into this file, Git, Codex/chat, email notes or
screenshots. Use controlled evidence IDs only.

## Required Risk Ledger

| Item | Control focus | Required result | Controlled evidence ID | Owner decision |
|---|---|---|---|---|
| ACCT-11-AUDIT-01 | TTGDTX write audit trigger coverage | PASS / FAIL / BLOCKED | PENDING_EXTERNAL_EVIDENCE | PENDING_OWNER |
| ACCT-11-AUDIT-02 | P6-03 audit trace UI, acceptance matrix and decision manifest | PASS / FAIL / BLOCKED | PENDING_EXTERNAL_EVIDENCE | PENDING_OWNER |
| ACCT-11-HD-01 | TTGDTX finance/evidence/audit hard-delete and cascade boundary | PASS / FAIL / BLOCKED | PENDING_EXTERNAL_EVIDENCE | PENDING_OWNER |
| ACCT-11-HD-02 | P6-06 non-TTGDTX cascade conversion or written waiver closure | PASS / FAIL / BLOCKED | PENDING_EXTERNAL_EVIDENCE | PENDING_OWNER |
| ACCT-11-BR-01 | P0-03 backup ID, restore target identity and target isolation | PASS / FAIL / BLOCKED | PENDING_EXTERNAL_EVIDENCE | PENDING_OWNER |
| ACCT-11-BR-02 | Restore smoke-check for P0-19, P3 gate preservation and P0-17 access closure state | PASS / FAIL / BLOCKED | PENDING_EXTERNAL_EVIDENCE | PENDING_OWNER |
| ACCT-11-MIG-01 | Step90-Step110 migration order and evidence acceptance lock | PASS / FAIL / BLOCKED | PENDING_EXTERNAL_EVIDENCE | PENDING_OWNER |
| ACCT-11-ROLLBACK-01 | Rollback/redaction proof independent of hard-delete/cascade execution | PASS / FAIL / BLOCKED | PENDING_EXTERNAL_EVIDENCE | PENDING_OWNER |
| ACCT-11-FINAL-01 | Human risk-closure decision across Audit, IT_DATA, KHTC, PHAP_CHE and BGH | PASS / FAIL / BLOCKED | PENDING_EXTERNAL_EVIDENCE | PENDING_OWNER |

## Acceptance Ledger

| Acceptance item | Requirement | Required evidence | Owner decision |
|---|---|---|---|
| ACCT-11-ACCEPT-01 | Audit trace coverage is usable | `audit:ttgdtx-audit-log` and `audit:ttgdtx-audit-trail-guard` pass, and sampled rows identify actor, entity, action, timestamp and before/after usefulness | PENDING_OWNER |
| ACCT-11-ACCEPT-02 | Hard-delete/cascade risk is not waived silently | `audit:hard-delete-boundary-guard` passes, P6-06-FIND-001 through P6-06-FIND-044 are converted or covered by written waiver | PENDING_OWNER |
| ACCT-11-ACCEPT-03 | Backup/restore proof is real and target-safe | REAL-OPS-01 has controlled backup, restore target and smoke-check proof outside Git/Codex/chat | PENDING_OWNER |
| ACCT-11-ACCEPT-04 | Migration order is signed after backup/restore proof | REAL-OPS-02 confirms signer authority, Step90-Step110 scope, exception decisions and rollback note | PENDING_OWNER |
| ACCT-11-ACCEPT-05 | Rollback/redaction path does not destroy evidence | Rollback and cleanup proof does not rely on hard-delete, cascade execution or raw sensitive evidence in Git/Codex/chat | PENDING_OWNER |
| ACCT-11-ACCEPT-06 | Production/UAT boundary is acknowledged | Owners confirm PASS_LOCAL is only risk-closure packaging and does not approve UAT, finance action, migration, waiver or production GO | PENDING_OWNER |

## Owner Action Packet

- `npm.cmd run check:heu-accounting-risk-closure-ledger` also prints
  `ACCT-11-RISK-OWNER-PACKET` with
  `owner_action_packet=ACCT-11_RISK_CLOSURE`,
  `owner_lanes=Audit,IT_DATA,KHTC,PHAP_CHE,BGH,process_owners`,
  `pending_risk_external_evidence=9`, `pending_risk_owner=9`,
  `pending_acceptance_owner=6` and `required_owner_decisions=15` while the
  current ACCT-11 blocker remains open.
- Required owner decisions are routed as
  `close_audit_trace_evidence`, `close_hard_delete_cascade_evidence`,
  `close_backup_restore_proof`, `sign_migration_order`,
  `accept_rollback_redaction_proof` and `record_final_risk_decision`.
- The packet is owner-side routing only. It does not run backup/restore,
  execute migration, convert or waive cascade risk, execute rollback, accept
  evidence, approve finance reliance, approve owner GO/NO-GO or mark
  production GO.

## Risk Evidence Intake Checklist

`npm.cmd run check:heu-accounting-risk-closure-ledger` also prints
`ACCT-11-RISK-EVIDENCE-INTAKE-CHECKLIST` with
`risk_evidence_checklist=ACCT-11_EVIDENCE_INTAKE` so Audit, IT_DATA, KHTC,
PHAP_CHE, BGH and process owners can close risk evidence in one controlled
order:

1. Close ACCT-11-AUDIT evidence and owner decisions.
2. Close ACCT-11-HD hard-delete/cascade conversion or written waiver evidence.
3. Close ACCT-11-BR backup/restore proof and restore smoke-check evidence.
4. Close ACCT-11-MIG signed Step90-Step110 migration order.
5. Close ACCT-11-ROLLBACK rollback/redaction proof.
6. Close ACCT-11-FINAL and ACCT-11-ACCEPT owner decisions.

Required closure tokens are
`required_closure=pending_risk_external_evidence=0,pending_risk_owner=0,pending_acceptance_owner=0,controlled_evidence_ids_recorded`,
`no_raw_backup_or_database_export=true` and `no_auto_acceptance=true`.

The checklist is an intake route only. It does not accept evidence, inspect raw
backup dumps, import database exports, approve migration, approve rollback,
approve finance reliance, approve owner GO/NO-GO or mark production GO.

## Audit Trace Closure Checklist

`npm.cmd run check:heu-accounting-risk-closure-ledger` also prints
`ACCT-11-AUDIT-TRACE-CLOSURE-CHECKLIST` with
`audit_trace_checklist=ACCT-11_AUDIT_TRACE_CLOSURE`. Use it before
backup/restore proof, migration order, rollback/redaction proof or final risk
decision:

- `required_inputs=ttgdtx_write_trigger_coverage_confirmed,audit_trace_ui_confirmed,acceptance_matrix_reviewed,decision_manifest_reviewed`.
- `required_closure=audit_log_trigger_coverage_recorded,sampled_actor_recorded,sampled_entity_recorded,sampled_action_recorded,sampled_timestamp_recorded,before_after_usefulness_recorded,controlled_evidence_ids_recorded,owner_quorum_recorded`.
- `no_raw_audit_payload=true`.
- `no_audit_log_mutation=true`.
- `no_auto_acceptance=true`.
- `no_auto_production_go=true`.

This checklist records only audit-trace proof routing. It does not mutate audit
logs, paste raw audit payload, accept evidence, approve finance reliance,
approve owner GO/NO-GO or mark production GO.

## Hard-Delete/Cascade Closure Checklist

`npm.cmd run check:heu-accounting-risk-closure-ledger` also prints
`ACCT-11-HARD-DELETE-CASCADE-CLOSURE-CHECKLIST` with
`hard_delete_cascade_checklist=ACCT-11_HARD_DELETE_CASCADE_CLOSURE`. Use it
before backup/restore proof, migration order, rollback/redaction proof or final
risk decision:

- `required_inputs=audit_trace_closed,p6_06_boundary_guard_passed,cascade_finding_register_reviewed,conversion_or_waiver_path_identified`.
- `required_closure=ttgdtx_hard_delete_boundary_recorded,p6_06_findings_triaged,conversion_or_written_waiver_recorded,protected_record_retention_recorded,cascade_execution_blocked,controlled_evidence_ids_recorded,owner_quorum_recorded`.
- `no_hard_delete_execution=true`.
- `no_cascade_execution=true`.
- `no_owner_waiver_inference=true`.
- `no_auto_acceptance=true`.
- `no_auto_production_go=true`.

This checklist records only closure routing. It does not execute hard-delete,
execute cascade cleanup, infer owner waiver, accept evidence, approve finance
reliance, approve owner GO/NO-GO or mark production GO.

## Backup/Restore Proof Checklist

`npm.cmd run check:heu-accounting-risk-closure-ledger` also prints
`ACCT-11-BACKUP-RESTORE-PROOF-CHECKLIST` with
`backup_restore_checklist=ACCT-11_BACKUP_RESTORE_PROOF`. Use it before
Step90-Step110 migration order or final ACCT-11 risk decision:

- `required_inputs=audit_trace_closed,hard_delete_boundary_closed,restore_target_identified,rollback_redaction_path_defined`.
- `required_closure=backup_id_recorded,restore_target_recorded,target_isolation_recorded,restore_smoke_check_recorded,controlled_evidence_ids_recorded,owner_quorum_recorded`.
- `no_raw_backup_or_database_export=true`.
- `no_migration_approval=true`.
- `no_auto_acceptance=true`.
- `no_auto_production_go=true`.

This checklist records only proof routing. It does not execute backup/restore,
inspect raw dumps, approve migration, accept evidence, approve finance
reliance, approve owner GO/NO-GO or mark production GO.

## Migration Order Signoff Checklist

`npm.cmd run check:heu-accounting-risk-closure-ledger` also prints
`ACCT-11-MIGRATION-ORDER-SIGNOFF-CHECKLIST` with
`migration_order_checklist=ACCT-11_MIGRATION_ORDER_SIGNOFF`. Use it after
backup/restore proof and before the final ACCT-11 risk decision:

- `required_inputs=backup_restore_proof_closed,audit_trace_closed,hard_delete_boundary_closed,rollback_redaction_path_defined`.
- `required_closure=step90_step110_order_signed,signer_authority_recorded,migration_scope_recorded,exception_decisions_recorded,rollback_note_recorded,controlled_evidence_ids_recorded,owner_quorum_recorded`.
- `no_migration_execution=true`.
- `no_auto_migration_approval=true`.
- `no_auto_acceptance=true`.
- `no_auto_production_go=true`.

This checklist records only signed-order routing. It does not execute
migration, approve migration, accept evidence, approve finance reliance,
approve owner GO/NO-GO or mark production GO.

## Rollback/Redaction Proof Checklist

`npm.cmd run check:heu-accounting-risk-closure-ledger` also prints
`ACCT-11-ROLLBACK-REDACTION-PROOF-CHECKLIST` with
`rollback_redaction_checklist=ACCT-11_ROLLBACK_REDACTION_PROOF`. Use it before
the final ACCT-11 risk decision:

- `required_inputs=backup_restore_proof_closed,migration_order_signed,audit_trace_closed,protected_evidence_identified`.
- `required_closure=rollback_path_recorded,redaction_path_recorded,protected_evidence_retained,audit_history_retained,cleanup_scope_recorded,controlled_evidence_ids_recorded,owner_quorum_recorded`.
- `no_hard_delete_execution=true`.
- `no_cascade_execution=true`.
- `no_evidence_destruction=true`.
- `no_auto_acceptance=true`.
- `no_auto_production_go=true`.

This checklist records only rollback/redaction proof routing. It does not
execute rollback, execute hard-delete, execute cascade cleanup, destroy
evidence, accept evidence, approve finance reliance, approve owner GO/NO-GO or
mark production GO.

## Final Risk Dependency Lock

`npm.cmd run check:heu-accounting-risk-closure-ledger` also prints
`ACCT-11-FINAL-RISK-DEPENDENCY-LOCK` with
`final_risk_dependency_lock=ACCT-11_FINAL_RISK_DEPENDENCY`. Use it before the
final risk decision checklist, so the final ACCT-11 decision cannot be inferred
from partial evidence-intake routing, local guard success or owner silence:

- Required inputs are
  `required_inputs=audit_trace_closed,hard_delete_cascade_closed,backup_restore_proof_closed,migration_order_signed,rollback_redaction_proof_closed,controlled_evidence_ids_recorded,owner_quorum_recorded`.
- Required dependency record is
  `required_dependency_record=audit_log_trigger_coverage_recorded,p6_06_findings_triaged,backup_id_recorded,restore_smoke_check_recorded,step90_step110_order_signed,rollback_path_recorded,redaction_path_recorded,protected_evidence_retained,controlled_evidence_ids_recorded,owner_quorum_recorded`.
- Blocked when
  `blocked_if=audit_trace_closed=no,hard_delete_cascade_closed=no,backup_restore_proof_closed=no,migration_order_signed=no,rollback_redaction_proof_closed=no,controlled_evidence_ids_recorded=no,owner_quorum_recorded=no`.
- `next_allowed_step=ACCT-11_FINAL_RISK_DECISION`.
- `no_evidence_acceptance=true`.
- `no_owner_waiver_inference=true`.
- `no_finance_reliance_inference=true`.
- `no_uat_pass_inference=true`.
- `no_owner_go_inference=true`.
- `no_auto_migration_approval=true`.
- `no_auto_production_go=true`.

This lock is dependency routing only. It does not accept evidence, infer owner
waiver, approve finance reliance, infer UAT pass, approve owner GO/NO-GO,
approve migration or mark production GO.

## Final Risk Decision Checklist

`npm.cmd run check:heu-accounting-risk-closure-ledger` also prints
`ACCT-11-RISK-FINAL-DECISION-CHECKLIST` with
`risk_decision_checklist=ACCT-11_FINAL_RISK_DECISION`. Use it after the
evidence-intake checklist, not before it:

- `required_closure=final_risk_decision_recorded,owner_quorum_recorded,waiver_or_correction_recorded,boundary_acknowledged`.
- `no_owner_waiver_inference=true`.
- `no_auto_migration_approval=true`.
- `no_auto_production_go=true`.

The final risk decision must explicitly name the owner quorum, the final
PASS/NO_GO/BLOCKED decision, any waiver-or-correction path and the boundary
acknowledgement outside Git/Codex/chat. The local checker only reports whether
those fields are still pending; it never infers a waiver, approves migration or
marks production GO.

## Final Risk Decision Packet

`npm.cmd run check:heu-accounting-risk-closure-ledger` also prints
`ACCT-11-FINAL-RISK-DECISION-PACKET` with
`final_risk_decision_packet=ACCT-11_FINAL_RISK_DECISION_PACKET`. Use it after
the audit trace, hard-delete/cascade, backup/restore, migration order and
rollback/redaction proof packets are closed outside Git/Codex/chat.

- Required inputs are
  `required_inputs=audit_trace_closed,hard_delete_cascade_closed,backup_restore_proof_closed,migration_order_signed,rollback_redaction_proof_closed,controlled_evidence_ids_recorded`.
- Allowed decision values are `allowed_decision_values=PASS,NO_GO,BLOCKED`.
- Required decision record is
  `required_decision_record=final_risk_decision_recorded,owner_quorum_recorded,residual_risk_statement_recorded,waiver_or_correction_recorded,boundary_acknowledged,controlled_evidence_ids_recorded`.
- `residual_risk_statement_recorded`.
- `no_owner_waiver_inference=true`.
- `no_evidence_acceptance=true`.
- `no_migration_execution=true`.
- `no_auto_migration_approval=true`.
- `no_finance_reliance_inference=true`.
- `no_uat_pass_inference=true`.
- `no_owner_go_inference=true`.
- `no_auto_production_go=true`.

This packet records the final risk decision route only. It does not accept
evidence, infer waiver approval, execute migration, approve finance reliance,
treat UAT as passed, approve owner GO/NO-GO or mark production GO.

## Risk External Evidence Handoff Packet

`npm.cmd run check:heu-accounting-risk-closure-ledger` also prints
`ACCT-11-RISK-EXTERNAL-EVIDENCE-HANDOFF-PACKET` with
`risk_external_evidence_handoff_packet=ACCT-11_RISK_EXTERNAL_EVIDENCE_HANDOFF`
and `source=accounting_risk_closure_ledger_runtime`.
Use it after the final risk decision packet and before ACCT-12 finance
reliance can treat ACCT-11 as closed.

The current live handoff remains `risk_closure_ready=no` while
`pending_risk_external_evidence>0`, `pending_risk_owner>0` or
`pending_acceptance_owner>0`.

Required input tokens are
`required_inputs=audit_trace_closed,hard_delete_cascade_closed,backup_restore_proof_closed,migration_order_signed,rollback_redaction_proof_closed,final_risk_decision_recorded,owner_quorum_recorded,controlled_evidence_ids_recorded`.

Required owner-closure tokens are
`required_owner_closure=pending_risk_external_evidence=0,pending_risk_owner=0,pending_acceptance_owner=0,audit_log_trigger_coverage_recorded,p6_06_findings_triaged,backup_id_recorded,restore_smoke_check_recorded,step90_step110_order_signed,rollback_path_recorded,redaction_path_recorded,protected_evidence_retained,final_risk_decision_recorded,owner_quorum_recorded,controlled_evidence_ids_recorded`.

Block the handoff if
`blocked_if=pending_risk_external_evidence>0,pending_risk_owner>0,pending_acceptance_owner>0,final_risk_decision_recorded=no,owner_quorum_recorded=no,controlled_evidence_ids_recorded=no`.

The next allowed dependency is
`next_allowed_step=ACCT-12_FINANCE_RELIANCE_DEPENDENCY`.

This handoff must keep `no_raw_backup_or_database_export=true`,
`no_evidence_acceptance=true`, `no_finance_reliance_inference=true`,
`no_uat_pass_inference=true`, `no_owner_go_inference=true`,
`no_auto_migration_approval=true` and `no_auto_production_go=true`.

This packet is external evidence closure routing only. It does not inspect raw
backup/database exports, accept evidence, approve migration, approve finance
reliance, approve UAT, approve owner GO/NO-GO or mark production GO.

## Risk Closure Decision

Final decision: ACCT_11_RISK_READY / NO_GO / BLOCKED

Required before `ACCT_11_RISK_READY`:

- Every ACCT-11-AUDIT-01 through ACCT-11-FINAL-01 row has PASS or an
  owner-signed BLOCKED decision with a controlled evidence ID.
- Every ACCT-11-ACCEPT-01 through ACCT-11-ACCEPT-06 item has an owner decision.
- P6-03 audit-log UAT evidence is signed outside Git/Codex/chat.
- `ACCT-11-AUDIT-TRACE-CLOSURE-CHECKLIST` is closed with
  `audit_log_trigger_coverage_recorded`, `sampled_actor_recorded`,
  `sampled_entity_recorded`, `sampled_action_recorded`,
  `sampled_timestamp_recorded`, `before_after_usefulness_recorded`,
  `controlled_evidence_ids_recorded` and `owner_quorum_recorded` outside
  Git/Codex/chat.
- `ACCT-11-HARD-DELETE-CASCADE-CLOSURE-CHECKLIST` is closed with
  `ttgdtx_hard_delete_boundary_recorded`, `p6_06_findings_triaged`,
  `conversion_or_written_waiver_recorded`,
  `protected_record_retention_recorded`, `cascade_execution_blocked`,
  `controlled_evidence_ids_recorded` and `owner_quorum_recorded` outside
  Git/Codex/chat.
- P6-06 non-TTGDTX/base cascade findings are converted or covered by written
  waiver outside Git/Codex/chat.
- P0-03 backup/restore proof and restore smoke-check are accepted outside
  Git/Codex/chat.
- `ACCT-11-BACKUP-RESTORE-PROOF-CHECKLIST` is closed with
  `backup_id_recorded`, `restore_target_recorded`,
  `target_isolation_recorded`, `restore_smoke_check_recorded`,
  `controlled_evidence_ids_recorded` and `owner_quorum_recorded` outside
  Git/Codex/chat.
- Step90-Step110 migration order is signed after backup/restore proof.
- `ACCT-11-MIGRATION-ORDER-SIGNOFF-CHECKLIST` is closed with
  `step90_step110_order_signed`, `signer_authority_recorded`,
  `migration_scope_recorded`, `exception_decisions_recorded`,
  `rollback_note_recorded`, `controlled_evidence_ids_recorded` and
  `owner_quorum_recorded` outside Git/Codex/chat.
- `ACCT-11-ROLLBACK-REDACTION-PROOF-CHECKLIST` is closed with
  `rollback_path_recorded`, `redaction_path_recorded`,
  `protected_evidence_retained`, `audit_history_retained`,
  `cleanup_scope_recorded`, `controlled_evidence_ids_recorded` and
  `owner_quorum_recorded` outside Git/Codex/chat.
- Rollback/redaction proof is accepted without deleting protected evidence or
  hiding audit history.
- `ACCT-11-FINAL-RISK-DEPENDENCY-LOCK` is closed with audit trace,
  hard-delete/cascade, backup/restore, migration order, rollback/redaction,
  controlled evidence IDs, owner quorum and no final-risk inference recorded
  outside Git/Codex/chat.
- `ACCT-11-FINAL-RISK-DECISION-PACKET` is closed with
  `final_risk_decision_recorded`, `owner_quorum_recorded`,
  `residual_risk_statement_recorded`, `waiver_or_correction_recorded`,
  `boundary_acknowledged` and `controlled_evidence_ids_recorded` outside
  Git/Codex/chat.
- `ACCT-11-RISK-EXTERNAL-EVIDENCE-HANDOFF-PACKET` is closed with
  `risk_closure_ready=yes`, zero pending risk evidence/owner rows,
  final risk decision, owner quorum and controlled evidence IDs outside
  Git/Codex/chat.

Stop condition:

- Any missing controlled evidence ID.
- Any `FAIL` without correction or owner waiver.
- Any raw sensitive backup, restore, audit, payout, bank, student, voucher or
  database evidence copied into Git/Codex/chat.
- Any owner treats PASS_LOCAL as UAT acceptance, finance approval, migration
  approval, waiver approval, rollback success, owner GO/NO-GO or production GO.

## Local Guard Commands

```powershell
npm.cmd run audit:ttgdtx-audit-log
npm.cmd run audit:ttgdtx-audit-trail-guard
npm.cmd run audit:hard-delete-boundary-guard
npm.cmd run audit:ttgdtx-backup-restore-dry-run-pack
npm.cmd run audit:ttgdtx-migration-order-guard
npm.cmd run check:heu-accounting-risk-closure-ledger
npm.cmd run check:heu-accounting-module-breakdown
```

These commands only verify packaging. They do not sign UAT, accept evidence,
approve migration, approve finance action or approve production.
