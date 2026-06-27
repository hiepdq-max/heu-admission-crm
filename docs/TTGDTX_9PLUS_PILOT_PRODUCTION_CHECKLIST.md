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
| TTGDTX operating control matrix | BGH + KHTC + PHAP_CHE + IT_DATA | PASS_LOCAL | `docs/TTGDTX_OPERATING_CONTROL_MATRIX_20260625.md`; `lib/ttgdtx-operating-controls.ts`; `components/ttgdtx/ttgdtx-operating-control-strip.tsx`; `npm.cmd run audit:ttgdtx-operating-control-ui`; owners, blocking gates and next actions reflected on key finance pages; signed UAT still required | YES | Workflow has pages but no enforceable control path |
| User-friendly TTGDTX process labels | IT_DATA + KHTC | PASS_LOCAL | `docs/TTGDTX_PROCESS_CODE_MAP_20260625.md`; `lib/ttgdtx-process-labels.ts`; `npm.cmd run audit:ttgdtx-process-labels`; screens/search show business name first and P2 code second | NO | Users cannot find the right workflow because technical P2 codes hide the business meaning |
| HEU data foundation controls | IT_DATA + Process owners | PASS_LOCAL | `docs/HEU_DATA_MODEL_V1.md`; `docs/HEU_DATA_DICTIONARY_V1.md`; `docs/HEU_ROLE_PERMISSION_MATRIX_V1.md`; `npm.cmd run audit:heu-data-foundation`; no production schema/access approval | YES | Master names, fields and permissions drift before UAT and migration approval |
| SQL object to master-name map | IT_DATA | PASS_LOCAL | `docs/HEU_SQL_OBJECT_MASTER_MAP_20260627.md`; `npm.cmd run audit:heu-sql-object-master-map`; map only, no production schema rename/drop/alter | NO | New SQL/dashboard work uses inconsistent names and breaks future migration planning |
| Generic TTGDTX source/evidence model | IT_DATA + Audit | PASS_LOCAL | `docs/TTGDTX_GENERIC_SOURCE_EVIDENCE_AUDIT_20260626.md`; `npm.cmd run audit:ttgdtx-generic-source-evidence`; reference-center material remains metadata/UAT only | NO | A reference center is hard-coded into product logic and cannot scale to other centers |
| Keep safety branch for hardening | IT_DATA | DONE | Branch `hardening/ttgdtx-9plus-pilot` | NO | Pilot changes mix with unstable main work |
| Review dirty Git state | IT_DATA | IN_PROGRESS | GIT_CLEANUP_ANALYSIS.md | YES | Wrong files or temporary SQL committed |
| Exclude runtime logs from commit | IT_DATA | PASS_LOCAL | `.gitignore` covers `.log`, `dev-server*.log`, `next-dev*.log`, `.env`, `.env.local`, `.env.*.local`; `git ls-files -o --exclude-standard` currently empty | NO | Logs or local noise committed |
| Supabase backup before production migration | IT_DATA | NOT_STARTED | Backup ID, timestamp, restore note, and `docs/STEP90_STEP110_BACKUP_RESTORE_DRY_RUN_EVIDENCE_PACK_20260627.md` completed with controlled evidence outside Git when sensitive | YES | Cannot recover after failed migration |
| Approve Step90-Step110 migration order | IT_DATA + KHTC + PHAP_CHE | IN_PROGRESS | `docs/MIGRATION_ORDER_AUDIT.md` signed off | YES | Wrong order can damage finance data |
| P2-01 TTGDTX contract active | PHAP_CHE + BGH | DONE | Contract row, status, scope, effective date | YES | Finance action without effective contract |
| P2-02 tuition policy ready | KHTC | DONE | Tuition policy READY for TTGDTX/major/year | YES | Wrong tuition receivable |
| Real-data fit and redaction review | KHTC + PHAP_CHE + IT_DATA | PASS_LOCAL | `docs/TTGDTX_PHU_XUYEN_REAL_DATA_FIT_NOTE_20260625.md`; `docs/TTGDTX_SYNTHETIC_REAL_LIKE_UAT_PACK_20260627.md`; `docs/TTGDTX_BANK_RECEIPT_BATCH_POLICY_20260627.md`; `fixtures/ttgdtx/synthetic_real_like_uat_pack_20260627.json`; `npm.cmd run audit:ttgdtx-synthetic-uat-pack`; signed UAT still required | YES | Design passes sample data but fails real workbook/PDF/appendix structure |
| Account-control workflow for phong toa/giai toa | KHTC + CTHSSV + IT_DATA | PASS_LOCAL | `docs/TTGDTX_ACCOUNT_FREEZE_RELEASE_ACCEPTANCE_NOTE_20260625.md`; `docs/TTGDTX_ACCOUNT_CONTROL_SCOPE_DECISION_20260627.md`; `npm.cmd run audit:ttgdtx-account-control-scope-decision`; real bank workflow deferred, metadata only until owner approval and UAT | YES | Bank/account control happens outside the system without communication, approval or audit trail |
| BBNT evidence gate before partner payment | KHTC + PHAP_CHE + BGH | PASS_LOCAL | Step105 P2-15 and Step107 P2-17 block on P2-19 BBNT/partner-invoice checks; `components/ttgdtx/ttgdtx-payment-dossier-checklist.tsx`; `npm.cmd run audit:ttgdtx-payment-dossier-checklist`; signed UAT still required for BBNT evidence link, accepted-period summary and partner invoice evidence | YES | Partner payment is requested or paid without nghiệm thu basis |
| Collateral giai-chap separation | PHAP_CHE + KHTC + BGH | PASS_LOCAL | `docs/TTGDTX_ACCOUNT_CONTROL_SCOPE_DECISION_20260627.md`; restricted legal-finance register stays separate from tuition-account release; no production collateral operation approved | YES | Collateral release is confused with tuition-account release or exposed to wrong roles |
| P0-19 legal/finance gate ready | PHAP_CHE + KHTC | IN_PROGRESS | Legal and tuition gate evidence | YES | Receivable created without enough legal/finance basis |
| Lead-to-student handover guard | TUYEN_SINH + CTHSSV + DAO_TAO + KHTC | PASS_LOCAL | `docs/HEU_LEAD_TO_STUDENT_HANDOVER_POLICY_20260627.md`; `npm.cmd run audit:heu-lead-handover-policy`; no raw PII in repo/chat; P2-05/P2-03 remain final finance gates; signed UAT still required | YES | Lead becomes student/finance record without checklist, scope control or audit |
| P2-05 gate shows only eligible leads | TUYEN_SINH + KHTC | DONE | Screenshot/gate counts and pass/fail reasons | NO | Receivable created for ineligible lead |
| Receivable/payment status lifecycle | KHTC + IT_DATA + Audit | PASS_LOCAL | `docs/TTGDTX_RECEIVABLE_PAYMENT_STATUS_LIFECYCLE_POLICY_20260627.md`; `npm.cmd run audit:ttgdtx-receivable-payment-lifecycle`; signed finance UAT still required | YES | Finance records skip evidence, approval, reversal or lock controls |
| P2-03 receivable creation | KHTC | DONE | Receivable ID, student, amount, due date, audit log | YES | Missing or duplicate receivable |
| Thu học phí (P2-10) | KHTC | DONE | Receipt/voucher number, amount, date, evidence link | YES | Duplicate receipt or wrong amount |
| Hóa đơn/chứng từ khi thu học phí (P2-10) | KHTC + PHAP_CHE | PASS_LOCAL | `lib/ttgdtx-invoice-policy.ts`; `components/ttgdtx/ttgdtx-invoice-policy-matrix.tsx`; `npm.cmd run audit:ttgdtx-invoice-policy`; policy matrix covers collection model, payer type, invoice_required, issuer, invoice_status, invoice number/date/evidence or authorized waiver; signed KHTC/Phap Che UAT still required | YES | Tuition is collected without required invoice/chung-tu, or invoice is issued by the wrong party/time |
| Money input format | IT_DATA + KHTC | PASS_LOCAL | `npm.cmd run audit:vnd-money-format`; P2-10 and P2-17 share `lib/vnd-money.ts`; accept `1000000`, `1 000 000`, `1.000.000`; display `1.000.000 đ` | NO | User enters wrong money amount |
| P2-13 reconciliation batch | KHTC | DONE | Batch ID, receipt list, period, partner | YES | Receipt omitted or placed in multiple periods |
| P2-14 review/approve/lock batch | KHTC + BGH | DONE | Locked batch status, approval log, `docs/TTGDTX_PERIOD_LOCK_ADJUSTMENT_POLICY_20260627.md` | YES | Payment requested from unlocked period |
| P2-15 payment request created | KHTC | DONE | Payment request ID, amount, batch, creator, required evidence link | YES | Missing payment request evidence |
| P2-15 note/evidence completeness | KHTC | PASS_LOCAL | Required BBNT/partner-invoice dossier link enforced by server action; `TtgdtxPaymentDossierChecklist`; signed UAT still required for note quality, waiver basis and attached dossier proof | YES | Weak audit basis for payment request |
| P2-16 check/approve payment request | KHTC + BGH | DONE | Checked/approved status, approver note | YES | Payment without review/approval |
| P2-17 execute payout once | KHTC | IN_PROGRESS | Payout voucher, required evidence link, paid status, RPC-only write path, normalized voucher guard, P2-19 blocker, `TtgdtxPaymentDossierChecklist`, `components/ttgdtx/ttgdtx-payout-duplicate-guard.tsx`, `npm.cmd run audit:ttgdtx-payout-duplicate-guard`, and duplicate-click UAT in `docs/P2_17_DUPLICATE_PAYOUT_UAT_RUNBOOK.md`; signed UAT still required | YES | Duplicate partner payout or payout without complete dossier |
| P2-18 accounting dashboard | IT_DATA + KHTC | IN_PROGRESS | `npm.cmd run audit:ttgdtx-dashboard-access`, `npm.cmd run audit:ttgdtx-dashboard-readonly-guard` and `npm.cmd run audit:ttgdtx-accounting-dashboard-uat-plan` pass; `components/ttgdtx/ttgdtx-dashboard-readonly-guard.tsx`; dashboard route, control board, no-write behavior, role scope and UAT in `docs/P2_18_ACCOUNTING_DASHBOARD_UAT_RUNBOOK.md` and `docs/TTGDTX_ACCOUNTING_DASHBOARD_ROLE_UAT_PLAN_20260627.md` still require signed UAT evidence | YES | BGH/KHTC see wrong or incomplete finance data |
| BGH operating dashboard specification | BGH + IT_DATA | PASS_LOCAL | `docs/HEU_BGH_OPERATING_DASHBOARD_SPEC_20260627.md`; `npm.cmd run audit:heu-bgh-dashboard-spec`; no production dashboard implementation or GO decision | YES | Executive dashboard is trusted before source workflow, role scope and UAT are proven |
| Permission by role and workspace | IT_DATA + TRUONG_PHONG | IN_PROGRESS | `npm.cmd run audit:permission-soft-revoke`, `npm.cmd run audit:ttgdtx-role-scope-access`, `npm.cmd run audit:ttgdtx-data-fetch-gate` and `npm.cmd run audit:heu-role-scope-uat-pack` pass; Step109 UAT; `docs/TTGDTX_ROLE_SCOPE_UAT_RUNBOOK.md`; `docs/HEU_ROLE_SCOPE_UAT_EXECUTION_PACK_20260627.md`; test ADMIN, BGH, KHTC, TUYEN_SINH, CTHSSV, DAO_TAO, PHAP_CHE, AUDIT and out-of-scope staff | YES | User sees or edits data outside scope |
| Audit log completeness | IT_DATA + AUDIT | IN_PROGRESS | `npm.cmd run audit:ttgdtx-audit-log` passes; UAT in `docs/TTGDTX_AUDIT_LOG_UAT_RUNBOOK.md`; logs for create/update/check/approve/pay | YES | Cannot trace who changed finance state |
| Hard delete review | IT_DATA + AUDIT | IN_PROGRESS | `docs/HARD_DELETE_AUDIT.md`; `docs/HEU_NON_TTGDTX_CASCADE_REVIEW_20260627.md`; `npm.cmd run audit:hard-delete`, `npm.cmd run audit:ttgdtx-cascade` and `npm.cmd run audit:heu-non-ttgdtx-cascade-review` pass; non-TTGDTX conversion or written waiver still required before production | YES | Loss of evidence, history or legal record |
| Error routing P2-07/P2-08 | KHTC + IT_DATA + AUDIT | DONE | Issue routing/resolution records | NO | Import errors do not reach the right owner |
| No AI approval | BGH + IT_DATA | PASS_LOCAL | `docs/HEU_AI_ASSISTANT_POLICY_20260627.md`; `npm.cmd run audit:heu-ai-policy`; `/ai-assistant` is advisory/read-only and cannot approve, pay, recognize revenue, freeze/release or mark go-live | YES | AI self-approves finance or go-live |
| Rollback plan | IT_DATA | IN_PROGRESS | `docs/STEP90_STEP109_BACKUP_ROLLBACK_DRY_RUN_RUNBOOK.md`; `docs/STEP90_STEP110_BACKUP_RESTORE_DRY_RUN_EVIDENCE_PACK_20260627.md`; restore procedure; tested dry-run; `npm.cmd run audit:ttgdtx-backup-restore-dry-run-pack`; `npm.cmd run audit:ttgdtx-release-gates` | YES | Cannot recover after production migration failure |
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
6. Validate the account-control deferral and collateral separation decision from `docs/TTGDTX_ACCOUNT_CONTROL_SCOPE_DECISION_20260627.md` in signed UAT.
7. Validate operating-control UI and gate behavior in signed UAT using `docs/TTGDTX_OPERATING_CONTROL_MATRIX_20260625.md`.
8. Validate user-friendly labels/search in browser UAT using `docs/TTGDTX_PROCESS_CODE_MAP_20260625.md`.
9. Validate P2-10 invoice policy matrix in signed KHTC/Phap Che browser UAT; keep `npm.cmd run audit:ttgdtx-invoice-policy` green.
10. Keep `npm.cmd run audit:vnd-money-format` green when adding new finance forms; partner invoice gate is added to P2-15/P2-17 and still needs signed UAT proof.
11. BBNT evidence gate is added to P2-15/P2-17 and still needs signed UAT proof.
12. Complete role/workspace permission tests.
