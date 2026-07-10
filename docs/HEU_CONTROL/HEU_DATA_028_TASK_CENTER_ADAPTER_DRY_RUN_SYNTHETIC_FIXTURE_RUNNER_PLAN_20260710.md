# HEU-DATA-028 - Task Center Adapter Dry-run Synthetic Fixture Runner Plan

Task ID: HEU-DATA-028-TASK-CENTER-ADAPTER-DRY-RUN-SYNTHETIC-FIXTURE-RUNNER-PLAN

Status: PASS_LOCAL_PLAN_ONLY

Production status: NO-GO

Runtime status: SYNTHETIC_FIXTURE_RUNNER_PLAN_READY: PASS_LOCAL_PLAN_ONLY

Database status: TASK_CENTER_DATABASE_READY: NO_GO_SYNTHETIC_FIXTURE_RUNNER_PLAN_ONLY

## 1. Muc Tieu

Khoa ke hoach runner cho synthetic fixture truoc khi tao runner executable hay
Task Center database adapter. Slice nay chi mo ta thu tu load contract, validate
assertion va report PASS/NO-GO local de IT_DATA + Audit review.

## 2. Pham Vi

In scope:
- `lib/task-center-gate-evidence-panel-source.ts`
- `components/data-confirmation/department-task-inbox.tsx`
- `scripts/check-heu-task-center-adapter-dry-run-synthetic-fixture-runner-plan.mjs`
- `docs/HEU_CONTROL/HEU_DATA_028_TASK_CENTER_ADAPTER_DRY_RUN_SYNTHETIC_FIXTURE_RUNNER_PLAN_20260710.md`
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

- `TASK_CENTER_ADAPTER_DRY_RUN_SYNTHETIC_FIXTURE_RUNNER_PLAN_ONLY`
- `TASK_CENTER_ADAPTER_DRY_RUN_SYNTHETIC_FIXTURE_RUNNER_PLAN_READONLY`
- `TASK_CENTER_ADAPTER_DRY_RUN_SYNTHETIC_FIXTURE_RUNNER_PLAN_DRAFT_ONLY`
- `TASK_CENTER_ADAPTER_DRY_RUN_SYNTHETIC_FIXTURE_RUNNER_PLAN_NO_APPROVAL`
- `TASK_CENTER_ADAPTER_DRY_RUN_SYNTHETIC_FIXTURE_RUNNER_PLAN_NO_DATABASE_READ`
- `TASK_CENTER_ADAPTER_DRY_RUN_SYNTHETIC_FIXTURE_RUNNER_PLAN_NO_DATABASE_CLIENT`
- `TASK_CENTER_ADAPTER_DRY_RUN_SYNTHETIC_FIXTURE_RUNNER_PLAN_NO_ENV_ENABLEMENT`
- `TASK_CENTER_ADAPTER_DRY_RUN_SYNTHETIC_FIXTURE_RUNNER_PLAN_NO_TASK_MUTATION`
- `TASK_CENTER_ADAPTER_DRY_RUN_SYNTHETIC_FIXTURE_RUNNER_PLAN_NO_REAL_DATA`
- `TASK_CENTER_ADAPTER_DRY_RUN_SYNTHETIC_FIXTURE_RUNNER_PLAN_NO_AI_OR_AUTOMATION`
- `NO_DATABASE_CLIENT_CREATED`
- `NO_DATABASE_READ_EXECUTED`
- `NO_ENV_ENABLEMENT`
- `NO_TASK_MUTATION_ROUTE_CREATED`
- `NO_REAL_USER_DATA`
- `NO_AI_CALL_NO_AUTOMATION_STEP`
- `NO_RUNTIME_FIXTURE_FILE_CREATED`
- `NO_RUNTIME_RUNNER_FILE_CREATED`

## 4. Runner Plan Matrix

| Code | Reviewer | Runner step | Input contract | Output contract | Stop rule |
|---|---|---|---|---|---|
| `RUNNER_PLAN_LOAD_STATIC_CONTRACT` | IT_DATA | `PLAN_STEP_LOAD_SYNTHETIC_CONTRACT_METADATA` | `SYNTHETIC_FIXTURE_CONTRACT_READY` | `IN_MEMORY_FIXTURE_PLAN_ONLY` | `NO_RUNTIME_RUNNER_FILE_CREATED` |
| `RUNNER_PLAN_VALIDATE_SCOPE_ASSERTIONS` | Audit | `PLAN_STEP_VALIDATE_SCOPE_ASSERTIONS` | `SYN_ACTOR_AND_TASK_METADATA_ONLY` | `LOCAL_PASS_NO_GO_SCOPE_REPORT_ONLY` | `NO_DATABASE_READ_EXECUTED` |
| `RUNNER_PLAN_VALIDATE_RESTRICTED_FIELDS` | PHAP_CHE | `PLAN_STEP_VALIDATE_RESTRICTED_FIELD_ALLOWLIST` | `SYN_TASK_RESTRICTED_FIELDS_MASKED` | `LOCAL_RESTRICTED_FIELD_REPORT_ONLY` | `NO_RAW_PII_NO_PAYMENT_DATA` |
| `RUNNER_PLAN_VALIDATE_DEPARTMENT_MISMATCH` | Department owner | `PLAN_STEP_VALIDATE_DEPARTMENT_MISMATCH` | `SYN_ACTOR_DEPARTMENT_A_TO_TASK_DEPARTMENT_B` | `LOCAL_DEPARTMENT_MISMATCH_REPORT_ONLY` | `NO_TASK_MUTATION_ROUTE_CREATED` |
| `RUNNER_PLAN_REPORT_PASS_NO_GO_ONLY` | BGH | `PLAN_STEP_REPORT_PASS_NO_GO_WITHOUT_APPROVAL` | `LOCAL_ASSERTION_RESULTS_ONLY` | `LOCAL_PASS_NO_GO_REPORT_ONLY` | `NO_PRODUCTION_GO_NO_DEPLOY` |

## 5. Runner Rules

- Runner plan chi la ke hoach, chua co file runner executable.
- Input phai den tu synthetic fixture contract, khong den tu database.
- Output chi la local PASS/NO-GO report, khong duoc tao task, approve, update
  status hay ghi audit database.
- Runner executable chi duoc xet sau khi IT_DATA + Audit dong y plan va van
  phai chay local deterministic truoc.

## 6. AI Cost Guard

This slice keeps AI and paid automation disabled:
- AI may only help review this document/checker.
- Runtime UI cannot call AI.
- No Make/Zapier/paid automation step is introduced.
- Future runner must be deterministic local code first.

## 7. Owner Review

| Lane | Required decision before executable runner |
|---|---|
| IT_DATA | Confirm runner can load only synthetic metadata contract. |
| Audit | Confirm PASS/NO-GO outputs are measurable without DB access. |
| PHAP_CHE | Confirm restricted-data check does not need raw PII/payment/bank data. |
| Department owner | Confirm mismatch outputs are understandable for department review. |
| BGH | Confirm this is not production approval. |

## 8. Local Verification

Required commands:

```powershell
node --check scripts/check-heu-task-center-adapter-dry-run-synthetic-fixture-runner-plan.mjs
node --check scripts/check-heu-task-center-adapter-dry-run-runner-static-check-design.mjs
npm.cmd run check:heu-task-center-adapter-dry-run-synthetic-fixture-runner-plan
npm.cmd run check:heu-task-center-adapter-dry-run-runner-static-check-design
npm.cmd run check:heu-task-center-adapter-dry-run-synthetic-fixture-contract
```

Expected outputs:
- `HEU_TASK_CENTER_ADAPTER_DRY_RUN_SYNTHETIC_FIXTURE_RUNNER_PLAN_READY: PASS_LOCAL`
- `TASK_CENTER_DATABASE_READY: NO_GO_SYNTHETIC_FIXTURE_RUNNER_PLAN_ONLY`
- `RUNNER_STATIC_CHECK_DESIGN_READY: PASS_LOCAL_DESIGN_ONLY`

## 9. Risk

Main risk: treating the runner plan as executable runner proof.

Control:
- Result remains `PASS_LOCAL_PLAN_ONLY`.
- Database remains `NO_GO_SYNTHETIC_FIXTURE_RUNNER_PLAN_ONLY`.
- No runtime runner file is created.
- No owner approval is inferred.
- No production GO is inferred.

## 10. Rollback

Rollback by reverting the PR that adds this runner plan.

No database rollback is required because this slice does not create schema,
fixture runtime files, runner executable files, task rows, Auth changes, scope
grants, env enablement, uploads, storage writes, AI calls, paid automation or
production config.

## 11. SOP Slice Result Record

SOP-SCOPE:
- `HEU-DATA-028` adds a synthetic fixture runner plan before Task Center adapter
  dry-run.
- Scope is UI runner-plan packet + TypeScript source + docs + checker only.

SOP-CHECK:
- Required local command:
  `npm.cmd run check:heu-task-center-adapter-dry-run-synthetic-fixture-runner-plan`.

SOP-PROFESSIONAL:
- IT_DATA owns synthetic runner input boundary.
- Audit owns PASS/NO-GO output coverage.
- Department owners own department mismatch output review.

SOP-LEGAL:
- PHAP_CHE owns raw PII/payment/bank exclusion.
- No legal approval is inferred from this local plan.

SOP-LOGIC:
- Plan remains non-executable until owner evidence exists.
- No runtime DB path is added.
- No runner file is created.

SOP-VERIFY:
- Local checker must confirm doc/source/component/package/manifest tokens.

SOP-RESULT:
- `PASS_LOCAL_PLAN_ONLY`.
- `SYNTHETIC_FIXTURE_RUNNER_PLAN_READY: PASS_LOCAL_PLAN_ONLY`.
- `TASK_CENTER_DATABASE_READY: NO_GO_SYNTHETIC_FIXTURE_RUNNER_PLAN_ONLY`.

SOP-NEXT:
- `HEU-DATA-029-TASK-CENTER-ADAPTER-DRY-RUN-RUNNER-STATIC-CHECK-DESIGN`.
- Required next command:
  `npm.cmd run check:heu-task-center-adapter-dry-run-runner-static-check-design`.
- Expected next runtime:
  `RUNNER_STATIC_CHECK_DESIGN_READY: PASS_LOCAL_DESIGN_ONLY`.
- Still docs/checker/read-only first. Do not implement DB adapter until owner
  evidence, fixture contract, runner plan and static-check design exist.

## 12. Final Boundary

Stage D - internal controlled test only.

Production remains NO-GO.

This synthetic fixture runner plan does not approve production, migration,
finance action, evidence acceptance, UAT acceptance, owner GO/NO-GO, AI write
access or a real Task Center database adapter.
