# HEU Root Control Action Register 2026-06-27 V01 Draft

Status: DRAFT_CONTROL
Owner: BGH + IT_DATA + Audit
Production status: NO-GO

## 1. Purpose

This register is the root action queue for moving HEU from controlled internal
software build to ERP/AI OS operation. It does not approve production use,
finance action, migration, UAT acceptance or owner Go/No-Go.

## 2. Placement Rule

No new level-1 folder is allowed. Official Drive placement must stay under the
approved level-1 tree:

- `00_HE_THONG`
- `01_PHAP_LY_PHAP_CHE`
- `02_TO_CHUC_NHAN_SU`
- `03_DATA_MASTER`
- `04_WORKFLOW_SOP`
- `09_DASHBOARD_BAO_CAO`
- `10_AI_AGENT_AUTOMATION`
- `11_AUDIT_KIEM_SOAT`
- `99_BACKUP_ARCHIVE`

Every official file must be checked against Folder Registry, File Registry,
Version Log, Audit Log and Signoff Register before it is treated as official.

## 3. P0 Action Queue

| ID | Action | Owner | Status | Required gate before code |
|---|---|---|---|---|
| RC-01 | Lock root folder and file registry discipline | IT_DATA + Audit | DRAFT | Folder/File registry exists and is reviewed |
| RC-02 | Lock Data Master P0 register | IT_DATA + Process owners | DRAFT | P0 masters named and gap-tagged |
| RC-03 | Lock minimum Data Dictionary | IT_DATA | DRAFT | Owner, field, source and sensitive-data rules exist |
| RC-04 | Lock SOP-to-Data Mapping | PHAP_CHE + Process owners | DRAFT | SOP maps to data source, owner and signoff; `docs/HEU_LEGAL_SOP_GOVERNANCE_CONTROL_MATRIX_20260628_V01_DRAFT.md` routes legal/SOP/governance missing-basis checks |
| RC-05 | Lock Report View Register | BGH + IT_DATA + KHTC | DRAFT | Dashboard reads approved report views only |
| RC-06 | Lock AI Agent Scope Register | BGH + IT_DATA + Audit | DRAFT | AI remains advisory/read-only |
| RC-07 | Lock Risk Control Signoff Register | Audit + Owners | DRAFT | Human signoff path exists for P0/P1 risks |
| RC-07A | Lock Legal/SOP/Governance control matrix | PHAP_CHE + IT_DATA + Audit | DRAFT_CONTROL | Legal Article Master, SOP Register, evidence class, workflow gate, report view and owner decision boundaries are mapped; PASS_LOCAL SOP loop routing uses `docs/HEU_REAL_DATA_LOGIC_PROFESSIONAL_LEGAL_CONFIRMATION_REGISTER_20260702.md` and `docs/HEU_CODEX_OPERATING_PLAYBOOK.md` with `SOP-01` through `SOP-06` before any logged slice; signed owner review still required |
| RC-08 | Review TTGDTX/9+ against P0 registers | KHTC + PHAP_CHE + IT_DATA | DRAFT_MATRIX_READY | `docs/HEU_MODULE_READINESS_GAP_MATRIX_20260628_V01_DRAFT.md`; signed UAT still required |
| RC-09 | Review HOU against P0 registers | HOU owner + KHTC + IT_DATA | DRAFT_MATRIX_READY | `docs/HEU_MODULE_READINESS_GAP_MATRIX_20260628_V01_DRAFT.md`; separate HOU ledger and handover controls still required |
| RC-10 | Review Short Course against P0 registers | DAO_TAO + KHTC + IT_DATA | DRAFT_MATRIX_READY | `docs/HEU_MODULE_READINESS_GAP_MATRIX_20260628_V01_DRAFT.md`; attendance/payment/BHXH/meal gates still required |

## 4. 7-30-90 Day Control Roadmap

| Window | Result expected | Work allowed | Work not allowed |
|---|---|---|---|
| 7 days | P0 registers and gap matrix | Docs, read-only UI, audit guards | Production migration, finance automation |
| 30 days | TTGDTX/Finance Desk UAT pack executed | Signed UAT, report view guard, role/scope tests | Auto debt clearing, auto COM, AI approval |
| 90 days | Module hardening plan signed | TTGDTX first, then HOU, then Short Course | Go-live without backup/UAT/signoff |

## 5. Boundary

Codex/AI may draft, check and implement local safe controls. Codex/AI must not
approve production, approve migration, accept UAT, approve finance action, move
real evidence, delete source data or mark owner GO.
