# HEU App Shell 001 Review Checklist

Task ID: HEU-APP-SHELL-001-REVIEW-CHECKLIST
Date: 2026-07-09
Repository: heu-admission-crm
Branch: codex/heu/app-shell-modular-monolith-review
Status: DRAFT_REVIEW_CHECKLIST
Production status: NO-GO

## 1. Purpose

This checklist gives IT_DATA and Audit a focused review path for the AppShell /
Data Confirmation Draft PR.

It does not approve production, UAT, evidence acceptance, finance action, user
grant, migration, owner GO/NO-GO or BGH signoff.

## 2. IT_DATA Review

| Check ID | What to verify | Expected result |
|---|---|---|
| ITDATA-APP-01 | `lib/heu-workspace-context.ts` resolves role and workspace before route work | PASS / CAN_SUA / NO_GO |
| ITDATA-APP-02 | `noBroadFallback: true` is preserved | PASS / CAN_SUA / NO_GO |
| ITDATA-APP-03 | `canWriteScopedDraft` requires a scoped workspace and write permission | PASS / CAN_SUA / NO_GO |
| ITDATA-APP-04 | `canImportLeadDraft` requires a scoped workspace and `leads.import` | PASS / CAN_SUA / NO_GO |
| ITDATA-APP-05 | `canAcceptCthssvHandover` is separate from broad review permission | PASS / CAN_SUA / NO_GO |
| ITDATA-APP-06 | `/data-confirmation` does not query task rows or business tables | PASS / CAN_SUA / NO_GO |
| ITDATA-APP-07 | AppShell and dashboard preserve selected `segment` in quick links | PASS / CAN_SUA / NO_GO |
| ITDATA-APP-08 | AppShell menu uses permission/role allowlists before showing module links | PASS / CAN_SUA / NO_GO |
| ITDATA-APP-09 | `Tao lead` quick link requires lead write permission, not only non-executive role | PASS / CAN_SUA / NO_GO |
| ITDATA-APP-10 | No `.env`, SQL, migration, deploy config or secret is included | PASS / CAN_SUA / NO_GO |

## 3. Audit Review

| Check ID | What to verify | Expected result |
|---|---|---|
| AUDIT-APP-01 | `check:heu-app-shell-draft-pr-readiness` passes in default mode | PASS / CAN_SUA / NO_GO |
| AUDIT-APP-02 | `check:heu-data-confirmation-task-center` passes | PASS / CAN_SUA / NO_GO |
| AUDIT-APP-03 | Runtime lint/build is rerun before Ready in dependency-complete checkout or CI | PASS / CAN_SUA / NO_GO |
| AUDIT-APP-04 | `Data Confirmation` is clearly read-only/ref-only | PASS / CAN_SUA / NO_GO |
| AUDIT-APP-05 | `DUNG`, `CAN_SUA`, `KHONG_THUOC_TOI` are status contract only, not live mutation | PASS / CAN_SUA / NO_GO |
| AUDIT-APP-06 | Production remains `NO-GO` in handoff, PR body and decision docs | PASS / CAN_SUA / NO_GO |
| AUDIT-APP-07 | Stage manifest exactly matches changed/staged file set | PASS / CAN_SUA / NO_GO |
| AUDIT-APP-08 | Rollback path does not require database rollback | PASS / CAN_SUA / NO_GO |

## 4. Stop Conditions

Do not mark the PR Ready if any condition appears:

- `/data-confirmation` starts reading real task rows without approved data
  contract.
- Any mutation is added to Data Confirmation.
- A non-ADMIN/BGH user can see global business rows without explicit owner
  approval.
- A user can see module menus unrelated to their permission/role lane.
- A read-only lead user can see the `Tao lead` quick link.
- Finance user can pay, clear debt, approve COM, post voucher or issue bank
  instruction.
- Raw PII, CCCD, bank data, voucher, password, token, OTP, invite/reset link or
  raw evidence enters Git/Codex/chat.
- Runtime lint/build remains NO_GO and the PR is moved out of Draft anyway.
- Any reviewer treats PASS_LOCAL as production readiness, UAT pass, evidence
  acceptance, finance reliance or owner GO.

## 5. Required Commands Before Ready Review

Default local gate:

```powershell
npm.cmd run check:heu-app-shell-draft-pr-readiness
npm.cmd run check:heu-data-confirmation-task-center
git diff --cached --check
```

Runtime gate before moving out of Draft:

```powershell
npm.cmd run check:heu-app-shell-draft-pr-readiness -- --runtime
npm.cmd run lint
npm.cmd run build -- --webpack
```

Broad docs/audit gate only when docs/audit alignment is in scope:

```powershell
npm.cmd run check:heu-app-shell-draft-pr-readiness -- --broad-security
```

If the PR is not staged yet, replace `git diff --cached --check` with:

```powershell
git diff --check
```

## 6. Required Review Result

Before moving the PR out of Draft:

```text
IT_DATA: PASS / CAN_SUA / NO_GO
Audit: PASS / CAN_SUA / NO_GO
PHAP_CHE: advisory if SOP/legal reliance is claimed
BGH/Owner: architecture direction only, not production approval
```

## 7. Status

Review checklist status: `CAN_SUA`.

System status: `CAN_SUA`.

Production status: `NO-GO`.
