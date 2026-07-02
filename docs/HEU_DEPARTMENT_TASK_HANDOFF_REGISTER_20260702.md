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
| INFO_REQUIRED_BY_AUTHORITY | A question is routed to the right owner label instead of Codex guessing or approving. |
| REAL_OPS_ROUTE_SUMMARY_READY | REAL-OPS-01 through REAL-OPS-08 are routed to owner labels for external proof/signature; no proof is accepted here. |

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

## 4. Information Required From Authority

When a report, UI panel or Codex run is missing a business decision, the safe
state is `INFO_REQUIRED_BY_AUTHORITY / NO_GO / BLOCKED`. The system must route
the question to the owner label and wait for an external signed answer instead
of guessing or marking GO.

| Request | Owner label | Question to confirm | Safe output allowed in report/software | Stop condition |
|---|---|---|---|---|
| INFO-REQ-01 | BGH | Which recipient labels may receive the daily PASS_LOCAL report? | Approved alias/label names only | Individual email addresses or private lists are pasted into Git/Codex/chat |
| INFO-REQ-02 | IT_DATA | Are GitHub Actions variables/secrets configured or still EMAIL_CONFIG_REQUIRED? | Config name plus readiness state only | SMTP value, password, token or secret is exposed |
| INFO-REQ-03 | KHTC | Which accounting user labels may use Finance Desk read-only during Day-1? | User label, role and scope only | Real account, password, OTP or bank/payment data is requested |
| INFO-REQ-04 | PHAP_CHE | Which legal/SOP question still needs a human-authority conclusion? | Blocker, owner and external signoff route | AI/Codex is asked to provide the legal conclusion |
| INFO-REQ-05 | Audit | Which evidence reference, redaction class and reviewer are acceptable? | Controlled evidence ID/reference only | Raw evidence, PII, bank statement or voucher is exposed |
| INFO-REQ-06 | TRUONG_PHONG + process owners | Which route/user-label may test, which route is out of scope and who signs? | Label, route, stop condition and signer owner | Real user is created or UAT is approved from the dry-run report |

## 5. Real Operation Closure Route Summary

The daily report may show the real-operation closure routes in plain language
so each department knows what it must prepare next. This is
`REAL_OPS_ROUTE_SUMMARY_READY / NO_GO / BLOCKED` routing only. It does not
accept evidence, execute UAT, approve finance reliance, approve legal position,
approve migration, create real tasks, send email, assign accounts, decide owner
GO/NO-GO or mark production GO.

| Route | Owner label | What the user does | External proof/signature required outside Git/Codex/chat | Stop condition |
|---|---|---|---|---|
| REAL-OPS-01 | IT_DATA + Audit | Prepare backup/restore proof intake and smoke-check summary | Backup ID, restore target proof, smoke-check output and closure owner | Backup dump, database URL, service-role key, raw PII, bank data or voucher appears in the report |
| REAL-OPS-02 | IT_DATA + KHTC + PHAP_CHE | Confirm signed Step90-Step110 migration order after P0-03 proof is accepted | Signed migration order, rollback point and signer authority | SQL is executed or migration is approved from PASS_LOCAL |
| REAL-OPS-03 | BGH + IT_DATA + KHTC + PHAP_CHE + Audit + TRUONG_PHONG | Check UAT-ROUTE-01 through UAT-ROUTE-11 and which signature is missing | Signed UAT route results, owner signatures and exception notes | PASS_LOCAL is treated as UAT accepted or owner signed |
| REAL-OPS-04 | KHTC + BGH + IT_DATA + Audit | Review Finance Desk/P2-18 source reconciliation, Day-1 result and P0-17 access closure | P5-03 controlled-trial proof, FIN_DAY1_RESULT and ACCESS_RETAIN / REVOKE_OR_REDUCE / BLOCKED | Voucher posting, bank instruction, money movement, access-closure approval or production dashboard reliance is requested |
| REAL-OPS-05 | PHAP_CHE + KHTC + BGH | Confirm P0-19 legal gate, contract/SOP basis, tuition policy and invoice/chung-tu route | Signed legal/SOP/tax or waiver decision and redaction class | AI/Codex is asked for legal conclusion, tax decision, invoice issuance or raw contract acceptance |
| REAL-OPS-06 | IT_DATA + Audit + business owners | Check P6-06-FIND-001 through P6-06-FIND-044 and batch closure route | Conversion proof or written waiver, rollback route and redaction proof | Production deletion, cascade execution, conversion migration, cleanup or waiver is approved from the report |
| REAL-OPS-07 | HOU owner + DAO_TAO + CTHSSV + KHTC + HR + PHAP_CHE + Audit | Separate HOU ledger/handover and Short Course attendance/payment scope before trial | HOU phase decision, Short Course phase decision, report-view signoff route and owner defer decision | HOU handover, COM payout, attendance lock, BHXH decision, HR payment or statutory accounting is approved from the report |
| REAL-OPS-08 | BGH + IT_DATA + KHTC + PHAP_CHE + Audit + TRUONG_PHONG | Confirm REAL-OPS-01 through REAL-OPS-07 are externally closed before owner GO/NO-GO | Final owner decision manifest and signed prerequisite closure package | Daily report is treated as owner GO/NO-GO, production approval, finance approval, evidence acceptance or migration approval |

## 6. Email And In-App Boundary

The same lane can appear in:

- Master Control dry-run cards.
- `npm.cmd run report:heu-daily-dry-run` output.
- GitHub Actions step summary.
- A future email sender only after HEU IT_DATA configures approved recipients,
  sender identity and secrets outside Git/Codex/chat.

Until then, all output is draft/read-only. The system may show task labels, but
it must not create real tickets, send email, assign real user accounts, change
workflow state or mark a task done for the owner.

## 7. Forbidden Content

Do not place any of these in this register, daily report, email draft, software
task label, Git commit, Codex/chat or workflow log:

- Passwords, temporary passwords, OTPs, password reset links, account
  activation links or invite links.
- Service-role keys, API keys, SMTP passwords, app passwords or private keys.
- Raw student PII, raw CCCD, raw phone numbers or raw bank account numbers.
- Bank statements, vouchers, raw payment data, raw signed evidence or private
  contract bodies.

## 8. Current Result

DEPT_TASK_REGISTER_READY is PASS_LOCAL_DRY_RUN only. It means the department
task lanes, user labels, INFO_REQUIRED_BY_AUTHORITY owner questions and
REAL_OPS_ROUTE_SUMMARY_READY closure route summaries are documented for dry-run
reporting. It does not approve production, UAT, evidence, finance action,
access creation, email sending, task automation or owner GO/NO-GO.
