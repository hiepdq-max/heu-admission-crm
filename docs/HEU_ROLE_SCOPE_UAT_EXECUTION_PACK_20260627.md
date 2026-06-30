# HEU Role-Scope UAT Execution Pack 2026-06-27

Status: DRAFT_CONTROL
Scope: P6-04 role-scope UAT, with TTGDTX 9+ as the first controlled pilot path
Production status: NO-GO until signed UAT evidence exists

## 1. Purpose

Package the minimum role and workspace-scope UAT required before HEU can claim
that users only see the records and workflows they are allowed to operate. This
pack extends `docs/TTGDTX_ROLE_SCOPE_UAT_RUNBOOK.md` and does not replace the
route-level static audits.

P6-04 is about security, privacy and operating ownership. It is not a feature
launch and it does not approve production access.

## 2. Safety Boundary

Use synthetic, redacted or approved UAT data only.

Do not paste passwords, temporary passwords, OTPs, password reset links,
account activation/invite links, API keys, service-role keys, CCCD, private
phone numbers, bank accounts, bank statements, vouchers or raw student identity
data into Git, Codex/chat, screenshots or public issue trackers.

Use account labels such as `UAT_KHTC_TTGDTX_OPERATOR` instead of real account
credentials.

## 3. Required Static Preflight

Run these commands before browser UAT:

```powershell
npm.cmd run audit:permission-soft-revoke
npm.cmd run audit:ttgdtx-role-scope-access
npm.cmd run audit:ttgdtx-data-fetch-gate
npm.cmd run audit:ttgdtx-dashboard-access
npm.cmd run audit:ttgdtx-accounting-dashboard-uat-plan
npm.cmd run audit:heu-role-scope-uat-pack
npm.cmd run audit:ttgdtx-release-gates
```

All commands must pass before signed role-scope UAT.

## 4. Role Matrix

| Account label | Primary ownership | Must be allowed | Must be blocked |
|---|---|---|---|
| `UAT_ADMIN` | IT/Data control | Admin control views | Nothing beyond approved admin UAT scope; no production GO |
| `UAT_BGH` | Executive view | Read dashboards and approved summary views | Daily entry, payment execution, hidden source evidence |
| `UAT_KHTC_TTGDTX_OPERATOR` | Finance operation | TTGDTX finance pages inside assigned segment/scope | Admission-only records outside finance scope and hard delete |
| `UAT_TUYEN_SINH_TTGDTX` | Lead operation | Scoped leads and handover context | Finance dashboard totals, payment approval and payout execution |
| `UAT_CTHSSV` | Student/profile handover | Scoped handover/student-profile tasks | Finance write actions and partner payout evidence |
| `UAT_DAO_TAO` | Program/class operation | Scoped class/program readiness views | Receivable creation, tuition collection and payment execution |
| `UAT_PHAP_CHE` | Legal/source control | Contract/source/legal evidence views in scope | Finance dashboard totals unless separately approved |
| `UAT_AUDIT` | Audit/risk review | Audit logs, evidence checks and read-only risk views | Money movement and data ownership changes |
| `UAT_OUT_OF_SCOPE_STAFF` | Negative control | Login and empty/blocked state only | Any unrestricted TTGDTX finance, lead, source or dashboard data |

## 4.1 Real Accounting User UAT Queue

The user scope panel exposes
`data-heu-real-accounting-user-uat-queue="P6-04-P2-18-P5-03"` for the first
real-accounting user route. This queue is PASS_LOCAL only. It does not create
accounts, transmit passwords, approve role grants, accept UAT, approve finance
action or mark production GO.

Run this queue only after real users are created or invited in Supabase Auth
outside Codex/chat through an approved secure channel and then linked into HEU
with approved role, department, manager and business scope.

Decision value: `REAL_USER_SCOPE_READY / NO_GO / BLOCKED`.

| Case | Account class | Expected result | Stop condition |
|---|---|---|---|
| REAL-ACC-01 | Auth/profile link preflight | Real user is created/invited outside Codex/chat and linked into HEU profile with approved role, department, manager and scope | Passwords, temporary passwords, OTPs, password reset links, account activation/invite links, service-role keys or raw identity data enter Git/Codex/chat |
| REAL-ACC-02 | KHTC accounting operator | Opens P2-10, P2-13, P2-17, P2-18 and P5-03 only inside assigned TTGDTX finance scope | User sees unrestricted dashboard totals, payout actions, source evidence or non-assigned partner/student finance data |
| REAL-ACC-03 | BGH read-only reviewer | Opens P2-18, P5-03 and Master Control in read-only/review posture | User can execute daily entry, approve/pay, edit source evidence, see hidden raw evidence or trigger production GO |
| REAL-ACC-04 | Audit read-only reviewer | Reviews audit logs, redacted evidence checks, P2-18 and P5-03 traceability without changing ownership or finance facts | User can move money, grant roles, mutate source data, bypass redaction or view raw secret/PII evidence |
| REAL-ACC-05 | Phap Che legal reviewer | Reviews P0-19 legal/source/contract evidence and approved legal gate status without unrestricted finance totals | Legal-only access exposes unrestricted finance totals, payment execution, dashboard reliance or private contract bodies beyond approved scope |
| REAL-ACC-06 | Out-of-scope negative account | Login succeeds but TTGDTX finance, lead, source, dashboard and audit routes return `BLOCKED` or `EMPTY_SCOPED_STATE` | Any unrestricted TTGDTX finance, lead, source, dashboard, audit or settings data is visible |

Start with these accounting users, record only redacted user labels, route
results and evidence IDs, then expand department by department after signed
P6-04, P2-18 and P5-03 evidence exists.

Before the Day-1 real-accounting route opens P2-18, P5-03 or P2-17, record the
finance pre-login matrix in
`docs/HEU_FINANCE_DAY1_P6_04_PRELOGIN_MATRIX_20260630.md`. The matrix is
PASS_LOCAL only and exposes the decision value
`P6_04_PRELOGIN_READY / NO_GO / BLOCKED` for `REAL_KHTC_TTGDTX_OPERATOR_01`,
`REAL_BGH_READONLY_01`, `REAL_AUDIT_READONLY_01`,
`REAL_PHAP_CHE_REVIEW_01` and `REAL_OUT_OF_SCOPE_NEGATIVE_01`.

The pre-login matrix must prove the allowed route family, blocked route family,
required result and negative-control denial before any finance route is opened
with a real-accounting account. Store the filled matrix outside Git/Codex/chat
and reference only controlled evidence IDs.

The user scope panel also exposes
`data-heu-real-accounting-user-result-template="P6-04-P2-18-P5-03"` for the
controlled evidence result format. Store the filled result outside
Git/Codex/chat and reference only the evidence ID in local docs.

Required result fields:

| Field | Required value |
|---|---|
| Evidence ID | Stable controlled-evidence ID such as `REAL-ACC-EVID-001` |
| Redacted account label | Role/persona label only; no real passwords, reset links, invite links, OTPs or raw email screenshots |
| Profile and scope | Redacted Auth/profile reference, role code, department, segment scope and partner scope |
| Route and expected result | P6-04 route family plus P2-18/P5-03/P2-10/P2-17 where relevant |
| Actual result | `ALLOWED`, `BLOCKED`, `EMPTY_SCOPED_STATE`, `NO_GO` or `BLOCKED_PENDING_OWNER_SIGNOFF` |
| Human sign-off | Operator, checker, process owner and redaction reviewer outside Codex/chat |

## 4.2 Post-UAT Access Closure Handoff

After P6-04, P2-18 and P5-03 route results are signed, the real accounting
user must move into the P0-17 access closure review exposed by
`data-heu-real-user-access-closure="P0-17-P6-04"`.

Decision value: `ACCESS_RETAIN / REVOKE_OR_REDUCE / BLOCKED`.

| Case | Required handoff | Stop condition |
|---|---|---|
| P6-04-CLOSE-01 | Compare signed P6-04, P2-18 and P5-03 route results before deciding whether access is retained, reduced or blocked | Any route result is unsigned, `NO_GO`/`BLOCKED` or missing controlled evidence ID |
| P6-04-CLOSE-02 | Remove temporary pilot scope and broad finance visibility unless owner signs `ACCESS_RETAIN` for exact role, workspace and partner scope | Pilot access remains broad, undocumented or owner-unsigned |
| P6-04-CLOSE-03 | Soft-revoke or mark `INACTIVE` for blocked users, with controlled evidence reference outside Git/Codex/chat | Blocked users keep active access, or evidence contains passwords, reset links, invite links or OTPs |
| P6-04-CLOSE-04 | Record only redacted account labels, decision, owner and evidence ID in local handoff docs | Real passwords, temporary passwords, OTPs, password reset links, account activation/invite links or raw account screenshots enter Git/Codex/chat |

## 5. Route Families To Test

At minimum, browser UAT must cover:

1. Login and blocked unauthenticated routes.
2. Lead list/detail for assigned, team and out-of-scope lead visibility.
3. TTGDTX contract/source pages.
4. TTGDTX receivable, collection, reconciliation and payment pages.
5. TTGDTX accounting dashboard.
6. Master/settings pages for admin-only or delegated admin behavior.
7. Audit log pages for read-only traceability.

Use `docs/TTGDTX_BROWSER_UAT_MATRIX_20260625.md` and
`docs/TTGDTX_ACCOUNTING_DASHBOARD_ROLE_UAT_PLAN_20260627.md` for detailed
TTGDTX route cases. The user scope panel also exposes a PASS_LOCAL route
matrix at `components/settings/user-scope-enforcement-panel.tsx` so testers can
see the route-family lanes before collecting signed browser evidence.

## 6. Evidence Template

| Field | Required value |
|---|---|
| Evidence id | Stable id such as `P6-04-SCOPE-001` |
| Account label | Synthetic label only |
| Role code | Role under test |
| Segment/partner scope | UAT scope label, not private production data |
| Route family | Lead, TTGDTX finance, source, dashboard, settings or audit |
| Expected result | ALLOWED, BLOCKED or EMPTY_SCOPED_STATE |
| Actual result | Browser result |
| Screenshot/evidence | Sanitized evidence link |
| Data exposure check | PASS/FAIL for out-of-scope and sensitive data |
| Human sign-off | IT/Data plus process owner note |

## 7. Stop Conditions

Stop UAT and fix before continuing if:

1. A user sees unrestricted data outside assigned segment, partner, team or role.
2. A page queries sensitive data before auth, permission and scope checks.
3. UI hiding is the only control and the server action still permits the write.
4. A non-admin receives broad lead visibility `ALL` without approved control.
5. Finance, evidence, approval, payment, lead or audit rows can be hard-deleted.
6. AI can approve, pay, release, delete, mark revenue or mark production GO.
7. Real secrets, temporary passwords, password reset links, account
   activation/invite links or raw sensitive data appear in UAT evidence.

## 8. Sign-Off Rule

P6-04 can support production readiness only when:

1. Static preflight passes.
2. Browser UAT covers positive and negative accounts.
3. Out-of-scope denial evidence is captured.
4. Process owners sign their scope results.
5. IT/Data confirms no server-side bypass.
6. Audit confirms evidence is redacted and traceable.
7. P0-17 access closure review is queued or completed for every real
   accounting user before owner reliance.

## 9. Role-Scope Evidence Checklist

The user scope panel exposes a role-scope evidence checklist on
`components/settings/user-scope-enforcement-panel.tsx`. The checklist is
PASS_LOCAL only and covers P6-04-SCOPE-001 through P6-04-SCOPE-006: admin/BGH
boundaries, KHTC TTGDTX operator scope, admission/student-service denial,
legal/audit read-only scope, out-of-scope denial and no-secret signed evidence.

Evidence must use expected results `ALLOWED`, `BLOCKED` or
`EMPTY_SCOPED_STATE`. Do not attach passwords, temporary passwords, OTPs,
password reset links, account activation/invite links, API keys, service-role
keys, CCCD, bank accounts, bank statements, vouchers or raw student identity
data in Git/Codex/chat.

The same panel exposes `data-heu-role-scope-route-matrix="P6-04"` for route
UAT. The route matrix is PASS_LOCAL only and covers P6-04-ROUTE-01 through
P6-04-ROUTE-07: login/unauthenticated routes, lead list/detail, TTGDTX
contract/source, TTGDTX finance operations, accounting dashboard,
master/settings and audit-log pages. Results must be `ALLOWED`, `BLOCKED` or
`EMPTY_SCOPED_STATE`, and a UI-only hide is not enough if a server action can
still write.

## 10. Role-Scope Acceptance Matrix

The same panel exposes `data-heu-role-scope-acceptance-matrix="P6-04"` for the
final local acceptance review. The matrix is PASS_LOCAL only until signed
role-scope UAT evidence and owner sign-off exist.

| Case | Requirement | Minimum evidence | Stop condition |
|---|---|---|---|
| P6-04-ACCEPT-01 | Static preflight and synthetic-account boundary | Required role-scope, data-fetch, dashboard-access and release-gate audits pass; UAT evidence uses synthetic account labels only | Real passwords, temporary passwords, OTPs, password reset links, account activation/invite links, service-role keys, raw PII, CCCD, bank data or voucher data enter evidence |
| P6-04-ACCEPT-02 | Positive role access is scoped | Approved ADMIN, BGH, KHTC, PHAP_CHE, Audit and process roles can open only the routes and records owned by their role/scope | An approved user cannot perform required scoped work or sees production GO/daily finance actions outside scope |
| P6-04-ACCEPT-03 | Negative and out-of-scope denial | UAT_OUT_OF_SCOPE_STAFF, contract-only, admission-only and non-finance accounts receive `BLOCKED` or `EMPTY_SCOPED_STATE` where required | Any out-of-scope account sees unrestricted TTGDTX finance, lead, source, dashboard or audit data |
| P6-04-ACCEPT-04 | Server-side enforcement | Protected pages and server actions check auth, permission and scope before query or write; UI-only hide is not the control | A route queries sensitive data before canOpen/scope checks or a server action writes despite blocked UI |
| P6-04-ACCEPT-05 | Admin delegation and broad access control | Broad lead visibility `ALL`, scope grants and protected role changes remain admin/delegated-only and respect soft-revoke state | A non-admin grants broad access, changes protected roles, bypasses soft revoke or hard-deletes evidence rows |
| P6-04-ACCEPT-06 | Signed evidence and production boundary | IT/Data, Audit and process owners sign redacted role-scope results outside Codex/chat before P6-04 supports production review, then hand off to P0-17 access closure review | PASS_LOCAL is treated as production access approval, broad-permission approval, real-data UAT pass, finance approval or production GO, or the P0-17 access closure handoff is missing |

Decision value: `P6_04_ACCEPT / FAIL / BLOCKED`.

P6-04 can support production readiness only when P6-04-ACCEPT-01 through
P6-04-ACCEPT-06 all pass with redacted evidence, signed owner approval and the
P0-17 access closure handoff.

## 11. Role-Scope Access Decision Manifest

The same panel exposes
`data-heu-role-scope-access-decision-manifest="P6-04"` for the final access
decision record after route UAT and before owner review. This manifest is
PASS_LOCAL only until signed role-scope UAT evidence and owner sign-off exist.
It does not approve production access, broad permissions, real-data UAT,
finance action or production GO.

| Case | Decision gate | Required decision | Stop condition |
|---|---|---|---|
| P6-04-DEC-01 | Static preflight complete | Permission soft-revoke, role-scope access, data-fetch, dashboard-access, UAT-plan, role-scope pack and release-gate audits pass before browser UAT evidence is trusted | Any preflight audit fails or real passwords, temporary passwords, OTPs, password reset links, account activation/invite links, service-role keys, raw PII, CCCD, bank data or voucher data enter evidence |
| P6-04-DEC-02 | Positive role access decision | ADMIN, BGH, KHTC, PHAP_CHE, Audit and process roles are marked `ALLOWED` only for approved route families and scoped records | A positive account sees daily finance actions, hidden evidence, production GO controls or records outside approved scope |
| P6-04-DEC-03 | Negative denial decision | Out-of-scope, contract-only, admission-only and non-finance accounts are marked `BLOCKED` or `EMPTY_SCOPED_STATE` where required | Any negative account sees unrestricted TTGDTX finance, lead, source, dashboard, audit or settings data |
| P6-04-DEC-04 | Server-side enforcement decision | Protected pages and server actions prove auth, permission and scope checks happen before sensitive query or write behavior | UI hiding is the only control, a query runs before `canOpen`/scope checks, or a blocked user can still write through a server action |
| P6-04-DEC-05 | Broad access and delegation decision | Broad lead visibility, scope grants, protected role changes and delegation remain admin/delegated-only and respect soft-revoke state | A non-admin grants broad access, changes protected roles, bypasses soft revoke, hard-deletes evidence or receives unexpired unsafe delegation |
| P6-04-DEC-06 | Human access decision | Operator, checker, process owner, evidence IDs, route results, P0-17 access closure decision and final decision are recorded as `P6_04_ACCESS_READY`, `NO_GO` or `BLOCKED` | `PASS_LOCAL` is treated as production access approval, broad-permission approval, real-data UAT pass, finance approval, owner GO or production GO, or the P0-17 closure handoff is missing |

Final access decision: `P6_04_ACCESS_READY / NO_GO / BLOCKED`.

Missing access decision ID, unsigned owner decision, unresolved route result,
missing P0-17 closure handoff, server-side bypass or raw sensitive role-scope
evidence keeps P6-04 NO-GO.

## 12. Current Result

P6-04 is PASS_LOCAL as an execution pack and static guard package only. It does
not approve production access, production migration, broad account grants or
real-data UAT. Signed role-scope UAT evidence is still required before HEU can
claim production-ready access control.
