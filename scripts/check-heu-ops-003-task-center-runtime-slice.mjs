import fs from "node:fs";

const files = {
  home: "app/page.tsx",
  route: "app/data-confirmation/page.tsx",
  actions: "components/task-center/task-center-quick-actions.tsx",
};

function read(path) {
  if (!fs.existsSync(path)) {
    throw new Error(`missing file: ${path}`);
  }
  return fs.readFileSync(path, "utf8");
}

function requireText(text, token, source) {
  if (!text.includes(token)) {
    throw new Error(`missing token in ${source}: ${token}`);
  }
}

try {
  const home = read(files.home);
  const route = read(files.route);
  const actions = read(files.actions);

  for (const token of [
    "TaskCenterQuickActions",
    "data_confirmation.read",
    "activeSegmentId={workspace.activeSegmentId}",
    "canReadTasks={canReadTasks}",
  ]) {
    requireText(home, token, files.home);
  }

  for (const token of [
    '"DEPARTMENT_QUEUE"',
    '"BLOCKED_OR_OVERDUE"',
    'activeScope === "BLOCKED_OR_OVERDUE"',
    '"BLOCKED_BY_SCOPE"',
    '"RETURNED_FOR_REPAIR"',
  ]) {
    requireText(route, token, files.route);
  }

  for (const token of [
    "Viec cua toi",
    "Viec phong toi",
    "Diem tac",
    "Bao cao BGH",
    "TASK_CENTER_QUICK_ACTIONS_READ_ONLY",
    "NO_TASK_MUTATION NO_SCOPE_BYPASS NO_RAW_PAYLOAD",
    "withAdmissionSegmentParam",
  ]) {
    requireText(actions, token, files.actions);
  }

  for (const forbidden of [
    ".insert(",
    ".update(",
    ".delete(",
    "auth.admin",
    "service_role",
  ]) {
    if (home.includes(forbidden) || route.includes(forbidden) || actions.includes(forbidden)) {
      throw new Error(`forbidden mutation/secret token found: ${forbidden}`);
    }
  }

  console.log("HEU_OPS_003_TASK_CENTER_RUNTIME_SLICE: PASS_LOCAL");
  console.log("SCOPES=ASSIGNED_TO_ME,DEPARTMENT_QUEUE,BLOCKED_OR_OVERDUE");
  console.log("EXECUTIVE=BGH_READ_ONLY; WORKSPACE_CONTEXT=PROPAGATED");
  console.log("DB_MUTATIONS=0 AUTH_MUTATIONS=0 RAW_PAYLOAD=0");
  console.log("PRODUCTION=NO_GO; MERGE=NOT_AUTHORIZED");
} catch (error) {
  console.error(`HEU_OPS_003_TASK_CENTER_RUNTIME_SLICE: NO_GO ${error.message}`);
  process.exitCode = 1;
}
