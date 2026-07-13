# HEU-FRAMEWORK-001 - Khoa kien truc V1

Task ID: `HEU-FRAMEWORK-001-ARCHITECTURE-FREEZE-V1`

Ngay: 2026-07-13

Trang thai tai lieu: `DRAFT_CONTROL`

Trang thai he thong: `Stage D - internal controlled test only`

Production: `NO-GO`

## 1. Quyet dinh da khoa

Kien truc V1 duoc khoa o muc **du de lap danh muc va nhap du lieu co kiem
soat**, khong tiep tuc mo rong ly thuyet vo han.

Pham vi duoc phep cua task nay:

- Mot ung dung chinh theo mo hinh modular monolith.
- Mot co so du lieu dung chung, tach truy cap bang role, permission,
  workspace va business scope.
- Tai lieu control va metadata-only.
- AI chi duoc draft, check, suggest va summarize.
- Chua migration, chua deploy, chua production, chua nhap du lieu ca nhan tho.

Task nay khong phe duyet UAT, khong chap nhan evidence, khong mo quyen, khong
tao user, khong sua du lieu that va khong thay the quyet dinh cua BGH, owner,
PHAP_CHE, IT_DATA hoac Audit.

## 2. Nguon doi chieu

| Nguon | Vai tro | Ket qua dung trong V1 |
|---|---|---|
| `docs/HEU_CURRENT_STATE_INVENTORY.md` | Hien trang | Stage D; production van NO-GO |
| `docs/HEU_SYSTEM_BUILD_BACKLOG.md` | Thu tu xay dung | Scope-first, PR nho, test nho, rollback ro |
| `docs/HEU_MODULE_READINESS_GAP_MATRIX_20260628_V01_DRAFT.md` | Khoang trong module | Khong suy dien local readiness thanh real-operation readiness |
| `docs/HEU_STANDARD_SYSTEM_BLUEPRINT_20260703.md` | Kien truc lop va module | Owner -> identity/scope -> legal/SOP -> Data Master -> workflow -> report -> audit -> AI advisory |
| Google Drive HEU | Kho tai lieu nguon | Moi kiem ke metadata thu muc cap mot; chua doc noi dung, chua xac minh quyen truy cap tung file |

## 3. Kien truc V1 chuan

| Vung | Muc dich bat buoc | Dau ra toi thieu truoc khi nhap du lieu | Owner lane de xuat |
|---|---|---|---|
| `00_HE_THONG` | Cau hinh, danh muc he thong, quy tac van hanh | Environment register, feature gate, backup/rollback rule | IT_DATA + Audit |
| `01_PHAP_LY_PHAP_CHE` | Can cu phap ly, hop dong, quy che | Legal register, hieu luc, owner, pham vi ap dung | PHAP_CHE + BGH |
| `02_TO_CHUC_NHAN_SU` | Don vi, vi tri, user, tuyen quan ly | Org unit, position, role, permission, workspace mapping | TCHC + IT_DATA |
| `03_DATA_MASTER` | Ma chuan va du lieu goc dung chung | Data dictionary, stable ID, owner, DQ rule, version | IT_DATA + owner nghiep vu |
| `04_WORKFLOW_SOP` | Luong viec, maker/checker/approver | SOP version, status lifecycle, stop rule, audit event | Owner + PHAP_CHE + Audit |
| `05_TUYEN_SINH` | Lead, tu van, ho so, ban giao | Lead/source master, workspace scope, handover gate | TUYEN_SINH |
| `06_CTHSSV` | Tiep nhan va quan ly tinh trang HSSV | Student profile contract, handover confirmation | CTHSSV |
| `07_DAO_TAO_KHOA` | Chuong trinh, lop, lich, khoa/giang vien | Program/class/course master, owner confirmation | DAO_TAO + KHOA |
| `08_TAI_CHINH_CONG_NO` | Cong no, thu, doi soat, thanh toan | Policy, status, evidence class, maker/checker/approver | KHTC + Audit |
| `09_DASHBOARD_BAO_CAO` | Bao cao va read model | Source map, DQ status, refresh rule, owner signoff | IT_DATA + owner bao cao |
| `10_AI_AGENT_AUTOMATION` | Kiem tra, canh bao, soan nhap | Allowlist input/output, cost guard, kill switch, audit log | IT_DATA + Audit |
| `11_AUDIT_KIEM_SOAT` | Log, evidence metadata, risk, rollback | Audit event contract, evidence ID, retention, reviewer | Audit + IT_DATA |
| `99_BACKUP_ARCHIVE` | Ban sao, luu tru, phuc hoi | Retention, restore owner, checksum/evidence metadata | IT_DATA + Audit |

## 4. Anh xa thu muc Drive hien tai

Kiem ke metadata cap mot da nhan dien 12 thu muc. Bang nay chi anh xa; **khong
doi ten, di chuyen, sao chep hoac doc sau noi dung** trong task nay.

| Thu muc Drive hien tai | Vung V1 dich | Ket luan | Hanh dong truoc khi doc sau |
|---|---|---|---|
| `00_HE_THONG` | `00_HE_THONG` | Khop | Lap file inventory metadata |
| `01_PHAP_LY_PHAP_CHE` | `01_PHAP_LY_PHAP_CHE` | Khop | PHAP_CHE xac dinh muc do nhay cam |
| `02_TO_CHUC_NHAN_SU` | `02_TO_CHUC_NHAN_SU` | Khop | Chi metadata; cam tai raw PII vao Codex/Git |
| `03_DATA_MASTER` | `03_DATA_MASTER` | Khop | Chot Data Dictionary va source-of-truth |
| `04_WORKFLOW_SOP` | `04_WORKFLOW_SOP` | Khop | Chot SOP owner va version |
| `05_DAO_TAO` | `07_DAO_TAO_KHOA` | Lech ma/ten | Lap mapping, chua doi ten thu muc |
| `06_CTHSSV` | `06_CTHSSV` | Khop | Owner phan loai dataset |
| `08_DAO_TAO_NGAN_HAN_DAY_NGHE` | `07_DAO_TAO_KHOA` hoac module Short Course duoc duyet sau | Xung dot chi muc `08` | Tach nghiep vu tren register, chua di chuyen file |
| `09_DASHBOARD_BAO_CAO` | `09_DASHBOARD_BAO_CAO` | Khop | Doi chieu source map; dashboard khong doc raw file |
| `10_AI_AGENT_AUTOMATION` | `10_AI_AGENT_AUTOMATION` | Khop ten, chua duoc mo runtime | Chi policy/blueprint/checker metadata |
| `11_AUDIT_KIEM_SOAT` | `11_AUDIT_KIEM_SOAT` | Khop | Chi metadata evidence; khong dua evidence tho vao Git/chat |
| `99_BACKUP_ARCHIVE` | `99_BACKUP_ARCHIVE` | Khop | Khong doc/nhap trong inventory nghiep vu |
| Chua co thu muc rieng | `05_TUYEN_SINH` | Thieu | Tim nguon bang metadata, khong tu tao/di chuyen |
| Chua co thu muc rieng | `08_TAI_CHINH_CONG_NO` | Thieu | Cho KHTC + PHAP_CHE + Audit chot pham vi |

## 5. Lop du lieu va quy tac xu ly

| Lop | Vi du | Duoc lam trong giai doan inventory | Cam/stop rule |
|---|---|---|---|
| `PUBLIC` | Mau bieu cong khai, thong tin chuong trinh cong khai | Doc metadata va noi dung khi owner cho phep | Khong suy dien thanh chinh sach dang hieu luc |
| `INTERNAL` | SOP noi bo, danh muc module, bao cao tong hop | Doc metadata; noi dung theo allowlist | Khong chia se ngoai scope |
| `RESTRICTED` | Ho so nhan su/hoc sinh, hop dong, tai chinh, evidence | Chi metadata da toi thieu va ID da kiem soat | Khong dua raw PII, bank, payment, salary vao AI/Git/chat |
| `SECRET` | Mat khau, token, OTP, service-role key, private key | Khong doc, khong lap danh muc gia tri | Dung ngay va bao IT_DATA neu phat hien |
| `ARCHIVE` | Backup, snapshot, ban cu | Chi ghi ten, ngay, owner, retention neu duoc phep | Khong import vao nghiep vu, khong coi la source-of-truth |

Metadata toi thieu duoc phep ghi:

- `source_id`, `source_name`, `source_folder`, `file_type`.
- `business_domain`, `proposed_owner_lane`, `sensitivity_class`.
- `document_date`, `version_label`, `status`, `duplicate_group_ref`.
- `proposed_master_object`, `proposed_workflow`, `next_action`.

Khong ghi vao register: ten hoc sinh/nhan su, email ca nhan, so dien thoai,
CCCD, dia chi, so tai khoan, so tien giao dich chi tiet, mat khau, token, OTP,
link invite/reset hoac noi dung evidence tho.

## 6. Dieu kien de mot dataset duoc nhap

Mot dataset chi duoc dua vao staging import khi dat du 10 gate:

| Gate | Dieu kien | Owner xac nhan |
|---|---|---|
| `IMP-01` | Co `dataset_id` on dinh va ten nghiep vu ro | IT_DATA |
| `IMP-02` | Co source-of-truth va source owner | Owner nghiep vu |
| `IMP-03` | Co Data Dictionary, khoa chinh va quy tac trung | IT_DATA + owner |
| `IMP-04` | Co phan loai nhay cam va can cu xu ly | PHAP_CHE + Audit |
| `IMP-05` | Co module/workspace dich va role doc/ghi | IT_DATA + owner |
| `IMP-06` | Co quy tac chuan hoa, validation va reject | IT_DATA |
| `IMP-07` | Co ban preview/doi soat, khong ghi thang production | Owner + Audit |
| `IMP-08` | Co backup, rollback va import batch ID | IT_DATA + Audit |
| `IMP-09` | Co test du lieu gia lap/da an danh | IT_DATA + owner |
| `IMP-10` | Co xac nhan phien ban dataset | Owner duoc chi dinh |

Neu thieu bat ky gate nao: `NO_GO_IMPORT`.

## 7. Hop dong xac nhan du lieu nen

Khong dung co che "xac nhan mot lan vinh vien". Moi xac nhan gan voi mot
phien ban dataset va se het hieu luc khi noi dung quan trong thay doi.

Truong metadata bat buoc:

| Truong | Y nghia |
|---|---|
| `dataset_id` | Ma dataset on dinh |
| `dataset_version` | Phien ban/ky du lieu dang xac nhan |
| `content_fingerprint` | Hash/checksum hoac fingerprint metadata, khong chua du lieu tho |
| `owner_position_code` | Vi tri co tham quyen xac nhan |
| `confirmation_status` | `CHO_XAC_NHAN`, `DUNG`, `CAN_SUA`, `KHONG_THUOC_TOI`, `DA_KHOA` |
| `confirmed_by_user_id` | ID user noi bo; khong ghi email/PII vao tai lieu Git |
| `confirmed_at` | Thoi diem xac nhan |
| `confirmation_note_ref` | Tham chieu ghi chu/evidence metadata duoc kiem soat |
| `supersedes_version` | Phien ban cu bi thay the |
| `reconfirm_reason` | Ly do bat buoc xac nhan lai |

Bat buoc xac nhan lai khi:

- Thay source file, source owner hoac Data Dictionary.
- Thay khoa chinh, mapping, quy tac chuan hoa hoac quy tac tinh.
- Them/xoa ban ghi vuot nguong owner quy dinh.
- Thay legal/SOP/policy lam anh huong cach hieu du lieu.
- Thay workspace, role/permission hoac muc dich su dung.
- Phat hien duplicate, sai lech, data leakage hoac audit finding nghiem trong.

Xac nhan dataset khong dong nghia voi UAT, evidence acceptance, finance
reliance, legal approval, owner GO/NO-GO hoac production GO.

## 8. RACI toi thieu

| Hoat dong | R | A | C | I |
|---|---|---|---|---|
| Inventory metadata Drive | IT_DATA | BGH | Owner + Audit | PHAP_CHE |
| Phan loai nhay cam | Audit + IT_DATA | PHAP_CHE | Owner | BGH |
| Chot source-of-truth | Owner nghiep vu | BGH/nguoi duoc uy quyen | IT_DATA + Audit | User lien quan |
| Data Dictionary/mapping | IT_DATA | Owner nghiep vu | Audit | BGH |
| Preview import an danh | IT_DATA | Owner nghiep vu | Audit + PHAP_CHE | BGH |
| Xac nhan dataset version | User dung vi tri | Owner nghiep vu | IT_DATA + Audit | BGH |
| Production Gate | IT_DATA + Audit | BGH/Hieu truong | PHAP_CHE + owners | Cac phong |

## 9. Thu tu trien khai sau khi khoa V1

| Buoc | Task de xuat | Dau ra | Stop rule |
|---|---|---|---|
| 1 | `HEU-DATA-DRIVE-001-METADATA-INVENTORY` | Danh muc metadata cap thu muc/file, khong noi dung nhay cam | Khong doc `99_BACKUP_ARCHIVE`; dung khi gap secret/raw PII |
| 2 | `HEU-DATA-DRIVE-002-SOURCE-OF-TRUTH-TRIAGE` | Duplicate group, source owner, canonical candidate | Khong xoa/di chuyen file |
| 3 | `HEU-DATA-MASTER-001-DICTIONARY-AND-MAPPING` | Data Dictionary va mapping module | Chua tao migration |
| 4 | `HEU-DATA-IMPORT-001-ANONYMIZED-PREVIEW` | Preview import bang du lieu gia lap/da an danh | Khong ghi production |
| 5 | `HEU-DCTC-001-VERSIONED-CONFIRMATION-PILOT` | Task xac nhan dataset theo position/version | Khong auto-approve, khong auto-lock |
| 6 | `HEU-UAT-001-DEPARTMENT-PILOT` | UAT dung/sai scope theo phong | Can account, evidence va rollback duoc duyet |
| 7 | `HEU-PRODUCTION-001-GATE` | Goi quyet dinh co evidence | Codex khong duyet production |

## 10. Rủi ro va rollback

| Rui ro | Kiem soat |
|---|---|
| Xay ly thuyet tran lan | Freeze V1; yeu cau change request cho kien truc moi |
| Doc Drive qua rong | Inventory metadata truoc, allowlist sau |
| Nhap nham backup/ban cu | `ARCHIVE` khong duoc coi la source-of-truth |
| Trung/ghi de du lieu | Preview + duplicate rule + import batch ID |
| User xac nhan nham pham vi | Position/workspace gate + negative-access test |
| Xac nhan cu van con hieu luc | Dataset version + fingerprint + reconfirm trigger |
| AI lam thay owner | AI advisory only; human confirmation required |

Rollback cua task docs-only: revert commit/PR cua hai tai lieu control. Khong
co database, user, Drive file hoac du lieu nghiep vu nao can rollback.

## 11. SOP Slice Result Record

`SOP-SCOPE`: `HEU-FRAMEWORK-001`; docs/control-only; metadata-only.

`SOP-CHECK`: Kien truc V1 va anh xa Drive cap mot duoc ghi thanh register.

`SOP-PROFESSIONAL`: Owner tung module phai chot source-of-truth va Data Dictionary; `DRAFT_CONTROL`.

`SOP-LEGAL`: PHAP_CHE phai xac nhan can cu va phan loai nhay cam; `NO_GO` cho real-data reliance.

`SOP-LOGIC`: IT_DATA + Audit phai kiem tra mapping, duplicate, scope, version va rollback; `DRAFT_CONTROL`.

`SOP-VERIFY`: Git hygiene va Vietnamese text encoding `PASS`; current-state inventory `NO_GO` do nam baseline item con thieu ngoai scope; khong runtime, DB, Drive content hoac production.

`SOP-RESULT`: `CAN_SUA`; register du dieu kien de Draft review nhung chua du dieu kien ghi `DAT_TAM_THOI`.

`SOP-NEXT`: IT_DATA + Audit review register va dong bo current-state inventory; sau do moi mo `HEU-DATA-DRIVE-001-METADATA-INVENTORY` o che do chi metadata.

### Local verification 2026-07-13

| Check | Ket qua | Ghi chu |
|---|---|---|
| `git diff --check` | `PASS` | Khong loi whitespace |
| `npm.cmd run audit:heu-git-hygiene` | `PASS` | Scope stage chi gom hai file docs/control |
| `npm.cmd run audit:heu-vietnamese-text-encoding` | `PASS` | Khong phat hien mojibake |
| `npm.cmd run audit:heu-current-state-inventory` | `NO_GO` | Baseline con thieu M02 temporary-password state, M05 P3-01/P3-02, Short Course gap pack, P6-04 route matrix va AI advisory-only state; khong sua trong task docs-only nay |

## 12. Ket luan

- Architecture V1: `CAN_SUA`; Draft review duoc phep, chua dat tam thoi.
- Drive content review: `CHUA_KIEM`.
- Data import: `NO_GO_IMPORT`.
- UAT/real operation: `NO_GO`.
- Production: `NO-GO`.
