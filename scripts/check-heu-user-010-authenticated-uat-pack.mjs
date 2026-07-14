import fs from "node:fs";

const packPath =
  "docs/HEU_CONTROL/HEU_USER_010_SYNTHETIC_AUTHENTICATED_UAT_EXECUTION_PACK_20260714.md";

function fail(message) {
  throw new Error(message);
}

try {
  if (!fs.existsSync(packPath)) fail(`missing pack: ${packPath}`);
  const pack = fs.readFileSync(packPath, "utf8");

  for (const token of [
    "HEU-USER-010-SYNTHETIC-AUTHENTICATED-UAT",
    "Status: AUTH_REQUIRED",
    "Account under test: `U012`",
    "Provisioning status: NOT_APPLIED",
    "U012-01",
    "U012-10",
    "AUTH_REQUIRED",
    "INACTIVE",
    "disable/unlink U012",
    "No hard delete",
    "passwords, recovery links, tokens",
  ]) {
    if (!pack.toLowerCase().includes(token.toLowerCase())) {
      fail(`missing token: ${token}`);
    }
  }

  const caseCount = (pack.match(/\| U012-\d{2} \|/g) ?? []).length;
  if (caseCount !== 10) fail(`expected 10 UAT cases, found ${caseCount}`);

  if (/@[^\s|`]+\.[^\s|`]+/.test(pack)) {
    fail("real-looking email address found in authenticated UAT pack");
  }

  console.log("HEU_USER_010_AUTHENTICATED_UAT_PACK: PASS_LOCAL");
  console.log(`UAT_CASES=${caseCount} ACCOUNT_LABEL=U012 STATUS=AUTH_REQUIRED`);
  console.log("AUTH_CREATED=0 EMAIL_SENT=0 DB_MUTATIONS=0 ACTIVATION=0");
  console.log("NO_GO: pack/checker only; authenticated UAT remains NOT_RUN.");
} catch (error) {
  console.error(`HEU_USER_010_AUTHENTICATED_UAT_PACK: NO_GO ${error.message}`);
  process.exitCode = 1;
}
