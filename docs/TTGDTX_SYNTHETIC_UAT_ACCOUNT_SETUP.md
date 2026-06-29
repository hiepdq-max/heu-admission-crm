# TTGDTX Synthetic UAT Account Setup

Status: DRAFT_CONTROL
Date: 2026-06-25
Mode: UAT/staging only. This document does not approve production access.

## 1. Purpose

This setup prepares synthetic users for `docs/TTGDTX_ROLE_SCOPE_UAT_RUNBOOK.md`.
It exists so the browser UAT can continue without sharing real passwords,
temporary passwords, activation/invite links or using production staff accounts.

## 2. Safety Rules

- Use synthetic UAT users only.
- Do not use real student, parent, CCCD, bank or staff private data.
- Do not send real passwords, temporary passwords or account activation/invite
  links into Codex/chat.
- Do not paste service-role keys into Codex/chat.
- Do not reuse production passwords.
- Do not mark production GO from this setup. It only prepares test accounts.

## 3. Required Accounts

Use a disposable test domain or plus-addressing owned by HEU IT/Data.

| Synthetic ID | Suggested email | Role code | TTGDTX segment scope | Expected use |
|---|---|---|---|---|
| `UAT_ADMIN` | `uat.admin+ttgdtx@heu.test` | `ADMIN` | Optional | Open all TTGDTX pages |
| `UAT_BGH` | `uat.bgh+ttgdtx@heu.test` | `BGH` | Optional | Read dashboards/reports; no daily entry unless allowed |
| `UAT_KHTC` | `uat.khtc+ttgdtx@heu.test` | `ACCOUNTING` or `KHTC` | Active TTGDTX segment | Finance collection/reconciliation/payment flow |
| `UAT_TUYEN_SINH` | `uat.tuyensinh+ttgdtx@heu.test` | `ADMISSION_HEAD` or `COUNSELOR` | Active TTGDTX segment | Confirm finance/payment pages are blocked |
| `UAT_PHAP_CHE` | `uat.phapche+ttgdtx@heu.test` | `LEGAL` or `PHAP_CHE` | Active TTGDTX segment | Contract/source checks; finance dashboard blocked unless explicitly allowed |
| `UAT_OUT_OF_SCOPE` | `uat.outscope+ttgdtx@heu.test` | `ACCOUNTING` or `KHTC` | None | Confirm scoped TTGDTX data is blocked |

If a listed role code does not exist in the target database, use the closest
existing role with the same business permissions and record that mapping in the
UAT evidence.

## 4. Human Setup Flow

1. In Supabase Auth, create the six synthetic users.
2. Set temporary UAT-only passwords in the password manager controlled by
   IT/Data. Do not paste those passwords or activation/invite links into
   Codex/chat.
3. In the application or SQL console, link each Auth user to `public.users_profile`
   with the target role.
4. Assign the active `TC9_TTGDTX_LINKED` segment in
   `public.user_admission_segment_scopes` for every scoped account except
   `UAT_OUT_OF_SCOPE`.
5. Keep `UAT_OUT_OF_SCOPE` without an active TTGDTX segment scope.
6. Run the verification query below and attach the output to the UAT evidence.
7. Log in one account at a time in the browser and execute
   `docs/TTGDTX_ROLE_SCOPE_UAT_RUNBOOK.md`.

## 5. Verification Query

Run this read-only query after account setup. Replace the email list if the
operator used a different synthetic domain.

```sql
with target_users(email) as (
  values
    ('uat.admin+ttgdtx@heu.test'),
    ('uat.bgh+ttgdtx@heu.test'),
    ('uat.khtc+ttgdtx@heu.test'),
    ('uat.tuyensinh+ttgdtx@heu.test'),
    ('uat.phapche+ttgdtx@heu.test'),
    ('uat.outscope+ttgdtx@heu.test')
),
ttgdtx_segment as (
  select id, segment_code, segment_name
  from public.admission_segments
  where segment_code = 'TC9_TTGDTX_LINKED'
    and status = 'ACTIVE'
  limit 1
)
select
  target_users.email,
  coalesce(up.status::text, 'MISSING_PROFILE') as profile_status,
  r.code as role_code,
  coalesce(
    string_agg(distinct arp.permission, ', ' order by arp.permission)
      filter (where arp.permission like 'ttgdtx.%' or arp.permission like 'reports.%' or arp.permission = 'audit.read'),
    ''
  ) as relevant_permissions,
  exists (
    select 1
    from public.user_admission_segment_scopes scope
    join ttgdtx_segment segment on segment.id = scope.segment_id
    where scope.user_id = up.id
      and scope.status = 'ACTIVE'
  ) as has_active_ttgdtx_scope
from target_users
left join public.users_profile up
  on lower(up.email) = lower(target_users.email)
left join public.roles r
  on r.id = up.role_id
left join public.active_role_permissions arp
  on arp.role_id = r.id
group by target_users.email, up.status, up.id, r.code
order by target_users.email;
```

Expected verification:

| Synthetic ID | Expected profile | Expected scope |
|---|---|---|
| `UAT_ADMIN` | Active profile, `ADMIN` | Optional |
| `UAT_BGH` | Active profile, `BGH` | Optional |
| `UAT_KHTC` | Active finance profile | `true` |
| `UAT_TUYEN_SINH` | Active admission profile | `true` |
| `UAT_PHAP_CHE` | Active legal profile | `true` |
| `UAT_OUT_OF_SCOPE` | Active finance profile | `false` |

## 6. Evidence Folder Rule

Store screenshots and query exports in the UAT evidence location selected by
IT/Data. Keep legal contract evidence, acceptance/payment evidence and registry
metadata separate.

## 7. Completion Rule

This setup is complete only when:

1. All six synthetic users exist.
2. The verification query output matches the expected role/scope matrix.
3. No real credentials or private data were exposed.
4. The browser UAT evidence is attached to the production checklist.
