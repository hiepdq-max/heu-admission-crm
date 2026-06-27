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
      "Record live git state, local checks, Stage D/NO-GO and P0-03/P0-09/P0-13/P0-14 evidence paths before owner decision.",
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
      "Operator run sheet, backup ID, restore target, preflight/postflight result, smoke-check result and operator/checker names.",
    forbiddenContent:
      "No service-role key, database URL, password, OTP, raw dump, private connection string or raw backup file.",
    signoff: "IT_DATA and Audit accept restore evidence before migration order sign-off.",
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
    blockerCode: "P6-04/P6-03/P6-06",
    title: "Role, audit-log and hard-delete evidence",
    owner: "IT_DATA + Audit + process owners",
    evidenceClass: "CONTROLLED_REDACTED",
    controlledLocation:
      "Governance UAT folder with role-scope screenshots, audit trace rows and waiver/conversion notes.",
    requiredProof:
      "Role/workspace test matrix, audit rows for finance actions and cascade conversion or written waiver.",
    forbiddenContent:
      "No real credentials, private profile data, unrestricted audit export or hidden hard-delete approval.",
    signoff: "IT_DATA, Audit and process owners accept before owner GO/NO-GO.",
  },
  {
    caseId: "P0-14-07",
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
