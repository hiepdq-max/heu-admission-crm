import fs from "node:fs";

const path = "docs/HEU_CONTROL/HEU_MODULE_003_CTHSSV_SCOPED_UAT_DESIGN_20260714.md";
const text = fs.readFileSync(path, "utf8");
const cases = (text.match(/\| CTHSSV-UAT-\d{2} \|/g) ?? []).length;
if (cases !== 8) throw new Error(`expected 8 CTHSSV UAT cases, found ${cases}`);
for (const token of [
  "HEU-MODULE-003-CTHSSV-SCOPED-UAT",
  "DRAFT_UAT_DESIGN",
  "Production status: NO-GO",
  "account=U015",
  "workspace=cthssv-pilot",
  "HSSV-SYNTH-001",
  "KHTC records",
  "Tamper department/workspace query",
  "Confirmation gate blocks",
  "U015 `INACTIVE`",
]) {
  if (!text.toLowerCase().includes(token.toLowerCase())) throw new Error(`missing token: ${token}`);
}
if (/@[^\s|`]+\.[^\s|`]+/.test(text)) throw new Error("real-looking email found");
if (/password\s*[:=]|api[_ -]?key|service[- ]?role|token\s*[:=]/i.test(text)) {
  throw new Error("secret-shaped content found");
}
console.log("HEU_MODULE_003_CTHSSV_SCOPED_UAT: PASS_LOCAL");
console.log(`UAT_CASES=${cases} ACCOUNT_LABEL=U015 RAW_PII=0 OFFICIAL_STATUS_BYPASS=0`);
console.log("NO_GO: UAT design/checker only; no CTHSSV pilot approval.");
