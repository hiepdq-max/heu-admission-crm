import { readFileSync } from "node:fs";

const boundary = readFileSync("lib/pilot-route-boundary.ts", "utf8");
const routes = [
  "app/hou/page.tsx",
  "app/short-course/page.tsx",
  "app/ttgdtx/payment-requests/pay/page.tsx",
];
const pilotRoles = [
  "PILOT_ADMISSION_HEAD",
  "PILOT_COUNSELOR",
  "PILOT_ACCOUNTING_LEAD_READONLY",
  "PILOT_ACCOUNTING_READONLY",
];

for (const role of pilotRoles) {
  if (!boundary.includes(`"${role}"`)) {
    throw new Error(`HEU_PILOT_ROUTE_BOUNDARY: missing role ${role}`);
  }
}

for (const route of routes) {
  const source = readFileSync(route, "utf8");
  if (!source.includes("isPilotBlockedFromNonCoreRoute")) {
    throw new Error(`HEU_PILOT_ROUTE_BOUNDARY: missing guard ${route}`);
  }
  if (!source.includes('redirect("/")')) {
    throw new Error(`HEU_PILOT_ROUTE_BOUNDARY: missing fail-closed redirect ${route}`);
  }
}

console.log("HEU_PILOT_ROUTE_BOUNDARY: PASS_LOCAL");
console.log("guarded_routes=3 pilot_roles=4 database_write=0 production=NO_GO");
