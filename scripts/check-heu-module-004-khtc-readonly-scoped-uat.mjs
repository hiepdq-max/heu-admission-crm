import fs from "node:fs";

const path = "docs/HEU_CONTROL/HEU_MODULE_004_KHTC_READONLY_SCOPED_UAT_DESIGN_20260714.md";
const text = fs.readFileSync(path, "utf8");
const cases = (text.match(/\| KHTC-UAT-\d{2} \|/g) ?? []).length;
if (cases !== 8) throw new Error(`expected 8 KHTC UAT cases, found ${cases}`);
for (const token of [
  "HEU-MODULE-004-KHTC-READONLY-SCOPED-UAT",
  "DRAFT_UAT_DESIGN",
  "Production status: NO-GO",
  "account=U012",
  "workspace=finance-readonly",
  "FIN-SYNTH-001",
  "admission/CTHSSV records",
  "payment or invoice action",
  "Finance write gate blocks",
  "duplicate",
  "U012 `INACTIVE`",
]) {
  if (!text.toLowerCase().includes(token.toLowerCase())) throw new Error(`missing token: ${token}`);
}
if (/@[^\s|`]+\.[^\s|`]+/.test(text)) throw new Error("real-looking email found");
if (/password\s*[:=]|api[_ -]?key|service[- ]?role|token\s*[:=]/i.test(text)) {
  throw new Error("secret-shaped content found");
}
console.log("HEU_MODULE_004_KHTC_READONLY_SCOPED_UAT: PASS_LOCAL");
console.log(`UAT_CASES=${cases} ACCOUNT_LABEL=U012 FINANCE_WRITE=0 PAYMENT=0 COM_CALCULATION=0`);
console.log("NO_GO: UAT design/checker only; no finance pilot approval.");
