# HEU-ADMISSION-001: Khóa scope seed đối tượng tuyển sinh pilot

## 1. Mục tiêu

Chuẩn bị dữ liệu nền tối thiểu để kiểm thử dashboard, workspace và lead bằng dữ
liệu tổng hợp. Pilot chỉ bao gồm hai đối tượng thuộc HEU/TTGDTX; không mở rộng
sang HOU, khóa ngắn hạn hoặc đối tác khác.

## 2. Scope được phép

| Mã | Tên | Trạng thái pilot |
|---|---|---|
| `TC9_TTGDTX_LINKED` | Trung cấp 9+ liên kết TTGDTX | Được xem xét seed |
| `TC9_ONSITE_HEU` | Trung cấp 9+ tuyển sinh tại chỗ HEU | Được xem xét seed |

## 3. Scope bị khóa

Không được seed hoặc mở workflow trong lát cắt này:

- `UNIVERSITY_TRANSFER_HOU`
- `UNIVERSITY_TRANSFER_OTHER`
- `SHORT_UNEMPLOYMENT_SUPPORT`
- `SHORT_ONSITE_HEU`
- Bất kỳ segment/partner/COM nào chưa có owner và căn cứ pháp lý.

## 4. Phụ thuộc kỹ thuật

File tham chiếu: `database/step37_admission_segments.sql`.

File này không phải seed thuần túy; nó còn tạo bảng, thêm khóa liên kết vào
`leads`, tạo index, RLS policy, trigger audit và upsert nhiều segment. Vì vậy
không được chạy nguyên file trong production hoặc từ Codex/chat.

Trước khi thực thi bất kỳ SQL nào phải xác nhận:

1. Bảng `admission_segments` và liên kết `leads.admission_segment_id` đang ở
   trạng thái nào.
2. Backup/restore smoke-check có bằng chứng.
3. SQL reviewer của IT_DATA đã tách phần schema khỏi phần seed.
4. Owner Tuyển sinh và Pháp chế xác nhận hai đối tượng pilot.
5. Dữ liệu seed chỉ là dữ liệu tổng hợp, không chứa PII.

## 5. Quy trình an toàn

1. Đọc-only kiểm tra schema và số lượng segment hiện có.
2. Dựng patch SQL tối thiểu chỉ cho hai mã được phép.
3. Chạy thử trên môi trường kiểm thử riêng hoặc bản sao có rollback.
4. Kiểm tra RLS, audit log và workspace selector.
5. Tạo một lead tổng hợp cho mỗi segment.
6. Kiểm tra dashboard, pipeline, truy cập đúng scope và truy cập sai scope.
7. Ghi evidence ngoài Git/Codex/chat.

## 6. Điều kiện dừng

Dừng ngay và kết luận `NO_GO` nếu:

- SQL có tác động đến HOU/short-course ngoài scope.
- Không xác định được backup hoặc rollback.
- RLS/policy không giới hạn đúng quyền.
- Segment bị gán nhầm workspace hoặc phòng ban.
- Có dữ liệu thật chưa ẩn danh.
- Dashboard hiển thị tổng hợp ngoài scope của user.

## 7. Rollback

Nếu chỉ là seed pilot, rollback bằng status transition hoặc xóa mềm theo audit
log của hai mã pilot; không hard-delete dữ liệu gốc. Nếu thay đổi schema, chỉ
rollback theo migration plan đã được IT_DATA duyệt và có restore proof.

## 8. Quyết định hiện tại

- Thiết kế scope: `DAT_TAM_THOI`.
- Thực thi SQL: `NO_GO_UNTIL_IT_DATA_OWNER_APPROVAL`.
- HOU/short-course: `NO_GO` trong pilot.
- Production: `NO_GO`.
