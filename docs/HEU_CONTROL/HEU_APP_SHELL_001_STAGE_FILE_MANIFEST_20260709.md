# HEU App Shell 001 Stage File Manifest

Task ID: HEU-APP-SHELL-001-STAGE-FILE-MANIFEST
Date: 2026-07-09
Repository: heu-admission-crm
Branch: codex/heu/app-shell-modular-monolith-review
Status: DRAFT_PR_STAGE_READY
Production status: NO-GO

## 1. Purpose

This manifest defines the exact file set for the HEU AppShell /
Data Confirmation Draft PR.

No file outside this list should enter the PR without a new scope review.

## 2. Files To Stage

Stage exactly these files for the AppShell / Data Confirmation Draft PR:

```text
app/cthssv/page.tsx
app/data-confirmation/page.tsx
app/import/actions.ts
app/import/page.tsx
app/leads/new/page.tsx
app/leads/page.tsx
app/page.tsx
app/reports/page.tsx
app/settings/actions.ts
components/dashboard/dashboard-overview.tsx
components/data-confirmation/department-task-inbox.tsx
components/layout/app-shell.tsx
components/settings/user-business-scope-settings.tsx
docs/HEU_CONTROL/HEU_APP_SHELL_001_DRAFT_PR_BODY_20260709.md
docs/HEU_CONTROL/HEU_APP_SHELL_001_DRAFT_PR_HANDOFF_20260709.md
docs/HEU_CONTROL/HEU_APP_SHELL_001_MODULAR_MONOLITH_DECISION_20260709.md
docs/HEU_CONTROL/HEU_APP_SHELL_001_REVIEW_CHECKLIST_20260709.md
docs/HEU_CONTROL/HEU_APP_SHELL_001_STAGE_FILE_MANIFEST_20260709.md
docs/HEU_CONTROL/HEU_DATA_003_DEPARTMENT_TASK_INBOX_MVP_20260710.md
docs/HEU_CONTROL/HEU_DATA_004_TASK_CENTER_DATA_CONTRACT_20260710.md
docs/HEU_CONTROL/HEU_DATA_005_TASK_CENTER_READ_MODEL_INTERFACE_20260710.md
docs/HEU_CONTROL/HEU_DATA_006_TASK_CENTER_MOCK_READONLY_LIST_20260710.md
docs/HEU_CONTROL/HEU_DATA_007_TASK_CENTER_READONLY_QUERY_PLAN_20260710.md
docs/HEU_CONTROL/HEU_DATA_008_TASK_CENTER_READONLY_ADAPTER_SKELETON_20260710.md
docs/HEU_CONTROL/HEU_DATA_009_TASK_CENTER_UI_FALLBACK_WIRING_20260710.md
docs/HEU_CONTROL/HEU_DATA_010_TASK_CENTER_ADAPTER_ENABLEMENT_GATE_20260710.md
docs/HEU_CONTROL/HEU_USER_PILOT_001_REAL_USER_UAT_REGISTER_20260709.md
docs/HEU_CONTROL/HEU_USER_PILOT_002_IDENTITY_SCOPE_DAY1_RUNBOOK_20260709.md
docs/HEU_CONTROL/HEU_USER_PILOT_003_IDENTITY_SCOPE_PRECHECK_LEDGER_20260709.md
docs/HEU_CONTROL/HEU_USER_PILOT_006_USER_ACTIVATION_WORKSHEET_READINESS_20260709.md
docs/HEU_CONTROL/HEU_USER_PILOT_007_SECURE_ENV_HANDOFF_20260709.md
docs/HEU_CONTROL/HEU_USER_PILOT_008_LIVE_CHECK_RESULT_LEDGER_20260710.md
docs/HEU_CONTROL/HEU_USER_PILOT_009_STACKED_PR_REVIEW_PACKET_20260710.md
lib/heu-workspace-context.ts
lib/task-center-contract.ts
lib/task-center-mock-read-model.ts
lib/task-center-readonly-adapter-skeleton.ts
lib/task-center-readonly-query-contract.ts
lib/task-center-ui-fallback-source.ts
lib/task-center-readonly-adapter-enablement-gate.ts
lib/workspace.ts
package.json
scripts/check-heu-app-shell-draft-pr-readiness.mjs
scripts/check-heu-data-confirmation-task-center.mjs
scripts/check-heu-department-task-inbox-mvp-readiness.mjs
scripts/check-heu-task-center-data-contract-readiness.mjs
scripts/check-heu-task-center-read-model-interface-readiness.mjs
scripts/check-heu-task-center-mock-readonly-list-readiness.mjs
scripts/check-heu-task-center-readonly-adapter-skeleton-readiness.mjs
scripts/check-heu-task-center-readonly-query-plan-readiness.mjs
scripts/check-heu-task-center-ui-fallback-wiring-readiness.mjs
scripts/check-heu-task-center-adapter-enablement-gate-readiness.mjs
scripts/check-heu-user-pilot-identity-scope-day1-readiness.mjs
scripts/check-heu-user-pilot-identity-scope-precheck-ledger-readiness.mjs
scripts/check-heu-user-operation-cutover-readiness.mjs
scripts/check-heu-user-activation-worksheet-readiness.mjs
scripts/check-heu-user-pilot-secure-env-handoff-readiness.mjs
scripts/check-heu-user-pilot-live-check-result-ledger-readiness.mjs
scripts/check-heu-user-pilot-stacked-pr-review-packet-readiness.mjs
```

## 3. Files Not To Stage

Do not stage:

```text
.next/
node_modules/
```

Do not stage any file outside section 2 without a new scope review.

## 4. Non-Scope Confirmation

The intended Draft PR must not include:

- SQL migration.
- Supabase `db push`.
- `.env` or secret file.
- Production deployment config.
- Raw PII, CCCD, bank data, voucher, password, token, OTP, invite link or reset
  link.
- Finance mutation, payment execution, COM payout, debt clearing or voucher
  posting.

## 5. Stage Command Template

Use this only for the AppShell Draft PR:

```powershell
git add -- `
  app/cthssv/page.tsx `
  app/data-confirmation/page.tsx `
  app/import/actions.ts `
  app/import/page.tsx `
  app/leads/new/page.tsx `
  app/leads/page.tsx `
  app/page.tsx `
  app/reports/page.tsx `
  app/settings/actions.ts `
  components/dashboard/dashboard-overview.tsx `
  components/data-confirmation/department-task-inbox.tsx `
  components/layout/app-shell.tsx `
  components/settings/user-business-scope-settings.tsx `
  docs/HEU_CONTROL/HEU_APP_SHELL_001_DRAFT_PR_BODY_20260709.md `
  docs/HEU_CONTROL/HEU_APP_SHELL_001_DRAFT_PR_HANDOFF_20260709.md `
  docs/HEU_CONTROL/HEU_APP_SHELL_001_MODULAR_MONOLITH_DECISION_20260709.md `
  docs/HEU_CONTROL/HEU_APP_SHELL_001_REVIEW_CHECKLIST_20260709.md `
  docs/HEU_CONTROL/HEU_APP_SHELL_001_STAGE_FILE_MANIFEST_20260709.md `
  docs/HEU_CONTROL/HEU_DATA_003_DEPARTMENT_TASK_INBOX_MVP_20260710.md `
  docs/HEU_CONTROL/HEU_DATA_004_TASK_CENTER_DATA_CONTRACT_20260710.md `
  docs/HEU_CONTROL/HEU_DATA_005_TASK_CENTER_READ_MODEL_INTERFACE_20260710.md `
  docs/HEU_CONTROL/HEU_DATA_006_TASK_CENTER_MOCK_READONLY_LIST_20260710.md `
  docs/HEU_CONTROL/HEU_DATA_007_TASK_CENTER_READONLY_QUERY_PLAN_20260710.md `
  docs/HEU_CONTROL/HEU_DATA_008_TASK_CENTER_READONLY_ADAPTER_SKELETON_20260710.md `
  docs/HEU_CONTROL/HEU_DATA_009_TASK_CENTER_UI_FALLBACK_WIRING_20260710.md `
  docs/HEU_CONTROL/HEU_DATA_010_TASK_CENTER_ADAPTER_ENABLEMENT_GATE_20260710.md `
  docs/HEU_CONTROL/HEU_USER_PILOT_001_REAL_USER_UAT_REGISTER_20260709.md `
  docs/HEU_CONTROL/HEU_USER_PILOT_002_IDENTITY_SCOPE_DAY1_RUNBOOK_20260709.md `
  docs/HEU_CONTROL/HEU_USER_PILOT_003_IDENTITY_SCOPE_PRECHECK_LEDGER_20260709.md `
  docs/HEU_CONTROL/HEU_USER_PILOT_006_USER_ACTIVATION_WORKSHEET_READINESS_20260709.md `
  docs/HEU_CONTROL/HEU_USER_PILOT_007_SECURE_ENV_HANDOFF_20260709.md `
  docs/HEU_CONTROL/HEU_USER_PILOT_008_LIVE_CHECK_RESULT_LEDGER_20260710.md `
  docs/HEU_CONTROL/HEU_USER_PILOT_009_STACKED_PR_REVIEW_PACKET_20260710.md `
  lib/heu-workspace-context.ts `
  lib/task-center-contract.ts `
  lib/task-center-mock-read-model.ts `
  lib/task-center-readonly-adapter-skeleton.ts `
  lib/task-center-readonly-query-contract.ts `
  lib/task-center-ui-fallback-source.ts `
  lib/task-center-readonly-adapter-enablement-gate.ts `
  lib/workspace.ts `
  package.json `
  scripts/check-heu-app-shell-draft-pr-readiness.mjs `
  scripts/check-heu-data-confirmation-task-center.mjs `
  scripts/check-heu-department-task-inbox-mvp-readiness.mjs `
  scripts/check-heu-task-center-data-contract-readiness.mjs `
  scripts/check-heu-task-center-read-model-interface-readiness.mjs `
  scripts/check-heu-task-center-mock-readonly-list-readiness.mjs `
  scripts/check-heu-task-center-readonly-adapter-skeleton-readiness.mjs `
  scripts/check-heu-task-center-readonly-query-plan-readiness.mjs `
  scripts/check-heu-task-center-ui-fallback-wiring-readiness.mjs `
  scripts/check-heu-task-center-adapter-enablement-gate-readiness.mjs `
  scripts/check-heu-user-pilot-identity-scope-day1-readiness.mjs `
  scripts/check-heu-user-pilot-identity-scope-precheck-ledger-readiness.mjs `
  scripts/check-heu-user-operation-cutover-readiness.mjs `
  scripts/check-heu-user-activation-worksheet-readiness.mjs `
  scripts/check-heu-user-pilot-secure-env-handoff-readiness.mjs `
  scripts/check-heu-user-pilot-live-check-result-ledger-readiness.mjs `
  scripts/check-heu-user-pilot-stacked-pr-review-packet-readiness.mjs
```

## 6. Post-Stage Verification

After staging, verify:

```powershell
git diff --cached --name-only
git diff --cached --check
node --check scripts/check-heu-app-shell-draft-pr-readiness.mjs
node --check scripts/check-heu-department-task-inbox-mvp-readiness.mjs
node --check scripts/check-heu-task-center-data-contract-readiness.mjs
node --check scripts/check-heu-task-center-read-model-interface-readiness.mjs
node --check scripts/check-heu-task-center-mock-readonly-list-readiness.mjs
node --check scripts/check-heu-task-center-readonly-adapter-skeleton-readiness.mjs
node --check scripts/check-heu-task-center-readonly-query-plan-readiness.mjs
node --check scripts/check-heu-task-center-ui-fallback-wiring-readiness.mjs
node --check scripts/check-heu-task-center-adapter-enablement-gate-readiness.mjs
npm.cmd run check:heu-data-confirmation-task-center
npm.cmd run check:heu-department-task-inbox-mvp-readiness
npm.cmd run check:heu-task-center-data-contract-readiness
npm.cmd run check:heu-task-center-read-model-interface-readiness
npm.cmd run check:heu-task-center-mock-readonly-list-readiness
npm.cmd run check:heu-task-center-readonly-adapter-skeleton-readiness
npm.cmd run check:heu-task-center-readonly-query-plan-readiness
npm.cmd run check:heu-task-center-ui-fallback-wiring-readiness
npm.cmd run check:heu-task-center-adapter-enablement-gate-readiness
npm.cmd run check:heu-user-pilot-identity-scope-day1-readiness
npm.cmd run check:heu-user-pilot-identity-scope-precheck-ledger-readiness
npm.cmd run check:heu-user-operation-cutover-readiness
npm.cmd run check:heu-user-activation-worksheet-readiness
npm.cmd run check:heu-user-pilot-secure-env-handoff-readiness
npm.cmd run check:heu-user-pilot-live-check-result-ledger-readiness
npm.cmd run check:heu-user-pilot-stacked-pr-review-packet-readiness
npm.cmd run check:heu-app-shell-draft-pr-readiness
```

Before moving the PR out of Draft, rerun runtime evidence in a dependency
complete checkout or CI:

```powershell
npm.cmd run check:heu-app-shell-draft-pr-readiness -- --runtime
npm.cmd run lint
npm.cmd run build -- --webpack
```

## 7. Status

Stage readiness: `CAN_SUA`.

System status: `CAN_SUA`.

Production status: `NO-GO`.
