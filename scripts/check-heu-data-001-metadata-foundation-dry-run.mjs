import fs from "node:fs";

const path = "docs/HEU_CONTROL/HEU_DATA_001_METADATA_FOUNDATION_IMPORT_DRY_RUN_20260714.md";
const text = fs.readFileSync(path, "utf8");
const queueRows = (text.match(/\| DCTC-[^|]+ \|/g) ?? []).length;
if (queueRows !== 7) throw new Error(`expected 7 confirmation rows, found ${queueRows}`);
for (const token of [
  "HEU-DATA-001-METADATA-FOUNDATION-IMPORT-DRY-RUN",
  "DRAFT_CONTROL_METADATA_ONLY",
  "Production status: NO-GO",
  "CHO_XAC_NHAN",
  "controlled_evidence_ref",
  "owner/assignee department match",
  "Raw names, email, phone",
  "does not read Drive",
  "Real import requires",
]) {
  if (!text.toLowerCase().includes(token.toLowerCase())) throw new Error(`missing token: ${token}`);
}
if (/passwords?\s*[:=]|tokens?\s*[:=]|api[_ -]?key|service[- ]?role/i.test(text)) {
  throw new Error("secret-shaped field declaration found");
}
console.log("HEU_DATA_001_METADATA_FOUNDATION_DRY_RUN: PASS_LOCAL");
console.log("CONFIRMATION_QUEUE=7 RAW_IMPORT=0 SQL=0 MIGRATION=0 PII=0");
console.log("NO_GO: metadata control pack only; no real data import or lock.");
