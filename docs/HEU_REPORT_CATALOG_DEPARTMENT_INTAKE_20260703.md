# HEU Report Catalog Department Intake - 2026-07-03

Status: PASS_LOCAL_INTAKE

Decision lane: REPORT_CATALOG_INTAKE_READY / NO_GO / BLOCKED

Current production decision: NO_GO

Source marker: XLSX_SOURCE_OUTSIDE_GIT

Source workbook checked:
`D:\XD_HEU_V1\Pháp chế_NEW\HEU_SYSTEM_DANH_MUC_BAO_CAO_PHONG_BAN_20260703_V02.xlsx`

The workbook remains outside Git. This intake records only controlled metadata
and summary counts so the HEU app can route Report View/Dashboard work without
importing the source workbook, raw tables, personal data, debt details, bank
statements, vouchers or secrets into the repository.

## Workbook Snapshot

| Item | Value |
|---|---|
| workbook_version | HEU_SYSTEM_DANH_MUC_BAO_CAO_PHONG_BAN_20260703_V02.xlsx |
| sheets | sheets=11 |
| report_rows | reports=81 |
| department_groups | departments=13 |
| destination_proposal | 09_DASHBOARD_BAO_CAO/00_DANH_MUC_BAO_CAO/ |
| owner_lane | IT_DATA + 00_MASTER_CONTROL_HEU |
| checker_lane | Audit + department data owners |
| approver_lane | BGH_HIEU_TRUONG |

Required sheets observed:

- `00_README`
- `01_DANH_MUC_BAO_CAO`
- `02_TONG_QUAN`
- `03_REPORT_VIEW_GATE`
- `04_LICH_NOP_BAO_CAO`
- `05_RACI_PHONG_BAN`
- `06_KPI_DICTIONARY_MIN`
- `07_LOG_MAU`
- `08_LISTS`
- `09_HUONG_DAN_SU_DUNG`
- `10_TU_DIEN_THUAT_NGU`

## Controlled Summary Counts

| Bucket | Count |
|---|---:|
| priority_P0 | P0=50 |
| priority_P1 | P1=26 |
| priority_P2 | P2=5 |
| status_CAN_SUA | CAN_SUA=76 |
| status_CHUA_DU_DIEU_KIEN | CHUA_DU_DIEU_KIEN=5 |
| frequency_weekly | weekly=44 |
| frequency_monthly | monthly=24 |
| frequency_event | event=10 |
| frequency_daily | daily=3 |

Department counts:

| Department | Count |
|---|---:|
| BGH_DIEU_HANH | 5 |
| TCHC | 5 |
| PHAP_CHE | 5 |
| TUYEN_SINH | 7 |
| DAO_TAO | 8 |
| KHOA_GIANG_VIEN | 5 |
| CTHSSV | 7 |
| KHTC_KE_TOAN | 9 |
| TTGDTX_9PLUS | 8 |
| HOU | 5 |
| NGAN_HAN_DAY_NGHE | 6 |
| IT_DATA | 5 |
| AUDIT_KIEM_SOAT | 6 |

## Report View Gate Mapping

The workbook includes eight local gate rows. These are routing controls, not
approval results.

| Gate | Control |
|---|---|
| GATE-01 | Legal/SOP Gate |
| GATE-02 | Data Master Gate |
| GATE-03 | Data Dictionary Gate |
| GATE-04 | Report View Gate |
| GATE-05 | Quality Gate |
| GATE-06 | Security Gate |
| GATE-07 | Signoff Gate |
| GATE-08 | Refresh Log Gate |

Dashboard and AI may only use a controlled `REPORT_VIEW` after Data Master,
Data Dictionary, Quality, Security, Signoff and Refresh Log evidence are closed
for that view. Raw workbook tabs and quick spreadsheet calculations are not a
dashboard source of truth.

## PASS_LOCAL Boundary

This intake does not import raw workbook data into Git, does not copy the
source XLSX into the app repository, does not create dashboard reliance, does
not read raw/source tables for dashboard, does not accept evidence, does not
execute UAT, does not approve legal/SOP position, does not approve finance
reliance, does not approve owner GO/NO-GO and does not mark production GO.

Boundary tokens: does not import raw workbook data into Git; does not copy the source XLSX into the app repository; does not create dashboard reliance; does not read raw/source tables for dashboard; does not accept evidence; does not execute UAT; does not approve legal/SOP position; does not approve finance reliance; does not approve owner GO/NO-GO; does not mark production GO.

## Next Small Slices

1. Map the 81 report IDs to the existing `HEU_REPORT_VIEW_REGISTER` and source
   map without adding raw workbook data to Git.
2. For each P0 report, create or confirm `REPORT_VIEW_CAN_CO` ownership,
   dictionary definition and refresh log.
3. Keep unresolved rows as `CAN_SUA` or `CHUA_DU_DIEU_KIEN` until owner
   signoff and controlled evidence exist outside Git/Codex/chat.
