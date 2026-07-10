# HEU-DATA-026 - Task Center Adapter Dry-run Readonly Test Harness Design

Task ID: HEU-DATA-026-TASK-CENTER-ADAPTER-DRY-RUN-READONLY-TEST-HARNESS-DESIGN

Status: PASS_LOCAL_DESIGN_ONLY

Production status: NO-GO

Runtime status: READONLY_TEST_HARNESS_READY: PASS_LOCAL_DESIGN_ONLY

Database status: TASK_CENTER_DATABASE_READY: NO_GO_TEST_HARNESS_DESIGN_ONLY

## 1. Muc Tieu

Thiet ke harness test read-only cho Task Center adapter dry-run truoc khi co
bat ky database adapter that nao. Slice nay chi khoa hop dong fixture, assertion
va negative-access case de IT_DATA + Audit review.

## 2. Pham Vi

In scope:
- `lib/task-center-gate-evidence-panel-source.ts`
- `components/data-confirmation/department-task-inbox.tsx`
- `scripts/check-heu-task-center-adapter-dry-run-readonly-test-harness-design.mjs`
- `docs/HEU_CONTROL/HEU_DATA_026_TASK_CENTER_ADAPTER_DRY_RUN_READONLY_TEST_HARNESS_DESIGN_20260710.md`
- manifest va package script lien quan

Out of scope:
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

- `TASK_CENTER_ADAPTER_DRY_RUN_READONLY_TEST_HARNESS_DESIGN_ONLY`
- `TASK_CENTER_ADAPTER_DRY_RUN_READONLY_TEST_HARNESS_DESIGN_READONLY`
- `TASK_CENTER_ADAPTER_DRY_RUN_READONLY_TEST_HARNESS_DESIGN_DRAFT_ONLY`
- `TASK_CENTER_ADAPTER_DRY_RUN_READONLY_TEST_HARNESS_DESIGN_NO_APPROVAL`
- `TASK_CENTER_ADAPTER_DRY_RUN_READONLY_TEST_HARNESS_DESIGN_NO_DATABASE_READ`
- `TASK_CENTER_ADAPTER_DRY_RUN_READONLY_TEST_HARNESS_DESIGN_NO_DATABASE_CLIENT`
- `TASK_CENTER_ADAPTER_DRY_RUN_READONLY_TEST_HARNESS_DESIGN_NO_ENV_ENABLEMENT`
- `TASK_CENTER_ADAPTER_DRY_RUN_READONLY_TEST_HARNESS_DESIGN_NO_TASK_MUTATION`
- `TASK_CENTER_ADAPTER_DRY_RUN_READONLY_TEST_HARNESS_DESIGN_NO_REAL_DATA`
- `TASK_CENTER_ADAPTER_DRY_RUN_READONLY_TEST_HARNESS_DESIGN_NO_AI_OR_AUTOMATION`
- `NO_DATABASE_CLIENT_CREATED`
- `NO_DATABASE_READ_EXECUTED`
- `NO_ENV_ENABLEMENT`
- `NO_TASK_MUTATION_ROUTE_CREATED`
- `NO_REAL_USER_DATA`
- `NO_AI_CALL_NO_AUTOMATION_STEP`

## 4. Harness Design Matrix

| Code | Reviewer | Fixture plan | Assertion plan | Stop rule |
|---|---|---|---|---|
| `HARNESS_DESIGN_SYNTHETIC_USER_SCOPE` | IT_DATA | `SYNTHETIC_SCOPE_FIXTURE_ONLY` | `ASSERT_SCOPE_DENIAL_WITHOUT_DB_READ` | `NO_DATABASE_READ_EXECUTED` |
| `HARNESS_DESIGN_SYNTHETIC_TASK_ROWS` | Audit | `SYNTHETIC_TASK_ROW_METADATA_ONLY` | `ASSERT_NO_RAW_PII_NO_PAYMENT_DATA` | `NO_REAL_USER_DATA` |
| `HARNESS_DESIGN_RESTRICTED_DATA_BOUNDARY` | PHAP_CHE | `SYNTHETIC_RESTRICTED_FIELD_ALLOWLIST_ONLY` | `ASSERT_RESTRICTED_FIELDS_BLOCKED` | `NO_RAW_PII_NO_PAYMENT_DATA` |
| `HARNESS_DESIGN_NEGATIVE_ACCESS_CASES` | Audit | `STATIC_NEGATIVE_ACCESS_PACKET_REUSE` | `ASSERT_EXPECTED_BLOCKED_RESULTS` | `NO_BROAD_ACCESS_PROOF_MISSING` |
| `HARNESS_DESIGN_DEPARTMENT_LANE_EXPECTATIONS` | Department owner | `SYNTHETIC_DEPARTMENT_LANE_EXPECTATIONS` | `ASSERT_WRONG_DEPARTMENT_BLOCKED` | `NO_TASK_MUTATION_ROUTE_CREATED` |
| `HARNESS_DESIGN_PRODUCTION_NO_GO` | BGH | `DESIGN_ONLY_NO_RUNTIME_SWITCH` | `ASSERT_NO_ENV_ENABLEMENT_NO_DEPLOY` | `NO_PRODUCTION_GO_NO_DEPLOY` |

## 5. AI Cost Guard

This slice keeps AI and paid automation disabled:
- AI may only help review this document/checker.
- No AI call is allowed in runtime UI.
- No Make/Zapier/paid automation step is introduced.
- The future harness must run as deterministic local code first.

## 6. Owner Review

| Lane | Required decision before runtime harness |
|---|---|
| IT_DATA | Confirm synthetic user/scope fixtures cover workspace-first filtering. |
| Audit | Confirm negative-access assertions are measurable without DB access. |
| PHAP_CHE | Confirm restricted-data allowlist stays metadata-only. |
| Department owner | Confirm department lane expectations match real workflow labels. |
| BGH | Confirm this is not production approval. |

## 7. Local Verification

Required commands:

```powershell
node --check scripts/check-heu-task-center-adapter-dry-run-readonly-test-harness-design.mjs
npm.cmd run check:heu-task-center-adapter-dry-run-readonly-test-harness-design
npm.cmd run check:heu-task-center-adapter-dry-run-static-negative-access-packet
```

Expected outputs:
- `HEU_TASK_CENTER_ADAPTER_DRY_RUN_READONLY_TEST_HARNESS_DESIGN_READY: PASS_LOCAL`
- `TASK_CENTER_DATABASE_READY: NO_GO_TEST_HARNESS_DESIGN_ONLY`

## 8. Risk

Main risk: treating a design-only harness as runtime database proof.

Control:
- Result remains `PASS_LOCAL_DESIGN_ONLY`.
- Database remains `NO_GO_TEST_HARNESS_DESIGN_ONLY`.
- No owner approval is inferred.
- No production GO is inferred.

## 9. Rollback

Rollback by reverting the PR that adds this design packet.

No database rollback is required because this slice does not create schema, task
rows, Auth changes, scope grants, env enablement, uploads, storage writes, AI
calls, paid automation or production config.

## 10. SOP Slice Result Record

SOP-SCOPE:
- `HEU-DATA-026` adds a readonly test-harness design before Task Center adapter
  dry-run.
- Scope is UI design packet + TypeScript source + docs + checker only.

SOP-CHECK:
- Required local command:
  `npm.cmd run check:heu-task-center-adapter-dry-run-readonly-test-harness-design`.

SOP-PROFESSIONAL:
- IT_DATA owns synthetic user/scope fixture design.
- Audit owns negative-access assertion coverage.
- Department owners own department lane expectation review.

SOP-LEGAL:
- PHAP_CHE owns restricted-data boundary review.
- No legal approval is inferred from this local design.

SOP-LOGIC:
- Harness remains design-only until owner evidence exists.
- No runtime DB path is added.
- No env switch is enabled.

SOP-VERIFY:
- Local checker must confirm doc/source/component/package/manifest tokens.

SOP-RESULT:
- `PASS_LOCAL_DESIGN_ONLY`.
- `READONLY_TEST_HARNESS_READY: PASS_LOCAL_DESIGN_ONLY`.
- `TASK_CENTER_DATABASE_READY: NO_GO_TEST_HARNESS_DESIGN_ONLY`.

SOP-NEXT:
- `HEU-DATA-027-TASK-CENTER-ADAPTER-DRY-RUN-SYNTHETIC-FIXTURE-CONTRACT`.
- Still docs/checker/read-only first. Do not implement DB adapter until owner
  evidence and synthetic fixture contract exist.

## 11. Final Boundary

Stage D - internal controlled test only.

Production remains NO-GO.

This test-harness design does not approve production, migration, finance action,
evidence acceptance, UAT acceptance, owner GO/NO-GO, AI write access or a real
Task Center database adapter.
