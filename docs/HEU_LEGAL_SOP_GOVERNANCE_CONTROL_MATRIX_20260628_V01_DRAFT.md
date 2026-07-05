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
| PASS_LOCAL SOP Loop | `docs/HEU_REAL_DATA_LOGIC_PROFESSIONAL_LEGAL_CONFIRMATION_REGISTER_20260702.md`, `docs/HEU_CODEX_OPERATING_PLAYBOOK.md`, current-state inventory, system backlog and module readiness gap matrix | Codex + IT_DATA + PHAP_CHE + process owner + Audit | Route each small slice through `SOP-01` through `SOP-06`: check current state, professional review, legal/SOP review, logic/data review, focused PASS_LOCAL verification and continue-or-stop | Treat the loop as legal advice, official SOP issuance, UAT/evidence acceptance, finance reliance, owner GO/NO-GO or production GO | Implementation-log entry, focused audit/lint/build result and human owner signoff outside Codex/chat |
| Evidence Class Boundary | File registry, evidence class and redaction rule | Audit + IT_DATA + process owner | Classify as public control, controlled redacted, controlled sensitive or forbidden in Git/Codex/chat | Move real evidence, paste raw PII/bank/voucher/password data or mix legal files with BBNT/payment evidence | Controlled Drive evidence registry and redaction review |
| Workflow Gate | Gate code, owner, route, action and blocker state | IT_DATA + process owner | Add read-only gate checklist, blocker display and audit guard | Mark gate READY from PASS_LOCAL or let AI approve a gate | Signed UAT and gate decision manifest |
| Report View Reliance | Approved report view, source map and data quality check | BGH + IT_DATA + owner department | Show report-view source map and Data Quality Check status | Treat raw workbook/table output as dashboard truth | Report View owner signoff and UAT evidence |
| Finance Reliance Boundary | Contract, receipt, reconciliation, payout and period-lock proof | KHTC + PHAP_CHE + Audit | Draft warnings and read-only exception queues | Auto clear debt, approve COM, approve payout, move money or post statutory accounting | Signed finance/legal UAT and controlled evidence |
| AI Scope Boundary | Approved AI scope, prompt/output audit plan and blocked actions | BGH + IT_DATA + Audit | Draft checklist/risk prompts from approved registers | Let AI write, approve, pay, delete, waive, sign off or mark go-live | Signed AI scope registry and prompt/output audit logging |
| Owner Decision Boundary | Signoff register, evidence reference and human decision | BGH + accountable owners + Audit | Draft decision manifest and missing-owner warnings | Record owner GO/NO-GO inside Codex or infer approval from PASS_LOCAL | Final owner decision outside Codex/chat |

## 3A. STD-14 Authority Checklist

Before any workflow can be treated as operationally reliable, the owner lane
must answer these seven questions. If one answer is missing, the item remains
`NO_GO`, `BLOCKED`, `CAN_SUA` or `CHUA_DU_DIEU_KIEN`.

| Code | Required question | Owner lane | Required proof | Stop rule |
|---|---|---|---|---|
| AUTH-LEGAL-BASIS | Can cu phap ly nao? | PHAP_CHE + process owner | Legal article, contract clause, policy or approved rule | No legal conclusion or legal-basis approval from dashboard |
| AUTH-SOP-VERSION | SOP nao dang ap dung? | PHAP_CHE + owner department + IT_DATA | SOP title, version, owner, effective scope and dependency | No official SOP issuance or version-log replacement |
| AUTH-MAKER | Ai nhap / tao du lieu? | Process owner + IT_DATA | Maker role, route, input source and scope boundary | No account creation, data-entry approval or scope expansion |
| AUTH-CHECKER | Ai kiem tra? | Checker lane + Audit | Checker role, checklist, negative-control and audit trace | No PASS_LOCAL result may replace signed checker evidence |
| AUTH-APPROVER | Ai duyet? | Approver lane + BGH when required | Approver role, threshold, exception path and signoff route | No approval action, owner GO or waiver inside dashboard |
| AUTH-EVIDENCE | Chung tu nam o dau? | Audit + IT_DATA + process owner | Controlled evidence ref, redaction class and retention route | No raw PII, bank, voucher, password or reset-link in Git/Codex/chat |
| AUTH-SIGNER | Ai ky / chot ben ngoai he thong? | BGH + accountable owner + Audit | External signer, date, evidence ref and owner decision path | No inferred approval from PASS_LOCAL, AI output or dashboard status |

`STD-14_LEGAL_SOP_AUTHORITY_CHECKLIST` is a DRAFT_CONTROL checklist only with
`PHAP_CHE_REVIEW_REQUIRED`, `SOP_OWNER_SIGNOFF_REQUIRED`,
`MAKER_CHECKER_APPROVER_REQUIRED`, `CONTROLLED_EVIDENCE_REQUIRED` and
`EXTERNAL_SIGNOFF_REQUIRED` boundaries.

Boundary tokens: `NO_LEGAL_ADVICE`, `NO_OFFICIAL_SOP`, `NO_FINANCE_ACTION`,
`NO_OWNER_GO`, `NO_PRODUCTION_GO`.

It does not provide legal advice, issue official SOP, grant access, approve
finance action, accept UAT, accept evidence, approve owner GO/NO-GO or mark
production GO.

Literal boundary: does not mark production GO.

## 3B. STD-34 Required Answer Index

`STD-34_EXECUTIVE_LEGAL_SOP_REQUIRED_ANSWER_INDEX` is the executive quick
index for the seven required answers in each controlled workflow:
legal basis, SOP, maker, checker, approver, evidence location and external
signer.

| Code | Workflow | Required answer focus | Stop rule |
|---|---|---|---|
| LAW-IDX-01 | F01 Lead to student | Legal/tuition gate, admissions handover SOP, maker/checker/approver and P3/P0-19 evidence signer | No handover reliance if legal gate, SOP version, evidence or signer is missing |
| LAW-IDX-02 | F02 TTGDTX tuition | Contract, tuition policy, collection/invoice SOP, KHTC/PHAP_CHE/Audit checker and finance/legal UAT signer | No finance reliance if policy, source id, DQ or external signoff is missing |
| LAW-IDX-03 | F03 Payment and payout | Contract clause, BBNT, payment request SOP, approval separation, payment dossier and signer | No payment execution, bank instruction or statutory accounting from dashboard |
| LAW-IDX-04 | F06 Short Course | Course policy, BHXH/support rule, attendance/payment SOP and owner signoff | No attendance/payment reliance until policy, UAT and owner signoff exist |
| LAW-IDX-05 | M02 Role and sensitive access | Data-sharing basis, privacy class, activation SOP, P6-04 negative proof and owner decision | No access grant, permission expansion or owner GO from dashboard state |
| LAW-IDX-06 | M10 Dashboard/report reliance | Report-view reliance decision, source-map SOP, DQ-DM-05 and report owner signoff | No dashboard reliance, raw source opening or legal conclusion |

Boundary tokens: `PASS_LOCAL_LEGAL_SOP_REQUIRED_ANSWER_INDEX`,
`REQUIRED_ANSWER_INDEX`, `PHAP_CHE_REVIEW_REQUIRED`,
`SOP_OWNER_SIGNOFF_REQUIRED`, `MAKER_CHECKER_APPROVER_REQUIRED`,
`CONTROLLED_EVIDENCE_REQUIRED`, `EXTERNAL_SIGNOFF_REQUIRED`,
`NO_LEGAL_ADVICE`, `NO_OFFICIAL_SOP`, `NO_APPROVAL_ACTION`,
`NO_FINANCE_ACTION`, `NO_OWNER_GO` and `NO_PRODUCTION_GO`.

It does not provide legal advice, issue official SOP, approve workflow state,
approve finance action, accept UAT, accept evidence, approve owner GO/NO-GO or
mark production GO.

## 3C. STD-40 Evidence Authority Queue

`STD-40_EXECUTIVE_LEGAL_SOP_EVIDENCE_AUTHORITY_QUEUE` is the executive
Legal/SOP queue for missing evidence and authority before any controlled
workflow can be treated as reliable.

| Code | Queue | Owner lane | Required evidence or authority | Stop rule |
|---|---|---|---|---|
| LAW-QUEUE-01 | Legal basis hold | PHAP_CHE + process owner | Legal Article Master ref, P0-19/contract/policy proof and external PHAP_CHE signer | No legal advice, legal conclusion or legal-basis reliance from dashboard |
| LAW-QUEUE-02 | SOP version hold | PHAP_CHE + owner department + IT_DATA | SOP Register row, Version Log entry and signed SOP owner route | No official SOP issuance, version-log replacement or workflow approval |
| LAW-QUEUE-03 | Maker/checker/approver hold | Process owner + Audit + BGH when threshold applies | Role-lane matrix, approval threshold note, audit trace and owner decision route | No approval action, finance action or delegated-authority inference |
| LAW-QUEUE-04 | Controlled evidence hold | Audit + IT_DATA + process owner | Controlled evidence id, redaction reviewer, file registry route and audit-log reference | No raw evidence movement, UAT acceptance or evidence acceptance |
| LAW-QUEUE-05 | External signer hold | BGH + accountable owner + Audit | Signoff Register row, owner decision packet and controlled evidence reference | No owner GO/NO-GO inferred from PASS_LOCAL or dashboard state |
| LAW-QUEUE-06 | Dashboard/report reliance legal hold | BGH + IT_DATA + PHAP_CHE + Audit | Report View Register, source map, DQ result, signer lane and legal/SOP dependency | No dashboard reliance, report-view reliance or legal conclusion |

Boundary tokens: `PASS_LOCAL_LEGAL_SOP_EVIDENCE_AUTHORITY_QUEUE`,
`EVIDENCE_AUTHORITY_QUEUE`, `PHAP_CHE_REVIEW_REQUIRED`,
`SOP_OWNER_SIGNOFF_REQUIRED`, `MAKER_CHECKER_APPROVER_REQUIRED`,
`CONTROLLED_EVIDENCE_REQUIRED`, `EXTERNAL_SIGNOFF_REQUIRED`,
`OWNER_SIGNOFF_PENDING`, `NO_LEGAL_ADVICE`, `NO_OFFICIAL_SOP`,
`NO_APPROVAL_ACTION`, `NO_FINANCE_ACTION`, `NO_DASHBOARD_RELIANCE`,
`NO_REPORT_VIEW_RELIANCE`, `NO_RAW_EVIDENCE_MOVEMENT`,
`NO_EVIDENCE_ACCEPTANCE`, `NO_UAT_ACCEPTANCE`, `NO_OWNER_GO` and
`NO_PRODUCTION_GO`.

It does not provide legal advice, issue official SOP, approve workflow state,
execute finance, accept UAT, accept evidence, approve owner GO/NO-GO or mark
production GO.

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
- Any PASS_LOCAL SOP loop step is skipped, or PASS_LOCAL is recorded without
  current-state check, professional owner review, PHAP_CHE legal/SOP route,
  IT_DATA/Audit logic-data check and focused audit/lint/build result.
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
