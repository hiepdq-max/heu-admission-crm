# HEU User Pilot 006 User Activation Worksheet Readiness

Task ID: HEU-USER-PILOT-006-USER-ACTIVATION-WORKSHEET-READINESS
Date: 2026-07-09
Repository: heu-admission-crm
Branch: codex/heu/user-activation-worksheet-readiness
Status: PASS_LOCAL_WORKSHEET
Production status: NO-GO

## 1. Purpose

Turn the Day-1 real-user pilot plan into a safe activation worksheet that
IT_DATA and Audit can review before any real user is activated.

This worksheet is a control artifact only. It does not create accounts, invite
users, set passwords, grant scope, execute UAT, accept evidence, approve owner
GO/NO-GO or mark production GO.

## 2. No-Secret Boundary

Do not paste any of the following into this worksheet, Git, Codex or chat:

- Real name, email, phone, CCCD, private address or raw profile ID.
- Password, temporary password, OTP, password reset link or account
  activation/invite link.
- Supabase service-role key, API key, private key or `.env.local` value.
- Raw student PII, bank data, voucher, payment evidence or source file body.

Use only safe seat labels, role codes, route labels, owner lanes and controlled
evidence IDs.

## 3. Worksheet Columns

Every pilot seat must have one row with these fields before live activation is
allowed:

| Field | Required value | Stop condition |
|---|---|---|
| `seat_label` | Safe label from HEU-USER-PILOT-001 | Raw name/email/profile ID appears |
| `owner_lane` | Owner lane approving the seat | Owner lane missing |
| `auth_profile_ref` | Redacted Auth/profile link evidence ID | Password/invite/reset link appears |
| `role_code` | Approved role code | Role missing or not owner approved |
| `department_scope` | Approved department/workspace scope | Scope missing or broad fallback |
| `business_scope_ref` | Segment/partner/workspace evidence ID | Business scope missing |
| `first_allowed_route` | First route for pilot use | Route not tied to role/scope |
| `negative_test_ref` | Required negative route/action proof | No negative-access proof |
| `controlled_evidence_id` | Safe evidence reference | Evidence ID missing or raw evidence pasted |
| `owner_result` | `PASS`, `CAN_SUA`, `NO_GO` or `BLOCKED_OWNER_DECISION` | Result inferred by Codex |

## 4. Pilot Seat Worksheet

| Seat label | Owner lane | First route | Required scope | Activation status |
|---|---|---|---|---|
| `PILOT-BGH-01` | BGH + Audit | `/`, `/reports` | Approved summary/read-only scope | `PENDING_OWNER_ACTIVATION` |
| `PILOT-ITDATA-01` | IT_DATA lead | `/settings`, system checks | System admin/control lane only | `PENDING_OWNER_ACTIVATION` |
| `PILOT-AUDIT-01` | Audit lead | `/audit` | Audit/control metadata only | `PENDING_OWNER_ACTIVATION` |
| `PILOT-PHAPCHE-01` | PHAP_CHE lead | legal/SOP refs | Legal/SOP review only | `PENDING_OWNER_ACTIVATION` |
| `PILOT-TS-01` | Tuyen sinh owner | `/leads`, `/data-confirmation` | Assigned segment/partner/workspace only | `PENDING_OWNER_ACTIVATION` |
| `PILOT-CTHSSV-01` | CTHSSV owner | `/cthssv`, `/data-confirmation` | CTHSSV department/scope only | `PENDING_OWNER_ACTIVATION` |
| `PILOT-DAO-01` | Dao tao owner | `/data-confirmation` | Dao tao department/scope only | `PENDING_OWNER_ACTIVATION` |
| `PILOT-KHOA-01` | Khoa owner | `/khoa`, `/data-confirmation` | Khoa department/scope only | `PENDING_OWNER_ACTIVATION` |
| `PILOT-KHTC-01` | KHTC + Audit | `/finance-desk` | Finance read-only summaries/evidence refs only | `PENDING_OWNER_ACTIVATION` |
| `PILOT-NEG-01` | IT_DATA + Audit | safe no-access/no-scope route | No broad business scope | `PENDING_OWNER_ACTIVATION` |

Optional expansion seats stay blocked until Batch A-D owners accept the first
ten labels:

| Seat label | Owner lane | Purpose | Activation status |
|---|---|---|---|
| `PILOT-TS-02` | Tuyen sinh owner | Same-department scope leak check | `BLOCKED_UNTIL_BATCH_A_D_REVIEW` |
| `PILOT-KHTC-02` | KHTC + Audit | Finance reviewer read-only check | `BLOCKED_UNTIL_BATCH_A_D_REVIEW` |

## 5. Activation Decision Gates

| Gate | Required before live use | Current local state |
|---|---|---|
| `ACTIVATION-WORKSHEET-01` | Worksheet uses safe labels only | `PASS_LOCAL` |
| `ACTIVATION-AUTH-02` | Auth/profile link evidence exists outside Git/Codex/chat | `NO_GO_EXTERNAL_ENV` |
| `ACTIVATION-SCOPE-03` | Role, department, workspace and business scope are owner approved | `NO_GO_EXTERNAL_OWNER` |
| `ACTIVATION-NEGATIVE-04` | Negative route/action proof is recorded with safe ref | `NO_GO_EXTERNAL_EVIDENCE` |
| `ACTIVATION-CUTOVER-05` | `check:heu-user-operation-cutover-readiness` reviewed by IT_DATA + Audit | `CAN_SUA_REVIEW` |
| `ACTIVATION-OWNER-06` | Owner result recorded as PASS/CAN_SUA/NO_GO/BLOCKED | `NO_GO_OWNER_SIGNOFF` |

## 6. Required Local Checks

Run only in a clean worktree and with `npm.cmd`:

```powershell
npm.cmd run check:heu-user-activation-worksheet-readiness
npm.cmd run check:heu-user-operation-cutover-readiness
npm.cmd run check:heu-user-pilot-identity-scope-precheck-ledger-readiness
npm.cmd run check:heu-user-pilot-identity-scope-day1-readiness
npm.cmd run check:heu-user-scope-baseline-repair-queue -- --static-only
```

Do not run migration, deploy, `npm install`, `npm ci`, Supabase push or paid
automation from this worksheet.

## 7. AI Boundary

AI/Codex may:

- Verify this worksheet has safe labels and required gates.
- Summarize `PASS_LOCAL`, `CAN_SUA`, `NO_GO` and `BLOCKED_OWNER_DECISION`.
- Suggest missing review items for IT_DATA and Audit.

AI/Codex must not:

- Create/invite users.
- Set, view, store or send passwords.
- Grant role, department, workspace or business scope.
- Accept evidence, execute UAT, approve owner GO/NO-GO or production GO.
- Call paid AI/automation for this worksheet.

## 8. Rollback

Rollback by reverting the PR that adds this worksheet and checker.

No database rollback is required because this worksheet does not change Auth,
database rows, role/scope assignments, evidence storage, finance state or
production config.

## 9. SOP Slice Result Record

SOP-SCOPE:
- `HEU-USER-PILOT-006` wires the user activation worksheet readiness package.
- Scope is docs/control + read-only checker only.

SOP-CHECK:
- Required local command:
  `npm.cmd run check:heu-user-activation-worksheet-readiness`.

SOP-PROFESSIONAL:
- IT_DATA owns Auth/profile linking and secure activation channel.
- Department owners own pilot seat approval.
- Audit owns negative-access and evidence reference review.

SOP-LEGAL:
- No legal/UAT/evidence/owner approval is inferred.
- No restricted data is copied into Git/Codex/chat.

SOP-LOGIC:
- Worksheet can be `PASS_LOCAL` while live activation remains `NO_GO`.
- Activation cannot proceed from Codex output alone.

SOP-VERIFY:
- Checker must verify no mutation APIs, no command execution and no secret
  collection path.

SOP-RESULT:
- `PASS_LOCAL` for worksheet/checker wiring.
- `NO_GO` for real user activation.
- `CAN_SUA` for IT_DATA + Audit review.

SOP-NEXT:
- Review PR with IT_DATA + Audit.
- Then run live checks only from approved local secure env, never by pasting
  secrets into Git/Codex/chat.
