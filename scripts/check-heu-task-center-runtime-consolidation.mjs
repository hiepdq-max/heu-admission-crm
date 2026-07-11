import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const files = {
  page: "app/data-confirmation/page.tsx",
  inbox: "components/data-confirmation/department-task-inbox.tsx",
  contract: "lib/task-center-contract.ts",
  mock: "lib/task-center-mock-read-model.ts",
  gate: "lib/task-center-readonly-adapter-enablement-gate.ts",
  adapter: "lib/task-center-readonly-adapter-skeleton.ts",
  query: "lib/task-center-readonly-query-contract.ts",
  fallback: "lib/task-center-ui-fallback-source.ts",
};

const contents = new Map();
const failures = [];

for (const [label, relativePath] of Object.entries(files)) {
  const absolutePath = path.join(repoRoot, relativePath);
  if (!existsSync(absolutePath)) {
    failures.push(`${label}: missing ${relativePath}`);
    continue;
  }
  contents.set(label, readFileSync(absolutePath, "utf8"));
}

function requireTokens(label, tokens) {
  const content = contents.get(label) ?? "";
  const missing = tokens.filter((token) => !content.includes(token));
  if (missing.length > 0) {
    failures.push(`${label}: missing ${missing.join(", ")}`);
  }
}

requireTokens("page", [
  "DepartmentTaskInbox",
  "getHEUWorkspaceContext",
  "READ_ONLY_NO_REAL_DATA_MUTATION",
]);
requireTokens("inbox", [
  "createTaskCenterUiFallbackSource",
  "TASK_CENTER_MOCK_READONLY_FALLBACK_ACTIVE",
  "ROLE_WORKSPACE_SCOPE_FILTERED",
  "NO_AI_CALL_NO_AUTOMATION_STEP",
]);
requireTokens("contract", [
  "TASK_CENTER_READ_MODEL_CONTRACT_ONLY",
  "TASK_CENTER_NO_MUTATION_ROUTE_CREATED",
]);
requireTokens("mock", [
  "TASK_CENTER_MOCK_READONLY_LIST",
  "TASK_CENTER_MOCK_DATA_ONLY",
]);
requireTokens("query", [
  "SCOPE_FIRST_QUERY_REQUIRED",
  "NO_BROAD_FALLBACK",
  "TASK_CENTER_READONLY_PAGE_SIZE_LIMIT = 50",
]);
requireTokens("adapter", [
  "DISABLED_BY_DEFAULT",
  "rows: []",
  "NO_DATABASE_READ_EXECUTED",
]);
requireTokens("gate", [
  'decision: "NO_GO"',
  "canEnableDatabaseRead: false",
  "OWNER_REVIEW_REQUIRED_BEFORE_DB_READ",
]);
requireTokens("fallback", [
  "MOCK_READONLY_FALLBACK_ACTIVE",
  "adapterRows: adapter.rows",
  "NO_DATABASE_CLIENT_CREATED",
]);

const guardedRuntime = [
  contents.get("inbox") ?? "",
  contents.get("contract") ?? "",
  contents.get("mock") ?? "",
  contents.get("gate") ?? "",
  contents.get("adapter") ?? "",
  contents.get("query") ?? "",
  contents.get("fallback") ?? "",
].join("\n");

const forbiddenPatterns = [
  ["Supabase client", /createClient|supabase/i],
  ["database query", /\.from\s*\(/],
  ["database mutation", /\.(?:insert|update|upsert|delete|rpc)\s*\(/],
  ["network call", /\bfetch\s*\(/],
  ["AI runtime", /OpenAI|Anthropic|GoogleGenerativeAI/],
  ["runtime feature flag", /process\.env/],
  ["mojibake", /Ã|Â|Æ|á»|áº|Ä/],
];

for (const [label, pattern] of forbiddenPatterns) {
  if (pattern.test(guardedRuntime)) {
    failures.push(`runtime: forbidden ${label}`);
  }
}

if (failures.length > 0) {
  for (const failure of failures) {
    console.error(`HEU-TASK-CENTER: NO_GO - ${failure}`);
  }
  process.exit(1);
}

console.log("HEU_TASK_CENTER_RUNTIME_CONSOLIDATION: PASS_LOCAL");
console.log("Database read/mutation: NO_GO");
console.log("AI/paid automation: NO_GO");
console.log("Production: NO_GO");
