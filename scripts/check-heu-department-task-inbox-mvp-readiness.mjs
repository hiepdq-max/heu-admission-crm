import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const failures = [];

const routePath = "app/data-confirmation/page.tsx";
const componentPath = "components/data-confirmation/department-task-inbox.tsx";
const docPath =
  "docs/HEU_CONTROL/HEU_DATA_003_DEPARTMENT_TASK_INBOX_MVP_20260710.md";
const manifestPath =
  "docs/HEU_CONTROL/HEU_APP_SHELL_001_STAGE_FILE_MANIFEST_20260709.md";
const taskCenterDataContractPath =
  "docs/HEU_CONTROL/HEU_DATA_004_TASK_CENTER_DATA_CONTRACT_20260710.md";
const taskCenterReadModelPath = "lib/task-center-contract.ts";
const dctcCheckerPath = "scripts/check-heu-data-confirmation-task-center.mjs";
const checkerPath = "scripts/check-heu-department-task-inbox-mvp-readiness.mjs";
const packagePath = "package.json";
const checkerAlias = "check:heu-department-task-inbox-mvp-readiness";
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
  routePath,
  componentPath,
  docPath,
  taskCenterDataContractPath,
  taskCenterReadModelPath,
  manifestPath,
  dctcCheckerPath,
  checkerPath,
  packagePath,
]) {
  requireFile(file);
}

if (failures.length === 0) {
  const route = read(routePath);
  const component = read(componentPath);
  const doc = read(docPath);
  const taskCenterDataContract = read(taskCenterDataContractPath);
  const taskCenterReadModel = read(taskCenterReadModelPath);
  const manifest = read(manifestPath);
  const dctcChecker = read(dctcCheckerPath);
  const checkerScript = read(checkerPath);
  const packageJson = JSON.parse(read(packagePath));

  requireTokens(
    route,
    [
      "DepartmentTaskInbox",
      "@/components/data-confirmation/department-task-inbox",
      "scopeDecision={heuWorkspace.scopeDecision}",
      "actionGate={heuWorkspace.actionGate}",
      "visibleSegmentCount={heuWorkspace.visibleSegmentIds.length}",
    ],
    "route wiring token",
    routePath,
  );

  requireTokens(
    component,
    [
      "HEU_DEPARTMENT_TASK_INBOX_MVP",
      "ROLE_WORKSPACE_SCOPE_FILTERED",
      "REF_ONLY_NO_RAW_PII_NO_MUTATION",
      "NO_AI_CALL_NO_AUTOMATION_STEP",
      "NO_GO_SCOPE",
      "DRAFT_READY",
      "READ_ONLY",
      "HEU_TASK_CENTER_READ_MODEL_INTERFACE",
      "withAdmissionSegmentParam",
      "getVisibleTaskCenterLanes",
      "resolveTaskCenterLaneStatus",
      "Khong dung inbox nay de phe duyet",
    ],
    "component token",
    componentPath,
  );

  forbidPatterns(
    component,
    [
      { label: "supabase.from", pattern: /supabase\s*\.\s*from\s*\(/ },
      { label: "insert", pattern: /\.insert\s*\(/ },
      { label: "update", pattern: /\.update\s*\(/ },
      { label: "upsert", pattern: /\.upsert\s*\(/ },
      { label: "delete", pattern: /\.delete\s*\(/ },
      { label: "server action marker", pattern: /["']use server["']/ },
      { label: "fetch call", pattern: /\bfetch\s*\(/ },
    ],
    "runtime data or mutation API",
    componentPath,
  );

  requireTokens(
    doc,
    [
      "HEU-DATA-003-DEPARTMENT-TASK-INBOX-MVP",
      "Status: PASS_LOCAL_TASK_INBOX_MVP",
      "Production status: NO-GO",
      "HEU_DEPARTMENT_TASK_INBOX_MVP",
      "ROLE_WORKSPACE_SCOPE_FILTERED",
      "REF_ONLY_NO_RAW_PII_NO_MUTATION",
      "NO_AI_CALL_NO_AUTOMATION_STEP",
      "HEU-DATA-004-TASK-CENTER-DATA-CONTRACT",
      "Task Center data contract before any task mutation",
      "Cost Guard",
      "CAN_SUA_IT_DATA_AUDIT",
      "NO_GO` for production Task Center",
    ],
    "control doc token",
    docPath,
  );

  requireTokens(
    taskCenterDataContract,
    [
      "HEU-DATA-004-TASK-CENTER-DATA-CONTRACT",
      "Status: PASS_LOCAL_DATA_CONTRACT",
      "NO_EXECUTABLE_MIGRATION_CREATED",
      "TASK_CENTER_DATABASE_READY: NO_GO",
    ],
    "task-center data contract dependency token",
    taskCenterDataContractPath,
  );

  requireTokens(
    taskCenterReadModel,
    [
      "TASK_CENTER_READ_MODEL_INTERFACE_CONTRACT_ONLY",
      "TASK_CENTER_ROLE_GROUPS",
      "TASK_CENTER_DEPARTMENT_LANES",
      "TASK_CENTER_SOURCE_REF_ALLOWLIST",
      "NO_MATCHING_SCOPE",
      "canManageSystemScope",
      "canReadScopedData",
      "getVisibleTaskCenterLanes",
      "resolveTaskCenterLaneStatus",
    ],
    "task-center read-model dependency token",
    taskCenterReadModelPath,
  );

  requireTokens(
    manifest,
    [
      componentPath,
      docPath,
      taskCenterDataContractPath,
      taskCenterReadModelPath,
      checkerPath,
      "check:heu-task-center-read-model-interface-readiness",
      "check:heu-task-center-data-contract-readiness",
      "check:heu-department-task-inbox-mvp-readiness",
    ],
    "manifest token",
    manifestPath,
  );

  requireTokens(
    dctcChecker,
    [
      "departmentTaskInbox",
      componentPath,
      "HEU_DEPARTMENT_TASK_INBOX_MVP",
      "ROLE_WORKSPACE_SCOPE_FILTERED",
      "REF_ONLY_NO_RAW_PII_NO_MUTATION",
      "NO_AI_CALL_NO_AUTOMATION_STEP",
    ],
    "DCTC checker token",
    dctcCheckerPath,
  );

  if (packageJson.scripts?.[checkerAlias] !== checkerCommand) {
    fail(`${packagePath}: missing or mismatched ${checkerAlias}`);
  }

  requireTokens(
    checkerScript,
    [
      "existsSync",
      "readFileSync",
      "HEU_DEPARTMENT_TASK_INBOX_MVP_READY: PASS_LOCAL",
      "TASK_CENTER_PRODUCTION_READY: NO_GO_DATABASE_CONTRACT_OWNER_AUDIT_REQUIRED",
      "NO_RUNTIME_MUTATION: department task inbox MVP checker only; no database mutation, task write, AI call, paid automation, migration, deploy, finance action or production GO",
    ],
    "checker-script read-only token",
    checkerPath,
  );

  forbidPatterns(
    `${route}\n${component}\n${doc}`,
    [
      {
        label: "actual Supabase URL assignment",
        pattern: /NEXT_PUBLIC_SUPABASE_URL\s*=\s*\S+/,
      },
      {
        label: "actual publishable key assignment",
        pattern: /NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY\s*=\s*\S+/,
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
    "secret material",
    "department task inbox scope",
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
  console.error("HEU department task inbox MVP readiness check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("HEU department task inbox MVP readiness check");
console.log("HEU_DEPARTMENT_TASK_INBOX_MVP_READY: PASS_LOCAL");
console.log(
  "TASK_CENTER_PRODUCTION_READY: NO_GO_DATABASE_CONTRACT_OWNER_AUDIT_REQUIRED",
);
console.log(
  "NO_RUNTIME_MUTATION: department task inbox MVP checker only; no database mutation, task write, AI call, paid automation, migration, deploy, finance action or production GO",
);
