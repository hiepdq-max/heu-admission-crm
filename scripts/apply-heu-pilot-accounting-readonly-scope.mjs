import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { createClient } from "@supabase/supabase-js";

const mode = process.argv[2] ?? "plan";
const allowedModes = new Set(["plan", "apply", "rollback"]);
const expectedAccounts = new Map([
  ["khtc-quan-ly", "PILOT_ACCOUNTING_LEAD_READONLY"],
  ["khtc-thu-chi", "PILOT_ACCOUNTING_READONLY"],
  ["khtc-ngan-hang", "PILOT_ACCOUNTING_READONLY"],
]);
const targetCodes = new Set(
  (process.env.HEU_ACCOUNTING_SCOPE_TARGETS || [...expectedAccounts.keys()].join(","))
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean),
);
const envPath = path.resolve(
  process.cwd(),
  process.env.HEU_ENV_FILE || ".env.local",
);
const snapshotPath = process.env.HEU_ACCOUNTING_SCOPE_SNAPSHOT_PATH;
const evidenceId = process.env.HEU_ACCOUNTING_SCOPE_EVIDENCE_ID;
const operatorUserId = process.env.HEU_ACCOUNTING_SCOPE_OPERATOR_USER_ID;
const confirmation = process.env.HEU_ACCOUNTING_SCOPE_CONFIRM;
const expectedCount = Number(process.env.HEU_ACCOUNTING_SCOPE_EXPECTED_COUNT);

function parseEnv(filePath) {
  if (!existsSync(filePath)) return {};
  return Object.fromEntries(
    readFileSync(filePath, "utf8")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#") && line.includes("="))
      .map((line) => {
        const separator = line.indexOf("=");
        return [
          line.slice(0, separator).trim(),
          line.slice(separator + 1).trim().replace(/^["']|["']$/g, ""),
        ];
      }),
  );
}

function fail(code) {
  console.error(
    `NO_GO ACCOUNTING-SCOPE-${code}: no uncontrolled scope mutation allowed.`,
  );
  process.exitCode = 1;
}

async function writeAudit(client, payload) {
  const { error } = await client.from("audit_logs").insert(payload);
  return !error;
}

async function restoreRows(client, snapshot, action) {
  let restored = 0;
  for (const row of snapshot.rows) {
    const restoredValues = row.existed
      ? {
          status: row.previous_status,
          assigned_by: row.previous_assigned_by,
          note: row.previous_note,
        }
      : {
          status: "INACTIVE",
          assigned_by: operatorUserId,
          note: `${evidenceId}:ROLLBACK`,
        };
    const { data, error } = await client
      .from("user_admission_segment_scopes")
      .update(restoredValues)
      .eq("user_id", row.user_id)
      .eq("segment_id", snapshot.segment_id)
      .eq("status", "ACTIVE")
      .select("id")
      .maybeSingle();
    if (error || !data) return { ok: false, restored };
    const audited = await writeAudit(client, {
      user_id: operatorUserId,
      action,
      entity_type: "user_admission_segment_scopes",
      entity_id: data.id,
      old_value: { status: "ACTIVE", segment_code: snapshot.segment_code },
      new_value: { status: restoredValues.status },
      note: evidenceId,
    });
    if (!audited) return { ok: false, restored };
    restored += 1;
  }
  return { ok: restored === snapshot.rows.length, restored };
}

if (!allowedModes.has(mode)) {
  fail("MODE");
} else if (
  targetCodes.size === 0 ||
  [...targetCodes].some((code) => !expectedAccounts.has(code))
) {
  fail("TARGETS");
} else {
  const env = parseEnv(envPath);
  if (
    !env.NEXT_PUBLIC_SUPABASE_URL ||
    !env.SUPABASE_SERVICE_ROLE_KEY ||
    !env.NEXT_PUBLIC_HEU_PILOT_ACCOUNT_DIRECTORY_JSON
  ) {
    fail("ENV");
  } else {
    let directory;
    try {
      directory = JSON.parse(env.NEXT_PUBLIC_HEU_PILOT_ACCOUNT_DIRECTORY_JSON);
    } catch {
      directory = null;
    }
    if (!Array.isArray(directory)) {
      fail("DIRECTORY");
    } else {
      const directoryByCode = new Map(
        directory.map((row) => [String(row?.id ?? ""), String(row?.email ?? "").toLowerCase()]),
      );
      const targetEmails = [...targetCodes].map((code) => directoryByCode.get(code));
      if (targetEmails.some((email) => !email?.includes("@"))) {
        fail("DIRECTORY-TARGET");
      } else {
        const client = createClient(
          env.NEXT_PUBLIC_SUPABASE_URL,
          env.SUPABASE_SERVICE_ROLE_KEY,
          { auth: { autoRefreshToken: false, persistSession: false } },
        );

        if (mode === "rollback") {
          if (
            confirmation !== "ROLLBACK_ACCOUNTING_READONLY_SEGMENT_SCOPE" ||
            !snapshotPath ||
            !existsSync(snapshotPath) ||
            !evidenceId ||
            !operatorUserId
          ) {
            fail("ROLLBACK-GATE");
          } else {
            const snapshot = JSON.parse(readFileSync(snapshotPath, "utf8"));
            if (snapshot.rolled_back_at) {
              fail("ALREADY-ROLLED-BACK");
            } else {
              const result = await restoreRows(
                client,
                snapshot,
                "HEU_ACCOUNTING_READONLY_SCOPE_ROLLBACK",
              );
              if (!result.ok) {
                fail("ROLLBACK-INCOMPLETE");
              } else {
                snapshot.rolled_back_at = new Date().toISOString();
                snapshot.rollback_operator_user_id = operatorUserId;
                writeFileSync(snapshotPath, `${JSON.stringify(snapshot, null, 2)}\n`);
                console.log(
                  `PASS ACCOUNTING-SCOPE-ROLLBACK: restored=${result.restored}; hard_delete=0; production=NO_GO`,
                );
              }
            }
          }
        } else {
          const [segmentResult, profilesResult, rolesResult, departmentsResult] =
            await Promise.all([
              client
                .from("admission_segments")
                .select("id,segment_code,status")
                .eq("segment_code", "TC9_TTGDTX_LINKED")
                .eq("status", "ACTIVE")
                .maybeSingle(),
              client
                .from("users_profile")
                .select("id,email,status,role_id,department_id")
                .in("email", targetEmails),
              client.from("roles").select("id,code"),
              client
                .from("admission_departments")
                .select("id,code")
                .eq("code", "ACCOUNTING")
                .maybeSingle(),
            ]);
          if (
            segmentResult.error ||
            profilesResult.error ||
            rolesResult.error ||
            departmentsResult.error ||
            !segmentResult.data ||
            !departmentsResult.data
          ) {
            fail("READ");
          } else {
            const rolesById = new Map(
              (rolesResult.data ?? []).map((row) => [row.id, row.code]),
            );
            const profilesByEmail = new Map(
              (profilesResult.data ?? []).map((row) => [row.email.toLowerCase(), row]),
            );
            const targets = [...targetCodes].map((accountCode) => ({
              accountCode,
              profile: profilesByEmail.get(directoryByCode.get(accountCode)),
              expectedRole: expectedAccounts.get(accountCode),
            }));
            const invalidTargets = targets.filter(
              ({ profile, expectedRole }) =>
                !profile ||
                profile.status !== "ACTIVE" ||
                profile.department_id !== departmentsResult.data.id ||
                rolesById.get(profile.role_id) !== expectedRole,
            );
            const profileIds = targets.map(({ profile }) => profile?.id).filter(Boolean);
            const { data: existingRows, error: existingError } = await client
              .from("user_admission_segment_scopes")
              .select("id,user_id,segment_id,status,assigned_by,note")
              .in("user_id", profileIds)
              .eq("segment_id", segmentResult.data.id);
            if (existingError) {
              fail("SCOPE-READ");
            } else {
              const existingByUser = new Map(
                (existingRows ?? []).map((row) => [row.user_id, row]),
              );
              const changes = targets.filter(
                ({ profile }) => existingByUser.get(profile.id)?.status !== "ACTIVE",
              );
              console.log("HEU pilot accounting read-only segment scope");
              console.log(
                `mode=${mode}; targets=${targets.length}; active_valid_targets=${targets.length - invalidTargets.length}; changes=${changes.length}; segment=TC9_TTGDTX_LINKED; permission_mutation=0; lead_visibility_mutation=0; finance_mutation=0; hard_delete=0`,
              );

              if (mode === "plan") {
                if (invalidTargets.length > 0) {
                  fail("TARGET-NOT-ACTIVE-OR-MISALIGNED");
                } else {
                  console.log(
                    "READY ACCOUNTING-SCOPE-PLAN: apply still requires snapshot, operator, evidence and exact expected count.",
                  );
                }
              } else if (
                invalidTargets.length > 0 ||
                confirmation !== "APPLY_ACCOUNTING_READONLY_SEGMENT_SCOPE" ||
                !snapshotPath ||
                existsSync(snapshotPath) ||
                !evidenceId?.startsWith("HEU-ACCT-SCOPE-") ||
                !operatorUserId ||
                !Number.isInteger(expectedCount) ||
                expectedCount !== changes.length
              ) {
                fail("APPLY-GATE");
              } else {
                const { data: operator } = await client
                  .from("users_profile")
                  .select("id,status,roles(code)")
                  .eq("id", operatorUserId)
                  .maybeSingle();
                if (
                  operator?.status !== "ACTIVE" ||
                  !["ADMIN", "IT_DATA", "AUDIT", "IT_DATA_HEAD"].includes(
                    operator.roles?.code,
                  )
                ) {
                  fail("OPERATOR");
                } else {
                  const snapshot = {
                    evidence_id: evidenceId,
                    created_at: new Date().toISOString(),
                    segment_id: segmentResult.data.id,
                    segment_code: "TC9_TTGDTX_LINKED",
                    rows: changes.map(({ profile }) => {
                      const previous = existingByUser.get(profile.id);
                      return {
                        user_id: profile.id,
                        existed: Boolean(previous),
                        previous_status: previous?.status ?? null,
                        previous_assigned_by: previous?.assigned_by ?? null,
                        previous_note: previous?.note ?? null,
                      };
                    }),
                  };
                  writeFileSync(
                    snapshotPath,
                    `${JSON.stringify(snapshot, null, 2)}\n`,
                    { flag: "wx" },
                  );

                  let changed = 0;
                  let failed = false;
                  for (const { profile } of changes) {
                    const { data, error } = await client
                      .from("user_admission_segment_scopes")
                      .upsert(
                        {
                          user_id: profile.id,
                          segment_id: segmentResult.data.id,
                          status: "ACTIVE",
                          assigned_by: operatorUserId,
                          note: evidenceId,
                        },
                        { onConflict: "user_id,segment_id" },
                      )
                      .select("id")
                      .maybeSingle();
                    if (error || !data) {
                      failed = true;
                      break;
                    }
                    changed += 1;
                    const audited = await writeAudit(client, {
                      user_id: operatorUserId,
                      action: "HEU_ACCOUNTING_READONLY_SCOPE_ASSIGNED",
                      entity_type: "user_admission_segment_scopes",
                      entity_id: data.id,
                      old_value: { status: existingByUser.get(profile.id)?.status ?? null },
                      new_value: {
                        status: "ACTIVE",
                        segment_code: "TC9_TTGDTX_LINKED",
                      },
                      note: evidenceId,
                    });
                    if (!audited) {
                      failed = true;
                      break;
                    }
                  }

                  if (failed) {
                    await restoreRows(
                      client,
                      { ...snapshot, rows: snapshot.rows.slice(0, changed) },
                      "HEU_ACCOUNTING_READONLY_SCOPE_AUTO_ROLLBACK",
                    );
                    fail("APPLY-AUTO-ROLLED-BACK");
                  } else {
                    snapshot.applied_at = new Date().toISOString();
                    snapshot.operator_user_id = operatorUserId;
                    writeFileSync(
                      snapshotPath,
                      `${JSON.stringify(snapshot, null, 2)}\n`,
                    );
                    console.log(
                      `PASS ACCOUNTING-SCOPE-APPLY: changed=${changed}; permission_mutation=0; lead_visibility_mutation=0; finance_mutation=0; production=NO_GO`,
                    );
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
