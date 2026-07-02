# HEU Short Course Owner Signoff Manifest 2026-07-02

Status: DRAFT_CONTROL
Production status: NO-GO
Decision values: SHORT_COURSE_OWNER_READY / NO_GO / BLOCKED

## 1. Purpose

This manifest is the controlled owner-signoff template for Short Course / Day
Nghe attendance, BHXH/chinh sach, meal/allowance, invoice/payment, report-view
reliance and audit traceability. It prepares the signoff package only. It does
not approve attendance lock, BHXH decision, payment, UAT acceptance, evidence
acceptance, owner GO/NO-GO or production GO from Codex/chat.

## 2. Required Owner Decisions

| Decision ID | Owner | Scope | Required evidence reference | Allowed result |
|---|---|---|---|---|
| SC-SIGN-01 | Dao Tao | Attendance lock packet and exception route | SC-REV-01 plus SC-UAT-01/02 evidence ref | GO / NO-GO / BLOCKED |
| SC-SIGN-02 | CTHSSV + Phap Che | BHXH/chinh sach eligibility and legal basis | SC-REV-02 plus SC-UAT-03 evidence ref | GO / NO-GO / BLOCKED |
| SC-SIGN-03 | HR + KHTC | Meal/allowance formula boundary | SC-REV-03 plus SC-UAT-04 evidence ref | GO / NO-GO / BLOCKED |
| SC-SIGN-04 | KHTC | Invoice/payment reconciliation, voucher and reversal rule | SC-REV-04 plus SC-UAT-05 evidence ref | GO / NO-GO / BLOCKED |
| SC-SIGN-05 | BGH + Audit | `RV_SHORT_COURSE_ATTENDANCE_PAYMENT` reliance decision | SC-REV-05 plus SC-UAT-06 evidence ref | GO / NO-GO / BLOCKED |
| SC-SIGN-06 | IT_DATA + Audit | Final UAT trace and access-scope check | SC-REV-06 plus SC-UAT-07/08 evidence ref | GO / NO-GO / BLOCKED |

## 3. Final Stop Rule

Short Course remains `NO-GO` if any required owner decision is missing, unsigned,
stored only in Codex/chat, tied to uncontrolled evidence, or marked `NO-GO` or
`BLOCKED`.

Short Course can only move beyond local packaging when all required owners have
signed outside Codex/chat, evidence references point to the controlled evidence
location, source reconciliation is accepted, and report-view reliance is signed.

## 4. Forbidden Content

Do not place passwords, OTPs, reset or invite links, service-role keys, raw PII,
CCCD, phone lists, bank data, vouchers, payroll files, teacher payment files,
private contracts, unredacted screenshots or raw Drive URLs in this Git file,
Codex or chat.

## 5. Local Verification

- `docs/HEU_SHORT_COURSE_OWNER_SIGNOFF_MANIFEST_20260702.md`
- `docs/HEU_SHORT_COURSE_ATTENDANCE_PAYMENT_GAP_PACK_20260628_V01_DRAFT.md`
- `components/short-course/short-course-attendance-payment-gap-pack.tsx`
- `scripts/audit-heu-short-course-attendance-payment-gap-pack.mjs`
- `npm.cmd run audit:heu-short-course-attendance-payment-gap-pack`

Passing the local audit proves only that the signoff template and boundary are
present. It does not prove that any owner has signed, accepted evidence or
approved Short Course for UAT, finance reliance, owner GO or production GO.
