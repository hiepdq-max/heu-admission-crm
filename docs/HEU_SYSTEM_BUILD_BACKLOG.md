# HEU System Build Backlog

Mode: production-system backlog with risk controls. AI/Codex may draft, check and implement local safe changes, but may not approve business decisions or deploy production.

## P0 - Repo Stabilization

| ID | Item | Owner | Status | Gate |
|---|---|---|---|---|
| P0-01 | Keep branch `hardening/ttgdtx-9plus-pilot` as working branch | IT/Data | PASS_LOCAL | No force push, no main/master push |
| P0-02 | Split dirty working tree by scope: docs, TTGDTX UI, TTGDTX SQL, CRM shared, audit scripts | IT/Data | IN_PROGRESS | Review before commit |
| P0-03 | Maintain migration order and production No-Go checklist | IT/Data + BGH | IN_PROGRESS | Backup and restore dry-run before production |
| P0-04 | Keep generated logs out of commits | IT/Data | OPEN | `.gitignore`/manual review |
| P0-05 | Record every phase in `HEU_IMPLEMENTATION_LOG.md` | Codex + IT/Data | IN_PROGRESS | Log before conclusion |
| P0-06 | Freeze code edits until inventory/backlog is current | Codex + IT/Data | PASS_LOCAL | Current P0 docs updated after `28b8e7d` |

## P1 - Data Foundation

| ID | Item | Owner | Status | Gate |
|---|---|---|---|---|
| P1-01 | Define `HEU_DATA_MODEL_V1.md` | IT/Data + Process owners | IN_PROGRESS | Data master before automation |
| P1-02 | Define `HEU_DATA_DICTIONARY_V1.md` | IT/Data | IN_PROGRESS | Stable business codes |
| P1-03 | Define `HEU_ROLE_PERMISSION_MATRIX_V1.md` | IT/Data + BGH | IN_PROGRESS | Role and scope before finance access |
| P1-04 | Map existing SQL objects to master names | IT/Data | OPEN | No production schema change yet |
| P1-05 | Build anonymized real-like UAT pack for Phu-Xuyen-like cases | KHTC + IT/Data + Audit | OPEN | No raw PII/bank data |
| P1-06 | Keep TTGDTX source/evidence model generic across centers | IT/Data | IN_PROGRESS | Product code must not hard-code a reference center |

## P2 - TTGDTX/9+ Pilot

| ID | Item | Owner | Status | Gate |
|---|---|---|---|---|
| P2-01 | Contract/partner master | Phap Che + KHTC | BUILT_INTERNAL | Human approval for legal records |
| P2-02 | Tuition policy master | KHTC | BUILT_INTERNAL | Approved policy version |
| P2-03 | Student receivables | KHTC | BUILT_INTERNAL | No duplicate receivable test |
| P2-05 | Receivable gate | KHTC + IT/Data | IN_PROGRESS | Gate before posting; Step91 is migration candidate only |
| P2-06 | Import staging/control | IT/Data + KHTC | BUILT_INTERNAL | Source file registry and validation |
| P2-12 | TTGDTX master/dropdown control | Tuyen sinh + Phap Che + IT/Data | IN_PROGRESS | Step99 is migration candidate only; no production run from Codex |
| P2-10 | Tuition collection | KHTC | BUILT_INTERNAL | Invoice/receipt decision required |
| P2-13 | Reconciliation | KHTC + Audit | BUILT_INTERNAL | Lock after approval |
| P2-15 | Partner payment request | KHTC + Phap Che | BUILT_INTERNAL | BBNT/invoice evidence |
| P2-17 | Partner payout | KHTC + BGH | BUILT_INTERNAL | No duplicate payout, approval only |
| P2-18 | Accounting dashboard | KHTC + BGH | BUILT_INTERNAL | Authorized-user UAT |
| P2-19 | Real-data evidence metadata | IT/Data + Audit | BUILT_INTERNAL | Metadata only, no raw sensitive import |

## P3 - CRM/Tuyen Sinh

| ID | Item | Owner | Status | Gate |
|---|---|---|---|---|
| P3-01 | Lead lifecycle standard | Tuyen sinh | EXISTING_PARTIAL | No raw form dump into AI |
| P3-02 | Lead-to-student handover | Tuyen sinh + CTHSSV + Dao tao | OPEN | Handover checklist |
| P3-03 | Finance handover trigger | Tuyen sinh + KHTC | OPEN | Receivable creation gate |

## P4 - Finance/Receivable

| ID | Item | Owner | Status | Gate |
|---|---|---|---|---|
| P4-01 | Receivable/payment status lifecycle | KHTC | IN_PROGRESS | Audit columns and source evidence |
| P4-02 | Invoice/receipt policy matrix | KHTC + Phap Che | OPEN | Required before real collection UAT |
| P4-03 | Bank statement handling policy | KHTC + IT/Data | OPEN | No raw bank data in repo/chat |
| P4-04 | Period lock and adjustment policy | KHTC + Audit | OPEN | Human approval |

## P5 - Dashboard/BGH

| ID | Item | Owner | Status | Gate |
|---|---|---|---|---|
| P5-01 | TTGDTX accounting dashboard UAT | KHTC + BGH | OPEN | Authorized/out-of-scope role tests |
| P5-02 | BGH operating dashboard specification | BGH + IT/Data | OPEN | Workflow/data available first |

## P6 - Audit/Governance

| ID | Item | Owner | Status | Gate |
|---|---|---|---|---|
| P6-01 | Static hard-delete audit | IT/Data | PASS_LOCAL | Keep audit script green |
| P6-02 | TTGDTX cascade audit | IT/Data | PASS_LOCAL | No `on delete cascade` in Step90-Step110 |
| P6-03 | TTGDTX audit-log coverage | IT/Data | PASS_LOCAL | New TTGDTX write tables need triggers |
| P6-04 | Role-scope UAT | IT/Data + Process owners | OPEN | Signed UAT required |
| P6-05 | Package TTGDTX local audit scripts | IT/Data | PASS_LOCAL | npm scripts must point to committed local guards |

## P7 - AI Agent Layer

| ID | Item | Owner | Status | Gate |
|---|---|---|---|---|
| P7-01 | AI assistant policy | BGH + IT/Data | OPEN | AI drafts/checks only |
| P7-02 | AI task checklist generator | IT/Data | LATER | Workflow/logs first |
| P7-03 | AI risk suggestion board | Audit + IT/Data | LATER | No autonomous approval |
