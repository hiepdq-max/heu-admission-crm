# Docs Review Register 2026-07-07

Task ID: HEU-DOCS-002-REVIEW-CONTROL-DOCS-BY-MODULE
Repository: heu-admission-crm
Branch: hardening/ttgdtx-9plus-pilot
HEAD at review start: 246c206
Last refreshed: 2026-07-09
Source workspace HEAD before refresh commit: 663a420
Status: DRAFT_CONTROL

## 1. Purpose

This register classifies the currently dirty `docs` group by module, scope, and
owner boundary before code, script, database, config, or runtime review.

This is a review-routing artifact only. It does not approve UAT, accept
evidence, approve finance action, approve owner GO/NO-GO, run migration, or
mark production GO.

## 2. Live Docs Status

Source command: `git status --porcelain=v1 -uall -- docs`

| Status | Count |
|---|---:|
| Modified | 48 |
| Added | 14 |
| Untracked | 36 |
| Total docs entries | 98 |

Refresh boundary:

- The counts above reflect the current `docs` dirty status after this register
  is committed. The pre-commit count was 99 because this register itself was
  still untracked.
- The module summary, detailed classification, and queue below remain the
  2026-07-07 baseline routing map.
- Treat this register as a review-routing artifact, not a complete refreshed
  approval ledger for all 99 current docs entries.
- Current production state remains NO-GO unless an authorized owner approves it
  outside Git/Codex/chat with UAT, evidence, backup, and rollback.

## 3. Module Summary - 2026-07-07 Baseline

| Module group | Count | Scope class | Primary review lane | PR rule |
|---|---:|---|---|---|
| TTGDTX/Finance | 10 | CURRENT_TTGDTX_SCOPE_OR_FINANCE_GATE | KHTC + IT_DATA + Audit + PHAP_CHE | Separate PR, highest docs priority |
| System/Governance | 8 | CONTROL_FOUNDATION | IT_DATA + Audit + BGH | Separate PR before broad code review |
| Identity/Permission/Auth | 10 | CONTROL_FOUNDATION | IT_DATA + ADMIN + Audit + PHAP_CHE where role policy applies | Separate PR before settings/scope code |
| Legal/SOP/Data Logic | 2 | CONTROL_FOUNDATION | PHAP_CHE + IT_DATA + Audit + owner lane | Separate legal/control review |
| Reports/Dashboard/Executive | 5 | CONTROL_FOUNDATION | BGH + IT_DATA + Audit + module owners | Separate read-only dashboard/report review |
| AI/System Control | 4 | CONTROL_FOUNDATION | IT_DATA + Audit + BGH | Separate AI/advisory boundary review |
| Admissions M05 | 4 | NON_TTGDTX_MODULE_CONTROL | TUYEN_SINH + CTHSSV + IT_DATA + Audit | Review-only until current TTGDTX scope is clean |
| CTHSSV M06 | 10 | NON_TTGDTX_MODULE_CONTROL | CTHSSV + TUYEN_SINH + DAO_TAO + IT_DATA + Audit | Review-only until matching code/scripts are isolated |
| Dao Tao/Khoa/Short Course | 23 | NON_TTGDTX_MODULE_CONTROL | DAO_TAO + KHOA + IT_DATA + Audit + PHAP_CHE where policy/privacy applies | Review-only; do not expand production scope |
| Other Docs | 1 | CONTROL_FOUNDATION | IT_DATA + Audit | Reclassify before PR if content says broader scope |

## 4. Scope Decision

| Scope class | Meaning | Allowed next action | Stop rule |
|---|---|---|---|
| CURRENT_TTGDTX_SCOPE_OR_FINANCE_GATE | Directly related to the current TTGDTX 9+ hardening chain or finance gate | Review docs first, then pair with related scripts and app/database diff | No finance reliance, payout, receivable mutation, UAT acceptance, or production GO |
| CONTROL_FOUNDATION | Cross-system policy, permission, report, AI, legal, or governance control | Review as control docs before any code that depends on them | No legal conclusion, access grant, dashboard reliance, evidence acceptance, or owner GO |
| NON_TTGDTX_MODULE_CONTROL | Module packs outside the current TTGDTX production scope | Keep as docs review only until explicitly selected as a later PR slice | Do not expand production scope or execute real operation |

## 5. Detailed Docs Classification - 2026-07-07 Baseline

| Status | File | Module group | Scope class | Owner/role review required | PHAP_CHE/Audit required |
|---|---|---|---|---|---|
| `M` | `docs/HEU_ACCOUNTING_MODULE_COMPLETION_BREAKDOWN_20260703.md` | TTGDTX/Finance | CURRENT_TTGDTX_SCOPE_OR_FINANCE_GATE | KHTC + IT_DATA + Audit + PHAP_CHE | YES |
| `M` | `docs/HEU_ACCOUNTING_NEGATIVE_CONTROL_OWNER_ACTION_QUEUE_20260703.md` | TTGDTX/Finance | CURRENT_TTGDTX_SCOPE_OR_FINANCE_GATE | KHTC + IT_DATA + Audit + PHAP_CHE | YES |
| `M` | `docs/HEU_ACCOUNTING_OPEN_BLOCKER_ACTION_QUEUE_20260703.md` | TTGDTX/Finance | CURRENT_TTGDTX_SCOPE_OR_FINANCE_GATE | KHTC + IT_DATA + Audit + PHAP_CHE | YES |
| `M` | `docs/HEU_ACCOUNTING_RISK_CLOSURE_LEDGER_20260703.md` | TTGDTX/Finance | CURRENT_TTGDTX_SCOPE_OR_FINANCE_GATE | KHTC + IT_DATA + Audit + PHAP_CHE | YES |
| `M` | `docs/HEU_ACCOUNTING_UAT_OWNER_CLOSURE_LEDGER_20260703.md` | TTGDTX/Finance | CURRENT_TTGDTX_SCOPE_OR_FINANCE_GATE | KHTC + IT_DATA + Audit + PHAP_CHE | YES |
| `A` | `docs/HEU_FINANCE_DESK_MAIL_EVIDENCE_INTAKE_20260703.md` | TTGDTX/Finance | CURRENT_TTGDTX_SCOPE_OR_FINANCE_GATE | KHTC + IT_DATA + Audit + PHAP_CHE | YES |
| `??` | `docs/HEU_FINANCE_HDDT_CONTROLLED_EVIDENCE_INTAKE_20260705.md` | TTGDTX/Finance | CURRENT_TTGDTX_SCOPE_OR_FINANCE_GATE | KHTC + IT_DATA + Audit + PHAP_CHE | YES |
| `M` | `docs/HEU_NEGATIVE_CONTROL_ACCOUNT_QUEUE_20260703.md` | TTGDTX/Finance | CURRENT_TTGDTX_SCOPE_OR_FINANCE_GATE | KHTC + IT_DATA + Audit + PHAP_CHE | YES |
| `M` | `docs/P2_17_DUPLICATE_PAYOUT_UAT_RUNBOOK.md` | TTGDTX/Finance | CURRENT_TTGDTX_SCOPE_OR_FINANCE_GATE | KHTC + IT_DATA + Audit + PHAP_CHE | YES |
| `M` | `docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md` | TTGDTX/Finance | CURRENT_TTGDTX_SCOPE_OR_FINANCE_GATE | KHTC + IT_DATA + Audit + PHAP_CHE | YES |
| `M` | `docs/HEU_CODEX_OPERATING_PLAYBOOK.md` | System/Governance | CONTROL_FOUNDATION | IT_DATA + Audit + BGH | YES |
| `M` | `docs/HEU_CURRENT_STATE_INVENTORY.md` | System/Governance | CONTROL_FOUNDATION | IT_DATA + Audit + BGH | YES |
| `??` | `docs/HEU_DAILY_MAIL_TASK_CENTER_INTAKE_20260704.md` | System/Governance | CONTROL_FOUNDATION | IT_DATA + Audit + BGH | YES |
| `??` | `docs/HEU_DAILY_MAIL_TASK_CENTER_INTAKE_20260705.md` | System/Governance | CONTROL_FOUNDATION | IT_DATA + Audit + BGH | YES |
| `M` | `docs/HEU_IMPLEMENTATION_LOG.md` | System/Governance | CONTROL_FOUNDATION | IT_DATA + Audit + BGH | YES |
| `M` | `docs/HEU_IT_DATA_DAILY_CONTROL_CHECK_20260703.md` | System/Governance | CONTROL_FOUNDATION | IT_DATA + Audit + BGH | YES |
| `M` | `docs/HEU_STANDARD_SYSTEM_BLUEPRINT_20260703.md` | System/Governance | CONTROL_FOUNDATION | IT_DATA + Audit + BGH | YES |
| `M` | `docs/HEU_SYSTEM_BUILD_BACKLOG.md` | System/Governance | CONTROL_FOUNDATION | IT_DATA + Audit + BGH | YES |
| `M` | `docs/HEU_AUTH_PASSWORD_RESET_HANDOFF_20260703.md` | Identity/Permission/Auth | CONTROL_FOUNDATION | IT_DATA + ADMIN + Audit | YES |
| `A` | `docs/HEU_IDENTITY_ORGANIZATION_CONTROL_CENTER_DECISION_20260703.md` | Identity/Permission/Auth | CONTROL_FOUNDATION | IT_DATA + ADMIN + Audit + PHAP_CHE | YES |
| `M` | `docs/HEU_PERMISSION_SCOPE_OPERATION_BREAKDOWN_20260703.md` | Identity/Permission/Auth | CONTROL_FOUNDATION | IT_DATA + ADMIN + Audit + PHAP_CHE | YES |
| `M` | `docs/HEU_POSITION_ASSIGNMENT_OWNER_QUEUE_20260703.md` | Identity/Permission/Auth | CONTROL_FOUNDATION | IT_DATA + ADMIN + Audit + PHAP_CHE | YES |
| `??` | `docs/HEU_ROLE_POSITION_OPERATION_TEST_MATRIX_20260704.md` | Identity/Permission/Auth | CONTROL_FOUNDATION | IT_DATA + ADMIN + Audit + PHAP_CHE | YES |
| `??` | `docs/HEU_SYSTEM_WIDE_PERMISSION_EXPANSION_REGISTER_20260703.md` | Identity/Permission/Auth | CONTROL_FOUNDATION | IT_DATA + ADMIN + Audit + PHAP_CHE | YES |
| `??` | `docs/HEU_USER_ACTIVATION_WORKSHEET_20260703.md` | Identity/Permission/Auth | CONTROL_FOUNDATION | IT_DATA + ADMIN + Audit | YES |
| `M` | `docs/HEU_USER_CREATE_SERVER_KEY_TEMPLATE_20260702.md` | Identity/Permission/Auth | CONTROL_FOUNDATION | IT_DATA + ADMIN + Audit | YES |
| `M` | `docs/HEU_USER_PERMISSION_OPERATION_CUTOVER_GATE_20260703.md` | Identity/Permission/Auth | CONTROL_FOUNDATION | IT_DATA + ADMIN + Audit + PHAP_CHE | YES |
| `M` | `docs/HEU_USER_SCOPE_BASELINE_REPAIR_QUEUE_20260703.md` | Identity/Permission/Auth | CONTROL_FOUNDATION | IT_DATA + ADMIN + Audit + PHAP_CHE | YES |
| `M` | `docs/HEU_LEGAL_SOP_GOVERNANCE_CONTROL_MATRIX_20260628_V01_DRAFT.md` | Legal/SOP/Data Logic | CONTROL_FOUNDATION | PHAP_CHE + IT_DATA + Audit + owner lane | YES |
| `M` | `docs/HEU_REAL_DATA_LOGIC_PROFESSIONAL_LEGAL_CONFIRMATION_REGISTER_20260702.md` | Legal/SOP/Data Logic | CONTROL_FOUNDATION | PHAP_CHE + IT_DATA + Audit + owner lane | YES |
| `M` | `docs/HEU_DATA_MASTER_REPORT_VIEW_COMPATIBILITY_20260628_V01_DRAFT.md` | Reports/Dashboard/Executive | CONTROL_FOUNDATION | BGH + IT_DATA + Audit + module owners | YES |
| `??` | `docs/HEU_EXECUTIVE_AUTH_SESSION_PROOF_HANDOFF_20260705.md` | Reports/Dashboard/Executive | CONTROL_FOUNDATION | BGH + IT_DATA + Audit + module owners | YES |
| `M` | `docs/HEU_EXECUTIVE_OPERATING_DECISION_DATA_REPORTING_PHASE_REGISTER_20260705.md` | Reports/Dashboard/Executive | CONTROL_FOUNDATION | BGH + IT_DATA + Audit + module owners | YES |
| `M` | `docs/HEU_REPORT_VIEW_REGISTER_20260627_V01_DRAFT.md` | Reports/Dashboard/Executive | CONTROL_FOUNDATION | BGH + IT_DATA + Audit + module owners | YES |
| `M` | `docs/HEU_REPORT_VIEW_SOURCE_MAP_20260628_V01_DRAFT.md` | Reports/Dashboard/Executive | CONTROL_FOUNDATION | BGH + IT_DATA + Audit + module owners | YES |
| `M` | `docs/HEU_AI_AGENT_SCOPE_REGISTER_20260627_V01_DRAFT.md` | AI/System Control | CONTROL_FOUNDATION | IT_DATA + Audit + BGH | YES |
| `M` | `docs/HEU_AI_ASSISTANT_POLICY_20260627.md` | AI/System Control | CONTROL_FOUNDATION | IT_DATA + Audit + BGH | YES |
| `M` | `docs/HEU_AI_BUILD_COLLISION_TRIAGE_20260703.md` | AI/System Control | CONTROL_FOUNDATION | IT_DATA + Audit + BGH | YES |
| `M` | `docs/HEU_SYSTEM_AI_TREND_ANTI_OVERFLOW_TASK_BREAKDOWN_20260703.md` | AI/System Control | CONTROL_FOUNDATION | IT_DATA + Audit + BGH | YES |
| `A` | `docs/HEU_ADMISSIONS_OWNER_CLOSURE_LEDGER_20260704.md` | Admissions M05 | NON_TTGDTX_MODULE_CONTROL | TUYEN_SINH + CTHSSV + IT_DATA + Audit | YES |
| `??` | `docs/HEU_ADMISSIONS_DOCUMENT_REVIEW_REPORTING_QUEUE_20260704.md` | Admissions M05 | NON_TTGDTX_MODULE_CONTROL | TUYEN_SINH + CTHSSV + IT_DATA + Audit | YES |
| `??` | `docs/HEU_ADMISSIONS_FINAL_MODULE_CLOSURE_GATE_20260704.md` | Admissions M05 | NON_TTGDTX_MODULE_CONTROL | TUYEN_SINH + CTHSSV + IT_DATA + Audit | YES |
| `??` | `docs/HEU_ADMISSIONS_SIGNED_UAT_EVIDENCE_INTAKE_20260704.md` | Admissions M05 | NON_TTGDTX_MODULE_CONTROL | TUYEN_SINH + CTHSSV + IT_DATA + Audit | YES |
| `A` | `docs/HEU_CTHSSV_AGGREGATE_READINESS_ALIGNMENT_20260704.md` | CTHSSV M06 | NON_TTGDTX_MODULE_CONTROL | CTHSSV + TUYEN_SINH + DAO_TAO + IT_DATA + Audit | YES |
| `A` | `docs/HEU_CTHSSV_EXTERNAL_EXECUTION_HANDOFF_PACKET_20260704.md` | CTHSSV M06 | NON_TTGDTX_MODULE_CONTROL | CTHSSV + TUYEN_SINH + DAO_TAO + IT_DATA + Audit | YES |
| `M` | `docs/HEU_CTHSSV_EXTERNAL_OWNER_ACTION_QUEUE_20260703.md` | CTHSSV M06 | NON_TTGDTX_MODULE_CONTROL | CTHSSV + TUYEN_SINH + DAO_TAO + IT_DATA + Audit | YES |
| `M` | `docs/HEU_CTHSSV_FINAL_MODULE_CLOSURE_GATE_20260703.md` | CTHSSV M06 | NON_TTGDTX_MODULE_CONTROL | CTHSSV + TUYEN_SINH + DAO_TAO + IT_DATA + Audit | YES |
| `M` | `docs/HEU_CTHSSV_MODULE_COMPLETION_BREAKDOWN_20260703.md` | CTHSSV M06 | NON_TTGDTX_MODULE_CONTROL | CTHSSV + TUYEN_SINH + DAO_TAO + IT_DATA + Audit | YES |
| `A` | `docs/HEU_CTHSSV_OWNER_CLOSURE_LEDGER_20260704.md` | CTHSSV M06 | NON_TTGDTX_MODULE_CONTROL | CTHSSV + TUYEN_SINH + DAO_TAO + IT_DATA + Audit | YES |
| `A` | `docs/HEU_CTHSSV_OWNER_EVIDENCE_HANDOFF_PROOF_20260704.md` | CTHSSV M06 | NON_TTGDTX_MODULE_CONTROL | CTHSSV + TUYEN_SINH + DAO_TAO + IT_DATA + Audit | YES |
| `M` | `docs/HEU_CTHSSV_PASS_LOCAL_REVIEW_DOSSIER_20260703.md` | CTHSSV M06 | NON_TTGDTX_MODULE_CONTROL | CTHSSV + TUYEN_SINH + DAO_TAO + IT_DATA + Audit | YES |
| `M` | `docs/HEU_CTHSSV_SIGNED_UAT_EVIDENCE_INTAKE_20260703.md` | CTHSSV M06 | NON_TTGDTX_MODULE_CONTROL | CTHSSV + TUYEN_SINH + DAO_TAO + IT_DATA + Audit | YES |
| `A` | `docs/HEU_CTHSSV_SYSTEM_REPORTING_HANDOFF_INDEX_20260704.md` | CTHSSV M06 | NON_TTGDTX_MODULE_CONTROL | CTHSSV + TUYEN_SINH + DAO_TAO + IT_DATA + Audit | YES |
| `A` | `docs/HEU_DAO_TAO_FINAL_LOCAL_REVIEW_DOSSIER_20260705.md` | Dao Tao/Khoa/Short Course | NON_TTGDTX_MODULE_CONTROL | DAO_TAO + KHOA + IT_DATA + Audit + PHAP_CHE where policy/privacy applies | YES |
| `A` | `docs/HEU_DAO_TAO_LOCAL_READINESS_AGGREGATOR_20260704.md` | Dao Tao/Khoa/Short Course | NON_TTGDTX_MODULE_CONTROL | DAO_TAO + KHOA + IT_DATA + Audit + PHAP_CHE where policy/privacy applies | YES |
| `M` | `docs/HEU_KHOA_GIANG_VIEN_EVIDENCE_TRACE_SOURCE_RECONCILIATION_CHECKLIST_20260703.md` | Dao Tao/Khoa/Short Course | NON_TTGDTX_MODULE_CONTROL | DAO_TAO + KHOA + IT_DATA + Audit + PHAP_CHE where policy/privacy applies | YES |
| `A` | `docs/HEU_KHOA_GIANG_VIEN_EXTERNAL_EXECUTION_HANDOFF_PACKET_20260705.md` | Dao Tao/Khoa/Short Course | NON_TTGDTX_MODULE_CONTROL | DAO_TAO + KHOA + IT_DATA + Audit + PHAP_CHE where policy/privacy applies | YES |
| `??` | `docs/HEU_KHOA_GIANG_VIEN_FINAL_MODULE_CLOSURE_GATE_20260704.md` | Dao Tao/Khoa/Short Course | NON_TTGDTX_MODULE_CONTROL | DAO_TAO + KHOA + IT_DATA + Audit + PHAP_CHE where policy/privacy applies | YES |
| `M` | `docs/HEU_KHOA_GIANG_VIEN_GAP_PACK_20260703.md` | Dao Tao/Khoa/Short Course | NON_TTGDTX_MODULE_CONTROL | DAO_TAO + KHOA + IT_DATA + Audit + PHAP_CHE where policy/privacy applies | YES |
| `??` | `docs/HEU_KHOA_GIANG_VIEN_LOCAL_COMPLETION_GATE_20260704.md` | Dao Tao/Khoa/Short Course | NON_TTGDTX_MODULE_CONTROL | DAO_TAO + KHOA + IT_DATA + Audit + PHAP_CHE where policy/privacy applies | YES |
| `A` | `docs/HEU_KHOA_GIANG_VIEN_OWNER_CLOSURE_LEDGER_20260704.md` | Dao Tao/Khoa/Short Course | NON_TTGDTX_MODULE_CONTROL | DAO_TAO + KHOA + IT_DATA + Audit + PHAP_CHE where policy/privacy applies | YES |
| `??` | `docs/HEU_KHOA_GIANG_VIEN_OWNER_EVIDENCE_HANDOFF_PROOF_20260704.md` | Dao Tao/Khoa/Short Course | NON_TTGDTX_MODULE_CONTROL | DAO_TAO + KHOA + IT_DATA + Audit + PHAP_CHE where policy/privacy applies | YES |
| `M` | `docs/HEU_KHOA_GIANG_VIEN_OWNER_SIGNOFF_MANIFEST_20260703.md` | Dao Tao/Khoa/Short Course | NON_TTGDTX_MODULE_CONTROL | DAO_TAO + KHOA + IT_DATA + Audit + PHAP_CHE where policy/privacy applies | YES |
| `??` | `docs/HEU_KHOA_GIANG_VIEN_REPORTS_STATUS_PANEL_20260704.md` | Dao Tao/Khoa/Short Course | NON_TTGDTX_MODULE_CONTROL | DAO_TAO + KHOA + IT_DATA + Audit + PHAP_CHE where policy/privacy applies | YES |
| `??` | `docs/HEU_KHOA_GIANG_VIEN_SIGNED_UAT_EVIDENCE_INTAKE_20260704.md` | Dao Tao/Khoa/Short Course | NON_TTGDTX_MODULE_CONTROL | DAO_TAO + KHOA + IT_DATA + Audit + PHAP_CHE where policy/privacy applies | YES |
| `??` | `docs/HEU_KHOA_GIANG_VIEN_SYSTEM_REPORTING_HANDOFF_INDEX_20260704.md` | Dao Tao/Khoa/Short Course | NON_TTGDTX_MODULE_CONTROL | DAO_TAO + KHOA + IT_DATA + Audit + PHAP_CHE where policy/privacy applies | YES |
| `M` | `docs/HEU_KHOA_GIANG_VIEN_UAT_RESULT_LEDGER_TEMPLATE_20260703.md` | Dao Tao/Khoa/Short Course | NON_TTGDTX_MODULE_CONTROL | DAO_TAO + KHOA + IT_DATA + Audit + PHAP_CHE where policy/privacy applies | YES |
| `M` | `docs/HEU_SHORT_COURSE_ATTENDANCE_PAYMENT_GAP_PACK_20260628_V01_DRAFT.md` | Dao Tao/Khoa/Short Course | NON_TTGDTX_MODULE_CONTROL | DAO_TAO + KHOA + IT_DATA + Audit + PHAP_CHE where policy/privacy applies | YES |
| `M` | `docs/HEU_SHORT_COURSE_EXTERNAL_OWNER_ACTION_QUEUE_20260703.md` | Dao Tao/Khoa/Short Course | NON_TTGDTX_MODULE_CONTROL | DAO_TAO + KHOA + IT_DATA + Audit + PHAP_CHE where policy/privacy applies | YES |
| `??` | `docs/HEU_SHORT_COURSE_FINAL_MODULE_CLOSURE_GATE_20260704.md` | Dao Tao/Khoa/Short Course | NON_TTGDTX_MODULE_CONTROL | DAO_TAO + KHOA + IT_DATA + Audit + PHAP_CHE where policy/privacy applies | YES |
| `A` | `docs/HEU_SHORT_COURSE_LOCAL_COMPLETION_GATE_20260704.md` | Dao Tao/Khoa/Short Course | NON_TTGDTX_MODULE_CONTROL | DAO_TAO + KHOA + IT_DATA + Audit + PHAP_CHE where policy/privacy applies | YES |
| `A` | `docs/HEU_SHORT_COURSE_OWNER_CLOSURE_LEDGER_20260704.md` | Dao Tao/Khoa/Short Course | NON_TTGDTX_MODULE_CONTROL | DAO_TAO + KHOA + IT_DATA + Audit + PHAP_CHE where policy/privacy applies | YES |
| `M` | `docs/HEU_SHORT_COURSE_OWNER_SIGNOFF_MANIFEST_20260702.md` | Dao Tao/Khoa/Short Course | NON_TTGDTX_MODULE_CONTROL | DAO_TAO + KHOA + IT_DATA + Audit + PHAP_CHE where policy/privacy applies | YES |
| `M` | `docs/HEU_SHORT_COURSE_SIGNED_UAT_EVIDENCE_INTAKE_20260704.md` | Dao Tao/Khoa/Short Course | NON_TTGDTX_MODULE_CONTROL | DAO_TAO + KHOA + IT_DATA + Audit + PHAP_CHE where policy/privacy applies | YES |
| `M` | `docs/HEU_SHORT_COURSE_UAT_RESULT_LEDGER_TEMPLATE_20260703.md` | Dao Tao/Khoa/Short Course | NON_TTGDTX_MODULE_CONTROL | DAO_TAO + KHOA + IT_DATA + Audit + PHAP_CHE where policy/privacy applies | YES |
| `M` | `docs/HEU_TRAINING_MODULE_COMPLETION_BREAKDOWN_20260703.md` | Dao Tao/Khoa/Short Course | NON_TTGDTX_MODULE_CONTROL | DAO_TAO + KHOA + IT_DATA + Audit + PHAP_CHE where policy/privacy applies | YES |
| `M` | `docs/HEU_MODULE_READINESS_GAP_MATRIX_20260628_V01_DRAFT.md` | Other Docs | CONTROL_FOUNDATION | IT_DATA + Audit + BGH | YES |

## 6. First Review Queue - 2026-07-07 Baseline

| Order | Queue | Files | Reason |
|---:|---|---:|---|
| 1 | TTGDTX/Finance docs | 10 | Current approved hardening scope and finance gate risk |
| 2 | System/Governance docs | 8 | These define current-state, implementation log, and operating rules |
| 3 | Identity/Permission/Auth docs | 10 | Needed before settings/scope/auth app review |
| 4 | Legal/SOP/Data Logic docs | 2 | Needed before owner/legal/SOP reliance language is trusted |
| 5 | Reports/Dashboard/Executive docs | 5 | Needed before dashboard/read-only claims are trusted |
| 6 | AI/System Control docs | 4 | Needed to keep AI advisory-only boundary |
| 7 | Non-TTGDTX module docs | 37 | Review-only after current scope; do not widen production scope |
| 8 | Other docs | 1 | Reclassify during content review |

## 7. Owner Boundary

- KHTC must review TTGDTX/Finance documents before finance reliance or payout language is trusted.
- PHAP_CHE must review legal/SOP, finance policy, role policy, evidence acceptance, privacy, and contract-related language.
- Audit must review every queue because the documents define evidence, blockers, gates, and PASS/NO_GO wording.
- BGH or an authorized owner must still approve any official GO/NO-GO outside Git/Codex/chat.
- Codex may classify, draft, and check only; Codex must not approve production, UAT, evidence acceptance, finance action, or owner decision.

## 8. Result

SOP-SCOPE: `docs` review classification only.

SOP-CHECK: Current status count refreshed to 98 docs entries after this register is committed. The 2026-07-07 baseline classification remains below for routing; row-by-row reclassification of all 98 current docs entries is a separate follow-up slice.

SOP-PROFESSIONAL: Module owners required as listed in the detailed table.

SOP-LEGAL: PHAP_CHE required for legal/SOP, finance, permission, policy, privacy, and evidence-reliance boundaries.

SOP-LOGIC: No code, script, SQL, config, or runtime behavior was changed by this register.

SOP-VERIFY: Current count refreshed from live Git status; no lint/build/audit run.

SOP-RESULT: DAT_TAM_THOI for docs review routing only.

SOP-NEXT: Choose one HEU_CONTROL docs cluster for row-by-row review next; keep database, app runtime, config, and scripts out of scope until the selected docs/control PR is clean.
