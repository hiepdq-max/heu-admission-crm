export type MockHomeProfileKey =
  | "admission"
  | "cthssv"
  | "training"
  | "bgh"
  | "admin";

export type HomeLane = {
  title: string;
  description: string;
  count: number;
  items: string[];
};

export type MockHomeProfile = {
  key: MockHomeProfileKey;
  roleCode: string;
  roleLabel: string;
  workspaceCode: string;
  workspaceLabel: string;
  greeting: string;
  isControlRole: boolean;
  lanes: {
    myTasks: HomeLane;
    confirmations: HomeLane;
    reports: HomeLane;
  };
};

export const mockHomeProfiles: MockHomeProfile[] = [
  {
    key: "admission",
    roleCode: "ADMISSION_OFFICER",
    roleLabel: "Chuyên viên Tuyển sinh",
    workspaceCode: "WS_TUYEN_SINH",
    workspaceLabel: "Phòng Tuyển sinh",
    greeting: "Hôm nay bạn có 3 việc cần ưu tiên",
    isControlRole: false,
    lanes: {
      myTasks: {
        title: "Việc của tôi",
        description: "Các việc được giao trực tiếp cho bạn.",
        count: 3,
        items: [
          "Liên hệ lại 2 hồ sơ đang chờ",
          "Bổ sung ghi chú tư vấn",
          "Kiểm tra lịch hẹn chiều nay",
        ],
      },
      confirmations: {
        title: "Dữ liệu chờ xác nhận",
        description: "Chỉ xác nhận dữ liệu thuộc phạm vi phòng.",
        count: 2,
        items: [
          "Danh sách hồ sơ bàn giao hôm nay",
          "Thông tin ngành đăng ký cần kiểm tra",
        ],
      },
      reports: {
        title: "Báo cáo phòng",
        description: "Tổng hợp phục vụ điều hành nội bộ.",
        count: 4,
        items: [
          "Tiến độ xử lý hồ sơ",
          "Lịch chăm sóc trong tuần",
          "Tình trạng bàn giao dữ liệu",
        ],
      },
    },
  },
  {
    key: "cthssv",
    roleCode: "CTHSSV_OFFICER",
    roleLabel: "Chuyên viên CTHSSV",
    workspaceCode: "WS_CTHSSV",
    workspaceLabel: "Phòng Công tác HSSV",
    greeting: "Hôm nay bạn có 2 việc cần ưu tiên",
    isControlRole: false,
    lanes: {
      myTasks: {
        title: "Việc của tôi",
        description: "Các việc được giao trực tiếp cho bạn.",
        count: 2,
        items: ["Rà soát hồ sơ tiếp nhận", "Phản hồi yêu cầu bổ sung giấy tờ"],
      },
      confirmations: {
        title: "Dữ liệu chờ xác nhận",
        description: "Chỉ xác nhận dữ liệu thuộc phạm vi phòng.",
        count: 3,
        items: [
          "Thông tin học sinh mới bàn giao",
          "Tình trạng hồ sơ nhập học",
          "Danh sách cần phối hợp đào tạo",
        ],
      },
      reports: {
        title: "Báo cáo phòng",
        description: "Tổng hợp phục vụ điều hành nội bộ.",
        count: 3,
        items: [
          "Tiến độ tiếp nhận học sinh",
          "Hồ sơ cần bổ sung",
          "Tình trạng phối hợp liên phòng",
        ],
      },
    },
  },
  {
    key: "training",
    roleCode: "TRAINING_OFFICER",
    roleLabel: "Chuyên viên Đào tạo",
    workspaceCode: "WS_DAO_TAO",
    workspaceLabel: "Phòng Đào tạo",
    greeting: "Hôm nay bạn có 4 việc cần ưu tiên",
    isControlRole: false,
    lanes: {
      myTasks: {
        title: "Việc của tôi",
        description: "Các việc được giao trực tiếp cho bạn.",
        count: 4,
        items: [
          "Kiểm tra danh sách lớp",
          "Rà soát lịch học tuần tới",
          "Phối hợp xác nhận hồ sơ đầu vào",
        ],
      },
      confirmations: {
        title: "Dữ liệu chờ xác nhận",
        description: "Chỉ xác nhận dữ liệu thuộc phạm vi phòng.",
        count: 2,
        items: ["Danh sách lớp dự kiến", "Thông tin chương trình cần đối chiếu"],
      },
      reports: {
        title: "Báo cáo phòng",
        description: "Tổng hợp phục vụ điều hành nội bộ.",
        count: 3,
        items: ["Tình hình lớp học", "Tiến độ kế hoạch tuần", "Việc cần phối hợp"],
      },
    },
  },
  {
    key: "bgh",
    roleCode: "BGH",
    roleLabel: "Ban Giám hiệu",
    workspaceCode: "WS_DIEU_HANH",
    workspaceLabel: "Không gian điều hành",
    greeting: "Các đầu việc cần theo dõi trong hôm nay",
    isControlRole: true,
    lanes: {
      myTasks: {
        title: "Việc cần theo dõi",
        description: "Tổng hợp các việc cần quyết định hoặc điều phối.",
        count: 3,
        items: [
          "Theo dõi tiến độ xác nhận dữ liệu",
          "Rà soát việc quá hạn giữa các phòng",
          "Xem báo cáo điều hành tuần",
        ],
      },
      confirmations: {
        title: "Chờ xác nhận của phòng",
        description: "Chỉ xem trạng thái, không nhập thay phòng ban.",
        count: 5,
        items: [
          "Tuyển sinh: 2 mục đang chờ",
          "CTHSSV: 2 mục đang chờ",
          "Đào tạo: 1 mục đang chờ",
        ],
      },
      reports: {
        title: "Báo cáo điều hành",
        description: "Báo cáo tổng hợp ở chế độ chỉ xem.",
        count: 4,
        items: ["Tổng quan công việc", "Tiến độ xác nhận", "Cảnh báo quá hạn"],
      },
    },
  },
  {
    key: "admin",
    roleCode: "ADMIN",
    roleLabel: "Quản trị hệ thống",
    workspaceCode: "WS_SYSTEM",
    workspaceLabel: "Quản trị HEU",
    greeting: "Kiểm tra vận hành và phạm vi truy cập",
    isControlRole: true,
    lanes: {
      myTasks: {
        title: "Việc quản trị",
        description: "Các việc kiểm soát hệ thống cần theo dõi.",
        count: 2,
        items: ["Rà soát phân quyền theo phòng", "Kiểm tra cảnh báo phạm vi truy cập"],
      },
      confirmations: {
        title: "Theo dõi xác nhận dữ liệu",
        description: "Chỉ xem luồng xác nhận, không duyệt thay nghiệp vụ.",
        count: 5,
        items: [
          "Tuyển sinh: 2 mục đang chờ",
          "CTHSSV: 2 mục đang chờ",
          "Đào tạo: 1 mục đang chờ",
        ],
      },
      reports: {
        title: "Báo cáo hệ thống",
        description: "Theo dõi sức khỏe vận hành ở chế độ chỉ xem.",
        count: 3,
        items: ["Phạm vi role/workspace", "Tình trạng luồng xác nhận", "Cảnh báo hệ thống"],
      },
    },
  },
];

export function getMockHomeProfile(key?: MockHomeProfileKey) {
  return mockHomeProfiles.find((profile) => profile.key === key) ?? mockHomeProfiles[0];
}
