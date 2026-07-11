import { access, readFile } from "node:fs/promises";

const files = {
  page: "app/page.tsx",
  component: "components/dashboard/role-based-home.tsx",
  metadata: "lib/role-based-home-mock.ts",
};

const sources = Object.fromEntries(
  await Promise.all(
    Object.entries(files).map(async ([key, path]) => [key, await readFile(path, "utf8")]),
  ),
);

const requiredTokens = [
  [sources.page, "getMockHomeProfile"],
  [sources.component, 'data-heu-role-home="HEU-UX-001"'],
  [sources.component, 'data-heu-data-source="MOCK_METADATA_ONLY"'],
  [sources.component, 'data-heu-master-control="READ_ONLY"'],
  [sources.component, "profile.isControlRole ?"],
  [sources.metadata, "Việc của tôi"],
  [sources.metadata, "Dữ liệu chờ xác nhận"],
  [sources.metadata, "Báo cáo phòng"],
  [sources.metadata, 'key: "admission"'],
  [sources.metadata, 'key: "cthssv"'],
  [sources.metadata, 'key: "training"'],
  [sources.metadata, 'key: "bgh"'],
  [sources.metadata, 'key: "admin"'],
];

for (const [source, token] of requiredTokens) {
  if (!source.includes(token)) {
    throw new Error(`HEU-UX-001 missing required token: ${token}`);
  }
}

const runtimeSources = Object.values(sources).join("\n");
for (const forbiddenToken of ["createClient", "@/lib/supabase", ".rpc(", ".from("]) {
  if (runtimeSources.includes(forbiddenToken)) {
    throw new Error(`HEU-UX-001 must remain mock-only: ${forbiddenToken}`);
  }
}

await Promise.all([
  access("docs/evidence/HEU-UX-001/role-home-bgh-desktop.png"),
  access("docs/evidence/HEU-UX-001/role-home-admission-mobile.png"),
]);

console.log("ROLE_BASED_HOME_UX_READY: PASS_LOCAL_UI");
console.log("DATA_SOURCE: MOCK_METADATA_ONLY");
console.log("MASTER_CONTROL: ADMIN_BGH_READ_ONLY");
console.log("DEPARTMENT_HOME: MY_TASKS_CONFIRMATIONS_REPORTS_ONLY");
console.log("PRODUCTION: NO_GO");
