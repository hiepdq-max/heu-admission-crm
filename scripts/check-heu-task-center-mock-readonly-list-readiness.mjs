import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const failures = [];

const mockLibPath = "lib/task-center-mock-read-model.ts";
const contractTsPath = "lib/task-center-contract.ts";
const componentPath = "components/data-confirmation/department-task-inbox.tsx";
const docPath =
  "docs/HEU_CONTROL/HEU_DATA_006_TASK_CENTER_MOCK_READONLY_LIST_20260710.md";
const readModelDocPath =
  "docs/HEU_CONTROL/HEU_DATA_005_TASK_CENTER_READ_MODEL_INTERFACE_20260710.md";
const queryPlanDocPath =
  "docs/HEU_CONTROL/HEU_DATA_007_TASK_CENTER_READONLY_QUERY_PLAN_20260710.md";
const manifestPath =
  "docs/HEU_CONTROL/HEU_APP_SHELL_001_STAGE_FILE_MANIFEST_20260709.md";
const readModelCheckerPath =
  "scripts/check-heu-task-center-read-model-interface-readiness.mjs";
const queryContractPath = "lib/task-center-readonly-query-contract.ts";
const queryPlanCheckerPath =
  "scripts/check-heu-task-center-readonly-query-plan-readiness.mjs";
const checkerPath =
  "scripts/check-heu-task-center-mock-readonly-list-readiness.mjs";
const packagePath = "package.json";
const checkerAlias = "check:heu-task-center-mock-readonly-list-readiness";
const checkerCommand = `node ${checkerPath}`;
const queryPlanCheckerAlias =
  "check:heu-task-center-readonly-query-plan-readiness";
const queryPlanCheckerCommand = `node ${queryPlanCheckerPath}`;

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
  mockLibPath,
  contractTsPath,
  componentPath,
  docPath,
  readModelDocPath,
  queryPlanDocPath,
  manifestPath,
  readModelCheckerPath,
  queryContractPath,
  queryPlanCheckerPath,
  checkerPath,
  packagePath,
]) {
  requireFile(file);
}

if (failures.length === 0) {
  const mockLib = read(mockLibPath);
  const contractTs = read(contractTsPath);
  const component = read(componentPath);
  const doc = read(docPath);
  const readModelDoc = read(readModelDocPath);
  const queryPlanDoc = read(queryPlanDocPath);
  const queryContract = read(queryContractPath);
  const queryPlanChecker = read(queryPlanCheckerPath);
  const manifest = read(manifestPath);
  const readModelChecker = read(readModelCheckerPath);
  const checkerScript = read(checkerPath);
  const packageJson = JSON.parse(read(packagePath));

  requireTokens(
    mockLib,
    [
      "TASK_CENTER_MOCK_READONLY_LIST",
      "MOCK_DATA_ONLY_NO_DATABASE_READ",
      "NO_TASK_MUTATION_ROUTE_CREATED",
      "NO_AI_CALL_NO_AUTOMATION_STEP",
      "TaskCenterMockTask",
      "getMockTaskCenterTasksForLanes",
      "TASK_CENTER_SOURCE_REF_ALLOWLIST",
      "TASK_CENTER_STATUSES",
      "admission",
      "cthssv",
      "training",
      "finance",
      "hou",
      "control",
      "general",
      "lead_demo_ref_001",
      "student_demo_ref_001",
      "receivable_demo_ref_001",
      "hou_student_demo_ref_001",
      "workspace_demo_ref_001",
      "role_demo_ref_001",
    ],
    "mock read-model token",
    mockLibPath,
  );

  requireTokens(
    contractTs,
    [
      "TASK_CENTER_SOURCE_REF_ALLOWLIST",
      "TASK_CENTER_STATUSES",
      "TaskCenterVisibleLane",
      "getVisibleTaskCenterLanes",
      "resolveTaskCenterLaneStatus",
      "NO_TASK_MUTATION_ROUTE_CREATED",
      "NO_AI_CALL_NO_AUTOMATION_STEP",
    ],
    "contract dependency token",
    contractTsPath,
  );

  requireTokens(
    component,
    [
      "@/lib/task-center-mock-read-model",
      "getMockTaskCenterTasksForLanes",
      "TASK_CENTER_MOCK_READONLY_LIST",
      "TASK_CENTER_MOCK_DATA_ONLY",
      "TASK_CENTER_NO_TASK_MUTATION",
      "TASK_CENTER_NO_AI_OR_AUTOMATION",
      "data-heu-task-center-mock-readonly-list",
      "data-heu-task-center-mock-boundary",
      "data-heu-task-center-mock-mutation",
      "data-heu-task-center-mock-cost-guard",
      "mockTasks.map",
      "Danh sach mau chi de UAT UI/scope; khong phai task that",
    ],
    "component mock-list wiring token",
    componentPath,
  );

  requireTokens(
    doc,
    [
      "HEU-DATA-006-TASK-CENTER-MOCK-READONLY-LIST",
      "Status: PASS_LOCAL_MOCK_READONLY_LIST",
      "Production status: NO-GO",
      "TASK_CENTER_MOCK_READONLY_LIST",
      "MOCK_DATA_ONLY_NO_DATABASE_READ",
      "NO_TASK_MUTATION_ROUTE_CREATED",
      "NO_AI_CALL_NO_AUTOMATION_STEP",
      "TASK_CENTER_DATABASE_READY: NO_GO",
      "CAN_SUA_IT_DATA_AUDIT_OWNER",
      "no AI call",
      "no automation step",
      "HEU-DATA-007-TASK-CENTER-READONLY-QUERY-PLAN",
      "read-only DB query design",
      "still no mutation and no migration until gates close",
      "check:heu-task-center-readonly-query-plan-readiness",
    ],
    "mock-list doc token",
    docPath,
  );

  requireTokens(
    readModelDoc,
    [
      "HEU-DATA-006-TASK-CENTER-MOCK-READONLY-LIST",
      "mock read-only task list",
      "still no migration and no production mutation",
    ],
    "read-model doc next-slice token",
    readModelDocPath,
  );

  requireTokens(
    queryPlanDoc,
    [
      "HEU-DATA-007-TASK-CENTER-READONLY-QUERY-PLAN",
      "TASK_CENTER_READONLY_QUERY_PLAN_ONLY",
      "SCOPE_FIRST_QUERY_REQUIRED",
      "TASK_CENTER_DATABASE_READY_NO_GO_QUERY_PLAN_ONLY",
      "NO_BROAD_FALLBACK",
      "NO_TASK_MUTATION_ROUTE_CREATED",
      "NO_AI_CALL_NO_AUTOMATION_STEP",
    ],
    "next query-plan doc token",
    queryPlanDocPath,
  );

  requireTokens(
    queryContract,
    [
      "TASK_CENTER_READONLY_QUERY_PLAN_ONLY",
      "TASK_CENTER_READONLY_SCOPE_FILTERS",
      "TASK_CENTER_READONLY_SELECT_COLUMNS",
      "createTaskCenterReadonlyQueryPlan",
      "NO_BROAD_FALLBACK",
    ],
    "next query-plan contract token",
    queryContractPath,
  );

  requireTokens(
    queryPlanChecker,
    [
      "HEU_TASK_CENTER_READONLY_QUERY_PLAN_READY: PASS_LOCAL",
      "TASK_CENTER_DATABASE_READY: NO_GO_QUERY_PLAN_ONLY",
      "NO_RUNTIME_MUTATION: task center readonly query plan checker only",
    ],
    "next query-plan checker token",
    queryPlanCheckerPath,
  );

  requireTokens(
    manifest,
    [
      mockLibPath,
      queryContractPath,
      docPath,
      queryPlanDocPath,
      checkerPath,
      queryPlanCheckerPath,
      "check:heu-task-center-mock-readonly-list-readiness",
      "check:heu-task-center-readonly-query-plan-readiness",
      "node --check scripts/check-heu-task-center-mock-readonly-list-readiness.mjs",
      "node --check scripts/check-heu-task-center-readonly-query-plan-readiness.mjs",
      "npm.cmd run check:heu-task-center-mock-readonly-list-readiness",
      "npm.cmd run check:heu-task-center-readonly-query-plan-readiness",
    ],
    "manifest mock-list token",
    manifestPath,
  );

  requireTokens(
    readModelChecker,
    [
      "HEU-DATA-006-TASK-CENTER-MOCK-READONLY-LIST",
      "check:heu-task-center-mock-readonly-list-readiness",
      mockLibPath,
      docPath,
      checkerPath,
    ],
    "read-model checker mock-list token",
    readModelCheckerPath,
  );

  if (packageJson.scripts?.[checkerAlias] !== checkerCommand) {
    fail(`${packagePath}: missing or mismatched ${checkerAlias}`);
  }

  if (packageJson.scripts?.[queryPlanCheckerAlias] !== queryPlanCheckerCommand) {
    fail(`${packagePath}: missing or mismatched ${queryPlanCheckerAlias}`);
  }

  requireTokens(
    checkerScript,
    [
      "existsSync",
      "readFileSync",
      "HEU_TASK_CENTER_MOCK_READONLY_LIST_READY: PASS_LOCAL",
      "TASK_CENTER_DATABASE_READY: NO_GO_MOCK_ONLY",
      "NO_RUNTIME_MUTATION: task center mock readonly list checker only; no database read, table creation, SQL migration, task write, AI call, paid automation, deploy, finance action or production GO",
    ],
    "checker-script read-only token",
    checkerPath,
  );

  forbidPatterns(
    `${mockLib}\n${component}\n${doc}`,
    [
      { label: "Supabase client import", pattern: /@\/lib\/supabase/ },
      { label: "createClient", pattern: /\bcreateClient\s*\(/ },
      { label: "supabase.from", pattern: /supabase\s*\.\s*from\s*\(/ },
      { label: "insert", pattern: /\.insert\s*\(/ },
      { label: "update", pattern: /\.update\s*\(/ },
      { label: "upsert", pattern: /\.upsert\s*\(/ },
      { label: "delete", pattern: /\.delete\s*\(/ },
      { label: "fetch call", pattern: /\bfetch\s*\(/ },
      { label: "server action marker", pattern: /["']use server["']/ },
      { label: "SQL create table statement", pattern: /\bcreate\s+table\b/i },
      { label: "SQL alter table statement", pattern: /\balter\s+table\b/i },
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
      {
        label: "email-like raw PII",
        pattern: /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i,
      },
      {
        label: "phone-like raw PII",
        pattern: /\b0\d{9,10}\b/,
      },
    ],
    "runtime data, SQL, secret, PII or mutation API",
    "task-center mock readonly list scope",
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
  console.error("HEU Task Center mock readonly list readiness check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("HEU Task Center mock readonly list readiness check");
console.log("HEU_TASK_CENTER_MOCK_READONLY_LIST_READY: PASS_LOCAL");
console.log("TASK_CENTER_DATABASE_READY: NO_GO_MOCK_ONLY");
console.log(
  "NO_RUNTIME_MUTATION: task center mock readonly list checker only; no database read, table creation, SQL migration, task write, AI call, paid automation, deploy, finance action or production GO",
);
