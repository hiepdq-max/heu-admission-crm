# HEU-DATA-029 - Task Center Adapter Dry-run Runner Static-check Design

Task ID: HEU-DATA-029-TASK-CENTER-ADAPTER-DRY-RUN-RUNNER-STATIC-CHECK-DESIGN

Status: PASS_LOCAL_DESIGN_ONLY

Production status: NO-GO

Runtime status: RUNNER_STATIC_CHECK_DESIGN_READY: PASS_LOCAL_DESIGN_ONLY

Database status: TASK_CENTER_DATABASE_READY: NO_GO_RUNNER_STATIC_CHECK_DESIGN_ONLY

## 1. Muc Tieu

Khoa thiet ke static-check cho runner dry-run truoc khi tao local runner
candidate hay Task Center database adapter. Slice nay chi mo ta cac assert tinh
can PASS truoc khi co runner executable.

## 2. Pham Vi

In scope:
- `lib/task-center-gate-evidence-panel-source.ts`
- `components/data-confirmation/department-task-inbox.tsx`
- `scripts/check-heu-task-center-adapter-dry-run-runner-static-check-design.mjs`
- `docs/HEU_CONTROL/HEU_DATA_029_TASK_CENTER_ADAPTER_DRY_RUN_RUNNER_STATIC_CHECK_DESIGN_20260710.md`
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

- `TASK_CENTER_ADAPTER_DRY_RUN_RUNNER_STATIC_CHECK_DESIGN_ONLY`
- `TASK_CENTER_ADAPTER_DRY_RUN_RUNNER_STATIC_CHECK_DESIGN_READONLY`
- `TASK_CENTER_ADAPTER_DRY_RUN_RUNNER_STATIC_CHECK_DESIGN_DRAFT_ONLY`
- `TASK_CENTER_ADAPTER_DRY_RUN_RUNNER_STATIC_CHECK_DESIGN_NO_APPROVAL`
- `TASK_CENTER_ADAPTER_DRY_RUN_RUNNER_STATIC_CHECK_DESIGN_NO_DATABASE_READ`
- `TASK_CENTER_ADAPTER_DRY_RUN_RUNNER_STATIC_CHECK_DESIGN_NO_DATABASE_CLIENT`
- `TASK_CENTER_ADAPTER_DRY_RUN_RUNNER_STATIC_CHECK_DESIGN_NO_ENV_ENABLEMENT`
- `TASK_CENTER_ADAPTER_DRY_RUN_RUNNER_STATIC_CHECK_DESIGN_NO_TASK_MUTATION`
- `TASK_CENTER_ADAPTER_DRY_RUN_RUNNER_STATIC_CHECK_DESIGN_NO_REAL_DATA`
- `TASK_CENTER_ADAPTER_DRY_RUN_RUNNER_STATIC_CHECK_DESIGN_NO_AI_OR_AUTOMATION`
- `NO_DATABASE_CLIENT_CREATED`
- `NO_DATABASE_READ_EXECUTED`
- `NO_ENV_ENABLEMENT`
- `NO_TASK_MUTATION_ROUTE_CREATED`
- `NO_REAL_USER_DATA`
- `NO_AI_CALL_NO_AUTOMATION_STEP`
- `NO_RUNTIME_FIXTURE_FILE_CREATED`
- `NO_RUNTIME_RUNNER_FILE_CREATED`

## 4. Static-check Matrix

| Code | Reviewer | Static check | Input source | Expected output | Stop rule |
|---|---|---|---|---|---|
| `STATIC_CHECK_RUNNER_FILE_ABSENT` | IT_DATA | `ASSERT_NO_RUNTIME_RUNNER_FILE` | `SOURCE_TREE_ONLY` | `RUNNER_FILE_ABSENT_CONFIRMED` | `NO_RUNTIME_RUNNER_FILE_CREATED` |
| `STATIC_CHECK_NO_DB_CLIENT` | Audit | `ASSERT_NO_DATABASE_CLIENT_OR_READ` | `SOURCE_TREE_ONLY` | `NO_DATABASE_CLIENT_CREATED` | `NO_DATABASE_READ_EXECUTED` |
| `STATIC_CHECK_NO_RESTRICTED_DATA` | PHAP_CHE | `ASSERT_NO_RAW_PII_PAYMENT_BANK_FIXTURE` | `DOC_AND_SOURCE_TOKENS_ONLY` | `NO_RAW_PII_NO_PAYMENT_DATA` | `NO_RAW_PII_NO_PAYMENT_DATA` |
| `STATIC_CHECK_NO_TASK_MUTATION` | Department owner | `ASSERT_NO_TASK_WRITE_OR_STATUS_CHANGE` | `SOURCE_TREE_ONLY` | `NO_TASK_MUTATION_ROUTE_CREATED` | `NO_TASK_MUTATION_ROUTE_CREATED` |
| `STATIC_CHECK_NO_PRODUCTION_SIGNAL` | BGH | `ASSERT_NO_DEPLOY_OR_PRODUCTION_GO` | `DOC_AND_SOURCE_TOKENS_ONLY` | `NO_PRODUCTION_GO_NO_DEPLOY` | `NO_PRODUCTION_GO_NO_DEPLOY` |

## 5. Static-check Rules

- Static-check design chi la thiet ke, chua co file runner executable.
- Checker chi doc source/doc/package/manifest, khong chay runtime runner.
- Source of truth la source tree va doc tokens, khong den tu database.
- Static-check phai fail neu thay DB client/read/write, env enablement, task
  mutation, raw PII/payment/bank fixture, AI call, paid automation, deploy hay
  production GO.
- Local runner candidate chi duoc xet sau khi IT_DATA + Audit chap nhan
  static-check design.

## 6. AI Cost Guard

This slice keeps AI and paid automation disabled:
- AI may only help review this document/checker.
- Runtime UI cannot call AI.
- No Make/Zapier/paid automation step is introduced.
- Future runner must be deterministic local code first.

## 7. Owner Review

| Lane | Required decision before local runner candidate |
|---|---|
| IT_DATA | Confirm static-check can prove no runtime runner file exists. |
| Audit | Confirm static-check catches database client/read/write and broad fallback. |
| PHAP_CHE | Confirm restricted-data static-check does not need raw PII/payment/bank data. |
| Department owner | Confirm task mutation and status-change paths remain absent. |
| BGH | Confirm this is not production approval. |

## 8. Local Verification

Required commands:

```powershell
node --check scripts/check-heu-task-center-adapter-dry-run-runner-static-check-design.mjs
npm.cmd run check:heu-task-center-adapter-dry-run-runner-static-check-design
npm.cmd run check:heu-task-center-adapter-dry-run-synthetic-fixture-runner-plan
```

Expected outputs:
- `HEU_TASK_CENTER_ADAPTER_DRY_RUN_RUNNER_STATIC_CHECK_DESIGN_READY: PASS_LOCAL`
- `TASK_CENTER_DATABASE_READY: NO_GO_RUNNER_STATIC_CHECK_DESIGN_ONLY`

## 9. Risk

Main risk: treating static-check design as executable runner proof.

Control:
- Result remains `PASS_LOCAL_DESIGN_ONLY`.
- Database remains `NO_GO_RUNNER_STATIC_CHECK_DESIGN_ONLY`.
- No runtime runner file is created.
- No database client or read path is created.
- No owner approval is inferred.
- No production GO is inferred.

## 10. Rollback

Rollback by reverting the PR that adds this static-check design.

No database rollback is required because this slice does not create schema,
fixture runtime files, runner executable files, task rows, Auth changes, scope
grants, env enablement, uploads, storage writes, AI calls, paid automation or
production config.

## 11. SOP Slice Result Record

SOP-SCOPE:
- `HEU-DATA-029` adds runner static-check design before local runner candidate.
- Scope is UI static-check packet + TypeScript source + docs + checker only.

SOP-CHECK:
- Required local command:
  `npm.cmd run check:heu-task-center-adapter-dry-run-runner-static-check-design`.

SOP-PROFESSIONAL:
- IT_DATA owns runner-file absence boundary.
- Audit owns DB client/read/write absence coverage.
- Department owners own task mutation absence review.

SOP-LEGAL:
- PHAP_CHE owns raw PII/payment/bank exclusion.
- No legal approval is inferred from this local design.

SOP-LOGIC:
- Design remains non-executable until owner evidence exists.
- No runtime DB path is added.
- No runner file is created.

SOP-VERIFY:
- Local checker must confirm doc/source/component/package/manifest tokens.

SOP-RESULT:
- `PASS_LOCAL_DESIGN_ONLY`.
- `RUNNER_STATIC_CHECK_DESIGN_READY: PASS_LOCAL_DESIGN_ONLY`.
- `TASK_CENTER_DATABASE_READY: NO_GO_RUNNER_STATIC_CHECK_DESIGN_ONLY`.

SOP-NEXT:
- `HEU-DATA-030-TASK-CENTER-ADAPTER-DRY-RUN-LOCAL-RUNNER-CANDIDATE-READINESS`.
- Still docs/checker/read-only first. Do not implement executable runner or DB
  adapter until owner evidence, fixture contract, runner plan and static-check
  design exist.

## 12. Final Boundary

Stage D - internal controlled test only.

Production remains NO-GO.

This runner static-check design does not approve production, migration, finance
action, evidence acceptance, UAT acceptance, owner GO/NO-GO, AI write access or
a real Task Center database adapter.
