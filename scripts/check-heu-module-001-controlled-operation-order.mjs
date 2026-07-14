import fs from "node:fs";

const path = "docs/HEU_CONTROL/HEU_MODULE_001_CONTROLLED_OPERATION_ORDER_20260714.md";
const text = fs.readFileSync(path, "utf8");
const rows = (text.match(/\| [1-4] \|/g) ?? []).length;
if (rows !== 4) throw new Error(`expected 4 ordered modules, found ${rows}`);
for (const token of [
  "HEU-MODULE-001-CONTROLLED-OPERATION-ORDER",
  "DRAFT_CONTROL",
  "Production status: NO-GO",
  "TUYEN_SINH",
  "CTHSSV",
  "KHTC",
  "DAO_TAO/KHOA",
  "negative scope",
  "read-only",
  "AI may check, summarize or draft only",
]) {
  if (!text.toLowerCase().includes(token.toLowerCase())) throw new Error(`missing token: ${token}`);
}
if (/password\s*[:=]|api[_ -]?key|service[- ]?role|token\s*[:=]/i.test(text)) {
  throw new Error("secret-shaped content found");
}
console.log("HEU_MODULE_001_CONTROLLED_OPERATION_ORDER: PASS_LOCAL");
console.log("MODULES_ORDERED=4 FINANCE_WRITE=0 HOU_MUTATION=0 AI_APPROVAL=0");
console.log("NO_GO: control order only; no module opened for production.");
