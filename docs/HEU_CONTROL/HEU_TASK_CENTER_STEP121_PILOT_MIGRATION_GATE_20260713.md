# HEU Task Center Step121 Pilot Migration Gate 2026-07-13

Status: `DRAFT_CONTROL`

Decision: `NO_GO_UNTIL_ISOLATED_RESTORE_PROOF`

Scope: Lõi user + pilot Tuyển sinh. Không mở HOU, không ghi tài chính và
không bật AI runtime.

## 1. Current Evidence

- `npm.cmd run check:heu-task-center-live-schema-readiness` reports `0/5`
  required live objects.
- `database/step121_data_confirmation_task_center.sql` is a migration
  candidate only; it has not been applied by this task.
- The read-only adapter and UI are feature-flagged and fail closed.
- Production remains `NO_GO`.

## 2. Required Dependencies

Before a dry-run, the isolated restore target must already contain:

- `users_profile`, `admission_departments`, `admission_segments`.
- `permission_registry`, `data_dictionary_tables`.
- `record_status` and the shared audit/update trigger functions.
- `is_admin`, `is_executive_role`, `has_permission`,
  `current_user_role_code`, `can_manage_permission_matrix` and
  `can_use_admission_workspace`.
- The current 9-account position/role/scope baseline used by the pilot.

Missing any dependency means `STOP`; do not edit step121 ad hoc on the target.

## 3. Backup And Target Identity Gate

The operator must record all fields outside Git/Codex/chat:

| Required proof | Decision |
| --- | --- |
| Source project/ref identified as source-only | READY / STOP |
| Backup/snapshot ID and completed timestamp | READY / STOP |
| Isolated restore target project/ref | READY / STOP |
| Source and restore target proven different | READY / STOP |
| App/env proven to point to restore target | READY / STOP |
| Operator and independent checker recorded | READY / STOP |
| Restore smoke-check completed | READY / STOP |

No backup ID or no isolated target means `NO_GO`.

## 4. Approved Dry-Run Order

Run only on the isolated restore target:

1. Verify dependencies and current live-schema result.
2. Capture pre-migration object inventory and row counts by authorized tools.
3. Apply `database/step121_data_confirmation_task_center.sql` once.
4. Run the static schema checker.
5. Run the live-schema checker and require `5/5` objects.
6. Keep `HEU_ENABLE_TASK_CENTER_LIVE_READONLY` disabled.
7. Run negative-access UAT for Tuyển sinh and one wrong-scope account.
8. Enable the read-only flag only on the isolated target.
9. Verify each pilot department sees only its own metadata/ref tasks.
10. Disable the flag and record the result ledger.

No real task is seeded automatically. No production migration is permitted.

## 5. Rollback

Primary rollback is whole-environment restore to the verified pre-step121
snapshot. Do not use `DROP TABLE`, `TRUNCATE`, hard delete or cascade as a
shortcut because step121 also creates/replaces functions, policies, triggers,
grants and registry/dictionary rows.

If restore proof fails, stop the dry-run and keep the feature flag disabled.
A forward fix requires a separate reviewed migration and is not authorized by
this gate.

## 6. Postflight Acceptance

All items must be true:

- Live schema checker reports `5/5`.
- Route and adapter checks pass.
- RLS negative-access test blocks or returns an empty result.
- No raw PII, password, token, evidence payload or finance data appears.
- No direct table mutation or RPC confirmation is enabled in the pilot UI.
- Restore evidence and exception log are recorded outside Git/Codex/chat.
- IT_DATA and Audit record the technical decision.

Result values: `STEP121_DRY_RUN_READY / NO_GO / BLOCKED`.

This document does not approve migration, UAT acceptance, evidence acceptance,
owner GO or production GO.
