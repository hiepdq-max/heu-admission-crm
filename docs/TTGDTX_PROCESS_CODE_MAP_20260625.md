# TTGDTX Process Code Map 2026-06-25

## 1. Rule

User-facing screens and documents should show the business name first and the
technical code second.

Use:

```text
Thu hoc phi (P2-10)
```

Do not use as the main label:

```text
P2-10
```

The P2 code is for engineering, audit, migration and search. It should not be
the mental model for daily users.

## 2. Main TTGDTX Names

| User-facing name | Internal code | Route / artifact | Plain meaning |
|---|---|---|---|
| Ho so lien ket TTGDTX | P2-01 | `/ttgdtx` | Hop dong, trung tam, pham vi, dieu kien thu/chi |
| Chinh sach hoc phi | P2-02 | `/ttgdtx/tuition` | Khai bao muc thu, ky, thang, doi tuong thu |
| Cong no hoc sinh | P2-03 | `/ttgdtx/receivables` | So tien phai thu theo hoc sinh/lop/ky |
| Mo phong | P2-04 | `/ttgdtx/simulation` | Thu nghiem logic truoc khi ghi that |
| Gate dieu kien | P2-05 | `/ttgdtx/gate` | Chan ho so chua du dieu kien tao cong no |
| Import du lieu | P2-06 | `/ttgdtx/import` | Nap file nguon vao staging, chua ghi so that |
| Viec loi import | P2-07/P2-08/P2-09 | `/ttgdtx/import/issues`, `/workload` | Phan cong va xu ly loi du lieu |
| Thu hoc phi | P2-10 | `/ttgdtx/payments` | Ghi nhan tien da thu, chung tu thu, hoa don/chung-tu neu can |
| Kiem soat nguon | P2-11 | `/ttgdtx/source-control` | Quan ly file nguon, hop dong, BBNT, chung tu, metadata |
| Danh muc TTGDTX | P2-12 | `/ttgdtx/master` | Danh muc trung tam, lop, khoa, ky, doi tac |
| Doi soat | P2-13 | `/ttgdtx/reconciliation` | Gom chung tu thu thanh ky doi soat |
| Duyet/khoa ky doi soat | P2-14 | `/ttgdtx/reconciliation/review` | Kiem tra va khoa ky truoc khi de nghi chi |
| De nghi thanh toan | P2-15 | `/ttgdtx/payment-requests` | Lap de nghi thanh toan cho trung tam/doi tac |
| Duyet thanh toan | P2-16 | `/ttgdtx/payment-requests/review` | Kiem/duyet de nghi thanh toan |
| Chi tien | P2-17 | `/ttgdtx/payment-requests/pay` | Thuc hien chi tra mot lan, co chung tu |
| Dashboard ke toan | P2-18 | `/ttgdtx/accounting-dashboard` | Tong hop tien, cong no, doi soat, chi tra |
| Bang chung du lieu that | P2-19 | Step110/source-control docs | Metadata cho Phu Xuyen, BBNT, phong toa/giai toa, hoa don, giai chap |
| HEU Finance Desk | P5-03 | `/finance-desk` | Cockpit read-only cho KHTC/BGH xem cong no, import, nguon va chi tra TTGDTX |

## 3. Where Is P2-10?

P2-10 is the Thu hoc phi screen:

```text
/ttgdtx/payments
```

It answers:

- Da thu bao nhieu?
- Thu cho cong no nao?
- So chung tu thu/voucher nao?
- Co link minh chung khong?
- Co can hoa don/chung-tu khong?
- Neu can, hoa don do ai xuat, so nao, ngay nao, trang thai nao?

P2-10 is before reconciliation. It does not approve partner payment and does
not pay TTGDTX.

## 4. Search Keywords

To find P2-10, search any of:

- Thu hoc phi
- Chung tu thu
- Voucher thu
- Hoa don thu tien
- Thu tien co hoa don khong
- Thu tien co xuat hoa don khong
- Xuat hoa don
- Co can hoa don
- Collection
- P2-10

## 5. 2026-06-28 Search Fallback

- `/search` also checks the local TTGDTX process-label map before showing
  remote search results, so business questions like "thu tien co xuat hoa don
  khong" can still route to Thu hoc phi (P2-10).
- This fallback is navigation only. It does not approve invoice issuance,
  legal/tax interpretation, finance posting, UAT acceptance or production GO.

## 6. 2026-06-27 Local Implementation

- Added `lib/ttgdtx-process-labels.ts` as the shared local process-label map.
- Added `components/ttgdtx/ttgdtx-process-quick-finder.tsx` as the TTGDTX
  landing quick finder so users can choose by business work first, then use the
  P2 code for audit/search.
- Added `npm.cmd run audit:ttgdtx-process-labels` to keep business names before
  P2 codes.
- Added the TTGDTX process labels to Search suggestions so users can search
  "Thu hoc phi (P2-10)" without knowing only the technical code.
- Added `HEU Finance Desk (P5-03)` to the process-label map and TTGDTX quick
  finder as a read-only KHTC/BGH cockpit entry. This helps operators find the
  finance workbench without treating it as a write/approval screen.

This is PASS_LOCAL only. It does not approve production data, production UAT or
business sign-off.
