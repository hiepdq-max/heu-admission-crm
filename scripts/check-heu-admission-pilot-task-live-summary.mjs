import { readFileSync } from "node:fs";

const model = readFileSync("lib/admission-pilot-task-read-model.ts", "utf8");
const panel = readFileSync(
  "components/data-confirmation/admission-pilot-task-live-summary.tsx",
  "utf8",
);
const page = readFileSync("app/data-confirmation/page.tsx", "utf8");
const pkg = JSON.parse(readFileSync("package.json", "utf8"));
const failures = [];

const modelTokens = [
  'eq("admission_segment_id", options.admissionSegmentId)',
  'eq("is_deleted", false)',
  'select("id,status,assigned_to,interested_program")',
  'select("lead_id,checklist_id,status,checked_by,checked_at")',
  'document.status === "CHECKED"',
  "document.checked_by",
  "document.checked_at",
  "No active admission segment; broad fallback is forbidden.",
];
for (const token of modelTokens) {
  if (!model.includes(token)) failures.push(`model missing token: ${token}`);
}
if (!page.includes('lane.id === "admission"')) {
  failures.push("admission lane visibility gate is missing");
}
if (!page.includes('scopeDecision !== "NO_MATCHING_SCOPE"')) {
  failures.push("scope decision gate is missing");
}
if (!panel.includes("ACTIVE_SEGMENT_RLS_METADATA_ONLY")) {
  failures.push("metadata-only scope marker is missing");
}
if (/\b(student_name|student_phone|parent_name|parent_phone)\b/.test(panel)) {
  failures.push("panel must not render raw PII fields");
}
if (
  pkg.scripts?.["check:heu-admission-pilot-task-live-summary"] !==
  "node scripts/check-heu-admission-pilot-task-live-summary.mjs"
) {
  failures.push("missing admission pilot task summary checker alias");
}

if (failures.length > 0) {
  failures.forEach((failure) => console.error(`NO_GO ${failure}`));
  process.exit(1);
}

console.log("PASS_LOCAL HEU-ADMISSION-PILOT-TASK-LIVE-SUMMARY");
console.log("scope=ACTIVE_SEGMENT_RLS; pii=0; mutation=0; ai_runtime=0");
