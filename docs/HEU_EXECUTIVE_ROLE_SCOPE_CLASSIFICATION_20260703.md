# HEU Executive Role Scope Classification - 2026-07-03

Status: PASS_LOCAL_CLASSIFICATION

Production status: NO-GO

Scope: P0-17 user/role/scope checker classification.

## Decision

`HIEU_TRUONG` and `PHO_HIEU_TRUONG` are treated as executive/BGH-equivalent
roles in local scope-readiness checks. They remain privileged governance roles,
not daily operating profiles for lead visibility and business-scope repair
counts.

## Local Behavior

- `check:heu-permission-scope-readiness` excludes executive/BGH-equivalent
  roles from non-ADMIN/BGH daily scope baseline counts.
- `check:heu-lead-import-scope-readiness` uses the same privileged-role
  classification before import/cutover routing.

## Boundary

This classification does not grant access, assign roles, create users, change
lead visibility, add segment or partner scope, execute UAT, accept evidence,
approve finance reliance, approve owner GO/NO-GO or mark production GO.

If an executive account is used for real operation, owner must still approve the
lane outside Git/Codex/chat and run P6-04 role/scope UAT with controlled
evidence.
