# HEU Codex Resume Inventory 20260626

Mode: safe resume inventory. No production migration was run. No deploy was run.

## 1. Repo

| Item | Value |
|---|---|
| Workspace | `D:\Web app HEU\heu-admission-crm` |
| Repository | `heu-admission-crm` |
| Branch | `hardening/ttgdtx-9plus-pilot` |
| Current commit | `ed3165e` |
| Package manager | npm, `package-lock.json` present |
| Framework | Next.js 16 App Router, React 19, TypeScript, Supabase |
| Runtime note | Use `npm.cmd` on this Windows shell |

## 2. Safety Position

- Current branch is not `main` or `master`.
- Working tree is dirty and must not be force-cleaned.
- Existing user/Codex work must not be reverted.
- Production migration is not approved in this inventory.
- Real student, bank, account, contract-sensitive or PII data must not be committed.
- TTGDTX Phu Xuyen evidence is treated as real-world reference only, not as hard-coded product logic.

## 3. Modified/Untracked Scope

### Modified tracked areas

- `AGENTS.md`
- Shared CRM/action files under `app/leads`, `app/hou`, `app/settings`
- Existing TTGDTX pages: `app/ttgdtx/page.tsx`, `app/ttgdtx/tuition/page.tsx`
- Shared lead component: `components/leads/lead-detail.tsx`
- Hardening and audit docs under `docs`
- `package.json`

### Untracked areas

- TTGDTX app routes:
  - `app/ttgdtx/accounting-dashboard`
  - `app/ttgdtx/gate`
  - `app/ttgdtx/import`
  - `app/ttgdtx/master`
  - `app/ttgdtx/payment-requests`
  - `app/ttgdtx/payments`
  - `app/ttgdtx/receivables`
  - `app/ttgdtx/reconciliation`
  - `app/ttgdtx/simulation`
  - `app/ttgdtx/source-control`
- TTGDTX SQL candidates: `database/step90` through `database/step110`
- TTGDTX runbooks and evidence-control docs under `docs`
- Audit scripts under `scripts`

## 4. Existing App Modules

| Module | Evidence | Current posture |
|---|---|---|
| CRM/Tuyen sinh | `app/leads`, `app/pipeline`, `app/campaigns`, `components/leads` | Active shared module; review before TTGDTX-specific changes |
| TTGDTX/9+ | `app/ttgdtx`, `database/step88-step110` | Main pilot focus; internal-test posture |
| Finance/receivable | TTGDTX receivables, collection, reconciliation, payment request, payout routes | High-risk; needs signed UAT and no-duplicate tests |
| Master/control | `app/master-control`, `app/settings`, `database/step41-step61` | Existing governance base |
| Short course | `app/short-course`, `database/step62-step87` | Separate module; do not mix with TTGDTX migration chain |
| Audit/risk | `app/audit`, audit scripts, TTGDTX issue routing | Static audits pass locally; production sign-off pending |

## 5. Missing/Weak Modules

| Area | Gap |
|---|---|
| Formal HEU data model | Needs a system-level V1 data model across CRM, TTGDTX, student/class, finance, audit |
| Data dictionary | Needs shared naming and status lifecycle standard |
| Role-permission matrix | Needs role/action/data-scope matrix for HEU departments |
| Production migration governance | Needs backup/restore evidence and human Go/No-Go |
| UAT evidence | Needs signed role-based UAT, especially finance and dashboard |
| Anonymized real-like test pack | Needed before testing Phu-Xuyen-like source complexity |

## 6. Current Risks

- Dirty working tree is large; commits must be split by scope.
- SQL Step90-Step110 contains finance-critical behavior and must not be applied to production without backup and approval.
- Step110 was recently adjusted to avoid `ON CONFLICT (check_code)` on `ttgdtx_source_control_checks`; Supabase production result still needs user-side confirmation.
- Shared CRM files may affect non-TTGDTX workflows.
- Phu Xuyen examples must stay metadata/reference only and not become hard-coded operating logic.

## 7. Recommended Next Work

1. Keep the scope frozen around TTGDTX/9+ Pilot.
2. Create/update system backlog, tech risk register and implementation log.
3. Define HEU data model V1, data dictionary V1 and role-permission matrix V1 before expanding automation.
4. Treat TTGDTX Phu Xuyen as a test lens for generic center/partner workflows.
5. Next small build target: normalize TTGDTX source-control wording and docs so source packs are generic, with Phu Xuyen as a reference case only.

