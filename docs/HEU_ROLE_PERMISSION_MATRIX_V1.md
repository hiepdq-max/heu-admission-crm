# HEU Role Permission Matrix V1

Purpose: baseline role and permission design. This is a control document, not final business approval.

## 1. Roles

| Role | Main responsibility | Default posture |
|---|---|---|
| `bgh_viewer` | BGH dashboard and approved reports | Read approved summary only |
| `it_data_admin` | System config, import control, audit support | Manage technical objects, no business approval |
| `ttgdtx_manager` | TTGDTX operating owner | Manage in assigned centers/scopes |
| `khtc_accountant` | Tuition, receivable, collection, reconciliation | Manage finance records in scope |
| `khtc_approver` | Finance review/approval | Approve finance steps in scope |
| `phap_che_reviewer` | Contract/legal evidence review | Read/review legal evidence in scope |
| `tuyen_sinh_staff` | Lead and admission operations | Manage assigned leads |
| `cthssv_staff` | Student affairs and handover | Manage student-service checklist |
| `dao_tao_staff` | Class/training operations | Manage class/training data |
| `audit_viewer` | Control/audit review | Read audit/control evidence |
| `partner_limited` | External/partner limited access | Read assigned partner data only |

## 2. Critical Permission Families

| Permission family | Example actions | Required controls |
|---|---|---|
| CRM | `lead.read`, `lead.manage`, `lead.handover` | Scope by owner/segment |
| TTGDTX master | `ttgdtx.master.read`, `ttgdtx.master.manage` | Scope by center/partner |
| Tuition policy | `ttgdtx.tuition.read`, `ttgdtx.tuition.manage` | Policy version approval |
| Import | `ttgdtx.import.stage`, `ttgdtx.import.review`, `ttgdtx.import.approve` | No raw PII in repo/chat |
| Receivable | `ttgdtx.receivable.read`, `ttgdtx.receivable.manage` | No duplicate receivable |
| Collection | `ttgdtx.collection.record`, `ttgdtx.collection.review` | Invoice/receipt decision |
| Reconciliation | `ttgdtx.reconciliation.submit`, `ttgdtx.reconciliation.approve` | Lock after approval |
| Payment request | `ttgdtx.payment_request.create`, `ttgdtx.payment_request.approve` | BBNT/invoice evidence |
| Payout | `ttgdtx.payment_request.pay` | No duplicate payout; highest approval |
| Dashboard | `ttgdtx.dashboard.read` | Approved summaries only |
| Audit | `audit.read`, `audit.export` | No mutation by audit viewer |

## 3. Approval Boundary

Codex/AI is never an approver. Any field named `approved_by`, `approved_at`, `payment_approved_by`, `locked_by`, or equivalent must refer to a human user/profile with assigned authority.

## 4. Scope Boundary

Every finance/legal/TTGDTX read should be checked against at least one of:

- user role
- center scope
- partner scope
- admission segment scope
- department ownership

## 5. Current Result

P1-03 is PASS_LOCAL as a role-permission control artifact. It defines baseline
role posture, critical permission families and scope boundaries, but it does
not approve production access, broad permissions, real-data UAT or autonomous
AI approval.
