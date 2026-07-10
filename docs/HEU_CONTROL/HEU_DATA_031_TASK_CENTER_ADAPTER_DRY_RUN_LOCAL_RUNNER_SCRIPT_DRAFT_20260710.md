# HEU-DATA-031 - Task Center Adapter Dry-run Local Runner Script Draft

Task ID: HEU-DATA-031-TASK-CENTER-ADAPTER-DRY-RUN-LOCAL-RUNNER-SCRIPT-DRAFT

Status: PASS_LOCAL_SCRIPT_ONLY

Production status: NO-GO

Runtime status: LOCAL_RUNNER_SCRIPT_DRAFT_READY: PASS_LOCAL_SCRIPT_ONLY

Database status: TASK_CENTER_DATABASE_READY: NO_GO_LOCAL_RUNNER_SCRIPT_DRAFT_ONLY

## 1. Muc Tieu

Tao runner script local deterministic dau tien cho Task Center adapter dry-run.
Runner nay chi chay fixture synthetic in-memory va in PASS/NO-GO report local.
Day la cong cu kiem tra de IT_DATA + Audit review truoc khi xet DB read adapter.

## 2. Pham Vi

In scope:
- `scripts/dry-run-heu-task-center-adapter-local-runner.mjs`
- `scripts/check-heu-task-center-adapter-dry-run-local-runner-script-draft.mjs`
- `lib/task-center-gate-evidence-panel-source.ts`
- `components/data-confirmation/department-task-inbox.tsx`
- `docs/HEU_CONTROL/HEU_DATA_031_TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_SCRIPT_DRAFT_20260710.md`
- manifest va package script lien quan

Out of scope:
- Khong tao DB client.
- Khong doc database.
- Khong ghi database.
- Khong bat env.
- Khong tao migration.
- Khong tao task that.
- Khong mutate task status.
- Khong dung du lieu that.
- Khong goi AI.
- Khong tao automation step.
- Khong deploy.

## 3. Boundary Tokens

- `TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_SCRIPT_DRAFT_ONLY`
- `TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_SCRIPT_DRAFT_READONLY`
- `TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_SCRIPT_DRAFT_DRAFT_ONLY`
- `TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_SCRIPT_DRAFT_NO_APPROVAL`
- `TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_SCRIPT_DRAFT_NO_DATABASE_READ`
- `TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_SCRIPT_DRAFT_NO_DATABASE_CLIENT`
- `TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_SCRIPT_DRAFT_NO_ENV_ENABLEMENT`
- `TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_SCRIPT_DRAFT_NO_TASK_MUTATION`
- `TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_SCRIPT_DRAFT_NO_REAL_DATA`
- `TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_SCRIPT_DRAFT_NO_AI_OR_AUTOMATION`
- `NO_DATABASE_CLIENT_CREATED`
- `NO_DATABASE_READ_EXECUTED`
- `NO_ENV_ENABLEMENT`
- `NO_TASK_MUTATION_ROUTE_CREATED`
- `NO_REAL_USER_DATA`
- `NO_AI_CALL_NO_AUTOMATION_STEP`
- `LOCAL_RUNNER_REPORT_ONLY`

## 4. Runner Matrix

| Code | Reviewer | Runner assertion | Synthetic input | Expected report | Stop rule |
|---|---|---|---|---|---|
| `LOCAL_RUNNER_SCRIPT_SCOPE_MATCH_REPORT` | IT_DATA | `ASSERT_SYN_SCOPE_MATCH_VISIBLE` | `SYN_ACTOR_IT_DATA_SCOPED_READER` | `LOCAL_RUNNER_CASE_PASS_SCOPE_MATCH` | `NO_DATABASE_READ_EXECUTED` |
| `LOCAL_RUNNER_SCRIPT_NO_SCOPE_BLOCK` | Audit | `ASSERT_SYN_NO_SCOPE_BLOCKED` | `SYN_ACTOR_AUDIT_NO_SCOPE` | `LOCAL_RUNNER_CASE_PASS_NO_SCOPE_BLOCKED` | `NO_BROAD_FALLBACK_ALLOWED` |
| `LOCAL_RUNNER_SCRIPT_RESTRICTED_FIELDS_ABSENT` | PHAP_CHE | `ASSERT_SYN_RESTRICTED_FIELDS_ABSENT` | `SYN_TASK_RESTRICTED_FIELDS_MASKED` | `LOCAL_RUNNER_CASE_PASS_RESTRICTED_FIELDS_ABSENT` | `NO_RAW_PII_NO_PAYMENT_DATA` |
| `LOCAL_RUNNER_SCRIPT_DEPARTMENT_MISMATCH_BLOCK` | Department owner | `ASSERT_SYN_DEPARTMENT_MISMATCH_BLOCKED` | `SYN_ACTOR_DEPARTMENT_A_TO_TASK_DEPARTMENT_B` | `LOCAL_RUNNER_CASE_PASS_DEPARTMENT_MISMATCH_BLOCKED` | `NO_TASK_MUTATION_ROUTE_CREATED` |
| `LOCAL_RUNNER_SCRIPT_PRODUCTION_NO_GO_REPORT` | BGH | `ASSERT_SYN_REPORT_ONLY_NO_APPROVAL` | `SYN_ACTOR_BGH_READONLY` | `LOCAL_RUNNER_CASE_PASS_PRODUCTION_NO_GO` | `NO_PRODUCTION_GO_NO_DEPLOY` |

## 5. Runner Rules

- Runner script is `scripts/dry-run-heu-task-center-adapter-local-runner.mjs`.
- Runner dung synthetic fixture in-memory only.
- Runner chi in JSON/report ra stdout.
- Runner khong import Supabase, khong doc file, khong ghi file, khong doc env,
  khong goi network, khong goi AI.
- Runner khong tao task, khong approve, khong update status, khong ghi audit DB.
- Neu co case fail, runner exit non-zero va bao `NO_GO`.

## 6. AI Cost Guard

This slice keeps AI and paid automation disabled:
- AI may only help review this document/checker.
- Runtime UI cannot call AI.
- No Make/Zapier/paid automation step is introduced.
- Runner is deterministic local Node.js code only.

## 7. Owner Review

| Lane | Required decision before DB read adapter |
|---|---|
| IT_DATA | Confirm synthetic scope-match report is enough for local dry-run. |
| Audit | Confirm no-scope and mismatch cases prove no broad fallback. |
| PHAP_CHE | Confirm restricted-data case uses no raw PII/payment/bank data. |
| Department owner | Confirm runner remains report-only and no task mutation. |
| BGH | Confirm this is not production approval. |

## 8. Local Verification

Required commands:

```powershell
node --check scripts/dry-run-heu-task-center-adapter-local-runner.mjs
node scripts/dry-run-heu-task-center-adapter-local-runner.mjs
node --check scripts/check-heu-task-center-adapter-dry-run-local-runner-script-draft.mjs
npm.cmd run dry-run:heu-task-center-adapter-local-runner
npm.cmd run check:heu-task-center-adapter-dry-run-local-runner-script-draft
```

Expected outputs:
- `HEU_TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_SCRIPT_DRAFT_READY: PASS_LOCAL`
- `TASK_CENTER_DATABASE_READY: NO_GO_LOCAL_RUNNER_SCRIPT_DRAFT_ONLY`
- `LOCAL_RUNNER_REPORT_ONLY: PASS_LOCAL_SYNTHETIC_IN_MEMORY`

## 9. Risk

Main risk: treating this local synthetic runner as proof that the real database
adapter is ready.

Control:
- Result remains `PASS_LOCAL_SCRIPT_ONLY`.
- Database remains `NO_GO_LOCAL_RUNNER_SCRIPT_DRAFT_ONLY`.
- Runner stays synthetic and in-memory.
- No database client or read path is created.
- No owner approval is inferred.
- No production GO is inferred.

## 10. Rollback

Rollback by reverting the PR that adds this runner script draft.

No database rollback is required because this slice does not create schema,
database client, DB reads, task rows, Auth changes, scope grants, env
enablement, uploads, storage writes, AI calls, paid automation or production
config.

## 11. SOP Slice Result Record

SOP-SCOPE:
- `HEU-DATA-031` adds a deterministic local runner script for synthetic dry-run.
- Scope is runner script + UI runner packet + TypeScript source + docs +
  checker only.

SOP-CHECK:
- Required local commands:
  `npm.cmd run dry-run:heu-task-center-adapter-local-runner`
  `npm.cmd run check:heu-task-center-adapter-dry-run-local-runner-script-draft`

SOP-PROFESSIONAL:
- IT_DATA owns synthetic scope-match report.
- Audit owns no-scope/mismatch coverage.
- Department owners own no task mutation interpretation.

SOP-LEGAL:
- PHAP_CHE owns raw PII/payment/bank exclusion.
- No legal approval is inferred from this local script.

SOP-LOGIC:
- Runner remains synthetic and report-only.
- No runtime DB path is added.
- No task mutation path is added.

SOP-VERIFY:
- Local checker must confirm doc/source/component/package/manifest/runner tokens.

SOP-RESULT:
- `PASS_LOCAL_SCRIPT_ONLY`.
- `LOCAL_RUNNER_SCRIPT_DRAFT_READY: PASS_LOCAL_SCRIPT_ONLY`.
- `TASK_CENTER_DATABASE_READY: NO_GO_LOCAL_RUNNER_SCRIPT_DRAFT_ONLY`.

SOP-NEXT:
- `HEU-DATA-032-TASK-CENTER-ADAPTER-DRY-RUN-RUNNER-OUTPUT-LEDGER`.
- Next slice should define how to capture runner output as local evidence
  without writing database rows, uploading files, calling AI or enabling paid
  automation.

## 12. Final Boundary

Stage D - internal controlled test only.

Production remains NO-GO.

This local runner script draft does not approve production, migration, finance
action, evidence acceptance, UAT acceptance, owner GO/NO-GO, AI write access or
a real Task Center database adapter.
