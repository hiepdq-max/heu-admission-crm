# HEU Finance Day-1 Start Gate Checklist 2026-06-30

Status: PASS_LOCAL_CHECKLIST
Scope: Evidence checklist before any real-accounting invite/create
Production status: NO-GO until signed UAT, evidence acceptance and final owner GO exist

## 1. Purpose

Use this checklist outside Git/Codex/chat before the first real-accounting
account is invited, created or activated. It turns `FIN_START_READY / NO_GO /
BLOCKED` into five evidence rows that IT_DATA, KHTC, BGH, Audit and PHAP_CHE can
review before `FIN_ACTIVATION_READY`.

This checklist does not create accounts, send invites, store passwords, grant
access, execute UAT, accept evidence, approve finance reliance, approve access
closure, move money, issue bank instructions or mark production GO.

Boundary phrase: does not create accounts, send invites, store passwords, grant access, execute UAT, accept evidence, approve finance reliance, approve access closure, move money, issue bank instructions or mark production GO.

## 2. Forbidden Content

Do not paste or attach passwords, temporary passwords, OTPs, reset links,
account invite/activation links, service-role keys, backup dumps, raw PII, CCCD,
bank accounts, vouchers, bank statements, private contract bodies or raw
screenshots.

Record only controlled evidence IDs, owner names, decision values and redacted
references.

## 3. Start Gate Evidence Rows

| Evidence ID | Gate | Owner | Required proof | Decision | Stop note |
|---|---|---|---|---|---|
| `FIN-START-EVID-001` | `FIN-START-01` P0-03 backup/restore evidence accepted | IT_DATA + Audit | Backup ID, restore target, operator run sheet, preflight/postflight and restore smoke-check evidence ID | `FIN_START_READY / NO_GO / BLOCKED` | Stop if backup/restore evidence is missing, unsigned, uncontrolled or only described in chat |
| `FIN-START-EVID-002` | `FIN-START-02` signed finance UAT route package ready | KHTC + BGH + IT_DATA + Audit | Signed or explicitly blocked route plan for P6-04, P2-18, P5-03, P6-03 and P2-17 | `FIN_START_READY / NO_GO / BLOCKED` | Stop if UAT route evidence is ownerless, unsigned, raw or missing |
| `FIN-START-EVID-003` | `FIN-START-03` P0-10 controlled evidence location ready | IT_DATA + Audit | Controlled evidence location, redaction reviewer and forbidden-content checklist | `FIN_START_READY / NO_GO / BLOCKED` | Stop if raw PII, CCCD, bank data, vouchers, passwords, reset links or invite links enter Git/Codex/chat |
| `FIN-START-EVID-004` | `FIN-START-04` P0-14/P0-17 result and access-closure path ready | IT_DATA + Audit + KHTC | P0-14 intake ledger, Finance Day-1 result ledger and per-lane P0-17 access closure path | `FIN_START_READY / NO_GO / BLOCKED` | Stop if activation can start without a result row or access-closure decision path |
| `FIN-START-EVID-005` | `FIN-START-05` human owner boundary acknowledged | BGH + KHTC + PHAP_CHE + Audit + IT_DATA | Owners acknowledge PASS_LOCAL does not approve access, UAT, finance reliance, migration, owner GO or production GO | `FIN_START_READY / NO_GO / BLOCKED` | Stop if any operator treats this checklist as approval to create accounts, grant access, accept UAT, move money or mark production GO |

## 4. Handoff Rule

Do not start `FIN-ACT-EVID-001` in
`docs/HEU_FINANCE_DAY1_ACCOUNT_ACTIVATION_TEMPLATE_20260630.md` until every
start-gate row has a controlled evidence ID and a recorded owner decision.

If any row is `NO_GO` or `BLOCKED`, keep the first real-accounting account
closed and record the blocker in the controlled evidence location.
