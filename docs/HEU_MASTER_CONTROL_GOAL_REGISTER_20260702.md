# HEU Master Control Goal Register 2026-07-02

Status: PASS_LOCAL_GOAL_CONTROL
Owner: BGH + IT_DATA + KHTC + PHAP_CHE + Audit + process owners
Production status: NO-GO
Decision values: MASTER_GOAL_READY / NO_GO / BLOCKED

## 1. Purpose

Turn the HEU Master Control objective into a controlled build target. This
register is written for BGH and non-IT owners: it explains what we are building,
who is expected to use it, what can continue when the local computer is off and
what still requires the correct human authority.

This is a goal-control document only. It does not create autonomous AI workers,
send real email, create real tasks, create real accounts, accept UAT, accept
evidence, approve finance action, approve owner GO/NO-GO, run production
migration or mark production GO.

## 2. Master Goal

Build HEU as a safe, fast and low-cost operating system for school admission,
TTGDTX 9+, Finance Desk, controlled evidence, UAT routing and owner decision
support.

The goal is not only to write code. The goal is to make each department able to
use the software in a controlled way:

- BGH sees blockers, progress, users in trial and decisions that need authority.
- IT_DATA keeps PASS_LOCAL gates green and packages one clean slice at a time.
- KHTC uses Finance Desk in read-only controlled trial before any reliance.
- PHAP_CHE checks legal/SOP/finance gate blockers before signoff.
- Audit checks evidence references, redaction and traceability.
- Process owners run signed UAT outside Git/Codex/chat.

## 3. Continuous Build Goal When Local Machine Is Off

When the local machine is off, the current safe target is cloud PASS_LOCAL
verification, not autonomous coding.

| Goal | Current allowed path | Still blocked |
|---|---|---|
| Build verification when local machine is off | GitHub Actions PASS_LOCAL workflow runs audits/lint/build/report summaries | Production deploy, migration, real email sending, real task creation |
| Daily progress report | Dry-run report and email readiness output from P5-02 | Real email until HEU IT_DATA configures secrets/variables outside Git/Codex/chat |
| Continuous quality guard | Release-gate, current-state, implementation-log, Vietnamese text, lint and build checks | Auto-merge, auto-GO, auto-UAT, auto-finance approval |
| Future autonomous development | Requires a separate approved agent infrastructure, authority model, audit log and budget decision | AI writing independently without human review |

Decision: cloud can check and report. It must not self-approve or self-deploy.

## 4. Expert Team Build Goal

The target operating team is a controlled human-led team with AI/IT support
lanes, not an unsupervised AI workforce.

| Lane | Main job | Required output |
|---|---|---|
| Build Agent | Build one small PASS_LOCAL slice at a time | Clean diff, checks, commit proposal or commit when authorized |
| QA/Audit Agent | Find failed guards and regression risk | Plain defect list and rerun evidence |
| Data Check Agent | Guard data quality and sensitive-data boundaries | DQ gaps, source warnings, no raw PII/bank data |
| Finance Trial Support | Help KHTC use Finance Desk safely | Read-only trial guide, blocker list, escalation route |
| UAT/Evidence Coordinator | Route UAT and evidence to the right owner | Pending route report and external proof reminder |
| Report/Email Coordinator | Produce easy daily progress reports | Plain-language report, glossary, email readiness state |
| Human Authority Owner | Make real approvals outside Codex/chat | Signed UAT, evidence acceptance, finance decision or owner GO/NO-GO |

Decision: AI/IT can draft, check, warn and package. Human authority owners
remain responsible for UAT, evidence, finance and owner decisions.

## 5. Build Phases

| Phase | Target | PASS_LOCAL output | Human gate before reliance |
|---|---|---|---|
| A | Clean/package dirty scope | Clean worktree or grouped dirty scope | IT_DATA confirms no unrelated changes are overwritten |
| B | User / Role / Permission / Scope | P6-04, P0-17 and access-closure guards stay green | Signed multi-account role/scope UAT |
| C | Finance Day-1 controlled accounting trial | Finance Desk read-only trial support and Day-1 result ledger | KHTC + BGH signed browser UAT and reliance decision |
| D | Signed UAT / evidence / signoff routing | UAT route tracker, evidence checklist and owner-lane report | Required owners sign outside Git/Codex/chat |
| E | Remaining blockers | Plain-language NO-GO blocker list | Final owner GO/NO-GO outside Git/Codex/chat |

## 6. Required Reporting Style

Every daily or slice report must be understandable without IT knowledge. It must
show:

- What changed.
- Which department/user label uses it.
- How that user uses it.
- Which check passed or failed.
- What blocker remains.
- Which human owner must confirm the next step.
- Short explanations for IT words such as audit, lint, build, evidence, UAT,
  PASS_LOCAL and NO-GO.

## 7. Stop Conditions

Stop and return BLOCKED if any request asks Codex or an AI/IT lane to:

- Paste or store passwords, temporary passwords, OTPs, reset/invite links,
  service-role keys, SMTP credentials, raw PII, bank statements, vouchers or raw
  payment data.
- Create real accounts, send real invites, send real email or create real
  tickets/tasks without the approved external process.
- Execute UAT, accept evidence, approve finance reliance, post vouchers, move
  money, approve owner GO/NO-GO, run production migration or mark production GO.
- Continue after audit/lint/build fails.
- Mix dirty files from another slice into the current slice.

## 8. Current Result

MASTER_GOAL_READY is PASS_LOCAL_GOAL_CONTROL only. It means the master goals are
now written as controlled build targets and can be audited in the repo.

Production remains NO-GO. Continuous cloud checks, expert-team lanes and daily
reports are coordination controls only until the right human owners complete
signed UAT, controlled evidence, finance decisions, migration approval and final
owner GO/NO-GO outside Git/Codex/chat.
