# PR Split Register 2026-07-07

Task ID: HEU-CONTROL-001-BOOTSTRAP-GIT-SCOPE-REGISTER
Repository: heu-admission-crm
Branch: hardening/ttgdtx-9plus-pilot
Status: DRAFT_CONTROL

## 1. Purpose

This register proposes small review units for the current mixed worktree. The
goal is to avoid overlapping review, accidental staging, and broad commits that
combine docs, SQL, runtime actions, scripts, config, and local Codex files.

## 2. Proposed PR Units

| Priority | Proposed TASK_ID | File group | Count | Risk | Review owner lane | Separate PR? | Backup/rollback needed? |
|---:|---|---|---:|---|---|---|---|
| 1 | HEU-CONTROL-001-BOOTSTRAP-GIT-SCOPE-REGISTER | `docs/HEU_CONTROL` | 4 new control docs | Low | IT_DATA + Audit | Yes | Rollback by revert PR; no data backup |
| 2 | HEU-DOCS-002-REVIEW-CONTROL-DOCS-BY-MODULE | `docs` | 77 | Medium | Audit + PHAP_CHE + module owners | Yes | Rollback by revert PR; no DB backup |
| 3 | HEU-SCRIPTS-003-REVIEW-AUDIT-CHECK-SCRIPTS | `scripts` | 87 | High | IT_DATA + Audit | Yes | Rollback by revert PR; no DB backup |
| 4 | HEU-CONFIG-004-REVIEW-BUILD-RUNTIME-CONFIG | `config` | 2 | Very high | IT_DATA + DevOps/Codex operator | Yes | Rollback by revert PR; rerun focused checks only after review |
| 5 | HEU-CODEX-005-REVIEW-AGENT-LOCAL-ENV | `codex` | 2 | High | Codex operator + IT_DATA + Audit | Yes | Rollback by revert PR; do not commit local-only data without approval |
| 6 | HEU-DATABASE-006-FREEZE-AND-REVIEW-SQL | `database` | 10 | Very high | IT_DATA + Audit + PHAP_CHE + KHTC | Yes | Backup, restore proof, migration order, rollback plan required before execution |
| 7 | HEU-TTGDTX-APP-007-REVIEW-PAYMENT-REQUEST-ACTIONS | `app/ttgdtx/payment-requests/**` plus related UI | Subset of app/components | Very high | KHTC + IT_DATA + Audit + PHAP_CHE | Yes | Backup/rollback required before any real finance write or migration |
| 8 | HEU-PERMISSION-008-REVIEW-SCOPE-ROLE-LANES | `app/settings/**`, settings components, `lib/heu-role-lanes.ts` | Subset | High | IT_DATA + PHAP_CHE + Audit + ADMIN | Yes | Rollback by revert PR for code; backup required before real access changes |
| 9 | HEU-AUTH-009-REVIEW-PASSWORD-SELF-SERVICE | `app/auth/**`, auth components, auth scripts/docs | Subset | High | IT_DATA + ADMIN + Audit | Yes | Rollback by revert PR; no secret or password data in Git |
| 10 | HEU-ADMISSIONS-010-REVIEW-LEAD-PIPELINE-HANDOVER | admissions, leads, pipeline, followups | Subset | High | TUYEN_SINH + CTHSSV + IT_DATA + Audit | Yes | Backup required before real data import or lead mutation |
| 11 | HEU-CTHSSV-011-REVIEW-M06-CONTROL-PACK | CTHSSV docs/scripts/UI | Subset | Medium-high | CTHSSV + TUYEN_SINH + IT_DATA + Audit | Yes | Rollback by revert PR; external evidence stays outside Git |
| 12 | HEU-DAO-TAO-KHOA-012-REVIEW-M07-M08-CONTROL-PACK | Dao Tao, Short Course, Khoa/Giang vien docs/scripts/UI | Subset | Medium-high | DAO_TAO + Khoa/Giang vien + IT_DATA + Audit | Yes | Rollback by revert PR; external evidence stays outside Git |
| 13 | HEU-REPORTS-DASHBOARD-013-REVIEW-READONLY-SURFACES | reports, dashboard, executive panels | Subset | Medium-high | BGH + IT_DATA + Audit + module owners | Yes | Rollback by revert PR; no dashboard reliance without owner signoff |
| 14 | HEU-FINANCE-HDDT-014-REVIEW-CONTROLLED-EVIDENCE-INTAKE | finance-desk evidence intake docs/component/app route | Subset | High | KHTC + Audit + IT_DATA + PHAP_CHE | Yes | Controlled evidence refs only; no raw evidence in Git |

## 3. Processing Order

1. Land or review `HEU-CONTROL-001` first so the worktree split has a stable register.
2. Review `docs` before code, because docs should explain the intended control and owner boundary.
3. Review `scripts` before trusting any PASS/NO_GO gate.
4. Isolate `config` and `codex` before running broad verification.
5. Review `database` in read-only mode before any migration or SQL execution.
6. Review app routes and server actions by module, starting with TTGDTX finance/payment and settings/scope.
7. Review components after the matching docs/scripts/app routes are understood.
8. Run focused checks with `npm.cmd` only after the relevant PR scope is isolated.

## 4. PR Guardrails

- No PR should mix SQL migration changes with unrelated UI/docs/config changes.
- No PR should include raw student, lead, phone, CCCD, bank, payment, or salary data.
- No PR should claim DAT_CHINH_THUC, owner GO, UAT approval, finance reliance, or production GO.
- Any PR that changes finance, scope, database, or production gate behavior must include Risk, Test, and Rollback.
- Any PR without focused verification should stay draft.

## 5. Local Conclusion

Suggested next PR: HEU-CONTROL-001-BOOTSTRAP-GIT-SCOPE-REGISTER.

Status: DAT_TAM_THOI for PR planning only. Real module readiness remains
NO_GO until the specific PR is reviewed and verified.
