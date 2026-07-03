# HEU CTHSSV Signed UAT Evidence Intake - 2026-07-03

Status: PASS_LOCAL_EVIDENCE_INTAKE
Decision lane: CTHSSV_SIGNED_UAT_EVIDENCE_READY / NO_GO / BLOCKED
Production/UAT status: NO-GO until signed CTHSSV owner UAT,
role/negative-access proof, controlled evidence/audit trace, finance gate proof,
handover reliance decision and final owner quorum are recorded outside
Git/Codex/chat.

## Purpose

This intake pack defines how signed CTHSSV UAT evidence references must be
recorded after external owners complete real UAT outside Codex/chat.

It is local intake packaging only. It does not execute UAT, accept evidence,
approve enrollment, approve handover reliance, create student finance facts,
approve finance action, approve owner GO/NO-GO or mark production GO.

## Intake Boundary

Only non-secret references may be recorded here or in any tracked file. The
actual evidence package, screenshots, raw exports, signed PDFs and reviewer
notes must stay in the approved controlled evidence location outside
Git/Codex/chat.

Forbidden content boundary: do not paste raw PII, CCCD, phone numbers, emails,
profile IDs, bank data, vouchers, passwords, temporary passwords, OTPs,
password reset links, account activation/invite links, service-role keys, API
keys, raw screenshots, raw exports, signed PDFs or raw evidence into Git,
Codex/chat, docs or screenshots.

## Signed UAT Evidence Intake Matrix

| Case | Evidence package | Required intake fields | Stop condition |
| --- | --- | --- | --- |
| CTHSSV-UAT-EVID-01 | Signed evidence storage location | evidence_ref, storage_class, owner_lane and forbidden-content review point to the approved controlled store | Evidence is pasted into Git/Codex/chat or storage class is unknown |
| CTHSSV-UAT-EVID-02 | Signed browser UAT result package | linked_uat_case, route_or_artifact, signer lane, signed_date, result and blocker_state are recorded | Browser run is unsigned or treated as accepted from PASS_LOCAL |
| CTHSSV-UAT-EVID-03 | Role/negative-access proof package | linked_uat_case, route_or_artifact, owner_lane, redaction_reviewer and blocker_state cover allowed and denied accounts | Role proof is missing, ownerless, broad or uses real private data in tracked work |
| CTHSSV-UAT-EVID-04 | Audit-event trace package | evidence_ref, audit route, actor/time/state reference and linked_review_item are present | Audit trace cannot prove actor, timestamp, route or state |
| CTHSSV-UAT-EVID-05 | Redaction reviewer package | redaction_reviewer, storage_class, forbidden-content boundary and review result are signed outside Codex/chat | Redaction reviewer is missing or raw evidence enters tracked work |
| CTHSSV-UAT-EVID-06 | Finance gate proof package | owner_lane, linked_owner_action, route_or_artifact and result prove P0-19, P2-05 and P2-03 remain required | CTHSSV evidence is treated as receivable, payment, invoice, voucher, payout or revenue approval |
| CTHSSV-UAT-EVID-07 | Owner signoff linkage package | linked_owner_action, linked_review_item, signed_date, result and blocker_state connect UAT evidence to owner decision | Owner signoff is detached from UAT result, blocker state or evidence ref |
| CTHSSV-UAT-EVID-08 | Final owner quorum evidence package | evidence_ref, owner_lane, final quorum result, signed_date and blocker_state are recorded outside Codex/chat | Final owner GO/NO-GO is missing, unsigned or inferred from local checks |

## Required Intake Fields

| field | required value |
| --- | --- |
| evidence_ref | Controlled redacted reference only; no raw evidence |
| storage_class | CONTROLLED_REDACTED or CONTROLLED_SENSITIVE outside Git |
| owner_lane | Responsible owner lane, not personal secret data |
| linked_uat_case | CTHSSV-UAT-01 through CTHSSV-UAT-08 or N/A |
| linked_owner_action | CTHSSV-OWNER-ACTION-01 through CTHSSV-OWNER-ACTION-08 |
| linked_review_item | CTHSSV-REVIEW-01 through CTHSSV-REVIEW-08 or N/A |
| route_or_artifact | `/cthssv`, `/leads/[id]`, `/audit`, owner signoff pack or controlled artifact label |
| redaction_reviewer | IT_DATA or Audit reviewer outside Codex/chat |
| signed_date | Signed date outside Codex/chat |
| result | CTHSSV_SIGNED_UAT_EVIDENCE_READY / NO_GO / BLOCKED |
| blocker_state | CLOSED, NO_GO or BLOCKED |
| forbidden_content_boundary | No raw PII, CCCD, phone, bank data, vouchers, secrets, raw screenshots, raw exports, signed PDFs or raw evidence in Git/Codex/chat |

## Required Local Re-Run

```powershell
npm.cmd run audit:heu-cthssv-module-readiness
npm.cmd run check:heu-cthssv-local-completion -- --runtime
```

Expected local result:

- `CTHSSV_LOCAL_COMPLETION_READY: PASS_LOCAL`
- `CTHSSV_REAL_OPERATION_READY: NO_GO`
- `CTHSSV_SIGNED_UAT_EVIDENCE_READY / NO_GO / BLOCKED` is an external evidence
  intake state, not local approval.

## Intake Stop Rule

Keep the signed UAT evidence intake at NO_GO or BLOCKED if:

- Any required owner signature, signer lane, signed date or controlled evidence
  reference is missing.
- Role/negative-access proof, audit trace, redaction review or finance gate
  preservation proof is missing.
- Any evidence package is raw, uncontrolled, ownerless or stored only in
  Git/Codex/chat.
- Any result implies enrollment approval, handover reliance, finance action,
  owner GO/NO-GO or production GO from PASS_LOCAL.

This intake pack makes evidence references auditable after real owner work. It
does not make M06 CTHSSV ready for real operation.
