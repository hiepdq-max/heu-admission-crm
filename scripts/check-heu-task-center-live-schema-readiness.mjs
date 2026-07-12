import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const envPath = path.resolve(
  process.cwd(),
  process.env.HEU_ENV_FILE || ".env.local",
);

function parseEnv(filePath) {
  if (!existsSync(filePath)) return {};
  const env = {};
  for (const rawLine of readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const separator = line.indexOf("=");
    if (separator < 1) continue;
    env[line.slice(0, separator)] = line
      .slice(separator + 1)
      .trim()
      .replace(/^['"]|['"]$/g, "");
  }
  return env;
}

const env = parseEnv(envPath);
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("NO_GO DCTC-LIVE-SCHEMA-ENV: required server env is unavailable.");
  process.exitCode = 1;
} else {
  const response = await fetch(`${supabaseUrl}/rest/v1/`, {
    headers: {
      Accept: "application/openapi+json",
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
    },
  });

  if (!response.ok) {
    console.error("NO_GO DCTC-LIVE-SCHEMA-METADATA: OpenAPI metadata read failed.");
    process.exitCode = 1;
  } else {
    const specification = await response.json();
    const availablePaths = new Set(Object.keys(specification.paths ?? {}));
    const requiredPaths = [
      "/heu_data_confirmation_tasks",
      "/heu_data_confirmation_task_center",
      "/heu_data_confirmation_task_status_timeline",
      "/rpc/route_data_confirmation_task",
      "/rpc/confirm_data_confirmation_task",
    ];
    const states = requiredPaths.map((objectPath) => ({
      objectPath,
      present: availablePaths.has(objectPath),
    }));
    const missingCount = states.filter((state) => !state.present).length;

    console.log("HEU Task Center live schema readiness (METADATA_ONLY)");
    states.forEach((state) =>
      console.log(
        `${state.present ? "READY" : "NO_GO"} ${state.objectPath}: ${
          state.present ? "PRESENT" : "MISSING"
        }`,
      ),
    );
    console.log(
      `objects_present=${states.length - missingCount}; objects_required=${states.length}; row_read=0; rpc_call=0; mutation=0`,
    );
    console.log(
      missingCount === 0
        ? "READY DCTC-LIVE-SCHEMA: read-only adapter preflight may continue."
        : "NO_GO DCTC-LIVE-SCHEMA: step121 is not live; do not enable the adapter.",
    );

    if (missingCount > 0) process.exitCode = 1;
  }
}
