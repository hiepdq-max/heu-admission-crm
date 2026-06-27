# TTGDTX Bank Receipt Batch Policy 2026-06-27

Status: DRAFT_CONTROL
Scope: P2-10 collection evidence and import/UAT design
Production status: NO-GO

## 1. Purpose

Define how HEU should handle bank receipt batches for TTGDTX 9+ UAT without
exposing bank-account data or allowing duplicate receipt posting.

This policy supports:

- P2-10 Thu hoc phi.
- P2-13 reconciliation.
- P2-18 accounting dashboard.
- P1-05 synthetic real-like UAT pack.

## 2. Safety Rules

- Do not commit raw bank PDFs, screenshots or exports to Git.
- Do not paste bank account numbers, OTPs, passwords or online-banking
  credentials into Codex/chat.
- Store real bank evidence only in the approved access-controlled evidence
  location.
- Use synthetic placeholders in repo fixtures and docs.
- Mask payer/private details in screenshots unless the UAT owner explicitly
  approves a restricted evidence package.

## 3. Required Staging Fields

Any future bank batch import/staging design should preserve these fields:

| Field | Purpose |
|---|---|
| `batch_code` | Groups one uploaded statement/PDF/export |
| `statement_date` | Bank statement or receipt batch date |
| `transaction_token` | Synthetic or masked transaction reference |
| `transaction_date` | Date the money was credited |
| `amount_vnd` | Amount received |
| `payer_alias` | Masked payer label, not real private details |
| `beneficiary_alias` | Masked HEU/approved collection account label |
| `fingerprint` | Duplicate guard from token/date/amount/student or receivable reference |
| `evidence_url` | Controlled evidence link, never password or OTP |
| `review_status` | `STAGED`, `DUPLICATE`, `MATCHED`, `EXCEPTION`, `POSTED` |

## 4. Duplicate Fingerprint Rule

Before posting a receipt, the system must build a stable fingerprint from
non-secret fields, for example:

```text
transaction_token | transaction_date | amount_vnd | synthetic_student_or_receivable_ref
```

Expected behavior:

1. Same fingerprint in one batch is marked `DUPLICATE`.
2. Same fingerprint across batches is blocked before posting.
3. Duplicate rows must remain visible for audit; do not hard-delete them.
4. A human reviewer can mark a duplicate exception only with an evidence note.

## 5. UAT Coverage

Use `fixtures/ttgdtx/synthetic_real_like_uat_pack_20260627.json`.

The pack includes:

- One bank receipt batch.
- Three receipt lines.
- One duplicate fingerprint.
- One normal full receipt.
- One partial receipt.

Run:

```powershell
npm.cmd run audit:ttgdtx-synthetic-uat-pack
```

## 6. Stop Conditions

Stop implementation or UAT and fix first if:

1. A raw bank account number appears in repo, logs, screenshots or Codex/chat.
2. A duplicate receipt can be posted twice.
3. A bank row can be hard-deleted without audit evidence.
4. A receipt can move to reconciliation while invoice/chung-tu status is still
   unresolved.
5. Out-of-scope users can view bank evidence or finance data.

## 7. Current Result

This policy is PASS_LOCAL as a design guard. It does not approve production bank
import or production payment evidence handling. Production still requires signed
UAT, access-control evidence, backup/restore dry-run and business Go/No-Go.
