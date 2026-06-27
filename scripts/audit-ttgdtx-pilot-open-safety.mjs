import { readFileSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();

function read(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), "utf8");
}

const step97Path = "database/step97_ttgdtx_p0_19_finance_gate_fix.sql";
const step100Path = "database/step100_ttgdtx_pilot_open_p2_01_p2_02_p0_19.sql";
const step97Sql = read(step97Path);
const step100Sql = read(step100Path);
const failures = [];

function fail(message) {
  failures.push(message);
}

if (!/Migration candidate only\. Do not run production migration from Codex\/chat\./i.test(step97Sql)) {
  fail(`${step97Path}: missing production migration boundary`);
}

if (!/^begin;\s*[\s\S]*^commit;/im.test(step97Sql)) {
  fail(`${step97Path}: must run as an explicit transaction candidate`);
}

if (
  !/create or replace view public\.ttgdtx_receivable_candidate_leads[\s\S]*P0_19_MAJOR_GATE_MISSING[\s\S]*P0_19_FINANCE_NOT_READY[\s\S]*major_gate\.finance_gate = 'ALLOW_FINANCE'/i.test(
    step97Sql,
  )
) {
  fail(`${step97Path}: candidate view must block P2-03 when P0-19 is not ready`);
}

if (
  !/create or replace function public\.validate_ttgdtx_student_receivable[\s\S]*from public\.major_legal_tuition_gates[\s\S]*finance_gate = 'ALLOW_FINANCE'[\s\S]*P0-19 chua cho phep/i.test(
    step97Sql,
  )
) {
  fail(`${step97Path}: receivable trigger function must enforce P0-19 finance gate`);
}

if (!/Migration candidate only\. Do not run production migration from Codex\/chat\./i.test(step100Sql)) {
  fail(`${step100Path}: missing production migration boundary`);
}

if (!/Sandbox\/UAT only\. Production remains NO-GO/i.test(step100Sql)) {
  fail(`${step100Path}: missing sandbox-only NO-GO boundary`);
}

if (
  !/current_setting\('app\.heu_allow_pilot_open', true\)[\s\S]*<> 'YES'[\s\S]*raise exception 'Step100 blocked:/i.test(
    step100Sql,
  )
) {
  fail(`${step100Path}: pilot-open update must be blocked unless explicit sandbox session flag is set`);
}

if (!/PILOT_NO_REAL_FILE__DO_NOT_PAY_PARTNER/i.test(step100Sql)) {
  fail(`${step100Path}: missing no-real-file partner payout block marker`);
}

if (!/payment_condition = 'MANUAL_APPROVAL_ONLY'/i.test(step100Sql)) {
  fail(`${step100Path}: missing manual approval payment condition`);
}

if (!/invoice_issue_rule = 'MANUAL_APPROVAL_ONLY'/i.test(step100Sql)) {
  fail(`${step100Path}: missing manual approval invoice rule`);
}

if (!/control_status\s*=\s*'DAT_TAM_THOI'/i.test(step100Sql)) {
  fail(`${step100Path}: pilot-open records must remain temporary control status`);
}

if (/delete\s+from|truncate|drop\s+table/i.test(`${step97Sql}\n${step100Sql}`)) {
  fail("Step97/Step100 must not hard-delete or truncate business data");
}

if (failures.length > 0) {
  console.error("TTGDTX pilot-open safety audit failed.");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("TTGDTX pilot-open safety audit passed. Step97 blocks P0-19 gaps and Step100 is sandbox-guarded.");
