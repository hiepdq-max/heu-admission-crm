# HEU Short Course Meal Allowance Payment Boundary Checklist 2026-07-03

Status: DRAFT_CONTROL
Production status: NO-GO
Decision values: SC_MEAL_ALLOWANCE_BOUNDARY_READY / NO_GO / BLOCKED

## 1. Purpose

This checklist prepares the TRN-05 meal/allowance and HR payment boundary
packet for Short Course / Day Nghe signed UAT. It is local control packaging
only. It does not calculate allowance, approve meal/allowance, approve HR
payment, approve teacher payment, create payroll effect, accept evidence,
execute UAT, approve owner GO/NO-GO or mark production GO.

The checklist connects SC-AP-05, SC-REV-03, SC-UAT-04 and SC-SIGN-03 to
controlled external evidence references before any downstream invoice/payment,
period lock, statutory accounting, payroll or dashboard reliance.

## 2. Required Evidence Rows

| Evidence ID | Control link | Required proof | Owner | Stop condition |
|---|---|---|---|---|
| SC-MEAL-EVID-01 | SC-AP-05 | Formula version, formula owner and effective-date boundary | HR + KHTC | Formula is oral, ambiguous, unsigned or lacks effective-date boundary |
| SC-MEAL-EVID-02 | SC-AP-05 | Attendance source reference tied to locked attendance packet and active Short Course segment label | Dao Tao + Audit | Attendance source is unlocked, cross-scope, unsigned or not tied to TRN-03 |
| SC-MEAL-EVID-03 | SC-AP-04/05 | Policy dependency reference showing BHXH/chinh sach decision state from TRN-04 before any formula reliance | CTHSSV + Phap Che + HR | Formula relies on policy effect before signed policy decision |
| SC-MEAL-EVID-04 | SC-REV-03 | Exception handling rule for absent/late/waived/adjusted attendance and manual owner route | HR + KHTC + Audit | Exception can bypass owner review or audit trace |
| SC-MEAL-EVID-05 | SC-UAT-04 | Controlled UAT evidence reference proving the route stays design-only and blocked from payment execution | HR + KHTC | System calculates, approves or pays allowance/HR/teacher amount automatically |
| SC-MEAL-EVID-06 | SC-SIGN-03 | Owner signer label, role, decision timestamp and blocked-payment proof before finance reliance | HR + KHTC | Payment, payroll, invoice/payment verification or report reliance starts before owner signoff |

## 3. Completion Rule

`SC_MEAL_ALLOWANCE_BOUNDARY_READY` is allowed only when every SC-MEAL-EVID-01
through SC-MEAL-EVID-06 row has an external controlled evidence reference,
owner/reviewer label, decision state and stop-condition result outside
Git/Codex/chat.

Any missing, unsigned, uncontrolled, `NO_GO` or `BLOCKED` row keeps TRN-05 and
Short Course production locked.

## 4. Forbidden Content

Do not store raw attendance sheets, teacher names linked to pay, student names,
phone numbers, CCCD, bank data, payroll files, salary/allowance spreadsheets,
vouchers, private contracts, unredacted screenshots, raw Drive URLs,
passwords, OTPs, reset/invite links, API keys or service-role keys in this Git
file, Codex or chat.

## 5. Local Verification

- `docs/HEU_SHORT_COURSE_MEAL_ALLOWANCE_PAYMENT_BOUNDARY_CHECKLIST_20260703.md`
- `docs/HEU_SHORT_COURSE_ATTENDANCE_PAYMENT_GAP_PACK_20260628_V01_DRAFT.md`
- `components/short-course/short-course-attendance-payment-gap-pack.tsx`
- `scripts/audit-heu-short-course-attendance-payment-gap-pack.mjs`
- `npm.cmd run audit:heu-short-course-attendance-payment-gap-pack`

Passing the local audit proves only that the meal/allowance and HR payment
boundary checklist is present. It does not prove that any formula, UAT case,
payment packet, payroll packet or owner decision has been executed or accepted.

Boundary token: does not calculate allowance, approve meal/allowance, approve HR payment, approve teacher payment, create payroll effect, accept evidence, execute UAT, approve owner GO/NO-GO or mark production GO.
