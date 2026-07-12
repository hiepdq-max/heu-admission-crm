import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const mode = process.argv[2] ?? "plan";
if (!new Set(["plan", "apply", "rollback"]).has(mode)) {
  console.error("NO_GO ACTOR-REPAIR-MODE: use plan, apply or rollback.");
  process.exitCode = 1;
}

const envPath = path.resolve(
  process.cwd(),
  process.env.HEU_ENV_FILE || ".env.local",
);
const snapshotPath = process.env.HEU_ACTOR_REPAIR_SNAPSHOT_PATH;
const evidenceId = process.env.HEU_ACTOR_REPAIR_EVIDENCE_ID;
const operatorUserId = process.env.HEU_ACTOR_REPAIR_OPERATOR_USER_ID;
const confirmation = process.env.HEU_ACTOR_REPAIR_CONFIRM;
const expectedCount = Number(process.env.HEU_ACTOR_REPAIR_EXPECTED_COUNT);

function parseEnv(filePath) {
  if (!existsSync(filePath)) return {};
  const env = {};
  for (const rawLine of readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const separator = line.indexOf("=");
    if (separator < 1) continue;
    env[line.slice(0, separator)] = line
      .slice(separator + 1)
      .trim()
      .replace(/^['"]|['"]$/g, "");
  }
  return env;
}

function fail(code) {
  console.error(`NO_GO ACTOR-REPAIR-${code}: no uncontrolled mutation allowed.`);
  process.exitCode = 1;
}

async function writeAudit(client, payload) {
  const { error } = await client.from("audit_logs").insert(payload);
  return !error;
}

async function restoreRows(client, snapshot, action) {
  let restored = 0;
  for (const row of snapshot.rows) {
    const { data, error } = await client
      .from("leads")
      .update({ assigned_to: row.previous_assigned_to })
      .eq("id", row.lead_id)
      .eq("assigned_to", snapshot.target_user_id)
      .select("id")
      .maybeSingle();
    if (error || !data) return { restored, ok: false };
    const audited = await writeAudit(client, {
      user_id: operatorUserId,
      action,
      entity_type: "leads",
      entity_id: row.lead_id,
      old_value: { assigned_to: snapshot.target_user_id },
      new_value: { assigned_to: row.previous_assigned_to },
      note: evidenceId,
    });
    if (!audited) return { restored, ok: false };
    restored += 1;
  }
  return { restored, ok: true };
}

if (process.exitCode !== 1) {
  const env = parseEnv(envPath);
  if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    fail("ENV");
  } else {
    const client = createClient(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { autoRefreshToken: false, persistSession: false } },
    );

    if (mode === "rollback") {
      if (
        confirmation !== "ROLLBACK_SCOPED_LEAD_ACTOR_REPAIR" ||
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
            "HEU_ADMISSION_ACTOR_REPAIR_ROLLBACK",
          );
          if (!result.ok || result.restored !== snapshot.rows.length) {
            fail("ROLLBACK-INCOMPLETE");
          } else {
            snapshot.rolled_back_at = new Date().toISOString();
            snapshot.rollback_operator_user_id = operatorUserId;
            writeFileSync(snapshotPath, `${JSON.stringify(snapshot, null, 2)}\n`);
            console.log(
              `PASS ACTOR-REPAIR-ROLLBACK: restored=${result.restored}; snapshot retained; production=NO_GO`,
            );
          }
        }
      }
    } else {
      const [positionsResult, assignmentsResult, profilesResult, scopesResult, leadsResult] =
        await Promise.all([
          client
            .from("heu_org_positions")
            .select("id")
            .eq("position_code", "TUYEN_SINH_HEAD")
            .eq("status", "ACTIVE")
            .maybeSingle(),
          client
            .from("heu_position_assignments")
            .select("position_id,user_id,assignment_status,status")
            .eq("status", "ACTIVE"),
          client.from("users_profile").select("id,status,role_id"),
          client
            .from("user_admission_segment_scopes")
            .select("user_id,segment_id,status")
            .eq("status", "ACTIVE"),
          client
            .from("leads")
            .select("id,assigned_to,created_by,admission_segment_id")
            .eq("is_deleted", false),
        ]);

      if (
        positionsResult.error ||
        assignmentsResult.error ||
        profilesResult.error ||
        scopesResult.error ||
        leadsResult.error
      ) {
        fail("READ");
      } else {
        const profiles = new Map(
          (profilesResult.data ?? []).map((profile) => [profile.id, profile]),
        );
        const position = positionsResult.data;
        const assignment = (assignmentsResult.data ?? []).find(
          (row) =>
            position &&
            row.position_id === position.id &&
            row.assignment_status === "ACTIVE_ASSIGNED",
        );
        const targetProfile = assignment
          ? profiles.get(assignment.user_id)
          : null;
        const targetScopes = new Set(
          (scopesResult.data ?? [])
            .filter((scope) => scope.user_id === assignment?.user_id)
            .map((scope) => scope.segment_id),
        );
        const eligibleRows = (leadsResult.data ?? []).filter((lead) => {
          const currentAssignee = lead.assigned_to
            ? profiles.get(lead.assigned_to)
            : null;
          return (
            lead.assigned_to &&
            currentAssignee?.status !== "ACTIVE" &&
            lead.admission_segment_id &&
            targetScopes.has(lead.admission_segment_id)
          );
        });

        console.log("HEU admission actor repair controlled apply");
        console.log(
          `mode=${mode}; eligible_rows=${eligibleRows.length}; target_profile_active=${
            targetProfile?.status === "ACTIVE"
          }; target_scopes=${targetScopes.size}; created_by_mutation=0; hard_delete=0`,
        );

        if (mode === "plan") {
          console.log(
            targetProfile?.status === "ACTIVE"
              ? "READY ACTOR-REPAIR-PLAN: apply still requires snapshot, operator, evidence and exact expected count."
              : "NO_GO ACTOR-REPAIR-PLAN: target owner is not ACTIVE; apply is blocked.",
          );
          if (targetProfile?.status !== "ACTIVE") process.exitCode = 1;
        } else if (
          confirmation !== "APPLY_SCOPED_LEAD_ACTOR_REPAIR" ||
          !snapshotPath ||
          existsSync(snapshotPath) ||
          !evidenceId?.startsWith("HEU-ADM-ACTOR-") ||
          !operatorUserId ||
          !Number.isInteger(expectedCount) ||
          expectedCount !== eligibleRows.length ||
          targetProfile?.status !== "ACTIVE" ||
          !assignment
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
              target_user_id: assignment.user_id,
              rows: eligibleRows.map((lead) => ({
                lead_id: lead.id,
                previous_assigned_to: lead.assigned_to,
              })),
            };
            writeFileSync(snapshotPath, `${JSON.stringify(snapshot, null, 2)}\n`, {
              flag: "wx",
            });

            const changed = [];
            let failed = false;
            for (const lead of eligibleRows) {
              const { data, error } = await client
                .from("leads")
                .update({ assigned_to: assignment.user_id })
                .eq("id", lead.id)
                .eq("assigned_to", lead.assigned_to)
                .select("id")
                .maybeSingle();
              if (error || !data) {
                failed = true;
                break;
              }
              changed.push(lead);
              const audited = await writeAudit(client, {
                user_id: operatorUserId,
                action: "HEU_ADMISSION_ACTOR_REASSIGNED",
                entity_type: "leads",
                entity_id: lead.id,
                old_value: { assigned_to: lead.assigned_to },
                new_value: { assigned_to: assignment.user_id },
                note: evidenceId,
              });
              if (!audited) {
                failed = true;
                break;
              }
            }

            if (failed) {
              const partialSnapshot = { ...snapshot, rows: changed.map((lead) => ({
                lead_id: lead.id,
                previous_assigned_to: lead.assigned_to,
              })) };
              await restoreRows(
                client,
                partialSnapshot,
                "HEU_ADMISSION_ACTOR_REPAIR_AUTO_ROLLBACK",
              );
              fail("APPLY-AUTO-ROLLED-BACK");
            } else {
              snapshot.applied_at = new Date().toISOString();
              snapshot.operator_user_id = operatorUserId;
              writeFileSync(snapshotPath, `${JSON.stringify(snapshot, null, 2)}\n`);
              console.log(
                `PASS ACTOR-REPAIR-APPLY: changed=${changed.length}; snapshot retained; created_by_mutation=0; production=NO_GO`,
              );
            }
          }
        }
      }
    }
  }
}
