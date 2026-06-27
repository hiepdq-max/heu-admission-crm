# TTGDTX Synthetic Real-Like UAT Pack 2026-06-27

Status: DRAFT_CONTROL
Mode: UAT/staging only
Production status: NO-GO

## 1. Purpose

Use `fixtures/ttgdtx/synthetic_real_like_uat_pack_20260627.json` as the
approved synthetic source pack for Phu-Xuyen-like TTGDTX 9+ UAT design review.

The pack exists to test real operating shapes without putting real student,
parent, staff, bank, contract or partner private data into Git, Codex, logs or
browser screenshots.

## 2. What The Pack Covers

| Area | Synthetic coverage |
|---|---|
| Contract appendix | K23 appendix case with active contract and tuition policy dependency |
| Support-fee formula | K24 case using accepted student count, months and monthly support fee |
| Multi-section workbook | Policy matrix, student collection rows, class totals and collection requests |
| Student edge cases | Normal, partial collection, dropout, zero amount and total row |
| Bank receipt batch | Multiple receipt lines plus one duplicate fingerprint case |
| Invoice/chung-tu policy | Required, not required and pending policy cases |
| Account control | Tuition-account freeze, tuition-account release and separate collateral release |
| BBNT/payment evidence | BBNT gate and partner invoice gate before payment request/payout |
| Dashboard/role UAT | Synthetic totals mapped to authorized and out-of-scope checks |

## 3. How To Use

1. Keep the pack in JSON as the source of truth.
2. Run `npm.cmd run audit:ttgdtx-synthetic-uat-pack` before using or editing it.
3. Use the pack to prepare staging/UAT rows, screenshots and workbook previews.
4. Execute the related runbooks:
   - `docs/TTGDTX_BROWSER_UAT_MATRIX_20260625.md`
   - `docs/TTGDTX_ROLE_SCOPE_UAT_RUNBOOK.md`
   - `docs/P2_03_RECEIVABLE_UAT_RUNBOOK.md`
   - `docs/P2_17_DUPLICATE_PAYOUT_UAT_RUNBOOK.md`
   - `docs/P2_18_ACCOUNTING_DASHBOARD_UAT_RUNBOOK.md`
5. Store signed evidence outside Git in the approved UAT evidence location.

## 4. Safety Rules

- Do not replace synthetic names with real student or staff names.
- Do not add phone numbers, CCCD, personal addresses, passwords, OTPs, API keys,
  service-role keys or bank account numbers.
- Do not attach real bank PDFs or contract scans to the repo.
- Do not treat this pack as approval to run production migration.
- Do not use the pack to bypass P2-01, P2-02, P0-19, P2-19 or human approval
  gates.

## 5. Minimum Acceptance Before UAT Sign-Off

The pack is ready for controlled UAT only when:

1. `npm.cmd run audit:ttgdtx-synthetic-uat-pack` passes.
2. The generated staging/import preview separates workbook sections before
   posting.
3. Duplicate receipt and payout attempts are tested.
4. P2-13 blocks unresolved invoice/chung-tu decisions.
5. P2-15 and P2-17 block missing BBNT or partner invoice evidence where
   required.
6. Dashboard and route access are tested with synthetic authorized and
   out-of-scope accounts.

## 6. Current Result

This pack is PASS_LOCAL as a synthetic UAT input. It does not make the HEU web
app production-ready. Production remains NO-GO until signed UAT, backup/restore
dry-run, migration approval and business Go/No-Go are complete.
