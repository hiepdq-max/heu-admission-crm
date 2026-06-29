# TTGDTX P2-10 Invoice/Chung-Tu Policy UAT Runbook 2026-06-27

Status: PASS_LOCAL_TEMPLATE
Scope: P2-10 tuition collection invoice/chung-tu decision evidence.

This runbook does not approve invoice issuance, tax/legal interpretation,
finance posting, UAT acceptance or production GO. KHTC and PHAP_CHE must review
and sign the evidence outside Codex/chat before production use.

## 1. Boundary

- Use anonymized or controlled redacted evidence only.
- Do not paste raw bank statement bodies, raw voucher images, CCCD, phone
  numbers, passwords, temporary passwords, OTPs, password reset links,
  account activation/invite links, service-role keys, bank credentials or raw
  payment evidence into Git/Codex/chat.
- A P2-10 payment is not complete for downstream reconciliation until the
  invoice/chung-tu decision path is resolved or formally blocked.
- `PASS_LOCAL` means the software checklist and audit are aligned; it is not a
  KHTC/PHAP_CHE approval.

## 2. Required UAT Cases

| Case | Scenario | Expected evidence | Stop condition |
|---|---|---|---|
| P2-10-INV-01 | HEU collects directly from learner/sponsor | Collection model, payer type, P2-10 voucher, invoice issuer, invoice number/date and controlled evidence link | User answers only yes/no without model, payer or evidence |
| P2-10-INV-02 | TTGDTX/center collects first | Contract/policy basis, center collection proof and KHTC/PHAP_CHE decision on issuer | Case moves out of PENDING_POLICY without owner decision |
| P2-10-INV-03 | Split collection between HEU and center | Split amount proof, issuer per portion and evidence or waiver per portion | Total is correct but invoice/chung-tu proof is not split by portion |
| P2-10-INV-04 | Offset, reduction or adjustment | Adjustment decision, waiver authority, reason and evidence location | User self-selects not required without written authority |
| P2-10-INV-05 | Other/unmatched collection model | Written business description and KHTC/PHAP_CHE policy conclusion | System treats unmatched case as complete automatically |
| P2-10-INV-06 | Downstream blocking check | P2-13/P2-14/P2-15 stay blocked when invoice policy is unresolved | Unresolved P2-10 enters reconciliation, period lock or payment request |

## 3. Evidence Register To Fill Outside Git

| Evidence item | Controlled location | Owner initials | Result |
|---|---|---|---|
| REQUIRED case proof |  |  | PENDING |
| PENDING_POLICY case proof |  |  | PENDING |
| WAIVED_BY_AUTHORITY case proof |  |  | PENDING |
| OTHER_COLLECTION_MODEL decision |  |  | PENDING |
| Downstream blocking proof |  |  | PENDING |
| Final KHTC/PHAP_CHE UAT sign-off |  |  | PENDING |

## 4. P2-10 Invoice/Chung-Tu Decision Manifest

Decision value: `P2_10_INVOICE_READY / NO_GO / BLOCKED`.

Use this manifest after the invoice/chung-tu UAT evidence checklist is filled.
It separates the operating decision from local software checks. It does not
approve invoice issuance, legal/tax interpretation, finance posting, revenue
recognition, UAT acceptance or production GO.

| Case | Decision test | Required decision evidence | Stop condition |
|---|---|---|---|
| P2-10-DEC-01 | Collection model and payer decision | KHTC identifies collection model, payer type, source receivable/payment reference and whether HEU or the center is the issuing party | Missing collection model, payer type, source reference or issuing-party decision keeps P2-10 BLOCKED |
| P2-10-DEC-02 | Required invoice/chung-tu issuance decision | For REQUIRED cases, invoice issuer, invoice number, invoice date and controlled evidence reference are present before downstream reconciliation | A REQUIRED case without number/date/evidence, or with uncontrolled evidence, keeps P2-10 NO_GO |
| P2-10-DEC-03 | Not-required or waiver basis decision | NOT_REQUIRED or WAIVED_BY_AUTHORITY cases cite owner, reason, legal/policy basis, expiry/review date and controlled approval evidence | User self-selects not required, waiver lacks authority, or legal/policy basis is unclear |
| P2-10-DEC-04 | Pending policy downstream blocker decision | Every PENDING_POLICY case blocks P2-13 reconciliation, P2-14 lock and P2-15 payment request until KHTC/PHAP_CHE decide | Unresolved invoice/chung-tu policy can continue to reconciliation, period lock or partner payment request |
| P2-10-DEC-05 | Evidence redaction and storage decision | Evidence is stored in a controlled location and tracked by safe reference only, with raw bank data, CCCD, phones, voucher bodies, temporary passwords, password reset links, account activation/invite links and credentials excluded | Raw sensitive evidence or temporary account secret appears in Git/Codex/chat, app notes, screenshots or uncontrolled links |
| P2-10-DEC-06 | Final KHTC/PHAP_CHE sign-off decision | KHTC and PHAP_CHE sign the final P2-10 invoice/chung-tu result with decision ID, signer, date and controlled evidence references | Missing decision ID, unsigned owner, unresolved policy case, raw sensitive evidence, legal/tax ambiguity or PASS_LOCAL treated as approval keeps P2-10 BLOCKED or NO_GO |

Stop immediately if any decision ID is missing, KHTC/PHAP_CHE signature is
absent, invoice/chung-tu basis is unresolved, PENDING_POLICY is allowed
downstream, raw sensitive evidence is referenced or PASS_LOCAL is treated as
invoice approval.

## 5. Local Preflight

Run before owner review:

```powershell
npm.cmd run audit:ttgdtx-invoice-policy
npm.cmd run audit:ttgdtx-release-gates
npm.cmd run audit:heu-vietnamese-text-encoding
npm.cmd run lint
npm.cmd run build
```

Passing these commands does not replace the signed UAT evidence.

## 6. Final Decision

P2-10 invoice/chung-tu policy remains production NO-GO until:

1. P2-10-INV-01 through P2-10-INV-06 have controlled evidence.
2. P2-10-DEC-01 through P2-10-DEC-06 have an owner decision.
3. KHTC and PHAP_CHE sign the UAT result.
4. No raw sensitive evidence is exposed in Git/Codex/chat.
5. No downstream workflow can bypass unresolved invoice/chung-tu policy.
