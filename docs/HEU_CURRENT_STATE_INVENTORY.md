# HEU Current State Inventory

Date: 2026-06-27
Repository: heu-admission-crm
Remote: https://github.com/hiepdq-max/heu-admission-crm.git
Working branch: hardening/ttgdtx-9plus-pilot
Git state: clean local worktree at last verified handoff; exact ahead count and
current commit are live Git state and must be read with `git status --short
--branch` and `git rev-parse --short HEAD`.
Conclusion: Stage D - internal controlled test only. Production remains NO-GO.

## 1. Repository Identity

| Item | Value |
|---|---|
| Repository | heu-admission-crm |
| Remote | https://github.com/hiepdq-max/heu-admission-crm.git |
| Base branch | main |
| Working branch | hardening/ttgdtx-9plus-pilot |
| Current commit | Live state; run `git rev-parse --short HEAD` |
| Current status | Clean local worktree at last verified handoff |
| Current production state | NO-GO |

## 2. Technical Stack

| Layer | Current evidence |
|---|---|
| Frontend | Next.js 16, React 19, TypeScript |
| UI | Tailwind CSS v4, shadcn/Radix patterns, lucide-react |
| Backend | Next.js App Router, server pages/actions |
| Database | Supabase/PostgreSQL |
| Auth | Supabase Auth with HEU role and workspace scope checks |
| Package manager | npm with package-lock.json |
| Local command rule | Use `npm.cmd` on Windows |

## 3. Current Build And Audit Evidence

| Evidence | Current status |
|---|---|
| `npm.cmd run build` | PASS at last verification |
| `npm.cmd run lint` | PASS at last verification |
| `npm.cmd run audit:ttgdtx-release-gates` | PASS |
| `npm.cmd run audit:heu-git-hygiene` | PASS |
| `npm.cmd run audit:heu-lead-lifecycle-standard` | PASS |
| `npm.cmd run audit:ttgdtx-contract-tuition-master-guard` | PASS |
| `npm.cmd run audit:heu-vietnamese-text-encoding` | PASS |
| `npm.cmd run audit:heu-production-blocker-source` | PASS |
| `npm.cmd run audit:heu-production-evidence-binder` | PASS |
| `npm.cmd run audit:heu-final-handoff-coverage` | PASS |
| `npm.cmd run audit:hard-delete-conversion-decision-queue` | PASS |
| `npm.cmd run audit:ttgdtx-payout-execution-readiness` | PASS |
| `npm.cmd run audit:ttgdtx-dashboard-source-reconciliation` | PASS |
| Full `audit:*` suite | PASS after the P6-06 hard-delete decision queue full sweep; 53 audit scripts passed |

Passing local checks proves only local packaging quality. It does not approve
production, production migration, UAT acceptance, finance action or owner GO.

## 4. HEU Module Mapping M01-M12

| Module | Scope | Current status | Evidence |
|---|---|---|---|
| M01 Legal | Legal registry, rules, gates | Partial | P0-19 legal/finance gate and acceptance matrix are packaged; signed UAT still required |
| M02 HR | Users, roles, managers, scopes | Partial | Role/scope pages and P6-04 UAT pack exist |
| M03 Data Master | Admission programs, majors, TTGDTX master | Partial | Master/dropdown controls exist; signed UAT still required |
| M04 SOP/Workflow | Workflow/request engine, gates | Partial | Master Control workflow and approval patterns exist |
| M05 Tuyen sinh CRM | Leads, pipeline, follow-up, detail | Strong internal | P3-01 lifecycle guard, P3-01 acceptance matrix, P3-02 handover policy and P3-02 acceptance matrix exist; handover remains finance-gated |
| M06 CTHSSV | Student handover/profile readiness | Partial | Handover policy and P3-02 acceptance matrix exist; production UAT pending |
| M07 Dao tao | Class/program/course handling | Partial | Short-course/class primitives exist |
| M08 Khoa/Giang vien | Faculty/teacher/class delivery | Early | Not yet a strong production module |
| M09 Tai chinh/Cong no | Tuition, receivable, reconciliation, payout | Strong internal | TTGDTX P2-01/P2-02 master guard and P2-03 through P2-18 pilot flow are packaged; signed finance/legal UAT still required |
| M10 Dashboard | Reports, accounting dashboard, BGH view | Partial | P2-18 read-only guard, source reconciliation, dashboard acceptance matrix and P5-02 are read-only and UAT-gated |
| M11 AI Agent | Advisory/checklist/risk assistant | Advisory only | P7-01/P7-02/P7-03 are PASS_LOCAL; autonomous AI remains locked |
| M12 Audit/Risk | Audit log, issue routing, risk alerts | Strong internal | P6 audit guards and hard-delete/cascade reviews pass locally |

## 5. TTGDTX 9+ Current Control State

| Area | Current evidence | Readiness |
|---|---|---|
| Production readiness guard | TTGDTX landing guard, execution queue, owner GO/NO-GO checklist | PASS_LOCAL, NO-GO |
| Backup/restore | Evidence pack, UI guard and restore smoke-check acceptance matrix exist | Template ready; real backup/restore evidence missing |
| Migration order | Step90-Step110 guard and audit exist | Signed approval still required |
| Legal/finance gate | P0-19 guard, UAT checklist and acceptance matrix exist | Signed legal/finance UAT still required |
| Contract/tuition master | P2-01/P2-02 master guard exists | PASS_LOCAL; signed legal/finance/KHTC UAT pending |
| Lead lifecycle/handover | P3-01 lifecycle standard, P3-01 acceptance matrix, P3-02 handover policy and P3-02 acceptance matrix exist | PASS_LOCAL; signed role/workflow UAT pending |
| Receivable/collection/reconciliation | P2-03, P2-10, P2-13, P2-14 packaged | Local controls pass; signed finance UAT pending |
| Partner payment/payout | P2-15, P2-16, P2-17 packaged with dossier, duplicate, execution-readiness guards and payout acceptance matrix | Signed payout UAT pending |
| Accounting dashboard | P2-18 read-only guard, source reconciliation checklist, UAT checklist and dashboard acceptance matrix exist | Signed browser UAT pending |
| Role/workspace scope | P6-04 pack, scope UI guard, evidence checklist, route matrix and acceptance matrix exist | Multi-account signed UAT pending |
| Audit log | Static coverage and audit trace acceptance matrix pass locally | Signed audit-log UAT pending |
| Hard-delete/cascade | TTGDTX cascade passes; non-TTGDTX review identifies 44 findings and exposes a conversion/waiver decision queue | Conversion or written waiver pending |
| Controlled evidence | Redaction/intake pack and audit guard exist | Real evidence must stay outside Git/Codex/chat |
| AI helper layer | Task checklist and risk board are read-only | Advisory only; no autonomous approval |

## 6. Risk Findings

| Risk | Severity | Current status |
|---|---|---|
| Git hygiene drift | MEDIUM | P0-02/P0-04 are PASS_LOCAL; keep `audit:heu-git-hygiene` green and verify exact ahead count live |
| Production backup/restore not executed | CRITICAL | Real backup ID, restore target and smoke-check evidence are still missing |
| Migration order unsigned | CRITICAL | Step90-Step110 approval must be signed by IT_DATA, KHTC and PHAP_CHE |
| Signed UAT missing | CRITICAL | P3-01/P3-02, P0-19, P2-17, P2-18, P6-03 and P6-04 still require signed evidence |
| Hard-delete/cascade residual risk | HIGH | Non-TTGDTX/base cascade findings need conversion or written waiver |
| Real evidence/privacy exposure | HIGH | Raw PII, bank data, passwords, keys and vouchers must stay outside Git/Codex/chat |
| AI misuse | MEDIUM | AI remains advisory-only; prompt/output logging and role-scoped AI data are not enabled |

## 7. Production Readiness Assessment

Current stage: Stage D - internal controlled test only.

Production is still NO-GO because:

- No real production backup/restore dry-run evidence has been attached.
- Step90-Step110 production migration order is not signed.
- P0-19 legal/finance UAT is not signed.
- P2-17 duplicate payout UAT is not signed.
- P2-18 dashboard browser UAT is not signed.
- P6-03 audit-log UAT and P6-04 role/workspace UAT are not signed.
- Non-TTGDTX/base cascade findings still need conversion or written waiver.
- Final BGH/IT_DATA/KHTC/PHAP_CHE/Audit/owner GO/NO-GO is not signed.

## 8. Priority Fix List

1. Execute backup/restore dry-run and attach controlled evidence outside Git.
2. Sign Step90-Step110 migration order after backup/restore evidence is accepted.
3. Execute P0-19 legal/finance UAT and sign results.
4. Execute P3-01/P3-02 lead lifecycle and handover UAT with scoped users.
5. Execute P2-17 duplicate payout UAT and sign results.
6. Execute P2-18 dashboard UAT with authorized, out-of-scope and contract-only users.
7. Execute P6-04 role/workspace UAT and P6-03 audit-log UAT.
8. Convert or waive remaining non-TTGDTX/base hard-delete/cascade findings.
9. Keep `npm.cmd run audit:ttgdtx-release-gates`, `npm.cmd run build` and
   `npm.cmd run lint` green before owner review.
10. Record final owner GO/NO-GO outside Codex/chat.

## 9. Current Conclusion

| Item | Conclusion |
|---|---|
| Current stage | Stage D - internal controlled test only |
| Production readiness | NO-GO |
| Pilot scope | TTGDTX 9+ accounting end-to-end |
| Strong internal modules | M05, M09, M12 |
| Most important blockers | Backup/restore evidence, signed UAT, migration order, hard-delete/cascade waiver and owner GO/NO-GO |
