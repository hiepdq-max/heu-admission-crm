# HEU USER 006 - One Synthetic Account UAT Design

Task ID: HEU-USER-006-ONE-SYNTHETIC-ACCOUNT-UAT-DESIGN
Date: 2026-07-14
Status: DRAFT_UAT_DESIGN
Account under test: `U012` only
Provisioning status: NOT_APPLIED
Production status: NO-GO

## Test identity

`U012` is an opaque synthetic label for a KHTC read-only operator.

```text
U012 -> ACCOUNTING_READONLY -> KHTC -> FINANCE_READONLY -> INACTIVE
```

No email, password, Auth ID, phone, bank data or real finance row is included.

## UAT cases

| Case | Action | Expected result |
|---|---|---|
| U012-01 | Open approved login origin | Login loads without secrets |
| U012-02 | Complete controlled Auth flow | Session resolves to U012 profile |
| U012-03 | Open landing page | KHTC read-only lane appears |
| U012-04 | Open `Viec cua toi` | Only assigned synthetic KHTC tasks |
| U012-05 | Open `Viec phong toi` | Only KHTC queue, if granted |
| U012-06 | Open finance desk | Read-only summary; no payment action |
| U012-07 | Request other department data | `BLOCKED` or scoped empty result |
| U012-08 | Tamper workspace query | Scope context wins; no broad fallback |
| U012-09 | Inspect browser/network output | No secret or raw restricted data |
| U012-10 | Disable/unlink account | Access is revoked or blocked |

## Acceptance and rollback

All ten cases, positive/negative scope checks, audit trace and rollback must
pass before any controlled activation. Failure keeps U012 `INACTIVE`.
Rollback is disable/unlink, session revocation if needed, and redacted evidence
only. No hard delete, migration or production action is authorized.

Next task: `HEU-USER-007-SYNTHETIC-UAT-FIXTURE-CHECKER`.
