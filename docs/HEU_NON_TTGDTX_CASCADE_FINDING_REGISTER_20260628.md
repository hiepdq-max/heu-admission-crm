# HEU Non-TTGDTX Cascade Finding Register 2026-06-28

Status: PASS_LOCAL_REGISTER
Scope: P6-06 non-TTGDTX/base `on delete cascade` findings
Scan source: current `database/*.sql`, excluding TTGDTX Step90-Step110
Current scan count: 44
Production status: NO-GO until conversion or written waiver is approved.

## 1. Purpose

This register maps each current non-TTGDTX/base cascade finding to stable
finding IDs, SQL locations, child tables, parent references and owner lanes. It
supports conversion or waiver planning only. It does not approve production
deletion, cascade execution, waiver, conversion migration, cleanup, rollback
success or production GO.

## 2. Boundary

- Do not run production migration from Codex/chat.
- Do not treat this register as written waiver or owner approval.
- Protected finance, evidence, approval, payment, legal, audit, lead and
  operating-history rows require restrict/archive/status conversion unless a
  narrow written waiver proves the row is derived-only.
- Waiver evidence must name table, owner, reason, rollback approach, expiry and
  proof that no protected record is removed.
- Raw PII, CCCD, phone, bank data, credentials, vouchers and raw exports stay
  outside Git/Codex/chat.

## 3. Finding Register

| Finding ID | SQL location | Child table | Column -> parent | Owner lane | Required disposition |
|---|---|---|---|---|---|
| P6-06-FIND-001 | `database/schema.sql:100` | `role_permissions` | `role_id -> roles` | HDQ-04 Master/control and dynamic configuration | REVIEW_OR_CONVERT; waiver only if derived permission join is proven safe |
| P6-06-FIND-002 | `database/schema.sql:116` | `users_profile` | `id -> auth.users` | HDQ-01 Base identity and CRM lead children | REQUIRES_CONVERSION_OR_WAIVER; identity/profile deletion must not erase accountability |
| P6-06-FIND-003 | `database/schema.sql:264` | `lead_activities` | `lead_id -> leads` | HDQ-01 Base identity and CRM lead children | REQUIRES_CONVERSION_OR_WAIVER; lead activity history is protected |
| P6-06-FIND-004 | `database/schema.sql:276` | `lead_followups` | `lead_id -> leads` | HDQ-01 Base identity and CRM lead children | REQUIRES_CONVERSION_OR_WAIVER; follow-up history is protected |
| P6-06-FIND-005 | `database/schema.sql:304` | `lead_documents` | `lead_id -> leads` | HDQ-01 Base identity and CRM lead children | REQUIRES_CONVERSION_OR_WAIVER; document evidence is protected |
| P6-06-FIND-006 | `database/schema.sql:338` | `admission_payments` | `lead_id -> leads` | HDQ-01 Base identity and CRM lead children | REQUIRES_CONVERSION_OR_WAIVER; payment evidence is protected |
| P6-06-FIND-007 | `database/step35a_hou_foundation.sql:94` | `hou_terms` | `academic_year_id -> hou_academic_years` | HDQ-05 Legal, tuition and short-course operations | REVIEW_OR_WAIVE; waive only if academic term is derived-only and not evidence-bearing |
| P6-06-FIND-008 | `database/step35a_hou_foundation.sql:119` | `hou_exam_dates` | `academic_year_id -> hou_academic_years` | HDQ-05 Legal, tuition and short-course operations | REVIEW_OR_WAIVE; exam schedule evidence may be operational history |
| P6-06-FIND-009 | `database/step35a_hou_foundation.sql:132` | `hou_graduation_rounds` | `academic_year_id -> hou_academic_years` | HDQ-05 Legal, tuition and short-course operations | REVIEW_OR_WAIVE; graduation round history may be operational history |
| P6-06-FIND-010 | `database/step35d_hou_commission_foundation.sql:106` | `hou_commission_policy_lines` | `policy_id -> hou_commission_policies` | HDQ-02 HOU finance and evidence | REQUIRES_CONVERSION_OR_WAIVER; commission policy basis is protected |
| P6-06-FIND-011 | `database/step35d_hou_commission_foundation.sql:132` | `hou_commission_eligibility_rules` | `policy_id -> hou_commission_policies` | HDQ-02 HOU finance and evidence | REQUIRES_CONVERSION_OR_WAIVER; commission eligibility basis is protected |
| P6-06-FIND-012 | `database/step35d_hou_commission_foundation.sql:278` | `hou_commission_claim_lines` | `claim_id -> hou_commission_claims` | HDQ-02 HOU finance and evidence | REQUIRES_CONVERSION_OR_WAIVER; claim-line finance history is protected |
| P6-06-FIND-013 | `database/step35d_hou_commission_foundation.sql:356` | `hou_commission_payment_lines` | `payment_batch_id -> hou_commission_payment_batches` | HDQ-02 HOU finance and evidence | REQUIRES_CONVERSION_OR_WAIVER; payment-line evidence is protected |
| P6-06-FIND-014 | `database/step35d_hou_commission_foundation.sql:433` | `hou_commission_breakeven_checks` | `claim_id -> hou_commission_claims` | HDQ-02 HOU finance and evidence | REQUIRES_CONVERSION_OR_WAIVER; breakeven check evidence is protected |
| P6-06-FIND-015 | `database/step35g_hou_evidence_files.sql:56` | `hou_evidence_files` | `lead_id -> leads` | HDQ-02 HOU finance and evidence | REQUIRES_CONVERSION_OR_WAIVER; evidence files are protected |
| P6-06-FIND-016 | `database/step35g_hou_evidence_files.sql:57` | `hou_evidence_files` | `location_id -> hou_locations` | HDQ-02 HOU finance and evidence | REQUIRES_CONVERSION_OR_WAIVER; evidence location history is protected unless derived-only |
| P6-06-FIND-017 | `database/step35g_hou_evidence_files.sql:58` | `hou_evidence_files` | `claim_id -> hou_commission_claims` | HDQ-02 HOU finance and evidence | REQUIRES_CONVERSION_OR_WAIVER; claim evidence is protected |
| P6-06-FIND-018 | `database/step36a_lead_condition_checklist.sql:26` | `lead_condition_checks` | `lead_id -> leads` | HDQ-01 Base identity and CRM lead children | REQUIRES_CONVERSION_OR_WAIVER; condition checklist evidence is protected |
| P6-06-FIND-019 | `database/step38_user_scopes_and_handovers.sql:48` | `user_admission_segment_scopes` | `user_id -> users_profile` | HDQ-03 Workspace and scope helpers | SOFT_REVOKE_OR_WAIVER; access-scope history must not disappear silently |
| P6-06-FIND-020 | `database/step38_user_scopes_and_handovers.sql:49` | `user_admission_segment_scopes` | `segment_id -> admission_segments` | HDQ-03 Workspace and scope helpers | SOFT_REVOKE_OR_WAIVER; segment-scope history must be preserved or waived narrowly |
| P6-06-FIND-021 | `database/step38_user_scopes_and_handovers.sql:60` | `user_partner_scopes` | `user_id -> users_profile` | HDQ-03 Workspace and scope helpers | SOFT_REVOKE_OR_WAIVER; partner-scope history must not disappear silently |
| P6-06-FIND-022 | `database/step38_user_scopes_and_handovers.sql:61` | `user_partner_scopes` | `partner_id -> partners` | HDQ-03 Workspace and scope helpers | SOFT_REVOKE_OR_WAIVER; partner-scope history must be preserved or waived narrowly |
| P6-06-FIND-023 | `database/step38_user_scopes_and_handovers.sql:72` | `lead_handovers` | `lead_id -> leads` | HDQ-03 Workspace and scope helpers | REQUIRES_CONVERSION_OR_WAIVER; handover responsibility history is protected |
| P6-06-FIND-024 | `database/step40_user_lead_visibility.sql:8` | `user_lead_visibility_scopes` | `user_id -> users_profile` | HDQ-03 Workspace and scope helpers | SOFT_REVOKE_OR_WAIVER; lead visibility history must remain auditable |
| P6-06-FIND-025 | `database/step41_master_control.sql:152` | `data_dictionary_fields` | `table_id -> data_dictionary_tables` | HDQ-04 Master/control and dynamic configuration | REVIEW_OR_CONVERT; dictionary history may affect governance proof |
| P6-06-FIND-026 | `database/step44_admission_segment_operating_os.sql:8` | `admission_segment_workspaces` | `segment_id -> admission_segments` | HDQ-04 Master/control and dynamic configuration | REQUIRES_CONVERSION_OR_WAIVER; workspace operating model is protected |
| P6-06-FIND-027 | `database/step44_admission_segment_operating_os.sql:33` | `admission_segment_operation_steps` | `segment_id -> admission_segments` | HDQ-04 Master/control and dynamic configuration | REQUIRES_CONVERSION_OR_WAIVER; operation-step history is protected |
| P6-06-FIND-028 | `database/step44_admission_segment_operating_os.sql:54` | `admission_segment_field_rules` | `segment_id -> admission_segments` | HDQ-04 Master/control and dynamic configuration | REQUIRES_CONVERSION_OR_WAIVER; field-rule history is protected |
| P6-06-FIND-029 | `database/step48_evidence_document_control.sql:50` | `evidence_documents` | `lead_id -> leads` | HDQ-01 Base identity and CRM lead children | REQUIRES_CONVERSION_OR_WAIVER; evidence document history is protected |
| P6-06-FIND-030 | `database/step48_evidence_document_control.sql:51` | `evidence_documents` | `approval_request_id -> approval_requests` | HDQ-04 Master/control and dynamic configuration | REQUIRES_CONVERSION_OR_WAIVER; approval evidence history is protected |
| P6-06-FIND-031 | `database/step49_master_data_governance.sql:109` | `master_data_change_requests` | `governance_id -> master_data_governance` | HDQ-04 Master/control and dynamic configuration | REQUIRES_CONVERSION_OR_WAIVER; governance request history is protected |
| P6-06-FIND-032 | `database/step52_admission_workspace_selector.sql:8` | `user_admission_workspace_preferences` | `user_id -> users_profile` | HDQ-03 Workspace and scope helpers | REVIEW_OR_WAIVE; preference row may be derived-only but needs owner proof |
| P6-06-FIND-033 | `database/step54_admission_object_field_schema.sql:9` | `admission_segment_program_rules` | `segment_id -> admission_segments` | HDQ-04 Master/control and dynamic configuration | REQUIRES_CONVERSION_OR_WAIVER; program rule history is protected |
| P6-06-FIND-034 | `database/step54_admission_object_field_schema.sql:10` | `admission_segment_program_rules` | `program_id -> admission_programs` | HDQ-04 Master/control and dynamic configuration | REQUIRES_CONVERSION_OR_WAIVER; program rule history is protected |
| P6-06-FIND-035 | `database/step54_admission_object_field_schema.sql:11` | `admission_segment_program_rules` | `major_id -> admission_majors` | HDQ-04 Master/control and dynamic configuration | REQUIRES_CONVERSION_OR_WAIVER; major rule history is protected |
| P6-06-FIND-036 | `database/step56_dynamic_admission_configuration.sql:29` | `admission_form_field_configs` | `segment_id -> admission_segments` | HDQ-04 Master/control and dynamic configuration | REQUIRES_CONVERSION_OR_WAIVER; dynamic form config history is protected |
| P6-06-FIND-037 | `database/step56_dynamic_admission_configuration.sql:89` | `admission_condition_rule_configs` | `segment_id -> admission_segments` | HDQ-04 Master/control and dynamic configuration | REQUIRES_CONVERSION_OR_WAIVER; admission rule config history is protected |
| P6-06-FIND-038 | `database/step57_dynamic_lead_form_enforcement.sql:8` | `lead_custom_field_values` | `lead_id -> leads` | HDQ-01 Base identity and CRM lead children | REQUIRES_CONVERSION_OR_WAIVER; custom lead evidence is protected |
| P6-06-FIND-039 | `database/step57_dynamic_lead_form_enforcement.sql:9` | `lead_custom_field_values` | `segment_id -> admission_segments` | HDQ-04 Master/control and dynamic configuration | REQUIRES_CONVERSION_OR_WAIVER; segment form evidence is protected |
| P6-06-FIND-040 | `database/step59_major_legal_tuition_gate.sql:13` | `major_legal_tuition_gates` | `nganh_id -> nganh_nghe_master` | HDQ-05 Legal, tuition and short-course operations | REQUIRES_CONVERSION_OR_WAIVER; legal/tuition gate history is protected |
| P6-06-FIND-041 | `database/step60_admission_catalog_workspace_gate.sql:33` | `admission_segment_catalog_controls` | `segment_id -> admission_segments` | HDQ-04 Master/control and dynamic configuration | REQUIRES_CONVERSION_OR_WAIVER; catalog gate history is protected |
| P6-06-FIND-042 | `database/step62_short_course_data_foundation.sql:264` | `short_attendance_sessions` | `class_id -> short_class_master` | HDQ-05 Legal, tuition and short-course operations | REQUIRES_CONVERSION_OR_WAIVER; attendance session history is protected |
| P6-06-FIND-043 | `database/step62_short_course_data_foundation.sql:291` | `short_attendance_records` | `session_id -> short_attendance_sessions` | HDQ-05 Legal, tuition and short-course operations | REQUIRES_CONVERSION_OR_WAIVER; attendance record history is protected |
| P6-06-FIND-044 | `database/step62_short_course_data_foundation.sql:292` | `short_attendance_records` | `enrollment_id -> short_enrollments` | HDQ-05 Legal, tuition and short-course operations | REQUIRES_CONVERSION_OR_WAIVER; enrollment attendance evidence is protected |

## 4. Owner Triage Batch Plan

The audit UI exposes `data-hard-delete-conversion-owner-triage="P6-06"` in
`components/audit/hard-delete-conversion-decision-queue.tsx`. The plan turns
the 44 findings into owner triage batches before any conversion or written
waiver can be discussed.

Decision value: `P6_06_TRIAGE_READY / NO_GO / BLOCKED`.

| Batch | Lane | First action | Minimum proof | Stop condition |
|---|---|---|---|---|
| P6-06-TRIAGE-01 | Finance, legal and evidence protected rows | Convert or block HOU finance, payment, evidence, tuition/legal and short-course operating rows before any waiver review | Restrict/archive/status-transition design, owner lane, rollback note and redacted evidence ID | Any finance, legal, evidence, attendance or payment row still depends on cascade delete |
| P6-06-TRIAGE-02 | CRM lead and handover history | Protect lead, follow-up, document, checklist and handover child rows before parent lead/user delete behavior is accepted | Restrict/archive design or written owner waiver proving the row is derived-only | Lead history, handover decision or payment/evidence trail can disappear |
| P6-06-TRIAGE-03 | Workspace, role and access-scope history | Prefer soft-revoke/status handling for user scope and visibility helpers | Soft-revoke/status-transition proof, P0-17 access closure compatibility and rollback note | Access scope, role history or P0-17 closure state can be hidden by delete |
| P6-06-TRIAGE-04 | Master, governance and dynamic configuration | Convert master/control/configuration cascades to restrict/archive unless proven derived-only | Governance owner decision, config impact note, rollback note and evidence ID | Gate, form, catalog, module or governance history can be removed |
| P6-06-TRIAGE-05 | Derived-helper waiver candidates | Review derived-only helpers last; waive only with table-specific, owner-signed, expiry/review date written waiver | Written waiver with affected table, reason, owner, rollback note, expiry/review date and no protected-row impact | Waiver is broad, oral, ownerless, lacks expiry/review date or covers protected records |

The first closure batch is finance/legal/evidence protected rows first. This
does not approve production deletion, cascade execution, waiver, conversion
migration, cleanup, rollback success or production GO.

### 4.1 Batch 1 Finance/Legal/Evidence Closure Checklist

The audit UI exposes
`data-hard-delete-finance-legal-evidence-batch="P6-06-TRIAGE-01"` in
`components/audit/hard-delete-waiver-evidence-checklist.tsx`.

Decision value: `P6_06_BATCH1_READY / NO_GO / BLOCKED`.

| Case | Scope | Required proof | Stop condition |
|---|---|---|---|
| P6-06-B1-01 | HOU commission policy, claim, payment-line and evidence rows: P6-06-FIND-010 through P6-06-FIND-017 | Restrict/archive/status-transition design, rollback note, KHTC owner lane and redacted evidence ID | Any commission, payment-line, claim or HOU evidence row can still vanish through parent delete |
| P6-06-B1-02 | Legal/tuition gate row: P6-06-FIND-040 | PHAP_CHE and KHTC classification, legal/tuition gate retention proof and rollback note | Legal or tuition gate history can be removed, waived broadly or hidden in cleanup |
| P6-06-B1-03 | Short-course attendance and enrollment rows: P6-06-FIND-042 through P6-06-FIND-044 | DAO_TAO/KHTC conversion plan preserving class, session, attendance and enrollment history | Attendance, payment support or enrollment evidence can disappear through cascade delete |
| P6-06-B1-04 | Payment/evidence bridge rows: P6-06-FIND-006, P6-06-FIND-015 through P6-06-FIND-017, P6-06-FIND-029 and P6-06-FIND-030 | Owner mapping, evidence-retention decision, rollback note and redacted controlled-evidence reference | Payment, approval or evidence documents can be deleted before finance/legal review |
| P6-06-B1-05 | Batch 1 closure record before owner GO/NO-GO | Decision value, owner signatures, controlled evidence location, redaction reviewer and no forbidden secret or raw PII content | Raw data, passwords, temporary passwords, OTPs, reset links, invite links or service-role keys appear in Git/Codex/chat |

Batch 1 is PASS_LOCAL packaging only. It does not convert rows, approve a
waiver, accept evidence, execute cleanup, accept rollback success or mark
production GO.

### 4.2 Batch 2 CRM Lead/Handover Closure Checklist

The audit UI exposes
`data-hard-delete-crm-lead-handover-batch="P6-06-TRIAGE-02"` in
`components/audit/hard-delete-waiver-evidence-checklist.tsx`.

Decision value: `P6_06_BATCH2_READY / NO_GO / BLOCKED`.

| Case | Scope | Required proof | Stop condition |
|---|---|---|---|
| P6-06-B2-01 | User/profile accountability row: P6-06-FIND-002 | Soft-revoke or inactive-profile design, P0-17 access closure compatibility, accountable owner lane and rollback note | Deleting an auth user can erase profile accountability, role history or access-closure evidence |
| P6-06-B2-02 | Lead activity, follow-up, document and custom-field rows: P6-06-FIND-003 through P6-06-FIND-005 and P6-06-FIND-038 | Restrict/archive design preserving lifecycle history, lead-document evidence, custom-field evidence and redacted evidence ID | Lead activity, follow-up, document or custom-field evidence can disappear through parent lead delete |
| P6-06-B2-03 | Admission payment and evidence-document rows tied to leads: P6-06-FIND-006 and P6-06-FIND-029 | KHTC/Audit evidence-retention decision, lead-to-payment trace proof, rollback note and controlled evidence reference | Payment evidence or evidence-document history can be removed before finance or audit review |
| P6-06-B2-04 | Lead condition checks and handover responsibility rows: P6-06-FIND-018 and P6-06-FIND-023 | P3-01/P3-02 handover compatibility note, owner lane, checklist retention proof and redacted evidence ID | Handover responsibility, condition-check evidence or lead-to-student decision history can disappear |
| P6-06-B2-05 | Batch 2 CRM lead/handover closure record before owner GO/NO-GO | Decision value, owner signatures, controlled evidence location, redaction reviewer, P3-01/P3-02 reference and P0-17 compatibility note | Broad waiver, raw PII, passwords, temporary passwords, OTPs, reset links, invite links or service-role keys appear in Git/Codex/chat |

Batch 2 is PASS_LOCAL packaging only. It does not convert rows, approve a
waiver, accept evidence, execute cleanup, accept rollback success or mark
production GO.

### 4.3 Batch 3 Workspace/Access-Scope Closure Checklist

The audit UI exposes
`data-hard-delete-access-scope-batch="P6-06-TRIAGE-03"` in
`components/audit/hard-delete-waiver-evidence-checklist.tsx`.

Decision value: `P6_06_BATCH3_READY / NO_GO / BLOCKED`.

| Case | Scope | Required proof | Stop condition |
|---|---|---|---|
| P6-06-B3-01 | User admission segment scope rows: P6-06-FIND-019 and P6-06-FIND-020 | Soft-revoke/status-transition design, segment-scope owner lane, P0-17 access closure compatibility and rollback note | Segment access history can disappear or a user can retain/lose scope without auditable closure |
| P6-06-B3-02 | User partner scope rows: P6-06-FIND-021 and P6-06-FIND-022 | Partner-scope retention decision, owner lane, access closure proof and redacted evidence ID | Partner-scope history can be deleted before TRUONG_PHONG/Audit review |
| P6-06-B3-03 | Lead visibility scope and workspace preference rows: P6-06-FIND-024 and P6-06-FIND-032 | Visibility-scope and workspace preference classification, derived-only waiver proof if applicable, and rollback note | Lead visibility or workspace preference cleanup can hide who could see leads |
| P6-06-B3-04 | P0-17 access closure compatibility before owner GO/NO-GO | ACCESS_RETAIN / REVOKE_OR_REDUCE / BLOCKED compatibility note, role leak check and soft-revoke evidence reference | P0-17 closure state, role history or workspace scope proof can be hidden by delete |
| P6-06-B3-05 | Batch 3 workspace/access-scope closure record | Decision value, owner signatures, controlled evidence location, redaction reviewer and no forbidden credential content | Broad waiver, passwords, temporary passwords, OTPs, reset links, invite links or service-role keys appear in Git/Codex/chat |

Batch 3 is PASS_LOCAL packaging only. It does not convert rows, approve a
waiver, accept evidence, execute cleanup, accept rollback success or mark
production GO.

### 4.4 Batch 4 Master/Governance/Config Closure Checklist

The audit UI exposes
`data-hard-delete-master-governance-batch="P6-06-TRIAGE-04"` in
`components/audit/hard-delete-waiver-evidence-checklist.tsx`.

Decision value: `P6_06_BATCH4_READY / NO_GO / BLOCKED`.

| Case | Scope | Required proof | Stop condition |
|---|---|---|---|
| P6-06-B4-01 | Role-permission and data-dictionary control rows: P6-06-FIND-001 and P6-06-FIND-025 | Governance owner decision, restrict/archive or derived-helper waiver proof, impact note and rollback note | Permission or dictionary history can be removed without governance owner review |
| P6-06-B4-02 | Admission segment workspace, operation-step and field-rule rows: P6-06-FIND-026 through P6-06-FIND-028 | Operating-model retention design, process owner lane, configuration impact note and redacted evidence ID | Workspace, operation-step or field-rule history can disappear through segment delete |
| P6-06-B4-03 | Approval evidence and master-governance request rows: P6-06-FIND-030 and P6-06-FIND-031 | Approval evidence retention decision, governance request retention proof, rollback note and controlled evidence reference | Approval evidence or master-data change history can be deleted before Audit/governance review |
| P6-06-B4-04 | Program rules, dynamic form configs, condition-rule configs and segment form evidence: P6-06-FIND-033 through P6-06-FIND-037 and P6-06-FIND-039 | Configuration retention classification, derived-only waiver proof if applicable, process owner lane and rollback note | Admission rule, form config or segment form evidence can be hidden by cleanup |
| P6-06-B4-05 | Catalog gate row and batch 4 closure: P6-06-FIND-041 | Catalog gate retention proof, owner signatures, controlled evidence location, redaction reviewer and no production-secret content | Catalog gate history can be removed, waived broadly, or used as production cleanup proof |

Batch 4 is PASS_LOCAL packaging only. It does not convert rows, approve a
waiver, accept evidence, execute cleanup, accept rollback success or mark
production GO.

### 4.5 Batch 5 Derived-Helper Waiver Checklist

The audit UI exposes
`data-hard-delete-derived-helper-waiver-batch="P6-06-TRIAGE-05"` in
`components/audit/hard-delete-waiver-evidence-checklist.tsx`.

Decision value: `P6_06_BATCH5_READY / NO_GO / BLOCKED`.

| Case | Scope | Required proof | Stop condition |
|---|---|---|---|
| P6-06-B5-01 | HOU academic term, exam-date and graduation-round waiver candidates: P6-06-FIND-007 through P6-06-FIND-009 | Derived-only proof, HOU/process owner reason, rollback note, expiry/review date and evidence that no tuition, exam or graduation record is lost | Academic term, exam-date or graduation-round row is evidence-bearing or used for finance/legal reliance |
| P6-06-B5-02 | Evidence-location and workspace-preference waiver candidates: P6-06-FIND-016 and P6-06-FIND-032 | Table-specific derived-only proof, affected-owner reason, rollback note, expiry/review date and no protected evidence or access-history impact | Evidence location or workspace preference deletion can hide evidence custody, access history or owner accountability |
| P6-06-B5-03 | Review-or-convert governance rows before any waiver: P6-06-FIND-001 and P6-06-FIND-025 | Governance owner review, derived-helper proof if waiver is proposed, impact note and rollback note | Permission or data-dictionary history is waived without governance owner sign-off |
| P6-06-B5-04 | Written waiver quality gate for every remaining derived helper | Affected table, owner, reason, derived-only proof, rollback approach, expiry/review date and explicit no-protected-record impact statement | Waiver is broad, oral, ownerless, lacks expiry/review date or covers finance/evidence/audit/legal/student-operating history |
| P6-06-B5-05 | Batch 5 final waiver register before owner GO/NO-GO | Decision value, owner signatures, controlled evidence location, redaction reviewer, waiver register reference and no forbidden sensitive content | PASS_LOCAL is treated as waiver approval, conversion migration approval, cleanup approval or production GO |

Batch 5 is PASS_LOCAL packaging only. It does not convert rows, approve a
waiver, accept evidence, execute cleanup, accept rollback success or mark
production GO.

## 5. Closure Rule

P6-06 remains IN_PROGRESS until every `REQUIRES_CONVERSION_OR_WAIVER` row above
has one of these outcomes:

1. reviewed conversion to restrict/archive/status transition;
2. narrow derived-helper waiver with owner, reason, rollback note, expiry and
   proof no protected record is removed;
3. explicit BLOCKED/NO_GO decision carried to owner Go/No-Go.

PASS_LOCAL only proves this register matches the current SQL surface and is
available for owner review. It does not approve production migration, data
deletion, cascade execution, waiver, conversion migration, cleanup, rollback
success or production GO.
