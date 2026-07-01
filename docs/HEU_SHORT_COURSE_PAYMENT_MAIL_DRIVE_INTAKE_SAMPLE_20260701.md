# HEU Short Course Payment Mail Drive Intake Sample 2026-07-01

Status: DRAFT_CONTROL
Production status: NO-GO
Owner: KHTC + Dao Tao + HR + IT_DATA + Audit
Source type: Gmail notification for Google Drive shared folder

## 1. Purpose

This document records a Git-safe sample for building the Short Course payment
evidence intake workflow. It uses metadata from a Gmail notification about a
shared Drive folder for teacher payment of short-course classes.

This sample is for software design and UAT planning only. It does not accept
evidence, approve teacher payment, verify payroll, approve statutory
accounting, execute UAT, approve owner signoff or mark production GO.

## 2. Source Metadata

| Field | Value |
|---|---|
| Intake ID | SC-PAY-MAIL-20260701-001 |
| Gmail message ID | 19f1b8aec1c7f575 |
| Thread ID | 19f1b8aec1c7f575 |
| Received time | 2026-07-01 09:38 ICT |
| Sender | Thao Nguyen Thi Phuong via Google Drive |
| Sender email | thaontp@heuschool.edu.vn |
| Recipient | hiepdq@heuschool.edu.vn |
| CC | Trongtb@heuschool.edu.vn; daotao@heuschool.edu.vn |
| Subject | Thu muc duoc chia se voi ban: "Thanh toan GV lop ngan han" |
| Business group | Short Course / teacher payment |
| Evidence class | CONTROLLED_SENSITIVE until Audit classifies the folder contents |
| Git-safe storage | Metadata only; raw folder link and files stay outside Git/Codex/chat |
| Current decision | NO_GO until owner, Audit and KHTC review the controlled folder |

## 3. Controlled Folder Reference

| Field | Rule |
|---|---|
| Controlled folder label | SC_PAY_DRIVE_FOLDER_20260701_001 |
| Raw URL | Do not store in Git/Codex/chat. Keep in approved controlled evidence location only. |
| Access owner | Original Drive owner plus KHTC/Dao Tao/Audit as approved by HEU owner rules |
| Minimum access check | Confirm who can view, who can edit and whether external sharing is disabled |
| Stop condition | Any unrestricted sharing, missing owner, missing reviewer or raw payroll/payment data copied into Git/Codex/chat |

## 4. Software Intake Fields To Build

| Field code | Label | Type | Required | Owner |
|---|---|---|---|---|
| intake_id | Intake ID | text | yes | IT_DATA |
| source_channel | Source channel | enum: GMAIL_DRIVE_SHARE / MANUAL / SYSTEM | yes | IT_DATA |
| gmail_message_id | Gmail message ID | text | yes | IT_DATA |
| received_at | Received time | datetime | yes | IT_DATA |
| sender_email | Sender email | email | yes | IT_DATA |
| subject | Subject | text | yes | IT_DATA |
| business_group | Business group | enum | yes | KHTC + Dao Tao |
| controlled_folder_ref | Controlled folder reference | text | yes | Audit |
| evidence_class | Evidence class | enum | yes | Audit |
| access_owner | Access owner | text | yes | KHTC + Dao Tao |
| reviewer | Reviewer | text | yes | Audit |
| review_status | Review status | enum: NEW / NEEDS_ACCESS_CHECK / READY_FOR_UAT / NO_GO / BLOCKED | yes | Audit |
| linked_module | Linked module | enum: SHORT_COURSE / FINANCE_DESK / TTGDTX / HOU | yes | IT_DATA |
| payment_scope | Payment scope | enum: TEACHER_PAYMENT / MEAL_ALLOWANCE / HR_PAYMENT / OTHER | yes | KHTC |
| decision_value | Decision value | enum: SC_PAY_INTAKE_READY / NO_GO / BLOCKED | yes | KHTC + Audit |
| notes_redacted | Redacted note | text | no | IT_DATA |

## 5. Suggested Workflow

1. Gmail read-only monitor detects the Drive-share mail.
2. System creates a Git-safe intake row with Gmail metadata only.
3. The raw Drive URL is stored outside Git/Codex/chat in the approved
   controlled evidence location.
4. IT_DATA and Audit classify folder contents.
5. KHTC and Dao Tao confirm whether this belongs to teacher payment,
   allowance, HR payment or another short-course payment group.
6. Audit records reviewer, date, evidence class and controlled folder
   reference.
7. Only after signed UAT may Finance Desk or Short Course dashboards read a
   report view derived from approved metadata.

Decision values: `SC_PAY_INTAKE_READY / NO_GO / BLOCKED`.

## 6. Mapping To HEU Controls

| Control | How this sample maps |
|---|---|
| SC-AP-05 Meal/allowance basis | Use only if folder contains approved allowance/payment basis |
| SC-AP-06 Invoice/payment | Use only after voucher/payment evidence is classified outside Git |
| SC-AP-07 Report view signoff | Derived report view must remain signoff-blocked until DQ and owner signoff |
| SC-AP-08 Production stop rule | No teacher payment, payroll close or dashboard reliance from this sample alone |
| P0-10 Controlled evidence redaction | Raw folder and files stay outside Git/Codex/chat |
| P0-14 Evidence intake ledger | Store only `SC_PAY_DRIVE_FOLDER_20260701_001` and reviewer status |

## 7. Stop Conditions

Keep `NO_GO` if any of these occur:

- Raw Drive URL, payroll sheet, bank data, voucher, teacher personal data or
  payment detail is pasted into Git/Codex/chat.
- Folder owner, reviewer, evidence class or controlled storage reference is
  missing.
- Folder access is public, unrestricted or not approved by the owner.
- Any payment amount is used for teacher/HR payment before KHTC + Audit review.
- PASS_LOCAL is treated as payment approval, evidence acceptance, UAT pass or
  production GO.

## 8. Local Use For Product Design

This sample can be used to design:

- A read-only Gmail/Drive intake queue.
- A Short Course payment evidence registry.
- A controlled folder reference field.
- Evidence classification and reviewer capture.
- A Finance Desk/Short Course handoff that shows only safe metadata.

It must not be used to import real payroll/payment data or approve payment.
