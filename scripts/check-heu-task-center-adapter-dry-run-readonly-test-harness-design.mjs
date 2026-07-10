import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const failures = [];

const componentPath = "components/data-confirmation/department-task-inbox.tsx";
const panelSourcePath = "lib/task-center-gate-evidence-panel-source.ts";
const enablementGatePath = "lib/task-center-readonly-adapter-enablement-gate.ts";
const docPath =
  "docs/HEU_CONTROL/HEU_DATA_026_TASK_CENTER_ADAPTER_DRY_RUN_READONLY_TEST_HARNESS_DESIGN_20260710.md";
const staticNegativePacketDocPath =
  "docs/HEU_CONTROL/HEU_DATA_025_TASK_CENTER_ADAPTER_DRY_RUN_STATIC_NEGATIVE_ACCESS_PACKET_20260710.md";
const syntheticFixtureContractDocPath =
  "docs/HEU_CONTROL/HEU_DATA_027_TASK_CENTER_ADAPTER_DRY_RUN_SYNTHETIC_FIXTURE_CONTRACT_20260710.md";
const manifestPath =
  "docs/HEU_CONTROL/HEU_APP_SHELL_001_STAGE_FILE_MANIFEST_20260709.md";
const staticNegativePacketCheckerPath =
  "scripts/check-heu-task-center-adapter-dry-run-static-negative-access-packet.mjs";
const syntheticFixtureContractCheckerPath =
  "scripts/check-heu-task-center-adapter-dry-run-synthetic-fixture-contract.mjs";
const checkerPath =
  "scripts/check-heu-task-center-adapter-dry-run-readonly-test-harness-design.mjs";
const packagePath = "package.json";
const checkerAlias =
  "check:heu-task-center-adapter-dry-run-readonly-test-harness-design";
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
  componentPath,
  panelSourcePath,
  enablementGatePath,
  docPath,
  staticNegativePacketDocPath,
  syntheticFixtureContractDocPath,
  manifestPath,
  staticNegativePacketCheckerPath,
  syntheticFixtureContractCheckerPath,
  checkerPath,
  packagePath,
]) {
  requireFile(file);
}

if (failures.length === 0) {
  const component = read(componentPath);
  const panelSource = read(panelSourcePath);
  const enablementGate = read(enablementGatePath);
  const doc = read(docPath);
  const staticNegativePacketDoc = read(staticNegativePacketDocPath);
  const syntheticFixtureContractDoc = read(syntheticFixtureContractDocPath);
  const manifest = read(manifestPath);
  const staticNegativePacketChecker = read(staticNegativePacketCheckerPath);
  const syntheticFixtureContractChecker = read(
    syntheticFixtureContractCheckerPath,
  );
  const checkerScript = read(checkerPath);
  const packageJson = JSON.parse(read(packagePath));

  requireTokens(
    enablementGate,
    [
      "TASK_CENTER_ADAPTER_ENABLEMENT_OWNER_REVIEW_REQUIRED",
      "TASK_CENTER_ADAPTER_ENABLEMENT_DEFAULT_NO_GO",
      "IT_DATA_SCOPE_FIRST_FILTER_SIGNOFF",
      "AUDIT_NEGATIVE_ACCESS_EVIDENCE",
      "PHAP_CHE_RESTRICTED_DATA_BOUNDARY_SIGNOFF",
      "DEPARTMENT_OWNER_TASK_LABEL_ACCEPTANCE",
      "BGH_PRODUCTION_NO_GO_ACKNOWLEDGEMENT",
      "BACKUP_ROLLBACK_UAT_EVIDENCE_BEFORE_DB_READ",
    ],
    "enablement gate prerequisite token",
    enablementGatePath,
  );

  requireTokens(
    panelSource,
    [
      "TASK_CENTER_ADAPTER_DRY_RUN_READONLY_TEST_HARNESS_DESIGN_ONLY",
      "TASK_CENTER_ADAPTER_DRY_RUN_READONLY_TEST_HARNESS_DESIGN_READONLY",
      "TASK_CENTER_ADAPTER_DRY_RUN_READONLY_TEST_HARNESS_DESIGN_DRAFT_ONLY",
      "TASK_CENTER_ADAPTER_DRY_RUN_READONLY_TEST_HARNESS_DESIGN_NO_APPROVAL",
      "TASK_CENTER_ADAPTER_DRY_RUN_READONLY_TEST_HARNESS_DESIGN_NO_DATABASE_READ",
      "TASK_CENTER_ADAPTER_DRY_RUN_READONLY_TEST_HARNESS_DESIGN_NO_DATABASE_CLIENT",
      "TASK_CENTER_ADAPTER_DRY_RUN_READONLY_TEST_HARNESS_DESIGN_NO_ENV_ENABLEMENT",
      "TASK_CENTER_ADAPTER_DRY_RUN_READONLY_TEST_HARNESS_DESIGN_NO_TASK_MUTATION",
      "TASK_CENTER_ADAPTER_DRY_RUN_READONLY_TEST_HARNESS_DESIGN_NO_REAL_DATA",
      "TASK_CENTER_ADAPTER_DRY_RUN_READONLY_TEST_HARNESS_DESIGN_NO_AI_OR_AUTOMATION",
      "TaskCenterAdapterDryRunReadonlyTestHarnessDesignItem",
      "adapterDryRunReadonlyTestHarnessDesignItems",
      "READONLY_TEST_HARNESS_READY: PASS_LOCAL_DESIGN_ONLY",
      "TASK_CENTER_DATABASE_READY: NO_GO_TEST_HARNESS_DESIGN_ONLY",
      "HARNESS_DESIGN_SYNTHETIC_USER_SCOPE",
      "HARNESS_DESIGN_SYNTHETIC_TASK_ROWS",
      "HARNESS_DESIGN_RESTRICTED_DATA_BOUNDARY",
      "HARNESS_DESIGN_NEGATIVE_ACCESS_CASES",
      "HARNESS_DESIGN_DEPARTMENT_LANE_EXPECTATIONS",
      "HARNESS_DESIGN_PRODUCTION_NO_GO",
      "SYNTHETIC_SCOPE_FIXTURE_ONLY",
      "SYNTHETIC_TASK_ROW_METADATA_ONLY",
      "SYNTHETIC_RESTRICTED_FIELD_ALLOWLIST_ONLY",
      "STATIC_NEGATIVE_ACCESS_PACKET_REUSE",
      "SYNTHETIC_DEPARTMENT_LANE_EXPECTATIONS",
      "DESIGN_ONLY_NO_RUNTIME_SWITCH",
      "ASSERT_SCOPE_DENIAL_WITHOUT_DB_READ",
      "ASSERT_NO_RAW_PII_NO_PAYMENT_DATA",
      "ASSERT_RESTRICTED_FIELDS_BLOCKED",
      "ASSERT_EXPECTED_BLOCKED_RESULTS",
      "ASSERT_WRONG_DEPARTMENT_BLOCKED",
      "ASSERT_NO_ENV_ENABLEMENT_NO_DEPLOY",
      "NO_DATABASE_READ_EXECUTED",
      "NO_REAL_USER_DATA",
      "NO_RAW_PII_NO_PAYMENT_DATA",
      "NO_BROAD_ACCESS_PROOF_MISSING",
      "NO_TASK_MUTATION_ROUTE_CREATED",
      "NO_PRODUCTION_GO_NO_DEPLOY",
    ],
    "readonly test-harness design source token",
    panelSourcePath,
  );

  requireTokens(
    component,
    [
      "TASK_CENTER_ADAPTER_DRY_RUN_READONLY_TEST_HARNESS_DESIGN_ONLY",
      "TASK_CENTER_ADAPTER_DRY_RUN_READONLY_TEST_HARNESS_DESIGN_READONLY",
      "TASK_CENTER_ADAPTER_DRY_RUN_READONLY_TEST_HARNESS_DESIGN_DRAFT_ONLY",
      "TASK_CENTER_ADAPTER_DRY_RUN_READONLY_TEST_HARNESS_DESIGN_NO_APPROVAL",
      "TASK_CENTER_ADAPTER_DRY_RUN_READONLY_TEST_HARNESS_DESIGN_NO_DATABASE_READ",
      "TASK_CENTER_ADAPTER_DRY_RUN_READONLY_TEST_HARNESS_DESIGN_NO_DATABASE_CLIENT",
      "TASK_CENTER_ADAPTER_DRY_RUN_READONLY_TEST_HARNESS_DESIGN_NO_ENV_ENABLEMENT",
      "TASK_CENTER_ADAPTER_DRY_RUN_READONLY_TEST_HARNESS_DESIGN_NO_TASK_MUTATION",
      "TASK_CENTER_ADAPTER_DRY_RUN_READONLY_TEST_HARNESS_DESIGN_NO_REAL_DATA",
      "TASK_CENTER_ADAPTER_DRY_RUN_READONLY_TEST_HARNESS_DESIGN_NO_AI_OR_AUTOMATION",
      "data-heu-task-center-adapter-dry-run-readonly-test-harness-design",
      "data-heu-task-center-adapter-dry-run-readonly-test-harness-design-readonly",
      "data-heu-task-center-adapter-dry-run-readonly-test-harness-design-draft-only",
      "data-heu-task-center-adapter-dry-run-readonly-test-harness-design-no-approval",
      "data-heu-task-center-adapter-dry-run-readonly-test-harness-design-no-database-read",
      "data-heu-task-center-adapter-dry-run-readonly-test-harness-design-no-database-client",
      "data-heu-task-center-adapter-dry-run-readonly-test-harness-design-no-env-enablement",
      "data-heu-task-center-adapter-dry-run-readonly-test-harness-design-no-task-mutation",
      "data-heu-task-center-adapter-dry-run-readonly-test-harness-design-no-real-data",
      "data-heu-task-center-adapter-dry-run-readonly-test-harness-design-no-ai-or-automation",
      "data-heu-task-center-adapter-dry-run-readonly-test-harness-design-item",
      "data-heu-task-center-adapter-dry-run-readonly-test-harness-design-reviewer",
      "data-heu-task-center-adapter-dry-run-readonly-test-harness-design-fixture",
      "data-heu-task-center-adapter-dry-run-readonly-test-harness-design-assertion",
      "data-heu-task-center-adapter-dry-run-readonly-test-harness-design-stop-rule",
      "HEU-Data-026 - Readonly test-harness design",
      "Thiet ke harness test scope truoc dry-run adapter",
      "gateEvidence.adapterDryRunReadonlyTestHarnessDesign.items.map",
      "gateEvidence.adapterDryRunReadonlyTestHarnessDesign.result",
    ],
    "component readonly test-harness design token",
    componentPath,
  );

  requireTokens(
    doc,
    [
      "HEU-DATA-026-TASK-CENTER-ADAPTER-DRY-RUN-READONLY-TEST-HARNESS-DESIGN",
      "Status: PASS_LOCAL_DESIGN_ONLY",
      "Production status: NO-GO",
      "Runtime status: READONLY_TEST_HARNESS_READY: PASS_LOCAL_DESIGN_ONLY",
      "Database status: TASK_CENTER_DATABASE_READY: NO_GO_TEST_HARNESS_DESIGN_ONLY",
      "TASK_CENTER_ADAPTER_DRY_RUN_READONLY_TEST_HARNESS_DESIGN_ONLY",
      "TASK_CENTER_ADAPTER_DRY_RUN_READONLY_TEST_HARNESS_DESIGN_READONLY",
      "TASK_CENTER_ADAPTER_DRY_RUN_READONLY_TEST_HARNESS_DESIGN_DRAFT_ONLY",
      "TASK_CENTER_ADAPTER_DRY_RUN_READONLY_TEST_HARNESS_DESIGN_NO_APPROVAL",
      "TASK_CENTER_ADAPTER_DRY_RUN_READONLY_TEST_HARNESS_DESIGN_NO_DATABASE_READ",
      "TASK_CENTER_ADAPTER_DRY_RUN_READONLY_TEST_HARNESS_DESIGN_NO_DATABASE_CLIENT",
      "TASK_CENTER_ADAPTER_DRY_RUN_READONLY_TEST_HARNESS_DESIGN_NO_ENV_ENABLEMENT",
      "TASK_CENTER_ADAPTER_DRY_RUN_READONLY_TEST_HARNESS_DESIGN_NO_TASK_MUTATION",
      "TASK_CENTER_ADAPTER_DRY_RUN_READONLY_TEST_HARNESS_DESIGN_NO_REAL_DATA",
      "TASK_CENTER_ADAPTER_DRY_RUN_READONLY_TEST_HARNESS_DESIGN_NO_AI_OR_AUTOMATION",
      "NO_DATABASE_CLIENT_CREATED",
      "NO_DATABASE_READ_EXECUTED",
      "NO_ENV_ENABLEMENT",
      "NO_TASK_MUTATION_ROUTE_CREATED",
      "NO_REAL_USER_DATA",
      "NO_AI_CALL_NO_AUTOMATION_STEP",
      "HARNESS_DESIGN_SYNTHETIC_USER_SCOPE",
      "HARNESS_DESIGN_SYNTHETIC_TASK_ROWS",
      "HARNESS_DESIGN_RESTRICTED_DATA_BOUNDARY",
      "HARNESS_DESIGN_NEGATIVE_ACCESS_CASES",
      "HARNESS_DESIGN_DEPARTMENT_LANE_EXPECTATIONS",
      "HARNESS_DESIGN_PRODUCTION_NO_GO",
      "HEU-DATA-027-TASK-CENTER-ADAPTER-DRY-RUN-SYNTHETIC-FIXTURE-CONTRACT",
      "SYNTHETIC_FIXTURE_CONTRACT_READY: PASS_LOCAL_CONTRACT_ONLY",
      "check:heu-task-center-adapter-dry-run-synthetic-fixture-contract",
      "check:heu-task-center-adapter-dry-run-readonly-test-harness-design",
    ],
    "readonly test-harness design doc token",
    docPath,
  );

  requireTokens(
    staticNegativePacketDoc,
    [
      "HEU-DATA-026-TASK-CENTER-ADAPTER-DRY-RUN-READONLY-TEST-HARNESS-DESIGN",
      "READONLY_TEST_HARNESS_READY: PASS_LOCAL_DESIGN_ONLY",
      "check:heu-task-center-adapter-dry-run-readonly-test-harness-design",
    ],
    "static negative-access packet next-slice token",
    staticNegativePacketDocPath,
  );

  requireTokens(
    manifest,
    [
      componentPath,
      panelSourcePath,
      enablementGatePath,
      docPath,
      staticNegativePacketDocPath,
      syntheticFixtureContractDocPath,
      checkerPath,
      staticNegativePacketCheckerPath,
      syntheticFixtureContractCheckerPath,
      "check:heu-task-center-adapter-dry-run-readonly-test-harness-design",
      "check:heu-task-center-adapter-dry-run-synthetic-fixture-contract",
      "node --check scripts/check-heu-task-center-adapter-dry-run-readonly-test-harness-design.mjs",
      "node --check scripts/check-heu-task-center-adapter-dry-run-synthetic-fixture-contract.mjs",
      "npm.cmd run check:heu-task-center-adapter-dry-run-readonly-test-harness-design",
      "npm.cmd run check:heu-task-center-adapter-dry-run-synthetic-fixture-contract",
    ],
    "manifest readonly test-harness design token",
    manifestPath,
  );

  requireTokens(
    syntheticFixtureContractDoc,
    [
      "HEU-DATA-027-TASK-CENTER-ADAPTER-DRY-RUN-SYNTHETIC-FIXTURE-CONTRACT",
      "SYNTHETIC_FIXTURE_CONTRACT_READY: PASS_LOCAL_CONTRACT_ONLY",
      "TASK_CENTER_DATABASE_READY: NO_GO_SYNTHETIC_FIXTURE_CONTRACT_ONLY",
      "HEU-DATA-028-TASK-CENTER-ADAPTER-DRY-RUN-SYNTHETIC-FIXTURE-RUNNER-PLAN",
    ],
    "synthetic fixture contract next-slice doc token",
    syntheticFixtureContractDocPath,
  );

  requireTokens(
    staticNegativePacketChecker,
    [
      "HEU-DATA-026-TASK-CENTER-ADAPTER-DRY-RUN-READONLY-TEST-HARNESS-DESIGN",
      "check:heu-task-center-adapter-dry-run-readonly-test-harness-design",
      docPath,
      checkerPath,
    ],
    "static negative-access packet checker next-slice token",
    staticNegativePacketCheckerPath,
  );

  requireTokens(
    syntheticFixtureContractChecker,
    [
      "HEU_TASK_CENTER_ADAPTER_DRY_RUN_SYNTHETIC_FIXTURE_CONTRACT_READY: PASS_LOCAL",
      "TASK_CENTER_DATABASE_READY: NO_GO_SYNTHETIC_FIXTURE_CONTRACT_ONLY",
      docPath,
      checkerPath,
    ],
    "synthetic fixture contract checker reverse-link token",
    syntheticFixtureContractCheckerPath,
  );

  if (packageJson.scripts?.[checkerAlias] !== checkerCommand) {
    fail(`${packagePath}: missing or mismatched ${checkerAlias}`);
  }

  requireTokens(
    checkerScript,
    [
      "existsSync",
      "readFileSync",
      "HEU_TASK_CENTER_ADAPTER_DRY_RUN_READONLY_TEST_HARNESS_DESIGN_READY: PASS_LOCAL",
      "TASK_CENTER_DATABASE_READY: NO_GO_TEST_HARNESS_DESIGN_ONLY",
      "NO_RUNTIME_MUTATION: task center adapter dry-run readonly test harness design checker only; no owner approval, database client, database read, env enablement, table creation, SQL migration, task write, file upload, storage write, real-data fixture, AI call, paid automation, deploy, finance action or production GO",
    ],
    "checker-script read-only token",
    checkerPath,
  );

  forbidPatterns(
    `${enablementGate}\n${panelSource}\n${component}\n${doc}`,
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
      { label: "file input", pattern: /type=["']file["']/ },
      { label: "upload wording as action", pattern: /\bupload\s*\(/i },
      { label: "storage write", pattern: /\bstorage\s*\.\s*from\b/i },
      { label: "server action marker", pattern: /["']use server["']/ },
      { label: "SQL create table statement", pattern: /\bcreate\s+table\b/i },
      { label: "SQL alter table statement", pattern: /\balter\s+table\b/i },
      { label: "SQL migration folder", pattern: /\bmigrations?\//i },
      { label: "approved owner lane", pattern: /:\s*["']DAT_CHINH_THUC["']/ },
      { label: "enabled true gate", pattern: /\benabled\s*:\s*true\b/ },
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
    "runtime DB, SQL, upload, storage, secret, approval or mutation API",
    "task-center adapter dry-run readonly test harness design scope",
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
  console.error(
    "HEU Task Center adapter dry-run readonly test harness design check failed:",
  );
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(
  "HEU Task Center adapter dry-run readonly test harness design check",
);
console.log(
  "HEU_TASK_CENTER_ADAPTER_DRY_RUN_READONLY_TEST_HARNESS_DESIGN_READY: PASS_LOCAL",
);
console.log("TASK_CENTER_DATABASE_READY: NO_GO_TEST_HARNESS_DESIGN_ONLY");
console.log(
  "NO_RUNTIME_MUTATION: task center adapter dry-run readonly test harness design checker only; no owner approval, database client, database read, env enablement, table creation, SQL migration, task write, file upload, storage write, real-data fixture, AI call, paid automation, deploy, finance action or production GO",
);
