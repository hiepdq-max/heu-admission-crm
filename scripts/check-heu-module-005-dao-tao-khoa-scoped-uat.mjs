import fs from "node:fs";

const path = "docs/HEU_CONTROL/HEU_MODULE_005_DAO_TAO_KHOA_SCOPED_UAT_DESIGN_20260714.md";
const text = fs.readFileSync(path, "utf8");
const cases = (text.match(/\| DT-UAT-\d{2} \|/g) ?? []).length;
if (cases !== 8) throw new Error(`expected 8 Dao Tao UAT cases, found ${cases}`);
for (const token of [
  "HEU-MODULE-005-DAO-TAO-KHOA-SCOPED-UAT",
  "DRAFT_UAT_DESIGN",
  "Production status: NO-GO",
  "account=U016",
  "workspace=training-readonly",
  "CLASS-SYNTH-001",
  "CTHSSV/admission records",
  "grade or enrollment write",
  "Read-only gate blocks",
  "U016 `INACTIVE`",
]) {
  if (!text.toLowerCase().includes(token.toLowerCase())) throw new Error(`missing token: ${token}`);
}
if (/@[^\s|`]+\.[^\s|`]+/.test(text)) throw new Error("real-looking email found");
if (/password\s*[:=]|api[_ -]?key|service[- ]?role|token\s*[:=]/i.test(text)) {
  throw new Error("secret-shaped content found");
}
console.log("HEU_MODULE_005_DAO_TAO_KHOA_SCOPED_UAT: PASS_LOCAL");
console.log(`UAT_CASES=${cases} ACCOUNT_LABEL=U016 ACADEMIC_WRITE=0 RAW_PII=0`);
console.log("NO_GO: UAT design/checker only; no training pilot approval.");
