# HEU Auth Password Reset Handoff - 2026-07-03

Status: PASS_LOCAL_HANDOFF

Production status: NO-GO

Scope: P0-17 user account security support for password reset routing.

## Packaged Behavior

- Settings password-reset action now sends Supabase Auth recovery mail with a
  controlled callback route.
- `/auth/callback` exchanges the recovery code, rejects unsafe external `next`
  values and redirects only to an internal path.
- `/auth/update-password` lets the signed recovery session set a new password,
  then signs out and returns to login.

## Boundary

This handoff does not create users, assign roles, set passwords for another
person, collect passwords, store reset links, paste OTPs, execute UAT, accept
evidence, approve finance reliance, approve owner GO/NO-GO or mark production
GO.

Do not paste password reset links, OTPs, temporary passwords, service-role keys,
raw PII or screenshots into Git, Codex or chat.

## Local Checks

- `npm.cmd run audit:heu-user-account-security`
- `npm.cmd run audit:heu-vietnamese-text-encoding`
- `npm.cmd run audit:heu-role-scope-uat-pack`
- `npm.cmd run audit:ttgdtx-production-readiness-guard`
- `npm.cmd run audit:heu-finance-desk`
- `npm.cmd run audit:heu-current-state-inventory`
- `npm.cmd run audit:heu-implementation-log`
- `npm.cmd run audit:ttgdtx-release-gates`
- `npm.cmd run lint`
- `npm.cmd run build`
- `git diff --check`
- `git diff --cached --check`

PASS_LOCAL here means route packaging only. Real user cutover remains blocked
until signed P6-04 UAT, owner-approved scope repair, negative-control proof and
owner cutover decision are complete.
