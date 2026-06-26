# HEU Tech Risk Register

## Active Risks

| ID | Risk | Severity | Area | Control | Status |
|---|---|---|---|---|---|
| R-001 | Large dirty working tree can mix unrelated changes | HIGH | Repo | Split commits by scope; do not revert unknown changes | ACTIVE |
| R-002 | Production migration without backup can damage data | CRITICAL | Database | No production apply without backup, restore dry-run and approval | ACTIVE |
| R-003 | Finance flow can duplicate collection, reconciliation or payout | CRITICAL | Finance | Unique guards, RPC-only payout, UAT duplicate tests | ACTIVE |
| R-004 | Real source packs may contain PII/bank/contract-sensitive data | CRITICAL | Privacy | Metadata-only in repo/chat; anonymized UAT pack | ACTIVE |
| R-005 | Phu Xuyen example could be hard-coded into product logic | HIGH | Product design | Treat as reference case; build generic center/partner model | ACTIVE |
| R-006 | Shared CRM files can leak TTGDTX assumptions into other pipelines | HIGH | CRM | Review shared files before commit | ACTIVE |
| R-007 | Role scope may expose finance/legal data to wrong users | CRITICAL | Security | Role-permission matrix and role-based UAT | ACTIVE |
| R-008 | Dashboard may be trusted before workflow/data controls are ready | HIGH | Reporting | Dashboard after workflow/data master; label internal-test state | ACTIVE |
| R-009 | AI could be mistaken for approver | HIGH | Governance | AI drafts/checks only; human approval fields required | ACTIVE |
| R-010 | Step110 production run may still reveal legacy DB object issue `relation "a"` | MEDIUM | Database | Use debug SQL if V006 still fails | WATCH |

## Risk Acceptance Rule

No CRITICAL or HIGH risk is considered accepted unless the responsible HEU owner signs off in the relevant UAT/runbook/checklist. Codex cannot self-approve acceptance.

## Local Controls Already Present

- `npm.cmd run audit:hard-delete`
- `npm.cmd run audit:permission-soft-revoke`
- `npm.cmd run audit:ttgdtx-audit-log`
- `npm.cmd run audit:ttgdtx-cascade`
- `npm.cmd run audit:ttgdtx-dashboard-access`
- `npm.cmd run audit:ttgdtx-data-fetch-gate`
- `npm.cmd run audit:ttgdtx-role-scope-access`
- `npm.cmd run audit:ttgdtx-uat-readiness`
- `npm.cmd run audit:ttgdtx-release-gates`

