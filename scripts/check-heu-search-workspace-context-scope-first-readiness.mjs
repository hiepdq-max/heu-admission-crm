import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const failures = [];

const searchPath = "app/search/page.tsx";
const contextPath = "lib/heu-workspace-context.ts";
const docPath =
  "docs/HEU_CONTROL/HEU_SEARCH_002_WORKSPACE_CONTEXT_SCOPE_FIRST_RUNTIME_20260710.md";
const packagePath = "package.json";
const checkerPath =
  "scripts/check-heu-search-workspace-context-scope-first-readiness.mjs";
const checkerAlias = "check:heu-search-workspace-context-scope-first-readiness";
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

function requireOrder(contents, orderedTokens, label, file) {
  let cursor = -1;

  for (const token of orderedTokens) {
    const next = contents.indexOf(token, cursor + 1);

    if (next === -1) {
      fail(`${file}: missing ordered ${label}: ${token}`);
      return;
    }

    cursor = next;
  }
}

function forbidPatterns(contents, patterns, label, file) {
  for (const item of patterns) {
    if (item.pattern.test(contents)) {
      fail(`${file}: forbidden ${label}: ${item.label}`);
    }
  }
}

for (const file of [searchPath, contextPath, docPath, packagePath, checkerPath]) {
  requireFile(file);
}

if (failures.length === 0) {
  const searchPage = read(searchPath);
  const context = read(contextPath);
  const doc = read(docPath);
  const checker = read(checkerPath);
  const packageJson = JSON.parse(read(packagePath));

  requireTokens(
    searchPage,
    [
      "getHEUWorkspaceContext",
      "type HEUWorkspaceContext",
      "renderSearchGuardState",
      "has_permission",
      "heu_os.search.read",
      "canReadSearch",
      'workspaceContext.scopeDecision === "BLOCKED"',
      'workspaceContext.scopeDecision === "NO_SCOPE"',
      "!workspaceContext.canSeeAllSegments && !workspace.activeSegmentId",
      "SEARCH_REMOTE_QUERY_LIMIT = 50",
      "p_segment_id: workspace.activeSegmentId",
      "Scoped search RPC chua san sang; broad fallback da bi khoa de tranh tran scope.",
      "workspaceContext.canSeeAllSegments",
      "row.segment_id === workspace.activeSegmentId",
    ],
    "search scope-first token",
    searchPath,
  );

  requireOrder(
    searchPage,
    [
      "const workspaceContext = await getHEUWorkspaceContext",
      "const { data: searchReadAllowed } = await supabase.rpc",
      "if (!canReadSearch)",
      'if (workspaceContext.scopeDecision === "BLOCKED")',
      'if (workspaceContext.scopeDecision === "NO_SCOPE")',
      "if (!workspaceContext.canSeeAllSegments && !workspace.activeSegmentId)",
      'supabase.rpc("search_heu_os"',
      "p_segment_id: workspace.activeSegmentId",
    ],
    "search context-before-query flow",
    searchPath,
  );

  const searchRpcCalls = Array.from(
    searchPage.matchAll(
      /supabase\.rpc\(\s*["']search_heu_os["']\s*,\s*\{([\s\S]*?)\}\s*\)/g,
    ),
  );

  if (searchRpcCalls.length !== 1) {
    fail(`${searchPath}: expected exactly one search_heu_os RPC call`);
  }

  for (const call of searchRpcCalls) {
    if (!call[1].includes("p_segment_id")) {
      fail(`${searchPath}: search_heu_os RPC call is missing p_segment_id`);
    }
  }

  forbidPatterns(
    searchPage,
    [
      { label: "insert mutation", pattern: /\.insert\s*\(/ },
      { label: "update mutation", pattern: /\.update\s*\(/ },
      { label: "upsert mutation", pattern: /\.upsert\s*\(/ },
      { label: "delete mutation", pattern: /\.delete\s*\(/ },
      { label: "service role token", pattern: /service[_-]?role/i },
      { label: "process env access", pattern: /process\.env/ },
      { label: "network fetch", pattern: /\bfetch\s*\(/ },
    ],
    "search route broad fallback, mutation or secret path",
    searchPath,
  );

  requireTokens(
    context,
    [
      "export type HEUWorkspaceContext",
      "scopeDecision: HEUScopeDecision",
      "allowedActions: HEUAllowedActions",
      "noSecretBoundary: true",
      "applyHEUSegmentScope",
    ],
    "HEU workspace context dependency",
    contextPath,
  );

  requireTokens(
    doc,
    [
      "HEU-SEARCH-002-WORKSPACE-CONTEXT-SCOPE-FIRST-RUNTIME",
      "Route | `/search` only",
      "getHEUWorkspaceContext",
      "heu_os.search.read",
      "Broad fallback | Blocked",
      "SEARCH_REMOTE_QUERY_LIMIT = 50",
      "Production remains `NO-GO`",
    ],
    "search control doc token",
    docPath,
  );

  if (packageJson.scripts?.[checkerAlias] !== checkerCommand) {
    fail(`${packagePath}: missing or mismatched ${checkerAlias}`);
  }

  requireTokens(
    checker,
    [
      "existsSync",
      "readFileSync",
      "HEU_SEARCH_WORKSPACE_CONTEXT_SCOPE_FIRST_READY: PASS_LOCAL",
      "NO_SEARCH_SCOPE_OVERFLOW: no broad search fallback, no mutation, no SQL, no migration, no AI runtime, no paid automation, no production GO",
    ],
    "checker-script read-only token",
    checkerPath,
  );

  forbidPatterns(
    checker,
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
      { label: "network fetch", pattern: /\bfetch\s*\(/ },
    ],
    "mutation, network or command-execution API",
    checkerPath,
  );
}

if (failures.length > 0) {
  console.error("HEU search workspace context scope-first readiness failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("HEU Search workspace context scope-first readiness check");
console.log("HEU_SEARCH_WORKSPACE_CONTEXT_SCOPE_FIRST_READY: PASS_LOCAL");
console.log(
  "NO_SEARCH_SCOPE_OVERFLOW: no broad search fallback, no mutation, no SQL, no migration, no AI runtime, no paid automation, no production GO",
);
