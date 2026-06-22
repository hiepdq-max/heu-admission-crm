# G2 TTGDTX Source Review - 2026-06-22

## 1. Review Summary

| Item | Result |
|---|---|
| Branch | hardening/ttgdtx-9plus-pilot |
| G2 status | G2_NEEDS_FIX |
| Migration allowed | NO |
| Real data allowed | NO |
| Commit G2 now | REVIEW |
| Main reason | G2 dung huong nhung con SQL pilot/DAT_TAM_THOI, thieu rollback, can test RLS/quyen va tach commit ro hon |

## 2. Business Scope

| File | P2 step | Finding |
|---|---|---|
| app/ttgdtx/page.tsx | P2-01 | Contract master TTGDTX. Co link sang P2-02/P2-03/P2-10 nhung chu yeu dieu huong, chua thay ghi du lieu |
| app/ttgdtx/tuition/page.tsx | P2-02 | Hoc phi/cong no chinh sach. Co yeu to tai chinh nen risk cao hon |
| app/ttgdtx/master/page.tsx | P2-12 | Master dropdown TTGDTX, dung G2 |
| app/ttgdtx/source-control/page.tsx | P2-11 | Kiem soat nguon/master, dung G2 |
| app/ttgdtx/gate/page.tsx | P2-05 | Gate truoc P2-03. Co nhac/sang P2-03 nhung chua thay tao cong no truc tiep trong G2 |
| app/ttgdtx/simulation/page.tsx | P2-04 | Mo phong, dung G2 |

Conclusion:
Khong thay lan nghiep vu P2-10/P2-13/P2-14/P2-15/P2-16/P2-17/P2-18 o muc ghi du lieu. Tuy nhien co dieu huong/nhan sang buoc sau, nen commit van phai tach nhom.

## 3. SQL Safety

| SQL | Main impact | DROP/DELETE/TRUNCATE | RLS/Policy | DAT_TAM_THOI | Rollback | Review conclusion |
|---|---|---:|---:|---:|---:|---|
| step91_ttgdtx_receivable_gate_p2_05.sql | Dang ky P2-05 vao workflow/permission/map | No | No | Yes | No | REVIEW |
| step97_ttgdtx_p0_19_finance_gate_fix.sql | Function/view gate tai chinh P0-19/P2-05 | No | No | Low/unclear | No | REVIEW |
| step98_ttgdtx_source_control_p2_11.sql | Tao source control tables/views/functions/RLS | drop policy if exists | Yes | Yes | No | REVIEW |
| step99_ttgdtx_master_dropdown_p2_12.sql | Tao TTGDTX center master/dropdown/RLS | drop policy if exists | Yes | Yes | No | REVIEW |
| step100_ttgdtx_pilot_open_p2_01_p2_02_p0_19.sql | Mo pilot P2-01/P2-02/P0-19, update contract/tuition/gate | No | No | Yes | No | HIGH REVIEW |

Note:
`drop policy if exists` khong xoa du lieu nhung thay doi quyen, can backup/approval.

## 4. Permission and RLS

Findings:
- Co kiem tra dang nhap qua redirect `/login`.
- step98/99 co RLS va function can_read/can_manage/can_approve.
- Can test user admin, user dung scope, user sai scope.
- Permission/RLS conclusion: REVIEW, chua du production.

Required test users:
- admin
- finance
- ttgdtx_manager
- admission
- viewer
- out_of_scope_user

## 5. Audit Log

Findings:
- Page G2 chu yeu doc du lieu.
- Chua thay insert/update/delete truc tiep trong page G2.
- step100 co cap nhat trang thai pilot/finance/contract nen can phe duyet va audit ro truoc production.

Audit conclusion:
- G2a read-only pages: REVIEW
- G2b SQL source/master/gate: REVIEW
- G2c step100 pilot-open: APPROVAL_REQUIRED

## 6. Data Dependency

| Dependency | Purpose |
|---|---|
| step88 | TTGDTX contract master nen |
| step89 | TTGDTX tuition policy/control nen |
| step91 | P2-05 receivable gate |
| step97 | P0-19 finance gate fix |
| step98 | Source control P2-11 |
| step99 | Master dropdown P2-12 |
| step100 | Pilot open P2-01/P2-02/P0-19 |

Conclusion:
Chua thay phu thuoc bat buoc vao step101+. P2-05 la cong truoc P2-03, khong commit lan P2-03 tro di trong G2.

## 7. Hard Delete Check

| Pattern | Result |
|---|---|
| .delete() | Not found in G2 |
| delete from | Not found |
| truncate | Not found |
| drop table | Not found |
| drop function | Not found |
| on delete cascade | Not found |
| drop policy if exists | Found in step98/99 |

Conclusion:
Khong thay hard delete du lieu nghiep vu trong G2. Tuy nhien `drop policy if exists` la thay doi quyen, can approval va test RLS.

## 8. UI/UX Risk

Findings:
- Co empty/error state va nhan pilot/tam thoi tuong doi ro.
- Rui ro chinh la page finance/tuition co so tien va trang thai hop dong.
- Can gioi han quyen that.
- Nut/dieu huong sang buoc sau duoc giu nhung khong commit cung nghiep vu sau neu chua test.

## 9. Commit Readiness

| File | Risk | Safe to commit source | Reason |
|---|---:|---:|---|
| app/ttgdtx/page.tsx | MEDIUM | REVIEW | Dung P2-01 nhung can test scope/quyen |
| app/ttgdtx/tuition/page.tsx | HIGH | REVIEW | Du lieu tai chinh, phu thuoc step89/97/100 |
| app/ttgdtx/master/page.tsx | MEDIUM | REVIEW | Dung P2-12, can test RLS |
| app/ttgdtx/source-control/page.tsx | MEDIUM | REVIEW | Dung P2-11, can test quyen manage/read |
| app/ttgdtx/gate/page.tsx | HIGH | REVIEW | Gate sang P2-03, can tach khoi phan tao cong no |
| app/ttgdtx/simulation/page.tsx | LOW-MEDIUM | REVIEW | Mo phong, it rui ro hon |
| step91/97/98/99 | MEDIUM-HIGH | REVIEW | Can rollback/approval |
| step100 | HIGH | APPROVAL_REQUIRED | Update trang thai pilot that, khong chay neu chua co backup + approval + rollback |

## 10. Recommended Split

| Group | Scope | Decision |
|---|---|---|
| G2a | Page read-only P2-01/P2-04/P2-05/P2-11/P2-12 | Prepare first |
| G2b | SQL master/source/gate step91/97/98/99 | Needs rollback + RLS test plan |
| G2c | step100 pilot-open | Keep separate, blocked until backup + approval + rollback |
| G7 | app/leads/* and quick-fix component | Do not include in G2 |

## 11. Current Conclusion

Final conclusion:
- G2_NEEDS_FIX
- Do not run migration
- Do not use real data
- Do not commit G2 as one group
- Review and harden G2a/G2b/G2c separately
- Step100 must remain separate and approval-required
