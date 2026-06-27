import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const scanRoot = path.join(repoRoot, "app", "ttgdtx");
const step90Path = path.join(
  repoRoot,
  "database",
  "step90_ttgdtx_student_receivables.sql",
);
const step98Path = path.join(
  repoRoot,
  "database",
  "step98_ttgdtx_source_control_p2_11.sql",
);
const step99Path = path.join(
  repoRoot,
  "database",
  "step99_ttgdtx_master_dropdown_p2_12.sql",
);
const failures = [];

function fail(message) {
  failures.push(message);
}

function walk(currentPath, results = []) {
  const stats = statSync(currentPath);

  if (stats.isDirectory()) {
    for (const child of readdirSync(currentPath)) {
      walk(path.join(currentPath, child), results);
    }
    return results;
  }

  if (stats.isFile() && path.basename(currentPath) === "page.tsx") {
    results.push(currentPath);
  }

  return results;
}

function relativePath(filePath) {
  return path.relative(repoRoot, filePath).replaceAll(path.sep, "/");
}

const pageFiles = walk(scanRoot);

for (const filePath of pageFiles) {
  const relative = relativePath(filePath);
  const contents = readFileSync(filePath, "utf8");

  if (!/supabase\.auth\.getUser\s*\(/.test(contents)) {
    fail(`${relative}: missing Supabase auth.getUser() check`);
  }

  if (!/redirect\(\s*"\/login"\s*\)/.test(contents)) {
    fail(`${relative}: missing login redirect for unauthenticated users`);
  }

  if (!/current_user_role_code/.test(contents)) {
    fail(`${relative}: missing current_user_role_code() role check`);
  }

  if (!/has_permission/.test(contents)) {
    fail(`${relative}: missing has_permission() business permission check`);
  }

  if (!/user_admission_segment_scopes/.test(contents)) {
    fail(`${relative}: missing user_admission_segment_scopes workspace check`);
  }

  const lines = contents.split(/\r?\n/);
  for (const [index, line] of lines.entries()) {
    if (!/return\s+scopes\.some\(\(scope\)\s*=>\s*scope\.segment_id\s*===\s*segmentId\)/.test(line)) {
      continue;
    }

    const previousGuard = lines
      .slice(Math.max(0, index - 12), index + 1)
      .join("\n");

    if (!/!\s*has[A-Za-z0-9_]*|!\(\s*has[A-Za-z0-9_]*[\s\S]*&&\s*!has[A-Za-z0-9_]*/.test(previousGuard)) {
      fail(
        `${relative}:${index + 1}: scope-only access must also require a business permission`,
      );
    }
  }

  for (const match of contents.matchAll(
    /return\s+Boolean\(\s*([\s\S]*?scopes\.some\(\(scope\)\s*=>\s*scope\.segment_id\s*===\s*segmentId\)[\s\S]*?)\);/g,
  )) {
    if (!/has[A-Za-z0-9_]*|hasDashboardPermission/.test(match[1])) {
      fail(`${relative}: Boolean scope access must include a business permission`);
    }
  }
}

const step90Sql = readFileSync(step90Path, "utf8");
const step98Sql = readFileSync(step98Path, "utf8");
const step99Sql = readFileSync(step99Path, "utf8");

if (!/Migration candidate only\. Do not run production migration from Codex\/chat\./i.test(step90Sql)) {
  fail("database/step90_ttgdtx_student_receivables.sql: missing production migration boundary");
}

if (
  !/create or replace function public\.can_read_ttgdtx_receivable[\s\S]*\(\s*\(\s*public\.has_permission\('ttgdtx\.receivable\.read'\)[\s\S]*public\.has_permission\('ttgdtx\.receivable\.manage'\)[\s\S]*public\.has_permission\('ttgdtx\.receivable\.approve'\)[\s\S]*\)\s*and public\.can_access_business_scope/i.test(
    step90Sql,
  )
) {
  fail(
    "database/step90_ttgdtx_student_receivables.sql: P2-03 read access must require both receivable permission and business scope",
  );
}

if (/create policy "ttgdtx_receivables_manage"[\s\S]*for all/i.test(step90Sql)) {
  fail(
    'database/step90_ttgdtx_student_receivables.sql: P2-03 must not use a broad "for all" manage policy',
  );
}

if (/create policy "ttgdtx_receivables_[^"]+"[\s\S]*for delete/i.test(step90Sql)) {
  fail(
    "database/step90_ttgdtx_student_receivables.sql: P2-03 must not expose direct delete policy",
  );
}

if (
  !/create policy "ttgdtx_receivables_insert"[\s\S]*for insert[\s\S]*public\.can_manage_ttgdtx_receivable\(\)[\s\S]*public\.can_access_business_scope\(admission_segment_id, partner_id\)/i.test(
    step90Sql,
  )
) {
  fail(
    "database/step90_ttgdtx_student_receivables.sql: P2-03 insert policy must require manage permission and business scope",
  );
}

if (
  !/create policy "ttgdtx_receivables_update"[\s\S]*for update[\s\S]*public\.can_manage_ttgdtx_receivable\(\)[\s\S]*public\.can_access_business_scope\(admission_segment_id, partner_id\)/i.test(
    step90Sql,
  )
) {
  fail(
    "database/step90_ttgdtx_student_receivables.sql: P2-03 update policy must require manage permission and business scope",
  );
}

if (!/Migration candidate only\. Do not run production migration from Codex\/chat\./i.test(step98Sql)) {
  fail("database/step98_ttgdtx_source_control_p2_11.sql: missing production migration boundary");
}

if (/on delete set null/i.test(step98Sql)) {
  fail(
    "database/step98_ttgdtx_source_control_p2_11.sql: source evidence links must not be nulled on delete",
  );
}

if (
  !/create or replace function public\.can_read_ttgdtx_source_control[\s\S]*\(\s*\(\s*public\.has_permission\('ttgdtx\.source\.read'\)[\s\S]*public\.has_permission\('ttgdtx\.source\.manage'\)[\s\S]*public\.has_permission\('ttgdtx\.source\.approve'\)[\s\S]*\)\s*and public\.can_access_business_scope\(target_segment_id, null::uuid\)/i.test(
    step98Sql,
  )
) {
  fail(
    "database/step98_ttgdtx_source_control_p2_11.sql: P2-11 read access must require both source permission and business scope",
  );
}

if (/create policy "ttgdtx_source_(?:documents|checks)_manage"[\s\S]*for all/i.test(step98Sql)) {
  fail(
    'database/step98_ttgdtx_source_control_p2_11.sql: P2-11 must not use a broad "for all" manage policy',
  );
}

if (/create policy "ttgdtx_source_(?:documents|checks)_[^"]+"[\s\S]*for delete/i.test(step98Sql)) {
  fail(
    "database/step98_ttgdtx_source_control_p2_11.sql: P2-11 must not expose direct delete policy",
  );
}

if (
  !/create policy "ttgdtx_source_documents_insert"[\s\S]*for insert[\s\S]*public\.can_manage_ttgdtx_source_control\(\)[\s\S]*public\.can_access_business_scope\(admission_segment_id, null::uuid\)/i.test(
    step98Sql,
  )
) {
  fail(
    "database/step98_ttgdtx_source_control_p2_11.sql: source document insert policy must require manage permission and business scope",
  );
}

if (
  !/create policy "ttgdtx_source_documents_update"[\s\S]*for update[\s\S]*public\.can_manage_ttgdtx_source_control\(\)[\s\S]*public\.can_access_business_scope\(admission_segment_id, null::uuid\)/i.test(
    step98Sql,
  )
) {
  fail(
    "database/step98_ttgdtx_source_control_p2_11.sql: source document update policy must require manage permission and business scope",
  );
}

if (
  !/create policy "ttgdtx_source_checks_insert"[\s\S]*for insert[\s\S]*public\.can_manage_ttgdtx_source_control\(\)[\s\S]*public\.can_access_business_scope\(admission_segment_id, null::uuid\)/i.test(
    step98Sql,
  )
) {
  fail(
    "database/step98_ttgdtx_source_control_p2_11.sql: source check insert policy must require manage permission and business scope",
  );
}

if (
  !/create policy "ttgdtx_source_checks_update"[\s\S]*for update[\s\S]*public\.can_manage_ttgdtx_source_control\(\)[\s\S]*public\.can_access_business_scope\(admission_segment_id, null::uuid\)/i.test(
    step98Sql,
  )
) {
  fail(
    "database/step98_ttgdtx_source_control_p2_11.sql: source check update policy must require manage permission and business scope",
  );
}

if (!/Migration candidate only\. Do not run production migration from Codex\/chat\./i.test(step99Sql)) {
  fail("database/step99_ttgdtx_master_dropdown_p2_12.sql: missing production migration boundary");
}

if (/on delete set null/i.test(step99Sql)) {
  fail(
    "database/step99_ttgdtx_master_dropdown_p2_12.sql: master source evidence links must not be nulled on delete",
  );
}

if (
  !/create or replace function public\.can_read_ttgdtx_master[\s\S]*\(\s*\(\s*public\.has_permission\('ttgdtx\.master\.read'\)[\s\S]*public\.has_permission\('ttgdtx\.master\.manage'\)[\s\S]*public\.has_permission\('ttgdtx\.master\.approve'\)[\s\S]*\)\s*and public\.can_access_business_scope\(target_segment_id, target_partner_id\)/i.test(
    step99Sql,
  )
) {
  fail(
    "database/step99_ttgdtx_master_dropdown_p2_12.sql: P2-12 read access must require both master permission and business scope",
  );
}

if (/create policy "ttgdtx_center_master_manage"[\s\S]*for all/i.test(step99Sql)) {
  fail(
    'database/step99_ttgdtx_master_dropdown_p2_12.sql: P2-12 must not use a broad "for all" manage policy',
  );
}

if (/create policy "ttgdtx_center_master_[^"]+"[\s\S]*for delete/i.test(step99Sql)) {
  fail(
    "database/step99_ttgdtx_master_dropdown_p2_12.sql: P2-12 must not expose direct delete policy",
  );
}

if (
  !/create policy "ttgdtx_center_master_insert"[\s\S]*for insert[\s\S]*public\.can_manage_ttgdtx_master\(\)[\s\S]*public\.can_access_business_scope\(admission_segment_id, partner_id\)/i.test(
    step99Sql,
  )
) {
  fail(
    "database/step99_ttgdtx_master_dropdown_p2_12.sql: center master insert policy must require manage permission and business scope",
  );
}

if (
  !/create policy "ttgdtx_center_master_update"[\s\S]*for update[\s\S]*public\.can_manage_ttgdtx_master\(\)[\s\S]*public\.can_access_business_scope\(admission_segment_id, partner_id\)/i.test(
    step99Sql,
  )
) {
  fail(
    "database/step99_ttgdtx_master_dropdown_p2_12.sql: center master update policy must require manage permission and business scope",
  );
}

if (failures.length > 0) {
  console.error("TTGDTX role-scope access audit failed.");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(
  `TTGDTX role-scope access audit passed. Checked ${pageFiles.length} TTGDTX pages.`,
);
