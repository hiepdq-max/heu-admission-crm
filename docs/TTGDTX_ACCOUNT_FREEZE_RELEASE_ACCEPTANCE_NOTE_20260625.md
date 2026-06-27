# TTGDTX Account Freeze, Release And Acceptance Evidence Note 2026-06-25

## 1. Purpose

This note converts the mailbox and Drive review for TTGDTX account control,
giai chap, and bien ban nghiem thu into product-control requirements for the
HEU web app.

This is a read-only design-control artifact. It does not approve production
migration, production import, bank action, payment, payout, collateral release
or go-live.

## 2. Source Boundary

Reviewed sources:

- Gmail account: connected HEU mailbox, searched by account-control and TTGDTX
  evidence keywords instead of using the generic inbox URL.
- Gmail thread `199e619aa36a5bf2`: planned tuition-account freeze notice for
  Lai Chau classes.
- Gmail thread `19aba1f5ca636426`: communication content for special tuition
  collection accounts.
- Gmail thread `19928e8acbf01847`: bank credit and collateral contract
  attachments, used only to derive giai chap control rules.
- Gmail thread `19a3e99e26ae5f40`: request and delivery trail for center
  contracts and BBNT evidence.
- Drive folder `1Hb8aBa9KsKtSRrzuiG7nQu_jkh62SL6Y`: shared BBNT and linked
  contract pack for centers.
- Drive sample `1jDOSvNqkWewrdQx08ngIXTgIHA3qg2wE`: Phu Xuyen K24 HK1 BBNT
  docx, read to identify fields and payout-gate logic.

Data not copied into this repo:

- Student names, DOB, personal identifiers and student bank/account details.
- Full bank account numbers, collateral details, asset identifiers or personal
  data from credit/collateral attachments.
- Full row-level student lists from BBNT appendices or spreadsheets.

## 3. Observed Business Facts

### 3.1 Tuition Account Freeze

The mailbox shows tuition-account freeze is an operational finance-control
event, not just a payment receipt:

- Finance can plan a freeze by bank, center/province, class, cohort and term.
- One notice covered Lai Chau classes and several tuition periods, with a
  planned effective date.
- Another communication explains a special tuition collection account mechanism
  where outgoing/debit use is locked so tuition funds are protected for school
  collection.
- Communication must involve CTHSSV, homeroom/center channels, students and
  parents.
- One center case had no direct class group/channel, so the system must allow a
  backup communication plan and exception owner.

### 3.2 Account Release / Giai Toa

No complete final release/unfreeze evidence thread was identified in this
read-only review. Because the freeze mechanism affects student/parent account
use, release must still be modeled explicitly.

Minimum release gate:

- Tuition collection target is reconciled.
- Exception list is resolved or approved.
- Finance checker and approver sign off.
- Bank confirmation is attached.
- Communication evidence is attached when students/parents/centers must be
  notified.

### 3.3 Collateral Giai Chap

The bank credit/collateral attachments are high-sensitivity legal-finance
evidence. They should not be mixed with tuition-account release.

Giai chap for collateral should require:

- Confirmation that secured obligations are complete or otherwise approved for
  release.
- Bank confirmation.
- Security registration release/de-registration where applicable.
- Return or handover evidence for collateral/property documents.
- Legal-finance approval by authorized roles only.

### 3.4 BBNT With TTGDTX

The mailbox and Drive folder show BBNT is payment evidence:

- A center dossier request asked for contracts and acceptance minutes by term.
- Scanned BBNT files were shared as evidence already used for center payment.
- The shared Drive folder has two top branches: BBNT and HDLK. These must remain
  separate evidence streams even when stored under one Drive pack.
- BBNT is organized by cohort K20 to K24. HDLK is organized by K20 to K25.
- A K24 Phu Xuyen sample has both docx and spreadsheet files.
- The sample BBNT links contract, center, cohort, term, class counts, monthly
  formula and total payable amount. It also states payment is after signed and
  sealed acceptance evidence plus a valid financial invoice.

### 3.5 Invoice / Chung Tu When Collecting Tuition

The system must not answer "co xuat hoa don khong" with a hard-coded global
yes/no. It must record the policy decision for each collection model and payer
type.

There are two different invoice controls:

- Collection invoice/receipt: evidence issued or recorded when HEU/authorized
  party collects tuition from student, parent, center or sponsor.
- Partner invoice: financial invoice/evidence from the center/partner before
  HEU pays partner support or linked-training cost.

Collection is not complete until receipt/voucher evidence and invoice_required
status are resolved.

## 4. Product Model

### 4.1 Account-Control Event

Recommended status flow:

```text
DRAFT
-> REQUESTED
-> COMMUNICATION_READY
-> BANK_SENT
-> BANK_CONFIRMED
-> FROZEN
-> RELEASE_REQUESTED
-> RELEASED
```

Allowed exception states:

```text
PARTIAL_EXCEPTION
CANCELLED
REJECTED
```

Required fields:

| Field | Requirement |
|---|---|
| control_event_id | Immutable ID |
| event_type | ACCOUNT_FREEZE or ACCOUNT_RELEASE |
| bank_code | BIDV, VietinBank or other controlled value |
| center_id / province | Affected center/province |
| cohort / class_code / term | Affected academic scope |
| planned_effective_date | Required before bank request |
| requested_by / approved_by | Finance ownership |
| bank_confirmation_ref | Required before FROZEN or RELEASED |
| communication_status | Required before operational readiness |
| exception_owner | Required when no direct center/class channel exists |
| audit_status | Draft, submitted, approved, rejected |

### 4.2 Communication Evidence

Communication evidence should store metadata only:

- Audience: student, parent, homeroom teacher, center staff, CTHSSV, finance.
- Channel: email, class group, center notice, signed notice, phone follow-up.
- Attachment link or Drive/Gmail reference.
- Acknowledgement status.
- Exception notes.

Do not store phone numbers, student account values or raw personal lists in the
public UI or logs.

### 4.3 Collateral Release Register

Collateral giai chap should be a separate restricted register:

| Area | Rule |
|---|---|
| Visibility | BGH, KHTC, Phap Che and approved audit roles only |
| Source | Bank credit/collateral file metadata and legal approval evidence |
| Preconditions | Obligation clearance, bank confirmation, release/de-registration evidence |
| Evidence | Handover minutes, returned-document confirmation, legal signoff |
| Separation | Never share workflow state with tuition-account release |

### 4.4 BBNT Evidence Gate

Payment request and payout should be blocked until this chain is complete:

```text
Active linked-training contract
-> tuition policy and cohort/class scope confirmed
-> collection/reconciliation approved
-> collection invoice/receipt status resolved where required
-> BBNT for correct center/cohort/term attached
-> finalized student/class count attached
-> valid partner invoice attached
-> payment request generated from formula
-> checker/approver approval
-> payout once
```

The BBNT record should include:

- Center.
- Cohort.
- Term and school year.
- Contract reference.
- Class list summary and accepted student count.
- Formula fields: rate, months, quantity and amount.
- Evidence links: signed BBNT, attached list, partner invoice, Drive folder.
- Status: FILE_ONLY, EXTRACTED, MANUAL_REVIEWED, APPROVED.

### 4.5 Collection Invoice / Receipt Fields

Required fields:

| Field | Requirement |
|---|---|
| collection_model | HEU_COLLECTS, TTGDTX_COLLECTS, SPLIT_COLLECTION or other controlled value |
| payer_type | Student, parent, center, sponsor or other |
| invoice_required | REQUIRED, NOT_REQUIRED, PENDING_POLICY, WAIVED_BY_AUTHORITY |
| invoice_issuer | HEU, center/partner or other approved issuer |
| invoice_status | NOT_STARTED, ISSUED, CANCELLED, REPLACED, WAIVED |
| invoice_no / issue_date | Required when invoice_status is ISSUED |
| evidence_url | Invoice/chung-tu evidence link |
| waiver_by / waiver_reason | Required when invoice_required is waived |

## 5. Access And Security Rules

| Data area | Default rule |
|---|---|
| Account-freeze metadata | KHTC, BGH, scoped TTGDTX owner |
| Student or bank-account values | Hidden by default; authorized finance only |
| Communication evidence | Metadata visible by role; raw recipient lists restricted |
| BBNT totals | Finance/BGH can view; row-level student lists restricted |
| Collection invoice/receipt | KHTC and approved audit roles; sensitive payer details masked |
| Partner invoice | KHTC, Phap Che and BGH with payment dossier access |
| Contract/HDLK evidence | Phap Che + KHTC + BGH |
| Collateral giai chap | Strictly restricted legal-finance register |
| AI assistance | May classify/check gaps; must not approve, freeze, release or pay |

## 6. Build Implications

Immediate implementation direction:

1. Extend the evidence registry with account-control, BBNT folder/docx/xlsx,
   email-thread and collateral-contract source types.
2. Add account-control workflow states before using real freeze/release data.
3. Add communication acknowledgement and exception-owner checks.
4. Add collection invoice/receipt policy and status controls.
5. Add BBNT and partner-invoice evidence gate to payment request and payout
   workflows.
6. Keep BBNT and HDLK evidence separated even when Drive stores them together.
7. Keep collateral giai chap separate from tuition-account release.
8. Use only anonymized/synthetic UAT rows until approved by data owner.

Current conclusion: these real sources make the TTGDTX finance design clearer,
but production remains NO-GO until privacy, audit, backup/rollback and human
approval gates are complete.
