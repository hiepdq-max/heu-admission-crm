export type ProductionBlocker = {
  code: string;
  title: string;
  owner: string;
  requiredEvidence: string;
  href?: string;
};

export type ProductionExecutionStep = {
  code: string;
  title: string;
  owner: string;
  proof: string;
  href?: string;
};

export type SafeIterationStep = {
  code: string;
  title: string;
  detail: string;
};

export type ProductionUatLaunchStep = {
  code: string;
  title: string;
  owner: string;
  route: string;
  runbook: string;
  evidence: string;
  auditCommand: string;
};

export type ProductionRiskClosureStep = {
  code: string;
  title: string;
  owner: string;
  route: string;
  runbook: string;
  evidence: string;
  auditCommand: string;
};

export type ProductionInfraReadinessStep = {
  code: string;
  title: string;
  owner: string;
  route: string;
  runbook: string;
  evidence: string;
  auditCommand: string;
};

export type ProductionEvidenceRequirement = {
  caseId: string;
  blockerCode: string;
  title: string;
  owner: string;
  evidenceClass: "CONTROLLED_REDACTED" | "CONTROLLED_SENSITIVE";
  controlledLocation: string;
  requiredProof: string;
  forbiddenContent: string;
  signoff: string;
};

export const PRODUCTION_BLOCKERS: ProductionBlocker[] = [
  {
    code: "P0-03",
    title: "Backup and restore dry-run",
    owner: "IT_DATA + Audit",
    requiredEvidence:
      "Operator run sheet, backup ID, restore target, preflight/postflight result and smoke-check evidence.",
    href: "/settings/supabase-check",
  },
  {
    code: "Step90-Step110",
    title: "Migration order approval",
    owner: "IT_DATA + KHTC + PHAP_CHE",
    requiredEvidence:
      "Signed migration order after P0-03 evidence is accepted by the required owners.",
  },
  {
    code: "P0-19",
    title: "Legal and finance gate UAT",
    owner: "PHAP_CHE + KHTC + BGH",
    requiredEvidence:
      "Legal basis, tuition policy, finance gate and signed legal/finance UAT.",
    href: "/ttgdtx/gate",
  },
  {
    code: "P2-17",
    title: "Partner payout cannot run twice",
    owner: "KHTC + BGH + Audit",
    requiredEvidence:
      "Duplicate-click, overpay, voucher, RPC-only and dossier evidence signed by owners.",
    href: "/ttgdtx/payment-requests/pay",
  },
  {
    code: "P2-18",
    title: "Accounting dashboard is read-only and reconciled",
    owner: "KHTC + BGH + IT_DATA",
    requiredEvidence:
      "Source comparison, role-scope denial and no-write evidence for dashboard UAT.",
    href: "/ttgdtx/accounting-dashboard",
  },
  {
    code: "P6-04",
    title: "Role and workspace scope UAT",
    owner: "IT_DATA + TRUONG_PHONG + Audit",
    requiredEvidence:
      "ADMIN, BGH, KHTC, PHAP_CHE, AUDIT and out-of-scope browser UAT evidence.",
    href: "/settings/scopes",
  },
  {
    code: "P6-03",
    title: "Audit log traceability",
    owner: "Audit + IT_DATA + KHTC",
    requiredEvidence:
      "Trace rows for create, update, check, approve, pay and source-control events.",
    href: "/audit",
  },
  {
    code: "P6-06",
    title: "Hard-delete and cascade risk",
    owner: "IT_DATA + Audit + business owners",
    requiredEvidence:
      "Conversion evidence or written waiver for unresolved non-TTGDTX/base cascade paths.",
    href: "/audit",
  },
  {
    code: "P0-10",
    title: "Controlled evidence redaction",
    owner: "IT_DATA + Audit",
    requiredEvidence:
      "Controlled evidence location and redacted references; raw evidence stays outside Git/Codex/chat.",
    href: "/audit",
  },
  {
    code: "P0-09",
    title: "Final owner GO/NO-GO decision",
    owner: "BGH + IT_DATA + KHTC + PHAP_CHE + AUDIT + TRUONG_PHONG",
    requiredEvidence:
      "Final signed multi-owner GO/NO-GO note using the owner sign-off pack, UAT operator handoff and redacted evidence references.",
    href: "/ttgdtx",
  },
];

export const SAFE_ITERATION_STEPS: SafeIterationStep[] = [
  {
    code: "ITER-01",
    title: "Pick one blocker",
    detail:
      "Choose exactly one open blocker from the queue; do not mix backup, UAT, payout, dashboard or owner sign-off in one slice.",
  },
  {
    code: "ITER-02",
    title: "Run local guard",
    detail:
      "Run the matching audit command and keep Stage D/NO-GO visible before asking owners to test or sign evidence.",
  },
  {
    code: "ITER-03",
    title: "Attach controlled proof",
    detail:
      "Store real evidence outside Git/Codex/chat, then reference only redacted evidence IDs in the checklist or handoff note.",
  },
  {
    code: "ITER-04",
    title: "Advance only if green",
    detail:
      "If the slice passes, commit that small scope; if it fails, keep NO-GO, fix the smallest cause and rerun the guard.",
  },
];

export const PRODUCTION_UAT_LAUNCH_STEPS: ProductionUatLaunchStep[] = [
  {
    code: "P2-18",
    title: "Accounting dashboard browser UAT",
    owner: "KHTC + BGH + IT_DATA",
    route: "/ttgdtx/accounting-dashboard",
    runbook: "docs/P2_18_ACCOUNTING_DASHBOARD_UAT_RUNBOOK.md",
    evidence:
      "Authorized access, blocked out-of-scope access, no-write behavior, source comparison and dashboard reliance decision.",
    auditCommand: "npm.cmd run audit:ttgdtx-accounting-dashboard-uat-plan",
  },
  {
    code: "P5-03",
    title: "Finance Desk browser UAT",
    owner: "KHTC + BGH + IT_DATA",
    route: "/finance-desk",
    runbook: "docs/HEU_FINANCE_DESK_UAT_RUNBOOK_20260627.md",
    evidence:
      "Scoped access, read-only cockpit behavior, source reconciliation, no-secret screenshots and human reliance decision.",
    auditCommand: "npm.cmd run audit:heu-finance-desk",
  },
];

export const PRODUCTION_RISK_CLOSURE_STEPS: ProductionRiskClosureStep[] = [
  {
    code: "P6-06",
    title: "Hard-delete and cascade conversion or waiver",
    owner: "IT_DATA + Audit + business owners",
    route: "/audit",
    runbook: "docs/HEU_NON_TTGDTX_CASCADE_FINDING_REGISTER_20260628.md",
    evidence:
      "Conversion proof or narrow written waiver for unresolved non-TTGDTX/base cascade findings, with closure decision and rollback note.",
    auditCommand: "npm.cmd run audit:hard-delete-conversion-decision-queue",
  },
  {
    code: "P2-17",
    title: "Payout duplicate-click and dossier UAT",
    owner: "KHTC + BGH + Audit",
    route: "/ttgdtx/payment-requests/pay",
    runbook: "docs/P2_17_DUPLICATE_PAYOUT_UAT_RUNBOOK.md",
    evidence:
      "Duplicate-click result, overpay guard, voucher normalization, RPC-only path and BBNT/partner-invoice dossier proof.",
    auditCommand: "npm.cmd run audit:ttgdtx-payout-execution-readiness",
  },
];

export const PRODUCTION_INFRA_READINESS_STEPS: ProductionInfraReadinessStep[] = [
  {
    code: "P0-03",
    title: "Backup and restore dry-run evidence",
    owner: "IT_DATA + Audit",
    route: "/settings/supabase-check",
    runbook: "docs/STEP90_STEP110_BACKUP_RESTORE_OPERATOR_RUN_SHEET_20260627.md",
    evidence:
      "Backup ID, isolated restore target, preflight/postflight output, restore smoke-check and P0-19/P3 gate-preservation proof.",
    auditCommand: "npm.cmd run audit:ttgdtx-backup-restore-dry-run-pack",
  },
  {
    code: "Step90-Step110",
    title: "Signed production migration order",
    owner: "IT_DATA + KHTC + PHAP_CHE",
    route: "/settings/supabase-check",
    runbook: "docs/STEP90_STEP110_MIGRATION_ORDER_SIGNOFF_GUARD_20260627.md",
    evidence:
      "Signed Step90-Step110 order, rollback point, Step97/Step100/Step109/Step110 decisions and owner acceptance after backup/restore proof.",
    auditCommand: "npm.cmd run audit:ttgdtx-migration-order-guard",
  },
];

export const PRODUCTION_EXECUTION_STEPS: ProductionExecutionStep[] = [
  {
    code: "P0-10",
    title: "Apply controlled evidence redaction",
    owner: "IT_DATA + Audit",
    proof:
      "Use the redaction pack before any UAT screenshot, backup proof, voucher or signed evidence is referenced.",
    href: "/audit",
  },
  {
    code: "P0-03",
    title: "Execute backup and restore dry-run",
    owner: "IT_DATA + Audit",
    proof:
      "Complete the operator run sheet, then attach backup ID, restore target, preflight/postflight output and smoke-check evidence outside Git.",
    href: "/settings/supabase-check",
  },
  {
    code: "Step90-Step110",
    title: "Sign migration order",
    owner: "IT_DATA + KHTC + PHAP_CHE",
    proof:
      "Approve migration order and Step97, Step100, Step109 and Step110 decisions after backup/restore evidence.",
  },
  {
    code: "P6-04",
    title: "Run role and workspace UAT",
    owner: "IT_DATA + TRUONG_PHONG + Audit",
    proof:
      "Test ADMIN, BGH, KHTC, TUYEN_SINH, PHAP_CHE, AUDIT and out-of-scope accounts with synthetic users.",
    href: "/settings/scopes",
  },
  {
    code: "P0-19",
    title: "Sign legal and finance gate UAT",
    owner: "PHAP_CHE + KHTC + BGH",
    proof:
      "Prove legal basis, tuition policy and ALLOW_FINANCE gate before any receivable or payment trust.",
    href: "/ttgdtx/gate",
  },
  {
    code: "P2-17",
    title: "Prove payout cannot run twice",
    owner: "KHTC + BGH + Audit",
    proof:
      "Run duplicate-click, overpay, voucher normalization, RPC-only and required dossier UAT.",
    href: "/ttgdtx/payment-requests/pay",
  },
  {
    code: "P2-18",
    title: "Prove dashboard is read-only and reconciled",
    owner: "KHTC + BGH + IT_DATA",
    proof:
      "Compare dashboard totals to source workflows and prove role-scoped, read-only behavior.",
    href: "/ttgdtx/accounting-dashboard",
  },
  {
    code: "P6-03",
    title: "Prove audit-log traceability",
    owner: "Audit + IT_DATA + KHTC",
    proof:
      "Attach traceability rows for create, update, check, approve, pay and source-control events before owner review.",
    href: "/audit",
  },
  {
    code: "P6-06",
    title: "Close hard-delete and cascade risks",
    owner: "IT_DATA + Audit + business owners",
    proof:
      "Convert protected cascade paths to restrict/archive/status patterns or attach narrow written waiver for derived-only rows.",
    href: "/audit",
  },
  {
    code: "P0-14",
    title: "Close production evidence binder",
    owner: "IT_DATA + Audit + process owners",
    proof:
      "Verify every required proof, controlled location, forbidden-content check and owner signoff path before owner review.",
    href: "/ttgdtx",
  },
  {
    code: "P0-15",
    title: "Prepare final handoff summary",
    owner: "IT_DATA + Audit",
    proof:
      "Record live git state, local checks, Stage D/NO-GO and P0-03/P0-09/P0-13/P0-14 evidence paths, including P0-03 restore smoke-check proof for P0-19/P3 gate preservation, with P0-14 split into P6-04/P6-03/P6-06 proof paths and the P6-06 finding register, before owner decision.",
    href: "/master-control",
  },
  {
    code: "Owner GO/NO-GO",
    title: "Record final owner decision",
    owner: "BGH + IT_DATA + KHTC + PHAP_CHE + AUDIT",
    proof:
      "Use the owner sign-off pack and UAT operator handoff references. Production remains NO-GO until every required owner signs GO.",
  },
];

export const PRODUCTION_EVIDENCE_REQUIREMENTS: ProductionEvidenceRequirement[] = [
  {
    caseId: "P0-14-01",
    blockerCode: "P0-03",
    title: "Backup and restore dry-run evidence",
    owner: "IT_DATA + Audit",
    evidenceClass: "CONTROLLED_SENSITIVE",
    controlledLocation:
      "Controlled Drive/evidence folder outside Git, referenced by redacted evidence id only.",
    requiredProof:
      "Operator run sheet, backup ID, restore target, preflight/postflight result, restore smoke-check result proving P0-19 and P3-01/P3-02 gate preservation, and operator/checker names.",
    forbiddenContent:
      "No service-role key, database URL, password, OTP, raw dump, private connection string or raw backup file.",
    signoff:
      "IT_DATA and Audit accept restore evidence, including P0-19/P3 gate preservation, before migration order sign-off.",
  },
  {
    caseId: "P0-14-02",
    blockerCode: "Step90-Step110",
    title: "Migration order approval evidence",
    owner: "IT_DATA + KHTC + PHAP_CHE",
    evidenceClass: "CONTROLLED_REDACTED",
    controlledLocation:
      "Signed migration-order pack with redacted link in the production checklist.",
    requiredProof:
      "Step90-Step110 order, Step97/Step100/Step109/Step110 decisions, rollback point and owner signatures.",
    forbiddenContent:
      "No production SQL scratch, service secrets, raw credentials or unsigned verbal approval.",
    signoff: "IT_DATA, KHTC and PHAP_CHE sign before any production migration.",
  },
  {
    caseId: "P0-14-03",
    blockerCode: "P0-19",
    title: "Legal and finance gate UAT evidence",
    owner: "PHAP_CHE + KHTC + BGH",
    evidenceClass: "CONTROLLED_REDACTED",
    controlledLocation:
      "Legal/finance UAT folder separate from raw contracts and registry indexes.",
    requiredProof:
      "Legal basis, tuition policy, finance-gate verdict, pass/fail notes and signed UAT result.",
    forbiddenContent:
      "No private contract terms, raw student PII, raw CCCD or hidden finance waiver.",
    signoff: "PHAP_CHE, KHTC and BGH accept before receivable/payment reliance.",
  },
  {
    caseId: "P0-14-04",
    blockerCode: "P2-17",
    title: "Duplicate payout and dossier UAT evidence",
    owner: "KHTC + BGH + Audit",
    evidenceClass: "CONTROLLED_REDACTED",
    controlledLocation:
      "Payment UAT evidence folder with only redacted voucher/dossier references in docs.",
    requiredProof:
      "Duplicate-click result, overpay guard, voucher normalization, RPC-only path and BBNT/partner-invoice dossier check.",
    forbiddenContent:
      "No raw bank account, raw voucher, bank statement, payment password, OTP or payment-token screenshot.",
    signoff: "KHTC, BGH and Audit accept before payout is production-trusted.",
  },
  {
    caseId: "P0-14-05",
    blockerCode: "P2-18",
    title: "Accounting dashboard source-comparison evidence",
    owner: "KHTC + BGH + IT_DATA + Audit",
    evidenceClass: "CONTROLLED_REDACTED",
    controlledLocation:
      "Dashboard UAT folder with sanitized screenshots and source-query comparison notes.",
    requiredProof:
      "Authorized access, blocked out-of-scope access, no-write behavior and totals tied to source workflows.",
    forbiddenContent:
      "No row-level PII, bank data, raw payment evidence, password, OTP or AI-produced approval.",
    signoff: "KHTC, BGH, IT_DATA and Audit accept before dashboard reliance.",
  },
  {
    caseId: "P0-14-06",
    blockerCode: "P6-04",
    title: "Role and workspace UAT evidence",
    owner: "IT_DATA + TRUONG_PHONG + Audit",
    evidenceClass: "CONTROLLED_REDACTED",
    controlledLocation:
      "Governance UAT folder with role/workspace screenshots and route-matrix results.",
    requiredProof:
      "Synthetic-account role/workspace test matrix, blocked out-of-scope cases and signed route results.",
    forbiddenContent:
      "No real credentials, private profile data, reset links, passwords, OTPs or broad-access screenshots.",
    signoff: "IT_DATA, TRUONG_PHONG and Audit accept role/workspace evidence before owner GO/NO-GO.",
  },
  {
    caseId: "P0-14-07",
    blockerCode: "P6-03",
    title: "Audit-log traceability evidence",
    owner: "Audit + IT_DATA + KHTC",
    evidenceClass: "CONTROLLED_REDACTED",
    controlledLocation:
      "Governance UAT folder with redacted audit trace rows and event-to-action mapping.",
    requiredProof:
      "Trace rows for create, update, check, approve, pay and source-control events.",
    forbiddenContent:
      "No unrestricted audit export, raw profile data, raw payment evidence, passwords or service-role keys.",
    signoff: "Audit, IT_DATA and KHTC accept traceability evidence before owner GO/NO-GO.",
  },
  {
    caseId: "P0-14-08",
    blockerCode: "P6-06",
    title: "Hard-delete and cascade conversion evidence",
    owner: "IT_DATA + Audit + business owners",
    evidenceClass: "CONTROLLED_REDACTED",
    controlledLocation:
      "Governance evidence folder with conversion notes or narrow written waiver references.",
    requiredProof:
      "Protected cascade paths converted to restrict/archive/status patterns, or derived-only waiver signed with rollback note.",
    forbiddenContent:
      "No hidden hard-delete approval, raw sensitive row export, broad waiver or deletion-based rollback proof.",
    signoff: "IT_DATA, Audit and affected business owners accept conversion or narrow waiver before owner GO/NO-GO.",
  },
  {
    caseId: "P0-14-09",
    blockerCode: "P0-09",
    title: "Final owner GO/NO-GO evidence",
    owner: "BGH + IT_DATA + KHTC + PHAP_CHE + AUDIT + TRUONG_PHONG",
    evidenceClass: "CONTROLLED_REDACTED",
    controlledLocation:
      "Final owner sign-off pack outside Codex/chat with redacted checklist references only.",
    requiredProof:
      "Every blocker closed or explicitly waived by authority, final recommendation and signed decision referencing the owner sign-off pack and UAT operator handoff.",
    forbiddenContent:
      "No unsigned GO, AI approval, hidden waiver, raw sensitive attachment or oral-only decision.",
    signoff: "All required owners sign final GO/NO-GO; missing evidence keeps production NO-GO.",
  },
];
