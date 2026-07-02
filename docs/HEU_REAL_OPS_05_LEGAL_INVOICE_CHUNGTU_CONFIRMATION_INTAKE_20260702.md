# HEU REAL-OPS-05 Legal Invoice Chung-Tu Confirmation Intake 2026-07-02

Status: PASS_LOCAL_LEGAL_INVOICE_INTAKE
Decision value: REAL_OPS_05_LEGAL_INVOICE_READY / NO_GO / BLOCKED
Scope: legal, SOP, tuition, invoice and chung-tu confirmation intake before
finance reliance, migration order review or owner GO/NO-GO.

This intake exists so PHAP_CHE, KHTC, BGH, IT_DATA and Audit know what
controlled references must be present before legal/finance gate closure can be
considered by human authority. It does not provide legal advice, decide tax
position, issue invoice, accept evidence, execute UAT, approve finance
reliance, approve migration, approve owner GO/NO-GO or mark production GO.

## Intake Rules

- Record controlled evidence IDs, owner labels, legal/SOP decision references,
  tuition policy version, invoice/chung-tu responsibility and redaction class
  only.
- Keep private contracts, signed legal memos, raw source files, vouchers,
  invoice images, bank statements, raw payment data, student files, account
  credentials, temporary passwords, OTPs, password reset links, account
  activation/invite links and service-role keys outside Git/Codex/chat.
- Stop if P0-19 legal/finance gate, P2-01 contract master, P2-02 tuition
  policy, P2-10 invoice/chung-tu decision or waiver basis is missing.
- Stop if any owner asks Codex/AI to decide the legal position, tax position,
  invoice responsibility, waiver validity or finance approval.

## Required Intake Lanes

| Lane | Owner | Required reference | Stop condition |
|---|---|---|---|
| `REAL-OPS-05-LEG-01` P0-19 legal gate basis checked | PHAP_CHE + KHTC + BGH | P0_19_GATE_READY / NO_GO / BLOCKED, controlled evidence ID and signed owner route | Legal/finance gate is unsigned, ownerless, broad, expired or treated as PASS_LOCAL approval |
| `REAL-OPS-05-LEG-02` Contract and SOP basis mapped | PHAP_CHE + IT_DATA + Audit | P2-01 contract master reference, SOP/legal article reference, scope period and signer owner | Contract/SOP source is uncontrolled, unclear, chat-only or mixed with raw private contract content |
| `REAL-OPS-05-LEG-03` Tuition policy aligned | KHTC + PHAP_CHE | P2-02 tuition policy version, payer model, due-rule basis and waiver/exception reference | Tuition amount, term, payer model or waiver basis is unresolved |
| `REAL-OPS-05-LEG-04` Invoice/chung-tu decision closed | KHTC + PHAP_CHE + Audit | P2_10_INVOICE_READY / NO_GO / BLOCKED, invoice_required, issuer, number/date/evidence or authorized waiver reference | Required invoice/chung-tu is missing, wrong owner, uncontrolled, raw, or allowed downstream while PENDING_POLICY |
| `REAL-OPS-05-LEG-05` Evidence redaction class confirmed | Audit + PHAP_CHE + KHTC | Evidence class, redaction reviewer, storage owner and allowed reference format | Private contracts, vouchers, invoice images, raw PII, bank data or payment data are pasted into Git/Codex/chat |
| `REAL-OPS-05-LEG-06` Authority decision path prepared | BGH + PHAP_CHE + KHTC + Audit | REAL_OPS_05_LEGAL_INVOICE_READY, NO_GO or BLOCKED with signer labels and decision path | PASS_LOCAL is treated as legal conclusion, tax advice, invoice approval, finance approval, owner GO/NO-GO or production GO |

## Linked Surfaces

- `components/ttgdtx/ttgdtx-p019-uat-evidence-checklist.tsx`
- `components/ttgdtx/ttgdtx-invoice-policy-matrix.tsx`
- `components/master-control/production-readiness-blocker-summary.tsx`
- `data-heu-real-ops-05-legal-invoice-intake="REAL-OPS-05_LEGAL_INVOICE"`
- `docs/P0_19_P2_01_P2_02_PILOT_OPEN_UAT_RUNBOOK.md`
- `docs/TTGDTX_P2_10_INVOICE_POLICY_UAT_RUNBOOK_20260627.md`
- `docs/HEU_REAL_OPERATION_CLOSURE_PLAN_20260702.md`

## PASS_LOCAL Checks

- `npm.cmd run audit:ttgdtx-p019-gate-guard`
- `npm.cmd run audit:ttgdtx-invoice-policy`
- `npm.cmd run audit:heu-bgh-dashboard-spec`
- `npm.cmd run audit:heu-implementation-log`
- `npm.cmd run audit:ttgdtx-release-gates`
- `npm.cmd run lint`
- `npm.cmd run build`
- `git diff --check`

Passing local checks means only the legal/invoice/chung-tu intake structure
exists and is audited. It does not mean legal basis, tax position,
invoice/chung-tu issuance, evidence, UAT, finance reliance, migration,
owner GO/NO-GO or production operation is approved.
