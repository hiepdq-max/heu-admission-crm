# HEU Daily Email Dispatch Handoff 2026-07-02

Status: PASS_LOCAL_CONFIG_HANDOFF
Owner: HEU IT_DATA + BGH + KHTC + PHAP_CHE + Audit
Production status: NO-GO
Decision values: EMAIL_DISPATCH_HANDOFF_READY / EMAIL_CONFIG_REQUIRED / BLOCKED

## 1. Purpose

Define the safe handoff for future daily PASS_LOCAL email dispatch. The goal is
to let HEU IT_DATA configure the mail route outside Git/Codex/chat while the
software keeps reporting what would be sent, who should receive it and which
authority must confirm it.

This handoff does not send email, create real tasks, create accounts, collect
passwords, accept UAT, accept evidence, approve finance action, approve owner
GO/NO-GO or mark production GO.

## 2. Authority Split

| Owner | What they may confirm | What stays blocked |
|---|---|---|
| HEU IT_DATA | GitHub Actions variables/secrets are configured outside Git/Codex/chat | Secret values in Git, docs, chat, workflow logs or screenshots |
| BGH | Recipient lane policy and daily report audience labels | Treating email receipt as owner GO/NO-GO |
| KHTC | Finance trial recipient lane and read-only trial notes | Finance approval, voucher posting, bank transfer or payment reliance |
| PHAP_CHE | Legal/SOP recipient lane and stop conditions | Legal conclusion from AI/Codex |
| Audit | Evidence/redaction recipient lane and proof reference rules | Raw evidence, raw PII, bank statements or vouchers in email |

## 3. Required GitHub Actions Names

Values must be configured only by HEU IT_DATA in GitHub Actions
variables/secrets. This file records names only.

| Name | Kind | Purpose |
|---|---|---|
| HEU_DAILY_REPORT_TO | GitHub Actions variable | Approved recipient aliases or groups |
| HEU_DAILY_REPORT_FROM | GitHub Actions variable | Approved sender identity |
| HEU_SMTP_HOST | GitHub Actions secret | Mail host value |
| HEU_SMTP_PORT | GitHub Actions variable | Mail port such as 587 when approved |
| HEU_SMTP_USERNAME | GitHub Actions secret | Mail username |
| HEU_SMTP_PASSWORD | GitHub Actions secret | Mail password or app password |

Allowed recipient labels for reporting are:

- BGH_DAILY_REPORT_ALIAS
- IT_DATA_BUILD_ALIAS
- KHTC_CONTROLLED_TRIAL_ALIAS
- PHAP_CHE_REVIEW_ALIAS
- AUDIT_REVIEW_ALIAS

Individual email addresses, private lists and SMTP values must stay outside
Git/Codex/chat and should be visible only to the authorized HEU IT_DATA owner.

## 4. Manual Enablement Checklist

| Check | Required result |
|---|---|
| EMAIL-DISPATCH-01 | BGH confirms approved recipient labels and scope outside Git/Codex/chat |
| EMAIL-DISPATCH-02 | HEU IT_DATA sets variables/secrets in GitHub Actions without exposing values |
| EMAIL-DISPATCH-03 | `npm.cmd run report:heu-daily-dry-run` remains dry-run and contains no forbidden content |
| EMAIL-DISPATCH-04 | `npm.cmd run report:heu-email-readiness` returns either EMAIL_CONFIG_REQUIRED or EMAIL_DISPATCH_HANDOFF_READY without printing values |
| EMAIL-DISPATCH-05 | First real sender change, if ever approved, must be a separate reviewed slice and disabled by default |
| EMAIL-DISPATCH-06 | Email receipt is not accepted as signed UAT, evidence acceptance, finance approval, owner GO/NO-GO or production GO |

## 5. Stop Conditions

Stop and return BLOCKED if any of these appear:

- A password, app password, SMTP value, OTP, invite link, reset link,
  service-role key, API key or private key is requested in Git/Codex/chat.
- A raw student record, CCCD, phone number, bank account, bank statement,
  voucher, raw payment data or raw signed evidence is requested in email.
- A recipient list is not approved by BGH and HEU IT_DATA.
- A request asks Codex to send the real email or create a real ticket/task.
- A request treats PASS_LOCAL, email delivery or GitHub Actions output as UAT
  approval, evidence acceptance, finance approval, owner GO/NO-GO or
  production GO.

## 6. Current Result

EMAIL_DISPATCH_HANDOFF_READY is a PASS_LOCAL_CONFIG_HANDOFF state only. It
means the handoff is documented and the readiness checker knows which controls
to print. The live readiness can still be EMAIL_CONFIG_REQUIRED until HEU
IT_DATA configures the required names outside Git/Codex/chat.

It does not approve production, UAT, evidence acceptance, finance approval,
owner GO/NO-GO or production GO.

Production remains NO-GO.
