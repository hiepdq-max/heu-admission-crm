# HEU Short Course Invoice Payment Verification Checklist 2026-07-03

Status: DRAFT_CONTROL
Production status: NO-GO
Decision values: SC_INVOICE_PAYMENT_VERIFICATION_READY / NO_GO / BLOCKED

## 1. Purpose

This checklist prepares the TRN-06 invoice/payment verification packet for
Short Course / Day Nghe signed UAT. It is local control packaging only. It does
not verify invoice/payment, post voucher, approve payment, approve reversal,
close period, create statutory accounting effect, accept evidence, execute UAT,
approve owner GO/NO-GO or mark production GO.

The checklist connects SC-AP-06, SC-REV-04, SC-UAT-05 and SC-SIGN-04 to
controlled external evidence references before any verified-payment state,
period close, statutory accounting, dashboard reliance or owner closure.

## 2. Required Evidence Rows

| Evidence ID | Control link | Required proof | Owner | Stop condition |
|---|---|---|---|---|
| SC-PAY-EVID-01 | SC-AP-06 | Invoice identifier, Short Course segment label, class/enrollment linkage and redaction class without raw PII in Git | KHTC + IT_DATA | Invoice is missing, cross-scope, duplicated or stored only in uncontrolled proof |
| SC-PAY-EVID-02 | SC-AP-06 | Payment status source, amount match state, payment date boundary and controlled voucher reference | KHTC | Payment is marked verified without source match, voucher reference or date boundary |
| SC-PAY-EVID-03 | SC-REV-04 | Reversal/refund/adjustment rule with owner route and audit trace for mismatch cases | KHTC + Audit | Mismatch can be fixed manually without reversal rule, owner route or audit trail |
| SC-PAY-EVID-04 | SC-REV-04 | Period-lock rule proving verified payment cannot close or affect statutory accounting before owner signoff | KHTC + Phap Che + Audit | Period close, statutory accounting or report reliance starts before signed evidence |
| SC-PAY-EVID-05 | SC-UAT-05 | Controlled UAT evidence reference proving invoice/payment drilldown stays verification-gated and blocked from finance reliance | KHTC + Audit | UAT evidence is missing, uncontrolled or shows payment verified without voucher/reversal proof |
| SC-PAY-EVID-06 | SC-SIGN-04 | Owner signer label, role, decision timestamp and blocked-verification proof before finance/report reliance | KHTC | Verified payment, period close, statutory accounting or dashboard reliance starts before owner signoff |

## 3. Completion Rule

`SC_INVOICE_PAYMENT_VERIFICATION_READY` is allowed only when every
SC-PAY-EVID-01 through SC-PAY-EVID-06 row has an external controlled evidence
reference, owner/reviewer label, decision state and stop-condition result
outside Git/Codex/chat.

Any missing, unsigned, uncontrolled, `NO_GO` or `BLOCKED` row keeps TRN-06 and
Short Course production locked.

## 4. Forbidden Content

Do not store raw invoices, vouchers, payment screenshots, bank statements, bank
accounts, teacher names linked to pay, student names, phone numbers, CCCD,
payroll files, salary/allowance spreadsheets, private contracts, unredacted
screenshots, raw Drive URLs, passwords, OTPs, reset/invite links, API keys or
service-role keys in this Git file, Codex or chat.

## 5. Local Verification

- `docs/HEU_SHORT_COURSE_INVOICE_PAYMENT_VERIFICATION_CHECKLIST_20260703.md`
- `docs/HEU_SHORT_COURSE_ATTENDANCE_PAYMENT_GAP_PACK_20260628_V01_DRAFT.md`
- `components/short-course/short-course-attendance-payment-gap-pack.tsx`
- `scripts/audit-heu-short-course-attendance-payment-gap-pack.mjs`
- `npm.cmd run audit:heu-short-course-attendance-payment-gap-pack`

Passing the local audit proves only that the invoice/payment verification
checklist is present. It does not prove that any invoice, voucher, payment,
reversal, period lock, UAT case or owner decision has been executed or accepted.

Boundary token: does not verify invoice/payment, post voucher, approve payment, approve reversal, close period, create statutory accounting effect, accept evidence, execute UAT, approve owner GO/NO-GO or mark production GO.
