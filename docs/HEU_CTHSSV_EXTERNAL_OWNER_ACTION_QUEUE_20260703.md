# HEU CTHSSV External Owner Action Queue - 2026-07-03

Status: PASS_LOCAL_OWNER_ACTION_QUEUE
Decision lane: CTHSSV_EXTERNAL_OWNER_ACTION_READY / NO_GO / BLOCKED
Production/UAT status: NO-GO until signed CTHSSV owner UAT, signed
role/negative-access UAT, controlled evidence/audit trace, final module closure,
handover reliance decision, finance gate preservation proof, signed UAT evidence
intake refs and final owner quorum GO/NO-GO are completed outside Git/Codex/chat.

## Purpose

This queue turns the remaining M06 CTHSSV real-operation blockers into external
owner actions. It is local packaging only. It does not execute UAT, accept
evidence, approve enrollment, approve handover reliance, create student finance
facts, approve finance action, approve owner GO/NO-GO or mark production GO.

Secret boundary: do not paste names, phone numbers, emails, CCCD, bank data,
profile IDs, vouchers, passwords, temporary passwords, OTPs, password reset
links, account activation/invite links, service-role keys, raw screenshots or
raw evidence into this file, Git, Codex/chat or screenshots. Use redacted owner
labels and controlled evidence IDs only.

## Current Blocker Shape

All local CTHSSV closure slices are packaged, but real operation remains NO-GO:

- Signed CTHSSV owner UAT is still required.
- Signed role/negative-access UAT is still required.
- Signed controlled evidence/audit trace is still required.
- Signed UAT evidence intake refs are still required.
- Signed final module closure is still required.
- Handover reliance decision is still required.
- Finance gate preservation proof is still required before KHTC/accounting
  reliance.
- Final owner quorum GO/NO-GO must be recorded outside Git/Codex/chat.

PASS_LOCAL checks may continue, but no owner should treat the CTHSSV cockpit,
local audit output or this queue as a signed UAT pass or student/finance
reliance decision.

## Required Owner Action Queue

| Action | Owner lane | Required action outside Codex/chat | Required result | Stop condition |
|---|---|---|---|---|
| CTHSSV-OWNER-ACTION-01 | CTHSSV + Tuyen Sinh + Audit | Execute signed CTHSSV owner UAT for workspace-scoped handover packets and accept/reject trace | CTHSSV owner UAT result is signed with date, signer lane, route and controlled evidence ID | Unsigned browser run is treated as CTHSSV profile acceptance |
| CTHSSV-OWNER-ACTION-02 | IT_DATA + TRUONG_PHONG + Audit | Execute signed role/negative-access UAT with authorized CTHSSV, sender, downstream and out-of-scope accounts | CTHSSV_ROLE_SCOPE_READY / NO_GO / BLOCKED is recorded with denial proof | Role proof is missing, ownerless, uses raw private data or grants broad access |
| CTHSSV-OWNER-ACTION-03 | Audit + CTHSSV + IT_DATA | Store controlled evidence/audit trace refs for handover state, accept/reject action, role proof, signed UAT evidence intake refs and redaction review | CTHSSV_EVIDENCE_TRACE_READY / NO_GO / BLOCKED has controlled evidence IDs and reviewer lane | Raw evidence enters Git/Codex/chat or audit trace cannot prove actor/time/state |
| CTHSSV-OWNER-ACTION-04 | CTHSSV + BGH + Audit | Sign final module closure against CTHSSV-00 through CTHSSV-10 and CTHSSV-CLOSE-01 through CTHSSV-CLOSE-08 | CTHSSV_FINAL_CLOSURE_READY / NO_GO / BLOCKED is signed outside Git/Codex/chat | Final closure is inferred from local audit success |
| CTHSSV-OWNER-ACTION-05 | Tuyen Sinh + CTHSSV + Dao Tao + Audit | Record the handover reliance decision and enrollment boundary for student/profile state | CTHSSV_HANDOVER_READY / NO_GO / BLOCKED has signer, date, scope and blocker state | Handover is used as enrollment/class/training operation approval |
| CTHSSV-OWNER-ACTION-06 | KHTC/accounting + CTHSSV + Audit | Prove P0-19, P2-05 and P2-03 remain the finance gates before downstream reliance | Finance gate preservation proof is signed with controlled evidence ID | CTHSSV action creates receivable, payment, invoice, voucher, payout or revenue state |
| CTHSSV-OWNER-ACTION-07 | Process owners + Audit | Close every CTHSSV NO_GO/BLOCKED item with owner, due date and evidence path | Blocker register shows CLOSED, NO_GO or BLOCKED with accountable owner | Blocker is closed by AI/PASS_LOCAL only or has no owner |
| CTHSSV-OWNER-ACTION-08 | BGH + IT_DATA + KHTC + PHAP_CHE + Audit + TRUONG_PHONG | Record final owner quorum GO/NO-GO after signed UAT, evidence, role proof, finance proof and blockers are resolved | CTHSSV_EXTERNAL_OWNER_ACTION_READY / NO_GO / BLOCKED is recorded outside Git/Codex/chat | Final owner quorum GO/NO-GO is missing, unsigned or inferred from local checks |

## Required Re-Run Sequence

Run only after the owner actions above are completed outside Codex/chat:

```powershell
npm.cmd run check:heu-cthssv-local-completion
npm.cmd run audit:heu-cthssv-module-readiness
npm.cmd run audit:heu-lead-handover-policy
npm.cmd run audit:heu-lead-lifecycle-handover-uat-pack
npm.cmd run audit:heu-role-scope-uat-pack
npm.cmd run audit:heu-controlled-evidence-redaction-pack
npm.cmd run audit:ttgdtx-release-gates
```

Expected state before signed CTHSSV reliance:

- CTHSSV-OWNER-ACTION-01 through CTHSSV-OWNER-ACTION-08 have owner result,
  signer/date, controlled evidence ID and blocker state.
- `CTHSSV_EXTERNAL_OWNER_ACTION_READY / NO_GO / BLOCKED` is recorded outside
  Git/Codex/chat.
- No raw PII, CCCD, phone, bank data, vouchers, passwords, OTPs, reset links,
  invite links, service-role keys or raw screenshots enter Git/Codex/chat.

## CTHSSV Stop Rule

Keep M06 CTHSSV at NO-GO for real operation if any of these is true:

- Signed CTHSSV owner UAT is missing.
- Signed role/negative-access UAT is missing.
- Controlled evidence/audit trace refs are missing, raw, uncontrolled or
  ownerless.
- Final module closure is unsigned.
- Handover reliance decision is missing.
- Finance gate preservation proof is missing.
- A CTHSSV blocker is ownerless or closed only by AI/PASS_LOCAL.
- Final owner quorum GO/NO-GO is missing, unsigned or stored only in
  Git/Codex/chat.

This queue is intentionally stricter than local packaging. It protects CTHSSV
UAT, evidence, role, finance and final owner boundaries and does not approve
signed UAT, handover reliance, finance reliance, owner GO/NO-GO or production
GO.
