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

export const PRODUCTION_BLOCKERS: ProductionBlocker[] = [
  {
    code: "P0-03",
    title: "Backup and restore dry-run",
    owner: "IT_DATA + Audit",
    requiredEvidence:
      "Backup ID, restore target, preflight/postflight result and smoke-check evidence.",
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
      "Final signed multi-owner GO/NO-GO note with every stop condition closed.",
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
      "Attach backup ID, restore target, preflight/postflight output and smoke-check evidence outside Git.",
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
    code: "P6-03/P6-06",
    title: "Close audit-log and hard-delete risks",
    owner: "IT_DATA + Audit",
    proof:
      "Attach traceability rows for finance actions and conversion or written waiver for remaining cascade risks.",
    href: "/audit",
  },
  {
    code: "Owner GO/NO-GO",
    title: "Record final owner decision",
    owner: "BGH + IT_DATA + KHTC + PHAP_CHE + AUDIT",
    proof:
      "Use the owner sign-off pack. Production remains NO-GO until every required owner signs GO.",
  },
];
