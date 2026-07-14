# HEU STAGE 007 - BGH, Finance and HOU Control Readiness

Task ID: HEU-STAGE-007-BGH-FINANCE-HOU-CONTROL-READINESS
Date: 2026-07-14
Status: DRAFT_CONTROL_READINESS
Production status: NO-GO

## Separation contract

BGH consumes read-only confirmed summaries. KHTC may review synthetic finance
metadata and reconciliation drafts only. HOU remains a separate partner ledger;
it is not HEU internal training data. No payment, COM, revenue recognition,
invoice issuance or official finance posting is enabled by this pack.

## Readiness matrix

| Lane | Allowed first slice | Required evidence | Forbidden action |
|---|---|---|---|
| BGH | hot-spot and confirmed summary read-only | source map + scope trace | edit/approve/GO |
| KHTC | finance summary and reconciliation draft | finance owner + audit trace | payment/invoice/COM |
| HOU | handover/ledger metadata only | contract reference + reconciliation | merge with HEU student master |
| IT_DATA/Audit | control and evidence review | audit log + redaction check | approve business facts |

## Gates

1. Auth/profile/position/role/department/workspace mapping is verified.
2. Cross-module negative scope tests pass.
3. Finance/HOU source metadata and contract references exist.
4. BGH view is read-only and source-reliant.
5. Duplicate payment, hard-delete and raw-bank-data controls pass.
6. Owner review and rollback evidence exist.

Any missing gate keeps the lane `NO_GO`. AI may summarize or flag anomalies but
cannot approve, post, pay, calculate COM or change source data.

Next task: `HEU-STAGE-008-UAT-OWNER-ROLLBACK-STAGING-GATE`.
