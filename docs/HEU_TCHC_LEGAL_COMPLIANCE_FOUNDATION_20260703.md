# HEU TCHC Legal Compliance Foundation - 2026-07-03

Status: DRAFT_CONTROL
Production status: NO-GO
Owner lane: PHAP_CHE + TCHC + BGH + IT_DATA + Audit

## 1. Muc dich

Tai lieu nay thiet lap chuan phap che nen cho Phong To chuc hanh chinh
(TCHC). Muc tieu la tao gate truoc khi TCHC van hanh workflow, report view,
dashboard hoac AI ho tro.

Day khong phai ket luan phap ly. Cac dong `LEGAL_TCHC_*_REVIEW_REQUIRED` la
placeholder bat buoc Phap che cap nhat bang van ban/can cu chinh thuc truoc khi
chuyen sang `DAT` hoac `SIGNED_OFF`.

## 2. Chuoi kiem soat bat buoc

Thu tu dung:

`Vi tri TCHC -> Legal review -> SOP -> Evidence class -> Data boundary -> Report contract -> Decision gate -> Owner signoff -> UAT -> dashboard/readiness`

Khong duoc di thang tu report/dashboard sang ket luan van hanh.

## 3. Nhung mảng phap che TCHC

| Domain | Legal placeholder | SOP | Evidence class mac dinh |
|---|---|---|---|
| Van thu - luu tru | `LEGAL_TCHC_VAN_THU_LUU_TRU_REVIEW_REQUIRED` | `SOP_TCHC_VAN_THU_LUU_TRU` | `CONFIDENTIAL` |
| Hanh chinh nhan su | `LEGAL_TCHC_HANH_CHINH_NHAN_SU_REVIEW_REQUIRED` | `SOP_TCHC_HANH_CHINH_NHAN_SU` | `SENSITIVE_PII` |
| CSVC - tai san | `LEGAL_TCHC_CSVC_TAI_SAN_REVIEW_REQUIRED` | `SOP_TCHC_CSVC_TAI_SAN` | `INTERNAL` / `FINANCE_EVIDENCE` |
| Hau can - an ninh - y te | `LEGAL_TCHC_HAU_CAN_AN_NINH_Y_TE_REVIEW_REQUIRED` | `SOP_TCHC_HAU_CAN_AN_NINH_Y_TE` | `CONFIDENTIAL` / `HEALTH_SENSITIVE` |
| Bao cao TCHC | `LEGAL_TCHC_REPORT_PRIVACY_REVIEW_REQUIRED` | `SOP_TCHC_REPORT_PRIVACY` | `CONFIDENTIAL` |

## 4. SQL objects

| Object | Vai tro |
|---|---|
| `legal_registry` | Ghi placeholder/can cu phap che TCHC |
| `sop_registry` | Ghi SOP TCHC can Phap che/BGH duyet |
| `heu_tchc_legal_compliance_requirements` | Ma tran compliance theo tung domain/report/position |
| `decision_gates` | Gate PHAP_CHE cho tung compliance item |
| `heu_tchc_legal_compliance_status` | View read-only de xem trang thai phap che TCHC |

## 5. Gate khong duoc bo qua

Moi compliance item phai co:

- `legal_code`: can cu phap che hoac placeholder can Phap che xac nhan.
- `sop_code`: SOP noi bo can ban hanh/duyet.
- `report_code`: report TCHC bi rang buoc.
- `evidence_class`: lop nhay cam cua du lieu.
- `retention_gate`: quy tac luu tru/huy/doi chieu can ky.
- `data_boundary`: du lieu nao duoc vao report, du lieu nao khong duoc vao.
- `stop_condition`: dieu kien dung van hanh.
- `decision_gate`: gate `GATE_TCHC-LEGAL-*` do PHAP_CHE kiem.

## 6. Stop conditions

- Khong dua raw CCCD, hop dong lao dong, ho so nhan su, benh an, camera/raw incident, sao ke, voucher, password, OTP, reset link hoac file goc nhay cam vao chat/Git/report.
- Khong dung report TCHC de phe duyet nhan su, luong, ky luat, tai san, mua sam, sua chua, thanh toan, y te hoac ket luan phap ly.
- Khong cho AI doc du lieu raw TCHC khi `ai_allowed = false`.
- Khong tu dong hoa workflow TCHC khi `automation_allowed = false`.
- Khong chuyen `LEGAL_READY` neu `legal_status`, `legal_registry`, `sop_registry` hoac `decision_gates` chua du dieu kien.
- PASS_LOCAL khong phai legal approval, SOP ban hanh, UAT acceptance, evidence acceptance, owner GO hoac production GO.

## 7. Dieu kien de chuyen tung muc sang READY_FOR_UAT

1. PHAP_CHE cap nhat legal basis chinh thuc trong `legal_registry`.
2. TCHC owner xac nhan SOP nghiep vu.
3. IT_DATA/Audit xac nhan data boundary va report view khong ro ri PII.
4. BGH/TCHC owner ky decision gate ngoai Git/Codex/chat.
5. Moi chuyen `legal_status` tu `LEGAL_REVIEW_REQUIRED` sang `READY_FOR_UAT`.

## 8. Dieu kien de chuyen SIGNED_OFF

Chi chuyen `SIGNED_OFF` khi co:

- Legal basis chinh thuc da `DAT`.
- SOP da `DAT`.
- Gate `APPROVED`.
- Evidence redaction class va retention route da duoc ky.
- UAT co ket qua va chu ky nguoi duyet ben ngoai Git/Codex/chat.

## 9. Next controlled slice

Sau khi chay `database/step117_tchc_legal_compliance_foundation.sql`, kiem tra:

1. `heu_tchc_legal_compliance_status` co 14 dong.
2. Tat ca dong ban dau dang `LEGAL_NO_GO`.
3. Khong dong nao `LEGAL_READY` neu chua co Phap che/BGH signoff.
4. Master Control hien legal/SOP placeholder de Phap che cap nhat sau.
