# HEU-USER-009: Bản nháp mapping 25 tài khoản test theo vị trí

## 1. Mục tiêu

Chuẩn hóa mapping nháp cho 25 tài khoản kiểm thử tổng hợp theo chuỗi:

`account_alias -> position -> role -> department -> workspace -> scope`

Tài liệu này chỉ là thiết kế kiểm thử. Không tạo Auth user, không đặt mật khẩu,
không gửi email, không kích hoạt tài khoản và không cấp quyền production.

## 2. Quy ước tài khoản

- `THUNGHIEM_01` đến `THUNGHIEM_25` tương ứng phần trước dấu `@` của dải
  tài khoản test do Owner cung cấp.
- Không ghi email đầy đủ, mật khẩu, reset link, token hoặc service-role key trong
  tài liệu này.
- Tất cả tài khoản bắt đầu ở trạng thái `INACTIVE`.
- Chỉ chuyển sang `ACTIVE` sau khi có owner xác nhận, UAT đúng scope và bằng chứng
  kiểm soát.

## 3. Mapping đề xuất

| Alias | Vị trí | Role kiểm thử | Phòng ban | Workspace đề xuất | Phạm vi chính |
|---|---|---|---|---|---|
| THUNGHIEM_01 | Nhân viên CTHSSV | CTHSSV_OFFICER | CTHSSV | CTHSSV | Hồ sơ HSSV được giao |
| THUNGHIEM_02 | Phó phòng CTHSSV | CTHSSV_MANAGER | CTHSSV | CTHSSV | Hàng đợi phòng, không duyệt ngoài scope |
| THUNGHIEM_03 | Nhân viên tuyển sinh 1 | ADMISSION_OFFICER | Tuyển sinh | ADMISSION | Lead được giao |
| THUNGHIEM_04 | Nhân viên tuyển sinh 2 | ADMISSION_OFFICER | Tuyển sinh | ADMISSION | Lead được giao |
| THUNGHIEM_05 | Trưởng phòng tuyển sinh | ADMISSION_MANAGER | Tuyển sinh | ADMISSION | Hàng đợi tuyển sinh |
| THUNGHIEM_06 | Kế toán thu - chi | FINANCE_OFFICER | Kế toán | FINANCE | Đối soát nháp thu - chi |
| THUNGHIEM_07 | Kế toán ngân hàng - quỹ | FINANCE_TREASURY | Kế toán | FINANCE | Đối soát ngân hàng nháp |
| THUNGHIEM_08 | Phó phòng Kế toán | FINANCE_MANAGER | Kế toán | FINANCE | Kiểm tra tài chính read-only |
| THUNGHIEM_09 | Trưởng phòng TCHC | HR_ADMIN_MANAGER | TCHC | HR_ADMIN | Hồ sơ nhân sự metadata |
| THUNGHIEM_10 | Phó phòng TCHC | HR_ADMIN_OFFICER | TCHC | HR_ADMIN | Việc nhân sự được giao |
| THUNGHIEM_11 | Trưởng phòng Đào tạo | TRAINING_MANAGER | Đào tạo | TRAINING | Lớp, lịch, danh sách được giao |
| THUNGHIEM_12 | Nhân viên Đào tạo | TRAINING_OFFICER | Đào tạo | TRAINING | Dữ liệu đào tạo được giao |
| THUNGHIEM_13 | Trưởng khoa | FACULTY_MANAGER | Khoa | FACULTY | Dữ liệu khoa được giao |
| THUNGHIEM_14 | Nhân viên khoa | FACULTY_OFFICER | Khoa | FACULTY | Công việc khoa được giao |
| THUNGHIEM_15 | Kiểm tra nội bộ | AUDIT_REVIEWER | Audit | AUDIT | Read-only, audit evidence |
| THUNGHIEM_16 | Quản trị dữ liệu | IT_DATA_OPERATOR | IT_DATA | IT_DATA | Metadata, scope, checker |
| THUNGHIEM_17 | Chuyên viên pháp chế | LEGAL_REVIEWER | Pháp chế | LEGAL | SOP/legal evidence read-only |
| THUNGHIEM_18 | Quản trị Data Master | DATA_MASTER_OPERATOR | Data Master | DATA_MASTER | Dữ liệu nền chờ xác nhận |
| THUNGHIEM_19 | Finance read-only | FINANCE_READONLY | Kế toán | FINANCE | Chỉ xem báo cáo/đối soát |
| THUNGHIEM_20 | Đại diện BGH | BGH_READONLY | BGH | EXECUTIVE | Dashboard và điểm nóng read-only |
| THUNGHIEM_21 | Quản lý hồ sơ - văn thư | DOCUMENTS_OPERATOR | TCHC | DOCUMENTS | File registry metadata |
| THUNGHIEM_22 | Điều phối HOU | HOU_LIAISON | HOU | HOU | Bàn giao/đối soát read-only |
| THUNGHIEM_23 | Kiểm tra chất lượng tuyển sinh | ADMISSION_QA | Tuyển sinh | ADMISSION | Kiểm tra lead, không duyệt tài chính |
| THUNGHIEM_24 | Phân tích báo cáo | REPORT_ANALYST | Dashboard | REPORTING | Báo cáo theo scope được cấp |
| THUNGHIEM_25 | Điều phối Task Center | TASK_COORDINATOR | Hệ thống | SYSTEM | Giao việc, theo dõi, không tự duyệt |

## 4. Quy tắc an toàn

1. Không dùng chung tài khoản; mỗi alias là một hồ sơ test độc lập.
2. Không cấp `ADMIN`, `ALL_SCOPE`, service-role hoặc quyền migration cho nhóm
   tài khoản này.
3. Không gán quyền duyệt thanh toán, payout, production hoặc thay đổi chính sách
   cho tài khoản test.
4. Mỗi tài khoản phải có owner vị trí, Evidence ID ẩn danh và workspace hợp lệ
   trước khi UAT.
5. UAT bắt buộc có cả ca truy cập đúng scope và ca truy cập sai scope.
6. Dữ liệu UAT chỉ dùng fixture tổng hợp; dữ liệu thật giữ ngoài Git/Codex/chat.

## 5. Trình tự triển khai sau khi được duyệt

| Bước | Nội dung | Trạng thái mặc định |
|---|---|---|
| 1 | Owner xác nhận vị trí, phòng ban và workspace | `WAITING_OWNER` |
| 2 | IT_DATA kiểm tra role/permission/scope | `WAITING_IT_DATA` |
| 3 | Audit kiểm tra log và negative access cases | `WAITING_AUDIT` |
| 4 | Tạo hoặc liên kết Auth user | Chưa được phép tự động |
| 5 | UAT một tài khoản tổng hợp | `AUTH_REQUIRED` |
| 6 | Mở rộng theo từng phòng | Chỉ sau khi bước 5 đạt |

## 6. Phản biện chuyên môn

- 25 tài khoản là đủ để kiểm thử ma trận vị trí, nhưng không phải bằng chứng
  rằng nhân sự thật đã sẵn sàng vận hành.
- Không nên kích hoạt cả 25 tài khoản cùng lúc; ưu tiên một tài khoản CTHSSV,
  một tài khoản Tuyển sinh và một tài khoản Kế toán read-only.
- BGH và Audit chỉ nên có quyền xem/kiểm tra trong pilot; không dùng tài khoản
  test để mô phỏng phê duyệt chính thức.
- Mapping này cần đối chiếu lại với position master và owner thật trước khi
  chuyển sang provisioning.

## 7. Rollback

Đây là tài liệu-only, chưa phát sinh Auth/DB mutation. Rollback bằng cách revert
commit tài liệu này; không cần rollback dữ liệu.

## 8. Kết luận

- Kỹ thuật: `DAT_TAM_THOI` cho mapping nháp.
- Provisioning thật: `NO_GO`.
- Kích hoạt/UAT thật: `CHO_BGH_DUYET` sau khi owner, IT_DATA và Audit xác nhận.
- Production: `NO_GO`.
