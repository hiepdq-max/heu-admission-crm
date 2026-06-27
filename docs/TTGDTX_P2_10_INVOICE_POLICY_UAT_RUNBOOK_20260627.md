# TTGDTX P2-10 Invoice/Chung-Tu Policy UAT Runbook 2026-06-27

Status: PASS_LOCAL_TEMPLATE
Scope: P2-10 tuition collection invoice/chung-tu decision evidence.

This runbook does not approve invoice issuance, tax/legal interpretation,
finance posting, UAT acceptance or production GO. KHTC and PHAP_CHE must review
and sign the evidence outside Codex/chat before production use.

## 1. Boundary

- Use anonymized or controlled redacted evidence only.
- Do not paste raw bank statement bodies, raw voucher images, CCCD, phone
  numbers, passwords, OTPs, service-role keys, bank credentials or raw payment
  evidence into Git/Codex/chat.
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

## 4. Local Preflight

Run before owner review:

```powershell
npm.cmd run audit:ttgdtx-invoice-policy
npm.cmd run audit:ttgdtx-release-gates
npm.cmd run audit:heu-vietnamese-text-encoding
npm.cmd run lint
npm.cmd run build
```

Passing these commands does not replace the signed UAT evidence.

## 5. Final Decision

P2-10 invoice/chung-tu policy remains production NO-GO until:

1. P2-10-INV-01 through P2-10-INV-06 have controlled evidence.
2. KHTC and PHAP_CHE sign the UAT result.
3. No raw sensitive evidence is exposed in Git/Codex/chat.
4. No downstream workflow can bypass unresolved invoice/chung-tu policy.
