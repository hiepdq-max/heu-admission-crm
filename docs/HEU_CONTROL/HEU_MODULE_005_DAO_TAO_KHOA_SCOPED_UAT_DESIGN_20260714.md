# HEU MODULE 005 - Dao Tao/Khoa Scoped UAT Design

Task ID: HEU-MODULE-005-DAO-TAO-KHOA-SCOPED-UAT
Date: 2026-07-14
Status: DRAFT_UAT_DESIGN
Production status: NO-GO

## Scope

This pack covers synthetic class, program and roster metadata confirmation. It
does not change grades, attendance, official enrollment, student identity or
finance records.

## Test fixture

```text
account=U016
department=DAO_TAO
role=TRAINING_READONLY
workspace=training-readonly
record=CLASS-SYNTH-001
```

## UAT matrix

| Case | Action | Expected result |
|---|---|---|
| DT-UAT-01 | Open training workspace | Only training-readonly context appears |
| DT-UAT-02 | View synthetic class | CLASS-SYNTH-001 is visible in scope |
| DT-UAT-03 | View program/major metadata | Only approved metadata is shown |
| DT-UAT-04 | Open `Viec cua toi` | Only assigned training tasks appear |
| DT-UAT-05 | Request CTHSSV/admission records | Denied or scoped empty result |
| DT-UAT-06 | Tamper workspace/department query | Context prevents scope widening |
| DT-UAT-07 | Attempt grade or enrollment write | Read-only gate blocks it |
| DT-UAT-08 | Inspect trace and rollback | No raw PII; confirmation is reversible |

## Acceptance gate

All eight cases require controlled evidence. Dao Tao/Khoa owners review the
metadata, IT_DATA reviews scope, Audit reviews trace/redaction and Owner
approves the result. Static checks do not accept academic UAT.

## Stop and rollback

On scope leak, grade/enrollment bypass, raw data exposure or missing trace,
stop the test, keep U016 `INACTIVE`, disable/unlink the pilot identity if
applicable and record a redacted blocker. Never widen permissions to repair a
failed case.

Next task: `HEU-STAGE-006-CROSS-MODULE-UAT-AND-ROLLBACK-DESIGN`.
