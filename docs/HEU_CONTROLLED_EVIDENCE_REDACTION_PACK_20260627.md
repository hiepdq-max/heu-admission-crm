# HEU Controlled Evidence Redaction Pack 2026-06-27

Status: PASS_LOCAL_PACK
Mode: evidence intake and redaction control. This document does not approve
production, UAT pass, backup completion, migration, finance action or owner
Go/No-Go.

Production remains NO-GO until required evidence is collected in the approved
controlled location, redacted where needed, reviewed by the evidence owner and
signed by the required owners.

## 1. Non-Negotiable Boundary

- Do not paste secrets, passwords, OTPs, service-role keys, API keys, private
  keys, bank credentials, reset links, raw student PII, raw CCCD, raw phone
  numbers, raw bank account numbers, bank statements, vouchers or raw payment
  data into Git, Codex/chat, docs, issues, screenshots or browser notes.
- Do not store raw controlled evidence in Git.
- Store sensitive backup/UAT/bank/source evidence outside Git in the
  access-controlled evidence location selected by IT_DATA and Audit.
- Codex/AI may draft templates, check local files and warn about missing
  controls. Codex/AI must not receive raw credentials or raw private data.

PASS_LOCAL means the redaction control pack and local audit exist. PASS_LOCAL
does not mean evidence was collected, redacted evidence was accepted, UAT
passed, production migration is approved, finance action is approved or
production GO is approved.

## 2. Evidence Classification

| Class | Examples | Storage rule | Allowed in Git/Codex |
|---|---|---|---|
| PUBLIC_CONTROL | Static audit output, non-sensitive runbook text, empty templates, synthetic data | Git/docs allowed | YES |
| CONTROLLED_REDACTED | Masked screenshots, masked log snippets, masked evidence index, non-secret evidence reference | Git/docs allowed after owner review | YES, only after review |
| CONTROLLED_SENSITIVE | Backup ID, restore target detail, signed UAT evidence, bank statement, voucher, source workbook, raw screenshot, contract-sensitive file | Approved controlled evidence location outside Git | NO |
| FORBIDDEN_IN_GIT_OR_CODEX | Password, OTP, reset link, API key, service-role key, private key, bank credential, raw CCCD, raw bank account, raw student PII, raw payment data | Password manager or approved secure system only | NEVER |

## 3. Redaction Rules

Before any evidence is attached to a Git-tracked doc, Codex/chat, issue or
browser note:

1. Replace student names with role-safe labels such as `STUDENT_001`.
2. Mask CCCD/passport/private identifiers as `********1234`.
3. Mask phone numbers as `*******123`.
4. Mask bank accounts as `************1234`.
5. Remove passwords, OTPs, reset links, API keys, service-role keys, private
   keys and bank credentials entirely.
6. Use evidence references instead of raw bank statements, vouchers, signed
   documents or source workbooks.
7. Keep only the minimum visible fields needed to prove the control.
8. Record who redacted the evidence, who reviewed it and where the controlled
   original is stored outside Git.

## 4. Intake Workflow

| Step | Owner | Required action | Output |
|---|---|---|---|
| 1. Receive evidence | Process owner | Place original in the approved controlled evidence location | Original outside Git |
| 2. Classify | IT_DATA + Audit | Mark PUBLIC_CONTROL, CONTROLLED_REDACTED, CONTROLLED_SENSITIVE or FORBIDDEN_IN_GIT_OR_CODEX | Classification note |
| 3. Redact | Evidence owner | Mask/remove private fields using the redaction rules | Redacted copy or evidence reference |
| 4. Review | Audit + required business owner | Confirm no forbidden data remains and the control is still provable | Reviewer initials/date |
| 5. Reference | Codex/IT_DATA | Put only redacted copy or non-secret evidence reference into docs/checklists | Git-safe evidence reference |
| 6. Sign | Required owners | Sign UAT, backup, migration, finance or Go/No-Go decision outside Codex | Owner decision |

## 5. Evidence Types Requiring This Pack

| Evidence type | Minimum review |
|---|---|
| Supabase backup and restore proof | IT_DATA + Audit |
| Step90-Step110 preflight/postflight screenshots | IT_DATA + Audit |
| P0-19 legal/finance UAT evidence | PHAP_CHE + KHTC |
| P2-17 payout evidence and duplicate-click proof | KHTC + Audit |
| P2-18 dashboard comparison evidence | KHTC + BGH + IT_DATA |
| Role/workspace browser UAT screenshots | IT_DATA + Audit |
| Audit-log UAT evidence | Audit + IT_DATA |
| Hard-delete/cascade waiver or conversion evidence | IT_DATA + Audit |
| Final production owner Go/No-Go pack | BGH + IT_DATA + KHTC + PHAP_CHE + Audit |

## 6. Stop Conditions

Keep production NO-GO and stop evidence handling if any condition below is
true:

1. A password, OTP, reset link, API key, service-role key, private key or bank
   credential appears in Git, Codex/chat, docs, issue text or browser notes.
2. Raw student PII, raw CCCD, raw phone, raw bank account, bank statement,
   voucher or raw payment data is visible in a Git-tracked file.
3. Evidence has no owner, reviewer, date or controlled storage reference.
4. Backup/restore proof is stored only in the repo instead of the controlled
   evidence location.
5. A redacted screenshot no longer proves the intended control.
6. Any HIGH or BLOCKER exception is unresolved.

## 7. Local Preflight

Run these checks after updating any production-readiness evidence docs:

```powershell
npm.cmd run audit:heu-controlled-evidence-redaction-pack
npm.cmd run audit:ttgdtx-production-owner-signoff-pack
npm.cmd run audit:ttgdtx-release-gates
npm.cmd run lint
npm.cmd run build
git status --short --branch
```

Passing these checks proves only that local documentation and gates are aligned.
It does not prove that sensitive evidence exists, that evidence was accepted, or
that production is approved.
