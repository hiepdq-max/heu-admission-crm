# HEU System Framework Review 2026-07-02

Status: PASS_LOCAL_FRAMEWORK_REVIEW
Owner: BGH + IT_DATA + KHTC + PHAP_CHE + Audit + process owners
Production status: NO-GO
Decision value: `SYSTEM_FRAMEWORK_READY / NO_GO / BLOCKED`

This document checks whether HEU has a coherent system framework before the
team continues to build with real data. It consolidates the current local state
from inventory, backlog and readiness matrix. It does not approve production,
UAT acceptance, legal position, finance reliance, evidence acceptance, access
grant, migration, bank instruction or owner GO.

## 1. Baseline Sources

| Source | Purpose |
|---|---|
| `docs/HEU_CURRENT_STATE_INVENTORY.md` | Current stage, module status, blockers and risk |
| `docs/HEU_SYSTEM_BUILD_BACKLOG.md` | Build order, owners, gates and audit commands |
| `docs/HEU_MODULE_READINESS_GAP_MATRIX_20260628_V01_DRAFT.md` | What can be coded, what must stay blocked and next gate |
| `docs/HEU_MASTER_CONTROL_GOAL_REGISTER_20260702.md` | Master Control goal, phase order and human-authority boundary |
| `docs/HEU_REAL_DATA_LOGIC_PROFESSIONAL_LEGAL_CONFIRMATION_REGISTER_20260702.md` | Logic, professional, legal and real-data confirmation list |

Current conclusion from these sources: Stage D internal controlled test only.
Production remains `NO-GO`.

## 2. Framework Layers

| Layer | Name | Current state | Required next gate |
|---|---|---|---|
| `L0` | Governance and owner authority | P0 registers, blocker source, owner signoff pack and Master Control goal register exist | Final owner GO/NO-GO outside Git/Codex/chat |
| `L1` | Infrastructure and deployment safety | Git branch, PASS_LOCAL workflow, build/lint/audit guards and backup/restore templates exist | Real backup/restore proof, signed migration order and controlled staging/production split |
| `L2` | Identity, role and workspace scope | Supabase Auth profile link, role/scope packs and P6-04 guards exist | Signed role/workspace UAT with authorized and negative accounts |
| `L3` | Data Master and source model | Data model, dictionary, SQL object map and report-view compatibility bridge exist | Owner signoff for master data, report views and controlled evidence references |
| `L4` | Legal, SOP and evidence control | Legal/SOP/governance matrix, redaction pack and evidence binder exist | PHAP_CHE/KHTC/Audit signoff and controlled Drive evidence IDs |
| `L5` | Business workflow modules | TTGDTX, Finance Desk, CRM handover, HOU and Short Course guards exist at different maturity levels | Signed UAT per module and stop-condition closure |
| `L6` | Finance and accounting controls | Receivable, collection, reconciliation, payout, dashboard and Finance Desk are locally guarded | Signed finance UAT, source reconciliation and reliance decision |
| `L7` | Reports, dashboards and Master Control | BGH dashboard, report-view bridge and daily dry-run reporting exist | Report-view owner signoff and no production reliance until evidence is accepted |
| `L8` | Audit, risk and AI advisory | Audit trail, cascade review, risk guards and AI policy/plan controls exist | Signed audit-log UAT, cascade waiver/conversion and AI scope approval |

## 3. Module Framework Check

| Module | Framework status | Can continue now | Must remain blocked |
|---|---|---|---|
| `M01 Legal` | Partial but controlled | Legal basis checklist, SOP mapping and exception register | Final legal approval or contract interpretation by Codex |
| `M02 HR / Roles` | Partial but controlled | Role/scope UAT support and access-closure tracking | Real account creation or access grant from Codex/chat |
| `M03 Data Master` | Partial foundation | Dictionary, master mapping and report-view compatibility | Destructive schema rename/drop/merge or raw real-data import |
| `M04 SOP / Workflow` | Master Control and workflow guards exist | Read-only workflow/status/control surfaces | Official SOP issuance or owner signoff inference |
| `M05 Tuyen sinh CRM` | Strong internal | Lifecycle and handover UAT support | Handover finalization without finance/legal gates |
| `M06 CTHSSV` | Partial | Student handover readiness checks | Student-state reliance without signed UAT |
| `M07 Dao tao` | Partial | Class/program readiness and gap mapping | Production class or training record reliance |
| `M08 Khoa/Giang vien` | Early | Register and scope discovery | Deep workflow coding before owner process map |
| `M09 Tai chinh/Cong no` | Strong internal but UAT-gated | Read-only finance flow, UAT scripts and exception guards | Auto gach no, voucher posting, payout execution, bank instruction |
| `M10 Dashboard` | Partial and read-only | BGH/Master Control blocker reporting and daily dry-run | Dashboard production reliance or evidence acceptance |
| `M11 AI Agent` | Advisory/control only | Checklist, risk prompts, policy and cloud-agent planning | AI write, approval, payment, evidence acceptance or go-live |
| `M12 Audit/Risk` | Strong internal | Audit trail, waiver queue and risk control | Waiver or hard-delete without owner signature |

## 4. End-To-End Operating Skeleton

| Flow | Current skeleton | Missing before real operation |
|---|---|---|
| `F01` Lead to student handover | P3-01/P3-02 lifecycle and handover guards exist | Signed handover UAT and owner decision |
| `F02` TTGDTX tuition/collection | P2-01 through P2-14 controls exist | Signed finance/legal UAT and invoice/chung-tu confirmation |
| `F03` Partner payment/payout | P2-15 through P2-17 controls exist | BBNT/payment dossier proof, duplicate UAT and payout owner signoff |
| `F04` Accounting dashboard | P2-18 read-only dashboard and source reconciliation exist | Signed dashboard UAT and report-view reliance signoff |
| `F05` Finance Desk | P5-03 read-only cockpit, handoff and accountant guide exist | Signed P5-03 browser UAT, reliance decision and access closure |
| `F06` HOU | Gap pack and route exist | HOU handover UAT, tuition ledger proof and COM policy signoff |
| `F07` Short Course | Gap pack and route exist | Attendance/payment UAT, BHXH/policy and report-view signoff |
| `F08` Production readiness | Blocker source, evidence binder and owner pack exist | Backup/restore proof, migration order, signed UAT, cascade closure and owner GO |

## 5. Framework Strengths

| ID | Strength | Evidence |
|---|---|---|
| `STR-01` | The system has a clear Stage D / NO-GO boundary | Inventory and readiness matrix keep production blocked |
| `STR-02` | TTGDTX finance flow has strong local guards | P2-01 through P2-18 and P5-03 are packaged as PASS_LOCAL |
| `STR-03` | Role/workspace and evidence boundaries are explicit | P6-04, P0-10, P0-14 and P0-17 packs exist |
| `STR-04` | Dashboards are read-only by design | P2-18, P5-02, P5-03 and report-view bridge stay reliance-gated |
| `STR-05` | AI is constrained to advisory/control planning | AI policy, delivery team register and cloud-agent plan are no-write/no-approval |

## 6. Framework Gaps

| ID | Gap | Required owner action |
|---|---|---|
| `GAP-01` | No real backup/restore proof is attached | IT_DATA + Audit must execute restore dry-run and record controlled evidence |
| `GAP-02` | Migration order is unsigned | IT_DATA + KHTC + PHAP_CHE + BGH must sign Step90-Step110 order |
| `GAP-03` | Signed UAT is missing across critical routes | Owners must sign P0-19, P2-17, P2-18, P5-03, P6-03 and P6-04 results |
| `GAP-04` | Finance reliance is not accepted | KHTC + BGH + Audit must sign dashboard/Finance Desk reliance decisions |
| `GAP-05` | Legal and invoice/chung-tu rules still need owner confirmation | PHAP_CHE + KHTC must confirm contract/SOP/tax-document basis |
| `GAP-06` | Hard-delete/cascade findings remain open | IT_DATA + Audit + owners must convert or sign waiver |
| `GAP-07` | HOU and Short Course are not production-ready modules | Respective owners must sign scope, UAT and report-view evidence |
| `GAP-08` | Framework is not yet packaged as a signed owner architecture | BGH + IT_DATA must decide if this review becomes an official architecture pack |

## 7. Required Staff Confirmation

| Confirmation | Owner | Output |
|---|---|---|
| Framework owner | BGH | Whether this is the accepted HEU operating framework |
| Infrastructure owner | IT_DATA | Staging/production split, backup/restore and deployment plan |
| Finance owner | KHTC | Finance rules, UAT results and reliance decisions |
| Legal owner | PHAP_CHE | Contract/SOP/data-sharing and invoice/chung-tu decisions |
| Evidence owner | Audit | Evidence location, redaction and retention rules |
| Process owners | DAO_TAO, CTHSSV, HOU, Short Course | Module scope, UAT and stop conditions |

## 8. Stop Conditions

Stop framework expansion and mark `NO_GO` or `BLOCKED` if:

- Any team treats PASS_LOCAL as production approval.
- Any real data, password, OTP, invite link, bank data, voucher or raw PII is
  placed in Git/Codex/chat.
- Any dashboard or Finance Desk output is used as statutory accounting or bank
  instruction.
- Any owner signature, UAT result, legal basis or finance reliance decision is
  missing.
- Any production migration is attempted before backup/restore proof and signed
  migration order.

## 9. Current Framework Decision

Current decision: `SYSTEM_FRAMEWORK_READY` for controlled internal build
planning only.

Production decision: `NO_GO`.

Next safe work: keep building small PASS_LOCAL framework slices, then route the
framework to BGH, IT_DATA, KHTC, PHAP_CHE, Audit and process owners for written
confirmation before real-data operation.
