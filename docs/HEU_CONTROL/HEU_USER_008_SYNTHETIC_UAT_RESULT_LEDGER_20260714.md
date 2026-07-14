# HEU USER 008 - Synthetic UAT Result Ledger

Task ID: HEU-USER-008-SYNTHETIC-UAT-RESULT-LEDGER
Date: 2026-07-14
Account under test: `U012`
Status: NOT_RUN
Provisioning status: NOT_APPLIED
Production status: NO-GO

No email, name, password, Auth ID, token, phone, bank data or raw student/
finance data may be recorded here.

| Case | Expected result | Actual result | Scope decision | Evidence ID | Owner note |
|---|---|---|---|---|---|
| U012-01 | Login origin loads safely | `NOT_RUN` | `NOT_RUN` | `TBD` | `TBD` |
| U012-02 | Controlled session resolves | `NOT_RUN` | `NOT_RUN` | `TBD` | `TBD` |
| U012-03 | KHTC read-only landing | `NOT_RUN` | `NOT_RUN` | `TBD` | `TBD` |
| U012-04 | Assigned KHTC tasks only | `NOT_RUN` | `NOT_RUN` | `TBD` | `TBD` |
| U012-05 | KHTC department queue only | `NOT_RUN` | `NOT_RUN` | `TBD` | `TBD` |
| U012-06 | Finance summary read-only | `NOT_RUN` | `NOT_RUN` | `TBD` | `TBD` |
| U012-07 | Other departments denied/empty | `NOT_RUN` | `NOT_RUN` | `TBD` | `TBD` |
| U012-08 | Tampered scope blocked | `NOT_RUN` | `NOT_RUN` | `TBD` | `TBD` |
| U012-09 | No secret/raw restricted data | `NOT_RUN` | `NOT_RUN` | `TBD` | `TBD` |
| U012-10 | Disable/unlink blocks access | `NOT_RUN` | `NOT_RUN` | `TBD` | `TBD` |

`NOT_RUN` cannot be replaced with `PASS` from static checks. U012 must remain
`INACTIVE` until all ten cases have controlled evidence and IT_DATA, Audit and
Owner review. Rollback is disable/unlink; no account activation, migration or
production deployment is authorized.

Required reviewers: IT_DATA, Audit, KHTC owner, Owner/BGH.
