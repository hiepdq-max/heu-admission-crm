# HEU System AI Trend Anti-Overflow Task Breakdown

Status: PASS_LOCAL_PLAN
Decision values: SYSTEM_AI_TREND_TASK_READY / NO_GO / BLOCKED
Production status: NO-GO
Scope: docs/audit control only
Production remains NO-GO.

## 1. Boundary

This register decomposes the next HEU System + AI Trend + Anti-Overflow work
into small PASS_LOCAL goals. It is advisory planning and control metadata only.

This slice does not:

- add AI service calls, model credentials, prompt storage or autonomous workers;
- change app runtime, DB schema, Supabase access, finance workflow or UAT flow;
- import raw data, PII, bank data, vouchers, service-role keys or auth users;
- approve production, UAT, evidence, finance reliance, owner GO/NO-GO or
  production GO.

## 2. System Snapshot Scope Map

Snapshot commands run before this slice:

- `git status --short --branch`
- `git diff --name-status`
- required docs read: `HEU_CURRENT_STATE_INVENTORY`,
  `HEU_SYSTEM_BUILD_BACKLOG`,
  `HEU_MODULE_READINESS_GAP_MATRIX_20260628_V01_DRAFT`

Dirty worktree classification at slice start:

| Area | Observed dirty scope | Handling |
| --- | --- | --- |
| App CRM navigation/import/partner/campaign/lead | campaign, partner, import, lead, pipeline, follow-up, dashboard and search files already dirty | Do not edit in this slice. Runtime remains out of scope. |
| Layout/workspace helpers | app shell, workspace switcher/helper and `lib/workspace-url.ts` already dirty/added | Do not edit in this slice. |
| HOU/Short Course | HOU and Short Course quick-access/control surfaces already dirty | Do not edit in this slice. |
| Governance docs | current-state, backlog, gap matrix, register and implementation log already dirty | Only add this register and one safe log section. |
| Audit scripts | implementation-log, data-foundation, release-gate and related audits already dirty | Only add focused AI-policy/log guards for this register. |

Stop condition: if a future slice needs any dirty runtime file, read staged and
unstaged diff first. If there is no safe insertion point, record BLOCKED.

## 3. Official AI Trend Benchmark

The benchmark below is advisory research only. It records current control themes
from official documentation; it does not enable those tools in HEU.

| ID | Official trend source | HEU control translation |
| --- | --- | --- |
| AI-TREND-01 | OpenAI Agents SDK and guardrails/human review: agent workflows are framed around tools, orchestration, guardrails, human review, tracing and eval loops. Source: https://developers.openai.com/api/docs/guides/agents and https://developers.openai.com/api/docs/guides/agents/guardrails-approvals | Keep HEU AI advisory-only. Any future tool execution requires explicit human approval, local audit evidence and NO-GO gates for production/finance/UAT. |
| AI-TREND-02 | Claude Code hooks and subagents: hooks run at lifecycle points; subagents split task-specific work into separate contexts with scoped tool access and permissions. Sources: https://code.claude.com/docs/en/hooks and https://code.claude.com/docs/en/sub-agents | Treat P7-05 delivery lanes as named coordination lanes, not autonomous workers. Use separate context only for summaries; no real email, task creation, secrets or approval actions. |
| AI-TREND-03 | Gemini structured outputs and function calling: structured outputs constrain final format; function execution remains application responsibility. Sources: https://ai.google.dev/gemini-api/docs/structured-output and https://ai.google.dev/gemini-api/docs/function-calling | Any future AI output must be schema-bound and human-reviewed before it can influence workflow. HEU does not execute tool calls from AI in this slice. |
| AI-TREND-04 | GitHub Copilot repository instructions, custom agents and MCP: repo instructions, agent files, MCP servers and toolsets are used to provide context and control available capabilities. Sources: https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/add-custom-instructions/add-repository-instructions, https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/customize-cloud-agent/create-custom-agents and https://docs.github.com/en/copilot/concepts/context/mcp | HEU keeps repo instructions and audit scripts as control surfaces. MCP/connectors remain disabled for HEU business action unless owner grants a separate controlled path. |

## 4. AI Control Baseline Gap List

| Gap | Current HEU baseline | Required before expansion |
| --- | --- | --- |
| GAP-AI-01 tool approval | P7 AI is advisory-only and production AI remains locked | A written owner path for tool approval, allowed tools, denylist and stop conditions. |
| GAP-AI-02 human-in-loop | Human Authority Owner exists in P7-05/P7-06 controls | Signed non-Codex owner confirmation before any AI-assisted workflow write. |
| GAP-AI-03 hooks/subagents | Delivery lanes exist as control lanes | No autonomous worker creation until permissions, evidence routing and audit logs are signed. |
| GAP-AI-04 structured output | P7-04 design defines prompt/output audit records | Schema validation, redaction and hash/evidence references before any AI output is stored. |
| GAP-AI-05 MCP/connectors | MCP is benchmarked only | Owner-approved connector allowlist, least privilege, no secrets in Git/Codex/chat and revocation path. |
| GAP-AI-06 tracing/evals | Baseline audits exist; no AI runtime tracing | Eval cases, trace retention rules and no-PII trace policy before live AI service use. |

Default selected slice: create this controlled register and audit guard only.

## 5. Anti-Overflow Inventory

Anti-overflow has two meanings in this register.

### 5.1 UI/layout overflow

Existing guard tokens observed in repo scans include:

- `NO_OVERFLOW`
- `min-w-0`
- `truncate`
- `break-words`
- `overflow-hidden`
- `overflow-x-auto`
- `aria-label`
- stable grid widths and bounded quick-access cards

Representative guarded surfaces already present in scans:

- lead quick search/open and lead tables;
- import quick access;
- dashboard quick actions;
- follow-up and pipeline quick access;
- partner quick access;
- search quick open;
- HOU and Short Course quick access;
- layout shell and workspace switcher;
- segment focus layout and position matrix.

Missing-surface candidates for future review only:

- settings tables that have horizontal scroll but may not have named
  `NO_OVERFLOW` markers;
- finance/report legacy tables where labels may still rely on table scroll;
- drilldown pages where quick-access cards may need explicit stable-grid markers.

No UI file is changed in this slice.

### 5.2 Scope/context overflow

Scope overflow controls for every future slice:

- choose exactly one small target;
- declare target files before edits;
- read staged and unstaged diff for any dirty target;
- no raw data, secrets, bank data, vouchers, PII, auth users or service-role keys
  in Git/Codex/chat;
- no production, UAT, evidence, finance or owner GO approval from PASS_LOCAL;
- run focused audit plus required baseline checks before moving to the next
  slice;
- stop with BLOCKED if the task requires unrelated runtime edits.

## 6. Small Goals

| Goal | Output | Stop condition | PASS_LOCAL check |
| --- | --- | --- | --- |
| GOAL-00 System Snapshot Only | Scope map from git status, git diff and the three required HEU docs | Dirty target without safe insertion point | No edits; scope map recorded in this register |
| GOAL-01 AI Control Baseline | Short AI trend gap list from official docs | Any request to add live AI runtime, keys, connector action or autonomous worker | `audit:heu-ai-policy` sees PASS_LOCAL_PLAN and NO-GO boundaries |
| GOAL-02 Anti-Overflow Inventory | UI overflow and scope/context overflow inventory | Any runtime UI change request in this slice | Register lists guard tokens and missing-surface candidates only |
| GOAL-03 One-Slice Selection | This docs/audit-only register | Any need to change app runtime, DB, Supabase or production gate | Register exists and implementation log section exists |
| GOAL-04 Verification Gate | Focused audit and baseline checks | Audit/lint/build/diff check fails | Report PASS_LOCAL_PLAN only after checks pass |

## 7. Next Slice Recommendation

Next slice should remain docs/audit-first unless the owner explicitly selects a
runtime UI surface. Recommended next target after this register is a focused
anti-overflow audit checklist for one UI surface only.

Current result: SYSTEM_AI_TREND_TASK_READY is PASS_LOCAL_PLAN only. Production
remains NO-GO. UAT, evidence acceptance, finance reliance, owner GO/NO-GO and
production GO remain outside Git/Codex/chat.
