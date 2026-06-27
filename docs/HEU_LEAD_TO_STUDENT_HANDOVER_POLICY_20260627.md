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
