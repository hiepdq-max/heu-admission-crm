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

function requireText(contents, pattern, label, file) {
  if (!pattern.test(contents)) {
    fail(`${file}: missing ${label}`);
  }
}

const formPath = "components/settings/user-create-form.tsx";
const onboardingPath = "components/settings/real-user-onboarding-panel.tsx";
const actionsPath = "app/settings/actions.ts";
const settingsPagePath = "app/settings/page.tsx";
const scopePagePath = "app/settings/scopes/page.tsx";
const readinessPath = "lib/production-readiness.ts";
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
const packageJson = JSON.parse(read(packagePath));
const agents = read(agentsPath);
const releaseGate = read(releaseGatePath);
const implementationLog = read(logPath);

requireText(
  form,
  /id="password"[\s\S]*type="password"[\s\S]*autoComplete="new-password"[\s\S]*minLength=\{8\}[\s\S]*aria-describedby="temporary-password-help"[\s\S]*temporary-password-help[\s\S]*không gửi qua Codex\/chat[\s\S]*kênh bảo mật/i,
  "temporary password field safety guidance",
  formPath,
);

requireText(
  form,
  /service role key[\s\S]*Không hiển thị key[\s\S]*không ghi log mật khẩu tạm/i,
  "service-role key and temporary password no-log guidance",
  formPath,
);

requireText(
  actions,
  /(?=[\s\S]*unsafeTemporaryPasswords)(?=[\s\S]*password123)(?=[\s\S]*heu123456)(?=[\s\S]*normalizePasswordSignal)(?=[\s\S]*isUnsafeTemporaryPassword)(?=[\s\S]*emailLocalPart)(?=[\s\S]*nameParts)(?=[\s\S]*unsafe_temporary_password)/i,
  "server-side unsafe temporary password guard",
  actionsPath,
);

requireText(
  settingsPage,
  /unsafe_temporary_password[\s\S]*Mật khẩu tạm quá dễ đoán[\s\S]*email\/tên user[\s\S]*kênh bảo mật/i,
  "unsafe temporary password operator error",
  settingsPagePath,
);

requireText(
  onboarding,
  /(?=[\s\S]*data-heu-real-user-onboarding-panel="P0-17")(?=[\s\S]*Real user onboarding for accounting)(?=[\s\S]*PASS_LOCAL only)(?=[\s\S]*USER-REAL-01)(?=[\s\S]*USER-REAL-05)(?=[\s\S]*Supabase Auth)(?=[\s\S]*User Scope Enforcement)(?=[\s\S]*P6-04)(?=[\s\S]*P2-18)(?=[\s\S]*P5-03)(?=[\s\S]*USER_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*passwords, temporary passwords, OTPs, password reset links,\s+account activation\/invite links)(?=[\s\S]*production GO)/i,
  "real-user accounting onboarding guard",
  onboardingPath,
);

requireText(
  onboarding,
  /(?=[\s\S]*data-heu-real-user-finance-lanes="P0-17-P5-03")(?=[\s\S]*KHTC accounting operator)(?=[\s\S]*BGH read-only reviewer)(?=[\s\S]*Audit read-only reviewer)(?=[\s\S]*Phap Che contract\/legal reviewer)(?=[\s\S]*Out-of-scope negative account)/i,
  "real-user finance-accounting lanes",
  onboardingPath,
);

requireText(
  onboarding,
  /(?=[\s\S]*data-heu-real-user-access-closure="P0-17-P6-04")(?=[\s\S]*Real-user access closure after pilot\/UAT)(?=[\s\S]*USER-CLOSE-01)(?=[\s\S]*USER-CLOSE-04)(?=[\s\S]*ACCESS_RETAIN \/ REVOKE_OR_REDUCE \/ BLOCKED)(?=[\s\S]*P6-04)(?=[\s\S]*P2-18)(?=[\s\S]*P5-03)(?=[\s\S]*soft-revoke\/INACTIVE)(?=[\s\S]*passwords, temporary passwords, OTPs, password reset links)(?=[\s\S]*account activation\/invite links)/i,
  "real-user access closure guard",
  onboardingPath,
);

requireText(
  onboarding,
  /(?=[\s\S]*PRODUCTION_FINANCE_DAY_ONE_RUN_STEPS)(?=[\s\S]*data-heu-finance-day-one-run-rehearsal="P0-17-P6-04-P2-18-P5-03-P2-17")(?=[\s\S]*Finance Day-1 real-run rehearsal before expansion)(?=[\s\S]*FIN_DAY1_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*approved real-accounting account labels)(?=[\s\S]*does not create accounts, approve access, accept\s+UAT, move money or mark production GO)(?=[\s\S]*step\.requiredAction)(?=[\s\S]*step\.stopCondition)/i,
  "finance Day-1 real-run rehearsal guard",
  onboardingPath,
);

requireText(
  readinessSource,
  /(?=[\s\S]*export const PRODUCTION_FINANCE_DAY_ONE_RUN_STEPS)(?=[\s\S]*FIN-DAY1-01)(?=[\s\S]*Secure account activation outside Codex)(?=[\s\S]*FIN-DAY1-02)(?=[\s\S]*Scope proof before first finance login)(?=[\s\S]*FIN-DAY1-03)(?=[\s\S]*Read-only dashboard confidence check)(?=[\s\S]*FIN-DAY1-04)(?=[\s\S]*Payout rehearsal with no bank action)(?=[\s\S]*FIN-DAY1-05)(?=[\s\S]*Access closure before expansion)(?=[\s\S]*FIN_DAY1_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*Passwords, temporary passwords, OTPs, reset links)(?=[\s\S]*blocked users keep active finance access)/i,
  "finance Day-1 real-run rehearsal shared source",
  readinessPath,
);

requireText(
  settingsPage,
  /RealUserOnboardingPanel[\s\S]*<RealUserOnboardingPanel \/>[\s\S]*<UserCreateForm/,
  "real-user onboarding panel before create-user form",
  settingsPagePath,
);

requireText(
  scopePage,
  /RealUserOnboardingPanel[\s\S]*<RealUserOnboardingPanel \/>[\s\S]*<UserCreateForm/,
  "real-user onboarding panel before scoped create-user form",
  scopePagePath,
);

if (!packageJson.scripts?.["audit:heu-user-account-security"]) {
  fail(`${packagePath}: missing audit:heu-user-account-security script`);
}

requireText(
  agents,
  /Before any final handoff[\s\S]*npm\.cmd run audit:heu-user-account-security/i,
  "final handoff user-account security audit command",
  agentsPath,
);

requireText(
  releaseGate,
  /audit:heu-user-account-security[\s\S]*user account temporary password[\s\S]*security/i,
  "release-gate user-account security audit coverage",
  releaseGatePath,
);

requireText(
  implementationLog,
  /User Account Temporary Password Guard[\s\S]*user-create-form\.tsx[\s\S]*actions\.ts[\s\S]*unsafe temporary passwords[\s\S]*audit-heu-user-account-security\.mjs[\s\S]*does not create production accounts,\s+send passwords, rotate keys, enable\s+MFA, accept UAT or mark production GO/i,
  "implementation log boundary",
  logPath,
);

requireText(
  implementationLog,
  /(?=[\s\S]*Real User Access Closure Guard)(?=[\s\S]*data-heu-real-user-access-closure="P0-17-P6-04")(?=[\s\S]*real-user-onboarding-panel\.tsx)(?=[\s\S]*ACCESS_RETAIN)(?=[\s\S]*REVOKE_OR_REDUCE)(?=[\s\S]*BLOCKED)(?=[\s\S]*P6-04)(?=[\s\S]*P2-18)(?=[\s\S]*P5-03)(?=[\s\S]*soft-revoke)(?=[\s\S]*INACTIVE)(?=[\s\S]*does not create accounts[\s\S]*revoke live users[\s\S]*send passwords[\s\S]*approve role scope[\s\S]*accept UAT[\s\S]*approve finance action[\s\S]*mark production GO)/i,
  "real-user access closure log boundary",
  logPath,
);

requireText(
  implementationLog,
  /(?=[\s\S]*Real User Accounting Onboarding Guard)(?=[\s\S]*real-user-onboarding-panel\.tsx)(?=[\s\S]*UserAuthProfileLinkForm)(?=[\s\S]*KHTC\/BGH\/Audit\/Phap Che)(?=[\s\S]*Out-of-scope negative account)(?=[\s\S]*P6-04)(?=[\s\S]*P2-18)(?=[\s\S]*P5-03)(?=[\s\S]*does not create production accounts[\s\S]*send passwords[\s\S]*approve role scope[\s\S]*accept UAT[\s\S]*approve finance action[\s\S]*mark production GO)/i,
  "real-user accounting onboarding log boundary",
  logPath,
);

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
