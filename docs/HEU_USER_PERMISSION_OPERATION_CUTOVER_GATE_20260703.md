# HEU User Permission Operation Cutover Gate - 2026-07-03

Status: PASS_LOCAL_GATE

Decision lane: USER_PERMISSION_OPERATION_CUTOVER_READY / NO_GO / BLOCKED

Current cutover decision: NO_GO

Current live blocker snapshot:

- `active_profiles=4`
- `missing_visibility=1`
- `missing_business_scope=1`
- `required_positions=15`
- `unassigned_required_positions=15`
- `ttgdtx_negative_candidates=0`
- `pending_external_evidence_lanes=4`

Purpose: separate local audit success from the real conditions required before
the admission user/role/scope configuration can be treated as operational.

## Required Cutover Conditions

| Gate | Required proof | Current owner action |
| --- | --- | --- |
| `CUTOVER-OWNER-SEATS-01` | Every required HEU position has one active assigned user through `heu_position_assignments`. | Owner must approve, create/link and assign the 15 required positions outside Codex/chat. |
| `CUTOVER-AUTH-LINK-02` | Every active CRM profile maps to a Supabase Auth user. | Keep Auth/profile link proof green before adding each real user. |
| `CUTOVER-SCOPE-BASELINE-03` | Every non-ADMIN/BGH active user has explicit lead visibility, business scope and active workspace; no non-ADMIN/BGH user has `ALL` visibility. | Configure scope through Settings/RPC only after owner-approved lane mapping. |
| `CUTOVER-NEGATIVE-04` | `REAL_OUT_OF_SCOPE_NEGATIVE_01` exists as a TTGDTX out-of-scope negative-control account and has redacted browser proof. | Owner must create/link the negative account and store proof outside Git/Codex/chat. |
| `CUTOVER-P6-UAT-05` | P6-04 role/workspace signed UAT and access-closure decision are recorded as redacted external references. | Owner/Audit must sign and store evidence outside Git/Codex/chat. |
| `CUTOVER-OWNER-GO-06` | Final user-permission cutover decision is signed by owner lane. | Owner GO/NO-GO remains outside PASS_LOCAL. |

## External Reference State

P6_04_SIGNED_UAT_REFERENCE: PENDING_OWNER_UPLOAD

ACCESS_CLOSURE_REFERENCE: PENDING_OWNER_UPLOAD

NEGATIVE_CONTROL_BROWSER_PROOF_REFERENCE: PENDING_OWNER_UPLOAD

OWNER_CUTOVER_DECISION_REFERENCE: PENDING_OWNER_SIGNOFF

## Required Commands

- `npm.cmd run check:heu-user-operation-cutover-readiness`
- `npm.cmd run check:heu-user-activation-worksheet-readiness`
- `npm.cmd run check:heu-position-assignment-owner-queue`
- `npm.cmd run check:heu-negative-control-account-queue`
- `npm.cmd run audit:heu-user-account-security`
- `npm.cmd run audit:heu-role-scope-uat-pack`
- `npm.cmd run audit:ttgdtx-role-scope-access`

## PASS_LOCAL Boundary

This gate does not create accounts, assign real users, set passwords, send reset/invite links,
execute UAT, accept evidence, approve finance reliance,
approve owner GO/NO-GO or mark production GO.

It is expected to return `NO_GO` until the owner-approved users, required
position assignments, TTGDTX negative-control account, signed P6-04 UAT,
access-closure decision and owner cutover decision all exist.
