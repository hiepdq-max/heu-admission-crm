import { execFileSync } from "node:child_process";

function runGit(args) {
  try {
    return execFileSync("git", args, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return "UNAVAILABLE";
  }
}

const generatedAt = new Date().toISOString();
const status = runGit(["status", "--short", "--branch"]);
const head = runGit(["rev-parse", "--short", "HEAD"]);
const recentCommits = runGit(["log", "-3", "--oneline"])
  .split(/\r?\n/)
  .filter(Boolean);

const trialUsers = [
  {
    label: "KHTC_ACCOUNTING_OPERATOR_LABEL",
    use: "Xem Finance Desk read-only, doi chieu so tong hop, ghi blocker neu sai.",
  },
  {
    label: "BGH_READONLY_REVIEWER_LABEL",
    use: "Xem Master Control, blocker, tien do PASS_LOCAL va viec can ky/xac nhan.",
  },
  {
    label: "AUDIT_READONLY_REVIEWER_LABEL",
    use: "Kiem tra audit trail, evidence reference va stop condition.",
  },
  {
    label: "PHAP_CHE_REVIEWER_LABEL",
    use: "Kiem tra phap che/chinh sach/SOP lien quan truoc UAT hoac GO/NO-GO.",
  },
];

const taskLanes = [
  {
    owner: "IT_DATA",
    task: "Chay PASS_LOCAL gate, doc loi FAIL, sua tung lat nho va bao lai.",
  },
  {
    owner: "KHTC",
    task: "Dung thu Finance Desk read-only theo account label da duyet; khong nhap mat khau hay du lieu ngan hang tho.",
  },
  {
    owner: "BGH",
    task: "Doc bao cao de hieu, xem blocker va chi ket luan khi co signed evidence ngoai Git/Codex/chat.",
  },
  {
    owner: "Audit + Phap Che",
    task: "Xac nhan evidence reference, redaction, UAT/signoff route va noi dung can dung tham quyen.",
  },
];

const glossary = [
  ["PASS_LOCAL", "Da kiem tra noi bo bang audit/lint/build; chua phai phe duyet chay that."],
  ["Audit", "Kiem tra tu dong cac hang rao an toan va tai lieu bat buoc."],
  ["Lint", "Kiem tra quy tac code de tranh loi co ban."],
  ["Build", "Dong goi app de chac khong vo khi trien khai thu."],
  ["Evidence", "Bang chung co kiem soat; raw data, mat khau, OTP va bank data khong dua vao Git/Codex/chat."],
  ["UAT", "Nguoi dung/bo phan dung thu va ky xac nhan theo dung tham quyen."],
  ["NO-GO", "Chua du dieu kien production hoac chay that."],
];

console.log("# HEU daily PASS_LOCAL report draft");
console.log("");
console.log(`Generated at: ${generatedAt}`);
console.log("Mode: DRY_RUN only - no email sent, no real task created.");
console.log("Production: NO-GO");
console.log("");
console.log("## 1. Tinh trang hom nay");
console.log("");
console.log(`- Git: ${status || "clean/unknown"}`);
console.log(`- HEAD: ${head}`);
console.log("- Ket luan: chi la ban nhap bao cao PASS_LOCAL; khong approve UAT, finance, owner GO hay production GO.");
console.log("");
console.log("## 2. Commit moi nhat");
console.log("");
for (const commit of recentCommits) {
  console.log(`- ${commit}`);
}
console.log("");
console.log("## 3. Nguoi dung thu va cach su dung");
console.log("");
for (const user of trialUsers) {
  console.log(`- ${user.label}: ${user.use}`);
}
console.log("");
console.log("## 4. Viec can giao");
console.log("");
for (const lane of taskLanes) {
  console.log(`- ${lane.owner}: ${lane.task}`);
}
console.log("");
console.log("## 5. Chu thich tu IT");
console.log("");
for (const [term, meaning] of glossary) {
  console.log(`- ${term}: ${meaning}`);
}
console.log("");
console.log("## 6. Blocker can dung tham quyen xac nhan");
console.log("");
console.log("- Signed multi-account UAT van can nguoi dung/bo phan ky xac nhan ngoai Git/Codex/chat.");
console.log("- Evidence that, backup/restore proof, migration order va owner GO/NO-GO van chua duoc local script phe duyet.");
console.log("- Khong dua passwords, OTPs, invite/reset links, service-role keys, bank credentials, raw PII, bank statements, vouchers hoac raw payment data vao bao cao/email.");
