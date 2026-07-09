# HEU App Shell 001 Draft PR Handoff

Task ID: HEU-APP-SHELL-001-DRAFT-PR-HANDOFF
Date: 2026-07-09
Repository: heu-admission-crm
Branch: codex/heu/app-shell-modular-monolith-review
Base: codex/heu/base-cc3985a
Status: DRAFT_PR_READY
Production status: NO-GO

## 1. Purpose

This handoff prepares the App Shell / Modular Monolith slice for IT_DATA and
Audit review as a Draft PR.

This file does not approve production, UAT, finance action, migration, evidence
acceptance, user grants, owner GO/NO-GO or BGH signoff.

The slice moves HEU toward:

```text
One HEU App Shell.
Internal modules.
Shared scoped data.
User access by role/workspace.
Task Center entry point.
Audit/control checks before expansion.
```

## 2. Intended PR Scope

| Area | Files | Scope |
|---|---|---|
| Workspace context | `lib/heu-workspace-context.ts`, `lib/workspace.ts` | Central HEUWorkspaceContext wrapper and role reuse |
| App shell navigation | `components/layout/app-shell.tsx` | Add `Viec cua toi`, preserve selected segment and gate module menu links by permission/role |
| Dashboard landing | `app/page.tsx`, `components/dashboard/dashboard-overview.tsx` | Route links through selected workspace and expose Task Center entry |
| Admission routes | `app/leads/page.tsx`, `app/leads/new/page.tsx`, `app/import/page.tsx`, `app/import/actions.ts`, `app/reports/page.tsx` | Resolve HEUWorkspaceContext before scoped work and gate create/import |
| CTHSSV route | `app/cthssv/page.tsx` | Use dedicated CTHSSV action gate without broad review permission |
| Data Confirmation | `app/data-confirmation/page.tsx` | Read-only/ref-only Task Center shell; no task-row query or mutation |
| Control docs | `docs/HEU_CONTROL/*` only | Architecture decision, pilot register, handoff, review checklist and stage manifest |
| Checks | `scripts/check-heu-data-confirmation-task-center.mjs`, `scripts/check-heu-app-shell-draft-pr-readiness.mjs`, `package.json` | Add focused local gates for Draft PR review |

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
| `node --check scripts/check-heu-app-shell-draft-pr-readiness.mjs` | PASS | Checker syntax is valid |
| `npm.cmd run check:heu-data-confirmation-task-center` | PASS_LOCAL | Verifies route markers, status contract, AppShell menu link, dashboard link, workspace gates and no route-level DB mutation |
| `npm.cmd run check:heu-app-shell-draft-pr-readiness` | PASS_LOCAL | Aggregates required files, exact stage manifest match, scope path guard, secret scan, handoff tokens, diff check and DCTC gate; broad fast-loop security is skipped by default |
| `git diff --cached --check` | PASS | No whitespace errors in staged diff |
| `npm.cmd run check:heu-app-shell-draft-pr-readiness -- --runtime` | PASS_LOCAL | Runtime lint and Webpack build passed after using a local ignored `node_modules` junction to the main app root dependency cache |
| `npm.cmd run lint` | PASS | Exit 0 with 1 warning in unrelated script: `scripts/dry-run-heu-ai-003-pr-split.mjs` |
| `npm.cmd run build -- --webpack` | PASS | Webpack build passed with build-only dummy public Supabase env values; route manifest includes `/data-confirmation` |
| `npm.cmd run check:heu-app-shell-draft-pr-readiness -- --broad-security` | NO_GO expected until docs/audit alignment is a separate scope | Broad security currently pulls current-state audits outside this PR's 21-file scope |
| Diff secret/PII scan | PASS_LOCAL | No secret, raw PII, password, token, bank data or voucher payload found |
| Diff DB/config scope scan | PASS_LOCAL | No changed SQL, migration, Supabase database folder, `.env`, production config, Docker/Vercel/YAML deployment file found |

Runtime blocker detail:

```text
Runtime evidence used a local ignored `node_modules` junction in the isolated
replacement worktree. No npm install, npm ci, migration or deploy was run. This
PR can remain Draft for IT_DATA/Audit review; broad current-state docs and audit
alignment are intentionally left for a separate PR.
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
| Runtime proof is misread | Handoff records local junction method and recommends IT_DATA/CI rerun before Ready |
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
workflow: chuan hoa AppShell HEUWorkspaceContext va Data Confirmation shell
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
Create Draft PR after explicit user approval. Keep Draft PR for IT_DATA/Audit
review. Do not move Ready until reviewers accept the runtime evidence or rerun
it in CI/normal checkout.
```
