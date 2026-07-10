# HEU Data 034 - Task Center Adapter Dry-Run Review Decision Packet

Task ID: HEU-DATA-034-TASK-CENTER-ADAPTER-DRY-RUN-REVIEW-DECISION-PACKET
Date: 2026-07-10
Repository: heu-admission-crm
Status: PASS_LOCAL_DECISION_PACKET_ONLY
Production status: NO-GO
Runtime status: REVIEW_DECISION_PACKET_READY: PASS_LOCAL_DECISION_PACKET_ONLY
Database status: TASK_CENTER_DATABASE_READY: NO_GO_REVIEW_DECISION_PACKET_ONLY

## 1. Purpose

This slice adds a source/UI/checker-only review decision packet after
`HEU-DATA-033`.

The packet does not approve database access. It records the exact review
questions and stop rules that IT_DATA, Audit, PHAP_CHE, Department owner and
BGH must answer before any future Task Center adapter can move toward database
read planning.

Every decision row remains `REVIEW_REQUIRED_NO_GO`.

## 2. Scope

Files in scope:

- `docs/HEU_CONTROL/HEU_DATA_034_TASK_CENTER_ADAPTER_DRY_RUN_REVIEW_DECISION_PACKET_20260710.md`
- `components/data-confirmation/department-task-inbox.tsx`
- `lib/task-center-gate-evidence-panel-source.ts`
- `docs/HEU_CONTROL/HEU_APP_SHELL_001_STAGE_FILE_MANIFEST_20260709.md`
- `docs/HEU_CONTROL/HEU_DATA_033_TASK_CENTER_ADAPTER_DRY_RUN_OUTPUT_LEDGER_STATIC_SNAPSHOT_20260710.md`
- `scripts/check-heu-task-center-adapter-dry-run-output-ledger-static-snapshot.mjs`
- `scripts/check-heu-task-center-adapter-dry-run-review-decision-packet.mjs`
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

- `TASK_CENTER_ADAPTER_DRY_RUN_REVIEW_DECISION_PACKET_ONLY`
- `TASK_CENTER_ADAPTER_DRY_RUN_REVIEW_DECISION_PACKET_READONLY`
- `TASK_CENTER_ADAPTER_DRY_RUN_REVIEW_DECISION_PACKET_DRAFT_ONLY`
- `TASK_CENTER_ADAPTER_DRY_RUN_REVIEW_DECISION_PACKET_NO_APPROVAL`
- `TASK_CENTER_ADAPTER_DRY_RUN_REVIEW_DECISION_PACKET_NO_DATABASE_READ`
- `TASK_CENTER_ADAPTER_DRY_RUN_REVIEW_DECISION_PACKET_NO_DATABASE_CLIENT`
- `TASK_CENTER_ADAPTER_DRY_RUN_REVIEW_DECISION_PACKET_NO_ENV_ENABLEMENT`
- `TASK_CENTER_ADAPTER_DRY_RUN_REVIEW_DECISION_PACKET_NO_FILE_WRITE`
- `TASK_CENTER_ADAPTER_DRY_RUN_REVIEW_DECISION_PACKET_NO_TASK_MUTATION`
- `TASK_CENTER_ADAPTER_DRY_RUN_REVIEW_DECISION_PACKET_NO_REAL_DATA`
- `TASK_CENTER_ADAPTER_DRY_RUN_REVIEW_DECISION_PACKET_NO_AI_OR_AUTOMATION`

## 4. Review Decision Rows

| Code | Reviewer | Decision state | Review question | Required before DB read | Stop rule |
|---|---|---|---|---|---|
| `REVIEW_DECISION_PACKET_IT_DATA_SCOPE_FIRST` | IT_DATA | `REVIEW_REQUIRED_NO_GO` | Does the static snapshot preserve scope-first boundaries? | `IT_DATA_SCOPE_FIRST_FILTER_SIGNOFF` | `NO_DATABASE_READ_BEFORE_IT_DATA_SIGNOFF` |
| `REVIEW_DECISION_PACKET_AUDIT_NEGATIVE_ACCESS` | Audit | `REVIEW_REQUIRED_NO_GO` | Do the runner output and static snapshot preserve negative-access evidence? | `AUDIT_NEGATIVE_ACCESS_EVIDENCE` | `STATIC_SNAPSHOT_CHECKER_ONLY` |
| `REVIEW_DECISION_PACKET_PHAP_CHE_RESTRICTED_DATA` | PHAP_CHE | `REVIEW_REQUIRED_NO_GO` | Does the packet keep raw PII and payment data out of the dry-run surface? | `PHAP_CHE_RESTRICTED_DATA_BOUNDARY_SIGNOFF` | `NO_RAW_PII_NO_PAYMENT_DATA` |
| `REVIEW_DECISION_PACKET_DEPARTMENT_OWNER_TASK_BOUNDARY` | Department owner | `REVIEW_REQUIRED_NO_GO` | Does department mismatch remain blocked without task mutation? | `DEPARTMENT_OWNER_TASK_LABEL_ACCEPTANCE` | `NO_TASK_MUTATION_ROUTE_CREATED` |
| `REVIEW_DECISION_PACKET_BGH_PRODUCTION_NO_GO` | BGH | `REVIEW_REQUIRED_NO_GO` | Does BGH keep production NO-GO before UAT evidence and owner approval? | `BGH_PRODUCTION_NO_GO_ACKNOWLEDGEMENT` | `NO_PRODUCTION_GO_NO_DEPLOY` |

## 5. Expected Local Commands

```powershell
node --check scripts/check-heu-task-center-adapter-dry-run-review-decision-packet.mjs
node --check scripts/check-heu-task-center-adapter-dry-run-db-read-go-no-go-precheck.mjs
npm.cmd run check:heu-task-center-adapter-dry-run-review-decision-packet
npm.cmd run check:heu-task-center-adapter-dry-run-db-read-go-no-go-precheck
npm.cmd run check:heu-task-center-adapter-dry-run-output-ledger-static-snapshot
```

Expected output:

- `HEU_TASK_CENTER_ADAPTER_DRY_RUN_REVIEW_DECISION_PACKET_READY: PASS_LOCAL`
- `TASK_CENTER_DATABASE_READY: NO_GO_REVIEW_DECISION_PACKET_ONLY`
- `NO_RUNTIME_MUTATION: task center adapter dry-run review decision packet checker only; no owner approval, database client, database read, env enablement, file output write, table creation, SQL migration, task write, file upload, storage write, real-data fixture, AI call, paid automation, deploy, finance action or production GO`
- `DB_READ_GO_NO_GO_PRECHECK_READY: PASS_LOCAL_PRECHECK_ONLY`
- `TASK_CENTER_DATABASE_READY: NO_GO_DB_READ_GO_NO_GO_PRECHECK_ONLY`

## 6. Acceptance

This slice may be considered local-only ready when:

1. The review decision packet rows are visible in the Department Task Inbox
   gate evidence panel.
2. The checker confirms all five review decision rows.
3. Every row remains `REVIEW_REQUIRED_NO_GO`.
4. The checker confirms this remains source/UI/checker-only.
5. The prior HEU-DATA-033 checker links to this HEU-DATA-034 slice.
6. The next HEU-DATA-035 precheck remains
   `NO_GO_REQUIRES_OWNER_DECISION` and checker-only.
7. Database status remains
   `TASK_CENTER_DATABASE_READY: NO_GO_REVIEW_DECISION_PACKET_ONLY`.

## 7. Risk

Main risk: treating this packet as approval to connect a database adapter.

Mitigation:

- The packet is source/UI/checker-only.
- Every decision row remains `REVIEW_REQUIRED_NO_GO`.
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
- Add one review decision packet after the local synthetic runner output ledger
  static snapshot.
- No owner approval, runtime file output, database, runtime adapter, env, write
  path, AI or automation enablement.

SOP-CHECK:
- Focused checker required:
  `check:heu-task-center-adapter-dry-run-review-decision-packet`.
- Previous checker required:
  `check:heu-task-center-adapter-dry-run-output-ledger-static-snapshot`.
- Next precheck checker required:
  `check:heu-task-center-adapter-dry-run-db-read-go-no-go-precheck`.

SOP-PROFESSIONAL:
- IT_DATA owns scope-first review.
- Audit owns negative-access review.
- Department owner owns task-boundary review.

SOP-LEGAL:
- PHAP_CHE reviews restricted-data absence.
- No raw PII, bank, payment, CCCD, password, token or secret is introduced.

SOP-LOGIC:
- Packet records review questions and stop rules only.
- It cannot be used as owner approval, UAT approval or DB readiness evidence.

SOP-VERIFY:
- `HEU_TASK_CENTER_ADAPTER_DRY_RUN_REVIEW_DECISION_PACKET_READY: PASS_LOCAL`
- `TASK_CENTER_DATABASE_READY: NO_GO_REVIEW_DECISION_PACKET_ONLY`

SOP-RESULT:
- CAN_SUA for Draft PR review.
- Production remains NO-GO.

SOP-NEXT:
- `HEU-DATA-035-TASK-CENTER-ADAPTER-DRY-RUN-DB-READ-GO-NO-GO-PRECHECK`.
  Only consider a DB-read precheck after IT_DATA + Audit confirm that 034 is
  still review-only and no row represents owner approval.
