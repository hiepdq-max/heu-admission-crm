# HEU STAGE 006 - Cross-module UAT and Rollback Design

Task ID: HEU-STAGE-006-CROSS-MODULE-UAT-AND-ROLLBACK-DESIGN
Date: 2026-07-14
Status: DRAFT_UAT_DESIGN
Production status: NO-GO

## Scope

This pack defines the cross-module checks after the individual module packs
pass. It uses only synthetic labels and metadata. It does not approve owner
UAT, import raw data, run migration, pay money or deploy production.

## Cross-module matrix

| Case | Check | Expected result |
|---|---|---|
| CROSS-UAT-01 | Admission to CTHSSV query | Scope boundary denies or empties |
| CROSS-UAT-02 | CTHSSV to KHTC query | Scope boundary denies or empties |
| CROSS-UAT-03 | KHTC to admission query | Scope boundary denies or empties |
| CROSS-UAT-04 | Training to finance query | Scope boundary denies or empties |
| CROSS-UAT-05 | BGH hot-spot view | Read-only aggregate only |
| CROSS-UAT-06 | Task Center department queue | Department filter cannot grant access |
| CROSS-UAT-07 | Workspace query tamper | Context wins; no broad fallback |
| CROSS-UAT-08 | Failed module confirmation | Later module remains closed |
| CROSS-UAT-09 | Rollback after scope failure | Identity/module is disabled or unlinked |
| CROSS-UAT-10 | Evidence review | Redacted trace only; no raw payload |

## Rollback contract

Rollback is ordered: stop the affected lane, keep user inactive, disable or
unlink the pilot identity, revoke session if needed, preserve redacted trace,
and return the module/task to `CHO_XAC_NHAN` or `NO_GO`. No hard delete and no
permission widening is allowed.

## Exit gate

All ten cases require actual controlled evidence, owner review, IT_DATA scope
review, Audit trace review and a documented rollback result. Static checks only
prove that this design is present. Staging and production remain closed.

Next task: `HEU-STAGE-007-BGH-FINANCE-HOU-CONTROL-READINESS`.
