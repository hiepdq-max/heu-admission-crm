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
const actionsPath = "app/settings/actions.ts";
const settingsPagePath = "app/settings/page.tsx";
const packagePath = "package.json";
const agentsPath = "AGENTS.md";
const releaseGatePath = "scripts/audit-ttgdtx-release-gates.mjs";
const logPath = "docs/HEU_IMPLEMENTATION_LOG.md";

for (const file of [
  formPath,
  actionsPath,
  settingsPagePath,
  packagePath,
  agentsPath,
  releaseGatePath,
  logPath,
]) {
  requireFile(file);
}

const form = read(formPath);
const actions = read(actionsPath);
const settingsPage = read(settingsPagePath);
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

if (failures.length > 0) {
  console.error("HEU user-account security audit failed.");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(
  "HEU user-account security audit passed. Temporary password handling is guarded.",
);
