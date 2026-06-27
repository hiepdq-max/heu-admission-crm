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

## 4. Closure Rule

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
