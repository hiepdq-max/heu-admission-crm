import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const failures = [];

const fallbackSourcePath = "lib/task-center-ui-fallback-source.ts";
const adapterPath = "lib/task-center-readonly-adapter-skeleton.ts";
const componentPath = "components/data-confirmation/department-task-inbox.tsx";
const docPath =
  "docs/HEU_CONTROL/HEU_DATA_009_TASK_CENTER_UI_FALLBACK_WIRING_20260710.md";
const adapterDocPath =
  "docs/HEU_CONTROL/HEU_DATA_008_TASK_CENTER_READONLY_ADAPTER_SKELETON_20260710.md";
const manifestPath =
  "docs/HEU_CONTROL/HEU_APP_SHELL_001_STAGE_FILE_MANIFEST_20260709.md";
const adapterCheckerPath =
  "scripts/check-heu-task-center-readonly-adapter-skeleton-readiness.mjs";
const checkerPath =
  "scripts/check-heu-task-center-ui-fallback-wiring-readiness.mjs";
const packagePath = "package.json";
const checkerAlias = "check:heu-task-center-ui-fallback-wiring-readiness";
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
  fallbackSourcePath,
  adapterPath,
  componentPath,
  docPath,
  adapterDocPath,
  manifestPath,
  adapterCheckerPath,
  checkerPath,
  packagePath,
]) {
  requireFile(file);
}

if (failures.length === 0) {
  const fallbackSource = read(fallbackSourcePath);
  const adapter = read(adapterPath);
  const component = read(componentPath);
  const doc = read(docPath);
  const adapterDoc = read(adapterDocPath);
  const manifest = read(manifestPath);
  const adapterChecker = read(adapterCheckerPath);
  const checkerScript = read(checkerPath);
  const packageJson = JSON.parse(read(packagePath));

  requireTokens(
    fallbackSource,
    [
      "TASK_CENTER_UI_FALLBACK_WIRING_ONLY",
      "MOCK_READONLY_FALLBACK_ACTIVE",
      "DISABLED_ADAPTER_OUTPUT_ONLY",
      "NO_DATABASE_CLIENT_CREATED",
      "NO_DATABASE_READ_EXECUTED",
      "NO_TASK_MUTATION_ROUTE_CREATED",
      "NO_AI_CALL_NO_AUTOMATION_STEP",
      "TaskCenterUiFallbackSource",
      "createTaskCenterUiFallbackSource",
      "createTaskCenterReadonlyAdapterSkeleton",
      "getMockTaskCenterTasksForLanes",
      "TASK_CENTER_READONLY_ADAPTER_DISABLED_BY_DEFAULT",
      "TASK_CENTER_READONLY_ADAPTER_SKELETON_ONLY",
      "displayTasks",
      "adapterRows: adapter.rows",
    ],
    "fallback source token",
    fallbackSourcePath,
  );

  requireTokens(
    adapter,
    [
      "TASK_CENTER_READONLY_ADAPTER_SKELETON_ONLY",
      "DISABLED_BY_DEFAULT",
      "NO_DATABASE_CLIENT_CREATED",
      "NO_DATABASE_READ_EXECUTED",
      "rows: []",
      "createTaskCenterReadonlyAdapterSkeleton",
    ],
    "adapter skeleton token",
    adapterPath,
  );

  requireTokens(
    component,
    [
      "@/lib/task-center-ui-fallback-source",
      "createTaskCenterUiFallbackSource",
      "taskFallback.displayTasks",
      "TASK_CENTER_UI_FALLBACK_WIRING_ONLY",
      "TASK_CENTER_MOCK_READONLY_FALLBACK_ACTIVE",
      "TASK_CENTER_DISABLED_ADAPTER_OUTPUT_ONLY",
      "TASK_CENTER_UI_FALLBACK_NO_DATABASE_CLIENT",
      "TASK_CENTER_UI_FALLBACK_NO_DATABASE_READ",
      "data-heu-task-center-ui-fallback-wiring",
      "data-heu-task-center-ui-fallback-source",
      "data-heu-task-center-disabled-adapter-output",
      "data-heu-task-center-ui-fallback-no-database-client",
      "data-heu-task-center-ui-fallback-no-database-read",
      "Adapter: {taskFallback.adapterStatus}",
    ],
    "component fallback wiring token",
    componentPath,
  );

  requireTokens(
    doc,
    [
      "HEU-DATA-009-TASK-CENTER-UI-FALLBACK-WIRING",
      "Status: PASS_LOCAL_UI_FALLBACK_WIRING",
      "Production status: NO-GO",
      "TASK_CENTER_UI_FALLBACK_WIRING_ONLY",
      "MOCK_READONLY_FALLBACK_ACTIVE",
      "DISABLED_ADAPTER_OUTPUT_ONLY",
      "NO_DATABASE_CLIENT_CREATED",
      "NO_DATABASE_READ_EXECUTED",
      "NO_TASK_MUTATION_ROUTE_CREATED",
      "NO_AI_CALL_NO_AUTOMATION_STEP",
      "TASK_CENTER_DATABASE_READY: NO_GO",
      "CAN_SUA_IT_DATA_AUDIT_PHAP_CHE_OWNER",
      "no AI call",
      "no automation step",
      "owner-review checklist",
    ],
    "fallback wiring doc token",
    docPath,
  );

  requireTokens(
    adapterDoc,
    [
      "HEU-DATA-009-TASK-CENTER-UI-FALLBACK-WIRING",
      "UI fallback wiring",
      "without enabling DB reads",
      "check:heu-task-center-ui-fallback-wiring-readiness",
    ],
    "adapter doc next-slice token",
    adapterDocPath,
  );

  requireTokens(
    manifest,
    [
      fallbackSourcePath,
      docPath,
      checkerPath,
      "check:heu-task-center-ui-fallback-wiring-readiness",
      "node --check scripts/check-heu-task-center-ui-fallback-wiring-readiness.mjs",
      "npm.cmd run check:heu-task-center-ui-fallback-wiring-readiness",
    ],
    "manifest fallback wiring token",
    manifestPath,
  );

  requireTokens(
    adapterChecker,
    [
      "HEU-DATA-009-TASK-CENTER-UI-FALLBACK-WIRING",
      "check:heu-task-center-ui-fallback-wiring-readiness",
      fallbackSourcePath,
      docPath,
      checkerPath,
    ],
    "adapter checker fallback token",
    adapterCheckerPath,
  );

  if (packageJson.scripts?.[checkerAlias] !== checkerCommand) {
    fail(`${packagePath}: missing or mismatched ${checkerAlias}`);
  }

  requireTokens(
    checkerScript,
    [
      "existsSync",
      "readFileSync",
      "HEU_TASK_CENTER_UI_FALLBACK_WIRING_READY: PASS_LOCAL",
      "TASK_CENTER_DATABASE_READY: NO_GO_UI_FALLBACK_ONLY",
      "NO_RUNTIME_MUTATION: task center UI fallback wiring checker only; no database client, database read, table creation, SQL migration, task write, AI call, paid automation, deploy, finance action or production GO",
    ],
    "checker-script read-only token",
    checkerPath,
  );

  forbidPatterns(
    `${fallbackSource}\n${component}\n${doc}`,
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
      { label: "enabled true fallback", pattern: /\benabled\s*:\s*true\b/ },
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
    "task-center UI fallback wiring scope",
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
  console.error("HEU Task Center UI fallback wiring readiness check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("HEU Task Center UI fallback wiring readiness check");
console.log("HEU_TASK_CENTER_UI_FALLBACK_WIRING_READY: PASS_LOCAL");
console.log("TASK_CENTER_DATABASE_READY: NO_GO_UI_FALLBACK_ONLY");
console.log(
  "NO_RUNTIME_MUTATION: task center UI fallback wiring checker only; no database client, database read, table creation, SQL migration, task write, AI call, paid automation, deploy, finance action or production GO",
);
