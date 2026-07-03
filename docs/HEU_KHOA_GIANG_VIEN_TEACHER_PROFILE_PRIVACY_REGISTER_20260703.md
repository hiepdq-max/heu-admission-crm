# HEU Khoa/Giang Vien Teacher Profile Privacy Register 2026-07-03

Status: PASS_LOCAL_PRIVACY_REGISTER
Production status: NO-GO
Decision value: KHOA_TEACHER_PROFILE_PRIVACY_READY / NO_GO / BLOCKED
Scope: M08 Khoa/Giang vien teacher profile display-field, privacy class and
controlled evidence-route register.

## 1. Purpose

This register defines which teacher-profile fields may be considered for a
future read-only Khoa/Giang vien display after HR and PHAP_CHE review. It is a
local control artifact only. It does not import real teacher data, approve
teacher profile reliance, approve class delivery reliance, approve teaching
completion, approve teaching payment, approve payroll, accept evidence, execute
UAT, approve owner GO/NO-GO or mark production GO.

The approved field list, signer names and controlled evidence references must
be recorded outside Git/Codex/chat. This file may store only field names,
decision tokens, redacted evidence references and stop rules.

## 2. Decision Values

- KHOA_TEACHER_PROFILE_PRIVACY_READY / NO_GO / BLOCKED
- KHOA_GV_READY / NO_GO / BLOCKED
- KHOA_OWNER_READY / NO_GO / BLOCKED
- KHOA_UAT_RESULT_READY / NO_GO / BLOCKED
- KHOA_DELIVERY_SOURCE_READY / NO_GO / BLOCKED
- KHOA_NEGATIVE_ACCESS_READY / NO_GO / BLOCKED
- KHOA_EVIDENCE_TRACE_READY / NO_GO / BLOCKED

## 3. Allowed Display Field Register

| Code | Field lane | Allowed local meaning | Required owner proof | Stop condition |
| --- | --- | --- | --- | --- |
| KHOA-PRIV-01 | Teacher display label | Redacted teacher label, display name or approved alias only | HR + PHAP_CHE approval reference tied to KHOA-REV-02 and KHOA-SIGN-02 | Raw teacher personal data, CCCD, date of birth, home address or private identifier enters Git/Codex/chat |
| KHOA-PRIV-02 | Faculty/bo mon affiliation | Faculty, bo mon, program scope and owner lane for class-delivery review | DAO_TAO + Khoa owner scope reference tied to KHOA-REV-01 | Faculty or bo mon ownership is guessed from user labels, filenames or workbook names |
| KHOA-PRIV-03 | Teaching eligibility status | Coarse eligibility state such as pending review, allowed for UAT review, or blocked | HR + PHAP_CHE policy/evidence route, with no private contract term in Git/Codex/chat | Contract terms, salary, allowance, bank or payroll data is exposed |
| KHOA-PRIV-04 | Institutional contact route | Role-based institutional contact channel or owner lane, not personal contact data | HR-approved contact-display rule and PHAP_CHE privacy class | Personal phone, personal email, home address or messaging handle is displayed without signed approval |
| KHOA-PRIV-05 | Controlled evidence route | Redacted evidence reference ID for teacher profile review, not raw files or Drive URLs | `docs/HEU_KHOA_GIANG_VIEN_EVIDENCE_TRACE_SOURCE_RECONCILIATION_CHECKLIST_20260703.md`, KHOA-EVID-02, controlled evidence location, reviewer lane and redaction reviewer outside Git/Codex/chat | Raw contract, unredacted screenshot, raw Drive URL, payroll file, voucher or bank file enters Git/Codex/chat |
| KHOA-PRIV-06 | Negative access proof | Evidence that out-of-scope users cannot see restricted teacher profile fields | `docs/HEU_KHOA_GIANG_VIEN_NEGATIVE_ACCESS_CHECKLIST_20260703.md`, KHOA-NEG-01 through KHOA-NEG-08, KHOA-UAT-07 evidence ref plus IT_DATA/Audit access-scope result | Out-of-scope staff can see teacher private data, payroll, bank data or restricted class evidence |

## 4. Required Closure Fields

| Field | Required value |
| --- | --- |
| register_version | Owner-controlled version outside Git/Codex/chat |
| owner_lane | HR, PHAP_CHE, DAO_TAO, Khoa owner, IT_DATA or Audit |
| allowed_field_code | KHOA-PRIV-01 through KHOA-PRIV-06 |
| display_label | Safe field label only, not real teacher data |
| privacy_class | PUBLIC_INTERNAL, ROLE_RESTRICTED, CONTROLLED_EVIDENCE or BLOCKED |
| source_ref | Redacted source reference only |
| linked_review_case | KHOA-REV-02, or KHOA-REV-01 when scope is the subject |
| linked_signoff_case | KHOA-SIGN-02, or KHOA-SIGN-01 when scope is the subject |
| linked_uat_case | KHOA-UAT-02 or KHOA-UAT-07 |
| linked_source_case | KHOA-SRC-02 and KHOA-DQ-02 |
| linked_negative_access_case | KHOA-NEG-01 through KHOA-NEG-08 when private-field denial is requested |
| linked_evidence_trace_case | KHOA-EVID-01 through KHOA-EVID-08 when controlled evidence refs or report-view reliance are requested |
| decision_value | KHOA_TEACHER_PROFILE_PRIVACY_READY / NO_GO / BLOCKED |
| blocker_state | CLOSED, NO_GO or BLOCKED |
| signed_date | Signed date outside Codex/chat |

## 5. Routing Map

| Privacy case | Review case | Signoff case | UAT case | Source/DQ case |
| --- | --- | --- | --- | --- |
| KHOA-PRIV-01 | KHOA-REV-02 | KHOA-SIGN-02 | KHOA-UAT-02 | KHOA-SRC-02 / KHOA-DQ-02 |
| KHOA-PRIV-02 | KHOA-REV-01 | KHOA-SIGN-01 | KHOA-UAT-01 | KHOA-SRC-01 / KHOA-DQ-01 |
| KHOA-PRIV-03 | KHOA-REV-02 | KHOA-SIGN-02 | KHOA-UAT-02 | KHOA-SRC-02 / KHOA-DQ-02 |
| KHOA-PRIV-04 | KHOA-REV-02 | KHOA-SIGN-02 | KHOA-UAT-02 | KHOA-SRC-02 / KHOA-DQ-02 |
| KHOA-PRIV-05 | KHOA-REV-02 | KHOA-SIGN-02 | KHOA-UAT-02 | KHOA-SRC-02 / KHOA-DQ-02 |
| KHOA-PRIV-06 | KHOA-REV-06 | KHOA-SIGN-06 | KHOA-UAT-07 | KHOA-SRC-08 / KHOA-DQ-08 plus `docs/HEU_KHOA_GIANG_VIEN_NEGATIVE_ACCESS_CHECKLIST_20260703.md` |

## 6. Forbidden Content

Do not place raw teacher personal data, CCCD, CMND, passport, date of birth,
home address, personal phone, personal email, family data, salary, allowance,
bank account, bank statement, payroll file, voucher, private contract,
unredacted screenshot, raw Drive URL, password, OTP, invite/reset link,
service-role key or production credential in this Git file, Codex or chat.

Boundary token: raw teacher personal data.

## 7. Final Stop Rule

Khoa/Giang vien teacher profile display remains `NO-GO` if any
KHOA-PRIV-01 through KHOA-PRIV-06 row is missing, unsigned, tied to uncontrolled
evidence, marked `NO_GO`, marked `BLOCKED`, or stored only in Git/Codex/chat.
It also remains `NO-GO` if KHOA-PRIV-06 is missing
`docs/HEU_KHOA_GIANG_VIEN_NEGATIVE_ACCESS_CHECKLIST_20260703.md`,
KHOA-NEG-01 through KHOA-NEG-08 or signed negative-user proof.
It also remains `NO-GO` if KHOA-PRIV-05 is missing
`docs/HEU_KHOA_GIANG_VIEN_EVIDENCE_TRACE_SOURCE_RECONCILIATION_CHECKLIST_20260703.md`,
KHOA-EVID-01 through KHOA-EVID-08 or a controlled evidence trace reference.

Passing the local privacy-register check proves only that the register template,
read-only UI panel, references and stop conditions exist. It does not approve
teacher profile display, teacher profile reliance, class delivery reliance,
teaching completion, teaching payment, payroll, evidence acceptance, UAT
acceptance, owner GO/NO-GO or production GO.

Boundary tokens: does not approve teacher profile display; does not approve teacher profile reliance; does not approve teaching payment.

## 8. Local Guard Commands

- `npm.cmd run check:heu-khoa-giang-vien-teacher-profile-privacy`
- `npm.cmd run check:heu-khoa-giang-vien-negative-access`
- `npm.cmd run check:heu-khoa-giang-vien-evidence-trace`
- `npm.cmd run check:heu-khoa-giang-vien-owner-signoff`
- `npm.cmd run check:heu-khoa-giang-vien-source-map`
- `npm.cmd run check:heu-khoa-giang-vien-foundation`
- `npm.cmd run audit:heu-current-state-inventory`
- `npm.cmd run audit:heu-implementation-log`
- `npm.cmd run audit:ttgdtx-release-gates`
- `npm.cmd run lint`
- `npm.cmd run build`
