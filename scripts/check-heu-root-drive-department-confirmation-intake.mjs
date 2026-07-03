import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const statuses = [];

function addStatus(code, status, detail) {
  statuses.push({ code, status, detail });
}

function fileExists(relativePath) {
  return existsSync(path.join(repoRoot, relativePath));
}

function read(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), "utf8");
}

function hasAll(contents, tokens) {
  return tokens.every((token) => contents.includes(token));
}

const docPath =
  "docs/HEU_ROOT_DRIVE_DEPARTMENT_CONFIRMATION_INTAKE_20260703.md";
const packagePath = "package.json";

if (!fileExists(docPath) || !fileExists(packagePath)) {
  addStatus(
    "ROOT-DRIVE-INTAKE-FILES",
    "NO_GO",
    "Root Drive intake document or package script file is missing.",
  );
} else {
  const doc = read(docPath);
  const packageJson = JSON.parse(read(packagePath));
  const packageReady =
    packageJson.scripts?.["check:heu-root-drive-department-confirmation-intake"] ===
    "node scripts/check-heu-root-drive-department-confirmation-intake.mjs";

  addStatus(
    "ROOT-DRIVE-INTAKE-FILES",
    packageReady ? "READY" : "NO_GO",
    packageReady
      ? "Root Drive intake document and npm checker command are present."
      : "Root Drive intake npm checker command is missing or mismatched.",
  );

  addStatus(
    "ROOT-DRIVE-FOLDER-SNAPSHOT",
    hasAll(doc, [
      "HEU_ROOT_DRIVE_SYSTEM_AUDIT_INITIAL = CAN_SUA",
      "00_HE_THONG",
      "01_PHAP_LY_PHAP_CHE",
      "02_TO_CHUC_NHAN_SU",
      "03_DATA_MASTER",
      "04_WORKFLOW_SOP",
      "09_DASHBOARD_BAO_CAO",
      "10_AI_AGENT_AUTOMATION",
      "11_AUDIT_KIEM_SOAT",
      "99_BACKUP_ARCHIVE",
      "05_DAO_TAO",
      "06_CTHSSV",
      "07_KHOA",
      "08_DAO_TAO_NGAN_HAN_DAY_NGHE",
      "00_HEU_SYSTEM_GOVERNANCE_CONTROL",
      "OBSERVED_EXTRA_FOLDER",
    ])
      ? "READY"
      : "NO_GO",
    "Root Drive first-level folder snapshot records standard, module and extra-folder classification.",
  );

  addStatus(
    "ROOT-DRIVE-LISTING-BOUNDARY",
    hasAll(doc, [
      "Read-only listing boundary",
      "The listing confirms folder names only",
      "Access and sharing status were not verified by this listing",
      "Access closure still requires owner confirmation",
      "permission log",
      "signed",
      "This intake does not approve access closure",
    ])
      ? "READY"
      : "NO_GO",
    "Read-only Drive listing cannot be mistaken for sharing, access-closure or security approval.",
  );

  addStatus(
    "ROOT-DRIVE-DEPARTMENT-QUESTIONS",
    hasAll(doc, [
      "General Department Response Template",
      "A | HDQT/BGH",
      "B | Phap che",
      "C | TCHC/Van thu/Luu tru",
      "D | IT/Data",
      "E | Audit/Kiem soat",
      "F | Tuyen sinh",
      "G | Dao tao",
      "H | Khoa/Bo mon",
      "I | CTHSSV",
      "J | Tai chinh/Ke toan",
      "K | TTGDTX/9+",
      "L | HOU",
      "M | Dao tao ngan han/Day nghe",
      "N | CSVC/Thiet bi/Dia diem",
      "O | Dashboard/Bao cao",
    ])
      ? "READY"
      : "NO_GO",
    "Department confirmation lanes A-O are recorded with owner, minimum confirmation, storage destination and default status.",
  );

  addStatus(
    "ROOT-DRIVE-SAFE-DATA-BOUNDARY",
    hasAll(doc, [
      "must not send raw personal data",
      "CCCD",
      "phone lists",
      "salary",
      "bank statements",
      "passwords",
      "OTP",
      "reset links",
      "API keys",
      "tokens",
      "service-role keys",
      "This intake is a control and question pack only",
      "does not move Drive files",
      "does not mark production GO",
    ])
      ? "READY"
      : "NO_GO",
    "Safe-data boundary blocks raw personal, finance and secret material from Codex/chat.",
  );

  addStatus(
    "ROOT-DRIVE-STOP-CONDITIONS",
    hasAll(doc, [
      "A first-level folder has no owner or registry mapping",
      "FILE_REGISTRY",
      "VERSION_LOG",
      "AUDIT_LOG",
      "dashboard reads raw files/Form Responses",
      "automation lacks SOP, Data Dictionary, test log, backup, rollback",
      "owner signoff is missing",
    ])
      ? "READY"
      : "NO_GO",
    "Stop conditions preserve registry, Report View, automation, privacy and owner-signoff gates.",
  );
}

console.log("HEU Root Drive department confirmation intake check");
console.log(
  "Only metadata/control tokens are checked. No Drive contents, raw personal data, finance details or secrets are printed.",
);

for (const item of statuses) {
  console.log(`${item.status} ${item.code}: ${item.detail}`);
}

if (statuses.some((item) => item.status !== "READY")) {
  process.exitCode = 1;
}
