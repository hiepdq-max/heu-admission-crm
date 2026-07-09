# HEU App Shell 001 Stage File Manifest

Task ID: HEU-APP-SHELL-001-STAGE-FILE-MANIFEST
Date: 2026-07-09
Repository: heu-admission-crm
Branch: codex/heu/app-shell-modular-monolith-control
Status: DRAFT_PR_STAGE_READY
Production status: NO-GO

## 1. Purpose

This manifest defines the exact file set that should be staged if the user
explicitly approves creating the Draft PR for HEU App Shell 001.

No file is staged by this manifest. It is a control checklist only.

## 2. Files To Stage

Stage exactly these files for the App Shell / Data Confirmation Draft PR:

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
docs/HEU_CURRENT_STATE_INVENTORY.md
docs/HEU_IMPLEMENTATION_LOG.md
docs/HEU_MODULE_READINESS_GAP_MATRIX_20260628_V01_DRAFT.md
docs/HEU_SYSTEM_BUILD_BACKLOG.md
docs/HEU_CONTROL/HEU_APP_SHELL_001_DRAFT_PR_BODY_20260709.md
docs/HEU_CONTROL/HEU_APP_SHELL_001_DRAFT_PR_HANDOFF_20260709.md
docs/HEU_CONTROL/HEU_APP_SHELL_001_MODULAR_MONOLITH_DECISION_20260709.md
docs/HEU_CONTROL/HEU_APP_SHELL_001_REVIEW_CHECKLIST_20260709.md
docs/HEU_CONTROL/HEU_APP_SHELL_001_STAGE_FILE_MANIFEST_20260709.md
docs/HEU_CONTROL/HEU_USER_PILOT_001_REAL_USER_UAT_REGISTER_20260709.md
docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md
lib/heu-workspace-context.ts
lib/workspace.ts
package.json
scripts/audit-heu-cthssv-module-readiness.mjs
scripts/audit-heu-implementation-log.mjs
scripts/audit-heu-lead-lifecycle-handover-uat-pack.mjs
scripts/audit-ttgdtx-release-gates.mjs
scripts/check-heu-app-shell-draft-pr-readiness.mjs
scripts/check-heu-data-confirmation-task-center.mjs
```

## 3. Files Not To Stage

Do not stage:

```text
.next/
node_modules/
```

Do not stage any file outside the list in section 2 without a new scope review.

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

Use this only after explicit user approval to create the Draft PR:

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
  docs/HEU_CURRENT_STATE_INVENTORY.md `
  docs/HEU_IMPLEMENTATION_LOG.md `
  docs/HEU_MODULE_READINESS_GAP_MATRIX_20260628_V01_DRAFT.md `
  docs/HEU_SYSTEM_BUILD_BACKLOG.md `
  docs/HEU_CONTROL/HEU_APP_SHELL_001_DRAFT_PR_BODY_20260709.md `
  docs/HEU_CONTROL/HEU_APP_SHELL_001_DRAFT_PR_HANDOFF_20260709.md `
  docs/HEU_CONTROL/HEU_APP_SHELL_001_MODULAR_MONOLITH_DECISION_20260709.md `
  docs/HEU_CONTROL/HEU_APP_SHELL_001_REVIEW_CHECKLIST_20260709.md `
  docs/HEU_CONTROL/HEU_APP_SHELL_001_STAGE_FILE_MANIFEST_20260709.md `
  docs/HEU_CONTROL/HEU_USER_PILOT_001_REAL_USER_UAT_REGISTER_20260709.md `
  docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md `
  lib/heu-workspace-context.ts `
  lib/workspace.ts `
  package.json `
  scripts/audit-heu-cthssv-module-readiness.mjs `
  scripts/audit-heu-implementation-log.mjs `
  scripts/audit-heu-lead-lifecycle-handover-uat-pack.mjs `
  scripts/audit-ttgdtx-release-gates.mjs `
  scripts/check-heu-app-shell-draft-pr-readiness.mjs `
  scripts/check-heu-data-confirmation-task-center.mjs
```

## 6. Post-Stage Verification

After staging, verify:

```powershell
git diff --cached --name-only
git diff --cached --check
npm.cmd run check:heu-app-shell-draft-pr-readiness
```

## 7. Status

Stage readiness: `DAT_TAM_THOI`.

System status: `CAN_SUA`.

Production status: `NO-GO`.
