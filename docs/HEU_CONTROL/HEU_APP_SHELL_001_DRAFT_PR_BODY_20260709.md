# Draft PR Body - HEU App Shell 001

Suggested PR title:

```text
workflow: bo sung HEU App Shell va Data Confirmation shell
```

Suggested PR state: Draft.

## 1. Mục tiêu

PR này bổ sung bước nền cho kiến trúc Modular Monolith / HEU App Shell:

- Dùng một app chính HEU.
- Giữ nhiều module nội bộ.
- Chuẩn hóa `HEUWorkspaceContext` để route resolve role/scope trước khi xử lý dữ liệu.
- Thêm lối vào `Viec cua toi / Data Confirmation` dạng read-only/ref-only.
- Chuẩn hóa gate local để IT_DATA + Audit review trước khi mở task data thật.

PR này không phê duyệt production, UAT, finance action, migration, owner
GO/NO-GO hoặc BGH signoff.

## 2. Phạm vi thay đổi

File tạo mới:

- `lib/heu-workspace-context.ts`
- `app/data-confirmation/page.tsx`
- `scripts/check-heu-data-confirmation-task-center.mjs`
- `docs/HEU_CONTROL/HEU_APP_SHELL_001_MODULAR_MONOLITH_DECISION_20260709.md`
- `docs/HEU_CONTROL/HEU_USER_PILOT_001_REAL_USER_UAT_REGISTER_20260709.md`
- `docs/HEU_CONTROL/HEU_APP_SHELL_001_DRAFT_PR_HANDOFF_20260709.md`
- `docs/HEU_CONTROL/HEU_APP_SHELL_001_DRAFT_PR_BODY_20260709.md`
- `docs/HEU_CONTROL/HEU_APP_SHELL_001_REVIEW_CHECKLIST_20260709.md`
- `docs/HEU_CONTROL/HEU_APP_SHELL_001_STAGE_FILE_MANIFEST_20260709.md`

File sửa chính:

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

File control/audit alignment:

- `docs/HEU_CURRENT_STATE_INVENTORY.md`
- `docs/HEU_IMPLEMENTATION_LOG.md`
- `docs/HEU_MODULE_READINESS_GAP_MATRIX_20260628_V01_DRAFT.md`
- `docs/HEU_SYSTEM_BUILD_BACKLOG.md`
- `docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md`
- `scripts/audit-heu-cthssv-module-readiness.mjs`
- `scripts/audit-heu-implementation-log.mjs`
- `scripts/audit-heu-lead-lifecycle-handover-uat-pack.mjs`
- `scripts/audit-ttgdtx-release-gates.mjs`

## 3. Nội dung đã thay đổi

- Thêm `HEUWorkspaceContext` wrapper quanh admission workspace context.
- Reuse role code trong `getAdmissionWorkspaceContext` để giảm RPC lặp.
- Gắn scope-first route behavior vào dashboard, leads, lead create, import,
  reports và CTHSSV.
- Chặn create/import khi user không có workspace/action gate phù hợp.
- Thêm route `/data-confirmation` dạng read-only/ref-only, có status chuẩn:
  `CHO_XAC_NHAN`, `DUNG`, `CAN_SUA`, `KHONG_THUOC_TOI`, `DA_KHOA`.
- Thêm quick link `Viec cua toi` trong App Shell và dashboard landing.
- Thêm checker `check:heu-data-confirmation-task-center`.
- Ghi rõ handoff, rollback, risk và Production NO-GO trong HEU_CONTROL.

## 4. Module HEU liên quan

- system
- admission
- cthssv
- dashboard
- audit

## 5. Rủi ro

- Route `/data-confirmation` có thể bị hiểu nhầm là Task Center thật. Control:
  route và checker đánh dấu read-only/ref-only, không query task-row và không
  mutate dữ liệu.
- `HEUWorkspaceContext` là wrapper mới nên cần IT_DATA + Audit review kỹ phần
  action gates.
- CTHSSV route đổi sang dedicated action gate, cần Audit xác nhận không mở
  rộng quyền ngoài `handover.accept_cthssv`, ADMIN/BGH.
- Build mặc định Turbopack không dùng làm evidence trong worktree này vì
  `node_modules` là ignored junction trỏ ngoài root; Webpack build đã PASS.

Không có:

- SQL migration.
- Supabase `db push`.
- Production deploy.
- Real-user grant.
- Secret/token/password.
- Raw PII/bank/voucher/evidence payload.
- Finance mutation/payment/COM/debt clearing.

## 6. Cách test

Đã chạy:

```powershell
npm.cmd run check:heu-data-confirmation-task-center
npm.cmd run check:heu-app-shell-draft-pr-readiness
npm.cmd run check:heu-app-shell-draft-pr-readiness -- --runtime
npm.cmd run lint
npm.cmd run build -- --webpack
npm.cmd run audit:ttgdtx-release-gates
npm.cmd run audit:heu-user-account-security
npm.cmd run audit:heu-role-scope-uat-pack
npm.cmd run audit:ttgdtx-role-scope-access
npm.cmd run check:heu-user-scope-baseline-repair-queue -- --static-only
npm.cmd run audit:heu-current-state-inventory
npm.cmd run audit:heu-vietnamese-text-encoding
npm.cmd run check:heu-fast-local-loop
npm.cmd run check:heu-fast-local-loop -- --security
npm.cmd run audit:heu-implementation-log
git diff --check
```

Build note:

```text
npm.cmd run build -- --webpack used build-only dummy public Supabase env values.
No secret was used. Route manifest includes /data-confirmation.
```

## 7. Rollback

Rollback bằng cách revert PR.

Nếu cần rollback thủ công:

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
- `npm.cmd run lint`: PASS
- `npm.cmd run build -- --webpack`: PASS
- `npm.cmd run check:heu-fast-local-loop -- --security`: PASS_LOCAL
- Diff secret/PII scan: PASS_LOCAL
- Diff DB/config scope scan: PASS_LOCAL

## 9. Trạng thái đề xuất

`DAT_TAM_THOI`

PR phải để Draft cho IT_DATA + Audit review.

Production remains `NO-GO`.
