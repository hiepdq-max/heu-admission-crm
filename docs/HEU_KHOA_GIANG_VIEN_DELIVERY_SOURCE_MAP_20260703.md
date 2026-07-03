# HEU Khoa/Giang Vien Delivery Source Map 2026-07-03

Status: DRAFT_CONTROL
Production status: NO-GO
Decision values: KHOA_DELIVERY_SOURCE_READY / NO_GO / BLOCKED, RV_KHOA_GIANG_VIEN_DELIVERY / NO_GO / BLOCKED, KHOA_TEACHER_PROFILE_PRIVACY_READY / NO_GO / BLOCKED, KHOA_NEGATIVE_ACCESS_READY / NO_GO / BLOCKED, KHOA_EVIDENCE_TRACE_READY / NO_GO / BLOCKED, KHOA_SOURCE_RECONCILIATION_READY / NO_GO / BLOCKED

## 1. Purpose

This source map defines the local control contract for
`RV_KHOA_GIANG_VIEN_DELIVERY`. It turns the P10-01 Khoa/Giang vien gap pack into
a report-view source map for faculty scope, teacher profile privacy,
class-delivery assignment, teaching session evidence, payment/payroll stop
rules and owner signoff routing. P10-06 adds
`docs/HEU_KHOA_GIANG_VIEN_EVIDENCE_TRACE_SOURCE_RECONCILIATION_CHECKLIST_20260703.md`
as the controlled evidence trace/source reconciliation gate for this report
view.

This is a PASS_LOCAL control artifact only. It does not create production SQL,
run a migration, import real teacher data, accept evidence, execute UAT,
approve class delivery reliance, approve teaching completion, approve teaching
payment, approve payroll, approve owner GO/NO-GO or mark production GO.

## 2. Source Contract

| Code | Source lane | Current controlled source | Required data quality proof | Stop condition |
|---|---|---|---|---|
| KHOA-SRC-01 | Faculty/bo mon owner map | `admission_departments`, staff/position controls and future owner-signed Khoa register | Faculty code/name, bo mon, owner lane, effective date and program scope are named | Faculty scope is guessed or ownerless |
| KHOA-SRC-02 | Teacher profile allowed fields | `docs/HEU_KHOA_GIANG_VIEN_TEACHER_PROFILE_PRIVACY_REGISTER_20260703.md` plus HR/PHAP_CHE-approved display-field register outside Git/Codex/chat | KHOA-PRIV-01 through KHOA-PRIV-06, teacher identity class, contract route, privacy class and allowed display fields are approved | Raw teacher personal data, CCCD, phone, bank or payroll data enters Git/Codex/chat |
| KHOA-SRC-03 | Class and subject/module assignment | DAO_TAO class/program primitives plus future Khoa assignment register | Class, subject/module, assigned teacher, substitute route and change trace are present | Assignment can change without audit trace |
| KHOA-SRC-04 | Teaching session evidence | Controlled evidence reference outside Git/Codex/chat | Session date, teaching evidence class, attendance/completion state and exception route are present | Teaching completion is trusted without controlled evidence |
| KHOA-SRC-05 | Completion review | DAO_TAO + Khoa owner + Audit review queue | Completion, make-up class, substitute teaching and dispute decision are reviewed | Completion status bypasses owner review |
| KHOA-SRC-06 | Payment/payroll stop rule | KHTC + HR policy/signoff route, not an automated formula | Formula version, finance owner and blocked-payment proof are recorded | System calculates, approves or pays teacher allowance/payroll before signed policy and UAT |
| KHOA-SRC-07 | Report-view signoff | `RV_KHOA_GIANG_VIEN_DELIVERY` in the Report View register and source map plus `docs/HEU_KHOA_GIANG_VIEN_EVIDENCE_TRACE_SOURCE_RECONCILIATION_CHECKLIST_20260703.md` | DQ result, owner signoff route, KHOA-EVID-06 and controlled evidence reference are present | Dashboard is used for reliance before report-view owner signoff |
| KHOA-SRC-08 | Final UAT trace | KHOA-UAT-LEDGER-01 through KHOA-UAT-LEDGER-08 plus `docs/HEU_KHOA_GIANG_VIEN_NEGATIVE_ACCESS_CHECKLIST_20260703.md` and `docs/HEU_KHOA_GIANG_VIEN_EVIDENCE_TRACE_SOURCE_RECONCILIATION_CHECKLIST_20260703.md` | Actor, route, evidence ref, reviewer, negative-access result, KHOA-EVID-01 through KHOA-EVID-08 and owner decision trace are complete | PASS_LOCAL, Codex or AI output is treated as UAT acceptance or owner approval |

## 3. KPI Dictionary Shell

| KPI code | Business definition | Source report view | Allowed use | Forbidden interpretation |
|---|---|---|---|---|
| KPI_KHOA_TEACHER_PROFILE_SCOPE_GAP | Count or list of teacher-profile fields still missing privacy/signoff classification | RV_KHOA_GIANG_VIEN_DELIVERY | HR/PHAP_CHE review queue only | Does not approve teacher profile display in production |
| KPI_KHOA_CLASS_ASSIGNMENT_TRACE_GAP | Count or list of class/module assignments missing substitute route or change trace | RV_KHOA_GIANG_VIEN_DELIVERY | DAO_TAO + Khoa owner assignment review | Does not approve timetable or class delivery reliance |
| KPI_KHOA_DELIVERY_EVIDENCE_TRACE_GAP | Count or list of teaching sessions missing controlled evidence or completion exception route | RV_KHOA_GIANG_VIEN_DELIVERY | Audit and UAT preparation | Does not prove teaching completion, attendance lock or evidence acceptance |
| KPI_KHOA_PAYMENT_BOUNDARY_BLOCKED | Count or list of payment/payroll formulas or claims blocked until policy/UAT signoff | RV_KHOA_GIANG_VIEN_DELIVERY | KHTC + HR risk review | Does not calculate, approve or pay teaching payment/payroll |
| KPI_KHOA_REPORT_VIEW_SIGNOFF_GAP | Count or list of missing DQ result, owner signoff or UAT evidence references for the report view | RV_KHOA_GIANG_VIEN_DELIVERY | BGH/Audit report-view readiness review | Does not make the dashboard production-reliable |

## 4. Data Quality Check Log

| Check ID | Applies to | Required evidence | Stop condition |
|---|---|---|---|
| KHOA-DQ-01 | Faculty/bo mon scope | Owner, faculty/bo mon, program scope and effective date are named | Scope is inferred from labels only |
| KHOA-DQ-02 | Teacher profile privacy | `docs/HEU_KHOA_GIANG_VIEN_TEACHER_PROFILE_PRIVACY_REGISTER_20260703.md`, KHOA-PRIV-01 through KHOA-PRIV-06, allowed fields, privacy class and contract/evidence route are approved | Raw personal, payroll, bank or contract data is exposed |
| KHOA-DQ-03 | Class assignment | Class, subject/module, assigned teacher and substitute route are traceable | Assignment can change without trace |
| KHOA-DQ-04 | Session evidence | Session date, evidence class, attendance/completion state and exception route are traceable | Completion is marked without evidence |
| KHOA-DQ-05 | Completion review | Make-up class, substitute teaching and dispute handling are owner-reviewed | Completion bypasses Khoa owner or Audit |
| KHOA-DQ-06 | Payment/payroll boundary | Formula version, finance owner and blocked-payment proof exist | System calculates or pays before signed policy and UAT |
| KHOA-DQ-07 | Report-view reliance | `RV_KHOA_GIANG_VIEN_DELIVERY` has source map, DQ result, KHOA-EVID-06 source reconciliation result and signoff route | Dashboard is relied on before owner signoff |
| KHOA-DQ-08 | Final UAT trace | KHOA-UAT result ledger has actor, evidence ref, reviewer, KHOA-NEG-01 through KHOA-NEG-08, KHOA-EVID-01 through KHOA-EVID-08 and owner decision | Codex PASS_LOCAL is treated as UAT acceptance or owner GO |

## 5. Evidence Attachment Queue

| Evidence ID | Report view | Required evidence | Decision value | Stop condition |
|---|---|---|---|---|
| KHOA-RV-EVID-01 | RV_KHOA_GIANG_VIEN_DELIVERY | Faculty/bo mon owner map and program scope | KHOA_DELIVERY_SOURCE_READY / NO_GO / BLOCKED | Owner map is missing or unsigned |
| KHOA-RV-EVID-02 | RV_KHOA_GIANG_VIEN_DELIVERY | Teacher profile privacy register, KHOA-PRIV-01 through KHOA-PRIV-06 and allowed display fields | KHOA_TEACHER_PROFILE_PRIVACY_READY / NO_GO / BLOCKED | Raw teacher private data enters Git/Codex/chat |
| KHOA-RV-EVID-03 | RV_KHOA_GIANG_VIEN_DELIVERY | Class/module assignment, substitute route and change trace | KHOA_DELIVERY_SOURCE_READY / NO_GO / BLOCKED | Assignment or timetable is relied on without trace |
| KHOA-RV-EVID-04 | RV_KHOA_GIANG_VIEN_DELIVERY | Session evidence, completion review and exception route | KHOA_DELIVERY_SOURCE_READY / NO_GO / BLOCKED | Teaching completion is trusted without evidence |
| KHOA-RV-EVID-05 | RV_KHOA_GIANG_VIEN_DELIVERY | Payment/payroll stop proof, finance owner and formula version boundary | KHOA_DELIVERY_SOURCE_READY / NO_GO / BLOCKED | Teaching payment, allowance or payroll is calculated or approved |
| KHOA-RV-EVID-06 | RV_KHOA_GIANG_VIEN_DELIVERY | Report-view DQ result, `docs/HEU_KHOA_GIANG_VIEN_EVIDENCE_TRACE_SOURCE_RECONCILIATION_CHECKLIST_20260703.md`, KHOA-UAT ledger, KHOA-NEG-01 through KHOA-NEG-08 and owner signoff route | RV_KHOA_GIANG_VIEN_DELIVERY / KHOA_EVIDENCE_TRACE_READY / NO_GO / BLOCKED | Dashboard or owner report is relied on before signed UAT, negative-access proof, source reconciliation and owner signoff |

## 5A. Evidence Trace / Source Reconciliation Gate

`docs/HEU_KHOA_GIANG_VIEN_EVIDENCE_TRACE_SOURCE_RECONCILIATION_CHECKLIST_20260703.md`
routes KHOA-RV-EVID-01 through KHOA-RV-EVID-06, DQ-RV-09 and RV-EVID-07 into
KHOA-EVID-01 through KHOA-EVID-08 before any dashboard, owner-report or
report-view reliance. The gate records KHOA_EVIDENCE_TRACE_READY / NO_GO /
BLOCKED and KHOA_SOURCE_RECONCILIATION_READY / NO_GO / BLOCKED, but it does
not accept DQ evidence, accept source reconciliation, execute UAT, accept
evidence, approve owner GO/NO-GO or mark production GO.

## 6. Must Not

This source map must not:

- Create or run production schema, SQL migration, import or report-view job.
- Store raw teacher personal data, CCCD, phones, bank details, contract files,
  payroll files, vouchers, passwords, OTPs, invite links or service-role keys in
  Git/Codex/chat.
- Treat teacher profile, timetable, class delivery, attendance/completion,
  controlled evidence, teaching payment, allowance, payroll or dashboard output
  as production reliable.
- Accept evidence, execute UAT, approve owner signoff, approve finance action or
  mark production GO.

## 7. PASS_LOCAL Boundary

Passing the local Khoa/Giang vien delivery source-map check proves only that the
draft source map, report-view register entries, read-only `/khoa` surface and
guard script are present. It does not approve class delivery reliance, teacher
profile reliance, teaching completion, attendance lock, teaching payment,
payroll, evidence acceptance, UAT acceptance, owner GO/NO-GO or production GO.

Boundary token: does not approve teaching payment.
