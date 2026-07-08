# HEU AI 002 Static Checker Control Audit Agent Blueprint 2026-07-09

Task ID: HEU-AI-002-STATIC-CHECKER-CONTROL-AUDIT-AGENT-BLUEPRINT
Parent task: HEU-AI-001-CONTROL-AUDIT-AGENT-BLUEPRINT
Repository: heu-admission-crm
Branch: hardening/ttgdtx-9plus-pilot
Status: DRAFT_CONTROL
Production status: NO-GO

## 1. Purpose

This slice creates the first static checker for the HEU Control/Audit Agent
blueprint. The checker protects the HEU-AI-001 control boundary from drift
before any runtime AI worker, OpenAI API call, prompt/output storage, workflow
write, email sender, database write, finance action or production action is
built.

This is not a runtime AI implementation. It is a local read-only document checker.

## 2. Checker Scope

The checker validates only local control invariants:

| Artifact | Required check |
|---|---|
| `HEU_AI_001_CONTROL_AUDIT_AGENT_BLUEPRINT_20260709.md` | Blueprint exists and keeps read-only, no-approval, no-real-data-mutation and production NO-GO boundaries |
| `HEU_AI_001_OWNER_REVIEW_CONTROL_AUDIT_AGENT_20260709.md` | Owner review exists and names IT_DATA, Audit, BGH and PHAP_CHE lanes |
| `README.md` | Index includes HEU-AI-001, owner review and this HEU-AI-002 checker slice |
| `PR_SPLIT_REGISTER_20260707.md` | PR split keeps HEU-AI-001, owner review and HEU-AI-002 separate from runtime AI, SQL, finance, identity/scope and `.codex` work |
| `package.json` | Package alias points to the checker script |
| `scripts/check-heu-ai-002-static-checker-readiness.mjs` | Checker is local read-only and does not spawn commands or write files |

## 3. Required Hard Stops

The checker must fail if HEU-AI-001 loses any of these hard stops:

- `Draft only`
- `No approval`
- `No real-data mutation`
- `Production status: NO-GO`
- `Runtime AI Agent readiness remains `NO_GO``
- `npm install`
- `npm ci`
- `supabase db push`
- `git reset --hard`
- `service-role keys`
- `Do not stage, commit, push or create PR automatically.`
- `Do not create users, grant scope, assign roles or send email.`

## 4. Commands

Allowed local command:

```powershell
npm.cmd run check:heu-ai-002-static-checker-readiness
```

The checker itself must not run:

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

## 5. Out Of Scope

This checker does not:

- Implement a Control Agent dry-run command.
- Call OpenAI or any external AI API.
- Store prompts or outputs.
- Read secrets, reset links, raw PII, raw payment, raw bank or uncontrolled
  evidence.
- Run SQL, migration, Supabase push, deploy, install or CI.
- Create tasks, send email, create users, grant roles or change scopes.
- Approve UAT, owner decision, legal/SOP decision, finance action or
  production.

## 6. PR Split Placement

This slice should remain separate:

| PR | Scope | Files | Owner lane | Risk | Rollback |
|---|---|---|---|---|---|
| HEU-AI-002 | Static checker for HEU-AI-001 blueprint | one docs/control doc, one checker script, one package alias, README/PR split index rows | IT_DATA + Audit + BGH + PHAP_CHE | Low-medium | Revert docs/script/package alias |

Do not combine this slice with:

- Runtime AI worker.
- Control Agent dry-run command.
- OpenAI API integration.
- Prompt/output database tables.
- Identity/scope changes.
- Database or SQL draft work.
- Finance, HOU, TTGDTX payment or evidence routes.
- `.codex` local settings.

## 7. Rollback

Rollback for this slice is revert-only:

- Revert `scripts/check-heu-ai-002-static-checker-readiness.mjs`.
- Revert the `package.json` alias.
- Revert this doc.
- Revert the matching README row and version log entry.
- Revert the matching PR split register row.

No database backup is required because this is docs/script/package-alias only
and performs no runtime, data or infrastructure change.

## 8. SOP Slice Result Record

SOP-SCOPE:

- Create a local static checker for HEU-AI-001 control boundary only.

SOP-CHECK:

- The checker validates HEU-AI-001 blueprint, HEU-AI-001 owner-review artifact,
  README index, PR split register and package alias.

SOP-PROFESSIONAL:

- IT_DATA and Audit review the checker assertions.
- BGH and PHAP_CHE remain required before runtime AI reliance.

SOP-LEGAL:

- This checker is not legal/SOP issuance and does not authorize AI to approve,
  waive, accept, publish or enforce official decisions.

SOP-LOGIC:

- Static checking is appropriate before any dry-run agent command because HEU
  must first preserve the no-approval, no-real-data-mutation and production
  NO-GO boundaries.

SOP-VERIFY:

- `node --check scripts/check-heu-ai-002-static-checker-readiness.mjs`
- `npm.cmd run check:heu-ai-002-static-checker-readiness`
- `git diff --check` for this slice

SOP-RESULT:

- `DAT_TAM_THOI` when the local checker passes.
- Runtime AI Agent readiness remains `NO_GO`.
- Production remains `NO-GO`.

SOP-NEXT:

- After HEU-AI-002 passes and is reviewed, decide whether to create
  `HEU-AI-003-CONTROL-AUDIT-AGENT-DRY-RUN-PR-SPLIT`.
- HEU-AI-003 must remain read-only and print a PR split table without
  modifying files.
