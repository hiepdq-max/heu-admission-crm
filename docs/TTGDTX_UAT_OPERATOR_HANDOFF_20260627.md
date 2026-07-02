# TTGDTX UAT Operator Handoff 2026-06-27

Status: PASS_LOCAL_HANDOFF
Scope: TTGDTX 9+ internal browser UAT with synthetic accounts only.

This handoff tells the human operator which files to use and in what order. It
does not execute UAT, approve production, create accounts, collect evidence or
record owner GO/NO-GO.

The ordered route source for signed TTGDTX/Finance UAT is
`docs/TTGDTX_SIGNED_UAT_EXECUTION_ROUTING_HUB_20260628.md` and the visible
`/ttgdtx` hub. The operator must use that hub as the route checklist, not as
approval evidence.

## 1. Hard Boundaries

- Do not paste passwords, temporary passwords, OTPs, password reset links,
  account activation/invite links, service-role keys, API keys, raw student PII,
  CCCD, private phone numbers, bank accounts, bank statements, vouchers or raw
  payment data into Git, Codex or chat.
- Use synthetic UAT accounts only.
- Store screenshots and signed evidence in controlled storage outside Git.
- Only redacted evidence references may be copied into docs or issue notes.
- Any missing account, route result, negative-test result, redaction proof,
  reviewer or owner signature keeps production NO-GO.

## 2. Run Order

| Step | Operator action | File/source | Required result |
|---|---|---|---|
| UAT-HANDOFF-01 | Run static preflight before browser testing | `npm.cmd run audit:ttgdtx-uat-readiness`; `npm.cmd run audit:ttgdtx-signed-uat-execution-routing-hub`; `npm.cmd run audit:heu-role-scope-uat-pack`; `npm.cmd run audit:ttgdtx-release-gates` | PASS or stop |
| UAT-HANDOFF-02 | Create or reset synthetic accounts in Supabase Auth | `docs/TTGDTX_SYNTHETIC_UAT_ACCOUNT_SETUP.md` | Accounts exist; no real/temporary passwords, password reset links or account activation/invite links shared |
| UAT-HANDOFF-03 | Open the signed UAT execution routing hub and confirm route list | `/ttgdtx`; `docs/TTGDTX_SIGNED_UAT_EXECUTION_ROUTING_HUB_20260628.md`; `data-ttgdtx-signed-uat-execution-routing-hub="P0-08_UAT_ROUTING"` | UAT-ROUTE-01 through UAT-ROUTE-11 visible with route, runbook, owner, minimum proof, stop condition and guard |
| UAT-HANDOFF-03A | Confirm Finance Day-1 start-gate evidence path before any real-accounting route proof is used | `docs/HEU_FINANCE_DAY1_START_GATE_CHECKLIST_20260630.md`; `FIN-START-EVID-001` through `FIN-START-EVID-005` | `FIN_START_READY / NO_GO / BLOCKED` recorded outside Git/Codex/chat; this handoff still does not create real accounts |
| UAT-HANDOFF-03B | Confirm authority action queue before route results are recorded | `/ttgdtx`; `data-ttgdtx-signed-uat-authority-action-queue="P0-08_AUTHORITY_ACTIONS"`; `docs/TTGDTX_SIGNED_UAT_EXECUTION_ROUTING_HUB_20260628.md` Section 3 | UAT-AUTH-01 through UAT-AUTH-04 visible with `SIGNED_UAT_AUTHORITY_ACTION_READY / NO_GO / BLOCKED`; unresolved items stay NO_GO or BLOCKED until the right authority confirms them outside Git/Codex/chat |
| UAT-HANDOFF-04 | Execute the browser route/account matrix and signed UAT route list | `docs/TTGDTX_BROWSER_UAT_MATRIX_20260625.md`; Section 2.1 below | ALLOWED, BLOCKED, EMPTY_SCOPED_STATE, SIGNED_UAT_READY, NO_GO or BLOCKED recorded |
| UAT-HANDOFF-05 | Record each test result and redacted evidence reference | `docs/TTGDTX_UAT_EXECUTION_LOG_20260625.md` Section 5.2 | Account, route, result, evidence reference, redaction reviewer and reviewer recorded |
| UAT-HANDOFF-06 | Complete closure rows UAT-CLOSE-01 through UAT-CLOSE-06 | `docs/TTGDTX_UAT_EXECUTION_LOG_20260625.md` | UAT_PASS, UAT_FAIL or BLOCKED |
| UAT-HANDOFF-07 | Get required owner signatures outside Codex/chat | BGH, KHTC, PHAP_CHE, IT_DATA and Audit evidence pack | Signed PASS, FAIL or BLOCKED |

## 2.1 Signed UAT Route Execution Order

Run these rows in order. Each row needs a controlled evidence reference,
redaction reviewer, route result, reviewer name and required owner signature
outside Git/Codex/chat before it can move to `SIGNED_UAT_READY`.

| Route | Required runbook/source | Required result |
|---|---|---|
| UAT-ROUTE-01 P0-10 controlled evidence redaction intake | `docs/HEU_CONTROLLED_EVIDENCE_REDACTION_PACK_20260627.md` | Controlled storage location, redaction class, reviewer and evidence ID are ready before screenshots, vouchers, backup proof or signed result references |
| UAT-ROUTE-02 P0-03 backup/restore dry-run proof | `docs/STEP90_STEP110_BACKUP_RESTORE_OPERATOR_RUN_SHEET_20260627.md` | Backup ID, isolated restore target, preflight/postflight output and restore smoke-check evidence are referenced without raw secrets |
| UAT-ROUTE-03 Step90-Step110 signed production migration order | `docs/STEP90_STEP110_MIGRATION_ORDER_SIGNOFF_GUARD_20260627.md` | Signed migration order exists after accepted backup/restore evidence and rollback point |
| UAT-ROUTE-04 P6-04 role/workspace scope UAT | `docs/HEU_ROLE_SCOPE_UAT_EXECUTION_PACK_20260627.md` | Synthetic account route matrix proves allowed and blocked cases |
| UAT-ROUTE-05 P0-19 legal and finance gate UAT | `docs/P0_19_P2_01_P2_02_PILOT_OPEN_UAT_RUNBOOK.md` | Legal basis, tuition policy, waiver/exception decision and ALLOW_FINANCE gate proof exist |
| UAT-ROUTE-06 P3-01/P3-02 lead lifecycle and handover UAT | `docs/HEU_LEAD_LIFECYCLE_HANDOVER_UAT_RUNBOOK_20260628.md` | Handover cannot create finance facts or bypass P0-19/P2-05/P2-03 finance gates |
| UAT-ROUTE-07 P2-17 payout duplicate and dossier UAT | `docs/P2_17_DUPLICATE_PAYOUT_UAT_RUNBOOK.md` | Duplicate-click, overpay, voucher normalization, RPC-only path and BBNT/partner-invoice dossier evidence pass |
| UAT-ROUTE-08 P2-18/P5-03 dashboard and Finance Desk browser UAT | `docs/P2_18_ACCOUNTING_DASHBOARD_UAT_RUNBOOK.md`; `docs/HEU_FINANCE_DESK_UAT_RUNBOOK_20260627.md`; `docs/HEU_FINANCE_DAY1_START_GATE_CHECKLIST_20260630.md`; `docs/HEU_FINANCE_DAY1_RESULT_LEDGER_TEMPLATE_20260630.md` | Dashboard stays read-only, Finance Desk stays scoped, Finance Day-1 start-gate checklist and result ledger are recorded and reliance decision is signed |
| UAT-ROUTE-09 P6-03 audit-log traceability UAT | `docs/TTGDTX_AUDIT_LOG_UAT_RUNBOOK.md` | Trace rows show actor, entity, timestamp and controlled evidence reference for create/update/check/approve/pay/source-control events |
| UAT-ROUTE-10 P6-06 hard-delete/cascade closure proof | `docs/HEU_NON_TTGDTX_CASCADE_FINDING_REGISTER_20260628.md` | Conversion proof or written waiver exists for unresolved protected paths |
| UAT-ROUTE-11 P0-09 final owner GO/NO-GO decision | `docs/TTGDTX_PRODUCTION_OWNER_SIGNOFF_PACK_20260627.md`; `docs/HEU_FINANCE_DAY1_START_GATE_CHECKLIST_20260630.md`; `docs/HEU_FINANCE_DAY1_RESULT_LEDGER_TEMPLATE_20260630.md` | Final owner decision manifest references signed UAT, evidence binder, migration, backup, role, Finance Day-1 start-gate checklist, Finance Day-1 result ledger, P0-17 access closure decision, audit and risk-closure proof |

## 3. Stop Conditions

Stop UAT and keep production NO-GO if any of these occur:

- A synthetic account can see or edit data outside its role/workspace scope.
- A finance, payout, dashboard or source-control page relies only on hidden UI
  instead of server-side permission/scope checks.
- Out-of-scope or non-finance users can view restricted finance evidence.
- Any screenshot contains raw secrets, temporary passwords, password reset
  links, account activation/invite links, raw student identity data, bank
  account data, bank statements, vouchers or raw payment evidence.
- Owner sign-off is missing, unclear or recorded inside Codex/chat only.
- Any `UAT-ROUTE-*` row is missing minimum proof, has raw evidence, lacks
  redaction review, lacks required owner signature or is marked NO_GO/BLOCKED.
- Any UAT-AUTH-01 through UAT-AUTH-04 authority action is unresolved,
  ownerless, stored only in Codex/chat or interpreted as UAT approval.

## 4. Completion Rule

The UAT result may move from `BLOCKED_PENDING_MULTI_ACCOUNT_UAT` to `UAT_PASS`
only when:

1. All synthetic accounts are prepared.
2. Every required route/account case is tested.
3. Negative tests for finance and dashboard scope pass.
4. Evidence references are redacted and controlled.
5. The execution log has reviewer names and evidence references.
6. Required owners sign the final UAT result outside Codex/chat.
7. UAT-ROUTE-01 through UAT-ROUTE-11 are completed or explicitly marked
   NO_GO/BLOCKED with owner-visible reason.

Even after UAT_PASS, production remains NO-GO until backup/restore evidence,
signed migration order, hard-delete/cascade waiver or conversion and final
owner GO/NO-GO are complete.
