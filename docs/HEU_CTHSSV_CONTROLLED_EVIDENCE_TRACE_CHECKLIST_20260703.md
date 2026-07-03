# HEU CTHSSV Controlled Evidence Trace Checklist - 2026-07-03

Status: PASS_LOCAL_TRACE
Date: 2026-07-03
Scope: CTHSSV-09 audit and controlled evidence trace for M06 CTHSSV.

## Boundary

This checklist packages the local evidence/audit trace route for CTHSSV UAT,
owner signoff and handover reliance. It does not execute UAT, accept evidence,
approve enrollment, approve handover reliance, create student finance facts,
approve finance action, approve owner GO/NO-GO or mark production GO.

Production/UAT status: NO-GO until signed UAT rows, owner signoff rows, role
scope proof, audit rows and controlled redacted evidence references are recorded
outside Git/Codex/chat by the responsible owners.

## Decision Values

- CTHSSV_EVIDENCE_TRACE_READY / NO_GO / BLOCKED
- CTHSSV_UAT_RESULT_READY / NO_GO / BLOCKED
- CTHSSV_OWNER_READY / NO_GO / BLOCKED

## Required Actors

- CTHSSV owner: confirms profile/handover reliance scope.
- Tuyen Sinh owner: confirms source packet and sender handover decision.
- Dao Tao owner: confirms enrollment/class reliance stays outside CTHSSV
  cockpit approval.
- KHTC/accounting owner: confirms finance reliance remains behind P0-19,
  P2-05 and P2-03.
- IT_DATA and Audit: confirm controlled evidence ID, redaction reviewer,
  audit-event reference and storage class.
- Final owner quorum: records CTHSSV_EVIDENCE_TRACE_READY, NO_GO or BLOCKED
  outside Codex/chat.

## Evidence Trace Matrix

| Case | Control | Required redacted proof | Stop condition |
| --- | --- | --- | --- |
| CTHSSV-EVID-01 | Controlled evidence ID | Every CTHSSV-UAT and CTHSSV-SIGN row uses a non-secret controlled evidence reference from the approved evidence location | Evidence ID is missing, ambiguous or replaced by raw proof |
| CTHSSV-EVID-02 | Redaction reviewer | IT_DATA/Audit reviewer signs that raw PII, CCCD, phone, bank data, vouchers and secrets are excluded from tracked work | Redaction reviewer is missing or reviewer authority is unclear |
| CTHSSV-EVID-03 | UAT ledger linkage | CTHSSV-UAT-01 through CTHSSV-UAT-08 each point to one controlled evidence ref and one signer/date row | UAT row cannot be linked to evidence and signer |
| CTHSSV-EVID-04 | Owner signoff linkage | CTHSSV-SIGN-01 through CTHSSV-SIGN-06 each point to the related UAT case, blocker state and evidence ref | Owner signoff is detached from UAT result or blocker state |
| CTHSSV-EVID-05 | Audit event trace | Accept/reject, handover state and evidence-reference review can be traced by actor, time, route and result | Audit trace cannot prove actor, timestamp, state or route |
| CTHSSV-EVID-06 | Role/negative-access trace | CTHSSV-ROLE-01 through CTHSSV-ROLE-08 link account label, route, result and blocker state without exposing private data | Role proof cannot connect the account, route, result and blocker |
| CTHSSV-EVID-07 | Finance gate trace | CTHSSV_TO_ACCOUNTING context points to P0-19, P2-05 and P2-03 gates without creating receivable, payment, invoice, voucher, payout or revenue state | CTHSSV evidence is used as finance approval or posting proof |
| CTHSSV-EVID-08 | Forbidden-content stop | P0-10-ACCEPT-02 and P0-10-ACCEPT-05 from `docs/HEU_CONTROLLED_EVIDENCE_REDACTION_PACK_20260627.md` remain mandatory before any reference enters tracked work | Raw PII, CCCD, phone, bank data, vouchers, passwords, OTPs, invite/reset links, service-role keys or API keys enter Git/Codex/chat |

## Result Ledger Fields

| field | required value |
| --- | --- |
| evidence_ref | Controlled redacted evidence reference only |
| source_case | CTHSSV-EVID-01 through CTHSSV-EVID-08 |
| linked_uat_case | CTHSSV-UAT-01 through CTHSSV-UAT-08 or N/A |
| linked_owner_case | CTHSSV-SIGN-01 through CTHSSV-SIGN-06 or N/A |
| linked_role_case | CTHSSV-ROLE-01 through CTHSSV-ROLE-08 or N/A |
| audit_event_ref | Non-secret audit event reference, route and timestamp |
| redaction_reviewer | IT_DATA or Audit reviewer outside Codex/chat |
| storage_class | CONTROLLED_REDACTED or CONTROLLED_SENSITIVE outside Git |
| result | CTHSSV_EVIDENCE_TRACE_READY / NO_GO / BLOCKED |
| signer | Named human owner outside Codex/chat |
| date | Signed date outside Codex/chat |
| blocker_state | CLOSED, NO_GO or BLOCKED |

## Focused Command Set

```powershell
npm.cmd run audit:heu-cthssv-module-readiness
npm.cmd run audit:heu-controlled-evidence-redaction-pack
npm.cmd run audit:heu-role-scope-uat-pack
npm.cmd run audit:heu-lead-handover-policy
npm.cmd run audit:heu-lead-lifecycle-handover-uat-pack
npm.cmd run audit:ttgdtx-release-gates
```

## Local Conclusion

CTHSSV-09 is locally packaged as a controlled evidence/audit trace checklist,
but the real evidence trace remains NO-GO until owners sign the controlled
evidence references, redaction review, audit rows and UAT/signoff rows outside
Git/Codex/chat.
