# HEU-DATA-027 - Task Center Adapter Dry-run Synthetic Fixture Contract

Task ID: HEU-DATA-027-TASK-CENTER-ADAPTER-DRY-RUN-SYNTHETIC-FIXTURE-CONTRACT

Status: PASS_LOCAL_CONTRACT_ONLY

Production status: NO-GO

Runtime status: SYNTHETIC_FIXTURE_CONTRACT_READY: PASS_LOCAL_CONTRACT_ONLY

Database status: TASK_CENTER_DATABASE_READY: NO_GO_SYNTHETIC_FIXTURE_CONTRACT_ONLY

## 1. Muc Tieu

Khoa hop dong fixture gia lap cho Task Center adapter dry-run truoc khi viet
fixture runtime hay adapter database. Slice nay chi mo ta actor fixture, task
metadata fixture va assertion fixture de IT_DATA + Audit review.

## 2. Pham Vi

In scope:
- `lib/task-center-gate-evidence-panel-source.ts`
- `components/data-confirmation/department-task-inbox.tsx`
- `scripts/check-heu-task-center-adapter-dry-run-synthetic-fixture-contract.mjs`
- `docs/HEU_CONTROL/HEU_DATA_027_TASK_CENTER_ADAPTER_DRY_RUN_SYNTHETIC_FIXTURE_CONTRACT_20260710.md`
- manifest va package script lien quan

Out of scope:
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

- `TASK_CENTER_ADAPTER_DRY_RUN_SYNTHETIC_FIXTURE_CONTRACT_ONLY`
- `TASK_CENTER_ADAPTER_DRY_RUN_SYNTHETIC_FIXTURE_CONTRACT_READONLY`
- `TASK_CENTER_ADAPTER_DRY_RUN_SYNTHETIC_FIXTURE_CONTRACT_DRAFT_ONLY`
- `TASK_CENTER_ADAPTER_DRY_RUN_SYNTHETIC_FIXTURE_CONTRACT_NO_APPROVAL`
- `TASK_CENTER_ADAPTER_DRY_RUN_SYNTHETIC_FIXTURE_CONTRACT_NO_DATABASE_READ`
- `TASK_CENTER_ADAPTER_DRY_RUN_SYNTHETIC_FIXTURE_CONTRACT_NO_DATABASE_CLIENT`
- `TASK_CENTER_ADAPTER_DRY_RUN_SYNTHETIC_FIXTURE_CONTRACT_NO_ENV_ENABLEMENT`
- `TASK_CENTER_ADAPTER_DRY_RUN_SYNTHETIC_FIXTURE_CONTRACT_NO_TASK_MUTATION`
- `TASK_CENTER_ADAPTER_DRY_RUN_SYNTHETIC_FIXTURE_CONTRACT_NO_REAL_DATA`
- `TASK_CENTER_ADAPTER_DRY_RUN_SYNTHETIC_FIXTURE_CONTRACT_NO_AI_OR_AUTOMATION`
- `NO_DATABASE_CLIENT_CREATED`
- `NO_DATABASE_READ_EXECUTED`
- `NO_ENV_ENABLEMENT`
- `NO_TASK_MUTATION_ROUTE_CREATED`
- `NO_REAL_USER_DATA`
- `NO_AI_CALL_NO_AUTOMATION_STEP`
- `NO_RUNTIME_FIXTURE_FILE_CREATED`

## 4. Synthetic Fixture Contract Matrix

| Code | Reviewer | Actor fixture | Task fixture | Assertion fixture | Stop rule |
|---|---|---|---|---|---|
| `SYN_FIXTURE_IT_DATA_OWNER_SCOPE` | IT_DATA | `SYN_ACTOR_IT_DATA_SCOPED_READER` | `SYN_TASK_DEPT_MATCHED_METADATA_ONLY` | `ASSERT_VISIBLE_ROWS_REQUIRE_WORKSPACE_SCOPE` | `NO_DATABASE_READ_EXECUTED` |
| `SYN_FIXTURE_AUDIT_NEGATIVE_NO_SCOPE` | Audit | `SYN_ACTOR_AUDIT_NO_SCOPE` | `SYN_TASK_ANY_DEPARTMENT_METADATA_ONLY` | `ASSERT_NO_SCOPE_BLOCKED` | `NO_BROAD_ACCESS_PROOF_MISSING` |
| `SYN_FIXTURE_PHAP_CHE_RESTRICTED_ALLOWLIST` | PHAP_CHE | `SYN_ACTOR_LEGAL_REVIEWER_METADATA_ONLY` | `SYN_TASK_RESTRICTED_FIELDS_MASKED` | `ASSERT_RAW_PII_PAYMENT_BANK_FIELDS_ABSENT` | `NO_RAW_PII_NO_PAYMENT_DATA` |
| `SYN_FIXTURE_DEPARTMENT_MISMATCH` | Department owner | `SYN_ACTOR_DEPARTMENT_A` | `SYN_TASK_DEPARTMENT_B_METADATA_ONLY` | `ASSERT_WRONG_DEPARTMENT_BLOCKED` | `NO_TASK_MUTATION_ROUTE_CREATED` |
| `SYN_FIXTURE_BGH_READONLY_OVERVIEW` | BGH | `SYN_ACTOR_BGH_READONLY` | `SYN_TASK_AGGREGATE_STATUS_METADATA_ONLY` | `ASSERT_NO_APPROVAL_NO_DATA_ENTRY` | `NO_PRODUCTION_GO_NO_DEPLOY` |

## 5. Fixture Data Rules

- Actor fixture chi duoc la role/scope metadata gia lap.
- Task fixture chi duoc la task metadata gia lap.
- Khong co CCCD, phone, bank, payment, raw lead, raw student, invoice, voucher
  hoac evidence file that.
- Fixture contract khong duoc bien thanh data seed hay migration.
- Assertion phai chay deterministic local code truoc khi nghi toi DB adapter.

## 6. AI Cost Guard

This slice keeps AI and paid automation disabled:
- AI may only help review this document/checker.
- Runtime UI cannot call AI.
- No Make/Zapier/paid automation step is introduced.
- Future fixture runner must be deterministic local code first.

## 7. Owner Review

| Lane | Required decision before executable fixture |
|---|---|
| IT_DATA | Confirm actor/scope metadata is enough to test workspace-first access. |
| Audit | Confirm assertion names map to measurable PASS/NO-GO outcomes. |
| PHAP_CHE | Confirm fixture fields avoid raw PII/payment/bank data. |
| Department owner | Confirm department mismatch fixture matches real workflow labels. |
| BGH | Confirm this is not production approval. |

## 8. Local Verification

Required commands:

```powershell
node --check scripts/check-heu-task-center-adapter-dry-run-synthetic-fixture-contract.mjs
npm.cmd run check:heu-task-center-adapter-dry-run-synthetic-fixture-contract
npm.cmd run check:heu-task-center-adapter-dry-run-readonly-test-harness-design
```

Expected outputs:
- `HEU_TASK_CENTER_ADAPTER_DRY_RUN_SYNTHETIC_FIXTURE_CONTRACT_READY: PASS_LOCAL`
- `TASK_CENTER_DATABASE_READY: NO_GO_SYNTHETIC_FIXTURE_CONTRACT_ONLY`

## 9. Risk

Main risk: treating the synthetic fixture contract as executable fixture proof.

Control:
- Result remains `PASS_LOCAL_CONTRACT_ONLY`.
- Database remains `NO_GO_SYNTHETIC_FIXTURE_CONTRACT_ONLY`.
- No runtime fixture file is created.
- No owner approval is inferred.
- No production GO is inferred.

## 10. Rollback

Rollback by reverting the PR that adds this contract packet.

No database rollback is required because this slice does not create schema,
fixture runtime files, task rows, Auth changes, scope grants, env enablement,
uploads, storage writes, AI calls, paid automation or production config.

## 11. SOP Slice Result Record

SOP-SCOPE:
- `HEU-DATA-027` adds a synthetic fixture contract before Task Center adapter
  dry-run.
- Scope is UI contract packet + TypeScript source + docs + checker only.

SOP-CHECK:
- Required local command:
  `npm.cmd run check:heu-task-center-adapter-dry-run-synthetic-fixture-contract`.

SOP-PROFESSIONAL:
- IT_DATA owns synthetic actor/scope fixture contract.
- Audit owns assertion coverage.
- Department owners own department mismatch fixture review.

SOP-LEGAL:
- PHAP_CHE owns raw PII/payment/bank exclusion.
- No legal approval is inferred from this local contract.

SOP-LOGIC:
- Contract remains non-executable until owner evidence exists.
- No runtime DB path is added.
- No fixture file is created.

SOP-VERIFY:
- Local checker must confirm doc/source/component/package/manifest tokens.

SOP-RESULT:
- `PASS_LOCAL_CONTRACT_ONLY`.
- `SYNTHETIC_FIXTURE_CONTRACT_READY: PASS_LOCAL_CONTRACT_ONLY`.
- `TASK_CENTER_DATABASE_READY: NO_GO_SYNTHETIC_FIXTURE_CONTRACT_ONLY`.

SOP-NEXT:
- `HEU-DATA-028-TASK-CENTER-ADAPTER-DRY-RUN-SYNTHETIC-FIXTURE-RUNNER-PLAN`.
- Still docs/checker/read-only first. Do not implement DB adapter until owner
  evidence, fixture contract and runner plan exist.

## 12. Final Boundary

Stage D - internal controlled test only.

Production remains NO-GO.

This synthetic fixture contract does not approve production, migration, finance
action, evidence acceptance, UAT acceptance, owner GO/NO-GO, AI write access or
a real Task Center database adapter.
