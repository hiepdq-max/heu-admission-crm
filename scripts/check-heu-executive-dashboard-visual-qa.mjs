import fs from "node:fs";
import http from "node:http";
import https from "node:https";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

function normalizeHostname(hostname) {
  return hostname.replace(/^\[|\]$/g, "").toLowerCase();
}

function assertLocalBaseUrl(value) {
  const url = new URL(value);
  const hostname = normalizeHostname(url.hostname);

  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error(`HEU_BASE_URL must use http or https: ${value}`);
  }

  if (url.username || url.password) {
    throw new Error("HEU_BASE_URL must not include credentials.");
  }

  if (!LOCAL_HOSTS.has(hostname)) {
    throw new Error(
      `HEU_BASE_URL must be local-only for PASS_LOCAL visual QA: ${value}`,
    );
  }

  return url;
}

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

function requestHome(baseUrl) {
  const url = new URL("/", baseUrl);
  const client = url.protocol === "https:" ? https : http;

  return new Promise((resolve, reject) => {
    const request = client.request(
      url,
      {
        method: "GET",
        timeout: 20_000,
      },
      (response) => {
        let body = "";
        response.setEncoding("utf8");
        response.on("data", (chunk) => {
          if (body.length < 512_000) {
            body += chunk;
          }
        });
        response.on("end", () => {
          resolve({
            statusCode: response.statusCode ?? 0,
            location: response.headers.location,
            body,
          });
        });
      },
    );

    request.on("timeout", () => {
      request.destroy(new Error("Timed out after 20s: /"));
    });
    request.on("error", reject);
    request.end();
  });
}

function isLoginRedirect(result) {
  if (result.statusCode < 300 || result.statusCode >= 400) {
    return false;
  }

  if (!result.location) {
    return false;
  }

  const location = new URL(result.location, baseUrl);
  return location.origin === baseUrl.origin && location.pathname === "/login";
}

function formatError(error) {
  if (error instanceof AggregateError) {
    return error.errors.map(formatError).filter(Boolean).join("; ");
  }

  if (error instanceof Error) {
    const code = "code" in error ? error.code : "";
    return [code, error.message].filter(Boolean).join(": ");
  }

  return String(error);
}

console.log("HEU executive dashboard visual QA guard");
console.log(
  "Secrets, passwords, emails, raw PII, cookies, bank data and voucher data are never printed by this script.",
);

const baseUrl = assertLocalBaseUrl(
  process.env.HEU_BASE_URL ?? "http://localhost:3000",
);

const executiveDashboardPath =
  "components/dashboard/executive-dashboard-overview.tsx";
const readinessPath = "scripts/check-heu-executive-dashboard-readiness.mjs";
const blueprintPath = "docs/HEU_STANDARD_SYSTEM_BLUEPRINT_20260703.md";
const implementationLogPath = "docs/HEU_IMPLEMENTATION_LOG.md";
const packageJsonPath = "package.json";

const executiveDashboard = read(executiveDashboardPath);
const readiness = read(readinessPath);
const blueprint = read(blueprintPath);
const implementationLog = read(implementationLogPath);
const packageJson = JSON.parse(read(packageJsonPath));

requireText(
  executiveDashboard,
  /data-heu-executive-visual-qa="STD-09_EXECUTIVE_VISUAL_QA_SOURCE_GUARD"[\s\S]*data-heu-executive-visual-qa-boundary="PASS_LOCAL_VISUAL_QA AUTH_REQUIRED NO_SCREENSHOT_CLAIM NO_UAT_ACCEPTANCE NO_APPROVAL_ACTION NO_PRODUCTION_GO"[\s\S]*data-heu-executive-visual-qa-viewports="desktop_1440 mobile_390"/,
  "EXEC-DASHBOARD-VISUAL-QA-ANCHOR",
  executiveDashboardPath,
);
requireAllText(
  executiveDashboard,
  [
    'data-heu-executive-section-navigator="STD-07_EXECUTIVE_SECTION_NAVIGATOR"',
    'data-heu-executive-active-focus-header="STD-30_EXECUTIVE_ACTIVE_FOCUS_HEADER"',
    'data-heu-executive-operating-brain-completion="STD-43_EXECUTIVE_OPERATING_BRAIN_COMPLETION_GATE"',
    'data-heu-executive-effective-access-readonly="STD-44_EXECUTIVE_EFFECTIVE_ACCESS_READONLY_GATE"',
    'data-heu-executive-focus-scoped-navigator="STD-22_EXECUTIVE_FOCUS_SCOPED_NAVIGATOR"',
    'data-heu-executive-report-source-map-triage="STD-24_EXECUTIVE_REPORT_SOURCE_MAP_TRIAGE"',
    'data-heu-executive-report-dashboard-scope-contract="STD-39_EXECUTIVE_REPORT_DASHBOARD_SCOPE_CONTRACT"',
    'data-heu-executive-role-scope-decision="STD-23_EXECUTIVE_ROLE_SCOPE_DECISION_STRIP"',
    'data-heu-executive-dashboard-scope-visibility="STD-37_EXECUTIVE_DASHBOARD_SCOPE_VISIBILITY_INVARIANT"',
    'data-heu-executive-dashboard-permission-matrix="STD-38_EXECUTIVE_DASHBOARD_PERMISSION_MATRIX"',
    'data-heu-executive-responsive-density="STD-08_RESPONSIVE_DENSITY_SECTION_ORDER"',
    'data-heu-executive-priority-focus="STD-11_EXECUTIVE_PRIORITY_FOCUS_RAIL"',
    'data-heu-executive-priority-command-strip="STD-29_EXECUTIVE_PRIORITY_COMMAND_STRIP"',
    'data-heu-executive-focus-mode="STD-17_EXECUTIVE_FOCUS_MODE"',
    'data-heu-executive-focus-next-action="STD-18_EXECUTIVE_FOCUS_NEXT_ACTION"',
    'data-heu-executive-legal-sop-evidence-authority-queue="STD-40_EXECUTIVE_LEGAL_SOP_EVIDENCE_AUTHORITY_QUEUE"',
    'data-heu-executive-legal-sop-triage="STD-25_EXECUTIVE_LEGAL_SOP_TRIAGE"',
    'data-heu-executive-legal-sop-authority-checklist="STD-14_LEGAL_SOP_AUTHORITY_CHECKLIST"',
    'data-heu-executive-finance-reliance-fast-index="STD-35_EXECUTIVE_FINANCE_RELIANCE_FAST_INDEX"',
    'data-heu-executive-finance-readonly-reliance-lock="STD-41_EXECUTIVE_FINANCE_READONLY_RELIANCE_LOCK"',
    'data-heu-executive-finance-reliance-triage="STD-26_EXECUTIVE_FINANCE_RELIANCE_TRIAGE"',
    'data-heu-executive-finance-source-contract="STD-15_FINANCE_RELIANCE_SOURCE_CONTRACT"',
    'data-heu-executive-uat-evidence-closure-triage="STD-27_EXECUTIVE_UAT_EVIDENCE_CLOSURE_TRIAGE"',
    'data-heu-executive-uat-evidence-fast-action="STD-36_EXECUTIVE_UAT_EVIDENCE_FAST_ACTION_QUEUE"',
    'data-heu-executive-uat-evidence-acceptance-lock="STD-42_EXECUTIVE_UAT_EVIDENCE_ACCEPTANCE_LOCK"',
    'data-heu-executive-uat-evidence-route="STD-16_UAT_EVIDENCE_ROUTE_CHECKLIST"',
    'data-heu-executive-production-blocker-triage="STD-28_EXECUTIVE_PRODUCTION_BLOCKER_TRIAGE"',
    'id="executive-overview"',
    'id="executive-section-navigator"',
    'id="executive-focus-next-action"',
    'id="executive-priority-focus"',
    'id="executive-quick-access"',
    'id="executive-report-reliance"',
    'id="executive-finance-readonly"',
    'id="executive-uat-evidence"',
    'id="executive-role-scope"',
    'id="executive-legal-sop"',
    'id="executive-module-maturity"',
    'id="executive-kpis"',
    'id="executive-blockers"',
    'id="executive-admissions-signal"',
    "scroll-mt-24",
    "overflow-x-auto",
    "min-w-0",
    "break-words",
    "truncate",
    "NO_HIDDEN_BLOCKERS",
    "NO_OVERLAP",
    "NO_STATE_MUTATION",
    "VISIBLE_SECTION_LINKS_ONLY",
    "NO_HIDDEN_TARGET_LINK",
    "STD-30 Active focus header",
    "PASS_LOCAL_ACTIVE_FOCUS_HEADER",
    "ACTIVE_FOCUS_VISIBLE",
    "RETURN_TO_ALL",
    "STD-43 Executive operating brain completion gate",
    "PASS_LOCAL_EXECUTIVE_OPERATING_BRAIN_COMPLETION",
    "COMPLETION_GATE",
    "BRAIN-GATE-01",
    "BRAIN-GATE-06",
    "STD-44 Executive effective-access read-only gate",
    "PASS_LOCAL_EXECUTIVE_EFFECTIVE_ACCESS_READONLY_GUARD",
    "LIVE_EXECUTIVE_PERMISSION_NO_GO",
    "EXEC-ACCESS-01",
    "EXEC-ACCESS-06",
    "PASS_LOCAL_REPORT_SOURCE_TRIAGE",
    "REPORT_VIEW_MASTER_CONTRACT",
    "NO_DASHBOARD_RELIANCE",
    "PASS_LOCAL_EXECUTIVE_ROLE_SCOPE",
    "STD-37 Dashboard scope visibility invariant",
    "PASS_LOCAL_DASHBOARD_SCOPE_VISIBILITY",
    "STD-38 Executive dashboard permission matrix",
    "PASS_LOCAL_EXECUTIVE_DASHBOARD_PERMISSION_MATRIX",
    "ROUTE_VISIBILITY_MATRIX",
    "P6-04_ROLE_SCOPE_UAT_PENDING",
    "NEGATIVE_ACCESS_PROOF_PENDING",
    "PASS_LOCAL_LEGAL_SOP_EVIDENCE_AUTHORITY_QUEUE",
    "PASS_LOCAL_LEGAL_SOP_TRIAGE",
    "PASS_LOCAL_FINANCE_RELIANCE_TRIAGE",
    "PASS_LOCAL_UAT_EVIDENCE_TRIAGE",
    "STD-36 UAT/evidence fast action queue",
    "PASS_LOCAL_UAT_EVIDENCE_FAST_ACTION_QUEUE",
    "UAT-FAST-01",
    "UAT-FAST-06",
    "STD-42 UAT/evidence acceptance lock",
    "PASS_LOCAL_UAT_EVIDENCE_ACCEPTANCE_LOCK",
    "ACCEPTANCE_LOCK",
    "UAT-LOCK-01",
    "UAT-LOCK-06",
    "Priority focus",
    "STD-29_EXECUTIVE_PRIORITY_COMMAND_STRIP",
    "PASS_LOCAL_PRIORITY_COMMAND_STRIP",
    "VISIBLE_FOCUS_ONLY",
    "focus={item.focusMode}",
    "Focus mode",
    "STD-17_EXECUTIVE_FOCUS_MODE",
    "FOCUS_QUERY_PARAM",
    "Next action for active focus",
    "STD-18_EXECUTIVE_FOCUS_NEXT_ACTION",
    "READ_ONLY_ROUTE_HINT",
    "STD-24 Report source map triage",
    "STD-39 Report-dashboard scope contract",
    "PASS_LOCAL_REPORT_DASHBOARD_SCOPE_CONTRACT",
    "REPORT_VIEW_TO_DASHBOARD_SCOPE",
    "RPT-SRC-01",
    "RPT-SRC-05",
    "NO-GO visible",
    "STD-40 Evidence-authority queue",
    "LAW-QUEUE-01",
    "LAW-QUEUE-06",
    "EVIDENCE_AUTHORITY_QUEUE",
    "STD-25 Legal/SOP triage",
    "LEGAL-TRIAGE-01",
    "LEGAL-TRIAGE-05",
    "Authority checklist",
    "AUTH-LEGAL-BASIS",
    "AUTH-SIGNER",
    "STD-35 Finance reliance fast index",
    "FIN-IDX-01",
    "FIN-IDX-06",
    "PASS_LOCAL_FINANCE_RELIANCE_FAST_INDEX",
    "STD-41 Finance read-only reliance lock",
    "FIN-LOCK-01",
    "FIN-LOCK-06",
    "PASS_LOCAL_FINANCE_READONLY_RELIANCE_LOCK",
    "RELIANCE_LOCK",
    "STD-26 Finance reliance decision triage",
    "FIN-REL-01",
    "FIN-REL-05",
    "STD-15 Finance reliance source contract",
    "FIN-SRC-01",
    "FIN-SRC-05",
    "UAT/evidence signed route",
    "STD-27 UAT/evidence closure triage",
    "UAT-CLOSE-01",
    "UAT-CLOSE-05",
    "STD-28 Production blocker owner triage",
    "BLK-CLOSE-01",
    "BLK-CLOSE-05",
    "PASS_LOCAL_PRODUCTION_BLOCKER_TRIAGE",
    "UAT-EVID-01",
    "UAT-EVID-05",
    "Executive role/scope decision strip",
    "EXEC-ROLE-01",
    "EXEC-ROLE-04",
  ],
  "EXEC-DASHBOARD-VISUAL-SOURCE-TOKENS",
  executiveDashboardPath,
);
requireAllText(
  readiness,
  [
    "STD-09_EXECUTIVE_VISUAL_QA_SOURCE_GUARD",
    "PASS_LOCAL_VISUAL_QA",
    "NO_SCREENSHOT_CLAIM",
    "check:heu-executive-dashboard-visual-qa",
  ],
  "READINESS-GUARD-STD09",
  readinessPath,
);
requireAllText(
  blueprint,
  [
    "STD-09",
    "STD-09_EXECUTIVE_VISUAL_QA_SOURCE_GUARD",
    "PASS_LOCAL_VISUAL_QA",
    "AUTH_REQUIRED",
    "NO_SCREENSHOT_CLAIM",
  ],
  "BLUEPRINT-STD09-VISUAL-QA",
  blueprintPath,
);
requireAllText(
  implementationLog,
  [
    "STD-09 Executive Dashboard Visual QA Guard",
    "check-heu-executive-dashboard-visual-qa.mjs",
    'data-heu-executive-visual-qa="STD-09_EXECUTIVE_VISUAL_QA_SOURCE_GUARD"',
    "AUTH_REQUIRED",
    "NO_SCREENSHOT_CLAIM",
    "mark production GO",
  ],
  "IMPLEMENTATION-LOG-STD09",
  implementationLogPath,
);

if (
  packageJson.scripts?.["check:heu-executive-dashboard-visual-qa"] !==
  "node scripts/check-heu-executive-dashboard-visual-qa.mjs"
) {
  fail("package.json missing check:heu-executive-dashboard-visual-qa script");
}

console.log("READY PACKAGE-SCRIPT");

let homeResult;
try {
  homeResult = await requestHome(baseUrl);
} catch (error) {
  fail(`VISUAL-RUNTIME-LOCAL-ROUTE unavailable: ${formatError(error)}`);
}

if (isLoginRedirect(homeResult)) {
  console.log(
    `READY VISUAL-RUNTIME-AUTH-REQUIRED ${homeResult.statusCode} / -> /login`,
  );
} else if (homeResult.statusCode >= 200 && homeResult.statusCode < 300) {
  requireAllText(
    homeResult.body,
    [
      "STD-09_EXECUTIVE_VISUAL_QA_SOURCE_GUARD",
      "STD-07_EXECUTIVE_SECTION_NAVIGATOR",
      "STD-08_RESPONSIVE_DENSITY_SECTION_ORDER",
      "STD-11_EXECUTIVE_PRIORITY_FOCUS_RAIL",
      "NO_HIDDEN_BLOCKERS",
      "NO_OVERLAP",
    ],
    "VISUAL-RUNTIME-AUTHENTICATED-DASHBOARD-TOKENS",
    `${baseUrl.origin}/`,
  );
} else {
  fail(`VISUAL-RUNTIME-LOCAL-ROUTE unexpected HTTP ${homeResult.statusCode}`);
}

console.log(
  `EXECUTIVE_DASHBOARD_VISUAL_QA_READY / AUTH_REQUIRED: PASS_LOCAL_VISUAL_QA_GUARD for ${baseUrl.origin}. This check verifies source layout and local auth routing only; it does not claim authenticated screenshots, execute UAT, accept evidence, approve owner GO/NO-GO or mark production GO.`,
);
