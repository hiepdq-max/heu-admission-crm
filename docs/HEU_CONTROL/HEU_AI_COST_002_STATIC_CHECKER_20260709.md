# HEU AI Cost 002 Static Checker 2026-07-09

Task ID: HEU-AI-COST-002-STATIC-CHECKER
Parent task: HEU-AI-COST-001-CREDIT-GUARD-BLUEPRINT
Repository: heu-admission-crm
Branch: codex/heu/ai-cost-credit-guard-blueprint
Status: DRAFT_CONTROL
Production status: NO-GO
Scope: local static checker only, no runtime AI

## 1. Purpose

This slice creates a local static checker for the HEU AI cost/credit guard
blueprint.

The checker protects the HEU-AI-COST-001 operating boundary before any runtime
AI worker, OpenAI API call, prompt/output storage, Make/Zapier/n8n scenario,
paid service, database write, workflow write, finance action or production
action is built.

This slice does not implement AI automation. It only verifies local control
tokens in docs, package alias and checker script.

## 2. Command

Allowed local command:

```powershell
npm.cmd run check:heu-ai-cost-002-static-checker-readiness
```

The script behind this command is:

```text
scripts/check-heu-ai-cost-002-static-checker-readiness.mjs
```

## 3. Checker Scope

| Artifact | Required check |
|---|---|
| `HEU_AI_COST_001_CREDIT_GUARD_BLUEPRINT_20260709.md` | Required cost guard prompt, docs-only boundary, AI call cap, automation step budget, kill switch, logging contract and production NO-GO |
| `HEU_AI_COST_002_STATIC_CHECKER_20260709.md` | Checker doc exists and keeps local static checker/no-runtime boundary |
| `package.json` | Package alias points to the checker script |
| `scripts/check-heu-ai-cost-002-static-checker-readiness.mjs` | Checker is read-only and does not spawn commands or write files |

## 4. Required Hard Stops

The checker must fail if HEU-AI-COST-001 loses any of these hard stops:

- `Không được sửa code ngay. Hãy phân tích rủi ro và đề xuất phương án an toàn trước.`
- `AI_MAX_CALLS_PER_RUN = 0`
- `AI_DRY_RUN = true`
- `AI_PROVIDER = none`
- `AI_CREDIT_GUARD_ENABLED`
- `AI_ALLOW_PAID_AUTOMATION`
- `Automation Step Budget`
- `Logging Contract`
- `Kill switch rule`
- `Runtime AI Agent readiness remains `NO_GO``
- `Production remains `NO-GO``
- `Do not combine this slice with:`

## 5. Forbidden Work

The checker must not:

- Call OpenAI or any external AI API.
- Read raw PII, CCCD, bank data, payment proof, student raw records, secrets,
  API keys, tokens or uncontrolled evidence.
- Run `npm install`, `npm ci`, Supabase, SQL, migration, deploy or CI.
- Execute shell commands through child process APIs.
- Write, create, move, delete, rename or mutate files.
- Stage, commit, push, force-push or create PR.
- Approve UAT, owner decision, legal/SOP decision, finance action or
  production.

## 6. PR Split Placement

This slice should remain separate from runtime AI work.

| PR | Scope | Files | Owner lane | Risk | Rollback |
|---|---|---|---|---|---|
| HEU-AI-COST-002 | Static checker for AI cost guard blueprint | one docs/control doc, one checker script, one package alias | IT_DATA + Audit | Low-medium | Revert docs/script/package alias |

Do not combine this slice with:

- Runtime AI worker.
- OpenAI/API provider integration.
- Prompt/output database tables.
- Make/Zapier/n8n live scenario.
- Finance/HOU/COM/payment workflow.
- Database, SQL, migration or Supabase changes.
- App route or component changes.
- `.codex` local settings.

## 7. Rollback

Rollback for this slice is revert-only:

- Revert `scripts/check-heu-ai-cost-002-static-checker-readiness.mjs`.
- Revert the `package.json` alias.
- Revert this checker doc.
- Revert `HEU_AI_COST_001_CREDIT_GUARD_BLUEPRINT_20260709.md` if the parent
  blueprint is not accepted.

No database backup is required because this is docs/script/package-alias only
and performs no runtime, data or infrastructure change.

## 8. SOP Slice Result Record

SOP-SCOPE:

- Create a local static checker for HEU-AI-COST-001 cost/credit guard boundary.

SOP-CHECK:

- The checker validates the blueprint, this checker doc, package alias and
  read-only checker script.

SOP-PROFESSIONAL:

- IT_DATA reviews cost cap, feature flag, logging and no-paid-service guard.
- Audit reviews PASS/NO-GO wording and no hidden approval.

SOP-LEGAL:

- This checker is not legal/SOP issuance and does not authorize AI to approve,
  waive, accept, publish or enforce official decisions.

SOP-LOGIC:

- Static checking is appropriate before any runtime AI/cost automation because
  HEU must first preserve no-runtime, no-paid-service, no-approval,
  no-real-data-mutation and production NO-GO boundaries.

SOP-VERIFY:

- `node --check scripts/check-heu-ai-cost-002-static-checker-readiness.mjs`
- `npm.cmd run check:heu-ai-cost-002-static-checker-readiness`
- `git diff --check` for this slice

SOP-RESULT:

- `DAT_TAM_THOI` when the local checker passes.
- Runtime AI Agent readiness remains `NO_GO`.
- Production remains `NO-GO`.

SOP-NEXT:

- IT_DATA + Audit review this checker.
- If accepted, decide whether to create a Draft PR for HEU-AI-COST-001/002 or
  continue with a dry-run no-AI cost report.
