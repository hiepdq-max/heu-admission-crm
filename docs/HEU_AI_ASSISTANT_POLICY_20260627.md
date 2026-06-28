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

## 5. P7-02 Read-Only Task Checklist Generator

`components/ai/ai-task-checklist-generator.tsx` is allowed as a PASS_LOCAL
helper because it is local, read-only and template-based. It may show checklist
templates for TTGDTX UAT evidence, owner GO/NO-GO review and small build slices.

It must not:

- Send prompts to an AI service.
- Save user-entered prompts, files or evidence.
- Call Supabase, RPC, mutation APIs or production workflows.
- Approve finance, accept UAT, waive evidence, run migration or mark production
  GO.
- Ask users to paste secrets, passwords, OTPs, service-role keys, bank
  credentials, raw student PII, raw CCCD, raw phone numbers, raw bank account
  numbers, bank statements, vouchers or raw payment data.

P7-02 remains PASS_LOCAL only until prompt/output audit logging, role-scoped AI
data access and signed UAT are complete.

## 6. P7-03 Read-Only Risk Suggestion Board

`components/ai/ai-risk-suggestion-board.tsx` is allowed as a PASS_LOCAL helper
because it is static, read-only and advisory-only. It may show risk prompts for
missing evidence, role/workspace leaks, missing restore proof, duplicate payout,
dashboard reconciliation and AI-output misuse.

It must not:

- Score people, hide exceptions or suppress risk.
- Save risk decisions or write workflow data.
- Call Supabase, RPC, mutation APIs, AI services or production workflows.
- Approve finance, accept UAT, waive evidence, run migration or mark production
  GO.
- Ask users to paste secrets, passwords, OTPs, service-role keys, bank
  credentials, raw student PII, raw CCCD, raw phone numbers, raw bank account
  numbers, bank statements, vouchers or raw payment data.

P7-03 remains PASS_LOCAL only until prompt/output audit logging, role-scoped AI
data access, risk-review audit logging and signed UAT are complete.

## 7. P7-04 Prompt/Output Audit Logging Design

`docs/HEU_AI_PROMPT_OUTPUT_AUDIT_LOGGING_DESIGN_20260628.md` is allowed as a
PASS_LOCAL_DESIGN artifact because it defines the future audit log shape,
required fields, source-scope trace, human decision link, stop conditions and
AI UAT cases.

It must not:

- Call an AI service.
- Store live user prompts, files or raw evidence in Git, Codex or chat.
- Read data outside role/workspace scope.
- Write workflow state, approve finance, accept UAT, waive evidence, run
  migration or mark production GO.

P7-04 remains PASS_LOCAL_DESIGN only until a separate implementation has
approved AI-readable data scope, role-scoped access, prompt/output audit
storage, human approval gates and signed AI UAT.

## 8. Evidence Rule

Every AI-assisted high-risk workflow must store:

- Human actor.
- Original AI suggestion.
- Human decision.
- Evidence link.
- Timestamp.
- Role/scope context.

AI output alone is not approval evidence.

## 9. Current Result

P7-01 is PASS_LOCAL as a policy and static UI guard. P7-02 is PASS_LOCAL as a
read-only task checklist helper. P7-03 is PASS_LOCAL as a read-only risk
suggestion board. P7-04 is PASS_LOCAL_DESIGN as a prompt/output audit logging
design. This does not enable AI automation. Production AI remains locked until
the implementation rule, prompt/output audit logging, role-scoped AI data
access, risk-review audit logging and UAT evidence are complete.
