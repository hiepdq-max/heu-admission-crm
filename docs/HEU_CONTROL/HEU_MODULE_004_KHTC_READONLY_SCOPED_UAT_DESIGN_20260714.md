# HEU MODULE 004 - KHTC Read-only Scoped UAT Design

Task ID: HEU-MODULE-004-KHTC-READONLY-SCOPED-UAT
Date: 2026-07-14
Status: DRAFT_UAT_DESIGN
Production status: NO-GO

## Scope

This pack covers only a synthetic finance summary and confirmation queue. It
does not create receivables, post payments, issue invoices, calculate COM,
change a period lock or recognize revenue.

## Test fixture

```text
account=U012
department=KHTC
role=FINANCE_READONLY
workspace=finance-readonly
record=FIN-SYNTH-001
```

## UAT matrix

| Case | Action | Expected result |
|---|---|---|
| KHTC-UAT-01 | Open finance workspace | Only finance-readonly context appears |
| KHTC-UAT-02 | View synthetic summary | FIN-SYNTH-001 is visible as read-only |
| KHTC-UAT-03 | Open confirmation queue | Source/evidence metadata is visible |
| KHTC-UAT-04 | Open `Viec cua toi` | Only assigned KHTC tasks appear |
| KHTC-UAT-05 | Request admission/CTHSSV records | Denied or scoped empty result |
| KHTC-UAT-06 | Tamper workspace/department query | Context prevents scope widening |
| KHTC-UAT-07 | Attempt payment or invoice action | Finance write gate blocks it |
| KHTC-UAT-08 | Inspect trace and rollback | No bank/PII data; read-only trace remains |

## Acceptance gate

All eight cases require controlled evidence. KHTC owner reviews the summary,
IT_DATA reviews scope, Audit reviews trace/redaction and Owner approves the
result. Static checks do not accept finance UAT or accounting reliance.

## Stop and rollback

On any write control bypass, scope leak, raw bank data exposure, duplicate
payment risk or missing trace, stop immediately, keep U012 `INACTIVE`, disable
or unlink the pilot identity if applicable and record a redacted blocker. No
permission widening is allowed as a repair.

Next task after acceptance: `HEU-MODULE-005-DAO-TAO-KHOA-SCOPED-UAT`.
