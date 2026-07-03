# HEU Short Course Attendance Lock Evidence Checklist 2026-07-03

Status: DRAFT_CONTROL
Production status: NO-GO
Decision values: SC_ATTENDANCE_LOCK_EVIDENCE_READY / NO_GO / BLOCKED

## 1. Purpose

This checklist prepares the TRN-03 attendance lock and exception-route evidence
packet for Short Course / Day Nghe signed UAT. It is local control packaging
only. It does not lock attendance, approve attendance, alter attendance, accept
evidence, execute UAT, approve payment, approve owner GO/NO-GO or mark
production GO.

The checklist connects SC-AP-02, SC-AP-03, SC-REV-01, SC-UAT-01 and SC-UAT-02
to controlled external evidence references before any downstream BHXH,
meal/allowance, invoice/payment or dashboard reliance.

## 2. Required Evidence Rows

| Evidence ID | Control link | Required proof | Owner | Stop condition |
|---|---|---|---|---|
| SC-LOCK-EVID-01 | SC-AP-02 | Class code/name, session date, teacher/class owner and active Short Course segment label | Dao Tao | Class/session is missing, cross-scope or ownerless |
| SC-LOCK-EVID-02 | SC-AP-02/03 | Attendance lock state, locked/approved count and lock timestamp | Dao Tao + Audit | Attendance can still be edited or lock state is unclear |
| SC-LOCK-EVID-03 | SC-AP-03 | Signer/reviewer label, reviewer role and review timestamp | Dao Tao + Audit | Signer is missing, unsigned or stored only in Codex/chat |
| SC-LOCK-EVID-04 | SC-REV-01 | Exception route, correction rule, exception owner and audit trace reference | IT_DATA + Audit | Attendance correction can bypass trace or owner review |
| SC-LOCK-EVID-05 | SC-UAT-01/02 | Controlled UAT evidence reference for attendance readiness and attendance evidence trace | Dao Tao + Audit | Screenshot/ref is uncontrolled, raw-sensitive or missing |
| SC-LOCK-EVID-06 | SC-SIGN-01 | Owner decision state for attendance lock packet before finance reliance | Dao Tao | Payment, meal/allowance, BHXH or report reliance starts before owner signoff |

## 3. Completion Rule

`SC_ATTENDANCE_LOCK_EVIDENCE_READY` is allowed only when every
SC-LOCK-EVID-01 through SC-LOCK-EVID-06 row has an external controlled evidence
reference, owner/reviewer label, decision state and stop-condition result
outside Git/Codex/chat.

Any missing, unsigned, uncontrolled, `NO_GO` or `BLOCKED` row keeps TRN-03 and
Short Course production locked.

## 4. Forbidden Content

Do not store raw attendance sheets, student phone numbers, CCCD, bank data,
teacher payment files, payroll files, vouchers, private contracts, unredacted
screenshots, raw Drive URLs, passwords, OTPs, reset/invite links, API keys or
service-role keys in this Git file, Codex or chat.

## 5. Local Verification

- `docs/HEU_SHORT_COURSE_ATTENDANCE_LOCK_EVIDENCE_CHECKLIST_20260703.md`
- `docs/HEU_SHORT_COURSE_ATTENDANCE_PAYMENT_GAP_PACK_20260628_V01_DRAFT.md`
- `components/short-course/short-course-attendance-payment-gap-pack.tsx`
- `scripts/audit-heu-short-course-attendance-payment-gap-pack.mjs`
- `npm.cmd run audit:heu-short-course-attendance-payment-gap-pack`

Passing the local audit proves only that the attendance-lock evidence checklist
and boundary are present. It does not prove that any attendance lock, UAT case,
evidence package or owner decision has been executed or accepted.

Boundary token: does not lock attendance, approve attendance, alter attendance, accept evidence, execute UAT, approve payment, approve owner GO/NO-GO or mark production GO.
