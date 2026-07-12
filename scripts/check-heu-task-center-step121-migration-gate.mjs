import { readFileSync } from "node:fs";
import path from "node:path";

const documentPath =
  "docs/HEU_CONTROL/HEU_TASK_CENTER_STEP121_PILOT_MIGRATION_GATE_20260713.md";
const source = readFileSync(path.join(process.cwd(), documentPath), "utf8");
const requiredTokens = [
  "DRAFT_CONTROL",
  "NO_GO_UNTIL_ISOLATED_RESTORE_PROOF",
  "check:heu-task-center-live-schema-readiness",
  "0/5",
  "Source and restore target proven different",
  "Backup/snapshot ID",
  "Apply `database/step121_data_confirmation_task_center.sql` once",
  "require `5/5` objects",
  "HEU_ENABLE_TASK_CENTER_LIVE_READONLY",
  "whole-environment restore",
  "Do not use `DROP TABLE`, `TRUNCATE`, hard delete or cascade",
  "STEP121_DRY_RUN_READY / NO_GO / BLOCKED",
  "does not approve migration",
];

const failures = requiredTokens
  .filter((token) => !source.includes(token))
  .map((token) => `missing token: ${token}`);
if (failures.length > 0) {
  console.error("HEU Task Center step121 migration gate check failed.");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(
  "HEU Task Center step121 migration gate check passed. DRAFT_CONTROL only; migration and production remain NO_GO.",
);
