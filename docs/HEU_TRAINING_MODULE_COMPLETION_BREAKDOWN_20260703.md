# HEU Training Module Completion Breakdown - 2026-07-03

Status: PASS_LOCAL_BREAKDOWN
Production/UAT status: NO-GO until signed attendance/payment UAT,
BHXH/policy signoff, source reconciliation, role/workspace UAT, controlled
evidence references, signed evidence intake rows, report-view owner signoff and
owner GO/NO-GO are completed outside Git/Codex/chat.

Decision values: TRAINING_MODULE_READY / NO_GO / BLOCKED

## Purpose

This document breaks the HEU training module into small goals that can be
checked, improved and closed one at a time.

Training module means the local-control path around:

- M07 Dao Tao class/program/course handling.
- P9-01 Short Course / Day Nghe attendance and payment gap pack.
- Student/class/enrollment handoff from CRM and CTHSSV into Dao Tao.
- Attendance, BHXH/chinh sach, meal/allowance and payment boundaries.
- `RV_SHORT_COURSE_ATTENDANCE_PAYMENT` report-view reliance.
- Role/workspace scope, negative-access proof and audit traceability.

PASS_LOCAL here means the local code, docs and guard scripts are packaged for
controlled UAT. It does not approve class operation, attendance lock, BHXH
decision, meal/allowance payment, HR payment, invoice/payment verification,
period close, statutory accounting, evidence acceptance, UAT acceptance, owner
GO/NO-GO or production GO.

## Completion Slices

| Slice | Small goal | Current local status | Main evidence | Exit rule |
|---|---|---|---|---|
| TRN-00 | Training scope baseline | PASS_LOCAL | `docs/HEU_CURRENT_STATE_INVENTORY.md`; `docs/HEU_SYSTEM_BUILD_BACKLOG.md`; `docs/HEU_MODULE_READINESS_GAP_MATRIX_20260628_V01_DRAFT.md`; `npm.cmd run check:heu-training-module-completion-breakdown` | M07 Dao Tao and P9 Short Course stay separated from TTGDTX/HOU production reliance until signed owner scope exists. |
| TRN-01 | Workspace and route scope | PASS_LOCAL | `/short-course`; `app/short-course/page.tsx`; `app/short-course/intake/page.tsx`; `app/short-course/workflows/page.tsx`; `npm.cmd run check:heu-short-course-scope-readiness` | Every read/write path is scoped to active Short Course admission segments before UAT. |
| TRN-02 | Student, class and enrollment chain | PASS_LOCAL_SOURCE | `database/step66_short_course_student_master_control.sql`; `database/step68_short_course_class_master_control.sql`; `database/step69_short_course_enrollment_class_assignment.sql`; `SHORT-SCOPE-STUDENTS`; `SHORT-SCOPE-CLASSES`; `SHORT-SCOPE-ENROLLMENTS` | No attendance/payment reliance if student, class or enrollment chain is missing or cross-scope. |
| TRN-03 | Attendance lock and exception route | PASS_LOCAL_CHECKLIST | `docs/HEU_SHORT_COURSE_ATTENDANCE_LOCK_EVIDENCE_CHECKLIST_20260703.md`; `docs/HEU_SHORT_COURSE_ATTENDANCE_PAYMENT_GAP_PACK_20260628_V01_DRAFT.md`; `SC_ATTENDANCE_LOCK_EVIDENCE_READY / NO_GO / BLOCKED`; SC-AP-01 through SC-AP-03; SC-REV-01; SC-UAT-01/02 | Signed attendance UAT proves signer, timestamp, lock state and exception route. |
| TRN-04 | BHXH/chinh sach decision | PASS_LOCAL_CHECKLIST | `docs/HEU_SHORT_COURSE_BHXH_POLICY_DECISION_CHECKLIST_20260703.md`; `SC_BHXH_POLICY_DECISION_READY / NO_GO / BLOCKED`; SC-BHXH-EVID-01 through SC-BHXH-EVID-06; SC-AP-04; SC-REV-02; SC-SIGN-02; SC-UAT-03 | CTHSSV + Phap Che owner/legal signoff exists before policy effect. |
| TRN-05 | Meal/allowance and HR payment boundary | PASS_LOCAL_CHECKLIST | `docs/HEU_SHORT_COURSE_MEAL_ALLOWANCE_PAYMENT_BOUNDARY_CHECKLIST_20260703.md`; `SC_MEAL_ALLOWANCE_BOUNDARY_READY / NO_GO / BLOCKED`; SC-MEAL-EVID-01 through SC-MEAL-EVID-06; SC-AP-05; SC-REV-03; SC-SIGN-03; SC-UAT-04 | Formula version, attendance source and blocked-payment proof are signed before calculation or payment reliance. |
| TRN-06 | Invoice/payment verification | PASS_LOCAL_CHECKLIST | `docs/HEU_SHORT_COURSE_INVOICE_PAYMENT_VERIFICATION_CHECKLIST_20260703.md`; `SC_INVOICE_PAYMENT_VERIFICATION_READY / NO_GO / BLOCKED`; SC-PAY-EVID-01 through SC-PAY-EVID-06; SC-AP-06; SC-REV-04; SC-SIGN-04; SC-UAT-05; `SHORT-SCOPE-BHXH-FINANCE` | Payment verification, voucher/reversal rule and period-lock proof are signed before finance reliance. |
| TRN-07 | Report-view source reconciliation | PASS_LOCAL_CHECKLIST | `docs/HEU_SHORT_COURSE_REPORT_VIEW_SOURCE_RECONCILIATION_CHECKLIST_20260703.md`; `RV_SHORT_COURSE_ATTENDANCE_PAYMENT`; `docs/HEU_REPORT_VIEW_SOURCE_MAP_20260628_V01_DRAFT.md`; `SC_REPORT_VIEW_SOURCE_RECONCILIATION_READY / NO_GO / BLOCKED`; SC-RV-EVID-01 through SC-RV-EVID-06; SC-AP-07; SC-REV-05; SC-UAT-06; SC-SIGN-05 | BGH + Audit sign DQ/source/report-view reliance before any dashboard reliance. |
| TRN-08 | Role scope and negative access | PASS_LOCAL_CHECKLIST | `docs/HEU_SHORT_COURSE_ROLE_NEGATIVE_ACCESS_CHECKLIST_20260703.md`; `SHORT-SCOPE-WORKFLOWS`; `SHORT-SCOPE-ACTOR-LINK`; `docs/HEU_PERMISSION_SCOPE_OPERATION_BREAKDOWN_20260703.md`; `docs/HEU_NEGATIVE_CONTROL_ACCOUNT_QUEUE_20260703.md`; `SC_ROLE_NEGATIVE_ACCESS_READY / NO_GO / BLOCKED`; SC-ROLE-EVID-01 through SC-ROLE-EVID-06; SC-UAT-07; SC-REV-06; SC-SIGN-06 | In-scope users see only scoped training data, and negative users cannot see private payment or policy detail. |
| TRN-09 | Audit and controlled evidence trace | PASS_LOCAL_TEMPLATE | SC-REV-06; SC-UAT-08; `docs/HEU_SHORT_COURSE_UAT_RESULT_LEDGER_TEMPLATE_20260703.md`; `docs/HEU_SHORT_COURSE_SIGNED_UAT_EVIDENCE_INTAKE_20260704.md`; SC-UAT-LEDGER-01 through SC-UAT-LEDGER-08; SC-UAT-EVID-01 through SC-UAT-EVID-08; `SC_UAT_RESULT_READY / NO_GO / BLOCKED`; `SC_SIGNED_UAT_EVIDENCE_READY / NO_GO / BLOCKED`; `npm.cmd run check:heu-short-course-signed-uat-evidence-intake`; `npm.cmd run audit:heu-short-course-attendance-payment-gap-pack` | Actor, owner, evidence ref, storage class, reviewer and decision trace rows exist outside Codex/chat. |
| TRN-10 | Owner closure and final module decision | PASS_LOCAL_TEMPLATE | `docs/HEU_SHORT_COURSE_OWNER_SIGNOFF_MANIFEST_20260702.md`; `docs/HEU_SHORT_COURSE_UAT_RESULT_LEDGER_TEMPLATE_20260703.md`; `SHORT_COURSE_OWNER_READY / NO_GO / BLOCKED`; SC-SIGN-01 through SC-SIGN-06; SC-UAT-LEDGER-01 through SC-UAT-LEDGER-08 | All owner signoff, UAT result ledger rows and report-view owner signoff are complete outside Git/Codex/chat. |

## Small-Goal Work Order

Use this order when optimizing or completing the training module:

1. Close TRN-00 baseline and keep the module status local-only.
2. Verify TRN-01 workspace scope before adding or trusting training data.
3. Confirm TRN-02 student, class and enrollment chains.
4. Execute TRN-03 attendance lock and exception-route UAT outside Codex.
5. Route TRN-04 BHXH/chinh sach and TRN-05 meal/allowance decisions to owners.
6. Verify TRN-06 invoice/payment and reversal/period-lock evidence.
7. Close TRN-07 report-view source reconciliation and signoff.
8. Run TRN-08 role/negative-access checks with real authorized accounts.
9. Fill TRN-09 audit/evidence trace rows outside Git/Codex/chat.
10. Complete TRN-10 owner/UAT closure outside Git/Codex/chat.

Do not skip ahead from a local green guard to production reliance. The next
slice can start only when the previous slice is either PASS_LOCAL for code work
or explicitly signed/blocked by the responsible owner for real operation.

## Focused Command Set

Run these commands while working this module:

```powershell
npm.cmd run check:heu-training-module-completion-breakdown
npm.cmd run check:heu-short-course-external-owner-action-queue
npm.cmd run check:heu-short-course-signed-uat-evidence-intake
npm.cmd run audit:heu-short-course-attendance-payment-gap-pack
npm.cmd run check:heu-short-course-scope-readiness
npm.cmd run audit:heu-role-scope-uat-pack
npm.cmd run audit:heu-current-state-inventory
npm.cmd run audit:heu-implementation-log
npm.cmd run audit:ttgdtx-release-gates
npm.cmd run lint
npm.cmd run build
```

`check:heu-short-course-scope-readiness` may remain `NO_GO` when required
Supabase env keys, real schema objects or signed real-data scope proof are not
available. That is a real readiness blocker, not a local code failure.

## Forbidden Actions

Codex, AI or a local PASS_LOCAL guard must not:

- Approve a real class, attendance lock or attendance correction.
- Approve BHXH/chinh sach, meal/allowance, HR payment or teacher payment.
- Verify invoice/payment, close a period, post statutory accounting or mark
  revenue.
- Import raw student, phone, CCCD, bank, voucher, teacher, payroll or payment
  data into Git, Codex or chat.
- Treat `RV_SHORT_COURSE_ATTENDANCE_PAYMENT` as a production dashboard source.
- Accept UAT evidence, approve owner GO/NO-GO or mark production GO.

## Current Local Conclusion

The training module is locally packaged for controlled UAT planning, but it is
not complete for real operation.

The local PASS_LOCAL package now covers TRN-00 through TRN-10. The external
owner action queue is prepared in
`docs/HEU_SHORT_COURSE_EXTERNAL_OWNER_ACTION_QUEUE_20260703.md` with
`SC_EXTERNAL_OWNER_ACTION_READY / NO_GO / BLOCKED`,
SC-OWNER-ACTION-01 through SC-OWNER-ACTION-08 and
`npm.cmd run check:heu-short-course-external-owner-action-queue`. The next work
is external owner/UAT evidence collection, not another local code slice:

- TRN-01 and TRN-02 have local source/data readiness evidence, but still need
  signed UAT before production reliance.
- TRN-03 now has a local attendance-lock evidence checklist; the remaining
  blocker is external signed attendance UAT with controlled evidence refs for
  SC-LOCK-EVID-01 through SC-LOCK-EVID-06.
- TRN-04 now has a local BHXH/chinh sach decision checklist; the remaining
  blocker is external CTHSSV + Phap Che owner/legal signoff with controlled
  evidence refs for SC-BHXH-EVID-01 through SC-BHXH-EVID-06.
- TRN-05 now has a local meal/allowance and HR payment boundary checklist; the
  remaining blocker is external HR + KHTC owner signoff with controlled
  evidence refs for SC-MEAL-EVID-01 through SC-MEAL-EVID-06.
- TRN-06 now has a local invoice/payment verification checklist; the remaining
  blocker is external KHTC owner signoff with controlled evidence refs for
  SC-PAY-EVID-01 through SC-PAY-EVID-06.
- TRN-07 now has a local report-view source reconciliation checklist; the
  remaining blocker is external BGH + Audit owner signoff with controlled
  evidence refs for SC-RV-EVID-01 through SC-RV-EVID-06.
- TRN-08 now has a local role scope and negative-access checklist; the
  remaining blocker is external IT_DATA + Audit role/negative-access UAT with
  controlled evidence refs for SC-ROLE-EVID-01 through SC-ROLE-EVID-06.
- TRN-09 is locally packaged through the Short Course UAT result ledger
  template and signed UAT evidence intake; the remaining blocker is external
  controlled evidence trace rows for SC-UAT-LEDGER-01 through
  SC-UAT-LEDGER-08 and SC-UAT-EVID-01 through SC-UAT-EVID-08.
- TRN-10 is locally packaged through the Short Course owner signoff manifest
  and UAT result ledger template; the remaining blocker is external owner
  signatures, final UAT result acceptance and report-view owner signoff.
- SC-AP-01 through SC-AP-08 remain the Short Course attendance/payment gate
  spine for TRN-03 through TRN-10.
- SC-OWNER-ACTION-01 through SC-OWNER-ACTION-08 remain the owner-action queue
  for turning signed evidence into a real operation decision outside
  Git/Codex/chat.

These remain local-only until signed browser UAT and controlled owner evidence
exist.
