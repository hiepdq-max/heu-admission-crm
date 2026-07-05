export type HeuRoleLaneCode =
  | "ADMIN"
  | "BGH"
  | "HIEU_TRUONG"
  | "PHO_HIEU_TRUONG"
  | "KHTC"
  | "PHAP_CHE"
  | "IT_DATA"
  | "AUDIT";

export type HeuRoleLane = {
  code: HeuRoleLaneCode;
  label: string;
  ownerLane: string;
  allowedScope: string;
  forbiddenScope: string;
};

export type HeuDepartmentRoleLane = {
  code: string;
  label: string;
  accountableLane: string;
  operatingScope: string;
  requiredEvidence: string;
  forbiddenScope: string;
};

export const HEU_ROLE_LANE_CODES = [
  "ADMIN",
  "BGH",
  "HIEU_TRUONG",
  "PHO_HIEU_TRUONG",
  "KHTC",
  "PHAP_CHE",
  "IT_DATA",
  "AUDIT",
] as const satisfies readonly HeuRoleLaneCode[];

export const HEU_ROLE_LANE_BOUNDARY =
  "PASS_LOCAL_ROLE_GUARD NO_ACCESS_GRANT NO_PERMISSION_EXPANSION NO_FINANCE_EXECUTION NO_LEGAL_CONCLUSION NO_UAT_ACCEPTANCE NO_OWNER_GO";

export const HEU_DEPARTMENT_ROLE_LANE_BOUNDARY =
  "PASS_LOCAL_DEPARTMENT_ROLE_LANE_MAP READ_ONLY EXECUTIVE_OVERSIGHT NO_ACCESS_GRANT NO_PERMISSION_EXPANSION NO_ACCOUNT_CREATE NO_ROLE_ASSIGNMENT NO_FINANCE_EXECUTION NO_LEGAL_CONCLUSION NO_UAT_ACCEPTANCE NO_OWNER_GO NO_PRODUCTION_GO";

export const HEU_ROLE_LANE_MATRIX: HeuRoleLane[] = [
  {
    code: "ADMIN",
    label: "System administrator",
    ownerLane: "IT_DATA",
    allowedScope: "System configuration, emergency repair and technical setup.",
    forbiddenScope:
      "NO_BUSINESS_APPROVAL, NO_FINANCE_APPROVAL, NO_LEGAL_CONCLUSION, NO_OWNER_GO",
  },
  {
    code: "BGH",
    label: "BGH read-only executive",
    ownerLane: "BGH",
    allowedScope:
      "Executive dashboard, master control, report overview and blocker queue.",
    forbiddenScope:
      "NO_DAILY_DATA_ENTRY, NO_FINANCE_EXECUTION, NO_LEGAL_CONCLUSION, NO_UAT_ACCEPTANCE",
  },
  {
    code: "HIEU_TRUONG",
    label: "Hieu truong executive",
    ownerLane: "BGH",
    allowedScope:
      "Read-only executive dashboard, final decision package and owner queue visibility.",
    forbiddenScope:
      "NO_DAILY_DATA_ENTRY, NO_FINANCE_EXECUTION, NO_HIDDEN_SOURCE_EDIT, NO_BYPASS_SIGNED_UAT",
  },
  {
    code: "PHO_HIEU_TRUONG",
    label: "Pho hieu truong executive",
    ownerLane: "BGH",
    allowedScope:
      "Read-only delegated executive overview, module health and blocker queue.",
    forbiddenScope:
      "NO_DAILY_DATA_ENTRY, NO_FINANCE_EXECUTION, NO_HIDDEN_SOURCE_EDIT, NO_BYPASS_SIGNED_UAT",
  },
  {
    code: "KHTC",
    label: "Ke hoach tai chinh",
    ownerLane: "KHTC",
    allowedScope:
      "Receivable, reconciliation, invoice/chung-tu review and Finance Desk reliance preparation.",
    forbiddenScope:
      "NO_LEGAL_INTERPRETATION, NO_OWNER_GO, NO_UNAPPROVED_BANK_INSTRUCTION, NO_STATUTORY_BOOK_FROM_DASHBOARD",
  },
  {
    code: "PHAP_CHE",
    label: "Phap che",
    ownerLane: "PHAP_CHE",
    allowedScope:
      "Contract basis, legal/SOP mapping, evidence class, compliance and data-sharing route.",
    forbiddenScope:
      "NO_FINANCE_POSTING, NO_PAYMENT_EXECUTION, NO_UAT_ACCEPTANCE_ALONE, NO_OWNER_GO",
  },
  {
    code: "IT_DATA",
    label: "IT data",
    ownerLane: "IT_DATA",
    allowedScope:
      "Deployment, backup/restore, migration plan, RLS, role/scope and audit trigger checks.",
    forbiddenScope:
      "NO_BUSINESS_APPROVAL, NO_FINANCE_APPROVAL, NO_LEGAL_CONCLUSION, NO_OWNER_GO",
  },
  {
    code: "AUDIT",
    label: "Audit",
    ownerLane: "Audit",
    allowedScope:
      "Evidence intake/redaction, audit-log proof, waiver route and trace sampling.",
    forbiddenScope:
      "NO_BUSINESS_OPERATION_APPROVAL, NO_HIDDEN_EVIDENCE_MOVEMENT, NO_FINANCE_EXECUTION, NO_OWNER_GO",
  },
];

export const HEU_DEPARTMENT_ROLE_LANE_MAP: HeuDepartmentRoleLane[] = [
  {
    code: "DEPT-TUYEN-SINH",
    label: "Tuyen sinh / CRM",
    accountableLane: "BGH + Admissions owner",
    operatingScope:
      "Lead intake, campaign/source, pipeline, follow-up, document intake and handover preparation.",
    requiredEvidence:
      "Lead source, workspace scope, handover gate, P3/P0-19 dependency and audit trail reference.",
    forbiddenScope:
      "NO_FINAL_HANDOVER, NO_FINANCE_RELIANCE, NO_LEGAL_CONCLUSION, NO_OWNER_GO",
  },
  {
    code: "DEPT-DAO-TAO",
    label: "Dao tao / Short Course",
    accountableLane: "BGH + DAO_TAO owner",
    operatingScope:
      "Program/class readiness, short-course operation, attendance lock and training evidence route.",
    requiredEvidence:
      "Class/program source, attendance proof, policy/SOP ref, signed owner UAT and controlled evidence id.",
    forbiddenScope:
      "NO_ATTENDANCE_PAYMENT_FINALIZATION, NO_PAYROLL_RELIANCE, NO_FINANCE_EXECUTION, NO_OWNER_GO",
  },
  {
    code: "DEPT-CTHSSV",
    label: "CTHSSV",
    accountableLane: "BGH + CTHSSV owner",
    operatingScope:
      "Student profile, handover readiness, student-state review and controlled acceptance queue.",
    requiredEvidence:
      "Signed handover UAT, student-state source, redaction class and owner acceptance reference.",
    forbiddenScope:
      "NO_STUDENT_STATE_RELIANCE, NO_HIDDEN_EVIDENCE_MOVEMENT, NO_UAT_ACCEPTANCE_ALONE, NO_OWNER_GO",
  },
  {
    code: "DEPT-KHOA-GV",
    label: "Khoa / Giang vien",
    accountableLane: "BGH + KHOA_GV owner",
    operatingScope:
      "Teacher profile, class delivery source, teaching evidence, privacy and negative-access review.",
    requiredEvidence:
      "Teacher-profile privacy approval, delivery source map, negative-access proof and owner signoff.",
    forbiddenScope:
      "NO_PRIVATE_PROFILE_EXPOSURE, NO_PAYROLL_RELIANCE, NO_SOURCE_EDIT_FROM_DASHBOARD, NO_OWNER_GO",
  },
  {
    code: "DEPT-TCHC",
    label: "TCHC / HR records",
    accountableLane: "BGH + TCHC owner + IT_DATA",
    operatingScope:
      "Position, department, user responsibility, records archive and role/scope preparation.",
    requiredEvidence:
      "Position assignment, owner-seat closure, records archive ref and controlled evidence id.",
    forbiddenScope:
      "NO_ACCOUNT_CREATE, NO_ROLE_ASSIGNMENT, NO_SCOPE_CHANGE, NO_OWNER_GO",
  },
  {
    code: "DEPT-KHTC",
    label: "KHTC / Finance",
    accountableLane: "BGH + KHTC + Audit",
    operatingScope:
      "Receivable, collection, reconciliation, invoice/chung-tu, payment-request and reliance preparation.",
    requiredEvidence:
      "Source map, finance/legal gate, no-write proof, signed reliance decision and controlled evidence id.",
    forbiddenScope:
      "NO_VOUCHER_POSTING, NO_PAYMENT_EXECUTION, NO_BANK_INSTRUCTION, NO_STATUTORY_ACCOUNTING",
  },
  {
    code: "DEPT-PHAP-CHE",
    label: "Phap che / SOP",
    accountableLane: "BGH + PHAP_CHE + process owner",
    operatingScope:
      "Legal basis, contract/SOP mapping, evidence class, compliance and authority route.",
    requiredEvidence:
      "Legal basis, SOP version, maker/checker/approver route, signer and controlled evidence ref.",
    forbiddenScope:
      "NO_LEGAL_ADVICE_FROM_DASHBOARD, NO_OFFICIAL_SOP, NO_FINANCE_APPROVAL, NO_OWNER_GO",
  },
  {
    code: "DEPT-IT-DATA",
    label: "IT_DATA",
    accountableLane: "BGH + IT_DATA + Audit",
    operatingScope:
      "Deployment, backup/restore, migration order, RLS, role/scope and audit trigger checks.",
    requiredEvidence:
      "Restore proof, migration signoff, access-denial proof, audit trigger evidence and risk closure ref.",
    forbiddenScope:
      "NO_BUSINESS_APPROVAL, NO_FINANCE_APPROVAL, NO_LEGAL_CONCLUSION, NO_OWNER_GO",
  },
  {
    code: "DEPT-AUDIT",
    label: "Audit",
    accountableLane: "BGH + Audit",
    operatingScope:
      "Evidence intake/redaction, audit-log proof, waiver route, trace sampling and risk closure.",
    requiredEvidence:
      "Audit trace, redaction class, waiver decision, controlled evidence id and signed owner closure.",
    forbiddenScope:
      "NO_BUSINESS_OPERATION_APPROVAL, NO_HIDDEN_EVIDENCE_MOVEMENT, NO_FINANCE_EXECUTION, NO_OWNER_GO",
  },
];

export function normalizeHeuRoleCode(
  roleCode: string | null | undefined,
): string {
  return roleCode?.trim().toUpperCase() ?? "";
}

export function getHeuRoleLane(roleCode: string | null | undefined) {
  const normalizedRoleCode = normalizeHeuRoleCode(roleCode);

  return HEU_ROLE_LANE_MATRIX.find((lane) => lane.code === normalizedRoleCode);
}
