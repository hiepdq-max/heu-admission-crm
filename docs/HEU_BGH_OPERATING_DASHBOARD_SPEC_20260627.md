# HEU BGH Operating Dashboard Specification 2026-06-27

Status: DRAFT_CONTROL
Scope: P5-02 BGH operating dashboard specification for HEU internal governance
Production status: NO-GO until source workflows, role-scope UAT and owner
sign-off are complete

## 1. Purpose

Define what BGH should see in an operating dashboard and, just as importantly,
what BGH should not do from that dashboard. The dashboard is an executive
read-only control surface for trend, exception, risk and Go/No-Go review. It is
not a daily data-entry screen and it must not become a hidden approval,
payment, revenue or production-release path.

## 2. Design Principles

- Workflow before dashboard: do not trust a KPI before the source workflow is
  controlled and auditable.
- Locked/approved facts before conclusion: finance totals must come from
  approved or locked source records where the workflow requires that state.
- Exception first: BGH needs blockers, overdue items and high-risk variance
  before decorative charts.
- Scope aware: BGH can see governance summaries, but row-level sensitive data
  still follows role/scope, evidence and privacy rules.
- Read-only by default: dashboard cards may link to source workflows, but must
  not create, update, approve, pay, delete, unlock, reverse or mark production
  GO.

## 3. Dashboard Sections

| Section | Primary source | BGH question answered | Release dependency |
|---|---|---|---|
| Admission pipeline | `/`, `/reports`, `leads`, admission segment workspace data | Are leads moving through the funnel and where are bottlenecks? | P3-02 handover guard and role-scope UAT |
| TTGDTX finance cockpit | `/ttgdtx/accounting-dashboard`, P2-03/P2-10/P2-13/P2-17 views | What is receivable, collected, reconciled, approved and paid? | P4-01 lifecycle, P5-01 dashboard role UAT, signed finance UAT |
| Go/No-Go readiness | `docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md`, release-gate audits | Is production still NO-GO and why? | P0 backup/restore, migration order, evidence binder, final handoff summary and UAT sign-off |
| Risk and exception board | audit logs, P2-07/P2-08 issue routing, control boards | Which high-risk items need owner action? | P6 audit-log and hard-delete controls |
| Source/evidence health | P2-11/P2-19 source control docs and checks | Are BBNT, invoice, bank, account-freeze/release and legal evidence sufficient? | P2-19 evidence metadata and source-control UAT |
| Role/scope health | `docs/HEU_ROLE_SCOPE_UAT_EXECUTION_PACK_20260627.md` and role audits | Are users seeing only the right data? | P6-04 signed role-scope UAT |
| AI advisory health | `docs/HEU_AI_ASSISTANT_POLICY_20260627.md` | Is AI still advisory-only? | P7-01 and future prompt/output audit |

## 4. Minimum KPI Set

The first BGH dashboard version should use a small, controlled KPI set:

| KPI | Definition | Must not show |
|---|---|---|
| Lead conversion | Lead counts by status, segment and enrollment result | Raw private phone/CCCD in summary cards |
| Handover backlog | Count of packets waiting for CTHSSV/Dao Tao/KHTC action | Unredacted evidence payloads |
| Receivable total | Active TTGDTX receivable total and balance | Editable receivable rows |
| Collected total | Posted P2-10 collection total with invoice/chung-tu status summary | Raw bank account details |
| Reconciliation health | READY/REVIEWED/APPROVED/LOCKED/blocked counts | Direct lock/unlock controls |
| Partner payable | Approved and remaining partner payment request totals | Pay button or voucher entry |
| Exception count | Critical/open controls by owner department | Hidden or suppressed exceptions |
| Production blockers | Count and list of NO-GO blockers by owner | GO button or AI-produced approval |

## 5. Access And Privacy Rules

BGH dashboard access must obey these rules:

1. BGH sees governance summaries and approved/controlled dashboard views.
2. BGH should not be the daily data-entry role.
3. BGH dashboard must not expose row-level PII, raw bank data, credentials,
   passwords, temporary passwords, OTPs, password reset links, account
   activation/invite links, service keys, unredacted source files or private
   contract terms.
4. Drill-down links must go to permissioned source workflows.
5. Finance/legal/evidence data must preserve the source owner and audit trail.
6. Out-of-scope users must be blocked or see empty scoped states.

## 6. Stop Conditions

Stop implementation and fix before continuing if:

1. A dashboard card can mutate business or finance state.
2. BGH can approve/pay/recognize revenue/mark production GO from the dashboard.
3. A KPI is derived from unlocked, unapproved or unresolved source facts when
   the workflow requires locked/approved/resolved state.
4. A report exposes raw PII, bank or credential data.
5. Dashboard queries run before auth, permission and scope checks.
6. AI output is displayed as approval evidence.
7. A production-readiness card says GO while the production checklist remains
   NO-GO.

## 7. Implementation Order

1. Keep `/ttgdtx/accounting-dashboard` as the first finance cockpit.
2. Execute `docs/TTGDTX_ACCOUNTING_DASHBOARD_ROLE_UAT_PLAN_20260627.md`.
3. Execute `docs/HEU_ROLE_SCOPE_UAT_EXECUTION_PACK_20260627.md`.
4. Add a BGH summary route only after source workflows and role-scope tests are
   green in UAT.
5. Keep the first BGH route read-only and link-only.
6. Require BGH/KHTC/Phap Che/Audit/IT-Data sign-off before production use.

## 8. P5-02 Read-Only Blocker Summary

The first implemented control surface is
`components/master-control/production-readiness-blocker-summary.tsx`, mounted on
`app/master-control/page.tsx` with
`data-heu-production-blocker-summary="P5-02"`.

It shows the current production recommendation as NO-GO and lists P0-03,
Step90-Step110, P0-19, P2-17, P2-18, P6-04, P6-03, P6-06, P0-10 and P0-09
blockers with responsible owners and source links. No GO button is provided.
The same component also shows a
`data-heu-production-safe-iteration-loop="P5-02"` Safe iteration loop from
`SAFE_ITERATION_STEPS`, plus a `data-heu-production-action-queue="P5-02"` Next controlled actions
queue from `PRODUCTION_EXECUTION_STEPS`, so BGH and owners
can see the one-blocker, one-audit, controlled-proof rhythm and the controlled
sequence, including P0-14 intake-ledger evidence binder closure and P0-15 final
handoff summary, before any GO/NO-GO discussion. The component is read-only and does
not create, update, approve, pay, delete, unlock, reverse, mark UAT accepted or
mark production GO.

The same surface also includes
`data-heu-daily-report-task-handoff="P5-02"` as a dry-run shell for daily
report and task handoff. It exposes `DAILY_REPORT_DRY_RUN / NO_GO / BLOCKED`,
the report lines for build progress, controlled trial users and plain-language
glossary, plus task lanes for IT_DATA, KHTC, BGH, Audit and Phap Che. This is a
handoff template only: it does not send email, create real tasks, store
passwords, OTPs, invite/reset links, bank data, raw PII or approve UAT,
finance action, owner GO or production GO.
`npm.cmd run report:heu-daily-dry-run` prints the same kind of plain-language
draft for local use or GitHub Actions step summary, and
`.github/workflows/heu-pass-local.yml` appends that draft to the scheduled
PASS_LOCAL gate summary without sending mail.
`npm.cmd run report:heu-email-readiness` prints an
`EMAIL_DRY_RUN_READY / EMAIL_CONFIG_REQUIRED / BLOCKED` readiness checklist for
GitHub Actions variables/secrets such as recipient list, sender identity and
SMTP settings. It hides values, does not send mail and keeps all passwords,
app passwords, OTPs, invite/reset links, service-role keys, bank credentials,
raw PII, bank statements, vouchers and raw payment data outside Git/Codex/chat.

## 9. Current Evidence

Current local evidence:

- `app/page.tsx`
- `app/reports/page.tsx`
- `app/master-control/page.tsx`
- `components/master-control/production-readiness-blocker-summary.tsx`
- `.github/workflows/heu-pass-local.yml`
- `scripts/report-heu-daily-dry-run.mjs`
- `scripts/report-heu-email-readiness.mjs`
- `lib/production-readiness.ts`
- `app/ttgdtx/accounting-dashboard/page.tsx`
- `docs/TTGDTX_ACCOUNTING_DASHBOARD_ROLE_UAT_PLAN_20260627.md`
- `docs/HEU_ROLE_SCOPE_UAT_EXECUTION_PACK_20260627.md`
- `docs/TTGDTX_RECEIVABLE_PAYMENT_STATUS_LIFECYCLE_POLICY_20260627.md`
- `docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md`
- `npm.cmd run audit:heu-bgh-dashboard-spec`
- `npm.cmd run audit:ttgdtx-dashboard-access`
- `npm.cmd run audit:ttgdtx-release-gates`
- `npm.cmd run report:heu-daily-dry-run`
- `npm.cmd run report:heu-email-readiness`

## 10. Current Result

P5-02 is PASS_LOCAL as a dashboard specification, control boundary and
read-only blocker summary only. It does not implement a production BGH
dashboard, approve production dashboard use, approve finance actions, approve
production GO or replace signed UAT.
