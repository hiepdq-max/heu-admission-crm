# Draft PR Body - HEU App Shell 001

Suggested PR title:

```text
workflow: chuan hoa AppShell HEUWorkspaceContext va Data Confirmation shell
```

Suggested PR state: Draft.

Replacement branch note:

```text
Branch: codex/heu/app-shell-modular-monolith-review
Base: codex/heu/base-cc3985a
Reason: replace the older App Shell draft branch because its PR diff was too
broad for a small review slice.
```

## 1. Muc tieu

PR nay bo sung buoc nen cho kien truc HEU modular monolith:

- Mot app chinh HEU, khong tach moi module thanh app rieng.
- Nhieu module noi bo dung chung database va chung AppShell.
- `HEUWorkspaceContext` resolve role/workspace/scope truoc khi route xu ly.
- `/data-confirmation` la shell read-only/ref-only de lam Task Center sau nay.
- AI/automation khong duoc approve, khong duoc ghi du lieu that, khong production.

PR nay khong phe duyet UAT, production, finance action, migration, owner GO/NO-GO
hoac BGH signoff.

## 2. Phạm vi thay đổi

File tao moi:

- `lib/heu-workspace-context.ts`
- `app/data-confirmation/page.tsx`
- `scripts/check-heu-data-confirmation-task-center.mjs`
- `docs/HEU_CONTROL/HEU_APP_SHELL_001_MODULAR_MONOLITH_DECISION_20260709.md`
- `docs/HEU_CONTROL/HEU_USER_PILOT_001_REAL_USER_UAT_REGISTER_20260709.md`
- `docs/HEU_CONTROL/HEU_APP_SHELL_001_DRAFT_PR_HANDOFF_20260709.md`
- `docs/HEU_CONTROL/HEU_APP_SHELL_001_DRAFT_PR_BODY_20260709.md`
- `docs/HEU_CONTROL/HEU_APP_SHELL_001_REVIEW_CHECKLIST_20260709.md`
- `docs/HEU_CONTROL/HEU_APP_SHELL_001_STAGE_FILE_MANIFEST_20260709.md`

File sua chinh:

- `lib/workspace.ts`
- `components/layout/app-shell.tsx`
- `components/dashboard/dashboard-overview.tsx`
- `app/page.tsx`
- `app/leads/page.tsx`
- `app/leads/new/page.tsx`
- `app/import/page.tsx`
- `app/import/actions.ts`
- `app/reports/page.tsx`
- `app/cthssv/page.tsx`
- `package.json`

Scope note:

- Current-state, implementation-log and broad audit alignment files are not in
  this replacement PR because they create a wider review surface.
- If IT_DATA + Audit want those records updated, create a separate docs/audit
  PR after this AppShell slice is reviewed.

## 3. Noi dung da thay doi

- Them `HEUWorkspaceContext` wrapper quanh admission workspace context.
- Reuse role code trong `getAdmissionWorkspaceContext` de giam logic lap.
- Gan scope-first route behavior vao dashboard, leads, lead create, import,
  reports va CTHSSV.
- Chan create/import khi user khong co workspace/action gate phu hop.
- Them route `/data-confirmation` dang read-only/ref-only voi status contract:
  `CHO_XAC_NHAN`, `DUNG`, `CAN_SUA`, `KHONG_THUOC_TOI`, `DA_KHOA`.
- Them quick link `Viec cua toi` trong AppShell va dashboard landing.
- Them checker `check:heu-data-confirmation-task-center`.
- Ghi handoff, rollback, risk va Production NO-GO trong HEU_CONTROL.

## 4. Module HEU lien quan

- system
- admission
- cthssv
- dashboard
- audit

## 5. Rủi ro

- `/data-confirmation` co the bi hieu nham la Task Center that. Control:
  route va checker danh dau read-only/ref-only, khong query task-row va khong
  mutate du lieu.
- `HEUWorkspaceContext` la wrapper moi nen can IT_DATA + Audit review ky action
  gates va no-broad-fallback.
- CTHSSV route doi sang dedicated action gate, can Audit xac nhan khong mo rong
  quyen ngoai `handover.accept_cthssv`, ADMIN/BGH.
- Runtime lint/build da PASS_LOCAL sau khi tao local ignored `node_modules`
  junction trong isolated replacement worktree. Khong chay `npm install` hoac
  `npm ci` cho PR nay.
- Broad security gate van `NO_GO` khi chay `--broad-security` vi keo audit
  current-state docs ngoai scope 21 file cua PR nay.

Khong co:

- SQL migration.
- Supabase `db push`.
- Production deploy.
- Real-user grant.
- Secret/token/password.
- Raw PII/bank/voucher/evidence payload.
- Finance mutation/payment/COM/debt clearing.

## 6. Cách test

Da chay va PASS:

```powershell
node --check scripts/check-heu-app-shell-draft-pr-readiness.mjs
npm.cmd run check:heu-data-confirmation-task-center
npm.cmd run check:heu-app-shell-draft-pr-readiness
npm.cmd run check:heu-app-shell-draft-pr-readiness -- --runtime
npm.cmd run lint
npm.cmd run build -- --webpack
git diff --cached --check
```

Da chay va NO_GO do broad docs/audit ngoai scope:

```powershell
npm.cmd run check:heu-app-shell-draft-pr-readiness -- --broad-security
```

Runtime note:

```text
Runtime check used a local ignored node_modules junction to the main app root
dependency cache. No install, ci, migration or deploy was run. Before moving
this PR out of Draft, IT_DATA should rerun runtime lint/build in a normal
checkout or CI environment.
```

## 7. Rollback

Rollback bang cach revert PR.

Neu can rollback thu cong:

- Remove `app/data-confirmation/page.tsx`.
- Remove `lib/heu-workspace-context.ts`.
- Revert AppShell/dashboard quick links.
- Revert route imports/usages of `getHEUWorkspaceContext`.
- Remove `scripts/check-heu-data-confirmation-task-center.mjs`.
- Remove `check:heu-data-confirmation-task-center` from `package.json`.

No database rollback is required because this PR does not add migration or
write production data.

## 8. Evidence / bằng chứng

- `docs/HEU_CONTROL/HEU_APP_SHELL_001_DRAFT_PR_HANDOFF_20260709.md`
- `docs/HEU_CONTROL/HEU_APP_SHELL_001_REVIEW_CHECKLIST_20260709.md`
- `docs/HEU_CONTROL/HEU_APP_SHELL_001_STAGE_FILE_MANIFEST_20260709.md`
- `npm.cmd run check:heu-data-confirmation-task-center`: PASS_LOCAL
- `npm.cmd run check:heu-app-shell-draft-pr-readiness`: PASS_LOCAL
- `npm.cmd run check:heu-app-shell-draft-pr-readiness -- --runtime`: PASS_LOCAL
- `node --check scripts/check-heu-app-shell-draft-pr-readiness.mjs`: PASS
- `npm.cmd run lint`: PASS with 1 warning in unrelated script
- `npm.cmd run build -- --webpack`: PASS; route manifest includes
  `/data-confirmation`
- `git diff --cached --check`: PASS
- `npm.cmd run check:heu-app-shell-draft-pr-readiness -- --broad-security`:
  NO_GO; current-state docs/audit alignment is outside this 21-file PR scope
- Diff secret/PII scan: PASS_LOCAL
- Diff DB/config scope scan: PASS_LOCAL

## 9. Trang thai de xuat

`CAN_SUA`

PR phải để Draft cho IT_DATA + Audit review.

PR phai de Draft cho checker token compatibility.

Production remains `NO-GO`.
