import { readFileSync } from "node:fs";
import path from "node:path";

const page = readFileSync(
  path.join(process.cwd(), "app/data-confirmation/page.tsx"),
  "utf8",
);
const component = readFileSync(
  path.join(
    process.cwd(),
    "components/data-confirmation/task-center-live-readonly-list.tsx",
  ),
  "utf8",
);
const combined = `${page}\n${component}`;
const requiredTokens = [
  "HEU_ENABLE_TASK_CENTER_LIVE_READONLY",
  "heuWorkspace.actionGate.canReadScopedData",
  "visibleTaskCenterLanes.map",
  "workspace.activeSegmentId",
  "readTaskCenterLiveReadonly",
  "TaskCenterLiveReadonlyList",
  'data-heu-task-center-live-readonly-boundary="FAIL_CLOSED_FALLBACK_ONLY"',
  'data-heu-task-center-live-readonly-boundary="VIEW_ONLY_NO_RPC_NO_MUTATION"',
  "Khong co task live trong pham vi hien tai.",
];
const forbiddenPatterns = [
  /\.insert\s*\(/,
  /\.update\s*\(/,
  /\.upsert\s*\(/,
  /\.delete\s*\(/,
  /\.rpc\s*\(/,
  /<form\b/i,
  /openai|anthropic|chatgpt/i,
];

const failures = requiredTokens
  .filter((token) => !combined.includes(token))
  .map((token) => `missing token: ${token}`);
for (const pattern of forbiddenPatterns) {
  if (pattern.test(combined)) failures.push(`forbidden pattern: ${pattern}`);
}

if (failures.length > 0) {
  console.error("HEU Task Center live read-only UI check failed.");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(
  "HEU Task Center live read-only UI check passed. Flag + workspace gate required; no form/RPC/mutation/AI.",
);
