import { readFileSync } from "node:fs";

const model = readFileSync("lib/task-center-mock-read-model.ts", "utf8");
const inbox = readFileSync(
  "components/data-confirmation/department-task-inbox.tsx",
  "utf8",
);
const pkg = JSON.parse(readFileSync("package.json", "utf8"));
const requiredTokens = [
  "PILOT-ADMISSION-ACTOR-001",
  "PILOT-ADMISSION-DOCUMENT-002",
  "PILOT-ADMISSION-HANDOVER-003",
  "PILOT-CTHSSV-001",
  "PILOT-TRAINING-001",
  "PILOT-FINANCE-READONLY-001",
  "PILOT-CONTROL-001",
  "không ghi thu, không duyệt và không chuyển tiền",
  "không fallback sang dữ liệu phòng khác",
  "TASK_CENTER_PILOT_ACTION_HREF_ALLOWLIST",
  'actionHref: "/leads?quick=unassigned"',
  'actionHref: "/leads?quick=documents"',
  'actionHref: "/ttgdtx/accounting-dashboard"',
  'actionHref: "/data-confirmation"',
];
const failures = [];
const allowedActionHrefs = new Set([
  "/leads?quick=unassigned",
  "/leads?quick=documents",
  "/cthssv",
  "/khoa",
  "/ttgdtx/accounting-dashboard",
  "/settings/scopes",
  "/data-confirmation",
]);
const taskActionHrefs = [...model.matchAll(/actionHref:\s*"([^"]+)"/g)].map(
  (match) => match[1],
);

for (const token of requiredTokens) {
  if (!model.includes(token)) failures.push(`missing token: ${token}`);
}
if (/MOCK-HOU-001|PILOT-HOU|sourceModule:\s*"hou"/.test(model)) {
  failures.push("HOU task is outside the 7-day pilot scope");
}
if (taskActionHrefs.length !== 8) {
  failures.push(`expected 8 task action routes, found ${taskActionHrefs.length}`);
}
for (const href of taskActionHrefs) {
  if (!allowedActionHrefs.has(href)) {
    failures.push(`task action route is outside allowlist: ${href}`);
  }
}
if (!inbox.includes("Checklist pilot theo lane đang hiển thị")) {
  failures.push("pilot checklist label is missing");
}
if (!inbox.includes("resolveTaskCenterMockActionHref(task)")) {
  failures.push("pilot task action is not resolved through the allowlist");
}
if (!inbox.includes("data-heu-task-center-pilot-action")) {
  failures.push("pilot task action marker is missing");
}
if (inbox.includes("href={task.actionHref}")) {
  failures.push("pilot task action bypasses the allowlist resolver");
}
if (/Dá»|Tráº|Â·/.test(inbox)) {
  failures.push("Vietnamese mojibake remains in Task Center inbox");
}
if (
  pkg.scripts?.["check:heu-task-center-pilot-checklist-fallback"] !==
    "node scripts/check-heu-task-center-pilot-checklist-fallback.mjs"
) {
  failures.push("missing pilot checklist checker alias");
}

if (failures.length > 0) {
  failures.forEach((failure) => console.error(`NO_GO ${failure}`));
  process.exit(1);
}

console.log("PASS_LOCAL HEU-TASK-CENTER-PILOT-CHECKLIST-FALLBACK");
console.log("hou=BLOCKED; database_read=0; mutation=0; ai_runtime=0");
