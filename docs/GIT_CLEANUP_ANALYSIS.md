# Git Cleanup Analysis

Date: 2026-06-22  
Repository: heu-admission-crm  
Remote: https://github.com/hiepdq-max/heu-admission-crm.git  
Base branch: main  
Hardening branch: hardening/ttgdtx-9plus-pilot  
Latest known commit: 9d54348 Add TTGDTX tuition policy control  
Mode: Documentation-only analysis. No files were deleted, committed or pushed.

## 1. Scope

The repo is dirty and contains both modified tracked files and untracked TTGDTX pilot files. The cleanup objective is not to delete anything now. The correct next step is to group changes by business area, review them, then commit only validated TTGDTX 9+ pilot hardening changes.

## 2. Modified Files

| File | Group | Proposed action | Reason |
|---|---|---|---|
| app/leads/[id]/actions.ts | CRM / TTGDTX / Finance | REVIEW | Lead actions affect status, quick-fix and finance gates; must be checked before commit |
| app/leads/[id]/page.tsx | CRM / UI | REVIEW | Lead detail route is shared beyond TTGDTX; avoid leaking pilot assumptions |
| app/ttgdtx/page.tsx | TTGDTX / UI | COMMIT after review | Core TTGDTX navigation/page likely belongs to pilot |
| app/ttgdtx/tuition/page.tsx | TTGDTX / Finance / UI | COMMIT after review | P2-02 tuition policy is pilot-critical |
| components/leads/lead-detail.tsx | CRM / UI / TTGDTX | REVIEW | Shared component; validate P0-19/P2 warning logic and no scope leak |

## 3. Untracked Files

| File/Folder | Group | Proposed action | Reason |
|---|---|---|---|
| app/ttgdtx/accounting-dashboard/ | TTGDTX / Finance / UI | REVIEW | P2-18 dashboard needs runtime verification before commit |
| app/ttgdtx/gate/ | TTGDTX / Finance / UI | COMMIT after review | P2-05 gate is core pilot control |
| app/ttgdtx/import/ | TTGDTX / Data / UI | REVIEW | P2-06 import flow must not bypass source control |
| app/ttgdtx/master/ | TTGDTX / Data Master / UI | COMMIT after review | P2-11/P2-12 master/dropdown control |
| app/ttgdtx/payment-requests/ | TTGDTX / Finance / UI | COMMIT after review | P2-15/P2-16 request/approval |
| app/ttgdtx/payments/ | TTGDTX / Finance / UI | REVIEW | P2-17 payout is high risk; audit duplicate-click before commit |
| app/ttgdtx/receivables/ | TTGDTX / Finance / UI | COMMIT after review | P2-03 receivables are core pilot |
| app/ttgdtx/reconciliation/ | TTGDTX / Finance / UI | COMMIT after review | P2-13/P2-14 reconciliation/lock |
| app/ttgdtx/simulation/ | TTGDTX / Finance / UI | REVIEW | Simulation must be clearly separated from real posting |
| app/ttgdtx/source-control/ | TTGDTX / Data / Governance | COMMIT after review | P2-11 source control supports master dropdown |
| components/leads/ttgdtx-lead-quick-fix-form.tsx | TTGDTX / CRM / UI | REVIEW | Quick fix edits lead data; must preserve valid existing fields |
| database/step90_ttgdtx_student_receivables.sql | SQL / Finance | REVIEW | Migration foundation; needs order/idempotency audit |
| database/step91_ttgdtx_receivable_gate_p2_05.sql | SQL / Finance | REVIEW | Gate creation must be repeat-safe |
| database/step92_ttgdtx_tuition_import_control_p2_06.sql | SQL / Data / Finance | REVIEW | Import control foundation |
| database/step93_ttgdtx_import_issue_routing_p2_07.sql | SQL / Workflow / Risk | REVIEW | Issue routing should not create noisy duplicate tasks |
| database/step94_ttgdtx_import_issue_resolution_p2_08.sql | SQL / Workflow / Audit | REVIEW | Resolution log must preserve history |
| database/step95_ttgdtx_department_workload_p2_09.sql | SQL / Dashboard / Workflow | REVIEW | Workload calculations need verification |
| database/step96_ttgdtx_tuition_collection_p2_10.sql | SQL / Finance | REVIEW | Receipt/voucher rules must block duplicate and over-collection |
| database/step97_ttgdtx_p0_19_finance_gate_fix.sql | SQL / Cleanup / Finance | REVIEW | Patch/fix file; do not treat as base migration without review |
| database/step98_ttgdtx_source_control_p2_11.sql | SQL / Data Master | REVIEW | Master source control |
| database/step99_ttgdtx_master_dropdown_p2_12.sql | SQL / UI / Data Master | REVIEW | Dropdown safety |
| database/step100_ttgdtx_pilot_open_p2_01_p2_02_p0_19.sql | SQL / Pilot Patch | REVIEW | Temporary pilot unlock; must be documented as waiver |
| database/step101_ttgdtx_reconciliation_p2_13.sql | SQL / Finance | REVIEW | Contains rollback cleanup delete pattern |
| database/step102_fix_p2_13_partner_status.sql | SQL / Cleanup | REVIEW | Fix file; verify no repeated side effects |
| database/step103_fix_p2_13_reconciliation_line_columns.sql | SQL / Cleanup | REVIEW | Contains rollback cleanup delete pattern |
| database/step104_ttgdtx_reconciliation_approval_p2_14.sql | SQL / Finance / Approval | REVIEW | Approval/lock must be immutable after lock |
| database/step105_ttgdtx_partner_payment_request_p2_15.sql | SQL / Finance / Payment | REVIEW | Contains delete cleanup pattern; high risk area |
| database/step106_ttgdtx_payment_request_approval_p2_16.sql | SQL / Finance / Approval | REVIEW | Check/approve flow |
| database/step107_ttgdtx_payment_execution_p2_17.sql | SQL / Finance / Payment | REVIEW | Must guarantee no double payout |
| database/step108_ttgdtx_accounting_dashboard_p2_18.sql | SQL / Dashboard | REVIEW | Dashboard route previously needed server verification |
| database/step109_role_permission_soft_revoke_p0_11.sql | SQL / Permission | REVIEW | Role permission soft-revoke must pass UAT before production |
| database/step110_ttgdtx_real_data_evidence_metadata_p2_19.sql | SQL / Data / Privacy | REVIEW | Real-data evidence metadata; must not import raw PII/bank data and needs anonymized UAT |
| dev-server.err.log | Log | IGNORE / DELETE-LATER | Generated runtime log, should not be committed |
| dev-server.out.log | Log | IGNORE / DELETE-LATER | Generated runtime log, should not be committed |
| next-dev.err.log | Log | IGNORE / DELETE-LATER | Generated runtime log, should not be committed |
| next-dev.log | Log | IGNORE / DELETE-LATER | Generated runtime log, should not be committed |

## 4. Log Files

| File | Recommendation | Reason |
|---|---|---|
| dev-server.err.log | IGNORE / DELETE-LATER | Generated runtime log, not part of docs-only commit |
| dev-server.out.log | IGNORE / DELETE-LATER | Generated runtime log, not part of docs-only commit |
| next-dev.err.log | IGNORE / DELETE-LATER | Generated runtime log, not part of docs-only commit |
| next-dev.log | IGNORE / DELETE-LATER | Generated runtime log, not part of docs-only commit |

## 5. SQL Files step90-step110

SQL files from step90 through step110 are migration or patch candidates for the TTGDTX 9+ pilot. They are not allowed in the current docs-only commit and must be reviewed under the migration order audit before any production use.

## 6. TTGDTX P2 Files

| Group | Files | Recommendation |
|---|---:|---|
| TTGDTX | Many app/ttgdtx and SQL step90-step110 files | Keep for pilot review |
| CRM | Lead actions/detail files | Review shared effects |
| Finance | P2-02, P2-03, P2-10, P2-13 to P2-17 | Highest priority review |
| UI | TTGDTX pages and lead components | Review for usability and Vietnamese labels |
| SQL | step90-step110 | Migration order audit required |
| Log | dev/next log files | Ignore/delete later, not now |
| Other | None identified in current dirty list | No action |

## 7. Commit Recommendation

1. Do not delete any file yet.
2. Keep branch `hardening/ttgdtx-9plus-pilot`.
3. Review modified shared files before committing.
4. Split future commits by scope:
   - TTGDTX UI routes.
   - TTGDTX database migrations.
   - Lead quick-fix/shared CRM changes.
   - Documentation.
5. Add log files to ignore rules only in a separate reviewed change.
6. Do not commit temporary pilot waivers unless clearly labeled.

## 8. Files Allowed for Docs-Only Commit

| File | Recommendation |
|---|---|
| docs/HEU_TECH_DECISION_001_FREEZE_AND_HARDEN_TTGDTX_9PLUS.md | COMMIT |
| docs/HEU_CURRENT_STATE_INVENTORY.md | COMMIT |
| docs/GIT_CLEANUP_ANALYSIS.md | COMMIT |
| docs/HARD_DELETE_AUDIT.md | COMMIT |
| docs/MIGRATION_ORDER_AUDIT.md | COMMIT |
| docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md | COMMIT |

## 9. Files Not Allowed for Current Commit

| Group | Examples | Reason |
|---|---|---|
| App/code files | `app/`, `components/`, `lib/` | Current change is documentation-only |
| Database files | `database/step90` through `database/step110` | Migration review is required before commit |
| Runtime logs | `*.log` | Generated output should not be committed |
