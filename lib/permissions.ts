export type PermissionItem = {
  code: string;
  label: string;
  description: string;
};

export type PermissionGroup = {
  name: string;
  items: PermissionItem[];
};

export const permissionGroups: PermissionGroup[] = [
  {
    name: "Hệ thống",
    items: [
      {
        code: "system.manage",
        label: "Quản trị hệ thống",
        description: "Quyền lõi cho Admin, không nên bỏ.",
      },
      {
        code: "users.manage",
        label: "Quản lý người dùng",
        description: "Cấp role, phòng ban và trạng thái tài khoản.",
      },
      {
        code: "users.manage_department",
        label: "Quản lý người dùng cùng phòng",
        description: "Trưởng phòng phân quyền cho nhân sự thuộc phòng mình.",
      },
      {
        code: "settings.manage",
        label: "Quản lý cấu hình",
        description: "Quản lý danh mục và các cấu hình nghiệp vụ.",
      },
      {
        code: "scope.manage_department",
        label: "Phân phạm vi trong phòng",
        description:
          "Gán đối tượng tuyển sinh/trung tâm cho nhân sự trong phòng mình.",
      },
      {
        code: "audit.read",
        label: "Xem audit log",
        description: "Xem lịch sử thao tác nhạy cảm.",
      },
    ],
  },
  {
    name: "Lead và pipeline",
    items: [
      {
        code: "leads.read_all",
        label: "Xem toàn bộ lead",
        description: "Đọc tất cả lead trong CRM.",
      },
      {
        code: "leads.write_all",
        label: "Sửa toàn bộ lead",
        description: "Cập nhật tất cả lead trong CRM.",
      },
      {
        code: "leads.read_team",
        label: "Xem lead của đội",
        description: "Dành cho trưởng nhóm.",
      },
      {
        code: "leads.write_team",
        label: "Sửa lead của đội",
        description: "Dành cho trưởng nhóm.",
      },
      {
        code: "leads.read_assigned",
        label: "Xem lead được giao",
        description: "Dành cho tư vấn viên.",
      },
      {
        code: "leads.write_assigned",
        label: "Sửa lead được giao",
        description: "Dành cho tư vấn viên.",
      },
      {
        code: "leads.assign",
        label: "Phân lead",
        description: "Phân lead cho nhân sự.",
      },
      {
        code: "leads.assign_team",
        label: "Phân lead trong đội",
        description: "Phân lead trong phạm vi đội phụ trách.",
      },
      {
        code: "leads.import",
        label: "Import lead",
        description: "Nhập danh sách lead từ dữ liệu ngoài.",
      },
      {
        code: "activities.create",
        label: "Ghi hoạt động tư vấn",
        description: "Thêm log gọi điện, ghi chú và lịch hẹn.",
      },
      {
        code: "pipeline.manage",
        label: "Quản lý pipeline",
        description: "Cập nhật pipeline tuyển sinh toàn hệ thống.",
      },
      {
        code: "pipeline.manage_team",
        label: "Quản lý pipeline đội",
        description: "Cập nhật pipeline trong phạm vi đội.",
      },
    ],
  },
  {
    name: "Hồ sơ và tài chính",
    items: [
      {
        code: "documents.manage",
        label: "Quản lý hồ sơ",
        description: "Kiểm tra và cập nhật hồ sơ nhập học.",
      },
      {
        code: "documents.manage_team",
        label: "Quản lý hồ sơ đội",
        description: "Kiểm tra hồ sơ trong phạm vi đội.",
      },
      {
        code: "documents.read_assigned",
        label: "Xem hồ sơ lead được giao",
        description: "Tư vấn viên xem hồ sơ lead mình phụ trách.",
      },
      {
        code: "payments.read",
        label: "Xem thanh toán",
        description: "Xem thông tin thanh toán tuyển sinh.",
      },
      {
        code: "payments.verify",
        label: "Xác nhận thanh toán",
        description: "Kế toán xác nhận khoản thu.",
      },
    ],
  },
  {
    name: "Đối tác, chiến dịch, báo cáo",
    items: [
      {
        code: "partners.manage",
        label: "Quản lý đối tác/CTV",
        description: "Tạo và cập nhật đối tác, cộng tác viên.",
      },
      {
        code: "campaigns.manage",
        label: "Quản lý chiến dịch",
        description: "Tạo và cập nhật chiến dịch tuyển sinh.",
      },
      {
        code: "reports.read_all",
        label: "Xem báo cáo toàn hệ thống",
        description: "Xem báo cáo tổng hợp toàn trường.",
      },
      {
        code: "reports.read_team",
        label: "Xem báo cáo đội",
        description: "Xem báo cáo phạm vi đội phụ trách.",
      },
      {
        code: "reports.read_scope",
        label: "Xem báo cáo theo phạm vi",
        description: "Xem báo cáo đúng đối tượng/trung tâm được phân.",
      },
    ],
  },
  {
    name: "Bàn giao liên phòng",
    items: [
      {
        code: "handover.create",
        label: "Tạo bàn giao hồ sơ",
        description: "Tuyển sinh bàn giao hồ sơ đủ điều kiện sang phòng khác.",
      },
      {
        code: "handover.accept_cthssv",
        label: "CTHSSV nhận bàn giao",
        description: "Phòng CTHSSV nhận hồ sơ để mở lớp/ra quyết định.",
      },
      {
        code: "handover.accept_accounting",
        label: "Kế toán nhận bàn giao",
        description: "Kế toán nhận danh sách để theo dõi công nợ/học phí.",
      },
    ],
  },
  {
    name: "HOU và COM",
    items: [
      {
        code: "hou.com.read_sensitive",
        label: "Xem COM HOU nhạy cảm",
        description: "Xem cơ chế COM, tỷ lệ và thông tin đối soát.",
      },
      {
        code: "hou.com.manage",
        label: "Quản lý COM HOU",
        description: "Tạo claim và kỳ thanh toán COM HOU.",
      },
      {
        code: "hou.com.approve",
        label: "Duyệt COM HOU",
        description: "Duyệt hoặc giữ rủi ro claim COM.",
      },
      {
        code: "hou.com.payment",
        label: "Ghi nhận chi COM HOU",
        description: "Cập nhật trạng thái chi trả và chứng từ kế toán.",
      },
    ],
  },
];

export const allPermissions = permissionGroups.flatMap((group) =>
  group.items.map((item) => item.code),
);
