# HEU-USER-014 - Runbook sua User/Scope tung buoc

Task ID: HEU-USER-014-SCOPE-REPAIR-POST-DECISION-READINESS
Version: 2026-07-14
Status: DRAFT_CONTROL
Production: NO-GO

## 1. Muc dich

Huong dan IT_DATA/ADMIN xu ly mapping:

`Auth -> user profile -> position -> role -> department -> workspace -> scope`

Runbook nay dung cho du lieu synthetic hoac du lieu that da duoc owner phe
duyet. Khong ghi password, OTP, reset link, invite link, token, UUID, CCCD,
phone, bank data hay raw student data vao Git/Codex/chat.

## 2. Chuan bi truoc khi thao tac

### 2.1 Mo dung app

- App root: `http://localhost:3000/settings/scopes`
- Pilot worktree: `http://localhost:3010/settings/scopes`
- Chi dung origin da duoc owner/IT_DATA xac nhan.
- Kiem tra banner/email dang nhap de tranh sua nham moi truong.

### 2.2 Tao ma evidence

Evidence ID chi la ma tham chieu, vi du:

```text
P0-17-SCOPE-20260714-01
P0-17-SCOPE-20260714-02
P0-17-SCOPE-20260714-03
```

Khong dung email, ten that, mat khau, link reset hoac secret lam Evidence ID.

### 2.3 Khoa pham vi pilot

Chi duoc dung hai segment:

```text
TC9_TTGDTX_LINKED
TC9_ONSITE_HEU
```

Khong chon:

```text
UNIVERSITY_TRANSFER_HOU
UNIVERSITY_TRANSFER_OTHER
SHORT_UNEMPLOYMENT_SUPPORT
SHORT_ONSITE_HEU
```

## 3. Thu tu xu ly mot user

Xu ly tung user mot, khong sua hang loat.

### Buoc 1 - Kiem tra danh tinh ky thuat

1. Vao **Kiem soat he thong -> Pham vi user**.
2. Tim user bang nhan owner-side, khong dan mat khau.
3. Kiem tra Auth link, trang thai ACTIVE/INACTIVE va profile.
4. Neu Auth link sai hoac user khong dung moi truong: dung `NO_GO`.

Vi du synthetic:

```text
UAT_TUYEN_SINH_01
Role: TUYEN_SINH_OPERATOR
Department: TUYEN_SINH
Segment: TC9_TTGDTX_LINKED
```

### Buoc 2 - Kiem tra vi tri va role

Kiem tra 4 truong phai khop:

| Truong | Vi du hop le |
|---|---|
| Vi tri | TUYEN_SINH_OPERATOR |
| Role | TUYEN_SINH |
| Phong ban | TUYEN_SINH |
| Quan ly | Truong phong tuyen sinh da xac nhan |

Neu role va phong ban khong khop, khong tu sua theo suy doan; ghi exception
va chuyen owner review.

### Buoc 3 - Chon Lead visibility

| Tinh huong | Lua chon |
|---|---|
| Nhan vien chi xu ly lead cua minh | `OWN` |
| To truong/nhom truong | `TEAM` |
| Truong/phó phong | `DEPARTMENT` |
| BGH | Dashboard read-only theo policy |
| User thuong | Khong duoc chon `ALL` |

Vi du:

```text
UAT_TUYEN_SINH_01 -> OWN
TUYEN_SINH_TEAM_LEAD -> TEAM
TUYEN_SINH_HEAD -> DEPARTMENT
```

### Buoc 4 - Chon Business scope

Chi chon segment da duoc owner duyet.

Vi du:

```text
UAT_TUYEN_SINH_01 -> TC9_TTGDTX_LINKED
UAT_TUYEN_SINH_ONSITE_01 -> TC9_ONSITE_HEU
```

Khong chon ca hai segment neu nhiem vu chi phuc vu mot segment. Khong mo
partner scope neu chua co owner va hop dong/can cu.

### Buoc 5 - Chon Workspace

Workspace phai nam trong business scope cua user.

Vi du sai:

```text
Scope: TC9_TTGDTX_LINKED
Workspace: UNIVERSITY_TRANSFER_HOU
Ket qua: NO_GO
```

Vi du dung:

```text
Scope: TC9_TTGDTX_LINKED
Workspace: TTGDTX 9+ lien ket
Ket qua: cho phep test pilot
```

### Buoc 6 - Gan quan ly

Chi gan nguoi quan ly khi:

- Cung phong ban hoac co quan he quan ly hop le.
- Owner phong ban da xac nhan.
- Khong tao vong quan ly.
- Khong gan ADMIN lam quan ly mac dinh cho moi user.

### Buoc 7 - Ghi owner decision

Truoc khi bam Luu, ghi vao kenh quan tri an toan:

```text
Safe label: UAT_TUYEN_SINH_01
Visibility: OWN
Business scope: TC9_TTGDTX_LINKED
Workspace: TTGDTX 9+ lien ket
Position: TUYEN_SINH_OPERATOR
Owner reviewer: OWNER_TUYEN_SINH
Evidence ID: P0-17-SCOPE-20260714-01
Decision: APPROVED_FOR_PILOT_READONLY
```

### Buoc 8 - Luu mot user

1. Tich checkbox xac nhan owner decision.
2. Nhap Evidence ID.
3. Bam **Luu/Cập nhật**.
4. Tai lai trang.
5. Kiem tra lai visibility, scope, workspace va role.
6. Khong chuyen user sang ACTIVE pilot neu chua co UAT.

## 4. Xu ly 8 user thieu scope

Dung 8 nhan an toan do checker tao. Khong tu suy ra email:

| Nhom | Visibility can chon | Scope can chon |
|---|---|---|
| TCHC_LEAD | TEAM/DEPARTMENT theo owner | Khong gan lead scope neu khong phuc vu tuyen sinh |
| DAO_TAO_LEAD | TEAM/DEPARTMENT theo owner | Chi segment duoc phep neu co nghiep vu lien quan |
| IT_DATA_HEAD | DEPARTMENT hoac policy IT_DATA | Khong tu cap ALL lead |
| PILOT_ACCOUNTING_LEAD_READONLY | DEPARTMENT read-only | Chi scope tai chinh duoc owner phe duyet |
| PILOT_ACCOUNTING_READONLY | OWN/TEAM read-only | Khong mo scope tuyen sinh ngoai nhiem vu |
| ACCOUNTING_LEAD | DEPARTMENT theo owner KHTC | Finance scope; khong tu mo HOU |

Day la khung tham khao, khong phai phe duyet tu dong. Neu khong co owner,
giu user `INACTIVE` hoac `NO_GO`.

## 5. Xu ly 10 position chua co owner

Mo **Ma tran vi tri/Owner queue** va xu ly tung ma:

```text
PHT_01
CTHSSV_HEAD
KE_TOAN_TRUONG
AUDIT_HEAD
IT_DATA_HEAD
KHOA_HEAD
NGAN_HAN_HEAD
TCHC_VAN_THU_LUU_TRU
TCHC_HANH_CHINH_NHAN_SU
TCHC_CSVC_TAI_SAN
```

Moi ma phai co mot trong hai ket qua:

- `OWNER_CONFIRMED`: co user, phong, role va owner evidence.
- `BLOCKED/DEFERRED`: co ly do, owner chiu trach nhiem va ngay xem lai.

Khong gan tam mot user vao nhieu vi tri neu khong co quyet dinh kiem nhiem.

## 6. Xu ly permission gap

Tai **Cau hinh -> Ma tran quyen**:

1. Loc theo position code.
2. Xem permission dang thieu.
3. Doi chieu nhiem vu thuc te.
4. Cap quyen toi thieu.
5. Khong cap `system.manage`, `users.create` hoac
   `permission_matrix.manage` cho user van hanh thong thuong.
6. Ghi Evidence ID va owner reviewer.
7. Kiem tra lai role/permission mismatch.

## 7. Kiem tra sau moi nhom 1-3 user

Chay tren worktree canonical:

```powershell
Set-Location -LiteralPath "D:\Web app HEU\heu-admission-crm\.codex\worktrees\heu-framework-architecture-freeze-v1"

npm.cmd run check:heu-permission-scope-readiness
npm.cmd run check:heu-user-scope-baseline-repair-queue
npm.cmd run check:heu-position-assignment-owner-queue
npm.cmd run check:heu-settings-permission-matrix-readiness
```

Chi tiep tuc neu cac chi so khong xau di. Neu checker fail moi, dung va ghi
exception; khong cap quyen rong hon de lam xanh checker.

## 8. Negative UAT sau khi scope dong

Dung tai khoan synthetic, khong dung mat khau trong tai lieu.

| Case | Ket qua mong doi |
|---|---|
| User mo dung segment | `ALLOWED` |
| User mo segment khac | `BLOCKED` hoac `EMPTY_SCOPED_STATE` |
| User sua query workspace | Scope khong mo rong |
| User thu xem finance | Chi read-only neu duoc phep |
| User thu mo HOU | `BLOCKED` trong pilot |
| User thu dung `ALL` | Bi tu choi/khong co quyen |

Khong chuyen sang Task Center neu negative UAT chua co ket qua.

## 9. Rollback

Neu gan sai scope:

1. Dung truy cap user do.
2. Khong xoa profile hoac audit row.
3. Dua scope ve trang thai an toan da owner duyet hoac `INACTIVE`.
4. Ghi exception va Evidence ID.
5. Chay lai checker.
6. Kiem tra audit log va negative UAT.

Khong rollback bang hard-delete va khong sua truc tiep database bang SQL tu
Codex/chat.

## 10. Dieu kien chuyen sang Task Center

Chi chuyen khi:

```text
missing_visibility = 0
missing_business_scope = 0
workspace_mismatch = 0
non_admin_all_visibility = 0
permission_coverage_gaps = 0
assignment_missing_user = 0
manager_mismatch = 0 hoac co exception owner ro rang
```

Can them snapshot truoc/sau, audit trace, Evidence ID va UAT dung/sai scope.

Ket luan hien tai: `CAN_SUA`; Task Center: `NO_GO_UNTIL_SCOPE_CLOSED`;
Production: `NO_GO`.
