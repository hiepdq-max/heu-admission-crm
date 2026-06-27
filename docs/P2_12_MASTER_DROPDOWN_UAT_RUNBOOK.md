# P2-12 TTGDTX Master Dropdown UAT Runbook

Purpose: verify that TTGDTX centers are selected from controlled master data instead of free-text names before any finance workflow uses them.

Production boundary:

- `database/step99_ttgdtx_master_dropdown_p2_12.sql` is a migration candidate only.
- Do not run from Codex/chat into production.
- Production use requires backup evidence, restore dry-run, approved migration order, signed UAT and business Go/No-Go.
- P2-12 does not create receivables, collect tuition, issue invoices, reconcile money or approve partner payouts.

## Data Rule

Use master metadata only:

- OK: center code, center display name, source document id/status, contract readiness, tuition policy readiness, selection status.
- Not OK: raw student identity, private phone lists, bank details, contract body pasted into repo/chat, account credentials.
- A Phu-Xuyen-like center can be used as a reference case only. The master/dropdown design must work for many TTGDTX centers.

## Role/Scope Matrix

| Case | User setup | Expected result |
|---|---|---|
| Admin | ADMIN role | Can read and manage master rows in approved environment |
| BGH | BGH role | Can read master readiness for governance review |
| IT/Data manager | `ttgdtx.master.manage` plus TTGDTX segment/partner scope | Can insert/update center master rows |
| Legal/KHTC/Tuyen sinh reader | `ttgdtx.master.read` plus matching segment/partner scope | Can read dropdown/readiness only |
| Has permission, no scope | Master permission but no matching business scope | Blocked |
| Has scope, no permission | Matching scope but no master permission | Blocked |
| Unauthenticated | No login | Redirect to login |

## Functional Checks

1. Open `/ttgdtx/master` as an authorized reader.
2. Confirm the summary separates total centers, selectable centers, production-ready centers, pilot-temp centers and rows needing action.
3. Confirm `TEMP_ENABLED` rows are labeled as pilot only and are not treated as production approved.
4. Confirm `ENABLED` production rows require `master_status = APPROVED`.
5. Confirm approved rows require either an approved document URL or a P2-11 source document reference.
6. Confirm a center missing P2-01 contract or P2-02 tuition policy is still visible but shows blocking/readiness items.
7. Confirm dropdown options only include `ENABLED` or `TEMP_ENABLED`, not `DISABLED`, `SUSPENDED` or expired rows.
8. Confirm the page does not provide actions to create receivables, collect tuition, reconcile, approve payment requests or record payouts.

## Data Integrity Checks

Run local static checks:

```powershell
npm.cmd run audit:ttgdtx-role-scope-access
npm.cmd run audit:ttgdtx-cascade
npm.cmd run audit:ttgdtx-audit-log
npm.cmd run audit:hard-delete
```

Expected controls:

- Master read access requires both master permission and business scope, except approved admin/BGH governance bypass.
- Master insert/update policies require manage permission and business scope.
- There is no direct delete RLS policy for `ttgdtx_center_master`.
- `source_document_id` references are restrict-protected, so deleting a P2-11 source cannot silently detach master evidence.
- TTGDTX master rows keep audit triggers.

## Sign-Off Evidence

Before production, attach these items to the release ticket:

- Screenshot/export of P2-12 summary and dropdown options.
- List of centers still `TEMP_ENABLED`, `IN_REVIEW`, `NEEDS_FIX`, `DISABLED`, `SUSPENDED` or expired.
- Source evidence decision for each production `ENABLED` center.
- Approval from IT/Data, Tuyen Sinh, Legal/Phap Che, KHTC, Audit and BGH for the exact migration batch.
