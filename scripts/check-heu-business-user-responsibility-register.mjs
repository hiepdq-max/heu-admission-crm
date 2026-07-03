import { readFileSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const checks = [];

function read(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), "utf8");
}

function addCheck(code, ok, detail) {
  checks.push({ code, status: ok ? "READY" : "NO_GO", detail });
}

const docPath = "docs/HEU_BUSINESS_USER_RESPONSIBILITY_REGISTER_20260703.md";
const componentPath =
  "components/settings/business-user-responsibility-panel.tsx";

const doc = read(docPath);
const component = read(componentPath);
const settingsPage = read("app/settings/page.tsx");
const scopesPage = read("app/settings/scopes/page.tsx");
const packageJson = read("package.json");
const implementationLog = read("docs/HEU_IMPLEMENTATION_LOG.md");

const requiredDocTokens = [
  "HEU Business User Responsibility Register - 2026-07-03",
  "BUSINESS_USER_RESPONSIBILITY_READY / NO_GO / BLOCKED",
  "One person may hold many operating lanes.",
  "One operating lane must have exactly one accountable owner.",
  "Every unfinished item must be assigned to one user slot or position",
  "BUS-HT-01",
  "BUS-PHT-DT-01",
  "BUS-PHT-TC-01",
  "BUS-PHT-VH-01",
  "BUS-IT-01",
  "BUS-KHTC-01",
  "BUS-CTHSSV-01",
  "BUS-DAO-TAO-01",
  "BUS-NGAN-HAN-01",
  "BUS-KHOA-01",
  "BUS-PHAP-CHE-01",
  "BUS-AUDIT-01",
  "BUS-TUYEN-SINH-01",
  "P6-04 role/workspace UAT",
  "P5-03 Finance Desk UAT",
  "P2-18 accounting dashboard UAT",
  "P0-03 backup/restore and migration order",
  "does not create users, set passwords, send reset/invite links",
];

addCheck(
  "BUSINESS-RESP-DOC",
  requiredDocTokens.every((token) => doc.includes(token)),
  "Responsibility register document contains owner slots, open work assignments, secret boundary and PASS_LOCAL exit rule.",
);

addCheck(
  "BUSINESS-RESP-UI",
  component.includes(
    'data-heu-business-user-responsibility="P0-17_BUSINESS_USER_RESPONSIBILITY_REGISTER"',
  ) &&
    component.includes("BUSINESS_USER_RESPONSIBILITY_READY / NO_GO / BLOCKED") &&
    component.includes("openAssignments") &&
    component.includes("businessSlots") &&
    component.includes("BUS-HT-01") &&
    component.includes("BUS-PHT-TC-01") &&
    component.includes("BUS-TUYEN-SINH-01") &&
    component.includes("does not create users, set passwords"),
  "Settings responsibility panel exposes business slots and one-owner work queue.",
);

addCheck(
  "BUSINESS-RESP-ROUTES",
  settingsPage.includes("BusinessUserResponsibilityPanel") &&
    scopesPage.includes("BusinessUserResponsibilityPanel"),
  "Responsibility panel is wired into /settings and /settings/scopes.",
);

addCheck(
  "BUSINESS-RESP-PACKAGE",
  packageJson.includes(
    '"check:heu-business-user-responsibility-register": "node scripts/check-heu-business-user-responsibility-register.mjs"',
  ),
  "package.json exposes the focused business user responsibility checker.",
);

addCheck(
  "BUSINESS-RESP-LOG",
  implementationLog.includes("Business User Responsibility Register") &&
    implementationLog.includes("check:heu-business-user-responsibility-register") &&
    implementationLog.includes(
      "does not create users, set passwords, send reset/invite links",
    ),
  "Implementation log records the local-only responsibility register slice.",
);

const noGoChecks = checks.filter((check) => check.status !== "READY");

for (const check of checks) {
  console.log(`${check.status} ${check.code}: ${check.detail}`);
}

if (noGoChecks.length > 0) {
  process.exitCode = 1;
}
