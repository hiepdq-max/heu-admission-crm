# HEU MODULE 001 - Controlled Operational Module Order

Task ID: HEU-MODULE-001-CONTROLLED-OPERATION-ORDER
Date: 2026-07-14
Status: DRAFT_CONTROL
Production status: NO-GO

## Operating rule

HEU opens one module lane at a time. A lane must have an owner, role/scope
mapping, metadata confirmation tasks, read/write boundary, audit trace and
rollback before the next lane starts. No module may bypass workspace scope.

## Order

| Order | Module | First usable slice | Initial boundary | Exit gate |
|---|---|---|---|---|
| 1 | TUYEN_SINH | lead -> tư vấn -> hồ sơ draft | scoped draft/read-only | owner UAT + negative scope |
| 2 | CTHSSV | hồ sơ status confirmation | scoped confirmation only | owner UAT + audit trace |
| 3 | KHTC | công nợ/học phí summary | read-only, no payment | finance owner + reconciliation evidence |
| 4 | DAO_TAO/KHOA | lớp/ngành/danh sách confirmation | read-only/confirmation | training owner + scope UAT |

BGH dashboard remains read-only and consumes only confirmed source metadata.
Finance/HOU payment, COM and production mutation remain closed until their
legal, reconciliation and owner gates are separately complete.

## Common gate per module

1. Route and role permission check.
2. Workspace/department positive and negative scope test.
3. Synthetic metadata and confirmation task check.
4. Audit trace and evidence reference check.
5. Owner review and rollback rehearsal.

If any gate fails, keep the module closed and do not widen permissions or copy
raw data to repair it. AI may check, summarize or draft only.

Next task: `HEU-MODULE-002-TUYEN-SINH-SCOPED-UAT`.
