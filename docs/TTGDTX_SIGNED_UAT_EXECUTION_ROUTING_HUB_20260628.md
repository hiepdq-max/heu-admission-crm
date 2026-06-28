# TTGDTX Signed UAT Execution Routing Hub 2026-06-28

Status: DRAFT_CONTROL
Production status: NO-GO
Scope: TTGDTX/Finance signed UAT execution support

## 1. Purpose

This document defines the controlled route list for the remaining TTGDTX and
Finance signed UAT work. It is an execution-routing control only. It does not
execute UAT, accept evidence, sign owner results, grant access, approve finance
action, approve migration, approve owner GO/NO-GO or mark production GO.

The visible app panel is
`components/ttgdtx/ttgdtx-signed-uat-execution-routing-hub.tsx` and is mounted
on `/ttgdtx` with marker
`data-ttgdtx-signed-uat-execution-routing-hub="P0-08_UAT_ROUTING"`.

Decision lane: `SIGNED_UAT_READY / NO_GO / BLOCKED`.

## 2. Routing Rule

Each UAT route must have:

- Controlled evidence reference, not raw evidence.
- Redaction class and redaction reviewer.
- Synthetic account or approved operator identity.
- Route result: PASS, FAIL or BLOCKED.
- Required owner signature outside Git/Codex/chat.
- Matching local audit command green before handoff.

If any required proof is missing, the row remains `NO_GO` or `BLOCKED`.

## 3. Execution Routes

| Order | Code | Route | Runbook | Owner | Minimum proof | Stop condition | Guard |
|---|---|---|---|---|---|---|---|
| UAT-ROUTE-01 | P0-10 | `/audit` | `docs/HEU_CONTROLLED_EVIDENCE_REDACTION_PACK_20260627.md` | IT_DATA + Audit | Controlled storage location, redaction class, reviewer and evidence ID before any screenshot, voucher, backup proof or signed result is referenced | Raw PII, CCCD, bank data, passwords, OTPs, service-role keys, vouchers or unredacted screenshots are present | `npm.cmd run audit:heu-controlled-evidence-redaction-pack` |
| UAT-ROUTE-02 | P0-03 | `/settings/supabase-check` | `docs/STEP90_STEP110_BACKUP_RESTORE_OPERATOR_RUN_SHEET_20260627.md` | IT_DATA + Audit | Backup ID, isolated restore target, preflight/postflight output and restore smoke-check evidence with P0-19/P3 gate preservation | No real backup ID, no isolated restore target, failed smoke-check, unsigned restore evidence or production target confusion | `npm.cmd run audit:ttgdtx-backup-restore-dry-run-pack` |
| UAT-ROUTE-03 | Step90-Step110 | `/settings/supabase-check` | `docs/STEP90_STEP110_MIGRATION_ORDER_SIGNOFF_GUARD_20260627.md` | IT_DATA + KHTC + PHAP_CHE | Signed migration order after accepted backup/restore evidence, rollback point and Step97/Step100/Step109/Step110 decisions | Migration order is unsigned, backup proof is missing, rollback point is unclear or any owner marks BLOCKED | `npm.cmd run audit:ttgdtx-migration-order-guard` |
| UAT-ROUTE-04 | P6-04 | `/settings/scopes` | `docs/HEU_ROLE_SCOPE_UAT_EXECUTION_PACK_20260627.md` | IT_DATA + TRUONG_PHONG + Audit | Synthetic ADMIN, BGH, KHTC, TUYEN_SINH, CTHSSV, DAO_TAO, PHAP_CHE, AUDIT and out-of-scope route matrix with blocked negative cases | Any role leak, broad workspace access, server-side bypass, missing redaction proof or unsigned owner result | `npm.cmd run audit:heu-role-scope-uat-pack` |
| UAT-ROUTE-05 | P0-19 | `/ttgdtx/gate` | `docs/P0_19_P2_01_P2_02_PILOT_OPEN_UAT_RUNBOOK.md` | PHAP_CHE + KHTC + BGH | Legal basis, tuition policy, waiver/exception decision and ALLOW_FINANCE gate proof before receivable or collection reliance | Legal basis, tuition rule, waiver decision, finance gate proof or owner signature is missing | `npm.cmd run audit:ttgdtx-p019-gate-guard` |
| UAT-ROUTE-06 | P3-01/P3-02 | `/leads` | `docs/HEU_LEAD_LIFECYCLE_HANDOVER_UAT_RUNBOOK_20260628.md` | TUYEN_SINH + CTHSSV + DAO_TAO + KHTC | Lifecycle and handover route evidence proving handover cannot create finance facts or bypass P0-19/P2-05/P2-03 gates | Handover can create receivable facts directly, bypass finance gate, leak scope or lacks signed owner result | `npm.cmd run audit:heu-lead-lifecycle-handover-uat-pack` |
| UAT-ROUTE-07 | P2-17 | `/ttgdtx/payment-requests/pay` | `docs/P2_17_DUPLICATE_PAYOUT_UAT_RUNBOOK.md` | KHTC + BGH + Audit | Duplicate-click, overpay, voucher normalization, RPC-only path and BBNT/partner-invoice dossier evidence | Payment can run twice, overpay is possible, dossier evidence is missing, voucher proof is raw or owner signature is absent | `npm.cmd run audit:ttgdtx-payout-execution-readiness` |
| UAT-ROUTE-08 | P2-18/P5-03 | `/ttgdtx/accounting-dashboard` and `/finance-desk` | `docs/P2_18_ACCOUNTING_DASHBOARD_UAT_RUNBOOK.md` + `docs/HEU_FINANCE_DESK_UAT_RUNBOOK_20260627.md` | KHTC + BGH + IT_DATA | Read-only behavior, source reconciliation, role denial, Finance Desk scope proof and reliance decision for dashboard users | Dashboard can write, source reconciliation is missing, Finance Desk leaks scope or BGH/KHTC reliance decision is unsigned | `npm.cmd run audit:ttgdtx-dashboard-source-reconciliation` |
| UAT-ROUTE-09 | P6-03 | `/audit` | `docs/TTGDTX_AUDIT_LOG_UAT_RUNBOOK.md` | Audit + IT_DATA + KHTC | Trace rows for create, update, check, approve, pay and source-control events with actor, entity, timestamp and controlled evidence reference | Trace row is missing, generic payload hides the actor/action, source-control trace is absent or evidence is unsigned | `npm.cmd run audit:ttgdtx-audit-trail-guard` |
| UAT-ROUTE-10 | P6-06 | `/audit` | `docs/HEU_NON_TTGDTX_CASCADE_FINDING_REGISTER_20260628.md` | IT_DATA + Audit + business owners | Conversion proof or narrow written waiver for unresolved findings plus rollback and closure decision evidence | Any protected finance, evidence, approval, payment, lead or audit path can be hard-deleted without signed conversion or waiver | `npm.cmd run audit:hard-delete-conversion-decision-queue` |
| UAT-ROUTE-11 | P0-09 | `/ttgdtx` | `docs/TTGDTX_PRODUCTION_OWNER_SIGNOFF_PACK_20260627.md` | BGH + IT_DATA + KHTC + PHAP_CHE + AUDIT + TRUONG_PHONG | Final owner decision manifest with signed UAT, evidence binder, migration, backup, role, audit and risk-closure references | Any required owner signs NO-GO/BLOCKED, any proof path is uncontrolled, or any prerequisite UAT remains pending | `npm.cmd run audit:ttgdtx-production-owner-signoff-pack` |

## 4. Closure Rule

All rows need controlled evidence reference, redaction reviewer, route result,
reviewer name and required owner signature outside Git/Codex/chat before the UAT
result can leave NO-GO.

## 5. Strict Boundary

This routing hub must not:

- Execute UAT.
- Accept evidence.
- Sign owner results.
- Grant or broaden access.
- Approve finance action, payout, revenue recognition or dashboard reliance.
- Approve migration or rollback.
- Approve owner GO/NO-GO.
- Mark production GO.

PASS_LOCAL means the routing structure, visible panel and audit guard exist.
Production remains NO-GO until controlled external evidence and required owner
signatures exist.
