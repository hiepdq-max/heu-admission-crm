import fs from "node:fs";

const path = "docs/HEU_CONTROL/HEU_STAGE_008_UAT_OWNER_ROLLBACK_STAGING_GATE_20260714.md";
const text = fs.readFileSync(path, "utf8");
const gates = (text.match(/\| (Auth and scope|Module UAT|Cross-module|Data foundation|Rollback|Owner review|Staging) \|/g) ?? []).length;
if (gates !== 7) throw new Error(`expected 7 staging gates, found ${gates}`);
for (const token of [
  "HEU-STAGE-008-UAT-OWNER-ROLLBACK-STAGING-GATE",
  "DRAFT_GATE",
  "Production status: NO-GO",
  "U012 positive/negative scope UAT",
  "Ten cross-scope cases",
  "Metadata dry-run",
  "Disable/unlink",
  "IT_DATA, Audit, module owners and Owner/BGH",
  "PASS_LOCAL",
  "Any `FAIL`, `NO_GO` or `BLOCKED` keeps staging closed",
  "does not authorize migration",
]) {
  if (!text.toLowerCase().includes(token.toLowerCase())) throw new Error(`missing token: ${token}`);
}
if (/@[^\s|`]+\.[^\s|`]+/.test(text)) throw new Error("real-looking email found");
if (/password\s*[:=]|api[_ -]?key|service[- ]?role|token\s*[:=]/i.test(text)) {
  throw new Error("secret-shaped content found");
}
console.log("HEU_STAGE_008_UAT_OWNER_ROLLBACK_STAGING_GATE: PASS_LOCAL");
console.log("GATES=7 UAT_ACCEPTED=0 OWNER_APPROVAL=0 STAGING=0 PRODUCTION=0");
console.log("NO_GO: gate design/checker only; staging and production remain closed.");
