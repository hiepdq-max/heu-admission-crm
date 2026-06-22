# TTGDTX 9+ Pilot Production Checklist

## 1. Purpose

Checklist này dùng để kiểm soát mức sẵn sàng production cho pilot TTGDTX 9+ accounting end-to-end.

## 2. Scope

Date: 2026-06-22  
Scope: Trung cấp 9+ liên kết TTGDTX accounting end-to-end  

## 3. Status Values

- NOT_STARTED
- IN_PROGRESS
- DONE
- BLOCKED
- WAIVED_BY_AUTHORITY

## 4. Approval Rule

Nếu bất kỳ P0 control nào chưa DONE hoặc chưa WAIVED_BY_AUTHORITY thì kết luận là NO-GO.

## 5. Production Checklist

| Control item | Owner | Status | Evidence required | Approval required | Risk if skipped |
|---|---|---|---|---|---|
| Freeze TTGDTX 9+ pilot scope | BGH + IT_DATA | DONE | Tech Decision 001 | YES | Scope creep, mất kiểm soát hệ thống |
| Keep safety branch for hardening | IT_DATA | DONE | Branch `hardening/ttgdtx-9plus-pilot` | NO | Lẫn pilot với main chưa ổn định |
| Review dirty Git state | IT_DATA | IN_PROGRESS | GIT_CLEANUP_ANALYSIS.md | YES | Commit nhầm log, SQL tạm hoặc code chưa kiểm |
| Exclude runtime logs from commit | IT_DATA | NOT_STARTED | .gitignore review and status check | NO | Lộ log, nhiễu repo |
| Supabase backup before production migration | IT_DATA | NOT_STARTED | Backup ID, timestamp, restore note | YES | Không rollback được khi lỗi migration |
| Approve Step90-Step108 migration order | IT_DATA + KHTC + PHAP_CHE | IN_PROGRESS | MIGRATION_ORDER_AUDIT.md signed off | YES | Chạy sai thứ tự, hỏng dữ liệu tài chính |
| P2-01 TTGDTX contract active | PHAP_CHE + BGH | DONE | Contract row, status, scope, effective date | YES | Thu/chi theo hợp đồng chưa hiệu lực |
| P2-02 tuition policy ready | KHTC | DONE | Tuition policy READY for TTGDTX/major/year | YES | Tạo công nợ sai học phí |
| P0-19 legal/finance gate ready | PHAP_CHE + KHTC | IN_PROGRESS | Legal and tuition gate evidence | YES | Chốt nhập học/công nợ khi ngành chưa đủ căn cứ |
| P2-05 gate shows only eligible leads | TUYEN_SINH + KHTC | DONE | Screenshot/gate counts and pass/fail reasons | NO | Tạo công nợ cho lead thiếu điều kiện |
| P2-03 receivable creation | KHTC | DONE | Receivable ID, student, amount, due date, audit log | YES | Thiếu công nợ hoặc tạo trùng công nợ |
| P2-10 tuition collection | KHTC | DONE | Receipt/voucher number, amount, date, evidence link | YES | Thu vượt, trùng chứng từ, sai số tiền |
| Money input format | IT_DATA + KHTC | IN_PROGRESS | Accept `1000000`, `1 000 000`, `1.000.000`; display formatted VND | NO | Người dùng nhập nhầm số tiền |
| P2-13 reconciliation batch | KHTC | DONE | Batch ID, receipt list, period, partner | YES | Một chứng từ nằm nhiều kỳ hoặc bỏ sót đối soát |
| P2-14 review/approve/lock batch | KHTC + BGH | DONE | Locked batch status and approval log | YES | Đề nghị chi từ kỳ chưa khóa |
| P2-15 payment request created | KHTC | DONE | Payment request ID, amount, batch, creator | YES | Không có hồ sơ chi |
| P2-15 note/evidence completeness | KHTC | IN_PROGRESS | Missing note corrected or waiver recorded | YES | Audit thiếu lý do đề nghị chi |
| P2-16 check/approve payment request | KHTC + BGH | DONE | Checked/approved status, approver note | YES | Chi chưa qua kiểm/duyệt |
| P2-17 execute payout once | KHTC | IN_PROGRESS | Payout voucher, paid status, duplicate-click audit | YES | Chi trùng đối tác |
| P2-18 accounting dashboard | IT_DATA + KHTC | BLOCKED | Dashboard loads and matches P2-03/P2-10/P2-13/P2-17 | YES | BGH/KHTC xem sai hoặc không xem được số liệu |
| Permission by role and workspace | IT_DATA + TRUONG_PHONG | IN_PROGRESS | Test admin, KHTC, tuyển sinh, CTHSSV, staff | YES | User thấy/sửa dữ liệu ngoài phạm vi |
| Audit log completeness | IT_DATA + AUDIT | IN_PROGRESS | Logs for create/update/check/approve/pay | YES | Không truy vết được người thao tác |
| Hard delete review | IT_DATA + AUDIT | IN_PROGRESS | HARD_DELETE_AUDIT.md reviewed | YES | Mất chứng từ, mất lịch sử hoặc sai pháp lý |
| Error routing P2-07/P2-08 | KHTC + IT_DATA + AUDIT | DONE | Issue routing/resolution records | NO | Lỗi chuyên môn không đến đúng người xử lý |
| No AI approval | BGH + IT_DATA | IN_PROGRESS | AI policy shows AI only warns/suggests | YES | AI tự quyết nghiệp vụ tài chính |
| Rollback plan | IT_DATA | NOT_STARTED | Restore procedure and tested dry-run | YES | Không phục hồi được khi lỗi production |
| Internal UAT sign-off | BGH + KHTC + PHAP_CHE + IT_DATA | NOT_STARTED | Signed UAT report | YES | Pilot thật khi chưa đủ kiểm thử |

## 6. P0 Go/No-Go Controls

P0 controls are the approval-critical controls in this checklist, including backup, migration order, permission, audit, hard delete, P2-17 payout, P2-18 dashboard and final UAT sign-off.

## 7. Evidence Required

Each control must have verifiable evidence in the linked document, screenshot, database record, approval note or audit log before it can be marked DONE.

## 8. Final Approval

Final approval must come from BGH and the responsible owner departments listed in the checklist. AI may only suggest, warn or summarize; it must not approve production readiness.

## 9. Current Conclusion

Current recommendation: NO-GO for production.

Internal pilot can continue only inside controlled test scope. Before production, the highest priority blockers are:

1. Verify P2-18 dashboard.
2. Review and remove/waive CRITICAL hard delete paths.
3. Confirm P2-17 cannot pay twice.
4. Finalize migration order and backup/rollback.
5. Complete role/workspace permission tests.
