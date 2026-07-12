import { readFileSync } from "node:fs";

const checkerPath = "scripts/check-heu-lead-handover-live-preflight.mjs";
const source = readFileSync(checkerPath, "utf8");
const pkg = JSON.parse(readFileSync("package.json", "utf8"));
const requiredTokens = [
  "TC9_TTGDTX_LINKED",
  "status_ready=",
  "program_ready=",
  "checklist_ready=",
  "documents_ready=",
  "legal_handover_gate_ready=",
  "duplicate_free=",
  "handover_ready=",
  "pii_columns_read=0",
  "mutation=0",
  "finance_mutation=0",
  "ai_runtime=0",
];
const forbiddenPatterns = [
  /student_name|phone|email|address|cccd|bank/i,
  /\.(?:insert|update|upsert|delete)\s*\(/,
  /\.rpc\s*\(/,
  /openai|anthropic|gemini/i,
];
const failures = [];

for (const token of requiredTokens) {
  if (!source.includes(token)) failures.push(`missing token: ${token}`);
}
for (const pattern of forbiddenPatterns) {
  if (pattern.test(source)) failures.push(`forbidden pattern: ${pattern}`);
}
if (
  pkg.scripts?.["check:heu-lead-handover-live-preflight"] !==
    `node ${checkerPath}`
) {
  failures.push("missing live preflight alias");
}
if (
  pkg.scripts?.["check:heu-lead-handover-live-preflight-static"] !==
    "node scripts/check-heu-lead-handover-live-preflight-static.mjs"
) {
  failures.push("missing static preflight alias");
}

if (failures.length > 0) {
  failures.forEach((failure) => console.error(`NO_GO ${failure}`));
  process.exit(1);
}

console.log("PASS_LOCAL HEU-LEAD-HANDOVER-LIVE-PREFLIGHT-STATIC");
console.log("metadata_only=true; production=NO_GO");
