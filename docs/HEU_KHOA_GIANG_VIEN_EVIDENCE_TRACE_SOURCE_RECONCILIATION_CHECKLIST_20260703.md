# HEU Khoa/Giang Vien Evidence Trace Source Reconciliation Checklist 2026-07-03

Status: PASS_LOCAL_EVIDENCE_TRACE
Production/UAT status: NO-GO
Decision values: KHOA_EVIDENCE_TRACE_READY / NO_GO / BLOCKED, KHOA_SOURCE_RECONCILIATION_READY / NO_GO / BLOCKED, RV_KHOA_GIANG_VIEN_DELIVERY / NO_GO / BLOCKED

## 1. Purpose

This checklist prepares the P10-06 controlled evidence trace and source
reconciliation packet for M08 Khoa/Giang vien. It connects teacher profile
privacy, negative access, delivery source map, report-view DQ, UAT ledger and
owner signoff rows into one external evidence gate before anyone relies on
`RV_KHOA_GIANG_VIEN_DELIVERY`.

This is local control packaging only. It does not approve report-view reliance,
approve dashboard reliance, accept DQ evidence, accept source reconciliation,
execute UAT, accept evidence, approve teacher profile reliance, approve class
delivery reliance, approve teaching payment, approve payroll, approve owner
GO/NO-GO or mark production GO.

## 2. Required Evidence Rows

| Evidence ID | Control link | Required proof | Owner | Stop condition |
|---|---|---|---|---|
| KHOA-EVID-01 | KHOA-SRC-01 / KHOA-RV-EVID-01 | Faculty/bo mon owner map, program scope, effective date and signer lane are tied to one controlled evidence ref | DAO_TAO + Khoa owner + Audit | Faculty scope is ownerless, guessed from labels or missing controlled evidence |
| KHOA-EVID-02 | KHOA-PRIV-01 through KHOA-PRIV-06 / KHOA-RV-EVID-02 | Teacher profile allowed fields, privacy class, redaction reviewer and HR/PHAP_CHE approval route are linked | HR + PHAP_CHE + IT_DATA | Raw teacher personal data, private contract, salary, allowance, phone, bank or payroll data enters Git/Codex/chat |
| KHOA-EVID-03 | KHOA-SRC-03 / KHOA-DQ-03 / KHOA-RV-EVID-03 | Class, subject/module, assigned teacher, substitute route and change trace have source-owner proof | DAO_TAO + Khoa owner + Audit | Assignment or timetable is relied on without trace |
| KHOA-EVID-04 | KHOA-SRC-04 / KHOA-SRC-05 / KHOA-RV-EVID-04 | Teaching session evidence, completion review and exception route use redacted controlled evidence refs only | DAO_TAO + Khoa owner + Audit | Teaching completion, attendance lock or make-up class is trusted without controlled evidence |
| KHOA-EVID-05 | KHOA-SRC-06 / KHOA-SIGN-04 / KHOA-RV-EVID-05 | Payment/payroll stop proof names formula version, policy owner, finance owner and blocked-payment result | KHTC + HR + Audit | Teaching payment, allowance, payroll, voucher or bank data is calculated, approved or exposed |
| KHOA-EVID-06 | KHOA-SRC-07 / KHOA-DQ-07 / DQ-RV-09 / RV-EVID-07 | Report-view DQ result, source reconciliation result and allowed consumer list are recorded for `RV_KHOA_GIANG_VIEN_DELIVERY` | BGH + IT_DATA + Audit | Dashboard or owner report is used before signed source reconciliation and owner decision |
| KHOA-EVID-07 | KHOA-NEG-01 through KHOA-NEG-08 / KHOA-PRIV-06 | Negative access proof records account label, route, result, redaction reviewer and denial proof for restricted fields | IT_DATA + Audit | OUT_OF_SCOPE_NEGATIVE_USER can view teacher private data, payroll, bank data or restricted class evidence |
| KHOA-EVID-08 | KHOA-UAT-LEDGER-01 through KHOA-UAT-LEDGER-08 / KHOA-SIGN-01 through KHOA-SIGN-06 | UAT result ledger, owner signoff manifest, blocker state and final reviewer decision are linked to controlled evidence refs | Final owner quorum + Audit | PASS_LOCAL, Codex or AI output is treated as signed UAT, evidence acceptance or owner GO |

## 3. Required Closure Fields

| field | required value |
|---|---|
| evidence_id | KHOA-EVID-01 through KHOA-EVID-08 |
| controlled_evidence_ref | Redacted reference in the approved evidence location outside Git/Codex/chat |
| redaction_reviewer | IT_DATA or Audit reviewer outside Codex/chat |
| source_owner_lane | DAO_TAO, Khoa owner, HR, PHAP_CHE, KHTC, BGH, IT_DATA, Audit or final owner quorum |
| linked_source_case | KHOA-SRC-01 through KHOA-SRC-08 |
| linked_dq_case | KHOA-DQ-01 through KHOA-DQ-08 or DQ-RV-09 |
| linked_report_view_evidence | KHOA-RV-EVID-01 through KHOA-RV-EVID-06 and RV-EVID-07 |
| linked_privacy_case | KHOA-PRIV-01 through KHOA-PRIV-06 when teacher profile data is in scope |
| linked_negative_access_case | KHOA-NEG-01 through KHOA-NEG-08 when restricted teacher fields or evidence are in scope |
| linked_uat_case | KHOA-UAT-01 through KHOA-UAT-08 |
| linked_signoff_case | KHOA-SIGN-01 through KHOA-SIGN-06 |
| decision_value | KHOA_EVIDENCE_TRACE_READY / NO_GO / BLOCKED |
| source_reconciliation_value | KHOA_SOURCE_RECONCILIATION_READY / NO_GO / BLOCKED |
| blocker_state | CLOSED, NO_GO or BLOCKED |
| signed_date | Signed date outside Codex/chat |

## 4. Completion Rule

`KHOA_EVIDENCE_TRACE_READY` and `KHOA_SOURCE_RECONCILIATION_READY` are allowed
only when KHOA-EVID-01 through KHOA-EVID-08 each have a controlled external
evidence reference, owner/reviewer lane, source reconciliation result and stop
condition result outside Git/Codex/chat.

Any missing, unsigned, uncontrolled, `NO_GO` or `BLOCKED` row keeps M08,
`RV_KHOA_GIANG_VIEN_DELIVERY`, teacher profile reliance, class-delivery
reliance, teaching completion, teaching payment, payroll and owner closure
locked.

## 5. Forbidden Content

Do not store raw teacher personal data, CCCD, CMND, passport, date of birth,
home address, personal phone, personal email, family data, private contracts,
salary, allowance, payroll files, vouchers, bank accounts, bank statements,
unredacted screenshots, raw Drive URLs, passwords, OTPs, reset links, invite
links, API keys, service-role keys or production credentials in this Git file,
Codex or chat.

## 6. Local Verification

- `docs/HEU_KHOA_GIANG_VIEN_EVIDENCE_TRACE_SOURCE_RECONCILIATION_CHECKLIST_20260703.md`
- `docs/HEU_KHOA_GIANG_VIEN_GAP_PACK_20260703.md`
- `docs/HEU_KHOA_GIANG_VIEN_DELIVERY_SOURCE_MAP_20260703.md`
- `docs/HEU_KHOA_GIANG_VIEN_TEACHER_PROFILE_PRIVACY_REGISTER_20260703.md`
- `docs/HEU_KHOA_GIANG_VIEN_NEGATIVE_ACCESS_CHECKLIST_20260703.md`
- `docs/HEU_KHOA_GIANG_VIEN_UAT_RESULT_LEDGER_TEMPLATE_20260703.md`
- `docs/HEU_KHOA_GIANG_VIEN_OWNER_SIGNOFF_MANIFEST_20260703.md`
- `docs/HEU_REPORT_VIEW_SOURCE_MAP_20260628_V01_DRAFT.md`
- `components/khoa/khoa-giang-vien-gap-pack.tsx`
- `scripts/check-heu-khoa-giang-vien-evidence-trace.mjs`
- `npm.cmd run check:heu-khoa-giang-vien-evidence-trace`

Passing the local check proves only that the evidence trace/source
reconciliation checklist is present and wired into M08 local controls. It does
not prove that any source reconciliation, DQ result, UAT case, evidence package
or owner decision has been executed or accepted.

Boundary token: does not approve report-view reliance, approve dashboard reliance, accept DQ evidence, accept source reconciliation, execute UAT, accept evidence, approve owner GO/NO-GO or mark production GO.
