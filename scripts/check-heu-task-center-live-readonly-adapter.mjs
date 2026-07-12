import { readFileSync } from "node:fs";
import path from "node:path";

const adapterPath = "lib/task-center-live-readonly-adapter.ts";
const source = readFileSync(path.join(process.cwd(), adapterPath), "utf8");
const requiredTokens = [
  "TASK_CENTER_LIVE_READONLY_ADAPTER",
  "heu_data_confirmation_task_center",
  "TASK_CENTER_LIVE_PAGE_LIMIT = 50",
  "No department scope; broad fallback is forbidden.",
  '.in("department_code", scopedDepartments)',
  '.eq("admission_segment_id", options.admissionSegmentId)',
  'status: "SCHEMA_UNAVAILABLE"',
  "databaseReadExecuted: false",
  "Scoped Task Center view is unavailable; no broad fallback.",
];
const forbiddenPatterns = [
  /\.insert\s*\(/,
  /\.update\s*\(/,
  /\.upsert\s*\(/,
  /\.delete\s*\(/,
  /\.rpc\s*\(/,
  /service[_-]?role/i,
  /openai|anthropic|chatgpt/i,
];

const failures = requiredTokens
  .filter((token) => !source.includes(token))
  .map((token) => `missing token: ${token}`);
for (const pattern of forbiddenPatterns) {
  if (pattern.test(source)) failures.push(`forbidden pattern: ${pattern}`);
}

if (failures.length > 0) {
  console.error("HEU Task Center live read-only adapter check failed.");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(
  "HEU Task Center live read-only adapter check passed. Scope-first, limit 50, fail-closed, no RPC/mutation/AI.",
);
