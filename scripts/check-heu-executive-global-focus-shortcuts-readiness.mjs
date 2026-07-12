import fs from "node:fs";

function read(path) {
  return fs.readFileSync(path, "utf8");
}

function fail(message) {
  console.error(`NO_GO ${message}`);
  process.exit(1);
}

function requireText(text, pattern, label, path) {
  const ok =
    typeof pattern === "string" ? text.includes(pattern) : pattern.test(text);

  if (!ok) {
    fail(`${label} missing in ${path}`);
  }

  console.log(`READY ${label}`);
}

function requireAllText(text, patterns, label, path) {
  for (const pattern of patterns) {
    const ok =
      typeof pattern === "string" ? text.includes(pattern) : pattern.test(text);

    if (!ok) {
      fail(`${label} missing ${pattern.toString()} in ${path}`);
    }
  }

  console.log(`READY ${label}`);
}

console.log("HEU executive global focus shortcuts readiness check");
console.log(
  "Secrets, raw PII, bank data, vouchers, passwords and signed evidence are never printed by this script.",
);

const appShellPath = "components/layout/app-shell.tsx";
const executiveReadinessPath =
  "scripts/check-heu-executive-dashboard-readiness.mjs";
const blueprintPath = "docs/HEU_STANDARD_SYSTEM_BLUEPRINT_20260703.md";
const implementationLogPath = "docs/HEU_IMPLEMENTATION_LOG.md";
const packageJsonPath = "package.json";

const appShell = read(appShellPath);
const executiveReadiness = read(executiveReadinessPath);
const blueprint = read(blueprintPath);
const implementationLog = read(implementationLogPath);
const packageJson = JSON.parse(read(packageJsonPath));

requireText(
  appShell,
  /data-heu-executive-global-focus-shortcuts="STD-19_EXECUTIVE_GLOBAL_FOCUS_SHORTCUTS"[\s\S]*data-heu-executive-global-focus-shortcuts-boundary="EXECUTIVE_ONLY READ_ONLY_ROUTE_HINT FOCUS_QUERY_PARAM NO_ACCESS_GRANT NO_PERMISSION_EXPANSION NO_STATE_MUTATION NO_APPROVAL_ACTION NO_UAT_ACCEPTANCE NO_EVIDENCE_ACCEPTANCE NO_FINANCE_ACTION NO_OWNER_GO NO_PRODUCTION_GO"[\s\S]*data-heu-executive-global-focus-shortcuts-overflow-guard="STD-19_NO_OVERFLOW"/,
  "APP-SHELL-STD19-GLOBAL-FOCUS-SHORTCUTS-ANCHOR",
  appShellPath,
);
requireAllText(
  appShell,
  [
    "buildExecutiveFocusQuickLinks",
    "isExecutiveRole(currentRoleCode)",
    "isExecutive",
    "executiveFocusQuickLinks",
    "Tổng quan",
    "Báo cáo",
    "Tài chính",
    "Bằng chứng",
    "Phân quyền",
    "Pháp chế",
    "M01-M12",
    "Blocker",
    'href: focusHref("roles")',
    '?focus=${mode}',
    "EXECUTIVE_ONLY",
    "READ_ONLY_ROUTE_HINT",
    "PASS_LOCAL_EXECUTIVE_ROLE_SCOPE",
    "FOCUS_QUERY_PARAM",
    "NO_ACCESS_GRANT",
    "NO_PERMISSION_EXPANSION",
    "NO_STATE_MUTATION",
    "NO_APPROVAL_ACTION",
    "NO_UAT_ACCEPTANCE",
    "NO_EVIDENCE_ACCEPTANCE",
    "NO_FINANCE_ACTION",
    "NO_OWNER_GO",
    "NO_PRODUCTION_GO",
    "STD-20_EXECUTIVE_FOCUS_LANE_SEPARATION",
    "SEPARATE_FROM_WORKSPACE",
    "P0-13_WORKSPACE_QUICK_LINKS_NO_OVERFLOW",
    "overflow-x-auto",
    "truncate",
  ],
  "APP-SHELL-STD19-GLOBAL-FOCUS-SHORTCUTS-TOKENS",
  appShellPath,
);
requireText(
  appShell,
  /const executiveFocusQuickLinks = isExecutive[\s\S]*buildExecutiveFocusQuickLinks\(workspace\?\.activeSegmentId \?\? null\)[\s\S]*executiveFocusQuickLinks\.length > 0 \? \([\s\S]*data-heu-executive-global-focus-shortcuts="STD-19_EXECUTIVE_GLOBAL_FOCUS_SHORTCUTS"[\s\S]*\) : null\}[\s\S]*workspaceQuickLinks\.length > 0 \? \([\s\S]*data-heu-workspace-quick-links="P0-13_WORKSPACE_QUICK_LINKS"/,
  "APP-SHELL-STD19-SEPARATE-EXECUTIVE-LANE",
  appShellPath,
);
requireAllText(
  executiveReadiness,
  [
    "APP-SHELL-EXECUTIVE-GLOBAL-FOCUS-SHORTCUTS-ANCHOR",
    "APP-SHELL-EXECUTIVE-GLOBAL-FOCUS-SHORTCUTS-TOKENS",
    "PASS_LOCAL_GLOBAL_FOCUS_SHORTCUTS",
    "PASS_LOCAL_EXECUTIVE_ROLE_SCOPE",
    "check:heu-executive-global-focus-shortcuts-readiness",
  ],
  "EXECUTIVE-READINESS-STD19",
  executiveReadinessPath,
);
requireAllText(
  blueprint,
  [
    "STD-19",
    "STD-19_EXECUTIVE_GLOBAL_FOCUS_SHORTCUTS",
    "PASS_LOCAL_GLOBAL_FOCUS_SHORTCUTS",
    "EXECUTIVE_ONLY",
    "READ_ONLY_ROUTE_HINT",
    "NO_ACCESS_GRANT",
    "NO_PERMISSION_EXPANSION",
  ],
  "BLUEPRINT-STD19-GLOBAL-FOCUS-SHORTCUTS",
  blueprintPath,
);
requireAllText(
  implementationLog,
  [
    "STD-19 Executive Global Focus Shortcuts",
    'data-heu-executive-global-focus-shortcuts="STD-19_EXECUTIVE_GLOBAL_FOCUS_SHORTCUTS"',
    "Tổng quan",
    "Báo cáo",
    "Tài chính",
    "Bằng chứng",
    "Phân quyền",
    "Pháp chế",
    "M01-M12",
    "Blocker",
    "focus=roles",
    "check:heu-executive-global-focus-shortcuts-readiness",
    "PASS_LOCAL_GLOBAL_FOCUS_SHORTCUTS",
    "PASS_LOCAL_EXECUTIVE_ROLE_SCOPE",
    "does not grant access",
    "mark production GO",
  ],
  "IMPLEMENTATION-LOG-STD19",
  implementationLogPath,
);

if (
  packageJson.scripts?.[
    "check:heu-executive-global-focus-shortcuts-readiness"
  ] !== "node scripts/check-heu-executive-global-focus-shortcuts-readiness.mjs"
) {
  fail(
    "package.json missing check:heu-executive-global-focus-shortcuts-readiness script",
  );
}

console.log("READY PACKAGE-SCRIPT");
console.log(
  "HEU_EXECUTIVE_GLOBAL_FOCUS_SHORTCUTS_READY / NO_GO / BLOCKED: PASS_LOCAL_GLOBAL_FOCUS_SHORTCUTS. This check verifies executive read-only focus shortcuts only; it does not grant access, expand permissions, mutate workflow state, execute UAT, accept evidence, approve finance action, approve owner GO/NO-GO or mark production GO.",
);
