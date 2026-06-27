# HEU Non-TTGDTX/Base Cascade Review

Status: PASS_LOCAL_REVIEW
Date: 2026-06-27
Scope: database `on delete cascade` outside TTGDTX Step90-Step110
Mode: review and control artifact only. This document does not approve
production migration, data deletion, cascade execution or production GO.

## 1. Purpose

This review closes the ambiguity around the remaining non-TTGDTX/base cascade
findings. It classifies the current cascade surface so the team can decide,
before production, which paths must be converted to `on delete restrict`,
soft-archive/status transitions, or explicitly waived by the responsible owner.

Production remains NO-GO until the unresolved HIGH/CRITICAL cascade paths are
converted or waived with written approval.

## 2. Scan Result

Current scan count: 44

The scan covers SQL files under `database/` and excludes TTGDTX Step90-Step110
because that chain is already guarded by `npm.cmd run audit:ttgdtx-cascade`.

| File | Count | Review classification | Required production decision |
|---|---:|---|---|
| `database/schema.sql` | 6 | HIGH | REQUIRES_CONVERSION_OR_WAIVER |
| `database/step35a_hou_foundation.sql` | 3 | MEDIUM | REVIEW_OR_WAIVE |
| `database/step35d_hou_commission_foundation.sql` | 5 | CRITICAL | REQUIRES_CONVERSION_OR_WAIVER |
| `database/step35g_hou_evidence_files.sql` | 3 | CRITICAL | REQUIRES_CONVERSION_OR_WAIVER |
| `database/step36a_lead_condition_checklist.sql` | 1 | HIGH | REQUIRES_CONVERSION_OR_WAIVER |
| `database/step38_user_scopes_and_handovers.sql` | 5 | HIGH | REQUIRES_CONVERSION_OR_WAIVER |
| `database/step40_user_lead_visibility.sql` | 1 | MEDIUM | REVIEW_OR_WAIVE |
| `database/step41_master_control.sql` | 1 | MEDIUM | REVIEW_OR_WAIVE |
| `database/step44_admission_segment_operating_os.sql` | 3 | HIGH | REQUIRES_CONVERSION_OR_WAIVER |
| `database/step48_evidence_document_control.sql` | 2 | CRITICAL | REQUIRES_CONVERSION_OR_WAIVER |
| `database/step49_master_data_governance.sql` | 1 | HIGH | REQUIRES_CONVERSION_OR_WAIVER |
| `database/step52_admission_workspace_selector.sql` | 1 | MEDIUM | REVIEW_OR_WAIVE |
| `database/step54_admission_object_field_schema.sql` | 3 | HIGH | REQUIRES_CONVERSION_OR_WAIVER |
| `database/step56_dynamic_admission_configuration.sql` | 2 | HIGH | REQUIRES_CONVERSION_OR_WAIVER |
| `database/step57_dynamic_lead_form_enforcement.sql` | 2 | HIGH | REQUIRES_CONVERSION_OR_WAIVER |
| `database/step59_major_legal_tuition_gate.sql` | 1 | CRITICAL | REQUIRES_CONVERSION_OR_WAIVER |
| `database/step60_admission_catalog_workspace_gate.sql` | 1 | HIGH | REQUIRES_CONVERSION_OR_WAIVER |
| `database/step62_short_course_data_foundation.sql` | 3 | HIGH | REQUIRES_CONVERSION_OR_WAIVER |

## 3. Risk Buckets

| Bucket | Files | Risk | Required control |
|---|---|---|---|
| Base identity and CRM lead children | `database/schema.sql`, `database/step36a_lead_condition_checklist.sql` | Deleting a user or lead can remove activity, follow-up, document, payment or checklist evidence | Convert to restrict/archive or waive with owner approval |
| HOU finance and evidence | `database/step35d_hou_commission_foundation.sql`, `database/step35g_hou_evidence_files.sql` | Commission, payment-line and evidence history can disappear with parent deletion | Convert to restrict/archive before production finance use |
| Workspace/scope helpers | `database/step38_user_scopes_and_handovers.sql`, `database/step40_user_lead_visibility.sql`, `database/step52_admission_workspace_selector.sql` | Access-scope history can disappear and weaken audit | Prefer status soft-revoke pattern; waive only for pure derived rows |
| Master/control and dynamic configuration | `database/step41_master_control.sql`, `database/step44_admission_segment_operating_os.sql`, `database/step49_master_data_governance.sql`, `database/step54_admission_object_field_schema.sql`, `database/step56_dynamic_admission_configuration.sql`, `database/step57_dynamic_lead_form_enforcement.sql`, `database/step60_admission_catalog_workspace_gate.sql` | Deleting a master row can remove configuration, form, gate or governance history | Convert to restrict/archive unless proven derived-only |
| Legal/tuition and short-course operations | `database/step59_major_legal_tuition_gate.sql`, `database/step62_short_course_data_foundation.sql` | Legal/tuition gate and attendance/enrollment evidence can be removed | Convert to restrict/archive before production use |

## 3A. Finding Register

The detailed finding register is maintained in
`docs/HEU_NON_TTGDTX_CASCADE_FINDING_REGISTER_20260628.md`.

That register locks P6-06-FIND-001 through P6-06-FIND-044 to the current SQL
locations, child tables, parent references, owner lanes and required
dispositions. It is PASS_LOCAL only and does not approve production deletion,
cascade execution, waiver, conversion migration, cleanup, rollback success or
production GO.

Any future change to the non-TTGDTX/base cascade surface must update the
finding register and rerun `npm.cmd run audit:heu-non-ttgdtx-cascade-review`
before owner review.

## 4. Production Rules

- Do not run production migration from Codex/chat.
- Do not rely on parent deletion as a normal operating workflow.
- Finance, payment, evidence, approval, legal/tuition gate and audit records
  must use restrict/archive/status transitions.
- Pure derived join rows may be waived only when they do not carry finance,
  evidence, approval, legal, audit or student-operating history.
- Every waiver must name owner, reason, affected table, rollback approach and
  evidence that no protected record is removed.

## 5. Required Next Actions

1. IT/Data maps each finding to the generated table and parent table.
2. Business owner classifies the row as protected record or derived helper.
3. For protected records, prepare a reviewed migration to replace cascade with
   restrict/archive/status transition.
4. For derived helper rows, record a waiver with owner approval.
5. Run `npm.cmd run audit:heu-non-ttgdtx-cascade-review`,
   `npm.cmd run audit:hard-delete`, `npm.cmd run audit:ttgdtx-cascade` and
   `npm.cmd run audit:ttgdtx-release-gates`.

## 6. Local Control Decision

P6-06 is PASS_LOCAL as a cascade review/control artifact. It does not approve
production migration, production deletion, cascade execution, waiver, data
cleanup or production GO.

The hard-delete checklist remains IN_PROGRESS until every
REQUIRES_CONVERSION_OR_WAIVER row is converted or signed off by the responsible
owner group.

## 7. P6-06 Evidence Checklist

The app exposes `components/audit/hard-delete-waiver-evidence-checklist.tsx`
on `/audit` after the hard-delete boundary guard. The checklist is PASS_LOCAL
only and covers HD-01 through HD-06: current cascade scan acceptance, protected
record conversion, derived-helper waiver, no hard-delete in protected flows,
rollback proof without deletion, and owner GO/NO-GO decision.

Do not attach raw student PII, CCCD, bank data, payment data, passwords, OTPs,
service-role keys or production credentials in Git/Codex/chat. Conversion or
written waiver evidence remains required before P6-06 can be accepted for
production readiness.

## 8. Decision Queue Evidence

The app exposes `components/audit/hard-delete-conversion-decision-queue.tsx`
on `/audit` between the hard-delete boundary guard and the waiver evidence
checklist. The queue is PASS_LOCAL only and covers HDQ-01 through HDQ-05:

- HDQ-01: Base identity and CRM lead children.
- HDQ-02: HOU finance and evidence.
- HDQ-03: Workspace and scope helpers.
- HDQ-04: Master, control and dynamic configuration.
- HDQ-05: Legal, tuition and short-course operations.

Expected local outcomes are `RESTRICT_OR_ARCHIVE` for protected rows and
`SOFT_REVOKE_OR_WAIVER` only for proven derived helper rows with owner reason,
rollback note and written approval.

`npm.cmd run audit:hard-delete-conversion-decision-queue` must pass before
handoff. This does not approve production deletion, cascade execution, waiver,
conversion migration, cleanup, rollback success or production GO.

## 9. P6-06 Acceptance Matrix

The app also exposes
`data-hard-delete-cascade-acceptance-matrix="P6-06"` in
`components/audit/hard-delete-waiver-evidence-checklist.tsx`. The matrix is
PASS_LOCAL only and is used to decide whether conversion/waiver evidence is
ready for owner review.

| Case | Requirement | Minimum evidence | Stop condition |
|---|---|---|---|
| P6-06-ACCEPT-01 | Current cascade scan locked and mapped | The 44 non-TTGDTX/base cascade findings are mapped to table, parent relation, risk bucket and owner lane | Scan count changes, an owner lane is missing, or any finding is not classified before review |
| P6-06-ACCEPT-02 | Protected records converted before production | Finance, evidence, approval, payment, legal, audit, lead and operating-history rows are converted to restrict/archive/status patterns | A protected record can still disappear through parent delete, cascade execution, cleanup or migration |
| P6-06-ACCEPT-03 | Derived-helper waiver is narrow and written | Any waiver names affected table, derived-only proof, owner reason, rollback note and written approval | Waiver is oral, broad, hidden, ownerless or covers finance/evidence/audit/legal/student-operating history |
| P6-06-ACCEPT-04 | Rollback and cleanup do not rely on deletion | Rollback proof uses backup/restore or reversible state, not truncate, drop table, hard-delete or cascade execution | Deletion is presented as rollback proof or cleanup hides evidence required for audit/legal review |
| P6-06-ACCEPT-05 | Evidence redaction and owner sign-off | BGH, IT_DATA, Audit and affected owners sign redacted conversion/waiver evidence outside Codex/chat | Raw student PII, CCCD, bank data, payment data, passwords, OTPs, service-role keys or production credentials appear |
| P6-06-ACCEPT-06 | Production boundary | P6-06 remains IN_PROGRESS until all required conversions or written waivers are signed and owner GO/NO-GO exists | PASS_LOCAL is treated as production deletion approval, cascade execution approval, waiver approval, conversion migration approval, rollback success or production GO |

Decision value: `P6_06_ACCEPT / FAIL / BLOCKED`.

P6-06 can support production readiness only when P6-06-ACCEPT-01 through
P6-06-ACCEPT-06 all pass with redacted evidence and signed owner approval.

## 10. P6-06 Closure Decision Manifest

The app exposes
`data-hard-delete-cascade-closure-decision-manifest="P6-06"` in
`components/audit/hard-delete-waiver-evidence-checklist.tsx`. The manifest is
PASS_LOCAL only and prepares the human closure decision after conversion/waiver
evidence is reviewed.

| Case | Decision gate | Required proof | Blocker |
|---|---|---|---|
| P6-06-DEC-01 | Current scan and owner lanes locked | The 44 non-TTGDTX/base cascade findings have a dated scan reference, owner lane and risk bucket | Scan is stale, a table is unmapped, or a finding has no owner |
| P6-06-DEC-02 | Protected rows converted | Finance, evidence, approval, payment, legal, audit, lead and operating-history rows use restrict, archive or status-transition behavior | Protected records can still be removed by parent delete, cascade execution, cleanup or migration |
| P6-06-DEC-03 | Derived-helper waiver controlled | Every remaining derived-helper cascade has a narrow written waiver with table, reason, owner, rollback note and affected scope | Waiver is broad, oral, ownerless, hidden or covers protected finance/evidence/audit/legal/student-operating history |
| P6-06-DEC-04 | Rollback and cleanup proof independent of deletion | Rollback evidence uses backup/restore or reversible state and cleanup evidence preserves legal, finance and audit records | Truncate, drop table, hard-delete or cascade execution is presented as rollback proof |
| P6-06-DEC-05 | Redacted evidence and human sign-off | BGH, IT_DATA, Audit and affected owners sign redacted conversion/waiver evidence in the controlled evidence location | Raw sensitive data or credentials appear in Git, Codex/chat or public notes |
| P6-06-DEC-06 | Production boundary acknowledged | The closure record states P6-06 is only ready for owner GO/NO-GO review after all stop conditions are cleared | PASS_LOCAL is treated as production deletion approval, cascade execution approval, waiver approval, conversion migration approval, rollback success or production GO |

Decision value: `P6_06_CLOSURE_READY / NO_GO / BLOCKED`.

This manifest does not approve production deletion, cascade execution, waiver,
conversion migration, cleanup, rollback success or production GO.
