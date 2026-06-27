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
