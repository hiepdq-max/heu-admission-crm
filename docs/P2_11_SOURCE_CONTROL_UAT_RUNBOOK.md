# P2-11 TTGDTX Source Control UAT Runbook

Purpose: verify that TTGDTX source/legal/evidence control is usable before production without exposing raw sensitive data or changing finance records.

Production boundary:

- `database/step98_ttgdtx_source_control_p2_11.sql` is a migration candidate only.
- Do not run from Codex/chat into production.
- Production use requires backup evidence, restore dry-run, approved migration order, signed UAT and business Go/No-Go.
- P2-11 does not create receivables, collect tuition, issue invoices, reconcile money or approve partner payouts.

## Test Data Rule

Use anonymized or metadata-only evidence:

- OK: file title, owner department, version label, document type, source status, checklist status.
- Not OK: raw student identity, phone, bank account, bank statement details, password, invoice credential, private contract content pasted into chat/repo.
- Phu-Xuyen-like material may be used as a reference scenario only. Product logic must remain generic for many TTGDTX centers.

## Role/Scope Matrix

| Case | User setup | Expected result |
|---|---|---|
| Admin | ADMIN role | Can read source board and manage records in approved environment |
| BGH | BGH role | Can read source board across authorized business scope |
| IT/Data manager | `ttgdtx.source.manage` plus TTGDTX segment scope | Can insert/update source/check records |
| Audit/Legal/KHTC reader | `ttgdtx.source.read` plus TTGDTX segment scope | Can read only |
| Has permission, no scope | Source permission but no TTGDTX business scope | Blocked |
| Has scope, no permission | TTGDTX segment scope but no source permission | Blocked |
| Unauthenticated | No login | Redirect to login |

## Functional Checks

1. Open `/ttgdtx/source-control` as an authorized reader.
2. Confirm summary cards show source count, pending source count, local path count and failed checklist count.
3. Confirm control board shows each related step separately: P0-19, P2-01, P2-02, P2-03, P2-10, P2-11.
4. Confirm local `D:\` or `G:\` paths are flagged as needing production links.
5. Confirm missing checker/approver or non-approved required source remains pending.
6. Confirm checklist `FAIL`/`CRITICAL` blocks production readiness.
7. Confirm P2-19 evidence metadata is visible only as metadata; no raw file content is required.
8. Confirm source-control screens do not provide actions to create receivables, collect tuition, reconcile, approve payment requests or record payouts.

## Data Integrity Checks

Run local static checks:

```powershell
npm.cmd run audit:ttgdtx-role-scope-access
npm.cmd run audit:ttgdtx-cascade
npm.cmd run audit:ttgdtx-audit-log
npm.cmd run audit:hard-delete
```

Expected controls:

- Source/check write policies require both manage permission and business scope.
- There is no direct delete RLS policy for source/check records.
- `source_document_id` references are restrict-protected, so deleting a document cannot silently detach checklist evidence.
- TTGDTX write tables keep audit triggers.

## Sign-Off Evidence

Before production, attach these items to the release ticket:

- Screenshot or export of P2-11 summary after UAT.
- List of unresolved `FAIL`, `CRITICAL`, `WARNING` and local path findings.
- Business decision for each unresolved item: fix before production, waive with reason, or keep No-Go.
- Approval from IT/Data, KHTC, Legal/Phap Che, Audit and BGH for the exact migration batch.
