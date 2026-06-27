# HEU Risk Control Signoff Register 2026-06-27 V01 Draft

Status: DRAFT_CONTROL
Owner: Audit + BGH + Process owners
Production status: NO-GO

## 1. Purpose

Define the minimum risk, control and signoff path for HEU ERP/AI OS work. This
register keeps PASS_LOCAL separate from official owner approval.

## 2. Signoff Rule

PASS_LOCAL means local packaging or static audit passed. It does not mean:

- production ready
- UAT accepted
- migration approved
- finance action approved
- evidence accepted
- owner GO granted

## 3. P0 Risk Controls

| Risk | Required control | Owner | Signoff required before production |
|---|---|---|---|
| Folder/file registry drift | Folder/File Registry, Version Log, Audit Log | IT_DATA + Audit | YES |
| Legal basis missing | Legal Gate and SOP Gate | PHAP_CHE | YES |
| Data master inconsistency | Data Master P0 Register and Data Dictionary | IT_DATA + Process owners | YES |
| Dashboard reads raw/unapproved data | Report View Register and source map | BGH + IT_DATA | YES |
| Finance gạch nợ without real HEU receipt | Receipt and bank reconciliation gate | KHTC | YES |
| COM/chi tra calculated before reconciliation | COM policy, reconciliation lock, payment request approval | KHTC + PHAP_CHE | YES |
| TTGDTX mixed with HOU/short course | Separate module ledger and report views | Process owners | YES |
| AI overreach | AI Agent Scope Register, prompt/output audit | BGH + Audit | YES |
| Hard delete/evidence loss | Soft delete policy, hard-delete waiver/conversion | IT_DATA + Audit | YES |
| Production migration failure | Backup, restore dry-run, migration order signoff | IT_DATA + BGH | YES |

## 4. Required Signoff Fields

| Field | Rule |
|---|---|
| `signoff_id` | Stable code |
| `control_id` | Links to risk/control item |
| `owner_department` | Accountable department |
| `signoff_role` | Human role required |
| `signoff_user` | Human signer only |
| `signed_at` | Timestamp |
| `evidence_reference` | Controlled evidence location/reference |
| `decision` | `SIGNED_OFF`, `REJECTED`, `WAIVED_BY_AUTHORITY` |
| `decision_note` | Required for rejection or waiver |

## 5. Boundary

This register does not collect real evidence and does not approve production.
Real signed evidence must be stored in controlled HEU locations outside
Git/Codex/chat when sensitive.

