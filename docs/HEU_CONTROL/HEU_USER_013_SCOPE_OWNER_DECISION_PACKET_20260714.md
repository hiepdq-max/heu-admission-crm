# HEU-USER-013 - Scope Owner Decision Packet

Task ID: HEU-USER-001-IDENTITY-POSITION-SCOPE-MAPPING
Date: 2026-07-14
Status: OWNER_DECISION_REQUIRED
Production: NO-GO

## 1. Muc tieu

Hoan tat mapping `Auth -> users_profile -> position -> role -> department ->
workspace/scope` bang quyet dinh cua owner. Packet nay chi ghi metadata va nhan
an toan; khong cap quyen, khong sua database va khong tao tai khoan.

## 2. Snapshot live read-only

| Kiem tra | Ket qua |
|---|---:|
| Active profiles | 12 |
| Active non-ADMIN/BGH profiles | 10 |
| Profile co Auth link | 12/12 |
| Profile co role link | 12/12 |
| Thieu lead visibility | 8 |
| Thieu business scope | 8 |
| Non-ADMIN/BGH co visibility ALL | 0 |
| Workspace mismatch | 1 |
| Required positions | 17 |
| Assigned required positions | 7 |
| Unassigned required positions | 10 |
| Permission coverage gaps | 6 |
| Active assignment thieu user | 1 |
| Manager mismatch | 2 |

Nguon: `check:heu-permission-scope-readiness`,
`check:heu-user-scope-baseline-repair-queue`,
`check:heu-position-assignment-owner-queue` va
`check:heu-settings-permission-matrix-readiness` chay read-only ngay
2026-07-14. Cac checker khong in email, ten, phone, UUID, password hay secret.

## 3. Quyet dinh owner can ghi

Moi dong can owner ghi qua kenh quan tri an toan, sau do IT_DATA/Audit doi
chieu. Khong dung `ALL` cho non-ADMIN/BGH.

| Nhom quyet dinh | So luong | Gia tri duoc phep |
|---|---:|---|
| Lead visibility | 8 | `OWN`, `TEAM` hoac `DEPARTMENT` |
| Business scope | 8 | segment/partner duoc owner duyet |
| Workspace preference | 1 | workspace nam trong business scope |
| Required position owner | 10 | owner da xac nhan hoac ghi ro `BLOCKED` |
| Permission coverage | 6 | bo sung qua permission matrix sau review |
| Assignment/manager exception | 3 | sua hoac ghi ly do va owner |

## 4. Thu tu xu ly bat buoc

1. Xac nhan owner/reviewer va kenh thao tac an toan.
2. Chon lead visibility cho 8 nhan an toan.
3. Chon segment/partner scope cho 8 nhan an toan.
4. Sua workspace mismatch trong pham vi scope da duyet.
5. Gan owner cho 10 position master con thieu; khong auto-assign.
6. Xu ly 6 permission coverage gaps va 3 assignment/manager exceptions.
7. Chup snapshot truoc va sau repair; chi luu evidence ID metadata.
8. Chay lai toan bo checker va tao negative-control UAT packet.

## 5. Dieu kien dat user/scope

Chi ket luan `DAT_TAM_THOI` khi tat ca dieu kien sau cung PASS:

- `missing_visibility=0`.
- `missing_business_scope=0`.
- `workspace_mismatch=0`.
- Required position co owner hoac co owner decision `BLOCKED` ro rang.
- Permission coverage gap da duoc xu ly hoac co owner exception co han.
- Assignment va manager mismatch da duoc xu ly hoac co exception co owner.
- Co snapshot truoc/sau, controlled evidence ID va rollback note.
- Negative-control UAT dung/sai scope san sang.

## 6. Stop rules

Dung ngay va tra `NO_GO` neu:

- co user non-ADMIN/BGH nhan visibility `ALL`;
- cap scope truoc khi co owner decision;
- gan owner theo suy doan email/ten hoac auto-assign;
- scope workspace nam ngoai segment/partner duoc duyet;
- permission matrix gap bi bo qua;
- co password, reset link, invite link, raw UUID hoac PII trong evidence;
- checker fail hoac khong co snapshot rollback.

## 7. Quyen hanh dong cua Codex

Codex duoc doc metadata, lap packet, chay checker, tao test fixture va bao cao.
Codex khong tu cap scope, gan owner that, sua permission that, tao Auth user,
gui email, chay SQL mutation, chap nhan UAT/evidence hoac mo production.

## 8. Ket luan hien tai

- User/scope: `CAN_SUA`.
- Owner decision: `CHO_BGH_DUYET` va IT_DATA/Audit doi chieu.
- Authenticated UAT: `NO_GO_UNTIL_SCOPE_CLOSED`.
- Pilot read-only theo phong: `NO_GO_UNTIL_SCOPE_CLOSED`.
- Production: `NO_GO`.

Task sau khi packet duoc owner dien day du:
`HEU-USER-014-SCOPE-REPAIR-POST-DECISION-READINESS`.
