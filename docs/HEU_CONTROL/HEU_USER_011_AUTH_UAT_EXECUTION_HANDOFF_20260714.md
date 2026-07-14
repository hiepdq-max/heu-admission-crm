# HEU USER 011 - Controlled Authenticated UAT Handoff

Task ID: HEU-USER-011-OWNER-CONTROLLED-U012-AUTH-UAT
Date: 2026-07-14
Status: WAITING_OWNER_CONTROLLED_AUTH
Account under test: `U012`
Current state: `INACTIVE`
Production status: `NO-GO`

## Purpose

This run-sheet is the execution handoff for one synthetic authenticated user.
It does not create an account, send email, set a password, change a profile,
run SQL, run migration or activate a user.

## Entry gate

The operator may start only after the controlled evidence record confirms:

- isolated pilot origin and approved redirect allowlist;
- IT_DATA server-only Auth boundary and no secret in browser/chat/logs;
- Audit trace destination and rollback owner;
- U012 mapping `ACCOUNTING_READONLY -> KHTC -> FINANCE_READONLY`;
- synthetic-only rows and a non-PII evidence ID;
- U012 remains `INACTIVE` until the operator is ready to execute all cases.

## Execution record

Run all ten cases from `HEU_USER_010` in order. Record only the case code,
PASS/FAIL/NO_GO/BLOCKED, route label, scope decision, evidence ID and owner
note in the controlled ledger. Never paste credentials, invite/reset links,
Auth IDs, tokens or raw finance/student data.

| Case group | Required outcome |
|---|---|
| U012-01 to U012-03 | Login/session and KHTC read-only landing are correct |
| U012-04 to U012-06 | Task Center and finance view stay within KHTC/read-only scope |
| U012-07 to U012-08 | Cross-department and tampered-scope access is denied or narrowed |
| U012-09 | No secret or raw restricted data is exposed |
| U012-10 | Disable/unlink rollback blocks further access and leaves trace |

## Stop rules

Stop immediately and keep U012 `INACTIVE` for any scope leak, finance write
control, secret exposure, missing audit trace, unexpected email, missing
rollback or failed build/check. Do not widen permissions to repair a failed
case.

## Acceptance gate

U012 may enter a controlled pilot only when all ten cases have actual evidence,
negative-scope cases deny or return a scoped empty result, IT_DATA and Audit
review the trace, and the Owner approves the result. Until then this handoff is
`NO_GO` for activation, pilot expansion, staging and production.

Next task after acceptance: `HEU-PILOT-001-LAN-STAGING-READONLY-7-USERS`.
