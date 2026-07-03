# HEU Negative Control Account Queue - 2026-07-03

Status: PASS_LOCAL_QUEUE.
Production/UAT status: NO-GO until the negative-control account is
owner-approved, created/linked through the secure channel, tested in browser
UAT and signed outside Codex/chat.

## Purpose

This queue makes the required out-of-scope account explicit before any role,
workspace or finance lane is widened. It does not create a real user, set a
password, send an invite/reset link, approve UAT or assign broad access.

Decision lane: `NEGATIVE_CONTROL_QUEUE_READY / NO_GO / BLOCKED`.

Secret boundary: Do not paste passwords, temporary passwords, OTPs, password
reset links, account activation/invite links, service-role keys, raw student
PII, CCCD, phone numbers, bank accounts, vouchers or raw evidence into this
file, Git, Codex, chat, email notes or screenshots.

## Required Negative Lanes

| Order | Lane | Required account label | Expected result | Stop condition |
| --- | --- | --- | --- | --- |
| 1 | TTGDTX 9+ scoped lead/finance lane | `REAL_OUT_OF_SCOPE_NEGATIVE_01` | `BLOCKED` or `EMPTY_SCOPED_STATE` for `TC9_TTGDTX_LINKED` protected data | Account sees TTGDTX lead, finance, evidence, audit or settings data |
| 2 | HOU lane | `REAL_OUT_OF_SCOPE_NEGATIVE_01` or owner-approved HOU negative label | `BLOCKED` or `EMPTY_SCOPED_STATE` for HOU data | Account sees HOU ledger, COM, evidence or payment rows |
| 3 | Short Course lane | `REAL_OUT_OF_SCOPE_NEGATIVE_01` or owner-approved Short Course negative label | `BLOCKED` or `EMPTY_SCOPED_STATE` for Short Course data | Account sees Short Course students, classes, attendance, BHXH or finance rows |
| 4 | Broad lead visibility | Any active non-ADMIN/BGH test account | No `ALL` lead visibility | Non-ADMIN/BGH profile has `ALL` |
| 5 | Settings/permission matrix | Any non-IT_DATA negative account | Settings/permission matrix blocked | Account can manage users, credentials or permission matrix |

## Runtime Queue Rule

- A candidate must be an active non-ADMIN/BGH profile with explicit non-`ALL`
  lead visibility and at least one safe business scope outside the target lane.
- candidate evidence only, not owner approval. No result is an approval; it is
  only evidence for owner review.
- If no TTGDTX negative candidate exists, create/link
  `REAL_OUT_OF_SCOPE_NEGATIVE_01` through the approved secure channel outside
  Codex/chat, then assign only a non-target business scope and re-run checks.
- Negative-control evidence must be redacted and stored outside Git/Codex/chat.

## Required Commands

- `npm.cmd run check:heu-negative-control-account-queue`
- `npm.cmd run check:heu-permission-scope-readiness`
- `npm.cmd run audit:heu-user-account-security`
- `npm.cmd run audit:heu-role-scope-uat-pack`
- `npm.cmd run audit:ttgdtx-role-scope-access`

## Exit Rule

The queue can be PASS_LOCAL while the negative-control account is missing, but
only as an owner-action queue. It does not create accounts, assign real users,
set passwords, send reset/invite links, approve UAT, approve finance reliance,
approve owner GO/NO-GO or mark production GO.
