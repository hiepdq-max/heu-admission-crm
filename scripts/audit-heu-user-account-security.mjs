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

function requireAllText(contents, tokens, label, file) {
  for (const token of tokens) {
    if (!contents.includes(token)) {
      fail(`${file}: missing ${label}: ${token}`);
    }
  }
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
  /(?=[\s\S]*PRODUCTION_FINANCE_DAY_ONE_START_GATES)(?=[\s\S]*PRODUCTION_FINANCE_DAY_ONE_START_GATE_CHECKLIST)(?=[\s\S]*data-heu-finance-day-one-start-gates="P0-03_P0-10_P6-04_P0-14_P0-17")(?=[\s\S]*Finance Day-1 start gates before real-accounting accounts)(?=[\s\S]*FIN_START_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*Do not invite, create or activate any real-accounting account)(?=[\s\S]*controlled evidence outside Git\/Codex\/chat)(?=[\s\S]*Checklist:[\s\S]*PRODUCTION_FINANCE_DAY_ONE_START_GATE_CHECKLIST)(?=[\s\S]*gate\.requiredProof)(?=[\s\S]*gate\.stopCondition)/i,
  "finance Day-1 start gates before real-accounting accounts UI",
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
  /(?=[\s\S]*PRODUCTION_FINANCE_DAY_ONE_ACCESS_CLOSURE_LANES)(?=[\s\S]*data-heu-finance-day-one-access-closure-lanes="P0-17-FIN-USER")(?=[\s\S]*Finance Day-1 sequential access closure lanes)(?=[\s\S]*Close one `FIN-USER` lane at a time)(?=[\s\S]*current lane has a\s+controlled P0-17 closure decision)(?=[\s\S]*lane\.rolloutOrder)(?=[\s\S]*lane\.accountLabel)(?=[\s\S]*lane\.closureDecisionValue)(?=[\s\S]*lane\.retainCondition)(?=[\s\S]*lane\.reduceOrRevokeCondition)(?=[\s\S]*lane\.nextLaneGate)(?=[\s\S]*lane\.stopCondition)/i,
  "finance Day-1 sequential access closure lanes UI",
  onboardingPath,
);

requireText(
  onboarding,
  /(?=[\s\S]*PRODUCTION_FINANCE_DAY_ONE_ACCOUNT_ACTIVATION_CHECKS)(?=[\s\S]*PRODUCTION_FINANCE_DAY_ONE_ACCOUNT_ACTIVATION_TEMPLATE)(?=[\s\S]*data-heu-finance-day-one-account-activation="P0-17-P6-04")(?=[\s\S]*Finance Day-1 account activation handoff)(?=[\s\S]*FIN_ACTIVATION_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*invite status, profile link, narrow scope and P6-04\s+pre-login checks)(?=[\s\S]*without storing credentials or invite links)(?=[\s\S]*Template:[\s\S]*PRODUCTION_FINANCE_DAY_ONE_ACCOUNT_ACTIVATION_TEMPLATE)(?=[\s\S]*item\.requiredProof)(?=[\s\S]*item\.stopCondition)/i,
  "finance Day-1 account activation handoff guard",
  onboardingPath,
);

requireText(
  onboarding,
  /(?=[\s\S]*PRODUCTION_FINANCE_DAY_ONE_P6_04_PRELOGIN_CHECKS)(?=[\s\S]*PRODUCTION_FINANCE_DAY_ONE_P6_04_PRELOGIN_MATRIX)(?=[\s\S]*data-heu-finance-day-one-p6-04-prelogin-matrix="P6-04-P0-17")(?=[\s\S]*Finance Day-1 P6-04 pre-login route matrix)(?=[\s\S]*P6_04_PRELOGIN_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*Record one P6-04 route\/scope result before any real-accounting account opens P2-18, P5-03 or P2-17)(?=[\s\S]*Negative-control account must be BLOCKED\/EMPTY_SCOPED_STATE)(?=[\s\S]*Matrix:[\s\S]*PRODUCTION_FINANCE_DAY_ONE_P6_04_PRELOGIN_MATRIX)(?=[\s\S]*item\.rolloutOrder)(?=[\s\S]*item\.entryGate)(?=[\s\S]*item\.advanceGate)(?=[\s\S]*item\.accountLabel)(?=[\s\S]*item\.allowedBeforeFinanceLogin)(?=[\s\S]*item\.blockedBeforeFinanceLogin)(?=[\s\S]*item\.requiredResult)(?=[\s\S]*item\.stopCondition)/i,
  "finance Day-1 P6-04 pre-login route matrix guard",
  onboardingPath,
);

requireText(
  onboarding,
  /(?=[\s\S]*PRODUCTION_FINANCE_DAY_ONE_RUNBOOK)(?=[\s\S]*PRODUCTION_FINANCE_DAY_ONE_RUN_STEPS)(?=[\s\S]*data-heu-finance-day-one-run-rehearsal="P0-17-P6-04-P2-18-P5-03-P2-17")(?=[\s\S]*Finance Day-1 real-run rehearsal before expansion)(?=[\s\S]*FIN_DAY1_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*approved real-accounting account labels)(?=[\s\S]*does not create accounts, approve access, accept\s+UAT, move money or mark production GO)(?=[\s\S]*Runbook:[\s\S]*PRODUCTION_FINANCE_DAY_ONE_RUNBOOK)(?=[\s\S]*step\.requiredAction)(?=[\s\S]*step\.stopCondition)/i,
  "finance Day-1 real-run rehearsal guard",
  onboardingPath,
);

requireText(
  onboarding,
  /(?=[\s\S]*PRODUCTION_FINANCE_DAY_ONE_ACCOUNT_LANES)(?=[\s\S]*PRODUCTION_FINANCE_DAY_ONE_RESULT_FIELDS)(?=[\s\S]*PRODUCTION_FINANCE_DAY_ONE_RESULT_LEDGER_TEMPLATE)(?=[\s\S]*data-heu-finance-day-one-result-ledger="P0-17-P6-04-P2-18-P5-03-P2-17")(?=[\s\S]*Finance Day-1 result ledger for real users)(?=[\s\S]*Template:[\s\S]*PRODUCTION_FINANCE_DAY_ONE_RESULT_LEDGER_TEMPLATE)(?=[\s\S]*FIN_DAY1_RESULT_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*Record one controlled result row per approved account label and route)(?=[\s\S]*does not approve\s+access, accept UAT, approve finance reliance, move money or mark\s+production GO)(?=[\s\S]*lane\.rolloutOrder)(?=[\s\S]*lane\.entryGate)(?=[\s\S]*lane\.advanceGate)(?=[\s\S]*lane\.accountLabel)(?=[\s\S]*lane\.requiredResult)(?=[\s\S]*lane\.stopCondition)(?=[\s\S]*item\.forbiddenContent)/i,
  "finance Day-1 result ledger guard",
  onboardingPath,
);

requireText(
  readinessSource,
  /(?=[\s\S]*PRODUCTION_FINANCE_DAY_ONE_START_GATE_CHECKLIST[\s\S]*HEU_FINANCE_DAY1_START_GATE_CHECKLIST_20260630\.md)(?=[\s\S]*export type ProductionFinanceDayOneStartGate)(?=[\s\S]*export const PRODUCTION_FINANCE_DAY_ONE_START_GATES)(?=[\s\S]*FIN-START-01)(?=[\s\S]*FIN-START-05)/i,
  "finance Day-1 start-gate checklist shared source",
  readinessPath,
);

requireText(
  readinessSource,
  /(?=[\s\S]*export type ProductionFinanceDayOneStartGate)(?=[\s\S]*export const PRODUCTION_FINANCE_DAY_ONE_START_GATES)(?=[\s\S]*FIN-START-01)(?=[\s\S]*P0-03 backup\/restore evidence is accepted before real accounts)(?=[\s\S]*FIN-START-02)(?=[\s\S]*Signed finance UAT route package is ready)(?=[\s\S]*FIN-START-03)(?=[\s\S]*P0-10 controlled evidence redaction location is ready)(?=[\s\S]*FIN-START-04)(?=[\s\S]*P0-14\/P0-17 evidence and access-closure path is prepared)(?=[\s\S]*FIN-START-05)(?=[\s\S]*Human owner boundary is acknowledged)(?=[\s\S]*FIN_START_READY)(?=[\s\S]*create accounts, grant access, accept UAT, move money or mark production GO)/i,
  "finance Day-1 start gates shared source",
  readinessPath,
);

requireText(
  readinessSource,
  /(?=[\s\S]*PRODUCTION_FINANCE_DAY_ONE_ACCOUNT_ACTIVATION_TEMPLATE[\s\S]*HEU_FINANCE_DAY1_ACCOUNT_ACTIVATION_TEMPLATE_20260630\.md)(?=[\s\S]*export type ProductionFinanceDayOneAccountActivationCheck)(?=[\s\S]*export const PRODUCTION_FINANCE_DAY_ONE_ACCOUNT_ACTIVATION_CHECKS)(?=[\s\S]*FIN-ACT-01)(?=[\s\S]*Account label and owner are approved)(?=[\s\S]*FIN-ACT-02)(?=[\s\S]*Supabase Auth invite stays outside Codex)(?=[\s\S]*FIN-ACT-03)(?=[\s\S]*HEU profile link is completed)(?=[\s\S]*FIN-ACT-04)(?=[\s\S]*Business scope is assigned before login)(?=[\s\S]*FIN-ACT-05)(?=[\s\S]*P6-04 pre-login route check is recorded)(?=[\s\S]*Password, temporary password, OTP, reset link, account invite\/activation link)/i,
  "finance Day-1 account activation handoff shared source",
  readinessPath,
);

requireText(
  readinessSource,
  /(?=[\s\S]*PRODUCTION_FINANCE_DAY_ONE_P6_04_PRELOGIN_MATRIX[\s\S]*HEU_FINANCE_DAY1_P6_04_PRELOGIN_MATRIX_20260630\.md)(?=[\s\S]*export type ProductionFinanceDayOnePreloginRouteCheck)(?=[\s\S]*rolloutOrder)(?=[\s\S]*entryGate)(?=[\s\S]*advanceGate)(?=[\s\S]*export const PRODUCTION_FINANCE_DAY_ONE_P6_04_PRELOGIN_CHECKS)(?=[\s\S]*FIN-USER-01)(?=[\s\S]*P6-04-PRELOGIN-01)(?=[\s\S]*REAL_KHTC_TTGDTX_OPERATOR_01)(?=[\s\S]*FIN-USER-05)(?=[\s\S]*P6-04-PRELOGIN-05)(?=[\s\S]*REAL_OUT_OF_SCOPE_NEGATIVE_01)(?=[\s\S]*allowedBeforeFinanceLogin)(?=[\s\S]*blockedBeforeFinanceLogin)(?=[\s\S]*requiredResult)(?=[\s\S]*BLOCKED or EMPTY_SCOPED_STATE)(?=[\s\S]*negative-control account sees any protected route)/i,
  "finance Day-1 P6-04 pre-login route matrix shared source",
  readinessPath,
);

requireText(
  readinessSource,
  /(?=[\s\S]*PRODUCTION_FINANCE_DAY_ONE_RUNBOOK[\s\S]*HEU_FINANCE_DAY1_REAL_RUN_REHEARSAL_20260630\.md)(?=[\s\S]*export const PRODUCTION_FINANCE_DAY_ONE_RUN_STEPS)(?=[\s\S]*FIN-DAY1-01)(?=[\s\S]*Secure account activation outside Codex)(?=[\s\S]*FIN-DAY1-02)(?=[\s\S]*Scope proof before first finance login)(?=[\s\S]*FIN-DAY1-03)(?=[\s\S]*Read-only dashboard confidence check)(?=[\s\S]*FIN-DAY1-04)(?=[\s\S]*Payout rehearsal with no bank action)(?=[\s\S]*FIN-DAY1-05)(?=[\s\S]*Access closure before expansion)(?=[\s\S]*FIN_DAY1_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*Passwords, temporary passwords, OTPs, reset links)(?=[\s\S]*blocked users keep active finance access)/i,
  "finance Day-1 real-run rehearsal shared source",
  readinessPath,
);

requireText(
  readinessSource,
  /(?=[\s\S]*PRODUCTION_FINANCE_DAY_ONE_RESULT_LEDGER_TEMPLATE[\s\S]*HEU_FINANCE_DAY1_RESULT_LEDGER_TEMPLATE_20260630\.md)(?=[\s\S]*export type ProductionFinanceDayOneAccountLane)(?=[\s\S]*rolloutOrder)(?=[\s\S]*entryGate)(?=[\s\S]*advanceGate)(?=[\s\S]*export type ProductionFinanceDayOneResultField)(?=[\s\S]*export const PRODUCTION_FINANCE_DAY_ONE_ACCOUNT_LANES)(?=[\s\S]*FIN-USER-01)(?=[\s\S]*FIN-USER-05)(?=[\s\S]*Do not open FIN-USER-02)(?=[\s\S]*Do not expand beyond Finance Day-1)(?=[\s\S]*REAL_KHTC_TTGDTX_OPERATOR_01)(?=[\s\S]*REAL_BGH_READONLY_01)(?=[\s\S]*REAL_AUDIT_READONLY_01)(?=[\s\S]*REAL_PHAP_CHE_REVIEW_01)(?=[\s\S]*REAL_OUT_OF_SCOPE_NEGATIVE_01)(?=[\s\S]*export const PRODUCTION_FINANCE_DAY_ONE_RESULT_FIELDS)(?=[\s\S]*Rollout order)(?=[\s\S]*Entry gate)(?=[\s\S]*Advance gate)(?=[\s\S]*No skipped lane)(?=[\s\S]*No next-lane access)(?=[\s\S]*Evidence ID)(?=[\s\S]*Owner decision)(?=[\s\S]*FIN_DAY1_RESULT_READY)(?=[\s\S]*Access closure)(?=[\s\S]*No raw PII, CCCD, bank data, voucher body)(?=[\s\S]*No password, OTP, invite\/reset link)/i,
  "finance Day-1 result ledger shared source",
  readinessPath,
);

requireText(
  readinessSource,
  /(?=[\s\S]*export type ProductionFinanceDayOneAccessClosureLane)(?=[\s\S]*closureDecisionValue)(?=[\s\S]*retainCondition)(?=[\s\S]*reduceOrRevokeCondition)(?=[\s\S]*blockCondition)(?=[\s\S]*nextLaneGate)(?=[\s\S]*requiredProof)(?=[\s\S]*export const PRODUCTION_FINANCE_DAY_ONE_ACCESS_CLOSURE_LANES)(?=[\s\S]*FIN-USER-01)(?=[\s\S]*FIN-DAY1-EVID-001)(?=[\s\S]*Do not open FIN-USER-02)(?=[\s\S]*FIN-USER-05)(?=[\s\S]*FIN-DAY1-EVID-005)(?=[\s\S]*Do not expand beyond Finance Day-1)(?=[\s\S]*ACCESS_RETAIN \/ REVOKE_OR_REDUCE \/ BLOCKED)(?=[\s\S]*soft-revoke\/INACTIVE proof)(?=[\s\S]*Any department\/user expansion starts before the negative-control closure decision is signed)/i,
  "finance Day-1 sequential access closure shared source",
  readinessPath,
);

requireText(
  financeDayOneRunbook,
  /(?=[\s\S]*HEU_FINANCE_DAY1_ACCOUNT_ACTIVATION_TEMPLATE_20260630\.md)(?=[\s\S]*before[\s\S]*first real-accounting login)(?=[\s\S]*secure invite\/create state)(?=[\s\S]*HEU profile link)(?=[\s\S]*narrow business scope)(?=[\s\S]*P6-04 pre-login result)(?=[\s\S]*outside Git\/Codex\/chat)/i,
  "finance Day-1 account activation link in real-run runbook",
  financeDayOneRunbookPath,
);

requireText(
  financeDayOneRunbook,
  /(?=[\s\S]*HEU_FINANCE_DAY1_P6_04_PRELOGIN_MATRIX_20260630\.md)(?=[\s\S]*P6-04 Pre-Login Route Matrix)(?=[\s\S]*P6_04_PRELOGIN_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*REAL_KHTC_TTGDTX_OPERATOR_01)(?=[\s\S]*REAL_OUT_OF_SCOPE_NEGATIVE_01)(?=[\s\S]*ALLOWED)(?=[\s\S]*BLOCKED)(?=[\s\S]*EMPTY_SCOPED_STATE)(?=[\s\S]*do not open P2-18, P5-03 or P2-17)/i,
  "finance Day-1 P6-04 pre-login matrix in real-run runbook",
  financeDayOneRunbookPath,
);

requireText(
  financeDayOneActivationTemplate,
  /(?=[\s\S]*Status:\s*PASS_LOCAL_TEMPLATE)(?=[\s\S]*Production status:\s*NO-GO)(?=[\s\S]*Run one activation row at a time)(?=[\s\S]*Rollout order)(?=[\s\S]*Entry gate)(?=[\s\S]*Advance gate)(?=[\s\S]*FIN-USER-01)(?=[\s\S]*FIN-USER-05)(?=[\s\S]*REAL_KHTC_TTGDTX_OPERATOR_01)(?=[\s\S]*REAL_BGH_READONLY_01)(?=[\s\S]*REAL_AUDIT_READONLY_01)(?=[\s\S]*REAL_PHAP_CHE_REVIEW_01)(?=[\s\S]*REAL_OUT_OF_SCOPE_NEGATIVE_01)(?=[\s\S]*FIN_ACTIVATION_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*FIN-ACT-01)(?=[\s\S]*FIN-ACT-05)(?=[\s\S]*does not create accounts)(?=[\s\S]*store passwords)(?=[\s\S]*mark production GO)(?=[\s\S]*Never paste or attach)(?=[\s\S]*Do not open P2-18, P5-03 or P2-17)(?=[\s\S]*Do not open the next `FIN-USER` lane)/i,
  "finance Day-1 account activation handoff template",
  financeDayOneActivationTemplatePath,
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
    "Start Gates Before Any Invite/Create",
    "HEU_FINANCE_DAY1_START_GATE_CHECKLIST_20260630.md",
    "FIN-START-EVID-001",
    "FIN-START-EVID-005",
    "FIN_START_READY / NO_GO / BLOCKED",
    "FIN-START-01 P0-03 backup/restore evidence accepted",
    "FIN-START-05 Human owner boundary acknowledged",
    "No invite, create or activation row may start",
    "Start first after `FIN_START_READY`",
    "PASS_LOCAL does not approve access, UAT, finance reliance, migration, owner GO or production GO",
  ],
  "finance Day-1 account activation start-gate template",
  financeDayOneActivationTemplatePath,
);

requireText(
  financeDayOneActivationTemplate,
  /(?=[\s\S]*P6-04 Pre-Login Matrix Handoff)(?=[\s\S]*HEU_FINANCE_DAY1_P6_04_PRELOGIN_MATRIX_20260630\.md)(?=[\s\S]*P6_04_PRELOGIN_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*allowed route family)(?=[\s\S]*blocked route family)(?=[\s\S]*negative-control account)(?=[\s\S]*Do not open P2-18, P5-03 or P2-17)/i,
  "finance Day-1 activation template P6-04 pre-login handoff",
  financeDayOneActivationTemplatePath,
);

requireText(
  financeDayOnePreloginMatrix,
  /(?=[\s\S]*Status:\s*PASS_LOCAL_TEMPLATE)(?=[\s\S]*Production status:\s*NO-GO)(?=[\s\S]*P6_04_PRELOGIN_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*Run one pre-login row at a time)(?=[\s\S]*Rollout order)(?=[\s\S]*Entry gate)(?=[\s\S]*Advance gate)(?=[\s\S]*FIN-USER-01)(?=[\s\S]*FIN-USER-05)(?=[\s\S]*REAL_KHTC_TTGDTX_OPERATOR_01)(?=[\s\S]*REAL_BGH_READONLY_01)(?=[\s\S]*REAL_AUDIT_READONLY_01)(?=[\s\S]*REAL_PHAP_CHE_REVIEW_01)(?=[\s\S]*REAL_OUT_OF_SCOPE_NEGATIVE_01)(?=[\s\S]*P6-04-PRELOGIN-EVID-001)(?=[\s\S]*P6-04-PRELOGIN-EVID-005)(?=[\s\S]*does not create accounts)(?=[\s\S]*store passwords)(?=[\s\S]*move money)(?=[\s\S]*mark production GO)(?=[\s\S]*Do not open the next `FIN-USER` lane)/i,
  "finance Day-1 P6-04 pre-login matrix template",
  financeDayOnePreloginMatrixPath,
);

requireText(
  financeDayOneRunbook,
  /(?=[\s\S]*Status:\s*PASS_LOCAL_RUNBOOK)(?=[\s\S]*Production status:\s*NO-GO)(?=[\s\S]*Required Day-1 Accounts)(?=[\s\S]*Rollout order)(?=[\s\S]*Entry gate)(?=[\s\S]*Advance gate)(?=[\s\S]*Run one account lane at a time)(?=[\s\S]*FIN-USER-01)(?=[\s\S]*FIN-USER-05)(?=[\s\S]*REAL_KHTC_TTGDTX_OPERATOR_01)(?=[\s\S]*REAL_OUT_OF_SCOPE_NEGATIVE_01)(?=[\s\S]*FIN-DAY1-01)(?=[\s\S]*FIN-DAY1-05)(?=[\s\S]*FIN_DAY1_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*Do not paste or store)(?=[\s\S]*Passwords, temporary passwords, OTPs, reset links or account invite links)(?=[\s\S]*Do not expand from finance to the next department)/i,
  "finance Day-1 real-run rehearsal runbook",
  financeDayOneRunbookPath,
);

requireText(
  financeDayOneRunbook,
  /(?=[\s\S]*Day-1 Result Ledger)(?=[\s\S]*HEU_FINANCE_DAY1_RESULT_LEDGER_TEMPLATE_20260630\.md)(?=[\s\S]*Rollout order)(?=[\s\S]*Advance gate)(?=[\s\S]*FIN-USER-01)(?=[\s\S]*FIN-USER-05)(?=[\s\S]*REAL_KHTC_TTGDTX_OPERATOR_01)(?=[\s\S]*REAL_OUT_OF_SCOPE_NEGATIVE_01)(?=[\s\S]*FIN-DAY1-EVID-001)(?=[\s\S]*FIN_DAY1_RESULT_READY)(?=[\s\S]*ACCESS_RETAIN)(?=[\s\S]*REVOKE_OR_REDUCE)(?=[\s\S]*Raw PII, CCCD, bank data, voucher body)(?=[\s\S]*does not approve access, accept UAT, approve finance reliance, move money or\s+mark production GO)/i,
  "finance Day-1 result ledger runbook",
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
  ],
  "finance Day-1 result ledger template",
  financeDayOneLedgerTemplatePath,
);

requireAllText(
  financeDayOneLedgerTemplate,
  [
    "Sequential Access Closure Decision Queue",
    "Each row must close before the next lane opens",
    "ACCESS_RETAIN",
    "REVOKE_OR_REDUCE",
    "BLOCKED",
    "FIN-DAY1-EVID-001",
    "FIN-DAY1-EVID-005",
    "Do not open `FIN-USER-02` until signed",
    "Do not expand beyond Finance Day-1 until signed",
  ],
  "finance Day-1 sequential access closure decision queue template",
  financeDayOneLedgerTemplatePath,
);

requireAllText(
  financeDayOneRunbook,
  [
    "Sequential Access Closure Decision Queue",
    "Close each lane in order",
    "exact signed scope",
    "REVOKE_OR_REDUCE",
    "FIN-DAY1-EVID-001",
    "FIN-DAY1-EVID-005",
    "Do not open `FIN-USER-02` until signed",
    "Do not expand beyond Finance Day-1 until signed",
  ],
  "finance Day-1 sequential access closure decision queue runbook",
  financeDayOneRunbookPath,
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

requireText(
  implementationLog,
  /(?=[\s\S]*Finance Day-1 Start Gate Evidence Checklist)(?=[\s\S]*HEU_FINANCE_DAY1_START_GATE_CHECKLIST_20260630\.md)(?=[\s\S]*PASS_LOCAL_CHECKLIST)(?=[\s\S]*FIN-START-EVID-001)(?=[\s\S]*FIN-START-EVID-005)(?=[\s\S]*PRODUCTION_FINANCE_DAY_ONE_START_GATE_CHECKLIST)(?=[\s\S]*data-heu-finance-day-one-start-gates="P0-03_P0-10_P6-04_P0-14_P0-17")(?=[\s\S]*data-ttgdtx-finance-day-one-start-gates="P0-03_P0-10_P6-04_P0-14_P0-17")(?=[\s\S]*does not create accounts)(?=[\s\S]*send\s+invites)(?=[\s\S]*store passwords)(?=[\s\S]*grant access)(?=[\s\S]*execute UAT)(?=[\s\S]*accept evidence)(?=[\s\S]*approve finance reliance)(?=[\s\S]*approve access closure)(?=[\s\S]*move money)(?=[\s\S]*mark production GO)/i,
  "finance Day-1 start-gate checklist log boundary",
  logPath,
);

requireText(
  implementationLog,
  /(?=[\s\S]*Finance Day-1 Start Gates Before Real Account Activation)(?=[\s\S]*PRODUCTION_FINANCE_DAY_ONE_START_GATES)(?=[\s\S]*FIN-START-01)(?=[\s\S]*FIN-START-05)(?=[\s\S]*data-heu-finance-day-one-start-gates="P0-03_P0-10_P6-04_P0-14_P0-17")(?=[\s\S]*data-ttgdtx-finance-day-one-start-gates="P0-03_P0-10_P6-04_P0-14_P0-17")(?=[\s\S]*FIN_START_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*does not create accounts)(?=[\s\S]*send\s+invites)(?=[\s\S]*store passwords)(?=[\s\S]*grant access)(?=[\s\S]*execute UAT)(?=[\s\S]*accept evidence)(?=[\s\S]*approve finance reliance)(?=[\s\S]*approve access closure)(?=[\s\S]*move money)(?=[\s\S]*mark production GO)/i,
  "finance Day-1 start gates log boundary",
  logPath,
);

requireText(
  implementationLog,
  /(?=[\s\S]*Finance Day-1 Account Activation Handoff)(?=[\s\S]*HEU_FINANCE_DAY1_ACCOUNT_ACTIVATION_TEMPLATE_20260630\.md)(?=[\s\S]*PRODUCTION_FINANCE_DAY_ONE_ACCOUNT_ACTIVATION_TEMPLATE)(?=[\s\S]*PRODUCTION_FINANCE_DAY_ONE_ACCOUNT_ACTIVATION_CHECKS)(?=[\s\S]*data-ttgdtx-finance-day-one-account-activation="P0-17_P6-04")(?=[\s\S]*data-heu-finance-day-one-account-activation="P0-17-P6-04")(?=[\s\S]*FIN-ACT-01 through FIN-ACT-05)(?=[\s\S]*FIN_ACTIVATION_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*does not create accounts)(?=[\s\S]*send\s+invites)(?=[\s\S]*store passwords)(?=[\s\S]*approve access)(?=[\s\S]*mark production GO)/i,
  "finance Day-1 account activation handoff log boundary",
  logPath,
);

requireText(
  implementationLog,
  /(?=[\s\S]*Finance Day-1 P6-04 Pre-Login Matrix)(?=[\s\S]*HEU_FINANCE_DAY1_P6_04_PRELOGIN_MATRIX_20260630\.md)(?=[\s\S]*PRODUCTION_FINANCE_DAY_ONE_P6_04_PRELOGIN_MATRIX)(?=[\s\S]*PRODUCTION_FINANCE_DAY_ONE_P6_04_PRELOGIN_CHECKS)(?=[\s\S]*data-ttgdtx-finance-day-one-p6-04-prelogin-matrix="P6-04_P0-17")(?=[\s\S]*data-heu-finance-day-one-p6-04-prelogin-matrix="P6-04-P0-17")(?=[\s\S]*P6-04-PRELOGIN-01)(?=[\s\S]*P6-04-PRELOGIN-05)(?=[\s\S]*REAL_KHTC_TTGDTX_OPERATOR_01)(?=[\s\S]*REAL_OUT_OF_SCOPE_NEGATIVE_01)(?=[\s\S]*P6_04_PRELOGIN_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*does not create accounts)(?=[\s\S]*send\s+invites)(?=[\s\S]*store passwords)(?=[\s\S]*execute UAT)(?=[\s\S]*grant access)(?=[\s\S]*accept route evidence)(?=[\s\S]*approve finance action)(?=[\s\S]*move money)(?=[\s\S]*mark production GO)/i,
  "finance Day-1 P6-04 pre-login matrix log boundary",
  logPath,
);

requireText(
  implementationLog,
  /(?=[\s\S]*Finance Day-1 Result Ledger Guard)(?=[\s\S]*PRODUCTION_FINANCE_DAY_ONE_ACCOUNT_LANES)(?=[\s\S]*PRODUCTION_FINANCE_DAY_ONE_RESULT_FIELDS)(?=[\s\S]*data-heu-finance-day-one-result-ledger="P0-17-P6-04-P2-18-P5-03-P2-17")(?=[\s\S]*REAL_KHTC_TTGDTX_OPERATOR_01)(?=[\s\S]*REAL_OUT_OF_SCOPE_NEGATIVE_01)(?=[\s\S]*FIN_DAY1_RESULT_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*does not create accounts[\s\S]*send passwords[\s\S]*grant access[\s\S]*accept UAT[\s\S]*approve finance action[\s\S]*mark production GO)/i,
  "finance Day-1 result ledger log boundary",
  logPath,
);

requireText(
  implementationLog,
  /(?=[\s\S]*Finance Day-1 Result Ledger Template)(?=[\s\S]*HEU_FINANCE_DAY1_RESULT_LEDGER_TEMPLATE_20260630\.md)(?=[\s\S]*PASS_LOCAL_TEMPLATE)(?=[\s\S]*PRODUCTION_FINANCE_DAY_ONE_RESULT_LEDGER_TEMPLATE)(?=[\s\S]*REAL_KHTC_TTGDTX_OPERATOR_01)(?=[\s\S]*REAL_OUT_OF_SCOPE_NEGATIVE_01)(?=[\s\S]*FIN_DAY1_RESULT_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*ACCESS_RETAIN \/ REVOKE_OR_REDUCE \/ BLOCKED)(?=[\s\S]*does not collect evidence[\s\S]*create accounts[\s\S]*send passwords[\s\S]*approve finance action[\s\S]*issue bank instructions[\s\S]*mark production GO)/i,
  "finance Day-1 result ledger template log boundary",
  logPath,
);

requireAllText(
  implementationLog,
  [
    "Finance Day-1 Rollout Columns for Result Ledger Template",
    "HEU_FINANCE_DAY1_RESULT_LEDGER_TEMPLATE_20260630.md",
    "Rollout order",
    "Entry gate",
    "Advance gate",
    "FIN-USER-01",
    "FIN-USER-05",
    "PRODUCTION_FINANCE_DAY_ONE_RESULT_FIELDS",
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
  ],
  "finance Day-1 result ledger template rollout-columns log boundary",
  logPath,
);

requireAllText(
  implementationLog,
  [
    "Finance Day-1 Rollout Gates for Activation and Prelogin",
    "PRODUCTION_FINANCE_DAY_ONE_P6_04_PRELOGIN_CHECKS",
    "rolloutOrder",
    "entryGate",
    "advanceGate",
    "FIN-USER-01",
    "FIN-USER-05",
    "real-user-onboarding-panel.tsx",
    "ttgdtx-production-execution-queue.tsx",
    "HEU_FINANCE_DAY1_ACCOUNT_ACTIVATION_TEMPLATE_20260630.md",
    "HEU_FINANCE_DAY1_P6_04_PRELOGIN_MATRIX_20260630.md",
    "one lane at a time",
    "controlled result evidence",
    "P0-17 access closure",
    "does not create accounts",
    "send invites",
    "store passwords",
    "grant access",
    "execute UAT",
    "accept route evidence",
    "approve finance reliance",
    "approve access closure",
    "expand departments or users",
    "move money",
    "mark production GO",
  ],
  "finance Day-1 activation/pre-login rollout-gate log boundary",
  logPath,
);

requireText(
  implementationLog,
  /(?=[\s\S]*Finance Day-1 Sequential Real User Rollout)(?=[\s\S]*PRODUCTION_FINANCE_DAY_ONE_ACCOUNT_LANES)(?=[\s\S]*rolloutOrder)(?=[\s\S]*entryGate)(?=[\s\S]*advanceGate)(?=[\s\S]*FIN-USER-01)(?=[\s\S]*FIN-USER-05)(?=[\s\S]*one account lane at a time)(?=[\s\S]*controlled result row)(?=[\s\S]*P0-17 access closure)(?=[\s\S]*does not create accounts[\s\S]*send invites[\s\S]*store passwords[\s\S]*grant access[\s\S]*execute UAT[\s\S]*accept evidence[\s\S]*approve finance reliance[\s\S]*approve access closure[\s\S]*expand departments or users[\s\S]*move money[\s\S]*mark production GO)/i,
  "finance Day-1 sequential real-user rollout log boundary",
  logPath,
);

requireAllText(
  implementationLog,
  [
    "Finance Day-1 Sequential Access Closure Lanes",
    "PRODUCTION_FINANCE_DAY_ONE_ACCESS_CLOSURE_LANES",
    "closureDecisionValue",
    "retainCondition",
    "reduceOrRevokeCondition",
    "blockCondition",
    "nextLaneGate",
    "data-heu-finance-day-one-access-closure-lanes=\"P0-17-FIN-USER\"",
    "data-ttgdtx-finance-day-one-access-closure-lanes=\"P0-17_FIN_USER\"",
    "data-p014-finance-day-one-access-closure-lanes=\"P0-17-FIN-USER\"",
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
  ],
  "finance Day-1 sequential access closure lanes log boundary",
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
