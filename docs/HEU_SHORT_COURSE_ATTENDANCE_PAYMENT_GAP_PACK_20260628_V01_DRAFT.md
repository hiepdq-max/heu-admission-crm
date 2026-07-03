# HEU Short Course Attendance Payment Gap Pack 2026-06-28 V01 Draft

Status: DRAFT_CONTROL
Production status: NO-GO
Owner: Dao Tao + CTHSSV + KHTC + HR + Phap Che + IT_DATA + Audit

## 1. Purpose

This pack controls the Short Course / Day Nghe attendance, BHXH/chinh sach,
meal/allowance, invoice and payment gap before any payroll, period close,
payment automation or dashboard reliance. It is a local design and UAT-control
package only. It does not approve attendance lock, BHXH decision,
meal/allowance payment, HR payment, invoice/payment verification, statutory
accounting, period close, UAT acceptance, evidence acceptance, owner GO or
production GO.

The short-course flow must remain separate from TTGDTX, HOU and generic
admission payments. Attendance can support finance only after signed UAT,
source reconciliation, exception handling and owner signoff exist.

## 2. Controlled Short Course Object Chain

| Layer | Required object | Current source clue | Stop condition |
|---|---|---|---|
| Student/class | Student master, class master, enrollment assignment | `short_student_master`, `short_class_master`, `short_enrollments` | Missing identity or class assignment keeps finance NO_GO |
| Attendance | Session, attendance record, lock/approval state | `short_attendance_sessions`, attendance dashboard counts | No allowance/payment reliance without lock and signer |
| Policy/BHXH | Policy case, eligibility, evidence and legal basis | `short_bhxh_policy_cases` | No policy effect without owner/legal decision |
| Meal/allowance | Attendance-based meal, teacher or HR payment basis | Attendance and finance primitives | No payment formula until policy and UAT are signed |
| Invoice/payment | Invoice, payment, voucher, reversal and balance | `short_finance_invoices`, `short_payments` | No verified payment or close without evidence |
| Report view | `RV_SHORT_COURSE_ATTENDANCE_PAYMENT` | Report View Source Map | No dashboard reliance without DQ and owner signoff |
| Audit/signoff | Audit row, evidence ref, signer, exception route | P0 register, P6 audit controls | PASS_LOCAL cannot replace owner decision |

## 3. Attendance/Payment Control Gates

| Code | Gate | Required proof | Owner |
|---|---|---|---|
| SC-AP-01 | Enrollment basis | Student, class, enrollment status and evidence are complete | CTHSSV + Dao Tao |
| SC-AP-02 | Attendance session | Session date, teacher/class owner and attendance lock state are known | Dao Tao |
| SC-AP-03 | Attendance approval | Locked/approved attendance has signer, timestamp and exception route | Dao Tao + Audit |
| SC-AP-04 | BHXH/chinh sach | Policy case status, eligibility and evidence decision are signed | CTHSSV + Phap Che |
| SC-AP-05 | Meal/allowance basis | Attendance-based meal/allowance basis is reconciled before payment | Dao Tao + HR/KHTC |
| SC-AP-06 | Invoice/payment | Invoice, payment status, voucher evidence and reversal rule are present | KHTC |
| SC-AP-07 | Report view signoff | `RV_SHORT_COURSE_ATTENDANCE_PAYMENT` has DQ, owner signoff and UAT evidence | BGH + Audit |
| SC-AP-08 | Production stop rule | No payroll, allowance, payment-period close or dashboard reliance before signed UAT | IT_DATA + Audit |

Decision values: `SC_ATTENDANCE_PAYMENT_READY / NO_GO / BLOCKED`.

## 4. Current Gap Matrix

| Area | Current evidence | Gap | Safe next work |
|---|---|---|---|
| Attendance | Dashboard summarizes attendance sessions and locked/approved counts | Signed attendance UAT and exception evidence are pending | Add attendance UAT cases and evidence slots |
| BHXH/chinh sach | Policy cases and readiness counts exist | Legal/owner decision and evidence class are not signed | Draft BHXH/chinh sach UAT evidence checklist |
| Meal/allowance | Attendance can later support allowance/payroll logic | Meal, teacher and HR payment formula is not approved | Keep as design-only mapping until policy signoff |
| Invoice/payment | Invoices, payments and verified amount are summarized | Payment verification, reversal and period lock UAT are still blockers | Add finance UAT and reversal/lock proof slots |
| Report view | `RV_SHORT_COURSE_ATTENDANCE_PAYMENT` is registered | Source reconciliation and owner signoff are pending | Tie report view to DQ and signoff capture |
| Audit | Risk alerts and generic audit controls exist | Short-course attendance/payment decision trace is not proven | Require signed audit-log samples in UAT |

## 5. First UAT Cases To Execute Outside Codex

| UAT ID | Role | Route | Expected result | Stop condition |
|---|---|---|---|---|
| SC-UAT-01 | Dao Tao | `/short-course` and drilldown | Sees attendance readiness and blockers without approving finance | Screen implies attendance is final for payment |
| SC-UAT-02 | Dao Tao + Audit | Attendance evidence | Locked/approved attendance has signer and exception route | Attendance can be changed without trace |
| SC-UAT-03 | CTHSSV/Phap Che | BHXH/chinh sach route | Policy case decision is scoped and evidence-backed | Policy decision bypasses legal/owner review |
| SC-UAT-04 | HR/KHTC | Meal/allowance design | Payment formula remains blocked until policy signoff | System can calculate/pay allowance automatically |
| SC-UAT-05 | KHTC | Invoice/payment drilldown | Payment verification requires voucher and reversal rule | Payment is marked verified without evidence |
| SC-UAT-06 | BGH/Audit | `/reports` and `/short-course` | `RV_SHORT_COURSE_ATTENDANCE_PAYMENT` stays signoff-blocked | Dashboard can be relied on before signed UAT |
| SC-UAT-07 | Out-of-scope staff | `/short-course` | User sees only scoped/non-sensitive summary | User sees private payment or policy detail |
| SC-UAT-08 | IT_DATA/Audit | Audit sample | Actor, owner, evidence ref and decision are traceable | PASS_LOCAL or AI output is treated as owner approval |

## 6. Forbidden Actions

Codex, AI or a local PASS_LOCAL guard must not:

- Lock, approve or alter attendance for production reliance.
- Approve BHXH/chinh sach decisions.
- Calculate, approve or pay meal, allowance, teacher, HR or payroll amounts.
- Verify payment, close a period, post statutory accounting or mark revenue.
- Import raw student, phone, CCCD, voucher, bank, payroll or payment data into
  Git, Codex or chat.
- Treat `RV_SHORT_COURSE_ATTENDANCE_PAYMENT` as a production dashboard source.
- Mark UAT, owner signoff or production GO as complete.

## 7. Local Evidence

- `components/short-course/short-course-attendance-payment-gap-pack.tsx`
- `/short-course`
- `docs/HEU_SHORT_COURSE_ATTENDANCE_PAYMENT_GAP_PACK_20260628_V01_DRAFT.md`
- `docs/HEU_SHORT_COURSE_ATTENDANCE_LOCK_EVIDENCE_CHECKLIST_20260703.md`
- `docs/HEU_SHORT_COURSE_BHXH_POLICY_DECISION_CHECKLIST_20260703.md`
- `docs/HEU_SHORT_COURSE_MEAL_ALLOWANCE_PAYMENT_BOUNDARY_CHECKLIST_20260703.md`
- `docs/HEU_SHORT_COURSE_INVOICE_PAYMENT_VERIFICATION_CHECKLIST_20260703.md`
- `docs/HEU_SHORT_COURSE_REPORT_VIEW_SOURCE_RECONCILIATION_CHECKLIST_20260703.md`
- `docs/HEU_SHORT_COURSE_ROLE_NEGATIVE_ACCESS_CHECKLIST_20260703.md`
- `docs/HEU_SHORT_COURSE_PAYMENT_MAIL_DRIVE_INTAKE_SAMPLE_20260701.md`
- `npm.cmd run audit:heu-short-course-attendance-payment-gap-pack`

Passing this audit means only that the Short Course gap-pack structure exists
locally and the production boundary is visible. Short Course remains `CAN_SUA`
until signed attendance/payment UAT, policy signoff, source reconciliation,
period-lock/reversal proof, audit evidence and owner decision evidence are
completed outside Codex/chat.

## 8. Review Handoff Queue

The in-app review handoff panel uses `SC_REVIEW_READY / NO_GO / BLOCKED` only
as a preparation status. It does not replace signed owner decisions, UAT
acceptance or evidence acceptance outside Codex/chat.

| Review ID | Owner | Review point | Required proof | Stop condition |
|---|---|---|---|---|
| SC-REV-01 | Dao Tao | Attendance lock packet | Class list, session dates, locked attendance count, signer and exception route | Attendance can still be edited, signer is missing or exception route is unclear |
| SC-REV-02 | CTHSSV + Phap Che | BHXH/chinh sach decision | Policy basis, eligibility decision, evidence class and owner/legal signer | Policy decision is oral, unsigned or not tied to controlled evidence |
| SC-REV-03 | HR + KHTC | Meal/allowance formula | Formula version, attendance source, exception handling and payment boundary | System can calculate or pay before policy signoff and signed UAT |
| SC-REV-04 | KHTC | Invoice/payment reconciliation | Invoice/payment source match, voucher reference, reversal rule and period-lock rule | Payment is marked verified without voucher, reversal or source reconciliation |
| SC-REV-05 | BGH + Audit | Report view reliance | `RV_SHORT_COURSE_ATTENDANCE_PAYMENT` DQ result, source map and owner signoff route | Dashboard is used for reliance before report-view owner signoff |
| SC-REV-06 | IT_DATA + Audit | Final UAT trace | `SC-UAT-01` through `SC-UAT-08` result, actor, evidence ref and reviewer decision | PASS_LOCAL, Codex or AI output is treated as UAT acceptance or owner GO |

## 8.1 Attendance Lock Evidence Checklist

Attendance lock evidence is prepared through
`docs/HEU_SHORT_COURSE_ATTENDANCE_LOCK_EVIDENCE_CHECKLIST_20260703.md` with
`SC_ATTENDANCE_LOCK_EVIDENCE_READY / NO_GO / BLOCKED` and SC-LOCK-EVID-01
through SC-LOCK-EVID-06. The checklist connects SC-AP-02, SC-AP-03,
SC-REV-01, SC-UAT-01 and SC-UAT-02 to external controlled evidence references
for class/session scope, lock state, signer, exception route, UAT evidence and
SC-SIGN-01 owner decision.

Passing the local audit does not lock attendance, approve attendance, alter
attendance, accept evidence, execute UAT, approve payment, approve owner
GO/NO-GO or mark production GO.

## 8.2 BHXH/Chinh Sach Decision Checklist

BHXH/chinh sach decision evidence is prepared through
`docs/HEU_SHORT_COURSE_BHXH_POLICY_DECISION_CHECKLIST_20260703.md` with
`SC_BHXH_POLICY_DECISION_READY / NO_GO / BLOCKED` and SC-BHXH-EVID-01
through SC-BHXH-EVID-06. The checklist connects SC-AP-04, SC-REV-02,
SC-UAT-03 and SC-SIGN-02 to external controlled evidence references for
policy case scope, eligibility basis, legal/SOP review, owner/legal decision
and downstream payment/report blocks.

Passing the local audit does not approve BHXH/chinh sach, decide eligibility,
create policy effect, accept evidence, execute UAT, approve payment, approve
owner GO/NO-GO or mark production GO.

## 8.3 Meal/Allowance HR Payment Boundary Checklist

Meal/allowance and HR payment boundary evidence is prepared through
`docs/HEU_SHORT_COURSE_MEAL_ALLOWANCE_PAYMENT_BOUNDARY_CHECKLIST_20260703.md`
with `SC_MEAL_ALLOWANCE_BOUNDARY_READY / NO_GO / BLOCKED` and SC-MEAL-EVID-01
through SC-MEAL-EVID-06. The checklist connects SC-AP-05, SC-REV-03,
SC-UAT-04 and SC-SIGN-03 to external controlled evidence references for formula
version, locked attendance source, TRN-04 policy dependency, exception handling,
design-only UAT proof and blocked-payment owner decision.

Passing the local audit does not calculate allowance, approve meal/allowance,
approve HR payment, approve teacher payment, create payroll effect, accept
evidence, execute UAT, approve owner GO/NO-GO or mark production GO.

## 8.4 Invoice/Payment Verification Checklist

Invoice/payment verification evidence is prepared through
`docs/HEU_SHORT_COURSE_INVOICE_PAYMENT_VERIFICATION_CHECKLIST_20260703.md`
with `SC_INVOICE_PAYMENT_VERIFICATION_READY / NO_GO / BLOCKED` and
SC-PAY-EVID-01 through SC-PAY-EVID-06. The checklist connects SC-AP-06,
SC-REV-04, SC-UAT-05 and SC-SIGN-04 to external controlled evidence references
for invoice source scope, payment/voucher match, reversal rule, period-lock
rule, verification-gated UAT proof and blocked-verification owner decision.

Passing the local audit does not verify invoice/payment, post voucher, approve
payment, approve reversal, close period, create statutory accounting effect,
accept evidence, execute UAT, approve owner GO/NO-GO or mark production GO.

## 8.5 Report-View Source Reconciliation Checklist

Report-view source reconciliation evidence is prepared through
`docs/HEU_SHORT_COURSE_REPORT_VIEW_SOURCE_RECONCILIATION_CHECKLIST_20260703.md`
with `SC_REPORT_VIEW_SOURCE_RECONCILIATION_READY / NO_GO / BLOCKED` and
SC-RV-EVID-01 through SC-RV-EVID-06. The checklist connects SC-AP-07,
SC-REV-05, SC-UAT-06, SC-SIGN-05, DQ-RV-06 and RV-EVID-05 to external
controlled evidence references for the `RV_SHORT_COURSE_ATTENDANCE_PAYMENT`
source-map row, allowed consumers, class/student/attendance/invoice/payment DQ,
upstream TRN-03 through TRN-06 blockers, signoff-blocked UAT proof and
report-view owner decision.

Passing the local audit does not approve report-view reliance, approve
dashboard reliance, accept DQ evidence, accept source reconciliation, execute
UAT, accept evidence, approve owner GO/NO-GO or mark production GO.

## 8.6 Role Scope And Negative-Access Checklist

Role scope and negative-access evidence is prepared through
`docs/HEU_SHORT_COURSE_ROLE_NEGATIVE_ACCESS_CHECKLIST_20260703.md` with
`SC_ROLE_NEGATIVE_ACCESS_READY / NO_GO / BLOCKED` and SC-ROLE-EVID-01 through
SC-ROLE-EVID-06. The checklist connects SHORT-SCOPE-APP-GUARD,
SHORT-SCOPE-WORKFLOWS, SHORT-SCOPE-ACTOR-LINK,
NEGATIVE_CONTROL_QUEUE_READY / NO_GO / BLOCKED, P6_04_ACCESS_READY / NO_GO / BLOCKED, SC-UAT-07, SC-REV-06 and SC-SIGN-06 to external controlled evidence
references for route guards, workflow scope, actor links, negative-account
denial, role-scope UAT alignment and P0-17 access closure handoff.

Passing the local audit does not create accounts, assign real users, grant access, broaden scope, accept negative-control proof, accept role UAT, accept evidence, approve access closure, approve owner GO/NO-GO or mark production GO.

## 9. Owner Signoff Manifest

Owner signoff is prepared through
`docs/HEU_SHORT_COURSE_OWNER_SIGNOFF_MANIFEST_20260702.md` with
`SHORT_COURSE_OWNER_READY / NO_GO / BLOCKED` and `SC-SIGN-01` through
`SC-SIGN-06`. The manifest is a preparation template only; it does not prove
owner approval until signatures and controlled evidence references exist
outside Codex/chat.

## 10. External Owner Action Queue

External owner actions are prepared through
`docs/HEU_SHORT_COURSE_EXTERNAL_OWNER_ACTION_QUEUE_20260703.md` with
`SC_EXTERNAL_OWNER_ACTION_READY / NO_GO / BLOCKED` and SC-OWNER-ACTION-01
through SC-OWNER-ACTION-08. The queue assigns attendance lock, BHXH/chinh sach,
meal/allowance, invoice/payment, report-view, role/negative-access, UAT ledger
and final owner GO/NO-GO blockers to owner lanes.

Owner action token: SC-OWNER-ACTION-01 through SC-OWNER-ACTION-08.

Passing the local queue check does not execute UAT, accept evidence, approve
finance reliance, approve access closure, approve owner GO/NO-GO or mark
production GO.

## 11. UAT Result Ledger Template

UAT results are prepared through
`docs/HEU_SHORT_COURSE_UAT_RESULT_LEDGER_TEMPLATE_20260703.md` with
`SC_UAT_RESULT_READY / NO_GO / BLOCKED` and `SC-UAT-LEDGER-01` through
`SC-UAT-LEDGER-08`. The ledger maps each UAT case back to review handoff rows
and owner signoff rows, with controlled evidence references outside
Codex/chat. It does not execute UAT, accept evidence or approve owner
GO/NO-GO.

## 12. Mail/Drive Payment Intake Sample

The sample file
`docs/HEU_SHORT_COURSE_PAYMENT_MAIL_DRIVE_INTAKE_SAMPLE_20260701.md` records a
Git-safe Gmail/Drive-share intake pattern for the folder title "Thanh toan GV
lop ngan han". It keeps only metadata, controlled folder reference and product
design fields in Git. Raw Drive URLs, teacher/payment files, vouchers, bank
data, payroll data and personal data must stay outside Git/Codex/chat in the
approved controlled evidence location.

This sample can guide the Short Course payment intake queue and Finance
Desk/Short Course evidence handoff. It does not approve teacher payment,
invoice/payment verification, evidence acceptance, UAT acceptance, owner GO or
production GO.
