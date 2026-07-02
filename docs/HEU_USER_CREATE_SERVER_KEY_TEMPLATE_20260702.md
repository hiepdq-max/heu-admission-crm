# HEU User Create Server Key Template

Status: PASS_LOCAL_TEMPLATE
Owner: IT_DATA + ADMIN
Production: NO-GO

## Purpose

Use this document as the safe placeholder checklist for configuring local or
server environment values needed by in-app user creation.

Do not commit `.env.local`. Do not paste secret values into Git, Codex/chat,
email, tickets, screenshots, docs or logs.

## Required Local Keys

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

`SUPABASE_SERVICE_ROLE_KEY` is server-only. It is required for automatic user
creation, but its value must stay outside Git/Codex/chat and outside normal
email.

## Safe Check

After IT_DATA configures the values on the machine/server, run:

```powershell
npm.cmd run check:heu-user-create-readiness
```

The check prints only READY/NO_GO statuses. It must not print secret values or
raw Supabase error messages.

## Boundary

This template does not create real users, receive passwords, send invites,
store keys, approve UAT, accept evidence, approve finance action, approve owner
GO/NO-GO or mark production GO.
