# TTGDTX 9+ Pilot Production Checklist

## 1. Purpose

This checklist controls production readiness for the TTGDTX 9+ accounting
pilot. It is a Go/No-Go control document, not an approval by itself.

## 2. Scope

Date: 2026-06-22  
Scope: TTGDTX 9+ linked-training accounting flow, end to end<br>
Production use: NOT APPROVED

## 3. Status Values

- NOT_STARTED
- IN_PROGRESS
- DONE
- BLOCKED
- WAIVED_BY_AUTHORITY

## 4. Approval Rule

If any P0 control is not DONE or WAIVED_BY_AUTHORITY, the final conclusion is
NO-GO.

AI may suggest, warn or summarize. AI must not approve production readiness,
approve finance actions, pay partners, recognize revenue, or replace human
approval.

## 5. Production Checklist

| Control item | Owner | Status | Evidence required | Approval required | Risk if skipped |
|---|---|---|---|---|---|
| Freeze TTGDTX 9+ pilot scope | BGH + IT_DATA | DONE | Tech Decision 001 | YES | Scope creep and uncontrolled delivery |
| Align TTGDTX linked operating spine | BGH + KHTC + PHAP_CHE + IT_DATA | IN_PROGRESS | `docs/TTGDTX_LINKED_OPERATING_REVIEW_20260625.md` | YES | Screens are built as isolated features instead of one controlled linked-training chain |
| TTGDTX operating control matrix | BGH + KHTC + PHAP_CHE + IT_DATA | IN_PROGRESS | `docs/TTGDTX_OPERATING_CONTROL_MATRIX_20260625.md`; owners, blocking gates and next actions reflected in UI/UAT | YES | Workflow has pages but no enforceable control path |
| User-friendly TTGDTX process labels | IT_DATA + KHTC | IN_PROGRESS | `docs/TTGDTX_PROCESS_CODE_MAP_20260625.md`; screens show business name first and P2 code second | NO | Users cannot find the right workflow because technical P2 codes hide the business meaning |
| Keep safety branch for hardening | IT_DATA | DONE | Branch `hardening/ttgdtx-9plus-pilot` | NO | Pilot changes mix with unstable main work |
| Review dirty Git state | IT_DATA | IN_PROGRESS | GIT_CLEANUP_ANALYSIS.md | YES | Wrong files or temporary SQL committed |
| Exclude runtime logs from commit | IT_DATA | PASS_LOCAL | `.gitignore` covers `.log`, `dev-server*.log`, `next-dev*.log`, `.env`, `.env.local`, `.env.*.local`; `git ls-files -o --exclude-standard` currently empty | NO | Logs or local noise committed |
| Supabase backup before production migration | IT_DATA | NOT_STARTED | Backup ID, timestamp, restore note | YES | Cannot recover after failed migration |
| Approve Step90-Step110 migration order | IT_DATA + KHTC + PHAP_CHE | IN_PROGRESS | `docs/MIGRATION_ORDER_AUDIT.md` signed off | YES | Wrong order can damage finance data |
| P2-01 TTGDTX contract active | PHAP_CHE + BGH | DONE | Contract row, status, scope, effective date | YES | Finance action without effective contract |
| P2-02 tuition policy ready | KHTC | DONE | Tuition policy READY for TTGDTX/major/year | YES | Wrong tuition receivable |
| Real-data fit and redaction review | KHTC + PHAP_CHE + IT_DATA | PASS_LOCAL | `docs/TTGDTX_PHU_XUYEN_REAL_DATA_FIT_NOTE_20260625.md`; `docs/TTGDTX_SYNTHETIC_REAL_LIKE_UAT_PACK_20260627.md`; `docs/TTGDTX_BANK_RECEIPT_BATCH_POLICY_20260627.md`; `fixtures/ttgdtx/synthetic_real_like_uat_pack_20260627.json`; `npm.cmd run audit:ttgdtx-synthetic-uat-pack`; signed UAT still required | YES | Design passes sample data but fails real workbook/PDF/appendix structure |
| Account-control workflow for phong toa/giai toa | KHTC + CTHSSV + IT_DATA | IN_PROGRESS | `docs/TTGDTX_ACCOUNT_FREEZE_RELEASE_ACCEPTANCE_NOTE_20260625.md`; workflow/UAT evidence before real operation | YES | Bank/account control happens outside the system without communication, approval or audit trail |
| BBNT evidence gate before partner payment | KHTC + PHAP_CHE + BGH | IN_PROGRESS | Step105 P2-15 and Step107 P2-17 block on P2-19 BBNT/partner-invoice checks; still needs BBNT evidence link, accepted-period summary, partner invoice evidence and signed UAT | YES | Partner payment is requested or paid without nghiệm thu basis |
| Collateral giai-chap separation | PHAP_CHE + KHTC + BGH | IN_PROGRESS | Restricted legal-finance register or written scope decision | YES | Collateral release is confused with tuition-account release or exposed to wrong roles |
| P0-19 legal/finance gate ready | PHAP_CHE + KHTC | IN_PROGRESS | Legal and tuition gate evidence | YES | Receivable created without enough legal/finance basis |
| P2-05 gate shows only eligible leads | TUYEN_SINH + KHTC | DONE | Screenshot/gate counts and pass/fail reasons | NO | Receivable created for ineligible lead |
| P2-03 receivable creation | KHTC | DONE | Receivable ID, student, amount, due date, audit log | YES | Missing or duplicate receivable |
| Thu học phí (P2-10) | KHTC | DONE | Receipt/voucher number, amount, date, evidence link | YES | Duplicate receipt or wrong amount |
| Hóa đơn/chứng từ khi thu học phí (P2-10) | KHTC + PHAP_CHE | IN_PROGRESS | Policy matrix for collection model, payer type, invoice_required, issuer, invoice_status, invoice number/date/evidence or authorized waiver | YES | Tuition is collected without required invoice/chung-tu, or invoice is issued by the wrong party/time |
| Money input format | IT_DATA + KHTC | PASS_LOCAL | `npm.cmd run audit:vnd-money-format`; P2-10 and P2-17 share `lib/vnd-money.ts`; accept `1000000`, `1 000 000`, `1.000.000`; display `1.000.000 đ` | NO | User enters wrong money amount |
| P2-13 reconciliation batch | KHTC | DONE | Batch ID, receipt list, period, partner | YES | Receipt omitted or placed in multiple periods |
| P2-14 review/approve/lock batch | KHTC + BGH | DONE | Locked batch status and approval log | YES | Payment requested from unlocked period |
| P2-15 payment request created | KHTC | DONE | Payment request ID, amount, batch, creator, required evidence link | YES | Missing payment request evidence |
| P2-15 note/evidence completeness | KHTC | IN_PROGRESS | Required BBNT/partner-invoice dossier link, note corrected or waiver recorded | YES | Weak audit basis for payment request |
| P2-16 check/approve payment request | KHTC + BGH | DONE | Checked/approved status, approver note | YES | Payment without review/approval |
| P2-17 execute payout once | KHTC | IN_PROGRESS | Payout voucher, required evidence link, paid status, RPC-only write path, normalized voucher guard, P2-19 blocker and duplicate-click UAT in `docs/P2_17_DUPLICATE_PAYOUT_UAT_RUNBOOK.md` | YES | Duplicate partner payout or payout without complete dossier |
| P2-18 accounting dashboard | IT_DATA + KHTC | IN_PROGRESS | `npm.cmd run audit:ttgdtx-dashboard-access` passes; dashboard route, control board, no-write behavior, role scope and UAT in `docs/P2_18_ACCOUNTING_DASHBOARD_UAT_RUNBOOK.md` still require signed UAT evidence | YES | BGH/KHTC see wrong or incomplete finance data |
| Permission by role and workspace | IT_DATA + TRUONG_PHONG | IN_PROGRESS | `npm.cmd run audit:permission-soft-revoke`, `npm.cmd run audit:ttgdtx-role-scope-access` and `npm.cmd run audit:ttgdtx-data-fetch-gate` pass; Step109 UAT; `docs/TTGDTX_ROLE_SCOPE_UAT_RUNBOOK.md`; test ADMIN, BGH, KHTC, TUYEN_SINH, PHAP_CHE, out-of-scope staff | YES | User sees or edits data outside scope |
| Audit log completeness | IT_DATA + AUDIT | IN_PROGRESS | `npm.cmd run audit:ttgdtx-audit-log` passes; UAT in `docs/TTGDTX_AUDIT_LOG_UAT_RUNBOOK.md`; logs for create/update/check/approve/pay | YES | Cannot trace who changed finance state |
| Hard delete review | IT_DATA + AUDIT | IN_PROGRESS | `docs/HARD_DELETE_AUDIT.md` reviewed; `npm.cmd run audit:hard-delete` and `npm.cmd run audit:ttgdtx-cascade` pass; non-TTGDTX cascade review remains | YES | Loss of evidence, history or legal record |
| Error routing P2-07/P2-08 | KHTC + IT_DATA + AUDIT | DONE | Issue routing/resolution records | NO | Import errors do not reach the right owner |
| No AI approval | BGH + IT_DATA | IN_PROGRESS | AI policy shows AI only warns/suggests | YES | AI self-approves finance or go-live |
| Rollback plan | IT_DATA | IN_PROGRESS | `docs/STEP90_STEP109_BACKUP_ROLLBACK_DRY_RUN_RUNBOOK.md`; restore procedure; tested dry-run; `npm.cmd run audit:ttgdtx-release-gates` | YES | Cannot recover after production migration failure |
| Internal UAT sign-off | BGH + KHTC + PHAP_CHE + IT_DATA | IN_PROGRESS | `docs/TTGDTX_UAT_EXECUTION_LOG_20260625.md` records preflight/build and unauthenticated browser smoke pass; `docs/TTGDTX_SYNTHETIC_UAT_ACCOUNT_SETUP.md` defines synthetic account setup; `docs/TTGDTX_BROWSER_UAT_MATRIX_20260625.md` defines the route/account matrix; signed multi-account UAT still required | YES | Real pilot starts before enough testing |

## 6. P0 Go/No-Go Controls

P0 controls include backup, migration order, permission, audit, hard-delete,
rollback, P2-17 payout, P2-18 dashboard and final UAT sign-off.

## 7. Evidence Required

Each control must have verifiable evidence in a linked document, screenshot,
database record, approval note or audit log before it can be marked DONE.

## 8. Final Approval

Final approval must come from BGH and the responsible owner departments listed
in the checklist. Codex/AI output is advisory only.

## 9. Current Conclusion

Current recommendation: NO-GO for production.

Internal pilot can continue only inside controlled test scope. Before
production, the highest priority blockers are:

1. Execute `docs/P2_18_ACCOUNTING_DASHBOARD_UAT_RUNBOOK.md` and verify P2-18 dashboard.
2. Close remaining hard-delete/cascade findings or obtain written waiver.
3. Execute `docs/P2_17_DUPLICATE_PAYOUT_UAT_RUNBOOK.md` and confirm P2-17 cannot pay twice.
4. Finalize Step90-Step110 migration order and backup/rollback dry-run evidence.
5. Execute anonymized Phu-Xuyen-like UAT cases from `fixtures/ttgdtx/synthetic_real_like_uat_pack_20260627.json` and attach signed evidence.
6. Implement or explicitly defer the account-control workflow from `docs/TTGDTX_ACCOUNT_FREEZE_RELEASE_ACCEPTANCE_NOTE_20260625.md`.
7. Reflect `docs/TTGDTX_OPERATING_CONTROL_MATRIX_20260625.md` in UI helper text and gate logic.
8. Finish user-friendly labels/search for process names using `docs/TTGDTX_PROCESS_CODE_MAP_20260625.md`.
9. Keep `npm.cmd run audit:vnd-money-format` green when adding new finance forms; partner invoice gate is added to P2-15/P2-17 and still needs signed UAT proof.
10. BBNT evidence gate is added to P2-15/P2-17 and still needs signed UAT proof.
11. Complete role/workspace permission tests.
