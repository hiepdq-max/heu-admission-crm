import { readFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const repoRoot = process.cwd();
const failures = [];

function fail(message) {
  failures.push(message);
}

function read(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), "utf8");
}

const moneyModule = await import(
  pathToFileURL(path.join(repoRoot, "lib/vnd-money.ts")).href
);

const parseCases = [
  ["1000000", 1000000],
  ["1 000 000", 1000000],
  ["1.000.000", 1000000],
  ["1,000,000", 1000000],
  ["1.000.000 \u0111", 1000000],
  ["0", null],
  ["1,5", null],
  ["10 00", null],
  ["abc", null],
];

for (const [input, expected] of parseCases) {
  const actual = moneyModule.parsePositiveVndAmountInput(input);
  if (actual !== expected) {
    fail(`parsePositiveVndAmountInput(${JSON.stringify(input)}) = ${actual}, expected ${expected}`);
  }
}

if (moneyModule.formatVndInput(1000000) !== "1.000.000") {
  fail("formatVndInput(1000000) must return 1.000.000");
}

if (moneyModule.formatVndAmount(1000000) !== "1.000.000 \u0111") {
  fail("formatVndAmount(1000000) must return 1.000.000 \u0111");
}

const expectedImports = [
  "app/ttgdtx/payments/actions.ts",
  "app/ttgdtx/payments/page.tsx",
  "app/ttgdtx/payment-requests/pay/actions.ts",
  "app/ttgdtx/payment-requests/pay/page.tsx",
  "app/ttgdtx/accounting-dashboard/page.tsx",
];

for (const filePath of expectedImports) {
  const source = read(filePath);
  if (!source.includes("@/lib/vnd-money")) {
    fail(`${filePath}: must import the shared VND money helper`);
  }
}

const actionFiles = [
  "app/ttgdtx/payments/actions.ts",
  "app/ttgdtx/payment-requests/pay/actions.ts",
];

for (const filePath of actionFiles) {
  const source = read(filePath);
  if (!source.includes("parsePositiveVndAmountInput(")) {
    fail(`${filePath}: must parse submitted VND amount with parsePositiveVndAmountInput`);
  }
  if (/replace\(\s*\/\[\^\\d\]\//.test(source)) {
    fail(`${filePath}: must not strip all non-digits because that turns 1,5 into 15`);
  }
}

const formPageFiles = [
  "app/ttgdtx/payments/page.tsx",
  "app/ttgdtx/payment-requests/pay/page.tsx",
];

for (const filePath of formPageFiles) {
  const source = read(filePath);
  if (!source.includes("formatVndAmount as money")) {
    fail(`${filePath}: must display VND through formatVndAmount`);
  }
  if (!source.includes("formatVndInput as amountInput")) {
    fail(`${filePath}: must default money inputs through formatVndInput`);
  }
  if (/replace\(\s*\/\\\.\//.test(source)) {
    fail(`${filePath}: must not replace dot separators with spaces`);
  }
}

const displayOnlyPageFiles = ["app/ttgdtx/accounting-dashboard/page.tsx"];

for (const filePath of displayOnlyPageFiles) {
  const source = read(filePath);
  if (!source.includes("formatVndAmount")) {
    fail(`${filePath}: must display VND through formatVndAmount`);
  }
  if (/replace\(\s*\/\\\.\//.test(source)) {
    fail(`${filePath}: must not replace dot separators with spaces`);
  }
}

if (failures.length > 0) {
  console.error("VND money format audit failed.");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("VND money format audit passed. P2-10/P2-17 parse money and P2-18 displays 1.000.000 \u0111.");
