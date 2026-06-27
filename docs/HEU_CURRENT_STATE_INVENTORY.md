# HEU Current State Inventory

Date: 2026-06-22  
Repository: heu-admission-crm  
Remote: https://github.com/hiepdq-max/heu-admission-crm.git  
Base branch: main  
Hardening branch: hardening/ttgdtx-9plus-pilot  
Latest known commit: 9d54348 Add TTGDTX tuition policy control  
Git state: dirty, có modified và untracked files  
Conclusion: D - Có thể test nội bộ, chưa production-ready

## 1. Repository Identity

| Item | Value |
|---|---|
| Repository | heu-admission-crm |
| Remote | https://github.com/hiepdq-max/heu-admission-crm.git |
| Base branch | main |
| Working branch | hardening/ttgdtx-9plus-pilot |
| Latest known commit | 9d54348 Add TTGDTX tuition policy control |
| Current status | Dirty working tree |
| Current production state | Not production-ready |

## 2. Technical Stack

| Layer | Current evidence |
|---|---|
| Frontend | Next.js 16, React 19, TypeScript |
| UI | Tailwind CSS v4, shadcn, Radix UI, lucide-react |
| Backend | Next.js App Router server actions/pages |
| Database | Supabase/PostgreSQL |
| Auth | Supabase Auth and CRM user/profile scope |
| ORM | Không thấy ORM chuyên biệt; đang dùng Supabase client/server actions |
| Deployment | Vercel-oriented Next.js project |
| Package manager | npm with package-lock.json |

## 3. Folder/File Inventory

### Main Folders

| Folder | Purpose |
|---|---|
| app | Next.js routes, pages and server actions |
| app/ttgdtx | TTGDTX 9+ pilot workflows and screens |
| components | Shared UI and domain components |
| components/leads | Lead detail and TTGDTX quick-fix components |
| database | SQL schema, step migrations and pilot patches |
| lib | Supabase, workspace, rules and shared helper logic |
| public | Static assets |
| docs | Documentation and hardening evidence |

### Main Config Files

| File | Purpose |
|---|---|
| package.json | Scripts and dependencies |
| package-lock.json | Locked npm dependency versions |
| next.config.ts | Next.js configuration |
| tsconfig.json | TypeScript configuration |
| eslint.config.mjs | ESLint configuration |
| postcss.config.mjs | PostCSS/Tailwind pipeline |
| components.json | shadcn component configuration |
| .gitignore | Git ignore rules |
| .env.local | Local secrets; must not be printed or committed |

### Main Documentation Files

| File | Note |
|---|---|
| README.md | Project overview if maintained |
| AGENTS.md | Agent/developer guidance if maintained |
| CLAUDE.md | Prior assistant/development guidance if maintained |
| docs/*.md | Hardening and audit documentation |

### Database/Schema Files

| Group | Evidence |
|---|---|
| Base schema | database/schema.sql |
| Supabase checks/admin | step files before P0/P1/P2 |
| Master Control | P0 step files |
| Short-course ERP | P1 step files |
| TTGDTX 9+ accounting | database/step90 through database/step110 |

## 4. HEU Module Mapping M01-M12

| Module | Scope | Current status | Evidence |
|---|---|---|---|
| M01 Legal | Legal registry, rules, gates | Partial | Legal/gate data exists, but formal legal source control still incomplete |
| M02 HR | User, roles, direct manager, scopes | Partial | User scope pages and role/profile flow exist |
| M03 Data Master | Admission programs, majors, TTGDTX master | Partial | Dynamic admission config and TTGDTX dropdown exist |
| M04 SOP/Workflow | Workflow/request engine, gates | Partial | P0/P1/P2 workflows and approval request patterns exist |
| M05 Tuyển sinh CRM | Leads, pipeline, follow-up, detail | Strong | Lead list/detail, scope filtering, P0-13 workspace |
| M06 CTHSSV | Student handover/profile readiness | Partial | Handover concepts and short student master exist |
| M07 Đào tạo | Class/program/course handling | Partial | Short-course/class primitives exist |
| M08 Khoa/Giảng viên | Faculty/teacher/class delivery | Partial | Not yet a strong production module |
| M09 Tài chính/Công nợ | Tuition, receivable, payment, reconciliation, payout | Strong | TTGDTX P2-01 to P2-18 pilot flow |
| M10 Dashboard | Reports, accounting dashboard | Partial | Dashboards exist but production verification incomplete |
| M11 AI Agent | AI support/risk assistant | Partial | AI policy exists; no autonomous approval allowed |
| M12 Audit/Risk | Audit log, issue routing, risk alerts | Strong | P2-07/P2-08 issue routing and audit/risk concepts |

## 5. Data Layer

| Data Area | Current evidence | Readiness |
|---|---|---|
| Lead/CRM | Leads, statuses, sources, workspace/segment | Internal test |
| Admission segment/program/major | Dynamic admission config and scoped workspace | Internal test |
| TTGDTX contract | P2-01 contract master | Internal test |
| TTGDTX tuition policy | P2-02 policy control | Internal test |
| TTGDTX real-data fit | Phu Xuyen K23/K24 source pack reviewed read-only | Design note added; no real-data import/go-live approved |
| TTGDTX receivable/debt | P2-03 receivables | Internal test |
| TTGDTX collection | P2-10 payment receipt/voucher flow | Internal test |
| TTGDTX reconciliation | P2-13/P2-14 batch approval/lock | Internal test |
| TTGDTX payment request | P2-15/P2-16 request and approval | Internal test |
| TTGDTX payout | P2-17 execution | Static hardening and duplicate-click UAT runbook added; signed UAT pending |
| Accounting dashboard | P2-18 dashboard | Static access guard added; authorized-user UAT evidence pending |
| Audit log | Exists across workflows | Static TTGDTX coverage audit passes; signed UAT pending |
| Approval log | Exists as approval/workflow request pattern | Needs production hardening |

### Required Data Questions

| Question | Current answer |
|---|---|
| Có STUDENT_MASTER không? | Có dấu vết student master/short student master; cần chuẩn hóa tên và scope |
| Có CLASS_MASTER không? | Có lớp/ngắn hạn; TTGDTX 9+ cần xác nhận class master riêng |
| Có PAYMENT/DEBT không? | Có TTGDTX receivable, collection, payment request and payout |
| Có AUDIT_LOG không? | Có audit concepts/actions, cần audit completeness |
| Có APPROVAL_LOG không? | Có approval request/decision gate patterns, cần chuẩn hóa |

## 6. Risk Findings

| Risk | Severity | Note |
|---|---|---|
| Dirty working tree | HIGH | Cần phân loại file trước commit/push |
| Untracked SQL migrations | HIGH | Step90-109 need approved migration order, backup, restore dry-run and idempotency evidence |
| Hard delete patterns | HIGH | Static hard-delete and TTGDTX cascade audits pass; non-TTGDTX/base cascade review still needs approval |
| Logs untracked | MEDIUM | dev-server logs không nên commit |
| P2-18 dashboard authorized UAT pending | HIGH | Route/build/static access guard pass; browser redirects to login without a signed-in test user |
| Real workbook/PDF/appendix complexity | HIGH | Synthetic real-like UAT pack added and audited; signed UAT still must prove multi-section workbook, bank receipt batch, BBNT, invoice and account-control behavior |
| Finance flow đã test một lần nhưng chưa có full automated tests | HIGH | VND money format audit passes; duplicate receivable/receipt/reconciliation/payout tests still need expansion |
| AI policy chưa được enforcement toàn hệ | MEDIUM | AI phải chỉ hỗ trợ, không phê duyệt |
| Permission scope cần test nhiều vai trò | HIGH | Cần test admin, kế toán, tuyển sinh, CTHSSV, đối tác |

## 7. Production Readiness Assessment

Current stage: D - Có thể test nội bộ.

Not production-ready because:

- Chua co migration order chinh thuc, backup evidence va restore dry-run sign-off.
- Chưa có test tự động cho luồng tài chính.
- Chua co production waiver/approval cho non-TTGDTX cascade va hard-delete residual risk.
- Chua co signed UAT cho P2-18 dashboard bang tai khoan duoc phan quyen.
- Chưa có checklist Go/No-Go được BGH/KHTC/Pháp chế/IT-Data duyệt.
- Chưa có bằng chứng backup trước migration.

## 8. Priority Fix List

1. Freeze TTGDTX 9+ scope and stop expansion outside pilot.
2. Clean Git state by reviewing modified/untracked files.
3. Approve migration order for step90-step110.
4. Execute backup/restore dry-run before any production migration.
5. Finish non-TTGDTX cascade and residual hard-delete approval.
6. Execute P2-18 UAT with authorized, out-of-scope and contract-only users.
7. Add tests for no duplicate receivable, no duplicate receipt, no duplicate reconciliation and no duplicate payout.
8. Execute `docs/TTGDTX_ROLE_SCOPE_UAT_RUNBOOK.md` by role and workspace.
9. Keep `npm.cmd run audit:vnd-money-format` green when adding new finance input forms.
10. Execute anonymized Phu-Xuyen-like UAT pack for multi-section workbook, bank receipt batch, K23 appendix and K24 support-fee formula.
11. Prepare internal pilot sign-off.

## 9. Current Conclusion

| Item | Conclusion |
|---|---|
| Current stage | D - Có thể test nội bộ |
| Production readiness | Not production-ready |
| Pilot scope | TTGDTX 9+ accounting end-to-end |
| Strong modules | M05, M09, M12 |
| Partial modules | M01, M02, M03, M04, M06, M07, M08, M10, M11 |
