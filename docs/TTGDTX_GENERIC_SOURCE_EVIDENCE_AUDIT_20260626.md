# TTGDTX Generic Source Evidence Audit 20260626

Mode: control audit for product generalization. No production migration was run.

## 1. Reason

TTGDTX Phu Xuyen was provided as a real-world reference case. The HEU product must support many TTGDTX centers and partners, so source/evidence design must stay generic.

## 2. Audit Rule

| Layer | Rule |
|---|---|
| Product code under `app`, `components`, `lib` | Must not hard-code a specific center/source case such as Phu Xuyen |
| Database evidence metadata | May reference a real-world source pack as metadata/checkpoint only |
| Documentation | May mention Phu Xuyen as reference evidence, risk example or anonymized UAT pattern |
| UI wording | Must say source pack/evidence generically unless showing a specific record from data |

## 3. What Was Found

| Location | Finding | Decision |
|---|---|---|
| `app/ttgdtx/source-control/page.tsx` | Static UI copy said the P2-19 layer was metadata for Phu Xuyen | Generalized UI copy to source packs that are real or anonymized |
| `database/step110_ttgdtx_real_data_evidence_metadata_p2_19.sql` | Contains Phu-Xuyen-specific source metadata/checks | Allowed for now as evidence metadata only; do not convert into generic business logic without a migration plan |
| `docs/*` | Several docs reference Phu Xuyen-like cases | Allowed as real-world design reference and anonymized UAT input |

## 4. New Guard

Added `scripts/audit-ttgdtx-generic-source-evidence.mjs`.

The guard scans:

- `app`
- `components`
- `lib`

It fails if product code hard-codes:

- `PHU_XUYEN`
- `P2_19_PHU`
- `Phu Xuyen`
- `Phu-Xuyen`
- `Phú Xuyên`
- `Phú-Xuyên`

## 5. Next Control

Before production or broad UAT, Step110 source metadata should be reviewed and either:

1. Kept as a clearly labeled real-world reference source pack, or
2. Migrated to a generic `P2_19_REAL_DATA_REFERENCE_SOURCE_PACK` pattern with backward-compatible handling.

Codex must not rename production source codes without a migration and rollback note.

