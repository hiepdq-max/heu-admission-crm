import fs from "node:fs";

const path = "docs/HEU_CONTROL/HEU_USER_008_SYNTHETIC_UAT_RESULT_LEDGER_20260714.md";
const text = fs.readFileSync(path, "utf8");
const cases = (text.match(/\| U012-\d{2} \|/g) ?? []).length;
const notRun = (text.match(/\| `NOT_RUN` \|/g) ?? []).length;
if (cases !== 10 || notRun !== 10 || /@[^\s|`]+\.[^\s|`]+/.test(text)) process.exit(1);
for (const token of ["Status: NOT_RUN", "Provisioning status: NOT_APPLIED", "Evidence ID", "rollback", "INACTIVE"]) {
  if (!text.toLowerCase().includes(token.toLowerCase())) process.exit(1);
}
console.log("HEU_USER_009_SYNTHETIC_UAT_LEDGER: PASS_LOCAL");
console.log(`UAT_CASES=${cases} NOT_RUN_RESULTS=${notRun} ACCOUNT_LABEL=U012`);
console.log("REAL_ACCOUNTS=0 AUTH_CALLS=0 EMAIL_SENT=0 DB_MUTATIONS=0");
console.log("NO_GO: ledger checker only; no UAT approval or activation.");
