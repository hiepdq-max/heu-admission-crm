# HEU Admission CRM - Codex Working Rules

## Current Mission

Build and harden the HEU web app in a controlled way. The current approved
scope is the TTGDTX 9+ pilot hardening chain only:

1. P2-01 TTGDTX contract master.
2. P2-02 tuition policy.
3. P2-05 receivable gate.
4. P2-03 receivable creation.
5. P2-10 tuition collection.
6. P2-13 reconciliation.
7. P2-14 reconciliation review, approval, and lock.
8. P2-15 partner payment request.
9. P2-16 payment request review and approval.
10. P2-17 payout execution.
11. P2-18 accounting dashboard.
12. P2-19 source/evidence metadata for anonymized UAT design review only.
13. P3-01 lead lifecycle standard for the TTGDTX-linked pilot path.
14. P3-02 lead-to-student handover guard for the TTGDTX-linked pilot path.

Production remains NO-GO until the production checklist says otherwise.

<!-- BEGIN:nextjs-agent-rules -->
## Next.js Compatibility Note

This project uses a newer Next.js version with APIs, conventions, and file
structure that may differ from older examples. Before changing framework-level
code, routing, server actions, cache behavior, or build configuration, read the
relevant guide in `node_modules/next/dist/docs/` and follow deprecation notices.
<!-- END:nextjs-agent-rules -->

## Hard Boundaries

- Do not expand production scope to HOU, short-course, AI agents, broad
  dashboards, or new enrollment flows while TTGDTX 9+ is still hardening.
- Do not run Supabase or production migrations without an explicit backup,
  rollback plan, migration order approval, and user confirmation.
- Do not use real student, parent, CCCD, bank, phone, or payment data in tests.
  Use synthetic data unless the user explicitly provides sanitized samples.
- Do not add, expose, or request passwords, API keys, service role keys, access
  tokens, OTPs, private keys, or bank credentials.
- Do not hard-delete finance, evidence, approval, payment, lead, or audit rows.
  Prefer status transitions, archive fields, and audit notes.
- Do not allow AI to approve, pay, mark revenue, unlock production, or replace a
  human approval role. AI may suggest, summarize, validate, and warn only.

## Required Reading Before Meaningful Changes

Read these documents before changing TTGDTX finance or migration logic:

- `docs/HEU_TECH_DECISION_001_FREEZE_AND_HARDEN_TTGDTX_9PLUS.md`
- `docs/HEU_CODEX_OPERATING_PLAYBOOK.md`
- `docs/HEU_AI_ASSISTANT_POLICY_20260627.md`
- `docs/HEU_CONTROLLED_EVIDENCE_REDACTION_PACK_20260627.md`
- `docs/HEU_BGH_OPERATING_DASHBOARD_SPEC_20260627.md`
- `docs/HEU_ROOT_CONTROL_ACTION_REGISTER_20260627_V01_DRAFT.md`
- `docs/HEU_DATA_MASTER_P0_REGISTER_20260627_V01_DRAFT.md`
- `docs/HEU_DATA_DICTIONARY_MIN_20260627_V01_DRAFT.md`
- `docs/HEU_SOP_TO_DATA_MAPPING_20260627_V01_DRAFT.md`
- `docs/HEU_LEGAL_SOP_GOVERNANCE_CONTROL_MATRIX_20260628_V01_DRAFT.md`
- `docs/HEU_REPORT_VIEW_REGISTER_20260627_V01_DRAFT.md`
- `docs/HEU_REPORT_VIEW_SOURCE_MAP_20260628_V01_DRAFT.md`
- `docs/HEU_DATA_MASTER_REPORT_VIEW_COMPATIBILITY_20260628_V01_DRAFT.md`
- `docs/HEU_AI_AGENT_SCOPE_REGISTER_20260627_V01_DRAFT.md`
- `docs/HEU_RISK_CONTROL_SIGNOFF_REGISTER_20260627_V01_DRAFT.md`
- `docs/HEU_MODULE_READINESS_GAP_MATRIX_20260628_V01_DRAFT.md`
- `docs/HEU_HOU_LEDGER_HANDOVER_GAP_PACK_20260628_V01_DRAFT.md`
- `docs/HEU_SHORT_COURSE_ATTENDANCE_PAYMENT_GAP_PACK_20260628_V01_DRAFT.md`
- `docs/HEU_DATA_MODEL_V1.md`
- `docs/HEU_DATA_DICTIONARY_V1.md`
- `docs/HEU_NON_TTGDTX_CASCADE_REVIEW_20260627.md`
- `docs/HEU_ROLE_PERMISSION_MATRIX_V1.md`
- `docs/HEU_SQL_OBJECT_MASTER_MAP_20260627.md`
- `docs/modules/HEU_FINANCE_DESK_MVP_SPEC_20260627.md`
- `docs/HEU_FINANCE_DESK_UAT_RUNBOOK_20260627.md`
- `docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md`
- `docs/TTGDTX_SIGNED_UAT_EXECUTION_ROUTING_HUB_20260628.md`
- `docs/REMAINING_CHANGE_AUDIT_20260622.md`
- `docs/MIGRATION_ORDER_AUDIT.md`
- `docs/HARD_DELETE_AUDIT.md`
- `docs/STEP109_ROLE_PERMISSION_UAT_RUNBOOK.md`
- `docs/P2_17_DUPLICATE_PAYOUT_UAT_RUNBOOK.md`
- `docs/P2_18_ACCOUNTING_DASHBOARD_UAT_RUNBOOK.md`
- `docs/TTGDTX_ACCOUNTING_DASHBOARD_ROLE_UAT_PLAN_20260627.md`
- `docs/TTGDTX_AUDIT_LOG_UAT_RUNBOOK.md`
- `docs/TTGDTX_ACCOUNT_CONTROL_SCOPE_DECISION_20260627.md`
- `docs/STEP90_STEP110_BACKUP_ROLLBACK_DRY_RUN_RUNBOOK.md`
- `docs/STEP90_STEP110_BACKUP_RESTORE_OPERATOR_RUN_SHEET_20260627.md`
- `docs/STEP90_STEP110_BACKUP_RESTORE_DRY_RUN_EVIDENCE_PACK_20260627.md`
- `docs/STEP90_STEP110_MIGRATION_ORDER_SIGNOFF_GUARD_20260627.md`
- `docs/TTGDTX_ROLE_SCOPE_UAT_RUNBOOK.md`
- `docs/HEU_ROLE_SCOPE_UAT_EXECUTION_PACK_20260627.md`
- `docs/TTGDTX_BANK_RECEIPT_BATCH_POLICY_20260627.md`
- `docs/TTGDTX_PERIOD_LOCK_ADJUSTMENT_POLICY_20260627.md`
- `docs/TTGDTX_RECEIVABLE_PAYMENT_STATUS_LIFECYCLE_POLICY_20260627.md`
- `docs/HEU_LEAD_LIFECYCLE_STANDARD_20260627.md`
- `docs/HEU_LEAD_TO_STUDENT_HANDOVER_POLICY_20260627.md`
- `docs/HEU_LEAD_LIFECYCLE_HANDOVER_UAT_RUNBOOK_20260628.md`
- `docs/TTGDTX_CONTRACT_TUITION_MASTER_GUARD_20260627.md`
- `docs/TTGDTX_GENERIC_SOURCE_EVIDENCE_AUDIT_20260626.md`
- `docs/TTGDTX_PROCESS_CODE_MAP_20260625.md`
- `docs/STEP110_P2_19_UAT_RUNBOOK.md`
- `docs/TTGDTX_LEAD_QUICK_FIX_UAT_RUNBOOK.md`
- `docs/TTGDTX_SYNTHETIC_REAL_LIKE_UAT_PACK_20260627.md`
- `docs/TTGDTX_PRODUCTION_OWNER_SIGNOFF_PACK_20260627.md`
- `docs/P0_19_P2_01_P2_02_PILOT_OPEN_UAT_RUNBOOK.md`
- `docs/P2_13_RECONCILIATION_REPAIR_SAFETY_UAT_RUNBOOK.md`

## Engineering Workflow

- Check `git status --short` before editing.
- Keep changes small and grouped by hardening group:
  - G2: TTGDTX base, master, source, and gate.
  - G3: receivables, import, collection.
  - G4: reconciliation.
  - G5: payment request, approval, payout.
  - G6: accounting dashboard.
  - G7: lead detail integration.
- Do not commit all dirty files together. Commit only reviewed, related files.
- Preserve user or previous-agent changes. Never reset, checkout, or delete
  unrelated work unless explicitly asked.
- Before any final handoff, run:
  - `npm.cmd run audit:heu-ai-policy`
  - `npm.cmd run audit:heu-backlog-codes`
  - `npm.cmd run audit:heu-bgh-dashboard-spec`
  - `npm.cmd run audit:heu-controlled-evidence-redaction-pack`
  - `npm.cmd run audit:heu-current-state-inventory`
  - `npm.cmd run audit:heu-data-foundation`
  - `npm.cmd run audit:heu-finance-desk`
  - `npm.cmd run audit:heu-final-handoff-coverage`
  - `npm.cmd run audit:heu-git-hygiene`
  - `npm.cmd run audit:heu-hou-ledger-handover-gap-pack`
  - `npm.cmd run audit:heu-implementation-log`
  - `npm.cmd run audit:heu-user-account-security`
  - `npm.cmd run audit:heu-lead-handover-policy`
  - `npm.cmd run audit:heu-lead-lifecycle-handover-uat-pack`
  - `npm.cmd run audit:heu-lead-lifecycle-standard`
  - `npm.cmd run audit:heu-non-ttgdtx-cascade-review`
  - `npm.cmd run audit:heu-p0-register-pack`
  - `npm.cmd run audit:heu-production-blocker-source`
  - `npm.cmd run audit:heu-production-evidence-binder`
  - `npm.cmd run audit:heu-role-scope-uat-pack`
  - `npm.cmd run audit:heu-short-course-attendance-payment-gap-pack`
  - `npm.cmd run audit:heu-sql-object-master-map`
  - `npm.cmd run audit:heu-vietnamese-text-encoding`
  - `npm.cmd run audit:hard-delete`
  - `npm.cmd run audit:hard-delete-boundary-guard`
  - `npm.cmd run audit:hard-delete-conversion-decision-queue`
  - `npm.cmd run audit:vnd-money-format`
  - `npm.cmd run audit:permission-soft-revoke`
  - `npm.cmd run audit:ttgdtx-account-control-scope-decision`
  - `npm.cmd run audit:ttgdtx-accounting-dashboard-uat-plan`
  - `npm.cmd run audit:ttgdtx-audit-log`
  - `npm.cmd run audit:ttgdtx-audit-trail-guard`
  - `npm.cmd run audit:ttgdtx-backup-restore-dry-run-pack`
  - `npm.cmd run audit:ttgdtx-cascade`
  - `npm.cmd run audit:ttgdtx-contract-tuition-master-guard`
  - `npm.cmd run audit:ttgdtx-dashboard-access`
  - `npm.cmd run audit:ttgdtx-dashboard-readonly-guard`
  - `npm.cmd run audit:ttgdtx-dashboard-source-reconciliation`
  - `npm.cmd run audit:ttgdtx-data-fetch-gate`
  - `npm.cmd run audit:ttgdtx-generic-source-evidence`
  - `npm.cmd run audit:ttgdtx-invoice-policy`
  - `npm.cmd run audit:ttgdtx-lead-quick-fix-safety`
  - `npm.cmd run audit:ttgdtx-migration-order-guard`
  - `npm.cmd run audit:ttgdtx-operating-control-ui`
  - `npm.cmd run audit:ttgdtx-p019-gate-guard`
  - `npm.cmd run audit:ttgdtx-payment-dossier-checklist`
  - `npm.cmd run audit:ttgdtx-pilot-open-safety`
  - `npm.cmd run audit:ttgdtx-payout-duplicate-guard`
  - `npm.cmd run audit:ttgdtx-payout-execution-readiness`
  - `npm.cmd run audit:ttgdtx-period-lock-policy`
  - `npm.cmd run audit:ttgdtx-production-owner-signoff-pack`
  - `npm.cmd run audit:ttgdtx-production-readiness-guard`
  - `npm.cmd run audit:ttgdtx-process-labels`
  - `npm.cmd run audit:ttgdtx-receivable-payment-lifecycle`
  - `npm.cmd run audit:ttgdtx-reconciliation-repair-safety`
  - `npm.cmd run audit:ttgdtx-role-scope-access`
  - `npm.cmd run audit:ttgdtx-signed-uat-execution-routing-hub`
  - `npm.cmd run audit:ttgdtx-step110-safety`
  - `npm.cmd run audit:ttgdtx-synthetic-uat-pack`
  - `npm.cmd run audit:ttgdtx-uat-readiness`
  - `npm.cmd run audit:ttgdtx-release-gates`
  - `npm.cmd run lint`
  - `npm.cmd run build`
- Final handoff summaries must include:
  - live `git status --short --branch` and `git rev-parse --short HEAD`
    results;
  - local checks run and whether each passed or failed;
  - `Stage D - internal controlled test only` and `Production remains NO-GO`;
  - the P0-03 operator run sheet evidence path, P0-03 restore smoke-check
    proof for P0-19/P3 gate preservation, P0-09 owner sign-off/UAT handoff
    evidence path, P0-09 final owner decision manifest, P0-13 production
    blocker shared source and P0-14 production evidence binder, including
    controlled evidence intake ledger, redaction reviewer, owner signature
    state, P2-18/P5-03 real-accounting finance reliance proof, separate P6-04
    role/workspace, P6-03 audit-log and P6-06 hard-delete/cascade proof paths,
    including
    `docs/HEU_NON_TTGDTX_CASCADE_FINDING_REGISTER_20260628.md`;
  - the boundary that real evidence stays outside Git/Codex/chat and that
    Codex output does not approve production, migration, finance action or
    owner GO/NO-GO.

## Product Rules

- Money is recognized only when HEU actually receives it.
- Receivables must not be created for leads that fail the legal/finance gate.
- A reconciliation period must be approved and locked before payment requests.
- A partner payment request must not be paid twice.
- Payment execution must require evidence and leave an audit trail.
- BGH views dashboards; BGH should not be the daily data-entry role.
- Finance, admission, training, audit, and partner roles must not see or edit
  data outside their scope.

## Security And Privacy

- Keep `.env`, `.env.local`, logs, screenshots with secrets, exports, and local
  backups out of Git.
- Never commit service-role keys or production credentials.
- Treat evidence links and source files as controlled documents.
- Prefer role checks and workspace scope checks on server actions.
- For any page or action that changes finance state, check both permission and
  business status before writing.

## Frontend Standards

- This project uses Next.js 16, React 19, Tailwind, shadcn-style components, and
  lucide icons.
- Keep operational screens dense, calm, and scan-friendly. This is an internal
  ERP/CRM tool, not a marketing site.
- Use clear status labels, tables, filters, badges, and action buttons.
- Do not add decorative hero sections, large gradients, or unrelated visual
  flourish to operations pages.

## Definition Of Done

A hardening change is done only when:

- It stays inside the current approved scope.
- It has no hard-delete or double-payment risk unless documented and approved.
- It passes lint and build.
- It updates relevant docs/checklists when production readiness changes.
- It does not require production migration or real data to verify locally.
