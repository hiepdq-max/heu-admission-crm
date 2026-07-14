# HEU MODULE 002 - Tuyển sinh Scoped UAT Design

Task ID: HEU-MODULE-002-TUYEN-SINH-SCOPED-UAT
Date: 2026-07-14
Status: DRAFT_UAT_DESIGN
Production status: NO-GO

## Scope

This pack covers only the synthetic admission pilot path: lead, consultation,
draft dossier and controlled handover. It does not approve enrollment, create a
receivable, collect tuition, calculate COM, send email or use raw student data.

## Test fixture

```text
account=U014
department=TUYEN_SINH
role=ADMISSION_OPERATOR
workspace=admission-pilot
record=LEAD-SYNTH-001
```

## UAT matrix

| Case | Action | Expected result |
|---|---|---|
| TS-UAT-01 | Open admission workspace | Only admission-pilot context appears |
| TS-UAT-02 | View synthetic lead | LEAD-SYNTH-001 is visible in scope |
| TS-UAT-03 | Move lead to consultation draft | Draft status only; audit reference required |
| TS-UAT-04 | Open `Viec cua toi` | Only assigned admission tasks appear |
| TS-UAT-05 | Request KHTC/CTHSSV records | Denied or scoped empty result |
| TS-UAT-06 | Tamper segment/workspace query | Workspace context prevents widening |
| TS-UAT-07 | Attempt finance action | Finance gate blocks the action |
| TS-UAT-08 | Inspect output and rollback | No raw PII; draft is reversible/audited |

## Acceptance gate

All eight cases require actual controlled evidence before the account can enter
the admission pilot. IT_DATA reviews scope, Tuyển sinh reviews workflow, Audit
reviews trace/redaction, and Owner approves the result. Static checkers only
prove that this pack is structured; they do not mark UAT PASS.

## Rollback and stop rules

On scope leak, finance bypass, raw data exposure or missing trace, stop the
test, keep U014 `INACTIVE`, disable/unlink the pilot identity if applicable and
record a redacted blocker. Never widen role permissions to repair a failed
case.

Next task after acceptance: `HEU-MODULE-003-CTHSSV-SCOPED-UAT`.
