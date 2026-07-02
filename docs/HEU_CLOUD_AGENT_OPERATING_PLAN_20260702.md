# HEU Cloud Agent Operating Plan 2026-07-02

Status: PASS_LOCAL_PLAN
Decision lane: CLOUD_AGENT_PLAN_READY / NO_GO / BLOCKED
Production status: NO-GO
Owner: BGH + IT_DATA + Audit + Human Authority Owner

## 1. Purpose

This document records the approved direction to prepare a paid cloud-agent
option for HEU continuous build work when the local computer is off.

This is a planning and control document only. It does not buy a server, enter a
payment card, create cloud infrastructure, create autonomous AI workers, store
secrets, send email, create tasks, create users, accept UAT, accept evidence,
approve finance action, approve owner GO/NO-GO, run production migration or
mark production GO.

## 2. Approved Budget Direction

The accepted minimum planning range is:

| Cost item | Planning range | Control |
|---|---:|---|
| Small cloud server | USD 10-20 per month | Human owner chooses provider and payment account |
| AI/API usage cap | USD 10-20 per month | Human owner sets hard usage limit |
| Initial total cap | USD 20-40 per month | Stop when budget cap is reached |

Do not treat this as permission for Codex to purchase services. A human owner
must create the cloud account, payment method, spending cap and cancellation
route outside Git/Codex/chat.

## 3. Allowed Cloud-Agent Work

Allowed after human setup:

1. Pull the approved branch.
2. Run PASS_LOCAL checks.
3. Produce daily dry-run reports.
4. Prepare small code/documentation patches for human review.
5. Open a draft PR or commit only if an explicitly approved workflow allows it.
6. Stop on dirty scope, audit failure, budget warning, missing owner approval or
   any secret/evidence exposure risk.

## 4. Forbidden Cloud-Agent Work

The cloud agent must not:

- Create production users, passwords, OTPs, invite links or reset links.
- Store service-role keys, API keys, SMTP passwords, app passwords, raw PII,
  bank statements, vouchers, payment proof or signed evidence in Git/Codex/chat.
- Send real email until the Report/Email owner enables a separate approved
  sender with secrets outside Git/Codex/chat.
- Create real tasks/tickets for staff until an approved task system and owner
  routing are configured.
- Approve UAT, accept evidence, approve finance, approve access closure,
  approve owner GO/NO-GO, deploy production or run production migration.

## 5. Required Human Setup Outside Git/Codex/Chat

Before any real cloud agent can run continuously, IT_DATA and the Human
Authority Owner must confirm:

| Requirement | Owner | Status |
|---|---|---|
| Cloud provider selected | IT_DATA + BGH | PENDING |
| Payment account and hard monthly cap configured | BGH + IT_DATA | PENDING |
| Repository access token with least privilege | IT_DATA + Audit | PENDING |
| OpenAI/API key with usage cap | BGH + IT_DATA | PENDING |
| Secret storage outside Git/Codex/chat | IT_DATA + Audit | PENDING |
| Kill switch and cancellation route documented | IT_DATA + BGH | PENDING |
| Daily report recipient labels approved | BGH + IT_DATA | PENDING |
| No-production/no-UAT/no-finance authority boundary signed | BGH + Audit | PENDING |

## 6. Operating Loop

Every cloud-agent slice must follow this loop:

1. Run `git status --short --branch`.
2. Run `git diff --name-status`.
3. Read `docs/HEU_CURRENT_STATE_INVENTORY.md`,
   `docs/HEU_SYSTEM_BUILD_BACKLOG.md` and
   `docs/HEU_MODULE_READINESS_GAP_MATRIX_20260628_V01_DRAFT.md`.
4. Choose exactly one small slice.
5. Report expected files before editing.
6. Run focused audit, baseline audit/lint/build and `git diff --check`.
7. Report PASS_LOCAL only after all checks pass.
8. Keep production NO-GO unless the required human owner signs outside
   Git/Codex/chat.

## 7. Stop Conditions

Stop immediately and mark BLOCKED when:

- Monthly budget cap is reached or cannot be verified.
- Any required secret is missing, exposed or requested in chat.
- Worktree contains dirty files outside the selected slice.
- Any audit/lint/build fails after scoped retry.
- The requested work would create users, send email, create tasks, accept
  evidence, execute UAT, approve finance or mark production GO.
- The cloud provider, repo token, API key, or kill switch is not owner-approved.

## 8. Current Result

CLOUD_AGENT_PLAN_READY is a PASS_LOCAL_PLAN state only. It records that the
paid cloud-agent direction and budget-control boundary are documented.

Production remains NO-GO. Real cloud setup, payment, secrets, autonomous
execution, real email, real task creation, UAT, evidence acceptance, finance
approval, owner GO/NO-GO and production migration remain blocked until human
owners configure and approve them outside Git/Codex/chat.
