import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, rmSync } from "node:fs";
import path from "node:path";

const includeRuntime = process.argv.includes("--runtime");
const includeSecurity = process.argv.includes("--security");
const helpRequested = process.argv.includes("--help") || process.argv.includes("-h");
const snapshotOnly = process.argv.includes("--snapshot-only");
const strictWorktree = process.argv.includes("--strict-worktree");
const runDynamicGuards = process.argv.includes("--run-dynamic-guards");
const allowStaleLockCleanup = process.argv.includes("--cleanup-stale-lock");
const areaOrder = ["app", "components", "docs", "scripts", "database", "other"];
const dynamicGuardCandidateSampleLimit = 8;
const liveEnvDynamicGuardCandidateNames = new Set([
  "check:heu-system-wide-permission-expansion-readiness",
  "check:heu-user-activation-worksheet-readiness",
  "check:heu-user-operation-cutover-readiness",
]);
const dynamicGuardDefinitions = [
  {
    hint: "report_catalog_intake=npm.cmd run check:heu-report-catalog-department-intake",
    name: "check:heu-report-catalog-department-intake",
    paths: [
      "docs/HEU_REPORT_CATALOG_DEPARTMENT_INTAKE_20260703.md",
      "scripts/check-heu-report-catalog-department-intake.mjs",
    ],
    reason: "Report catalog intake guard for touched department catalog metadata",
  },
  {
    hint: "root_drive_intake=npm.cmd run check:heu-root-drive-department-confirmation-intake",
    name: "check:heu-root-drive-department-confirmation-intake",
    paths: [
      "docs/HEU_ROOT_DRIVE_DEPARTMENT_CONFIRMATION_INTAKE_20260703.md",
      "scripts/check-heu-root-drive-department-confirmation-intake.mjs",
    ],
    reason: "Root Drive department confirmation intake guard for touched Drive control metadata",
  },
  {
    hint: "user_create_readiness=npm.cmd run check:heu-user-create-readiness",
    name: "check:heu-user-create-readiness",
    paths: ["scripts/check-heu-user-create-readiness.mjs"],
    reason: "User-create readiness live guard for touched P0-17 user/permission checker metadata",
  },
  {
    hint: "permission_scope_readiness=npm.cmd run check:heu-permission-scope-readiness",
    name: "check:heu-permission-scope-readiness",
    paths: ["scripts/check-heu-permission-scope-readiness.mjs"],
    reason: "Permission/scope readiness live guard for touched P0-17 permission-scope checker metadata",
  },
  {
    hint: "user_scope_baseline_repair_queue=npm.cmd run check:heu-user-scope-baseline-repair-queue",
    name: "check:heu-user-scope-baseline-repair-queue",
    paths: ["scripts/check-heu-user-scope-baseline-repair-queue.mjs"],
    reason: "User scope baseline repair queue live guard for touched P0-17 scope baseline checker metadata",
  },
  {
    hint: "position_assignment_owner_queue=npm.cmd run check:heu-position-assignment-owner-queue",
    name: "check:heu-position-assignment-owner-queue",
    paths: ["scripts/check-heu-position-assignment-owner-queue.mjs"],
    reason: "Position assignment owner queue live guard for touched P0-17 position owner checker metadata",
  },
  {
    hint: "auth_password_self_service=npm.cmd run check:heu-auth-password-self-service-readiness",
    name: "check:heu-auth-password-self-service-readiness",
    paths: [
      "components/auth/login-form.tsx",
      "app/auth/forgot-password/page.tsx",
      "app/auth/forgot-password/forgot-password-form.tsx",
      "app/auth/update-password/page.tsx",
      "app/auth/update-password/update-password-form.tsx",
      "app/auth/callback/route.ts",
      "docs/HEU_AUTH_PASSWORD_RESET_HANDOFF_20260703.md",
      "docs/HEU_PERMISSION_SCOPE_OPERATION_BREAKDOWN_20260703.md",
      "scripts/check-heu-auth-password-self-service-readiness.mjs",
    ],
    reason: "Auth password self-service guard for touched P0-17 password reset/change surfaces",
  },
  {
    hint: "core_department_data_confirmation_task_register=npm.cmd run check:heu-core-department-data-confirmation-task-register",
    name: "check:heu-core-department-data-confirmation-task-register",
    paths: [
      "scripts/check-heu-core-department-data-confirmation-task-register.mjs",
    ],
    reason: "Core department data confirmation task register guard for touched metadata checker",
  },
  {
    hint: "executive_data_confirmation_task_center=npm.cmd run check:heu-executive-data-confirmation-task-center",
    name: "check:heu-executive-data-confirmation-task-center",
    paths: ["scripts/check-heu-executive-data-confirmation-task-center.mjs"],
    reason: "Executive Data Confirmation Task Center guard for touched STD-45 checker metadata",
  },
  {
    hint: "executive_auth_session_proof_handoff=npm.cmd run check:heu-executive-auth-session-proof-handoff",
    name: "check:heu-executive-auth-session-proof-handoff",
    paths: [
      "docs/HEU_EXECUTIVE_AUTH_SESSION_PROOF_HANDOFF_20260705.md",
      "scripts/check-heu-executive-auth-session-proof-handoff.mjs",
    ],
    reason: "Executive auth-session proof handoff guard for touched STD-10 handoff metadata",
  },
  {
    hint: "executive_effective_access_readonly=npm.cmd run check:heu-executive-effective-access-readonly-readiness",
    name: "check:heu-executive-effective-access-readonly-readiness",
    paths: ["scripts/check-heu-executive-effective-access-readonly-readiness.mjs"],
    reason: "Executive effective-access read-only live guard for touched STD-44 checker metadata",
  },
  {
    hint: "data_confirmation_schema=npm.cmd run check:heu-data-confirmation-task-center-schema",
    name: "check:heu-data-confirmation-task-center-schema",
    paths: [
      "database/step121_data_confirmation_task_center.sql",
      "scripts/check-heu-data-confirmation-task-center-schema.mjs",
    ],
    reason: "Data Confirmation Task Center schema guard for touched Step121 DCTC contract",
  },
  {
    hint: "data_confirmation_route=npm.cmd run check:heu-data-confirmation-task-center-route",
    name: "check:heu-data-confirmation-task-center-route",
    paths: [
      "app/data-confirmation/page.tsx",
      "app/data-confirmation/actions.ts",
      "scripts/check-heu-data-confirmation-task-center-route.mjs",
    ],
    reason: "Data Confirmation Task Center route guard for touched DCTC runtime surface",
  },
  {
    hint: "ai_build_collision_triage=npm.cmd run check:heu-ai-build-collision-triage",
    name: "check:heu-ai-build-collision-triage",
    paths: [
      "docs/HEU_AI_BUILD_COLLISION_TRIAGE_20260703.md",
      "scripts/check-heu-ai-build-collision-triage.mjs",
    ],
    reason: "AI build collision triage guard for touched multi-scope coordination metadata",
  },
  {
    hint: "lead_import_scope_readiness=npm.cmd run check:heu-lead-import-scope-readiness",
    name: "check:heu-lead-import-scope-readiness",
    paths: ["scripts/check-heu-lead-import-scope-readiness.mjs"],
    reason: "Lead/import scope readiness guard for touched M05 lead-import checker metadata",
  },
  {
    hint: "pipeline_followup_scope_readiness=npm.cmd run check:heu-pipeline-followup-scope-readiness",
    name: "check:heu-pipeline-followup-scope-readiness",
    paths: ["scripts/check-heu-pipeline-followup-scope-readiness.mjs"],
    reason: "Pipeline/follow-up scope readiness guard for touched M05 pipeline/follow-up checker metadata",
  },
  {
    hint: "reports_dashboard_scope_readiness=npm.cmd run check:heu-reports-dashboard-scope-readiness",
    name: "check:heu-reports-dashboard-scope-readiness",
    paths: ["scripts/check-heu-reports-dashboard-scope-readiness.mjs"],
    reason: "Reports/dashboard scope readiness guard for touched M05 reports-dashboard checker metadata",
  },
  {
    hint: "documents_scope_readiness=npm.cmd run check:heu-documents-scope-readiness",
    name: "check:heu-documents-scope-readiness",
    paths: ["scripts/check-heu-documents-scope-readiness.mjs"],
    reason: "Documents scope readiness guard for touched M05 documents checker metadata",
  },
  {
    hint: "admissions_document_review_queue=npm.cmd run check:heu-admissions-document-review-queue",
    name: "check:heu-admissions-document-review-queue",
    paths: ["scripts/check-heu-admissions-document-review-queue.mjs"],
    reason: "Admissions document-review queue guard for touched M05 checker metadata",
  },
  {
    hint: "admissions_signed_uat_evidence_intake=npm.cmd run check:heu-admissions-signed-uat-evidence-intake",
    name: "check:heu-admissions-signed-uat-evidence-intake",
    paths: ["scripts/check-heu-admissions-signed-uat-evidence-intake.mjs"],
    reason: "Admissions signed-UAT evidence intake guard for touched M05 checker metadata",
  },
  {
    hint: "admissions_final_closure_gate=npm.cmd run check:heu-admissions-final-closure-gate",
    name: "check:heu-admissions-final-closure-gate",
    paths: ["scripts/check-heu-admissions-final-closure-gate.mjs"],
    reason: "Admissions final-closure gate guard for touched M05 checker metadata",
  },
  {
    hint: "admissions_owner_closure_ledger=npm.cmd run check:heu-admissions-owner-closure-ledger",
    name: "check:heu-admissions-owner-closure-ledger",
    paths: ["scripts/check-heu-admissions-owner-closure-ledger.mjs"],
    reason: "Admissions owner-closure ledger guard for touched M05 checker metadata",
  },
  {
    hint: "admissions_local_completion=npm.cmd run check:heu-admissions-local-completion",
    name: "check:heu-admissions-local-completion",
    paths: ["scripts/check-heu-admissions-local-completion.mjs"],
    reason: "Admissions M05 local completion guard for touched M05 aggregate checker metadata",
  },
  {
    hint: "cthssv_local_completion=npm.cmd run check:heu-cthssv-local-completion",
    name: "check:heu-cthssv-local-completion",
    paths: ["scripts/check-heu-cthssv-local-completion.mjs"],
    reason: "CTHSSV M06 local completion guard for touched M06 aggregate checker metadata",
  },
  {
    hint: "executive_landing_role_gate=npm.cmd run check:heu-executive-landing-role-gate-readiness",
    name: "check:heu-executive-landing-role-gate-readiness",
    paths: ["scripts/check-heu-executive-landing-role-gate-readiness.mjs"],
    reason: "Executive landing role-gate guard for touched STD-01 landing role checker metadata",
  },
  {
    hint: "executive_active_focus_header=npm.cmd run check:heu-executive-active-focus-header-readiness",
    name: "check:heu-executive-active-focus-header-readiness",
    paths: [
      "scripts/check-heu-executive-active-focus-header-readiness.mjs",
      "components/dashboard/executive-dashboard-overview.tsx",
      "scripts/check-heu-executive-dashboard-readiness.mjs",
      "scripts/check-heu-executive-dashboard-visual-qa.mjs",
      "docs/HEU_STANDARD_SYSTEM_BLUEPRINT_20260703.md",
    ],
    reason: "Executive active-focus header guard for touched STD-30 dashboard focus metadata",
  },
  {
    hint: "dashboard_scope_visibility_invariant=npm.cmd run check:heu-dashboard-scope-visibility-invariant-readiness",
    name: "check:heu-dashboard-scope-visibility-invariant-readiness",
    paths: [
      "scripts/check-heu-dashboard-scope-visibility-invariant-readiness.mjs",
    ],
    reason: "Dashboard scope visibility invariant guard for touched STD-37 checker metadata",
  },
  {
    hint: "department_dashboard_scope_guard=npm.cmd run check:heu-department-dashboard-scope-guard-readiness",
    name: "check:heu-department-dashboard-scope-guard-readiness",
    paths: [
      "scripts/check-heu-department-dashboard-scope-guard-readiness.mjs",
    ],
    reason: "Department dashboard scope guard for touched STD-46 checker metadata",
  },
  {
    hint: "executive_operating_brain_completion=npm.cmd run check:heu-executive-operating-brain-completion-readiness",
    name: "check:heu-executive-operating-brain-completion-readiness",
    paths: [
      "scripts/check-heu-executive-operating-brain-completion-readiness.mjs",
    ],
    reason: "Executive operating-brain completion guard for touched STD-43 checker metadata",
  },
  {
    hint: "executive_role_scope_focus=npm.cmd run check:heu-executive-role-scope-focus-readiness",
    name: "check:heu-executive-role-scope-focus-readiness",
    paths: ["scripts/check-heu-executive-role-scope-focus-readiness.mjs"],
    reason: "Executive role/scope focus guard for touched STD-23 checker metadata",
  },
  {
    hint: "role_lane_governance=npm.cmd run check:heu-role-lane-governance",
    name: "check:heu-role-lane-governance",
    paths: ["scripts/check-heu-role-lane-governance.mjs"],
    reason: "Role lane governance guard for touched STD-12 checker metadata",
  },
  {
    hint: "role_position_operation_test_matrix=npm.cmd run check:heu-role-position-operation-test-matrix",
    name: "check:heu-role-position-operation-test-matrix",
    paths: ["scripts/check-heu-role-position-operation-test-matrix.mjs"],
    reason: "Role position operation test matrix guard for touched permission operation checker metadata",
  },
  {
    hint: "executive_production_blocker_triage=npm.cmd run check:heu-executive-production-blocker-triage-readiness",
    name: "check:heu-executive-production-blocker-triage-readiness",
    paths: ["scripts/check-heu-executive-production-blocker-triage-readiness.mjs"],
    reason: "Executive production blocker triage guard for touched STD-28 checker metadata",
  },
  {
    hint: "executive_priority_command_strip=npm.cmd run check:heu-executive-priority-command-strip-readiness",
    name: "check:heu-executive-priority-command-strip-readiness",
    paths: ["scripts/check-heu-executive-priority-command-strip-readiness.mjs"],
    reason: "Executive priority command strip guard for touched STD-29 checker metadata",
  },
  {
    hint: "executive_finance_reliance_triage=npm.cmd run check:heu-executive-finance-reliance-triage-readiness",
    name: "check:heu-executive-finance-reliance-triage-readiness",
    paths: [
      "scripts/check-heu-executive-finance-reliance-triage-readiness.mjs",
      "scripts/check-heu-finance-payment-scope-readiness.mjs",
    ],
    reason: "Executive finance reliance triage guard for touched STD-26 finance reliance checker metadata",
  },
  {
    hint: "executive_finance_reliance_fast_index=npm.cmd run check:heu-executive-finance-reliance-fast-index-readiness",
    name: "check:heu-executive-finance-reliance-fast-index-readiness",
    paths: ["scripts/check-heu-executive-finance-reliance-fast-index-readiness.mjs"],
    reason: "Executive finance reliance fast-index guard for touched STD-35 finance reliance checker metadata",
  },
  {
    hint: "executive_finance_readonly_reliance_lock=npm.cmd run check:heu-executive-finance-readonly-reliance-lock-readiness",
    name: "check:heu-executive-finance-readonly-reliance-lock-readiness",
    paths: [
      "scripts/check-heu-executive-finance-readonly-reliance-lock-readiness.mjs",
    ],
    reason: "Executive finance readonly reliance lock guard for touched STD-41 checker metadata",
  },
  {
    hint: "executive_finance_action_evidence_lock=npm.cmd run check:heu-executive-finance-action-evidence-lock-readiness",
    name: "check:heu-executive-finance-action-evidence-lock-readiness",
    paths: [
      "scripts/check-heu-executive-finance-action-evidence-lock-readiness.mjs",
    ],
    reason: "Executive finance action evidence lock guard for touched STD-49 checker metadata",
  },
  {
    hint: "executive_uat_evidence_triage=npm.cmd run check:heu-executive-uat-evidence-triage-readiness",
    name: "check:heu-executive-uat-evidence-triage-readiness",
    paths: ["scripts/check-heu-executive-uat-evidence-triage-readiness.mjs"],
    reason: "Executive UAT/evidence triage guard for touched STD-27 checker metadata",
  },
  {
    hint: "executive_uat_evidence_fast_action=npm.cmd run check:heu-executive-uat-evidence-fast-action-readiness",
    name: "check:heu-executive-uat-evidence-fast-action-readiness",
    paths: [
      "scripts/check-heu-executive-uat-evidence-fast-action-readiness.mjs",
    ],
    reason: "Executive UAT/evidence fast-action guard for touched STD-36 checker metadata",
  },
  {
    hint: "executive_uat_evidence_acceptance_lock=npm.cmd run check:heu-executive-uat-evidence-acceptance-lock-readiness",
    name: "check:heu-executive-uat-evidence-acceptance-lock-readiness",
    paths: [
      "scripts/check-heu-executive-uat-evidence-acceptance-lock-readiness.mjs",
    ],
    reason: "Executive UAT/evidence acceptance lock guard for touched STD-42 checker metadata",
  },
  {
    hint: "executive_report_dashboard_scope_contract=npm.cmd run check:heu-executive-report-dashboard-scope-contract-readiness",
    name: "check:heu-executive-report-dashboard-scope-contract-readiness",
    paths: [
      "scripts/check-heu-executive-report-dashboard-scope-contract-readiness.mjs",
    ],
    reason: "Executive report-dashboard scope contract guard for touched STD-39 checker metadata",
  },
  {
    hint: "executive_report_source_fast_index=npm.cmd run check:heu-executive-report-source-fast-index-readiness",
    name: "check:heu-executive-report-source-fast-index-readiness",
    paths: [
      "scripts/check-heu-executive-report-source-fast-index-readiness.mjs",
    ],
    reason: "Executive report source fast-index guard for touched STD-33 checker metadata",
  },
  {
    hint: "executive_report_source_map_triage=npm.cmd run check:heu-executive-report-source-map-triage-readiness",
    name: "check:heu-executive-report-source-map-triage-readiness",
    paths: [
      "scripts/check-heu-executive-report-source-map-triage-readiness.mjs",
    ],
    reason: "Executive report source-map triage guard for touched STD-24 checker metadata",
  },
  {
    hint: "executive_report_source_owner_confirmation_lock=npm.cmd run check:heu-executive-report-source-owner-confirmation-lock-readiness",
    name: "check:heu-executive-report-source-owner-confirmation-lock-readiness",
    paths: [
      "scripts/check-heu-executive-report-source-owner-confirmation-lock-readiness.mjs",
    ],
    reason: "Executive report source owner-confirmation lock guard for touched STD-47 checker metadata",
  },
  {
    hint: "executive_global_focus_shortcuts=npm.cmd run check:heu-executive-global-focus-shortcuts-readiness",
    name: "check:heu-executive-global-focus-shortcuts-readiness",
    paths: ["scripts/check-heu-executive-global-focus-shortcuts-readiness.mjs"],
    reason: "Executive global focus shortcuts guard for touched STD-19 shortcut checker metadata",
  },
  {
    hint: "executive_global_focus_compact_labels=npm.cmd run check:heu-executive-global-focus-compact-labels-readiness",
    name: "check:heu-executive-global-focus-compact-labels-readiness",
    paths: ["scripts/check-heu-executive-global-focus-compact-labels-readiness.mjs"],
    reason: "Executive global focus compact-label guard for touched STD-31 compact-label checker metadata",
  },
  {
    hint: "executive_focus_lane_separation=npm.cmd run check:heu-executive-focus-lane-separation-readiness",
    name: "check:heu-executive-focus-lane-separation-readiness",
    paths: [
      "scripts/check-heu-executive-focus-lane-separation-readiness.mjs",
      "components/layout/app-shell.tsx",
    ],
    reason: "Executive focus lane separation guard for touched STD-20 AppShell lane metadata",
  },
  {
    hint: "executive_focus_mode=npm.cmd run check:heu-executive-focus-mode-readiness",
    name: "check:heu-executive-focus-mode-readiness",
    paths: [
      "scripts/check-heu-executive-focus-mode-readiness.mjs",
      "app/page.tsx",
    ],
    reason: "Executive focus mode guard for touched STD-17 query-param focus routing metadata",
  },
  {
    hint: "executive_focus_next_action=npm.cmd run check:heu-executive-focus-next-action-readiness",
    name: "check:heu-executive-focus-next-action-readiness",
    paths: ["scripts/check-heu-executive-focus-next-action-readiness.mjs"],
    reason: "Executive focus next-action guard for touched STD-18 route-hint checker metadata",
  },
  {
    hint: "executive_department_role_lane_map=npm.cmd run check:heu-executive-department-role-lane-map-readiness",
    name: "check:heu-executive-department-role-lane-map-readiness",
    paths: ["scripts/check-heu-executive-department-role-lane-map-readiness.mjs"],
    reason: "Executive department role-lane map guard for touched STD-32 checker metadata",
  },
  {
    hint: "executive_focus_scoped_navigator=npm.cmd run check:heu-executive-focus-scoped-navigator-readiness",
    name: "check:heu-executive-focus-scoped-navigator-readiness",
    paths: ["scripts/check-heu-executive-focus-scoped-navigator-readiness.mjs"],
    reason: "Executive focus scoped-navigator guard for touched STD-22 visible-section checker metadata",
  },
  {
    hint: "legal_sop_authority=npm.cmd run check:heu-legal-sop-authority-readiness",
    name: "check:heu-legal-sop-authority-readiness",
    paths: ["scripts/check-heu-legal-sop-authority-readiness.mjs"],
    reason: "Legal SOP authority guard for touched STD-14 Legal/SOP checker metadata",
  },
  {
    hint: "executive_legal_sop_workflow_backbone_lock=npm.cmd run check:heu-executive-legal-sop-workflow-backbone-lock-readiness",
    name: "check:heu-executive-legal-sop-workflow-backbone-lock-readiness",
    paths: [
      "scripts/check-heu-executive-legal-sop-workflow-backbone-lock-readiness.mjs",
    ],
    reason: "Executive Legal/SOP workflow backbone lock guard for touched STD-48 checker metadata",
  },
  {
    hint: "executive_legal_sop_required_answer_index=npm.cmd run check:heu-executive-legal-sop-required-answer-index-readiness",
    name: "check:heu-executive-legal-sop-required-answer-index-readiness",
    paths: [
      "scripts/check-heu-executive-legal-sop-required-answer-index-readiness.mjs",
    ],
    reason: "Executive Legal/SOP required-answer index guard for touched STD-34 Legal/SOP checker metadata",
  },
  {
    hint: "executive_legal_sop_evidence_authority_queue=npm.cmd run check:heu-executive-legal-sop-evidence-authority-queue-readiness",
    name: "check:heu-executive-legal-sop-evidence-authority-queue-readiness",
    paths: [
      "scripts/check-heu-executive-legal-sop-evidence-authority-queue-readiness.mjs",
    ],
    reason: "Executive Legal/SOP evidence-authority queue guard for touched STD-40 checker metadata",
  },
  {
    hint: "executive_legal_sop_triage=npm.cmd run check:heu-executive-legal-sop-triage-readiness",
    name: "check:heu-executive-legal-sop-triage-readiness",
    paths: ["scripts/check-heu-executive-legal-sop-triage-readiness.mjs"],
    reason: "Executive Legal/SOP triage guard for touched STD-25 Legal/SOP checker metadata",
  },
  {
    hint: "executive_dashboard_permission_matrix=npm.cmd run check:heu-executive-dashboard-permission-matrix-readiness",
    name: "check:heu-executive-dashboard-permission-matrix-readiness",
    paths: [
      "scripts/check-heu-executive-dashboard-permission-matrix-readiness.mjs",
    ],
    reason: "Executive dashboard permission matrix guard for touched STD-38 permission checker metadata",
  },
  {
    hint: "tchc_records_archive=npm.cmd run check:heu-tchc-records-archive-system",
    name: "check:heu-tchc-records-archive-system",
    paths: [
      "docs/HEU_TCHC_RECORDS_ARCHIVE_SYSTEM_20260703.md",
      "scripts/check-heu-tchc-records-archive-system.mjs",
      "app/tchc/records-archive/page.tsx",
      "app/tchc/records-archive/intake/page.tsx",
      "app/tchc/records-archive/intake/actions.ts",
      "components/tchc/tchc-records-archive-readonly.tsx",
      "components/tchc/tchc-records-archive-intake-template.tsx",
      "database/step118_tchc_records_archive_system.sql",
      "database/step119_tchc_records_archive_intake_audit.sql",
    ],
    reason: "TCHC records archive system guard for touched archive route/doc/sql metadata",
  },
  {
    hint: "short_course_scope=npm.cmd run check:heu-short-course-scope-readiness",
    name: "check:heu-short-course-scope-readiness",
    paths: [
      "scripts/check-heu-short-course-scope-readiness.mjs",
      "app/short-course/page.tsx",
      "app/short-course/drilldown/page.tsx",
      "app/short-course/intake/page.tsx",
      "app/short-course/intake/actions.ts",
      "app/short-course/workflows/page.tsx",
      "app/short-course/workflows/actions.ts",
      "app/short-course/actions/page.tsx",
      "lib/sensitive-display.ts",
    ],
    reason: "Short Course scope readiness guard for touched workspace scope, workflow and sensitive-display files",
  },
  {
    hint: "short_course_role_negative_access=npm.cmd run check:heu-short-course-role-negative-access",
    name: "check:heu-short-course-role-negative-access",
    paths: [
      "scripts/check-heu-short-course-role-negative-access.mjs",
      "docs/HEU_SHORT_COURSE_ROLE_NEGATIVE_ACCESS_CHECKLIST_20260703.md",
      "components/short-course/short-course-attendance-payment-gap-pack.tsx",
      "docs/HEU_SHORT_COURSE_ATTENDANCE_PAYMENT_GAP_PACK_20260628_V01_DRAFT.md",
      "scripts/audit-heu-short-course-attendance-payment-gap-pack.mjs",
    ],
    reason: "Short Course role negative-access guard for touched TRN-08 checklist, panel and audit metadata",
  },
  {
    hint: "short_course_final_closure_gate=npm.cmd run check:heu-short-course-final-closure-gate",
    name: "check:heu-short-course-final-closure-gate",
    paths: ["scripts/check-heu-short-course-final-closure-gate.mjs"],
    reason: "Short Course final-closure gate guard for touched P9-11 checker metadata",
  },
  {
    hint: "short_course_owner_closure_ledger=npm.cmd run check:heu-short-course-owner-closure-ledger",
    name: "check:heu-short-course-owner-closure-ledger",
    paths: ["scripts/check-heu-short-course-owner-closure-ledger.mjs"],
    reason: "Short Course owner-closure ledger guard for touched P9-12 checker metadata",
  },
  {
    hint: "short_course_local_completion=npm.cmd run check:heu-short-course-local-completion",
    name: "check:heu-short-course-local-completion",
    paths: ["scripts/check-heu-short-course-local-completion.mjs"],
    reason: "Short Course local completion guard for touched P9-13 aggregate checker metadata",
  },
  {
    hint: "khoa_giang_vien_signed_uat_evidence_intake=npm.cmd run check:heu-khoa-giang-vien-signed-uat-evidence-intake",
    name: "check:heu-khoa-giang-vien-signed-uat-evidence-intake",
    paths: ["scripts/check-heu-khoa-giang-vien-signed-uat-evidence-intake.mjs"],
    reason: "Khoa/Giang vien signed-UAT evidence intake guard for touched P10-07 checker metadata",
  },
  {
    hint: "khoa_giang_vien_final_closure_gate=npm.cmd run check:heu-khoa-giang-vien-final-closure-gate",
    name: "check:heu-khoa-giang-vien-final-closure-gate",
    paths: ["scripts/check-heu-khoa-giang-vien-final-closure-gate.mjs"],
    reason: "Khoa/Giang vien final-closure gate guard for touched P10-08 checker metadata",
  },
  {
    hint: "khoa_giang_vien_owner_closure_ledger=npm.cmd run check:heu-khoa-giang-vien-owner-closure-ledger",
    name: "check:heu-khoa-giang-vien-owner-closure-ledger",
    paths: ["scripts/check-heu-khoa-giang-vien-owner-closure-ledger.mjs"],
    reason: "Khoa/Giang vien owner-closure ledger guard for touched P10-09 checker metadata",
  },
  {
    hint: "khoa_giang_vien_local_completion=npm.cmd run check:heu-khoa-giang-vien-local-completion",
    name: "check:heu-khoa-giang-vien-local-completion",
    paths: ["scripts/check-heu-khoa-giang-vien-local-completion.mjs"],
    reason: "Khoa/Giang vien local completion guard for touched P10-10 aggregate checker metadata",
  },
  {
    hint: "khoa_giang_vien_system_reporting_handoff=npm.cmd run check:heu-khoa-giang-vien-system-reporting-handoff",
    name: "check:heu-khoa-giang-vien-system-reporting-handoff",
    paths: ["scripts/check-heu-khoa-giang-vien-system-reporting-handoff.mjs"],
    reason: "Khoa/Giang vien system-reporting handoff guard for touched P10-11 checker metadata",
  },
  {
    hint: "khoa_giang_vien_reports_status_panel=npm.cmd run check:heu-khoa-giang-vien-reports-status-panel",
    name: "check:heu-khoa-giang-vien-reports-status-panel",
    paths: ["scripts/check-heu-khoa-giang-vien-reports-status-panel.mjs"],
    reason: "Khoa/Giang vien reports-status panel guard for touched P10-12 checker metadata",
  },
  {
    hint: "khoa_giang_vien_owner_evidence_handoff_proof=npm.cmd run check:heu-khoa-giang-vien-owner-evidence-handoff-proof",
    name: "check:heu-khoa-giang-vien-owner-evidence-handoff-proof",
    paths: [
      "scripts/check-heu-khoa-giang-vien-owner-evidence-handoff-proof.mjs",
    ],
    reason: "Khoa/Giang vien owner-evidence handoff proof guard for touched P10-13 checker metadata",
  },
  {
    hint: "khoa_giang_vien_external_execution_handoff=npm.cmd run check:heu-khoa-giang-vien-external-execution-handoff",
    name: "check:heu-khoa-giang-vien-external-execution-handoff",
    paths: [
      "scripts/check-heu-khoa-giang-vien-external-execution-handoff.mjs",
    ],
    reason: "Khoa/Giang vien external execution handoff guard for touched P10-14 checker metadata",
  },
  {
    hint: "dao_tao_local_readiness=npm.cmd run check:heu-dao-tao-local-readiness",
    name: "check:heu-dao-tao-local-readiness",
    paths: ["scripts/check-heu-dao-tao-local-readiness.mjs"],
    reason: "Dao Tao local readiness aggregator guard for touched P9/P10 aggregate checker metadata",
  },
  {
    hint: "dao_tao_final_local_review_dossier=npm.cmd run check:heu-dao-tao-final-local-review-dossier",
    name: "check:heu-dao-tao-final-local-review-dossier",
    paths: ["scripts/check-heu-dao-tao-final-local-review-dossier.mjs"],
    reason: "Dao Tao final local review dossier guard for touched P11-01 checker metadata",
  },
  {
    hint: "training_module_completion_breakdown=npm.cmd run check:heu-training-module-completion-breakdown",
    name: "check:heu-training-module-completion-breakdown",
    paths: ["scripts/check-heu-training-module-completion-breakdown.mjs"],
    reason: "Training module completion breakdown guard for touched M07/P9 checker metadata",
  },
  {
    hint: "accounting_module_breakdown=npm.cmd run check:heu-accounting-module-breakdown",
    name: "check:heu-accounting-module-breakdown",
    paths: [
      "docs/HEU_ACCOUNTING_MODULE_COMPLETION_BREAKDOWN_20260703.md",
      "scripts/check-heu-accounting-module-breakdown.mjs",
      "scripts/check-heu-accounting-local-readiness.mjs",
      "scripts/check-heu-accounting-risk-closure-ledger.mjs",
      "scripts/check-heu-accounting-owner-closure-ledger.mjs",
      "docs/HEU_USER_SCOPE_BASELINE_REPAIR_QUEUE_20260703.md",
      "docs/HEU_NEGATIVE_CONTROL_ACCOUNT_QUEUE_20260703.md",
      "docs/P0_19_P2_01_P2_02_PILOT_OPEN_UAT_RUNBOOK.md",
      "docs/HEU_ACCOUNTING_RISK_CLOSURE_LEDGER_20260703.md",
      "docs/HEU_ACCOUNTING_UAT_OWNER_CLOSURE_LEDGER_20260703.md",
    ],
    reason: "Accounting module breakdown guard for touched local ACCT control docs and checker metadata",
  },
  {
    hint: "negative_control_account_queue=npm.cmd run check:heu-negative-control-account-queue",
    name: "check:heu-negative-control-account-queue",
    paths: ["scripts/check-heu-negative-control-account-queue.mjs"],
    reason: "Negative-control account queue live guard for touched P0-17/ACCT-00 negative account metadata",
  },
  {
    hint: "accounting_negative_control_owner_action=npm.cmd run check:heu-accounting-negative-control-owner-action-queue",
    name: "check:heu-accounting-negative-control-owner-action-queue",
    paths: [
      "docs/HEU_ACCOUNTING_NEGATIVE_CONTROL_OWNER_ACTION_QUEUE_20260703.md",
      "scripts/check-heu-accounting-negative-control-owner-action-queue.mjs",
    ],
    reason: "Accounting negative-control owner-action queue guard for touched ACCT-00 owner routing metadata",
  },
  {
    hint: "accounting_open_blocker=npm.cmd run check:heu-accounting-open-blocker-action-queue",
    name: "check:heu-accounting-open-blocker-action-queue",
    paths: [
      "docs/HEU_ACCOUNTING_OPEN_BLOCKER_ACTION_QUEUE_20260703.md",
      "scripts/check-heu-accounting-open-blocker-action-queue.mjs",
    ],
    reason: "Accounting open blocker owner-action queue guard for touched ACCT blocker queue metadata",
  },
  {
    hint: "accounting_no_duplicate=npm.cmd run check:heu-accounting-no-duplicate-control-ledger",
    name: "check:heu-accounting-no-duplicate-control-ledger",
    paths: [
      "docs/HEU_ACCOUNTING_NO_DUPLICATE_CONTROL_LEDGER_20260703.md",
      "scripts/check-heu-accounting-no-duplicate-control-ledger.mjs",
      "docs/P2_17_DUPLICATE_PAYOUT_UAT_EVIDENCE_LEDGER_20260703.md",
      "database/step90_ttgdtx_student_receivables.sql",
      "database/step96_ttgdtx_tuition_collection_p2_10.sql",
      "database/step101_ttgdtx_reconciliation_p2_13.sql",
      "database/step105_ttgdtx_partner_payment_request_p2_15.sql",
      "database/step107_ttgdtx_payment_execution_p2_17.sql",
      "scripts/audit-ttgdtx-receivable-payment-lifecycle.mjs",
      "scripts/audit-ttgdtx-payment-dossier-checklist.mjs",
      "scripts/audit-ttgdtx-payout-duplicate-guard.mjs",
    ],
    reason: "Accounting no-duplicate ledger guard for touched ACCT duplicate-control SQL, ledger and audit metadata",
  },
];
const commands = [
  {
    name: "check:heu-it-data-daily-control",
    reason: "IT/Data daily PASS_LOCAL boundary and control links",
  },
  {
    name: "audit:heu-current-state-inventory",
    reason: "Stage D / production NO-GO current-state alignment",
  },
  {
    name: "audit:heu-vietnamese-text-encoding",
    reason: "Readable Vietnamese text and no mojibake in touched docs/source",
  },
];

if (includeSecurity) {
  commands.push({
    name: "audit:heu-user-account-security",
    reason: "P0-17 user, role, password and cutover guard",
  });
}

if (includeRuntime) {
  commands.push(
    {
      name: "lint",
      reason: "Runtime/source lint after UI or shared code changes",
    },
    {
      name: "build",
      reason: "Next.js build after route, component or server-action changes",
    },
  );
}

let reportedSnapshot = null;

function elapsedMs(startedAt) {
  const elapsed = Number(process.hrtime.bigint() - startedAt) / 1_000_000;
  return Math.round(elapsed);
}

function runGit(args) {
  return spawnSync("git", args, {
    cwd: process.cwd(),
    encoding: "utf8",
    maxBuffer: 1024 * 1024 * 4,
    windowsHide: true,
  });
}

function normalizeProcessText(value) {
  return value.replaceAll("\\", "/").toLowerCase();
}

function collectProcessRecords() {
  const result =
    process.platform === "win32"
      ? spawnSync(
          "powershell.exe",
          [
            "-NoProfile",
            "-Command",
            "Get-CimInstance Win32_Process -Filter \"name = 'node.exe'\" | ForEach-Object { \"{0}`t{1}\" -f $_.ProcessId, $_.CommandLine }",
          ],
          {
            encoding: "utf8",
            maxBuffer: 1024 * 1024 * 2,
            windowsHide: true,
          },
        )
      : spawnSync("ps", ["-eo", "pid=,args="], {
          encoding: "utf8",
          maxBuffer: 1024 * 1024 * 2,
          windowsHide: true,
        });

  if (result.status !== 0) {
    return [];
  }

  const lines = (result.stdout ?? "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (process.platform === "win32") {
    return lines.map((line) => {
      const [pid, ...commandParts] = line.split("\t");

      return {
        commandLine: commandParts.join("\t"),
        pid,
      };
    });
  }

  return lines.map((line) => {
    const match = line.match(/^(\d+)\s+(.+)$/);

    return {
      commandLine: match ? match[2] : line,
      pid: match ? match[1] : "unknown",
    };
  });
}

function isNextRuntimeProcess(commandLine) {
  const normalized = normalizeProcessText(commandLine);
  const repoRoot = normalizeProcessText(process.cwd());

  if (!normalized.includes(repoRoot)) {
    return false;
  }

  return (
    normalized.includes(".next/dev/") ||
    normalized.includes("start-server.js") ||
    /next[^\r\n]*(\s|")dev(\s|$)/.test(normalized) ||
    /next[^\r\n]*(\s|")build(\s|$)/.test(normalized)
  );
}

function nextRuntimeProcessKind(commandLine) {
  const normalized = normalizeProcessText(commandLine);

  if (normalized.includes(".next/dev/")) return "next-dev-worker";
  if (normalized.includes("start-server.js")) return "next-server";
  if (/npm[^\r\n]*run[^\r\n]*dev/.test(normalized)) return "npm-run-dev";
  if (/next[^\r\n]*(\s|")dev(\s|$)/.test(normalized)) return "next-dev";
  if (/next[^\r\n]*(\s|")build(\s|$)/.test(normalized)) return "next-build";

  return "next-runtime";
}

function collectRuntimeBlockers({ cleanupStaleLock = true } = {}) {
  const blockers = [];
  const details = [];
  const notes = [];
  let staleLockCleanupSkipped = false;

  const processSummaries = collectProcessRecords()
    .filter((processRecord) => isNextRuntimeProcess(processRecord.commandLine))
    .map(
      (processRecord) =>
        `pid=${processRecord.pid}:${nextRuntimeProcessKind(processRecord.commandLine)}`,
    );

  const nextLockPath = path.join(process.cwd(), ".next", "lock");
  if (existsSync(nextLockPath)) {
    if (processSummaries.length === 0) {
      if (cleanupStaleLock) {
        try {
          rmSync(nextLockPath, { force: true });
          notes.push(
            "HEU_FAST_LOOP_STALE_NEXT_LOCK_CLEANUP: REMOVED - stale .next/lock had no active Next dev/build process.",
          );
        } catch {
          blockers.push("stale .next/lock cleanup failed");
          details.push(".next/lock cleanup_failed");
        }
      } else {
        staleLockCleanupSkipped = true;
        notes.push(
          "HEU_FAST_LOOP_STALE_NEXT_LOCK_CLEANUP: SKIPPED - cleanup requires explicit --cleanup-stale-lock after process preflight.",
        );
        blockers.push("stale .next/lock exists");
        details.push(".next/lock stale_present_cleanup_skipped");
      }
    } else {
      blockers.push(".next/lock exists");
      details.push(".next/lock");
    }
  }

  if (processSummaries.length > 0) {
    blockers.push("active Next dev/build process for this repo");
    details.push(`processes=${processSummaries.join(",")}`);
  }

  return { blockers, details, notes, staleLockCleanupSkipped };
}

function reportRuntimePreflight({
  cleanupStaleLock = true,
  enforceBlockers = true,
} = {}) {
  if (!includeRuntime) {
    return true;
  }

  const { blockers, details, notes, staleLockCleanupSkipped } =
    collectRuntimeBlockers({ cleanupStaleLock });

  for (const note of notes) {
    console.log(note);
  }

  if (staleLockCleanupSkipped && !enforceBlockers) {
    console.log(
      "HEU_FAST_LOOP_RUNTIME_PREFLIGHT: SNAPSHOT_ONLY - stale .next/lock detected; cleanup skipped and guard/build execution skipped.",
    );
    console.log(
      `HEU_FAST_LOOP_RUNTIME_BLOCKERS: ${details.length > 0 ? details.join("; ") : "none"}`,
    );
    return true;
  }

  if (blockers.length > 0) {
    console.log(
      `HEU_FAST_LOOP_RUNTIME_PREFLIGHT: ${
        enforceBlockers ? "NO_GO" : "SNAPSHOT_ONLY_WARN"
      } - ${blockers.join("; ")}`,
    );
    console.log(
      `HEU_FAST_LOOP_RUNTIME_BLOCKERS: ${details.length > 0 ? details.join("; ") : "none"}`,
    );
    return !enforceBlockers;
  }

  console.log("HEU_FAST_LOOP_RUNTIME_PREFLIGHT: READY - no active Next dev/build process or .next/lock detected.");
  console.log("HEU_FAST_LOOP_RUNTIME_BLOCKERS: none");
  return true;
}

function printHelp() {
  console.log("HEU fast local control loop help");
  console.log(
    "Purpose: one small PASS_LOCAL read-only control loop before widening any HEU slice.",
  );
  console.log(
    "Usage: npm.cmd run check:heu-fast-local-loop -- [--snapshot-only] [--runtime] [--security] [--strict-worktree] [--run-dynamic-guards] [--cleanup-stale-lock] [--help]",
  );
  console.log("Flags:");
  console.log("  --help             Print operator help only; skip git snapshot, guard execution and PASS_LOCAL claim.");
  console.log("  --snapshot-only    Print worktree/runtime snapshot only; skip cleanup, guard execution and PASS_LOCAL claim.");
  console.log("  --runtime          Include lint/build after active Next dev/build preflight is clear.");
  console.log("  --security         Include user-account security audit for P0-17/P6-04 slices.");
  console.log("  --strict-worktree  Return NO_GO when the worktree is dirty; use only for clean handoff.");
  console.log("  --run-dynamic-guards  Execute every registered dynamic guard triggered by the dirty snapshot; default only reports/defer them to prevent scope overflow.");
  console.log("  --cleanup-stale-lock  Explicitly remove stale .next/lock only after no active Next dev/build process is detected.");
  console.log(
    "Default checks: check:heu-it-data-daily-control, audit:heu-current-state-inventory, audit:heu-vietnamese-text-encoding.",
  );
  console.log(
    `Dynamic guards: ${dynamicGuardDefinitions.map((guard) => guard.name).join(", ")}`,
  );
  console.log(
    "Key outputs: HEU_FAST_LOOP_WORKTREE, HEU_FAST_LOOP_TOP_AREA, HEU_FAST_LOOP_NEXT_ACTION, HEU_FAST_LOOP_OPERATOR_NEXT, HEU_FAST_LOOP_DYNAMIC_GUARD_TRIGGERS, HEU_FAST_LOOP_DYNAMIC_GUARD_CANDIDATES, HEU_FAST_LOOP_DYNAMIC_GUARD_CANDIDATE_GROUPS, HEU_FAST_LOOP_DYNAMIC_GUARD_CANDIDATE_NEXT, HEU_FAST_LOOP_DYNAMIC_GUARD_CANDIDATE_PATHS, HEU_FAST_LOOP_DYNAMIC_GUARDS, HEU_FAST_LOCAL_LOOP_READY.",
  );
  console.log(
    "Operator next format: primary, commands, candidate_manual, stop_rule.",
  );
  console.log(
    "Boundary: no account creation, password handling, email, task, migration, UAT, evidence acceptance, finance reliance, owner GO or production GO.",
  );
  console.log("HEU_FAST_LOOP_HELP: COMPLETE - guard execution skipped; no PASS_LOCAL claim.");
}

function extractRelevantOutput(result) {
  const combined = `${result.stdout ?? ""}\n${result.stderr ?? ""}\n${result.error ? String(result.error) : ""}`
    .split(/\r?\n/)
    .map((line) => line.trimEnd())
    .filter(Boolean);
  const focused = combined.filter((line) =>
    /PASS|READY|NO_GO|BLOCKED|failed|error|missing|Production remains NO-GO|Stage D/i.test(
      line,
    ),
  );
  const lines = focused.length > 0 ? focused : combined;

  return lines.slice(-12);
}

function firstExistingPath(paths) {
  return paths.find((candidatePath) => candidatePath && existsSync(candidatePath));
}

function findWindowsNpmCliPath() {
  return firstExistingPath([
    process.env.npm_execpath,
    path.join(path.dirname(process.execPath), "node_modules", "npm", "bin", "npm-cli.js"),
    process.env.APPDATA
      ? path.join(process.env.APPDATA, "npm", "node_modules", "npm", "bin", "npm-cli.js")
      : null,
  ]);
}

function resolveNpmRunCommand(scriptName) {
  if (process.platform === "win32") {
    const npmCliPath = findWindowsNpmCliPath();

    if (npmCliPath) {
      return {
        command: process.execPath,
        args: [npmCliPath, "run", scriptName],
      };
    }

    return {
      command: "npm.cmd",
      args: ["run", scriptName],
    };
  }

  return {
    command: "npm",
    args: ["run", scriptName],
  };
}

function runNpmScript(scriptName) {
  const spawnCommand = resolveNpmRunCommand(scriptName);

  return spawnSync(spawnCommand.command, spawnCommand.args, {
    cwd: process.cwd(),
    encoding: "utf8",
    maxBuffer: 1024 * 1024 * 8,
    windowsHide: true,
  });
}

function readJson(relativePath) {
  return JSON.parse(readFileSync(path.join(process.cwd(), relativePath), "utf8"));
}

function pathFromStatusLine(line) {
  return line.replace(/^.. /, "").trim();
}

function areaForPath(filePath) {
  if (filePath.startsWith("app/")) return "app";
  if (filePath.startsWith("components/")) return "components";
  if (filePath.startsWith("docs/")) return "docs";
  if (filePath.startsWith("scripts/")) return "scripts";
  if (filePath.startsWith("database/")) return "database";
  return "other";
}

function summarizeAreas(entries) {
  const areas = {
    app: 0,
    components: 0,
    database: 0,
    docs: 0,
    other: 0,
    scripts: 0,
  };

  for (const entry of entries) {
    const area = areaForPath(pathFromStatusLine(entry));
    areas[area] += 1;
  }

  return areas;
}

function summarizeAreaSamples(entries) {
  const samples = {
    app: [],
    components: [],
    database: [],
    docs: [],
    other: [],
    scripts: [],
  };

  for (const entry of entries) {
    const filePath = pathFromStatusLine(entry);
    const area = areaForPath(filePath);

    if (samples[area].length < 3) {
      samples[area].push(filePath);
    }
  }

  return samples;
}

function emptyAreaStatus() {
  return {
    conflicted: 0,
    staged: 0,
    unstaged: 0,
    untracked: 0,
  };
}

function summarizeAreaStatus(entries) {
  const statuses = {
    app: emptyAreaStatus(),
    components: emptyAreaStatus(),
    database: emptyAreaStatus(),
    docs: emptyAreaStatus(),
    other: emptyAreaStatus(),
    scripts: emptyAreaStatus(),
  };

  for (const entry of entries) {
    const area = areaForPath(pathFromStatusLine(entry));
    const status = statuses[area];

    if (entry.startsWith("?? ")) {
      status.untracked += 1;
      continue;
    }

    if (/^(UU|AA|DD|AU|UA|DU|UD) /.test(entry)) {
      status.conflicted += 1;
    }

    if (entry[0] !== " ") {
      status.staged += 1;
    }

    if (entry[1] !== " ") {
      status.unstaged += 1;
    }
  }

  return statuses;
}

function formatAreaSamples(samples) {
  return areaOrder
    .map((area) => {
      const paths = samples[area].length > 0 ? samples[area].join(",") : "-";
      return `${area}=${paths}`;
    })
    .join("; ");
}

function formatAreaStatus(statuses) {
  return areaOrder
    .map((area) => {
      const status = statuses[area];
      return `${area}=staged:${status.staged},unstaged:${status.unstaged},untracked:${status.untracked},conflicted:${status.conflicted}`;
    })
    .join("; ");
}

function rankedAreas(areas) {
  return areaOrder
    .map((area) => ({ area, count: areas[area] }))
    .filter((item) => item.count > 0)
    .sort(
      (left, right) =>
        right.count - left.count ||
        areaOrder.indexOf(left.area) - areaOrder.indexOf(right.area),
    );
}

function guardLabelForArea(area) {
  if (area === "app" || area === "components") return "runtime";
  if (area === "docs") return "docs";
  if (area === "scripts") return "scripts";
  if (area === "database") return "database";
  return "manual";
}

function formatTopArea(snapshot) {
  const [topArea] = rankedAreas(snapshot.areas);

  if (!topArea) {
    return "clean=0; first_slice=handoff; first_guard=strict-worktree";
  }

  const splitState =
    changedAreaCount(snapshot.areas) > 1 ? "split_one_slice=required" : "single_area_guard=required";

  return `${topArea.area}=${topArea.count}; first_slice=${topArea.area}; first_guard=${guardLabelForArea(topArea.area)}; ${splitState}`;
}

function formatSliceQueue(snapshot) {
  const queue = rankedAreas(snapshot.areas);

  if (queue.length === 0) {
    return "clean=0; handoff=npm.cmd run check:heu-fast-local-loop -- --strict-worktree";
  }

  return queue
    .map((item) => `${item.area}=${item.count}:${guardLabelForArea(item.area)}`)
    .join(" -> ");
}

function dynamicGuardTriggers(snapshot) {
  if (!snapshot) {
    return [];
  }

  return dynamicGuardDefinitions
    .map((guard) => ({
      guard,
      paths: guard.paths.filter((watchedPath) =>
        snapshot.paths.includes(watchedPath),
      ),
    }))
    .filter((trigger) => trigger.paths.length > 0);
}

function formatDynamicGuardTriggers(snapshot) {
  const triggers = dynamicGuardTriggers(snapshot);

  if (triggers.length === 0) {
    return "none";
  }

  return triggers
    .map(({ guard, paths }) => `${guard.name}=${paths.join("|")}`)
    .join("; ");
}

function dynamicCommandsForSnapshot(snapshot) {
  return dynamicGuardTriggers(snapshot).map(({ guard }) => ({
    name: guard.name,
    reason: guard.reason,
  }));
}

function checkScriptNameForPath(filePath) {
  const match = filePath.match(/^scripts\/(check-heu-.+)\.mjs$/);

  if (!match) {
    return null;
  }

  return match[1].replace("check-heu-", "check:heu-");
}

function staticCheckNames() {
  return new Set([
    "check:heu-fast-local-loop",
    ...commands.map((command) => command.name),
    ...dynamicGuardDefinitions.map((guard) => guard.name),
  ]);
}

function dynamicGuardWatchedPaths() {
  return new Set(dynamicGuardDefinitions.flatMap((guard) => guard.paths));
}

function dynamicGuardCandidateChecks(snapshot) {
  if (!snapshot) {
    return [];
  }

  let packageScripts = {};

  try {
    packageScripts = readJson("package.json").scripts ?? {};
  } catch {
    return [];
  }

  const staticNames = staticCheckNames();
  const watchedPaths = dynamicGuardWatchedPaths();
  const candidates = new Map();

  for (const filePath of snapshot.paths) {
    const name = checkScriptNameForPath(filePath);

    if (!name || staticNames.has(name) || watchedPaths.has(filePath) || !packageScripts[name]) {
      continue;
    }

    candidates.set(name, {
      name,
      path: filePath,
    });
  }

  return [...candidates.values()].sort((left, right) =>
    left.name.localeCompare(right.name),
  );
}

function dynamicGuardCandidateGroupName(name) {
  const slug = name.replace(/^check:heu-/, "");
  const compoundPrefixes = [
    "business-user",
    "khoa-giang-vien",
    "pipeline-followup",
    "report-catalog",
    "root-drive",
    "short-course",
    "system-wide",
    "user-activation",
    "user-operation",
  ];
  const compoundPrefix = compoundPrefixes.find((prefix) =>
    slug.startsWith(`${prefix}-`),
  );

  if (compoundPrefix) {
    return compoundPrefix;
  }

  return slug.split("-")[0] || "other";
}

function dynamicGuardCandidateSource(candidate) {
  try {
    return readFileSync(path.join(process.cwd(), candidate.path), "utf8");
  } catch {
    return "";
  }
}

function dynamicGuardCandidateTier(candidate) {
  if (liveEnvDynamicGuardCandidateNames.has(candidate.name)) {
    return {
      label: "live_env",
      rank: 30,
    };
  }

  const source = dynamicGuardCandidateSource(candidate);

  if (
    source.includes("@supabase/supabase-js") ||
    source.includes("createClient(") ||
    source.includes("SUPABASE_SERVICE_ROLE_KEY") ||
    source.includes(".env.local") ||
    source.includes("fetch(")
  ) {
    return {
      label: "live_env",
      rank: 30,
    };
  }

  if (source.includes("spawnSync(") || source.includes("execFileSync(")) {
    return {
      label: "process_runner",
      rank: 20,
    };
  }

  return {
    label: "local_static",
    rank: 0,
  };
}

function dynamicGuardCandidatePriority(name) {
  const slug = name.replace(/^check:heu-/, "");

  if (
    slug.includes("module-breakdown") ||
    slug.includes("module-completion-breakdown")
  ) {
    return 0;
  }
  if (slug.includes("scope-readiness")) return 1;
  if (slug.includes("local-completion")) return 2;
  if (slug.includes("foundation")) return 3;
  if (slug.includes("open-blocker-action-queue")) return 4;
  if (slug.includes("negative-access")) return 5;
  if (slug.includes("owner-action-queue")) return 6;
  if (slug.includes("local-readiness")) return 20;
  if (slug.includes("owner-closure")) return 21;
  if (slug.includes("risk-closure")) return 22;

  return 10;
}

function sortDynamicGuardCandidates(candidates) {
  return candidates.sort(
    (left, right) => {
      const leftTier = dynamicGuardCandidateTier(left);
      const rightTier = dynamicGuardCandidateTier(right);

      return (
        leftTier.rank - rightTier.rank ||
        dynamicGuardCandidatePriority(left.name) -
          dynamicGuardCandidatePriority(right.name) ||
        left.name.localeCompare(right.name)
      );
    },
  );
}

function firstCandidateSortKey(candidates) {
  const [firstCandidate] = candidates;
  const tier = firstCandidate
    ? dynamicGuardCandidateTier(firstCandidate)
    : {
        label: "",
        rank: Number.POSITIVE_INFINITY,
      };

  return firstCandidate
    ? {
        name: firstCandidate.name,
        priority: dynamicGuardCandidatePriority(firstCandidate.name),
        tierLabel: tier.label,
        tierRank: tier.rank,
      }
    : {
        name: "",
        priority: Number.POSITIVE_INFINITY,
        tierLabel: "",
        tierRank: Number.POSITIVE_INFINITY,
      };
}

function compareDynamicGuardCandidateGroups(left, right) {
  const leftKey = firstCandidateSortKey(left.candidates);
  const rightKey = firstCandidateSortKey(right.candidates);

  return (
    right.count - left.count ||
    leftKey.tierRank - rightKey.tierRank ||
    leftKey.priority - rightKey.priority ||
    leftKey.name.localeCompare(rightKey.name) ||
    left.group.localeCompare(right.group)
  );
}

function formatDynamicGuardCandidateGroups(snapshot) {
  const candidates = dynamicGuardCandidateChecks(snapshot);

  if (candidates.length === 0) {
    return "none";
  }

  const groups = new Map();

  for (const candidate of candidates) {
    const group = dynamicGuardCandidateGroupName(candidate.name);
    groups.set(group, (groups.get(group) ?? 0) + 1);
  }

  return [...groups.entries()]
    .map(([group, count]) => {
      const groupCandidates = sortDynamicGuardCandidates(
        candidates.filter(
          (candidate) => dynamicGuardCandidateGroupName(candidate.name) === group,
        ),
      );

      return {
        candidates: groupCandidates,
        count,
        group,
      };
    })
    .sort(compareDynamicGuardCandidateGroups)
    .map(({ count, group }) => `${group}=${count}`)
    .join("; ");
}

function rankedDynamicGuardCandidateGroups(snapshot) {
  const candidates = dynamicGuardCandidateChecks(snapshot);
  const groups = new Map();

  for (const candidate of candidates) {
    const group = dynamicGuardCandidateGroupName(candidate.name);
    const groupCandidates = groups.get(group) ?? [];
    groupCandidates.push(candidate);
    groups.set(group, groupCandidates);
  }

  return [...groups.entries()]
    .map(([group, groupCandidates]) => ({
      candidates: sortDynamicGuardCandidates(groupCandidates),
      count: groupCandidates.length,
      group,
    }))
    .sort(compareDynamicGuardCandidateGroups);
}

function orderedDynamicGuardCandidatesForDisplay(snapshot) {
  return rankedDynamicGuardCandidateGroups(snapshot).flatMap(
    (group) => group.candidates,
  );
}

function formatDynamicGuardCandidateNext(snapshot) {
  const [topGroup] = rankedDynamicGuardCandidateGroups(snapshot);

  if (!topGroup) {
    return "none";
  }

  const [firstCandidate] = topGroup.candidates;
  const firstTier = dynamicGuardCandidateTier(firstCandidate);

  return `first_group=${topGroup.group}; count=${topGroup.count}; first_guard=npm.cmd run ${firstCandidate.name}; selection=largest_group_lightweight_first; tie_break=lightweight_first; candidate_tier=${firstTier.label}; live_env_deferred=true; action=run_manually_or_register_dynamic_guard`;
}

function firstDynamicGuardCandidateCommand(snapshot) {
  const [topGroup] = rankedDynamicGuardCandidateGroups(snapshot);
  const [firstCandidate] = topGroup?.candidates ?? [];

  return firstCandidate ? `npm.cmd run ${firstCandidate.name}` : "none";
}

function firstDynamicGuardTriggerCommand(snapshot) {
  const [firstTrigger] = dynamicGuardTriggers(snapshot);

  return firstTrigger ? `npm.cmd run ${firstTrigger.guard.name}` : "none";
}

function formatDynamicGuardDeferredNext(snapshot) {
  const triggers = dynamicGuardTriggers(snapshot);

  if (triggers.length === 0) {
    return "dynamic_guards=none";
  }

  return `dynamic_guards_deferred=count:${triggers.length}; first_guard=${firstDynamicGuardTriggerCommand(snapshot)}; run_all_requires=--run-dynamic-guards`;
}

function formatOperatorNext(snapshot) {
  if (snapshot.conflictedCount > 0) {
    return "primary=resolve_conflicts; commands=manual_conflict_resolution; candidate_manual=none; stop_rule=no_PASS_LOCAL_until_conflicts_clear";
  }

  if (snapshot.changedCount === 0) {
    return "primary=handoff; commands=npm.cmd run check:heu-fast-local-loop -- --strict-worktree; candidate_manual=none; stop_rule=clean_handoff";
  }

  const primary =
    dynamicGuardTriggers(snapshot).length > 0
      ? "run_first_registered_dynamic_guard"
      : `${guardLabelForArea(rankedAreas(snapshot.areas)[0]?.area ?? "other")}_area_guard`;
  const commands =
    dynamicGuardTriggers(snapshot).length > 0
      ? firstDynamicGuardTriggerCommand(snapshot)
      : nextAction(snapshot).replaceAll(";", ",");

  return `primary=${primary}; commands=${commands}; candidate_manual=${firstDynamicGuardCandidateCommand(snapshot)}; stop_rule=one_slice_before_runtime_or_handoff`;
}

function formatDynamicGuardCandidateSummary(snapshot) {
  const candidates = orderedDynamicGuardCandidatesForDisplay(snapshot);

  if (candidates.length === 0) {
    return "count=0; sample=none";
  }

  const sample = candidates
    .slice(0, dynamicGuardCandidateSampleLimit)
    .map((candidate) => candidate.name)
    .join(",");

  return `count=${candidates.length}; sample_limit=${dynamicGuardCandidateSampleLimit}; sample_order=largest_group_lightweight_first; candidate_tier_order=local_static,process_runner,live_env; live_env_deferred=true; sample=${sample}; action=run_manually_or_register_dynamic_guard`;
}

function formatDynamicGuardCandidatePaths(snapshot) {
  const candidates = orderedDynamicGuardCandidatesForDisplay(snapshot);

  if (candidates.length === 0) {
    return "none";
  }

  return candidates
    .slice(0, dynamicGuardCandidateSampleLimit)
    .map((candidate) => `${candidate.name}=${candidate.path}`)
    .join("; ");
}

function appendDynamicCommands(snapshot) {
  const dynamicCommands = dynamicCommandsForSnapshot(snapshot);

  for (const command of dynamicCommands) {
    if (!commands.some((existingCommand) => existingCommand.name === command.name)) {
      commands.push(command);
    }
  }

  return dynamicCommands;
}

function formatDynamicGuardRegistryDetail() {
  return dynamicGuardDefinitions
    .map((guard) => `${guard.name}:paths=${guard.paths.length}`)
    .join("; ");
}

function validateDynamicGuardRegistry() {
  const failures = [];
  const seenHints = new Set();
  const seenNames = new Set();
  const seenPaths = new Set();
  const packagePath = path.join(process.cwd(), "package.json");
  let packageScripts = {};

  if (!existsSync(packagePath)) {
    failures.push("package.json is missing");
  } else {
    try {
      packageScripts = readJson("package.json").scripts ?? {};
    } catch (error) {
      failures.push(`package.json cannot be parsed: ${error.message}`);
    }
  }

  for (const guard of dynamicGuardDefinitions) {
    if (!guard.name || seenNames.has(guard.name)) {
      failures.push(`duplicate or missing dynamic guard name: ${guard.name ?? "UNKNOWN"}`);
    }
    seenNames.add(guard.name);

    if (!guard.hint || seenHints.has(guard.hint)) {
      failures.push(`duplicate or missing dynamic guard hint: ${guard.hint ?? "UNKNOWN"}`);
    }
    seenHints.add(guard.hint);

    if (!guard.reason) {
      failures.push(`dynamic guard ${guard.name}: missing reason`);
    }

    if (!Array.isArray(guard.paths) || guard.paths.length === 0) {
      failures.push(`dynamic guard ${guard.name}: missing watched paths`);
    }

    for (const watchedPath of guard.paths ?? []) {
      if (seenPaths.has(watchedPath)) {
        failures.push(`duplicate dynamic guard watched path: ${watchedPath}`);
      }
      seenPaths.add(watchedPath);

      if (!existsSync(path.join(process.cwd(), watchedPath))) {
        failures.push(`dynamic guard ${guard.name}: watched path missing: ${watchedPath}`);
      }
    }

    if (!packageScripts[guard.name]) {
      failures.push(`package.json: missing script for dynamic guard ${guard.name}`);
    }
  }

  if (failures.length > 0) {
    console.log(
      `HEU_FAST_LOOP_DYNAMIC_GUARD_REGISTRY: NO_GO - failures=${failures.length}`,
    );
    for (const failure of failures) {
      console.error(`  ${failure}`);
    }
    return false;
  }

  console.log(
    `HEU_FAST_LOOP_DYNAMIC_GUARD_REGISTRY: READY - guards=${dynamicGuardDefinitions.length}; package_scripts=${seenNames.size}; watched_paths=${seenPaths.size}`,
  );
  console.log(
    `HEU_FAST_LOOP_DYNAMIC_GUARD_REGISTRY_DETAIL: ${formatDynamicGuardRegistryDetail()}`,
  );
  return true;
}

function nextGuardHints(snapshot) {
  if (snapshot.changedCount === 0) {
    return [
      "clean=no extra guard",
      "handoff=npm.cmd run check:heu-fast-local-loop -- --strict-worktree",
    ];
  }

  const hints = [];

  if (snapshot.areas.app > 0 || snapshot.areas.components > 0) {
    hints.push("runtime=npm.cmd run check:heu-fast-local-loop -- --runtime");
  }

  if (snapshot.areas.docs > 0) {
    hints.push(
      "docs=npm.cmd run audit:heu-current-state-inventory + npm.cmd run audit:heu-implementation-log + npm.cmd run audit:heu-vietnamese-text-encoding",
    );
  }

  for (const { guard } of dynamicGuardTriggers(snapshot)) {
    hints.push(guard.hint);
  }

  if (snapshot.areas.scripts > 0) {
    hints.push("scripts=node --check touched scripts + npx.cmd eslint touched scripts");
  }

  if (snapshot.areas.database > 0) {
    hints.push(
      "database=npm.cmd run audit:ttgdtx-migration-order-guard + npm.cmd run audit:heu-sql-object-master-map",
    );
  }

  if (snapshot.areas.other > 0) {
    hints.push("other=manual scope review before handoff");
  }

  hints.push(
    "handoff=npm.cmd run check:heu-fast-local-loop -- --strict-worktree after the slice is separated",
  );

  return hints;
}

function changedAreaCount(areas) {
  return Object.values(areas).filter((count) => count > 0).length;
}

function sliceState(snapshot) {
  if (snapshot.conflictedCount > 0) {
    return "CONFLICTED - resolve conflicts before any PASS_LOCAL claim";
  }

  if (snapshot.changedCount === 0) {
    return "CLEAN - strict handoff check can run";
  }

  if (changedAreaCount(snapshot.areas) === 1) {
    return "SINGLE_AREA_DIRTY - run the matching area guard before handoff";
  }

  return "MIXED_AREA_DIRTY - split_one_slice=required before PASS_LOCAL handoff";
}

function nextActionForArea(area, snapshot) {
  const dynamicGuards = dynamicGuardTriggers(snapshot);

  if (dynamicGuards.length > 0 && (area === "docs" || area === "scripts")) {
    return formatDynamicGuardDeferredNext(snapshot);
  }

  if (area === "app" || area === "components") {
    return "runtime=npm.cmd run check:heu-fast-local-loop -- --runtime after active Next dev/build preflight is clear";
  }

  if (area === "docs") {
    return "docs=npm.cmd run audit:heu-current-state-inventory + npm.cmd run audit:heu-implementation-log + npm.cmd run audit:heu-vietnamese-text-encoding";
  }

  if (area === "scripts") {
    return "scripts=node --check touched scripts + npx.cmd eslint touched scripts";
  }

  if (area === "database") {
    return "database=npm.cmd run audit:ttgdtx-migration-order-guard + npm.cmd run audit:heu-sql-object-master-map";
  }

  return "other=manual scope review before handoff";
}

function nextAction(snapshot) {
  if (snapshot.conflictedCount > 0) {
    return "resolve_conflicts=required before any PASS_LOCAL claim";
  }

  if (snapshot.changedCount === 0) {
    return "handoff=npm.cmd run check:heu-fast-local-loop -- --strict-worktree";
  }

  const splitPrefix =
    changedAreaCount(snapshot.areas) > 1 ? "split_one_slice=required; " : "";
  const [topArea] = rankedAreas(snapshot.areas);

  return `${splitPrefix}${nextActionForArea(topArea?.area ?? "other", snapshot)}`;
}

function collectWorktreeSnapshot() {
  const statusResult = runGit(["status", "--short", "--branch"]);

  if (statusResult.status !== 0) {
    return {
      ok: false,
      detail: statusResult.error
        ? String(statusResult.error)
        : (statusResult.stderr ?? "").trim() || "git status failed",
    };
  }

  const statusLines = (statusResult.stdout ?? "")
    .split(/\r?\n/)
    .filter(Boolean);
  const branch =
    statusLines.find((line) => line.startsWith("## "))?.slice(3) ??
    "UNKNOWN_BRANCH";
  const entries = statusLines.filter((line) => !line.startsWith("## "));
  const areas = summarizeAreas(entries);
  const areaSamples = summarizeAreaSamples(entries);
  const areaStatus = summarizeAreaStatus(entries);
  const stagedCount = entries.filter((line) => line[0] !== " " && line[0] !== "?")
    .length;
  const modifiedCount = entries.filter(
    (line) => !line.startsWith("?? ") && line[1] !== " ",
  ).length;
  const untrackedCount = entries.filter((line) => line.startsWith("?? ")).length;
  const conflictedCount = entries.filter((line) => /^(UU|AA|DD|AU|UA|DU|UD) /.test(line))
    .length;
  const samplePaths = entries
    .slice(0, 8)
    .map((line) => pathFromStatusLine(line));
  const paths = entries.map((line) => pathFromStatusLine(line));

  return {
    ok: true,
    areaSamples,
    areaStatus,
    areas,
    branch,
    changedCount: entries.length,
    conflictedCount,
    modifiedCount,
    paths,
    samplePaths,
    stagedCount,
    untrackedCount,
  };
}

function reportWorktreeSnapshot() {
  const snapshot = collectWorktreeSnapshot();

  if (!snapshot.ok) {
    console.log(`HEU_FAST_LOOP_WORKTREE: NO_GO - ${snapshot.detail}`);
    return false;
  }

  reportedSnapshot = snapshot;

  console.log(
    `HEU_FAST_LOOP_WORKTREE: branch=${snapshot.branch}; changed=${snapshot.changedCount}; staged=${snapshot.stagedCount}; modified=${snapshot.modifiedCount}; untracked=${snapshot.untrackedCount}; conflicted=${snapshot.conflictedCount}`,
  );
  console.log(
    `HEU_FAST_LOOP_WORKTREE_AREAS: app=${snapshot.areas.app}; components=${snapshot.areas.components}; docs=${snapshot.areas.docs}; scripts=${snapshot.areas.scripts}; database=${snapshot.areas.database}; other=${snapshot.areas.other}`,
  );
  console.log(
    `HEU_FAST_LOOP_AREA_SAMPLE: ${formatAreaSamples(snapshot.areaSamples)}`,
  );
  console.log(
    `HEU_FAST_LOOP_AREA_STATUS: ${formatAreaStatus(snapshot.areaStatus)}`,
  );
  console.log(`HEU_FAST_LOOP_TOP_AREA: ${formatTopArea(snapshot)}`);
  console.log(`HEU_FAST_LOOP_SLICE_QUEUE: ${formatSliceQueue(snapshot)}`);
  console.log(`HEU_FAST_LOOP_SLICE_STATE: ${sliceState(snapshot)}`);
  console.log(
    `HEU_FAST_LOOP_NEXT_GUARDS: ${nextGuardHints(snapshot).join("; ")}`,
  );
  console.log(`HEU_FAST_LOOP_NEXT_ACTION: ${nextAction(snapshot)}`);
  console.log(`HEU_FAST_LOOP_OPERATOR_NEXT: ${formatOperatorNext(snapshot)}`);
  console.log(
    `HEU_FAST_LOOP_DYNAMIC_GUARD_TRIGGERS: ${formatDynamicGuardTriggers(snapshot)}`,
  );
  console.log(
    `HEU_FAST_LOOP_DYNAMIC_GUARD_CANDIDATES: ${formatDynamicGuardCandidateSummary(snapshot)}`,
  );
  console.log(
    `HEU_FAST_LOOP_DYNAMIC_GUARD_CANDIDATE_GROUPS: ${formatDynamicGuardCandidateGroups(snapshot)}`,
  );
  console.log(
    `HEU_FAST_LOOP_DYNAMIC_GUARD_CANDIDATE_NEXT: ${formatDynamicGuardCandidateNext(snapshot)}`,
  );
  console.log(
    `HEU_FAST_LOOP_DYNAMIC_GUARD_CANDIDATE_PATHS: ${formatDynamicGuardCandidatePaths(snapshot)}`,
  );

  if (snapshot.samplePaths.length > 0) {
    console.log(
      `HEU_FAST_LOOP_WORKTREE_SAMPLE: ${snapshot.samplePaths.join(" | ")}`,
    );
  }

  if (snapshot.changedCount === 0) {
    console.log("HEU_FAST_LOOP_WORKTREE_SCOPE: CLEAN");
    return true;
  }

  console.log(
    strictWorktree
      ? "HEU_FAST_LOOP_WORKTREE_SCOPE: NO_GO - dirty worktree under --strict-worktree; separate or clean the current slice before handoff."
      : "HEU_FAST_LOOP_WORKTREE_SCOPE: DIRTY_WARN_ONLY - preserve existing changes and separate current-slice files before handoff.",
  );

  return !strictWorktree;
}

if (helpRequested) {
  printHelp();
  process.exit(0);
}

console.log("HEU fast local control loop");
console.log(
  "Mode: PASS_LOCAL read-only checks. No account creation, password handling, email, task, migration, UAT, evidence acceptance, finance reliance, owner GO or production GO.",
);
console.log(
  includeRuntime
    ? "Runtime mode: lint and build are included because --runtime was provided."
    : "Default mode: runtime lint/build are skipped; use --runtime after UI, route, server-action or shared runtime changes.",
);
console.log(
  includeSecurity
    ? "Security mode: user-account security audit is included because --security was provided."
    : "Security mode: user-account security audit is skipped by default; use --security for P0-17/P6-04 slices.",
);
console.log(
  snapshotOnly
    ? "Snapshot mode: worktree/runtime snapshot only; cleanup and guard commands are skipped and no PASS_LOCAL claim is made."
    : "Snapshot mode: off; base guard commands will run after worktree/runtime preflight.",
);
  console.log(
    runDynamicGuards
      ? "Dynamic guard mode: execute all triggered dynamic guards after registry validation."
      : "Dynamic guard mode: report/defer triggered dynamic guards by default to prevent scope overflow; use --run-dynamic-guards for an explicit wide run.",
  );
  console.log(
    allowStaleLockCleanup
      ? "Stale lock cleanup: explicit; .next/lock may be removed only after active process preflight is clear."
      : "Stale lock cleanup: disabled by default; stale .next/lock is reported as NO_GO in runtime mode.",
  );
console.log(
  strictWorktree
    ? "Worktree mode: strict; dirty worktree returns NO_GO before guard execution."
    : "Worktree mode: warn-only; dirty worktree is reported but preserved.",
);
console.log(
  process.platform === "win32"
    ? "HEU_FAST_LOOP_WINDOWS_NPM_DIRECT_RUNNER: READY - Windows guard commands spawn npm-cli.js through node.exe and spawnSync without cmd.exe wrapper."
    : "HEU_FAST_LOOP_WINDOWS_NPM_DIRECT_RUNNER: SKIPPED - non-Windows guard commands spawn npm directly.",
);

if (!reportWorktreeSnapshot()) {
  console.error("HEU_FAST_LOCAL_LOOP_READY: NO_GO at worktree snapshot.");
  process.exit(1);
}

if (
  !reportRuntimePreflight({
    cleanupStaleLock: allowStaleLockCleanup && !snapshotOnly,
    enforceBlockers: !snapshotOnly,
  })
) {
  console.error("HEU_FAST_LOCAL_LOOP_READY: NO_GO at runtime preflight; stop the active localhost dev/build process before build verification.");
  process.exit(1);
}

if (snapshotOnly) {
  console.log(
    "HEU_FAST_LOOP_SNAPSHOT_ONLY: COMPLETE - guard execution skipped; no PASS_LOCAL claim.",
  );
  console.log("Next: rerun without --snapshot-only for PASS_LOCAL guard execution.");
  process.exit(0);
}

if (!validateDynamicGuardRegistry()) {
  console.error(
    "HEU_FAST_LOCAL_LOOP_READY: NO_GO at dynamic guard registry; stop before widening scope.",
  );
  process.exit(1);
}

const dynamicCommands = dynamicCommandsForSnapshot(reportedSnapshot);
if (runDynamicGuards) {
  appendDynamicCommands(reportedSnapshot);
}
console.log(
  `HEU_FAST_LOOP_DYNAMIC_GUARDS: ${
    dynamicCommands.length > 0
      ? `${runDynamicGuards ? "executing" : "deferred"}=${dynamicCommands.map((command) => command.name).join(",")}`
      : "none"
  }; run_dynamic_guards=${runDynamicGuards ? "yes" : "no"}`,
);

const startedAt = process.hrtime.bigint();
const results = [];

for (const [index, command] of commands.entries()) {
  const commandStartedAt = process.hrtime.bigint();
  const result = runNpmScript(command.name);
  const duration = elapsedMs(commandStartedAt);
  const status = result.status === 0 ? "PASS" : "NO_GO";

  results.push({
    command: command.name,
    duration,
    reason: command.reason,
    status,
  });

  console.log(
    `[${index + 1}/${commands.length}] ${command.name}: ${status} (${duration} ms) - ${command.reason}`,
  );

  if (result.status !== 0) {
    const relevantOutput = extractRelevantOutput(result);

    if (relevantOutput.length > 0) {
      console.error("Relevant output:");
      for (const line of relevantOutput) {
        console.error(`  ${line}`);
      }
    }

    console.error(
      `HEU_FAST_LOCAL_LOOP_READY: NO_GO at ${command.name}; stop before widening scope.`,
    );
    process.exit(result.status ?? 1);
  }
}

const totalDuration = elapsedMs(startedAt);

console.log(
  `HEU_FAST_LOCAL_LOOP_READY: PASS_LOCAL (${results.length}/${commands.length} checks, ${totalDuration} ms)`,
);
console.log(
  "Next: keep the next action to one small PASS_LOCAL slice, or rerun with --runtime/--security when the changed surface requires it.",
);
