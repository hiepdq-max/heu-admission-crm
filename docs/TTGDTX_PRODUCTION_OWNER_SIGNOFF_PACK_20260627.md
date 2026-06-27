# TTGDTX Production Owner Sign-Off Pack 2026-06-27

Status: PASS_LOCAL_PACK
Mode: owner sign-off execution pack. This document does not approve production.

Production remains NO-GO until the required owners review the evidence, record
their decision, and sign the final Go/No-Go decision. Codex/AI output is
advisory only.

## 1. Non-Negotiable Boundaries

- Do not run production migration from Codex/chat.
- Do not mark production GO from Codex/chat.
- Do not approve revenue, receivable creation, payment request approval,
  payout, account freeze/release, collateral release or legal waiver from AI.
- Do not paste secrets, passwords, OTPs, service-role keys, bank credentials,
  raw student PII, raw CCCD, raw phone numbers or raw payment data into this
  pack, Codex/chat, screenshots or browser notes.
- Store sensitive backup/UAT evidence outside Git in the controlled evidence
  location selected by IT_DATA and Audit.
- Apply `docs/HEU_CONTROLLED_EVIDENCE_REDACTION_PACK_20260627.md` and
  `npm.cmd run audit:heu-controlled-evidence-redaction-pack` before owner
  review. Raw evidence stays outside Git.

PASS_LOCAL does not mean backup was executed, restore was executed, UAT passed,
production migration is approved, owner waiver is approved, finance action is
approved, or production GO is approved.

## 2. Required Owner Decisions

| Decision | Required owners | Minimum evidence | Current default |
|---|---|---|---|
| Production backup and restore dry-run | IT_DATA + Audit | `docs/STEP90_STEP110_BACKUP_RESTORE_DRY_RUN_EVIDENCE_PACK_20260627.md` completed with backup ID, restore target, preflight/postflight and smoke-check evidence | NO-GO |
| Step90-Step110 migration order | IT_DATA + KHTC + PHAP_CHE | `docs/MIGRATION_ORDER_AUDIT.md`, `docs/STEP90_STEP110_MIGRATION_ORDER_SIGNOFF_GUARD_20260627.md`, backup/restore evidence and signed migration order | NO-GO |
| P0-19 legal/finance gate | PHAP_CHE + KHTC + BGH | Legal basis, tuition decision, finance permission, `components/ttgdtx/ttgdtx-p019-gate-guard.tsx` and signed legal/finance UAT | NO-GO |
| P2-17 payout once | KHTC + BGH + Audit | `docs/P2_17_DUPLICATE_PAYOUT_UAT_RUNBOOK.md`, payout evidence, duplicate-click evidence and required dossier proof | NO-GO |
| P2-18 accounting dashboard | KHTC + BGH + IT_DATA | `docs/P2_18_ACCOUNTING_DASHBOARD_UAT_RUNBOOK.md`, `docs/TTGDTX_ACCOUNTING_DASHBOARD_ROLE_UAT_PLAN_20260627.md`, source comparison and read-only evidence | NO-GO |
| Role and workspace permission | IT_DATA + TRUONG_PHONG + Audit | `docs/HEU_ROLE_SCOPE_UAT_EXECUTION_PACK_20260627.md`, `docs/TTGDTX_ROLE_SCOPE_UAT_RUNBOOK.md`, multi-role browser evidence | NO-GO |
| Audit log completeness | Audit + IT_DATA + KHTC | `docs/TTGDTX_AUDIT_LOG_UAT_RUNBOOK.md`, audit rows for create, update, check, approve, pay and source-control events | NO-GO |
| Hard-delete/cascade risk | IT_DATA + Audit + affected business owner | `docs/HARD_DELETE_AUDIT.md`, `docs/HEU_NON_TTGDTX_CASCADE_REVIEW_20260627.md`, conversion evidence or written waiver | NO-GO |
| Internal multi-account UAT | BGH + KHTC + PHAP_CHE + IT_DATA | `docs/TTGDTX_SYNTHETIC_UAT_ACCOUNT_SETUP.md`, `docs/TTGDTX_BROWSER_UAT_MATRIX_20260625.md`, `docs/TTGDTX_UAT_EXECUTION_LOG_20260625.md` | NO-GO |
| Controlled evidence redaction | IT_DATA + Audit | `docs/HEU_CONTROLLED_EVIDENCE_REDACTION_PACK_20260627.md`, redacted evidence references and controlled storage location outside Git | NO-GO |

## 3. Required Local Preflight

Run these local checks before owner review:

```powershell
npm.cmd run audit:ttgdtx-release-gates
npm.cmd run audit:heu-controlled-evidence-redaction-pack
npm.cmd run audit:ttgdtx-production-owner-signoff-pack
npm.cmd run lint
npm.cmd run build
git status --short --branch
```

The local preflight must pass, but passing it is not owner approval.

## 4. Evidence Index To Fill Outside Git

| Evidence item | Controlled evidence location | Owner initials | Result |
|---|---|---|---|
| Backup ID and timestamp |  |  | PENDING |
| Restore target proof |  |  | PENDING |
| Step90-Step110 migration order approval |  |  | PENDING |
| P0-19 legal/finance gate UAT |  |  | PENDING |
| P2-17 duplicate payout UAT |  |  | PENDING |
| P2-18 dashboard UAT |  |  | PENDING |
| Role/workspace browser UAT |  |  | PENDING |
| Audit-log UAT |  |  | PENDING |
| Hard-delete/cascade conversion or waiver |  |  | PENDING |
| Final multi-owner Go/No-Go note |  |  | PENDING |

## 5. P0-09 Owner Decision Evidence Checklist

The TTGDTX landing page now shows
`components/ttgdtx/ttgdtx-owner-go-no-go-evidence-checklist.tsx` so the final
owner decision is visible in the operating surface, not only in this pack.

| Case | Owner | Evidence to attach outside Git | Current default |
|---|---|---|---|
| P0-09-01 | IT_DATA + Audit | Backup ID, restore target, preflight/postflight and smoke-check reference | NO-GO |
| P0-09-02 | IT_DATA + KHTC + PHAP_CHE | Signed Step90-Step110 migration order with P0-03 restore proof | NO-GO |
| P0-09-03 | PHAP_CHE + KHTC + BGH | P0-19 legal basis, tuition policy and finance-gate UAT evidence | NO-GO |
| P0-09-04 | KHTC + BGH + Audit + IT_DATA | P2-17 duplicate-payout UAT and P2-18 read-only dashboard reconciliation | NO-GO |
| P0-09-05 | IT_DATA + Audit + process owners | Role/workspace, audit-log and hard-delete/cascade evidence or written waiver | NO-GO |
| P0-09-06 | BGH + IT_DATA + KHTC + PHAP_CHE + AUDIT + TRUONG_PHONG | Final signed multi-owner GO/NO-GO note referencing controlled redacted evidence only | NO-GO |

Do not paste secrets, passwords, OTPs, service-role keys, bank credentials, raw
student PII, raw CCCD, raw phone numbers, raw bank account numbers, bank
statements, vouchers or raw payment data into Git/Codex/chat. PASS_LOCAL does
not approve backup, restore, migration, legal waiver, finance action, UAT
acceptance, payout, dashboard reliance or production GO.

## 6. P0-09 Owner GO/NO-GO Acceptance Matrix

Decision value: `P0_09_ACCEPT / NO_GO / BLOCKED`.

The matrix below decides only whether the sign-off pack is ready for owner
review. It does not approve production. If any stop condition is open, the
final owner decision remains NO-GO.

| Case | Acceptance test | Minimum required evidence | Stop condition |
|---|---|---|---|
| P0-09-ACCEPT-01 | Evidence pack completeness and redaction | Every required evidence item has a controlled external location, owner initials, result and no raw sensitive data in Git/Codex/chat | Any evidence is missing, stored in an uncontrolled location or contains raw sensitive data |
| P0-09-ACCEPT-02 | Backup/restore and migration readiness | Backup ID, restore target, smoke-check, preflight/postflight and signed Step90-Step110 migration order are accepted | Restore proof is missing, app connection to restore target is not proven or migration order is unsigned |
| P0-09-ACCEPT-03 | Finance, legal and UAT blockers closed | P0-19, P2-17, P2-18, role/workspace, audit-log and hard-delete/cascade evidence or written waiver are signed | Any UAT/waiver is unsigned, any HIGH/BLOCKER exception remains, P2-17 can pay twice, P2-18 can write or cannot reconcile, role leak exists or audit trace is incomplete |
| P0-09-ACCEPT-04 | Owner decision quorum and accountability | BGH, IT_DATA, KHTC, PHAP_CHE, AUDIT and TRUONG_PHONG/process owner each record GO/NO-GO, evidence ref, signature and date | Any owner is missing, approval is oral-only, role is ambiguous, waiver is hidden or one owner asks for more evidence |
| P0-09-ACCEPT-05 | Production boundary and AI/Codex limitation | Decision record states Codex/AI is advisory only; no production migration or production GO is approved from Codex/chat | PASS_LOCAL is treated as production GO, or AI/Codex is used to approve finance action, migration, UAT, waiver or production |
| P0-09-ACCEPT-06 | Final outcome stays NO-GO until every stop condition is closed | All stop conditions in this sign-off pack are explicitly closed, otherwise the final decision remains NO-GO | Any open stop condition, unsigned evidence, missing backup/restore proof, unresolved exception or raw evidence exposure remains |

## 7. Stop Conditions

Keep production NO-GO if any condition below is true:

1. Any required owner decision is unsigned.
2. Backup exists but restore dry-run is missing or unverified.
3. App connection to the restore target is not proven.
4. Any UAT account sees data outside its role/workspace scope.
5. P2-17 can pay twice, overpay, pay without required evidence or bypass RPC.
6. P2-18 dashboard can write data or cannot be reconciled to source workflows.
7. Any finance/evidence/audit row can be hard-deleted without written waiver.
8. Any HIGH or BLOCKER exception is unresolved.
9. Any real password, OTP, service-role key, bank credential, raw student PII,
   raw CCCD, raw phone number or raw payment data is exposed in Git, Codex/chat
   or UAT screenshots.
10. Any owner asks for more evidence.

## 8. Final Decision Record

| Owner group | Name / role | Decision | Signature / evidence ref | Date |
|---|---|---|---|---|
| BGH |  | GO / NO-GO |  |  |
| IT_DATA |  | GO / NO-GO |  |  |
| KHTC |  | GO / NO-GO |  |  |
| PHAP_CHE |  | GO / NO-GO |  |  |
| AUDIT |  | GO / NO-GO |  |  |
| TRUONG_PHONG / process owner |  | GO / NO-GO |  |  |

Final production recommendation remains NO-GO until every required owner signs
GO, P0-09-ACCEPT-01 through P0-09-ACCEPT-06 are accepted and no stop condition
remains open.
