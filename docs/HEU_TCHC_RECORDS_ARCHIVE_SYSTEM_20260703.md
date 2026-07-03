# HEU TCHC Records Archive System - 2026-07-03

Status: DRAFT_CONTROL
Production status: NO-GO
Owner lane: TCHC + PHAP_CHE + BGH + Audit + IT_DATA

## 1. Muc dich

Lop nay bien vi tri `TCHC_VAN_THU_LUU_TRU` thanh mot he thong van thu luu tru
co cau truc:

- So van ban den/di/noi bo theo metadata an toan.
- Danh muc ho so luu tru, hop, ke, thoi han bao quan va trang thai so hoa.
- Hang doi ban giao/xu ly ho so giua TCHC va cac phong ban.
- Man hinh doc-only de BGH/TCHC/PHAP_CHE/Audit nhin nhanh trang thai.

Day la data foundation va cockpit doc-only. Chua phai he thong phe duyet van ban,
chua chap nhan evidence, chua cho huy/di chuyen file va chua production GO.

## 2. SQL objects

| Object | Vai tro |
|---|---|
| `heu_tchc_document_register` | So van ban den/di/noi bo, chi luu metadata an toan |
| `heu_tchc_archive_register` | Danh muc ho so luu tru, hop/ke, thoi han bao quan, so hoa |
| `heu_tchc_archive_handover_register` | Hang doi ban giao/xu ly ho so giua vi tri/phong ban |
| `heu_tchc_records_archive_dashboard` | View tong hop read-only cho cockpit |

## 3. Truong thong tin toi thieu

### Van ban den/di

| Nhom | Truong |
|---|---|
| Dinh danh | `document_code`, `direction`, `document_number_safe` |
| Noi dung an toan | `title_safe`, `issuing_unit_safe`, `receiving_unit_code` |
| Thoi gian | `document_date`, `received_or_sent_at`, `due_date` |
| Xu ly | `owner_position_code`, `handler_position_code`, `document_status` |
| Kiem soat | `confidentiality_level`, `evidence_ref_code`, `legal_gate_code`, `control_status` |

### Ho so luu tru

| Nhom | Truong |
|---|---|
| Dinh danh | `archive_code`, `archive_title_safe`, `archive_domain`, `archive_category` |
| Vi tri vat ly | `shelf_code`, `box_code`, `folder_code` |
| Thoi han | `retention_rule_code`, `retention_until` |
| So hoa | `digitization_status`, `evidence_ref_code` |
| Kiem soat | `confidentiality_level`, `legal_gate_code`, `control_status` |

### Ban giao/xu ly

| Nhom | Truong |
|---|---|
| Dinh danh | `handover_code`, `item_type`, `source_item_code` |
| Tuyen xu ly | `from_position_code`, `to_department_code`, `to_position_code` |
| Dieu hanh | `handover_reason`, `due_date`, `handover_status` |
| Kiem soat | `evidence_ref_code`, `legal_gate_code`, `control_status` |

## 4. Legal/SOP gates

| Gate | Ap dung |
|---|---|
| `TCHC-LEGAL-01` | Cong van den/di, so van ban, ban giao xu ly |
| `TCHC-LEGAL-02` | Ho so luu tru, thoi han bao quan, so hoa, huy/di chuyen |
| `SOP_TCHC_VAN_THU_LUU_TRU` | SOP van thu luu tru can PHAP_CHE cap nhat va ky |

## 5. Stop conditions

- Khong luu raw Drive link, file goc, voucher, CCCD, hop dong nhay cam, password,
  OTP hoac noi dung van ban mat vao chat/repo.
- Khong hien raw database error ra UI; neu insert metadata bi chan thi chi hien
  ma kiem soat `TCHC_RECORDS_ARCHIVE_INTAKE_UNAVAILABLE`.
- Khong huy, di chuyen, xoa ho so neu chua co SOP va legal signoff.
- Khong coi `heu_tchc_records_archive_dashboard` la so van thu chinh thuc khi
  `control_status` con `DRAFT_CONTROL`.
- Khong dung PASS_LOCAL thay cho PHAP_CHE approval, UAT, owner GO hoac production GO.

## 6. Cach dung trong app

Route read-only: `/tchc/records-archive`
Draft intake route: `/tchc/records-archive/intake`

Nguoi dung nhin nhanh:

1. So van ban den/di co bao nhieu viec dang mo, qua han, bi chan.
2. Ho so luu tru dang o trang thai nao, da so hoa metadata hay chua.
3. Hang doi ban giao/xu ly ho so co viec nao qua han.
4. Cac stop rule bat buoc truoc khi thao tac voi file goc.

## 7. Nhap metadata an toan

`/tchc/records-archive/intake` la draft metadata intake. Route nay chi cho
ghi metadata an toan vao bang step118, voi `control_status = DRAFT_CONTROL`.
Chua upload file, chua ghi raw Drive link, chua phe duyet, chua huy/di chuyen
ho so va chua production GO.

| Template | Muc dich | Trang thai |
|---|---|---|
| `DOCUMENT_METADATA` | Van ban den/di/noi bo | Draft insert only |
| `ARCHIVE_METADATA` | Ho so luu tru, ke/hop, thoi han, so hoa | Draft insert only |
| `HANDOVER_METADATA` | Ban giao/xu ly ho so giua phong ban | Draft insert only |

SQL bo sung can chay sau step118:

- `database/step119_tchc_records_archive_intake_audit.sql`
- Mo function `can_intake_tchc_records_archive()`.
- Mo insert policy cho TCHC/admin/master-control.
- Gan `write_audit_log()` trigger cho 3 bang.

Dieu kien van bi chan:

1. PHAP_CHE ky `SOP_TCHC_VAN_THU_LUU_TRU` va gate `TCHC-LEGAL-01/02`.
2. TCHC chot ma van ban, ma ho so, ma ke/hop va thoi han bao quan.
3. IT_DATA chay step119 de mo policy, audit trigger va duplicate guard theo ma.
4. Audit/BGH xac nhan UAT; PASS_LOCAL khong tu dong thanh GO.

## 8. Next controlled slice

Sau khi chay `database/step118_tchc_records_archive_system.sql`:

1. Kiem tra route `/tchc/records-archive` load duoc.
2. Kiem tra route `/tchc/records-archive/intake` load duoc.
3. PHAP_CHE cap nhat can cu that cho `SOP_TCHC_VAN_THU_LUU_TRU`.
4. TCHC xac nhan mau so van ban, ma hop/ke, rule thoi han bao quan.
5. Moi mo lat tiep theo: cap nhat/sua metadata co audit log va permission scope.
