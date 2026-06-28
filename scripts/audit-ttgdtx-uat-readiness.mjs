import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const failures = [];

function read(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), "utf8");
}

function exists(relativePath) {
  return existsSync(path.join(repoRoot, relativePath));
}

function fail(message) {
  failures.push(message);
}

function requireFile(relativePath) {
  if (!exists(relativePath)) {
    fail(`Missing required file: ${relativePath}`);
  }
}

function requireText(relativePath, pattern, label) {
  if (!exists(relativePath)) {
    return;
  }

  const contents = read(relativePath);
  if (!pattern.test(contents)) {
    fail(`${relativePath}: missing ${label}`);
  }
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const requiredFiles = [
  "components/ttgdtx/ttgdtx-uat-signoff-guard.tsx",
  "docs/TTGDTX_ROLE_SCOPE_UAT_RUNBOOK.md",
  "docs/TTGDTX_BROWSER_UAT_MATRIX_20260625.md",
  "docs/TTGDTX_SYNTHETIC_UAT_ACCOUNT_SETUP.md",
  "docs/TTGDTX_UAT_EXECUTION_LOG_20260625.md",
  "docs/TTGDTX_UAT_OPERATOR_HANDOFF_20260627.md",
  "docs/TTGDTX_SIGNED_UAT_EXECUTION_ROUTING_HUB_20260628.md",
  "components/ttgdtx/ttgdtx-signed-uat-execution-routing-hub.tsx",
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
];

for (const file of requiredFiles) {
  requireFile(file);
}

const requiredAccounts = [
  "UAT_ADMIN",
  "UAT_BGH",
  "UAT_KHTC",
  "UAT_TUYEN_SINH",
  "UAT_PHAP_CHE",
  "UAT_OUT_OF_SCOPE",
];

for (const account of requiredAccounts) {
  requireText(
    "docs/TTGDTX_ROLE_SCOPE_UAT_RUNBOOK.md",
    new RegExp(account),
    `${account} in role-scope runbook`,
  );
  requireText(
    "docs/TTGDTX_UAT_EXECUTION_LOG_20260625.md",
    new RegExp(`${account}[\\s\\S]*PENDING`),
    `${account} pending marker in execution log`,
  );
  requireText(
    "docs/TTGDTX_SYNTHETIC_UAT_ACCOUNT_SETUP.md",
    new RegExp(account),
    `${account} in synthetic account setup`,
  );
  requireText(
    "docs/TTGDTX_BROWSER_UAT_MATRIX_20260625.md",
    new RegExp(account),
    `${account} in browser UAT matrix`,
  );
}

const requiredRoutes = [
  "/ttgdtx",
  "/ttgdtx/tuition",
  "/ttgdtx/gate",
  "/ttgdtx/receivables",
  "/ttgdtx/payments",
  "/ttgdtx/reconciliation",
  "/ttgdtx/reconciliation/review",
  "/ttgdtx/payment-requests",
  "/ttgdtx/payment-requests/review",
  "/ttgdtx/payment-requests/pay",
  "/ttgdtx/accounting-dashboard",
  "/ttgdtx/import",
  "/ttgdtx/import/issues",
  "/ttgdtx/import/workload",
  "/ttgdtx/master",
  "/ttgdtx/source-control",
  "/ttgdtx/simulation",
];

const signedUatRouteResultRows = [
  "UAT-ROUTE-01 P0-10 controlled evidence redaction intake",
  "UAT-ROUTE-02 P0-03 backup/restore dry-run proof",
  "UAT-ROUTE-03 Step90-Step110 signed production migration order",
  "UAT-ROUTE-04 P6-04 role/workspace scope UAT",
  "UAT-ROUTE-05 P0-19 legal and finance gate UAT",
  "UAT-ROUTE-06 P3-01/P3-02 lead lifecycle and handover UAT",
  "UAT-ROUTE-07 P2-17 payout duplicate and dossier UAT",
  "UAT-ROUTE-08 P2-18/P5-03 dashboard and Finance Desk browser UAT",
  "UAT-ROUTE-09 P6-03 audit-log traceability UAT",
  "UAT-ROUTE-10 P6-06 hard-delete/cascade closure proof",
  "UAT-ROUTE-11 P0-09 final owner GO/NO-GO decision",
];

for (const route of requiredRoutes) {
  const escapedRoute = route.replaceAll("/", "\\/");
  requireText(
    "docs/TTGDTX_ROLE_SCOPE_UAT_RUNBOOK.md",
    new RegExp(`\\|\\s*\`${escapedRoute}\``),
    `${route} in role-scope route matrix`,
  );
  requireText(
    "docs/TTGDTX_UAT_EXECUTION_LOG_20260625.md",
    new RegExp(`\\|\\s*\`${escapedRoute}\`\\s*\\|\\s*PASS - redirected to \`\\/login\``),
    `${route} unauthenticated smoke evidence`,
  );
  requireText(
    "docs/TTGDTX_BROWSER_UAT_MATRIX_20260625.md",
    new RegExp(`\\|\\s*\`${escapedRoute}\``),
    `${route} in browser UAT matrix`,
  );
}

const requiredScripts = [
  "audit:permission-soft-revoke",
  "audit:ttgdtx-role-scope-access",
  "audit:ttgdtx-dashboard-access",
  "audit:ttgdtx-data-fetch-gate",
];

for (const script of requiredScripts) {
  requireText(
    "docs/TTGDTX_ROLE_SCOPE_UAT_RUNBOOK.md",
    new RegExp(script.replaceAll(":", ":")),
    `${script} in static preflight`,
  );
}

requireText(
  "docs/TTGDTX_UAT_EXECUTION_LOG_20260625.md",
  /Result:\s*PARTIAL PASS/i,
  "partial-pass decision",
);

requireText(
  "docs/TTGDTX_UAT_EXECUTION_LOG_20260625.md",
  /(?=[\s\S]*Internal UAT Run Closure Tracker)(?=[\s\S]*BLOCKED_PENDING_MULTI_ACCOUNT_UAT)(?=[\s\S]*UAT_PASS)(?=[\s\S]*UAT-CLOSE-01 Synthetic accounts prepared)(?=[\s\S]*UAT-CLOSE-06 Owners sign UAT result)(?=[\s\S]*Any missing account, route result, negative-test result, redaction proof or\s+owner signature keeps production NO-GO)(?=[\s\S]*No passwords, OTPs, service-role keys, raw PII, bank accounts or raw payment evidence in Git\/Codex\/chat)/i,
  "internal UAT run closure tracker remains blocked until signed evidence",
);

requireText(
  "components/ttgdtx/ttgdtx-uat-signoff-guard.tsx",
  /(?=[\s\S]*PRODUCTION_GOVERNANCE_ASSURANCE_STEPS)(?=[\s\S]*data-ttgdtx-governance-uat-execution-readiness="P6-04_P6-03")(?=[\s\S]*Governance UAT execution readiness: P6-04 \+ P6-03)(?=[\s\S]*Run P6-04 role\/workspace UAT first, then P6-03 audit-log\s+traceability sampling)(?=[\s\S]*P6_04_SCOPE_UAT \/ P6_03_TRACE_UAT)(?=[\s\S]*Runbook:[\s\S]*step\.runbook)(?=[\s\S]*Guard:[\s\S]*step\.auditCommand)(?=[\s\S]*Stop if evidence is unsigned, role scope leaks, audit trace is\s+missing, redaction fails or the result is stored in\s+Git\/Codex\/chat)/i,
  "governance UAT execution readiness UI",
);

requireText(
  "docs/TTGDTX_UAT_EXECUTION_LOG_20260625.md",
  /(?=[\s\S]*Governance UAT Execution Readiness)(?=[\s\S]*BLOCKED_PENDING_SIGNED_GOVERNANCE_UAT)(?=[\s\S]*Run P6-04 before P6-03)(?=[\s\S]*P6-04 role\/workspace UAT[\s\S]*PENDING[\s\S]*\/settings\/scopes[\s\S]*HEU_ROLE_SCOPE_UAT_EXECUTION_PACK_20260627\.md[\s\S]*audit:heu-role-scope-uat-pack)(?=[\s\S]*P6-03 audit-log traceability UAT[\s\S]*PENDING[\s\S]*\/audit[\s\S]*TTGDTX_AUDIT_LOG_UAT_RUNBOOK\.md[\s\S]*audit:ttgdtx-audit-trail-guard)(?=[\s\S]*PASS_LOCAL does not execute these UAT runs, accept evidence, grant access,\s+approve finance action, waive audit traceability or mark production GO)/i,
  "governance UAT execution log readiness remains blocked until signed evidence",
);

requireText(
  "docs/TTGDTX_UAT_EXECUTION_LOG_20260625.md",
  /(?=[\s\S]*Signed UAT Route Result Tracker)(?=[\s\S]*BLOCKED_PENDING_SIGNED_UAT_ROUTE_EVIDENCE)(?=[\s\S]*SIGNED_UAT_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*controlled evidence reference, redaction reviewer,\s+route result, reviewer name and required owner signature)(?=[\s\S]*UAT-ROUTE-01 P0-10 controlled evidence redaction intake[\s\S]*PENDING)(?=[\s\S]*UAT-ROUTE-02 P0-03 backup\/restore dry-run proof[\s\S]*PENDING)(?=[\s\S]*UAT-ROUTE-03 Step90-Step110 signed production migration order[\s\S]*PENDING)(?=[\s\S]*UAT-ROUTE-04 P6-04 role\/workspace scope UAT[\s\S]*PENDING)(?=[\s\S]*UAT-ROUTE-05 P0-19 legal and finance gate UAT[\s\S]*PENDING)(?=[\s\S]*UAT-ROUTE-06 P3-01\/P3-02 lead lifecycle and handover UAT[\s\S]*PENDING)(?=[\s\S]*UAT-ROUTE-07 P2-17 payout duplicate and dossier UAT[\s\S]*PENDING)(?=[\s\S]*UAT-ROUTE-08 P2-18\/P5-03 dashboard and Finance Desk browser UAT[\s\S]*PENDING)(?=[\s\S]*UAT-ROUTE-09 P6-03 audit-log traceability UAT[\s\S]*PENDING)(?=[\s\S]*UAT-ROUTE-10 P6-06 hard-delete\/cascade closure proof[\s\S]*PENDING)(?=[\s\S]*UAT-ROUTE-11 P0-09 final owner GO\/NO-GO decision[\s\S]*PENDING)(?=[\s\S]*PASS_LOCAL does not mean any UAT route was executed, accepted, signed,\s+evidence-approved, finance-approved, migration-approved or production-approved)/i,
  "signed UAT route result tracker remains pending until external evidence and owner signatures",
);

requireText(
  "docs/TTGDTX_UAT_EXECUTION_LOG_20260625.md",
  /\| Route \| Current status \| Decision lane \| Route\/source \| Minimum proof to record \| Owner \| Evidence\/reference \|[\s\S]*UAT-ROUTE-01 P0-10 controlled evidence redaction intake \| PENDING \| SIGNED_UAT_READY \/ NO_GO \/ BLOCKED \|[\s\S]*UAT-ROUTE-11 P0-09 final owner GO\/NO-GO decision \| PENDING \| SIGNED_UAT_READY \/ NO_GO \/ BLOCKED \|/i,
  "signed UAT route result tracker includes per-route decision lane",
);

for (const row of signedUatRouteResultRows) {
  requireText(
    "docs/TTGDTX_UAT_EXECUTION_LOG_20260625.md",
    new RegExp(
      `\\|\\s*${escapeRegExp(row)}\\s*\\|\\s*PENDING\\s*\\|\\s*SIGNED_UAT_READY / NO_GO / BLOCKED\\s*\\|`,
      "i",
    ),
    `decision lane for ${row}`,
  );
}

requireText(
  "docs/TTGDTX_UAT_EXECUTION_LOG_20260625.md",
  /No real passwords, OTPs, service keys, bank credentials/i,
  "no secret or real credential rule",
);

requireText(
  "docs/TTGDTX_UAT_OPERATOR_HANDOFF_20260627.md",
  /(?=[\s\S]*Status:\s*PASS_LOCAL_HANDOFF)(?=[\s\S]*TTGDTX_SIGNED_UAT_EXECUTION_ROUTING_HUB_20260628\.md)(?=[\s\S]*UAT-HANDOFF-01)(?=[\s\S]*audit:ttgdtx-signed-uat-execution-routing-hub)(?=[\s\S]*UAT-HANDOFF-03)(?=[\s\S]*data-ttgdtx-signed-uat-execution-routing-hub="P0-08_UAT_ROUTING")(?=[\s\S]*UAT-HANDOFF-04)(?=[\s\S]*UAT-HANDOFF-05[\s\S]*TTGDTX_UAT_EXECUTION_LOG_20260625\.md` Section 5\.2)(?=[\s\S]*UAT-HANDOFF-07)(?=[\s\S]*Do not paste passwords, OTPs, reset links, service-role keys, API keys)(?=[\s\S]*TTGDTX_SYNTHETIC_UAT_ACCOUNT_SETUP\.md)(?=[\s\S]*TTGDTX_BROWSER_UAT_MATRIX_20260625\.md)(?=[\s\S]*TTGDTX_UAT_EXECUTION_LOG_20260625\.md)(?=[\s\S]*UAT-ROUTE-01 P0-10)(?=[\s\S]*UAT-ROUTE-11 P0-09)(?=[\s\S]*controlled evidence reference,\s+redaction reviewer, route result, reviewer name and required owner signature)(?=[\s\S]*Any `UAT-ROUTE-\*` row is missing minimum proof)(?=[\s\S]*production remains NO-GO until backup\/restore evidence)/i,
  "operator handoff keeps UAT run order and no-secret boundary",
);

requireText(
  "docs/TTGDTX_SIGNED_UAT_EXECUTION_ROUTING_HUB_20260628.md",
  /(?=[\s\S]*Operator Handoff Link)(?=[\s\S]*TTGDTX_UAT_OPERATOR_HANDOFF_20260627\.md)(?=[\s\S]*UAT-HANDOFF-03)(?=[\s\S]*UAT-HANDOFF-04)(?=[\s\S]*UAT-ROUTE-01)(?=[\s\S]*UAT-ROUTE-11)(?=[\s\S]*handoff and hub do not execute UAT, accept\s+evidence, sign owner results, grant access, approve finance action, approve\s+migration, approve owner GO\/NO-GO or mark production GO)/i,
  "signed UAT routing hub links back to operator handoff",
);

requireText(
  "components/ttgdtx/ttgdtx-signed-uat-execution-routing-hub.tsx",
  /(?=[\s\S]*data-ttgdtx-signed-uat-execution-routing-hub="P0-08_UAT_ROUTING")(?=[\s\S]*SIGNED_UAT_EXECUTION_ROUTES)(?=[\s\S]*Closure rule)(?=[\s\S]*Strict boundary)/i,
  "visible signed UAT routing hub remains mounted and bounded",
);

requireText(
  "docs/TTGDTX_SYNTHETIC_UAT_ACCOUNT_SETUP.md",
  /Do not send real passwords into Codex\/chat/i,
  "Codex password boundary",
);

requireText(
  "docs/TTGDTX_SYNTHETIC_UAT_ACCOUNT_SETUP.md",
  /users_profile[\s\S]*user_admission_segment_scopes/i,
  "profile and workspace scope verification query",
);

requireText(
  "docs/TTGDTX_BROWSER_UAT_MATRIX_20260625.md",
  /Simulation-Specific Checks[\s\S]*ttgdtx\.contract\.read[\s\S]*ttgdtx\.tuition\.read[\s\S]*ttgdtx\.receivable\.read/i,
  "simulation-specific permission checks",
);

requireText(
  "docs/TTGDTX_BROWSER_UAT_MATRIX_20260625.md",
  /UAT_OUT_OF_SCOPE[\s\S]*BLOCK/i,
  "out-of-scope blocked expectation",
);

requireText(
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
  /Current recommendation:\s*NO-GO for production/i,
  "NO-GO production recommendation",
);

requireText(
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
  /\|\s*Internal UAT sign-off\s*\|[\s\S]*\|\s*IN_PROGRESS\s*\|[\s\S]*TTGDTX_UAT_OPERATOR_HANDOFF_20260627\.md[\s\S]*UAT-HANDOFF-03\/UAT-HANDOFF-04[\s\S]*UAT-ROUTE-01 through UAT-ROUTE-11[\s\S]*TTGDTX_UAT_EXECUTION_LOG_20260625\.md[\s\S]*Section 5\.2 signed UAT route result tracker[\s\S]*all routes PENDING until controlled evidence and required owner signatures exist/i,
  "internal UAT sign-off IN_PROGRESS with execution log",
);

if (failures.length > 0) {
  console.error("TTGDTX UAT readiness audit failed.");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(
  `TTGDTX UAT readiness audit passed. Checked ${requiredFiles.length} files, ${requiredAccounts.length} accounts and ${requiredRoutes.length} routes.`,
);
