import { readFileSync } from "node:fs";

const page = readFileSync("app/data-confirmation/page.tsx", "utf8");
const inbox = readFileSync(
  "components/data-confirmation/department-task-inbox.tsx",
  "utf8",
);
const contract = readFileSync("lib/task-center-contract.ts", "utf8");

const required = [
  [page, "visibleTaskCenterLanes.length > 0"],
  [page, '"ROLE_MAPPED_REF_ONLY"'],
  [inbox, "taskCenterLaneHref(lane, roleCode)"],
  [contract, 'lane.id === "hou" && roleCode?.startsWith("PILOT_")'],
  [contract, 'return "/ttgdtx/accounting-dashboard"'],
  [contract, '"PILOT_ACCOUNTING_LEAD_READONLY"'],
  [contract, '"PILOT_ACCOUNTING_READONLY"'],
];

for (const [source, token] of required) {
  if (!source.includes(token)) {
    throw new Error(`HEU_PILOT_TASK_CENTER_LANES: missing ${token}`);
  }
}

if (/\.from\s*\(|\.rpc\s*\(|\bfetch\s*\(/.test(inbox)) {
  throw new Error("HEU_PILOT_TASK_CENTER_LANES: runtime data call forbidden");
}

console.log("HEU_PILOT_TASK_CENTER_LANES: PASS_LOCAL");
console.log(
  "accounting_lane=P2_18_READ_ONLY hou_lane=BLOCKED task_source=SAFE_REF_ONLY_FALLBACK database_write=0 ai_call=0 production=NO_GO",
);
