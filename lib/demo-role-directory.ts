export type HeuDemoRoleKey =
  | "hieu-truong"
  | "ke-toan-truong"
  | "ke-toan-thu-chi"
  | "ke-toan-ngan-hang-quy"
  | "truong-tchc"
  | "truong-tuyen-sinh"
  | "ctv-tuyen-sinh";

export type HeuDemoRole = {
  key: HeuDemoRoleKey;
  title: string;
  department: string;
  scope: string;
  roleCode: string;
  lanes: [string, string, string];
};

const demoRoles: readonly HeuDemoRole[] = [
  {
    key: "hieu-truong",
    title: "Hiệu trưởng",
    department: "BGH",
    scope: "Toàn trường, chỉ đọc",
    roleCode: "HIEU_TRUONG",
    lanes: ["Việc cần theo dõi", "Phòng ban chờ xác nhận", "Báo cáo điều hành"],
  },
  {
    key: "ke-toan-truong",
    title: "Quản lý phòng Kế toán",
    department: "Kế toán",
    scope: "Phòng Kế toán, chỉ đọc",
    roleCode: "KE_TOAN_TRUONG",
    lanes: ["Việc phòng Kế toán", "Hồ sơ chờ đối soát", "Báo cáo tài chính nháp"],
  },
  {
    key: "ke-toan-thu-chi",
    title: "Kế toán thu - chi",
    department: "Kế toán",
    scope: "Thu - chi mô phỏng, chỉ đọc",
    roleCode: "KE_TOAN_THU_CHI",
    lanes: ["Việc thu - chi", "Chứng từ chờ kiểm tra", "Tổng hợp thu - chi"],
  },
  {
    key: "ke-toan-ngan-hang-quy",
    title: "Kế toán ngân hàng - quỹ",
    department: "Kế toán",
    scope: "Ngân hàng - quỹ mô phỏng, chỉ đọc",
    roleCode: "KE_TOAN_NGAN_HANG_QUY",
    lanes: ["Việc ngân hàng - quỹ", "Giao dịch chờ đối chiếu", "Báo cáo dòng tiền nháp"],
  },
  {
    key: "truong-tchc",
    title: "Trưởng phòng TCHC",
    department: "TCHC",
    scope: "Phòng TCHC, chỉ đọc",
    roleCode: "TRUONG_TCHC",
    lanes: ["Việc TCHC", "Hồ sơ nhân sự chờ rà soát", "Báo cáo nhân sự nháp"],
  },
  {
    key: "truong-tuyen-sinh",
    title: "Trưởng phòng Tuyển sinh",
    department: "Tuyển sinh",
    scope: "Phòng Tuyển sinh, chỉ đọc",
    roleCode: "TRUONG_TUYEN_SINH",
    lanes: ["Việc tuyển sinh", "Lead chờ kiểm tra", "Báo cáo tuyển sinh nháp"],
  },
  {
    key: "ctv-tuyen-sinh",
    title: "CTV Tuyển sinh",
    department: "Tuyển sinh",
    scope: "Cộng tác viên, chỉ đọc",
    roleCode: "CTV_TUYEN_SINH",
    lanes: ["Việc được giao", "Lead chờ bàn giao", "Báo cáo cá nhân nháp"],
  },
];

function getRuntimeEnv(name: string) {
  return process.env[name];
}

export function isHeuDemoRoleLoginEnabled() {
  return (
    getRuntimeEnv("HEU_DEPLOYMENT_MODE") === "pilot" &&
    getRuntimeEnv("HEU_ENABLE_DEMO_ROLE_LOGIN") === "true"
  );
}

export function getHeuDemoRoleDirectory() {
  return isHeuDemoRoleLoginEnabled() ? [...demoRoles] : [];
}

export function getHeuDemoRole(key?: string | null) {
  return demoRoles.find((role) => role.key === key) ?? demoRoles[0];
}
