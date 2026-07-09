# HEU Architecture Review Committee Criteria 2026-07-07

Task ID: HEU-ARCH-REVIEW-001-LAP-TO-PHAN-BIEN-VA-CRITERIA
Repository: heu-admission-crm
Branch: hardening/ttgdtx-9plus-pilot
HEAD at start: 246c206
Status: DRAFT_CONTROL
Executive direction: CHO_BGH_DUYET
Technical start state: CAN_SUA
Production status: NO-GO

## 1. Purpose

This document defines the HEU review committee, review criteria, and stop
rules before the team continues architecture or implementation work.

The operating decision is:

```text
Khong chay theo tinh nang moi.
Chi lam tung lat nho theo thu tu:
scope -> query guard -> task inbox -> read model -> search -> audit -> performance check.
```

This is a control document only. It does not approve production, UAT, legal
issuance, finance reliance, evidence acceptance, migration, permission
widening, owner GO/NO-GO, or official BGH approval.

## 2. Required Review Committee

| Review lane | Role | Must check | Can block? | Cannot do |
|---|---|---|---|---|
| Architecture | System architect / IT lead | Module boundary, no feature overflow, route/data ownership, dependency direction | Yes | Cannot approve production alone |
| IT_DATA | Data and platform owner | Scope-first query, indexes, read model, storage pressure, migration risk | Yes | Cannot run production migration without approval |
| PHAP_CHE_SOP | Legal/SOP owner | SOP basis, legal authority, evidence class, signoff path | Yes | Cannot let AI issue official SOP |
| AUDIT_KIEM_SOAT | Internal audit/control | Audit log, evidence ref, rollback, maker/checker/approver separation | Yes | Cannot approve business result |
| SECURITY_PRIVACY | Security/privacy reviewer | No secrets, no CCCD/phone/bank/raw evidence, access boundary | Yes | Cannot accept restricted data into Git/Codex/chat |
| MODULE_OWNER | Business owner per department | Workflow correctness, user workload, department fit | Yes for own module | Cannot approve other modules |
| PERFORMANCE_UX | Performance/UX reviewer | Fast access, small queries, pagination, no overflow, task-first UI | Yes for usability blockers | Cannot weaken audit or scope guard for speed |
| BGH_AUTHORITY | BGH / Hieu truong / delegated authority | Final institutional decision and official priority | Final approval only | Cannot bypass required evidence, backup, rollback or legal/SOP gate |

Minimum lanes for any next slice:

| Slice type | Required lanes before local work starts |
|---|---|
| Scope / permission | Architecture, IT_DATA, AUDIT_KIEM_SOAT, MODULE_OWNER |
| Query guard | Architecture, IT_DATA, SECURITY_PRIVACY, AUDIT_KIEM_SOAT |
| Task inbox | Architecture, MODULE_OWNER, PHAP_CHE_SOP, AUDIT_KIEM_SOAT |
| Read model | IT_DATA, AUDIT_KIEM_SOAT, PERFORMANCE_UX, MODULE_OWNER |
| Search | IT_DATA, SECURITY_PRIVACY, PERFORMANCE_UX, MODULE_OWNER |
| Audit | AUDIT_KIEM_SOAT, PHAP_CHE_SOP, IT_DATA, MODULE_OWNER |
| Performance check | PERFORMANCE_UX, IT_DATA, Architecture, AUDIT_KIEM_SOAT |

## 3. Mandatory Build Order

No feature work should bypass this order.

| Order | Gate | Output required before next gate | Stop if missing |
|---:|---|---|---|
| 1 | Scope | User role, org unit, workspace, segment, object ownership, allowed actions | No owner/scope contract |
| 2 | Query guard | Server-side helper or route guard proving every query is scope-first | Any broad query or client-side-only filter |
| 3 | Task inbox | Department task lane with status, owner, object ref, due/priority and no raw payload | Task stores raw sensitive data |
| 4 | Read model | Summary/view contract with source ref, staleness, refresh rule and rollback path | Dashboard reads raw large tables directly |
| 5 | Search | Metadata-only index with privacy allowlist and quick-open behavior | Search indexes CCCD, phone, bank, secrets or raw evidence |
| 6 | Audit | Actor, action, object ref, timestamp, reason, delta/ref/hash, retention rule | Action changes state without audit trail |
| 7 | Performance check | Page/query budget, pagination, smoke path, local evidence | Slow path not measured or cannot be reproduced |

## 4. Review Criteria Matrix

Each slice must be checked against all rows below. If any `Must pass` row fails,
the slice is `CAN_SUA` or `NO_GO`, not `DAT_TAM_THOI`.

| Criteria ID | Area | Must pass | Evidence to inspect | Owner lane |
|---|---|---|---|---|
| ARC-01 | Scope boundary | One small slice only; no mixed docs/scripts/SQL/app/config unless explicitly justified | `git status --short --branch`, diff list, PR split register | Architecture + Audit |
| ARC-02 | Module boundary | Module owner and department lane are named | Backlog/gap matrix/register row | MODULE_OWNER |
| ARC-03 | Query guard | Data access is filtered before fetch by user/workspace/role/scope | Server action/query helper/code path | IT_DATA |
| ARC-04 | Privacy | No raw restricted data enters Git/Codex/chat/log/search | Diff, fixtures, docs, generated files | SECURITY_PRIVACY |
| ARC-05 | Task center | Work item stores only state, owner, object ref, due/priority, not full business payload | Task schema/spec/UI contract | MODULE_OWNER + Audit |
| ARC-06 | Read model | Summary data has source ref and refresh/staleness rule | View/read-model doc or SQL review | IT_DATA |
| ARC-07 | Search | Search is metadata-only and role/scope aware | Search route, index contract, privacy allowlist | IT_DATA + SECURITY_PRIVACY |
| ARC-08 | Audit | State-changing path has audit log or explicit no-write proof | Server action/RPC/runbook | AUDIT_KIEM_SOAT |
| ARC-09 | Rollback | Rollback path is named before data/schema/rule changes | Rollback note, migration order, revert path | IT_DATA + Audit |
| ARC-10 | Performance | Page has pagination, bounded query, no full table scan, no uncontrolled dashboard aggregation | Query plan/review note/smoke evidence | PERFORMANCE_UX |
| ARC-11 | AI boundary | AI is advisory-only and cannot approve/pay/migrate/send/grant access | AI policy/control note | PHAP_CHE_SOP + Audit |
| ARC-12 | Decision authority | BGH/authorized owner approval is separated from local technical result | SOP result record, signoff path | BGH_AUTHORITY |

## 5. Department Fast-Access Rules

Every department screen should be designed around "see my work first".

| Department | First screen should show | Must not show by default |
|---|---|---|
| TUYEN_SINH | Leads/tasks in assigned workspace, next follow-up, handover blockers | All leads outside scope |
| CTHSSV | Received handover tasks, missing evidence refs, student service status | Raw lead imports or finance-only data |
| DAO_TAO_KHOA | Class/cohort work queue, teacher/course evidence refs, readiness blockers | Finance/payment details outside need-to-know |
| KHTC_FINANCE | Receivable/payment/reconciliation tasks with source refs and lock state | Raw student personal data beyond finance need |
| PHAP_CHE | SOP/legal/evidence-class review tasks and missing authority decisions | Operational data dumps |
| BGH | Read-only summary, blockers, owner decisions needed, production NO-GO state | Editable transaction forms |
| AUDIT_IT_DATA | Scope, audit, performance, evidence-ref and rollback queues | Business approval buttons |

## 6. Storage And Speed Principles

| Need | Correct design | Forbidden shortcut |
|---|---|---|
| Fast dashboard | Store counts/status summaries with source refs and staleness timestamp | Copy full student/lead/payment records into dashboard tables |
| Fast search | Store allowed metadata and object refs only | Index CCCD, phone, bank, raw evidence, token or password |
| Fast task inbox | Store task state and object ref | Duplicate the full underlying record in every task |
| Fast audit | Store compact event, delta/ref/hash and evidence ref | Store complete raw payload snapshots with sensitive data |
| Fast user access | Resolve workspace context once, reuse server-side | Let each page re-discover global scope with broad queries |
| Fast review | One slice, one gate, focused checker | Run broad build/audit while scope is mixed and dirty |

## 7. Decision Values

| Decision | Meaning |
|---|---|
| CHUA_KIEM | Not reviewed or evidence not inspected |
| DANG_KIEM | Review in progress |
| CAN_SUA | Direction is acceptable but needs implementation or correction |
| DAT_TAM_THOI | Local control artifact/check passes with evidence; not official approval |
| CHO_BGH_DUYET | Technically ready enough for authority review or executive direction decision |
| DAT_CHINH_THUC | Only after BGH/Hieu truong/authorized owner signs off |

For this task:

| Level | Current conclusion |
|---|---|
| Executive direction | CHO_BGH_DUYET |
| Technical next step | CAN_SUA |
| Production | NO-GO |
| Local docs/control artifact | DAT_TAM_THOI only after file/diff verification |

## 8. Review Packet Template

Each future slice must prepare this packet before code/data work:

```text
TASK_ID:
Slice order gate: scope / query guard / task inbox / read model / search / audit / performance check
Module:
Owner lane:
Files expected:
Data touched:
Restricted data risk:
Query guard:
Task/ref model:
Audit path:
Rollback path:
Focused command:
BGH/owner decision required:
Conclusion allowed: CHUA_KIEM / DANG_KIEM / CAN_SUA / DAT_TAM_THOI / CHO_BGH_DUYET
Forbidden conclusion:
```

## 9. Stop Rules

Stop and report `NO_GO` or `BLOCKED` if:

- The slice tries to add a new feature before scope and query guard are defined.
- The slice mixes app, SQL, scripts, config and docs without a PR split.
- The slice needs raw student, phone, CCCD, bank, payment, secret or evidence data.
- A dashboard/search/task inbox would copy full business records instead of refs/summaries.
- A write path lacks audit log, rollback, role/workspace scope or owner boundary.
- A local result is worded like UAT, finance reliance, legal issuance, owner GO or production GO.
- BGH/authorized owner signoff is required but missing.

## 10. SOP Slice Result Record

SOP-SCOPE:
- `HEU-ARCH-REVIEW-001` creates one architecture review committee criteria
  document under `docs/HEU_CONTROL`.
- It locks the order: scope -> query guard -> task inbox -> read model ->
  search -> audit -> performance check.
- It does not change app, component, script, SQL, config, runtime, data or
  production behavior.

SOP-CHECK:
- Live worktree is mixed and dirty.
- No previous `HEU-ARCH-REVIEW-001` artifact was found before creation.
- Required control sources checked: `docs/HEU_CONTROL/README.md`,
  `docs/HEU_CONTROL/HEU_SYSTEM_BUILD_HANDBOOK_20260707.md`,
  `docs/HEU_CONTROL/PR_SPLIT_REGISTER_20260707.md`,
  `docs/HEU_CODEX_OPERATING_PLAYBOOK.md`,
  `docs/HEU_CURRENT_STATE_INVENTORY.md`,
  `docs/HEU_SYSTEM_BUILD_BACKLOG.md`,
  `docs/HEU_MODULE_READINESS_GAP_MATRIX_20260628_V01_DRAFT.md`,
  `docs/HEU_IMPLEMENTATION_LOG.md`.

SOP-PROFESSIONAL:
- Owner lanes are Architecture, IT_DATA, PHAP_CHE_SOP, AUDIT_KIEM_SOAT,
  SECURITY_PRIVACY, MODULE_OWNER, PERFORMANCE_UX and BGH_AUTHORITY.
- Result: DRAFT_CONTROL until each lane confirms its own criteria.

SOP-LEGAL:
- PHAP_CHE_SOP keeps legal/SOP authority.
- This document is not official SOP issuance and does not waive any legal,
  evidence, UAT, finance or production gate.

SOP-LOGIC:
- The recommended architecture favors scope-first queries, metadata-only
  search, task refs, summary read models and compact audit events to keep HEU
  fast without duplicating sensitive data.

SOP-VERIFY:
- Docs-only verification expected: file existence, section search and
  `git diff --check -- docs/HEU_CONTROL`.
- No `npm.cmd`, migration, deploy, install, commit or push is required for
  this docs-only control slice.

SOP-RESULT:
- `DAT_TAM_THOI` only for local control criteria after verification.
- Executive direction remains `CHO_BGH_DUYET`.
- Technical work may start at `CAN_SUA`.
- Production remains `NO-GO`.

SOP-NEXT:
- Next technical slice should be
  `HEU-PERF-001-WORKSPACE-CONTEXT-AND-SCOPE-FIRST-QUERY` only after this
  review committee criteria is accepted for use.
