# TTGDTX Account-Control And Collateral Scope Decision

Status: PASS_LOCAL_SCOPE_DECISION
Date: 2026-06-27
Scope: TTGDTX tuition-account freeze/release, communication evidence and
collateral giai-chap separation
Mode: product scope decision only. This document does not approve production
migration, bank action, collateral release, payout, data import or production
GO.

## 1. Decision

For the current TTGDTX 9+ pilot, HEU will not build or operate a real bank
freeze/release action workflow inside the payment flow.

The pilot will only track account-control evidence as metadata through the
source/evidence control path:

- `docs/TTGDTX_ACCOUNT_FREEZE_RELEASE_ACCEPTANCE_NOTE_20260625.md`
- P2-11 source/evidence control
- P2-19 real-data evidence metadata
- signed UAT evidence before any real operation

Collateral giai-chap is explicitly outside the normal TTGDTX tuition collection,
reconciliation and partner-payment workflow. It must stay in a separate
restricted legal-finance register.

## 2. In Scope For Current Pilot

| Area | Current pilot scope | Write behavior |
|---|---|---|
| Tuition-account freeze notice | Metadata/evidence link only | No bank action |
| Tuition-account release request | Metadata/evidence link only | No bank action |
| Communication evidence | Metadata about channel, owner and acknowledgement | No raw student/bank recipient list |
| BBNT evidence | Required payment dossier evidence | Blocks P2-15/P2-17 if missing |
| Partner invoice | Required payment dossier evidence | Blocks P2-15/P2-17 if missing |
| Collateral giai-chap | Separate restricted register decision only | Not in TTGDTX payment flow |

## 3. Out Of Scope Until Later Approval

- Sending bank freeze/release instructions from the app.
- Marking a bank account as actually frozen or released without bank
  confirmation and human finance approval.
- Recording full student bank account numbers, collateral asset details,
  security-registration identifiers or credit-contract personal data in public
  UI, chat, logs or Git.
- Mixing collateral release/giai-chap with tuition-account release.
- Allowing AI to approve, freeze, release, giai-chap, pay or mark production
  GO.

## 4. Future Build Gate

A real account-control workflow can be built only after all items below are
approved:

1. Owner approval from KHTC, CTHSSV, Phap Che, Audit and BGH.
2. Restricted data model for sensitive account-control details.
3. Role matrix proving who can view metadata versus raw restricted details.
4. Communication evidence model for students, parents, centers and class owners.
5. Bank confirmation and exception-owner fields.
6. Audit log for every state transition.
7. Backup/restore dry-run evidence.
8. Signed UAT using anonymized or formally approved data.

## 5. Stop Conditions

The app must stop or mark NO-GO if:

- A user tries to use P2-10, P2-13, P2-15, P2-16 or P2-17 as a bank
  freeze/release tool.
- Collateral release appears in the same queue as tuition-account release.
- Raw bank, collateral, CCCD, student list or credit-contract data is pasted
  into Codex/chat, Git, logs or unrestricted UI.
- A dashboard implies that account freeze/release or collateral release has
  been approved by AI.

## 6. Local Control Decision

This decision satisfies the local requirement to implement or explicitly defer
the account-control workflow for the TTGDTX pilot.

PASS_LOCAL means scope is clarified and the risky real workflow is deferred. It
does not approve production bank operation, collateral release, production data
import, real UAT, production migration or production GO.
