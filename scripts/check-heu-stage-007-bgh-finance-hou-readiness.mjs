import fs from "node:fs";

const path = "docs/HEU_CONTROL/HEU_STAGE_007_BGH_FINANCE_HOU_CONTROL_READINESS_20260714.md";
const text = fs.readFileSync(path, "utf8");
const lanes = (text.match(/\| (BGH|KHTC|HOU|IT_DATA\/Audit) \|/g) ?? []).length;
if (lanes !== 4) throw new Error(`expected 4 control lanes, found ${lanes}`);
for (const token of [
  "HEU-STAGE-007-BGH-FINANCE-HOU-CONTROL-READINESS",
  "DRAFT_CONTROL_READINESS",
  "Production status: NO-GO",
  "read-only",
  "separate partner ledger",
  "Forbidden action",
  "payment/invoice/COM",
  "Duplicate payment",
  "hard-delete",
  "AI may summarize or flag anomalies",
]) {
  if (!text.toLowerCase().includes(token.toLowerCase())) throw new Error(`missing token: ${token}`);
}
if (/@[^\s|`]+\.[^\s|`]+/.test(text)) throw new Error("real-looking email found");
if (/password\s*[:=]|api[_ -]?key|service[- ]?role|token\s*[:=]/i.test(text)) {
  throw new Error("secret-shaped content found");
}
console.log("HEU_STAGE_007_BGH_FINANCE_HOU_READINESS: PASS_LOCAL");
console.log("BGH_WRITE=0 FINANCE_PAYMENT=0 HOU_MERGE=0 COM_CALCULATION=0 AI_APPROVAL=0");
console.log("NO_GO: readiness control only; no finance/HOU production action.");
