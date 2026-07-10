import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const failures = [];

const componentPath = "components/data-confirmation/department-task-inbox.tsx";
const panelSourcePath = "lib/task-center-gate-evidence-panel-source.ts";
const docPath =
  "docs/HEU_CONTROL/HEU_DATA_014_TASK_CENTER_PILOT_REVIEW_PACKET_20260710.md";
const uatEvidenceDocPath =
  "docs/HEU_CONTROL/HEU_DATA_013_TASK_CENTER_UAT_EVIDENCE_CHECKLIST_20260710.md";
const ownerSignoffDocPath =
  "docs/HEU_CONTROL/HEU_DATA_015_TASK_CENTER_OWNER_SIGNOFF_ROUTING_MAP_20260710.md";
const manifestPath =
  "docs/HEU_CONTROL/HEU_APP_SHELL_001_STAGE_FILE_MANIFEST_20260709.md";
const uatEvidenceCheckerPath =
  "scripts/check-heu-task-center-uat-evidence-checklist-readiness.mjs";
const ownerSignoffCheckerPath =
  "scripts/check-heu-task-center-owner-signoff-routing-map-readiness.mjs";
const checkerPath =
  "scripts/check-heu-task-center-pilot-review-packet-readiness.mjs";
const packagePath = "package.json";
const checkerAlias = "check:heu-task-center-pilot-review-packet-readiness";
const checkerCommand = `node ${checkerPath}`;
const ownerSignoffCheckerAlias =
  "check:heu-task-center-owner-signoff-routing-map-readiness";
const ownerSignoffCheckerCommand = `node ${ownerSignoffCheckerPath}`;

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
  uatEvidenceDocPath,
  ownerSignoffDocPath,
  manifestPath,
  uatEvidenceCheckerPath,
  ownerSignoffCheckerPath,
  checkerPath,
  packagePath,
]) {
  requireFile(file);
}

if (failures.length === 0) {
  const component = read(componentPath);
  const panelSource = read(panelSourcePath);
  const doc = read(docPath);
  const uatEvidenceDoc = read(uatEvidenceDocPath);
  const ownerSignoffDoc = read(ownerSignoffDocPath);
  const manifest = read(manifestPath);
  const uatEvidenceChecker = read(uatEvidenceCheckerPath);
  const ownerSignoffChecker = read(ownerSignoffCheckerPath);
  const checkerScript = read(checkerPath);
  const packageJson = JSON.parse(read(packagePath));

  requireTokens(
    panelSource,
    [
      "TASK_CENTER_PILOT_REVIEW_PACKET_ONLY",
      "TASK_CENTER_PILOT_REVIEW_PACKET_READONLY",
      "TASK_CENTER_PILOT_REVIEW_PACKET_DRAFT_ONLY",
      "TASK_CENTER_PILOT_REVIEW_PACKET_NO_APPROVAL",
      "TASK_CENTER_PILOT_REVIEW_PACKET_NO_UPLOAD",
      "TASK_CENTER_PILOT_REVIEW_PACKET_NO_STORAGE_WRITE",
      "TASK_CENTER_PILOT_REVIEW_PACKET_NO_RAW_PII",
      "TaskCenterPilotReviewPacketItem",
      "pilotReviewPacketItems",
      "PILOT_REVIEW_SCOPE_MATCH",
      "PILOT_REVIEW_GATE_NO_GO",
      "PILOT_REVIEW_RESTRICTED_DATA",
      "PILOT_REVIEW_OWNER_LANGUAGE",
      "PILOT_REVIEW_PRODUCTION_BOUNDARY",
      "requiredReviewer: \"IT_DATA\"",
      "requiredReviewer: \"AUDIT\"",
      "requiredReviewer: \"PHAP_CHE\"",
      "requiredReviewer: \"DEPARTMENT_OWNER\"",
      "requiredReviewer: \"BGH\"",
      "production remains NO-GO",
    ],
    "pilot review packet source token",
    panelSourcePath,
  );

  requireTokens(
    component,
    [
      "TASK_CENTER_PILOT_REVIEW_PACKET_ONLY",
      "TASK_CENTER_PILOT_REVIEW_PACKET_READONLY",
      "TASK_CENTER_PILOT_REVIEW_PACKET_DRAFT_ONLY",
      "TASK_CENTER_PILOT_REVIEW_PACKET_NO_APPROVAL",
      "TASK_CENTER_PILOT_REVIEW_PACKET_NO_UPLOAD",
      "TASK_CENTER_PILOT_REVIEW_PACKET_NO_STORAGE_WRITE",
      "TASK_CENTER_PILOT_REVIEW_PACKET_NO_RAW_PII",
      "data-heu-task-center-pilot-review-packet",
      "data-heu-task-center-pilot-review-packet-readonly",
      "data-heu-task-center-pilot-review-packet-draft-only",
      "data-heu-task-center-pilot-review-packet-no-approval",
      "data-heu-task-center-pilot-review-packet-no-upload",
      "data-heu-task-center-pilot-review-packet-no-storage-write",
      "data-heu-task-center-pilot-review-packet-no-raw-pii",
      "data-heu-task-center-pilot-review-item",
      "data-heu-task-center-pilot-review-reviewer",
      "HEU-Data-014 - Pilot review packet",
      "Bo goi review pilot truoc khi mo DB read",
      "gateEvidence.pilotReviewPacket.items.map",
      "production remains NO-GO",
    ],
    "component pilot review packet token",
    componentPath,
  );

  requireTokens(
    doc,
    [
      "HEU-DATA-014-TASK-CENTER-PILOT-REVIEW-PACKET",
      "Status: PASS_LOCAL_PILOT_REVIEW_PACKET",
      "Production status: NO-GO",
      "TASK_CENTER_PILOT_REVIEW_PACKET_ONLY",
      "TASK_CENTER_PILOT_REVIEW_PACKET_READONLY",
      "TASK_CENTER_PILOT_REVIEW_PACKET_DRAFT_ONLY",
      "TASK_CENTER_PILOT_REVIEW_PACKET_NO_APPROVAL",
      "TASK_CENTER_PILOT_REVIEW_PACKET_NO_UPLOAD",
      "TASK_CENTER_PILOT_REVIEW_PACKET_NO_STORAGE_WRITE",
      "TASK_CENTER_PILOT_REVIEW_PACKET_NO_RAW_PII",
      "TASK_CENTER_GATE_EVIDENCE_PANEL_DATABASE_NO_GO",
      "NO_DATABASE_CLIENT_CREATED",
      "NO_DATABASE_READ_EXECUTED",
      "NO_SQL_MIGRATION_CREATED",
      "NO_TASK_MUTATION_ROUTE_CREATED",
      "NO_AI_CALL_NO_AUTOMATION_STEP",
      "PILOT_REVIEW_SCOPE_MATCH",
      "PILOT_REVIEW_GATE_NO_GO",
      "PILOT_REVIEW_RESTRICTED_DATA",
      "PILOT_REVIEW_OWNER_LANGUAGE",
      "PILOT_REVIEW_PRODUCTION_BOUNDARY",
      "TASK_CENTER_DATABASE_READY: NO_GO",
      "CAN_SUA_IT_DATA_AUDIT_PHAP_CHE_OWNER_BGH",
      "Task Center owner signoff routing map",
      "HEU-DATA-015-TASK-CENTER-OWNER-SIGNOFF-ROUTING-MAP",
      "check:heu-task-center-owner-signoff-routing-map-readiness",
      "still no DB read and no migration",
    ],
    "pilot review packet doc token",
    docPath,
  );

  requireTokens(
    ownerSignoffDoc,
    [
      "HEU-DATA-015-TASK-CENTER-OWNER-SIGNOFF-ROUTING-MAP",
      "PASS_LOCAL_OWNER_SIGNOFF_ROUTING_MAP",
      "TASK_CENTER_OWNER_SIGNOFF_ROUTING_MAP_NO_DATABASE_READ",
      "TASK_CENTER_OWNER_SIGNOFF_ROUTING_MAP_NO_TASK_MUTATION",
      "TASK_CENTER_OWNER_SIGNOFF_ROUTING_MAP_NO_AI_OR_AUTOMATION",
      "TASK_CENTER_DATABASE_READY: NO_GO",
      "Task Center read-only adapter decision ledger",
      "still no DB read and no migration",
    ],
    "owner signoff routing next-slice doc token",
    ownerSignoffDocPath,
  );

  requireTokens(
    uatEvidenceDoc,
    [
      "HEU-DATA-014-TASK-CENTER-PILOT-REVIEW-PACKET",
      "real-user pilot review packet",
      "still no DB read and no migration",
      "check:heu-task-center-pilot-review-packet-readiness",
    ],
    "UAT evidence checklist next-slice token",
    uatEvidenceDocPath,
  );

  requireTokens(
    manifest,
    [
      componentPath,
      panelSourcePath,
      docPath,
      ownerSignoffDocPath,
      checkerPath,
      ownerSignoffCheckerPath,
      "check:heu-task-center-pilot-review-packet-readiness",
      "check:heu-task-center-owner-signoff-routing-map-readiness",
      "node --check scripts/check-heu-task-center-pilot-review-packet-readiness.mjs",
      "node --check scripts/check-heu-task-center-owner-signoff-routing-map-readiness.mjs",
      "npm.cmd run check:heu-task-center-pilot-review-packet-readiness",
      "npm.cmd run check:heu-task-center-owner-signoff-routing-map-readiness",
    ],
    "manifest pilot review packet token",
    manifestPath,
  );

  requireTokens(
    uatEvidenceChecker,
    [
      "HEU-DATA-014-TASK-CENTER-PILOT-REVIEW-PACKET",
      "check:heu-task-center-pilot-review-packet-readiness",
      docPath,
      checkerPath,
    ],
    "UAT evidence checker next-slice token",
    uatEvidenceCheckerPath,
  );

  requireTokens(
    ownerSignoffChecker,
    [
      "HEU_TASK_CENTER_OWNER_SIGNOFF_ROUTING_MAP_READY: PASS_LOCAL",
      "TASK_CENTER_DATABASE_READY: NO_GO_OWNER_SIGNOFF_ROUTING_MAP_ONLY",
      docPath,
      ownerSignoffDocPath,
    ],
    "owner signoff routing checker token",
    ownerSignoffCheckerPath,
  );

  if (packageJson.scripts?.[checkerAlias] !== checkerCommand) {
    fail(`${packagePath}: missing or mismatched ${checkerAlias}`);
  }

  if (
    packageJson.scripts?.[ownerSignoffCheckerAlias] !==
    ownerSignoffCheckerCommand
  ) {
    fail(`${packagePath}: missing or mismatched ${ownerSignoffCheckerAlias}`);
  }

  requireTokens(
    checkerScript,
    [
      "existsSync",
      "readFileSync",
      "HEU_TASK_CENTER_PILOT_REVIEW_PACKET_READY: PASS_LOCAL",
      "TASK_CENTER_DATABASE_READY: NO_GO_PILOT_REVIEW_PACKET_ONLY",
      "NO_RUNTIME_MUTATION: task center pilot review packet checker only; no database client, database read, table creation, SQL migration, task write, file upload, storage write, AI call, paid automation, deploy, finance action or production GO",
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
    "task-center pilot review packet scope",
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
  console.error("HEU Task Center pilot review packet readiness check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("HEU Task Center pilot review packet readiness check");
console.log("HEU_TASK_CENTER_PILOT_REVIEW_PACKET_READY: PASS_LOCAL");
console.log("TASK_CENTER_DATABASE_READY: NO_GO_PILOT_REVIEW_PACKET_ONLY");
console.log(
  "NO_RUNTIME_MUTATION: task center pilot review packet checker only; no database client, database read, table creation, SQL migration, task write, file upload, storage write, AI call, paid automation, deploy, finance action or production GO",
);
