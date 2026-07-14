# HEU MODULE 003 - CTHSSV Scoped UAT Design

Task ID: HEU-MODULE-003-CTHSSV-SCOPED-UAT
Date: 2026-07-14
Status: DRAFT_UAT_DESIGN
Production status: NO-GO

## Scope

This pack covers only synthetic CTHSSV status confirmation. It does not expose
raw student data, change official academic status, create finance facts, send
notifications or approve a production record.

## Test fixture

```text
account=U015
department=CTHSSV
role=CTHSSV_OPERATOR
workspace=cthssv-pilot
record=HSSV-SYNTH-001
```

## UAT matrix

| Case | Action | Expected result |
|---|---|---|
| CTHSSV-UAT-01 | Open CTHSSV workspace | Only cthssv-pilot context appears |
| CTHSSV-UAT-02 | View synthetic record | HSSV-SYNTH-001 is visible in scope |
| CTHSSV-UAT-03 | Create confirmation draft | Draft requires source and evidence metadata |
| CTHSSV-UAT-04 | Open `Viec cua toi` | Only assigned CTHSSV tasks appear |
| CTHSSV-UAT-05 | Request Tuyển sinh/KHTC records | Denied or scoped empty result |
| CTHSSV-UAT-06 | Tamper department/workspace query | Context prevents scope widening |
| CTHSSV-UAT-07 | Attempt official status bypass | Confirmation gate blocks it |
| CTHSSV-UAT-08 | Inspect trace and rollback | No raw PII; draft is reversible/audited |

## Acceptance gate

All eight cases require controlled evidence. CTHSSV owner reviews workflow,
IT_DATA reviews scope, Audit reviews trace/redaction, and Owner approves the
result. A static checker does not mark UAT PASS.

## Stop and rollback

On a scope leak, raw data exposure, missing provenance or status bypass, stop
the test, keep U015 `INACTIVE`, revoke/disable the pilot identity if needed and
record a redacted blocker. Never widen permissions to repair a failed case.

Next task after acceptance: `HEU-MODULE-004-KHTC-READONLY-SCOPED-UAT`.
