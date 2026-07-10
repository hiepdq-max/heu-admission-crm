import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const failures = [];

const componentPath = "components/data-confirmation/department-task-inbox.tsx";
const panelSourcePath = "lib/task-center-gate-evidence-panel-source.ts";
const docPath =
  "docs/HEU_CONTROL/HEU_DATA_015_TASK_CENTER_OWNER_SIGNOFF_ROUTING_MAP_20260710.md";
const pilotReviewDocPath =
  "docs/HEU_CONTROL/HEU_DATA_014_TASK_CENTER_PILOT_REVIEW_PACKET_20260710.md";
const manifestPath =
  "docs/HEU_CONTROL/HEU_APP_SHELL_001_STAGE_FILE_MANIFEST_20260709.md";
const pilotReviewCheckerPath =
  "scripts/check-heu-task-center-pilot-review-packet-readiness.mjs";
const checkerPath =
  "scripts/check-heu-task-center-owner-signoff-routing-map-readiness.mjs";
const packagePath = "package.json";
const checkerAlias = "check:heu-task-center-owner-signoff-routing-map-readiness";
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
  docPath,
  pilotReviewDocPath,
  manifestPath,
  pilotReviewCheckerPath,
  checkerPath,
  packagePath,
]) {
  requireFile(file);
}

if (failures.length === 0) {
  const component = read(componentPath);
  const panelSource = read(panelSourcePath);
  const doc = read(docPath);
  const pilotReviewDoc = read(pilotReviewDocPath);
  const manifest = read(manifestPath);
  const pilotReviewChecker = read(pilotReviewCheckerPath);
  const checkerScript = read(checkerPath);
  const packageJson = JSON.parse(read(packagePath));

  requireTokens(
    panelSource,
    [
      "TASK_CENTER_OWNER_SIGNOFF_ROUTING_MAP_ONLY",
      "TASK_CENTER_OWNER_SIGNOFF_ROUTING_MAP_READONLY",
      "TASK_CENTER_OWNER_SIGNOFF_ROUTING_MAP_DRAFT_ONLY",
      "TASK_CENTER_OWNER_SIGNOFF_ROUTING_MAP_NO_APPROVAL",
      "TASK_CENTER_OWNER_SIGNOFF_ROUTING_MAP_NO_DATABASE_READ",
      "TASK_CENTER_OWNER_SIGNOFF_ROUTING_MAP_NO_TASK_MUTATION",
      "TASK_CENTER_OWNER_SIGNOFF_ROUTING_MAP_NO_AI_OR_AUTOMATION",
      "TaskCenterOwnerSignoffRoutingItem",
      "ownerSignoffRoutingItems",
      "OWNER_SIGNOFF_IT_DATA_SCOPE",
      "OWNER_SIGNOFF_AUDIT_NEGATIVE_ACCESS",
      "OWNER_SIGNOFF_PHAP_CHE_REDACTION",
      "OWNER_SIGNOFF_DEPARTMENT_LABELS",
      "OWNER_SIGNOFF_BGH_NO_GO_ACK",
      "ownerLane: \"IT_DATA\"",
      "ownerLane: \"AUDIT\"",
      "ownerLane: \"PHAP_CHE\"",
      "ownerLane: \"DEPARTMENT_OWNER\"",
      "ownerLane: \"BGH\"",
      "DB_READ_BLOCKED_UNTIL_IT_DATA_SIGNOFF",
      "DB_READ_BLOCKED_UNTIL_AUDIT_SIGNOFF",
      "DB_READ_BLOCKED_UNTIL_PHAP_CHE_SIGNOFF",
      "DB_READ_BLOCKED_UNTIL_DEPARTMENT_OWNER_SIGNOFF",
      "DB_READ_BLOCKED_UNTIL_BGH_ACKNOWLEDGEMENT",
    ],
    "owner signoff routing source token",
    panelSourcePath,
  );

  requireTokens(
    component,
    [
      "TASK_CENTER_OWNER_SIGNOFF_ROUTING_MAP_ONLY",
      "TASK_CENTER_OWNER_SIGNOFF_ROUTING_MAP_READONLY",
      "TASK_CENTER_OWNER_SIGNOFF_ROUTING_MAP_DRAFT_ONLY",
      "TASK_CENTER_OWNER_SIGNOFF_ROUTING_MAP_NO_APPROVAL",
      "TASK_CENTER_OWNER_SIGNOFF_ROUTING_MAP_NO_DATABASE_READ",
      "TASK_CENTER_OWNER_SIGNOFF_ROUTING_MAP_NO_TASK_MUTATION",
      "TASK_CENTER_OWNER_SIGNOFF_ROUTING_MAP_NO_AI_OR_AUTOMATION",
      "data-heu-task-center-owner-signoff-routing-map",
      "data-heu-task-center-owner-signoff-routing-map-readonly",
      "data-heu-task-center-owner-signoff-routing-map-draft-only",
      "data-heu-task-center-owner-signoff-routing-map-no-approval",
      "data-heu-task-center-owner-signoff-routing-map-no-database-read",
      "data-heu-task-center-owner-signoff-routing-map-no-task-mutation",
      "data-heu-task-center-owner-signoff-routing-map-no-ai-or-automation",
      "data-heu-task-center-owner-signoff-item",
      "data-heu-task-center-owner-signoff-lane",
      "data-heu-task-center-owner-signoff-evidence",
      "data-heu-task-center-owner-signoff-db-blocker",
      "HEU-Data-015 - Owner signoff routing map",
      "Ban do tuyen owner truoc khi mo DB read",
      "gateEvidence.ownerSignoffRoutingMap.items.map",
    ],
    "component owner signoff routing token",
    componentPath,
  );

  requireTokens(
    doc,
    [
      "HEU-DATA-015-TASK-CENTER-OWNER-SIGNOFF-ROUTING-MAP",
      "Status: PASS_LOCAL_OWNER_SIGNOFF_ROUTING_MAP",
      "Production status: NO-GO",
      "TASK_CENTER_OWNER_SIGNOFF_ROUTING_MAP_ONLY",
      "TASK_CENTER_OWNER_SIGNOFF_ROUTING_MAP_READONLY",
      "TASK_CENTER_OWNER_SIGNOFF_ROUTING_MAP_DRAFT_ONLY",
      "TASK_CENTER_OWNER_SIGNOFF_ROUTING_MAP_NO_APPROVAL",
      "TASK_CENTER_OWNER_SIGNOFF_ROUTING_MAP_NO_DATABASE_READ",
      "TASK_CENTER_OWNER_SIGNOFF_ROUTING_MAP_NO_TASK_MUTATION",
      "TASK_CENTER_OWNER_SIGNOFF_ROUTING_MAP_NO_AI_OR_AUTOMATION",
      "TASK_CENTER_GATE_EVIDENCE_PANEL_DATABASE_NO_GO",
      "NO_DATABASE_CLIENT_CREATED",
      "NO_DATABASE_READ_EXECUTED",
      "NO_SQL_MIGRATION_CREATED",
      "NO_TASK_MUTATION_ROUTE_CREATED",
      "NO_AI_CALL_NO_AUTOMATION_STEP",
      "OWNER_SIGNOFF_IT_DATA_SCOPE",
      "OWNER_SIGNOFF_AUDIT_NEGATIVE_ACCESS",
      "OWNER_SIGNOFF_PHAP_CHE_REDACTION",
      "OWNER_SIGNOFF_DEPARTMENT_LABELS",
      "OWNER_SIGNOFF_BGH_NO_GO_ACK",
      "TASK_CENTER_DATABASE_READY: NO_GO",
      "CAN_SUA_IT_DATA_AUDIT_PHAP_CHE_OWNER_BGH",
      "Task Center read-only adapter decision ledger",
      "still no DB read and no migration",
    ],
    "owner signoff routing doc token",
    docPath,
  );

  requireTokens(
    pilotReviewDoc,
    [
      "HEU-DATA-015-TASK-CENTER-OWNER-SIGNOFF-ROUTING-MAP",
      "Task Center owner signoff routing map",
      "still no DB read and no migration",
      "check:heu-task-center-owner-signoff-routing-map-readiness",
    ],
    "pilot review packet next-slice token",
    pilotReviewDocPath,
  );

  requireTokens(
    manifest,
    [
      componentPath,
      panelSourcePath,
      docPath,
      checkerPath,
      "check:heu-task-center-owner-signoff-routing-map-readiness",
      "node --check scripts/check-heu-task-center-owner-signoff-routing-map-readiness.mjs",
      "npm.cmd run check:heu-task-center-owner-signoff-routing-map-readiness",
    ],
    "manifest owner signoff routing token",
    manifestPath,
  );

  requireTokens(
    pilotReviewChecker,
    [
      "HEU-DATA-015-TASK-CENTER-OWNER-SIGNOFF-ROUTING-MAP",
      "check:heu-task-center-owner-signoff-routing-map-readiness",
      docPath,
      checkerPath,
    ],
    "pilot review checker next-slice token",
    pilotReviewCheckerPath,
  );

  if (packageJson.scripts?.[checkerAlias] !== checkerCommand) {
    fail(`${packagePath}: missing or mismatched ${checkerAlias}`);
  }

  requireTokens(
    checkerScript,
    [
      "existsSync",
      "readFileSync",
      "HEU_TASK_CENTER_OWNER_SIGNOFF_ROUTING_MAP_READY: PASS_LOCAL",
      "TASK_CENTER_DATABASE_READY: NO_GO_OWNER_SIGNOFF_ROUTING_MAP_ONLY",
      "NO_RUNTIME_MUTATION: task center owner signoff routing map checker only; no database client, database read, table creation, SQL migration, task write, file upload, storage write, AI call, paid automation, deploy, finance action or production GO",
    ],
    "checker-script read-only token",
    checkerPath,
  );

  forbidPatterns(
    `${panelSource}\n${component}\n${doc}`,
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
    "task-center owner signoff routing map scope",
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
  console.error("HEU Task Center owner signoff routing map readiness check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("HEU Task Center owner signoff routing map readiness check");
console.log("HEU_TASK_CENTER_OWNER_SIGNOFF_ROUTING_MAP_READY: PASS_LOCAL");
console.log("TASK_CENTER_DATABASE_READY: NO_GO_OWNER_SIGNOFF_ROUTING_MAP_ONLY");
console.log(
  "NO_RUNTIME_MUTATION: task center owner signoff routing map checker only; no database client, database read, table creation, SQL migration, task write, file upload, storage write, AI call, paid automation, deploy, finance action or production GO",
);
