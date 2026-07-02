const safeConfig = [
  {
    name: "HEU_DAILY_REPORT_TO",
    kind: "GitHub Actions variable",
    purpose: "Approved recipient list such as BGH/IT_DATA/KHTC/Audit aliases.",
  },
  {
    name: "HEU_DAILY_REPORT_FROM",
    kind: "GitHub Actions variable",
    purpose: "Approved sender identity controlled by HEU IT_DATA.",
  },
  {
    name: "HEU_SMTP_HOST",
    kind: "GitHub Actions secret",
    purpose: "Mail host kept outside Git/Codex/chat.",
  },
  {
    name: "HEU_SMTP_PORT",
    kind: "GitHub Actions variable",
    purpose: "Mail port, for example 587, if HEU IT_DATA approves SMTP.",
  },
  {
    name: "HEU_SMTP_USERNAME",
    kind: "GitHub Actions secret",
    purpose: "Mail username kept outside Git/Codex/chat.",
  },
  {
    name: "HEU_SMTP_PASSWORD",
    kind: "GitHub Actions secret",
    purpose: "Mail password or app password kept outside Git/Codex/chat.",
  },
];

const forbiddenChannels = [
  "Git commits",
  "Codex/chat",
  "plain email body",
  "issue comments",
  "workflow logs",
  "docs or screenshots",
];

const configured = safeConfig.filter((item) => Boolean(process.env[item.name]));
const missing = safeConfig.filter((item) => !process.env[item.name]);
const readiness =
  missing.length === 0 ? "EMAIL_DRY_RUN_READY" : "EMAIL_CONFIG_REQUIRED";

console.log("# HEU daily email readiness check");
console.log("");
console.log(`Status: ${readiness} / NO_GO / BLOCKED`);
console.log("Mode: READINESS_ONLY - no email is sent by this script.");
console.log("Production: NO-GO");
console.log("");
console.log("## Configured names");
console.log("");
for (const item of configured) {
  console.log(`- ${item.name}: configured as ${item.kind}; value is hidden.`);
}
if (configured.length === 0) {
  console.log("- None detected in this local environment.");
}
console.log("");
console.log("## Missing names");
console.log("");
for (const item of missing) {
  console.log(`- ${item.name}: ${item.kind} - ${item.purpose}`);
}
if (missing.length === 0) {
  console.log("- None. A future sender step can still run only after IT_DATA approves the exact mail route.");
}
console.log("");
console.log("## Safety boundary");
console.log("");
console.log("- This checker does not send email, create tasks, accept UAT, approve finance action, approve owner GO or mark production GO.");
console.log("- Mail sending can be enabled only by HEU IT_DATA using GitHub Actions secrets/variables outside Git/Codex/chat.");
console.log("- Never place passwords, app passwords, OTPs, invite/reset links, service-role keys, bank credentials, raw PII, bank statements, vouchers or raw payment data in:");
for (const channel of forbiddenChannels) {
  console.log(`  - ${channel}`);
}
