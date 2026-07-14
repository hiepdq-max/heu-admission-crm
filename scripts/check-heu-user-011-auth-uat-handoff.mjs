import fs from "node:fs";

const path = "docs/HEU_CONTROL/HEU_USER_011_AUTH_UAT_EXECUTION_HANDOFF_20260714.md";
const text = fs.readFileSync(path, "utf8");
const required = [
  "HEU-USER-011-OWNER-CONTROLLED-U012-AUTH-UAT",
  "WAITING_OWNER_CONTROLLED_AUTH",
  "U012",
  "INACTIVE",
  "ACCOUNTING_READONLY -> KHTC -> FINANCE_READONLY",
  "U012-01 to U012-03",
  "U012-04 to U012-06",
  "U012-07 to U012-08",
  "U012-09",
  "U012-10",
  "Stop rules",
  "NO_GO",
  "disable/unlink",
];
for (const token of required) {
  if (!text.toLowerCase().includes(token.toLowerCase())) {
    throw new Error(`missing token: ${token}`);
  }
}
if (/@[^\s|`]+\.[^\s|`]+/.test(text)) throw new Error("real-looking email found");
if (/service[- ]?role|api[_ -]?key|password\s*[:=]/i.test(text)) {
  throw new Error("secret-shaped content found");
}
console.log("HEU_USER_011_AUTH_UAT_HANDOFF: PASS_LOCAL");
console.log("ACCOUNT_LABEL=U012 STATUS=WAITING_OWNER_CONTROLLED_AUTH");
console.log("AUTH_CREATED=0 EMAIL_SENT=0 ACTIVATION=0 DB_MUTATIONS=0");
console.log("NO_GO: handoff only; no authenticated UAT or pilot approval.");
