import { readFileSync } from "node:fs";
import path from "node:path";

const read = (file) => readFileSync(path.join(process.cwd(), file), "utf8");
const shell = read("components/layout/app-shell.tsx");
const taskCenter = read("lib/task-center-contract.ts");
const display = read("lib/heu-os-display.ts");
const houPage = read("app/hou/page.tsx");
const houActions = read("app/hou/actions.ts");
const leadPage = read("app/leads/[id]/page.tsx");
const failures = [];

const pilotRoles = [
  "PILOT_ADMISSION_HEAD",
  "PILOT_COUNSELOR",
  "PILOT_ACCOUNTING_LEAD_READONLY",
  "PILOT_ACCOUNTING_READONLY",
];

for (const role of pilotRoles) {
  if (!shell.includes(`"${role}"`)) failures.push(`AppShell role missing: ${role}`);
  if (!taskCenter.includes(`"${role}"`)) failures.push(`Task Center role missing: ${role}`);
  if (!display.includes(`${role}:`)) failures.push(`display label missing: ${role}`);
}

for (const role of pilotRoles) {
  for (const [file, contents] of [
    ["app/hou/page.tsx", houPage],
    ["app/hou/actions.ts", houActions],
    ["app/leads/[id]/page.tsx", leadPage],
  ]) {
    if (contents.includes(role)) failures.push(`pilot role leaked to HOU surface: ${role} in ${file}`);
  }
}

for (const token of [
  'permission: "finance_desk.read"',
  'permission: "leads.import"',
  'permission: "partners.manage"',
]) {
  if (!shell.includes(token)) failures.push(`expected permission gate missing: ${token}`);
}

if (!shell.includes('accessMode: "ALL"')) {
  failures.push("role plus permission ALL gate missing");
}

if (failures.length > 0) {
  for (const failure of failures) {
    console.error(`HEU_PILOT_ROLE_RUNTIME_ROUTING: NO_GO - ${failure}`);
  }
  process.exit(1);
}

console.log("HEU_PILOT_ROLE_RUNTIME_ROUTING: PASS_LOCAL");
console.log("pilot_roles=4");
console.log("admission_navigation=ROLE_AND_PERMISSION_GATED");
console.log("finance_navigation=READ_PERMISSION_GATED");
console.log("task_center_lane_mapping=READY");
console.log("hou_role_routing=BLOCKED");
console.log("database_write=NOT_PERFORMED");
console.log("production=NO_GO");
