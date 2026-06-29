# HEU Controlled Evidence Redaction Pack 2026-06-27

Status: PASS_LOCAL_PACK
Mode: evidence intake and redaction control. This document does not approve
production, UAT pass, backup completion, migration, finance action or owner
Go/No-Go.

Production remains NO-GO until required evidence is collected in the approved
controlled location, redacted where needed, reviewed by the evidence owner and
signed by the required owners.

## 1. Non-Negotiable Boundary

- Do not paste secrets, passwords, temporary passwords, OTPs, service-role
  keys, API keys, private keys, bank credentials, password reset links, account
  activation/invite links, raw student PII, raw CCCD, raw phone numbers, raw
  bank account numbers, bank statements, vouchers or raw payment data into Git,
  Codex/chat, docs, issues, screenshots or browser notes.
- Do not store raw controlled evidence in Git.
- Store sensitive backup/UAT/bank/source evidence outside Git in the
  access-controlled evidence location selected by IT_DATA and Audit.
- Temporary passwords and account activation/invite links are forbidden in
  Git/Codex/chat.
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
| FORBIDDEN_IN_GIT_OR_CODEX | Password, temporary password, OTP, password reset link, account activation/invite link, API key, service-role key, private key, bank credential, raw CCCD, raw bank account, raw student PII, raw payment data | Password manager or approved secure system only | NEVER |

## 3. Redaction Rules

Before any evidence is attached to a Git-tracked doc, Codex/chat, issue or
browser note:

1. Replace student names with role-safe labels such as `STUDENT_001`.
2. Mask CCCD/passport/private identifiers as `********1234`.
3. Mask phone numbers as `*******123`.
4. Mask bank accounts as `************1234`.
5. Remove passwords, temporary passwords, OTPs, password reset links, account
   activation/invite links, API keys, service-role keys, private keys and bank
   credentials entirely.
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
| P6-04 role/workspace browser UAT screenshots | IT_DATA + TRUONG_PHONG + Audit |
| P6-03 audit-log UAT trace evidence | Audit + IT_DATA + KHTC |
| P6-06 hard-delete/cascade conversion or narrow waiver evidence | IT_DATA + Audit + affected business owner |
| Final production owner Go/No-Go pack | BGH + IT_DATA + KHTC + PHAP_CHE + Audit |

## 6. Stop Conditions

Keep production NO-GO and stop evidence handling if any condition below is
true:

1. A password, temporary password, OTP, password reset link, account
   activation/invite link, API key, service-role key, private key or bank
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

## 8. P0-10 Controlled Evidence Acceptance Matrix

The app exposes
`data-heu-controlled-evidence-acceptance-matrix="P0-10"` in
`components/audit/controlled-evidence-redaction-guard.tsx`. Use this matrix
before any redacted evidence reference enters a tracked document, checklist,
issue, screenshot or Codex/chat. It prepares evidence for human review; it does
not accept evidence or approve production.

| Case | Requirement | Minimum evidence | Stop condition |
|---|---|---|---|
| P0-10-ACCEPT-01 | Evidence classified before use | Each item is marked PUBLIC_CONTROL, CONTROLLED_REDACTED, CONTROLLED_SENSITIVE or FORBIDDEN_IN_GIT_OR_CODEX | Classification is missing, guessed, or a forbidden item is treated as redacted evidence |
| P0-10-ACCEPT-02 | Sensitive originals stay outside Git/Codex | Backup, UAT, bank, voucher, source workbook and signed evidence originals live only in the controlled evidence location | Raw controlled evidence is stored in Git, docs, screenshots, browser notes, issues or Codex/chat |
| P0-10-ACCEPT-03 | Redaction preserves proof while removing private data | Names, CCCD/passport, phone, bank account, credentials, temporary passwords, reset/activation/invite links, vouchers and raw payment data are masked or removed | The redacted copy leaks private data or no longer proves the intended control |
| P0-10-ACCEPT-04 | Owner and Audit review recorded | Evidence owner, Audit reviewer, date, controlled storage reference and required business owner review are recorded | Evidence has no owner, reviewer, date, controlled storage reference or business owner review |
| P0-10-ACCEPT-05 | Only safe references enter tracked work | Git/docs/Codex contain only non-secret evidence IDs, masked snippets or reviewed redacted copies | A secret, raw PII, bank statement, voucher, source workbook or signed sensitive document enters tracked work |
| P0-10-ACCEPT-06 | Production boundary acknowledged | The evidence note states PASS_LOCAL proves structure only and does not accept evidence, UAT, migration, finance action or GO | PASS_LOCAL is treated as evidence acceptance, UAT pass, backup completion, finance approval, owner waiver or production GO |

Decision value: P0_10_ACCEPT / NO_GO / BLOCKED.

## 9. P0-14 Controlled Evidence Intake Ledger

The TTGDTX production evidence binder exposes
`data-p014-controlled-evidence-intake-ledger="P0-14"` in
`components/ttgdtx/ttgdtx-production-evidence-binder.tsx`. Use this ledger
after P0-10 redaction review and before P0-14 closure. It does not accept
evidence or approve production.

Each blocker row must record only Git-safe references:

| Field | Requirement |
|---|---|
| Evidence ID | Non-secret reference ID only; no raw file, credential, bank data, voucher, student PII or private link |
| Controlled folder reference | Location label or approved controlled folder reference outside Git/Codex/chat |
| Evidence class | PUBLIC_CONTROL, CONTROLLED_REDACTED, CONTROLLED_SENSITIVE or FORBIDDEN_IN_GIT_OR_CODEX |
| Redaction reviewer | Reviewer name/initials and review date recorded outside Git if sensitive |
| Owner signature state | ACCEPT / NO_GO / BLOCKED for the required owner group |
| Blocker decision | P0_14_INTAKE_READY / NO_GO / BLOCKED |

Decision value: P0_14_INTAKE_READY / NO_GO / BLOCKED.

Stop if the evidence ID is missing, storage is uncontrolled, redaction review is
missing, owner signature is missing or forbidden content appears in
Git/Codex/chat. PASS_LOCAL proves only that the intake-ledger structure exists;
it does not prove evidence was collected, accepted, signed or production-ready.
