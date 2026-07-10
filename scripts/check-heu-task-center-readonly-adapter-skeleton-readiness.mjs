import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const failures = [];

const adapterPath = "lib/task-center-readonly-adapter-skeleton.ts";
const queryContractPath = "lib/task-center-readonly-query-contract.ts";
const docPath =
  "docs/HEU_CONTROL/HEU_DATA_008_TASK_CENTER_READONLY_ADAPTER_SKELETON_20260710.md";
const fallbackDocPath =
  "docs/HEU_CONTROL/HEU_DATA_009_TASK_CENTER_UI_FALLBACK_WIRING_20260710.md";
const queryPlanDocPath =
  "docs/HEU_CONTROL/HEU_DATA_007_TASK_CENTER_READONLY_QUERY_PLAN_20260710.md";
const manifestPath =
  "docs/HEU_CONTROL/HEU_APP_SHELL_001_STAGE_FILE_MANIFEST_20260709.md";
const queryPlanCheckerPath =
  "scripts/check-heu-task-center-readonly-query-plan-readiness.mjs";
const fallbackSourcePath = "lib/task-center-ui-fallback-source.ts";
const fallbackCheckerPath =
  "scripts/check-heu-task-center-ui-fallback-wiring-readiness.mjs";
const checkerPath =
  "scripts/check-heu-task-center-readonly-adapter-skeleton-readiness.mjs";
const packagePath = "package.json";
const checkerAlias =
  "check:heu-task-center-readonly-adapter-skeleton-readiness";
const checkerCommand = `node ${checkerPath}`;
const fallbackCheckerAlias =
  "check:heu-task-center-ui-fallback-wiring-readiness";
const fallbackCheckerCommand = `node ${fallbackCheckerPath}`;

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
  adapterPath,
  queryContractPath,
  docPath,
  fallbackDocPath,
  queryPlanDocPath,
  manifestPath,
  queryPlanCheckerPath,
  fallbackSourcePath,
  fallbackCheckerPath,
  checkerPath,
  packagePath,
]) {
  requireFile(file);
}

if (failures.length === 0) {
  const adapter = read(adapterPath);
  const queryContract = read(queryContractPath);
  const doc = read(docPath);
  const fallbackDoc = read(fallbackDocPath);
  const queryPlanDoc = read(queryPlanDocPath);
  const manifest = read(manifestPath);
  const queryPlanChecker = read(queryPlanCheckerPath);
  const fallbackSource = read(fallbackSourcePath);
  const fallbackChecker = read(fallbackCheckerPath);
  const checkerScript = read(checkerPath);
  const packageJson = JSON.parse(read(packagePath));

  requireTokens(
    adapter,
    [
      "TASK_CENTER_READONLY_ADAPTER_SKELETON_ONLY",
      "DISABLED_BY_DEFAULT",
      "FEATURE_FLAG_REQUIRED",
      "NO_DATABASE_CLIENT_CREATED",
      "NO_DATABASE_READ_EXECUTED",
      "NO_SQL_MIGRATION_CREATED",
      "NO_TASK_MUTATION_ROUTE_CREATED",
      "NO_AI_CALL_NO_AUTOMATION_STEP",
      "TaskCenterReadonlyAdapterSkeleton",
      "TaskCenterReadonlyAdapterStatus",
      "createTaskCenterReadonlyAdapterSkeleton",
      "createTaskCenterReadonlyQueryPlan",
      "TASK_CENTER_DATABASE_READY_NO_GO_QUERY_PLAN_ONLY",
      "SCOPE_FIRST_QUERY_REQUIRED",
      "NO_BROAD_FALLBACK",
      "rows: []",
    ],
    "adapter skeleton token",
    adapterPath,
  );

  requireTokens(
    queryContract,
    [
      "TASK_CENTER_READONLY_QUERY_PLAN_ONLY",
      "TASK_CENTER_DATABASE_READY_NO_GO_QUERY_PLAN_ONLY",
      "TASK_CENTER_READONLY_SCOPE_FILTERS",
      "TASK_CENTER_READONLY_SELECT_COLUMNS",
      "createTaskCenterReadonlyQueryPlan",
    ],
    "query contract token",
    queryContractPath,
  );

  requireTokens(
    doc,
    [
      "HEU-DATA-008-TASK-CENTER-READONLY-ADAPTER-SKELETON",
      "Status: PASS_LOCAL_READONLY_ADAPTER_SKELETON",
      "Production status: NO-GO",
      "TASK_CENTER_READONLY_ADAPTER_SKELETON_ONLY",
      "DISABLED_BY_DEFAULT",
      "FEATURE_FLAG_REQUIRED",
      "NO_DATABASE_CLIENT_CREATED",
      "NO_DATABASE_READ_EXECUTED",
      "NO_SQL_MIGRATION_CREATED",
      "NO_TASK_MUTATION_ROUTE_CREATED",
      "NO_AI_CALL_NO_AUTOMATION_STEP",
      "TASK_CENTER_DATABASE_READY: NO_GO",
      "CAN_SUA_IT_DATA_AUDIT_PHAP_CHE_OWNER",
      "no AI call",
      "no automation step",
      "HEU-DATA-009-TASK-CENTER-UI-FALLBACK-WIRING",
      "UI fallback wiring",
      "without enabling DB reads",
      "check:heu-task-center-ui-fallback-wiring-readiness",
    ],
    "adapter skeleton doc token",
    docPath,
  );

  requireTokens(
    queryPlanDoc,
    [
      "HEU-DATA-008-TASK-CENTER-READONLY-ADAPTER-SKELETON",
      "feature-flagged read-only adapter skeleton",
      "still disabled by default and still no migration until gates close",
    ],
    "query-plan next-slice token",
    queryPlanDocPath,
  );

  requireTokens(
    fallbackDoc,
    [
      "HEU-DATA-009-TASK-CENTER-UI-FALLBACK-WIRING",
      "TASK_CENTER_UI_FALLBACK_WIRING_ONLY",
      "MOCK_READONLY_FALLBACK_ACTIVE",
      "DISABLED_ADAPTER_OUTPUT_ONLY",
      "NO_DATABASE_CLIENT_CREATED",
      "NO_DATABASE_READ_EXECUTED",
      "NO_TASK_MUTATION_ROUTE_CREATED",
      "NO_AI_CALL_NO_AUTOMATION_STEP",
    ],
    "next fallback wiring doc token",
    fallbackDocPath,
  );

  requireTokens(
    fallbackSource,
    [
      "TASK_CENTER_UI_FALLBACK_WIRING_ONLY",
      "MOCK_READONLY_FALLBACK_ACTIVE",
      "DISABLED_ADAPTER_OUTPUT_ONLY",
      "createTaskCenterUiFallbackSource",
      "createTaskCenterReadonlyAdapterSkeleton",
      "getMockTaskCenterTasksForLanes",
      "adapterRows: adapter.rows",
    ],
    "next fallback source token",
    fallbackSourcePath,
  );

  requireTokens(
    fallbackChecker,
    [
      "HEU_TASK_CENTER_UI_FALLBACK_WIRING_READY: PASS_LOCAL",
      "TASK_CENTER_DATABASE_READY: NO_GO_UI_FALLBACK_ONLY",
      "NO_RUNTIME_MUTATION: task center UI fallback wiring checker only",
    ],
    "next fallback checker token",
    fallbackCheckerPath,
  );

  requireTokens(
    manifest,
    [
      adapterPath,
      fallbackSourcePath,
      docPath,
      fallbackDocPath,
      checkerPath,
      fallbackCheckerPath,
      "check:heu-task-center-readonly-adapter-skeleton-readiness",
      "check:heu-task-center-ui-fallback-wiring-readiness",
      "node --check scripts/check-heu-task-center-readonly-adapter-skeleton-readiness.mjs",
      "node --check scripts/check-heu-task-center-ui-fallback-wiring-readiness.mjs",
      "npm.cmd run check:heu-task-center-readonly-adapter-skeleton-readiness",
      "npm.cmd run check:heu-task-center-ui-fallback-wiring-readiness",
    ],
    "manifest adapter skeleton token",
    manifestPath,
  );

  requireTokens(
    queryPlanChecker,
    [
      "HEU-DATA-008-TASK-CENTER-READONLY-ADAPTER-SKELETON",
      "check:heu-task-center-readonly-adapter-skeleton-readiness",
      adapterPath,
      docPath,
      checkerPath,
    ],
    "query-plan checker adapter skeleton token",
    queryPlanCheckerPath,
  );

  if (packageJson.scripts?.[checkerAlias] !== checkerCommand) {
    fail(`${packagePath}: missing or mismatched ${checkerAlias}`);
  }

  if (packageJson.scripts?.[fallbackCheckerAlias] !== fallbackCheckerCommand) {
    fail(`${packagePath}: missing or mismatched ${fallbackCheckerAlias}`);
  }

  requireTokens(
    checkerScript,
    [
      "existsSync",
      "readFileSync",
      "HEU_TASK_CENTER_READONLY_ADAPTER_SKELETON_READY: PASS_LOCAL",
      "TASK_CENTER_DATABASE_READY: NO_GO_ADAPTER_DISABLED",
      "NO_RUNTIME_MUTATION: task center readonly adapter skeleton checker only; no database client, database read, table creation, SQL migration, task write, AI call, paid automation, deploy, finance action or production GO",
    ],
    "checker-script read-only token",
    checkerPath,
  );

  forbidPatterns(
    `${adapter}\n${doc}`,
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
      { label: "enabled true adapter", pattern: /\benabled\s*:\s*true\b/ },
      { label: "actual adapter enable flag", pattern: /TASK_CENTER_ADAPTER_ENABLED\s*=\s*\S+/ },
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
    "runtime DB, SQL, secret, feature enable or mutation API",
    "task-center readonly adapter skeleton scope",
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
  console.error("HEU Task Center readonly adapter skeleton readiness check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("HEU Task Center readonly adapter skeleton readiness check");
console.log("HEU_TASK_CENTER_READONLY_ADAPTER_SKELETON_READY: PASS_LOCAL");
console.log("TASK_CENTER_DATABASE_READY: NO_GO_ADAPTER_DISABLED");
console.log(
  "NO_RUNTIME_MUTATION: task center readonly adapter skeleton checker only; no database client, database read, table creation, SQL migration, task write, AI call, paid automation, deploy, finance action or production GO",
);
