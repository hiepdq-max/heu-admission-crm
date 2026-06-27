# P2-03 Receivable UAT Runbook

## 1. Purpose

This runbook verifies that TTGDTX P2-03 creates student tuition receivables only
after contract, tuition-policy, lead-status and scope checks pass.

Production remains NO-GO until this runbook is executed with synthetic or
approved anonymized data and signed by KHTC, Audit and IT/Data.

## 2. Boundary

- P2-03 creates receivables only. It does not confirm cash collection, issue a
  final invoice, reconcile receipts, approve payment request or pay a partner.
- Do not use real student, parent, CCCD, bank-account or payment data in Codex,
  screenshots or notes.
- Do not hard-delete receivable rows as a correction path. Use status and audit
  evidence.

## 3. Preconditions

1. Use an isolated UAT/restore database.
2. Step90 and prior TTGDTX prerequisites are applied in the approved order.
3. Prepare synthetic users for ADMIN, BGH, KHTC and UAT_OUT_OF_SCOPE.
4. Prepare one eligible TTGDTX lead with active contract and READY tuition
   policy.
5. Prepare one ineligible lead for each blocker: wrong status, missing partner,
   missing major and no READY tuition policy.

## 4. Test Matrix

| Case | Action | Expected result |
|---|---|---|
| P2-03-01 | KHTC opens `/ttgdtx/receivables` in allowed scope | Candidate and receivable lists load |
| P2-03-02 | UAT_OUT_OF_SCOPE opens the same route | Route blocks or shows no out-of-scope data |
| P2-03-03 | Create receivable for eligible lead | One receivable is created and audit log records insert |
| P2-03-04 | Retry same lead, policy and term | Duplicate is blocked by active unique guard |
| P2-03-05 | Try lead with missing partner/major/status/policy | Create button is disabled or RPC rejects |
| P2-03-06 | Try direct table delete | No direct delete policy is available |
| P2-03-07 | Verify P2-03 route wording | Screen says receivable is not cash collection or payout |

## 5. Evidence Queries

Use only against UAT/test data.

```sql
select
  lead_id,
  tuition_policy_id,
  term_label,
  count(*) as active_receivable_count
from public.ttgdtx_student_receivables
where record_status = 'ACTIVE'
  and receivable_status <> 'CANCELLED'
group by lead_id, tuition_policy_id, term_label
having count(*) > 1;
```

Expected: zero rows.

```sql
select
  entity_type,
  action,
  count(*) as audit_count
from public.audit_logs
where entity_type = 'ttgdtx_student_receivables'
group by entity_type, action;
```

Expected: insert/update actions are visible after UAT actions.

## 6. Sign-Off

| Owner | Result | Evidence link | Note |
|---|---|---|---|
| KHTC | | | |
| Audit | | | |
| IT/Data | | | |
