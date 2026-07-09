# HEU AI Control Docs PR 001 Scope Manifest 2026-07-09

Task ID: HEU-AI-CONTROL-DOCS-PR-001-SCOPE-MANIFEST
Source task: HEU-AI-003-CONTROL-AUDIT-AGENT-DRY-RUN-PR-SPLIT
Repository: heu-admission-crm
Branch: hardening/ttgdtx-9plus-pilot
Status: DRAFT_CONTROL
Production status: NO-GO

## 1. Purpose

This manifest selects the first reviewable PR group from the HEU-AI-003 dry-run
output.

The selected first PR group is:

`docs/HEU_CONTROL` AI control docs only.

This PR group is intentionally smaller than the full `docs` group reported by
HEU-AI-003. It does not include database, config, runtime app, components,
`.codex`, scripts, package aliases, SQL, migration or production work.

## 2. HEU-AI-003 Snapshot Used

Latest dry-run result used for this selection:

| Metric | Count |
|---|---:|
| Status entries | 286 |
| Diff name-status entries | 197 |
| Untracked entries | 90 |
| Full docs group | 106 |
| Selected AI control docs subset | 8 |

## 3. Allowed Files For PR 001

Only these files are allowed in the first PR group:

| Include | File | Reason |
|---:|---|---|
| 1 | `docs/HEU_CONTROL/HEU_AI_001_CONTROL_AUDIT_AGENT_BLUEPRINT_20260709.md` | AI operating model and Control/Audit Agent boundary |
| 2 | `docs/HEU_CONTROL/HEU_AI_001_OWNER_REVIEW_CONTROL_AUDIT_AGENT_20260709.md` | Owner-lane review checklist before static checker |
| 3 | `docs/HEU_CONTROL/HEU_AI_002_STATIC_CHECKER_CONTROL_AUDIT_AGENT_BLUEPRINT_20260709.md` | Static checker contract; docs-only in this PR |
| 4 | `docs/HEU_CONTROL/HEU_AI_002_IT_DATA_AUDIT_REVIEW_20260709.md` | IT_DATA + Audit local review before dry-run command |
| 5 | `docs/HEU_CONTROL/HEU_AI_003_CONTROL_AUDIT_AGENT_DRY_RUN_PR_SPLIT_20260709.md` | Dry-run command contract; docs-only in this PR |
| 6 | `docs/HEU_CONTROL/HEU_AI_CONTROL_DOCS_PR_001_SCOPE_MANIFEST_20260709.md` | This PR scope manifest |
| 7 | `docs/HEU_CONTROL/README.md` | Minimal AI-only control index required by HEU-AI-002 checker |
| 8 | `docs/HEU_CONTROL/PR_SPLIT_REGISTER_20260707.md` | Minimal AI-only PR split register required by HEU-AI-002 checker |

## 4. Review Only, Not Included Unless Hunk-Split

In the dirty source worktree these shared index files contain broader local
control rows. In this clean PR branch they are created as minimal AI-only index
files because the base branch did not have `docs/HEU_CONTROL` index files and
HEU-AI-002 requires them.

| File | Decision |
|---|---|
| `docs/HEU_CONTROL/README.md` | Included as AI-only minimal index in the PR branch |
| `docs/HEU_CONTROL/PR_SPLIT_REGISTER_20260707.md` | Included as AI-only minimal PR split register in the PR branch |

If hunk extraction is not done, leave both files for a later control-index PR.

## 5. Explicit Exclusions

Do not include these files or groups in PR 001:

| Excluded group | Reason |
|---|---|
| `scripts/check-heu-ai-002-static-checker-readiness.mjs` | Belongs to a separate AI tooling PR |
| `scripts/dry-run-heu-ai-003-pr-split.mjs` | Belongs to a separate AI tooling PR |
| `package.json` | Package aliases belong to AI tooling/config review, not docs-only PR |
| `package-lock.json` | No dependency or lockfile change in docs-only PR |
| `database/**` | Very high risk; SQL/migration review only |
| `app/**` | Runtime app review later by module |
| `components/**` | Runtime UI review later by module |
| `.codex/**` | Local environment review separately |
| `next.config.ts` and config files | Config review separately |
| Any raw evidence, PII, secret, token, bank/payment data | Never include in PR 001 |

## 6. PR 001 Review Owners

| Lane | Responsibility |
|---|---|
| IT_DATA | Confirm this is docs-only and does not introduce runtime AI, SQL, install, deploy or config change |
| Audit | Confirm no PASS_LOCAL overclaim, no production GO and no sensitive data |
| BGH | Review direction only if needed; no approval is implied |
| PHAP_CHE | Review legal/SOP boundary only if needed; no issuance is implied |

## 7. Suggested PR Title

`docs: bổ sung bộ tài liệu kiểm soát AI Agent HEU`

Draft PR status is required until reviewer lanes confirm scope.

## 8. Verification For PR 001

Minimum local checks before staging this PR group:

```powershell
git diff --check -- `
  "docs/HEU_CONTROL/HEU_AI_001_CONTROL_AUDIT_AGENT_BLUEPRINT_20260709.md" `
  "docs/HEU_CONTROL/HEU_AI_001_OWNER_REVIEW_CONTROL_AUDIT_AGENT_20260709.md" `
  "docs/HEU_CONTROL/HEU_AI_002_STATIC_CHECKER_CONTROL_AUDIT_AGENT_BLUEPRINT_20260709.md" `
  "docs/HEU_CONTROL/HEU_AI_002_IT_DATA_AUDIT_REVIEW_20260709.md" `
  "docs/HEU_CONTROL/HEU_AI_003_CONTROL_AUDIT_AGENT_DRY_RUN_PR_SPLIT_20260709.md" `
  "docs/HEU_CONTROL/HEU_AI_CONTROL_DOCS_PR_001_SCOPE_MANIFEST_20260709.md"
```

No `npm.cmd run lint` or build is required for this docs-only PR group.

## 9. Rollback

Rollback is revert-only:

- Revert the eight allowed docs files.
- Do not touch runtime app, database, config, scripts, `.codex` or package
  aliases.

No database backup is required.

## 10. SOP Slice Result Record

SOP-SCOPE:

- Select first PR group from HEU-AI-003 output: AI control docs only.

SOP-CHECK:

- HEU-AI-003 dry-run was used as the source.
- Full docs group remains too broad; this manifest narrows the first PR to
  eight AI control docs/index files.

SOP-PROFESSIONAL:

- IT_DATA + Audit should review before staging.

SOP-LEGAL:

- This PR does not issue legal/SOP policy and does not approve production.

SOP-LOGIC:

- Start with AI control docs before AI tooling scripts, config, runtime app,
  database, `.codex` or production work.

SOP-VERIFY:

- Scoped `git diff --check` for the eight allowed docs/index files.

SOP-RESULT:

- `DAT_TAM_THOI` for PR scope selection only.
- Runtime AI Agent readiness remains `NO_GO`.
- Production remains `NO-GO`.

SOP-NEXT:

- If the user asks to stage/create PR later, stage only the allowed files in
  this manifest.
- Next separate group after PR 001 should be AI tooling scripts/package aliases,
  not database/config/runtime app.
