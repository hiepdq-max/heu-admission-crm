# HEU Root Drive Department Confirmation Intake

Status: PASS_LOCAL_INTAKE
Production status: NO-GO
Source: user-provided Root Drive request plus read-only Google Drive folder listing on 2026-07-03
Root Drive URL: https://drive.google.com/drive/folders/0AI4bKgXnkMfhUk9PVA

## 1. Purpose

This intake records the first-level Root Drive structure and the department
confirmation questionnaire before HEU treats any Drive file, dashboard or
automation as an official production source.

Operating rule:

- Legal and policy gate before SOP.
- SOP before Form, Dashboard or Automation.
- Data Master before automation.
- Log before conclusion.
- Files outside `FILE_REGISTRY`, `VERSION_LOG` and `AUDIT_LOG` are not official
  source of truth.
- Departments must not send raw personal data, CCCD, phone lists, salary,
  personal contracts, bank statements, detailed student debt, passwords, OTP,
  reset links, API keys, tokens, webhooks or service-role keys into Codex/chat.

Decision token: `HEU_ROOT_DRIVE_SYSTEM_AUDIT_INITIAL = CAN_SUA`

## 2. Root Drive Snapshot

The read-only folder listing confirmed these first-level folders:

Read-only listing boundary:

- The listing confirms folder names only.
- Access and sharing status were not verified by this listing.
- Access closure still requires owner confirmation, permission log and signed
  evidence outside Git/Codex/chat.
- This intake does not approve access closure.

| Folder | Current intake status | Required next action |
|---|---|---|
| `00_HE_THONG` | OBSERVED_STANDARD | Map to file registry, version log and audit log |
| `01_PHAP_LY_PHAP_CHE` | OBSERVED_STANDARD | Legal owner confirms issued/draft/reference state |
| `02_TO_CHUC_NHAN_SU` | OBSERVED_STANDARD | TCHC owner confirms org, position, role and access registry |
| `03_DATA_MASTER` | OBSERVED_STANDARD | IT/Data owner confirms master tables, data dictionary and owners |
| `04_WORKFLOW_SOP` | OBSERVED_STANDARD | Process owners confirm active SOP and form/dashboard boundary |
| `09_DASHBOARD_BAO_CAO` | OBSERVED_STANDARD | Dashboard owner proves read-only Report View reliance |
| `10_AI_AGENT_AUTOMATION` | OBSERVED_STANDARD | IT/Data proves SOP, test log, backup, rollback and no secrets |
| `11_AUDIT_KIEM_SOAT` | OBSERVED_STANDARD | Audit owner confirms official log, signoff and issue register |
| `99_BACKUP_ARCHIVE` | OBSERVED_STANDARD | IT/Data owner confirms backup, restore and archive retention |
| `05_DAO_TAO` | OBSERVED_MODULE_FOLDER | BGH/Dao tao confirm whether this remains level-1 or maps into SOP/Data/Archive |
| `06_CTHSSV` | OBSERVED_MODULE_FOLDER | BGH/CTHSSV confirm module owner and official metadata source |
| `07_KHOA` | OBSERVED_MODULE_FOLDER | BGH/Khoa confirm faculty data, teacher profile privacy and source map |
| `08_DAO_TAO_NGAN_HAN_DAY_NGHE` | OBSERVED_MODULE_FOLDER | Training owner confirms Short Course Data Master/SOP/archive map |
| `00_HEU_SYSTEM_GOVERNANCE_CONTROL` | OBSERVED_EXTRA_FOLDER | BGH/IT/Data must classify as standard, legacy, control archive or duplicate |

Root Drive conclusion: the structure is not wrong as a system foundation, but
it remains `CAN_SUA` until every observed level-1 folder has an owner, official
purpose, registry link and access/retention decision.

## 3. General Department Response Template

Every department response must use controlled metadata only.

| Field | Required answer |
|---|---|
| Department | Department name |
| Respondent | Name and title only, no private contact data |
| Workstream | Example: admissions, training, finance, student affairs |
| Main working file | File name/link if permitted |
| Official source file | Yes/No/Unclear |
| `FILE_REGISTRY` exists | Yes/No/Unclear |
| `VERSION_LOG` exists | Yes/No/Unclear |
| `AUDIT_LOG` exists | Yes/No/Unclear |
| Active SOP | SOP name/code |
| Related Data Master | Table or registry name |
| Report sent to BGH | Report name/code |
| Current risks | Metadata summary only |
| Decisions required from BGH | Decision list |
| Self-assessment | `DAT` / `DAT_TAM_THOI` / `CAN_SUA` / `CHUA_DU_DIEU_KIEN` |

## 4. Department Question Lanes

| Lane | Owner group | Minimum confirmation required | Safe storage destination | Default status |
|---|---|---|---|---|
| A | HDQT/BGH | Level-1 structure, authority, 12-month priorities, data owners, BGH reports | `11_AUDIT_KIEM_SOAT/02_SIGNOFF` | `CHUA_DU_DIEU_KIEN` |
| B | Phap che | Issued/draft/reference legal documents, supersede map, contract validity, legal checklist | `01_PHAP_LY_PHAP_CHE/08_PHIEU_KIEM_TRA_PHAP_CHE` | `CAN_SUA` |
| C | TCHC/Van thu/Luu tru | Org chart, position IDs, file registry, folder registry, document-numbering, Drive access lifecycle | `02_TO_CHUC_NHAN_SU` and `11_AUDIT_KIEM_SOAT/01_CHECKLIST` | `CAN_SUA` |
| D | IT/Data | Data Dictionary, owner/checker/approver, Report View register, scripts, secrets scan, backup, rollback, AI blocklist | `10_AI_AGENT_AUTOMATION/00_AI_GOVERNANCE` and `11_AUDIT_KIEM_SOAT/05_SECURITY_LOG` | `CHUA_DU_DIEU_KIEN` for production automation |
| E | Audit/Kiem soat | Checklist, official audit log, signoff register, risk register, issue tracker, DAT criteria | `11_AUDIT_KIEM_SOAT/03_RUI_RO_KIEM_SOAT` | `CAN_SUA` |
| F | Tuyen sinh | Lead source, lead master, handover, missing ho so, COM input policy | `03_DATA_MASTER` and `04_WORKFLOW_SOP` admissions area | `CAN_SUA` |
| G | Dao tao | Program/class/curriculum IDs, opening decision, timetable, attendance, grade lock, report | `03_DATA_MASTER` and `04_WORKFLOW_SOP` training area | `CAN_SUA` |
| H | Khoa/Bo mon | Department/faculty owners, teacher list, teaching assignment, materials, quality control, data outputs | `04_WORKFLOW_SOP` and `03_DATA_MASTER` faculty area | `CAN_SUA` |
| I | CTHSSV | Student master, profile metadata, student status, policy records, handover, personal-data boundary | `03_DATA_MASTER` metadata only | `CAN_SUA` |
| J | Tai chinh/Ke toan | Tuition, receivable, actual cash receipt, bank recon, vouchers, COM, payments, finance report source | `03_DATA_MASTER/09_TAI_CHINH_HOC_PHI_CONG_NO` and `11_AUDIT_KIEM_SOAT/M09_TAI_CHINH_CONG_NO` | `CAN_SUA` |
| K | TTGDTX/9+ | Center master, contracts, class IDs, NĐ238, disbursement, money received by HEU, COM/reconciliation | `03_DATA_MASTER` TTGDTX area and `11_AUDIT_KIEM_SOAT` reconciliation area | `CHUA_DU_DIEU_KIEN` without TTGDTX master |
| L | HOU | HOU student master, handover, tuition, COM, support log, BGH report and separation from TTGDTX | `03_DATA_MASTER` HOU and `04_WORKFLOW_SOP` HOU | `CAN_SUA` |
| M | Dao tao ngan han/Day nghe | K1-K7 source, student/class/program IDs, attendance, 87A/BHXH, meal allowance, teacher payment, dashboard question | `03_DATA_MASTER/SHORT_COURSE` and `99_BACKUP_ARCHIVE` for source files | `CHUA_DU_DIEU_KIEN` without student/class/attendance IDs |
| N | CSVC/Thiet bi/Dia diem | Room/asset IDs, registered locations, PCCC/environment/location contracts, Thanh Liet status, asset handover | `03_DATA_MASTER/M14_VAN_THU_SO_HOA_CSVC_TTB` or CSVC metadata | `CAN_SUA` |
| O | Dashboard/Bao cao | BGH reports, mandatory authority reports, source files, Report View register, KPI dictionary, refresh log, privacy locks | `09_DASHBOARD_BAO_CAO` and `11_AUDIT_KIEM_SOAT` | `CHUA_DU_DIEU_KIEN` for production dashboard |

## 5. Stop Conditions

The system remains locked for production reliance when any of these are true:

- A first-level folder has no owner or registry mapping.
- A file is used as official source without `FILE_REGISTRY`, `VERSION_LOG` and
  `AUDIT_LOG`.
- A dashboard reads raw files/Form Responses instead of controlled Report View.
- An automation lacks SOP, Data Dictionary, test log, backup, rollback and
  approving owner.
- A response includes raw personal data, finance details, passwords, OTPs,
  reset links, API keys, tokens, webhooks or service-role keys.
- BGH, legal, finance, audit or process owner signoff is missing.

## 6. PASS_LOCAL Boundary

This intake is a control and question pack only. It does not move Drive files,
change sharing permissions, import raw data, create Google Forms, create
Dashboards, run Apps Script, send email, create accounts, accept evidence,
execute UAT, approve legal position, approve finance reliance, approve owner
GO/NO-GO or mark production GO.

Boundary token: does not mark production GO.
