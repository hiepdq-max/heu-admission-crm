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
  decisionValue: string;
  stopCondition: string;
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
  decisionValue: string;
  stopCondition: string;
  auditCommand: string;
};

export type ProductionFinanceUatFirstPassStep = {
  code: string;
  title: string;
  requiredProof: string;
  stopCondition: string;
  owner: string;
};

export type ProductionFinanceDayOneRunStep = {
  code: string;
  title: string;
  owner: string;
  requiredAction: string;
  requiredProof: string;
  decisionValue: string;
  stopCondition: string;
};

export const PRODUCTION_FINANCE_DAY_ONE_RUNBOOK =
  "docs/HEU_FINANCE_DAY1_REAL_RUN_REHEARSAL_20260630.md";

export type ProductionFinanceDayOneAccountLane = {
  accountLabel: string;
  owner: string;
  allowedRoutes: string;
  requiredResult: string;
  stopCondition: string;
};

export type ProductionFinanceDayOneResultField = {
  field: string;
  requiredValue: string;
  forbiddenContent: string;
};

export type ProductionRiskClosureStep = {
  code: string;
  title: string;
  owner: string;
  route: string;
  runbook: string;
  evidence: string;
  decisionValue: string;
  stopCondition: string;
  auditCommand: string;
};

export type ProductionInfraReadinessStep = {
  code: string;
  title: string;
  owner: string;
  route: string;
  runbook: string;
  evidence: string;
  decisionValue: string;
  stopCondition: string;
  auditCommand: string;
};

export type ProductionGateHandoverStep = {
  code: string;
  title: string;
  owner: string;
  route: string;
  runbook: string;
  evidence: string;
  decisionValue: string;
  stopCondition: string;
  auditCommand: string;
};

export type ProductionGovernanceAssuranceStep = {
  code: string;
  title: string;
  owner: string;
  route: string;
  runbook: string;
  evidence: string;
  decisionValue: string;
  stopCondition: string;
  auditCommand: string;
};

export type SignedUatExecutionRoute = {
  order: string;
  code: string;
  title: string;
  owner: string;
  route: string;
  runbook: string;
  minimumProof: string;
  decisionValue: string;
  stopCondition: string;
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
      "Final signed multi-owner GO/NO-GO note using the owner sign-off pack, final owner decision manifest, UAT operator handoff and redacted evidence references.",
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
      "Authorized access, blocked out-of-scope access, no-write behavior, source comparison, P6-04 real accounting user queue/result proof and dashboard reliance decision.",
    decisionValue: "P2_18_RELIANCE_READY / NO_GO / BLOCKED",
    stopCondition:
      "Dashboard can write, P6-04 real-accounting proof is missing, a source total is unreconciled, contract-only access exposes finance totals or owner reliance decision is unsigned.",
    auditCommand: "npm.cmd run audit:ttgdtx-accounting-dashboard-uat-plan",
  },
  {
    code: "P5-03",
    title: "Finance Desk browser UAT",
    owner: "KHTC + BGH + IT_DATA",
    route: "/finance-desk",
    runbook: "docs/HEU_FINANCE_DESK_UAT_RUNBOOK_20260627.md",
    evidence:
      "Scoped access, read-only cockpit behavior, source reconciliation, P6-04 real accounting user queue/result proof, no-secret screenshots and human reliance decision.",
    decisionValue: "P5_03_RELIANCE_READY / NO_GO / BLOCKED",
    stopCondition:
      "Finance Desk can mutate source facts, leaks TTGDTX scope, lacks P6-04 real-accounting proof, shows raw sensitive evidence or KHTC/BGH/Audit reliance decision is unsigned.",
    auditCommand: "npm.cmd run audit:heu-finance-desk",
  },
];

export const PRODUCTION_FINANCE_UAT_FIRST_PASS_STEPS: ProductionFinanceUatFirstPassStep[] = [
  {
    code: "FIN-UAT-01",
    title: "P0-10 evidence redaction is ready",
    owner: "IT_DATA + Audit",
    requiredProof:
      "Controlled evidence folder, redaction reviewer, evidence ID convention and forbidden-content check are prepared before any screenshot.",
    stopCondition:
      "Raw PII, CCCD, bank data, vouchers, passwords, temporary passwords, OTPs, reset links, invite links or service-role keys appear in Git/Codex/chat.",
  },
  {
    code: "FIN-UAT-02",
    title: "P6-04 real-accounting accounts are ready",
    owner: "IT_DATA + TRUONG_PHONG + Audit",
    requiredProof:
      "KHTC operator, BGH reviewer, Audit reviewer, Phap Che reviewer and out-of-scope negative account have queue/result evidence IDs.",
    stopCondition:
      "Any password/reset/invite link is recorded, any role scope leaks, or the out-of-scope account can see finance data.",
  },
  {
    code: "FIN-UAT-03",
    title: "P2-18 dashboard route is ready",
    owner: "KHTC + BGH + IT_DATA",
    requiredProof:
      "Read-only route, source-total reconciliation, contract-only denial and P2_18_RELIANCE_READY/NO_GO/BLOCKED decision shell are visible.",
    stopCondition:
      "Dashboard can write, source totals are unreconciled, contract-only access exposes totals or reliance decision is ownerless.",
  },
  {
    code: "FIN-UAT-04",
    title: "P5-03 Finance Desk route is ready",
    owner: "KHTC + BGH + IT_DATA",
    requiredProof:
      "Read-only cockpit, P5-03 immediate stop guard, real-user evidence bridge, acceptance matrix and reliance decision shell are visible.",
    stopCondition:
      "Finance Desk can mutate facts, leaks scope, issues bank instructions or stores uncontrolled evidence.",
  },
  {
    code: "FIN-UAT-05",
    title: "P0-14/P0-17 handoff is ready",
    owner: "IT_DATA + Audit + KHTC",
    requiredProof:
      "Finance reliance evidence checkpoint, P0-17 access closure decision and P0-14 controlled evidence intake ledger are referenced before owner review.",
    stopCondition:
      "Evidence ID, redaction reviewer, owner signature state or access closure decision is missing.",
  },
];

export const PRODUCTION_FINANCE_DAY_ONE_RUN_STEPS: ProductionFinanceDayOneRunStep[] = [
  {
    code: "FIN-DAY1-01",
    title: "Secure account activation outside Codex",
    owner: "IT_DATA + ADMIN",
    requiredAction:
      "Create or invite the KHTC, BGH, Audit, Phap Che and negative-control accounts in Supabase Auth through the approved secure channel only.",
    requiredProof:
      "Controlled evidence ID for account creation/invite status, redacted account label, profile link and assigned owner; no credential material in Git/Codex/chat.",
    decisionValue: "FIN_DAY1_READY / NO_GO / BLOCKED",
    stopCondition:
      "Passwords, temporary passwords, OTPs, reset links, account activation/invite links, service-role keys or raw identity screenshots enter Git/Codex/chat.",
  },
  {
    code: "FIN-DAY1-02",
    title: "Scope proof before first finance login",
    owner: "IT_DATA + TRUONG_PHONG + Audit",
    requiredAction:
      "Run P6-04 role/workspace checks for each real-accounting user label before any user reviews finance totals.",
    requiredProof:
      "REAL-ACC route result for KHTC, BGH, Audit, Phap Che and out-of-scope negative account with ALLOWED, BLOCKED or EMPTY_SCOPED_STATE result.",
    decisionValue: "FIN_DAY1_READY / NO_GO / BLOCKED",
    stopCondition:
      "Any finance user sees unrestricted dashboard totals, source evidence, payout action, lead data or audit data outside the approved scope.",
  },
  {
    code: "FIN-DAY1-03",
    title: "Read-only dashboard confidence check",
    owner: "KHTC + BGH + IT_DATA",
    requiredAction:
      "Open P2-18 and P5-03 with the approved accounting users and compare displayed totals against source workflow evidence.",
    requiredProof:
      "P2-18/P5-03 redacted screenshots, source reconciliation ID, read-only behavior result and reliance decision draft outside Git/Codex/chat.",
    decisionValue: "FIN_DAY1_READY / NO_GO / BLOCKED",
    stopCondition:
      "Dashboard or Finance Desk can write, totals are unreconciled, screenshots expose raw PII/bank/voucher data or reliance is ownerless.",
  },
  {
    code: "FIN-DAY1-04",
    title: "Payout rehearsal with no bank action",
    owner: "KHTC + BGH + Audit",
    requiredAction:
      "Use the P2-17 runbook to rehearse duplicate-click, overpay, voucher normalization, dossier and RPC-only controls without initiating a bank transfer.",
    requiredProof:
      "P2-17 release decision draft, duplicate/overpay result, dossier evidence ID and explicit no-bank-instruction note.",
    decisionValue: "FIN_DAY1_READY / NO_GO / BLOCKED",
    stopCondition:
      "A bank instruction is initiated, payout can run twice, dossier proof is missing, voucher proof is raw or KHTC/BGH/Audit signature is missing.",
  },
  {
    code: "FIN-DAY1-05",
    title: "Access closure before expansion",
    owner: "IT_DATA + Audit + KHTC",
    requiredAction:
      "Before adding the next department, record P0-17 ACCESS_RETAIN, REVOKE_OR_REDUCE or BLOCKED for every Day-1 account.",
    requiredProof:
      "Access closure decision ID, owner sign-off state, reduced-scope note for temporary pilot access and soft-revoke/INACTIVE proof for blocked users.",
    decisionValue: "FIN_DAY1_READY / NO_GO / BLOCKED",
    stopCondition:
      "Day-1 access remains broad, unsigned, not tied to P6-04/P2-18/P5-03 results, or blocked users keep active finance access.",
  },
];

export const PRODUCTION_FINANCE_DAY_ONE_ACCOUNT_LANES: ProductionFinanceDayOneAccountLane[] = [
  {
    accountLabel: "REAL_KHTC_TTGDTX_OPERATOR_01",
    owner: "KHTC + IT_DATA",
    allowedRoutes:
      "P2-10, P2-13, P2-17, P2-18 and P5-03 inside assigned TTGDTX scope only.",
    requiredResult:
      "ALLOWED only for approved finance work inside the assigned TTGDTX partner/workspace.",
    stopCondition:
      "Sees unrestricted finance totals, payout action or source evidence outside approved scope.",
  },
  {
    accountLabel: "REAL_BGH_READONLY_01",
    owner: "BGH + IT_DATA",
    allowedRoutes: "Read-only P2-18, P5-03 and Master Control.",
    requiredResult:
      "READ_ONLY, with no daily entry, payment execution, evidence edit or production GO action.",
    stopCondition:
      "Can enter finance data, approve/pay, edit evidence, grant access or mark GO.",
  },
  {
    accountLabel: "REAL_AUDIT_READONLY_01",
    owner: "Audit + IT_DATA",
    allowedRoutes: "Read-only audit, evidence and finance reliance review.",
    requiredResult:
      "READ_ONLY, with audit/evidence visibility limited to approved redacted evidence references.",
    stopCondition:
      "Can move money, grant roles, mutate facts, bypass redaction or view raw secrets.",
  },
  {
    accountLabel: "REAL_PHAP_CHE_REVIEW_01",
    owner: "PHAP_CHE + IT_DATA",
    allowedRoutes: "Legal/source review only within approved scope.",
    requiredResult:
      "LEGAL_REVIEW_ONLY, with finance totals and private contract bodies hidden unless approved.",
    stopCondition:
      "Sees unrestricted finance totals or private contract bodies outside written approval.",
  },
  {
    accountLabel: "REAL_OUT_OF_SCOPE_NEGATIVE_01",
    owner: "IT_DATA + Audit",
    allowedRoutes: "Login only; expected blocked or empty scoped state.",
    requiredResult: "BLOCKED or EMPTY_SCOPED_STATE.",
    stopCondition:
      "Sees TTGDTX finance, lead, source, dashboard, audit, settings or evidence data.",
  },
];

export const PRODUCTION_FINANCE_DAY_ONE_RESULT_FIELDS: ProductionFinanceDayOneResultField[] = [
  {
    field: "Evidence ID",
    requiredValue:
      "Stable controlled evidence ID such as FIN-DAY1-EVID-001, stored outside Git/Codex/chat.",
    forbiddenContent:
      "No raw screenshots, passwords, temporary passwords, OTPs, reset links or invite links.",
  },
  {
    field: "Account label",
    requiredValue:
      "Redacted account label from the approved Day-1 lane list, not a raw identity screenshot.",
    forbiddenContent:
      "No password, invite link, reset link, OTP, real email screenshot or unrestricted identity data.",
  },
  {
    field: "Profile/scope",
    requiredValue:
      "Role, department, segment and TTGDTX partner/workspace scope assigned for the test.",
    forbiddenContent:
      "No broad admin scope, service-role key, database URL or private connection string.",
  },
  {
    field: "Route",
    requiredValue:
      "P6-04, P2-18, P5-03, P2-17 or P0-17 closure route used for the result.",
    forbiddenContent:
      "No unapproved production migration, bank action, source mutation or hidden admin route.",
  },
  {
    field: "Expected result",
    requiredValue:
      "ALLOWED, READ_ONLY, LEGAL_REVIEW_ONLY, BLOCKED, EMPTY_SCOPED_STATE, NO_GO or BLOCKED_PENDING_OWNER_SIGNOFF.",
    forbiddenContent: "No ownerless pass, implied production GO or unsigned finance reliance.",
  },
  {
    field: "Actual result",
    requiredValue:
      "Browser/operator result with redacted evidence reference and variance note if any.",
    forbiddenContent:
      "No raw PII, CCCD, bank data, voucher body, private contract body or unrestricted totals leak.",
  },
  {
    field: "Owner decision",
    requiredValue: "FIN_DAY1_RESULT_READY, NO_GO or BLOCKED.",
    forbiddenContent:
      "No UAT acceptance, dashboard reliance, finance approval, access approval or production GO without signed owner evidence.",
  },
  {
    field: "Access closure",
    requiredValue: "ACCESS_RETAIN, REVOKE_OR_REDUCE or BLOCKED for each Day-1 account.",
    forbiddenContent:
      "No broad temporary pilot access after NO_GO/BLOCKED or unsigned owner decision.",
  },
  {
    field: "Sign-off",
    requiredValue:
      "Operator, checker, process owner and redaction reviewer recorded outside Git/Codex/chat.",
    forbiddenContent:
      "No password, OTP, invite/reset link, service-role key, raw identity file or bank credential.",
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
    decisionValue: "P6_06_CLOSURE_READY / NO_GO / BLOCKED",
    stopCondition:
      "Any protected finance, evidence, approval, payment, lead or audit path can still hard-delete without signed conversion or narrow written waiver.",
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
    decisionValue: "P2_17_RELEASE_READY / NO_GO / BLOCKED",
    stopCondition:
      "Payment can run twice, overpay is possible, voucher evidence is raw, dossier proof is missing or KHTC/BGH/Audit release decision is unsigned.",
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
      "Target identity lock, backup ID, isolated restore target, preflight/postflight output, restore smoke-check and P0-19/P3 gate-preservation proof.",
    decisionValue: "P0_03_RESTORE_READY / NO_GO / BLOCKED",
    stopCondition:
      "Backup ID is missing, restore target is not isolated, smoke-check fails, P0-19/P3 gate preservation is unproven or IT_DATA/Audit evidence is unsigned.",
    auditCommand: "npm.cmd run audit:ttgdtx-backup-restore-dry-run-pack",
  },
  {
    code: "Step90-Step110",
    title: "Signed production migration order",
    owner: "IT_DATA + KHTC + PHAP_CHE",
    route: "/settings/supabase-check",
    runbook: "docs/STEP90_STEP110_MIGRATION_ORDER_SIGNOFF_GUARD_20260627.md",
    evidence:
      "MIGRATION_EVIDENCE_ACCEPTED decision, signed Step90-Step110 order, rollback point, Step97/Step100/Step109/Step110 decisions and owner acceptance after backup/restore proof.",
    decisionValue: "STEP90_110_MIGRATION_READY / NO_GO / BLOCKED",
    stopCondition:
      "Migration order is unsigned, backup/restore proof is not accepted, rollback point is unclear, Step decisions are missing or any owner marks NO-GO/BLOCKED.",
    auditCommand: "npm.cmd run audit:ttgdtx-migration-order-guard",
  },
];

export const PRODUCTION_GATE_HANDOVER_STEPS: ProductionGateHandoverStep[] = [
  {
    code: "P0-19",
    title: "Legal and finance gate UAT",
    owner: "PHAP_CHE + KHTC + BGH",
    route: "/ttgdtx/gate",
    runbook: "docs/P0_19_P2_01_P2_02_PILOT_OPEN_UAT_RUNBOOK.md",
    evidence:
      "Legal basis, tuition policy, waiver/exception decision and ALLOW_FINANCE gate proof before any receivable or payment reliance.",
    decisionValue: "P0_19_GATE_READY / NO_GO / BLOCKED",
    stopCondition:
      "Legal basis, tuition policy, waiver/exception decision, finance gate proof or PHAP_CHE/KHTC/BGH owner signature is missing.",
    auditCommand: "npm.cmd run audit:ttgdtx-p019-gate-guard",
  },
  {
    code: "P3-01/P3-02",
    title: "Lead lifecycle and handover UAT",
    owner: "TUYEN_SINH + CTHSSV + DAO_TAO + KHTC",
    route: "/leads",
    runbook: "docs/HEU_LEAD_LIFECYCLE_HANDOVER_UAT_RUNBOOK_20260628.md",
    evidence:
      "Signed lifecycle and handover UAT proving handover cannot create finance facts or bypass P0-19/P2-05/P2-03 finance gates.",
    decisionValue: "P3_01_P3_02_HANDOVER_READY / NO_GO / BLOCKED",
    stopCondition:
      "Lead handover can create receivable facts, bypass P0-19/P2-05/P2-03 gates, leak role/workspace scope or lacks signed owner decision.",
    auditCommand: "npm.cmd run audit:heu-lead-lifecycle-handover-uat-pack",
  },
];

export const PRODUCTION_GOVERNANCE_ASSURANCE_STEPS: ProductionGovernanceAssuranceStep[] = [
  {
    code: "P6-04",
    title: "Role and workspace scope UAT",
    owner: "IT_DATA + TRUONG_PHONG + Audit",
    route: "/settings/scopes",
    runbook: "docs/HEU_ROLE_SCOPE_UAT_EXECUTION_PACK_20260627.md",
    evidence:
      "Synthetic-account route matrix proving ADMIN, BGH, KHTC, TUYEN_SINH, PHAP_CHE, AUDIT and out-of-scope users see only allowed workspaces.",
    decisionValue: "P6_04_SCOPE_READY / NO_GO / BLOCKED",
    stopCondition:
      "Any role leak, broad workspace access, server-side bypass, missing negative test, missing redaction proof or unsigned owner result remains.",
    auditCommand: "npm.cmd run audit:heu-role-scope-uat-pack",
  },
  {
    code: "P6-03",
    title: "Audit-log traceability UAT",
    owner: "Audit + IT_DATA + KHTC",
    route: "/audit",
    runbook: "docs/TTGDTX_AUDIT_LOG_UAT_RUNBOOK.md",
    evidence:
      "Trace rows for create, update, check, approve, pay and source-control events with actor, entity, time and redacted evidence reference.",
    decisionValue: "P6_03_TRACE_READY / NO_GO / BLOCKED",
    stopCondition:
      "Any required trace row is missing, actor/action is unclear, source-control trace is absent, evidence reference is uncontrolled or Audit/KHTC signoff is missing.",
    auditCommand: "npm.cmd run audit:ttgdtx-audit-trail-guard",
  },
];

export const SIGNED_UAT_EXECUTION_ROUTES: SignedUatExecutionRoute[] = [
  {
    order: "UAT-ROUTE-01",
    code: "P0-10",
    title: "Controlled evidence redaction intake",
    owner: "IT_DATA + Audit",
    route: "/audit",
    runbook: "docs/HEU_CONTROLLED_EVIDENCE_REDACTION_PACK_20260627.md",
    minimumProof:
      "Controlled storage location, redaction class, reviewer and evidence ID before any screenshot, voucher, backup proof or signed result is referenced.",
    decisionValue: "SIGNED_UAT_READY / NO_GO / BLOCKED",
    stopCondition:
      "Raw student PII, CCCD, bank data, passwords, temporary passwords, OTPs, password reset links, account activation/invite links, service-role keys, vouchers or unredacted screenshots are present.",
    auditCommand: "npm.cmd run audit:heu-controlled-evidence-redaction-pack",
  },
  {
    order: "UAT-ROUTE-02",
    code: "P0-03",
    title: "Backup/restore dry-run proof",
    owner: "IT_DATA + Audit",
    route: "/settings/supabase-check",
    runbook: "docs/STEP90_STEP110_BACKUP_RESTORE_OPERATOR_RUN_SHEET_20260627.md",
    minimumProof:
      "Backup ID, isolated restore target, preflight/postflight output and restore smoke-check evidence with P0-19/P3 gate preservation.",
    decisionValue: "SIGNED_UAT_READY / NO_GO / BLOCKED",
    stopCondition:
      "No real backup ID, no isolated restore target, failed smoke-check, unsigned restore evidence or production target confusion.",
    auditCommand: "npm.cmd run audit:ttgdtx-backup-restore-dry-run-pack",
  },
  {
    order: "UAT-ROUTE-03",
    code: "Step90-Step110",
    title: "Signed production migration order",
    owner: "IT_DATA + KHTC + PHAP_CHE",
    route: "/settings/supabase-check",
    runbook: "docs/STEP90_STEP110_MIGRATION_ORDER_SIGNOFF_GUARD_20260627.md",
    minimumProof:
      "Signed migration order after accepted backup/restore evidence, rollback point and Step97/Step100/Step109/Step110 decisions.",
    decisionValue: "SIGNED_UAT_READY / NO_GO / BLOCKED",
    stopCondition:
      "Migration order is unsigned, backup proof is missing, rollback point is unclear or any owner marks BLOCKED.",
    auditCommand: "npm.cmd run audit:ttgdtx-migration-order-guard",
  },
  {
    order: "UAT-ROUTE-04",
    code: "P6-04",
    title: "Role/workspace scope UAT",
    owner: "IT_DATA + TRUONG_PHONG + Audit",
    route: "/settings/scopes",
    runbook: "docs/HEU_ROLE_SCOPE_UAT_EXECUTION_PACK_20260627.md",
    minimumProof:
      "Synthetic ADMIN, BGH, KHTC, TUYEN_SINH, CTHSSV, DAO_TAO, PHAP_CHE, AUDIT and out-of-scope route matrix with blocked negative cases.",
    decisionValue: "SIGNED_UAT_READY / NO_GO / BLOCKED",
    stopCondition:
      "Any role leak, broad workspace access, server-side bypass, missing redaction proof or unsigned owner result.",
    auditCommand: "npm.cmd run audit:heu-role-scope-uat-pack",
  },
  {
    order: "UAT-ROUTE-05",
    code: "P0-19",
    title: "Legal and finance gate UAT",
    owner: "PHAP_CHE + KHTC + BGH",
    route: "/ttgdtx/gate",
    runbook: "docs/P0_19_P2_01_P2_02_PILOT_OPEN_UAT_RUNBOOK.md",
    minimumProof:
      "Legal basis, tuition policy, waiver/exception decision and ALLOW_FINANCE gate proof before receivable or collection reliance.",
    decisionValue: "SIGNED_UAT_READY / NO_GO / BLOCKED",
    stopCondition:
      "Legal basis, tuition rule, waiver decision, finance gate proof or owner signature is missing.",
    auditCommand: "npm.cmd run audit:ttgdtx-p019-gate-guard",
  },
  {
    order: "UAT-ROUTE-06",
    code: "P3-01/P3-02",
    title: "Lead lifecycle and handover UAT",
    owner: "TUYEN_SINH + CTHSSV + DAO_TAO + KHTC",
    route: "/leads",
    runbook: "docs/HEU_LEAD_LIFECYCLE_HANDOVER_UAT_RUNBOOK_20260628.md",
    minimumProof:
      "Lifecycle and handover route evidence proving handover cannot create finance facts or bypass P0-19/P2-05/P2-03 gates.",
    decisionValue: "SIGNED_UAT_READY / NO_GO / BLOCKED",
    stopCondition:
      "Handover can create receivable facts directly, bypass finance gate, leak scope or lacks signed owner result.",
    auditCommand: "npm.cmd run audit:heu-lead-lifecycle-handover-uat-pack",
  },
  {
    order: "UAT-ROUTE-07",
    code: "P2-17",
    title: "Payout duplicate and dossier UAT",
    owner: "KHTC + BGH + Audit",
    route: "/ttgdtx/payment-requests/pay",
    runbook: "docs/P2_17_DUPLICATE_PAYOUT_UAT_RUNBOOK.md",
    minimumProof:
      "Duplicate-click, overpay, voucher normalization, RPC-only path and BBNT/partner-invoice dossier evidence.",
    decisionValue: "SIGNED_UAT_READY / NO_GO / BLOCKED",
    stopCondition:
      "Payment can run twice, overpay is possible, dossier evidence is missing, voucher proof is raw or owner signature is absent.",
    auditCommand: "npm.cmd run audit:ttgdtx-payout-execution-readiness",
  },
  {
    order: "UAT-ROUTE-08",
    code: "P2-18/P5-03",
    title: "Dashboard and Finance Desk browser UAT",
    owner: "KHTC + BGH + IT_DATA",
    route: "/ttgdtx/accounting-dashboard",
    runbook: "docs/P2_18_ACCOUNTING_DASHBOARD_UAT_RUNBOOK.md + docs/HEU_FINANCE_DESK_UAT_RUNBOOK_20260627.md",
    minimumProof:
      "Read-only behavior, source reconciliation, role denial, P6-04 real accounting user queue/result proof, Finance Desk scope proof and reliance decision for dashboard users.",
    decisionValue: "SIGNED_UAT_READY / NO_GO / BLOCKED",
    stopCondition:
      "Dashboard can write, source reconciliation is missing, P6-04 real-accounting proof is missing, Finance Desk leaks scope or BGH/KHTC reliance decision is unsigned.",
    auditCommand: "npm.cmd run audit:ttgdtx-dashboard-source-reconciliation",
  },
  {
    order: "UAT-ROUTE-09",
    code: "P6-03",
    title: "Audit-log traceability UAT",
    owner: "Audit + IT_DATA + KHTC",
    route: "/audit",
    runbook: "docs/TTGDTX_AUDIT_LOG_UAT_RUNBOOK.md",
    minimumProof:
      "Trace rows for create, update, check, approve, pay and source-control events with actor, entity, timestamp and controlled evidence reference.",
    decisionValue: "SIGNED_UAT_READY / NO_GO / BLOCKED",
    stopCondition:
      "Trace row is missing, generic payload hides the actor/action, source-control trace is absent or evidence is unsigned.",
    auditCommand: "npm.cmd run audit:ttgdtx-audit-trail-guard",
  },
  {
    order: "UAT-ROUTE-10",
    code: "P6-06",
    title: "Hard-delete/cascade closure proof",
    owner: "IT_DATA + Audit + business owners",
    route: "/audit",
    runbook: "docs/HEU_NON_TTGDTX_CASCADE_FINDING_REGISTER_20260628.md",
    minimumProof:
      "Conversion proof or narrow written waiver for unresolved findings plus rollback and closure decision evidence.",
    decisionValue: "SIGNED_UAT_READY / NO_GO / BLOCKED",
    stopCondition:
      "Any protected finance, evidence, approval, payment, lead or audit path can be hard-deleted without signed conversion or waiver.",
    auditCommand: "npm.cmd run audit:hard-delete-conversion-decision-queue",
  },
  {
    order: "UAT-ROUTE-11",
    code: "P0-09",
    title: "Final owner GO/NO-GO decision",
    owner: "BGH + IT_DATA + KHTC + PHAP_CHE + AUDIT + TRUONG_PHONG",
    route: "/ttgdtx",
    runbook: "docs/TTGDTX_PRODUCTION_OWNER_SIGNOFF_PACK_20260627.md",
    minimumProof:
      "Final owner decision manifest with signed UAT, evidence binder, migration, backup, role, P0-17 access closure decision, audit and risk-closure references.",
    decisionValue: "SIGNED_UAT_READY / NO_GO / BLOCKED",
    stopCondition:
      "Any required owner signs NO-GO/BLOCKED, P0-17 access closure is missing, any proof path is uncontrolled, or any prerequisite UAT remains pending.",
    auditCommand: "npm.cmd run audit:ttgdtx-production-owner-signoff-pack",
  },
];

export const PRODUCTION_EXECUTION_STEPS: ProductionExecutionStep[] = [
  {
    code: "P0-10",
    title: "Apply controlled evidence redaction",
    owner: "IT_DATA + Audit",
    proof:
      "Use the redaction pack before any UAT screenshot, backup proof, voucher or signed evidence is referenced.",
    decisionValue: "P0_10_REDACTION_READY / NO_GO / BLOCKED",
    stopCondition:
      "Any raw PII, bank account, voucher, password, service key, backup dump or unsigned evidence is stored in Git/Codex/chat or lacks redaction reviewer proof.",
    href: "/audit",
  },
  {
    code: "P0-03",
    title: "Execute backup and restore dry-run",
    owner: "IT_DATA + Audit",
    proof:
      "Complete the target identity lock and operator run sheet, then attach backup ID, restore target, preflight/postflight output and smoke-check evidence outside Git.",
    decisionValue: "P0_03_RESTORE_READY / NO_GO / BLOCKED",
    stopCondition:
      "Backup ID is missing, restore target is not isolated, smoke-check fails, P0-19/P3 gate preservation is unproven or IT_DATA/Audit evidence is unsigned.",
    href: "/settings/supabase-check",
  },
  {
    code: "Step90-Step110",
    title: "Sign migration order",
    owner: "IT_DATA + KHTC + PHAP_CHE",
    proof:
      "Approve migration evidence acceptance lock, migration order and Step97, Step100, Step109 and Step110 decisions after backup/restore evidence.",
    decisionValue: "STEP90_110_MIGRATION_READY / NO_GO / BLOCKED",
    stopCondition:
      "Migration order is unsigned, backup/restore proof is not accepted, rollback point is unclear, Step decisions are missing or any owner marks NO-GO/BLOCKED.",
  },
  {
    code: "P6-04",
    title: "Run role and workspace UAT",
    owner: "IT_DATA + TRUONG_PHONG + Audit",
    proof:
      "Test ADMIN, BGH, KHTC, TUYEN_SINH, PHAP_CHE, AUDIT and out-of-scope accounts with synthetic users.",
    decisionValue: "P6_04_SCOPE_READY / NO_GO / BLOCKED",
    stopCondition:
      "Any role leak, broad workspace access, server-side bypass, missing negative test, missing redaction proof or unsigned owner result remains.",
    href: "/settings/scopes",
  },
  {
    code: "P0-19",
    title: "Sign legal and finance gate UAT",
    owner: "PHAP_CHE + KHTC + BGH",
    proof:
      "Prove legal basis, tuition policy and ALLOW_FINANCE gate before any receivable or payment trust.",
    decisionValue: "P0_19_GATE_READY / NO_GO / BLOCKED",
    stopCondition:
      "Legal basis, tuition policy, waiver/exception decision, invoice/chung-tu expectation or ALLOW_FINANCE gate result is missing or unsigned.",
    href: "/ttgdtx/gate",
  },
  {
    code: "P2-17",
    title: "Prove payout cannot run twice",
    owner: "KHTC + BGH + Audit",
    proof:
      "Run duplicate-click, overpay, voucher normalization, RPC-only and required dossier UAT.",
    decisionValue: "P2_17_RELEASE_READY / NO_GO / BLOCKED",
    stopCondition:
      "Payment can run twice, dossier proof is incomplete, voucher normalization fails, RPC bypass exists or KHTC/BGH/Audit signoff is missing.",
    href: "/ttgdtx/payment-requests/pay",
  },
  {
    code: "P2-18",
    title: "Prove dashboard is read-only and reconciled",
    owner: "KHTC + BGH + IT_DATA",
    proof:
      "Compare dashboard totals to source workflows and prove role-scoped, read-only behavior.",
    decisionValue: "P2_18_RELIANCE_READY / NO_GO / BLOCKED",
    stopCondition:
      "Dashboard can write, totals do not reconcile to source workflows, scope leaks or KHTC/BGH reliance signoff is missing.",
    href: "/ttgdtx/accounting-dashboard",
  },
  {
    code: "P6-03",
    title: "Prove audit-log traceability",
    owner: "Audit + IT_DATA + KHTC",
    proof:
      "Attach traceability rows for create, update, check, approve, pay and source-control events before owner review.",
    decisionValue: "P6_03_TRACE_READY / NO_GO / BLOCKED",
    stopCondition:
      "Any required trace row is missing, actor/action is unclear, source-control trace is absent, evidence reference is uncontrolled or Audit/KHTC signoff is missing.",
    href: "/audit",
  },
  {
    code: "P6-06",
    title: "Close hard-delete and cascade risks",
    owner: "IT_DATA + Audit + business owners",
    proof:
      "Convert protected cascade paths to restrict/archive/status patterns or attach narrow written waiver for derived-only rows.",
    decisionValue: "P6_06_CLOSURE_READY / NO_GO / BLOCKED",
    stopCondition:
      "Any protected finance, evidence, approval, payment, lead or audit path can still cascade-delete, or written waiver/conversion proof is missing.",
    href: "/audit",
  },
  {
    code: "P0-14",
    title: "Close production evidence binder",
    owner: "IT_DATA + Audit + process owners",
    proof:
      "Verify every required proof, controlled location, controlled evidence intake ledger, redaction reviewer, owner signature state, forbidden-content check and owner signoff path before owner review.",
    decisionValue: "P0_14_EVIDENCE_READY / NO_GO / BLOCKED",
    stopCondition:
      "Any required proof is uncontrolled, redaction reviewer is missing, owner signature state is unclear, forbidden content is present or intake-ledger reference is absent.",
    href: "/ttgdtx",
  },
  {
    code: "P0-15",
    title: "Prepare final handoff summary",
    owner: "IT_DATA + Audit",
    proof:
      "Record live git state, local checks, Stage D/NO-GO and P0-03/P0-09/P0-13/P0-14 evidence paths, including P0-03 restore smoke-check proof for P0-19/P3 gate preservation and the P0-09 final owner decision manifest, with P0-14 controlled evidence intake ledger, redaction reviewer, owner signature state, P2-18/P5-03 real-accounting finance reliance proof, P0-17 access closure decision, P6-04/P6-03/P6-06 proof paths and the P6-06 finding register, before owner decision.",
    decisionValue: "P0_15_HANDOFF_READY / NO_GO / BLOCKED",
    stopCondition:
      "Live git state, local checks, Stage D/NO-GO, evidence paths or proof owners are missing, or the handoff summary claims production GO before signed owner decision.",
    href: "/master-control",
  },
  {
    code: "Owner GO/NO-GO",
    title: "Record final owner decision",
    owner: "BGH + IT_DATA + KHTC + PHAP_CHE + AUDIT",
    proof:
      "Use the owner sign-off pack, final owner decision manifest and UAT operator handoff references. Production remains NO-GO until every required owner signs GO.",
    decisionValue: "OWNER_GO_NO_GO_SIGNED / NO_GO / BLOCKED",
    stopCondition:
      "Any required owner signature is missing, any owner marks NO-GO/BLOCKED, any prerequisite UAT/evidence/migration/risk closure remains open or the decision is stored only in Codex/chat.",
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
      "Target identity lock, operator run sheet, backup ID, restore target, preflight/postflight result, restore smoke-check result proving P0-19 and P3-01/P3-02 gate preservation, and operator/checker names.",
    forbiddenContent:
      "No service-role key, database URL, password, temporary password, OTP, password reset link, account activation/invite link, raw dump, private connection string or raw backup file.",
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
      "MIGRATION_EVIDENCE_ACCEPTED decision, Step90-Step110 order, Step97/Step100/Step109/Step110 decisions, rollback point and owner signatures.",
    forbiddenContent:
      "No production SQL scratch, service secrets, raw credentials, temporary password, password reset link, account activation/invite link or unsigned verbal approval.",
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
      "No private contract terms, raw student PII, raw CCCD, temporary password, password reset link, account activation/invite link or hidden finance waiver.",
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
      "No raw bank account, raw voucher, bank statement, payment password, temporary password, OTP, password reset link, account activation/invite link or payment-token screenshot.",
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
      "No row-level PII, bank data, raw payment evidence, password, temporary password, OTP, password reset link, account activation/invite link or AI-produced approval.",
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
      "No real credentials, private profile data, password reset links, account activation/invite links, passwords, temporary passwords, OTPs or broad-access screenshots.",
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
      "No unrestricted audit export, raw profile data, raw payment evidence, passwords, temporary passwords, OTPs, password reset links, account activation/invite links or service-role keys.",
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
      "No hidden hard-delete approval, raw sensitive row export, temporary password, password reset link, account activation/invite link, broad waiver or deletion-based rollback proof.",
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
      "Every blocker closed or explicitly waived by authority, final recommendation and signed decision referencing the owner sign-off pack, final owner decision manifest and UAT operator handoff.",
    forbiddenContent:
      "No unsigned GO, AI approval, hidden waiver, raw sensitive attachment, temporary password, password reset link, account activation/invite link or oral-only decision.",
    signoff: "All required owners sign final GO/NO-GO; missing evidence keeps production NO-GO.",
  },
];
