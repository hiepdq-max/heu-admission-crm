# HEU PILOT 001 - LAN Read-only Pilot for Seven Synthetic Users

Task ID: HEU-PILOT-001-LAN-STAGING-READONLY-7-USERS
Date: 2026-07-14
Status: NOT_READY_AUTH_GATE
Environment: isolated LAN staging only
Production status: NO-GO

## Boundary

This is a controlled pilot plan using opaque labels only. It authorizes no
account creation, email, password, migration, payment, approval, AI mutation or
production deployment. All pilot rows are synthetic or approved metadata.

## Pilot matrix

| Label | Department | Role | Workspace/scope | Write authority |
|---|---|---|---|---|
| U012 | KHTC | FINANCE_READONLY | finance-readonly | none |
| U013 | TCHC | HR_READONLY | tchc-readonly | none |
| U014 | TUYEN_SINH | ADMISSION_OPERATOR | admission-pilot | controlled draft only |
| U015 | CTHSSV | CTHSSV_OPERATOR | cthssv-pilot | controlled draft only |
| U016 | DAO_TAO | TRAINING_READONLY | training-readonly | none |
| U017 | BGH | EXECUTIVE_READONLY | executive-readonly | none |
| U018 | IT_DATA | IT_DATA_AUDIT | control-readonly | none |

These labels are fixtures, not real permission grants. Every account remains
`INACTIVE` until its own UAT evidence is complete.

## Entry gates

- U012 authenticated UAT is complete and accepted by IT_DATA, Audit and Owner.
- Pilot origin, LAN binding, redirect allowlist and rollback owner are recorded.
- Synthetic data is loaded without raw student, bank, phone or credential data.
- Every user has an owner, department, role, workspace and evidence ID.
- The server is started on a non-production port; production remains blocked.

## Per-user test sequence

1. Login/session resolves to the opaque profile.
2. Landing page shows only the assigned department/workspace lane.
3. `Viec cua toi` and `Viec phong toi` show only permitted synthetic tasks.
4. BGH sees hot-spots read-only; non-BGH users cannot open executive data.
5. Finance users see read-only summaries; payment and approval actions are absent.
6. A request for another department is denied or returns a scoped empty result.
7. A tampered workspace/department query cannot widen scope.
8. No secret, token or raw restricted data appears in browser or logs.
9. Disable/unlink rollback blocks access and leaves an audit trace.

## Acceptance

The pilot is accepted only when every user passes positive and negative scope
tests, evidence is redacted, IT_DATA and Audit review the trace, module owners
confirm expected behavior, and Owner/BGH approves the pilot result. A failure
keeps the affected account `INACTIVE` and stops expansion.

Next task after acceptance: `HEU-DATA-001-METADATA-FOUNDATION-IMPORT-DRY-RUN`.
