# HEU User Pilot 002 Anonymous Account Position Activation Packet

Task ID: HEU-USER-PILOT-002-ANONYMOUS-ACCOUNT-POSITION-ACTIVATION-PACKET
Date: 2026-07-12
Status: DRAFT_CONTROL
Stage: Stage D - internal controlled test only
Production status: NO-GO

## 1. Purpose

This packet converts the first approved operating lanes into eight anonymous
pilot accounts. Real names, emails and identity mapping remain outside Git,
Codex and chat in the controlled owner channel.

The packet does not create an Auth user, activate a profile, assign a position,
grant scope, send email, set a password, run SQL, migrate data or approve UAT.

## 2. Live Readiness Snapshot

Read-only checks on 2026-07-12 reported:

```text
controlled_people=7
pilot_accounts=8
dual_role_people=1
active_profiles=6
active_position_assignments=5
required_positions=15
assigned_required_positions=4
unassigned_required_positions=11
positions_with_matching_active_profiles=0
positions_needing_owner_create_or_link=11
profiles_missing_lead_visibility=2
profiles_missing_business_scope=2
fail_closed_profiles=1
database_write=NOT_PERFORMED
```

This snapshot contains counts and position codes only. It is not an owner
assignment decision and must be refreshed before controlled activation.

## 3. Anonymous Pilot Account Register

Every row is one independent Auth account and one active operating position.
No account may union two positions, departments or workspaces.

| Account code | Position code | Department code | Workspace scope | Initial access | Activation state | Smart mode |
| --- | --- | --- | --- | --- | --- | --- |
| PILOT-EXEC-01 | HT | BGH | HEU:EXECUTIVE | READ_ONLY | VERIFY_EXISTING_OR_CREATE | DRAFT_CHECK_SUGGEST |
| PILOT-ADMISSION-HEAD-01 | TUYEN_SINH_HEAD | PHONG_TUYEN_SINH | HEU:ADMISSION | OPERATIONAL_DRAFT | CREATE_OR_LINK | DRAFT_CHECK_SUGGEST |
| PILOT-ACCOUNTING-OPS-01 | KE_TOAN_01 | PHONG_KHTC | HEU:FINANCE | READ_ONLY_DRAFT | CREATE_OR_LINK | DRAFT_CHECK_SUGGEST |
| PILOT-ACCOUNTING-OPS-02 | KE_TOAN_02 | PHONG_KHTC | HEU:FINANCE | READ_ONLY_DRAFT | CREATE_OR_LINK | DRAFT_CHECK_SUGGEST |
| PILOT-ACCOUNTING-MANAGER-01 | KE_TOAN_03 | PHONG_KHTC | HEU:FINANCE | READ_ONLY_NO_APPROVE | CREATE_OR_LINK | DRAFT_CHECK_SUGGEST |
| PILOT-TCHC-HEAD-01 | TCHC_HEAD | TCHC | HEU:TCHC | OPERATIONAL_DRAFT | VERIFY_EXISTING_OR_CREATE | DRAFT_CHECK_SUGGEST |
| PILOT-TCHC-DEPUTY-01 | TCHC_DEPUTY | TCHC | HEU:TCHC | OPERATIONAL_DRAFT_NO_FINAL_APPROVE | CREATE_OR_LINK | DRAFT_CHECK_SUGGEST |
| PILOT-HOU-RECRUITMENT-CTV-01 | TUYEN_SINH_01 | PHONG_TUYEN_SINH | HOU:ADMISSION:OWN | OWN_LEADS_ONLY_NO_COM | BLOCKED_LEGAL_SCOPE | DRAFT_CHECK_SUGGEST |

## 4. Mapping Decisions

### 4.1 Executive and admissions dual role

- `PILOT-EXEC-01` and `PILOT-ADMISSION-HEAD-01` are always separate Auth
  accounts, even when the controlled owner channel maps them to one person.
- The executive account is read-only and cannot mutate admissions data.
- The admissions-head account operates only in the approved admissions scope.
- The two accounts never share an `accountScopeKey` and never union permissions.

### 4.2 Accounting pilot

- `KE_TOAN_01` and `KE_TOAN_02` are temporary under-privileged mappings for
  the two accounting operating lanes.
- `KE_TOAN_03` is a temporary under-privileged mapping for the accounting
  manager pilot. It does not assert the formal title of chief accountant or
  grant `ACCOUNTING_LEAD`, approval, posting, payment or debt-clear authority.
- A future owner-approved position-master slice may add exact specialty and
  deputy-manager position codes. Until then all three finance accounts remain
  read-only or draft-only.

### 4.3 TCHC pilot

- `TCHC_HEAD` and `TCHC_DEPUTY` are separate accounts and positions.
- The deputy account cannot inherit final approval from the head account.
- Any existing `TCHC_HEAD` assignment must be verified by controlled owner
  evidence before it is reused.

### 4.4 HOU recruitment CTV pilot

- HOU remains separated from internal HEU training data.
- `TUYEN_SINH_01` is used only as an under-privileged recruitment operator
  position with `HOU:ADMISSION:OWN` scope.
- The account sees only its own assigned HOU recruitment lead metadata.
- It cannot read COM rates, finance data, bank data, broad HOU student data or
  another operator's leads.
- Activation remains `BLOCKED_LEGAL_SCOPE` until owner and PHAP_CHE confirm the
  contract/authority, data-processing boundary and permitted workspace.

## 5. Activation Order

The operator must process one account at a time:

1. Record the real identity mapping outside Git/Codex/chat.
2. Confirm position, department, workspace and owner evidence reference.
3. Provision the Auth user without a password and without sending email.
4. Create or link the CRM profile as `INACTIVE`.
5. Save explicit business scope; no broad fallback is allowed.
6. Move the profile to `ACTIVE` only while it still has no credential.
7. Assign exactly one `ACTIVE_ASSIGNED` position.
8. Re-run scope, position and negative-access checks.
9. Only then make the account credential-eligible through the approved Auth
   recovery/activation channel.
10. Run first-login UAT and keep evidence outside Git/Codex/chat.

Stop immediately if an account has zero or more than one active position, no
department, no explicit scope, an `ALL` business scope, or an owner-evidence
gap.

## 6. Per-Account Gate

| Gate | Required result before credential eligibility |
| --- | --- |
| Identity mapping | Controlled owner reference exists outside Git |
| Profile | `ACTIVE` only after scope is saved; no credential yet |
| Position | Exactly one `ACTIVE_ASSIGNED` position |
| Department | Matches the position master |
| Workspace | Explicit and no broad fallback |
| Role/permission | Position matrix intersects active role/delegation |
| Smart | `DRAFT_CHECK_SUGGEST`; no runtime AI/API call |
| Negative access | Forbidden route/action is blocked |
| Audit | Actor/action/object/ref metadata is recorded |
| Rollback | Status-based disable path is recorded |

## 7. Negative Access Tests

- Executive account cannot create, edit, approve, pay or import.
- Admissions-head account cannot see finance, TCHC or another department's
  unrestricted data.
- Accounting accounts cannot approve, post, pay, clear debt or view HOU COM.
- Accounting manager pilot cannot act as `ACCOUNTING_LEAD`.
- TCHC deputy cannot use final owner approval.
- HOU recruitment CTV cannot see non-HOU data, other operators' leads, COM or
  finance data.
- Any account with missing scope or position receives a safe no-scope/blocked
  state and no business rows.

## 8. Rollback

Rollback is status-based and never hard-deletes original records:

1. Disable credential/recovery eligibility.
2. Set the profile to `INACTIVE`.
3. Soft-revoke the active position assignment.
4. Soft-revoke business scope and workspace preference.
5. Record rollback actor, reason, object ref and timestamp in the controlled
   audit channel.

No rollback step may delete Auth, profile, finance, evidence or audit history.

## 9. Verification

```powershell
node scripts/check-heu-user-pilot-anonymous-activation-packet.mjs
npm.cmd run check:heu-user-provision-no-temp-password
npm.cmd run check:heu-user-pilot-scope-save-guard
npm.cmd run check:heu-settings-permission-matrix-readiness
npm.cmd run check:heu-effective-position-permission-dry-run
```

Real-user activation, email delivery, Supabase redirect allowlist, owner UAT,
finance reliance and Production remain `NO_GO`.

## 10. Decision

| Item | Result |
| --- | --- |
| Anonymous eight-account packet | DAT_TAM_THOI after static checker PASS |
| Real identity mapping | OUTSIDE_GIT_OWNER_CHANNEL |
| Account creation | NO_GO until per-account owner mapping |
| Database/migration | NOT_PERFORMED |
| Email/credential delivery | NO_GO until controlled test |
| Production | NO-GO |
