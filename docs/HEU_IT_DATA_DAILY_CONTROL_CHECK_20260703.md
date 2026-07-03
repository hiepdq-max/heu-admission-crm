# HEU IT/Data Daily Control Check - 2026-07-03

Status: PASS_LOCAL_CONTROL

Decision lane: IT_DATA_DAILY_CONTROL_READY / NO_GO / BLOCKED

Current production decision: NO_GO

Purpose: give IT/Data one small, repeatable, read-only control check before
continuing any HEU build slice. The goal is a faster, lighter and easier to
manage operating loop without expanding production scope.

## Operating Principles

- Fast: start with focused local checks before broad lint/build.
- Gon: one daily checklist points to the minimum command group.
- Nhe: the check is static/read-only and does not call Supabase or external services.
- Smart: stop at the first failed control lane and route it to the owner.
- Easy to manage: report PASS_LOCAL only for local control packaging; do not
  execute UAT, accept evidence, approve finance reliance or record owner GO
  inside Codex/chat.

## Daily Control Lanes

| Lane | What IT/Data checks | Minimum proof | Stop condition |
| --- | --- | --- | --- |
| `IT-DAILY-01-WORKTREE` | Current branch, dirty scope and untracked files. | `git status --short --branch`, `git diff --name-only`, `git ls-files -o --exclude-standard`. | Unknown dirty scope, generated logs/env files or mixed unrelated slices. |
| `IT-DAILY-02-ROLE-SCOPE` | User, role, permission and workspace boundaries. | P0-17, P6-04, Step114 and user cutover gate remain linked. | Broad non-owner role, missing negative-control case or unsigned P6-04 result. |
| `IT-DAILY-03-EVIDENCE-PRIVACY` | Redaction and controlled evidence boundary. | P0-10 controlled evidence pack stays required before any proof reference. | Password, OTP, reset/invite link, service-role key, raw PII, bank data or voucher enters Git/Codex/chat. |
| `IT-DAILY-04-AUDIT-RISK` | Audit trace, hard-delete/cascade and release gates. | P6-03, P6-06 and TTGDTX release-gate checks are queued. | Missing audit trace, unresolved protected cascade/hard-delete path or failed release gate. |
| `IT-DAILY-05-QUICK-SCOPE` | The next work item is one small PASS_LOCAL slice. | Slice names owner lane, artifact, focused check and next stop rule. | Slice tries to approve production, execute finance, accept evidence or widen users. |
| `IT-DAILY-06-RUNTIME` | Build/smoke need is matched to the changed surface. | Lint/build/smoke are run when app/shared route behavior changed. | Runtime surface changed but only document checks were run. |
| `IT-DAILY-07-OWNER-BLOCKERS` | External blockers remain visible. | Backup/restore proof, signed migration order, signed UAT and owner GO/NO-GO stay NO-GO until external proof exists. | PASS_LOCAL is treated as production GO, UAT pass, finance reliance or owner approval. |

## Required Command Ladder

Run the smallest applicable set first. Widen only after the focused check is
green and the next slice still stays inside PASS_LOCAL.

1. `npm.cmd run check:heu-it-data-daily-control`
2. `npm.cmd run check:heu-fast-local-loop`
3. `npm.cmd run audit:heu-current-state-inventory`
4. `npm.cmd run audit:heu-user-account-security`
5. `npm.cmd run audit:heu-role-scope-uat-pack`
6. `npm.cmd run audit:heu-controlled-evidence-redaction-pack`
7. `npm.cmd run audit:ttgdtx-audit-trail-guard`
8. `npm.cmd run audit:hard-delete-conversion-decision-queue`
9. `npm.cmd run audit:ttgdtx-release-gates`
10. `npm.cmd run lint`
11. `npm.cmd run build`

Use `npm.cmd run check:heu-fast-local-loop` for a fast default pass over the
daily control, current-state inventory and Vietnamese text encoding guards. Use
`npm.cmd run check:heu-fast-local-loop -- --security` when the current slice
touches P0-17/P6-04 user, role, password or cutover controls. Use
`npm.cmd run check:heu-fast-local-loop -- --runtime` only when route, component,
server-action or shared runtime code changed and lint/build are needed. Runtime
mode prints `HEU_FAST_LOOP_RUNTIME_PREFLIGHT` and returns `NO_GO` before
lint/build when an active Next dev/build process for this repo or `.next/lock`
would make build verification unreliable.

The fast loop prints `HEU_FAST_LOOP_WORKTREE`,
`HEU_FAST_LOOP_WORKTREE_AREAS`, `HEU_FAST_LOOP_AREA_SAMPLE`,
`HEU_FAST_LOOP_NEXT_GUARDS`, `HEU_FAST_LOOP_WORKTREE_SAMPLE` and
`HEU_FAST_LOOP_WORKTREE_SCOPE` before running guards. Area counts group dirty
paths into `app`, `components`, `docs`, `scripts`, `database` and `other` so a
large worktree is easier to triage, and area samples show up to three changed
paths per area before handoff. Guard hints route app/components changes to
`--runtime`, docs changes to current-state, implementation-log and Vietnamese
text audits, script changes to `node --check` plus `npx.cmd eslint`, database
changes to
`npm.cmd run audit:ttgdtx-migration-order-guard` and
`npm.cmd run audit:heu-sql-object-master-map`, and handoff checks to
`--strict-worktree`. Default mode reports `DIRTY_WARN_ONLY` so existing dirty
work is preserved; use
`npm.cmd run check:heu-fast-local-loop -- --strict-worktree` only for a clean
handoff check where any staged, modified, untracked or conflicted file must
return `NO_GO`.

## PASS_LOCAL Boundary

This daily control check does not create accounts, assign real users, set or
send passwords, send email, create tickets, call external services, run
migrations, execute UAT, accept evidence, approve legal/SOP position, approve
finance reliance, approve owner GO/NO-GO or mark production GO.

Expected local result: `IT_DATA_DAILY_CONTROL_READY` when the static control
package is present and the NO-GO production boundary is still explicit.
