# G2 TTGDTX Hardening Backlog

## 1. Objective

Dua G2 tu trang thai G2_NEEDS_FIX sang G2_COMMIT_READY ma khong chay migration, khong dung du lieu that, khong commit mot cuc.

## 2. Current Status

| Item | Status |
|---|---|
| Branch | hardening/ttgdtx-9plus-pilot |
| Remote checkpoint | DONE |
| G2 status | G2_NEEDS_FIX |
| Migration allowed | NO |
| Real data allowed | READ_ONLY_DESIGN_REVIEW_ONLY |
| Operating spine | TTGDTX_LINKED_OPERATING_REVIEW_20260625 |
| Commit G2 as one group | NO |

## 3. Scope Split

| Group | Scope | Commit policy |
|---|---|---|
| G2a-LOW | Read-only/source pages P2-01/P2-04/P2-11/P2-12 | Commit first if static review passes |
| G2a-HIGH | Tuition/gate pages P2-02/P2-05 | Commit only after permission/RLS review |
| G2b | SQL master/source/gate step91/97/98/99 | Commit only after rollback + RLS test plan |
| G2c | step100 pilot-open | BLOCKED until backup + approval + rollback |
| G7 | app/leads/* and quick-fix component | Do not include in G2 |

## 4. G2a-LOW Candidate Files

| File/Folder | P2 | Risk | Notes |
|---|---|---:|---|
| app/ttgdtx/page.tsx | P2-01 | MEDIUM | Contract master/navigation |
| app/ttgdtx/simulation/ | P2-04 | LOW-MEDIUM | Simulation only |
| app/ttgdtx/source-control/ | P2-11 | MEDIUM | Source control UI |
| app/ttgdtx/master/ | P2-12 | MEDIUM | Master dropdown UI |

## 5. G2a-HIGH Candidate Files

| File/Folder | P2 | Risk | Notes |
|---|---|---:|---|
| app/ttgdtx/tuition/page.tsx | P2-02 | HIGH | Finance/tuition visibility |
| app/ttgdtx/gate/ | P2-05 | HIGH | Gate before receivables |

## 6. G2b SQL Candidate Files

| SQL | Risk | Notes |
|---|---:|---|
| database/step91_ttgdtx_receivable_gate_p2_05.sql | MEDIUM-HIGH | Needs rollback/approval |
| database/step97_ttgdtx_p0_19_finance_gate_fix.sql | MEDIUM-HIGH | Needs rollback/approval |
| database/step98_ttgdtx_source_control_p2_11.sql | MEDIUM-HIGH | RLS/policy change |
| database/step99_ttgdtx_master_dropdown_p2_12.sql | MEDIUM-HIGH | RLS/policy change |

## 7. G2c Blocked File

| SQL | Status | Required before commit/run |
|---|---|---|
| database/step100_ttgdtx_pilot_open_p2_01_p2_02_p0_19.sql | BLOCKED | Backup, rollback, final approval, Go/No-Go |

## 8. P0 Blockers

| Blocker | Applies to | Risk | Required evidence | Owner | Status |
|---|---|---:|---|---|---|
| Backup/rollback dry-run for step91/97/98/99/100 | G2b/G2c | HIGH | `docs/STEP90_STEP109_BACKUP_ROLLBACK_DRY_RUN_RUNBOOK.md`; restore dry-run evidence | Tech Lead | IN_PROGRESS |
| step100 pilot-open needs final approval | G2c | HIGH | Approval record | Final Authority | BLOCKED |
| DAT_TAM_THOI/pilot markers need classification | G2b/G2c | MEDIUM-HIGH | Classification note | Product Owner | NOT_STARTED |
| RLS needs role/scope test | G2a/G2b | HIGH | Test matrix result | Tech Lead | NOT_STARTED |
| Audit evidence needed for pilot/finance/contract status update | G2c | HIGH | Audit log evidence | Audit Owner | NOT_STARTED |
| No migration allowed before backup | G2b/G2c | HIGH | Backup evidence | DBA/Tech Lead | NOT_STARTED |
| No real data import/posting allowed | All | CRITICAL | Go/No-Go approval; anonymized UAT source pack; `docs/TTGDTX_PHU_XUYEN_REAL_DATA_FIT_NOTE_20260625.md`; `docs/TTGDTX_ACCOUNT_FREEZE_RELEASE_ACCEPTANCE_NOTE_20260625.md` | Final Authority | BLOCKED |
| TTGDTX linked spine must stay coherent | All | HIGH | `docs/TTGDTX_LINKED_OPERATING_REVIEW_20260625.md`; source-control, BBNT gate and account-control priorities tracked | Product Owner + Tech Lead | IN_PROGRESS |
| G2 must not include P2-03/P2-10/P2-13+ | G2a/G2b | HIGH | Scope check | Tech Lead | IN_PROGRESS |

## 9. RLS / Permission Test Matrix

| Role | /ttgdtx | /ttgdtx/simulation | /ttgdtx/source-control | /ttgdtx/master | /ttgdtx/tuition | /ttgdtx/gate |
|---|---|---|---|---|---|---|
| admin | can read/manage | can read | can manage | can manage | can read/manage | can read/manage |
| finance | can read | can read | limited | limited | can read/manage | can read |
| ttgdtx_manager | can read | can read | can manage in scope | can manage in scope | can read in scope | can read in scope |
| admission | can read limited | can read | denied/limited | denied/limited | denied/limited | denied/limited |
| viewer | can read limited | can read limited | denied | denied | denied | denied |
| out_of_scope_user | denied/no data | denied/no data | denied/no data | denied/no data | denied/no data | denied/no data |

## 10. Commit Readiness Criteria

### G2a-LOW ready when

- No write action.
- No SQL migration required.
- No P2-03/P2-10/P2-13+ mixed.
- No hard delete.
- No secret/log.
- Static review passes.
- Build/type/lint check plan exists.

### G2a-HIGH ready when

- Route protection confirmed.
- Finance visibility checked.
- User out of scope cannot see tuition/gate data.
- No write action without audit.
- No SQL migration run.

### G2b ready when

- Rollback runbook exists and restore dry-run evidence is attached.
- RLS policy reviewed.
- drop policy if exists approved.
- Backup required marked YES.
- Approval required marked YES.
- Re-run risk documented.

### G2c ready when

- Backup exists.
- Rollback runbook exists and restore dry-run evidence is attached.
- Final authority approves.
- Go/No-Go checklist passes.
- No production run without written approval.

## 11. Current Recommendation

- Do not commit G2 as one group.
- Prepare G2a-LOW first.
- Keep G2a-HIGH separate.
- Keep G2b SQL separate.
- Keep step100 blocked.
- Migration remains NO-GO.
- Treat phong toa/giai toa, BBNT and collateral giai chap as metadata-only
  real-source review until anonymized UAT and approval evidence exist.
