import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const failures = [];

const componentPath = "components/data-confirmation/department-task-inbox.tsx";
const panelSourcePath = "lib/task-center-gate-evidence-panel-source.ts";
const docPath =
  "docs/HEU_CONTROL/HEU_DATA_012_TASK_CENTER_REAL_USER_UAT_COPY_20260710.md";
const gatePanelDocPath =
  "docs/HEU_CONTROL/HEU_DATA_011_TASK_CENTER_GATE_EVIDENCE_PANEL_20260710.md";
const evidenceChecklistDocPath =
  "docs/HEU_CONTROL/HEU_DATA_013_TASK_CENTER_UAT_EVIDENCE_CHECKLIST_20260710.md";
const manifestPath =
  "docs/HEU_CONTROL/HEU_APP_SHELL_001_STAGE_FILE_MANIFEST_20260709.md";
const gatePanelCheckerPath =
  "scripts/check-heu-task-center-gate-evidence-panel-readiness.mjs";
const evidenceChecklistCheckerPath =
  "scripts/check-heu-task-center-uat-evidence-checklist-readiness.mjs";
const checkerPath =
  "scripts/check-heu-task-center-real-user-uat-copy-readiness.mjs";
const packagePath = "package.json";
const checkerAlias = "check:heu-task-center-real-user-uat-copy-readiness";
const checkerCommand = `node ${checkerPath}`;
const evidenceChecklistCheckerAlias =
  "check:heu-task-center-uat-evidence-checklist-readiness";
const evidenceChecklistCheckerCommand = `node ${evidenceChecklistCheckerPath}`;

function absolute(relativePath) {
  return path.join(repoRoot, relativePath);
}

function fail(message) {
  failures.push(message);
}

function requireFile(relativePath) {
  if (!existsSync(absolute(relativePath))) {
    fail(`Missing required file: ${relativePath}`);
  }
}

function read(relativePath) {
  return readFileSync(absolute(relativePath), "utf8");
}

function requireTokens(contents, tokens, label, file) {
  for (const token of tokens) {
    if (!contents.includes(token)) {
      fail(`${file}: missing ${label}: ${token}`);
    }
  }
}

function forbidPatterns(contents, patterns, label, file) {
  for (const item of patterns) {
    if (item.pattern.test(contents)) {
      fail(`${file}: forbidden ${label}: ${item.label}`);
    }
  }
}

for (const file of [
  componentPath,
  panelSourcePath,
  docPath,
  gatePanelDocPath,
  evidenceChecklistDocPath,
  manifestPath,
  gatePanelCheckerPath,
  evidenceChecklistCheckerPath,
  checkerPath,
  packagePath,
]) {
  requireFile(file);
}

if (failures.length === 0) {
  const component = read(componentPath);
  const panelSource = read(panelSourcePath);
  const doc = read(docPath);
  const gatePanelDoc = read(gatePanelDocPath);
  const evidenceChecklistDoc = read(evidenceChecklistDocPath);
  const manifest = read(manifestPath);
  const gatePanelChecker = read(gatePanelCheckerPath);
  const evidenceChecklistChecker = read(evidenceChecklistCheckerPath);
  const checkerScript = read(checkerPath);
  const packageJson = JSON.parse(read(packagePath));

  requireTokens(
    panelSource,
    [
      "TASK_CENTER_REAL_USER_UAT_COPY_ONLY",
      "TASK_CENTER_REAL_USER_UAT_COPY_READONLY",
      "TASK_CENTER_REAL_USER_UAT_COPY_NO_APPROVAL",
      "TASK_CENTER_REAL_USER_UAT_COPY_NO_DATA_ENTRY",
      "TaskCenterRealUserUatCopyItem",
      "allowedUatCopy",
      "blockedUatCopy",
      "reportToUatCopy",
      "UAT_CAN_VIEW_SCOPE",
      "UAT_CAN_CHECK_LABEL",
      "UAT_CAN_REPORT_GAP",
      "UAT_BLOCK_APPROVAL",
      "UAT_BLOCK_REAL_DATA_ENTRY",
      "UAT_BLOCK_DB_ENABLEMENT",
      "UAT_REPORT_IT_DATA",
      "UAT_REPORT_AUDIT",
      "UAT_REPORT_OWNER",
      "mock/fallback",
      "database dang NO_GO",
      "TASK_CENTER_UAT_EVIDENCE_CHECKLIST_ONLY",
      "TASK_CENTER_UAT_EVIDENCE_CHECKLIST_NO_UPLOAD",
      "TASK_CENTER_UAT_EVIDENCE_CHECKLIST_NO_STORAGE_WRITE",
      "TASK_CENTER_UAT_EVIDENCE_CHECKLIST_NO_RAW_PII",
      "UAT_EVIDENCE_SCOPE_VISIBLE",
    ],
    "real-user UAT source token",
    panelSourcePath,
  );

  requireTokens(
    component,
    [
      "TASK_CENTER_REAL_USER_UAT_COPY_ONLY",
      "TASK_CENTER_REAL_USER_UAT_COPY_READONLY",
      "TASK_CENTER_REAL_USER_UAT_COPY_NO_APPROVAL",
      "TASK_CENTER_REAL_USER_UAT_COPY_NO_DATA_ENTRY",
      "data-heu-task-center-real-user-uat-copy",
      "data-heu-task-center-real-user-uat-copy-readonly",
      "data-heu-task-center-real-user-uat-copy-no-approval",
      "data-heu-task-center-real-user-uat-copy-no-data-entry",
      "data-heu-task-center-real-user-uat-allowed",
      "data-heu-task-center-real-user-uat-blocked",
      "data-heu-task-center-real-user-uat-report-to",
      "User UAT duoc lam",
      "User UAT khong duoc lam",
      "User UAT bao cho ai",
      "gateEvidence.uatCopy.allowed.map",
      "gateEvidence.uatCopy.blocked.map",
      "gateEvidence.uatCopy.reportTo.map",
    ],
    "component real-user UAT copy token",
    componentPath,
  );

  requireTokens(
    doc,
    [
      "HEU-DATA-012-TASK-CENTER-REAL-USER-UAT-COPY",
      "Status: PASS_LOCAL_REAL_USER_UAT_COPY",
      "Production status: NO-GO",
      "TASK_CENTER_REAL_USER_UAT_COPY_ONLY",
      "TASK_CENTER_REAL_USER_UAT_COPY_READONLY",
      "TASK_CENTER_REAL_USER_UAT_COPY_NO_APPROVAL",
      "TASK_CENTER_REAL_USER_UAT_COPY_NO_DATA_ENTRY",
      "TASK_CENTER_GATE_EVIDENCE_PANEL_DATABASE_NO_GO",
      "NO_DATABASE_CLIENT_CREATED",
      "NO_DATABASE_READ_EXECUTED",
      "NO_SQL_MIGRATION_CREATED",
      "NO_TASK_MUTATION_ROUTE_CREATED",
      "NO_AI_CALL_NO_AUTOMATION_STEP",
      "UAT_CAN_VIEW_SCOPE",
      "UAT_CAN_CHECK_LABEL",
      "UAT_CAN_REPORT_GAP",
      "UAT_BLOCK_APPROVAL",
      "UAT_BLOCK_REAL_DATA_ENTRY",
      "UAT_BLOCK_DB_ENABLEMENT",
      "UAT_REPORT_IT_DATA",
      "UAT_REPORT_AUDIT",
      "UAT_REPORT_OWNER",
      "TASK_CENTER_DATABASE_READY: NO_GO",
      "CAN_SUA_IT_DATA_AUDIT_PHAP_CHE_OWNER_BGH",
      "real-user UAT checklist evidence capture",
      "HEU-DATA-013-TASK-CENTER-UAT-EVIDENCE-CHECKLIST",
      "check:heu-task-center-uat-evidence-checklist-readiness",
    ],
    "real-user UAT doc token",
    docPath,
  );

  requireTokens(
    evidenceChecklistDoc,
    [
      "HEU-DATA-013-TASK-CENTER-UAT-EVIDENCE-CHECKLIST",
      "PASS_LOCAL_UAT_EVIDENCE_CHECKLIST",
      "TASK_CENTER_UAT_EVIDENCE_CHECKLIST_NO_UPLOAD",
      "TASK_CENTER_UAT_EVIDENCE_CHECKLIST_NO_STORAGE_WRITE",
      "TASK_CENTER_UAT_EVIDENCE_CHECKLIST_NO_RAW_PII",
      "TASK_CENTER_DATABASE_READY: NO_GO",
    ],
    "UAT evidence checklist doc token",
    evidenceChecklistDocPath,
  );

  requireTokens(
    gatePanelDoc,
    [
      "HEU-DATA-012-TASK-CENTER-REAL-USER-UAT-COPY",
      "real-user UAT copy for the Task Center panel",
      "still using mock/fallback data and no DB read",
      "check:heu-task-center-real-user-uat-copy-readiness",
    ],
    "gate panel doc next-slice token",
    gatePanelDocPath,
  );

  requireTokens(
    manifest,
    [
      componentPath,
      panelSourcePath,
      docPath,
      checkerPath,
      evidenceChecklistDocPath,
      evidenceChecklistCheckerPath,
      "check:heu-task-center-real-user-uat-copy-readiness",
      "check:heu-task-center-uat-evidence-checklist-readiness",
      "node --check scripts/check-heu-task-center-real-user-uat-copy-readiness.mjs",
      "node --check scripts/check-heu-task-center-uat-evidence-checklist-readiness.mjs",
      "npm.cmd run check:heu-task-center-real-user-uat-copy-readiness",
      "npm.cmd run check:heu-task-center-uat-evidence-checklist-readiness",
    ],
    "manifest real-user UAT token",
    manifestPath,
  );

  requireTokens(
    gatePanelChecker,
    [
      "HEU-DATA-012-TASK-CENTER-REAL-USER-UAT-COPY",
      "check:heu-task-center-real-user-uat-copy-readiness",
      docPath,
      checkerPath,
    ],
    "gate panel checker real-user UAT token",
    gatePanelCheckerPath,
  );

  requireTokens(
    evidenceChecklistChecker,
    [
      "HEU_TASK_CENTER_UAT_EVIDENCE_CHECKLIST_READY: PASS_LOCAL",
      "TASK_CENTER_DATABASE_READY: NO_GO_UAT_EVIDENCE_CHECKLIST_ONLY",
      "NO_RUNTIME_MUTATION: task center UAT evidence checklist checker only",
    ],
    "UAT evidence checklist checker token",
    evidenceChecklistCheckerPath,
  );

  if (packageJson.scripts?.[checkerAlias] !== checkerCommand) {
    fail(`${packagePath}: missing or mismatched ${checkerAlias}`);
  }

  if (
    packageJson.scripts?.[evidenceChecklistCheckerAlias] !==
    evidenceChecklistCheckerCommand
  ) {
    fail(`${packagePath}: missing or mismatched ${evidenceChecklistCheckerAlias}`);
  }

  requireTokens(
    checkerScript,
    [
      "existsSync",
      "readFileSync",
      "HEU_TASK_CENTER_REAL_USER_UAT_COPY_READY: PASS_LOCAL",
      "TASK_CENTER_DATABASE_READY: NO_GO_REAL_USER_UAT_COPY_ONLY",
      "NO_RUNTIME_MUTATION: task center real-user UAT copy checker only; no database client, database read, table creation, SQL migration, task write, AI call, paid automation, deploy, finance action or production GO",
    ],
    "checker-script read-only token",
    checkerPath,
  );

  forbidPatterns(
    `${panelSource}\n${component}\n${doc}`,
    [
      { label: "Supabase client import", pattern: /@\/lib\/supabase/ },
      { label: "createClient", pattern: /\bcreateClient\s*\(/ },
      { label: "supabase.from", pattern: /supabase\s*\.\s*from\s*\(/ },
      { label: "database select call", pattern: /\.select\s*\(/ },
      { label: "insert", pattern: /\.insert\s*\(/ },
      { label: "update", pattern: /\.update\s*\(/ },
      { label: "upsert", pattern: /\.upsert\s*\(/ },
      { label: "delete", pattern: /\.delete\s*\(/ },
      { label: "fetch call", pattern: /\bfetch\s*\(/ },
      { label: "server action marker", pattern: /["']use server["']/ },
      { label: "SQL create table statement", pattern: /\bcreate\s+table\b/i },
      { label: "SQL alter table statement", pattern: /\balter\s+table\b/i },
      { label: "SQL migration folder", pattern: /\bmigrations?\//i },
      { label: "approved owner lane", pattern: /:\s*["']DAT_CHINH_THUC["']/ },
      { label: "enabled true gate", pattern: /\benabled\s*:\s*true\b/ },
      {
        label: "actual Supabase URL assignment",
        pattern: /NEXT_PUBLIC_SUPABASE_URL\s*=\s*\S+/,
      },
      {
        label: "actual service-role key assignment",
        pattern: /SUPABASE_SERVICE_ROLE_KEY\s*=\s*\S+/,
      },
      {
        label: "JWT-like token",
        pattern: /eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{10,}/,
      },
    ],
    "runtime DB, SQL, secret, approval or mutation API",
    "task-center real-user UAT copy scope",
  );

  forbidPatterns(
    checkerScript,
    [
      { label: "node child_process import", pattern: /from\s+["']node:child_process["']/ },
      { label: "child_process import", pattern: /from\s+["']child_process["']/ },
      { label: "execSync call", pattern: /\bexecSync\s*\(/ },
      { label: "spawn call", pattern: /\bspawn\s*\(/ },
      { label: "writeFileSync call", pattern: /\bwriteFileSync\s*\(/ },
      { label: "appendFileSync call", pattern: /\bappendFileSync\s*\(/ },
      { label: "unlinkSync call", pattern: /\bunlinkSync\s*\(/ },
      { label: "rmSync call", pattern: /\brmSync\s*\(/ },
      { label: "renameSync call", pattern: /\brenameSync\s*\(/ },
      { label: "mkdirSync call", pattern: /\bmkdirSync\s*\(/ },
    ],
    "mutation or command-execution API",
    checkerPath,
  );
}

if (failures.length > 0) {
  console.error("HEU Task Center real-user UAT copy readiness check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("HEU Task Center real-user UAT copy readiness check");
console.log("HEU_TASK_CENTER_REAL_USER_UAT_COPY_READY: PASS_LOCAL");
console.log("TASK_CENTER_DATABASE_READY: NO_GO_REAL_USER_UAT_COPY_ONLY");
console.log(
  "NO_RUNTIME_MUTATION: task center real-user UAT copy checker only; no database client, database read, table creation, SQL migration, task write, AI call, paid automation, deploy, finance action or production GO",
);
