import { readFileSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();

function read(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), "utf8");
}

const actionPath = "app/leads/[id]/actions.ts";
const pagePath = "app/leads/[id]/page.tsx";
const componentPath = "components/leads/ttgdtx-lead-quick-fix-form.tsx";

const action = read(actionPath);
const page = read(pagePath);
const component = read(componentPath);
const failures = [];

function fail(message) {
  failures.push(message);
}

if (!/export async function updateTtgdtxLeadQuickFixAction/.test(action)) {
  fail(`${actionPath}: missing TTGDTX lead quick-fix server action`);
}

if (!/segment\.segment_code !== "TC9_TTGDTX_LINKED"/.test(action)) {
  fail(`${actionPath}: quick-fix must be limited to the TTGDTX linked segment`);
}

if (!/can_write_admission_workspace_lead[\s\S]*lead_segment_id: lead\.admission_segment_id[\s\S]*lead_partner_id: partnerId/.test(action)) {
  fail(`${actionPath}: quick-fix must require workspace write permission for selected partner`);
}

if (!/partner\.partner_type !== "TTGDTX"/.test(action)) {
  fail(`${actionPath}: quick-fix must restrict selected partner to active TTGDTX`);
}

if (!/from\("ttgdtx_center_dropdown_options"\)[\s\S]*\.eq\("partner_id", partnerId\)/.test(action)) {
  fail(`${actionPath}: quick-fix must validate selected partner against P2-12 dropdown options`);
}

if (!/getAllowedProgramMajorOptions\(supabase, lead\.admission_segment_id\)/.test(action)) {
  fail(`${actionPath}: quick-fix must use allowed program/major catalog for the lead segment`);
}

if (!/\["ELIGIBLE", "ENROLLED"\]\.includes\(status\)[\s\S]*lead\.status !== status[\s\S]*addFieldError/.test(action)) {
  fail(`${actionPath}: quick-fix must not self-promote to ELIGIBLE/ENROLLED`);
}

if (!/status === "DOCUMENT_SUBMITTED"[\s\S]*from\("lead_documents"\)[\s\S]*shouldUpdateStatus = false/s.test(action)) {
  fail(`${actionPath}: quick-fix must not mark DOCUMENT_SUBMITTED when no document exists`);
}

if (!/activity_result:\s*"P2_05_TTGDTX_QUICK_FIX"/.test(action)) {
  fail(`${actionPath}: quick-fix must write an audit activity`);
}

if (!/revalidatePath\("\/ttgdtx\/gate"\)/.test(action) || !/revalidatePath\("\/ttgdtx\/receivables"\)/.test(action)) {
  fail(`${actionPath}: quick-fix must revalidate TTGDTX gate and receivable pages`);
}

if (!/TtgdtxLeadQuickFixForm/.test(page) || !/segmentMeta\?\.segment_code === "TC9_TTGDTX_LINKED"/.test(page)) {
  fail(`${pagePath}: quick-fix form must render only for TTGDTX linked leads`);
}

if (!/ttgdtx_center_dropdown_options/.test(page) || !/user_partner_scopes/.test(page)) {
  fail(`${pagePath}: quick-fix options must come from P2-12 dropdown and partner scope`);
}

if (!/updateTtgdtxLeadQuickFixAction/.test(component)) {
  fail(`${componentPath}: quick-fix form must post to the guarded server action`);
}

if (/\.delete\(/.test(`${action}\n${page}\n${component}`)) {
  fail("TTGDTX lead quick-fix files must not call hard delete");
}

if (failures.length > 0) {
  console.error("TTGDTX lead quick-fix safety audit failed.");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("TTGDTX lead quick-fix safety audit passed. Lead gate repair is scoped, permissioned and audited.");
