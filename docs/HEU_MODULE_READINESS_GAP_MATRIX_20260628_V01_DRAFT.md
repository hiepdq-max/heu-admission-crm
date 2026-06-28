# HEU Module Readiness Gap Matrix 2026-06-28 V01 Draft

Status: DRAFT_CONTROL
Owner: BGH + IT_DATA + KHTC + PHAP_CHE + Audit + process owners
Production status: NO-GO

## 1. Purpose

Classify the current HEU build against the P0 register pack and decide what can
be coded next. This matrix is a review/control document only. It does not
approve production, migration, UAT acceptance, finance action, evidence
acceptance or owner Go/No-Go.

## 2. Classification Rule

| Label | Meaning | Allowed next work |
|---|---|---|
| DAT | Enough for controlled internal use/readiness work | Safe UI, audit guard, UAT support, read-only report view |
| CAN_SUA | Foundation exists but has clear gaps | Fix docs, mappings, compatibility views, UAT pack |
| CHUA_DU_DIEU_KIEN | Not enough for deep workflow/dashboard/AI | Review only; create register/runbook first |
| CAM_CODE | Must not be automated or written by Codex now | No production write, no auto approval, no destructive action |

## 3. Evidence Read

This matrix is based on:

- `docs/HEU_ROOT_CONTROL_ACTION_REGISTER_20260627_V01_DRAFT.md`
- `docs/HEU_DATA_MASTER_P0_REGISTER_20260627_V01_DRAFT.md`
- `docs/HEU_SOP_TO_DATA_MAPPING_20260627_V01_DRAFT.md`
- `docs/HEU_REPORT_VIEW_REGISTER_20260627_V01_DRAFT.md`
- `docs/HEU_AI_AGENT_SCOPE_REGISTER_20260627_V01_DRAFT.md`
- `docs/HEU_RISK_CONTROL_SIGNOFF_REGISTER_20260627_V01_DRAFT.md`
- `docs/HEU_CURRENT_STATE_INVENTORY.md`
- `docs/HEU_SQL_OBJECT_MASTER_MAP_20260627.md`
- `docs/HEU_SYSTEM_BUILD_BACKLOG.md`

## 4. Module Readiness Matrix

| Area | Current evidence | Classification | Can code now | Must not code now | Required next gate |
|---|---|---|---|---|---|
| P0 Governance Control | P0 register pack exists; audit pack is PASS_LOCAL; backlog/checklist/inventory include the register pack | DAT | Registry read-only UI, status badges, audit guards, gap-matrix routing | Owner approval, official issuance, Drive file movement | Folder/File Registry, Version Log, Audit Log and Signoff Register checked in controlled Drive |
| Legal Gate | P0-19 legal/finance gate, waiver/exception register, decision manifest and Legal/SOP/Governance control matrix exist for TTGDTX | CAN_SUA | Legal basis checklist, legal/SOP mapping, missing-basis warnings | Treating P0-19 or the control matrix as final legal approval | Signed PHAP_CHE/KHTC UAT and Legal Article Master |
| SOP Gate | SOP-to-data register and Legal/SOP/Governance control matrix exist as DRAFT_CONTROL | CAN_SUA | SOP-to-data map UI, required-SOP checklist, owner routing, evidence-class boundary warnings | SOP automation, official SOP issuance or owner signoff inference | Regulation/SOP owner signoff and Version Log |
| Data Master P0 | Data model, dictionary, SQL object map, P0 master register and Data Master / Report View compatibility draft exist with DQ-DM-05 dashboard reliance lock | CAN_SUA | Compatibility-view design, code policy, dictionary hardening and read-only bridge UI | Destructive rename/drop/merge, real-data import | Cross-module `STUDENT_MASTER`, `CLASS_MASTER`, `COHORT_MASTER` and dashboard reliance owner signoff |
| TTGDTX/9+ Operating Module | P2-01 through P2-19 and Step111 Finance Desk objects are packaged; many guards PASS_LOCAL | DAT | UAT support, read-only dashboard, issue queue, source/evidence checks | Production migration, real payout reliance, auto debt clearing | Backup/restore evidence, signed migration order, signed P0-19/P2 UAT |
| Finance Desk | `/finance-desk`, Step111, MVP spec, UAT runbook and reliance decision manifest exist | DAT for read-only cockpit | Read-only filters, evidence checklist, report-view source map, UAT support | Statutory accounting, voucher posting, bank transfer, payment approval | Signed P5-03 browser UAT and reliance decision |
| Finance Core / Reconciliation | TTGDTX receivable, collection, reconciliation, request, approval and payout chain exists | CAN_SUA | Reconciliation exception views, duplicate-risk warnings, finance UAT scripts | Auto gach no, auto COM, auto payout, auto period lock | Signed finance UAT, real HEU receipt evidence, locked reconciliation proof |
| Report View Register | Draft register lists TTGDTX, HOU, Short Course, Audit and AI views; source map draft, read-only DQ status capture, Data Master bridge and DQ-DM-05 reliance lock exist | CAN_SUA | Report View Register UI, source map, KPI dictionary shell, DQ status capture and master/report compatibility bridge | Dashboard reading raw workbooks/tables or restricted source data | Owner signoff and evidence attachment per report view |
| BGH Dashboard | P5-02 spec, action queue, blocker source and read-only controls exist | CAN_SUA | Read-only blocker dashboard and signed-UAT status views | BGH production reliance or finance conclusion | Signed dashboard UAT and Report View signoff |
| AI Agent Layer | AI policy, task checklist, risk board, scope register and P7-04 prompt/output audit logging design are advisory/read-only | DAT for advisory only | Read-only checklist/risk prompts from approved registers and audit-log design review | AI approval, AI write, AI payment, AI go-live, AI data deletion, AI service call | AI scope registry approval, implemented prompt/output audit logging, signed AI UAT |
| HOU Partnership Module | HOU UI/components and lead/HOU/COM primitives exist; SQL map references HOU programs, majors, terms, commission payees; `docs/HEU_HOU_LEDGER_HANDOVER_GAP_PACK_20260628_V01_DRAFT.md` and `/hou` gap panel now expose HOU-LH-01 through HOU-LH-08 | CAN_SUA | HOU gap review, handover log, HOU ledger spec, report-view source map, UAT support panel | Mixing HOU ledger with TTGDTX, auto COM payout | HOU handover UAT, HOU tuition ledger, HOU commission policy/signoff |
| Short Course / Day Nghe | Short-course route and data primitives exist; SQL map references short class/student/payment/invoice objects; `docs/HEU_SHORT_COURSE_ATTENDANCE_PAYMENT_GAP_PACK_20260628_V01_DRAFT.md` and `/short-course` gap panel now expose SC-AP-01 through SC-AP-08 | CAN_SUA | Attendance/payment/BHXH/meal gate mapping, UAT runbook, report-view source map, UAT support panel | Closing payroll/payment periods without attendance and audit | Signed attendance/payment UAT and Short Course report view signoff |
| Audit / Risk | Audit guards, hard-delete/cascade review and evidence binder exist | DAT for local control | Risk dashboard, waiver queue, audit-log UAT support | Waiving findings without owner signature | P6-03/P6-06 signed UAT or written waiver |
| Backup / Rollback | Backup/restore run sheet and evidence pack exist | CHUA_DU_DIEU_KIEN for production | Operator checklist and evidence manifest support | Production migration | Real backup ID, restore dry-run proof, owner acceptance |

## 5. Finance-Specific Decision

| Finance action | Classification | Reason |
|---|---|---|
| Read-only Finance Desk | DAT | Permission/workspace gate and read-only sources exist |
| Cong no dashboard from approved view | CAN_SUA | Report View Register and DQ-DM-05 reliance lock exist, but signoff and controlled evidence reference are still draft |
| Gach no from receipt | CAM_CODE | Requires real HEU receipt, reconciliation and signed finance UAT |
| COM calculation preview | CAN_SUA | Can be simulated/read-only with clear disclaimer |
| COM payable finalization | CAM_CODE | Requires contract, policy, BBNT, reconciliation lock and approval |
| Partner payout execution | CAM_CODE | Requires signed P2-17 UAT, duplicate guard proof and payment evidence |
| Bank/collateral operation | CAM_CODE | Account-control/collateral scope is deferred and metadata-only |

## 6. Next Build Queue

| Priority | Work item | Classification | Output |
|---|---|---|---|
| 1 | TTGDTX/Finance signed UAT execution support | DAT | `docs/TTGDTX_SIGNED_UAT_EXECUTION_ROUTING_HUB_20260628.md`; `components/ttgdtx/ttgdtx-signed-uat-execution-routing-hub.tsx`; `/ttgdtx`; `SIGNED_UAT_READY / NO_GO / BLOCKED`; UAT-ROUTE-01 through UAT-ROUTE-11; signed UAT and owner signatures still required |
| 2 | Report View Register hardening | CAN_SUA | Source map draft, KPI dictionary shell, read-only `/reports` source-map panel, Data Quality Check status capture, owner signoff capture and DQ-DM-05 reliance lock are created; next gate is report-view owner signoff and evidence attachment |
| 3 | Cross-module Data Master compatibility plan | CAN_SUA | `docs/HEU_DATA_MASTER_REPORT_VIEW_COMPATIBILITY_20260628_V01_DRAFT.md`; `components/reports/data-master-report-view-bridge-panel.tsx`; non-destructive `STUDENT_MASTER`/`CLASS_MASTER`/`COHORT_MASTER` design with DQ-DM-01 through DQ-DM-05; next gate is owner signoff before any production SQL or dashboard reliance |
| 4 | HOU ledger/handover gap pack | CAN_SUA | `docs/HEU_HOU_LEDGER_HANDOVER_GAP_PACK_20260628_V01_DRAFT.md`; `components/hou/hou-ledger-handover-gap-pack.tsx`; `/hou`; `npm.cmd run audit:heu-hou-ledger-handover-gap-pack`; next gate is signed HOU handover UAT, tuition ledger proof and COM policy/signoff |
| 5 | Short Course attendance/payment gap pack | CAN_SUA | `docs/HEU_SHORT_COURSE_ATTENDANCE_PAYMENT_GAP_PACK_20260628_V01_DRAFT.md`; `components/short-course/short-course-attendance-payment-gap-pack.tsx`; `/short-course`; `npm.cmd run audit:heu-short-course-attendance-payment-gap-pack`; next gate is signed attendance/payment UAT, BHXH/policy signoff, source reconciliation and report-view owner signoff |
| 6 | AI scope logging design | CAN_SUA | `docs/HEU_AI_PROMPT_OUTPUT_AUDIT_LOGGING_DESIGN_20260628.md`; prompt/output audit logging design only, no AI write |

## 7. Stop Conditions

Stop and do not code deep workflow when any of these are true:

- The source is a raw workbook, raw bank statement, voucher or uncontrolled
  Drive file.
- The action would mark money received, debt cleared, COM payable, payout paid
  or dashboard production-reliable.
- The action would approve legal, SOP, UAT, migration, finance or owner GO.
- The action would hard-delete, move source evidence or hide audit history.
- The action would let AI write, approve, pay, release, delete or mark go-live.

## 8. Current Conclusion

The build can continue, but only in this order:

1. Signed UAT and evidence routing for TTGDTX/Finance Desk.
2. Report View Register and Data Quality Check Log, including DQ-DM-05
   dashboard reliance lock.
3. Cross-module Data Master compatibility design, now drafted as a read-only
   `/reports` bridge and still blocked from production SQL, real-data import or
   dashboard reliance until owner signoff and controlled evidence references
   exist.
4. HOU gap pack is drafted as PASS_LOCAL; signed HOU handover UAT, tuition
   ledger proof and COM policy/signoff are still required before reliance.
5. Short Course gap pack is drafted as PASS_LOCAL; signed attendance/payment
   UAT, BHXH/policy signoff and report-view owner signoff are still required
   before reliance.
6. AI scope logging design.

Production remains NO-GO until backup/restore, migration order, signed UAT,
hard-delete/cascade closure and final owner Go/No-Go are complete.
