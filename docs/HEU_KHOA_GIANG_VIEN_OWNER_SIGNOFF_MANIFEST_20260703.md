# HEU Khoa/Giang Vien Owner Signoff Manifest

Status: PASS_LOCAL_MANIFEST
Date: 2026-07-03
Scope: M08 Khoa/Giang vien owner signoff control for faculty, teacher profile,
class delivery, teaching evidence and report-view reliance.

## Boundary

This manifest defines the owner decision lanes required before Khoa/Giang vien
profile, class-delivery, teaching-evidence or report-view results can be relied
on. It does not execute UAT, accept evidence, approve class delivery reliance,
approve teacher profile reliance, approve teaching completion, approve
attendance lock, approve teaching payment, approve payroll, approve owner
GO/NO-GO or mark production GO.

Production status: NO-GO until the required owners sign outside Codex/chat,
controlled evidence references are accepted outside Git/Codex/chat and all open
blockers in the Khoa/Giang vien UAT result ledger are closed.

## Decision Values

- KHOA_OWNER_READY / NO_GO / BLOCKED
- KHOA_GV_READY / NO_GO / BLOCKED
- KHOA_REVIEW_READY / NO_GO / BLOCKED
- KHOA_UAT_RESULT_READY / NO_GO / BLOCKED
- KHOA_DELIVERY_SOURCE_READY / NO_GO / BLOCKED
- KHOA_TEACHER_PROFILE_PRIVACY_READY / NO_GO / BLOCKED
- KHOA_NEGATIVE_ACCESS_READY / NO_GO / BLOCKED
- KHOA_EVIDENCE_TRACE_READY / NO_GO / BLOCKED
- KHOA_SOURCE_RECONCILIATION_READY / NO_GO / BLOCKED
- RV_KHOA_GIANG_VIEN_DELIVERY / NO_GO / BLOCKED

## Signoff Manifest

| Case | Owner lane | Decision to record | Required evidence reference | Stop condition |
| --- | --- | --- | --- | --- |
| KHOA-SIGN-01 | DAO_TAO + Khoa owner | Confirm faculty/bo mon scope, class-delivery owner map and signer authority | KHOA-REV-01 plus KHOA-UAT-01 evidence ref | Owner is missing, signer authority is unclear or PASS_LOCAL is treated as owner acceptance |
| KHOA-SIGN-02 | HR + PHAP_CHE | Confirm teacher profile privacy class, allowed display fields and contract/evidence route | `docs/HEU_KHOA_GIANG_VIEN_TEACHER_PROFILE_PRIVACY_REGISTER_20260703.md`, KHOA-PRIV-01 through KHOA-PRIV-06, KHOA-REV-02 plus KHOA-UAT-02 evidence ref | Raw teacher personal data, CCCD, bank, phone, payroll or private contract data enters Git/Codex/chat |
| KHOA-SIGN-03 | DAO_TAO + Audit | Confirm teaching assignment, substitution route and session completion evidence route | KHOA-REV-03 plus KHOA-UAT-03/04 evidence ref | Teaching assignment or completion can be changed without trace |
| KHOA-SIGN-04 | KHTC + HR | Confirm teaching payment/payroll boundary, formula version and blocked-payment proof | KHOA-REV-04 plus KHOA-UAT-05 evidence ref | System calculates, approves or pays teaching allowance/payroll before signed policy and UAT |
| KHOA-SIGN-05 | BGH + Audit + Khoa owner | Confirm `RV_KHOA_GIANG_VIEN_DELIVERY` DQ, source map, source reconciliation and reliance decision | `docs/HEU_KHOA_GIANG_VIEN_EVIDENCE_TRACE_SOURCE_RECONCILIATION_CHECKLIST_20260703.md`, KHOA-EVID-06, KHOA-REV-05, KHOA-DQ-01 through KHOA-DQ-08 and KHOA-UAT-06 evidence ref | Dashboard or owner report is relied on before report-view owner signoff |
| KHOA-SIGN-06 | IT_DATA + Audit + final owner quorum | Record KHOA_OWNER_READY, NO_GO or BLOCKED with access scope, UAT trace and blocker list | `docs/HEU_KHOA_GIANG_VIEN_NEGATIVE_ACCESS_CHECKLIST_20260703.md`, `docs/HEU_KHOA_GIANG_VIEN_EVIDENCE_TRACE_SOURCE_RECONCILIATION_CHECKLIST_20260703.md`, KHOA-NEG-01 through KHOA-NEG-08, KHOA-EVID-01 through KHOA-EVID-08, KHOA-REV-06 plus KHOA-UAT-07/08 evidence ref | Any required owner, signed UAT run, access-scope denial proof or blocker closure is missing |

## Required Closure Fields

| field | required value |
| --- | --- |
| signer_name | Named human owner outside Codex/chat |
| signer_lane | DAO_TAO, Khoa owner, HR, PHAP_CHE, KHTC, BGH, IT_DATA, Audit or final owner quorum |
| decision_value | KHOA_OWNER_READY / NO_GO / BLOCKED |
| evidence_ref | Controlled redacted evidence reference only |
| linked_review_case | KHOA-REV-01 through KHOA-REV-06 |
| linked_uat_case | KHOA-UAT-01 through KHOA-UAT-08 |
| linked_source_case | KHOA-SRC-01 through KHOA-SRC-08 when report-view reliance is requested |
| linked_privacy_case | KHOA-PRIV-01 through KHOA-PRIV-06 when teacher profile display is requested |
| linked_negative_access_case | KHOA-NEG-01 through KHOA-NEG-08 when private teacher fields or restricted evidence are in scope |
| linked_evidence_trace_case | KHOA-EVID-01 through KHOA-EVID-08 when report-view, UAT or owner closure is requested |
| blocker_state | CLOSED, NO_GO or BLOCKED |
| date | Signed date outside Codex/chat |

## Final Stop Rule

Khoa/Giang vien remains `NO-GO` if any required owner decision is missing,
unsigned, stored only in Git/Codex/chat, tied to uncontrolled evidence, marked
`NO_GO` or marked `BLOCKED`.

Khoa/Giang vien can only move beyond local packaging when all required owners
have signed outside Codex/chat, evidence references point to the controlled
evidence location, teacher profile privacy is approved through
`docs/HEU_KHOA_GIANG_VIEN_TEACHER_PROFILE_PRIVACY_REGISTER_20260703.md`,
negative access is proven through
`docs/HEU_KHOA_GIANG_VIEN_NEGATIVE_ACCESS_CHECKLIST_20260703.md`, source
reconciliation is routed through
`docs/HEU_KHOA_GIANG_VIEN_EVIDENCE_TRACE_SOURCE_RECONCILIATION_CHECKLIST_20260703.md`,
UAT results are signed and report-view reliance is signed.

## Forbidden Content

Do not place passwords, OTPs, reset or invite links, service-role keys, raw
teacher personal data, student PII, CCCD, phone lists, bank data, vouchers,
payroll files, teacher payment files, private contracts, unredacted screenshots
or raw Drive URLs in this Git file, Codex or chat.

Boundary token: raw teacher personal data.

## Local Guard Commands

- `npm.cmd run check:heu-khoa-giang-vien-owner-signoff`
- `npm.cmd run check:heu-khoa-giang-vien-teacher-profile-privacy`
- `npm.cmd run check:heu-khoa-giang-vien-negative-access`
- `npm.cmd run check:heu-khoa-giang-vien-evidence-trace`
- `npm.cmd run check:heu-khoa-giang-vien-foundation`
- `npm.cmd run check:heu-khoa-giang-vien-source-map`
- `npm.cmd run audit:heu-current-state-inventory`
- `npm.cmd run audit:heu-implementation-log`
- `npm.cmd run lint`
- `npm.cmd run build`

Passing the local Khoa/Giang vien owner-signoff check proves only that the
manifest template, read-only UI panel, references and local-only stop conditions
are present. It does not prove that any owner has signed, accepted evidence,
approved UAT, approved teacher profile reliance, approved class delivery
reliance, approved teaching payment, approved payroll, approved owner GO/NO-GO
or marked production GO.
