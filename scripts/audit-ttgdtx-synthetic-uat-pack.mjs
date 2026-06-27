import { readFileSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const packPath = "fixtures/ttgdtx/synthetic_real_like_uat_pack_20260627.json";
const pack = JSON.parse(readFileSync(path.join(repoRoot, packPath), "utf8"));
const failures = [];

function fail(message) {
  failures.push(message);
}

function hasValue(value) {
  return value !== null && value !== undefined && value !== "";
}

function collectStrings(value, trail = [], output = []) {
  if (typeof value === "string") {
    output.push({ trail: trail.join("."), value });
  } else if (Array.isArray(value)) {
    value.forEach((item, index) => collectStrings(item, [...trail, `[${index}]`], output));
  } else if (value && typeof value === "object") {
    for (const [key, child] of Object.entries(value)) {
      collectStrings(child, [...trail, key], output);
    }
  }

  return output;
}

function collectKeys(value, trail = [], output = []) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => collectKeys(item, [...trail, `[${index}]`], output));
  } else if (value && typeof value === "object") {
    for (const [key, child] of Object.entries(value)) {
      output.push({ trail: [...trail, key].join("."), key });
      collectKeys(child, [...trail, key], output);
    }
  }

  return output;
}

if (pack.data_classification !== "synthetic_no_real_pii_no_real_bank_data") {
  fail("Pack must declare synthetic_no_real_pii_no_real_bank_data classification.");
}

if (pack.production_use !== "NO_GO" || pack.mode !== "UAT_STAGING_ONLY") {
  fail("Pack must stay UAT_STAGING_ONLY and production NO_GO.");
}

if (pack.synthetic_scope?.center_code !== "UAT_CENTER_ALPHA") {
  fail("Pack must use the generic synthetic center code UAT_CENTER_ALPHA.");
}

const forbiddenKeyPattern =
  /password|otp|api[_-]?key|service[_-]?role|secret|cccd|citizen|phone|mobile|account[_-]?number|bank[_-]?account/i;

for (const { trail, key } of collectKeys(pack)) {
  if (forbiddenKeyPattern.test(key)) {
    fail(`${trail}: key name is not allowed in synthetic UAT pack`);
  }
}

const forbiddenStringPatterns = [
  {
    label: "phone-like value",
    pattern: /(?:^|[^\d])(?:\+84|0)\d{8,10}(?:$|[^\d])/,
  },
  {
    label: "CCCD-like 12 digit value",
    pattern: /(?:^|[^\d])\d{12}(?:$|[^\d])/,
  },
  {
    label: "raw bank-account-like digit value",
    pattern: /(?:^|[^\d])\d{9,16}(?:$|[^\d])/,
  },
  {
    label: "real data destination marker",
    pattern: /production[_ -]?ready|go[_ -]?live/i,
  },
];

for (const { trail, value } of collectStrings(pack)) {
  for (const { label, pattern } of forbiddenStringPatterns) {
    if (pattern.test(value)) {
      fail(`${trail}: contains ${label}: ${JSON.stringify(value)}`);
    }
  }
}

const appendices = pack.contract_appendices ?? [];
if (!appendices.some((item) => item.cohort === "K23" && /APPENDIX/i.test(item.case_id))) {
  fail("Missing K23 contract appendix case.");
}

const k24Support = appendices.find(
  (item) => item.cohort === "K24" && item.payment_profile?.support_fee_formula,
);
if (!k24Support) {
  fail("Missing K24 support-fee formula case.");
} else {
  const formula = k24Support.payment_profile.support_fee_formula;
  const expected =
    formula.eligible_students * formula.months * formula.monthly_support_fee_vnd;
  if (formula.expected_partner_payable_vnd !== expected) {
    fail("K24 support-fee formula expected amount does not match inputs.");
  }
}

const sectionCodes = new Set(
  (pack.tuition_workbook_sections ?? []).map((section) => section.section_code),
);
for (const requiredSection of [
  "POLICY_MATRIX",
  "STUDENT_COLLECTION_LINES",
  "CLASS_TOTALS",
  "COLLECTION_REQUESTS",
]) {
  if (!sectionCodes.has(requiredSection)) {
    fail(`Missing workbook section ${requiredSection}.`);
  }
}

const studentRows =
  pack.tuition_workbook_sections?.find(
    (section) => section.section_code === "STUDENT_COLLECTION_LINES",
  )?.rows ?? [];

if (!studentRows.some((row) => row.student_status === "DROPOUT_BEFORE_COLLECTION")) {
  fail("Missing dropout student observation case.");
}

if (!studentRows.some((row) => row.student_status === "ZERO_AMOUNT_OBSERVATION")) {
  fail("Missing zero-amount observation case.");
}

if (!studentRows.some((row) => row.row_type === "TOTAL")) {
  fail("Missing total-row observation case.");
}

const bankLines = pack.bank_receipt_batch?.lines ?? [];
if (bankLines.length < 3) {
  fail("Bank receipt batch must include at least three lines.");
}

const fingerprints = bankLines.map((line) => line.fingerprint).filter(Boolean);
const duplicateFingerprints = fingerprints.filter(
  (fingerprint, index) => fingerprints.indexOf(fingerprint) !== index,
);
if (duplicateFingerprints.length === 0) {
  fail("Bank receipt batch must include one duplicate fingerprint case.");
}

const invoiceStatuses = new Set(
  (pack.collection_invoice_cases ?? []).map((item) => item.invoice_required),
);
for (const requiredStatus of ["REQUIRED", "NOT_REQUIRED", "PENDING_POLICY"]) {
  if (!invoiceStatuses.has(requiredStatus)) {
    fail(`Missing collection invoice case ${requiredStatus}.`);
  }
}

const accountControlTypes = new Set(
  (pack.account_control_cases ?? []).map((item) => item.control_type),
);
for (const requiredControl of [
  "TUITION_ACCOUNT_FREEZE",
  "TUITION_ACCOUNT_RELEASE",
  "COLLATERAL_RELEASE",
]) {
  if (!accountControlTypes.has(requiredControl)) {
    fail(`Missing account control case ${requiredControl}.`);
  }
}

const evidenceTypes = new Set(
  (pack.acceptance_and_partner_invoice_cases ?? []).map((item) => item.evidence_type),
);
for (const requiredEvidence of ["BIEN_BAN_NGHIEM_THU", "PARTNER_INVOICE"]) {
  if (!evidenceTypes.has(requiredEvidence)) {
    fail(`Missing evidence case ${requiredEvidence}.`);
  }
}

const mappedTests = new Set((pack.expected_test_case_map ?? []).map((item) => item.test_id));
for (const requiredTest of [
  "T9-I-01",
  "T9-C-01",
  "T9-C-02",
  "T9-PAY-01",
  "T9-PAY-02",
  "T9-PAY-03",
  "T9-D-01",
  "T9-D-02",
]) {
  if (!mappedTests.has(requiredTest)) {
    fail(`Missing expected test mapping ${requiredTest}.`);
  }
}

for (const appendix of appendices) {
  if (!hasValue(appendix.contract_code) || !hasValue(appendix.payment_profile?.tuition_policy_code)) {
    fail(`${appendix.case_id}: missing contract or tuition policy reference.`);
  }
}

if (failures.length > 0) {
  console.error("TTGDTX synthetic UAT pack audit failed.");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(
  `TTGDTX synthetic UAT pack audit passed. ${pack.pack_id} covers real-like cases without raw PII/bank data.`,
);
