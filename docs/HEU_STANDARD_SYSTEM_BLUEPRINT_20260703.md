# HEU Standard System Blueprint 2026-07-03

Status: DRAFT_CONTROL
Owner: BGH + IT_DATA + KHTC + PHAP_CHE + Audit + process owners
Production status: NO-GO
Decision value: `STANDARD_SYSTEM_BLUEPRINT_READY / NO_GO / BLOCKED`

This blueprint checks the HEU system as a whole: architecture, business
operation, professional ownership, legal/SOP control and dashboard design. It
is a controlled design artifact only. It does not approve production, UAT,
legal position, evidence acceptance, finance reliance, access grant, migration,
bank instruction, official SOP issuance or owner GO/NO-GO.

## 1. Baseline Read

| Source | Role in this blueprint |
|---|---|
| `docs/HEU_CURRENT_STATE_INVENTORY.md` | Current stage, module state, risks and production blockers |
| `docs/HEU_SYSTEM_BUILD_BACKLOG.md` | Build order, owners, local gates and audit scripts |
| `docs/HEU_MODULE_READINESS_GAP_MATRIX_20260628_V01_DRAFT.md` | What can continue, what must remain blocked and the next gate |
| `docs/HEU_SYSTEM_FRAMEWORK_REVIEW_20260702.md` | Current framework layers and gaps |
| `docs/HEU_REAL_DATA_LOGIC_PROFESSIONAL_LEGAL_CONFIRMATION_REGISTER_20260702.md` | Professional, legal, logic and real-data confirmation loop |
| `docs/HEU_LEGAL_SOP_GOVERNANCE_CONTROL_MATRIX_20260628_V01_DRAFT.md` | Legal/SOP/governance control chain |
| `docs/HEU_EXECUTIVE_ROLE_SCOPE_CLASSIFICATION_20260703.md` | Executive/BGH-equivalent role boundary |
| `components/layout/app-shell.tsx` | Current navigation and permission-gated route surface |
| `lib/workspace.ts` | Current admission workspace selection and segment-scope logic |

Current baseline: HEU is Stage D - internal controlled test only. Production
remains `NO-GO`.

## 2. Current System Verdict

| Area | Finding | Required correction |
|---|---|---|
| Overall architecture | Many module cockpits exist, but the executive operating view is not yet the primary landing experience | Add a role-based `Dashboard Hieu truong / BGH` that summarizes all modules and blockers read-only |
| Business operation | M05 admissions and TTGDTX finance controls are stronger than other modules | Keep module maturity visible and avoid one dashboard implying all modules are ready |
| Professional ownership | Owner lanes exist in registers, but some module decisions still need external staff confirmation | Require named owner lane and evidence ID before any reliance |
| Legal/SOP | Legal/SOP matrix exists, but real legal article/SOP signoff is still external | Keep legal questions as `NO_GO/BLOCKED` until PHAP_CHE confirms |
| Finance | Finance Desk/accounting dashboards are read-only and UAT-gated | No voucher posting, debt clearing, payout, bank instruction or statutory reliance from dashboard output |
| Role/scope | Permissions and workspace checks exist, but executive roles must be consistently treated as BGH-equivalent for read-only overview | Use one executive-role helper in UI, server checks and audit scripts |
| Report views | Report register/source map exists, but dashboard reliance needs owner signoff | Dashboards must read approved report views, not raw workbook/table sources |
| Audit/evidence | Evidence binder and redaction rules exist | Raw PII, bank data, vouchers, passwords, OTPs, invite/reset links and service-role keys stay outside Git/Codex/chat |

## 3. Standard Architecture Layers

| Layer | Name | Standard design | Stop condition |
|---|---|---|---|
| `L0` | Owner governance | BGH owns final GO/NO-GO; every module has owner, checker and approver lane | Owner decision is inferred from PASS_LOCAL |
| `L1` | Infrastructure and deployment safety | Separate local/staging/production; backup/restore proof and signed migration order before production | Migration starts without restore proof or signed order |
| `L2` | Identity, role and workspace | Auth user links to HEU profile, role, permission and workspace scope; negative-access tests are mandatory | Any user sees data outside role/scope |
| `L3` | Legal, SOP and compliance | Legal basis -> SOP -> data source -> workflow gate -> evidence class -> report view -> audit log -> signoff | Legal basis, SOP owner or evidence class is missing |
| `L4` | Data Master and source registry | Student, class, cohort, partner, contract, finance and evidence IDs are controlled master/reference objects | Raw source data is merged, renamed or imported without owner signoff |
| `L5` | Business workflows | Each module has maker/checker/approver, status lifecycle, stop conditions and audit trail | Workflow completes without required owner or UAT evidence |
| `L6` | Finance/accounting control | Finance modules separate receivable, collection, reconciliation, request, approval and payout | Dashboard output is used as voucher, bank or statutory evidence |
| `L7` | Report View layer | Dashboards consume approved report views with source map, DQ status and owner signoff | Dashboard reads uncontrolled workbook/table directly |
| `L8` | Executive dashboard | BGH/Hiệu trưởng sees read-only health, blockers, module maturity, evidence gaps and next actions | Dashboard offers GO/approve/pay/post/migrate actions |
| `L9` | Audit/risk | Every critical action has audit trail, evidence reference, waiver route and redaction class | Evidence or waiver is accepted in chat/Git |
| `L10` | AI advisory | AI may draft, check, summarize and route blockers; it cannot write, approve or execute authority actions | AI sends email, creates real tasks/accounts, approves UAT/finance/owner decision or marks GO |

## 4. Standard Role And Responsibility Model

| Role lane | Standard access | Must not do |
|---|---|---|
| `HIEU_TRUONG` / `PHO_HIEU_TRUONG` / `BGH` | Executive dashboard, Master Control, report overview, risk/blocker queue, read-only module health, final decision package | Daily data entry, finance execution, hidden source editing, bypassing signed UAT |
| `IT_DATA` | Deployment, backup/restore, migration plan, RLS, role/scope, audit triggers, technical checks | Business approval, finance approval, legal conclusion, owner GO |
| `KHTC` | Receivable, collection, reconciliation, invoice/chung-tu, payment request, payout review, Finance Desk reliance decision | Legal interpretation, owner GO, unapproved bank instruction |
| `PHAP_CHE` | Contract basis, legal/SOP mapping, evidence class, data-sharing and compliance route | Finance posting, payment execution, UAT acceptance alone |
| `Audit` | Evidence intake/redaction, audit-log proof, waiver/conversion route, trace sampling | Business operation approval or hidden evidence movement |
| `TUYEN_SINH` | Lead, campaign, partner/source, pipeline, follow-up, document intake and handover preparation | Handover finalization without P3/P0-19 finance/legal gates |
| `CTHSSV` | Student profile/handover readiness and controlled acceptance queue | Student-state reliance without signed handover UAT |
| `DAO_TAO` / `KHOA_GV` | Class/program/teacher delivery readiness, attendance and teaching evidence route | Payroll/payment/dashboard reliance before signed evidence |
| `HOU` / `Short Course owners` | Module-specific scope, handover, ledger, attendance/payment and UAT evidence | COM/payment/attendance finalization without signed scope and evidence |

## 5. Standard Module Map

| Module | Standard purpose | Primary route or surface | Current design decision |
|---|---|---|---|
| `M01 Legal/Phap che` | Legal basis, contracts, SOP authority and evidence class | `/tchc/legal-gates`, legal/SOP registers | `CAN_SUA`; PHAP_CHE signoff required |
| `M02 HR/TCHC/User` | Users, positions, roles, responsibilities and workspace scope | `/settings`, `/settings/scopes`, `/tchc/records-archive` | `CAN_SUA`; signed role/scope UAT required |
| `M03 Data Master` | Student/class/cohort/program/partner/contract master and source registry | `/reports`, Data Master bridge | `CAN_SUA`; owner signoff before reliance |
| `M04 SOP/Workflow` | Gate definitions, maker/checker/approver flow and stop rules | Master Control, workflow registers | `CAN_SUA`; official SOP issuance is external |
| `M05 Tuyen sinh CRM` | Leads, campaign, partner/source, pipeline, documents and handover prep | `/`, `/leads`, `/pipeline`, `/followups`, `/documents`, `/import` | Strong internal, but handover remains UAT/finance/legal gated |
| `M06 CTHSSV` | Student handover/profile readiness | `/cthssv` | `CAN_SUA`; signed CTHSSV UAT and evidence trace required |
| `M07 Dao tao / Short Course` | Training/class/readiness, attendance, BHXH/policy and payment boundary | `/short-course` | `CAN_SUA`; signed attendance/payment, policy and source reconciliation required |
| `M08 Khoa/Giang vien` | Faculty/teacher/profile/privacy/delivery evidence | `/khoa` | `CAN_SUA`; privacy, negative access and owner signoff required |
| `M09 Tai chinh/Cong no` | Receivable, collection, reconciliation, payment request, approval and payout | `/finance-desk`, `/finance/advance-payment`, `/ttgdtx/accounting-dashboard` | Read-only and UAT-gated; no statutory reliance |
| `M10 Dashboard/Reports` | BGH dashboard, report catalog, source map and DQ status | `/reports`, `/master-control`, future executive landing | `CAN_SUA`; owner report-view signoff required |
| `M11 AI Advisory` | Checklist, risk prompts, dry-run reporting and assistant policy | `/ai-assistant`, AI registers | Advisory/control only |
| `M12 Audit/Risk` | Audit log, evidence binder, waiver/conversion and risk queue | `/audit`, Master Control | Strong internal, but signed audit UAT and waiver closure required |

## 6. Standard End-To-End Business Flows

| Flow | Standard path | Required gate before reliance |
|---|---|---|
| `F01 Lead to student` | Lead -> pipeline -> documents -> eligibility/legal/tuition gate -> CTHSSV handover | P3-01/P3-02 signed UAT, P0-19 legal/finance gate and owner handover decision |
| `F02 TTGDTX tuition` | Contract/source -> student receivable -> collection -> invoice/chung-tu decision -> reconciliation | P0-19, P2-10, P2-13/P2-14 signed finance/legal UAT |
| `F03 Payment and payout` | Reconciliation lock -> payment request -> checker/approver -> duplicate guard -> payout evidence | P2-15/P2-17 signed UAT, payment dossier and duplicate proof |
| `F04 Finance Desk` | Approved report views -> read-only cockpit -> reliance decision -> access closure | P5-03 browser UAT, source reconciliation and BGH/KHTC/Audit reliance signoff |
| `F05 HOU` | Lead/handover -> HOU tuition ledger -> COM policy -> report view | HOU handover UAT, tuition ledger proof and COM signoff |
| `F06 Short Course` | Intake -> class/enrollment -> attendance lock -> policy/BHXH -> invoice/payment -> report view | Attendance/payment UAT, policy signoff, invoice/payment verification and role negative-access proof |
| `F07 Khoa/GV` | Teacher/profile privacy -> class delivery source -> evidence trace -> report view | HR/PHAP_CHE privacy approval, signed UAT, source reconciliation and owner signoff |
| `F08 Production closure` | Backup proof -> migration order -> signed UAT -> cascade closure -> owner package | Final BGH/IT_DATA/KHTC/PHAP_CHE/Audit owner GO/NO-GO outside Git/Codex/chat |

## 7. Data And Report Standard

| Standard object | Rule |
|---|---|
| Data master | Use stable IDs and owner-approved definitions for student, class, cohort, partner, contract, program, role and workspace |
| Transaction data | Keep operational transactions separate by module; avoid cross-module mutation unless there is an approved compatibility view |
| Evidence | Store real evidence outside Git/Codex/chat; repo docs may store only redacted evidence IDs, owner lanes and blocker states |
| Report views | Every dashboard metric must declare source view, owner, DQ status, refresh rule and signoff state |
| Finance data | Finance totals are management/reporting outputs until KHTC/BGH/Audit sign reliance; they are not vouchers, bank instructions or statutory books |
| Sensitive data | Raw PII, CCCD, bank data, vouchers, passwords, OTPs, invite/reset links, service-role keys and screenshots with secrets are forbidden in Git/Codex/chat |

## 8. Executive Dashboard Standard

The standard landing experience for `HIEU_TRUONG`, `PHO_HIEU_TRUONG`, `BGH`
and `ADMIN` should not be the admissions-only dashboard. It should be a
read-only executive operating cockpit.

| Section | What it should show | Source rule |
|---|---|---|
| Executive status | Stage, production decision, current blockers and next required owner action | Shared production blocker source and Master Control registers |
| Module health | M01-M12 readiness: `DAT`, `CAN_SUA`, `CHUA_DU_DIEU_KIEN`, `CAM_CODE` | Module readiness gap matrix and focused checkers |
| Admissions overview | Lead, pipeline, documents and handover risks | Admissions report views and workspace scope |
| Finance overview | Receivable/reconciliation/payment dashboard status only | Approved report views, no finance execution |
| Legal/SOP queue | Missing legal basis, SOP owner, evidence class and PHAP_CHE decisions | Legal/SOP/governance matrix |
| Role/scope queue | User activation, role/workspace gaps and negative-access results | P6-04/P0-17 registers and scope checkers |
| Evidence/UAT queue | Missing signed UAT, controlled evidence IDs and redaction reviewer | Evidence binder and signed UAT routing hub |
| Quick access | Master Control, Reports, Audit, Finance Desk read-only, module cockpits | Permission-gated navigation |

Dashboard stop rules:

- No GO button.
- No payment, voucher, bank, migration or UAT approval action.
- No raw source/evidence display.
- No finance/legal conclusion unless the owner decision exists outside
  Git/Codex/chat.
- No dashboard reliance until report-view source map, DQ status and owner
  signoff are complete.

## 9. UI/UX Standard

| Area | Standard |
|---|---|
| Landing page | Role-based: executive users see `Dashboard Hieu truong`; operators see their module workspace |
| Navigation | Group by Quick, Admission, Finance/Reports and Control; keep permission-gated routes visible only when useful |
| Workspace logic | Selected admission segment scopes Lead, Pipeline, Follow-up, Import, Documents, Reports and related module hub |
| Module pages | One page should show one clear objective, current state, blocker queue and next safe action |
| Dashboards | Dense, readable, read-only, with filters/tabs; selected section shows its own details only |
| Warnings | Show `NO_GO/BLOCKED` near the action it blocks; avoid long narrative panels when a table or checklist is clearer |
| Language | Vietnamese UI must be readable, no mojibake before handoff |
| Mobile/desktop | Fixed toolbar/control dimensions, no overflow, no hidden critical actions |

## 10. Legal And Compliance Standard

Every controlled workflow must pass this chain:

Legal basis -> SOP owner -> data source -> workflow gate -> evidence class ->
report view -> audit log -> signoff register -> owner decision.

Required PHAP_CHE/KHTC/Audit confirmations before real reliance:

| ID | Confirmation |
|---|---|
| `LEGAL-STD-01` | Which contract/legal article controls each program, partner and payment case |
| `LEGAL-STD-02` | Which SOP version authorizes each workflow step |
| `LEGAL-STD-03` | Which invoice/chung-tu rule applies by collection/payment scenario |
| `LEGAL-STD-04` | Which evidence class and retention rule applies to each file type |
| `LEGAL-STD-05` | Which roles may see legal, finance, student, teacher and evidence metadata |
| `LEGAL-STD-06` | Who may sign waiver, exception and final owner GO/NO-GO |

## 11. Standard Build Order

| Phase | Objective | Output |
|---|---|---|
| `A` | Stabilize state and dirty scope | Current-state/backlog/gap matrix and focused guard green |
| `B` | Standardize identity and role/scope | Executive-role helper, role matrix, negative-access tests |
| `C` | Build executive read-only dashboard | `Dashboard Hieu truong/BGH` with module health and blocker queue |
| `D` | Standardize report-view reliance | Source map, DQ status, owner signoff and controlled evidence IDs |
| `E` | Close legal/SOP/professional gaps | PHAP_CHE/KHTC/Audit/process-owner confirmation rows |
| `F` | Execute signed UAT and evidence closure | Signed UAT package, access closure, evidence redaction, audit trace |
| `G` | Production readiness decision | Backup/restore proof, signed migration order, cascade closure and final owner GO/NO-GO |

## 12. Immediate Design Priorities

| Priority | Work item | Boundary |
|---|---|---|
| `STD-01` | Convert `/` from admissions-only for executive roles into `Dashboard Hieu truong/BGH` read-only cockpit | PASS_LOCAL_UI; no finance action, no owner GO |
| `STD-02` | Create one shared executive-role classification used by UI, workspace and route checks | PASS_LOCAL_GUARD; no access grant by itself |
| `STD-03` | Connect dashboard cards to approved report-view/source-map states | PASS_LOCAL_UI; `NO_DASHBOARD_RELIANCE` without owner signoff and `DQ-DM-05` |
| `STD-04` | Make legal/SOP queue visible next to affected module | PASS_LOCAL_UI; `NO_LEGAL_ADVICE`, no official SOP issuance, no owner approval |
| `STD-05` | Add module maturity row for M01-M12 with next required owner action | PASS_LOCAL_UI; `NO_UAT_ACCEPTANCE`, no evidence/report-view/finance/owner approval |
| `STD-06` | Keep Finance Desk and accounting dashboards read-only until signed P5-03/P2-18 reliance | No voucher, payment, bank instruction or statutory accounting |

## 13. Current NO-GO Blockers

| Blocker | Owner lane |
|---|---|
| Real backup/restore proof is missing | IT_DATA + Audit |
| Signed Step90-Step110 migration order is missing | IT_DATA + BGH + KHTC + PHAP_CHE |
| Critical signed UAT packages are missing | BGH + process owners + Audit |
| Finance Desk/accounting dashboard reliance is unsigned | KHTC + BGH + Audit |
| Legal invoice/chung-tu/SOP confirmations are incomplete | PHAP_CHE + KHTC |
| Hard-delete/cascade conversion or waiver is not closed | IT_DATA + Audit + affected owners |
| Final owner GO/NO-GO is not signed outside Git/Codex/chat | BGH + accountable owners |

## 14. Current Blueprint Decision

`STANDARD_SYSTEM_BLUEPRINT_READY` for controlled internal design and next
PASS_LOCAL implementation slices.

Production remains `NO-GO`.

`STD-01` is implemented as a PASS_LOCAL_UI slice: `/` now routes
`HIEU_TRUONG`, `PHO_HIEU_TRUONG`, `BGH` and `ADMIN` into a read-only executive
dashboard with module health, blocker queues, report-view quick access and
permission-gated links. It does not approve finance reliance, UAT, legal
position, evidence acceptance, access closure, owner GO/NO-GO or production GO.

`STD-02` guard baseline is implemented through
`scripts/check-heu-executive-dashboard-readiness.mjs` and
`npm.cmd run check:heu-executive-dashboard-readiness`. The guard checks the
shared executive-role helper, workspace all-segment read scope, `/` executive
dashboard route, executive no-create quick action boundary, read-only dashboard
anchors, permission-gated quick links and report-view reliance stop conditions.
It does not grant access, approve report-view reliance, execute UAT, accept
evidence, approve finance action, approve owner GO/NO-GO or mark production GO.

`STD-03` is implemented as a PASS_LOCAL_UI/readiness slice in the executive
dashboard. It adds the `STD-03_REPORT_RELIANCE_QUICK_STATUS` report-view
reliance strip for `RV_TTGDTX_FINANCE_SUMMARY`, `RV_HOU_LEDGER_SUMMARY`,
`RV_SHORT_COURSE_ATTENDANCE_PAYMENT` and `RV_AUDIT_RISK_CONTROL`, with
`OWNER_SIGNOFF_PENDING`, `DQ-DM-05`, `NO_DASHBOARD_RELIANCE`,
`NO_FINANCE_ACTION`, `NO_OWNER_GO` and `NO_PRODUCTION_RELIANCE` boundaries.
It does not approve report-view reliance, dashboard reliance, finance action,
UAT acceptance, evidence acceptance, owner GO/NO-GO or production GO.

`STD-04` is implemented as a PASS_LOCAL_UI/read-only owner-action queue in the
executive dashboard. It adds `STD-04_LEGAL_SOP_OWNER_ACTION_QUEUE` for
`LEGAL-STD-01` through `LEGAL-STD-06`, covering legal-basis review, SOP owner
signoff, invoice/chung-tu policy, evidence class, sensitive metadata role scope
and external owner decision authority. It remains `DRAFT_CONTROL` with
`NO_LEGAL_ADVICE`, `NO_OFFICIAL_SOP`, `NO_OWNER_APPROVAL`, `NO_ACCESS_GRANT`,
`NO_FINANCE_ACTION` and `NO_PRODUCTION_GO` boundaries.

`STD-05` is implemented as a PASS_LOCAL_UI/read-only module maturity action row
in the executive dashboard. It adds `STD-05_MODULE_MATURITY_ACTION_ROW` for
`M01` through `M12`, showing one compact status and one required owner action
per module. It keeps `NO_UAT_ACCEPTANCE`, `NO_EVIDENCE_ACCEPTANCE`,
`NO_REPORT_VIEW_RELIANCE`, `NO_FINANCE_ACTION`, `NO_OWNER_GO` and
`NO_PRODUCTION_GO` boundaries.

The next safe implementation slice is `STD-06`: keep Finance Desk and
accounting-dashboard actions visibly read-only from the executive dashboard
while exposing the exact missing signed P5-03/P2-18 reliance proof, without
posting vouchers, paying, issuing bank instructions or approving finance
reliance.
