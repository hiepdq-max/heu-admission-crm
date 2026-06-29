# HEU Lead Lifecycle and Handover UAT Runbook 2026-06-28

Status: PASS_LOCAL_TEMPLATE

Scope: P3-01 lead lifecycle and P3-02 lead-to-student handover for the
TTGDTX-linked pilot path.

Production status: NO-GO until signed UAT evidence, backup/restore evidence,
role/workspace UAT, audit trace evidence, hard-delete/cascade conversion or
waiver evidence and final owner Go/No-Go exist outside Git/Codex/chat.

This runbook prepares browser UAT only. It does not approve enrollment,
handover reliance, receivable creation, tuition collection, invoice issuance,
finance posting, UAT acceptance, owner waiver or production GO.

## 1. Required Local Preflight

Run these before the human UAT window:

```powershell
npm.cmd run audit:heu-lead-lifecycle-handover-uat-pack
npm.cmd run audit:heu-lead-lifecycle-standard
npm.cmd run audit:heu-lead-handover-policy
npm.cmd run audit:ttgdtx-release-gates
npm.cmd run audit:heu-vietnamese-text-encoding
npm.cmd run lint
npm.cmd run build
git status --short --branch
```

All local checks are PASS_LOCAL only. They prove that the package is coherent;
they do not prove that real UAT was executed.

## 2. Test Accounts

Use synthetic or redacted UAT accounts only.

| Account label | Required role/scope | Must prove |
|---|---|---|
| `UAT_TUYEN_SINH_TTGDTX` | Tuyen Sinh, scoped to TTGDTX segment | Can view and update scoped lead lifecycle only |
| `UAT_CTHSSV` | CTHSSV, scoped receiver | Can receive or reject assigned handover only |
| `UAT_DAO_TAO` | Dao Tao, scoped receiver/reviewer | Can review training-related handover context only |
| `UAT_KHTC_TTGDTX_OPERATOR` | KHTC, TTGDTX finance scope | Can rely only after accepted handover and P0-19/P2-05/P2-03 gates |
| `UAT_PHAP_CHE` | Phap Che/legal review | Can verify P0-19 legal/tuition gate references |
| `UAT_AUDIT` | Audit/read-only | Can inspect redacted evidence and audit rows |
| `UAT_OUT_OF_SCOPE_STAFF` | No TTGDTX lead/handover scope | Is blocked or sees empty scoped state |

## 3. P3 UAT Case Matrix

| Case | Actor | Route | Expected evidence | Stop condition |
|---|---|---|---|---|
| P3-UAT-01 | `UAT_TUYEN_SINH_TTGDTX` | `/leads` | Scoped lead list shows only assigned/allowed TTGDTX leads with source, segment, owner and status context | Out-of-scope leads, raw private evidence or unrestricted finance totals are visible |
| P3-UAT-02 | `UAT_TUYEN_SINH_TTGDTX` | `/leads/[id]` | `FOLLOW_UP` requires `next_followup_at`; `LOST` requires `lost_reason`; each status change has actor/time trace | Required date/reason is bypassed or status change lacks trace |
| P3-UAT-03 | `UAT_TUYEN_SINH_TTGDTX` + `UAT_PHAP_CHE` | `/leads/[id]` | `ELIGIBLE` and `ENROLLED` are blocked until P0-19 legal/tuition gate, P2-01 contract master and P2-02 tuition policy are ready | Lead lifecycle creates receivable, collection, invoice, revenue or finance approval |
| P3-UAT-04 | `UAT_TUYEN_SINH_TTGDTX` -> `UAT_CTHSSV` | `/leads/[id]` | Handover packet has lead id/code, status, segment, program/major, source reference and maker department | Handover is accepted without scoped packet identity or controlled evidence reference |
| P3-UAT-05 | `UAT_CTHSSV` + `UAT_DAO_TAO` | `/leads/[id]` | Receiver can accept or reject only scoped packets; rejection includes reason | Out-of-scope receiver can read, accept, reject or rely on the handover |
| P3-UAT-06 | `UAT_KHTC_TTGDTX_OPERATOR` | `/leads/[id]` | KHTC relies on accepted context only through P0-19, P2-05 and P2-03 finance gates | KHTC relies on unaccepted handover or P3 evidence directly creates receivable/payment state |
| P3-UAT-07 | `UAT_OUT_OF_SCOPE_STAFF` | `/leads`, `/leads/[id]` | User is blocked or sees empty scoped state without private lead/handover detail | Workspace filtering is UI-only and server data still leaks |
| P3-UAT-08 | Audit + process owner | Controlled evidence folder | Redacted screenshots, route/account labels, sampled audit rows and P3_01/P3_02 decisions are signed outside Codex/chat | PASS_LOCAL or AI output is treated as signed UAT, handover acceptance, finance approval or production GO |

## 4. Evidence Record Template

| Field | Value |
|---|---|
| Evidence ID |  |
| Case ID |  |
| Account label |  |
| Route |  |
| Lead or packet reference | Use masked/reference ID only |
| Expected result |  |
| Actual result | PASS / FAIL / BLOCKED |
| Screenshot/reference | Controlled external folder only |
| Audit row reference | Masked row/sample reference only |
| Data exposure check | No raw PII, CCCD, phone, bank data, vouchers, passwords, temporary passwords, OTPs, password reset links, account activation/invite links, service-role keys or API keys |
| Signers | Tuyen Sinh / CTHSSV / Dao Tao / KHTC / IT_DATA / Audit |
| Decision | P3_01_ACCEPT, P3_02_HANDOVER_READY, NO_GO or BLOCKED |

## 5. Required Acceptance Matrix

P3-01 can support handover context only when:

| Gate | Required proof | Stop condition |
|---|---|---|
| P3-01-ACCEPT-01 | Scoped lead identity and source are complete | Missing source, owner, segment or workspace scope |
| P3-01-ACCEPT-02 | Status-transition evidence is traceable | Missing date, reason, actor or timestamp |
| P3-01-ACCEPT-03 | Document/evidence readiness is redacted | Raw controlled evidence enters Git/Codex/chat |
| P3-01-ACCEPT-04 | Eligibility gate before finance is proven | P0-19/P2-01/P2-02 bypass |
| P3-01-ACCEPT-05 | P3-02 handover boundary is respected | KHTC relies on unaccepted or out-of-scope handover |
| P3-01-ACCEPT-06 | No finance, AI or production approval | PASS_LOCAL is treated as UAT or production approval |

P3-02 can support downstream CTHSSV/Dao Tao/KHTC reliance only when:

| Gate | Required proof | Stop condition |
|---|---|---|
| P3-02-ACCEPT-01 | Handover packet is complete | Required identity, status, scope or evidence reference is missing |
| P3-02-ACCEPT-02 | Receiver role and workspace scope are valid | Out-of-scope receiver can read or act |
| P3-02-ACCEPT-03 | Accept/reject trace is auditable | Missing actor, timestamp, status or rejection reason |
| P3-02-ACCEPT-04 | Finance boundary is preserved | Handover creates receivable, collection, invoice, payment or revenue |
| P3-02-ACCEPT-05 | Evidence is redacted and controlled | Raw PII, CCCD, phone, bank data, credentials, temporary passwords, password reset links or account activation/invite links appear |
| P3-02-ACCEPT-06 | Human approval and AI boundary are explicit | AI or PASS_LOCAL is treated as acceptance or GO |

## 6. Human Decision Manifest

| Decision ID | Required decision | Allowed values | Stop condition |
|---|---|---|---|
| P3-UAT-DEC-01 | P3-01 lifecycle evidence decision | P3_01_ACCEPT / NO_GO / BLOCKED | Any P3-UAT-01 through P3-UAT-03 case is unsigned or failed |
| P3-UAT-DEC-02 | P3-02 handover packet decision | P3_02_HANDOVER_READY / NO_GO / BLOCKED | Any P3-UAT-04 through P3-UAT-06 case is unsigned or failed |
| P3-UAT-DEC-03 | Role/workspace exposure decision | ACCEPT / NO_GO / BLOCKED | P3-UAT-07 leaks scoped or private data |
| P3-UAT-DEC-04 | Evidence redaction decision | ACCEPT / NO_GO / BLOCKED | Raw sensitive evidence appears in Git, Codex/chat or uncontrolled notes |
| P3-UAT-DEC-05 | Finance reliance boundary decision | ACCEPT / NO_GO / BLOCKED | P3 evidence bypasses P0-19, P2-05 or P2-03 |
| P3-UAT-DEC-06 | Final P3 UAT decision | READY_FOR_OWNER_REVIEW / NO_GO / BLOCKED | Missing signer, missing evidence ID, unresolved stop condition or AI/Codex approval claim |

## 7. Closure Rule

P3-01/P3-02 remain pending until every P3-UAT case is executed with redacted
evidence, every decision is signed by the required owners, and final owner
Go/No-Go is recorded outside Git/Codex/chat.
