# HEU Data 036 - Task Center Adapter Dry-Run Owner Signoff Evidence Matrix Review

Task ID: HEU-DATA-036-TASK-CENTER-ADAPTER-DRY-RUN-OWNER-SIGNOFF-EVIDENCE-MATRIX-REVIEW
Date: 2026-07-10
Repository: heu-admission-crm
Status: PASS_LOCAL_MATRIX_ONLY
Production status: NO-GO
Runtime status: OWNER_SIGNOFF_EVIDENCE_MATRIX_REVIEW_READY: PASS_LOCAL_MATRIX_ONLY
Database status: TASK_CENTER_DATABASE_READY: NO_GO_OWNER_SIGNOFF_EVIDENCE_MATRIX_REVIEW_ONLY

## 1. Purpose

This slice adds a source/UI/checker-only owner signoff evidence matrix review
after `HEU-DATA-035`.

It does not approve owner signoff. It lists the controlled evidence artifacts
that must be reviewed before any later owner decision can even be considered.

Every row remains `SIGNOFF_EVIDENCE_REVIEW_REQUIRED_NO_GO`.

## 2. Scope

Files in scope:

- `docs/HEU_CONTROL/HEU_DATA_036_TASK_CENTER_ADAPTER_DRY_RUN_OWNER_SIGNOFF_EVIDENCE_MATRIX_REVIEW_20260710.md`
- `components/data-confirmation/department-task-inbox.tsx`
- `lib/task-center-gate-evidence-panel-source.ts`
- `docs/HEU_CONTROL/HEU_APP_SHELL_001_STAGE_FILE_MANIFEST_20260709.md`
- `docs/HEU_CONTROL/HEU_DATA_035_TASK_CENTER_ADAPTER_DRY_RUN_DB_READ_GO_NO_GO_PRECHECK_20260710.md`
- `scripts/check-heu-task-center-adapter-dry-run-db-read-go-no-go-precheck.mjs`
- `scripts/check-heu-task-center-adapter-dry-run-owner-signoff-evidence-matrix-review.mjs`
- `package.json`

Out of scope:

- No owner approval.
- No official signoff.
- No runtime file write.
- No database client.
- No database read or write.
- No SQL or migration.
- No env enablement.
- No task mutation.
- No real data.
- No AI call.
- No paid automation.
- No deploy.
- No production GO.

## 3. Boundary Tokens

- `TASK_CENTER_ADAPTER_DRY_RUN_OWNER_SIGNOFF_EVIDENCE_MATRIX_REVIEW_ONLY`
- `TASK_CENTER_ADAPTER_DRY_RUN_OWNER_SIGNOFF_EVIDENCE_MATRIX_REVIEW_READONLY`
- `TASK_CENTER_ADAPTER_DRY_RUN_OWNER_SIGNOFF_EVIDENCE_MATRIX_REVIEW_DRAFT_ONLY`
- `TASK_CENTER_ADAPTER_DRY_RUN_OWNER_SIGNOFF_EVIDENCE_MATRIX_REVIEW_NO_APPROVAL`
- `TASK_CENTER_ADAPTER_DRY_RUN_OWNER_SIGNOFF_EVIDENCE_MATRIX_REVIEW_NO_DATABASE_READ`
- `TASK_CENTER_ADAPTER_DRY_RUN_OWNER_SIGNOFF_EVIDENCE_MATRIX_REVIEW_NO_DATABASE_CLIENT`
- `TASK_CENTER_ADAPTER_DRY_RUN_OWNER_SIGNOFF_EVIDENCE_MATRIX_REVIEW_NO_ENV_ENABLEMENT`
- `TASK_CENTER_ADAPTER_DRY_RUN_OWNER_SIGNOFF_EVIDENCE_MATRIX_REVIEW_NO_FILE_WRITE`
- `TASK_CENTER_ADAPTER_DRY_RUN_OWNER_SIGNOFF_EVIDENCE_MATRIX_REVIEW_NO_TASK_MUTATION`
- `TASK_CENTER_ADAPTER_DRY_RUN_OWNER_SIGNOFF_EVIDENCE_MATRIX_REVIEW_NO_REAL_DATA`
- `TASK_CENTER_ADAPTER_DRY_RUN_OWNER_SIGNOFF_EVIDENCE_MATRIX_REVIEW_NO_AI_OR_AUTOMATION`

## 4. Evidence Matrix Rows

| Code | Owner lane | Reviewer | Signoff state | Evidence artifact | Evidence storage rule | Stop rule |
|---|---|---|---|---|---|---|
| `OWNER_SIGNOFF_EVIDENCE_MATRIX_IT_DATA_SCOPE_FIRST` | IT_DATA | IT_DATA | `SIGNOFF_EVIDENCE_REVIEW_REQUIRED_NO_GO` | `SIGNED_SCOPE_FIRST_FILTER_MATRIX` | `CONTROLLED_EVIDENCE_OUTSIDE_GIT_OR_CHAT` | `NO_OWNER_SIGNOFF_WITHOUT_IT_DATA_EVIDENCE_REVIEW` |
| `OWNER_SIGNOFF_EVIDENCE_MATRIX_AUDIT_NEGATIVE_ACCESS` | Audit | Audit | `SIGNOFF_EVIDENCE_REVIEW_REQUIRED_NO_GO` | `SIGNED_NEGATIVE_ACCESS_TEST_PLAN` | `CONTROLLED_EVIDENCE_OUTSIDE_GIT_OR_CHAT` | `NO_OWNER_SIGNOFF_WITHOUT_AUDIT_EVIDENCE_REVIEW` |
| `OWNER_SIGNOFF_EVIDENCE_MATRIX_PHAP_CHE_RESTRICTED_DATA` | PHAP_CHE | PHAP_CHE | `SIGNOFF_EVIDENCE_REVIEW_REQUIRED_NO_GO` | `RESTRICTED_DATA_MINIMIZATION_DECISION` | `CONTROLLED_EVIDENCE_OUTSIDE_GIT_OR_CHAT` | `NO_OWNER_SIGNOFF_WITHOUT_PHAP_CHE_EVIDENCE_REVIEW` |
| `OWNER_SIGNOFF_EVIDENCE_MATRIX_DEPARTMENT_OWNER_TASK_BOUNDARY` | Department owner | Department owner | `SIGNOFF_EVIDENCE_REVIEW_REQUIRED_NO_GO` | `DEPARTMENT_TASK_FIELD_OWNERSHIP_MATRIX` | `CONTROLLED_EVIDENCE_OUTSIDE_GIT_OR_CHAT` | `NO_OWNER_SIGNOFF_WITHOUT_DEPARTMENT_OWNER_EVIDENCE_REVIEW` |
| `OWNER_SIGNOFF_EVIDENCE_MATRIX_BGH_PRODUCTION_NO_GO` | BGH | BGH | `SIGNOFF_EVIDENCE_REVIEW_REQUIRED_NO_GO` | `BGH_NO_PRODUCTION_GO_ACKNOWLEDGEMENT` | `CONTROLLED_EVIDENCE_OUTSIDE_GIT_OR_CHAT` | `NO_PRODUCTION_GO_NO_DEPLOY` |

## 5. Expected Local Commands

```powershell
node --check scripts/check-heu-task-center-adapter-dry-run-owner-signoff-evidence-matrix-review.mjs
npm.cmd run check:heu-task-center-adapter-dry-run-owner-signoff-evidence-matrix-review
npm.cmd run check:heu-task-center-adapter-dry-run-db-read-go-no-go-precheck
```

Expected output:

- `HEU_TASK_CENTER_ADAPTER_DRY_RUN_OWNER_SIGNOFF_EVIDENCE_MATRIX_REVIEW_READY: PASS_LOCAL`
- `TASK_CENTER_DATABASE_READY: NO_GO_OWNER_SIGNOFF_EVIDENCE_MATRIX_REVIEW_ONLY`
- `NO_RUNTIME_MUTATION: task center adapter dry-run owner signoff evidence matrix review checker only; no owner approval, official signoff, database client, database read, env enablement, file output write, table creation, SQL migration, task write, file upload, storage write, real-data fixture, AI call, paid automation, deploy, finance action or production GO`

## 6. Acceptance

This slice may be considered local-only ready when:

1. The owner signoff evidence matrix review rows are visible in the Department
   Task Inbox gate evidence panel.
2. The checker confirms all five evidence matrix rows.
3. Every row remains `SIGNOFF_EVIDENCE_REVIEW_REQUIRED_NO_GO`.
4. Every evidence storage rule remains
   `CONTROLLED_EVIDENCE_OUTSIDE_GIT_OR_CHAT`.
5. The prior HEU-DATA-035 checker links to this HEU-DATA-036 slice.
6. Database status remains
   `TASK_CENTER_DATABASE_READY: NO_GO_OWNER_SIGNOFF_EVIDENCE_MATRIX_REVIEW_ONLY`.

## 7. Risk

Main risk: treating this matrix as owner signoff or evidence approval.

Mitigation:

- The matrix is source/UI/checker-only.
- Every row remains `SIGNOFF_EVIDENCE_REVIEW_REQUIRED_NO_GO`.
- Controlled evidence stays outside Git/Codex/chat.
- It does not write files.
- It does not read env, database or real data.
- It does not approve UAT, evidence, owner GO/NO-GO or production.

## 8. Rollback

Rollback by reverting the PR/commit that introduces this slice.

No database rollback is required because this slice does not create schema,
database client, DB reads, task rows, Auth changes, scope grants, env
enablement, output file writes, uploads, storage writes, AI calls, paid
automation or production behavior.

## 9. SOP Slice Result Record

SOP-SCOPE:
- Add one owner signoff evidence matrix review after the DB read GO/NO-GO
  precheck.
- No owner approval, official signoff, runtime file output, database, runtime
  adapter, env, write path, AI or automation enablement.

SOP-CHECK:
- Focused checker required:
  `check:heu-task-center-adapter-dry-run-owner-signoff-evidence-matrix-review`.
- Previous checker required:
  `check:heu-task-center-adapter-dry-run-db-read-go-no-go-precheck`.

SOP-PROFESSIONAL:
- IT_DATA owns scope-first evidence review.
- Audit owns negative-access evidence review.
- Department owner owns task-boundary evidence review.

SOP-LEGAL:
- PHAP_CHE owns restricted-data evidence review.
- Controlled evidence must stay outside Git/Codex/chat.
- No raw PII, bank, payment, CCCD, password, token or secret is introduced.

SOP-LOGIC:
- Matrix records evidence artifacts, storage rules and stop rules only.
- It cannot be used as owner approval, UAT approval or DB readiness evidence.

SOP-VERIFY:
- `HEU_TASK_CENTER_ADAPTER_DRY_RUN_OWNER_SIGNOFF_EVIDENCE_MATRIX_REVIEW_READY: PASS_LOCAL`
- `TASK_CENTER_DATABASE_READY: NO_GO_OWNER_SIGNOFF_EVIDENCE_MATRIX_REVIEW_ONLY`

SOP-RESULT:
- CAN_SUA for Draft PR review.
- Production remains NO-GO.

SOP-NEXT:
- `HEU-DATA-037-TASK-CENTER-ADAPTER-DRY-RUN-OWNER-DECISION-QUEUE-REVIEW`.
  Only create an owner decision queue review after IT_DATA + Audit confirm that
  036 is still matrix-only and every row remains
  `SIGNOFF_EVIDENCE_REVIEW_REQUIRED_NO_GO`.
