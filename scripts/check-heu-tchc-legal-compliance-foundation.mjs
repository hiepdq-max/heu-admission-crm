import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function fail(message) {
  console.error(`HEU TCHC legal compliance check failed: ${message}`);
  process.exit(1);
}

function requireIncludes(source, tokens, label) {
  const missing = tokens.filter((token) => !source.includes(token));

  if (missing.length > 0) {
    fail(`${label} missing: ${missing.join(", ")}`);
  }
}

function forbidIncludes(source, tokens, label) {
  const found = tokens.filter((token) => source.includes(token));

  if (found.length > 0) {
    fail(`${label} contains forbidden token: ${found.join(", ")}`);
  }
}

const sqlPath = "database/step117_tchc_legal_compliance_foundation.sql";
const docPath = "docs/HEU_TCHC_LEGAL_COMPLIANCE_FOUNDATION_20260703.md";
const routePath = "app/tchc/legal-gates/page.tsx";
const componentPath = "components/tchc/tchc-legal-gates-readonly.tsx";
const appShellPath = "components/layout/app-shell.tsx";

const sql = read(sqlPath);
const doc = read(docPath);
const route = read(routePath);
const component = read(componentPath);
const appShell = read(appShellPath);

const legalCodes = [
  "LEGAL_TCHC_VAN_THU_LUU_TRU_REVIEW_REQUIRED",
  "LEGAL_TCHC_HANH_CHINH_NHAN_SU_REVIEW_REQUIRED",
  "LEGAL_TCHC_CSVC_TAI_SAN_REVIEW_REQUIRED",
  "LEGAL_TCHC_HAU_CAN_AN_NINH_Y_TE_REVIEW_REQUIRED",
  "LEGAL_TCHC_REPORT_PRIVACY_REVIEW_REQUIRED",
];

const sopCodes = [
  "SOP_TCHC_VAN_THU_LUU_TRU",
  "SOP_TCHC_HANH_CHINH_NHAN_SU",
  "SOP_TCHC_CSVC_TAI_SAN",
  "SOP_TCHC_HAU_CAN_AN_NINH_Y_TE",
  "SOP_TCHC_REPORT_PRIVACY",
];

const complianceCodes = Array.from({ length: 14 }, (_, index) =>
  `TCHC-LEGAL-${String(index + 1).padStart(2, "0")}`,
);

requireIncludes(sql, legalCodes, "legal registry placeholders");
requireIncludes(sql, sopCodes, "SOP registry placeholders");
requireIncludes(sql, complianceCodes, "TCHC compliance matrix");
requireIncludes(sql, [
  "create table if not exists public.heu_tchc_legal_compliance_requirements",
  "create or replace view public.heu_tchc_legal_compliance_status",
  "insert into public.decision_gates",
  "LEGAL_REVIEW_REQUIRED",
  "SOP_REQUIRED",
  "READY_FOR_UAT",
  "SIGNED_OFF",
  "LEGAL_NO_GO",
  "SOP_NO_GO",
  "GATE_NO_GO",
  "LEGAL_READY",
  "automation_allowed boolean not null default false",
  "ai_allowed boolean not null default false",
  "public.can_read_master_control()",
  "public.can_manage_master_control()",
], "SQL legal/SOP gate controls");
requireIncludes(sql, [
  "SENSITIVE_PII",
  "HEALTH_SENSITIVE",
  "FINANCE_EVIDENCE",
  "CONFIDENTIAL",
  "raw CCCD",
  "PHAP_CHE must confirm legal basis",
  "outside Git/Codex/chat",
], "sensitive data and owner signoff boundaries");
requireIncludes(doc, [
  "Status: DRAFT_CONTROL",
  "Production status: NO-GO",
  "LEGAL_TCHC_VAN_THU_LUU_TRU_REVIEW_REQUIRED",
  "SOP_TCHC_REPORT_PRIVACY",
  "heu_tchc_legal_compliance_requirements",
  "heu_tchc_legal_compliance_status",
  "Khong dua raw CCCD",
  "PASS_LOCAL khong phai legal approval",
  "Tat ca dong ban dau dang `LEGAL_NO_GO`",
], "legal compliance foundation doc");
requireIncludes(route, [
  "heu_tchc_legal_compliance_status",
  "TchcLegalGatesReadonly",
  "active=\"tchc-legal-gates\"",
  "Production remains NO-GO",
], routePath);
requireIncludes(component, [
  "data-heu-tchc-legal-gates-readonly=\"TCHC_LEGAL_GATE_READONLY\"",
  "READ_ONLY NO_APPROVAL NO_SIGNOFF NO_PRODUCTION_GO",
  "TCHC_LEGAL_01_THROUGH_14",
  "Legal/SOP gates for TCHC",
  "14 TCHC legal gates",
  "Automation:",
  "AI:",
  "production stays NO-GO",
], componentPath);
requireIncludes(appShell, [
  "TCHC Legal Gates",
  "/tchc/legal-gates",
  "tchc-legal-gates",
  "master_control.read",
], appShellPath);

forbidIncludes(sql, [
  "automation_allowed, ai_allowed, legal_status",
  "true, true, 'SIGNED_OFF'",
  "true, true, 'READY_FOR_UAT'",
  "control_status\n  )\nvalues\n  (\n    'DAT'",
  "decision_status\n)\nvalues\n  (\n    'APPROVED'",
], "premature legal readiness approval");
forbidIncludes(route + component, [
  "updateLegal",
  "updateSop",
  "createDecision",
  "updateDecision",
  "APPROVED",
  "SIGNED_OFF",
], "read-only TCHC legal gates screen");

console.log("HEU TCHC legal compliance foundation check passed.");
