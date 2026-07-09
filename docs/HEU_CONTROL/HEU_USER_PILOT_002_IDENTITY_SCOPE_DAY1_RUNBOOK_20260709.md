# HEU User Pilot 002 Identity Scope Day-1 Runbook 2026-07-09

Task ID: HEU-USER-PILOT-002-IDENTITY-SCOPE-DAY1-RUNBOOK
Repository: heu-admission-crm
Branch: codex/heu/user-pilot-identity-scope-day1
Status: DRAFT_CONTROL
Production status: NO-GO
Scope: docs/control runbook and read-only checker only

## 1. Purpose

This runbook turns `HEU_USER_PILOT_001_REAL_USER_UAT_REGISTER_20260709.md`
into the smallest safe Day-1 identity and scope execution plan.

Goal:

```text
8-12 pilot users can be prepared for controlled login.
Every pilot user has role, department, workspace and business scope.
Every pilot user has one allowed route and one forbidden route test.
No password, reset link, invite link, secret or raw evidence enters Git/Codex/chat.
No production migration, deploy, paid automation, finance action or owner GO is approved.
```

This file does not create accounts, grant scope, send email, run UAT, accept
evidence, approve finance action, approve owner GO/NO-GO or mark production GO.

## 2. Required Inputs

| Input | Required state | Stop if missing |
|---|---|---|
| AppShell runtime PR | PR #12 or equivalent AppShell branch under IT_DATA + Audit review | `HEUWorkspaceContext` and `/data-confirmation` are not reviewable |
| Roadmap PR | PR #13 or equivalent roadmap under IT_DATA + Audit review | The one-app modular monolith decision is not locked |
| User Pilot 001 register | `docs/HEU_CONTROL/HEU_USER_PILOT_001_REAL_USER_UAT_REGISTER_20260709.md` | Pilot seats and route matrix are missing |
| Role matrix | `docs/HEU_ROLE_PERMISSION_MATRIX_V1.md` | No baseline permission posture |
| Scope operation docs | `docs/HEU_PERMISSION_SCOPE_OPERATION_BREAKDOWN_20260703.md` | No scope repair/cutover lane |
| User cutover gate | `docs/HEU_USER_PERMISSION_OPERATION_CUTOVER_GATE_20260703.md` | No operational-access gate |
| Scope baseline queue | `docs/HEU_USER_SCOPE_BASELINE_REPAIR_QUEUE_20260703.md` | Scope baseline blockers are not visible |

If any required input is absent, record `BLOCKED_SOURCE_MISSING` and do not
create, invite, link, scope or activate pilot users.

## 3. Day-1 Pilot Seat Batch

Use labels only. Real names, emails, phone numbers and personal data stay
outside Git/Codex/chat.

| Batch | Seat labels | Owner approval required | Day-1 route |
|---|---|---|---|
| Batch A - Control | PILOT-BGH-01, PILOT-ITDATA-01, PILOT-AUDIT-01, PILOT-PHAPCHE-01 | BGH + IT_DATA + Audit + PHAP_CHE | `/`, `/reports`, `/settings`, `/audit` as scoped/read-only where applicable |
| Batch B - Department | PILOT-TS-01, PILOT-CTHSSV-01, PILOT-DAO-01, PILOT-KHOA-01 | Department owner + IT_DATA + Audit | Own module or `/data-confirmation` |
| Batch C - Finance | PILOT-KHTC-01 | KHTC + Audit + BGH where needed | `/finance-desk` read-only only |
| Batch D - Negative | PILOT-NEG-01 | IT_DATA + Audit | Safe no-scope/no-access result |

Do not widen beyond these labels until every required negative test in this
runbook is `PASS` or explicitly `BLOCKED_OWNER_DECISION`.

## 4. Identity Creation Boundary

| Gate | Required behavior | Hard stop |
|---|---|---|
| ID-DAY1-01 | Account creation/invite happens only in approved Auth owner channel | Password, invite link or reset link appears in Git/Codex/chat |
| ID-DAY1-02 | CRM user profile is linked to Auth user before login reliance | Login works but profile/scope is absent |
| ID-DAY1-03 | Each user has one primary role lane and one department lane | User has undefined or broad fallback role |
| ID-DAY1-04 | Each user has explicit workspace/business scope before module access | Non-ADMIN/BGH user receives global rows |
| ID-DAY1-05 | Temporary password/reset process uses approved self-service channel | Codex/operator manually sends password |
| ID-DAY1-06 | Pilot evidence captures labels and refs only, not raw personal data | PII, CCCD, phone, bank, payment or secret data is copied |

Codex may draft the checklist and verify control tokens. Codex must not create
or invite real users, set passwords, grant scope or send credentials.

## 5. Scope Assignment Matrix

| Seat | Required role lane | Department lane | Business scope | First allowed route | Required negative route/action |
|---|---|---|---|---|---|
| PILOT-BGH-01 | BGH viewer | BGH | Approved summaries only | `/` or `/reports` | Attempt mutation button/action is blocked |
| PILOT-ITDATA-01 | IT_DATA operator | IT_DATA | System/control lane only | `/settings` | Finance approval/payment action is blocked |
| PILOT-AUDIT-01 | Audit reviewer | Audit | Control metadata only | `/audit` | Raw secret/password/token is blocked/redacted |
| PILOT-PHAPCHE-01 | PHAP_CHE reviewer | PHAP_CHE | SOP/legal refs only | Legal/SOP checklist route | User grant or finance posting is blocked |
| PILOT-TS-01 | Tuyen sinh operator | Tuyen sinh | Assigned segment/partner/workspace only | `/leads` or assigned task | Other department lead rows are not visible |
| PILOT-CTHSSV-01 | CTHSSV owner | CTHSSV | CTHSSV department/scope only | `/data-confirmation` or `/cthssv` | Admission raw lead outside task is blocked |
| PILOT-DAO-01 | Dao tao owner | Dao tao | Dao tao department/scope only | `/data-confirmation` | Finance action is blocked |
| PILOT-KHOA-01 | Khoa owner | Khoa | Khoa department/scope only | `/khoa` or `/data-confirmation` | Student finance data is blocked |
| PILOT-KHTC-01 | KHTC finance viewer | KHTC | Finance scoped summaries/evidence refs only | `/finance-desk` | Payment, debt clearing, voucher posting are blocked |
| PILOT-NEG-01 | No-scope test | NONE | No broad business scope | safe no-access route | Any business row access is blocked |

## 6. Day-1 Operator Steps

Run manually through the approved operator channel. Keep evidence outside
Git/Codex/chat and store only redacted refs in HEU control docs.

| Step | Operator action | Required proof ref | Stop condition |
|---:|---|---|---|
| 1 | Confirm owner approval for the pilot seat label | Owner approval ref | No owner approval |
| 2 | Create/invite Auth account outside Codex/chat | Auth account ref, no credential | Password/link appears in chat/docs |
| 3 | Link CRM profile to Auth account | Profile-link ref | Missing profile link |
| 4 | Assign role lane | Role assignment ref | Undefined or broad role |
| 5 | Assign department lane | Department assignment ref | Missing department |
| 6 | Assign workspace/business scope | Scope assignment ref | Missing scope or global fallback |
| 7 | First login test | Login evidence ref | Login fails or password captured |
| 8 | First allowed route test | Allowed route evidence ref | Route fails or leaks data |
| 9 | Required negative test | Negative-test evidence ref | Forbidden route/action succeeds |
| 10 | Audit/control trace check | Actor/action/object/ref evidence | Audit trace missing or raw payload leaked |
| 11 | Owner result | `PASS`, `CAN_SUA`, `NO_GO` or `BLOCKED_OWNER_DECISION` | Owner result implied by Codex |

## 7. Evidence Ledger Template

Do not fill this table with real names, emails, phone numbers, passwords, links
or raw evidence. Use labels and controlled evidence refs only.

| Seat | Auth ref | Profile ref | Role ref | Department ref | Scope ref | Allowed route ref | Negative test ref | Audit trace ref | Result |
|---|---|---|---|---|---|---|---|---|---|
| PILOT-BGH-01 | TBD_OUTSIDE_GIT | TBD_OUTSIDE_GIT | TBD | TBD | TBD | TBD | TBD | TBD | CHUA_KIEM |
| PILOT-ITDATA-01 | TBD_OUTSIDE_GIT | TBD_OUTSIDE_GIT | TBD | TBD | TBD | TBD | TBD | TBD | CHUA_KIEM |
| PILOT-AUDIT-01 | TBD_OUTSIDE_GIT | TBD_OUTSIDE_GIT | TBD | TBD | TBD | TBD | TBD | TBD | CHUA_KIEM |
| PILOT-PHAPCHE-01 | TBD_OUTSIDE_GIT | TBD_OUTSIDE_GIT | TBD | TBD | TBD | TBD | TBD | TBD | CHUA_KIEM |
| PILOT-TS-01 | TBD_OUTSIDE_GIT | TBD_OUTSIDE_GIT | TBD | TBD | TBD | TBD | TBD | TBD | CHUA_KIEM |
| PILOT-CTHSSV-01 | TBD_OUTSIDE_GIT | TBD_OUTSIDE_GIT | TBD | TBD | TBD | TBD | TBD | TBD | CHUA_KIEM |
| PILOT-DAO-01 | TBD_OUTSIDE_GIT | TBD_OUTSIDE_GIT | TBD | TBD | TBD | TBD | TBD | TBD | CHUA_KIEM |
| PILOT-KHOA-01 | TBD_OUTSIDE_GIT | TBD_OUTSIDE_GIT | TBD | TBD | TBD | TBD | TBD | TBD | CHUA_KIEM |
| PILOT-KHTC-01 | TBD_OUTSIDE_GIT | TBD_OUTSIDE_GIT | TBD | TBD | TBD | TBD | TBD | TBD | CHUA_KIEM |
| PILOT-NEG-01 | TBD_OUTSIDE_GIT | TBD_OUTSIDE_GIT | TBD | TBD | TBD | TBD | TBD | TBD | CHUA_KIEM |

## 8. Day-1 Exit Criteria

Day-1 controlled pilot can be considered `DAT_TAM_THOI_CONTROLLED_PILOT` only
when all are true:

| Gate | Required evidence |
|---|---|
| DAY1-EXIT-01 | Every pilot user has owner approval, role, department and explicit business scope |
| DAY1-EXIT-02 | `HEUWorkspaceContext` resolves before business route data is trusted |
| DAY1-EXIT-03 | Each pilot user has one allowed route proof |
| DAY1-EXIT-04 | Each pilot user has one forbidden route/action proof |
| DAY1-EXIT-05 | KHTC remains read-only; no payment, debt clearing, voucher posting or COM approval |
| DAY1-EXIT-06 | BGH remains read-only; no hidden mutation authority |
| DAY1-EXIT-07 | Audit/control trace records actor, action, object/ref and timestamp |
| DAY1-EXIT-08 | No password, reset link, invite link, token, API key, CCCD, bank/payment data or raw evidence enters Git/Codex/chat |
| DAY1-EXIT-09 | Any failed negative test blocks pilot widening |
| DAY1-EXIT-10 | Owner result is recorded as `PASS`, `CAN_SUA`, `NO_GO` or `BLOCKED_OWNER_DECISION`; Codex does not infer approval |

## 9. Checks For This Slice

Local docs/checker verification:

```powershell
npm.cmd run check:heu-user-pilot-identity-scope-day1-readiness
node --check scripts/check-heu-user-pilot-identity-scope-day1-readiness.mjs
git diff --check
```

Future runtime verification before real pilot widening:

```powershell
npm.cmd run check:heu-app-shell-draft-pr-readiness -- --runtime
npm.cmd run check:heu-data-confirmation-task-center
npm.cmd run check:heu-user-create-readiness
npm.cmd run check:heu-permission-scope-readiness
npm.cmd run check:heu-user-scope-baseline-repair-queue -- --static-only
npm.cmd run audit:heu-user-account-security
npm.cmd run audit:heu-role-scope-uat-pack
```

Do not run migration, deploy, `npm install`, `npm ci`, Supabase push or paid
automation as part of this slice.

## 10. AI And Cost Boundary

AI can help only by:

- drafting the checklist;
- checking missing metadata;
- summarizing PASS/CAN_SUA/NO_GO rows;
- warning about scope drift or secret exposure.

AI must not:

- call a paid provider automatically;
- process raw PII, payment evidence or secrets;
- create, invite or modify real users;
- grant scope;
- send real email/tasks;
- approve UAT, evidence, finance action, owner GO/NO-GO or production.

If AI support is later enabled, it must have deterministic filters, metadata-only
inputs, call budget, output log and kill switch before the first AI call.

## 11. Rollback

Rollback for this slice:

1. Revert the Day-1 runbook/checker PR.
2. Leave all real user/account/scope changes untouched until IT_DATA follows the
   approved Auth/admin rollback process outside Git/Codex/chat.
3. If a pilot scope is wrong, disable or reduce access through the approved
   owner channel and record `REVOKE_OR_REDUCE` evidence outside Git/Codex/chat.

No database rollback is needed for this docs/control slice because it does not
run SQL or migration.

## 12. SOP Slice Result Record

SOP-SCOPE:
- `HEU-USER-PILOT-002` defines the Day-1 identity/scope runbook for pilot
  labels created by `HEU-USER-PILOT-001`.
- Scope is docs/control + read-only checker only.

SOP-CHECK:
- Work is stacked on the AppShell PR branch so `HEU_USER_PILOT_001` and
  `HEUWorkspaceContext` evidence remain visible.
- Main dirty worktree is not modified.

SOP-PROFESSIONAL:
- Owner lanes: BGH, IT_DATA, Audit, PHAP_CHE, Tuyen sinh, CTHSSV, Dao tao,
  Khoa and KHTC.
- Each owner approves only its own seat and scope.

SOP-LEGAL:
- No legal, SOP, UAT, evidence or production approval is inferred.
- PHAP_CHE review is required before legal/SOP reliance.

SOP-LOGIC:
- Every real user must pass role, department, workspace/scope, allowed-route and
  negative-route checks before widening.

SOP-VERIFY:
- Required local check: `npm.cmd run check:heu-user-pilot-identity-scope-day1-readiness`.
- Runtime checks remain separate and must pass before real pilot widening.

SOP-RESULT:
- `CAN_SUA` until IT_DATA + Audit review this runbook and runtime checks remain
  green.

SOP-NEXT:
- After review, run the identity/scope check bundle and record pilot user
  evidence refs outside Git/Codex/chat.
