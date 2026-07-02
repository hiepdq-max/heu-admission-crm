# HEU REAL-OPS-07 HOU Short Course Scope Intake 2026-07-02

Status: PASS_LOCAL_SCOPE_SEPARATION_INTAKE
Decision value: REAL_OPS_07_SCOPE_READY / NO_GO / BLOCKED
Scope: HOU and Short Course scope separation before final owner GO/NO-GO,
TTGDTX production reliance or broader controlled trial expansion.

This intake exists so BGH, IT_DATA, HOU owner, DAO_TAO, CTHSSV, KHTC,
PHAP_CHE, HR and Audit can decide whether HOU and Short Course stay deferred,
enter a separate controlled UAT lane or receive explicit signed scope
separation before TTGDTX owner review. It does not approve HOU handover,
tuition ledger posting, invoice issuance, COM payout, attendance lock, BHXH
decision, meal/allowance payment, HR payment, invoice/payment verification,
period close, statutory accounting, UAT acceptance, evidence acceptance, owner
GO/NO-GO or production GO.

## Intake Rules

- Record only phase decision labels, owner labels, UAT plan references,
  report-view signoff references, controlled evidence IDs and defer-decision
  references.
- Keep raw HOU records, Short Course attendance sheets, teacher/payment files,
  student PII, CCCD, phone numbers, bank data, payroll data, vouchers,
  credentials, passwords, OTPs, reset/invite links, service-role keys and raw
  Drive URLs outside Git/Codex/chat.
- Stop if HOU or Short Course is folded into TTGDTX production without signed
  scope separation and owner signoff.
- Stop if Codex/AI is asked to approve UAT, accept evidence, post HOU ledger,
  approve COM, lock attendance, approve BHXH/policy, verify payment, close a
  period, approve finance action or mark production ready.

## Required Intake Lanes

| Lane | Owner | Required reference | Stop condition |
|---|---|---|---|
| `REAL-OPS-07-SCOPE-01` HOU gap pack checked | HOU owner + KHTC + CTHSSV + DAO_TAO + PHAP_CHE + Audit | `HOU_LEDGER_READY / NO_GO / BLOCKED`, HOU-LH-01 through HOU-LH-08 and `RV_HOU_LEDGER_SUMMARY` signoff blocker | HOU handover, tuition ledger, invoice/chung-tu, COM or report-view source is unclear |
| `REAL-OPS-07-SCOPE-02` HOU phase decision route prepared | BGH + HOU owner + KHTC + PHAP_CHE + Audit | HOU handover UAT plan, tuition ledger proof route, COM policy/signoff route, report-view owner signoff or owner-approved defer decision | HOU is treated as TTGDTX-ready or finance-ready without separate signed UAT |
| `REAL-OPS-07-SCOPE-03` Short Course gap pack checked | DAO_TAO + CTHSSV + KHTC + HR + PHAP_CHE + Audit | `SC_ATTENDANCE_PAYMENT_READY / NO_GO / BLOCKED`, SC-AP-01 through SC-AP-08 and `RV_SHORT_COURSE_ATTENDANCE_PAYMENT` signoff blocker | Attendance, BHXH/chinh sach, meal/allowance, HR payment or invoice/payment route is unclear |
| `REAL-OPS-07-SCOPE-04` Short Course phase decision route prepared | BGH + DAO_TAO + CTHSSV + KHTC + HR + PHAP_CHE + Audit | Signed attendance/payment UAT route, BHXH/policy signoff route, source reconciliation, period-lock/reversal proof, report-view signoff or defer decision | Short Course payment, period close, statutory accounting or dashboard reliance is treated as ready from PASS_LOCAL |
| `REAL-OPS-07-SCOPE-05` TTGDTX separation confirmed | BGH + IT_DATA + Audit + process owners | Signed statement that HOU and Short Course are separate from TTGDTX production scope unless separately approved | HOU or Short Course facts are mixed into TTGDTX production reliance, finance reliance or owner GO/NO-GO |
| `REAL-OPS-07-SCOPE-06` Authority decision path prepared | BGH + IT_DATA + affected owners | `REAL_OPS_07_SCOPE_READY / NO_GO / BLOCKED` with owner labels and next route | PASS_LOCAL is treated as HOU approval, Short Course approval, UAT acceptance, evidence acceptance, finance approval, owner GO/NO-GO or production GO |

## Linked Surfaces

- `components/hou/hou-ledger-handover-gap-pack.tsx`
- `components/short-course/short-course-attendance-payment-gap-pack.tsx`
- `components/master-control/production-readiness-blocker-summary.tsx`
- `data-heu-real-ops-07-hou-short-course-scope-intake="REAL-OPS-07_HOU_SHORT_COURSE"`
- `docs/HEU_HOU_LEDGER_HANDOVER_GAP_PACK_20260628_V01_DRAFT.md`
- `docs/HEU_SHORT_COURSE_ATTENDANCE_PAYMENT_GAP_PACK_20260628_V01_DRAFT.md`
- `docs/HEU_REAL_OPERATION_CLOSURE_PLAN_20260702.md`

## PASS_LOCAL Checks

- `npm.cmd run audit:heu-hou-ledger-handover-gap-pack`
- `npm.cmd run audit:heu-short-course-attendance-payment-gap-pack`
- `npm.cmd run audit:heu-bgh-dashboard-spec`
- `npm.cmd run audit:heu-implementation-log`
- `npm.cmd run audit:ttgdtx-release-gates`
- `npm.cmd run lint`
- `npm.cmd run build`
- `git diff --check`

Passing local checks means only the HOU and Short Course scope-separation
intake structure exists and is audited. It does not mean HOU scope, Short
Course scope, UAT, evidence, finance action, owner GO/NO-GO or production
operation is approved.
