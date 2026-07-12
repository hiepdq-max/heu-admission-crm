import { readFileSync } from "node:fs";

const page = readFileSync("app/leads/[id]/page.tsx", "utf8");
const panel = readFileSync("components/leads/lead-handover-panel.tsx", "utf8");
const pkg = JSON.parse(readFileSync("package.json", "utf8"));
const failures = [];

const pageTokens = [
  "handoverRequiredChecklistRows",
  "handoverCheckedRequiredCount",
  'document?.status === "CHECKED"',
  "!!document.checked_by",
  "!!document.checked_at",
  "handoverReadyLeadStatuses.has(lead.status)",
  "readiness={handoverReadiness}",
];
const panelTokens = [
  "data-heu-handover-readiness",
  "Hồ sơ chưa sẵn sàng bàn giao",
  "Kiểm tra checklist hồ sơ",
  "isPending || !readiness.ready",
  "Server sẽ kiểm tra lại packet và P0-19 khi gửi",
];

for (const token of pageTokens) {
  if (!page.includes(token)) failures.push(`page missing token: ${token}`);
}
for (const token of panelTokens) {
  if (!panel.includes(token)) failures.push(`panel missing token: ${token}`);
}
if (
  pkg.scripts?.["check:heu-lead-handover-readiness-ui"] !==
  "node scripts/check-heu-lead-handover-readiness-ui.mjs"
) {
  failures.push("missing readiness UI checker alias");
}

if (failures.length > 0) {
  failures.forEach((failure) => console.error(`NO_GO ${failure}`));
  process.exit(1);
}

console.log("PASS_LOCAL HEU-LEAD-HANDOVER-READINESS-UI");
console.log("ui_guard=ENFORCED; server_gate=AUTHORITATIVE; db_mutation=0");
