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

const masterGoal = {
  source: "docs/HEU_MASTER_CONTROL_GOAL_REGISTER_20260702.md",
  status: "MASTER_GOAL_READY / NO_GO / BLOCKED",
  machineOff:
    "GitHub Actions co the chay PASS_LOCAL, audit, lint, build va report summary; khong tu code, tu deploy, tu approve.",
  phaseOrder:
    "A Clean/package dirty scope -> B User / Role / Permission / Scope -> C Finance Day-1 controlled accounting trial -> D Signed UAT / evidence / signoff routing -> E Remaining blockers.",
  expertLanes:
    "Build Agent, QA/Audit Agent, Data Check Agent, Finance Trial Support, UAT/Evidence Coordinator, Report/Email Coordinator, Human Authority Owner.",
  boundary:
    "Khong production GO, khong email/nhiem vu/user that, khong UAT/evidence/finance/owner approval tu bao cao nay.",
};

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

const financeDayOneTrialStatus = [
  {
    label: "REAL_KHTC_TTGDTX_OPERATOR_01",
    userUse:
      "Mo /finance-desk de xem tong hop cong no, import readiness, source-control va dashboard P2-18 o che do read-only.",
    expectedStatus:
      "FIN_DAY1_PREFLIGHT_READY / NO_GO / BLOCKED and FIN_DAY1_RESULT_READY / NO_GO / BLOCKED.",
    externalProof:
      "Day-1 result ledger, controlled evidence IDs and ACCESS_RETAIN / REVOKE_OR_REDUCE / BLOCKED recorded outside Git/Codex/chat.",
    stop:
      "Stop neu thay nut ghi so, duyet chi, chuyen tien, bank instruction, raw bank data, password, OTP, invite/reset link hoac out-of-scope totals.",
  },
  {
    label: "REAL_BGH_READONLY_01",
    userUse:
      "Doc bao cao tien do, Finance Desk blocker va owner decision route; khong sua so lieu.",
    expectedStatus:
      "P5_03_CONTROLLED_TRIAL_READY / NO_GO / BLOCKED stays pending until signed evidence exists.",
    externalProof:
      "Owner review note and final GO/NO-GO route stay outside Git/Codex/chat.",
    stop:
      "Stop neu PASS_LOCAL bi hieu la owner approval, UAT acceptance, finance reliance hoac production GO.",
  },
  {
    label: "REAL_AUDIT_READONLY_01",
    userUse:
      "Kiem tra redaction, evidence reference, audit trail va negative-control denial.",
    expectedStatus:
      "P0-10 evidence redaction and P6-03 audit-log routes remain PENDING until signed.",
    externalProof:
      "Controlled evidence reference, redaction reviewer and audit trace proof outside Git/Codex/chat.",
    stop:
      "Stop neu raw evidence, voucher, PII, bank statement, payment data hoac secret xuat hien trong report/email/log.",
  },
  {
    label: "REAL_OUT_OF_SCOPE_NEGATIVE_01",
    userUse:
      "Dung de xac nhan tai khoan ngoai pham vi chi thay BLOCKED hoac EMPTY_SCOPED_STATE.",
    expectedStatus:
      "P6_04_PRELOGIN_READY / NO_GO / BLOCKED and access closure stay required before expansion.",
    externalProof:
      "Negative-control screenshot/reference is redacted and stored outside Git/Codex/chat.",
    stop:
      "Stop neu tai khoan ngoai pham vi thay Finance Desk totals, source evidence, audit rows, settings or protected TTGDTX data.",
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

const productionBlockerLanes = [
  {
    code: "P0-03",
    owner: "IT_DATA + Audit",
    blocker: "Backup and restore dry-run",
    next: "Can backup ID, restore target, smoke-check va owner evidence ngoai Git/Codex/chat.",
  },
  {
    code: "Step90-Step110",
    owner: "IT_DATA + KHTC + PHAP_CHE",
    blocker: "Migration order approval",
    next: "Chi ky lenh migration sau khi P0-03 evidence duoc chap nhan dung tham quyen.",
  },
  {
    code: "P0-19",
    owner: "PHAP_CHE + KHTC + BGH",
    blocker: "Legal and finance gate UAT",
    next: "Can legal basis, tuition policy, finance gate va signed legal/finance UAT.",
  },
  {
    code: "P2-17",
    owner: "KHTC + BGH + Audit",
    blocker: "Partner payout duplicate and dossier UAT",
    next: "Can duplicate-click, overpay, voucher, RPC-only va dossier evidence signed.",
  },
  {
    code: "P2-18",
    owner: "KHTC + BGH + IT_DATA",
    blocker: "Accounting dashboard read-only and source reconciliation",
    next: "Can source comparison, role-scope denial va no-write dashboard UAT evidence.",
  },
  {
    code: "P6-04",
    owner: "IT_DATA + TRUONG_PHONG + Audit",
    blocker: "Role and workspace scope UAT",
    next: "Can ADMIN, BGH, KHTC, PHAP_CHE, AUDIT va out-of-scope browser UAT evidence.",
  },
  {
    code: "P6-03",
    owner: "Audit + IT_DATA + KHTC",
    blocker: "Audit log traceability",
    next: "Can trace rows cho create, update, check, approve, pay va source-control events.",
  },
  {
    code: "P6-06",
    owner: "IT_DATA + Audit + business owners",
    blocker: "Hard-delete and cascade risk",
    next: "Can conversion evidence hoac written waiver cho unresolved cascade paths.",
  },
  {
    code: "P0-10",
    owner: "IT_DATA + Audit",
    blocker: "Controlled evidence redaction",
    next: "Can controlled evidence location va redacted references; raw evidence stays outside Git/Codex/chat.",
  },
  {
    code: "P0-09",
    owner: "BGH + IT_DATA + KHTC + PHAP_CHE + AUDIT + TRUONG_PHONG",
    blocker: "Final owner GO/NO-GO decision",
    next: "Can final signed multi-owner GO/NO-GO note outside Codex/chat.",
  },
];

const signedUatRouteSummary = [
  {
    route: "UAT-ROUTE-01",
    code: "P0-10",
    owner: "IT_DATA + Audit",
    status: "PENDING",
    proof: "Controlled storage location, redaction class, reviewer and evidence ID.",
  },
  {
    route: "UAT-ROUTE-02",
    code: "P0-03",
    owner: "IT_DATA + Audit",
    status: "PENDING",
    proof: "Backup ID, restore target, preflight/postflight output and restore smoke-check evidence.",
  },
  {
    route: "UAT-ROUTE-03",
    code: "Step90-Step110",
    owner: "IT_DATA + KHTC + PHAP_CHE",
    status: "PENDING",
    proof: "Signed migration order after accepted backup/restore evidence and rollback point.",
  },
  {
    route: "UAT-ROUTE-04",
    code: "P6-04",
    owner: "IT_DATA + TRUONG_PHONG + Audit",
    status: "PENDING",
    proof: "Synthetic account route matrix, allowed cases and blocked negative cases.",
  },
  {
    route: "UAT-ROUTE-05",
    code: "P0-19",
    owner: "PHAP_CHE + KHTC + BGH",
    status: "PENDING",
    proof: "Legal basis, tuition policy, waiver/exception decision and ALLOW_FINANCE gate proof.",
  },
  {
    route: "UAT-ROUTE-06",
    code: "P3-01/P3-02",
    owner: "TUYEN_SINH + CTHSSV + DAO_TAO + KHTC",
    status: "PENDING",
    proof: "Handover cannot create finance facts or bypass P0-19/P2-05/P2-03 finance gates.",
  },
  {
    route: "UAT-ROUTE-07",
    code: "P2-17",
    owner: "KHTC + BGH + Audit",
    status: "PENDING",
    proof: "Duplicate-click, overpay, voucher normalization, RPC-only and BBNT/partner-invoice dossier evidence.",
  },
  {
    route: "UAT-ROUTE-08",
    code: "P2-18/P5-03",
    owner: "KHTC + BGH + IT_DATA",
    status: "PENDING",
    proof: "Dashboard read-only behavior, source reconciliation, role denial, Finance Day-1 start-gate and result ledger.",
  },
  {
    route: "UAT-ROUTE-09",
    code: "P6-03",
    owner: "Audit + IT_DATA + KHTC",
    status: "PENDING",
    proof: "Trace rows with actor, entity, timestamp and controlled evidence reference.",
  },
  {
    route: "UAT-ROUTE-10",
    code: "P6-06",
    owner: "IT_DATA + Audit + business owners",
    status: "PENDING",
    proof: "Conversion proof or written waiver for unresolved protected paths.",
  },
  {
    route: "UAT-ROUTE-11",
    code: "P0-09",
    owner: "BGH + IT_DATA + KHTC + PHAP_CHE + AUDIT + TRUONG_PHONG",
    status: "PENDING",
    proof: "Final owner decision manifest with signed UAT, evidence binder, migration, backup, role and risk-closure references.",
  },
];

const departmentTaskRegister = [
  {
    department: "BGH",
    userLabel: "BGH_READONLY_REVIEWER_LABEL",
    stage: "Daily review",
    task: "Review Master Control blockers and plain-language report; do not treat PASS_LOCAL as approval.",
  },
  {
    department: "IT_DATA",
    userLabel: "IT_DATA_BUILD_OPERATOR_LABEL",
    stage: "Every build slice",
    task: "Run git status, focused audit, baseline audit/lint/build and package one clean slice.",
  },
  {
    department: "KHTC",
    userLabel: "KHTC_ACCOUNTING_OPERATOR_LABEL",
    stage: "Finance Day-1 trial",
    task: "Use Finance Desk read-only, compare summary views and write blocker/result outside raw-data channels.",
  },
  {
    department: "PHAP_CHE",
    userLabel: "PHAP_CHE_REVIEWER_LABEL",
    stage: "Legal/finance gate",
    task: "Review legal/SOP/evidence blockers and sign only through the approved external process.",
  },
  {
    department: "Audit",
    userLabel: "AUDIT_READONLY_REVIEWER_LABEL",
    stage: "Evidence/UAT route",
    task: "Check redaction, evidence reference and audit trace; reject raw evidence in Git/Codex/chat.",
  },
  {
    department: "TUYEN_SINH",
    userLabel: "TUYEN_SINH_OPERATOR_LABEL",
    stage: "Lead lifecycle UAT",
    task: "Run P3-01/P3-02 checklist when scheduled and confirm no finance bypass.",
  },
  {
    department: "CTHSSV",
    userLabel: "CTHSSV_HANDOVER_OPERATOR_LABEL",
    stage: "Student handover UAT",
    task: "Review handover packet readiness with redacted evidence references only.",
  },
  {
    department: "DAO_TAO + HR",
    userLabel: "DAO_TAO_REVIEWER_LABEL / HR_REVIEWER_LABEL",
    stage: "Class/payment policy readiness",
    task: "Review Short Course, attendance and allowance/payment blockers before any owner signoff.",
  },
];

const authorityInformationRequests = [
  {
    code: "INFO-REQ-01",
    owner: "BGH",
    request:
      "Xac nhan nhom nhan bao cao hang ngay va muc doc bao cao theo phong ban.",
    output:
      "Chi duoc ghi label/alias da duyet; khong ghi dia chi email ca nhan vao Git/Codex/chat.",
  },
  {
    code: "INFO-REQ-02",
    owner: "IT_DATA",
    request:
      "Xac nhan GitHub Actions variables/secrets da cau hinh hay van EMAIL_CONFIG_REQUIRED.",
    output:
      "Chi ghi ten bien va trang thai; khong ghi SMTP value, password, token hoac secret.",
  },
  {
    code: "INFO-REQ-03",
    owner: "KHTC",
    request:
      "Xac nhan user label ke toan duoc dung thu Finance Desk read-only va pham vi Day-1.",
    output:
      "Chi ghi user label/role/scope; khong ghi tai khoan that, mat khau, OTP hay du lieu ngan hang.",
  },
  {
    code: "INFO-REQ-04",
    owner: "PHAP_CHE",
    request:
      "Xac nhan cau hoi phap ly/SOP nao con thieu nguoi dung tham quyen ket luan.",
    output:
      "Chi ghi blocker va owner can ky; AI/Codex khong ket luan phap ly.",
  },
  {
    code: "INFO-REQ-05",
    owner: "Audit",
    request:
      "Xac nhan evidence reference, lop redaction va nguoi review bang chung.",
    output:
      "Chi ghi ma bang chung da kiem soat; khong dua raw evidence, voucher, PII hay bank statement vao bao cao.",
  },
  {
    code: "INFO-REQ-06",
    owner: "TRUONG_PHONG + process owners",
    request:
      "Xac nhan route/user-label nao duoc thu, route nao out-of-scope va ai ky ket qua.",
    output:
      "Chi ghi label, route va stop condition; khong tao user that hay phe duyet UAT tu bao cao.",
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
console.log("## 2. Muc tieu tong chi huy");
console.log("");
console.log(`- Status: ${masterGoal.status}`);
console.log(`- Source: ${masterGoal.source}`);
console.log(`- Khi may tinh tat: ${masterGoal.machineOff}`);
console.log(`- Thu tu giai doan: ${masterGoal.phaseOrder}`);
console.log(`- Doi phu trach: ${masterGoal.expertLanes}`);
console.log(`- Ranh gioi: ${masterGoal.boundary}`);
console.log("");
console.log("## 3. Commit moi nhat");
console.log("");
for (const commit of recentCommits) {
  console.log(`- ${commit}`);
}
console.log("");
console.log("## 4. Nguoi dung thu va cach su dung");
console.log("");
for (const user of trialUsers) {
  console.log(`- ${user.label}: ${user.use}`);
}
console.log("");
console.log("## 4A. Finance Day-1 controlled trial plain-language status");
console.log("");
console.log("Status: FIN_DAY1_REPORT_READY / NO_GO / BLOCKED");
console.log("Mode: DRY_RUN only - no email sent, no real task created, no account assigned, no evidence accepted.");
console.log("");
for (const item of financeDayOneTrialStatus) {
  console.log(`- ${item.label}: ${item.userUse}`);
  console.log(`  Expected status: ${item.expectedStatus}`);
  console.log(`  External proof: ${item.externalProof}`);
  console.log(`  Stop: ${item.stop}`);
}
console.log("");
console.log("## 5. Viec can giao");
console.log("");
for (const lane of taskLanes) {
  console.log(`- ${lane.owner}: ${lane.task}`);
}
console.log("");
console.log("## 6. Chu thich tu IT");
console.log("");
for (const [term, meaning] of glossary) {
  console.log(`- ${term}: ${meaning}`);
}
console.log("");
console.log("## 7. Viec theo tung phong/user label");
console.log("");
console.log("Status: DEPT_TASK_REGISTER_READY / NO_GO / BLOCKED");
console.log("Mode: DRY_RUN only - no email sent, no real task created, no account assigned.");
console.log("");
for (const lane of departmentTaskRegister) {
  console.log(`- ${lane.department} (${lane.userLabel}) - ${lane.stage}: ${lane.task}`);
}
console.log("");
console.log("## 8. Thong tin can nguoi dung tham quyen xac nhan");
console.log("");
console.log("Status: INFO_REQUIRED_BY_AUTHORITY / NO_GO / BLOCKED");
console.log("Mode: DRY_RUN only - no email sent, no real task created, no user/account/secret collected.");
console.log("");
for (const item of authorityInformationRequests) {
  console.log(`- ${item.code} - ${item.owner}: ${item.request} Ket qua an toan: ${item.output}`);
}
console.log("");
console.log("## 9. Blocker theo phong/owner");
console.log("");
console.log("Status: BLOCKER_OWNER_LANES_READY / NO_GO / BLOCKED");
console.log("Source: lib/production-readiness.ts -> PRODUCTION_BLOCKERS");
console.log("Mode: DRY_RUN only - no email sent, no real task created, no evidence accepted.");
console.log("");
for (const lane of productionBlockerLanes) {
  console.log(`- ${lane.code} - ${lane.owner}: ${lane.blocker}. Viec can xac nhan: ${lane.next}`);
}
console.log("");
console.log("## 10. Signed UAT route summary");
console.log("");
console.log("Status: SIGNED_UAT_ROUTE_SUMMARY_READY / NO_GO / BLOCKED");
console.log("Source: docs/TTGDTX_UAT_EXECUTION_LOG_20260625.md Section 5.2 and docs/TTGDTX_SIGNED_UAT_EXECUTION_ROUTING_HUB_20260628.md");
console.log("Mode: DRY_RUN only - no email sent, no real task created, no evidence accepted, no UAT approved.");
console.log("");
for (const route of signedUatRouteSummary) {
  console.log(`- ${route.route} ${route.code} - ${route.owner}: ${route.status}. Can co: ${route.proof}`);
}
console.log("");
console.log("## 11. Blocker can dung tham quyen xac nhan");
console.log("");
console.log("- Signed multi-account UAT van can nguoi dung/bo phan ky xac nhan ngoai Git/Codex/chat.");
console.log("- Evidence that, backup/restore proof, migration order va owner GO/NO-GO van chua duoc local script phe duyet.");
console.log("- Khong dua passwords, OTPs, invite/reset links, service-role keys, bank credentials, raw PII, bank statements, vouchers hoac raw payment data vao bao cao/email.");
