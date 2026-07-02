# HEU Real Operation Closure Plan 2026-07-02

Status: PASS_LOCAL_CLOSURE_PLAN
Decision value: REAL_OPERATION_READY / NO_GO / BLOCKED
Scope: owner-confirmed closure work required before HEU can move from
read-only pilot control into real operation.

This plan turns the current missing items into a concrete closure board. It is
not a production approval, not signed UAT, not finance reliance, not legal
advice and not owner GO/NO-GO. Real operation remains NO-GO until every lane
below has controlled evidence IDs and required owner signatures outside
Git/Codex/chat.

## Closure Lanes

| Lane | Owner | Required closure | Stop condition |
|---|---|---|---|
| `REAL-OPS-01` Backup/restore proof | IT_DATA + Audit | Real backup ID, restore target, smoke-check result and owner acceptance for preserved P0-19, P2-18, P5-03, P6-04 and P0-17 evidence state | No restore proof, raw evidence in Git/Codex/chat or unclear target identity |
| `REAL-OPS-02` Signed migration order | IT_DATA + KHTC + PHAP_CHE + BGH | Signed Step90-Step110 migration order after backup/restore evidence is accepted | Migration order is unsigned, oral, broad or treated as approved by PASS_LOCAL |
| `REAL-OPS-03` Signed UAT closure | BGH + KHTC + PHAP_CHE + Audit + IT_DATA + process owners | Signed UAT results for P0-19, P2-17, P2-18/P5-03, P6-03, P6-04 and required handover routes | Any route stays PENDING, lacks controlled evidence ID or lacks required signer |
| `REAL-OPS-04` Finance reliance closure | KHTC + BGH + Audit | Finance Desk and accounting-dashboard source reconciliation, Day-1 result ledger, access closure and reliance decision | Dashboard/Finance Desk mismatch, unsigned reliance or open access-retain/revoke decision |
| `REAL-OPS-05` Legal, invoice and chung-tu confirmation | PHAP_CHE + KHTC | Legal, SOP, tuition, invoice and chung-tu decision basis with controlled evidence class and signer owner | Contract/SOP/tax-document basis is unclear or AI/Codex is asked to decide the legal position |
| `REAL-OPS-06` Hard-delete/cascade closure | IT_DATA + Audit + business owners | Hard-delete/cascade conversion evidence or written owner waiver for every protected path still open | A protected delete/cascade path has no conversion proof and no signed waiver |
| `REAL-OPS-07` HOU and Short Course scope | HOU owner + DAO_TAO + CTHSSV + KHTC + PHAP_CHE | HOU and Short Course phase decision, UAT plan, report-view signoff or explicit owner-approved defer decision | HOU or Short Course is folded into TTGDTX production without signed scope separation |
| `REAL-OPS-08` Final owner GO/NO-GO package | BGH + IT_DATA + KHTC + PHAP_CHE + Audit + TRUONG_PHONG | Final owner GO/NO-GO manifest only after `REAL-OPS-01` through `REAL-OPS-07` have controlled evidence IDs | Owner GO/NO-GO is requested before all prerequisite lanes have signed closure |

## REAL-OPS-01 Source Intake

Use `docs/HEU_REAL_OPS_01_BACKUP_RESTORE_PROOF_INTAKE_20260702.md` and
`data-p003-real-ops-01-proof-intake="REAL-OPS-01_P0-03"` to prepare the
backup/restore proof lane. Decision value:
`REAL_OPS_01_PROOF_READY / NO_GO / BLOCKED`.

The source intake records only controlled evidence IDs, redaction owner,
backup reference, restore target proof, smoke-check result and closure decision
references. It does not accept evidence, execute backup, execute restore,
approve migration-order review or mark production GO.

## Operating Rule

For each lane, the local system may show status, owner, missing proof and stop
condition. It must not create accounts, send real email, create real
tasks/tickets, collect secrets, accept evidence, execute UAT, approve finance
reliance, approve legal position, approve waiver, run production migration,
issue bank instructions, post vouchers, issue invoices or mark production GO.

## Master Control Surface

The read-only in-app surface is
`components/master-control/production-readiness-blocker-summary.tsx` with
`data-heu-real-operation-closure-board="P0-03_P0-09_P2-18_P5-03_P6-04"`.

The board is a status and routing surface only. It keeps real operation
blocked until every owner provides controlled evidence and signature outside
Git/Codex/chat.

## PASS_LOCAL Checks

- `npm.cmd run audit:heu-bgh-dashboard-spec`
- `npm.cmd run audit:heu-implementation-log`
- `npm.cmd run lint`
- `npm.cmd run build`
- `git diff --check`
