# HEU Short Course BHXH Policy Decision Checklist 2026-07-03

Status: DRAFT_CONTROL
Production status: NO-GO
Decision values: SC_BHXH_POLICY_DECISION_READY / NO_GO / BLOCKED

## 1. Purpose

This checklist prepares the TRN-04 BHXH/chinh sach decision packet for Short
Course / Day Nghe signed UAT. It is local control packaging only. It does not
approve BHXH/chinh sach, decide eligibility, create policy effect, accept
evidence, execute UAT, approve payment, approve owner GO/NO-GO or mark
production GO.

The checklist connects SC-AP-04, SC-REV-02, SC-UAT-03 and SC-SIGN-02 to
controlled external evidence references before any downstream meal/allowance,
invoice/payment, HR payment or dashboard reliance.

## 2. Required Evidence Rows

| Evidence ID | Control link | Required proof | Owner | Stop condition |
|---|---|---|---|---|
| SC-BHXH-EVID-01 | SC-AP-04 | Policy case identifier, active Short Course segment label and student/class linkage without raw PII in Git | CTHSSV + IT_DATA | Policy case is missing, cross-scope or tied only to raw uncontrolled evidence |
| SC-BHXH-EVID-02 | SC-AP-04 | Eligibility decision state, basis code and effective-date boundary | CTHSSV + Phap Che | Eligibility is oral, ambiguous, unsigned or lacks effective-date boundary |
| SC-BHXH-EVID-03 | SC-REV-02 | Legal/SOP basis reference, evidence class and redaction class | Phap Che + Audit | Legal basis is missing, unreviewed or stores raw sensitive proof in Git/Codex/chat |
| SC-BHXH-EVID-04 | SC-UAT-03 | Controlled UAT evidence reference for BHXH/chinh sach route behavior and negative stop condition | CTHSSV + Phap Che | UAT evidence is uncontrolled, raw-sensitive, missing or bypasses owner/legal review |
| SC-BHXH-EVID-05 | SC-SIGN-02 | Owner/legal signer label, role, decision timestamp and decision state | CTHSSV + Phap Che | Signer is missing, unsigned, delegated without authority or stored only in Codex/chat |
| SC-BHXH-EVID-06 | SC-AP-05/06 | Downstream block proof showing meal/allowance, HR payment, invoice/payment and dashboard reliance remain locked until policy signoff | HR + KHTC + Audit | Any downstream calculation, payment, verification or report reliance starts before signed policy decision |

## 3. Completion Rule

`SC_BHXH_POLICY_DECISION_READY` is allowed only when every SC-BHXH-EVID-01
through SC-BHXH-EVID-06 row has an external controlled evidence reference,
owner/reviewer label, decision state and stop-condition result outside
Git/Codex/chat.

Any missing, unsigned, uncontrolled, `NO_GO` or `BLOCKED` row keeps TRN-04 and
Short Course production locked.

## 4. Forbidden Content

Do not store raw student names, phone numbers, CCCD, health/social-insurance
identifiers, policy forms, private legal memos, unredacted screenshots, raw
Drive URLs, bank data, teacher payment files, payroll files, vouchers,
passwords, OTPs, reset/invite links, API keys or service-role keys in this Git
file, Codex or chat.

## 5. Local Verification

- `docs/HEU_SHORT_COURSE_BHXH_POLICY_DECISION_CHECKLIST_20260703.md`
- `docs/HEU_SHORT_COURSE_ATTENDANCE_PAYMENT_GAP_PACK_20260628_V01_DRAFT.md`
- `components/short-course/short-course-attendance-payment-gap-pack.tsx`
- `scripts/audit-heu-short-course-attendance-payment-gap-pack.mjs`
- `npm.cmd run audit:heu-short-course-attendance-payment-gap-pack`

Passing the local audit proves only that the BHXH/chinh sach decision checklist
and boundary are present. It does not prove that any policy case, UAT case,
evidence package or owner/legal decision has been executed or accepted.

Boundary token: does not approve BHXH/chinh sach, decide eligibility, create policy effect, accept evidence, execute UAT, approve payment, approve owner GO/NO-GO or mark production GO.
