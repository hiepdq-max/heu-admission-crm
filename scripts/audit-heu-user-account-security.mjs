import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const failures = [];

function fail(message) {
  failures.push(message);
}

function read(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), "utf8");
}

function requireFile(relativePath) {
  if (!existsSync(path.join(repoRoot, relativePath))) {
    fail(`Missing required file: ${relativePath}`);
  }
}

function requireAllText(contents, tokens, label, file) {
  for (const token of tokens) {
    if (!contents.includes(token)) {
      fail(`${file}: missing ${label}: ${token}`);
    }
  }
}

function requireOrderedText(contents, tokens, label, file) {
  let cursor = 0;

  for (const token of tokens) {
    const next = contents.indexOf(token, cursor);
    if (next === -1) {
      fail(`${file}: missing ordered ${label}: ${token}`);
      return;
    }
    cursor = next + token.length;
  }
}

function requireSection(contents, heading, tokens, file) {
  const marker = `## ${heading}`;
  const start = contents.indexOf(marker);
  if (start === -1) {
    fail(`${file}: missing section ${heading}`);
    return;
  }

  const next = contents.indexOf("\n## ", start + marker.length);
  const section = next === -1 ? contents.slice(start) : contents.slice(start, next);
  requireAllText(section, tokens, heading, file);
}

const formPath = "components/settings/user-create-form.tsx";
const onboardingPath = "components/settings/real-user-onboarding-panel.tsx";
const actionsPath = "app/settings/actions.ts";
const settingsPagePath = "app/settings/page.tsx";
const scopePagePath = "app/settings/scopes/page.tsx";
const readinessPath = "lib/production-readiness.ts";
const financeDayOneRunbookPath =
  "docs/HEU_FINANCE_DAY1_REAL_RUN_REHEARSAL_20260630.md";
const financeDayOneActivationTemplatePath =
  "docs/HEU_FINANCE_DAY1_ACCOUNT_ACTIVATION_TEMPLATE_20260630.md";
const financeDayOneStartGateChecklistPath =
  "docs/HEU_FINANCE_DAY1_START_GATE_CHECKLIST_20260630.md";
const financeDayOnePreloginMatrixPath =
  "docs/HEU_FINANCE_DAY1_P6_04_PRELOGIN_MATRIX_20260630.md";
const financeDayOneLedgerTemplatePath =
  "docs/HEU_FINANCE_DAY1_RESULT_LEDGER_TEMPLATE_20260630.md";
const packagePath = "package.json";
const agentsPath = "AGENTS.md";
const releaseGatePath = "scripts/audit-ttgdtx-release-gates.mjs";
const logPath = "docs/HEU_IMPLEMENTATION_LOG.md";

for (const file of [
  formPath,
  onboardingPath,
  actionsPath,
  settingsPagePath,
  scopePagePath,
  readinessPath,
  financeDayOneRunbookPath,
  financeDayOneActivationTemplatePath,
  financeDayOneStartGateChecklistPath,
  financeDayOnePreloginMatrixPath,
  financeDayOneLedgerTemplatePath,
  packagePath,
  agentsPath,
  releaseGatePath,
  logPath,
]) {
  requireFile(file);
}

const form = read(formPath);
const onboarding = read(onboardingPath);
const actions = read(actionsPath);
const settingsPage = read(settingsPagePath);
const scopePage = read(scopePagePath);
const readinessSource = read(readinessPath);
const financeDayOneRunbook = read(financeDayOneRunbookPath);
const financeDayOneActivationTemplate = read(financeDayOneActivationTemplatePath);
const financeDayOneStartGateChecklist = read(financeDayOneStartGateChecklistPath);
const financeDayOnePreloginMatrix = read(financeDayOnePreloginMatrixPath);
const financeDayOneLedgerTemplate = read(financeDayOneLedgerTemplatePath);
const packageJson = JSON.parse(read(packagePath));
const agents = read(agentsPath);
const releaseGate = read(releaseGatePath);
const implementationLog = read(logPath);

requireAllText(
  form,
  [
    'id="password"',
    'type="password"',
    'autoComplete="new-password"',
    "minLength={8}",
    'aria-describedby="temporary-password-help"',
    'id="temporary-password-help"',
    "Codex/chat",
    "email",
    "service role key",
    "Không hiển thị key",
    "không ghi log mật khẩu tạm",
  ],
  "temporary password field safety guidance",
  formPath,
);

requireAllText(
  actions,
  [
    "unsafeTemporaryPasswords",
    "password123",
    "heu123456",
    "normalizePasswordSignal",
    "isUnsafeTemporaryPassword",
    "emailLocalPart",
    "nameParts",
    "unsafe_temporary_password",
  ],
  "server-side unsafe temporary password guard",
  actionsPath,
);

requireAllText(
  settingsPage,
  [
    "unsafe_temporary_password",
    "Mật khẩu tạm quá dễ đoán",
    "email/tên user",
    "kênh bảo mật",
    "RealUserOnboardingPanel",
    "<RealUserOnboardingPanel />",
    "<UserCreateForm",
  ],
  "settings page user-account guard",
  settingsPagePath,
);

requireOrderedText(
  settingsPage,
  ["RealUserOnboardingPanel", "<RealUserOnboardingPanel />", "<UserCreateForm"],
  "real-user onboarding panel before create-user form",
  settingsPagePath,
);

requireOrderedText(
  scopePage,
  ["RealUserOnboardingPanel", "<RealUserOnboardingPanel />", "<UserCreateForm"],
  "real-user onboarding panel before scoped create-user form",
  scopePagePath,
);

requireAllText(
  onboarding,
  [
    'data-heu-real-user-onboarding-panel="P0-17"',
    "Real user onboarding for accounting",
    "PASS_LOCAL only",
    "USER-REAL-01",
    "USER-REAL-05",
    "Supabase Auth",
    "User Scope Enforcement",
    "P6-04",
    "P2-18",
    "P5-03",
    "USER_READY / NO_GO / BLOCKED",
    "passwords, temporary passwords",
    "OTPs",
    "password reset links",
    "account activation/invite links",
    "production GO",
    'data-heu-real-user-finance-lanes="P0-17-P5-03"',
    "KHTC accounting operator",
    "BGH read-only reviewer",
    "Audit read-only reviewer",
    "Phap Che contract/legal reviewer",
    "Out-of-scope negative account",
  ],
  "real-user accounting onboarding guard",
  onboardingPath,
);

requireAllText(
  onboarding,
  [
    "PRODUCTION_FINANCE_DAY_ONE_START_GATES",
    "PRODUCTION_FINANCE_DAY_ONE_START_GATE_CHECKLIST",
    'data-heu-finance-day-one-start-gates="P0-03_P0-10_P6-04_P0-14_P0-17"',
    "Finance Day-1 start gates before real-accounting accounts",
    "FIN_START_READY / NO_GO / BLOCKED",
    "Do not invite, create or activate any real-accounting account",
    "controlled evidence outside Git/Codex/chat",
    "gate.requiredProof",
    "gate.stopCondition",
  ],
  "finance Day-1 start gates before real-accounting accounts UI",
  onboardingPath,
);

requireAllText(
  onboarding,
  [
    "PRODUCTION_FINANCE_DAY_ONE_ACCOUNT_ACTIVATION_CHECKS",
    "PRODUCTION_FINANCE_DAY_ONE_ACCOUNT_ACTIVATION_TEMPLATE",
    'data-heu-finance-day-one-account-activation="P0-17-P6-04"',
    "Finance Day-1 account activation handoff",
    "FIN_ACTIVATION_READY / NO_GO / BLOCKED",
    "invite status, profile link, narrow scope",
    "without storing credentials or invite links",
    "item.requiredProof",
    "item.stopCondition",
  ],
  "finance Day-1 account activation handoff guard",
  onboardingPath,
);

requireAllText(
  onboarding,
  [
    "PRODUCTION_FINANCE_DAY_ONE_P6_04_PRELOGIN_CHECKS",
    "PRODUCTION_FINANCE_DAY_ONE_P6_04_PRELOGIN_MATRIX",
    'data-heu-finance-day-one-p6-04-prelogin-matrix="P6-04-P0-17"',
    "Finance Day-1 P6-04 pre-login route matrix",
    "P6_04_PRELOGIN_READY / NO_GO / BLOCKED",
    "Record one P6-04 route/scope result",
    "Negative-control account must be BLOCKED/EMPTY_SCOPED_STATE",
    "item.rolloutOrder",
    "item.entryGate",
    "item.advanceGate",
    "item.accountLabel",
    "item.allowedBeforeFinanceLogin",
    "item.blockedBeforeFinanceLogin",
    "item.requiredResult",
    "item.stopCondition",
  ],
  "finance Day-1 P6-04 pre-login route matrix guard",
  onboardingPath,
);

requireAllText(
  onboarding,
  [
    "PRODUCTION_FINANCE_DAY_ONE_RUNBOOK",
    "PRODUCTION_FINANCE_DAY_ONE_RUN_STEPS",
    'data-heu-finance-day-one-run-rehearsal="P0-17-P6-04-P2-18-P5-03-P2-17"',
    "Finance Day-1 real-run rehearsal before expansion",
    "FIN_DAY1_READY / NO_GO / BLOCKED",
    "approved real-accounting account labels",
    "does not create accounts, approve access, accept",
    "move money or mark production GO",
    "step.requiredAction",
    "step.stopCondition",
  ],
  "finance Day-1 real-run rehearsal guard",
  onboardingPath,
);

requireAllText(
  onboarding,
  [
    "PRODUCTION_FINANCE_DAY_ONE_ACCOUNT_LANES",
    "PRODUCTION_FINANCE_DAY_ONE_RESULT_FIELDS",
    "PRODUCTION_FINANCE_DAY_ONE_RESULT_LEDGER_TEMPLATE",
    'data-heu-finance-day-one-result-ledger="P0-17-P6-04-P2-18-P5-03-P2-17"',
    "Finance Day-1 result ledger for real users",
    "FIN_DAY1_RESULT_READY / NO_GO / BLOCKED",
    "Record one controlled result row per approved account label and route",
    "does not approve",
    "access, accept UAT",
    "approve finance reliance",
    "lane.rolloutOrder",
    "lane.entryGate",
    "lane.advanceGate",
    "lane.accountLabel",
    "lane.requiredResult",
    "lane.stopCondition",
    "item.forbiddenContent",
  ],
  "finance Day-1 result ledger guard",
  onboardingPath,
);

requireAllText(
  onboarding,
  [
    'data-heu-real-user-access-closure="P0-17-P6-04"',
    "Real-user access closure after pilot/UAT",
    "USER-CLOSE-01",
    "USER-CLOSE-04",
    "ACCESS_RETAIN / REVOKE_OR_REDUCE / BLOCKED",
    "soft-revoke/INACTIVE",
    "passwords, temporary passwords",
    "account activation/invite links",
    "PRODUCTION_FINANCE_DAY_ONE_ACCESS_CLOSURE_LANES",
    'data-heu-finance-day-one-access-closure-lanes="P0-17-FIN-USER"',
    "Finance Day-1 sequential access closure lanes",
    "Close one `FIN-USER` lane at a time",
    "current lane has a",
    "controlled P0-17 closure decision",
    "lane.closureDecisionValue",
    "lane.retainCondition",
    "lane.reduceOrRevokeCondition",
    "lane.nextLaneGate",
  ],
  "real-user access closure guard and Finance Day-1 closure lanes",
  onboardingPath,
);

requireAllText(
  readinessSource,
  [
    "PRODUCTION_FINANCE_DAY_ONE_START_GATE_CHECKLIST",
    "HEU_FINANCE_DAY1_START_GATE_CHECKLIST_20260630.md",
    "export type ProductionFinanceDayOneStartGate",
    "export const PRODUCTION_FINANCE_DAY_ONE_START_GATES",
    "FIN-START-01",
    "P0-03 backup/restore evidence is accepted before real accounts",
    "FIN-START-05",
    "Human owner boundary is acknowledged",
    "FIN_START_READY",
    "create accounts, grant access, accept UAT, move money or mark production GO",
  ],
  "finance Day-1 start gates shared source",
  readinessPath,
);

requireAllText(
  readinessSource,
  [
    "PRODUCTION_FINANCE_DAY_ONE_ACCOUNT_ACTIVATION_TEMPLATE",
    "HEU_FINANCE_DAY1_ACCOUNT_ACTIVATION_TEMPLATE_20260630.md",
    "export type ProductionFinanceDayOneAccountActivationCheck",
    "export const PRODUCTION_FINANCE_DAY_ONE_ACCOUNT_ACTIVATION_CHECKS",
    "FIN-ACT-01",
    "Account label and owner are approved",
    "FIN-ACT-05",
    "P6-04 pre-login route check is recorded",
    "Password, temporary password, OTP, reset link, account invite/activation link",
  ],
  "finance Day-1 account activation handoff shared source",
  readinessPath,
);

requireAllText(
  readinessSource,
  [
    "PRODUCTION_FINANCE_DAY_ONE_P6_04_PRELOGIN_MATRIX",
    "HEU_FINANCE_DAY1_P6_04_PRELOGIN_MATRIX_20260630.md",
    "export type ProductionFinanceDayOnePreloginRouteCheck",
    "export const PRODUCTION_FINANCE_DAY_ONE_P6_04_PRELOGIN_CHECKS",
    "FIN-USER-01",
    "P6-04-PRELOGIN-01",
    "REAL_KHTC_TTGDTX_OPERATOR_01",
    "FIN-USER-05",
    "P6-04-PRELOGIN-05",
    "REAL_OUT_OF_SCOPE_NEGATIVE_01",
    "allowedBeforeFinanceLogin",
    "blockedBeforeFinanceLogin",
    "requiredResult",
    "BLOCKED or EMPTY_SCOPED_STATE",
    "negative-control account sees any protected route",
  ],
  "finance Day-1 P6-04 pre-login route matrix shared source",
  readinessPath,
);

requireAllText(
  readinessSource,
  [
    "PRODUCTION_FINANCE_DAY_ONE_RUNBOOK",
    "HEU_FINANCE_DAY1_REAL_RUN_REHEARSAL_20260630.md",
    "export const PRODUCTION_FINANCE_DAY_ONE_RUN_STEPS",
    "FIN-DAY1-01",
    "Secure account activation outside Codex",
    "FIN-DAY1-05",
    "Access closure before expansion",
    "FIN_DAY1_READY / NO_GO / BLOCKED",
    "Passwords, temporary passwords, OTPs, reset links",
    "blocked users keep active finance access",
  ],
  "finance Day-1 real-run rehearsal shared source",
  readinessPath,
);

requireAllText(
  readinessSource,
  [
    "PRODUCTION_FINANCE_DAY_ONE_RESULT_LEDGER_TEMPLATE",
    "HEU_FINANCE_DAY1_RESULT_LEDGER_TEMPLATE_20260630.md",
    "export type ProductionFinanceDayOneAccountLane",
    "export const PRODUCTION_FINANCE_DAY_ONE_ACCOUNT_LANES",
    "export const PRODUCTION_FINANCE_DAY_ONE_RESULT_FIELDS",
    "REAL_BGH_READONLY_01",
    "REAL_AUDIT_READONLY_01",
    "REAL_PHAP_CHE_REVIEW_01",
    "No skipped lane",
    "No next-lane access",
    "Evidence ID",
    "Owner decision",
    "FIN_DAY1_RESULT_READY",
    "Access closure",
    "No raw PII, CCCD, bank data, voucher body",
    "No password, OTP, invite/reset link",
  ],
  "finance Day-1 result ledger shared source",
  readinessPath,
);

requireAllText(
  readinessSource,
  [
    "export type ProductionFinanceDayOneAccessClosureLane",
    "closureDecisionValue",
    "retainCondition",
    "reduceOrRevokeCondition",
    "blockCondition",
    "nextLaneGate",
    "requiredProof",
    "export const PRODUCTION_FINANCE_DAY_ONE_ACCESS_CLOSURE_LANES",
    "FIN-DAY1-EVID-001",
    "FIN-DAY1-EVID-005",
    "ACCESS_RETAIN / REVOKE_OR_REDUCE / BLOCKED",
    "soft-revoke/INACTIVE proof",
    "Any department/user expansion starts before the negative-control closure decision is signed",
  ],
  "finance Day-1 sequential access closure shared source",
  readinessPath,
);

requireAllText(
  financeDayOneStartGateChecklist,
  [
    "Status: PASS_LOCAL_CHECKLIST",
    "FIN_START_READY / NO_GO / BLOCKED",
    "FIN-START-EVID-001",
    "FIN-START-EVID-005",
    "FIN-START-01",
    "FIN-START-05",
    "Do not paste or attach passwords",
    "does not create accounts",
    "send invites",
    "store passwords",
    "grant access",
    "execute UAT",
    "accept evidence",
    "approve finance reliance",
    "approve access closure",
    "move money",
    "issue bank instructions",
    "mark production GO",
    "Do not start `FIN-ACT-EVID-001`",
  ],
  "finance Day-1 start-gate checklist template",
  financeDayOneStartGateChecklistPath,
);

requireAllText(
  financeDayOneActivationTemplate,
  [
    "Status: PASS_LOCAL_TEMPLATE",
    "Production status: NO-GO",
    "Run one activation row at a time",
    "Rollout order",
    "Entry gate",
    "Advance gate",
    "FIN-USER-01",
    "FIN-USER-05",
    "REAL_KHTC_TTGDTX_OPERATOR_01",
    "REAL_BGH_READONLY_01",
    "REAL_AUDIT_READONLY_01",
    "REAL_PHAP_CHE_REVIEW_01",
    "REAL_OUT_OF_SCOPE_NEGATIVE_01",
    "FIN_ACTIVATION_READY / NO_GO / BLOCKED",
    "FIN-ACT-01",
    "FIN-ACT-05",
    "does not create accounts",
    "store passwords",
    "mark production GO",
    "Never paste or attach",
    "Do not open P2-18, P5-03 or P2-17",
    "Do not open the next `FIN-USER` lane",
    "Start Gates Before Any Invite/Create",
    "HEU_FINANCE_DAY1_START_GATE_CHECKLIST_20260630.md",
    "No invite, create or activation row may start",
    "P6-04 Pre-Login Matrix Handoff",
    "allowed route family",
    "blocked route family",
    "negative-control account",
  ],
  "finance Day-1 account activation handoff template",
  financeDayOneActivationTemplatePath,
);

requireAllText(
  financeDayOnePreloginMatrix,
  [
    "Status: PASS_LOCAL_TEMPLATE",
    "Production status: NO-GO",
    "P6_04_PRELOGIN_READY / NO_GO / BLOCKED",
    "Run one pre-login row at a time",
    "Rollout order",
    "Entry gate",
    "Advance gate",
    "FIN-USER-01",
    "FIN-USER-05",
    "REAL_KHTC_TTGDTX_OPERATOR_01",
    "REAL_BGH_READONLY_01",
    "REAL_AUDIT_READONLY_01",
    "REAL_PHAP_CHE_REVIEW_01",
    "REAL_OUT_OF_SCOPE_NEGATIVE_01",
    "P6-04-PRELOGIN-EVID-001",
    "P6-04-PRELOGIN-EVID-005",
    "does not create accounts",
    "store passwords",
    "move money",
    "mark production GO",
    "Do not open the next `FIN-USER` lane",
  ],
  "finance Day-1 P6-04 pre-login matrix template",
  financeDayOnePreloginMatrixPath,
);

requireAllText(
  financeDayOneRunbook,
  [
    "Status: PASS_LOCAL_RUNBOOK",
    "Production status: NO-GO",
    "Required Day-1 Accounts",
    "Rollout order",
    "Entry gate",
    "Advance gate",
    "Run one account lane at a time",
    "FIN-USER-01",
    "FIN-USER-05",
    "REAL_KHTC_TTGDTX_OPERATOR_01",
    "REAL_OUT_OF_SCOPE_NEGATIVE_01",
    "FIN-DAY1-01",
    "FIN-DAY1-05",
    "FIN_DAY1_READY / NO_GO / BLOCKED",
    "Do not paste or store",
    "Passwords, temporary passwords, OTPs, reset links or account invite links",
    "Do not expand from finance to the next department",
    "HEU_FINANCE_DAY1_ACCOUNT_ACTIVATION_TEMPLATE_20260630.md",
    "first real-accounting login",
    "secure invite/create state",
    "HEU profile link",
    "narrow business scope",
    "P6-04 pre-login result",
    "outside Git/Codex/chat",
    "HEU_FINANCE_DAY1_P6_04_PRELOGIN_MATRIX_20260630.md",
    "P6-04 Pre-Login Route Matrix",
    "ALLOWED",
    "BLOCKED",
    "EMPTY_SCOPED_STATE",
    "do not open P2-18, P5-03 or P2-17",
    "Day-1 Result Ledger",
    "HEU_FINANCE_DAY1_RESULT_LEDGER_TEMPLATE_20260630.md",
    "FIN-DAY1-EVID-001",
    "ACCESS_RETAIN",
    "REVOKE_OR_REDUCE",
    "Raw PII, CCCD, bank data, voucher body",
    "does not approve access, accept UAT, approve finance reliance, move money",
    "Sequential Access Closure Decision Queue",
    "Close each lane in order",
    "exact signed scope",
    "Do not open `FIN-USER-02` until signed",
    "Do not expand beyond Finance Day-1 until signed",
  ],
  "finance Day-1 real-run rehearsal runbook",
  financeDayOneRunbookPath,
);

requireAllText(
  financeDayOneLedgerTemplate,
  [
    "Status: PASS_LOCAL_TEMPLATE",
    "Production status: NO-GO",
    "Rollout order",
    "Entry gate",
    "Advance gate",
    "FIN-USER-01",
    "FIN-USER-05",
    "Run one rollout lane at a time",
    "Do not expand beyond Finance Day-1",
    "REAL_KHTC_TTGDTX_OPERATOR_01",
    "REAL_BGH_READONLY_01",
    "REAL_AUDIT_READONLY_01",
    "REAL_PHAP_CHE_REVIEW_01",
    "REAL_OUT_OF_SCOPE_NEGATIVE_01",
    "FIN_DAY1_RESULT_READY / NO_GO / BLOCKED",
    "ACCESS_RETAIN / REVOKE_OR_REDUCE / BLOCKED",
    "does not create accounts",
    "issue bank instructions",
    "mark production GO",
    "No raw screenshots",
    "Stop and Escalate",
    "Sequential Access Closure Decision Queue",
    "Each row must close before the next lane opens",
    "Do not open `FIN-USER-02` until signed",
    "Do not expand beyond Finance Day-1 until signed",
  ],
  "finance Day-1 result ledger and access closure template",
  financeDayOneLedgerTemplatePath,
);

if (!packageJson.scripts?.["audit:heu-user-account-security"]) {
  fail(`${packagePath}: missing audit:heu-user-account-security script`);
}

requireAllText(
  agents,
  ["Before any final handoff", "npm.cmd run audit:heu-user-account-security"],
  "final handoff user-account security audit command",
  agentsPath,
);

requireAllText(
  releaseGate,
  ["audit:heu-user-account-security", "user account temporary password", "security"],
  "release-gate user-account security audit coverage",
  releaseGatePath,
);

requireSection(implementationLog, "2026-06-29 - Real User Access Closure Guard", [
  "data-heu-real-user-access-closure=\"P0-17-P6-04\"",
  "real-user-onboarding-panel.tsx",
  "ACCESS_RETAIN",
  "REVOKE_OR_REDUCE",
  "BLOCKED",
  "P6-04",
  "P2-18",
  "P5-03",
  "soft-revoke",
  "INACTIVE",
  "does not create accounts",
  "revoke live users",
  "send passwords",
  "approve role scope",
  "accept UAT",
  "finance action",
  "mark production GO",
], logPath);

requireSection(implementationLog, "2026-06-29 - Real User Accounting Onboarding Guard", [
  "real-user-onboarding-panel.tsx",
  "UserAuthProfileLinkForm",
  "KHTC/BGH/Audit/Phap Che",
  "Out-of-scope negative account",
  "P6-04",
  "P2-18",
  "P5-03",
  "does not create production accounts",
  "send passwords",
  "approve role scope",
  "accept UAT",
  "approve finance action",
  "mark production GO",
], logPath);

requireSection(implementationLog, "2026-06-30 - Finance Day-1 Start Gate Evidence Checklist", [
  "HEU_FINANCE_DAY1_START_GATE_CHECKLIST_20260630.md",
  "PASS_LOCAL_CHECKLIST",
  "FIN-START-EVID-001",
  "FIN-START-EVID-005",
  "PRODUCTION_FINANCE_DAY_ONE_START_GATE_CHECKLIST",
  "does not create accounts",
  "send",
  "invites",
  "store passwords",
  "grant access",
  "execute UAT",
  "accept evidence",
  "approve finance reliance",
  "approve access closure",
  "move money",
  "mark production GO",
], logPath);

requireSection(implementationLog, "2026-06-30 - Finance Day-1 Start Gates Before Real Account Activation", [
  "PRODUCTION_FINANCE_DAY_ONE_START_GATES",
  "FIN-START-01",
  "FIN-START-05",
  "data-heu-finance-day-one-start-gates=\"P0-03_P0-10_P6-04_P0-14_P0-17\"",
  "data-ttgdtx-finance-day-one-start-gates=\"P0-03_P0-10_P6-04_P0-14_P0-17\"",
  "FIN_START_READY / NO_GO / BLOCKED",
  "does not create accounts",
  "send",
  "invites",
  "store passwords",
  "grant access",
  "execute UAT",
  "accept evidence",
  "approve finance reliance",
  "approve access closure",
  "move money",
  "mark production GO",
], logPath);

requireSection(implementationLog, "2026-06-30 - Finance Day-1 Account Activation Handoff", [
  "HEU_FINANCE_DAY1_ACCOUNT_ACTIVATION_TEMPLATE_20260630.md",
  "PRODUCTION_FINANCE_DAY_ONE_ACCOUNT_ACTIVATION_TEMPLATE",
  "PRODUCTION_FINANCE_DAY_ONE_ACCOUNT_ACTIVATION_CHECKS",
  "FIN-ACT-01 through FIN-ACT-05",
  "FIN_ACTIVATION_READY / NO_GO / BLOCKED",
  "does not create accounts",
  "send",
  "invites",
  "store passwords",
  "approve access",
  "mark production GO",
], logPath);

requireSection(implementationLog, "2026-06-30 - Finance Day-1 P6-04 Pre-Login Matrix", [
  "HEU_FINANCE_DAY1_P6_04_PRELOGIN_MATRIX_20260630.md",
  "PRODUCTION_FINANCE_DAY_ONE_P6_04_PRELOGIN_MATRIX",
  "PRODUCTION_FINANCE_DAY_ONE_P6_04_PRELOGIN_CHECKS",
  "P6-04-PRELOGIN-01",
  "P6-04-PRELOGIN-05",
  "REAL_KHTC_TTGDTX_OPERATOR_01",
  "REAL_OUT_OF_SCOPE_NEGATIVE_01",
  "P6_04_PRELOGIN_READY / NO_GO / BLOCKED",
  "does not create accounts",
  "send",
  "invites",
  "store passwords",
  "execute UAT",
  "grant access",
  "accept route evidence",
  "approve finance action",
  "move money",
  "mark production GO",
], logPath);

requireSection(implementationLog, "2026-06-30 - Finance Day-1 Result Ledger Guard", [
  "PRODUCTION_FINANCE_DAY_ONE_ACCOUNT_LANES",
  "PRODUCTION_FINANCE_DAY_ONE_RESULT_FIELDS",
  "data-heu-finance-day-one-result-ledger=\"P0-17-P6-04-P2-18-P5-03-P2-17\"",
  "REAL_KHTC_TTGDTX_OPERATOR_01",
  "REAL_OUT_OF_SCOPE_NEGATIVE_01",
  "FIN_DAY1_RESULT_READY / NO_GO / BLOCKED",
  "does not create accounts",
  "send passwords",
  "grant access",
  "accept UAT",
  "approve finance action",
  "mark production GO",
], logPath);

requireSection(implementationLog, "2026-06-30 - Finance Day-1 Sequential Real User Rollout", [
  "PRODUCTION_FINANCE_DAY_ONE_ACCOUNT_LANES",
  "rolloutOrder",
  "entryGate",
  "advanceGate",
  "FIN-USER-01",
  "FIN-USER-05",
  "one account lane at a time",
  "controlled result row",
  "P0-17 access closure",
  "does not create accounts",
  "send invites",
  "store passwords",
  "grant access",
  "execute UAT",
  "accept evidence",
  "approve finance reliance",
  "approve access closure",
  "expand departments or users",
  "move money",
  "mark production GO",
], logPath);

requireSection(implementationLog, "2026-06-30 - Finance Day-1 Sequential Access Closure Lanes", [
  "PRODUCTION_FINANCE_DAY_ONE_ACCESS_CLOSURE_LANES",
  "closureDecisionValue",
  "retainCondition",
  "reduceOrRevokeCondition",
  "blockCondition",
  "nextLaneGate",
  "HEU_FINANCE_DAY1_RESULT_LEDGER_TEMPLATE_20260630.md",
  "HEU_FINANCE_DAY1_REAL_RUN_REHEARSAL_20260630.md",
  "ACCESS_RETAIN",
  "REVOKE_OR_REDUCE",
  "BLOCKED",
  "does not create accounts",
  "send invites",
  "store passwords",
  "grant access",
  "revoke live users",
  "execute UAT",
  "accept evidence",
  "approve finance reliance",
  "approve access closure",
  "expand departments or users",
  "move money",
  "mark production GO",
], logPath);

requireSection(implementationLog, "2026-06-28 - Current State User Account Security Alignment", [
  "HEU_CURRENT_STATE_INVENTORY.md",
  "HEU_SYSTEM_BUILD_BACKLOG.md",
  "M02/role-workspace scope",
  "user account temporary password guard",
  "audit-heu-current-state-inventory.mjs",
  "audit-heu-implementation-log.mjs",
  "release-gate audits",
  "current-state/backlog alignment only",
  "does not create accounts",
  "send passwords",
  "approve role scope",
  "mark production GO",
], logPath);

requireSection(implementationLog, "2026-07-02 - P0-17 User Account Security Audit Fast Guard", [
  "audit-heu-user-account-security.mjs",
  "regex-heavy lookahead checks",
  "token-based checks",
  "P0-17",
  "P6-04",
  "Finance Day-1",
  "audit:heu-user-account-security",
  "audit:heu-implementation-log",
  "does not create",
  "accounts",
  "send invites",
  "store passwords",
  "grant access",
  "execute UAT",
  "accept",
  "evidence",
  "approve finance action",
  "approve owner GO/NO-GO",
  "mark production GO",
], logPath);

if (failures.length > 0) {
  console.error("HEU user-account security audit failed.");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(
  "HEU user-account security audit passed. Temporary password and real-user onboarding handling are guarded.",
);
