# HEU AI 001 Control Audit Agent Blueprint 2026-07-09

Task ID: HEU-AI-001-CONTROL-AUDIT-AGENT-BLUEPRINT
Repository: heu-admission-crm
Branch: hardening/ttgdtx-9plus-pilot
Status: DRAFT_CONTROL
Production status: NO-GO

## 1. Purpose

This blueprint locks the target operating model for the first HEU AI Agent.
The first agent is not a business automation agent. It is a read-only
Control/Audit Agent that helps HEU avoid scope overflow while the current
worktree remains mixed.

The goal is to define `HEU Controlled AI Operating System` before any runtime
AI worker, OpenAI API call, task sender, email sender, database write, workflow
mutation or production action is built.

This document does not implement an AI service call, prompt storage, runtime
agent, Supabase access change, database migration, email integration, task
creation, finance workflow or production approval.

## 2. Current HEU Context

Current local operating facts:

| Fact | Current state | Control result |
|---|---|---|
| App root | `D:\Web app HEU\heu-admission-crm` | Work only inside this repo |
| Dirty worktree | 279 changed entries reported by fast-loop snapshot | Split one slice before PR or handoff |
| Codex settings | Local project setup no longer auto-runs install/ci | Keep local config separate from business PRs |
| Scripts gate | `HEU-SCRIPTS-003` routes script review order | Do not trust broad PASS until script group is reviewed |
| Identity/scope gate | `HEU-IDENTITY-SCOPE-001` static review exists | No real account/scope/password operation |
| Runtime scope | `HEUWorkspaceContext` exists as a narrow runtime slice | Apply route by route only |
| Production | NO-GO | No Codex/AI production decision |

## 3. HEU Controlled AI Operating System Target

The target system has five layers:

| Layer | Owner / artifact | Required boundary |
|---|---|---|
| 1. Human Authority Layer | BGH, Owner, PHAP_CHE, Audit, IT_DATA | Human authority remains final |
| 2. Control Layer | `AGENTS.md`, `docs/HEU_CONTROL`, `PR_SPLIT_REGISTER`, audit scripts, production gates | Control before runtime |
| 3. Runtime Scope Layer | `HEUWorkspaceContext`, RBAC/RLS, scope-first query, no broad fallback | Scope before query |
| 4. Business Module Layer | TTGDTX pilot, Tuyen sinh, CTHSSV, Dao tao/Khoa, Finance, HOU separated | Module boundary stays explicit |
| 5. AI Agent Layer | Draft only, suggest only, check only, every action logged | No approval and no real-data mutation |

AI must never collapse these layers. A runtime agent cannot replace BGH,
PHAP_CHE, Audit, IT_DATA or business owner approval.

Hard-stop token: `No real-data mutation`.

## 4. Agent Catalog Boundary

| Agent | Role | Can act alone? | Hard stop |
|---|---|---|---|
| Control Agent | Read Git status, split PR scopes, detect scope overflow | Yes, read-only | No file mutation without explicit task |
| Audit Agent | Run local focused checkers and detect PASS/NO-GO drift | Yes, local only | No migration, deploy, install or live write |
| Data Quality Agent | Find missing or inconsistent metadata | Yes, metadata only | No raw PII, no source-data correction |
| Workflow Agent | Draft task suggestions for department confirmation | Draft only | No real task/email/workflow write |
| Finance Guard Agent | Warn about receivable, COM, payment or debt anomalies | Advisory only | No official finance conclusion or payout |
| Legal/SOP Agent | Draft SOP/checklists and flag missing legal basis | Draft only | No legal issuance or waiver |
| Executive Brief Agent | Summarize status for BGH | Read-only | No approval, UAT acceptance or production GO |

## 5. First Agent: Control/Audit Agent

The first HEU AI Agent must be a combined Control/Audit Agent.

Allowed work:

- Read `git status --short --branch`.
- Read `git diff --name-status`.
- Read `git ls-files -o --exclude-standard`.
- Classify dirty paths by docs, scripts, app, components, database, config,
  codex and other.
- Recommend small PR slices by module and risk.
- Identify which focused `npm.cmd` checker should run for a slice.
- Detect when a slice mixes docs/scripts/app/database/config.
- Detect when a PASS_LOCAL claim is unsafe because scope is mixed, untracked or
  missing owner/audit evidence.
- Report `CHUA_KIEM`, `DANG_KIEM`, `CAN_SUA` or `DAT_TAM_THOI` for local
  control status only.

Forbidden work:

- Do not stage, commit, push or create PR automatically.
- Do not edit files unless the human asks for the next small slice.
- Do not run `npm install`, `npm ci`, migration, deploy, Supabase push or SQL.
- Do not read or print secrets, service-role keys, passwords, reset links, raw
  PII, bank/payment raw data or uncontrolled evidence.
- Do not create users, grant scope, assign roles or send email.
- Do not approve UAT, evidence, finance action, owner GO/NO-GO or production.

## 6. Operating Loop

The Control/Audit Agent loop is:

```text
1. OBSERVE
   read-only Git/worktree/control-doc snapshot

2. CLASSIFY
   group files by scope, module, risk and owner lane

3. CHECK
   propose or run focused local npm.cmd checks only for the selected slice

4. DECIDE LOCAL STATUS
   CHUA_KIEM / DANG_KIEM / CAN_SUA / DAT_TAM_THOI

5. ROUTE
   propose PR split, reviewer lane, rollback and next smallest slice

6. STOP
   no production, no owner GO, no broad next step
```

The loop must stop whenever the next action would require real data, real
account operation, finance reliance, SQL execution, email sending, external
evidence acceptance, UAT approval or production gate decision.

## 7. Input And Output Contract

Allowed inputs:

| Input | Allowed content |
|---|---|
| Git snapshot | Path, status, branch, HEAD, staged/unstaged/untracked counts |
| Control docs | `docs/HEU_CONTROL`, AI policy, AI scope register, PR split register |
| Checker output | PASS/NO_GO/BLOCKED text and safe counts |
| Package aliases | Script names and local commands |
| Module maps | Owner lanes, task IDs, file group labels |

Forbidden inputs:

- Raw student/lead phone, CCCD, address or personal records.
- Raw payment, bank statement, voucher or finance evidence.
- Passwords, tokens, service-role keys, reset/invite links.
- Unredacted screenshots or uncontrolled Drive files.

Allowed outputs:

| Output | Meaning |
|---|---|
| PR split table | Review grouping only |
| Checker queue | Local validation suggestion |
| Risk lane | Which owner must review |
| Stop rule | Why the agent must not proceed |
| Local conclusion | `CHUA_KIEM`, `DANG_KIEM`, `CAN_SUA`, `DAT_TAM_THOI` only |

Forbidden outputs:

- Official policy, official finance conclusion, legal conclusion, UAT
  acceptance, evidence acceptance, owner GO/NO-GO or production GO.
- Raw sensitive data or secrets.
- Commands that mutate data or infrastructure without explicit human approval.

## 8. Commands Allowed For The First Agent

Read-only commands:

```powershell
git status --short --branch
git diff --name-status
git diff --stat
git ls-files -o --exclude-standard
git rev-parse --show-toplevel
git rev-parse --short HEAD
```

Focused local check commands, only after a PR slice is selected:

```powershell
npm.cmd run check:heu-fast-local-loop -- --snapshot-only
npm.cmd run audit:heu-implementation-log
npm.cmd run check:heu-identity-scope-001-review-readiness
npm.cmd run check:heu-route-cache-policy-map-readiness
npm.cmd run check:heu-route-query-observability-plan-readiness
```

Forbidden commands:

```powershell
npm install
npm ci
npm.cmd install
npm.cmd ci
supabase db push
supabase migration up
git reset --hard
git checkout -- .
git push --force
```

## 9. Required Evidence Before Runtime Agent

Runtime AI Agent work remains blocked until all are true:

| Gate | Required evidence |
|---|---|
| PR split gate | Current 279-file dirty worktree split into reviewable PR units |
| Scope gate | `HEUWorkspaceContext` PR reviewed and route adoption order locked |
| Identity gate | Identity/scope static checks pass; live checks run only in owner/audit-controlled context |
| Audit gate | Prompt/output audit design has actor, role, workspace, source scope and redaction state |
| Data gate | AI-readable source allowlist excludes raw PII, bank, voucher and uncontrolled evidence |
| Human gate | BGH/Owner/PHAP_CHE/Audit/IT_DATA decision lanes are explicit |
| Kill switch | AI feature flag and disable path documented |
| UAT gate | Signed UAT proves AI cannot approve, pay, release, delete or go-live |

## 10. PR Split Placement

This blueprint should be reviewed as its own PR:

| PR | Scope | Files | Owner lane | Risk | Rollback |
|---|---|---|---|---|---|
| HEU-AI-001 | AI control blueprint | `docs/HEU_CONTROL/HEU_AI_001_CONTROL_AUDIT_AGENT_BLUEPRINT_20260709.md` | IT_DATA + Audit + BGH + PHAP_CHE | Low-medium | Revert docs PR |

Do not combine this PR with:

- `HEUWorkspaceContext` runtime code.
- Identity/scope scripts.
- Database or SQL draft work.
- Finance, HOU, TTGDTX payment or evidence routes.
- `.codex` local settings.

## 11. Rollback

Rollback for this slice is revert-only:

- Revert this blueprint doc.
- Revert the `docs/HEU_CONTROL/README.md` row if added.
- Revert the `PR_SPLIT_REGISTER_20260707.md` row if added.

No database backup is required because this is docs/control-only and performs no
runtime, data or infrastructure change.

## 12. SOP Slice Result Record

SOP-SCOPE:

- `HEU-AI-001` defines the target and boundary for the first HEU Control/Audit
  Agent.
- It does not implement runtime AI, OpenAI calls, prompt storage, workflow
  writes, email, database change, Supabase access change or production action.

SOP-CHECK:

- Checked existing AI scope register, AI assistant policy, `docs/HEU_CONTROL`,
  PR split register and current dirty-worktree boundary.

SOP-PROFESSIONAL:

- Owner lanes: IT_DATA, Audit, BGH, PHAP_CHE and module owners when a future
  agent recommendation touches their scope.

SOP-LEGAL:

- This blueprint is not legal/SOP issuance and does not authorize AI to approve,
  waive, accept or issue any official decision.

SOP-LOGIC:

- First agent must be read-only Control/Audit because HEU still needs PR split,
  scope-first query and identity/scope review before any autonomous runtime.

SOP-VERIFY:

- File existence and scoped `git diff --check` for `docs/HEU_CONTROL`.
- No `npm.cmd` runtime check is required for this docs-only blueprint.

SOP-RESULT:

- `DAT_TAM_THOI` for AI control blueprint only.
- Runtime AI Agent readiness remains `NO_GO`.
- Production remains `NO-GO`.

SOP-NEXT:

- Review this blueprint with IT_DATA + Audit + BGH + PHAP_CHE.
- Then choose one small implementation direction only after PR split is clean:
  a static checker for `HEU-AI-001`, or a read-only Control Agent dry-run
  command that prints a PR split table without modifying files.
