# Rollback And Backup Note 2026-07-07

Task ID: HEU-CONTROL-001-BOOTSTRAP-GIT-SCOPE-REGISTER
Repository: heu-admission-crm
Branch: hardening/ttgdtx-9plus-pilot
Status: DRAFT_CONTROL

## 1. Purpose

This note defines the minimum rollback and backup expectations before any
follow-up task modifies or executes high-risk worktree groups.

This note does not itself create backups, run migrations, restore data, approve
production, approve finance action, or accept evidence.

## 2. Existing Snapshot

| Snapshot | Status | Use |
|---|---|---|
| `D:\Web app HEU\HEU_CODEX_RESTART_SNAPSHOT_20260707_142046` | Exists at classification time | Reference snapshot for restart and worktree classification context |

## 3. Rollback By Group

| Group | Rollback approach | Backup required before execution? | Owner lane |
|---|---|---|---|
| docs | Revert PR or restore changed docs from Git | No DB backup | Audit + PHAP_CHE + module owners |
| scripts | Revert PR; rerun focused script checks after revert | No DB backup | IT_DATA + Audit |
| config | Revert PR; rerun focused build/runtime checks with `npm.cmd` | No DB backup, but keep config diff small | IT_DATA + DevOps/Codex operator |
| codex | Revert PR or keep local-only if not intended for repo | No DB backup | Codex operator + IT_DATA + Audit |
| database | Do not execute until backup, restore proof, migration order, rollback SQL or revert plan exists | Yes, mandatory | IT_DATA + Audit + PHAP_CHE + KHTC |
| app | Revert PR; verify route/action behavior with focused checks | Required before real data mutation | IT_DATA + module owners + Audit |
| components | Revert PR; visual/route verification after revert if UI changed | Usually no DB backup | IT_DATA + module owners |
| other | Revert PR; run permission/scope checks where shared logic changed | Required before real access changes | IT_DATA + PHAP_CHE + Audit |

## 4. Database And Finance Stop Rules

- Do not run `supabase db push`.
- Do not run production migrations.
- Do not run SQL against production.
- Do not execute TTGDTX payout, payment request approval, reconciliation lock,
  receivable creation, debt clearing, COM calculation finalization, or bank
  transfer workflows without signed UAT, backup, rollback, and owner approval.
- Do not treat a docs/script PASS_LOCAL check as permission to mutate finance
  or production data.

## 5. Evidence Handling

- Raw evidence, bank statements, CCCD, phone, payment source files, raw lead
  exports, and student personal data must stay outside Git, Codex, and chat.
- Only sanitized metadata, controlled evidence references, and owner-approved
  evidence IDs may be recorded in repository docs.
- Evidence acceptance remains an external owner/audit decision.

## 6. Minimum Backup Gate Before High-Risk Execution

| Gate | Required before running high-risk change |
|---|---|
| Backup target identity | Confirm environment and database target |
| Backup evidence | Record backup ID/path outside Git if sensitive |
| Restore smoke proof | Confirm restore path with non-production or approved dry-run evidence |
| Migration order | Confirm exact SQL order and rollback note |
| Owner approval | BGH/authorized owner approval outside Codex/chat where required |
| Audit trail | Record who approved, what changed, when, and rollback owner |

## 7. Local Conclusion

Current control-package status: DAT_TAM_THOI for documentation routing only.

Production remains NO-GO. Database, finance, scope, and config changes remain
CAN_SUA/NO_GO until their own review, backup, rollback, and focused verification
are completed.
