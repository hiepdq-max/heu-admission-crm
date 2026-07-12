# HEU AI 003 Control Audit Agent Dry Run PR Split 2026-07-09

Task ID: HEU-AI-003-CONTROL-AUDIT-AGENT-DRY-RUN-PR-SPLIT
Parent task: HEU-AI-002-IT-DATA-AUDIT-REVIEW
Repository: heu-admission-crm
Branch: hardening/ttgdtx-9plus-pilot
Status: DRAFT_CONTROL
Production status: NO-GO

## 1. Purpose

This slice creates the first Control/Audit Agent dry-run command. It is not a
runtime AI agent. It only reads local Git state and prints a PR split table to
stdout so HEU can see the current dirty worktree by group, risk, owner lane and
suggested order.

The command does not modify files and does not create a PR.

## 2. Command

Allowed local command:

```powershell
npm.cmd run dry-run:heu-ai-003-pr-split
```

The script behind this command is:

```text
scripts/dry-run-heu-ai-003-pr-split.mjs
```

## 3. Read Only Inputs

The dry-run command may execute only these read-only Git commands:

```powershell
git rev-parse --show-toplevel
git rev-parse --short HEAD
git status --short --branch
git diff --name-status
git ls-files -o --exclude-standard
```

## 4. Output Contract

The command prints:

- Repository root.
- Current HEAD.
- Branch/status header.
- Worktree counts by group.
- Suggested PR split table.
- Stop rules.
- Local conclusion.

The command must not write JSON, Markdown, logs or cache files to disk.

## 5. Classification Groups

| Group | Path rule | Risk | Review owner lane |
|---|---|---|---|
| docs | `docs/` | Low-medium | Audit + PHAP_CHE + module owners |
| scripts | `scripts/` | High | IT_DATA + Audit |
| app | `app/` | High | Module owners + IT_DATA + Audit |
| components | `components/` | Medium-high | Module owners + IT_DATA + Audit |
| database | `database/` | Very high | IT_DATA + Audit + PHAP_CHE + finance/data owner |
| config | root config/package files | Very high | IT_DATA + DevOps/Codex operator |
| codex | `.codex/` | High | Codex operator + IT_DATA + Audit |
| other | anything else | Medium | IT_DATA + Audit |

## 6. Hard Stops

The dry-run command must not:

- Write, create, move, delete or edit files.
- Stage, commit, push, force-push or create PR.
- Run install, CI, migration, deploy, SQL or Supabase push.
- Call OpenAI or any external AI API.
- Read secrets, reset links, raw PII, raw payment, raw bank or uncontrolled
  evidence.
- Approve UAT, owner decision, legal/SOP decision, finance action or
  production.

## 7. Rollback

Rollback for this slice is revert-only:

- Revert `scripts/dry-run-heu-ai-003-pr-split.mjs`.
- Revert the `package.json` alias.
- Revert this doc.
- Revert matching README/PR split entries.

No database backup is required because the command is read-only and performs no
runtime, data or infrastructure change.

## 8. SOP Slice Result Record

SOP-SCOPE:

- Create a read-only dry-run command that prints a PR split table from local Git
  state.

SOP-CHECK:

- `node --check scripts/dry-run-heu-ai-003-pr-split.mjs`
- `npm.cmd run dry-run:heu-ai-003-pr-split`
- `git diff --check` for this slice

SOP-PROFESSIONAL:

- IT_DATA and Audit review the output table before using it for PR planning.

SOP-LEGAL:

- The command does not approve legal/SOP, UAT, finance, owner or production
  decisions.

SOP-LOGIC:

- The dry-run uses Git status only and cannot mutate repo or data state.

SOP-VERIFY:

- The command output must include `HEU_AI_003_DRY_RUN_PR_SPLIT: PASS_LOCAL`.

SOP-RESULT:

- `DAT_TAM_THOI` when the dry-run command passes.
- Runtime AI Agent readiness remains `NO_GO`.
- Production remains `NO-GO`.

SOP-NEXT:

- Use the printed PR split table to pick the next small review unit.
- Do not add AI runtime, prompt storage, task writing or production action.
