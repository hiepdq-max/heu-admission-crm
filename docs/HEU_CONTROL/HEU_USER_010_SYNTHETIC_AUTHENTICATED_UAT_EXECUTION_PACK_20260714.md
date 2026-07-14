# HEU USER 010 - Synthetic Authenticated UAT Execution Pack

Task ID: HEU-USER-010-SYNTHETIC-AUTHENTICATED-UAT
Date: 2026-07-14
Status: AUTH_REQUIRED
Account under test: `U012`
Provisioning status: NOT_APPLIED
Production status: NO-GO

## 1. Purpose

This pack is the controlled handoff from static UAT design to one authenticated
browser test. It does not create an account, send an invite, set a password,
change a profile, grant a role, change scope, run SQL or accept UAT evidence.

The operator must use an isolated test origin and an owner-approved Auth
session. Passwords, recovery links, tokens, Auth IDs and raw personal data must
remain outside Codex, Git and this pack.

## 2. Required Preconditions

All items below must be recorded outside this pack before execution:

- Owner-approved Auth project and redirect origin.
- IT_DATA confirmation of server-only secret boundary.
- Audit confirmation of the event/audit trace path.
- U012 mapping: `ACCOUNTING_READONLY -> KHTC -> FINANCE_READONLY`.
- U012 remains `INACTIVE` until all cases and rollback are complete.
- Controlled evidence ID with no email, password, token or PII.
- Synthetic task rows only; no real student, bank or payment payload.

If any precondition is missing, result is `AUTH_REQUIRED` and execution stops.

## 3. Execution Matrix

| Case | Route/action | Expected result | Result | Evidence | Owner note |
|---|---|---|---|---|---|
| U012-01 | Open approved login origin | Login loads; no secret appears | `NOT_RUN` | `TBD` | `TBD` |
| U012-02 | Complete approved invite/recovery | Session resolves to U012 profile | `NOT_RUN` | `TBD` | `TBD` |
| U012-03 | Open landing page | KHTC read-only lane appears | `NOT_RUN` | `TBD` | `TBD` |
| U012-04 | Open `Viec cua toi` | Only assigned KHTC tasks appear | `NOT_RUN` | `TBD` | `TBD` |
| U012-05 | Open `Viec phong toi` | Only KHTC queue appears | `NOT_RUN` | `TBD` | `TBD` |
| U012-06 | Open finance desk | Read-only summary; no payment action | `NOT_RUN` | `TBD` | `TBD` |
| U012-07 | Request TUYEN_SINH/CTHSSV data | `BLOCKED` or scoped empty state | `NOT_RUN` | `TBD` | `TBD` |
| U012-08 | Tamper department/workspace query | Scope narrows or blocks request | `NOT_RUN` | `TBD` | `TBD` |
| U012-09 | Inspect visible/network output | No secret or raw restricted payload | `NOT_RUN` | `TBD` | `TBD` |
| U012-10 | Disable/unlink test access | Session/access is revoked; audit remains | `NOT_RUN` | `TBD` | `TBD` |

## 4. Stop Rules

Stop immediately and keep U012 `INACTIVE` if:

- a route exposes another department's data;
- a query parameter widens the workspace or department scope;
- a finance action is writable;
- a password, token, invite/recovery URL or raw restricted payload appears;
- an audit trace is missing;
- rollback cannot disable or unlink the test access.

Do not repair a failure by granting broader permission. Record the case as
`FAIL`, `NO_GO` or `BLOCKED` and return to IT_DATA/Audit.

## 5. Acceptance And Rollback

U012 may move out of `INACTIVE` only after all ten cases have actual results,
negative-scope cases deny or return an appropriately scoped empty state, and
IT_DATA, Audit and the Owner review the controlled evidence outside
Codex/Git/chat.

Rollback is disable/unlink U012, revoke the session if needed, preserve only
redacted evidence and leave the account `INACTIVE`. No hard delete is allowed.

## 6. Current Decision

`AUTH_REQUIRED`: the static application/checker work is ready, but no approved
authenticated session or live UAT result is present. This pack authorizes no
provisioning, activation, migration, deployment, evidence acceptance, owner
GO/NO-GO or production use.

Next task: execute this pack through the owner-controlled test channel.
