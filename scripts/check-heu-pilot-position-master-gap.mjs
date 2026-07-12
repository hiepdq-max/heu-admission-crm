import { readFileSync } from "node:fs";
import path from "node:path";

const sourcePath = path.join(
  process.cwd(),
  "database/step114_organization_position_permission_matrix.sql",
);
const source = readFileSync(sourcePath, "utf8");
const failures = [];

const requiredRows = new Map([
  [
    "HEU_SYSTEM_ADMIN",
    "('HEU_SYSTEM_ADMIN', 'Quan tri he thong HEU', 'IT_DATA', 'IT_DATA', 'IT_DATA_HEAD', 'HT'",
  ],
  [
    "KE_TOAN_DEPUTY",
    "('KE_TOAN_DEPUTY', 'Pho phong ke toan', 'PHONG_KHTC', 'ACCOUNTING', 'ACCOUNTING_LEAD', 'KE_TOAN_TRUONG'",
  ],
]);

for (const [positionCode, rowPrefix] of requiredRows) {
  if (!source.includes(rowPrefix)) {
    failures.push(`missing or unsafe position row: ${positionCode}`);
  }
}

for (const token of [
  "on conflict (position_code) do update set",
  "idx_heu_position_assignments_active_position",
  "idx_heu_position_assignments_active_user",
  "assignment_status in ('PENDING_USER', 'ACTIVE_ASSIGNED', 'REVOKED', 'BLOCKED')",
]) {
  if (!source.includes(token)) {
    failures.push(`missing existing position safety guard: ${token}`);
  }
}

if (failures.length > 0) {
  for (const failure of failures) {
    console.error(`HEU_PILOT_POSITION_MASTER_GAP: NO_GO - ${failure}`);
  }
  process.exit(1);
}

console.log("HEU_PILOT_POSITION_MASTER_GAP: PASS_LOCAL_SQL_SOURCE");
console.log("new_position_rows=2");
console.log("system_admin_default_role=IT_DATA_HEAD");
console.log("accounting_deputy_default_role=ACCOUNTING_LEAD");
console.log("one_active_position_per_user=GUARDED");
console.log("database_apply=NOT_PERFORMED");
console.log("migration=NO_GO_UNTIL_BACKUP_ROLLBACK_AND_APPROVAL");
console.log("production=NO_GO");
