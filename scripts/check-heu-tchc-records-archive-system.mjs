import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function fail(message) {
  console.error(`HEU TCHC records archive check failed: ${message}`);
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

const sqlPath = "database/step118_tchc_records_archive_system.sql";
const intakeSqlPath = "database/step119_tchc_records_archive_intake_audit.sql";
const docPath = "docs/HEU_TCHC_RECORDS_ARCHIVE_SYSTEM_20260703.md";
const routePath = "app/tchc/records-archive/page.tsx";
const intakeRoutePath = "app/tchc/records-archive/intake/page.tsx";
const intakeActionsPath = "app/tchc/records-archive/intake/actions.ts";
const componentPath = "components/tchc/tchc-records-archive-readonly.tsx";
const intakeComponentPath = "components/tchc/tchc-records-archive-intake-template.tsx";
const appShellPath = "components/layout/app-shell.tsx";
const packagePath = "package.json";

const sql = read(sqlPath);
const intakeSql = read(intakeSqlPath);
const doc = read(docPath);
const route = read(routePath);
const intakeRoute = read(intakeRoutePath);
const intakeActions = read(intakeActionsPath);
const component = read(componentPath);
const intakeComponent = read(intakeComponentPath);
const appShell = read(appShellPath);
const packageJson = read(packagePath);

requireIncludes(sql, [
  "create table if not exists public.heu_tchc_document_register",
  "create table if not exists public.heu_tchc_archive_register",
  "create table if not exists public.heu_tchc_archive_handover_register",
  "create or replace view public.heu_tchc_records_archive_dashboard",
  "TCHC_VAN_THU_LUU_TRU",
  "TCHC-LEGAL-01",
  "TCHC-LEGAL-02",
  "DRAFT_CONTROL",
  "READY_FOR_UAT",
  "SIGNED_OFF",
  "BLOCKED",
  "public.can_read_permission_matrix()",
  "public.can_manage_master_control()",
], "records/archive SQL controls");

requireIncludes(intakeSql, [
  "create or replace function public.can_intake_tchc_records_archive()",
  "trg_heu_tchc_document_register_audit",
  "trg_heu_tchc_archive_register_audit",
  "trg_heu_tchc_archive_handover_register_audit",
  "public.write_audit_log()",
  "heu_tchc_document_register_controlled_insert",
  "heu_tchc_archive_register_controlled_insert",
  "heu_tchc_archive_handover_register_controlled_insert",
  "TCHC_VAN_THU_LUU_TRU",
  "DRAFT_CONTROL",
], "records/archive intake SQL audit controls");

requireIncludes(doc, [
  "Status: DRAFT_CONTROL",
  "Production status: NO-GO",
  "heu_tchc_document_register",
  "heu_tchc_archive_register",
  "heu_tchc_archive_handover_register",
  "heu_tchc_records_archive_dashboard",
  "Khong luu raw Drive link",
  "Khong dung PASS_LOCAL thay cho PHAP_CHE approval",
  "/tchc/records-archive",
  "/tchc/records-archive/intake",
  "database/step119_tchc_records_archive_intake_audit.sql",
  "DOCUMENT_METADATA",
  "ARCHIVE_METADATA",
  "HANDOVER_METADATA",
  "Draft insert only",
], "records/archive doc");

requireIncludes(route, [
  "heu_tchc_records_archive_dashboard",
  "TchcRecordsArchiveReadonly",
  "active=\"tchc-records-archive\"",
  "Production remains NO-GO",
  "/tchc/records-archive/intake",
  "Mau nhap",
], routePath);

requireIncludes(intakeRoute, [
  "TchcRecordsArchiveIntakeTemplate",
  "active=\"tchc-records-archive\"",
  "messageFromParams",
  "Da luu metadata nhap",
], intakeRoutePath);

requireIncludes(intakeActions, [
  "\"use server\"",
  "can_intake_tchc_records_archive",
  "createTchcDocumentMetadataAction",
  "createTchcArchiveMetadataAction",
  "createTchcHandoverMetadataAction",
  "unsafeTextPattern",
  "controlledErrorCodes",
  "TCHC_RECORDS_ARCHIVE_INTAKE_UNAVAILABLE",
  "DRAFT_CONTROL",
  "TCHC-LEGAL-01",
  "TCHC-LEGAL-02",
  ".from(table).insert(payload)",
  "revalidatePath(\"/tchc/records-archive\")",
], intakeActionsPath);

requireIncludes(component, [
  "data-heu-tchc-records-archive-readonly=\"TCHC_RECORDS_ARCHIVE_READONLY\"",
  "DRAFT_CONTROL READ_ONLY NO_RAW_FILE NO_DELETE NO_MOVE NO_APPROVAL NO_PRODUCTION_GO",
  "DOCUMENT_REGISTER",
  "ARCHIVE_REGISTER",
  "HANDOVER_REGISTER",
  "Stop rules",
], componentPath);

requireIncludes(intakeComponent, [
  "data-heu-tchc-records-archive-intake-template=\"TCHC_RECORDS_ARCHIVE_INTAKE_TEMPLATE\"",
  "DRAFT_METADATA_WRITE_ONLY DRAFT_CONTROL NO_RAW_FILE NO_DELETE NO_MOVE NO_APPROVAL NO_PRODUCTION_GO AUDIT_LOG_REQUIRED",
  "DOCUMENT_METADATA",
  "ARCHIVE_METADATA",
  "HANDOVER_METADATA",
  "action={template.action}",
  "Submit chi tao ban ghi metadata nhap",
  "Ma kiem soat: {error}",
  "Dieu kien mo ghi du lieu",
], intakeComponentPath);

requireIncludes(appShell, [
  "TCHC Van thu luu tru",
  "/tchc/records-archive",
  "tchc-records-archive",
  "master_control.read",
], appShellPath);

requireIncludes(packageJson, [
  "\"check:heu-tchc-records-archive-system\": \"node scripts/check-heu-tchc-records-archive-system.mjs\"",
], packagePath);

forbidIncludes(sql + intakeSql + doc + route + intakeRoute + intakeActions + component + intakeComponent, [
  "password text",
  "otp text",
  "cccd text",
  "raw_document_link",
  "drive.google.com",
  "APPROVED",
  "production_go_at",
  "is_production_go",
  "formAction",
  ".from(\"heu_tchc_document_register\").insert",
  ".from(\"heu_tchc_archive_register\").insert",
  ".update(",
  ".delete(",
  "delete from public.heu_tchc",
  "drop table public.heu_tchc",
  "redirectWithError(error.message)",
  "Loi: {error}",
], "records/archive sensitive or destructive boundary");

console.log("HEU TCHC records archive system check passed.");
