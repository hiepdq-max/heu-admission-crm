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
components/dashboard/dashboard-overview.tsx
components/layout/app-shell.tsx
docs/HEU_CONTROL/HEU_APP_SHELL_001_DRAFT_PR_BODY_20260709.md
docs/HEU_CONTROL/HEU_APP_SHELL_001_DRAFT_PR_HANDOFF_20260709.md
docs/HEU_CONTROL/HEU_APP_SHELL_001_MODULAR_MONOLITH_DECISION_20260709.md
docs/HEU_CONTROL/HEU_APP_SHELL_001_REVIEW_CHECKLIST_20260709.md
docs/HEU_CONTROL/HEU_APP_SHELL_001_STAGE_FILE_MANIFEST_20260709.md
docs/HEU_CONTROL/HEU_USER_PILOT_001_REAL_USER_UAT_REGISTER_20260709.md
docs/HEU_CONTROL/HEU_USER_PILOT_002_IDENTITY_SCOPE_DAY1_RUNBOOK_20260709.md
docs/HEU_CONTROL/HEU_USER_PILOT_003_IDENTITY_SCOPE_PRECHECK_LEDGER_20260709.md
lib/heu-workspace-context.ts
lib/workspace.ts
package.json
scripts/check-heu-app-shell-draft-pr-readiness.mjs
scripts/check-heu-data-confirmation-task-center.mjs
scripts/check-heu-user-pilot-identity-scope-day1-readiness.mjs
scripts/check-heu-user-pilot-identity-scope-precheck-ledger-readiness.mjs
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
  components/dashboard/dashboard-overview.tsx `
  components/layout/app-shell.tsx `
  docs/HEU_CONTROL/HEU_APP_SHELL_001_DRAFT_PR_BODY_20260709.md `
  docs/HEU_CONTROL/HEU_APP_SHELL_001_DRAFT_PR_HANDOFF_20260709.md `
  docs/HEU_CONTROL/HEU_APP_SHELL_001_MODULAR_MONOLITH_DECISION_20260709.md `
  docs/HEU_CONTROL/HEU_APP_SHELL_001_REVIEW_CHECKLIST_20260709.md `
  docs/HEU_CONTROL/HEU_APP_SHELL_001_STAGE_FILE_MANIFEST_20260709.md `
  docs/HEU_CONTROL/HEU_USER_PILOT_001_REAL_USER_UAT_REGISTER_20260709.md `
  docs/HEU_CONTROL/HEU_USER_PILOT_002_IDENTITY_SCOPE_DAY1_RUNBOOK_20260709.md `
  docs/HEU_CONTROL/HEU_USER_PILOT_003_IDENTITY_SCOPE_PRECHECK_LEDGER_20260709.md `
  lib/heu-workspace-context.ts `
  lib/workspace.ts `
  package.json `
  scripts/check-heu-app-shell-draft-pr-readiness.mjs `
  scripts/check-heu-data-confirmation-task-center.mjs `
  scripts/check-heu-user-pilot-identity-scope-day1-readiness.mjs `
  scripts/check-heu-user-pilot-identity-scope-precheck-ledger-readiness.mjs
```

## 6. Post-Stage Verification

After staging, verify:

```powershell
git diff --cached --name-only
git diff --cached --check
node --check scripts/check-heu-app-shell-draft-pr-readiness.mjs
npm.cmd run check:heu-data-confirmation-task-center
npm.cmd run check:heu-user-pilot-identity-scope-day1-readiness
npm.cmd run check:heu-user-pilot-identity-scope-precheck-ledger-readiness
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
