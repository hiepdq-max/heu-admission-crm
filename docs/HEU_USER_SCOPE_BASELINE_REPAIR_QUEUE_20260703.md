# HEU User Scope Baseline Repair Queue - 2026-07-03

Status: PASS_LOCAL_QUEUE

Decision lane: USER_SCOPE_BASELINE_REPAIR_READY / NO_GO / BLOCKED

Current decision: NO_GO

Purpose: isolate the live active-profile scope blocker before any user/role
cutover, position assignment, negative-control proof or department expansion.

## Current Live Snapshot

- `active_profiles=6`
- `active_non_admin_bgh=3`
- `missing_visibility=2`
- `missing_business_scope=2`
- `non_admin_all_visibility=0`
- `workspace_mismatch=0`
- `required_positions=15`
- `unassigned_required_positions=14`

`HIEU_TRUONG` and `PHO_HIEU_TRUONG` are treated as executive/BGH-equivalent
roles for this baseline. They stay behind owner sign-off and read-only
governance controls; they are not counted as daily non-ADMIN/BGH scope repair
users.

## Repair Queue

| Queue | Required owner action | Stop condition |
| --- | --- | --- |
| `USER-SCOPE-REPAIR-01` | Add explicit lead visibility for the active non-ADMIN/BGH daily operating profile through Settings/RPC after owner confirms the lane. Use `OWN`, `TEAM` or `DEPARTMENT`; keep `ALL` ADMIN/executive-only. | Any non-ADMIN/BGH daily operating user has no visibility row or receives `ALL` visibility. |
| `USER-SCOPE-REPAIR-02` | Add one approved admission segment or partner scope for the same active profile and verify the active workspace preference is inside that scope. | User has no segment/partner scope, or active workspace points outside assigned scope. |
| `USER-SCOPE-REPAIR-03` | Re-run owner-position candidate review only after scope baseline is green; candidate evidence is not owner approval. | Candidate profile is assigned to a required position before lead visibility and business scope are green. |
| `USER-SCOPE-REPAIR-04` | Re-run TTGDTX negative-control queue and operation cutover gate after baseline repair. | `REAL_OUT_OF_SCOPE_NEGATIVE_01` is missing or unrestricted TTGDTX data is visible. |

## Owner Repair Evidence

- Run `npm.cmd run check:heu-user-scope-baseline-repair-queue` to get
  `safe_owner_repair_labels` for the current missing lead visibility and
  business scope rows.
- The checker also prints `USER-SCOPE-REPAIR-OWNER-PACKET` with
  `owner_action_packet=profile_count=2`,
  `role_codes=DAO_TAO_LEAD,TCHC_LEAD`, `decision_count=4`,
  `lead_visibility_choice_required` and
  `segment_or_partner_scope_required` so owner-side repair can confirm one
  current daily operating queue rather than separate untracked fixes.
- Labels are redacted hash labels plus role code only. They are for secure
  owner-side lookup by IT_DATA; do not paste emails, names, phone numbers, raw
  IDs, screenshots, passwords, OTPs, invite links or reset links into this doc,
  Git, Codex or chat.
- Owner must map each label to one approved user lane outside Git/Codex/chat,
  then apply the approved `OWN`, `TEAM` or `DEPARTMENT` lead visibility and
  one approved segment or partner scope through Settings/RPC.
- `USER-SCOPE-REPAIR-OWNER-LABELS` and `USER-SCOPE-REPAIR-OWNER-PACKET` are
  evidence routing only; they are not owner approval and they do not change
  scope data.

## Required Commands

- `npm.cmd run check:heu-user-scope-baseline-repair-queue -- --static-only`
  for PASS_LOCAL package verification without reading live Supabase data
- `npm.cmd run check:heu-user-scope-baseline-repair-queue`
  for live owner queue labels; this remains `NO_GO` until the owner closes
  `missing_visibility` and `missing_business_scope`
- `npm.cmd run check:heu-permission-scope-readiness`
- `npm.cmd run check:heu-user-activation-worksheet-readiness`
- `npm.cmd run check:heu-position-assignment-owner-queue`
- `npm.cmd run check:heu-negative-control-account-queue`
- `npm.cmd run check:heu-user-operation-cutover-readiness`
- `npm.cmd run audit:heu-user-account-security`

## PASS_LOCAL Boundary

This queue does not create accounts, assign real users, set passwords, send
reset/invite links, change lead visibility, add segment/partner scope, execute
UAT, accept evidence, approve finance reliance, approve owner GO/NO-GO or mark
production GO.

Boundary tokens: send reset/invite links; execute UAT; mark production GO.

It is expected to return `NO_GO` until the owner-approved scope repair is done
through the app/secure admin channel and redacted evidence is stored outside
Git/Codex/chat.
