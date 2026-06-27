# HEU AI Assistant Policy 2026-06-27

Status: DRAFT_CONTROL
Scope: HEU web app AI assistant and future AI/automation features
Production status: NO-GO for autonomous AI actions

## 1. Purpose

Define the minimum operating boundary for AI inside HEU. AI may help people
work faster, but it must not become a hidden approver, payer, revenue recognizer
or production-release authority.

## 2. Allowed AI Behavior

AI may:

- Draft messages, notes, checklist items and summaries.
- Suggest next actions for a human operator.
- Detect missing fields, inconsistent evidence or process gaps.
- Summarize lead history, source evidence, UAT findings and audit observations.
- Warn about duplicate, missing-evidence, privacy or role/scope risk.

## 3. Forbidden AI Behavior

AI must not:

- Approve any business, legal, finance, admission or production decision.
- Pay partners, record payout execution or mark payment status as paid.
- Recognize revenue or mark money as received.
- Create, approve, unlock or close a reconciliation period.
- Freeze/release tuition accounts or release collateral.
- Mark a student as officially admitted or financially eligible without human
  evidence and approval.
- Delete, hard-delete, overwrite or hide evidence.
- Read or expose data outside the current user's role and workspace scope.
- Mark production GO, production-ready or migration-approved.

## 4. Implementation Rule

The current `/ai-assistant` route must remain a read-only advisory surface until
HEU has:

1. Approved AI data-scope registry.
2. Prompt/output audit logging.
3. Human approval gate for each AI-enabled workflow.
4. Role/scope enforcement for all AI-readable data.
5. Signed UAT showing AI cannot approve, pay, release, delete or go-live.

## 5. Evidence Rule

Every AI-assisted high-risk workflow must store:

- Human actor.
- Original AI suggestion.
- Human decision.
- Evidence link.
- Timestamp.
- Role/scope context.

AI output alone is not approval evidence.

## 6. Current Result

P7-01 is PASS_LOCAL as a policy and static UI guard. This does not enable AI
automation. Production AI remains locked until the implementation rule and UAT
evidence are complete.
