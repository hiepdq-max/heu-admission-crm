# HEU Khoa/Giang Vien UAT Result Ledger Template 2026-07-03

Status: DRAFT_CONTROL
Production status: NO-GO
Decision value: KHOA_UAT_RESULT_READY / NO_GO / BLOCKED
Related evidence trace decisions: KHOA_EVIDENCE_TRACE_READY / NO_GO / BLOCKED, KHOA_SOURCE_RECONCILIATION_READY / NO_GO / BLOCKED

## 1. Purpose

This template records the future M08 Khoa/Giang vien UAT result ledger. It is a
controlled template only. It does not execute UAT, accept evidence, approve
teacher profile data, approve class-delivery reliance, approve teaching payment,
approve payroll, approve owner GO/NO-GO or mark production GO.

Owner decisions for these rows must be recorded through
`docs/HEU_KHOA_GIANG_VIEN_OWNER_SIGNOFF_MANIFEST_20260703.md`; missing,
unsigned, NO_GO or BLOCKED owner decisions keep M08 locked.

Teacher profile privacy results must reference
`docs/HEU_KHOA_GIANG_VIEN_TEACHER_PROFILE_PRIVACY_REGISTER_20260703.md`,
KHOA-PRIV-01 through KHOA-PRIV-06 and
`KHOA_TEACHER_PROFILE_PRIVACY_READY / NO_GO / BLOCKED` before any display-field
or source-map reliance.

Negative access results must reference
`docs/HEU_KHOA_GIANG_VIEN_NEGATIVE_ACCESS_CHECKLIST_20260703.md`,
KHOA-NEG-01 through KHOA-NEG-08 and
`KHOA_NEGATIVE_ACCESS_READY / NO_GO / BLOCKED` before any private teacher
profile, payroll, evidence or restricted class-delivery field is trusted.

Evidence trace and source reconciliation results must reference
`docs/HEU_KHOA_GIANG_VIEN_EVIDENCE_TRACE_SOURCE_RECONCILIATION_CHECKLIST_20260703.md`,
KHOA-EVID-01 through KHOA-EVID-08,
`KHOA_EVIDENCE_TRACE_READY / NO_GO / BLOCKED` and
`KHOA_SOURCE_RECONCILIATION_READY / NO_GO / BLOCKED` before any report-view or
owner-report reliance.

Boundary token: missing, unsigned, NO_GO or BLOCKED owner decisions keep M08 locked.

## 2. Ledger Rows

| Ledger | UAT | Review | Signoff | Evidence ref | Stop condition |
|---|---|---|---|---|---|
| KHOA-UAT-LEDGER-01 | KHOA-UAT-01 | KHOA-REV-01 | KHOA-SIGN-01 | Faculty/bo mon scope, class-delivery owner map and route/user label | Scope is guessed or unsigned |
| KHOA-UAT-LEDGER-02 | KHOA-UAT-02 | KHOA-REV-02 | KHOA-SIGN-02 | `docs/HEU_KHOA_GIANG_VIEN_TEACHER_PROFILE_PRIVACY_REGISTER_20260703.md`; KHOA-PRIV-01 through KHOA-PRIV-06; teacher profile privacy class and allowed display fields | Raw teacher personal data enters Git/Codex/chat |
| KHOA-UAT-LEDGER-03 | KHOA-UAT-03 | KHOA-REV-03 | KHOA-SIGN-03 | Class, subject/module, assigned teacher and substitution route | Assignment can be changed without trace |
| KHOA-UAT-LEDGER-04 | KHOA-UAT-04 | KHOA-REV-03 | KHOA-SIGN-03 | Session evidence, attendance/completion status and exception route | Teaching completion is trusted without evidence |
| KHOA-UAT-LEDGER-05 | KHOA-UAT-05 | KHOA-REV-04 | KHOA-SIGN-04 | Formula version, finance owner and blocked-payment proof | System calculates or pays before policy signoff |
| KHOA-UAT-LEDGER-06 | KHOA-UAT-06 | KHOA-REV-05 | KHOA-SIGN-05 | `RV_KHOA_GIANG_VIEN_DELIVERY` source map, DQ result, `docs/HEU_KHOA_GIANG_VIEN_EVIDENCE_TRACE_SOURCE_RECONCILIATION_CHECKLIST_20260703.md` and KHOA-EVID-06 source reconciliation result | Dashboard is relied on before report-view owner signoff |
| KHOA-UAT-LEDGER-07 | KHOA-UAT-07 | KHOA-REV-06 | KHOA-SIGN-06 | `docs/HEU_KHOA_GIANG_VIEN_NEGATIVE_ACCESS_CHECKLIST_20260703.md`; KHOA-NEG-01 through KHOA-NEG-08; KHOA-PRIV-06 negative access proof and scoped evidence ref | Out-of-scope staff see teacher private data, payroll or restricted class evidence |
| KHOA-UAT-LEDGER-08 | KHOA-UAT-08 | KHOA-REV-06 | KHOA-SIGN-06 | Actor, owner, evidence ref, reviewer, KHOA-EVID-01 through KHOA-EVID-08 and decision trace row | PASS_LOCAL, Codex or AI output is treated as owner approval |

## 3. Forbidden Content

Do not paste raw teacher personal data, CCCD, phone lists, bank accounts,
payroll files, vouchers, passwords, OTPs, reset links, invite links,
service-role keys or production credentials into this template, Git, Codex or
chat.

## 4. Boundary

This template does not prove that any UAT case has been executed or accepted.
Khoa/Giang vien remains NO-GO until owner signatures, controlled evidence
references, access-scope checks and report-view signoff exist outside
Git/Codex/chat.

Boundary token: outside Git/Codex/chat.
