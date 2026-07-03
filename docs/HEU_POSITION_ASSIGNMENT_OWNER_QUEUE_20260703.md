# HEU Position Assignment Owner Queue - 2026-07-03

Status: PASS_LOCAL_QUEUE.
Production/UAT status: NO-GO until owner-approved person mapping, signed
multi-account UAT and the normal production gate are completed outside
Codex/chat.

## Purpose

This queue turns the required HEU position seats into small owner-approved
assignment lanes. It does not name real people, store credentials, approve
access or assign users by itself.

Decision lane: `POSITION_OWNER_QUEUE_READY / NO_GO / BLOCKED`.

Secret boundary: Do not paste passwords, temporary passwords, OTPs, password
reset links, account activation/invite links, service-role keys, raw student
PII, CCCD, phone numbers, bank accounts, vouchers or raw evidence into this
file, Git, Codex, chat, email notes or screenshots.

## Runtime Queue Rule

- Required seat owner assignment is pending until the owner maps each position
  code to a real approved person and secure activation path.
- Existing active profiles that already match a required position's role and
  department are candidate evidence only, not owner approval.
- If no active profile matches a required position, create/link the user first,
  then assign the position through Settings/RPC after approval.
- Every candidate or assigned user must keep explicit lead visibility, business
  scope and workspace preference before operating leads.
- Runtime DB may still show legacy `HR_HEAD` until Step115 TCHC correction is
  approved/applied; do not rename or migrate production data from Codex/chat.

## Required Seat Lanes

| Order | Position lane | Required owner decision | Minimum PASS_LOCAL proof | Stop condition |
| --- | --- | --- | --- | --- |
| 1 | `HT` | Owner-approved school principal mapping | Auth/profile linked, role/dept match, scope policy recorded | No named owner or unsafe credential channel |
| 2 | `PHT_01` | Owner-approved delegated principal mapping | Auth/profile linked, role/dept match, manager chain checked | No delegated authority proof |
| 3 | `DAO_TAO_HEAD` | Dao Tao head mapping | Auth/profile linked, role/dept match, lead visibility/scope ready | Missing Dao Tao owner sign-off |
| 4 | `TUYEN_SINH_HEAD` | Tuyen Sinh head mapping | Auth/profile linked, role/dept match, lead visibility/scope ready | Broad access without negative proof |
| 5 | `CTHSSV_HEAD` | CTHSSV head mapping | Auth/profile linked, role/dept match, lead visibility/scope ready | Candidate exists but owner approval missing |
| 6 | `KE_TOAN_TRUONG` | KHTC chief accountant mapping | Auth/profile linked, role/dept match, finance lane still gated | Finance reliance or payout treated as approved |
| 7 | `PHAP_CHE_HEAD` | Phap Che head mapping | Auth/profile linked, role/dept match, legal review lane scoped | Legal/SOP authority unclear |
| 8 | `AUDIT_HEAD` | Audit head mapping | Auth/profile linked, role/dept match, read-only audit scope ready | Audit account can write operational data |
| 9 | `IT_DATA_HEAD` | IT/Data head mapping | Auth/profile linked, role/dept match, permission_matrix.manage justified | System/manage permission granted without owner proof |
| 10 | `KHOA_HEAD` | Faculty head mapping | Auth/profile linked, role/dept match, segment scope recorded | Faculty scope or owner unclear |
| 11 | `NGAN_HAN_HEAD` | Short Course head mapping | Auth/profile linked, role/dept match, Short Course scope recorded | Short Course account sees non-short-course lane |
| 12 | `TCHC_HEAD` / legacy `HR_HEAD` | TCHC head mapping | Auth/profile linked, role/dept match, Step115 state checked | HR/TCHC migration state unclear |
| 13 | `TCHC_VAN_THU_LUU_TRU` | TCHC records/archive mapping | Auth/profile linked, role/dept match, records scope recorded | Records/archive role unclear or sees admissions data outside scope |
| 14 | `TCHC_HANH_CHINH_NHAN_SU` | TCHC administration/HR mapping | Auth/profile linked, role/dept match, HR scope recorded | HR account sees finance/lead data outside approved scope |
| 15 | `TCHC_CSVC_TAI_SAN` | TCHC facilities/assets mapping | Auth/profile linked, role/dept match, asset scope recorded | Asset/facility role receives broad CRM or finance access |

## Required Commands

- `npm.cmd run check:heu-position-assignment-owner-queue`
- `npm.cmd run check:heu-settings-permission-matrix-readiness`
- `npm.cmd run check:heu-user-activation-worksheet-readiness`
- `npm.cmd run check:heu-user-create-readiness`
- `npm.cmd run check:heu-permission-scope-readiness`
- `npm.cmd run audit:heu-user-account-security`

## Exit Rule

The queue can be PASS_LOCAL while seats remain unassigned, but only as an
owner-action queue. It does not create accounts, assign real users, set
passwords, send reset/invite links, approve UAT, approve finance reliance,
approve migration order, approve owner GO/NO-GO or mark production GO.

Boundary phrase: does not create accounts, assign real users, set passwords,
send reset/invite links, approve UAT or mark production GO.
