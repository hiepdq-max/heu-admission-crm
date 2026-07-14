# HEU USER 005 - Synthetic Auth Operator Preflight

Task ID: HEU-USER-005-SYNTHETIC-AUTH-OPERATOR-PREFLIGHT
Date: 2026-07-14
Status: PASS_LOCAL_PREFLIGHT
Provisioning status: NOT_APPLIED
Production status: NO-GO

## Boundary

Five candidates are represented only by opaque labels `U012` through `U016`.
No email, password, token, Auth user, profile or scope is created or changed.

## Simulated sequence

Each candidate is checked through owner mapping, Auth placeholder, profile-link
placeholder, position/role/scope check, initial `INACTIVE` state, positive and
negative scope UAT placeholders, and disable/unlink rollback placeholder.

## Gate

This preflight proves only that the operator sequence is complete. Real
provisioning remains `NO_GO` until IT_DATA, Audit and Owner verify Auth origin,
redirect allowlist, server-only boundary, profile link, scope behavior and
rollback. All candidates remain `INACTIVE`.

Next task: `HEU-USER-006-ONE-SYNTHETIC-ACCOUNT-UAT-DESIGN`.
