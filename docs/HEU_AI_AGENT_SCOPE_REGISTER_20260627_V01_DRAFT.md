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

## 4. Production Lock

AI remains pilot/read-only until all are complete:

1. Approved AI data-scope registry.
2. Role/scope enforcement for AI-readable data.
3. Prompt/output audit logging.
4. Human approval gate for every AI-assisted workflow.
5. Signed UAT proving AI cannot approve, pay, release, delete or go-live.

## 5. Boundary

Codex/AI output is not approval evidence. Human actor, human decision, source
evidence, timestamp and role/scope context are required for high-risk actions.

