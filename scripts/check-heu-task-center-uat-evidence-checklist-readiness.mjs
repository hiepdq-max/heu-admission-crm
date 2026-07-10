import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const failures = [];

const componentPath = "components/data-confirmation/department-task-inbox.tsx";
const panelSourcePath = "lib/task-center-gate-evidence-panel-source.ts";
const docPath =
  "docs/HEU_CONTROL/HEU_DATA_013_TASK_CENTER_UAT_EVIDENCE_CHECKLIST_20260710.md";
const uatCopyDocPath =
  "docs/HEU_CONTROL/HEU_DATA_012_TASK_CENTER_REAL_USER_UAT_COPY_20260710.md";
const manifestPath =
  "docs/HEU_CONTROL/HEU_APP_SHELL_001_STAGE_FILE_MANIFEST_20260709.md";
const uatCopyCheckerPath =
  "scripts/check-heu-task-center-real-user-uat-copy-readiness.mjs";
const checkerPath =
  "scripts/check-heu-task-center-uat-evidence-checklist-readiness.mjs";
const packagePath = "package.json";
const checkerAlias = "check:heu-task-center-uat-evidence-checklist-readiness";
const checkerCommand = `node ${checkerPath}`;

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
  uatCopyDocPath,
  manifestPath,
  uatCopyCheckerPath,
  checkerPath,
  packagePath,
]) {
  requireFile(file);
}

if (failures.length === 0) {
  const component = read(componentPath);
  const panelSource = read(panelSourcePath);
  const doc = read(docPath);
  const uatCopyDoc = read(uatCopyDocPath);
  const manifest = read(manifestPath);
  const uatCopyChecker = read(uatCopyCheckerPath);
  const checkerScript = read(checkerPath);
  const packageJson = JSON.parse(read(packagePath));

  requireTokens(
    panelSource,
    [
      "TASK_CENTER_UAT_EVIDENCE_CHECKLIST_ONLY",
      "TASK_CENTER_UAT_EVIDENCE_CHECKLIST_READONLY",
      "TASK_CENTER_UAT_EVIDENCE_CHECKLIST_NO_UPLOAD",
      "TASK_CENTER_UAT_EVIDENCE_CHECKLIST_NO_STORAGE_WRITE",
      "TASK_CENTER_UAT_EVIDENCE_CHECKLIST_NO_RAW_PII",
      "TaskCenterUatEvidenceChecklistItem",
      "uatEvidenceChecklistItems",
      "UAT_EVIDENCE_SCOPE_VISIBLE",
      "UAT_EVIDENCE_GATE_NO_GO_VISIBLE",
      "UAT_EVIDENCE_ALLOWED_BLOCKED_COPY",
      "UAT_EVIDENCE_RESTRICTED_DATA_BOUNDARY",
      "UAT_EVIDENCE_PRODUCTION_NO_GO",
      "reviewer: \"IT_DATA\"",
      "reviewer: \"AUDIT\"",
      "reviewer: \"PHAP_CHE\"",
      "reviewer: \"DEPARTMENT_OWNER\"",
      "reviewer: \"BGH\"",
      "Anh chup che PII",
    ],
    "UAT evidence checklist source token",
    panelSourcePath,
  );

  requireTokens(
    component,
    [
      "TASK_CENTER_UAT_EVIDENCE_CHECKLIST_ONLY",
      "TASK_CENTER_UAT_EVIDENCE_CHECKLIST_READONLY",
      "TASK_CENTER_UAT_EVIDENCE_CHECKLIST_NO_UPLOAD",
      "TASK_CENTER_UAT_EVIDENCE_CHECKLIST_NO_STORAGE_WRITE",
      "TASK_CENTER_UAT_EVIDENCE_CHECKLIST_NO_RAW_PII",
      "data-heu-task-center-uat-evidence-checklist",
      "data-heu-task-center-uat-evidence-checklist-readonly",
      "data-heu-task-center-uat-evidence-checklist-no-upload",
      "data-heu-task-center-uat-evidence-checklist-no-storage-write",
      "data-heu-task-center-uat-evidence-checklist-no-raw-pii",
      "data-heu-task-center-uat-evidence-item",
      "data-heu-task-center-uat-evidence-reviewer",
      "Checklist bang chung UAT can chup ben ngoai he thong",
      "gateEvidence.uatEvidenceChecklist.items.map",
    ],
    "component UAT evidence checklist token",
    componentPath,
  );

  requireTokens(
    doc,
    [
      "HEU-DATA-013-TASK-CENTER-UAT-EVIDENCE-CHECKLIST",
      "Status: PASS_LOCAL_UAT_EVIDENCE_CHECKLIST",
      "Production status: NO-GO",
      "TASK_CENTER_UAT_EVIDENCE_CHECKLIST_ONLY",
      "TASK_CENTER_UAT_EVIDENCE_CHECKLIST_READONLY",
      "TASK_CENTER_UAT_EVIDENCE_CHECKLIST_NO_UPLOAD",
      "TASK_CENTER_UAT_EVIDENCE_CHECKLIST_NO_STORAGE_WRITE",
      "TASK_CENTER_UAT_EVIDENCE_CHECKLIST_NO_RAW_PII",
      "TASK_CENTER_GATE_EVIDENCE_PANEL_DATABASE_NO_GO",
      "NO_DATABASE_CLIENT_CREATED",
      "NO_DATABASE_READ_EXECUTED",
      "NO_SQL_MIGRATION_CREATED",
      "NO_TASK_MUTATION_ROUTE_CREATED",
      "NO_AI_CALL_NO_AUTOMATION_STEP",
      "UAT_EVIDENCE_SCOPE_VISIBLE",
      "UAT_EVIDENCE_GATE_NO_GO_VISIBLE",
      "UAT_EVIDENCE_ALLOWED_BLOCKED_COPY",
      "UAT_EVIDENCE_RESTRICTED_DATA_BOUNDARY",
      "UAT_EVIDENCE_PRODUCTION_NO_GO",
      "TASK_CENTER_DATABASE_READY: NO_GO",
      "CAN_SUA_IT_DATA_AUDIT_PHAP_CHE_OWNER_BGH",
      "real-user pilot review packet",
    ],
    "UAT evidence checklist doc token",
    docPath,
  );

  requireTokens(
    uatCopyDoc,
    [
      "HEU-DATA-013-TASK-CENTER-UAT-EVIDENCE-CHECKLIST",
      "real-user UAT checklist evidence capture",
      "still no DB read and no migration",
      "check:heu-task-center-uat-evidence-checklist-readiness",
    ],
    "UAT copy doc next-slice token",
    uatCopyDocPath,
  );

  requireTokens(
    manifest,
    [
      componentPath,
      panelSourcePath,
      docPath,
      checkerPath,
      "check:heu-task-center-uat-evidence-checklist-readiness",
      "node --check scripts/check-heu-task-center-uat-evidence-checklist-readiness.mjs",
      "npm.cmd run check:heu-task-center-uat-evidence-checklist-readiness",
    ],
    "manifest UAT evidence checklist token",
    manifestPath,
  );

  requireTokens(
    uatCopyChecker,
    [
      "HEU-DATA-013-TASK-CENTER-UAT-EVIDENCE-CHECKLIST",
      "check:heu-task-center-uat-evidence-checklist-readiness",
      docPath,
      checkerPath,
    ],
    "UAT copy checker next-slice token",
    uatCopyCheckerPath,
  );

  if (packageJson.scripts?.[checkerAlias] !== checkerCommand) {
    fail(`${packagePath}: missing or mismatched ${checkerAlias}`);
  }

  requireTokens(
    checkerScript,
    [
      "existsSync",
      "readFileSync",
      "HEU_TASK_CENTER_UAT_EVIDENCE_CHECKLIST_READY: PASS_LOCAL",
      "TASK_CENTER_DATABASE_READY: NO_GO_UAT_EVIDENCE_CHECKLIST_ONLY",
      "NO_RUNTIME_MUTATION: task center UAT evidence checklist checker only; no database client, database read, table creation, SQL migration, task write, file upload, storage write, AI call, paid automation, deploy, finance action or production GO",
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
      { label: "file input", pattern: /type=["']file["']/ },
      { label: "upload wording as action", pattern: /\bupload\s*\(/i },
      { label: "storage write", pattern: /\bstorage\s*\.\s*from\b/i },
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
    "runtime DB, SQL, upload, storage, secret, approval or mutation API",
    "task-center UAT evidence checklist scope",
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
  console.error("HEU Task Center UAT evidence checklist readiness check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("HEU Task Center UAT evidence checklist readiness check");
console.log("HEU_TASK_CENTER_UAT_EVIDENCE_CHECKLIST_READY: PASS_LOCAL");
console.log("TASK_CENTER_DATABASE_READY: NO_GO_UAT_EVIDENCE_CHECKLIST_ONLY");
console.log(
  "NO_RUNTIME_MUTATION: task center UAT evidence checklist checker only; no database client, database read, table creation, SQL migration, task write, file upload, storage write, AI call, paid automation, deploy, finance action or production GO",
);
