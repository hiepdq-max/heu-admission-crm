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

Do not paste passwords, temporary passwords, OTPs, reset links, account
activation/invite links, API keys, service-role keys, CCCD, private phone
numbers, bank accounts, bank statements, vouchers or raw student identity data
into Git, Codex/chat, screenshots or public issue trackers.

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
7. Real secrets, temporary passwords, activation/invite links or raw sensitive
   data appear in UAT evidence.

## 8. Sign-Off Rule

P6-04 can support production readiness only when:

1. Static preflight passes.
2. Browser UAT covers positive and negative accounts.
3. Out-of-scope denial evidence is captured.
4. Process owners sign their scope results.
5. IT/Data confirms no server-side bypass.
6. Audit confirms evidence is redacted and traceable.

## 9. Role-Scope Evidence Checklist

The user scope panel exposes a role-scope evidence checklist on
`components/settings/user-scope-enforcement-panel.tsx`. The checklist is
PASS_LOCAL only and covers P6-04-SCOPE-001 through P6-04-SCOPE-006: admin/BGH
boundaries, KHTC TTGDTX operator scope, admission/student-service denial,
legal/audit read-only scope, out-of-scope denial and no-secret signed evidence.

Evidence must use expected results `ALLOWED`, `BLOCKED` or
`EMPTY_SCOPED_STATE`. Do not attach passwords, temporary passwords, OTPs, reset
links, account activation/invite links, API keys, service-role keys, CCCD, bank
accounts, bank statements, vouchers or raw student identity data in
Git/Codex/chat.

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
| P6-04-ACCEPT-01 | Static preflight and synthetic-account boundary | Required role-scope, data-fetch, dashboard-access and release-gate audits pass; UAT evidence uses synthetic account labels only | Real passwords, temporary passwords, OTPs, reset links, activation/invite links, service-role keys, raw PII, CCCD, bank data or voucher data enter evidence |
| P6-04-ACCEPT-02 | Positive role access is scoped | Approved ADMIN, BGH, KHTC, PHAP_CHE, Audit and process roles can open only the routes and records owned by their role/scope | An approved user cannot perform required scoped work or sees production GO/daily finance actions outside scope |
| P6-04-ACCEPT-03 | Negative and out-of-scope denial | UAT_OUT_OF_SCOPE_STAFF, contract-only, admission-only and non-finance accounts receive `BLOCKED` or `EMPTY_SCOPED_STATE` where required | Any out-of-scope account sees unrestricted TTGDTX finance, lead, source, dashboard or audit data |
| P6-04-ACCEPT-04 | Server-side enforcement | Protected pages and server actions check auth, permission and scope before query or write; UI-only hide is not the control | A route queries sensitive data before canOpen/scope checks or a server action writes despite blocked UI |
| P6-04-ACCEPT-05 | Admin delegation and broad access control | Broad lead visibility `ALL`, scope grants and protected role changes remain admin/delegated-only and respect soft-revoke state | A non-admin grants broad access, changes protected roles, bypasses soft revoke or hard-deletes evidence rows |
| P6-04-ACCEPT-06 | Signed evidence and production boundary | IT/Data, Audit and process owners sign redacted role-scope results outside Codex/chat before P6-04 supports production review | PASS_LOCAL is treated as production access approval, broad-permission approval, real-data UAT pass, finance approval or production GO |

Decision value: `P6_04_ACCEPT / FAIL / BLOCKED`.

P6-04 can support production readiness only when P6-04-ACCEPT-01 through
P6-04-ACCEPT-06 all pass with redacted evidence and signed owner approval.

## 11. Role-Scope Access Decision Manifest

The same panel exposes
`data-heu-role-scope-access-decision-manifest="P6-04"` for the final access
decision record after route UAT and before owner review. This manifest is
PASS_LOCAL only until signed role-scope UAT evidence and owner sign-off exist.
It does not approve production access, broad permissions, real-data UAT,
finance action or production GO.

| Case | Decision gate | Required decision | Stop condition |
|---|---|---|---|
| P6-04-DEC-01 | Static preflight complete | Permission soft-revoke, role-scope access, data-fetch, dashboard-access, UAT-plan, role-scope pack and release-gate audits pass before browser UAT evidence is trusted | Any preflight audit fails or real passwords, temporary passwords, OTPs, reset links, activation/invite links, service-role keys, raw PII, CCCD, bank data or voucher data enter evidence |
| P6-04-DEC-02 | Positive role access decision | ADMIN, BGH, KHTC, PHAP_CHE, Audit and process roles are marked `ALLOWED` only for approved route families and scoped records | A positive account sees daily finance actions, hidden evidence, production GO controls or records outside approved scope |
| P6-04-DEC-03 | Negative denial decision | Out-of-scope, contract-only, admission-only and non-finance accounts are marked `BLOCKED` or `EMPTY_SCOPED_STATE` where required | Any negative account sees unrestricted TTGDTX finance, lead, source, dashboard, audit or settings data |
| P6-04-DEC-04 | Server-side enforcement decision | Protected pages and server actions prove auth, permission and scope checks happen before sensitive query or write behavior | UI hiding is the only control, a query runs before `canOpen`/scope checks, or a blocked user can still write through a server action |
| P6-04-DEC-05 | Broad access and delegation decision | Broad lead visibility, scope grants, protected role changes and delegation remain admin/delegated-only and respect soft-revoke state | A non-admin grants broad access, changes protected roles, bypasses soft revoke, hard-deletes evidence or receives unexpired unsafe delegation |
| P6-04-DEC-06 | Human access decision | Operator, checker, process owner, evidence IDs, route results and final decision are recorded as `P6_04_ACCESS_READY`, `NO_GO` or `BLOCKED` | `PASS_LOCAL` is treated as production access approval, broad-permission approval, real-data UAT pass, finance approval, owner GO or production GO |

Final access decision: `P6_04_ACCESS_READY / NO_GO / BLOCKED`.

Missing access decision ID, unsigned owner decision, unresolved route result,
server-side bypass or raw sensitive role-scope evidence keeps P6-04 NO-GO.

## 12. Current Result

P6-04 is PASS_LOCAL as an execution pack and static guard package only. It does
not approve production access, production migration, broad account grants or
real-data UAT. Signed role-scope UAT evidence is still required before HEU can
claim production-ready access control.
