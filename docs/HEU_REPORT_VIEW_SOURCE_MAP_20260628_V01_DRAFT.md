# HEU Report View Source Map 2026-06-28 V01 Draft

Status: DRAFT_CONTROL
Owner: BGH + IT_DATA + KHTC + Audit + process owners
Production status: NO-GO

## 1. Purpose

Harden the Report View Register by mapping each logical report view to the
current controlled source objects in the HEU app. This source map is read-only
planning/control. It does not approve dashboard production reliance, finance
action, statutory accounting, UAT acceptance, evidence acceptance or owner
Go/No-Go.

## 2. Dashboard Source Rule

Dashboard -> Report View -> Physical Source -> Data Quality Check -> Owner
Signoff -> UAT Evidence.

Any dashboard is CHUA_DU_DIEU_KIEN when it reads raw workbooks, raw bank
statements, vouchers, uncontrolled Drive files, unrestricted tables or
unapproved sensitive data.

## 3. Source Map

| Logical report view | Current controlled source | Consumer | Data quality check | Owner signoff | Current status |
|---|---|---|---|---|---|
| RV_TTGDTX_FINANCE_SUMMARY | `ttgdtx_accounting_dashboard_summary`; `ttgdtx_accounting_dashboard_partner_board`; `ttgdtx_accounting_dashboard_control_board`; `heu_finance_desk_summary` | `/finance-desk`; `/ttgdtx/accounting-dashboard`; BGH blocker summary | P2-18 dashboard source reconciliation; P5-03 Finance Desk UAT | KHTC + BGH + IT_DATA + Audit | SOURCE_MAP_DRAFT |
| RV_TTGDTX_CONG_NO_THUC_THU | `ttgdtx_student_receivable_readiness`; `ttgdtx_tuition_payment_board`; `ttgdtx_collection_summary`; `ttgdtx_accounting_dashboard_summary` | Finance Desk; accounting dashboard | Receivable/payment lifecycle; actual HEU receipt and reconciliation evidence | KHTC + Audit | SOURCE_MAP_DRAFT |
| RV_TTGDTX_COM_CHI_TRA | `ttgdtx_partner_payment_request_board`; `ttgdtx_partner_payment_approval_board`; `ttgdtx_partner_payment_execution_board`; `ttgdtx_partner_payment_disbursement_recent` | Finance Desk; payment request/pay routes | BBNT/partner invoice dossier; duplicate payout guard; payout execution readiness | KHTC + PHAP_CHE + BGH + Audit | SOURCE_MAP_DRAFT |
| RV_TTGDTX_UAT_READINESS | `lib/production-readiness.ts`; `TTGDTX_PRODUCTION_OWNER_SIGNOFF_PACK_20260627.md`; UAT operator handoff docs; current-state inventory | Master Control; TTGDTX landing guard | P0-03/P0-09/P0-13/P0-14/P0-15 evidence path checks | BGH + IT_DATA + KHTC + PHAP_CHE + Audit | SOURCE_MAP_DRAFT |
| RV_HOU_LEDGER_SUMMARY | `leads` HOU fields; `hou_programs`; `hou_majors`; `hou_locations`; `hou_admission_stages`; `hou_financial_policies`; `hou_commission_claims`; `hou_commission_claim_lines`; `hou_commission_payment_batches`; `hou_commission_payment_lines`; `hou_evidence_files` | `/hou`; HOU workspace | HOU handover, tuition confirmation, evidence and commission policy checks | HOU owner + KHTC + IT_DATA + Audit | SOURCE_MAP_DRAFT |
| RV_SHORT_COURSE_ATTENDANCE_PAYMENT | `short_course_data_foundation_summary`; `short_course_dashboard_kpis`; `short_course_exception_summary`; `short_course_exception_register`; `short_attendance_session_readiness`; `short_bhxh_policy_case_readiness`; `short_finance_invoice_readiness`; `short_payment_readiness` | `/short-course`; Short Course dashboard | Class/student/attendance/payment linkage; exception register; attendance lock evidence | DAO_TAO + KHTC + IT_DATA + Audit | SOURCE_MAP_DRAFT |
| RV_AUDIT_RISK_CONTROL | `audit_logs`; hard-delete/cascade finding register; controlled evidence binder docs; risk/signoff register | `/audit`; Master Control; BGH blocker summary | P6-03 audit-log UAT; P6-06 conversion/waiver decision | Audit + IT_DATA + affected owners | SOURCE_MAP_DRAFT |
| RV_AI_ALLOWED_CONTEXT | `HEU_AI_ASSISTANT_POLICY_20260627.md`; `HEU_AI_AGENT_SCOPE_REGISTER_20260627_V01_DRAFT.md`; Data Dictionary; Report View Register; Risk Control Signoff Register | `/ai-assistant`; AI checklist/risk boards | AI scope, no raw restricted data, prompt/output audit design | BGH + IT_DATA + Audit | SOURCE_MAP_DRAFT |

## 4. KPI Dictionary Shell

| KPI code | Business definition | Source report view | Allowed use | Forbidden interpretation |
|---|---|---|---|---|
| KPI_TTGDTX_TOTAL_RECEIVABLE | Expected tuition/receivable amount by approved TTGDTX context | RV_TTGDTX_CONG_NO_THUC_THU | Read-only monitoring and UAT reconciliation | Does not prove legal collectability or production-ready debt |
| KPI_TTGDTX_ACTUAL_COLLECTION | Amount recorded as collected in controlled TTGDTX payment views | RV_TTGDTX_CONG_NO_THUC_THU | Compare with reconciliation and source evidence | Does not replace bank reconciliation or HEU actual receipt proof |
| KPI_TTGDTX_RECON_LOCKED | Amount/period that reached locked reconciliation state | RV_TTGDTX_FINANCE_SUMMARY | Payment-request readiness review | Does not auto approve payment request |
| KPI_TTGDTX_PENDING_PAYOUT | Approved/requested partner amount not yet fully paid in controlled views | RV_TTGDTX_COM_CHI_TRA | Duplicate-risk and payout-readiness monitoring | Does not authorize payout |
| KPI_FINANCE_DESK_SOURCE_EXCEPTIONS | Import/source/evidence items needing review | RV_TTGDTX_FINANCE_SUMMARY | KHTC work queue and UAT notes | Does not accept evidence or waive missing files |
| KPI_HOU_HANDOVER_READY | HOU leads with program/major/location/stage and handover indicators | RV_HOU_LEDGER_SUMMARY | HOU follow-up and gap review | Does not confirm official HOU enrollment |
| KPI_HOU_COM_RISK | HOU commission claims with high-risk/dropout/debt-offset signals | RV_HOU_LEDGER_SUMMARY | KHTC/Audit review queue | Does not finalize COM payable |
| KPI_SHORT_ATTENDANCE_LOCK_GAP | Short-course classes/sessions needing attendance lock/approval | RV_SHORT_COURSE_ATTENDANCE_PAYMENT | Attendance/payment UAT preparation | Does not approve BHXH, meal or HR payment |
| KPI_SHORT_PAYMENT_READY | Short-course payment records ready for verification in controlled views | RV_SHORT_COURSE_ATTENDANCE_PAYMENT | Payment verification queue | Does not close payment period |
| KPI_AUDIT_OPEN_CRITICAL | Open critical audit/risk/cascade findings | RV_AUDIT_RISK_CONTROL | Owner blocker dashboard | Does not waive findings |
| KPI_AI_ALLOWED_SCOPE | AI-readable context is restricted to approved docs/report views | RV_AI_ALLOWED_CONTEXT | AI pilot readiness review | Does not enable AI production action |

## 5. Data Quality Check Log Shell

| Check ID | Applies to | Required evidence | Stop condition |
|---|---|---|---|
| DQ-RV-01 | All report views | Owner, physical source and allowed consumer are listed | Missing owner or source |
| DQ-RV-02 | Finance/TTGDTX views | P2-18 source reconciliation and P5-03 UAT references | Totals drift or source view missing |
| DQ-RV-03 | Cong no/thuc thu | Receipt, payment and reconciliation status are traceable | Dashboard claims real HEU receipt without evidence |
| DQ-RV-04 | COM/chi tra | Contract, BBNT, partner invoice, approval and duplicate guard are traceable | COM finalization or payout is implied |
| DQ-RV-05 | HOU | HOU ledger remains separate from TTGDTX and Short Course | HOU data is mixed into TTGDTX ledger |
| DQ-RV-06 | Short Course | Class, student, attendance, invoice and payment linkage exists | Payment period is closed without attendance/audit |
| DQ-RV-07 | Audit/Risk | Audit log and owner decision references are visible | Waiver is shown without signed owner decision |
| DQ-RV-08 | AI | AI source is approved read-only context only | AI reads raw restricted data or writes workflow state |

## 6. Evidence Attachment Queue

| Evidence ID | Report view | Required evidence | Decision value | Stop condition |
|---|---|---|---|---|
| RV-EVID-01 | RV_TTGDTX_FINANCE_SUMMARY | P2-18 source reconciliation; P5-03-TRIAL-EVID-001 through P5-03-TRIAL-EVID-005 | P5_03_CONTROLLED_TRIAL_READY / NO_GO / BLOCKED | Finance Desk or accounting dashboard is used for reliance before signed evidence and owner decision exist |
| RV-EVID-02 | RV_TTGDTX_UAT_READINESS | P0-03 backup/restore proof; P0-09 owner signoff pack; P0-14 evidence binder; P0-15 final handoff | SIGNED_UAT_READY / NO_GO / BLOCKED | Owner Go/No-Go is requested before UAT routes and blocker proof are attached |
| RV-EVID-03 | RV_TTGDTX_COM_CHI_TRA | BBNT; partner invoice dossier; duplicate payout proof; payout release decision | PAYOUT_RELEASE_READY / NO_GO / BLOCKED | COM finalization or payout is implied before P2-17 evidence and owner approval |
| RV-EVID-04 | RV_HOU_LEDGER_SUMMARY | HOU handover UAT; tuition ledger proof; commission policy signoff | HOU_LEDGER_READY / NO_GO / BLOCKED | HOU ledger is mixed with TTGDTX or Short Course before HOU owner signoff |
| RV-EVID-05 | RV_SHORT_COURSE_ATTENDANCE_PAYMENT | Short Course attendance/payment UAT; BHXH policy proof; report-view signoff | SC_ATTENDANCE_PAYMENT_READY / NO_GO / BLOCKED | Payment period is relied on before attendance lock and finance evidence are signed |
| RV-EVID-06 | RV_AUDIT_RISK_CONTROL / RV_AI_ALLOWED_CONTEXT | P6-03 audit-log UAT; P6-06 conversion-or-waiver decision; AI scope approval | AUDIT_AI_SCOPE_READY / NO_GO / BLOCKED | Risk waiver, AI scope or audit trace is treated as accepted without owner evidence |

The queue names controlled evidence references only. It does not upload files,
accept evidence, approve signoff, waive blockers or store raw evidence in
Git/Codex/chat.

## 7. Allowed Next Build

| Build item | Allowed scope | Not allowed |
|---|---|---|
| Report View Register UI | Show logical view, owner, source, status, DQ checks and signoff need | Edit source data or approve signoff |
| KPI Dictionary UI | Show definitions, source view and forbidden interpretation | Mark KPI production-reliable |
| Data Quality Check Log UI | Record local/UAT check results and blockers | Accept real evidence or waive blocker |
| Dashboard source badge | Show which report view a dashboard reads | Hide raw-source dependency or bypass scope |

## 8. Production Boundary

Report views remain DRAFT_CONTROL until owner signoff and UAT evidence exist.
Production remains NO-GO until backup/restore, migration order, signed UAT,
hard-delete/cascade closure and final owner Go/No-Go are complete.
