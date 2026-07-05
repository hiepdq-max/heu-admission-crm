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
| `lib/heu-role-lanes.ts` | Shared role-lane matrix for executive, KHTC, PHAP_CHE, IT_DATA and Audit boundaries |
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
| `STD-06` | Keep Finance Desk and accounting dashboards read-only until signed P5-03/P2-18 reliance | PASS_LOCAL_UI; `NO_VOUCHER`, `NO_PAYMENT`, `NO_BANK_INSTRUCTION`, `NO_STATUTORY_ACCOUNTING` |
| `STD-07` | Add executive section navigator/focus filter for quick access | PASS_LOCAL_UI; `NO_HIDDEN_NO_GO`, no approval action, no state mutation |
| `STD-08` | Tighten responsive dashboard density and section ordering | PASS_LOCAL_UI; `NO_HIDDEN_BLOCKERS`, `NO_OVERLAP`, no production GO language |
| `STD-09` | Add local visual QA guard for executive dashboard source layout and auth route | PASS_LOCAL_VISUAL_QA; `AUTH_REQUIRED` until approved authenticated browser session; `NO_SCREENSHOT_CLAIM` |
| `STD-10` | Run authenticated desktop/mobile screenshot QA with approved test session | `AUTH_REQUIRED` until approved test account/session; no approval action, no UAT acceptance |
| `STD-11` | Add executive priority focus rail for top blocker lanes | PASS_LOCAL_UI; `NO_HIDDEN_NO_GO`, `NO_STATE_MUTATION`, no approval action |
| `STD-12` | Standardize HEU role-lane governance matrix before finance/operations reliance | PASS_LOCAL_ROLE_GUARD; `NO_ACCESS_GRANT`, no finance execution, no legal conclusion |
| `STD-13` | Lock report-view/source-map reliance contract before dashboard reliance | PASS_LOCAL_REPORT_SOURCE_GUARD; `NO_DASHBOARD_RELIANCE`, no raw workbook/table, no statutory accounting |
| `STD-14` | Add Legal/SOP authority checklist for legal basis, SOP, maker/checker/approver, evidence and signer | PASS_LOCAL_LEGAL_SOP_GUARD; `PHAP_CHE_REVIEW_REQUIRED`, no legal advice, no official SOP |
| `STD-15` | Add finance reliance source contract for receivable, collection, reconciliation, payment request and payout evidence | PASS_LOCAL_FINANCE_RELIANCE_GUARD; `SOURCE_MAP_REQUIRED`, `NO_PAYMENT_EXECUTION`, no statutory accounting |
| `STD-16` | Add executive UAT/evidence route checklist for P0-14, P6-04, P2-18, P5-03 and owner decision package | PASS_LOCAL_EVIDENCE_ROUTE; `SIGNED_UAT_PENDING`, `NO_EVIDENCE_ACCEPTANCE`, no access closure |
| `STD-17` | Add executive focus mode so BGH can open only reports, finance, evidence, legal/SOP, modules or blockers | PASS_LOCAL_FOCUS_MODE; `FOCUS_QUERY_PARAM`, `NO_STATE_MUTATION`, no hidden NO-GO |
| `STD-18` | Add executive focus next-action card so the active focus always shows one owner lane, target and stop rule | PASS_LOCAL_NEXT_ACTION; `READ_ONLY_ROUTE_HINT`, `NO_STATE_MUTATION`, no approval action |
| `STD-19` | Add executive global focus shortcuts in AppShell so BGH can jump to focus modes from any screen | PASS_LOCAL_GLOBAL_FOCUS_SHORTCUTS; `EXECUTIVE_ONLY`, `READ_ONLY_ROUTE_HINT`, no access grant |
| `STD-20` | Separate executive focus shortcuts from workspace quick links so BGH navigation is not mixed with operational workspace actions | PASS_LOCAL_FOCUS_LANE_SEPARATION; `SEPARATE_FROM_WORKSPACE`, no access grant |
| `STD-21` | Add compact AppShell lane labels so BGH focus and workspace actions are visually scannable without long helper text | PASS_LOCAL_QUICK_LANE_LABELS; `COMPACT_LABELS`, `NO_LONG_COPY`, no access grant |
| `STD-22` | Scope executive section navigator to the active focus so hidden sections are not linked | PASS_LOCAL_FOCUS_SCOPED_NAVIGATOR; `VISIBLE_SECTION_LINKS_ONLY`, `NO_HIDDEN_TARGET_LINK`, no state mutation |
| `STD-23` | Add executive role/scope focus so BGH can check correct-person/correct-work boundaries quickly | PASS_LOCAL_EXECUTIVE_ROLE_SCOPE; `P6-04_ROLE_SCOPE_UAT_PENDING`, `NEGATIVE_ACCESS_PROOF_PENDING`, no access grant |
| `STD-24` | Add executive report/source-map triage so BGH checks source contract before trusting dashboard numbers | PASS_LOCAL_REPORT_SOURCE_TRIAGE; `REPORT_VIEW_MASTER_CONTRACT`, `DQ-DM-05`, `NO_DASHBOARD_RELIANCE` |
| `STD-25` | Add executive Legal/SOP triage so BGH checks legal basis, SOP, maker/checker/approver, evidence and signer route before action | PASS_LOCAL_LEGAL_SOP_TRIAGE; `PHAP_CHE_REVIEW_REQUIRED`, `MAKER_CHECKER_APPROVER_REQUIRED`, no legal advice |
| `STD-26` | Add executive Finance reliance triage so BGH/KHTC checks P2-18, P5-03, Finance Day-1, role proof and owner reliance decision before trusting finance numbers | PASS_LOCAL_FINANCE_RELIANCE_TRIAGE; `SIGNED_UAT_PENDING`, `NO_PAYMENT_EXECUTION`, no finance reliance |
| `STD-27` | Add executive UAT/evidence closure triage so BGH checks controlled evidence, signed UAT route, access closure dependency and owner decision pack before closing blockers | PASS_LOCAL_UAT_EVIDENCE_TRIAGE; `CONTROLLED_EVIDENCE_REQUIRED`, `NO_EVIDENCE_ACCEPTANCE`, no UAT acceptance |
| `STD-28` | Add executive production blocker owner triage so BGH checks backup/restore, migration signoff, signed UAT closure, finance/legal reliance and final owner packet before any production discussion | PASS_LOCAL_PRODUCTION_BLOCKER_TRIAGE; `BACKUP_RESTORE_PROOF_REQUIRED`, `OWNER_SIGNOFF_PENDING`, no production GO |
| `STD-29` | Convert executive priority focus cards into command-strip links that open focused dashboard views instead of only jumping to anchors inside the long page | PASS_LOCAL_PRIORITY_COMMAND_STRIP; `FOCUS_QUERY_PARAM`, `VISIBLE_FOCUS_ONLY`, no state mutation |
| `STD-30` | Show the active focus state in the executive overview header with a return-to-all route hint | PASS_LOCAL_ACTIVE_FOCUS_HEADER; `ACTIVE_FOCUS_VISIBLE`, `RETURN_TO_ALL`, no state mutation |
| `STD-31` | Compact executive global focus labels in AppShell so BGH can jump to focused views without long mixed-language labels | PASS_LOCAL_GLOBAL_FOCUS_COMPACT_LABELS; `COMPACT_LABELS`, `NO_LONG_COPY`, no access grant |
| `STD-32` | Add executive department role-lane map so BGH can see correct-person/correct-work boundaries by department | PASS_LOCAL_DEPARTMENT_ROLE_LANE_MAP; `EXECUTIVE_OVERSIGHT`, `NO_ACCOUNT_CREATE`, `NO_ROLE_ASSIGNMENT`, no access grant |
| `STD-33` | Add executive report source fast index so BGH can scan report-view, source route, DQ, evidence and stop rule in one table | PASS_LOCAL_REPORT_SOURCE_FAST_INDEX; `REPORT_VIEW_SOURCE_INDEX`, `DQ_DM05_VISIBLE`, `NO_RAW_SOURCE_OPEN`, no dashboard reliance |
| `STD-34` | Add executive Legal/SOP required-answer index so BGH can scan legal basis, SOP, maker/checker/approver, evidence and signer by workflow | PASS_LOCAL_LEGAL_SOP_REQUIRED_ANSWER_INDEX; `REQUIRED_ANSWER_INDEX`, `NO_LEGAL_ADVICE`, no official SOP |
| `STD-35` | Add executive Finance reliance fast index so BGH/KHTC can scan source contract, proof, decision gate and forbidden finance action by route | PASS_LOCAL_FINANCE_RELIANCE_FAST_INDEX; `FINANCE_RELIANCE_INDEX`, `NO_PAYMENT_EXECUTION`, no finance reliance |
| `STD-36` | Add executive UAT/evidence fast action queue so BGH can open the right owner/evidence lane first for P0-14, P6-04, P2-18/P5-03, legal/SOP, audit/cascade and owner packet closure | PASS_LOCAL_UAT_EVIDENCE_FAST_ACTION_QUEUE; `FAST_ACTION_QUEUE`, `NO_EVIDENCE_UPLOAD`, no evidence acceptance |
| `STD-37` | Add dashboard scope visibility invariant so every dashboard view is limited by executive all-segment read-only permission, active segment or visible segment scope | PASS_LOCAL_DASHBOARD_SCOPE_VISIBILITY; `SCOPE_BOUND_DASHBOARD`, `NO_CROSS_SCOPE_DASHBOARD`, no access grant |
| `STD-38` | Add executive dashboard permission matrix so BGH can see which runtime permission opens Master Control, Finance Desk, scope control, report source map, Legal/SOP and Audit routes | PASS_LOCAL_EXECUTIVE_DASHBOARD_PERMISSION_MATRIX; `ROUTE_VISIBILITY_MATRIX`, `runtimePermissionGate`, no access grant or permission expansion |
| `STD-39` | Add report-dashboard scope contract so every executive report view declares its dashboard consumer, scope gate, source contract and reliance blocker before any dashboard number is trusted | PASS_LOCAL_REPORT_DASHBOARD_SCOPE_CONTRACT; `REPORT_VIEW_TO_DASHBOARD_SCOPE`, `SCOPE_BOUND_DASHBOARD`, no report-view or dashboard reliance |
| `STD-40` | Add `STD-40_EXECUTIVE_LEGAL_SOP_EVIDENCE_AUTHORITY_QUEUE` so BGH can route missing legal basis, SOP version, maker/checker/approver, evidence location and external signer before relying on any workflow | PASS_LOCAL_LEGAL_SOP_EVIDENCE_AUTHORITY_QUEUE; `EVIDENCE_AUTHORITY_QUEUE`, `LAW-QUEUE-01`, `LAW-QUEUE-06`, `NO_RAW_EVIDENCE_MOVEMENT`, `NO_EVIDENCE_ACCEPTANCE`, `NO_UAT_ACCEPTANCE`, no UAT/evidence acceptance |
| `STD-41` | Add `STD-41_EXECUTIVE_FINANCE_READONLY_RELIANCE_LOCK` so BGH/KHTC can see finance blockers without treating dashboard numbers as debt clearing, vouchers, invoices, payment execution, bank instruction or statutory accounting | PASS_LOCAL_FINANCE_READONLY_RELIANCE_LOCK; `RELIANCE_LOCK`, `FIN-LOCK-01`, `FIN-LOCK-06`, `NO_DEBT_CLEARING`, `NO_INVOICE_ISSUANCE`, `NO_MONEY_MOVEMENT`, no finance reliance |
| `STD-42` | Add `STD-42_EXECUTIVE_UAT_EVIDENCE_ACCEPTANCE_LOCK` so BGH can distinguish visible UAT/evidence route status from signed acceptance before closing any blocker | PASS_LOCAL_UAT_EVIDENCE_ACCEPTANCE_LOCK; `ACCEPTANCE_LOCK`, `UAT-LOCK-01`, `UAT-LOCK-06`, `NO_RAW_EVIDENCE_MOVEMENT`, `NO_UAT_ACCEPTANCE`, `NO_EVIDENCE_ACCEPTANCE`, no owner GO |
| `STD-43` | Add `STD-43_EXECUTIVE_OPERATING_BRAIN_COMPLETION_GATE` so BGH can see the whole executive operating brain as one read-only completion gate across dashboard, permission/scope, report/source, Legal/SOP, finance, UAT/evidence and live executive effective-access locks | PASS_LOCAL_EXECUTIVE_OPERATING_BRAIN_COMPLETION; `COMPLETION_GATE`, `BRAIN-GATE-01`, `BRAIN-GATE-06`, `BRAIN-GATE-07`, `STD-44`, `LIVE_EXECUTIVE_PERMISSION_NO_GO`, `Quyen o dau thi chi duoc xem dashboard o day`, no access grant or production GO |
| `STD-44` | Add `STD-44_EXECUTIVE_EFFECTIVE_ACCESS_READONLY_GATE` so BGH/HT/PHT live role permissions are checked against a read-only executive cockpit rule before dashboard reliance | PASS_LOCAL_EXECUTIVE_EFFECTIVE_ACCESS_READONLY_GUARD; `EXEC-ACCESS-01`, `EXEC-ACCESS-06`, `EXEC-ACCESS-REVOKE-01`, `LIVE_EXECUTIVE_PERMISSION_NO_GO`, `NO_APPROVAL_PERMISSION`, `NO_PAYMENT_PERMISSION`, `NO_SENSITIVE_READ`, reversible soft-revoke only |

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

`STD-01` role-gate hardening also standardizes `public.is_executive_role()` as
the SQL companion to the TypeScript executive-role helper. Workspace selection,
lead visibility and scope-enforcement reporting now treat `HIEU_TRUONG`,
`PHO_HIEU_TRUONG`, `BGH` and `ADMIN` as the executive read-only landing group,
with `EXECUTIVE_READONLY` scope display for BGH-equivalent users. This removes
the failure mode where a principal account is routed like a normal admissions
operator because a lower SQL layer only checks `BGH`. It keeps
`NO_DAILY_DATA_ENTRY`, `NO_ACCESS_GRANT`, `NO_PERMISSION_EXPANSION`,
`NO_FINANCE_ACTION`, `NO_UAT_ACCEPTANCE`, `NO_EVIDENCE_ACCEPTANCE`,
`NO_OWNER_GO` and `NO_PRODUCTION_GO` boundaries.

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

`STD-06` is implemented as a PASS_LOCAL_UI/read-only finance reliance proof lane
in the executive dashboard. It adds `STD-06_FINANCE_READONLY_RELIANCE_PROOF`
for `P2-18`, `P5-03`, `FIN-DAY1` and `ACCT-LOCAL`, showing the missing signed
P2-18/P5-03 browser UAT, source reconciliation, Finance Day-1 evidence, local
accounting readiness, negative-control proof and owner closure dependencies.
It keeps `READ_ONLY`, `NO_VOUCHER`, `NO_PAYMENT`, `NO_BANK_INSTRUCTION`,
`NO_STATUTORY_ACCOUNTING`, `NO_FINANCE_RELIANCE` and `NO_PRODUCTION_GO`
boundaries.

`STD-07` is implemented as a PASS_LOCAL_UI section navigator in the executive
dashboard. It adds `STD-07_EXECUTIVE_SECTION_NAVIGATOR` with quick anchors for
overview, quick access, report reliance, finance proof, Legal/SOP, M01-M12,
blockers and admissions signals. It keeps `NO_HIDDEN_NO_GO`,
`NO_APPROVAL_ACTION`, `NO_STATE_MUTATION` and `NO_PRODUCTION_GO` boundaries.

`STD-08` is implemented as a PASS_LOCAL_UI responsive density and section-order
guard in the executive dashboard. It adds
`STD-08_RESPONSIVE_DENSITY_SECTION_ORDER`, compact spacing, guarded
`scroll-mt-24` anchor offsets and the explicit section order:
overview, quick access, section navigator, report reliance, finance proof,
Legal/SOP, module maturity, KPIs, blockers, admissions and segment overview.
It keeps `NO_HIDDEN_BLOCKERS`, `NO_OVERLAP`, `NO_PRODUCTION_GO` and
`NO_APPROVAL_ACTION` boundaries.

`STD-09` is implemented as a PASS_LOCAL_VISUAL_QA source-layout and local
auth-route guard for the executive dashboard. It adds
`STD-09_EXECUTIVE_VISUAL_QA_SOURCE_GUARD`, records the desktop/mobile source
viewports as `desktop_1440` and `mobile_390`, and wires
`npm.cmd run check:heu-executive-dashboard-visual-qa` to verify anchor targets,
overflow-safe layout tokens and the local `/` route. If the local route
redirects to `/login`, the guard records `AUTH_REQUIRED` instead of claiming an
authenticated screenshot. It keeps `NO_SCREENSHOT_CLAIM`, `NO_UAT_ACCEPTANCE`,
`NO_APPROVAL_ACTION` and `NO_PRODUCTION_GO` boundaries.

The next safe implementation slice is `STD-10`: run focused authenticated
desktop/mobile screenshot QA for the executive dashboard only after an approved
local test account/session is available, without accepting UAT, evidence, owner
approval or production GO.

`STD-10` remains `AUTH_REQUIRED` because there is no approved authenticated
browser session in the local evidence. No screenshot, UAT acceptance, evidence
acceptance or owner approval is claimed.

`STD-11` is implemented as a PASS_LOCAL_UI priority focus rail in the executive
dashboard. It adds `STD-11_EXECUTIVE_PRIORITY_FOCUS_RAIL` above the normal
quick-access grid so BGH can jump first to Finance reliance, Legal/SOP, Report
reliance, Role/scope and Production blockers without scanning the full page.
The rail keeps `NO_HIDDEN_NO_GO`, `NO_STATE_MUTATION`, `NO_APPROVAL_ACTION` and
`NO_PRODUCTION_GO` boundaries.

`STD-12` is implemented as a PASS_LOCAL_ROLE_GUARD role-lane governance matrix.
It adds `HEU_ROLE_LANE_MATRIX` for `HIEU_TRUONG`, `PHO_HIEU_TRUONG`, `BGH`,
`KHTC`, `PHAP_CHE`, `IT_DATA` and `AUDIT`, plus the shared
`HEU_ROLE_LANE_BOUNDARY`. The guard standardizes who is allowed to inspect
executive, finance, legal/SOP, technical and audit lanes before any finance or
operations reliance discussion. It keeps `NO_ACCESS_GRANT`,
`NO_PERMISSION_EXPANSION`, `NO_FINANCE_EXECUTION`, `NO_LEGAL_CONCLUSION`,
`NO_UAT_ACCEPTANCE` and `NO_OWNER_GO` boundaries.

`STD-13` is implemented as a PASS_LOCAL_REPORT_SOURCE_GUARD report-view/source
map reliance contract. It adds
`STD-13_REPORT_VIEW_SOURCE_MAP_RELIANCE_CONTRACT` to the Report View Source Map
panel and `STD-13_DQ_DM05_DASHBOARD_RELIANCE_LOCK` to the Data Master / Report
View bridge. The guard requires dashboard reliance to stay blocked until the
report view has a source map, DQ state, owner signoff route and controlled
evidence reference. It keeps `NO_DASHBOARD_RELIANCE`, `NO_RAW_WORKBOOK`,
`NO_RAW_BANK_FILE`, `NO_UNRESTRICTED_TABLE`, `NO_FINANCE_ACTION`,
`NO_STATUTORY_ACCOUNTING`, `NO_UAT_ACCEPTANCE` and `NO_PRODUCTION_GO`
boundaries.

`STD-14` is implemented as a PASS_LOCAL_LEGAL_SOP_GUARD authority checklist in
the executive Legal/SOP lane and the Legal/SOP Governance Control Matrix. It
adds `STD-14_LEGAL_SOP_AUTHORITY_CHECKLIST` and the required questions:
`AUTH-LEGAL-BASIS`, `AUTH-SOP-VERSION`, `AUTH-MAKER`, `AUTH-CHECKER`,
`AUTH-APPROVER`, `AUTH-EVIDENCE` and `AUTH-SIGNER`. The checklist keeps
`PHAP_CHE_REVIEW_REQUIRED`, `SOP_OWNER_SIGNOFF_REQUIRED`,
`MAKER_CHECKER_APPROVER_REQUIRED`, `CONTROLLED_EVIDENCE_REQUIRED`,
`EXTERNAL_SIGNOFF_REQUIRED`, `NO_LEGAL_ADVICE`, `NO_OFFICIAL_SOP`,
`NO_FINANCE_ACTION`, `NO_OWNER_GO` and `NO_PRODUCTION_GO` boundaries.

`STD-15` is implemented as a PASS_LOCAL_FINANCE_RELIANCE_GUARD finance source
contract inside the executive finance lane. It adds
`STD-15_FINANCE_RELIANCE_SOURCE_CONTRACT` and `FIN-SRC-01` through
`FIN-SRC-05` for receivable, collection, reconciliation, payment request and
payout-evidence source routes. The contract requires source map, owner lane,
controlled evidence and explicit stop rule before any BGH/KHTC reliance. It
keeps `SOURCE_MAP_REQUIRED`, `OWNER_SIGNOFF_PENDING`,
`CONTROLLED_EVIDENCE_REQUIRED`, `NO_VOUCHER_POSTING`, `NO_PAYMENT_EXECUTION`,
`NO_BANK_INSTRUCTION`, `NO_STATUTORY_ACCOUNTING`, `NO_FINANCE_RELIANCE` and
`NO_PRODUCTION_GO` boundaries.

`STD-16` is implemented as a PASS_LOCAL_EVIDENCE_ROUTE checklist in the
executive dashboard. It adds `STD-16_UAT_EVIDENCE_ROUTE_CHECKLIST` and
`UAT-EVID-01` through `UAT-EVID-05` for P0-14 controlled evidence intake,
P6-04 role/workspace UAT, P2-18 accounting dashboard UAT, P5-03 Finance Desk
UAT and the P0-09/P0-15 owner decision package. The checklist routes BGH to
the next signed-evidence requirement without collecting or accepting evidence.
It keeps `SIGNED_UAT_PENDING`, `CONTROLLED_EVIDENCE_REQUIRED`,
`OWNER_SIGNOFF_PENDING`, `NO_UAT_ACCEPTANCE`, `NO_EVIDENCE_ACCEPTANCE`,
`NO_FINANCE_RELIANCE`, `NO_ACCESS_CLOSURE`, `NO_OWNER_GO` and
`NO_PRODUCTION_GO` boundaries.

`STD-17` is implemented as a PASS_LOCAL_FOCUS_MODE query-param focus layer for
the executive dashboard. It adds `STD-17_EXECUTIVE_FOCUS_MODE` and the
`focus=reports`, `focus=finance`, `focus=evidence`, `focus=roles`,
`focus=legal`, `focus=modules` and `focus=blockers` modes so BGH can open one topic without
scrolling through every section. The default remains `focus=all` for the full
cockpit. It keeps `FOCUS_QUERY_PARAM`, `PASS_LOCAL_EXECUTIVE_ROLE_SCOPE`,
`NO_STATE_MUTATION`, `NO_HIDDEN_NO_GO`, `NO_UAT_ACCEPTANCE`,
`NO_EVIDENCE_ACCEPTANCE`, `NO_FINANCE_ACTION`, `NO_OWNER_GO` and
`NO_PRODUCTION_GO` boundaries.

`STD-18` is implemented as a PASS_LOCAL_NEXT_ACTION read-only route hint inside
the executive dashboard. It adds `STD-18_EXECUTIVE_FOCUS_NEXT_ACTION` and
`NEXT-ALL`, `NEXT-RPT`, `NEXT-FIN`, `NEXT-EVD`, `NEXT-LAW`, `NEXT-M12` and
`NEXT-BLK` so the active focus always exposes one owner lane, target section
and stop rule before BGH drills down. It keeps `READ_ONLY_ROUTE_HINT`,
`NO_STATE_MUTATION`, `NO_HIDDEN_NO_GO`, `NO_UAT_ACCEPTANCE`,
`NO_EVIDENCE_ACCEPTANCE`, `NO_FINANCE_ACTION`, `NO_APPROVAL_ACTION`,
`NO_OWNER_GO` and `NO_PRODUCTION_GO` boundaries.

`STD-19` is implemented as PASS_LOCAL_GLOBAL_FOCUS_SHORTCUTS in the AppShell
workspace quick strip. It adds `STD-19_EXECUTIVE_GLOBAL_FOCUS_SHORTCUTS` and
executive-only shortcuts `Tổng quan`, `Báo cáo`, `Tài chính`,
`Bằng chứng`, `Phân quyền`, `Pháp chế`, `M01-M12` and `Blocker` so BGH can jump
to the dashboard focus modes from any screen, including all-segment overview.
It keeps `EXECUTIVE_ONLY`, `READ_ONLY_ROUTE_HINT`, `FOCUS_QUERY_PARAM`,
`PASS_LOCAL_EXECUTIVE_ROLE_SCOPE`, `NO_ACCESS_GRANT`,
`NO_PERMISSION_EXPANSION`, `NO_STATE_MUTATION`, `NO_APPROVAL_ACTION`,
`NO_UAT_ACCEPTANCE`, `NO_EVIDENCE_ACCEPTANCE`, `NO_FINANCE_ACTION`,
`NO_OWNER_GO` and `NO_PRODUCTION_GO` boundaries.

`STD-20` is implemented as PASS_LOCAL_FOCUS_LANE_SEPARATION in the AppShell.
It adds `STD-20_EXECUTIVE_FOCUS_LANE_SEPARATION` so the executive focus lane is
rendered before, and separately from, the P0-13 workspace quick strip. This
keeps BGH route hints visually distinct from workspace actions like Lead,
Follow-up, documents, pipeline, import and segment hub. It keeps
`EXECUTIVE_ONLY`, `SEPARATE_FROM_WORKSPACE`, `READ_ONLY_ROUTE_HINT`,
`FOCUS_QUERY_PARAM`, `NO_ACCESS_GRANT`, `NO_PERMISSION_EXPANSION`,
`NO_STATE_MUTATION`, `NO_APPROVAL_ACTION`, `NO_UAT_ACCEPTANCE`,
`NO_EVIDENCE_ACCEPTANCE`, `NO_FINANCE_ACTION`, `NO_OWNER_GO` and
`NO_PRODUCTION_GO` boundaries.

`STD-23` is implemented as PASS_LOCAL_EXECUTIVE_ROLE_SCOPE in the executive
dashboard and AppShell. It adds
`STD-23_EXECUTIVE_ROLE_SCOPE_DECISION_STRIP` and
`STD-23_EXECUTIVE_ROLE_SCOPE_FOCUS_SHORTCUT` so BGH can open `focus=roles` from
any screen and see the current role lane, executive role matrix and four
decision checks: `EXEC-ROLE-01`, `EXEC-ROLE-02`, `EXEC-ROLE-03` and
`EXEC-ROLE-04`. The strip keeps `P6-04_ROLE_SCOPE_UAT_PENDING`,
`NEGATIVE_ACCESS_PROOF_PENDING`, `NO_ACCESS_GRANT`, `NO_PERMISSION_EXPANSION`,
`NO_DAILY_DATA_ENTRY`, `NO_FINANCE_EXECUTION`, `NO_LEGAL_CONCLUSION`,
`NO_UAT_ACCEPTANCE`, `NO_OWNER_GO` and `NO_PRODUCTION_GO` boundaries.

`STD-24` is implemented as PASS_LOCAL_REPORT_SOURCE_TRIAGE in the executive
dashboard reports focus. It adds `STD-24_EXECUTIVE_REPORT_SOURCE_MAP_TRIAGE`
with `RPT-SRC-01` through `RPT-SRC-05` so BGH checks report-view contract,
`DQ-DM-05`, owner signoff route, controlled evidence reference and reliance
decision before trusting dashboard numbers. It keeps
`REPORT_VIEW_MASTER_CONTRACT`, `OWNER_SIGNOFF_PENDING`,
`CONTROLLED_EVIDENCE_REQUIRED`, `NO_RAW_WORKBOOK`, `NO_RAW_BANK_FILE`,
`NO_VOUCHER`, `NO_DASHBOARD_RELIANCE`, `NO_FINANCE_ACTION`,
`NO_STATUTORY_ACCOUNTING`, `NO_UAT_ACCEPTANCE`, `NO_OWNER_GO` and
`NO_PRODUCTION_GO` boundaries.

`STD-33` is implemented as PASS_LOCAL_REPORT_SOURCE_FAST_INDEX in the executive
dashboard reports focus. It adds `STD-33_EXECUTIVE_REPORT_SOURCE_FAST_INDEX`
with `RPT-IDX-01` through `RPT-IDX-06` so BGH can scan each critical
report-view, source route, owner lane, DQ gate, evidence route and stop rule in
one compact table before opening the detailed source map. The index covers
`RV_TTGDTX_FINANCE_SUMMARY`, `RV_TTGDTX_CONG_NO_THUC_THU`,
`RV_HOU_LEDGER_SUMMARY`, `RV_SHORT_COURSE_ATTENDANCE_PAYMENT`,
`RV_AUDIT_RISK_CONTROL` and `RV_AI_ALLOWED_CONTEXT`. It keeps
`REPORT_VIEW_SOURCE_INDEX`, `DQ_DM05_VISIBLE`, `OWNER_SIGNOFF_PENDING`,
`CONTROLLED_EVIDENCE_REQUIRED`, `NO_RAW_SOURCE_OPEN`,
`NO_DASHBOARD_RELIANCE`, `NO_FINANCE_ACTION`, `NO_STATUTORY_ACCOUNTING`,
`NO_UAT_ACCEPTANCE`, `NO_EVIDENCE_ACCEPTANCE`, `NO_OWNER_GO` and
`NO_PRODUCTION_GO` boundaries.

`STD-39` is implemented as PASS_LOCAL_REPORT_DASHBOARD_SCOPE_CONTRACT in the
executive dashboard reports focus. It adds
`STD-39_EXECUTIVE_REPORT_DASHBOARD_SCOPE_CONTRACT` with `RPT-SCOPE-01` through
`RPT-SCOPE-06` so every critical report view declares the dashboard consumer,
scope gate, source contract and reliance blocker before any executive dashboard
number is trusted. The contract covers `RV_TTGDTX_FINANCE_SUMMARY`,
`RV_TTGDTX_CONG_NO_THUC_THU`, `RV_HOU_LEDGER_SUMMARY`,
`RV_SHORT_COURSE_ATTENDANCE_PAYMENT`, `RV_AUDIT_RISK_CONTROL` and
`RV_AI_ALLOWED_CONTEXT`. It keeps `REPORT_VIEW_TO_DASHBOARD_SCOPE`,
`REPORT_VIEW_REGISTER`, `SOURCE_MAP_REQUIRED`, `DQ_DM05_VISIBLE`,
`SCOPE_BOUND_DASHBOARD`, `OWNER_SIGNOFF_PENDING`,
`CONTROLLED_EVIDENCE_REQUIRED`, `NO_RAW_SOURCE_OPEN`,
`NO_CROSS_SCOPE_DASHBOARD`, `NO_DASHBOARD_RELIANCE`,
`NO_REPORT_VIEW_RELIANCE`, `NO_FINANCE_ACTION`, `NO_STATUTORY_ACCOUNTING`,
`NO_UAT_ACCEPTANCE`, `NO_EVIDENCE_ACCEPTANCE`, `NO_LEGAL_CONCLUSION`,
`NO_OWNER_GO` and `NO_PRODUCTION_GO` boundaries.

`STD-25` is implemented as PASS_LOCAL_LEGAL_SOP_TRIAGE in the executive
dashboard legal focus. It adds `STD-25_EXECUTIVE_LEGAL_SOP_TRIAGE` with
`LEGAL-TRIAGE-01` through `LEGAL-TRIAGE-05` so BGH checks legal basis, SOP
version, maker/checker/approver route, controlled evidence and external signer
before relying on any workflow. It keeps `DRAFT_CONTROL`,
`PHAP_CHE_REVIEW_REQUIRED`, `SOP_OWNER_SIGNOFF_REQUIRED`,
`MAKER_CHECKER_APPROVER_REQUIRED`, `CONTROLLED_EVIDENCE_REQUIRED`,
`EXTERNAL_SIGNOFF_REQUIRED`, `NO_LEGAL_ADVICE`, `NO_OFFICIAL_SOP`,
`NO_APPROVAL_ACTION`, `NO_FINANCE_ACTION`, `NO_OWNER_GO` and
`NO_PRODUCTION_GO` boundaries.

`STD-34` is implemented as PASS_LOCAL_LEGAL_SOP_REQUIRED_ANSWER_INDEX in the
executive dashboard legal focus. It adds
`STD-34_EXECUTIVE_LEGAL_SOP_REQUIRED_ANSWER_INDEX` with `LAW-IDX-01` through
`LAW-IDX-06` so BGH can scan each workflow against the required answers:
legal basis, SOP, maker, checker, approver, evidence and external signer. It
keeps `REQUIRED_ANSWER_INDEX`, `PHAP_CHE_REVIEW_REQUIRED`,
`SOP_OWNER_SIGNOFF_REQUIRED`, `MAKER_CHECKER_APPROVER_REQUIRED`,
`CONTROLLED_EVIDENCE_REQUIRED`, `EXTERNAL_SIGNOFF_REQUIRED`,
`NO_LEGAL_ADVICE`, `NO_OFFICIAL_SOP`, `NO_APPROVAL_ACTION`,
`NO_FINANCE_ACTION`, `NO_OWNER_GO` and `NO_PRODUCTION_GO` boundaries.

`STD-35` is implemented as PASS_LOCAL_FINANCE_RELIANCE_FAST_INDEX in the
executive dashboard finance focus. It adds
`STD-35_EXECUTIVE_FINANCE_RELIANCE_FAST_INDEX` with `FIN-IDX-01` through
`FIN-IDX-06` so BGH/KHTC can scan P2-18, P5-03, Finance Day-1, ACCT local
readiness, payment/payout and role-scope negative proof in one compact table.
The index shows the source contract, required proof, decision gate, forbidden
action and next read-only route before any reliance discussion. It keeps
`FINANCE_RELIANCE_INDEX`, `SOURCE_MAP_REQUIRED`,
`OWNER_SIGNOFF_PENDING`, `CONTROLLED_EVIDENCE_REQUIRED`,
`SIGNED_UAT_PENDING`, `NO_DASHBOARD_RELIANCE`, `NO_VOUCHER_POSTING`,
`NO_PAYMENT_EXECUTION`, `NO_BANK_INSTRUCTION`, `NO_STATUTORY_ACCOUNTING`,
`NO_FINANCE_RELIANCE`, `NO_UAT_ACCEPTANCE`, `NO_OWNER_GO` and
`NO_PRODUCTION_GO` boundaries.

`STD-26` is implemented as PASS_LOCAL_FINANCE_RELIANCE_TRIAGE in the executive
dashboard finance focus. It adds `STD-26_EXECUTIVE_FINANCE_RELIANCE_TRIAGE`
with `FIN-REL-01` through `FIN-REL-05` so BGH/KHTC checks signed P2-18/P5-03
route evidence, Finance Day-1 ledger, P6-04 role/scope proof, owner reliance
decision and forbidden-action lock before trusting finance numbers. It keeps
`READ_ONLY`, `SOURCE_MAP_REQUIRED`, `OWNER_SIGNOFF_PENDING`,
`CONTROLLED_EVIDENCE_REQUIRED`, `SIGNED_UAT_PENDING`,
`NO_DASHBOARD_RELIANCE`, `NO_VOUCHER_POSTING`, `NO_PAYMENT_EXECUTION`,
`NO_BANK_INSTRUCTION`, `NO_STATUTORY_ACCOUNTING`, `NO_FINANCE_RELIANCE`,
`NO_UAT_ACCEPTANCE`, `NO_OWNER_GO` and `NO_PRODUCTION_GO` boundaries.

`STD-27` is implemented as PASS_LOCAL_UAT_EVIDENCE_TRIAGE in the executive
dashboard evidence focus. It adds `STD-27_EXECUTIVE_UAT_EVIDENCE_CLOSURE_TRIAGE`
with `UAT-CLOSE-01` through `UAT-CLOSE-05` so BGH checks controlled evidence
location, signed UAT route state, P6-04/P0-17 role and access closure
dependency, finance/legal reliance dependency and P0-09/P0-15 final owner
decision pack before closing blockers. It keeps `READ_ONLY`,
`SIGNED_UAT_PENDING`, `CONTROLLED_EVIDENCE_REQUIRED`,
`OWNER_SIGNOFF_PENDING`, `NO_UAT_EXECUTION`, `NO_UAT_ACCEPTANCE`,
`NO_EVIDENCE_ACCEPTANCE`, `NO_ACCESS_CLOSURE`, `NO_ACCESS_GRANT`,
`NO_PERMISSION_EXPANSION`, `NO_FINANCE_RELIANCE`, `NO_LEGAL_CONCLUSION`,
`NO_OWNER_GO` and `NO_PRODUCTION_GO` boundaries.

`STD-36` is implemented as PASS_LOCAL_UAT_EVIDENCE_FAST_ACTION_QUEUE in the
executive dashboard evidence focus. It adds
`STD-36_EXECUTIVE_UAT_EVIDENCE_FAST_ACTION_QUEUE` with `UAT-FAST-01` through
`UAT-FAST-06` so BGH can open the first practical lane for P0-14 controlled
evidence intake, P6-04 role/workspace proof, P2-18/P5-03 finance signed proof,
P0-19 legal/SOP confirmation, P6-03/P6-06 audit and cascade closure and the
P0-09/P0-15 final owner packet. The queue shows owner lane, first action,
evidence key, read-only route and stop rule before any UAT/evidence closure
discussion. It keeps `FAST_ACTION_QUEUE`, `SIGNED_UAT_PENDING`,
`CONTROLLED_EVIDENCE_REQUIRED`, `OWNER_SIGNOFF_PENDING`,
`NO_EVIDENCE_UPLOAD`, `NO_UAT_EXECUTION`, `NO_UAT_ACCEPTANCE`,
`NO_EVIDENCE_ACCEPTANCE`, `NO_ACCESS_GRANT`, `NO_ACCESS_CLOSURE`,
`NO_PERMISSION_EXPANSION`, `NO_FINANCE_RELIANCE`, `NO_LEGAL_CONCLUSION`,
`NO_OWNER_GO` and `NO_PRODUCTION_GO` boundaries.

`STD-42` is implemented as PASS_LOCAL_UAT_EVIDENCE_ACCEPTANCE_LOCK in the
executive dashboard evidence focus. It adds
`STD-42_EXECUTIVE_UAT_EVIDENCE_ACCEPTANCE_LOCK` with `UAT-LOCK-01` through
`UAT-LOCK-06` so BGH can distinguish route visibility from signed acceptance
for P0-14 controlled evidence intake, P6-04 role/scope UAT proof, P2-18/P5-03
finance UAT, P0-19 legal/SOP confirmation, P6-03/P6-06 audit/cascade closure
and the P0-09/P0-15 final owner packet. The lock shows visible use, required
proof before acceptance, owner lane and forbidden actions until signed evidence
exists outside Git/Codex/chat. It keeps `READ_ONLY`, `ACCEPTANCE_LOCK`,
`SIGNED_UAT_PENDING`, `CONTROLLED_EVIDENCE_REQUIRED`,
`OWNER_SIGNOFF_PENDING`, `REDACTION_REVIEW_REQUIRED`, `NO_EVIDENCE_UPLOAD`,
`NO_RAW_EVIDENCE_MOVEMENT`, `NO_UAT_EXECUTION`, `NO_UAT_ACCEPTANCE`,
`NO_EVIDENCE_ACCEPTANCE`, `NO_ACCESS_CLOSURE`, `NO_ACCESS_GRANT`,
`NO_PERMISSION_EXPANSION`, `NO_FINANCE_RELIANCE`, `NO_DASHBOARD_RELIANCE`,
`NO_PAYMENT_EXECUTION`, `NO_LEGAL_CONCLUSION`, `NO_OFFICIAL_SOP`,
`NO_WORKFLOW_RELIANCE`, `NO_AUDIT_CLOSURE`, `NO_WAIVER_RELIANCE`,
`NO_HIDDEN_EVIDENCE_MOVEMENT`, `NO_OWNER_GO` and `NO_PRODUCTION_GO`
boundaries.

`STD-43` is implemented as PASS_LOCAL_EXECUTIVE_OPERATING_BRAIN_COMPLETION in
the executive dashboard overview. It adds
`STD-43_EXECUTIVE_OPERATING_BRAIN_COMPLETION_GATE` with `BRAIN-GATE-01`
through `BRAIN-GATE-06`, plus `BRAIN-GATE-07`, so BGH sees the full "bo nao dieu hanh" as one
read-only completion gate across STD-01 executive landing, STD-37/STD-38
scope and permission visibility, STD-39 report/source reliance, STD-40
Legal/SOP evidence authority, STD-41 finance read-only reliance and STD-42
UAT/evidence acceptance lock, plus STD-44 executive effective-access read-only
guard. The gate states the rule `Quyen o dau thi chi
duoc xem dashboard o day`: executive roles can inspect all-segment dashboards
read-only, while non-executive users remain limited to active/visible segment
dashboards and runtime permission visibility. It keeps `READ_ONLY`,
`COMPLETION_GATE`, `SCOPE_BOUND_DASHBOARD`, `ROUTE_VISIBILITY_MATRIX`,
`REPORT_VIEW_TO_DASHBOARD_SCOPE`, `EVIDENCE_AUTHORITY_QUEUE`, `RELIANCE_LOCK`,
`ACCEPTANCE_LOCK`, `EXECUTIVE_EFFECTIVE_ACCESS_READONLY`,
`LIVE_EXECUTIVE_PERMISSION_NO_GO`, `SIGNED_UAT_PENDING`,
`OWNER_SIGNOFF_PENDING`, `CONTROLLED_EVIDENCE_REQUIRED`, `NO_STATE_MUTATION`,
`NO_ACCESS_GRANT`,
`NO_PERMISSION_EXPANSION`, `NO_ACCOUNT_CREATE`, `NO_ROLE_ASSIGNMENT`,
`NO_DASHBOARD_RELIANCE`, `NO_REPORT_VIEW_RELIANCE`, `NO_FINANCE_RELIANCE`,
`NO_FINANCE_ACTION`, `NO_LEGAL_CONCLUSION`, `NO_OFFICIAL_SOP`,
`NO_UAT_EXECUTION`, `NO_UAT_ACCEPTANCE`, `NO_EVIDENCE_ACCEPTANCE`,
`NO_OWNER_GO` and `NO_PRODUCTION_GO` boundaries.

`STD-44` is implemented as
PASS_LOCAL_EXECUTIVE_EFFECTIVE_ACCESS_READONLY_GUARD in the executive dashboard
overview. It adds `STD-44_EXECUTIVE_EFFECTIVE_ACCESS_READONLY_GATE` with
`EXEC-ACCESS-01` through `EXEC-ACCESS-06` so the executive cockpit cannot be
treated as read-only complete while live `role_permissions` for `BGH`,
`HIEU_TRUONG` or `PHO_HIEU_TRUONG` still include approve, pay, manage, create,
update, delete, check, verify, lock, issue, sensitive-read or other action
permissions. The live checker reports `LIVE_EXECUTIVE_PERMISSION_NO_GO` and
uses `user_scope_effective_access` plus `user_scope_enforcement_summary` as the
truth surfaces. `EXEC-ACCESS-REVOKE-01` is the controlled remediation path:
`database/step120_executive_readonly_permission_lock.sql` and
`scripts/apply-heu-executive-readonly-soft-revoke.mjs` soft-revoke unsafe
executive permissions by setting rows to `INACTIVE` after dry-run and explicit
confirmation. It does not delete rows, change `ADMIN`, create accounts, assign
roles, grant access, accept UAT/evidence, approve finance action, approve owner
GO/NO-GO or mark production GO.

`STD-37` is implemented as PASS_LOCAL_DASHBOARD_SCOPE_VISIBILITY in the
executive dashboard role/scope focus. It adds
`STD-37_EXECUTIVE_DASHBOARD_SCOPE_VISIBILITY_INVARIANT` with `SCOPE-VIS-01`
through `SCOPE-VIS-05` so the dashboard states the invariant: executive roles
can see all segments read-only through `canSeeAllSegments`, while non-executive
users only see active segment or `visibleSegmentIds` dashboards through
`admissionWorkspaceSegmentIds` and `applyAdmissionSegmentIds`. It keeps
`SCOPE_BOUND_DASHBOARD`, `ACTIVE_SEGMENT_LIMIT`,
`NON_EXECUTIVE_VISIBLE_SEGMENTS`, `NO_CROSS_SCOPE_DASHBOARD`,
`NO_RAW_SOURCE_OPEN`, `NO_ACCESS_GRANT`, `NO_PERMISSION_EXPANSION`,
`NO_STATE_MUTATION`, `NO_FINANCE_ACTION`, `NO_LEGAL_CONCLUSION`,
`NO_UAT_ACCEPTANCE`, `NO_EVIDENCE_ACCEPTANCE`, `NO_OWNER_GO` and
`NO_PRODUCTION_GO` boundaries.

`STD-38` is implemented as
PASS_LOCAL_EXECUTIVE_DASHBOARD_PERMISSION_MATRIX in the executive dashboard
role/scope focus. It adds
`STD-38_EXECUTIVE_DASHBOARD_PERMISSION_MATRIX` with `EXEC-PERM-01` through
`EXEC-PERM-07` so BGH can see which route surface is visible by
`runtimePermissionGate`, including `master_control.read`, `finance_desk.read`,
`scope.manage_department`, `users.create`, `permission_matrix.read` and
`permission_matrix.manage`. The matrix exposes `ROUTE_VISIBILITY_MATRIX`,
`READ_ONLY_DASHBOARD_VISIBLE`, `ROUTE_VISIBLE_BY_PERMISSION` and
`ROUTE_LINK_BLOCKED_PENDING_PERMISSION` without creating accounts, granting
access or expanding permissions. It keeps `NO_ACCESS_GRANT`,
`NO_PERMISSION_EXPANSION`, `NO_ACCOUNT_CREATE`, `NO_ROLE_ASSIGNMENT`,
`NO_STATE_MUTATION`, `NO_APPROVAL_ACTION`, `NO_FINANCE_ACTION`,
`NO_LEGAL_CONCLUSION`, `NO_UAT_ACCEPTANCE`, `NO_EVIDENCE_ACCEPTANCE`,
`NO_OWNER_GO` and `NO_PRODUCTION_GO` boundaries.

`STD-28` is implemented as PASS_LOCAL_PRODUCTION_BLOCKER_TRIAGE in the
executive dashboard blockers focus. It adds
`STD-28_EXECUTIVE_PRODUCTION_BLOCKER_TRIAGE` with `BLK-CLOSE-01` through
`BLK-CLOSE-05` so BGH checks backup/restore proof, Step90-Step110 migration
order signoff, signed UAT route closure, finance/legal reliance closure and
the final owner GO/NO-GO packet before any production discussion. It keeps
`READ_ONLY`, `BACKUP_RESTORE_PROOF_REQUIRED`,
`MIGRATION_ORDER_SIGNOFF_REQUIRED`, `SIGNED_UAT_PENDING`,
`OWNER_SIGNOFF_PENDING`, `CONTROLLED_EVIDENCE_REQUIRED`,
`NO_UAT_ACCEPTANCE`, `NO_EVIDENCE_ACCEPTANCE`, `NO_FINANCE_RELIANCE`,
`NO_LEGAL_CONCLUSION`, `NO_MIGRATION_APPROVAL`, `NO_OWNER_GO` and
`NO_PRODUCTION_GO` boundaries.

`STD-29` is implemented as PASS_LOCAL_PRIORITY_COMMAND_STRIP in the executive
dashboard priority focus rail. It adds
`STD-29_EXECUTIVE_PRIORITY_COMMAND_STRIP` so the priority cards use
`focusHref(item.focusMode)` and open focused read-only dashboard views for
finance, evidence, legal/SOP, reports, role/scope and blockers instead of only
jumping to anchors inside the full page. It keeps `READ_ONLY_ROUTE_HINT`,
`FOCUS_QUERY_PARAM`, `VISIBLE_FOCUS_ONLY`, `NO_STATE_MUTATION`,
`NO_ACCESS_GRANT`, `NO_PERMISSION_EXPANSION`, `NO_APPROVAL_ACTION`,
`NO_UAT_ACCEPTANCE`, `NO_EVIDENCE_ACCEPTANCE`, `NO_FINANCE_ACTION`,
`NO_OWNER_GO` and `NO_PRODUCTION_GO` boundaries.

`STD-30` is implemented as PASS_LOCAL_ACTIVE_FOCUS_HEADER in the executive
dashboard overview header. It adds `STD-30_EXECUTIVE_ACTIVE_FOCUS_HEADER` so
the current `focus` query state is visible immediately as `ACTIVE_FOCUS_VISIBLE`
and the header provides a `RETURN_TO_ALL` route hint through `focusHref("all")`.
It keeps `READ_ONLY_ROUTE_HINT`, `FOCUS_QUERY_PARAM`, `NO_STATE_MUTATION`,
`NO_ACCESS_GRANT`, `NO_PERMISSION_EXPANSION`, `NO_APPROVAL_ACTION`,
`NO_UAT_ACCEPTANCE`, `NO_EVIDENCE_ACCEPTANCE`, `NO_FINANCE_ACTION`,
`NO_OWNER_GO` and `NO_PRODUCTION_GO` boundaries.

`STD-31` is implemented as PASS_LOCAL_GLOBAL_FOCUS_COMPACT_LABELS in the
AppShell executive focus strip. It adds
`STD-31_EXECUTIVE_GLOBAL_FOCUS_COMPACT_LABELS` so the global shortcuts use
compact labels `Tổng quan`, `Báo cáo`, `Tài chính`, `Bằng chứng`,
`Phân quyền`, `Pháp chế`, `M01-M12` and `Blocker` instead of long mixed-language
BGH labels. The links remain read-only route hints for the same `focus` query
modes. It keeps `EXECUTIVE_ONLY`, `COMPACT_LABELS`, `READ_ONLY_ROUTE_HINT`,
`FOCUS_QUERY_PARAM`, `NO_LONG_COPY`, `NO_ACCESS_GRANT`,
`NO_PERMISSION_EXPANSION`, `NO_STATE_MUTATION`, `NO_APPROVAL_ACTION`,
`NO_UAT_ACCEPTANCE`, `NO_EVIDENCE_ACCEPTANCE`, `NO_FINANCE_ACTION`,
`NO_OWNER_GO` and `NO_PRODUCTION_GO` boundaries.

`STD-32` is implemented as PASS_LOCAL_DEPARTMENT_ROLE_LANE_MAP in the executive
role/scope focus. It adds `HEU_DEPARTMENT_ROLE_LANE_MAP` and
`STD-32_EXECUTIVE_DEPARTMENT_ROLE_LANE_MAP` so BGH can see the accountable
lane, operating scope, required evidence and stop rule for `DEPT-TUYEN-SINH`,
`DEPT-DAO-TAO`, `DEPT-CTHSSV`, `DEPT-KHOA-GV`, `DEPT-TCHC`, `DEPT-KHTC`,
`DEPT-PHAP-CHE`, `DEPT-IT-DATA` and `DEPT-AUDIT`. This is executive
oversight only: it does not create accounts, assign roles, grant access,
expand permissions or replace P6-04 signed role/scope UAT. It keeps
`EXECUTIVE_OVERSIGHT`, `NO_ACCOUNT_CREATE`, `NO_ROLE_ASSIGNMENT`,
`NO_ACCESS_GRANT`, `NO_PERMISSION_EXPANSION`, `NO_FINANCE_EXECUTION`,
`NO_LEGAL_CONCLUSION`, `NO_UAT_ACCEPTANCE`, `NO_OWNER_GO` and
`NO_PRODUCTION_GO` boundaries.

`STD-21` is implemented as PASS_LOCAL_QUICK_LANE_LABELS in the AppShell. It
adds `STD-21_QUICK_LANE_LABELS` and `STD-21_WORKSPACE_QUICK_LANE_LABEL` so the
two compact quick lanes are labeled `BGH focus` and `Workspace` with short
status pills only. It keeps `COMPACT_LABELS`, `NO_LONG_COPY`,
`NO_STATE_MUTATION`, `NO_APPROVAL_ACTION`, `NO_ACCESS_GRANT`,
`NO_PERMISSION_EXPANSION`, `NO_UAT_ACCEPTANCE`, `NO_EVIDENCE_ACCEPTANCE`,
`NO_FINANCE_ACTION`, `NO_OWNER_GO` and `NO_PRODUCTION_GO` boundaries.

`STD-22` is implemented as PASS_LOCAL_FOCUS_SCOPED_NAVIGATOR in the executive
dashboard. It adds `STD-22_EXECUTIVE_FOCUS_SCOPED_NAVIGATOR` so the section
navigator uses `visibleSectionNavItems` from the active focus and keeps only
persistent `OVR`, `PRI`, `NXT`, `QCK` plus the selected focus lane: `RPT`,
`FIN`, `EVD`, `LAW`, `M12`/`ADM` or `BLK`. This prevents links to hidden
sections when BGH chooses a focused view. It keeps `VISIBLE_SECTION_LINKS_ONLY`,
`PERSISTENT_OVERVIEW_PRIORITY_NEXT_QUICK`, `NO_HIDDEN_TARGET_LINK`,
`NO_STATE_MUTATION`, `NO_APPROVAL_ACTION`, `NO_UAT_ACCEPTANCE`,
`NO_EVIDENCE_ACCEPTANCE`, `NO_FINANCE_ACTION`, `NO_OWNER_GO` and
`NO_PRODUCTION_GO` boundaries.
