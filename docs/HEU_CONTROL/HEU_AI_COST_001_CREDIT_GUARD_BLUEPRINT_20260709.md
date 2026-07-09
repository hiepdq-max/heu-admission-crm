# HEU AI Cost 001 Credit Guard Blueprint 2026-07-09

Task ID: HEU-AI-COST-001-CREDIT-GUARD-BLUEPRINT
Repository: heu-admission-crm
Branch: codex/heu/ai-cost-credit-guard-blueprint
Status: DRAFT_CONTROL
Production status: NO-GO
Scope: docs-only blueprint, no runtime code

## 1. Purpose

This blueprint defines the lowest-cost operating rule for future HEU AI Agent
and automation work.

The goal is to let HEU use AI as an architect, reviewer and draft assistant
while preventing two risks:

- Codex or any AI agent changes the wrong HEU scope.
- The software works but becomes too expensive because every workflow uses too
  many automation steps, AI calls, paid services or duplicated data writes.

This document does not implement runtime AI, OpenAI calls, prompt storage,
Make/Zapier scenarios, database tables, Supabase changes, workflow writes,
finance actions, user-permission changes or production approval.

## 2. Operating Prompt Required Before Any AI Cost Slice

Every future AI/cost slice must start with this instruction:

```text
Không được sửa code ngay. Hãy phân tích rủi ro và đề xuất phương án an toàn trước.
Hãy đề xuất cách làm ít tốn chi phí vận hành nhất: ít automation step, ít AI call,
không thêm dịch vụ trả phí mới nếu không cần, có log và có công tắc bật/tắt.
```

If a future task skips this prompt, the slice must be treated as `NO_GO` until
IT_DATA and Audit confirm the scope.

## 3. Cost Guard Principle

HEU must use this order before spending AI credits or automation credits:

| Order | Method | When to use | Cost control |
|---|---|---|---|
| 1 | Deterministic rule | If/then, status, role, scope, date, amount, required field | Free or near-zero cost |
| 2 | SQL/read model | Aggregation, count, filter, pagination, duplicate detection | One query, no AI call |
| 3 | Local custom code | Normalize, validate, group, route, dedupe | One code step instead of many automation steps |
| 4 | Human task draft | When evidence or authority is missing | Human confirms, no AI conclusion |
| 5 | AI call | Only when the case is ambiguous after filters | Batched, cached, logged, capped |
| 6 | Paid automation | Only if cheaper than maintaining code and approved | Step budget, kill switch, rollback |

Default decision: do not add a paid service if the same work can be done with
existing HEU code, a local script, database query or manual owner review.

## 4. Target Pattern

Use AI Agent as the architect and checker, not as the always-on operator.

Recommended HEU pattern:

```text
1. Intake
   receive event, form row, file metadata or task candidate

2. Early Filter
   reject garbage, duplicate, out-of-scope, missing-owner or unsafe records

3. Deterministic Code Step
   normalize, validate, classify and produce one structured result

4. Optional AI Draft
   call AI only for ambiguous cases that passed the safety filters

5. Human Confirmation
   owner decides, approves, rejects or asks for more evidence

6. Log
   record rule result, AI usage count, human decision and rollback path

7. Write
   write only the approved result through existing HEU permission and scope gates
```

Hard boundary: AI output alone is not an official decision, not evidence
acceptance, not finance approval, not owner GO/NO-GO and not production GO.

## 5. Automation Step Budget

For any future Make/Zapier/n8n/automation workflow, HEU should keep the first
version within this budget:

| Workflow layer | Maximum first-version step count | Rule |
|---|---:|---|
| Trigger | 1 | One source event only |
| Filter | 1 | Drop records before any AI or paid action |
| Custom code | 1 | Combine normalize, dedupe, classify and route |
| AI call | 0 by default, 1 only if justified | No AI call for deterministic cases |
| Write/log | 1 | Write one task/log/result, not many duplicated writes |
| Notification | 0 by default, 1 only if owner-approved | Prefer in-app task inbox first |

If a workflow needs more than five total steps in the first version, stop and
propose a code-first design review before implementation.

## 6. AI Call Budget

AI calls must be treated as scarce and auditable.

| Guard | Required rule |
|---|---|
| Pre-filter | AI call only after record passes scope, role, safety and data-quality filters |
| Cache | Same normalized input should not call AI again unless source version changed |
| Batch | Safe metadata-only items should be batched when privacy and traceability allow |
| Cap | Each run must have max records, max AI calls and max estimated tokens/credits |
| Fallback | If cap is reached, create human review task instead of more AI calls |
| No raw PII | Raw CCCD, phone, bank, payment proof, student record and secrets stay out of AI |
| Audit | Store count, reason, actor, scope, source hash and human decision state |

Default cap for first dry-run design:

```text
AI_MAX_CALLS_PER_RUN = 0
AI_DRY_RUN = true
AI_PROVIDER = none
```

AI calls may be enabled only after IT_DATA + Audit approve the source allowlist,
redaction rule, log contract, cost cap and kill switch.

## 7. Feature Flags And Kill Switch

Future runtime work must not start without these control flags documented and
reviewed:

| Flag | Default | Meaning |
|---|---|---|
| `AI_CREDIT_GUARD_ENABLED` | `false` | Enables cost guard logic |
| `AI_DRY_RUN` | `true` | Produces report only, no workflow write |
| `AI_PROVIDER` | `none` | No external AI provider by default |
| `AI_MAX_CALLS_PER_RUN` | `0` | Blocks AI calls in first dry-run |
| `AI_MAX_RECORDS_PER_RUN` | small controlled number | Prevents broad data sweep |
| `AI_ALLOW_PAID_AUTOMATION` | `false` | Blocks paid automation without approval |

Kill switch rule:

- If cost, scope, privacy or workflow behavior is unclear, set provider to
  `none`, keep dry-run on and route records to human review.

## 8. Logging Contract

Future implementation should log metadata only. The first design should not log
raw PII, raw bank data, raw payment evidence, secrets, passwords, API keys,
tokens or uncontrolled Drive files.

Minimum event fields:

| Field | Purpose |
|---|---|
| `event_id` | Unique event identifier |
| `task_id` | HEU task or workflow code |
| `actor_role` | User/agent lane, not personal secret |
| `workspace_scope` | Scope used before query/action |
| `source_type` | Form, file metadata, task, report, Git status or manual input |
| `source_hash` | Hash of normalized non-sensitive source where applicable |
| `records_in` | Count before filter |
| `records_rejected` | Count rejected by deterministic rule |
| `records_sent_to_ai` | Count sent to AI, should be zero in dry-run |
| `ai_calls` | Number of AI calls used |
| `estimated_cost_unit` | Estimated token/credit/automation step count |
| `decision_state` | Draft, human_review_required, approved_by_human, rejected_by_human |
| `kill_switch_state` | Whether dry-run/provider/cap stopped execution |

## 9. Module Priority

Do not start with finance, HOU COM, payment, bank evidence or real student data.

Recommended pilot order:

| Order | Module | Why |
|---:|---|---|
| 1 | Control/Audit Agent | Uses Git/control metadata only |
| 2 | Docs/control register classifier | No runtime data, low cost |
| 3 | Data Confirmation task draft | Can start with metadata and human confirmation |
| 4 | Admissions lead hygiene | Only after redaction and scope-first filters |
| 5 | Reports/search metadata assist | Only if source allowlist exists |
| 6 | Finance/HOU guard | Advisory only, after legal/data/audit gates |

Finance, HOU COM, debt, tuition, payout and reconciliation must remain
advisory-only until owner evidence, PHAP_CHE route, IT_DATA/Audit review,
backup/rollback and UAT gates are complete.

## 10. Stop Rules

Stop immediately and return `NO_GO` if any future design:

- Uses AI before deterministic filters.
- Sends raw PII, CCCD, phone, bank, payment proof, student raw record, secret or
  uncontrolled evidence to AI.
- Adds a paid service without approved cost cap, owner and rollback.
- Requires more automation steps than the first-version budget without design
  review.
- Lets AI approve, pay, admit, mark revenue, change scope, change permission,
  write production data, send official email or close owner decision.
- Has no kill switch.
- Has no log.
- Has no human decision lane.
- Has no rollback.

## 11. A/B/C Options For HEU

| Option | Description | Cost | Risk | Recommendation |
|---|---|---|---|---|
| A | Build HEU code-first filters and local checkers, AI only for drafts | Low | Low-medium | Recommended |
| B | Use Make/Zapier/n8n for fixed if/then automation, one custom code step | Medium | Medium | Use only for stable external workflow |
| C | Use AI call at many steps across workflow | High | High | Do not use in current HEU stage |

Selected approach: Option A first, Option B only when it is clearly cheaper
than maintaining custom integration, Option C blocked.

## 12. Required Review Owners

| Owner lane | Review responsibility |
|---|---|
| IT_DATA | Query, code, cost cap, logging, feature flag and kill switch |
| Audit | PASS/NO-GO wording, evidence, no broad automation, no hidden approval |
| PHAP_CHE | Legal/SOP boundary, no AI-issued official policy |
| BGH/Owner | Final authority, budget approval and module priority |
| Finance/HOU owner | Only if future advisory guard touches tuition, COM, debt or payout |

## 13. PR Split Placement

This slice should stay docs-only.

| PR | Scope | Files | Owner lane | Risk | Rollback |
|---|---|---|---|---|---|
| HEU-AI-COST-001 | Credit/cost guard blueprint | `docs/HEU_CONTROL/HEU_AI_COST_001_CREDIT_GUARD_BLUEPRINT_20260709.md` | IT_DATA + Audit + PHAP_CHE + BGH | Low-medium | Revert docs PR |

Do not combine this slice with:

- Runtime AI worker.
- OpenAI/API provider integration.
- Prompt/output database tables.
- Make/Zapier/n8n live scenario.
- Finance/HOU/COM/payment workflow.
- Database, SQL, migration or Supabase changes.
- App route or component changes.
- `.codex` local settings.

## 14. Rollback

Rollback for this slice is revert-only:

- Revert this blueprint doc.
- No database backup is required because this slice changes no runtime, data or
  infrastructure file.

## 15. SOP Slice Result Record

SOP-SCOPE:

- `HEU-AI-COST-001` defines a docs-only credit/cost guard before any AI or
  automation implementation.

SOP-CHECK:

- Check this document for no-runtime, no-provider, no-paid-service and
  production NO-GO boundaries.

SOP-PROFESSIONAL:

- IT_DATA and Audit review the technical and operating-cost guardrails.

SOP-LEGAL:

- PHAP_CHE reviews the boundary that AI cannot issue legal/SOP conclusions.

SOP-LOGIC:

- Deterministic filters, local code, logs and kill switches must come before AI
  calls or paid automation.

SOP-VERIFY:

- `git diff --check`
- Optional future checker: `HEU-AI-COST-002-STATIC-CHECKER`

SOP-RESULT:

- `DAT_TAM_THOI` only for this local blueprint after doc/scope check passes.
- Runtime AI Agent readiness remains `NO_GO`.
- Production remains `NO-GO`.

SOP-NEXT:

- IT_DATA + Audit review this blueprint.
- If accepted, create `HEU-AI-COST-002-STATIC-CHECKER` to verify the required
  prompt, no-runtime boundary, AI call budget, automation step budget, log
  contract and kill switch tokens.
