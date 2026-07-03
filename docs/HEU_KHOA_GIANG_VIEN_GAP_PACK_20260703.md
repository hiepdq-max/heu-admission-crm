# HEU Khoa/Giang Vien Gap Pack 2026-07-03

Status: DRAFT_CONTROL
Production status: NO-GO
Decision values: KHOA_GV_READY / NO_GO / BLOCKED, KHOA_REVIEW_READY / NO_GO / BLOCKED, KHOA_OWNER_READY / NO_GO / BLOCKED, KHOA_UAT_RESULT_READY / NO_GO / BLOCKED, KHOA_TEACHER_PROFILE_PRIVACY_READY / NO_GO / BLOCKED, KHOA_NEGATIVE_ACCESS_READY / NO_GO / BLOCKED, KHOA_EVIDENCE_TRACE_READY / NO_GO / BLOCKED, KHOA_SOURCE_RECONCILIATION_READY / NO_GO / BLOCKED

## 1. Purpose

This pack makes M08 Khoa/Giang vien visible as a controlled PASS_LOCAL
foundation. It maps faculty, teacher, class-delivery and teaching-evidence
questions into a read-only review surface before any deep workflow, payroll,
attendance lock or production dashboard reliance is coded.

It is not a production module approval. It does not execute UAT, accept
evidence, approve teacher profile data, approve timetable reliance, approve
teaching payment, approve payroll, approve owner GO/NO-GO or mark production
GO.

## 2. Current Evidence

| Area | Current state | Gap |
|---|---|---|
| Faculty / department scope | Staff, role and department primitives exist through HEU user/profile controls | Faculty/bo mon ownership map is not signed for class delivery |
| Teacher profile | Teacher and staff data may appear in Short Course or future class-delivery files; `docs/HEU_KHOA_GIANG_VIEN_TEACHER_PROFILE_PRIVACY_REGISTER_20260703.md` now defines the PASS_LOCAL_PRIVACY_REGISTER allowed-field lanes; `docs/HEU_KHOA_GIANG_VIEN_NEGATIVE_ACCESS_CHECKLIST_20260703.md` now defines KHOA-NEG-01 through KHOA-NEG-08 | No signed HR/PHAP_CHE privacy approval, controlled evidence ref, negative-user proof or owner signoff for M08 reliance |
| Class delivery | Short Course class/session primitives exist; HOU and TTGDTX handover remain separate | No cross-program teaching assignment control for Khoa/Giang vien |
| Teaching evidence | Attendance and session data exist only in controlled module contexts | No signed evidence route for teaching completion, substitution or make-up class |
| Payment boundary | Short Course gap pack blocks teacher/HR payment automation | No signed formula, payroll boundary or finance reliance for teacher payment |
| Report view | Report governance exists; `docs/HEU_KHOA_GIANG_VIEN_DELIVERY_SOURCE_MAP_20260703.md` drafts `RV_KHOA_GIANG_VIEN_DELIVERY`; `docs/HEU_KHOA_GIANG_VIEN_EVIDENCE_TRACE_SOURCE_RECONCILIATION_CHECKLIST_20260703.md` now defines KHOA-EVID-01 through KHOA-EVID-08 | Report-view owner signoff, DQ result, external source reconciliation, controlled evidence refs and signed UAT are still missing |

## 3. Control Gates

| Code | Control | Owner | Required proof |
|---|---|---|---|
| KHOA-GV-01 | Scope and owner map | DAO_TAO + Khoa owner + IT_DATA | Faculty/bo mon owner, program scope and class-delivery boundary are named |
| KHOA-GV-02 | Teacher profile boundary | Khoa owner + HR + PHAP_CHE | Teacher identity, contract/privacy class and allowed display fields are approved |
| KHOA-GV-03 | Class delivery assignment | DAO_TAO + Khoa owner | Class, subject/module, teacher and substitution route are controlled |
| KHOA-GV-04 | Teaching session evidence | DAO_TAO + Audit | Session date, attendance/evidence class, completion status and exception route are present |
| KHOA-GV-05 | Teaching completion review | Khoa owner + DAO_TAO + Audit | Completion, make-up class, substitute teaching and dispute handling are reviewed |
| KHOA-GV-06 | Payment/payroll stop rule | KHTC + HR + Audit | No teaching payment, allowance or payroll entry is trusted without signed policy and UAT |
| KHOA-GV-07 | Report view signoff | BGH + Audit + Khoa owner | `RV_KHOA_GIANG_VIEN_DELIVERY` has source map, DQ result and owner signoff |
| KHOA-GV-08 | Production stop rule | IT_DATA + Audit | No production timetable, attendance lock, payroll, report reliance or owner GO from PASS_LOCAL |

## 4. Review Handoff Queue

| Code | Owner | Review | Required proof | Stop condition |
|---|---|---|---|---|
| KHOA-REV-01 | DAO_TAO + Khoa owner | Faculty/class-delivery scope | Owner map, program scope and class-delivery boundary | Scope is guessed from file names or user labels only |
| KHOA-REV-02 | HR + PHAP_CHE | Teacher profile privacy | `docs/HEU_KHOA_GIANG_VIEN_TEACHER_PROFILE_PRIVACY_REGISTER_20260703.md`, KHOA-PRIV-01 through KHOA-PRIV-06, allowed fields, privacy class and contract/evidence route | Raw teacher personal data enters Git/Codex/chat |
| KHOA-REV-03 | DAO_TAO + Audit | Teaching assignment and session evidence | Class, subject/module, assigned teacher, substitute route and evidence ref | Teaching completion can be marked without trace |
| KHOA-REV-04 | KHTC + HR | Payment/payroll boundary | Formula version, finance owner and blocked-payment proof | System calculates or pays before policy signoff |
| KHOA-REV-05 | BGH + Audit | Report-view reliance | `RV_KHOA_GIANG_VIEN_DELIVERY` source map, DQ status, `docs/HEU_KHOA_GIANG_VIEN_EVIDENCE_TRACE_SOURCE_RECONCILIATION_CHECKLIST_20260703.md` and signoff route | Dashboard is trusted before report-view owner signoff |
| KHOA-REV-06 | IT_DATA + Audit | Final UAT trace | Actor, route, evidence ref, reviewer, KHOA-NEG-01 through KHOA-NEG-08, KHOA-EVID-01 through KHOA-EVID-08 and owner decision | PASS_LOCAL, Codex or AI output is treated as UAT acceptance or owner GO |

## 5. Owner Signoff Manifest

Owner decisions must be recorded outside Git/Codex/chat with controlled evidence
references. Missing, unsigned, NO_GO or BLOCKED owner decisions keep M08 locked.
Use `docs/HEU_KHOA_GIANG_VIEN_OWNER_SIGNOFF_MANIFEST_20260703.md` as the
PASS_LOCAL_MANIFEST template before any Khoa/Giang vien owner reliance claim.

| Code | Owner | Decision |
|---|---|---|
| KHOA-SIGN-01 | DAO_TAO + Khoa owner | Faculty/bo mon scope and class-delivery owner map |
| KHOA-SIGN-02 | HR + PHAP_CHE | Teacher profile privacy class and allowed display fields |
| KHOA-SIGN-03 | DAO_TAO + Audit | Teaching assignment, substitution and completion evidence route |
| KHOA-SIGN-04 | KHTC + HR | Teaching payment/payroll boundary and formula stop rule |
| KHOA-SIGN-05 | BGH + Audit + Khoa owner | `RV_KHOA_GIANG_VIEN_DELIVERY` reliance decision |
| KHOA-SIGN-06 | IT_DATA + Audit | Final M08 UAT trace and access-scope check |

## 5A. Teacher Profile Privacy Register

Use `docs/HEU_KHOA_GIANG_VIEN_TEACHER_PROFILE_PRIVACY_REGISTER_20260703.md`
as the PASS_LOCAL_PRIVACY_REGISTER before any teacher profile display, source
map or UAT reliance claim. The register records KHOA-PRIV-01 through
KHOA-PRIV-06 and `KHOA_TEACHER_PROFILE_PRIVACY_READY / NO_GO / BLOCKED`.

| Code | Owner | Decision |
|---|---|---|
| KHOA-PRIV-01 | HR + PHAP_CHE | Teacher display label is redacted or approved |
| KHOA-PRIV-02 | DAO_TAO + Khoa owner | Faculty/bo mon affiliation is owner-scoped |
| KHOA-PRIV-03 | HR + PHAP_CHE | Teaching eligibility status does not expose contract, salary or payroll terms |
| KHOA-PRIV-04 | HR + PHAP_CHE | Institutional contact route does not expose personal contact data |
| KHOA-PRIV-05 | IT_DATA + Audit | Controlled evidence route uses redacted references only |
| KHOA-PRIV-06 | IT_DATA + Audit | Negative access proof blocks restricted teacher profile fields |

## 5B. Negative Access Checklist

Use `docs/HEU_KHOA_GIANG_VIEN_NEGATIVE_ACCESS_CHECKLIST_20260703.md` as the
PASS_LOCAL_NEGATIVE_ACCESS checklist before any teacher private field,
controlled evidence, payment/payroll or restricted class-delivery reliance
claim. The checklist records KHOA-NEG-01 through KHOA-NEG-08 and
`KHOA_NEGATIVE_ACCESS_READY / NO_GO / BLOCKED`.

| Code | Owner | Decision |
|---|---|---|
| KHOA-NEG-01 | IT_DATA + Audit | `/khoa` route remains a PASS_LOCAL control surface without real private data exposure |
| KHOA-NEG-02 | HR + PHAP_CHE | Teacher allowed-field scope is tied to KHOA-PRIV-01 through KHOA-PRIV-06 |
| KHOA-NEG-03 | DAO_TAO + Khoa owner | Faculty/bo mon and class-delivery scope are owner-scoped |
| KHOA-NEG-04 | HR + PHAP_CHE | Privacy lane blocks raw teacher personal data and private contract exposure |
| KHOA-NEG-05 | KHTC + HR | Payment/payroll boundary blocks bank, voucher and payroll exposure |
| KHOA-NEG-06 | IT_DATA + Audit | OUT_OF_SCOPE_NEGATIVE_USER denial is captured |
| KHOA-NEG-07 | IT_DATA + Audit | Controlled evidence redaction proof is recorded |
| KHOA-NEG-08 | IT_DATA + Audit + final owner quorum | KHOA-UAT-07, KHOA-PRIV-06 and KHOA-SIGN-06 are linked before owner reliance |

## 5C. Controlled Evidence Trace / Source Reconciliation Checklist

Use `docs/HEU_KHOA_GIANG_VIEN_EVIDENCE_TRACE_SOURCE_RECONCILIATION_CHECKLIST_20260703.md`
as the PASS_LOCAL_EVIDENCE_TRACE checklist before any report-view reliance,
dashboard reliance, owner closure, teaching completion, teacher profile display
or teaching payment/payroll claim. The checklist records KHOA-EVID-01 through
KHOA-EVID-08, `KHOA_EVIDENCE_TRACE_READY / NO_GO / BLOCKED` and
`KHOA_SOURCE_RECONCILIATION_READY / NO_GO / BLOCKED`.

| Code | Owner | Decision |
|---|---|---|
| KHOA-EVID-01 | DAO_TAO + Khoa owner + Audit | Faculty/bo mon owner map is tied to controlled evidence |
| KHOA-EVID-02 | HR + PHAP_CHE + IT_DATA | Teacher privacy packet is linked to allowed display-field proof |
| KHOA-EVID-03 | DAO_TAO + Khoa owner + Audit | Class assignment trace and substitute route are sourced |
| KHOA-EVID-04 | DAO_TAO + Khoa owner + Audit | Teaching evidence and completion review use redacted evidence refs |
| KHOA-EVID-05 | KHTC + HR + Audit | Payment/payroll stop proof blocks formula or payroll reliance |
| KHOA-EVID-06 | BGH + IT_DATA + Audit | `RV_KHOA_GIANG_VIEN_DELIVERY` source reconciliation is recorded |
| KHOA-EVID-07 | IT_DATA + Audit | Negative access evidence blocks restricted field leakage |
| KHOA-EVID-08 | Final owner quorum + Audit | UAT ledger and owner signoff closure are linked |

## 6. UAT Result Ledger

Use `docs/HEU_KHOA_GIANG_VIEN_UAT_RESULT_LEDGER_TEMPLATE_20260703.md` for
KHOA-UAT-LEDGER-01 through KHOA-UAT-LEDGER-08 before any signed UAT statement.
The template records KHOA_UAT_RESULT_READY / NO_GO / BLOCKED and does not prove
that any UAT case has been executed or accepted.

KHOA-UAT-LEDGER-06 through KHOA-UAT-LEDGER-08 must also reference
`docs/HEU_KHOA_GIANG_VIEN_EVIDENCE_TRACE_SOURCE_RECONCILIATION_CHECKLIST_20260703.md`
when report-view source reconciliation or final owner closure is requested.

## 6A. Delivery Source Map

Use `docs/HEU_KHOA_GIANG_VIEN_DELIVERY_SOURCE_MAP_20260703.md` for
`RV_KHOA_GIANG_VIEN_DELIVERY`, KHOA-SRC-01 through KHOA-SRC-08, KHOA-DQ-01
through KHOA-DQ-08 and KHOA-RV-EVID-01 through KHOA-RV-EVID-06 before any
dashboard or owner-report reliance. The source map records
KHOA_DELIVERY_SOURCE_READY / NO_GO / BLOCKED and
RV_KHOA_GIANG_VIEN_DELIVERY / NO_GO / BLOCKED. It is DRAFT_CONTROL only.
P10-06 adds KHOA-EVID-01 through KHOA-EVID-08 as the controlled evidence trace
and external source reconciliation gate for this report view.

## 7. Must Not

This pack must not:

- Create production schema, run production migration or import real teacher data.
- Treat teacher profile, timetable, attendance, teaching evidence or payroll as production reliable.
- Calculate, approve or pay teaching hours, allowance, payroll or HR payment.
- Accept evidence, execute UAT, approve owner signoff or mark production GO.
- Store raw teacher personal data, CCCD, phone lists, bank accounts, vouchers,
  payroll files, passwords, OTPs, reset links, invite links or service-role keys
  in Git/Codex/chat.

## 8. PASS_LOCAL Boundary

Passing the local Khoa/Giang vien check proves only that the M08 gap pack, route
surface, UAT template and local-only stop conditions are present. It does not
approve class delivery reliance, teacher profile reliance, teaching completion,
attendance lock, teaching payment, payroll, evidence acceptance, UAT acceptance,
owner GO/NO-GO or production GO.

Boundary token: does not approve teaching payment.
