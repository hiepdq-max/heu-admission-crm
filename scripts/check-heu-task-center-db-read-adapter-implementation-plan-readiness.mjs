import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const failures = [];

const componentPath = "components/data-confirmation/department-task-inbox.tsx";
const panelSourcePath = "lib/task-center-gate-evidence-panel-source.ts";
const docPath =
  "docs/HEU_CONTROL/HEU_DATA_017_TASK_CENTER_DB_READ_ADAPTER_IMPLEMENTATION_PLAN_20260710.md";
const readonlyAdapterDecisionDocPath =
  "docs/HEU_CONTROL/HEU_DATA_016_TASK_CENTER_READONLY_ADAPTER_DECISION_LEDGER_20260710.md";
const manifestPath =
  "docs/HEU_CONTROL/HEU_APP_SHELL_001_STAGE_FILE_MANIFEST_20260709.md";
const readonlyAdapterDecisionCheckerPath =
  "scripts/check-heu-task-center-readonly-adapter-decision-ledger-readiness.mjs";
const checkerPath =
  "scripts/check-heu-task-center-db-read-adapter-implementation-plan-readiness.mjs";
const packagePath = "package.json";
const checkerAlias =
  "check:heu-task-center-db-read-adapter-implementation-plan-readiness";
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
  readonlyAdapterDecisionDocPath,
  manifestPath,
  readonlyAdapterDecisionCheckerPath,
  checkerPath,
  packagePath,
]) {
  requireFile(file);
}

if (failures.length === 0) {
  const component = read(componentPath);
  const panelSource = read(panelSourcePath);
  const doc = read(docPath);
  const readonlyAdapterDecisionDoc = read(readonlyAdapterDecisionDocPath);
  const manifest = read(manifestPath);
  const readonlyAdapterDecisionChecker = read(
    readonlyAdapterDecisionCheckerPath,
  );
  const checkerScript = read(checkerPath);
  const packageJson = JSON.parse(read(packagePath));

  requireTokens(
    panelSource,
    [
      "TASK_CENTER_DB_READ_ADAPTER_IMPLEMENTATION_PLAN_ONLY",
      "TASK_CENTER_DB_READ_ADAPTER_IMPLEMENTATION_PLAN_READONLY",
      "TASK_CENTER_DB_READ_ADAPTER_IMPLEMENTATION_PLAN_DRAFT_ONLY",
      "TASK_CENTER_DB_READ_ADAPTER_IMPLEMENTATION_PLAN_NO_DATABASE_READ",
      "TASK_CENTER_DB_READ_ADAPTER_IMPLEMENTATION_PLAN_NO_DATABASE_CLIENT",
      "TASK_CENTER_DB_READ_ADAPTER_IMPLEMENTATION_PLAN_NO_TASK_MUTATION",
      "TASK_CENTER_DB_READ_ADAPTER_IMPLEMENTATION_PLAN_NO_AI_OR_AUTOMATION",
      "TaskCenterDbReadAdapterImplementationPlanItem",
      "dbReadAdapterImplementationPlanItems",
      "DB_READ_PLAN_SCOPE_FILTER_CONTRACT",
      "DB_READ_PLAN_NEGATIVE_ACCESS_TEST",
      "DB_READ_PLAN_RESTRICTED_FIELD_ALLOWLIST",
      "DB_READ_PLAN_DEPARTMENT_LABEL_MAP",
      "DB_READ_PLAN_PRODUCTION_BOUNDARY",
      "phase: \"PLAN_ONLY\"",
      "requiredGateBeforeExecution: \"IT_DATA_SCOPE_FIRST_FILTER_SIGNOFF\"",
      "requiredGateBeforeExecution: \"AUDIT_NEGATIVE_ACCESS_EVIDENCE\"",
      "PHAP_CHE_RESTRICTED_DATA_BOUNDARY_SIGNOFF",
      "requiredGateBeforeExecution: \"DEPARTMENT_OWNER_TASK_LABEL_ACCEPTANCE\"",
      "requiredGateBeforeExecution: \"BGH_PRODUCTION_NO_GO_ACKNOWLEDGEMENT\"",
      "forbiddenInThisSlice: \"NO_DATABASE_CLIENT_CREATED\"",
      "forbiddenInThisSlice: \"NO_DATABASE_READ_EXECUTED\"",
      "forbiddenInThisSlice: \"NO_RAW_PII_NO_PAYMENT_DATA\"",
      "forbiddenInThisSlice: \"NO_TASK_MUTATION_ROUTE_CREATED\"",
      "forbiddenInThisSlice: \"NO_PRODUCTION_GO_NO_DEPLOY\"",
    ],
    "db-read adapter implementation plan source token",
    panelSourcePath,
  );

  requireTokens(
    component,
    [
      "TASK_CENTER_DB_READ_ADAPTER_IMPLEMENTATION_PLAN_ONLY",
      "TASK_CENTER_DB_READ_ADAPTER_IMPLEMENTATION_PLAN_READONLY",
      "TASK_CENTER_DB_READ_ADAPTER_IMPLEMENTATION_PLAN_DRAFT_ONLY",
      "TASK_CENTER_DB_READ_ADAPTER_IMPLEMENTATION_PLAN_NO_DATABASE_READ",
      "TASK_CENTER_DB_READ_ADAPTER_IMPLEMENTATION_PLAN_NO_DATABASE_CLIENT",
      "TASK_CENTER_DB_READ_ADAPTER_IMPLEMENTATION_PLAN_NO_TASK_MUTATION",
      "TASK_CENTER_DB_READ_ADAPTER_IMPLEMENTATION_PLAN_NO_AI_OR_AUTOMATION",
      "data-heu-task-center-db-read-adapter-implementation-plan",
      "data-heu-task-center-db-read-adapter-implementation-plan-readonly",
      "data-heu-task-center-db-read-adapter-implementation-plan-draft-only",
      "data-heu-task-center-db-read-adapter-implementation-plan-no-database-read",
      "data-heu-task-center-db-read-adapter-implementation-plan-no-database-client",
      "data-heu-task-center-db-read-adapter-implementation-plan-no-task-mutation",
      "data-heu-task-center-db-read-adapter-implementation-plan-no-ai-or-automation",
      "data-heu-task-center-db-read-plan-item",
      "data-heu-task-center-db-read-plan-phase",
      "data-heu-task-center-db-read-plan-required-gate",
      "data-heu-task-center-db-read-plan-forbidden",
      "HEU-Data-017 - DB-read adapter implementation plan",
      "Ke hoach mo adapter doc DB sau khi du owner gate",
      "gateEvidence.dbReadAdapterImplementationPlan.items.map",
    ],
    "component db-read adapter implementation plan token",
    componentPath,
  );

  requireTokens(
    doc,
    [
      "HEU-DATA-017-TASK-CENTER-DB-READ-ADAPTER-IMPLEMENTATION-PLAN",
      "Status: PASS_LOCAL_DB_READ_ADAPTER_IMPLEMENTATION_PLAN",
      "Production status: NO-GO",
      "TASK_CENTER_DB_READ_ADAPTER_IMPLEMENTATION_PLAN_ONLY",
      "TASK_CENTER_DB_READ_ADAPTER_IMPLEMENTATION_PLAN_READONLY",
      "TASK_CENTER_DB_READ_ADAPTER_IMPLEMENTATION_PLAN_DRAFT_ONLY",
      "TASK_CENTER_DB_READ_ADAPTER_IMPLEMENTATION_PLAN_NO_DATABASE_READ",
      "TASK_CENTER_DB_READ_ADAPTER_IMPLEMENTATION_PLAN_NO_DATABASE_CLIENT",
      "TASK_CENTER_DB_READ_ADAPTER_IMPLEMENTATION_PLAN_NO_TASK_MUTATION",
      "TASK_CENTER_DB_READ_ADAPTER_IMPLEMENTATION_PLAN_NO_AI_OR_AUTOMATION",
      "TASK_CENTER_GATE_EVIDENCE_PANEL_DATABASE_NO_GO",
      "NO_DATABASE_CLIENT_CREATED",
      "NO_DATABASE_READ_EXECUTED",
      "NO_SQL_MIGRATION_CREATED",
      "NO_TASK_MUTATION_ROUTE_CREATED",
      "NO_AI_CALL_NO_AUTOMATION_STEP",
      "DB_READ_PLAN_SCOPE_FILTER_CONTRACT",
      "DB_READ_PLAN_NEGATIVE_ACCESS_TEST",
      "DB_READ_PLAN_RESTRICTED_FIELD_ALLOWLIST",
      "DB_READ_PLAN_DEPARTMENT_LABEL_MAP",
      "DB_READ_PLAN_PRODUCTION_BOUNDARY",
      "TASK_CENTER_DATABASE_READY: NO_GO",
      "CAN_SUA_IT_DATA_AUDIT_PHAP_CHE_OWNER_BGH",
      "Task Center adapter test fixture contract",
      "still no DB read and no migration",
    ],
    "db-read adapter implementation plan doc token",
    docPath,
  );

  requireTokens(
    readonlyAdapterDecisionDoc,
    [
      "HEU-DATA-017-TASK-CENTER-DB-READ-ADAPTER-IMPLEMENTATION-PLAN",
      "Task Center DB-read adapter implementation plan",
      "still no DB read and no migration",
      "check:heu-task-center-db-read-adapter-implementation-plan-readiness",
    ],
    "readonly adapter decision ledger next-slice token",
    readonlyAdapterDecisionDocPath,
  );

  requireTokens(
    manifest,
    [
      componentPath,
      panelSourcePath,
      docPath,
      readonlyAdapterDecisionDocPath,
      checkerPath,
      readonlyAdapterDecisionCheckerPath,
      "check:heu-task-center-db-read-adapter-implementation-plan-readiness",
      "node --check scripts/check-heu-task-center-db-read-adapter-implementation-plan-readiness.mjs",
      "npm.cmd run check:heu-task-center-db-read-adapter-implementation-plan-readiness",
    ],
    "manifest db-read adapter implementation plan token",
    manifestPath,
  );

  requireTokens(
    readonlyAdapterDecisionChecker,
    [
      "HEU-DATA-017-TASK-CENTER-DB-READ-ADAPTER-IMPLEMENTATION-PLAN",
      "check:heu-task-center-db-read-adapter-implementation-plan-readiness",
      docPath,
      checkerPath,
    ],
    "readonly adapter decision checker next-slice token",
    readonlyAdapterDecisionCheckerPath,
  );

  if (packageJson.scripts?.[checkerAlias] !== checkerCommand) {
    fail(`${packagePath}: missing or mismatched ${checkerAlias}`);
  }

  requireTokens(
    checkerScript,
    [
      "existsSync",
      "readFileSync",
      "HEU_TASK_CENTER_DB_READ_ADAPTER_IMPLEMENTATION_PLAN_READY: PASS_LOCAL",
      "TASK_CENTER_DATABASE_READY: NO_GO_DB_READ_ADAPTER_IMPLEMENTATION_PLAN_ONLY",
      "NO_RUNTIME_MUTATION: task center DB-read adapter implementation plan checker only; no database client, database read, table creation, SQL migration, task write, file upload, storage write, AI call, paid automation, deploy, finance action or production GO",
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
    "task-center DB-read adapter implementation plan scope",
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
  console.error(
    "HEU Task Center DB-read adapter implementation plan readiness check failed:",
  );
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("HEU Task Center DB-read adapter implementation plan readiness check");
console.log("HEU_TASK_CENTER_DB_READ_ADAPTER_IMPLEMENTATION_PLAN_READY: PASS_LOCAL");
console.log(
  "TASK_CENTER_DATABASE_READY: NO_GO_DB_READ_ADAPTER_IMPLEMENTATION_PLAN_ONLY",
);
console.log(
  "NO_RUNTIME_MUTATION: task center DB-read adapter implementation plan checker only; no database client, database read, table creation, SQL migration, task write, file upload, storage write, AI call, paid automation, deploy, finance action or production GO",
);
