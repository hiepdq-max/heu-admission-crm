# HEU Department Task Handoff Register 2026-07-02

Status: PASS_LOCAL_DRY_RUN
Owner: BGH + IT_DATA + KHTC + PHAP_CHE + Audit + process owners
Production status: NO-GO
Decision values: DEPT_TASK_REGISTER_READY / NO_GO / BLOCKED

## 1. Purpose

Define the daily handoff format so each department can see what it must do,
who is expected to use the software, how that user is using it and which
authority must confirm the result. This register is written for non-IT readers
and can feed the Master Control dry-run view and the daily report draft.

This is a dry-run register only. It does not send email, create real tasks,
assign real user accounts, collect passwords, accept evidence, execute UAT,
approve finance action, approve owner GO or mark production GO.

## 2. Plain-Language Status Values

| Status | Meaning for users |
|---|---|
| PASS_LOCAL | IT has checked the slice with local audit/lint/build; users still must test and sign where required. |
| NO_GO | Do not use for production or real financial/legal reliance. |
| BLOCKED | A named owner must provide missing evidence, decision, access proof or correction. |
| DEPT_TASK_REGISTER_READY | The task lanes are ready as a controlled draft; no email/task automation is enabled. |

## 3. Department Task Register

| Department | User label | Stage | In-app task shown as dry-run | How the user uses it | Required proof outside Git/Codex/chat | Stop condition |
|---|---|---|---|---|---|---|
| BGH | BGH_READONLY_REVIEWER_LABEL | Daily review | Review Master Control blockers and plain-language report | Read NO-GO blockers, ask the right owner for evidence, wait for signed decision | Owner GO/NO-GO pack and final decision manifest | Treating PASS_LOCAL as approval |
| IT_DATA | IT_DATA_BUILD_OPERATOR_LABEL | Every build slice | Run PASS_LOCAL checks and record the failed gate if any | Check git state, run audit/lint/build, package one small commit | Green local logs and clean worktree | Dirty scope outside the slice or failed audit |
| KHTC | KHTC_ACCOUNTING_OPERATOR_LABEL | Finance Day-1 trial | Use Finance Desk read-only and record blocker/result | Compare summary views, note mismatches, escalate through Day-1 result ledger | Signed Finance Desk UAT/result ledger outside Git | Request to post voucher, move money or paste bank data |
| PHAP_CHE | PHAP_CHE_REVIEWER_LABEL | Legal/finance gate | Review legal/SOP/evidence blockers | Confirm legal basis, contract/SOP route and unresolved exception owner | Signed P0-19/legal/SOP decision outside Git | Legal conclusion requested from AI/Codex |
| Audit | AUDIT_READONLY_REVIEWER_LABEL | Evidence/UAT route | Check evidence reference, redaction and audit trace | Verify proof owner, redaction reviewer and audit-log trace | Controlled evidence reference and audit review signoff | Raw evidence, PII, bank statement or voucher appears in Git/Codex/chat |
| TUYEN_SINH | TUYEN_SINH_OPERATOR_LABEL | Lead lifecycle UAT | Execute P3-01/P3-02 lead lifecycle checklist when scheduled | Confirm lead status, handover blocker and no finance bypass | Signed P3-01/P3-02 UAT result | Handover creates finance fact before gate |
| CTHSSV | CTHSSV_HANDOVER_OPERATOR_LABEL | Student handover UAT | Review handover packet readiness | Check student-profile readiness and missing documents | Signed handover UAT evidence | Raw PII pasted into report/chat |
| DAO_TAO | DAO_TAO_REVIEWER_LABEL | Program/class readiness | Review class/program readiness and Short Course blockers | Check class/course dependencies and training owner decisions | Signed Dao Tao/Short Course UAT proof | Attendance/payment period is closed without signed proof |
| HR | HR_REVIEWER_LABEL | Short Course/allowance review | Review HR payment-related blocker only after source proof | Check role lane and required policy/evidence route | Signed HR/payment policy proof outside Git | Meal/allowance/HR payment is approved from PASS_LOCAL |

## 4. Email And In-App Boundary

The same lane can appear in:

- Master Control dry-run cards.
- `npm.cmd run report:heu-daily-dry-run` output.
- GitHub Actions step summary.
- A future email sender only after HEU IT_DATA configures approved recipients,
  sender identity and secrets outside Git/Codex/chat.

Until then, all output is draft/read-only. The system may show task labels, but
it must not create real tickets, send email, assign real user accounts, change
workflow state or mark a task done for the owner.

## 5. Forbidden Content

Do not place any of these in this register, daily report, email draft, software
task label, Git commit, Codex/chat or workflow log:

- Passwords, temporary passwords, OTPs, password reset links, account
  activation links or invite links.
- Service-role keys, API keys, SMTP passwords, app passwords or private keys.
- Raw student PII, raw CCCD, raw phone numbers or raw bank account numbers.
- Bank statements, vouchers, raw payment data, raw signed evidence or private
  contract bodies.

## 6. Current Result

DEPT_TASK_REGISTER_READY is PASS_LOCAL_DRY_RUN only. It means the department
task lanes and user labels are documented for dry-run reporting. It does not
approve production, UAT, evidence, finance action, access creation, email
sending, task automation or owner GO/NO-GO.
