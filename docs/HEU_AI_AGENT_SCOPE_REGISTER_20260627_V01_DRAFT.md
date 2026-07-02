# HEU AI Agent Scope Register 2026-06-27 V01 Draft

Status: DRAFT_CONTROL
Owner: BGH + IT_DATA + Audit
Production status: NO-GO for autonomous AI actions

## 1. Purpose

Define AI agent boundaries before any AI feature reads controlled data or helps
with workflow decisions. AI may draft, check, summarize and warn. AI must not
approve, pay, post finance records, delete data or mark production GO.

## 2. Allowed Sources

AI may read only approved and role-scoped sources:

- SOP and regulation references approved for the user's scope.
- Data Dictionary and Data Master register.
- Report View Register and approved report views.
- Risk Control and Audit summaries.
- Redacted or metadata-only evidence references.

AI must not read raw bank data, raw student PII, raw CCCD, passwords, keys,
service-role credentials, vouchers, uncontrolled Drive files or restricted data
outside the user's role/workspace scope.

## 3. Agent Scope Register

| Agent | Level | Allowed work | Forbidden work | Required gate |
|---|---|---|---|---|
| Legal Check Assistant | LEVEL_0/1 | Flag missing legal basis | Approve legal sufficiency | Legal owner signoff |
| SOP Checker | LEVEL_0/1 | Compare SOP with SOP-to-data map | Issue SOP or waive missing SOP | SOP owner signoff |
| Data Quality Checker | LEVEL_1 | Warn missing/duplicate/format risk | Fix source data without human action | Data owner review |
| Finance Risk Checker | LEVEL_1 | Warn receivable/receipt/COM mismatch | Gach no, calculate payable as final, approve payout | KHTC signoff and UAT |
| TTGDTX Control Assistant | LEVEL_1 | Remind contract, dossier, reconciliation blockers | Open production or override blocker | Owner Go/No-Go signoff |
| HOU Care Assistant | LEVEL_1 | Remind handover/care/exam support tasks | Mix HOU tuition with TTGDTX ledger | HOU owner review |
| Short Course Attendance Checker | LEVEL_1 | Warn missing attendance/payment evidence | Approve BHXH/meal/HR payment | DAO_TAO/KHTC signoff |
| BGH Report Draft Assistant | LEVEL_1 | Draft read-only executive summary | Create official conclusion or owner approval | BGH signoff |

## 4. Prompt/Output Audit Logging Scope

P7-04 prompt/output audit logging design is documented in
`docs/HEU_AI_PROMPT_OUTPUT_AUDIT_LOGGING_DESIGN_20260628.md`. Future AI
features must log actor, role, workspace scope, registered agent, source scope,
prompt/output redaction status, prompt/output hash where available, forbidden
action flags, human decision status and controlled evidence reference before
any AI-assisted workflow can be considered for UAT.

P7-04 is PASS_LOCAL_DESIGN only. It does not implement AI logging, enable AI
service calls, approve AI-readable data access, accept UAT or approve
production AI.

## 5. Delivery Team Operating Scope

P7-05 AI delivery team operating control is documented in
`docs/HEU_AI_DELIVERY_TEAM_OPERATING_REGISTER_20260702.md`. It defines Build
Agent, QA/Audit Agent, Data Check Agent, Finance Trial Support Agent,
UAT/Evidence Coordinator, Report/Email Coordinator and Human Authority Owner
lanes.

P7-05 may coordinate local PASS_LOCAL work, audit reruns, plain-language
reports, no-secret task handoffs and owner routing. It must not create
autonomous AI workers, send real email, create real software tasks, accept UAT,
accept evidence, approve finance action, approve owner GO, run production
migration or mark production GO.

TEAM_REGISTER_READY / NO_GO / BLOCKED is a local control status only. Human
authority owners remain responsible for signed UAT, evidence acceptance,
finance decisions, access closure and owner GO/NO-GO outside Git/Codex/chat.

## 6. Cloud Agent Operating Scope

P7-06 cloud agent operating control is documented in
`docs/HEU_CLOUD_AGENT_OPERATING_PLAN_20260702.md`. It records the accepted
planning direction for a paid cloud-agent option, an initial USD 20-40 monthly
cap, owner setup requirements, allowed PASS_LOCAL work and stop conditions.

P7-06 may guide future cloud PASS_LOCAL build work when the local computer is
off. It must not buy a server, enter payment details, create cloud
infrastructure, store secrets, send real email, create real tasks, create real
users, accept UAT, accept evidence, approve finance action, approve owner GO,
run production migration or mark production GO.

CLOUD_AGENT_PLAN_READY / NO_GO / BLOCKED is a local planning status only.
Human authority owners remain responsible for provider selection, payment,
budget cap, secret storage, kill switch and any real cloud-agent activation
outside Git/Codex/chat.

## 7. Production Lock

AI remains pilot/read-only until all are complete:

1. Approved AI data-scope registry.
2. Role/scope enforcement for AI-readable data.
3. Prompt/output audit logging.
4. Human approval gate for every AI-assisted workflow.
5. Signed UAT proving AI cannot approve, pay, release, delete or go-live.

## 8. Boundary

Codex/AI output is not approval evidence. Human actor, human decision, source
evidence, timestamp and role/scope context are required for high-risk actions.
