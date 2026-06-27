# P2-13 Reconciliation Repair Safety UAT Runbook

Purpose: ensure old P2-13 repair scripts cannot overwrite the current reconciliation logic or remove invoice/receipt controls.

Production boundary:

- `database/step102_fix_p2_13_partner_status.sql` is retired and no-op.
- `database/step103_fix_p2_13_reconciliation_line_columns.sql` is retired and no-op.
- Step102 and Step103 are retired; do not use them as current P2-13 fixes.
- Current P2-13 logic is controlled by `database/step101_ttgdtx_reconciliation_p2_13.sql` and P2-14 by `database/step104_ttgdtx_reconciliation_approval_p2_14.sql`.
- Do not run production migration from Codex/chat.

## Risk Being Controlled

Old repair scripts were created while P2-13 table/function columns were still changing. If an old repair is run after Step101, it can overwrite `create_ttgdtx_reconciliation_batch` and lose invoice-control columns. That would make P2-14 see unresolved invoice lines incorrectly and can block or distort payment-request preparation.

## Expected Behavior

| Case | Expected result |
|---|---|
| Open Step102 | File clearly states retired/no-op and only raises a notice |
| Open Step103 | File clearly states retired/no-op and only raises a notice |
| Search Step102/Step103 | No `create or replace function`, `update public`, `insert into public`, `alter table`, hard delete or truncate |
| Inspect Step101 | `create_ttgdtx_reconciliation_batch` includes invoice/receipt columns |
| Inspect candidates | Unresolved invoice/receipt decisions remain blocked before reconciliation |

## Local Static Checks

Run before commit or release packaging:

```powershell
npm.cmd run audit:ttgdtx-reconciliation-repair-safety
npm.cmd run audit:ttgdtx-release-gates
npm.cmd run audit:ttgdtx-step110-safety
npm.cmd run audit:ttgdtx-uat-readiness
```

Expected controls:

- Step102 and Step103 remain retired/no-op files.
- Step101 remains the source of truth for P2-13 batch creation.
- P2-13 cannot pull P2-10 payments while invoice/receipt decision is unresolved.
- P2-14 continues to block approve/lock when unresolved invoice lines exist.

## Sign-Off Evidence

Before production release, attach:

- Static audit output for reconciliation repair safety.
- P2-13 UAT evidence showing unresolved invoice/receipt decisions are blocked.
- P2-14 UAT evidence showing unresolved lines block review/approve/lock.
- Human approval from KHTC, Audit and BGH for the reconciliation/payment path.
