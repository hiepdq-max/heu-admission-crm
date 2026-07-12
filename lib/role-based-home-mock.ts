export type MockHomeProfileKey =
  | "admission"
  | "cthssv"
  | "training"
  | "bgh"
  | "admin";

export type MockHomeLane = {
  title: string;
  description: string;
  items: string[];
};

export type MockHomeProfile = {
  key: MockHomeProfileKey;
  roleCode: string;
  roleLabel: string;
  workspaceCode: string;
  workspaceLabel: string;
  isControlRole: boolean;
  lanes: [MockHomeLane, MockHomeLane, MockHomeLane];
};

const departmentReports = [
  "Tiến độ xử lý trong tuần",
  "Việc cần phối hợp liên phòng",
  "Các mục đang quá hạn",
];

export const mockHomeProfiles: MockHomeProfile[] = [
  {
    key: "admission",
    roleCode: "ADMISSION_OFFICER",
    roleLabel: "Chuyên viên Tuyển sinh",
    workspaceCode: "WS_TUYEN_SINH",
    workspaceLabel: "Phòng Tuyển sinh",
    isControlRole: false,
    lanes: [
      {
        title: "Việc của tôi",
        description: "Các việc được giao trực tiếp cho bạn.",
        items: ["Liên hệ lại 2 hồ sơ đang chờ", "Bổ sung ghi chú tư vấn", "Kiểm tra lịch hẹn chiều nay"],
      },
      {
        title: "Dữ liệu chờ xác nhận",
        description: "Chỉ xác nhận dữ liệu thuộc phạm vi phòng.",
        items: ["Danh sách hồ sơ bàn giao hôm nay", "Thông tin ngành đăng ký cần kiểm tra"],
      },
      { title: "Báo cáo phòng", description: "Tổng hợp phục vụ điều hành nội bộ.", items: departmentReports },
    ],
  },
  {
    key: "cthssv",
    roleCode: "CTHSSV_OFFICER",
    roleLabel: "Chuyên viên CTHSSV",
    workspaceCode: "WS_CTHSSV",
    workspaceLabel: "Phòng Công tác HSSV",
    isControlRole: false,
    lanes: [
      { title: "Việc của tôi", description: "Các việc được giao trực tiếp cho bạn.", items: ["Rà soát hồ sơ tiếp nhận", "Phản hồi yêu cầu bổ sung giấy tờ"] },
      { title: "Dữ liệu chờ xác nhận", description: "Chỉ xác nhận dữ liệu thuộc phạm vi phòng.", items: ["Thông tin học sinh mới bàn giao", "Tình trạng hồ sơ nhập học"] },
      { title: "Báo cáo phòng", description: "Tổng hợp phục vụ điều hành nội bộ.", items: departmentReports },
    ],
  },
  {
    key: "training",
    roleCode: "TRAINING_OFFICER",
    roleLabel: "Chuyên viên Đào tạo",
    workspaceCode: "WS_DAO_TAO",
    workspaceLabel: "Phòng Đào tạo",
    isControlRole: false,
    lanes: [
      { title: "Việc của tôi", description: "Các việc được giao trực tiếp cho bạn.", items: ["Kiểm tra danh sách lớp", "Rà soát lịch học tuần tới"] },
      { title: "Dữ liệu chờ xác nhận", description: "Chỉ xác nhận dữ liệu thuộc phạm vi phòng.", items: ["Danh sách lớp dự kiến", "Thông tin chương trình cần đối chiếu"] },
      { title: "Báo cáo phòng", description: "Tổng hợp phục vụ điều hành nội bộ.", items: departmentReports },
    ],
  },
  {
    key: "bgh",
    roleCode: "BGH",
    roleLabel: "Ban Giám hiệu",
    workspaceCode: "WS_DIEU_HANH",
    workspaceLabel: "Không gian điều hành",
    isControlRole: true,
    lanes: [
      { title: "Việc cần theo dõi", description: "Các việc cần quyết định hoặc điều phối.", items: ["Tiến độ xác nhận dữ liệu", "Việc quá hạn giữa các phòng", "Báo cáo điều hành tuần"] },
      { title: "Chờ phòng xác nhận", description: "Chỉ xem trạng thái, không nhập thay phòng ban.", items: ["Tuyển sinh: 2 mục", "CTHSSV: 2 mục", "Đào tạo: 1 mục"] },
      { title: "Báo cáo điều hành", description: "Báo cáo tổng hợp ở chế độ chỉ xem.", items: ["Tổng quan công việc", "Tiến độ xác nhận", "Cảnh báo quá hạn"] },
    ],
  },
  {
    key: "admin",
    roleCode: "ADMIN",
    roleLabel: "Quản trị hệ thống",
    workspaceCode: "WS_SYSTEM",
    workspaceLabel: "Quản trị HEU",
    isControlRole: true,
    lanes: [
      { title: "Việc quản trị", description: "Các việc kiểm soát hệ thống cần theo dõi.", items: ["Rà soát phân quyền theo phòng", "Kiểm tra cảnh báo phạm vi truy cập"] },
      { title: "Theo dõi xác nhận", description: "Không duyệt thay nghiệp vụ phòng ban.", items: ["Tuyển sinh: 2 mục", "CTHSSV: 2 mục", "Đào tạo: 1 mục"] },
      { title: "Báo cáo hệ thống", description: "Sức khỏe vận hành ở chế độ chỉ xem.", items: ["Phạm vi role/workspace", "Tình trạng luồng xác nhận", "Cảnh báo hệ thống"] },
    ],
  },
];

export function getMockHomeProfile(key?: string | null) {
  return mockHomeProfiles.find((profile) => profile.key === key) ?? null;
}
