# HEU TCHC Position And Report Foundation - 2026-07-03

Status: DRAFT_CONTROL
Production status: NO-GO
Owner lane: BGH + PHT_VAN_HANH + TCHC + IT_DATA + Audit

## 1. Muc dich

Tai lieu nay chot khung du lieu nen cho Phong To chuc hanh chinh (TCHC):

- Danh muc vi tri TCHC theo chuc nang thuc te.
- Bao cao bat buoc theo tung vi tri.
- Reviewer/owner lane cho tung bao cao.
- Report View code du kien de sau nay noi vao `/reports` hoac dashboard.

Day la nen data/report-contract only. Chua phe duyet quy trinh, chua chap nhan
evidence, chua tao task production va chua coi dashboard/report la nguon phap ly.

## 2. Vi tri TCHC nen co trong he thong

| Position code | Ten vi tri | Quan ly truc tiep | Bat buoc gan user |
|---|---|---|---|
| `TCHC_HEAD` | Truong phong To chuc hanh chinh | `PHT_VAN_HANH` | YES |
| `TCHC_DEPUTY` | Pho phong To chuc hanh chinh | `TCHC_HEAD` | OPTIONAL |
| `TCHC_VAN_THU_LUU_TRU` | Van thu - luu tru | `TCHC_HEAD` | YES |
| `TCHC_HANH_CHINH_NHAN_SU` | Hanh chinh nhan su | `TCHC_HEAD` | YES |
| `TCHC_HO_SO_NHAN_SU` | Ho so nhan su | `TCHC_HANH_CHINH_NHAN_SU` | OPTIONAL |
| `TCHC_CSVC_TAI_SAN` | Co so vat chat - tai san | `TCHC_HEAD` | YES |
| `TCHC_BAO_TRI_SUA_CHUA` | Bao tri - sua chua | `TCHC_CSVC_TAI_SAN` | OPTIONAL |
| `TCHC_MUA_SAM_CAP_PHAT` | Mua sam - cap phat | `TCHC_CSVC_TAI_SAN` | OPTIONAL |
| `TCHC_LE_TAN_HAU_CAN` | Le tan - hau can | `TCHC_HEAD` | OPTIONAL |
| `TCHC_BAO_VE_AN_NINH` | Bao ve - an ninh trat tu | `TCHC_HEAD` | OPTIONAL |
| `TCHC_PHUONG_TIEN` | Phuong tien - lai xe | `TCHC_HEAD` | OPTIONAL |
| `TCHC_VE_SINH_MOI_TRUONG` | Ve sinh - moi truong | `TCHC_HEAD` | OPTIONAL |
| `TCHC_Y_TE_HOC_DUONG` | Y te hoc duong | `TCHC_HEAD` | OPTIONAL |
| `TCHC_TONG_HOP_BAO_CAO` | Tong hop bao cao TCHC | `TCHC_HEAD` | OPTIONAL |

## 3. Bao cao nen theo doi theo vi tri

| Report code | Ten bao cao | Owner position | Reviewer | Tan suat |
|---|---|---|---|---|
| `RPT_TCHC_TONG_HOP_THANG` | Bao cao tong hop TCHC thang | `TCHC_HEAD` | `PHT_VAN_HANH` | MONTHLY |
| `RPT_TCHC_CONG_VAN_DEN_DI` | So cong van den/di | `TCHC_VAN_THU_LUU_TRU` | `TCHC_HEAD` | WEEKLY |
| `RPT_TCHC_HO_SO_LUU_TRU` | Tinh trang ho so luu tru | `TCHC_VAN_THU_LUU_TRU` | `TCHC_HEAD` | MONTHLY |
| `RPT_TCHC_NHAN_SU_BIEN_DONG` | Bien dong nhan su | `TCHC_HANH_CHINH_NHAN_SU` | `TCHC_HEAD` | MONTHLY |
| `RPT_TCHC_HO_SO_NHAN_SU` | Ho so nhan su can bo sung | `TCHC_HO_SO_NHAN_SU` | `TCHC_HANH_CHINH_NHAN_SU` | WEEKLY |
| `RPT_TCHC_CHAM_CONG_NGHI_PHEP` | Cham cong va nghi phep | `TCHC_HANH_CHINH_NHAN_SU` | `TCHC_HEAD` | MONTHLY |
| `RPT_TCHC_TAI_SAN_THIET_BI` | Tai san va thiet bi | `TCHC_CSVC_TAI_SAN` | `TCHC_HEAD` | MONTHLY |
| `RPT_TCHC_BAO_TRI_SUA_CHUA` | Bao tri va sua chua | `TCHC_BAO_TRI_SUA_CHUA` | `TCHC_CSVC_TAI_SAN` | WEEKLY |
| `RPT_TCHC_MUA_SAM_CAP_PHAT` | Mua sam va cap phat | `TCHC_MUA_SAM_CAP_PHAT` | `TCHC_CSVC_TAI_SAN` | MONTHLY |
| `RPT_TCHC_HAU_CAN_SU_KIEN` | Hau can va su kien | `TCHC_LE_TAN_HAU_CAN` | `TCHC_HEAD` | EVENT |
| `RPT_TCHC_AN_NINH_TRAT_TU` | An ninh trat tu | `TCHC_BAO_VE_AN_NINH` | `TCHC_HEAD` | DAILY |
| `RPT_TCHC_PHUONG_TIEN` | Phuong tien va lai xe | `TCHC_PHUONG_TIEN` | `TCHC_HEAD` | MONTHLY |
| `RPT_TCHC_VE_SINH_MOI_TRUONG` | Ve sinh va moi truong | `TCHC_VE_SINH_MOI_TRUONG` | `TCHC_HEAD` | WEEKLY |
| `RPT_TCHC_Y_TE_HOC_DUONG` | Y te hoc duong | `TCHC_Y_TE_HOC_DUONG` | `TCHC_HEAD` | MONTHLY |

## 4. SQL objects

| Object | Vai tro |
|---|---|
| `heu_org_positions` | Danh muc vi tri TCHC theo dinh bien |
| `heu_position_report_requirements` | Report contract theo tung vi tri |
| `heu_position_report_requirement_status` | View read-only de kiem tra owner/reviewer/report readiness |

## 5. Stop conditions

- Khong dung report TCHC lam dashboard production khi `control_status` con `DRAFT_CONTROL`.
- Khong dua raw CCCD, hop dong lao dong, benh an, sao ke, password, OTP hoac file goc nhay cam vao report.
- Khong tu phe duyet chi phi mua sam, sua chua, luong, cham cong hoac thanh toan tu report TCHC.
- Khong coi PASS_LOCAL la signed UAT, evidence acceptance, owner GO hoac production GO.

## 6. Next controlled slice

Sau khi chay `database/step116_tchc_position_report_foundation.sql`, kiem tra:

1. `/settings/scopes` hien du cac vi tri TCHC.
2. `heu_position_report_requirement_status` co du report theo tung vi tri.
3. Chua co report nao `SIGNED_OFF` neu chua co owner signoff that.
4. Moi user TCHC chi duoc gan vao vi tri chuan va nhan quyen theo role/scope.
