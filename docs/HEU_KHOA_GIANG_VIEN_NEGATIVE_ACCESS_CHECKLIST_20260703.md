# HEU Khoa/Giang Vien Negative Access Checklist 2026-07-03

Status: PASS_LOCAL_NEGATIVE_ACCESS
Date: 2026-07-03
Scope: M08 Khoa/Giang vien role scope and negative-access proof for teacher
profile privacy, class-delivery evidence and payment/payroll boundaries.

Production/UAT status: NO-GO until signed role/workspace browser UAT,
controlled negative-user proof, redacted evidence references and owner decisions
are recorded outside Git/Codex/chat.

Decision values: KHOA_NEGATIVE_ACCESS_READY / NO_GO / BLOCKED, KHOA_EVIDENCE_TRACE_READY / NO_GO / BLOCKED

## Boundary

This checklist prepares role/negative-access proof only. It does not grant
access, change role scope, create accounts, import real teacher data, execute
UAT, accept evidence, approve teacher profile display, approve teacher profile
reliance, approve class delivery reliance, approve teaching completion, approve
teaching payment, approve payroll, approve owner GO/NO-GO or mark production
GO.

## Required Actors

- ADMIN and BGH: read governance status only.
- DAO_TAO: review class-delivery assignment, substitution route and UAT trace.
- Khoa owner: review faculty/bo mon scope and class-delivery owner map.
- HR: review teacher profile lane, employment status display and payment
  boundary.
- PHAP_CHE: review privacy class, allowed display fields and legal/SOP route.
- KHTC/accounting: review payment/payroll boundary only after signed policy and
  UAT; no teacher private data, bank data or payroll files are exposed.
- IT_DATA and Audit: role matrix, negative-user proof, redaction route and audit
  trace reviewer.
- OUT_OF_SCOPE_NEGATIVE_USER: must not read restricted teacher profile,
  controlled evidence, private contract, payroll, bank or restricted class
  evidence fields.

## Access Checklist

| Case | Control | Required local proof | Stop condition |
| --- | --- | --- | --- |
| KHOA-NEG-01 | Route access boundary | `/khoa` remains a PASS_LOCAL control surface and does not expose real teacher/private data to anonymous or out-of-scope users | Anonymous or out-of-scope user can read teacher private data |
| KHOA-NEG-02 | Teacher profile allowed-field scope | `docs/HEU_KHOA_GIANG_VIEN_TEACHER_PROFILE_PRIVACY_REGISTER_20260703.md` maps KHOA-PRIV-01 through KHOA-PRIV-06 before display reliance | A teacher field is displayed without HR/PHAP_CHE privacy approval |
| KHOA-NEG-03 | DAO_TAO + Khoa owner scope lane | Faculty/bo mon and class-delivery ownership are scoped to KHOA-REV-01 and KHOA-SIGN-01 | DAO_TAO or Khoa owner scope is guessed from file names, workbook labels or user labels |
| KHOA-NEG-04 | HR + PHAP_CHE privacy lane | HR/PHAP_CHE can approve only redacted display-field lanes and controlled evidence refs outside Git/Codex/chat | Raw teacher personal data, private contract, salary, allowance, phone or personal email is exposed |
| KHOA-NEG-05 | KHTC/accounting payment boundary | KHTC/accounting sees only payment/payroll stop-rule status, not bank, payroll, voucher or private contract files | Payment, payroll, voucher or bank data is visible or trusted before signed policy and UAT |
| KHOA-NEG-06 | OUT_OF_SCOPE_NEGATIVE_USER denial | Negative account cannot read restricted teacher profile fields, controlled evidence refs, private contracts, payroll, bank data or restricted class evidence | Negative account can view teacher private data, payroll, bank data or restricted class evidence |
| KHOA-NEG-07 | Controlled evidence redaction | `docs/HEU_KHOA_GIANG_VIEN_EVIDENCE_TRACE_SOURCE_RECONCILIATION_CHECKLIST_20260703.md`, KHOA-EVID-07 and IT_DATA/Audit record controlled redacted evidence refs, account label, route, result and blocker state | Raw evidence, unredacted screenshot, raw Drive URL, password, OTP, invite/reset link or service-role key enters Git/Codex/chat |
| KHOA-NEG-08 | UAT/owner trace closure | KHOA-UAT-07, KHOA-PRIV-06, KHOA-SIGN-06 and KHOA-EVID-08 reference the negative access result before owner reliance | PASS_LOCAL, Codex or AI output is treated as signed role UAT, evidence acceptance or owner GO |

## Result Ledger Fields

| field | required value |
| --- | --- |
| case_id | KHOA-NEG-01 through KHOA-NEG-08 |
| route | `/khoa`, `/settings/scopes`, `/reports`, `/audit` or controlled browser UAT route |
| account_label | ADMIN, BGH, DAO_TAO, KHOA_OWNER, HR, PHAP_CHE, KHTC, IT_DATA, AUDIT or OUT_OF_SCOPE_NEGATIVE_USER |
| expected_result | ALLOW_SCOPED, READ_ONLY_REVIEW, DENY or BLOCKED |
| actual_result | PASS, NO_GO or BLOCKED |
| controlled_evidence_ref | Redacted reference only |
| linked_privacy_case | KHOA-PRIV-06 |
| linked_uat_case | KHOA-UAT-07 |
| linked_signoff_case | KHOA-SIGN-06 |
| linked_evidence_trace_case | KHOA-EVID-01 through KHOA-EVID-08 |
| signer | Human reviewer outside Codex/chat |
| blocker_state | CLOSED, NO_GO or BLOCKED |

## Forbidden Content

Do not place raw teacher personal data, CCCD, CMND, passport, date of birth,
home address, personal phone, personal email, family data, salary, allowance,
bank account, bank statement, payroll file, voucher, private contract,
unredacted screenshot, raw Drive URL, password, OTP, invite/reset link,
service-role key or production credential in this Git file, Codex or chat.

Boundary token: raw teacher personal data.

Boundary tokens: does not approve teacher profile display; does not approve teaching payment; does not approve payroll; production GO.

## Focused Command Set

```powershell
npm.cmd run check:heu-khoa-giang-vien-negative-access
npm.cmd run check:heu-khoa-giang-vien-evidence-trace
npm.cmd run check:heu-khoa-giang-vien-teacher-profile-privacy
npm.cmd run check:heu-khoa-giang-vien-owner-signoff
npm.cmd run check:heu-khoa-giang-vien-source-map
npm.cmd run check:heu-khoa-giang-vien-foundation
npm.cmd run audit:heu-current-state-inventory
npm.cmd run audit:heu-implementation-log
npm.cmd run audit:ttgdtx-release-gates
npm.cmd run lint
npm.cmd run build
```

## Current Local Conclusion

P10-05 is locally packaged as a Khoa/Giang vien role/negative-access checklist,
but M08 remains NO-GO until signed browser UAT proves every positive and
negative account case outside Git/Codex/chat. P10-06 must route the negative
proof through
`docs/HEU_KHOA_GIANG_VIEN_EVIDENCE_TRACE_SOURCE_RECONCILIATION_CHECKLIST_20260703.md`
and KHOA-EVID-01 through KHOA-EVID-08 before source reconciliation or owner
closure can be claimed.
