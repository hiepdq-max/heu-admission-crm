import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function fail(message) {
  console.error(`HEU TCHC foundation check failed: ${message}`);
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

const step114Path = "database/step114_organization_position_permission_matrix.sql";
const step116Path = "database/step116_tchc_position_report_foundation.sql";
const docPath = "docs/HEU_TCHC_POSITION_REPORT_FOUNDATION_20260703.md";
const uiPath = "components/settings/position-assignment-matrix.tsx";

const step114 = read(step114Path);
const step116 = read(step116Path);
const doc = read(docPath);
const ui = read(uiPath);

const requiredPositions = [
  "TCHC_HEAD",
  "TCHC_DEPUTY",
  "TCHC_VAN_THU_LUU_TRU",
  "TCHC_HANH_CHINH_NHAN_SU",
  "TCHC_HO_SO_NHAN_SU",
  "TCHC_CSVC_TAI_SAN",
  "TCHC_BAO_TRI_SUA_CHUA",
  "TCHC_MUA_SAM_CAP_PHAT",
  "TCHC_LE_TAN_HAU_CAN",
  "TCHC_BAO_VE_AN_NINH",
  "TCHC_PHUONG_TIEN",
  "TCHC_VE_SINH_MOI_TRUONG",
  "TCHC_Y_TE_HOC_DUONG",
  "TCHC_TONG_HOP_BAO_CAO",
];

const requiredReports = [
  "RPT_TCHC_TONG_HOP_THANG",
  "RPT_TCHC_CONG_VAN_DEN_DI",
  "RPT_TCHC_HO_SO_LUU_TRU",
  "RPT_TCHC_NHAN_SU_BIEN_DONG",
  "RPT_TCHC_HO_SO_NHAN_SU",
  "RPT_TCHC_CHAM_CONG_NGHI_PHEP",
  "RPT_TCHC_TAI_SAN_THIET_BI",
  "RPT_TCHC_BAO_TRI_SUA_CHUA",
  "RPT_TCHC_MUA_SAM_CAP_PHAT",
  "RPT_TCHC_HAU_CAN_SU_KIEN",
  "RPT_TCHC_AN_NINH_TRAT_TU",
  "RPT_TCHC_PHUONG_TIEN",
  "RPT_TCHC_VE_SINH_MOI_TRUONG",
  "RPT_TCHC_Y_TE_HOC_DUONG",
];

requireIncludes(step114, requiredPositions, step114Path);
requireIncludes(step116, requiredPositions, step116Path);
requireIncludes(step116, requiredReports, step116Path);
requireIncludes(step116, [
  "create table if not exists public.heu_position_report_requirements",
  "create or replace view public.heu_position_report_requirement_status",
  "DRAFT_CONTROL",
  "NO_OWNER_ASSIGNED",
  "READY_FOR_UAT",
  "SIGNED_OFF",
  "public.can_read_permission_matrix()",
  "public.can_manage_permission_matrix()",
], "TCHC report foundation SQL controls");
requireIncludes(doc, [
  "Status: DRAFT_CONTROL",
  "Production status: NO-GO",
  "Khong dua raw CCCD",
  "Khong coi PASS_LOCAL la signed UAT",
  "heu_position_report_requirements",
  "heu_position_report_requirement_status",
], docPath);
requireIncludes(ui, [
  "TCHC",
  "TO_CHUC_NHAN_SU",
  "displayDepartmentName",
], uiPath);

forbidIncludes(step116, [
  "owner_assigned_email",
  "reviewer_assigned_email",
  "password",
  "otp",
  "cccd",
], "TCHC report status PII/secret boundary");

console.log("HEU TCHC position/report foundation check passed.");
