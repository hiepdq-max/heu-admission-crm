# HEU User Pilot 002 - Nine Account Position And Scope Contract

Task ID: HEU-USER-PILOT-002-NINE-ACCOUNT-POSITION-SCOPE-CONTRACT
Date: 2026-07-12
Status: DRAFT_CONTROL
Stage: Stage D - internal controlled test only
Production status: NO-GO

## 1. Purpose

This packet locks the nine approved pilot account lanes for the seven-day
`USER_CORE + ADMISSION_PILOT` scope. Real names, emails and identity mapping
remain outside Git in the controlled owner channel.

Every row is one independent Auth account and exactly one operating position.
No account may union two positions, departments or workspaces. This packet does
not create Auth users, write Supabase data, send email, set passwords, run SQL,
approve UAT or open Production.

## 2. Read-Only Live Snapshot

The metadata-only query on 2026-07-12 reported:

```text
pilot_accounts=9
auth_accounts_found=5
profiles_found=3
active_position_assignments_found=2
accounts_with_broad_lead_visibility=1
required_new_position_master_rows=2
database_write=NOT_PERFORMED
```

The two required position-master rows are `HEU_SYSTEM_ADMIN` and
`KE_TOAN_DEPUTY`. Their accounts remain fail-closed until a separately
reviewed position-master change is approved and applied with backup/rollback.

## 3. Anonymous Nine-Account Register

| Account code | Position code | Department code | Workspace scope | Initial access | Activation state | Smart mode |
| --- | --- | --- | --- | --- | --- | --- |
| PILOT-SYSTEM-ADMIN-01 | HEU_SYSTEM_ADMIN | IT_DATA | HEU:SYSTEM | CONTROL_ONLY_NO_BUSINESS_DATA | POSITION_MASTER_REQUIRED | DRAFT_CHECK_SUGGEST |
| PILOT-EXEC-01 | HT | LEADERSHIP | HEU:EXECUTIVE | READ_ONLY | VERIFY_EXISTING | DRAFT_CHECK_SUGGEST |
| PILOT-ADMISSION-HEAD-01 | TUYEN_SINH_HEAD | ADMISSION | HEU:ADMISSION | OPERATIONAL_DRAFT | CREATE_OR_LINK | DRAFT_CHECK_SUGGEST |
| PILOT-ADMISSION-CTV-HOLD-01 | TUYEN_SINH_01 | ADMISSION | NO_ACTIVE_WORKSPACE | BLOCKED_OUT_OF_7_DAY_SCOPE | VERIFY_AUTH_OR_CREATE | DRAFT_CHECK_SUGGEST |
| PILOT-ACCOUNTING-MANAGER-01 | KE_TOAN_DEPUTY | ACCOUNTING | HEU:FINANCE | READ_ONLY_DRAFT_NO_APPROVE | POSITION_MASTER_REQUIRED | DRAFT_CHECK_SUGGEST |
| PILOT-ACCOUNTING-OPS-01 | KE_TOAN_01 | ACCOUNTING | HEU:FINANCE | READ_ONLY_DRAFT | CREATE_OR_LINK | DRAFT_CHECK_SUGGEST |
| PILOT-ACCOUNTING-OPS-02 | KE_TOAN_02 | ACCOUNTING | HEU:FINANCE | READ_ONLY_DRAFT | CREATE_OR_LINK | DRAFT_CHECK_SUGGEST |
| PILOT-TCHC-HEAD-01 | TCHC_HEAD | TCHC | HEU:TCHC | OPERATIONAL_DRAFT | VERIFY_EXISTING | DRAFT_CHECK_SUGGEST |
| PILOT-TCHC-DEPUTY-01 | TCHC_DEPUTY | TCHC | HEU:TCHC | OPERATIONAL_DRAFT_NO_FINAL_APPROVE | CREATE_OR_LINK | DRAFT_CHECK_SUGGEST |

## 4. Locked Decisions

- The principal account owns only `HT`; it does not inherit the admissions
  head position.
- The admissions head uses a separate account and `TUYEN_SINH_HEAD`.
- The system administrator uses `HEU_SYSTEM_ADMIN`, not an admissions seat
  and not a broad business workspace.
- The accounting manager uses `KE_TOAN_DEPUTY`; it is not silently mapped to
  `KE_TOAN_TRUONG` or a generic accounting operator.
- The two accounting operators use `KE_TOAN_01` and `KE_TOAN_02`.
- `TCHC_HEAD` and `TCHC_DEPUTY` remain independent accounts.
- The recruitment CTV account is registered as `TUYEN_SINH_01`, but receives
  `NO_ACTIVE_WORKSPACE` during this seven-day scope. HOU, COM and HOU student
  data remain blocked.
- Every account uses `DRAFT_CHECK_SUGGEST`; no AI runtime or autonomous write
  is permitted.

## 5. Activation Gate

Process one account at a time:

1. Record the real identity-to-account mapping outside Git.
2. Confirm the exact position, role, department and owner reference.
3. Provision Auth without a temporary/default password.
4. Create or link the profile as `INACTIVE`.
5. Save an explicit workspace/business scope; no broad fallback is allowed.
6. Assign exactly one `ACTIVE_ASSIGNED` position.
7. Intersect role permissions with position permissions.
8. Move the profile to `ACTIVE` only after scope and position checks pass.
9. Use the controlled recovery/activation email channel.
10. Run positive and negative route UAT and record redacted evidence.

Stop if an account has zero or multiple active positions, an `ALL` business
scope, a role/department mismatch, missing owner evidence or a position-master
gap.

## 6. Negative Access Contract

- System admin cannot read unrestricted lead, student or finance business rows.
- Principal is read-only and cannot create, approve, pay or import.
- Admissions head cannot access finance or TCHC data.
- CTV hold account receives no business rows while HOU is outside scope.
- Accounting accounts cannot approve, post, pay, clear debt or view HOU COM.
- TCHC deputy cannot perform final owner approval.
- Missing scope or position returns blocked/no-scope/empty scoped state.

## 7. Rollback

Rollback is status-based and never hard-deletes original records:

1. Disable credential eligibility.
2. Set the profile to `INACTIVE`.
3. Soft-revoke the active position assignment.
4. Soft-revoke business scope and workspace preference.
5. Record actor, reason, object reference and timestamp in the audit channel.

## 8. Verification

```powershell
npm.cmd run check:heu-user-pilot-9-position-contract
npm.cmd run check:heu-user-provision-no-temp-password
npm.cmd run check:heu-user-pilot-scope-save-guard
npm.cmd run check:heu-settings-permission-matrix-readiness
npm.cmd run check:heu-effective-position-permission-dry-run
```

## 9. Decision

| Item | Result |
| --- | --- |
| Nine account/position mapping | DAT_TAM_THOI after static checker PASS |
| Existing live account alignment | CAN_SUA |
| New position-master rows | NO_GO until separate reviewed change |
| Database write/migration | NOT_PERFORMED |
| HOU/COM/finance mutation | NO_GO |
| Production | NO-GO |
