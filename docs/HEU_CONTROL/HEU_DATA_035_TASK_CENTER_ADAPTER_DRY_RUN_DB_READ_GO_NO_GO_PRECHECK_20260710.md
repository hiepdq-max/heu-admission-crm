# HEU Data 035 - Task Center Adapter Dry-Run DB Read GO/NO-GO Precheck

Task ID: HEU-DATA-035-TASK-CENTER-ADAPTER-DRY-RUN-DB-READ-GO-NO-GO-PRECHECK
Date: 2026-07-10
Repository: heu-admission-crm
Status: PASS_LOCAL_PRECHECK_ONLY
Production status: NO-GO
Runtime status: DB_READ_GO_NO_GO_PRECHECK_READY: PASS_LOCAL_PRECHECK_ONLY
Database status: TASK_CENTER_DATABASE_READY: NO_GO_DB_READ_GO_NO_GO_PRECHECK_ONLY

## 1. Purpose

This slice adds a source/UI/checker-only DB read GO/NO-GO precheck after
`HEU-DATA-034`.

It does not approve DB read. It records the exact owner evidence required
before any future Task Center dry-run adapter can move from static/synthetic
checks toward a database-read planning decision.

Every row remains `NO_GO_REQUIRES_OWNER_DECISION`.

## 2. Scope

Files in scope:

- `docs/HEU_CONTROL/HEU_DATA_035_TASK_CENTER_ADAPTER_DRY_RUN_DB_READ_GO_NO_GO_PRECHECK_20260710.md`
- `components/data-confirmation/department-task-inbox.tsx`
- `lib/task-center-gate-evidence-panel-source.ts`
- `docs/HEU_CONTROL/HEU_APP_SHELL_001_STAGE_FILE_MANIFEST_20260709.md`
- `docs/HEU_CONTROL/HEU_DATA_034_TASK_CENTER_ADAPTER_DRY_RUN_REVIEW_DECISION_PACKET_20260710.md`
- `scripts/check-heu-task-center-adapter-dry-run-review-decision-packet.mjs`
- `scripts/check-heu-task-center-adapter-dry-run-db-read-go-no-go-precheck.mjs`
- `package.json`

Out of scope:

- No owner approval.
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

- `TASK_CENTER_ADAPTER_DRY_RUN_DB_READ_GO_NO_GO_PRECHECK_ONLY`
- `TASK_CENTER_ADAPTER_DRY_RUN_DB_READ_GO_NO_GO_PRECHECK_READONLY`
- `TASK_CENTER_ADAPTER_DRY_RUN_DB_READ_GO_NO_GO_PRECHECK_DRAFT_ONLY`
- `TASK_CENTER_ADAPTER_DRY_RUN_DB_READ_GO_NO_GO_PRECHECK_NO_APPROVAL`
- `TASK_CENTER_ADAPTER_DRY_RUN_DB_READ_GO_NO_GO_PRECHECK_NO_DATABASE_READ`
- `TASK_CENTER_ADAPTER_DRY_RUN_DB_READ_GO_NO_GO_PRECHECK_NO_DATABASE_CLIENT`
- `TASK_CENTER_ADAPTER_DRY_RUN_DB_READ_GO_NO_GO_PRECHECK_NO_ENV_ENABLEMENT`
- `TASK_CENTER_ADAPTER_DRY_RUN_DB_READ_GO_NO_GO_PRECHECK_NO_FILE_WRITE`
- `TASK_CENTER_ADAPTER_DRY_RUN_DB_READ_GO_NO_GO_PRECHECK_NO_TASK_MUTATION`
- `TASK_CENTER_ADAPTER_DRY_RUN_DB_READ_GO_NO_GO_PRECHECK_NO_REAL_DATA`
- `TASK_CENTER_ADAPTER_DRY_RUN_DB_READ_GO_NO_GO_PRECHECK_NO_AI_OR_AUTOMATION`

## 4. GO/NO-GO Rows

| Code | Reviewer | GO/NO-GO | Required evidence | Blocked action | Stop rule |
|---|---|---|---|---|---|
| `DB_READ_GO_NO_GO_PRECHECK_IT_DATA_SCOPE_FIRST` | IT_DATA | `NO_GO_REQUIRES_OWNER_DECISION` | `SIGNED_SCOPE_FIRST_FILTER_MATRIX` | `DATABASE_READ_ADAPTER_ENABLEMENT` | `NO_DB_READ_WITHOUT_IT_DATA_SCOPE_FIRST_SIGNOFF` |
| `DB_READ_GO_NO_GO_PRECHECK_AUDIT_NEGATIVE_ACCESS` | Audit | `NO_GO_REQUIRES_OWNER_DECISION` | `SIGNED_NEGATIVE_ACCESS_TEST_PLAN` | `DATABASE_READ_RUNTIME_TEST` | `NO_DB_READ_WITHOUT_AUDIT_NEGATIVE_ACCESS_SIGNOFF` |
| `DB_READ_GO_NO_GO_PRECHECK_PHAP_CHE_RESTRICTED_DATA` | PHAP_CHE | `NO_GO_REQUIRES_OWNER_DECISION` | `RESTRICTED_DATA_MINIMIZATION_DECISION` | `RAW_PII_PAYMENT_FIELD_ACCESS` | `NO_RAW_PII_OR_PAYMENT_DB_READ` |
| `DB_READ_GO_NO_GO_PRECHECK_DEPARTMENT_OWNER_TASK_BOUNDARY` | Department owner | `NO_GO_REQUIRES_OWNER_DECISION` | `DEPARTMENT_TASK_FIELD_OWNERSHIP_MATRIX` | `TASK_MUTATION_OR_CROSS_DEPARTMENT_READ` | `NO_CROSS_SCOPE_TASK_READ_OR_WRITE` |
| `DB_READ_GO_NO_GO_PRECHECK_BGH_PRODUCTION_NO_GO` | BGH | `NO_GO_REQUIRES_OWNER_DECISION` | `BGH_NO_PRODUCTION_GO_ACKNOWLEDGEMENT` | `PRODUCTION_DEPLOY_OR_OWNER_GO` | `NO_PRODUCTION_GO_NO_DEPLOY` |

## 5. Expected Local Commands

```powershell
node --check scripts/check-heu-task-center-adapter-dry-run-db-read-go-no-go-precheck.mjs
npm.cmd run check:heu-task-center-adapter-dry-run-db-read-go-no-go-precheck
npm.cmd run check:heu-task-center-adapter-dry-run-review-decision-packet
```

Expected output:

- `HEU_TASK_CENTER_ADAPTER_DRY_RUN_DB_READ_GO_NO_GO_PRECHECK_READY: PASS_LOCAL`
- `TASK_CENTER_DATABASE_READY: NO_GO_DB_READ_GO_NO_GO_PRECHECK_ONLY`
- `NO_RUNTIME_MUTATION: task center adapter dry-run DB read GO/NO-GO precheck checker only; no owner approval, database client, database read, env enablement, file output write, table creation, SQL migration, task write, file upload, storage write, real-data fixture, AI call, paid automation, deploy, finance action or production GO`

## 6. Acceptance

This slice may be considered local-only ready when:

1. The DB read GO/NO-GO precheck rows are visible in the Department Task Inbox
   gate evidence panel.
2. The checker confirms all five GO/NO-GO precheck rows.
3. Every row remains `NO_GO_REQUIRES_OWNER_DECISION`.
4. The checker confirms this remains source/UI/checker-only.
5. The prior HEU-DATA-034 checker links to this HEU-DATA-035 slice.
6. Database status remains
   `TASK_CENTER_DATABASE_READY: NO_GO_DB_READ_GO_NO_GO_PRECHECK_ONLY`.

## 7. Risk

Main risk: treating this precheck as approval to connect or test a database
adapter.

Mitigation:

- The precheck is source/UI/checker-only.
- Every row remains `NO_GO_REQUIRES_OWNER_DECISION`.
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
- Add one DB read GO/NO-GO precheck after the review decision packet.
- No owner approval, runtime file output, database, runtime adapter, env, write
  path, AI or automation enablement.

SOP-CHECK:
- Focused checker required:
  `check:heu-task-center-adapter-dry-run-db-read-go-no-go-precheck`.
- Previous checker required:
  `check:heu-task-center-adapter-dry-run-review-decision-packet`.

SOP-PROFESSIONAL:
- IT_DATA owns scope-first DB read precheck evidence.
- Audit owns negative-access DB read precheck evidence.
- Department owner owns task-boundary precheck evidence.

SOP-LEGAL:
- PHAP_CHE owns restricted-data minimization review.
- No raw PII, bank, payment, CCCD, password, token or secret is introduced.

SOP-LOGIC:
- Precheck records blocked actions and stop rules only.
- It cannot be used as owner approval, UAT approval or DB readiness evidence.

SOP-VERIFY:
- `HEU_TASK_CENTER_ADAPTER_DRY_RUN_DB_READ_GO_NO_GO_PRECHECK_READY: PASS_LOCAL`
- `TASK_CENTER_DATABASE_READY: NO_GO_DB_READ_GO_NO_GO_PRECHECK_ONLY`

SOP-RESULT:
- CAN_SUA for Draft PR review.
- Production remains NO-GO.

SOP-NEXT:
- `HEU-DATA-036-TASK-CENTER-ADAPTER-DRY-RUN-OWNER-SIGNOFF-EVIDENCE-MATRIX-REVIEW`.
  Only create an owner signoff evidence matrix after IT_DATA + Audit confirm
  that 035 is still precheck-only and every row remains
  `NO_GO_REQUIRES_OWNER_DECISION`.
