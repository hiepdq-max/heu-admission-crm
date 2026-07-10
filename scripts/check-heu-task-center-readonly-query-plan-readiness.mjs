import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const failures = [];

const queryContractPath = "lib/task-center-readonly-query-contract.ts";
const taskContractPath = "lib/task-center-contract.ts";
const docPath =
  "docs/HEU_CONTROL/HEU_DATA_007_TASK_CENTER_READONLY_QUERY_PLAN_20260710.md";
const adapterDocPath =
  "docs/HEU_CONTROL/HEU_DATA_008_TASK_CENTER_READONLY_ADAPTER_SKELETON_20260710.md";
const mockDocPath =
  "docs/HEU_CONTROL/HEU_DATA_006_TASK_CENTER_MOCK_READONLY_LIST_20260710.md";
const manifestPath =
  "docs/HEU_CONTROL/HEU_APP_SHELL_001_STAGE_FILE_MANIFEST_20260709.md";
const mockCheckerPath =
  "scripts/check-heu-task-center-mock-readonly-list-readiness.mjs";
const adapterPath = "lib/task-center-readonly-adapter-skeleton.ts";
const adapterCheckerPath =
  "scripts/check-heu-task-center-readonly-adapter-skeleton-readiness.mjs";
const checkerPath =
  "scripts/check-heu-task-center-readonly-query-plan-readiness.mjs";
const packagePath = "package.json";
const checkerAlias = "check:heu-task-center-readonly-query-plan-readiness";
const checkerCommand = `node ${checkerPath}`;
const adapterCheckerAlias =
  "check:heu-task-center-readonly-adapter-skeleton-readiness";
const adapterCheckerCommand = `node ${adapterCheckerPath}`;

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
  queryContractPath,
  taskContractPath,
  docPath,
  adapterDocPath,
  mockDocPath,
  manifestPath,
  mockCheckerPath,
  adapterPath,
  adapterCheckerPath,
  checkerPath,
  packagePath,
]) {
  requireFile(file);
}

if (failures.length === 0) {
  const queryContract = read(queryContractPath);
  const taskContract = read(taskContractPath);
  const doc = read(docPath);
  const adapterDoc = read(adapterDocPath);
  const mockDoc = read(mockDocPath);
  const manifest = read(manifestPath);
  const mockChecker = read(mockCheckerPath);
  const adapter = read(adapterPath);
  const adapterChecker = read(adapterCheckerPath);
  const checkerScript = read(checkerPath);
  const packageJson = JSON.parse(read(packagePath));

  requireTokens(
    queryContract,
    [
      "TASK_CENTER_READONLY_QUERY_PLAN_ONLY",
      "SCOPE_FIRST_QUERY_REQUIRED",
      "TASK_CENTER_DATABASE_READY_NO_GO_QUERY_PLAN_ONLY",
      "NO_BROAD_FALLBACK",
      "NO_TASK_MUTATION_ROUTE_CREATED",
      "NO_AI_CALL_NO_AUTOMATION_STEP",
      "TASK_CENTER_READONLY_PAGE_SIZE_LIMIT = 50",
      "TASK_CENTER_READONLY_SCOPE_FILTERS",
      "workspace_id",
      "admission_segment_id",
      "department_code",
      "owner_role_code",
      "TASK_CENTER_READONLY_SELECT_COLUMNS",
      "task_id",
      "source_module",
      "source_ref_type",
      "source_ref_id",
      "controlled_evidence_id",
      "TaskCenterReadonlyQueryPlan",
      "createTaskCenterReadonlyQueryPlan",
      "TASK_CENTER_SOURCE_REF_ALLOWLIST",
      "TASK_CENTER_STATUSES",
      "TASK_CENTER_DEPARTMENT_CODES",
    ],
    "query contract token",
    queryContractPath,
  );

  requireTokens(
    taskContract,
    [
      "TASK_CENTER_REQUIRED_COLUMNS",
      "TASK_CENTER_SOURCE_REF_ALLOWLIST",
      "TASK_CENTER_DEPARTMENT_CODES",
      "TASK_CENTER_STATUSES",
      "TaskCenterActionGateSnapshot",
      "TaskCenterVisibleLane",
    ],
    "base contract token",
    taskContractPath,
  );

  requireTokens(
    doc,
    [
      "HEU-DATA-007-TASK-CENTER-READONLY-QUERY-PLAN",
      "Status: PASS_LOCAL_READONLY_QUERY_PLAN",
      "Production status: NO-GO",
      "TASK_CENTER_READONLY_QUERY_PLAN_ONLY",
      "SCOPE_FIRST_QUERY_REQUIRED",
      "TASK_CENTER_DATABASE_READY_NO_GO_QUERY_PLAN_ONLY",
      "NO_BROAD_FALLBACK",
      "NO_TASK_MUTATION_ROUTE_CREATED",
      "NO_AI_CALL_NO_AUTOMATION_STEP",
      "TASK_CENTER_DATABASE_READY: NO_GO",
      "TASK_CENTER_READONLY_PAGE_SIZE_LIMIT = 50",
      "CAN_SUA_IT_DATA_AUDIT_PHAP_CHE_OWNER",
      "no AI call",
      "no automation step",
      "HEU-DATA-008-TASK-CENTER-READONLY-ADAPTER-SKELETON",
      "feature-flagged read-only adapter skeleton",
      "still disabled by default and still no migration until gates close",
      "check:heu-task-center-readonly-adapter-skeleton-readiness",
    ],
    "query-plan doc token",
    docPath,
  );

  requireTokens(
    mockDoc,
    [
      "HEU-DATA-007-TASK-CENTER-READONLY-QUERY-PLAN",
      "read-only DB query design",
      "still no mutation and no migration until gates close",
    ],
    "mock-list next-slice token",
    mockDocPath,
  );

  requireTokens(
    adapterDoc,
    [
      "HEU-DATA-008-TASK-CENTER-READONLY-ADAPTER-SKELETON",
      "TASK_CENTER_READONLY_ADAPTER_SKELETON_ONLY",
      "DISABLED_BY_DEFAULT",
      "FEATURE_FLAG_REQUIRED",
      "NO_DATABASE_CLIENT_CREATED",
      "NO_DATABASE_READ_EXECUTED",
      "NO_TASK_MUTATION_ROUTE_CREATED",
      "NO_AI_CALL_NO_AUTOMATION_STEP",
    ],
    "next adapter skeleton doc token",
    adapterDocPath,
  );

  requireTokens(
    adapter,
    [
      "TASK_CENTER_READONLY_ADAPTER_SKELETON_ONLY",
      "DISABLED_BY_DEFAULT",
      "FEATURE_FLAG_REQUIRED",
      "NO_DATABASE_CLIENT_CREATED",
      "NO_DATABASE_READ_EXECUTED",
      "createTaskCenterReadonlyAdapterSkeleton",
      "createTaskCenterReadonlyQueryPlan",
      "rows: []",
    ],
    "next adapter skeleton token",
    adapterPath,
  );

  requireTokens(
    adapterChecker,
    [
      "HEU_TASK_CENTER_READONLY_ADAPTER_SKELETON_READY: PASS_LOCAL",
      "TASK_CENTER_DATABASE_READY: NO_GO_ADAPTER_DISABLED",
      "NO_RUNTIME_MUTATION: task center readonly adapter skeleton checker only",
    ],
    "next adapter checker token",
    adapterCheckerPath,
  );

  requireTokens(
    manifest,
    [
      queryContractPath,
      adapterPath,
      docPath,
      adapterDocPath,
      checkerPath,
      adapterCheckerPath,
      "check:heu-task-center-readonly-query-plan-readiness",
      "check:heu-task-center-readonly-adapter-skeleton-readiness",
      "node --check scripts/check-heu-task-center-readonly-query-plan-readiness.mjs",
      "node --check scripts/check-heu-task-center-readonly-adapter-skeleton-readiness.mjs",
      "npm.cmd run check:heu-task-center-readonly-query-plan-readiness",
      "npm.cmd run check:heu-task-center-readonly-adapter-skeleton-readiness",
    ],
    "manifest query-plan token",
    manifestPath,
  );

  requireTokens(
    mockChecker,
    [
      "HEU-DATA-007-TASK-CENTER-READONLY-QUERY-PLAN",
      "check:heu-task-center-readonly-query-plan-readiness",
      queryContractPath,
      docPath,
      checkerPath,
    ],
    "mock checker query-plan token",
    mockCheckerPath,
  );

  if (packageJson.scripts?.[checkerAlias] !== checkerCommand) {
    fail(`${packagePath}: missing or mismatched ${checkerAlias}`);
  }

  if (packageJson.scripts?.[adapterCheckerAlias] !== adapterCheckerCommand) {
    fail(`${packagePath}: missing or mismatched ${adapterCheckerAlias}`);
  }

  requireTokens(
    checkerScript,
    [
      "existsSync",
      "readFileSync",
      "HEU_TASK_CENTER_READONLY_QUERY_PLAN_READY: PASS_LOCAL",
      "TASK_CENTER_DATABASE_READY: NO_GO_QUERY_PLAN_ONLY",
      "NO_RUNTIME_MUTATION: task center readonly query plan checker only; no database client, database read, table creation, SQL migration, task write, AI call, paid automation, deploy, finance action or production GO",
    ],
    "checker-script read-only token",
    checkerPath,
  );

  forbidPatterns(
    `${queryContract}\n${doc}`,
    [
      { label: "Supabase client import", pattern: /@\/lib\/supabase/ },
      { label: "createClient", pattern: /\bcreateClient\s*\(/ },
      { label: "supabase.from", pattern: /supabase\s*\.\s*from\s*\(/ },
      { label: "Supabase select call", pattern: /\.select\s*\(/ },
      { label: "insert", pattern: /\.insert\s*\(/ },
      { label: "update", pattern: /\.update\s*\(/ },
      { label: "upsert", pattern: /\.upsert\s*\(/ },
      { label: "delete", pattern: /\.delete\s*\(/ },
      { label: "fetch call", pattern: /\bfetch\s*\(/ },
      { label: "server action marker", pattern: /["']use server["']/ },
      { label: "SQL create table statement", pattern: /\bcreate\s+table\b/i },
      { label: "SQL alter table statement", pattern: /\balter\s+table\b/i },
      { label: "SQL migration folder", pattern: /\bmigrations?\//i },
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
    "runtime DB, SQL, secret or mutation API",
    "task-center readonly query plan scope",
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
  console.error("HEU Task Center readonly query plan readiness check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("HEU Task Center readonly query plan readiness check");
console.log("HEU_TASK_CENTER_READONLY_QUERY_PLAN_READY: PASS_LOCAL");
console.log("TASK_CENTER_DATABASE_READY: NO_GO_QUERY_PLAN_ONLY");
console.log(
  "NO_RUNTIME_MUTATION: task center readonly query plan checker only; no database client, database read, table creation, SQL migration, task write, AI call, paid automation, deploy, finance action or production GO",
);
