# HEU CTHSSV Role And Negative Access Checklist

Status: PASS_LOCAL_CHECKLIST
Date: 2026-07-03
Scope: CTHSSV-08 role scope and negative-access proof for M06 CTHSSV.

Production/UAT status: NO-GO until signed role/workspace browser UAT, controlled
negative-user proof, redacted evidence references and owner decisions are
recorded outside Git/Codex/chat.

Decision values: CTHSSV_ROLE_SCOPE_READY / NO_GO / BLOCKED

## Boundary

This checklist prepares role/negative-access proof only. It does not grant
access, change role scope, create accounts, execute UAT, accept evidence,
approve enrollment, approve handover reliance, approve finance action, approve
owner GO/NO-GO or mark production GO.

## Required Actors

- ADMIN and BGH: read governance view only.
- TUYEN_SINH: source handover sender.
- CTHSSV: scoped receiver for student/profile handover.
- DAO_TAO: downstream enrollment/class reliance reviewer only.
- KHTC/accounting: downstream finance gate reviewer only after P0-19/P2-05/P2-03.
- IT_DATA and Audit: role matrix, negative-user proof and audit trace reviewer.
- OUT_OF_SCOPE_NEGATIVE_USER: must not read private CTHSSV handover/profile rows.

## Access Checklist

| Case | Control | Required local proof | Stop condition |
| --- | --- | --- | --- |
| CTHSSV-ROLE-01 | Route access gate | `/cthssv` requires authenticated user with ADMIN, BGH or `handover.accept_cthssv` | Anonymous or out-of-scope user opens the cockpit |
| CTHSSV-ROLE-02 | Workspace segment scope | Handover and lead queries use the active admission segment filter | Cross-segment CTHSSV packet is visible |
| CTHSSV-ROLE-03 | Source sender lane | TUYEN_SINH can create/source the handover packet but cannot bypass CTHSSV receiver decision | Source sender can mark CTHSSV owner acceptance |
| CTHSSV-ROLE-04 | CTHSSV receiver lane | CTHSSV sees only scoped Tuyen Sinh -> CTHSSV and CTHSSV -> KHTC/accounting packets | CTHSSV sees unrelated student/profile data |
| CTHSSV-ROLE-05 | Dao Tao reliance boundary | Dao Tao review remains enrollment/class reliance only and does not approve CTHSSV profile acceptance | Dao Tao or CTHSSV cockpit approves enrollment/class operation |
| CTHSSV-ROLE-06 | KHTC/accounting finance boundary | KHTC/accounting cannot use CTHSSV handover to create finance facts before P0-19/P2-05/P2-03 | CTHSSV action creates receivable, payment, invoice, voucher, payout or revenue state |
| CTHSSV-ROLE-07 | Negative user denial | OUT_OF_SCOPE_NEGATIVE_USER cannot read `/cthssv`, private profile rows, handover rows or evidence refs | Negative account can view CTHSSV private data |
| CTHSSV-ROLE-08 | Audit and redaction proof | IT_DATA/Audit record controlled redacted evidence refs, account label, route, result and blocker state | Raw PII, CCCD, phone, bank data, vouchers, passwords, OTPs, invite/reset links or API keys enter Git/Codex/chat |

## Result Ledger Fields

| field | required value |
| --- | --- |
| case_id | CTHSSV-ROLE-01 through CTHSSV-ROLE-08 |
| route | `/cthssv`, `/leads/[id]#lead-handover`, `/settings/scopes` or `/audit` |
| account_label | ADMIN, BGH, TUYEN_SINH, CTHSSV, DAO_TAO, KHTC, IT_DATA, AUDIT or OUT_OF_SCOPE_NEGATIVE_USER |
| expected_result | ALLOW_SCOPED, READ_ONLY_REVIEW, DENY or BLOCKED |
| actual_result | PASS, NO_GO or BLOCKED |
| controlled_evidence_ref | Redacted reference only |
| signer | Human reviewer outside Codex/chat |
| blocker_state | CLOSED, NO_GO or BLOCKED |

## Focused Command Set

```powershell
npm.cmd run audit:heu-cthssv-module-readiness
npm.cmd run audit:heu-role-scope-uat-pack
npm.cmd run audit:heu-lead-handover-policy
npm.cmd run audit:heu-lead-lifecycle-handover-uat-pack
npm.cmd run audit:ttgdtx-release-gates
npm.cmd run lint
npm.cmd run build
```

## Current Local Conclusion

CTHSSV-08 is locally packaged as a role/negative-access checklist, but the real
result remains NO-GO until signed browser UAT proves every positive and negative
account case outside Git/Codex/chat.
