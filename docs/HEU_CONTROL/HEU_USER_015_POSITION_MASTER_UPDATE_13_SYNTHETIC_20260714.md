# HEU-USER-015 - Cap nhat Position Master 13 tai khoan synthetic

Task ID: HEU-USER-001-IDENTITY-POSITION-SCOPE-MAPPING
Date: 2026-07-14
Status: DRAFT_CONTROL
Production: NO-GO

Tai lieu nay cap nhat 13 alias synthetic dau tien trong
`HEU_USER_009_POSITION_MASTER_25_ACCOUNT_MAPPING_DRAFT_20260714.md`.
Khong tao Auth user, khong dat mat khau, khong gui email va khong kich hoat
tai khoan.

## 1. Danh sach vi tri da cap nhat

| Alias | Vi tri | Phong ban | Role de xuat | Nhiem vu/UAT |
|---|---|---|---|---|
| THUNGHIEM_01 | Nhan vien CTHSSV | CTHSSV | CTHSSV_OFFICER | Nhap/xu ly ho so gia lap |
| THUNGHIEM_02 | Pho phong CTHSSV | CTHSSV | CTHSSV_MANAGER | Kiem tra, giao viec |
| THUNGHIEM_03 | Nhan vien tuyen sinh 1 | Tuyen sinh | ADMISSION_OFFICER | Lead/ho so |
| THUNGHIEM_04 | Nhan vien tuyen sinh 2 | Tuyen sinh | ADMISSION_OFFICER | Lead/ho so |
| THUNGHIEM_05 | Truong phong tuyen sinh | Tuyen sinh | ADMISSION_MANAGER | Quan ly phong |
| THUNGHIEM_06 | Ke toan thu-chi | Ke toan | FINANCE_OFFICER | Tai chinh nhap |
| THUNGHIEM_07 | Ke toan ngan hang-quy | Ke toan | FINANCE_TREASURY | Doi soat nhap |
| THUNGHIEM_08 | Pho phong Ke toan | Ke toan | FINANCE_MANAGER | Kiem tra tai chinh |
| THUNGHIEM_09 | Truong phong TCHC | TCHC | HR_ADMIN_MANAGER | Quan ly nhan su |
| THUNGHIEM_10 | Pho phong TCHC | TCHC | HR_ADMIN_OFFICER | Kiem tra nhan su |
| THUNGHIEM_11 | Truong phong Dao tao | Dao tao | TRAINING_MANAGER | Quan ly dao tao |
| THUNGHIEM_12 | Nhan vien Dao tao | Dao tao | TRAINING_OFFICER | Du lieu lop/lich |
| THUNGHIEM_13 | Truong khoa | Khoa | FACULTY_MANAGER | Xac nhan du lieu khoa |

## 2. Nguyen tac scope cho pilot

- CTHSSV: chi dung fixture ho so va task CTHSSV.
- Tuyen sinh: chi dung fixture lead/ho so trong segment duoc owner duyet.
- Ke toan: read-only/nhap nhap; khong thanh toan, payout, ghi so chinh thuc.
- TCHC: chi metadata nhan su; khong xem raw student/finance ngoai scope.
- Dao tao: chi lop/lich fixture; khong sua cong no/hoc phi.
- Khoa: chi du lieu khoa duoc giao; khong xem du lieu phong khac.
- Visibility mac dinh de xuat cho nhan vien la `OWN`; manager chi dung
  `TEAM`/`DEPARTMENT` khi owner phe duyet.
- Khong cap `ALL` cho cac alias tren.

## 3. Tuan tu UAT

Khong kich hoat ca 13 tai khoan cung luc. UAT theo ba dot:

| Dot | Alias | Muc tieu |
|---|---|---|
| 1 | THUNGHIEM_01 | CTHSSV synthetic dung/sai scope |
| 2 | THUNGHIEM_03 | Tuyen sinh lead synthetic dung/sai scope |
| 3 | THUNGHIEM_06 | Ke toan read-only, khong mutation tai chinh |
| 4 | THUNGHIEM_02,04,05,07,08,09,10,11,12,13 | Mo rong sau khi dot 1-3 PASS_LOCAL/UAT owner |

Moi dot can owner mapping, evidence ID, audit trace, snapshot truoc/sau va
rollback note.

## 4. Tai khoan hiepdq - phan bien ve "vạn năng"

Khong thiet ke tai khoan/mat khau van nang dung chung cho moi phong. Rủi ro:

- Khong truy vet duoc ai thao tac.
- Mot mat khau lo la mo toan bo he thong.
- Phá vo RLS/RBAC va negative-scope UAT.
- Khong phu hop audit va nguyen tac moi nguoi mot tai khoan.

Phuong an an toan:

1. `hiepdq@heuschool.edu.vn` giu mot Auth account ca nhan.
2. Gan role BGH/ADMIN chi theo owner decision da ghi evidence.
3. Dung che do **UAT persona/switch view** co thoi han, log actor va log
   persona, khong doi danh tinh Auth va khong cap them quyen that.
4. Moi persona chi duoc xem fixture synthetic va tu dong het han.
5. Khong luu mat khau trong Git/Codex/chat; dung Supabase recovery/invite
   qua kenh bao mat do owner quan ly.

Neu chua co UAT persona runtime, dung 13 tai khoan synthetic rieng thay vi
mo mot tai khoan van nang.

## 5. Dieu kien chuyen sang provisioning

Chi tao/link tai khoan khi:

- owner xac nhan position/department/role;
- IT_DATA xac nhan permission va scope;
- Audit xac nhan audit trace va negative cases;
- co Evidence ID khong PII;
- user bat dau `INACTIVE`;
- co rollback disable/unlink;
- khong gui thong tin dang nhap qua Codex/chat.

## 6. Ket luan

- Position master 13 alias: `DAT_TAM_THOI` cho mapping synthetic.
- Tai khoan van nang: `NO_GO`.
- Provisioning that: `NO_GO_UNTIL_OWNER_SCOPE_REVIEW`.
- Task tiep theo: `HEU-USER-016-SYNTHETIC-ACCOUNT-ONE-USER-UAT`.
