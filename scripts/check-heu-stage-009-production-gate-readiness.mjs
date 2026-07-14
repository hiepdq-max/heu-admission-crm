import fs from "node:fs";

const path = "docs/HEU_CONTROL/HEU_STAGE_009_PRODUCTION_GATE_READINESS_AUDIT_20260714.md";
const text = fs.readFileSync(path, "utf8");
const conditions = (text.match(/\| (Scope UAT|Module UAT|Data confirmation|Backup\/rollback|Security\/audit|Staging|Authority) \|/g) ?? []).length;
if (conditions !== 7) throw new Error(`expected 7 production conditions, found ${conditions}`);
for (const token of [
  "HEU-STAGE-009-PRODUCTION-GATE-READINESS-AUDIT",
  "NO_GO_PENDING_EVIDENCE",
  "Production status: NO-GO",
  "Positive and negative access results",
  "Department owner confirmations",
  "Restore rehearsal and rollback proof",
  "Owner/BGH written GO decision",
  "Production remains `NO-GO`",
  "No production migration",
  "hard delete",
]) {
  if (!text.toLowerCase().includes(token.toLowerCase())) throw new Error(`missing token: ${token}`);
}
if (/@[^\s|`]+\.[^\s|`]+/.test(text)) throw new Error("real-looking email found");
if (/password\s*[:=]|api[_ -]?key|service[- ]?role|token\s*[:=]/i.test(text)) {
  throw new Error("secret-shaped content found");
}
console.log("HEU_STAGE_009_PRODUCTION_GATE_READINESS: PASS_LOCAL");
console.log("CONDITIONS=7 PENDING=7 OWNER_GO=0 MIGRATION=0 PRODUCTION=0");
console.log("NO_GO: readiness audit only; production is not authorized.");
