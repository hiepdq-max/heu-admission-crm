# HEU Implementation Log

## 2026-06-26 - Safe Resume And Production Build Control

### Scope

- Read HEU production-builder instruction.
- Performed safe repo inventory before new implementation.
- Created P0/P1 coordination docs for controlled continuation.

### Files Added

- `docs/HEU_CODEX_RESUME_INVENTORY_20260626.md`
- `docs/HEU_SYSTEM_BUILD_BACKLOG.md`
- `docs/HEU_TECH_RISK_REGISTER.md`
- `docs/HEU_DATA_MODEL_V1.md`
- `docs/HEU_DATA_DICTIONARY_V1.md`
- `docs/HEU_ROLE_PERMISSION_MATRIX_V1.md`
- `docs/modules/TTGDTX_9PLUS_CORE_SPEC.md`
- `docs/modules/TTGDTX_9PLUS_CORE_DATA_DICTIONARY.md`
- `docs/modules/TTGDTX_9PLUS_CORE_TEST_CASES.md`

### Decision

- Continue with TTGDTX/9+ as the pilot spine.
- Treat Phu Xuyen as real-world reference/evidence for design, not as hard-coded product scope.
- Do not run production migrations from Codex.
- Do not commit or push until scope and tests are reviewed.
- Keep TTGDTX/9+ generic for many centers/partners. Phu Xuyen remains a reference case only.

### Verification Planned

- Run local audit scripts.
- Run lint/build if documentation and any code changes require it.

## 2026-06-26 - TTGDTX Generic Source Evidence Guard

### Scope

- Rechecked Phu-Xuyen-specific references after confirming it is a real-world reference case only.
- Generalized source-control UI wording so P2-19 is presented as metadata for real/anonymized source packs, not for one fixed center.
- Added a local guard to prevent hard-coded reference-center names in product code.

### Files Added

- `docs/TTGDTX_GENERIC_SOURCE_EVIDENCE_AUDIT_20260626.md`
- `scripts/audit-ttgdtx-generic-source-evidence.mjs`

### Files Updated

- `app/ttgdtx/source-control/page.tsx`
- `docs/HEU_SYSTEM_BUILD_BACKLOG.md`
- `docs/HEU_TECH_RISK_REGISTER.md`
- `docs/HEU_IMPLEMENTATION_LOG.md`

### Decision

- Product code must stay generic for many TTGDTX centers/partners.
- Docs and database evidence metadata may mention Phu Xuyen only as a reference/control case.
- Do not rename Step110 source codes in production without a dedicated migration and rollback note.

## 2026-06-26 - P0 Recheck Before Further Code Work

### Scope

- Re-ran repo/branch/status/framework checks at HEAD `28b8e7d`.
- Updated P0 inventory and backlog before any further app/database code edits.
- Confirmed the working tree remains dirty and must be split by scope.

### Files Updated

- `docs/HEU_CODEX_RESUME_INVENTORY_20260626.md`
- `docs/HEU_SYSTEM_BUILD_BACKLOG.md`
- `docs/HEU_IMPLEMENTATION_LOG.md`

### Decision

- Pause new code edits until P0 classification is accepted.
- Next safe P0 work is grouping the remaining dirty files and deciding the next docs/audit-only commit scope.

## 2026-06-26 - P2 TTGDTX Local Audit Script Packaging

### Scope

- Continued P2 TTGDTX/9+ Pilot with a small non-production code slice.
- Packaged local audit scripts that support TTGDTX hardening and release gates.
- Added npm entry for the generic source/evidence guard.

### Files Updated

- `package.json`
- `scripts/audit-ttgdtx-release-gates.mjs`
- `docs/HEU_SYSTEM_BUILD_BACKLOG.md`
- `docs/HEU_IMPLEMENTATION_LOG.md`

### Decision

- This change does not run production migration.
- These scripts are local static guards only; they do not read secrets or call Supabase production.
- Keep committing P2 support controls separately from finance migrations and UI routes.

## 2026-06-26 - P2-12 TTGDTX Master Dropdown Slice

### Scope

- Continued P2 TTGDTX/9+ Pilot with the Data Master layer before finance posting.
- Reviewed `app/ttgdtx/master/page.tsx` and `database/step99_ttgdtx_master_dropdown_p2_12.sql`.
- Kept P2-12 as master/dropdown/readiness control: no receivable creation, no tuition collection and no partner payout.

### Files Updated/Added

- `app/ttgdtx/master/page.tsx`
- `database/step99_ttgdtx_master_dropdown_p2_12.sql`
- `docs/HEU_SYSTEM_BUILD_BACKLOG.md`
- `docs/HEU_IMPLEMENTATION_LOG.md`

### Decision

- Step99 is a migration candidate only and was not run in production.
- UI copy now tells operators to apply Step99 only in an approved environment with backup/approval.
- P2-12 is committed separately from high-risk finance flows P2-10, P2-13 and P2-17.

## 2026-06-26 - P2-05 TTGDTX Receivable Gate Slice

### Scope

- Continued P2 TTGDTX/9+ Pilot with the gate layer before receivable posting.
- Reviewed `app/ttgdtx/gate/page.tsx` and `database/step91_ttgdtx_receivable_gate_p2_05.sql`.
- Kept P2-05 read-only/check-only: it does not create receivables, collect tuition or approve partner payment.

### Files Updated/Added

- `app/ttgdtx/gate/page.tsx`
- `database/step91_ttgdtx_receivable_gate_p2_05.sql`
- `docs/HEU_SYSTEM_BUILD_BACKLOG.md`
- `docs/HEU_IMPLEMENTATION_LOG.md`

### Decision

- Step91 is a migration candidate only and was not run in production.
- P2-05 route now checks the dedicated `ttgdtx.receivable.gate.read` permission while also accepting existing `ttgdtx.receivable.read` for P2-03 readers.
- This slice is committed before P2-03/P2-10 finance posting flows.

## 2026-06-26 - P2-06/P2-09 TTGDTX Import Control Slice

### Scope

- Continued the TTGDTX/9+ Pilot with the data-intake control path before any real tuition collection or partner payment work.
- Reviewed and packaged P2-06 import staging, P2-07 issue routing, P2-08 issue resolution and P2-09 department workload screens.
- Kept the slice as staging/control only: it does not create real receivables, confirm cash collection, issue invoices or approve partner payout.

### Files Updated/Added

- `app/ttgdtx/import/page.tsx`
- `app/ttgdtx/import/issues/page.tsx`
- `app/ttgdtx/import/issues/actions.ts`
- `app/ttgdtx/import/workload/page.tsx`
- `database/step92_ttgdtx_tuition_import_control_p2_06.sql`
- `database/step93_ttgdtx_import_issue_routing_p2_07.sql`
- `database/step94_ttgdtx_import_issue_resolution_p2_08.sql`
- `database/step95_ttgdtx_department_workload_p2_09.sql`
- `docs/HEU_SYSTEM_BUILD_BACKLOG.md`
- `docs/HEU_IMPLEMENTATION_LOG.md`

### Decision

- Step92, Step93, Step94 and Step95 are migration candidates only and were not run in production.
- Server action `updateTtgdtxImportIssueTaskAction` now allowlists P2-08 workflow actions before calling the database RPC.
- P2-06 through P2-09 are committed as the controlled intake/error-workload layer before P2-10 tuition collection and P2-17 payout execution.

## 2026-06-26 - P2-10 TTGDTX Tuition Collection Invoice Control Slice

### Scope

- Continued the TTGDTX/9+ Pilot with P2-10 tuition collection controls.
- Added a per-payment invoice/receipt decision instead of a global yes/no answer.
- Kept Step96 as a migration candidate only; no production migration was run.

### Files Updated/Added

- `app/ttgdtx/payments/page.tsx`
- `app/ttgdtx/payments/actions.ts`
- `database/step96_ttgdtx_tuition_collection_p2_10.sql`
- `docs/HEU_SYSTEM_BUILD_BACKLOG.md`
- `docs/HEU_IMPLEMENTATION_LOG.md`

### Decision

- Each P2-10 payment now carries `invoice_required`, `invoice_issuer`, `invoice_status`, invoice number/date/evidence or waiver reason.
- UI requires the operator to classify invoice/receipt status before saving a collection voucher.
- P2-10 still does not approve partner payment; P2-15/P2-17 must continue to gate partner invoice and BBNT separately.

## 2026-06-26 - P2-13 TTGDTX Reconciliation Invoice Gate Slice

### Scope

- Continued the TTGDTX/9+ Pilot by hardening P2-13 reconciliation after P2-10 invoice control.
- Added a block so P2-13 does not pull P2-10 payments whose collection invoice/receipt decision is unresolved.
- Corrected P2-13 summary aliases used by the UI.

### Files Updated/Added

- `app/ttgdtx/reconciliation/page.tsx`
- `app/ttgdtx/reconciliation/actions.ts`
- `database/step101_ttgdtx_reconciliation_p2_13.sql`
- `docs/HEU_SYSTEM_BUILD_BACKLOG.md`
- `docs/HEU_IMPLEMENTATION_LOG.md`

### Decision

- Step101 is a migration candidate only and was not run in production.
- P2-13 remains a reconciliation batch step only; it does not approve or pay TTGDTX.
- Payments with `NEEDS_INVOICE_DECISION` stay visible but cannot enter an active reconciliation batch.

## 2026-06-26 - P2-14 TTGDTX Reconciliation Review Lock Slice

### Scope

- Continued the TTGDTX/9+ Pilot with review, approve and lock controls for P2-13 reconciliation batches.
- Hardened P2-14 so review/approve/lock cannot proceed if any batch line still has unresolved P2-10 invoice/receipt status.
- Added server-side action allowlist for P2-14 workflow actions.

### Files Updated/Added

- `app/ttgdtx/reconciliation/review/page.tsx`
- `app/ttgdtx/reconciliation/review/actions.ts`
- `database/step104_ttgdtx_reconciliation_approval_p2_14.sql`
- `docs/HEU_SYSTEM_BUILD_BACKLOG.md`
- `docs/HEU_IMPLEMENTATION_LOG.md`

### Decision

- Step104 is a migration candidate only and was not run in production.
- P2-14 can review, approve, lock or cancel a reconciliation batch, but still does not create partner payment requests and does not pay TTGDTX.
- A locked P2-14 batch is the controlled input for P2-15/P2-17; BBNT and partner invoice gates remain separate.

## 2026-06-26 - P2-15 TTGDTX Partner Payment Request Slice

### Scope

- Continued the TTGDTX/9+ Pilot with P2-15 partner payment request creation from locked P2-14 reconciliation batches.
- Kept P2-15 as a request/dossier step only; it does not approve or execute payout.
- Hardened the candidate view and creation function to reject batches with unresolved P2-10 collection invoice/receipt decisions.

### Files Updated/Added

- `app/ttgdtx/payment-requests/page.tsx`
- `app/ttgdtx/payment-requests/actions.ts`
- `database/step105_ttgdtx_partner_payment_request_p2_15.sql`
- `docs/HEU_SYSTEM_BUILD_BACKLOG.md`
- `docs/HEU_IMPLEMENTATION_LOG.md`

### Decision

- Step105 is a migration candidate only and was not run in production.
- P2-15 requires a locked P2-14 batch, no duplicate request, no unresolved collection invoice lines, and a BBNT/partner-invoice dossier link.
- P2-16 approval and P2-17 payout remain separate high-risk slices.

## 2026-06-26 - P2-16 TTGDTX Payment Request Approval Slice

### Scope

- Continued the TTGDTX/9+ Pilot with P2-16 check/approve/return/reject controls for P2-15 partner payment requests.
- Kept P2-16 as an approval-status step only; it does not execute payout and does not replace accounting vouchers.
- Hardened P2-16 so APPROVE requires a prior CHECK state and approval views use security-invoker behavior.

### Files Updated/Added

- `app/ttgdtx/payment-requests/review/page.tsx`
- `app/ttgdtx/payment-requests/review/actions.ts`
- `app/ttgdtx/payment-requests/page.tsx`
- `database/step106_ttgdtx_payment_request_approval_p2_16.sql`
- `docs/HEU_SYSTEM_BUILD_BACKLOG.md`
- `docs/HEU_IMPLEMENTATION_LOG.md`

### Decision

- Step106 is a migration candidate only and was not run in production.
- P2-16 can check, approve, return or reject a P2-15 request, but payment execution remains P2-17.
- P2-16 approval requires the request to be CHECKED first; SUBMITTED requests can be checked or returned/rejected, not directly approved.

## 2026-06-26 - P2-17 TTGDTX Payment Execution Record Slice

### Scope

- Continued the TTGDTX/9+ Pilot with P2-17 disbursement-record controls for approved P2-15/P2-16 requests.
- Kept P2-17 as a system record of payment evidence; it does not initiate bank transfer from the application.
- Hardened the payout record path with required voucher number, evidence URL, no duplicate voucher and no overpayment.

### Files Updated/Added

- `app/ttgdtx/payment-requests/pay/page.tsx`
- `app/ttgdtx/payment-requests/pay/actions.ts`
- `app/ttgdtx/payment-requests/pay/payment-submit-button.tsx`
- `app/ttgdtx/payment-requests/review/page.tsx`
- `database/step107_ttgdtx_payment_execution_p2_17.sql`
- `docs/HEU_SYSTEM_BUILD_BACKLOG.md`
- `docs/HEU_IMPLEMENTATION_LOG.md`

### Decision

- Step107 is a migration candidate only and was not run in production.
- P2-17 records payment evidence only after P2-16 APPROVED and keeps audit history.
- Duplicate voucher numbers, missing payout evidence, wrong request status and overpayment are blocked before insert.

## 2026-06-26 - P2-18 TTGDTX Accounting Dashboard Slice

### Scope

- Continued the TTGDTX/9+ Pilot with a read-only accounting dashboard across P2-01 through P2-17.
- Added partner, control, summary, exception and recent-movement rollups for finance review.
- Kept P2-18 as an operating dashboard only; it does not create, approve or execute money movement.

### Files Updated/Added

- `app/ttgdtx/accounting-dashboard/page.tsx`
- `database/step108_ttgdtx_accounting_dashboard_p2_18.sql`
- `docs/HEU_SYSTEM_BUILD_BACKLOG.md`
- `docs/HEU_IMPLEMENTATION_LOG.md`

### Decision

- Step108 is a migration candidate only and was not run in production.
- P2-18 is read-only and points users back to the source step when values do not match.
- Dashboard findings are not business approval; source transaction/audit records remain the evidence of record.

## 2026-06-27 - P0-11 Role Permission Soft Revoke Slice

### Scope

- Continued hardening with Step109 role-permission soft revoke controls.
- Kept role permission replacement as `INACTIVE` plus upsert `ACTIVE`; no Settings action should physically delete role permissions.
- Kept user segment/partner scope replacement as `INACTIVE` plus upsert `ACTIVE` to preserve audit history.

### Files Updated/Added

- `app/settings/actions.ts`
- `app/settings/page.tsx`
- `database/step109_role_permission_soft_revoke_p0_11.sql`
- `docs/STEP109_ROLE_PERMISSION_UAT_RUNBOOK.md`
- `docs/HEU_SYSTEM_BUILD_BACKLOG.md`
- `docs/HEU_IMPLEMENTATION_LOG.md`

### Decision

- Step109 is a migration candidate only and was not run in production.
- Production remains blocked until backup, restore dry-run, ADMIN lockout test and audit evidence are complete.
- Settings UI now warns if Step109 has not been run before editing role permissions.

## 2026-06-27 - P2-19 Step110 Evidence Metadata Safety Slice

### Scope

- Continued the TTGDTX/9+ Pilot with Step110 real-data evidence metadata controls.
- Kept Phu-Xuyen-like material as reference metadata only; no raw student, bank, transaction, CIF or collateral values are imported into repo or UI.
- Added a Step110 UAT runbook and a local safety audit for the previous Supabase failure modes: wrong view column order, `relation "a"` and `array_agg`.

### Files Updated/Added

- `database/step110_ttgdtx_real_data_evidence_metadata_p2_19.sql`
- `database/step110_preflight_check_before_p2_19.sql`
- `database/step110_postflight_check_p2_19.sql`
- `database/step110_find_relation_a_debug.sql`
- `docs/STEP110_P2_19_UAT_RUNBOOK.md`
- `docs/TTGDTX_PHU_XUYEN_REAL_DATA_FIT_NOTE_20260625.md`
- `docs/TTGDTX_ACCOUNT_FREEZE_RELEASE_ACCEPTANCE_NOTE_20260625.md`
- `scripts/audit-ttgdtx-step110-safety.mjs`
- `package.json`
- `scripts/audit-ttgdtx-release-gates.mjs`
- `docs/HEU_SYSTEM_BUILD_BACKLOG.md`
- `docs/HEU_IMPLEMENTATION_LOG.md`

### Decision

- Step110 is a migration candidate only and was not run in production.
- Run preflight first; if any required object is `MISSING`, stop and apply the missing previous step on UAT/restore.
- If Supabase still reports `relation "a" does not exist`, run the read-only debug SQL and record the object before retrying.

## 2026-06-27 - TTGDTX Release-Gate UAT Evidence Pack Slice

### Scope

- Packaged the UAT/runbook documents that local release gates depend on, so a clean checkout has the evidence scaffolding required by `npm.cmd run audit:ttgdtx-release-gates`.
- Aligned migration-order, hard-delete and production checklist docs around Step90-Step110, rollback, role-scope, audit-log, P2-17 duplicate payout and P2-18 dashboard UAT.
- Kept this as documentation/control work only; no production migration was run and no finance approval was implied.

### Files Updated/Added

- `docs/P2_17_DUPLICATE_PAYOUT_UAT_RUNBOOK.md`
- `docs/P2_18_ACCOUNTING_DASHBOARD_UAT_RUNBOOK.md`
- `docs/TTGDTX_AUDIT_LOG_UAT_RUNBOOK.md`
- `docs/STEP90_STEP109_BACKUP_ROLLBACK_DRY_RUN_RUNBOOK.md`
- `docs/TTGDTX_ROLE_SCOPE_UAT_RUNBOOK.md`
- `docs/TTGDTX_BROWSER_UAT_MATRIX_20260625.md`
- `docs/TTGDTX_SYNTHETIC_UAT_ACCOUNT_SETUP.md`
- `docs/TTGDTX_UAT_EXECUTION_LOG_20260625.md`
- `docs/HARD_DELETE_AUDIT.md`
- `docs/MIGRATION_ORDER_AUDIT.md`
- `docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md`
- `docs/HEU_IMPLEMENTATION_LOG.md`

### Decision

- Production remains NO-GO until backup/restore dry-run, synthetic multi-account UAT and human sign-off are attached.
- Codex/AI output remains advisory; it does not approve go-live, payments or finance/legal decisions.

## 2026-06-27 - TTGDTX Operating Spine Control Docs Slice

### Scope

- Packaged the operating-spine documents referenced by the production checklist.
- Added release-gate checks for the linked operating review, operating control matrix, process-code map and Codex operating playbook.
- Kept business labels user-facing first and P2 codes as audit/search support, not as the main mental model for staff.

### Files Updated/Added

- `docs/HEU_CODEX_OPERATING_PLAYBOOK.md`
- `docs/TTGDTX_LINKED_OPERATING_REVIEW_20260625.md`
- `docs/TTGDTX_OPERATING_CONTROL_MATRIX_20260625.md`
- `docs/TTGDTX_PROCESS_CODE_MAP_20260625.md`
- `docs/TTGDTX_UAT_EXECUTION_LOG_20260625.md`
- `scripts/audit-ttgdtx-release-gates.mjs`
- `docs/HEU_IMPLEMENTATION_LOG.md`

### Decision

- TTGDTX remains one linked operating spine, not separate isolated finance pages.
- AI/Codex still cannot approve production, finance actions, account freeze/release, collateral release or go-live.

## 2026-06-27 - P2-03/P2-04 TTGDTX Receivable Runtime Slice

### Scope

- Packaged the P2-03 receivable page, P2-04 read-only simulation page, server action and Step90 SQL candidate for TTGDTX student receivables.
- Tightened Step90 database access so read access requires receivable permission plus business scope, and direct write policy is insert/update only with scope.
- Added a P2-03 UAT runbook for duplicate receivable, out-of-scope user, blocker and audit-log cases.

### Files Updated/Added

- `app/ttgdtx/receivables/page.tsx`
- `app/ttgdtx/receivables/actions.ts`
- `app/ttgdtx/simulation/page.tsx`
- `app/ttgdtx/page.tsx`
- `app/ttgdtx/tuition/page.tsx`
- `database/step90_ttgdtx_student_receivables.sql`
- `docs/P2_03_RECEIVABLE_UAT_RUNBOOK.md`
- `docs/HEU_SYSTEM_BUILD_BACKLOG.md`
- `docs/HEU_IMPLEMENTATION_LOG.md`
- `scripts/audit-ttgdtx-role-scope-access.mjs`

### Decision

- Step90 is a migration candidate only and was not run in production.
- P2-03 creates receivable facts only; it does not confirm cash collection, issue final invoice, reconcile, approve or pay.
- P2-04 is read-only simulation and only points users to the next safe operating step.
- Production remains NO-GO until signed UAT and backup/restore evidence are attached.

## 2026-06-27 - P2-11 TTGDTX Source Control Runtime Guard

### Scope

- Continued the TTGDTX/9+ pilot with the source/legal/evidence control layer.
- Hardened Step98 before production use: read access now requires source permission plus business scope, and write access is split into insert/update only.
- Kept source-document evidence links restrict-protected so checklist evidence cannot be silently detached by deleting a source document.
- Added a UAT runbook for P2-11 source-control verification.

### Files Updated/Added

- `database/step98_ttgdtx_source_control_p2_11.sql`
- `scripts/audit-ttgdtx-role-scope-access.mjs`
- `docs/P2_11_SOURCE_CONTROL_UAT_RUNBOOK.md`
- `docs/HEU_SYSTEM_BUILD_BACKLOG.md`
- `docs/HEU_IMPLEMENTATION_LOG.md`

### Decision

- Step98 remains a migration candidate only and was not run in production.
- P2-11 is source/control metadata only. It does not create receivables, collect tuition, reconcile money, approve payment requests or record payouts.
- Production still requires backup evidence, restore dry-run, signed UAT and business Go/No-Go.

## 2026-06-27 - P2-12 TTGDTX Master Dropdown Runtime Guard

### Scope

- Continued the TTGDTX/9+ pilot with the controlled center master/dropdown layer.
- Hardened Step99 before production use: read access now requires master permission plus business scope, and write access is split into insert/update only.
- Kept source-document evidence links restrict-protected so dropdown master evidence cannot be silently detached by deleting a source document.
- Added a UAT runbook for P2-12 master/dropdown verification.

### Files Updated/Added

- `database/step99_ttgdtx_master_dropdown_p2_12.sql`
- `scripts/audit-ttgdtx-role-scope-access.mjs`
- `docs/P2_12_MASTER_DROPDOWN_UAT_RUNBOOK.md`
- `docs/HEU_SYSTEM_BUILD_BACKLOG.md`
- `docs/HEU_IMPLEMENTATION_LOG.md`

### Decision

- Step99 remains a migration candidate only and was not run in production.
- P2-12 controls dropdown/master data only. It does not create receivables, collect tuition, reconcile money, approve payment requests or record payouts.
- Production still requires backup evidence, restore dry-run, signed UAT and business Go/No-Go.

## 2026-06-27 - P0-19 / P2-01 / P2-02 Pilot Gate Safety

### Scope

- Continued the TTGDTX/9+ pilot by packaging the P0-19 finance gate guard before receivable creation.
- Added production-boundary and transaction safety to Step97 so P2-03 candidate/trigger logic requires P0-19 legal, tuition and finance readiness.
- Hardened Step100 as a sandbox/UAT-only pilot fixture; it is blocked by default unless an explicit session flag is set.
- Added a local pilot-open safety audit and UAT runbook.

### Files Updated/Added

- `database/step97_ttgdtx_p0_19_finance_gate_fix.sql`
- `database/step100_ttgdtx_pilot_open_p2_01_p2_02_p0_19.sql`
- `scripts/audit-ttgdtx-pilot-open-safety.mjs`
- `scripts/audit-ttgdtx-release-gates.mjs`
- `package.json`
- `docs/P0_19_P2_01_P2_02_PILOT_OPEN_UAT_RUNBOOK.md`
- `docs/HEU_SYSTEM_BUILD_BACKLOG.md`
- `docs/HEU_IMPLEMENTATION_LOG.md`

### Decision

- Step97 and Step100 remain migration candidates only and were not run in production.
- Step100 is not legal, tuition, revenue, invoice or payout authority; it is only a guarded sandbox/UAT fixture.
- Production still requires official contract, official tuition decision, legal gate approval, backup evidence, restore dry-run, signed UAT and business Go/No-Go.

## 2026-06-27 - P2-13 Reconciliation Repair Safety

### Scope

- Continued the TTGDTX/9+ pilot by retiring stale P2-13 repair scripts.
- Converted Step102 and Step103 into explicit no-op history files so they cannot overwrite current Step101 reconciliation logic.
- Added a local audit to verify Step101 still preserves invoice/receipt columns and blocks unresolved invoice decisions.
- Added a UAT runbook for P2-13 repair safety.

### Files Updated/Added

- `database/step102_fix_p2_13_partner_status.sql`
- `database/step103_fix_p2_13_reconciliation_line_columns.sql`
- `scripts/audit-ttgdtx-reconciliation-repair-safety.mjs`
- `scripts/audit-ttgdtx-release-gates.mjs`
- `package.json`
- `docs/P2_13_RECONCILIATION_REPAIR_SAFETY_UAT_RUNBOOK.md`
- `docs/HEU_SYSTEM_BUILD_BACKLOG.md`
- `docs/HEU_IMPLEMENTATION_LOG.md`

### Decision

- Step102 and Step103 are retained only as retired/no-op migration history.
- Step101 remains the source of truth for P2-13 batch creation.
- Production still requires signed UAT and business Go/No-Go before reconciliation/payment workflows are trusted.

## 2026-06-27 - TTGDTX Lead Quick-Fix Safety

### Scope

- Continued the TTGDTX/9+ pilot with the lead detail bridge into P2-05/P2-03.
- Added a guarded quick-fix form for TTGDTX-linked leads to set partner, program, major and optional offering from controlled options.
- Added static audit coverage to prevent scope bypass, non-TTGDTX partner selection, self-promotion to ELIGIBLE/ENROLLED and missing activity audit.
- Preserved P2-03 as the final receivable creation gate.

### Files Updated/Added

- `app/leads/[id]/actions.ts`
- `app/leads/[id]/page.tsx`
- `components/leads/lead-detail.tsx`
- `components/leads/ttgdtx-lead-quick-fix-form.tsx`
- `scripts/audit-ttgdtx-lead-quick-fix-safety.mjs`
- `scripts/audit-ttgdtx-release-gates.mjs`
- `package.json`
- `docs/TTGDTX_LEAD_QUICK_FIX_UAT_RUNBOOK.md`
- `docs/HEU_SYSTEM_BUILD_BACKLOG.md`
- `docs/HEU_IMPLEMENTATION_LOG.md`

### Decision

- The quick-fix is metadata repair only and does not create receivables, collect money, reconcile, approve or pay.
- It cannot self-promote a lead to ELIGIBLE/ENROLLED and cannot mark DOCUMENT_SUBMITTED without document evidence.
- Production still requires signed role/scope UAT and business Go/No-Go.

## 2026-06-27 - VND Money Input And Display Guard

### Scope

- Continued the TTGDTX/9+ pilot with a small P2-10/P2-17 finance input hardening step.
- Added one shared VND helper for parsing positive submitted amounts and displaying VND amounts.
- Normalized P2-10 Thu học phí and P2-17 Chi tiền to accept `1000000`, `1 000 000`, `1.000.000` and display `1.000.000 đ`.
- Added a local audit so future finance forms do not revert to unsafe non-digit stripping.

### Files Updated/Added

- `lib/vnd-money.ts`
- `app/ttgdtx/payments/actions.ts`
- `app/ttgdtx/payments/page.tsx`
- `app/ttgdtx/payment-requests/pay/actions.ts`
- `app/ttgdtx/payment-requests/pay/page.tsx`
- `scripts/audit-vnd-money-format.mjs`
- `scripts/audit-ttgdtx-release-gates.mjs`
- `package.json`
- `docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md`
- `docs/HEU_SYSTEM_BUILD_BACKLOG.md`
- `docs/HEU_CURRENT_STATE_INVENTORY.md`
- `docs/HEU_IMPLEMENTATION_LOG.md`

### Decision

- This is PASS_LOCAL only; it does not mark P2-10/P2-17 production-ready.
- Production still requires signed finance UAT, duplicate receipt/payout tests and business Go/No-Go.

## 2026-06-27 - Backlog Code Guard

### Scope

- Fixed a duplicate backlog code introduced while adding the VND money normalization row.
- Added a local audit to keep `docs/HEU_SYSTEM_BUILD_BACKLOG.md` task codes unique.
- Added the backlog-code audit to package scripts and the TTGDTX release gate.

### Files Updated/Added

- `docs/HEU_SYSTEM_BUILD_BACKLOG.md`
- `scripts/audit-heu-backlog-codes.mjs`
- `scripts/audit-ttgdtx-release-gates.mjs`
- `package.json`
- `AGENTS.md`
- `docs/HEU_IMPLEMENTATION_LOG.md`

### Decision

- This is a coordination guard only. It does not change production migration status.

## 2026-06-27 - Generated Log Commit Guard Review

### Scope

- Reviewed `.gitignore` and current Git noise for generated logs and local env files.
- Verified `.log`, `dev-server*.log`, `next-dev*.log`, `.env`, `.env.local` and `.env.*.local` are ignored.
- Verified no `.log` or `.env` files are tracked and no generated untracked files are visible to Git in the current status.

### Files Updated/Added

- `docs/HEU_SYSTEM_BUILD_BACKLOG.md`
- `docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md`
- `docs/HEU_IMPLEMENTATION_LOG.md`

### Decision

- P0-04 is PASS_LOCAL for the current repo state.
- Future generated logs/env files must remain untracked and outside commits.

## 2026-06-27 - Synthetic Real-Like TTGDTX UAT Pack

### Scope

- Continued the TTGDTX/9+ pilot with P1-05 real-like UAT preparation.
- Added a synthetic source pack for Phu-Xuyen-like operating shapes without real PII or bank data.
- Covered K23 appendix, K24 support-fee formula, multi-section tuition workbook, bank receipt batch with duplicate fingerprint, invoice required/not-required/pending, account freeze/release, collateral release separation, BBNT and partner invoice gates.
- Added a local audit to verify pack coverage and reject obvious secrets, phone/CCCD-like values and raw bank-account-like strings.

### Files Updated/Added

- `fixtures/ttgdtx/synthetic_real_like_uat_pack_20260627.json`
- `docs/TTGDTX_SYNTHETIC_REAL_LIKE_UAT_PACK_20260627.md`
- `scripts/audit-ttgdtx-synthetic-uat-pack.mjs`
- `scripts/audit-ttgdtx-release-gates.mjs`
- `package.json`
- `AGENTS.md`
- `docs/HEU_SYSTEM_BUILD_BACKLOG.md`
- `docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md`
- `docs/HEU_CURRENT_STATE_INVENTORY.md`
- `docs/TTGDTX_PHU_XUYEN_REAL_DATA_FIT_NOTE_20260625.md`
- `docs/HEU_IMPLEMENTATION_LOG.md`

### Decision

- P1-05 is PASS_LOCAL as a synthetic UAT pack.
- The pack does not approve real-data import, production migration or production Go-Live.
- Signed UAT evidence remains required before any production readiness claim.

## 2026-06-27 - Bank Receipt Batch Policy Guard

### Scope

- Continued TTGDTX/9+ hardening with P4-03 bank statement handling policy.
- Defined required staging fields, duplicate fingerprint rule and stop conditions.
- Connected the policy to the synthetic UAT pack duplicate bank receipt case.

### Files Updated/Added

- `docs/TTGDTX_BANK_RECEIPT_BATCH_POLICY_20260627.md`
- `docs/HEU_SYSTEM_BUILD_BACKLOG.md`
- `docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md`
- `scripts/audit-ttgdtx-release-gates.mjs`
- `AGENTS.md`
- `docs/HEU_IMPLEMENTATION_LOG.md`

### Decision

- P4-03 is PASS_LOCAL as a policy/design guard.
- No raw bank statement, account number or production bank evidence is committed.
- Production bank import/evidence handling still requires signed UAT and business Go/No-Go.

## 2026-06-27 - AI Assistant Advisory-Only Guard

### Scope

- Continued HEU production-readiness hardening with P7-01 AI assistant policy.
- Added an explicit AI policy: AI may draft, summarize, suggest and warn; AI must not approve, pay, recognize revenue, freeze/release, delete evidence or mark production GO.
- Updated `/ai-assistant` copy to state the same business boundary.
- Added a local audit to keep the AI assistant route read-only and advisory-only.

### Files Updated/Added

- `docs/HEU_AI_ASSISTANT_POLICY_20260627.md`
- `scripts/audit-heu-ai-policy.mjs`
- `app/ai-assistant/page.tsx`
- `scripts/audit-ttgdtx-release-gates.mjs`
- `package.json`
- `AGENTS.md`
- `docs/HEU_SYSTEM_BUILD_BACKLOG.md`
- `docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md`
- `docs/HEU_CURRENT_STATE_INVENTORY.md`
- `docs/HEU_IMPLEMENTATION_LOG.md`

### Decision

- P7-01 is PASS_LOCAL for policy and static UI guard only.
- This does not enable AI automation or production AI.
- Future AI workflow actions still require prompt/output audit logging, role/scope enforcement and signed UAT.

## 2026-06-27 - Period Lock And Adjustment Policy Guard

### Scope

- Continued TTGDTX finance hardening with P4-05 period lock and adjustment policy.
- Defined locked-period rules after P2-13/P2-14 review, approval and lock.
- Required human adjustment request, check, approval, controlled apply and audit traceability for post-lock corrections.
- Added a local audit so the policy keeps no-direct-edit, no-hard-delete, no-AI-approval and no-silent-overwrite rules.

### Files Updated/Added

- `docs/TTGDTX_PERIOD_LOCK_ADJUSTMENT_POLICY_20260627.md`
- `scripts/audit-ttgdtx-period-lock-policy.mjs`
- `scripts/audit-ttgdtx-release-gates.mjs`
- `package.json`
- `AGENTS.md`
- `docs/HEU_SYSTEM_BUILD_BACKLOG.md`
- `docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md`
- `docs/HEU_IMPLEMENTATION_LOG.md`

### Decision

- P4-05 is PASS_LOCAL as a policy/control guard.
- It does not approve production finance operation or production migration.
- Signed UAT must still prove locked-period behavior and adjustment evidence.

## 2026-06-27 - Lead-To-Student Handover Policy Guard

### Scope

- Continued the HEU operating-system hardening with P3-02 lead-to-student handover.
- Defined the controlled handover packet from Tuyen Sinh to CTHSSV, Dao Tao and KHTC.
- Kept finance movement behind P2-05/P2-03/P4 controls and production NO-GO.
- Added a local audit for privacy, role/scope, accept/reject audit and AI advisory-only boundaries.

### Files Updated/Added

- `docs/HEU_LEAD_TO_STUDENT_HANDOVER_POLICY_20260627.md`
- `scripts/audit-heu-lead-handover-policy.mjs`
- `scripts/audit-ttgdtx-release-gates.mjs`
- `package.json`
- `AGENTS.md`
- `docs/HEU_SYSTEM_BUILD_BACKLOG.md`
- `docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md`
- `docs/HEU_IMPLEMENTATION_LOG.md`

### Decision

- P3-02 is PASS_LOCAL as a policy/control guard.
- No production handover, enrollment approval, receivable, collection or migration is approved.
- Signed UAT must still prove role scope, accept/reject behavior, evidence redaction and audit logging.

## 2026-06-27 - TTGDTX Accounting Dashboard Role UAT Plan

### Scope

- Continued production-readiness hardening with P5-01 TTGDTX accounting dashboard UAT.
- Added a role/account matrix for authorized BGH/Admin, KHTC, Tuyen Sinh, contract-only, out-of-scope and partner-like users.
- Required sanitized evidence capture, source comparison and stop conditions.
- Kept P2-18 accounting dashboard IN_PROGRESS until signed browser UAT proves access scope and financial totals.

### Files Updated/Added

- `docs/TTGDTX_ACCOUNTING_DASHBOARD_ROLE_UAT_PLAN_20260627.md`
- `scripts/audit-ttgdtx-accounting-dashboard-uat-plan.mjs`
- `scripts/audit-ttgdtx-release-gates.mjs`
- `package.json`
- `AGENTS.md`
- `docs/HEU_SYSTEM_BUILD_BACKLOG.md`
- `docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md`
- `docs/HEU_IMPLEMENTATION_LOG.md`

### Decision

- P5-01 is PASS_LOCAL as a UAT plan and static guard package.
- P2-18 remains IN_PROGRESS and production remains NO-GO.
- Signed UAT evidence is still required before dashboard data can support a production Go decision.

## 2026-06-27 - Role-Scope UAT Execution Pack

### Scope

- Continued HEU security/governance hardening with P6-04 role-scope UAT.
- Added a role matrix covering ADMIN, BGH, KHTC, Tuyen Sinh, CTHSSV, Dao Tao, Phap Che, Audit and out-of-scope users.
- Defined route families, evidence fields and stop conditions for data exposure, server-side bypass, broad lead access, hard delete and AI approval risk.
- Kept role/workspace permission production checklist IN_PROGRESS until signed UAT evidence exists.

### Files Updated/Added

- `docs/HEU_ROLE_SCOPE_UAT_EXECUTION_PACK_20260627.md`
- `scripts/audit-heu-role-scope-uat-pack.mjs`
- `scripts/audit-ttgdtx-release-gates.mjs`
- `package.json`
- `AGENTS.md`
- `docs/HEU_SYSTEM_BUILD_BACKLOG.md`
- `docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md`
- `docs/HEU_IMPLEMENTATION_LOG.md`

### Decision

- P6-04 is PASS_LOCAL as an execution pack and static guard package.
- It does not approve production access, real-data UAT or broad permissions.
- Signed role-scope UAT evidence remains required before production readiness.

## 2026-06-27 - SQL Object To Master Name Map

### Scope

- Continued HEU data-foundation hardening with P1-04 SQL object mapping.
- Mapped current CRM, short-course, TTGDTX, role/scope, workflow, evidence and dashboard SQL objects to canonical HEU master names.
- Added a local audit to verify key SQL objects still exist and the map remains non-destructive.
- Kept production schema rename/drop/alter and production migration NO-GO.

### Files Updated/Added

- `docs/HEU_SQL_OBJECT_MASTER_MAP_20260627.md`
- `scripts/audit-heu-sql-object-master-map.mjs`
- `scripts/audit-ttgdtx-release-gates.mjs`
- `package.json`
- `AGENTS.md`
- `docs/HEU_SYSTEM_BUILD_BACKLOG.md`
- `docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md`
- `docs/HEU_IMPLEMENTATION_LOG.md`

### Decision

- P1-04 is PASS_LOCAL as a mapping/control artifact.
- No schema rename, drop, alter, production migration or data movement is approved.
- Future migrations should use reviewed compatibility-view or staged migration design.

## 2026-06-27 - HEU Data Foundation Audit

### Scope

- Continued HEU data-foundation hardening with P1-01, P1-02 and P1-03.
- Added current-result boundaries to the data model, data dictionary and role-permission matrix.
- Added a local audit for canonical masters, field naming, sensitive-data rules, role families, permission families and scope boundaries.
- Kept schema change, production migration, broad access and real-data exposure NO-GO.

### Files Updated/Added

- `docs/HEU_DATA_MODEL_V1.md`
- `docs/HEU_DATA_DICTIONARY_V1.md`
- `docs/HEU_ROLE_PERMISSION_MATRIX_V1.md`
- `scripts/audit-heu-data-foundation.mjs`
- `scripts/audit-ttgdtx-release-gates.mjs`
- `package.json`
- `AGENTS.md`
- `docs/HEU_SYSTEM_BUILD_BACKLOG.md`
- `docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md`
- `docs/HEU_IMPLEMENTATION_LOG.md`

### Decision

- P1-01, P1-02 and P1-03 are PASS_LOCAL as control artifacts.
- No production schema change, production migration, production access or real-data UAT is approved.
- Signed UAT and reviewed migrations remain required before production readiness.

## 2026-06-27 - Generic TTGDTX Source/Evidence Guard Closure

### Scope

- Continued data/source-evidence hardening with P1-06.
- Closed the generic source/evidence guard as PASS_LOCAL.
- Reaffirmed that Phu-Xuyen-like material is reference metadata/UAT material only, not product logic.
- Kept production migration, real-data import, source-code renaming and production source metadata changes NO-GO.

### Files Updated/Added

- `docs/TTGDTX_GENERIC_SOURCE_EVIDENCE_AUDIT_20260626.md`
- `scripts/audit-ttgdtx-release-gates.mjs`
- `docs/HEU_SYSTEM_BUILD_BACKLOG.md`
- `docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md`
- `docs/HEU_IMPLEMENTATION_LOG.md`

### Decision

- P1-06 is PASS_LOCAL as a product-code generalization guard.
- Product code remains generic for many centers/partners.
- Signed UAT and reviewed migration design remain required before production use of real source packs.

## 2026-06-27 - Receivable And Payment Status Lifecycle

### Scope

- Continued TTGDTX finance hardening with P4-01 receivable/payment status lifecycle.
- Defined the controlled status chain from P2-03 receivable through P2-10 collection, P2-13/P2-14 reconciliation, P2-15/P2-16 payment request approval and P2-17 payout.
- Added stop conditions for over-collection, cancelled/waived receivables, unresolved invoice decisions, unlocked reconciliation, missing CHECK step, overpayment, duplicate voucher and AI approval.
- Added a local audit to verify SQL status constraints and lifecycle dependencies.

### Files Updated/Added

- `docs/TTGDTX_RECEIVABLE_PAYMENT_STATUS_LIFECYCLE_POLICY_20260627.md`
- `scripts/audit-ttgdtx-receivable-payment-lifecycle.mjs`
- `scripts/audit-ttgdtx-release-gates.mjs`
- `package.json`
- `AGENTS.md`
- `docs/HEU_SYSTEM_BUILD_BACKLOG.md`
- `docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md`
- `docs/HEU_IMPLEMENTATION_LOG.md`

### Decision

- P4-01 is PASS_LOCAL as a lifecycle/control artifact.
- No production migration, production finance operation, real-data import, revenue recognition or payout execution is approved.
- Signed finance UAT remains required before production readiness.

## 2026-06-27 - BGH Operating Dashboard Specification

### Scope

- Continued dashboard/governance hardening with P5-02.
- Defined BGH dashboard as a read-only executive control surface for trends, exceptions, source health, role/scope health and Go/No-Go blockers.
- Required workflow-before-dashboard, locked/approved facts before conclusion and privacy/scope-preserving drill-downs.
- Added a local audit to keep the BGH dashboard specification local-only and UAT-gated.

### Files Updated/Added

- `docs/HEU_BGH_OPERATING_DASHBOARD_SPEC_20260627.md`
- `scripts/audit-heu-bgh-dashboard-spec.mjs`
- `scripts/audit-ttgdtx-release-gates.mjs`
- `package.json`
- `AGENTS.md`
- `docs/HEU_SYSTEM_BUILD_BACKLOG.md`
- `docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md`
- `docs/HEU_IMPLEMENTATION_LOG.md`

### Decision

- P5-02 is PASS_LOCAL as a dashboard specification and control boundary.
- No production BGH dashboard implementation, finance action, production GO or signed-UAT replacement is approved.
- Future dashboard UI must stay read-only and link to scoped source workflows.

## 2026-06-27 - Backup/Restore Dry-Run Evidence Pack

### Scope

- Continued P0-03 production-readiness governance with a backup/restore dry-run evidence pack.
- Added a controlled template for backup ID, restore target, preflight/postflight commands, Step90-Step110 execution, smoke checks, UAT evidence, exception logging and human sign-off.
- Linked the evidence pack into the runbook, production checklist and release-gate audit.
- Kept actual backup execution, restore execution, UAT pass, production migration approval and production GO outside Codex authority.

### Files Updated/Added

- `docs/STEP90_STEP110_BACKUP_RESTORE_DRY_RUN_EVIDENCE_PACK_20260627.md`
- `scripts/audit-ttgdtx-backup-restore-dry-run-pack.mjs`
- `scripts/audit-ttgdtx-release-gates.mjs`
- `package.json`
- `AGENTS.md`
- `docs/STEP90_STEP109_BACKUP_ROLLBACK_DRY_RUN_RUNBOOK.md`
- `docs/HEU_SYSTEM_BUILD_BACKLOG.md`
- `docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md`
- `docs/HEU_IMPLEMENTATION_LOG.md`

### Decision

- P0-03 has a PASS_LOCAL evidence-pack template and local audit coverage, but remains IN_PROGRESS because real backup/restore evidence and human Go/No-Go are not complete.
- Production remains NO-GO.

## 2026-06-27 - Non-TTGDTX/Base Cascade Review

### Scope

- Continued P6 hard-delete/cascade governance with a non-TTGDTX/base cascade review.
- Classified 44 current `on delete cascade` findings outside TTGDTX Step90-Step110.
- Added a local audit so future cascade drift fails until the review is updated.
- Kept SQL migrations, production deletion, conversion, waiver and production GO outside Codex authority.

### Files Updated/Added

- `docs/HEU_NON_TTGDTX_CASCADE_REVIEW_20260627.md`
- `scripts/audit-heu-non-ttgdtx-cascade-review.mjs`
- `docs/HARD_DELETE_AUDIT.md`
- `docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md`
- `docs/HEU_SYSTEM_BUILD_BACKLOG.md`
- `scripts/audit-ttgdtx-release-gates.mjs`
- `package.json`
- `AGENTS.md`
- `docs/HEU_IMPLEMENTATION_LOG.md`

### Decision

- P6-06 is PASS_LOCAL as a review/control artifact.
- Hard-delete review remains IN_PROGRESS because protected non-TTGDTX/base cascade paths still require conversion or written waiver before production.

## 2026-06-27 - TTGDTX User-Friendly Process Labels

### Scope

- Continued usability hardening for TTGDTX process discovery.
- Added a shared process-label helper so business names stay before P2 codes.
- Added TTGDTX process labels into Search suggestions, including Thu hoc phi (P2-10).
- Added an audit to prevent reverting to code-first labels.

### Files Updated/Added

- `lib/ttgdtx-process-labels.ts`
- `scripts/audit-ttgdtx-process-labels.mjs`
- `app/search/page.tsx`
- `docs/TTGDTX_PROCESS_CODE_MAP_20260625.md`
- `docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md`
- `scripts/audit-ttgdtx-release-gates.mjs`
- `package.json`
- `AGENTS.md`
- `docs/HEU_IMPLEMENTATION_LOG.md`

### Decision

- User-friendly TTGDTX process labels are PASS_LOCAL for search/discovery.
- This does not replace signed UAT or production approval.

## 2026-06-27 - TTGDTX Account-Control Scope Decision

### Scope

- Continued real-world TTGDTX control hardening for phong toa/giai toa and collateral giai-chap.
- Explicitly deferred real bank freeze/release workflow from the current payment flow.
- Kept account-control evidence metadata-only through P2-11/P2-19 until owner approval and signed UAT.
- Separated collateral giai-chap into a restricted legal-finance register outside tuition-account release and partner payment.

### Files Updated/Added

- `docs/TTGDTX_ACCOUNT_CONTROL_SCOPE_DECISION_20260627.md`
- `scripts/audit-ttgdtx-account-control-scope-decision.mjs`
- `docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md`
- `scripts/audit-ttgdtx-release-gates.mjs`
- `package.json`
- `AGENTS.md`
- `docs/HEU_IMPLEMENTATION_LOG.md`

### Decision

- Account-control workflow and collateral giai-chap separation are PASS_LOCAL as a scope decision.
- No bank action, collateral release, production data import, production migration, real UAT or production GO is approved.

## 2026-06-27 - TTGDTX Operating-Control UI Strip

### Scope

- Continued TTGDTX linked-spine hardening by reflecting the operating control matrix in key finance screens.
- Added shared operating-control metadata for P2-01 through P2-18.
- Added a reusable UI strip that shows current step, previous/next step, owner, must-have evidence and blocking consequence.
- Mounted the strip on P2-10 Thu hoc phi, P2-15 De nghi thanh toan, P2-17 Chi tien and P2-18 Dashboard ke toan.

### Files Updated/Added

- `lib/ttgdtx-operating-controls.ts`
- `components/ttgdtx/ttgdtx-operating-control-strip.tsx`
- `scripts/audit-ttgdtx-operating-control-ui.mjs`
- `app/ttgdtx/payments/page.tsx`
- `app/ttgdtx/payment-requests/page.tsx`
- `app/ttgdtx/payment-requests/pay/page.tsx`
- `app/ttgdtx/accounting-dashboard/page.tsx`
- `docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md`
- `scripts/audit-ttgdtx-release-gates.mjs`
- `package.json`
- `AGENTS.md`
- `docs/HEU_IMPLEMENTATION_LOG.md`

### Decision

- The operating-control matrix is PASS_LOCAL on key finance UI surfaces.
- Signed browser UAT is still required before any production readiness claim.

## 2026-06-27 - P2-10 Invoice Policy Matrix UI

### Scope

- Continued TTGDTX/9+ pilot hardening with a small P2-10 invoice/chung-tu policy slice.
- Converted the question "thu tien co xuat hoa don khong" into a visible operating matrix on the Thu hoc phi screen.
- Added policy cases for HEU collection, center collection, split collection, offset/adjustment and unknown collection models.
- Kept the rule local-only: no global yes/no answer, no tax/legal final approval and no production GO.

### Files Updated/Added

- `lib/ttgdtx-invoice-policy.ts`
- `components/ttgdtx/ttgdtx-invoice-policy-matrix.tsx`
- `scripts/audit-ttgdtx-invoice-policy.mjs`
- `app/ttgdtx/payments/page.tsx`
- `docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md`
- `docs/HEU_SYSTEM_BUILD_BACKLOG.md`
- `docs/TTGDTX_LINKED_OPERATING_REVIEW_20260625.md`
- `docs/TTGDTX_OPERATING_CONTROL_MATRIX_20260625.md`
- `scripts/audit-ttgdtx-release-gates.mjs`
- `package.json`
- `AGENTS.md`
- `docs/HEU_IMPLEMENTATION_LOG.md`

### Decision

- P4-02/P2-10 invoice policy matrix is PASS_LOCAL in the app and audit suite.
- Signed KHTC/Phap Che UAT is still required before production use.

## 2026-06-27 - TTGDTX Payment Dossier Checklist

### Scope

- Continued TTGDTX/9+ pilot hardening with a small P2-15/P2-17 payment dossier slice.
- Added a shared checklist for BBNT, partner invoice, accepted-period evidence, formula basis and P2-19 source-control checks.
- Mounted the checklist on De nghi thanh toan (P2-15) and Chi tien (P2-17).
- Kept P2-17 duplicate-click and signed payment-flow UAT as production blockers.

### Files Updated/Added

- `components/ttgdtx/ttgdtx-payment-dossier-checklist.tsx`
- `scripts/audit-ttgdtx-payment-dossier-checklist.mjs`
- `app/ttgdtx/payment-requests/page.tsx`
- `app/ttgdtx/payment-requests/pay/page.tsx`
- `docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md`
- `docs/HEU_SYSTEM_BUILD_BACKLOG.md`
- `docs/TTGDTX_LINKED_OPERATING_REVIEW_20260625.md`
- `scripts/audit-ttgdtx-release-gates.mjs`
- `package.json`
- `AGENTS.md`
- `docs/HEU_IMPLEMENTATION_LOG.md`

### Decision

- BBNT/partner-invoice payment dossier visibility is PASS_LOCAL.
- Signed UAT is still required before production payment use.

## 2026-06-27 - P2-17 Duplicate Payout Guard

### Scope

- Continued TTGDTX/9+ pilot hardening with a small P2-17 duplicate-payout guard slice.
- Added a visible guard panel on Chi tien (P2-17) for pending submit, RPC-only write path, row lock, normalized voucher guard, overpayment block and P2-19 evidence blockers.
- Added a local audit that checks the UI guard, submit button pending state, server action voucher/evidence requirements, SQL row lock/direct-write revoke/unique voucher guard and UAT runbook cases.
- Kept P2-17 production checklist IN_PROGRESS because signed duplicate payout UAT is still required.

### Files Updated/Added

- `components/ttgdtx/ttgdtx-payout-duplicate-guard.tsx`
- `scripts/audit-ttgdtx-payout-duplicate-guard.mjs`
- `app/ttgdtx/payment-requests/pay/page.tsx`
- `docs/P2_17_DUPLICATE_PAYOUT_UAT_RUNBOOK.md`
- `docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md`
- `docs/HEU_SYSTEM_BUILD_BACKLOG.md`
- `scripts/audit-ttgdtx-release-gates.mjs`
- `package.json`
- `AGENTS.md`
- `docs/HEU_IMPLEMENTATION_LOG.md`

### Decision

- P2-17 duplicate, overpay, direct-write and missing-evidence guards are PASS_LOCAL.
- Production remains NO-GO until the runbook is executed with controlled UAT data and signed by KHTC/Audit.

## 2026-06-27 - P2-18 Dashboard Read-Only Guard

### Scope

- Continued TTGDTX/9+ pilot hardening with a small P2-18 accounting dashboard guard slice.
- Added a visible read-only guard on the dashboard for no-write behavior, source-step comparison, role-scope access, contract-only denial and exception routing back to source workflows.
- Added a local audit that checks the UI guard, dashboard mount, access gate order, no contract-read finance access, UAT runbook cases and production checklist status.
- Kept P2-18 production checklist IN_PROGRESS because signed browser UAT is still required.

### Files Updated/Added

- `components/ttgdtx/ttgdtx-dashboard-readonly-guard.tsx`
- `scripts/audit-ttgdtx-dashboard-readonly-guard.mjs`
- `app/ttgdtx/accounting-dashboard/page.tsx`
- `docs/P2_18_ACCOUNTING_DASHBOARD_UAT_RUNBOOK.md`
- `docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md`
- `docs/HEU_SYSTEM_BUILD_BACKLOG.md`
- `scripts/audit-ttgdtx-release-gates.mjs`
- `package.json`
- `AGENTS.md`
- `docs/HEU_IMPLEMENTATION_LOG.md`

### Decision

- P2-18 read-only, role-scope and source-comparison guard is PASS_LOCAL.
- Production remains NO-GO until signed dashboard UAT proves role scope and source totals.

## 2026-06-27 - TTGDTX Audit Trail Guard

### Scope

- Continued TTGDTX/9+ pilot hardening with a small audit-log traceability slice.
- Added a visible TTGDTX audit trail guard on `/audit` for P2-03, P2-10, P2-13/P2-14, P2-15/P2-16, P2-17 and P2-11/P2-19 evidence.
- Added a local audit that checks the guard, read-only audit page behavior, required UAT cases AUD-01 through AUD-06, audit-log UAT runbook and production checklist status.
- Kept Audit log completeness IN_PROGRESS because signed UAT must still prove real create/update/approve/pay audit rows.

### Files Updated/Added

- `components/audit/ttgdtx-audit-trail-guard.tsx`
- `scripts/audit-ttgdtx-audit-trail-guard.mjs`
- `app/audit/page.tsx`
- `docs/TTGDTX_AUDIT_LOG_UAT_RUNBOOK.md`
- `docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md`
- `scripts/audit-ttgdtx-release-gates.mjs`
- `package.json`
- `AGENTS.md`
- `docs/HEU_IMPLEMENTATION_LOG.md`

### Decision

- TTGDTX audit trail guard is PASS_LOCAL.
- Production remains NO-GO until signed UAT proves actual audit rows for create, update, approve and pay events.

## 2026-06-27 - Step90-Step110 Migration Order Sign-Off Guard

### Scope

- Continued TTGDTX/9+ pilot hardening with a small migration-order control slice.
- Added a local sign-off guard for Step90-Step110 so backup, restore dry-run,
  Step97 conditional review, Step100 formal pilot waiver, Step109 access UAT,
  Step110 privacy review and signed owner approval stay explicit.
- Added a local audit that checks the guard document, migration order audit,
  production checklist, backlog, AGENTS handoff list and release-gate audit.
- Kept migration order IN_PROGRESS because signed approval and real
  backup/restore evidence are still required before production.

### Files Updated/Added

- `docs/STEP90_STEP110_MIGRATION_ORDER_SIGNOFF_GUARD_20260627.md`
- `scripts/audit-ttgdtx-migration-order-guard.mjs`
- `docs/MIGRATION_ORDER_AUDIT.md`
- `docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md`
- `docs/HEU_SYSTEM_BUILD_BACKLOG.md`
- `scripts/audit-ttgdtx-release-gates.mjs`
- `package.json`
- `AGENTS.md`
- `docs/HEU_IMPLEMENTATION_LOG.md`

### Decision

- Step90-Step110 migration-order guard is PASS_LOCAL only after local audits
  pass.
- Production remains NO-GO; do not run production migration from Codex/chat.

## 2026-06-27 - TTGDTX Production Readiness Guard

### Scope

- Continued TTGDTX/9+ pilot hardening with a small app visibility slice.
- Added a read-only Go/No-Go guard to the TTGDTX landing page so production
  blockers are visible inside the app, not only in documents.
- The guard surfaces backup/restore, Step90-Step110 sign-off, Step97/Step100
  decisions, P2-17 payout UAT, P2-18 dashboard UAT, Step109 role-scope UAT,
  Step110 privacy review, audit-log, hard-delete and rollback blockers.
- Added a local audit that checks the guard, page mount, production checklist,
  backlog, AGENTS handoff list and release-gate audit.

### Files Updated/Added

- `components/ttgdtx/ttgdtx-production-readiness-guard.tsx`
- `scripts/audit-ttgdtx-production-readiness-guard.mjs`
- `app/ttgdtx/page.tsx`
- `docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md`
- `docs/HEU_SYSTEM_BUILD_BACKLOG.md`
- `scripts/audit-ttgdtx-release-gates.mjs`
- `package.json`
- `AGENTS.md`
- `docs/HEU_IMPLEMENTATION_LOG.md`

### Decision

- TTGDTX production readiness guard is PASS_LOCAL only after local audits pass.
- Production remains NO-GO until backup, signed UAT and owner approval exist.

## 2026-06-27 - P0-19 Legal/Tuition Finance Gate Guard

### Scope

- Continued TTGDTX/9+ pilot hardening with a small P0-19 clarity slice.
- Added a visible P0-19 guard to P2-05 gate and P2-03 receivables so users see
  that legal basis, tuition policy and finance permission must all be ready
  before creating receivables.
- The guard clarifies that Step100 is sandbox/UAT only and cannot be treated as
  production legal, tuition, revenue or payout authority.
- Added a local audit that checks the guard, both page mounts, production
  checklist, backlog, AGENTS handoff list and release-gate audit.

### Files Updated/Added

- `components/ttgdtx/ttgdtx-p019-gate-guard.tsx`
- `scripts/audit-ttgdtx-p019-gate-guard.mjs`
- `app/ttgdtx/gate/page.tsx`
- `app/ttgdtx/receivables/page.tsx`
- `docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md`
- `docs/HEU_SYSTEM_BUILD_BACKLOG.md`
- `scripts/audit-ttgdtx-release-gates.mjs`
- `package.json`
- `AGENTS.md`
- `docs/HEU_IMPLEMENTATION_LOG.md`

### Decision

- P0-19 legal/tuition finance gate guard is PASS_LOCAL only after local audits
  pass.
- Signed legal/finance UAT is still required before production receivable use.

## 2026-06-27 - TTGDTX Core Operating Spine Coverage

### Scope

- Continued TTGDTX/9+ pilot hardening with a small linked-spine UI slice.
- Added the operating-control strip to the remaining core TTGDTX screens:
  P2-01, P2-02, P2-05, P2-03, P2-13, P2-14 and P2-16.
- Added P2-05 into the operating-control metadata between P2-02 and P2-03 so
  the P0-19 gate is visible in the chain before receivable creation.
- Expanded `audit:ttgdtx-operating-control-ui` and release gates to require
  chain position, owner, must-have conditions and blockers across the full
  core spine from P2-01 through P2-18.

### Files Updated/Added

- `lib/ttgdtx-operating-controls.ts`
- `app/ttgdtx/page.tsx`
- `app/ttgdtx/tuition/page.tsx`
- `app/ttgdtx/gate/page.tsx`
- `app/ttgdtx/receivables/page.tsx`
- `app/ttgdtx/reconciliation/page.tsx`
- `app/ttgdtx/reconciliation/review/page.tsx`
- `app/ttgdtx/payment-requests/review/page.tsx`
- `docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md`
- `scripts/audit-ttgdtx-operating-control-ui.mjs`
- `scripts/audit-ttgdtx-release-gates.mjs`
- `docs/HEU_IMPLEMENTATION_LOG.md`

### Decision

- TTGDTX linked operating spine is PASS_LOCAL for core screen visibility after
  local audits pass.
- Signed role/workflow UAT is still required before production use.

## 2026-06-27 - Role Scope UAT UI Guard

### Scope

- Continued HEU security/governance hardening with a small Settings UI slice.
- Added a visible read-only P6-04 role-scope UAT guard to the user-scope
  enforcement panel.
- The guard states PASS_LOCAL only, signed UAT required, production NO-GO until
  signed evidence exists, and no passwords, OTPs, service-role keys, CCCD, bank
  accounts or raw student identity data should be pasted into UAT notes.
- Extended role-scope and release-gate audits so the UI guard cannot be removed
  silently.

### Files Updated

- `components/settings/user-scope-enforcement-panel.tsx`
- `scripts/audit-heu-role-scope-uat-pack.mjs`
- `scripts/audit-ttgdtx-release-gates.mjs`
- `docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md`
- `docs/HEU_SYSTEM_BUILD_BACKLOG.md`
- `docs/HEU_IMPLEMENTATION_LOG.md`

### Decision

- P6-04 role-scope UI guard is PASS_LOCAL after local audits pass.
- Signed role-scope UAT remains required before production readiness.

## 2026-06-27 - Audit Log UAT Boundary Guard

### Scope

- Continued TTGDTX/9+ pilot hardening with a small audit-log boundary slice.
- Added an explicit P6-03 audit-log UAT boundary to the audit trail guard.
- The guard keeps audit-log status PASS_LOCAL only, blocks production GO until
  signed audit-log evidence exists, and warns against putting passwords, OTPs,
  service-role keys, CCCD, bank accounts or raw student identity data in audit
  screenshots, UAT notes or Codex prompts.
- Tightened local audits and release gates so audit-log guard coverage includes
  the signed-UAT and no-secret boundaries.

### Files Updated

- `components/audit/ttgdtx-audit-trail-guard.tsx`
- `scripts/audit-ttgdtx-audit-trail-guard.mjs`
- `scripts/audit-ttgdtx-release-gates.mjs`
- `docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md`
- `docs/HEU_SYSTEM_BUILD_BACKLOG.md`
- `docs/HEU_IMPLEMENTATION_LOG.md`

### Decision

- P6-03 audit-log UAT boundary is PASS_LOCAL after local audits pass.
- Signed audit-log UAT remains required before production readiness.

## 2026-06-27 - Hard Delete Boundary Guard

### Scope

- Continued P6 hard-delete/cascade governance with a small Audit page slice.
- Added a visible hard-delete boundary guard on `/audit` for P6-06.
- The guard states PASS_LOCAL only, production NO-GO until non-TTGDTX/base
  cascade paths are converted or waived with written approval, no hard-delete
  for finance/evidence/approval/payment/lead/audit rows, and no rollback proof
  by hard-delete, truncate, drop table or cascade.
- Added `audit:hard-delete-boundary-guard` and release-gate coverage so the UI
  boundary, checklist and backlog stay aligned.

### Files Updated/Added

- `components/audit/hard-delete-boundary-guard.tsx`
- `app/audit/page.tsx`
- `scripts/audit-hard-delete-boundary-guard.mjs`
- `scripts/audit-ttgdtx-release-gates.mjs`
- `docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md`
- `docs/HEU_SYSTEM_BUILD_BACKLOG.md`
- `docs/HEU_IMPLEMENTATION_LOG.md`
- `package.json`
- `AGENTS.md`

### Decision

- P6-06 hard-delete boundary guard is PASS_LOCAL after local audits pass.
- Non-TTGDTX/base cascade conversion or written waiver remains required before
  production readiness.

## 2026-06-27 - Git Cleanup Snapshot Refresh

### Scope

- Refreshed `docs/GIT_CLEANUP_ANALYSIS.md` with a current 2026-06-27 snapshot.
- Preserved the original 2026-06-22 dirty-worktree inventory as historical
  evidence instead of deleting or rewriting it.
- Recorded that the local worktree was clean before the addendum, on
  `hardening/ttgdtx-9plus-pilot`, ahead of origin by 58 commits at snapshot
  time, and that work should continue in small reviewed commits.
- Updated the production checklist row so it no longer reads like the old dirty
  list is current, while keeping final owner review/push required.

### Files Updated

- `docs/GIT_CLEANUP_ANALYSIS.md`
- `docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md`
- `docs/HEU_IMPLEMENTATION_LOG.md`

### Decision

- Git cleanup status is current for local review, but production remains NO-GO.

## 2026-06-27 - Supabase Backup Restore UI Guard

### Scope

- Continued P0-03 production-readiness governance with a small Supabase check
  page slice.
- Added a visible P0-03 backup/restore dry-run guard for ADMIN users on
  `/settings/supabase-check`.
- The guard states PASS_LOCAL only, production remains NO-GO until real backup
  evidence, restore evidence, preflight/postflight results and owner sign-off
  exist, and no production migration may be run from Codex/chat.
- It also repeats the no-secret boundary for passwords, OTPs, service-role keys,
  bank credentials, raw student PII, raw CCCD, raw phone numbers and raw
  payment data.
- Extended backup/restore and release-gate audits so the UI guard, checklist
  and backlog stay aligned.

### Files Updated/Added

- `components/settings/supabase-backup-restore-guard.tsx`
- `app/settings/supabase-check/page.tsx`
- `scripts/audit-ttgdtx-backup-restore-dry-run-pack.mjs`
- `scripts/audit-ttgdtx-release-gates.mjs`
- `docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md`
- `docs/HEU_SYSTEM_BUILD_BACKLOG.md`
- `docs/HEU_IMPLEMENTATION_LOG.md`

### Decision

- Supabase backup/restore UI guard is PASS_LOCAL after local audits pass.
- Actual backup/restore evidence and owner sign-off remain required before
  production readiness.

## 2026-06-27 - Internal UAT Sign-Off Guard

### Scope

- Continued production-readiness hardening with a small TTGDTX landing page
  slice.
- Added a visible internal UAT sign-off guard below the production readiness
  guard.
- The guard lists the synthetic account matrix, required UAT evidence docs and
  states PASS_LOCAL only.
- It keeps production NO-GO until signed multi-account UAT evidence exists and
  repeats the no-secret boundary for passwords, OTPs, service-role keys,
  student PII, CCCD, phone numbers, bank accounts and raw payment evidence.
- Extended production-readiness and release-gate audits so the UAT guard,
  checklist and backlog stay aligned.

### Files Updated/Added

- `components/ttgdtx/ttgdtx-uat-signoff-guard.tsx`
- `app/ttgdtx/page.tsx`
- `scripts/audit-ttgdtx-production-readiness-guard.mjs`
- `scripts/audit-ttgdtx-release-gates.mjs`
- `docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md`
- `docs/HEU_SYSTEM_BUILD_BACKLOG.md`
- `docs/HEU_IMPLEMENTATION_LOG.md`

### Decision

- Internal UAT sign-off guard is PASS_LOCAL after local audits pass.
- Signed multi-account UAT remains required before production readiness.

## 2026-06-27 - Production Owner Sign-Off Pack

### Scope

- Continued final production-readiness packaging with a small owner sign-off
  slice.
- Added `docs/TTGDTX_PRODUCTION_OWNER_SIGNOFF_PACK_20260627.md` as the single
  owner-facing pack for the remaining final GO/NO-GO decision.
- The pack lists required owner decisions for backup/restore, Step90-Step110
  migration order, P0-19 legal/finance gate, P2-17 payout, P2-18 dashboard,
  role/workspace, audit-log, hard-delete/cascade and internal multi-account UAT.
- It keeps production NO-GO until every required owner signs GO and no stop
  condition remains open.
- Added `audit:ttgdtx-production-owner-signoff-pack` and release-gate coverage
  so the pack, checklist, backlog and AGENTS handoff stay aligned.

### Files Updated/Added

- `docs/TTGDTX_PRODUCTION_OWNER_SIGNOFF_PACK_20260627.md`
- `scripts/audit-ttgdtx-production-owner-signoff-pack.mjs`
- `scripts/audit-ttgdtx-release-gates.mjs`
- `docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md`
- `docs/HEU_SYSTEM_BUILD_BACKLOG.md`
- `docs/HEU_IMPLEMENTATION_LOG.md`
- `package.json`
- `AGENTS.md`

### Decision

- Owner sign-off pack is PASS_LOCAL after local audits pass.
- Signed final GO/NO-GO decision remains required before production readiness.

## 2026-06-27 - Controlled Evidence Redaction Pack

### Scope

- Continued production-readiness hardening with a cross-cutting evidence
  intake and redaction slice.
- Added `docs/HEU_CONTROLLED_EVIDENCE_REDACTION_PACK_20260627.md` to define
  evidence classes, no-secret boundaries, redaction rules, intake workflow,
  stop conditions and local preflight commands.
- Added `audit:heu-controlled-evidence-redaction-pack` and release-gate
  coverage so owner sign-off, checklist, backlog and AGENTS handoff cannot
  drift away from the redaction control.
- Kept raw backup, UAT, bank, voucher, CCCD, student PII and payment evidence
  outside Git/Codex/chat; only redacted copies or non-secret references may
  enter tracked docs.

### Files Updated/Added

- `docs/HEU_CONTROLLED_EVIDENCE_REDACTION_PACK_20260627.md`
- `scripts/audit-heu-controlled-evidence-redaction-pack.mjs`
- `scripts/audit-ttgdtx-production-owner-signoff-pack.mjs`
- `scripts/audit-ttgdtx-release-gates.mjs`
- `docs/TTGDTX_PRODUCTION_OWNER_SIGNOFF_PACK_20260627.md`
- `docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md`
- `docs/HEU_SYSTEM_BUILD_BACKLOG.md`
- `docs/HEU_IMPLEMENTATION_LOG.md`
- `package.json`
- `AGENTS.md`

### Decision

- Controlled evidence redaction pack is PASS_LOCAL after local audits pass.
- Production remains NO-GO until controlled evidence is actually collected,
  reviewed, signed and approved by the required human owners.

## 2026-06-27 - Controlled Evidence UI Guard

### Scope

- Continued P0-10 with a small UI slice on `/audit`.
- Added `components/audit/controlled-evidence-redaction-guard.tsx` so Audit
  and IT/Data users see the no-secret/no-raw-evidence boundary before reviewing
  audit logs or hard-delete findings.
- Mounted the guard above the existing TTGDTX audit-trail and hard-delete
  guards.
- Extended the redaction-pack audit and release-gate audit so the UI guard,
  checklist and backlog stay aligned.

### Files Updated/Added

- `components/audit/controlled-evidence-redaction-guard.tsx`
- `app/audit/page.tsx`
- `scripts/audit-heu-controlled-evidence-redaction-pack.mjs`
- `scripts/audit-ttgdtx-release-gates.mjs`
- `docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md`
- `docs/HEU_SYSTEM_BUILD_BACKLOG.md`
- `docs/HEU_IMPLEMENTATION_LOG.md`

### Decision

- Controlled evidence UI guard is PASS_LOCAL after local audits pass.
- It is read-only and does not approve evidence, UAT, finance action or
  production GO.

## 2026-06-27 - TTGDTX Production Execution Queue

### Scope

- Continued production-readiness hardening with a small TTGDTX landing page
  slice.
- Added `components/ttgdtx/ttgdtx-production-execution-queue.tsx` to show the
  ordered execution path: P0-10 redaction, P0-03 backup/restore,
  Step90-Step110 migration order, P6-04 role UAT, P0-19 legal/finance gate,
  P2-17 duplicate payout UAT, P2-18 dashboard UAT, audit/hard-delete controls
  and final owner Go/No-Go.
- Mounted it after the internal UAT sign-off guard and before the operating
  control strip.
- Extended production-readiness and release-gate audits so the queue, checklist
  and backlog stay aligned.

### Files Updated/Added

- `components/ttgdtx/ttgdtx-production-execution-queue.tsx`
- `app/ttgdtx/page.tsx`
- `scripts/audit-ttgdtx-production-readiness-guard.mjs`
- `scripts/audit-ttgdtx-release-gates.mjs`
- `docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md`
- `docs/HEU_SYSTEM_BUILD_BACKLOG.md`
- `docs/HEU_IMPLEMENTATION_LOG.md`

### Decision

- TTGDTX production execution queue is PASS_LOCAL after local audits pass.
- It is read-only and does not approve UAT, finance action, migration or
  production GO.

## 2026-06-27 - P2-18 Dashboard UAT Evidence Checklist

### Scope

- Continued P2-18 production-readiness hardening with a small dashboard page
  slice.
- Added `components/ttgdtx/ttgdtx-dashboard-uat-evidence-checklist.tsx` below
  the read-only guard on `/ttgdtx/accounting-dashboard`.
- The checklist lists required redacted evidence for P2-18-01 through
  P2-18-08, including source comparison, control-board variance, role denial,
  exception routing, movement rows and no-write verification.
- It references the controlled evidence redaction pack and repeats that raw
  student PII, CCCD, bank accounts, vouchers, passwords, OTPs and service-role
  keys stay outside Git/Codex/chat.
- Extended dashboard and release-gate audits so the checklist, production
  checklist, backlog and runbook stay aligned.

### Files Updated/Added

- `components/ttgdtx/ttgdtx-dashboard-uat-evidence-checklist.tsx`
- `app/ttgdtx/accounting-dashboard/page.tsx`
- `scripts/audit-ttgdtx-dashboard-readonly-guard.mjs`
- `scripts/audit-ttgdtx-release-gates.mjs`
- `docs/P2_18_ACCOUNTING_DASHBOARD_UAT_RUNBOOK.md`
- `docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md`
- `docs/HEU_SYSTEM_BUILD_BACKLOG.md`
- `docs/HEU_IMPLEMENTATION_LOG.md`

### Decision

- P2-18 UAT evidence checklist is PASS_LOCAL after local audits pass.
- Signed browser UAT and owner approval are still required before P2-18 can be
  marked production-ready.
