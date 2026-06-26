# TTGDTX 9+ Core Test Cases

Status: draft test plan. Use anonymized data only.

## 1. Master And Scope

| ID | Case | Expected result |
|---|---|---|
| T9-M-01 | User without TTGDTX scope opens center master | Access denied or no data |
| T9-M-02 | Scoped manager opens assigned center | Data visible only for assigned scope |
| T9-M-03 | Create/activate a center with duplicate code | Rejected or updates existing by approved path |
| T9-M-04 | Use Phu-Xuyen-like evidence pack as reference | Stored as generic source metadata, not hard-coded flow |

## 2. Import And Receivable

| ID | Case | Expected result |
|---|---|---|
| T9-I-01 | Import multi-section workbook | Sections are staged separately |
| T9-I-02 | Missing required student/class mapping | Issue is routed; no receivable posted |
| T9-R-01 | Create receivable twice for same student/fee/period | Duplicate is blocked |
| T9-R-02 | Change tuition policy after receivable lock | Requires approved adjustment path |

## 3. Collection And Invoice

| ID | Case | Expected result |
|---|---|---|
| T9-C-01 | Record collection without invoice/receipt decision | Blocked or marked `NEEDS_INVOICE_DECISION` |
| T9-C-02 | Record same bank/payment fingerprint twice | Duplicate is blocked |
| T9-C-03 | Over-collection against receivable | Exception is created; no silent posting |

## 4. Reconciliation

| ID | Case | Expected result |
|---|---|---|
| T9-REC-01 | Reconcile matching receivable/collection lines | Batch can be submitted |
| T9-REC-02 | Reconcile mismatch | Batch remains exception state |
| T9-REC-03 | Edit approved locked batch | Blocked unless approved reopen workflow exists |

## 5. Acceptance And Payout

| ID | Case | Expected result |
|---|---|---|
| T9-PAY-01 | Create partner payment request without BBNT | Blocked |
| T9-PAY-02 | Create payout without partner invoice where required | Blocked |
| T9-PAY-03 | Double-click payout submit | Only one disbursement is recorded |
| T9-PAY-04 | Direct write to payout table bypassing RPC/action | Blocked by permission/RLS/path |

## 6. Dashboard And Audit

| ID | Case | Expected result |
|---|---|---|
| T9-D-01 | BGH authorized user opens accounting dashboard | Approved summary visible |
| T9-D-02 | Contract-only user opens finance dashboard | Access denied |
| T9-A-01 | Create/update TTGDTX finance record | Audit log exists |
| T9-A-02 | Attempt hard delete business record | Blocked by audit/static controls |

## 7. Human Approval

| ID | Case | Expected result |
|---|---|---|
| T9-H-01 | AI suggests approval | Suggestion remains draft only |
| T9-H-02 | Approval action records actor | `approved_by` is a human authorized user |
| T9-H-03 | Approval with missing evidence | Blocked or routed to exception |

