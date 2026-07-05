import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const repoRoot = process.cwd();
const envPath = path.join(repoRoot, ".env.local");
const statuses = [];
const executiveRoleCodes = ["BGH", "HIEU_TRUONG", "PHO_HIEU_TRUONG"];
const requiredEnvKeys = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
];
const allowedReadOnlyPermissions = new Set([
  "audit.read",
  "finance_desk.read",
  "heu_os.search.read",
  "leads.read_all",
  "master_control.read",
  "permission_matrix.read",
  "process_ownership.read",
  "reports.read_all",
  "scope.audit",
  "scope.enforcement.read",
  "workflow_request.read",
]);
const riskyPermissionPattern =
  /(^|\.)(approve|manage|create|update|delete|pay|lock|submit|reject|reverse|issue|cancel|assign|open|convert|verify|check)$/i;

function addStatus(code, status, detail) {
  statuses.push({ code, status, detail });
}

function read(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), "utf8");
}

function parseEnvFile(filePath) {
  if (!existsSync(filePath)) {
    return {};
  }

  const env = {};
  const contents = readFileSync(filePath, "utf8");

  for (const rawLine of contents.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (!line || line.startsWith("#")) {
      continue;
    }

    const separator = line.indexOf("=");

    if (separator === -1) {
      continue;
    }

    const key = line.slice(0, separator).trim();
    const value = line.slice(separator + 1).trim().replace(/^["']|["']$/g, "");
    env[key] = value;
    }

  return env;
}

function isMeaningfulSecret(value) {
  return (
    typeof value === "string" &&
    value.length > 20 &&
    !/your|todo|changeme|placeholder/i.test(value)
  );
}

function requireText(text, pattern, label, file) {
  const ok =
    typeof pattern === "string" ? text.includes(pattern) : pattern.test(text);

  addStatus(
    label,
    ok ? "READY" : "NO_GO",
    ok ? `${label} present in ${file}.` : `${label} missing in ${file}.`,
  );
}

function requireAllText(text, patterns, label, file) {
  const missing = patterns.filter((pattern) =>
    typeof pattern === "string" ? !text.includes(pattern) : !pattern.test(text),
  );

  addStatus(
    label,
    missing.length === 0 ? "READY" : "NO_GO",
    missing.length === 0
      ? `${label} present in ${file}.`
      : `${label} missing token count=${missing.length} in ${file}.`,
  );
}

function isRiskyExecutivePermission(permission) {
  return (
    !allowedReadOnlyPermissions.has(permission) ||
    riskyPermissionPattern.test(permission) ||
    permission.includes("read_sensitive")
  );
}

function parseTargetEmailArg() {
  const arg = process.argv.find((item) => item.startsWith("--email="));
  return arg?.slice("--email=".length).trim().toLowerCase() || null;
}

async function readTargetRole(adminClient, targetEmail) {
  if (!targetEmail) {
    return;
  }

  const { data: profile, error } = await adminClient
    .from("users_profile")
    .select("id,status,role_id,roles(code)")
    .ilike("email", targetEmail)
    .maybeSingle();

  if (error) {
    addStatus(
      "EXEC-EFFECTIVE-ACCESS-TARGET-USER",
      "NO_GO",
      "Target executive user lookup failed. Raw errors are hidden.",
    );
    return;
  }

  if (!profile) {
    addStatus(
      "EXEC-EFFECTIVE-ACCESS-TARGET-USER",
      "NO_GO",
      "Target executive user profile was not found. Email and raw ids are not printed.",
    );
    return;
  }

  const roleCode = profile.roles?.code ?? "NO_ROLE";

  addStatus(
    "EXEC-EFFECTIVE-ACCESS-TARGET-USER",
    executiveRoleCodes.includes(roleCode) ? "READY" : "NO_GO",
    `target_found=true; status=${profile.status}; role_code=${roleCode}; no_email_or_raw_id_printed=true`,
  );

  const { data: effectiveAccess, error: effectiveAccessError } = await adminClient
    .from("user_scope_effective_access")
    .select(
      "enforcement_status,access_model,lead_visibility,broad_lead_access,has_business_scope,permission_count,has_leads_read_all,has_leads_write_all,has_settings_manage,has_scope_manage_department,risk_flags",
    )
    .eq("user_id", profile.id)
    .maybeSingle();

  if (effectiveAccessError || !effectiveAccess) {
    addStatus(
      "EXEC-EFFECTIVE-ACCESS-TARGET-EFFECTIVE-VIEW",
      "NO_GO",
      "Target effective-access row is missing or unreadable. Raw errors are hidden.",
    );
    return;
  }

  addStatus(
    "EXEC-EFFECTIVE-ACCESS-TARGET-EFFECTIVE-VIEW",
    "READY",
    [
      `enforcement_status=${effectiveAccess.enforcement_status}`,
      `access_model=${effectiveAccess.access_model}`,
      `lead_visibility=${effectiveAccess.lead_visibility}`,
      `broad_lead_access=${effectiveAccess.broad_lead_access}`,
      `has_business_scope=${effectiveAccess.has_business_scope}`,
      `permission_count=${effectiveAccess.permission_count}`,
      `has_leads_read_all=${effectiveAccess.has_leads_read_all}`,
      `has_leads_write_all=${effectiveAccess.has_leads_write_all}`,
      `has_settings_manage=${effectiveAccess.has_settings_manage}`,
      `has_scope_manage_department=${effectiveAccess.has_scope_manage_department}`,
      `risk_flags=${
        Array.isArray(effectiveAccess.risk_flags)
          ? effectiveAccess.risk_flags.join(",")
          : (effectiveAccess.risk_flags ?? "none")
      }`,
    ].join("; "),
  );
}

console.log("HEU executive effective-access read-only readiness check");
console.log(
  "Secrets, emails, names, phone numbers, raw user ids, bank data, vouchers and signed evidence are never printed by this script.",
);

const executiveDashboardPath =
  "components/dashboard/executive-dashboard-overview.tsx";
const executiveReadinessPath =
  "scripts/check-heu-executive-dashboard-readiness.mjs";
const visualQaPath = "scripts/check-heu-executive-dashboard-visual-qa.mjs";
const applyScriptPath = "scripts/apply-heu-executive-readonly-soft-revoke.mjs";
const step114Path = "database/step114_organization_position_permission_matrix.sql";
const step120Path = "database/step120_executive_readonly_permission_lock.sql";
const blueprintPath = "docs/HEU_STANDARD_SYSTEM_BLUEPRINT_20260703.md";
const implementationLogPath = "docs/HEU_IMPLEMENTATION_LOG.md";
const packageJsonPath = "package.json";

const executiveDashboard = read(executiveDashboardPath);
const executiveReadiness = read(executiveReadinessPath);
const visualQa = read(visualQaPath);
const applyScript = read(applyScriptPath);
const step114 = read(step114Path);
const step120 = read(step120Path);
const blueprint = read(blueprintPath);
const implementationLog = read(implementationLogPath);
const packageJson = JSON.parse(read(packageJsonPath));

requireText(
  executiveDashboard,
  /data-heu-executive-effective-access-readonly="STD-44_EXECUTIVE_EFFECTIVE_ACCESS_READONLY_GATE"[\s\S]*data-heu-executive-effective-access-readonly-boundary="PASS_LOCAL_EXECUTIVE_EFFECTIVE_ACCESS_READONLY_GUARD READ_ONLY LIVE_EFFECTIVE_ACCESS_CHECK role_permissions user_scope_effective_access user_scope_enforcement_summary BGH HIEU_TRUONG PHO_HIEU_TRUONG EXECUTIVE_READONLY_ALLOWED_PERMISSIONS LIVE_EXECUTIVE_PERMISSION_NO_GO NO_APPROVAL_PERMISSION NO_PAYMENT_PERMISSION NO_MANAGE_PERMISSION NO_CREATE_PERMISSION NO_UPDATE_PERMISSION NO_DELETE_PERMISSION NO_SENSITIVE_READ NO_HARD_DELETE NO_ACCESS_GRANT NO_PERMISSION_EXPANSION NO_ACCOUNT_CREATE NO_ROLE_ASSIGNMENT NO_STATE_MUTATION NO_DASHBOARD_RELIANCE NO_FINANCE_RELIANCE NO_LEGAL_CONCLUSION NO_UAT_ACCEPTANCE NO_EVIDENCE_ACCEPTANCE NO_OWNER_GO NO_PRODUCTION_GO"[\s\S]*data-heu-executive-effective-access-readonly-overflow-guard="STD-44_NO_OVERFLOW"/,
  "EXEC-DASHBOARD-STD44-EFFECTIVE-ACCESS-ANCHOR",
  executiveDashboardPath,
);
requireAllText(
  executiveDashboard,
  [
    "ExecutiveEffectiveAccessReadOnlyGate",
    "executiveEffectiveAccessReadOnlyGateRows",
    "STD-44 Executive effective-access read-only gate",
    "PASS_LOCAL_EXECUTIVE_EFFECTIVE_ACCESS_READONLY_GUARD",
    "LIVE_EFFECTIVE_ACCESS_CHECK",
    "EXEC-ACCESS-01",
    "EXEC-ACCESS-06",
    "LIVE_EXECUTIVE_PERMISSION_NO_GO",
    "NO_APPROVAL_PERMISSION",
    "NO_PAYMENT_PERMISSION",
    "NO_HARD_DELETE",
    "role_permissions.status soft-revoke path",
    "user_scope_effective_access",
    "user_scope_enforcement_summary",
    "BGH",
    "HIEU_TRUONG",
    "PHO_HIEU_TRUONG",
  ],
  "EXEC-DASHBOARD-STD44-EFFECTIVE-ACCESS-TOKENS",
  executiveDashboardPath,
);
requireAllText(
  executiveReadiness,
  [
    "EXEC-DASHBOARD-STD44-EFFECTIVE-ACCESS-ANCHOR",
    "EXEC-DASHBOARD-STD44-EFFECTIVE-ACCESS-TOKENS",
    "PASS_LOCAL_EXECUTIVE_EFFECTIVE_ACCESS_READONLY_GUARD",
    "LIVE_EXECUTIVE_PERMISSION_NO_GO",
    "check:heu-executive-effective-access-readonly-readiness",
  ],
  "EXECUTIVE-READINESS-STD44",
  executiveReadinessPath,
);
requireAllText(
  visualQa,
  [
    'data-heu-executive-effective-access-readonly="STD-44_EXECUTIVE_EFFECTIVE_ACCESS_READONLY_GATE"',
    "STD-44 Executive effective-access read-only gate",
    "PASS_LOCAL_EXECUTIVE_EFFECTIVE_ACCESS_READONLY_GUARD",
  ],
  "VISUAL-QA-STD44",
  visualQaPath,
);
requireAllText(
  applyScript,
  [
    "EXECUTIVE_READONLY_SOFT_REVOKE_20260704",
    "MODE=DRY_RUN",
    "MODE=APPLY",
    "role_permissions",
    "heu_position_permission_matrix",
    "admin_role_untouched=true",
    "hard_delete=false",
    "Secrets, emails, names, raw user ids",
  ],
  "APPLY-SCRIPT-EXECUTIVE-READONLY-SOFT-REVOKE",
  applyScriptPath,
);
requireAllText(
  step114,
  [
    "where r.code = 'HIEU_TRUONG'",
    "where r.code = 'PHO_HIEU_TRUONG'",
    "coalesce(rp.status, 'ACTIVE') = 'ACTIVE'",
    "join public.role_permissions rp on rp.role_id = r.id",
  ],
  "STEP114-EXECUTIVE-READONLY-SEED-FILTER",
  step114Path,
);
requireAllText(
  step120,
  [
    "Step 120 - Executive read-only permission lock",
    "EXEC-ACCESS-REVOKE-01",
    "BGH",
    "HIEU_TRUONG",
    "PHO_HIEU_TRUONG",
    "heu_executive_readonly_allowed_permissions",
    "role_permissions",
    "heu_position_permission_matrix",
    "status = 'INACTIVE'",
    "Do not run in production from Codex/chat",
  ],
  "STEP120-EXECUTIVE-READONLY-SOFT-REVOKE-SQL",
  step120Path,
);
requireAllText(
  blueprint,
  [
    "STD-44",
    "STD-44_EXECUTIVE_EFFECTIVE_ACCESS_READONLY_GATE",
    "PASS_LOCAL_EXECUTIVE_EFFECTIVE_ACCESS_READONLY_GUARD",
    "EXEC-ACCESS-01",
    "EXEC-ACCESS-06",
    "LIVE_EXECUTIVE_PERMISSION_NO_GO",
    "NO_APPROVAL_PERMISSION",
    "NO_PAYMENT_PERMISSION",
    "NO_SENSITIVE_READ",
  ],
  "BLUEPRINT-STD44",
  blueprintPath,
);
requireAllText(
  implementationLog,
  [
    "STD-44 Executive Effective Access Read-Only Gate",
    'data-heu-executive-effective-access-readonly="STD-44_EXECUTIVE_EFFECTIVE_ACCESS_READONLY_GATE"',
    "EXEC-ACCESS-01",
    "EXEC-ACCESS-06",
    "PASS_LOCAL_EXECUTIVE_EFFECTIVE_ACCESS_READONLY_GUARD",
    "LIVE_EXECUTIVE_PERMISSION_NO_GO",
    "check:heu-executive-effective-access-readonly-readiness",
    "does not change role permissions",
    "mark production GO",
  ],
  "IMPLEMENTATION-LOG-STD44",
  implementationLogPath,
);

if (
  packageJson.scripts?.["check:heu-executive-effective-access-readonly-readiness"] !==
  "node scripts/check-heu-executive-effective-access-readonly-readiness.mjs"
) {
  addStatus(
    "PACKAGE-EXECUTIVE-EFFECTIVE-ACCESS-READONLY-SCRIPT",
    "NO_GO",
    "package.json missing check:heu-executive-effective-access-readonly-readiness script.",
  );
} else {
  addStatus(
    "PACKAGE-EXECUTIVE-EFFECTIVE-ACCESS-READONLY-SCRIPT",
    "READY",
    "Package script is wired.",
  );
}
if (
  packageJson.scripts?.["apply:heu-executive-readonly-soft-revoke"] !==
  "node scripts/apply-heu-executive-readonly-soft-revoke.mjs"
) {
  addStatus(
    "PACKAGE-EXECUTIVE-READONLY-SOFT-REVOKE-SCRIPT",
    "NO_GO",
    "package.json missing apply:heu-executive-readonly-soft-revoke script.",
  );
} else {
  addStatus(
    "PACKAGE-EXECUTIVE-READONLY-SOFT-REVOKE-SCRIPT",
    "READY",
    "Package apply script is wired.",
  );
}

const localEnv = parseEnvFile(envPath);
const missingKeys = requiredEnvKeys.filter((key) => !isMeaningfulSecret(localEnv[key]));

addStatus(
  "EXEC-EFFECTIVE-ACCESS-ENV",
  missingKeys.length === 0 ? "READY" : "NO_GO",
  missingKeys.length === 0
    ? ".env.local has required Supabase env keys. Values are hidden."
    : `.env.local missing or placeholder keys: ${missingKeys.join(", ")}.`,
);

if (missingKeys.length === 0) {
  try {
    const adminClient = createClient(
      localEnv.NEXT_PUBLIC_SUPABASE_URL,
      localEnv.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    );

    const { data: roles, error: rolesError } = await adminClient
      .from("roles")
      .select("id,code")
      .in("code", executiveRoleCodes);

    if (rolesError || !roles) {
      addStatus(
        "EXEC-EFFECTIVE-ACCESS-ROLE-READ",
        "NO_GO",
        "Executive roles could not be read. Raw errors are hidden.",
      );
    } else {
      const missingRoles = executiveRoleCodes.filter(
        (code) => !roles.some((role) => role.code === code),
      );

      addStatus(
        "EXEC-EFFECTIVE-ACCESS-ROLE-COVERAGE",
        missingRoles.length === 0 ? "READY" : "NO_GO",
        missingRoles.length === 0
          ? "BGH, HIEU_TRUONG and PHO_HIEU_TRUONG roles exist."
          : `Missing executive roles: ${missingRoles.join(",")}.`,
      );

      const riskyByRole = [];

      for (const role of roles) {
        const { data: permissions, error: permissionsError } = await adminClient
          .from("role_permissions")
          .select("permission,status")
          .eq("role_id", role.id)
          .order("permission", { ascending: true });

        if (permissionsError) {
          riskyByRole.push({
            roleCode: role.code,
            permissionCount: 0,
            riskyPermissions: ["ROLE_PERMISSION_READ_FAILED"],
          });
          continue;
        }

        const activePermissions = (permissions ?? []).filter(
          (permission) => permission.status !== "INACTIVE",
        );
        const riskyPermissions = activePermissions
          .map((permission) => permission.permission)
          .filter(isRiskyExecutivePermission);

        riskyByRole.push({
          roleCode: role.code,
          permissionCount: activePermissions.length,
          riskyPermissions,
        });
      }

      const riskyRoles = riskyByRole.filter(
        (item) => item.riskyPermissions.length > 0,
      );

      for (const item of riskyByRole) {
        addStatus(
          `EXEC-EFFECTIVE-ACCESS-${item.roleCode}`,
          item.riskyPermissions.length === 0 ? "READY" : "NO_GO",
          item.riskyPermissions.length === 0
            ? `permission_count=${item.permissionCount}; risky_permission_count=0; readonly_allowed_permissions=${Array.from(allowedReadOnlyPermissions).join(",")}`
            : [
                `permission_count=${item.permissionCount}`,
                `risky_permission_count=${item.riskyPermissions.length}`,
                `risky_permissions=${item.riskyPermissions.slice(0, 24).join(",")}`,
                item.riskyPermissions.length > 24
                  ? `remaining_risky_permissions=${item.riskyPermissions.length - 24}`
                  : "remaining_risky_permissions=0",
              ].join("; "),
        );
      }

      addStatus(
        "EXEC-EFFECTIVE-ACCESS-LIVE-READONLY-GATE",
        riskyRoles.length === 0 ? "READY" : "NO_GO",
        riskyRoles.length === 0
          ? "Executive roles have only allowed read-only cockpit permissions."
          : `LIVE_EXECUTIVE_PERMISSION_NO_GO roles=${riskyRoles
              .map((item) => item.roleCode)
              .join(",")}; reduce_or_revoke_required=true; no_auto_db_change=true`,
      );
    }

    const { data: effectiveAccessProbe, error: effectiveAccessProbeError } =
      await adminClient
        .from("user_scope_effective_access")
        .select("user_id,role_code,enforcement_status")
        .in("role_code", executiveRoleCodes)
        .limit(1);
    const { data: summaryProbe, error: summaryProbeError } = await adminClient
      .from("user_scope_enforcement_summary")
      .select("user_count,needs_fix_count,high_risk_count")
      .maybeSingle();

    addStatus(
      "EXEC-EFFECTIVE-ACCESS-VIEW-READ",
      !effectiveAccessProbeError && !summaryProbeError ? "READY" : "NO_GO",
      !effectiveAccessProbeError && !summaryProbeError
        ? `user_scope_effective_access_readable=true; executive_sample_rows=${effectiveAccessProbe?.length ?? 0}; summary_user_count=${summaryProbe?.user_count ?? "unknown"}; needs_fix_count=${summaryProbe?.needs_fix_count ?? "unknown"}; high_risk_count=${summaryProbe?.high_risk_count ?? "unknown"}`
        : "Effective-access or enforcement summary views are unreadable. Raw errors are hidden.",
    );

    await readTargetRole(adminClient, parseTargetEmailArg());
  } catch {
    addStatus(
      "EXEC-EFFECTIVE-ACCESS-LIVE-CHECK",
      "NO_GO",
      "Live executive effective-access check could not complete. Raw errors are hidden.",
    );
  }
}

addStatus(
  "EXEC-EFFECTIVE-ACCESS-NO-AUTO-ACTION",
  "READY",
  "This checker is read-only; it does not change role permissions, create accounts, assign roles, grant access, accept UAT/evidence, approve finance action, approve owner GO/NO-GO or mark production GO.",
);

for (const item of statuses) {
  console.log(`${item.status} ${item.code}: ${item.detail}`);
}

if (statuses.some((item) => item.status !== "READY")) {
  process.exitCode = 1;
}
