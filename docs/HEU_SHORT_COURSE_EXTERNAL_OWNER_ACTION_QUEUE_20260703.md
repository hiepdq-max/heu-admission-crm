# HEU Short Course External Owner Action Queue - 2026-07-03

Status: PASS_LOCAL_OWNER_ACTION_QUEUE
Decision lane: SC_EXTERNAL_OWNER_ACTION_READY / NO_GO / BLOCKED
Production/UAT status: NO-GO until signed attendance/payment UAT,
BHXH/chinh sach signoff, meal/allowance boundary signoff,
invoice/payment verification signoff, report-view owner signoff,
role/negative-access UAT, controlled evidence refs, UAT result ledger rows and
signed evidence intake rows and
final owner GO/NO-GO are completed outside Git/Codex/chat.

## Purpose

This queue turns the remaining Short Course / Day Nghe real-operation blockers
from TRN-03 through TRN-10 into external owner actions. It is local packaging
only. It does not execute UAT, accept evidence, approve attendance lock,
approve BHXH/chinh sach, approve meal/allowance, approve HR payment, approve
teacher payment, verify invoice/payment, approve report-view reliance, grant
access, approve owner GO/NO-GO or mark production GO.

Secret boundary: do not paste names, phone numbers, emails, CCCD, bank data,
vouchers, payroll files, teacher payment files, private contracts, passwords,
temporary passwords, OTPs, password reset links, account activation/invite
links, service-role keys, raw screenshots, raw Drive URLs or raw evidence into
this file, Git, Codex/chat or screenshots. Use redacted owner labels and
controlled evidence IDs only.

## Current Blocker Shape

All local Short Course closure slices are packaged, but real operation remains
NO-GO:

- Signed attendance lock and exception-route UAT is still required.
- Signed BHXH/chinh sach owner/legal decision is still required.
- Signed meal/allowance and HR payment boundary decision is still required.
- Signed invoice/payment verification, reversal and period-lock decision is
  still required.
- Signed report-view source reconciliation and owner reliance decision is still
  required.
- Signed role/negative-access UAT is still required.
- Signed UAT result ledger rows are still required.
- Signed evidence intake rows are still required.
- Final owner GO/NO-GO must be recorded outside Git/Codex/chat.

PASS_LOCAL checks may continue, but no owner should treat the Short Course
cockpit, local audit output or this queue as a signed UAT pass, finance
reliance decision, payment approval or production approval.

## Required Owner Action Queue

| Action | Owner lane | Required action outside Codex/chat | Required result | Stop condition |
|---|---|---|---|---|
| SC-OWNER-ACTION-01 | Dao Tao + Audit | Execute signed attendance lock and exception-route UAT for SC-LOCK-EVID-01 through SC-LOCK-EVID-06, SC-REV-01, SC-UAT-01/02 and SC-SIGN-01 | SC_ATTENDANCE_LOCK_EVIDENCE_READY / NO_GO / BLOCKED is signed with date, signer lane, route and controlled evidence ID | Attendance lock, attendance approval or payment readiness is inferred from a local screen |
| SC-OWNER-ACTION-02 | CTHSSV + Phap Che + Audit | Execute signed BHXH/chinh sach owner/legal decision for SC-BHXH-EVID-01 through SC-BHXH-EVID-06, SC-REV-02, SC-UAT-03 and SC-SIGN-02 | SC_BHXH_POLICY_DECISION_READY / NO_GO / BLOCKED is signed with policy/legal basis and controlled evidence ID | Policy effect, eligibility or downstream payment is accepted without owner/legal signoff |
| SC-OWNER-ACTION-03 | Dao Tao + HR + KHTC + Audit | Execute signed meal/allowance and HR payment boundary review for SC-MEAL-EVID-01 through SC-MEAL-EVID-06, SC-REV-03, SC-UAT-04 and SC-SIGN-03 | SC_MEAL_ALLOWANCE_BOUNDARY_READY / NO_GO / BLOCKED is signed with formula version, attendance source and blocked-payment proof | System calculates or pays meal, allowance, teacher, HR or payroll amount before signed boundary |
| SC-OWNER-ACTION-04 | KHTC + Audit | Execute signed invoice/payment verification, voucher, reversal and period-lock review for SC-PAY-EVID-01 through SC-PAY-EVID-06, SC-REV-04, SC-UAT-05 and SC-SIGN-04 | SC_INVOICE_PAYMENT_VERIFICATION_READY / NO_GO / BLOCKED is signed with voucher/reversal/period-lock proof | Invoice/payment is verified, posted, reversed or period-closed without controlled evidence |
| SC-OWNER-ACTION-05 | BGH + IT_DATA + Audit | Execute signed report-view source reconciliation for RV_SHORT_COURSE_ATTENDANCE_PAYMENT, SC-RV-EVID-01 through SC-RV-EVID-06, SC-REV-05, SC-UAT-06 and SC-SIGN-05 | SC_REPORT_VIEW_SOURCE_RECONCILIATION_READY / NO_GO / BLOCKED is signed with source-map, DQ and owner reliance result | Dashboard/report view is used for management or finance reliance before signed owner decision |
| SC-OWNER-ACTION-06 | IT_DATA + Audit + relevant owner lanes | Execute signed role/negative-access UAT for SC-ROLE-EVID-01 through SC-ROLE-EVID-06, SC-REV-06, SC-UAT-07 and SC-SIGN-06 | SC_ROLE_NEGATIVE_ACCESS_READY / NO_GO / BLOCKED is signed with denial proof and scope proof | Out-of-scope user can see private attendance, policy, payment, payroll, voucher or teacher data |
| SC-OWNER-ACTION-07 | Audit + all owner lanes | Complete SC-UAT-LEDGER-01 through SC-UAT-LEDGER-08 and `docs/HEU_SHORT_COURSE_SIGNED_UAT_EVIDENCE_INTAKE_20260704.md` with SC-UAT-EVID-01 through SC-UAT-EVID-08, reviewer, signer lane, controlled evidence ID and result | SC_UAT_RESULT_READY / NO_GO / BLOCKED and SC_SIGNED_UAT_EVIDENCE_READY / NO_GO / BLOCKED are recorded outside Git/Codex/chat | PASS_LOCAL, Codex or AI output is treated as executed UAT or evidence acceptance |
| SC-OWNER-ACTION-08 | BGH + Dao Tao + CTHSSV + HR + KHTC + Phap Che + IT_DATA + Audit | Record final owner GO/NO-GO after SC-SIGN-01 through SC-SIGN-06, UAT ledger rows, role proof, report-view signoff and blockers are resolved | SC_EXTERNAL_OWNER_ACTION_READY / NO_GO / BLOCKED plus SHORT_COURSE_OWNER_READY / NO_GO / BLOCKED are recorded outside Git/Codex/chat | Final owner GO/NO-GO is missing, unsigned, ownerless or inferred from local checks |

## Required Re-Run Sequence

Run only after the owner actions above are completed outside Codex/chat:

```powershell
npm.cmd run check:heu-short-course-external-owner-action-queue
npm.cmd run check:heu-short-course-signed-uat-evidence-intake
npm.cmd run check:heu-training-module-completion-breakdown
npm.cmd run check:heu-short-course-role-negative-access
npm.cmd run audit:heu-short-course-attendance-payment-gap-pack
npm.cmd run audit:heu-role-scope-uat-pack
npm.cmd run audit:heu-controlled-evidence-redaction-pack
npm.cmd run audit:ttgdtx-release-gates
```

Expected state before signed Short Course reliance:

- SC-OWNER-ACTION-01 through SC-OWNER-ACTION-08 have owner result,
  signer/date, controlled evidence ID and blocker state.
- SC-UAT-EVID-01 through SC-UAT-EVID-08 have signed evidence references,
  storage class, owner lane, redaction reviewer and blocker state.
- `SC_EXTERNAL_OWNER_ACTION_READY / NO_GO / BLOCKED` is recorded outside
  Git/Codex/chat.
- `SC_SIGNED_UAT_EVIDENCE_READY / NO_GO / BLOCKED` is recorded outside
  Git/Codex/chat.
- No raw PII, CCCD, phone, email, bank data, vouchers, payroll files, teacher
  payment files, passwords, OTPs, reset links, invite links, service-role keys,
  raw screenshots or raw Drive URLs enter Git/Codex/chat.

## Short Course Stop Rule

Keep Short Course at NO-GO for real operation if any of these is true:

- Signed attendance lock and exception-route UAT is missing.
- Signed BHXH/chinh sach owner/legal decision is missing.
- Signed meal/allowance and HR payment boundary decision is missing.
- Signed invoice/payment verification, reversal or period-lock decision is
  missing.
- Signed report-view source reconciliation or owner reliance decision is
  missing.
- Signed role/negative-access UAT is missing.
- Controlled evidence refs are missing, raw, uncontrolled or ownerless.
- UAT result ledger rows are incomplete, unsigned, NO_GO or BLOCKED.
- Signed evidence intake rows are incomplete, unsigned, NO_GO or BLOCKED.
- Final owner GO/NO-GO is missing, unsigned or stored only in Git/Codex/chat.

This queue is intentionally stricter than local packaging. It protects Short
Course attendance, policy, payment, report-view, role, evidence, UAT and final
owner boundaries and does not approve signed UAT, evidence acceptance, finance
reliance, access closure, owner GO/NO-GO or production GO.
