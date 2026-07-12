# HEU SEC 001 Security Definer Execute Exposure Audit

Task ID: HEU-SEC-001-SECURITY-DEFINER-EXECUTE-EXPOSURE-AUDIT
Date: 2026-07-12
Status: DRAFT_CONTROL
Stage: Stage D - internal controlled test only
Production status: NO-GO

## 1. Muc tieu

Khoa pham vi ra soat quyen `EXECUTE` cua cac function `SECURITY DEFINER`
truoc khi HEU mo UAT user that. Tai lieu nay chi ghi metadata va thu tu xu ly;
khong chay `REVOKE`, `GRANT`, migration, DDL hoac database mutation.

AI/Codex chi doc, kiem tra va soan nhap. Khong tu phe duyet security exception,
khong tu thay Owner, IT_DATA, Audit hoac PHAP_CHE.

## 2. Live metadata snapshot

Read-only Supabase Advisors va catalog query ngay 2026-07-12:

| Chi so | Ket qua |
| --- | ---: |
| Security advisor findings | 338 |
| Security ERROR | 1 |
| Security WARN | 337 |
| Public `SECURITY DEFINER` functions | 166 |
| Functions executable by `anon` | 166 |
| Functions executable by `authenticated` | 166 |
| Mutable-search-path function warnings | 4 |
| Security-definer view errors | 1 |
| Performance advisor findings | 535 |
| Unindexed foreign-key notices | 270 |
| Multiple permissive policy warnings | 125 |
| Auth RLS init-plan warnings | 21 |
| Unused-index notices | 119 |

The security-definer view error is:
`public.ttgdtx_p2_19_real_data_evidence_status`.

Priority function examples include:

- `public.assign_heu_position_by_email(text,text,text)`
- `public.upsert_user_profile_from_auth(text,text,text,uuid,uuid,uuid)`
- `public.record_ttgdtx_partner_payment_disbursement(...)`
- `public.create_short_payment(...)`

No email, name, UUID, phone, student data, bank data, token, secret or raw
evidence is recorded in this document.

## 3. Counterevidence and severity calibration

The advisor result does not prove that all 166 functions are directly
exploitable. Focused catalog review found that position assignment, short-course
payment and TTGDTX disbursement functions contain actor and permission checks
plus fail-closed signals.

`upsert_user_profile_from_auth` calls `public.is_admin()`, so an anonymous
caller should fail the internal admin gate. However, it remains callable by
`anon` because PostgreSQL grants function execute to `PUBLIC` by default
unless explicitly revoked. Its legacy behavior also writes an `ACTIVE`
profile, so the application path has already been disabled in the user-core
hardening stack.

Decision:

- Not all 166 findings are classified as confirmed exploits.
- Broad anonymous execute remains unnecessary attack surface and a P1
  hardening blocker.
- The security-definer evidence-status view is a P0 review blocker.
- User UAT and Production remain `NO_GO` until the targeted privilege matrix
  is reviewed and negative tests pass.

## 4. Separate live identity blocker

Anonymous metadata review also found one `ACTIVE` profile with no active
position assignment. Its Auth identity is not currently banned. The role has
143 active role permissions, including 51 permissions matching
`approve/pay/manage`.

No account identifier is stored here. Owner must choose one controlled action:

1. Assign exactly one approved position and run negative-access UAT; or
2. Ban Auth and set the profile `INACTIVE` until owner mapping is complete.

There is currently no active master position whose default role is `ADMIN`.
The account must not be mapped to an unrelated department position.

## 5. Required remediation order

1. Freeze user UAT and Production GO.
2. Export a metadata-only inventory of exact function signatures, owner,
   security mode, search path and current grantees.
3. Classify each function as public, anonymous, authenticated, internal
   service-only or retire.
4. Prioritize mutation and approval functions before read-only helpers.
5. Draft a separate non-executable privilege patch for review.
6. Revoke execute from `PUBLIC` and `anon` only after dependency review.
7. Grant `authenticated` only where the function is an intended signed-in
   API and has an actor/permission guard.
8. Prefer `SECURITY INVOKER`; when `SECURITY DEFINER` is required, use a
   fixed empty search path and fully qualified objects.
9. Convert the evidence-status view to an approved security-invoker design or
   revoke exposed access.
10. Test as `anon`, valid user, wrong-position user, expired delegation,
    authorized operator and privileged owner using synthetic identities.
11. Run Supabase security/performance advisors again and compare counts.
12. Only after security gates pass may performance index/policy consolidation
    be considered.

No bulk revoke is approved by this document. Revoking all functions without a
dependency map can break login, RLS helpers and normal application routes.

## 6. Performance order

Security correctness comes first. Performance work must then use measured query
plans and authenticated p50/p95:

1. Fix `auth_rls_initplan` patterns on user/scope tables.
2. Review multiple permissive policies and consolidate only equivalent rules.
3. Review foreign-key indexes against real query predicates.
4. Never delete an index only because an advisor marks it unused.
5. Implement the effective-position single-RPC only after the privilege and
   negative-access gates are green.

## 7. Backup and rollback contract

Before any privilege migration:

- export current routine/view privileges as metadata evidence outside Git;
- record exact function signatures and grants;
- prepare inverse `GRANT` statements for rollback;
- use a staging or controlled maintenance window;
- test login, workspace context, RLS helpers, position assignment and finance
  read-only routes;
- stop immediately if signed-in routes lose required access.

No original row, audit event, finance record or evidence record may be deleted.

## 8. Verification

```powershell
node scripts/check-heu-security-definer-execute-exposure-audit.mjs
npm.cmd run audit:heu-user-account-security
npm.cmd run audit:heu-git-hygiene
```

Expected result:

```text
HEU_SEC_001=PASS_LOCAL_DRAFT_CONTROL
DATABASE_WRITE=NOT_PERFORMED
MIGRATION=NO_GO
USER_UAT=NO_GO
PRODUCTION=NO_GO
```

## 9. Decision

| Item | Result |
| --- | --- |
| Live metadata review | PASS_READ_ONLY |
| Counterevidence review | COMPLETED |
| Docs/static checker | DAT_TAM_THOI after local checks |
| Bulk privilege change | NO_GO |
| Database migration | NO_GO |
| User UAT | NO_GO |
| Production | NO-GO |
