# HEU Short Course Role Negative Access Checklist - 2026-07-03

Status: DRAFT_CONTROL
Production status: NO-GO
Decision values: SC_ROLE_NEGATIVE_ACCESS_READY / NO_GO / BLOCKED

## Purpose

This checklist prepares the TRN-08 role scope and negative-access packet for
the Short Course / Day Nghe training module.

It connects `check:heu-short-course-scope-readiness`,
`audit:heu-role-scope-uat-pack`, `HEU_PERMISSION_SCOPE_OPERATION_BREAKDOWN`,
`HEU_NEGATIVE_CONTROL_ACCOUNT_QUEUE_20260703.md`, SC-UAT-07, SC-REV-06 and
SC-SIGN-06 into one controlled evidence checklist before any real user is
allowed to rely on Short Course private attendance, policy or payment detail.

## Evidence Rows

| Evidence | Control source | Required proof | Stop condition |
|---|---|---|---|
| SC-ROLE-EVID-01 | SHORT-SCOPE-APP-GUARD | `/short-course`, `/short-course/intake`, `/short-course/workflows` and related actions prove auth, workspace and Short Course segment guards before sensitive read/write behavior | Route queries Short Course data before auth/workspace guard or relies on UI-only hiding |
| SC-ROLE-EVID-02 | SHORT-SCOPE-WORKFLOWS | Workflow requests with concrete Short Course targets carry Short Course segment scope and cannot be updated from a different workspace | Out-of-scope workspace can change workflow status or see private workflow detail |
| SC-ROLE-EVID-03 | SHORT-SCOPE-ACTOR-LINK | Actor labels for Short Course attendance, policy, invoice/payment and workflow rows resolve to active CRM profiles without exposing raw identity data | Actor is missing, inactive, broad, unidentified or stored with raw PII in Git/Codex/chat |
| SC-ROLE-EVID-04 | NEGATIVE_CONTROL_QUEUE_READY / NO_GO / BLOCKED | `REAL_OUT_OF_SCOPE_NEGATIVE_01` or owner-approved Short Course negative label receives `BLOCKED` or `EMPTY_SCOPED_STATE` for Short Course students, classes, attendance, BHXH and finance rows | Negative account sees Short Course private payment, policy, attendance or student detail |
| SC-ROLE-EVID-05 | P6_04_ACCESS_READY / NO_GO / BLOCKED | P6-04 role-scope UAT pack proves allowed DAO_TAO, CTHSSV, KHTC, HR, PHAP_CHE, IT_DATA and Audit lanes plus denied out-of-scope lane | Any role sees private Short Course data outside approved scope or can execute finance/action paths |
| SC-ROLE-EVID-06 | SC-UAT-07 / SC-REV-06 / SC-SIGN-06 | Controlled evidence ref, reviewer, owner signer and P0-17 access closure handoff exist for role/negative-access result | Signed role UAT, reviewer decision or access closure handoff is missing, unsigned or stored only in Codex/chat |

## Exit Rule

`SC_ROLE_NEGATIVE_ACCESS_READY` is allowed only when every SC-ROLE-EVID-01
through SC-ROLE-EVID-06 row has an external controlled evidence reference,
owner/reviewer label and `ALLOWED`, `BLOCKED`, `EMPTY_SCOPED_STATE`, `NO_GO` or
`BLOCKED` result as appropriate.

Any missing, unsigned, uncontrolled, `NO_GO` or `BLOCKED` row keeps TRN-08 and
the training module at `NO_GO` for real operation.

## Secret Boundary

Do not store passwords, temporary passwords, OTPs, reset links, invite links,
service-role keys, raw student identity data, phone numbers, CCCD, bank
accounts, vouchers, raw policy evidence, raw payment evidence or screenshots
with private data in Git, Codex/chat or implementation logs.

## PASS_LOCAL Boundary

Passing the local audit proves only that the role/negative-access checklist,
panel and propagation are present.

It does not create accounts, assign real users, grant access, broaden scope, accept negative-control proof, accept role UAT, accept evidence, approve access closure, approve owner GO/NO-GO or mark production GO.
