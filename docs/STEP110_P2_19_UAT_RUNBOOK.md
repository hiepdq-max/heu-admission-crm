# Step110 P2-19 UAT Runbook

Purpose: register real or anonymized TTGDTX evidence packs as metadata only, so HEU can control BBNT, partner invoices, collection invoice policy, account freeze/release notes and collateral-release evidence before real operation.

## Boundary

- Do not run production migration from Codex/chat.
- Do not import raw student, bank-account, CIF, asset or transaction data.
- Run only on an isolated UAT/restore database after Step92, Step98 and Step109 are present.
- Keep Phu-Xuyen-like material as reference evidence only; the product workflow must stay generic across centers.

## Run Order

1. Run `database/step110_preflight_check_before_p2_19.sql`.
2. If any row returns `MISSING`, stop and run the missing previous migration on UAT/restore first.
3. Run `database/step110_ttgdtx_real_data_evidence_metadata_p2_19.sql` as one complete transaction.
4. Run `database/step110_postflight_check_p2_19.sql`.
5. If Supabase reports `relation "a" does not exist`, run `database/step110_find_relation_a_debug.sql` and record the returned object before retrying.

## Expected Evidence

| Check | Expected |
|---|---|
| Preflight required objects | All `OK` |
| Main SQL notices | Reaches `HEU_STEP110_CHECKPOINT_06_CONTROL_CHECKS_SEEDED` |
| P2-19 source count | More than 0 |
| P2-19 check count | More than 0 |
| Payout gate check count | 2 |
| Trigger status | User triggers on `ttgdtx_source_control_checks` are `ENABLED` after run |

## UAT Cases

| Case | Expected result |
|---|---|
| BBNT missing | P2-15/P2-17 remain blocked |
| Partner invoice missing | P2-15/P2-17 remain blocked |
| Collection invoice policy unresolved | P2-13/P2-14/P2-15 remain blocked |
| Account freeze metadata only | No bank operation is executed by the app |
| Collateral release metadata only | Legal-finance release is not mixed with tuition-account release |

## Sign-Off

UAT can be marked internally acceptable only after IT/Data, KHTC, Phap Che and Audit confirm the postflight output and no raw sensitive values were copied into repo, chat, logs or client UI.
