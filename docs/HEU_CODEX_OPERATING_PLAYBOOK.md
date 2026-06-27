# HEU Codex Operating Playbook

Date: 2026-06-25

## 1. Muc Dich

Tai lieu nay la file dieu phoi cach lam viec voi Codex trong du an Web app HEU.
Muc tieu la xay nhanh, de dung, dung chuyen mon, dung phap che va khong lam mat
kiem soat du lieu.

## 2. Nguyen Tac Khong Doi

1. Khong gui mat khau, OTP, API key, service role key, private key, tai khoan
   ngan hang that vao chat.
2. Khong dung du lieu hoc sinh/phu huynh/CCCD/tai khoan ngan hang that trong
   test neu chua duoc an danh.
3. Khong chay migration production khi chua co backup, thu tu migration,
   rollback plan va xac nhan cua nguoi co tham quyen.
4. Khong hard-delete chung tu, tai chinh, doi soat, de nghi chi, thanh toan,
   phe duyet, minh chung hoac audit log.
5. AI chi de xuat, canh bao, tong hop va kiem tra. AI khong phe duyet, khong
   ghi nhan doanh thu, khong thuc hien chi va khong tu quyet dinh go-live.

## 3. Pham Vi Hien Tai

Lam truoc TTGDTX 9+ pilot, theo thu tu:

1. Danh muc hop dong, hoc phi, nganh, TTGDTX.
2. Gate tao cong no.
3. Cong no hoc phi.
4. Thu hoc phi.
5. Doi soat.
6. De nghi chi.
7. Kiem/duyet de nghi chi.
8. Thuc hien chi mot lan.
9. Dashboard ke toan.

Sau khi pilot nay on dinh moi mo rong sang HOU, ngan han, dao tao/van hanh va
AI nang cao.

## 4. Cach Mo Chat Trong Codex

Nen dung mot Project duy nhat: `Web app HEU`.

Trong project do, nen co cac chat:

| Chat | Muc dich |
|---|---|
| Dieu phoi HEU | Noi ra quyet dinh tong, doc file, uu tien viec, chia viec |
| G2 Master Gate | Danh muc, hop dong, hoc phi, P2-05 gate |
| G3 Finance Input | Cong no, import, thu hoc phi |
| G4 Reconciliation | Doi soat va khoa ky |
| G5 Payment Control | De nghi chi, duyet chi, thuc hien chi |
| G6 Dashboard UAT | Dashboard, test, doi chieu so lieu |
| Security Audit | Quyen, audit log, bao mat, backup, rollback |

Khong nen mo qua nhieu chat tu do. Moi chat phai noi ro pham vi va doc cac file
kiem soat truoc khi sua code.

## 5. Moi Lan Lam Voi Codex Can Prompt Nhu The Nao

Khong can viet prompt dai. Hay dua 4 thong tin:

1. Muc tieu: can lam man hinh, luong nghiep vu hay loi nao.
2. Pham vi: TTGDTX, HOU, ngan han, tai chinh, dao tao hay bao mat.
3. Bang chung: file, anh loi, Excel/Word/PDF da an danh neu co.
4. Gioi han: co duoc sua code, sua SQL, chay build, tao migration hay chi phan
   tich.

Vi du:

```text
Lam tiep G5 Payment Control cho TTGDTX. Muc tieu: khong cho chi trung mot de
nghi chi. Duoc sua code va docs, khong chay migration production, chay lint/build.
```

## 6. Danh Sach File Chuan Phai Doc

| File | Vai tro |
|---|---|
| `AGENTS.md` | Luat bat buoc cho Codex khi sua repo |
| `docs/HEU_CODEX_OPERATING_PLAYBOOK.md` | Cach dieu phoi du an voi Codex |
| `docs/HEU_TECH_DECISION_001_FREEZE_AND_HARDEN_TTGDTX_9PLUS.md` | Quyet dinh dong bang pham vi TTGDTX |
| `docs/TTGDTX_PHU_XUYEN_REAL_DATA_FIT_NOTE_20260625.md` | Goc nhin du lieu that Phu Xuyen de may do import, hop dong, doi soat va bao mat |
| `docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md` | Checklist Go/No-Go |
| `docs/REMAINING_CHANGE_AUDIT_20260622.md` | Cac thay doi con dang review |
| `docs/MIGRATION_ORDER_AUDIT.md` | Thu tu va rui ro migration |
| `docs/HARD_DELETE_AUDIT.md` | Rui ro xoa du lieu/cascade |
| `docs/STEP109_ROLE_PERMISSION_UAT_RUNBOOK.md` | UAT/rollback cho migration quyen P0-11 |
| `docs/P2_17_DUPLICATE_PAYOUT_UAT_RUNBOOK.md` | UAT chong chi trung P2-17 |
| `docs/P2_18_ACCOUNTING_DASHBOARD_UAT_RUNBOOK.md` | UAT dashboard ke toan P2-18 |
| `docs/TTGDTX_AUDIT_LOG_UAT_RUNBOOK.md` | UAT audit log tai chinh TTGDTX |
| `docs/STEP90_STEP109_BACKUP_ROLLBACK_DRY_RUN_RUNBOOK.md` | Runbook backup, rollback va dry-run truoc production |
| `docs/TTGDTX_ROLE_SCOPE_UAT_RUNBOOK.md` | UAT quyen theo role va workspace TTGDTX |

## 7. Mo Hinh Nhieu Nguoi Dung

Khong van hanh bang viec moi nguoi save file Excel rieng ve may. Huong dung la:

1. Web app la noi nhap va xu ly nghiep vu chinh.
2. Database la nguon su that.
3. Google Drive/Shared Drive luu minh chung, hop dong, bien ban, file goc.
4. App chi luu duong dan minh chung va metadata can thiet.
5. Moi nguoi dang nhap bang tai khoan rieng, gan role va workspace.
6. Moi thao tac tai chinh/phe duyet/thanh toan phai co audit log.
7. Bao cao/dashboards doc tu database, khong sua nguoc so lieu goc.

## 8. Quyen Va Bao Mat

| Nhom | Duoc lam | Khong duoc lam |
|---|---|---|
| Tuyen sinh | Tao/cap nhat lead trong pham vi | Xem/sua thanh toan, duyet chi |
| KHTC | Tao cong no, ghi nhan thu, doi soat, de nghi chi | Sua ho so ngoai pham vi |
| BGH | Xem dashboard, phe duyet theo quy trinh | Nhap du lieu hang ngay |
| Phap che | Kiem hop dong, can cu phap ly | Sua so lieu thu/chi |
| Audit/IT Data | Kiem log, quyen, rollback | Tu phe duyet nghiep vu |

## 9. Dieu Kien Moi Duoc Go-Live

Chi go-live khi:

1. Checklist production khong con P0 blocker.
2. Co backup va rollback da thu.
3. Migration order duoc ky/xac nhan.
4. Da test khong chi trung P2-17.
5. Dashboard P2-18 doi chieu dung voi cong no, thu, doi soat, chi.
6. Quyen nhieu vai tro da test bang tai khoan rieng.
7. Audit log du de truy vet nguoi, thoi gian, truoc/sau va ly do.
8. Da doi chieu voi `docs/TTGDTX_PHU_XUYEN_REAL_DATA_FIT_NOTE_20260625.md` ma
   khong commit PII, tai khoan ngan hang, CCCD hoac du lieu hoc sinh that.
9. `npm.cmd run audit:hard-delete`,
   `npm.cmd run audit:permission-soft-revoke` va
   `npm.cmd run audit:ttgdtx-audit-log`,
   `npm.cmd run audit:ttgdtx-cascade`,
   `npm.cmd run audit:ttgdtx-dashboard-access` va
   `npm.cmd run audit:ttgdtx-data-fetch-gate` va
   `npm.cmd run audit:ttgdtx-role-scope-access` va
   `npm.cmd run audit:ttgdtx-step110-safety` va
   `npm.cmd run audit:ttgdtx-uat-readiness` va
   `npm.cmd run audit:ttgdtx-release-gates` deu pass trong nhanh hardening.

## 10. Cach Mo Rong Sau Pilot

Mo rong theo tung module, khong tron tat ca vao mot lan:

1. Dong TTGDTX 9+ pilot.
2. Chuan hoa Data Master va RBAC.
3. Mo module dao tao/van hanh.
4. Mo HOU.
5. Mo ngan han.
6. Mo AI canh bao, tim loi, goi y quy trinh.

Moi lan mo module moi phai co migration, checklist, audit va UAT rieng.
