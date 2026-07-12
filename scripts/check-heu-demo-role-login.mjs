import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const files = {
  directory: path.join(root, "lib", "demo-role-directory.ts"),
  page: path.join(root, "app", "demo", "page.tsx"),
  login: path.join(root, "app", "login", "page.tsx"),
};

for (const [name, file] of Object.entries(files)) {
  if (!fs.existsSync(file)) {
    throw new Error(`HEU-DEMO-ROLE-LOGIN: missing ${name}: ${file}`);
  }
}

const directory = fs.readFileSync(files.directory, "utf8");
const page = fs.readFileSync(files.page, "utf8");
const login = fs.readFileSync(files.login, "utf8");

const requiredKeys = [
  "hieu-truong",
  "ke-toan-truong",
  "ke-toan-thu-chi",
  "ke-toan-ngan-hang-quy",
  "truong-tchc",
  "truong-tuyen-sinh",
  "ctv-tuyen-sinh",
];

for (const key of requiredKeys) {
  if (!directory.includes(`key: "${key}"`)) {
    throw new Error(`HEU-DEMO-ROLE-LOGIN: missing role ${key}`);
  }
}

for (const token of [
  'getRuntimeEnv("HEU_DEPLOYMENT_MODE") === "pilot"',
  'getRuntimeEnv("HEU_ENABLE_DEMO_ROLE_LOGIN") === "true"',
]) {
  if (!directory.includes(token)) {
    throw new Error(`HEU-DEMO-ROLE-LOGIN: missing fail-closed token ${token}`);
  }
}

for (const token of ['data-heu-demo-mode="READ_ONLY"', "notFound()", "SYNTHETIC_METADATA_ONLY"]) {
  if (!page.includes(token)) {
    throw new Error(`HEU-DEMO-ROLE-LOGIN: missing safety token ${token}`);
  }
}

for (const token of ['dynamic = "force-dynamic"', "revalidate = 0"]) {
  if (!page.includes(token)) {
    throw new Error(`HEU-DEMO-ROLE-LOGIN: missing runtime cache guard ${token}`);
  }
}

if (!login.includes("isHeuDemoRoleLoginEnabled")) {
  throw new Error("HEU-DEMO-ROLE-LOGIN: login link is not flag-gated");
}

const forbidden = /from ["']@\/lib\/supabase|createClient|supabase\.|signInWithPassword|signOut|password|\.insert\(|\.update\(|\.delete\(|\.rpc\(|fetch\(/i;
for (const [name, source] of Object.entries({ directory, page })) {
  if (forbidden.test(source)) {
    throw new Error(`HEU-DEMO-ROLE-LOGIN: forbidden runtime token in ${name}`);
  }
}

console.log("HEU-DEMO-ROLE-LOGIN: PASS_LOCAL");
console.log("roles=7; auth=NOT_USED; database=NOT_USED; mutation=NOT_USED");
