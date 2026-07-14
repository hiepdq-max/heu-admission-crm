# HEU-USER-012 - Live Scope Repair Preflight (Metadata-Only)

## 1. Mục tiêu

Ghi nhận kết quả kiểm tra read-only trên Supabase để chuẩn bị owner decision cho
`Auth -> users_profile -> position -> role -> department -> workspace/scope`.

Tài liệu này không cấp quyền, không sửa scope, không tạo tài khoản và không phải
là owner approval.

## 2. Phạm vi và ranh giới

- Chỉ đọc metadata và số lượng trạng thái.
- Không ghi email, họ tên, số điện thoại, raw UUID, mật khẩu, reset link hoặc
  service-role key.
- Không chạy migration, không gửi email, không tạo Auth user, không thay đổi
  profile, role, position, department hoặc workspace.
- Production remains `NO_GO`; Stage D - internal controlled test only.

## 3. Kết quả live preflight ngày 2026-07-14

| Hạng mục | Kết quả | Ý nghĩa |
|---|---:|---|
| Active CRM profiles | 11 | Đã có hồ sơ để kiểm tra tiếp |
| Active non-ADMIN/BGH profiles | 9 | Cần scope hẹp trước khi pilot |
| Profile có Auth link | 11/11 | Không phát hiện profile mồ côi |
| Profile có role | 11/11 | Role link hiện đủ |
| Thiếu lead visibility | 7 | Owner phải chọn `OWN/TEAM/DEPARTMENT` |
| Thiếu business scope | 7 | Owner phải chọn segment/partner scope |
| Workspace mismatch | 1 | Phải sửa trước cutover |
| Position master bắt buộc | 17 | Master đã định nghĩa |
| Position đã có owner | 7/17 | Còn 10 vị trí cần owner/create/link |
| Non-admin có `ALL` visibility | 0 | Không phát hiện broad visibility |

## 4. Kiểm tra đã chạy

- `check:heu-user-create-readiness`: `PASS_LOCAL`.
- `check:heu-permission-scope-readiness`: `NO_GO` do 7 visibility, 7 business
  scope và 1 workspace mismatch.
- `check:heu-user-scope-baseline-repair-queue`: `NO_GO` vì owner decisions chưa
  có; static/app/DB-read guards `READY`.
- `check:heu-position-assignment-owner-queue`: `PASS_LOCAL`; còn 10 required
  positions chưa có owner.
- `audit:heu-user-account-security`: `PASS`.
- `audit:heu-role-scope-uat-pack`: `PASS`; signed UAT chưa có.
- `audit:permission-soft-revoke`: `PASS`.

## 5. Owner decision queue

Owner phải xử lý qua kênh quản trị được kiểm soát, theo thứ tự:

1. Xác nhận owner/reviewer cho 7 nhãn ẩn danh thiếu lead visibility.
2. Chọn visibility hẹp cho từng nhãn; không dùng `ALL` cho non-ADMIN/BGH.
3. Chọn segment/partner scope cho từng nhãn.
4. Xác nhận và sửa 1 workspace mismatch.
5. Tạo/link owner cho 10 position master còn thiếu.
6. Ghi Controlled Evidence ID cho từng quyết định.
7. Chạy lại scope repair, position owner, negative-control và role-scope UAT.

## 6. Điều kiện chuyển bước

Chỉ chuyển sang `HEU-USER-012-CONTROLLED-AUTH-UAT-ONE-ACCOUNT` khi tất cả điều
kiện sau đạt:

- `missing_visibility=0`.
- `missing_business_scope=0`.
- `workspace_mismatch=0`.
- Tất cả required positions có owner hoặc có quyết định blocked rõ ràng.
- Có Controlled Evidence ID và owner decision record.
- Có snapshot trước/sau repair và rollback note.

## 7. Trạng thái

`DANG_KIEM` - kỹ thuật đã sẵn sàng để owner review; chưa được phép sửa live
scope, chạy authenticated UAT, mở pilot hoặc production.
