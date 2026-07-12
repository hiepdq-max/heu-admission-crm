import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const phase = process.env.HEU_TASK_CENTER_PREFLIGHT_PHASE ?? "pre";
const sourceEnvPath = path.resolve(
  process.cwd(),
  process.env.HEU_TASK_CENTER_SOURCE_ENV_FILE || ".env.local",
);
const restoreEnvPath = process.env.HEU_TASK_CENTER_RESTORE_ENV_FILE
  ? path.resolve(process.cwd(), process.env.HEU_TASK_CENTER_RESTORE_ENV_FILE)
  : null;
const backupId = process.env.HEU_TASK_CENTER_BACKUP_ID;
const backupCompletedAt = process.env.HEU_TASK_CENTER_BACKUP_COMPLETED_AT;
const restoreSmokeProof = process.env.HEU_TASK_CENTER_RESTORE_SMOKE_PROOF;
const operatorId = process.env.HEU_TASK_CENTER_OPERATOR_ID;
const checkerId = process.env.HEU_TASK_CENTER_CHECKER_ID;

const dependencyPaths = [
  "/users_profile",
  "/admission_departments",
  "/admission_segments",
  "/permission_registry",
  "/data_dictionary_tables",
  "/rpc/is_admin",
  "/rpc/is_executive_role",
  "/rpc/has_permission",
  "/rpc/current_user_role_code",
  "/rpc/can_manage_permission_matrix",
  "/rpc/can_use_admission_workspace",
];
const taskCenterPaths = [
  "/heu_data_confirmation_tasks",
  "/heu_data_confirmation_task_center",
  "/heu_data_confirmation_task_status_timeline",
  "/rpc/route_data_confirmation_task",
  "/rpc/confirm_data_confirmation_task",
];

function parseEnv(filePath) {
  if (!filePath || !existsSync(filePath)) return {};
  return Object.fromEntries(
    readFileSync(filePath, "utf8")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#") && line.includes("="))
      .map((line) => {
        const separator = line.indexOf("=");
        return [
          line.slice(0, separator).trim(),
          line.slice(separator + 1).trim().replace(/^["']|["']$/g, ""),
        ];
      }),
  );
}

function projectRef(url) {
  try {
    const hostname = new URL(url).hostname;
    return hostname.endsWith(".supabase.co")
      ? hostname.slice(0, -".supabase.co".length)
      : null;
  } catch {
    return null;
  }
}

function fail(code) {
  console.error(`NO_GO STEP121-RESTORE-PREFLIGHT-${code}`);
  process.exitCode = 1;
}

if (!new Set(["pre", "post"]).has(phase)) {
  fail("PHASE");
} else if (!restoreEnvPath || sourceEnvPath === restoreEnvPath) {
  fail("ENV-PATHS");
} else if (
  !backupId?.startsWith("HEU-TC-BACKUP-") ||
  !backupCompletedAt ||
  Number.isNaN(Date.parse(backupCompletedAt)) ||
  !restoreSmokeProof?.startsWith("HEU-TC-RESTORE-") ||
  !operatorId ||
  !checkerId ||
  operatorId === checkerId ||
  operatorId.includes("@") ||
  checkerId.includes("@")
) {
  fail("EVIDENCE-GATE");
} else {
  const sourceEnv = parseEnv(sourceEnvPath);
  const restoreEnv = parseEnv(restoreEnvPath);
  const sourceRef = projectRef(sourceEnv.NEXT_PUBLIC_SUPABASE_URL);
  const restoreRef = projectRef(restoreEnv.NEXT_PUBLIC_SUPABASE_URL);
  const restoreKey = restoreEnv.SUPABASE_SERVICE_ROLE_KEY;

  if (!sourceRef || !restoreRef || !restoreKey) {
    fail("ENV");
  } else if (sourceRef === restoreRef) {
    fail("SOURCE-EQUALS-RESTORE");
  } else {
    const response = await fetch(
      `${restoreEnv.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/`,
      {
        headers: {
          Accept: "application/openapi+json",
          apikey: restoreKey,
          Authorization: `Bearer ${restoreKey}`,
        },
      },
    );
    if (!response.ok) {
      fail("METADATA");
    } else {
      const specification = await response.json();
      const availablePaths = new Set(Object.keys(specification.paths ?? {}));
      const missingDependencies = dependencyPaths.filter(
        (objectPath) => !availablePaths.has(objectPath),
      );
      const taskCenterPresent = taskCenterPaths.filter((objectPath) =>
        availablePaths.has(objectPath),
      ).length;
      const expectedTaskCenterCount = phase === "pre" ? 0 : taskCenterPaths.length;

      console.log("HEU Task Center step121 isolated restore preflight");
      console.log(
        `phase=${phase}; source_restore_distinct=true; dependencies_present=${dependencyPaths.length - missingDependencies.length}/${dependencyPaths.length}; task_center_objects=${taskCenterPresent}/${taskCenterPaths.length}; row_read=0; rpc_call=0; mutation=0`,
      );

      if (missingDependencies.length > 0) {
        fail(`DEPENDENCIES-${missingDependencies.length}`);
      } else if (taskCenterPresent !== expectedTaskCenterCount) {
        fail("SCHEMA-PHASE-MISMATCH");
      } else {
        console.log(
          phase === "pre"
            ? "READY STEP121-DRY-RUN-PREFLIGHT: isolated target is clean; migration still requires explicit approval."
            : "PASS STEP121-POSTFLIGHT-METADATA: 5/5 objects present; UAT and owner gates remain required.",
        );
        console.log("production=NO_GO; migration_executed=0");
      }
    }
  }
}
