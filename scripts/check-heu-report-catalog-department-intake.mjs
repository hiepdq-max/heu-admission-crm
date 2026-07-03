import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const docPath = "docs/HEU_REPORT_CATALOG_DEPARTMENT_INTAKE_20260703.md";
const packagePath = "package.json";
const inventoryPath = "docs/HEU_CURRENT_STATE_INVENTORY.md";
const logPath = "docs/HEU_IMPLEMENTATION_LOG.md";
const failures = [];

function read(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), "utf8");
}

function requireFile(relativePath) {
  if (!existsSync(path.join(repoRoot, relativePath))) {
    failures.push(`Missing required file: ${relativePath}`);
  }
}

function requireTokens(contents, tokens, label, file) {
  for (const token of tokens) {
    if (!contents.includes(token)) {
      failures.push(`${file}: missing ${label}: ${token}`);
    }
  }
}

for (const file of [docPath, packagePath, inventoryPath, logPath]) {
  requireFile(file);
}

const doc = existsSync(path.join(repoRoot, docPath)) ? read(docPath) : "";
const inventory = existsSync(path.join(repoRoot, inventoryPath))
  ? read(inventoryPath)
  : "";
const log = existsSync(path.join(repoRoot, logPath)) ? read(logPath) : "";
const packageJson = existsSync(path.join(repoRoot, packagePath))
  ? JSON.parse(read(packagePath))
  : { scripts: {} };

requireTokens(
  doc,
  [
    "HEU Report Catalog Department Intake - 2026-07-03",
    "PASS_LOCAL_INTAKE",
    "REPORT_CATALOG_INTAKE_READY / NO_GO / BLOCKED",
    "Current production decision: NO_GO",
    "XLSX_SOURCE_OUTSIDE_GIT",
    "HEU_SYSTEM_DANH_MUC_BAO_CAO_PHONG_BAN_20260703_V02.xlsx",
    "09_DASHBOARD_BAO_CAO/00_DANH_MUC_BAO_CAO/",
    "IT_DATA + 00_MASTER_CONTROL_HEU",
    "Audit + department data owners",
    "BGH_HIEU_TRUONG",
    "sheets=11",
    "reports=81",
    "departments=13",
    "P0=50",
    "P1=26",
    "P2=5",
    "CAN_SUA=76",
    "CHUA_DU_DIEU_KIEN=5",
    "weekly=44",
    "monthly=24",
    "event=10",
    "daily=3",
    "BGH_DIEU_HANH",
    "TCHC",
    "PHAP_CHE",
    "TUYEN_SINH",
    "DAO_TAO",
    "KHOA_GIANG_VIEN",
    "CTHSSV",
    "KHTC_KE_TOAN",
    "TTGDTX_9PLUS",
    "HOU",
    "NGAN_HAN_DAY_NGHE",
    "IT_DATA",
    "AUDIT_KIEM_SOAT",
    "GATE-01",
    "GATE-02",
    "GATE-03",
    "GATE-04",
    "GATE-05",
    "GATE-06",
    "GATE-07",
    "GATE-08",
    "REPORT_VIEW",
    "Data Master",
    "Data Dictionary",
    "Quality",
    "Security",
    "Signoff",
    "Refresh Log",
    "does not import raw workbook data into Git",
    "does not copy the source XLSX into the app repository",
    "does not create dashboard reliance",
    "does not read raw/source tables for dashboard",
    "does not accept evidence",
    "does not execute UAT",
    "does not approve legal/SOP position",
    "does not approve finance reliance",
    "does not approve owner GO/NO-GO",
    "does not mark production GO",
  ],
  "report catalog intake contract",
  docPath,
);

if (
  packageJson.scripts?.["check:heu-report-catalog-department-intake"] !==
  "node scripts/check-heu-report-catalog-department-intake.mjs"
) {
  failures.push(`${packagePath}: missing check:heu-report-catalog-department-intake script`);
}

requireTokens(
  inventory,
  [
    "npm.cmd run check:heu-report-catalog-department-intake",
    "REPORT_CATALOG_INTAKE_READY / NO_GO / BLOCKED",
    "reports=81",
    "departments=13",
    "XLSX_SOURCE_OUTSIDE_GIT",
    "does not mark production GO",
  ],
  "current-state propagation",
  inventoryPath,
);

requireTokens(
  log,
  [
    "2026-07-03 - Department Report Catalog Intake",
    "HEU_REPORT_CATALOG_DEPARTMENT_INTAKE_20260703.md",
    "check-heu-report-catalog-department-intake.mjs",
    "REPORT_CATALOG_INTAKE_READY / NO_GO / BLOCKED",
    "reports=81",
    "departments=13",
    "does not import raw workbook data into Git",
    "does not mark production GO",
  ],
  "implementation-log propagation",
  logPath,
);

if (failures.length > 0) {
  console.error("HEU report catalog department intake check failed.");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("HEU report catalog department intake check");
console.log("REPORT_CATALOG_INTAKE_READY: PASS_LOCAL_INTAKE");
console.log("reports=81; departments=13; sheets=11; source=XLSX_SOURCE_OUTSIDE_GIT");
console.log("Boundary: no raw workbook import, no dashboard reliance, no evidence/UAT/finance/owner/production approval.");
