# HEU Short Course Report View Source Reconciliation Checklist 2026-07-03

Status: DRAFT_CONTROL
Production status: NO-GO
Decision values: SC_REPORT_VIEW_SOURCE_RECONCILIATION_READY / NO_GO / BLOCKED

## 1. Purpose

This checklist prepares the TRN-07 report-view source reconciliation packet for
Short Course / Day Nghe signed UAT. It is local control packaging only. It does
not approve report-view reliance, approve dashboard reliance, accept DQ
evidence, accept source reconciliation, execute UAT, accept evidence, approve
owner GO/NO-GO or mark production GO.

The checklist connects SC-AP-07, SC-REV-05, SC-UAT-06 and SC-SIGN-05 to
controlled external evidence references before any BGH/Audit reliance on
`RV_SHORT_COURSE_ATTENDANCE_PAYMENT`, dashboard KPI use or owner closure.

## 2. Required Evidence Rows

| Evidence ID | Control link | Required proof | Owner | Stop condition |
|---|---|---|---|---|
| SC-RV-EVID-01 | SC-AP-07 | `RV_SHORT_COURSE_ATTENDANCE_PAYMENT` source-map row, controlled source list and allowed consumer list | IT_DATA + Audit | Report view has missing source, hidden source or unlisted dashboard consumer |
| SC-RV-EVID-02 | DQ-RV-06 | Class, student, attendance, invoice and payment linkage DQ result with controlled evidence reference | DAO_TAO + KHTC + Audit | Dashboard relies on payment period before attendance/payment linkage proof |
| SC-RV-EVID-03 | SC-REV-05 | Source reconciliation result tying attendance lock, BHXH policy, meal/allowance and invoice/payment checklist states to the report view | BGH + Audit | Source reconciliation omits upstream TRN-03 through TRN-06 blockers |
| SC-RV-EVID-04 | SC-UAT-06 | Controlled UAT evidence reference proving `/reports` and `/short-course` keep `RV_SHORT_COURSE_ATTENDANCE_PAYMENT` signoff-blocked | BGH + Audit | Dashboard can be relied on before signed UAT and report-view owner decision |
| SC-RV-EVID-05 | SC-SIGN-05 | Owner signer label, role, decision timestamp and report-view reliance decision state | BGH + Audit | Signer is missing, unsigned, delegated without authority or stored only in Codex/chat |
| SC-RV-EVID-06 | RV-EVID-05 | Evidence attachment queue reference proving report-view source reconciliation remains outside Git/Codex/chat when sensitive | IT_DATA + Audit | Raw attendance, payment, voucher, bank, personal or Drive evidence is stored in Git/Codex/chat |

## 3. Completion Rule

`SC_REPORT_VIEW_SOURCE_RECONCILIATION_READY` is allowed only when every
SC-RV-EVID-01 through SC-RV-EVID-06 row has an external controlled evidence
reference, owner/reviewer label, decision state and stop-condition result
outside Git/Codex/chat.

Any missing, unsigned, uncontrolled, `NO_GO` or `BLOCKED` row keeps TRN-07 and
Short Course report-view reliance locked.

## 4. Forbidden Content

Do not store raw attendance sheets, payment screenshots, vouchers, bank
statements, bank accounts, teacher names linked to pay, student names, phone
numbers, CCCD, payroll files, salary/allowance spreadsheets, private contracts,
unredacted screenshots, raw Drive URLs, passwords, OTPs, reset/invite links,
API keys or service-role keys in this Git file, Codex or chat.

## 5. Local Verification

- `docs/HEU_SHORT_COURSE_REPORT_VIEW_SOURCE_RECONCILIATION_CHECKLIST_20260703.md`
- `docs/HEU_REPORT_VIEW_SOURCE_MAP_20260628_V01_DRAFT.md`
- `docs/HEU_SHORT_COURSE_ATTENDANCE_PAYMENT_GAP_PACK_20260628_V01_DRAFT.md`
- `components/short-course/short-course-attendance-payment-gap-pack.tsx`
- `scripts/audit-heu-short-course-attendance-payment-gap-pack.mjs`
- `npm.cmd run audit:heu-short-course-attendance-payment-gap-pack`

Passing the local audit proves only that the report-view source reconciliation
checklist is present. It does not prove that any DQ result, report-view source
reconciliation, UAT case, evidence package or owner decision has been executed
or accepted.

Boundary token: does not approve report-view reliance, approve dashboard reliance, accept DQ evidence, accept source reconciliation, execute UAT, accept evidence, approve owner GO/NO-GO or mark production GO.
