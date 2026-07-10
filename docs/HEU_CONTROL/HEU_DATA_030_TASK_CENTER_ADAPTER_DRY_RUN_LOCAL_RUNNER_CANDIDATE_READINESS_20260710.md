# HEU-DATA-030 - Task Center Adapter Dry-run Local Runner Candidate Readiness

Task ID: HEU-DATA-030-TASK-CENTER-ADAPTER-DRY-RUN-LOCAL-RUNNER-CANDIDATE-READINESS

Status: PASS_LOCAL_READINESS_ONLY

Production status: NO-GO

Runtime status: LOCAL_RUNNER_CANDIDATE_READINESS_READY: PASS_LOCAL_READINESS_ONLY

Database status: TASK_CENTER_DATABASE_READY: NO_GO_LOCAL_RUNNER_CANDIDATE_READINESS_ONLY

## 1. Muc Tieu

Khoa dieu kien truoc khi tao local runner candidate cho Task Center adapter
dry-run. Slice nay chua tao runner executable; no chi xac nhan chuoi fixture,
runner plan va static-check da du dieu kien de IT_DATA + Audit review buoc tao
runner local deterministic tiep theo.

## 2. Pham Vi

In scope:
- `lib/task-center-gate-evidence-panel-source.ts`
- `components/data-confirmation/department-task-inbox.tsx`
- `scripts/check-heu-task-center-adapter-dry-run-local-runner-candidate-readiness.mjs`
- `docs/HEU_CONTROL/HEU_DATA_030_TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_CANDIDATE_READINESS_20260710.md`
- manifest va package script lien quan

Out of scope:
- Khong tao runner executable.
- Khong tao fixture runtime file.
- Khong tao DB client.
- Khong doc database.
- Khong ghi database.
- Khong bat env.
- Khong tao migration.
- Khong tao task that.
- Khong dung du lieu that.
- Khong goi AI.
- Khong tao automation step.
- Khong deploy.

## 3. Boundary Tokens

- `TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_CANDIDATE_READINESS_ONLY`
- `TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_CANDIDATE_READINESS_READONLY`
- `TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_CANDIDATE_READINESS_DRAFT_ONLY`
- `TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_CANDIDATE_READINESS_NO_APPROVAL`
- `TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_CANDIDATE_READINESS_NO_DATABASE_READ`
- `TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_CANDIDATE_READINESS_NO_DATABASE_CLIENT`
- `TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_CANDIDATE_READINESS_NO_ENV_ENABLEMENT`
- `TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_CANDIDATE_READINESS_NO_TASK_MUTATION`
- `TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_CANDIDATE_READINESS_NO_REAL_DATA`
- `TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_CANDIDATE_READINESS_NO_AI_OR_AUTOMATION`
- `NO_DATABASE_CLIENT_CREATED`
- `NO_DATABASE_READ_EXECUTED`
- `NO_ENV_ENABLEMENT`
- `NO_TASK_MUTATION_ROUTE_CREATED`
- `NO_REAL_USER_DATA`
- `NO_AI_CALL_NO_AUTOMATION_STEP`
- `NO_RUNTIME_FIXTURE_FILE_CREATED`
- `NO_RUNTIME_RUNNER_FILE_CREATED`

## 4. Readiness Matrix

| Code | Reviewer | Readiness gate | Prerequisite | Expected evidence | Stop rule |
|---|---|---|---|---|---|
| `LOCAL_RUNNER_CANDIDATE_STATIC_CHECK_GREEN` | IT_DATA | `ASSERT_STATIC_CHECK_DESIGN_PASS` | `RUNNER_STATIC_CHECK_DESIGN_READY` | `CHECKER_029_PASS_LOCAL` | `NO_RUNTIME_RUNNER_FILE_CREATED` |
| `LOCAL_RUNNER_CANDIDATE_FIXTURE_CHAIN_GREEN` | Audit | `ASSERT_FIXTURE_CONTRACT_AND_RUNNER_PLAN_LINKED` | `SYNTHETIC_FIXTURE_CONTRACT_AND_RUNNER_PLAN_READY` | `CHECKERS_027_028_PASS_LOCAL` | `NO_DATABASE_READ_EXECUTED` |
| `LOCAL_RUNNER_CANDIDATE_RESTRICTED_DATA_BOUNDARY` | PHAP_CHE | `ASSERT_RESTRICTED_DATA_EXCLUSION_READY` | `NO_RAW_PII_NO_PAYMENT_DATA` | `PHAP_CHE_RESTRICTED_DATA_BOUNDARY_SIGNOFF_DRAFT` | `NO_RAW_PII_NO_PAYMENT_DATA` |
| `LOCAL_RUNNER_CANDIDATE_TASK_MUTATION_ABSENT` | Department owner | `ASSERT_NO_TASK_WRITE_OR_STATUS_CHANGE` | `STATIC_CHECK_NO_TASK_MUTATION` | `TASK_MUTATION_PATH_ABSENT_CONFIRMED` | `NO_TASK_MUTATION_ROUTE_CREATED` |
| `LOCAL_RUNNER_CANDIDATE_PRODUCTION_SIGNAL_ABSENT` | BGH | `ASSERT_NO_DEPLOY_OR_PRODUCTION_GO` | `STATIC_CHECK_NO_PRODUCTION_SIGNAL` | `NO_PRODUCTION_GO_NO_DEPLOY` | `NO_PRODUCTION_GO_NO_DEPLOY` |

## 5. Readiness Rules

- Readiness chi la gate truoc khi tao runner local, chua co file runner
  executable.
- Checker chi doc source/doc/package/manifest va xac nhan chuoi 027-029 da
  duoc link.
- Local runner candidate tiep theo neu duoc tao phai la deterministic local
  code, khong doc database, khong dung env, khong goi AI va khong automation.
- Neu thieu checker 027/028/029 PASS, khong duoc tao local runner candidate.
- Neu can raw PII/payment/bank data, phai dung lai va bao NO-GO.

## 6. AI Cost Guard

This slice keeps AI and paid automation disabled:
- AI may only help review this document/checker.
- Runtime UI cannot call AI.
- No Make/Zapier/paid automation step is introduced.
- Future runner must be deterministic local code first.

## 7. Owner Review

| Lane | Required decision before creating local runner file |
|---|---|
| IT_DATA | Confirm static-check design and source tree prove runner path is still absent. |
| Audit | Confirm 027/028/029 checker chain is green and sufficient. |
| PHAP_CHE | Confirm no raw PII/payment/bank fixture is required. |
| Department owner | Confirm runner candidate must stay report-only and no task mutation. |
| BGH | Confirm this is not production approval. |

## 8. Local Verification

Required commands:

```powershell
node --check scripts/check-heu-task-center-adapter-dry-run-local-runner-candidate-readiness.mjs
npm.cmd run check:heu-task-center-adapter-dry-run-local-runner-candidate-readiness
npm.cmd run check:heu-task-center-adapter-dry-run-runner-static-check-design
```

Expected outputs:
- `HEU_TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_CANDIDATE_READINESS_READY: PASS_LOCAL`
- `TASK_CENTER_DATABASE_READY: NO_GO_LOCAL_RUNNER_CANDIDATE_READINESS_ONLY`

## 9. Risk

Main risk: treating readiness as permission to create a DB adapter or production
runner.

Control:
- Result remains `PASS_LOCAL_READINESS_ONLY`.
- Database remains `NO_GO_LOCAL_RUNNER_CANDIDATE_READINESS_ONLY`.
- No runtime runner file is created.
- No database client or read path is created.
- No owner approval is inferred.
- No production GO is inferred.

## 10. Rollback

Rollback by reverting the PR that adds this readiness gate.

No database rollback is required because this slice does not create schema,
fixture runtime files, runner executable files, task rows, Auth changes, scope
grants, env enablement, uploads, storage writes, AI calls, paid automation or
production config.

## 11. SOP Slice Result Record

SOP-SCOPE:
- `HEU-DATA-030` adds local runner candidate readiness before creating any
  executable runner.
- Scope is UI readiness packet + TypeScript source + docs + checker only.

SOP-CHECK:
- Required local command:
  `npm.cmd run check:heu-task-center-adapter-dry-run-local-runner-candidate-readiness`.

SOP-PROFESSIONAL:
- IT_DATA owns static-check and runner path absence.
- Audit owns 027/028/029 checker chain.
- Department owners own no task mutation readiness.

SOP-LEGAL:
- PHAP_CHE owns raw PII/payment/bank exclusion.
- No legal approval is inferred from this local readiness gate.

SOP-LOGIC:
- Readiness remains non-executable until owner evidence exists.
- No runtime DB path is added.
- No runner file is created.

SOP-VERIFY:
- Local checker must confirm doc/source/component/package/manifest tokens.

SOP-RESULT:
- `PASS_LOCAL_READINESS_ONLY`.
- `LOCAL_RUNNER_CANDIDATE_READINESS_READY: PASS_LOCAL_READINESS_ONLY`.
- `TASK_CENTER_DATABASE_READY: NO_GO_LOCAL_RUNNER_CANDIDATE_READINESS_ONLY`.

SOP-NEXT:
- `HEU-DATA-031-TASK-CENTER-ADAPTER-DRY-RUN-LOCAL-RUNNER-SCRIPT-DRAFT`.
- Next slice may create deterministic local runner script only if it remains
  local, synthetic, no DB client, no env enablement, no task mutation, no real
  data, no AI call and no production GO.

## 12. Final Boundary

Stage D - internal controlled test only.

Production remains NO-GO.

This local runner candidate readiness gate does not approve production,
migration, finance action, evidence acceptance, UAT acceptance, owner GO/NO-GO,
AI write access or a real Task Center database adapter.
