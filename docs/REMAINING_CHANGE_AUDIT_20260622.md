# Remaining Change Audit - 2026-06-22

## 1. Audit Scope

| Item | Value |
|---|---|
| Branch | hardening/ttgdtx-9plus-pilot |
| Current status | Dirty working tree with committed docs + `.gitignore` checkpoint, remaining code and SQL changes not committed |
| Modified tracked files | 5 |
| Untracked app/component groups | 11 |
| Untracked SQL step90-step110 | 21 |
| Migration run | No migration run |
| Production use | No production use |
| Data deletion | No data deletion |

Scope includes the current uncommitted TTGDTX 9+ pilot changes after the docs and `.gitignore` checkpoint. This document is an audit note only. It does not approve production use.

## 2. Modified File Analysis

| File | Summary | Module | Risk | SQL dependency | Commit now | Group |
|---|---|---|---|---|---|---|
| `app/leads/[id]/actions.ts` | Them P0-19 gate, P2-05 quick-fix TTGDTX, update lead/activity/revalidate | CRM + TTGDTX | HIGH | step59, 91, 98, 99, 100 | REVIEW | G7 |
| `app/leads/[id]/page.tsx` | Gan form sua nhanh P2-05, load TTGDTX/program/major options | CRM + TTGDTX | HIGH | step91, 98, 99, 100 | REVIEW | G7 |
| `app/ttgdtx/page.tsx` | Trang P2-01 contract master, scope/permission/navigation TTGDTX | TTGDTX | MEDIUM | step88, 98, 99, 100 | REVIEW | G2 |
| `app/ttgdtx/tuition/page.tsx` | Trang P2-02 hoc phi/cong no TTGDTX | Finance | HIGH | step89, 97, 100 | REVIEW | G2/G3 |
| `components/leads/lead-detail.tsx` | Hien thi canh bao P0-19 gate phap ly/hoc phi nganh | CRM | MEDIUM | step59, 97 | REVIEW | G7 |

Mandatory note:

2026-06-25 update: the `.delete()` rollback path in `app/leads/[id]/actions.ts`
was replaced with a soft-cancel flow. If HOU COM claim line generation fails,
the claim is now updated to `claim_status = 'CANCELLED'`, an explanatory note is
stored, and a `lead_activities` audit event is written. Keep the file in REVIEW
because it still belongs to G7 and depends on G2/G3 gate stability.

## 3. Untracked App/Component Analysis

| Path | Feature | P2 | Type | SQL dependency | Risk | Commit now | Group |
|---|---|---|---|---|---|---|---|
| `app/ttgdtx/master/` | TTGDTX master/control entrypoint | P2-01/P2-12 | Route/page | step88, step98, step99, step100 | MEDIUM | REVIEW | G2 |
| `app/ttgdtx/source-control/` | TTGDTX source control and source checklist | P2-11 | Route/page | step98 | MEDIUM | REVIEW | G2 |
| `app/ttgdtx/gate/` | Gate dieu kien tao cong no TTGDTX | P2-05 | Route/page/action | step91, step97, step98, step99, step100 | HIGH | REVIEW | G2/G3 |
| `app/ttgdtx/simulation/` | Mo phong gate, luong thu/chi TTGDTX | P2-04 | Route/page | step90, step91 | MEDIUM | REVIEW | G3 |
| `app/ttgdtx/receivables/` | Cong no hoc phi TTGDTX | P2-03 | Route/page/action | step90, step91 | HIGH | REVIEW | G3 |
| `app/ttgdtx/import/` | Import danh sach/du lieu TTGDTX va routing loi | P2-06/P2-07/P2-08 | Route/page/action | step92, step93, step94 | HIGH | REVIEW | G3 |
| `app/ttgdtx/payments/` | Thu hoc phi TTGDTX | P2-10 | Route/page/action | step96 | HIGH | REVIEW | G3 |
| `app/ttgdtx/reconciliation/` | Doi soat thu hoc phi TTGDTX | P2-13/P2-14 | Route/page/action | step101, step102, step103, step104 | HIGH | REVIEW | G4 |
| `app/ttgdtx/payment-requests/` | De nghi chi, kiem/duyet de nghi chi TTGDTX | P2-15/P2-16 | Route/page/action | step105, step106 | HIGH | REVIEW | G5 |
| `app/ttgdtx/accounting-dashboard/` | Dashboard ke toan TTGDTX end-to-end | P2-18 | Route/page | step108 | MEDIUM | REVIEW | G6 |
| `components/leads/ttgdtx-lead-quick-fix-form.tsx` | Form sua nhanh cho lead bi chan P2-05 | P2-05 | Component | step91, step98, step99, step100 | HIGH | REVIEW | G7 |

## 4. SQL Migration Analysis

Do not run migration at this time.

| Step | File | Purpose | DROP/DELETE/TRUNCATE | Rollback | Re-run | Backup | Approval | Group |
|---|---|---|---|---|---|---|---|---|
| step90 | `database/step90_ttgdtx_student_receivables.sql` | Tao nen cong no hoc phi TTGDTX theo hoc sinh | UNKNOWN | UNKNOWN | REVIEW | YES | YES | G3 |
| step91 | `database/step91_ttgdtx_receivable_gate_p2_05.sql` | Gate P2-05 truoc khi tao cong no | UNKNOWN | UNKNOWN | REVIEW | YES | YES | G2/G3 |
| step92 | `database/step92_ttgdtx_tuition_import_control_p2_06.sql` | Kiem soat import hoc phi/du lieu TTGDTX | REVIEW | UNKNOWN | REVIEW | YES | YES | G3 |
| step93 | `database/step93_ttgdtx_import_issue_routing_p2_07.sql` | Routing loi import ve bo phan lien quan | REVIEW | UNKNOWN | REVIEW | YES | YES | G3 |
| step94 | `database/step94_ttgdtx_import_issue_resolution_p2_08.sql` | Xu ly va ghi nhat ky loi import | REVIEW | UNKNOWN | REVIEW | YES | YES | G3 |
| step95 | `database/step95_ttgdtx_department_workload_p2_09.sql` | Tong hop workload bo phan | UNKNOWN | UNKNOWN | REVIEW | YES | YES | G3 |
| step96 | `database/step96_ttgdtx_tuition_collection_p2_10.sql` | Ghi nhan thu hoc phi TTGDTX | UNKNOWN | UNKNOWN | REVIEW | YES | YES | G3 |
| step97 | `database/step97_ttgdtx_p0_19_finance_gate_fix.sql` | Fix gate tai chinh P0-19 theo nganh/hoc phi | UNKNOWN | UNKNOWN | REVIEW | YES | YES | G2/G3 |
| step98 | `database/step98_ttgdtx_source_control_p2_11.sql` | Source control TTGDTX va danh muc nguon | UNKNOWN | UNKNOWN | REVIEW | YES | YES | G2 |
| step99 | `database/step99_ttgdtx_master_dropdown_p2_12.sql` | Dropdown master TTGDTX/program/major | UNKNOWN | UNKNOWN | REVIEW | YES | YES | G2 |
| step100 | `database/step100_ttgdtx_pilot_open_p2_01_p2_02_p0_19.sql` | Mo pilot P2-01/P2-02/P0-19 | UNKNOWN | UNKNOWN | REVIEW | YES | YES | G2 |
| step101 | `database/step101_ttgdtx_reconciliation_p2_13.sql` | Doi soat thu hoc phi TTGDTX | SQL_DELETE_RESOLVED; CASCADE_REVIEW | UNKNOWN | REVIEW | YES | YES | G4 |
| step102 | `database/step102_fix_p2_13_partner_status.sql` | Fix trang thai partner cho P2-13 | UNKNOWN | UNKNOWN | REVIEW | YES | YES | G4 |
| step103 | `database/step103_fix_p2_13_reconciliation_line_columns.sql` | Fix cot dong doi soat P2-13 | SQL_DELETE_RESOLVED; CASCADE_REVIEW | UNKNOWN | REVIEW | YES | YES | G4 |
| step104 | `database/step104_ttgdtx_reconciliation_approval_p2_14.sql` | Ra soat/duyet/khoa ky doi soat P2-14 | UNKNOWN | UNKNOWN | REVIEW | YES | YES | G4 |
| step105 | `database/step105_ttgdtx_partner_payment_request_p2_15.sql` | Tao de nghi chi TTGDTX P2-15 | SQL_DELETE_RESOLVED; CASCADE_REVIEW | UNKNOWN | REVIEW | YES | YES | G5 |
| step106 | `database/step106_ttgdtx_payment_request_approval_p2_16.sql` | Kiem/duyet de nghi chi TTGDTX P2-16 | UNKNOWN | UNKNOWN | REVIEW | YES | YES | G5 |
| step107 | `database/step107_ttgdtx_payment_execution_p2_17.sql` | Thuc hien chi TTGDTX P2-17 | UNKNOWN | UNKNOWN | REVIEW | YES | YES | G5 |
| step108 | `database/step108_ttgdtx_accounting_dashboard_p2_18.sql` | Dashboard ke toan TTGDTX P2-18 | UNKNOWN | UNKNOWN | REVIEW | YES | YES | G6 |
| step110 | `database/step110_ttgdtx_real_data_evidence_metadata_p2_19.sql` | Metadata minh chung du lieu that va redaction P2-19 | UNKNOWN | UNKNOWN | REVIEW | YES | YES | G2/G3 |

## 5. Hard Delete / Cascade Findings

The following items require review before production:

| Item | Review reason |
|---|---|
| `step101` | RESOLVED 2026-06-25 for SQL hard delete and TTGDTX cascade; still review re-run safety |
| `step103` | RESOLVED 2026-06-25 for SQL hard delete; still review destructive column/schema behavior and cascade safety |
| `step105` | RESOLVED 2026-06-25 for SQL hard delete and TTGDTX cascade; still review payment audit safety |
| `step92` | RESOLVED 2026-06-25 for TTGDTX cascade; import control migration still needs UAT |
| `step93` | RESOLVED 2026-06-25 for TTGDTX cascade; issue routing migration still needs UAT |
| `step94` | Issue resolution migration must be checked for cleanup/delete behavior |
| `.delete()` in `app/leads/[id]/actions.ts` | RESOLVED 2026-06-25: converted to soft-cancel/status transition with activity audit note |
| `.delete()` in `app/hou/actions.ts` | RESOLVED 2026-06-25: HOU payment batch rollback now soft-cancels the batch with audit-friendly note |
| scope `.delete()` in `app/settings/actions.ts` | RESOLVED 2026-06-25: user segment/partner scopes now update old rows to `INACTIVE` and upsert selected rows to `ACTIVE` |
| role permission `.delete()` in `app/settings/actions.ts` | RESOLVED 2026-06-25 in app code; guarded by `npm.cmd run audit:permission-soft-revoke`; requires step109 soft revoke UAT before production permission updates are allowed |

## 6. Proposed Commit Plan

Do not commit all remaining changes in one commit.

| Group | Scope | Notes |
|---|---|---|
| G1 | SQL registry/bootstrap if needed | Commit only if dependency registry is clear and reviewed |
| G2 | TTGDTX base/master/gate | Review first because this controls workspace, master data and gate logic |
| G3 | Receivables/import/collection | Requires careful test of P2-03, P2-06, P2-07, P2-08, P2-10 |
| G4 | Reconciliation | Requires locked-period and duplicate-reconciliation tests |
| G5 | Partner payment request/approval/execution | Requires finance approval, no-double-pay and audit tests |
| G6 | Accounting dashboard | Commit after data source and dashboard queries are stable |
| G7 | Lead detail integration + quick fix component | Commit after G2/G3 gates are stable |
| G8 | Tests before production | Must be added before production readiness |

## 7. Blockers

- Missing automated tests
- Audit-log static guard added via `npm.cmd run audit:ttgdtx-audit-log`; UAT evidence still required
- Backup/rollback dry-run runbook drafted; restore evidence and owner sign-off still required
- Hard delete/cascade review required; app-level business `.delete()`, permission soft-revoke guard and TTGDTX step90-step110 cascade patterns are resolved, but step109 UAT, step110 real-data metadata UAT, non-TTGDTX cascade review and production approval remain unapproved
- `DAT_TAM_THOI` / pilot markers remain
- Permission static guard added via `npm.cmd run audit:ttgdtx-role-scope-access`; TTGDTX data-fetch guard added via `npm.cmd run audit:ttgdtx-data-fetch-gate`; multi-account UAT evidence still required
- Real data not allowed
- Migration not allowed

## 8. Recommendation

- Do not commit code/SQL immediately.
- Review and test G2 first.
- Do not run migration.
- Do not use real data.
- Production remains NO-GO.
