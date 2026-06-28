# HEU AI Prompt Output Audit Logging Design 2026-06-28

Status: DRAFT_CONTROL
Owner: BGH + IT_DATA + Audit
Production status: NO-GO for autonomous AI actions
Implementation status: PASS_LOCAL_DESIGN only

## 1. Purpose

Define the minimum audit log design required before any HEU AI assistant can
read approved controlled context, call an AI service, or support a workflow
decision. This design does not enable AI automation, AI service calls, database
writes, finance action, UAT acceptance, evidence acceptance, owner GO or
production GO.

## 2. Design Boundary

P7-04 is a logging design only. It may be used to review the future schema,
required fields, stop conditions and UAT cases for AI prompt/output logging.

It must not:

- Call an AI service.
- Store live user prompts, raw files or raw evidence in Git, Codex or chat.
- Read data outside the current user's role and workspace scope.
- Write workflow state, approve decisions, pay partners, recognize revenue,
  freeze/release accounts, delete data or mark go-live.
- Treat AI output as approval evidence.

## 3. Required Logical Records

| Logical record | Purpose | Required before automation |
|---|---|---|
| `AI_PROMPT_OUTPUT_AUDIT_LOG` | One row per AI interaction or blocked AI attempt | YES |
| `AI_SCOPE_SOURCE_ACCESS_LOG` | Data sources, report views and evidence references made available to AI | YES |
| `AI_ASSISTED_DECISION_LINK` | Links AI suggestion to the later human decision, if any | YES |
| `AI_RISK_REVIEW_LOG` | Human review of AI risk warnings and false-positive handling | YES |

No table is approved for production migration by this design. Any SQL must go
through normal backup/restore, migration order, RLS, audit-log and signed UAT
gates.

## 4. Minimum Event Fields

| Field | Requirement |
|---|---|
| `ai_audit_event_id` | Stable unique ID |
| `event_time` | Server timestamp |
| `actor_user_id` | Authenticated human actor |
| `actor_role` | Role at time of request |
| `workspace_scope` | Workspace and allowed business scope |
| `feature_code` | P7 feature or workflow code, for example P7-02 or P7-03 |
| `agent_code` | Registered agent from AI scope register |
| `source_scope_refs` | Approved report views, SOPs, registers or redacted evidence refs |
| `prompt_template_id` | Approved prompt template ID, if used |
| `sanitized_prompt_summary` | Redacted summary only; no raw PII, secrets or bank data |
| `prompt_hash` | Hash of the controlled prompt payload when available |
| `model_provider` | Provider/model/version if an AI service is later approved |
| `sanitized_output_summary` | Redacted summary of AI output |
| `output_hash` | Hash of controlled output payload when available |
| `forbidden_action_flag` | TRUE when AI attempted or suggested a forbidden action |
| `human_decision_required` | TRUE for high-risk workflow assistance |
| `human_decision_status` | PENDING, ACCEPTED_BY_HUMAN, REJECTED_BY_HUMAN or BLOCKED |
| `evidence_ref` | Controlled evidence reference, never raw evidence |
| `redaction_status` | PUBLIC_CONTROL, CONTROLLED_REDACTED, CONTROLLED_SENSITIVE or BLOCKED |
| `retention_class` | Retention class approved by Audit and IT_DATA |
| `uat_case_ref` | AI UAT case or exception reference |

## 5. Data Rules

- Raw student PII, CCCD, phone numbers, bank account numbers, bank statements,
  vouchers, passwords, OTPs, service-role keys, private keys and production
  credentials are forbidden in AI prompts, outputs, logs and Git.
- Sensitive source evidence stays in controlled storage outside Git/Codex/chat.
- Logs may store a redacted summary, hash and controlled reference; raw payload
  retention requires a separately approved controlled store.
- AI-readable source scope must come from approved registers, report views,
  SOP-to-data mapping and role/workspace enforcement.

## 6. Human Decision Link

Every AI-assisted high-risk workflow must preserve this chain:

Human request -> approved source scope -> AI suggestion -> risk review ->
human decision -> evidence reference -> audit log -> owner signoff.

AI output alone is not approval evidence. A human actor, human decision,
source evidence, timestamp and role/scope context are required.

## 7. Stop Conditions

Stop the AI workflow and keep production NO-GO when:

- The current user's role/workspace scope is missing or too broad.
- The prompt or output contains raw PII, bank data, credentials, vouchers or
  uncontrolled evidence.
- The AI suggests approval, payment, revenue recognition, account release,
  deletion, evidence hiding, migration approval or production GO.
- Prompt/output audit logging is unavailable.
- The human approval gate is missing.
- Signed AI UAT does not prove the forbidden actions are blocked.

## 8. UAT Cases Required Before Implementation

| Case | Required proof |
|---|---|
| AI-UAT-01 | In-scope user can request a read-only summary from approved sources |
| AI-UAT-02 | Out-of-scope user is denied before AI context is assembled |
| AI-UAT-03 | Raw PII/bank/secret prompt is blocked and logged safely |
| AI-UAT-04 | AI output suggesting approval/payment/go-live is blocked |
| AI-UAT-05 | Human decision remains separate from AI suggestion |
| AI-UAT-06 | Evidence reference is controlled and non-secret |
| AI-UAT-07 | Prompt/output hash, redaction status and source scope are recorded |
| AI-UAT-08 | Audit reviewer can trace actor, role, workspace, source, suggestion and human decision |

## 9. Current Result

P7-04 is PASS_LOCAL_DESIGN only. It prepares the prompt/output audit logging
shape required by the AI policy and scope register, but it does not implement
AI logging, enable AI service calls, enable autonomous AI, approve UAT, approve
finance, accept evidence, approve owner GO or mark production GO.
