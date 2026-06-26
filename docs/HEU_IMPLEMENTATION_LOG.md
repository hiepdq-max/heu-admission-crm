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
