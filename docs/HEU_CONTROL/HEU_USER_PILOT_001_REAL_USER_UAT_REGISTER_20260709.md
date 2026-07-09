# HEU User Pilot 001 Real User UAT Register

Task ID: HEU-USER-PILOT-001-REAL-USER-UAT-REGISTER
Date: 2026-07-09
Repository: heu-admission-crm
Branch: hardening/ttgdtx-9plus-pilot
Status: DRAFT_CONTROL
Production status: NO-GO

## 1. Purpose

This register turns the HEU App Shell decision into a controlled first real-user
pilot. The goal is to let a small group of real users use the software safely
without opening broad production authority.

Target:

```text
8-12 real pilot users.
One HEU App Shell.
Role/scope menu.
My Work / Task Center first.
Data Confirmation before dashboard reliance.
Audit Log before conclusion.
Finance read-only before finance action.
```

This file does not create accounts, assign real users, set passwords, send
reset/invite links, grant scope, execute UAT, accept evidence, approve finance
action, approve owner GO/NO-GO or mark production GO.

## 2. Required Sources

| Source | Required use |
|---|---|
| `docs/HEU_CONTROL/HEU_APP_SHELL_001_MODULAR_MONOLITH_DECISION_20260709.md` | Architecture decision: one App Shell, internal modules, shared scoped data |
| `docs/HEU_CONTROL/HEU_APP_SHELL_001_DRAFT_PR_HANDOFF_20260709.md` | Draft PR handoff evidence for IT_DATA + Audit review |
| `docs/HEU_CONTROL/HEU_SYSTEM_BUILD_HANDBOOK_20260707.md` | Build flow, stop rules, no-production boundary |
| `docs/HEU_ROLE_PERMISSION_MATRIX_V1.md` | Baseline role and permission posture |
| `docs/HEU_PERMISSION_SCOPE_OPERATION_BREAKDOWN_20260703.md` | User create/link, scope and negative-access rollout slices |
| `docs/HEU_USER_PERMISSION_OPERATION_CUTOVER_GATE_20260703.md` | Required cutover evidence before operational access |
| `docs/HEU_USER_SCOPE_BASELINE_REPAIR_QUEUE_20260703.md` | Active non-ADMIN/BGH scope baseline blocker and repair lane |

If any source is missing in a branch, stop and record `BLOCKED_SOURCE_MISSING`
instead of creating or granting real access.

## 3. Pilot Seat Register

Use placeholder labels here. Real names, emails, phone numbers and raw personal
data must stay outside Git/Codex/chat.

| Seat ID | User lane | First menu | Initial access | Required scope | Owner approval |
|---|---|---|---|---|---|
| PILOT-BGH-01 | BGH viewer | Overview, Reports, Blockers | Read-only | All approved summaries, no mutation | BGH + Audit |
| PILOT-ITDATA-01 | IT_DATA operator | Settings, User/Role/Scope, System checks | Admin/control, no business approval | System admin lane only | IT_DATA lead |
| PILOT-AUDIT-01 | Audit reviewer | Audit Log, Scope Leak, Evidence gaps | Read-only | All audit/control metadata, no raw evidence | Audit lead |
| PILOT-PHAPCHE-01 | PHAP_CHE reviewer | SOP/Legal checklist | Review/comment only | Legal/SOP refs, no data mutation | PHAP_CHE lead |
| PILOT-TS-01 | Tuyen sinh operator | Leads, Ho so, My Work | Scoped read/write where allowed | Assigned segment/partner/workspace only | Tuyen sinh owner |
| PILOT-CTHSSV-01 | CTHSSV owner | Student confirmation, My Work | Confirm/return scoped tasks | CTHSSV department/scope only | CTHSSV owner |
| PILOT-DAO-01 | Dao tao owner | Class/program confirmation, My Work | Confirm/return scoped tasks | Dao tao department/scope only | Dao tao owner |
| PILOT-KHOA-01 | Khoa owner | Teacher/class status, My Work | Confirm/return scoped tasks | Khoa department/scope only | Khoa owner |
| PILOT-KHTC-01 | KHTC finance viewer | Finance read-only, Recon refs | Read-only | Finance scoped summaries and evidence refs only | KHTC + Audit |
| PILOT-NEG-01 | Out-of-scope negative user | No access / safe no-scope page | Negative test only | No broad business scope | IT_DATA + Audit |

Optional extra seats after the first pass:

| Seat ID | User lane | Why add |
|---|---|---|
| PILOT-TS-02 | Tuyen sinh backup | Prove two users in same department do not leak scope |
| PILOT-KHTC-02 | KHTC reviewer | Prove finance reviewer remains read-only until signed UAT |

## 4. Account Creation Boundary

| Control | Required behavior | Stop condition |
|---|---|---|
| USER-PILOT-AUTH-01 | Account created/invited in Supabase/Auth owner channel only | Password, reset link or invite link appears in Git/Codex/chat |
| USER-PILOT-AUTH-02 | CRM profile links to Auth user before use | User can log in without profile/scope link |
| USER-PILOT-AUTH-03 | Non-ADMIN/BGH user has explicit role, department and business scope | User falls back to global rows |
| USER-PILOT-AUTH-04 | Temporary passwords are not displayed or stored in docs/logs | Temporary password is copied into any handoff artifact |
| USER-PILOT-AUTH-05 | User can change/recover password only through approved auth flow | Admin/Codex manually sends password |

## 5. Route And Menu Matrix

| User lane | Must see | Must not see by default |
|---|---|---|
| BGH viewer | `/`, `/reports`, blockers, read-only summaries | Create/edit/pay/import/admin mutation buttons |
| IT_DATA operator | `/settings`, user/scope checks, audit/control docs | Finance approval, legal approval, owner GO |
| Audit reviewer | `/audit`, logs, scope/evidence gaps | Raw PII, bank data, password/token fields |
| PHAP_CHE reviewer | Legal/SOP checklist and evidence-class refs | Finance posting, user grants, workflow mutation |
| Tuyen sinh operator | Own leads, own ho so, assigned tasks | Other department data and global leads |
| CTHSSV owner | Own confirmation tasks and student handover refs | Admission raw lead source outside scope |
| Dao tao/Khoa owner | Own class/program/teacher tasks | Finance action and broad student finance data |
| KHTC finance viewer | Finance read-only dashboard, recon/evidence refs | Payment execution, debt clearing, voucher posting |
| Out-of-scope negative user | Safe no-access/no-scope message | Any scoped business rows |

## 6. First Login UAT Script

Run this manually per pilot seat through the approved operator channel.

| Step | Action | Evidence to capture outside Git/Codex/chat |
|---:|---|---|
| 1 | Create/link Auth user and CRM profile | User label, Auth/profile link proof |
| 2 | Assign role and department | Role code, department code, owner approval ref |
| 3 | Assign business scope | Segment/partner/workspace scope ref |
| 4 | First login | Login success/fail, no password captured |
| 5 | Open landing page | Menu screenshot or route-access checklist |
| 6 | Open first allowed module | Scoped row count, no raw sensitive data copied |
| 7 | Attempt one forbidden route/action | Negative-access result |
| 8 | Check audit/control log | Actor/action/object/ref appears, no payload leak |
| 9 | Owner review | PASS / CAN_SUA / NO_GO per seat |

## 7. Negative Access Tests

| Test ID | Actor | Attempt | Expected result |
|---|---|---|---|
| NEG-01 | PILOT-NEG-01 | Open `/reports` scoped data | Blocked or no-scope safe page |
| NEG-02 | PILOT-TS-01 | View other department leads | No rows or access denied |
| NEG-03 | PILOT-CTHSSV-01 | Edit admission lead outside task | Blocked |
| NEG-04 | PILOT-KHTC-01 | Execute payment/debt clearing | Blocked, read-only only |
| NEG-05 | PILOT-BGH-01 | Mutate operational data | Blocked, read-only only |
| NEG-06 | PILOT-PHAPCHE-01 | Grant user access | Blocked |
| NEG-07 | PILOT-AUDIT-01 | View raw secret/password/token | Blocked or redacted |
| NEG-08 | Any non-ADMIN/BGH | Receive `ALL` business visibility | Blocked unless explicitly approved |

Any failed negative test blocks widening the pilot.

## 8. First Usable Product Acceptance

HEU may be considered usable for controlled pilot only when all rows below are
green or explicitly waived by owner lanes.

| Acceptance ID | Requirement | Result field |
|---|---|---|
| FUP-01 | User can log in through approved auth flow | PASS / CAN_SUA / NO_GO |
| FUP-02 | Role-based menu shows only allowed modules | PASS / CAN_SUA / NO_GO |
| FUP-03 | Workspace/scope context is resolved before business data | PASS / CAN_SUA / NO_GO |
| FUP-04 | My Work / Task Center route exists, resolves scope first and is read-only/ref-only before task data contract | PASS / CAN_SUA / NO_GO |
| FUP-05 | Data Confirmation can later return `DUNG`, `CAN_SUA`, `KHONG_THUOC_TOI` with note where required after owner-approved mutation gate | PASS / CAN_SUA / NO_GO |
| FUP-06 | Reports/dashboard remain read-only and bounded | PASS / CAN_SUA / NO_GO |
| FUP-07 | Finance remains read-only until signed UAT and owner decision | PASS / CAN_SUA / NO_GO |
| FUP-08 | Audit log records actor/action/object/ref without raw payload leak | PASS / CAN_SUA / NO_GO |
| FUP-09 | Negative-access account cannot see business rows | PASS / CAN_SUA / NO_GO |
| FUP-10 | No raw PII, bank data, password, token, reset link or evidence file enters Git/Codex/chat | PASS / CAN_SUA / NO_GO |

## 9. Recommended Local Checks

Run only after the related code/config slice is intentionally selected and
scoped. Do not run these as part of this docs-only register unless the operator
explicitly starts a verification slice.

```powershell
npm.cmd run check:heu-data-confirmation-task-center
npm.cmd run check:heu-user-create-readiness
npm.cmd run check:heu-permission-scope-readiness
npm.cmd run check:heu-user-scope-baseline-repair-queue -- --static-only
npm.cmd run check:heu-user-operation-cutover-readiness
npm.cmd run check:heu-user-activation-worksheet-readiness
npm.cmd run audit:heu-user-account-security
npm.cmd run audit:heu-role-scope-uat-pack
npm.cmd run audit:ttgdtx-role-scope-access
npm.cmd run lint
npm.cmd run build -- --webpack
```

Expected boundary:

```text
PASS_LOCAL is not production.
NO_GO remains valid until owner-approved users, scopes, signed UAT and evidence
refs are complete.
```

## 10. No-Go Conditions

Stop the pilot if any condition appears:

- A user has no role, no department or no business scope.
- A non-ADMIN/BGH user receives global or `ALL` visibility without owner
  approval.
- A role can see another department's data by default.
- Finance user can pay, clear debt, approve COM or post vouchers.
- BGH/executive user can mutate daily operational data.
- Raw PII, CCCD, phone, bank, salary, payment details, passwords, reset links,
  invite links, tokens or raw evidence enter Git/Codex/chat.
- Audit log is missing actor, action, object/ref or timestamp.
- Owner approval is implied from PASS_LOCAL.

## 11. Next Runtime Slice

After this register is reviewed, the smallest aligned code slice is:

```text
HEUWorkspaceContext wrapper
Role-based landing/menu proof
Data Confirmation read-only shell
Negative access test
No database migration
No broad app rewrite
```

Recommended order:

1. Align stale docs/control PR branches.
2. Review identity/permission/scope check outputs.
3. Implement or normalize `HEUWorkspaceContext` wrapper.
4. Apply it to one route only, then add the read-only Data Confirmation shell.
5. Add/verify role-based App Shell menu behavior.
6. Run focused permission/scope checks.

## 12. Docs-Only Verification

```powershell
Test-Path -LiteralPath 'docs/HEU_CONTROL/HEU_USER_PILOT_001_REAL_USER_UAT_REGISTER_20260709.md'
Select-String -Path 'docs/HEU_CONTROL/HEU_USER_PILOT_001_REAL_USER_UAT_REGISTER_20260709.md' -Pattern 'HEU-USER-PILOT-001|PILOT-BGH-01|PILOT-NEG-01|Negative Access Tests|First Usable Product Acceptance|Production status: NO-GO'
git diff --no-index --check -- /dev/null 'docs/HEU_CONTROL/HEU_USER_PILOT_001_REAL_USER_UAT_REGISTER_20260709.md'
```

No `npm.cmd`, migration, deploy, install, commit or push is required by this
docs-only register.

## 13. SOP Slice Result Record

SOP-SCOPE:
- `HEU-USER-PILOT-001` defines the first 8-12 pilot user seats, role/scope
  gates, route/menu expectations and negative-access tests.
- The first runtime alignment now includes a read-only/ref-only
  `/data-confirmation` shell for `Viec cua toi`; task mutations remain blocked
  until IT_DATA + Audit approve data contract, audit log and rollback.
- No account, password, reset link, role, scope, SQL, runtime code, config or
  production behavior is changed.

SOP-CHECK:
- Related sources: App Shell decision, system handbook, role matrix,
  permission/scope rollout, user cutover gate and scope baseline queue.
- Main worktree remains mixed; this register belongs to a docs-only control
  branch before runtime work.

SOP-PROFESSIONAL:
- Owner lanes: BGH, IT_DATA, Audit, PHAP_CHE, Tuyen sinh, CTHSSV, Dao tao,
  Khoa and KHTC.
- Each department owner must approve its own pilot seat and data scope.

SOP-LEGAL:
- PHAP_CHE review is required before SOP/legal/evidence-class reliance.
- No raw restricted data or secret is introduced.

SOP-LOGIC:
- The register converts App Shell architecture into real-user gates without
  widening access or creating production authority.

SOP-VERIFY:
- Docs-only checks: file existence, token search and no-index diff check.
- Runtime checks are listed for future code/config verification only.
- The first Data Confirmation shell must pass
  `npm.cmd run check:heu-data-confirmation-task-center` before any task-row
  query or confirmation mutation is added.
- Lint and Webpack build should pass before the pilot route is treated as
  ready for IT_DATA + Audit review. Build-only dummy public Supabase env values
  are acceptable for local static/prerender verification; no secret should be
  copied into Git/Codex/chat.

SOP-RESULT:
- `DAT_TAM_THOI` for docs-control register after docs-only verification.
- Runtime implementation remains `CAN_SUA`.
- Production remains `NO-GO`.

SOP-NEXT:
- Review this register with IT_DATA + Audit + BGH.
- Then review the `/data-confirmation` shell with IT_DATA + Audit before adding
  any task-row query or confirmation mutation.
