# TTGDTX Audit Log UAT Runbook

## 1. Purpose

This runbook verifies that TTGDTX accounting and control records leave an audit
trail for create, update, check, approve and pay actions.

Production remains NO-GO until this runbook is executed with UAT data and
signed off by IT Data, KHTC and Audit.

## 2. Static Guard

Run before UAT:

```powershell
npm.cmd run audit:ttgdtx-audit-log
```

Expected: all TTGDTX Step90-Step110 tables have `write_audit_log()` triggers where those steps create TTGDTX tables.

## 3. Scope

Required audited tables include:

| Step | Table group |
|---|---|
| P2-03 | `ttgdtx_student_receivables` |
| P2-06 | `ttgdtx_tuition_import_batches`, `ttgdtx_tuition_import_staging_rows`, `ttgdtx_tuition_import_checks`, `ttgdtx_tuition_import_field_map` |
| P2-07/P2-08 | `ttgdtx_import_issue_route_rules`, `ttgdtx_import_issue_tasks`, `ttgdtx_import_issue_task_events` |
| P2-10 | `ttgdtx_tuition_payments` |
| P2-11/P2-12 | `ttgdtx_source_documents`, `ttgdtx_source_control_checks`, `ttgdtx_center_master` |
| P2-13/P2-14 | `ttgdtx_tuition_reconciliation_batches`, `ttgdtx_tuition_reconciliation_lines` |
| P2-15/P2-16/P2-17 | `ttgdtx_partner_payment_requests`, `ttgdtx_partner_payment_request_lines`, `ttgdtx_partner_payment_disbursements` |

## 4. UAT Matrix

| Case | Action | Expected evidence |
|---|---|---|
| AUD-01 | Create one P2-03 receivable | `audit_logs` has insert/update evidence for `ttgdtx_student_receivables` |
| AUD-02 | Record one P2-10 payment | `audit_logs` has evidence for `ttgdtx_tuition_payments` and linked receivable update |
| AUD-03 | Create and lock one P2-13/P2-14 reconciliation batch | `audit_logs` has evidence for reconciliation batch and lines |
| AUD-04 | Create/check/approve one P2-15/P2-16 payment request | `audit_logs` has evidence for payment request status changes |
| AUD-05 | Record one P2-17 disbursement | `audit_logs` has evidence for disbursement and request paid amount/status update |
| AUD-06 | Update one P2-11 source control item | `audit_logs` has evidence for source document or control check update |

## 5. Local Audit Trail Guard Evidence

Before signed UAT, the repo must keep local audit-trail evidence green:

- `components/audit/ttgdtx-audit-trail-guard.tsx` shows the required TTGDTX
  entity groups on `/audit`.
- `components/audit/ttgdtx-audit-log-uat-evidence-checklist.tsx` lists
  AUD-01 through AUD-06 evidence expected from the signed UAT session.
- `components/audit/ttgdtx-audit-log-uat-evidence-checklist.tsx` also exposes
  `data-ttgdtx-audit-log-evidence-acceptance-matrix="P6-03"` with
  P6-03-ACCEPT-01 through P6-03-ACCEPT-06 and decision value
  `P6_03_ACCEPT / FAIL / BLOCKED`.
- `components/audit/ttgdtx-audit-trail-guard.tsx` also exposes
  `data-ttgdtx-audit-trace-acceptance-matrix="P6-03"` with AUD-TRACE-01
  through AUD-TRACE-06 acceptance rules.
- `app/audit/page.tsx` mounts the guard and only reads `audit_logs`.
- `npm.cmd run audit:ttgdtx-audit-log` verifies Step90-Step110 tables have
  `write_audit_log()` triggers where the steps create TTGDTX tables.
- `npm.cmd run audit:ttgdtx-audit-trail-guard` must pass.

This local evidence does not replace signed UAT. It only proves the audit log
surface is packaged before Audit/KHTC execute the matrix above.

## 6. Evidence Queries

Use these only against UAT/test data.

```sql
select
  entity_type,
  action,
  count(*) as audit_count,
  min(created_at) as first_seen,
  max(created_at) as last_seen
from public.audit_logs
where entity_type in (
  'ttgdtx_student_receivables',
  'ttgdtx_tuition_payments',
  'ttgdtx_tuition_reconciliation_batches',
  'ttgdtx_partner_payment_requests',
  'ttgdtx_partner_payment_disbursements',
  'ttgdtx_source_documents',
  'ttgdtx_source_control_checks'
)
group by entity_type, action
order by entity_type, action;
```

Expected: tested actions have at least one audit row.

```sql
select
  entity_type,
  entity_id,
  action,
  user_id,
  created_at
from public.audit_logs
where created_at >= now() - interval '1 day'
  and entity_type like 'ttgdtx_%'
order by created_at desc
limit 100;
```

Expected: recent UAT actions identify the user and affected entity.

## 7. Audit Trace Acceptance Matrix

Signed audit-log evidence must pass this matrix before P6-03 can move from
`IN_PROGRESS` to `DONE`. This matrix does not replace signed UAT; it prevents
weak screenshots or incomplete audit rows from being treated as financial
traceability.

| Case | Requirement | Minimum evidence | Stop condition |
|---|---|---|---|
| AUD-TRACE-01 | Actor identity and timestamp | `user_id`, `created_at` and business action time identify who changed the record and when | Actor or time is missing, vague or cannot be tied to the UAT step |
| AUD-TRACE-02 | Entity and action coverage | `entity_type`, `entity_id` and `action` map to the tested receivable, payment, reconciliation, request, payout or source-control record | Action or entity naming is too generic for finance traceability |
| AUD-TRACE-03 | Before/after value usefulness | `old_values`, `new_values` or notes prove the changed field, amount, status or approval state | Payload does not explain what changed in the financial record |
| AUD-TRACE-04 | Evidence link or controlled reference | Audit row aligns with `evidence_url`, source document or controlled evidence note | Evidence exposes passwords, OTPs, service-role keys, CCCD, bank accounts, raw student identity data, raw payment data or raw vouchers |
| AUD-TRACE-05 | Workflow chain continuity | Reviewer can follow the chain from receivable/payment/reconciliation/request/disbursement/source-control action to final state | A status or money movement has no traceable upstream or downstream audit link |
| AUD-TRACE-06 | Reviewer sign-off | Audit, KHTC, PHAP_CHE and BGH sign redacted UAT evidence outside Codex/chat | PASS_LOCAL is treated as UAT acceptance |

## 8. Audit-Log Evidence Acceptance Matrix

Use this matrix after the UAT matrix, evidence queries and trace acceptance
review. It is local-only until signed audit-log UAT and owner sign-off exist.

| Case | Requirement | Minimum evidence | Stop condition |
|---|---|---|---|
| P6-03-ACCEPT-01 | Static trigger coverage and read-only audit surface | `audit:ttgdtx-audit-log` and `audit:ttgdtx-audit-trail-guard` pass; the `/audit` page reads `audit_logs` only | Any required TTGDTX write table lacks trigger coverage or the audit page can insert, update, delete or call RPC |
| P6-03-ACCEPT-02 | Required event coverage | UAT evidence includes create/update/check/approve/pay/source-control samples for AUD-01 through AUD-06 | Any required finance/control event is missing or represented only by a generic count with no sampled row |
| P6-03-ACCEPT-03 | Actor, entity, action and timestamp sufficiency | Each sampled row shows actor, `entity_type`, `entity_id`, `action` and `created_at` tied to the tested workflow step | A reviewer cannot identify who changed which record, when and for which business action |
| P6-03-ACCEPT-04 | Before/after payload and evidence reference usefulness | `old_values`, `new_values`, notes or controlled evidence reference prove the changed amount, status, approval or source-control result | Payloads are empty, too generic or cannot prove the financial/control change |
| P6-03-ACCEPT-05 | Redaction and owner sign-off | Screenshots/exports are redacted and signed by Audit, KHTC, IT_DATA, PHAP_CHE and BGH outside Codex/chat | Passwords, OTPs, service-role keys, raw student identity data, CCCD, bank accounts, raw payment data or raw vouchers appear |
| P6-03-ACCEPT-06 | Production boundary | Audit-log evidence stays advisory/read-only until signed UAT and owner GO/NO-GO exist | PASS_LOCAL is treated as audit-log UAT pass, financial traceability acceptance, owner waiver, finance approval or production GO |

Decision value: `P6_03_ACCEPT / FAIL / BLOCKED`.

P6-03 can support production readiness only when P6-03-ACCEPT-01 through
P6-03-ACCEPT-06 all pass with redacted evidence and signed owner approval.

## 9. Audit Traceability Decision Manifest

Before P6-03 audit-log evidence can support owner review, complete the
traceability decision manifest exposed on the audit page through
`data-ttgdtx-audit-trace-decision-manifest="P6-03"`. This manifest is
local-only until signed audit-log UAT and owner sign-off exist. It does not
accept UAT, approve finance, waive evidence or approve production GO.

| Case | Decision gate | Required decision | Stop condition |
|---|---|---|---|
| P6-03-DEC-01 | Static trigger and read-only surface | `audit:ttgdtx-audit-log`, `audit:ttgdtx-audit-trail-guard` and release-gate audits pass; `/audit` reads `audit_logs` only | Any required TTGDTX write table lacks trigger coverage or the audit surface can write, call RPC or approve workflow state |
| P6-03-DEC-02 | Required event sample coverage | AUD-01 through AUD-06 each have at least one sampled row for create/update/check/approve/pay/source-control events | Any event is missing, represented only by a count, or cannot be tied to a concrete UAT record |
| P6-03-DEC-03 | Actor, entity, action and time | Each sampled row identifies actor, `entity_type`, `entity_id`, `action`, `created_at` and the related business step | Reviewers cannot identify who changed which record, when and for which business action |
| P6-03-DEC-04 | Before/after and evidence usefulness | `old_values`, `new_values`, notes, `evidence_url` or controlled reference prove the changed amount, status, approval or source-control result | Payloads are empty, too generic, unredacted, or cannot prove the financial/control change |
| P6-03-DEC-05 | Workflow chain continuity | Trace rows connect upstream request/source records to downstream receivable, collection, reconciliation, payout or control state | A status, approval or money movement has no traceable upstream/downstream audit link |
| P6-03-DEC-06 | Human traceability decision | Operator, checker, owner signers, evidence IDs, sampled rows and final decision are recorded as `P6_03_TRACE_READY`, `NO_GO` or `BLOCKED` | `PASS_LOCAL` is treated as audit-log UAT pass, financial traceability acceptance, owner waiver, finance approval or production GO |

Final trace decision: `P6_03_TRACE_READY / NO_GO / BLOCKED`.

Missing trace decision ID, missing sampled row, generic payload, broken
workflow chain, unsigned owner decision or raw sensitive audit evidence keeps
P6-03 NO-GO.

## 10. Sign-Off Rule

Mark audit log completeness as `DONE` only when:

1. `npm.cmd run audit:ttgdtx-audit-log` passes.
2. `npm.cmd run audit:ttgdtx-audit-trail-guard` passes.
3. UAT confirms at least one audited event for create, update, approve and pay.
4. AUD-TRACE-01 through AUD-TRACE-06 all pass with redacted evidence.
5. P6-03-ACCEPT-01 through P6-03-ACCEPT-06 all pass with redacted evidence.
6. Audit confirms before/after evidence is sufficient for financial traceability.
7. No dashboard or AI screen creates, approves or pays money directly.
