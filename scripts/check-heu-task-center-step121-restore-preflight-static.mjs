import { readFileSync } from "node:fs";

const checkerPath = "scripts/check-heu-task-center-step121-restore-preflight.mjs";
const source = readFileSync(checkerPath, "utf8");
const pkg = JSON.parse(readFileSync("package.json", "utf8"));
const requiredTokens = [
  "HEU_TASK_CENTER_SOURCE_ENV_FILE",
  "HEU_TASK_CENTER_RESTORE_ENV_FILE",
  "HEU_TASK_CENTER_BACKUP_ID",
  "HEU_TASK_CENTER_RESTORE_SMOKE_PROOF",
  "SOURCE-EQUALS-RESTORE",
  "source_restore_distinct=true",
  "task_center_objects=",
  "row_read=0; rpc_call=0; mutation=0",
  "migration_executed=0",
  "production=NO_GO",
];
const forbiddenPatterns = [
  /\.from\s*\([^)]*\)\s*\.(?:insert|update|upsert|delete)\s*\(/,
  /\.rpc\s*\(/,
  /\b(?:drop|truncate|alter|create)\s+(?:table|function|policy|trigger)\b/i,
  /\b(?:password|otp|magiclink)\b/i,
  /openai|anthropic|gemini/i,
];
const failures = [];

for (const token of requiredTokens) {
  if (!source.includes(token)) failures.push(`missing token: ${token}`);
}
for (const pattern of forbiddenPatterns) {
  if (pattern.test(source)) failures.push(`forbidden pattern: ${pattern}`);
}
if (
  pkg.scripts?.["check:heu-task-center-step121-restore-preflight"] !==
    `node ${checkerPath}`
) {
  failures.push("missing live preflight alias");
}
if (
  pkg.scripts?.["check:heu-task-center-step121-restore-preflight-static"] !==
    "node scripts/check-heu-task-center-step121-restore-preflight-static.mjs"
) {
  failures.push("missing static preflight alias");
}

if (failures.length > 0) {
  failures.forEach((failure) => console.error(`NO_GO ${failure}`));
  process.exit(1);
}

console.log("PASS_LOCAL HEU-TASK-CENTER-STEP121-RESTORE-PREFLIGHT-STATIC");
console.log("metadata_only=true; migration=NO_GO; production=NO_GO");
