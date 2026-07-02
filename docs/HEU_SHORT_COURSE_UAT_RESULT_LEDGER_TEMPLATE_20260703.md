# HEU Short Course UAT Result Ledger Template 2026-07-03

Status: DRAFT_CONTROL
Production status: NO-GO
Decision values: SC_UAT_RESULT_READY / NO_GO / BLOCKED

## 1. Purpose

This ledger records the expected result rows for Short Course / Day Nghe signed
UAT. It connects SC-UAT cases to review handoff rows, owner signoff rows and
controlled evidence references. It is a template only. It does not execute UAT,
accept evidence, approve attendance lock, approve payment, approve owner
GO/NO-GO or mark production GO.

## 2. Result Ledger Rows

| Ledger ID | UAT case | Review link | Owner signoff link | Required evidence reference | Allowed result | Stop condition |
|---|---|---|---|---|---|---|
| SC-UAT-LEDGER-01 | SC-UAT-01 attendance readiness view | SC-REV-01 | SC-SIGN-01 | Controlled attendance readiness screenshot/ref plus route/user label | SC_UAT_RESULT_READY / NO_GO / BLOCKED | Attendance is shown as final for payment |
| SC-UAT-LEDGER-02 | SC-UAT-02 attendance evidence trace | SC-REV-01 | SC-SIGN-01 | Locked attendance signer, timestamp and exception route ref | SC_UAT_RESULT_READY / NO_GO / BLOCKED | Attendance can be changed without trace |
| SC-UAT-LEDGER-03 | SC-UAT-03 BHXH/chinh sach decision | SC-REV-02 | SC-SIGN-02 | Policy/legal basis, eligibility and evidence-class ref | SC_UAT_RESULT_READY / NO_GO / BLOCKED | Policy decision bypasses legal/owner review |
| SC-UAT-LEDGER-04 | SC-UAT-04 meal/allowance design | SC-REV-03 | SC-SIGN-03 | Formula version, attendance source and blocked-payment proof | SC_UAT_RESULT_READY / NO_GO / BLOCKED | System calculates or pays before policy signoff |
| SC-UAT-LEDGER-05 | SC-UAT-05 invoice/payment drilldown | SC-REV-04 | SC-SIGN-04 | Invoice/payment source match, voucher ref and reversal/lock rule | SC_UAT_RESULT_READY / NO_GO / BLOCKED | Payment is verified without voucher or source reconciliation |
| SC-UAT-LEDGER-06 | SC-UAT-06 report-view reliance | SC-REV-05 | SC-SIGN-05 | `RV_SHORT_COURSE_ATTENDANCE_PAYMENT` DQ/source/signoff ref | SC_UAT_RESULT_READY / NO_GO / BLOCKED | Dashboard is relied on before signed report-view owner decision |
| SC-UAT-LEDGER-07 | SC-UAT-07 out-of-scope access | SC-REV-06 | SC-SIGN-06 | Negative route/user evidence ref with scoped/non-sensitive result | SC_UAT_RESULT_READY / NO_GO / BLOCKED | Out-of-scope staff see private payment or policy detail |
| SC-UAT-LEDGER-08 | SC-UAT-08 final audit trace | SC-REV-06 | SC-SIGN-06 | Actor, owner, evidence ref, reviewer and decision trace row | SC_UAT_RESULT_READY / NO_GO / BLOCKED | PASS_LOCAL, Codex or AI output is treated as owner approval |

## 3. Completion Rule

The ledger is complete only when every row has a controlled evidence reference,
reviewer, owner signoff link and result outside Codex/chat. Any missing,
unsigned, uncontrolled, `NO_GO` or `BLOCKED` row keeps Short Course production
locked.

## 4. Forbidden Content

Do not store passwords, OTPs, reset or invite links, service-role keys, raw PII,
CCCD, phone lists, bank data, vouchers, payroll files, teacher payment files,
private contracts, unredacted screenshots or raw Drive URLs in this Git file,
Codex or chat.

## 5. Local Verification

- `docs/HEU_SHORT_COURSE_UAT_RESULT_LEDGER_TEMPLATE_20260703.md`
- `docs/HEU_SHORT_COURSE_ATTENDANCE_PAYMENT_GAP_PACK_20260628_V01_DRAFT.md`
- `docs/HEU_SHORT_COURSE_OWNER_SIGNOFF_MANIFEST_20260702.md`
- `components/short-course/short-course-attendance-payment-gap-pack.tsx`
- `scripts/audit-heu-short-course-attendance-payment-gap-pack.mjs`
- `npm.cmd run audit:heu-short-course-attendance-payment-gap-pack`

Passing the local audit proves only that this result-ledger template and
boundary are present. It does not prove that any UAT case has been executed or
accepted.
