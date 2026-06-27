# TTGDTX Lead Quick-Fix UAT Runbook

Purpose: verify that the lead detail quick-fix can repair missing TTGDTX/P2-05 fields without bypassing P2-01, P2-02, P0-19, P2-05 or P2-03 controls.

Production boundary:

- The quick-fix edits lead metadata only: status, TTGDTX partner, program, major and optional offering.
- It does not create receivables, collect tuition, issue invoices, reconcile money or approve payouts.
- The quick-fix cannot self-promote a lead to `ELIGIBLE` or `ENROLLED`.
- It can only move to `DOCUMENT_SUBMITTED` when at least one lead document exists.
- P2-03 still decides whether a receivable can be created.

## Required Controls

| Control | Expected behavior |
|---|---|
| Segment | Form appears only for `TC9_TTGDTX_LINKED` leads |
| Permission | Server action calls `can_write_admission_workspace_lead` for selected segment/partner |
| Partner | Selected partner must be active and `partner_type = TTGDTX` |
| Dropdown | Selected TTGDTX must exist in P2-12 `ttgdtx_center_dropdown_options` |
| Program/major | Selected program, major and offering must come from allowed segment catalog |
| Status | Cannot self-promote to `ELIGIBLE` or `ENROLLED` |
| Document | Cannot set `DOCUMENT_SUBMITTED` when no lead document exists |
| Audit | Writes `P2_05_TTGDTX_QUICK_FIX` lead activity |
| Revalidation | Revalidates lead, P2-05 gate, P2-03 receivables, P2-04 simulation and P2-12 master |

## UAT Cases

1. Open a TTGDTX-linked lead missing partner/program/major.
2. Confirm the quick-fix block appears on lead detail.
3. Try selecting a partner outside user scope; expect server-side block.
4. Try selecting a non-TTGDTX partner; expect validation block.
5. Try selecting a TTGDTX not in P2-12 dropdown; expect validation block.
6. Try selecting a major outside the selected program; expect validation block.
7. Try changing status to `ELIGIBLE` or `ENROLLED`; expect validation block unless it was already the current status.
8. Try changing to `DOCUMENT_SUBMITTED` with no documents; expect metadata saved but status not promoted.
9. Save valid TTGDTX, program and major; expect lead activity audit and P2-05/P2-03 pages to reflect the change after refresh.

## Local Static Checks

Run before commit or release packaging:

```powershell
npm.cmd run audit:ttgdtx-lead-quick-fix-safety
npm.cmd run audit:hard-delete
npm.cmd run audit:ttgdtx-role-scope-access
npm.cmd run audit:ttgdtx-release-gates
```

Expected result: all checks pass and no hard delete is introduced in lead quick-fix files.
