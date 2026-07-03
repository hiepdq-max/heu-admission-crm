# HEU Permission Scope Operation Breakdown - 2026-07-03

Status: PASS_LOCAL first slice plus HOU scope closure.
Production/UAT status: NO-GO until signed multi-account UAT, owner approval and
the normal production gate are completed outside Codex/chat.

## Scope

This file breaks the permission/scope rollout into small operational slices for
the admission system. It covers user create/link, CRM profile binding, lead
visibility, admission workspace scope, and the readiness gate now attached to
`audit:heu-user-account-security`.

Secret boundary: do not paste passwords, temporary passwords, OTPs, password
reset links, account activation/invite links, service-role keys, raw student
PII, CCCD, phone numbers, bank accounts, vouchers or raw payment evidence into
Git, Codex, chat, email notes or screenshots.

## Slice 1 - User Create And Auth Link

Goal: prove the system can create or link a real Supabase Auth user to a CRM
profile without exposing credentials.

Done locally:
- `npm.cmd run check:heu-user-create-readiness` returns READY for env, Auth
  Admin API, ADMIN role and ADMIN `users.create`.
- `npm.cmd run audit:heu-user-account-security` covers create-user permission,
  privileged-user guard, existing Auth user fallback, unsafe temporary password
  guard, and readiness scripts.

Exit rule:
- PASS_LOCAL only means the local guard and configured environment are ready.
- It does not approve real password handling, UAT acceptance or production GO.

## Slice 2 - Explicit Lead Visibility

Goal: every active profile has a deliberate lead visibility row instead of
relying on implicit defaults.

Current first-slice configuration:
- Active CRM profiles checked: 2.
- Explicit lead visibility rows: 2.
- ADMIN/BGH visibility rule: `ALL`.
- Non-ADMIN/BGH visibility rule: `OWN`.
- Non-ADMIN/BGH broad access check: no non-ADMIN/BGH profile has `ALL`.

Exit rule:
- `npm.cmd run check:heu-permission-scope-readiness` must show READY for
  `PERMISSION-SCOPE-LEAD-VISIBILITY` and
  `PERMISSION-SCOPE-NO-BROAD-NON-ADMIN`.

## Slice 3 - Admission Workspace Scope

Goal: every active non-ADMIN/BGH user has at least one business scope before
operating leads.

Current first-slice configuration:
- Active non-ADMIN/BGH profiles checked: 1.
- Active segment scope rows: 1.
- Active partner scope rows: 0.
- First-slice segment: `TC9_TTGDTX_LINKED`.
- Active workspace preference rows: 2.

Exit rule:
- `PERMISSION-SCOPE-BUSINESS-SCOPE` must be READY.
- `PERMISSION-SCOPE-ACTIVE-WORKSPACE` must be READY.
- Any future widening from `TC9_TTGDTX_LINKED` to more segments requires owner
  scope approval and a new readiness run.

## Slice 4 - Negative Account Proof

Goal: prove users outside a scope cannot see or write lead data outside their
assigned segment/partner/visibility.

Minimum cases:
- ADMIN/BGH can enter all approved workspaces.
- Non-ADMIN/BGH user with `OWN` sees only assigned/created leads in assigned
  workspace.
- Out-of-scope user cannot create/import/update a lead in an unassigned
  workspace.
- Non-ADMIN/BGH user is blocked from `ALL` lead visibility.

Exit rule:
- Browser/UAT evidence must be redacted and stored outside Git/Codex/chat.
- PASS_LOCAL does not replace signed UAT.

## Slice 5 - Audit Closure

Goal: make audit failure actionable and repeatable.

Required commands:
- `npm.cmd run check:heu-user-create-readiness`
- `npm.cmd run check:heu-permission-scope-readiness`
- `npm.cmd run check:heu-hou-scope-readiness`
- `npm.cmd run audit:heu-user-account-security`
- `npm.cmd run audit:heu-role-scope-uat-pack`
- `npm.cmd run audit:ttgdtx-role-scope-access`
- `npm.cmd run audit:permission-soft-revoke`
- `npm.cmd run audit:ttgdtx-release-gates`
- `npm.cmd run build`

Exit rule:
- All commands must pass before moving to the next module.
- Any production/UAT/finance/owner GO remains outside PASS_LOCAL.

## Slice 10 - HOU Scope Closure

Goal: keep HOU control center, COM claim review and COM payment batch actions
aligned with the same admission workspace scope before widening HOU operations
to more real users.

Done locally:
- PASS_LOCAL scope closure is wired through `check:heu-hou-scope-readiness`.
- Added `npm.cmd run check:heu-hou-scope-readiness`.
- Attached the checker and static guards to
  `npm.cmd run audit:heu-hou-ledger-handover-gap-pack`.
- Updated `/hou` to read leads through `getAdmissionWorkspaceContext`,
  `admissionWorkspaceSegmentIds` and `applyAdmissionSegmentIds`.
- Updated `/hou` payment-line and payment-batch reads so visible HOU COM
  payment rows originate from claim lines that belong to scoped HOU leads.
- Added server-side guards before HOU COM claim review, COM payment batch
  creation and COM payment batch status updates. Each action verifies the
  claim's source lead and requires `can_use_admission_workspace` plus
  `can_access_business_scope` before writing.

Current checker target:
- `HOU-SCOPE-APP-GUARD` proves the page/action/package scope guard is wired.
- `HOU-SCOPE-LEAD-TAG` proves HOU-marked active leads are tagged to
  `UNIVERSITY_TRANSFER_HOU`.
- `HOU-SCOPE-CLAIMS`, `HOU-SCOPE-CLAIM-LINES`,
  `HOU-SCOPE-PAYMENT-LINES`, `HOU-SCOPE-PAYMENT-BATCHES` and
  `HOU-SCOPE-EVIDENCE` prove HOU COM/evidence rows trace back to scoped HOU
  leads.
- `HOU-SCOPE-ACTOR-LINK` proves HOU claim/payment actors are either empty or
  active CRM profiles.

Exit rule:
- All HOU scope statuses above must stay READY before widening HOU use beyond
  the current controlled lane.
- This is HOU scope closure only; it does not approve HOU handover, tuition ledger posting, invoice issuance, COM payout, finance action, UAT acceptance, evidence acceptance, owner GO or production GO.

## System-Wide Expansion Pattern

Repeat the same model per module:

1. Pick one module and one user lane.
2. Identify the data surface and required scope.
3. Add or verify the read/write guard.
4. Add a read-only readiness check if the guard depends on DB state.
5. Run a negative account proof.
6. Attach the new check to the module audit.
7. Run the focused audit cluster and build.
8. Record PASS_LOCAL, remaining UAT blockers and the next module.

Recommended order:
- Leads and import.
- Pipeline and follow-ups.
- Reports and dashboard.
- Finance Desk and payment requests.
- HOU and Short Course.
- Settings and permission matrix.
- Audit, evidence and final handoff.

Do not widen a user from `OWN` to `TEAM`, `DEPARTMENT` or `ALL` unless the owner
has approved the lane and the negative test is re-run.
