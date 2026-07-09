# PR Split Register 2026-07-07

Task ID: HEU-CONTROL-AI-BOOTSTRAP-PR-SPLIT
Repository: heu-admission-crm
Branch: codex/heu/ai-control-docs-tooling
Status: DRAFT_CONTROL

## 1. Purpose

This minimal PR split register records only the AI control PR group required for
the draft PR.

It does not authorize runtime AI, OpenAI API calls, SQL, finance action,
identity/scope mutation, `.codex` changes, UAT approval or production GO.

## 2. Proposed PR Units

| Priority | Proposed TASK_ID | File group | Count | Risk | Review owner lane | Separate PR? | Backup/rollback needed? |
|---:|---|---|---:|---|---|---|---|
| 18.2 | HEU-AI-001-CONTROL-AUDIT-AGENT-BLUEPRINT | `docs/HEU_CONTROL` | 1 AI control blueprint doc | Low-medium | IT_DATA + Audit + BGH + PHAP_CHE | Yes | Rollback by revert PR; no runtime AI, no DB backup |
| 18.3 | HEU-AI-001-OWNER-REVIEW-CONTROL-AUDIT-AGENT | `docs/HEU_CONTROL` | 1 owner-review decision doc | Low-medium | IT_DATA + Audit + BGH + PHAP_CHE | Yes | Rollback by revert PR; no runtime AI, no DB backup |
| 18.4 | HEU-AI-002-STATIC-CHECKER-CONTROL-AUDIT-AGENT-BLUEPRINT | `docs/HEU_CONTROL` + `scripts` + `package.json` | one docs/control doc + one checker script + one package alias | Low-medium | IT_DATA + Audit + BGH + PHAP_CHE | Yes | Rollback by revert PR; no runtime AI, no DB backup |
| 18.5 | HEU-AI-002-IT-DATA-AUDIT-REVIEW | `docs/HEU_CONTROL` | 1 IT_DATA + Audit review doc | Low | IT_DATA + Audit | Yes | Rollback by revert PR; no runtime AI, no DB backup |
| 18.6 | HEU-AI-003-CONTROL-AUDIT-AGENT-DRY-RUN-PR-SPLIT | `docs/HEU_CONTROL` + `scripts` + `package.json` | one dry-run doc + one stdout-only script + one package alias | Low-medium | IT_DATA + Audit | Yes | Rollback by revert PR; no runtime AI, no DB backup |

## 3. Processing Order

18.2. Apply `HEU-AI-001` before any runtime AI worker, OpenAI API call,
prompt/output storage, real task/email creation or autonomous Control/Audit
Agent implementation.

18.3. Apply `HEU-AI-001` owner review before creating
`HEU-AI-002-STATIC-CHECKER-CONTROL-AUDIT-AGENT-BLUEPRINT` or any read-only
dry-run Control/Audit Agent command.

18.4. Apply `HEU-AI-002` before any read-only dry-run Control/Audit Agent command,
runtime AI worker, OpenAI API call, prompt/output storage, SQL, finance,
identity/scope or `.codex` work is connected to AI operations.

18.5. Apply HEU-AI-002 IT_DATA + Audit review before creating HEU-AI-003.

18.6. HEU-AI-003 may only print a dry-run PR split table from read-only Git
status. It must not modify files, stage, commit, push, create PR, run install,
run SQL, call OpenAI, mutate workflow, mutate accounts/scopes, or approve
production.

## 4. PR Guardrails

- No runtime AI worker in this PR.
- No OpenAI API call in this PR.
- No SQL, migration, deploy, install or CI mutation in this PR.
- No finance, evidence, owner, UAT or production approval in this PR.
- No `.codex` local environment changes in this PR.

## 5. Local Conclusion

Status: `DAT_TAM_THOI` for AI PR planning only.

Runtime AI Agent readiness remains `NO_GO`.

Production remains `NO-GO`.
