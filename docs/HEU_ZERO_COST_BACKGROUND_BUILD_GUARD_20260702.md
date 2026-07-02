# HEU Zero-Cost Background Build Guard 2026-07-02

Status: PASS_LOCAL_ZERO_COST_GUARD
Decision value: ZERO_COST_BACKGROUND_BUILD_READY / NO_GO / BLOCKED
Scope: GitHub Actions PASS_LOCAL verification when the local computer is off.

This guard records the current 0-dong path for HEU background checking. It
uses the existing GitHub Actions workflow and included/free quota only. It
does not create autonomous AI workers, buy a server, enter payment details,
create cloud infrastructure, call AI/API services, send real email, create
real tasks/tickets, create real users, accept UAT, accept evidence, approve
finance action, approve owner GO/NO-GO, deploy production, run production
migration or mark production GO.

## Allowed Background Work

| Lane | Allowed path | Stop condition |
|---|---|---|
| ZERO-COST-01 Daily PASS_LOCAL check | `.github/workflows/heu-pass-local.yml` scheduled run at `15 23 * * *` | Schedule missing or disabled |
| ZERO-COST-02 Standard runner only | `ubuntu-latest` with `permissions: contents: read` | Larger runner, paid runner or write token requested |
| ZERO-COST-03 Included/free quota only | GitHub Actions included/free quota, no artifact upload and no paid service | Billing/quota/budget state is unclear or over limit |
| ZERO-COST-04 Checks only | Audit, lint, build, `git diff --check`, dry-run report summary | Any step writes production data, deploys or approves |
| ZERO-COST-05 Human continuation | Human/Codex continues coding only when authorized and within one PASS_LOCAL slice | Workflow self-codes, self-commits, self-merges or self-approves |

## Required Workflow Boundaries

- `HEU_COST_MODE: ZERO_COST_QUOTA_GUARD`
- `HEU_BACKGROUND_MODE: GITHUB_ACTIONS_PASS_LOCAL_ONLY`
- `permissions: contents: read`
- `runs-on: ubuntu-latest`
- `timeout-minutes: 35`
- `concurrency` with `cancel-in-progress: true`
- `npm run audit:heu-ai-policy`
- `npm run audit:ttgdtx-release-gates`
- `npm run lint`
- `npm run build`
- `git diff --check`
- `report-heu-daily-dry-run`
- `report-heu-email-readiness`

## Forbidden Cost/Authority Actions

- Do not buy a server or enter payment details from Codex/chat.
- Do not use larger runners, paid cloud servers, paid AI/API calls or paid email service.
- Do not upload artifacts, raw evidence, secrets, passwords, OTPs, invite/reset links, raw PII, bank data, vouchers or signed evidence.
- Do not send real email, create real tasks/tickets or create real users.
- Do not execute UAT, accept evidence, approve finance action, approve owner GO/NO-GO, deploy production, run production migration or mark production GO.

## PASS_LOCAL Checks

- `npm.cmd run audit:heu-ai-policy`
- `npm.cmd run audit:heu-current-state-inventory`
- `npm.cmd run audit:heu-implementation-log`
- `npm.cmd run audit:ttgdtx-release-gates`
- `npm.cmd run audit:heu-vietnamese-text-encoding`
- `npm.cmd run lint`
- `npm.cmd run build`
- `git diff --check`

Passing local checks means the zero-cost background verification guard is
documented and audited. It does not mean autonomous AI coding is enabled or
production is approved.
