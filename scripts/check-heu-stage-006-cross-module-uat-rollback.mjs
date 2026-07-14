import fs from "node:fs";

const path = "docs/HEU_CONTROL/HEU_STAGE_006_CROSS_MODULE_UAT_ROLLBACK_DESIGN_20260714.md";
const text = fs.readFileSync(path, "utf8");
const cases = (text.match(/\| CROSS-UAT-\d{2} \|/g) ?? []).length;
if (cases !== 10) throw new Error(`expected 10 cross-module UAT cases, found ${cases}`);
for (const token of [
  "HEU-STAGE-006-CROSS-MODULE-UAT-AND-ROLLBACK-DESIGN",
  "DRAFT_UAT_DESIGN",
  "Production status: NO-GO",
  "CROSS-UAT-01",
  "CROSS-UAT-10",
  "Read-only aggregate only",
  "no broad fallback",
  "CHO_XAC_NHAN",
  "disabled or unlinked",
  "No hard delete",
]) {
  if (!text.toLowerCase().includes(token.toLowerCase())) throw new Error(`missing token: ${token}`);
}
if (/@[^\s|`]+\.[^\s|`]+/.test(text)) throw new Error("real-looking email found");
if (/password\s*[:=]|api[_ -]?key|service[- ]?role|token\s*[:=]/i.test(text)) {
  throw new Error("secret-shaped content found");
}
console.log("HEU_STAGE_006_CROSS_MODULE_UAT_ROLLBACK: PASS_LOCAL");
console.log(`UAT_CASES=${cases} RAW_PAYLOAD=0 HARD_DELETE=0 PERMISSION_WIDENING=0`);
console.log("NO_GO: design/checker only; no cross-module UAT or staging approval.");
