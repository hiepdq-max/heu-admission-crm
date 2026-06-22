# HEU_TECH_DECISION_001: Freeze and Harden TTGDTX 9+ Pilot

Date: 2026-06-22  
Status: Accepted for internal hardening  
Repository: heu-admission-crm  
Pilot scope: Trung cấp 9+ liên kết TTGDTX  
Current stage: D - Có thể test nội bộ, chưa sẵn sàng production

## 1. Decision Summary

HEU tạm dừng mở rộng thêm chức năng ngoài phạm vi TTGDTX 9+ và chuyển sang giai đoạn freeze + harden. Mục tiêu là làm cho một chuỗi nghiệp vụ kế toán TTGDTX 9+ chạy đúng, có kiểm soát, có log, không chi trùng và có thể kiểm thử nội bộ trước khi nhân rộng sang các đối tượng tuyển sinh khác.

## 2. Freeze Reason

- Repo đang dirty, có nhiều file modified/untracked nên cần đóng phạm vi để tránh trôi kiến trúc.
- Chuỗi TTGDTX 9+ đã có nhiều bước chạy được từ hợp đồng, học phí, công nợ, thu tiền, đối soát, đề nghị chi, duyệt chi đến chi trả.
- Đây là luồng có rủi ro cao vì liên quan học phí, công nợ, đối tác, chứng từ và thanh toán.
- Nếu tiếp tục mở rộng HOU, ngắn hạn, AI agent hoặc dashboard rộng trước khi harden, hệ thống dễ mất chuẩn dữ liệu và khó audit.
- Phần mềm mục tiêu phải vận hành theo nguyên tắc: đúng luật, đúng dữ liệu, đúng quy trình, đúng người duyệt.

## 3. Pilot Scope

Luồng pilot chỉ gồm đối tượng: Trung cấp 9+ liên kết TTGDTX.

Chuỗi nghiệp vụ được phép harden:

1. P2-01: TTGDTX Contract Master.
2. P2-02: Học phí và công nợ TTGDTX.
3. P2-05: Gate điều kiện tạo công nợ.
4. P2-03: Tạo công nợ học phí.
5. P2-10: Thu học phí.
6. P2-13: Đối soát thu học phí.
7. P2-14: Rà soát, duyệt và khóa kỳ đối soát.
8. P2-15: Tạo đề nghị chi TTGDTX.
9. P2-16: Kiểm/duyệt đề nghị chi.
10. P2-17: Chi trả TTGDTX.
11. P2-18: Dashboard kế toán TTGDTX.

## 4. Paused Work

- Mở rộng production cho HOU.
- Mở rộng production cho ngắn hạn.
- Tạo thêm module AI tự động phê duyệt hoặc tự ghi nhận tài chính.
- Tách microservices trước khi mô hình dữ liệu pilot ổn định.
- Thêm luồng tuyển sinh mới ngoài TTGDTX 9+.
- Chạy migration production khi chưa có backup, rollback và thứ tự migration được duyệt.
- Commit/push khi chưa phân loại rõ file modified/untracked.

## 5. Allowed Work

- Viết tài liệu kiểm soát, checklist, audit và quyết định kỹ thuật.
- Sửa lỗi UI/logic trong đúng phạm vi TTGDTX 9+ sau khi có review.
- Bổ sung kiểm thử nội bộ cho P2-01 đến P2-18.
- Chuẩn hóa định dạng tiền, trạng thái, chứng từ và thông báo lỗi.
- Rà soát hard delete và thay bằng soft-delete/archive/status transition.
- Rà soát permission matrix và phạm vi P0-13.
- Rà soát migration order và rollback plan.
- Củng cố audit log cho các bước kế toán.

## 6. Go/No-Go Rule

### GO

Chỉ được mở pilot nội bộ khi tất cả điều kiện sau đạt:

- P2-01 hợp đồng TTGDTX có trạng thái đủ điều kiện.
- P2-02 học phí theo TTGDTX/ngành/kỳ có trạng thái READY.
- P2-05 chỉ cho qua lead đủ điều kiện, chỉ rõ từng chỗ thiếu.
- P2-03 tạo công nợ một lần, không tạo trùng cùng học sinh/kỳ/chính sách.
- P2-10 chặn thu vượt, chặn trùng số chứng từ, có chứng từ hoặc link minh chứng.
- P2-13 một chứng từ thu chỉ nằm trong một kỳ đối soát.
- P2-14 kỳ đối soát đã duyệt và khóa trước khi đề nghị chi.
- P2-15/P2-16/P2-17 không cho chi trùng, có người duyệt và log.
- P2-18 dashboard đọc được số liệu thật.
- Audit log tồn tại cho các bước tạo/sửa/duyệt/chi.
- Không còn hard delete rủi ro cao trong luồng tài chính hoặc đã được phê duyệt ngoại lệ.
- Đã có backup và kế hoạch rollback.

### NO-GO

Không được mở pilot nếu có một trong các điều kiện:

- Chưa khóa kỳ đối soát nhưng đã cho tạo đề nghị chi.
- Có thể chi TTGDTX hai lần cho cùng kỳ/chứng từ.
- Chưa kiểm soát được quyền user theo phạm vi TTGDTX.
- Chưa có audit log cho thao tác thu/duyệt/chi.
- SQL migration chưa có thứ tự chạy và chưa phân biệt patch tạm thời với migration nền.
- Dashboard P2-18 chưa truy cập được hoặc không khớp dữ liệu.

## 7. Final Approval

Người duyệt cuối trước khi pilot nội bộ:

- Hiệu trưởng/BGH: duyệt Go/No-Go cuối.
- Kế hoạch - Tài chính: duyệt số liệu công nợ, thu, đối soát, đề nghị chi và chi trả.
- Pháp chế: duyệt căn cứ hợp đồng, phạm vi liên kết, chứng từ và quy trình.
- IT/Data: xác nhận migration, dữ liệu, audit, quyền và backup.
- CTHSSV/Tuyển sinh: xác nhận điều kiện lead/học sinh trước công nợ.

## 8. Decision Status

| Item | Status |
|---|---|
| Decision | Accepted for internal hardening |
| Production readiness | NO-GO |
| Internal pilot | Allowed only inside controlled TTGDTX 9+ scope |
| Main conclusion | Current stage D - có thể test nội bộ, chưa sẵn sàng production |

## 9. Change Log

| Date | Change |
|---|---|
| 2026-06-22 | Chuẩn hóa heading và bố cục tài liệu hardening; không thay đổi kết luận chính. |
