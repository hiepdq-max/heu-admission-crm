# HEU AI Delivery Team Operating Register 2026-07-02

Status: PASS_LOCAL_CONTROL
Owner: BGH + IT_DATA + Audit + process owners
Production status: NO-GO for autonomous AI delivery, production deployment and
business approval
Decision values: TEAM_REGISTER_READY / NO_GO / BLOCKED

## 1. Purpose

Define how the HEU AI/IT delivery team can work continuously while the system
remains safe, cheap and controlled. This register turns the idea of "many AI
agents and IT reviewers" into operating lanes, stop conditions and handoff
rules.

This register is coordination control only. It does not create real autonomous
AI workers, send email, create software tasks, approve UAT, accept evidence,
approve finance action, approve owner GO, run production migration or mark
production GO.

## 2. Mandatory Operating Loop

Every delivery lane must follow this loop:

1. Read live Git state with `git status --short --branch` and
   `git diff --name-status`.
2. Read the current state inventory, system backlog and module readiness gap
   matrix before editing.
3. Choose exactly one small slice.
4. Touch only files in that slice.
5. Run the focused audit plus the baseline PASS_LOCAL checks.
6. Stop on any failed audit, dirty scope conflict, secret exposure, unsigned
   evidence, missing owner decision or production/UAT/finance approval request.
7. Report PASS_LOCAL only after checks pass; PASS_LOCAL never means production
   ready.

## 3. Forbidden Inputs

No lane may ask a human to paste or store these in Git, Codex, chat, email
notes or local docs:

- Passwords, temporary passwords, OTPs, password reset links, account
  activation links or invite links.
- Service-role keys, API keys, private keys, SMTP passwords or app passwords.
- Raw student PII, raw CCCD, raw phone numbers or raw bank account numbers.
- Raw bank statements, vouchers, payment proof, signed evidence or uncontrolled
  Drive files.

Sensitive proof must stay in controlled storage outside Git/Codex/chat. The
repo may contain only non-secret references, redacted summaries, checklists and
owner lanes.

## 4. Delivery Lane Register

| Lane | Allowed inputs | Allowed outputs | Must not do | Required checks | Stop condition |
|---|---|---|---|---|---|
| Build Agent | Repo docs, code, synthetic fixtures and approved non-secret references | Small PASS_LOCAL code/doc/audit slice, diff summary and proposed commit | Touch mixed dirty scope, create production migration, create real accounts, paste secrets or approve business decisions | Focused audit, current-state audit, implementation-log audit, release-gate audit, Vietnamese encoding, lint, build, diff check | Any failing check, dirty file outside the slice or request for production/UAT/finance/owner approval |
| QA/Audit Agent | Local audit output, docs and diff | Defect list, rerun checklist and blocker summary | Mark production ready, waive findings, accept evidence or sign UAT | Same focused audit set plus `audit:ttgdtx-release-gates` | Missing audit command, untraceable evidence, failed build or unsigned blocker |
| Data Check Agent | Data dictionary, report-view register, SQL object map, synthetic/redacted samples | Data-quality gap list and source-scope warnings | Import raw PII/bank data, trust raw workbook, alter production data or hide data quality issues | Data foundation, report-view/P0 register and module-specific audits | Raw or uncontrolled source appears, DQ-DM reliance lock is unresolved or owner signoff is missing |
| Finance Trial Support Agent | Finance Desk guides, P6-04/P5-03/P2-18 runbooks and non-secret task labels | Read-only accountant trial checklist, blocked-action notes and escalation route | Post vouchers, move money, approve payment, accept finance reliance or broaden pilot access | Finance Desk, role-scope, user-account security and production-readiness guard audits | Missing P6-04 proof, missing Day-1 result ledger, request for bank transfer or real credential |
| UAT/Evidence Coordinator | UAT routing hub, evidence checklist templates and owner lane names | Pending UAT lane report, external evidence reminder and signoff routing | Execute UAT, accept evidence, store raw evidence, sign on behalf of owner or close UAT | Signed-UAT routing, controlled evidence and implementation-log audits | Evidence is unsigned, raw, stored in Git/Codex/chat or missing owner/reviewer |
| Report/Email Coordinator | Daily dry-run report, email readiness checklist and approved recipient labels | Plain-language daily report draft, glossary and EMAIL_CONFIG_REQUIRED blocker | Send real email from Codex, reveal SMTP secrets, create real tasks or approve action items as done | BGH dashboard spec, email readiness report, release-gate and baseline audits | Recipient/sender/secrets are unconfigured, owner approval is missing or output would expose secrets |
| Human Authority Owner | Controlled evidence outside Git, signed UAT results and authority decision forms | Signed UAT, finance decision, evidence acceptance, access closure or owner GO/NO-GO outside Codex/chat | Delegate legal, finance, UAT, evidence acceptance or production GO to AI/Codex | Owner-specific signoff pack and controlled evidence process | Missing signature, missing controlled evidence, conflict of authority or unresolved blocker |

## 5. Handoff Rules By Stage

| Stage | AI/IT team output | Required human owner before moving on |
|---|---|---|
| A. Clean/package dirty scope | Clean or grouped worktree, one-slice commit recommendation | IT_DATA confirms unrelated dirty files are preserved |
| B. Real-accounting onboarding handoff guard | No-secret account creation/linking guide and access closure checklist | ADMIN/IT_DATA executes account creation outside Codex/chat |
| C. Finance Day-1 controlled accounting trial | Read-only Finance Desk trial script, blocker list and result ledger template | KHTC + BGH run controlled browser trial and sign results |
| D. Signed UAT/evidence/signoff routing | UAT route list, evidence checklist and owner lane report | BGH + KHTC + PHAP_CHE + Audit + IT_DATA sign required decisions |
| E. Remaining blockers | Plain-language NO-GO blocker report | Final owner GO/NO-GO outside Git/Codex/chat |

## 6. Baseline Checks

Minimum baseline for any delivery slice:

- `npm.cmd run audit:heu-current-state-inventory`
- `npm.cmd run audit:heu-implementation-log`
- `npm.cmd run audit:ttgdtx-release-gates`
- `npm.cmd run audit:heu-vietnamese-text-encoding`
- `npm.cmd run lint`
- `npm.cmd run build`
- `git diff --check`

Finance/P6-04 slices also require:

- `npm.cmd run audit:heu-role-scope-uat-pack`
- `npm.cmd run audit:heu-user-account-security`
- `npm.cmd run audit:heu-finance-desk`
- `npm.cmd run audit:ttgdtx-production-readiness-guard`

AI/team-control slices require:

- `npm.cmd run audit:heu-ai-policy`

## 7. Current Result

TEAM_REGISTER_READY is a local control state only. It means the AI/IT delivery
lanes, allowed outputs, human owner boundaries, forbidden inputs and stop
conditions are documented and auditable.

Production remains NO-GO. Autonomous AI delivery, real email sending, real task
creation, signed UAT, evidence acceptance, finance approval, owner GO/NO-GO and
production migration remain blocked until the proper human authority completes
the external controlled process.
