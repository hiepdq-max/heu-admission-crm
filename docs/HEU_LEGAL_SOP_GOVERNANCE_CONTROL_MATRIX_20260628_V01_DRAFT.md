# HEU Legal SOP Governance Control Matrix 2026-06-28 V01 Draft

Status: DRAFT_CONTROL
Owner: PHAP_CHE + IT_DATA + Audit + process owners
Production status: NO-GO

## 1. Purpose

Connect Legal, SOP and Governance controls before any deeper workflow,
dashboard, finance or AI automation work. This matrix is a PASS_LOCAL control
artifact only. It does not issue legal policy, approve an SOP, accept UAT,
accept evidence, approve finance action, approve migration, move Drive files or
grant owner Go/No-Go.

## 2. Required Control Chain

Legal basis -> Regulation/SOP -> Data source -> Workflow gate -> Evidence
class -> Report view -> Audit log -> Signoff register -> Owner decision.

If any link in this chain is missing, the affected area must stay
`CAN_SUA` or `CHUA_DU_DIEU_KIEN` and cannot move into production reliance.

## 3. Legal SOP Governance Matrix

| Control area | Required source | Required owner | PASS_LOCAL work allowed | Must not do in Codex | Required next gate |
|---|---|---|---|---|---|
| Legal Article Master | Legal article, contract clause, tuition rule or approved internal regulation | PHAP_CHE + relevant process owner | Draft legal-basis checklist, missing-basis warnings and source-reference fields | Treat a draft source as final legal approval, interpret law as binding advice or waive missing basis | Signed PHAP_CHE review and controlled Legal Article Master |
| SOP Register | SOP title, version, owner department, effective scope and dependency | PHAP_CHE + process owner + IT_DATA | Draft required-SOP checklist, owner routing and SOP-to-data mapping | Issue official SOP, replace version log or bypass owner signoff | SOP owner signoff, Version Log and Audit Log |
| Evidence Class Boundary | File registry, evidence class and redaction rule | Audit + IT_DATA + process owner | Classify as public control, controlled redacted, controlled sensitive or forbidden in Git/Codex/chat | Move real evidence, paste raw PII/bank/voucher/password data or mix legal files with BBNT/payment evidence | Controlled Drive evidence registry and redaction review |
| Workflow Gate | Gate code, owner, route, action and blocker state | IT_DATA + process owner | Add read-only gate checklist, blocker display and audit guard | Mark gate READY from PASS_LOCAL or let AI approve a gate | Signed UAT and gate decision manifest |
| Report View Reliance | Approved report view, source map and data quality check | BGH + IT_DATA + owner department | Show report-view source map and Data Quality Check status | Treat raw workbook/table output as dashboard truth | Report View owner signoff and UAT evidence |
| Finance Reliance Boundary | Contract, receipt, reconciliation, payout and period-lock proof | KHTC + PHAP_CHE + Audit | Draft warnings and read-only exception queues | Auto clear debt, approve COM, approve payout, move money or post statutory accounting | Signed finance/legal UAT and controlled evidence |
| AI Scope Boundary | Approved AI scope, prompt/output audit plan and blocked actions | BGH + IT_DATA + Audit | Draft checklist/risk prompts from approved registers | Let AI write, approve, pay, delete, waive, sign off or mark go-live | Signed AI scope registry and prompt/output audit logging |
| Owner Decision Boundary | Signoff register, evidence reference and human decision | BGH + accountable owners + Audit | Draft decision manifest and missing-owner warnings | Record owner GO/NO-GO inside Codex or infer approval from PASS_LOCAL | Final owner decision outside Codex/chat |

## 4. Placement And Registry Rule

- Legal contracts and legal-basis references stay in the PHAP_CHE legal tree.
- BBNT, payout, bank, voucher and acceptance/payment evidence stay in their
  evidence streams and must not be merged into legal contract folders.
- Registry/index files stay in registry locations and must point to the
  controlled source rather than replacing it.
- Official status requires Folder Registry, File Registry, Version Log, Audit
  Log and Signoff Register checks outside this draft.

## 5. Stop Conditions

Stop and keep the item `NO-GO` or `BLOCKED` when:

- The legal basis is missing, unsigned, expired or outside scope.
- The SOP owner, version, data source, audit log or signoff path is missing.
- Evidence is raw, sensitive, unredacted or stored in Git/Codex/chat.
- The action would create receivable, clear debt, approve payout, approve COM,
  issue invoice, rely on dashboard totals or move money.
- PASS_LOCAL is being treated as UAT acceptance, evidence acceptance, legal
  approval, finance approval, owner waiver or production GO.

## 6. Current Conclusion

Legal/SOP/Governance hardening can continue as PASS_LOCAL drafting, mapping,
checklist and audit-guard work. Production remains NO-GO until backup/restore,
signed migration order, signed UAT, controlled evidence, hard-delete/cascade
closure and final owner Go/No-Go are complete outside Codex/chat.
