import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const requiredFiles = {
  route: "app/data-confirmation/page.tsx",
  departmentTaskInbox: "components/data-confirmation/department-task-inbox.tsx",
  appShell: "components/layout/app-shell.tsx",
  taskCenterReadModel: "lib/task-center-contract.ts",
  dashboard: "components/dashboard/dashboard-overview.tsx",
  workspaceContext: "lib/heu-workspace-context.ts",
  appShellDecision:
    "docs/HEU_CONTROL/HEU_APP_SHELL_001_MODULAR_MONOLITH_DECISION_20260709.md",
  draftPrHandoff:
    "docs/HEU_CONTROL/HEU_APP_SHELL_001_DRAFT_PR_HANDOFF_20260709.md",
  draftPrBody: "docs/HEU_CONTROL/HEU_APP_SHELL_001_DRAFT_PR_BODY_20260709.md",
  userPilot:
    "docs/HEU_CONTROL/HEU_USER_PILOT_001_REAL_USER_UAT_REGISTER_20260709.md",
};
const statuses = [];

function addStatus(code, status, detail) {
  statuses.push({ code, status, detail });
}

function readRequiredFile(label, relativePath) {
  const filePath = path.join(repoRoot, relativePath);

  if (!existsSync(filePath)) {
    addStatus(label, "NO_GO", `Missing required file: ${relativePath}`);
    return "";
  }

  return readFileSync(filePath, "utf8");
}

function requireTokens(code, content, tokens) {
  const missing = tokens.filter((token) => !content.includes(token));

  addStatus(
    code,
    missing.length === 0 ? "PASS" : "NO_GO",
    missing.length === 0
      ? "All required tokens are present."
      : `Missing tokens: ${missing.join(", ")}`,
  );
}

function forbidPattern(code, content, patterns) {
  const hits = patterns
    .filter(({ pattern }) => pattern.test(content))
    .map(({ label }) => label);

  addStatus(
    code,
    hits.length === 0 ? "PASS" : "NO_GO",
    hits.length === 0
      ? "No forbidden operation found."
      : `Forbidden operation found: ${hits.join(", ")}`,
  );
}

const route = readRequiredFile("DCTC-FILE-ROUTE", requiredFiles.route);
const departmentTaskInbox = readRequiredFile(
  "DCTC-FILE-DEPARTMENT-TASK-INBOX",
  requiredFiles.departmentTaskInbox,
);
const appShell = readRequiredFile("DCTC-FILE-APP-SHELL", requiredFiles.appShell);
const taskCenterReadModel = readRequiredFile(
  "DCTC-FILE-TASK-CENTER-READ-MODEL",
  requiredFiles.taskCenterReadModel,
);
const dashboard = readRequiredFile("DCTC-FILE-DASHBOARD", requiredFiles.dashboard);
const workspaceContext = readRequiredFile(
  "DCTC-FILE-WORKSPACE-CONTEXT",
  requiredFiles.workspaceContext,
);
const appShellDecision = readRequiredFile(
  "DCTC-FILE-APP-SHELL-DECISION",
  requiredFiles.appShellDecision,
);
const draftPrHandoff = readRequiredFile(
  "DCTC-FILE-DRAFT-PR-HANDOFF",
  requiredFiles.draftPrHandoff,
);
const draftPrBody = readRequiredFile(
  "DCTC-FILE-DRAFT-PR-BODY",
  requiredFiles.draftPrBody,
);
const userPilot = readRequiredFile("DCTC-FILE-USER-PILOT", requiredFiles.userPilot);

requireTokens("DCTC-ROUTE-SCOPE-FIRST", route, [
  "getHEUWorkspaceContext",
  "DepartmentTaskInbox",
  "scopeDecision={heuWorkspace.scopeDecision}",
  "actionGate={heuWorkspace.actionGate}",
  "includeActionPermissions: true",
  "HEU_DATA_CONFIRMATION_TASK_CENTER",
  "HEU_WORKSPACE_CONTEXT_SCOPE_FIRST",
  "READ_ONLY_NO_REAL_DATA_MUTATION",
  "CHO_XAC_NHAN_DUNG_CAN_SUA_KHONG_THUOC_TOI_DA_KHOA",
]);

requireTokens("DCTC-ROUTE-STATUS-CONTRACT", route, [
  "CHO_XAC_NHAN",
  "DUNG",
  "CAN_SUA",
  "KHONG_THUOC_TOI",
  "DA_KHOA",
]);

forbidPattern("DCTC-ROUTE-NO-DATABASE-QUERY", route, [
  { label: "supabase.from", pattern: /supabase\s*\.\s*from\s*\(/ },
  { label: "insert", pattern: /\.insert\s*\(/ },
  { label: "update", pattern: /\.update\s*\(/ },
  { label: "upsert", pattern: /\.upsert\s*\(/ },
  { label: "delete", pattern: /\.delete\s*\(/ },
]);

forbidPattern("DCTC-ROUTE-NO-PRODUCTION-ACTION", route, [
  { label: "revalidatePath", pattern: /\brevalidatePath\s*\(/ },
  { label: "redirect after mutation", pattern: /redirect\s*\(\s*["']\/data-confirmation/ },
  { label: "server action marker", pattern: /["']use server["']/ },
]);

requireTokens("DCTC-DEPARTMENT-TASK-INBOX-MVP", departmentTaskInbox, [
  "HEU_DEPARTMENT_TASK_INBOX_MVP",
  "ROLE_WORKSPACE_SCOPE_FILTERED",
  "REF_ONLY_NO_RAW_PII_NO_MUTATION",
  "NO_AI_CALL_NO_AUTOMATION_STEP",
  "NO_GO_SCOPE",
  "DRAFT_READY",
  "READ_ONLY",
  "withAdmissionSegmentParam",
  "HEU_TASK_CENTER_READ_MODEL_INTERFACE",
  "getVisibleTaskCenterLanes",
]);

forbidPattern("DCTC-DEPARTMENT-TASK-INBOX-NO-MUTATION", departmentTaskInbox, [
  { label: "supabase.from", pattern: /supabase\s*\.\s*from\s*\(/ },
  { label: "insert", pattern: /\.insert\s*\(/ },
  { label: "update", pattern: /\.update\s*\(/ },
  { label: "upsert", pattern: /\.upsert\s*\(/ },
  { label: "delete", pattern: /\.delete\s*\(/ },
  { label: "fetch call", pattern: /\bfetch\s*\(/ },
  { label: "server action marker", pattern: /["']use server["']/ },
]);

requireTokens("DCTC-TASK-CENTER-READ-MODEL", taskCenterReadModel, [
  "TASK_CENTER_READ_MODEL_INTERFACE_CONTRACT_ONLY",
  "TASK_CENTER_ROLE_GROUPS",
  "TASK_CENTER_DEPARTMENT_LANES",
  "TASK_CENTER_SOURCE_REF_ALLOWLIST",
  "NO_MATCHING_SCOPE",
  "canManageSystemScope",
  "canReadScopedData",
  "getVisibleTaskCenterLanes",
  "resolveTaskCenterLaneStatus",
]);

requireTokens("DCTC-APP-SHELL-MENU", appShell, [
  'label: "Viec cua toi"',
  'href: "/data-confirmation"',
  'key: "data-confirmation"',
  'withAdmissionSegmentParam("/data-confirmation", segmentId)',
  "HEU_APP_SHELL_TASK_CENTER_PERMISSIONS",
  "allowedRoleCodes: HEU_APP_SHELL_ALL_WORK_ROLE_CODES",
  'data-heu-app-shell-role-scope-menu="HEU_APP_SHELL_ROLE_SCOPE_MENU"',
  "hasAccessRule",
  "HEU_APP_SHELL_LEAD_WRITE_PERMISSIONS.some",
]);

requireTokens("DCTC-DASHBOARD-QUICK-LINK", dashboard, [
  "withAdmissionSegmentParam(",
  '"/data-confirmation"',
  "taskCenterHref",
  "Viec cua toi",
  "canWriteInWorkspace",
]);

requireTokens("DCTC-WORKSPACE-CONTEXT-GATES", workspaceContext, [
  "canReadScopedData",
  "canReviewScopedDraft",
  "financeMutationRequiresModuleGate: true",
  "productionApprovalRequiresHumanGate: true",
  "noBroadFallback: true",
]);

requireTokens("DCTC-CONTROL-DOCS", `${appShellDecision}\n${userPilot}`, [
  "Data Confirmation route",
  "read-only/ref-only",
  "task mutations remain blocked",
  "Production status: NO-GO",
]);

requireTokens("DCTC-DRAFT-PR-HANDOFF", draftPrHandoff, [
  "DRAFT_PR_READY",
  "IT_DATA",
  "Audit",
  "Rollback",
  "Production status: NO-GO",
  "Create Draft PR after explicit user approval",
]);

requireTokens("DCTC-DRAFT-PR-BODY", draftPrBody, [
  "Suggested PR title",
  "Phạm vi thay đổi",
  "Rủi ro",
  "Cách test",
  "Rollback",
  "Evidence / bằng chứng",
  "PR phải để Draft",
  "Production remains `NO-GO`",
]);

for (const { code, status, detail } of statuses) {
  console.log(`${code}: ${status} - ${detail}`);
}

const failed = statuses.some(({ status }) => status !== "PASS");

if (failed) {
  console.error("HEU_DATA_CONFIRMATION_TASK_CENTER: NO_GO");
  process.exit(1);
}

console.log("HEU_DATA_CONFIRMATION_TASK_CENTER: PASS_LOCAL");
