import fs from "node:fs";

const path = "docs/HEU_CONTROL/HEU_USER_006_ONE_SYNTHETIC_ACCOUNT_UAT_DESIGN_20260714.md";
const text = fs.readFileSync(path, "utf8");
const cases = (text.match(/\| U012-\d{2} \|/g) ?? []).length;
if (cases !== 10 || /@[^\s|`]+\.[^\s|`]+/.test(text)) process.exit(1);
for (const token of ["U012", "INACTIVE", "BLOCKED", "No hard delete", "disable/unlink"]) {
  if (!text.includes(token)) process.exit(1);
}
console.log("HEU_USER_007_SYNTHETIC_UAT_FIXTURE: PASS_LOCAL");
console.log(`UAT_CASES=${cases} ACCOUNT_LABEL=U012 REAL_ACCOUNTS=0`);
console.log("AUTH_CALLS=0 EMAIL_SENT=0 DB_MUTATIONS=0 BROWSER_UAT=0");
console.log("NO_GO: fixture checker only; no approval for real provisioning.");
