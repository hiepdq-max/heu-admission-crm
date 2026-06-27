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
