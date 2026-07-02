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

const requiredApprovalOwners = [
  "HEU IT_DATA configures GitHub Actions variables/secrets outside Git/Codex/chat.",
  "BGH confirms recipient labels and daily audience scope outside Git/Codex/chat.",
  "KHTC confirms finance-trial recipient lane stays read-only and non-approval.",
  "PHAP_CHE confirms legal/SOP lane and stop conditions.",
  "Audit confirms redaction and evidence-reference rules.",
];

const allowedRecipientLabels = [
  "BGH_DAILY_REPORT_ALIAS",
  "IT_DATA_BUILD_ALIAS",
  "KHTC_CONTROLLED_TRIAL_ALIAS",
  "PHAP_CHE_REVIEW_ALIAS",
  "AUDIT_REVIEW_ALIAS",
];

const dispatchHandoffSteps = [
  "EMAIL-DISPATCH-01: BGH confirms approved recipient labels and scope outside Git/Codex/chat.",
  "EMAIL-DISPATCH-02: HEU IT_DATA sets variables/secrets in GitHub Actions without exposing values.",
  "EMAIL-DISPATCH-03: report:heu-daily-dry-run remains dry-run and contains no forbidden content.",
  "EMAIL-DISPATCH-04: report:heu-email-readiness prints status without printing values.",
  "EMAIL-DISPATCH-05: any future real sender change is a separate reviewed slice and disabled by default.",
  "EMAIL-DISPATCH-06: email receipt is not signed UAT, evidence acceptance, finance approval, owner GO/NO-GO or production GO.",
];

const stopConditions = [
  "Secret value, password, app password, OTP, invite/reset link, service-role key or private key is requested.",
  "Raw PII, bank statement, voucher, raw payment data or raw signed evidence is requested.",
  "Recipient list is not approved by BGH and HEU IT_DATA.",
  "Codex is asked to send real email, create real tickets/tasks or assign real accounts.",
  "Email delivery is treated as UAT approval, evidence acceptance, finance approval, owner GO/NO-GO or production GO.",
];

const configured = safeConfig.filter((item) => Boolean(process.env[item.name]));
const missing = safeConfig.filter((item) => !process.env[item.name]);
const readiness =
  missing.length === 0 ? "EMAIL_DRY_RUN_READY" : "EMAIL_CONFIG_REQUIRED";
const dispatchReadiness =
  missing.length === 0
    ? "EMAIL_DISPATCH_HANDOFF_READY"
    : "EMAIL_CONFIG_REQUIRED";

console.log("# HEU daily email readiness check");
console.log("");
console.log(`Status: ${readiness} / NO_GO / BLOCKED`);
console.log(`Dispatch handoff status: ${dispatchReadiness} / NO_GO / BLOCKED`);
console.log("Mode: READINESS_ONLY - no email is sent by this script.");
console.log("Production: NO-GO");
console.log("");
console.log("Reference: docs/HEU_DAILY_EMAIL_DISPATCH_HANDOFF_20260702.md");
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
console.log("## Required approval owners");
console.log("");
for (const owner of requiredApprovalOwners) {
  console.log(`- ${owner}`);
}
console.log("");
console.log("## Allowed recipient labels");
console.log("");
for (const label of allowedRecipientLabels) {
  console.log(`- ${label}`);
}
console.log("");
console.log("## Manual enablement steps");
console.log("");
for (const step of dispatchHandoffSteps) {
  console.log(`- ${step}`);
}
console.log("");
console.log("## Stop conditions");
console.log("");
for (const condition of stopConditions) {
  console.log(`- ${condition}`);
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
