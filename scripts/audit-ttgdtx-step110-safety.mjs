import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();

function read(relativePath) {
  const filePath = path.join(repoRoot, relativePath);
  if (!existsSync(filePath)) {
    failures.push(`Missing required file: ${relativePath}`);
    return "";
  }

  return readFileSync(filePath, "utf8");
}

const failures = [];
const mainPath = "database/step110_ttgdtx_real_data_evidence_metadata_p2_19.sql";
const preflightPath = "database/step110_preflight_check_before_p2_19.sql";
const postflightPath = "database/step110_postflight_check_p2_19.sql";
const debugPath = "database/step110_find_relation_a_debug.sql";
const runbookPath = "docs/STEP110_P2_19_UAT_RUNBOOK.md";

const main = read(mainPath);
const preflight = read(preflightPath);
const postflight = read(postflightPath);
const debug = read(debugPath);
const runbook = read(runbookPath);

function requireText(contents, relativePath, pattern, label) {
  if (contents && !pattern.test(contents)) {
    failures.push(`${relativePath}: missing ${label}`);
  }
}

function forbidText(contents, relativePath, pattern, label) {
  if (contents && pattern.test(contents)) {
    failures.push(`${relativePath}: contains forbidden ${label}`);
  }
}

requireText(main, mainPath, /migration candidate/i, "migration-candidate boundary");
requireText(main, mainPath, /does not import real student\/bank rows/i, "no raw student/bank import boundary");
requireText(main, mainPath, /Do not run production migration from Codex\/chat/i, "production boundary");
requireText(main, mainPath, /step110_preflight_check_before_p2_19\.sql/i, "preflight instruction");
requireText(main, mainPath, /step110_find_relation_a_debug\.sql/i, "relation-a debug instruction");
requireText(main, mainPath, /HEU_STEP110_CHECKPOINT_06_CONTROL_CHECKS_SEEDED/i, "final checkpoint");

forbidText(main, mainPath, /\bdelete\s+from\b/i, "DELETE FROM");
forbidText(main, mainPath, /\btruncate\b/i, "TRUNCATE");
forbidText(main, mainPath, /\bdrop\s+table\b/i, "DROP TABLE");
forbidText(main, mainPath, /\bon\s+delete\s+cascade\b/i, "ON DELETE CASCADE");
forbidText(main, mainPath, /\barray_agg\s*\(/i, "array_agg call");
forbidText(
  main,
  mainPath,
  /\b(from|join|update|delete\s+from|insert\s+into)\s+"?a"?\b/i,
  'relation alias/table named "a"',
);

const updatedAtIndex = main.indexOf("d.updated_at");
const controlFlagsIndex = main.indexOf("as control_flags");
const readinessIndex = main.indexOf("as readiness_status");
const driveFileIndex = main.indexOf("d.drive_file_id", readinessIndex);

if (
  updatedAtIndex === -1 ||
  controlFlagsIndex === -1 ||
  readinessIndex === -1 ||
  driveFileIndex === -1 ||
  !(updatedAtIndex < controlFlagsIndex && controlFlagsIndex < readinessIndex && readinessIndex < driveFileIndex)
) {
  failures.push(
    `${mainPath}: ttgdtx_source_document_status must preserve Step98 column order and append P2-19 columns after readiness_status`,
  );
}

for (const objectName of [
  "public.ttgdtx_source_documents",
  "public.ttgdtx_source_control_checks",
  "public.ttgdtx_tuition_import_batches",
  "public.ttgdtx_tuition_import_staging_rows",
  "public.active_role_permissions",
  "public.has_permission(text)",
  "public.set_updated_at()",
  "public.write_audit_log()",
]) {
  requireText(
    preflight,
    preflightPath,
    new RegExp(objectName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
    `preflight check for ${objectName}`,
  );
}

requireText(postflight, postflightPath, /HEU_STEP110_POSTFLIGHT_20260626_V001/i, "postflight marker");
requireText(postflight, postflightPath, /p2_19_source_count/i, "P2-19 source count check");
requireText(postflight, postflightPath, /p2_19_check_count/i, "P2-19 check count check");
requireText(postflight, postflightPath, /payout_gate_check_count/i, "payout gate check count");
requireText(postflight, postflightPath, /trigger_status/i, "trigger re-enable check");

requireText(debug, debugPath, /HEU_FIND_RELATION_A_DEBUG_20260626_V004/i, "relation-a debug marker");
requireText(debug, debugPath, /pg_get_viewdef|pg_get_functiondef/i, "database-object search");

requireText(runbook, runbookPath, /Do not run production migration from Codex\/chat/i, "runbook production boundary");
requireText(runbook, runbookPath, /relation "a" does not exist/i, "runbook relation-a recovery");
requireText(runbook, runbookPath, /No bank operation is executed by the app/i, "account-freeze boundary");

if (failures.length > 0) {
  console.error("TTGDTX Step110 safety audit failed.");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(
  "TTGDTX Step110 safety audit passed. Step110 keeps P2-19 metadata-only, preserves source-status view order and includes preflight/postflight/debug checks.",
);
