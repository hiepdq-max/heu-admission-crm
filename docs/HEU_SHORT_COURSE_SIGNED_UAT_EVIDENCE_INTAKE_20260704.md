# HEU Short Course Signed UAT Evidence Intake 2026-07-04

Status: PASS_LOCAL_EVIDENCE_INTAKE
Decision lane: SC_SIGNED_UAT_EVIDENCE_READY / NO_GO / BLOCKED
Production/UAT status: NO-GO until signed Short Course UAT, owner signoff,
role/negative-access proof, source reconciliation, report-view signoff,
controlled evidence refs and final owner quorum are recorded outside
Git/Codex/chat.

## Purpose

This intake pack defines how signed M07/P9 Short Course UAT evidence
references must be recorded after external owners complete real UAT outside
Codex/chat. It links `RV_SHORT_COURSE_ATTENDANCE_PAYMENT`, SC-REV-01 through
SC-REV-06, SC-SIGN-01 through SC-SIGN-06, SC-UAT-01 through SC-UAT-08 and
SC-UAT-LEDGER-01 through SC-UAT-LEDGER-08 into one evidence intake route.

It is local intake packaging only. It does not execute UAT, accept evidence,
approve attendance lock, approve BHXH/chinh sach, approve meal/allowance,
approve HR payment, approve teacher payment, verify invoice/payment, approve
report-view reliance, approve dashboard reliance, approve role UAT, approve
access closure, approve owner GO/NO-GO or mark production GO.

## Intake Boundary

Only non-secret references may be recorded here or in any tracked file. The
actual evidence package, browser screenshots, raw exports, signed PDFs, source
workbooks, payment vouchers and reviewer notes must stay in the approved
controlled evidence location outside Git/Codex/chat.

Forbidden content boundary: do not paste raw student personal data, raw teacher
personal data, CCCD, CMND, passport, phone numbers, personal emails, private
contracts, salary, allowance, payroll files, bank data, vouchers, passwords,
OTPs, password reset links, account activation/invite links, service-role keys,
API keys, raw screenshots, raw exports, signed PDFs, raw Drive URLs or raw
evidence into Git, Codex/chat, docs or screenshots.

Exact forbidden token: raw teacher personal data.
Evidence cases: SC-UAT-EVID-01 through SC-UAT-EVID-08.
Boundary token: does not execute UAT, accept evidence, approve access closure,
approve owner GO/NO-GO or mark production GO.

## Signed UAT Evidence Intake Matrix

| Case | Evidence package | Required intake fields | Stop condition |
| --- | --- | --- | --- |
| SC-UAT-EVID-01 | Signed evidence storage location | evidence_ref, storage_class, owner_lane and forbidden-content review point to the approved controlled store | Evidence is pasted into Git/Codex/chat or storage class is unknown |
| SC-UAT-EVID-02 | Signed attendance lock and exception-route UAT package | linked_uat_case, route_or_artifact, signer lane, signed_date, result and blocker_state are recorded for SC-UAT-01 and SC-UAT-02 | Attendance lock is treated as accepted from PASS_LOCAL |
| SC-UAT-EVID-03 | Signed BHXH/chinh sach decision package | linked_review_item, linked_signoff_case, policy/legal basis ref, signer lane and blocker_state are recorded for SC-UAT-03 | Policy effect or eligibility is trusted without owner/legal signoff |
| SC-UAT-EVID-04 | Signed meal/allowance and HR payment boundary package | formula version, attendance source, blocked-payment result, HR/KHTC signer lane and blocker_state are recorded for SC-UAT-04 | System calculates or pays meal, allowance, teacher, HR or payroll amount before signed boundary |
| SC-UAT-EVID-05 | Signed invoice/payment verification package | voucher/reversal/period-lock proof refs, KHTC signer lane and blocker_state are recorded for SC-UAT-05 | Invoice/payment is verified, posted, reversed or period-closed without controlled evidence |
| SC-UAT-EVID-06 | Signed report-view source reconciliation package | linked_report_view, DQ result, allowed consumer list, owner reliance result and blocker_state are recorded for SC-UAT-06 | Dashboard or report view is relied on before signed source reconciliation |
| SC-UAT-EVID-07 | Signed role/negative-access proof package | linked_negative_access_case, account label, route_or_artifact, redaction_reviewer and blocker_state cover allowed and denied accounts for SC-UAT-07 | Out-of-scope user can see private attendance, policy, payment, payroll, voucher or teacher data |
| SC-UAT-EVID-08 | Final owner quorum evidence package | evidence_ref, owner_lane, linked_uat_ledger_case, linked_signoff_case, signed_date, final quorum result and blocker_state are recorded outside Codex/chat | Final owner GO/NO-GO is missing, unsigned or inferred from local checks |

## Required Intake Fields

| field | required value |
| --- | --- |
| evidence_ref | Controlled redacted reference only; no raw evidence |
| storage_class | CONTROLLED_REDACTED or CONTROLLED_SENSITIVE outside Git |
| owner_lane | DAO_TAO, CTHSSV, PHAP_CHE, HR, KHTC, BGH, IT_DATA, Audit or final owner quorum |
| linked_uat_case | SC-UAT-01 through SC-UAT-08 or SC-UAT-LEDGER-01 through SC-UAT-LEDGER-08 |
| linked_review_item | SC-REV-01 through SC-REV-06 |
| linked_signoff_case | SC-SIGN-01 through SC-SIGN-06 |
| linked_negative_access_case | SC-ROLE-EVID-01 through SC-ROLE-EVID-06 or N/A |
| linked_report_view | RV_SHORT_COURSE_ATTENDANCE_PAYMENT or N/A |
| route_or_artifact | `/short-course`, `/reports`, owner signoff pack, UAT ledger or controlled artifact label |
| redaction_reviewer | IT_DATA or Audit reviewer outside Codex/chat |
| signed_date | Signed date outside Codex/chat |
| result | SC_SIGNED_UAT_EVIDENCE_READY / NO_GO / BLOCKED |
| blocker_state | CLOSED, NO_GO or BLOCKED |
| forbidden_content_boundary | No raw student/teacher data, payroll, bank data, vouchers, secrets, raw screenshots, raw exports, signed PDFs, raw Drive URLs or raw evidence in Git/Codex/chat |

## Required Local Re-Run

```powershell
npm.cmd run check:heu-short-course-signed-uat-evidence-intake
npm.cmd run check:heu-short-course-external-owner-action-queue
npm.cmd run check:heu-short-course-role-negative-access
npm.cmd run check:heu-training-module-completion-breakdown
npm.cmd run audit:heu-short-course-attendance-payment-gap-pack
```

Expected local result:

- `SC_SIGNED_UAT_EVIDENCE_READY / NO_GO / BLOCKED` is an external evidence
  intake state, not local approval.
- `PASS_LOCAL_EVIDENCE_INTAKE` proves only that the intake route is present.
- M07/P9 remains `NO-GO` until external signatures, controlled evidence refs,
  signed source reconciliation, role proof and owner decisions are complete.

## Intake Stop Rule

Keep the signed UAT evidence intake at NO_GO or BLOCKED if:

- Any required owner signature, signer lane, signed date or controlled evidence
  reference is missing.
- Attendance lock, BHXH/chinh sach decision, meal/allowance boundary,
  invoice/payment verification, role/negative-access proof, source
  reconciliation, report-view signoff or final owner quorum is missing.
- Any evidence package is raw, uncontrolled, ownerless or stored only in
  Git/Codex/chat.
- Any result implies attendance lock, BHXH/chinh sach, meal/allowance, HR
  payment, teacher payment, invoice/payment verification, period close,
  statutory accounting, role UAT, access closure, report-view reliance,
  dashboard reliance, owner GO/NO-GO or production GO from PASS_LOCAL.

This intake pack makes evidence references auditable after real owner work. It
does not make M07/P9 Short Course ready for real operation.
