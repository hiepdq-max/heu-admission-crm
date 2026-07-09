# HEU App Shell 001 Draft PR Handoff

Task ID: HEU-APP-SHELL-001-DRAFT-PR-HANDOFF
Date: 2026-07-09
Repository: heu-admission-crm
Branch: codex/heu/app-shell-modular-monolith-control
Base: origin/hardening/ttgdtx-9plus-pilot
Status: DRAFT_PR_READY
Production status: NO-GO

## 1. Purpose

This handoff prepares the App Shell / Modular Monolith slice for IT_DATA and
Audit review as a Draft PR.

Suggested PR body is prepared at:

```text
docs/HEU_CONTROL/HEU_APP_SHELL_001_DRAFT_PR_BODY_20260709.md
```

Exact stage manifest is prepared at:

```text
docs/HEU_CONTROL/HEU_APP_SHELL_001_STAGE_FILE_MANIFEST_20260709.md
```

IT_DATA + Audit review checklist is prepared at:

```text
docs/HEU_CONTROL/HEU_APP_SHELL_001_REVIEW_CHECKLIST_20260709.md
```

The slice moves HEU toward:

```text
One HEU App Shell.
Internal modules.
Shared scoped data.
User access by role/workspace.
Task Center entry point.
Audit/control checks before expansion.
```

This file does not approve production, UAT, finance action, migration,
evidence acceptance, user grants, owner GO/NO-GO or BGH signoff.

## 2. Intended PR Scope

| Area | Files | Scope |
|---|---|---|
| Workspace context | `lib/heu-workspace-context.ts`, `lib/workspace.ts` | Central HEUWorkspaceContext wrapper and role reuse |
| App shell navigation | `components/layout/app-shell.tsx` | Add `Viec cua toi`, preserve selected segment and gate module menu links by permission/role |
| Dashboard landing | `app/page.tsx`, `components/dashboard/dashboard-overview.tsx` | Route links through selected workspace and expose Task Center entry |
| Admission routes | `app/leads/page.tsx`, `app/leads/new/page.tsx`, `app/import/page.tsx`, `app/import/actions.ts`, `app/reports/page.tsx` | Resolve HEUWorkspaceContext before scoped work and gate create/import |
| CTHSSV route | `app/cthssv/page.tsx` | Use dedicated CTHSSV action gate without broad review permission |
| Data Confirmation | `app/data-confirmation/page.tsx` | Read-only/ref-only Task Center shell; no task-row query or mutation |
| Control docs | `docs/HEU_CONTROL/*`, selected readiness/current-state docs | Architecture decision, pilot register, handoff, current-state alignment |
| Checks/audits | `scripts/check-heu-data-confirmation-task-center.mjs`, selected audit scripts, `package.json` | Add focused local gate and align strict audit matchers |

## 3. Explicit Non-Scope

- No SQL migration.
- No Supabase `db push`.
- No production deploy.
- No real user creation or permission grant.
- No password, token, service-role key, OTP, invite link or reset link.
- No raw student PII, CCCD, phone list, bank data, voucher or raw evidence.
- No finance mutation, COM approval, payment execution, debt clearing or voucher
  posting.
- No owner GO/NO-GO, UAT acceptance, evidence acceptance or production GO.

## 4. Verification Evidence

Latest local evidence for this handoff:

| Check | Result | Note |
|---|---|---|
| `npm.cmd run check:heu-data-confirmation-task-center` | PASS_LOCAL | Verifies route markers, status contract, App Shell role/scope menu link, dashboard link, workspace gates and no route-level DB mutation |
| `npm.cmd run check:heu-app-shell-draft-pr-readiness` | PASS_LOCAL | Aggregates required files, exact stage manifest match, scope path guard, high-confidence secret scan, handoff tokens, diff check, DCTC gate and fast-loop security |
| `npm.cmd run check:heu-app-shell-draft-pr-readiness -- --runtime` | PASS_LOCAL | Also runs lint and Webpack build with build-only public Supabase env values |
| `docs/HEU_CONTROL/HEU_APP_SHELL_001_STAGE_FILE_MANIFEST_20260709.md` | READY | Exact file list to stage after explicit Draft PR approval |
| `docs/HEU_CONTROL/HEU_APP_SHELL_001_REVIEW_CHECKLIST_20260709.md` | READY | Focused IT_DATA + Audit checklist before moving PR out of Draft |
| `docs/HEU_CONTROL/HEU_APP_SHELL_001_DRAFT_PR_BODY_20260709.md` | READY | Draft PR body includes scope, risk, test, rollback, evidence and Draft status |
| `npm.cmd run lint` | PASS | Runs after ignored `node_modules` junction is available in the isolated worktree |
| `npm.cmd run build -- --webpack` | PASS | Uses build-only dummy public Supabase env values; route manifest includes `/data-confirmation` |
| `npm.cmd run audit:ttgdtx-release-gates` | PASS | Release gate audit remains green |
| `npm.cmd run audit:heu-user-account-security` | PASS | Password/onboarding guard remains green |
| `npm.cmd run audit:heu-role-scope-uat-pack` | PASS | Role-scope UAT pack remains packaged; signed UAT still required |
| `npm.cmd run audit:ttgdtx-role-scope-access` | PASS | TTGDTX role-scope access audit remains green |
| `npm.cmd run check:heu-user-scope-baseline-repair-queue -- --static-only` | READY | Static-only user scope repair queue package is wired without reading live Supabase data |
| `npm.cmd run audit:heu-current-state-inventory` | PASS | Stage D / Production NO-GO state remains reflected |
| `npm.cmd run audit:heu-vietnamese-text-encoding` | PASS | Mojibake blocker closed |
| `npm.cmd run check:heu-fast-local-loop` | PASS_LOCAL | Default local loop is green; strict worktree remains blocked until files are staged/separated |
| `npm.cmd run check:heu-fast-local-loop -- --security` | PASS_LOCAL | Includes user-account security guard in the local loop |
| `npm.cmd run audit:heu-implementation-log` | PASS | Implementation-log audit remains green |
| `git diff --check` | PASS | No whitespace diff errors |
| Diff secret/PII scan | PASS_LOCAL | Added-line matches are control/stop-condition text only; no secret, raw PII, password, token, bank data or voucher payload found |
| Diff DB/config scope scan | PASS_LOCAL | No changed/untracked SQL, migration, Supabase database folder, `.env`, production config, Docker/Vercel/YAML deployment file found |

Build note:

```text
Plain npm.cmd run build uses Turbopack and is not valid evidence in this
isolated worktree while node_modules is an ignored junction. Turbopack rejects a
node_modules symlink/junction that points outside the worktree root.
Webpack build is used for this local PR-readiness proof.

`npm.cmd run check:heu-fast-local-loop -- --runtime` is not used in this
worktree for the same Turbopack/junction reason. Runtime evidence for this slice
is `npm.cmd run lint` plus `npm.cmd run build -- --webpack`.
```

## 5. Review Owners

| Review lane | Required focus |
|---|---|
| IT_DATA | HEUWorkspaceContext, role/scope behavior, route gate correctness, no broad fallback |
| Audit | Scope leak, negative access expectations, control docs, checks and evidence quality |
| PHAP_CHE | SOP/legal boundary, no production/UAT/evidence reliance |
| BGH/Owner | Architecture direction only; no production approval implied |

## 6. Risks

| Risk | Current control |
|---|---|
| Route shell is mistaken for real Task Center | File and checker mark it read-only/ref-only with no task-row query or mutation |
| Scope context is reused too broadly | Adoption is limited to selected routes and checked via focused gate/audits |
| Dashboard links lose selected workspace | Dashboard and AppShell use `withAdmissionSegmentParam` |
| Finance/readiness gets over-claimed | Docs state Production NO-GO and no finance action/owner GO |
| Build proof is misread | Handoff records Webpack build method and Turbopack junction limitation |
| Secret/PII or production config is accidentally included | Diff scan found no secret/raw PII payload and no database/config/deploy files in the slice |

## 7. Rollback

If this Draft PR causes issue:

1. Revert the PR.
2. Remove `app/data-confirmation/page.tsx`.
3. Remove `lib/heu-workspace-context.ts` and route imports that depend on it.
4. Revert AppShell/dashboard quick links.
5. Revert focused checker and `package.json` script.
6. Keep production blocked; no database rollback is required because no
   migration or data mutation is introduced.

## 8. Draft PR Recommendation

Recommended PR title:

```text
workflow: bo sung HEU App Shell va Data Confirmation shell
```

Recommended state: Draft.

Required reviewers before Ready:

```text
IT_DATA + Audit.
PHAP_CHE advisory if the Task Center wording is used for SOP/legal reliance.
BGH/Owner only for architecture direction, not production approval.
```

## 9. Status

Technical slice status: `DAT_TAM_THOI`.

System status: `CAN_SUA`.

Production status: `NO-GO`.

Next allowed step:

```text
Create Draft PR after explicit user approval to stage, commit, push and open PR.
```
