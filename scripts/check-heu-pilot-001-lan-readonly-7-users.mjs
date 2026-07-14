import fs from "node:fs";

const path = "docs/HEU_CONTROL/HEU_PILOT_001_LAN_READONLY_7_USERS_RUNBOOK_20260714.md";
const text = fs.readFileSync(path, "utf8");
const labels = (text.match(/\| U\d{3} \|/g) ?? []).length;
if (labels !== 7) throw new Error(`expected 7 pilot labels, found ${labels}`);
for (const token of [
  "HEU-PILOT-001-LAN-STAGING-READONLY-7-USERS",
  "NOT_READY_AUTH_GATE",
  "Production status: NO-GO",
  "INACTIVE",
  "Viec cua toi",
  "Viec phong toi",
  "tampered workspace/department query",
  "Disable/unlink rollback",
  "HEU-DATA-001-METADATA-FOUNDATION-IMPORT-DRY-RUN",
]) {
  if (!text.toLowerCase().includes(token.toLowerCase())) throw new Error(`missing token: ${token}`);
}
if (/@[^\s|`]+\.[^\s|`]+/.test(text)) throw new Error("real-looking email found");
if (/password\s*[:=]|api[_ -]?key|service[- ]?role|token\s*[:=]/i.test(text)) {
  throw new Error("secret-shaped content found");
}
console.log("HEU_PILOT_001_LAN_READONLY_7_USERS: PASS_LOCAL");
console.log("PILOT_LABELS=7 AUTH_CREATED=0 EMAIL_SENT=0 ACTIVATION=0 DB_MUTATIONS=0");
console.log("NO_GO: runbook/checker only; LAN pilot is not authorized.");
