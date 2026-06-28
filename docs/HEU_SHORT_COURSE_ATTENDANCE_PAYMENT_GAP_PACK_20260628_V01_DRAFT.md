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
- `npm.cmd run audit:heu-short-course-attendance-payment-gap-pack`

Passing this audit means only that the Short Course gap-pack structure exists
locally and the production boundary is visible. Short Course remains `CAN_SUA`
until signed attendance/payment UAT, policy signoff, source reconciliation,
period-lock/reversal proof, audit evidence and owner decision evidence are
completed outside Codex/chat.
