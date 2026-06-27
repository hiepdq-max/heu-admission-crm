# HEU Lead-To-Student Handover Policy 2026-06-27

Status: DRAFT_CONTROL
Scope: P3-02 lead-to-student handover for HEU admission workflows, with TTGDTX
9+ as the current pilot evidence path
Production status: NO-GO until signed UAT and human owner approval

## 1. Purpose

Define the minimum handover rule when a lead is ready to move from Tuyen Sinh
to CTHSSV, Dao Tao and, when needed, KHTC. The handover is a controlled
operating checkpoint. It is not a shortcut to receivable creation, tuition
collection, invoice issuance, reconciliation, partner payment or production
go-live.

## 2. Handover Readiness Rule

A lead can be prepared for handover only when the handover packet has:

1. Lead identifier: lead id, lead code, admission segment and current status.
2. Business scope: partner or center, program, major and offering when used.
3. Status basis: `DOCUMENT_SUBMITTED`, `ELIGIBLE` or `ENROLLED` as applicable.
4. Required document checklist and missing-document reason when incomplete.
5. Source/evidence link, redacted when the evidence contains sensitive data.
6. Maker department and actor, normally Tuyen Sinh.
7. Receiving department and actor, normally CTHSSV, Dao Tao or KHTC.
8. Accept or reject result with reason, timestamp and audit activity.

Do not paste raw student, parent, CCCD, phone, bank, password, OTP or credential
data into Git, Codex/chat, screenshots or UAT notes. Use synthetic or redacted
evidence for local work.

## 3. Department Responsibilities

| Department | Responsibility |
|---|---|
| Tuyen Sinh | Creates the handover packet, confirms lead scope and records why the lead is ready |
| CTHSSV | Accepts or rejects the student/profile packet and records missing-document reasons |
| Dao Tao | Checks class/program/major readiness before operational enrollment tracking |
| KHTC | Reads only finance-relevant handover context and continues through P2-05/P2-03/P4 controls |
| Phap Che/Audit | Reviews legal/evidence exceptions and high-risk waivers |

Minimum permission hooks already named in the system are:

- `handover.create`
- `handover.accept_cthssv`
- `handover.accept_accounting`

Future implementation must enforce role and workspace scope on the server side,
not only by hiding buttons in the UI.

## 4. Finance Boundary

Lead-to-student handover does not:

- Create receivables.
- Collect tuition.
- Issue invoice or receipt.
- Reconcile money.
- Approve partner payment.
- Execute payout.
- Mark revenue as recognized.
- Mark production GO.

For TTGDTX 9+, P2-05 remains the receivable gate and P2-03 remains the final
student receivable creation control. P0-19, P2-01 and P2-02 must still be ready
before any finance posting. P3-03 can prepare a finance handover trigger, but
KHTC must still pass the finance gates before recording receivable or money
movement.

## 5. AI Boundary

AI may summarize handover history, suggest missing checklist items and warn
about scope or evidence risk. AI must not accept handover, reject handover,
approve eligibility, create receivable, collect money, issue invoice, approve
payment, release evidence, delete records or mark go-live.

AI output alone is not approval evidence.

## 6. UAT Cases

| Case | Expected result |
|---|---|
| P3-02-01 Complete TTGDTX linked lead packet | Tuyen Sinh can prepare handover; receiving department sees only scoped data |
| P3-02-02 Missing required document | Handover is blocked or returned with reason; no finance action is created |
| P3-02-03 Out-of-scope receiver | Receiver cannot read or accept the packet |
| P3-02-04 KHTC reads handover context | KHTC can continue to P2-05/P2-03 only when legal/tuition/finance gates pass |
| P3-02-05 AI suggestion shown | Suggestion remains advisory; human accept/reject/audit is still required |
| P3-02-06 Sensitive evidence in source file | UAT uses redacted/synthetic evidence; raw PII is not committed or pasted |

## 7. Current Evidence

Current local evidence:

- `lib/permissions.ts` names handover permission hooks.
- `lib/heu-os-display.ts` names workflow and audit concepts for CTHSSV handover.
- `docs/TTGDTX_LEAD_QUICK_FIX_UAT_RUNBOOK.md` keeps TTGDTX lead repair scoped
  and prevents self-promotion to `ELIGIBLE` or `ENROLLED`.
- `npm.cmd run audit:heu-lead-handover-policy`
- `npm.cmd run audit:ttgdtx-lead-quick-fix-safety`
- `npm.cmd run audit:ttgdtx-release-gates`

## 8. Current Result

P3-02 is PASS_LOCAL as a policy/control guard. This does not create production
handover, approve enrollment, approve finance posting or approve production
migration. Signed UAT must still prove role scope, accept/reject behavior,
evidence redaction, audit logging and P2/P4 finance boundary behavior.

## 9. P3-02 Acceptance Matrix

The lead detail handover panel exposes
`data-heu-lead-handover-acceptance-matrix="P3-02"`. Handover can support
student or downstream finance context only when each row below is proven with
redacted evidence. Any stop condition keeps production NO-GO.

| Case | Requirement | Minimum evidence | Stop condition |
|---|---|---|---|
| P3-02-ACCEPT-01 | Complete handover packet | Packet includes lead id/code, current status, segment, program/major, source/evidence reference and maker department | Required identity, status, scope or evidence reference is missing |
| P3-02-ACCEPT-02 | Receiving role and workspace scope | Receiver belongs to the target department and can only read scoped handover/student context | Out-of-scope receiver can read, accept or reject the handover |
| P3-02-ACCEPT-03 | Accept/reject decision trace | Accept or reject action records actor, timestamp, status and reason/note when rejecting or returning | Decision is missing actor, timestamp, status or required rejection reason |
| P3-02-ACCEPT-04 | Finance boundary preserved | KHTC can use accepted context only through P0-19, P2-05 and P2-03; handover itself creates no receivable | Handover creates receivable, collects tuition, issues invoice, approves payment or marks revenue |
| P3-02-ACCEPT-05 | Redacted evidence only | UAT evidence uses synthetic/redacted references and keeps raw PII, CCCD, phone, bank data and credentials out of Git/Codex/chat | Raw controlled evidence is pasted into the app note, screenshot, repo or Codex/chat |
| P3-02-ACCEPT-06 | Human approval, audit and AI boundary | Human accept/reject is auditable; AI suggestion is advisory and cannot accept, reject, waive or approve finance | PASS_LOCAL or AI output is treated as handover acceptance, UAT pass, finance approval or production GO |

Decision value: P3_02_ACCEPT / FAIL / BLOCKED.

## 10. P3-02 Handover Decision Manifest

The lead detail handover panel also exposes
`data-heu-lead-handover-decision-manifest="P3-02"`. Use this manifest after
the acceptance matrix. It prepares a human handover reliance decision only and
does not approve enrollment, receivable creation, tuition collection, invoice
issuance, revenue recognition, finance posting, UAT acceptance, owner waiver or
production GO.

Decision value: `P3_02_HANDOVER_READY / NO_GO / BLOCKED`.

| Case | Decision gate | Required decision | Stop condition |
|---|---|---|---|
| P3-02-DEC-01 | Handover packet readiness decision | Lead id/code, status, segment, program or major, source evidence reference and maker department are complete before handover reliance | Missing identity, status, segment, source reference, maker department or controlled packet ID keeps handover NO_GO |
| P3-02-DEC-02 | Receiver role and workspace decision | Receiving department and actor are allowed for the route, role and workspace scope being handed over | Out-of-scope receiver can read, accept, reject or rely on the packet |
| P3-02-DEC-03 | Accept or reject trace decision | Accept/reject action records actor, timestamp, status and reason when rejected or returned | Decision is missing actor, timestamp, final status, rejection reason or audit trail |
| P3-02-DEC-04 | Downstream reliance decision | CTHSSV, Dao Tao and KHTC may rely only on accepted handover context; KHTC still uses P0-19, P2-05 and P2-03 finance gates | Handover is treated as enrollment approval, receivable creation, tuition collection, invoice issuance, revenue recognition or finance posting |
| P3-02-DEC-05 | Evidence redaction decision | Evidence is synthetic or redacted and stored as controlled references outside Git/Codex/chat | Raw PII, CCCD, phone, bank data, parent data, credentials, screenshots or uncontrolled evidence enter the app note, repo or Codex/chat |
| P3-02-DEC-06 | Human handover decision recorded | Process owner records `P3_02_HANDOVER_READY`, `NO_GO` or `BLOCKED` with signer, date, route result and evidence reference | `PASS_LOCAL` or AI output is treated as signed handover acceptance, UAT acceptance, finance approval, owner waiver or production GO |

P3-02 can support downstream CTHSSV/Dao Tao/KHTC reliance only when
P3-02-ACCEPT-01 through P3-02-ACCEPT-06 and P3-02-DEC-01 through
P3-02-DEC-06 are closed with redacted evidence and signed owner approval.
