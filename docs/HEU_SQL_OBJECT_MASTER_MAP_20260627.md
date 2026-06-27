# HEU SQL Object To Master Name Map 2026-06-27

Status: DRAFT_CONTROL
Scope: P1-04 map existing SQL objects to HEU canonical master names
Production status: NO-GO for schema rename, drop, alter or production migration

## 1. Purpose

Create a bridge between current database objects and the canonical master names
defined in `docs/HEU_DATA_MODEL_V1.md` and `docs/HEU_DATA_DICTIONARY_V1.md`.
This is a naming/control artifact only. It does not rename tables, create
production migrations, approve data movement or make the current schema final.

Future database work should reference this map before adding new tables, views,
dashboards, imports or automation. If a current object is only a workflow table
or evidence table, map it to the nearest master domain and mark the gap.

## 2. Hard Rules

- Do not rename, drop, alter or merge production SQL objects from this document.
- Do not run production migration from Codex/chat.
- Do not treat a current object name as the final canonical master name.
- Do not add raw PII, bank data, contracts, passwords, OTPs or secret values to
  this map.
- Use this document to plan reviewed migrations only after backup, restore
  dry-run, UAT and human approval.

## 3. Master Object Map

| Canonical master | Current SQL object(s) | Current role | Gap / next control |
|---|---|---|---|
| `STUDENT_MASTER` | `leads`, `enrollments`, `short_student_master`, `ttgdtx_student_receivables` | Lead/student identity exists across CRM, short-course and TTGDTX finance contexts | No single generic student master yet; TTGDTX still uses lead/receivable context |
| `CLASS_MASTER` | `short_class_master`, `admission_offering_catalog`, `hou_academic_years`, `hou_terms` | Class/cohort/offering objects exist by module | TTGDTX class/cohort master is not consolidated |
| `PROGRAM_MAJOR_MASTER` | `admission_programs`, `admission_majors`, `admission_segment_program_rules`, `admission_offering_catalog`, `nganh_nghe_master`, `hou_programs`, `hou_majors` | Program/major catalogs exist across admission and HOU | Needs stable cross-module code policy |
| `COHORT_MASTER` | `admission_offering_catalog`, `hou_academic_years`, `hou_terms`, `short_class_master` | Cohort/year/term appears inside module-specific objects | No single generic cohort table yet |
| `CENTER_TTGDTX_MASTER` | `ttgdtx_center_master`, `ttgdtx_center_dropdown_options`, `partners` | TTGDTX center/dropdown and partner linkage | Keep generic; do not hard-code any reference center |
| `PARTNER_MASTER` | `partners`, `user_partner_scopes`, `ttgdtx_partner_contracts`, `hou_commission_payees` | Partner/legal/operator scope exists | Partner classification and access scope must remain explicit |
| `CONTRACT_MASTER` | `ttgdtx_partner_contracts`, `legal_registry`, `major_legal_tuition_gates` | Legal basis and major gate records exist | Contract archive, BBNT and payment evidence must stay separated |
| `TUITION_POLICY_MASTER` | `ttgdtx_tuition_policies`, `major_legal_tuition_gates`, `short_finance_invoices` | TTGDTX tuition policy exists; short-course invoice policy is separate | Fee-policy versioning must be consistent before automation |
| `FEE_ITEM_MASTER` | `ttgdtx_tuition_policies`, `short_finance_invoices`, `admission_payments` | Fee items are embedded in finance objects | Dedicated fee item master is a future gap |
| `RECEIVABLE_MASTER` | `ttgdtx_student_receivables`, `short_finance_invoices`, `admission_payments` | Expected amounts and balances exist by module | Receivable lifecycle and source evidence still need cross-module standardization |
| `PAYMENT_MASTER` | `ttgdtx_tuition_payments`, `short_payments`, `admission_payments`, `ttgdtx_partner_payment_disbursements` | Student collection and partner payout objects exist | Separate student collection, partner payout and evidence classes |
| `RECONCILIATION_MASTER` | `ttgdtx_tuition_reconciliation_batches`, `ttgdtx_tuition_reconciliation_lines` | TTGDTX reconciliation and lock path exists | Use period-lock policy before payment request automation |
| `ACCEPTANCE_EVIDENCE_MASTER` | `ttgdtx_source_documents`, `ttgdtx_source_control_checks`, `evidence_documents` | Evidence metadata exists | BBNT/acceptance minutes must stay separate from legal contract archive and bank data |
| `PAYMENT_REQUEST_MASTER` | `ttgdtx_partner_payment_requests`, `ttgdtx_partner_payment_request_lines` | Partner payment request exists | Requires BBNT/partner invoice dossier and human approval |
| `STAFF_USER_MASTER` | `users_profile`, `admission_departments`, `roles` | Staff/profile/role objects exist | User identity, department and role assignment need owner approval |
| `ROLE_PERMISSION_MASTER` | `roles`, `role_permissions`, `permission_registry`, `permission_delegations`, `active_role_permissions`, `user_admission_segment_scopes`, `user_partner_scopes`, `user_lead_visibility_scopes` | Role, permission and business scope objects exist | P6-04 signed role-scope UAT still required |
| `AUDIT_LOG` | `audit_logs`, `lead_activities`, `approval_requests`, `master_data_change_requests` | Audit, activity and approval evidence exists | Audit/event taxonomy should be standardized before production reporting |
| `WORKFLOW_REQUEST_MASTER` | `approval_requests`, `decision_gates`, `process_ownership_matrix`, `workflow_request_engine_status` | Approval and workflow controls exist | AI must not approve; workflow decisions require human owner |
| `IMPORT_CONTROL_MASTER` | `ttgdtx_tuition_import_batches`, `ttgdtx_tuition_import_staging_rows`, `ttgdtx_tuition_import_checks`, `ttgdtx_tuition_import_field_map` | TTGDTX import staging/control exists | Real import requires redacted source registry and signed UAT |
| `DASHBOARD_VIEW_MASTER` | `ttgdtx_accounting_dashboard_summary`, `ttgdtx_accounting_dashboard_partner_board`, `ttgdtx_accounting_dashboard_control_board`, `ttgdtx_accounting_dashboard_exception_board`, `ttgdtx_accounting_dashboard_recent_movements` | Read-only dashboard views exist | P5-01/P2-18 signed browser UAT required before production use |

## 4. TTGDTX P2 Object Chain

| P2 step | Current SQL object(s) | Canonical target |
|---|---|---|
| P2-01 Contract/partner master | `ttgdtx_partner_contracts`, `ttgdtx_partner_contract_readiness` | `CONTRACT_MASTER`, `PARTNER_MASTER` |
| P2-02 Tuition policy | `ttgdtx_tuition_policies`, `ttgdtx_tuition_policy_readiness`, `ttgdtx_tuition_policy_summary` | `TUITION_POLICY_MASTER`, `FEE_ITEM_MASTER` |
| P2-03 Receivables | `ttgdtx_student_receivables`, `ttgdtx_student_receivable_readiness`, `ttgdtx_receivable_summary` | `RECEIVABLE_MASTER`, `STUDENT_MASTER` |
| P2-05 Gate | `ttgdtx_receivable_candidate_leads` | `WORKFLOW_REQUEST_MASTER`, `RECEIVABLE_MASTER` |
| P2-06 Import control | `ttgdtx_tuition_import_batches`, `ttgdtx_tuition_import_staging_rows`, `ttgdtx_tuition_import_checks`, `ttgdtx_tuition_import_field_map` | `IMPORT_CONTROL_MASTER`, `SOURCE_DOCUMENT_MASTER` |
| P2-07/P2-08 Issue routing | `ttgdtx_import_issue_route_rules`, `ttgdtx_import_issue_tasks`, `ttgdtx_import_issue_task_events` | `WORKFLOW_REQUEST_MASTER`, `AUDIT_LOG` |
| P2-10 Collection | `ttgdtx_tuition_payments`, `ttgdtx_tuition_payment_board`, `ttgdtx_collection_summary` | `PAYMENT_MASTER`, `RECEIVABLE_MASTER` |
| P2-11 Source/legal/evidence control | `ttgdtx_source_documents`, `ttgdtx_source_control_checks` | `ACCEPTANCE_EVIDENCE_MASTER`, `CONTRACT_MASTER` |
| P2-12 Master/dropdown control | `ttgdtx_center_master`, `ttgdtx_center_dropdown_options` | `CENTER_TTGDTX_MASTER` |
| P2-13/P2-14 Reconciliation | `ttgdtx_tuition_reconciliation_batches`, `ttgdtx_tuition_reconciliation_lines`, `ttgdtx_reconciliation_review_board` | `RECONCILIATION_MASTER` |
| P2-15/P2-16 Payment request/approval | `ttgdtx_partner_payment_requests`, `ttgdtx_partner_payment_request_lines`, `ttgdtx_partner_payment_approval_board` | `PAYMENT_REQUEST_MASTER`, `WORKFLOW_REQUEST_MASTER` |
| P2-17 Payout execution | `ttgdtx_partner_payment_disbursements`, `ttgdtx_partner_payment_execution_board` | `PAYMENT_MASTER` |
| P2-18 Accounting dashboard | `ttgdtx_accounting_dashboard_*` views | `DASHBOARD_VIEW_MASTER` |
| P2-19 Real-data evidence metadata | `ttgdtx_source_documents`, `ttgdtx_p2_19_real_data_evidence_status`, `ttgdtx_source_document_status` | `ACCEPTANCE_EVIDENCE_MASTER`, `AUDIT_LOG` |

## 5. Migration Planning Notes

1. Preserve current object names until a reviewed migration plan says otherwise.
2. Future migrations should move toward canonical names through compatibility
   views, not destructive renames.
3. Any object that stores or links finance/legal/evidence data must keep audit
   trigger coverage and soft-delete behavior.
4. Any dashboard or AI feature must read through permission and workspace scope
   gates before querying sensitive data.
5. This map is not sufficient for production readiness. It must be combined
   with migration order, backup/restore dry-run, signed UAT and owner approval.

## 6. Current Result

P1-04 is PASS_LOCAL as a mapping/control artifact. It does not approve schema
changes, production migration, production dashboard use, real-data import or
canonical renaming. The next data-foundation step is to keep P1-01/P1-02/P1-03
aligned with this map and close remaining master-data gaps by reviewed,
non-destructive migration design.
