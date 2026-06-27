# HEU System Build Backlog

Mode: production-system backlog with risk controls. AI/Codex may draft, check and implement local safe changes, but may not approve business decisions or deploy production.

## P0 - Repo Stabilization

| ID | Item | Owner | Status | Gate |
|---|---|---|---|---|
| P0-01 | Keep branch `hardening/ttgdtx-9plus-pilot` as working branch | IT/Data | PASS_LOCAL | No force push, no main/master push |
| P0-02 | Split dirty working tree by scope: docs, TTGDTX UI, TTGDTX SQL, CRM shared, audit scripts | IT/Data | PASS_LOCAL | `docs/GIT_CLEANUP_ANALYSIS.md`; `npm.cmd run audit:heu-git-hygiene`; clean local status verified before each slice; current exact ahead count must be verified live with `git status --short --branch` |
| P0-03 | Maintain migration order and production No-Go checklist | IT/Data + BGH | IN_PROGRESS | `docs/STEP90_STEP110_BACKUP_RESTORE_DRY_RUN_EVIDENCE_PACK_20260627.md`; `components/settings/supabase-backup-restore-guard.tsx`; backup/restore execution evidence checklist; `docs/STEP90_STEP110_MIGRATION_ORDER_SIGNOFF_GUARD_20260627.md`; `npm.cmd run audit:ttgdtx-backup-restore-dry-run-pack`; `npm.cmd run audit:ttgdtx-migration-order-guard`; actual backup/restore evidence still required before production |
| P0-04 | Keep generated logs out of commits | IT/Data | PASS_LOCAL | `.gitignore` covers logs/env; no tracked `.log`/`.env`; no unignored generated files in current status |
| P0-05 | Record every phase in `HEU_IMPLEMENTATION_LOG.md` | Codex + IT/Data | IN_PROGRESS | Log before conclusion |
| P0-06 | Freeze code edits until inventory/backlog is current | Codex + IT/Data | PASS_LOCAL | Current P0 docs updated after `28b8e7d` |
| P0-08 | Expose TTGDTX production readiness guard in app | IT/Data + Process owners | PASS_LOCAL | `components/ttgdtx/ttgdtx-production-readiness-guard.tsx`; `components/ttgdtx/ttgdtx-uat-signoff-guard.tsx`; `components/ttgdtx/ttgdtx-production-execution-queue.tsx`; `npm.cmd run audit:ttgdtx-production-readiness-guard`; production remains NO-GO until backup, signed UAT and owner approval |
| P0-09 | Owner Go/No-Go sign-off pack | BGH + IT/Data + KHTC + PHAP_CHE + Audit | PASS_LOCAL | `docs/TTGDTX_PRODUCTION_OWNER_SIGNOFF_PACK_20260627.md`; `components/ttgdtx/ttgdtx-owner-go-no-go-evidence-checklist.tsx`; `npm.cmd run audit:ttgdtx-production-owner-signoff-pack`; owner GO/NO-GO still required |
| P0-10 | Controlled evidence redaction/intake | IT/Data + Audit | PASS_LOCAL | `docs/HEU_CONTROLLED_EVIDENCE_REDACTION_PACK_20260627.md`; `components/audit/controlled-evidence-redaction-guard.tsx`; `npm.cmd run audit:heu-controlled-evidence-redaction-pack`; raw evidence stays outside Git and only redacted/non-secret references enter docs/Codex/chat |
| P0-11 | Role permission soft revoke | IT/Data + ADMIN | PASS_LOCAL | Step109 is migration candidate only; settings uses INACTIVE/upsert instead of hard delete |

## P1 - Data Foundation

| ID | Item | Owner | Status | Gate |
|---|---|---|---|---|
| P1-01 | Define `HEU_DATA_MODEL_V1.md` | IT/Data + Process owners | PASS_LOCAL | Canonical masters/lifecycle defined; `npm.cmd run audit:heu-data-foundation`; no production schema change |
| P1-02 | Define `HEU_DATA_DICTIONARY_V1.md` | IT/Data | PASS_LOCAL | Field/master naming and sensitive-data rules defined; `npm.cmd run audit:heu-data-foundation`; no production data exposure |
| P1-03 | Define `HEU_ROLE_PERMISSION_MATRIX_V1.md` | IT/Data + BGH | PASS_LOCAL | Baseline roles/permission families/scope boundaries defined; `npm.cmd run audit:heu-data-foundation`; signed access UAT still required |
| P1-04 | Map existing SQL objects to master names | IT/Data | PASS_LOCAL | `docs/HEU_SQL_OBJECT_MASTER_MAP_20260627.md`; `npm.cmd run audit:heu-sql-object-master-map`; no production schema rename/drop/alter |
| P1-05 | Build anonymized real-like UAT pack for Phu-Xuyen-like cases | KHTC + IT/Data + Audit | PASS_LOCAL | `fixtures/ttgdtx/synthetic_real_like_uat_pack_20260627.json`; `npm.cmd run audit:ttgdtx-synthetic-uat-pack`; no raw PII/bank data |
| P1-06 | Keep TTGDTX source/evidence model generic across centers | IT/Data | PASS_LOCAL | `docs/TTGDTX_GENERIC_SOURCE_EVIDENCE_AUDIT_20260626.md`; `npm.cmd run audit:ttgdtx-generic-source-evidence`; reference-center material stays metadata/UAT only |

## P2 - TTGDTX/9+ Pilot

| ID | Item | Owner | Status | Gate |
|---|---|---|---|---|
| P2-00 | P0-19 major legal/tuition finance gate | Dao tao + Phap Che + KHTC + IT/Data | PASS_LOCAL | Step97 blocks P2-03 when legal/tuition/finance gate is not ready; Step100 sandbox pilot open requires explicit session flag; `components/ttgdtx/ttgdtx-p019-gate-guard.tsx`; `components/ttgdtx/ttgdtx-p019-uat-evidence-checklist.tsx`; `npm.cmd run audit:ttgdtx-p019-gate-guard`; signed legal/finance UAT still required |
| P2-01 | Contract/partner master | Phap Che + KHTC | BUILT_INTERNAL | Human approval for legal records |
| P2-02 | Tuition policy master | KHTC | BUILT_INTERNAL | Approved policy version |
| P2-03 | Student receivables | KHTC | PASS_LOCAL | Step90 is migration candidate only; scoped RLS, no direct delete policy, active duplicate guard; signed UAT still required |
| P2-04 | TTGDTX operating simulation | KHTC + IT/Data | PASS_LOCAL | Read-only simulation route; no receivable, collection or payout write |
| P2-05 | Receivable gate | KHTC + IT/Data | PASS_LOCAL | Gate before posting; Step91 is migration candidate only |
| P2-06 | Import staging/control | IT/Data + KHTC | PASS_LOCAL | Step92 is migration candidate only; source file registry and validation |
| P2-07 | Import issue routing | IT/Data + KHTC + owners | PASS_LOCAL | Step93 is migration candidate only; classify errors by owner department |
| P2-08 | Import issue resolution | Owner departments + KHTC + Audit | PASS_LOCAL | Step94 is migration candidate only; server action allowlists workflow actions |
| P2-09 | Department workload board | Department leads + BGH + Audit | PASS_LOCAL | Step95 is migration candidate only; board is read/control, not source edit |
| P2-11 | Source/legal/evidence control | KHTC + Phap Che + IT/Data + Audit | PASS_LOCAL | Step98 is migration candidate only; scoped RLS, no direct delete policy, source links restrict-protected; signed UAT still required |
| P2-12 | TTGDTX master/dropdown control | Tuyen sinh + Phap Che + IT/Data | PASS_LOCAL | Step99 is migration candidate only; scoped RLS, no direct delete policy, source links restrict-protected; signed UAT still required |
| P2-10 | Tuition collection | KHTC | PASS_LOCAL | Step96 is migration candidate only; invoice/receipt decision captured per payment; P2-10 invoice matrix is visible on the collection page |
| P2-13 | Reconciliation | KHTC + Audit | PASS_LOCAL | Step101 is migration candidate only; blocks unresolved invoice/receipt decisions; Step102/Step103 retired no-op |
| P2-14 | Reconciliation review/lock | KHTC + Audit + BGH | PASS_LOCAL | Step104 is migration candidate only; cannot review/approve/lock unresolved invoice/receipt lines |
| P2-15 | Partner payment request | KHTC + Phap Che | PASS_LOCAL | Step105 is migration candidate only; BBNT/partner invoice dossier required, no unresolved collection invoice lines; `components/ttgdtx/ttgdtx-payment-dossier-checklist.tsx`; `npm.cmd run audit:ttgdtx-payment-dossier-checklist` |
| P2-16 | Partner payment request approval | KHTC + Audit + BGH | PASS_LOCAL | Step106 is migration candidate only; must CHECK before APPROVE and still does not pay money |
| P2-17 | Partner payout record | KHTC + BGH | PASS_LOCAL | Step107 is migration candidate only; record after P2-16 APPROVED, no duplicate voucher, no overpayment, shared payment dossier checklist visible, `components/ttgdtx/ttgdtx-payout-uat-evidence-checklist.tsx`, and `npm.cmd run audit:ttgdtx-payout-duplicate-guard` |
| P2-18 | Accounting dashboard | KHTC + BGH | PASS_LOCAL | Step108 is migration candidate only; read-only rollup, no money movement; `components/ttgdtx/ttgdtx-dashboard-readonly-guard.tsx`; `components/ttgdtx/ttgdtx-dashboard-uat-evidence-checklist.tsx`; `npm.cmd run audit:ttgdtx-dashboard-readonly-guard` |
| P2-19 | Real-data evidence metadata | IT/Data + Audit | PASS_LOCAL | Step110 is migration candidate only; metadata-only, preflight/postflight/debug guard added, no raw sensitive import |

## P3 - CRM/Tuyen Sinh

| ID | Item | Owner | Status | Gate |
|---|---|---|---|---|
| P3-01 | Lead lifecycle standard | Tuyen sinh | EXISTING_PARTIAL | No raw form dump into AI |
| P3-02 | Lead-to-student handover | Tuyen sinh + CTHSSV + Dao tao | PASS_LOCAL | `docs/HEU_LEAD_TO_STUDENT_HANDOVER_POLICY_20260627.md`; `npm.cmd run audit:heu-lead-handover-policy`; signed role-scope UAT still required |
| P3-03 | Finance handover trigger | Tuyen sinh + KHTC | PASS_LOCAL | TTGDTX lead quick-fix is scoped, permissioned and audited; P2-03 remains final receivable gate |

## P4 - Finance/Receivable

| ID | Item | Owner | Status | Gate |
|---|---|---|---|---|
| P4-01 | Receivable/payment status lifecycle | KHTC | PASS_LOCAL | `docs/TTGDTX_RECEIVABLE_PAYMENT_STATUS_LIFECYCLE_POLICY_20260627.md`; `npm.cmd run audit:ttgdtx-receivable-payment-lifecycle`; signed finance UAT still required |
| P4-02 | Invoice/receipt policy matrix | KHTC + Phap Che | PASS_LOCAL | `lib/ttgdtx-invoice-policy.ts`; `components/ttgdtx/ttgdtx-invoice-policy-matrix.tsx`; `npm.cmd run audit:ttgdtx-invoice-policy`; needs signed KHTC/Phap Che UAT |
| P4-03 | Bank statement handling policy | KHTC + IT/Data | PASS_LOCAL | `docs/TTGDTX_BANK_RECEIPT_BATCH_POLICY_20260627.md`; no raw bank data in repo/chat; duplicate fingerprint case in synthetic pack |
| P4-04 | VND money input/display normalization | IT/Data + KHTC | PASS_LOCAL | `lib/vnd-money.ts`; `npm.cmd run audit:vnd-money-format`; P2-10/P2-17 display `1.000.000 đ` |
| P4-05 | Period lock and adjustment policy | KHTC + Audit | PASS_LOCAL | `docs/TTGDTX_PERIOD_LOCK_ADJUSTMENT_POLICY_20260627.md`; `npm.cmd run audit:ttgdtx-period-lock-policy`; human adjustment approval required |

## P5 - Dashboard/BGH

| ID | Item | Owner | Status | Gate |
|---|---|---|---|---|
| P5-01 | TTGDTX accounting dashboard UAT | KHTC + BGH | PASS_LOCAL | `docs/TTGDTX_ACCOUNTING_DASHBOARD_ROLE_UAT_PLAN_20260627.md`; `npm.cmd run audit:ttgdtx-accounting-dashboard-uat-plan`; signed browser UAT still required |
| P5-02 | BGH operating dashboard specification | BGH + IT/Data | PASS_LOCAL | `docs/HEU_BGH_OPERATING_DASHBOARD_SPEC_20260627.md`; `components/master-control/production-readiness-blocker-summary.tsx`; `npm.cmd run audit:heu-bgh-dashboard-spec`; dashboard stays read-only and UAT-gated |

## P6 - Audit/Governance

| ID | Item | Owner | Status | Gate |
|---|---|---|---|---|
| P6-01 | Static hard-delete audit | IT/Data | PASS_LOCAL | Keep audit script green |
| P6-02 | TTGDTX cascade audit | IT/Data | PASS_LOCAL | No `on delete cascade` in Step90-Step110 |
| P6-03 | TTGDTX audit-log coverage | IT/Data | PASS_LOCAL | New TTGDTX write tables need triggers; `components/audit/ttgdtx-audit-trail-guard.tsx`; `components/audit/ttgdtx-audit-log-uat-evidence-checklist.tsx`; `npm.cmd run audit:ttgdtx-audit-log`; `npm.cmd run audit:ttgdtx-audit-trail-guard`; signed UAT still required |
| P6-04 | Role-scope UAT | IT/Data + Process owners | PASS_LOCAL | `docs/HEU_ROLE_SCOPE_UAT_EXECUTION_PACK_20260627.md`; `components/settings/user-scope-enforcement-panel.tsx`; role-scope evidence checklist; `npm.cmd run audit:heu-role-scope-uat-pack`; signed UAT still required |
| P6-05 | Package TTGDTX local audit scripts | IT/Data | PASS_LOCAL | npm scripts must point to committed local guards |
| P6-06 | Non-TTGDTX/base cascade review | IT/Data + Audit | PASS_LOCAL | `docs/HEU_NON_TTGDTX_CASCADE_REVIEW_20260627.md`; `components/audit/hard-delete-boundary-guard.tsx`; `components/audit/hard-delete-waiver-evidence-checklist.tsx`; `npm.cmd run audit:heu-non-ttgdtx-cascade-review`; `npm.cmd run audit:hard-delete-boundary-guard`; conversion or written waiver still required before production |

## P7 - AI Agent Layer

| ID | Item | Owner | Status | Gate |
|---|---|---|---|---|
| P7-01 | AI assistant policy | BGH + IT/Data | PASS_LOCAL | `docs/HEU_AI_ASSISTANT_POLICY_20260627.md`; `npm.cmd run audit:heu-ai-policy`; AI drafts/checks/warns only |
| P7-02 | AI task checklist generator | IT/Data | PASS_LOCAL | `components/ai/ai-task-checklist-generator.tsx`; `docs/HEU_AI_ASSISTANT_POLICY_20260627.md`; `npm.cmd run audit:heu-ai-policy`; read-only checklist templates only, no AI call, no prompt save, no production action |
| P7-03 | AI risk suggestion board | Audit + IT/Data | PASS_LOCAL | `components/ai/ai-risk-suggestion-board.tsx`; `docs/HEU_AI_ASSISTANT_POLICY_20260627.md`; `npm.cmd run audit:heu-ai-policy`; read-only advisory risk prompts only, no scoring, no suppression, no autonomous approval |
