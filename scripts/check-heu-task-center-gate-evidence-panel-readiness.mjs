import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const failures = [];

const componentPath = "components/data-confirmation/department-task-inbox.tsx";
const panelSourcePath = "lib/task-center-gate-evidence-panel-source.ts";
const gatePath = "lib/task-center-readonly-adapter-enablement-gate.ts";
const docPath =
  "docs/HEU_CONTROL/HEU_DATA_011_TASK_CENTER_GATE_EVIDENCE_PANEL_20260710.md";
const gateDocPath =
  "docs/HEU_CONTROL/HEU_DATA_010_TASK_CENTER_ADAPTER_ENABLEMENT_GATE_20260710.md";
const uatCopyDocPath =
  "docs/HEU_CONTROL/HEU_DATA_012_TASK_CENTER_REAL_USER_UAT_COPY_20260710.md";
const manifestPath =
  "docs/HEU_CONTROL/HEU_APP_SHELL_001_STAGE_FILE_MANIFEST_20260709.md";
const gateCheckerPath =
  "scripts/check-heu-task-center-adapter-enablement-gate-readiness.mjs";
const uatCopyCheckerPath =
  "scripts/check-heu-task-center-real-user-uat-copy-readiness.mjs";
const checkerPath =
  "scripts/check-heu-task-center-gate-evidence-panel-readiness.mjs";
const packagePath = "package.json";
const checkerAlias = "check:heu-task-center-gate-evidence-panel-readiness";
const checkerCommand = `node ${checkerPath}`;
const uatCopyCheckerAlias =
  "check:heu-task-center-real-user-uat-copy-readiness";
const uatCopyCheckerCommand = `node ${uatCopyCheckerPath}`;

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
  gatePath,
  docPath,
  gateDocPath,
  uatCopyDocPath,
  manifestPath,
  gateCheckerPath,
  uatCopyCheckerPath,
  checkerPath,
  packagePath,
]) {
  requireFile(file);
}

if (failures.length === 0) {
  const component = read(componentPath);
  const panelSource = read(panelSourcePath);
  const gate = read(gatePath);
  const doc = read(docPath);
  const gateDoc = read(gateDocPath);
  const uatCopyDoc = read(uatCopyDocPath);
  const manifest = read(manifestPath);
  const gateChecker = read(gateCheckerPath);
  const uatCopyChecker = read(uatCopyCheckerPath);
  const checkerScript = read(checkerPath);
  const packageJson = JSON.parse(read(packagePath));

  requireTokens(
    panelSource,
    [
      "TASK_CENTER_GATE_EVIDENCE_PANEL_ONLY",
      "TASK_CENTER_GATE_EVIDENCE_PANEL_READONLY",
      "TASK_CENTER_GATE_EVIDENCE_PANEL_DATABASE_NO_GO",
      "TASK_CENTER_READONLY_ADAPTER_ENABLEMENT_GATE_ONLY",
      "TASK_CENTER_ADAPTER_ENABLEMENT_OWNER_REVIEW_REQUIRED",
      "TASK_CENTER_ADAPTER_ENABLEMENT_DEFAULT_NO_GO",
      "NO_DATABASE_CLIENT_CREATED",
      "NO_DATABASE_READ_EXECUTED",
      "NO_SQL_MIGRATION_CREATED",
      "NO_TASK_MUTATION_ROUTE_CREATED",
      "NO_AI_CALL_NO_AUTOMATION_STEP",
      "TaskCenterGateEvidenceOwnerRow",
      "TaskCenterGateEvidencePanelSource",
      "createTaskCenterGateEvidencePanelSource",
      "createTaskCenterReadonlyAdapterEnablementGate",
      "IT_DATA_SCOPE_FIRST_FILTER_SIGNOFF",
      "AUDIT_NEGATIVE_ACCESS_EVIDENCE",
      "PHAP_CHE_RESTRICTED_DATA_BOUNDARY_SIGNOFF",
      "DEPARTMENT_OWNER_TASK_LABEL_ACCEPTANCE",
      "BGH_PRODUCTION_NO_GO_ACKNOWLEDGEMENT",
      "decision: gate.ownerReview[row.lane]",
      "TASK_CENTER_REAL_USER_UAT_COPY_ONLY",
      "TASK_CENTER_REAL_USER_UAT_COPY_READONLY",
      "TASK_CENTER_REAL_USER_UAT_COPY_NO_APPROVAL",
      "TASK_CENTER_REAL_USER_UAT_COPY_NO_DATA_ENTRY",
      "UAT_CAN_VIEW_SCOPE",
      "UAT_BLOCK_APPROVAL",
      "UAT_REPORT_IT_DATA",
    ],
    "panel source token",
    panelSourcePath,
  );

  requireTokens(
    component,
    [
      "@/lib/task-center-gate-evidence-panel-source",
      "createTaskCenterGateEvidencePanelSource",
      "gateEvidence.ownerRows.map",
      "gateEvidence.requiredProof.map",
      "data-heu-task-center-gate-evidence-panel",
      "data-heu-task-center-gate-evidence-readonly",
      "data-heu-task-center-gate-evidence-database",
      "data-heu-task-center-gate-evidence-no-database-client",
      "data-heu-task-center-gate-evidence-no-database-read",
      "data-heu-task-center-gate-evidence-no-sql-migration",
      "data-heu-task-center-gate-evidence-no-task-mutation",
      "data-heu-task-center-gate-evidence-cost-guard",
      "data-heu-task-center-gate-owner-lane",
      "data-heu-task-center-gate-owner-decision",
      "data-heu-task-center-gate-required-proof",
      "TASK_CENTER_GATE_EVIDENCE_PANEL_DATABASE_NO_GO",
      "Required proof before DB read",
    ],
    "component evidence panel token",
    componentPath,
  );

  requireTokens(
    gate,
    [
      "TASK_CENTER_READONLY_ADAPTER_ENABLEMENT_GATE_ONLY",
      "OWNER_REVIEW_REQUIRED_BEFORE_DB_READ",
      "ADAPTER_ENABLEMENT_DEFAULT_NO_GO",
      "IT_DATA: \"NO_GO\"",
      "AUDIT: \"NO_GO\"",
      "PHAP_CHE: \"NO_GO\"",
      "DEPARTMENT_OWNER: \"NO_GO\"",
      "BGH: \"NO_GO\"",
      "NO_DATABASE_CLIENT_CREATED",
      "NO_DATABASE_READ_EXECUTED",
      "NO_SQL_MIGRATION_CREATED",
      "NO_TASK_MUTATION_ROUTE_CREATED",
      "NO_AI_CALL_NO_AUTOMATION_STEP",
    ],
    "enablement gate token",
    gatePath,
  );

  requireTokens(
    doc,
    [
      "HEU-DATA-011-TASK-CENTER-GATE-EVIDENCE-PANEL",
      "Status: PASS_LOCAL_GATE_EVIDENCE_PANEL",
      "Production status: NO-GO",
      "TASK_CENTER_GATE_EVIDENCE_PANEL_ONLY",
      "TASK_CENTER_GATE_EVIDENCE_PANEL_READONLY",
      "TASK_CENTER_GATE_EVIDENCE_PANEL_DATABASE_NO_GO",
      "TASK_CENTER_READONLY_ADAPTER_ENABLEMENT_GATE_ONLY",
      "OWNER_REVIEW_REQUIRED_BEFORE_DB_READ",
      "ADAPTER_ENABLEMENT_DEFAULT_NO_GO",
      "NO_DATABASE_CLIENT_CREATED",
      "NO_DATABASE_READ_EXECUTED",
      "NO_SQL_MIGRATION_CREATED",
      "NO_TASK_MUTATION_ROUTE_CREATED",
      "NO_AI_CALL_NO_AUTOMATION_STEP",
      "TASK_CENTER_DATABASE_READY: NO_GO",
      "CAN_SUA_IT_DATA_AUDIT_PHAP_CHE_OWNER_BGH",
      "no AI call",
      "no automation step",
      "real-user UAT copy",
      "HEU-DATA-012-TASK-CENTER-REAL-USER-UAT-COPY",
      "still using mock/fallback data and no DB read",
      "check:heu-task-center-real-user-uat-copy-readiness",
    ],
    "gate evidence panel doc token",
    docPath,
  );

  requireTokens(
    uatCopyDoc,
    [
      "HEU-DATA-012-TASK-CENTER-REAL-USER-UAT-COPY",
      "PASS_LOCAL_REAL_USER_UAT_COPY",
      "TASK_CENTER_REAL_USER_UAT_COPY_NO_APPROVAL",
      "TASK_CENTER_REAL_USER_UAT_COPY_NO_DATA_ENTRY",
      "TASK_CENTER_DATABASE_READY: NO_GO",
    ],
    "real-user UAT copy doc token",
    uatCopyDocPath,
  );

  requireTokens(
    gateDoc,
    [
      "HEU-DATA-011-TASK-CENTER-GATE-EVIDENCE-PANEL",
      "user-facing read-only evidence panel",
      "still no DB read and no migration",
      "check:heu-task-center-gate-evidence-panel-readiness",
    ],
    "gate doc next-slice token",
    gateDocPath,
  );

  requireTokens(
    manifest,
    [
      componentPath,
      panelSourcePath,
      docPath,
      checkerPath,
      uatCopyDocPath,
      uatCopyCheckerPath,
      "check:heu-task-center-gate-evidence-panel-readiness",
      "check:heu-task-center-real-user-uat-copy-readiness",
      "node --check scripts/check-heu-task-center-gate-evidence-panel-readiness.mjs",
      "node --check scripts/check-heu-task-center-real-user-uat-copy-readiness.mjs",
      "npm.cmd run check:heu-task-center-gate-evidence-panel-readiness",
      "npm.cmd run check:heu-task-center-real-user-uat-copy-readiness",
    ],
    "manifest evidence panel token",
    manifestPath,
  );

  requireTokens(
    gateChecker,
    [
      "HEU-DATA-011-TASK-CENTER-GATE-EVIDENCE-PANEL",
      "check:heu-task-center-gate-evidence-panel-readiness",
      panelSourcePath,
      docPath,
      checkerPath,
    ],
    "gate checker evidence panel token",
    gateCheckerPath,
  );

  requireTokens(
    uatCopyChecker,
    [
      "HEU_TASK_CENTER_REAL_USER_UAT_COPY_READY: PASS_LOCAL",
      "TASK_CENTER_DATABASE_READY: NO_GO_REAL_USER_UAT_COPY_ONLY",
      "NO_RUNTIME_MUTATION: task center real-user UAT copy checker only",
    ],
    "real-user UAT copy checker token",
    uatCopyCheckerPath,
  );

  if (packageJson.scripts?.[checkerAlias] !== checkerCommand) {
    fail(`${packagePath}: missing or mismatched ${checkerAlias}`);
  }

  if (packageJson.scripts?.[uatCopyCheckerAlias] !== uatCopyCheckerCommand) {
    fail(`${packagePath}: missing or mismatched ${uatCopyCheckerAlias}`);
  }

  requireTokens(
    checkerScript,
    [
      "existsSync",
      "readFileSync",
      "HEU_TASK_CENTER_GATE_EVIDENCE_PANEL_READY: PASS_LOCAL",
      "TASK_CENTER_DATABASE_READY: NO_GO_GATE_EVIDENCE_PANEL_ONLY",
      "NO_RUNTIME_MUTATION: task center gate evidence panel checker only; no database client, database read, table creation, SQL migration, task write, AI call, paid automation, deploy, finance action or production GO",
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
    "task-center gate evidence panel scope",
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
  console.error("HEU Task Center gate evidence panel readiness check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("HEU Task Center gate evidence panel readiness check");
console.log("HEU_TASK_CENTER_GATE_EVIDENCE_PANEL_READY: PASS_LOCAL");
console.log("TASK_CENTER_DATABASE_READY: NO_GO_GATE_EVIDENCE_PANEL_ONLY");
console.log(
  "NO_RUNTIME_MUTATION: task center gate evidence panel checker only; no database client, database read, table creation, SQL migration, task write, AI call, paid automation, deploy, finance action or production GO",
);
