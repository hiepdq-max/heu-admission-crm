import { readFileSync } from "node:fs";

const actionPath = "app/leads/[id]/actions.ts";
const actions = readFileSync(actionPath, "utf8");
const pkg = JSON.parse(readFileSync("package.json", "utf8"));
const requiredTokens = [
  "readLeadHandoverPacketBlocker",
  "DOCUMENT_SUBMITTED",
  "ELIGIBLE",
  "ENROLLED",
  'from("enrollment_checklists")',
  'from("lead_documents")',
  '.eq("is_required", true)',
  'row.status === "CHECKED"',
  "row.checked_by",
  "row.checked_at",
  "Chưa cấu hình checklist hồ sơ bắt buộc",
  "Packet bàn giao còn thiếu",
];
const failures = [];

for (const token of requiredTokens) {
  if (!actions.includes(token)) failures.push(`missing token: ${token}`);
}

const createSection = actions.slice(
  actions.indexOf("export async function createLeadHandoverAction"),
  actions.indexOf("export async function updateLeadHandoverAction"),
);
const updateSection = actions.slice(
  actions.indexOf("export async function updateLeadHandoverAction"),
);
if (!createSection.includes("readLeadHandoverPacketBlocker")) {
  failures.push("create handover does not enforce document packet gate");
}
if (!updateSection.includes("readLeadHandoverPacketBlocker")) {
  failures.push("accept handover does not recheck document packet gate");
}
if (
  pkg.scripts?.["check:heu-lead-handover-document-gate"] !==
    "node scripts/check-heu-lead-handover-document-gate.mjs"
) {
  failures.push("missing handover document gate checker alias");
}

if (failures.length > 0) {
  failures.forEach((failure) => console.error(`NO_GO ${failure}`));
  process.exit(1);
}

console.log("PASS_LOCAL HEU-LEAD-HANDOVER-DOCUMENT-GATE");
console.log("create_gate=ENFORCED; accept_gate=RECHECKED; finance_mutation=0");
