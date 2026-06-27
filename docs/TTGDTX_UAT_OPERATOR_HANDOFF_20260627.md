# TTGDTX UAT Operator Handoff 2026-06-27

Status: PASS_LOCAL_HANDOFF
Scope: TTGDTX 9+ internal browser UAT with synthetic accounts only.

This handoff tells the human operator which files to use and in what order. It
does not execute UAT, approve production, create accounts, collect evidence or
record owner GO/NO-GO.

## 1. Hard Boundaries

- Do not paste passwords, OTPs, reset links, service-role keys, API keys, raw
  student PII, CCCD, private phone numbers, bank accounts, bank statements,
  vouchers or raw payment data into Git, Codex or chat.
- Use synthetic UAT accounts only.
- Store screenshots and signed evidence in controlled storage outside Git.
- Only redacted evidence references may be copied into docs or issue notes.
- Any missing account, route result, negative-test result, redaction proof,
  reviewer or owner signature keeps production NO-GO.

## 2. Run Order

| Step | Operator action | File/source | Required result |
|---|---|---|---|
| UAT-HANDOFF-01 | Run static preflight before browser testing | `npm.cmd run audit:ttgdtx-uat-readiness`; `npm.cmd run audit:heu-role-scope-uat-pack`; `npm.cmd run audit:ttgdtx-release-gates` | PASS or stop |
| UAT-HANDOFF-02 | Create or reset synthetic accounts in Supabase Auth | `docs/TTGDTX_SYNTHETIC_UAT_ACCOUNT_SETUP.md` | Accounts exist; no real passwords shared |
| UAT-HANDOFF-03 | Execute browser route/account matrix | `docs/TTGDTX_BROWSER_UAT_MATRIX_20260625.md` | ALLOWED, BLOCKED or EMPTY_SCOPED_STATE recorded |
| UAT-HANDOFF-04 | Record each test result and redacted evidence reference | `docs/TTGDTX_UAT_EXECUTION_LOG_20260625.md` | Account, route, result, evidence reference and reviewer recorded |
| UAT-HANDOFF-05 | Complete closure rows UAT-CLOSE-01 through UAT-CLOSE-06 | `docs/TTGDTX_UAT_EXECUTION_LOG_20260625.md` | UAT_PASS, UAT_FAIL or BLOCKED |
| UAT-HANDOFF-06 | Get required owner signatures outside Codex/chat | BGH, KHTC, PHAP_CHE, IT_DATA and Audit evidence pack | Signed PASS, FAIL or BLOCKED |

## 3. Stop Conditions

Stop UAT and keep production NO-GO if any of these occur:

- A synthetic account can see or edit data outside its role/workspace scope.
- A finance, payout, dashboard or source-control page relies only on hidden UI
  instead of server-side permission/scope checks.
- Out-of-scope or non-finance users can view restricted finance evidence.
- Any screenshot contains raw secrets, raw student identity data, bank account
  data, bank statements, vouchers or raw payment evidence.
- Owner sign-off is missing, unclear or recorded inside Codex/chat only.

## 4. Completion Rule

The UAT result may move from `BLOCKED_PENDING_MULTI_ACCOUNT_UAT` to `UAT_PASS`
only when:

1. All synthetic accounts are prepared.
2. Every required route/account case is tested.
3. Negative tests for finance and dashboard scope pass.
4. Evidence references are redacted and controlled.
5. The execution log has reviewer names and evidence references.
6. Required owners sign the final UAT result outside Codex/chat.

Even after UAT_PASS, production remains NO-GO until backup/restore evidence,
signed migration order, hard-delete/cascade waiver or conversion and final
owner GO/NO-GO are complete.
