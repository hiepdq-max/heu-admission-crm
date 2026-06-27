# HEU Lead Lifecycle Standard 2026-06-27

Status: DRAFT_CONTROL  
Scope: P3-01 admission lead lifecycle for HEU CRM, with TTGDTX-linked pilot
as the current controlled path  
Production status: NO-GO until signed role/workflow UAT and owner approval

## 1. Purpose

Define one operating spine for admission leads before any handover or finance
workflow can rely on them. P3-01 standardizes the lead statuses, owners,
minimum evidence and stop conditions. It does not approve production access,
schema migration, real-data import, finance posting or Go/No-Go.

## 2. Lifecycle Phases

| Phase | Statuses | Owner | Minimum control |
|---|---|---|---|
| P3-01-L01 Capture and assignment | `NEW`, `ASSIGNED` | Tuyen Sinh | Lead has source, admission segment and responsible user |
| P3-01-L02 Contact and nurture | `CONTACTED`, `INTERESTED`, `FOLLOW_UP`, `VISITED` | Tuyen Sinh | Activity result and next action are recorded; `FOLLOW_UP` requires `next_followup_at` |
| P3-01-L03 Document readiness | `DOCUMENT_PENDING`, `DOCUMENT_SUBMITTED` | Tuyen Sinh + CTHSSV | Required document checklist and source/evidence link are controlled |
| P3-01-L04 Eligibility | `ELIGIBLE` | Tuyen Sinh + Dao Tao + Phap Che | P0-19 legal/tuition gate must allow the status before finance use |
| P3-01-L05 Enrollment and handover | `ENROLLED` | CTHSSV + Dao Tao + KHTC | P3-02 handover is accepted by scoped receiver; P2-05/P2-03 remain finance gates |
| P3-01-L06 Closed or exception | `LOST`, `DUPLICATE` | Tuyen Sinh + Audit | `LOST` requires `lost_reason`; duplicates keep history and are not hard-deleted |

## 3. Server-Side Rules

The UI may explain the lifecycle, but enforcement must be server-side and
auditable.

Current local server-side checks include:

1. `FOLLOW_UP` requires `next_followup_at`.
2. `LOST` requires `lost_reason`.
3. `ELIGIBLE` and `ENROLLED` require the P0-19 legal/tuition gate check before
   finance use.
4. Status changes revalidate lead, pipeline, follow-up, report and dashboard
   routes.
5. P3-02 handover has separate accept/reject controls and does not create
   receivables.

Future implementation must not rely only on hidden buttons.

## 4. Finance Boundary

Lead lifecycle does not:

- Create receivables.
- Collect tuition.
- Issue invoice or receipt.
- Reconcile money.
- Approve partner payment.
- Execute payout.
- Mark revenue.
- Mark production GO.

P3-02 prepares lead-to-student handover. P2-05 remains the receivable gate and
P2-03 remains the final student receivable creation control. P0-19, P2-01 and
P2-02 must still be ready before any finance posting.

## 5. Sensitive Data And AI Boundary

No raw form dump into AI.

Do not paste secrets, passwords, OTPs, service-role keys, API keys, bank
credentials, reset links, raw student PII, raw CCCD, raw phone numbers, bank
account numbers, bank statements, vouchers or payment evidence into Git,
Codex/chat, screenshots or UAT notes.

AI may summarize lead history, suggest missing checklist items and warn about
scope or evidence risk. AI must not assign lead ownership, accept handover,
approve eligibility, create receivable, collect money, issue invoice, approve
payment, delete records or mark go-live. AI output alone is not approval
evidence.

## 6. UAT Cases

| Case | Expected result |
|---|---|
| P3-01-01 New lead with source and segment | Lead appears in the correct workspace scope and is not exposed outside scope |
| P3-01-02 Follow-up without date | Server rejects the status update |
| P3-01-03 Lost lead without reason | Server rejects the status update |
| P3-01-04 Eligible without legal/tuition gate | Server blocks and records the P0-19 reason |
| P3-01-05 Document submitted to handover | P3-02 handover is prepared; no receivable is created |
| P3-01-06 Duplicate lead | Lead is closed by status/exception, not hard-deleted |
| P3-01-07 AI suggestion | Suggestion remains advisory and cannot approve status, finance or Go/No-Go |

## 7. Current Evidence

Current local evidence:

- `lib/lead-lifecycle.ts`
- `components/leads/lead-lifecycle-guard.tsx`
- `app/leads/page.tsx`
- `app/leads/[id]/actions.ts`
- `docs/HEU_LEAD_TO_STUDENT_HANDOVER_POLICY_20260627.md`
- `npm.cmd run audit:heu-lead-lifecycle-standard`
- `npm.cmd run audit:heu-lead-handover-policy`
- `npm.cmd run audit:ttgdtx-release-gates`

## 8. Current Result

P3-01 is PASS_LOCAL as a lead lifecycle standard and UI guard. This does not
approve production CRM use, production migration, real-data import, finance
action, UAT acceptance, owner waiver or production GO. Signed role/workflow UAT
must still prove workspace scope, status transitions, evidence redaction,
handover boundary and finance-gate behavior.
