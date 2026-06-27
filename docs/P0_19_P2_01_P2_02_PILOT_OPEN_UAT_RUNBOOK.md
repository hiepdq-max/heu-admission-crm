# P0-19 / P2-01 / P2-02 Pilot Open UAT Runbook

Purpose: verify that P2-03 receivable creation is blocked until P0-19 legal/tuition finance gate, P2-01 contract and P2-02 tuition policy are ready.

Production boundary:

- `database/step97_ttgdtx_p0_19_finance_gate_fix.sql` is a migration candidate only.
- `database/step100_ttgdtx_pilot_open_p2_01_p2_02_p0_19.sql` is sandbox/UAT only.
- Step100 is sandbox/UAT only and must never be used as production legal, tuition, revenue or payout authority.
- Do not run either script from Codex/chat into production.
- Production use requires official contract, official tuition decision, legal gate approval, backup evidence, restore dry-run, migration order approval and business Go/No-Go.

## Safety Guard

Step100 is blocked by default. To run it intentionally in an approved sandbox/UAT SQL session, the operator must set the session flag inside the transaction:

```sql
begin;
set local app.heu_allow_pilot_open = 'YES';
-- then run the guarded Step100 body
```

If the flag is missing, Step100 must raise an exception before updating pilot contract, tuition policy or P0-19 gate data.

## Data Rule

Use pilot metadata only:

- OK: pilot center code, pilot contract marker, pilot tuition amount, gate status, readiness counters.
- Not OK: real student identities, real bank data, private contract body, production invoice credentials, passwords, OTP, API keys.
- Any Phu-Xuyen-like center is a reference scenario only. The logic must remain reusable for many TTGDTX centers.

## UAT Cases

| Case | Setup | Expected result |
|---|---|---|
| Missing P0-19 gate | Lead has TTGDTX, program and major but no active major gate | P2-03 candidate shows `P0_19_MAJOR_GATE_MISSING`; receivable creation blocked |
| P0-19 not allowed | Gate exists but legal, tuition or finance status is not ready | Candidate shows `P0_19_FINANCE_NOT_READY`; trigger rejects non-cancelled receivable |
| Missing P2-02 policy | P0-19 allowed but no ready tuition policy | Candidate shows tuition policy blocker |
| Duplicate receivable | Ready lead already has active non-cancelled term receivable | Candidate shows duplicate blocker |
| Sandbox open without flag | Run Step100 without `app.heu_allow_pilot_open = YES` | SQL raises `Step100 blocked` before updates |
| Sandbox open with flag | Approved sandbox only, flag set and backup available | Pilot counters can reach expected readiness for test flow |
| Production review | Any Step100 result considered for production | No-Go unless replaced by official contract, tuition decision and legal gate evidence |

## Local Static Checks

Run before commit or release packaging:

```powershell
npm.cmd run audit:ttgdtx-pilot-open-safety
npm.cmd run audit:ttgdtx-role-scope-access
npm.cmd run audit:ttgdtx-cascade
npm.cmd run audit:ttgdtx-audit-log
npm.cmd run audit:hard-delete
```

Expected controls:

- Step97 has a production boundary and transaction wrapper.
- Step97 candidate view and receivable trigger enforce P0-19 `ALLOW_FINANCE`.
- Step100 has a production boundary and sandbox-only NO-GO statement.
- Step100 is blocked unless the explicit sandbox session flag is set.
- Step100 records stay labeled as pilot/temporary and do not authorize partner payout.
- Neither Step97 nor Step100 hard-deletes or truncates business data.

## Sign-Off Evidence

Before any approved sandbox run, attach:

- Backup/restore dry-run reference for the sandbox database.
- Operator name, reviewer name and approval timestamp.
- Screenshot/export of before and after P2-01, P2-02 and P0-19 readiness counters.
- Confirmation that Step100 output was not promoted to production.

## P0-19 Evidence Checklist

The app exposes `components/ttgdtx/ttgdtx-p019-uat-evidence-checklist.tsx` on
the P2-05 gate and P2-03 receivables pages. The checklist is PASS_LOCAL only
and covers P0-19-01 through P0-19-07: legal basis, tuition policy, missing or
blocked finance gate, Step100 sandbox boundary, receivable creation trace and
owner sign-off.

Do not attach private contract bodies, raw student PII, CCCD, bank data,
passwords, OTPs, service-role keys or production credentials in Git/Codex/chat.
Signed legal/finance UAT remains required before P0-19 can be accepted for
production receivable use.

## P0-19 Waiver/Exception Register

The app exposes `data-ttgdtx-p019-waiver-exception-register="P0-19"` for any
Step100 sandbox use, legal exception, tuition/invoice exception or finance gate
override discussion. Every row must have a written owner, controlled reference
ID, expiry/review date and explicit NO-GO boundary.

| Case | Exception type | Owner | Required evidence | Stop condition |
|---|---|---|---|---|
| P0-19-WAIVE-01 | Step100 sandbox pilot open | BGH + KHTC + PHAP_CHE + IT_DATA | Written sandbox/UAT approval, session flag proof, expiry/review date and confirmation that output is not production authority | Step100 output is used as legal acceptance, tuition approval, finance approval, revenue authority or production GO |
| P0-19-WAIVE-02 | Legal basis exception | PHAP_CHE + BGH | Written legal owner decision, scope, center, program/major, effective period and unresolved-risk note | Exception is oral, ownerless, expired, broad, hidden or not tied to a specific center/program |
| P0-19-WAIVE-03 | Tuition/invoice policy exception | KHTC + PHAP_CHE | Written policy owner decision, tuition version, payer model, invoice/chung-tu basis and review date | Amount, term, payer model, invoice responsibility or waiver basis remains unresolved |
| P0-19-WAIVE-04 | Finance gate override request | KHTC + Audit + BGH | Negative/positive gate evidence, risk owner decision, audit note and controlled reference ID | P2-03 can create receivable while P0-19 is missing, blocked, unsigned or based only on pilot data |

Decision value: P0_19_WAIVER_ACCEPT / NO_GO / BLOCKED.

PASS_LOCAL does not approve a legal waiver, tuition exception, finance override,
Step100 production use, receivable creation, revenue recognition or production
GO.

## P0-19 Acceptance Matrix

The app also exposes `data-ttgdtx-p019-acceptance-matrix="P0-19"`. P0-19 can
support P2-03 receivable creation only when each row below is accepted with
redacted evidence. Any stop condition keeps production NO-GO.

| Case | Requirement | Minimum evidence | Stop condition |
|---|---|---|---|
| P0-19-ACCEPT-01 | Legal authority is current and scoped | Contract/legal reference identifies center, program/major, effective period, training scope and approving owner | Legal scope, effective period, center or major is unclear, expired or only assumed from a pilot note |
| P0-19-ACCEPT-02 | Tuition policy matches legal authority | P2-02 tuition policy version, amount, term, due rule and payer model match the accepted legal basis | Tuition amount, term, due date rule, invoice/chung-tu responsibility or waiver basis is unresolved |
| P0-19-ACCEPT-03 | Finance gate result is explicit | P0-19 gate status shows `ALLOW_FINANCE` only after legal and tuition checks pass, with actor/time trace | P2-03 can create receivable while gate is missing, blocked, waived or not signed |
| P0-19-ACCEPT-04 | Step100 remains sandbox/UAT only | Evidence proves Step100 uses explicit session flag and is not used as production legal, tuition or finance authority | Step100 output is treated as production approval, legal acceptance, tuition approval or revenue authority |
| P0-19-ACCEPT-05 | Receivable path is blocked then allowed | One negative case blocks P2-05/P2-03 before P0-19 readiness and one positive case allows after all prerequisites pass | Only a positive screenshot exists or no blocked-path proof is attached |
| P0-19-ACCEPT-06 | Owners sign redacted evidence | PHAP_CHE, KHTC, BGH and Audit sign redacted evidence references outside Codex/chat | PASS_LOCAL is treated as legal, finance, UAT, revenue or production approval |

Decision value: P0_19_ACCEPT / FAIL / BLOCKED.

Do not attach private contract bodies, raw student PII, CCCD, bank data,
credentials, passwords, OTPs, service-role keys, raw vouchers or raw payment
data. Missing owner signature keeps production NO-GO.

## P0-19 Gate Decision Manifest

The app also exposes
`data-ttgdtx-p019-gate-decision-manifest="P0-19"`. Use this manifest after the
UAT checklist, waiver/exception register and acceptance matrix are complete. It
prepares a human legal/finance gate decision; it does not approve receivable
creation, revenue recognition, finance action or production GO.

| Case | Decision gate | Required evidence | Stop condition |
|---|---|---|---|
| P0-19-DEC-01 | Legal authority accepted | Current contract/legal basis identifies center, program/major, scope, effective period and approving legal owner | Legal authority is expired, assumed from pilot notes, missing owner signature or not scoped to the center/program |
| P0-19-DEC-02 | Tuition and invoice policy aligned | Tuition amount, term, due rule, payer model, invoice/chung-tu responsibility and waiver basis match the legal authority | Tuition, payer, invoice/chung-tu responsibility or waiver basis is unresolved |
| P0-19-DEC-03 | Finance gate blocks then allows | Negative evidence blocks P2-05/P2-03 before readiness; positive evidence allows only after P0-19, P2-01, P2-02 and P2-05 pass | P2-03 can create receivable while the gate is missing, blocked, unsigned or based only on sandbox data |
| P0-19-DEC-04 | Step100 and exceptions controlled | Any Step100 sandbox use or legal/tuition/finance exception has written owner decision, scope, expiry and NO-GO boundary | Step100 or any exception is treated as production legal, tuition, finance, revenue or payout authority |
| P0-19-DEC-05 | Redacted evidence and owner signatures complete | PHAP_CHE, KHTC, BGH and Audit sign redacted controlled evidence references outside Git/Codex/chat | Private contract bodies, raw student PII, CCCD, bank data, credentials, raw vouchers or raw payment data appear |
| P0-19-DEC-06 | Human gate decision recorded | The gate record states P0_19_GATE_READY, NO_GO or BLOCKED before any P2-03 production reliance | PASS_LOCAL is treated as legal approval, finance approval, UAT acceptance, receivable approval, revenue recognition or production GO |

Decision value: P0_19_GATE_READY / NO_GO / BLOCKED.

Missing gate decision ID, unsigned owner evidence, unresolved invoice/chung-tu
basis, uncontrolled exception or raw sensitive evidence keeps P0-19 NO-GO.
