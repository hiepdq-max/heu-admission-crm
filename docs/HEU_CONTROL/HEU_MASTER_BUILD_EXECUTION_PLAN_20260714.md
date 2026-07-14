# HEU Master Build Execution Plan

Task ID: HEU-FRAMEWORK-001
Version: 2026-07-14
Status: DRAFT_CONTROL
Production: NO-GO
Canonical worktree: `codex/heu/framework-architecture-freeze-v1`

## 1. Muc tieu duy nhat

Xay dung mot ung dung HEU chinh theo mo hinh modular monolith, dung chung
database, phan quyen theo `user -> vi tri -> role -> phong ban -> workspace`
va van hanh theo task, scope, audit log va evidence.

Muc tieu van hanh:

- Moi cong viec co nguoi chiu trach nhiem, han xu ly, tien do va canh bao.
- Moi user chi thay dung du lieu va cong viec trong pham vi duoc cap.
- Moi du lieu nen phai duoc phong ban xac nhan truoc khi khoa.
- AI chi check, draft, suggest va canh bao; khong tu phe duyet, chi tien,
  migration, thay doi du lieu that hoac mo production.

## 2. Nguyen tac khong doi

1. Phap ly va SOP truoc Form, Dashboard va Automation.
2. Data Master truoc Workflow; Workflow truoc Dashboard.
3. Moi lan chi lam mot slice nho, mot module, mot owner boundary.
4. Kiem tra worktree truoc khi doc/sua; khong tron dirty scope.
5. Backup va rollback truoc moi thay doi du lieu that.
6. PASS_LOCAL chi la ket qua kiem tra ky thuat, khong phai UAT hay GO.
7. Khong dua password, secret, PII thô, bank data hay raw student data vao
   Git/Codex/chat.
8. HOU va khoa ngan han khong mo trong pilot TTGDTX/HEU.

## 3. Quy trinh lap lai cho tung slice

| Buoc | Viec bat buoc | Dau ra |
|---:|---|---|
| 1 | Khoa muc tieu va scope | Task ID, owner, file/route/database boundary |
| 2 | Kiem tra trang thai live | branch, HEAD, modified, staged, untracked, conflict |
| 3 | Doc tai lieu va checker lien quan | source list, rule, risk, stop condition |
| 4 | Phan bien chuyen mon/phap che/du lieu | PASS, NO_GO hoac BLOCKED; advisory hay owner decision |
| 5 | Sua mot slice nho | diff chi trong scope |
| 6 | Kiem tra focused | checker, lint/build neu co runtime, diff check |
| 7 | Ghi nhat ky va evidence | implementation log, evidence ref metadata, rollback |
| 8 | Review va khoa | DAT_TAM_THOI, CAN_SUA, CHO_BGH_DUYET hoac NO_GO |
| 9 | Chi khi sach scope moi chuyen slice | next task duy nhat |

## 4. Ke hoach tu dau den cuoi

| Giai doan | Ket qua phai dat | Pham vi duoc lam | Dieu kien khoa |
|---:|---|---|---|
| 0 | Nen kiem soat sach | handbook, backlog, PR split, audit scripts, worktree/PR rules | fast loop, git hygiene, implementation log va encoding PASS |
| 1 | Loi user va scope | Auth, user profile, position, role, department, workspace, RBAC/RLS | moi user co mapping ro; test dung/sai scope; owner review |
| 2 | Task Center va Data Confirmation | viec cua toi, viec phong, diem tac, BGH read-only, task history | task co owner/assignee, han, scope, audit trace; chua seed task that neu thieu owner |
| 3 | Du lieu nen an toan | data dictionary, source registry, metadata import, segment pilot | khong raw PII; DQ check; source/evidence ref; rollback |
| 4 | Pilot read-only | mot tai khoan synthetic, sau do mo rong user pilot theo phong | UAT dung/sai scope, khong mutation nguy hiem, evidence ngoai Git |
| 5 | Xac nhan theo phong ban | giao task xac nhan du lieu, sua sai, xac nhan mot lan, khoa | owner phong ban xac nhan; audit log; khong khoa khi con blocker |
| 6 | Module van hanh uu tien | Tuyen sinh, CTHSSV, Ke toan read-only, Dao tao/Khoa | module co workflow, scope, report va UAT; finance khong reliance khi chua signed |
| 7 | Dieu hanh va tai chinh co kiem soat | BGH dashboard read-only, Finance Desk, HOU tach rieng | source reconciliation, legal/SOP, finance owner review; HOU khong gop vao HEU |
| 8 | UAT tong the va staging | regression, backup/restore, rollback, evidence binder, owner signoff | tat ca gate ky thuat va owner lane PASS; migration order duoc ky |
| 9 | Production Gate | staging review va trien khai chinh thuc | BGH/owner GO bang tai lieu ngoai Codex; production moi duoc xem xet |

## 5. Trang thai hien tai

| Khu vuc | Trang thai | Nhan dinh |
|---|---|---|
| Control/docs/checker | DAT_TAM_THOI | Co handbook, backlog, ledger va focused audit; tiep tuc ghi tung slice |
| User/Auth/scope | CAN_SUA | Con profile active thieu lead visibility/business scope va workspace preference |
| Task Center | DAT_TAM_THOI | Route/schema/runtime guard PASS_LOCAL; chua tu dong giao task that |
| Admission segment pilot | DAT_TAM_THOI | Da chuan bi SQL draft cho 2 segment HEU/TTGDTX; SQL chua chay |
| Data Master | CAN_SUA | Chua nhap raw data; can metadata mapping va DQ check |
| Pilot nguoi dung | CHO_BGH_DUYET | Can synthetic UAT va owner lane truoc khi mo rong |
| Finance/HOU | NO_GO | Khong mo rong trong slice admission pilot |
| Production | NO_GO | Chua co signed UAT, evidence, backup/restore, rollback va owner GO |

## 6. Ho so phai ghi cho moi slice

Moi slice phai co mot dong trong implementation log hoac control ledger gom:

- Task ID, ngay, module, branch va HEAD.
- File/route/database object duoc phep sua.
- Owner nghiep vu, IT_DATA, Audit, PHAP_CHE va nguoi phe duyet neu can.
- Rủi ro, phan bien, stop condition va pham vi cam.
- Checker/lint/build da chay va ket qua.
- Evidence ID chi la ma tham chieu, khong chua PII/secret.
- Rollback: revert commit, tat feature, status transition hoac restore theo
  migration plan da duyet.
- Ket luan va task tiep theo nho nhat.

## 7. To chuyen gia kiem tra

| Lane | Kiem tra | Khong duoc tu quyet dinh |
|---|---|---|
| IT_DATA | schema, DQ, RLS, backup, migration order | khong tu mo production |
| Audit | audit trail, evidence, scope leak, rollback | khong chap nhan thay owner |
| Chuyen mon | workflow dung nghiep vu tung phong | khong tu ban hanh SOP |
| PHAP_CHE | hop dong, pham vi, can cu phap ly | khong ket luan thay co quan co tham quyen |
| KHTC/Finance | doi soat, cong no, payment boundary | khong coi dashboard la so ke toan chinh thuc |
| BGH/Owner | UAT, uu tien, GO/NO-GO | chi owner moi duoc quyet dinh chinh thuc |
| Codex/AI | doc, draft, check, bao cao, sua slice duoc cap | khong tu phe duyet, migration, payment, production |

## 8. Quy tac khoa va mo khoa

Sau khi mot slice dat `DAT_TAM_THOI`, giu nguyen commit va khong sua tiep
trong cung scope neu chua co defect moi. Slice chi duoc mo lai khi co:

1. Loi ky thuat co log tai hien.
2. Owner yeu cau thay doi pham vi.
3. Checker moi phat hien regression.
4. Co quyet dinh ro ve rollback hoac patch.

Khong chuyen sang giai doan tiep theo neu bat ky dieu kien nao con `NO_GO`,
`BLOCKED`, thieu owner hoac thieu evidence bat buoc.

## 9. Task tiep theo da khoa

`HEU-ADMISSION-002-SEED-PILOT-TEST-ENV-PREFLIGHT`

Chi duoc lam:

- review SQL draft va schema read-only;
- kiem tra backup/restore evidence metadata;
- lap checklist test environment;
- khong chay SQL, khong migration, khong tao user that, khong mo HOU.

## 10. Ket luan dieu hanh

Ke hoach nay la nguon dieu huong trung tam. Handbook, backlog, module
runbook, PR split register va implementation log van la tai lieu chi tiet
theo tung nhom. Moi thay doi sau nay phai tro ve ke hoach nay de cap nhat
trang thai va chon duy nhat mot task tiep theo.

Ket luan hien tai: `DAT_TAM_THOI` cho control plan; `CHO_IT_DATA_OWNER_APPROVAL`
cho seed pilot; `NO_GO` cho migration, finance reliance, HOU va production.
