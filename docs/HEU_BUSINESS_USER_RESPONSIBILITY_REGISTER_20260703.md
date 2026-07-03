# HEU Business User Responsibility Register - 2026-07-03

Status: PASS_LOCAL_REGISTER.
Production/UAT status: NO-GO until named users are owner-approved, created or
linked in Auth, scoped, browser-tested and signed outside Git/Codex/chat.

## Purpose

This register turns the operating principle into a controlled user and task
assignment rule:

- One person may hold many operating lanes.
- One operating lane must have exactly one accountable owner.
- Checkers and reviewers may support the work, but they are not the accountable
  owner.
- Every unfinished item must be assigned to one user slot or position before it
  can be worked.
- When a real person name/email is available, ADMIN/IT_DATA creates or links the
  Auth user through the approved secure channel, assigns the HEU position, then
  applies role, department, manager and scope.

Decision lane: `BUSINESS_USER_RESPONSIBILITY_READY / NO_GO / BLOCKED`.

Secret boundary: Do not paste passwords, temporary passwords, OTPs, password
reset links, invite links, service-role keys, raw student PII, CCCD, phone
numbers, bank accounts, vouchers or raw evidence into this file, Git,
Codex/chat, screenshots or email notes.

## Business User Slots

| Slot | Accountable position | Default role | Department/workspace | Reports to | Initial person state | Main responsibility |
| --- | --- | --- | --- | --- | --- | --- |
| BUS-HT-01 | `HT` | `HIEU_TRUONG` | `LEADERSHIP` | none | `PENDING_PERSON` | Final owner lane and school-level GO/NO-GO decision outside PASS_LOCAL |
| BUS-PHT-DT-01 | `PHT_DAO_TAO` | `PHO_HIEU_TRUONG` | `LEADERSHIP` | `HT` | `PENDING_PERSON` | Training executive owner for Dao Tao, CTHSSV, Khoa and Short Course lanes |
| BUS-PHT-TC-01 | `PHT_TAI_CHINH` | `PHO_HIEU_TRUONG` | `LEADERSHIP` | `HT` | `PENDING_PERSON` | Finance executive owner for KHTC and finance reliance lanes |
| BUS-PHT-VH-01 | `PHT_VAN_HANH` | `PHO_HIEU_TRUONG` | `LEADERSHIP` | `HT` | `PENDING_PERSON` | Operations executive owner for Tuyen sinh and TCHC lanes |
| BUS-IT-01 | `IT_DATA_HEAD` | `IT_DATA_HEAD` | `IT_DATA` | `HT` | `PENDING_PERSON` | Auth/profile link, permissions, scopes, backup/restore, migration order and system readiness |
| BUS-AUDIT-01 | `AUDIT_HEAD` | `AUDIT_HEAD` | `AUDIT` | `HT` | `PENDING_PERSON` | Audit evidence, negative controls, audit-log and hard-delete/cascade closure |
| BUS-PHAP-CHE-01 | `PHAP_CHE_HEAD` | `PHAP_CHE_LEAD` | `PHAP_CHE` | `HT` | `PENDING_PERSON` | Legal, SOP, invoice/chung-tu and waiver review lanes |
| BUS-DAO-TAO-01 | `DAO_TAO_HEAD` | `DAO_TAO_LEAD` | `DAO_TAO` | `PHT_DAO_TAO` | `PENDING_PERSON` | Training department task owner and class/program operation readiness |
| BUS-CTHSSV-01 | `CTHSSV_HEAD` | `CTHSSV_LEAD` | `CTHSSV` | `PHT_DAO_TAO` | `PENDING_PERSON` | CTHSSV handover, student service and profile readiness |
| BUS-KHTC-01 | `KE_TOAN_TRUONG` | `ACCOUNTING_LEAD` | `ACCOUNTING` | `PHT_TAI_CHINH` | `PENDING_PERSON` | KHTC/finance desk, accounting dashboard, payment request and reliance decision preparation |
| BUS-TUYEN-SINH-01 | `TUYEN_SINH_HEAD` | `ADMISSION_HEAD` | `ADMISSION` | `PHT_VAN_HANH` | `PENDING_PERSON` | Lead intake, pipeline, handover source quality and recruitment operations |
| BUS-NGAN-HAN-01 | `NGAN_HAN_HEAD` | `NGAN_HAN_LEAD` | `NGAN_HAN` | `PHT_DAO_TAO` | `PENDING_PERSON` | Short Course/Day Nghe operation, attendance and payment evidence routing |
| BUS-KHOA-01 | `KHOA_HEAD` | `KHOA_LEAD` | `KHOA` | `PHT_DAO_TAO` | `PENDING_PERSON` | Faculty/teacher/class delivery source and privacy readiness |
| BUS-TCHC-01 | `TCHC_HEAD` | `TCHC_LEAD` | `TCHC` | `PHT_VAN_HANH` | `PENDING_PERSON` | TCHC positions, staffing, records, assets and HR/admin support lanes |

## Open Work Assignment Queue

| Work item | Accountable slot | Checker/reviewer lanes | Current state | Required next action |
| --- | --- | --- | --- | --- |
| P0-17 user activation and scope baseline | BUS-IT-01 | BUS-AUDIT-01 + process owner | `NO_GO` | Link/create named user, assign role/department/manager, then explicit lead visibility and business scope |
| P6-04 role/workspace UAT | BUS-IT-01 | BUS-AUDIT-01 + process owner | `NO_GO` | Run role route matrix with redacted evidence and sign externally |
| P5-03 Finance Desk UAT | BUS-KHTC-01 | BUS-PHT-TC-01 + BUS-AUDIT-01 | `NO_GO` | Assign accounting operator, read-only test, record reliance decision externally |
| P2-18 accounting dashboard UAT | BUS-KHTC-01 | BUS-PHT-TC-01 + BUS-IT-01 | `NO_GO` | Run dashboard source reconciliation and controlled browser UAT |
| P2-17 payout duplicate guard | BUS-KHTC-01 | BUS-AUDIT-01 + BUS-IT-01 | `NO_GO` | Complete duplicate/overpay/dossier evidence before any payment reliance |
| P0-03 backup/restore and migration order | BUS-IT-01 | BUS-AUDIT-01 + BUS-KHTC-01 + BUS-PHAP-CHE-01 | `NO_GO` | Store backup/restore proof and signed migration order outside Git/Codex/chat |
| P0-19/P4-02 legal, invoice and chung-tu gate | BUS-PHAP-CHE-01 | BUS-KHTC-01 + BUS-AUDIT-01 | `NO_GO` | Confirm legal basis, invoice policy and written owner decision |
| P3-01/P3-02 lead lifecycle and handover | BUS-CTHSSV-01 | BUS-TUYEN-SINH-01 + BUS-DAO-TAO-01 + BUS-KHTC-01 | `NO_GO` | Prove handover cannot bypass finance/legal gates and sign route evidence |
| P9 Short Course/Day Nghe operation | BUS-NGAN-HAN-01 | BUS-DAO-TAO-01 + BUS-KHTC-01 + BUS-PHAP-CHE-01 | `NO_GO` | Assign attendance/payment/BHXH/meal/invoice evidence owners |
| P10 Khoa/Giang vien operation | BUS-KHOA-01 | BUS-DAO-TAO-01 + BUS-PHAP-CHE-01 | `NO_GO` | Assign teacher profile privacy, class delivery and owner signoff lanes |
| P6-06 hard-delete/cascade closure | BUS-AUDIT-01 | BUS-IT-01 + affected business owner | `NO_GO` | Convert protected records or obtain narrow written waiver with rollback proof |
| P0-09 final owner GO/NO-GO | BUS-HT-01 | BUS-PHT-DT-01 + BUS-PHT-TC-01 + BUS-IT-01 + BUS-AUDIT-01 + BUS-PHAP-CHE-01 | `NO_GO` | Review signed UAT, backup/restore, migration, access closure and risk closure evidence |

## Assignment Rules

1. Do not create a real Auth account until the person is approved for one slot.
2. Do not enter real passwords, temporary passwords, OTPs, reset links or invite
   links into Git/Codex/chat.
3. When a person handles multiple slots, record that as one named user mapped to
   multiple position lanes or responsibility lanes.
4. Do not assign the same work item to multiple accountable users. Use one
   accountable owner plus checker/reviewer lanes.
5. If an item is `NO_GO` or `BLOCKED`, it still needs one accountable slot.
6. A task without an accountable slot cannot move into UAT, finance reliance,
   owner review or production discussion.

## Operating Steps When A Name Is Known

| Step | Action | PASS_LOCAL check |
| --- | --- | --- |
| 1 | Map the person to one or more business user slots | Slot exists in this register and position queue |
| 2 | Create/link Supabase Auth user through approved secure channel | No secret appears in Git/Codex/chat |
| 3 | Assign HEU position by email in Settings | Position role, department and manager match |
| 4 | Configure lead visibility and business scope | No non-ADMIN/BGH user gets broad `ALL` by default |
| 5 | Run role/workspace and negative-control checks | Expected routes are allowed, blocked or empty-scoped |
| 6 | Store external signed evidence | Redacted evidence ID and owner decision exist outside Git/Codex/chat |

## Exit Rule

This register is ready for controlled assignment, not production operation. It
does not create users, set passwords, send reset/invite links, execute UAT,
accept evidence, approve finance reliance, approve owner GO/NO-GO or mark
production GO.
