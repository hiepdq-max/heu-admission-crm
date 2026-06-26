# TTGDTX 9+ Core Module Spec

Status: draft control spec for internal pilot. Not an issued SOP.

## 1. Purpose

Build a generic TTGDTX/9+ operating module that can support multiple centers and partners. Phu Xuyen is a real-world reference case for validating design assumptions, not a dedicated product variant.

## 2. Operating Scope

The module covers:

- center/partner master
- linked contract and appendix evidence
- class/cohort/program setup
- student receivable creation
- tuition collection and invoice/receipt decision
- import staging and issue routing
- reconciliation and lock
- acceptance minutes evidence
- partner payment request
- partner payment approval
- partner payout
- accounting dashboard
- source/evidence control
- account freeze/release metadata
- collateral release metadata where relevant

## 3. Out Of Scope For This Draft

- production deployment
- direct raw bank statement processing
- direct import of real student PII into repo/chat
- legal issuance of SOP/regulation
- AI approval of finance/legal decisions
- autonomous notification sending

## 4. Core Workflows

### 4.1 Master Setup

1. Create or activate center.
2. Link partner and contract.
3. Register program/cohort/class.
4. Attach tuition policy version.
5. Confirm role and business scope.

### 4.2 Receivable

1. Stage students/classes.
2. Validate source pack.
3. Apply tuition policy.
4. Create receivable draft.
5. Review exceptions.
6. Approve receivable readiness.

### 4.3 Collection

1. Record collection draft.
2. Resolve invoice/receipt requirement.
3. Attach non-sensitive evidence reference.
4. Check duplicate payment fingerprint.
5. Move to reconciliation-ready.

### 4.4 Reconciliation

1. Group collection lines into batch.
2. Compare expected vs collected.
3. Resolve mismatch.
4. Submit for review.
5. Approve and lock.

### 4.5 Acceptance And Partner Payment

1. Confirm accepted student/period evidence.
2. Confirm BBNT/minutes evidence.
3. Confirm partner invoice evidence where required.
4. Create payment request.
5. Human approval.
6. Execute payout through controlled path.
7. Record audit evidence.

## 5. Required Controls

| Control | Requirement |
|---|---|
| Legal | Contract/appendix must be linked before payout |
| Finance | No duplicate receivable, collection, reconciliation or payout |
| Invoice | Collection must decide invoice/receipt requirement |
| Evidence | BBNT and partner invoice are separate evidence streams |
| Privacy | Source documents are metadata only unless approved anonymized UAT |
| Role | Role + center/partner scope must control reads/writes |
| Audit | Write tables require audit trigger/log coverage |
| Approval | Only human users can approve or lock |
| Dashboard | Dashboard is derived from controlled workflows |

## 6. Current Implementation Evidence

- Routes exist under `app/ttgdtx`.
- SQL candidates exist from `database/step88` through `database/step110`.
- Static local audit scripts exist under `scripts`.
- UAT runbooks exist for payout, accounting dashboard, role scope and audit.

## 7. Ready Definition

The module is ready for controlled internal UAT only when:

- local build and audit scripts pass
- migration order is reviewed
- backup/restore dry-run is documented
- anonymized UAT source pack exists
- role-scope UAT is signed
- KHTC/Phap Che/BGH approve Go/No-Go for the relevant workflow

