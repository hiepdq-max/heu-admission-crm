import { readFileSync } from "node:fs";
import path from "node:path";

const sql = readFileSync(
  path.join(process.cwd(), "database/step115_pilot_least_privilege_roles.sql"),
  "utf8",
);
const failures = [];
const roles = [
  "PILOT_ADMISSION_HEAD",
  "PILOT_COUNSELOR",
  "PILOT_ACCOUNTING_LEAD_READONLY",
  "PILOT_ACCOUNTING_READONLY",
];
const positions = [
  "TUYEN_SINH_HEAD",
  "TUYEN_SINH_01",
  "KE_TOAN_DEPUTY",
  "KE_TOAN_01",
  "KE_TOAN_02",
];

for (const token of [
  "DRAFT_CONTROL",
  "HEU-PILOT-ROLE-001",
  "on conflict (role_id, permission) do update",
  "status = 'INACTIVE'",
  "PILOT_ROLE_REVOKED",
  "u.status = 'INACTIVE'",
  "a.assignment_status = 'ACTIVE_ASSIGNED'",
  "Auth BANNED",
]) {
  if (!sql.includes(token)) failures.push(`missing control token: ${token}`);
}
for (const role of roles) {
  if (!sql.includes(`'${role}'`)) failures.push(`missing role: ${role}`);
}
for (const position of positions) {
  if (!sql.includes(`'${position}'`)) failures.push(`missing position: ${position}`);
}

const allowlistBlock = sql.match(
  /insert into _heu_pilot_allowed_permissions[\s\S]*?;\s*\n\s*insert into public\.role_permissions/i,
)?.[0] ?? "";
const forbidden = [
  /'hou\./i,
  /'short_course\./i,
  /'payments\.(?:verify|approve|pay|manage|create|update)'/i,
  /'ttgdtx\.[^']+\.(?:approve|manage|create|update|resolve|close|lock)'/i,
  /'reports\.read_all'/i,
];
for (const pattern of forbidden) {
  if (pattern.test(allowlistBlock)) failures.push(`forbidden permission: ${pattern}`);
}

const permissionRows = [...allowlistBlock.matchAll(/\('PILOT_[A-Z_]+',\s*'([^']+)'\)/g)];
if (permissionRows.length !== 63) {
  failures.push(`allowlist rows expected=63 actual=${permissionRows.length}`);
}
for (const required of [
  "('PILOT_ADMISSION_HEAD', 'handover.create')",
  "('PILOT_COUNSELOR', 'leads.read_assigned')",
  "('PILOT_ACCOUNTING_READONLY', 'finance_desk.read')",
]) {
  if (!allowlistBlock.includes(required)) failures.push(`missing grant: ${required}`);
}

if (/delete\s+from/i.test(sql)) failures.push("hard delete found");
if (/service[_-]?role|api[_-]?key|token\s*[:=]/i.test(sql)) {
  failures.push("secret-bearing token found");
}

if (failures.length > 0) {
  for (const failure of failures) {
    console.error(`HEU_PILOT_LEAST_PRIVILEGE_ROLES: NO_GO - ${failure}`);
  }
  process.exit(1);
}

console.log("HEU_PILOT_LEAST_PRIVILEGE_ROLES: PASS_LOCAL_SQL_SOURCE");
console.log("pilot_roles=4");
console.log("mapped_positions=5");
console.log("hou_permissions=0");
console.log("short_course_permissions=0");
console.log("finance_mutation_permissions=0");
console.log("hard_delete=0");
console.log("database_apply=NOT_PERFORMED");
console.log("production=NO_GO");
