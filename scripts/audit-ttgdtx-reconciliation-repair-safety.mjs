import { readFileSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();

function read(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), "utf8");
}

const step101Path = "database/step101_ttgdtx_reconciliation_p2_13.sql";
const step102Path = "database/step102_fix_p2_13_partner_status.sql";
const step103Path = "database/step103_fix_p2_13_reconciliation_line_columns.sql";

const step101Sql = read(step101Path);
const step102Sql = read(step102Path);
const step103Sql = read(step103Path);
const failures = [];

function fail(message) {
  failures.push(message);
}

for (const [relativePath, sql] of [
  [step102Path, step102Sql],
  [step103Path, step103Sql],
]) {
  if (!/Migration candidate only\. Do not run production migration from Codex\/chat\./i.test(sql)) {
    fail(`${relativePath}: missing production migration boundary`);
  }

  if (!/retired/i.test(sql) || !/No changes applied/i.test(sql)) {
    fail(`${relativePath}: must clearly be marked retired/no-op`);
  }

  if (/create\s+or\s+replace\s+function|update\s+public\.|insert\s+into\s+public\.|alter\s+table\s+public\.|delete\s+from|truncate|drop\s+table/i.test(sql)) {
    fail(`${relativePath}: retired repair file must not mutate schema or business data`);
  }
}

if (
  !/create or replace function public\.create_ttgdtx_reconciliation_batch[\s\S]*invoice_required[\s\S]*invoice_issuer[\s\S]*invoice_status[\s\S]*invoice_no[\s\S]*invoice_control_status/i.test(
    step101Sql,
  )
) {
  fail(`${step101Path}: reconciliation batch function must preserve invoice-control columns`);
}

if (
  !/p\.invoice_control_status <> 'RESOLVED'[\s\S]*NEEDS_INVOICE_DECISION/i.test(
    step101Sql,
  )
) {
  fail(`${step101Path}: reconciliation candidates must block unresolved invoice/receipt decisions`);
}

if (failures.length > 0) {
  console.error("TTGDTX reconciliation repair safety audit failed.");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("TTGDTX reconciliation repair safety audit passed. Step102/Step103 are retired and Step101 preserves invoice-control logic.");
